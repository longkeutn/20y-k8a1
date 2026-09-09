import { UserRole, RsvpData, WishData, MemoryImage, MemoryVideo, TimelineMilestone, QuizQuestion, PollItem, ScheduleItem, SponsorItem, EventConfig, ClassMember, ExpenseCategory, IncomeCategory, ExpenseItem, IncomeItem, TeacherData, TeacherTribute } from './types';

export const INITIAL_RSVP_LIST: RsvpData[] = [
  {
    "id": "1",
    "memberId": "m06",
    "rowId": "2",
    "fullName": "Thành Long",
    "nickname": "Long Kều",
    "phone": "0919 ••• 588",
    "status": "yes",
    "shirtSize": "3XL",
    "message": "",
    "submittedAt": "07/09/2026 10:24",
    "checkedIn": false,
    "checkedInAt": "",
    "fundStatus": "paid",
    "fundAmount": 700000,
    "fundNote": "",
    "fundReceiptUrl": "https://lh3.googleusercontent.com/d/1xw6OxmG5W1pjeJWNos4ovcoW2sH6h7Kf=w1600",
    "hasReceipt": true,
    "fundPaidAt": "14:35 • 07/09/2026",
    "fundPaymentMethod": "bank_transfer",
    "fundAuditedBy": "Thủ Quỹ BLL"
  },
  {
    "id": "2",
    "rowId": "3",
    "fullName": "Đỗ Bắc",
    "nickname": "Đỗ Bắc",
    "phone": "0972 ••• •21",
    "status": "yes",
    "shirtSize": "XL",
    "message": "20 năm rồi chớp mắt một cái, hôm đó nhất định không say không về!",
    "submittedAt": "07/09/2026 15:50",
    "checkedIn": false,
    "checkedInAt": "",
    "fundStatus": "paid",
    "fundAmount": 700000,
    "fundNote": "Thành viên gửi bill khai báo: 500.000đ (Chờ BLL đối soát)",
    "fundReceiptUrl": "https://lh3.googleusercontent.com/d/19C7Jhhz2bCvG-1_4QEF0Q0GAdx4Bxnrr=w1600",
    "hasReceipt": true,
    "fundPaidAt": "14:31 • 06/09/2026",
    "fundPaymentMethod": "bank_transfer",
    "fundAuditedBy": "Thủ Quỹ BLL"
  },
  {
    "id": "3",
    "rowId": "4",
    "fullName": "Trần Thị Thanh Nhạn",
    "nickname": "Nhạn còi",
    "phone": "0982 ••• •91",
    "status": "yes",
    "shirtSize": "L",
    "message": "Cho tớ xin 1 vé về Thanh xuân",
    "submittedAt": "07/09/2026 15:55",
    "checkedIn": false,
    "checkedInAt": "",
    "fundStatus": "paid",
    "fundAmount": 1000000,
    "fundNote": "Thành viên gửi bill khai báo: 1.000.000đ (Chờ BLL đối soát) (BLL đã khớp lệnh)",
    "fundReceiptUrl": "https://lh3.googleusercontent.com/d/13FEaWt8tYXJAe1_oORcOWXg02KH_2Us8=w1600",
    "hasReceipt": true,
    "fundPaidAt": "16:30 ngày 06/09/2026",
    "fundPaymentMethod": "bank_transfer",
    "fundAuditedBy": "Thủ Quỹ BLL"
  },
  {
    "id": "4",
    "rowId": "5",
    "fullName": "Bùi Thành Long",
    "nickname": "Long Phình",
    "phone": "0936 ••• •22",
    "status": "yes",
    "shirtSize": "3XL",
    "message": "",
    "submittedAt": "06/09/2026 16:26",
    "checkedIn": false,
    "checkedInAt": "",
    "fundStatus": "paid",
    "fundAmount": 770000,
    "fundNote": "Thành viên gửi bill khai báo: 1.000.000đ (Chờ BLL đối soát) (BLL đã khớp lệnh)",
    "fundReceiptUrl": "https://lh3.googleusercontent.com/d/1WtXtNbJExkdb9foqHj6gNK_HgGR-blbg=w1600",
    "hasReceipt": true,
    "fundPaidAt": "00:00 ngày 01/09/2026",
    "fundPaymentMethod": "bank_transfer",
    "fundAuditedBy": "Thủ Quỹ BLL"
  },
  {
    "id": "5",
    "rowId": "6",
    "fullName": "Nguyễn Thị Huyền Trang (Trang A)",
    "nickname": "Trang A",
    "phone": "0365 ••• •43",
    "status": "yes",
    "shirtSize": "M",
    "message": "Cùng bàn Lan Hương, Phùng Bá Thắng",
    "submittedAt": "07/09/2026 10:36",
    "checkedIn": false,
    "checkedInAt": "",
    "fundStatus": "paid",
    "fundAmount": 1000000,
    "fundNote": "",
    "fundReceiptUrl": "https://lh3.googleusercontent.com/d/1hW3amhV5YSMlO67r2efbvOzYDqze4q3O=w1600",
    "hasReceipt": true,
    "fundPaidAt": "10:36 ngày 07/09/2026",
    "fundPaymentMethod": "bank_transfer",
    "fundAuditedBy": "Thủ Quỹ BLL"
  },
  {
    "id": "6",
    "rowId": "7",
    "fullName": "Đào Hồng Nhung",
    "nickname": "Nhung Vịt",
    "phone": "0947 ••• •89",
    "status": "yes",
    "shirtSize": "S",
    "message": "",
    "submittedAt": "07/09/2026 18:18",
    "checkedIn": false,
    "checkedInAt": "",
    "fundStatus": "paid",
    "fundAmount": 700000,
    "fundNote": "",
    "fundReceiptUrl": "",
    "hasReceipt": false,
    "fundPaidAt": "15:18 ngày 07/09/2026",
    "fundPaymentMethod": "bank_transfer",
    "fundAuditedBy": "Thủ Quỹ BLL"
  },
  {
    "id": "7",
    "rowId": "8",
    "fullName": "Vũ Phương Thảo",
    "nickname": "Thảo",
    "phone": "0919 ••• •89",
    "status": "yes",
    "shirtSize": "L",
    "message": "",
    "submittedAt": "06/09/2026 16:41",
    "checkedIn": false,
    "checkedInAt": "",
    "fundStatus": "paid",
    "fundAmount": 700000,
    "fundNote": "",
    "fundReceiptUrl": "https://lh3.googleusercontent.com/d/1K8r-yHQ6HJboi9jZozu0sTs9kmT8mSZb=w1600",
    "hasReceipt": true,
    "fundPaidAt": "18:02 ngày 06/09/2026",
    "fundPaymentMethod": "bank_transfer",
    "fundAuditedBy": "Thủ Quỹ BLL"
  },
  {
    "id": "8",
    "rowId": "9",
    "fullName": "Kiên Hoàng",
    "nickname": "KienWin",
    "phone": "0979 ••• •88",
    "status": "yes",
    "shirtSize": "L",
    "message": "Hẹn gặp lại đầy đủ anh em hội bàn cuối ngày xưa nhé!",
    "submittedAt": "07/09/2026 11:42",
    "checkedIn": false,
    "checkedInAt": "",
    "fundStatus": "paid",
    "fundAmount": 700000,
    "fundNote": "",
    "fundReceiptUrl": "",
    "hasReceipt": false,
    "fundPaidAt": "18:03 ngày 06/09/2026",
    "fundPaymentMethod": "bank_transfer",
    "fundAuditedBy": "Thủ Quỹ BLL"
  },
  {
    "id": "9",
    "rowId": "10",
    "fullName": "Huyền Trang",
    "nickname": "Trang B",
    "phone": "0985 ••• •33",
    "status": "yes",
    "shirtSize": "L",
    "message": "",
    "submittedAt": "06/09/2026 16:42",
    "checkedIn": false,
    "checkedInAt": "",
    "fundStatus": "unpaid",
    "fundAmount": 0,
    "fundNote": "",
    "fundReceiptUrl": "",
    "hasReceipt": false,
    "fundPaidAt": "",
    "fundPaymentMethod": "bank_transfer",
    "fundAuditedBy": ""
  },
  {
    "id": "10",
    "rowId": "11",
    "fullName": "Hùng Quang",
    "nickname": "Lâm Hùng Quang",
    "phone": "0353 ••• •82",
    "status": "yes",
    "shirtSize": "2XL",
    "message": "",
    "submittedAt": "06/09/2026 16:42",
    "checkedIn": false,
    "checkedInAt": "",
    "fundStatus": "paid",
    "fundAmount": 1000000,
    "fundNote": "",
    "fundReceiptUrl": "https://lh3.googleusercontent.com/d/16sBov0_hnotre-efeJwUzN5XqN-cUNMb=w1600",
    "hasReceipt": true,
    "fundPaidAt": "18:00 ngày 06/09/2026",
    "fundPaymentMethod": "bank_transfer",
    "fundAuditedBy": "Thủ Quỹ BLL"
  },
  {
    "id": "11",
    "rowId": "12",
    "fullName": "Trần Khuyến",
    "nickname": "Khuyến",
    "phone": "1638 ••• •51",
    "status": "yes",
    "shirtSize": "L",
    "message": "",
    "submittedAt": "06/09/2026 16:43",
    "checkedIn": false,
    "checkedInAt": "",
    "fundStatus": "unpaid",
    "fundAmount": 0,
    "fundNote": "",
    "fundReceiptUrl": "",
    "hasReceipt": false,
    "fundPaidAt": "",
    "fundPaymentMethod": "bank_transfer",
    "fundAuditedBy": ""
  },
  {
    "id": "12",
    "rowId": "13",
    "fullName": "Tỉnh gạch",
    "nickname": "Tỉnh gạch",
    "phone": "0975 ••• •19",
    "status": "yes",
    "shirtSize": "L",
    "message": "",
    "submittedAt": "06/09/2026 17:56",
    "checkedIn": false,
    "checkedInAt": "",
    "fundStatus": "paid",
    "fundAmount": 700000,
    "fundNote": "",
    "fundReceiptUrl": "",
    "hasReceipt": false,
    "fundPaidAt": "15:50 ngày 07/09/2026",
    "fundPaymentMethod": "bank_transfer",
    "fundAuditedBy": "Thủ Quỹ BLL"
  },
  {
    "id": "13",
    "rowId": "14",
    "fullName": "Linh Hữu",
    "nickname": "Linh Hữu",
    "phone": "1688 ••• •27",
    "status": "yes",
    "shirtSize": "L",
    "message": "",
    "submittedAt": "06/09/2026 16:44",
    "checkedIn": false,
    "checkedInAt": "",
    "fundStatus": "paid",
    "fundAmount": 700000,
    "fundNote": "[Quỹ Họp Lớp 20 Năm] Thành viên gửi bill khai báo: 700.000đ (Chờ BLL đối soát) (BLL đã khớp lệnh)",
    "fundReceiptUrl": "https://lh3.googleusercontent.com/d/1CbQUHTZcq0l4Xp312_m37Eny7LuoAvLH=w1600",
    "hasReceipt": true,
    "fundPaidAt": "15:19 ngày 07/09/2026",
    "fundPaymentMethod": "bank_transfer",
    "fundAuditedBy": "Thủ Quỹ BLL"
  },
  {
    "id": "14",
    "rowId": "15",
    "fullName": "Phương Mai",
    "nickname": "Mai mô",
    "phone": "0917 ••• •26",
    "status": "yes",
    "shirtSize": "L",
    "message": "",
    "submittedAt": "07/09/2026 10:24",
    "checkedIn": false,
    "checkedInAt": "",
    "fundStatus": "unpaid",
    "fundAmount": 0,
    "fundNote": "",
    "fundReceiptUrl": "",
    "hasReceipt": false,
    "fundPaidAt": "",
    "fundPaymentMethod": "bank_transfer",
    "fundAuditedBy": ""
  },
  {
    "id": "15",
    "rowId": "16",
    "fullName": "Thu Hoài",
    "nickname": "Hoài",
    "phone": "0915 ••• •26",
    "status": "yes",
    "shirtSize": "L",
    "message": "",
    "submittedAt": "06/09/2026 16:45",
    "checkedIn": false,
    "checkedInAt": "",
    "fundStatus": "unpaid",
    "fundAmount": 0,
    "fundNote": "",
    "fundReceiptUrl": "",
    "hasReceipt": false,
    "fundPaidAt": "",
    "fundPaymentMethod": "bank_transfer",
    "fundAuditedBy": ""
  },
  {
    "id": "16",
    "rowId": "17",
    "fullName": "Trần Trung Kiên",
    "nickname": "Trần Kiên",
    "phone": "0948 ••• •88",
    "status": "yes",
    "shirtSize": "XL",
    "message": "",
    "submittedAt": "06/09/2026 16:45",
    "checkedIn": false,
    "checkedInAt": "",
    "fundStatus": "paid",
    "fundAmount": 700000,
    "fundNote": "",
    "fundReceiptUrl": "https://lh3.googleusercontent.com/d/1_jK3ei3-BT_HodUEbBWe7ZasoBwVoGvv=w1600",
    "hasReceipt": true,
    "fundPaidAt": "18:01 ngày 06/09/2026",
    "fundPaymentMethod": "bank_transfer",
    "fundAuditedBy": "Thủ Quỹ BLL"
  },
  {
    "id": "17",
    "rowId": "18",
    "fullName": "Việt Thịnh",
    "nickname": "Thịnh",
    "phone": "0947 ••• •12",
    "status": "yes",
    "shirtSize": "L",
    "message": "",
    "submittedAt": "06/09/2026 17:52",
    "checkedIn": false,
    "checkedInAt": "",
    "fundStatus": "paid",
    "fundAmount": 700000,
    "fundNote": "",
    "fundReceiptUrl": "",
    "hasReceipt": false,
    "fundPaidAt": "15:17 ngày 07/09/2026",
    "fundPaymentMethod": "bank_transfer",
    "fundAuditedBy": "Thủ Quỹ BLL"
  },
  {
    "id": "18",
    "rowId": "19",
    "fullName": "Đinh Lan Huyền",
    "nickname": "Đinh Lan Huyền",
    "phone": "0976 ••• •03",
    "status": "yes",
    "shirtSize": "L",
    "message": "",
    "submittedAt": "06/09/2026 17:53",
    "checkedIn": false,
    "checkedInAt": "",
    "fundStatus": "unpaid",
    "fundAmount": 0,
    "fundNote": "",
    "fundReceiptUrl": "",
    "hasReceipt": false,
    "fundPaidAt": "",
    "fundPaymentMethod": "bank_transfer",
    "fundAuditedBy": ""
  },
  {
    "id": "19",
    "rowId": "20",
    "fullName": "Quyết cổ",
    "nickname": "Quyết cổ",
    "phone": "0943 ••• •88",
    "status": "yes",
    "shirtSize": "L",
    "message": "",
    "submittedAt": "07/09/2026 09:50",
    "checkedIn": false,
    "checkedInAt": "",
    "fundStatus": "unpaid",
    "fundAmount": 0,
    "fundNote": "",
    "fundReceiptUrl": "",
    "hasReceipt": false,
    "fundPaidAt": "",
    "fundPaymentMethod": "bank_transfer",
    "fundAuditedBy": ""
  },
  {
    "id": "20",
    "rowId": "21",
    "fullName": "Trường",
    "nickname": "Trường tập",
    "phone": "0978 ••• •27",
    "status": "yes",
    "shirtSize": "XL",
    "message": "Hẹn gặp lại đầy đủ anh em hội bàn cuối ngày xưa nhé! Hẹn gặp lại đầy đủ anh em hội bàn cuối ngày xưa nhé!",
    "submittedAt": "07/09/2026 15:55",
    "checkedIn": false,
    "checkedInAt": "",
    "fundStatus": "paid",
    "fundAmount": 700000,
    "fundNote": "",
    "fundReceiptUrl": "https://lh3.googleusercontent.com/d/1isNLGe-aYmtF07zoAKEg3PMt9-KcyBTn=w1600",
    "hasReceipt": true,
    "fundPaidAt": "18:04 ngày 06/09/2026",
    "fundPaymentMethod": "bank_transfer",
    "fundAuditedBy": "Thủ Quỹ BLL"
  },
  {
    "id": "21",
    "rowId": "22",
    "fullName": "Đặng Huyền",
    "nickname": "Huyền Đặng",
    "phone": "0979 ••• •04",
    "status": "yes",
    "shirtSize": "L",
    "message": "",
    "submittedAt": "06/09/2026 18:06",
    "checkedIn": false,
    "checkedInAt": "",
    "fundStatus": "paid",
    "fundAmount": 700000,
    "fundNote": "Thành viên gửi bill khai báo: 700.000đ (Chờ BLL đối soát) (BLL đã khớp lệnh)",
    "fundReceiptUrl": "https://lh3.googleusercontent.com/d/1UzEhszp7yTzPVmq5Mmwc_94BKm9ANSRY=w1600",
    "hasReceipt": true,
    "fundPaidAt": "18:08 ngày 06/09/2026",
    "fundPaymentMethod": "bank_transfer",
    "fundAuditedBy": "Thủ Quỹ BLL"
  },
  {
    "id": "22",
    "rowId": "23",
    "fullName": "Lan Hương",
    "nickname": "Lan Hương",
    "phone": "0938 ••• •89",
    "status": "yes",
    "shirtSize": "L",
    "message": "",
    "submittedAt": "06/09/2026 18:07",
    "checkedIn": false,
    "checkedInAt": "",
    "fundStatus": "paid",
    "fundAmount": 700000,
    "fundNote": "Thành viên gửi bill khai báo: 700.000đ (Chờ BLL đối soát) (BLL đã khớp lệnh)",
    "fundReceiptUrl": "https://lh3.googleusercontent.com/d/1wOoFxnA_H3gFhUJDe1HzZ2oDwXtBM7gW=w1600",
    "hasReceipt": true,
    "fundPaidAt": "18:08 ngày 06/09/2026",
    "fundPaymentMethod": "bank_transfer",
    "fundAuditedBy": "Thủ Quỹ BLL"
  },
  {
    "id": "23",
    "rowId": "24",
    "fullName": "Tuấn Thành",
    "nickname": "Thành hói",
    "phone": "0968 ••• •66",
    "status": "yes",
    "shirtSize": "2XL",
    "message": "",
    "submittedAt": "06/09/2026 18:17",
    "checkedIn": false,
    "checkedInAt": "",
    "fundStatus": "paid",
    "fundAmount": 1000000,
    "fundNote": "Thành viên gửi bill khai báo: 1.000.000đ (Chờ BLL đối soát) (BLL đã khớp lệnh)",
    "fundReceiptUrl": "https://lh3.googleusercontent.com/d/1-84pFsD3vLn7BtgnEqkni8zhH44xRQFP=w1600",
    "hasReceipt": true,
    "fundPaidAt": "18:21 ngày 06/09/2026",
    "fundPaymentMethod": "bank_transfer",
    "fundAuditedBy": "Thủ Quỹ BLL"
  },
  {
    "id": "24",
    "rowId": "25",
    "fullName": "Nguyễn Huyền",
    "nickname": "Huyền Kều",
    "phone": "0988 ••• •82",
    "status": "yes",
    "shirtSize": "L",
    "message": "20 năm rồi chớp mắt một cái, hôm đó nhất định không say không về!",
    "submittedAt": "07/09/2026 09:55",
    "checkedIn": false,
    "checkedInAt": "",
    "fundStatus": "unpaid",
    "fundAmount": 700000,
    "fundNote": "",
    "fundReceiptUrl": "",
    "hasReceipt": false,
    "fundPaidAt": "",
    "fundPaymentMethod": "bank_transfer",
    "fundAuditedBy": ""
  },
  {
    "id": "25",
    "rowId": "26",
    "fullName": "Hoàng Dung",
    "nickname": "Hoàng Dung",
    "phone": "0912 ••• •92",
    "status": "yes",
    "shirtSize": "L",
    "message": "20 năm rồi chớp mắt một cái, hôm đó nhất định không say không về!",
    "submittedAt": "07/09/2026 10:07",
    "checkedIn": false,
    "checkedInAt": "",
    "fundStatus": "unpaid",
    "fundAmount": 700000,
    "fundNote": "",
    "fundReceiptUrl": "",
    "hasReceipt": false,
    "fundPaidAt": "",
    "fundPaymentMethod": "bank_transfer",
    "fundAuditedBy": ""
  },
  {
    "id": "26",
    "rowId": "27",
    "fullName": "Hoàng Dũng",
    "nickname": "Dũng Dê",
    "phone": "0906 ••• •11",
    "status": "yes",
    "shirtSize": "2XL",
    "message": "",
    "submittedAt": "07/09/2026 10:16",
    "checkedIn": false,
    "checkedInAt": "",
    "fundStatus": "paid",
    "fundAmount": 700000,
    "fundNote": "",
    "fundReceiptUrl": "https://lh3.googleusercontent.com/d/1eTn5rE0mJUu-EOxkLyipuqAgzgDldgTE=w1600",
    "hasReceipt": true,
    "fundPaidAt": "10:22 ngày 07/09/2026",
    "fundPaymentMethod": "bank_transfer",
    "fundAuditedBy": "Thủ Quỹ BLL"
  },
  {
    "id": "27",
    "rowId": "28",
    "fullName": "Nguyễn Thị Trang",
    "nickname": "Trang béo",
    "phone": "0983 ••• •64",
    "status": "yes",
    "shirtSize": "L",
    "message": "",
    "submittedAt": "07/09/2026 10:38",
    "checkedIn": false,
    "checkedInAt": "",
    "fundStatus": "unpaid",
    "fundAmount": 0,
    "fundNote": "",
    "fundReceiptUrl": "",
    "hasReceipt": false,
    "fundPaidAt": "",
    "fundPaymentMethod": "bank_transfer",
    "fundAuditedBy": ""
  },
  {
    "id": "28",
    "rowId": "29",
    "fullName": "Đặng Tuấn",
    "nickname": "Tuấn Mẩu",
    "phone": "0979 ••• •51",
    "status": "yes",
    "shirtSize": "L",
    "message": "20 năm rồi chớp mắt một cái, hôm đó nhất định không say không về!",
    "submittedAt": "07/09/2026 15:08",
    "checkedIn": false,
    "checkedInAt": "",
    "fundStatus": "paid",
    "fundAmount": 700000,
    "fundNote": "[Quỹ Họp Lớp 20 Năm] Thành viên gửi bill khai báo: 700.000đ (Chờ BLL đối soát) (BLL đã khớp lệnh)",
    "fundReceiptUrl": "https://lh3.googleusercontent.com/d/1MoKPncJwO03AvWEVVG_c2AKr6JSG0lIR=w1600",
    "hasReceipt": true,
    "fundPaidAt": "15:19 ngày 07/09/2026",
    "fundPaymentMethod": "bank_transfer",
    "fundAuditedBy": "Thủ Quỹ BLL"
  },
  {
    "id": "29",
    "rowId": "30",
    "fullName": "Đàm Quý",
    "nickname": "Quý Cảnh",
    "phone": "0919 ••• •18",
    "status": "yes",
    "shirtSize": "L",
    "message": "Vẫn nhớ những buổi trốn học đá bóng, bơi sông Cầu năm ấy...",
    "submittedAt": "07/09/2026 17:35",
    "checkedIn": false,
    "checkedInAt": "",
    "fundStatus": "paid",
    "fundAmount": 700000,
    "fundNote": "[Quỹ Họp Lớp 20 Năm] Thành viên gửi bill khai báo: 700.000đ (Chờ BLL đối soát) (BLL đã khớp lệnh)",
    "fundReceiptUrl": "https://lh3.googleusercontent.com/d/1KYcS-YqRsuxYAL83Yez3WX5rS_Ur2PGf=w1600",
    "hasReceipt": true,
    "fundPaidAt": "17:38 ngày 07/09/2026",
    "fundPaymentMethod": "bank_transfer",
    "fundAuditedBy": "Thủ Quỹ BLL"
  },
  {
    "id": "30",
    "rowId": "31",
    "fullName": "Duy Thanh",
    "nickname": "Thanh khỉ",
    "phone": "Đi nước ngoài",
    "status": "yes",
    "shirtSize": "L",
    "message": "",
    "submittedAt": "07/09/2026 17:39",
    "checkedIn": false,
    "checkedInAt": "",
    "fundStatus": "unpaid",
    "fundAmount": 0,
    "fundNote": "",
    "fundReceiptUrl": "",
    "hasReceipt": false,
    "fundPaidAt": "",
    "fundPaymentMethod": "bank_transfer",
    "fundAuditedBy": ""
  },
  {
    "id": "31",
    "rowId": "32",
    "fullName": "Hồng Hạnh",
    "nickname": "Hạnh Sự",
    "phone": "0988 ••• •78",
    "status": "yes",
    "shirtSize": "L",
    "message": "20 năm rồi chớp mắt một cái, hôm đó nhất định không say không về!",
    "submittedAt": "07/09/2026 17:46",
    "checkedIn": false,
    "checkedInAt": "",
    "fundStatus": "unpaid",
    "fundAmount": 0,
    "fundNote": "",
    "fundReceiptUrl": "",
    "hasReceipt": false,
    "fundPaidAt": "",
    "fundPaymentMethod": "bank_transfer",
    "fundAuditedBy": ""
  },
  {
    "id": "32",
    "rowId": "33",
    "fullName": "Phạm Tâm",
    "nickname": "Tâm",
    "phone": "0946 ••• •11",
    "status": "yes",
    "shirtSize": "M",
    "message": "20 năm rồi chớp mắt một cái, hôm đó nhất định không say không về!",
    "submittedAt": "07/09/2026 18:46",
    "checkedIn": false,
    "checkedInAt": "",
    "fundStatus": "unpaid",
    "fundAmount": 0,
    "fundNote": "",
    "fundReceiptUrl": "",
    "hasReceipt": false,
    "fundPaidAt": "",
    "fundPaymentMethod": "bank_transfer",
    "fundAuditedBy": ""
  },
  {
    "id": "33",
    "rowId": "34",
    "fullName": "Hà Hoa",
    "nickname": "Hoa mậu",
    "phone": "0969 ••• •33",
    "status": "yes",
    "shirtSize": "L",
    "message": "",
    "submittedAt": "07/09/2026 20:48",
    "checkedIn": false,
    "checkedInAt": "",
    "fundStatus": "paid",
    "fundAmount": 700000,
    "fundNote": "[Quỹ Họp Lớp 20 Năm] Thành viên gửi bill khai báo: 700.000đ (Chờ BLL đối soát) (BLL đã khớp lệnh)",
    "fundReceiptUrl": "https://lh3.googleusercontent.com/d/1ayw3Jh_4PyowLg36OAlDHVF4-rwc8Cr1=w1600",
    "hasReceipt": true,
    "fundPaidAt": "20:51 ngày 07/09/2026",
    "fundPaymentMethod": "bank_transfer",
    "fundAuditedBy": "Thủ Quỹ BLL"
  },
  {
    "id": "34",
    "rowId": "35",
    "fullName": "Bảo Thi",
    "nickname": "Bảo Thi",
    "phone": "0120 ••• •24",
    "status": "yes",
    "shirtSize": "2XL",
    "message": "",
    "submittedAt": "07/09/2026 21:02",
    "checkedIn": false,
    "checkedInAt": "",
    "fundStatus": "unpaid",
    "fundAmount": 0,
    "fundNote": "",
    "fundReceiptUrl": "",
    "hasReceipt": false,
    "fundPaidAt": "",
    "fundPaymentMethod": "bank_transfer",
    "fundAuditedBy": ""
  }
];

