import { ClassMember } from '../types';

/**
 * Bảng ánh xạ chuyển đổi đầu số 11 số cũ sang 10 số mới tại Việt Nam (theo quy hoạch 2018)
 */
export const OLD_TO_NEW_VIETNAMESE_PREFIXES: Record<string, string> = {
  // Viettel
  '0162': '032', '0163': '033', '0164': '034', '0165': '035',
  '0166': '036', '0167': '037', '0168': '038', '0169': '039',
  // Mobifone
  '0120': '070', '0121': '079', '0122': '077', '0126': '076', '0128': '078',
  // Vinaphone
  '0123': '083', '0124': '084', '0125': '085', '0127': '081', '0129': '082',
  // Vietnamobile
  '0186': '056', '0188': '058',
  // Gmobile
  '0199': '059'
};

/**
 * Danh mục đầu số các nhà mạng di động tại Việt Nam
 */
export const VIETNAMESE_TELECOM_PREFIXES: Record<string, string> = {
  // Viettel (086, 096, 097, 098, 032-039)
  '086': 'Viettel', '096': 'Viettel', '097': 'Viettel', '098': 'Viettel',
  '032': 'Viettel', '033': 'Viettel', '034': 'Viettel', '035': 'Viettel',
  '036': 'Viettel', '037': 'Viettel', '038': 'Viettel', '039': 'Viettel',

  // Mobifone (089, 090, 093, 070, 076, 077, 078, 079)
  '089': 'Mobifone', '090': 'Mobifone', '093': 'Mobifone',
  '070': 'Mobifone', '076': 'Mobifone', '077': 'Mobifone', '078': 'Mobifone', '079': 'Mobifone',

  // Vinaphone (088, 091, 094, 081, 082, 083, 084, 085)
  '088': 'Vinaphone', '091': 'Vinaphone', '094': 'Vinaphone',
  '081': 'Vinaphone', '082': 'Vinaphone', '083': 'Vinaphone', '084': 'Vinaphone', '085': 'Vinaphone',

  // Vietnamobile (092, 056, 058)
  '092': 'Vietnamobile', '056': 'Vietnamobile', '058': 'Vietnamobile',

  // Wintel (055)
  '055': 'Wintel',

  // Itelecom (087)
  '087': 'Itelecom',

  // Gmobile (099, 059)
  '099': 'Gmobile', '059': 'Gmobile',

  // FPT Telecom (0775)
  '0775': 'FPT'
};

/**
 * Chuẩn hóa số điện thoại:
 * - Bỏ mọi ký tự không phải số (dấu cách, dấu gạch ngang, chấm, ngoặc đơn...)
 * - Đổi tiền tố quốc tế (+84, 84) về 0
 * - Tự động đổi đầu 11 số cũ sang 10 số mới
 */
export function normalizeVietnamesePhone(rawPhone?: any): string {
  if (rawPhone === null || rawPhone === undefined) return '';
  let str = String(rawPhone).trim();
  if (!str) return '';

  // Nếu chuỗi chứa ký tự mask (* hoặc •), trả về dạng thô hoặc rỗng nếu không phải số thật
  if (str.includes('•') || str.includes('*')) {
    return str;
  }

  let clean = str.replace(/[^0-9]/g, '');
  if (!clean) return '';

  // Chuyển 84xxxxxxxx -> 0xxxxxxxxx
  if (clean.startsWith('84') && clean.length >= 10) {
    clean = '0' + clean.slice(2);
  } else if (!clean.startsWith('0') && clean.length === 9) {
    clean = '0' + clean;
  } else if (!clean.startsWith('0') && clean.length === 10 && clean.startsWith('1')) {
    clean = '0' + clean;
  }

  // Chuyển đổi đầu 11 số cũ sang 10 số mới nếu có
  if (clean.length === 11 && clean.startsWith('01')) {
    const prefix4 = clean.slice(0, 4);
    if (OLD_TO_NEW_VIETNAMESE_PREFIXES[prefix4]) {
      clean = OLD_TO_NEW_VIETNAMESE_PREFIXES[prefix4] + clean.slice(4);
    }
  }

  return clean;
}

export interface PhoneValidationResult {
  isValid: boolean;
  phone: string;
  error?: string;
  telecom?: string;
  formatted?: string;
}

/**
 * Kiểm định số điện thoại di động Việt Nam hợp lệ:
 * - Phải có đúng 10 chữ số
 * - Bắt đầu bằng 03, 05, 07, 08, 09
 * - Thuộc một trong các nhà mạng được Bộ Thông tin & Truyền thông cấp phép
 * - Không phải là chuỗi số rác/spam như 0123456789, 0000000000
 */
