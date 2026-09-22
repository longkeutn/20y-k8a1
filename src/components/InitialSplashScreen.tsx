import React from 'react';
import { Sparkles } from 'lucide-react';

interface InitialSplashScreenProps {
  isOpen: boolean;
  isFading: boolean;
}

/**
 * Màn hình chờ mở đầu (Initial Splash Screen) dành riêng cho người dùng truy cập lần đầu
 * Giúp loại bỏ hoàn toàn hiện tượng FOUC (khối hiển thị lên rồi biến mất do chưa kịp nạp blockVisibility)
 * Tự động mờ dần mở bung trang web hoàn thiện khi dữ liệu từ Google Sheets đã sẵn sàng.
 */
export default function InitialSplashScreen({ isOpen, isFading }: InitialSplashScreenProps) {
  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-gradient-to-b from-[#070b14] via-[#0f172a] to-[#171c35] text-white px-6 transition-all duration-400 ease-out select-none ${
        isFading ? 'opacity-0 pointer-events-none scale-102' : 'opacity-100 scale-100'
      }`}
      style={{ willChange: 'opacity, transform' }}
    >
      {/* Hiệu ứng ánh sáng nền mờ ảo (Ambient Glow) */}
      <div className="absolute w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-amber-500/10 blur-3xl pointer-events-none -top-10 animate-pulse" />
      <div className="absolute w-60 h-60 sm:w-80 sm:h-80 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none -bottom-10" />

      {/* Vòng huy hiệu 20 Năm K8A1 Ánh Kim */}
      <div className="relative flex items-center justify-center mb-6">
        {/* Vòng quay tinh tế viền vàng kim */}
        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-2 border-amber-400/20 border-t-amber-400 animate-spin" />
        
        {/* Vòng tròn trung tâm với số hiệu 20 Năm */}
        <div className="absolute w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-tr from-amber-600/30 via-slate-900 to-amber-900/40 border border-amber-400/40 flex flex-col items-center justify-center shadow-lg shadow-amber-500/10">
          <span className="text-xl sm:text-2xl font-serif font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-300">
            20
          </span>
          <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-widest text-amber-300/90 -mt-0.5">
            NĂM K8A1
          </span>
        </div>
      </div>

      {/* Thông tin chào đón */}
      <div className="text-center max-w-md z-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-400/30 text-amber-300 text-[11px] sm:text-xs font-semibold uppercase tracking-wider mb-2.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
          <span>THPT Thái Nguyên • 2003 - 2006</span>
        </div>

        <h1 className="text-xl sm:text-2xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-50 to-amber-300 tracking-wide mb-1.5">
          HỘI NGỘ 20 NĂM LỚP K8A1
        </h1>

        <p className="text-xs sm:text-sm text-slate-300/80 mb-6 font-light leading-relaxed">
          Chào mừng bạn về với mái ấm K8A1 sau hai thập kỷ gắn bó
        </p>

        {/* Thanh Loading Shimmer Ánh Hổ Phách */}
        <div className="w-48 sm:w-56 h-1.5 bg-slate-800/80 rounded-full overflow-hidden border border-slate-700/60 mx-auto relative shadow-inner">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-400 to-transparent w-full h-full animate-[shimmer_1.4s_infinite]" />
        </div>

        {/* Thông điệp tải dữ liệu */}
        <p className="text-[11px] sm:text-xs text-amber-400/80 mt-3 font-medium flex items-center justify-center gap-1.5 animate-pulse">
          <span>Đang đồng bộ dữ liệu thời gian thực...</span>
        </p>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
