import React, { useState, useMemo, useRef } from 'react';
import { 
  Newspaper, 
  Calendar, 
  User, 
  Pin, 
  Heart, 
  Megaphone, 
  Flame,
  ArrowRight,
  Vote,
  Share2,
  Check
} from 'lucide-react';
import { Announcement, AnnouncementCategory, EventConfig, ClassMember } from '../types';
import { formatDateTimeVi, formatDateOnlyVi } from '../data';
import AnnouncementDetailModal from './AnnouncementDetailModal';

interface ClassNewsFeedProps {
  announcements: Announcement[];
  eventConfig?: EventConfig;
  onNavigateAction?: (targetId: string) => void;
  onSelectAnnouncement?: (item: Announcement) => void;
  onVote?: (announcementId: string, optionId: string, voterName: string) => void;
  activeMember?: ClassMember | null;
  classRoster?: ClassMember[];
}

const DARK_CATEGORY_STYLES: Record<AnnouncementCategory, { label: string; badgeClass: string; icon: string }> = {
  report: { label: 'Báo Cáo', badgeClass: 'bg-amber-500/30 text-amber-200 border-amber-400 font-bold shadow-xs', icon: '🏆' },
  urgent: { label: 'Khẩn Cấp', badgeClass: 'bg-rose-500/25 text-rose-300 border-rose-500/50', icon: '🔥' },
  schedule: { label: 'Lịch Trình', badgeClass: 'bg-amber-500/25 text-amber-300 border-amber-500/50', icon: '📋' },
  shirts: { label: 'Áo Lớp', badgeClass: 'bg-sky-500/25 text-sky-300 border-sky-500/50', icon: '👕' },
  fund: { label: 'Quỹ Lớp', badgeClass: 'bg-emerald-500/25 text-emerald-300 border-emerald-500/50', icon: '💰' },
  activity: { label: 'Hoạt Động', badgeClass: 'bg-purple-500/25 text-purple-300 border-purple-500/50', icon: '📸' },
  poll: { label: 'Bình Chọn', badgeClass: 'bg-indigo-500/25 text-indigo-300 border-indigo-500/50', icon: '🗳️' }
};

