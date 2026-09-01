import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FiGlobe, FiCheck, FiLoader, FiArrowRight } from 'react-icons/fi';

const SUPPORTED_TARGET_LANGS = [
  { code: 'en', name: 'Tiếng Anh', englishName: 'English', flag: '🇬🇧' },
  { code: 'zh', name: 'Tiếng Trung', englishName: 'Chinese', flag: '🇨🇳' },
  { code: 'ja', name: 'Tiếng Nhật', englishName: 'Japanese', flag: '🇯🇵' },
  { code: 'ko', name: 'Tiếng Hàn', englishName: 'Korean', flag: '🇰🇷' },
  { code: 'de', name: 'Tiếng Đức', englishName: 'German', flag: '🇩🇪' },
  { code: 'fr', name: 'Tiếng Pháp', englishName: 'French', flag: '🇫🇷' },
  { code: 'es', name: 'Tiếng Tây Ban Nha', englishName: 'Spanish', flag: '🇪🇸' },
];

const NATIVE_LANGS = [
  { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
];

const OnboardingModal = ({ isOpen }) => {
  const { updateLanguagePreference } = useAuth();
  const [targetLang, setTargetLang] = useState('en');
  const [nativeLang, setNativeLang] = useState('vi');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      await updateLanguagePreference(targetLang, nativeLang);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể lưu cài đặt ngôn ngữ. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-[#FFFDF8] border border-[#DED8CC] rounded-[5px] max-w-lg w-full shadow-xl flex flex-col overflow-hidden text-[#25231F]">
        
        <div className="p-6 sm:p-7 border-b border-[#DED8CC] bg-[#FAF6EE]/70">
          <div className="flex items-center gap-2 text-[#A67C52] text-xs font-semibold uppercase tracking-wider mb-2">
            <FiGlobe className="w-4 h-4" />
            <span>Chào mừng bạn đến với LingoSync</span>
          </div>
          <h2 className="text-lg sm:text-xl font-serif font-bold text-[#25231F]">
            Chọn ngôn ngữ bạn muốn chinh phục
          </h2>
          <p className="text-xs text-[#777168] mt-1 leading-relaxed">
            Hệ thống sẽ tự động tạo danh sách bài học khởi động và đề xuất video phù hợp nhất cho lộ trình của bạn.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-7 flex flex-col gap-6">
          <div className="flex flex-col gap-2.5">
            <label className="text-xs font-bold text-[#25231F]">
              1. Bạn muốn học ngôn ngữ nào?
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {SUPPORTED_TARGET_LANGS.map((item) => {
                const isSelected = targetLang === item.code;
                return (
                  <button
                    key={item.code}
                    type="button"
                    onClick={() => setTargetLang(item.code)}
                    className={`flex items-center gap-2.5 p-3 rounded-[5px] border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#F4EDE1] border-[#A67C52] text-[#25231F] ring-1 ring-[#A67C52]'
                        : 'bg-[#FFF9ED] border-[#DED8CC] text-[#555048] hover:border-[#A67C52]/50 hover:bg-[#FAF6EE]'
                    }`}
                  >
                    <span className="text-xl shrink-0">{item.flag}</span>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold truncate">{item.name}</div>
                      <div className="text-[10px] text-[#777168] truncate">{item.englishName}</div>
                    </div>
                    {isSelected && (
                      <FiCheck className="w-3.5 h-3.5 text-[#A67C52] shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="native-lang-select" className="text-xs font-bold text-[#25231F]">
              2. Ngôn ngữ dịch phụ đề và giải nghĩa (tiếng mẹ đẻ của bạn)
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {NATIVE_LANGS.map((item) => {
                const isSelected = nativeLang === item.code;
                return (
                  <button
                    key={item.code}
                    type="button"
                    onClick={() => setNativeLang(item.code)}
                    className={`flex items-center gap-2.5 p-2.5 rounded-[5px] border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#F4EDE1] border-[#A67C52] text-[#25231F] ring-1 ring-[#A67C52]'
                        : 'bg-[#FFF9ED] border-[#DED8CC] text-[#555048] hover:border-[#A67C52]/50 hover:bg-[#FAF6EE]'
                    }`}
                  >
                    <span className="text-lg">{item.flag}</span>
                    <span className="text-xs font-semibold">{item.name}</span>
                    {isSelected && (
                      <FiCheck className="w-3.5 h-3.5 text-[#A67C52] ml-auto" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {error && (
            <div className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-[5px] p-3">
              {error}
            </div>
          )}

          <div className="pt-2 flex items-center justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-[#A67C52] hover:bg-[#79542E] text-white text-xs font-semibold rounded-[5px] transition-colors cursor-pointer disabled:opacity-50 shadow-xs"
            >
              {isSubmitting ? (
                <>
                  <FiLoader className="w-3.5 h-3.5 animate-spin" />
                  <span>Đang thiết lập...</span>
                </>
              ) : (
                <>
                  <span>Bắt đầu trải nghiệm</span>
                  <FiArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default OnboardingModal;
