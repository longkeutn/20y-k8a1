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
  X,
  Coins,
  Camera,
  ArrowUp,
  AlertTriangle,
  Info,
  ChevronUp
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { RsvpData, EventConfig } from '../types';
import { normalizeShirtSize, SHIRT_SIZE_OPTIONS } from '../data';

interface ConfirmedAttendeesProps {
  appsScriptUrl: string;
  rsvpList: RsvpData[];
  eventConfig?: EventConfig;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  onOpenPassModal?: (attendee: RsvpData) => void;
  onOpenReceiptModal?: (attendee: RsvpData) => void;
}

export default function ConfirmedAttendees({ 
  appsScriptUrl, 
  rsvpList, 
  eventConfig,
  onRefresh, 
  isRefreshing = false,
  onOpenPassModal,
  onOpenReceiptModal
}: ConfirmedAttendeesProps) {
  const standardFundAmount = Number(eventConfig?.fundAmountPerPerson) || 700000;
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'yes' | 'all' | 'no'>('yes');
  const [sortBy, setSortBy] = useState<'recent' | 'name'>('recent');
  const [viewMode, setViewMode] = useState<'compact' | 'cards'>('compact');
  const [visibleCount, setVisibleCount] = useState<number>(15);
  const [copiedZalo, setCopiedZalo] = useState(false);
  const [viewingMessage, setViewingMessage] = useState<RsvpData | null>(null);

  // Shirt Size Filter & Guide States
  const [selectedShirtFilter, setSelectedShirtFilter] = useState<string | null>(null);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [copiedShirtSummary, setCopiedShirtSummary] = useState(false);

  // Total confirmed
  const confirmedAttendees = useMemo(() => {
    return rsvpList.filter(item => item.status === 'yes');
  }, [rsvpList]);

  // Calculate shirt size breakdown for BTC
  const shirtStats = useMemo(() => {
    return rsvpList
      .filter(i => i.status === 'yes' && normalizeShirtSize(i.shirtSize))
      .reduce((acc, curr) => {
        const size = normalizeShirtSize(curr.shirtSize);
        if (size) {
          acc[size] = (acc[size] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);
  }, [rsvpList]);

  // Thành viên có mặt chưa chọn size áo
  const confirmedWithoutShirt = useMemo(() => {
    return confirmedAttendees.filter(i => !normalizeShirtSize(i.shirtSize));
  }, [confirmedAttendees]);

  // Tổng số lượng áo đã chọn size
  const totalShirtsRegistered = useMemo(() => {
    return Object.values(shirtStats).reduce((a, b) => a + b, 0);
  }, [shirtStats]);

  // Apply filters, search and sort
  const filteredList = useMemo(() => {
    const term = (searchTerm || '').toLowerCase().trim();
    let result = rsvpList.filter(item => {
      // Status filter
      if (statusFilter === 'yes' && item.status !== 'yes') return false;
      if (statusFilter === 'no' && item.status !== 'no') return false;

      // Shirt size filter
      if (selectedShirtFilter) {
        if (selectedShirtFilter === 'none') {
          // Chưa chọn size (thành viên có mặt nhưng chưa đăng ký cỡ áo)
          if (item.status !== 'yes' || Boolean(normalizeShirtSize(item.shirtSize))) return false;
        } else {
          if (normalizeShirtSize(item.shirtSize) !== selectedShirtFilter) return false;
        }
      }

      // Search term
      if (term) {
        const matchName = String(item.fullName || '').toLowerCase().includes(term);
        const matchNick = String(item.nickname || '').toLowerCase().includes(term);
        const matchPhone = String(item.phone || '').includes(term);
        const matchMsg = item.message ? String(item.message).toLowerCase().includes(term) : false;
        return matchName || matchNick || matchPhone || matchMsg;
      }
      return true;
    });

    if (sortBy === 'name') {
      result = [...result].sort((a, b) => String(a.fullName || '').localeCompare(String(b.fullName || ''), 'vi'));
    } else {
      result = [...result];
    }

    return result;
  }, [rsvpList, statusFilter, selectedShirtFilter, searchTerm, sortBy]);

  // Displayed slice
  const displayedItems = useMemo(() => {
    return filteredList.slice(0, visibleCount);
  }, [filteredList, visibleCount]);

  const hasMore = visibleCount < filteredList.length;

  const maskPhone = (phone?: any) => {
    const pStr = String(phone || '');
    if (!pStr || pStr.length < 6) return pStr;
    return pStr.slice(0, 3) + '••••' + pStr.slice(-3);
  };

  // Copy structured shirt order summary for tailoring workshop via Zalo
  const handleCopyShirtSummary = () => {
    const lines = [
      '📋 TỔNG HỢP ĐƠN ĐẶT MAY ÁO POLO ĐỒNG PHỤC K8A1 (20 NĂM)',
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
      `📅 Sự kiện: ${eventConfig?.eventDateText || 'Hội khóa 20 Năm K8A1'}`,
      `👕 Tổng áo đã chốt size: ${totalShirtsRegistered} áo / ${confirmedAttendees.length} bạn có mặt`,
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
      `• Size S   (35 - 45kg): ${shirtStats['S'] || 0} áo`,
      `• Size M   (45 - 55kg): ${shirtStats['M'] || 0} áo`,
      `• Size L   (55 - 65kg): ${shirtStats['L'] || 0} áo`,
      `• Size XL  (65 - 75kg): ${shirtStats['XL'] || 0} áo`,
      `• Size 2XL (75 - 85kg): ${shirtStats['XXL'] || 0} áo`,
      `• Size 3XL (85 - 95kg): ${shirtStats['XXXL'] || 0} áo`,
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
    ];

    if (confirmedWithoutShirt.length > 0) {
      lines.push(`⚠️ Có ${confirmedWithoutShirt.length} bạn có mặt chưa chọn size áo:`);
      const names = confirmedWithoutShirt.map(a => a.fullName).slice(0, 15).join(', ');
      lines.push(`   ${names}${confirmedWithoutShirt.length > 15 ? ` và ${confirmedWithoutShirt.length - 15} bạn khác...` : ''}`);
      lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    }

    lines.push('✨ Trích xuất tự động từ Webapp K8A1 THPT Thái Nguyên');

    const text = lines.join('\n');
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
    }
    setCopiedShirtSummary(true);
    try {
      confetti({ particleCount: 35, spread: 60, origin: { y: 0.6 } });
    } catch (e) {}
    setTimeout(() => setCopiedShirtSummary(false), 3000);
  };

  // Copy list summary for Zalo group
  const handleCopyZaloSummary = () => {
    const shirtSummaryText = Object.entries(shirtStats)
      .map(([s, c]) => `${s}: ${c}`)
      .join(' | ');

    let text = `🎓 DANH SÁCH XÁC NHẬN HỘI NGỘ 20 NĂM LỚP K8A1\n`;
    if (eventConfig?.eventDateText) text += `⏰ Thời gian: ${eventConfig.eventDateText}\n`;
    if (eventConfig?.venueName) text += `📍 Địa điểm: ${eventConfig.venueName}\n`;
    text += `✅ Sĩ số có mặt: ${confirmedAttendees.length} bạn\n`;
    if (shirtSummaryText) {
      text += `👕 Tổng hợp áo: ${shirtSummaryText}\n`;
    }
    text += `------------------------------------\n`;
    confirmedAttendees.forEach((att, idx) => {
      const nick = att.nickname ? ` ("${att.nickname}")` : '';
      const shirt = normalizeShirtSize(att.shirtSize) ? ` - Size ${normalizeShirtSize(att.shirtSize)}` : '';
      text += `${idx + 1}. ${att.fullName}${nick}${shirt}\n`;
    });
    text += `------------------------------------\n`;
    text += `👉 Các bạn vào link web để xác nhận tiếp nhé!`;

    navigator.clipboard.writeText(text);
    setCopiedZalo(true);
    setTimeout(() => setCopiedZalo(false), 2500);
  };

  return (
    <div id="confirmed-attendees-module" className="bg-[#FAF7F2] border border-amber-200/90 rounded-2xl p-4 sm:p-6 shadow-md space-y-4 text-left relative overflow-hidden">
      
      {/* HEADER BẢNG VÀNG ĐIỂM DANH */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-amber-200/80 pb-3.5 gap-3">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-1.5 text-amber-800">
            <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span className="text-[11px] uppercase tracking-widest font-sans font-bold block">
              Bảng Vàng Điểm Danh Thành Viên
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#1E293B] tracking-tight">
            Danh Sách Điểm Danh Lớp K8A1
          </h2>
          <p className="text-xs text-slate-500 font-serif italic">
            Hội ngộ 20 Năm Lớp K8A1 • Cập nhật tự động
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap shrink-0 self-start sm:self-auto">
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300/90 bg-white text-xs font-sans font-bold uppercase tracking-wider text-slate-700 hover:bg-amber-50 transition cursor-pointer disabled:opacity-50 shadow-2xs"
              title="Làm mới danh sách"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-amber-600 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Đang tải...' : 'Làm mới'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleCopyZaloSummary}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white text-xs font-sans font-bold uppercase tracking-wider shadow-sm hover:shadow transition cursor-pointer"
            title="Sao chép nhanh danh sách để dán vào nhóm Zalo lớp"
          >
            {copiedZalo ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedZalo ? 'Đã chép!' : 'Chép vào Zalo'}</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3.5">
        <div className="bg-white/90 p-3 sm:p-4 rounded-xl border border-amber-200/90 shadow-2xs space-y-1">
          <div className="flex items-center gap-1.5 text-emerald-700 text-[11px] font-sans font-bold uppercase tracking-wider">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Có mặt</span>
          </div>
          <div className="text-xl sm:text-2xl font-serif font-bold text-slate-900">
            {confirmedAttendees.length} <span className="text-xs font-sans text-slate-500 font-normal">thành viên</span>
          </div>
        </div>

        <div className="bg-white/90 p-3 sm:p-4 rounded-xl border border-amber-200/90 shadow-2xs space-y-1">
          <div className="flex items-center gap-1.5 text-amber-800 text-[11px] font-sans font-bold uppercase tracking-wider">
            <Users className="w-4 h-4 text-amber-600" />
            <span>Tổng phản hồi</span>
          </div>
          <div className="text-xl sm:text-2xl font-serif font-bold text-slate-900">
            {rsvpList.length} <span className="text-xs font-sans text-slate-500 font-normal">bạn</span>
          </div>
        </div>

        <div className="col-span-2 sm:col-span-1 bg-white/90 p-3 sm:p-4 rounded-xl border border-amber-200/90 shadow-2xs space-y-1">
          <div className="flex items-center gap-1.5 text-amber-800 text-[11px] font-sans font-bold uppercase tracking-wider">
            <Calendar className="w-4 h-4 text-amber-600" />
            <span>Ngày hội ngộ</span>
          </div>
          <div className="text-xs sm:text-sm font-bold font-sans text-slate-900 pt-0.5 truncate" title={eventConfig?.eventDateText || "Ngày hội ngộ"}>
            {eventConfig?.eventDateText || "Ngày hội ngộ"}
          </div>
        </div>
      </div>

      {/* Khối Tổng Hợp Size Áo Đồng Phục Polo K8A1 Chuyên Nghiệp (Showcase Card) */}
      <div className="relative overflow-hidden rounded-2xl border-2 border-amber-400/90 bg-gradient-to-br from-amber-500/10 via-[#FFFDF9] to-amber-100/40 p-3.5 sm:p-5 shadow-sm space-y-3.5">
        {/* Decorative Background Watermark */}
        <div className="absolute -right-6 -bottom-6 text-amber-500/[0.06] pointer-events-none select-none transform -rotate-12">
          <Shirt className="w-40 h-40" />
        </div>

        {/* Card Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 text-white flex items-center justify-center shadow-md shrink-0 ring-2 ring-amber-300/60">
              <Shirt className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm sm:text-base font-serif font-bold text-slate-900 tracking-tight">
                  TỔNG HỢP SIZE ÁO ĐỒNG PHỤC POLO K8A1
                </h3>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-sans font-bold">
                  <Sparkles className="w-2.5 h-2.5 text-amber-600" />
                  Kỷ niệm 20 Năm
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-600 pt-0.5 font-sans">
                <span>
                  Đã chốt: <strong className="text-amber-900 font-bold">{totalShirtsRegistered}</strong> / {confirmedAttendees.length} áo ({confirmedAttendees.length > 0 ? Math.round((totalShirtsRegistered / confirmedAttendees.length) * 100) : 0}%)
                </span>
                {confirmedWithoutShirt.length > 0 && (
                  <span className="inline-flex items-center gap-1 text-rose-700 font-bold text-[11px] bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200">
                    <AlertTriangle className="w-3 h-3 text-rose-500" />
                    Còn {confirmedWithoutShirt.length} bạn chưa chọn size
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            {/* Toggle Size Guide Button */}
            <button
              type="button"
              onClick={() => setShowSizeGuide(!showSizeGuide)}
              className={`inline-flex items-center gap-1.5 text-xs font-sans font-bold px-3 py-1.5 rounded-xl border transition-all cursor-pointer shadow-2xs ${
                showSizeGuide
                  ? 'bg-amber-100 text-amber-950 border-amber-400'
                  : 'bg-white hover:bg-amber-50 text-slate-700 hover:text-amber-900 border-amber-200/90'
              }`}
              title="Xem bảng thông số chiều cao, cân nặng và kích thước xưởng may"
            >
              <Info className="w-3.5 h-3.5 text-amber-600" />
              <span>Bảng cỡ áo</span>
              {showSizeGuide ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {/* Copy Shirt Summary Button */}
            <button
              type="button"
              onClick={handleCopyShirtSummary}
              className={`inline-flex items-center gap-1.5 text-xs font-sans font-bold px-3 py-1.5 rounded-xl border transition-all cursor-pointer shadow-2xs ${
                copiedShirtSummary
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white border-amber-600'
              }`}
              title="Sao chép toàn bộ danh sách số lượng size áo để gửi xưởng may qua Zalo"
            >
              {copiedShirtSummary ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Đã chép đơn!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Chép đơn may</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Interactive Size Grid (Click to filter list below) */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-2 pt-1 relative z-10">
          {[
            { key: 'S', label: 'Size S', weight: '35 - 45kg', chest: '41cm', length: '55cm', shoulder: '35cm' },
            { key: 'M', label: 'Size M', weight: '45 - 55kg', chest: '44cm', length: '59cm', shoulder: '37cm' },
            { key: 'L', label: 'Size L', weight: '55 - 65kg', chest: '47cm', length: '63cm', shoulder: '39cm' },
            { key: 'XL', label: 'Size XL', weight: '65 - 75kg', chest: '49cm', length: '67cm', shoulder: '41cm' },
            { key: 'XXL', label: 'Size 2XL', weight: '75 - 85kg', chest: '51cm', length: '70cm', shoulder: '43cm' },
            { key: 'XXXL', label: 'Size 3XL', weight: '85 - 95kg', chest: '53cm', length: '73cm', shoulder: '45cm' },
          ].map((item) => {
            const count = shirtStats[item.key] || 0;
            const isSelected = selectedShirtFilter === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => {
                  if (isSelected) {
                    setSelectedShirtFilter(null);
                  } else {
                    setSelectedShirtFilter(item.key);
                    if (statusFilter === 'no') setStatusFilter('yes');
                    setVisibleCount(15);
                  }
                }}
                className={`relative p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-between group ${
                  isSelected
                    ? 'bg-gradient-to-b from-amber-500 to-amber-600 text-white border-amber-600 shadow-md ring-2 ring-amber-400 ring-offset-1 scale-[1.02]'
                    : count > 0
                    ? 'bg-white/95 hover:bg-amber-50/80 border-amber-200/90 hover:border-amber-400 text-slate-800 shadow-2xs hover:shadow-xs'
                    : 'bg-white/60 border-slate-200 text-slate-400 hover:border-amber-300'
                }`}
                title={`Bấm để ${isSelected ? 'bỏ lọc' : `lọc danh sách thành viên đăng ký ${item.label}`}`}
              >
                <div className="w-full flex items-center justify-between gap-1 text-[11px] font-bold">
                  <span className={`font-serif tracking-tight ${isSelected ? 'text-amber-100' : 'text-amber-900'}`}>
                    {item.label}
                  </span>
                  {isSelected && (
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                  )}
                </div>

                <div className="my-1 flex items-baseline justify-center">
                  <span className={`text-xl sm:text-2xl font-serif font-black tracking-tight ${
                    isSelected ? 'text-white' : count > 0 ? 'text-amber-950' : 'text-slate-400'
                  }`}>
                    {count}
                  </span>
                  <span className={`text-[10px] font-sans ml-0.5 ${isSelected ? 'text-amber-100' : 'text-slate-500'}`}>
                    áo
                  </span>
                </div>

                <div className={`text-[10px] font-sans truncate w-full ${
                  isSelected ? 'text-amber-100' : 'text-slate-500'
                }`}>
                  {item.weight}
                </div>
              </button>
            );
          })}

          {/* Tile 7: Chưa chọn size */}
          {(() => {
            const count = confirmedWithoutShirt.length;
            const isSelected = selectedShirtFilter === 'none';
            return (
              <button
                type="button"
                onClick={() => {
                  if (isSelected) {
                    setSelectedShirtFilter(null);
                  } else {
                    setSelectedShirtFilter('none');
                    if (statusFilter === 'no') setStatusFilter('yes');
                    setVisibleCount(15);
                  }
                }}
                className={`relative p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-between group ${
                  isSelected
                    ? 'bg-gradient-to-b from-rose-500 to-rose-600 text-white border-rose-600 shadow-md ring-2 ring-rose-400 ring-offset-1 scale-[1.02]'
                    : count > 0
                    ? 'bg-rose-50/70 hover:bg-rose-100/80 border-rose-200/90 hover:border-rose-400 text-rose-900 shadow-2xs hover:shadow-xs'
                    : 'bg-emerald-50/60 border-emerald-200 text-emerald-800'
                }`}
                title={count > 0 ? `Bấm để ${isSelected ? 'bỏ lọc' : `lọc ${count} bạn có mặt chưa chọn size`}` : 'Tất cả các bạn có mặt đều đã chọn size'}
              >
                <div className="w-full flex items-center justify-between gap-1 text-[11px] font-bold">
                  <span className={`truncate ${isSelected ? 'text-rose-100' : count > 0 ? 'text-rose-800' : 'text-emerald-800'}`}>
                    {count > 0 ? 'Chưa chọn' : 'Đã chọn đủ'}
                  </span>
                  {count > 0 && !isSelected && (
                    <AlertTriangle className="w-3 h-3 text-rose-500 shrink-0" />
                  )}
                </div>

                <div className="my-1 flex items-baseline justify-center">
                  <span className={`text-xl sm:text-2xl font-serif font-black tracking-tight ${
                    isSelected ? 'text-white' : count > 0 ? 'text-rose-700' : 'text-emerald-700'
                  }`}>
                    {count}
                  </span>
                  <span className={`text-[10px] font-sans ml-0.5 ${isSelected ? 'text-rose-100' : 'text-slate-500'}`}>
                    bạn
                  </span>
                </div>

                <div className={`text-[10px] font-sans truncate w-full ${
                  isSelected ? 'text-rose-100' : count > 0 ? 'text-rose-600 font-semibold' : 'text-emerald-600'
                }`}>
                  {count > 0 ? 'Cần nhắc chọn' : '100% hoàn thành'}
                </div>
              </button>
            );
          })()}
        </div>

        {/* Collapsible Size Guide Table */}
        {showSizeGuide && (
          <div className="mt-3 bg-white/95 rounded-xl border border-amber-200/90 p-3 sm:p-4 shadow-sm space-y-2.5 relative z-10">
            <div className="flex items-center justify-between border-b border-amber-100 pb-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 font-sans uppercase tracking-wider">
                <Info className="w-4 h-4 text-amber-600" />
                <span>Bảng quy đổi thông số may áo Polo K8A1 (Form Regular-Fit)</span>
              </div>
              <button
                type="button"
                onClick={() => setShowSizeGuide(false)}
                className="text-slate-400 hover:text-slate-600 text-xs cursor-pointer p-1"
                title="Đóng bảng thông số"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse font-sans">
                <thead>
                  <tr className="bg-amber-50/70 text-amber-950 font-bold border-b border-amber-200/80">
                    <th className="py-2 px-2.5 text-center">Cỡ áo</th>
                    <th className="py-2 px-2.5">Cân nặng đề xuất</th>
                    <th className="py-2 px-2.5 text-center">Rộng ngực</th>
                    <th className="py-2 px-2.5 text-center">Dài áo</th>
                    <th className="py-2 px-2.5 text-center">Rộng vai</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-100 text-slate-800">
                  {[
                    { key: 'S', label: 'Size S', weight: '35 - 45kg', chest: '41cm', length: '55cm', shoulder: '35cm' },
                    { key: 'M', label: 'Size M', weight: '45 - 55kg', chest: '44cm', length: '59cm', shoulder: '37cm' },
                    { key: 'L', label: 'Size L', weight: '55 - 65kg', chest: '47cm', length: '63cm', shoulder: '39cm' },
                    { key: 'XL', label: 'Size XL', weight: '65 - 75kg', chest: '49cm', length: '67cm', shoulder: '41cm' },
                    { key: 'XXL', label: 'Size 2XL (XXL)', weight: '75 - 85kg', chest: '51cm', length: '70cm', shoulder: '43cm' },
                    { key: 'XXXL', label: 'Size 3XL (XXXL)', weight: '85 - 95kg', chest: '53cm', length: '73cm', shoulder: '45cm' },
                  ].map((item) => (
                    <tr 
                      key={item.key} 
                      className={`hover:bg-amber-50/40 transition-colors ${selectedShirtFilter === item.key ? 'bg-amber-100/60 font-semibold' : ''}`}
                    >
                      <td className="py-2 px-2.5 text-center font-bold text-amber-900">
                        {item.label}
                      </td>
                      <td className="py-2 px-2.5 font-medium">{item.weight}</td>
                      <td className="py-2 px-2.5 text-center text-slate-600">{item.chest}</td>
                      <td className="py-2 px-2.5 text-center text-slate-600">{item.length}</td>
                      <td className="py-2 px-2.5 text-center text-slate-600">{item.shoulder}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="text-[11px] text-slate-600 bg-amber-50/50 p-2.5 rounded-lg border border-amber-200/50 space-y-1 font-sans">
              <p className="flex items-start gap-1">
                <span className="text-amber-700 font-bold">💡 Gợi ý chọn cỡ:</span>
                <span>Áo polo form regular-fit thoải mái, chất vải thun cá sấu 4 chiều co giãn tốt, thoáng khí.</span>
              </p>
              <p className="text-slate-500 pl-4">
                • Nếu chiều cao hoặc cân nặng nằm ở ranh giới giữa 2 size, Ban Liên Lạc khuyên bạn nên chọn <strong>size lớn hơn</strong> để mặc cử động thoải mái nhất trong ngày hội ngộ.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Filter Active Alert / Clear Filter */}
      {selectedShirtFilter && (
        <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-amber-100/90 border border-amber-300 text-amber-950 text-xs shadow-2xs animate-fadeIn">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-600 animate-ping" />
            <span className="font-sans">
              Đang lọc danh sách: <strong className="font-bold text-amber-900">{selectedShirtFilter === 'none' ? 'Các bạn chưa chọn size áo' : `Size ${selectedShirtFilter === 'XXL' ? '2XL (XXL)' : selectedShirtFilter === 'XXXL' ? '3XL (XXXL)' : selectedShirtFilter}`}</strong> ({filteredList.length} thành viên)
            </span>
          </div>
          <button
            type="button"
            onClick={() => setSelectedShirtFilter(null)}
            className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-900 bg-white hover:bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-300 transition cursor-pointer shadow-2xs"
          >
            <X className="w-3 h-3" />
            <span>Xem tất cả</span>
          </button>
        </div>
      )}

      {/* Filter and Search Toolbar */}
      <div className="space-y-2.5 pt-1">
        {/* Status Tabs & View Mode */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          {/* Status Tabs */}
          <div className="grid grid-cols-3 gap-1 bg-[#FAF8F5] p-1 rounded-xl border border-amber-200/90 w-full sm:w-auto shadow-2xs">
            <button
              type="button"
              onClick={() => { setStatusFilter('yes'); setVisibleCount(15); }}
              className={`px-2.5 py-1.5 text-center text-[11px] font-sans font-bold tracking-wide rounded-lg transition-all cursor-pointer ${
                statusFilter === 'yes' ? 'bg-white text-amber-950 shadow-2xs border border-amber-200/60' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Có mặt ({confirmedAttendees.length})
            </button>
            <button
              type="button"
              onClick={() => { setStatusFilter('all'); setVisibleCount(15); }}
              className={`px-2.5 py-1.5 text-center text-[11px] font-sans font-bold tracking-wide rounded-lg transition-all cursor-pointer ${
                statusFilter === 'all' ? 'bg-white text-amber-950 shadow-2xs border border-amber-200/60' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tất cả ({rsvpList.length})
            </button>
            <button
              type="button"
              onClick={() => { setStatusFilter('no'); setSelectedShirtFilter(null); setVisibleCount(15); }}
              className={`px-2.5 py-1.5 text-center text-[11px] font-sans font-bold tracking-wide rounded-lg transition-all cursor-pointer ${
                statusFilter === 'no' ? 'bg-white text-slate-900 shadow-2xs border border-slate-200' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Báo vắng ({rsvpList.filter(i => i.status === 'no').length})
            </button>
          </div>

          {/* View Mode Toggle */}
          <div className="flex border border-amber-300/80 rounded-xl overflow-hidden bg-white self-end sm:self-auto shadow-2xs p-0.5">
            <button
              type="button"
              onClick={() => setViewMode('compact')}
              className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1 text-[11px] font-bold transition-colors cursor-pointer ${
                viewMode === 'compact' ? 'bg-amber-100 text-amber-950 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Dạng danh bạ tinh gọn"
            >
              <LayoutList className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Danh bạ</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1 text-[11px] font-bold transition-colors cursor-pointer ${
                viewMode === 'cards' ? 'bg-amber-100 text-amber-950 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Dạng thẻ trực quan"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Thẻ ảnh</span>
            </button>
          </div>
        </div>

        {/* Search & Sort Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm theo tên bạn bè, biệt danh, SĐT..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setVisibleCount(15); }}
              className="w-full pl-9 pr-8 py-2 bg-white border border-amber-200/90 rounded-xl text-xs sm:text-[13px] text-slate-800 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-400/40 placeholder:text-slate-400 font-sans shadow-2xs"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 rounded-full cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 self-end sm:self-auto text-[11px] font-sans font-bold text-slate-600 shrink-0">
            <span className="text-slate-500">Sắp xếp:</span>
            <button
              type="button"
              onClick={() => setSortBy('recent')}
              className={`px-2.5 py-1 rounded-lg text-xs cursor-pointer transition-all ${
                sortBy === 'recent'
                  ? 'bg-amber-700 text-white font-bold shadow-2xs'
                  : 'bg-white border border-amber-200/90 text-slate-700 hover:bg-amber-50'
              }`}
            >
              Mới nhất
            </button>
            <button
              type="button"
              onClick={() => setSortBy('name')}
              className={`px-2.5 py-1 rounded-lg text-xs cursor-pointer transition-all ${
                sortBy === 'name'
                  ? 'bg-amber-700 text-white font-bold shadow-2xs'
                  : 'bg-white border border-amber-200/90 text-slate-700 hover:bg-amber-50'
              }`}
            >
              Tên A-Z
            </button>
          </div>
        </div>
      </div>

      {/* Main List Rendering */}
      {filteredList.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-amber-300/80 rounded-xl bg-[#FAF8F5] text-slate-500 text-xs font-serif italic space-y-2.5">
          <p>Không tìm thấy thành viên nào phù hợp với từ khóa này.</p>
          <a href="#rsvp-form-card" className="inline-block text-xs font-sans not-italic text-amber-800 font-bold uppercase tracking-wider hover:underline">
            Bạn chưa đăng ký? Bấm vào đây để điểm danh ngay!
          </a>
        </div>
      ) : viewMode === 'compact' ? (
        <>
          {/* DESKTOP TABLE VIEW (Screens >= md) */}
          <div className="hidden md:block border border-amber-200/90 rounded-xl overflow-hidden bg-white shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#FAF8F5] border-b border-amber-200/80 text-[10px] font-sans font-bold uppercase tracking-wider text-amber-900">
                    <th className="py-3 px-3.5 w-12 text-center">STT</th>
                    <th className="py-3 px-3.5">Họ và Tên Thành Viên</th>
                    <th className="py-3 px-3 text-center">Size Áo</th>
                    <th className="py-3 px-3 text-center">Tham Gia</th>
                    <th className="py-3 px-3 text-center">Quỹ 20 Năm</th>
                    <th className="py-3 px-3.5 text-right">Kỷ Niệm</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {displayedItems.map((attendee, index) => (
                    <tr 
                      key={attendee.id || `compact-${index}`}
                      className="hover:bg-amber-50/40 transition-colors group"
                    >
                      {/* STT */}
                      <td className="py-3 px-3.5 text-center font-mono text-slate-400 text-[11px]">
                        {String(index + 1).padStart(2, '0')}
                      </td>

                      {/* Name & Nickname */}
                      <td className="py-3 px-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 text-white flex items-center justify-center font-serif text-xs font-bold shrink-0 shadow-2xs">
                            {attendee.fullName.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex flex-wrap items-baseline gap-1.5">
                            <span className="font-serif font-bold text-slate-900 text-sm leading-tight">
                              {attendee.fullName}
                            </span>
                            {attendee.nickname && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-200/80 text-[10px] font-sans font-bold italic" title="Biệt danh thời cấp 3">
                                "{attendee.nickname}"
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Shirt Size - Cho phép bấm để đổi size nhanh */}
                      <td className="py-3 px-3 text-center">
                        {attendee.status === 'yes' && normalizeShirtSize(attendee.shirtSize) ? (
                          <button
                            type="button"
                            onClick={() => {
                              window.dispatchEvent(new CustomEvent('update-member-shirt-size', { 
                                detail: { memberId: attendee.memberId, fullName: attendee.fullName } 
                              }));
                            }}
                            className="font-sans font-bold text-[10px] px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200/80 hover:bg-amber-100 hover:border-amber-400 transition cursor-pointer inline-flex items-center gap-1 group/size"
                            title="Bấm vào đây nếu bạn muốn đổi cỡ áo polo khác"
                          >
                            <span>Size {normalizeShirtSize(attendee.shirtSize)}</span>
                            <span className="text-[9px] text-amber-600 opacity-60 group-hover/size:opacity-100">✏️</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              window.dispatchEvent(new CustomEvent('update-member-shirt-size', { 
                                detail: { memberId: attendee.memberId, fullName: attendee.fullName } 
                              }));
                            }}
                            className="text-amber-800 hover:underline text-[10px] cursor-pointer"
                            title="Bấm để chọn size áo"
                          >
                            + Chọn size
                          </button>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3 text-center">
                        {attendee.status === 'yes' ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-sans font-bold px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 whitespace-nowrap">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Có mặt</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-sans font-medium px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200 whitespace-nowrap">
                            <span>Vắng</span>
                          </span>
                        )}
                      </td>

                      {/* Fund Status Badge */}
                      <td className="py-3 px-3 text-center">
                        {attendee.status === 'yes' ? (
                          attendee.fundStatus === 'paid' ? (
                            <span 
                              className="inline-flex items-center gap-1 text-[10px] font-sans font-bold px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-300 whitespace-nowrap" 
                              title={attendee.fundAmount ? `Đã nộp ${attendee.fundAmount.toLocaleString('vi-VN')}đ` : `Đã nộp quỹ tạm ứng ${standardFundAmount.toLocaleString('vi-VN')}đ`}
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                              <span>Đã đóng</span>
                            </span>
                          ) : attendee.fundStatus === 'pending' ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-sans font-bold px-2.5 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-300 whitespace-nowrap animate-pulse" title="Đã gửi biên lai, chờ BLL đối soát">
                              <span>⏳ Chờ duyệt bill</span>
                            </span>
                          ) : onOpenReceiptModal ? (
                            <button
                              type="button"
                              onClick={() => onOpenReceiptModal(attendee)}
                              className="inline-flex items-center gap-1 text-[10px] font-sans font-medium px-2.5 py-0.5 rounded-md bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 whitespace-nowrap transition cursor-pointer"
                              title="Bấm để tải ảnh biên lai gửi Ban Liên Lạc đối soát"
                            >
                              <span>+ Gửi bill</span>
                            </button>
                          ) : (
                            <a 
                              href="#bank-transfer-card" 
                              className="inline-flex items-center gap-1 text-[10px] font-sans font-medium px-2.5 py-0.5 rounded-md bg-slate-50 hover:bg-amber-50 text-slate-600 hover:text-amber-900 border border-dashed border-slate-300 hover:border-amber-400 whitespace-nowrap transition cursor-pointer"
                              title="Bấm để chuyển khoản và tải ảnh biên lai gửi Ban Liên Lạc"
                            >
                              <span>+ Nộp quỹ</span>
                            </a>
                          )
                        ) : attendee.fundStatus === 'paid' ? (
                          <span 
                            className="inline-flex items-center gap-1 text-[10px] font-sans font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-800 border border-indigo-200 whitespace-nowrap"
                            title={attendee.fundAmount ? `Đã ủng hộ ${attendee.fundAmount.toLocaleString('vi-VN')}đ` : 'Tự nguyện ủng hộ quỹ'}
                          >
                            <span>💜 Đã ủng hộ</span>
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[10px]" title="Báo vắng — Không bắt buộc đóng quỹ">—</span>
                        )}
                      </td>

                      {/* Message & Pass Button */}
                      <td className="py-3 px-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {attendee.message && (
                            <button
                              type="button"
                              onClick={() => setViewingMessage(attendee)}
                              className="p-1 rounded-md text-amber-700 hover:bg-amber-100/60 transition-colors cursor-pointer"
                              title="Xem lời nhắn"
                            >
                              <MessageSquare className="w-4 h-4" />
                            </button>
                          )}

                          {attendee.status === 'yes' && onOpenPassModal && (
                            <button
                              type="button"
                              onClick={() => onOpenPassModal(attendee)}
                              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md border border-amber-300 hover:bg-amber-50 text-amber-900 text-[10px] font-sans font-bold uppercase tracking-wider transition-colors cursor-pointer"
                              title="Xem Thẻ Học Sinh"
                            >
                              <Award className="w-3 h-3 text-amber-600" />
                              <span className="hidden lg:inline">Thẻ</span>
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

          {/* MOBILE COMPACT LIST (Screens < md, Fits 100% width, No horizontal scroll!) */}
          <div className="block md:hidden space-y-2">
            {displayedItems.map((attendee, index) => (
              <div 
                key={attendee.id || `mobile-compact-${index}`}
                className="bg-white border border-amber-200/80 rounded-xl p-3 shadow-2xs hover:border-amber-400 transition-all space-y-2"
              >
                {/* Dòng 1: STT, Tên, Biệt danh & Trạng thái có mặt */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 text-white flex items-center justify-center font-serif text-xs font-bold shrink-0 shadow-2xs">
                      {attendee.fullName.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="font-serif font-bold text-slate-900 text-xs sm:text-sm break-words">
                          {attendee.fullName}
                        </span>
                        {attendee.nickname && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-200/80 text-[10px] font-sans font-bold italic">
                            "{attendee.nickname}"
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <span className={`inline-flex items-center gap-1 text-[10px] font-sans font-bold px-2 py-0.5 rounded-md shrink-0 ${
                    attendee.status === 'yes'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-slate-100 text-slate-600 border border-slate-200'
                  }`}>
                    {attendee.status === 'yes' ? (
                      <>
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Có mặt</span>
                      </>
                    ) : (
                      <span>Vắng</span>
                    )}
                  </span>
                </div>

                {/* Dòng 2: Chi tiết Size áo, Quỹ lớp & Thẻ học sinh / Lời nhắn */}
                <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-slate-100 text-[11px]">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {attendee.status === 'yes' && normalizeShirtSize(attendee.shirtSize) ? (
                      <button
                        type="button"
                        onClick={() => {
                          window.dispatchEvent(new CustomEvent('update-member-shirt-size', { 
                            detail: { memberId: attendee.memberId, fullName: attendee.fullName } 
                          }));
                        }}
                        className="font-sans font-bold text-[10px] px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200/80 hover:bg-amber-100 hover:border-amber-400 transition cursor-pointer inline-flex items-center gap-1"
                        title="Bấm để đổi cỡ áo polo khác"
                      >
                        <span>Áo: <strong>Size {normalizeShirtSize(attendee.shirtSize)}</strong></span>
                        <span className="text-[9px] text-amber-600 opacity-70">✏️</span>
                      </button>
                    ) : attendee.status === 'yes' ? (
                      <button
                        type="button"
                        onClick={() => {
                          window.dispatchEvent(new CustomEvent('update-member-shirt-size', { 
                            detail: { memberId: attendee.memberId, fullName: attendee.fullName } 
                          }));
                        }}
                        className="text-amber-800 hover:underline text-[10px] font-bold cursor-pointer inline-flex items-center gap-1 bg-amber-50/80 hover:bg-amber-100 px-1.5 py-0.5 rounded border border-amber-200/60"
                        title="Bấm để chọn size áo"
                      >
                        <Shirt className="w-3 h-3 text-amber-600" />
                        <span>+ Chọn size</span>
                      </button>
                    ) : (
                      <span className="text-slate-400 text-[10px]">—</span>
                    )}

                    {attendee.status === 'yes' && (
                      attendee.fundStatus === 'paid' ? (
                        <span 
                          className="inline-flex items-center gap-1 text-[10px] font-sans font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-300"
                          title={attendee.fundAmount ? `Đã nộp ${attendee.fundAmount.toLocaleString('vi-VN')}đ` : `Đã nộp quỹ tạm ứng ${standardFundAmount.toLocaleString('vi-VN')}đ`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                          <span>Đã đóng</span>
                        </span>
                      ) : attendee.fundStatus === 'pending' ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-sans font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-300 animate-pulse">
                          <span>⏳ Chờ duyệt bill</span>
                        </span>
                      ) : onOpenReceiptModal ? (
                        <button
                          type="button"
                          onClick={() => onOpenReceiptModal(attendee)}
                          className="inline-flex items-center gap-1 text-[10px] font-sans font-bold px-2 py-0.5 rounded-md bg-amber-100/80 hover:bg-amber-200/80 text-amber-900 border border-amber-300 cursor-pointer"
                        >
                          <span>+ Gửi bill</span>
                        </button>
                      ) : (
                        <a
                          href="#bank-transfer-card"
                          className="inline-flex items-center gap-1 text-[10px] font-sans font-bold px-2 py-0.5 rounded-md bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-900 border border-slate-200"
                        >
                          <span>+ Nộp quỹ</span>
                        </a>
                      )
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {attendee.message && (
                      <button
                        type="button"
                        onClick={() => setViewingMessage(attendee)}
                        className="p-1 rounded-md text-amber-700 hover:bg-amber-100/60 transition-colors cursor-pointer"
                        title="Xem lời nhắn"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </button>
                    )}

                    {attendee.status === 'yes' && onOpenPassModal && (
                      <button
                        type="button"
                        onClick={() => onOpenPassModal(attendee)}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border border-amber-300 bg-white hover:bg-amber-50 text-amber-900 text-[10px] font-sans font-bold transition-colors cursor-pointer"
                        title="Xem Thẻ Học Sinh"
                      >
                        <Award className="w-3 h-3 text-amber-600" />
                        <span>Thẻ</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Lời nhắn preview nếu có */}
                {attendee.message && (
                  <p className="text-[11px] text-slate-600 font-serif italic line-clamp-1 pl-2 border-l-2 border-amber-300/80 pt-0.5">
                    "{attendee.message}"
                  </p>
                )}
              </div>
            ))}
          </div>
        </>
      ) : (
        /* CARD GRID VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {displayedItems.map((attendee, index) => (
            <div
              key={attendee.id || `card-${index}`}
              className="p-4 rounded-xl border border-amber-200/90 bg-white shadow-2xs space-y-3 relative group hover:border-amber-400 hover:shadow-xs transition-all flex flex-col justify-between"
            >
              <div className="space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 text-white flex items-center justify-center font-serif text-xs font-bold shrink-0 shadow-2xs">
                      {attendee.fullName.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-baseline gap-1.5">
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 font-serif break-words">
                          {attendee.fullName}
                        </h4>
                        {attendee.nickname && (
                          <span className="inline-flex items-center px-1.5 py-0.2 rounded-md bg-amber-100 text-amber-900 border border-amber-200/80 text-[10px] font-sans font-bold italic">
                            "{attendee.nickname}"
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500 font-sans">
                        Lớp K8A1 (2003 — 2006)
                      </p>
                    </div>
                  </div>

                  <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md font-sans font-bold uppercase tracking-wider shrink-0 ${
                    attendee.status === 'yes'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-slate-100 text-slate-600 border border-slate-200'
                  }`}>
                    {attendee.status === 'yes' ? 'Có mặt' : 'Vắng'}
                  </span>
                </div>

                {attendee.status === 'yes' && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                    {normalizeShirtSize(attendee.shirtSize) ? (
                      <button
                        type="button"
                        onClick={() => {
                          window.dispatchEvent(new CustomEvent('update-member-shirt-size', { 
                            detail: { memberId: attendee.memberId, fullName: attendee.fullName } 
                          }));
                        }}
                        className="inline-flex items-center gap-1 text-[10px] font-sans text-slate-800 bg-[#FAF8F5] hover:bg-amber-100/70 hover:border-amber-400 px-2 py-0.5 rounded-md border border-amber-200/80 transition cursor-pointer"
                        title="Bấm để đổi cỡ áo polo"
                      >
                        <Shirt className="w-3 h-3 text-amber-700" />
                        <span>Áo: <strong>Size {normalizeShirtSize(attendee.shirtSize)}</strong></span>
                        <span className="text-[9px] text-amber-600 opacity-60">✏️</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          window.dispatchEvent(new CustomEvent('update-member-shirt-size', { 
                            detail: { memberId: attendee.memberId, fullName: attendee.fullName } 
                          }));
                        }}
                        className="inline-flex items-center gap-1 text-[10px] font-sans text-amber-800 bg-amber-50/80 hover:bg-amber-100 hover:border-amber-400 px-2 py-0.5 rounded-md border border-amber-200 transition cursor-pointer font-bold"
                        title="Bấm để chọn size áo"
                      >
                        <Shirt className="w-3 h-3 text-amber-600" />
                        <span>+ Chọn size</span>
                      </button>
                    )}

                    {attendee.fundStatus === 'paid' ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-sans font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                        <span>Đã đóng quỹ</span>
                      </span>
                    ) : attendee.fundStatus === 'pending' ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-sans font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-300 animate-pulse">
                        <span>⏳ Chờ duyệt bill</span>
                      </span>
                    ) : onOpenReceiptModal ? (
                      <button
                        type="button"
                        onClick={() => onOpenReceiptModal(attendee)}
                        className="inline-flex items-center gap-1 text-[10px] font-sans font-medium px-2 py-0.5 rounded-md bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 transition cursor-pointer"
                        title="Bấm để tải ảnh biên lai gửi Ban Liên Lạc"
                      >
                        <span>+ Gửi bill</span>
                      </button>
                    ) : (
                      <a
                        href="#bank-transfer-card"
                        className="inline-flex items-center gap-1 text-[10px] font-sans font-medium px-2 py-0.5 rounded-md bg-slate-50 hover:bg-amber-50 text-slate-600 hover:text-amber-900 border border-dashed border-slate-300 hover:border-amber-400 transition"
                      >
                        <span>+ Đóng quỹ</span>
                      </a>
                    )}
                  </div>
                )}

                {attendee.message && (
                  <p className="text-[11px] text-slate-600 font-serif italic leading-relaxed pl-2.5 border-l-2 border-amber-400/80 line-clamp-2">
                    "{attendee.message}"
                  </p>
                )}
              </div>

              {attendee.status === 'yes' && onOpenPassModal && (
                <div className="pt-2 border-t border-slate-100 flex justify-end">
                  <button
                    type="button"
                    onClick={() => onOpenPassModal(attendee)}
                    className="inline-flex items-center gap-1 text-[11px] text-amber-800 hover:text-amber-950 hover:underline font-sans font-bold cursor-pointer"
                  >
                    <Award className="w-3.5 h-3.5 text-amber-600" />
                    <span>Xem Thẻ Học Sinh 🎓</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination / Load More Bar */}
      <div className="pt-3 border-t border-amber-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <p className="text-slate-500 text-[11px] font-serif italic">
          Đang hiển thị <strong>{Math.min(visibleCount, filteredList.length)}</strong> / <strong>{filteredList.length}</strong> thành viên
        </p>

        <div className="flex items-center gap-2 flex-wrap">
          {hasMore && (
            <button
              type="button"
              onClick={() => setVisibleCount(prev => prev + 20)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white hover:bg-amber-50 border border-amber-200/90 text-slate-800 text-[11px] font-sans font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-2xs"
            >
              <ChevronDown className="w-3 h-3 text-amber-600" />
              <span>Xem thêm 20 bạn</span>
            </button>
          )}

          {hasMore && (
            <button
              type="button"
              onClick={() => setVisibleCount(filteredList.length)}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-[11px] font-sans font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-xs"
            >
              Hiện tất cả ({filteredList.length})
            </button>
          )}

          {!hasMore && filteredList.length > 15 && (
            <button
              type="button"
              onClick={() => setVisibleCount(15)}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-600 text-[11px] font-sans font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-2xs"
            >
              Thu gọn lại
            </button>
          )}
        </div>
      </div>

      {/* Modal View Message */}
      {viewingMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-amber-200/90 p-5 sm:p-6 space-y-4">
            <div className="flex items-start justify-between border-b border-amber-200/80 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 text-white flex items-center justify-center font-serif text-sm font-bold shadow-2xs">
                  {viewingMessage.fullName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-serif font-bold text-sm text-slate-900">
                    {viewingMessage.fullName}
                  </h4>
                  <p className="text-[10px] font-sans text-slate-500">
                    Lớp K8A1 • Niên khóa 2003 - 2006
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewingMessage(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 py-1">
              <span className="text-[11px] font-sans font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1">
                <MessageSquare className="w-3.5 h-3.5 text-amber-600" />
                <span>Lời nhắn gửi bạn bè Lớp K8A1:</span>
              </span>
              <p className="font-serif italic text-xs sm:text-sm text-slate-800 leading-relaxed bg-[#FAF8F5] p-4 rounded-xl border border-amber-200/80 shadow-2xs">
                "{viewingMessage.message}"
              </p>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setViewingMessage(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-sans font-bold uppercase tracking-wider cursor-pointer transition-colors shadow-xs"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🚀 CỤM NÚT ĐIỀU HƯỚNG NHANH Ở CUỐI DANH SÁCH BẠN BÈ */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-[#FAF8F5] via-[#FFFDF8] to-[#FAF8F5] border-2 border-dashed border-amber-300/80 rounded-2xl space-y-3 text-left shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200/60 pb-2.5">
          <div>
            <p className="text-xs sm:text-sm font-serif font-bold text-[#1E293B]">
              Bạn chưa có tên trong danh sách hoặc muốn điều chỉnh thông tin?
            </p>
            <p className="text-[11px] text-slate-500 font-serif italic">
              Danh sách được cập nhật trực tiếp. Bạn có thể báo danh ngay hoặc chuyển tiếp sang đóng quỹ lớp.
            </p>
          </div>
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-[11px] font-sans font-medium transition cursor-pointer self-start sm:self-auto shrink-0 shadow-2xs"
            title="Cuộn lên đầu trang"
          >
            <ArrowUp className="w-3 h-3 text-slate-600" />
            <span>Lên Đầu Trang</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 font-sans text-xs">
          {/* Nút 1: Lên form điểm danh */}
          <button
            type="button"
            onClick={() => {
              window.dispatchEvent(new CustomEvent('focus-diem-danh'));
            }}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-[#8B1E2D] to-[#9B2234] hover:from-rose-700 hover:to-red-700 text-white font-bold shadow-xs hover:shadow-md transition cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4 text-amber-300 shrink-0" />
            <span>✍️ Điểm Danh Báo Có Mặt</span>
          </button>

          {/* Nút 2: Xuống sổ quỹ lớp */}
          <button
            type="button"
            onClick={() => {
              document.getElementById('bank-transfer-card')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-950 border border-amber-400/60 font-bold transition cursor-pointer"
          >
            <Coins className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>💰 Đóng Quỹ Lớp</span>
          </button>

          {/* Nút 3: Xuống kho ký ức */}
          <button
            type="button"
            onClick={() => {
              document.getElementById('ky-uc')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-300/80 font-medium transition cursor-pointer"
          >
            <Camera className="w-4 h-4 text-amber-600 shrink-0" />
            <span>📸 Xem Kỷ Niệm 20 Năm</span>
          </button>
        </div>
      </div>

    </div>
  );
}
