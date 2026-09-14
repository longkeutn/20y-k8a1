# KẾ HOẠCH NÂNG CẤP: MODULE QUẢN LÝ THÔNG BÁO & BẢN TIN HOẠT ĐỘNG K8A1

**Dự án:** WebApp Kỷ Niệm 20 Năm Ngày Trở Về — Tập thể K8A1 THPT Thái Nguyên (2003 — 2006)  
**Thời gian lập:** 14/09/2026  
**Đơn vị chủ trì:** Ban Liên Lạc K8A1 & Đội ngũ Kỹ thuật WebApp  
**Mục tiêu:** Xây dựng cổng thông tin và phát ngôn chính thức, tập trung, chống trôi tin, kết nối hai chiều với Zalo và đồng bộ qua Google Sheets.

---

## 1. Bối Cảnh & Sự Cần Thiết

### 1.1. Thực trạng kênh truyền thông hiện tại
- Nhóm chat Zalo lớp có 65 thành viên: lượng tin nhắn trao đổi, chúc mừng, gửi ảnh và tán gẫu diễn ra liên tục.
- **Hiện tượng trôi tin (Information Overload & Loss)**: Các thông báo mang tính quyết định của Ban Liên Lạc (BLL) như hạn chốt đặt may áo, mức đóng góp quỹ lớp, sơ đồ kịch bản ngày hội khóa thường bị trôi rất nhanh.
- Tính năng "Ghim tin nhắn" trên Zalo bị giới hạn số lượng (chỉ ghim 1-3 tin ngắn) và không hỗ trợ hiển thị danh sách dài hay trình bày định dạng phong phú.
- Thành viên bận rộn nhiều ngày không vào Zalo thường gặp khó khăn khi tìm lại các mốc thời gian và yêu cầu chính thức.

### 1.2. Sứ mệnh của Module Thông Báo & Bản Tin K8A1
- Trở thành **"Tòa soạn báo / Kênh phát ngôn chính thống duy nhất"** của tập thể K8A1.
- Mọi quyết định, thông cáo, cập nhật tiến độ đều được số hóa, lưu trữ vĩnh viễn và phân loại khoa học.
- Tạo cầu nối hai chiều: Đăng bài trên Web -> Xuất bản thông điệp mẫu 1-chạm gửi vào nhóm Zalo -> Thành viên bấm link để xem bài viết chi tiết trên WebApp.

---

## 2. Kiến Trúc Phân Loại Thông Báo (Categories & Tags)

Hệ thống hỗ trợ 5 danh mục bài viết rõ ràng, giúp người đọc nhận biết ngay mức độ ưu tiên:

| STT | Danh Mục | Mã Nhãn | Mô Tả & Trường Hợp Sử Dụng |
| :--- | :--- | :--- | :--- |
| 1 | **Thông Báo Khẩn** | `urgent` | Cảnh báo viền đỏ nhấp nháy, ghim đầu trang. Dùng khi sắp hết hạn chốt áo, thay đổi giờ giấc, điểm hẹn đột xuất. |
| 2 | **Kế Hoạch & Lịch Trình** | `schedule` | Các quyết định chính thức, kịch bản chi tiết 3 buổi: Cổng trường (08:30) & Nhà hàng The Prime (11:00). |
| 3 | **Bản Tin Hoạt Động** | `activity` | Ký sự ảnh BLL đi tiền trạm, hình ảnh áo mẫu thực tế, phỏng vấn thầy cô giáo cũ, chuyện ngày xưa. |
| 4 | **Báo Cáo Minh Bạch Quỹ** | `fund` | Bản tin định kỳ cập nhật số tiền đã thu, danh sách tri ân mạnh thường quân ủng hộ hội khóa. |
| 5 | **Khảo Sát & Lấy Ý Kiến** | `poll` | Thu thập ý kiến tập thể về bài hát văn nghệ, lựa chọn món ăn tiệc trưa, đóng góp ý tưởng. |

---

## 3. Trải Nghiệm Người Dùng (Frontend UX/UI)

