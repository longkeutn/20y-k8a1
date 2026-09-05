import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Clock, Calendar, Bell, Sparkles, MapPin, CheckCircle2 } from 'lucide-react';

interface CountdownTimerProps {
  targetDate?: string; // ISO format or date string
  eventDateText?: string;
  venueName?: string;
  eventTimeText?: string;
  eventTitle?: string;
}

export default function CountdownTimer({ 
  targetDate = '2026-09-27T08:30:00+07:00',
  eventDateText = '27/09/2026',
  venueName = 'Crown Palace Thái Nguyên',
  eventTimeText = 'Đón tiếp từ 08:30 sáng',
  eventTitle = 'Hội Ngộ 20 Năm Lớp K8A1 — THPT Thái Nguyên'
}: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false
  });

  const [calendarAdded, setCalendarAdded] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const targetTime = new Date(targetDate).getTime();
      const now = new Date().getTime();
      const difference = targetTime - now;

      if (difference <= 0) {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isExpired: true
        });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      setTimeLeft({
        days,
        hours,
        minutes,
        seconds,
        isExpired: false
      });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  // Google Calendar Link generator
  const createGoogleCalendarUrl = () => {
    const title = encodeURIComponent(`${eventTitle} (2006 - 2026)`);
    const details = encodeURIComponent(`Kỷ niệm 20 năm ngày ra trường Lớp K8A1 (Khóa 8), Trường THPT Thái Nguyên. Gặp lại bạn bè thân yêu thời áo trắng, ôn lại ký ức thanh xuân tại ${venueName}.`);
    const location = encodeURIComponent(venueName);
    // 2026-09-27T08:30:00 to 2026-09-27T15:30:00 in UTC format (VN is UTC+7 -> 08:30 is 01:30 UTC)
    const dates = "20260927T013000Z/20260927T083000Z";
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}&location=${location}`;
  };

  const handleAddToCalendar = () => {
    setCalendarAdded(true);
    setTimeout(() => setCalendarAdded(false), 4000);
  };

  // Format double digit
  const formatNumber = (num: number) => {
    return num < 10 ? `0${num}` : `${num}`;
  };

  return (
    <div id="countdown-module" className="bg-white border border-brand-border/80 rounded-sm p-4 sm:p-5 shadow-2xs">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3.5">
        {/* Left: Compact Event Date & Title */}
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.18em] font-sans font-bold text-brand-gold">
              <Clock className="w-3 h-3" />
              <span>Đếm ngược ngày hội ngộ</span>
            </span>
            <span className="text-[10px] text-brand-text-muted">•</span>
            <span className="text-[11px] font-sans font-semibold text-brand-text">
              {eventDateText}
            </span>
          </div>
          <p className="text-xs text-brand-text-muted font-serif italic">
            {venueName} • {eventTimeText}
          </p>
        </div>

        {/* Center / Right: Compact Digits Counter */}
        {timeLeft.isExpired ? (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-brand-gold/40 rounded text-xs font-serif font-bold text-brand-text">
            <Sparkles className="w-3.5 h-3.5 text-brand-gold" />
            <span>Ngày hội ngộ K8A1 đang diễn ra!</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Days */}
            <div className="bg-gradient-to-b from-[#FFFDF9] to-[#F7F2EA] border border-amber-300/60 rounded px-2.5 py-1.5 text-center min-w-[52px] sm:min-w-[58px] shadow-2xs">
              <span className="block text-lg sm:text-xl font-serif font-bold text-brand-text tabular-nums leading-tight">
                {timeLeft.days}
              </span>
              <span className="block text-[8px] sm:text-[9px] font-sans font-bold uppercase tracking-wider text-brand-text-muted">
                Ngày
              </span>
            </div>

            <span className="text-amber-600 font-serif font-bold text-xs">:</span>

            {/* Hours */}
            <div className="bg-gradient-to-b from-[#FFFDF9] to-[#F7F2EA] border border-amber-300/60 rounded px-2.5 py-1.5 text-center min-w-[52px] sm:min-w-[58px] shadow-2xs">
              <span className="block text-lg sm:text-xl font-serif font-bold text-brand-text tabular-nums leading-tight">
                {formatNumber(timeLeft.hours)}
              </span>
              <span className="block text-[8px] sm:text-[9px] font-sans font-bold uppercase tracking-wider text-brand-text-muted">
                Giờ
              </span>
            </div>

            <span className="text-amber-600 font-serif font-bold text-xs">:</span>

            {/* Minutes */}
            <div className="bg-gradient-to-b from-[#FFFDF9] to-[#F7F2EA] border border-amber-300/60 rounded px-2.5 py-1.5 text-center min-w-[52px] sm:min-w-[58px] shadow-2xs">
              <span className="block text-lg sm:text-xl font-serif font-bold text-brand-text tabular-nums leading-tight">
                {formatNumber(timeLeft.minutes)}
              </span>
              <span className="block text-[8px] sm:text-[9px] font-sans font-bold uppercase tracking-wider text-brand-text-muted">
                Phút
              </span>
            </div>

            <span className="text-amber-600 font-serif font-bold text-xs">:</span>

            {/* Seconds */}
            <div className="bg-gradient-to-b from-[#FFFDF9] to-[#F7F2EA] border border-amber-300/60 rounded px-2.5 py-1.5 text-center min-w-[52px] sm:min-w-[58px] shadow-2xs">
              <span className="block text-lg sm:text-xl font-serif font-bold text-amber-600 tabular-nums leading-tight animate-pulse">
                {formatNumber(timeLeft.seconds)}
              </span>
              <span className="block text-[8px] sm:text-[9px] font-sans font-bold uppercase tracking-wider text-brand-text-muted">
                Giây
              </span>
            </div>
          </div>
        )}

        {/* Add to Calendar Button */}
        <div className="shrink-0 self-start md:self-auto">
          <a
            href={createGoogleCalendarUrl()}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleAddToCalendar}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-brand-text hover:bg-brand-text/90 text-white text-[10px] font-sans font-bold uppercase tracking-wider transition-all cursor-pointer shadow-2xs"
            title="Thêm lịch nhắc vào Google Calendar"
          >
            {calendarAdded ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Đã mở Lịch</span>
              </>
            ) : (
              <>
                <Bell className="w-3 h-3 text-brand-gold-light" />
                <span>Lưu Lịch Nhắc</span>
              </>
            )}
          </a>
        </div>
      </div>
    </div>
  );
}