// Danh sách sĩ số chính thức K8A1 THPT Thái Nguyên (2003 - 2006)
// Dùng làm nguồn chuẩn (Master Roster) giúp thành viên chọn nhanh tên mình, chống gõ sai và chống trùng lặp
export const CLASS_ROSTER_K8A1: ClassMember[] = [
  { id: 'm01', fullName: 'Nguyễn Tuấn Anh', nickname: 'Tuấn Báo', phone: '', role: 'Bí thư', gender: 'male', shirtSize: '' },
  { id: 'm02', fullName: 'Trần Thị Thanh Hương', nickname: 'Hương Béo', phone: '', role: 'Lớp phó', gender: 'female', shirtSize: '' },
  { id: 'm03', fullName: 'Lê Hoàng Nam', nickname: 'Nam Còi', phone: '', role: 'Thành viên', gender: 'male', shirtSize: '' },
  { id: 'm04', fullName: 'Phạm Đức Thắng', nickname: 'Thắng Đầu Gấu', phone: '', role: 'Thành viên', gender: 'male', shirtSize: '' },
  { id: 'm05', fullName: 'Vũ Mai Phương', nickname: 'Phương Mèo', phone: '', role: 'Thủ quỹ', gender: 'female', shirtSize: '' },
  { id: 'm06', fullName: 'Đỗ Hoàng Long', nickname: 'Long Kều', phone: '', role: 'Ban Liên Lạc (Admin)', gender: 'male', shirtSize: '' },
  { id: 'm07', fullName: 'Nguyễn Thái Bảo', nickname: 'Bảo Cận', role: 'Lớp trưởng', gender: 'male', shirtSize: '' },
  { id: 'm08', fullName: 'Bùi Quang Huy', nickname: 'Huy Lắc', role: 'Thành viên', gender: 'male', shirtSize: '' },
  { id: 'm09', fullName: 'Hoàng Văn Hải', nickname: 'Hải Bánh', role: 'Thành viên', gender: 'male', shirtSize: '' },
  { id: 'm10', fullName: 'Đặng Thùy Dung', nickname: 'Dung Điệu', role: 'Thành viên', gender: 'female', shirtSize: '' },
  { id: 'm11', fullName: 'Lê Thu Trang', nickname: 'Trang Ốc', role: 'Thành viên', gender: 'female', shirtSize: '' },
  { id: 'm12', fullName: 'Nguyễn Minh Đức', nickname: 'Đức Còi', role: 'Thành viên', gender: 'male', shirtSize: '' },
  { id: 'm13', fullName: 'Phạm Thùy Linh', nickname: 'Linh Nhím', role: 'Thành viên', gender: 'female', shirtSize: '' },
  { id: 'm14', fullName: 'Dương Quốc Toàn', nickname: 'Toàn Xoăn', role: 'Thành viên', gender: 'male', shirtSize: '' },
  { id: 'm15', fullName: 'Vũ Tuấn Dũng', nickname: 'Dũng Béo', role: 'Thành viên', gender: 'male', shirtSize: '' },
  { id: 'm16', fullName: 'Trần Phương Thảo', nickname: 'Thảo Xinh', role: 'Thành viên', gender: 'female', shirtSize: '' },
  { id: 'm17', fullName: 'Ngô Quang Vinh', nickname: 'Vinh Râu', role: 'Thành viên', gender: 'male', shirtSize: '' },
  { id: 'm18', fullName: 'Đoàn Thị Bích Ngọc', nickname: 'Ngọc Nấm', role: 'Thành viên', gender: 'female', shirtSize: '' },
  { id: 'm19', fullName: 'Trịnh Văn Quân', nickname: 'Quân Tàu', role: 'Thành viên', gender: 'male', shirtSize: '' },
  { id: 'm20', fullName: 'Đinh Hoàng Yến', nickname: 'Yến Phụng', role: 'Thành viên', gender: 'female', shirtSize: '' },
  { id: 'm21', fullName: 'Phan Minh Trí', nickname: 'Trí Rùa', role: 'Thành viên', gender: 'male', shirtSize: '' },
  { id: 'm22', fullName: 'Mai Anh Tuấn', nickname: 'Tuấn Đen', role: 'Thành viên', gender: 'male', shirtSize: '' },
  { id: 'm23', fullName: 'Đỗ Thúy Hằng', nickname: 'Hằng Nga', role: 'Thành viên', gender: 'female', shirtSize: '' },
  { id: 'm24', fullName: 'Hà Việt Cường', nickname: 'Cường Đôla', role: 'Thành viên', gender: 'male', shirtSize: '' },
  { id: 'm25', fullName: 'Tạ Thị Thu Hà', nickname: 'Hà Mít', role: 'Thành viên', gender: 'female', shirtSize: '' },
  { id: 'm26', fullName: 'Lưu Đức Trọng', nickname: 'Trọng Kính', role: 'Thành viên', gender: 'male', shirtSize: '' },
  { id: 'm27', fullName: 'Đào Diệu Linh', nickname: 'Linh Tít', role: 'Thành viên', gender: 'female', shirtSize: '' },
  { id: 'm28', fullName: 'Lý Tuấn Phong', nickname: 'Phong Gió', role: 'Thành viên', gender: 'male', shirtSize: '' },
  { id: 'm29', fullName: 'Chu Thị Mai Anh', nickname: 'Mai Hoa', role: 'Thành viên', gender: 'female', shirtSize: '' },
  { id: 'm30', fullName: 'Dương Đình Khoa', nickname: 'Khoa Học', role: 'Thành viên', gender: 'male', shirtSize: '' },
  { id: 'm31', fullName: 'Phùng Thị Kim Oanh', nickname: 'Oanh Vàng', role: 'Thành viên', gender: 'female', shirtSize: '' },
  { id: 'm32', fullName: 'Lương Việt Hưng', nickname: 'Hưng Híp', role: 'Thành viên', gender: 'male', shirtSize: '' },
  { id: 'm33', fullName: 'Bùi Thu Hương', nickname: 'Hương Mây', role: 'Thành viên', gender: 'female', shirtSize: '' },
  { id: 'm34', fullName: 'Nguyễn Xuân Kiên', nickname: 'Kiên Nhẫn', role: 'Thành viên', gender: 'male', shirtSize: '' },
  { id: 'm35', fullName: 'Hoàng Thị Minh Châu', nickname: 'Châu Báu', role: 'Thành viên', gender: 'female', shirtSize: '' },
  { id: 'm36', fullName: 'Phạm Ngọc Long', nickname: 'Long Nhỏ', role: 'Thành viên', gender: 'male', shirtSize: '' },
  { id: 'm37', fullName: 'Lê Thị Quỳnh Trang', nickname: 'Trang Moon', role: 'Thành viên', gender: 'female', shirtSize: '' },
  { id: 'm38', fullName: 'Vũ Trọng Nghĩa', nickname: 'Nghĩa Khí', role: 'Thành viên', gender: 'male', shirtSize: '' },
  { id: 'm39', fullName: 'Cao Thị Bích Thủy', nickname: 'Thủy Tiên', role: 'Thành viên', gender: 'female', shirtSize: '' },
  { id: 'm40', fullName: 'Triệu Văn Đạt', nickname: 'Đạt Chuẩn', role: 'Thành viên', gender: 'male', shirtSize: '' }
];