### 3.1. Quả Chuông Thông Báo Trên Thanh Header (`NotificationBell`)
- Nằm cố định trên thanh Navbar cạnh huy hiệu thành viên và nút Điểm danh.
- Hiển thị chấm đỏ đếm số thông báo mới chưa đọc (ví dụ: `[🔔 2]`).
- Cơ chế đọc thông minh: So sánh ngày đăng bài viết với timestamp lưu trong `localStorage` của trình duyệt. Chỉ hiện chấm đỏ khi có tin mới xuất bản sau lần cuối người dùng mở web.
- Bấm vào quả chuông sẽ mở nhanh Popup/Drawer tóm tắt các tin tức mới nhất kèm đường dẫn đọc chi tiết.

### 3.2. Dải Tin Tiêu Điểm Ghim Đầu Trang (`BreakingNewsTicker`)
- Đặt ngay bên dưới thanh điều hướng hoặc khu vực Hero.
- Chạy nhẹ dòng chữ thông báo khẩn cấp nhất kèm nút `[Đọc ngay]`, giúp thành viên vừa vào web là nắm được thông tin cốt lõi.

### 3.3. Khối Bản Tin Hoạt Động K8A1 Trên Trang Chủ (`ClassNewsFeed`)
- Trình bày dạng thẻ tạp chí cổ điển (Vintage Golden Paper) đồng bộ nhận diện K8A1:
  - Ảnh đại diện bài viết (Thumbnail) tỉ lệ 16:9 sắc nét.
  - Huy hiệu danh mục (Badge) có màu sắc nhận diện riêng.
  - Tiêu đề in đậm, trích đoạn tóm tắt 2 dòng súc tích.
  - Tác giả & Ngày đăng (ví dụ: *Ban Liên Lạc K8A1 • 14/09/2026*).
  - Bộ đếm tương tác cảm xúc: Lượt thả tim ❤️, Tán thành 🎉 của cả lớp.

### 3.4. Trình Đọc Bài Viết Chuyên Sâu (`AnnouncementDetailModal`)
- Hiển thị bài viết toàn màn hình hoặc popup lớn, định dạng văn bản chuẩn Typography dễ đọc trên điện thoại.
- Cho phép phóng to xem ảnh kích thước lớn.
- **Nút Hành Động Kèm Theo (Call to Action - CTA)** trực tiếp ở cuối mỗi bài viết:
  - Bài về đồng phục -> Nút `[👕 Chọn Size Áo Ngay]`.
  - Bài về lịch trình -> Nút `[📅 Thêm Vào Lịch Điện Thoại]`.
  - Bài về kinh phí -> Nút `[💰 Mở Sổ Quỹ & Cổng Chuyển Khoản]`.
- **Nút "Chia Sẻ Lên Nhóm Zalo"**: Tự động sao chép tiêu đề, trích đoạn và link trực tiếp của bài viết để dán vào Zalo.

---

## 4. Công Cụ Quản Trị Dành Cho Ban Liên Lạc (Admin CMS)

Tích hợp trực tiếp vào module quản trị `AdminManagementHub` (yêu cầu mã PIN BLL/Admin):

- **Biểu mẫu đăng bài trực quan**:
  - Nhập Tiêu đề bài viết.
  - Chọn Danh mục phân loại.
  - Nhập đoạn tóm tắt ngắn (1-2 câu).
  - Soạn nội dung chi tiết (hỗ trợ xuống dòng, gạch đầu dòng, nhấn mạnh in đậm).
  - Chèn link ảnh minh họa (Google Drive, Imgur, link web).
  - Tùy chọn gán nút hành động nhanh (CTA) trỏ đến các khối chức năng trong WebApp.
  - Checkbox tùy chọn: **"Ghim bài viết lên vị trí đầu tiên"**.
- **Tính năng "1-Chạm Soạn Tin Nhắn Zalo"**:
  - Khi hoàn tất đăng bài, hệ thống cung cấp nút bấm tự động định dạng mẫu tin nhắn văn bản chuẩn có icon đẹp để BLL copy và thả vào nhóm Zalo lớp:
  ```text
  📢 [THÔNG BÁO CHÍNH THỨC TỪ BLL K8A1] 📢
  ━━━━━━━━━━━━━━━━━━━━━━
  Tiêu đề: Chốt danh sách đặt may áo đồng phục Polo kỷ niệm 20 năm
  Thời hạn: Trước 23:59 ngày 18/09/2026
  
  👉 Các bạn xem thông báo chi tiết và chọn size áo tại đây:
  https://k8a1.vercel.app#tin-tuc
  ━━━━━━━━━━━━━━━━━━━━━━
  ```

