import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  CheckCircle2,
  Heart,
  Sparkles,
  X,
  Users,
  MessageSquare,
  Bell,
  BellOff,
  ChevronRight
} from 'lucide-react';
import { RsvpData, WishData, ActivityToast } from '../types';

interface ActivityToastManagerProps {
  rsvpList: RsvpData[];
  wishesList: WishData[];
  latestAction?: ActivityToast | null;
  onClearLatestAction?: () => void;
}

// Fallback alumni activities for natural rotation
const SEED_ACTIVITIES: Omit<ActivityToast, 'id'>[] = [
  {
    type: 'rsvp',
    author: 'Nguyễn Tuấn Anh',
    className: 'Lớp 12A1',
    text: 'vừa xác nhận tham gia ngày hội ngộ 20 năm!',
    timeAgo: 'Vừa xong'
  },
  {
    type: 'wish',
    author: 'Lê Thu Trang',
    className: 'Lớp 12D',
    text: 'đã gửi lời chúc: "Rất mong chờ được gặp lại thầy cô và cả lớp!"',
    timeAgo: '2 phút trước'
  },
  {
    type: 'rsvp',
    author: 'Trần Hoàng Long',
    className: 'Lớp 12A3',
    text: 'vừa đăng ký tham dự cùng người thân.',
    timeAgo: '4 phút trước'
  },
  {
    type: 'wish',
    author: 'Phạm Minh Đức',
    className: 'Lớp 12A2',
    text: 'đã gửi lời chúc: "20 năm trôi qua như một giấc mơ, chúc chúng mình hội ngộ rực rỡ!"',
    timeAgo: '7 phút trước'
  },
  {
    type: 'rsvp',
    author: 'Vũ Hải Yến',
    className: 'Lớp 12B',
    text: 'vừa xác nhận sẽ có mặt đúng 17:30 ngày 18/10/2026.',
    timeAgo: '12 phút trước'
  }
];