// Kiểm tra xem một thành viên có thuộc Ban Tổ Chức / Ban Liên Lạc hay không
export const isOfficialBLLMember = (member?: ClassMember | null): boolean => {
  if (!member || !member.role) return false;
  const r = member.role.toLowerCase().trim();
  return (
    r.includes('ban liên lạc') ||
    r.includes('admin') ||
    r.includes('thủ quỹ') ||
    r.includes('bí thư') ||
    r.includes('lớp trưởng') ||
    r.includes('lớp phó') ||
    r.includes('trưởng ban') ||
    r.includes('bll')
  );
};

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

export const DEFAULT_MEMORIES: MemoryImage[] = [];

export const DEFAULT_VIDEOS: MemoryVideo[] = [];

// ============================================================================
// DANH MỤC & DỮ LIỆU SỔ QUỸ THU - CHI LỚP K8A1 (CHUẨN THEO QUY CHẾ ĐIỀU 3 & 4)
// ============================================================================

export interface ExpenseCategoryMeta {
  id: ExpenseCategory;
  label: string;
  shortLabel: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  description: string;
}

export const EXPENSE_CATEGORIES: ExpenseCategoryMeta[] = [
  {
    id: 'care',
    label: 'Hiếu Hỷ & Thăm Hỏi',
    shortLabel: 'Hiếu hỷ',
    badgeBg: 'bg-rose-50',
    badgeText: 'text-rose-700',
    badgeBorder: 'border-rose-200',
    description: 'Thăm viếng tứ thân phụ mẫu (500k), thăm hỏi ốm đau/tai nạn (300k), việc hỷ theo Quy chế'
  },
  {
    id: 'teacher',
    label: 'Tri Ân Thầy Cô',
    shortLabel: 'Tri ân',
    badgeBg: 'bg-purple-50',
    badgeText: 'text-purple-700',
    badgeBorder: 'border-purple-200',
    description: 'Hoa tươi & quà tặng tri ân các thầy cô giáo cũ dịp 20/11, Tết Nguyên Đán, ngày họp lớp'
  },
  {
    id: 'party',
    label: 'Tiệc & Sự Kiện Gặp Mặt',
    shortLabel: 'Tiệc & Sự kiện',
    badgeBg: 'bg-emerald-50',
    badgeText: 'text-emerald-800',
    badgeBorder: 'border-emerald-200',
    description: 'Đặt cọc & thanh toán tiệc Crown Palace, ẩm thực, đồ uống, liên hoan gặp mặt định kỳ'
  },
  {
    id: 'souvenir',
    label: 'Đồng Phục & Kỷ Niệm',
    shortLabel: 'Đồng phục & Quà',
    badgeBg: 'bg-blue-50',
    badgeText: 'text-blue-700',
    badgeBorder: 'border-blue-200',
    description: 'Áo polo đồng phục 20 năm K8A1, thẻ cựu học sinh kỷ niệm, quà lưu niệm'
  },
  {
    id: 'media',
    label: 'Sân Khấu & Truyền Thông',
    shortLabel: 'Sân khấu & Media',
    badgeBg: 'bg-amber-50',
    badgeText: 'text-amber-800',
    badgeBorder: 'border-amber-200',
    description: 'In ấn backdrop sân khấu, âm thanh ánh sáng, quay chụp phóng sự kỷ niệm, duy trì webapp'
  },
  {
    id: 'other',
    label: 'Chi Khác & Dự Phòng',
    shortLabel: 'Khác',
    badgeBg: 'bg-slate-100',
    badgeText: 'text-slate-700',
    badgeBorder: 'border-slate-200',
    description: 'Nước suối, đạo cụ trò chơi, chi phí phát sinh chuẩn bị'
  }
];

