import { RsvpData, WishData, MemoryImage, MemoryVideo, TimelineMilestone, QuizQuestion, PollItem, ScheduleItem, SponsorItem, EventConfig, ClassMember } from './types';

export const INITIAL_RSVP_LIST: RsvpData[] = [
  {
    id: '1',
    fullName: 'Nguyễn Tuấn Anh',
    nickname: 'Tuấn Báo',
    phone: '0988123456',
    status: 'yes',
    className: 'K8A1',
    shirtSize: 'L',
    message: 'Chắc chắn có mặt! Nhớ anh em bàn cuối lắm rồi!',
    submittedAt: '01/09/2026 09:15',
    checkedIn: false,
    fundStatus: 'paid',
    fundAmount: 500000,
    fundPaymentMethod: 'bank_transfer',
    fundPaidAt: '01/09/2026 09:30',
    fundReceiptUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80',
    fundAuditedBy: 'Thủ Quỹ BLL',
    fundNote: 'Đã chuyển khoản Vietcombank (Mã GD: VCB-892134)'
  },
  {
    id: '2',
    fullName: 'Trần Thị Thanh Hương',
    nickname: 'Hương Béo',
    phone: '0912345678',
    status: 'yes',
    className: 'K8A1',
    shirtSize: 'M',
    message: 'Hẹn gặp cả lớp, gửi đứa nào hay giấu dép ngày xưa chuẩn bị tinh thần nha 😆',
    submittedAt: '01/09/2026 10:30',
    checkedIn: false,
    fundStatus: 'paid',
    fundAmount: 500000,
    fundPaymentMethod: 'bank_transfer',
    fundPaidAt: '01/09/2026 10:45',
    fundAuditedBy: 'Thủ Quỹ BLL',
    fundNote: 'Thủ quỹ lớp đã xác nhận qua MB Bank'
  },
  {
    id: '3',
    fullName: 'Lê Hoàng Nam',
    nickname: 'Nam Còi',
    phone: '0977889900',
    status: 'yes',
    className: 'K8A1',
    shirtSize: 'XL',
    message: 'Đã đặt vé bay từ Sài Gòn ra Thái Nguyên, hẹn gặp lại tất cả!',
    submittedAt: '02/09/2026 14:20',
    checkedIn: false,
    fundStatus: 'paid',
    fundAmount: 1000000,
    fundPaymentMethod: 'bank_transfer',
    fundPaidAt: '02/09/2026 14:35',
    fundReceiptUrl: 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?auto=format&fit=crop&w=800&q=80',
    fundAuditedBy: 'Admin',
    fundNote: 'Đóng 500k + Ủng hộ thêm quỹ lớp 500k'
  },
  {
    id: '4',
    fullName: 'Phạm Đức Thắng',
    nickname: 'Thắng Đầu Gấu',
    phone: '0903112233',
    status: 'yes',
    className: 'K8A1',
    shirtSize: 'L',
    message: 'Không say không về nhé anh em!',
    submittedAt: '02/09/2026 16:45',
    checkedIn: false,
    fundStatus: 'unpaid',
    fundAmount: 0,
    fundPaymentMethod: 'cash',
    fundNote: 'Hẹn đóng trực tiếp tại bàn lễ tân Crown Palace'
  },
  {
    id: '5',
    fullName: 'Vũ Mai Phương',
    nickname: 'Phương Mèo',
    phone: '0966554433',
    status: 'yes',
    className: 'K8A1',
    shirtSize: 'S',
    message: 'Rất mong chờ ngày gặp lại mọi người sau 20 năm.',
    submittedAt: '03/09/2026 08:10',
    checkedIn: false,
    fundStatus: 'paid',
    fundAmount: 500000,
    fundPaymentMethod: 'bank_transfer',
    fundPaidAt: '03/09/2026 08:25',
    fundAuditedBy: 'Thủ Quỹ BLL',
    fundNote: 'Đã chuyển khoản Techcombank'
  },
  {
    id: '6',
    fullName: 'Đỗ Hoàng Long',
    nickname: 'Long Keu',
    phone: '0988123456',
    status: 'yes',
    className: 'K8A1',
    shirtSize: 'XL',
    message: 'Đã hoàn thành chuyển khoản 500k tạm ứng cho Ban Tổ Chức!',
    submittedAt: '04/09/2026 15:20',
    checkedIn: false,
    fundStatus: 'pending',
    fundAmount: 500000,
    fundPaymentMethod: 'bank_transfer',
    fundPaidAt: '04/09/2026 15:25',
    fundReceiptUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80',
    fundNote: 'Thành viên vừa tải lên bill qua App, chờ Ban Liên Lạc đối soát'
  }
];

// Danh sách sĩ số chính thức K8A1 THPT Thái Nguyên (2003 - 2006)
// Dùng làm nguồn chuẩn (Master Roster) giúp thành viên chọn nhanh tên mình, chống gõ sai và chống trùng lặp
export const CLASS_ROSTER_K8A1: ClassMember[] = [
  { id: 'm01', fullName: 'Nguyễn Tuấn Anh', nickname: 'Tuấn Báo', phone: '0988123456', role: 'Bí thư', gender: 'male', shirtSize: 'L' },
  { id: 'm02', fullName: 'Trần Thị Thanh Hương', nickname: 'Hương Béo', phone: '0912345678', role: 'Lớp phó', gender: 'female', shirtSize: 'M' },
  { id: 'm03', fullName: 'Lê Hoàng Nam', nickname: 'Nam Còi', phone: '0977889900', role: 'Thành viên', gender: 'male', shirtSize: 'XL' },
  { id: 'm04', fullName: 'Phạm Đức Thắng', nickname: 'Thắng Đầu Gấu', phone: '0903112233', role: 'Thành viên', gender: 'male', shirtSize: 'L' },
  { id: 'm05', fullName: 'Vũ Mai Phương', nickname: 'Phương Mèo', phone: '0966554433', role: 'Thủ quỹ', gender: 'female', shirtSize: 'S' },
  { id: 'm06', fullName: 'Đỗ Hoàng Long', nickname: 'Long Kều', phone: '0919337588', role: 'Ban Liên Lạc (Admin)', gender: 'male', shirtSize: 'XL' },
  { id: 'm07', fullName: 'Nguyễn Thái Bảo', nickname: 'Bảo Cận', role: 'Lớp trưởng', gender: 'male', shirtSize: 'L' },
  { id: 'm08', fullName: 'Bùi Quang Huy', nickname: 'Huy Lắc', role: 'Thành viên', gender: 'male', shirtSize: 'L' },
  { id: 'm09', fullName: 'Hoàng Văn Hải', nickname: 'Hải Bánh', role: 'Thành viên', gender: 'male', shirtSize: 'M' },
  { id: 'm10', fullName: 'Đặng Thùy Dung', nickname: 'Dung Điệu', role: 'Thành viên', gender: 'female', shirtSize: 'M' },
  { id: 'm11', fullName: 'Lê Thu Trang', nickname: 'Trang Ốc', role: 'Thành viên', gender: 'female', shirtSize: 'S' },
  { id: 'm12', fullName: 'Nguyễn Minh Đức', nickname: 'Đức Còi', role: 'Thành viên', gender: 'male', shirtSize: 'M' },
  { id: 'm13', fullName: 'Phạm Thùy Linh', nickname: 'Linh Nhím', role: 'Thành viên', gender: 'female', shirtSize: 'S' },
  { id: 'm14', fullName: 'Dương Quốc Toàn', nickname: 'Toàn Xoăn', role: 'Thành viên', gender: 'male', shirtSize: 'XL' },
  { id: 'm15', fullName: 'Vũ Tuấn Dũng', nickname: 'Dũng Béo', role: 'Thành viên', gender: 'male', shirtSize: '2XL' },
  { id: 'm16', fullName: 'Trần Phương Thảo', nickname: 'Thảo Xinh', role: 'Thành viên', gender: 'female', shirtSize: 'M' },
  { id: 'm17', fullName: 'Ngô Quang Vinh', nickname: 'Vinh Râu', role: 'Thành viên', gender: 'male', shirtSize: 'L' },
  { id: 'm18', fullName: 'Đoàn Thị Bích Ngọc', nickname: 'Ngọc Nấm', role: 'Thành viên', gender: 'female', shirtSize: 'S' },
  { id: 'm19', fullName: 'Trịnh Văn Quân', nickname: 'Quân Tàu', role: 'Thành viên', gender: 'male', shirtSize: 'L' },
  { id: 'm20', fullName: 'Đinh Hoàng Yến', nickname: 'Yến Phụng', role: 'Thành viên', gender: 'female', shirtSize: 'M' },
  { id: 'm21', fullName: 'Phan Minh Trí', nickname: 'Trí Rùa', role: 'Thành viên', gender: 'male', shirtSize: 'M' },
  { id: 'm22', fullName: 'Mai Anh Tuấn', nickname: 'Tuấn Đen', role: 'Thành viên', gender: 'male', shirtSize: 'L' },
  { id: 'm23', fullName: 'Đỗ Thúy Hằng', nickname: 'Hằng Nga', role: 'Thành viên', gender: 'female', shirtSize: 'S' },
  { id: 'm24', fullName: 'Hà Việt Cường', nickname: 'Cường Đôla', role: 'Thành viên', gender: 'male', shirtSize: 'XL' },
  { id: 'm25', fullName: 'Tạ Thị Thu Hà', nickname: 'Hà Mít', role: 'Thành viên', gender: 'female', shirtSize: 'M' },
  { id: 'm26', fullName: 'Lưu Đức Trọng', nickname: 'Trọng Kính', role: 'Thành viên', gender: 'male', shirtSize: 'L' },
  { id: 'm27', fullName: 'Đào Diệu Linh', nickname: 'Linh Tít', role: 'Thành viên', gender: 'female', shirtSize: 'S' },
  { id: 'm28', fullName: 'Lý Tuấn Phong', nickname: 'Phong Gió', role: 'Thành viên', gender: 'male', shirtSize: 'L' },
  { id: 'm29', fullName: 'Chu Thị Mai Anh', nickname: 'Mai Hoa', role: 'Thành viên', gender: 'female', shirtSize: 'M' },
  { id: 'm30', fullName: 'Dương Đình Khoa', nickname: 'Khoa Học', role: 'Thành viên', gender: 'male', shirtSize: 'L' },
  { id: 'm31', fullName: 'Phùng Thị Kim Oanh', nickname: 'Oanh Vàng', role: 'Thành viên', gender: 'female', shirtSize: 'S' },
  { id: 'm32', fullName: 'Lương Việt Hưng', nickname: 'Hưng Híp', role: 'Thành viên', gender: 'male', shirtSize: 'M' },
  { id: 'm33', fullName: 'Bùi Thu Hương', nickname: 'Hương Mây', role: 'Thành viên', gender: 'female', shirtSize: 'M' },
  { id: 'm34', fullName: 'Nguyễn Xuân Kiên', nickname: 'Kiên Nhẫn', role: 'Thành viên', gender: 'male', shirtSize: 'XL' },
  { id: 'm35', fullName: 'Hoàng Thị Minh Châu', nickname: 'Châu Báu', role: 'Thành viên', gender: 'female', shirtSize: 'S' },
  { id: 'm36', fullName: 'Phạm Ngọc Long', nickname: 'Long Nhỏ', role: 'Thành viên', gender: 'male', shirtSize: 'M' },
  { id: 'm37', fullName: 'Lê Thị Quỳnh Trang', nickname: 'Trang Moon', role: 'Thành viên', gender: 'female', shirtSize: 'M' },
  { id: 'm38', fullName: 'Vũ Trọng Nghĩa', nickname: 'Nghĩa Khí', role: 'Thành viên', gender: 'male', shirtSize: 'L' },
  { id: 'm39', fullName: 'Cao Thị Bích Thủy', nickname: 'Thủy Tiên', role: 'Thành viên', gender: 'female', shirtSize: 'S' },
  { id: 'm40', fullName: 'Triệu Văn Đạt', nickname: 'Đạt Chuẩn', role: 'Thành viên', gender: 'male', shirtSize: 'L' }
];

