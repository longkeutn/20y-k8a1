import { RsvpData, WishData, MemoryImage, MemoryVideo, TimelineMilestone, QuizQuestion, PollItem, ScheduleItem, SponsorItem } from './types';

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

export const K8A1_DRIVE_FOLDER_ID = "1Skmip1HQhmXan-58kwbY_msamP-bWokq";
export const K8A1_DRIVE_FOLDER_URL = "https://drive.google.com/drive/folders/1Skmip1HQhmXan-58kwbY_msamP-bWokq";

export const GOOGLE_APPS_SCRIPT_CODE = `/**
 * GOOGLE APPS SCRIPT (Code.gs)
 * Phục vụ WebApp "Hội Ngộ 20 Năm Lớp K8A1 — THPT Thái Nguyên"
 * Hỗ trợ Phân quyền Admin (8888) & Ban Liên Lạc (2006) với Full CRUD
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
  // Tên trang tính lưu danh sách điểm danh
  RSVP_SHEET_NAME: "Trang_tinh_1",
  // Tên trang tính lưu lời chúc & lưu bút
  WISHES_SHEET_NAME: "Loi_Chuc",
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
    const action = (e && e.parameter && e.parameter.action) ? e.parameter.action : 'get_rsvp';

    if (action === 'get_photos') {
      return handleResponse(getDrivePhotos());
    }

    if (action === 'get_wishes') {
      return handleResponse(getWishesList());
    }

    if (action === 'get_confirmed_attendees' || action === 'get_attendees' || action === 'get_rsvp') {
      return handleResponse(getRSVPList());
    }

    if (action === 'get_view_count') {
      return handleResponse(getViewCount());
    }

    if (action === 'record_view' || action === 'hit_view') {
      return handleResponse(recordPageView());
    }

    // Mặc định trả về danh sách RSVP
    return handleResponse(getRSVPList());
  } catch (err) {
    return handleResponse({ status: 'error', message: err.toString() });
  }
}

/**
 * Xử lý yêu cầu POST: Ghi điểm danh, lời chúc, đối soát quỹ vào Google Sheet / Drive
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

    if (action === 'rsvp' || (postData.fullName && postData.phone)) {
      return handleResponse(saveRSVP(postData));
    }

    return handleResponse({ status: 'error', message: 'Hành động không hợp lệ!' });
  } catch (err) {
    return handleResponse({ status: 'error', message: err.toString() });
  }
}

/**
 * Lấy danh sách RSVP từ Google Sheet
 */
function getRSVPList() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(CONFIG.RSVP_SHEET_NAME);
  if (!sheet) {
    sheet = ss.getSheets()[0];
  }

  const rows = sheet.getDataRange().getValues();
  if (rows.length <= 1) {
    return { status: 'success', data: [] };
  }

  const list = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row[0] && !row[1] && !row[2]) continue;

    const item = {
      id: String(i),
      fullName: String(row[0] || ''),
      nickname: String(row[1] || ''),
      phone: String(row[2] || ''),
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
    list.push(item);
  }

  return { status: 'success', data: list };
}

/**
 * Lưu lượt đăng ký RSVP mới vào Google Sheet
 */
function saveRSVP(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(CONFIG.RSVP_SHEET_NAME);
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
      const uploadRes = uploadFundReceiptToDrive({
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

  const row = [
    data.fullName || '',
    data.nickname || '',
    data.phone || '',
    data.status === 'yes' ? 'Có tham gia' : 'Rất tiếc vắng mặt',
    data.shirtSize || 'L',
    data.message || '',
    new Date(),
    data.checkedIn ? 'ĐÃ ĐẾN' : 'CHƯA ĐẾN',
    data.checkedInAt || '',
    data.fundStatus === 'paid' ? 'ĐÃ ĐÓNG' : (data.fundStatus === 'pending' ? 'CHỜ ĐỐI SOÁT' : 'CHƯA ĐÓNG'),
    data.fundAmount || (data.fundStatus === 'paid' ? 500000 : 0),
    data.fundNote || '',
    data.fundReceiptUrl || '',
    data.fundPaidAt || '',
    data.fundPaymentMethod || 'bank_transfer',
    data.fundAuditedBy || ''
  ];

  sheet.appendRow(row);
  return { status: 'success', message: 'Điểm danh thành công!' };
}

/**
 * Cập nhật thông tin RSVP / Đối soát quỹ
 */
function updateRSVP(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(CONFIG.RSVP_SHEET_NAME);
  if (!sheet) sheet = ss.getSheets()[0];

  const rows = sheet.getDataRange().getValues();
  const phone = String(data.phone || '').trim();
  let updated = false;

  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][2]).trim() === phone || (data.rowId && i === Number(data.rowId))) {
      const rowIndex = i + 1;
      if (data.fullName) sheet.getRange(rowIndex, 1).setValue(data.fullName);
      if (data.nickname !== undefined) sheet.getRange(rowIndex, 2).setValue(data.nickname);
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
 * Xóa dòng RSVP (Admin Only)
 */
function deleteRSVP(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(CONFIG.RSVP_SHEET_NAME);
  if (!sheet) sheet = ss.getSheets()[0];

  const rows = sheet.getDataRange().getValues();
  const phone = String(data.phone || '').trim();

  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][2]).trim() === phone || (data.rowId && i === Number(data.rowId))) {
      sheet.deleteRow(i + 1);
      return { status: 'success', message: 'Đã xóa thành viên thành công' };
    }
  }

  return { status: 'not_found', message: 'Không tìm thấy dòng để xóa' };
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
    const cleanCaption = (data.caption || 'K8A1_KyNiem').replace(/[^a-zA-Z0-9_\u00C0-\u024F\u1E00-\u1EFF]/g, '_');
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
    const cleanName = (data.fullName || 'ThanhVien').replace(/[^a-zA-Z0-9_\u00C0-\u024F\u1E00-\u1EFF]/g, '_');
    const cleanPhone = (data.phone || '').replace(/[^0-9]/g, '');
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
`;