export default function ActivityToastManager({
  rsvpList,
  wishesList,
  latestAction,
  onClearLatestAction
}: ActivityToastManagerProps) {
  const [currentToast, setCurrentToast] = useState<ActivityToast | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const currentIndexRef = useRef(0);

  // Generate dynamic pool of activities from real props and seeds
  const getActivityPool = useCallback((): ActivityToast[] => {
    const pool: ActivityToast[] = [];

    // Map real RSVPs
    rsvpList.slice(0, 8).forEach((item, index) => {
      if (item.status === 'yes') {
        pool.push({
          id: `rsvp-${item.id || index}-${item.fullName}`,
          type: 'rsvp',
          author: item.fullName,
          className: 'Cựu học sinh 2003-2006',
          text: item.message ? `xác nhận tham dự: "${item.message.slice(0, 45)}..."` : 'vừa xác nhận tham gia ngày họp lớp K8A1!',
          timeAgo: 'Vừa xong'
        });
      }
    });

    // Map real Wishes
    wishesList.slice(0, 8).forEach((wish, index) => {
      pool.push({
        id: `wish-${wish.id || index}-${wish.fullName}`,
        type: 'wish',
        author: wish.fullName,
        className: wish.className || 'Niên khóa 2003-2006',
        text: `gửi lời chúc: "${wish.message.slice(0, 50)}${wish.message.length > 50 ? '...' : ''}"`,
        timeAgo: 'Vừa xong'
      });
    });

    // Add seed activities
    SEED_ACTIVITIES.forEach((seed, index) => {
      pool.push({
        ...seed,
        id: `seed-${index}`
      });
    });

    return pool;
  }, [rsvpList, wishesList]);

  // Handle high-priority action trigger from user (RSVP or Wish just submitted)
  useEffect(() => {
    if (latestAction && !isMuted) {
      if (timerRef.current) clearTimeout(timerRef.current);
      setCurrentToast(latestAction);

      // Auto dismiss after 7 seconds
      timerRef.current = setTimeout(() => {
        setCurrentToast(null);
        if (onClearLatestAction) onClearLatestAction();
      }, 7000);
    }
  }, [latestAction, isMuted, onClearLatestAction]);

  // Periodically rotate activities to simulate lively activity
  useEffect(() => {
    if (isMuted) return;

    const interval = setInterval(() => {
      // If user hasn't triggered an immediate toast recently
      if (!currentToast) {
        const pool = getActivityPool();
        if (pool.length === 0) return;

        const nextToast = pool[currentIndexRef.current % pool.length];
        currentIndexRef.current += 1;

        setCurrentToast(nextToast);

        // Hide after 5.5 seconds
        timerRef.current = setTimeout(() => {
          setCurrentToast(null);
        }, 5500);
      }
    }, 14000);

    return () => {
      clearInterval(interval);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isMuted, currentToast, getActivityPool]);

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentToast(null);
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  const handleToastClick = () => {
    if (!currentToast) return;
    
    // Smooth scroll to relevant section
    if (currentToast.type === 'rsvp') {
      const el = document.getElementById('attendees') || document.getElementById('rsvp');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else {
      const el = document.getElementById('guestbook');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div
      id="live-activity-container"
      className="fixed left-3 sm:left-5 bottom-4 sm:bottom-6 z-40 max-w-[340px] sm:max-w-sm pointer-events-none"
    >
      <AnimatePresence>
        {currentToast && !isMuted && (
          <motion.div
            key={currentToast.id}
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            onClick={handleToastClick}
            className="pointer-events-auto bg-[#FAF8F5]/98 backdrop-blur-md border border-brand-gold/40 shadow-xl rounded-sm p-3.5 pr-3 cursor-pointer hover:border-brand-gold hover:shadow-2xl transition-all group relative overflow-hidden"
          >
            {/* Elegant top gold accent bar */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-brand-gold/20 via-brand-gold to-brand-gold/20" />

            <div className="flex items-start gap-3">
              {/* Badge Icon */}
              <div
                className={`w-9 h-9 shrink-0 rounded-full flex items-center justify-center border shadow-xs ${
                  currentToast.type === 'rsvp'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                    : 'bg-rose-50 border-rose-200 text-rose-600'
                }`}
              >
                {currentToast.type === 'rsvp' ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <Heart className="w-4 h-4 fill-rose-500/20 text-rose-600" />
                )}
              </div>

              {/* Toast Content */}
              <div className="flex-1 min-w-0 pr-4">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-serif font-bold text-xs text-brand-text truncate">
                    {currentToast.author}
                  </span>
                  {currentToast.className && (
                    <span className="text-[9px] font-sans font-medium px-1.5 py-0.2 bg-brand-gold-light/60 text-brand-gold-dark border border-brand-gold/20 rounded-xs">
                      {currentToast.className}
                    </span>
                  )}
                  {currentToast.isNew && (
                    <span className="inline-flex items-center gap-0.5 text-[9px] font-sans font-bold text-emerald-700 bg-emerald-100/80 px-1.5 py-0.2 rounded-xs">
                      <Sparkles className="w-2.5 h-2.5" /> Mới
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-brand-text/90 font-serif leading-snug mt-0.5 line-clamp-2">
                  {currentToast.text}
                </p>

                <div className="flex items-center justify-between mt-1.5 pt-1 border-t border-brand-border/40 text-[9px] text-brand-text-muted font-sans">
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>{currentToast.timeAgo}</span>
                  </span>
                  <span className="text-brand-gold font-medium group-hover:underline flex items-center gap-0.5">
                    {currentToast.type === 'rsvp' ? 'Xem danh sách' : 'Xem lưu bút'}
                    <ChevronRight className="w-2.5 h-2.5" />
                  </span>
                </div>
              </div>

              {/* Close button */}
              <button
                type="button"
                onClick={handleDismiss}
                className="absolute top-2 right-2 p-1 text-brand-text-muted/60 hover:text-brand-text hover:bg-black/5 rounded-xs transition-colors cursor-pointer"
                title="Đóng thông báo"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Small floating mute/unmute toggle indicator */}
      <div className="pointer-events-auto flex items-center gap-1.5 mt-1.5 pl-1 opacity-60 hover:opacity-100 transition-opacity">
        <button
          type="button"
          onClick={() => setIsMuted(!isMuted)}
          className="inline-flex items-center gap-1 text-[9px] font-sans font-medium text-brand-text-muted bg-white/90 backdrop-blur-xs border border-brand-border px-2 py-0.5 rounded-xs shadow-2xs hover:text-brand-text cursor-pointer"
          title={isMuted ? 'Bật lại thông báo hoạt động' : 'Tạm tắt thông báo hoạt động'}
        >
          {isMuted ? (
            <>
              <BellOff className="w-2.5 h-2.5 text-rose-500" />
              <span>Đã tắt thông báo</span>
            </>
          ) : (
            <>
              <Bell className="w-2.5 h-2.5 text-brand-gold" />
              <span>Thông báo trực tiếp</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
