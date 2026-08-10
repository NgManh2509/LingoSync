# LingoSync Backend — Implementation Plan (Revised)

## Hiện trạng đã có

| Module | Endpoints đã có |
|--------|----------------|
| Auth | `GET /api/auth/me` |
| Video | `POST /api/videos/process` |
| Vocabulary | `POST /api/vocabulary/save`, `GET /api/vocabulary/my-list` |
| Deck & Flashcard | Full CRUD + SM-2 Review |

**Entities đã có sẵn trong DB nhưng chưa có API:**
`Subtitles`, `VideoHistory`, `StudyLog`, `Playlist`, `PlaylistVideo`, `Achievements`, `UserAchievement`

**Fields gamification đã có trong `Users`:** `xpPoints`, `streakCount`, `lastActivityDate`

---

## Phase 1 — Video Player & Subtitle APIs *(Ưu tiên cao nhất)*

> **Lý do:** Đây là core của tính năng Listening. Frontend cần `script_url` để render subtitle panel, và `VideoHistory` để lưu vị trí xem.

### Kiến trúc Subtitle đã chốt

```
[processVideo()] → Worker trả JSON → Upload lên Cloud Storage → lưu URL vào videos.script_url
         ↓
Frontend gọi GET /api/videos/{id} → nhận script_url
         ↓
Frontend tự fetch JSON từ cloud → render subtitle panel (không cần endpoint /subtitles)
         ↓
User click từ để lưu → POST /api/vocabulary/save { word, subtitleOriginalText, startTime, sequenceOrder, videoId }
         ↓
VocabularyService upsert vào bảng Subtitles → Vocabulary.subtitle_id = subtitle.id
```

> ✅ **`VocabularyService.saveVocabulary()` đã implement đúng pattern này rồi** — tự động upsert subtitle khi lưu từ dựa theo `videoId + sequenceOrder`.

---

### 1. `GET /api/videos/{videoId}`

**Entity:** `Videos`  
**Mục đích:** Lấy metadata video + `script_url` để frontend fetch subtitle JSON từ cloud.

```json
// Response
{
  "id": "uuid",
  "youtubeId": "dQw4w9WgXcQ",
  "title": "English Lesson Today",
  "thumbnailUrl": "https://...",
  "durationSeconds": 480,
  "scriptUrl": "https://cloud-storage.../subtitles/abc.json",
  "status": "READY",
  "createdAt": "2026-08-09T10:00:00Z"
}
```

> ⚠️ **`processVideo()` hiện chưa lưu `script_url`** — cần bổ sung bước upload JSON lên cloud và `savedVideo.setScriptUrl(cloudUrl)` trước khi save.

---

### 2. `POST /api/videos/{videoId}/history`

**Entity:** `VideoHistory`, `StudyLog`  
**Mục đích:** Cập nhật vị trí dừng xem, tích lũy `studyMinutes` vào StudyLog.

```json
// Request
{ "lastPositionSeconds": 145, "watchedSeconds": 30 }

// Response
{ "videoId": "uuid", "lastPositionSeconds": 145, "watchCount": 3 }
```

> ⚠️ **Logic upsert quan trọng:**
> - `VideoHistory`: nếu đã có (user+video) → UPDATE `lastPositionSeconds` + tăng `watchCount`. Nếu chưa → INSERT.
> - `StudyLog`: nếu đã có bản ghi ngày hôm nay → cộng dồn `studyMinutes += watchedSeconds/60`. Nếu chưa → INSERT mới.

---

### 3. `GET /api/videos/history`

**Entity:** `VideoHistory` JOIN `Videos`  
**Mục đích:** Danh sách video đã xem gần đây (màn hình "Xem lại video đã học").

```json
// Response: List<VideoHistoryDetailResponse>
[
  {
    "videoId": "uuid",
    "youtubeId": "dQw4w9WgXcQ",
    "title": "English Lesson Today",
    "thumbnailUrl": "https://...",
    "lastPositionSeconds": 145,
    "watchCount": 3,
    "watchedAt": "2026-08-09T10:00:00Z"
  }
]
```