---

## 5. Thiết Kế Cơ Sở Dữ Liệu (Google Sheets & API)

Lưu trữ dữ liệu trong trang tính mới có tên **`Thong_Bao`** thuộc bảng tính Google Spreadsheet của lớp:

| Cột | Tên Trường | Kiểu Dữ Liệu | Ví Dụ | Ghi Chú |
| :--- | :--- | :--- | :--- | :--- |
| A | `id` | Chuỗi | `TB-2026-001` | Khóa chính duy nhất |
| B | `title` | Chuỗi | `Thông báo chốt số lượng may áo polo K8A1` | Tiêu đề bài viết |
| C | `category` | Chuỗi | `urgent`, `schedule`, `shirts`, `fund` | Phân loại |
| D | `summary` | Chuỗi | `Xưởng may chuẩn bị cắt vải, còn 12 bạn chưa chọn...` | Tóm tắt card |
| E | `content` | Văn bản dài | `Thân gửi các bạn K8A1, Ban Liên Lạc xin thông báo...` | Toàn văn bài viết |
| F | `imageUrl` | Chuỗi URL | `https://.../anh_ao_mau.jpg` | Ảnh bìa |
| G | `actionUrl` | Chuỗi | `#diem-danh` | Link điều hướng |
| H | `actionLabel` | Chuỗi | `Chọn Size Áo Ngay` | Tên nút bấm |
| I | `isPinned` | Boolean | `TRUE` / `FALSE` | Trạng thái ghim |
| J | `createdAt` | Thời gian | `2026-09-14 09:30:00` | Ngày đăng |
| K | `author` | Chuỗi | `Ban Liên Lạc K8A1` | Người đăng |
| L | `status` | Chuỗi | `published` / `draft` / `archived` | Trạng thái bài |

### Backend API trong `Code.gs`:
- `action=get_announcements`: Đọc toàn bộ danh sách bài viết ở trạng thái `published` (hỗ trợ cache và không phân quyền).
- `action=save_announcement`: Yêu cầu mã PIN Admin để thêm mới hoặc sửa bài viết.
- `action=delete_announcement`: Yêu cầu mã PIN Admin để gỡ bài viết.

---

## 6. Lộ Trình Triển Khai Chi Tiết (3 Giai Đoạn)

### Giai đoạn 1: Thiết kế Giao diện & Trình đọc phía Client
1. Định nghĩa kiểu dữ liệu `Announcement` trong `src/types.ts`.
2. Khởi tạo danh sách bài viết mẫu phong phú trong `src/data.ts`.
3. Xây dựng component `src/components/ClassNewsFeed.tsx` hiển thị trên trang chủ.
4. Xây dựng component `src/components/AnnouncementDetailModal.tsx` đọc bài chi tiết.
5. Thêm icon quả chuông thông minh `NotificationBell` trên thanh Navbar Header.

### Giai đoạn 2: Tích hợp Backend Google Sheets & Quản trị BLL
1. Bổ sung Sheet `Thong_Bao` trên Google Sheets.
2. Viết hàm `getAnnouncements()` và `saveAnnouncement()` trong `Code.gs` và `public/Code.gs`.
3. Thêm tab **"Quản Lý Bản Tin & Thông Báo"** trong `src/components/AdminManagementHub.tsx` cho BLL tạo bài viết.
4. Tích hợp nút tạo văn bản sao chép gửi nhanh sang nhóm Zalo.

### Giai đoạn 3: Kết hợp Thông báo Lịch Hẹn & Tối ưu Di động
1. Tích hợp nút `[📅 Thêm Vào Lịch Điện Thoại (.ics / Google Calendar)]` trực tiếp bên trong các bài viết lịch trình.
2. Tối ưu PWA để người dùng có thể cài đặt web ra màn hình chính điện thoại.
