import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Bell, X, ArrowRight, Calendar, Pin, Sparkles, Check } from 'lucide-react';
import { Announcement, EventConfig } from '../types';
import { CATEGORY_STYLES } from './AnnouncementDetailModal';

interface NotificationBellProps {
  announcements: Announcement[];
  eventConfig?: EventConfig;
  onSelectAnnouncement: (item: Announcement) => void;
  onScrollToNewsFeed: () => void;
}

export default function NotificationBell({
  announcements,
  eventConfig,
  onSelectAnnouncement,
  onScrollToNewsFeed
}: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Đọc mốc thời gian lần cuối người dùng xem thông báo
  const [lastReadTimestamp, setLastReadTimestamp] = useState<number>(() => {
    try {
      const val = localStorage.getItem('k8a1_announcements_last_read_ts');
      return val ? parseInt(val, 10) : 0;
    } catch {
      return 0;
    }
  });

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Lọc chỉ các bản tin đã công khai
  const publishedAnnouncements = useMemo(() => {
    return (announcements || []).filter(a => a.status === 'published' || !a.status);
  }, [announcements]);

  // Tính số lượng tin chưa đọc
  const unreadCount = useMemo(() => {
    if (publishedAnnouncements.length === 0) return 0;
    if (lastReadTimestamp === 0) return Math.min(3, publishedAnnouncements.length); // Lần đầu vào web coi như có tin mới
    
    // Đếm các bài viết có timestamp mới hơn lastReadTimestamp
    return publishedAnnouncements.filter(item => {
      // Giả lập thời gian từ createdAt
      const ts = new Date().getTime(); // mặc định
      return ts > lastReadTimestamp;
    }).length;
  }, [publishedAnnouncements, lastReadTimestamp]);

  const handleToggle = () => {
    const nextState = !isOpen;
    setIsOpen(nextState);
    if (nextState) {
      // Khi mở ra xem -> Đánh dấu là đã đọc
      const now = Date.now();
      setLastReadTimestamp(now);
      try {
        localStorage.setItem('k8a1_announcements_last_read_ts', now.toString());
      } catch {}
    }
  };

  const sortedList = useMemo(() => {
    if (publishedAnnouncements.length === 0) return [];
    return [...publishedAnnouncements].sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return (b.createdAt || '').localeCompare(a.createdAt || '');
    }).slice(0, 5); // Hiển thị 5 tin mới nhất
  }, [publishedAnnouncements]);

  // Kiểm tra cờ Bật/Tắt hiển thị sau khi toàn bộ hooks đã chạy đầy đủ
  if (eventConfig && eventConfig.showAnnouncements === false) {
    return null;
  }

  return (
    <div ref={dropdownRef} className="relative shrink-0">
      {/* NÚT QUẢ CHUÔNG TRÊN NAVBAR */}
      <button
        type="button"
        onClick={handleToggle}
        className={`relative p-1.5 sm:p-2 rounded-full transition-all duration-200 cursor-pointer flex items-center justify-center ${
          isOpen
            ? 'bg-amber-500/30 text-amber-200 border border-amber-400/60 shadow-inner'
            : 'text-slate-300 hover:text-amber-300 hover:bg-white/10'
        }`}
        title="Bản tin & Thông báo chính thức K8A1"
      >
        <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-300" />
        
        {/* CHẤM ĐỎ ĐẾM SỐ TIN MỚI */}
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-rose-600 text-white font-mono text-[9px] font-bold items-center justify-center shadow-xs">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          </span>
        )}
      </button>

      {/* DROPDOWN POPUP DANH SÁCH BẢN TIN NHANH */}
      {isOpen && (
        <>
          {/* Lớp nền mờ trên Mobile để bấm ra ngoài đóng nhanh */}
          <div 
            className="fixed inset-0 bg-black/40 z-[95] sm:hidden backdrop-blur-xs" 
            onClick={() => setIsOpen(false)} 
          />

          <div className="fixed inset-x-3 top-[calc(3.5rem+env(safe-area-inset-top,0px)+8px)] max-w-sm sm:max-w-md mx-auto sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:mt-2 sm:w-96 bg-[#FFFDF9] border-2 border-amber-300/90 rounded-2xl shadow-2xl overflow-hidden z-[100] text-slate-800 animate-in fade-in zoom-in-95 duration-200">
          
          {/* HEADER DROPDOWN */}
          <div className="px-4 py-3 bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 text-white flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-200" />
              <span className="font-serif font-bold text-sm">Bản Tin & Thông Báo K8A1</span>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 text-white/80 hover:text-white rounded-full hover:bg-white/10 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* DANH SÁCH 5 BẢN TIN GẦN NHẤT */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-amber-100/80 p-1">
            {sortedList.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500 font-sans">
                Hiện chưa có thông báo mới nào
              </div>
            ) : (
              sortedList.map((item) => {
                const catInfo = CATEGORY_STYLES[item.category] || CATEGORY_STYLES.schedule;
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      setIsOpen(false);
                      onSelectAnnouncement(item);
                    }}
                    className="p-3 hover:bg-amber-50/80 transition cursor-pointer rounded-xl space-y-1.5 group"
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.2 rounded-full text-[10px] font-sans font-bold border ${catInfo.badgeClass}`}>
                        <span>{catInfo.icon}</span>
                        <span>{catInfo.label}</span>
                      </span>

                      {item.isPinned && (
                        <span className="inline-flex items-center gap-0.5 text-[9.5px] font-bold text-amber-900 bg-amber-100 px-1.5 py-0.2 rounded border border-amber-300">
                          <Pin className="w-2.5 h-2.5 text-amber-700 fill-amber-700" />
                          <span>Ghim</span>
                        </span>
                      )}
                    </div>

                    <h4 className="text-xs sm:text-sm font-serif font-bold text-slate-900 group-hover:text-amber-800 transition line-clamp-2 leading-snug">
                      {item.title}
                    </h4>

                    <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed font-sans">
                      {item.summary}
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-sans pt-1">
                      <span>{item.author || 'BLL K8A1'}</span>
                      <span className="font-mono">{item.createdAt}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* FOOTER DROPDOWN */}
          <div className="p-2.5 bg-amber-50/60 border-t border-amber-200/80 flex items-center justify-between text-xs font-sans">
            <span className="text-[11px] text-slate-500 italic">Kênh chính thống duy nhất</span>
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onScrollToNewsFeed();
              }}
              className="inline-flex items-center gap-1 text-xs font-bold text-amber-800 hover:text-amber-950 cursor-pointer group"
            >
              <span>Xem tất cả bài viết</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
            </button>
          </div>
        </div>
      </>
    )}
    </div>
  );
}
