import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2, Sparkles } from 'lucide-react';

const AuthCallbackPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loginWithToken } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      loginWithToken(token);
      navigate('/', { replace: true });
    } else {
      navigate('/login', { replace: true });
    }
  }, [searchParams, loginWithToken, navigate]);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="absolute w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none animate-pulse" />

      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl relative z-10 backdrop-blur-xl">
        <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center mx-auto mb-5 text-indigo-400">
          <Loader2 className="w-7 h-7 animate-spin" />
        </div>

        <h2 className="text-xl font-bold text-white mb-1.5">
          Đang xác thực tài khoản
        </h2>
        <p className="text-slate-400 text-sm">
          Vui lòng đợi giây lát, chúng tôi đang chuẩn bị không gian học tập cho bạn...
        </p>

        <div className="mt-6 pt-5 border-t border-slate-800 flex items-center justify-center gap-2 text-xs text-indigo-400 font-medium">
          <Sparkles className="w-4 h-4" />
          <span>LingoSync Engine</span>
        </div>
      </div>
    </div>
  );
};

export default AuthCallbackPage;
