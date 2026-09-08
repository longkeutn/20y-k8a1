export type UserRole = 'guest' | 'bll' | 'treasurer' | 'admin';

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
  rowId?: string;              // Số dòng trong Google Sheet để đối soát chính xác 1-1
  memberId?: string;           // ID thành viên trong Danh Bạ Lớp (VD: 'm01', 'm41') để phân biệt người trùng tên
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
  fundReceiptUrl?: string;     // URL ảnh biên lai / UNC / Bill chuyển khoản trên Google Drive (Admin Only)
  hasReceipt?: boolean;        // Cờ đánh dấu đã nộp biên lai (Public an toàn không lộ URL ảnh)
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

export type TeacherInvitationStatus = 'attending' | 'pending' | 'declined' | 'wishing' | 'memorial';

export interface TeacherData {
  id: string;
  name: string;
  gender?: 'Thầy' | 'Cô';
  birthYear?: string;
  phone?: string;
  relativePhone?: string;
  address?: string;
  subject: string;
  role: string;
  workStatus?: string;
  inviteProgress?: string;
  status: 'attending' | 'wishing' | 'pending' | 'declined' | 'memorial';
  companion?: string;
  transportation?: string;
  coordinator?: string;
  healthNotes?: string;
  avatarUrl?: string;
  quote?: string;
  updatedAt?: string;
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
  | 'event'           // Thu sự kiện họp lớp 20 năm (mặc định 700k/bạn theo eventConfig)
  | 'sponsor'         // Ủng hộ & Tài trợ của mạnh thường quân
  | 'extra_shirt'     // Mua thêm áo đồng phục Polo (cho người thân / con cái)
  | 'guest'           // Kinh phí người thân / phu huynh / F1 đi kèm
  | 'teacher_tribute' // Quỹ tri ân Thầy Cô giáo (hoa tươi, quà tặng)
  | 'alumni_care'     // Quỹ tình nghĩa & Thăm hỏi K8A1 (hiếu hỷ, tương trợ bạn bè)
  | 'annual'          // Quỹ thường niên định kỳ (100k/người/năm theo Điều 4 Quy chế)
  | 'other_income';   // Thu khác & Vãng lai (Lãi ngân hàng, chuyển kỳ trước...)

export interface IncomeItem {
  id: string;                      // Mã khoản thu (vd: 'inc-1725500000000')
  title: string;                   // Tên / Nội dung khoản thu (vd: "Đóng quỹ họp lớp 20 năm", "Mua thêm 2 áo polo")
  category: IncomeCategory;        // Phân loại danh mục thu
  amount: number;                  // Số tiền thu (VNĐ)
  date: string;                    // Ngày thu (YYYY-MM-DD hoặc DD/MM/YYYY)
  payerName: string;               // Họ và tên người nộp (thành viên hoặc nhà tài trợ bên ngoài)
  payerPhone?: string;             // Số điện thoại người nộp
  memberId?: string;               // Mã liên kết thành viên trong Danh Bạ K8A1 (nếu là học sinh của lớp)
  paymentMethod: 'bank_transfer' | 'cash' | 'other'; // Hình thức: Chuyển khoản, Tiền mặt, Khác
  auditor?: string;                // Người tiếp nhận thu / Thủ quỹ đối soát
  receiptUrl?: string;             // Link ảnh biên lai / UNC / Bill chuyển khoản trên Google Drive
  eventScope?: string;             // Phạm vi sự kiện (vd: "Kỷ niệm 20 năm", "Thường niên 2026")
  note?: string;                   // Ghi chú chi tiết
  createdAt?: string;              // Thời gian tạo bản ghi
}

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



