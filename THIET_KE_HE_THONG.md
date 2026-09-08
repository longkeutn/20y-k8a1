# THIẾT KẾ HỆ THỐNG ĐỒNG BỘ DỮ LIỆU & ĐA SỰ KIỆN WEBAPP K8A1

> **Ngày lập tài liệu:** 08/09/2026  
> **Dự án:** WebApp Kỷ Niệm 20 Năm & Họp Lớp Thường Niên K8A1 THPT Thái Nguyên  
> **Kiến trúc sư:** Antigravity System Architect  
> **Nguồn chân lý (Single Source of Truth):** Bắt buộc tham chiếu tài liệu này trước mọi chỉnh sửa Backend (Apps Script) và Frontend (React/Vite).

---

## 1. MỤC TIÊU DỰ ÁN & VẤN ĐỀ CỐT LÕI

### 1.1 Mục tiêu
1. **Toàn vẹn Dữ liệu (Data Integrity):** Dù Admin có sửa họ tên, thêm họ, chuẩn hóa tên đệm hay đổi SĐT trong danh bạ lớp, hệ thống vẫn liên kết chính xác 1-1 với dữ liệu điểm danh, size áo và đóng quỹ 700k mà không bao giờ bị gãy liên kết hay tạo bản ghi mồ côi.
2. **Kiến trúc Đa sự kiện (Multi-Event Zero-Code):** Sau sự kiện 20 năm, khi tổ chức các sự kiện tiếp theo (Tất niên 2026, Họp lớp 25 năm...), hệ thống tự động phân vùng sheet mới qua cấu hình, tuyệt đối không cần viết lại mã nguồn.
3. **Bảo toàn 100% Dữ liệu Hiện Hữu:** Tuyệt đối không làm mất dữ liệu của các bạn đã đăng ký và nộp quỹ trên sheet `Trang_tinh_1` hiện tại.

---

## 2. CẤU TRÚC DATABASE GOOGLE SHEETS

### 2.1 Sheet Master: `Danh_Sach_Lop` (Danh bạ Sĩ số K8A1 - Dùng chung vĩnh viễn)
- **Vai trò:** Bảng danh bạ gốc (Single Source of Truth). Sĩ số 65 học sinh.
- **Cấu trúc 9 cột:**
  | Cột | Tên Cột | Kiểu Dữ Liệu | Mô tả / Ràng buộc |
  | :--- | :--- | :--- | :--- |
  | **A** | `Mã TV` | String (PK) | Khóa chính bất biến: `m01`, `m02`, ..., `m65` |
  | **B** | `Họ và tên` | String | Họ tên đầy đủ |
  | **C** | `Biệt danh` | String | Biệt danh thời đi học |
  | **D** | `Số điện thoại` | String (Text) | Lưu dạng `'09xxxxxxxx` |
  | **E** | `Vai trò` | String | Lớp trưởng, Lớp phó, Bí thư, Thủ quỹ, Thành viên... |
  | **F** | `Giới tính` | String | Nam / Nữ |
  | **G** | `Size áo` | String | S, M, L, XL, XXL, XXXL |
  | **H** | `Ghi chú` | String | Nơi ở, tỉnh thành, ghi chú thêm |
  | **I** | `Ngày cập nhật`| String | Thời gian sửa đổi gần nhất |

---

### 2.2 Sheet Điểm Danh Sự Kiện: `Trang_tinh_1` (Nâng cấp lên 17 Cột)
- **Tên sheet hiện tại:** `Trang_tinh_1` (Sự kiện 20 Năm).
- **Tên sheet tương lai:** Định nghĩa động qua `Cau_Hinh.currentRsvpSheet` (VD: `RSVP_TatNien2026`).
- **Cấu trúc chuẩn 17 cột (Giữ nguyên A-P, thêm Q):**
  | Cột | Tên Cột | Kiểu | Mô tả |
  | :--- | :--- | :--- | :--- |
  | **A** | `Họ và Tên` | String | Họ tên người tham gia |
  | **B** | `Biệt danh` | String | Biệt danh |
  | **C** | `Số điện thoại` | String | SĐT người đăng ký |
  | **D** | `Tình trạng` | String | `Có tham gia` / `Rất tiếc vắng mặt` |
  | **E** | `Size áo` | String | S, M, L, XL, XXL, XXXL |
  | **F** | `Lời nhắn` | String | Lời chúc / Lời nhắn gửi |
  | **G** | `Thời gian gửi` | Date/String | Thời gian submit form |
  | **H** | `Điểm danh đến` | String | `ĐÃ ĐẾN` / `CHƯA ĐẾN` |
  | **I** | `Giờ đến` | String | Giờ check-in thực tế |
  | **J** | `Quỹ 700k` | String | `ĐÃ ĐÓNG` / `CHỜ ĐỐI SOÁT` / `MIỄN` / `CHƯA ĐÓNG` |
  | **K** | `Số tiền` | Number | Số tiền thực đóng (700000) |
  | **L** | `Ghi chú quỹ` | String | Ghi chú đóng quỹ |
  | **M** | `Link Ảnh Bill/UNC` | String (URL) | Link ảnh Google Drive chứng từ nộp tiền |
  | **N** | `Thời gian nộp` | String | Thời gian đóng quỹ |
  | **O** | `Hình thức` | String | `bank_transfer` / `cash` / `other` |
  | **P** | `Người đối soát` | String | Tên Thủ quỹ / Admin xác nhận |
  | **Q (MỚI)** | `Mã TV` | String (FK) | **Khóa ngoại liên kết với `Danh_Sach_Lop.Mã TV` (`m01`..`m65`)** |

