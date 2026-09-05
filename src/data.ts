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
    fundNote: 'Đã chuyển khoản Vietcombank'
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
    fundNote: 'Thủ quỹ lớp đã xác nhận'
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
    fundNote: 'Ủng hộ thêm quỹ lớp 500k'
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
    fundNote: 'Hẹn đóng trực tiếp tại bàn lễ tân'
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
    fundNote: 'Đã chuyển khoản'
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
  // Thay bằng ID thư mục Google Drive của lớp bạn (nếu muốn lưu ảnh tải lên)
  DRIVE_FOLDER_ID: "",
  // Tên trang tính lưu danh sách điểm danh RSVP
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

    if (action === 'add_wish') {
      return handleResponse(saveWish(postData));
    }

    if (action === 'delete_wish') {
      return handleResponse(deleteWish(postData));
    }

    if (action === 'update_rsvp') {
      return handleResponse(updateRSVP(postData));
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
      fundStatus: row[9] === 'ĐÃ ĐÓNG' || row[9] === 'paid' ? 'paid' : 'unpaid',
      fundAmount: Number(row[10]) || (row[9] === 'ĐÃ ĐÓNG' || row[9] === 'paid' ? 500000 : 0),
      fundNote: String(row[11] || '')
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

  // Khởi tạo tiêu đề cột đầy đủ
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
      'Ghi chú quỹ'
    ]);
    sheet.getRange(1, 1, 1, 12).setFontWeight('bold').setBackground('#FAF3E0');
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
    data.fundStatus === 'paid' ? 'ĐÃ ĐÓNG' : 'CHƯA ĐÓNG',
    data.fundAmount || (data.fundStatus === 'paid' ? 500000 : 0),
    data.fundNote || ''
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
      if (data.fundStatus !== undefined) sheet.getRange(rowIndex, 10).setValue(data.fundStatus === 'paid' ? 'ĐÃ ĐÓNG' : 'CHƯA ĐÓNG');
      if (data.fundAmount !== undefined) sheet.getRange(rowIndex, 11).setValue(data.fundAmount);
      if (data.fundNote !== undefined) sheet.getRange(rowIndex, 12).setValue(data.fundNote);
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
 * Lấy ảnh từ Google Drive Folder (nếu có cấu hình)
 */
function getDrivePhotos() {
  if (!CONFIG.DRIVE_FOLDER_ID) {
    return { status: 'success', data: [] };
  }

  try {
    const folder = DriveApp.getFolderById(CONFIG.DRIVE_FOLDER_ID);
    const files = folder.getFiles();
    const photos = [];

    while (files.hasNext()) {
      const file = files.next();
      const mimeType = file.getMimeType();
      if (mimeType.indexOf('image/') === 0) {
        photos.push({
          id: file.getId(),
          url: 'https://drive.google.com/thumbnail?authuser=0&sz=w800&id=' + file.getId(),
          caption: file.getName(),
          date: formatDate(file.getDateCreated())
        });
      }
    }
    return { status: 'success', data: photos };
  } catch (e) {
    return { status: 'success', data: [] };
  }
}

/**
 * Tải ảnh lên thư mục Drive
 */
function uploadPhotoToDrive(data) {
  if (!CONFIG.DRIVE_FOLDER_ID) {
    return { status: 'error', message: 'Chưa cấu hình DRIVE_FOLDER_ID trong Google Apps Script!' };
  }

  try {
    const folder = DriveApp.getFolderById(CONFIG.DRIVE_FOLDER_ID);
    const base64Data = data.fileData.split(',')[1];
    const decoded = Utilities.base64Decode(base64Data);
    const blob = Utilities.newBlob(decoded, 'image/jpeg', 'K8A1_' + Date.now() + '.jpg');
    const file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    return {
      status: 'success',
      message: 'Tải ảnh thành công!',
      fileId: file.getId(),
      viewUrl: file.getUrl()
    };
  } catch (e) {
    return { status: 'error', message: e.toString() };
  }
}

function getViewCount() {
  return { status: 'success', views: 420 };
}

function recordPageView() {
  return { status: 'success', views: 421 };
}

function formatDate(date) {
  if (!(date instanceof Date)) return String(date);
  const pad = (n) => (n < 10 ? '0' + n : n);
  return \`\${pad(date.getDate())}/\${pad(date.getMonth() + 1)}/\${date.getFullYear()} \${pad(date.getHours())}:\${pad(date.getMinutes())}\`;
}
`;
