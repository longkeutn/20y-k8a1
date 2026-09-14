import React, { useState, useMemo, useRef } from 'react';
import { 
  Newspaper, 
  Calendar, 
  User, 
  Pin, 
  Heart, 
  Megaphone, 
  ChevronLeft, 
  ChevronRight,
  Flame,
  ArrowRight
} from 'lucide-react';
import { Announcement, AnnouncementCategory, EventConfig } from '../types';
import AnnouncementDetailModal from './AnnouncementDetailModal';

interface ClassNewsFeedProps {
  announcements: Announcement[];
  eventConfig?: EventConfig;
  onNavigateAction?: (targetId: string) => void;
  onSelectAnnouncement?: (item: Announcement) => void;
}

const DARK_CATEGORY_STYLES: Record<AnnouncementCategory, { label: string; badgeClass: string; icon: string }> = {
  urgent: { label: 'Khẩn Cấp', badgeClass: 'bg-rose-500/25 text-rose-300 border-rose-500/50', icon: '🔥' },
  schedule: { label: 'Lịch Trình', badgeClass: 'bg-amber-500/25 text-amber-300 border-amber-500/50', icon: '📋' },
  shirts: { label: 'Áo Lớp', badgeClass: 'bg-sky-500/25 text-sky-300 border-sky-500/50', icon: '👕' },
  fund: { label: 'Quỹ Lớp', badgeClass: 'bg-emerald-500/25 text-emerald-300 border-emerald-500/50', icon: '💰' },
  activity: { label: 'Hoạt Động', badgeClass: 'bg-purple-500/25 text-purple-300 border-purple-500/50', icon: '📸' },
  poll: { label: 'Khảo Sát', badgeClass: 'bg-indigo-500/25 text-indigo-300 border-indigo-500/50', icon: '🗳️' }
};

