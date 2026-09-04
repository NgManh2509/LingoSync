# LingoSync Frontend — Kế hoạch Xây dựng Giao diện (React + Vite + TailwindCSS)

> **Mục tiêu:** Xây dựng giao diện ứng dụng học tiếng qua video **LingoSync** hiện đại, mượt mà và trực quan, kết nối 100% với 18 APIs của Backend đã hoàn thiện.

---

## 🎨 1. Thiết kế & Design System

- **Phong cách:** Modern Glassmorphism, Dark / Light Mode sang trọng, micro-animations mượt mà.
- **Bảng màu chủ đạo:**
  - `Primary / Accent:` Indigo / Violet (`#6366f1` / `#8b5cf6`) — Mang cảm giác công nghệ & hiện đại.
  - `Streak & Growth:` Amber / Orange (`#f59e0b` / `#ff7849`) — Gam màu năng lượng cho ngọn lửa Streak 🔥 & Điểm XP.
  - `Success / Level:` Emerald Green (`#10b981`) — Trạng thái làm đúng, hoàn thành mục tiêu.
  - `Background:` Sleek Dark (`#0f172a`, `#1e293b`) & Clean Light (`#f8fafc`, `#ffffff`).
- **Typography:** `Inter` hoặc `Plus Jakarta Sans` — Tối ưu hiển thị văn bản song ngữ rõ ràng, sắc nét.

---

## 📦 2. Các thư viện Frontend cần cài đặt

```bash
cd LingoFrontend/Lingo
npm install react-router-dom axios lucide-react recharts react-youtube canvas-confetti
```

| Thư viện | Mục đích |
|---|---|
| `react-router-dom` | Điều hướng các trang (Dashboard, Watch Video, Flashcards, Exercises, Playlists) |
| `axios` | Xử lý gọi API, tự động đính kèm `Authorization: Bearer <JWT>` và bắt lỗi 401 |
| `lucide-react` | Bộ icon SVG hiện đại, đồng bộ và nhẹ |
| `react-youtube` | Nhúng YouTube Player và lấy thời gian thực (`currentTime`) để đồng bộ phụ đề |
| `recharts` | Vẽ biểu đồ thống kê học tập (Bar / Line chart) trên Dashboard |
| `canvas-confetti` | Hiệu ứng pháo hoa chúc mừng khi Level up hoặc Mở khóa Thành tựu |

---

## 🏗 3. Cấu trúc Thư mục Frontend (`src/`)

