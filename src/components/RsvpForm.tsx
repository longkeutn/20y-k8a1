import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  Check,
  Star,
  Copy,
  Edit,
  ShieldCheck,
  Search,
  Eye,
  EyeOff,
  Crown,
  Lock,
  Unlock,
  KeyRound
} from 'lucide-react';
import { RsvpData, ClassMember, EventConfig, UserRole } from '../types';
import { CLASS_ROSTER_K8A1, SHIRT_SIZE_OPTIONS, normalizeShirtSize, maskPhone, isPhoneMatch, isVietnameseNameMatch } from '../data';
import LiveGoldenPass from './LiveGoldenPass';

interface RsvpFormProps {
  appsScriptUrl: string;
  rsvpList: RsvpData[];
  eventConfig?: EventConfig;
  classRoster?: ClassMember[];
  activeMember?: ClassMember | null;
  currentUserRole?: UserRole;
  onSelectActiveMember?: (member: ClassMember | null) => void;
  onAddRsvp: (newRsvp: RsvpData) => void;
  onOpenPassModal?: (attendee: RsvpData) => void;
  onOpenReceiptModal?: (attendee?: RsvpData) => void;
}

// Bộ lời nhắn cảm xúc nhanh 1-chạm tuổi học trò khi CÓ THAM GIA
const QUICK_EMOTION_TAGS = [
  { label: 'Hội bàn cuối', emoji: '👋', text: 'Hẹn gặp lại đầy đủ anh em hội bàn cuối ngày xưa nhé!' },
  { label: 'Không say không về', emoji: '🍻', text: '20 năm rồi chớp mắt một cái, hôm đó nhất định không say không về!' },
  { label: 'Chúc thầy cô', emoji: '❤️', text: 'Kính chúc các thầy cô giáo luôn dồi dào sức khỏe, nhớ lớp K8A1 nhiều!' },
  { label: 'Sân bóng xưa', emoji: '⚽', text: 'Vẫn nhớ những buổi trốn học đá bóng, bơi sông Cầu năm ấy...' },
  { label: 'Ghép xe Hà Nội', emoji: '🚗', text: 'Mình xuất phát từ Hà Nội, bạn nào đi cùng thì ới mình đi chung xe nhé!' },
];

// Bộ lời nhắn cảm xúc nhanh phù hợp khi RẤT TIẾC VẮNG MẶT
const QUICK_ABSENT_TAGS = [
  { label: 'Gửi lời chúc', emoji: '❤️', text: 'Chúc tập thể K8A1 có một buổi hội ngộ 20 năm thật vui vẻ, xúc động và trọn vẹn!' },
  { label: 'Trùng lịch công tác', emoji: '✈️', text: 'Rất tiếc đúng dịp này mình lại vướng lịch công tác xa không về kịp, nhớ lớp mình nhiều!' },
  { label: 'Hẹn dịp tới', emoji: '🤝', text: 'Tiếc quá không về dự được lần này, hẹn gặp lại các bạn vào dịp gần nhất nhé!' },
  { label: 'Nhớ thầy cô & lớp', emoji: '💌', text: 'Dù ở xa không về trực tiếp, trái tim mình vẫn luôn hướng về thầy cô và tập thể K8A1 thân yêu.' },
  { label: 'Hóng ảnh kỷ yếu', emoji: '📸', text: 'Chúc buổi họp lớp đại thành công! Các bạn nhớ livestream và chụp thật nhiều ảnh để mình ngắm với nhé!' },
];

