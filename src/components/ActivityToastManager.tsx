import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  CheckCircle2,
  Heart,
  Sparkles,
  X,
  ChevronRight
} from 'lucide-react';
import { ActivityToast, RsvpData, WishData } from '../types';

interface ActivityToastManagerProps {
  rsvpList?: RsvpData[];
  wishesList?: WishData[];
  latestAction?: ActivityToast | null;
  onClearLatestAction?: () => void;
}

/**
 * Quản lý thông báo trực tiếp (Live Action Notification):
 * - TUYỆT ĐỐI KHÔNG tự động xoay tua hay hiển thị thông báo dạng popup từ dữ liệu cũ / dữ liệu mẫu khi người dùng lướt web.
 * - CHỈ hiển thị duy nhất khi có hành động thực tế phát sinh trong phiên truy cập hiện tại (latestAction: khi người dùng vừa gửi điểm danh hoặc lời chúc).
 * - Sau 5 giây tự động ẩn hoàn toàn, không hiển thị bất kỳ nút trôi nổi nào ở góc màn hình.
 */
export default function ActivityToastManager({
  latestAction,
  onClearLatestAction
}: ActivityToastManagerProps) {
  // Tự động đóng sau 5 giây khi có hành động thực tế phát sinh
  useEffect(() => {
    if (latestAction) {
      const timer = setTimeout(() => {
        if (onClearLatestAction) onClearLatestAction();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [latestAction, onClearLatestAction]);

  const handleToastClick = () => {
    if (onClearLatestAction) onClearLatestAction();
    const el = document.getElementById('diem-danh') || document.getElementById('attendees');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Nếu không có hành động nào vừa diễn ra, ẩn hoàn toàn (không hiển thị popup, không hiển thị nút cố định)
  if (!latestAction) {
    return null;
  }

  return (
    <div
      id="live-activity-container"
      className="fixed left-3 sm:left-5 bottom-4 sm:bottom-6 z-40 max-w-[340px] sm:max-w-sm pointer-events-none"
    >
      <AnimatePresence>
        {latestAction && (
          <motion.div
            key={latestAction.id}
            initial={{ opacity: 0, y: 25, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            onClick={handleToastClick}
            className="pointer-events-auto bg-[#FAF8F5]/98 backdrop-blur-md border border-brand-gold/40 shadow-xl rounded-sm p-3.5 pr-3 cursor-pointer hover:border-brand-gold hover:shadow-2xl transition-all group relative overflow-hidden"
          >
            {/* Thanh viền chỉ vàng sang trọng phía trên */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-brand-gold/20 via-brand-gold to-brand-gold/20" />

            <div className="flex items-start gap-3">
              {/* Badge Icon */}
              <div
                className={`w-9 h-9 shrink-0 rounded-full flex items-center justify-center border shadow-xs ${
                  latestAction.type === 'rsvp'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                    : 'bg-rose-50 border-rose-200 text-rose-600'
                }`}
              >
                {latestAction.type === 'rsvp' ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <Heart className="w-4 h-4 fill-rose-500/20 text-rose-600" />
                )}
              </div>

              {/* Nội dung thông báo thực tế vừa phát sinh */}
              <div className="flex-1 min-w-0 pr-4">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-serif font-bold text-xs text-brand-text truncate">
                    {latestAction.author}
                  </span>
                  {latestAction.className && (
                    <span className="text-[9px] font-sans font-medium px-1.5 py-0.2 bg-brand-gold-light/60 text-brand-gold-dark border border-brand-gold/20 rounded-xs">
                      {latestAction.className}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-0.5 text-[9px] font-sans font-bold text-emerald-700 bg-emerald-100/80 px-1.5 py-0.2 rounded-xs">
                    <Sparkles className="w-2.5 h-2.5" /> Mới
                  </span>
                </div>

                <p className="text-[11px] text-brand-text/90 font-serif leading-snug mt-0.5 line-clamp-2">
                  {latestAction.text}
                </p>

                <div className="flex items-center justify-between mt-1.5 pt-1 border-t border-brand-border/40 text-[9px] text-brand-text-muted font-sans">
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-emerald-700 font-semibold">{latestAction.timeAgo || 'Vừa xong'}</span>
                  </span>
                  <span className="text-brand-gold font-medium group-hover:underline flex items-center gap-0.5">
                    {latestAction.type === 'rsvp' ? 'Xem danh sách' : 'Xem chi tiết'}
                    <ChevronRight className="w-2.5 h-2.5" />
                  </span>
                </div>
              </div>

              {/* Nút đóng thông báo */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onClearLatestAction) onClearLatestAction();
                }}
                className="absolute top-2 right-2 p-1 text-brand-text-muted/60 hover:text-brand-text hover:bg-black/5 rounded-xs transition-colors cursor-pointer"
                title="Đóng thông báo"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
