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
      // Real API request to Google Apps Script
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
              ? 'Đã cập nhật thông tin tham dự thành công! Hệ thống đã ghi nhận phản hồi mới nhất của bạn. Hẹn gặp lại bạn trong ngày hội ngộ 20 năm Lớp K8A1! 🎉'
              : 'Đã cập nhật phản hồi: Rất tiếc bạn không thể tham gia. Cả lớp K8A1 vẫn luôn nhớ về bạn!')
          : (status === 'yes'
              ? 'Chúc mừng! Bạn đã xác nhận tham dự thành công. Hẹn gặp lại bạn trong ngày hội ngộ 20 năm Lớp K8A1! 🎉'
              : 'Cảm ơn bạn đã phản hồi! Dù bạn không thể đến, tập thể Lớp K8A1 vẫn luôn lưu giữ những kỷ niệm đẹp về bạn.');
        
        setSubmitSuccess(successMessage);
        onAddRsvp(rsvpPayload);

        if (status === 'yes') {
          triggerFullscreenFireworks();
        }
      } catch (error) {
        console.error('Lỗi khi gửi lên Apps Script:', error);
        setSubmitError('Có lỗi xảy ra khi kết nối tới máy chủ Google Sheets. Đăng ký tạm thời lưu cục bộ!');
        onAddRsvp(rsvpPayload);
        if (status === 'yes') {
          triggerFullscreenFireworks();
        }
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Simulation mode
      setTimeout(() => {
        onAddRsvp(rsvpPayload);
        const isUpdate = !!matchedExistingAttendee;
        const successMessage = isUpdate
          ? (status === 'yes'
              ? 'Đã cập nhật thông tin tham dự thành công! Hẹn gặp lại bạn trong ngày hội ngộ 20 năm Lớp K8A1! 🎉'
              : 'Đã cập nhật phản hồi: Rất tiếc bạn không thể tham gia. Cả lớp K8A1 vẫn luôn nhớ về bạn!')
          : (status === 'yes'
              ? 'Chúc mừng! Bạn đã xác nhận tham dự thành công. Hẹn gặp lại bạn trong ngày hội ngộ 20 năm Lớp K8A1! 🎉'
              : 'Cảm ơn bạn đã phản hồi! Dù bạn không thể đến, tập thể Lớp K8A1 vẫn luôn lưu giữ những kỷ niệm đẹp về bạn.');
        
        setSubmitSuccess(successMessage);
        setIsSubmitting(false);

        if (status === 'yes') {
          triggerFullscreenFireworks();
        }
      }, 600);
    }
  };

  const confirmedCount = useMemo(() => {
    return (rsvpList || []).filter(r => r.status === 'yes').length;
  }, [rsvpList]);

  return (
    <div id="rsvp-section" className="space-y-6">
      {/* Khung Biểu Mẫu Điểm Danh K8A1 - Phong Cách Ấm Áp Hoàng Gia */}
      <div 
        id="rsvp-form-card" 
        className="bg-[#FAF7F2] border border-amber-200/90 rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-lg space-y-6 text-left relative overflow-hidden"
      >
        {/* Nền hiệu ứng sáng tinh tế */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-amber-200/20 via-orange-100/10 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-amber-300/15 via-transparent to-transparent rounded-full blur-3xl pointer-events-none" />

        {/* 🌟 HEADER SANG TRỌNG */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-amber-300/60 pb-4 sm:pb-5 gap-3 relative z-10">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/90 text-amber-950 text-xs font-bold tracking-wider font-sans uppercase border border-amber-300/80 shadow-2xs">
              <CalendarCheck className="w-3.5 h-3.5 text-amber-700" />
              <span>Điểm Danh Trực Tuyến • Hội Ngộ 20 Năm K8A1</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-serif font-bold text-[#1E293B] tracking-tight">
              Xác Nhận Tham Dự Lớp K8A1
            </h3>

            <p className="text-xs sm:text-sm text-slate-600 font-serif italic leading-relaxed">
              “Hạn chốt đến hết ngày 20/09/2026 để Ban Liên Lạc chuẩn bị quà kỷ niệm, may áo polo đồng phục và đặt tiệc trọn vẹn nhất.”
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-sans font-bold text-amber-900 bg-amber-100/80 px-3 py-1.5 rounded-xl border border-amber-300/60 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{confirmedCount} Bạn Đã Xác Nhận</span>
            </span>
          </div>
        </div>

        {/* 🌟 FORM ĐIỂM DANH */}
        <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
          
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
                  (Chọn 1 lần sẽ tự điền cả Sổ lưu bút & Quỹ lớp)
                </span>
              )}
            </div>

            {activeMember ? (
              /* Khi đã nhận diện được thành viên */
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-emerald-200 shadow-2xs">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 text-white font-serif font-bold text-sm flex items-center justify-center shrink-0 shadow-2xs">
                    {activeMember.fullName.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-serif font-bold text-sm sm:text-base text-[#1E293B]">
                        {activeMember.fullName}
                      </h4>
                      {activeMember.nickname && (
                        <span className="text-xs px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 font-sans font-bold">
                          “{activeMember.nickname}”
                        </span>
                      )}
                      {activeMember.role && activeMember.role !== 'Thành viên' && (
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 font-sans font-semibold">
                          {activeMember.role}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-emerald-700 font-sans flex items-center gap-1 mt-0.5">
                      <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>
                        {matchedExistingAttendee 
                          ? `Đã đăng ký trước đó (${matchedExistingAttendee.status === 'yes' ? 'Có tham gia' : 'Rất tiếc vắng mặt'}) • Bấm gửi bên dưới để cập nhật`
                          : 'Đã kết nối danh bạ • Mời bạn xác nhận tham gia và chọn size áo'}
                      </span>
                    </p>
                  </div>
                </div>

                {matchedExistingAttendee && (
                  <span className="text-[10px] font-sans font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg shrink-0 self-start sm:self-auto">
                    Chế độ Cập nhật 🔄
                  </span>
                )}
              </div>
            ) : (
              /* Khi chưa nhận diện: Dropdown chọn nhanh từ Roster */
              <div className="space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center">
                  <div className="sm:col-span-8">
                    <select
                      value={isCustomMode ? 'custom' : ''}
                      onChange={(e) => handleSelectMember(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-amber-300 rounded-xl text-xs sm:text-sm font-sans font-semibold text-slate-800 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 shadow-2xs cursor-pointer"
                    >
                      <option value="">-- Bấm vào đây để chọn tên bạn trong Danh Bạ K8A1 --</option>
                      {rosterList.map((m) => {
                        const isRegistered = rsvpList.some(r => 
                          normalizeName(r.fullName) === normalizeName(m.fullName) || 
                          (m.phone && normalizePhone(r.phone) === normalizePhone(m.phone))
                        );
                        return (
                          <option key={m.id} value={m.id}>
                            {m.fullName} {m.nickname ? `(“${m.nickname}”)` : ''} {m.role && m.role !== 'Thành viên' ? `[${m.role}]` : ''} {isRegistered ? '✅ (Đã đăng ký)' : ''}
                          </option>
                        );
                      })}
                      <option value="custom">✍️ Nhập tên khác (Khách mời / Thầy cô / Bạn bè ngoài lớp)</option>
                    </select>
                  </div>

                  <div className="sm:col-span-4 text-[11px] text-slate-500 font-serif italic">
                    {isCustomMode ? 'Đang ở chế độ tự nhập họ tên' : 'Chọn đúng tên để tự điền SĐT & size áo!'}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ======================================================== */}
          {/* 🔘 2 NÚT CHỌN TRẠNG THÁI THAM GIA TO RÕ, ĐẸP MẮT */}
          {/* ======================================================== */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 font-sans">
              Khả năng tham dự của bạn: <span className="text-rose-500">*</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Option 1: Yes */}
              <button
                type="button"
                onClick={() => setStatus('yes')}
                className={`p-3.5 sm:p-4 rounded-2xl border-2 transition-all flex items-center gap-3.5 cursor-pointer text-left ${
                  status === 'yes'
                    ? 'border-amber-500 bg-white shadow-md ring-2 ring-amber-400/30'
                    : 'border-slate-200 bg-white/60 hover:bg-white hover:border-amber-300 text-slate-600'
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                  status === 'yes'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-400'
                }`}>
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-bold font-serif ${status === 'yes' ? 'text-amber-950' : 'text-slate-700'}`}>
                      Có Tham Gia 🎉
                    </span>
                    {status === 'yes' && (
                      <span className="text-[10px] bg-amber-100 text-amber-900 font-sans font-bold px-2 py-0.2 rounded-full">
                        Chắc chắn
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 font-sans mt-0.5">
                    Hội ngộ cùng cả lớp K8A1 tại Crown Palace
                  </p>
                </div>
              </button>

              {/* Option 2: No */}
              <button
                type="button"
                onClick={() => setStatus('no')}
                className={`p-3.5 sm:p-4 rounded-2xl border-2 transition-all flex items-center gap-3.5 cursor-pointer text-left ${
                  status === 'no'
                    ? 'border-rose-400 bg-white shadow-md ring-2 ring-rose-300/30'
                    : 'border-slate-200 bg-white/60 hover:bg-white hover:border-slate-300 text-slate-600'
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                  status === 'no'
                    ? 'bg-rose-500 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-400'
                }`}>
                  <HeartHandshake className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-bold font-serif ${status === 'no' ? 'text-rose-950' : 'text-slate-700'}`}>
                      Rất Tiếc Vắng Mặt 🌸
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-sans mt-0.5">
                    Không thể đến trực tiếp, gửi lời chúc tới lớp
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* ======================================================== */}
          {/* 📝 CÁC TRƯỜNG THÔNG TIN CÁ NHÂN */}
          {/* ======================================================== */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Họ tên */}
              <div className="space-y-1">
                <label htmlFor="rsvp-fullName" className="block text-xs font-bold text-slate-700 font-sans">
                  Họ và tên của bạn: <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  id="rsvp-fullName"
                  placeholder="VD: Nguyễn Văn A"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition shadow-2xs font-sans"
                />
              </div>

              {/* Biệt danh */}
              <div className="space-y-1">
                <label htmlFor="rsvp-nickname" className="block text-xs font-bold text-slate-700 font-sans">
                  Biệt danh thời cấp 3 <span className="text-amber-700 text-[11px] font-normal italic">(gợi nhớ kỷ niệm xưa)</span>:
                </label>
                <input
                  type="text"
                  id="rsvp-nickname"
                  placeholder='VD: "Tuấn Béo", "Nam Cận", "Mai Tồ"...'
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition shadow-2xs font-sans"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Số điện thoại */}
              <div className="space-y-1">
                <label htmlFor="rsvp-phone" className="block text-xs font-bold text-slate-700 font-sans">
                  Số điện thoại liên hệ: <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  id="rsvp-phone"
                  placeholder="090x xxx xxx"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition shadow-2xs font-mono"
                />
              </div>

              {/* Chọn Size Áo */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label htmlFor="rsvp-shirtSize" className="block text-xs font-bold text-slate-700 font-sans">
                    Size áo polo đồng phục 20 năm:
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowSizeGuide(!showSizeGuide)}
                    className="text-[11px] font-sans text-amber-800 hover:text-amber-950 font-bold underline cursor-pointer flex items-center gap-1"
                  >
                    <Info className="w-3.5 h-3.5 text-amber-600" />
                    <span>Xem Bảng Size</span>
                  </button>
                </div>

                <select
                  id="rsvp-shirtSize"
                  value={shirtSize}
                  onChange={(e) => setShirtSize(e.target.value)}
                  disabled={status === 'no'}
                  className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition shadow-2xs cursor-pointer disabled:opacity-50 disabled:bg-slate-100 font-sans font-medium"
                >
                  <option value="S">Size S (Dưới 50kg • Cao dưới 1m60)</option>
                  <option value="M">Size M (50 - 60kg • Cao 1m60 - 1m68)</option>
                  <option value="L">Size L (61 - 70kg • Cao 1m68 - 1m75)</option>
                  <option value="XL">Size XL (71 - 80kg • Cao 1m73 - 1m80)</option>
                  <option value="2XL">Size 2XL (81 - 90kg • Cao trên 1m75)</option>
                  <option value="3XL">Size 3XL (Trên 90kg • Form rộng rãi)</option>
                </select>
              </div>
            </div>

            {/* Bảng Tra Cứu Size Áo Popover / Card */}
            {showSizeGuide && (
              <div className="bg-[#FAF8F5] border border-amber-300/80 rounded-xl p-3.5 space-y-2.5 animate-in fade-in duration-200">
                <div className="flex items-center justify-between font-bold text-slate-900 font-serif text-xs">
                  <span className="flex items-center gap-1.5 text-amber-900">
                    <Shirt className="w-4 h-4 text-amber-700" />
                    Bảng thông số chọn size áo polo đồng phục Hội khóa K8A1:
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowSizeGuide(false)}
                    className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center text-[10px] font-sans">
                  <div className="bg-white p-2 rounded-lg border border-amber-200 shadow-2xs">
                    <span className="font-bold block text-amber-800 text-xs">Size S</span>
                    <span className="text-slate-600">&lt; 50kg</span>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-amber-200 shadow-2xs">
                    <span className="font-bold block text-amber-800 text-xs">Size M</span>
                    <span className="text-slate-600">50 - 60kg</span>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-amber-200 shadow-2xs">
                    <span className="font-bold block text-amber-800 text-xs">Size L</span>
                    <span className="text-slate-600">61 - 70kg</span>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-amber-200 shadow-2xs">
                    <span className="font-bold block text-amber-800 text-xs">Size XL</span>
                    <span className="text-slate-600">71 - 80kg</span>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-amber-200 shadow-2xs">
                    <span className="font-bold block text-amber-800 text-xs">Size 2XL</span>
                    <span className="text-slate-600">81 - 90kg</span>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-amber-200 shadow-2xs">
                    <span className="font-bold block text-amber-800 text-xs">Size 3XL</span>
                    <span className="text-slate-600">&gt; 90kg</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 font-serif italic">
                  * Chất liệu cá sấu cotton 4 chiều cao cấp, co giãn thoải mái. Nếu bạn phân vân giữa 2 cỡ, hãy chọn tăng 1 size để mặc rộng rãi nhé!
                </p>
              </div>
            )}

            {/* Lời nhắn */}
            <div className="space-y-1">
              <label htmlFor="rsvp-message" className="block text-xs font-bold text-slate-700 font-sans">
                Lời nhắn gửi tới cả lớp / Lý do (Tùy chọn):
              </label>
              <textarea
                id="rsvp-message"
                rows={2}
                placeholder="Gửi gắm lời chào, kỷ niệm xưa hoặc lý do nếu bạn vắng mặt..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition shadow-2xs font-serif resize-none"
              />
            </div>
          </div>

          {/* ======================================================== */}
          {/* ⚠️ THÔNG BÁO LỖI / THÀNH CÔNG */}
          {/* ======================================================== */}
          {submitError && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-xs text-rose-700 rounded-xl">
              {submitError}
            </div>
          )}

          {submitSuccess && (
            <div className="p-4 sm:p-5 bg-white border border-emerald-300 rounded-2xl shadow-sm space-y-3.5 text-left animate-in fade-in duration-300">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 shadow-2xs">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div className="space-y-1 min-w-0">
                  <p className="font-serif font-bold text-sm sm:text-base text-emerald-900 leading-snug">
                    {submitSuccess}
                  </p>
                  <p className="text-xs text-slate-500 font-sans">
                    Dữ liệu điểm danh đã được ghi nhận trực tiếp vào Google Sheets tab "Diem_Danh".
                  </p>
                </div>
              </div>

              {/* Action Banner: Đóng quỹ / Tải biên lai & Nhận thẻ học sinh */}
              {lastSubmittedAttendee && lastSubmittedAttendee.status === 'yes' && (
                <div className="p-3.5 bg-gradient-to-r from-[#FAF6EE] to-[#F5EFE6] border border-amber-300/80 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-800 flex items-center justify-center shrink-0">
                      <CreditCard className="w-4 h-4 text-amber-700" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 font-sans">
                        Đóng Quỹ Sự Kiện (Tạm Ứng 500.000đ)
                      </p>
                      <p className="text-[11px] text-slate-600 font-sans">
                        Bạn có thể chuyển khoản và gửi ảnh biên lai để Ban Liên Lạc đối soát ngay.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-stretch sm:self-auto">
                    {onOpenReceiptModal ? (
                      <button
                        type="button"
                        onClick={() => onOpenReceiptModal(lastSubmittedAttendee)}
                        className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-sans font-bold text-xs uppercase tracking-wider rounded-xl transition shadow-xs whitespace-nowrap cursor-pointer flex-1 sm:flex-none text-center"
                      >
                        Gửi Ảnh Biên Lai ➔
                      </button>
                    ) : (
                      <a
                        href="#bank-transfer-card"
                        className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-sans font-bold text-xs uppercase tracking-wider rounded-xl transition shadow-xs whitespace-nowrap flex-1 sm:flex-none text-center"
                      >
                        Gửi Ảnh Biên Lai ➔
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Utility actions footer */}
              <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={triggerFullscreenFireworks}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-950 text-xs font-sans font-bold uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                    <span>Bắn lại pháo hoa 🎉</span>
                  </button>

                  {lastSubmittedAttendee && onOpenPassModal && (
                    <button
                      type="button"
                      onClick={() => onOpenPassModal(lastSubmittedAttendee)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1E293B] hover:bg-amber-700 text-white text-xs font-sans font-bold uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      <Award className="w-3.5 h-3.5 text-amber-300" />
                      <span>Nhận Thẻ Học Sinh Của Bạn 🎓</span>
                    </button>
                  )}
                </div>

                <QuickShare variant="pill" buttonText="Rủ bạn K8A1 cùng đăng ký" />
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* 🚀 NÚT GỬI ĐIỂM DANH */}
          {/* ======================================================== */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 hover:from-amber-500 hover:to-amber-700 text-white font-sans font-bold text-xs sm:text-sm uppercase tracking-widest py-3.5 sm:py-4 px-6 rounded-xl sm:rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2.5 disabled:opacity-60 cursor-pointer transform hover:-translate-y-0.5"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{matchedExistingAttendee ? 'Đang cập nhật...' : 'Đang gửi đăng ký...'}</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>{matchedExistingAttendee ? 'Cập Nhật Thông Tin Tham Dự' : 'Gửi Xác Nhận Tham Dự Lớp K8A1'}</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
