export interface RsvpData {
  id?: string;
  fullName: string;
  phone: string;
  status: 'yes' | 'no';
  className?: string;
  shirtSize?: string;
  message?: string;
  submittedAt?: string;
  checkedIn?: boolean;
  checkedInAt?: string;
}

export interface WishData {
  id?: string;
  fullName: string;
  className?: string;
  message: string;
  tag?: string;
  likes?: number;
  submittedAt?: string;
}

export interface TeacherData {
  id: string;
  name: string;
  role: string; // e.g. "Thầy Hiệu Trưởng", "Cô Chủ Nhiệm 12A1"
  subject: string; // e.g. "Môn Toán", "Môn Ngữ Văn"
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
  period: string; // e.g. "Tháng 09/2003"
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
  regionName: string; // e.g. "Hà Nội", "TP. Hồ Chí Minh", "Quốc tế (Nhật, Úc, Mỹ...)"
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
  appsScriptUrl: string; // User's deployed Web App URL
  audioUrl: string;      // Google Drive MP3 file direct link
  qrUrl: string;         // Google Drive QR Image direct link
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


