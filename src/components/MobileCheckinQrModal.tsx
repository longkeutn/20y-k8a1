import React, { useState } from 'react';
import {
  X,
  QrCode,
  Copy,
  Check,
  Share2,
  Sparkles,
  Users,
  CheckCircle2,
  Sun,
  Moon,
  ExternalLink,
  Printer
} from 'lucide-react';
import { EventConfig } from '../types';

interface MobileCheckinQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventConfig?: EventConfig;
  totalAttendees?: number;
  checkedInAttendees?: number;
  onOpenSelfCheckin?: () => void;
  onOpenPosterModal?: () => void;
}

export default function MobileCheckinQrModal({
  isOpen,
  onClose,
  eventConfig,
  totalAttendees = 43,
  checkedInAttendees = 0,
  onOpenSelfCheckin,
  onOpenPosterModal
}: MobileCheckinQrModalProps) {
  const [copied, setCopied] = useState(false);
  const [isLightMode, setIsLightMode] = useState(true); // Mặc định nền sáng chống lóa ngoài trời

  if (!isOpen) return null;

  const checkinUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${window.location.pathname}?mode=checkin`
    : '';

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=380x380&data=${encodeURIComponent(
    checkinUrl
  )}&color=0b1329&bgcolor=ffffff&margin=1`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(checkinUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      alert('Không thể tự động sao chép link.');
    }
  };

  const handleShareZalo = async () => {
    const shareData = {
      title: 'Điểm Danh & Nhận Vé Vàng K8A1',
      text: 'Các bạn K8A1 đã đến trường vui lòng quét mã hoặc bấm link để Nhận Vé Vàng & Điểm Danh nhé:',
      url: checkinUrl
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        handleCopyLink();
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div
        className={`relative w-full max-w-sm rounded-3xl p-5 shadow-2xl transition-colors duration-300 border-2 ${
          isLightMode
            ? 'bg-[#FFFDF9] text-slate-900 border-amber-400'
            : 'bg-slate-950 text-white border-amber-500/80 shadow-[0_0_50px_rgba(245,158,11,0.25)]'
        }`}
      >
        {/* Top Control Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-amber-300/40 mb-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsLightMode(!isLightMode)}
              className={`p-1.5 rounded-xl border text-xs font-sans font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                isLightMode
                  ? 'bg-amber-100/80 text-amber-950 border-amber-300 hover:bg-amber-200'
                  : 'bg-slate-800 text-amber-300 border-slate-700 hover:bg-slate-700'
              }`}
              title="Đổi chế độ sáng / tối chống chói ngoài trời"
            >
              {isLightMode ? <Sun className="w-3.5 h-3.5 text-amber-700" /> : <Moon className="w-3.5 h-3.5 text-amber-300" />}
              <span className="text-[10px]">{isLightMode ? 'Chống chói' : 'Nền tối'}</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className={`p-1.5 rounded-full transition-colors cursor-pointer ${
              isLightMode ? 'hover:bg-slate-200 text-slate-500' : 'hover:bg-slate-800 text-slate-400'
            }`}
            title="Đóng (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Header Branding */}
        <div className="text-center space-y-1 mb-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-500/15 border border-amber-400/50 text-amber-900 text-[10px] font-sans font-black uppercase tracking-widest">
            <Sparkles className="w-3 h-3 text-amber-700" />
            <span>Ban Liên Lạc Đón Tiếp</span>
          </div>

          <h3 className="text-base sm:text-lg font-serif font-black uppercase tracking-wide leading-tight">
            Mã QR Điểm Danh K8A1
          </h3>
          <p className={`text-xs font-serif italic ${isLightMode ? 'text-slate-600' : 'text-amber-200/80'}`}>
            Giơ màn hình này để bạn bè quét bằng Camera / Zalo
          </p>
        </div>

        {/* Giant QR Code Display */}
        <div className="bg-white p-3.5 rounded-2xl border-2 border-amber-400/80 shadow-md flex flex-col items-center justify-center mx-auto max-w-[260px]">
          <img
            src={qrImageUrl}
            alt="Mã QR Tự Điểm Danh K8A1"
            className="w-52 h-52 sm:w-56 sm:h-56 object-contain"
          />
          <div className="mt-1.5 text-center">
            <span className="text-[9.5px] font-mono font-bold text-slate-800 uppercase tracking-widest block">
              SCAN TO CHECK-IN • K8A1
            </span>
          </div>
        </div>

        {/* Live Attendance Counter */}
        <div className={`mt-3.5 p-2.5 rounded-xl border text-center space-y-1 ${
          isLightMode ? 'bg-amber-50/70 border-amber-200' : 'bg-slate-900 border-slate-800'
        }`}>
          <div className="flex items-center justify-between text-xs px-1">
            <span className="flex items-center gap-1 font-sans font-bold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Sĩ số có mặt:</span>
            </span>
            <span className="font-mono font-black text-emerald-700 text-sm">
              {checkedInAttendees} / {totalAttendees} bạn
            </span>
          </div>
          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-600 h-full rounded-full transition-all duration-500"
              style={{
                width: `${totalAttendees > 0 ? Math.min(100, Math.round((checkedInAttendees / totalAttendees) * 100)) : 0}%`
              }}
            />
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="grid grid-cols-2 gap-2 mt-3.5">
          <button
            type="button"
            onClick={handleCopyLink}
            className={`py-2 px-3 rounded-xl border text-xs font-sans font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              isLightMode
                ? 'bg-white hover:bg-slate-50 text-slate-800 border-slate-300 shadow-2xs'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
            }`}
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-amber-600" />}
            <span>{copied ? 'Đã Chép Link!' : 'Sao Chép Link'}</span>
          </button>

          <button
            type="button"
            onClick={handleShareZalo}
            className="py-2 px-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white border border-blue-800 text-xs font-sans font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Gửi Vào Zalo</span>
          </button>
        </div>

        {/* Secondary Navigation Options */}
        <div className="flex items-center justify-between gap-2 pt-3 border-t border-amber-300/30 mt-3 text-[11px]">
          {onOpenPosterModal && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenPosterModal();
              }}
              className="inline-flex items-center gap-1 text-amber-800 hover:text-amber-950 font-sans font-bold cursor-pointer"
              title="Tải maket poster A4 để in bảng mica đón tiếp tại trường"
            >
              <Printer className="w-3 h-3 text-amber-700" />
              <span>In Bảng QR A4 / Standee</span>
            </button>
          )}

          {onOpenSelfCheckin && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenSelfCheckin();
              }}
              className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-900 font-sans font-medium cursor-pointer ml-auto"
            >
              <span>Vào Cổng Điểm Danh</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
