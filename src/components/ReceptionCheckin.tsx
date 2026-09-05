import React, { useState } from 'react';
import { Search, UserCheck, UserX, CheckCircle, Clock, Shirt, Sparkles, Phone, Users, Filter, Download } from 'lucide-react';
import confetti from 'canvas-confetti';
import { RsvpData } from '../types';

interface ReceptionCheckinProps {
  attendees: RsvpData[];
  onToggleCheckIn: (attendeeId: string, currentStatus: boolean) => void;
  onOpenPass: (attendee: RsvpData) => void;
}

export default function ReceptionCheckin({
  attendees,
  onToggleCheckIn,
  onOpenPass
}: ReceptionCheckinProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterClass, setFilterClass] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'checkedIn' | 'notYet'>('all');

  const confirmedAttendees = attendees.filter((a) => a.status === 'yes');
  const checkedInCount = confirmedAttendees.filter((a) => a.checkedIn).length;
  const attendanceRate = confirmedAttendees.length > 0 ? Math.round((checkedInCount / confirmedAttendees.length) * 100) : 0;

  // Filter logic
  const query = (searchQuery || '').toLowerCase().trim();
  const filteredList = confirmedAttendees.filter((a) => {
    const matchSearch =
      !query ||
      String(a.fullName || '').toLowerCase().includes(query) ||
      String(a.phone || '').includes(query) ||
      (a.className && String(a.className).toLowerCase().includes(query));

    const matchClass = filterClass === 'all' || a.className === filterClass;
    const matchStatus =
      filterStatus === 'all' ||
      (filterStatus === 'checkedIn' && a.checkedIn) ||
      (filterStatus === 'notYet' && !a.checkedIn);

    return matchSearch && matchClass && matchStatus;
  });

  const handleCheckInClick = (attendee: RsvpData) => {
    const nextStatus = !attendee.checkedIn;
    if (attendee.id) {
      onToggleCheckIn(attendee.id, attendee.checkedIn || false);
    }
    if (nextStatus) {
      confetti({
        particleCount: 35,
        spread: 50,
        origin: { y: 0.6 }
      });
    }
  };

  const handleExportCheckInList = () => {
    const headers = ['STT', 'Họ và Tên', 'Số Điện Thoại', 'Lớp', 'Size Áo', 'Trạng Thái', 'Thời Gian Đến'];
    const rows = confirmedAttendees.map((a, idx) => [
      idx + 1,
      a.fullName,
      a.phone,
      a.className || 'Chưa ghi',
      a.shirtSize || 'Chưa chọn',
      a.checkedIn ? 'ĐÃ ĐẾN' : 'CHƯA ĐẾN',
      a.checkedInAt || ''
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers, ...rows].map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Diem_Danh_Lop_K8A1_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <section id="reception-section" className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2 border-b border-brand-border pb-4">
        <span className="text-[11px] font-sans uppercase tracking-[0.25em] text-brand-gold font-bold">
          Dành Cho Bàn Lễ Tân & Ban Tổ Chức Lớp K8A1
        </span>
        <h2 className="text-2xl md:text-3xl font-serif text-brand-text font-bold">
          Cổng Điểm Danh Nhanh Sự Kiện (Check-in Desk)
        </h2>
        <p className="text-xs text-brand-text-muted font-serif italic max-w-xl mx-auto">
          Tra cứu nhanh danh sách thành viên Lớp K8A1 tham dự, tích chọn điểm danh khi các bạn đến cổng và phát đúng kích cỡ áo đồng phục.
        </p>
      </div>

      {/* KPI Stats Header */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-brand-border rounded-sm p-4 space-y-1 shadow-2xs">
          <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-brand-text-muted flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-brand-gold" />
            Tổng xác nhận tham dự
          </span>
          <p className="text-2xl font-serif font-bold text-brand-text">
            {confirmedAttendees.length} bạn
          </p>
        </div>

        <div className="bg-white border border-brand-border rounded-sm p-4 space-y-1 shadow-2xs">
          <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-brand-text-muted flex items-center gap-1">
            <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
            Đã có mặt tại Crown Palace
          </span>
          <p className="text-2xl font-serif font-bold text-emerald-700">
            {checkedInCount} / {confirmedAttendees.length}
          </p>
          <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden mt-1">
            <div className="bg-emerald-600 h-full rounded-full transition-all duration-500" style={{ width: `${attendanceRate}%` }} />
          </div>
        </div>

        <div className="bg-white border border-brand-border rounded-sm p-4 space-y-1 shadow-2xs flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-brand-text-muted flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-brand-gold" />
              Tỷ lệ hiện diện
            </span>
            <p className="text-2xl font-serif font-bold text-brand-gold">
              {attendanceRate}%
            </p>
          </div>
          <button
            onClick={handleExportCheckInList}
            className="self-start inline-flex items-center gap-1 text-[10px] font-sans font-bold uppercase tracking-wider text-brand-text hover:text-brand-gold pt-1 cursor-pointer"
          >
            <Download className="w-3 h-3" />
            <span>Xuất file điểm danh CSV</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-[#FAF8F5] border border-brand-border rounded-sm p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-brand-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên bạn học, số điện thoại hoặc lớp..."
            className="w-full pl-9 pr-3 py-2 bg-white border border-brand-border rounded-xs text-xs font-serif text-brand-text focus:outline-none focus:border-brand-gold"
          />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-3 py-2 bg-white border border-brand-border rounded-xs text-xs font-serif text-brand-text focus:outline-none focus:border-brand-gold cursor-pointer"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="checkedIn">Đã có mặt ({checkedInCount})</option>
            <option value="notYet">Chưa đến ({confirmedAttendees.length - checkedInCount})</option>
          </select>
        </div>
      </div>

      {/* Attendees Check-in Table */}
      <div className="bg-white border border-brand-border rounded-sm shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF8F5] text-brand-text-muted font-sans uppercase tracking-wider text-[10px] border-b border-brand-border">
              <tr>
                <th className="py-3 px-4">Họ và Tên</th>
                <th className="py-3 px-4">Lớp</th>
                <th className="py-3 px-4">Size Áo</th>
                <th className="py-3 px-4">Số Điện Thoại</th>
                <th className="py-3 px-4">Trạng Thái Đến</th>
                <th className="py-3 px-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border/60 font-serif">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-brand-text-muted italic">
                    Không tìm thấy thành viên nào khớp với bộ lọc.
                  </td>
                </tr>
              ) : (
                filteredList.map((attendee) => (
                  <tr key={attendee.id || attendee.phone} className="hover:bg-[#FAF9F7] transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-brand-text text-sm">
                        {attendee.fullName}
                      </div>
                      {attendee.checkedInAt && (
                        <span className="text-[10px] text-emerald-700 font-sans flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" /> Có mặt lúc {attendee.checkedInAt}
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <span className="inline-block px-2 py-0.5 bg-brand-gold/10 text-brand-gold text-[10px] font-sans font-bold uppercase rounded-xs">
                        {attendee.className || 'Toàn khóa'}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1 font-sans font-bold text-brand-text">
                        <Shirt className="w-3 h-3 text-brand-gold" />
                        <span>Size {attendee.shirtSize || 'Chưa chọn'}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4 font-mono text-brand-text-muted text-[11px]">
                      {attendee.phone}
                    </td>

                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleCheckInClick(attendee)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-sans font-bold transition-all cursor-pointer ${
                          attendee.checkedIn
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-2xs'
                            : 'bg-gray-100 hover:bg-emerald-50 text-gray-700 hover:text-emerald-700 border border-gray-300'
                        }`}
                      >
                        {attendee.checkedIn ? (
                          <>
                            <UserCheck className="w-3.5 h-3.5 text-emerald-700" />
                            <span>Đã có mặt</span>
                          </>
                        ) : (
                          <>
                            <UserX className="w-3.5 h-3.5 text-gray-500" />
                            <span>Chưa đến (Bấm điểm danh)</span>
                          </>
                        )}
                      </button>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => onOpenPass(attendee)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-sans font-bold uppercase text-brand-gold hover:text-brand-text border border-brand-gold/40 hover:border-brand-text rounded-xs transition-colors cursor-pointer"
                        title="Xem Thẻ Học Sinh / Vé Hội Khóa"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>Xem Thẻ</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