export const INITIAL_WISHES_LIST: WishData[] = [
  {
    id: 'w1',
    fullName: 'Tuấn Anh (Tổ 1)',
    className: 'K8A1',
    message: 'Nhớ nhất những buổi trốn học bơi sông Cầu với mấy thằng bàn cuối. 20 năm rồi chớp mắt một cái, mong gặp lại anh em đầy đủ!',
    tag: 'bg-amber-100/90 text-amber-900 border-amber-200',
    submittedAt: 'Hôm qua',
    likes: 12,
    isPinned: true
  },
  {
    id: 'w2',
    fullName: 'Thanh Hương (Lớp phó)',
    className: 'K8A1',
    message: 'Mong ngày hội ngộ từng ngày! Gửi đứa nào hồi xưa hay giấu dép với cất bút bi của tôi thì tự giác chuẩn bị nhận tội nhé 😆',
    tag: 'bg-emerald-100/90 text-emerald-900 border-emerald-200',
    submittedAt: 'Hôm nay',
    likes: 18,
    isPinned: false
  },
  {
    id: 'w3',
    fullName: 'Hoàng Nam (Phương xa)',
    className: 'K8A1',
    message: 'Đã chốt vé bay từ Sài Gòn ra Thái Nguyên từ tháng trước. Hẹn gặp cả lớp thân thương, không say không về!',
    tag: 'bg-rose-100/90 text-rose-900 border-rose-200',
    submittedAt: '3 ngày trước',
    likes: 15,
    isPinned: false
  }
];

export const DEFAULT_MEMORIES: MemoryImage[] = [
  {
    id: 'img1',
    url: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=1000&q=80',
    caption: 'Giờ ra chơi năm ấy — Chia nhau từng que kem cổng trường',
    date: 'Tháng 10/2004'
  },
  {
    id: 'img2',
    url: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=1000&q=80',
    caption: 'Hội trại 26/3 năm 2005 — Đêm lửa trại và tiếng đàn guitar mộc',
    date: 'Tháng 03/2005'
  },
  {
    id: 'img3',
    url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1000&q=80',
    caption: 'Góc lớp A1 thân thuộc — Bàn cuối luôn là trung tâm những tiếng cười',
    date: 'Tháng 11/2005'
  },
  {
    id: 'img4',
    url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1000&q=80',
    caption: 'Áo trắng ngày bế giảng — Chi chít nét chữ ký và lưu bút mực tím',
    date: 'Tháng 05/2006'
  },
  {
    id: 'img5',
    url: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1000&q=80',
    caption: 'Giải bóng đá trường — Đội bóng K8A1 vô địch trong lòng người hâm mộ',
    date: 'Tháng 01/2006'
  }
];

export const DEFAULT_VIDEOS: MemoryVideo[] = [
  {
    id: 'vid-1',
    title: 'Phóng Sự Kỷ Niệm: 20 Năm Ngày Trở Về — Lớp K8A1',
    embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
  },
  {
    id: 'vid-2',
    title: 'Giai Điệu Thanh Xuân: Mong Ước Kỷ Niệm Xưa (Niên Khóa 2003 — 2006)',
    embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
  },
  {
    id: 'vid-3',
    title: 'Hội Trại 26/3 & Những Tiếng Hát Dưới Tán Cây Bàng Sân Trường',
    embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
  }
];

export interface BankItem {
  code: string;       // VietQR identifier / short code
  bin: string;        // 6-digit Napas BIN
  shortName: string;  // Display name short (e.g. MB Bank, Vietcombank)
  name: string;       // Official full name
  aliases: string[];  // Synonyms for search & matching
}

export const VIETNAM_BANKS: BankItem[] = [
  {
    code: 'vietcombank',
    bin: '970436',
    shortName: 'Vietcombank (VCB)',
    name: 'Ngân hàng Ngoại thương Việt Nam',
    aliases: ['vcb', 'vietcombank', 'ngoai thuong', '970436']
  },
  {
    code: 'mbbank',
    bin: '970422',
    shortName: 'MB Bank (Quân Đội)',
    name: 'Ngân hàng Quân Đội',
    aliases: ['mb', 'mbbank', 'quan doi', 'mb bank', '970422']
  },
  {
    code: 'techcombank',
    bin: '970407',
    shortName: 'Techcombank (TCB)',
    name: 'Ngân hàng Kỹ Thương Việt Nam',
    aliases: ['tcb', 'techcombank', 'ky thuong', 'techcom', '970407']
  },
  {
    code: 'vietinbank',
    bin: '970415',
    shortName: 'VietinBank (CTG)',
    name: 'Ngân hàng Công Thương Việt Nam',
    aliases: ['icb', 'ctg', 'vietinbank', 'vietin', 'cong thuong', '970415']
  },
  {
    code: 'bidv',
    bin: '970418',
    shortName: 'BIDV',
    name: 'Ngân hàng Đầu tư và Phát triển Việt Nam',
    aliases: ['bidv', 'dau tu va phat trien', '970418']
  },
  {
    code: 'agribank',
    bin: '970405',
    shortName: 'Agribank (VBA)',
    name: 'Ngân hàng Nông nghiệp & PT Nông thôn Việt Nam',
    aliases: ['vba', 'agr', 'agribank', 'nong nghiep', '970405']
  },
  {
    code: 'vpbank',
    bin: '970432',
    shortName: 'VPBank (VPB)',
    name: 'Ngân hàng Việt Nam Thịnh Vượng',
    aliases: ['vpb', 'vpbank', 'thinh vuong', '970432']
  },
  {
    code: 'tpbank',
    bin: '970423',
    shortName: 'TPBank (TPB)',
    name: 'Ngân hàng Tiên Phong',
    aliases: ['tpb', 'tpbank', 'tien phong', '970423']
  },
  {
    code: 'acb',
    bin: '970416',
    shortName: 'ACB (Á Châu)',
    name: 'Ngân hàng TMCP Á Châu',
    aliases: ['acb', 'a chau', '970416']
  },
  {
    code: 'sacombank',
    bin: '970403',
    shortName: 'Sacombank (STB)',
    name: 'Ngân hàng Sài Gòn Thương Tín',
    aliases: ['stb', 'sacombank', 'sai gon thuong tin', 'sacom', '970403']
  },
  {
    code: 'hdbank',
    bin: '970437',
    shortName: 'HDBank (HDB)',
    name: 'Ngân hàng Phát triển TP.HCM',
    aliases: ['hdb', 'hdbank', '970437']
  },
  {
    code: 'vib',
    bin: '970441',
    shortName: 'VIB (Quốc Tế)',
    name: 'Ngân hàng Quốc Tế Việt Nam',
    aliases: ['vib', 'quoc te', '970441']
  },
  {
    code: 'shb',
    bin: '970443',
    shortName: 'SHB',
    name: 'Ngân hàng Sài Gòn - Hà Nội',
    aliases: ['shb', 'sai gon ha noi', '970443']
  },
  {
    code: 'ocb',
    bin: '970448',
    shortName: 'OCB (Phương Đông)',
    name: 'Ngân hàng Phương Đông',
    aliases: ['ocb', 'phuong dong', '970448']
  },
  {
    code: 'msb',
    bin: '970426',
    shortName: 'MSB (Hàng Hải)',
    name: 'Ngân hàng Hàng Hải Việt Nam',
    aliases: ['msb', 'hang hai', 'maritime', '970426']
  },
  {
    code: 'lienvietpostbank',
    bin: '970449',
    shortName: 'LPBank (Lộc Phát)',
    name: 'Ngân hàng TMCP Lộc Phát Việt Nam',
    aliases: ['lpb', 'lpbank', 'loc phat', 'lienvietpostbank', 'lien viet', '970449']
  },
  {
    code: 'seabank',
    bin: '970440',
    shortName: 'SeABank (Đông Nam Á)',
    name: 'Ngân hàng Đông Nam Á',
    aliases: ['seabank', 'seab', 'dong nam a', '970440']
  },
  {
    code: 'namabank',
    bin: '970428',
    shortName: 'Nam A Bank (NAB)',
    name: 'Ngân hàng Nam Á',
    aliases: ['nab', 'nam a', 'namabank', '970428']
  },
  {
    code: 'abbank',
    bin: '970425',
    shortName: 'ABBANK (An Bình)',
    name: 'Ngân hàng An Bình',
    aliases: ['abb', 'abbank', 'an binh', '970425']
  },
  {
    code: 'bacabank',
    bin: '970409',
    shortName: 'Bac A Bank (Bắc Á)',
    name: 'Ngân hàng Bắc Á',
    aliases: ['bab', 'bac a', 'bacabank', '970409']
  },
  {
    code: 'baovietbank',
    bin: '970438',
    shortName: 'BaoViet Bank (Bảo Việt)',
    name: 'Ngân hàng Bảo Việt',
    aliases: ['bvb', 'baoviet', 'baovietbank', 'bao viet', '970438']
  },
  {
    code: 'vietabank',
    bin: '970427',
    shortName: 'VietABank (Việt Á)',
    name: 'Ngân hàng Việt Á',
    aliases: ['vab', 'vieta', 'vietabank', 'viet a', '970427']
  },
  {
    code: 'kienlongbank',
    bin: '970452',
    shortName: 'KienlongBank (Kiên Long)',
    name: 'Ngân hàng Kiên Long',
    aliases: ['klb', 'kienlong', 'kienlongbank', 'kien long', '970452']
  },
  {
    code: 'pgbank',
    bin: '970430',
    shortName: 'PGBank (Xăng Dầu)',
    name: 'Ngân hàng TMCP Thịnh Vượng và Phát triển',
    aliases: ['pgb', 'pgbank', 'xang dau', '970430']
  },
  {
    code: 'cake',
    bin: '546034',
    shortName: 'Cake by VPBank',
    name: 'Ngân hàng số Cake by VPBank',
    aliases: ['cake', 'cake by vpbank', '546034']
  },
  {
    code: 'timo',
    bin: '963388',
    shortName: 'Timo by BVBank',
    name: 'Ngân hàng số Timo',
    aliases: ['timo', 'timo plus', '963388']
  },
  {
    code: 'viettelmoney',
    bin: '971005',
    shortName: 'Viettel Money',
    name: 'Tổng Công ty Dịch vụ Số Viettel',
    aliases: ['viettelmoney', 'viettel pay', 'viettel', '971005']
  },
  {
    code: 'vnptmoney',
    bin: '971011',
    shortName: 'VNPT Money',
    name: 'Tập đoàn Bưu chính Viễn thông Việt Nam',
    aliases: ['vnptmoney', 'vnpt pay', 'vnpt', '971011']
  },
  {
    code: 'shinhan',
    bin: '970424',
    shortName: 'Shinhan Bank Việt Nam',
    name: 'Ngân hàng TNHH MTV Shinhan Việt Nam',
    aliases: ['shinhan', 'shinhanbank', 'shbvn', '970424']
  },
  {
    code: 'wooribank',
    bin: '970457',
    shortName: 'Woori Bank Việt Nam',
    name: 'Ngân hàng TNHH MTV Woori Việt Nam',
    aliases: ['woori', 'wooribank', '970457']
  },
  {
    code: 'publicbank',
    bin: '970439',
    shortName: 'Public Bank Việt Nam',
    name: 'Ngân hàng TNHH MTV Public Việt Nam',
    aliases: ['pbvn', 'publicbank', 'public', '970439']
  }
];