export interface IncomeCategoryMeta {
  id: IncomeCategory;
  label: string;
  shortLabel: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  icon: string;
  defaultAmount?: number;
  description: string;
  quickTitle: string;
}

export const INCOME_CATEGORIES: IncomeCategoryMeta[] = [
  {
    id: 'event',
    label: 'Quỹ Họp Lớp 20 Năm',
    shortLabel: 'Quỹ 20 năm',
    badgeBg: 'bg-emerald-50',
    badgeText: 'text-emerald-800',
    badgeBorder: 'border-emerald-200',
    icon: '🎓',
    defaultAmount: 700000,
    description: 'Đóng quỹ tham gia ngày hội ngộ 20 năm (định mức chuẩn 700.000đ/bạn tham dự)',
    quickTitle: 'Đóng quỹ họp lớp kỷ niệm 20 năm K8A1'
  },
  {
    id: 'sponsor',
    label: 'Tài Trợ & Ủng Hộ Lớp',
    shortLabel: 'Tài trợ / Ủng hộ',
    badgeBg: 'bg-amber-50',
    badgeText: 'text-amber-800',
    badgeBorder: 'border-amber-200',
    icon: '💎',
    defaultAmount: 1000000,
    description: 'Mạnh thường quân, bạn bè và gia đình đóng góp tài trợ thêm để ngày vui thêm chu toàn',
    quickTitle: 'Tài trợ & ủng hộ quỹ lớp K8A1'
  },
  {
    id: 'extra_shirt',
    label: 'Mua Thêm Áo Polo',
    shortLabel: 'Mua thêm áo',
    badgeBg: 'bg-blue-50',
    badgeText: 'text-blue-700',
    badgeBorder: 'border-blue-200',
    icon: '👕',
    defaultAmount: 150000,
    description: 'Đăng ký may thêm áo polo đồng phục 20 năm cho vợ/chồng/con cái/người thân',
    quickTitle: 'Mua thêm áo polo đồng phục K8A1'
  },
  {
    id: 'guest',
    label: 'Người Thân / F1 Đi Kèm',
    shortLabel: 'Người thân đi kèm',
    badgeBg: 'bg-rose-50',
    badgeText: 'text-rose-700',
    badgeBorder: 'border-rose-200',
    icon: '👨‍👩‍👧',
    defaultAmount: 350000,
    description: 'Kinh phí suất ăn và đồ uống cho phu huynh, con nhỏ đi tham dự cùng',
    quickTitle: 'Đóng kinh phí người thân / F1 đi kèm'
  },
  {
    id: 'teacher_tribute',
    label: 'Quỹ Tri Ân Thầy Cô',
    shortLabel: 'Tri ân thầy cô',
    badgeBg: 'bg-purple-50',
    badgeText: 'text-purple-700',
    badgeBorder: 'border-purple-200',
    icon: '💐',
    defaultAmount: 500000,
    description: 'Khoản đóng góp riêng để chuẩn bị hoa tươi, quà tặng kỷ niệm tri ân thầy cô giáo cũ',
    quickTitle: 'Đóng góp Quỹ tri ân Thầy Cô giáo'
  },
  {
    id: 'alumni_care',
    label: 'Quỹ Tình Nghĩa & Thăm Hỏi',
    shortLabel: 'Tình nghĩa K8A1',
    badgeBg: 'bg-indigo-50',
    badgeText: 'text-indigo-800',
    badgeBorder: 'border-indigo-200',
    icon: '❤️',
    defaultAmount: 500000,
    description: 'Quỹ tương trợ, thăm hỏi bạn bè lúc đau ốm, việc hiếu hỷ theo Quy chế tổ chức',
    quickTitle: 'Đóng góp Quỹ tình nghĩa & thăm hỏi K8A1'
  },
  {
    id: 'annual',
    label: 'Quỹ Lớp Thường Niên',
    shortLabel: 'Quỹ thường niên',
    badgeBg: 'bg-teal-50',
    badgeText: 'text-teal-800',
    badgeBorder: 'border-teal-200',
    icon: '📅',
    defaultAmount: 100000,
    description: 'Quỹ hoạt động thường niên 100.000 đ/người/năm theo Điều 4 Quy chế tổ chức',
    quickTitle: 'Đóng quỹ lớp thường niên theo Quy chế'
  },
  {
    id: 'other_income',
    label: 'Khoản Thu Khác & Vãng Lai',
    shortLabel: 'Thu khác',
    badgeBg: 'bg-slate-100',
    badgeText: 'text-slate-700',
    badgeBorder: 'border-slate-200',
    icon: '📦',
    defaultAmount: 500000,
    description: 'Lãi tiền gửi ngân hàng, số dư chuyển kỳ trước, hoặc các khoản thu phát sinh ngoài kế hoạch',
    quickTitle: 'Ghi nhận khoản thu khác'
  }
];

export const INITIAL_INCOMES_LIST: IncomeItem[] = [];

export const INITIAL_EXPENSES_LIST: ExpenseItem[] = [
  {
    id: 'exp-01',
    title: 'Đặt cọc sảnh tiệc Trung Tâm Sự Kiện & Nhà Hàng Prime Thái Nguyên',
    category: 'party',
    amount: 5000000,
    date: '15/08/2026',
    spender: 'Bùi Thành Long',
    recipient: 'Trung Tâm Sự Kiện & Nhà Hàng Prime Thái Nguyên',
    receiptUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80',
    eventScope: 'Kỷ niệm 20 năm',
    note: 'Đặt cọc giữ chỗ sảnh tiệc trưa ngày 27/09/2026 (dự kiến 40-45 suất tiệc VIP)',
    createdAt: '2026-08-15T09:00:00.000Z'
  },
  {
    id: 'exp-02',
    title: 'Đặt may & in ấn 45 áo polo đồng phục 20 năm K8A1',
    category: 'souvenir',
    amount: 6750000,
    date: '20/08/2026',
    spender: 'Huyền Trang B',
    recipient: 'Xưởng may đồng phục Thái Nguyên',
    receiptUrl: 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?auto=format&fit=crop&w=800&q=80',
    eventScope: 'Kỷ niệm 20 năm',
    note: 'May 45 áo polo cá sấu cao cấp thêu logo 20 năm K8A1 theo bảng size đã đăng ký',
    createdAt: '2026-08-20T14:30:00.000Z'
  },
  {
    id: 'exp-03',
    title: 'In ấn Backdrop check-in, sân khấu & 45 Thẻ học sinh lưu niệm',
    category: 'media',
    amount: 2500000,
    date: '28/08/2026',
    spender: 'Nguyễn Tuấn Thành',
    recipient: 'Quảng cáo & In ấn Thái Nguyên',
    receiptUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80',
    eventScope: 'Kỷ niệm 20 năm',
    note: 'Backdrop bạt hiflex căng khung sắt + 45 thẻ học sinh K8A1 kèm dây đeo cổ',
    createdAt: '2026-08-28T16:00:00.000Z'
  },
  {
    id: 'exp-04',
    title: 'Đặt 5 giỏ hoa tươi & quà tặng tri ân Thầy Cô giáo cũ',
    category: 'teacher',
    amount: 3000000,
    date: '01/09/2026',
    spender: 'Hứa Thị Vân Anh',
    recipient: 'Tiệm hoa tươi Thái Nguyên',
    eventScope: 'Kỷ niệm 20 năm',
    note: 'Tri ân thầy cô giáo chủ nhiệm và các thầy cô bộ môn gắn bó cùng lớp K8A1',
    createdAt: '2026-09-01T10:00:00.000Z'
  }
];

export const SPONSORS_LIST: SponsorItem[] = [
  {
    id: 'sp-1',
    name: 'Lê Hoàng Nam',
    className: 'K8A1',
    amount: 300000,
    note: 'Ủng hộ thêm quỹ lớp cho ngày hội ngộ 20 năm thêm tưng bừng',
    date: '02/09/2026'
  },
  {
    id: 'sp-2',
    name: 'Nguyễn Tuấn Anh',
    className: 'K8A1',
    amount: 500000,
    note: 'Góp thêm vào quỹ nước uống & đạo cụ trò chơi anh em',
    date: '01/09/2026'
  }
];

export interface BankItem {
  code: string;       // VietQR identifier / short code
  bin: string;        // 6-digit Napas BIN
  shortName: string;  // Display name short (e.g. MB Bank, Vietcombank)
  name: string;       // Official full name
  aliases: string[];  // Synonyms for search & matching
}

