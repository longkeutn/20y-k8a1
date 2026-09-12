import React, { useState } from 'react';
import { 
  X, 
  Download, 
  Share2, 
  Sparkles, 
  Check, 
  ExternalLink,
  Smartphone
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface MobilePhotoSaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  filename: string;
  title?: string;
}

export default function MobilePhotoSaveModal({
  isOpen,
  onClose,
  imageUrl,
  filename,
  title = 'Tấm vé vàng kỷ niệm 20 năm K8A1'
}: MobilePhotoSaveModalProps) {
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [sharedSuccess, setSharedSuccess] = useState(false);

  if (!isOpen || !imageUrl) return null;

  const safeFilename = filename.replace(/\.(png|jpeg|webp)$/i, '') + '.jpg';

  // Thử chia sẻ qua Web Share API
  const handleNativeShare = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        const res = await fetch(imageUrl);
        const blob = await res.blob();
        const file = new File([blob], safeFilename, { type: 'image/jpeg' });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: title,
            text: 'Tấm vé vàng kỷ niệm 20 năm K8A1 — THPT Thái Nguyên'
          });
          setSharedSuccess(true);
          setTimeout(() => setSharedSuccess(false), 3000);
          try {
            confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 } });
          } catch {}
          return;
        }
      }
      handleDirectDownload();
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        handleDirectDownload();
      }
    }
  };

  // Tải file trực tiếp
  const handleDirectDownload = () => {
    try {
      const a = document.createElement('a');
      a.href = imageUrl;
      a.download = safeFilename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
      try {
        confetti({ particleCount: 35, spread: 50, origin: { y: 0.7 } });
      } catch {}
    } catch {
      window.open(imageUrl, '_blank');
    }
  };

  // Mở tab mới
  const handleOpenInNewTab = () => {
    window.open(imageUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div 
        className="relative w-full max-w-lg bg-[#FAF7F0] border-2 border-amber-300/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER MODAL */}
        <div className="p-3.5 sm:p-4 bg-gradient-to-r from-[#2A1E12] via-[#3D2914] to-[#1E150C] text-white flex items-center justify-between shrink-0 border-b border-amber-500/30">
          <div className="flex items-center gap-2 min-w-0">
            <span className="p-1.5 bg-amber-500/20 text-amber-300 rounded-lg shrink-0">
              <Smartphone className="w-5 h-5" />
            </span>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-serif font-bold text-amber-100 truncate">
                Lưu Ảnh Vào Thư Viện Điện Thoại
              </h3>
              <p className="text-[11px] text-amber-200/80 truncate font-sans">
                Định dạng JPG siêu nét • Tương thích mọi dòng máy
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* NỘI DUNG CUỘN */}
        <div className="p-3 sm:p-4 overflow-y-auto space-y-3 flex-1">
          {/* KHỐI HƯỚNG DẪN LƯU VÀO THƯ VIỆN ẢNH */}
          <div className="p-3 bg-gradient-to-r from-amber-500/15 via-amber-400/10 to-amber-500/15 border-2 border-amber-400/80 rounded-xl space-y-1.5 shadow-xs">
            <div className="flex items-center gap-1.5 text-amber-950 font-bold text-xs font-serif">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
              <span>CÁCH LƯU THẲNG VÀO THƯ VIỆN ẢNH (CUỘN CAMERA):</span>
            </div>
            <div className="text-[11.5px] text-slate-800 leading-relaxed font-sans space-y-1">
              <p>
                👉 <strong>Chạm và NHẤN GIỮ</strong> (khoảng 1 - 2 giây) vào bức ảnh bên dưới:
              </p>
              <ul className="list-disc list-inside text-[11px] text-slate-700 pl-1 space-y-0.5">
                <li>
                  <strong>iPhone (iOS Safari):</strong> Chọn menu <span className="text-blue-700 font-bold">"Lưu hình ảnh"</span> (Save Image).
                </li>
                <li>
                  <strong>Android / Zalo:</strong> Chọn menu <span className="text-emerald-700 font-bold">"Tải hình ảnh xuống"</span> hoặc <span className="text-emerald-700 font-bold">"Lưu ảnh"</span>.
                </li>
              </ul>
            </div>
          </div>

          {/* KHUNG HIỂN THỊ ẢNH JPG (CHO PHÉP LONG-PRESS) */}
          <div className="relative w-full flex flex-col items-center justify-center bg-black/5 rounded-xl p-1 sm:p-2 border border-amber-200">
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-auto max-h-[50vh] object-contain rounded-lg shadow-md border border-amber-300/80 select-auto transition-transform hover:scale-[1.005]"
              style={{
                WebkitTouchCallout: 'default',
                userSelect: 'auto',
                touchAction: 'pan-y'
              }}
            />
            <span className="text-[10px] text-slate-500 italic mt-1.5 text-center">
              * Chuẩn định dạng JPG sắc nét, dung lượng nhẹ, nhận diện ngay trong Thư viện ảnh.
            </span>
          </div>
        </div>

        {/* FOOTER ACTIONS */}
        <div className="p-3 bg-[#F4EFE6] border-t border-amber-200/80 shrink-0 space-y-2">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {/* Nút 1: Chia sẻ / Lưu ảnh qua sheet */}
            <button
              type="button"
              onClick={handleNativeShare}
              className="py-2.5 px-3 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {sharedSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Đã chọn menu</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-amber-200" />
                  <span>Chia Sẻ / Lưu</span>
                </>
              )}
            </button>

            {/* Nút 2: Tải file JPG */}
            <button
              type="button"
              onClick={handleDirectDownload}
              className="py-2.5 px-3 bg-white hover:bg-amber-50 text-amber-900 border border-amber-300 text-xs font-bold rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {downloadSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Đã tải JPG</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5 text-amber-700" />
                  <span>Tải File .JPG</span>
                </>
              )}
            </button>

            {/* Nút 3: Mở tab mới */}
            <button
              type="button"
              onClick={handleOpenInNewTab}
              className="col-span-2 sm:col-span-1 py-2.5 px-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-bold rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
              <span>Mở Tab Mới</span>
            </button>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-lg transition cursor-pointer"
            >
              Đã Lưu Xong • Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
