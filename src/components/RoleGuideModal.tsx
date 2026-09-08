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
  ArrowRight,
  ExternalLink,
  QrCode,
  FileSpreadsheet,
  Camera,
  HeartHandshake,
  FileCheck,
  Scale,
  Sparkles,
  ChevronRight,
  Info,
  Calendar,
  Layers,
  Upload,
  Lock,
  FileText
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

interface GuideCard {
  id: string;
  badge?: string;
  badgeColor?: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  title: string;
  description: string;
  details?: string[];
  actionLabel?: string;
  actionIcon?: React.ComponentType<{ className?: string }>;
  actionFn?: () => void;
  secondaryActionLabel?: string;
  secondaryActionFn?: () => void;
  keywords: string[];
}

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

  // ---------------------------------------------------------------------------
  // DỮ LIỆU CÁC MỤC HƯỚNG DẪN CHI TIẾT THEO VAI TRÒ (CÔNG KHAI 100%)
  // ---------------------------------------------------------------------------

  // TAB 1: THÀNH VIÊN & CỰU HỌC SINH
  const memberCards: GuideCard[] = [
    {
      id: 'm-rsvp',
      badge: '1 Chạm',
      badgeColor: 'bg-amber-100 text-amber-800',
      icon: CheckCircle2,
      iconColor: 'text-amber-600',
      title: '1. Đăng Ký Tham Gia & Báo Danh (RSVP)',
      description:
        'Hệ thống tự động nhận diện thành viên theo danh bạ 65 bạn học K8A1. Bạn chỉ cần chọn tên mình, hệ thống sẽ tự động điền thông tin sẵn có. Chọn size áo đồng phục, số lượng người thân đi kèm và gửi gắm lời nhắn nhủ tới tập thể lớp.',
      details: [
        'Chọn tên từ danh bạ 65 bạn (không cần gõ lại họ tên)',
        'Đăng ký size áo đồng phục (S, M, L, XL, XXL, XXXL...)',
        'Xác nhận số người thân tham dự cùng',
        'Gửi lời nhắn nhủ hoặc lưu bút kèm theo'
      ],
      actionLabel: 'Đến Mục Báo Danh',
      actionIcon: ArrowRight,
      actionFn: () => handleJump('diem-danh'),
      keywords: ['đăng ký', 'rsvp', 'điểm danh', 'báo danh', 'size áo', 'đồng phục', 'tham dự', 'xác nhận', 'người thân']
    },
    {
      id: 'm-pass',
      badge: 'Check-in',
      badgeColor: 'bg-amber-100 text-amber-800',
      icon: QrCode,
      iconColor: 'text-amber-600',
      title: '2. Thẻ Học Sinh Kỷ Niệm Điện Tử (Golden Pass)',
      description:
        'Sau khi xác nhận báo danh, bạn sẽ nhận được một Thẻ Tham Dự Điện Tử (Golden Pass) sang trọng mang phong cách niên khóa 2003 — 2006, có mã QR định danh cá nhân độc nhất. Bạn có thể lưu ảnh vé vào điện thoại để BTC quét check-in nhanh khi đến ngày hội ngộ.',
      details: [
        'Mã QR định danh riêng biệt cho từng bạn',
        'Thiết kế Boarding Pass sang trọng kỷ niệm niên khóa 2003 — 2006',
        'Tải ảnh vé về điện thoại chỉ với 1 chạm',
        'Dùng để quét check-in tại bàn lễ tân tiếp đón'
      ],
      actionLabel: 'Xem Danh Sách Bạn Bè',
      actionIcon: ChevronRight,
      actionFn: () => handleJump('danh-sach-diem-danh'),
      keywords: ['golden pass', 'thẻ kỷ niệm', 'vé', 'qr', 'check in', 'boarding pass', 'lễ tân']
    },
    {
      id: 'm-vietqr',
      badge: 'Tự Động',
      badgeColor: 'bg-emerald-100 text-emerald-800',
      icon: Coins,
      iconColor: 'text-emerald-600',
      title: '3. Đóng Quỹ VietQR & Tải Biên Lai Lên Drive',
      description:
        'Mở bất kỳ ứng dụng ngân hàng nào quét mã VietQR động: hệ thống tự động điền chính xác số tài khoản lớp, số tiền quy định và cú pháp chuyển tiền chuẩn. Chuyển khoản xong, bấm "Tải Lên Biên Lai" chụp ảnh màn hình giao dịch gửi thẳng vào Google Drive quỹ lớp để Thủ Quỹ đối soát.',
      details: [
        'VietQR động điền sẵn STK, số tiền và nội dung chuẩn',
        'Nút "Tải Lên Biên Lai" gửi ảnh trực tiếp lên Google Drive lớp',
        'Tự động đánh dấu trạng thái "Chờ thủ quỹ duyệt"',
        'Thủ quỹ xác nhận là trạng thái chuyển thành "Đã đóng quỹ"'
      ],
      actionLabel: 'Đến Cổng Quỹ Lớp',
      actionIcon: ArrowRight,
      actionFn: () => handleJump('bank-transfer-card'),
      keywords: ['đóng quỹ', 'vietqr', 'ngân hàng', 'chuyển khoản', 'biên lai', 'bill', 'drive', 'quỹ lớp']
    },
    {
      id: 'm-transparency',
      badge: 'Minh Bạch',
      badgeColor: 'bg-emerald-100 text-emerald-800',
      icon: FileSpreadsheet,
      iconColor: 'text-emerald-600',
      title: '4. Tra Cứu Sổ Quỹ Thu - Chi Minh Bạch',
      description:
        'Mọi thành viên trong lớp đều có thể tra cứu toàn bộ dòng tiền quỹ lớp theo thời gian thực: danh sách ai đã đóng, ai chờ duyệt, và toàn bộ các khoản chi tiêu thực tế (tiệc tùng, may đồng phục, tri ân thầy cô, hiếu hỷ Điều 3...) kèm ảnh chụp hóa đơn chứng từ thực tế.',
      details: [
        'Xem công khai Sổ Thu và Sổ Chi của quỹ lớp',
        'Bấm vào từng khoản chi để mở xem ảnh hóa đơn chứng từ trên Drive',
        'Thống kê tồn quỹ, tổng thu và tổng chi rõ ràng từng mốc thời gian',
        'Chuẩn hóa theo Điều 3 & 4 Quy Chế Lớp K8A1'
      ],
      actionLabel: 'Xem Quy Chế Lớp (Điều 3 & 4)',
      actionIcon: Scale,
      actionFn: () => { if (onOpenCharterModal) onOpenCharterModal(); },
      keywords: ['sổ quỹ', 'thu chi', 'minh bạch', 'hóa đơn', 'chứng từ', 'quy chế', 'điều 3', 'điều 4', 'tài chính']
    },
    {
      id: 'm-wishes',
      badge: 'Gắn Kết',
      badgeColor: 'bg-rose-100 text-rose-800',
      icon: HeartHandshake,
      iconColor: 'text-rose-600',
      title: '5. Lưu Bút & Tri Ân Thầy Cô Giáo',
      description:
        'Không gian chia sẻ kỷ niệm, viết lời chúc và tri ân các thầy cô giáo bộ môn. Các bạn học có thể thả tim bài viết của nhau, xem lại danh sách thầy cô chủ nhiệm và bộ môn qua các năm.',
      details: [
        'Gửi tâm tình, hồi ức thanh xuân tuổi học trò',
        'Tương tác thả tim, bình luận lời chúc của bạn bè',
        'Góc tri ân thầy cô giáo với hình ảnh và lời dạy ngày xưa'
      ],
      actionLabel: 'Viết Lưu Bút',
      actionIcon: ChevronRight,
      actionFn: () => handleJump('luu-but'),
      keywords: ['lưu bút', 'thầy cô', 'lời chúc', 'kỷ niệm', 'tri ân', 'hoa niên', 'thanh xuân']
    },
    {
      id: 'm-media',
      badge: 'Thanh Xuân',
      badgeColor: 'bg-amber-100 text-amber-800',
      icon: Camera,
      iconColor: 'text-amber-600',
      title: '6. Thước Phim & Kỷ Niệm Xưa',
      description:
        'Thưởng thức kho ảnh kỷ yếu, ảnh dã ngoại thời áo trắng và video phóng sự kỷ niệm. Bạn cũng có thể tải thêm những bức ảnh cũ còn lưu giữ trong máy cá nhân lên kho lưu trữ chung của lớp.',
      details: [
        'Xem kho ảnh kỷ yếu và ảnh thời học trò',
        'Xem video kỷ niệm và phóng sự 20 năm',
        'Tự tải ảnh cá nhân thời đi học lên kho ảnh chung của lớp'
      ],
      actionLabel: 'Mở Kho Ảnh & Video',
      actionIcon: ChevronRight,
      actionFn: () => handleJump('ky-uc'),
      keywords: ['kho ảnh', 'video', 'kỷ niệm', 'thước phim', 'dã ngoại', 'kỷ yếu', 'ảnh cũ']
    }
  ];

  // TAB 2: BAN LIÊN LẠC (BLL)
  const bllCards: GuideCard[] = [
    {
      id: 'bll-checkin',
      badge: 'Lễ Tân',
      badgeColor: 'bg-indigo-100 text-indigo-800',
      icon: CheckCircle2,
      iconColor: 'text-indigo-600',
      title: '1. Tiếp Đón & Check-in Sự Kiện',
      description:
        'Tại các buổi gặp mặt hoặc sự kiện họp lớp, Ban Liên Lạc mở Hub Quản Trị > Tab Danh Sách. Khi bạn bè có mặt, bấm nút "ĐÃ ĐẾN" hoặc dùng camera điện thoại quét mã QR trên Thẻ Kỷ Niệm (Golden Pass) của bạn học để xác nhận sĩ số có mặt theo thời gian thực.',
      details: [
        'Nút bấm "ĐÃ ĐẾN" tức thì ngay trên dòng danh bạ',
        'Tính năng quét mã QR Golden Pass trên điện thoại của bạn học',
        'Tự động thống kê số bạn Đã Có Mặt / Tổng Số Xác Nhận Đi trên thanh KPI',
        'Phục vụ công tác sắp xếp bàn tiệc và phát kỷ niệm chương'
      ],
      actionLabel: 'Mở Cổng Lễ Tân & Điểm Danh',
      actionIcon: Users,
      actionFn: () => handleOpenHubTab('members'),
      keywords: ['tiếp đón', 'check in', 'lễ tân', 'đã đến', 'quét qr', 'sự kiện', 'gặp mặt', 'có mặt']
    },
    {
      id: 'bll-roster',
      badge: 'Kết Nối',
      badgeColor: 'bg-indigo-100 text-indigo-800',
      icon: Users,
      iconColor: 'text-indigo-600',
      title: '2. Đôn Đốc Sĩ Số & Báo Danh Hộ',
      description:
        'Theo dõi tiến độ phản hồi của toàn bộ 65 bạn học K8A1: phân loại rõ bạn nào Đã xác nhận, bạn nào Báo bận, bạn nào Chưa phản hồi. Với những bạn bận công việc hoặc không tiện thao tác Web, BLL có thể bấm "Thêm / Báo danh hộ" để cập nhật sĩ số và size áo giúp bạn.',
      details: [
        'Lọc nhanh danh sách: Đã xác nhận đi / Báo bận / Chưa phản hồi',
        'Chức năng "Báo danh hộ": Nhập thông tin, size áo thay cho bạn học',
        'Nhấn gọi điện thoại hoặc gửi tin nhắn Zalo trực tiếp từ danh bạ Web',
        'Đảm bảo không bỏ sót bất kỳ thành viên nào trong các sự kiện chung'
      ],
      actionLabel: 'Xem Sĩ Số & Danh Bạ',
      actionIcon: ChevronRight,
      actionFn: () => handleOpenHubTab('members'),
      keywords: ['đôn đốc', 'báo danh hộ', 'danh bạ', '65 bạn', 'sĩ số', 'liên lạc', 'zalo', 'gọi điện']
    },
    {
      id: 'bll-charter',
      badge: 'Điều 3 Quy Chế',
      badgeColor: 'bg-indigo-100 text-indigo-800',
      icon: HeartHandshake,
      iconColor: 'text-indigo-600',
      title: '3. Chăm Lo Việc Hiếu, Việc Hỷ & Thăm Hỏi Ốm Đau',
      description:
        'Ban Liên Lạc là đầu mối thông tin khi trong lớp có việc hiếu, việc hỷ hoặc bạn học ốm đau tai nạn. BLL có trách nhiệm thông báo lên nhóm lớp và đại diện tập thể tổ chức phúng viếng, chúc mừng theo định mức chuẩn quy định tại Điều 3 Quy Chế Lớp.',
      details: [
        'Việc Hiếu / Việc Hỷ: Định mức chi 500.000 đ (tứ thân phụ mẫu, bản thân thành viên và con đẻ)',
        'Thăm hỏi ốm đau / rủi ro: Định mức chi 300.000 đ (nằm viện hoặc tai nạn lớn)',
        'Đầu mối liên hệ với gia đình và phối hợp cùng Thủ Quỹ xuất quỹ kịp thời',
        'Đăng tin thông báo tình hình tới tập thể lớp trên Zalo'
      ],
      actionLabel: 'Tra Cứu Quy Chế Lớp',
      actionIcon: Scale,
      actionFn: () => { if (onOpenCharterModal) onOpenCharterModal(); },
      keywords: ['hiếu hỷ', 'thăm hỏi', 'ốm đau', 'phúng viếng', 'điều 3', 'quy chế', '500k', '300k', 'chăm lo']
    },
    {
      id: 'bll-audit',
      badge: 'Giám Sát',
      badgeColor: 'bg-indigo-100 text-indigo-800',
      icon: Shield,
      iconColor: 'text-indigo-600',
      title: '4. Giám Sát Đối Soát Chéo Quỹ Lớp',
      description:
        'Ban Liên Lạc có quyền xem toàn bộ sổ thu chi và hình ảnh hóa đơn chứng từ trên Google Drive ở chế độ an toàn (Read-Only) để giám sát đối soát chéo, bảo đảm tính minh bạch, khách quan và bảo vệ uy tín cho Thủ Quỹ.',
      details: [
        'Xem chi tiết từng khoản thu và khoản chi của Thủ Quỹ',
        'Mở xem hóa đơn đỏ, biên nhận lưu trữ trên Google Drive',
        'Đóng vai trò nhân chứng đối soát độc lập trong các kỳ báo cáo tài chính'
      ],
      actionLabel: 'Giám Sát Sổ Quỹ Lớp',
      actionIcon: Coins,
      actionFn: () => handleOpenHubTab('fund'),
      keywords: ['giám sát', 'đối soát chéo', 'sổ quỹ', 'hóa đơn', 'minh bạch', 'an toàn', 'khách quan']
    }
  ];

  // TAB 3: THỦ QUỸ LỚP (TREASURER)
  const treasurerCards: GuideCard[] = [
    {
      id: 't-verify',
      badge: 'Duyệt Thu',
      badgeColor: 'bg-emerald-100 text-emerald-800',
      icon: FileCheck,
      iconColor: 'text-emerald-600',
      title: '1. Quy Trình Đối Soát & Soi Biên Lai Đóng Quỹ',
      description:
        'Tại Tab Quỹ Lớp trong Hub Quản Trị, những bạn học đã tải biên lai chuyển khoản sẽ có icon kẹp ghim 📎. Thủ Quỹ bấm vào để mở Lightbox zoom soi chi tiết ảnh chụp màn hình chuyển khoản trên Google Drive. Sau khi đối chiếu số dư tài khoản ngân hàng, bấm "Xác Nhận Đã Đóng". Hệ thống tự động ghi nhận tên người duyệt để lưu vết trách nhiệm.',
      details: [
        'Icon kẹp ghim 📎 đánh dấu thành viên đã nộp ảnh biên lai',
        'Lightbox phóng to/thu nhỏ ảnh biên lai trực tiếp trên màn hình',
        'Nút "Xác Nhận Đã Đóng" 1 chạm, tự động lưu tên người duyệt',
        'Tự động đồng bộ trạng thái thanh toán lên Google Sheet'
      ],
      actionLabel: 'Mở Cổng Duyệt Thu Quỹ',
      actionIcon: Coins,
      actionFn: () => handleOpenHubTab('fund'),
      keywords: ['đối soát', 'soi biên lai', 'lightbox', 'duyệt thu', 'xác nhận đã đóng', 'số dư ngân hàng', 'kẹp ghim']
    },
    {
      id: 't-income',
      badge: 'Sổ Thu',
      badgeColor: 'bg-emerald-100 text-emerald-800',
      icon: Coins,
      iconColor: 'text-emerald-600',
      title: '2. Quản Lý Sổ Thu Đa Danh Mục (Sheet Khoan_Thu)',
      description:
        'Ghi nhận các nguồn thu linh hoạt ngoài đóng góp sự kiện: Quỹ thường niên duy trì hàng năm, đóng góp tự nguyện của mạnh thường quân, tiền tài trợ hoặc bán đồ lưu niệm... Tất cả được phân loại chuẩn và lưu trực tiếp vào Google Sheet tab Khoan_Thu.',
      details: [
        'Phân loại nguồn thu: Quỹ thường niên, Đóng góp sự kiện, Tài trợ, Khác',
        'Ghi rõ họ tên người nộp, số tiền, ngày thu, hình thức chuyển khoản/tiền mặt',
        'Tự động cộng dồn vào Tổng Thu quỹ lớp dài hạn'
      ],
      actionLabel: 'Mở Sổ Thu Quỹ',
      actionIcon: ChevronRight,
      actionFn: () => handleOpenHubTab('fund'),
      keywords: ['sổ thu', 'khoan_thu', 'thường niên', 'mạnh thường quân', 'tài trợ', 'nguồn thu', 'đóng góp']
    },
    {
      id: 't-expense',
      badge: 'Sổ Chi',
      badgeColor: 'bg-emerald-100 text-emerald-800',
      icon: Upload,
      iconColor: 'text-emerald-600',
      title: '3. Quản Lý Sổ Chi & Tải Hóa Đơn Lên Drive',
      description:
        'Mọi khoản chi tiêu (tiệc, cọc địa điểm, in ấn áo đồng phục, quà kỷ niệm, hiếu hỷ Điều 3, tri ân thầy cô Điều 4...) đều được phân loại danh mục và bắt buộc đính kèm ảnh chụp hóa đơn chứng từ. Ảnh được tự động tải lên thư mục Google Drive ChungTu_QuyLop_K8A1 và tạo link công khai cho cả lớp xem.',
      details: [
        'Phân loại chi: Tiệc & Gặp mặt, Áo & Đồng phục, Quà tặng, Hiếu hỷ Điều 3, Tri ân thầy cô Điều 4, Khác',
        'Tải ảnh hóa đơn đỏ, biên nhận hoặc ảnh chuyển khoản thanh toán',
        'File tự động lưu vào Google Drive folder ChungTu_QuyLop_K8A1 với tên chuẩn',
        'Quyền chỉnh sửa, cập nhật thông tin chứng từ khi cần thiết'
      ],
      actionLabel: 'Mở Sổ Chi Tiêu Quỹ',
      actionIcon: ChevronRight,
      actionFn: () => handleOpenHubTab('fund'),
      keywords: ['sổ chi', 'khoan_chi', 'chi tiêu', 'hóa đơn', 'chứng từ', 'google drive', 'ChungTu_QuyLop_K8A1', 'upload']
    },
    {
      id: 't-export',
      badge: 'Báo Cáo',
      badgeColor: 'bg-emerald-100 text-emerald-800',
      icon: FileSpreadsheet,
      iconColor: 'text-emerald-600',
      title: '4. Xuất Báo Cáo Sao Kê Tài Chính (CSV/Excel)',
      description:
        'Bấm nút "Xuất Báo Cáo (CSV)" tại Hub Quản Trị để tải toàn bộ bảng sao kê thu - chi chi tiết, sẵn sàng gửi vào nhóm Zalo lớp sau mỗi sự kiện hoặc định kỳ cuối năm.',
      details: [
        'Xuất file CSV chuẩn UTF-8 tương thích 100% với Microsoft Excel',
        'Bao gồm đầy đủ cột: Ngày, Người nộp/chi, Nội dung, Số tiền, Người duyệt, Link chứng từ Drive',
        'Tiện lợi gửi file vào nhóm Zalo lớp để báo cáo định kỳ'
      ],
      actionLabel: 'Đến Mục Xuất Sao Kê',
      actionIcon: ChevronRight,
      actionFn: () => handleOpenHubTab('fund'),
      keywords: ['xuất báo cáo', 'csv', 'excel', 'sao kê', 'zalo', 'tài chính', 'tổng kết']
    }
  ];

  // TAB 4: BAN QUẢN TRỊ / KỸ THUẬT (ADMIN)
  const adminCards: GuideCard[] = [
    {
      id: 'a-roster',
      badge: 'Danh Bạ',
      badgeColor: 'bg-rose-100 text-rose-800',
      icon: Users,
      iconColor: 'text-rose-600',
      title: '1. Quản Trị Danh Bạ 65 Bạn Học (Sheet Danh_Sach_Lop)',
      description:
        'Thêm mới, sửa thông tin bạn học, cập nhật số điện thoại, nơi ở hiện tại, chức vụ ban cán sự. Toàn bộ thay đổi đồng bộ 2 chiều tức thì với Google Sheet tab Danh_Sach_Lop.',
      details: [
        'Quản trị sĩ số lớp (chuẩn hóa 65 bạn học)',
        'Cập nhật số điện thoại, nơi sinh sống (Thái Nguyên, Hà Nội, TP.HCM, nước ngoài...)',
        'Phân quyền chức vụ ban cán sự (Lớp trưởng, Bí thư, Thủ quỹ, Thành viên)',
        'Đồng bộ 2 chiều tức thì với Google Sheets'
      ],
      actionLabel: 'Quản Trị Danh Bạ 65 Bạn',
      actionIcon: Users,
      actionFn: () => handleOpenHubTab('members'),
      keywords: ['danh bạ', '65 bạn', 'thêm bạn', 'sửa thông tin', 'ban cán sự', 'Danh_Sach_Lop', 'sĩ số']
    },
    {
      id: 'a-config',
      badge: 'Dài Hạn',
      badgeColor: 'bg-rose-100 text-rose-800',
      icon: Calendar,
      iconColor: 'text-rose-600',
      title: '2. Cấu Hình Sự Kiện Linh Hoạt Cho Tương Lai (Sheet Cau_Hinh)',
      description:
        'Khi lớp tổ chức các sự kiện tiếp theo (Gặp mặt 2027, Họp lớp 25 năm, dã ngoại hè...), Admin chỉ cần vào Tab Cài Đặt để đổi tên sự kiện, thời gian, địa điểm, link Google Maps, kinh phí dự kiến và tài khoản ngân hàng nhận tiền. Giao diện WebApp sẽ tự động cập nhật toàn bộ theo sự kiện mới mà không cần lập trình lại code!',
      details: [
        'Đổi tên sự kiện, thư ngỏ và khẩu hiệu họp lớp',
        'Cập nhật ngày giờ, tên địa điểm tổ chức mới và link Google Maps',
        'Thiết lập mức kinh phí dự kiến thu mỗi người',
        'Thay đổi số tài khoản ngân hàng và cú pháp chuyển tiền VietQR',
        'Không cần viết lại code, dữ liệu lưu vĩnh viễn trên Google Sheet Cau_Hinh'
      ],
      actionLabel: 'Mở Cài Đặt Sự Kiện',
      actionIcon: Crown,
      actionFn: () => handleOpenHubTab('settings'),
      keywords: ['cấu hình', 'sự kiện mới', 'tương lai', 'địa điểm', 'thời gian', 'kinh phí', 'google maps', 'Cau_Hinh', 'họp lớp']
    },
    {
      id: 'a-media',
      badge: 'Hình Ảnh',
      badgeColor: 'bg-rose-100 text-rose-800',
      icon: Camera,
      iconColor: 'text-rose-600',
      title: '3. Quản Trị Hero Banner & Kho Video Phóng Sự',
      description:
        'Tải ảnh bìa mới lên Google Drive, dán link vào hệ thống và kéo thanh trượt định vị khung hình (trục Y từ 0% đến 100%) để ảnh luôn hiển thị đẹp nhất trên cả điện thoại và máy tính. Quản lý danh sách video YouTube kỷ niệm.',
      details: [
        'Thay đổi ảnh bìa sự kiện mới trực tiếp trên giao diện',
        'Thanh trượt định vị hiển thị trục Y (0 - 100%) tránh bị cắt mặt',
        'Thêm / sửa danh sách video YouTube phóng sự kỷ niệm',
        'Tự động lưu vào Google Sheet và bộ nhớ thiết bị'
      ],
      actionLabel: 'Quản Trị Banner & Video',
      actionIcon: ChevronRight,
      actionFn: () => handleOpenHubTab('media'),
      keywords: ['hero banner', 'ảnh bìa', 'video', 'trục y', 'slider', 'media', 'drive', 'youtube']
    },
    {
      id: 'a-security',
      badge: 'Bảo Mật',
      badgeColor: 'bg-rose-100 text-rose-800',
      icon: Lock,
      iconColor: 'text-rose-600',
      title: '4. Đổi Mã PIN Bảo Mật & Dọn Dẹp Dữ Liệu',
      description:
        'Đổi mã PIN định kỳ cho cả 3 vai trò (BLL, Thủ Quỹ, Admin) trực tiếp trên Web. Mã PIN được mã hóa SHA-256 an toàn lưu trên Google Sheet tab Bao_Mat_PIN. Sử dụng công cụ Deduplicate để dọn sạch các bản ghi gửi trùng lặp nếu có.',
      details: [
        'Đổi mã PIN cho từng vai trò ngay tại Tab Cài Đặt',
        'Mã hóa bảo mật SHA-256 một chiều trên Google Sheet tab Bao_Mat_PIN',
        'Công cụ Deduplicate loại bỏ các bản ghi gửi trùng',
        'Kiểm tra kết nối và tính sẵn sàng của Google Apps Script WebApp'
      ],
      actionLabel: 'Mở Cài Đặt Bảo Mật',
      actionIcon: ChevronRight,
      actionFn: () => handleOpenHubTab('settings'),
      keywords: ['đổi pin', 'bảo mật', 'sha-256', 'deduplicate', 'trùng lặp', 'Bao_Mat_PIN', 'kỹ thuật']
    }
  ];

  // Helper lọc danh sách card theo từ khóa tìm kiếm
  const filterCards = (cards: GuideCard[]) => {
    if (!searchQuery.trim()) return cards;
    const q = searchQuery.toLowerCase().trim();
    return cards.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.keywords.some((k) => k.toLowerCase().includes(q)) ||
        (c.details && c.details.some((d) => d.toLowerCase().includes(q)))
    );
  };

  const filteredMemberCards = useMemo(() => filterCards(memberCards), [searchQuery]);
  const filteredBllCards = useMemo(() => filterCards(bllCards), [searchQuery]);
  const filteredTreasurerCards = useMemo(() => filterCards(treasurerCards), [searchQuery]);
  const filteredAdminCards = useMemo(() => filterCards(adminCards), [searchQuery]);

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
                  Hướng dẫn công khai toàn diện quy trình vận hành, thẩm quyền và cách sử dụng cho từng vai trò
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
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
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
          {/* TAB ĐIỀU HƯỚNG THEO VAI TRÒ (CÔNG KHAI 100% - KHÔNG CÓ ICON KHÓA) */}
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

                {/* Danh sách thẻ hướng dẫn */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredMemberCards.map((card) => {
                    const Icon = card.icon;
                    const ActionIcon = card.actionIcon;
                    return (
                      <div
                        key={card.id}
                        className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:border-amber-300 transition space-y-3 flex flex-col justify-between"
                      >
                        <div className="space-y-2.5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 font-bold text-slate-900 text-xs sm:text-sm">
                              <Icon className={`w-4 h-4 ${card.iconColor}`} />
                              <span>{card.title}</span>
                            </div>
                            {card.badge && (
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${card.badgeColor}`}>
                                {card.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-600 leading-relaxed">{card.description}</p>
                          {card.details && (
                            <ul className="space-y-1 text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                              {card.details.map((d, i) => (
                                <li key={i} className="flex items-start gap-1.5">
                                  <span className="text-amber-500 font-bold">•</span>
                                  <span>{d}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>

                        {card.actionLabel && card.actionFn && (
                          <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                            <button
                              onClick={card.actionFn}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-xs cursor-pointer transition"
                            >
                              <span>{card.actionLabel}</span>
                              {ActionIcon && <ActionIcon className="w-3 h-3" />}
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 2: BAN LIÊN LẠC (BLL) - CÔNG KHAI 100% */}
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
                        Quy Trình Nghiệp Vụ Của Ban Liên Lạc (BLL)
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-600 mt-1">
                        Ban Liên Lạc là cầu nối gắn kết 65 bạn học K8A1, điều phối các buổi họp mặt định kỳ, đón tiếp bạn bè và phụ trách công tác hiếu hỷ, thăm hỏi ốm đau theo Điều 3 Quy Chế.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Ghi chú bảo mật nhẹ nhàng, không chặn xem nội dung */}
                <div className="p-3.5 rounded-xl bg-indigo-50/80 border border-indigo-200/80 text-indigo-950 text-xs flex items-start gap-2.5">
                  <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-semibold">
                      Toàn bộ quy trình tác nghiệp của BLL được công khai minh bạch để cả lớp cùng nắm rõ.
                    </p>
                    <p className="text-[11px] text-indigo-800/90 leading-relaxed">
                      Để thực hiện các thao tác quản trị trực tiếp (bấm điểm danh, báo danh hộ), thành viên phụ trách xác thực mã PIN Ban Liên Lạc. Mã PIN được Ban Tổ Chức bàn giao riêng qua tin nhắn.
                    </p>
                  </div>
                </div>

                {/* Danh sách thẻ hướng dẫn BLL */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredBllCards.map((card) => {
                    const Icon = card.icon;
                    const ActionIcon = card.actionIcon;
                    return (
                      <div
                        key={card.id}
                        className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:border-indigo-300 transition space-y-3 flex flex-col justify-between"
                      >
                        <div className="space-y-2.5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 font-bold text-indigo-950 text-xs sm:text-sm">
                              <Icon className={`w-4 h-4 ${card.iconColor}`} />
                              <span>{card.title}</span>
                            </div>
                            {card.badge && (
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${card.badgeColor}`}>
                                {card.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-600 leading-relaxed">{card.description}</p>
                          {card.details && (
                            <ul className="space-y-1 text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                              {card.details.map((d, i) => (
                                <li key={i} className="flex items-start gap-1.5">
                                  <span className="text-indigo-500 font-bold">•</span>
                                  <span>{d}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>

                        {card.actionLabel && card.actionFn && (
                          <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                            <button
                              onClick={card.actionFn}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs cursor-pointer transition"
                            >
                              <span>{card.actionLabel}</span>
                              {ActionIcon && <ActionIcon className="w-3 h-3" />}
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Thanh điều hướng thao tác nhanh */}
                <div className="p-4 rounded-2xl bg-white border border-indigo-200/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 text-indigo-900 font-medium">
                    <Shield className="w-4 h-4 text-indigo-600" />
                    <span>Lối tắt truy cập các phân hệ điều hành BLL:</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => handleOpenHubTab('members')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold cursor-pointer transition shadow-xs"
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>Cổng Lễ Tân & Danh Bạ</span>
                    </button>
                    <button
                      onClick={() => handleOpenHubTab('fund')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-indigo-50 text-indigo-900 border border-indigo-300 font-bold cursor-pointer transition"
                    >
                      <Coins className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Sổ Quỹ Đối Soát</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: THỦ QUỸ LỚP (TREASURER) - CÔNG KHAI 100% */}
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
                        Quy Trình Nghiệp Vụ Thủ Quỹ & Quản Trị Sổ Quỹ K8A1
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-600 mt-1">
                        Thủ Quỹ chịu trách nhiệm toàn diện về dòng tiền tập thể: duyệt đóng quỹ, soi biên lai chứng từ trên Google Drive, ghi nhận Sổ Thu / Sổ Chi và xuất báo cáo sao kê định kỳ.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Ghi chú nhẹ nhàng */}
                <div className="p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200/80 text-emerald-950 text-xs flex items-start gap-2.5">
                  <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-semibold">
                      Toàn bộ quy trình thu chi được công khai minh bạch để mọi thành viên cùng giám sát.
                    </p>
                    <p className="text-[11px] text-emerald-800/90 leading-relaxed">
                      Để thực hiện thao tác duyệt thu, thêm khoản chi và tải chứng từ hóa đơn, Thủ Quỹ xác thực mã PIN Thủ Quỹ. Mã PIN được Ban Cán Sự bàn giao riêng qua tin nhắn.
                    </p>
                  </div>
                </div>

                {/* Danh sách thẻ hướng dẫn Thủ Quỹ */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredTreasurerCards.map((card) => {
                    const Icon = card.icon;
                    const ActionIcon = card.actionIcon;
                    return (
                      <div
                        key={card.id}
                        className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:border-emerald-300 transition space-y-3 flex flex-col justify-between"
                      >
                        <div className="space-y-2.5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 font-bold text-emerald-950 text-xs sm:text-sm">
                              <Icon className={`w-4 h-4 ${card.iconColor}`} />
                              <span>{card.title}</span>
                            </div>
                            {card.badge && (
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${card.badgeColor}`}>
                                {card.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-600 leading-relaxed">{card.description}</p>
                          {card.details && (
                            <ul className="space-y-1 text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                              {card.details.map((d, i) => (
                                <li key={i} className="flex items-start gap-1.5">
                                  <span className="text-emerald-500 font-bold">•</span>
                                  <span>{d}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>

                        {card.actionLabel && card.actionFn && (
                          <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                            <button
                              onClick={card.actionFn}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs cursor-pointer transition"
                            >
                              <span>{card.actionLabel}</span>
                              {ActionIcon && <ActionIcon className="w-3 h-3" />}
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Thanh điều hướng thao tác nhanh */}
                <div className="p-4 rounded-2xl bg-white border border-emerald-200/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 text-emerald-900 font-medium">
                    <Coins className="w-4 h-4 text-emerald-600" />
                    <span>Lối tắt quản lý nghiệp vụ tài chính:</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => handleOpenHubTab('fund')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer transition shadow-xs"
                    >
                      <Coins className="w-3.5 h-3.5" />
                      <span>Mở Sổ Quỹ Thu - Chi</span>
                    </button>
                    <button
                      onClick={() => { if (onOpenCharterModal) onOpenCharterModal(); }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-emerald-50 text-emerald-900 border border-emerald-300 font-bold cursor-pointer transition"
                    >
                      <Scale className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Định Mức Chi (Điều 3 & 4)</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: BAN QUẢN TRỊ / KỸ THUẬT (ADMIN) - CÔNG KHAI 100% */}
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
                        Nghiệp Vụ Quản Trị Kỹ Thuật & Cấu Hình Dữ Liệu K8A1
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-600 mt-1">
                        Admin nắm toàn quyền hạ tầng số: quản trị danh bạ 65 bạn học, cấu hình linh hoạt các sự kiện trong tương lai (không cần sửa code), quản trị kho ảnh bìa & media, và quản lý mã PIN bảo mật.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Ghi chú nhẹ nhàng */}
                <div className="p-3.5 rounded-xl bg-rose-50/80 border border-rose-200/80 text-rose-950 text-xs flex items-start gap-2.5">
                  <Info className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-semibold">
                      Toàn bộ cấu trúc vận hành kỹ thuật được công khai minh bạch.
                    </p>
                    <p className="text-[11px] text-rose-800/90 leading-relaxed">
                      Để thực hiện các thay đổi cấu hình sự kiện mới, sửa danh bạ hoặc đổi mã PIN hệ thống, Quản Trị Viên xác thực mã PIN Admin. Mã PIN được bàn giao riêng qua tin nhắn nội bộ.
                    </p>
                  </div>
                </div>

                {/* Danh sách thẻ hướng dẫn Admin */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredAdminCards.map((card) => {
                    const Icon = card.icon;
                    const ActionIcon = card.actionIcon;
                    return (
                      <div
                        key={card.id}
                        className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:border-rose-300 transition space-y-3 flex flex-col justify-between"
                      >
                        <div className="space-y-2.5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 font-bold text-rose-950 text-xs sm:text-sm">
                              <Icon className={`w-4 h-4 ${card.iconColor}`} />
                              <span>{card.title}</span>
                            </div>
                            {card.badge && (
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${card.badgeColor}`}>
                                {card.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-600 leading-relaxed">{card.description}</p>
                          {card.details && (
                            <ul className="space-y-1 text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                              {card.details.map((d, i) => (
                                <li key={i} className="flex items-start gap-1.5">
                                  <span className="text-rose-500 font-bold">•</span>
                                  <span>{d}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>

                        {card.actionLabel && card.actionFn && (
                          <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                            <button
                              onClick={card.actionFn}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs cursor-pointer transition"
                            >
                              <span>{card.actionLabel}</span>
                              {ActionIcon && <ActionIcon className="w-3 h-3" />}
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Thanh điều hướng thao tác nhanh */}
                <div className="p-4 rounded-2xl bg-white border border-rose-200/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 text-rose-900 font-medium">
                    <Crown className="w-4 h-4 text-rose-600" />
                    <span>Lối tắt quản trị hệ thống kỹ thuật:</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => handleOpenHubTab('settings')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold cursor-pointer transition shadow-xs"
                    >
                      <Crown className="w-3.5 h-3.5" />
                      <span>Cài Đặt Hệ Thống</span>
                    </button>
                    <button
                      onClick={() => handleOpenHubTab('members')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-rose-50 text-rose-900 border border-rose-300 font-bold cursor-pointer transition"
                    >
                      <Users className="w-3.5 h-3.5 text-rose-600" />
                      <span>Danh Bạ 65 Bạn</span>
                    </button>
                  </div>
                </div>
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
                        Ma Trận Phân Quyền & Quy Chế Hoạt Động K8A1
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-600 mt-1">
                        Bảng so sánh chi tiết thẩm quyền 4 vai trò trên nền tảng số K8A1 và tóm tắt các định mức chi tiêu trọng yếu theo Quy chế lớp.
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
                      onClick={() => { if (onOpenCharterModal) onOpenCharterModal(); }}
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
              <span>Cẩm nang công khai dùng chung cho mọi hoạt động thường niên & sự kiện của Lớp K8A1.</span>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                onClick={() => { if (onOpenCharterModal) onOpenCharterModal(); }}
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
