import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  GraduationCap,
  Sparkles,
  Search,
  X,
  CheckCircle,
  Clock,
  Shirt,
  Coins,
  ChevronDown,
  Award,
  UserCheck,
  RotateCcw
} from 'lucide-react';
import { ClassMember, RsvpData } from '../types';

interface VisitorIdentityWidgetProps {
  currentVisitor: ClassMember | null;
  onSelectVisitor: (member: ClassMember | null) => void;
  classRoster: ClassMember[];
  rsvpList: RsvpData[];
  onOpenPassModal?: (attendee: RsvpData) => void;
  onOpenReceiptModal?: (attendee: RsvpData) => void;
  standardFundAmount?: number;
}

// Helper bỏ dấu tiếng Việt chuẩn xác để tìm kiếm
function removeAccents(str: string): string {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim();
}

// =============================================================================
// 1. MODAL CHỌN DANH TÍNH TỪ 65 HỌC SINH K8A1
// =============================================================================
interface IdentitySelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  classRoster: ClassMember[];
  rsvpList: RsvpData[];
  currentVisitor: ClassMember | null;
  onSelect: (member: ClassMember) => void;
}

export function IdentitySelectorModal({
  isOpen,
  onClose,
  classRoster,
  rsvpList,
  currentVisitor,
  onSelect
}: IdentitySelectorModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [genderFilter, setGenderFilter] = useState<'all' | 'female' | 'male' | 'rsvp' | 'not_rsvp'>('all');
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    } else {
      setSearchTerm('');
      setGenderFilter('all');
    }
  }, [isOpen]);

  // Tạo map tra cứu nhanh RSVP theo memberId hoặc họ tên
  const rsvpMap = useMemo(() => {
    const map = new Map<string, RsvpData>();
    rsvpList.forEach((r) => {
      if (r.memberId) map.set(r.memberId, r);
      const nameKey = removeAccents(r.fullName);
      if (nameKey && !map.has(nameKey)) map.set(nameKey, r);
    });
    return map;
  }, [rsvpList]);

  // Lọc danh sách theo từ khóa & tab
  const filteredMembers = useMemo(() => {
    const cleanQuery = removeAccents(searchTerm);
    return classRoster.filter((member) => {
      const matchQuery =
        !cleanQuery ||
        removeAccents(member.fullName).includes(cleanQuery) ||
        removeAccents(member.nickname || '').includes(cleanQuery) ||
        (member.id && member.id.toLowerCase().includes(cleanQuery)) ||
        (member.phone && member.phone.includes(cleanQuery));

      if (!matchQuery) return false;

      const rsvp = rsvpMap.get(member.id) || rsvpMap.get(removeAccents(member.fullName));
      if (genderFilter === 'female') return member.gender === 'female';
      if (genderFilter === 'male') return member.gender === 'male';
      if (genderFilter === 'rsvp') return Boolean(rsvp && rsvp.status === 'yes');
      if (genderFilter === 'not_rsvp') return !rsvp || rsvp.status !== 'yes';

      return true;
    });
  }, [classRoster, searchTerm, genderFilter, rsvpMap]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div className="bg-[#FFFDF9] border-2 border-amber-400/80 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden animate-scaleUp flex flex-col max-h-[90vh]">
        {/* Header Modal */}
        <div className="bg-gradient-to-r from-[#8B1E2F] via-[#A82B3E] to-[#731826] p-4 text-white relative shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3.5 right-3.5 text-white/70 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition cursor-pointer"
            title="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-amber-300 shrink-0">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base sm:text-lg text-amber-100">
                Bạn Là Ai Trong K8A1?
              </h3>
              <p className="text-[11px] text-rose-100 font-sans opacity-90">
                Chọn tên bạn trong 65 bạn học để cá nhân hóa toàn bộ trang web
              </p>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-3 bg-amber-50/70 border-b border-amber-200/80 space-y-2 shrink-0">
          <div className="relative">
            <Search className="w-4 h-4 text-amber-700 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Gõ tên bạn, biệt danh hoặc mã (VD: Phương, m16)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-white border border-amber-300 focus:border-amber-600 focus:ring-1 focus:ring-amber-500 rounded-xl text-xs sm:text-sm font-sans outline-none shadow-2xs"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-[11px] font-sans pt-0.5">
            <button
              type="button"
              onClick={() => setGenderFilter('all')}
              className={`px-2.5 py-1 rounded-full font-medium transition cursor-pointer shrink-0 ${
                genderFilter === 'all'
                  ? 'bg-amber-700 text-white shadow-2xs font-bold'
                  : 'bg-white hover:bg-amber-100 text-slate-700 border border-amber-200'
              }`}
            >
              Tất cả ({classRoster.length})
            </button>
            <button
              type="button"
              onClick={() => setGenderFilter('rsvp')}
              className={`px-2.5 py-1 rounded-full font-medium transition cursor-pointer shrink-0 ${
                genderFilter === 'rsvp'
                  ? 'bg-emerald-600 text-white shadow-2xs font-bold'
                  : 'bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-200'
              }`}
            >
              ✓ Đã điểm danh
            </button>
            <button
              type="button"
              onClick={() => setGenderFilter('not_rsvp')}
              className={`px-2.5 py-1 rounded-full font-medium transition cursor-pointer shrink-0 ${
                genderFilter === 'not_rsvp'
                  ? 'bg-rose-600 text-white shadow-2xs font-bold'
                  : 'bg-white hover:bg-rose-50 text-rose-800 border border-rose-200'
              }`}
            >
              ⏳ Chưa điểm danh
            </button>
            <button
              type="button"
              onClick={() => setGenderFilter('female')}
              className={`px-2.5 py-1 rounded-full font-medium transition cursor-pointer shrink-0 ${
                genderFilter === 'female'
                  ? 'bg-pink-600 text-white shadow-2xs font-bold'
                  : 'bg-white hover:bg-pink-50 text-pink-800 border border-pink-200'
              }`}
            >
              Nữ (35)
            </button>
            <button
              type="button"
              onClick={() => setGenderFilter('male')}
              className={`px-2.5 py-1 rounded-full font-medium transition cursor-pointer shrink-0 ${
                genderFilter === 'male'
                  ? 'bg-blue-600 text-white shadow-2xs font-bold'
                  : 'bg-white hover:bg-blue-50 text-blue-800 border border-blue-200'
              }`}
            >
              Nam (30)
            </button>
          </div>
        </div>

        {/* Member List */}
        <div className="overflow-y-auto divide-y divide-amber-100/80 p-2 flex-1 max-h-[380px]">
          {filteredMembers.length === 0 ? (
            <div className="text-center py-10 text-slate-400 space-y-1">
              <p className="text-sm">Không tìm thấy bạn học nào khớp với từ khóa "{searchTerm}"</p>
              <p className="text-xs text-slate-500">Hãy thử gõ tên không dấu hoặc xem danh sách đầy đủ nhé!</p>
            </div>
          ) : (
            filteredMembers.map((member) => {
              const rsvp = rsvpMap.get(member.id) || rsvpMap.get(removeAccents(member.fullName));
              const isSelected = currentVisitor?.id === member.id;
              const isFemale = member.gender === 'female';

              return (
                <button
                  key={member.id}
                  type="button"
                  onClick={() => {
                    onSelect(member);
                    onClose();
                  }}
                  className={`w-full p-2.5 rounded-xl flex items-center justify-between gap-2.5 transition text-left cursor-pointer group ${
                    isSelected
                      ? 'bg-amber-100/90 border border-amber-400 shadow-2xs font-bold'
                      : 'hover:bg-amber-50/80 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs ${
                        isFemale
                          ? 'bg-rose-100 text-rose-800 border border-rose-200'
                          : 'bg-sky-100 text-sky-800 border border-sky-200'
                      }`}
                    >
                      {member.fullName.slice(0, 1).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-serif font-bold text-slate-900 text-xs sm:text-sm truncate">
                          {member.fullName}
                        </span>
                        {member.id && (
                          <span className="text-[9.5px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 border border-amber-300/80">
                            {member.id}
                          </span>
                        )}
                        {member.role && member.role !== 'Thành viên' && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-200/90 text-amber-950 font-bold border border-amber-400/80">
                            {member.role}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 font-sans pt-0.5">
                        {member.nickname ? (
                          <span className="italic text-amber-800 font-medium">“{member.nickname}”</span>
                        ) : (
                          <span>Cựu học sinh K8A1</span>
                        )}
                        {member.shirtSize && (
                          <span className="text-slate-400 font-mono text-[10px]">
                            • Size {member.shirtSize}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Badges bên phải */}
                  <div className="shrink-0 text-right space-y-0.5">
                    {rsvp ? (
                      rsvp.status === 'yes' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          <CheckCircle className="w-3 h-3 text-emerald-600" />
                          <span>Đã báo danh</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                          <span>🕊️ Báo vắng</span>
                        </span>
                      )
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100/70 text-amber-900 border border-amber-200">
                        <span>⏳ Chưa báo danh</span>
                      </span>
                    )}

                    {isSelected && (
                      <span className="block text-[10px] text-amber-900 font-bold">
                        ★ Bạn đang chọn
                      </span>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-white border-t border-amber-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span>Tìm thấy <strong>{filteredMembers.length}</strong> / 65 bạn học</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// 2. KHỐI HERO IDENTITY WIDGET (ƯU TIÊN 1 - ĐẦU TRANG HERO BANNER)
// =============================================================================
export function HeroIdentityWidget({
  currentVisitor,
  onSelectVisitor,
  classRoster,
  rsvpList,
  onOpenPassModal,
  onOpenReceiptModal,
  standardFundAmount = 1000000
}: VisitorIdentityWidgetProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Tìm RSVP tương ứng của visitor nếu có
  const matchedRsvp = useMemo(() => {
    if (!currentVisitor) return null;
    return (
      rsvpList.find((r) => {
        if (r.memberId && currentVisitor.id && r.memberId === currentVisitor.id) return true;
        return removeAccents(r.fullName) === removeAccents(currentVisitor.fullName);
      }) || null
    );
  }, [currentVisitor, rsvpList]);

  // Hành động bấm vào để chuyển mượt tới điểm danh
  const handleGoToRsvp = () => {
    if (currentVisitor) {
      window.dispatchEvent(
        new CustomEvent('select-visitor-identity', {
          detail: { memberId: currentVisitor.id, fullName: currentVisitor.fullName }
        })
      );
    }
    const rsvpEl = document.getElementById('diem-danh');
    if (rsvpEl) {
      const navOffset = 70;
      const elementPosition = rsvpEl.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo({
        top: Math.max(0, elementPosition - navOffset),
        behavior: 'smooth'
      });
    }
  };

  // Hành động chuyển tới phần chọn size áo
  const handleGoToShirt = () => {
    if (currentVisitor) {
      window.dispatchEvent(
        new CustomEvent('update-member-shirt-size', {
          detail: { memberId: currentVisitor.id, fullName: currentVisitor.fullName }
        })
      );
    }
  };

  return (
    <>
      <div className="w-full max-w-2xl rounded-2xl bg-gradient-to-r from-amber-500/15 via-[#1E293B]/90 to-amber-900/20 backdrop-blur-md border-2 border-amber-400/50 p-4 sm:p-5 shadow-2xl text-white space-y-3 relative overflow-hidden transition-all duration-300">
        {/* Hạt bụi sáng trang trí góc card */}
        <div className="absolute -top-12 -right-12 w-28 h-28 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />

        {/* TRƯỜNG HỢP 1: CHƯA NHẬN DIỆN DANH TÍNH */}
        {!currentVisitor ? (
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-amber-200">
                <div className="w-7 h-7 rounded-lg bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shrink-0">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <h3 className="font-serif font-bold text-sm sm:text-base text-white">
                  Bạn là ai trong 65 thành viên Lớp K8A1?
                </h3>
              </div>
              <span className="text-[11px] text-amber-300/80 font-sans italic self-start sm:self-auto">
                ✨ Nhận diện 1-chạm không cần mật khẩu
              </span>
            </div>

            <p className="text-xs text-slate-200 font-sans leading-relaxed m-0">
              Chọn tên bạn để hệ thống <strong>cá nhân hóa trang web</strong>, chuẩn bị <strong>Tấm vé học sinh kỷ niệm</strong> và đồng bộ thông tin đóng quỹ.
            </p>

            {/* Nút to bấm để mở bảng chọn */}
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-white rounded-xl font-sans font-bold text-xs sm:text-sm flex items-center justify-between gap-2 shadow-lg transition-all transform hover:scale-[1.01] active:scale-[0.99] cursor-pointer border border-amber-300/60 group"
            >
              <div className="flex items-center gap-2 min-w-0">
                <Search className="w-4 h-4 text-amber-100 shrink-0 group-hover:scale-110 transition" />
                <span className="truncate">
                  Bấm để tìm hoặc chọn tên bạn trong danh bạ 65 bạn học...
                </span>
              </div>
              <ChevronDown className="w-4 h-4 text-amber-200 shrink-0 group-hover:translate-y-0.5 transition" />
            </button>
          </div>
        ) : (
          /* TRƯỜNG HỢP 2: ĐÃ CHỌN TÊN (CÁ NHÂN HÓA HỒ SƠ) */
          <div className="space-y-3.5 animate-fadeIn">
            {/* Hàng thông tin cá nhân */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 text-slate-950 font-serif font-black text-base sm:text-lg flex items-center justify-center shrink-0 shadow-md border-2 border-amber-200">
                  {currentVisitor.fullName.slice(0, 1).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] uppercase font-sans tracking-wider text-amber-300 font-bold">
                      👋 Chào bạn,
                    </span>
                    <h3 className="text-base sm:text-lg font-serif font-bold text-white truncate">
                      {currentVisitor.fullName}
                    </h3>
                    {currentVisitor.id && (
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-200 border border-amber-400/40">
                        {currentVisitor.id}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-300 font-sans pt-0.5">
                    {currentVisitor.nickname && (
                      <span className="italic text-amber-200 font-medium mr-2">“{currentVisitor.nickname}”</span>
                    )}
                    <span>{currentVisitor.role || 'Cựu học sinh K8A1'}</span>
                  </p>
                </div>
              </div>

              {/* Nút đổi người khác */}
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="text-[11px] font-sans text-amber-300 hover:text-white bg-white/10 hover:bg-white/20 border border-amber-400/40 px-2.5 py-1 rounded-lg transition cursor-pointer flex items-center gap-1 shrink-0"
                title="Đổi sang bạn học khác"
              >
                <RotateCcw className="w-3 h-3" />
                <span className="hidden sm:inline">Đổi bạn khác</span>
                <span className="sm:hidden">Đổi tên</span>
              </button>
            </div>

            {/* Dải trạng thái cá nhân */}
            <div className="flex flex-wrap items-center gap-2 pt-0.5 text-xs">
              {matchedRsvp ? (
                matchedRsvp.status === 'yes' ? (
                  <>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/25 text-emerald-200 border border-emerald-400/50 font-sans font-bold text-[11px]">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Đã xác nhận tham gia</span>
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-500/20 text-amber-200 border border-amber-400/40 text-[11px] font-mono font-bold">
                      <Shirt className="w-3 h-3 text-amber-300" />
                      <span>Size {matchedRsvp.shirtSize || 'L'}</span>
                    </span>
                    {matchedRsvp.fundStatus === 'paid' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-500/25 text-indigo-200 border border-indigo-400/50 font-sans font-bold text-[11px]">
                        <Coins className="w-3.5 h-3.5 text-indigo-300" />
                        <span>Đã đóng quỹ</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-500/25 text-rose-200 border border-rose-400/50 font-sans font-medium text-[11px]">
                        <Clock className="w-3.5 h-3.5 text-rose-300" />
                        <span>Chưa đóng quỹ</span>
                      </span>
                    )}
                  </>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-500/30 text-slate-200 border border-slate-400/50 font-sans font-medium text-[11px]">
                    <span>🕊️ Đã báo bận vắng mặt (Miễn đóng quỹ)</span>
                  </span>
                )
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/25 text-amber-200 border border-amber-400/50 font-sans font-bold text-[11px] animate-pulse">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Chưa gửi xác nhận điểm danh</span>
                </span>
              )}
            </div>

            {/* Các nút hành động nhanh dành riêng cho bạn này */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {matchedRsvp ? (
                <>
                  {/* Xem Thẻ Golden Pass */}
                  {onOpenPassModal && (
                    <button
                      type="button"
                      onClick={() => onOpenPassModal(matchedRsvp)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-sans font-bold shadow-md hover:scale-105 active:scale-95 transition cursor-pointer border border-amber-300/60"
                      title="Mở Thẻ Học Sinh Kỷ Niệm 20 Năm bản HD để lưu máy"
                    >
                      <Award className="w-3.5 h-3.5 text-amber-100" />
                      <span>Xem Thẻ Kỷ Niệm 🪪</span>
                    </button>
                  )}

                  {/* Đổi size áo hoặc sửa điểm danh */}
                  <button
                    type="button"
                    onClick={handleGoToShirt}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-sans font-semibold border border-white/20 transition cursor-pointer hover:scale-105 active:scale-95"
                    title="Đổi cỡ áo polo hoặc thông tin tham dự"
                  >
                    <Shirt className="w-3.5 h-3.5 text-amber-300" />
                    <span>Đổi Size Áo ({matchedRsvp.shirtSize || 'L'})</span>
                  </button>

                  {/* Nút đóng quỹ nếu chưa đóng */}
                  {matchedRsvp.status === 'yes' && matchedRsvp.fundStatus !== 'paid' && (
                    <a
                      href="#bank-transfer-card"
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600/80 hover:bg-emerald-600 text-white text-xs font-sans font-bold border border-emerald-400/60 shadow-md transition cursor-pointer hover:scale-105 active:scale-95"
                      title="Đến mục quét mã QR đóng quỹ họp lớp"
                    >
                      <Coins className="w-3.5 h-3.5 text-emerald-200" />
                      <span>Đóng Quỹ ➔</span>
                    </a>
                  )}
                </>
              ) : (
                /* Nếu chưa điểm danh: Nút báo danh 1-chạm */
                <button
                  type="button"
                  onClick={handleGoToRsvp}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-white text-xs sm:text-sm font-sans font-bold shadow-lg hover:scale-105 active:scale-95 transition cursor-pointer border border-amber-300/60 animate-pulse"
                >
                  <UserCheck className="w-4 h-4 text-amber-100" />
                  <span>Báo Danh Ngay Cho {currentVisitor.fullName.split(' ').slice(-1)[0]} ➔</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* MODAL TRA CỨU & CHỌN TÊN */}
      <IdentitySelectorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        classRoster={classRoster}
        rsvpList={rsvpList}
        currentVisitor={currentVisitor}
        onSelect={onSelectVisitor}
      />
    </>
  );
}

// =============================================================================
// 3. HUY HIỆU DANH TÍNH TRÊN THANH NAVBAR (ƯU TIÊN 2 - STICKY HEADER CỐ ĐỊNH)
// =============================================================================
interface NavbarIdentityBadgeProps {
  currentVisitor: ClassMember | null;
  onSelectVisitor: (member: ClassMember | null) => void;
  classRoster: ClassMember[];
  rsvpList: RsvpData[];
  onOpenPassModal?: (attendee: RsvpData) => void;
}

export function NavbarIdentityBadge({
  currentVisitor,
  onSelectVisitor,
  classRoster,
  rsvpList,
  onOpenPassModal
}: NavbarIdentityBadgeProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const matchedRsvp = useMemo(() => {
    if (!currentVisitor) return null;
    return (
      rsvpList.find((r) => {
        if (r.memberId && currentVisitor.id && r.memberId === currentVisitor.id) return true;
        return removeAccents(r.fullName) === removeAccents(currentVisitor.fullName);
      }) || null
    );
  }, [currentVisitor, rsvpList]);

  return (
    <>
      <div ref={dropdownRef} className="relative">
        {!currentVisitor ? (
          /* Nút khi CHƯA CHỌN TÊN */
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-full bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/40 text-amber-200 hover:text-white text-xs font-sans font-bold transition cursor-pointer shadow-xs"
            title="Bấm để chọn tên bạn trong danh bạ 65 bạn học K8A1"
          >
            <GraduationCap className="w-3.5 h-3.5 text-amber-300" />
            <span className="hidden sm:inline">Bạn là ai?</span>
            <span className="sm:hidden">Tôi là ai?</span>
            <ChevronDown className="w-3 h-3 opacity-70" />
          </button>
        ) : (
          /* Huy hiệu khi ĐÃ CHỌN TÊN */
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-600/30 via-amber-500/20 to-amber-700/30 hover:from-amber-600/40 hover:to-amber-700/40 border border-amber-400/60 text-amber-100 text-xs font-sans font-bold transition cursor-pointer shadow-xs"
            title={`Đang nhận diện: ${currentVisitor.fullName} (Bấm để xem menu cá nhân)`}
          >
            <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-black text-[10px] flex items-center justify-center shrink-0">
              {currentVisitor.fullName.slice(0, 1).toUpperCase()}
            </span>
            <span className="max-w-[75px] sm:max-w-[120px] truncate font-serif">
              {currentVisitor.fullName}
            </span>
            <ChevronDown className="w-3 h-3 opacity-70 shrink-0" />
          </button>
        )}

        {/* Dropdown Menu khi click vào tên */}
        {isDropdownOpen && currentVisitor && (
          <div className="absolute right-0 top-full mt-2 w-64 bg-[#FFFDF9] border-2 border-amber-400/80 rounded-2xl shadow-2xl p-3 space-y-2.5 text-slate-800 z-50 animate-scaleUp">
            {/* Header Dropdown */}
            <div className="pb-2 border-b border-amber-200/80">
              <div className="flex items-center justify-between gap-1">
                <span className="font-serif font-bold text-slate-900 text-xs sm:text-sm truncate">
                  {currentVisitor.fullName}
                </span>
                {currentVisitor.id && (
                  <span className="text-[9.5px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 border border-amber-300">
                    {currentVisitor.id}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 font-sans">
                {currentVisitor.nickname ? `“${currentVisitor.nickname}” • ` : ''}
                {currentVisitor.role || 'Cựu học sinh K8A1'}
              </p>
            </div>

            {/* Trạng thái RSVP */}
            <div className="text-[11px] font-sans space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Điểm danh:</span>
                {matchedRsvp ? (
                  matchedRsvp.status === 'yes' ? (
                    <span className="text-emerald-700 font-bold">✓ Đã tham gia (Size {matchedRsvp.shirtSize || 'L'})</span>
                  ) : (
                    <span className="text-slate-600 font-medium">🕊️ Báo vắng</span>
                  )
                ) : (
                  <span className="text-amber-800 font-bold">⏳ Chưa xác nhận</span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Quỹ họp lớp:</span>
                {matchedRsvp && matchedRsvp.fundStatus === 'paid' ? (
                  <span className="text-indigo-700 font-bold">✓ Đã nộp quỹ</span>
                ) : matchedRsvp && matchedRsvp.status === 'yes' ? (
                  <span className="text-rose-700 font-bold">Chưa nộp</span>
                ) : (
                  <span className="text-slate-400 font-medium">—</span>
                )}
              </div>
            </div>

            {/* Action Items */}
            <div className="space-y-1 pt-1 border-t border-amber-200/60 font-sans text-xs">
              {matchedRsvp && onOpenPassModal && (
                <button
                  type="button"
                  onClick={() => {
                    onOpenPassModal(matchedRsvp);
                    setIsDropdownOpen(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-amber-100/70 text-amber-950 font-medium flex items-center gap-2 cursor-pointer transition"
                >
                  <Award className="w-3.5 h-3.5 text-amber-700" />
                  <span>Xem Thẻ Kỷ Niệm 🪪</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  setIsDropdownOpen(false);
                  window.dispatchEvent(
                    new CustomEvent('update-member-shirt-size', {
                      detail: { memberId: currentVisitor.id, fullName: currentVisitor.fullName }
                    })
                  );
                }}
                className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-amber-100/70 text-amber-950 font-medium flex items-center gap-2 cursor-pointer transition"
              >
                <Shirt className="w-3.5 h-3.5 text-amber-700" />
                <span>{matchedRsvp ? 'Đổi cỡ áo polo' : 'Điểm danh & Chọn size áo'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsDropdownOpen(false);
                  setIsModalOpen(true);
                }}
                className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-100 text-slate-700 font-medium flex items-center gap-2 cursor-pointer transition"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                <span>Đổi sang bạn học khác</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal chọn danh tính */}
      <IdentitySelectorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        classRoster={classRoster}
        rsvpList={rsvpList}
        currentVisitor={currentVisitor}
        onSelect={onSelectVisitor}
      />
    </>
  );
}