export function isValidVietnamesePhone(phoneInput?: any): PhoneValidationResult {
  if (!phoneInput) {
    return { isValid: false, phone: '', error: 'Vui lòng nhập số điện thoại liên hệ.' };
  }

  const clean = normalizeVietnamesePhone(phoneInput);

  if (clean.includes('•') || clean.includes('*')) {
    return { isValid: true, phone: clean, telecom: 'Đã lưu' };
  }

  if (clean.length === 0) {
    return { isValid: false, phone: '', error: 'Số điện thoại không được để trống.' };
  }

  if (clean.length < 10) {
    return {
      isValid: false,
      phone: clean,
      error: `Số điện thoại còn thiếu ${10 - clean.length} chữ số (chuẩn 10 chữ số).`
    };
  }

  if (clean.length > 10) {
    return {
      isValid: false,
      phone: clean,
      error: `Số điện thoại thừa ${clean.length - 10} chữ số (chuẩn 10 chữ số).`
    };
  }

  // Kiểm tra đầu số hợp lệ (03x, 05x, 07x, 08x, 09x)
  const prefix3 = clean.slice(0, 3);
  const prefix4 = clean.slice(0, 4);
  const telecom = VIETNAMESE_TELECOM_PREFIXES[prefix4] || VIETNAMESE_TELECOM_PREFIXES[prefix3];

  if (!telecom) {
    return {
      isValid: false,
      phone: clean,
      error: `Đầu số "${prefix3}" không thuộc mạng di động Việt Nam (Viettel, Vina, Mobi, Vietnamobile...).`
    };
  }

  // Chặn các chuỗi rác rõ ràng
  const fakeSequences = ['0123456789', '0987654321', '0000000000'];
  if (fakeSequences.includes(clean)) {
    return {
      isValid: false,
      phone: clean,
      error: 'Số điện thoại này là chuỗi số mẫu, vui lòng nhập số điện thoại thật của bạn.'
    };
  }

  // Kiểm tra nếu 8 số cuối đều giống hệt nhau (ví dụ: 0900000000, 0911111111)
  const last8 = clean.slice(2);
  if (/^(\d)\1{7}$/.test(last8)) {
    return {
      isValid: false,
      phone: clean,
      error: 'Số điện thoại không hợp lệ (chuỗi số lặp lại bất thường).'
    };
  }

  // Định dạng chuẩn 4-3-3: 0944 685 288
  const formatted = `${clean.slice(0, 4)} ${clean.slice(4, 7)} ${clean.slice(7, 10)}`;

  return {
    isValid: true,
    phone: clean,
    telecom,
    formatted
  };
}

/**
 * Định dạng số điện thoại hiển thị đẹp mắt (0944 685 288)
 */
export function formatPhoneDisplay(raw?: any): string {
  const clean = normalizeVietnamesePhone(raw);
  if (clean.length === 10) {
    return `${clean.slice(0, 4)} ${clean.slice(4, 7)} ${clean.slice(7, 10)}`;
  }
  return String(raw || '').trim();
}

/**
 * Che mờ số điện thoại để bảo vệ thông tin riêng tư (PII): 0944 ••• •88
 */
export function maskPhoneSecure(raw?: any): string {
  if (!raw) return '';
  const str = String(raw).trim();
  if (str.includes('•') || str.includes('*')) {
    return str;
  }
  const clean = normalizeVietnamesePhone(str);
  if (clean.length < 7) return clean;
  if (clean.length === 10) {
    return `${clean.slice(0, 4)} ••• •${clean.slice(-2)}`;
  }
  return `${clean.slice(0, 3)} ••• •${clean.slice(-2)}`;
}

/**
 * Lấy 4 chữ số cuối cùng của số điện thoại
 */
export function getLast4Digits(rawPhone?: any): string {
  const clean = normalizeVietnamesePhone(rawPhone);
  if (clean.length >= 4) {
    return clean.slice(-4);
  }
  const digitsOnly = String(rawPhone || '').replace(/[^0-9]/g, '');
  return digitsOnly.slice(-4);
}

/**
 * Kiểm tra xem 4 chữ số người dùng nhập có khớp với 4 số cuối của SĐT đã lưu hay không
 * Hỗ trợ cả trường hợp chuỗi SĐT chứa nhiều số (phân cách bằng dấu gạch chéo, dấu cách...)
 */
