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
  Coins,
  User,
  Phone,
  MessageSquare,
  Share2,
  Sliders,
  Check,
  Star,
  Copy
} from 'lucide-react';
import { RsvpData, ClassMember, EventConfig } from '../types';
import { CLASS_ROSTER_K8A1, SHIRT_SIZE_OPTIONS } from '../data';
import LiveGoldenPass from './LiveGoldenPass';

interface RsvpFormProps {
  appsScriptUrl: string;
  rsvpList: RsvpData[];
  eventConfig?: EventConfig;
  classRoster?: ClassMember[];
  activeMember?: ClassMember | null;
  onSelectActiveMember?: (member: ClassMember | null) => void;
  onAddRsvp: (newRsvp: RsvpData) => void;
  onOpenPassModal?: (attendee: RsvpData) => void;
  onOpenReceiptModal?: (attendee?: RsvpData) => void;
}

// Bộ lời nhắn cảm xúc nhanh 1-chạm tuổi học trò
const QUICK_EMOTION_TAGS = [
  { label: 'Hội bàn cuối', emoji: '👋', text: 'Hẹn gặp lại đầy đủ anh em hội bàn cuối ngày xưa nhé!' },
  { label: 'Không say không về', emoji: '🍻', text: '20 năm rồi chớp mắt một cái, hôm đó nhất định không say không về!' },
  { label: 'Chúc thầy cô', emoji: '❤️', text: 'Kính chúc các thầy cô giáo luôn dồi dào sức khỏe, nhớ lớp K8A1 nhiều!' },
  { label: 'Sân bóng xưa', emoji: '⚽', text: 'Vẫn nhớ những buổi trốn học đá bóng, bơi sông Cầu năm ấy...' },
  { label: 'Ghép xe Hà Nội', emoji: '🚗', text: 'Mình xuất phát từ Hà Nội, bạn nào đi cùng thì ới mình đi chung xe nhé!' },
];

