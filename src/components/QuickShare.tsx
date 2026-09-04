import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Share2,
  Copy,
  Check,
  X,
  ExternalLink,
  QrCode,
  Sparkles,
  MessageCircle,
  Users,
  Send,
  Smartphone
} from 'lucide-react';

interface QuickShareProps {
  buttonText?: string;
  className?: string;
  variant?: 'primary' | 'secondary' | 'pill' | 'banner';
}

export const SHARE_INFO = {
  title: 'Hội Ngộ 20 Năm Lớp K8A1 — THPT Thái Nguyên (2006 — 2026)',
  desc: 'Kỷ niệm 20 năm ngày ra trường Lớp K8A1 (Khóa 8), THPT Thái Nguyên. Họp mặt tại Crown Palace Thái Nguyên vào ngày 27/09/2026.',
  defaultMessage: `🌸 THƯ MỜI HỘI NGỘ 20 NĂM LỚP K8A1 (2006 - 2026) 🌸\n\nThân mời tất cả các bạn cựu học sinh Lớp K8A1 (Khóa 8) Trường THPT Thái Nguyên về tham dự Ngày Hội Ngộ 20 Năm Thanh Xuân!\n⏰ Thời gian: Từ 08:30 sáng - Chủ Nhật, ngày 27/09/2026\n📍 Địa điểm: Trung tâm tổ chức sự kiện - tiệc cưới Crown Palace, Thái Nguyên (779 Dương Tự Minh, P. Quang Vinh, TP. Thái Nguyên)\n\n👉 Hãy bấm vào liên kết bên dưới để xác nhận tham dự và cùng ôn lại kỷ niệm nhé:`
};