export function verifyLast4Digits(fullPhone?: any, inputLast4?: string): boolean {
  if (!fullPhone || !inputLast4) return false;
  const inputDigits = String(inputLast4).replace(/[^0-9]/g, '').trim();
  if (inputDigits.length !== 4) return false;

  const fullStr = String(fullPhone).trim();
  const isMasked = fullStr.includes('•') || fullStr.includes('*');
  
  // Tách các mảnh SĐT nếu chuỗi chứa nhiều số
  const chunks = fullStr.split(/[\s,;\/\-]+/).filter(Boolean);
  
  for (const rawChunk of chunks) {
    const chunkDigits = rawChunk.replace(/[^0-9]/g, '');
    if (chunkDigits.length >= 4 && chunkDigits.endsWith(inputDigits)) {
      return true;
    }
    // Nếu số đã bị mask dạng 091••••588 (chỉ còn 3 số cuối hiển thị)
    if (isMasked && chunkDigits.length >= 3 && chunkDigits.endsWith(inputDigits.slice(-3))) {
      return true;
    }
  }

  const allDigits = fullStr.replace(/[^0-9]/g, '');
  if (allDigits.endsWith(inputDigits)) return true;
  if (isMasked && allDigits.length >= 3 && allDigits.endsWith(inputDigits.slice(-3))) return true;
  return false;
}

/**
 * Kiểm tra xem số điện thoại nhập vào có bị trùng với bạn học nào khác trong danh bạ lớp hoặc danh sách RSVP không
 * (Ngoại trừ chính thành viên đang thao tác)
 * Hỗ trợ so khớp đa tầng: Số đầy đủ 10 số, số bị che mờ PII (09xx ••• xxx), danh bạ tĩnh và rsvpList.
 */
export function findDuplicatePhoneInRoster(
  targetPhone: string,
  roster: ClassMember[],
  currentMemberId?: string,
  rsvpList?: any[],
  staticRoster?: ClassMember[]
): { fullName: string; id?: string; phone?: string } | null {
  const cleanTarget = normalizeVietnamesePhone(targetPhone);
  if (!cleanTarget || cleanTarget.length < 9) return null;

  // Helper so khớp SĐT linh hoạt (hỗ trợ cả số che mờ ••• hoặc nhiều số cách nhau)
  const isMatch = (candPhone?: any): boolean => {
    if (!candPhone) return false;
    const raw = String(candPhone).trim();
    if (!raw || raw.toLowerCase().includes('ko') || raw.toLowerCase().includes('không')) return false;

    // 1. Nếu cả 2 đều là số đầy đủ (hoặc chứa nhiều số phân cách)
    const cleanCand = normalizeVietnamesePhone(raw);
    if (cleanCand && cleanCand.length >= 9) {
      if (cleanCand === cleanTarget) return true;
      const parts = raw.split(/[\s,;\/\-]+/).map(normalizeVietnamesePhone).filter(Boolean);
      if (parts.includes(cleanTarget)) return true;
    }

    // 2. Nếu số trong danh bạ bị che mờ dạng "0919 ••• 588" hoặc "0919***588"
    if (raw.includes('•') || raw.includes('*')) {
      const cleanDigits = raw.replace(/[^0-9]/g, '');
      if (cleanDigits.length >= 6) {
        // Lấy 4 số đầu và 3 số cuối (chuẩn che mờ maskPhoneScript)
        const prefix = cleanDigits.slice(0, 4);
        const suffix = cleanDigits.slice(-3);
        if (cleanTarget.startsWith(prefix) && cleanTarget.endsWith(suffix)) {
          return true;
        }
      }
    }

    return false;
  };

  // 1. Quét danh bạ gốc tĩnh (Single Source of Truth có SĐT 10 số thực)
  if (Array.isArray(staticRoster)) {
    for (const m of staticRoster) {
      if (currentMemberId && m.id === currentMemberId) continue;
      if (isMatch(m.phone)) {
        return { fullName: m.fullName, id: m.id, phone: m.phone };
      }
    }
  }

  // 2. Quét danh bạ hiện tại (rosterList)
  if (Array.isArray(roster)) {
    for (const m of roster) {
      if (currentMemberId && m.id === currentMemberId) continue;
      if (isMatch(m.phone)) {
        return { fullName: m.fullName, id: m.id, phone: m.phone };
      }
    }
  }

  // 3. Quét danh sách thành viên đã điểm danh (rsvpList)
  if (Array.isArray(rsvpList)) {
    for (const r of rsvpList) {
      if (currentMemberId && r.memberId && r.memberId === currentMemberId) continue;
      if (isMatch(r.phone)) {
        return { fullName: r.fullName, id: r.memberId, phone: r.phone };
      }
    }
  }

  return null;
}
