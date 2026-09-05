import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  CheckCircle2,
  Heart,
  Sparkles,
  X,
  Bell,
  BellOff,
  ChevronRight,
  Clock
} from 'lucide-react';
import { RsvpData, WishData, ActivityToast } from '../types';

interface ActivityToastManagerProps {
  rsvpList: RsvpData[];
  wishesList: WishData[];
  latestAction?: ActivityToast | null;
  onClearLatestAction?: () => void;
}

/**
 * Định dạng thời gian thực tế, trung thực (tránh fake "Vừa xong" hay "X phút trước" gây hiểu nhầm)
 */
export function formatActivityTime(rawDate?: string): { timeAgo: string; isRecent: boolean } {
  if (!rawDate) return { timeAgo: 'Gần đây', isRecent: false };

  const str = String(rawDate).trim();
  if (!str) return { timeAgo: 'Gần đây', isRecent: false };

  // Nếu dữ liệu gốc đã là định dạng chữ tương đối hợp lệ
  if (str === 'Vừa xong') return { timeAgo: 'Vừa xong', isRecent: true };
  if (str === 'Hôm nay') return { timeAgo: 'Hôm nay', isRecent: false };
  if (str === 'Hôm qua') return { timeAgo: 'Hôm qua', isRecent: false };
  if (str.endsWith('trước')) return { timeAgo: str, isRecent: str.includes('phút') };

  let date: Date | null = null;

  // Dạng DD/MM/YYYY HH:mm hoặc DD/MM/YYYY
  const dmyMatch = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{2}))?/);
  if (dmyMatch) {
    const [, d, m, y, h, min] = dmyMatch;
    date = new Date(Number(y), Number(m) - 1, Number(d), Number(h || 0), Number(min || 0));
  } else {
    // Dạng ISO YYYY-MM-DD
    const parsed = new Date(str);
    if (!isNaN(parsed.getTime())) {
      date = parsed;
    }
  }

  if (!date || isNaN(date.getTime())) {
    return { timeAgo: str, isRecent: false };
  }

  const now = Date.now();
  const diffSec = Math.floor((now - date.getTime()) / 1000);

  // Dưới 2 phút (thao tác trực tiếp vừa diễn ra)
  if (diffSec < 120) {
    return { timeAgo: 'Vừa xong', isRecent: true };
  }
  // Dưới 60 phút
  if (diffSec < 3600) {
    const mins = Math.max(1, Math.floor(diffSec / 60));
    return { timeAgo: `${mins} phút trước`, isRecent: mins <= 5 };
  }
  // Dưới 24 giờ
  if (diffSec < 86400) {
    const hours = Math.floor(diffSec / 3600);
    return { timeAgo: `${hours} giờ trước`, isRecent: false };
  }
  // Dưới 48 giờ
  if (diffSec < 172800) {
    return { timeAgo: 'Hôm qua', isRecent: false };
  }
  // Dưới 7 ngày
  if (diffSec < 86400 * 7) {
    const days = Math.floor(diffSec / 86400);
    return { timeAgo: `${days} ngày trước`, isRecent: false };
  }

  // Quá 7 ngày: hiển thị ngày thực tế DD/MM/YYYY
  const pad = (n: number) => (n < 10 ? '0' + n : String(n));
  return {
    timeAgo: `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`,
    isRecent: false
  };
}

/**
 * Trích xuất điểm thời gian để sắp xếp các hoạt động thực tế mới nhất
 */
function parseTimeScore(rawDate?: string): number {
  if (!rawDate) return 0;
  const str = String(rawDate).trim();
  if (str === 'Vừa xong' || str === 'Hôm nay') return Date.now();
  if (str === 'Hôm qua') return Date.now() - 86400000;
  const matchMins = str.match(/(\d+)\s*phút\s*trước/);
  if (matchMins) return Date.now() - Number(matchMins[1]) * 60000;
  const matchDays = str.match(/(\d+)\s*ngày\s*trước/);
  if (matchDays) return Date.now() - Number(matchDays[1]) * 86400000;

  const dmy = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{2}))?/);
  if (dmy) {
    const [, d, m, y, h, min] = dmy;
    return new Date(Number(y), Number(m) - 1, Number(d), Number(h || 0), Number(min || 0)).getTime();
  }
  const parsed = new Date(str).getTime();
  return isNaN(parsed) ? 0 : parsed;
}