export default function RsvpForm({
  appsScriptUrl,
  rsvpList,
  eventConfig,
  classRoster,
  activeMember,
  onSelectActiveMember,
  onAddRsvp,
  onOpenPassModal,
  onOpenReceiptModal
}: RsvpFormProps) {
  const standardFundAmount = Number(eventConfig?.fundAmountPerPerson) || 700000;
  const rosterList = classRoster && classRoster.length > 0 ? classRoster : CLASS_ROSTER_K8A1;

  const [fullName, setFullName] = useState('');
  const [nickname, setNickname] = useState('');
  const [phone, setPhone] = useState('');
  const [shirtSize, setShirtSize] = useState('L');
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [showSmartSizer, setShowSmartSizer] = useState(false);
  const [selectedWeightBracket, setSelectedWeightBracket] = useState<string>('');
  const [status, setStatus] = useState<'yes' | 'no'>('yes');
  const [message, setMessage] = useState('');
  const [isCustomMode, setIsCustomMode] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [lastSubmittedAttendee, setLastSubmittedAttendee] = useState<RsvpData | null>(null);
  const [copiedShareLink, setCopiedShareLink] = useState(false);

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

  // Đếm số lượng họ tên trong danh bạ để nhận diện các bạn trùng tên
  const nameCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    rosterList.forEach((m) => {
      const n = normalizeName(m.fullName);
      if (n) counts[n] = (counts[n] || 0) + 1;
    });
    return counts;
  }, [rosterList]);

  // Tìm kiếm xem bạn này đã từng đăng ký trong rsvpList chưa (chống gộp nhầm người trùng tên)
  const matchedExistingAttendee = useMemo(() => {
    const p = normalizePhone(phone);
    const n = normalizeName(fullName);
    if (!p && !n) return null;

    const duplicateNameInRoster = n ? (nameCounts[n] || 0) > 1 : false;

    return (rsvpList || []).find((item) => {
      if (!item) return false;

      // 1. Ưu tiên khớp theo memberId nếu có (từ Danh Bạ Lớp)
      if (activeMember?.id && item.memberId) {
        if (item.memberId === activeMember.id) return true;
        return false; // Khác memberId => chắc chắn không phải bạn này, dù trùng họ tên!
      }

      const itemP = normalizePhone(item.phone);
      const itemN = normalizeName(item.fullName);

      // 2. Nếu cả 2 đều có SĐT và SĐT khác nhau => Tuyệt đối không khớp
      if (p && itemP && p !== itemP) {
        return false;
      }

      // 3. Nếu SĐT khớp nhau
      if (p && itemP && p === itemP) {
        return true;
      }

      // 4. Nếu họ tên trùng khớp:
      if (n && itemN && n === itemN) {
        // Nếu trong danh bạ có >= 2 bạn trùng họ tên mà không có SĐT khớp => Không gộp bừa
        if (duplicateNameInRoster) {
          return false;
        }
        // Nếu chỉ có duy nhất 1 bạn mang họ tên này và không xung đột SĐT
        if (!p || !itemP || p === itemP) {
          return true;
        }
      }

      return false;
    });
  }, [phone, fullName, rsvpList, activeMember, nameCounts]);

  // Đồng bộ thông tin khi activeMember thay đổi từ bất kỳ đâu (nhận diện chuẩn xác từng người, không đè người trùng tên)
  useEffect(() => {
    if (activeMember) {
      setFullName(activeMember.fullName);
      setNickname(activeMember.nickname || '');
      if (activeMember.shirtSize) {
        const normalizedSize = activeMember.shirtSize.toUpperCase() === 'XXL' ? '2XL' : activeMember.shirtSize.toUpperCase();
        setShirtSize(normalizedSize);
      } else {
        setShirtSize('L');
      }
      setPhone(activeMember.phone ? String(activeMember.phone) : '');
      setIsCustomMode(false);

      const mP = normalizePhone(activeMember.phone);
      const mN = normalizeName(activeMember.fullName);
      const isDupName = mN ? (nameCounts[mN] || 0) > 1 : false;

      // Tìm phản hồi ĐÃ CÓ của CHÍNH activeMember này:
      const existing = (rsvpList || []).find((item) => {
        if (!item) return false;
        // Khớp theo memberId nếu có
        if (item.memberId && activeMember.id) {
          return item.memberId === activeMember.id;
        }
        const itemP = normalizePhone(item.phone);
        const itemN = normalizeName(item.fullName);

        // Nếu khác SĐT thì bỏ qua
        if (mP && itemP && mP !== itemP) return false;

        // Nếu trùng SĐT
        if (mP && itemP && mP === itemP) return true;

        // Nếu trùng họ tên nhưng trong danh bạ có nhiều người cùng tên => không lấy bừa
        if (mN && itemN && mN === itemN) {
          if (isDupName) return false;
          return true;
        }
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
      } else {
        // Bạn này chưa từng đăng ký => khởi tạo form mới sạch sẽ, không giữ message hay status của bạn khác
        setStatus('yes');
        setMessage('');
      }
    } else if (!isCustomMode) {
      setFullName('');
      setNickname('');
      setPhone('');
      setMessage('');
      setStatus('yes');
    }
  }, [activeMember, isCustomMode, rsvpList, nameCounts]);

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
    setSubmitSuccess(null);
    setLastSubmittedAttendee(null);
  };

  // Thêm nhanh lời nhắn cảm xúc
  const handleAddQuickEmotion = (quickText: string) => {
    setMessage((prev) => {
      if (!prev.trim()) return quickText;
      return prev.trim() + ' ' + quickText;
    });
  };

  // Chọn gợi ý size áo thông minh theo cân nặng
  const handleSelectWeightBracket = (bracket: string, suggestedSize: string) => {
    setSelectedWeightBracket(bracket);
    setShirtSize(suggestedSize);
  };

  const triggerCelebration = () => {
    try {
      confetti({ particleCount: 50, spread: 70, origin: { y: 0.65 } });
    } catch {}
  };

  // Rủ bạn cùng bàn qua Zalo
  const handleShareZalo = () => {
    const senderName = fullName.trim() || 'Một bạn cùng lớp';
    const text = `${senderName} vừa báo danh tham dự Họp Lớp 20 Năm K8A1 (2003 - 2006) rồi nhé! Bạn vào báo danh và chọn size áo đồng phục với lớp mình luôn đi: ${window.location.href}#diem-danh`;
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedShareLink(true);
      setTimeout(() => setCopiedShareLink(false), 3000);
    }

    // Mở trang chia sẻ Zalo hoặc Zalo web
    const zaloUrl = `https://zalo.me/share?url=${encodeURIComponent(window.location.href)}&title=${encodeURIComponent(text)}`;
    window.open(zaloUrl, '_blank');
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
      memberId: activeMember?.id,
      fullName: fullName.trim(),
      nickname: nickname.trim() || undefined,
      phone: phone.trim(),
      className: 'K8A1',
      shirtSize: status === 'yes' ? shirtSize : undefined,
      status,
      message: message.trim(),
      submittedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      ...(matchedExistingAttendee ? {
        checkedIn: matchedExistingAttendee.checkedIn,
        checkedInAt: matchedExistingAttendee.checkedInAt,
        avatarUrl: matchedExistingAttendee.avatarUrl,
        fundStatus: matchedExistingAttendee.fundStatus,
        fundAmount: matchedExistingAttendee.fundAmount,
        fundNote: matchedExistingAttendee.fundNote,
        fundReceiptUrl: matchedExistingAttendee.fundReceiptUrl,
        fundPaidAt: matchedExistingAttendee.fundPaidAt,
        fundPaymentMethod: matchedExistingAttendee.fundPaymentMethod,
        fundAuditedBy: matchedExistingAttendee.fundAuditedBy
      } : {})
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
              ? 'Đã cập nhật thông tin tham dự thành công vào Google Sheet! Tấm vé hội ngộ của bạn đã được làm mới.'
              : 'Đã cập nhật: Báo bận vắng mặt. Cả lớp K8A1 vẫn luôn nhớ về bạn!')
          : (status === 'yes'
              ? 'Xác nhận tham dự thành công! Tấm vé kỷ niệm 20 năm của bạn đã được đóng dấu chính thức.'
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
              ? 'Xác nhận tham dự thành công! Tấm vé kỷ niệm 20 năm của bạn đã được đóng dấu chính thức.'
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

  // Tự động nhận diện thành viên đã xác nhận tham gia hay chưa (từ Google Sheet/danh sách đã lưu hoặc vừa nộp xong)
  const isPassConfirmed = useMemo(() => {
    // Nếu người dùng đang bấm chuyển sang 'no' (báo bận) trong form thì không hiển thị dấu đã có mặt
    if (status === 'no') return false;

    // 1. Vừa gửi thành công xác nhận có mặt trong phiên này
    if (submitSuccess && lastSubmittedAttendee && lastSubmittedAttendee.status === 'yes') {
      return true;
    }

    // 2. Hoặc thành viên này đã từng xác nhận có mặt trong rsvpList
    if (matchedExistingAttendee && matchedExistingAttendee.status === 'yes') {
      return true;
    }

    return false;
  }, [status, submitSuccess, lastSubmittedAttendee, matchedExistingAttendee]);

  // Thông tin đối tượng tham dự dùng để mở Modal Thẻ Học Sinh hoặc Nộp Quỹ
  const currentPassAttendee = useMemo(() => {
    if (lastSubmittedAttendee) return lastSubmittedAttendee;
    if (matchedExistingAttendee) return matchedExistingAttendee;
    if (fullName && fullName.trim()) {
      return {
        id: activeMember?.id || 'temp',
        fullName: fullName.trim(),
        nickname: nickname ? nickname.trim() : '',
        shirtSize: shirtSize || 'L',
        status: status,
        phone: phone ? phone.trim() : '',
        className: 'K8A1'
      } as RsvpData;
    }
    return null;
  }, [lastSubmittedAttendee, matchedExistingAttendee, fullName, nickname, shirtSize, status, phone, activeMember]);

  // Cuộn mượt mà xuống khối thanh toán VietQR & Thông tin quỹ lớp (#bank-transfer-card)
  const handleGoToVietQrPayment = () => {
    // Tự động nhận diện activeMember nếu chưa có để khối BankTransfer tự động sinh cú pháp chuyển khoản & mã VietQR chính xác
    if (!activeMember && currentPassAttendee && onSelectActiveMember && classRoster) {
      const matched = classRoster.find(m => {
        if (currentPassAttendee.memberId && m.id === currentPassAttendee.memberId) return true;
        return m.fullName.toLowerCase().trim() === currentPassAttendee.fullName.toLowerCase().trim();
      });
      if (matched) {
        onSelectActiveMember(matched);
      }
    }

    const el = document.getElementById('bank-transfer-card');
    if (el) {
      const navOffset = 64;
      const elementPosition = el.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = Math.max(0, elementPosition - navOffset);
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div id="rsvp-form-card" className="bg-[#FAF7F2] border border-amber-200/90 rounded-2xl p-4 sm:p-6 shadow-md space-y-5 text-left relative overflow-hidden">
      
      {/* HEADER ĐIỂM DANH & SIZE ÁO */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-amber-200/80 pb-3.5 gap-3">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-1.5 text-amber-800">
            <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span className="text-[11px] uppercase tracking-widest font-sans font-bold block">
              Điểm Danh & Tấm Vé Vàng Hội Ngộ
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#1E293B] tracking-tight">
            Xác Nhận Tham Dự Lớp K8A1
          </h3>
          <p className="text-xs text-slate-500 font-serif italic">
            Điểm danh để may đo áo đồng phục polo, đặt mâm tiệc và nhận thẻ kỷ niệm 20 năm
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
                  Thành viên Lớp K8A1 (2003 — 2006) {activeMember.province ? `• ${activeMember.province}` : ''}
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
                  {rosterList.map((m) => {
                    const isDuplicate = (nameCounts[normalizeName(m.fullName)] || 0) > 1;
                    const details: string[] = [];
                    if (m.nickname) details.push(`"${m.nickname}"`);
                    if (isDuplicate && m.phone) details.push(`SĐT đuôi ...${String(m.phone).replace(/[^0-9]/g, '').slice(-4)}`);
                    if (isDuplicate && m.province) details.push(m.province);
                    if (m.role && m.role !== 'Thành viên') details.push(`[${m.role}]`);
                    const detailText = details.length > 0 ? ` (${details.join(' • ')})` : '';

                    return (
                      <option key={m.id} value={m.id}>
                        {m.fullName}{detailText}
                      </option>
                    );
                  })}
                  <option value="custom">✏️ Tự nhập họ tên khác...</option>
                </select>
                <ChevronDown className="w-4 h-4 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* BỐ CỤC 2 CỘT: CỘT TRÁI FORM NHẬP - CỘT PHẢI TẤM VÉ VÀNG REALTIME */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* CỘT PHẢI TRÊN MOBILE (HIỆN TRƯỚC ĐỂ TẠO CẢM HỨNG) HOẶC CỘT PHẢI STICKY TRÊN DESKTOP */}
        <div className="lg:col-span-5 lg:order-2 space-y-3 lg:sticky lg:top-6">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-sans font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-amber-700" />
              <span>Tấm Vé Kỷ Niệm Của Bạn</span>
            </span>
            <span className="text-[10px] font-serif italic text-slate-500">
              {isPassConfirmed ? (
                <span className="text-emerald-700 font-sans font-bold inline-flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>Đã niêm phong sáp đỏ</span>
                </span>
              ) : (
                'Tự cập nhật realtime'
              )}
            </span>
          </div>

          <LiveGoldenPass
            fullName={fullName}
            nickname={nickname}
            shirtSize={shirtSize}
            status={status}
            className="K8A1"
            memberId={activeMember?.id}
            isConfirmed={isPassConfirmed}
            onOpenPassModal={currentPassAttendee ? () => onOpenPassModal && onOpenPassModal(currentPassAttendee) : undefined}
          />

          {/* DÒNG HƯỚNG DẪN KHI CHƯA XÁC NHẬN */}
          {!isPassConfirmed && (
            <p className="text-[11px] text-slate-500 font-serif italic text-center px-2">
              ✨ Điền thông tin bên dưới, bạn sẽ nhận được tấm vé kỷ niệm này với con dấu sáp đỏ chính thức của Lớp K8A1.
            </p>
          )}

          {/* HỘP HÀNH ĐỘNG KHI ĐÃ XÁC NHẬN (CẢ KHI VỪA GỬI XONG HOẶC ĐÃ CÓ TRONG DANH SÁCH) */}
          {isPassConfirmed && currentPassAttendee && (
            <div className="p-3 bg-white border border-amber-300 rounded-xl shadow-xs space-y-2.5 animate-fadeIn">
              <div className="flex items-center justify-between text-amber-900 font-bold font-sans text-xs">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>
                    {submitSuccess ? 'Điểm danh thành công! Bạn muốn làm gì tiếp theo?' : 'Tấm vé của bạn đã được đóng dấu chính thức!'}
                  </span>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {/* Nút Xem / Tải Thẻ */}
                {onOpenPassModal && (
                  <button
                    type="button"
                    onClick={() => onOpenPassModal(currentPassAttendee)}
                    className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-lg cursor-pointer transition text-xs shadow-2xs"
                  >
                    <Award className="w-3.5 h-3.5 text-amber-300" />
                    <span>Tải thẻ in HD</span>
                  </button>
                )}

                {/* Nút Nhắn Zalo Rủ Bạn Thân */}
                <button
                  type="button"
                  onClick={handleShareZalo}
                  className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold rounded-lg cursor-pointer transition text-xs shadow-2xs"
                  title="Nhắn Zalo rủ bạn cùng bàn điểm danh"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>{copiedShareLink ? '✓ Đã chép link' : 'Rủ bạn qua Zalo'}</span>
                </button>
              </div>

              {/* Nút Chuyển Khoản Đóng Quỹ Họp Lớp */}
              {currentPassAttendee.status === 'yes' && (
                <div className="pt-2 border-t border-amber-200/80 space-y-1.5">
                  <button
                    type="button"
                    onClick={handleGoToVietQrPayment}
                    className="w-full inline-flex items-center justify-center gap-2 px-3.5 py-2.5 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold rounded-lg cursor-pointer transition text-xs shadow-md hover:shadow-lg active:scale-[0.99]"
                    title="Chuyển đến khối thông tin số tài khoản và quét mã đóng quỹ"
                  >
                    <Coins className="w-4 h-4 text-emerald-200" />
                    <span>Đóng Quỹ Họp Lớp ({standardFundAmount.toLocaleString('vi-VN')}đ) ➔</span>
                  </button>

                  {/* Nút phụ: Nếu thành viên đã chuyển khoản trước đó và chỉ cần gửi ảnh biên lai */}
                  {onOpenReceiptModal && (
                    <button
                      type="button"
                      onClick={() => onOpenReceiptModal(currentPassAttendee)}
                      className="w-full text-center text-[11px] text-amber-900 hover:text-amber-950 font-medium hover:underline cursor-pointer py-1 flex items-center justify-center gap-1 transition-colors"
                      title="Tải lên ảnh chụp biên lai giao dịch ngân hàng gửi Ban Liên Lạc"
                    >
                      <Receipt className="w-3.5 h-3.5 text-amber-700" />
                      <span>Đã chuyển khoản rồi? Bấm vào đây để tải ảnh biên lai</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* CỘT TRÁI: FORM NHẬP THÔNG TIN (7 PHẦN TRÊN DESKTOP) */}
        <div className="lg:col-span-7 lg:order-1 space-y-4">
          
          {/* 1. CHỌN TRẠNG THÁI THAM GIA */}
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

          {/* 2. FORM NHẬP THÔNG TIN CHI TIẾT */}
          <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-amber-200/80 p-3.5 sm:p-4 space-y-3.5 shadow-2xs">
            
            {/* THÔNG TIN CƠ BẢN: HỌ TÊN, BIỆT DANH, SĐT */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
              
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
                  placeholder="Tuấn Béo, Nam Còi..."
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
            </div>

            {/* BỘ CHỌN SIZE ÁO TRỰC QUAN (CHỈ KHI CHỌN CÓ THAM GIA) */}
            {status === 'yes' && (
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-700 font-sans flex items-center gap-1.5">
                    <Shirt className="w-3.5 h-3.5 text-amber-700" />
                    <span>Chọn Size Áo Polo Đồng Phục Lớp K8A1:</span>
                    <span className="font-mono font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded text-[10px]">
                      {shirtSize}
                    </span>
                  </label>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowSmartSizer(!showSmartSizer)}
                      className="text-[10px] text-amber-800 hover:text-amber-950 font-bold inline-flex items-center gap-1 bg-amber-50 hover:bg-amber-100/70 border border-amber-300/80 px-2 py-0.5 rounded cursor-pointer transition-colors"
                    >
                      <Sliders className="w-3 h-3" />
                      <span>{showSmartSizer ? 'Đóng gợi ý' : 'Gợi ý size 💡'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowSizeGuide(!showSizeGuide)}
                      className="text-[10px] text-slate-600 hover:text-slate-900 underline font-sans cursor-pointer"
                    >
                      {showSizeGuide ? 'Đóng bảng' : 'Bảng size 📐'}
                    </button>
                  </div>
                </div>

                {/* THƯỚC ĐO GỢI Ý SIZE THÔNG MINH THEO CÂN NẶNG */}
                {showSmartSizer && (
                  <div className="bg-amber-50/70 border border-amber-200/90 rounded-xl p-3 text-xs space-y-2 animate-fadeIn">
                    <div className="flex items-center justify-between text-[11px] font-bold text-amber-950">
                      <span>Chọn khoảng cân nặng hiện tại của bạn:</span>
                      <span className="text-[10px] text-slate-500 font-normal italic">Bấm để hệ thống tự chọn</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 font-sans">
                      {[
                        { bracket: '< 55 kg', size: 'S', note: 'Nữ <48kg / Nam <55kg' },
                        { bracket: '55 — 62 kg', size: 'M', note: 'Vừa vặn' },
                        { bracket: '63 — 70 kg', size: 'L', note: 'Phổ biến nhất' },
                        { bracket: '71 — 78 kg', size: 'XL', note: 'Thoải mái' },
                        { bracket: '79 — 86 kg', size: '2XL', note: 'Phom rộng' },
                        { bracket: '> 86 kg', size: '3XL', note: 'Ngoại cỡ' }
                      ].map((item) => (
                        <button
                          key={item.bracket}
                          type="button"
                          onClick={() => handleSelectWeightBracket(item.bracket, item.size)}
                          className={`p-1.5 rounded-lg border text-left transition-all cursor-pointer ${
                            selectedWeightBracket === item.bracket
                              ? 'bg-amber-600 text-white border-amber-700 shadow-2xs font-bold'
                              : 'bg-white hover:bg-amber-100/50 text-slate-700 border-amber-200/80'
                          }`}
                        >
                          <span className="block text-[11px] font-bold">{item.bracket}</span>
                          <span className={`block text-[9px] ${selectedWeightBracket === item.bracket ? 'text-amber-100' : 'text-slate-500'}`}>
                            👉 Gợi ý Size {item.size}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* BẢNG SIZE ÁO DẠNG LƯỚI NÚT TRỰC QUAN */}
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {SHIRT_SIZE_OPTIONS.map((opt) => {
                    const isSelected = shirtSize === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setShirtSize(opt.value)}
                        className={`p-2 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                          isSelected
                            ? 'bg-gradient-to-b from-amber-500 to-amber-600 text-white border-amber-600 shadow-sm ring-2 ring-amber-400/40 font-bold scale-[1.02]'
                            : 'bg-slate-50/70 hover:bg-amber-50/50 text-slate-700 border-slate-200 hover:border-amber-300'
                        }`}
                      >
                        <span className="text-sm sm:text-base font-black font-mono block">
                          {opt.value}
                        </span>
                        <span className={`text-[9px] block mt-0.5 leading-tight ${isSelected ? 'text-amber-100' : 'text-slate-500'}`}>
                          {opt.weightHint}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* BẢNG SIZE MỞ RỘNG (NẾU MỞ) */}
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
                      * Áo polo co giãn 4 chiều. Nếu phân vân giữa 2 cỡ hoặc có bụng, bạn nên chọn tăng 1 size để mặc thoải mái nhất.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* KHUNG LƯU BÚT HỌC TRÒ & DẢI PHÍM CẢM XÚC 1-CHẠM */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between">
                <label htmlFor="rsvp-message" className="text-[11px] font-bold text-slate-700 font-sans flex items-center gap-1">
                  <MessageSquare className="w-3 h-3 text-amber-700" />
                  <span>Trang Lưu Bút K8A1 (Lời nhắn gửi bạn bè & thầy cô):</span>
                </label>
                <span className="text-[10px] text-slate-400 font-sans">Tùy chọn</span>
              </div>

              {/* DẢI PHÍM CẢM XÚC 1-CHẠM */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
                <span className="text-[10px] text-slate-400 font-serif italic shrink-0">
                  Gợi ý nhanh:
                </span>
                {QUICK_EMOTION_TAGS.map((tag) => (
                  <button
                    key={tag.label}
                    type="button"
                    onClick={() => handleAddQuickEmotion(tag.text)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-full text-[11px] font-medium shrink-0 cursor-pointer transition-colors shadow-2xs"
                  >
                    <span>{tag.emoji}</span>
                    <span>{tag.label}</span>
                  </button>
                ))}
              </div>

              {/* KHUNG TEXTAREA LƯU BÚT */}
              <div className="relative">
                <textarea
                  id="rsvp-message"
                  rows={2}
                  placeholder="Gửi lời chào, kỷ niệm xưa, thông tin đi chung xe hoặc lý do nếu bạn vắng mặt..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#FCFAF7] focus:bg-white border border-amber-300/80 focus:border-amber-500 focus:ring-1 focus:ring-amber-400/40 rounded-xl text-xs sm:text-[13px] text-slate-800 resize-none font-serif leading-relaxed outline-none transition shadow-2xs"
                />
              </div>
            </div>

            {/* THÔNG BÁO LỖI */}
            {submitError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-xs text-rose-800 rounded-xl flex items-center gap-2">
                <span className="text-rose-600 font-bold">⚠️</span>
                <span>{submitError}</span>
              </div>
            )}

            {/* THÔNG BÁO THÀNH CÔNG */}
            {submitSuccess && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-300 text-xs text-emerald-900 rounded-xl space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 shrink-0" />
                  <p className="font-bold font-serif text-xs sm:text-sm">{submitSuccess}</p>
                </div>
              </div>
            )}

            {/* NÚT GỬI ĐIỂM DANH */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-sans font-bold text-xs sm:text-sm uppercase tracking-wider py-3.5 px-4 rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60 hover:shadow-lg active:scale-[0.99]"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Đang ghi nhận điểm danh...</span>
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
      </div>
    </div>
  );
}