---

### 2.3 Sheet Cấu Hình Đa Sự Kiện: `Cau_Hinh`
- **Các khóa cấu hình mới:**
  - `currentEventId`: `k8a1_20y` (Mặc định: Sự kiện 20 năm).
  - `currentRsvpSheet`: `Trang_tinh_1` (Mặc định). Khi sang sự kiện mới, đổi thành tên sheet mới.
  - `fundAmountPerPerson`: Số tiền định mức (VD: 700000).

---

## 3. THIẾT KẾ BACKEND (GOOGLE APPS SCRIPT)

### 3.1 Hàm `getActiveRsvpSheet()` (Dynamic Partitioning)
- Thay thế toàn bộ hardcode `CONFIG.RSVP_SHEET_NAME`.
- Tự động lấy tên sheet từ cấu hình. Nếu sheet chưa tồn tại, tự động tạo mới (`insertSheet`) và khởi tạo đầy đủ 17 cột với tiêu đề in đậm nền `#FAF3E0`.

### 3.2 Thuật toán So khớp & Upsert (Ưu tiên Tuyệt Đối Khóa Ngoại)
1. **Bước 1:** Khớp theo `Mã TV` (Cột Q = `postData.memberId`). Nếu khớp $\rightarrow$ Ghi đè cập nhật.
2. **Bước 2:** Khớp theo `targetRowId` (nếu họ tên không mâu thuẫn).
3. **Bước 3:** Khớp theo `normalizePhone(rawPhone)`.
4. **Bước 4:** Khớp theo `normalizeName(rawName)` (chỉ áp dụng nếu trong danh bạ chỉ có đúng 1 bạn mang họ tên này).

### 3.3 Đồng Bộ Tự Động 2 Chiều (Cascade Sync)
- **Khi WebApp cập nhật danh bạ (`saveClassRoster` / `updateClassMember`):**
  - Tự động dò sang sheet RSVP đang hoạt động: Tìm dòng có cùng `memberId`.
  - Cập nhật tức thì: `Họ và Tên`, `Biệt danh`, `Số điện thoại`, `Size áo` và gán Cột Q = `memberId`.
- **Khi sửa trực tiếp trên Google Sheets (`onEdit(e)` Trigger):**
  - Nếu sửa tại sheet `Danh_Sach_Lop` (cột 2, 3, 4, 7): Trigger đọc `Mã TV` tại Cột A.
  - Tìm dòng tương ứng bên Sheet Điểm danh và đồng bộ ngay lập tức!
- **Hàm Quét & Migration 1-Chạm (`action: 'sync_roster_to_rsvp'`):**
  - Quét toàn bộ dòng hiện tại của `Trang_tinh_1`.
  - Ánh xạ với `Danh_Sach_Lop` theo tên/SĐT hiện có.
  - Điền mã `m01`..`m65` vào Cột Q và chuẩn hóa thông tin.

---

## 4. THIẾT KẾ FRONTEND (REACT / VITE)

### 4.1 Quản lý State & Đồng bộ
- `sanitizeRsvp`: Chuẩn hóa bắt buộc có thuộc tính `memberId: item.memberId ? String(item.memberId).trim() : undefined`.
- `handleUpdateClassRoster`: Khi danh bạ thay đổi, tự động duyệt `rsvpList` và cập nhật thông tin mới nhất cho các bản ghi có cùng `memberId`.
- Mọi so khớp hiển thị tại `ClassGatheringCounter`, `ConfirmedAttendees`, `StudentPassModal`, `AdminManagementHub`, `BankTransfer`, `RsvpForm` đều lấy **`memberId === m.id` làm điều kiện tiên quyết**.

### 4.2 Giao diện Admin Hub
- Thêm nút hành động: **"🔄 Đồng bộ Danh bạ sang Điểm danh (1-Chạm)"**.
- Hiển thị huy hiệu `Mã TV` trên bảng Điểm danh và Quỹ lớp để Admin dễ dàng kiểm tra liên kết.

---

## 5. BẢO MẬT & AUDIT TRAIL
- Thao tác đồng bộ hàng loạt hoặc sửa danh bạ yêu cầu mã PIN Quản trị viên (`isAdmin`).
- Số điện thoại ở chế độ Guest tiếp tục được bảo mật (che mờ 3 số giữa).
