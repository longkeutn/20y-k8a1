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
  CalendarCheck,
  Phone,
  User,
  MessageSquare
} from 'lucide-react';
import { RsvpData, ClassMember } from '../types';
import { CLASS_ROSTER_K8A1, SHIRT_SIZE_OPTIONS } from '../data';
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

  // Chuẩn hóa SĐT an toàn tuyệt đối
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

  // Tìm kiếm xem bạn này đã từng đăng ký trong rsvpList chưa (để kích hoạt chế độ Cập Nhật)
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

  // Đồng bộ thông tin khi activeMember được chọn ở bất kỳ vị trí nào
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

      // Tra cứu xem bạn học này đã từng đăng ký trước đó chưa
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

    // Gửi trực tiếp lên Google Apps Script với content-type text/plain chuẩn xác
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
        const successMessage = isUpdate
          ? (status === 'yes'
              ? 'Đã cập nhật thông tin tham dự thành công! Hệ thống Google Sheet đã ghi nhận phản hồi mới nhất của bạn. Hẹn gặp lại bạn tại Hội khóa 20 năm K8A1! 🎉'
              : 'Đã cập nhật phản hồi: Rất tiếc bạn không thể tham gia. Cả lớp K8A1 vẫn luôn nhớ về bạn!')
          : (status === 'yes'
              ? 'Chúc mừng! Bạn đã xác nhận tham dự thành công. Hẹn gặp lại bạn trong ngày hội ngộ 20 năm Lớp K8A1! 🎉'
              : 'Cảm ơn bạn đã phản hồi! Dù không thể đến trực tiếp, tập thể K8A1 vẫn luôn lưu giữ những kỷ niệm đẹp về bạn.');
        
        setSubmitSuccess(successMessage);
        onAddRsvp(rsvpPayload);

        if (status === 'yes') {
          triggerFullscreenFireworks();
        }
      } catch (error) {
        console.error('Lỗi khi gửi lên Apps Script:', error);
        setSubmitError('Đã lưu đăng ký cục bộ! Vui lòng kiểm tra lại kết nối mạng.');
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
              ? 'Đã cập nhật thông tin tham dự thành công! Hẹn gặp lại bạn tại Hội khóa 20 năm K8A1! 🎉'
              : 'Đã cập nhật phản hồi: Rất tiếc bạn không thể tham gia. Cả lớp K8A1 vẫn luôn nhớ về bạn!')
          : (status === 'yes'
              ? 'Chúc mừng! Bạn đã xác nhận tham dự thành công. Hẹn gặp lại bạn trong ngày hội ngộ 20 năm Lớp K8A1! 🎉'
              : 'Cảm ơn bạn đã phản hồi! Dù không thể đến trực tiếp, tập thể K8A1 vẫn luôn lưu giữ những kỷ niệm đẹp về bạn.');
        
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
    <div id="rsvp-section" className="space-y-6">
      {/* 🌟 KHỐI ĐIỂM DANH HOÀNG GIA - NỔI BẬT NHẤT TOÀN BỘ TRANG WEB */}
      <div 
        id="rsvp-form-card" 
        className="bg-gradient-to-br from-[#FFFDF9] via-[#FAF6F0] to-[#F5EFE6] border-2 border-amber-400/90 rounded-3xl p-6 sm:p-8 md:p-10 shadow-2xl space-y-6 sm:space-y-8 relative overflow-hidden text-left"
      >
        {/* Góc họa tiết hoàng gia cổ điển */}
        <div className="absolute top-3 left-3 w-8 h-8 border-t-2 border-l-2 border-amber-500/70 pointer-events-none" />
        <div className="absolute top-3 right-3 w-8 h-8 border-t-2 border-r-2 border-amber-500/70 pointer-events-none" />
        <div className="absolute bottom-3 left-3 w-8 h-8 border-b-2 border-l-2 border-amber-500/70 pointer-events-none" />
        <div className="absolute bottom-3 right-3 w-8 h-8 border-b-2 border-r-2 border-amber-500/70 pointer-events-none" />

        {/* 🌟 HEADER TRANG TRỌNG & NỔI BẬT */}
        <div className="border-b-2 border-amber-300/80 pb-5 sm:pb-6 space-y-3 relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 via-amber-400/20 to-amber-500/20 border border-amber-500/50 text-amber-950 font-sans font-bold text-xs uppercase tracking-[0.15em] shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-700" />
              <span>HỘI KHÓA 20 NĂM • NIÊN KHÓA 2003 — 2006</span>
            </div>

            <div className="inline-flex items-center gap-2 bg-white/95 border border-amber-300 px-3.5 py-1.5 rounded-xl shadow-xs text-xs sm:text-sm font-sans font-bold text-amber-950">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{confirmedCount} Bạn Đã Xác Nhận Tham Gia 🎉</span>
            </div>
          </div>

          <h3 className="text-2xl sm:text-3xl md:text-4xl font-serif font-black text-slate-900 tracking-tight leading-tight">
            Xác Nhận Tham Dự Lớp K8A1
          </h3>

          <p className="text-xs sm:text-sm md:text-base text-slate-700 font-serif italic max-w-2xl leading-relaxed">
            “Hạn chốt đến hết ngày <strong className="text-amber-900 underline font-bold not-italic">20/09/2026</strong> để Ban Liên Lạc may đo áo polo đồng phục, chuẩn bị quà lưu niệm và đặt tiệc trọn vẹn nhất.”
          </p>
        </div>

        {/* 🌟 FORM ĐIỂM DANH */}
        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          
          {/* ======================================================== */}
          {/* 👤 KHỐI NHẬN DIỆN THÀNH VIÊN K8A1 (ĐỒNG BỘ 100%) */}
          {/* ======================================================== */}
          <div className="bg-white rounded-2xl border-2 border-amber-300/80 p-4 sm:p-5 shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200/60 pb-2.5">
              <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-amber-950 uppercase font-sans tracking-wide">
                <Users className="w-4 h-4 text-amber-700 shrink-0" />
                <span>Nhận diện thành viên Danh Bạ Lớp K8A1</span>
              </div>
              
              {activeMember && (
                <button
                  type="button"
                  onClick={handleResetMember}
                  className="inline-flex items-center gap-1.5 text-xs font-sans font-bold text-amber-800 hover:text-amber-950 bg-amber-100/80 hover:bg-amber-200/80 px-3 py-1.5 rounded-lg border border-amber-300 transition cursor-pointer self-start sm:self-auto"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-amber-700" />
                  <span>Chọn Bạn Khác / Tự Nhập</span>
                </button>
              )}
            </div>

            {activeMember ? (
              /* Đã chọn thành viên */
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FAF8F5] p-4 rounded-xl border border-emerald-300 shadow-2xs">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 text-white font-serif font-bold text-base flex items-center justify-center shrink-0 shadow-md">
                    {activeMember.fullName.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-serif font-bold text-base sm:text-lg text-slate-900">
                        {activeMember.fullName}
                      </h4>
                      {activeMember.nickname && (
                        <span className="text-xs px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-900 font-sans font-bold border border-amber-300">
                          “{activeMember.nickname}”
                        </span>
                      )}
                      {activeMember.role && activeMember.role !== 'Thành viên' && (
                        <span className="text-xs px-2.5 py-0.5 rounded-md bg-rose-100 text-rose-900 font-sans font-bold">
                          {activeMember.role}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-emerald-800 font-sans font-medium flex items-center gap-1.5 mt-1">
                      <UserCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>
                        {matchedExistingAttendee 
                          ? `Bạn đã đăng ký trước đó (${matchedExistingAttendee.status === 'yes' ? 'Có tham gia' : 'Rất tiếc vắng mặt'}) • Bấm cập nhật bên dưới để lưu thông tin mới`
                          : 'Đã kết nối danh bạ • Mời bạn xác nhận tham gia và chọn size áo đồng phục'}
                      </span>
                    </p>
                  </div>
                </div>

                {matchedExistingAttendee && (
                  <span className="text-xs font-sans font-bold text-emerald-900 bg-emerald-100 border border-emerald-300 px-3 py-1.5 rounded-xl shrink-0 self-start sm:self-auto shadow-2xs">
                    Chế độ Cập Nhật 🔄
                  </span>
                )}
              </div>
            ) : (
              /* Chưa chọn thành viên: Dropdown lớn, rõ ràng */
              <div className="space-y-2">
                <p className="text-xs text-slate-600 font-sans">
                  💡 <em>Chọn tên của bạn dưới đây để hệ thống tự động điền SĐT, Size áo và đồng bộ trên toàn bộ WebApp:</em>
                </p>
                <select
                  value={isCustomMode ? 'custom' : ''}
                  onChange={(e) => handleSelectMember(e.target.value)}
                  className="w-full h-12 bg-[#FAF9F6] border-2 border-amber-300 focus:border-amber-500 rounded-xl px-4 text-xs sm:text-sm font-sans font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-400/30 cursor-pointer shadow-xs"
                >
                  <option value="">-- Bấm vào đây để chọn tên bạn trong Danh Bạ Lớp K8A1 --</option>
                  {rosterList.map((m) => {
                    const isRegistered = rsvpList.some(r => 
                      normalizeName(r.fullName) === normalizeName(m.fullName) || 
                      (m.phone && normalizePhone(r.phone) === normalizePhone(m.phone))
                    );
                    return (
                      <option key={m.id} value={m.id}>
                        {m.fullName} {m.nickname ? `[“${m.nickname}”]` : ''} {m.role && m.role !== 'Thành viên' ? `(${m.role})` : ''} {isRegistered ? '✅ [ĐÃ ĐIỂM DANH]' : ''}
                      </option>
                    );
                  })}
                  <option value="custom">✍️ Nhập tên khác (Khách mời / Thầy cô / Bạn bè)</option>
                </select>
              </div>
            )}
          </div>

          {/* ======================================================== */}
          {/* 🔘 2 NÚT CHỌN TRẠNG THÁI THAM GIA LỚN, RÕ RÀNG, ĐẲNG CẤP */}
          {/* ======================================================== */}
          <div className="space-y-2">
            <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-800 font-sans">
              Khả năng tham dự của bạn: <span className="text-rose-600">*</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Option 1: Có Tham Gia */}
              <button
                type="button"
                onClick={() => setStatus('yes')}
                className={`p-4 sm:p-5 rounded-2xl border-2 transition-all flex items-center gap-4 cursor-pointer text-left shadow-sm ${
                  status === 'yes'
                    ? 'border-amber-500 bg-gradient-to-r from-amber-50 via-white to-amber-50/80 ring-2 ring-amber-400/40 shadow-md scale-[1.01]'
                    : 'border-slate-200 bg-white hover:bg-amber-50/40 hover:border-amber-300 text-slate-600'
                }`}
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                  status === 'yes'
                    ? 'bg-amber-600 text-white shadow-md'
                    : 'bg-slate-100 text-slate-400'
                }`}>
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-base sm:text-lg font-bold font-serif ${status === 'yes' ? 'text-amber-950' : 'text-slate-800'}`}>
                      Có Tham Gia 🎉
                    </span>
                    {status === 'yes' && (
                      <span className="text-[10px] uppercase font-sans font-bold bg-amber-200 text-amber-950 px-2 py-0.5 rounded-full">
                        Chắc Chắn
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 font-sans mt-0.5">
                    Hội ngộ cùng cả lớp K8A1 tại Crown Palace
                  </p>
                </div>
              </button>

              {/* Option 2: Rất Tiếc Vắng Mặt */}
              <button
                type="button"
                onClick={() => setStatus('no')}
                className={`p-4 sm:p-5 rounded-2xl border-2 transition-all flex items-center gap-4 cursor-pointer text-left shadow-sm ${
                  status === 'no'
                    ? 'border-rose-400 bg-gradient-to-r from-rose-50 via-white to-rose-50/80 ring-2 ring-rose-300/40 shadow-md scale-[1.01]'
                    : 'border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 text-slate-600'
                }`}
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                  status === 'no'
                    ? 'bg-rose-600 text-white shadow-md'
                    : 'bg-slate-100 text-slate-400'
                }`}>
                  <HeartHandshake className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-base sm:text-lg font-bold font-serif ${status === 'no' ? 'text-rose-950' : 'text-slate-800'}`}>
                      Rất Tiếc Vắng Mặt 🌸
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 font-sans mt-0.5">
                    Không thể đến trực tiếp, gửi lời chúc tới lớp
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* ======================================================== */}
          {/* 📝 KHUNG NHẬP THÔNG TIN RỘNG RÃI, THOÁNG ĐẸP */}
          {/* ======================================================== */}
          <div className="bg-white rounded-2xl border border-amber-200 p-5 sm:p-7 shadow-md space-y-5">
            
            {/* Hàng 1: Họ tên & Biệt danh */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              <div className="space-y-1.5">
                <label htmlFor="rsvp-fullName" className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-800 font-sans">
                  Họ và tên của bạn <span className="text-rose-600">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="rsvp-fullName"
                    placeholder="VD: Nguyễn Tuấn Anh"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full h-12 px-4 bg-[#FAF9F6] focus:bg-white border border-slate-300 focus:border-amber-500 rounded-xl text-sm sm:text-base text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-400/30 transition shadow-2xs font-sans"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="rsvp-nickname" className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-800 font-sans">
                  Biệt danh thời cấp 3 <span className="text-amber-800 text-xs font-normal normal-case italic">(kỷ niệm xưa)</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="rsvp-nickname"
                    placeholder='VD: "Tuấn Béo", "Nam Cận", "Mai Tồ"...'
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    className="w-full h-12 px-4 bg-[#FAF9F6] focus:bg-white border border-slate-300 focus:border-amber-500 rounded-xl text-sm sm:text-base text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-400/30 transition shadow-2xs font-sans"
                  />
                </div>
              </div>
            </div>

            {/* Hàng 2: SĐT & Size áo polo */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              <div className="space-y-1.5">
                <label htmlFor="rsvp-phone" className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-800 font-sans">
                  Số điện thoại liên hệ <span className="text-rose-600">*</span>
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    id="rsvp-phone"
                    placeholder="090x xxx xxx"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full h-12 px-4 bg-[#FAF9F6] focus:bg-white border border-slate-300 focus:border-amber-500 rounded-xl text-sm sm:text-base text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-400/30 transition shadow-2xs font-mono font-bold"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="rsvp-shirtSize" className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-800 font-sans">
                    Size Áo Polo Đồng Phục
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowSizeGuide(!showSizeGuide)}
                    className="text-xs font-sans text-amber-800 hover:text-amber-950 font-bold underline cursor-pointer flex items-center gap-1"
                  >
                    <Info className="w-3.5 h-3.5 text-amber-700" />
                    <span>Bảng Size Chi Tiết</span>
                  </button>
                </div>

                <select
                  id="rsvp-shirtSize"
                  value={shirtSize}
                  onChange={(e) => setShirtSize(e.target.value)}
                  disabled={status === 'no'}
                  className="w-full h-12 px-4 bg-[#FAF9F6] focus:bg-white border border-slate-300 focus:border-amber-500 rounded-xl text-xs sm:text-sm font-sans font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-400/30 transition shadow-2xs cursor-pointer disabled:opacity-50 disabled:bg-slate-100"
                >
                  {SHIRT_SIZE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Bảng Tra Cứu Size Áo Đồng Bộ 100% */}
            {showSizeGuide && (
              <div className="bg-[#FAF8F5] border-2 border-amber-300 rounded-2xl p-4 space-y-3 animate-in fade-in duration-200">
                <div className="flex items-center justify-between font-bold text-amber-950 font-serif text-xs sm:text-sm">
                  <span className="flex items-center gap-2">
                    <Shirt className="w-4 h-4 text-amber-700" />
                    Bảng thông số chọn size áo polo đồng phục Hội khóa 20 năm K8A1:
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowSizeGuide(false)}
                    className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-full cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-center text-xs font-sans">
                  {SHIRT_SIZE_OPTIONS.map((opt) => (
                    <div key={opt.value} className="bg-white p-2.5 rounded-xl border border-amber-200 shadow-2xs">
                      <span className="font-bold block text-amber-900 text-sm">{opt.value}</span>
                      <span className="text-slate-600 text-[11px] leading-tight block mt-0.5">{opt.weightHint}</span>
                    </div>
                  ))}
                </div>

                <p className="text-xs text-slate-600 font-serif italic">
                  * Chất liệu cá sấu cotton 4 chiều cao cấp, co giãn thoải mái. Nếu bạn phân vân giữa 2 cỡ, hãy chọn tăng 1 size để mặc rộng rãi nhé!
                </p>
              </div>
            )}

            {/* Hàng 3: Lời nhắn */}
            <div className="space-y-1.5">
              <label htmlFor="rsvp-message" className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-800 font-sans">
                Lời nhắn gửi tới cả lớp / Thầy cô (Tùy chọn)
              </label>
              <textarea
                id="rsvp-message"
                rows={3}
                placeholder="Gửi gắm lời chào, kỷ niệm xưa hoặc lý do nếu bạn vắng mặt..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-4 py-3 bg-[#FAF9F6] focus:bg-white border border-slate-300 focus:border-amber-500 rounded-xl text-sm sm:text-base text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-400/30 transition shadow-2xs font-serif leading-relaxed resize-none"
              />
            </div>
          </div>

          {/* Thông báo lỗi */}
          {submitError && (
            <div className="p-4 bg-rose-50 border border-rose-300 text-xs sm:text-sm text-rose-800 rounded-2xl shadow-xs">
              {submitError}
            </div>
          )}

          {/* Thông báo thành công & Thao tác sau đăng ký */}
          {submitSuccess && (
            <div className="p-5 sm:p-6 bg-white border-2 border-emerald-400 rounded-2xl shadow-lg space-y-4 text-left animate-in fade-in duration-300">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 shadow-xs">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div className="space-y-1 min-w-0">
                  <p className="font-serif font-bold text-base sm:text-lg text-emerald-950 leading-snug">
                    {submitSuccess}
                  </p>
                  <p className="text-xs text-slate-500 font-sans">
                    Dữ liệu điểm danh đã được đồng bộ trực tiếp vào Google Sheets tab "Diem_Danh".
                  </p>
                </div>
              </div>

              {/* Action Banner: Đóng quỹ / Tải biên lai */}
              {lastSubmittedAttendee && lastSubmittedAttendee.status === 'yes' && (
                <div className="p-4 bg-gradient-to-r from-[#FAF6EE] to-[#F5EFE6] border border-amber-300 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-amber-500/20 text-amber-900 flex items-center justify-center shrink-0">
                      <CreditCard className="w-5 h-5 text-amber-700" />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-bold text-slate-900 font-sans">
                        Đóng Quỹ Sự Kiện (Tạm Ứng 500.000đ / Bạn)
                      </p>
                      <p className="text-xs text-slate-600 font-sans">
                        Bạn có thể chuyển khoản và gửi ảnh biên lai để Ban Liên Lạc đối soát ngay.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-stretch sm:self-auto">
                    {onOpenReceiptModal ? (
                      <button
                        type="button"
                        onClick={() => onOpenReceiptModal(lastSubmittedAttendee)}
                        className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-sans font-bold text-xs uppercase tracking-wider rounded-xl transition shadow-md whitespace-nowrap cursor-pointer flex-1 sm:flex-none text-center"
                      >
                        Gửi Ảnh Biên Lai ➔
                      </button>
                    ) : (
                      <a
                        href="#bank-transfer-card"
                        className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-sans font-bold text-xs uppercase tracking-wider rounded-xl transition shadow-md whitespace-nowrap flex-1 sm:flex-none text-center"
                      >
                        Gửi Ảnh Biên Lai ➔
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Utility actions footer */}
              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={triggerFullscreenFireworks}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-950 text-xs font-sans font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-2xs"
                  >
                    <Sparkles className="w-4 h-4 text-amber-700" />
                    <span>Bắn lại pháo hoa 🎉</span>
                  </button>

                  {lastSubmittedAttendee && onOpenPassModal && (
                    <button
                      type="button"
                      onClick={() => onOpenPassModal(lastSubmittedAttendee)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1E293B] hover:bg-amber-700 text-white text-xs font-sans font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-2xs"
                    >
                      <Award className="w-4 h-4 text-amber-300" />
                      <span>Nhận Thẻ Học Sinh Của Bạn 🎓</span>
                    </button>
                  )}
                </div>

                <QuickShare variant="pill" buttonText="Rủ bạn K8A1 cùng đăng ký" />
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* 🚀 NÚT GỬI ĐIỂM DANH LỚN, NỔI BẬT, RỰC RỠ */}
          {/* ======================================================== */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-14 bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 hover:from-amber-500 hover:to-amber-700 text-white font-sans font-bold text-sm sm:text-base uppercase tracking-widest rounded-2xl shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-3 disabled:opacity-60 cursor-pointer transform hover:-translate-y-0.5 border border-amber-400/40"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>{matchedExistingAttendee ? 'Đang cập nhật vào Google Sheets...' : 'Đang gửi đăng ký vào Google Sheets...'}</span>
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                <span>{matchedExistingAttendee ? 'Cập Nhật Thông Tin Tham Dự Vào Sheet' : 'Gửi Xác Nhận Tham Dự Lớp K8A1'}</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
