import React, { useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
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
              ? 'Đã cập nhật thông tin tham dự thành công vào Google Sheet! Hẹn gặp bạn tại Hội khóa 20 năm.'
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
              ? 'Đã cập nhật thông tin tham dự thành công! Hẹn gặp bạn tại Hội khóa 20 năm.'
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
    <div id="rsvp-form-card" className="bg-[#FAF7F2] border border-amber-200/90 rounded-2xl p-4 sm:p-5 shadow-md space-y-3.5 text-left relative overflow-hidden">
      
      {/* HEADER GỌN GÀNG, ĐỒNG BỘ VỚI CÁC KHỐI KHÁC */}
      <div className="flex items-center justify-between border-b border-amber-200/80 pb-2.5 gap-2">
        <div className="min-w-0">
          <h3 className="text-base sm:text-lg font-serif font-bold text-[#1E293B] truncate leading-tight">
            Xác Nhận Tham Dự Lớp K8A1
          </h3>
          <p className="text-[11px] text-slate-500 font-serif italic truncate">
            Hạn chốt ngày 20/09/2026 để may đo áo đồng phục & đặt tiệc
          </p>
        </div>

        <span className="text-xs font-sans font-bold text-amber-900 bg-amber-100/90 px-2.5 py-1 rounded-lg border border-amber-300/60 shrink-0">
          {confirmedCount} Đã Xác Nhận
        </span>
      </div>

      {/* KHỐI NHẬN DIỆN THÀNH VIÊN ĐỒNG BỘ TOÀN WEB */}
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
                <span className="text-[10px] text-emerald-700 font-sans hidden sm:inline">(Đã từng điểm danh)</span>
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

      {/* CHỌN TRẠNG THÁI THAM GIA GỌN GÀNG */}
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setStatus('yes')}
          className={`py-2 px-3 rounded-lg border text-xs font-sans font-bold transition flex items-center justify-center cursor-pointer ${
            status === 'yes'
              ? 'bg-amber-600 text-white border-amber-700 shadow-xs'
              : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
          }`}
        >
          <span>Có Tham Gia</span>
        </button>

        <button
          type="button"
          onClick={() => setStatus('no')}
          className={`py-2 px-3 rounded-lg border text-xs font-sans font-bold transition flex items-center justify-center cursor-pointer ${
            status === 'no'
              ? 'bg-slate-700 text-white border-slate-800 shadow-xs'
              : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
          }`}
        >
          <span>Rất Tiếc Vắng Mặt</span>
        </button>
      </div>

      {/* FORM NHẬP THÔNG TIN */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200/90 p-3 sm:p-4 space-y-2.5 shadow-2xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
          <div className="space-y-0.5">
            <label htmlFor="rsvp-fullName" className="block text-[11px] font-bold text-slate-700 font-sans">
              Họ và tên <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              id="rsvp-fullName"
              placeholder="Nguyễn Tuấn Anh"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 focus:bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-amber-500 font-sans"
            />
          </div>

          <div className="space-y-0.5">
            <label htmlFor="rsvp-nickname" className="block text-[11px] font-bold text-slate-700 font-sans">
              Biệt danh cấp 3
            </label>
            <input
              type="text"
              id="rsvp-nickname"
              placeholder="Tuấn Béo, Nam Cận..."
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 focus:bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-amber-500 font-sans"
            />
          </div>

          <div className="space-y-0.5">
            <label htmlFor="rsvp-phone" className="block text-[11px] font-bold text-slate-700 font-sans">
              Số điện thoại <span className="text-rose-500">*</span>
            </label>
            <input
              type="tel"
              id="rsvp-phone"
              placeholder="090x xxx xxx"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 focus:bg-white border border-slate-300 rounded-lg text-xs text-slate-800 font-mono focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="space-y-0.5">
            <div className="flex items-center justify-between">
              <label htmlFor="rsvp-shirtSize" className="block text-[11px] font-bold text-slate-700 font-sans">
                Size áo polo
              </label>
              <button
                type="button"
                onClick={() => setShowSizeGuide(!showSizeGuide)}
                className="text-[10px] text-amber-800 hover:text-amber-950 font-bold underline cursor-pointer"
              >
                {showSizeGuide ? 'Đóng' : 'Bảng size'}
              </button>
            </div>
            <select
              id="rsvp-shirtSize"
              value={shirtSize}
              onChange={(e) => setShirtSize(e.target.value)}
              disabled={status === 'no'}
              className="w-full px-2.5 py-1.5 bg-slate-50 focus:bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-amber-500 cursor-pointer disabled:opacity-50"
            >
              {SHIRT_SIZE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Bảng gợi ý size áo dạng gọn */}
        {showSizeGuide && (
          <div className="bg-[#FAF8F5] border border-amber-200 rounded-lg p-2.5 text-xs text-slate-700 space-y-1.5">
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 text-center font-sans text-[11px]">
              {SHIRT_SIZE_OPTIONS.map((opt) => (
                <div key={opt.value} className="bg-white p-1.5 rounded border border-amber-200 shadow-2xs">
                  <span className="font-bold text-amber-900 block">{opt.value}</span>
                  <span className="text-[10px] text-slate-500 block">{opt.weightHint}</span>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-slate-500 font-serif italic text-center">
              * Áo polo co giãn 4 chiều. Nếu phân vân giữa 2 cỡ, bạn nên chọn tăng 1 size để mặc thoải mái.
            </p>
          </div>
        )}

        {/* Lời nhắn */}
        <div className="space-y-0.5">
          <label htmlFor="rsvp-message" className="block text-[11px] font-bold text-slate-700 font-sans">
            Lời nhắn gửi tới lớp / Thầy cô (Tùy chọn)
          </label>
          <textarea
            id="rsvp-message"
            rows={2}
            placeholder="Gửi lời chào, kỷ niệm xưa hoặc lý do nếu bạn vắng mặt..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full px-2.5 py-1.5 bg-slate-50 focus:bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-amber-500 resize-none font-serif leading-relaxed"
          />
        </div>

        {/* Thông báo lỗi */}
        {submitError && (
          <div className="p-2.5 bg-rose-50 border border-rose-200 text-xs text-rose-800 rounded-lg">
            {submitError}
          </div>
        )}

        {/* Thông báo thành công */}
        {submitSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-300 text-xs text-emerald-900 rounded-lg space-y-2">
            <p className="font-bold font-serif">{submitSuccess}</p>
            {lastSubmittedAttendee && lastSubmittedAttendee.status === 'yes' && (
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1.5 border-t border-emerald-200 text-[11px]">
                <span>Đóng quỹ hội khóa (tạm ứng 500k):</span>
                <div className="flex items-center gap-1.5">
                  {onOpenReceiptModal ? (
                    <button
                      type="button"
                      onClick={() => onOpenReceiptModal(lastSubmittedAttendee)}
                      className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded cursor-pointer transition"
                    >
                      Gửi biên lai ➔
                    </button>
                  ) : (
                    <a
                      href="#bank-transfer-card"
                      className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded"
                    >
                      Gửi biên lai ➔
                    </a>
                  )}

                  {onOpenPassModal && (
                    <button
                      type="button"
                      onClick={() => onOpenPassModal(lastSubmittedAttendee)}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded cursor-pointer transition"
                    >
                      Thẻ học sinh
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
          className="w-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-sans font-bold text-xs uppercase tracking-wider py-2.5 px-4 rounded-xl shadow-xs transition cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-60"
        >
          {isSubmitting ? (
            <span>Đang gửi thông tin...</span>
          ) : (
            <span>{matchedExistingAttendee ? 'Cập Nhật Điểm Danh' : 'Xác Nhận Tham Dự'}</span>
          )}
        </button>
      </form>
    </div>
  );
}
