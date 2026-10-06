import React, { useState, useMemo, useEffect } from 'react';
import { 
  X, 
  Calendar, 
  User, 
  Share2, 
  Heart, 
  Pin, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight, 
  ExternalLink,
  Sparkles,
  Copy,
  Download,
  QrCode,
  Check,
  Award,
  ShieldCheck,
  Compass,
  Tv,
  Smartphone,
  Send,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  Images,
  Maximize2
} from 'lucide-react';
import { Announcement, AnnouncementCategory, ClassMember } from '../types';
import { getGoogleCalendarUrl, downloadIcsFile, OFFICIAL_K8A1_REUNION_EVENT } from '../utils/calendarUtils';
import { formatAnnouncementContent, cleanAnnouncementContent } from '../utils/announcementUtils';
import { formatDateTimeVi } from '../data';
import InteractivePollWidget from './InteractivePollWidget';

interface AnnouncementDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  announcement: Announcement | null;
  onNavigateAction?: (targetId: string) => void;
  onVote?: (announcementId: string, optionId: string, voterName: string) => void;
  onLike?: (id: string) => void;
  activeMember?: ClassMember | null;
  classRoster?: ClassMember[];
}

export const CATEGORY_STYLES: Record<AnnouncementCategory, { label: string; badgeClass: string; icon: string }> = {
  report: {
    label: 'Báo Cáo Tổng Kết',
    badgeClass: 'bg-gradient-to-r from-amber-500/25 to-yellow-500/30 text-amber-950 border-amber-400 ring-1 ring-amber-400/40 font-black shadow-xs',
    icon: '🏆'
  },
  urgent: {
    label: 'Khẩn Cấp',
    badgeClass: 'bg-rose-500/15 text-rose-700 border-rose-300 ring-1 ring-rose-400/30',
    icon: '🔥'
  },
  schedule: {
    label: 'Kế Hoạch & Lịch Trình',
    badgeClass: 'bg-amber-500/15 text-amber-800 border-amber-300 ring-1 ring-amber-400/30',
    icon: '📋'
  },
  shirts: {
    label: 'Đồng Phục Áo Lớp',
    badgeClass: 'bg-blue-500/15 text-blue-800 border-blue-300 ring-1 ring-blue-400/30',
    icon: '👕'
  },
  fund: {
    label: 'Minh Bạch Quỹ Lớp',
    badgeClass: 'bg-emerald-500/15 text-emerald-800 border-emerald-300 ring-1 ring-emerald-400/30',
    icon: '💰'
  },
  activity: {
    label: 'Ký Sự & Hoạt Động',
    badgeClass: 'bg-purple-500/15 text-purple-800 border-purple-300 ring-1 ring-purple-400/30',
    icon: '📸'
  },
  poll: {
    label: 'Khảo Sát Ý Kiến',
    badgeClass: 'bg-indigo-500/15 text-indigo-800 border-indigo-300 ring-1 ring-indigo-400/30',
    icon: '🗳️'
  }
};