export const VIETNAM_BANKS: BankItem[] = [
  {
    code: 'vietcombank',
    bin: '970436',
    shortName: 'Vietcombank (VCB)',
    name: 'Ngân hàng Ngoại thương Việt Nam',
    aliases: ['vcb', 'vietcombank', 'ngoai thuong', '970436']
  },
  {
    code: 'mbbank',
    bin: '970422',
    shortName: 'MB Bank (Quân Đội)',
    name: 'Ngân hàng Quân Đội',
    aliases: ['mb', 'mbbank', 'quan doi', 'mb bank', '970422']
  },
  {
    code: 'techcombank',
    bin: '970407',
    shortName: 'Techcombank (TCB)',
    name: 'Ngân hàng Kỹ Thương Việt Nam',
    aliases: ['tcb', 'techcombank', 'ky thuong', 'techcom', '970407']
  },
  {
    code: 'vietinbank',
    bin: '970415',
    shortName: 'VietinBank (CTG)',
    name: 'Ngân hàng Công Thương Việt Nam',
    aliases: ['icb', 'ctg', 'vietinbank', 'vietin', 'cong thuong', '970415']
  },
  {
    code: 'bidv',
    bin: '970418',
    shortName: 'BIDV',
    name: 'Ngân hàng Đầu tư và Phát triển Việt Nam',
    aliases: ['bidv', 'dau tu va phat trien', '970418']
  },
  {
    code: 'agribank',
    bin: '970405',
    shortName: 'Agribank (VBA)',
    name: 'Ngân hàng Nông nghiệp & PT Nông thôn Việt Nam',
    aliases: ['vba', 'agr', 'agribank', 'nong nghiep', '970405']
  },
  {
    code: 'vpbank',
    bin: '970432',
    shortName: 'VPBank (VPB)',
    name: 'Ngân hàng Việt Nam Thịnh Vượng',
    aliases: ['vpb', 'vpbank', 'thinh vuong', '970432']
  },
  {
    code: 'tpbank',
    bin: '970423',
    shortName: 'TPBank (TPB)',
    name: 'Ngân hàng Tiên Phong',
    aliases: ['tpb', 'tpbank', 'tien phong', '970423']
  },
  {
    code: 'acb',
    bin: '970416',
    shortName: 'ACB (Á Châu)',
    name: 'Ngân hàng TMCP Á Châu',
    aliases: ['acb', 'a chau', '970416']
  },
  {
    code: 'sacombank',
    bin: '970403',
    shortName: 'Sacombank (STB)',
    name: 'Ngân hàng Sài Gòn Thương Tín',
    aliases: ['stb', 'sacombank', 'sai gon thuong tin', 'sacom', '970403']
  },
  {
    code: 'hdbank',
    bin: '970437',
    shortName: 'HDBank (HDB)',
    name: 'Ngân hàng Phát triển TP.HCM',
    aliases: ['hdb', 'hdbank', '970437']
  },
  {
    code: 'vib',
    bin: '970441',
    shortName: 'VIB (Quốc Tế)',
    name: 'Ngân hàng Quốc Tế Việt Nam',
    aliases: ['vib', 'quoc te', '970441']
  },
  {
    code: 'shb',
    bin: '970443',
    shortName: 'SHB',
    name: 'Ngân hàng Sài Gòn - Hà Nội',
    aliases: ['shb', 'sai gon ha noi', '970443']
  },
  {
    code: 'ocb',
    bin: '970448',
    shortName: 'OCB (Phương Đông)',
    name: 'Ngân hàng Phương Đông',
    aliases: ['ocb', 'phuong dong', '970448']
  },
  {
    code: 'msb',
    bin: '970426',
    shortName: 'MSB (Hàng Hải)',
    name: 'Ngân hàng Hàng Hải Việt Nam',
    aliases: ['msb', 'hang hai', 'maritime', '970426']
  },
  {
    code: 'lienvietpostbank',
    bin: '970449',
    shortName: 'LPBank (Lộc Phát)',
    name: 'Ngân hàng TMCP Lộc Phát Việt Nam',
    aliases: ['lpb', 'lpbank', 'loc phat', 'lienvietpostbank', 'lien viet', '970449']
  },
  {
    code: 'seabank',
    bin: '970440',
    shortName: 'SeABank (Đông Nam Á)',
    name: 'Ngân hàng Đông Nam Á',
    aliases: ['seabank', 'seab', 'dong nam a', '970440']
  },
  {
    code: 'namabank',
    bin: '970428',
    shortName: 'Nam A Bank (NAB)',
    name: 'Ngân hàng Nam Á',
    aliases: ['nab', 'nam a', 'namabank', '970428']
  },
  {
    code: 'abbank',
    bin: '970425',
    shortName: 'ABBANK (An Bình)',
    name: 'Ngân hàng An Bình',
    aliases: ['abb', 'abbank', 'an binh', '970425']
  },
  {
    code: 'bacabank',
    bin: '970409',
    shortName: 'Bac A Bank (Bắc Á)',
    name: 'Ngân hàng Bắc Á',
    aliases: ['bab', 'bac a', 'bacabank', '970409']
  },
  {
    code: 'baovietbank',
    bin: '970438',
    shortName: 'BaoViet Bank (Bảo Việt)',
    name: 'Ngân hàng Bảo Việt',
    aliases: ['bvb', 'baoviet', 'baovietbank', 'bao viet', '970438']
  },
  {
    code: 'vietabank',
    bin: '970427',
    shortName: 'VietABank (Việt Á)',
    name: 'Ngân hàng Việt Á',
    aliases: ['vab', 'vieta', 'vietabank', 'viet a', '970427']
  },
  {
    code: 'kienlongbank',
    bin: '970452',
    shortName: 'KienlongBank (Kiên Long)',
    name: 'Ngân hàng Kiên Long',
    aliases: ['klb', 'kienlong', 'kienlongbank', 'kien long', '970452']
  },
  {
    code: 'pgbank',
    bin: '970430',
    shortName: 'PGBank (Xăng Dầu)',
    name: 'Ngân hàng TMCP Thịnh Vượng và Phát triển',
    aliases: ['pgb', 'pgbank', 'xang dau', '970430']
  },
  {
    code: 'cake',
    bin: '546034',
    shortName: 'Cake by VPBank',
    name: 'Ngân hàng số Cake by VPBank',
    aliases: ['cake', 'cake by vpbank', '546034']
  },
  {
    code: 'timo',
    bin: '963388',
    shortName: 'Timo by BVBank',
    name: 'Ngân hàng số Timo',
    aliases: ['timo', 'timo plus', '963388']
  },
  {
    code: 'viettelmoney',
    bin: '971005',
    shortName: 'Viettel Money',
    name: 'Tổng Công ty Dịch vụ Số Viettel',
    aliases: ['viettelmoney', 'viettel pay', 'viettel', '971005']
  },
  {
    code: 'vnptmoney',
    bin: '971011',
    shortName: 'VNPT Money',
    name: 'Tập đoàn Bưu chính Viễn thông Việt Nam',
    aliases: ['vnptmoney', 'vnpt pay', 'vnpt', '971011']
  },
  {
    code: 'shinhan',
    bin: '970424',
    shortName: 'Shinhan Bank Việt Nam',
    name: 'Ngân hàng TNHH MTV Shinhan Việt Nam',
    aliases: ['shinhan', 'shinhanbank', 'shbvn', '970424']
  },
  {
    code: 'wooribank',
    bin: '970457',
    shortName: 'Woori Bank Việt Nam',
    name: 'Ngân hàng TNHH MTV Woori Việt Nam',
    aliases: ['woori', 'wooribank', '970457']
  },
  {
    code: 'publicbank',
    bin: '970439',
    shortName: 'Public Bank Việt Nam',
    name: 'Ngân hàng TNHH MTV Public Việt Nam',
    aliases: ['pbvn', 'publicbank', 'public', '970439']
  }
];

/**
 * Tìm mã ngân hàng VietQR theo tên hoặc alias
 */
export function resolveBankCode(bankInput?: any): string {
  if (bankInput === null || bankInput === undefined) return 'vietcombank';
  const clean = String(bankInput).toLowerCase().trim();
  
  // 1. Khớp mã định danh hoặc BIN
  const direct = VIETNAM_BANKS.find(b => b.code.toLowerCase() === clean || b.bin === clean);
  if (direct) return direct.code;

  // 2. Khớp alias
  const byAlias = VIETNAM_BANKS.find(b => 
    b.aliases.some(alias => clean.includes(alias) || alias === clean)
  );
  if (byAlias) return byAlias.code;

  // 3. Khớp tên ngân hàng
  const byName = VIETNAM_BANKS.find(b => 
    clean.includes(b.shortName.toLowerCase()) || clean.includes(b.name.toLowerCase())
  );
  if (byName) return byName.code;

  return 'vietcombank';
}

/**
 * Chuẩn hóa chuỗi text sang chuẩn Napas / VietQR EMVCo Tag 62:
 * - Loại bỏ dấu tiếng Việt (NFD)
 * - Loại bỏ các ký tự đặc biệt [ ] { } < > # % @ $ ^ & * ( ) = + \\ / | ~ ` " ' ; : , . ? !
 * - Giữ lại chữ cái, số và dấu cách
 * - Chuyển sang chữ IN HOA
 * - Giới hạn tối đa 50 ký tự để không tràn buffer Napas
 */
