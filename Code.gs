/**
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
  VIEW_COUNTER_SHEET_NAME: "Luot_Truy_Cap",
  // Tên trang tính lưu các khoản chi tiêu quỹ lớp (Sổ chi)
  EXPENSES_SHEET_NAME: "Khoan_Chi",
  // Tên trang tính lưu các khoản thu quỹ lớp (Sổ thu đa danh mục)
  INCOMES_SHEET_NAME: "Khoan_Thu",
  // Tên trang tính lưu trữ cấu hình bảo mật mã PIN phân quyền
  SECURITY_SHEET_NAME: "Bao_Mat_PIN",
  // Tên trang tính lưu danh sách thầy cô giáo tri ân (Độc lập 100%)
  TEACHERS_SHEET_NAME: "Thay_Co_K8A1"
};

// Chuẩn hóa phản hồi JSON cho WebApp (CORS tự động xử lý bởi Google Apps Script)
function handleResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * 0. TỰ ĐỘNG CHẠY KHI MỞ TRANG TÍNH GOOGLE SHEETS
 */
function onOpen(e) {
  try {
    getSecuritySheet();
  } catch (err) {}
  try {
    SpreadsheetApp.getUi()
      .createMenu('⚙️ Quản Trị K8A1')
      .addItem('🛡️ Khởi Tạo / Mở Sheet Bảo Mật PIN', 'openSecuritySheet')
      .addItem('🔄 Đồng Bộ Danh Bạ Sang Điểm Danh (1-Chạm)', 'syncRosterToRSVP')
      .addItem('👕 Đồng Bộ Size Áo Từ Điểm Danh Về Danh Sách Lớp', 'syncAllRsvpSizesToRoster')
      .addItem('🧹 Dọn Dẹp Bản Ghi Trùng Lặp RSVP', 'deduplicateRSVP')
      .addItem('🔄 Kiểm Tra Cơ Sở Dữ Liệu', 'getAllData')
      .addToUi();
  } catch (err) {}
}

function openSecuritySheet() {
  const sheet = getSecuritySheet();
  try {
    SpreadsheetApp.getActiveSpreadsheet().setActiveSheet(sheet);
  } catch (e) {}
  return sheet;
}

/**
 * Lấy trang tính RSVP đang kích hoạt theo cấu hình sự kiện (Hỗ trợ đa sự kiện Zero-Code)
 * Tự động tạo mới và format 17 cột nếu sheet chưa tồn tại
 */
function getActiveRsvpSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var targetName = CONFIG.RSVP_SHEET_NAME; // Fallback "Trang_tinh_1"
  try {
    var confSheet = ss.getSheetByName(CONFIG.CONFIG_SHEET_NAME);
    if (confSheet) {
      var cRows = confSheet.getDataRange().getValues();
      for (var ci = 1; ci < cRows.length; ci++) {
        var cKey = String(cRows[ci][0] || '').trim();
        if (cKey === 'currentRsvpSheet' || cKey === 'rsvpSheetName') {
          var val = String(cRows[ci][1] || '').trim();
          if (val) targetName = val;
          break;
        }
      }
    }
  } catch (eConf) {}

  var sheet = ss.getSheetByName(targetName);
  if (!sheet) {
    if (targetName === CONFIG.RSVP_SHEET_NAME && ss.getSheets().length > 0) {
      sheet = ss.getSheets()[0];
    } else {
      sheet = ss.insertSheet(targetName);
    }
  }

  // Đảm bảo đủ 17 cột tiêu đề (Thêm cột 17: Mã TV)
  initRsvpSheetHeaders(sheet);
  return sheet;
}

/**
 * Đảm bảo cấu trúc 17 cột tiêu đề chuẩn xác cho Sheet Điểm Danh
 */
function initRsvpSheetHeaders(sheet) {
  var headers = [
    'Họ và Tên', 
    'Biệt danh', 
    'Số điện thoại', 
    'Tình trạng', 
    'Size áo', 
    'Lời nhắn', 
    'Thời gian gửi',
    'Điểm danh đến',
    'Giờ đến',
    'Quỹ 700k',
    'Số tiền',
    'Ghi chú quỹ',
    'Link Ảnh Bill/UNC',
    'Thời gian nộp',
    'Hình thức',
    'Người đối soát',
    'Mã TV' // Cột 17: Khóa ngoại liên kết danh bạ K8A1
  ];

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, 17).setFontWeight('bold').setBackground('#FAF3E0');
  } else {
    var maxCols = Math.max(17, sheet.getLastColumn());
    var currentHeaders = sheet.getRange(1, 1, 1, maxCols).getValues()[0];
    if (!currentHeaders[16] || String(currentHeaders[16]).trim() === '') {
      sheet.getRange(1, 17).setValue('Mã TV').setFontWeight('bold').setBackground('#FAF3E0');
    }
  }
}

/**
 * Đọc toàn bộ danh bạ lớp K8A1 vào Map để tra cứu siêu tốc O(1) theo ID, SĐT, Họ tên
 */
function getRosterLookupMap() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(CONFIG.ROSTER_SHEET_NAME);
  var byId = {};
  var byPhone = {};
  var byName = {};

  if (!sheet) return { byId: byId, byPhone: byPhone, byName: byName };

  var rows = sheet.getDataRange().getValues();
  var allMembers = [];
  for (var i = 1; i < rows.length; i++) {
    var r = rows[i];
    var id = String(r[0] || '').trim();
    var name = String(r[1] || '').trim();
    var phone = normalizePhone(r[3]);
    if (!id || !name) continue;

    var m = {
      id: id,
      fullName: name,
      nickname: String(r[2] || '').trim(),
      phone: phone,
      role: String(r[4] || '').trim(),
      gender: String(r[5] || '').trim(),
      shirtSize: String(r[6] || '').trim().toUpperCase(),
      rowIndex: i + 1
    };

    byId[id] = m;
    if (phone) byPhone[phone] = m;
    var rawCleanPhone = String(r[3] || '').replace(/[^0-9]/g, '');
    if (rawCleanPhone) byPhone[rawCleanPhone] = m;
    var normN = normalizeName(name);
    if (!byName[normN]) byName[normN] = [];
    byName[normN].push(m);
    allMembers.push(m);
  }

  return { byId: byId, byPhone: byPhone, byName: byName, allMembers: allMembers };
}

/**
 * Tự động đồng bộ thông tin thành viên (Họ tên, SĐT, Biệt danh, Size áo) sang sheet RSVP
 * Đảm bảo khi sửa danh bạ thì bên điểm danh cũng tự động cập nhật ngay lập tức!
 */
function cascadeSyncMemberToRSVP(member) {
  if (!member || !member.id) return;
  try {
    var sheet = getActiveRsvpSheet();
    var rows = sheet.getDataRange().getValues();
    var memberId = String(member.id).trim();
    var normP = normalizePhone(member.phone);
    var normN = normalizeName(member.fullName);

    for (var i = 1; i < rows.length; i++) {
      var row = rows[i];
      var rMid = String(row[16] || '').trim();
      var rPhone = normalizePhone(row[2]);
      var rName = normalizeName(row[0]);

      var isMatch = false;
      if (rMid && rMid === memberId) {
        isMatch = true;
      } else if (!rMid) {
        if (normP && rPhone && normP === rPhone) {
          isMatch = true;
        } else if (normN && rName && normN === rName) {
          isMatch = true;
        }
      }

      if (isMatch) {
        var rowIndex = i + 1;
        // Cập nhật Cột 17 (Mã TV)
        sheet.getRange(rowIndex, 17).setValue(memberId);
        // Cập nhật Họ và tên
        if (member.fullName) sheet.getRange(rowIndex, 1).setValue(String(member.fullName).trim());
        // Cập nhật Biệt danh
        if (member.nickname !== undefined) sheet.getRange(rowIndex, 2).setValue(String(member.nickname).trim());
        // Cập nhật SĐT nếu có
        if (member.phone !== undefined) {
          var pVal = normP ? ("'" + normP) : ("'" + String(member.phone).trim());
          sheet.getRange(rowIndex, 3).setValue(pVal);
        }
        // Cập nhật Size áo nếu có
        if (member.shirtSize) {
          sheet.getRange(rowIndex, 5).setValue(String(member.shirtSize).trim().toUpperCase());
        }
        break;
      }
    }
  } catch (errCascade) {
    console.warn("Lỗi cascadeSyncMemberToRSVP: " + errCascade);
  }
}

/**
 * ĐỒNG BỘ NGƯỢC: Tự động lưu Size áo & SĐT (nếu danh bạ chưa có) từ Điểm danh (Trang_tinh_1) về Danh bạ lớp (Danh_Sach_Lop)
 * Giúp lưu giữ size may áo và số điện thoại của thành viên lâu dài để phục vụ các kỳ họp lớp sau này!
 */
function syncRSVPToRoster(rsvpData) {
  if (!rsvpData) return;
  var rawSize = String(rsvpData.shirtSize || '').trim().toUpperCase();
  var rawPhone = String(rsvpData.phone || '').trim();
  if (!rawSize && !rawPhone) return;

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var rSheet = ss.getSheetByName(CONFIG.ROSTER_SHEET_NAME);
    if (!rSheet) return;

    var rows = rSheet.getDataRange().getValues();
    var targetMid = String(rsvpData.memberId || '').trim();
    var targetPhone = normalizePhone(rsvpData.phone);
    var targetName = normalizeName(rsvpData.fullName);

    var targetRowIdx = -1;

    // 1. Khớp theo Mã TV (Cột 1)
    if (targetMid) {
      for (var i = 1; i < rows.length; i++) {
        if (String(rows[i][0] || '').trim() === targetMid) {
          targetRowIdx = i + 1;
          break;
        }
      }
    }

    // 2. Khớp theo SĐT (Cột 4)
    if (targetRowIdx === -1 && targetPhone) {
      for (var j = 1; j < rows.length; j++) {
        var rowPhone = normalizePhone(rows[j][3]);
        if (rowPhone && rowPhone === targetPhone) {
          targetRowIdx = j + 1;
          break;
        }
      }
    }

    // 3. Khớp theo Họ tên (Cột 2)
    if (targetRowIdx === -1 && targetName) {
      for (var k = 1; k < rows.length; k++) {
        var rowName = normalizeName(rows[k][1]);
        if (rowName && rowName === targetName) {
          targetRowIdx = k + 1;
          break;
        }
      }
    }

    if (targetRowIdx !== -1) {
      // Cột 7: Size áo (Col G)
      if (rawSize) {
        rSheet.getRange(targetRowIdx, 7).setValue(rawSize);
      }
      // Cột 4: SĐT (Col D) - Nếu danh bạ chưa có SĐT, tự động điền SĐT từ điểm danh
      var currentRosterPhone = String(rows[targetRowIdx - 1][3] || '').trim();
      if (!currentRosterPhone && rawPhone) {
        rSheet.getRange(targetRowIdx, 4).setValue("'" + rawPhone);
      }
      // Cột 9: Ngày cập nhật (Col I)
      rSheet.getRange(targetRowIdx, 9).setValue(formatDate(new Date()));
    }
  } catch (errSyncBack) {
    console.warn("Lỗi syncRSVPToRoster: " + errSyncBack);
  }
}

/**
 * Quét toàn bộ sheet RSVP hiện tại và đồng bộ chuẩn xác với Danh bạ lớp K8A1 (1-Chạm)
 * Tự động Backfill Mã TV (Cột 17) cho mọi bạn đã đăng ký từ trước tới nay
 */
function syncRosterToRSVP() {
  try {
    var sheet = getActiveRsvpSheet();
    var rRows = sheet.getDataRange().getValues();
    if (rRows.length <= 1) {
      return { status: 'success', message: 'Chưa có bản ghi điểm danh nào cần đồng bộ.', syncedCount: 0 };
    }

    var rosterMap = getRosterLookupMap();
    var syncedCount = 0;
    var updatedRows = [];

    for (var i = 1; i < rRows.length; i++) {
      var row = rRows[i].slice(0, 17);
      while (row.length < 17) row.push('');

      var rawName = String(row[0] || '').trim();
      var rawPhone = String(row[2] || '').trim();
      var normP = normalizePhone(rawPhone);
      var normN = normalizeName(rawName);
      var currentMid = String(row[16] || '').trim();

      var matchedMember = null;
      if (currentMid && rosterMap.byId[currentMid]) {
        matchedMember = rosterMap.byId[currentMid];
      } else if (normP && rosterMap.byPhone[normP]) {
        matchedMember = rosterMap.byPhone[normP];
      } else if (normN && rosterMap.byName[normN] && rosterMap.byName[normN].length === 1) {
        matchedMember = rosterMap.byName[normN][0];
      } else if (rosterMap.allMembers) {
        var candidates = rosterMap.allMembers.filter(function(m) {
          return isVietnameseNameMatchScript(m, rawName);
        });
        if (candidates.length === 1) {
          matchedMember = candidates[0];
        }
      }

      if (matchedMember) {
        row[16] = matchedMember.id;
        row[0] = matchedMember.fullName;
        if (!row[1] && matchedMember.nickname) row[1] = matchedMember.nickname;
        if (matchedMember.phone && !row[2]) {
          row[2] = "'" + matchedMember.phone;
        } else if (row[2]) {
          var cleanP = normalizePhone(row[2]);
          if (cleanP) row[2] = "'" + cleanP;
        }
        if (!row[4] && matchedMember.shirtSize) row[4] = matchedMember.shirtSize;
        syncedCount++;
      }
      updatedRows.push(row);
    }

    if (updatedRows.length > 0) {
      sheet.getRange(2, 1, updatedRows.length, 17).setValues(updatedRows);
    }

    return {
      status: 'success',
      message: 'Đã quét và đồng bộ thành công ' + syncedCount + ' thành viên từ Danh Bạ sang Điểm Danh!',
      syncedCount: syncedCount
    };
  } catch (err) {
    return { status: 'error', message: 'Lỗi đồng bộ: ' + err.toString() };
  }
}

