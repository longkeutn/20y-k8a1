import React, { useState, useMemo } from 'react';
import { 
  Newspaper, 
  Calendar, 
  User, 
  ArrowRight, 
  Pin, 
  Heart, 
  Filter, 
  Sparkles, 
  Megaphone,
  ChevronRight
} from 'lucide-react';
import { Announcement, AnnouncementCategory, EventConfig } from '../types';
import AnnouncementDetailModal, { CATEGORY_STYLES } from './AnnouncementDetailModal';

interface ClassNewsFeedProps {
  announcements: Announcement[];
  eventConfig?: EventConfig;
  onNavigateAction?: (targetId: string) => void;
  onSelectAnnouncement?: (item: Announcement) => void;
}

export default function ClassNewsFeed({
  announcements,
  eventConfig,
  onNavigateAction,
  onSelectAnnouncement
}: ClassNewsFeedProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [internalSelectedAnnouncement, setInternalSelectedAnnouncement] = useState<Announcement | null>(null);

  const handleCardClick = (item: Announcement) => {
    if (onSelectAnnouncement) {
      onSelectAnnouncement(item);
    } else {
      setInternalSelectedAnnouncement(item);
    }
  };

  // Kiểm tra cờ bật/tắt toàn cục
  if (eventConfig && eventConfig.showAnnouncements === false) {
    return null;
  }

  // Lọc bài viết theo danh mục
  const filteredList = useMemo(() => {
    if (!announcements || announcements.length === 0) return [];
    
    // Sắp xếp: Tin ghim lên đầu, sau đó đến ngày tạo mới nhất
    const sorted = [...announcements].sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return (b.createdAt || '').localeCompare(a.createdAt || '');
    });

    if (selectedCategory === 'all') return sorted;
    return sorted.filter(a => a.category === selectedCategory);
  }, [announcements, selectedCategory]);

  const categories: { id: string; label: string; icon: string }[] = [
    { id: 'all', label: 'Tất Cả', icon: '✨' },
    { id: 'urgent', label: 'Khẩn Cấp', icon: '🔥' },
    { id: 'schedule', label: 'Lịch Trình', icon: '📋' },
    { id: 'shirts', label: 'Áo Lớp', icon: '👕' },
    { id: 'fund', label: 'Quỹ Lớp', icon: '💰' },
    { id: 'activity', label: 'Ký Sự Ảnh', icon: '📸' }
  ];

  return (
    <section id="ban-tin" className="w-full max-w-5xl mx-auto px-3 sm:px-6 py-8 sm:py-12 scroll-mt-20">
      
      {/* HEADER KHỐI BẢN TIN VINTAGE GOLD */}
      <div className="text-center space-y-2.5 mb-6 sm:mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-400/40 text-amber-900 text-xs font-sans font-bold shadow-xs">
          <Megaphone className="w-3.5 h-3.5 text-amber-700 animate-bounce" />
          <span>KÊNH THÔNG TIN CHÍNH THỨC K8A1</span>
        </div>

        <h2 className="text-2xl sm:text-4xl font-serif font-black text-[#1E293B] tracking-tight">
          Bản Tin & Thông Báo Hoạt Động
        </h2>
        
        <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto font-sans">
          Cập nhật thông cáo chính thức, lịch trình di chuyển, tiến độ đặt áo và tình hình đóng góp quỹ lớp — Chống trôi tin 100%.
        </p>

        {/* ĐƯỜNG PHÂN CÁCH TRANG TRÍ VÀNG KIM */}
        <div className="flex items-center justify-center gap-2 pt-1 opacity-70">
          <div className="h-[1px] w-12 sm:w-20 bg-gradient-to-r from-transparent to-amber-500" />
          <span className="text-amber-600 text-xs">★ ★ ★</span>
          <div className="h-[1px] w-12 sm:w-20 bg-gradient-to-l from-transparent to-amber-500" />
        </div>
      </div>

      {/* THANH TAB LỌC DANH MỤC */}
      <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-2.5 mb-6 scrollbar-none justify-start sm:justify-center">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`inline-flex items-center gap-1 px-3 sm:px-4 py-1.5 rounded-full text-xs font-sans font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 border ${
                isActive
                  ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white border-amber-600 shadow-md scale-102'
                  : 'bg-white text-slate-700 hover:text-amber-900 hover:bg-amber-50 border-amber-200/80 shadow-xs'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* LƯỚI DANH SÁCH BÀI VIẾT BẢN TIN */}
      {filteredList.length === 0 ? (
        <div className="text-center py-12 px-4 rounded-2xl border-2 border-dashed border-amber-200 bg-white/60">
          <Newspaper className="w-10 h-10 text-amber-400 mx-auto mb-2 opacity-60" />
          <p className="text-sm font-sans font-semibold text-slate-600">Chưa có bài viết nào trong danh mục này</p>
          <button 
            type="button" 
            onClick={() => setSelectedCategory('all')} 
            className="mt-3 text-xs text-amber-700 font-bold hover:underline cursor-pointer"
          >
            Quay lại xem tất cả bài viết
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {filteredList.map((item) => {
            const catInfo = CATEGORY_STYLES[item.category] || CATEGORY_STYLES.schedule;
            return (
              <article
                key={item.id}
                onClick={() => handleCardClick(item)}
                className={`group relative bg-[#FFFDF9] rounded-2xl border-2 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col justify-between hover:shadow-xl hover:-translate-y-1 ${
                  item.isPinned 
                    ? 'border-amber-400/90 shadow-md ring-1 ring-amber-400/30' 
                    : 'border-amber-200/70 shadow-xs hover:border-amber-300'
                }`}
              >
                {/* ẢNH BÌA THUMBNAIL NẾU CÓ */}
                {item.imageUrl && (
                  <div className="relative w-full h-44 sm:h-48 overflow-hidden bg-slate-900/10">
                    <img 
                      src={item.imageUrl} 
                      alt={item.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      onError={(e: any) => { e.target.style.display = 'none'; }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60" />
                  </div>
                )}

                {/* NỘI DUNG CHÍNH CỦA CARD */}
                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                  
                  {/* DÒNG NHÃN DANH MỤC & BADGE GHIM */}
                  <div className="flex items-center justify-between gap-2">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-sans font-bold border ${catInfo.badgeClass}`}>
                      <span>{catInfo.icon}</span>
                      <span>{catInfo.label}</span>
                    </span>

                    {item.isPinned && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
                        <Pin className="w-3 h-3 text-amber-700 fill-amber-700" />
                        <span>Ghim</span>
                      </span>
                    )}
                  </div>

                  {/* TIÊU ĐỀ */}
                  <h3 className="text-base sm:text-lg font-serif font-bold text-[#1E293B] group-hover:text-amber-800 transition line-clamp-2 leading-snug">
                    {item.title}
                  </h3>

                  {/* TÓM TẮT */}
                  <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed font-sans">
                    {item.summary}
                  </p>

                  {/* THÔNG TIN NGƯỜI ĐĂNG & THỜI GIAN */}
                  <div className="pt-3 border-t border-amber-100 flex items-center justify-between text-[11px] text-slate-500 font-sans mt-auto">
                    <div className="flex items-center gap-1 truncate max-w-[150px]">
                      <User className="w-3 h-3 text-amber-600 shrink-0" />
                      <span className="truncate">{item.author || 'Ban Liên Lạc'}</span>
                    </div>

                    <div className="flex items-center gap-1 font-mono">
                      <Calendar className="w-3 h-3 text-amber-600 shrink-0" />
                      <span>{item.createdAt}</span>
                    </div>
                  </div>
                </div>

                {/* DẢI HÀNH ĐỘNG CUỐI CARD */}
                <div className="px-4 py-2.5 bg-amber-50/50 border-t border-amber-100 flex items-center justify-between text-xs font-sans font-semibold text-amber-900 group-hover:bg-amber-100/50 transition">
                  <span className="inline-flex items-center gap-1">
                    <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
                    <span>{item.likesCount || 0} lượt thích</span>
                  </span>

                  <span className="inline-flex items-center gap-1 text-amber-700 group-hover:translate-x-1 transition font-bold">
                    <span>Đọc tiếp</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      )}

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
