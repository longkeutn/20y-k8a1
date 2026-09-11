import { MemberNoteMetadata } from '../types';

export interface ParsedMemberNote {
  meta: MemberNoteMetadata;
  raw: string;
  isJson: boolean;
  displayText: string;
}

/**
 * Danh mục chuẩn hóa Nơi ở / Tỉnh thành để lựa chọn Dropdown
 */
export const RESIDENCE_OPTIONS: { label: string; value: string }[] = [
  { label: 'Thái Nguyên (Quê hương)', value: 'Thái Nguyên' },
  { label: 'Hà Nội', value: 'Hà Nội' },
  { label: 'TP. Hồ Chí Minh (Sài Gòn)', value: 'TP. Hồ Chí Minh' },
  { label: 'Đà Nẵng', value: 'Đà Nẵng' },
  { label: 'Hải Phòng', value: 'Hải Phòng' },
  { label: 'Quảng Ninh', value: 'Quảng Ninh' },
  { label: 'Bắc Ninh', value: 'Bắc Ninh' },
  { label: 'Bắc Giang', value: 'Bắc Giang' },
  { label: 'Tuyên Quang', value: 'Tuyên Quang' },
  { label: 'Bắc Kạn', value: 'Bắc Kạn' },
  { label: 'Vĩnh Phúc', value: 'Vĩnh Phúc' },
  { label: 'Phú Thọ', value: 'Phú Thọ' },
  { label: 'Lạng Sơn', value: 'Lạng Sơn' },
  { label: 'Nước ngoài (Định cư / Du học)', value: 'Nước ngoài' },
  { label: '✨ Tùy chỉnh khác...', value: '__custom__' }
];

/**
 * Danh mục chuẩn hóa Nghề nghiệp / Lĩnh vực chuyên môn cho Dropdown
 */
export const OCCUPATION_OPTIONS: { label: string; value: string }[] = [
  { label: '💻 Kỹ sư / CNTT / Phần mềm', value: 'Kỹ sư / CNTT' },
  { label: '🩺 Bác sĩ / Y dược / Y tế', value: 'Bác sĩ / Y dược' },
  { label: '🎓 Giáo viên / Giảng viên / Giáo dục', value: 'Giáo dục / Đào tạo' },
  { label: '💼 Kinh doanh / Doanh nghiệp / Thương mại', value: 'Kinh doanh / Thương mại' },
  { label: '🏦 Tài chính / Ngân hàng / Kế toán', value: 'Tài chính / Ngân hàng' },
  { label: '🏛️ Cán bộ / Công chức / Nhà nước', value: 'Cán bộ / Công chức' },
  { label: '🏗️ Xây dựng / Kiến trúc / Kỹ thuật', value: 'Xây dựng / Kiến trúc' },
  { label: '⚖️ Luật sư / Pháp lý / Tư pháp', value: 'Luật sư / Pháp lý' },
  { label: '📢 Báo chí / Truyền thông / Marketing', value: 'Truyền thông / Marketing' },
  { label: '🎖️ Công an / Quân đội / LLVT', value: 'Lực lượng vũ trang' },
  { label: '🎨 Thiết kế / Nghệ thuật / Nhiếp ảnh', value: 'Nghệ thuật / Thiết kế' },
  { label: '☕ Dịch vụ / F&B / Khách sạn - Du lịch', value: 'Dịch vụ / Du lịch' },
  { label: '🚀 Làm việc tự do (Freelance)', value: 'Freelancer' },
  { label: '🏡 Chăm sóc gia đình / Nội trợ', value: 'Chăm sóc gia đình' },
  { label: '✨ Nghề nghiệp khác...', value: '__custom__' }
];

/**
 * Tình trạng kết nối / liên lạc giữa Ban Liên Lạc và bạn học
 */
