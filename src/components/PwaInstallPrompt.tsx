import React, { useState, useEffect } from 'react';
import { Smartphone, Download, X, Share, PlusSquare, Sparkles, Check } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);
  const [isDismissed, setIsDismissed] = useState(true); // default true until verified

  useEffect(() => {
    // 1. Kiểm tra nếu app đã chạy ở chế độ Standalone (đã cài đặt)
    const checkStandalone = () => {
      const isStandaloneMedia = window.matchMedia('(display-mode: standalone)').matches;
      const isNavigatorStandalone = (window.navigator as any).standalone === true;
      return isStandaloneMedia || isNavigatorStandalone;
    };

    if (checkStandalone()) {
      setIsStandalone(true);
      return;
    }

    // 2. Kiểm tra xem người dùng đã bấm tắt gần đây chưa (nhớ trong 7 ngày)
    try {
      const dismissedUntil = localStorage.getItem('k8a1_pwa_dismissed_until');
      if (dismissedUntil && Date.now() < parseInt(dismissedUntil, 10)) {
        setIsDismissed(true);
        return;
      }
    } catch {}

    setIsDismissed(false);

    // 3. Nhận diện thiết bị iOS Safari
    const ua = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(ua) && !(window as any).MSStream;
    setIsIos(isIosDevice);

    // 4. Bắt sự kiện beforeinstallprompt trên Android / Chromium
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    try {
      // Ẩn thông báo trong 7 ngày
      const sevenDaysLater = Date.now() + 7 * 24 * 60 * 60 * 1000;
      localStorage.setItem('k8a1_pwa_dismissed_until', sevenDaysLater.toString());
    } catch {}
  };

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // Gọi prompt cài đặt trên Android / Chrome
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === 'accepted') {
          setIsDismissed(true);
        }
      } catch (err) {
        console.warn('Lỗi mở prompt cài đặt PWA:', err);
      }
      setDeferredPrompt(null);
    } else if (isIos) {
      // Mở hộp thoại hướng dẫn cho iPhone/iPad Safari
      setShowIosGuide(true);
    } else {
      // Trình duyệt khác (Firefox, PC): Hướng dẫn chung
      alert('Để cài đặt WebApp: Hãy bấm menu 3 chấm trên trình duyệt và chọn "Cài đặt ứng dụng" hoặc "Thêm vào Màn hình chính".');
    }
  };

  // Không hiển thị nếu đã cài đặt, đã dismiss, hoặc đang chạy standalone
  if (isStandalone || isDismissed) {
    return null;
  }

  return (
    <>
      {/* THANH THÔNG BÁO PWA NỔI BẬT DƯỚI GÓC MÀN HÌNH */}
      <aside 
        role="region"
        aria-label="Cài đặt ứng dụng K8A1"
        className="fixed bottom-3 left-3 right-3 sm:left-auto sm:right-5 sm:bottom-5 sm:max-w-sm z-40 bg-gradient-to-r from-[#0B132B] via-[#1E293B] to-[#0B132B] text-white p-3.5 rounded-2xl border border-amber-400/50 shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom duration-300"
      >
        <div className="flex items-start gap-3">
          {/* ICON ĐỒNG PHỤC / LOGO */}
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center shrink-0 text-amber-300">
            <Smartphone className="w-5 h-5" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h4 className="text-xs font-serif font-bold text-amber-300">
                Cài Đặt WebApp K8A1
              </h4>
              <span className="text-[9px] bg-amber-500 text-slate-950 font-bold px-1.5 py-0.2 rounded-full uppercase">
                Tiện Lợi
              </span>
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">
              Cài ra màn hình chính điện thoại để mở nhanh như App và không bỏ lỡ tin tức hội khóa!
            </p>

            <div className="flex items-center gap-2 mt-2">
              <button
                type="button"
                onClick={handleInstallClick}
                className="px-3 py-1.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 text-xs font-sans font-bold rounded-lg shadow-sm transition flex items-center gap-1 cursor-pointer active:scale-95"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{isIos ? 'Cách Cài Cho iPhone' : 'Cài Ngay (1-Chạm)'}</span>
              </button>

              <button
                type="button"
                onClick={handleDismiss}
                className="px-2.5 py-1.5 text-[11px] text-slate-400 hover:text-white rounded-lg transition cursor-pointer"
              >
                Để sau
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={handleDismiss}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition shrink-0"
            title="Đóng"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* MODAL HƯỚNG DẪN CHI TIẾT CHO IPHONE / IPAD SAFARI */}
      {showIosGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border-2 border-amber-300 shadow-2xl w-full max-w-sm overflow-hidden text-slate-800 animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#0B132B] to-[#1E293B] px-5 py-4 text-white flex items-center justify-between border-b border-amber-500/30">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
                  <Smartphone className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-sm font-serif font-bold text-amber-200">
                    Cài Đặt Trên iPhone / iPad
                  </h3>
                  <p className="text-[10px] text-slate-400 font-sans">Chỉ mất 5 giây qua trình duyệt Safari</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowIosGuide(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Steps */}
            <div className="p-5 space-y-3.5 text-xs font-sans">
              <div className="flex items-start gap-3 bg-amber-50/60 p-3 rounded-2xl border border-amber-200">
                <div className="w-7 h-7 rounded-full bg-amber-500 text-slate-950 font-bold flex items-center justify-center shrink-0 text-xs">
                  1
                </div>
                <div className="flex-1">
                  <p className="font-bold text-slate-800">
                    Bấm biểu tượng Chia Sẻ (Share)
                  </p>
                  <p className="text-slate-600 text-[11px] mt-0.5 flex items-center gap-1">
                    Nhìn thanh công cụ phía dưới cùng Safari, bấm nút <Share className="w-3.5 h-3.5 text-blue-600 inline" />.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-amber-50/60 p-3 rounded-2xl border border-amber-200">
                <div className="w-7 h-7 rounded-full bg-amber-500 text-slate-950 font-bold flex items-center justify-center shrink-0 text-xs">
                  2
                </div>
                <div className="flex-1">
                  <p className="font-bold text-slate-800">
                    Chọn "Thêm vào MH chính"
                  </p>
                  <p className="text-slate-600 text-[11px] mt-0.5 flex items-center gap-1">
                    Cuộn xuống danh sách tùy chọn và nhấn <PlusSquare className="w-3.5 h-3.5 text-slate-700 inline" /> <strong>Thêm vào MH chính</strong> (Add to Home Screen).
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-amber-50/60 p-3 rounded-2xl border border-amber-200">
                <div className="w-7 h-7 rounded-full bg-amber-500 text-slate-950 font-bold flex items-center justify-center shrink-0 text-xs">
                  3
                </div>
                <div className="flex-1">
                  <p className="font-bold text-slate-800">
                    Bấm "Thêm" (Add) ở góc trên
                  </p>
                  <p className="text-slate-600 text-[11px] mt-0.5">
                    Biểu tượng K8A1 20 Năm sẽ xuất hiện ngay trên màn hình điện thoại như một ứng dụng thật!
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowIosGuide(false);
                  handleDismiss();
                }}
                className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-md transition cursor-pointer mt-2"
              >
                ✓ Tôi Đã Hiểu
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
