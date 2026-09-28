# Hướng Dẫn Quản Lý Ảnh Kỷ Niệm Theo Thư Mục Album Google Drive (K8A1)

Tài liệu này hướng dẫn cách hệ thống WebApp và Google Apps Script tự động quản lý, phân loại và đồng bộ hình ảnh / video kỷ niệm của Lớp K8A1 theo từng thư mục Album độc lập trên Google Drive.

---

## I. Xử Lý Khi Bạn Đã Xóa Thư Mục Cũ Trên Google Drive

Bạn hoàn toàn yên tâm khi đã xóa thư mục cũ trên Google Drive! Hệ thống đã được nâng cấp cơ chế **Auto-Healing & Auto-Provisioning (Tự Động Phục Hồi & Khởi Tạo Thư Mục Mới)**:

1. **Không lo lỗi gãy link hay treo upload**:
   - Khi thư mục cũ bị xóa hoặc chuyển vào Thùng rác (*Trash*), mã nguồn backend Google Apps Script sẽ tự động nhận diện `folder.isTrashed()`.
   - Hệ thống sẽ **tự động tạo mới thư mục gốc `K8A1_KyNiem_20Nam`** trên Google Drive và thiết lập quyền xem công khai (*Anyone with link can view*).

2. **Tự động sinh 6 thư mục Album con chuẩn hóa**:
   Bên trong thư mục gốc `K8A1_KyNiem_20Nam`, hệ thống tự động khởi tạo 6 thư mục con tương ứng với từng chặng đường kỷ niệm:
   - 📁 `1. Thoi_Nien_Thieu_2003_2006` — Thời Niên Thiếu (2003 — 2006)
   - 📁 `2. Thay_Co_Va_Mai_Truong` — Thầy Cô & Mái Trường Kính Yêu
   - 📁 `3. Hoi_Ngo_10_Nam_2016` — Hội Ngộ 10 Năm Ngày Trở Về (2016)
   - 📁 `4. Hoi_Ngo_15_Nam_2021` — Hội Ngộ 15 Năm Ngày Trở Về (2021)
   - 📁 `5. Dai_Le_20_Nam_2026` — Đại Lễ 20 Năm Ngày Trở Về (2026)
   - 📁 `6. Dong_Gop_Tu_Lieu_Anh` — Đóng Góp & Tư Liệu Thành Viên
   - Cùng các thư mục kỹ thuật: `Backdrops_SanKhau`, `ChungTu_QuyLop_K8A1`, `Avatar_Thanh_Vien`.

---

## II. Các Tính Năng Đột Phá Đã Triển Khai

### 1. Phân loại ảnh thông minh khi Upload
- Khi thành viên tải ảnh lên từ **Góc Kỷ Niệm**, họ chọn Album tương ứng (ví dụ: *Thời Niên Thiếu (2003-2006)*).
- Google Apps Script sẽ lưu file thẳng vào thư mục `1. Thoi_Nien_Thieu_2003_2006` trên Google Drive.
- Không còn tình trạng hàng trăm ảnh đổ chung lộn xộn vào một thư mục gốc như trước.

### 2. Hai chiều đồng bộ với Google Drive (Two-Way Sync)
- **Kéo thả trực tiếp trên Google Drive**: Ban tổ chức hoặc thành viên có thể tải cả folder ảnh từ máy tính thả trực tiếp vào thư mục `1. Thoi_Nien_Thieu_2003_2006` trên Google Drive.
- **Tự động nhận diện trên WebApp**: Khi WebApp quét Google Drive (`get_photos`), nó tự động duyệt qua tất cả các thư mục con, đọc tên folder và tự động phân loại đúng vào Album tương ứng trên giao diện!

### 3. Trình chiếu Màn LED Sân Khấu theo từng Album (`StagePresentationHub`)
- Kỹ thuật viên / MC có thể chọn chiếu:
  - **Tất cả Album** (xáo trộn luân phiên ngẫu nhiên).
  - Hoặc **Chỉ chiếu riêng một Album cụ thể** (ví dụ: trong phần phát biểu tri ân, chỉ chiếu Album *Thầy Cô & Mái Trường*; trong phần ôn lại tuổi học trò, chỉ chiếu Album *Thời Niên Thiếu 2003-2006*).
- Bộ chọn Album xuất hiện ngay trên thanh điều khiển nhanh của MC và trong modal Cài Đặt Sân Khấu.

### 4. Bảng Quản Trị Admin chuyên nghiệp (`AdminManagementHub`)
- Tab **Media & Kỷ Niệm** -> Sub-tab **Quản Lý Album**:
  - Xem danh sách album, số lượng ảnh trong từng album.
  - Đổi ảnh bìa cho album.
  - Chỉnh sửa tên, niên khóa, mô tả hoặc thêm album mới.
  - **Nút "Đồng bộ Thư Mục Drive"**: Bấm 1 chạm để Google Apps Script tự động tạo và liên kết cả 6 folder trên Drive.
- Sub-tab **Kho Ảnh Kỷ Niệm**:
  - Bộ lọc ảnh theo từng Album (Dạng thẻ pill).
  - Chọn nhiều ảnh cùng lúc để **Chuyển hàng loạt sang Album khác** (*Batch Move*).
  - Đặt ảnh bất kỳ làm ảnh bìa cho Album.

---

## III. Các Bước Triển Khai Lên Google Apps Script

Để backend Google Apps Script bắt đầu nhận diện cấu trúc Album mới:

1. **Mở Google Spreadsheet của lớp** -> Vào menu **Tiện ích mở rộng (Extensions)** -> **Apps Script**.
2. Mở file mã nguồn `Code.gs` trên Apps Script Editor.
3. Mở file `public/Code.gs` trong thư mục dự án này, copy toàn bộ nội dung và dán đè vào `Code.gs` trên Apps Script.
4. Bấm **Lưu (Ctrl + S)**.
5. Bấm nút **Triển khai (Deploy)** (màu xanh ở góc phải trên) -> **Quản lý bản triển khai (Manage deployments)**:
   - Bấm vào biểu tượng **Bút chì (Edit)** ở bản triển khai Web App hiện tại.
   - Tại mục **Phiên bản (Version)**, chọn **Phiên bản mới (New version)**.
   - Bấm **Triển khai (Deploy)**.
6. Quay lại trang **Quản Trị Admin** trên WebApp:
   - Vào mục **Media & Kỷ Niệm** -> **Quản Lý Album**.
   - Bấm nút **Đồng bộ Thư Mục Drive**.
   - Hệ thống sẽ gọi Apps Script, tự động tạo mới thư mục gốc và 6 thư mục con trên Drive của bạn, đồng thời liên kết sẵn đường dẫn vào từng Album!