export default function RsvpForm({
  appsScriptUrl,
  rsvpList,
  eventConfig,
  classRoster,
  activeMember,
  currentUserRole,
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
  const [savedExistingPhone, setSavedExistingPhone] = useState('');
  const [useSavedPhone, setUseSavedPhone] = useState(false);
  const [shirtSize, setShirtSize] = useState('');
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [status, setStatus] = useState<'yes' | 'no'>('yes');
  const [message, setMessage] = useState('');
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [showReconsiderModal, setShowReconsiderModal] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isHighlighted, setIsHighlighted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Quyền Ban Liên Lạc / Quản trị viên
  const isBLL = currentUserRole === 'admin' || currentUserRole === 'bll' || currentUserRole === 'treasurer';

  // Danh sách ID thành viên đã được mở khóa trên thiết bị này (lưu trong localStorage)
  const [unlockedMemberIds, setUnlockedMemberIds] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem('k8a1_unlocked_members');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  // Modal mở khóa bằng 4 số cuối SĐT
  const [showPhoneUnlockModal, setShowPhoneUnlockModal] = useState(false);
  const [unlockPhoneDigits, setUnlockPhoneDigits] = useState('');
  const [unlockError, setUnlockError] = useState<string | null>(null);

  // Lắng nghe sự kiện điều hướng nhanh để tự động mở ô chọn tên và focus
  useEffect(() => {
    const handleFocusDiemDanh = () => {
      setIsHighlighted(true);
      setTimeout(() => setIsHighlighted(false), 3500);

      // Nếu chưa chọn bạn học (hoặc đang custom mode), mở dropdown và cuộn lên cao để danh sách hiển thị trọn vẹn
      if (!activeMember) {
        setIsDropdownOpen(true);
        setSearchQuery('');
        setTimeout(() => {
          const selectorEl = document.getElementById('rsvp-member-selector') || document.getElementById('rsvp-form-card');
          const searchInput = document.getElementById('roster-search-input');

          if (selectorEl) {
            const navOffset = 70; // Trừ hao chiều cao navbar cố định
            const elementPosition = selectorEl.getBoundingClientRect().top + window.pageYOffset;
            const offsetPosition = Math.max(0, elementPosition - navOffset);
            window.scrollTo({
              top: offsetPosition,
              behavior: 'smooth'
            });
          }

          if (searchInput) {
            searchInput.focus({ preventScroll: true });
          }
        }, 80);
      } else {
        const formEl = document.getElementById('rsvp-form-card');
        if (formEl) {
          const navOffset = 70;
          const elementPosition = formEl.getBoundingClientRect().top + window.pageYOffset;
          const offsetPosition = Math.max(0, elementPosition - navOffset);
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      }
    };

    window.addEventListener('focus-diem-danh', handleFocusDiemDanh);
    const handleHash = () => {
      if (window.location.hash === '#diem-danh' || window.location.hash === '#rsvp-form-card') {
        handleFocusDiemDanh();
      }
    };
    window.addEventListener('hashchange', handleHash);

    if (window.location.hash === '#diem-danh' || window.location.hash === '#rsvp-form-card') {
      setTimeout(handleFocusDiemDanh, 700);
    }

    return () => {
      window.removeEventListener('focus-diem-danh', handleFocusDiemDanh);
      window.removeEventListener('hashchange', handleHash);
    };
  }, [activeMember]);

  // Tự động nhận diện thành viên đã chọn từ đầu trang (Hero / Navbar) khi mở form
  useEffect(() => {
    try {
      const savedVisitorId = localStorage.getItem('k8a1_visitor_id');
      if (savedVisitorId && !activeMember && rosterList.length > 0) {
        const member = rosterList.find(m => m.id === savedVisitorId);
        if (member) {
          handleSelectMember(member.id);
        }
      }
    } catch {}
  }, [rosterList]);

  // Lắng nghe sự kiện nhận diện danh tính hoặc đổi size áo từ Hero / Navbar
  useEffect(() => {
    const handleSelectVisitorIdentity = (e: any) => {
      const detail = e.detail;
      if (detail && detail.memberId) {
        const member = rosterList.find(m => m.id === detail.memberId);
        if (member) {
          handleSelectMember(member.id);
        }
      } else if (detail && detail.fullName) {
        const member = rosterList.find(m => m.fullName.toLowerCase().trim() === detail.fullName.toLowerCase().trim());
        if (member) {
          handleSelectMember(member.id);
        }
      }
    };

    window.addEventListener('select-visitor-identity', handleSelectVisitorIdentity);
    return () => window.removeEventListener('select-visitor-identity', handleSelectVisitorIdentity);
  }, [rosterList]);

  // Lắng nghe sự kiện yêu cầu đổi size áo từ danh sách hoặc nút bấm bên ngoài
  useEffect(() => {
    const handleUpdateShirtSize = (e: any) => {
      const detail = e.detail;
      if (detail && detail.memberId) {
        const member = rosterList.find(m => m.id === detail.memberId);
        if (member) {
          handleSelectMember(member.id);
        }
      } else if (detail && detail.fullName) {
        const member = rosterList.find(m => m.fullName.toLowerCase().trim() === detail.fullName.toLowerCase().trim());
        if (member) {
          handleSelectMember(member.id);
        }
      }

      setTimeout(() => {
        const shirtEl = document.getElementById('rsvp-shirt-size-section');
        if (shirtEl) {
          const navOffset = 70;
          const elementPosition = shirtEl.getBoundingClientRect().top + window.pageYOffset;
          const offsetPosition = Math.max(0, elementPosition - navOffset);
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      }, 150);
    };

    window.addEventListener('update-member-shirt-size', handleUpdateShirtSize);
    return () => window.removeEventListener('update-member-shirt-size', handleUpdateShirtSize);
  }, [rosterList]);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  // Tách tên gọi cuối cùng của người Việt để sắp xếp A-Z (VD: Nguyễn Tuấn Anh -> Anh)
  const getVietnameseGivenName = (fullName: string): string => {
    if (!fullName) return '';
    const parts = fullName.trim().split(/\s+/);
    return parts[parts.length - 1] || fullName;
  };

  // Chuẩn hóa chuỗi bỏ dấu tiếng Việt để tìm kiếm thông minh
  const removeVietnameseAccents = (str: string): string => {
    if (!str) return '';
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D')
      .toLowerCase();
  };

  // Danh sách thành viên lớp K8A1 đã được sắp xếp chuẩn theo vần tên gọi A-Z và lọc theo từ khóa tìm kiếm
  const filteredRoster = useMemo(() => {
    const q = removeVietnameseAccents(searchQuery.trim());
    
    // Sắp xếp theo tên gọi A-Z chuẩn văn hóa Việt Nam
    const sorted = [...rosterList].sort((a, b) => {
      const nameA = getVietnameseGivenName(a.fullName);
      const nameB = getVietnameseGivenName(b.fullName);
      const cmp = nameA.localeCompare(nameB, 'vi');
      if (cmp !== 0) return cmp;
      return a.fullName.localeCompare(b.fullName, 'vi');
    });

    if (!q) return sorted;

    return sorted.filter((m) => {
      const normName = removeVietnameseAccents(m.fullName);
      const normNick = m.nickname ? removeVietnameseAccents(m.nickname) : '';
      const normPhone = m.phone ? String(m.phone).replace(/[^0-9]/g, '') : '';
      return normName.includes(q) || normNick.includes(q) || normPhone.includes(q);
    });
  }, [rosterList, searchQuery]);

  // Danh sách các bạn học phù hợp trong danh bạ khi người dùng tự gõ họ tên hoặc biệt danh
  const matchingRosterMembers = useMemo(() => {
    if (activeMember || !fullName.trim() || fullName.trim().length < 2) return [];

    const rawInput = fullName.trim();
    const cleanInput = removeVietnameseAccents(rawInput);
    const inputTokens = cleanInput.split(/\s+/).filter(Boolean);

    const scoredMembers = rosterList.map((m) => {
      const rawName = m.fullName.trim();
      const cleanName = removeVietnameseAccents(rawName);
      const nameTokens = cleanName.split(/\s+/).filter(Boolean);
      const givenName = nameTokens[nameTokens.length - 1] || '';

      const rawNick = (m.nickname || '').trim();
      const cleanNick = removeVietnameseAccents(rawNick);
      const nickTokens = cleanNick.split(/\s+/).filter(Boolean);

      let score = 0;

      // 1. Trùng khớp tuyệt đối cả họ và tên (100 điểm)
      if (cleanName === cleanInput) {
        score = 100;
      }
      // 2. Trùng khớp tuyệt đối tên gọi (VD: gõ "Linh" -> "Ngô Linh", "Linh Hữu")
      else if (givenName === cleanInput) {
        score = 85;
      }
      // 3. Trùng khớp biệt danh hoặc từ trong biệt danh (VD: "Báo", "Còi", "Mít")
      else if (cleanNick && (cleanNick === cleanInput || nickTokens.includes(cleanInput))) {
        score = 80;
      }
      // 4. Họ tên bắt đầu bằng cụm từ đang gõ
      else if (cleanName.startsWith(cleanInput)) {
        score = 75;
      }
      // 5. Cụm từ đang gõ nằm trọn vẹn trong họ tên
      else if (cleanName.includes(cleanInput)) {
        if (inputTokens.length >= 2) {
          score = 70;
        } else if (nameTokens.includes(cleanInput)) {
          // Là 1 từ trọn vẹn trong tên, loại trừ chữ đệm quá phổ biến như 'thi', 'van'
          if (cleanInput === 'thi' || cleanInput === 'van') {
            score = 15;
          } else {
            score = 65;
          }
        }
      }
      // 6. Toàn bộ từ đang gõ nằm trong các từ của họ tên (VD: "Trần Khuyến" -> "Trần Văn Khuyến")
      else if (inputTokens.length >= 2 && inputTokens.every(t => nameTokens.includes(t))) {
        score = 65;
      }
      // 7. Toàn bộ từ của họ tên nằm trong chuỗi đang gõ (VD: "Linh Hữu" -> "Thái Hữu Linh")
      else if (nameTokens.length >= 2 && nameTokens.every(t => inputTokens.includes(t))) {
        score = 60;
      }
      // 8. Tên gọi cuối cùng trùng nhau + có ít nhất 1 từ khác trùng
      else if (inputTokens.length >= 2 && givenName === inputTokens[inputTokens.length - 1]) {
        const matchCount = inputTokens.filter(t => nameTokens.includes(t)).length;
        if (matchCount >= 2) score = 55;
      }
      // 9. Khớp theo isVietnameseNameMatch chuẩn toàn hệ thống
      else if (isVietnameseNameMatch(m, rawInput)) {
        score = 50;
      }
      // 10. Biệt danh chứa từ khóa đang gõ
      else if (cleanNick && cleanNick.includes(cleanInput)) {
        score = 45;
      }

      // Khớp bổ sung theo SĐT nếu người dùng đã nhập SĐT
      if (phone.trim() && phone.trim().length >= 8 && isPhoneMatch(m.phone, phone.trim())) {
        score += 50;
      }

      return { member: m, score };
    });

    return scoredMembers
      .filter(item => item.score > 25)
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        const nameA = getVietnameseGivenName(a.member.fullName);
        const nameB = getVietnameseGivenName(b.member.fullName);
        return nameA.localeCompare(nameB, 'vi');
      })
      .map(item => item.member)
      .slice(0, 8);
  }, [activeMember, fullName, phone, rosterList]);

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
    const activePhone = phone.trim() || (useSavedPhone ? savedExistingPhone : '');
    const p = normalizePhone(activePhone);
    const n = normalizeName(fullName);
    if (!p && !n) return null;

    const duplicateNameInRoster = n ? (nameCounts[n] || 0) > 1 : false;

    return (rsvpList || []).find((item) => {
      if (!item) return false;

      // 1. Ưu tiên khớp theo memberId nếu activeMember thực sự khớp với họ tên người đang nhập
      const activeMemberMatchesInput = activeMember && fullName.trim()
        ? (normalizeName(activeMember.fullName) === n || isVietnameseNameMatch(activeMember, fullName.trim(), nickname))
        : (!fullName.trim());

      if (activeMemberMatchesInput && activeMember?.id && item.memberId) {
        if (item.memberId === activeMember.id) return true;
        return false; // Khác memberId => chắc chắn không phải bạn này, dù trùng họ tên!
      }

      // 2. Nếu SĐT khớp nhau (hỗ trợ nhiều số hoặc định dạng linh hoạt)
      if (isPhoneMatch(activePhone, item.phone)) {
        return true;
      }

      // 3. Nếu họ tên trùng khớp:
      const itemN = normalizeName(item.fullName);
      if (n && itemN && n === itemN) {
        // Nếu trong danh bạ có >= 2 bạn trùng họ tên mà không có SĐT khớp => Không gộp bừa
        if (duplicateNameInRoster) {
          return false;
        }
        return true;
      }

      return false;
    });
  }, [phone, savedExistingPhone, useSavedPhone, fullName, rsvpList, activeMember, nameCounts]);

  // Xác định mã thành viên đang được tương tác
  const currentTargetMemberId = activeMember?.id || matchedExistingAttendee?.memberId;

  // Thành viên có phải chính chủ trên thiết bị này (hoặc là BLL) không?
  const isOwner = useMemo(() => {
    if (isBLL) return true;
    if (!matchedExistingAttendee) return true; // Chưa ai đăng ký trước đó thì ai nộp mới cũng là chính chủ
    if (!currentTargetMemberId) return false;

    // Đã được mở khóa trên thiết bị này
    if (unlockedMemberIds.includes(currentTargetMemberId)) return true;

    // Thiết bị này từng lưu visitor ID trùng với bạn này
    try {
      const savedVisitorId = localStorage.getItem('k8a1_visitor_id');
      if (savedVisitorId && savedVisitorId === currentTargetMemberId) return true;
    } catch {}

    return false;
  }, [isBLL, matchedExistingAttendee, currentTargetMemberId, unlockedMemberIds]);

  // Hồ sơ đã đăng ký trước đó và đang bị khóa đối với người lạ / thiết bị lạ
  const isLocked = useMemo(() => {
    if (isBLL) return false;
    if (!matchedExistingAttendee) return false;
    return !isOwner;
  }, [isBLL, matchedExistingAttendee, isOwner]);

  // Xác thực 4 số cuối SĐT để mở khóa hồ sơ
  const handleVerifyPhoneUnlock = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setUnlockError(null);
    const inputDigits = unlockPhoneDigits.replace(/[^0-9]/g, '').trim();
    if (inputDigits.length !== 4) {
      setUnlockError('Vui lòng nhập đúng 4 chữ số cuối số điện thoại.');
      return;
    }

    const candidatePhone = savedExistingPhone || matchedExistingAttendee?.phone || activeMember?.phone || '';
    const cleanCandidate = String(candidatePhone).replace(/[^0-9]/g, '');

    let isMatched = false;
    if (cleanCandidate.endsWith(inputDigits)) {
      isMatched = true;
    } else {
      const phoneChunks = cleanCandidate.match(/\d{9,11}/g) || [];
      if (phoneChunks.some(chunk => chunk.endsWith(inputDigits))) {
        isMatched = true;
      }
    }

    if (isMatched) {
      const targetId = currentTargetMemberId;
      if (targetId) {
        const nextUnlocked = Array.from(new Set([...unlockedMemberIds, targetId]));
        setUnlockedMemberIds(nextUnlocked);
        try {
          localStorage.setItem('k8a1_unlocked_members', JSON.stringify(nextUnlocked));
          localStorage.setItem('k8a1_visitor_id', targetId);
        } catch {}
      }
      setShowPhoneUnlockModal(false);
      setUnlockPhoneDigits('');
      setUnlockError(null);
      setSubmitSuccess('Đã mở khóa hồ sơ thành công! Bạn có thể thoải mái cập nhật size áo và lời chúc.');
      setTimeout(() => setSubmitSuccess(null), 5000);
    } else {
      setUnlockError('4 số cuối số điện thoại chưa khớp với thông tin đã lưu. Vui lòng kiểm tra lại hoặc liên hệ Ban Liên Lạc.');
    }
  };

  // Đồng bộ thông tin khi activeMember thay đổi từ bất kỳ đâu (nhận diện chuẩn xác từng người, không đè người trùng tên)
  useEffect(() => {
    if (activeMember) {
      setFullName(activeMember.fullName);
      setNickname(activeMember.nickname || '');
      if (activeMember.shirtSize) {
        const normalizedSize = activeMember.shirtSize.toUpperCase() === 'XXL' ? '2XL' : activeMember.shirtSize.toUpperCase();
        setShirtSize(normalizeShirtSize(normalizedSize));
      } else {
        setShirtSize('');
      }
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

        // Khớp theo SĐT (hỗ trợ nhiều số hoặc định dạng linh hoạt)
        if (isPhoneMatch(activeMember.phone, item.phone)) return true;

        // Nếu trùng họ tên nhưng trong danh bạ có nhiều người cùng tên => không lấy bừa
        if (mN && itemN && mN === itemN) {
          if (isDupName) return false;
          return true;
        }
        return false;
      });

      // Xác định SĐT đã lưu (nếu có): bảo vệ PII bằng cách lưu vào savedExistingPhone và che mờ, không in số trần
      const existingPhone = existing?.phone ? String(existing.phone).trim() : (activeMember.phone ? String(activeMember.phone).trim() : '');
      if (existingPhone) {
        setSavedExistingPhone(existingPhone);
        setUseSavedPhone(true);
      } else {
        setSavedExistingPhone('');
        setUseSavedPhone(false);
      }
      setPhone('');

      if (existing) {
        if (existing.shirtSize) {
          setShirtSize(normalizeShirtSize(existing.shirtSize));
        } else if (activeMember.shirtSize) {
          setShirtSize(normalizeShirtSize(activeMember.shirtSize));
        } else {
          setShirtSize('');
        }
        if (existing.status) setStatus(existing.status);
        if (existing.message) setMessage(String(existing.message));
        if (existing.nickname) setNickname(String(existing.nickname));
      } else {
        // Bạn này chưa từng đăng ký => khởi tạo form mới sạch sẽ, không giữ message hay status của bạn khác
        setStatus('yes');
        setMessage('');
        if (!activeMember.shirtSize) {
          setShirtSize('');
        }
      }
    } else if (!isCustomMode) {
      setFullName('');
      setNickname('');
      setPhone('');
      setShirtSize('');
      setSavedExistingPhone('');
      setUseSavedPhone(false);
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
      setShirtSize('');
      setSavedExistingPhone('');
      setUseSavedPhone(false);
      return;
    }

    if (!memberId) {
      if (onSelectActiveMember) onSelectActiveMember(null);
      setFullName('');
      setNickname('');
      setPhone('');
      setShirtSize('');
      setSavedExistingPhone('');
      setUseSavedPhone(false);
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
          setShirtSize(normalizeShirtSize(member.shirtSize));
        } else {
          setShirtSize('');
        }
        const mPhone = member.phone ? String(member.phone).trim() : '';
        setSavedExistingPhone(mPhone);
        setUseSavedPhone(!!mPhone);
        setPhone('');
      }
    }
  };

  const handleResetMember = () => {
    if (onSelectActiveMember) onSelectActiveMember(null);
    setIsCustomMode(false);
    setFullName('');
    setNickname('');
    setPhone('');
    setShirtSize('');
    setSavedExistingPhone('');
    setUseSavedPhone(false);
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

  const executeSubmitRsvp = async (targetStatus: 'yes' | 'no') => {
    if (isLocked) {
      setUnlockError(null);
      setUnlockPhoneDigits('');
      setShowPhoneUnlockModal(true);
      setSubmitError('Hồ sơ này đã được đăng ký và bảo vệ. Vui lòng mở khóa bằng 4 số cuối SĐT trước khi cập nhật.');
      return;
    }

    const finalPhone = phone.trim() || (useSavedPhone ? savedExistingPhone : '');
    if (!fullName.trim() || !finalPhone) {
      setSubmitError('Vui lòng điền đầy đủ Họ và tên và Số điện thoại liên hệ.');
      return;
    }

    if (targetStatus === 'yes') {
      const cleanShirtSize = normalizeShirtSize(shirtSize);
      if (!cleanShirtSize && shirtSize !== 'CHƯA CHỌN' && shirtSize !== 'pending') {
        setSubmitError('Vui lòng chọn Size Áo polo đồng phục (hoặc bấm "Tôi chưa rõ số đo / Báo size sau") trước khi hoàn tất!');
        const shirtSection = document.getElementById('rsvp-shirt-size-section');
        if (shirtSection) {
          shirtSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
      }
    }

    // Tự động nhận diện và bảo vệ chống trùng lặp nếu người dùng tự gõ họ tên trùng khớp 1 bạn duy nhất trong danh bạ
    const isMemberNameMatched = activeMember && (
      normalizeName(activeMember.fullName) === normalizeName(fullName) ||
      isVietnameseNameMatch(activeMember, fullName.trim(), nickname)
    );
    let effectiveMemberId = isMemberNameMatched ? activeMember?.id : undefined;
    let effectiveRowId = isMemberNameMatched ? matchedExistingAttendee?.rowId : undefined;
    let effectiveId = isMemberNameMatched ? matchedExistingAttendee?.id : undefined;

    if (!effectiveMemberId) {
      const n = normalizeName(fullName);
      let uniqueMatch = rosterList.filter(m => normalizeName(m.fullName) === n);
      if (uniqueMatch.length === 0 && finalPhone) {
        uniqueMatch = rosterList.filter(m => isPhoneMatch(m.phone, finalPhone));
      }
      if (uniqueMatch.length === 0) {
        uniqueMatch = rosterList.filter(m => isVietnameseNameMatch(m, fullName.trim(), nickname));
      }
      if (uniqueMatch.length === 1) {
        effectiveMemberId = uniqueMatch[0].id;
        const existingInRsvp = (rsvpList || []).find(r => 
          (r.memberId && r.memberId === effectiveMemberId) || 
          isPhoneMatch(r.phone, finalPhone) ||
          isVietnameseNameMatch(uniqueMatch[0], r.fullName)
        );
        if (existingInRsvp) {
          effectiveRowId = existingInRsvp.rowId;
          effectiveId = existingInRsvp.id;
        }
      }
    }

    // 🛡️ PHƯƠNG ÁN 1: Bắt buộc họ tên người điểm danh phải thuộc danh bạ 65 thành viên K8A1
    if (!effectiveMemberId) {
      setSubmitError(
        `Họ tên "${fullName.trim()}" không nằm trong danh bạ 65 bạn học K8A1. Vui lòng bấm vào ô "Danh Bạ 65 Bạn" ở trên để chọn đúng tên của bạn!`
      );
      const dropdownTrigger = document.getElementById('roster-dropdown-trigger');
      if (dropdownTrigger) {
        dropdownTrigger.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setIsDropdownOpen(true);
      }
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(null);

    const cleanChosenShirtSize = targetStatus === 'yes' ? (normalizeShirtSize(shirtSize) || 'CHƯA CHỌN') : undefined;

    const rsvpPayload: RsvpData = {
      id: effectiveId || (matchedExistingAttendee ? matchedExistingAttendee.id : `rsvp-${Date.now()}`),
      rowId: effectiveRowId,
      memberId: effectiveMemberId,
      fullName: fullName.trim(),
      nickname: nickname.trim() || undefined,
      phone: finalPhone,
      className: 'K8A1',
      shirtSize: cleanChosenShirtSize,
      status: targetStatus,
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
        hasReceipt: matchedExistingAttendee.hasReceipt,
        fundPaidAt: matchedExistingAttendee.fundPaidAt,
        fundPaymentMethod: matchedExistingAttendee.fundPaymentMethod,
        fundAuditedBy: matchedExistingAttendee.fundAuditedBy
      } : {})
    };

    setLastSubmittedAttendee(rsvpPayload);
    setSavedExistingPhone(finalPhone);
    setUseSavedPhone(true);
    setPhone('');

    // Gửi trực tiếp lên Google Apps Script
    if (appsScriptUrl && appsScriptUrl.startsWith('http')) {
      try {
        const res = await fetch(appsScriptUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'text/plain;charset=utf-8',
          },
          body: JSON.stringify({
            action: 'rsvp',
            ...rsvpPayload
          })
        });

        const resJson = await res.json().catch(() => null);
        if (resJson && resJson.status === 'error') {
          setSubmitError(resJson.message || 'Không thể lưu phản hồi điểm danh!');
          return;
        }

        const isUpdate = !!matchedExistingAttendee;
        const successMsg = isUpdate
          ? (targetStatus === 'yes'
              ? `Đã cập nhật size áo thành Size ${shirtSize} thành công! Tấm vé kỷ niệm của bạn đã được làm mới.`
              : 'Đã cập nhật: Báo bận vắng mặt. Cả lớp K8A1 vẫn luôn nhớ về bạn!')
          : (targetStatus === 'yes'
              ? 'Xác nhận tham dự thành công! Tấm vé kỷ niệm 20 năm của bạn đã được đóng dấu chính thức.'
              : 'Đã lưu phản hồi. Dù không thể đến trực tiếp, tập thể K8A1 vẫn luôn lưu giữ kỷ niệm về bạn.');
        
        setSubmitSuccess(successMsg);
        if (effectiveMemberId) {
          const nextUnlocked = Array.from(new Set([...unlockedMemberIds, effectiveMemberId]));
          setUnlockedMemberIds(nextUnlocked);
          try {
            localStorage.setItem('k8a1_unlocked_members', JSON.stringify(nextUnlocked));
            localStorage.setItem('k8a1_visitor_id', effectiveMemberId);
          } catch {}
        }
        onAddRsvp(rsvpPayload);

        if (targetStatus === 'yes') {
          triggerCelebration();
        }
      } catch (error) {
        console.error('Lỗi khi gửi lên Apps Script:', error);
        setSubmitError('Đã lưu đăng ký cục bộ. Vui lòng kiểm tra lại kết nối mạng.');
        if (effectiveMemberId) {
          const nextUnlocked = Array.from(new Set([...unlockedMemberIds, effectiveMemberId]));
          setUnlockedMemberIds(nextUnlocked);
          try {
            localStorage.setItem('k8a1_unlocked_members', JSON.stringify(nextUnlocked));
            localStorage.setItem('k8a1_visitor_id', effectiveMemberId);
          } catch {}
        }
        onAddRsvp(rsvpPayload);
        if (targetStatus === 'yes') {
          triggerCelebration();
        }
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setTimeout(() => {
        if (effectiveMemberId) {
          const nextUnlocked = Array.from(new Set([...unlockedMemberIds, effectiveMemberId]));
          setUnlockedMemberIds(nextUnlocked);
          try {
            localStorage.setItem('k8a1_unlocked_members', JSON.stringify(nextUnlocked));
            localStorage.setItem('k8a1_visitor_id', effectiveMemberId);
          } catch {}
        }
        onAddRsvp(rsvpPayload);
        const isUpdate = !!matchedExistingAttendee;
        const successMsg = isUpdate
          ? (targetStatus === 'yes'
              ? 'Đã cập nhật thông tin tham dự thành công! Hẹn gặp bạn tại Ngày Họp Lớp 20 Năm Lớp K8A1.'
              : 'Đã cập nhật: Báo bận vắng mặt. Cả lớp K8A1 vẫn luôn nhớ về bạn!')
          : (targetStatus === 'yes'
              ? 'Xác nhận tham dự thành công! Tấm vé kỷ niệm 20 năm của bạn đã được đóng dấu chính thức.'
              : 'Đã lưu phản hồi. Cảm ơn bạn!');
        
        setSubmitSuccess(successMsg);
        setIsSubmitting(false);

        if (targetStatus === 'yes') {
          triggerCelebration();
        }
      }, 400);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) {
      setUnlockError(null);
      setUnlockPhoneDigits('');
      setShowPhoneUnlockModal(true);
      return;
    }
    const finalPhone = phone.trim() || (useSavedPhone ? savedExistingPhone : '');
    if (!fullName.trim() || !finalPhone) {
      setSubmitError('Vui lòng điền đầy đủ Họ và tên và Số điện thoại liên hệ.');
      return;
    }

    // Nếu thành viên chọn VẮNG MẶT, hiển thị Modal kêu gọi tâm tình nghĩ lại trước khi gửi
    if (status === 'no') {
      setShowReconsiderModal(true);
      return;
    }

    await executeSubmitRsvp('yes');
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

  // Xác định mã thành viên chính xác (effectiveMemberId) cho thẻ kỷ niệm và checkin
  const effectiveMemberId = useMemo(() => {
    // 1. Nếu activeMember đang được chọn và khớp tên
    if (activeMember && fullName.trim()) {
      if (
        normalizeName(activeMember.fullName) === normalizeName(fullName) ||
        isVietnameseNameMatch(activeMember, fullName.trim(), nickname)
      ) {
        return activeMember.id;
      }
    }
    // 2. Nếu đã có dữ liệu RSVP đã xác nhận trước đó mang memberId (chỉ nhận nếu khớp với họ tên người đang nhập)
    if (lastSubmittedAttendee?.memberId && isVietnameseNameMatch({ fullName: lastSubmittedAttendee.fullName, nickname: lastSubmittedAttendee.nickname }, fullName.trim(), nickname)) {
      return lastSubmittedAttendee.memberId;
    }
    if (matchedExistingAttendee?.memberId && isVietnameseNameMatch({ fullName: matchedExistingAttendee.fullName, nickname: matchedExistingAttendee.nickname }, fullName.trim(), nickname)) {
      return matchedExistingAttendee.memberId;
    }

    // 3. Khớp từ danh bạ lớp rosterList theo họ tên & biệt danh
    if (fullName.trim() && rosterList && rosterList.length > 0) {
      if (nickname && nickname.trim()) {
        const nickMatch = rosterList.find((m) => m.nickname && normalizeName(m.nickname) === normalizeName(nickname));
        if (nickMatch) return nickMatch.id;
      }
      const n = normalizeName(fullName);
      const exactMatch = rosterList.find((m) => normalizeName(m.fullName) === n);
      if (exactMatch) return exactMatch.id;

      const aliasMatch = rosterList.find((m) => isVietnameseNameMatch(m, fullName.trim(), nickname));
      if (aliasMatch) return aliasMatch.id;
    }

    // 4. Fallback: Nếu activeMember có sẵn và form chưa gõ tên
    if (activeMember && !fullName.trim()) return activeMember.id;

    return undefined;
  }, [activeMember, fullName, nickname, lastSubmittedAttendee, matchedExistingAttendee, rosterList]);

  // Thông tin đối tượng tham dự dùng để mở Modal Thẻ Học Sinh hoặc Nộp Quỹ
  const currentPassAttendee = useMemo(() => {
    if (lastSubmittedAttendee) {
      return {
        ...lastSubmittedAttendee,
        memberId: lastSubmittedAttendee.memberId || effectiveMemberId
      };
    }
    if (matchedExistingAttendee) {
      return {
        ...matchedExistingAttendee,
        memberId: matchedExistingAttendee.memberId || effectiveMemberId
      };
    }
    if (fullName && fullName.trim()) {
      return {
        id: effectiveMemberId || 'temp',
        memberId: effectiveMemberId,
        fullName: fullName.trim(),
        nickname: nickname ? nickname.trim() : '',
        shirtSize: shirtSize ? normalizeShirtSize(shirtSize) : '',
        status: status,
        phone: phone ? phone.trim() : '',
        className: 'K8A1'
      } as RsvpData;
    }
    return null;
  }, [lastSubmittedAttendee, matchedExistingAttendee, fullName, nickname, shirtSize, status, phone, effectiveMemberId]);

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

            <div className="flex items-center gap-1.5 shrink-0">
              {/* Nút biểu tượng trạng thái chế độ (Icon only - siêu gọn gàng) */}
              {isBLL ? (
                <div 
                  className="w-7 h-7 rounded-lg bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800 shadow-2xs cursor-default"
                  title="Chế độ Ban Liên Lạc (Toàn quyền quản lý & cập nhật hồ sơ)"
                >
                  <Crown className="w-4 h-4 text-amber-700" />
                </div>
              ) : matchedExistingAttendee ? (
                isOwner ? (
                  <div 
                    className="w-7 h-7 rounded-lg bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-800 shadow-2xs cursor-default"
                    title="Chính chủ hồ sơ (Tự do đổi size áo, số điện thoại & lời chúc)"
                  >
                    <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setUnlockError(null);
                      setUnlockPhoneDigits('');
                      setShowPhoneUnlockModal(true);
                    }}
                    className="w-7 h-7 rounded-lg bg-amber-100 hover:bg-amber-200 border border-amber-400 flex items-center justify-center text-amber-900 shadow-2xs cursor-pointer transition-colors"
                    title="Hồ sơ đã bảo vệ. Bấm vào đây để mở khóa bằng 4 số cuối SĐT"
                  >
                    <Lock className="w-3.5 h-3.5 text-amber-800" />
                  </button>
                )
              ) : null}

              <button
                type="button"
                onClick={handleResetMember}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] text-amber-800 hover:text-amber-950 bg-white hover:bg-amber-100/60 border border-amber-300 rounded-lg font-bold transition-colors cursor-pointer shrink-0 shadow-2xs"
              >
                <X className="w-3 h-3" />
                <span>Đổi bạn khác</span>
              </button>
            </div>
          </div>
        ) : (
          <div id="rsvp-member-selector" className="space-y-2.5 w-full scroll-mt-28" ref={dropdownRef}>
            {/* LỜI NHẮC CỰC KỲ NỔI BẬT ĐIỀU HƯỚNG TÌM TÊN */}
            <div className={`p-3 sm:p-3.5 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-white rounded-2xl shadow-md space-y-1.5 transition-all duration-300 ${
              isHighlighted ? 'ring-4 ring-amber-300 scale-[1.01] shadow-xl' : ''
            }`}>
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[10.5px] font-sans font-extrabold uppercase tracking-wider backdrop-blur-xs border border-white/30 shadow-2xs animate-pulse">
                  🎯 BƯỚC 1: CHỌN TÊN TRONG DANH BẠ LỚP
                </span>
                <span className="text-[11px] font-sans text-amber-100 font-bold hidden sm:inline">
                  (Sĩ số 65 bạn học K8A1)
                </span>
              </div>
              <div className="space-y-0.5">
                <span className="font-bold text-white text-xs sm:text-sm block">
                  👉 Bạn hãy bấm vào thanh bên dưới để tìm hoặc chọn tên mình:
                </span>
                <p className="text-[11px] text-amber-100/90 leading-snug m-0 font-sans">
                  Gõ vài chữ cái (họ tên hoặc biệt danh) để tự động điền vé kỷ niệm, size áo và bảo toàn danh bạ lớp (tránh gõ tay tự do để không bị trùng lặp).
                </p>
              </div>
            </div>

            <div className="relative">
              {/* NÚT KÍCH HOẠT DROPDOWN CỰC KỲ NỔI BẬT VÀ THU HÚT */}
              <button
                type="button"
                id="roster-dropdown-trigger"
                onClick={() => {
                  setIsDropdownOpen(!isDropdownOpen);
                  if (!isDropdownOpen) {
                    setSearchQuery('');
                    setTimeout(() => {
                      document.getElementById('roster-search-input')?.focus();
                    }, 100);
                  }
                }}
                className={`w-full rounded-2xl p-2.5 sm:p-3 text-left transition-all duration-300 cursor-pointer flex items-center justify-between border-2 ${
                  isDropdownOpen || isHighlighted
                    ? 'bg-gradient-to-r from-amber-50 via-white to-amber-50 border-amber-500 shadow-xl ring-4 ring-amber-400/70 scale-[1.01]'
                    : 'bg-gradient-to-r from-amber-50/70 via-white to-amber-50/70 hover:bg-amber-50 border-amber-400 hover:border-amber-600 shadow-md hover:shadow-lg ring-2 ring-amber-300/40 hover:ring-amber-400/60'
                }`}
              >
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold shadow-sm shrink-0 ${
                    activeMember 
                      ? 'bg-gradient-to-br from-emerald-500 to-emerald-700 text-white' 
                      : 'bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 text-white'
                  }`}>
                    {activeMember ? (
                      <UserCheck className="w-5 h-5 text-white" />
                    ) : (
                      <Search className={`w-5 h-5 ${isHighlighted ? 'animate-bounce' : ''}`} />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    {activeMember ? (
                      <div className="space-y-0.5">
                        <div className="text-xs sm:text-[13.5px] font-extrabold text-emerald-900 flex items-center gap-1.5 flex-wrap">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>{activeMember.fullName}</span>
                          {activeMember.nickname && (
                            <span className="text-[11px] font-semibold text-amber-800">
                              “{activeMember.nickname}”
                            </span>
                          )}
                          <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
                            Thành viên K8A1 #{activeMember.id}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 font-sans truncate">
                          Đã chọn đúng hồ sơ bạn học. Bấm vào đây nếu muốn đổi bạn khác ▾
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-0.5">
                        <div className="text-xs sm:text-sm font-extrabold text-slate-900 flex items-center gap-1.5 flex-wrap">
                          <span className="text-amber-900">🔍 BẤM VÀO ĐÂY ĐỂ CHỌN TÊN BẠN</span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] bg-gradient-to-r from-amber-500 to-orange-500 text-white font-sans font-bold shadow-2xs animate-pulse">
                            Danh Bạ 65 Bạn ▾
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 font-sans truncate">
                          Gõ họ tên hoặc biệt danh để tìm nhanh (Ví dụ: Thành Long, Tuấn Báo, Nam Còi...)
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className={`px-2.5 sm:px-3 py-1.5 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 ml-2 shadow-xs transition-colors ${
                  activeMember
                    ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800'
                    : 'bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800'
                }`}>
                  <span className="hidden sm:inline">{activeMember ? 'Đổi bạn khác' : 'Mở danh bạ'}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </div>
              </button>

              {/* MENU DROPDOWN TÌM KIẾM THÔNG MINH */}
              {isDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-amber-400 rounded-2xl shadow-2xl z-50 overflow-hidden animate-fadeIn text-left ring-4 ring-amber-500/20">
                  {/* Ô TÌM KIẾM DÍNH Ở ĐẦU */}
                  <div className="p-3 border-b border-amber-200 bg-gradient-to-r from-amber-50 via-orange-50/50 to-amber-100/70 space-y-2">
                    <div className="relative">
                      <Search className="w-4 h-4 text-amber-700 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        id="roster-search-input"
                        autoFocus
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Gõ tên hoặc biệt danh để lọc nhanh... (VD: Vân Anh, Tuấn, Còi, Long...)"
                        className="w-full bg-white border-2 border-amber-400 rounded-xl py-2 pl-9 pr-8 text-xs sm:text-[13px] font-sans text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-400/50 shadow-inner"
                      />
                        {searchQuery && (
                          <button
                            type="button"
                            onClick={() => setSearchQuery('')}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-500 font-sans px-1">
                        <span>✨ Sắp xếp theo tên gọi A → Z</span>
                        <span>
                          {filteredRoster.length === rosterList.length
                            ? `Tất cả ${rosterList.length} thành viên`
                            : `Tìm thấy ${filteredRoster.length} / ${rosterList.length} bạn`}
                        </span>
                      </div>
                    </div>

                    {/* DANH SÁCH THÀNH VIÊN CUỘN MƯỢT, RÕ RÀNG */}
                    <div className="max-h-72 sm:max-h-84 overflow-y-auto divide-y divide-slate-100">
                      {filteredRoster.length > 0 ? (
                        filteredRoster.map((m) => {
                          const existingRsvp = (rsvpList || []).find((r) => 
                            (r.memberId && r.memberId === m.id) || 
                            normalizeName(r.fullName) === normalizeName(m.fullName)
                          );
                          const givenName = getVietnameseGivenName(m.fullName);
                          const isDuplicate = (nameCounts[normalizeName(m.fullName)] || 0) > 1;

                          return (
                            <button
                              key={m.id}
                              type="button"
                              onClick={() => {
                                handleSelectMember(m.id);
                                setIsDropdownOpen(false);
                                setSearchQuery('');
                              }}
                              className="w-full text-left px-3 py-2.5 hover:bg-amber-50/80 transition-colors flex items-center justify-between gap-2 cursor-pointer group"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 text-white font-serif font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                                  {givenName.charAt(0).toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                  <div className="flex flex-wrap items-center gap-1.5">
                                    <span className="font-serif font-bold text-slate-900 text-xs sm:text-[13px]">
                                      {m.fullName}
                                    </span>
                                    {m.nickname && (
                                      <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-900 font-sans font-medium border border-amber-200/80 shrink-0">
                                        “{m.nickname}”
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 text-[10px] text-slate-500 font-sans mt-0.5">
                                    <span>{m.role && m.role !== 'Thành viên' ? m.role : 'Lớp K8A1'}</span>
                                    {isDuplicate && m.phone && (
                                      <span>• SĐT: ...{String(m.phone).replace(/[^0-9]/g, '').slice(-4)}</span>
                                    )}
                                    {isDuplicate && m.province && <span>• {m.province}</span>}
                                  </div>
                                </div>
                              </div>

                              {/* Huy hiệu trạng thái điểm danh */}
                              <div className="shrink-0">
                                {existingRsvp ? (
                                  existingRsvp.status === 'yes' ? (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-sans font-medium text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-full">
                                      <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                                      <span>Đã xác nhận</span>
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-sans font-medium text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">
                                      <span>Báo vắng</span>
                                    </span>
                                  )
                                ) : (
                                  <span className="text-[10px] font-sans text-amber-700/80 bg-amber-50/70 border border-amber-200/60 px-1.5 py-0.5 rounded">
                                    Chưa điểm danh
                                  </span>
                                )}
                              </div>
                            </button>
                          );
                        })
                      ) : (
                        <div className="p-4 text-center text-xs text-slate-500 font-sans space-y-1.5">
                          <p className="font-semibold text-slate-700">Không tìm thấy bạn nào khớp với từ khóa "{searchQuery}"</p>
                          <p className="text-[11px] text-slate-500">
                            Gợi ý: Thử gõ tên gọi cuối cùng (ví dụ: Long, Tuấn, Hương, Linh...) hoặc biệt danh cấp 3.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* LƯU Ý BẢO VỆ DANH BẠ Ở ĐÁY DROPDOWN */}
                    <div className="p-2.5 border-t border-amber-200/80 bg-amber-50/70 text-center text-[11px] text-amber-900 font-medium flex items-center justify-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                      <span>Khu vực điểm danh chính thức dành riêng cho 65 thành viên Lớp K8A1</span>
                    </div>
                  </div>
                )}
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
            memberId={effectiveMemberId}
            isConfirmed={isPassConfirmed}
            onOpenPassModal={currentPassAttendee ? () => onOpenPassModal && onOpenPassModal(currentPassAttendee) : undefined}
          />

          {/* DÒNG HƯỚNG DẪN KHI CHƯA XÁC NHẬN */}
          {!isPassConfirmed && (
            <p className="text-[11px] text-slate-500 font-serif italic text-center px-2">
              {status === 'yes'
                ? '✨ Điền thông tin bên dưới, bạn sẽ nhận được tấm vé kỷ niệm này với con dấu sáp đỏ chính thức của Lớp K8A1.'
                : '✨ Dù ở xa không thể về dự trực tiếp, tấm vé kỷ niệm này vẫn sẽ lưu giữ tấm lòng hướng về ngày hội ngộ 20 năm của bạn.'}
            </p>
          )}

          {/* HỘP HÀNH ĐỘNG KHI ĐÃ XÁC NHẬN (CẢ KHI VỪA GỬI XONG HOẶC ĐÃ CÓ TRONG DANH SÁCH) */}
          {isPassConfirmed && currentPassAttendee && (
            <div className="p-3 bg-white border border-amber-200/90 rounded-xl shadow-xs space-y-2.5 animate-fadeIn">
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
                  className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg cursor-pointer transition text-xs shadow-2xs"
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
                    className="w-full inline-flex items-center justify-center gap-2 px-3.5 py-2.5 bg-[#8D5B28] hover:bg-[#784A1E] text-white font-bold rounded-lg cursor-pointer transition text-xs shadow-xs hover:shadow-md active:scale-[0.99]"
                    title="Chuyển đến khối thông tin số tài khoản và quét mã đóng quỹ"
                  >
                    <Coins className="w-4 h-4 text-amber-200" />
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
              className={`py-2.5 sm:py-3 px-3 rounded-xl border font-sans font-bold text-xs sm:text-sm transition-all cursor-pointer flex items-center justify-center gap-2 ${
                status === 'yes'
                  ? 'bg-[#8D5B28] hover:bg-[#784A1E] text-white border-[#784A1E] shadow-2xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-amber-300 hover:bg-stone-50/60'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Có Tham Gia</span>
            </button>

            <button
              type="button"
              onClick={() => setStatus('no')}
              className={`py-2.5 sm:py-3 px-3 rounded-xl border font-sans font-bold text-xs sm:text-sm transition-all cursor-pointer flex items-center justify-center gap-2 ${
                status === 'no'
                  ? 'bg-slate-800 text-white border-slate-900 shadow-2xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
              }`}
            >
              <HeartHandshake className="w-4 h-4" />
              <span>Rất Tiếc Vắng Mặt</span>
            </button>
          </div>

          {/* 2. FORM NHẬP THÔNG TIN CHI TIẾT */}
          <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-amber-200/80 p-3.5 sm:p-4 space-y-3.5 shadow-2xs">
            
            {/* THÔNG TIN CƠ BẢN: HỌ TÊN & BIỆT DANH (2 CỘT RỘNG RÃI, THOÁNG ĐẸP) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
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
                  onChange={(e) => {
                    const newName = e.target.value;
                    setFullName(newName);
                    if (activeMember && normalizeName(activeMember.fullName) !== normalizeName(newName)) {
                      if (onSelectActiveMember) onSelectActiveMember(null);
                      setIsCustomMode(true);
                      setSavedExistingPhone('');
                      setUseSavedPhone(false);
                    }
                  }}
                  className="w-full px-3 py-2 bg-slate-50/80 focus:bg-white border border-slate-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-400/40 rounded-lg text-xs sm:text-[13px] text-slate-800 font-sans outline-none transition"
                />
              </div>

              {/* Biệt danh */}
              <div className="space-y-1">
                <label htmlFor="rsvp-nickname" className="text-[11px] font-bold text-slate-700 font-sans flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-700" />
                  <span>Biệt danh cấp 3</span>
                  <span className="text-slate-400 font-normal text-[10px]">(nếu có)</span>
                </label>
                <input
                  type="text"
                  id="rsvp-nickname"
                  placeholder="Tuấn Báo, Nam Còi..."
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50/80 focus:bg-white border border-slate-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-400/40 rounded-lg text-xs sm:text-[13px] text-slate-800 font-sans outline-none transition"
                />
              </div>

              {/* DANH SÁCH GỢI Ý THÔNG MINH KHI TỰ GÕ TÊN (HIỂN THỊ TOÀN BỘ CÁC BẠN PHÙ HỢP ĐỂ BẤM CHỌN CHÍNH XÁC) */}
              {!activeMember && matchingRosterMembers.length > 0 && (
                <div className="sm:col-span-2 p-3 bg-gradient-to-br from-amber-50/90 via-orange-50/70 to-amber-100/90 border-2 border-amber-300 rounded-xl space-y-2.5 shadow-sm animate-fadeIn">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border-b border-amber-200/80 pb-2">
                    <div className="flex items-center gap-1.5 text-amber-950 font-sans font-bold text-xs">
                      <Sparkles className="w-4 h-4 text-amber-600 animate-pulse shrink-0" />
                      <span>
                        Có {matchingRosterMembers.length} bạn trong danh bạ K8A1 khớp với "{fullName.trim()}":
                      </span>
                    </div>
                    <span className="text-[11px] text-amber-800 font-sans font-medium italic">
                      👉 Bấm vào bạn của mình để tự động chọn đúng hồ sơ:
                    </span>
                  </div>

                  {/* DANH SÁCH GỢI Ý DẠNG TỪNG DÒNG (FULL WIDTH, KHÔNG BỊ CO CẮT CHỮ) */}
                  <div className="max-h-72 sm:max-h-80 overflow-y-auto pr-1 space-y-1.5">
                    {matchingRosterMembers.map((m) => {
                      const givenName = getVietnameseGivenName(m.fullName);
                      const existingRsvp = (rsvpList || []).find((item) => {
                        if (!item) return false;
                        if (item.memberId && m.id) return item.memberId === m.id;
                        if (isPhoneMatch(m.phone, item.phone)) return true;
                        return isVietnameseNameMatch(m, item.fullName);
                      });
                      const isConfirmed = existingRsvp && existingRsvp.status === 'yes';

                      return (
                        <div
                          key={m.id}
                          onClick={() => handleSelectMember(m.id)}
                          className="p-2.5 sm:p-3 bg-white hover:bg-amber-50/90 border border-amber-200/90 hover:border-amber-400 rounded-xl flex items-center justify-between gap-3 transition-all shadow-2xs cursor-pointer group active:scale-[0.99]"
                        >
                          {/* CỘT TRÁI: AVATAR + HỌ TÊN + BIỆT DANH + CHỨC VỤ + TRẠNG THÁI */}
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 text-white font-serif font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                              {givenName.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-serif font-bold text-slate-900 text-xs sm:text-[13.5px]">
                                  {m.fullName}
                                </span>
                                {m.nickname && (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-900 font-sans font-bold border border-amber-200/80 shrink-0">
                                    “{m.nickname}”
                                  </span>
                                )}
                                {m.role && m.role !== 'Thành viên' && (
                                  <span className="text-[9.5px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-sans font-medium border border-slate-200 shrink-0">
                                    {m.role}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-[10.5px] text-slate-500 font-sans mt-0.5 flex-wrap">
                                <span>{m.province ? m.province : 'Lớp K8A1'}</span>
                                {isConfirmed ? (
                                  <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-600 inline" />
                                    <span>Đã xác nhận tham gia</span>
                                  </span>
                                ) : (
                                  <span className="text-slate-400">
                                    • Chưa điểm danh
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* CỘT PHẢI: NÚT CHỌN RÕ RÀNG */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectMember(m.id);
                            }}
                            className="inline-flex items-center justify-center gap-1 px-3 py-1.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 active:scale-95 text-white font-bold rounded-lg text-xs font-sans shrink-0 cursor-pointer shadow-xs transition group-hover:shadow-md"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Chọn bạn này ✓</span>
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-between pt-0.5 text-[10.5px] text-slate-500 font-sans">
                    <span>💡 Nếu bạn là khách mời / người thân đi cùng không có tên trong danh bạ: Tiếp tục nhập thông tin bình thường.</span>
                  </div>
                </div>
              )}
            </div>

            {/* SỐ ĐIỆN THOẠI LIÊN HỆ (BẢO VỆ THÔNG TIN CÁ NHÂN PII) */}
            <div className="space-y-1.5 pt-0.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-slate-700 font-sans flex items-center gap-1.5">
                  <Phone className="w-3 h-3 text-amber-700" />
                  <span>Số điện thoại liên hệ</span>
                  <span className="text-rose-500">*</span>
                </label>
                <span className="text-[10px] text-emerald-700 font-sans font-medium flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  <span>Bảo mật thông tin PII</span>
                </span>
              </div>

              {savedExistingPhone && useSavedPhone ? (
                /* Card hiển thị SĐT đã lưu: Che bảo mật PII, thiết kế tinh tế, không co ép trên mobile */
                <div className="p-3 bg-stone-50 border border-slate-200 hover:border-amber-300 rounded-xl transition-all shadow-2xs space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xs text-slate-600 font-sans shrink-0">SĐT đã lưu:</span>
                      <span className="font-mono font-bold text-sm text-slate-900 tracking-wider">
                        {maskPhone(savedExistingPhone)}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setUseSavedPhone(false);
                        setPhone('');
                      }}
                      className="px-2.5 py-1 text-xs font-semibold text-amber-900 hover:text-amber-950 bg-white hover:bg-amber-100/60 border border-amber-300 rounded-lg shadow-2xs transition-all cursor-pointer shrink-0 flex items-center gap-1"
                    >
                      <Edit className="w-3 h-3 text-amber-700" />
                      <span>Đổi số khác</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5 text-[10.5px] text-slate-500 font-sans border-t border-slate-200/60 pt-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                    <span>Hệ thống dùng số này để gửi vé & liên hệ. Bấm <strong>"Đổi số khác"</strong> nếu bạn đã đổi SĐT mới.</span>
                  </div>
                </div>
              ) : (
                /* Ô nhập số điện thoại mới trực quan, thoáng đãng */
                <div className="space-y-1.5">
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="tel"
                      id="rsvp-phone"
                      placeholder={savedExistingPhone ? "Nhập số điện thoại mới (VD: 0912 345 678)" : "Nhập số điện thoại liên hệ (VD: 0912 345 678)"}
                      required={!savedExistingPhone}
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value);
                        setUseSavedPhone(false);
                      }}
                      className="w-full pl-9 pr-3 py-2 sm:py-2.5 bg-slate-50/80 focus:bg-white border border-slate-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-400/40 rounded-xl text-xs sm:text-[13px] text-slate-800 font-mono outline-none transition shadow-2xs"
                    />
                  </div>

                  {savedExistingPhone && (
                    <div className="flex items-center justify-between text-[11px] px-1 text-slate-500 font-sans">
                      <span className="text-amber-800">✍️ Đang nhập số mới</span>
                      <button
                        type="button"
                        onClick={() => {
                          setUseSavedPhone(true);
                          setPhone('');
                        }}
                        className="text-amber-800 hover:text-amber-950 underline font-semibold cursor-pointer"
                      >
                        Dùng lại số đã lưu ({maskPhone(savedExistingPhone)})
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* BỘ CHỌN SIZE ÁO TRỰC QUAN (CHỈ KHI CHỌN CÓ THAM GIA) */}
            {status === 'yes' && (
              <div id="rsvp-shirt-size-section" className="space-y-2 pt-1 scroll-mt-28">
                {/* TIÊU ĐỀ KHỐI SIZE ÁO TINH GỌN, SANG TRỌNG */}
                <div className="flex items-center justify-between gap-2 flex-wrap pb-0.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <label className="text-[11px] font-bold text-slate-700 font-sans flex items-center gap-1.5">
                      <Shirt className="w-3.5 h-3.5 text-amber-700" />
                      <span>Size áo polo kỷ niệm:</span>
                    </label>
                    {shirtSize === 'CHƯA CHỌN' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-950 font-sans font-bold text-xs border border-amber-300 shadow-2xs">
                        <span>⏳ Đã chọn: Báo size sau</span>
                        <span className="text-emerald-700 font-bold ml-0.5">✓</span>
                      </span>
                    ) : normalizeShirtSize(shirtSize) ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-900 font-mono font-bold text-xs border border-emerald-300 shadow-2xs">
                        <span className="font-sans font-bold text-[11px] text-emerald-700">Đã chọn:</span>
                        <span>Size {normalizeShirtSize(shirtSize)}</span>
                        <span className="font-sans font-medium text-[10.5px] text-emerald-700">
                          ({SHIRT_SIZE_OPTIONS.find((o) => o.value === normalizeShirtSize(shirtSize))?.weightHint || ''})
                        </span>
                        <span className="text-emerald-600 font-bold ml-0.5">✓</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-950 font-sans font-bold text-xs border border-amber-300 shadow-2xs">
                        <span>⚠️ Chưa chọn size</span>
                        <span className="font-medium text-[10.5px] text-amber-800">(Chọn cỡ hoặc báo size sau)</span>
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowSizeGuide(!showSizeGuide)}
                    className="text-[11px] text-amber-800 hover:text-amber-950 font-semibold underline cursor-pointer ml-auto flex items-center gap-1"
                  >
                    <span>📐 {showSizeGuide ? 'Đóng số đo' : 'Xem số đo áo'}</span>
                  </button>
                </div>

                {/* THÔNG BÁO HƯỚNG DẪN NẾU CHƯA CHỌN SIZE */}
                {!normalizeShirtSize(shirtSize) && shirtSize !== 'CHƯA CHỌN' && (
                  <div className="p-2.5 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border border-amber-300/80 rounded-xl flex items-center gap-2.5 text-xs text-amber-950 shadow-2xs animate-fadeIn">
                    <span className="text-lg shrink-0">👉</span>
                    <p className="leading-tight">
                      <strong>Bạn chưa chọn size áo đồng phục!</strong> Vui lòng bấm vào 1 trong 6 ô kích cỡ bên dưới (từ <strong>S</strong> đến <strong>3XL</strong>) hoặc bấm <strong>"Báo size sau"</strong>.
                    </p>
                  </div>
                )}

                {/* BẢNG 6 NÚT SIZE ÁO TRỰC QUAN CỰC KỲ DỄ BẤM */}
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {SHIRT_SIZE_OPTIONS.map((opt) => {
                    const isSelected = normalizeShirtSize(shirtSize) === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setShirtSize(opt.value)}
                        className={`py-2 px-1 sm:py-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center relative ${
                          isSelected
                            ? 'bg-[#8D5B28] text-white border-[#784A1E] shadow-sm font-bold scale-[1.02]'
                            : 'bg-white hover:bg-amber-50/60 text-slate-700 border-slate-200 hover:border-amber-300 shadow-2xs'
                        }`}
                      >
                        {isSelected && (
                          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 text-white rounded-full flex items-center justify-center text-[9px] font-bold shadow-xs">
                            ✓
                          </span>
                        )}
                        <span className="text-xs sm:text-sm font-bold font-mono block">
                          {opt.value}
                        </span>
                        <span className={`text-[9.5px] block mt-0.5 leading-tight font-sans ${isSelected ? 'text-amber-100 font-medium' : 'text-slate-500'}`}>
                          {opt.weightHint}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* TÙY CHỌN BÁO SIZE SAU & BỎ CHỌN */}
                <div className="flex items-center justify-between gap-2 flex-wrap pt-1">
                  <button
                    type="button"
                    onClick={() => setShirtSize(shirtSize === 'CHƯA CHỌN' ? '' : 'CHƯA CHỌN')}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-sans transition-all cursor-pointer ${
                      shirtSize === 'CHƯA CHỌN'
                        ? 'bg-amber-100 text-amber-950 border-amber-400 font-bold shadow-2xs'
                        : 'bg-white text-slate-600 border-dashed border-slate-300 hover:bg-amber-50 hover:text-amber-900'
                    }`}
                  >
                    <span>⏳ Tôi chưa rõ số đo / Báo size áo sau</span>
                    {shirtSize === 'CHƯA CHỌN' && (
                      <span className="text-emerald-700 font-bold ml-0.5">✓</span>
                    )}
                  </button>

                  {normalizeShirtSize(shirtSize) && (
                    <button
                      type="button"
                      onClick={() => setShirtSize('CHƯA CHỌN')}
                      className="text-[11px] text-slate-500 hover:text-rose-600 underline cursor-pointer ml-auto"
                    >
                      Bỏ chọn size này
                    </button>
                  )}
                </div>

                {/* BẢNG SIZE MỞ RỘNG (NẾU MỞ) */}
                {showSizeGuide && (
                  <div className="bg-[#FAF8F5] border border-amber-200 rounded-xl p-3 sm:p-4 text-xs text-slate-700 space-y-2.5 animate-fadeIn">
                    <div className="flex items-center justify-between pb-1 border-b border-amber-200/60">
                      <span className="font-bold text-amber-950 font-serif text-[11px] sm:text-xs">
                        Bảng Thông Số Kích Cỡ Áo Polo Đồng Phục K8A1 (Người Lớn)
                      </span>
                      <span className="text-[10px] text-slate-500 italic">Đơn vị: cm / kg</span>
                    </div>

                    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
                      <table className="w-full text-center text-xs">
                        <thead className="bg-amber-100/70 text-amber-950 font-bold border-b border-slate-200 text-[10px] sm:text-[11px]">
                          <tr>
                            <th className="py-2 px-2">Size Áo</th>
                            <th className="py-2 px-2">Ngang Vai</th>
                            <th className="py-2 px-2">Rộng</th>
                            <th className="py-2 px-2">Dài</th>
                            <th className="py-2 px-2">T.Ứng Số Kg</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-sans text-[11px]">
                          {SHIRT_SIZE_OPTIONS.map((opt) => {
                            const isRowSelected = normalizeShirtSize(shirtSize) === opt.value;
                            return (
                              <tr
                                key={opt.value}
                                onClick={() => setShirtSize(opt.value)}
                                className={`cursor-pointer transition-colors ${
                                  isRowSelected ? 'bg-amber-100/60 font-bold text-amber-950' : 'hover:bg-amber-50/40 text-slate-700'
                                }`}
                                title="Bấm để chọn size này"
                              >
                                <td className="py-2 px-2 font-mono font-black text-amber-800 text-xs sm:text-sm">{opt.value}</td>
                                <td className="py-2 px-2">{opt.shoulder}</td>
                                <td className="py-2 px-2">{opt.width}</td>
                                <td className="py-2 px-2">{opt.length}</td>
                                <td className="py-2 px-2 font-bold text-amber-900">{opt.weightHint}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    <p className="text-[10px] text-slate-500 font-serif italic text-center">
                      * Bấm trực tiếp vào dòng để chọn size. Áo polo dáng chuẩn — Nếu phân vân giữa 2 cỡ hoặc thích mặc rộng rãi, bạn nên chọn tăng 1 size để mặc thoải mái nhất nhé!
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
                  <span>
                    {status === 'yes'
                      ? 'Trang Lưu Bút K8A1 (Lời nhắn gửi bạn bè & thầy cô):'
                      : 'Lời Nhắn Gửi Đến Lớp K8A1 & Thầy Cô:'}
                  </span>
                </label>
                <span className="text-[10px] text-slate-400 font-sans">Tùy chọn</span>
              </div>

              {/* DẢI PHÍM CẢM XÚC 1-CHẠM */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
                <span className="text-[10px] text-slate-400 font-serif italic shrink-0">
                  Gợi ý nhanh:
                </span>
                {(status === 'yes' ? QUICK_EMOTION_TAGS : QUICK_ABSENT_TAGS).map((tag) => (
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
                  placeholder={
                    status === 'yes'
                      ? 'Gửi lời chào, kỷ niệm xưa, thông tin đi chung xe...'
                      : 'Gửi lời chúc đến tập thể lớp hoặc lý do nếu bạn vắng mặt (ở xa, bận công tác...)...'
                  }
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#FCFAF7] focus:bg-white border border-amber-300/80 focus:border-amber-500 focus:ring-1 focus:ring-amber-400/40 rounded-xl text-xs sm:text-[13px] text-slate-800 resize-none font-serif leading-relaxed outline-none transition shadow-2xs"
                />
              </div>
            </div>

            {/* THÔNG BÁO LỖI */}
            {submitError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-xs text-rose-800 rounded-xl space-y-2">
                <div className="flex items-start gap-2">
                  <span className="text-rose-600 font-bold shrink-0 mt-0.5">⚠️</span>
                  <span className="font-medium leading-relaxed">{submitError}</span>
                </div>
                {submitError.includes('danh bạ') && (
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setIsDropdownOpen(true);
                        const el = document.getElementById('roster-dropdown-trigger');
                        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs cursor-pointer shadow-xs transition-colors"
                    >
                      <Search className="w-3.5 h-3.5" />
                      <span>Bấm vào đây để chọn đúng tên trong Danh Bạ 65 Bạn</span>
                    </button>
                  </div>
                )}
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

            {/* NÚT GỬI ĐIỂM DANH HOẶC MỞ KHÓA NẾU BỊ KHÓA */}
            {isLocked ? (
              <button
                type="button"
                onClick={() => {
                  setUnlockError(null);
                  setUnlockPhoneDigits('');
                  setShowPhoneUnlockModal(true);
                }}
                className="w-full text-amber-950 bg-gradient-to-r from-amber-100 via-amber-200 to-amber-100 hover:from-amber-200 hover:to-amber-300 border-2 border-amber-400 font-sans font-bold text-xs sm:text-sm py-3 px-4 rounded-xl shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-[0.99]"
              >
                <Lock className="w-4 h-4 text-amber-800" />
                <span>Mở Khóa Bằng 4 Số Cuối SĐT Để Cập Nhật</span>
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full text-white font-sans font-bold text-xs sm:text-sm uppercase tracking-wider py-3 px-4 rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60 hover:shadow-md active:scale-[0.99] ${
                  status === 'yes'
                    ? 'bg-[#8D5B28] hover:bg-[#784A1E]'
                    : 'bg-slate-800 hover:bg-slate-900'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>{status === 'yes' ? 'Đang ghi nhận điểm danh...' : 'Đang lưu phản hồi báo vắng...'}</span>
                  </>
                ) : status === 'yes' ? (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-200" />
                    <span>{matchedExistingAttendee ? 'Cập Nhật Điểm Danh' : 'Xác Nhận Tham Dự Ngay'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    <HeartHandshake className="w-4 h-4 text-amber-300" />
                    <span>{matchedExistingAttendee ? 'Cập Nhật: Báo Bận Vắng Mặt' : 'Gửi Lời Nhắn & Báo Vắng Mặt'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            )}
          </form>
        </div>
      </div>

      {/* MODAL KÊU GỌI TÂM TÌNH NGHĨ LẠI KHI BÁO VẮNG MẶT */}
      {showReconsiderModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#FFFDF9] border border-amber-300/80 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden animate-scaleUp relative">
            {/* Header hoài niệm trường xưa */}
            <div className="bg-gradient-to-r from-[#8B1E2F] via-[#A82B3E] to-[#731826] p-5 text-white text-center relative">
              <button
                type="button"
                onClick={() => setShowReconsiderModal(false)}
                className="absolute top-3 right-3 text-white/70 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
                title="Đóng"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-13 h-13 mx-auto mb-2 rounded-full bg-amber-400/20 border border-amber-300/40 flex items-center justify-center shadow-inner">
                <HeartHandshake className="w-7 h-7 text-amber-200" />
              </div>

              <h3 className="font-serif font-bold text-base sm:text-lg text-amber-100 leading-snug">
                Bạn ơi, 20 năm hội ngộ chỉ có một lần! 🎓
              </h3>
              <p className="text-[11px] font-sans text-amber-200/90 mt-1">
                K8A1 (2003 — 2006) • Mái trường THPT Thái Nguyên xưa
              </p>
            </div>

            {/* Nội dung tâm tình ấm áp */}
            <div className="p-5 space-y-3.5 text-slate-700 font-serif text-xs sm:text-[13px] leading-relaxed">
              <p>
                Gửi bạn <strong className="text-amber-900 font-sans font-bold">{fullName.trim() || 'bạn tôi'}</strong>{nickname.trim() ? ` ("${nickname.trim()}")` : ''},
              </p>
              
              <p className="italic text-slate-600">
                &ldquo;Hai mươi năm trôi qua nhanh như một cái chớp mắt. Chúng ta ai cũng có những bộn bề, lo toan của công việc và gia đình... Nhưng ngày hội ngộ 20 năm là dịp hiếm hoi nhất để cả tập thể K8A1 được ngồi lại đông đủ cùng nhau, tìm lại những ký ức thanh xuân trong sáng nhất của cuộc đời.&rdquo;
              </p>

              <div className="p-3 bg-amber-50/90 border border-amber-200/90 rounded-xl space-y-1.5 font-sans">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-950">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Lớp mình sẽ thiếu đi một nụ cười nếu vắng bạn!</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Nhiều bạn ở rất xa cũng đang cố gắng sắp xếp để về. Bạn có thể thu xếp lại một chút để về sum vầy cùng thầy cô và bạn bè lớp mình không?
                </p>
              </div>

              {/* Nút hành động */}
              <div className="space-y-2 pt-2 font-sans">
                {/* NÚT CHÍNH: NGHĨ LẠI -> ĐI CÙNG LỚP */}
                <button
                  type="button"
                  onClick={() => {
                    setStatus('yes');
                    setShowReconsiderModal(false);
                    triggerCelebration();
                  }}
                  className="w-full bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold py-3 px-4 rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 text-xs sm:text-sm active:scale-[0.99]"
                >
                  <Sparkles className="w-4 h-4 text-amber-200" />
                  <span>Để mình sắp xếp lại để đi cùng lớp! 🎉</span>
                </button>

                {/* NÚT PHỤ: VẪN XÁC NHẬN VẮNG MẶT NẾU BẤT KHẢ KHÁNG */}
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={async () => {
                    setShowReconsiderModal(false);
                    await executeSubmitRsvp('no');
                  }}
                  className="w-full py-2.5 px-3 text-slate-500 hover:text-slate-800 text-[11px] font-medium hover:underline transition-colors text-center cursor-pointer block"
                >
                  {isSubmitting
                    ? 'Đang lưu báo bận...'
                    : 'Mình thực sự kẹt lịch không về được, xin phép gửi lời chúc từ phương xa'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL MỞ KHÓA HỒ SƠ BẰNG 4 SỐ CUỐI SĐT */}
      {showPhoneUnlockModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#FFFDF9] border border-amber-300/80 rounded-2xl max-w-sm w-full shadow-2xl overflow-hidden animate-scaleUp relative">
            <div className="bg-gradient-to-r from-[#8D5B28] via-[#A8723C] to-[#784A1E] p-4 text-white text-center relative">
              <button
                type="button"
                onClick={() => setShowPhoneUnlockModal(false)}
                className="absolute top-3 right-3 text-white/70 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
                title="Đóng"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-white/20 border border-white/30 flex items-center justify-center shadow-inner">
                <KeyRound className="w-5 h-5 text-amber-200" />
              </div>

              <h3 className="font-serif font-bold text-sm sm:text-base text-amber-100">
                Xác Thực Chính Chủ
              </h3>
              <p className="text-[11px] font-sans text-amber-200/90 mt-0.5">
                {activeMember?.fullName || matchedExistingAttendee?.fullName || 'Thành viên K8A1'}
              </p>
            </div>

            <form onSubmit={handleVerifyPhoneUnlock} className="p-4 space-y-3.5 text-left font-sans">
              <div className="space-y-1">
                <p className="text-xs text-slate-600 leading-relaxed">
                  Để bảo vệ hồ sơ tránh bị người khác vô tình đổi size áo hoặc sửa thông tin, vui lòng nhập <strong>4 số cuối</strong> của số điện thoại đã lưu:
                </p>
                {savedExistingPhone && (
                  <p className="text-[11px] text-amber-900 bg-amber-50 border border-amber-200 rounded-lg p-2 font-mono text-center">
                    Gợi ý: {maskPhone(savedExistingPhone)}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 block">
                  Nhập 4 số cuối số điện thoại:
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={4}
                  autoFocus
                  placeholder="••••"
                  value={unlockPhoneDigits}
                  onChange={(e) => setUnlockPhoneDigits(e.target.value.replace(/[^0-9]/g, ''))}
                  className="w-full text-center tracking-[0.5em] font-mono font-bold text-xl py-2.5 bg-slate-50 border-2 border-amber-300 focus:border-amber-600 rounded-xl outline-none focus:ring-2 focus:ring-amber-400/40 transition"
                />
              </div>

              {unlockError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 text-[11px] text-rose-700 rounded-lg">
                  {unlockError}
                </div>
              )}

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowPhoneUnlockModal(false)}
                  className="flex-1 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer transition-colors text-center"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={unlockPhoneDigits.length !== 4}
                  className="flex-1 py-2 text-xs font-bold text-white bg-[#8D5B28] hover:bg-[#784A1E] disabled:opacity-50 rounded-xl cursor-pointer transition-colors text-center shadow-xs"
                >
                  Mở khóa
                </button>
              </div>

              <p className="text-[10px] text-slate-400 text-center italic">
                Nếu bạn đổi số hoặc quên số, vui lòng liên hệ Ban Liên Lạc để được hỗ trợ mở khóa nhanh.
              </p>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
