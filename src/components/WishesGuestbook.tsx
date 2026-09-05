import React, { useState, useEffect, useMemo } from 'react';
import { 
  MessageSquareHeart, 
  Send, 
  Heart, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Users, 
  UserCheck, 
  RotateCcw,
  PenTool
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { WishData, ClassMember } from '../types';
import { CLASS_ROSTER_K8A1 } from '../data';

interface WishesGuestbookProps {
  appsScriptUrl: string;
  wishesList: WishData[];
  onAddWish: (wish: WishData) => void;
  classRoster?: ClassMember[];
  activeMember?: ClassMember | null;
  onSelectActiveMember?: (member: ClassMember | null) => void;
}

const EMOTION_TAGS = [
  'Hoài niệm',
  'Tri ân Thầy Cô',
  'Hân hoan hội ngộ',
  'Tuổi học trò 18',
  'Kỷ niệm xưa',
  'Mãi là K8A1'
];

export default function WishesGuestbook({ 
  appsScriptUrl, 
  wishesList, 
  onAddWish,
  classRoster,
  activeMember,
  onSelectActiveMember
}: WishesGuestbookProps) {
  const rosterList = classRoster && classRoster.length > 0 ? classRoster : CLASS_ROSTER_K8A1;

  const [fullName, setFullName] = useState('');
  const [className, setClassName] = useState('');
  const [message, setMessage] = useState('');
  const [selectedTag, setSelectedTag] = useState('❤️ Hoài niệm');
  const [isCustomMode, setIsCustomMode] = useState(false);
  
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

  const [filterTag, setFilterTag] = useState<string>('all');

  // Tự động đồng bộ thông tin khi activeMember thay đổi (chọn từ bất kỳ đâu trên webapp)
  useEffect(() => {
    if (activeMember) {
      setFullName(activeMember.fullName);
      const nickStr = activeMember.nickname ? `K8A1 — ${activeMember.nickname}` : 'Lớp K8A1 (2003 — 2006)';
      setClassName(nickStr);
      setIsCustomMode(false);
    } else if (!isCustomMode) {
      setFullName('');
      setClassName('');
    }
  }, [activeMember, isCustomMode]);

  // Xử lý khi người dùng chọn thành viên từ dropdown
  const handleSelectMember = (memberId: string) => {
    if (memberId === 'custom') {
      setIsCustomMode(true);
      if (onSelectActiveMember) onSelectActiveMember(null);
      setFullName('');
      setClassName('Cựu học sinh K8A1');
      return;
    }

    const member = rosterList.find((m) => m.id === memberId);
    if (member) {
      setIsCustomMode(false);
      if (onSelectActiveMember) {
        onSelectActiveMember(member);
      } else {
        setFullName(member.fullName);
        setClassName(member.nickname ? `K8A1 — ${member.nickname}` : 'Lớp K8A1 (2003 — 2006)');
      }
    }
  };

  const handleResetMember = () => {
    if (onSelectActiveMember) onSelectActiveMember(null);
    setIsCustomMode(false);
    setFullName('');
    setClassName('');
  };

  const handleToggleLike = (wishId?: string) => {
    if (!wishId) return;
    const newLiked = { ...likedWishes, [wishId]: !likedWishes[wishId] };
    setLikedWishes(newLiked);
    try {
      localStorage.setItem('liked_wishes', JSON.stringify(newLiked));
    } catch {}
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !message.trim()) {
      setSubmitStatus('error');
      setStatusMessage('Vui lòng nhập đầy đủ họ tên và lời chúc của bạn nhé!');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');

    const newWish: WishData = {
      id: 'wish-' + Date.now(),
      fullName: fullName.trim(),
      className: className.trim() || 'Lớp K8A1 (2003 — 2006)',
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

    // Bắn pháo hoa ăn mừng khi gửi lời chúc
    try {
      confetti({ particleCount: 35, spread: 60, origin: { y: 0.7 } });
    } catch {}

    // If Google Apps Script URL is set, send live POST request
    if (appsScriptUrl && appsScriptUrl.startsWith('http')) {
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
          setStatusMessage('Lời chúc đã được lưu thành công! 🎉');
          setMessage('');
        } else {
          throw new Error(result.message || 'Lỗi lưu vào Google Sheet');
        }
      } catch {
        // Fallback lưu cục bộ
        onAddWish(newWish);
        setSubmitStatus('success');
        setStatusMessage('Đã lưu lời chúc thành công! 🎉');
        setMessage('');
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setTimeout(() => {
        onAddWish(newWish);
        setSubmitStatus('success');
        setStatusMessage('Đã lưu lời chúc thành công! 🎉');
        setIsSubmitting(false);
        setMessage('');
      }, 400);
    }
  };

  const filteredWishes = useMemo(() => {
    return wishesList.filter(item => {
      if (filterTag === 'all') return true;
      return item.tag === filterTag;
    });
  }, [wishesList, filterTag]);

  return (
    <div id="luu-but-card" className="bg-[#FAF7F2] border border-amber-200/90 rounded-2xl p-4 sm:p-5 shadow-md space-y-3.5 text-left relative overflow-hidden">
      
      {/* HEADER GỌN GÀNG, TINH TẾ */}
      <div className="flex items-center justify-between border-b border-amber-200/80 pb-2.5 gap-2">
        <div className="min-w-0">
          <h3 className="text-base sm:text-lg font-serif font-bold text-[#1E293B] truncate leading-tight">
            Gửi Gắm Kỷ Niệm 20 Năm
          </h3>
          <p className="text-[11px] text-slate-500 font-serif italic truncate">
            Lưu bút & lời chúc gửi tặng thầy cô, bạn bè Lớp K8A1
          </p>
        </div>

        <span className="text-xs font-sans font-bold text-amber-900 bg-amber-100/90 px-2.5 py-1 rounded-lg border border-amber-300/60 shrink-0">
          {wishesList.length} Lời Chúc
        </span>
      </div>

      {/* KHỐI NHẬN DIỆN THÀNH VIÊN ĐỒNG BỘ */}
      <div className="bg-[#FAF8F5] border border-amber-200/90 rounded-xl px-3 py-2 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 shadow-2xs">
        {activeMember ? (
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 text-white font-serif font-bold text-[11px] flex items-center justify-center shrink-0 shadow-2xs">
                {activeMember.fullName.charAt(0).toUpperCase()}
              </div>
              <span className="font-serif font-bold text-slate-900 truncate">{activeMember.fullName}</span>
              {activeMember.nickname && (
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-sans font-bold shrink-0">
                  “{activeMember.nickname}”
                </span>
              )}
              <span className="text-[10px] text-emerald-700 font-sans hidden sm:inline">(Đã đồng bộ)</span>
            </div>
            <button
              type="button"
              onClick={handleResetMember}
              className="text-[11px] text-amber-800 hover:text-amber-950 font-bold underline cursor-pointer shrink-0 ml-2"
            >
              Chọn bạn khác
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 w-full">
            <select
              value={isCustomMode ? 'custom' : ''}
              onChange={(e) => handleSelectMember(e.target.value)}
              className="flex-1 bg-white border border-amber-300 rounded-lg py-1 px-2.5 text-xs text-slate-800 font-sans cursor-pointer focus:outline-none focus:border-amber-500 shadow-2xs font-medium"
            >
              <option value="">-- Chọn tên bạn trong Danh Bạ K8A1 để tự điền thông tin --</option>
              {rosterList.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.fullName} {m.nickname ? `(${m.nickname})` : ''} {m.role && m.role !== 'Thành viên' ? `— [${m.role}]` : ''}
                </option>
              ))}
              <option value="custom">Tự nhập họ tên khác</option>
            </select>
          </div>
        )}
      </div>

      {/* 📝 FORM SOẠN LƯU BÚT GỌN GÀNG */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200/90 p-3 sm:p-4 space-y-2.5 shadow-2xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <div className="space-y-0.5">
            <label className="block text-[11px] font-bold text-slate-700 font-sans">
              Họ và tên <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Nguyễn Văn A"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 focus:bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="space-y-0.5">
            <label className="block text-[11px] font-bold text-slate-700 font-sans">
              Biệt danh / Danh xưng
            </label>
            <input
              type="text"
              placeholder="K8A1 — Tuấn Béo"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 focus:bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="space-y-0.5">
            <label className="block text-[11px] font-bold text-slate-700 font-sans">
              Gắn cảm xúc kỷ niệm
            </label>
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 focus:bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-amber-500 cursor-pointer font-sans"
            >
              {EMOTION_TAGS.map((tag) => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-0.5">
          <textarea
            required
            rows={2}
            placeholder="Viết vài dòng tâm sự, kỷ niệm xưa hoặc lời chúc gửi tới thầy cô, bạn bè K8A1..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full px-2.5 py-1.5 bg-slate-50 focus:bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-amber-500 font-serif leading-relaxed resize-none"
          />
        </div>

        {submitStatus === 'success' && (
          <div className="p-2 bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 rounded-lg flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="font-serif">{statusMessage}</span>
          </div>
        )}

        {submitStatus === 'error' && (
          <div className="p-2 bg-rose-50 border border-rose-200 text-xs text-rose-700 rounded-lg flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        <div className="flex items-center justify-between pt-0.5">
          <span className="text-[10px] text-slate-400 font-serif italic hidden sm:inline">
            Tự động đồng bộ vào Google Sheets tab "Loi_Chuc"
          </span>

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white rounded-lg text-xs font-sans font-bold uppercase tracking-wider shadow-xs transition-all cursor-pointer disabled:opacity-50 ml-auto"
          >
            {isSubmitting ? (
              <span>Đang lưu...</span>
            ) : (
              <>
                <Send className="w-3 h-3" />
                <span>Gửi Lưu Bút</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* 🌟 BỨC TƯỜNG LƯU BÚT FEED (MAX-HEIGHT VỚI THANH CUỘN MỀM) */}
      <div className="space-y-2.5 pt-1">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200/60 pb-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#1E293B] font-serif">
            <PenTool className="w-3.5 h-3.5 text-amber-700" />
            <span>Dòng Lưu Bút Thân Tình ({wishesList.length})</span>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 overflow-x-auto pb-0.5 text-[11px]">
            <button
              type="button"
              onClick={() => setFilterTag('all')}
              className={`px-2 py-0.5 rounded font-sans transition-all cursor-pointer whitespace-nowrap ${
                filterTag === 'all'
                  ? 'bg-amber-700 text-white font-bold shadow-2xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-amber-50'
              }`}
            >
              Tất cả ({wishesList.length})
            </button>
            {EMOTION_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setFilterTag(tag)}
                className={`px-2 py-0.5 rounded font-sans whitespace-nowrap transition-all cursor-pointer ${
                  filterTag === tag
                    ? 'bg-amber-700 text-white font-bold shadow-2xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-amber-50'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Wishes List Cards Grid (Max-height cuộn mượt, không kéo dài trang) */}
        {filteredWishes.length === 0 ? (
          <div className="text-center py-6 border border-dashed border-amber-200 rounded-xl bg-white/70 text-slate-500 text-xs font-serif italic">
            Chưa có lời chúc nào trong mục này. Hãy là người đầu tiên để lại lưu bút nhé!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[380px] overflow-y-auto pr-1">
            {filteredWishes.map((wish) => {
              const isLiked = wish.id ? likedWishes[wish.id] : false;
              const likeCount = (wish.likes || 0) + (isLiked ? 1 : 0);

              return (
                <div 
                  key={wish.id}
                  className="p-3 rounded-xl border border-amber-200/70 bg-white shadow-2xs space-y-2 relative group hover:border-amber-400 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-start justify-between gap-1.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 text-white flex items-center justify-center font-serif text-[10px] font-bold shrink-0 shadow-2xs">
                          {wish.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <h5 className="font-serif font-bold text-xs text-[#1E293B] truncate leading-tight">
                            {wish.fullName}
                          </h5>
                          <p className="text-[10px] text-slate-500 font-serif italic truncate">
                            {wish.className}
                          </p>
                        </div>
                      </div>

                      {wish.tag && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-50 border border-amber-200 text-amber-900 font-sans font-medium shrink-0">
                          {wish.tag}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-700 font-serif italic leading-relaxed pt-0.5">
                      "{wish.message}"
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-1.5 border-t border-slate-100 text-[10px] text-slate-400 font-sans">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-600" />
                      <span>{wish.submittedAt || 'Gần đây'}</span>
                    </span>

                    <button
                      type="button"
                      onClick={() => handleToggleLike(wish.id)}
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded transition-all cursor-pointer ${
                        isLiked 
                          ? 'bg-rose-50 text-rose-600 font-bold border border-rose-200' 
                          : 'hover:bg-slate-50 text-slate-500 hover:text-rose-500'
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