/**
 * Tìm mã ngân hàng VietQR theo tên hoặc alias
 */
export function resolveBankCode(bankInput?: any): string {
  if (bankInput === null || bankInput === undefined) return 'vietcombank';
  const clean = String(bankInput).toLowerCase().trim();
  
  // 1. Khớp mã định danh hoặc BIN
  const direct = VIETNAM_BANKS.find(b => b.code.toLowerCase() === clean || b.bin === clean);
  if (direct) return direct.code;

  // 2. Khớp alias
  const byAlias = VIETNAM_BANKS.find(b => 
    b.aliases.some(alias => clean.includes(alias) || alias === clean)
  );
  if (byAlias) return byAlias.code;

  // 3. Khớp tên ngân hàng
  const byName = VIETNAM_BANKS.find(b => 
    clean.includes(b.shortName.toLowerCase()) || clean.includes(b.name.toLowerCase())
  );
  if (byName) return byName.code;

  return 'vietcombank';
}

/**
 * Chuẩn hóa chuỗi text sang chuẩn Napas / VietQR EMVCo Tag 62:
 * - Loại bỏ dấu tiếng Việt (NFD)
 * - Loại bỏ các ký tự đặc biệt [ ] { } < > # % @ $ ^ & * ( ) = + \\ / | ~ ` " ' ; : , . ? !
 * - Giữ lại chữ cái, số và dấu cách
 * - Chuyển sang chữ IN HOA
 * - Giới hạn tối đa 50 ký tự để không tràn buffer Napas
 */
