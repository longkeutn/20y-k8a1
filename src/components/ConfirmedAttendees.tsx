import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  CheckCircle2, 
  Search, 
  RefreshCw, 
  Code2, 
  UserCheck, 
  Calendar, 
  MessageSquare, 
  Phone, 
  Award,
  Sparkles
} from 'lucide-react';
import { RsvpData } from '../types';

interface ConfirmedAttendeesProps {
  appsScriptUrl: string;
  rsvpList: RsvpData[];
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export default function ConfirmedAttendees({ 
  appsScriptUrl, 
  rsvpList, 
  onRefresh, 
  isRefreshing = false 
}: ConfirmedAttendeesProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'name'>('recent');
  const [showCodeModal, setShowCodeModal] = useState(false);

  // Filter only people who confirmed "yes"
  const confirmedAttendees = useMemo(() => {
    return rsvpList.filter(item => item.status === 'yes');
  }, [rsvpList]);

  // Apply search and sort
  const displayList = useMemo(() => {
    const term = (searchTerm || '').toLowerCase().trim();
    let result = confirmedAttendees.filter(item => {
      if (!term) return true;
      const matchName = (item.fullName || '').toLowerCase().includes(term);
      const matchPhone = (item.phone || '').includes(term);
      const matchClass = (item.className || '').toLowerCase().includes(term);
      const matchMsg = item.message ? item.message.toLowerCase().includes(term) : false;
      return matchName || matchPhone || matchClass || matchMsg;
    });

    if (sortBy === 'name') {
      result = [...result].sort((a, b) => (a.fullName || '').localeCompare(b.fullName || '', 'vi'));
    } else {
      // Recent (as registered or default order)
      result = [...result];
    }

    return result;
  }, [confirmedAttendees, searchTerm, sortBy]);

  // Mask phone for privacy in public list
  const maskPhone = (phone: string) => {
    if (!phone || phone.length < 6) return phone;
    return phone.slice(0, 3) + '••••' + phone.slice(-3);
  };

  return (
    <div id="confirmed-attendees-module" className="bg-white border border-brand-border rounded-sm p-6 md:p-8 shadow-xs space-y-8">
      
      {/* Module Header */}
      <div className="border-b border-brand-border pb-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-[0.2em] font-sans font-bold text-brand-gold flex items-center gap-1.5">
            <UserCheck className="w-4 h-4" />
            <span>BẢNG VÀNG ĐIỂM DANH</span>
          </span>
          <h2 className="text-2xl font-light text-brand-text font-serif mt-1">
            Danh Sách Đã Xác Nhận Tham Dự
          </h2>
          <p className="text-xs text-brand-text-muted font-serif italic mt-1">
            Đồng bộ trực tiếp từ bảng tính điểm danh Google Sheets của lớp
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm border border-brand-border bg-[#FAF9F6] text-[10px] uppercase tracking-wider font-sans font-bold text-brand-text hover:bg-brand-border/20 transition-colors cursor-pointer disabled:opacity-50"
              title="Làm mới dữ liệu từ Google Sheets"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-brand-gold ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Đang tải...' : 'Làm mới'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowCodeModal(!showCodeModal)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm border border-brand-border bg-[#FAF9F6] text-[10px] uppercase tracking-wider font-sans font-bold text-brand-text hover:bg-brand-border/20 transition-colors cursor-pointer"
            title="Xem mã nguồn HTML, CSS & JS để nhúng danh sách này"
          >
            <Code2 className="w-3.5 h-3.5 text-brand-gold" />
            <span>Mã nguồn nhúng web</span>
          </button>
        </div>
      </div>

      {/* Standalone Code Snippet Drawer for HTML, CSS, JS requested by user */}
      <AnimatePresence>
        {showCodeModal && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden bg-[#FAF9F6] border border-brand-border rounded-sm p-5 space-y-4 text-xs"
          >
            <div className="flex items-center justify-between border-b border-brand-border pb-2">
              <span className="font-sans font-bold uppercase tracking-wider text-[10px] text-brand-text">
                Mã Nguồn Thuần (HTML, CSS, JS) Hiển Thị Danh Sách Xác Nhận Từ Google Sheet
              </span>
              <button
                type="button"
                onClick={() => setShowCodeModal(false)}
                className="text-[10px] text-brand-text-muted hover:text-brand-text uppercase font-bold"
              >
                Đóng ✕
              </button>
            </div>

            <p className="text-brand-text-muted font-serif italic text-xs leading-relaxed">
              Bạn có thể sao chép đoạn mã bên dưới để nhúng danh sách điểm danh này vào bất kỳ website nào khác:
            </p>

            <div className="space-y-3 font-mono text-[11px]">
              <div>
                <span className="font-bold font-sans text-[10px] uppercase text-brand-gold">Mã nguồn HTML, CSS & JS hoàn chỉnh:</span>
                <pre className="bg-slate-900 text-slate-100 p-3 rounded-sm mt-1 overflow-x-auto max-h-[220px]">
{`<!-- 1. HTML -->
<div id="attendees-container" class="attendees-box">
  <div class="header">
    <h3>DANH SÁCH ĐÃ XÁC NHẬN THAM DỰ</h3>
    <span id="attendee-count">Đang tải...</span>
  </div>
  <ul id="attendee-list" class="attendee-list"></ul>
</div>

<!-- 2. CSS -->
<style>
.attendees-box { font-family: sans-serif; background: #fff; border: 1px solid #d9d1c7; padding: 20px; }
.attendee-list { list-style: none; padding: 0; margin-top: 15px; }
.attendee-item { border-bottom: 1px solid #eee; padding: 10px 0; display: flex; justify-content: space-between; }
.badge-yes { background: #e8f5e9; color: #2e7d32; font-size: 11px; padding: 2px 6px; border-radius: 2px; }
</style>

<!-- 3. JAVASCRIPT (Fetch trực tiếp từ Google Apps Script) -->
<script>
const SCRIPT_URL = "${appsScriptUrl || 'URL_GOOGLE_APPS_SCRIPT_CUA_BAN'}";

fetch(SCRIPT_URL + '?action=get_confirmed_attendees')
  .then(res => res.json())
  .then(res => {
    if (res.status === 'success') {
      document.getElementById('attendee-count').innerText = res.count + ' thành viên';
      const listEl = document.getElementById('attendee-list');
      listEl.innerHTML = res.data.map(item => \`
        <li class="attendee-item">
          <div>
            <strong>\${item.fullName}</strong>
            <div style="font-size:12px;color:#777;font-style:italic;">\${item.message || ''}</div>
          </div>
          <span class="badge-yes">✓ Có mặt</span>
        </li>
      \`).join('');
    }
  })
  .catch(err => console.error('Lỗi khi tải danh sách:', err));
</script>`}
                </pre>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Counter Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-[#FAF9F6] p-4 rounded-sm border border-brand-border space-y-1 text-left">
          <div className="flex items-center gap-1.5 text-brand-gold text-[10px] font-sans font-bold uppercase tracking-wider">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Đã xác nhận có mặt</span>
          </div>
          <div className="text-2xl font-light font-serif text-brand-text">
            {confirmedAttendees.length} <span className="text-xs font-sans text-brand-text-muted">bạn</span>
          </div>
        </div>

        <div className="bg-[#FAF9F6] p-4 rounded-sm border border-brand-border space-y-1 text-left">
          <div className="flex items-center gap-1.5 text-brand-gold text-[10px] font-sans font-bold uppercase tracking-wider">
            <Award className="w-3.5 h-3.5" />
            <span>Tỷ lệ tham dự</span>
          </div>
          <div className="text-2xl font-light font-serif text-brand-text">
            {rsvpList.length > 0 
              ? Math.round((confirmedAttendees.length / rsvpList.length) * 100) 
              : 100}%
          </div>
        </div>

        <div className="col-span-2 sm:col-span-1 bg-[#FAF9F6] p-4 rounded-sm border border-brand-border space-y-1 text-left">
          <div className="flex items-center gap-1.5 text-brand-gold text-[10px] font-sans font-bold uppercase tracking-wider">
            <Calendar className="w-3.5 h-3.5" />
            <span>Thời gian hội ngộ</span>
          </div>
          <div className="text-xs font-bold font-sans text-brand-text pt-1">
            08:30 — 18/10/2026
          </div>
        </div>
      </div>

      {/* Search & Sort Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-brand-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo tên bạn bè, lời nhắn..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-2 border-b border-brand-border bg-transparent text-brand-text text-xs focus:outline-none focus:border-brand-gold placeholder:text-brand-text-muted/50"
          />
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto text-[10px] font-sans font-bold uppercase tracking-wider text-brand-text-muted">
          <span>Sắp xếp:</span>
          <button
            type="button"
            onClick={() => setSortBy('recent')}
            className={`px-2.5 py-1 rounded-sm cursor-pointer ${
              sortBy === 'recent'
                ? 'bg-brand-text text-white'
                : 'bg-[#FAF9F6] border border-brand-border hover:text-brand-text'
            }`}
          >
            Mới nhất
          </button>
          <button
            type="button"
            onClick={() => setSortBy('name')}
            className={`px-2.5 py-1 rounded-sm cursor-pointer ${
              sortBy === 'name'
                ? 'bg-brand-text text-white'
                : 'bg-[#FAF9F6] border border-brand-border hover:text-brand-text'
            }`}
          >
            Tên A-Z
          </button>
        </div>
      </div>

      {/* Attendees Cards List */}
      {displayList.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-brand-border rounded-sm bg-[#FAF9F6] text-brand-text-muted text-xs font-serif italic space-y-2">
          <p>Không tìm thấy thành viên nào phù hợp với từ khóa tìm kiếm.</p>
          <p className="text-[10px] font-sans not-italic text-brand-gold">
            Bạn chưa đăng ký? Hãy kéo lên mục trên để xác nhận tham dự nhé!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {displayList.map((attendee, index) => (
            <div
              key={attendee.id || `attendee-${index}`}
              className="p-5 rounded-sm border border-brand-border bg-white shadow-2xs space-y-3 relative group hover:border-brand-gold transition-colors flex flex-col justify-between"
            >
              <div className="space-y-2.5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-brand-gold-light text-brand-gold flex items-center justify-center font-serif text-sm font-bold border border-brand-border/40 shrink-0">
                      {attendee.fullName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-brand-text">
                        {attendee.fullName}
                      </h4>
                      <p className="text-[10px] text-brand-text-muted font-sans flex items-center gap-1">
                        <Phone className="w-2.5 h-2.5" />
                        <span>{maskPhone(attendee.phone)}</span>
                      </p>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-sm bg-green-50 border border-green-200 text-green-800 font-sans font-medium whitespace-nowrap">
                    <CheckCircle2 className="w-3 h-3 text-green-600" />
                    <span>Có mặt</span>
                  </span>
                </div>

                {attendee.message && (
                  <p className="text-xs text-brand-text-muted font-serif italic leading-relaxed pl-2 border-l border-brand-gold/40">
                    "{attendee.message}"
                  </p>
                )}
              </div>

              <div className="pt-2 border-t border-brand-border/30 flex items-center justify-between text-[10px] text-brand-text-muted font-sans">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-brand-gold" />
                  <span>Thành viên Niên khóa 2003 - 2006</span>
                </span>
                {attendee.submittedAt && (
                  <span>{attendee.submittedAt}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Ghi chú về việc đồng bộ trực tuyến với Google Sheets */}
      <div className="p-3 bg-[#FAF9F6] border border-brand-border rounded-sm text-[11px] text-brand-text-muted font-serif italic flex items-center justify-between">
        <span>
          💡 Danh sách được cập nhật tự động khi có bạn cùng lớp gửi biểu mẫu xác nhận tham dự.
        </span>
        <a 
          href="#rsvp-section" 
          className="font-sans font-bold uppercase text-[10px] text-brand-gold hover:underline shrink-0 ml-2"
        >
          Tôi chưa đăng ký →
        </a>
      </div>

    </div>
  );
}