export default function AnnouncementDetailModal({
  isOpen,
  onClose,
  announcement,
  onNavigateAction,
  onVote,
  onLike,
  activeMember,
  classRoster = []
}: AnnouncementDetailModalProps) {
  const [copiedZalo, setCopiedZalo] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [hasLiked, setHasLiked] = useState(() => {
    if (!announcement) return false;
    try {
      return localStorage.getItem(`k8a1_announcement_like_${announcement.id}`) === '1';
    } catch {
      return false;
    }
  });
  const [likeCount, setLikeCount] = useState(() => announcement?.likesCount || 0);
  const [showCalendarMenu, setShowCalendarMenu] = useState(false);
  const [savedCalendar, setSavedCalendar] = useState(false);

  // Tổng hợp tất cả ảnh của bài viết (Ảnh bìa Cover luôn được ưu tiên đứng vị trí số 1 làm Ảnh Tiêu Điểm)
  const allImages = useMemo(() => {
    if (!announcement) return [];
    const list: string[] = [];
    const cover = announcement.imageUrl?.trim();
    if (cover) {
      list.push(cover);
    }
    if (Array.isArray(announcement.images) && announcement.images.length > 0) {
      announcement.images.forEach((img) => {
        if (img && typeof img === 'string' && img.trim()) {
          const trimmed = img.trim();
          if (!list.includes(trimmed)) {
            list.push(trimmed);
          }
        }
      });
    }
    return list;
  }, [announcement]);

  // Làm sạch và dàn trang chuẩn xác nội dung bài viết, phân tách đoạn văn và giữ nguyên khoảng cách xuống dòng
  const sanitizedContent = useMemo(() => {
    return formatAnnouncementContent(announcement?.content || '');
  }, [announcement?.content]);

  // Phím tắt bàn phím điều hướng Lightbox (ESC, Left, Right)
  useEffect(() => {
    if (lightboxIndex === null) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxIndex(null);
      if (e.key === 'ArrowLeft') {
        setLightboxIndex((prev) => (prev !== null ? (prev > 0 ? prev - 1 : allImages.length - 1) : null));
      }
      if (e.key === 'ArrowRight') {
        setLightboxIndex((prev) => (prev !== null ? (prev < allImages.length - 1 ? prev + 1 : 0) : null));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, allImages.length]);

  if (!isOpen || !announcement) return null;

  const catInfo = CATEGORY_STYLES[announcement.category] || CATEGORY_STYLES.schedule;

  const isScheduleRelated = announcement.category === 'schedule' ||
    announcement.actionUrl === '#schedule-section' ||
    announcement.actionUrl === '#diem-danh' ||
    announcement.title.toLowerCase().includes('lịch trình') ||
    announcement.title.toLowerCase().includes('kế hoạch') ||
    announcement.title.toLowerCase().includes('27/09') ||
    announcement.content.toLowerCase().includes('27/09');

  const handleAddToGoogleCalendar = () => {
    const url = getGoogleCalendarUrl({
      ...OFFICIAL_K8A1_REUNION_EVENT,
      title: announcement.title ? `[K8A1 20 Năm] ${announcement.title}` : OFFICIAL_K8A1_REUNION_EVENT.title
    });
    window.open(url, '_blank');
    setSavedCalendar(true);
    setTimeout(() => setSavedCalendar(false), 3000);
  };

  const handleDownloadIcs = () => {
    downloadIcsFile({
      ...OFFICIAL_K8A1_REUNION_EVENT,
      title: announcement.title ? `[K8A1 20 Năm] ${announcement.title}` : OFFICIAL_K8A1_REUNION_EVENT.title
    }, `Lich_K8A1_${announcement.id || '20_nam'}.ics`);
    setSavedCalendar(true);
    setTimeout(() => setSavedCalendar(false), 3000);
  };

  const handleToggleLike = () => {
    const next = !hasLiked;
    setHasLiked(next);
    const newCount = next ? likeCount + 1 : Math.max(0, likeCount - 1);
    setLikeCount(newCount);
    try {
      if (next) {
        localStorage.setItem(`k8a1_announcement_like_${announcement.id}`, '1');
      } else {
        localStorage.removeItem(`k8a1_announcement_like_${announcement.id}`);
      }
    } catch {}
    if (next && onLike) {
      onLike(announcement.id);
    }
  };

  const getShareUrl = () => {
    if (typeof window === 'undefined') return 'https://k8a1.vercel.app';
    const origin = window.location.origin;
    const key = announcement.slug || announcement.id;
    if (!key) return `${origin}/`;
    // Đường link chia sẻ siêu ngắn gọn, tinh tế (/s/id), tự động sinh thẻ Open Graph ảnh to cho Zalo & Facebook
    return `${origin}/s/${encodeURIComponent(key)}`;
  };


  const handleCopyLink = () => {
    const url = getShareUrl();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url);
    }
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const handleNativeShare = async () => {
    const shareUrl = getShareUrl();
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `[K8A1 20 Năm] ${announcement.title}`,
          text: announcement.summary,
          url: shareUrl
        });
        return;
      } catch (err) {
        // Fallback to share modal if cancelled or unsupported
      }
    }
    setShowShareModal(true);
  };

  const handleCopyZaloMessage = () => {
    const shareUrl = getShareUrl();
    const formattedTime = formatDateTimeVi(announcement.createdAt) || announcement.createdAt;

    // Soạn tin nhắn chia sẻ Zalo thân tình, tự nhiên theo tinh thần bạn bè K8A1
    const message = `🌸 KỶ SỰ & TIN TỨC K8A1 🌸
"${announcement.title}"

${announcement.summary ? `${announcement.summary}\n\n` : ''}⏰ Đăng lúc: ${formattedTime}
👉 Mời cả lớp bấm vào link xem bài viết & trọn bộ ảnh kỷ niệm nhé:
${shareUrl}`;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(message);
    }
    setCopiedZalo(true);
    setTimeout(() => setCopiedZalo(false), 3500);
  };

  const handleActionClick = () => {
    if (!announcement.actionUrl) return;
    onClose();
    if (announcement.actionUrl.startsWith('#')) {
      const targetId = announcement.actionUrl.replace('#', '');
      if (onNavigateAction) {
        onNavigateAction(targetId);
      } else {
        const el = document.getElementById(targetId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      window.open(announcement.actionUrl, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl max-h-[90vh] bg-[#FFFDF9] rounded-2xl sm:rounded-3xl shadow-2xl border-2 border-amber-300/80 flex flex-col overflow-hidden text-slate-800 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* NỀN VÀNG KIM HOA VĂN NHẸ CỔ ĐIỂN */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#FAF5E8]/60 via-transparent to-[#F6EDD8]/40 pointer-events-none" />

        {/* HEADER MODAL */}
        <div className="relative z-10 px-4 sm:px-6 pt-5 pb-3 border-b border-amber-200/80 flex items-start justify-between gap-3 bg-white/70 backdrop-blur-xs">
          <div className="flex flex-wrap items-center gap-2">
            {/* Nhãn danh mục */}
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-sans font-bold border ${catInfo.badgeClass}`}>
              <span>{catInfo.icon}</span>
              <span>{catInfo.label}</span>
            </span>

            {/* Huy hiệu ghim */}
            {announcement.isPinned && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-sans font-bold bg-amber-500/20 text-amber-900 border border-amber-300">
                <Pin className="w-3 h-3 text-amber-700 fill-amber-700" />
                <span>Ghim Đầu Trang</span>
              </span>
            )}
          </div>

          {/* Cụm nút công cụ Header: Nút Chia sẻ nhanh & Đóng */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={handleNativeShare}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-sans font-bold bg-amber-500/15 hover:bg-amber-500/25 text-amber-900 border border-amber-300 transition cursor-pointer active:scale-95"
              title="Chia sẻ bản tin này"
            >
              <Share2 className="w-3.5 h-3.5 text-amber-700" />
              <span className="hidden xs:inline">Chia Sẻ</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-amber-100 transition cursor-pointer"
              title="Đóng (ESC)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* NỘI DUNG CUỘN ĐƯỢC CỦA BÀI BÁO */}
        <div className="relative z-10 flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 font-sans text-sm sm:text-base leading-relaxed text-slate-700 selection:bg-amber-200 selection:text-amber-900">
          
          {/* TIÊU ĐỀ BÀI BÁO */}
          <h2 className="text-lg sm:text-2xl font-serif font-black text-[#1E293B] leading-snug tracking-tight">
            {announcement.title}
          </h2>

          {/* THÔNG TIN TÁC GIẢ & THỜI GIAN */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-500 pb-3 border-b border-amber-100 font-sans">
            <div className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-amber-700" />
              <span className="font-semibold text-slate-700">{announcement.author || 'Ban Liên Lạc K8A1'}</span>
            </div>
            <div className="flex items-center gap-1.5 font-mono">
              <Calendar className="w-3.5 h-3.5 text-amber-700" />
              <span>{formatDateTimeVi(announcement.createdAt) || announcement.createdAt}</span>
            </div>
          </div>

          {/* BỘ SƯU TẬP ẢNH MINH HỌA TRONG BÀI (HỖ TRỢ 1 ẢNH HOẶC NHIỀU ẢNH) */}
          {allImages.length === 1 && (
            <div 
              onClick={() => setLightboxIndex(0)}
              className="relative rounded-2xl overflow-hidden border-2 border-amber-200 shadow-md bg-slate-900/5 my-2.5 group cursor-zoom-in"
              title="Bấm để xem ảnh phóng to"
            >
              <img 
                src={allImages[0]} 
                alt={announcement.title} 
                className="w-full max-h-[340px] sm:max-h-[380px] object-cover group-hover:scale-101 transition duration-300"
                onError={(e: any) => { e.currentTarget.src = '/og-image.jpg'; }}
              />
              <div className="absolute bottom-2.5 right-2.5 bg-black/60 backdrop-blur-xs text-white text-[11px] font-medium px-2.5 py-1 rounded-full flex items-center gap-1 opacity-80 group-hover:opacity-100 transition shadow">
                <ZoomIn className="w-3.5 h-3.5" />
                <span>Phóng to</span>
              </div>
            </div>
          )}

          {allImages.length > 1 && (
            <div className="my-3 p-3 sm:p-4 rounded-2xl bg-gradient-to-b from-amber-500/10 via-amber-400/5 to-amber-500/10 border-2 border-amber-300/80 shadow-xs space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs sm:text-sm font-serif font-bold text-amber-950">
                  <Images className="w-4 h-4 text-amber-700" />
                  <span>Bộ Sưu Tập Tư Liệu Kỷ Niệm ({allImages.length} bức ảnh)</span>
                </div>
                <span className="text-[11px] text-amber-800 font-sans italic hidden xs:inline">
                  Bấm vào ảnh để xem toàn màn hình
                </span>
              </div>

              {/* Ảnh tiêu điểm lớn nhất */}
              <div 
                onClick={() => setLightboxIndex(0)}
                className="relative rounded-xl overflow-hidden border border-amber-300 shadow-sm bg-slate-900/5 group cursor-zoom-in"
              >
                <img 
                  src={allImages[0]} 
                  alt="Ảnh tiêu điểm" 
                  className="w-full max-h-[300px] sm:max-h-[360px] object-cover group-hover:scale-101 transition duration-300"
                  onError={(e: any) => { e.currentTarget.src = '/og-image.jpg'; }}
                />
                <div className="absolute top-2.5 left-2.5 bg-amber-500 text-slate-950 font-bold text-[10px] px-2.5 py-1 rounded-full flex items-center gap-1 shadow">
                  <Sparkles className="w-3 h-3" />
                  <span>Ảnh Tiêu Điểm</span>
                </div>
                <div className="absolute bottom-2.5 right-2.5 bg-black/60 backdrop-blur-xs text-white text-[11px] font-medium px-2.5 py-1 rounded-full flex items-center gap-1 opacity-85 group-hover:opacity-100 transition shadow">
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>Xem toàn màn hình</span>
                </div>
              </div>

              {/* Dải thumbnail lưới các ảnh tiếp theo */}
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-1.5 pt-0.5">
                {allImages.slice(1).map((imgUrl, idx) => (
                  <div
                    key={idx + 1}
                    onClick={() => setLightboxIndex(idx + 1)}
                    className="relative aspect-4/3 rounded-lg overflow-hidden border border-amber-200 bg-slate-900/10 group cursor-zoom-in hover:border-amber-500 hover:shadow-sm transition"
                    title={`Ảnh ${idx + 2}`}
                  >
                    <img 
                      src={imgUrl} 
                      alt={`Ảnh ${idx + 2}`} 
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition flex items-center justify-center">
                      <ZoomIn className="w-3.5 h-3.5 text-white opacity-0 group-hover:opacity-100 transition drop-shadow" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* KHỐI TÓM TẮT ĐẶC BIỆT */}
          {announcement.summary && (
            <div className="p-3.5 sm:p-4 rounded-xl bg-amber-500/10 border-l-4 border-amber-500 text-amber-950 font-serif italic text-sm sm:text-[15px] leading-relaxed shadow-xs">
              “{announcement.summary}”
            </div>
          )}

          {/* KHỐI 4 CHỈ SỐ KỶ LỤC NỔI BẬT NẾU CÓ METRICS */}
          {announcement.metrics && announcement.metrics.length > 0 && (
            <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/15 via-amber-400/10 to-amber-600/15 border-2 border-amber-400/60 shadow-xs space-y-2.5 my-3">
              <div className="flex items-center gap-2 border-b border-amber-300/40 pb-2">
                <Sparkles className="w-4 h-4 text-amber-700" />
                <h4 className="font-serif font-bold text-amber-950 text-xs sm:text-sm uppercase tracking-wider">
                  4 Chỉ Số Dấu Ấn Kỷ Lục Của Đại Lễ K8A1
                </h4>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {announcement.metrics.map((m, idx) => (
                  <div key={idx} className="bg-white/85 backdrop-blur-xs rounded-xl p-2.5 sm:p-3 border border-amber-200/80 shadow-xs flex flex-col items-center text-center">
                    <span className="text-xl sm:text-2xl font-black font-mono text-amber-700 tracking-tight">
                      {m.value}
                    </span>
                    <span className="text-xs font-bold text-slate-800 mt-0.5 line-clamp-1">
                      {m.label}
                    </span>
                    {m.desc && (
                      <span className="text-[10px] text-slate-500 mt-1 line-clamp-2 leading-tight">
                        {m.desc}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* KHỐI 5 TRỤ CỘT CÔNG NGHỆ 4.0 ĐỘC QUYỀN (CHO BÀI BÁO CÁO REPORT) */}
          {announcement.category === 'report' && (
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 text-white border-2 border-amber-400/80 shadow-xl space-y-3.5 my-3">
              <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-400 shrink-0" />
                  <h4 className="font-serif font-bold text-amber-300 text-xs sm:text-sm uppercase tracking-wide">
                    5 Trụ Cột Công Nghệ 4.0 Tiên Phong Của K8A1
                  </h4>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  Hệ Sinh Thái WebApp
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 hover:border-amber-400/50 transition">
                  <div className="flex items-center gap-2 text-amber-300 font-bold mb-1">
                    <Compass className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>1. Bản Đồ 3D Hội Tụ Toàn Cầu</span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    Trực quan hóa vị trí của 50 cựu học sinh từ khắp các tỉnh thành và quốc tế cùng kết nối về trường cũ.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-white/5 border border-white/10 hover:border-amber-400/50 transition">
                  <div className="flex items-center gap-2 text-amber-300 font-bold mb-1">
                    <User className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>2. Thẻ Học Sinh Số & Check-in QR</span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    Đón tiếp tự động 0.8 giây, nhận diện danh tính và hướng dẫn sơ đồ bàn tiệc thông minh.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-white/5 border border-white/10 hover:border-amber-400/50 transition">
                  <div className="flex items-center gap-2 text-amber-300 font-bold mb-1">
                    <Tv className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>3. Trung Tâm Màn LED & Smart TV</span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    Chuyển động Ken Burns điện ảnh, hòa âm thông minh tự động nhường âm thanh khi chiếu video kỷ niệm.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-white/5 border border-white/10 hover:border-amber-400/50 transition">
                  <div className="flex items-center gap-2 text-amber-300 font-bold mb-1">
                    <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>4. Bảo Vệ Tư Liệu 5 Tầng & Watermark</span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    Chống tải trộm, giữ trọn vẹn bản quyền hình ảnh kỷ niệm riêng tư của toàn bộ thành viên.
                  </p>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-gradient-to-r from-amber-500/20 via-amber-400/10 to-transparent border border-amber-400/40 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="text-xs font-bold text-amber-200">5. Trình Chiếu Không Dây Lên Smart TV Phòng Khách</span>
                </div>
                <span className="text-[10px] text-amber-300 font-mono bg-amber-500/20 px-2 py-0.5 rounded">Mã 1-Chạm</span>
              </div>

              <div className="p-3 rounded-xl bg-amber-400/10 border border-amber-400/30 text-center">
                <p className="text-xs text-amber-200/90 font-medium">
                  🤝 <strong className="text-amber-300">Tinh thần K8A1:</strong> Ban Tổ Chức sẵn lòng chia sẻ kinh nghiệm và hỗ trợ giải pháp số hóa cho các lớp bạn cùng khóa K8 và các thế hệ sau!
                </p>
              </div>
            </div>
          )}

          {/* KHỐI NHẮC LỊCH THÔNG MINH CHO BẢN TIN LỊCH TRÌNH */}
          {isScheduleRelated && (
            <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-amber-400/10 to-amber-500/20 border-2 border-amber-400/60 shadow-xs space-y-2.5 my-2 text-slate-800">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-800 shrink-0">
                    <Calendar className="w-4 h-4" />
                  </span>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold font-serif text-amber-950">
                      Lịch Hẹn: Chủ Nhật, 27/09/2026 (Từ 08:30 Sáng)
                    </h4>
                    <p className="text-[11px] text-amber-800/90 font-sans">
                      Thăm trường THPT Thái Nguyên & Tiệc Hội Ngộ The Prime
                    </p>
                  </div>
                </div>

                <span className="text-[10px] font-mono font-bold bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full shrink-0">
                  Hội Khóa 20 Năm
                </span>
              </div>

              <p className="text-xs text-slate-700 italic">
                💡 Cài đặt lời nhắc tự động vào lịch điện thoại (báo trước 1 ngày & 2 giờ) để cùng bạn bè K8A1 tề tựu đông đủ nhất!
              </p>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleAddToGoogleCalendar}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-sans font-bold shadow-xs transition cursor-pointer active:scale-95"
                >
                  <Calendar className="w-3.5 h-3.5 text-amber-200" />
                  <span>Google Calendar</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadIcs}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-amber-100 text-amber-950 border border-amber-300 text-xs font-sans font-bold shadow-xs transition cursor-pointer active:scale-95"
                  title="Tải lịch tự động thêm vào Apple Calendar (iPhone/iPad) hoặc Outlook"
                >
                  <Download className="w-3.5 h-3.5 text-amber-700" />
                  <span>iPhone / Apple / Outlook (.ICS)</span>
                </button>

                {savedCalendar && (
                  <span className="text-xs text-emerald-700 font-bold flex items-center gap-1 animate-in fade-in">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Đã lưu lịch!</span>
                  </span>
                )}
              </div>
            </div>
          )}

          {/* KHỐI BÌNH CHỌN & KHẢO SÁT Ý KIẾN TRỰC TIẾP */}
          {announcement.poll && onVote && (
            <InteractivePollWidget
              announcementId={announcement.id}
              poll={announcement.poll}
              onVote={onVote}
              activeMember={activeMember}
              classRoster={classRoster}
              isCompact={false}
            />
          )}

          {/* TOÀN VĂN NỘI DUNG CHI TIẾT */}
          <div 
            className="pt-2 text-slate-800 ql-editor px-0 text-[15px] sm:text-base leading-relaxed tracking-normal font-sans [&_p]:mb-3.5 [&_p:last-child]:mb-0 [&_p]:min-h-[1.25em] [&_strong]:font-bold [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-amber-950 [&_h2]:mt-4 [&_h2]:mb-2 [&_h3]:text-base [&_h3]:font-bold [&_h3]:text-amber-900 [&_h3]:mt-3 [&_h3]:mb-1.5 [&_blockquote]:border-l-4 [&_blockquote]:border-amber-400 [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:text-slate-600 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mb-1" 
            dangerouslySetInnerHTML={{ __html: sanitizedContent }} 
          />

          {/* LỜI KẾT & CHỮ KÝ BLL */}
          <div className="pt-4 border-t border-amber-200/80 flex items-center justify-between text-xs text-slate-500 font-sans">
            <span className="italic">Kênh phát ngôn chính thức của Tập thể K8A1 (2003 — 2006)</span>
            <span className="font-bold text-amber-800 font-serif">THPT Thái Nguyên</span>
          </div>
        </div>

        {/* FOOTER THANH CÔNG CỤ HÀNH ĐỘNG 1-CHẠM */}
        <div className="relative z-10 px-4 sm:px-6 py-3.5 bg-[#FAF6EC] border-t border-amber-200 flex flex-wrap items-center justify-between gap-2.5">
          
          {/* Cụm tương tác: Thả tim & Sao chép gửi Zalo */}
          <div className="flex items-center gap-2">
            {/* Nút Thả tim */}
            <button
              type="button"
              onClick={handleToggleLike}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-sans font-bold transition-all cursor-pointer border ${
                hasLiked 
                  ? 'bg-rose-500 text-white border-rose-600 shadow-sm scale-105' 
                  : 'bg-white text-slate-700 hover:text-rose-600 hover:bg-rose-50 border-slate-200'
              }`}
              title="Thả tim bài viết"
            >
              <Heart className={`w-3.5 h-3.5 ${hasLiked ? 'fill-white text-white' : 'text-rose-500'}`} />
              <span>{likeCount}</span>
            </button>

            {/* Nút Sao Chép Link Trực Tiếp (Deep Link) */}
            <button
              type="button"
              onClick={handleCopyLink}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-sans font-bold transition-all cursor-pointer border ${
                copiedLink
                  ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
                  : 'bg-white text-slate-700 hover:text-amber-800 hover:bg-amber-50 border-amber-300/80'
              }`}
              title="Sao chép liên kết trực tiếp tới bản tin này"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-white" />
                  <span>Đã chép link!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-amber-700" />
                  <span>Copy Link</span>
                </>
              )}
            </button>

            {/* Nút Hiển Thị Mã QR Code */}
            <button
              type="button"
              onClick={() => setShowShareModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-sans font-bold transition-all cursor-pointer border bg-white text-slate-700 hover:text-amber-800 hover:bg-amber-50 border-amber-300/80"
              title="Hiển thị mã QR để quét xem nhanh trên điện thoại hoặc Smart TV"
            >
              <QrCode className="w-3.5 h-3.5 text-amber-700" />
              <span>Mã QR</span>
            </button>

            {/* Nút 1-Chạm Soạn tin gửi Zalo */}
            <button
              type="button"
              onClick={handleCopyZaloMessage}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-sans font-bold transition-all cursor-pointer border ${
                copiedZalo
                  ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
                  : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200'
              }`}
              title="Sao chép nội dung tóm tắt để dán vào nhóm Zalo lớp"
            >
              {copiedZalo ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                  <span>Đã sao chép Zalo!</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5 text-blue-600" />
                  <span>Bắn Zalo</span>
                </>
              )}
            </button>

            {/* Nút Thêm vào Lịch Điện thoại (Google & Apple/Outlook) */}
            {isScheduleRelated && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowCalendarMenu(prev => !prev)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-sans font-bold transition-all cursor-pointer border bg-amber-100/90 text-amber-950 hover:bg-amber-200 border-amber-300 shadow-xs"
                  title="Thêm lịch hẹn vào điện thoại"
                >
                  <Calendar className="w-3.5 h-3.5 text-amber-700" />
                  <span>📅 Nhắc Lịch</span>
                </button>

                {showCalendarMenu && (
                  <div className="absolute bottom-full left-0 mb-2 w-56 bg-white rounded-2xl border-2 border-amber-300 shadow-xl p-2 z-50 text-xs font-sans space-y-1 animate-in fade-in zoom-in-95">
                    <div className="px-2 py-1 text-[10px] font-bold text-amber-900 border-b border-amber-100 uppercase tracking-wider">
                      Chọn ứng dụng lịch:
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        handleAddToGoogleCalendar();
                        setShowCalendarMenu(false);
                      }}
                      className="w-full text-left px-2.5 py-1.5 hover:bg-amber-50 rounded-lg transition flex items-center gap-2 text-slate-800 font-medium cursor-pointer"
                    >
                      <Calendar className="w-4 h-4 text-amber-600" />
                      <span>Google Calendar</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleDownloadIcs();
                        setShowCalendarMenu(false);
                      }}
                      className="w-full text-left px-2.5 py-1.5 hover:bg-amber-50 rounded-lg transition flex items-center gap-2 text-slate-800 font-medium cursor-pointer"
                    >
                      <Download className="w-4 h-4 text-amber-600" />
                      <span>iPhone / Apple / Outlook (.ICS)</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Nút Hành Động Trực Tiếp (Call to Action - CTA) nếu có */}
          {announcement.actionUrl && (
            <button
              type="button"
              onClick={handleActionClick}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white text-xs sm:text-sm font-sans font-bold shadow-md hover:shadow-lg transition transform hover:-translate-y-0.5 cursor-pointer ml-auto"
            >
              <span>{announcement.actionLabel || 'Xem Chi Tiết Ngay'}</span>
              <ArrowRight className="w-4 h-4 text-amber-200" />
            </button>
          )}
        </div>
      </div>

      {/* POPUP MODAL MÃ QR & LIÊN KẾT CHIA SẺ TRỰC TIẾP */}
      {showShareModal && (
        <div 
          className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setShowShareModal(false)}
        >
          <div 
            className="relative w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border-2 border-amber-300 text-slate-800 space-y-4 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-amber-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-700 flex items-center justify-center">
                  <QrCode className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-slate-900 text-sm sm:text-base">Mã QR Bản Tin K8A1</h3>
                  <p className="text-[11px] text-slate-500 font-sans">Quét để xem trực tiếp trên mọi thiết bị</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setShowShareModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col items-center justify-center p-3 bg-gradient-to-b from-amber-50 to-white rounded-2xl border border-amber-200/80">
              <div className="bg-white p-2.5 rounded-2xl shadow-md border border-amber-200">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&margin=4&data=${encodeURIComponent(getShareUrl())}`}
                  alt="QR Code Link"
                  className="w-44 h-44 rounded-xl"
                  loading="lazy"
                />
              </div>
              <p className="text-[11px] text-amber-900 font-medium text-center mt-2.5">
                Quét bằng camera điện thoại, Zalo hoặc mở trên Smart TV
              </p>
            </div>

            <div className="space-y-2 text-xs">
              <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Liên kết xem trực tiếp:</label>
              <div className="flex items-center gap-1.5 p-1.5 pl-3 rounded-xl bg-slate-100 border border-slate-200">
                <span className="text-[11px] font-mono text-slate-700 truncate select-all flex-1">
                  {getShareUrl()}
                </span>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold transition flex items-center gap-1 cursor-pointer shrink-0"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Đã chép' : 'Chép'}</span>
                </button>
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={handleCopyZaloMessage}
                className="flex-1 py-2 px-3 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 font-sans font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{copiedZalo ? 'Đã sao chép Zalo!' : 'Soạn tin Zalo'}</span>
              </button>
              <button
                type="button"
                onClick={() => setShowShareModal(false)}
                className="py-2 px-4 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-sans font-bold text-xs transition cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🖼️ LIGHTBOX XEM PHÓNG TO ẢNH TOÀN MÀN HÌNH */}
      {lightboxIndex !== null && allImages.length > 0 && (
        <div 
          className="fixed inset-0 z-[150] flex items-center justify-center bg-black/95 backdrop-blur-md animate-in fade-in duration-200 select-none"
          onClick={() => setLightboxIndex(null)}
        >
          {/* Header Lightbox */}
          <div className="absolute top-0 left-0 right-0 p-4 sm:p-5 flex items-center justify-between text-white z-10 bg-gradient-to-b from-black/80 to-transparent">
            <span className="text-xs sm:text-sm font-mono font-bold bg-white/10 px-3 py-1 rounded-full border border-white/20">
              Ảnh {lightboxIndex + 1} / {allImages.length}
            </span>
            <button
              type="button"
              onClick={() => setLightboxIndex(null)}
              className="p-2 rounded-full bg-white/10 hover:bg-white/25 text-white transition cursor-pointer"
              title="Đóng (ESC)"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Nút lùi ảnh */}
          {allImages.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex((prev) => (prev !== null ? (prev > 0 ? prev - 1 : allImages.length - 1) : 0));
              }}
              className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/25 text-white transition cursor-pointer z-10 shadow-lg"
              title="Ảnh trước (Phím mũi tên trái)"
            >
              <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8" />
            </button>
          )}

          {/* Ảnh phóng to chính giữa */}
          <div 
            className="max-w-[92vw] max-h-[85vh] p-2 flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img 
              src={allImages[lightboxIndex]} 
              alt={`Ảnh ${lightboxIndex + 1}`} 
              className="max-w-full max-h-[82vh] object-contain rounded-xl sm:rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200"
            />
          </div>

          {/* Nút tiến ảnh */}
          {allImages.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex((prev) => (prev !== null ? (prev < allImages.length - 1 ? prev + 1 : 0) : 0));
              }}
              className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/25 text-white transition cursor-pointer z-10 shadow-lg"
              title="Ảnh tiếp theo (Phím mũi tên phải)"
            >
              <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
