/**
 * Tiện ích tạo và đồng bộ Lịch hẹn (Google Calendar & .ICS cho Apple/Outlook/Android)
 * Phục vụ Giai đoạn 3: Kết hợp Thông báo Lịch Hẹn & Tối ưu Di Động cho K8A1
 */

export interface CalendarEventDetails {
  title: string;
  description: string;
  location?: string;
  startDate: Date;
  endDate: Date;
  url?: string;
}

export const OFFICIAL_K8A1_REUNION_EVENT: CalendarEventDetails = {
  title: 'Hội Khóa 20 Năm Lớp K8A1 (2003 - 2006) - THPT Thái Nguyên',
  description: 'Đại lễ Kỷ Niệm 20 Năm Ngày Trở Về của Tập thể Lớp K8A1 THPT Thái Nguyên.\n\nLỊCH TRÌNH NGÀY 27/09/2026:\n- 08:30: Tập trung cổng Trường THPT Thái Nguyên, tri ân Thầy Cô và chụp ảnh kỷ niệm.\n- 11:00: Đại tiệc hội ngộ, giao lưu và chiếu ký sự 20 năm tại Trung tâm Sự kiện The Prime.\n\nChi tiết lịch trình, danh sách bạn bè và bản đồ tại WebApp K8A1.',
  location: 'Trường THPT Thái Nguyên & Trung tâm Sự kiện The Prime, TP. Thái Nguyên',
  startDate: new Date('2026-09-27T08:30:00+07:00'),
  endDate: new Date('2026-09-27T15:30:00+07:00'),
  url: typeof window !== 'undefined' ? window.location.origin : 'https://k8a1.vercel.app'
};

function formatUtcIcsDate(d: Date): string {
  return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

/**
 * Tạo URL mở trực tiếp Google Calendar với dữ liệu điền sẵn
 */
export function getGoogleCalendarUrl(event: CalendarEventDetails = OFFICIAL_K8A1_REUNION_EVENT): string {
  const startStr = formatUtcIcsDate(event.startDate);
  const endStr = formatUtcIcsDate(event.endDate);
  const title = encodeURIComponent(event.title);
  const webUrl = event.url || (typeof window !== 'undefined' ? window.location.origin : 'https://k8a1.vercel.app');
  const details = encodeURIComponent(`${event.description}\n\n🌐 WebApp Lớp: ${webUrl}`);
  const location = encodeURIComponent(event.location || 'Crown Palace / The Prime Thái Nguyên');
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startStr}/${endStr}&details=${details}&location=${location}`;
}

/**
 * Tạo nội dung file chuẩn iCalendar (RFC 5545) hỗ trợ chuông báo thức trước 1 ngày và 2 giờ
 */
export function generateIcsContent(event: CalendarEventDetails = OFFICIAL_K8A1_REUNION_EVENT): string {
  const startStr = formatUtcIcsDate(event.startDate);
  const endStr = formatUtcIcsDate(event.endDate);
  const nowStr = formatUtcIcsDate(new Date());
  const uid = `k8a1-${event.startDate.getTime()}-${Math.random().toString(36).substring(2, 8)}@k8a1.edu.vn`;
  const webUrl = event.url || (typeof window !== 'undefined' ? window.location.origin : 'https://k8a1.vercel.app');

  const escapeIcs = (str: string) => str.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//K8A1 THPT Thai Nguyen//Webapp 20 Nam//VI',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${nowStr}`,
    `DTSTART:${startStr}`,
    `DTEND:${endStr}`,
    `SUMMARY:${escapeIcs(event.title)}`,
    `DESCRIPTION:${escapeIcs(event.description + '\n\nWebapp: ' + webUrl)}`,
    `LOCATION:${escapeIcs(event.location || '')}`,
    `URL:${webUrl}`,
    'STATUS:CONFIRMED',
    'BEGIN:VALARM',
    'TRIGGER:-P1D',
    'ACTION:DISPLAY',
    'DESCRIPTION:Nhắc nhở: Ngày mai diễn ra Hội Khóa 20 Năm Lớp K8A1 THPT Thái Nguyên!',
    'END:VALARM',
    'BEGIN:VALARM',
    'TRIGGER:-PT2H',
    'ACTION:DISPLAY',
    'DESCRIPTION:Nhắc nhở: 2 tiếng nữa bắt đầu Hội Khóa 20 Năm Lớp K8A1!',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');
}

/**
 * Tải file .ics cho iPhone (Apple Calendar), iPad, Mac, Outlook hoặc điện thoại Android
 */
export function downloadIcsFile(event: CalendarEventDetails = OFFICIAL_K8A1_REUNION_EVENT, filename = 'Lich_Hoi_Khoa_K8A1_20_Nam.ics'): void {
  try {
    const icsContent = generateIcsContent(event);
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(link.href), 2000);
  } catch (err) {
    console.error('Lỗi tạo file .ics:', err);
    alert('Không thể tải file lịch. Vui lòng sử dụng tùy chọn Thêm vào Google Calendar.');
  }
}
