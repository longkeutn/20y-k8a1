import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  X, 
  Upload, 
  Receipt, 
  CheckCircle, 
  AlertTriangle, 
  RefreshCw, 
  FileCheck, 
  DollarSign, 
  UserCheck, 
  Image as ImageIcon,
  Sparkles,
  Info,
  ShieldCheck,
  Search,
  ChevronDown,
  CheckCircle2,
  Lock,
  Coins,
  Gift,
  Shirt,
  Users,
  HeartHandshake,
  Calendar,
  FileText
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { RsvpData, ClassMember, EventConfig, IncomeItem, IncomeCategory } from '../types';
import { 
  INCOME_CATEGORIES, 
  removeVietnameseAccents, 
  getVietnameseGivenName 
} from '../data';

interface ReceiptUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  appsScriptUrl?: string;
  rsvpList?: RsvpData[];
  classRoster?: ClassMember[];
  eventConfig?: EventConfig;
  defaultAttendee?: RsvpData | null;
  onUpdateRsvpList?: (list: RsvpData[]) => void;
  incomes?: IncomeItem[];
  onAddIncome?: (income: IncomeItem) => void;
}

export default function ReceiptUploadModal({
  isOpen,
  onClose,
  appsScriptUrl = '',
  rsvpList = [],
  classRoster = [],
  eventConfig,
  defaultAttendee,
  onUpdateRsvpList,
  incomes = [],
  onAddIncome
}: ReceiptUploadModalProps) {
  const standardAmount = Number(eventConfig?.fundAmountPerPerson) || 700000;

  // State chọn danh mục khoản thu
  const [selectedCategory, setSelectedCategory] = useState<IncomeCategory>('event');
  const [transferTitle, setTransferTitle] = useState<string>('Đóng quỹ họp lớp 20 năm');

  // State thành viên & chế độ tự nhập
  const [selectedMember, setSelectedMember] = useState<ClassMember | null>(null);
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);
  const [isMemberDropdownOpen, setIsMemberDropdownOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Thông tin người nộp
  const [customFullName, setCustomFullName] = useState<string>('');
  const [customPhone, setCustomPhone] = useState<string>('');
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');

  // Số tiền & ghi chú
  const [transferAmount, setTransferAmount] = useState<number>(standardAmount);
  const [customAmountInput, setCustomAmountInput] = useState<string>(standardAmount.toLocaleString('vi-VN'));
  const [selectedPresetIdx, setSelectedPresetIdx] = useState<number>(0);
  const [transferNote, setTransferNote] = useState<string>('');

  // Ảnh chứng từ & trạng thái submit
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Metadata danh mục hiện tại
  const currentCatMeta = useMemo(() => {
    return INCOME_CATEGORIES.find(c => c.id === selectedCategory) || INCOME_CATEGORIES[0];
  }, [selectedCategory]);

  // Bộ nút presets động theo từng danh mục
  const amountPresets = useMemo(() => {
    switch (selectedCategory) {
      case 'event':
        return [
          { label: `${standardAmount.toLocaleString('vi-VN')}đ`, sub: '(Chuẩn)', amount: standardAmount },
          { label: '1.000.000đ', sub: '(+Ủng hộ 300k)', amount: 1000000 },
          { label: '2.000.000đ', sub: '(+Ủng hộ 1.3M)', amount: 2000000 },
          { label: '5.000.000đ', sub: '(+Tài trợ)', amount: 5000000 },
        ];
      case 'extra_shirt':
        return [
          { label: '200.000đ', sub: '(1 áo)', amount: 200000 },
          { label: '400.000đ', sub: '(2 áo)', amount: 400000 },
          { label: '600.000đ', sub: '(3 áo)', amount: 600000 },
          { label: '800.000đ', sub: '(4 áo)', amount: 800000 },
        ];
      case 'guest':
        return [
          { label: '350.000đ', sub: '(F1 nhỏ)', amount: 350000 },
          { label: '700.000đ', sub: '(1 người lớn)', amount: 700000 },
          { label: '1.000.000đ', sub: '(Gia đình)', amount: 1000000 },
          { label: '1.400.000đ', sub: '(2 người lớn)', amount: 1400000 },
        ];
      case 'annual':
        return [
          { label: '100.000đ', sub: '(1 năm)', amount: 100000 },
          { label: '200.000đ', sub: '(2 năm)', amount: 200000 },
          { label: '300.000đ', sub: '(3 năm)', amount: 300000 },
          { label: '500.000đ', sub: '(5 năm)', amount: 500000 },
        ];
      case 'sponsor':
        return [
          { label: '1.000.000đ', sub: '', amount: 1000000 },
          { label: '2.000.000đ', sub: '', amount: 2000000 },
          { label: '5.000.000đ', sub: '', amount: 5000000 },
          { label: '10.000.000đ', sub: '', amount: 10000000 },
        ];
      case 'teacher_tribute':
      case 'alumni_care':
      case 'other_income':
      default:
        return [
          { label: '300.000đ', sub: '', amount: 300000 },
          { label: '500.000đ', sub: '', amount: 500000 },
          { label: '1.000.000đ', sub: '', amount: 1000000 },
          { label: '2.000.000đ', sub: '', amount: 2000000 },
        ];
    }
  }, [selectedCategory, standardAmount]);

  // Sinh tiêu đề mẫu dựa theo danh mục và tên thành viên
  const generateTitleFor = (cat: IncomeCategory, name: string) => {
    const cleanName = name.trim();
    const suffix = cleanName ? ` — ${cleanName}` : '';
    switch (cat) {
      case 'event':
        return `Đóng quỹ họp lớp 20 năm${suffix}`;
      case 'sponsor':
        return `Ủng hộ / Tài trợ sự kiện K8A1${suffix}`;
      case 'extra_shirt':
        return `Mua thêm áo đồng phục Polo${suffix}`;
      case 'guest':
        return `Kinh phí người thân / F1 đi kèm${suffix}`;
      case 'teacher_tribute':
        return `Quỹ tri ân Thầy Cô giáo${suffix}`;
      case 'alumni_care':
        return `Quỹ tình nghĩa & Thăm hỏi K8A1${suffix}`;
      case 'annual':
        return `Quỹ thường niên K8A1${suffix}`;
      case 'other_income':
      default:
        return `Khoản đóng góp khác${suffix}`;
    }
  };

  // Danh sách gợi ý thành viên từ classRoster, sắp xếp chuẩn A-Z theo tên gọi tiếng Việt
  const sortedRoster = useMemo(() => {
    return [...classRoster].sort((a, b) => {
      const nameA = getVietnameseGivenName(a.fullName);
      const nameB = getVietnameseGivenName(b.fullName);
      const cmp = nameA.localeCompare(nameB, 'vi');
      if (cmp !== 0) return cmp;
      return a.fullName.localeCompare(b.fullName, 'vi');
    });
  }, [classRoster]);

  // Lọc theo từ khóa tìm kiếm thông minh
  const filteredRoster = useMemo(() => {
    const q = removeVietnameseAccents(searchQuery.trim());
    if (!q) return sortedRoster;
    return sortedRoster.filter((m) => {
      const normName = removeVietnameseAccents(m.fullName);
      const normNick = m.nickname ? removeVietnameseAccents(m.nickname) : '';
      const normPhone = m.phone ? String(m.phone).replace(/[^0-9]/g, '') : '';
      return normName.includes(q) || normNick.includes(q) || normPhone.includes(q);
    });
  }, [sortedRoster, searchQuery]);

  // Click outside listener để tự động đóng dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsMemberDropdownOpen(false);
      }
    };
    if (isMemberDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMemberDropdownOpen]);

  // Khởi tạo và đồng bộ khi modal mở hoặc defaultAttendee thay đổi
  useEffect(() => {
    if (isOpen) {
      setUploadSuccess(null);
      setUploadError(null);
      setReceiptImage(null);
      setTransferNote('');
      setSelectedCategory('event');
      setSelectedPresetIdx(0);
      setTransferAmount(standardAmount);
      setCustomAmountInput(standardAmount.toLocaleString('vi-VN'));
      setIsMemberDropdownOpen(false);
      setSearchQuery('');

      if (defaultAttendee) {
        // Tìm bạn trong classRoster
        const found = classRoster.find(m => 
          (defaultAttendee.memberId && m.id === defaultAttendee.memberId) ||
          (defaultAttendee.phone && m.phone && defaultAttendee.phone.replace(/[^0-9]/g, '') === m.phone.replace(/[^0-9]/g, '')) ||
          m.fullName.trim().toLowerCase() === defaultAttendee.fullName.trim().toLowerCase()
        );

        if (found) {
          setSelectedMember(found);
          setIsCustomMode(false);
          setCustomFullName(found.fullName);
          setCustomPhone(found.phone || defaultAttendee.phone || '');
          setSelectedMemberId(found.id);
          setTransferTitle(generateTitleFor('event', found.fullName));
        } else {
          setSelectedMember(null);
          setIsCustomMode(true);
          setCustomFullName(defaultAttendee.fullName || '');
          setCustomPhone(defaultAttendee.phone || '');
          setSelectedMemberId(defaultAttendee.memberId || '');
          setTransferTitle(generateTitleFor('event', defaultAttendee.fullName || ''));
        }
      } else {
        setSelectedMember(null);
        setIsCustomMode(false);
        setCustomFullName('');
        setCustomPhone('');
        setSelectedMemberId('');
        setTransferTitle(generateTitleFor('event', ''));
      }
    }
  }, [isOpen, defaultAttendee, standardAmount, classRoster]);

  if (!isOpen) return null;

  // Handler khi chọn một bạn từ danh bạ lớp
  const handleSelectMember = (member: ClassMember) => {
    setSelectedMember(member);
    setIsCustomMode(false);
    setCustomFullName(member.fullName);
    setCustomPhone(member.phone || '');
    setSelectedMemberId(member.id);
    setIsMemberDropdownOpen(false);
    setSearchQuery('');
    setTransferTitle(generateTitleFor(selectedCategory, member.fullName));
  };

  // Handler khi chuyển sang chế độ tự nhập (người ngoài / tài trợ)
  const handleSwitchToCustomMode = () => {
    setSelectedMember(null);
    setIsCustomMode(true);
    setIsMemberDropdownOpen(false);
    setSearchQuery('');
    setCustomFullName('');
    setCustomPhone('');
    setSelectedMemberId('');
    setTransferTitle(generateTitleFor(selectedCategory, ''));
  };

  // Handler reset chọn bạn
  const handleResetMember = () => {
    setSelectedMember(null);
    setIsCustomMode(false);
    setCustomFullName('');
    setCustomPhone('');
    setSelectedMemberId('');
    setTransferTitle(generateTitleFor(selectedCategory, ''));
  };

  // Handler khi thay đổi danh mục khoản thu
  const handleCategoryChange = (cat: IncomeCategory) => {
    setSelectedCategory(cat);
    const presets = (() => {
      switch (cat) {
        case 'event': return standardAmount;
        case 'extra_shirt': return 200000;
        case 'guest': return 700000;
        case 'annual': return 100000;
        case 'sponsor': return 1000000;
        case 'teacher_tribute':
        case 'alumni_care':
        case 'other_income':
        default: return 500000;
      }
    })();
    setTransferAmount(presets);
    setCustomAmountInput(presets.toLocaleString('vi-VN'));
    setSelectedPresetIdx(0);
    setTransferTitle(generateTitleFor(cat, customFullName));
  };

  // Handler tải ảnh biên lai
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      setUploadError('Kích thước ảnh không được vượt quá 15MB!');
      return;
    }

    setUploadError(null);
    const reader = new FileReader();
    reader.onload = () => {
      setReceiptImage(reader.result as string);
    };
    reader.onerror = () => {
      setUploadError('Không thể đọc file ảnh, vui lòng thử lại.');
    };
    reader.readAsDataURL(file);
  };

  // Handler nộp biểu mẫu
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = customFullName.trim();
    const finalPhone = customPhone.trim();

    if (!finalName) {
      setUploadError('Vui lòng chọn tên trong danh bạ hoặc điền Họ Tên của bạn!');
      return;
    }

    if (!finalPhone) {
      setUploadError('Vui lòng điền Số Điện Thoại để Thủ quỹ liên hệ đối soát!');
      return;
    }

    if (transferAmount <= 0) {
      setUploadError('Vui lòng chọn hoặc nhập số tiền chuyển khoản hợp lệ (> 0 đ)!');
      return;
    }

    if (!receiptImage) {
      setUploadError('Vui lòng chọn ảnh chụp biên lai / Bill chuyển khoản!');
      return;
    }

    setIsSubmitting(true);
    setUploadError(null);
    setUploadSuccess(null);

    const now = new Date();
    const nowStr = now.toLocaleDateString('vi-VN') + ' ' + now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    const finalTitle = transferTitle.trim() || generateTitleFor(selectedCategory, finalName);
    let uploadedReceiptUrl = receiptImage;

    const auditNoteStr = transferNote.trim()
      ? `[${currentCatMeta.label}] ${transferNote.trim()} (Khai báo: ${transferAmount.toLocaleString('vi-VN')}đ)`
      : `[${currentCatMeta.label}] Thành viên gửi bill khai báo: ${transferAmount.toLocaleString('vi-VN')}đ (Chờ BLL đối soát)`;

    // 1. Upload lên Apps Script Google Drive thư mục "ChungTu_QuyLop_K8A1"
    if (appsScriptUrl && appsScriptUrl.trim()) {
      try {
        const payload = {
          action: 'upload_fund_receipt',
          receiptType: 'thu',
          fileData: receiptImage,
          fullName: finalName,
          phone: finalPhone,
          memberId: selectedMemberId || undefined,
          category: selectedCategory,
          categoryLabel: currentCatMeta.label,
          incomeTitle: finalTitle,
          fundAmount: transferAmount,
          fundStatus: 'pending',
          fundPaymentMethod: 'bank_transfer',
          fundPaidAt: nowStr,
          fundNote: auditNoteStr
        };

        const res = await fetch(appsScriptUrl, {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        const json = await res.json();
        if (json.status === 'success' && json.url) {
          uploadedReceiptUrl = json.url;
        }
      } catch (err) {
        console.warn('Lỗi kết nối Apps Script, lưu trữ cục bộ để đối soát:', err);
      }
    }

    // 2. Cập nhật rsvpList nếu là thành viên lớp hoặc khoản thu họp lớp 20 năm
    if (onUpdateRsvpList) {
      const existingIdx = rsvpList.findIndex((r) => {
        if (selectedMemberId && r.memberId && selectedMemberId === r.memberId) return true;
        if (defaultAttendee?.id && r.id && defaultAttendee.id === r.id) return true;
        const p1 = (finalPhone || '').replace(/[^0-9]/g, '');
        const p2 = (r.phone || '').replace(/[^0-9]/g, '');
        if (p1 && p2 && p1 === p2) return true;
        return r.fullName.trim().toLowerCase() === finalName.toLowerCase();
      });

      let updatedList: RsvpData[];
      if (existingIdx >= 0) {
        updatedList = rsvpList.map((r, i) => {
          if (i === existingIdx) {
            return {
              ...r,
              fundStatus: 'pending',
              fundAmount: transferAmount,
              fundReceiptUrl: uploadedReceiptUrl,
              fundPaidAt: nowStr,
              fundPaymentMethod: 'bank_transfer',
              fundNote: auditNoteStr,
              memberId: r.memberId || selectedMemberId || undefined
            };
          }
          return r;
        });
      } else {
        const newEntry: RsvpData = {
          id: `user-${Date.now()}`,
          memberId: selectedMemberId || undefined,
          fullName: finalName,
          phone: finalPhone,
          className: 'K8A1',
          status: 'yes',
          shirtSize: 'L',
          submittedAt: nowStr,
          fundStatus: 'pending',
          fundAmount: transferAmount,
          fundReceiptUrl: uploadedReceiptUrl,
          fundPaidAt: nowStr,
          fundPaymentMethod: 'bank_transfer',
          fundNote: auditNoteStr
        };
        updatedList = [newEntry, ...rsvpList];
      }

      onUpdateRsvpList(updatedList);
      localStorage.setItem('rsvp_list', JSON.stringify(updatedList));
    }

    // 3. Tự động ghi nhận vào Sổ Thu (incomes) để Thủ quỹ mở Admin Hub là thấy ngay
    const newIncomeRecord: IncomeItem = {
      id: `inc-${Date.now()}`,
      title: finalTitle,
      category: selectedCategory,
      amount: transferAmount,
      date: now.toISOString().slice(0, 10),
      payerName: finalName,
      payerPhone: finalPhone,
      memberId: selectedMemberId || undefined,
      paymentMethod: 'bank_transfer',
      auditor: 'Thành viên gửi bill (Chờ đối soát)',
      receiptUrl: uploadedReceiptUrl,
      eventScope: selectedCategory === 'annual' ? 'Thường niên 2026' : 'Kỷ niệm 20 năm',
      note: auditNoteStr,
      createdAt: now.toISOString()
    };

    if (onAddIncome) {
      onAddIncome(newIncomeRecord);
    } else {
      // Fallback lưu trực tiếp vào localStorage nếu prop chưa nối
      try {
        const localIncomesRaw = localStorage.getItem('k8a1_incomes_list');
        const localIncomes: IncomeItem[] = localIncomesRaw ? JSON.parse(localIncomesRaw) : [];
        const nextIncomes = [newIncomeRecord, ...localIncomes];
        localStorage.setItem('k8a1_incomes_list', JSON.stringify(nextIncomes));
      } catch (e) {
        console.warn('Lỗi ghi nhận sổ thu cục bộ:', e);
      }
    }

    confetti({ particleCount: 65, spread: 70, origin: { y: 0.6 } });
    setUploadSuccess(`Cảm ơn bạn ${finalName}! Biên lai [${currentCatMeta.label}] với số tiền khai báo ${transferAmount.toLocaleString('vi-VN')} đ đã được gửi thành công. Thủ quỹ Ban Liên Lạc sẽ đối chiếu ảnh bill với sao kê tài khoản để xác nhận chính thức vào Sổ Quỹ lớp.`);
    setIsSubmitting(false);

    setTimeout(() => {
      onClose();
    }, 2800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl border border-amber-300 shadow-2xl w-full max-w-lg overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Modal */}
        <div className="px-5 py-4 bg-gradient-to-r from-[#1A1613] via-[#26201A] to-[#14110F] text-white flex items-center justify-between border-b border-amber-500/30">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-serif font-bold text-amber-100">
                Gửi Ảnh Biên Lai / Bill Nộp Quỹ
              </h3>
              <p className="text-[10px] sm:text-[11px] text-slate-300 font-sans">
                Họp Lớp 20 Năm K8A1 • Quỹ Minh Bạch & Tiện Lợi
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
            title="Đóng cửa sổ"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 text-xs">
          
          {/* ======================================================== */}
          {/* BƯỚC 1: CHỌN BẠN TRONG LỚP (SEARCHABLE COMBOBOX CHUẨN K8A1) */}
          {/* ======================================================== */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-slate-800 font-sans font-bold">
                Chọn tên của bạn trong lớp: <span className="text-rose-500">*</span>
              </label>
              <span className="text-[10px] text-amber-800 font-sans">
                {classRoster.length > 0 ? `Danh bạ ${classRoster.length} bạn` : ''}
              </span>
            </div>

            {selectedMember ? (
              /* KHỐI NHẬN DIỆN THÀNH VIÊN ĐÃ CHỌN */
              <div className="bg-gradient-to-r from-amber-50 via-orange-50/40 to-amber-50/70 border border-amber-300 rounded-xl p-3 flex items-center justify-between gap-2.5 shadow-2xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 text-white font-serif font-bold text-sm flex items-center justify-center shrink-0 shadow-2xs">
                    {getVietnameseGivenName(selectedMember.fullName).charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="font-serif font-bold text-slate-900 text-sm truncate">
                        {selectedMember.fullName}
                      </span>
                      {selectedMember.nickname && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 font-sans font-bold border border-amber-200">
                          “{selectedMember.nickname}”
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-sans font-medium border border-emerald-200">
                        <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                        <span>Đã kết nối Danh bạ</span>
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 font-sans mt-0.5">
                      {selectedMember.role && selectedMember.role !== 'Thành viên' ? selectedMember.role : 'Học sinh Lớp K8A1'} 
                      {selectedMember.province ? ` • ${selectedMember.province}` : ''}
                      {customPhone ? ` • SĐT: ${customPhone}` : ''}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleResetMember}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] text-amber-800 hover:text-amber-950 bg-white hover:bg-amber-100/70 border border-amber-300 rounded-lg font-bold transition-colors cursor-pointer shrink-0 shadow-2xs"
                  title="Chọn lại bạn khác"
                >
                  <X className="w-3 h-3" />
                  <span>Đổi bạn</span>
                </button>
              </div>
            ) : (
              /* COMBOBOX TÌM KIẾM THÔNG MINH */
              <div className="space-y-2" ref={dropdownRef}>
                {/* Lời nhắc nhẹ nhàng điều hướng tránh gõ tay trùng lặp */}
                <div className="flex items-start gap-2 p-2 bg-amber-50/90 border border-amber-200/90 rounded-lg text-xs text-amber-950 font-sans shadow-2xs">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <span className="font-bold text-amber-900 block text-[11px]">
                      👉 Bạn hãy tìm hoặc chọn tên mình trong Danh Sách Lớp K8A1 bên dưới:
                    </span>
                    <p className="text-[10px] text-slate-600 leading-snug m-0">
                      Gõ vài chữ cái (họ tên hoặc biệt danh) để tự động điền và liên kết đúng tên của bạn (tránh gõ thủ công để không bị trùng lặp).
                    </p>
                  </div>
                </div>

                <div className="relative">
                  {/* Nút bấm kích hoạt dropdown */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsMemberDropdownOpen(!isMemberDropdownOpen);
                      if (!isMemberDropdownOpen) setSearchQuery('');
                    }}
                    className="w-full bg-[#FAF8F5] hover:bg-white border border-amber-300 hover:border-amber-500 rounded-xl py-2.5 pl-3 pr-9 text-left text-xs text-slate-800 font-sans cursor-pointer focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-400 shadow-2xs transition flex items-center justify-between font-medium"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Search className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                      <span className="truncate text-slate-600">
                        {isCustomMode && customFullName
                          ? `✏️ Tự nhập: ${customFullName}`
                          : '-- Bấm để tìm tên hoặc chọn trong Danh Bạ K8A1 --'}
                      </span>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 transition-transform ${isMemberDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Menu dropdown tìm kiếm */}
                  {isMemberDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-amber-300 rounded-xl shadow-2xl z-50 overflow-hidden animate-fadeIn text-left">
                      {/* Ô tìm kiếm ghim đầu */}
                      <div className="p-2 border-b border-amber-100 bg-amber-50/70 space-y-1">
                        <div className="relative">
                          <Search className="w-3.5 h-3.5 text-amber-700 absolute left-2.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            autoFocus
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Gõ tên hoặc biệt danh để lọc nhanh... (VD: Vân Anh, Tuấn, Còi...)"
                            className="w-full bg-white border border-amber-300 rounded-lg py-1.5 pl-8 pr-7 text-xs font-sans text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-400"
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
                          <span>Tìm thấy {filteredRoster.length} / {classRoster.length} bạn</span>
                        </div>
                      </div>

                      {/* Danh sách thành viên cuộn mượt */}
                      <div className="max-h-56 sm:max-h-64 overflow-y-auto divide-y divide-slate-100">
                        {filteredRoster.length > 0 ? (
                          filteredRoster.map((m) => {
                            const rsvp = rsvpList.find(r => 
                              (r.memberId && r.memberId === m.id) || 
                              r.fullName.trim().toLowerCase() === m.fullName.trim().toLowerCase()
                            );
                            const givenName = getVietnameseGivenName(m.fullName);
                            const isPaid = rsvp?.fundStatus === 'paid';
                            const isPending = rsvp?.fundStatus === 'pending';

                            return (
                              <button
                                key={m.id}
                                type="button"
                                onClick={() => handleSelectMember(m)}
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
                                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 font-sans font-medium border border-amber-200/80 shrink-0">
                                          “{m.nickname}”
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] text-slate-500 font-sans mt-0.5">
                                      <span>{m.role && m.role !== 'Thành viên' ? m.role : 'Lớp K8A1'}</span>
                                      {m.province && <span>• {m.province}</span>}
                                    </div>
                                  </div>
                                </div>

                                {/* Trạng thái quỹ */}
                                <div className="shrink-0">
                                  {isPaid ? (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-sans font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full">
                                      <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                                      <span>Đã nộp quỹ</span>
                                    </span>
                                  ) : isPending ? (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-sans font-medium text-amber-800 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full">
                                      <span>⏳ Đang chờ duyệt</span>
                                    </span>
                                  ) : rsvp?.status === 'yes' ? (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-sans font-medium text-blue-800 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                                      <span>Đã xác nhận đi</span>
                                    </span>
                                  ) : (
                                    <span className="text-[10px] text-slate-400 font-sans">
                                      Chưa phản hồi
                                    </span>
                                  )}
                                </div>
                              </button>
                            );
                          })
                        ) : (
                          <div className="py-6 text-center text-slate-400 font-sans text-xs">
                            Không tìm thấy bạn nào khớp với từ khóa "{searchQuery}"
                          </div>
                        )}
                      </div>

                      {/* Tùy chọn tự nhập danh tính (Người ngoài / Mạnh thường quân) */}
                      <div className="p-2 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
                        <button
                          type="button"
                          onClick={handleSwitchToCustomMode}
                          className="w-full text-left px-2.5 py-1.5 hover:bg-white text-amber-900 hover:text-amber-950 font-bold rounded-lg border border-dashed border-amber-300 text-xs transition cursor-pointer flex items-center gap-1.5"
                        >
                          <span>✏️ Tôi là người ngoài / Nhà tài trợ / Tự nhập thông tin</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Chi tiết Họ tên & Số điện thoại */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="space-y-1">
                <label className="block text-slate-800 font-sans font-bold text-xs flex items-center justify-between">
                  <span>Họ và tên: <span className="text-rose-500">*</span></span>
                  {selectedMember && (
                    <span className="text-[10px] text-emerald-700 font-sans flex items-center gap-1">
                      <Lock className="w-2.5 h-2.5" /> Khóa theo danh bạ
                    </span>
                  )}
                </label>
                <input
                  type="text"
                  value={customFullName}
                  onChange={(e) => {
                    setCustomFullName(e.target.value);
                    setTransferTitle(generateTitleFor(selectedCategory, e.target.value));
                  }}
                  readOnly={Boolean(selectedMember)}
                  placeholder="VD: Nguyễn Văn A"
                  required
                  className={`w-full px-3 py-2 border rounded-xl text-xs font-sans focus:outline-none ${
                    selectedMember 
                      ? 'bg-slate-100 border-slate-200 text-slate-700 cursor-not-allowed font-medium' 
                      : 'bg-white border-slate-300 focus:border-amber-500'
                  }`}
                />
              </div>

              <div className="space-y-1">
                <label className="block text-slate-800 font-sans font-bold text-xs">
                  Số điện thoại: <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  value={customPhone}
                  onChange={(e) => setCustomPhone(e.target.value)}
                  placeholder="VD: 0912 345 678"
                  required
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-mono text-xs focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* BƯỚC 2: MỤC ĐÍCH NỘP & DANH MỤC KHOẢN THU (ĐỒNG BỘ 8 DANH MỤC) */}
          {/* ======================================================== */}
          <div className="space-y-2 p-3 bg-gradient-to-br from-amber-50/50 to-orange-50/30 border border-amber-200/90 rounded-xl">
            <div className="flex items-center justify-between">
              <label className="block text-slate-900 font-sans font-bold text-xs flex items-center gap-1.5">
                <Coins className="w-3.5 h-3.5 text-amber-700" />
                <span>Mục đích nộp / Danh mục khoản thu: <span className="text-rose-500">*</span></span>
              </label>
              <span className={`text-[10px] font-bold px-2 py-0.2 rounded-full border ${currentCatMeta.badgeBg} ${currentCatMeta.badgeText} ${currentCatMeta.badgeBorder}`}>
                {currentCatMeta.label}
              </span>
            </div>

            {/* Selector 8 danh mục thu dạng dropdown có icon */}
            <select
              value={selectedCategory}
              onChange={(e) => handleCategoryChange(e.target.value as IncomeCategory)}
              className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl text-xs font-sans font-bold text-slate-800 focus:outline-none focus:border-amber-500 cursor-pointer shadow-2xs"
            >
              {INCOME_CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.label} {cat.defaultAmount ? `(Định mức: ${cat.defaultAmount.toLocaleString('vi-VN')}đ)` : ''}
                </option>
              ))}
            </select>

            {/* Mô tả danh mục */}
            <p className="text-[11px] text-slate-600 font-sans italic bg-white/70 p-2 rounded-lg border border-amber-100 leading-relaxed">
              💡 {currentCatMeta.description}
            </p>

            {/* Tiêu đề / Nội dung khoản thu */}
            <div className="space-y-1 pt-1">
              <label className="block text-slate-700 font-sans font-medium text-[11px]">
                Nội dung / Tiêu đề hiển thị trên sổ quỹ:
              </label>
              <input
                type="text"
                value={transferTitle}
                onChange={(e) => setTransferTitle(e.target.value)}
                placeholder="VD: Đóng quỹ họp lớp 20 năm, Mua thêm 2 áo polo..."
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-sans focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* ======================================================== */}
          {/* BƯỚC 3: SỐ TIỀN ĐÃ CHUYỂN (PRESETS ĐỘNG THEO DANH MỤC) */}
          {/* ======================================================== */}
          <div className="space-y-2 p-3 bg-[#FAF8F5] border border-amber-200/80 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-slate-900 font-sans font-bold text-xs">
                  Số tiền đã chuyển (Tự khai báo): <span className="text-rose-500">*</span>
                </label>
                <span className="text-[10px] text-slate-500 font-sans block">
                  Bấm chọn mốc gợi ý hoặc tự gõ số tiền tùy ý
                </span>
              </div>
              <div className="text-right">
                <span className="font-mono font-bold text-emerald-700 text-sm sm:text-base">
                  {transferAmount > 0 ? `${transferAmount.toLocaleString('vi-VN')} đ` : '0 đ'}
                </span>
                {selectedCategory === 'event' && transferAmount > standardAmount && (
                  <span className="block text-[9px] font-sans font-bold text-amber-800 uppercase">
                    + Ủng hộ {(transferAmount - standardAmount).toLocaleString('vi-VN')}đ
                  </span>
                )}
              </div>
            </div>

            {/* 4 Nút mốc tiền gợi ý động */}
            <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
              {amountPresets.map((preset, idx) => {
                const isSelected = selectedPresetIdx === idx && transferAmount === preset.amount;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setTransferAmount(preset.amount);
                      setCustomAmountInput(preset.amount.toLocaleString('vi-VN'));
                      setSelectedPresetIdx(idx);
                    }}
                    className={`py-2 px-1 rounded-lg font-sans text-xs text-center transition cursor-pointer font-bold ${
                      isSelected
                        ? 'bg-emerald-600 text-white shadow-2xs ring-2 ring-emerald-400/50'
                        : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                    }`}
                  >
                    <span className="block truncate">{preset.label}</span>
                    {preset.sub && (
                      <span className="block text-[9px] font-normal opacity-90 truncate">{preset.sub}</span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Ô nhập số tiền tùy chọn */}
            <div className="relative pt-0.5">
              <div className="absolute inset-y-0 left-0 pl-3 pt-0.5 flex items-center pointer-events-none text-slate-400 font-bold font-mono text-xs">
                ₫
              </div>
              <input
                type="text"
                inputMode="numeric"
                value={customAmountInput}
                onChange={(e) => {
                  const raw = e.target.value.replace(/\D/g, '');
                  const num = raw ? parseInt(raw, 10) : 0;
                  setTransferAmount(num);
                  setCustomAmountInput(raw ? num.toLocaleString('vi-VN') : '');
                  const matchIdx = amountPresets.findIndex(p => p.amount === num);
                  setSelectedPresetIdx(matchIdx >= 0 ? matchIdx : -1);
                }}
                placeholder="Nhập số tiền đã chuyển tùy ý..."
                className="w-full pl-8 pr-14 py-2 bg-white border border-slate-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl text-xs font-mono font-bold text-slate-900 shadow-2xs placeholder:font-sans placeholder:font-normal placeholder:text-slate-400"
              />
              <div className="absolute inset-y-0 right-0 pr-3 pt-0.5 flex items-center pointer-events-none text-[11px] font-sans font-bold text-slate-400">
                VNĐ
              </div>
            </div>

            {/* Hộp giải thích quy trình đối soát minh bạch */}
            <div className="p-2.5 bg-amber-100/70 border border-amber-300/80 rounded-xl text-amber-950 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <p className="text-[11px] leading-relaxed text-slate-700 font-sans">
                <strong className="text-amber-900 font-semibold">Cơ chế đối soát Quỹ lớp:</strong> Con số bạn nhập là <em>số tiền tự khai báo</em> để BLL dễ tìm giao dịch. <strong>Thủ quỹ Ban Liên Lạc sẽ đối chiếu trực tiếp với ảnh biên lai và sao kê tài khoản ngân hàng</strong> — số tiền được BLL đối soát mới là số chuẩn chính thức ghi nhận vào quỹ.
              </p>
            </div>
          </div>

          {/* ======================================================== */}
          {/* BƯỚC 4: ẢNH CHỤP BIÊN LAI / BILL CHUYỂN KHOẢN */}
          {/* ======================================================== */}
          <div className="space-y-1.5">
            <label className="block text-slate-800 font-sans font-bold">
              Ảnh chụp màn hình biên lai / Bill chuyển khoản: <span className="text-rose-500">*</span>
            </label>

            {!receiptImage ? (
              <label className="flex flex-col items-center justify-center p-4 sm:p-5 border-2 border-dashed border-amber-300 hover:border-amber-500 bg-[#FAF8F5] hover:bg-amber-50/50 rounded-xl transition cursor-pointer group">
                <div className="w-10 h-10 rounded-full bg-amber-100 group-hover:bg-amber-200 flex items-center justify-center text-amber-700 mb-1.5 transition">
                  <Upload className="w-5 h-5" />
                </div>
                <span className="text-xs font-sans font-bold text-slate-800">
                  Bấm vào đây để chọn ảnh từ thư viện
                </span>
                <span className="text-[10px] text-slate-400 font-sans">
                  Hỗ trợ JPG, PNG, WebP (Ảnh màn hình app ngân hàng)
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="flex items-center justify-between p-2.5 bg-[#FAF8F5] border border-amber-200 rounded-xl">
                <div className="flex items-center gap-2.5">
                  <img
                    src={receiptImage}
                    alt="Biên lai"
                    className="w-12 h-12 object-cover rounded-lg border border-slate-200 shadow-2xs"
                  />
                  <div>
                    <span className="text-xs font-bold text-emerald-800 flex items-center gap-1">
                      <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Đã chọn ảnh biên lai</span>
                    </span>
                    <span className="text-[10px] text-slate-500 font-sans block">
                      Sẵn sàng gửi Ban Liên Lạc
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setReceiptImage(null)}
                  className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-[11px] font-bold transition cursor-pointer"
                >
                  Chọn lại
                </button>
              </div>
            )}
          </div>

          {/* Ghi chú */}
          <div className="space-y-1">
            <label className="block text-slate-800 font-sans font-bold">
              Ghi chú thêm (Tùy chọn):
            </label>
            <input
              type="text"
              value={transferNote}
              onChange={(e) => setTransferNote(e.target.value)}
              placeholder="VD: Mình chuyển từ app Techcombank lúc 10:15, chuyển thêm 1 áo size M..."
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-sans focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Thông báo lỗi / thành công */}
          {uploadError && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}

          {uploadSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 font-medium space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-emerald-800 text-xs">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Gửi ảnh biên lai thành công!</span>
              </div>
              <p className="text-[11px] text-emerald-800 font-sans leading-relaxed">
                {uploadSuccess}
              </p>
            </div>
          )}

          {/* Nút hành động */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold font-sans transition cursor-pointer text-xs"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white rounded-xl font-bold font-sans shadow-md transition cursor-pointer text-xs uppercase tracking-wider disabled:opacity-75"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Đang gửi...</span>
                </>
              ) : (
                <>
                  <Upload className="w-3.5 h-3.5" />
                  <span>Gửi Ảnh Xác Nhận</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