export default function QuickShare({
  buttonText = 'Chia sẻ tới nhóm lớp',
  className = '',
  variant = 'pill'
}: QuickShareProps) {
  const [showModal, setShowModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedMessage, setCopiedMessage] = useState(false);
  const [showQr, setShowQr] = useState(false);

  const getShareUrl = () => {
    if (typeof window !== 'undefined') {
      return window.location.href.split('#')[0];
    }
    return 'https://ais-dev-psz3qzk7y7qxcp67ilerhc-625228135894.asia-southeast1.run.app';
  };

  const handleNativeShare = async () => {
    const url = getShareUrl();
    const shareData = {
      title: SHARE_INFO.title,
      text: `${SHARE_INFO.desc}\n\n`,
      url: url
    };

    // Attempt Web Share API if available
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        if (navigator.canShare && !navigator.canShare(shareData)) {
          setShowModal(true);
          return;
        }
        await navigator.share(shareData);
        return;
      } catch (err: any) {
        // If aborted by user (cancel), do nothing
        if (err?.name === 'AbortError') return;
        // Otherwise fallback to custom modal
        setShowModal(true);
        return;
      }
    }

    // Fallback: Open custom share modal
    setShowModal(true);
  };

  const handleCopyLink = async () => {
    const url = getShareUrl();
    try {
      await navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      // Fallback
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleCopyFullInvitation = async () => {
    const url = getShareUrl();
    const fullText = `${SHARE_INFO.defaultMessage}\n${url}`;
    try {
      await navigator.clipboard.writeText(fullText);
      setCopiedMessage(true);
      setTimeout(() => setCopiedMessage(false), 2500);
    } catch {
      setCopiedMessage(true);
      setTimeout(() => setCopiedMessage(false), 2500);
    }
  };

  const handleShareZalo = () => {
    const url = getShareUrl();
    // Zalo web share dialog
    const zaloUrl = `https://zalo.me/share?url=${encodeURIComponent(url)}`;
    window.open(zaloUrl, '_blank', 'noopener,noreferrer,width=600,height=600');
  };

  const handleShareFacebook = () => {
    const url = getShareUrl();
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    window.open(fbUrl, '_blank', 'noopener,noreferrer,width=600,height=500');
  };

  return (
    <>
      {/* TRIGGER BUTTON BASED ON VARIANT */}
      {variant === 'pill' && (
        <button
          type="button"
          onClick={handleNativeShare}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-gold-light hover:bg-brand-gold/20 text-brand-text border border-brand-gold/40 rounded-full text-xs font-sans font-bold uppercase tracking-wider transition-all hover:scale-102 active:scale-98 shadow-2xs cursor-pointer ${className}`}
          title="Chia sẻ thư mời qua Zalo hoặc Facebook"
        >
          <Share2 className="w-3.5 h-3.5 text-brand-gold" />
          <span>{buttonText}</span>
        </button>
      )}

      {variant === 'primary' && (
        <button
          type="button"
          onClick={handleNativeShare}
          className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-text hover:bg-brand-gold text-white rounded-sm text-xs font-sans font-bold uppercase tracking-widest transition-colors shadow-xs cursor-pointer ${className}`}
        >
          <Share2 className="w-4 h-4 text-brand-gold" />
          <span>{buttonText}</span>
        </button>
      )}

      {variant === 'secondary' && (
        <button
          type="button"
          onClick={handleNativeShare}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-[#FAF9F6] text-brand-text border border-brand-border rounded-sm text-xs font-sans font-medium transition-colors cursor-pointer ${className}`}
        >
          <Share2 className="w-3.5 h-3.5 text-brand-gold" />
          <span>{buttonText}</span>
        </button>
      )}

      {variant === 'banner' && (
        <div className={`p-4 bg-[#FAF9F6] border border-brand-border rounded-sm space-y-3 text-left shadow-2xs ${className}`}>
          <div className="flex items-center justify-between gap-2 border-b border-brand-border/40 pb-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-brand-gold-light text-brand-gold rounded-xs">
                <Share2 className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-sans font-bold uppercase text-xs tracking-wider text-brand-text">
                  Lan Tỏa Lời Mời Đến Nhóm Lớp
                </h4>
                <p className="text-[11px] text-brand-text-muted font-serif italic">
                  Gửi link vào nhóm Zalo hoặc Facebook để không bạn nào bị bỏ lỡ!
                </p>
              </div>
            </div>
            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-sans font-bold uppercase text-brand-gold bg-white px-2 py-0.5 border border-brand-border rounded-xs">
              <Sparkles className="w-3 h-3" /> Lan tỏa nhanh
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleNativeShare}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-brand-text hover:bg-brand-gold text-white rounded-xs text-[11px] font-sans font-bold uppercase tracking-wider transition-colors cursor-pointer"
            >
              <Smartphone className="w-3.5 h-3.5 text-brand-gold" />
              <span>Chia sẻ nhanh (Zalo / Facebook)</span>
            </button>

            <button
              type="button"
              onClick={handleCopyFullInvitation}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-brand-bg-alt text-brand-text border border-brand-border rounded-xs text-[11px] font-sans font-medium transition-colors cursor-pointer"
            >
              {copiedMessage ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedMessage ? 'Đã sao chép toàn bộ thiệp!' : 'Sao chép nội dung thiệp'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setShowModal(true);
                setShowQr(true);
              }}
              className="inline-flex items-center gap-1 px-2.5 py-2 text-brand-text-muted hover:text-brand-text text-[11px] font-sans border border-brand-border bg-white rounded-xs transition-colors cursor-pointer"
              title="Xem mã QR quét nhanh"
            >
              <QrCode className="w-3.5 h-3.5 text-brand-gold" />
              <span>Mã QR</span>
            </button>
          </div>
        </div>
      )}

      {/* SHARE MODAL & DIALOG */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-2xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="bg-[#FAF8F5] border border-brand-border rounded-sm max-w-md w-full p-6 space-y-5 shadow-2xl text-left relative overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-brand-border/60 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-brand-gold-light text-brand-gold rounded-xs">
                    <Share2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-base text-brand-text">
                      Chia Sẻ Thư Mời Lớp K8A1
                    </h3>
                    <p className="text-[11px] text-brand-text-muted font-sans">
                      Gửi đến các bạn Lớp K8A1 (Khóa 8), THPT Thái Nguyên
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="p-1 text-brand-text-muted hover:text-brand-text rounded-xs transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Direct share action cards */}
              <div className="grid grid-cols-2 gap-3">
                {/* Zalo Option */}
                <button
                  type="button"
                  onClick={handleShareZalo}
                  className="flex flex-col items-start p-3 bg-white hover:bg-brand-gold-light/20 border border-brand-border rounded-xs transition-all group text-left cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs mb-2 group-hover:scale-110 transition-transform">
                    Z
                  </div>
                  <span className="font-sans font-bold text-xs text-brand-text">Gửi qua Zalo</span>
                  <span className="text-[10px] text-brand-text-muted mt-0.5">Nhóm chat Lớp K8A1</span>
                </button>

                {/* Facebook Option */}
                <button
                  type="button"
                  onClick={handleShareFacebook}
                  className="flex flex-col items-start p-3 bg-white hover:bg-brand-gold-light/20 border border-brand-border rounded-xs transition-all group text-left cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs mb-2 group-hover:scale-110 transition-transform">
                    f
                  </div>
                  <span className="font-sans font-bold text-xs text-brand-text">Đăng Facebook</span>
                  <span className="text-[10px] text-brand-text-muted mt-0.5">Chia sẻ lên dòng thời gian</span>
                </button>
              </div>

              {/* Quick Link Copy Box */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-sans font-bold uppercase tracking-wider text-brand-text">
                  Đường dẫn liên kết ứng dụng:
                </label>
                <div className="flex items-center gap-1.5 bg-white border border-brand-border p-1.5 rounded-xs">
                  <input
                    type="text"
                    readOnly
                    value={getShareUrl()}
                    className="flex-1 text-xs text-brand-text font-mono bg-transparent outline-none px-1"
                  />
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-brand-text hover:bg-brand-gold text-white text-[10px] font-sans font-bold uppercase tracking-wider rounded-xs transition-colors cursor-pointer"
                  >
                    {copiedLink ? <Check className="w-3 h-3 text-emerald-300" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedLink ? 'Đã sao chép' : 'Sao chép'}</span>
                  </button>
                </div>
              </div>

              {/* Full Invitation Content Copier */}
              <div className="p-3 bg-white border border-brand-border rounded-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-brand-gold flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Mẫu tin nhắn gửi nhóm lớp
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyFullInvitation}
                    className="text-[10px] font-sans font-bold text-brand-text hover:text-brand-gold flex items-center gap-1 cursor-pointer"
                  >
                    {copiedMessage ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedMessage ? 'Đã sao chép!' : 'Sao chép mẫu'}</span>
                  </button>
                </div>
                <p className="text-[11px] text-brand-text font-serif italic line-clamp-3 bg-[#FAF9F6] p-2 rounded-xs border border-brand-border/40">
                  "🌸 THƯ MỜI HỘI NGỘ 20 NĂM LỚP K8A1 (2006 - 2026)... Thân mời các bạn về tham dự họp mặt từ sáng 27/09/2026 tại Crown Palace Thái Nguyên..."
                </p>
              </div>

              {/* QR Code toggle section */}
              <div className="border-t border-brand-border/60 pt-3">
                <button
                  type="button"
                  onClick={() => setShowQr(!showQr)}
                  className="flex items-center justify-between w-full text-left text-xs font-sans text-brand-text-muted hover:text-brand-text cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">
                    <QrCode className="w-3.5 h-3.5 text-brand-gold" />
                    <span>{showQr ? 'Ẩn mã QR' : 'Hiện mã QR để bạn bè quét camera / Zalo'}</span>
                  </span>
                  <span className="text-[10px] uppercase tracking-wider text-brand-gold font-bold">
                    {showQr ? 'Thu gọn' : 'Mở QR'}
                  </span>
                </button>

                {showQr && (
                  <div className="mt-3 p-4 bg-white border border-brand-border rounded-xs flex flex-col items-center justify-center space-y-2 text-center">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(getShareUrl())}`}
                      alt="QR Code Hội ngộ 20 năm"
                      className="w-36 h-36 border border-brand-border/60 p-1 rounded-xs shadow-2xs"
                      referrerPolicy="no-referrer"
                    />
                    <p className="text-[10px] text-brand-text-muted font-sans">
                      Dùng Camera điện thoại hoặc Zalo để quét và mở trang web tức thì
                    </p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-1.5 bg-brand-text text-white text-xs font-sans font-bold uppercase tracking-wider rounded-xs hover:bg-brand-gold transition-colors cursor-pointer"
                >
                  Hoàn tất
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
