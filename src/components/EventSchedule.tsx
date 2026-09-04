import React from 'react';
import { Clock, Calendar, MapPin, Sparkles, Download, CheckCircle, ExternalLink } from 'lucide-react';
import { EVENT_SCHEDULE } from '../data';
import { ScheduleItem } from '../types';

export default function EventSchedule() {
  const schedule: ScheduleItem[] = EVENT_SCHEDULE;

  const handleAddToCalendar = (item: ScheduleItem) => {
    const title = encodeURIComponent(`[Hội Ngộ 20 Năm Lớp K8A1] ${item.title}`);
    const details = encodeURIComponent(`${item.desc}\nĐịa điểm: ${item.location || 'Crown Palace Thái Nguyên'}`);
    const location = encodeURIComponent("Trung tâm tổ chức sự kiện - tiệc cưới Crown Palace (779 Dương Tự Minh, P. Quang Vinh, TP. Thái Nguyên)");
    // 2026-09-27T08:30:00 to 2026-09-27T15:30:00 in UTC (01:30 to 08:30)
    const dates = "20260927T013000Z/20260927T083000Z";
    window.open(`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}&location=${location}`, '_blank');
  };

  const handleDownloadIcs = () => {
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Hoi Ngo 20 Nam//Lop K8A1 THPT Thai Nguyen//VI
CALSCALE:GREGORIAN
BEGIN:VEVENT
SUMMARY:Hội ngộ 20 năm: Lớp K8A1 - Trường THPT Thái Nguyên (2006 - 2026)
DESCRIPTION:Kỷ niệm 20 năm ngày ra trường Lớp K8A1 (Khóa 8), THPT Thái Nguyên tại Crown Palace Thái Nguyên. Đón tiếp từ 08:30 sáng.
LOCATION:Trung tâm sự kiện - tiệc cưới Crown Palace, 779 Dương Tự Minh, TP. Thái Nguyên
DTSTART:20260927T013000Z
DTEND:20260927T083000Z
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Hoi-Ngo-20-Nam-Lop-K8A1-27-09-2026.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <section id="schedule-section" className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-2 border-b border-brand-border pb-4">
        <span className="text-[11px] font-sans uppercase tracking-[0.25em] text-brand-gold font-bold">
          Chương Trình Chi Tiết • Chủ Nhật, 27/09/2026 (Từ 08:30 Sáng)
        </span>
        <h2 className="text-2xl md:text-3xl font-serif text-brand-text font-bold">
          Lịch Trình Ngày Hội Ngộ Bạn Bè K8A1
        </h2>
        <p className="text-xs text-brand-text-muted font-serif italic max-w-xl mx-auto">
          Khung thời gian chuẩn bị chu đáo để các thành viên Lớp K8A1 (Khóa 8) Trường THPT Thái Nguyên cùng tận hưởng trọn vẹn từng khoảnh khắc hàn huyên ý nghĩa.
        </p>
      </div>

      {/* Main Schedule Card */}
      <div className="bg-white border border-brand-border rounded-sm p-6 md:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#FAF8F5] p-4 rounded border border-brand-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand-gold/15 text-brand-gold flex items-center justify-center font-bold">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-sm text-brand-text">
                Chủ Nhật, ngày 27 tháng 09 năm 2026
              </h4>
              <p className="text-xs text-brand-text-muted font-serif italic flex items-center gap-1">
                <MapPin className="w-3 h-3 text-brand-gold" />
                <span>Crown Palace Thái Nguyên • 779 Dương Tự Minh, P. Quang Vinh, TP. Thái Nguyên</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleAddToCalendar(schedule[0])}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-text hover:bg-brand-gold text-white text-xs font-sans font-bold uppercase tracking-wider rounded-xs cursor-pointer transition-colors"
            >
              <Calendar className="w-3.5 h-3.5 text-brand-gold" />
              <span>Thêm vào Google Calendar</span>
            </button>
            <button
              onClick={handleDownloadIcs}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-brand-bg-alt text-brand-text text-xs font-sans font-bold uppercase tracking-wider border border-brand-border rounded-xs cursor-pointer transition-colors"
              title="Tải tệp .ICS về máy (hỗ trợ Apple Calendar, Outlook)"
            >
              <Download className="w-3.5 h-3.5 text-brand-gold" />
              <span>Tải .ICS</span>
            </button>
          </div>
        </div>

        {/* Timeline Items */}
        <div className="relative border-l-2 border-brand-gold/40 ml-4 md:ml-6 space-y-6 pl-6 md:pl-8 py-2">
          {schedule.map((item, idx) => (
            <div key={idx} className="relative group">
              {/* Dot */}
              <div className="absolute -left-[31px] md:-left-[39px] top-1.5 w-4 h-4 rounded-full bg-white border-2 border-brand-gold flex items-center justify-center group-hover:scale-125 transition-transform">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-gold" />
              </div>

              <div className="bg-[#FAF8F5] border border-brand-border/80 rounded-xs p-4 hover:border-brand-gold/60 transition-all space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-brand-gold shrink-0" />
                    <span className="font-mono text-xs font-bold text-brand-gold uppercase tracking-wider">
                      {item.time}
                    </span>
                  </div>
                  {item.location && (
                    <span className="text-[10px] font-sans font-medium text-brand-text-muted bg-white px-2 py-0.5 rounded-xs border border-brand-border/60">
                      📍 {item.location}
                    </span>
                  )}
                </div>

                <h4 className="font-serif font-bold text-base text-brand-text">
                  {item.title}
                </h4>

                <p className="text-xs font-serif text-brand-text-muted leading-relaxed italic">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
