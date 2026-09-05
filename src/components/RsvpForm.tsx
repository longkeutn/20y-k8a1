import React, { useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { 
  CheckCircle2, 
  Sparkles, 
  UserCheck, 
  ChevronDown, 
  Shirt, 
  ArrowRight, 
  HeartHandshake, 
  X, 
  RefreshCw,
  Award,
  Receipt,
  User,
  Phone,
  MessageSquare
} from 'lucide-react';
import { RsvpData, ClassMember } from '../types';
import { CLASS_ROSTER_K8A1, SHIRT_SIZE_OPTIONS } from '../data';

interface RsvpFormProps {
  appsScriptUrl: string;
  rsvpList: RsvpData[];
  classRoster?: ClassMember[];
  activeMember?: ClassMember | null;
  onSelectActiveMember?: (member: ClassMember | null) => void;
  onAddRsvp: (newRsvp: RsvpData) => void;
  onOpenPassModal?: (attendee: RsvpData) => void;
  onOpenReceiptModal?: (attendee?: RsvpData) => void;
}

export default function RsvpForm({
  appsScriptUrl,
  rsvpList,
  classRoster,
  activeMember,
  onSelectActiveMember,
  onAddRsvp,
  onOpenPassModal,
  onOpenReceiptModal
}: RsvpFormProps) {
  const rosterList = classRoster && classRoster.length > 0 ? classRoster : CLASS_ROSTER_K8A1;

  const [fullName, setFullName] = useState('');
  const [nickname, setNickname] = useState('');
  const [phone, setPhone] = useState('');
  const [shirtSize, setShirtSize] = useState('L');
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [status, setStatus] = useState<'yes' | 'no'>('yes');
  const [message, setMessage] = useState('');
  const [isCustomMode, setIsCustomMode] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [lastSubmittedAttendee, setLastSubmittedAttendee] = useState<RsvpData | null>(null);

  // Chuẩn hóa SĐT an toàn
  const normalizePhone = (p?: any) => {
    if (p === null || p === undefined) return '';
    let clean = String(p).replace(/[^0-9]/g, '');
    if (clean.startsWith('84') && clean.length > 9) clean = '0' + clean.slice(2);
    else if (!clean.startsWith('0') && clean.length === 9) clean = '0' + clean;
    return clean;
  };

  // Chuẩn hóa họ tên
  const normalizeName = (n?: any) => {
    if (n === null || n === undefined) return '';
    return String(n).trim().toLowerCase().replace(/\s+/g, ' ');
  };

  // Tìm kiếm xem bạn này đã từng đăng ký trong rsvpList chưa
  const matchedExistingAttendee = useMemo(() => {
    const p = normalizePhone(phone);
    const n = normalizeName(fullName);
    if (!p && !n) return null;
    return (rsvpList || []).find((item) => {
      if (!item) return false;
      const itemP = normalizePhone(item.phone);
      const itemN = normalizeName(item.fullName);
      if (p && itemP && p === itemP) return true;
      if (!p && n && itemN && n === itemN) return true;
      if (n && itemN && n === itemN && (!itemP || !p || p === itemP)) return true;
      return false;
    });
  }, [phone, fullName, rsvpList]);

  // Đồng bộ thông tin khi activeMember thay đổi từ bất kỳ đâu
  useEffect(() => {
    if (activeMember) {
      setFullName(activeMember.fullName);
      if (activeMember.nickname) setNickname(activeMember.nickname);
      if (activeMember.shirtSize) {
        const normalizedSize = activeMember.shirtSize.toUpperCase() === 'XXL' ? '2XL' : activeMember.shirtSize.toUpperCase();
        setShirtSize(normalizedSize);
      }
      if (activeMember.phone) setPhone(String(activeMember.phone));
      setIsCustomMode(false);

      const existing = (rsvpList || []).find((item) => {
        if (!item) return false;
        const itemP = normalizePhone(item.phone);
        const itemN = normalizeName(item.fullName);
        const mP = normalizePhone(activeMember.phone);
        const mN = normalizeName(activeMember.fullName);
        if (mP && itemP && mP === itemP) return true;
        if (mN && itemN && mN === itemN) return true;
        return false;
      });

      if (existing) {
        if (existing.phone) setPhone(String(existing.phone));
        if (existing.shirtSize) {
          const normSize = existing.shirtSize.toUpperCase() === 'XXL' ? '2XL' : existing.shirtSize.toUpperCase();
          setShirtSize(normSize);
        }
        if (existing.status) setStatus(existing.status);
        if (existing.message) setMessage(String(existing.message));
        if (existing.nickname) setNickname(String(existing.nickname));
      }
    } else if (!isCustomMode) {
      setFullName('');
      setNickname('');
      setPhone('');
      setMessage('');
      setStatus('yes');
    }
  }, [activeMember, isCustomMode, rsvpList]);

  // Chọn thành viên từ dropdown
  const handleSelectMember = (memberId: string) => {
    if (memberId === 'custom') {
      setIsCustomMode(true);
      if (onSelectActiveMember) onSelectActiveMember(null);
      setFullName('');
      setNickname('');
      setPhone('');
      return;
    }

    if (!memberId) {
      if (onSelectActiveMember) onSelectActiveMember(null);
      setFullName('');
      setNickname('');
      setPhone('');
      return;
    }

    const member = rosterList.find((m) => m.id === memberId);
    if (member) {
      setIsCustomMode(false);
      if (onSelectActiveMember) {
        onSelectActiveMember(member);
      } else {
        setFullName(member.fullName);
        if (member.nickname) setNickname(member.nickname);
        if (member.shirtSize) {
          const normSize = member.shirtSize.toUpperCase() === 'XXL' ? '2XL' : member.shirtSize.toUpperCase();
          setShirtSize(normSize);
        }
        if (member.phone) setPhone(String(member.phone));
      }
    }
  };

  const handleResetMember = () => {
    if (onSelectActiveMember) onSelectActiveMember(null);
    setIsCustomMode(false);
    setFullName('');
    setNickname('');
    setPhone('');
    setMessage('');
    setStatus('yes');
  };

  const triggerCelebration = () => {
    try {
      confetti({ particleCount: 35, spread: 60, origin: { y: 0.7 } });
    } catch {}
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim()) {
      setSubmitError('Vui lòng điền đầy đủ Họ và tên và Số điện thoại liên hệ.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(null);

    const rsvpPayload: RsvpData = {
      id: matchedExistingAttendee ? matchedExistingAttendee.id : `rsvp-${Date.now()}`,
      fullName: fullName.trim(),
      nickname: nickname.trim() || undefined,
      phone: phone.trim(),
      className: 'K8A1',
      shirtSize: status === 'yes' ? shirtSize : undefined,
      status,
      message: message.trim(),
      submittedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    setLastSubmittedAttendee(rsvpPayload);

    // Gửi trực tiếp lên Google Apps Script
    if (appsScriptUrl && appsScriptUrl.startsWith('http')) {
      try {
        await fetch(appsScriptUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'text/plain;charset=utf-8',
          },
          body: JSON.stringify({
            action: 'rsvp',
            ...rsvpPayload
          })
        });

        const isUpdate = !!matchedExistingAttendee;
        const successMsg = isUpdate
          ? (status === 'yes'
              ? 'Đã cập nhật thông tin tham dự thành công vào Google Sheet! Hẹn gặp bạn tại Ngày Họp Lớp 20 Năm Lớp K8A1.'
              : 'Đã cập nhật: Báo bận vắng mặt. Cả lớp K8A1 vẫn luôn nhớ về bạn!')
          : (status === 'yes'
              ? 'Xác nhận tham dự thành công! Hẹn gặp lại bạn trong ngày hội ngộ 20 năm Lớp K8A1.'
              : 'Đã lưu phản hồi. Dù không thể đến trực tiếp, tập thể K8A1 vẫn luôn lưu giữ kỷ niệm về bạn.');
        
        setSubmitSuccess(successMsg);
        onAddRsvp(rsvpPayload);

        if (status === 'yes') {
          triggerCelebration();
        }
      } catch (error) {
        console.error('Lỗi khi gửi lên Apps Script:', error);
        setSubmitError('Đã lưu đăng ký cục bộ. Vui lòng kiểm tra lại kết nối mạng.');
        onAddRsvp(rsvpPayload);
        if (status === 'yes') {
          triggerCelebration();
        }
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setTimeout(() => {
        onAddRsvp(rsvpPayload);
        const isUpdate = !!matchedExistingAttendee;
        const successMsg = isUpdate
          ? (status === 'yes'
              ? 'Đã cập nhật thông tin tham dự thành công! Hẹn gặp bạn tại Ngày Họp Lớp 20 Năm Lớp K8A1.'
              : 'Đã cập nhật: Báo bận vắng mặt. Cả lớp K8A1 vẫn luôn nhớ về bạn!')
          : (status === 'yes'
              ? 'Xác nhận tham dự thành công! Hẹn gặp lại bạn trong ngày hội ngộ 20 năm Lớp K8A1.'
              : 'Đã lưu phản hồi. Cảm ơn bạn!');
        
        setSubmitSuccess(successMsg);
        setIsSubmitting(false);

        if (status === 'yes') {
          triggerCelebration();
        }
      }, 400);
    }
  };

  const confirmedCount = useMemo(() => {
    return (rsvpList || []).filter(r => r.status === 'yes').length;
  }, [rsvpList]);

  return (
    <div id="rsvp-form-card" className="bg-[#FAF7F2] border border-amber-200/90 rounded-2xl p-4 sm:p-6 shadow-md space-y-4 text-left relative overflow-hidden">
      
      {/* HEADER ĐIỂM DANH & SIZE ÁO */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-amber-200/80 pb-3.5 gap-3">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-1.5 text-amber-800">
            <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span className="text-[11px] uppercase tracking-widest font-sans font-bold block">
              Điểm Danh & Size Áo Đồng Phục
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#1E293B] tracking-tight">
            Xác Nhận Tham Dự Lớp K8A1
          </h3>
          <p className="text-xs text-slate-500 font-serif italic">
            Vui lòng xác nhận sớm để may đo áo đồng phục & đặt tiệc
          </p>
        </div>

        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500/15 via-amber-400/20 to-amber-500/15 border border-amber-300/80 px-3.5 py-1.5 rounded-xl shrink-0 self-start sm:self-auto shadow-2xs">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-sans font-bold text-amber-950">
            <strong className="text-amber-800 text-sm">{confirmedCount}</strong> Bạn Đã Xác Nhận
          </span>
        </div>
      </div>

      {/* KHỐI NHẬN DIỆN THÀNH VIÊN ĐỒNG BỘ TOÀN WEB */}
      <div className="bg-[#FAF8F5] border border-amber-200/90 rounded-xl p-2.5 sm:px-3.5 sm:py-2.5 text-xs shadow-2xs">
        {activeMember ? (
          <div className="flex items-center justify-between gap-2 w-full">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 text-white font-serif font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                {activeMember.fullName.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="font-serif font-bold text-slate-900 text-xs sm:text-sm truncate">
                    {activeMember.fullName}
                  </span>
                  {activeMember.nickname && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-900 font-sans font-bold shrink-0 border border-amber-200/60">
                      “{activeMember.nickname}”
                    </span>
                  )}
                  {matchedExistingAttendee && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-sans font-medium shrink-0 border border-emerald-200/60">
                      ✓ Đã từng điểm danh
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-slate-500 font-sans">
                  Thành viên Lớp K8A1 (2003 — 2006)
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleResetMember}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] text-amber-800 hover:text-amber-950 bg-white hover:bg-amber-100/60 border border-amber-300 rounded-lg font-bold transition-colors cursor-pointer shrink-0 shadow-2xs"
            >
              <X className="w-3 h-3" />
              <span>Đổi bạn khác</span>
            </button>
          </div>
        ) : (
          <div className="relative w-full">
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-amber-700 shrink-0 hidden sm:block" />
              <div className="relative flex-1">
                <select
                  value={isCustomMode ? 'custom' : ''}
                  onChange={(e) => handleSelectMember(e.target.value)}
                  className="w-full bg-white border border-amber-300 rounded-lg py-2 pl-3 pr-8 text-xs sm:text-[13px] text-slate-800 font-sans cursor-pointer focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-400/50 shadow-2xs font-medium appearance-none"
                >
                  <option value="">-- Chọn tên bạn trong Danh Bạ K8A1 để tự điền thông tin --</option>
                  {rosterList.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.fullName} {m.nickname ? `(${m.nickname})` : ''} {m.role && m.role !== 'Thành viên' ? `— [${m.role}]` : ''}
                    </option>
                  ))}
                  <option value="custom">✏️ Tự nhập họ tên khác...</option>
                </select>
                <ChevronDown className="w-4 h-4 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CHỌN TRẠNG THÁI THAM GIA */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
        <button
          type="button"
          onClick={() => setStatus('yes')}
          className={`py-3 px-3 rounded-xl border font-sans font-bold text-xs sm:text-sm transition-all cursor-pointer flex items-center justify-center gap-2 ${
            status === 'yes'
              ? 'bg-gradient-to-br from-amber-500 to-amber-600 text-white border-amber-600 shadow-sm ring-2 ring-amber-400/40'
              : 'bg-white text-slate-700 border-slate-300 hover:border-amber-300 hover:bg-amber-50/30'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
          <span>Có Tham Gia</span>
        </button>

        <button
          type="button"
          onClick={() => setStatus('no')}
          className={`py-3 px-3 rounded-xl border font-sans font-bold text-xs sm:text-sm transition-all cursor-pointer flex items-center justify-center gap-2 ${
            status === 'no'
              ? 'bg-gradient-to-br from-slate-700 to-slate-800 text-white border-slate-800 shadow-sm ring-2 ring-slate-400/40'
              : 'bg-white text-slate-700 border-slate-300 hover:border-slate-400 hover:bg-slate-50/50'
          }`}
        >
          <HeartHandshake className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
          <span>Rất Tiếc Vắng Mặt</span>
        </button>
      </div>

      {/* FORM NHẬP THÔNG TIN */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-amber-200/80 p-3 sm:p-4 space-y-3 shadow-2xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
          
          {/* Họ và tên */}
          <div className="space-y-1">
            <label htmlFor="rsvp-fullName" className="text-[11px] font-bold text-slate-700 font-sans flex items-center gap-1">
              <User className="w-3 h-3 text-amber-700" />
              <span>Họ và tên</span>
              <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              id="rsvp-fullName"
              placeholder="Nguyễn Tuấn Anh"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50/80 focus:bg-white border border-slate-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-400/40 rounded-lg text-xs sm:text-[13px] text-slate-800 font-sans outline-none transition"
            />
          </div>

          {/* Biệt danh */}
          <div className="space-y-1">
            <label htmlFor="rsvp-nickname" className="text-[11px] font-bold text-slate-700 font-sans flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-700" />
              <span>Biệt danh cấp 3</span>
            </label>
            <input
              type="text"
              id="rsvp-nickname"
              placeholder="Tuấn Béo, Nam Cận..."
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50/80 focus:bg-white border border-slate-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-400/40 rounded-lg text-xs sm:text-[13px] text-slate-800 font-sans outline-none transition"
            />
          </div>

          {/* Số điện thoại */}
          <div className="space-y-1">
            <label htmlFor="rsvp-phone" className="text-[11px] font-bold text-slate-700 font-sans flex items-center gap-1">
              <Phone className="w-3 h-3 text-amber-700" />
              <span>Số điện thoại</span>
              <span className="text-rose-500">*</span>
            </label>
            <input
              type="tel"
              id="rsvp-phone"
              placeholder="090x xxx xxx"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50/80 focus:bg-white border border-slate-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-400/40 rounded-lg text-xs sm:text-[13px] text-slate-800 font-mono outline-none transition"
            />
          </div>

          {/* Size áo polo */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label htmlFor="rsvp-shirtSize" className="text-[11px] font-bold text-slate-700 font-sans flex items-center gap-1">
                <Shirt className="w-3 h-3 text-amber-700" />
                <span>Size áo polo</span>
              </label>
              <button
                type="button"
                onClick={() => setShowSizeGuide(!showSizeGuide)}
                className="text-[10px] text-amber-800 hover:text-amber-950 font-bold underline cursor-pointer"
              >
                {showSizeGuide ? 'Đóng bảng' : 'Bảng size 📐'}
              </button>
            </div>
            <div className="relative">
              <select
                id="rsvp-shirtSize"
                value={shirtSize}
                onChange={(e) => setShirtSize(e.target.value)}
                disabled={status === 'no'}
                className="w-full px-3 py-2 bg-slate-50/80 focus:bg-white border border-slate-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-400/40 rounded-lg text-xs sm:text-[13px] text-slate-800 outline-none cursor-pointer disabled:opacity-50 appearance-none pr-8 font-medium transition"
              >
                {SHIRT_SIZE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Bảng gợi ý size áo dạng mở rộng */}
        {showSizeGuide && (
          <div className="bg-[#FAF8F5] border border-amber-200 rounded-xl p-3 text-xs text-slate-700 space-y-2 animate-fadeIn">
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center font-sans">
              {SHIRT_SIZE_OPTIONS.map((opt) => (
                <div key={opt.value} className="bg-white p-2 rounded-lg border border-amber-200 shadow-2xs">
                  <span className="font-bold text-amber-900 text-xs block">{opt.value}</span>
                  <span className="text-[10px] text-slate-500 block mt-0.5 leading-tight">{opt.weightHint}</span>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-slate-500 font-serif italic text-center">
              * Áo polo co giãn 4 chiều. Nếu phân vân giữa 2 cỡ, bạn nên chọn tăng 1 size để mặc thoải mái nhất.
            </p>
          </div>
        )}

        {/* Lời nhắn */}
        <div className="space-y-1">
          <label htmlFor="rsvp-message" className="text-[11px] font-bold text-slate-700 font-sans flex items-center gap-1">
            <MessageSquare className="w-3 h-3 text-amber-700" />
            <span>Lời nhắn gửi tới lớp & thầy cô (Tùy chọn)</span>
          </label>
          <textarea
            id="rsvp-message"
            rows={2}
            placeholder="Gửi lời chào, kỷ niệm xưa hoặc lý do nếu bạn vắng mặt..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50/80 focus:bg-white border border-slate-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-400/40 rounded-lg text-xs sm:text-[13px] text-slate-800 resize-none font-serif leading-relaxed outline-none transition"
          />
        </div>

        {/* Thông báo lỗi */}
        {submitError && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-xs text-rose-800 rounded-xl flex items-center gap-2">
            <span className="text-rose-600 font-bold">⚠️</span>
            <span>{submitError}</span>
          </div>
        )}

        {/* Thông báo thành công */}
        {submitSuccess && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-300 text-xs text-emerald-900 rounded-xl space-y-2.5">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <p className="font-bold font-serif text-xs sm:text-sm">{submitSuccess}</p>
            </div>
            {lastSubmittedAttendee && lastSubmittedAttendee.status === 'yes' && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-2 border-t border-emerald-200 text-xs">
                <span className="text-slate-700">
                  Đóng quỹ họp lớp K8A1 <strong>(tạm ứng 500.000đ)</strong>:
                </span>
                <div className="flex items-center gap-2">
                  {onOpenReceiptModal ? (
                    <button
                      type="button"
                      onClick={() => onOpenReceiptModal(lastSubmittedAttendee)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg cursor-pointer transition shadow-xs text-xs"
                    >
                      <Receipt className="w-3.5 h-3.5" />
                      <span>Gửi biên lai ➔</span>
                    </button>
                  ) : (
                    <a
                      href="#bank-transfer-card"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs"
                    >
                      <Receipt className="w-3.5 h-3.5" />
                      <span>Gửi biên lai ➔</span>
                    </a>
                  )}

                  {onOpenPassModal && (
                    <button
                      type="button"
                      onClick={() => onOpenPassModal(lastSubmittedAttendee)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-lg cursor-pointer transition shadow-xs text-xs"
                    >
                      <Award className="w-3.5 h-3.5 text-amber-300" />
                      <span>Thẻ học sinh</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Nút gửi điểm danh */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-sans font-bold text-xs sm:text-sm uppercase tracking-wider py-3 px-4 rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60 hover:shadow-lg active:scale-[0.99]"
        >
          {isSubmitting ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Đang gửi thông tin...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-amber-200" />
              <span>{matchedExistingAttendee ? 'Cập Nhật Điểm Danh' : 'Xác Nhận Tham Dự Ngay'}</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
