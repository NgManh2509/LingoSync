import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/layout/ProtectedRoute';
import AppLayout from './components/layout/AppLayout';
import LoginPage from './pages/LoginPage';
import AuthCallbackPage from './pages/AuthCallbackPage';
import HomePage from './pages/HomePage';
import LessonScreen from './pages/LessonScreen';
import PlaylistsPage from './pages/PlaylistsPage';

const SectionPlaceholder = ({ title, desc }) => (
  <div className="bg-white border border-zinc-200/90 rounded-[5px] p-8 text-center max-w-xl mx-auto mt-12 shadow-xs">
    <h2 className="text-xl font-bold text-zinc-900 mb-1.5">{title}</h2>
    <p className="text-zinc-500 text-xs">{desc}</p>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/auth/callback" element={<AuthCallbackPage />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/lessons" element={<LessonScreen />} />
              <Route path="/lessons/:videoId" element={<LessonScreen />} />
              <Route path="/playlists" element={<PlaylistsPage />} />
              <Route path="/vocabulary" element={<SectionPlaceholder title="Vocabulary" desc="Kho từ vựng cá nhân đã lưu trong quá trình xem video..." />} />
              <Route path="/lingo-ai" element={<SectionPlaceholder title="LingoAI — Writing Task 1" desc="Trợ lý AI chấm điểm và gợi ý bài viết IELTS Writing..." />} />
              <Route path="/profile" element={<SectionPlaceholder title="My Profile" desc="Thông tin tài khoản, cấp độ Level, thống kê tiến độ học tập..." />} />
              <Route path="/challenges" element={<SectionPlaceholder title="Challenges" desc="Làm bài tập điền từ w____ & Ôn tập thẻ Flashcard ngắt quãng SM-2..." />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