export default function ActivityToastManager({
  rsvpList,
  wishesList,
  latestAction,
  onClearLatestAction
}: ActivityToastManagerProps) {
  const [currentToast, setCurrentToast] = useState<ActivityToast | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(() => {
    try {
      return localStorage.getItem('k8a1_activity_toast_muted') === 'true';
    } catch {
      return false;
    }
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const currentIndexRef = useRef(0);
  const isPausedRef = useRef(false);

  // Tạo danh sách hoạt động HOÀN TOÀN TỪ DỮ LIỆU THẬT CỦA LỚP K8A1 (loại bỏ hoàn toàn seed hardcode)
  const activityPool = useMemo((): ActivityToast[] => {
    const poolWithTime: { toast: ActivityToast; timeScore: number }[] = [];

    // 1. Phản hồi điểm danh thực tế từ rsvpList
    rsvpList.forEach((item, index) => {
      if (item.status === 'yes' && item.fullName && item.fullName.trim()) {
        const rawTime = item.submittedAt || item.fundPaidAt;
        const timeInfo = formatActivityTime(rawTime);
        const actionText = item.message && item.message.trim()
          ? `xác nhận tham dự: "${item.message.trim().slice(0, 45)}${item.message.trim().length > 45 ? '...' : ''}"`
          : 'đã xác nhận tham gia ngày hội ngộ 20 năm K8A1!';

        poolWithTime.push({
          toast: {
            id: `real-rsvp-${item.id || index}-${item.fullName}`,
            type: 'rsvp',
            author: item.fullName.trim(),
            className: item.className || 'K8A1',
            text: actionText,
            timeAgo: timeInfo.timeAgo,
            isNew: timeInfo.isRecent
          },
          timeScore: parseTimeScore(rawTime) || (rsvpList.length - index)
        });
      }
    });

    // 2. Lời chúc thực tế từ wishesList
    wishesList.forEach((wish, index) => {
      if (wish.fullName && wish.fullName.trim() && wish.message && wish.message.trim()) {
        const rawTime = wish.submittedAt;
        const timeInfo = formatActivityTime(rawTime);

        poolWithTime.push({
          toast: {
            id: `real-wish-${wish.id || index}-${wish.fullName}`,
            type: 'wish',
            author: wish.fullName.trim(),
            className: wish.className || 'Lớp K8A1',
            text: `gửi lời chúc: "${wish.message.trim().slice(0, 50)}${wish.message.trim().length > 50 ? '...' : ''}"`,
            timeAgo: timeInfo.timeAgo,
            isNew: timeInfo.isRecent
          },
          timeScore: parseTimeScore(rawTime) || (wishesList.length - index)
        });
      }
    });

    // Sắp xếp các hoạt động mới nhất lên trước
    poolWithTime.sort((a, b) => b.timeScore - a.timeScore);

    // Lấy tối đa 8 hoạt động mới nhất
    return poolWithTime.slice(0, 8).map(p => p.toast);
  }, [rsvpList, wishesList]);

  // Xử lý thông báo tức thời khi người dùng vừa thao tác (gửi RSVP hoặc gửi lời chúc)
  useEffect(() => {
    if (latestAction && !isMuted) {
      if (timerRef.current) clearTimeout(timerRef.current);
      setCurrentToast(latestAction);

      // Tự động đóng sau 6.5 giây
      timerRef.current = setTimeout(() => {
        setCurrentToast(null);
        if (onClearLatestAction) onClearLatestAction();
      }, 6500);
    }
  }, [latestAction, isMuted, onClearLatestAction]);

  // Xoay tua hiển thị thông tin thực tế nhẹ nhàng, trung thực
  useEffect(() => {
    if (isMuted || activityPool.length === 0) return;

    // Chờ 8 giây sau khi tải trang mới hiển thị thông báo đầu tiên
    const initialTimer = setTimeout(() => {
      if (!currentToast && !isPausedRef.current && activityPool.length > 0) {
        const first = activityPool[currentIndexRef.current % activityPool.length];
        currentIndexRef.current += 1;
        setCurrentToast(first);

        timerRef.current = setTimeout(() => {
          setCurrentToast(null);
        }, 5000);
      }
    }, 8000);

    // Chu kỳ xoay tua 26 giây một lần (nhẹ nhàng, không dồn dập)
    const interval = setInterval(() => {
      if (isPausedRef.current) return;
      if (!currentToast && activityPool.length > 0) {
        const nextToast = activityPool[currentIndexRef.current % activityPool.length];
        currentIndexRef.current += 1;
        setCurrentToast(nextToast);

        timerRef.current = setTimeout(() => {
          setCurrentToast(null);
        }, 5000);
      }
    }, 26000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isMuted, currentToast, activityPool]);

  // Bật / tắt thông báo và lưu trạng thái vào localStorage
  const handleToggleMute = () => {
    setIsMuted(prev => {
      const next = !prev;
      try {
        localStorage.setItem('k8a1_activity_toast_muted', String(next));
      } catch {}
      if (next) {
        setCurrentToast(null);
        if (timerRef.current) clearTimeout(timerRef.current);
      }
      return next;
    });
  };

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentToast(null);
    if (timerRef.current) clearTimeout(timerRef.current);
    // Khi người dùng bấm đóng X, tạm dừng hiển thị trong 60 giây để tránh làm phiền
    isPausedRef.current = true;
    setTimeout(() => {
      isPausedRef.current = false;
    }, 60000);
  };

  const handleToastClick = () => {
    if (!currentToast) return;
    setCurrentToast(null);
    
    // Cuộn mượt đến phân vùng Điểm danh
    const el = document.getElementById('diem-danh') || document.getElementById('attendees');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Không hiển thị gì nếu không có hoạt động nào và không có thông báo hiện hành
  if (activityPool.length === 0 && !currentToast) {
    return null;
  }

  return (
    <div
      id="live-activity-container"
      className="fixed left-3 sm:left-5 bottom-4 sm:bottom-6 z-40 max-w-[340px] sm:max-w-sm pointer-events-none"
    >
      <AnimatePresence>
        {currentToast && !isMuted && (
          <motion.div
            key={currentToast.id}
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

              {/* Nội dung thông báo */}
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
                    {currentToast.isNew ? (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-emerald-700 font-semibold">{currentToast.timeAgo}</span>
                      </>
                    ) : (
                      <>
                        <Clock className="w-2.5 h-2.5 text-brand-gold/80" />
                        <span>{currentToast.timeAgo}</span>
                      </>
                    )}
                  </span>
                  <span className="text-brand-gold font-medium group-hover:underline flex items-center gap-0.5">
                    {currentToast.type === 'rsvp' ? 'Xem danh sách' : 'Xem chi tiết'}
                    <ChevronRight className="w-2.5 h-2.5" />
                  </span>
                </div>
              </div>

              {/* Nút đóng thông báo */}
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

      {/* Nút nhỏ góc dưới để bật / tắt thông báo */}
      <div className="pointer-events-auto flex items-center gap-1.5 mt-1.5 pl-1 opacity-60 hover:opacity-100 transition-opacity">
        <button
          type="button"
          onClick={handleToggleMute}
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