```
LingoFrontend/Lingo/src/
 ├── api/                          # Các hàm gọi API Backend theo module
 │    ├── apiClient.js             # Axios instance cấu hình interceptor JWT
 │    ├── authApi.js               # /api/auth/**
 │    ├── videoApi.js              # /api/videos/**
 │    ├── vocabApi.js              # /api/vocabulary/**
 │    ├── deckApi.js               # /api/decks/**
 │    ├── playlistApi.js           # /api/playlists/**
 │    ├── dashboardApi.js          # /api/dashboard/** & /api/users/**
 │    └── exerciseApi.js           # /api/exercises/**
 ├── context/                      # Quản lý State toàn cục
 │    └── AuthContext.jsx          # Quản lý User info, Token, Level, Streak, XP
 ├── components/
 │    ├── layout/                  # Khung giao diện chính
 │    │    ├── AppLayout.jsx       # Layout bọc Sidebar + Topbar + Content
 │    │    ├── Sidebar.jsx         # Menu điều hướng chính
 │    │    ├── Topbar.jsx          # Thanh header: Avatar, XP, Level bar, Streak
 │    │    └── ProtectedRoute.jsx  # Chặn truy cập nếu chưa đăng nhập
 │    ├── common/                  # Component dùng chung
 │    │    ├── Button.jsx, Modal.jsx, Badge.jsx, LoadingSpinner.jsx, Toast.jsx
 │    ├── video/                   # Các component cho màn hình xem video
 │    │    ├── VideoPlayer.jsx     # YouTube Iframe Player đồng bộ timestamp
 │    │    ├── SubtitlePanel.jsx   # Danh sách phụ đề cuộn theo video
 │    │    ├── SubtitleItem.jsx    # Từng câu phụ đề có thể click từng từ
 │    │    └── WordPopover.jsx     # Popup tra từ điển & nút "Lưu vào Flashcard"
 │    ├── dashboard/               # Component cho Dashboard
 │    │    ├── StatCard.jsx        # Thẻ KPI (Tổng từ, phút học, video, streak)
 │    │    ├── StudyChart.jsx      # Biểu đồ cột/đường học tập theo tuần/tháng
 │    │    └── AchievementGrid.jsx # Danh sách huy hiệu thành tựu
 │    ├── flashcard/               # Component ôn tập Spaced Repetition
 │    │    ├── FlashcardItem.jsx   # Thẻ lật 3D (Mặt trước: từ -> Mặt sau: nghĩa)
 │    │    └── SM2Controls.jsx     # 4 nút đánh giá độ nhớ (Quên, Khó, Tốt, Dễ)
 │    └── exercise/                # Component bài tập điền từ
 │         ├── ExerciseCard.jsx    # Câu hỏi đục lỗ (w____) & Ô nhập từ
 │         └── ResultModal.jsx     # Popup tổng kết điểm, thưởng XP & Thành tựu
 └── pages/                        # Các trang chính của ứng dụng
      ├── LoginPage.jsx            # Màn hình Đăng nhập (Google OAuth2)
      ├── AuthCallbackPage.jsx     # Nhận token từ Google OAuth2 redirect
      ├── DashboardPage.jsx        # Trang tổng quan học tập
      ├── WatchVideoPage.jsx       # Trang xem video & phụ đề tương tác (Core)
      ├── FlashcardDeckPage.jsx    # Trang chọn bộ thẻ & Lật Flashcard
      ├── ExercisePage.jsx         # Trang làm bài tập điền từ (Active Recall)
      ├── PlaylistPage.jsx         # Trang quản lý danh sách phát
      └── VocabularyPage.jsx       # Trang từ điển cá nhân (từ đã lưu)
```

---

## 🗺 4. Lộ trình triển khai từng Phase Frontend

```
Phase F1: Foundation, Routing & Layout (Setup nền móng)
    ├── Cài thư viện, cấu hình Tailwind CSS theme & Axios Client
    ├── Xây dựng AuthContext, trang Login & AuthCallback
    └── Dựng AppLayout hoàn chỉnh (Sidebar, Topbar hiển thị XP, Level, Streak)

Phase F2: Màn hình Dashboard & Thống kê
    ├── Hiển thị KPI Cards (Tổng từ, tổng phút học, tổng video)
    ├── Tích hợp Recharts vẽ biểu đồ StudyLog theo tuần/tháng
    └── Hiển thị danh sách Thành tựu và thanh tiến độ mở khóa

Phase F3: Trình phát Video & Phụ đề tương tác (Core Feature)
    ├── Nhập link YouTube & gọi Backend xử lý phụ đề (bóc băng AI)
    ├── Nhúng YouTube Player và đồng bộ phụ đề chạy theo thời gian thực
    ├── Tính năng Tokenize từ: click vào từng từ để xem nghĩa và lưu vào Flashcard
    └── Tự động lưu tiến độ dừng xem (VideoHistory) & tích lũy phút học

Phase F4: Bài tập điền từ (Active Recall) & Ôn Flashcard SM-2
    ├── Màn hình làm bài tập điền từ (gợi ý ký tự w____, ô gõ chữ, nút nghe lại audio)
    ├── Nộp bài tập, hiệu ứng nhận thưởng XP & Pháo hoa chúc mừng
    └── Màn hình lật thẻ Flashcard 3D theo thuật toán ngắt quãng SM-2

Phase F5: Quản lý Playlist & Kho Từ điển cá nhân
    ├── Quản lý Playlist (Tạo/Sửa/Xóa, thêm video vào playlist)
    ├── Danh sách từ vựng cá nhân đã lưu (tìm kiếm, lọc, nghe phát âm)
    └── Hoàn thiện responsive, tối ưu UX/UI và kiểm thử toàn diện
```

---

## 💡 Đề xuất bắt đầu ngay: **Phase F1 (Setup Nền móng & Auth Layout)**

1. Chạy lệnh cài đặt các thư viện cần thiết.
2. Viết `apiClient.js` và `AuthContext.jsx`.
3. Tạo khung giao diện `Sidebar` + `Topbar` + `AppLayout`.