> **Repositories cần tạo:** `VideoHistoryRepository`, `StudyLogRepository`

---

## Phase 2 — Playlist CRUD *(Entity sẵn, code nhanh)*

> **Lý do:** `Playlist` và `PlaylistVideo` entity đã đầy đủ, không cần logic phức tạp. CRUD thuần, triển khai nhanh để unlock tính năng "Phân loại video, lập playlist".

---

### Entities liên quan:
- `Playlist` (id, user_id, name, description, created_at)
- `PlaylistVideo` (playlist_id, video_id, position, added_at) — composite key

### Endpoints cần tạo:

| Method | Path | Mô tả |
|--------|------|-------|
| `GET` | `/api/playlists` | Danh sách playlist của user (kèm `videoCount`) |
| `POST` | `/api/playlists` | Tạo playlist mới |
| `GET` | `/api/playlists/{id}` | Chi tiết playlist + danh sách video bên trong |
| `PUT` | `/api/playlists/{id}` | Sửa tên/mô tả |
| `DELETE` | `/api/playlists/{id}` | Xóa playlist |
| `POST` | `/api/playlists/{id}/videos/{videoId}` | Thêm video vào playlist |
| `DELETE` | `/api/playlists/{id}/videos/{videoId}` | Xóa video khỏi playlist |

> ⚠️ **`position`** trong `PlaylistVideo`: khi thêm video mới, tự động gán `position = MAX(position) + 1` trong playlist đó.

---

## Phase 3 — Gamification & Dashboard *(Phụ thuộc Phase 1)*

> **Lý do:** `Users.xpPoints`, `Users.streakCount`, `Users.lastActivityDate` đã có sẵn. `StudyLog` đã được ghi từ Phase 1. Phase này chỉ cần đọc và tổng hợp data — không cần ghi thêm bảng mới.

---

### 3a. Gamification APIs

#### `GET /api/users/profile` *(mở rộng từ `/api/auth/me`)*

**Entity:** `Users`  
**Mục đích:** Trả về thông tin gamification đầy đủ (XP, level, streak).

```json
{
  "id": "uuid",
  "username": "manh",
  "avatarUrl": "...",
  "xpPoints": 1250,
  "level": 4,
  "nextLevelXp": 1500,
  "streakCount": 7,
  "lastActivityDate": "2026-08-09",
  "isStudiedToday": true
}
```

> **Logic tính Level:** `level = xpPoints / 300 + 1` (hoặc bảng threshold tuỳ bạn). Tính trên service, không lưu DB.

---

#### `GET /api/users/achievements`

**Entity:** `Achievements` LEFT JOIN `UserAchievement` (theo user hiện tại)  
**Mục đích:** Toàn bộ thành tựu + trạng thái đã đạt chưa + tiến độ hiện tại.

```json
[
  {
    "id": "uuid",
    "name": "Người chăm chỉ",
    "description": "Duy trì streak 7 ngày",
    "icon": "🔥",
    "requirementType": "STREAK_DAYS",
    "requirementValue": 7,
    "isUnlocked": true,
    "unlockedAt": "2026-08-08T10:00:00Z",
    "currentProgress": 7
  }
]
```

> ⚠️ **`currentProgress`** tính theo `requirementType`:
> - `STREAK_DAYS` → `user.streakCount`
> - `WORDS_LEARNED` → `SUM(study_logs.words_learned)`
> - `VIDEOS_WATCHED` → `SUM(study_logs.videos_watched)`

---

### 3b. Dashboard APIs

#### `GET /api/dashboard/stats`

**Entity:** `StudyLog`, `Users`, `Vocabulary`, `Flashcard`  
**Mục đích:** KPI cards trên trang Dashboard.

```json
{
  "totalWordsLearned": 142,
  "totalWordsReviewed": 380,
  "totalVideosWatched": 15,
  "totalStudyMinutes": 420,
  "currentStreak": 7
}
```

---

#### `GET /api/dashboard/study-logs?range=week`

