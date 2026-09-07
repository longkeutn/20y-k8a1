import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BookOpen,
  X,
  Search,
  Users,
  Shield,
  Coins,
  Crown,
  CheckCircle2,
  Lock,
  ArrowRight,
  ExternalLink,
  QrCode,
  FileSpreadsheet,
  Camera,
  HeartHandshake,
  FileCheck,
  Scale,
  Sparkles,
  HelpCircle,
  Clock,
  Award,
  ChevronRight,
  Info,
  Calendar,
  Layers,
  Upload
} from 'lucide-react';
import { UserRole } from '../types';

export interface RoleGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserRole: UserRole;
  initialTab?: 'member' | 'bll' | 'treasurer' | 'admin' | 'matrix';
  onOpenAuthModal?: () => void;
  onNavigateToSection?: (sectionId: string) => void;
  onOpenCharterModal?: () => void;
  onOpenAdminHub?: (tab?: 'members' | 'fund' | 'wishes' | 'media' | 'settings') => void;
}

type GuideTab = 'member' | 'bll' | 'treasurer' | 'admin' | 'matrix';

export default function RoleGuideModal({
  isOpen,
  onClose,
  currentUserRole,
  initialTab = 'member',
  onOpenAuthModal,
  onNavigateToSection,
  onOpenCharterModal,
  onOpenAdminHub
}: RoleGuideModalProps) {
  const [activeTab, setActiveTab] = useState<GuideTab>(initialTab);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Đồng bộ tab khi mở modal với initialTab mới
  React.useEffect(() => {
    if (isOpen) {
      if (initialTab) setActiveTab(initialTab);
      setSearchQuery('');
    }
  }, [isOpen, initialTab]);

  // Kiểm tra quyền hạn tương ứng
  const isAdmin = currentUserRole === 'admin';
  const isTreasurer = currentUserRole === 'treasurer' || isAdmin;
  const isBll = currentUserRole === 'bll' || isAdmin;

  // Điều hướng nhanh đến section trên WebApp
  const handleJump = (sectionId: string) => {
    onClose();
    if (onNavigateToSection) {
      onNavigateToSection(sectionId);
    } else {
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 150);
    }
  };

  const handleOpenHubTab = (tab: 'members' | 'fund' | 'wishes' | 'media' | 'settings') => {
    onClose();
    if (currentUserRole === 'guest') {
      if (onOpenAuthModal) onOpenAuthModal();
    } else {
      if (onOpenAdminHub) onOpenAdminHub(tab);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto">
        {/* Backdrop mờ tối sang trọng */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/75 backdrop-blur-md"
        />

        {/* Cửa sổ Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="relative w-full max-w-4xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-amber-200/80 overflow-hidden flex flex-col max-h-[92vh] z-10 font-sans text-slate-800"
        >
          {/* ================================================================= */}
          {/* HEADER MODAL */}
          {/* ================================================================= */}
          <header className="bg-gradient-to-r from-[#1A2234] via-[#243048] to-[#1A2234] text-white px-4 sm:px-6 py-4 sm:py-5 border-b border-amber-500/30 flex items-center justify-between shrink-0">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 shadow-md shadow-amber-500/20 shrink-0">
                <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg md:text-xl font-serif font-bold text-white tracking-wide">
                    Cẩm Nang Hoạt Động & Vận Hành K8A1
                  </h2>
                  <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-[10px] font-mono font-semibold uppercase">
                    K8A1 OS
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-amber-200/80 mt-0.5">
                  Hướng dẫn chi tiết quy trình, thẩm quyền và cách thức sử dụng cho từng vai trò
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition cursor-pointer"
              title="Đóng cẩm nang"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </header>

          {/* ================================================================= */}
          {/* THANH TÌM KIẾM TỪ KHÓA & BỘ LỌC */}
          {/* ================================================================= */}
          <div className="bg-[#FAF8F5] border-b border-amber-200/60 px-4 sm:px-6 py-2.5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 shrink-0">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm nhanh: đóng quỹ, hiếu hỷ, hóa đơn, check-in, danh bạ, drive..."
                className="w-full pl-9 pr-8 py-1.5 text-xs sm:text-sm bg-white border border-slate-300/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition placeholder:text-slate-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Trạng thái vai trò hiện tại của người dùng */}
            <div className="flex items-center gap-1.5 self-end sm:self-auto text-[11px] text-slate-500">
              <span>Bạn đang xem với tư cách:</span>
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                  currentUserRole === 'admin'
                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                    : currentUserRole === 'treasurer'
                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                    : currentUserRole === 'bll'
                    ? 'bg-indigo-100 text-indigo-900 border border-indigo-300'
                    : 'bg-slate-100 text-slate-700 border border-slate-200'
                }`}
              >
                {currentUserRole === 'admin' && <Crown className="w-3 h-3 text-amber-600" />}
                {currentUserRole === 'treasurer' && <Coins className="w-3 h-3 text-emerald-600" />}
                {currentUserRole === 'bll' && <Shield className="w-3 h-3 text-indigo-600" />}
                {currentUserRole === 'guest' && <Users className="w-3 h-3 text-slate-500" />}
                <span>
                  {currentUserRole === 'admin'
                    ? 'Ban Quản Trị'
                    : currentUserRole === 'treasurer'
                    ? 'Thủ Quỹ Lớp'
                    : currentUserRole === 'bll'
                    ? 'Ban Liên Lạc'
                    : 'Thành Viên'}
                </span>
              </span>
            </div>
          </div>

          {/* ================================================================= */}
          {/* TAB ĐIỀU HƯỚNG THEO VAI TRÒ */}
          {/* ================================================================= */}
          <nav className="flex items-center px-3 sm:px-6 bg-white border-b border-slate-200 overflow-x-auto scrollbar-none shrink-0 gap-1 sm:gap-2">
            <button
              onClick={() => setActiveTab('member')}
              className={`flex items-center gap-1.5 py-3 px-3 border-b-2 text-xs sm:text-sm font-semibold whitespace-nowrap transition cursor-pointer ${
                activeTab === 'member'
                  ? 'border-amber-600 text-amber-700 bg-amber-50/50'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Users className="w-4 h-4 text-amber-600" />
              <span>1. Thành Viên & Cựu Học Sinh</span>
            </button>

            <button
              onClick={() => setActiveTab('bll')}
              className={`flex items-center gap-1.5 py-3 px-3 border-b-2 text-xs sm:text-sm font-semibold whitespace-nowrap transition cursor-pointer ${
                activeTab === 'bll'
                  ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Shield className="w-4 h-4 text-indigo-600" />
              <span>2. Ban Liên Lạc</span>
              {!isBll && <Lock className="w-3 h-3 text-slate-400 ml-0.5" />}
            </button>

            <button
              onClick={() => setActiveTab('treasurer')}
              className={`flex items-center gap-1.5 py-3 px-3 border-b-2 text-xs sm:text-sm font-semibold whitespace-nowrap transition cursor-pointer ${
                activeTab === 'treasurer'
                  ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Coins className="w-4 h-4 text-emerald-600" />
              <span>3. Thủ Quỹ Lớp</span>
              {!isTreasurer && <Lock className="w-3 h-3 text-slate-400 ml-0.5" />}
            </button>

            <button
              onClick={() => setActiveTab('admin')}
              className={`flex items-center gap-1.5 py-3 px-3 border-b-2 text-xs sm:text-sm font-semibold whitespace-nowrap transition cursor-pointer ${
                activeTab === 'admin'
                  ? 'border-rose-600 text-rose-700 bg-rose-50/50'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Crown className="w-4 h-4 text-rose-600" />
              <span>4. Ban Quản Trị / Kỹ Thuật</span>
              {!isAdmin && <Lock className="w-3 h-3 text-slate-400 ml-0.5" />}
            </button>

            <button
              onClick={() => setActiveTab('matrix')}
              className={`flex items-center gap-1.5 py-3 px-3 border-b-2 text-xs sm:text-sm font-semibold whitespace-nowrap transition cursor-pointer ${
                activeTab === 'matrix'
                  ? 'border-slate-800 text-slate-900 bg-slate-100'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Layers className="w-4 h-4 text-slate-700" />
              <span>5. Phân Quyền & Quy Chế</span>
            </button>
          </nav>

          {/* ================================================================= */}
          {/* NỘI DUNG CHI TIẾT TỪNG TAB */}
          {/* ================================================================= */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 text-sm leading-relaxed text-slate-700 bg-[#FCFBF9]">

            {/* TAB 1: THÀNH VIÊN & CỰU HỌC SINH */}
            {activeTab === 'member' && (
              <div className="space-y-6">
                {/* Intro Card */}
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-amber-500/10 via-amber-50 to-white border border-amber-200">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-amber-500 text-white rounded-xl shadow-sm shrink-0">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-serif font-bold text-amber-950">
                        Dành Cho Toàn Thể Thành Viên, Cựu Học Sinh & Thầy Cô K8A1
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-600 mt-1">
                        Cổng thông tin tương tác, tham gia các hoạt động thường niên, đăng ký sự kiện và theo dõi sổ quỹ minh bạch của tập thể lớp.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Các tính năng chính */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Mục 1: Đăng ký & Điểm danh */}
                  <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:border-amber-300 transition space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-amber-800 font-bold">
                        <CheckCircle2 className="w-4 h-4 text-amber-600" />
                        <span>1. Đăng Ký & Báo Danh (RSVP)</span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-medium">1 chạm</span>
                    </div>
                    <p className="text-xs text-slate-600">
                      Chọn họ tên từ danh bạ 65 bạn (hệ thống tự động điền thông tin, không phải gõ lại). Chọn size áo đồng phục, số người thân đi kèm và gửi gắm tâm sự.
                    </p>
                    <div className="pt-1 flex items-center gap-2">
                      <button
                        onClick={() => handleJump('diem-danh')}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-xs cursor-pointer"
                      >
                        <span>Đến Mục Báo Danh</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Mục 2: Thẻ Kỷ Niệm Điện Tử (Golden Pass) */}
                  <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:border-amber-300 transition space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-amber-800 font-bold">
                        <QrCode className="w-4 h-4 text-amber-600" />
                        <span>2. Thẻ Học Sinh Kỷ Niệm (Golden Pass)</span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-medium">Check-in</span>
                    </div>
                    <p className="text-xs text-slate-600">
                      Sau khi báo danh, bạn nhận ngay một thẻ tham dự điện tử sang trọng có mã QR định danh cá nhân. Hãy lưu thẻ vào điện thoại để BTC quét check-in nhanh khi đến ngày hội ngộ.
                    </p>
                    <div className="pt-1 flex items-center gap-2">
                      <button
                        onClick={() => handleJump('danh-sach-diem-danh')}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold cursor-pointer"
                      >
                        <span>Xem Danh Sách Bạn Bè</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Mục 3: Đóng quỹ VietQR & Tải biên lai */}
                  <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:border-emerald-300 transition space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-emerald-800 font-bold">
                        <Coins className="w-4 h-4 text-emerald-600" />
                        <span>3. Đóng Quỹ VietQR & Tải Biên Lai</span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-medium">Tự động</span>
                    </div>
                    <p className="text-xs text-slate-600">
                      Mở app ngân hàng quét mã VietQR đã điền sẵn số tiền và cú pháp chuẩn. Sau khi chuyển khoản xong, bấm <strong>"Tải Lên Biên Lai"</strong> chụp ảnh xác nhận gửi thẳng vào Google Drive lớp để Thủ Quỹ duyệt.
                    </p>
                    <div className="pt-1 flex items-center gap-2">
                      <button
                        onClick={() => handleJump('bank-transfer-card')}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs cursor-pointer"
                      >
                        <span>Đến Cổng Quỹ Lớp</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Mục 4: Minh bạch tài chính & Hóa đơn */}
                  <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:border-emerald-300 transition space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-emerald-800 font-bold">
                        <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                        <span>4. Sổ Quỹ Thu - Chi Công Khai</span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-medium">Minh bạch</span>
                    </div>
                    <p className="text-xs text-slate-600">
                      Bất kỳ thành viên nào cũng có thể theo dõi chi tiết từng khoản thu và từng khoản chi (tiệc tùng, may đồng phục, quà tặng, hiếu hỷ Điều 3...) kèm ảnh chụp hóa đơn chứng từ thực tế.
                    </p>
                    <div className="pt-1 flex items-center gap-2">
                      <button
                        onClick={() => {
                          if (onOpenCharterModal) onOpenCharterModal();
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-semibold cursor-pointer"
                      >
                        <Scale className="w-3 h-3 text-amber-700" />
                        <span>Xem Quy Chế Lớp (Điều 3 & 4)</span>
                      </button>
                    </div>
                  </div>

                  {/* Mục 5: Lưu bút & Kỷ niệm */}
                  <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:border-rose-300 transition space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-rose-800 font-bold">
                        <HeartHandshake className="w-4 h-4 text-rose-600" />
                        <span>5. Lưu Bút & Tri Ân Thầy Cô</span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-medium">Gắn kết</span>
                    </div>
                    <p className="text-xs text-slate-600">
                      Gửi gắm lời chúc, những ký ức thời hoa niên niên khóa 2003 — 2006, thả tim cho bài viết của bạn bè và chia sẻ tình cảm tới các thầy cô giáo cũ.
                    </p>
                    <div className="pt-1 flex items-center gap-2">
                      <button
                        onClick={() => handleJump('luu-but')}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold cursor-pointer"
                      >
                        <span>Viết Lưu Bút</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Mục 6: Kho ảnh & Video xưa */}
                  <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:border-amber-300 transition space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-amber-800 font-bold">
                        <Camera className="w-4 h-4 text-amber-600" />
                        <span>6. Thước Phim & Kỷ Niệm Xưa</span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-medium">Thanh xuân</span>
                    </div>
                    <p className="text-xs text-slate-600">
                      Ngắm lại album ảnh chụp kỷ yếu, các buổi dã ngoại và video phóng sự thanh xuân. Bạn cũng có thể tải thêm những bức ảnh cũ trong máy của mình lên kho kỷ niệm chung của lớp.
                    </p>
                    <div className="pt-1 flex items-center gap-2">
                      <button
                        onClick={() => handleJump('ky-uc')}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold cursor-pointer"
                      >
                        <span>Mở Kho Ảnh & Video</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: BAN LIÊN LẠC (BLL) */}
            {activeTab === 'bll' && (
              <div className="space-y-6">
                {/* Intro Card */}
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-indigo-500/10 via-indigo-50 to-white border border-indigo-200">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-sm shrink-0">
                      <Shield className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-serif font-bold text-indigo-950">
                        Vai Trò & Nhiệm Vụ Của Ban Liên Lạc (BLL)
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-600 mt-1">
                        Ban Liên Lạc là cầu nối gắn kết 65 bạn học K8A1, điều phối các buổi họp mặt định kỳ, đón tiếp bạn bè và phụ trách công tác hiếu hỷ, thăm hỏi ốm đau theo Điều 3 Quy Chế.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Khóa bảo mật nếu chưa xác thực vai trò BLL */}
                {!isBll ? (
                  <div className="p-5 rounded-2xl bg-white border border-indigo-200 shadow-sm text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-700 mx-auto flex items-center justify-center">
                      <Lock className="w-6 h-6" />
                    </div>
                    <div className="max-w-md mx-auto space-y-1">
                      <h4 className="font-bold text-slate-900 text-sm sm:text-base">
                        Khu Vực Dành Riêng Cho Ban Liên Lạc
                      </h4>
                      <p className="text-xs text-slate-600">
                        Để mở khóa quy trình tác nghiệp nội bộ (Check-in sự kiện, quản lý danh bạ kết nối, kiểm soát đối soát chéo quỹ), vui lòng xác thực mã PIN vai trò Ban Liên Lạc.
                      </p>
                    </div>
                    <div className="pt-2">
                      <button
                        onClick={() => {
                          onClose();
                          if (onOpenAuthModal) onOpenAuthModal();
                        }}
                        className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md transition cursor-pointer"
                      >
                        <Shield className="w-4 h-4" />
                        <span>Nhập Mã PIN Ban Liên Lạc</span>
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-400 italic">
                      * Mã PIN được Ban Tổ Chức cấp nội bộ. Nếu bạn là thành viên BLL mà chưa có PIN, vui lòng liên hệ Trưởng Ban.
                    </p>
                  </div>
                ) : (
                  /* Nội dung mở khóa khi đã có quyền BLL */
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-medium">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Bạn đã được cấp quyền: <strong>Ban Liên Lạc (BLL)</strong></span>
                      </span>
                      <button
                        onClick={() => handleOpenHubTab('members')}
                        className="text-indigo-700 hover:underline font-bold"
                      >
                        Vào Cổng Lễ Tân & Danh Bạ →
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2">
                        <h4 className="font-bold text-indigo-900 flex items-center gap-2 text-xs sm:text-sm">
                          <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                          <span>1. Tiếp Đón & Check-in Sự Kiện</span>
                        </h4>
                        <p className="text-xs text-slate-600">
                          Tại buổi gặp mặt, BLL mở Hub Quản Trị &gt; Tab Danh Sách. Khi bạn bè đến, bấm nút <strong>"ĐÃ ĐẾN"</strong> (hoặc soi mã QR trên Thẻ Kỷ Niệm của bạn) để xác nhận sĩ số có mặt realtime.
                        </p>
                      </div>

                      <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2">
                        <h4 className="font-bold text-indigo-900 flex items-center gap-2 text-xs sm:text-sm">
                          <Users className="w-4 h-4 text-indigo-600" />
                          <span>2. Đôn Đốc & Báo Danh Hộ</span>
                        </h4>
                        <p className="text-xs text-slate-600">
                          Theo dõi danh bạ 65 bạn xem ai chưa báo danh. Với các bạn ở xa hoặc không tiện dùng điện thoại, BLL có thể bấm <strong>"Thêm / Báo danh hộ"</strong> để cập nhật thông tin và size áo vào hệ thống.
                        </p>
                      </div>

                      <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2">
                        <h4 className="font-bold text-indigo-900 flex items-center gap-2 text-xs sm:text-sm">
                          <HeartHandshake className="w-4 h-4 text-indigo-600" />
                          <span>3. Chăm Lo Hiếu Hỷ (Điều 3 Quy Chế)</span>
                        </h4>
                        <p className="text-xs text-slate-600">
                          Khi trong lớp có việc hiếu, việc hỷ, hoặc bạn bè ốm đau tai nạn, BLL là đầu mối thông báo, nắm tình hình và đại diện lớp tổ chức thăm viếng kịp thời theo định mức quy định (500k hiếu hỷ / 300k ốm đau).
                        </p>
                      </div>

                      <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2">
                        <h4 className="font-bold text-indigo-900 flex items-center gap-2 text-xs sm:text-sm">
                          <Coins className="w-4 h-4 text-indigo-600" />
                          <span>4. Giám Sát Đối Soát Chéo Quỹ Lớp</span>
                        </h4>
                        <p className="text-xs text-slate-600">
                          BLL có quyền xem toàn bộ sổ thu chi và hình ảnh hóa đơn chứng từ trên Drive ở chế độ an toàn để đảm bảo tính khách quan và minh bạch cao nhất.
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 flex flex-wrap items-center gap-3">
                      <button
                        onClick={() => handleOpenHubTab('members')}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm cursor-pointer"
                      >
                        <Users className="w-4 h-4" />
                        <span>Mở Cổng Lễ Tân Điểm Danh</span>
                      </button>
                      <button
                        onClick={() => handleOpenHubTab('fund')}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-indigo-900 border border-indigo-300 text-xs font-bold cursor-pointer"
                      >
                        <Coins className="w-4 h-4 text-indigo-600" />
                        <span>Giám Sát Sổ Quỹ Lớp</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: THỦ QUỸ LỚP */}
            {activeTab === 'treasurer' && (
              <div className="space-y-6">
                {/* Intro Card */}
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-emerald-50 to-white border border-emerald-200">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-emerald-600 text-white rounded-xl shadow-sm shrink-0">
                      <Coins className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-serif font-bold text-emerald-950">
                        Nghiệp Vụ Thủ Quỹ & Quản Trị Sổ Quỹ Lớp K8A1
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-600 mt-1">
                        Thủ Quỹ chịu trách nhiệm quản lý toàn diện dòng tiền tập thể: duyệt đóng quỹ, soi biên lai chứng từ trên Google Drive, ghi nhận Sổ Thu / Sổ Chi và xuất báo cáo sao kê định kỳ.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Khóa bảo mật nếu chưa xác thực vai trò Thủ Quỹ */}
                {!isTreasurer ? (
                  <div className="p-5 rounded-2xl bg-white border border-emerald-200 shadow-sm text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
                      <Lock className="w-6 h-6" />
                    </div>
                    <div className="max-w-md mx-auto space-y-1">
                      <h4 className="font-bold text-slate-900 text-sm sm:text-base">
                        Khu Vực Dành Riêng Cho Thủ Quỹ Lớp
                      </h4>
                      <p className="text-xs text-slate-600">
                        Để mở khóa quy trình duyệt thu, tải chứng từ chi tiêu lên Drive và quản lý Sổ Quỹ, vui lòng xác thực mã PIN vai trò Thủ Quỹ.
                      </p>
                    </div>
                    <div className="pt-2">
                      <button
                        onClick={() => {
                          onClose();
                          if (onOpenAuthModal) onOpenAuthModal();
                        }}
                        className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md transition cursor-pointer"
                      >
                        <Coins className="w-4 h-4" />
                        <span>Nhập Mã PIN Thủ Quỹ</span>
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-400 italic">
                      * Mã PIN được cấp nội bộ để bảo mật tài chính lớp.
                    </p>
                  </div>
                ) : (
                  /* Nội dung mở khóa khi đã có quyền Thủ Quỹ */
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-medium">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Bạn đã được cấp quyền: <strong>Thủ Quỹ Lớp (Treasurer)</strong></span>
                      </span>
                      <button
                        onClick={() => handleOpenHubTab('fund')}
                        className="text-emerald-800 hover:underline font-bold"
                      >
                        Mở Sổ Quỹ Thu - Chi →
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Bước 1: Duyệt Thu */}
                      <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2">
                        <h4 className="font-bold text-emerald-900 flex items-center gap-2 text-xs sm:text-sm">
                          <FileCheck className="w-4 h-4 text-emerald-600" />
                          <span>1. Đối Soát & Soi Biên Lai Đóng Quỹ</span>
                        </h4>
                        <p className="text-xs text-slate-600">
                          Tại Tab Thu Quỹ, thành viên nộp bill sẽ có icon kẹp ghim 📎. Bấm vào để mở <strong>Lightbox soi chi tiết ảnh biên lai chuyển khoản</strong> lưu trên Drive. Sau khi đối chiếu số dư ngân hàng, bấm <strong>"Xác Nhận Đã Đóng"</strong>. Hệ thống tự động ghi nhận tên người duyệt để lưu vết trách nhiệm.
                        </p>
                      </div>

                      {/* Bước 2: Sổ Thu đa nguồn */}
                      <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2">
                        <h4 className="font-bold text-emerald-900 flex items-center gap-2 text-xs sm:text-sm">
                          <Coins className="w-4 h-4 text-emerald-600" />
                          <span>2. Quản Lý Sổ Thu Đa Danh Mục (Khoan_Thu)</span>
                        </h4>
                        <p className="text-xs text-slate-600">
                          Ghi nhận các nguồn thu linh hoạt ngoài đóng góp sự kiện: Quỹ thường niên duy trì hàng năm, đóng góp tự nguyện của mạnh thường quân, bán đồ lưu niệm... Tất cả được lưu trực tiếp vào Google Sheet tab <code>Khoan_Thu</code>.
                        </p>
                      </div>

                      {/* Bước 3: Sổ Chi & Upload chứng từ */}
                      <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2">
                        <h4 className="font-bold text-emerald-900 flex items-center gap-2 text-xs sm:text-sm">
                          <Upload className="w-4 h-4 text-emerald-600" />
                          <span>3. Quản Lý Sổ Chi & Tải Hóa Đơn Lên Drive</span>
                        </h4>
                        <p className="text-xs text-slate-600">
                          Mọi khoản chi (tiệc, cọc, in ấn, hiếu hỷ Điều 3, tri ân thầy cô Điều 4...) đều được phân loại danh mục và <strong>bắt buộc đính kèm ảnh chụp hóa đơn chứng từ</strong>. Ảnh tự động tải lên thư mục Google Drive <code>ChungTu_QuyLop_K8A1</code> và sinh link minh bạch cho cả lớp xem.
                        </p>
                      </div>

                      {/* Bước 4: Xuất báo cáo sao kê */}
                      <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2">
                        <h4 className="font-bold text-emerald-900 flex items-center gap-2 text-xs sm:text-sm">
                          <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                          <span>4. Xuất Báo Cáo Sao Kê Tài Chính (CSV/Excel)</span>
                        </h4>
                        <p className="text-xs text-slate-600">
                          Bấm nút <strong>"Xuất Báo Cáo (CSV)"</strong> tại Hub Quản Trị để tải toàn bộ bảng sao kê thu - chi chi tiết, sẵn sàng gửi vào nhóm Zalo lớp sau mỗi sự kiện hoặc định kỳ cuối năm.
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 flex flex-wrap items-center gap-3">
                      <button
                        onClick={() => handleOpenHubTab('fund')}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm cursor-pointer"
                      >
                        <Coins className="w-4 h-4" />
                        <span>Mở Sổ Quỹ Lớp (Thu & Chi)</span>
                      </button>
                      <button
                        onClick={() => {
                          if (onOpenCharterModal) onOpenCharterModal();
                        }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-emerald-900 border border-emerald-300 text-xs font-bold cursor-pointer"
                      >
                        <Scale className="w-4 h-4 text-emerald-600" />
                        <span>Tra Cứu Định Mức Chi (Điều 3 & 4)</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: BAN QUẢN TRỊ / KỸ THUẬT */}
            {activeTab === 'admin' && (
              <div className="space-y-6">
                {/* Intro Card */}
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-rose-500/10 via-rose-50 to-white border border-rose-200">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-rose-600 text-white rounded-xl shadow-sm shrink-0">
                      <Crown className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-serif font-bold text-rose-950">
                        Toàn Quyền Quản Trị Kỹ Thuật & Cấu Hình Dữ Liệu Lớp K8A1
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-600 mt-1">
                        Admin nắm toàn quyền hạ tầng: quản trị danh bạ 65 bạn cựu học sinh, cấu hình linh hoạt các sự kiện trong tương lai (không cần sửa code), quản lý kho ảnh bìa & media, và quản lý mã PIN bảo mật.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Khóa bảo mật nếu chưa xác thực vai trò Admin */}
                {!isAdmin ? (
                  <div className="p-5 rounded-2xl bg-white border border-rose-200 shadow-sm text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-700 mx-auto flex items-center justify-center">
                      <Lock className="w-6 h-6" />
                    </div>
                    <div className="max-w-md mx-auto space-y-1">
                      <h4 className="font-bold text-slate-900 text-sm sm:text-base">
                        Khu Vực Quản Trị Cấp Cao (Admin)
                      </h4>
                      <p className="text-xs text-slate-600">
                        Vui lòng xác thực mã PIN Quản Trị Viên để tiếp cận cấu hình hệ thống, danh bạ lớp và cài đặt bảo mật.
                      </p>
                    </div>
                    <div className="pt-2">
                      <button
                        onClick={() => {
                          onClose();
                          if (onOpenAuthModal) onOpenAuthModal();
                        }}
                        className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs sm:text-sm shadow-md transition cursor-pointer"
                      >
                        <Crown className="w-4 h-4" />
                        <span>Nhập Mã PIN Ban Quản Trị</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Nội dung mở khóa khi đã có quyền Admin */
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs font-medium">
                      <span className="flex items-center gap-1.5">
                        <Crown className="w-4 h-4 text-rose-600" />
                        <span>Bạn đã đăng nhập với vai trò: <strong>Ban Quản Trị Tối Cao (Admin)</strong></span>
                      </span>
                      <button
                        onClick={() => handleOpenHubTab('settings')}
                        className="text-rose-800 hover:underline font-bold"
                      >
                        Cài Đặt Hệ Thống →
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Mục 1: Quản trị Danh Bạ 65 bạn */}
                      <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2">
                        <h4 className="font-bold text-rose-900 flex items-center gap-2 text-xs sm:text-sm">
                          <Users className="w-4 h-4 text-rose-600" />
                          <span>1. Quản Trị Danh Bạ 65 Bạn (Danh_Sach_Lop)</span>
                        </h4>
                        <p className="text-xs text-slate-600">
                          Thêm mới, sửa thông tin bạn học, cập nhật số điện thoại, nơi ở hiện tại, chức vụ ban cán sự. Toàn bộ thay đổi đồng bộ 2 chiều tức thì với Google Sheet tab <code>Danh_Sach_Lop</code>.
                        </p>
                      </div>

                      {/* Mục 2: Cấu hình linh hoạt các sự kiện tương lai */}
                      <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2">
                        <h4 className="font-bold text-rose-900 flex items-center gap-2 text-xs sm:text-sm">
                          <Calendar className="w-4 h-4 text-rose-600" />
                          <span>2. Cấu Hình Sự Kiện Linh Hoạt Cho Tương Lai</span>
                        </h4>
                        <p className="text-xs text-slate-600">
                          Khi lớp tổ chức các sự kiện tiếp theo (Gặp mặt 2027, Họp lớp 25 năm, dã ngoại hè...), Admin chỉ cần vào Tab Cài Đặt để đổi tên sự kiện, thời gian, địa điểm, link Google Maps, kinh phí dự kiến và tài khoản ngân hàng. <strong>Giao diện WebApp sẽ tự động thay đổi theo sự kiện mới mà không cần lập trình lại code!</strong>
                        </p>
                      </div>

                      {/* Mục 3: Quản trị Media & Banner */}
                      <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2">
                        <h4 className="font-bold text-rose-900 flex items-center gap-2 text-xs sm:text-sm">
                          <Camera className="w-4 h-4 text-rose-600" />
                          <span>3. Quản Trị Hero Banner & Kho Video</span>
                        </h4>
                        <p className="text-xs text-slate-600">
                          Tải ảnh bìa mới lên Google Drive, dán link vào hệ thống và kéo thanh trượt định vị khung hình (trục Y từ 0% đến 100%) để ảnh luôn hiển thị đẹp nhất trên cả điện thoại và máy tính.
                        </p>
                      </div>

                      {/* Mục 4: Bảo mật & Đổi mã PIN */}
                      <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2">
                        <h4 className="font-bold text-rose-900 flex items-center gap-2 text-xs sm:text-sm">
                          <Lock className="w-4 h-4 text-rose-600" />
                          <span>4. Đổi Mã PIN & Dọn Dẹp Dữ Liệu</span>
                        </h4>
                        <p className="text-xs text-slate-600">
                          Đổi mã PIN định kỳ cho cả 3 vai trò (BLL, Thủ Quỹ, Admin) trực tiếp trên Web. Mã PIN được mã hóa SHA-256 an toàn lưu trên Google Sheet tab <code>Bao_Mat_PIN</code>. Sử dụng công cụ Deduplicate để dọn sạch các bản ghi gửi trùng lặp.
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 flex flex-wrap items-center gap-3">
                      <button
                        onClick={() => handleOpenHubTab('settings')}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm cursor-pointer"
                      >
                        <Crown className="w-4 h-4" />
                        <span>Mở Cài Đặt Hệ Thống & Cấu Hình</span>
                      </button>
                      <button
                        onClick={() => handleOpenHubTab('members')}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-rose-900 border border-rose-300 text-xs font-bold cursor-pointer"
                      >
                        <Users className="w-4 h-4 text-rose-600" />
                        <span>Quản Trị Danh Bạ 65 Bạn</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 5: MA TRẬN PHÂN QUYỀN & TÓM TẮT QUY CHẾ */}
            {activeTab === 'matrix' && (
              <div className="space-y-6">
                {/* Intro Card */}
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-700/10 via-slate-100 to-white border border-slate-300">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-slate-800 text-white rounded-xl shadow-sm shrink-0">
                      <Scale className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-serif font-bold text-slate-900">
                        Ma Trận Phân Quyền & Quy Chế Hoạt Động Lớp K8A1
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-600 mt-1">
                        Bảng so sánh chi tiết thẩm quyền 4 vai trò trên nền tảng kỹ thuật số và tóm tắt các định mức chi tiêu trọng yếu theo Quy chế lớp.
                      </p>
                    </div>
                  </div>
                </div>

                {/* BẢNG SO SÁNH PHÂN QUYỀN (RBAC MATRIX) */}
                <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-2xs bg-white">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-200 text-slate-800 font-bold uppercase text-[10px] tracking-wider">
                        <th className="p-3">Tính Năng / Nghiệp Vụ</th>
                        <th className="p-3 text-center">Thành Viên</th>
                        <th className="p-3 text-center text-indigo-800">Ban Liên Lạc</th>
                        <th className="p-3 text-center text-emerald-800">Thủ Quỹ</th>
                        <th className="p-3 text-center text-rose-800">Admin</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      <tr className="hover:bg-amber-50/40">
                        <td className="p-3 font-medium">Đăng ký sự kiện (RSVP) & Nhận Thẻ Kỷ Niệm</td>
                        <td className="p-3 text-center text-emerald-600 font-bold">✓</td>
                        <td className="p-3 text-center text-emerald-600 font-bold">✓</td>
                        <td className="p-3 text-center text-emerald-600 font-bold">✓</td>
                        <td className="p-3 text-center text-emerald-600 font-bold">✓</td>
                      </tr>
                      <tr className="hover:bg-amber-50/40">
                        <td className="p-3 font-medium">Quét VietQR & Tải biên lai chuyển khoản</td>
                        <td className="p-3 text-center text-emerald-600 font-bold">✓</td>
                        <td className="p-3 text-center text-emerald-600 font-bold">✓</td>
                        <td className="p-3 text-center text-emerald-600 font-bold">✓</td>
                        <td className="p-3 text-center text-emerald-600 font-bold">✓</td>
                      </tr>
                      <tr className="hover:bg-amber-50/40">
                        <td className="p-3 font-medium">Xem Sổ Quỹ & Hóa đơn chứng từ (Read-Only)</td>
                        <td className="p-3 text-center text-emerald-600 font-bold">✓</td>
                        <td className="p-3 text-center text-emerald-600 font-bold">✓</td>
                        <td className="p-3 text-center text-emerald-600 font-bold">✓</td>
                        <td className="p-3 text-center text-emerald-600 font-bold">✓</td>
                      </tr>
                      <tr className="hover:bg-amber-50/40">
                        <td className="p-3 font-medium">Check-in Lễ tân / Bấm "ĐÃ ĐẾN" tại sự kiện</td>
                        <td className="p-3 text-center text-slate-300">—</td>
                        <td className="p-3 text-center text-indigo-600 font-bold">✓</td>
                        <td className="p-3 text-center text-slate-300">—</td>
                        <td className="p-3 text-center text-rose-600 font-bold">✓</td>
                      </tr>
                      <tr className="hover:bg-amber-50/40">
                        <td className="p-3 font-medium">Báo danh hộ cho bạn bè trong danh bạ</td>
                        <td className="p-3 text-center text-slate-300">—</td>
                        <td className="p-3 text-center text-indigo-600 font-bold">✓</td>
                        <td className="p-3 text-center text-slate-300">—</td>
                        <td className="p-3 text-center text-rose-600 font-bold">✓</td>
                      </tr>
                      <tr className="hover:bg-amber-50/40">
                        <td className="p-3 font-medium">Duyệt thu quỹ & Soi biên lai Lightbox</td>
                        <td className="p-3 text-center text-slate-300">—</td>
                        <td className="p-3 text-center text-slate-300">—</td>
                        <td className="p-3 text-center text-emerald-600 font-bold">✓</td>
                        <td className="p-3 text-center text-rose-600 font-bold">✓</td>
                      </tr>
                      <tr className="hover:bg-amber-50/40">
                        <td className="p-3 font-medium">Nhập khoản chi tiêu & Tải chứng từ lên Drive</td>
                        <td className="p-3 text-center text-slate-300">—</td>
                        <td className="p-3 text-center text-slate-300">—</td>
                        <td className="p-3 text-center text-emerald-600 font-bold">✓</td>
                        <td className="p-3 text-center text-rose-600 font-bold">✓</td>
                      </tr>
                      <tr className="hover:bg-amber-50/40">
                        <td className="p-3 font-medium">Xuất file báo cáo tài chính sao kê (CSV)</td>
                        <td className="p-3 text-center text-slate-300">—</td>
                        <td className="p-3 text-center text-indigo-600 font-bold">✓</td>
                        <td className="p-3 text-center text-emerald-600 font-bold">✓</td>
                        <td className="p-3 text-center text-rose-600 font-bold">✓</td>
                      </tr>
                      <tr className="hover:bg-amber-50/40">
                        <td className="p-3 font-medium">Thêm / Sửa / Xóa Danh bạ học sinh (65 bạn)</td>
                        <td className="p-3 text-center text-slate-300">—</td>
                        <td className="p-3 text-center text-slate-300">—</td>
                        <td className="p-3 text-center text-slate-300">—</td>
                        <td className="p-3 text-center text-rose-600 font-bold">✓</td>
                      </tr>
                      <tr className="hover:bg-amber-50/40">
                        <td className="p-3 font-medium">Cấu hình sự kiện mới, đổi Banner, đổi mã PIN</td>
                        <td className="p-3 text-center text-slate-300">—</td>
                        <td className="p-3 text-center text-slate-300">—</td>
                        <td className="p-3 text-center text-slate-300">—</td>
                        <td className="p-3 text-center text-rose-600 font-bold">✓</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* TÓM TẮT ĐỊNH MỨC CHI QUY CHẾ LỚP */}
                <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-amber-950 flex items-center gap-2 text-xs sm:text-sm">
                      <Scale className="w-4 h-4 text-amber-700" />
                      <span>Định Mức Chi Tiêu Trọng Yếu Theo Quy Chế Lớp (Điều 3 & 4)</span>
                    </h4>
                    <button
                      onClick={() => {
                        if (onOpenCharterModal) onOpenCharterModal();
                      }}
                      className="text-xs font-bold text-amber-800 hover:underline inline-flex items-center gap-1 cursor-pointer"
                    >
                      <span>Xem toàn văn bản quy chế</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-3 bg-white rounded-xl border border-amber-200/60 shadow-2xs space-y-1">
                      <p className="font-bold text-slate-900">Việc Hiếu / Việc Hỷ</p>
                      <p className="text-amber-700 font-mono font-bold text-base">500.000 đ</p>
                      <p className="text-slate-500 text-[11px]">Tứ thân phụ mẫu, bản thân thành viên và con đẻ.</p>
                    </div>
                    <div className="p-3 bg-white rounded-xl border border-amber-200/60 shadow-2xs space-y-1">
                      <p className="font-bold text-slate-900">Thăm Hỏi Ốm Đau / Rủi Ro</p>
                      <p className="text-amber-700 font-mono font-bold text-base">300.000 đ</p>
                      <p className="text-slate-500 text-[11px]">Thành viên lớp điều trị tại viện hoặc gặp rủi ro lớn.</p>
                    </div>
                    <div className="p-3 bg-white rounded-xl border border-amber-200/60 shadow-2xs space-y-1">
                      <p className="font-bold text-slate-900">Tri Ân Thầy Cô Giáo Cũ</p>
                      <p className="text-amber-700 font-mono font-bold text-base">Theo thực tế</p>
                      <p className="text-slate-500 text-[11px]">Dịp 20/11, Tết cổ truyền hoặc các dịp họp mặt kỷ niệm.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ================================================================= */}
          {/* FOOTER MODAL */}
          {/* ================================================================= */}
          <footer className="bg-slate-50 border-t border-slate-200 px-4 sm:px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-2.5 shrink-0 text-xs">
            <div className="flex items-center gap-1 text-slate-500 text-[11px]">
              <Info className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>Cẩm nang dùng chung cho mọi hoạt động thường niên & sự kiện của Lớp K8A1.</span>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                onClick={() => {
                  if (onOpenCharterModal) onOpenCharterModal();
                }}
                className="px-3 py-1.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-white transition cursor-pointer font-medium"
              >
                Quy Chế Lớp
              </button>
              <button
                onClick={onClose}
                className="px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition cursor-pointer"
              >
                Đã Hiểu
              </button>
            </div>
          </footer>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