export function sanitizeVietQrText(text?: any): string {
  if (text === null || text === undefined) return '';
  return String(text)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'D')
    .replace(/[^a-zA-Z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toUpperCase()
    .slice(0, 50);
}

/**
 * Sinh URL tạo ảnh mã VietQR chuẩn xác, tương thích 100% App Ngân hàng Việt Nam
 */
export function generateVietQrUrl(opts?: {
  bankCode?: any;
  bankName?: any;
  bankAccount?: any;
  bankHolder?: any;
  fundAmount?: any;
  transferSyntax?: any;
  template?: 'compact' | 'compact2' | 'qr_only';
}): string {
  if (!opts) return '';
  const bankId = opts.bankCode ? String(opts.bankCode).toLowerCase() : resolveBankCode(opts.bankName);
  const cleanAcc = String(opts.bankAccount || '').replace(/[^0-9a-zA-Z]/g, '');
  const template = opts.template || 'compact';
  const amount = opts.fundAmount && Number(opts.fundAmount) > 0 ? Number(opts.fundAmount) : 0;
  const cleanMemo = sanitizeVietQrText(opts.transferSyntax || 'DONG QUY K8A1');
  const cleanName = sanitizeVietQrText(opts.bankHolder || '');

  let url = `https://img.vietqr.io/image/${bankId}-${cleanAcc}-${template}.png?amount=${amount}&addInfo=${encodeURIComponent(cleanMemo)}`;
  if (cleanName) {
    url += `&accountName=${encodeURIComponent(cleanName)}`;
  }
  return url;
}

export const DEFAULT_EVENT_CONFIG: EventConfig = {
  eventTitle: "20 Năm Ngày Trở Về",
  eventSubtitle: "Lớp K8A1 — Trường THPT Thái Nguyên",
  eventDateText: "Chủ Nhật, 27/09/2026 (08:30 — 15:30)",
  eventTimeText: "Từ 08:30 Sáng — Chủ Nhật, ngày 27/09/2026",
  countdownTarget: "2026-09-27T08:30:00+07:00",
  venueName: "Crown Palace Thái Nguyên",
  venueSubtitle: "Địa điểm tổ chức Họp Lớp 20 Năm Ngày Trở Về — Lớp K8A1",
  venueAddress: "Số 779 đường Dương Tự Minh, P. Quang Vinh, TP. Thái Nguyên, Tỉnh Thái Nguyên",
  shortAddress: "779 Dương Tự Minh, TP. Thái Nguyên",
  mapEmbedUrl: "https://maps.google.com/maps?q=Crown+Palace+779+D%C6%B0%C6%A1ng+T%E1%BB%B1+Minh+Th%C3%A1i+Nguy%C3%AAn&t=&z=15&ie=UTF8&iwloc=&output=embed",
  mapDirectUrl: "https://maps.google.com/?q=Crown+Palace+779+D%C6%B0%C6%A1ng+T%E1%BB%B1+Minh+Th%C3%A1i+Nguy%C3%AAn&ll=21.6041,105.8286&z=16",
  letterTitle: "Lời Ngỏ Thân Tình Gửi Bạn Tôi — Lớp K8A1",
  letterSubtitle: "Hai mươi năm một chặng đường — Nơi ký ức thanh xuân THPT Thái Nguyên mãi vẹn nguyên",
  letterParagraph1: "Hai mươi năm — một chặng đường đủ dài để mỗi thành viên Lớp K8A1 (Khóa 8) chúng ta trưởng thành, gây dựng sự nghiệp và vun vén cho những tổ ấm riêng. Dù hôm nay mỗi người mỗi ngả, bộn bề với những lo toan cuộc sống, nhưng sâu thẳm trong tim mỗi chúng ta vẫn luôn vẹn nguyên một ngăn ký ức thiêng liêng dành cho những năm tháng cấp 3 rực rỡ dưới mái trường THPT Thái Nguyên thân thương.",
  letterParagraph2: "Hãy tạm gác lại những bộn bề âu lo, cùng trở về Crown Palace Thái Nguyên để gặp lại những gương mặt thanh xuân năm nào, cùng viết tiếp câu chuyện tình bạn đẹp đẽ của Lớp K8A1 chúng mình!",
  letterSignatureTitle: "Ban Liên Lạc Lớp K8A1 (Khóa 8)",
  letterSignatureSubtitle: "Trường THPT Thái Nguyên (2003 — 2006)",
  bankName: "Vietcombank (VCB)",
  bankAccount: "10123456789",
  bankHolder: "NGUYEN VAN BAN TO CHUC",
  transferSyntax: "KY NIEM 20 NAM K8A1",
  fundAmountPerPerson: 500000,
  customQrUrl: "",
  bankCode: "vietcombank",
  qrTemplate: "compact",
  heroBannerUrl: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1600&q=80",
  heroBannerPosition: 50
};

// URL Google Apps Script WebApp mặc định toàn hệ thống
// BLL có thể dán URL triển khai (/exec) vào đây để mọi thiết bị/ẩn danh tự động đồng bộ cùng 1 Sheet
export const DEFAULT_APPS_SCRIPT_URL = "";

export const K8A1_DRIVE_FOLDER_ID = "1Skmip1HQhmXan-58kwbY_msamP-bWokq";
export const K8A1_DRIVE_FOLDER_URL = "https://drive.google.com/drive/folders/1Skmip1HQhmXan-58kwbY_msamP-bWokq";

export const GOOGLE_APPS_SCRIPT_CODE = `/**
 * GOOGLE APPS SCRIPT (Code.gs)
 * Phục vụ WebApp "Hội Ngộ 20 Năm Lớp K8A1 — THPT Thái Nguyên"
 * Hỗ trợ Phân quyền Admin (8888) & Ban Liên Lạc (2006) với Full CRUD
 * Đồng bộ tập trung toàn bộ dữ liệu: Điểm danh, Quỹ, Lời chúc, Cấu hình sự kiện, Media vào Google Sheet
 * 
 * HƯỚNG DẪN TRIỂN KHAI CHUẨN ĐỂ KHÔNG BỊ LỖI "Failed to fetch":
 * 1. Mở Google Sheet -> Chọn Tiện ích mở rộng (Extensions) -> Apps Script
 * 2. Dán toàn bộ mã nguồn này vào file Code.gs -> Bấm Lưu (Ctrl + S)
 * 3. Bấm nút "Deploy" (Triển khai) -> Chọn "New deployment" (Triển khai mới)
 * 4. Chọn loại: "Web app" (Ứng dụng web)
 * 5. CẤU HÌNH BẮT BUỘC:
 *    - Execute as (Thực thi dưới dạng): Me (Tôi - email của bạn)
 *    - Who has access (Ai có quyền truy cập): Anyone (Bất kỳ ai)  <-- BẮT BUỘC!
 * 6. Bấm Deploy -> Cấp quyền (Review Permissions) -> Sao chép URL kết thúc bằng /exec
 */

const CONFIG = {
  // ID thư mục Google Drive của lớp K8A1 lưu trữ và đồng bộ ảnh kỷ niệm
  DRIVE_FOLDER_ID: "1Skmip1HQhmXan-58kwbY_msamP-bWokq",
  // Tên trang tính lưu danh sách điểm danh & đối soát quỹ
  RSVP_SHEET_NAME: "Trang_tinh_1",
  // Tên trang tính lưu lời chúc & lưu bút
  WISHES_SHEET_NAME: "Loi_Chuc",
  // Tên trang tính lưu toàn bộ cấu hình sự kiện (Địa điểm, Quỹ, Ngân hàng, Thư ngỏ, Banner)
  CONFIG_SHEET_NAME: "Cau_Hinh",
  // Tên trang tính lưu danh bạ sĩ số học sinh lớp K8A1 (Single Source of Truth)
  ROSTER_SHEET_NAME: "Danh_Sach_Lop",
  // Tên trang tính lưu danh sách video và media địa điểm
  MEDIA_SHEET_NAME: "Media_Cai_Dat",
  // Tên trang tính đếm lượt truy cập
  VIEW_COUNTER_SHEET_NAME: "Luot_Truy_Cap"
};

// Chuẩn hóa phản hồi JSON cho WebApp (CORS tự động xử lý bởi Google Apps Script)
function handleResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Xử lý yêu cầu GET: Đọc dữ liệu từ Google Sheet
 */
function doGet(e) {
  try {
    const action = (e && e.parameter && e.parameter.action) ? e.parameter.action : 'get_all_data';

    // 1. Đồng bộ toàn bộ dữ liệu chỉ trong 1 request duy nhất (Single Source of Truth)
    if (action === 'get_all_data' || action === 'all' || action === 'sync') {
      return handleResponse(getAllData());
    }

    // 2. Lấy cấu hình sự kiện
    if (action === 'get_config') {
      return handleResponse(getEventConfig());
    }

    // 3. Lấy media (Videos & Venue Media)
    if (action === 'get_media') {
      return handleResponse(getMediaSettings());
    }

    // 4. Lấy ảnh thư viện Drive
    if (action === 'get_photos') {
      return handleResponse(getDrivePhotos());
    }

    // 5. Lấy danh sách lưu bút / lời chúc
    if (action === 'get_wishes') {
      return handleResponse(getWishesList());
    }

    // 6. Lấy danh sách RSVP / điểm danh
    if (action === 'get_confirmed_attendees' || action === 'get_attendees' || action === 'get_rsvp') {
      return handleResponse(getRSVPList());
    }

    // 7. Lấy danh bạ sĩ số lớp K8A1
    if (action === 'get_roster' || action === 'get_members' || action === 'get_class_roster') {
      return handleResponse(getClassRoster());
    }

    // Dọn dẹp bản ghi trùng lặp
    if (action === 'deduplicate_rsvp' || action === 'cleanup_duplicates') {
      return handleResponse(deduplicateRSVP());
    }

    // 7. Lấy số lượt xem trang
    if (action === 'get_view_count') {
      return handleResponse(getViewCount());
    }

    if (action === 'record_view' || action === 'hit_view') {
      return handleResponse(recordPageView());
    }

    // Mặc định trả về toàn bộ dữ liệu
    return handleResponse(getAllData());
  } catch (err) {
    return handleResponse({ status: 'error', message: err.toString() });
  }
}

/**
 * Xử lý yêu cầu POST: Ghi điểm danh, đối soát quỹ, lưu cấu hình, media vào Google Sheet / Drive
 */
function doPost(e) {
  try {
    let postData = {};
    if (e && e.postData && e.postData.contents) {
      try {
        postData = JSON.parse(e.postData.contents);
      } catch (ex) {
        postData = e.parameter || {};
      }
    } else if (e && e.parameter) {
      postData = e.parameter;
    }

    const action = postData.action || 'rsvp';

    // 1. Lưu Cấu Hình Sự Kiện (Địa điểm, Quỹ, Thư ngỏ, Banner)
    if (action === 'save_config' || action === 'update_config') {
      return handleResponse(saveEventConfig(postData));
    }

    // 2. Lưu Media (Video, Venue Media)
    if (action === 'save_media' || action === 'update_media') {
      return handleResponse(saveMediaSettings(postData));
    }

    // 3. Quản lý danh bạ lớp K8A1 (Sheet: "Danh_Sach_Lop")
    if (action === 'save_roster' || action === 'update_roster') {
      return handleResponse(saveClassRoster(postData));
    }

    if (action === 'add_member' || action === 'create_member') {
      return handleResponse(addClassMember(postData));
    }

    if (action === 'update_member' || action === 'edit_member') {
      return handleResponse(updateClassMember(postData));
    }

    if (action === 'delete_member' || action === 'remove_member') {
      return handleResponse(deleteClassMember(postData));
    }

    if (action === 'record_view' || action === 'hit_view') {
      return handleResponse(recordPageView());
    }

    if (action === 'upload_photo') {
      return handleResponse(uploadPhotoToDrive(postData));
    }

    if (action === 'upload_fund_receipt' || action === 'upload_receipt') {
      return handleResponse(uploadFundReceiptToDrive(postData));
    }

    if (action === 'update_fund' || action === 'update_rsvp') {
      return handleResponse(updateRSVP(postData));
    }

    if (action === 'add_wish') {
      return handleResponse(saveWish(postData));
    }

    if (action === 'delete_wish') {
      return handleResponse(deleteWish(postData));
    }

    if (action === 'delete_rsvp') {
      return handleResponse(deleteRSVP(postData));
    }

    if (action === 'deduplicate_rsvp' || action === 'cleanup_duplicates') {
      return handleResponse(deduplicateRSVP());
    }

    if (action === 'rsvp' || (postData.fullName && postData.phone)) {
      return handleResponse(saveRSVP(postData));
    }

    return handleResponse({ status: 'error', message: 'Hành động không hợp lệ!' });
  } catch (err) {
    return handleResponse({ status: 'error', message: err.toString() });
  }
}

/**
 * Chuẩn hóa số điện thoại để so khớp chống trùng lặp (loại bỏ khoảng trắng, dấu cộng, số 84...)
 */
function normalizePhone(phone) {
  if (!phone) return '';
  var p = String(phone).replace(/[^0-9]/g, '');
  if (p.indexOf('84') === 0 && p.length > 9) {
    p = '0' + p.substring(2);
  } else if (p.indexOf('0') !== 0 && p.length === 9) {
    p = '0' + p;
  }
  return p;
}

/**
 * Chuẩn hóa họ tên thành chữ thường, bỏ dấu cách thừa để so khớp
 */
function normalizeName(name) {
  if (!name) return '';
  return String(name).trim().toLowerCase().replace(/\s+/g, ' ');
}

/**
 * Lấy danh sách RSVP từ Google Sheet (tự động hợp nhất bản ghi trùng lặp)
 */
function getRSVPList() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(CONFIG.RSVP_SHEET_NAME);
  if (!sheet) {
    sheet = ss.getSheets()[0];
  }

  var rows = sheet.getDataRange().getValues();
  if (rows.length <= 1) {
    return { status: 'success', data: [] };
  }

  var list = [];
  var seenMap = {};

  for (var i = 1; i < rows.length; i++) {
    var row = rows[i];
    if (!row[0] && !row[1] && !row[2]) continue;

    var rawName = String(row[0] || '').trim();
    var rawPhone = String(row[2] || '').trim();
    var normPhone = normalizePhone(rawPhone);
    var normName = normalizeName(rawName);
    var uniqueKey = normPhone || normName;

    var item = {
      id: String(i),
      rowId: String(i + 1),
      fullName: rawName,
      nickname: String(row[1] || ''),
      phone: normPhone || rawPhone,
      status: row[3] === 'Có tham gia' || row[3] === 'yes' ? 'yes' : 'no',
      shirtSize: String(row[4] || 'L'),
      message: String(row[5] || ''),
      submittedAt: formatDate(row[6] || new Date()),
      checkedIn: row[7] === 'ĐÃ ĐẾN' || row[7] === true,
      checkedInAt: String(row[8] || ''),
      fundStatus: row[9] === 'ĐÃ ĐÓNG' || row[9] === 'paid' ? 'paid' : (row[9] === 'CHỜ ĐỐI SOÁT' || row[9] === 'pending' ? 'pending' : (row[9] === 'MIỄN' || row[9] === 'exempt' ? 'exempt' : 'unpaid')),
      fundAmount: Number(row[10]) || (row[9] === 'ĐÃ ĐÓNG' || row[9] === 'paid' ? 500000 : 0),
      fundNote: String(row[11] || ''),
      fundReceiptUrl: String(row[12] || ''),
      fundPaidAt: String(row[13] || ''),
      fundPaymentMethod: String(row[14] || 'bank_transfer'),
      fundAuditedBy: String(row[15] || '')
    };

    if (uniqueKey && seenMap[uniqueKey] !== undefined) {
      // Đã có bản ghi trước đó của người này -> Hợp nhất thông tin tối ưu nhất
      var existingIdx = seenMap[uniqueKey];
      var existing = list[existingIdx];
      list[existingIdx] = {
        id: existing.id,
        rowId: existing.rowId,
        fullName: item.fullName || existing.fullName,
        nickname: item.nickname || existing.nickname,
        phone: item.phone || existing.phone,
        status: item.status,
        shirtSize: item.shirtSize || existing.shirtSize,
        message: item.message || existing.message,
        submittedAt: item.submittedAt || existing.submittedAt,
        checkedIn: existing.checkedIn || item.checkedIn,
        checkedInAt: item.checkedInAt || existing.checkedInAt,
        fundStatus: (existing.fundStatus === 'paid' || item.fundStatus === 'paid') ? 'paid' : (item.fundStatus === 'pending' || existing.fundStatus === 'pending' ? 'pending' : item.fundStatus),
        fundAmount: Math.max(existing.fundAmount || 0, item.fundAmount || 0),
        fundNote: item.fundNote || existing.fundNote,
        fundReceiptUrl: item.fundReceiptUrl || existing.fundReceiptUrl,
        fundPaidAt: item.fundPaidAt || existing.fundPaidAt,
        fundPaymentMethod: item.fundPaymentMethod || existing.fundPaymentMethod,
        fundAuditedBy: item.fundAuditedBy || existing.fundAuditedBy
      };
    } else {
      if (uniqueKey) seenMap[uniqueKey] = list.length;
      list.push(item);
    }
  }

  return { status: 'success', data: list };
}

/**
 * Lưu lượt đăng ký RSVP (Tự động chống trùng lặp - UPSERT thông minh)
 * Nếu người dùng đã từng đăng ký (theo SĐT hoặc Họ Tên): Cập nhật thông tin vào dòng cũ, không tạo dòng mới.
 */
function saveRSVP(data) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(CONFIG.RSVP_SHEET_NAME);
  if (!sheet) {
    sheet = ss.getSheets()[0];
  }

  // Khởi tạo tiêu đề cột đầy đủ 16 cột
  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      'Họ và Tên', 
      'Biệt danh', 
      'Số điện thoại', 
      'Tình trạng', 
      'Size áo', 
      'Lời nhắn', 
      'Thời gian gửi',
      'Điểm danh đến',
      'Giờ đến',
      'Quỹ 500k',
      'Số tiền',
      'Ghi chú quỹ',
      'Link Ảnh Bill/UNC',
      'Thời gian nộp',
      'Hình thức',
      'Người đối soát'
    ]);
    sheet.getRange(1, 1, 1, 16).setFontWeight('bold').setBackground('#FAF3E0');
  }

  // Nếu có kèm ảnh bill trong form RSVP, tự động upload lên Drive folder ChungTu_QuyLop_K8A1
  if ((data.fileData || data.fundReceiptBase64) && !data.fundReceiptUrl) {
    try {
      var uploadRes = uploadFundReceiptToDrive({
        fileData: data.fileData || data.fundReceiptBase64,
        mimeType: data.mimeType || 'image/jpeg',
        fullName: data.fullName,
        phone: data.phone,
        fundAmount: data.fundAmount || 500000,
        fundStatus: 'pending',
        fundPaymentMethod: 'bank_transfer',
        fundPaidAt: formatDate(new Date()),
        fundNote: data.fundNote || 'Đính kèm khi đăng ký tham dự'
      });
      if (uploadRes && uploadRes.status === 'success' && uploadRes.url) {
        data.fundReceiptUrl = uploadRes.url;
        data.fundStatus = 'pending';
        data.fundPaymentMethod = 'bank_transfer';
        data.fundPaidAt = formatDate(new Date());
      }
    } catch (eUp) {
      console.warn("Lỗi upload ảnh bill khi RSVP: " + eUp);
    }
  }

  var normNewPhone = normalizePhone(data.phone);
  var normNewName = normalizeName(data.fullName);

  // Đọc các dòng hiện tại để tìm kiếm bản ghi trùng lặp
  var rows = sheet.getDataRange().getValues();
  var matchedRowIndex = -1;
  var duplicateRowIndices = [];

  for (var i = 1; i < rows.length; i++) {
    var row = rows[i];
    var rowPhone = normalizePhone(row[2]);
    var rowName = normalizeName(row[0]);

    var isMatch = false;
    if (normNewPhone && rowPhone && normNewPhone === rowPhone) {
      isMatch = true;
    } else if (!normNewPhone && normNewName && rowName && normNewName === rowName) {
      isMatch = true;
    } else if (normNewName && rowName && normNewName === rowName && (!rowPhone || !normNewPhone || rowPhone === normNewPhone)) {
      isMatch = true;
    }

    if (isMatch) {
      if (matchedRowIndex === -1) {
        matchedRowIndex = i + 1; // dòng đầu tiên (1-indexed)
      } else {
        duplicateRowIndices.push(i + 1); // các dòng trùng thừa phía sau
      }
    }
  }

  var phoneValue = normNewPhone ? ("'" + normNewPhone) : (data.phone ? ("'" + String(data.phone).trim()) : '');

  if (matchedRowIndex !== -1) {
    // === CẬP NHẬT DÒNG HIỆN TẠI (UPSERT) ===
    var existingRow = rows[matchedRowIndex - 1];

    var isAlreadyCheckedIn = existingRow[7] === 'ĐÃ ĐẾN';
    var isAlreadyPaid = existingRow[9] === 'ĐÃ ĐÓNG';

    var updatedFundStatus = isAlreadyPaid 
      ? 'ĐÃ ĐÓNG' 
      : (data.fundStatus === 'paid' 
          ? 'ĐÃ ĐÓNG' 
          : (data.fundReceiptUrl || data.fundStatus === 'pending' 
              ? 'CHỜ ĐỐI SOÁT' 
              : (existingRow[9] || 'CHƯA ĐÓNG')));

    var updatedRow = [
      data.fullName || existingRow[0] || '',
      (data.nickname !== undefined && data.nickname !== '') ? data.nickname : (existingRow[1] || ''),
      phoneValue || existingRow[2] || '',
      data.status === 'yes' ? 'Có tham gia' : 'Rất tiếc vắng mặt',
      data.shirtSize || existingRow[4] || 'L',
      (data.message !== undefined && data.message !== '') ? data.message : (existingRow[5] || ''),
      new Date(), // Cập nhật thời gian gửi mới nhất
      isAlreadyCheckedIn ? 'ĐÃ ĐẾN' : (data.checkedIn ? 'ĐÃ ĐẾN' : 'CHƯA ĐẾN'),
      data.checkedInAt || existingRow[8] || '',
      updatedFundStatus,
      data.fundAmount || existingRow[10] || (isAlreadyPaid ? 500000 : 0),
      data.fundNote || existingRow[11] || '',
      data.fundReceiptUrl || existingRow[12] || '',
      data.fundPaidAt || existingRow[13] || '',
      data.fundPaymentMethod || existingRow[14] || 'bank_transfer',
      existingRow[15] || ''
    ];

    sheet.getRange(matchedRowIndex, 1, 1, 16).setValues([updatedRow]);

    // Xóa sạch các dòng trùng lặp thừa nếu trước đó đã bị sinh ra (xóa từ dưới lên trên)
    if (duplicateRowIndices.length > 0) {
      duplicateRowIndices.sort(function(a, b) { return b - a; });
      for (var d = 0; d < duplicateRowIndices.length; d++) {
        sheet.deleteRow(duplicateRowIndices[d]);
      }
    }

    return { status: 'success', message: 'Đã cập nhật thông tin thành công (không tạo bản ghi trùng lặp)!' };
  } else {
    // === THÊM MỚI BẢN GHI (CHƯA TỪNG ĐĂNG KÝ) ===
    var newRow = [
      data.fullName || '',
      data.nickname || '',
      phoneValue,
      data.status === 'yes' ? 'Có tham gia' : 'Rất tiếc vắng mặt',
      data.shirtSize || 'L',
      data.message || '',
      new Date(),
      data.checkedIn ? 'ĐÃ ĐẾN' : 'CHƯA ĐẾN',
      data.checkedInAt || '',
      data.fundStatus === 'paid' ? 'ĐÃ ĐÓNG' : (data.fundReceiptUrl || data.fundStatus === 'pending' ? 'CHỜ ĐỐI SOÁT' : 'CHƯA ĐÓNG'),
      data.fundAmount || (data.fundStatus === 'paid' ? 500000 : 0),
      data.fundNote || '',
      data.fundReceiptUrl || '',
      data.fundPaidAt || '',
      data.fundPaymentMethod || 'bank_transfer',
      data.fundAuditedBy || ''
    ];

    sheet.appendRow(newRow);
    return { status: 'success', message: 'Điểm danh thành công!' };
  }
}

/**
 * Cập nhật thông tin RSVP / Đối soát quỹ (so khớp SĐT chuẩn hóa)
 */
function updateRSVP(data) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(CONFIG.RSVP_SHEET_NAME);
  if (!sheet) sheet = ss.getSheets()[0];

  var rows = sheet.getDataRange().getValues();
  var targetPhone = normalizePhone(data.phone);
  var targetName = normalizeName(data.fullName);
  var updated = false;

  for (var i = 1; i < rows.length; i++) {
    var rowPhone = normalizePhone(rows[i][2]);
    var rowName = normalizeName(rows[i][0]);
    var isMatch = (targetPhone && rowPhone && targetPhone === rowPhone) ||
                  (!targetPhone && targetName && rowName && targetName === rowName) ||
                  (data.rowId && (i + 1) === Number(data.rowId));

    if (isMatch) {
      var rowIndex = i + 1;
      if (data.fullName) sheet.getRange(rowIndex, 1).setValue(data.fullName);
      if (data.nickname !== undefined) sheet.getRange(rowIndex, 2).setValue(data.nickname);
      if (data.phone) {
        var normP = normalizePhone(data.phone);
        sheet.getRange(rowIndex, 3).setValue(normP ? "'" + normP : data.phone);
      }
      if (data.status) sheet.getRange(rowIndex, 4).setValue(data.status === 'yes' ? 'Có tham gia' : 'Rất tiếc vắng mặt');
      if (data.shirtSize) sheet.getRange(rowIndex, 5).setValue(data.shirtSize);
      if (data.message !== undefined) sheet.getRange(rowIndex, 6).setValue(data.message);
      if (data.checkedIn !== undefined) sheet.getRange(rowIndex, 8).setValue(data.checkedIn ? 'ĐÃ ĐẾN' : 'CHƯA ĐẾN');
      if (data.checkedInAt !== undefined) sheet.getRange(rowIndex, 9).setValue(data.checkedInAt);
      if (data.fundStatus !== undefined) sheet.getRange(rowIndex, 10).setValue(data.fundStatus === 'paid' ? 'ĐÃ ĐÓNG' : (data.fundStatus === 'pending' ? 'CHỜ ĐỐI SOÁT' : (data.fundStatus === 'exempt' ? 'MIỄN' : 'CHƯA ĐÓNG')));
      if (data.fundAmount !== undefined) sheet.getRange(rowIndex, 11).setValue(data.fundAmount);
      if (data.fundNote !== undefined) sheet.getRange(rowIndex, 12).setValue(data.fundNote);
      if (data.fundReceiptUrl !== undefined) sheet.getRange(rowIndex, 13).setValue(data.fundReceiptUrl);
      if (data.fundPaidAt !== undefined) sheet.getRange(rowIndex, 14).setValue(data.fundPaidAt);
      if (data.fundPaymentMethod !== undefined) sheet.getRange(rowIndex, 15).setValue(data.fundPaymentMethod);
      if (data.fundAuditedBy !== undefined) sheet.getRange(rowIndex, 16).setValue(data.fundAuditedBy);
      updated = true;
      break;
    }
  }

  return { status: updated ? 'success' : 'not_found', message: updated ? 'Cập nhật thành công' : 'Không tìm thấy dòng tương ứng' };
}

/**
 * Xóa dòng RSVP (Admin Only - so khớp SĐT hoặc dòng)
 */
function deleteRSVP(data) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(CONFIG.RSVP_SHEET_NAME);
  if (!sheet) sheet = ss.getSheets()[0];

  var rows = sheet.getDataRange().getValues();
  var targetPhone = normalizePhone(data.phone);
  var targetName = normalizeName(data.fullName);

  for (var i = 1; i < rows.length; i++) {
    var rowPhone = normalizePhone(rows[i][2]);
    var rowName = normalizeName(rows[i][0]);
    var isMatch = (targetPhone && rowPhone && targetPhone === rowPhone) ||
                  (!targetPhone && targetName && rowName && targetName === rowName) ||
                  (data.rowId && (i + 1) === Number(data.rowId));

    if (isMatch) {
      sheet.deleteRow(i + 1);
      return { status: 'success', message: 'Đã xóa thành viên thành công' };
    }
  }

  return { status: 'not_found', message: 'Không tìm thấy dòng để xóa' };
}

/**
 * Dọn dẹp và hợp nhất toàn bộ bản ghi trùng lặp trong Google Sheet
 */
function deduplicateRSVP() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(CONFIG.RSVP_SHEET_NAME);
  if (!sheet) sheet = ss.getSheets()[0];

  var rows = sheet.getDataRange().getValues();
  if (rows.length <= 2) {
    return { status: 'success', message: 'Bảng tính chưa có bản ghi nào để dọn dẹp.' };
  }

  var uniqueMap = {};
  var rowsToDelete = [];
  var mergedCount = 0;

  for (var i = 1; i < rows.length; i++) {
    var row = rows[i];
    var rawName = String(row[0] || '').trim();
    var rawPhone = String(row[2] || '').trim();
    if (!rawName && !rawPhone) continue;

    var normP = normalizePhone(rawPhone);
    var normN = normalizeName(rawName);
    var key = normP || normN;

    if (!uniqueMap[key]) {
      uniqueMap[key] = {
        rowIndex: i + 1,
        data: row.slice(0, 16)
      };
    } else {
      var master = uniqueMap[key];
      var masterData = master.data;

      if (!masterData[1] && row[1]) masterData[1] = row[1];
      if (!masterData[2] && row[2]) masterData[2] = row[2];
      if (row[3]) masterData[3] = row[3];
      if (row[4] && row[4] !== 'L') masterData[4] = row[4];
      if (row[5]) masterData[5] = row[5];
      if (row[6]) masterData[6] = row[6];
      if (row[7] === 'ĐÃ ĐẾN' || masterData[7] === 'ĐÃ ĐẾN') masterData[7] = 'ĐÃ ĐẾN';
      if (row[8]) masterData[8] = row[8];
      if (row[9] === 'ĐÃ ĐÓNG' || masterData[9] === 'ĐÃ ĐÓNG') {
        masterData[9] = 'ĐÃ ĐÓNG';
      } else if (row[9] === 'CHỜ ĐỐI SOÁT' || masterData[9] === 'CHỜ ĐỐI SOÁT') {
        masterData[9] = 'CHỜ ĐỐI SOÁT';
      }
      if (Number(row[10]) > 0) masterData[10] = row[10];
      if (row[11]) masterData[11] = row[11];
      if (row[12]) masterData[12] = row[12];
      if (row[13]) masterData[13] = row[13];
      if (row[14]) masterData[14] = row[14];
      if (row[15]) masterData[15] = row[15];

      rowsToDelete.push(i + 1);
      mergedCount++;
    }
  }

  for (var k in uniqueMap) {
    var item = uniqueMap[k];
    if (item.data[2]) {
      var p = normalizePhone(item.data[2]);
      item.data[2] = "'" + (p || item.data[2]);
    }
    sheet.getRange(item.rowIndex, 1, 1, 16).setValues([item.data]);
  }

  rowsToDelete.sort(function(a, b) { return b - a; });
  for (var r = 0; r < rowsToDelete.length; r++) {
    sheet.deleteRow(rowsToDelete[r]);
  }

  return {
    status: 'success',
    message: mergedCount > 0 
      ? ('Đã hợp nhất và dọn dẹp thành công ' + mergedCount + ' bản ghi trùng lặp trên Google Sheet!') 
      : 'Bảng tính sạch sẽ, không có bản ghi nào bị trùng lặp!'
  };
}

/**
 * Lấy danh sách Lời chúc / Lưu bút
 */
function getWishesList() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(CONFIG.WISHES_SHEET_NAME);
  if (!sheet) {
    return { status: 'success', data: [] };
  }

  const rows = sheet.getDataRange().getValues();
  if (rows.length <= 1) return { status: 'success', data: [] };

  const wishes = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row[0]) continue;
    wishes.push({
      id: 'w-' + i,
      fullName: String(row[0] || ''),
      className: String(row[1] || 'K8A1'),
      message: String(row[2] || ''),
      submittedAt: formatDate(row[3] || new Date()),
      tag: String(row[4] || 'bg-amber-100/90 text-amber-900 border-amber-200')
    });
  }

  return { status: 'success', data: wishes.reverse() };
}

/**
 * Lưu lời chúc mới vào Sheet
 */
function saveWish(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(CONFIG.WISHES_SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.WISHES_SHEET_NAME);
    sheet.appendRow(['Tên thành viên', 'Lớp', 'Lời nhắn', 'Thời gian gửi', 'Màu giấy']);
    sheet.getRange(1, 1, 1, 5).setFontWeight('bold').setBackground('#FAF3E0');
  }

  sheet.appendRow([
    data.fullName || '',
    data.className || 'K8A1',
    data.message || '',
    new Date(),
    data.tag || 'bg-amber-100/90 text-amber-900 border-amber-200'
  ]);

  return { status: 'success', message: 'Dán lời chúc thành công!' };
}

/**
 * Xóa lời chúc
 */
function deleteWish(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(CONFIG.WISHES_SHEET_NAME);
  if (!sheet) return { status: 'error', message: 'Không tìm thấy sheet lời chúc' };

  if (data.rowId) {
    sheet.deleteRow(Number(data.rowId) + 1);
    return { status: 'success', message: 'Đã xóa lời chúc' };
  }

  return { status: 'error', message: 'Thiếu rowId' };
}

/**
 * Lấy ảnh từ Google Drive Folder (ID: 1Skmip1HQhmXan-58kwbY_msamP-bWokq)
 */
function getDrivePhotos() {
  const folderId = CONFIG.DRIVE_FOLDER_ID || "1Skmip1HQhmXan-58kwbY_msamP-bWokq";
  let folder = null;

  // 1. Thử mở thư mục theo ID cấu hình
  if (folderId) {
    try {
      folder = DriveApp.getFolderById(folderId);
    } catch (e) {
      console.warn("Không thể truy cập Folder ID: " + folderId + ". Nguyên nhân: Chưa cấp quyền hoặc ID không tồn tại.");
    }
  }

  // 2. Nếu không tìm thấy theo ID, thử tìm theo tên thư mục "K8A1_KyNiem_20Nam"
  if (!folder) {
    try {
      const folders = DriveApp.getFoldersByName("K8A1_KyNiem_20Nam");
      if (folders.hasNext()) {
        folder = folders.next();
      }
    } catch (e) {}
  }

  if (!folder) {
    return { 
      status: 'success', 
      data: [], 
      warning: 'Chưa thể mở thư mục Drive ' + folderId + '. Vui lòng kiểm tra quyền chia sẻ thư mục trên Google Drive!' 
    };
  }

  try {
    const files = folder.getFiles();
    const photos = [];

    while (files.hasNext()) {
      const file = files.next();
      const mimeType = file.getMimeType();
      if (mimeType.indexOf('image/') === 0 || mimeType === 'application/octet-stream') {
        const fileId = file.getId();
        photos.push({
          id: fileId,
          // URL xem ảnh trực tiếp chất lượng cao từ CDN Google
          url: 'https://lh3.googleusercontent.com/d/' + fileId + '=w1600',
          thumbnail: 'https://lh3.googleusercontent.com/d/' + fileId + '=w600',
          driveUrl: file.getUrl(),
          caption: file.getName().replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' '),
          date: formatDate(file.getDateCreated())
        });
      }
    }
    return { status: 'success', data: photos };
  } catch (e) {
    return { status: 'success', data: [], error: e.toString() };
  }
}

/**
 * Tải ảnh lên thư mục Drive (ID: 1Skmip1HQhmXan-58kwbY_msamP-bWokq)
 */
function uploadPhotoToDrive(data) {
  const folderId = CONFIG.DRIVE_FOLDER_ID || "1Skmip1HQhmXan-58kwbY_msamP-bWokq";
  let folder = null;

  // 1. Thử mở thư mục theo ID cấu hình
  if (folderId) {
    try {
      folder = DriveApp.getFolderById(folderId);
    } catch (e) {
      console.warn("Không mở được folder ID " + folderId + ", tiến hành tìm/tạo thư mục dự phòng...");
    }
  }

  // 2. Nếu không mở được, tự động tìm hoặc tạo thư mục "K8A1_KyNiem_20Nam"
  if (!folder) {
    try {
      const folders = DriveApp.getFoldersByName("K8A1_KyNiem_20Nam");
      if (folders.hasNext()) {
        folder = folders.next();
      } else {
        folder = DriveApp.createFolder("K8A1_KyNiem_20Nam");
        folder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      }
    } catch (e) {
      folder = DriveApp.getRootFolder();
    }
  }

  try {
    let rawBase64 = data.fileData || '';
    if (rawBase64.indexOf(',') > -1) {
      rawBase64 = rawBase64.split(',')[1];
    }
    const decoded = Utilities.base64Decode(rawBase64);
    const cleanCaption = String(data.caption || 'K8A1_KyNiem').replace(/[^a-zA-Z0-9_\u00C0-\u024F\u1E00-\u1EFF]/g, '_');
    const fileName = cleanCaption + '_' + Date.now() + '.jpg';
    const blob = Utilities.newBlob(decoded, 'image/jpeg', fileName);
    const file = folder.createFile(blob);
    
    // Cấp quyền xem cho bất kỳ ai có link
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    const fileId = file.getId();
    const photoItem = {
      id: fileId,
      url: 'https://lh3.googleusercontent.com/d/' + fileId + '=w1600',
      thumbnail: 'https://lh3.googleusercontent.com/d/' + fileId + '=w600',
      driveUrl: file.getUrl(),
      caption: data.caption || file.getName().replace(/\.[^/.]+$/, ''),
      date: formatDate(new Date())
    };

    return {
      status: 'success',
      message: 'Tải ảnh lên Google Drive thành công!',
      data: photoItem,
      fileId: fileId,
      viewUrl: file.getUrl()
    };
  } catch (e) {
    return { status: 'error', message: 'Lỗi upload Drive: ' + e.toString() };
  }
}

/**
 * Tải ảnh chứng từ / bill nộp quỹ lên thư mục con "ChungTu_QuyLop_K8A1" trong Drive
 */
function uploadFundReceiptToDrive(data) {
  const rootFolderId = CONFIG.DRIVE_FOLDER_ID || "1Skmip1HQhmXan-58kwbY_msamP-bWokq";
  let rootFolder = null;

  // 1. Mở thư mục gốc
  if (rootFolderId) {
    try {
      rootFolder = DriveApp.getFolderById(rootFolderId);
    } catch (e) {
      console.warn("Không mở được root folder " + rootFolderId);
    }
  }

  if (!rootFolder) {
    try {
      const folders = DriveApp.getFoldersByName("K8A1_KyNiem_20Nam");
      if (folders.hasNext()) {
        rootFolder = folders.next();
      } else {
        rootFolder = DriveApp.createFolder("K8A1_KyNiem_20Nam");
        rootFolder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      }
    } catch (e) {
      rootFolder = DriveApp.getRootFolder();
    }
  }

  // 2. Tự động tạo hoặc mở thư mục con lưu chứng từ: "ChungTu_QuyLop_K8A1"
  let receiptFolder = null;
  try {
    const subFolders = rootFolder.getFoldersByName("ChungTu_QuyLop_K8A1");
    if (subFolders.hasNext()) {
      receiptFolder = subFolders.next();
    } else {
      receiptFolder = rootFolder.createFolder("ChungTu_QuyLop_K8A1");
      receiptFolder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    }
  } catch (e) {
    receiptFolder = rootFolder;
  }

  // 3. Giải mã file base64 và lưu
  try {
    let rawBase64 = data.fileData || '';
    if (rawBase64.indexOf(',') > -1) {
      rawBase64 = rawBase64.split(',')[1];
    }
    const decoded = Utilities.base64Decode(rawBase64);
    const cleanName = String(data.fullName || 'ThanhVien').replace(/[^a-zA-Z0-9_\u00C0-\u024F\u1E00-\u1EFF]/g, '_');
    const cleanPhone = String(data.phone || '').replace(/[^0-9]/g, '');
    const amountStr = data.fundAmount ? '_' + data.fundAmount + 'd' : '';
    const fileName = 'Bill_' + cleanName + (cleanPhone ? '_' + cleanPhone : '') + amountStr + '_' + Date.now() + '.jpg';
    
    const blob = Utilities.newBlob(decoded, data.mimeType || 'image/jpeg', fileName);
    const file = receiptFolder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    const fileId = file.getId();
    const cdnUrl = 'https://lh3.googleusercontent.com/d/' + fileId + '=w1600';
    const driveUrl = file.getUrl();

    // 4. Nếu có phone hoặc fullName, tự động đồng bộ vào Sheet RSVP (Cột 13: fundReceiptUrl)
    if (data.phone || data.fullName) {
      const targetStatus = data.fundStatus || (data.fundAuditedBy ? 'paid' : 'pending');
      try {
        updateRSVP({
          phone: data.phone,
          fullName: data.fullName,
          fundReceiptUrl: cdnUrl,
          fundStatus: targetStatus,
          fundAmount: data.fundAmount || 500000,
          fundPaymentMethod: data.fundPaymentMethod || 'bank_transfer',
          fundPaidAt: data.fundPaidAt || formatDate(new Date()),
          fundAuditedBy: data.fundAuditedBy || '',
          fundNote: data.fundNote || ('Thành viên tự tải lên bill ' + (data.fundAmount || 500000).toLocaleString('vi-VN') + 'đ')
        });
      } catch (errSync) {
        console.warn("Lỗi sync sheet: " + errSync);
      }
    }

    return {
      status: 'success',
      message: 'Đã lưu chứng từ nộp quỹ thành công vào thư mục ChungTu_QuyLop_K8A1!',
      fileId: fileId,
      url: cdnUrl,
      driveUrl: driveUrl,
      fileName: fileName
    };
  } catch (e) {
    return { status: 'error', message: 'Lỗi upload chứng từ Drive: ' + e.toString() };
  }
}

function getViewCount() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(CONFIG.VIEW_COUNTER_SHEET_NAME);
    if (!sheet) {
      sheet = ss.insertSheet(CONFIG.VIEW_COUNTER_SHEET_NAME);
      sheet.getRange(1, 1).setValue(1258);
    }
    const count = Number(sheet.getRange(1, 1).getValue()) || 1258;
    return { status: 'success', count: count, views: count };
  } catch (e) {
    return { status: 'success', count: 1258, views: 1258 };
  }
}

function recordPageView() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(CONFIG.VIEW_COUNTER_SHEET_NAME);
    if (!sheet) {
      sheet = ss.insertSheet(CONFIG.VIEW_COUNTER_SHEET_NAME);
      sheet.getRange(1, 1).setValue(1258);
    }
    let current = Number(sheet.getRange(1, 1).getValue()) || 1258;
    current += 1;
    sheet.getRange(1, 1).setValue(current);
    return { status: 'success', count: current, views: current };
  } catch (e) {
    return { status: 'success', count: 1259, views: 1259 };
  }
}

function formatDate(date) {
  if (!(date instanceof Date)) return String(date);
  const pad = (n) => (n < 10 ? '0' + n : n);
  return \`\${pad(date.getDate())}/\${pad(date.getMonth() + 1)}/\${date.getFullYear()} \${pad(date.getHours())}:\${pad(date.getMinutes())}\`;
}

/**
 * -------------------------------------------------------------
 * 1. ĐỒNG BỘ CẤU HÌNH SỰ KIỆN (SHEET: "Cau_Hinh")
 * Lưu Địa điểm, Thời gian, Thư ngỏ, Tài khoản Quỹ, Banner
 * -------------------------------------------------------------
 */
function getEventConfig() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(CONFIG.CONFIG_SHEET_NAME);
    if (!sheet) {
      sheet = ss.insertSheet(CONFIG.CONFIG_SHEET_NAME);
      sheet.appendRow(['Khoa_Key', 'Gia_Tri_Value', 'Mo_Ta_Description', 'Ngay_Cap_Nhat']);
      sheet.getRange(1, 1, 1, 4).setFontWeight('bold').setBackground('#FAF3E0');
      return { status: 'success', data: {} };
    }

    const rows = sheet.getDataRange().getValues();
    const config = {};
    for (let i = 1; i < rows.length; i++) {
      const key = String(rows[i][0] || '').trim();
      if (key) {
        let val = rows[i][1];
        if (key === 'fundAmountPerPerson' || key === 'heroBannerPosition') {
          val = Number(val) || 0;
        }
        config[key] = val;
      }
    }
    return { status: 'success', data: config };
  } catch (err) {
    return { status: 'error', message: err.toString(), data: {} };
  }
}

function saveEventConfig(postData) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(CONFIG.CONFIG_SHEET_NAME);
    if (!sheet) {
      sheet = ss.insertSheet(CONFIG.CONFIG_SHEET_NAME);
      sheet.appendRow(['Khoa_Key', 'Gia_Tri_Value', 'Mo_Ta_Description', 'Ngay_Cap_Nhat']);
      sheet.getRange(1, 1, 1, 4).setFontWeight('bold').setBackground('#FAF3E0');
    }

    const newConfig = postData.config || postData;
    if (typeof newConfig !== 'object') {
      return { status: 'error', message: 'Dữ liệu cấu hình không hợp lệ' };
    }

    const rows = sheet.getDataRange().getValues();
    const keyToRowIndex = {};
    for (let i = 1; i < rows.length; i++) {
      const key = String(rows[i][0] || '').trim();
      if (key) keyToRowIndex[key] = i + 1;
    }

    const nowStr = formatDate(new Date());
    for (const [key, value] of Object.entries(newConfig)) {
      if (key === 'action') continue;
      const rowIndex = keyToRowIndex[key];
      const valToSave = typeof value === 'object' ? JSON.stringify(value) : String(value ?? '');
      if (rowIndex) {
        sheet.getRange(rowIndex, 2).setValue(valToSave);
        sheet.getRange(rowIndex, 4).setValue(nowStr);
      } else {
        sheet.appendRow([key, valToSave, '', nowStr]);
        keyToRowIndex[key] = sheet.getLastRow();
      }
    }

    return { status: 'success', message: 'Đã lưu cấu hình vào Google Sheet thành công!', data: newConfig };
  } catch (err) {
    return { status: 'error', message: err.toString() };
  }
}

/**
 * -------------------------------------------------------------
 * 2. ĐỒNG BỘ MEDIA (SHEET: "Media_Cai_Dat")
 * Lưu danh sách video kỷ niệm và media địa điểm Crown Palace
 * -------------------------------------------------------------
 */
function getMediaSettings() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(CONFIG.MEDIA_SHEET_NAME);
    if (!sheet) {
      sheet = ss.insertSheet(CONFIG.MEDIA_SHEET_NAME);
      sheet.appendRow(['Loai_Media', 'Du_Lieu_JSON', 'Ngay_Cap_Nhat']);
      sheet.getRange(1, 1, 1, 3).setFontWeight('bold').setBackground('#FAF3E0');
      return { status: 'success', data: { videos: [], venueMedia: [] } };
    }

    const rows = sheet.getDataRange().getValues();
    let videos = [];
    let venueMedia = [];

    for (let i = 1; i < rows.length; i++) {
      const type = String(rows[i][0] || '').trim();
      const rawJson = String(rows[i][1] || '').trim();
      if (!rawJson) continue;
      try {
        if (type === 'videos') videos = JSON.parse(rawJson);
        if (type === 'venue_media') venueMedia = JSON.parse(rawJson);
      } catch (e) {}
    }

    return { status: 'success', data: { videos: videos, venueMedia: venueMedia } };
  } catch (err) {
    return { status: 'error', message: err.toString(), data: { videos: [], venueMedia: [] } };
  }
}

function saveMediaSettings(postData) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(CONFIG.MEDIA_SHEET_NAME);
    if (!sheet) {
      sheet = ss.insertSheet(CONFIG.MEDIA_SHEET_NAME);
      sheet.appendRow(['Loai_Media', 'Du_Lieu_JSON', 'Ngay_Cap_Nhat']);
      sheet.getRange(1, 1, 1, 3).setFontWeight('bold').setBackground('#FAF3E0');
    }

    const nowStr = formatDate(new Date());
    const rows = sheet.getDataRange().getValues();
    let videoRow = null;
    let venueMediaRow = null;

    for (let i = 1; i < rows.length; i++) {
      const type = String(rows[i][0] || '').trim();
      if (type === 'videos') videoRow = i + 1;
      if (type === 'venue_media') venueMediaRow = i + 1;
    }

    if (postData.videos !== undefined) {
      const jsonStr = JSON.stringify(postData.videos);
      if (videoRow) {
        sheet.getRange(videoRow, 2).setValue(jsonStr);
        sheet.getRange(videoRow, 3).setValue(nowStr);
      } else {
        sheet.appendRow(['videos', jsonStr, nowStr]);
      }
    }

    if (postData.venueMedia !== undefined) {
      const jsonStr = JSON.stringify(postData.venueMedia);
      if (venueMediaRow) {
        sheet.getRange(venueMediaRow, 2).setValue(jsonStr);
        sheet.getRange(venueMediaRow, 3).setValue(nowStr);
      } else {
        sheet.appendRow(['venue_media', jsonStr, nowStr]);
      }
    }

    return { status: 'success', message: 'Đã lưu Media vào Google Sheet thành công!' };
  } catch (err) {
    return { status: 'error', message: err.toString() };
  }
}

/**
 * -------------------------------------------------------------
 * 3. ĐỒNG BỘ DANH BẠ SĨ SỐ LỚP K8A1 (SHEET: "Danh_Sach_Lop")
 * Quản lý danh sách thành viên, biệt danh, SĐT, chức vụ, cỡ áo
 * -------------------------------------------------------------
 */
function initRosterSheet(sheet) {
  const headers = ['Mã TV', 'Họ và tên', 'Biệt danh', 'Số điện thoại', 'Vai trò', 'Giới tính', 'Size áo', 'Ghi chú', 'Ngày cập nhật'];
  sheet.appendRow(headers);
  sheet.getRange(1, 1, 1, 9).setFontWeight('bold').setBackground('#FAF3E0');

  const defaultMembers = [
    ['m01', 'Nguyễn Tuấn Anh', 'Tuấn Báo', "'0988123456", 'Bí thư', 'Nam', 'L', '', 'Khởi tạo'],
    ['m02', 'Trần Thị Thanh Hương', 'Hương Béo', "'0912345678", 'Lớp phó', 'Nữ', 'M', '', 'Khởi tạo'],
    ['m03', 'Lê Hoàng Nam', 'Nam Còi', "'0977889900", 'Thành viên', 'Nam', 'XL', '', 'Khởi tạo'],
    ['m04', 'Phạm Đức Thắng', 'Thắng Đầu Gấu', "'0903112233", 'Thành viên', 'Nam', 'L', '', 'Khởi tạo'],
    ['m05', 'Vũ Mai Phương', 'Phương Mèo', "'0966554433", 'Thủ quỹ', 'Nữ', 'S', '', 'Khởi tạo'],
    ['m06', 'Đỗ Hoàng Long', 'Long Kều', "'0919337588", 'Ban Liên Lạc (Admin)', 'Nam', 'XL', '', 'Khởi tạo'],
    ['m07', 'Nguyễn Thái Bảo', 'Bảo Cận', '', 'Lớp trưởng', 'Nam', 'L', '', 'Khởi tạo'],
    ['m08', 'Bùi Quang Huy', 'Huy Lắc', '', 'Thành viên', 'Nam', 'L', '', 'Khởi tạo'],
    ['m09', 'Hoàng Văn Hải', 'Hải Bánh', '', 'Thành viên', 'Nam', 'M', '', 'Khởi tạo'],
    ['m10', 'Đặng Thùy Dung', 'Dung Điệu', '', 'Thành viên', 'Nữ', 'M', '', 'Khởi tạo'],
    ['m11', 'Lê Thu Trang', 'Trang Ốc', '', 'Thành viên', 'Nữ', 'S', '', 'Khởi tạo'],
    ['m12', 'Nguyễn Minh Đức', 'Đức Còi', '', 'Thành viên', 'Nam', 'M', '', 'Khởi tạo'],
    ['m13', 'Phạm Thùy Linh', 'Linh Nhím', '', 'Thành viên', 'Nữ', 'S', '', 'Khởi tạo'],
    ['m14', 'Dương Quốc Toàn', 'Toàn Xoăn', '', 'Thành viên', 'Nam', 'XL', '', 'Khởi tạo'],
    ['m15', 'Vũ Tuấn Dũng', 'Dũng Béo', '', 'Thành viên', 'Nam', '2XL', '', 'Khởi tạo'],
    ['m16', 'Trần Phương Thảo', 'Thảo Xinh', '', 'Thành viên', 'Nữ', 'M', '', 'Khởi tạo'],
    ['m17', 'Ngô Quang Vinh', 'Vinh Râu', '', 'Thành viên', 'Nam', 'L', '', 'Khởi tạo'],
    ['m18', 'Đoàn Thị Bích Ngọc', 'Ngọc Nấm', '', 'Thành viên', 'Nữ', 'S', '', 'Khởi tạo'],
    ['m19', 'Trịnh Văn Quân', 'Quân Tàu', '', 'Thành viên', 'Nam', 'L', '', 'Khởi tạo'],
    ['m20', 'Đinh Hoàng Yến', 'Yến Phụng', '', 'Thành viên', 'Nữ', 'M', '', 'Khởi tạo'],
    ['m21', 'Phan Minh Trí', 'Trí Rùa', '', 'Thành viên', 'Nam', 'M', '', 'Khởi tạo'],
    ['m22', 'Mai Anh Tuấn', 'Tuấn Đen', '', 'Thành viên', 'Nam', 'L', '', 'Khởi tạo'],
    ['m23', 'Đỗ Thúy Hằng', 'Hằng Nga', '', 'Thành viên', 'Nữ', 'S', '', 'Khởi tạo'],
    ['m24', 'Hà Việt Cường', 'Cường Đôla', '', 'Thành viên', 'Nam', 'XL', '', 'Khởi tạo'],
    ['m25', 'Tạ Thị Thu Hà', 'Hà Mít', '', 'Thành viên', 'Nữ', 'M', '', 'Khởi tạo'],
    ['m26', 'Lưu Đức Trọng', 'Trọng Kính', '', 'Thành viên', 'Nam', 'L', '', 'Khởi tạo'],
    ['m27', 'Đào Diệu Linh', 'Linh Tít', '', 'Thành viên', 'Nữ', 'S', '', 'Khởi tạo'],
    ['m28', 'Lý Tuấn Phong', 'Phong Gió', '', 'Thành viên', 'Nam', 'L', '', 'Khởi tạo'],
    ['m29', 'Chu Thị Mai Anh', 'Mai Hoa', '', 'Thành viên', 'Nữ', 'M', '', 'Khởi tạo'],
    ['m30', 'Dương Đình Khoa', 'Khoa Học', '', 'Thành viên', 'Nam', 'L', '', 'Khởi tạo'],
    ['m31', 'Phùng Thị Kim Oanh', 'Oanh Vàng', '', 'Thành viên', 'Nữ', 'S', '', 'Khởi tạo'],
    ['m32', 'Lương Việt Hưng', 'Hưng Híp', '', 'Thành viên', 'Nam', 'M', '', 'Khởi tạo'],
    ['m33', 'Bùi Thu Hương', 'Hương Mây', '', 'Thành viên', 'Nữ', 'M', '', 'Khởi tạo'],
    ['m34', 'Nguyễn Xuân Kiên', 'Kiên Nhẫn', '', 'Thành viên', 'Nam', 'XL', '', 'Khởi tạo'],
    ['m35', 'Hoàng Thị Minh Châu', 'Châu Báu', '', 'Thành viên', 'Nữ', 'S', '', 'Khởi tạo'],
    ['m36', 'Phạm Ngọc Long', 'Long Nhỏ', '', 'Thành viên', 'Nam', 'M', '', 'Khởi tạo'],
    ['m37', 'Lê Thị Quỳnh Trang', 'Trang Moon', '', 'Thành viên', 'Nữ', 'M', '', 'Khởi tạo'],
    ['m38', 'Vũ Trọng Nghĩa', 'Nghĩa Khí', '', 'Thành viên', 'Nam', 'L', '', 'Khởi tạo'],
    ['m39', 'Cao Thị Bích Thủy', 'Thủy Tiên', '', 'Thành viên', 'Nữ', 'S', '', 'Khởi tạo'],
    ['m40', 'Triệu Văn Đạt', 'Đạt Chuẩn', '', 'Thành viên', 'Nam', 'L', '', 'Khởi tạo']
  ];
  sheet.getRange(2, 1, defaultMembers.length, 9).setValues(defaultMembers);
}

function getClassRoster() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(CONFIG.ROSTER_SHEET_NAME);
    if (!sheet) {
      sheet = ss.insertSheet(CONFIG.ROSTER_SHEET_NAME);
      initRosterSheet(sheet);
    }
    if (sheet.getLastRow() <= 1) {
      initRosterSheet(sheet);
    }

    const rows = sheet.getDataRange().getValues();
    const members = [];
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const id = String(row[0] || ('m' + (i < 10 ? '0' + i : i))).trim();
      const fullName = String(row[1] || '').trim();
      if (!fullName) continue;
      const nickname = String(row[2] || '').trim();
      let phone = String(row[3] || '').trim();
      if (phone.startsWith("'")) phone = phone.substring(1);
      const role = String(row[4] || 'Thành viên').trim();
      const genderStr = String(row[5] || 'Nam').toLowerCase();
      const gender = (genderStr.includes('nữ') || genderStr === 'female') ? 'female' : 'male';
      const shirtSize = String(row[6] || 'L').trim().toUpperCase();
      const note = String(row[7] || '').trim();

      members.push({
        id: id,
        fullName: fullName,
        nickname: nickname,
        phone: phone,
        role: role,
        gender: gender,
        shirtSize: shirtSize,
        note: note
      });
    }

    return { status: 'success', data: members, total: members.length };
  } catch (err) {
    return { status: 'error', message: err.toString(), data: [] };
  }
}

function saveClassRoster(postData) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(CONFIG.ROSTER_SHEET_NAME);
    if (!sheet) {
      sheet = ss.insertSheet(CONFIG.ROSTER_SHEET_NAME);
    }
    const roster = postData.roster || [];
    if (!Array.isArray(roster)) {
      return { status: 'error', message: 'Dữ liệu danh bạ không đúng định dạng mảng!' };
    }

    sheet.clear();
    const headers = ['Mã TV', 'Họ và tên', 'Biệt danh', 'Số điện thoại', 'Vai trò', 'Giới tính', 'Size áo', 'Ghi chú', 'Ngày cập nhật'];
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, 9).setFontWeight('bold').setBackground('#FAF3E0');

    const nowStr = formatDate(new Date());
    const rows = roster.map((m, idx) => {
      const id = String(m.id || ('m' + (idx < 9 ? '0' + (idx + 1) : (idx + 1))));
      const fullName = String(m.fullName || '').trim();
      const nickname = String(m.nickname || '').trim();
      let phone = String(m.phone || '').trim();
      if (phone && !phone.startsWith("'")) phone = "'" + phone;
      const role = String(m.role || 'Thành viên').trim();
      const gender = (m.gender === 'female' || String(m.gender).includes('Nữ')) ? 'Nữ' : 'Nam';
      const shirtSize = String(m.shirtSize || 'L').trim().toUpperCase();
      const note = String(m.note || '').trim();
      return [id, fullName, nickname, phone, role, gender, shirtSize, note, nowStr];
    });

    if (rows.length > 0) {
      sheet.getRange(2, 1, rows.length, 9).setValues(rows);
    }

    return { status: 'success', message: 'Đã lưu danh bạ ' + rows.length + ' thành viên vào Google Sheet thành công!', count: rows.length };
  } catch (err) {
    return { status: 'error', message: err.toString() };
  }
}

function addClassMember(postData) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(CONFIG.ROSTER_SHEET_NAME);
    if (!sheet) {
      sheet = ss.insertSheet(CONFIG.ROSTER_SHEET_NAME);
      initRosterSheet(sheet);
    }

    const member = postData.member || postData;
    const fullName = String(member.fullName || '').trim();
    if (!fullName) {
      return { status: 'error', message: 'Họ và tên không được để trống' };
    }

    const lastRow = sheet.getLastRow();
    const nextIdx = lastRow;
    const id = String(member.id || ('m' + (nextIdx < 10 ? '0' + nextIdx : nextIdx)));
    const nickname = String(member.nickname || '').trim();
    let phone = String(member.phone || '').trim();
    if (phone && !phone.startsWith("'")) phone = "'" + phone;
    const role = String(member.role || 'Thành viên').trim();
    const gender = (member.gender === 'female' || String(member.gender).includes('Nữ')) ? 'Nữ' : 'Nam';
    const shirtSize = String(member.shirtSize || 'L').trim().toUpperCase();
    const note = String(member.note || '').trim();
    const nowStr = formatDate(new Date());

    sheet.appendRow([id, fullName, nickname, phone, role, gender, shirtSize, note, nowStr]);
    return { status: 'success', message: 'Đã thêm bạn ' + fullName + ' vào Danh Bạ Lớp thành công!', id: id };
  } catch (err) {
    return { status: 'error', message: err.toString() };
  }
}

function updateClassMember(postData) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(CONFIG.ROSTER_SHEET_NAME);
    if (!sheet) return { status: 'error', message: 'Không tìm thấy sheet Danh_Sach_Lop' };

    const member = postData.member || postData;
    const memberId = String(member.id || '').trim();
    const searchPhone = normalizePhone(member.phone);
    const searchName = String(member.fullName || '').toLowerCase().trim();

    const rows = sheet.getDataRange().getValues();
    let targetRowIndex = -1;

    for (let i = 1; i < rows.length; i++) {
      const rowId = String(rows[i][0] || '').trim();
      const rowPhone = normalizePhone(rows[i][3]);
      const rowName = String(rows[i][1] || '').toLowerCase().trim();

      if (memberId && rowId === memberId) {
        targetRowIndex = i + 1;
        break;
      }
      if (searchPhone && rowPhone && searchPhone === rowPhone) {
        targetRowIndex = i + 1;
        break;
      }
      if (searchName && rowName && searchName === rowName) {
        targetRowIndex = i + 1;
        break;
      }
    }

    if (targetRowIndex === -1) {
      return { status: 'error', message: 'Không tìm thấy thành viên cần cập nhật' };
    }

    const nowStr = formatDate(new Date());
    if (member.fullName) sheet.getRange(targetRowIndex, 2).setValue(String(member.fullName).trim());
    if (member.nickname !== undefined) sheet.getRange(targetRowIndex, 3).setValue(String(member.nickname).trim());
    if (member.phone !== undefined) {
      let p = String(member.phone).trim();
      if (p && !p.startsWith("'")) p = "'" + p;
      sheet.getRange(targetRowIndex, 4).setValue(p);
    }
    if (member.role !== undefined) sheet.getRange(targetRowIndex, 5).setValue(String(member.role).trim());
    if (member.gender !== undefined) {
      const g = (member.gender === 'female' || String(member.gender).includes('Nữ')) ? 'Nữ' : 'Nam';
      sheet.getRange(targetRowIndex, 6).setValue(g);
    }
    if (member.shirtSize !== undefined) sheet.getRange(targetRowIndex, 7).setValue(String(member.shirtSize).trim().toUpperCase());
    if (member.note !== undefined) sheet.getRange(targetRowIndex, 8).setValue(String(member.note).trim());
    sheet.getRange(targetRowIndex, 9).setValue(nowStr);

    return { status: 'success', message: 'Đã cập nhật thông tin thành viên thành công!' };
  } catch (err) {
    return { status: 'error', message: err.toString() };
  }
}

function deleteClassMember(postData) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(CONFIG.ROSTER_SHEET_NAME);
    if (!sheet) return { status: 'error', message: 'Không tìm thấy sheet Danh_Sach_Lop' };

    const memberId = String(postData.id || postData.memberId || '').trim();
    const memberPhone = normalizePhone(postData.phone);
    const memberName = String(postData.fullName || '').toLowerCase().trim();

    const rows = sheet.getDataRange().getValues();
    let targetRowIndex = -1;

    for (let i = 1; i < rows.length; i++) {
      const rowId = String(rows[i][0] || '').trim();
      const rowPhone = normalizePhone(rows[i][3]);
      const rowName = String(rows[i][1] || '').toLowerCase().trim();

      if (memberId && rowId === memberId) {
        targetRowIndex = i + 1;
        break;
      }
      if (memberPhone && rowPhone && memberPhone === rowPhone) {
        targetRowIndex = i + 1;
        break;
      }
      if (memberName && rowName && memberName === rowName) {
        targetRowIndex = i + 1;
        break;
      }
    }

    if (targetRowIndex === -1) {
      return { status: 'error', message: 'Không tìm thấy thành viên để xóa' };
    }

    sheet.deleteRow(targetRowIndex);
    return { status: 'success', message: 'Đã xóa thành viên khỏi Danh Bạ Lớp!' };
  } catch (err) {
    return { status: 'error', message: err.toString() };
  }
}

/**
 * -------------------------------------------------------------
 * 4. TOÀN BỘ CƠ SỞ DỮ LIỆU ĐỒNG BỘ 1 LỆNH (SINGLE SOURCE OF TRUTH)
 * -------------------------------------------------------------
 */
function getAllData() {
  try {
    const rsvp = (getRSVPList() || {}).data || [];
    const wishes = (getWishesList() || {}).data || [];
    const config = (getEventConfig() || {}).data || {};
    const media = (getMediaSettings() || {}).data || { videos: [], venueMedia: [] };
    const roster = (getClassRoster() || {}).data || [];
    const viewCount = (getViewCount() || {}).count || 1258;

    return {
      status: 'success',
      data: {
        rsvp: rsvp,
        wishes: wishes,
        config: config,
        media: media,
        roster: roster,
        viewCount: viewCount
      }
    };
  } catch (err) {
    return { status: 'error', message: err.toString() };
  }
}
`;
