import React, { useState, useEffect, useMemo } from 'react';
import { 
  CheckCircle2, 
  Send, 
  Loader2, 
  Sparkles, 
  Shirt, 
  Info, 
  Award, 
  Users, 
  UserCheck, 
  RotateCcw,
  X,
  CreditCard,
  HeartHandshake,
  CalendarCheck
} from 'lucide-react';
import { RsvpData, ClassMember } from '../types';
import { CLASS_ROSTER_K8A1 } from '../data';
import { triggerFullscreenFireworks } from '../utils/confetti';
import QuickShare from './QuickShare';

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

  // Normalize helpers for phone and name to detect existing registrations
  const normalizePhone = (p?: any) => {
    if (p === null || p === undefined) return '';
    let clean = String(p).replace(/[^0-9]/g, '');
    if (clean.startsWith('84') && clean.length > 9) clean = '0' + clean.slice(2);
    else if (!clean.startsWith('0') && clean.length === 9) clean = '0' + clean;
    return clean;
  };

  const normalizeName = (n?: any) => {
    if (n === null || n === undefined) return '';
    return String(n).trim().toLowerCase().replace(/\s+/g, ' ');
  };

  // Find existing RSVP record for current input (or active member)
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

  // Synchronize state when activeMember is chosen or changed anywhere in the WebApp
  useEffect(() => {
    if (activeMember) {
      setFullName(activeMember.fullName);
      if (activeMember.nickname) setNickname(activeMember.nickname);
      if (activeMember.shirtSize) setShirtSize(activeMember.shirtSize);
      if (activeMember.phone) setPhone(String(activeMember.phone));
      setIsCustomMode(false);

      // Check if this member has already registered in rsvpList
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
        if (existing.shirtSize) setShirtSize(String(existing.shirtSize));
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

  // Handle member selection from dropdown inside RSVP Form
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
        if (member.shirtSize) setShirtSize(member.shirtSize);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim()) {
      setSubmitError('Vui lòng điền đầy đủ Họ tên và Số điện thoại.');
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

    if (appsScriptUrl && appsScriptUrl.startsWith('http')) {
      try {
        await fetch(appsScriptUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'rsvp',
            ...rsvpPayload
          })
        });

        const isUpdate = !!matchedExistingAttendee;
        const successMessage = isUpdate
          ? (status === 'yes'
              ? 'Đã cập nhật thông tin tham dự thành công! Hẹn gặp lại bạn trong ngày hội ngộ 20 năm Lớp K8A1! 🎉'
              : 'Đã cập nhật phản hồi: Rất tiếc bạn không thể tham gia. Cả lớp K8A1 vẫn luôn nhớ về bạn!')
          : (status === 'yes'
              ? 'Chúc mừng! Bạn đã xác nhận tham dự thành công. Hẹn gặp lại bạn trong ngày hội ngộ 20 năm Lớp K8A1! 🎉'
              : 'Cảm ơn bạn đã phản hồi! Dù không thể đến, tập thể K8A1 vẫn luôn lưu giữ những kỷ niệm đẹp về bạn.');
        
        setSubmitSuccess(successMessage);
        onAddRsvp(rsvpPayload);

        if (status === 'yes') {
          triggerFullscreenFireworks();
        }
      } catch (error) {
        console.error('Lỗi khi gửi lên Apps Script:', error);
        setSubmitError('Có lỗi xảy ra khi kết nối tới máy chủ. Đăng ký tạm thời lưu cục bộ!');
        onAddRsvp(rsvpPayload);
        if (status === 'yes') {
          triggerFullscreenFireworks();
        }
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setTimeout(() => {
        onAddRsvp(rsvpPayload);
        const isUpdate = !!matchedExistingAttendee;
        const successMessage = isUpdate
          ? (status === 'yes'
              ? 'Đã cập nhật thông tin tham dự thành công! Hẹn gặp lại bạn trong ngày hội ngộ 20 năm Lớp K8A1! 🎉'
              : 'Đã cập nhật phản hồi: Rất tiếc bạn không thể tham gia. Cả lớp K8A1 vẫn luôn nhớ về bạn!')
          : (status === 'yes'
              ? 'Chúc mừng! Bạn đã xác nhận tham dự thành công. Hẹn gặp lại bạn trong ngày hội ngộ 20 năm Lớp K8A1! 🎉'
              : 'Cảm ơn bạn đã phản hồi! Dù không thể đến, tập thể K8A1 vẫn luôn lưu giữ những kỷ niệm đẹp về bạn.');
        
        setSubmitSuccess(successMessage);
        setIsSubmitting(false);

        if (status === 'yes') {
          triggerFullscreenFireworks();
        }
      }, 500);
    }
  };

  const confirmedCount = useMemo(() => {
    return (rsvpList || []).filter(r => r.status === 'yes').length;
  }, [rsvpList]);

  return (
    <div id="rsvp-section" className="space-y-4">
      {/* Khung Biểu Mẫu Điểm Danh K8A1 - Tinh Gọn & Đẳng Cấp */}
      <div 
        id="rsvp-form-card" 
        className="bg-[#FAF7F2] border border-amber-200/90 rounded-2xl p-4 sm:p-5 shadow-md space-y-3.5 text-left relative overflow-hidden"
      >
        {/* 🌟 HEADER GỌN GÀNG */}
        <div className="flex items-center justify-between border-b border-amber-200/80 pb-2.5 gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 border border-amber-300/70">
              <CalendarCheck className="w-4 h-4 text-amber-700" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base sm:text-lg font-serif font-bold text-[#1E293B] truncate leading-tight">
                Xác Nhận Tham Dự Lớp K8A1
              </h3>
              <p className="text-[11px] text-slate-500 font-serif italic truncate">
                Hạn chốt 20/09/2026 để Ban liên lạc chuẩn bị quà & đặt tiệc chu đáo nhất
              </p>
            </div>
          </div>

          <span className="text-xs font-sans font-bold text-amber-900 bg-amber-100/90 px-2.5 py-1 rounded-lg border border-amber-300/60 shrink-0 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>{confirmedCount} Đã Đăng Ký</span>
          </span>
        </div>

        {/* 🌟 FORM ĐIỂM DANH */}
        <form onSubmit={handleSubmit} className="space-y-3 relative z-10">
          
          {/* 👤 KHỐI NHẬN DIỆN THÀNH VIÊN SIÊU GỌN */}
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
                  {matchedExistingAttendee && (
                    <span className="text-[10px] text-emerald-700 font-sans font-semibold hidden sm:inline">
                      • Đã đăng ký ({matchedExistingAttendee.status === 'yes' ? 'Có mặt' : 'Vắng mặt'})
                    </span>
                  )}
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
                <Users className="w-4 h-4 text-amber-700 shrink-0" />
                <select
                  value={isCustomMode ? 'custom' : ''}
                  onChange={(e) => handleSelectMember(e.target.value)}
                  className="flex-1 bg-white border border-amber-300 rounded-lg py-1 px-2.5 text-xs text-slate-800 font-sans cursor-pointer focus:outline-none focus:border-amber-500 shadow-2xs font-medium"
                >
                  <option value="">-- Chọn tên bạn trong Danh Bạ K8A1 để tự điền thông tin --</option>
                  {rosterList.map((m) => {
                    const isRegistered = rsvpList.some(r => 
                      normalizeName(r.fullName) === normalizeName(m.fullName) || 
                      (m.phone && normalizePhone(r.phone) === normalizePhone(m.phone))
                    );
                    return (
                      <option key={m.id} value={m.id}>
                        {m.fullName} {m.nickname ? `(${m.nickname})` : ''} {isRegistered ? '✅ (Đã đăng ký)' : ''}
                      </option>
                    );
                  })}
                  <option value="custom">✍️ Nhập tên khác</option>
                </select>
              </div>
            )}
          </div>

          {/* 🔘 2 NÚT CHỌN TRẠNG THÁI GỌN GÀNG (SEGMENTED CONTROL) */}
          <div className="grid grid-cols-2 gap-2 bg-slate-100/80 p-1 rounded-xl border border-slate-200/90">
            <button
              type="button"
              onClick={() => setStatus('yes')}
              className={`py-2 px-3 rounded-lg text-xs font-serif font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                status === 'yes'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Có Tham Gia 🎉</span>
            </button>

            <button
              type="button"
              onClick={() => setStatus('no')}
              className={`py-2 px-3 rounded-lg text-xs font-serif font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                status === 'no'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <HeartHandshake className="w-3.5 h-3.5" />
              <span>Rất Tiếc Vắng Mặt 🌸</span>
            </button>
          </div>

          {/* 📝 FORM ĐIỀN THÔNG TIN 2X2 */}
          <div className="bg-white rounded-xl border border-slate-200/90 p-3 sm:p-4 space-y-2.5 shadow-2xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="space-y-0.5">
                <label className="block text-[11px] font-bold text-slate-700 font-sans">
                  Họ và tên <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Nguyễn Văn A"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 focus:bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-amber-500 font-sans"
                />
              </div>

              <div className="space-y-0.5">
                <label className="block text-[11px] font-bold text-slate-700 font-sans">
                  Biệt danh cấp 3 <span className="text-slate-400 font-normal italic">(kỷ niệm)</span>
                </label>
                <input
                  type="text"
                  placeholder='VD: "Tuấn Béo", "Nam Cận"...'
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 focus:bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-amber-500 font-sans"
                />
              </div>

              <div className="space-y-0.5">
                <label className="block text-[11px] font-bold text-slate-700 font-sans">
                  Số điện thoại <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  placeholder="090x xxx xxx"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 focus:bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div className="space-y-0.5">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-bold text-slate-700 font-sans">
                    Size áo polo đồng phục
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowSizeGuide(!showSizeGuide)}
                    className="text-[10px] font-sans text-amber-800 hover:text-amber-950 underline font-semibold cursor-pointer"
                  >
                    Bảng size
                  </button>
                </div>
                <select
                  value={shirtSize}
                  onChange={(e) => setShirtSize(e.target.value)}
                  disabled={status === 'no'}
                  className="w-full px-2.5 py-1.5 bg-slate-50 focus:bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-amber-500 cursor-pointer disabled:opacity-40 font-sans"
                >
                  <option value="S">Size S (&lt; 50kg • &lt; 1m60)</option>
                  <option value="M">Size M (50 - 60kg • 1m60 - 1m68)</option>
                  <option value="L">Size L (61 - 70kg • 1m68 - 1m75)</option>
                  <option value="XL">Size XL (71 - 80kg • 1m73 - 1m80)</option>
                  <option value="2XL">Size 2XL (81 - 90kg • &gt; 1m75)</option>
                  <option value="3XL">Size 3XL (&gt; 90kg)</option>
                </select>
              </div>
            </div>

            {/* Bảng Size Popover Siêu Gọn */}
            {showSizeGuide && (
              <div className="bg-[#FAF8F5] border border-amber-300/80 rounded-lg p-2.5 space-y-1.5 animate-in fade-in duration-150 text-xs">
                <div className="flex items-center justify-between font-bold text-amber-900 font-serif text-[11px]">
                  <span className="flex items-center gap-1">
                    <Shirt className="w-3.5 h-3.5 text-amber-700" />
                    Bảng size áo polo đồng phục Hội khóa K8A1:
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowSizeGuide(false)}
                    className="text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="grid grid-cols-6 gap-1 text-center text-[10px] font-sans">
                  <div className="bg-white p-1 rounded border border-amber-200">
                    <span className="font-bold block text-amber-800">S</span>
                    <span className="text-slate-500">&lt;50kg</span>
                  </div>
                  <div className="bg-white p-1 rounded border border-amber-200">
                    <span className="font-bold block text-amber-800">M</span>
                    <span className="text-slate-500">50-60k</span>
                  </div>
                  <div className="bg-white p-1 rounded border border-amber-200">
                    <span className="font-bold block text-amber-800">L</span>
                    <span className="text-slate-500">61-70k</span>
                  </div>
                  <div className="bg-white p-1 rounded border border-amber-200">
                    <span className="font-bold block text-amber-800">XL</span>
                    <span className="text-slate-500">71-80k</span>
                  </div>
                  <div className="bg-white p-1 rounded border border-amber-200">
                    <span className="font-bold block text-amber-800">2XL</span>
                    <span className="text-slate-500">81-90k</span>
                  </div>
                  <div className="bg-white p-1 rounded border border-amber-200">
                    <span className="font-bold block text-amber-800">3XL</span>
                    <span className="text-slate-500">&gt;90kg</span>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-0.5">
              <label className="block text-[11px] font-bold text-slate-700 font-sans">
                Lời nhắn gửi tới cả lớp / Lý do (Tùy chọn)
              </label>
              <textarea
                rows={2}
                placeholder="Gửi gắm lời chào, kỷ niệm xưa hoặc lý do nếu vắng mặt..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-50 focus:bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-amber-500 font-serif resize-none"
              />
            </div>
          </div>

          {/* Thông báo lỗi */}
          {submitError && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 text-xs text-rose-700 rounded-lg">
              {submitError}
            </div>
          )}

          {/* Thông báo thành công & Thao tác sau đăng ký */}
          {submitSuccess && (
            <div className="p-3.5 bg-white border border-emerald-300 rounded-xl shadow-xs space-y-2.5 text-left animate-in fade-in duration-200">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5 min-w-0">
                  <p className="font-serif font-bold text-xs sm:text-sm text-emerald-900 leading-snug">
                    {submitSuccess}
                  </p>
                </div>
              </div>

              {lastSubmittedAttendee && lastSubmittedAttendee.status === 'yes' && (
                <div className="p-2.5 bg-[#FAF6EE] border border-amber-300/80 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-amber-700 shrink-0" />
                    <span><strong>Đóng quỹ (500k):</strong> Chuyển khoản và gửi ảnh biên lai để đối soát ngay</span>
                  </div>

                  {onOpenReceiptModal ? (
                    <button
                      type="button"
                      onClick={() => onOpenReceiptModal(lastSubmittedAttendee)}
                      className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white font-sans font-bold text-[11px] uppercase tracking-wider rounded-md transition shadow-2xs whitespace-nowrap cursor-pointer self-stretch sm:self-auto text-center"
                    >
                      Gửi Bill ➔
                    </button>
                  ) : (
                    <a
                      href="#bank-transfer-card"
                      className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white font-sans font-bold text-[11px] uppercase tracking-wider rounded-md transition shadow-2xs whitespace-nowrap self-stretch sm:self-auto text-center"
                    >
                      Gửi Bill ➔
                    </a>
                  )}
                </div>
              )}

              <div className="pt-1.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={triggerFullscreenFireworks}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-amber-100 hover:bg-amber-200 text-amber-950 text-[11px] font-sans font-bold cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3 text-amber-700" />
                    <span>Pháo hoa 🎉</span>
                  </button>

                  {lastSubmittedAttendee && onOpenPassModal && (
                    <button
                      type="button"
                      onClick={() => onOpenPassModal(lastSubmittedAttendee)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#1E293B] hover:bg-amber-700 text-white text-[11px] font-sans font-bold cursor-pointer"
                    >
                      <Award className="w-3 h-3 text-amber-300" />
                      <span>Thẻ Học Sinh 🎓</span>
                    </button>
                  )}
                </div>

                <QuickShare variant="pill" buttonText="Rủ bạn lớp K8A1" />
              </div>
            </div>
          )}

          {/* 🚀 NÚT GỬI ĐIỂM DANH */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 hover:from-amber-500 hover:to-amber-700 text-white font-sans font-bold text-xs uppercase tracking-wider py-3 px-4 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>{matchedExistingAttendee ? 'Đang cập nhật...' : 'Đang gửi...'}</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>{matchedExistingAttendee ? 'Cập Nhật Điểm Danh' : 'Gửi Xác Nhận Tham Dự Lớp K8A1'}</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