export default function ClassNewsFeed({
  announcements,
  eventConfig,
  onNavigateAction,
  onSelectAnnouncement
}: ClassNewsFeedProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [internalSelectedAnnouncement, setInternalSelectedAnnouncement] = useState<Announcement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleCardClick = (item: Announcement) => {
    if (onSelectAnnouncement) {
      onSelectAnnouncement(item);
    } else {
      setInternalSelectedAnnouncement(item);
    }
  };

  const handleScroll = (dir: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 340;
      scrollContainerRef.current.scrollBy({
        left: dir === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // Lọc bài viết theo danh mục và sắp xếp tin ghim lên đầu
  const filteredList = useMemo(() => {
    if (!announcements || announcements.length === 0) return [];
    
    const sorted = [...announcements].sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return (b.createdAt || '').localeCompare(a.createdAt || '');
    });

    if (selectedCategory === 'all') return sorted;
    return sorted.filter(a => a.category === selectedCategory);
  }, [announcements, selectedCategory]);

  // Tin tiêu điểm ghim mới nhất (để hiển thị trên dải ticker)
  const pinnedItem = useMemo(() => {
    return (announcements || []).find(a => a.isPinned);
  }, [announcements]);

  const categories: { id: string; label: string; icon: string }[] = [
    { id: 'all', label: 'Tất Cả', icon: '✨' },
    { id: 'urgent', label: 'Khẩn Cấp', icon: '🔥' },
    { id: 'schedule', label: 'Lịch Trình', icon: '📋' },
    { id: 'shirts', label: 'Áo Lớp', icon: '👕' },
    { id: 'fund', label: 'Quỹ Lớp', icon: '💰' },
    { id: 'activity', label: 'Ký Sự', icon: '📸' }
  ];

  // Kiểm tra cờ bật/tắt toàn cục sau khi tất cả hooks đã thực thi
  if (eventConfig && eventConfig.showAnnouncements === false) {
    return null;
  }

  return (
    /* 🌟 KHỐI FULL-WIDTH MÀN HÌNH (EDGE-TO-EDGE NHƯ HERO BANNER) */
    <section 
      id="ban-tin" 
      className="w-screen relative left-1/2 -translate-x-1/2 overflow-hidden scroll-mt-20 my-3 sm:my-5 bg-[#0B132B]/98 text-white border-y-2 border-amber-500/40 shadow-2xl backdrop-blur-md"
    >
      {/* DẢI VIỀN TRANG TRÍ VÀNG KIM ĐỈNH KHỐI TRẢI DÀI MÀN HÌNH */}
      <div className="h-1 w-full bg-gradient-to-r from-amber-700 via-amber-300 to-amber-700 opacity-90" />

      {/* CONTAINER NỘI DUNG RỘNG THOÁNG CĂN GIỮA (MAX-W-7XL) */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-3.5 space-y-2.5">
        
        {/* HÀNG 1: HEADER ĐIỀU KHIỂN & BỘ LỌC MINI TÍCH HỢP HÀNG NGANG */}
        <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2.5">
          
          {/* TIÊU ĐỀ & HUY HIỆU PHÁT SÓNG TIN TỨC */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="relative flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 shadow-md text-slate-950">
              <Megaphone className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-950 shrink-0" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-[#0B132B] animate-pulse" />
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="font-serif font-bold text-amber-200 text-xs sm:text-sm tracking-wide uppercase">
                  Bản Tin K8A1
                </h2>
                <span className="hidden xs:inline-block px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  BLL Official
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-sans hidden sm:block">
                Kênh phát ngôn chính thức • Chống trôi bài Zalo
              </p>
            </div>
          </div>

          {/* CÁC CHIP LỌC DANH MỤC THU GỌN THEO CHIỀU NGANG */}
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-0.5 max-w-[55%] sm:max-w-none">
            {categories.map((cat) => {
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`inline-flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-lg text-[11px] font-sans font-semibold transition cursor-pointer whitespace-nowrap shrink-0 border ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 font-bold border-amber-400 shadow-xs scale-102'
                      : 'bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border-white/10'
                  }`}
                >
                  <span className="text-[10px]">{cat.icon}</span>
                  <span className="hidden md:inline">{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* BỘ NÚT MŨI TÊN ĐIỀU HƯỚNG TRƯỢT NGANG */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => handleScroll('left')}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white/5 hover:bg-amber-500/20 text-slate-300 hover:text-amber-300 border border-white/10 hover:border-amber-400/50 flex items-center justify-center transition cursor-pointer"
              title="Xem tin trước"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => handleScroll('right')}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white/5 hover:bg-amber-500/20 text-slate-300 hover:text-amber-300 border border-white/10 hover:border-amber-400/50 flex items-center justify-center transition cursor-pointer"
              title="Xem tin tiếp theo"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* HÀNG 2: DẢI TICKER TIN GHIM NÓNG (NẾU CÓ TIN GHIM) */}
        {pinnedItem && selectedCategory === 'all' && (
          <div 
            onClick={() => handleCardClick(pinnedItem)}
            className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-rose-950/60 via-amber-950/40 to-slate-900 border border-amber-500/30 flex items-center justify-between gap-2 cursor-pointer hover:border-amber-400/70 transition group"
          >
            <div className="flex items-center gap-2 truncate text-xs">
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-rose-600/80 text-white font-sans font-bold text-[10px] shrink-0 uppercase tracking-wider animate-pulse">
                <Flame className="w-3 h-3 text-amber-200" />
                <span>Tiêu Điểm</span>
              </span>
              <span className="text-amber-100/90 font-sans truncate font-medium group-hover:text-amber-300 transition">
                {pinnedItem.title}
              </span>
            </div>

            <span className="inline-flex items-center gap-1 text-[11px] text-amber-300 font-bold shrink-0 group-hover:translate-x-0.5 transition font-sans">
              <span className="hidden sm:inline">Chi tiết</span>
              <ArrowRight className="w-3.5 h-3.5 text-amber-300" />
            </span>
          </div>
        )}

        {/* HÀNG 3: BĂNG CHUYỀN THẺ TIN NẰM NGANG (HORIZONTAL COMPACT STRIP) */}
        {filteredList.length === 0 ? (
          <div className="text-center py-6 px-3 rounded-xl border border-dashed border-white/15 bg-white/5">
            <Newspaper className="w-6 h-6 text-amber-400 mx-auto mb-1 opacity-60" />
            <p className="text-xs text-slate-300">Không có bản tin nào trong danh mục này</p>
            <button 
              type="button" 
              onClick={() => setSelectedCategory('all')} 
              className="mt-1.5 text-[11px] text-amber-400 font-bold hover:underline cursor-pointer"
            >
              Quay lại xem tất cả
            </button>
          </div>
        ) : (
          <div 
            ref={scrollContainerRef}
            className="flex gap-2.5 sm:gap-3.5 overflow-x-auto pb-1 scrollbar-none snap-x scroll-smooth"
          >
            {filteredList.map((item) => {
              const catInfo = DARK_CATEGORY_STYLES[item.category] || DARK_CATEGORY_STYLES.schedule;
              return (
                <article
                  key={item.id}
                  onClick={() => handleCardClick(item)}
                  className="w-[280px] sm:w-[320px] md:w-[340px] h-[100px] sm:h-[108px] shrink-0 snap-start bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 hover:border-amber-400/60 rounded-xl p-2.5 transition-all duration-200 cursor-pointer flex gap-2.5 group relative overflow-hidden select-none hover:shadow-lg hover:-translate-y-0.5"
                >
                  {/* CỘT TRÁI: ẢNH THUMBNAIL HOẶC BIỂU TƯỢNG DANH MỤC */}
                  <div className="w-20 sm:w-22 h-full rounded-lg overflow-hidden shrink-0 border border-white/10 bg-slate-900/60 relative flex items-center justify-center">
                    {item.imageUrl ? (
                      <img 
                        src={item.imageUrl} 
                        alt={item.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        onError={(e: any) => { e.target.style.display = 'none'; }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-amber-950/40 to-slate-900 flex flex-col items-center justify-center text-amber-300">
                        <span className="text-xl">{catInfo.icon}</span>
                        <span className="text-[9px] font-bold text-amber-200/70 mt-0.5 uppercase tracking-wider">{catInfo.label.slice(0, 8)}</span>
                      </div>
                    )}
                    {item.isPinned && (
                      <span className="absolute top-1 left-1 w-4 h-4 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shadow-xs">
                        <Pin className="w-2.5 h-2.5 fill-slate-950" />
                      </span>
                    )}
                  </div>

                  {/* CỘT PHẢI: CHI TIẾT BẢN TIN */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                    
                    {/* DANH MỤC & NGÀY ĐĂNG */}
                    <div className="flex items-center justify-between gap-1">
                      <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[10px] font-sans font-bold border ${catInfo.badgeClass}`}>
                        <span>{catInfo.icon}</span>
                        <span className="truncate max-w-[85px]">{catInfo.label}</span>
                      </span>

                      <span className="text-[10px] text-slate-400 font-mono shrink-0">
                        {item.createdAt.split(' ')[0]}
                      </span>
                    </div>

                    {/* TIÊU ĐỀ BÀI VIẾT (2 DÒNG) */}
                    <h3 className="text-xs sm:text-[13px] font-semibold text-slate-100 group-hover:text-amber-300 transition line-clamp-2 leading-snug">
                      {item.title}
                    </h3>

                    {/* TÁC GIẢ & LƯỢT THÍCH */}
                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-white/5 font-sans">
                      <span className="truncate max-w-[120px] text-slate-300">
                        {item.author || 'Ban Liên Lạc'}
                      </span>

                      <span className="inline-flex items-center gap-0.5 text-rose-400 font-mono shrink-0">
                        <Heart className="w-2.5 h-2.5 fill-rose-400" />
                        <span>{item.likesCount || 0}</span>
                      </span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* DẢI VIỀN MỜ DƯỚI KHỐI TRẢI DÀI MÀN HÌNH */}
      <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />

      {/* MODAL ĐỌC BÀI VIẾT CHI TIẾT (Fallback nếu không có modal toàn cục) */}
      {!onSelectAnnouncement && (
        <AnnouncementDetailModal
          isOpen={!!internalSelectedAnnouncement}
          onClose={() => setInternalSelectedAnnouncement(null)}
          announcement={internalSelectedAnnouncement}
          onNavigateAction={onNavigateAction}
        />
      )}
    </section>
  );
}