/**
 * Quét toàn bộ sheet RSVP hiện tại và đồng bộ ngược tất cả Size áo về Danh_Sach_Lop (1-Chạm)
 */
function syncAllRsvpSizesToRoster() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var rSheet = ss.getSheetByName(CONFIG.ROSTER_SHEET_NAME);
    if (!rSheet) return { status: 'error', message: 'Không tìm thấy sheet ' + CONFIG.ROSTER_SHEET_NAME };

    var rsvpSheet = getActiveRsvpSheet();
    var rsvpRows = rsvpSheet.getDataRange().getValues();
    if (rsvpRows.length <= 1) {
      return { status: 'success', message: 'Chưa có dữ liệu điểm danh nào.', syncedCount: 0 };
    }

    var rosterRows = rSheet.getDataRange().getValues();
    var rosterLookup = {};
    for (var ri = 1; ri < rosterRows.length; ri++) {
      var rRow = rosterRows[ri];
      var mid = String(rRow[0] || '').trim();
      var name = normalizeName(rRow[1]);
      var phone = normalizePhone(rRow[3]);
      var rowNum = ri + 1;
      if (mid) rosterLookup['mid_' + mid] = rowNum;
      if (phone) rosterLookup['p_' + phone] = rowNum;
      if (name) rosterLookup['n_' + name] = rowNum;
    }

    var syncedCount = 0;
    var nowStr = formatDate(new Date());

    for (var i = 1; i < rsvpRows.length; i++) {
      var rRow = rsvpRows[i];
      var size = String(rRow[4] || '').trim().toUpperCase();
      if (!size) continue;

      var rMid = String(rRow[16] || '').trim();
      var rPhone = normalizePhone(rRow[2]);
      var rName = normalizeName(rRow[0]);

      var matchedRowNum = -1;
      if (rMid && rosterLookup['mid_' + rMid]) {
        matchedRowNum = rosterLookup['mid_' + rMid];
      } else if (rPhone && rosterLookup['p_' + rPhone]) {
        matchedRowNum = rosterLookup['p_' + rPhone];
      } else if (rName && rosterLookup['n_' + rName]) {
        matchedRowNum = rosterLookup['n_' + rName];
      }

      if (matchedRowNum !== -1) {
        var currentRosterSize = String(rosterRows[matchedRowNum - 1][6] || '').trim().toUpperCase();
        if (currentRosterSize !== size) {
          rSheet.getRange(matchedRowNum, 7).setValue(size);
          rSheet.getRange(matchedRowNum, 9).setValue(nowStr);
          rosterRows[matchedRowNum - 1][6] = size;
          syncedCount++;
        }
      }
    }

    return {
      status: 'success',
      message: 'Đã đồng bộ thành công size áo cho ' + syncedCount + ' thành viên về Danh Sách Lớp!',
      syncedCount: syncedCount
    };
  } catch (err) {
    return { status: 'error', message: 'Lỗi đồng bộ size áo: ' + err.toString() };
  }
}

/**
 * Trigger tự động chạy khi người dùng gõ sửa trực tiếp trên giao diện Google Sheets
 */
function onEdit(e) {
  if (!e || !e.range) return;
  try {
    var range = e.range;
    var sheet = range.getSheet();
    var sheetName = sheet.getName();

    // 1. Nếu sửa tại tab Danh_Sach_Lop (cột 2: Tên, cột 3: Biệt danh, cột 4: SĐT, cột 7: Size áo)
    if (sheetName === CONFIG.ROSTER_SHEET_NAME) {
      var row = range.getRow();
      var col = range.getColumn();
      if (row > 1 && (col === 2 || col === 3 || col === 4 || col === 7)) {
        var memberId = String(sheet.getRange(row, 1).getValue() || '').trim();
        var fullName = String(sheet.getRange(row, 2).getValue() || '').trim();
        var nickname = String(sheet.getRange(row, 3).getValue() || '').trim();
        var phone = String(sheet.getRange(row, 4).getValue() || '').trim();
        var shirtSize = String(sheet.getRange(row, 7).getValue() || '').trim();

        if (memberId) {
          cascadeSyncMemberToRSVP({
            id: memberId,
            fullName: fullName,
            nickname: nickname,
            phone: phone,
            shirtSize: shirtSize
          });
        }
      }
    }

    // 2. Nếu sửa tại tab RSVP (Trang_tinh_1 hoặc sheet điểm danh đang active) - Cột 5: Size áo
    var activeRsvpName = CONFIG.RSVP_SHEET_NAME;
    try {
      var aSheet = getActiveRsvpSheet();
      if (aSheet) activeRsvpName = aSheet.getName();
    } catch (eR) {}

    if (sheetName === activeRsvpName) {
      var rRow = range.getRow();
      var rCol = range.getColumn();
      if (rRow > 1 && rCol === 5) {
        var rShirtSize = String(sheet.getRange(rRow, 5).getValue() || '').trim().toUpperCase();
        var rFullName = String(sheet.getRange(rRow, 1).getValue() || '').trim();
        var rPhone = String(sheet.getRange(rRow, 3).getValue() || '').trim();
        var rMemberId = String(sheet.getRange(rRow, 17).getValue() || '').trim();

        if (rShirtSize) {
          syncRSVPToRoster({
            memberId: rMemberId,
            fullName: rFullName,
            phone: rPhone,
            shirtSize: rShirtSize
          });
        }
      }
    }
  } catch (errEdit) {
    console.warn("Lỗi onEdit: " + errEdit);
  }
}

/**
 * Che mờ số điện thoại để bảo vệ PII cho người dùng public (VD: 0919 ••• •88)
 */
function maskPhoneScript(phone) {
  if (!phone) return '';
  var clean = String(phone).replace(/[^0-9]/g, '');
  if (clean.length < 7) return clean;
  if (clean.length === 10) {
    return clean.slice(0, 4) + ' ••• ' + clean.slice(-3);
  }
  return clean.slice(0, 3) + ' ••• ' + clean.slice(-3);
}

/**
 * Kiểm tra mã PIN xác thực quyền quản trị (Admin / Thủ Quỹ / Ban Liên Lạc)
 */
function checkAdminAuthPin(pin) {
  if (!pin) return false;
  var p = String(pin).trim();
  // Xác thực trực tiếp từ sheet Bao_Mat_PIN trên Google Sheets (không có mã backdoor)
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(CONFIG.SECURITY_SHEET_NAME);
    if (sheet) {
      var rows = sheet.getDataRange().getValues();
      for (var i = 1; i < rows.length; i++) {
        var k = String(rows[i][0] || '').trim();
        if (k === 'admin_pin' || k === 'treasurer_pin' || k === 'bll_pin') {
          if (p === String(rows[i][1]).trim()) return true;
        }
      }
    }
  } catch (e) {}
  return false;
}

/**
 * Xử lý yêu cầu GET: Đọc dữ liệu từ Google Sheet
 */