export const CONTACT_STATUS_OPTIONS: { label: string; value: string; color: string }[] = [
  { label: '🟢 Đã kết nối thường xuyên', value: 'Đã kết nối', color: 'emerald' },
  { label: '🟡 Thỉnh thoảng trao đổi', value: 'Thỉnh thoảng', color: 'amber' },
  { label: '🔵 Mới kết nối lại gần đây', value: 'Mới kết nối', color: 'sky' },
  { label: '🟠 Cần thêm người hỗ trợ liên lạc', value: 'Cần hỗ trợ', color: 'orange' },
  { label: '🔴 Chưa có tin tức / Mất liên lạc', value: 'Chưa liên lạc được', color: 'rose' }
];

/**
 * Danh sách vai trò trong lớp K8A1
 */
export const ROSTER_ROLE_OPTIONS: string[] = [
  'Thành viên',
  'Lớp trưởng',
  'Lớp phó',
  'Bí thư',
  'Thủ quỹ',
  'Ban Liên Lạc (Admin)',
  'Thầy cô'
];

/**
 * Phân tích cú pháp chuỗi ghi chú của bạn học trong danh bạ:
 * - Hỗ trợ chuỗi JSON cấu trúc mới ({ residence: "...", workplace: "..." })
 * - Tương thích ngược với chuỗi văn bản cũ (ví dụ: "Hà Nội", "Tuyên Quang", "Đang ở Sài Gòn")
 */
export function parseMemberNote(rawNote?: string | null): ParsedMemberNote {
  if (!rawNote || typeof rawNote !== 'string' || !rawNote.trim()) {
    return {
      meta: {},
      raw: '',
      isJson: false,
      displayText: ''
    };
  }

  const clean = rawNote.trim();

  // Kiểm tra xem có phải chuỗi JSON hợp lệ không
  if (clean.startsWith('{') && clean.endsWith('}')) {
    try {
      const parsed = JSON.parse(clean);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        const anyParsed = parsed as Record<string, any>;
        const residence = anyParsed.residence || anyParsed.currentResidence || anyParsed.city || anyParsed.province || undefined;
        const workplace = anyParsed.workplace || anyParsed.company || anyParsed.agency || undefined;
        const occupation = anyParsed.occupation || anyParsed.job || anyParsed.title || undefined;
        const secondaryPhone = anyParsed.secondaryPhone || anyParsed.phone2 || anyParsed.zalo || undefined;
        
        let oldPhones: string[] | undefined = undefined;
        if (Array.isArray(anyParsed.oldPhones)) {
          oldPhones = anyParsed.oldPhones.map((p: any) => String(p).trim()).filter(Boolean);
        } else if (anyParsed.oldPhone) {
          oldPhones = [String(anyParsed.oldPhone).trim()];
        }

        const email = anyParsed.email || undefined;
        const socialLink = anyParsed.socialLink || anyParsed.facebook || anyParsed.fb || undefined;
        const contactStatus = anyParsed.contactStatus || anyParsed.status || undefined;
        const avatarUrl = anyParsed.avatarUrl || anyParsed.avatar || undefined;
        const generalNote = anyParsed.generalNote || anyParsed.note || anyParsed.desc || undefined;

        const meta: MemberNoteMetadata = {};
        if (avatarUrl) meta.avatarUrl = String(avatarUrl).trim();
        if (residence) meta.residence = String(residence).trim();
        if (workplace) meta.workplace = String(workplace).trim();
        if (occupation) meta.occupation = String(occupation).trim();
        if (secondaryPhone) meta.secondaryPhone = String(secondaryPhone).trim();
        if (oldPhones && oldPhones.length > 0) meta.oldPhones = oldPhones;
        if (email) meta.email = String(email).trim();
        if (socialLink) meta.socialLink = String(socialLink).trim();
        if (contactStatus) meta.contactStatus = String(contactStatus).trim();
        if (generalNote) meta.generalNote = String(generalNote).trim();

        // Tạo chuỗi tóm tắt hiển thị
        const parts: string[] = [];
        if (meta.residence) parts.push(`📍 ${meta.residence}`);
        if (meta.workplace) parts.push(`🏢 ${meta.workplace}`);
        if (meta.occupation) parts.push(`💼 ${meta.occupation}`);
        if (meta.secondaryPhone) parts.push(`📞 ${meta.secondaryPhone}`);
        if (meta.contactStatus) parts.push(`📶 ${meta.contactStatus}`);
        if (meta.generalNote) parts.push(meta.generalNote);

        return {
          meta,
          raw: clean,
          isJson: true,
          displayText: parts.join(' • ')
        };
      }
    } catch {
      // JSON parse error -> tiếp tục xử lý như chuỗi thường
    }
  }

  // Xử lý chuỗi thông thường (Plain text cũ)
  const isProvinceMatch = RESIDENCE_OPTIONS.some(opt => 
    opt.value !== '__custom__' && (
      clean.toLowerCase() === opt.value.toLowerCase() || 
      clean.toLowerCase().includes(opt.value.toLowerCase())
    )
  );

  const meta: MemberNoteMetadata = {
    residence: isProvinceMatch ? clean : undefined,
    generalNote: clean
  };

  return {
    meta,
    raw: clean,
    isJson: false,
    displayText: clean
  };
}

