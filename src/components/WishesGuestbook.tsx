import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageSquareHeart, 
  Send, 
  Heart, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Smile, 
  User, 
  GraduationCap, 
  Clock,
  Share2,
  Code2
} from 'lucide-react';
import { WishData } from '../types';

interface WishesGuestbookProps {
  appsScriptUrl: string;
  wishesList: WishData[];
  onAddWish: (wish: WishData) => void;
}

const EMOTION_TAGS = [
  '❤️ Hoài niệm',
  '🎓 Tự hào',
  '🎉 Hân hoan',
  '🌸 Tuổi học trò',
  '☕ Kỷ niệm xưa'
];

export default function WishesGuestbook({ appsScriptUrl, wishesList, onAddWish }: WishesGuestbookProps) {
  const [fullName, setFullName] = useState('');
  const [className, setClassName] = useState('');
  const [message, setMessage] = useState('');
  const [selectedTag, setSelectedTag] = useState('❤️ Hoài niệm');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  
  // Local likes tracker for interactive feedback
  const [likedWishes, setLikedWishes] = useState<Record<string, boolean>>(() => {
    try {
      const stored = localStorage.getItem('liked_wishes');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  const [activeTab, setActiveTab] = useState<'all' | 'tag'>('all');
  const [filterTag, setFilterTag] = useState<string>('all');
  const [showCodeModal, setShowCodeModal] = useState(false);

  const handleToggleLike = (wishId?: string) => {
    if (!wishId) return;
    const newLiked = { ...likedWishes, [wishId]: !likedWishes[wishId] };
    setLikedWishes(newLiked);
    localStorage.setItem('liked_wishes', JSON.stringify(newLiked));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !message.trim()) {
      setSubmitStatus('error');
      setStatusMessage('Vui lòng nhập họ tên và lời chúc của bạn nhé!');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');

    const newWish: WishData = {
      id: 'wish-' + Date.now(),
      fullName: fullName.trim(),
      className: className.trim() || 'Niên khóa 2003 - 2006',
      message: message.trim(),
      tag: selectedTag,
      likes: 0,
      submittedAt: new Date().toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    };

    // If Google Apps Script URL is set, send live POST request
    if (appsScriptUrl) {
      try {
        const response = await fetch(appsScriptUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: JSON.stringify({
            action: 'add_wish',
            ...newWish
          })
        });

        const result = await response.json();
        if (result.status === 'success') {
          onAddWish(newWish);
          setSubmitStatus('success');
          setStatusMessage('Lời chúc của bạn đã được ghi vào Sheet "Loi_Chuc" của lớp!');
          resetForm();
        } else {
          throw new Error(result.message || 'Có lỗi xảy ra khi lưu vào Google Sheets');
        }
      } catch (err: any) {
        // Fallback: save to local state and notify user
        onAddWish(newWish);
        setSubmitStatus('success');
        setStatusMessage('Đã lưu lời chúc vào sổ lưu bút thành công (Chế độ cục bộ)!');
        resetForm();
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Demo mode fallback
      setTimeout(() => {
        onAddWish(newWish);
        setSubmitStatus('success');
        setStatusMessage('Lời chúc đã được lưu vào Sổ lưu bút kỷ niệm! (Đang chạy ở chế độ Demo)');
        setIsSubmitting(false);
        resetForm();
      }, 500);
    }
  };

  const resetForm = () => {
    setMessage('');
    setTimeout(() => {
      setSubmitStatus('idle');
    }, 4000);
  };

  const filteredWishes = wishesList.filter(item => {
    if (filterTag === 'all') return true;
    return item.tag === filterTag;
  });

  return (
    <div id="guestbook-module" className="bg-white border border-brand-border rounded-sm p-6 md:p-8 shadow-xs space-y-8">
      
      {/* Header */}
      <div className="border-b border-brand-border pb-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-[0.2em] font-sans font-bold text-brand-gold flex items-center gap-1.5">
            <MessageSquareHeart className="w-4 h-4" />
            <span>SỔ LƯU BÚT & LỜI CHÚC MỪNG</span>
          </span>
          <h2 className="text-2xl font-light text-brand-text font-serif mt-1">
            Gửi Gắm Kỷ Niệm 20 Năm
          </h2>
          <p className="text-xs text-brand-text-muted font-serif italic mt-1">
            Lưu giữ những tâm tư, lời chúc thân tình vào trang tính "Loi_Chuc" riêng biệt
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowCodeModal(!showCodeModal)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm border border-brand-border bg-[#FAF9F6] text-[10px] uppercase tracking-wider font-sans font-bold text-brand-text hover:bg-brand-border/20 transition-colors cursor-pointer"
            title="Xem mã nguồn HTML, CSS, JS & Google Apps Script"
          >
            <Code2 className="w-3.5 h-3.5 text-brand-gold" />
            <span>Xem Mã Nguồn Module</span>
          </button>
        </div>
      </div>

      {/* Code Snippet Modal / Drawer */}
      <AnimatePresence>
        {showCodeModal && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden bg-[#FAF9F6] border border-brand-border rounded-sm p-5 space-y-4 text-xs"
          >
            <div className="flex items-center justify-between border-b border-brand-border pb-2">
              <span className="font-sans font-bold uppercase tracking-wider text-[10px] text-brand-text">
                Mã Nguồn Tích Hợp Module Lời Chúc Mừng & Google Apps Script
              </span>
              <button
                type="button"
                onClick={() => setShowCodeModal(false)}
                className="text-[10px] text-brand-text-muted hover:text-brand-text uppercase font-bold"
              >
                Đóng ✕
              </button>
            </div>

            <p className="text-brand-text-muted font-serif italic text-xs leading-relaxed">
              Dưới đây là kiến trúc <strong>HTML, CSS, JS và Google Apps Script</strong> xử lý việc gửi và nhận lời chúc lưu vào sheet <code>Loi_Chuc</code>:
            </p>

            <div className="space-y-3 font-mono text-[11px]">
              <div>
                <span className="font-bold font-sans text-[10px] uppercase text-brand-gold">1. Google Apps Script (Backend):</span>
                <pre className="bg-slate-900 text-slate-100 p-3 rounded-sm mt-1 overflow-x-auto">
{`// Lưu vào sheet riêng "Loi_Chuc"
function saveWish(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName("Loi_Chuc");
  if (!sheet) {
    sheet = ss.insertSheet("Loi_Chuc");
    sheet.appendRow(['Họ tên', 'Lớp / Niên khóa', 'Lời chúc', 'Cảm xúc', 'Lượt thích', 'Thời gian gửi']);
  }
  sheet.appendRow([data.fullName, data.className, data.message, data.tag, 0, new Date()]);
  return { status: 'success', message: 'Đã lưu lời chúc thành công!' };
}`}
                </pre>
              </div>

              <div>
                <span className="font-bold font-sans text-[10px] uppercase text-brand-gold">2. HTML & Javascript (Frontend Submit):</span>
                <pre className="bg-slate-900 text-slate-100 p-3 rounded-sm mt-1 overflow-x-auto">
{`fetch(APPS_SCRIPT_URL, {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: JSON.stringify({
    action: 'add_wish',
    fullName: 'Nguyễn Văn A',
    className: '12A1',
    message: 'Chúc mừng 20 năm ngày ra trường!',
    tag: '❤️ Hoài niệm'
  })
})
.then(res => res.json())
.then(data => console.log('Đã lưu vào Sheet:', data));`}
                </pre>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Form Gửi Lời Chúc */}
      <form onSubmit={handleSubmit} className="bg-[#FAF9F6] p-6 rounded-sm border border-brand-border space-y-5">
        <div className="flex items-center gap-2 border-b border-brand-border/60 pb-2">
          <Sparkles className="w-4 h-4 text-brand-gold" />
          <h3 className="text-xs uppercase tracking-wider font-sans font-bold text-brand-text">
            Viết Lời Chúc / Lưu Bút Vào Trang Kỷ Niệm
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-[10px] font-sans font-bold uppercase tracking-wider text-brand-text">
              Họ và tên của bạn <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="VD: Nguyễn Văn Nam"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2 border-b border-brand-border bg-transparent text-brand-text text-xs focus:outline-none focus:border-brand-gold placeholder:text-brand-text-muted/50"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-sans font-bold uppercase tracking-wider text-brand-text">
              Lớp / Danh xưng / Niên khóa
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="VD: 12A1 (Ban Tự Nhiên)"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                className="w-full px-3 py-2 border-b border-brand-border bg-transparent text-brand-text text-xs focus:outline-none focus:border-brand-gold placeholder:text-brand-text-muted/50"
              />
            </div>
          </div>
        </div>

        {/* Emotion Tag Selection */}
        <div className="space-y-2">
          <label className="block text-[10px] font-sans font-bold uppercase tracking-wider text-brand-text">
            Gắn cảm xúc kỷ niệm:
          </label>
          <div className="flex flex-wrap gap-2">
            {EMOTION_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setSelectedTag(tag)}
                className={`px-3 py-1.5 rounded-sm text-xs font-sans transition-all cursor-pointer ${
                  selectedTag === tag
                    ? 'bg-brand-text text-white font-bold shadow-xs'
                    : 'bg-white border border-brand-border text-brand-text-muted hover:border-brand-gold'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Message Input */}
        <div className="space-y-1">
          <label className="block text-[10px] font-sans font-bold uppercase tracking-wider text-brand-text">
            Nội dung lời chúc / Kỷ niệm gửi gắm <span className="text-red-500">*</span>
          </label>
          <textarea
            required
            rows={3}
            placeholder="Hãy viết vài dòng tâm sự, nhắn gửi đến bạn bè, thầy cô nhân ngày hội ngộ 20 năm..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full px-3 py-2 border-b border-brand-border bg-transparent text-brand-text text-xs focus:outline-none focus:border-brand-gold placeholder:text-brand-text-muted/50 resize-none font-serif"
          />
        </div>

        {/* Feedback message */}
        {submitStatus === 'success' && (
          <div className="p-3 bg-brand-gold-light border border-brand-border text-xs text-brand-text rounded-sm flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-700 shrink-0" />
            <span className="font-serif italic">{statusMessage}</span>
          </div>
        )}

        {submitStatus === 'error' && (
          <div className="p-3 bg-red-50 border border-red-200 text-xs text-red-700 rounded-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Submit button */}
        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-brand-text hover:bg-brand-text/90 text-white font-sans font-bold text-xs uppercase tracking-wider py-2.5 px-6 rounded-sm transition-all shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>Đang lưu vào Sheet...</span>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>Gửi lời chúc mừng</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Danh Sách Lời Chúc (Feed) */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-brand-border pb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-xs uppercase tracking-wider font-sans font-bold text-brand-text">
              Những Dòng Lưu Bút Thân Tình ({wishesList.length})
            </h3>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-[10px]">
            <button
              type="button"
              onClick={() => setFilterTag('all')}
              className={`px-2.5 py-1 rounded-sm uppercase tracking-wider font-sans transition-all cursor-pointer ${
                filterTag === 'all'
                  ? 'bg-brand-text text-white font-bold'
                  : 'bg-[#FAF9F6] text-brand-text-muted hover:text-brand-text border border-brand-border'
              }`}
            >
              Tất cả
            </button>
            {EMOTION_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setFilterTag(tag)}
                className={`px-2 py-1 rounded-sm uppercase tracking-wider font-sans whitespace-nowrap transition-all cursor-pointer ${
                  filterTag === tag
                    ? 'bg-brand-text text-white font-bold'
                    : 'bg-[#FAF9F6] text-brand-text-muted hover:text-brand-text border border-brand-border'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Wishes List Cards */}
        {filteredWishes.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-brand-border rounded-sm bg-[#FAF9F6] text-brand-text-muted text-xs font-serif italic">
            Chưa có lời chúc nào trong mục này. Hãy là người đầu tiên để lại lưu bút nhé!
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredWishes.map((wish) => {
              const isLiked = wish.id ? likedWishes[wish.id] : false;
              const likeCount = (wish.likes || 0) + (isLiked ? 1 : 0);

              return (
                <div 
                  key={wish.id}
                  className="p-5 rounded-sm border border-brand-border bg-white shadow-2xs space-y-3 relative group hover:border-brand-gold transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-brand-gold-light text-brand-gold flex items-center justify-center font-serif text-sm font-bold border border-brand-border/40">
                        {wish.fullName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-brand-text">
                          {wish.fullName}
                        </h4>
                        <p className="text-[10px] text-brand-text-muted font-serif italic">
                          {wish.className}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {wish.tag && (
                        <span className="text-[10px] px-2 py-0.5 rounded-sm bg-[#FAF9F6] border border-brand-border text-brand-text font-sans">
                          {wish.tag}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Message body in warm serif font */}
                  <p className="text-xs text-brand-text font-serif italic leading-relaxed pt-1">
                    "{wish.message}"
                  </p>

                  {/* Card footer: timestamp & like button */}
                  <div className="flex items-center justify-between pt-2 border-t border-brand-border/30 text-[10px] text-brand-text-muted">
                    <span className="flex items-center gap-1 font-sans">
                      <Clock className="w-3 h-3 text-brand-gold" />
                      <span>{wish.submittedAt || 'Hôm nay'}</span>
                    </span>

                    <button
                      type="button"
                      onClick={() => handleToggleLike(wish.id)}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-sm transition-all cursor-pointer ${
                        isLiked 
                          ? 'bg-rose-50 text-rose-600 font-bold' 
                          : 'hover:bg-[#FAF9F6] text-brand-text-muted hover:text-rose-500'
                      }`}
                    >
                      <Heart className={`w-3 h-3 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                      <span>{likeCount > 0 ? likeCount : 'Thích'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