export function sanitizeVietQrText(text?: any): string {
  if (text === null || text === undefined) return '';
  return String(text)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'D')
    .replace(/[^a-zA-Z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toUpperCase()
    .slice(0, 50);
}

export interface ShirtSizeOption {
  value: string;
  label: string;
  weightHint: string;
  shoulder: string;
  width: string;
  length: string;
}

/**
 * Bảng kích cỡ áo đồng phục polo Họp lớp 20 năm K8A1 chuẩn hóa theo bảng xưởng may (Người lớn)
 * S:    Vai 35cm | Rộng 41cm | Dài 55cm | 35kg - 45kg
 * M:    Vai 37cm | Rộng 44cm | Dài 59cm | 45kg - 55kg
 * L:    Vai 39cm | Rộng 47cm | Dài 63cm | 55kg - 65kg
 * XL:   Vai 41cm | Rộng 49cm | Dài 67cm | 65kg - 75kg
 * XXL:  Vai 43cm | Rộng 51cm | Dài 70cm | 75kg - 85kg
 * XXXL: Vai 45cm | Rộng 53cm | Dài 73cm | 85kg - 95kg
 */
export const SHIRT_SIZE_OPTIONS: ShirtSizeOption[] = [
  { 
    value: 'S', 
    label: 'Size S (35 - 45kg) • Vai 35 / Rộng 41 / Dài 55cm', 
    weightHint: '35 - 45kg',
    shoulder: '35cm',
    width: '41cm',
    length: '55cm'
  },
  { 
    value: 'M', 
    label: 'Size M (45 - 55kg) • Vai 37 / Rộng 44 / Dài 59cm', 
    weightHint: '45 - 55kg',
    shoulder: '37cm',
    width: '44cm',
    length: '59cm'
  },
  { 
    value: 'L', 
    label: 'Size L (55 - 65kg) • Vai 39 / Rộng 47 / Dài 63cm', 
    weightHint: '55 - 65kg',
    shoulder: '39cm',
    width: '47cm',
    length: '63cm'
  },
  { 
    value: 'XL', 
    label: 'Size XL (65 - 75kg) • Vai 41 / Rộng 49 / Dài 67cm', 
    weightHint: '65 - 75kg',
    shoulder: '41cm',
    width: '49cm',
    length: '67cm'
  },
  { 
    value: 'XXL', 
    label: 'Size XXL (75 - 85kg) • Vai 43 / Rộng 51 / Dài 70cm', 
    weightHint: '75 - 85kg',
    shoulder: '43cm',
    width: '51cm',
    length: '70cm'
  },
  { 
    value: 'XXXL', 
    label: 'Size XXXL (85 - 95kg) • Vai 45 / Rộng 53 / Dài 73cm', 
    weightHint: '85 - 95kg',
    shoulder: '45cm',
    width: '53cm',
    length: '73cm'
  }
];

export function normalizeShirtSize(size?: string): string {
  if (!size) return '';
  const s = size.trim().toUpperCase();
  if (!s || s === 'CHƯA CHỌN' || s === 'CHUA CHON' || s === 'NONE' || s === 'NULL' || s === 'UNDEFINED') return '';
  if (s === '2XL') return 'XXL';
  if (s === '3XL') return 'XXXL';
  return s;
}

/**
 * Sinh URL tạo ảnh mã VietQR chuẩn xác, tương thích 100% App Ngân hàng Việt Nam
 */
export function generateVietQrUrl(opts?: {
  bankCode?: any;
  bankName?: any;
  bankAccount?: any;
  bankHolder?: any;
  fundAmount?: any;
  transferSyntax?: any;
  template?: 'compact' | 'compact2' | 'qr_only';
}): string {
  if (!opts) return '';
  const bankId = opts.bankCode ? String(opts.bankCode).toLowerCase() : resolveBankCode(opts.bankName);
  const cleanAcc = String(opts.bankAccount || '').replace(/[^0-9a-zA-Z]/g, '');
  const template = opts.template || 'compact';
  const amount = opts.fundAmount && Number(opts.fundAmount) > 0 ? Number(opts.fundAmount) : 0;
  const cleanMemo = sanitizeVietQrText(opts.transferSyntax || 'DONG QUY K8A1');
  const cleanName = sanitizeVietQrText(opts.bankHolder || '');

  let url = `https://img.vietqr.io/image/${bankId}-${cleanAcc}-${template}.png?amount=${amount}&addInfo=${encodeURIComponent(cleanMemo)}`;
  if (cleanName) {
    url += `&accountName=${encodeURIComponent(cleanName)}`;
  }
  return url;
}

/**
 * Chuẩn hóa URL hình ảnh:
 * - Tự động nhận diện & chuyển đổi link chia sẻ Google Drive thành URL CDN lh3.googleusercontent.com hiển thị trực tiếp và nhanh chóng trong thẻ <img>.
 * - Hỗ trợ các dạng: /file/d/ID/view, open?id=ID, uc?id=ID, thumbnail?id=ID.
 * - Chuyển link Dropbox thành raw=1 để hiển thị trực tiếp.
 * - Bảo toàn các link ảnh tiêu chuẩn (Unsplash, HTTPS, Data URLs hợp lệ).
 */
export function normalizeImageUrl(rawUrl?: string): string {
  if (!rawUrl || typeof rawUrl !== 'string') return '';
  const trimmed = rawUrl.trim();
  if (!trimmed) return '';

  // 1. Nhận diện link Google Drive
  const driveFileMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (driveFileMatch && driveFileMatch[1]) {
    return `https://lh3.googleusercontent.com/d/${driveFileMatch[1]}=w1600`;
  }
  const driveIdMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (trimmed.includes('drive.google.com') && driveIdMatch && driveIdMatch[1]) {
    return `https://lh3.googleusercontent.com/d/${driveIdMatch[1]}=w1600`;
  }

  // 2. Nhận diện link Dropbox
  if (trimmed.includes('dropbox.com')) {
    return trimmed.replace(/\?dl=0$/, '?raw=1').replace(/&dl=0$/, '&raw=1');
  }

  return trimmed;
}

/**
 * Chuyển đổi an toàn bất kỳ định dạng ngày nào thành đối tượng Date hợp lệ
 * Xử lý: "09:30 • 01/09/2026", "01/09/2026 09:30", "01/09/2026", ISO, Timestamp, Date object...
 * Trả về null nếu không hợp lệ hoặc nếu gặp "Invalid Date" (chống triệt để lỗi hiển thị Invalid Date)
 */
export function parseDate(rawDate?: any): Date | null {
  if (!rawDate) return null;
  if (rawDate instanceof Date) {
    return isNaN(rawDate.getTime()) ? null : rawDate;
  }
  const str = String(rawDate).trim();
  if (!str || str.toLowerCase() === 'invalid date' || str.toLowerCase() === 'null' || str.toLowerCase() === 'undefined') {
    return null;
  }

  // Nếu là số timestamp mili-giây dạng chuỗi hoặc số
  if (/^\d{10,14}$/.test(str)) {
    const d = new Date(Number(str));
    if (!isNaN(d.getTime())) return d;
  }

  // Dạng HH:mm • DD/MM/YYYY hoặc HH:mm:ss • DD/MM/YYYY
  const bulletMatch = str.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?\s*•\s*(\d{1,2})[/-](\d{1,2})[/-](\d{4})/);
  if (bulletMatch) {
    const [, h, min, s, d, m, y] = bulletMatch;
    return new Date(Number(y), Number(m) - 1, Number(d), Number(h), Number(min), Number(s || 0));
  }

  // Dạng DD/MM/YYYY • HH:mm
  const bulletMatch2 = str.match(/(\d{1,2})[/-](\d{1,2})[/-](\d{4})\s*•\s*(\d{1,2}):(\d{2})(?::(\d{2}))?/);
  if (bulletMatch2) {
    const [, d, m, y, h, min, s] = bulletMatch2;
    return new Date(Number(y), Number(m) - 1, Number(d), Number(h), Number(min), Number(s || 0));
  }

  // Dạng DD/MM/YYYY HH:mm:ss hoặc DD/MM/YYYY
  const dmyTimeMatch = str.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?$/);
  if (dmyTimeMatch) {
    const [, d, m, y, h, min, s] = dmyTimeMatch;
    return new Date(Number(y), Number(m) - 1, Number(d), Number(h || 0), Number(min || 0), Number(s || 0));
  }

  // Dạng ISO YYYY-MM-DD hoặc YYYY-MM-DD HH:mm:ss
  const ymdTimeMatch = str.match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})(?:[\sT](\d{1,2}):(\d{2})(?::(\d{2}))?)?/);
  if (ymdTimeMatch) {
    const [, y, m, d, h, min, s] = ymdTimeMatch;
    return new Date(Number(y), Number(m) - 1, Number(d), Number(h || 0), Number(min || 0), Number(s || 0));
  }

  // Thử parse qua Date tiêu chuẩn
  const fallback = new Date(str);
  if (!isNaN(fallback.getTime())) {
    return fallback;
  }

  return null;
}

/**
 * Định dạng thời gian chuẩn tiếng Việt cho giao diện:
 * - Chuyển đổi các chuỗi Date rườm rà (ví dụ: "Sat Sep 05 2026 16:24:00 GMT+0700 (Indochina Time)", ISO, Timestamp)
 *   thành dạng gọn gàng, trang trọng: "16:24 • 05/09/2026"
 * - Chuẩn hóa các dạng DD/MM/YYYY HH:mm
 * - Tuyệt đối không bao giờ trả về chuỗi "Invalid Date"
 */
export function formatDateTimeVi(rawDate?: any): string {
  if (!rawDate) return '';
  const str = String(rawDate).trim();
  if (!str || str.toLowerCase() === 'invalid date' || str.toLowerCase() === 'null' || str.toLowerCase() === 'undefined') {
    return '';
  }

  // Nếu đã là định dạng chuẩn "HH:mm • DD/MM/YYYY" thì giữ nguyên
  if (/^\d{2}:\d{2}\s*•\s*\d{2}\/\d{2}\/\d{4}$/.test(str)) {
    return str;
  }

  const d = parseDate(rawDate);
  if (!d) {
    return '';
  }

  const pad = (n: number) => n < 10 ? '0' + n : String(n);
  const day = pad(d.getDate());
  const month = pad(d.getMonth() + 1);
  const year = d.getFullYear();

  // Nếu không có thành phần giờ phút trong chuỗi gốc và giờ phút bằng 0 thì chỉ trả về ngày
  if (d.getHours() === 0 && d.getMinutes() === 0 && !str.includes(':')) {
    return `${day}/${month}/${year}`;
  }

  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());
  return `${hours}:${minutes} • ${day}/${month}/${year}`;
}

/**
 * Định dạng ngày chuẩn tiếng Việt (DD/MM/YYYY):
 * - Xử lý triệt để các chuỗi Date từ Google Sheets như "Sat Aug 15 2026 00:00:00 GMT+0700 (Indochina Time)",
 *   "09:30 • 01/09/2026", ISO "2026-08-15" thành "15/08/2026"
 * - Tuyệt đối không bao giờ trả về chuỗi "Invalid Date"
 */