/**
 * Đóng gói dữ liệu MemberNoteMetadata thành chuỗi JSON chuẩn hóa để lưu vào Google Sheet:
 * - Tự động loại bỏ các trường rỗng / undefined
 * - Trả về chuỗi rỗng "" nếu không có trường dữ liệu nào để giữ Sheet gọn gàng
 */
export function serializeMemberNote(meta: MemberNoteMetadata): string {
  if (!meta || typeof meta !== 'object') return '';

  const cleaned: Record<string, any> = {};

  if (meta.avatarUrl && String(meta.avatarUrl).trim()) {
    cleaned.avatarUrl = String(meta.avatarUrl).trim();
  }
  if (meta.residence && String(meta.residence).trim()) {
    cleaned.residence = String(meta.residence).trim();
  }
  if (meta.workplace && String(meta.workplace).trim()) {
    cleaned.workplace = String(meta.workplace).trim();
  }
  if (meta.occupation && String(meta.occupation).trim()) {
    cleaned.occupation = String(meta.occupation).trim();
  }
  if (meta.secondaryPhone && String(meta.secondaryPhone).trim()) {
    cleaned.secondaryPhone = String(meta.secondaryPhone).trim();
  }
  if (Array.isArray(meta.oldPhones) && meta.oldPhones.length > 0) {
    const validOld = meta.oldPhones.map(p => String(p).trim()).filter(Boolean);
    if (validOld.length > 0) {
      cleaned.oldPhones = Array.from(new Set(validOld));
    }
  }
  if (meta.email && String(meta.email).trim()) {
    cleaned.email = String(meta.email).trim();
  }
  if (meta.socialLink && String(meta.socialLink).trim()) {
    cleaned.socialLink = String(meta.socialLink).trim();
  }
  if (meta.contactStatus && String(meta.contactStatus).trim()) {
    cleaned.contactStatus = String(meta.contactStatus).trim();
  }
  if (meta.generalNote && String(meta.generalNote).trim()) {
    cleaned.generalNote = String(meta.generalNote).trim();
  }

  // Nếu không có trường nào có dữ liệu
  if (Object.keys(cleaned).length === 0) {
    return '';
  }

  return JSON.stringify(cleaned);
}

/**
 * Tự động ghi nhận số điện thoại cũ vào danh sách oldPhones trong chuỗi JSON note
 */
export function appendOldPhoneToNote(currentNote: string | undefined | null, oldPhone: string): string {
  const cleanOld = String(oldPhone || '').trim();
  if (!cleanOld) return currentNote || '';

  const parsed = parseMemberNote(currentNote);
  const oldList = parsed.meta.oldPhones || [];

  if (!oldList.includes(cleanOld)) {
    parsed.meta.oldPhones = [...oldList, cleanOld];
  }

  return serializeMemberNote(parsed.meta);
}