function doGet(e) {
  try {
    const action = (e && e.parameter && e.parameter.action) ? e.parameter.action : 'get_all_data';
    const pin = (e && e.parameter && (e.parameter.pin || e.parameter.authPin)) || '';
    const isAdmin = checkAdminAuthPin(pin);

    // Khởi tạo / kiểm tra sheet bảo mật
    if (action === 'init_security' || action === 'init_pins') {
      const secSheet = getSecuritySheet();
      return handleResponse({
        status: 'success',
        message: 'Đã đảm bảo sheet ' + CONFIG.SECURITY_SHEET_NAME + ' sẵn sàng trên Google Sheets!',
        sheetName: CONFIG.SECURITY_SHEET_NAME
      });
    }

    // 1. Đồng bộ toàn bộ dữ liệu chỉ trong 1 request duy nhất (Single Source of Truth)
    if (action === 'get_all_data' || action === 'all' || action === 'sync') {
      return handleResponse(getAllData(isAdmin));
    }

    // 1b. Lấy danh sách chi tiêu quỹ lớp
    if (action === 'get_expenses' || action === 'get_expense_list') {
      return handleResponse(getExpensesList());
    }

    // 1c. Lấy danh sách khoản thu quỹ lớp (Sheet: "Khoan_Thu")
    if (action === 'get_incomes' || action === 'get_income_list') {
      return handleResponse(getIncomesList());
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

    // 4b. Lấy danh sách ảnh Backdrop sân khấu từ folder Drive
    if (action === 'get_backdrops' || action === 'get_drive_backdrops') {
      return handleResponse(getDriveBackdrops());
    }

    // 5. Lấy danh sách lưu bút / lời chúc
    if (action === 'get_wishes') {
      return handleResponse(getWishesList());
    }

    // 6. Lấy danh sách RSVP / điểm danh (Bảo mật: Che mờ SĐT và ẩn ảnh Bill ngân hàng nếu chưa nhập mã PIN)
    if (action === 'get_confirmed_attendees' || action === 'get_attendees' || action === 'get_rsvp') {
      return handleResponse(getRSVPList(isAdmin));
    }

    // 7. Lấy danh bạ sĩ số lớp K8A1 (Bảo mật: Che mờ SĐT nếu không phải Admin)
    if (action === 'get_roster' || action === 'get_members' || action === 'get_class_roster') {
      return handleResponse(getClassRoster(isAdmin));
    }

    // 8. Lấy danh sách Quý Thầy Cô giáo K8A1 (Bảo mật: Che mờ SĐT nếu không phải Admin)
    if (action === 'get_teachers' || action === 'get_teachers_list') {
      return handleResponse(getTeachersList(isAdmin));
    }

    // Dọn dẹp bản ghi trùng lặp (Chỉ Admin)
    if (action === 'deduplicate_rsvp' || action === 'cleanup_duplicates') {
      if (!isAdmin) return handleResponse({ status: 'error', message: 'Yêu cầu quyền quản trị viên!' });
      return handleResponse(deduplicateRSVP());
    }

    // Quét và đồng bộ Danh Bạ Lớp sang Điểm Danh RSVP (1-Chạm)
    if (action === 'sync_roster_to_rsvp' || action === 'sync_roster') {
      if (!isAdmin) return handleResponse({ status: 'error', message: 'Yêu cầu quyền quản trị viên!' });
      return handleResponse(syncRosterToRSVP());
    }

    // Quét và đồng bộ ngược Size Áo từ Điểm Danh RSVP về Danh Bạ Lớp (1-Chạm)
    if (action === 'sync_rsvp_to_roster' || action === 'sync_sizes_to_roster') {
      if (!isAdmin) return handleResponse({ status: 'error', message: 'Yêu cầu quyền quản trị viên!' });
      return handleResponse(syncAllRsvpSizesToRoster());
    }

    // 7. Lấy số lượt xem trang
    if (action === 'get_view_count') {
      return handleResponse(getViewCount());
    }

    if (action === 'record_view' || action === 'hit_view') {
      return handleResponse(recordPageView());
    }

    // Xác thực mã PIN (hỗ trợ qua GET phòng khi mạng chặn POST)
    if (action === 'verify_pin' || action === 'auth_pin') {
      return handleResponse(verifySecurityPin(e && e.parameter ? e.parameter : {}));
    }

    // Mặc định trả về toàn bộ dữ liệu
    return handleResponse(getAllData(isAdmin));
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
    const pin = postData.pin || postData.adminPin || postData.authPin || '';
    const isAdmin = checkAdminAuthPin(pin);

    // Khởi tạo / kiểm tra sheet bảo mật
    if (action === 'init_security' || action === 'init_pins') {
      const secSheet = getSecuritySheet();
      return handleResponse({
        status: 'success',
        message: 'Đã đảm bảo sheet ' + CONFIG.SECURITY_SHEET_NAME + ' sẵn sàng trên Google Sheets!',
        sheetName: CONFIG.SECURITY_SHEET_NAME
      });
    }

    // Xác thực mã PIN bảo mật
    if (action === 'verify_pin' || action === 'auth_pin') {
      return handleResponse(verifySecurityPin(postData));
    }

    // 1. Lưu Cấu Hình Sự Kiện (Địa điểm, Quỹ, Thư ngỏ, Banner) -> Yêu cầu Admin/BLL
    if (action === 'save_config' || action === 'update_config') {
      if (!isAdmin) return handleResponse({ status: 'error', code: 'UNAUTHORIZED', message: 'Yêu cầu mã PIN quản trị viên để lưu cấu hình sự kiện!' });
      return handleResponse(saveEventConfig(postData));
    }

    // 2. Lưu Media (Video, Venue Media) -> Yêu cầu Admin/BLL
    if (action === 'save_media' || action === 'update_media') {
      if (!isAdmin) return handleResponse({ status: 'error', code: 'UNAUTHORIZED', message: 'Yêu cầu mã PIN quản trị viên để lưu cài đặt media!' });
      return handleResponse(saveMediaSettings(postData));
    }

    // 2b. Tải Backdrop sân khấu lên Drive -> Yêu cầu Admin/BLL
    if (action === 'upload_backdrop') {
      if (!isAdmin) return handleResponse({ status: 'error', code: 'UNAUTHORIZED', message: 'Yêu cầu mã PIN quản trị viên để tải backdrop lên Drive!' });
      return handleResponse(uploadBackdropToDrive(postData));
    }

    if (action === 'get_backdrops' || action === 'get_drive_backdrops') {
      return handleResponse(getDriveBackdrops());
    }

    // 3. Quản lý danh bạ lớp K8A1 (Sheet: "Danh_Sach_Lop") -> Yêu cầu Admin/BLL
    if (action === 'save_roster' || action === 'update_roster') {
      if (!isAdmin) return handleResponse({ status: 'error', code: 'UNAUTHORIZED', message: 'Yêu cầu mã PIN quản trị viên để cập nhật danh bạ lớp!' });
      return handleResponse(saveClassRoster(postData));
    }

    if (action === 'add_member' || action === 'create_member') {
      if (!isAdmin) return handleResponse({ status: 'error', code: 'UNAUTHORIZED', message: 'Yêu cầu mã PIN quản trị viên để thêm thành viên!' });
      return handleResponse(addClassMember(postData));
    }

    if (action === 'update_member' || action === 'edit_member') {
      if (!isAdmin) return handleResponse({ status: 'error', code: 'UNAUTHORIZED', message: 'Yêu cầu mã PIN quản trị viên để sửa thành viên!' });
      return handleResponse(updateClassMember(postData));
    }

    if (action === 'delete_member' || action === 'remove_member') {
      if (!isAdmin) return handleResponse({ status: 'error', code: 'UNAUTHORIZED', message: 'Yêu cầu mã PIN quản trị viên để xóa thành viên!' });
      return handleResponse(deleteClassMember(postData));
    }

    // Quản lý danh sách Thầy Cô giáo K8A1 (Sheet: "Thay_Co_K8A1")
    if (action === 'save_teachers' || action === 'update_teachers') {
      if (!isAdmin) return handleResponse({ status: 'error', code: 'UNAUTHORIZED', message: 'Yêu cầu mã PIN quản trị viên để lưu danh sách thầy cô!' });
      return handleResponse(saveTeachersList(postData));
    }

    if (action === 'add_teacher') {
      if (!isAdmin) return handleResponse({ status: 'error', code: 'UNAUTHORIZED', message: 'Yêu cầu mã PIN quản trị viên để thêm thầy cô!' });
      return handleResponse(addTeacher(postData));
    }

    if (action === 'update_teacher') {
      if (!isAdmin) return handleResponse({ status: 'error', code: 'UNAUTHORIZED', message: 'Yêu cầu mã PIN quản trị viên để cập nhật thông tin thầy cô!' });
      return handleResponse(updateTeacher(postData));
    }

    if (action === 'delete_teacher') {
      if (!isAdmin) return handleResponse({ status: 'error', code: 'UNAUTHORIZED', message: 'Yêu cầu mã PIN quản trị viên để xóa thầy cô!' });
      return handleResponse(deleteTeacher(postData));
    }

    // Cập nhật mã PIN bảo mật
    if (action === 'update_pins' || action === 'save_pins') {
      if (!isAdmin) return handleResponse({ status: 'error', code: 'UNAUTHORIZED', message: 'Yêu cầu mã PIN quản trị viên để đổi mã PIN hệ thống!' });
      return handleResponse(updateSecurityPins(postData));
    }

    // Quản lý chi tiêu quỹ lớp (Sheet: "Khoan_Chi") -> Yêu cầu Thủ quỹ/Admin
    if (action === 'save_expenses' || action === 'update_expenses') {
      if (!isAdmin) return handleResponse({ status: 'error', code: 'UNAUTHORIZED', message: 'Yêu cầu mã PIN quản trị viên để lưu sổ chi tiêu quỹ!' });
      return handleResponse(saveExpensesList(postData));
    }

    // Quản lý thu quỹ lớp (Sheet: "Khoan_Thu") -> Yêu cầu Thủ quỹ/Admin
    if (action === 'save_incomes' || action === 'update_incomes') {
      if (!isAdmin) return handleResponse({ status: 'error', code: 'UNAUTHORIZED', message: 'Yêu cầu mã PIN quản trị viên để lưu sổ thu quỹ!' });
      return handleResponse(saveIncomesList(postData));
    }

    if (action === 'add_income') {
      return handleResponse(addIncomeItem(postData));
    }

    if (action === 'delete_wish') {
      if (!isAdmin) return handleResponse({ status: 'error', code: 'UNAUTHORIZED', message: 'Yêu cầu mã PIN quản trị viên để xóa lời chúc!' });
      return handleResponse(deleteWish(postData));
    }

    if (action === 'delete_rsvp') {
      if (!isAdmin) return handleResponse({ status: 'error', code: 'UNAUTHORIZED', message: 'Yêu cầu mã PIN quản trị viên để xóa đăng ký!' });
      return handleResponse(deleteRSVP(postData));
    }

    if (action === 'deduplicate_rsvp' || action === 'cleanup_duplicates') {
      if (!isAdmin) return handleResponse({ status: 'error', code: 'UNAUTHORIZED', message: 'Yêu cầu mã PIN quản trị viên để dọn trùng lặp!' });
      return handleResponse(deduplicateRSVP());
    }

    if (action === 'sync_roster_to_rsvp' || action === 'sync_roster') {
      if (!isAdmin) return handleResponse({ status: 'error', code: 'UNAUTHORIZED', message: 'Yêu cầu mã PIN quản trị viên để đồng bộ danh bạ!' });
      return handleResponse(syncRosterToRSVP());
    }

    if (action === 'sync_rsvp_to_roster' || action === 'sync_sizes_to_roster') {
      if (!isAdmin) return handleResponse({ status: 'error', code: 'UNAUTHORIZED', message: 'Yêu cầu mã PIN quản trị viên để đồng bộ size áo!' });
      return handleResponse(syncAllRsvpSizesToRoster());
    }

    if (action === 'record_view' || action === 'hit_view') {
      return handleResponse(recordPageView());
    }

    if (action === 'upload_photo' || action === 'upload_banner') {
      return handleResponse(uploadPhotoToDrive(postData));
    }

    if (action === 'upload_member_avatar' || action === 'upload_avatar' || action === 'uploadMemberAvatar') {
      return handleResponse(uploadMemberAvatarToDrive(postData));
    }

    if (action === 'upload_fund_receipt' || action === 'upload_receipt' || action === 'upload_expense_receipt') {
      return handleResponse(uploadFundReceiptToDrive(postData));
    }

    if (action === 'update_fund' || action === 'update_rsvp') {
      return handleResponse(updateRSVP(postData));
    }

    if (action === 'add_wish') {
      return handleResponse(saveWish(postData));
    }

    if (action === 'rsvp' || (postData.fullName && (postData.phone || postData.status))) {
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
var OLD_TO_NEW_VIETNAMESE_PREFIXES = {
  '0162': '032', '0163': '033', '0164': '034', '0165': '035',
  '0166': '036', '0167': '037', '0168': '038', '0169': '039',
  '0120': '070', '0121': '079', '0122': '077', '0126': '076', '0128': '078',
  '0123': '083', '0124': '084', '0125': '085', '0127': '081', '0129': '082',
  '0186': '056', '0188': '058',
  '0199': '059'
};

function normalizePhone(phone) {
  if (!phone) return '';
  var p = String(phone).replace(/[^0-9]/g, '');
  if (p.indexOf('84') === 0 && p.length > 9) {
    p = '0' + p.substring(2);
  } else if (p.indexOf('0') !== 0 && (p.length === 9 || (p.length === 10 && p.indexOf('1') === 0))) {
    p = '0' + p;
  }
  if (p.length === 11 && p.indexOf('01') === 0) {
    var pre = p.substring(0, 4);
    if (OLD_TO_NEW_VIETNAMESE_PREFIXES[pre]) {
      p = OLD_TO_NEW_VIETNAMESE_PREFIXES[pre] + p.substring(4);
    }
  }
  return p;
}

function isVietnameseNameMatchScript(rosterMember, targetName) {
  if (!targetName || !rosterMember || !rosterMember.fullName) return false;
  var rName = normalizeName(targetName);
  var mName = normalizeName(rosterMember.fullName);
  var mNick = rosterMember.nickname ? normalizeName(rosterMember.nickname) : '';

  if (!rName || !mName) return false;
  if (mName === rName) return true;
  if (mNick && mNick === rName) return true;

  var rTokens = rName.split(' ').filter(Boolean);
  var mTokens = mName.split(' ').filter(Boolean);

  if (mTokens.length >= 2 && mTokens.every(function(t) { return rTokens.indexOf(t) !== -1; })) return true;
  if (rTokens.length >= 2 && rTokens.every(function(t) { return mTokens.indexOf(t) !== -1; })) return true;

  if (mNick && mNick.length >= 2) {
    var nickTokens = mNick.split(' ').filter(Boolean);
    if (nickTokens.length >= 2 && nickTokens.every(function(t) { return rTokens.indexOf(t) !== -1; })) return true;
  }
  return false;
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
function getRSVPList(isAdmin) {
  var sheet = getActiveRsvpSheet();
  var rows = sheet.getDataRange().getValues();
  if (rows.length <= 1) {
    return { status: 'success', data: [] };
  }

  var rosterMap = getRosterLookupMap();
  var list = [];
  var seenMap = {};

  for (var i = 1; i < rows.length; i++) {
    var row = rows[i];
    if (!row[0] && !row[1] && !row[2]) continue;

    var rawName = String(row[0] || '').trim();
    var rawPhone = String(row[2] || '').trim();
    var normPhone = normalizePhone(rawPhone);
    var normName = normalizeName(rawName);
    var memberId = String(row[16] || '').trim();

    // Tự động map memberId từ danh bạ nếu ô Cột 17 của dòng này đang trống (Backfill tự động)
    if (!memberId) {
      if (normPhone && rosterMap.byPhone[normPhone]) {
        memberId = rosterMap.byPhone[normPhone].id;
      } else if (normName && rosterMap.byName[normName] && rosterMap.byName[normName].length === 1) {
        memberId = rosterMap.byName[normName][0].id;
      } else if (rosterMap.allMembers) {
        var candidates = rosterMap.allMembers.filter(function(m) {
          return isVietnameseNameMatchScript(m, rawName);
        });
        if (candidates.length === 1) {
          memberId = candidates[0].id;
        }
      }
    }

    // Ưu tiên hợp nhất theo Mã TV nếu có, sau đó mới tới SĐT
    var uniqueKey = memberId ? ('mid_' + memberId) : (normPhone ? ('phone_' + normPhone) : '');

    var item = {
      id: String(i),
      rowId: String(i + 1),
      memberId: memberId || undefined,
      fullName: rawName,
      nickname: String(row[1] || ''),
      phone: isAdmin ? (normPhone || rawPhone) : maskPhoneScript(normPhone || rawPhone),
      status: row[3] === 'Có tham gia' || row[3] === 'yes' ? 'yes' : 'no',
      shirtSize: String(row[4] || ''),
      message: String(row[5] || ''),
      submittedAt: formatDate(row[6] || new Date()),
      checkedIn: row[7] === 'ĐÃ ĐẾN' || row[7] === true,
      checkedInAt: String(row[8] || ''),
      fundStatus: row[9] === 'ĐÃ ĐÓNG' || row[9] === 'paid' ? 'paid' : (row[9] === 'CHỜ ĐỐI SOÁT' || row[9] === 'pending' ? 'pending' : (row[9] === 'MIỄN' || row[9] === 'exempt' ? 'exempt' : 'unpaid')),
      fundAmount: Number(row[10]) || (row[9] === 'ĐÃ ĐÓNG' || row[9] === 'paid' ? 700000 : 0),
      fundNote: String(row[11] || ''),
      fundReceiptUrl: String(row[12] || ''),
      hasReceipt: !!row[12],
      fundPaidAt: formatDateTimeVi(row[13] || ''),
      fundPaymentMethod: String(row[14] || 'bank_transfer'),
      fundAuditedBy: String(row[15] || '')
    };

    if (uniqueKey && seenMap[uniqueKey] !== undefined) {
      var existingIdx = seenMap[uniqueKey];
      var existing = list[existingIdx];
      list[existingIdx] = {
        id: existing.id,
        rowId: existing.rowId,
        memberId: item.memberId || existing.memberId,
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
        fundReceiptUrl: item.fundReceiptUrl || existing.fundReceiptUrl || '',
        hasReceipt: existing.hasReceipt || item.hasReceipt,
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
 * Lưu lượt đăng ký RSVP (Tự động chống trùng lặp - UPSERT thông minh ưu tiên Mã TV)
 */
function saveRSVP(data) {
  var sheet = getActiveRsvpSheet();

  // Nếu có kèm ảnh bill trong form RSVP, tự động upload lên Drive folder ChungTu_QuyLop_K8A1
  if ((data.fileData || data.fundReceiptBase64) && !data.fundReceiptUrl) {
    try {
      var uploadRes = uploadFundReceiptToDrive({
        fileData: data.fileData || data.fundReceiptBase64,
        mimeType: data.mimeType || 'image/jpeg',
        fullName: data.fullName,
        phone: data.phone,
        fundAmount: data.fundAmount || 700000,
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

  var rawPhoneInput = String(data.phone || '').trim();
  var isMaskedPhone = (
    data.isSavedPhone === true ||
    rawPhoneInput.indexOf('•') !== -1 ||
    rawPhoneInput.indexOf('*') !== -1 ||
    (rawPhoneInput.replace(/[^0-9]/g, '').length > 0 && rawPhoneInput.replace(/[^0-9]/g, '').length < 9)
  );

  var normNewPhone = isMaskedPhone ? '' : normalizePhone(data.phone);
  var normNewName = normalizeName(data.fullName);
  var targetMemberId = String(data.memberId || '').trim();
  var isAdminRequest = checkAdminAuthPin(data.pin || data.adminPin || '');

  // 🛡️ Kiểm tra định dạng số điện thoại di động Việt Nam (chuẩn 10 chữ số) NẾU không phải là số đã lưu/che mờ
  if (!isMaskedPhone && normNewPhone) {
    var isValidPhoneFormat = /^0(3[2-9]|5[25689]|7[06-9]|8[1-9]|9[0-9])[0-9]{7}$/.test(normNewPhone);
    if (!isValidPhoneFormat && !isAdminRequest) {
      return {
        status: 'error',
        code: 'INVALID_PHONE_FORMAT',
        message: 'Số điện thoại "' + (data.phone || '') + '" không đúng định dạng di động 10 chữ số tại Việt Nam!'
      };
    }
  }

  // 🛡️ PHƯƠNG ÁN 1: Bắt buộc họ tên người điểm danh phải thuộc danh bạ lớp K8A1
  var rosterMap = getRosterLookupMap();
  var rosterMembersCount = Object.keys(rosterMap.byId).length;

  if (rosterMembersCount > 0 && !isAdminRequest) {
    var isMemberWhitelisted = false;
    if (targetMemberId && rosterMap.byId[targetMemberId]) {
      isMemberWhitelisted = true;
    } else if (normNewName && rosterMap.byName[normNewName] && rosterMap.byName[normNewName].length > 0) {
      isMemberWhitelisted = true;
    } else if (normNewPhone && rosterMap.byPhone[normNewPhone]) {
      isMemberWhitelisted = true;
    } else if (rosterMap.allMembers) {
      for (var mi = 0; mi < rosterMap.allMembers.length; mi++) {
        if (isVietnameseNameMatchScript(rosterMap.allMembers[mi], data.fullName || '')) {
          isMemberWhitelisted = true;
          break;
        }
      }
    }

    if (!isMemberWhitelisted) {
      return {
        status: 'error',
        code: 'NOT_A_CLASS_MEMBER',
        message: 'Họ tên "' + (data.fullName || '') + '" không có trong danh bạ 65 thành viên K8A1. Vui lòng chọn đúng họ tên bạn học trong danh sách lớp!'
      };
    }
  }

  // Đọc các dòng hiện tại để tìm kiếm bản ghi trùng lặp
  var rows = sheet.getDataRange().getValues();
  var matchedRowIndex = -1;
  var duplicateRowIndices = [];

  // 1. Ưu tiên số 1: Tìm theo Mã TV (Cột 17) nếu cả 2 bên đều có
  if (targetMemberId) {
    for (var i = 1; i < rows.length; i++) {
      var rowMid = String(rows[i][16] || '').trim();
      if (rowMid && rowMid === targetMemberId) {
        matchedRowIndex = i + 1;
        break;
      }
    }
  }

  // 2. Ưu tiên số 2: Tìm theo rowId gửi lên nếu có và khớp Họ tên hoặc Mã TV
  if (matchedRowIndex === -1) {
    var targetRowId = Number(data.rowId);
    if (targetRowId > 1 && targetRowId <= rows.length) {
      var checkRow = rows[targetRowId - 1];
      var checkRowName = normalizeName(checkRow[0]);
      var checkRowMid = String(checkRow[16] || '').trim();
      if ((targetMemberId && checkRowMid === targetMemberId) || (checkRowName === normNewName)) {
        matchedRowIndex = targetRowId;
      }
    }
  }

  // 🛡️ CHỐNG TRÙNG LẶP SỐ ĐIỆN THOẠI TRÊN TOÀN BỘ CƠ SỞ DỮ LIỆU GOOGLE SHEETS
  // Bất kỳ ai nhập số điện thoại mới (chưa có số hoặc đổi số): BẮT BUỘC kiểm tra không được trùng với bạn khác trong lớp!
  if (!isMaskedPhone && normNewPhone && !isAdminRequest) {
    // 1. Kiểm tra trong danh bạ gốc (Sheet "Danh_Sach_Lop")
    if (rosterMap && rosterMap.allMembers) {
      for (var rmi = 0; rmi < rosterMap.allMembers.length; rmi++) {
        var rMem = rosterMap.allMembers[rmi];
        var isSameMember = (targetMemberId && rMem.id === targetMemberId) || (normNewName && normalizeName(rMem.fullName) === normNewName);
        if (isSameMember) continue;

        var rMemPhone = normalizePhone(rMem.phone);
        if (rMemPhone && rMemPhone === normNewPhone) {
          return {
            status: 'error',
            code: 'DUPLICATE_PHONE',
            message: 'Số điện thoại "' + (data.phone || normNewPhone) + '" đã thuộc về bạn "' + rMem.fullName + '" trong danh bạ lớp K8A1. Vui lòng kiểm tra lại hoặc liên hệ Ban Liên Lạc!'
          };
        }
      }
    }

    // 2. Kiểm tra trong các bản ghi điểm danh hiện tại (Sheet RSVP "Trang_tinh_1")
    for (var rsi = 1; rsi < rows.length; rsi++) {
      if (matchedRowIndex !== -1 && (rsi + 1) === matchedRowIndex) continue;
      var existingRowMid = String(rows[rsi][16] || '').trim();
      var existingRowName = String(rows[rsi][0] || '').trim();
      var existingRowPhone = normalizePhone(rows[rsi][2]);

      var isSameRow = (targetMemberId && existingRowMid && existingRowMid === targetMemberId) || (normNewName && normalizeName(existingRowName) === normNewName);
      if (isSameRow) continue;

      if (existingRowPhone && existingRowPhone === normNewPhone) {
        return {
          status: 'error',
          code: 'DUPLICATE_PHONE',
          message: 'Số điện thoại "' + (data.phone || normNewPhone) + '" đã được bạn "' + existingRowName + '" đăng ký điểm danh trước đó. Vui lòng kiểm tra lại hoặc liên hệ Ban Liên Lạc!'
        };
      }
    }
  }

  // 3. Ưu tiên số 3: Khớp theo SĐT hợp lệ (chỉ khi số không bị che mờ và khớp với chính thành viên này)
  if (matchedRowIndex === -1 && normNewPhone && !isMaskedPhone) {
    for (var i = 1; i < rows.length; i++) {
      var row = rows[i];
      var rowPhone = normalizePhone(row[2]);
      if (rowPhone && normNewPhone === rowPhone) {
        var rowMid = String(row[16] || '').trim();
        var rowName = normalizeName(row[0]);
        var isOwnRecord = (!targetMemberId || !rowMid || targetMemberId === rowMid) && (!normNewName || !rowName || normNewName === rowName);
        if (isOwnRecord) {
          if (matchedRowIndex === -1) {
            matchedRowIndex = i + 1;
          } else if (matchedRowIndex !== (i + 1)) {
            duplicateRowIndices.push(i + 1);
          }
        }
      }
    }
  }

  // 4. Ưu tiên số 4: Nếu chưa khớp nhưng họ tên khớp 100% với duy nhất 1 dòng trong sheet:
  if (matchedRowIndex === -1 && normNewName) {
    var sameNameIndices = [];
    for (var j = 1; j < rows.length; j++) {
      if (normalizeName(rows[j][0]) === normNewName) {
        sameNameIndices.push(j + 1);
      }
    }
    if (sameNameIndices.length === 1) {
      matchedRowIndex = sameNameIndices[0];
    }
  }

  var phoneValue = (!isMaskedPhone && normNewPhone && normNewPhone.length >= 9) ? ("'" + normNewPhone) : '';
  var effectiveMemberId = targetMemberId;

  if (matchedRowIndex !== -1) {
    var existingRow = rows[matchedRowIndex - 1];
    if (!effectiveMemberId && existingRow[16]) {
      effectiveMemberId = String(existingRow[16]).trim();
    }
    if (!effectiveMemberId) {
      var rosterMap = getRosterLookupMap();
      if (normNewPhone && rosterMap.byPhone[normNewPhone]) {
        effectiveMemberId = rosterMap.byPhone[normNewPhone].id;
      } else if (normNewName && rosterMap.byName[normNewName] && rosterMap.byName[normNewName].length === 1) {
        effectiveMemberId = rosterMap.byName[normNewName][0].id;
      }
    }

    // 🛡️ XỬ LÝ BẢO VỆ SỐ ĐIỆN THOẠI: TUYỆT ĐỐI KHÔNG GHI ĐÈ BỞI SỐ CHE MỜ HOẶC SỐ BỊ CẮT BỚT
    var finalPhoneCell = '';
    var existingPhoneRaw = existingRow ? String(existingRow[2] || '').trim() : '';
    var cleanExisting = existingPhoneRaw.replace(/[^0-9]/g, '');

    if (!isMaskedPhone && phoneValue) {
      // Người dùng nhập SĐT mới 10 số hợp lệ -> Cập nhật SĐT mới
      finalPhoneCell = phoneValue;
    } else if (cleanExisting.length >= 9) {
      // Giữ nguyên SĐT chuẩn đã lưu trong Sheet
      finalPhoneCell = existingPhoneRaw.indexOf("'") === 0 ? existingPhoneRaw : ("'" + cleanExisting);
    } else {
      // Nếu ô SĐT trong Sheet đang trống hoặc từng bị lưu lỗi (< 9 số):
      // Tự động khôi phục ngay từ Danh Sách Lớp K8A1 (Single Source of Truth)
      var rosterMap = getRosterLookupMap();
      var rMember = (effectiveMemberId && rosterMap.byId[effectiveMemberId]) 
        || (normNewName && rosterMap.byName[normNewName] && rosterMap.byName[normNewName][0]);
      if (rMember && rMember.phone && rMember.phone.length >= 9) {
        finalPhoneCell = "'" + rMember.phone;
      } else {
        finalPhoneCell = existingPhoneRaw;
      }
    }

    var existingStatus = (existingRow[3] === 'Có tham gia' || existingRow[3] === 'yes') ? 'yes' : 'no';
    var targetStatus = data.status === 'yes' ? 'yes' : 'no';
    if (existingStatus === 'yes' && targetStatus === 'no' && !isAdminRequest) {
      var existingNormPhone = normalizePhone(existingRow[2]);
      if (existingNormPhone && (!normNewPhone || !existingNormPhone.endsWith(normNewPhone.slice(-4)))) {
        return {
          status: 'error',
          code: 'PERMISSION_DENIED',
          message: 'Hồ sơ đã xác nhận tham dự. Để chuyển sang vắng mặt, vui lòng liên hệ Ban Liên Lạc hoặc dùng đúng số điện thoại chính chủ!'
        };
      }
    }

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
      finalPhoneCell || '',
      data.status === 'yes' ? 'Có tham gia' : 'Rất tiếc vắng mặt',
      (data.shirtSize !== undefined ? (data.shirtSize || 'CHƯA CHỌN') : (existingRow[4] || 'CHƯA CHỌN')),
      (data.message !== undefined && data.message !== '') ? data.message : (existingRow[5] || ''),
      new Date(),
      isAlreadyCheckedIn ? 'ĐÃ ĐẾN' : (data.checkedIn ? 'ĐÃ ĐẾN' : 'CHƯA ĐẾN'),
      data.checkedInAt || existingRow[8] || '',
      updatedFundStatus,
      data.fundAmount || existingRow[10] || (isAlreadyPaid ? 700000 : 0),
      data.fundNote || existingRow[11] || '',
      data.fundReceiptUrl || existingRow[12] || '',
      data.fundPaidAt || existingRow[13] || '',
      data.fundPaymentMethod || existingRow[14] || 'bank_transfer',
      existingRow[15] || '',
      effectiveMemberId || '' // Cột 17: Mã TV
    ];

    sheet.getRange(matchedRowIndex, 1, 1, 17).setValues([updatedRow]);

    if (duplicateRowIndices.length > 0) {
      duplicateRowIndices.sort(function(a, b) { return b - a; });
      for (var d = 0; d < duplicateRowIndices.length; d++) {
        sheet.deleteRow(duplicateRowIndices[d]);
      }
    }

    if (data.shirtSize || data.phone) {
      syncRSVPToRoster(data);
    }

    return { status: 'success', message: 'Đã cập nhật thông tin thành công (không tạo bản ghi trùng lặp)!' };
  } else {
    // THÊM MỚI BẢN GHI
    if (!effectiveMemberId) {
      var rosterMap = getRosterLookupMap();
      if (normNewPhone && rosterMap.byPhone[normNewPhone]) {
        effectiveMemberId = rosterMap.byPhone[normNewPhone].id;
      } else if (normNewName && rosterMap.byName[normNewName] && rosterMap.byName[normNewName].length === 1) {
        effectiveMemberId = rosterMap.byName[normNewName][0].id;
      }
    }

    var newPhoneCell = phoneValue;
    if (!newPhoneCell || isMaskedPhone) {
      var rosterMap = getRosterLookupMap();
      var rMember = (effectiveMemberId && rosterMap.byId[effectiveMemberId]) 
        || (normNewName && rosterMap.byName[normNewName] && rosterMap.byName[normNewName][0]);
      if (rMember && rMember.phone && rMember.phone.length >= 9) {
        newPhoneCell = "'" + rMember.phone;
      }
    }

    var newRow = [
      data.fullName || '',
      data.nickname || '',
      newPhoneCell || '',
      data.status === 'yes' ? 'Có tham gia' : 'Rất tiếc vắng mặt',
      data.shirtSize || 'CHƯA CHỌN',
      data.message || '',
      new Date(),
      data.checkedIn ? 'ĐÃ ĐẾN' : 'CHƯA ĐẾN',
      data.checkedInAt || '',
      data.fundStatus === 'paid' ? 'ĐÃ ĐÓNG' : (data.fundReceiptUrl || data.fundStatus === 'pending' ? 'CHỜ ĐỐI SOÁT' : 'CHƯA ĐÓNG'),
      data.fundAmount || (data.fundStatus === 'paid' ? 700000 : 0),
      data.fundNote || '',
      data.fundReceiptUrl || '',
      data.fundPaidAt || '',
      data.fundPaymentMethod || 'bank_transfer',
      data.fundAuditedBy || '',
      effectiveMemberId || '' // Cột 17: Mã TV
    ];

    sheet.appendRow(newRow);
    if (data.shirtSize || data.phone) {
      syncRSVPToRoster(data);
    }
    return { status: 'success', message: 'Điểm danh thành công!' };
  }
}

/**
 * Cập nhật thông tin RSVP / Đối soát quỹ (ưu tiên Mã TV)
 */
function updateRSVP(data) {
  var sheet = getActiveRsvpSheet();
  var rows = sheet.getDataRange().getValues();
  var targetMemberId = String(data.memberId || '').trim();
  var targetPhone = normalizePhone(data.phone);
  var targetName = normalizeName(data.fullName);
  var updated = false;

  for (var i = 1; i < rows.length; i++) {
    var rowMemberId = String(rows[i][16] || '').trim();
    var rowPhone = normalizePhone(rows[i][2]);
    var rowName = normalizeName(rows[i][0]);

    var isMatch = (targetMemberId && rowMemberId && targetMemberId === rowMemberId) ||
                  (data.rowId && (i + 1) === Number(data.rowId)) ||
                  (targetPhone && rowPhone && targetPhone === rowPhone) ||
                  (!targetPhone && targetName && rowName && targetName === rowName);

    if (isMatch) {
      var rowIndex = i + 1;
      if (data.fullName) sheet.getRange(rowIndex, 1).setValue(data.fullName);
      if (data.nickname !== undefined) sheet.getRange(rowIndex, 2).setValue(data.nickname);
      if (data.phone) {
        var rawP = String(data.phone).trim();
        var isMaskedP = rawP.indexOf('•') !== -1 || rawP.indexOf('*') !== -1 || rawP.replace(/[^0-9]/g, '').length < 9;
        if (!isMaskedP) {
          var normP = normalizePhone(data.phone);
          if (normP && normP.length >= 9) {
            sheet.getRange(rowIndex, 3).setValue("'" + normP);
          }
        }
      }
      if (data.status) sheet.getRange(rowIndex, 4).setValue(data.status === 'yes' ? 'Có tham gia' : 'Rất tiếc vắng mặt');
      if (data.shirtSize !== undefined) sheet.getRange(rowIndex, 5).setValue(data.shirtSize || 'CHƯA CHỌN');
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
      if (data.memberId) sheet.getRange(rowIndex, 17).setValue(data.memberId);
      updated = true;
      break;
    }
  }

  if (updated && data.shirtSize) {
    syncRSVPToRoster(data);
  }

  return { status: updated ? 'success' : 'not_found', message: updated ? 'Cập nhật thành công' : 'Không tìm thấy dòng tương ứng' };
}

/**
 * Xóa dòng RSVP (Admin Only - so khớp Mã TV, SĐT hoặc dòng)
 */
function deleteRSVP(data) {
  var sheet = getActiveRsvpSheet();
  var rows = sheet.getDataRange().getValues();
  var targetMemberId = String(data.memberId || '').trim();
  var targetPhone = normalizePhone(data.phone);
  var targetName = normalizeName(data.fullName);

  for (var i = 1; i < rows.length; i++) {
    var rowMemberId = String(rows[i][16] || '').trim();
    var rowPhone = normalizePhone(rows[i][2]);
    var rowName = normalizeName(rows[i][0]);
    var isMatch = (targetMemberId && rowMemberId && targetMemberId === rowMemberId) ||
                  (targetPhone && rowPhone && targetPhone === rowPhone) ||
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
 * Dọn dẹp và hợp nhất toàn bộ bản ghi trùng lặp trong Google Sheet (bảo toàn 17 cột)
 */
function deduplicateRSVP() {
  var sheet = getActiveRsvpSheet();
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
    var memberId = String(row[16] || '').trim();
    if (!rawName && !rawPhone && !memberId) continue;

    var normP = normalizePhone(rawPhone);
    var key = memberId ? ('mid_' + memberId) : (normP ? ('phone_' + normP) : '');
    if (!key) continue;

    if (!uniqueMap[key]) {
      uniqueMap[key] = {
        rowIndex: i + 1,
        data: row.slice(0, 17)
      };
      while (uniqueMap[key].data.length < 17) uniqueMap[key].data.push('');
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
      if (row[16] && !masterData[16]) masterData[16] = row[16];

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
    sheet.getRange(item.rowIndex, 1, 1, 17).setValues([item.data]);
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
    
    // Cấp quyền xem cho bất kỳ ai có link (bọc try/catch phòng trường hợp tài khoản tổ chức bị khóa sharing)
    try {
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    } catch (eShare) {
      console.warn("Lỗi setSharing: " + eShare.toString());
    }

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
 * Lấy hoặc tự động tạo thư mục con "Backdrops_SanKhau" trong Google Drive
 */
function getBackdropFolder() {
  const rootId = CONFIG.DRIVE_FOLDER_ID || "1Skmip1HQhmXan-58kwbY_msamP-bWokq";
  let rootFolder = null;
  if (rootId) {
    try { rootFolder = DriveApp.getFolderById(rootId); } catch (e) {}
  }
  if (!rootFolder) {
    try {
      const folders = DriveApp.getFoldersByName("K8A1_KyNiem_20Nam");
      if (folders.hasNext()) rootFolder = folders.next();
      else rootFolder = DriveApp.getRootFolder();
    } catch (e) {
      rootFolder = DriveApp.getRootFolder();
    }
  }

  const subFolderName = "Backdrops_SanKhau";
  const subFolders = rootFolder.getFoldersByName(subFolderName);
  if (subFolders.hasNext()) {
    return subFolders.next();
  }
  const created = rootFolder.createFolder(subFolderName);
  try {
    created.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  } catch (e) {}
  return created;
}

/**
 * Lấy danh sách ảnh Backdrop sân khấu từ folder Drive "Backdrops_SanKhau"
 */
function getDriveBackdrops() {
  try {
    const folder = getBackdropFolder();
    const files = folder.getFiles();
    const backdrops = [];
    while (files.hasNext()) {
      const file = files.next();
      const mimeType = file.getMimeType();
      if (mimeType.indexOf('image/') === 0 || mimeType === 'application/octet-stream') {
        const fileId = file.getId();
        backdrops.push({
          id: fileId,
          title: file.getName().replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' '),
          url: 'https://lh3.googleusercontent.com/d/' + fileId + '=w1600',
          thumbnail: 'https://lh3.googleusercontent.com/d/' + fileId + '=w600',
          driveUrl: file.getUrl(),
          dateCreated: formatDate(file.getDateCreated()),
          isDefault: false
        });
      }
    }
    return { status: 'success', data: backdrops };
  } catch (err) {
    return { status: 'error', message: err.toString(), data: [] };
  }
}

/**
 * Tải ảnh Backdrop sân khấu lên folder Drive "Backdrops_SanKhau"
 */
function uploadBackdropToDrive(data) {
  try {
    const folder = getBackdropFolder();
    let rawBase64 = data.fileData || '';
    if (rawBase64.indexOf(',') > -1) {
      rawBase64 = rawBase64.split(',')[1];
    }
    const decoded = Utilities.base64Decode(rawBase64);
    const cleanTitle = String(data.title || data.caption || 'Backdrop_K8A1').replace(/[^a-zA-Z0-9_\u00C0-\u024F\u1E00-\u1EFF]/g, '_');
    const fileName = cleanTitle + '_' + Date.now() + '.jpg';
    const blob = Utilities.newBlob(decoded, 'image/jpeg', fileName);
    const file = folder.createFile(blob);
    try {
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    } catch (eShare) {
      console.warn("Lỗi setSharing backdrop: " + eShare.toString());
    }

    const fileId = file.getId();
    const item = {
      id: fileId,
      title: cleanTitle.replace(/_/g, ' '),
      url: 'https://lh3.googleusercontent.com/d/' + fileId + '=w1600',
      thumbnail: 'https://lh3.googleusercontent.com/d/' + fileId + '=w600',
      driveUrl: file.getUrl(),
      dateCreated: formatDate(new Date()),
      isDefault: false
    };

    return {
      status: 'success',
      message: 'Tải backdrop lên Google Drive thành công!',
      data: item
    };
  } catch (err) {
    return { status: 'error', message: 'Lỗi upload Backdrop: ' + err.toString() };
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

    // Tạo Timestamp định dạng gọn gàng: YYYYMMDD_HHmmss
    const now = new Date();
    const pad = function(n) { return n < 10 ? '0' + n : String(n); };
    const timeStamp = now.getFullYear() + pad(now.getMonth() + 1) + pad(now.getDate()) + '_' + pad(now.getHours()) + pad(now.getMinutes()) + pad(now.getSeconds());

    // Hàm chuẩn hóa chuỗi tên file an toàn (loại bỏ dấu tiếng Việt và ký tự đặc biệt)
    const cleanStr = function(str) {
      if (!str) return '';
      return String(str)
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[đĐ]/g, 'd')
        .replace(/[^a-zA-Z0-9_-]/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '');
    };

    let fileName = '';
    const isExpense = data.receiptType === 'chi' || 
                      data.type === 'expense' || 
                      data.action === 'upload_expense_receipt' || 
                      Boolean(data.title);

    if (isExpense) {
      // 🏷️ ĐẶT TÊN CHO CHỨNG TỪ / HÓA ĐƠN CHI TIÊU (Prefix: Chi_)
      const cleanCategory = cleanStr(data.category || 'Chi');
      const cleanTitle = cleanStr(data.title || 'KhoanChi');
      const amount = Number(data.amount || data.fundAmount) || 0;
      const amountStr = amount > 0 ? '_' + amount + 'd' : '';
      fileName = 'Chi_' + (cleanCategory ? cleanCategory + '_' : '') + (cleanTitle || 'KhoanChi') + amountStr + '_' + timeStamp + '.jpg';
    } else {
      // 🏷️ ĐẶT TÊN CHO BIÊN LAI / BILL NỘP QUỸ (Prefix: Thu_)
      const cleanName = cleanStr(data.fullName || 'ThanhVien');
      const cleanPhone = String(data.phone || '').replace(/[^0-9]/g, '');
      const amount = Number(data.fundAmount || data.amount) || 0;
      const amountStr = amount > 0 ? '_' + amount + 'd' : '';
      fileName = 'Thu_' + (cleanName || 'ThanhVien') + (cleanPhone ? '_' + cleanPhone : '') + amountStr + '_' + timeStamp + '.jpg';
    }
    
    const blob = Utilities.newBlob(decoded, data.mimeType || 'image/jpeg', fileName);
    const file = receiptFolder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    const fileId = file.getId();
    const cdnUrl = 'https://lh3.googleusercontent.com/d/' + fileId + '=w1600';
    const driveUrl = file.getUrl();

    // 4. Ghi nhận chứng từ thu quỹ:
    // - Luôn lưu đầy đủ vào Sheet "Khoan_Thu"
    // - CHỈ cập nhật vào Sheet "Xac_Nhan_Tham_Gia" (RSVP) NẾU đây là khoản thu sự kiện họp lớp ('event')
    if (!isExpense && (data.phone || data.fullName)) {
      const isReunionEventFee = !data.category || data.category === 'event';

      // 4a. Tự động thêm vào Sheet Khoan_Thu
      try {
        addIncomeItem({
          id: 'inc-' + Date.now(),
          title: data.incomeTitle || (data.categoryLabel ? (data.categoryLabel + ' - ' + data.fullName) : ('Đóng quỹ họp lớp 20 năm - ' + data.fullName)),
          category: data.category || 'event',
          amount: Number(data.fundAmount || data.amount) || 700000,
          date: formatDate(new Date()),
          payerName: data.fullName,
          payerPhone: data.phone,
          memberId: data.memberId || '',
          paymentMethod: data.fundPaymentMethod || 'bank_transfer',
          auditor: data.fundAuditedBy || 'Thành viên gửi bill (Chờ đối soát)',
          receiptUrl: cdnUrl,
          eventScope: data.category === 'annual' ? 'Thường niên 2026' : 'Kỷ niệm 20 năm',
          note: data.fundNote || ('Tải lên bill ' + (data.fundAmount || 700000).toLocaleString('vi-VN') + 'đ')
        });
      } catch (errInc) {
        console.warn("Lỗi thêm Khoan_Thu: " + errInc);
      }

      // 4b. CHỈ cập nhật Sheet RSVP nếu là khoản đóng quỹ sự kiện họp lớp 20 năm ('event')
      // TUYỆT ĐỐI KHÔNG ghi đè Sheet RSVP nếu là Quỹ thường niên (100k), Mua áo polo, Tài trợ, v.v.
      if (isReunionEventFee) {
        const targetStatus = data.fundStatus || (data.fundAuditedBy ? 'paid' : 'pending');
        try {
          updateRSVP({
            phone: data.phone,
            fullName: data.fullName,
            fundReceiptUrl: cdnUrl,
            fundStatus: targetStatus,
            fundAmount: data.fundAmount || 700000,
            fundPaymentMethod: data.fundPaymentMethod || 'bank_transfer',
            fundPaidAt: data.fundPaidAt || formatDate(new Date()),
            fundAuditedBy: data.fundAuditedBy || '',
            fundNote: data.fundNote || ('Thành viên tự tải lên bill ' + (data.fundAmount || 700000).toLocaleString('vi-VN') + 'đ')
          });
        } catch (errSync) {
          console.warn("Lỗi sync sheet RSVP: " + errSync);
        }
      }
    }

    return {
      status: 'success',
      message: isExpense
        ? 'Đã lưu hóa đơn chi tiêu vào thư mục Drive ChungTu_QuyLop_K8A1!'
        : 'Đã lưu chứng từ nộp quỹ vào thư mục Drive ChungTu_QuyLop_K8A1!',
      fileId: fileId,
      url: cdnUrl,
      driveUrl: driveUrl,
      fileName: fileName
    };
  } catch (e) {
    return { status: 'error', message: 'Lỗi upload chứng từ Drive: ' + e.toString() };
  }
}

/**
 * Tải ảnh đại diện / Avatar học sinh lên thư mục con "Avatar_Thanh_Vien" trong Google Drive
 * và tự động cập nhật link vào chuỗi JSON cột Ghi chú của Tab Danh_Sach_Lop
 */
function uploadMemberAvatarToDrive(data) {
  const rootFolderId = CONFIG.DRIVE_FOLDER_ID || "1Skmip1HQhmXan-58kwbY_msamP-bWokq";
  let rootFolder = null;

  if (rootFolderId) {
    try {
      rootFolder = DriveApp.getFolderById(rootFolderId);
    } catch (e) {
      console.warn("Không mở được root folder: " + e.toString());
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

  // Tự động tìm hoặc tạo thư mục con riêng biệt "Avatar_Thanh_Vien"
  let avatarFolder = null;
  try {
    const subFolders = rootFolder.getFoldersByName("Avatar_Thanh_Vien");
    if (subFolders.hasNext()) {
      avatarFolder = subFolders.next();
    } else {
      avatarFolder = rootFolder.createFolder("Avatar_Thanh_Vien");
      avatarFolder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    }
  } catch (e) {
    avatarFolder = rootFolder;
  }

  try {
    let rawBase64 = data.fileData || data.base64 || data.imageBase64 || '';
    if (rawBase64.indexOf(',') > -1) {
      rawBase64 = rawBase64.split(',')[1];
    }
    if (!rawBase64) {
      return { status: 'error', message: 'Không tìm thấy dữ liệu ảnh base64' };
    }

    const decoded = Utilities.base64Decode(rawBase64);

    const cleanStr = function(str) {
      if (!str) return '';
      return String(str)
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[đĐ]/g, 'd')
        .replace(/[^a-zA-Z0-9_-]/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '');
    };

    const memberId = String(data.memberId || data.id || '').trim();
    const fullName = cleanStr(data.fullName || data.name || 'ThanhVien');
    const now = new Date();
    const pad = function(n) { return n < 10 ? '0' + n : String(n); };
    const timeStamp = now.getFullYear() + pad(now.getMonth() + 1) + pad(now.getDate()) + '_' + pad(now.getHours()) + pad(now.getMinutes());
    const fileName = 'Avatar_' + (memberId ? memberId + '_' : '') + fullName + '_' + timeStamp + '.jpg';

    const blob = Utilities.newBlob(decoded, 'image/jpeg', fileName);
    const file = avatarFolder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    const fileId = file.getId();
    const directUrl = 'https://lh3.googleusercontent.com/d/' + fileId + '=w1000';
    const driveUrl = file.getUrl();

    // 1. Cập nhật vào Tab Danh_Sach_Lop (cột 8 - chuỗi JSON ghi chú)
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const rosterSheet = ss.getSheetByName(CONFIG.ROSTER_SHEET_NAME);
    if (rosterSheet) {
      const rows = rosterSheet.getDataRange().getValues();
      for (let i = 1; i < rows.length; i++) {
        const rowId = String(rows[i][0] || '').trim();
        const rowName = String(rows[i][1] || '').trim().toLowerCase();
        const targetName = String(data.fullName || data.name || '').trim().toLowerCase();

        if ((memberId && rowId === memberId) || (targetName && rowName === targetName)) {
          let currentNote = String(rows[i][7] || '').trim();
          let noteObj = {};
          if (currentNote.startsWith('{') && currentNote.endsWith('}')) {
            try { noteObj = JSON.parse(currentNote); } catch (e) {}
          } else if (currentNote) {
            noteObj.generalNote = currentNote;
          }
          noteObj.avatarUrl = directUrl;
          rosterSheet.getRange(i + 1, 8).setValue(JSON.stringify(noteObj));
          break;
        }
      }
    }

    // 2. Cập nhật vào Tab Điểm danh RSVP (cột 9 / avatarUrl)
    const rsvpSheet = ss.getSheetByName(CONFIG.SHEET_NAME);
    if (rsvpSheet) {
      const rRows = rsvpSheet.getDataRange().getValues();
      for (let j = 1; j < rRows.length; j++) {
        const rMemberId = String(rRows[j][0] || '').trim();
        const rName = String(rRows[j][2] || '').trim().toLowerCase();
        const targetName = String(data.fullName || data.name || '').trim().toLowerCase();
        if ((memberId && rMemberId === memberId) || (targetName && rName === targetName)) {
          rsvpSheet.getRange(j + 1, 9).setValue(directUrl);
          break;
        }
      }
    }

    return {
      status: 'success',
      avatarUrl: directUrl,
      directUrl: directUrl,
      driveUrl: driveUrl,
      fileId: fileId,
      message: 'Đã lưu avatar vào thư mục Drive Avatar_Thanh_Vien và cập nhật chuỗi JSON thành công!'
    };
  } catch (err) {
    return { status: 'error', message: 'Lỗi tải avatar lên Drive: ' + err.toString() };
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

function formatDateTimeVi(date) {
  if (!date) return '';
  if (date instanceof Date) {
    const pad = (n) => (n < 10 ? '0' + n : n);
    return \`\${pad(date.getHours())}:\${pad(date.getMinutes())} ngày \${pad(date.getDate())}/\${pad(date.getMonth() + 1)}/\${date.getFullYear()}\`;
  }
  return String(date);
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
        } else if (typeof val === 'string' && (val.indexOf('{') === 0 || val.indexOf('[') === 0)) {
          try {
            val = JSON.parse(val);
          } catch (eJson) {}
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
      let valToSave = typeof value === 'object' ? JSON.stringify(value) : String(value ?? '');

      // Tự động chuyển đổi Base64 ảnh bìa sang Google Drive để tránh làm phình cell Google Sheet
      if (key === 'heroBannerUrl' && valToSave.indexOf('data:image/') === 0) {
        try {
          const upRes = uploadPhotoToDrive({ fileData: valToSave, caption: 'Hero_Banner' });
          if (upRes && upRes.data && upRes.data.url) {
            valToSave = upRes.data.url;
            newConfig.heroBannerUrl = valToSave;
          }
        } catch (eUp) {
          console.warn('Không thể tự động tải banner lên Drive:', eUp);
        }
      }

      // Giới hạn an toàn chống lỗi ô quá 50,000 ký tự của Google Sheet
      if (valToSave.length > 45000) {
        valToSave = valToSave.substring(0, 45000);
      }

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
    let photos = [];

    for (let i = 1; i < rows.length; i++) {
      const type = String(rows[i][0] || '').trim();
      const rawJson = String(rows[i][1] || '').trim();
      if (!rawJson) continue;
      try {
        if (type === 'videos') videos = JSON.parse(rawJson);
        if (type === 'venue_media') venueMedia = JSON.parse(rawJson);
        if (type === 'photos') photos = JSON.parse(rawJson);
      } catch (e) {}
    }

    return { status: 'success', data: { videos: videos, venueMedia: venueMedia, photos: photos } };
  } catch (err) {
    return { status: 'error', message: err.toString(), data: { videos: [], venueMedia: [], photos: [] } };
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
    let photoRow = null;

    for (let i = 1; i < rows.length; i++) {
      const type = String(rows[i][0] || '').trim();
      if (type === 'videos') videoRow = i + 1;
      if (type === 'venue_media') venueMediaRow = i + 1;
      if (type === 'photos') photoRow = i + 1;
    }

    const videos = postData.videos !== undefined ? postData.videos : (postData.media && postData.media.videos !== undefined ? postData.media.videos : undefined);
    const venueMedia = postData.venueMedia !== undefined ? postData.venueMedia : (postData.media && postData.media.venueMedia !== undefined ? postData.media.venueMedia : undefined);
    const photos = postData.photos !== undefined ? postData.photos : (postData.media && postData.media.photos !== undefined ? postData.media.photos : undefined);

    if (videos !== undefined) {
      const jsonStr = JSON.stringify(videos);
      if (videoRow) {
        sheet.getRange(videoRow, 2).setValue(jsonStr);
        sheet.getRange(videoRow, 3).setValue(nowStr);
      } else {
        sheet.appendRow(['videos', jsonStr, nowStr]);
      }
    }

    if (venueMedia !== undefined) {
      const jsonStr = JSON.stringify(venueMedia);
      if (venueMediaRow) {
        sheet.getRange(venueMediaRow, 2).setValue(jsonStr);
        sheet.getRange(venueMediaRow, 3).setValue(nowStr);
      } else {
        sheet.appendRow(['venue_media', jsonStr, nowStr]);
      }
    }

    if (photos !== undefined) {
      const jsonStr = JSON.stringify(photos);
      if (photoRow) {
        sheet.getRange(photoRow, 2).setValue(jsonStr);
        sheet.getRange(photoRow, 3).setValue(nowStr);
      } else {
        sheet.appendRow(['photos', jsonStr, nowStr]);
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
    ['m01', 'Nguyễn Tuấn Anh', 'Tuấn Báo', '', 'Bí thư', 'Nam', 'L', '', 'Khởi tạo'],
    ['m02', 'Trần Thị Thanh Hương', 'Hương Béo', '', 'Lớp phó', 'Nữ', 'M', '', 'Khởi tạo'],
    ['m03', 'Lê Hoàng Nam', 'Nam Còi', '', 'Thành viên', 'Nam', 'XL', '', 'Khởi tạo'],
    ['m04', 'Phạm Đức Thắng', 'Thắng Đầu Gấu', '', 'Thành viên', 'Nam', 'L', '', 'Khởi tạo'],
    ['m05', 'Vũ Mai Phương', 'Phương Mèo', '', 'Thủ quỹ', 'Nữ', 'S', '', 'Khởi tạo'],
    ['m06', 'Đỗ Hoàng Long', 'Long Kều', '', 'Ban Liên Lạc (Admin)', 'Nam', 'XL', '', 'Khởi tạo'],
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

function getClassRoster(isAdmin) {
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
      const shirtSize = String(row[6] || '').trim().toUpperCase();
      const note = String(row[7] || '').trim();

      members.push({
        id: id,
        fullName: fullName,
        nickname: nickname,
        phone: isAdmin ? phone : maskPhoneScript(phone),
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
      const shirtSize = String(m.shirtSize || '').trim().toUpperCase();
      const note = String(m.note || '').trim();
      return [id, fullName, nickname, phone, role, gender, shirtSize, note, nowStr];
    });

    if (rows.length > 0) {
      sheet.getRange(2, 1, rows.length, 9).setValues(rows);
    }

    // Tự động Cascade đồng bộ sang sheet RSVP đang hoạt động
    for (var mi = 0; mi < roster.length; mi++) {
      cascadeSyncMemberToRSVP(roster[mi]);
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
    const shirtSize = String(member.shirtSize || '').trim().toUpperCase();
    const note = String(member.note || '').trim();
    const nowStr = formatDate(new Date());

    sheet.appendRow([id, fullName, nickname, phone, role, gender, shirtSize, note, nowStr]);
    cascadeSyncMemberToRSVP({ id: id, fullName: fullName, nickname: nickname, phone: phone, shirtSize: shirtSize });
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

    // Tự động Cascade đồng bộ sang sheet RSVP đang hoạt động
    cascadeSyncMemberToRSVP(member);

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
 * 3E. QUẢN LÝ SỔ CHI TIÊU QUỸ LỚP (Sheet: "Khoan_Chi")
 * -------------------------------------------------------------
 */
function getExpensesList() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(CONFIG.EXPENSES_SHEET_NAME);
    if (!sheet) {
      sheet = ss.insertSheet(CONFIG.EXPENSES_SHEET_NAME);
      sheet.appendRow(['ID', 'Tiêu đề khoản chi', 'Nhóm chi', 'Số tiền', 'Ngày chi', 'Người chi', 'Người nhận/Đơn vị', 'Ảnh hóa đơn', 'Phạm vi sự kiện', 'Ghi chú', 'Thời gian tạo']);
      return { status: 'success', data: [] };
    }
    const rows = sheet.getDataRange().getValues();
    if (rows.length <= 1) return { status: 'success', data: [] };
    const list = [];
    for (let i = 1; i < rows.length; i++) {
      const r = rows[i];
      if (!r[0] && !r[1]) continue;
      let expDate = r[4];
      if (expDate instanceof Date) {
        const pad = function(n) { return n < 10 ? '0' + n : String(n); };
        expDate = pad(expDate.getDate()) + '/' + pad(expDate.getMonth() + 1) + '/' + expDate.getFullYear();
      } else {
        expDate = String(expDate || '').trim();
        if (expDate.includes('GMT') || expDate.length > 20) {
          try {
            const d = new Date(expDate);
            if (!isNaN(d.getTime())) {
              const pad = function(n) { return n < 10 ? '0' + n : String(n); };
              expDate = pad(d.getDate()) + '/' + pad(d.getMonth() + 1) + '/' + d.getFullYear();
            }
          } catch (e) {}
        }
      }

      list.push({
        id: String(r[0] || ''),
        title: String(r[1] || ''),
        category: String(r[2] || 'other'),
        amount: Number(r[3]) || 0,
        date: expDate,
        spender: String(r[5] || ''),
        recipient: String(r[6] || ''),
        receiptUrl: String(r[7] || ''),
        eventScope: String(r[8] || ''),
        note: String(r[9] || ''),
        createdAt: String(r[10] || '')
      });
    }
    return { status: 'success', data: list };
  } catch (err) {
    return { status: 'error', message: err.toString(), data: [] };
  }
}

function saveExpensesList(postData) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(CONFIG.EXPENSES_SHEET_NAME);
    if (!sheet) {
      sheet = ss.insertSheet(CONFIG.EXPENSES_SHEET_NAME);
    }
    sheet.clearContents();
    sheet.appendRow(['ID', 'Tiêu đề khoản chi', 'Nhóm chi', 'Số tiền', 'Ngày chi', 'Người chi', 'Người nhận/Đơn vị', 'Ảnh hóa đơn', 'Phạm vi sự kiện', 'Ghi chú', 'Thời gian tạo']);
    const expenses = Array.isArray(postData.expenses) ? postData.expenses : (postData.data || []);
    if (expenses.length > 0) {
      const rows = expenses.map(function(item, idx) {
        return [
          item.id || ('exp-' + (Date.now() + idx)),
          item.title || '',
          item.category || 'other',
          Number(item.amount) || 0,
          item.date || '',
          item.spender || '',
          item.recipient || '',
          item.receiptUrl || '',
          item.eventScope || '',
          item.note || '',
          item.createdAt || new Date().toISOString()
        ];
      });
      sheet.getRange(2, 1, rows.length, 11).setValues(rows);
    }
    return { status: 'success', message: 'Đã lưu danh sách chi tiêu quỹ lớp thành công!' };
  } catch (err) {
    return { status: 'error', message: err.toString() };
  }
}

/**
 * -------------------------------------------------------------
 * 3E-2. QUẢN LÝ SỔ THU QUỸ LỚP (Sheet: "Khoan_Thu")
 * -------------------------------------------------------------
 */
function getIncomesList() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(CONFIG.INCOMES_SHEET_NAME);
    if (!sheet) {
      sheet = ss.insertSheet(CONFIG.INCOMES_SHEET_NAME);
      sheet.appendRow([
        'ID', 
        'Tiêu đề khoản thu', 
        'Nhóm thu', 
        'Số tiền', 
        'Ngày thu', 
        'Người nộp/Đơn vị', 
        'Số điện thoại', 
        'Mã thành viên', 
        'Hình thức', 
        'Người đối soát', 
        'Ảnh biên lai/UNC', 
        'Phạm vi sự kiện', 
        'Ghi chú', 
        'Thời gian tạo'
      ]);
      sheet.getRange(1, 1, 1, 14).setFontWeight('bold').setBackground('#E8F5E9');
      return { status: 'success', data: [] };
    }
    const rows = sheet.getDataRange().getValues();
    if (rows.length <= 1) return { status: 'success', data: [] };
    const list = [];
    for (let i = 1; i < rows.length; i++) {
      const r = rows[i];
      if (!r[0] && !r[1] && !r[3]) continue;
      let incDate = r[4];
      if (incDate instanceof Date) {
        const pad = function(n) { return n < 10 ? '0' + n : String(n); };
        incDate = incDate.getFullYear() + '-' + pad(incDate.getMonth() + 1) + '-' + pad(incDate.getDate());
      } else {
        incDate = String(incDate || '').trim();
        if (incDate.includes('GMT') || incDate.length > 20) {
          try {
            const d = new Date(incDate);
            if (!isNaN(d.getTime())) {
              const pad = function(n) { return n < 10 ? '0' + n : String(n); };
              incDate = d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
            }
          } catch (e) {}
        }
      }

      list.push({
        id: String(r[0] || ('inc-' + i)),
        title: String(r[1] || ''),
        category: String(r[2] || 'other_income'),
        amount: Number(r[3]) || 0,
        date: incDate || '',
        payerName: String(r[5] || ''),
        payerPhone: String(r[6] || ''),
        memberId: String(r[7] || ''),
        paymentMethod: String(r[8] || 'bank_transfer'),
        auditor: String(r[9] || ''),
        receiptUrl: String(r[10] || ''),
        eventScope: String(r[11] || 'Kỷ niệm 20 năm'),
        note: String(r[12] || ''),
        createdAt: String(r[13] || '')
      });
    }
    return { status: 'success', data: list };
  } catch (err) {
    return { status: 'error', message: err.toString(), data: [] };
  }
}

function saveIncomesList(postData) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(CONFIG.INCOMES_SHEET_NAME);
    if (!sheet) {
      sheet = ss.insertSheet(CONFIG.INCOMES_SHEET_NAME);
    }
    sheet.clearContents();
    sheet.appendRow([
      'ID', 
      'Tiêu đề khoản thu', 
      'Nhóm thu', 
      'Số tiền', 
      'Ngày thu', 
      'Người nộp/Đơn vị', 
      'Số điện thoại', 
      'Mã thành viên', 
      'Hình thức', 
      'Người đối soát', 
      'Ảnh biên lai/UNC', 
      'Phạm vi sự kiện', 
      'Ghi chú', 
      'Thời gian tạo'
    ]);
    sheet.getRange(1, 1, 1, 14).setFontWeight('bold').setBackground('#E8F5E9');
    const incomes = Array.isArray(postData.incomes) ? postData.incomes : (postData.data || []);
    if (incomes.length > 0) {
      const rows = incomes.map(function(item, idx) {
        return [
          item.id || ('inc-' + (Date.now() + idx)),
          item.title || '',
          item.category || 'other_income',
          Number(item.amount) || 0,
          item.date || '',
          item.payerName || '',
          item.payerPhone || '',
          item.memberId || '',
          item.paymentMethod || 'bank_transfer',
          item.auditor || '',
          item.receiptUrl || '',
          item.eventScope || 'Kỷ niệm 20 năm',
          item.note || '',
          item.createdAt || new Date().toISOString()
        ];
      });
      sheet.getRange(2, 1, rows.length, 14).setValues(rows);
    }
    return { status: 'success', message: 'Đã lưu danh sách khoản thu vào Sheet Khoan_Thu thành công!' };
  } catch (err) {
    return { status: 'error', message: err.toString() };
  }
}

function addIncomeItem(item) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(CONFIG.INCOMES_SHEET_NAME);
    if (!sheet) {
      sheet = ss.insertSheet(CONFIG.INCOMES_SHEET_NAME);
      sheet.appendRow([
        'ID', 
        'Tiêu đề khoản thu', 
        'Nhóm thu', 
        'Số tiền', 
        'Ngày thu', 
        'Người nộp/Đơn vị', 
        'Số điện thoại', 
        'Mã thành viên', 
        'Hình thức', 
        'Người đối soát', 
        'Ảnh biên lai/UNC', 
        'Phạm vi sự kiện', 
        'Ghi chú', 
        'Thời gian tạo'
      ]);
      sheet.getRange(1, 1, 1, 14).setFontWeight('bold').setBackground('#E8F5E9');
    }
    const row = [
      item.id || ('inc-' + Date.now()),
      item.title || (item.categoryLabel ? (item.categoryLabel + ' - ' + (item.payerName || item.fullName || 'Thành viên')) : 'Khoản thu mới'),
      item.category || 'other_income',
      Number(item.amount || item.fundAmount) || 0,
      item.date || formatDate(new Date()),
      item.payerName || item.fullName || '',
      item.payerPhone || item.phone || '',
      item.memberId || '',
      item.paymentMethod || item.fundPaymentMethod || 'bank_transfer',
      item.auditor || item.fundAuditedBy || 'Thành viên gửi bill (Chờ đối soát)',
      item.receiptUrl || item.fundReceiptUrl || '',
      item.eventScope || (item.category === 'annual' ? 'Thường niên 2026' : 'Kỷ niệm 20 năm'),
      item.note || item.fundNote || '',
      item.createdAt || new Date().toISOString()
    ];
    sheet.appendRow(row);
    return { status: 'success', message: 'Đã thêm khoản thu vào Sheet Khoan_Thu thành công!' };
  } catch (err) {
    return { status: 'error', message: err.toString() };
  }
}

/**
 * -------------------------------------------------------------
 * 3F. BẢO MẬT & XÁC THỰC MÃ PIN (Sheet: "Bao_Mat_PIN")
 * -------------------------------------------------------------
 */
function getSecuritySheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(CONFIG.SECURITY_SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.SECURITY_SHEET_NAME);
    sheet.appendRow(['Khoa_Bao_Mat', 'Gia_Tri_PIN', 'Thoi_Gian_Cap_Nhat', 'Ghi_Chu']);
    sheet.getRange(1, 1, 1, 4).setFontWeight('bold').setBackground('#E2E8F0');
    // Khởi tạo các mã PIN mặc định an toàn
    sheet.appendRow(['admin_pin', '8888', new Date(), 'Mã PIN Admin toàn quyền']);
    sheet.appendRow(['treasurer_pin', '6868', new Date(), 'Mã PIN Thủ Quỹ đối soát và chi tiêu']);
    sheet.appendRow(['bll_pin', '2006', new Date(), 'Mã PIN Ban Liên Lạc']);
    sheet.appendRow(['failed_attempts', '0', new Date(), 'Số lần nhập sai liên tiếp']);
    sheet.appendRow(['locked_until', '0', new Date(), 'Thời điểm mở khóa (mili giây)']);
  }
  return sheet;
}

function verifySecurityPin(data) {
  try {
    const pin = String(data.pin || '').trim();
    if (!pin) {
      return { status: 'error', code: 'EMPTY_PIN', message: 'Vui lòng nhập mã PIN!' };
    }

    const sheet = getSecuritySheet();
    const rows = sheet.getDataRange().getValues();
    let pins = {
      admin_pin: '8888',
      treasurer_pin: '6868',
      bll_pin: '2006',
      failed_attempts: 0,
      locked_until: 0
    };
    let rowMap = {};

    for (let i = 1; i < rows.length; i++) {
      const k = String(rows[i][0] || '').trim();
      if (k) {
        pins[k] = rows[i][1];
        rowMap[k] = i + 1;
      }
    }

    // Kiểm tra khóa tạm nếu đã nhập sai quá 5 lần liên tiếp
    const now = Date.now();
    const lockedUntil = Number(pins.locked_until) || 0;
    if (lockedUntil > now) {
      const waitSec = Math.ceil((lockedUntil - now) / 1000);
      const waitMin = Math.ceil(waitSec / 60);
      return {
        status: 'error',
        code: 'LOCKED',
        message: 'Bạn đã nhập sai quá nhiều lần. Tạm khóa trong ' + waitMin + ' phút để bảo vệ an toàn!'
      };
    }

    // Đối chiếu mã PIN bảo mật
    let matchedRole = null;
    if (pin === String(pins.admin_pin).trim()) {
      matchedRole = 'admin';
    } else if (pin === String(pins.treasurer_pin).trim()) {
      matchedRole = 'treasurer';
    } else if (pin === String(pins.bll_pin).trim()) {
      matchedRole = 'bll';
    }

    if (matchedRole) {
      // Đăng nhập thành công: Reset số lần thử sai
      if (rowMap['failed_attempts']) sheet.getRange(rowMap['failed_attempts'], 2).setValue(0);
      if (rowMap['locked_until']) sheet.getRange(rowMap['locked_until'], 2).setValue(0);
      return {
        status: 'success',
        role: matchedRole,
        message: 'Xác thực thành công!'
      };
    } else {
      // Nhập sai: Tăng số lần thử sai
      let fails = (Number(pins.failed_attempts) || 0) + 1;
      if (fails >= 5) {
        const lockTime = now + 5 * 60 * 1000; // Khóa 5 phút
        if (rowMap['failed_attempts']) sheet.getRange(rowMap['failed_attempts'], 2).setValue(0);
        if (rowMap['locked_until']) sheet.getRange(rowMap['locked_until'], 2).setValue(lockTime);
        return {
          status: 'error',
          code: 'LOCKED',
          message: 'Bạn đã nhập sai 5 lần liên tiếp. Hệ thống tạm khóa xác thực 5 phút để bảo vệ an toàn!'
        };
      } else {
        if (rowMap['failed_attempts']) sheet.getRange(rowMap['failed_attempts'], 2).setValue(fails);
        const left = 5 - fails;
        return {
          status: 'error',
          code: 'WRONG_PIN',
          message: 'Mã PIN không chính xác! (Còn ' + left + ' lần thử)'
        };
      }
    }
  } catch (err) {
    return { status: 'error', message: err.toString() };
  }
}

function updateSecurityPins(data) {
  try {
    const currentAdminPin = String(data.currentAdminPin || '').trim();
    const sheet = getSecuritySheet();
    const rows = sheet.getDataRange().getValues();
    let pins = { admin_pin: '8888', treasurer_pin: '6868', bll_pin: '2006' };
    let rowMap = {};

    for (let i = 1; i < rows.length; i++) {
      const k = String(rows[i][0] || '').trim();
      if (k) {
        pins[k] = rows[i][1];
        rowMap[k] = i + 1;
      }
    }

    // Phải đúng mã PIN Admin hiện tại mới được phép cập nhật
    if (currentAdminPin !== String(pins.admin_pin).trim()) {
      return { status: 'error', message: 'Mã PIN Admin hiện tại không chính xác! Không thể thay đổi.' };
    }

    const now = new Date();
    if (data.newAdminPin && String(data.newAdminPin).trim().length === 4) {
      if (rowMap['admin_pin']) sheet.getRange(rowMap['admin_pin'], 2, 1, 2).setValues([[String(data.newAdminPin).trim(), now]]);
    }
    if (data.newTreasurerPin && String(data.newTreasurerPin).trim().length === 4) {
      if (rowMap['treasurer_pin']) sheet.getRange(rowMap['treasurer_pin'], 2, 1, 2).setValues([[String(data.newTreasurerPin).trim(), now]]);
    }
    if (data.newBllPin && String(data.newBllPin).trim().length === 4) {
      if (rowMap['bll_pin']) sheet.getRange(rowMap['bll_pin'], 2, 1, 2).setValues([[String(data.newBllPin).trim(), now]]);
    }

    return { status: 'success', message: 'Đã cập nhật và đồng bộ mã PIN mới lên Google Sheets thành công!' };
  } catch (err) {
    return { status: 'error', message: err.toString() };
  }
}

/**
 * -------------------------------------------------------------
 * 4. TOÀN BỘ CƠ SỞ DỮ LIỆU ĐỒNG BỘ 1 LỆNH (SINGLE SOURCE OF TRUTH)
 * -------------------------------------------------------------
 */
/**
 * -------------------------------------------------------------
 * 4. QUẢN LÝ QUÝ THẦY CÔ GIÁO K8A1 (SHEET: "Thay_Co_K8A1")
 * Hoàn toàn độc lập, không ảnh hưởng tới các sheet khác
 * -------------------------------------------------------------
 */
function getTeachersSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(CONFIG.TEACHERS_SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.TEACHERS_SHEET_NAME);
    initTeachersSheet(sheet);
  }
  return sheet;
}

function initTeachersSheet(sheet) {
  var headers = [
    'Mã Thầy Cô', 
    'Danh Xưng & Họ Tên', 
    'Giới Tính', 
    'Năm Sinh / Độ Tuổi', 
    'Số Điện Thoại Chính', 
    'SĐT Phụ / Người Thân', 
    'Địa Chỉ Nhà Riêng', 
    'Môn Giảng Dạy', 
    'Vai Trò Với K8A1', 
    'Tình Trạng Công Tác', 
    'Tiến Độ Gửi Thiệp', 
    'Trạng Thái Tham Dự', 
    'Người Đi Kèm', 
    'Phương Án Đưa Đón', 
    'Đầu Mối BLL Phụ Trách', 
    'Lưu Ý Sức Khỏe', 
    'Ảnh Chân Dung', 
    'Lời Dặn Dò / Kỷ Niệm', 
    'Ngày Cập Nhật'
  ];
  sheet.appendRow(headers);
  sheet.getRange(1, 1, 1, 19).setFontWeight('bold').setBackground('#FAF3E0');
}

function getTeachersList(isAdmin) {
  try {
    var sheet = getTeachersSheet();
    var rows = sheet.getDataRange().getValues();
    if (rows.length <= 1) return { status: 'success', data: [] };

    var teachers = [];
    for (var i = 1; i < rows.length; i++) {
      var r = rows[i];
      if (!r[0] && !r[1]) continue;
      var rawPhone = String(r[4] || '').trim();
      if (rawPhone.startsWith("'")) rawPhone = rawPhone.substring(1);
      var relPhone = String(r[5] || '').trim();
      if (relPhone.startsWith("'")) relPhone = relPhone.substring(1);

      var statusRaw = String(r[11] || 'Đang liên hệ').trim();
      var mappedStatus = 'pending';
      if (statusRaw.includes('Chắc chắn') || statusRaw === 'attending') mappedStatus = 'attending';
      else if (statusRaw.includes('lời chúc') || statusRaw === 'wishing') mappedStatus = 'wishing';
      else if (statusRaw.includes('bận') || statusRaw.includes('Không') || statusRaw === 'declined') mappedStatus = 'declined';
      else if (statusRaw.includes('Tưởng nhớ') || statusRaw === 'memorial') mappedStatus = 'memorial';

      teachers.push({
        id: String(r[0] || ('tc' + (i < 10 ? '0' + i : i))).trim(),
        name: String(r[1] || '').trim(),
        gender: String(r[2] || 'Cô').trim(),
        birthYear: String(r[3] || '').trim(),
        phone: isAdmin ? rawPhone : maskPhoneScript(rawPhone),
        relativePhone: isAdmin ? relPhone : maskPhoneScript(relPhone),
        address: isAdmin ? String(r[6] || '').trim() : '',
        subject: String(r[7] || '').trim(),
        role: String(r[8] || 'Giáo viên Bộ môn').trim(),
        workStatus: String(r[9] || 'Đã nghỉ hưu').trim(),
        inviteProgress: String(r[10] || 'Chưa gửi').trim(),
        status: mappedStatus,
        companion: String(r[12] || 'Đi một mình').trim(),
        transportation: String(r[13] || 'Tự túc').trim(),
        coordinator: String(r[14] || '').trim(),
        healthNotes: String(r[15] || '').trim(),
        avatarUrl: String(r[16] || '').trim(),
        quote: String(r[17] || '').trim(),
        updatedAt: formatDate(r[18] || new Date())
      });
    }
    return { status: 'success', data: teachers, total: teachers.length };
  } catch (err) {
    return { status: 'error', message: err.toString(), data: [] };
  }
}

function saveTeachersList(postData) {
  try {
    var sheet = getTeachersSheet();
    var teachers = postData.teachers || [];
    if (!Array.isArray(teachers)) {
      return { status: 'error', message: 'Dữ liệu không đúng định dạng mảng!' };
    }

    sheet.clearContents();
    var headers = [
      'Mã Thầy Cô', 
      'Danh Xưng & Họ Tên', 
      'Giới Tính', 
      'Năm Sinh / Độ Tuổi', 
      'Số Điện Thoại Chính', 
      'SĐT Phụ / Người Thân', 
      'Địa Chỉ Nhà Riêng', 
      'Môn Giảng Dạy', 
      'Vai Trò Với K8A1', 
      'Tình Trạng Công Tác', 
      'Tiến Độ Gửi Thiệp', 
      'Trạng Thái Tham Dự', 
      'Người Đi Kèm', 
      'Phương Án Đưa Đón', 
      'Đầu Mối BLL Phụ Trách', 
      'Lưu Ý Sức Khỏe', 
      'Ảnh Chân Dung', 
      'Lời Dặn Dò / Kỷ Niệm', 
      'Ngày Cập Nhật'
    ];
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, 19).setFontWeight('bold').setBackground('#FAF3E0');

    var nowStr = formatDate(new Date());
    var rows = teachers.map(function(t, idx) {
      var p = String(t.phone || '').trim();
      if (p && !p.startsWith("'")) p = "'" + p;
      var rp = String(t.relativePhone || '').trim();
      if (rp && !rp.startsWith("'")) rp = "'" + rp;

      var st = t.status === 'attending' ? 'Chắc chắn tham dự' : (t.status === 'wishing' ? 'Gửi lời chúc từ xa' : (t.status === 'declined' ? 'Báo bận / Không tham dự' : (t.status === 'memorial' ? 'Tưởng nhớ tri ân' : 'Đang liên hệ')));

      return [
        t.id || ('tc' + (idx < 9 ? '0' + (idx + 1) : (idx + 1))),
        t.name || '',
        t.gender || 'Cô',
        t.birthYear || '',
        p,
        rp,
        t.address || '',
        t.subject || '',
        t.role || 'Giáo viên Bộ môn',
        t.workStatus || 'Đã nghỉ hưu',
        t.inviteProgress || 'Chưa gửi',
        st,
        t.companion || 'Đi một mình',
        t.transportation || 'Tự túc',
        t.coordinator || '',
        t.healthNotes || '',
        t.avatarUrl || '',
        t.quote || '',
        nowStr
      ];
    });

    if (rows.length > 0) {
      sheet.getRange(2, 1, rows.length, 19).setValues(rows);
    }
    return { status: 'success', message: 'Đã lưu danh sách ' + rows.length + ' thầy cô thành công!', count: rows.length };
  } catch (err) {
    return { status: 'error', message: err.toString() };
  }
}

function addTeacher(postData) {
  try {
    var sheet = getTeachersSheet();
    var t = postData.teacher || postData;
    if (!t.name) return { status: 'error', message: 'Tên thầy cô không được để trống!' };

    var lastRow = sheet.getLastRow();
    var id = t.id || ('tc' + (lastRow < 10 ? '0' + lastRow : lastRow));
    var nowStr = formatDate(new Date());

    var p = String(t.phone || '').trim();
    if (p && !p.startsWith("'")) p = "'" + p;
    var rp = String(t.relativePhone || '').trim();
    if (rp && !rp.startsWith("'")) rp = "'" + rp;
    var st = t.status === 'attending' ? 'Chắc chắn tham dự' : (t.status === 'wishing' ? 'Gửi lời chúc từ xa' : (t.status === 'declined' ? 'Báo bận / Không tham dự' : (t.status === 'memorial' ? 'Tưởng nhớ tri ân' : 'Đang liên hệ')));

    sheet.appendRow([
      id,
      t.name,
      t.gender || 'Cô',
      t.birthYear || '',
      p,
      rp,
      t.address || '',
      t.subject || '',
      t.role || 'Giáo viên Bộ môn',
      t.workStatus || 'Đã nghỉ hưu',
      t.inviteProgress || 'Chưa gửi',
      st,
      t.companion || 'Đi một mình',
      t.transportation || 'Tự túc',
      t.coordinator || '',
      t.healthNotes || '',
      t.avatarUrl || '',
      t.quote || '',
      nowStr
    ]);
    return { status: 'success', message: 'Đã thêm ' + t.name + ' vào danh sách Thầy Cô!', id: id };
  } catch (err) {
    return { status: 'error', message: err.toString() };
  }
}

function updateTeacher(postData) {
  try {
    var sheet = getTeachersSheet();
    var t = postData.teacher || postData;
    var tid = String(t.id || '').trim();
    if (!tid) return { status: 'error', message: 'Thiếu ID thầy cô' };

    var rows = sheet.getDataRange().getValues();
    var targetRow = -1;
    for (var i = 1; i < rows.length; i++) {
      if (String(rows[i][0] || '').trim() === tid) {
        targetRow = i + 1;
        break;
      }
    }

    if (targetRow === -1) return { status: 'error', message: 'Không tìm thấy thầy cô có ID: ' + tid };

    var nowStr = formatDate(new Date());
    if (t.name) sheet.getRange(targetRow, 2).setValue(String(t.name).trim());
    if (t.gender) sheet.getRange(targetRow, 3).setValue(String(t.gender).trim());
    if (t.birthYear !== undefined) sheet.getRange(targetRow, 4).setValue(String(t.birthYear).trim());
    if (t.phone !== undefined) {
      var p = String(t.phone).trim();
      sheet.getRange(targetRow, 5).setValue(p ? "'" + p : '');
    }
    if (t.relativePhone !== undefined) {
      var rp = String(t.relativePhone).trim();
      sheet.getRange(targetRow, 6).setValue(rp ? "'" + rp : '');
    }
    if (t.address !== undefined) sheet.getRange(targetRow, 7).setValue(String(t.address).trim());
    if (t.subject) sheet.getRange(targetRow, 8).setValue(String(t.subject).trim());
    if (t.role) sheet.getRange(targetRow, 9).setValue(String(t.role).trim());
    if (t.workStatus !== undefined) sheet.getRange(targetRow, 10).setValue(String(t.workStatus).trim());
    if (t.inviteProgress !== undefined) sheet.getRange(targetRow, 11).setValue(String(t.inviteProgress).trim());
    if (t.status !== undefined) {
      var st = t.status === 'attending' ? 'Chắc chắn tham dự' : (t.status === 'wishing' ? 'Gửi lời chúc từ xa' : (t.status === 'declined' ? 'Báo bận / Không tham dự' : (t.status === 'memorial' ? 'Tưởng nhớ tri ân' : 'Đang liên hệ')));
      sheet.getRange(targetRow, 12).setValue(st);
    }
    if (t.companion !== undefined) sheet.getRange(targetRow, 13).setValue(String(t.companion).trim());
    if (t.transportation !== undefined) sheet.getRange(targetRow, 14).setValue(String(t.transportation).trim());
    if (t.coordinator !== undefined) sheet.getRange(targetRow, 15).setValue(String(t.coordinator).trim());
    if (t.healthNotes !== undefined) sheet.getRange(targetRow, 16).setValue(String(t.healthNotes).trim());
    if (t.avatarUrl !== undefined) sheet.getRange(targetRow, 17).setValue(String(t.avatarUrl).trim());
    if (t.quote !== undefined) sheet.getRange(targetRow, 18).setValue(String(t.quote).trim());
    sheet.getRange(targetRow, 19).setValue(nowStr);

    return { status: 'success', message: 'Đã cập nhật thông tin ' + (t.name || 'thầy cô') + ' thành công!' };
  } catch (err) {
    return { status: 'error', message: err.toString() };
  }
}

function deleteTeacher(postData) {
  try {
    var sheet = getTeachersSheet();
    var tid = String(postData.id || postData.teacherId || '').trim();
    if (!tid) return { status: 'error', message: 'Thiếu ID thầy cô' };

    var rows = sheet.getDataRange().getValues();
    for (var i = 1; i < rows.length; i++) {
      if (String(rows[i][0] || '').trim() === tid) {
        sheet.deleteRow(i + 1);
        return { status: 'success', message: 'Đã xóa thầy cô khỏi danh sách' };
      }
    }
    return { status: 'error', message: 'Không tìm thấy thầy cô có ID: ' + tid };
  } catch (err) {
    return { status: 'error', message: err.toString() };
  }
}

function getAllData(isAdmin) {
  try {
    // Tự động đảm bảo Sheet Bao_Mat_PIN luôn tồn tại
    try { getSecuritySheet(); } catch (secErr) {}

    let rsvp = [];
    try { rsvp = (getRSVPList(isAdmin) || {}).data || []; } catch (e) { console.warn('rsvp err', e); }

    let wishes = [];
    try { wishes = (getWishesList() || {}).data || []; } catch (e) { console.warn('wishes err', e); }

    let config = {};
    try { config = (getEventConfig() || {}).data || {}; } catch (e) { console.warn('config err', e); }

    let media = { videos: [], venueMedia: [], photos: [] };
    try { media = (getMediaSettings() || {}).data || media; } catch (e) { console.warn('media err', e); }

    let roster = [];
    try { roster = (getClassRoster(isAdmin) || {}).data || []; } catch (e) { console.warn('roster err', e); }

    let viewCount = 1258;
    try { viewCount = (getViewCount() || {}).count || 1258; } catch (e) {}

    let drivePhotos = [];
    try { drivePhotos = (getDrivePhotos() || {}).data || []; } catch (e) {}

    let expenses = [];
    try { expenses = (getExpensesList() || {}).data || []; } catch (e) {}

    let incomes = [];
    try { incomes = (getIncomesList() || {}).data || []; } catch (e) {}

    let teachers = [];
    try { teachers = (getTeachersList(isAdmin) || {}).data || []; } catch (e) {}

    let backdrops = [];
    try { backdrops = (getDriveBackdrops() || {}).data || []; } catch (e) {}

    return {
      status: 'success',
      data: {
        rsvp: rsvp,
        wishes: wishes,
        config: config,
        media: media,
        roster: roster,
        viewCount: viewCount,
        drivePhotos: drivePhotos,
        expenses: expenses,
        incomes: incomes,
        teachers: teachers,
        backdrops: backdrops
      }
    };
  } catch (err) {
    return { status: 'error', message: err.toString() };
  }
}