export default function ClassNewsFeed({
  announcements,
  eventConfig,
  onNavigateAction,
  onSelectAnnouncement,
  onVote,
  activeMember,
  classRoster = []
}: ClassNewsFeedProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [internalSelectedAnnouncement, setInternalSelectedAnnouncement] = useState<Announcement | null>(null);
  const [copiedCardId, setCopiedCardId] = useState<string | null>(null);

  const handleCardClick = (item: Announcement) => {
    if (onSelectAnnouncement) {
      onSelectAnnouncement(item);
    } else {
      setInternalSelectedAnnouncement(item);
    }
  };

  const handleQuickShare = (e: React.MouseEvent, item: Announcement) => {
    e.stopPropagation();
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://k8a1.vercel.app';
    const path = typeof window !== 'undefined' ? window.location.pathname || '/' : '/';
    const url = `${origin}${path}?news=${encodeURIComponent(item.slug || item.id)}`;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url);
    }
    setCopiedCardId(item.id);
    setTimeout(() => setCopiedCardId(null), 2500);
  };

  // Lọc bài viết công khai
  const publishedAnnouncements = useMemo(() => {
    return (announcements || []).filter(a => a.status === 'published' || !a.status);
  }, [announcements]);

  // Lọc theo danh mục và ghim
  const filteredList = useMemo(() => {
    if (publishedAnnouncements.length === 0) return [];
    
    const sorted = [...publishedAnnouncements].sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return (b.createdAt || '').localeCompare(a.createdAt || '');
    });

    if (selectedCategory === 'all') return sorted;
    return sorted.filter(a => a.category === selectedCategory);
  }, [publishedAnnouncements, selectedCategory]);

  const pinnedItem = useMemo(() => {
    return publishedAnnouncements.find(a => a.isPinned);
  }, [publishedAnnouncements]);

  // Lưới tin (không bao gồm tin ghim nếu đang ở tab Tất Cả)
  const gridList = useMemo(() => {
    if (selectedCategory === 'all' && pinnedItem) {
      return filteredList.filter(a => a.id !== pinnedItem.id);
    }
    return filteredList;
  }, [filteredList, selectedCategory, pinnedItem]);

  const categories: { id: string; label: string; icon: string }[] = [
    { id: 'all', label: 'Tất Cả', icon: '✨' },
    { id: 'report', label: 'Báo Cáo', icon: '🏆' },
    { id: 'urgent', label: 'Khẩn Cấp', icon: '🔥' },
    { id: 'poll', label: 'Bình Chọn', icon: '🗳️' },
    { id: 'schedule', label: 'Lịch Trình', icon: '📋' },
    { id: 'shirts', label: 'Áo Lớp', icon: '👕' },
    { id: 'fund', label: 'Quỹ Lớp', icon: '💰' },
    { id: 'activity', label: 'Ký Sự', icon: '📸' }
  ];

  if ((eventConfig && eventConfig.showAnnouncements === false) || publishedAnnouncements.length === 0) {
    return null;
  }

  // Component Thẻ Tin (Tái sử dụng cho Grid)
  const NewsCard = ({ item }: { item: Announcement }) => {
    const catInfo = DARK_CATEGORY_STYLES[item.category] || DARK_CATEGORY_STYLES.schedule;
    return (
      <article
        onClick={() => handleCardClick(item)}
        className="w-full bg-[#1E293B]/60 hover:bg-[#1E293B] backdrop-blur-md border border-slate-700 hover:border-amber-500/70 rounded-xl p-3 sm:p-4 transition-all duration-300 cursor-pointer flex flex-col gap-3 group relative overflow-hidden shadow-sm hover:shadow-[0_8px_25px_rgba(245,158,11,0.15)] hover:-translate-y-1.5"
      >
        {/* HEADER: Phân loại & Ngày */}
        <div className="flex items-center justify-between gap-2">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] sm:text-xs font-sans font-bold border ${catInfo.badgeClass}`}>
            <span>{catInfo.icon}</span>
            <span>{catInfo.label}</span>
          </span>
          <span className="text-[10px] sm:text-xs text-slate-400 font-mono">
            {formatDateOnlyVi(item.createdAt) || item.createdAt.split(' ')[0]}
          </span>
        </div>

        {/* ẢNH THUMBNAIL (Nếu có) */}
        {item.imageUrl && (
          <div className="w-full h-32 sm:h-40 rounded-lg overflow-hidden border border-white/10 bg-slate-900/60 mt-1">
            <img 
              src={item.imageUrl} 
              alt={item.title} 
              className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
              onError={(e: any) => { e.currentTarget.src = '/og-image.jpg'; }}
            />
          </div>
        )}

        {/* TIÊU ĐỀ & TÓM TẮT */}
        <div className="flex-1 flex flex-col">
          <h3 className="text-sm sm:text-base font-semibold text-slate-100 group-hover:text-amber-300 transition line-clamp-2 leading-snug mb-1.5">
            {item.title}
          </h3>
          {/* Lấy 1 đoạn ngắn từ content làm tóm tắt (Loại bỏ các mã HTML nếu có, hoặc chỉ cần text đơn giản) */}
          <p className="text-[11px] sm:text-xs text-slate-400 line-clamp-2 leading-relaxed mb-3">
            {item.content.replace(/<[^>]*>?/gm, '').substring(0, 150)}...
          </p>
        </div>

        {/* FOOTER: Tác giả & Tương tác */}
        <div className="flex items-center justify-between text-[10px] sm:text-xs text-slate-400 pt-2.5 border-t border-white/10 font-sans mt-auto">
          <span className="text-slate-300 flex items-center gap-1">
            <User className="w-3 h-3 text-slate-400" />
            <span className="truncate max-w-[120px]">{item.author || 'Ban Liên Lạc'}</span>
          </span>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={(e) => handleQuickShare(e, item)}
              className={`p-1.5 rounded-full transition cursor-pointer flex items-center justify-center ${
                copiedCardId === item.id 
                  ? 'text-emerald-300 bg-emerald-500/25 ring-1 ring-emerald-400/40' 
                  : 'text-slate-400 hover:text-amber-300 hover:bg-white/10'
              }`}
              title="Sao chép liên kết"
            >
              {copiedCardId === item.id ? <Check className="w-3 h-3" /> : <Share2 className="w-3 h-3" />}
            </button>

            {item.poll ? (
              <span className="inline-flex items-center gap-1 text-amber-300 font-bold bg-amber-400/20 px-2 py-0.5 rounded-full border border-amber-400/30">
                <Vote className="w-3 h-3" />
                <span>{(item.poll.options || []).reduce((s, o) => s + (o.votes?.length || 0), 0)}</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-rose-400 font-mono">
                <Heart className="w-3 h-3 fill-rose-400" />
                <span>{item.likesCount || 0}</span>
              </span>
            )}
          </div>
        </div>
      </article>
    );
  };

  return (
    <section 
      id="ban-tin" 
      className="w-screen relative left-1/2 -translate-x-1/2 overflow-hidden scroll-mt-20 my-3 sm:my-5 bg-[#0A0F1C] text-white border-y-[3px] border-amber-500/50 shadow-[0_0_40px_rgba(245,158,11,0.15)]"
    >
      {/* Nền Texture Tạp Chí */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)', backgroundSize: '24px 24px' }} />
      
      {/* Ánh sáng hắt glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-amber-500/20 blur-[100px] pointer-events-none" />

      <div className="h-1.5 w-full bg-gradient-to-r from-amber-900 via-amber-400 to-amber-900 opacity-90 shadow-[0_0_15px_rgba(251,191,36,0.5)]" />

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-5 sm:space-y-6 relative z-10">
        
        {/* HEADER & LỌC */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3 shrink-0">
            <div className="relative flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 shadow-lg text-slate-950">
              <Newspaper className="w-4 h-4 sm:w-5 sm:h-5 text-slate-950 shrink-0" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full ring-2 ring-[#0B132B] animate-pulse" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-amber-200 text-sm sm:text-lg tracking-wide uppercase flex items-center gap-2">
                Tạp Chí K8A1
                <span className="px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-mono font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  Cổng Thông Tin Lớp
                </span>
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-400 font-sans mt-0.5">
                Cập nhật tin tức, sự kiện và hoạt động mới nhất
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1 w-full sm:w-auto">
            {categories.map((cat) => {
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-sans font-semibold transition cursor-pointer whitespace-nowrap shrink-0 border ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 font-bold border-amber-400 shadow-md scale-105'
                      : 'bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border-white/10'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* DANH SÁCH BẢN TIN */}
        {gridList.length === 0 && !pinnedItem ? (
          <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-white/15 bg-white/5">
            <Newspaper className="w-8 h-8 text-amber-400 mx-auto mb-2 opacity-60" />
            <p className="text-sm text-slate-300">Không có bản tin nào trong danh mục này</p>
            <button 
              type="button" 
              onClick={() => setSelectedCategory('all')} 
              className="mt-3 text-xs text-amber-400 font-bold hover:underline cursor-pointer px-4 py-2 rounded-lg bg-amber-400/10"
            >
              Quay lại xem tất cả
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-6 sm:gap-8">
            
            {/* TIN TIÊU ĐIỂM (HERO CARD) */}
            {pinnedItem && selectedCategory === 'all' && (
              <article 
                onClick={() => handleCardClick(pinnedItem)}
                className="w-full bg-gradient-to-br from-[#1E293B] to-[#0B1221] border-2 border-amber-500/50 hover:border-amber-400 rounded-2xl sm:rounded-3xl overflow-hidden cursor-pointer group shadow-[0_8px_30px_rgba(245,158,11,0.15)] hover:shadow-[0_8px_40px_rgba(245,158,11,0.3)] transition-all duration-500 flex flex-col md:flex-row relative hover:-translate-y-1"
              >
                <div className="absolute top-3 left-3 z-20">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-600 text-white font-sans font-bold text-xs shadow-lg animate-pulse">
                    <Flame className="w-3.5 h-3.5 text-amber-200" />
                    <span>Tin Tiêu Điểm</span>
                  </span>
                </div>

                {pinnedItem.imageUrl ? (
                  <div className="w-full md:w-1/2 lg:w-3/5 h-48 sm:h-64 md:h-auto relative overflow-hidden bg-slate-900 shrink-0">
                    <img 
                      src={pinnedItem.imageUrl} 
                      alt={pinnedItem.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-700 opacity-90 group-hover:opacity-100"
                      onError={(e: any) => { e.currentTarget.src = '/og-image.jpg'; }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] md:bg-gradient-to-r via-transparent to-transparent opacity-80 md:opacity-100" />
                  </div>
                ) : (
                  <div className="w-full md:w-1/3 lg:w-2/5 h-32 md:h-auto bg-gradient-to-br from-amber-900/60 to-slate-900 flex flex-col items-center justify-center shrink-0 border-b md:border-b-0 md:border-r border-white/10">
                    <Megaphone className="w-12 h-12 text-amber-400/80 mb-2" />
                    <span className="text-amber-200/50 font-serif tracking-widest uppercase text-sm">Thông Báo</span>
                  </div>
                )}

                <div className="flex-1 p-5 sm:p-6 lg:p-8 flex flex-col justify-center z-10">
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-sans font-bold border ${DARK_CATEGORY_STYLES[pinnedItem.category]?.badgeClass || DARK_CATEGORY_STYLES.report.badgeClass}`}>
                      {DARK_CATEGORY_STYLES[pinnedItem.category]?.label || 'Thông Báo'}
                    </span>
                    <span className="text-xs text-amber-200/70 font-mono flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDateTimeVi(pinnedItem.createdAt) || pinnedItem.createdAt}
                    </span>
                  </div>
                  
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-white group-hover:text-amber-300 transition leading-snug mb-3">
                    {pinnedItem.title}
                  </h3>
                  
                  <p className="text-sm text-slate-300 line-clamp-3 leading-relaxed mb-6">
                    {pinnedItem.content.replace(/<[^>]*>?/gm, '').substring(0, 200)}...
                  </p>

                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center border border-amber-500/30">
                        <User className="w-3.5 h-3.5 text-amber-400" />
                      </div>
                      <span className="font-medium text-amber-100">{pinnedItem.author || 'Ban Liên Lạc'}</span>
                    </div>
                    
                    <span className="inline-flex items-center gap-1.5 text-sm text-amber-400 font-bold group-hover:translate-x-1 transition">
                      Đọc tiếp <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </article>
            )}

            {/* LƯỚI TIN TỨC THƯỜNG */}
            {gridList.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                {gridList.map(item => (
                  <NewsCard key={item.id} item={item} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />

      {!onSelectAnnouncement && (
        <AnnouncementDetailModal
          isOpen={!!internalSelectedAnnouncement}
          onClose={() => setInternalSelectedAnnouncement(null)}
          announcement={internalSelectedAnnouncement}
          onNavigateAction={onNavigateAction}
          onVote={onVote}
          activeMember={activeMember}
          classRoster={classRoster}
        />
      )}
    </section>
  );
}
