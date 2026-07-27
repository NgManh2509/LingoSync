# LingoSync — Database Schema

## Quan hệ tổng quan

```
users
  ├── videos ──────────────── subtitles
  │     └── video_history     └── vocabulary → flashcards → decks
  ├── playlists → playlist_videos → videos
  ├── study_logs
  └── user_achievements → achievements
```

---

## 1. `users`
> Tài khoản người dùng, thông tin gamification

| Column | Type | Ghi chú |
|---|---|---|
| `id` | BIGINT / UUID | PK |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL |
| `username` | VARCHAR(100) | UNIQUE, NOT NULL |
| `password_hash` | VARCHAR(255) | NOT NULL |
| `avatar_url` | TEXT | Nullable |
| `xp_points` | INT | Default 0 |
| `streak_count` | INT | Default 0 |
| `last_activity_date` | DATE | Nullable |
| `created_at` | TIMESTAMP | Default NOW() |
| `updated_at` | TIMESTAMP | Default NOW() |

---

## 2. `videos`
> Video YouTube user đã thêm vào

| Column | Type | Ghi chú |
|---|---|---|
| `id` | BIGINT | PK |
| `user_id` | BIGINT | FK → users |
| `youtube_id` | VARCHAR(20) | ID trích từ URL (vd: `dQw4w9WgXcQ`) |
| `title` | TEXT | |
| `thumbnail_url` | TEXT | |
| `duration_seconds` | INT | |
| `original_language` | VARCHAR(10) | vd: `en`, `ja` |
| `target_language` | VARCHAR(10) | Ngôn ngữ dịch sang |
| `script_url` | TEXT | URL file JSON phụ đề đã dịch (toàn bộ) |
| `status` | ENUM | `PENDING / PROCESSING / READY / FAILED` |
| `created_at` | TIMESTAMP | Default NOW() |

---

## 3. `subtitles`
> Các câu user đã tương tác (click vào từ, lưu từ)

| Column | Type | Ghi chú |
|---|---|---|
| `id` | BIGINT | PK |
| `video_id` | BIGINT | FK → videos |
| `start_time` | FLOAT | Giây bắt đầu |
| `end_time` | FLOAT | Giây kết thúc |
| `original_text` | TEXT | Câu gốc |
| `translated_text` | TEXT | Câu đã dịch |
| `sequence_order` | INT | Thứ tự trong video |

---

## 4. `video_history`
> Lịch sử xem video của user

| Column | Type | Ghi chú |
|---|---|---|
| `id` | BIGINT | PK |
| `user_id` | BIGINT | FK → users |
| `video_id` | BIGINT | FK → videos |
| `watched_at` | TIMESTAMP | Lần xem gần nhất |
| `last_position_seconds` | INT | Vị trí dừng (để resume) |
| `watch_count` | INT | Số lần đã xem |

---

## 5. `vocabulary`
> Từ vựng user đã lưu, gắn với câu gốc trong video

| Column | Type | Ghi chú |
|---|---|---|
| `id` | BIGINT | PK |
| `user_id` | BIGINT | FK → users |
| `subtitle_id` | BIGINT | FK → subtitles (câu chứa từ này) |
| `video_id` | BIGINT | FK → videos |
| `word` | VARCHAR(255) | Từ gốc |
| `phonetic` | VARCHAR(255) | Phiên âm |
| `definition` | TEXT | Nghĩa |
| `part_of_speech` | VARCHAR(50) | Loại từ (noun, verb, ...) |
| `source_language` | VARCHAR(10) | |
| `target_language` | VARCHAR(10) | |
| `created_at` | TIMESTAMP | Default NOW() |

---

## 6. `decks`
> Bộ flashcard do user tạo

| Column | Type | Ghi chú |
|---|---|---|
| `id` | BIGINT | PK |
| `user_id` | BIGINT | FK → users |
| `name` | VARCHAR(255) | |
| `description` | TEXT | Nullable |
| `created_at` | TIMESTAMP | Default NOW() |

---

## 7. `flashcards`
> Từng thẻ flashcard, chứa dữ liệu Spaced Repetition (SM-2)

| Column | Type | Ghi chú |
|---|---|---|
| `id` | BIGINT | PK |
| `deck_id` | BIGINT | FK → decks |
| `vocabulary_id` | BIGINT | FK → vocabulary |
| `status` | ENUM | `NEW / LEARNING / REVIEW` |
| `next_review_date` | DATE | Ngày ôn tiếp theo |
| `interval_days` | INT | Khoảng cách ôn (ngày) |
| `ease_factor` | FLOAT | Hệ số dễ/khó (SM-2, default 2.5) |
| `repetitions` | INT | Số lần đã ôn thành công liên tiếp |
| `last_reviewed_at` | TIMESTAMP | Nullable |

---

## 8. `playlists`
> Danh sách phát video do user tạo

| Column | Type | Ghi chú |
|---|---|---|
| `id` | BIGINT | PK |
| `user_id` | BIGINT | FK → users |
| `name` | VARCHAR(255) | |
| `description` | TEXT | Nullable |
| `created_at` | TIMESTAMP | Default NOW() |

---

## 9. `playlist_videos`
> Bảng trung gian playlist ↔ videos (N-N)

| Column | Type | Ghi chú |
|---|---|---|
| `playlist_id` | BIGINT | FK → playlists |
| `video_id` | BIGINT | FK → videos |
| `position` | INT | Thứ tự trong playlist |
| `added_at` | TIMESTAMP | Default NOW() |
| PK | | (`playlist_id`, `video_id`) |

---

## 10. `study_logs`
> Thống kê học tập theo ngày (cho Dashboard & biểu đồ)

| Column | Type | Ghi chú |
|---|---|---|
| `id` | BIGINT | PK |
| `user_id` | BIGINT | FK → users |
| `date` | DATE | Ngày học |
| `words_learned` | INT | Số từ mới lưu trong ngày |
| `words_reviewed` | INT | Số từ đã ôn |
| `videos_watched` | INT | Số video đã xem |
| `study_minutes` | INT | Tổng thời gian học (phút) |

---

## 11. `achievements`
> Danh sách thành tựu có thể đạt được

| Column | Type | Ghi chú |
|---|---|---|
| `id` | BIGINT | PK |
| `name` | VARCHAR(255) | |
| `description` | TEXT | |
| `icon` | TEXT | URL icon |
| `requirement_type` | VARCHAR(50) | vd: `STREAK`, `VOCAB_COUNT`, `VIDEO_COUNT` |
| `requirement_value` | INT | Ngưỡng cần đạt |

---

## 12. `user_achievements`
> Thành tựu user đã đạt được

| Column | Type | Ghi chú |
|---|---|---|
| `user_id` | BIGINT | FK → users |
| `achievement_id` | BIGINT | FK → achievements |
| `achieved_at` | TIMESTAMP | Default NOW() |
| PK | | (`user_id`, `achievement_id`) |

---

## Thứ tự tạo bảng (tránh lỗi FK)

1. `users`
2. `achievements`
3. `videos`
4. `subtitles`
5. `video_history`
6. `vocabulary`
7. `decks`
8. `flashcards`
9. `playlists`
10. `playlist_videos`
11. `study_logs`
12. `user_achievements`

---

## Fill-in-the-blank Logic

- **Điều kiện mở**: Số record trong `subtitles` (của user qua video) đạt ngưỡng (vd: 20 câu)
- **Tạo bài tập**: Random chọn từ trong `vocabulary` → join `subtitles` lấy `original_text` → đục lỗ từ đó
