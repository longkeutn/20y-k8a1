import React, { useState, useMemo } from 'react';
import {
  Utensils,
  Sparkles,
  Users,
  CheckCircle2,
  Clock,
  RotateCcw,
  Save,
  Wand2,
  Filter,
  Search,
  ChevronRight,
  AlertCircle,
  Eye,
  Crown,
  GraduationCap,
  ArrowRightLeft,
  XCircle,
  Check,
  Loader2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { RsvpData, ClassMember, TableConfigItem } from '../types';
import { BANQUET_TABLES, getTableConfig, autoAssignStudentTables } from '../data';

interface AdminTableManagerProps {
  rsvpList: RsvpData[];
  onUpdateRsvpList: (list: RsvpData[]) => void;
  classRoster?: ClassMember[];
  appsScriptUrl: string;
  adminAuthPin?: string;
  onRefreshData?: () => void;
  onOpenPassModal?: (attendee: RsvpData) => void;
}

export default function AdminTableManager({
  rsvpList,
  onUpdateRsvpList,
  classRoster = [],
  appsScriptUrl,
  adminAuthPin = '',
  onRefreshData,
  onOpenPassModal
}: AdminTableManagerProps) {
  const [activeFilterTable, setActiveFilterTable] = useState<number | 'all' | 'unassigned'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');
  const [cancelingCheckinId, setCancelingCheckinId] = useState<string | null>(null);

  // Map danh bạ thành viên
  const rosterMap = useMemo(() => {
    const map: Record<string, ClassMember> = {};
    classRoster.forEach((m) => {
      map[m.id] = m;
      if (m.fullName) {
        map[m.fullName.toLowerCase().trim()] = m;
      }
    });
    return map;
  }, [classRoster]);

  // Danh sách những người đăng ký tham gia (status === 'yes')
  const attendees = useMemo(() => {
    return rsvpList.filter((r) => r.status === 'yes');
  }, [rsvpList]);

  // Thống kê tổng quan
  const overviewStats = useMemo(() => {
    const total = attendees.length;
    const checkedInCount = attendees.filter((a) => a.checkedIn).length;
    const assignedCount = attendees.filter((a) => a.tableNumber !== undefined && a.tableNumber !== null).length;
    const unassignedCount = total - assignedCount;

    // Đếm theo từng bàn
    const tableStats: Record<number, { total: number; checkedIn: number; male: number; female: number; bll: number }> = {
      0: { total: 0, checkedIn: 0, male: 0, female: 0, bll: 0 },
      1: { total: 0, checkedIn: 0, male: 0, female: 0, bll: 0 },
      2: { total: 0, checkedIn: 0, male: 0, female: 0, bll: 0 },
      3: { total: 0, checkedIn: 0, male: 0, female: 0, bll: 0 },
      4: { total: 0, checkedIn: 0, male: 0, female: 0, bll: 0 },
      5: { total: 0, checkedIn: 0, male: 0, female: 0, bll: 0 }
    };

    attendees.forEach((a) => {
      if (a.tableNumber !== undefined && a.tableNumber !== null) {
        const t = Number(a.tableNumber);
        if (tableStats[t]) {
          tableStats[t].total++;
          if (a.checkedIn) tableStats[t].checkedIn++;
          const info = (a.memberId ? rosterMap[a.memberId] : null) || rosterMap[a.fullName.toLowerCase().trim()];
          if (info?.gender === 'Nam') tableStats[t].male++;
          else if (info?.gender === 'Nữ') tableStats[t].female++;
          if (info?.role === 'Ban Liên Lạc' || info?.role === 'Trưởng ban' || info?.role === 'Phó ban' || info?.role === 'Thủ quỹ') {
            tableStats[t].bll++;
          }
        }
      }
    });

    return { total, checkedInCount, assignedCount, unassignedCount, tableStats };
  }, [attendees, rosterMap]);

  // 1. Tự động phân bàn thông minh (AI Cân Bằng Nam/Nữ & Hạt Nhân BLL)
  const handleAutoAssign = () => {
    const assigned = autoAssignStudentTables(rsvpList, classRoster);
    onUpdateRsvpList(assigned);
    try {
      localStorage.setItem('rsvp_list', JSON.stringify(assigned));
    } catch {}

    confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
    setSaveSuccessMsg('✨ Đã tự động phân bổ 5 bàn học sinh cân bằng Nam/Nữ & rải đều cán sự BLL! Hãy bấm "Lưu Sơ Đồ Lên Google Sheet" để lưu lại.');
    setTimeout(() => setSaveSuccessMsg(''), 6000);
  };

  // 2. Chuyển bàn thủ công cho một người
  const handleChangeTable = (attendee: RsvpData, newTableNumber: number | null) => {
    const updated = rsvpList.map((item) => {
      if (
        (attendee.id && item.id === attendee.id) ||
        (attendee.memberId && item.memberId === attendee.memberId) ||
        item.fullName.toLowerCase().trim() === attendee.fullName.toLowerCase().trim()
      ) {
        let tableNameStr: string | undefined = undefined;
        if (newTableNumber === 0) {
          tableNameStr = 'Mâm Thầy Cô';
        } else if (newTableNumber !== null && newTableNumber > 0) {
          tableNameStr = `Bàn 0${newTableNumber}`;
        }
        return {
          ...item,
          tableNumber: newTableNumber !== null ? newTableNumber : undefined,
          tableName: tableNameStr
        };
      }
      return item;
    });

    onUpdateRsvpList(updated);
    try {
      localStorage.setItem('rsvp_list', JSON.stringify(updated));
    } catch {}
  };

  // 3. Lưu sơ đồ bàn tiệc lên Google Sheet (action: assign_tables)
  const handleSaveToGoogleSheet = async () => {
    setIsSaving(true);
    setSaveSuccessMsg('');

    try {
      const assignments = attendees.map((a) => ({
        memberId: a.memberId,
        fullName: a.fullName,
        phone: a.phone,
        tableNumber: a.tableNumber !== undefined ? a.tableNumber : null,
        tableName: a.tableName || (a.tableNumber === 0 ? 'Mâm Thầy Cô' : (a.tableNumber ? `Bàn 0${a.tableNumber}` : ''))
      }));

      // Đồng bộ local trước
      try {
        localStorage.setItem('rsvp_list', JSON.stringify(rsvpList));
      } catch {}

      if (appsScriptUrl) {
        await fetch(appsScriptUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'assign_tables',
            pin: adminAuthPin,
            assignments
          })
        });
      }

      setIsSaving(false);
      setSaveSuccessMsg('🎉 Đã lưu sơ đồ phân bàn tiệc thành công lên Google Sheet!');
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.5 } });
      setTimeout(() => setSaveSuccessMsg(''), 4500);
      if (onRefreshData) onRefreshData();
    } catch (err: any) {
      setIsSaving(false);
      alert('Lỗi khi lưu sơ đồ bàn: ' + (err?.message || err));
    }
  };

  // 4. Hủy phân bàn toàn bộ (Đặt lại)
  const handleResetTables = () => {
    if (!window.confirm('Bạn có chắc muốn xóa phân bàn của toàn bộ học sinh để sắp xếp lại từ đầu?')) {
      return;
    }

    const updated = rsvpList.map((item) => ({
      ...item,
      tableNumber: undefined,
      tableName: undefined
    }));

    onUpdateRsvpList(updated);
    try {
      localStorage.setItem('rsvp_list', JSON.stringify(updated));
    } catch {}
    setSaveSuccessMsg('Đã đặt lại trạng thái chưa phân bàn cho tất cả học sinh!');
    setTimeout(() => setSaveSuccessMsg(''), 3000);
  };

  // 5. Hủy check-in nhầm
  const handleCancelCheckin = async (attendee: RsvpData) => {
    if (!window.confirm(`Xác nhận hủy trạng thái có mặt (Check-in) của bạn "${attendee.fullName}"?`)) {
      return;
    }

    setCancelingCheckinId(attendee.id || attendee.fullName);
    try {
      const updated = rsvpList.map((item) => {
        if (
          (attendee.id && item.id === attendee.id) ||
          (attendee.memberId && item.memberId === attendee.memberId) ||
          item.fullName.toLowerCase().trim() === attendee.fullName.toLowerCase().trim()
        ) {
          return {
            ...item,
            checkedIn: false,
            checkedInAt: ''
          };
        }
        return item;
      });

      onUpdateRsvpList(updated);
      try {
        localStorage.setItem('rsvp_list', JSON.stringify(updated));
      } catch {}

      if (appsScriptUrl) {
        await fetch(appsScriptUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'cancel_checkin',
            pin: adminAuthPin,
            memberId: attendee.memberId,
            fullName: attendee.fullName,
            phone: attendee.phone,
            checkedIn: false,
            checkedInAt: ''
          })
        });
      }

      setSaveSuccessMsg(`Đã hủy check-in cho bạn ${attendee.fullName}!`);
      setTimeout(() => setSaveSuccessMsg(''), 3000);
    } catch (err: any) {
      alert('Lỗi hủy check-in: ' + (err?.message || err));
    } finally {
      setCancelingCheckinId(null);
    }
  };

  // Lọc danh sách theo từ khóa tìm kiếm
  const searchFilter = (item: RsvpData) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      item.fullName.toLowerCase().includes(q) ||
      (item.nickname && item.nickname.toLowerCase().includes(q)) ||
      (item.phone && item.phone.includes(q)) ||
      (item.tableName && item.tableName.toLowerCase().includes(q))
    );
  };

  return (
    <div className="space-y-5 p-3 sm:p-5">
      {/* HEADER SECTION & ACTION BAR */}
      <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-amber-950 text-white rounded-3xl p-5 border border-amber-500/30 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-400/40 text-amber-300 flex items-center justify-center font-bold text-sm">
                🍽️
              </span>
              <h2 className="text-xl sm:text-2xl font-serif font-black text-amber-100">
                Sơ Đồ Phân Bàn Tiệc K8A1
              </h2>
            </div>
            <p className="text-xs text-amber-200/70 italic">
              5 Bàn Học Sinh (tối đa 10 người/bàn) + 1 Mâm Thầy Cô Tri Ân (10-12 chỗ) • Trưa 27/09/2026
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleAutoAssign}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              title="Tự động cân bằng Nam/Nữ và rải đều cán sự BLL vào 5 bàn"
            >
              <Wand2 className="w-4 h-4 text-slate-950" />
              <span>Tự Động Phân Bàn (AI Cân Bằng)</span>
            </button>

            <button
              onClick={handleSaveToGoogleSheet}
              disabled={isSaving}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang lưu...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Lưu Lên Google Sheet</span>
                </>
              )}
            </button>

            <button
              onClick={handleResetTables}
              className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-rose-300 hover:text-white font-medium text-xs transition-colors cursor-pointer flex items-center gap-1"
              title="Xóa phân bàn hiện tại"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Đặt lại</span>
            </button>
          </div>
        </div>

        {/* Success Alert Message */}
        {saveSuccessMsg && (
          <div className="mt-3.5 p-3 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-200 text-xs flex items-center gap-2 animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{saveSuccessMsg}</span>
          </div>
        )}

        {/* THỐNG KÊ NHANH 4 CHỈ SỐ */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4 pt-4 border-t border-white/10">
          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Sĩ số xác nhận</span>
            <span className="text-xl font-bold text-amber-300 font-mono">{overviewStats.total}</span>
            <span className="text-[10px] text-slate-400 block">thành viên</span>
          </div>

          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Đã xếp bàn</span>
            <span className="text-xl font-bold text-emerald-400 font-mono">{overviewStats.assignedCount}</span>
            <span className="text-[10px] text-slate-400 block">/ {overviewStats.total} người</span>
          </div>

          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Chưa xếp bàn</span>
            <span className={`text-xl font-bold font-mono ${overviewStats.unassignedCount > 0 ? 'text-amber-400' : 'text-slate-400'}`}>
              {overviewStats.unassignedCount}
            </span>
            <span className="text-[10px] text-slate-400 block">người</span>
          </div>

          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Đã có mặt</span>
            <span className="text-xl font-bold text-sky-400 font-mono">{overviewStats.checkedInCount}</span>
            <span className="text-[10px] text-slate-400 block">đã check-in</span>
          </div>
        </div>
      </div>

      {/* TÌM KIẾM & BỘ LỌC BÀN TIỆC */}
      <div className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Thanh chọn bàn */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setActiveFilterTable('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeFilterTable === 'all'
                ? 'bg-slate-900 text-amber-300 shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            Tất cả (6 Bàn)
          </button>

          {BANQUET_TABLES.map((t) => {
            const count = overviewStats.tableStats[t.id]?.total || 0;
            return (
              <button
                key={t.id}
                onClick={() => setActiveFilterTable(t.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  activeFilterTable === t.id
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <span>{t.id === 0 ? '👑 Thầy Cô' : `Bàn 0${t.id}`}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  activeFilterTable === t.id ? 'bg-amber-800 text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}

          {overviewStats.unassignedCount > 0 && (
            <button
              onClick={() => setActiveFilterTable('unassigned')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeFilterTable === 'unassigned'
                  ? 'bg-rose-700 text-white shadow-xs'
                  : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
              }`}
            >
              <span>Chưa xếp</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full font-mono bg-rose-200 text-rose-900">
                {overviewStats.unassignedCount}
              </span>
            </button>
          )}
        </div>

        {/* Input Tìm Kiếm */}
        <div className="relative w-full md:w-64 shrink-0">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm tên, SĐT, biệt danh..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* DANH SÁCH 6 BÀN TIỆC */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {BANQUET_TABLES.filter((t) => {
          if (activeFilterTable === 'all') return true;
          if (activeFilterTable === 'unassigned') return false;
          return activeFilterTable === t.id;
        }).map((table) => {
          const membersInTable = attendees.filter((a) => {
            if (a.tableNumber !== undefined && Number(a.tableNumber) === table.id) {
              return searchFilter(a);
            }
            return false;
          });

          const tableStat = overviewStats.tableStats[table.id] || { total: 0, checkedIn: 0, male: 0, female: 0, bll: 0 };
          const isFull = tableStat.total >= table.maxCapacity;

          return (
            <div
              key={table.id}
              className={`bg-white rounded-2xl border-2 transition-all shadow-sm overflow-hidden flex flex-col ${
                table.id === 0 ? 'border-amber-300' : 'border-slate-200'
              }`}
            >
              {/* Header Bàn */}
              <div className={`p-4 border-b ${
                table.id === 0
                  ? 'bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-transparent border-amber-200'
                  : 'bg-gradient-to-r from-slate-50 via-slate-100/60 to-transparent border-slate-200'
              }`}>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shadow-2xs shrink-0 ${
                      table.id === 0
                        ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950'
                        : 'bg-slate-900 text-amber-300'
                    }`}>
                      {table.id === 0 ? <GraduationCap className="w-5 h-5" /> : `0${table.id}`}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-sm text-slate-900 font-serif truncate">
                          {table.name}
                        </h3>
                        <span className="text-[10px] text-slate-500 font-sans">
                          ({table.roleTarget})
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 italic truncate">
                        "{table.meaning}"
                      </p>
                    </div>
                  </div>

                  {/* Sức Chứa */}
                  <div className="text-right shrink-0">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold border ${
                      isFull
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                        : 'bg-slate-100 text-slate-700 border-slate-300'
                    }`}>
                      {tableStat.total} / {table.maxCapacity} chỗ
                    </span>
                  </div>
                </div>

                {/* Sub-bar thống kê Nam/Nữ/BLL/Check-in */}
                <div className="flex items-center justify-between text-[11px] text-slate-600 mt-2.5 pt-2 border-t border-slate-200/60">
                  <div className="flex items-center gap-2">
                    <span className="text-sky-600 font-medium">♂ {tableStat.male} Nam</span>
                    <span>•</span>
                    <span className="text-rose-600 font-medium">♀ {tableStat.female} Nữ</span>
                    {tableStat.bll > 0 && (
                      <>
                        <span>•</span>
                        <span className="text-amber-700 font-semibold inline-flex items-center gap-0.5">
                          <Crown className="w-2.5 h-2.5" />
                          {tableStat.bll} BLL
                        </span>
                      </>
                    )}
                  </div>

                  <div className="text-emerald-700 font-semibold">
                    Đã đến: {tableStat.checkedIn} / {tableStat.total}
                  </div>
                </div>
              </div>

              {/* Danh Sách Thành Viên Thuộc Bàn */}
              <div className="p-3 space-y-2 flex-1 max-h-80 overflow-y-auto custom-scrollbar">
                {membersInTable.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 text-xs italic">
                    Chưa có thành viên nào trong bàn này
                  </div>
                ) : (
                  membersInTable.map((member, idx) => {
                    const info = (member.memberId ? rosterMap[member.memberId] : null) || rosterMap[member.fullName.toLowerCase().trim()];
                    const isBLL = info?.role === 'Ban Liên Lạc' || info?.role === 'Trưởng ban' || info?.role === 'Phó ban' || info?.role === 'Thủ quỹ';

                    return (
                      <div
                        key={member.id || idx}
                        className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-amber-50/40 transition-colors flex items-center justify-between gap-2 text-xs"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="text-[11px] text-slate-400 font-mono w-4 text-center">
                            {idx + 1}
                          </span>

                          {/* Avatar */}
                          <div className="relative shrink-0">
                            {info?.avatarUrl || member.avatarUrl ? (
                              <img
                                src={info?.avatarUrl || member.avatarUrl}
                                alt={member.fullName}
                                className="w-8 h-8 rounded-full object-cover border border-amber-300"
                              />
                            ) : (
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white ${
                                info?.gender === 'Nữ' ? 'bg-pink-500' : 'bg-blue-600'
                              }`}>
                                {member.fullName.split(' ').filter(Boolean).slice(-1)[0]?.[0] || 'K'}
                              </div>
                            )}

                            <span
                              className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${
                                member.checkedIn ? 'bg-emerald-500' : 'bg-amber-400'
                              }`}
                              title={member.checkedIn ? 'Đã có mặt' : 'Đang tới'}
                            />
                          </div>

                          {/* Tên & Biệt danh */}
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-bold text-slate-900 truncate">
                                {member.fullName}
                              </span>
                              {member.nickname && (
                                <span className="text-[10px] text-amber-800 bg-amber-100 px-1 py-0.2 rounded font-serif italic">
                                  "{member.nickname}"
                                </span>
                              )}
                              {isBLL && (
                                <span className="text-[9.5px] bg-amber-500/20 text-amber-900 border border-amber-400/40 px-1 py-0.2 rounded font-semibold inline-flex items-center gap-0.5">
                                  <Crown className="w-2.5 h-2.5 text-amber-600" />
                                  {info?.role || 'BLL'}
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                              <span>{info?.gender || 'K8A1'}</span>
                              {member.checkedIn ? (
                                <span className="text-emerald-700 font-medium">
                                  • Có mặt lúc {member.checkedInAt || 'vừa xong'}
                                </span>
                              ) : (
                                <span className="text-amber-700">• Chưa check-in</span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Thao tác Chuyển Bàn & Hủy Check-in */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          {/* Dropdown Đổi Bàn */}
                          <select
                            value={member.tableNumber !== undefined ? String(member.tableNumber) : ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              handleChangeTable(member, val === '' ? null : Number(val));
                            }}
                            className="text-[11px] py-1 px-1.5 bg-white border border-slate-300 rounded-lg text-slate-700 focus:outline-none focus:border-amber-500 cursor-pointer"
                            title="Đổi vị trí bàn tiệc"
                          >
                            <option value="0">Mâm Thầy Cô</option>
                            <option value="1">Bàn 01</option>
                            <option value="2">Bàn 02</option>
                            <option value="3">Bàn 03</option>
                            <option value="4">Bàn 04</option>
                            <option value="5">Bàn 05</option>
                            <option value="">(Xóa bàn)</option>
                          </select>

                          {/* Nút Hủy Check-in Nhầm */}
                          {member.checkedIn && (
                            <button
                              type="button"
                              onClick={() => handleCancelCheckin(member)}
                              disabled={cancelingCheckinId === (member.id || member.fullName)}
                              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Hủy điểm danh nhầm"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Nút xem vé */}
                          {onOpenPassModal && (
                            <button
                              type="button"
                              onClick={() => onOpenPassModal(member)}
                              className="p-1 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                              title="Xem vé vàng cá nhân"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* KHU VỰC THÀNH VIÊN CHƯA XẾP BÀN (NẾU CÓ) */}
      {overviewStats.unassignedCount > 0 && (activeFilterTable === 'all' || activeFilterTable === 'unassigned') && (
        <div className="bg-white rounded-2xl border-2 border-rose-200 p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-600" />
              <h3 className="font-bold text-sm text-slate-900 font-serif">
                Danh Sách Chưa Xếp Bàn ({overviewStats.unassignedCount} bạn)
              </h3>
            </div>
            <button
              onClick={handleAutoAssign}
              className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span>Phân bàn tự động ngay</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-60 overflow-y-auto custom-scrollbar">
            {attendees
              .filter((a) => (a.tableNumber === undefined || a.tableNumber === null) && searchFilter(a))
              .map((member, idx) => (
                <div
                  key={member.id || idx}
                  className="p-2.5 rounded-xl border border-rose-200 bg-rose-50/40 flex items-center justify-between gap-2 text-xs"
                >
                  <span className="font-medium text-slate-900 truncate">
                    {member.fullName}
                  </span>

                  <select
                    value=""
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val !== '') handleChangeTable(member, Number(val));
                    }}
                    className="text-[11px] py-1 px-1.5 bg-white border border-rose-300 rounded-lg text-rose-900 font-bold focus:outline-none cursor-pointer"
                  >
                    <option value="" disabled>Gán bàn...</option>
                    <option value="0">Mâm Thầy Cô</option>
                    <option value="1">Bàn 01</option>
                    <option value="2">Bàn 02</option>
                    <option value="3">Bàn 03</option>
                    <option value="4">Bàn 04</option>
                    <option value="5">Bàn 05</option>
                  </select>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
