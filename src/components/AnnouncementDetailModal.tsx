import React, { useState } from 'react';
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
  Download
} from 'lucide-react';
import { Announcement, AnnouncementCategory, ClassMember } from '../types';
import { getGoogleCalendarUrl, downloadIcsFile, OFFICIAL_K8A1_REUNION_EVENT } from '../utils/calendarUtils';
import InteractivePollWidget from './InteractivePollWidget';

interface AnnouncementDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  announcement: Announcement | null;
  onNavigateAction?: (targetId: string) => void;
  onVote?: (announcementId: string, optionId: string, voterName: string) => void;
  activeMember?: ClassMember | null;
  classRoster?: ClassMember[];
}

export const CATEGORY_STYLES: Record<AnnouncementCategory, { label: string; badgeClass: string; icon: string }> = {
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
  activeMember,
  classRoster = []
}: AnnouncementDetailModalProps) {
  const [copiedZalo, setCopiedZalo] = useState(false);
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
  };

  const handleCopyZaloMessage = () => {
    const webUrl = typeof window !== 'undefined' ? window.location.origin + window.location.pathname : 'https://k8a1.vercel.app';
    const message = `📢 [THÔNG BÁO TỪ BAN LIÊN LẠC K8A1] 📢
━━━━━━━━━━━━━━━━━━━━━━
📌 Tiêu đề: ${announcement.title}
⏰ Thời gian: ${announcement.createdAt}
👤 Người đăng: ${announcement.author || 'Ban Liên Lạc K8A1'}

📝 Tóm tắt:
${announcement.summary}

👉 Các bạn xem chi tiết thông báo và cùng thảo luận tại WebApp 20 Năm:
${webUrl}#ban-tin
━━━━━━━━━━━━━━━━━━━━━━`;

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

  // Chia nội dung thành các đoạn văn rõ ràng
  const paragraphs = announcement.content.split('\n\n').filter(p => p.trim().length > 0);

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

          {/* Nút đóng */}
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-amber-100 transition cursor-pointer shrink-0"
            title="Đóng (ESC)"
          >
            <X className="w-5 h-5" />
          </button>
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
              <span>{announcement.createdAt}</span>
            </div>
          </div>

          {/* HÌNH ẢNH MINH HỌA NẾU CÓ */}
          {announcement.imageUrl && (
            <div className="rounded-2xl overflow-hidden border-2 border-amber-200 shadow-md bg-slate-900/5 my-2">
              <img 
                src={announcement.imageUrl} 
                alt={announcement.title} 
                className="w-full max-h-[320px] object-cover hover:scale-101 transition duration-300"
                onError={(e: any) => { e.target.style.display = 'none'; }}
              />
            </div>
          )}

          {/* KHỐI TÓM TẮT ĐẶC BIỆT */}
          {announcement.summary && (
            <div className="p-3.5 sm:p-4 rounded-xl bg-amber-500/10 border-l-4 border-amber-500 text-amber-950 font-serif italic text-sm sm:text-[15px] leading-relaxed shadow-xs">
              “{announcement.summary}”
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
          <div className="space-y-3 pt-1 text-slate-800">
            {paragraphs.map((p, idx) => {
              // Hỗ trợ hiển thị gạch đầu dòng nếu có
              if (p.includes('•') || p.includes('- ')) {
                const lines = p.split('\n');
                return (
                  <div key={idx} className="space-y-1.5 py-1">
                    {lines.map((line, lIdx) => (
                      <p key={lIdx} className={line.trim().startsWith('•') || line.trim().startsWith('-') ? 'pl-3 font-sans' : 'font-sans font-medium'}>
                        {line}
                      </p>
                    ))}
                  </div>
                );
              }
              return (
                <p key={idx} className="font-sans text-slate-800 leading-relaxed whitespace-pre-line">
                  {p}
                </p>
              );
            })}
          </div>

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
                  <Copy className="w-3.5 h-3.5 text-blue-600" />
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
    </div>
  );
}