**Entity:** `StudyLog`  
**Mục đích:** Chuỗi dữ liệu theo ngày để render biểu đồ Line/Bar chart.  
**Query params:** `range=week` | `range=month` | `from=2026-08-01&to=2026-08-08`

```json
[
  { "date": "2026-08-08", "wordsLearned": 12, "wordsReviewed": 25, "videosWatched": 2, "studyMinutes": 45 },
  { "date": "2026-08-09", "wordsLearned": 8,  "wordsReviewed": 15, "videosWatched": 1, "studyMinutes": 30 }
]
```

> ⚠️ **Trả về ngày không có dữ liệu với giá trị 0** (tránh frontend bị lỗ trống trong biểu đồ). Generate toàn bộ ngày trong range rồi LEFT JOIN với StudyLog.

---

## Phase 4 — Fill-in-the-blank Exercises *(Phức tạp nhất, làm sau cùng)*

> **Lý do:** Phụ thuộc vào Phase 1 (cần Subtitles) và Phase 3 (cần cộng XP khi submit). Không có entity riêng — exercise là **stateless** (sinh ngẫu nhiên mỗi lần, không lưu DB).

---

### `GET /api/exercises/fill-in-the-blank?videoId={id}&count=5`

**Entity:** `Subtitles` (nguồn câu hỏi), `Vocabulary` (từ user đã lưu, ưu tiên đục lỗ)  
**Logic:**
1. Lấy ngẫu nhiên `count` câu từ `Subtitles` của video
2. Với mỗi câu, chọn 1 từ để đục lỗ (ưu tiên từ user đã lưu trong vocabulary)
3. Sinh 3 từ sai (distractors) — random từ vocabulary pool hoặc từ cùng part of speech

```json
// Response (stateless — không lưu DB)
{
  "questions": [
    {
      "questionId": "q-uuid-1",
      "subtitleId": "subtitle-uuid",
      "audioTimestamp": 12.5,
      "sentenceWithBlank": "Welcome ___ to our English lesson.",
      "options": ["back", "book", "bake", "bark"],
      "hint": "Phó từ: quay lại / trở lại"
    }
  ]
}
```

---

### `POST /api/exercises/submit`

**Entity:** `Users` (cộng XP), `StudyLog` (cộng `wordsReviewed`), `UserAchievement` (kiểm tra mở khóa)  
**Logic:**
1. Tính XP dựa trên `correctAnswers / totalQuestions * baseXp`
2. Cộng XP vào `Users.xpPoints`
3. Cập nhật streak nếu hôm nay chưa học
4. Upsert `StudyLog` cộng `wordsReviewed`
5. Kiểm tra và mở khóa achievement nếu đủ điều kiện

```json
// Request
{
  "videoId": "uuid",
  "totalQuestions": 5,
  "correctAnswers": 4,
  "timeSpentSeconds": 120
}

// Response
{
  "earnedXp": 40,
  "totalXp": 1290,
  "currentStreak": 8,
  "newAchievementsUnlocked": [
    { "name": "Người chăm chỉ", "icon": "🔥" }
  ]
}
```

---

## Roadmap tổng hợp

```
Phase 1 (Video & Subtitle)    → Không có dependency, bắt đầu ngay
    ↓
Phase 2 (Playlist)            → Song song với Phase 1 được (độc lập)
    ↓
Phase 3 (Gamification +       → Cần Phase 1 xong để có StudyLog data
         Dashboard)
    ↓
Phase 4 (Exercises)           → Cần Phase 1 (Subtitles) + Phase 3 (XP logic)
```

| Phase | Endpoint mới | Độ phức tạp | Entity cần tạo repository |
|-------|-------------|------------|--------------------------|
| 1 | 4 endpoints | Trung bình | `SubtitleRepository`, `VideoHistoryRepository`, `StudyLogRepository` |
| 2 | 7 endpoints | Thấp | `PlaylistRepository`, `PlaylistVideoRepository` |
| 3 | 4 endpoints | Thấp | *(dùng lại repo từ Phase 1 + 2)* |
| 4 | 2 endpoints | Cao | *(không thêm entity mới)* |