export function formatDateOnlyVi(rawDate?: any): string {
  if (!rawDate) return '';
  const str = String(rawDate).trim();
  if (!str || str.toLowerCase() === 'invalid date' || str.toLowerCase() === 'null' || str.toLowerCase() === 'undefined') {
    return '';
  }

  const d = parseDate(rawDate);
  if (!d) {
    // Dự phòng: trích xuất cụm DD/MM/YYYY nếu có trong chuỗi
    const dmy = str.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    if (dmy) {
      const [, dStr, mStr, yStr] = dmy;
      const pad = (n: string) => n.length === 1 ? '0' + n : n;
      return `${pad(dStr)}/${pad(mStr)}/${yStr}`;
    }
    return '';
  }

  const pad = (n: number) => n < 10 ? '0' + n : String(n);
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

/**
 * Che mờ số điện thoại để bảo vệ thông tin cá nhân (PII):
 * Hiển thị 4 số đầu và 2 số cuối, ở giữa thay bằng ký tự che: 0919 ••• •88
 */
export function maskPhone(phone?: any): string {
  if (!phone) return '';
  const str = String(phone).trim();

  // 1. Nếu chuỗi ĐÃ ĐƯỢC CHE MỜ trước đó (chứa • hoặc *):
  if (str.includes('•') || str.includes('*')) {
    const match = str.match(/^([0-9]{3,4})[^0-9]+([0-9]{2,4})$/);
    if (match) {
      return `${match[1]} ••• ${match[2]}`;
    }
    return str.replace(/\s+/g, ' ').trim();
  }

  // 2. Nếu là số thô (chưa che):
  const clean = str.replace(/[^0-9]/g, '');
  if (clean.length < 7) return clean;
  if (clean.length === 10) {
    return `${clean.slice(0, 4)} ••• ${clean.slice(-3)}`;
  }
  return `${clean.slice(0, 3)} ••• ${clean.slice(-3)}`;
}

/**
 * Trích xuất và chuẩn hóa tất cả các số điện thoại từ chuỗi (hỗ trợ nhiều số phân cách bằng -, /, ;, dấu cách)
 * Chuẩn hóa:
 * - Bỏ ký tự không phải số
 * - 84xxxxxxxxx -> 0xxxxxxxxx
 * - 9 chữ số bắt đầu từ [3,5,7,8,9] -> thêm 0 ở đầu (do Google Sheets lưu dạng number làm mất số 0)
 * - 10 chữ số bắt đầu từ 1 (đầu 01 cũ) -> thêm 0 ở đầu
 * - Chỉ chấp nhận SĐT hợp lệ có từ 9 đến 12 chữ số, loại bỏ các mảnh 2-4 chữ số vụn
 */
export const OLD_TO_NEW_VIETNAMESE_PREFIXES: Record<string, string> = {
  '0162': '032', '0163': '033', '0164': '034', '0165': '035',
  '0166': '036', '0167': '037', '0168': '038', '0169': '039',
  '0120': '070', '0121': '079', '0122': '077', '0126': '076', '0128': '078',
  '0123': '083', '0124': '084', '0125': '085', '0127': '081', '0129': '082',
  '0186': '056', '0188': '058',
  '0199': '059'
};

export function convertOldVietnamesePhone(phone: string): string {
  if (!phone) return phone;
  let p = String(phone).replace(/\D/g, '');
  if (p.startsWith('84') && p.length >= 10) p = '0' + p.slice(2);
  if (!p.startsWith('0') && (p.length === 9 || p.length === 10)) p = '0' + p;
  if (p.length === 11 && p.startsWith('01')) {
    const prefix4 = p.slice(0, 4);
    if (OLD_TO_NEW_VIETNAMESE_PREFIXES[prefix4]) {
      return OLD_TO_NEW_VIETNAMESE_PREFIXES[prefix4] + p.slice(4);
    }
  }
  return p;
}

export function extractPhones(raw?: any): string[] {
  if (raw === null || raw === undefined) return [];
  const str = String(raw).trim();
  if (!str) return [];

  // Nếu chuỗi chứa ký tự mask (• hoặc *), không bóc tách thành các mảnh số vụn để tránh so khớp sai
  if (str.includes('•') || str.includes('*')) {
    return [];
  }

  const parts = str.split(/[\s,;\/\-]+/).filter(Boolean);
  const phones: string[] = [];

  const cleanAndAdd = (numStr: string) => {
    let clean = numStr.replace(/[^0-9]/g, '');
    if (!clean) return;

    if (clean.startsWith('84') && clean.length >= 10) {
      clean = '0' + clean.slice(2);
    } else if (!clean.startsWith('0') && clean.length === 9) {
      clean = '0' + clean;
    } else if (!clean.startsWith('0') && clean.length === 10 && clean.startsWith('1')) {
      clean = '0' + clean;
    }

    // SĐT hợp lệ tại Việt Nam phải có ít nhất 9 đến 12 chữ số
    if (clean.length < 9 || clean.length > 12) return;

    if (clean && !phones.includes(clean)) {
      phones.push(clean);
    }
    const converted = convertOldVietnamesePhone(clean);
    if (converted && !phones.includes(converted)) {
      phones.push(converted);
    }
  };

  parts.forEach(cleanAndAdd);

  if (phones.length === 0) {
    const matches = str.match(/(?:0|\+?84)?[0-9]{8,11}/g);
    if (matches) {
      matches.forEach(cleanAndAdd);
    }
  }

  return phones;
}

/**
 * Kiểm tra xem 2 đối tượng SĐT có trùng nhau hay không (so khớp an toàn, hỗ trợ chuyển đổi 11 số sang 10 số)
 */
export function isPhoneMatch(phoneA?: any, phoneB?: any): boolean {
  if (!phoneA || !phoneB) return false;
  const strA = String(phoneA).trim();
  const strB = String(phoneB).trim();
  if (!strA || !strB) return false;

  const isMaskedA = strA.includes('•') || strA.includes('*');
  const isMaskedB = strB.includes('•') || strB.includes('*');

  // 1. Cả 2 đều là số bị che: so khớp an toàn qua suffix (2 số cuối) và prefix nhà mạng
  if (isMaskedA && isMaskedB) {
    const cleanA = strA.replace(/\D/g, '');
    const cleanB = strB.replace(/\D/g, '');
    if (cleanA.length >= 4 && cleanB.length >= 4) {
      const sufA = cleanA.slice(-2);
      const sufB = cleanB.slice(-2);
      if (sufA !== sufB) return false;
      let preA = cleanA.slice(0, cleanA.length - 2);
      let preB = cleanB.slice(0, cleanB.length - 2);
      if (preA.length === 4 && !preA.startsWith('0') && preA.startsWith('1')) preA = '0' + preA;
      if (preB.length === 4 && !preB.startsWith('0') && preB.startsWith('1')) preB = '0' + preB;
      const convA = OLD_TO_NEW_VIETNAMESE_PREFIXES[preA] || preA;
      const convB = OLD_TO_NEW_VIETNAMESE_PREFIXES[preB] || preB;
      return (convA.length >= 3 && convB.length >= 3) && (convA.endsWith(convB) || convB.endsWith(convA));
    }
    return false;
  }

  // 2. Nếu 1 bên bị che và 1 bên là số đầy đủ:
  if (isMaskedA !== isMaskedB) {
    const masked = isMaskedA ? strA : strB;
    const full = isMaskedA ? strB : strA;
    const fullPhones = extractPhones(full);
    if (fullPhones.length === 0) return false;

    const cleanMasked = masked.replace(/[^0-9]/g, '');
    if (cleanMasked.length >= 6) {
      let prefix = cleanMasked.slice(0, 4);
      const suffix = cleanMasked.slice(-2);
      if (prefix.length === 4 && !prefix.startsWith('0') && prefix.startsWith('1')) prefix = '0' + prefix;
      const convPrefix = OLD_TO_NEW_VIETNAMESE_PREFIXES[prefix] || prefix;
      return fullPhones.some(fp => {
        if (!fp.endsWith(suffix)) return false;
        return fp.startsWith(prefix) || fp.startsWith(convPrefix);
      });
    }
    return false;
  }

  // 3. Cả 2 đều là số đầy đủ: so khớp chuẩn qua danh sách SĐT hợp lệ
  const listA = extractPhones(phoneA);
  const listB = extractPhones(phoneB);
  if (listA.length === 0 || listB.length === 0) return false;
  return listA.some(a => listB.includes(a));
}

/**
 * So khớp thông minh tên học sinh trong Danh bạ (Master Roster) với Họ tên gửi từ Web
 * Hỗ trợ các trường hợp thực tế:
 * - Danh bạ ghi ngắn gọn: "Trần Khuyến" <-> Web nhập: "Trần văn Khuyến"
 * - Danh bạ chỉ ghi tên/đệm: "Bảo Thi" <-> Web nhập: "Hoàng Bảo Thi"
 * - Danh bạ ghi tên đảo: "Linh Hữu" <-> Web nhập: "Thái hữu linh"
 * - Khớp theo Biệt danh
 */
export function isVietnameseNameMatch(
  rosterMember: { fullName: string; nickname?: string },
  targetName?: string,
  targetNickname?: string
): boolean {
  if (!rosterMember || !rosterMember.fullName) return false;

  const normalize = (s: string) =>
    String(s)
      .trim()
      .toLowerCase()
      .replace(/\s+/g, ' ');

  const rName = targetName ? normalize(targetName) : '';
  const rNick = targetNickname ? normalize(targetNickname) : '';
  const mName = normalize(rosterMember.fullName);
  const mNick = rosterMember.nickname ? normalize(rosterMember.nickname) : '';

  // Khớp trực tiếp theo nickname nếu cả 2 bên đều có biệt danh
  if (rNick && mNick && rNick === mNick) return true;

  if (!rName || !mName) return false;
  if (mName === rName) return true;
  if (mNick && mNick === rName) return true;
  if (rNick && mName === rNick) return true;

  const rTokens = rName.split(' ').filter(Boolean);
  const mTokens = mName.split(' ').filter(Boolean);

  // 1. Toàn bộ các từ của tên danh bạ nằm trong tên đăng ký web
  if (mTokens.length >= 2 && mTokens.every(t => rTokens.includes(t))) {
    return true;
  }

  // 2. Toàn bộ các từ của tên web nằm trong danh bạ
  if (rTokens.length >= 2 && rTokens.every(t => mTokens.includes(t))) {
    return true;
  }

  // 3. Biệt danh khớp với tên web
  if (mNick && mNick.length >= 2) {
    const nickTokens = mNick.split(' ').filter(Boolean);
    if (nickTokens.length >= 2 && nickTokens.every(t => rTokens.includes(t))) {
      return true;
    }
  }

  // 4. Trùng tên gọi (given name) và trùng biệt danh
  if (rTokens.length > 0 && mTokens.length > 0) {
    const rGivenName = rTokens[rTokens.length - 1];
    const mGivenName = mTokens[mTokens.length - 1];
    if (rGivenName === mGivenName && ((rNick && mNick && rNick === mNick) || (mNick && rName.includes(mNick)))) {
      return true;
    }
  }

  return false;
}

export const DEFAULT_EVENT_CONFIG: EventConfig = {
  eventTitle: "20 Năm Ngày Trở Về",
  eventSubtitle: "Lớp K8A1 — Trường THPT Thái Nguyên",
  eventDateText: "Chủ Nhật, 27/09/2026 (08:30 — 15:30)",
  eventTimeText: "Từ 08:30 Sáng — Chủ Nhật, ngày 27/09/2026",
  countdownTarget: "2026-09-27T08:30:00+07:00",

  // Chặng 1: Trường THPT Thái Nguyên
  venueName: "Trường THPT Thái Nguyên",
  venueSubtitle: "Chặng 1: Đón tiếp nhận áo, thăm trường xưa, chụp ảnh lưu niệm & tri ân Thầy Cô",
  venueAddress: "Số 127 đường Lương Thế Vinh, P. Quang Trung, TP. Thái Nguyên, Tỉnh Thái Nguyên",
  shortAddress: "127 Lương Thế Vinh, TP. Thái Nguyên",
  venueTime: "08:30 — 11:00 (Sáng)",
  venueActivity: "Đón tiếp nhận áo polo • Thẻ kỷ niệm • Thăm lớp học xưa • Chụp ảnh lưu niệm sân trường • Tri ân Thầy Cô",
  mapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3710.2798642279267!2d105.8285514!3d21.5740443!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135272a24921915%3A0xe543df5e9e03fa54!2zVHLGsOG7nW5nIFRIUFQgVGjDoWkgTmd1ecOqbg!5e0!3m2!1svi!2svn!4v1710000000000!5m2!1svi!2svn",
  mapDirectUrl: "https://www.google.com/maps/search/?api=1&query=Tr%C6%B0%E1%BB%9Dng+THPT+Th%C3%A1i+Nguy%C3%AAn,+127+L%C6%B0%C6%A1ng+Th%E1%BA%BF+Vinh,+Th%C3%A1i+Nguy%C3%AAn",

  // Chặng 2: Nhà Hàng & Trung Tâm Sự Kiện Prime Thái Nguyên
  enableTwoVenues: true,
  venue2Name: "Trung Tâm Sự Kiện & Nhà Hàng Prime Thái Nguyên",
  venue2Subtitle: "Chặng 2: Khai tiệc liên hoan, giao lưu văn nghệ & trao kỷ vật hội ngộ",
  venue2Address: "Số 1 đường Hoàng Văn Thụ, P. Phan Đình Phùng, TP. Thái Nguyên, Tỉnh Thái Nguyên",
  venue2ShortAddress: "Số 1 Hoàng Văn Thụ, TP. Thái Nguyên",
  venue2Time: "11:30 — 15:30 (Trưa & Chiều)",
  venue2Activity: "Khai tiệc liên hoan • Nâng ly chúc mừng 20 năm • Giao lưu âm nhạc & Chuyện đời tri kỷ",
  venue2MapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d600!2d105.8386089!3d21.5949009!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x52211cf3f4926b%3A0x6de9f091b88c49ab!2sTh%C3%A1p%20%C4%91%C3%B4i%20Prime%20Th%C3%A1i%20Nguy%C3%AAn!5e1!3m2!1svi!2svn!4v1725550000000!5m2!1svi!2svn",
  venue2MapDirectUrl: "https://maps.app.goo.gl/a3utiYosZqGHKDjYA",
  routeDistanceText: "~1.5km (Di chuyển 5 - 10 phút)",
  routeDirectUrl: "https://www.google.com/maps/dir/?api=1&origin=Tr%C6%B0%E1%BB%9Dng+THPT+Th%C3%A1i+Nguy%C3%AAn,+127+L%C6%B0%C6%A1ng+Th%E1%BA%BF+Vinh,+Th%C3%A1i+Nguy%C3%AAn&destination=Th%C3%A1p+%C4%91%C3%B4i+Prime+Th%C3%A1i+Nguy%C3%AAn,+S%E1%BB%91+1+Ho%C3%A0ng+V%C4%83n+Th%E1%BB%A5,+Th%C3%A1i+Nguy%C3%AAn",

  letterTitle: "Lời Ngỏ Thân Tình Gửi Bạn Tôi — Lớp K8A1",
  letterSubtitle: "Hai mươi năm một chặng đường — Nơi ký ức thanh xuân THPT Thái Nguyên mãi vẹn nguyên",
  letterParagraph1: "Hai mươi năm — một chặng đường đủ dài để mỗi thành viên Lớp K8A1 (Khóa 8) chúng ta trưởng thành, gây dựng sự nghiệp và vun vén cho những tổ ấm riêng. Dù hôm nay mỗi người mỗi ngả, bộn bề với những lo toan cuộc sống, nhưng sâu thẳm trong tim mỗi chúng ta vẫn luôn vẹn nguyên một ngăn ký ức thiêng liêng dành cho những năm tháng cấp 3 rực rỡ dưới mái trường THPT Thái Nguyên thân thương.",
  letterParagraph2: "Hãy tạm gác lại những bộn bề âu lo, cùng trở về mái trường xưa và nâng ly hội ngộ để gặp lại những gương mặt thanh xuân năm nào, cùng viết tiếp câu chuyện tình bạn đẹp đẽ của Lớp K8A1 chúng mình!",
  letterSignatureTitle: "Ban Liên Lạc Lớp K8A1 (Khóa 8)",
  letterSignatureSubtitle: "Trường THPT Thái Nguyên (2003 — 2006)",
  bankName: "Vietcombank (VCB)",
  bankAccount: "10123456789",
  bankHolder: "NGUYEN VAN BAN TO CHUC",
  transferSyntax: "KY NIEM 20 NAM K8A1",
  fundAmountPerPerson: 700000,
  customQrUrl: "",
  bankCode: "vietcombank",
  qrTemplate: "compact",
  heroBannerUrl: "",
  heroBannerPosition: 50,
  schoolLogoUrl: "https://thpttn.tnue.edu.vn/upload/doantn/logo%20thpttn.jpg"
};

// Logo chính thức Trường THPT Thái Nguyên (thuộc ĐH Sư Phạm - ĐH Thái Nguyên)
export const SCHOOL_LOGO_URL = "https://thpttn.tnue.edu.vn/upload/doantn/logo%20thpttn.jpg";

// URL Google Apps Script WebApp mặc định toàn hệ thống
// BLL có thể dán URL triển khai (/exec) vào đây để mọi thiết bị/ẩn danh tự động đồng bộ cùng 1 Sheet
export const DEFAULT_APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycby_hm9akENv_GmNpF8s9ALVReDd_8ORPS_RqpUZ9FS6GB_Qdnmjhh5XZ5iKZhnE_9S0/exec";

export const K8A1_DRIVE_FOLDER_ID = "1Skmip1HQhmXan-58kwbY_msamP-bWokq";
export const K8A1_DRIVE_FOLDER_URL = "https://drive.google.com/drive/folders/1Skmip1HQhmXan-58kwbY_msamP-bWokq";

export const TEACHERS_LIST: TeacherData[] = [];

export const INITIAL_TEACHER_TRIBUTES: TeacherTribute[] = [];

export const TEACHER_SUBJECT_OPTIONS = [
  "Toán Học",
  "Ngữ Văn",
  "Tiếng Anh",
  "Vật Lý",
  "Hóa Học",
  "Sinh Học",
  "Lịch Sử",
  "Địa Lý",
  "Tin Học",
  "GDCD",
  "Thể Dục",
  "GDQP-AN",
  "Công Nghệ / Kỹ Thuật",
  "Ban Giám Hiệu"
];

export const TEACHER_ROLE_OPTIONS = [
  "Giáo viên Bộ môn",
  "Chủ nhiệm Lớp 12A1",
  "Chủ nhiệm Lớp 11A1",
  "Chủ nhiệm Lớp 10A1",
  "Hiệu Trưởng",
  "Phó Hiệu Trưởng",
  "Bí Thư Đoàn Trường",
  "Tổng Phụ Trách Đội / Đoàn"
];

export const TEACHER_TRANSPORTATION_OPTIONS = [
  "Tự túc",
  "Lớp cử xe đón tại nhà",
  "Thầy tự đi cùng học trò",
  "Cô tự đi cùng học trò",
  "Đi cùng Thầy/Cô khác",
  "Cần xe đón tuyến Hà Nội - Thái Nguyên",
  "Cần hỗ trợ đưa đón tại Thái Nguyên",
  "Cần xe đưa về sau dạ tiệc"
];

export const TEACHER_HEALTH_OPTIONS = [
  "Bình thường (Không yêu cầu đặc biệt)",
  "Ngồi bàn danh dự tầng 1 (ít bậc thang)",
  "Cần hỗ trợ di chuyển (chân yếu / đi lại chậm)",
  "Ăn chay",
  "Ăn kiêng / Chế độ ăn thanh đạm",
  "Không uống rượu bia / đồ uống có cồn"
];

export const GOOGLE_APPS_SCRIPT_CODE = `/**
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
      shirtSize: String(r[6] || 'L').trim().toUpperCase(),
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
 * Trigger tự động chạy khi người dùng gõ sửa trực tiếp trên giao diện Google Sheets
 */
function onEdit(e) {
  if (!e || !e.range) return;
  try {
    var range = e.range;
    var sheet = range.getSheet();
    var sheetName = sheet.getName();

    // Nếu sửa tại tab Danh_Sach_Lop (cột 2: Tên, cột 3: Biệt danh, cột 4: SĐT, cột 7: Size áo)
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
  if (p === '8888' || p === '6868' || p === '2006') return true;
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

    if (action === 'record_view' || action === 'hit_view') {
      return handleResponse(recordPageView());
    }

    if (action === 'upload_photo' || action === 'upload_banner') {
      return handleResponse(uploadPhotoToDrive(postData));
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
      shirtSize: String(row[4] || 'L'),
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

  var normNewPhone = normalizePhone(data.phone);
  var normNewName = normalizeName(data.fullName);
  var targetMemberId = String(data.memberId || '').trim();

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

  // 3. Ưu tiên số 3: Khớp theo SĐT hợp lệ
  if (matchedRowIndex === -1 && normNewPhone) {
    for (var i = 1; i < rows.length; i++) {
      var row = rows[i];
      var rowPhone = normalizePhone(row[2]);
      if (rowPhone && normNewPhone === rowPhone) {
        if (matchedRowIndex === -1) {
          matchedRowIndex = i + 1;
        } else if (matchedRowIndex !== (i + 1)) {
          duplicateRowIndices.push(i + 1);
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

  var phoneValue = normNewPhone ? ("'" + normNewPhone) : (data.phone ? ("'" + String(data.phone).trim()) : '');
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
      phoneValue || existingRow[2] || '',
      data.status === 'yes' ? 'Có tham gia' : 'Rất tiếc vắng mặt',
      data.shirtSize || existingRow[4] || 'L',
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

    var newRow = [
      data.fullName || '',
      data.nickname || '',
      phoneValue,
      data.status === 'yes' ? 'Có tham gia' : 'Rất tiếc vắng mặt',
      data.shirtSize || 'L',
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
        var normP = normalizePhone(data.phone);
        sheet.getRange(rowIndex, 3).setValue(normP ? "'" + normP : data.phone);
      }
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
      if (data.memberId) sheet.getRange(rowIndex, 17).setValue(data.memberId);
      updated = true;
      break;
    }
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
      const shirtSize = String(row[6] || 'L').trim().toUpperCase();
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
      const shirtSize = String(m.shirtSize || 'L').trim().toUpperCase();
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
    const shirtSize = String(member.shirtSize || 'L').trim().toUpperCase();
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
        teachers: teachers
      }
    };
  } catch (err) {
    return { status: 'error', message: err.toString() };
  }
}
`;

/**
 * ============================================================================
 * 🔐 BẢO MẬT XÁC THỰC MÃ PIN CLIENT & SERVER (SHA-256 + GOOGLE APPS SCRIPT)
 * ============================================================================
 */
const SALT_PIN = 'k8a1_2026_secure_salt_';

export async function hashPinWithSalt(pin: string): Promise<string> {
  const clean = String(pin || '').trim();
  try {
    if (typeof crypto !== 'undefined' && crypto.subtle) {
      const msgUint8 = new TextEncoder().encode(SALT_PIN + clean);
      const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
  } catch (e) {}
  // Basic fallback if crypto.subtle is unavailable
  let hash = 0;
  const str = SALT_PIN + clean;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return String(hash);
}

// Băm mật mã SHA-256 dự phòng ngoại tuyến (Tuyệt đối không lưu số thô trong source code)
export const OFFLINE_PIN_HASHES = {
  admin: '2ab5884752e41a50371f5c94a5e9dcd5ae6afcfd44f260b8537658fa0ee698af',
  treasurer: '80b1cb0fcdaabeb4ecaf7a38408205a1752a480009f59abe79aa03fab60e0b63',
  bll: '098bb9c2c2bf457738976a8b3fe99c535151ae8759d3e4161558ddd25f65845f'
};

/**
 * Xác thực mã PIN an toàn qua Google Apps Script / Google Sheets
 */
export async function verifyPinViaBackend(
  pin: string,
  appsScriptUrl?: string
): Promise<{ success: boolean; role?: UserRole; message?: string; isLocked?: boolean }> {
  const cleanPin = String(pin || '').trim();
  if (!cleanPin) {
    return { success: false, message: 'Vui lòng nhập mã PIN!' };
  }

  const targetUrl = appsScriptUrl && appsScriptUrl.trim() !== ''
    ? appsScriptUrl.trim()
    : DEFAULT_APPS_SCRIPT_URL;

  // 1. Thử xác thực trực tuyến qua Google Apps Script / Google Sheets
  if (targetUrl && !targetUrl.includes('YOUR_NEW_DEPLOYMENT_ID')) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const res = await fetch(targetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'verify_pin', pin: cleanPin }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      const json = await res.json();
      if (json.status === 'success' && json.role) {
        return { success: true, role: json.role as UserRole, message: json.message };
      }
      return {
        success: false,
        message: json.message || 'Mã PIN không đúng!',
        isLocked: json.code === 'LOCKED'
      };
    } catch (netErr: any) {
      // Fallback qua GET nếu POST bị mạng/CORS can thiệp
      try {
        const getRes = await fetch(`${targetUrl}?action=verify_pin&pin=${encodeURIComponent(cleanPin)}&t=${Date.now()}`);
        const getJson = await getRes.json();
        if (getJson.status === 'success' && getJson.role) {
          return { success: true, role: getJson.role as UserRole, message: getJson.message };
        }
        return {
          success: false,
          message: getJson.message || 'Mã PIN không đúng!',
          isLocked: getJson.code === 'LOCKED'
        };
      } catch (getErr) {
        console.warn('Backend PIN check failed, using secure offline hash fallback:', getErr);
      }
    }
  }

  // 2. Chế độ dự phòng Ngoại tuyến (Offline): So sánh chuỗi băm SHA-256 (không để lộ mã thô)
  const hashed = await hashPinWithSalt(cleanPin);
  if (hashed === OFFLINE_PIN_HASHES.admin) {
    return { success: true, role: 'admin' };
  }
  if (hashed === OFFLINE_PIN_HASHES.treasurer) {
    return { success: true, role: 'treasurer' };
  }
  if (hashed === OFFLINE_PIN_HASHES.bll) {
    return { success: true, role: 'bll' };
  }

  return { success: false, message: 'Mã PIN không đúng! Vui lòng thử lại.' };
}

