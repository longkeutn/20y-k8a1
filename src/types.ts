export type UserRole = 'guest' | 'bll' | 'admin';

export interface ClassMember {
  id: string;
  fullName: string;
  nickname?: string;
  phone?: string;
  role?: string;           // 'Lớp trưởng' | 'Lớp phó' | 'Bí thư' | 'Thủ quỹ' | 'Thành viên' | 'Thầy cô'
  gender?: 'male' | 'female';
  shirtSize?: string;
  province?: string;       // Tỉnh / Thành phố sinh sống hiện tại (VD: Thái Nguyên, Hà Nội, TP.HCM...)
  note?: string;
}

export interface RsvpData {
  id?: string;
  fullName: string;
  nickname?: string;
  phone: string;
  status: 'yes' | 'no';
  className?: string;
  shirtSize?: string;
  province?: string;           // Tỉnh / Thành phố xuất phát về họp lớp
  message?: string;
  submittedAt?: string;
  checkedIn?: boolean;
  checkedInAt?: string;
  avatarUrl?: string;
  fundStatus?: 'paid' | 'unpaid' | 'pending' | 'exempt';
  fundAmount?: number;
  fundNote?: string;
  fundReceiptUrl?: string;     // URL ảnh biên lai / UNC / Bill chuyển khoản trên Google Drive
  fundPaidAt?: string;         // Thời gian xác nhận đóng quỹ
  fundPaymentMethod?: 'bank_transfer' | 'cash' | 'other'; // Hình thức đóng
  fundAuditedBy?: string;      // Tên thủ quỹ / Admin đối soát
}

export interface WishData {
  id?: string;
  fullName: string;
  className?: string;
  message: string;
  tag?: string;
  likes?: number;
  submittedAt?: string;
  isPinned?: boolean;
}

export interface TeacherData {
  id: string;
  name: string;
  role: string;
  subject: string;
  status: 'attending' | 'wishing' | 'pending';
  quote?: string;
  avatarUrl?: string;
}

export interface TeacherTribute {
  id: string;
  teacherId?: string;
  teacherName: string;
  studentName: string;
  className?: string;
  message: string;
  submittedAt: string;
  likes?: number;
}

export interface TimelineMilestone {
  id: string;
  year: string;
  period: string;
  title: string;
  description: string;
  tag: string;
  imageUrl?: string;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface PollItem {
  id: string;
  question: string;
  options: { id: string; text: string; votes: number }[];
  userVotedId?: string;
}

export interface ScheduleItem {
  time: string;
  title: string;
  desc: string;
  location?: string;
  iconName?: string;
}

export interface SponsorItem {
  id: string;
  name: string;
  className?: string;
  amount: number;
  note?: string;
  date: string;
}

export interface AlumniRegion {
  id: string;
  regionName: string;
  count: number;
  coordinates?: [number, number];
  membersHighlight: string[];
  note?: string;
}

export interface MemoryImage {
  id: string;
  url: string;
  caption: string;
  date?: string;
  isUserUploaded?: boolean;
}

export interface MemoryVideo {
  id: string;
  title: string;
  embedUrl: string;
  thumbnail?: string;
}

export interface ReunionConfig {
  appsScriptUrl: string;
  audioUrl: string;
  qrUrl: string;
  bankName: string;
  bankAccount: string;
  bankHolder: string;
  transferSyntax: string;
}

export interface ActivityToast {
  id: string;
  type: 'rsvp' | 'wish';
  author: string;
  className?: string;
  text: string;
  timeAgo: string;
  isNew?: boolean;
}

export interface VenueMediaItem {
  id: string;
  title: string;
  url: string;
  type?: 'youtube' | 'facebook' | 'drive' | 'direct_video' | 'image';
  thumbnail?: string;
  desc?: string;
}

export interface EventConfig {
  eventTitle: string;
  eventSubtitle: string;
  eventDateText: string;
  eventTimeText: string;
  countdownTarget: string;
  venueName: string;
  venueSubtitle?: string;
  venueAddress: string;
  shortAddress: string;
  mapEmbedUrl: string;
  mapDirectUrl: string;
  letterTitle: string;
  letterSubtitle: string;
  letterParagraph1: string;
  letterParagraph2: string;
  letterSignatureTitle: string;
  letterSignatureSubtitle: string;
  bankName: string;
  bankAccount: string;
  bankHolder: string;
  transferSyntax: string;
  fundAmountPerPerson: number;
  customQrUrl?: string;
  bankCode?: string;
  qrTemplate?: 'compact' | 'compact2' | 'qr_only';
  heroBannerUrl?: string;
  heroBannerPosition?: number;
}

export type ExpenseCategory = 
  | 'care'       // Hiếu hỷ & Thăm hỏi (theo quy chế: thăm viếng phụ mẫu 500k, ốm đau 300k...)
  | 'teacher'    // Tri ân Thầy Cô (20/11, Tết, quà kỷ niệm...)
  | 'party'      // Tiệc & Sự kiện gặp mặt (Crown Palace, đồ uống, liên hoan định kỳ...)
  | 'souvenir'   // Đồng phục & Kỷ niệm (Áo polo K8A1, thẻ học sinh, kỷ yếu...)
  | 'media'      // Sân khấu & Truyền thông (Backdrop, âm thanh, quay chụp phóng sự, webapp...)
  | 'other';     // Chi khác & Dự phòng (Đạo cụ, nước suối, vật phẩm chung...)

export type IncomeCategory = 
  | 'event'        // Thu sự kiện họp lớp (500k/bạn)
  | 'annual'       // Quỹ thường niên định kỳ (100k/người/năm theo Điều 4 Quy chế)
  | 'sponsor'      // Ủng hộ & Tài trợ của mạnh thường quân
  | 'other_income';// Thu khác (Lãi ngân hàng, chuyển kỳ trước...)

export interface ExpenseItem {
  id: string;                      // Mã khoản chi (vd: 'exp-1725500000000')
  title: string;                   // Tên khoản chi (vd: "Đặt cọc tiệc Crown Palace", "Phúng viếng phụ mẫu bạn Tuấn Thành")
  category: ExpenseCategory;       // Phân loại nhóm chi chuẩn quy chế
  amount: number;                  // Số tiền chi (VNĐ)
  date: string;                    // Ngày thực hiện chi (YYYY-MM-DD hoặc DD/MM/YYYY)
  spender: string;                 // Người thực hiện chi / phụ trách chi
  recipient?: string;              // Người nhận / Đơn vị thụ hưởng (vd: "Gia đình bạn A", "Nhà hàng Crown Palace")
  receiptUrl?: string;             // Link ảnh hóa đơn / bill chuyển tiền
  eventScope?: string;             // Phạm vi sự kiện (vd: "Kỷ niệm 20 năm", "Thường niên 2026", "20/11/2026")
  note?: string;                   // Ghi chú chi tiết
  createdAt?: string;              // Thời gian tạo bản ghi
}


