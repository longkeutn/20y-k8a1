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
  '❤️ Hoài niệm',
  '🎓 Tri ân Thầy Cô',
  '🎉 Hân hoan hội ngộ',
  '🌸 Tuổi học trò 18',
  '☕ Kỷ niệm xưa',
  '✨ Mãi là K8A1'
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
          setStatusMessage('Lời chúc của bạn đã được lưu vào Bức Tường Kỷ Niệm & Google Sheet của lớp! 🎉');
          setMessage('');
        } else {
          throw new Error(result.message || 'Lỗi lưu vào Google Sheet');
        }
      } catch {
        // Fallback lưu cục bộ
        onAddWish(newWish);
        setSubmitStatus('success');
        setStatusMessage('Đã lưu lời chúc vào Sổ lưu bút kỷ niệm thành công! 🎉');
        setMessage('');
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setTimeout(() => {
        onAddWish(newWish);
        setSubmitStatus('success');
        setStatusMessage('Đã lưu lời chúc vào Sổ lưu bút kỷ niệm thành công! 🎉');
        setIsSubmitting(false);
        setMessage('');
      }, 500);
    }
  };

  const filteredWishes = useMemo(() => {
    return wishesList.filter(item => {
      if (filterTag === 'all') return true;
      return item.tag === filterTag;
    });
  }, [wishesList, filterTag]);

  return (
    <div id="luu-but-card" className="bg-[#FAF7F2] border border-amber-200/90 rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-lg space-y-6 text-left relative overflow-hidden">
      
      {/* Nền hoa văn vân sáng tinh tế */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-amber-200/20 via-orange-100/10 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-amber-300/15 via-transparent to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* 🌟 HEADER SANG TRỌNG */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-amber-300/60 pb-4 sm:pb-5 gap-3 relative z-10">
        <div className="space-y-1.5 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/90 text-amber-950 text-xs font-bold tracking-wider font-sans uppercase border border-amber-300/80 shadow-2xs">
            <MessageSquareHeart className="w-3.5 h-3.5 text-amber-700" />
            <span>Sổ Lưu Bút Số • Kỷ Niệm 20 Năm K8A1 (2006 — 2026)</span>
          </div>

          <h3 className="text-2xl sm:text-3xl font-serif font-bold text-[#1E293B] tracking-tight">
            Gửi Gắm Kỷ Niệm 20 Năm
          </h3>

          <p className="text-xs sm:text-sm text-slate-600 font-serif italic leading-relaxed">
            “Mỗi dòng lưu bút là một nhịp cầu thanh xuân — hãy viết những lời chúc, kỷ niệm đẹp gửi tặng thầy cô và bạn bè K8A1.”
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-sans font-bold text-amber-900 bg-amber-100/80 px-3 py-1.5 rounded-xl border border-amber-300/60">
            {wishesList.length} Lời Chúc Thân Tình
          </span>
        </div>
      </div>

      {/* 🌟 FORM VIẾT LƯU BÚT THÔNG MINH */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-6 shadow-sm space-y-4 relative z-10">
        
        {/* ======================================================== */}
        {/* 👤 KHỐI NHẬN DIỆN THÀNH VIÊN ĐỒNG BỘ TOÀN DỰ ÁN */}
        {/* ======================================================== */}
        <div className="bg-[#FAF8F5] border border-amber-200 rounded-xl p-3.5 space-y-2.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200/60 pb-2">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-900 uppercase font-sans tracking-wide">
              <Users className="w-4 h-4 text-amber-700 shrink-0" />
              <span>Nhận diện thành viên Lớp K8A1</span>
            </div>
            
            {activeMember ? (
              <button
                type="button"
                onClick={handleResetMember}
                className="inline-flex items-center gap-1 text-[11px] font-sans font-semibold text-amber-800 hover:text-amber-950 bg-amber-100/70 hover:bg-amber-100 px-2.5 py-1 rounded-lg border border-amber-300/70 transition cursor-pointer"
                title="Đổi sang bạn khác hoặc tự nhập tên"
              >
                <RotateCcw className="w-3 h-3 text-amber-700" />
                <span>Chọn bạn khác / Tự nhập</span>
              </button>
            ) : (
              <span className="text-[11px] text-slate-500 font-serif italic">
                (Chọn 1 lần sẽ tự động điền cả phần Điểm danh & Quỹ lớp)
              </span>
            )}
          </div>

          {activeMember ? (
            /* Khi đã nhận diện được thành viên */
            <div className="flex items-center justify-between gap-3 bg-white p-3 rounded-lg border border-emerald-200 shadow-2xs">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 text-white font-serif font-bold text-sm flex items-center justify-center shrink-0 shadow-2xs">
                  {activeMember.fullName.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-serif font-bold text-sm text-[#1E293B] truncate">
                      {activeMember.fullName}
                    </h4>
                    {activeMember.nickname && (
                      <span className="text-[11px] px-2 py-0.2 rounded-md bg-amber-100 text-amber-800 font-sans font-bold">
                        {activeMember.nickname}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-emerald-700 font-sans flex items-center gap-1">
                    <UserCheck className="w-3 h-3" />
                    <span>Đã đồng bộ thông tin danh bạ K8A1</span>
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* Khi chưa nhận diện: Dropdown chọn nhanh từ Roster */
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center">
              <div className="sm:col-span-8">
                <select
                  value={isCustomMode ? 'custom' : ''}
                  onChange={(e) => handleSelectMember(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-amber-300/80 rounded-xl text-xs font-sans text-slate-800 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 shadow-2xs cursor-pointer"
                >
                  <option value="">-- Bấm vào đây để chọn tên bạn trong Danh Bạ K8A1 --</option>
                  {rosterList.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.fullName} {m.nickname ? `(${m.nickname})` : ''} {m.role && m.role !== 'Thành viên' ? `— [${m.role}]` : ''}
                    </option>
                  ))}
                  <option value="custom">✍️ Tự nhập họ tên khác (Khách mời / Thầy cô / Bạn bè ngoài lớp)</option>
                </select>
              </div>

              <div className="sm:col-span-4 text-[11px] text-slate-500 font-serif italic">
                {isCustomMode ? 'Đang ở chế độ tự nhập họ tên' : 'Chọn đúng tên để cả lớp nhận ra bạn ngay!'}
              </div>
            </div>
          )}
        </div>

        {/* ======================================================== */}
        {/* 📝 CÁC TRƯỜNG THÔNG TIN SOẠN LỜI CHÚC */}
        {/* ======================================================== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700 font-sans">
              Họ và tên của bạn: <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="VD: Nguyễn Tuấn Anh"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition shadow-2xs"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700 font-sans">
              Danh xưng / Biệt danh / Niên khóa:
            </label>
            <input
              type="text"
              placeholder="VD: K8A1 — Tuấn Báo"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition shadow-2xs"
            />
          </div>
        </div>

        {/* Bộ Tag Cảm Xúc Kỷ Niệm */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700 font-sans">
            Gắn cảm xúc kỷ niệm:
          </label>
          <div className="flex flex-wrap gap-2">
            {EMOTION_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setSelectedTag(tag)}
                className={`px-3 py-1.5 rounded-xl text-xs font-sans transition-all cursor-pointer ${
                  selectedTag === tag
                    ? 'bg-amber-700 text-white font-bold shadow-xs scale-102 ring-2 ring-amber-400/40'
                    : 'bg-slate-50 hover:bg-amber-50 text-slate-700 border border-slate-200/90 hover:border-amber-300'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Khung Soạn Lời Chúc */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700 font-sans">
            Nội dung lời chúc / Kỷ niệm gửi gắm: <span className="text-rose-500">*</span>
          </label>
          <textarea
            required
            rows={3}
            placeholder="Hãy viết vài dòng tâm sự, nhắn gửi đến bạn bè, thầy cô nhân ngày hội ngộ 20 năm ngày ra trường..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition shadow-2xs font-serif leading-relaxed"
          />
        </div>

        {/* Thông báo trạng thái gửi */}
        {submitStatus === 'success' && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-serif">{statusMessage}</span>
          </div>
        )}

        {submitStatus === 'error' && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-xs text-rose-700 rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Nút gửi */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-[11px] text-slate-400 font-serif italic hidden sm:inline">
            Tự động lưu vào Google Sheets tab "Loi_Chuc"
          </span>

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white rounded-xl text-xs font-sans font-bold uppercase tracking-wider shadow-md hover:shadow-lg transition-all cursor-pointer transform hover:-translate-y-0.5 disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>Đang lưu vào sổ...</span>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>Gửi Lời Chúc Mừng</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* ======================================================== */}
      {/* 🌟 BỨC TƯỜNG LƯU BÚT THÂN TÌNH (FEED) */}
      {/* ======================================================== */}
      <div className="space-y-4 pt-2 relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-200/80 pb-3">
          <div className="flex items-center gap-2">
            <PenTool className="w-4 h-4 text-amber-700" />
            <h4 className="font-serif font-bold text-sm text-[#1E293B]">
              Dòng Lưu Bút Thân Tình ({wishesList.length})
            </h4>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs">
            <button
              type="button"
              onClick={() => setFilterTag('all')}
              className={`px-3 py-1 rounded-lg font-sans transition-all cursor-pointer text-xs ${
                filterTag === 'all'
                  ? 'bg-amber-700 text-white font-bold shadow-xs'
                  : 'bg-white hover:bg-amber-50 text-slate-600 border border-slate-200'
              }`}
            >
              Tất cả ({wishesList.length})
            </button>
            {EMOTION_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setFilterTag(tag)}
                className={`px-2.5 py-1 rounded-lg font-sans whitespace-nowrap transition-all cursor-pointer text-xs ${
                  filterTag === tag
                    ? 'bg-amber-700 text-white font-bold shadow-xs'
                    : 'bg-white hover:bg-amber-50 text-slate-600 border border-slate-200'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Wishes List Cards Grid */}
        {filteredWishes.length === 0 ? (
          <div className="text-center py-10 border-2 border-dashed border-amber-200 rounded-2xl bg-white/70 text-slate-500 text-xs font-serif italic">
            Chưa có lời chúc nào trong mục này. Hãy là người đầu tiên để lại lưu bút nhé!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredWishes.map((wish) => {
              const isLiked = wish.id ? likedWishes[wish.id] : false;
              const likeCount = (wish.likes || 0) + (isLiked ? 1 : 0);

              return (
                <div 
                  key={wish.id}
                  className="p-4 rounded-2xl border border-amber-200/70 bg-white/95 shadow-xs space-y-2.5 relative group hover:border-amber-400 hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 text-white flex items-center justify-center font-serif text-xs font-bold shrink-0 shadow-2xs">
                          {wish.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <h5 className="font-serif font-bold text-xs text-[#1E293B] truncate">
                            {wish.fullName}
                          </h5>
                          <p className="text-[10px] text-slate-500 font-serif italic truncate">
                            {wish.className}
                          </p>
                        </div>
                      </div>

                      {wish.tag && (
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-900 font-sans font-medium shrink-0">
                          {wish.tag}
                        </span>
                      )}
                    </div>

                    {/* Nội dung lời chúc */}
                    <p className="text-xs text-slate-700 font-serif italic leading-relaxed pt-0.5">
                      "{wish.message}"
                    </p>
                  </div>

                  {/* Footer Card */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[10px] text-slate-400 font-sans">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-600" />
                      <span>{wish.submittedAt || 'Gần đây'}</span>
                    </span>

                    <button
                      type="button"
                      onClick={() => handleToggleLike(wish.id)}
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg transition-all cursor-pointer ${
                        isLiked 
                          ? 'bg-rose-50 text-rose-600 font-bold border border-rose-200' 
                          : 'hover:bg-slate-50 text-slate-500 hover:text-rose-500 border border-transparent'
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