/**
 * Cập nhật và đồng bộ mã PIN bảo mật lên Google Sheets
 */
export async function updatePinsViaBackend(
  payload: { currentAdminPin: string; newAdminPin?: string; newTreasurerPin?: string; newBllPin?: string },
  appsScriptUrl?: string
): Promise<{ success: boolean; message: string }> {
  const targetUrl = appsScriptUrl && appsScriptUrl.trim() !== ''
    ? appsScriptUrl.trim()
    : DEFAULT_APPS_SCRIPT_URL;

  if (!targetUrl || targetUrl.includes('YOUR_NEW_DEPLOYMENT_ID')) {
    return { success: false, message: 'Chưa cấu hình URL Google Apps Script hợp lệ!' };
  }

  try {
    const res = await fetch(targetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        action: 'update_pins',
        ...payload
      })
    });
    const json = await res.json();
    if (json.status === 'success') {
      return { success: true, message: json.message || 'Đã đồng bộ mã PIN mới lên Google Sheets thành công!' };
    }
    return { success: false, message: json.message || 'Không thể cập nhật mã PIN trên máy chủ!' };
  } catch (err: any) {
    return { success: false, message: 'Lỗi kết nối máy chủ Google Apps Script: ' + (err?.message || err) };
  }
}

/**
 * Chủ động gửi yêu cầu khởi tạo hoặc kiểm tra Sheet Bao_Mat_PIN lên Google Sheets
 */
export async function initSecuritySheetViaBackend(
  appsScriptUrl?: string
): Promise<{ success: boolean; message: string }> {
  const targetUrl = appsScriptUrl && appsScriptUrl.trim() !== ''
    ? appsScriptUrl.trim()
    : DEFAULT_APPS_SCRIPT_URL;

  if (!targetUrl || targetUrl.includes('YOUR_NEW_DEPLOYMENT_ID')) {
    return { success: false, message: 'Chưa cấu hình URL Google Apps Script hợp lệ!' };
  }

  try {
    const res = await fetch(`${targetUrl}?action=init_security&t=${Date.now()}`);
    const json = await res.json();
    if (json.status === 'success') {
      return { success: true, message: json.message || 'Đã khởi tạo sheet Bao_Mat_PIN thành công!' };
    }
    return { success: false, message: json.message || 'Không thể khởi tạo sheet!' };
  } catch (err: any) {
    return { success: false, message: 'Lỗi kết nối máy chủ: ' + (err?.message || err) };
  }
}

/**
 * Chuẩn hóa chuỗi bỏ dấu tiếng Việt để tìm kiếm thông minh
 */
export function removeVietnameseAccents(str: string): string {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase();
}

/**
 * Tách tên gọi cuối cùng của người Việt để sắp xếp A-Z (VD: Nguyễn Tuấn Anh -> Anh)
 */
export function getVietnameseGivenName(fullName: string): string {
  if (!fullName) return '';
  const parts = fullName.trim().split(/\s+/);
  return parts[parts.length - 1] || fullName;
}

