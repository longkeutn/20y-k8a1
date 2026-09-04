import React, { useState, useMemo } from 'react';
import { 
  Users, 
  CheckCircle2, 
  Search, 
  RefreshCw, 
  UserCheck, 
  Calendar, 
  MessageSquare, 
  Phone, 
  Award, 
  Sparkles,
  Shirt,
  Copy,
  Check,
  ChevronDown,
  LayoutList,
  LayoutGrid,
  X
} from 'lucide-react';
import { RsvpData } from '../types';

interface ConfirmedAttendeesProps {
  appsScriptUrl: string;
  rsvpList: RsvpData[];
  onRefresh?: () => void;
  isRefreshing?: boolean;
  onOpenPassModal?: (attendee: RsvpData) => void;
}

export default function ConfirmedAttendees({ 
  appsScriptUrl, 
  rsvpList, 
  onRefresh, 
  isRefreshing = false,
  onOpenPassModal
}: ConfirmedAttendeesProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'yes' | 'all' | 'no'>('yes');
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'name'>('recent');
  const [viewMode, setViewMode] = useState<'compact' | 'cards'>('compact');
  const [visibleCount, setVisibleCount] = useState<number>(15);
  const [copiedZalo, setCopiedZalo] = useState(false);
  const [viewingMessage, setViewingMessage] = useState<RsvpData | null>(null);

  // Total confirmed
  const confirmedAttendees = useMemo(() => {
    return rsvpList.filter(item => item.status === 'yes');
  }, [rsvpList]);

  // Extract unique groups/tổ
  const availableGroups = useMemo(() => {
    const groups = new Set<string>();
    rsvpList.forEach(item => {
      if (item.className && item.className.trim()) {
        groups.add(item.className.trim());
      }
    });
    return Array.from(groups);
  }, [rsvpList]);

  // Calculate shirt size breakdown for BTC
  const shirtStats = useMemo(() => {
    return rsvpList
      .filter(i => i.status === 'yes' && i.shirtSize)
      .reduce((acc, curr) => {
        const size = curr.shirtSize || 'Khác';
        acc[size] = (acc[size] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
  }, [rsvpList]);

  // Apply filters, search and sort
  const filteredList = useMemo(() => {
    const term = (searchTerm || '').toLowerCase().trim();
    let result = rsvpList.filter(item => {
      // Status filter
      if (statusFilter === 'yes' && item.status !== 'yes') return false;
      if (statusFilter === 'no' && item.status !== 'no') return false;

      // Group filter
      if (selectedGroup !== 'all' && item.className !== selectedGroup) return false;

      // Search term
      if (term) {
        const matchName = (item.fullName || '').toLowerCase().includes(term);
        const matchPhone = (item.phone || '').includes(term);
        const matchClass = (item.className || '').toLowerCase().includes(term);
        const matchMsg = item.message ? item.message.toLowerCase().includes(term) : false;
        return matchName || matchPhone || matchClass || matchMsg;
      }
      return true;
    });

    if (sortBy === 'name') {
      result = [...result].sort((a, b) => (a.fullName || '').localeCompare(b.fullName || '', 'vi'));
    } else {
      result = [...result];
    }

    return result;
  }, [rsvpList, statusFilter, selectedGroup, searchTerm, sortBy]);

  // Displayed slice
  const displayedItems = useMemo(() => {
    return filteredList.slice(0, visibleCount);
  }, [filteredList, visibleCount]);

  const hasMore = visibleCount < filteredList.length;

  const maskPhone = (phone: string) => {
    if (!phone || phone.length < 6) return phone;
    return phone.slice(0, 3) + '••••' + phone.slice(-3);
  };

  // Copy list summary for Zalo group
  const handleCopyZaloSummary = () => {
    const shirtSummaryText = Object.entries(shirtStats)
      .map(([s, c]) => `${s}: ${c}`)
      .join(' | ');

    let text = `🎓 DANH SÁCH XÁC NHẬN HỘI NGỘ 20 NĂM LỚP K8A1 (27/09/2026)\n`;
    text += `📍 Địa điểm: Crown Palace Thái Nguyên\n`;
    text += `✅ Sĩ số có mặt: ${confirmedAttendees.length} bạn\n`;
    if (shirtSummaryText) {
      text += `👕 Tổng hợp áo: ${shirtSummaryText}\n`;
    }
    text += `------------------------------------\n`;
    confirmedAttendees.forEach((att, idx) => {
      const shirt = att.shirtSize ? ` - Size ${att.shirtSize}` : '';
      const to = att.className ? ` (${att.className})` : '';
      text += `${idx + 1}. ${att.fullName}${to}${shirt}\n`;
    });
    text += `------------------------------------\n`;
    text += `👉 Các bạn vào link web để xác nhận tiếp nhé!`;

    navigator.clipboard.writeText(text);
    setCopiedZalo(true);
    setTimeout(() => setCopiedZalo(false), 2500);
  };

  return (
    <div id="confirmed-attendees-module" className="bg-white border border-brand-border rounded-sm p-5 md:p-8 shadow-xs space-y-6">
      
      {/* Module Header */}
      <div className="border-b border-brand-border pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-[0.2em] font-sans font-bold text-brand-gold flex items-center gap-1.5">
            <UserCheck className="w-4 h-4" />
            <span>BẢNG VÀNG ĐIỂM DANH</span>
          </span>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-brand-text mt-1">
            Danh Sách Điểm Danh Thành Viên Lớp K8A1
          </h2>
          <p className="text-xs text-brand-text-muted font-serif italic mt-0.5">
            Tự động đồng bộ từ Google Sheets • Hội ngộ Chủ Nhật, 27/09/2026 tại Crown Palace
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm border border-brand-border bg-[#FAF9F6] text-[10px] uppercase tracking-wider font-sans font-bold text-brand-text hover:bg-brand-gold-light transition-colors cursor-pointer disabled:opacity-50"
              title="Làm mới từ Google Sheets"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-brand-gold ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Đang tải...' : 'Làm mới'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleCopyZaloSummary}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-brand-gold-light text-brand-text text-[10px] uppercase tracking-wider font-sans font-bold hover:bg-brand-gold/30 transition-colors cursor-pointer border border-brand-gold/40"
            title="Sao chép nhanh danh sách để dán vào nhóm Zalo lớp"
          >
            {copiedZalo ? (
              <>
                <Check className="w-3.5 h-3.5 text-green-700" />
                <span className="text-green-700">Đã chép danh sách!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-brand-gold" />
                <span>Chép vào Zalo</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="bg-[#FAF9F6] p-3 sm:p-4 rounded-sm border border-brand-border space-y-1">
          <div className="flex items-center gap-1.5 text-brand-gold text-[10px] font-sans font-bold uppercase tracking-wider">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Có mặt</span>
          </div>
          <div className="text-xl sm:text-2xl font-serif font-bold text-brand-text">
            {confirmedAttendees.length} <span className="text-xs font-sans text-brand-text-muted font-normal">thành viên</span>
          </div>
        </div>

        <div className="bg-[#FAF9F6] p-3 sm:p-4 rounded-sm border border-brand-border space-y-1">
          <div className="flex items-center gap-1.5 text-brand-gold text-[10px] font-sans font-bold uppercase tracking-wider">
            <Award className="w-3.5 h-3.5" />
            <span>Tổng phản hồi</span>
          </div>
          <div className="text-xl sm:text-2xl font-serif font-bold text-brand-text">
            {rsvpList.length} <span className="text-xs font-sans text-brand-text-muted font-normal">bạn</span>
          </div>
        </div>

        <div className="col-span-2 sm:col-span-1 bg-[#FAF9F6] p-3 sm:p-4 rounded-sm border border-brand-border space-y-1">
          <div className="flex items-center gap-1.5 text-brand-gold text-[10px] font-sans font-bold uppercase tracking-wider">
            <Calendar className="w-3.5 h-3.5" />
            <span>Ngày hội ngộ</span>
          </div>
          <div className="text-xs sm:text-sm font-bold font-sans text-brand-text pt-1">
            27/09/2026 • Crown Palace
          </div>
        </div>
      </div>

      {/* Shirt Sizes Summary for BTC */}
      {Object.keys(shirtStats).length > 0 && (
        <div className="bg-[#FAF9F6] border border-brand-border rounded-sm p-3 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 font-sans font-bold text-[10px] uppercase tracking-wider text-brand-text">
            <Shirt className="w-3.5 h-3.5 text-brand-gold" />
            <span>Tổng hợp size áo đồng phục K8A1:</span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {Object.entries(shirtStats).map(([size, count]) => (
              <span
                key={size}
                className="bg-white border border-brand-border px-2 py-0.5 rounded-xs text-[10px] font-sans font-bold text-brand-text"
              >
                Size {size}: <strong className="text-brand-gold">{count}</strong>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Filter and Search Toolbar */}
      <div className="space-y-3 pt-1">
        {/* Status Tabs & View Mode */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex gap-1 bg-[#FAF9F6] p-1 rounded-sm border border-brand-border self-start">
            <button
              type="button"
              onClick={() => { setStatusFilter('yes'); setVisibleCount(15); }}
              className={`px-3 py-1 text-[10px] uppercase font-sans font-bold tracking-wider rounded-xs transition-all cursor-pointer ${
                statusFilter === 'yes' ? 'bg-white text-brand-text shadow-2xs' : 'text-brand-text-muted hover:text-brand-text'
              }`}
            >
              Tham gia ({confirmedAttendees.length})
            </button>
            <button
              type="button"
              onClick={() => { setStatusFilter('all'); setVisibleCount(15); }}
              className={`px-3 py-1 text-[10px] uppercase font-sans font-bold tracking-wider rounded-xs transition-all cursor-pointer ${
                statusFilter === 'all' ? 'bg-white text-brand-text shadow-2xs' : 'text-brand-text-muted hover:text-brand-text'
              }`}
            >
              Tất cả ({rsvpList.length})
            </button>
            <button
              type="button"
              onClick={() => { setStatusFilter('no'); setVisibleCount(15); }}
              className={`px-3 py-1 text-[10px] uppercase font-sans font-bold tracking-wider rounded-xs transition-all cursor-pointer ${
                statusFilter === 'no' ? 'bg-white text-brand-text shadow-2xs' : 'text-brand-text-muted hover:text-brand-text'
              }`}
            >
              Báo vắng ({rsvpList.filter(i => i.status === 'no').length})
            </button>
          </div>

          {/* Group Filter & View Mode Toggle */}
          <div className="flex items-center gap-2">
            {availableGroups.length > 1 && (
              <select
                value={selectedGroup}
                onChange={(e) => { setSelectedGroup(e.target.value); setVisibleCount(15); }}
                className="text-[10px] font-sans font-bold uppercase tracking-wider py-1.5 px-2 bg-white border border-brand-border rounded-xs text-brand-text focus:outline-none focus:border-brand-gold cursor-pointer"
              >
                <option value="all">Tất cả các Tổ</option>
                {availableGroups.map((grp) => (
                  <option key={grp} value={grp}>{grp}</option>
                ))}
              </select>
            )}

            {/* View Mode Toggle */}
            <div className="flex border border-brand-border rounded-xs overflow-hidden bg-white">
              <button
                type="button"
                onClick={() => setViewMode('compact')}
                className={`p-1.5 transition-colors cursor-pointer ${
                  viewMode === 'compact' ? 'bg-brand-gold-light text-brand-gold' : 'text-brand-text-muted hover:text-brand-text'
                }`}
                title="Dạng danh bạ tinh gọn (tiết kiệm chỗ)"
              >
                <LayoutList className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                className={`p-1.5 transition-colors cursor-pointer ${
                  viewMode === 'cards' ? 'bg-brand-gold-light text-brand-gold' : 'text-brand-text-muted hover:text-brand-text'
                }`}
                title="Dạng thẻ trực quan"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Search & Sort Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-brand-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm theo tên bạn bè, số điện thoại, lời nhắn..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setVisibleCount(15); }}
              className="w-full pl-8 pr-3 py-2 border-b border-brand-border bg-transparent text-brand-text text-xs focus:outline-none focus:border-brand-gold placeholder:text-brand-text-muted/50 font-serif"
            />
          </div>

          <div className="flex items-center gap-1.5 self-end sm:self-auto text-[10px] font-sans font-bold uppercase tracking-wider text-brand-text-muted">
            <span>Sắp xếp:</span>
            <button
              type="button"
              onClick={() => setSortBy('recent')}
              className={`px-2 py-0.5 rounded-xs cursor-pointer ${
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
              className={`px-2 py-0.5 rounded-xs cursor-pointer ${
                sortBy === 'name'
                  ? 'bg-brand-text text-white'
                  : 'bg-[#FAF9F6] border border-brand-border hover:text-brand-text'
              }`}
            >
              Tên A-Z
            </button>
          </div>
        </div>
      </div>

      {/* Main List Rendering */}
      {filteredList.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-brand-border rounded-sm bg-[#FAF9F6] text-brand-text-muted text-xs font-serif italic space-y-2">
          <p>Không tìm thấy thành viên nào phù hợp với bộ lọc này.</p>
          <a href="#rsvp-section" className="inline-block text-[10px] font-sans not-italic text-brand-gold font-bold uppercase tracking-wider hover:underline">
            Bạn chưa đăng ký? Hãy bấm vào đây để xác nhận tham dự!
          </a>
        </div>
      ) : viewMode === 'compact' ? (
        /* COMPACT DIRECTORY VIEW (Optimized for 60+ classmates) */
        <div className="border border-brand-border rounded-sm overflow-hidden bg-white shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#FAF9F6] border-b border-brand-border text-[10px] font-sans font-bold uppercase tracking-wider text-brand-text-muted">
                  <th className="py-2.5 px-3 w-12 text-center">STT</th>
                  <th className="py-2.5 px-3">Họ và Tên</th>
                  <th className="py-2.5 px-3 hidden sm:table-cell">Lớp / Tổ</th>
                  <th className="py-2.5 px-3 text-center">Size Áo</th>
                  <th className="py-2.5 px-3 text-center">Trạng Thái</th>
                  <th className="py-2.5 px-3 text-right">Kỷ Niệm</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/60">
                {displayedItems.map((attendee, index) => (
                  <tr 
                    key={attendee.id || `compact-${index}`}
                    className="hover:bg-brand-gold-light/20 transition-colors group"
                  >
                    {/* STT */}
                    <td className="py-2.5 px-3 text-center font-mono text-brand-text-muted text-[11px]">
                      {String(index + 1).padStart(2, '0')}
                    </td>

                    {/* Name & Phone */}
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-brand-gold-light text-brand-gold flex items-center justify-center font-serif text-xs font-bold shrink-0">
                          {attendee.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-serif font-bold text-brand-text text-xs leading-tight">
                            {attendee.fullName}
                          </p>
                          <p className="text-[10px] font-sans text-brand-text-muted/70 sm:hidden">
                            {attendee.className || 'K8A1'}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Class / Group */}
                    <td className="py-2.5 px-3 hidden sm:table-cell">
                      <span className="text-[10px] font-sans font-medium text-brand-text-muted bg-[#FAF9F6] border border-brand-border/60 px-1.5 py-0.5 rounded-xs">
                        {attendee.className || 'K8A1'}
                      </span>
                    </td>

                    {/* Shirt Size */}
                    <td className="py-2.5 px-3 text-center">
                      {attendee.status === 'yes' && attendee.shirtSize ? (
                        <span className="font-sans font-bold text-[10px] px-2 py-0.5 rounded-xs bg-brand-gold/10 text-brand-gold border border-brand-gold/30">
                          {attendee.shirtSize}
                        </span>
                      ) : (
                        <span className="text-brand-text-muted text-[10px]">—</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-2.5 px-3 text-center">
                      {attendee.status === 'yes' ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-sans font-medium px-2 py-0.5 rounded-xs bg-emerald-50 text-emerald-800 border border-emerald-200 whitespace-nowrap">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Có mặt</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-sans font-medium px-2 py-0.5 rounded-xs bg-gray-50 text-gray-600 border border-gray-200 whitespace-nowrap">
                          <span>Vắng</span>
                        </span>
                      )}
                    </td>

                    {/* Message & Pass Button */}
                    <td className="py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {attendee.message && (
                          <button
                            type="button"
                            onClick={() => setViewingMessage(attendee)}
                            className="p-1 rounded-xs hover:bg-brand-gold-light text-brand-gold transition-colors cursor-pointer"
                            title="Xem lời nhắn"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {attendee.status === 'yes' && onOpenPassModal && (
                          <button
                            type="button"
                            onClick={() => onOpenPassModal(attendee)}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-xs border border-brand-border hover:bg-brand-gold-light text-brand-text text-[10px] font-sans font-bold uppercase tracking-wider transition-colors cursor-pointer"
                            title="Xem Thẻ Học Sinh"
                          >
                            <Award className="w-3 h-3 text-brand-gold" />
                            <span className="hidden md:inline">Thẻ</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* CARD GRID VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {displayedItems.map((attendee, index) => (
            <div
              key={attendee.id || `card-${index}`}
              className="p-4 rounded-sm border border-brand-border bg-white shadow-2xs space-y-3 relative group hover:border-brand-gold transition-colors flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-brand-gold-light text-brand-gold flex items-center justify-center font-serif text-xs font-bold shrink-0">
                      {attendee.fullName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-brand-text font-serif">
                        {attendee.fullName}
                      </h4>
                      <p className="text-[10px] text-brand-text-muted font-sans">
                        {attendee.className || 'K8A1'} • {maskPhone(attendee.phone)}
                      </p>
                    </div>
                  </div>

                  <span className={`inline-flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded-xs font-sans font-bold uppercase tracking-wider ${
                    attendee.status === 'yes'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-gray-50 text-gray-600 border border-gray-200'
                  }`}>
                    {attendee.status === 'yes' ? 'Có mặt' : 'Vắng'}
                  </span>
                </div>

                {attendee.status === 'yes' && attendee.shirtSize && (
                  <div className="inline-flex items-center gap-1 text-[10px] font-sans text-brand-text-muted bg-[#FAF9F6] px-2 py-0.5 rounded-xs border border-brand-border/60">
                    <Shirt className="w-3 h-3 text-brand-gold" />
                    <span>Áo: <strong>Size {attendee.shirtSize}</strong></span>
                  </div>
                )}

                {attendee.message && (
                  <p className="text-[11px] text-brand-text-muted font-serif italic leading-relaxed pl-2 border-l border-brand-gold/40 line-clamp-2">
                    "{attendee.message}"
                  </p>
                )}
              </div>

              {attendee.status === 'yes' && onOpenPassModal && (
                <div className="pt-2 border-t border-brand-border/30 flex justify-end">
                  <button
                    type="button"
                    onClick={() => onOpenPassModal(attendee)}
                    className="inline-flex items-center gap-1 text-[10px] text-brand-gold hover:underline font-sans font-bold cursor-pointer"
                  >
                    <Award className="w-3 h-3" />
                    <span>Xem Thẻ Học Sinh 🎓</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination / Load More Bar */}
      <div className="pt-2 border-t border-brand-border/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <p className="text-brand-text-muted text-[11px] font-serif italic">
          Đang hiển thị <strong>{Math.min(visibleCount, filteredList.length)}</strong> / <strong>{filteredList.length}</strong> thành viên
        </p>

        <div className="flex items-center gap-2">
          {hasMore && (
            <button
              type="button"
              onClick={() => setVisibleCount(prev => prev + 20)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-sm bg-[#FAF9F6] hover:bg-brand-gold-light border border-brand-border text-brand-text text-[10px] font-sans font-bold uppercase tracking-wider transition-colors cursor-pointer"
            >
              <ChevronDown className="w-3 h-3 text-brand-gold" />
              <span>Xem thêm 20 bạn</span>
            </button>
          )}

          {hasMore && (
            <button
              type="button"
              onClick={() => setVisibleCount(filteredList.length)}
              className="px-3 py-1.5 rounded-sm bg-brand-text hover:bg-brand-gold text-white text-[10px] font-sans font-bold uppercase tracking-wider transition-colors cursor-pointer"
            >
              Hiện tất cả ({filteredList.length})
            </button>
          )}

          {!hasMore && filteredList.length > 15 && (
            <button
              type="button"
              onClick={() => setVisibleCount(15)}
              className="px-3 py-1.5 rounded-sm bg-[#FAF9F6] hover:bg-brand-border/40 border border-brand-border text-brand-text-muted text-[10px] font-sans font-bold uppercase tracking-wider transition-colors cursor-pointer"
            >
              Thu gọn lại
            </button>
          )}
        </div>
      </div>

      {/* Modal View Message */}
      {viewingMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-2xs animate-fadeIn">
          <div className="relative w-full max-w-md bg-white rounded-md shadow-xl border border-brand-border p-6 space-y-4">
            <div className="flex items-start justify-between border-b border-brand-border pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-brand-gold-light text-brand-gold flex items-center justify-center font-serif text-sm font-bold">
                  {viewingMessage.fullName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-serif font-bold text-sm text-brand-text">
                    {viewingMessage.fullName}
                  </h4>
                  <p className="text-[10px] font-sans text-brand-text-muted">
                    {viewingMessage.className || 'K8A1'} • Niên khóa 2003 - 2006
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewingMessage(null)}
                className="text-brand-text-muted hover:text-brand-text p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 py-2">
              <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-brand-gold">
                Lời nhắn gửi bạn bè Lớp K8A1:
              </span>
              <p className="font-serif italic text-sm text-brand-text leading-relaxed bg-[#FAF9F6] p-4 rounded-sm border border-brand-border">
                "{viewingMessage.message}"
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setViewingMessage(null)}
                className="px-4 py-1.5 rounded-sm bg-brand-text text-white text-xs font-sans font-bold uppercase tracking-wider cursor-pointer hover:bg-brand-gold transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer prompt */}
      <div className="p-3 bg-[#FAF9F6] border border-brand-border rounded-sm text-[11px] text-brand-text-muted font-serif italic flex items-center justify-between">
        <span>
          💡 Danh sách cập nhật tự động. Các bạn có thể lọc theo Tổ hoặc tìm nhanh tên mình.
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
