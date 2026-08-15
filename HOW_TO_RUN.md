# 🚀 Hướng Dẫn Chạy Dự Án LingoSync

Dự án **LingoSync** bao gồm 3 thành phần chính:
1. **LingoAIWorker** (FastAPI / Python - Cổng `8000`): Dịch thuật AI, trích xuất phụ đề YouTube, Faster-Whisper STT.
2. **LingoBackend** (Spring Boot / Java - Cổng `8080`): API máy chủ chính, xác thực người dùng, lưu trữ cơ sở dữ liệu.
3. **LingoFrontend** (React + Vite + Tailwind CSS - Cổng `5173`): Giao diện web người dùng.

---

## 📋 Yêu Cầu Cài Đặt Ban Đầu (Prerequisites)

- **Python**: 3.10+
- **Node.js**: 18+ & npm
- **Java JDK**: 17+
- **PostgreSQL**: Đang chạy trên cổng `5433` (Database: `lingosync`) hoặc chạy qua Docker.
- **FFmpeg**: Đã được cài đặt và thêm vào PATH hệ thống (để xử lý âm thanh/video).

---

## 1️⃣ Khởi Chạy Cơ Sở Dữ Liệu (PostgreSQL)

Đảm bảo PostgreSQL đang chạy trên cổng `5433` và đã tạo database `lingosync`:

```sql
CREATE DATABASE lingosync;
```

---

## 2️⃣ Khởi Chạy AI Worker (`LingoAIWorker`)

### Bước 1: Mở terminal tại thư mục `LingoAIWorker`
```bash
cd LingoAIWorker
```

### Bước 2: Tạo và kích hoạt môi trường ảo (Virtual Environment)
- **Windows (PowerShell / CMD):**
  ```powershell
  python -m venv .venv
  .venv\Scripts\activate
  ```
- **Linux / macOS:**
  ```bash
  python3 -m venv .venv
  source .venv/bin/activate
  ```

### Bước 3: Cài đặt thư viện
```bash
pip install -r requirements.txt
```

### Bước 4: Cấu hình biến môi trường (`.env`)
Tạo file `.env` trong thư mục `LingoAIWorker/` với nội dung:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### Bước 5: Chạy dịch vụ AI Worker
```bash
uvicorn main:app --reload --port 8000
```
- **Địa chỉ API:** `http://localhost:8000`
- **Swagger UI (Tài liệu API):** `http://localhost:8000/docs`

---

## 3️⃣ Khởi Chạy Backend (`LingoBackend`)

### Bước 1: Mở terminal tại thư mục `LingoBackend/lingo-backend`
```bash
cd LingoBackend/lingo-backend
```

### Bước 2: Cấu hình biến môi trường (`.env`)
Tạo file `.env` tại thư mục `LingoBackend/lingo-backend/` (hoặc cấu hình các biến môi trường tương ứng):
```env
DB_PASSWORD=your_postgres_password
JWT_SECRET=your_super_secret_jwt_key_at_least_256_bits
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### Bước 3: Chạy ứng dụng Spring Boot
- **Windows:**
  ```powershell
  .\mvnw.cmd spring-boot:run
  ```
- **Linux / macOS:**
  ```bash
  ./mvnw spring-boot:run
  ```
- **Địa chỉ Backend API:** `http://localhost:8080`

---

## 4️⃣ Khởi Chạy Frontend (`LingoFrontend`)

### Bước 1: Mở terminal tại thư mục `LingoFrontend/Lingo`
```bash
cd LingoFrontend/Lingo
```

### Bước 2: Cài đặt packages
```bash
npm install
```

### Bước 3: Khởi chạy môi trường Dev
```bash
npm run dev
```
- **Địa chỉ Web UI:** `http://localhost:5173`

---

## 🧭 Thứ Tự Khởi Chạy Khuyến Nghị

```text
[1. PostgreSQL DB (Port 5433)]
               │
               ▼
[2. LingoAIWorker (Port 8000)]
               │
               ▼
[3. LingoBackend (Port 8080)]
               │
               ▼
[4. LingoFrontend (Port 5173)]
```
