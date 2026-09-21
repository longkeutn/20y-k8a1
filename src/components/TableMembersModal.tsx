import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Utensils, 
  Sparkles, 
  X, 
  CheckCircle2, 
  Clock, 
  Users, 
  Crown, 
  GraduationCap
} from 'lucide-react';
import { RsvpData, ClassMember, TableConfigItem } from '../types';
import { BANQUET_TABLES, getTableConfig } from '../data';

interface TableMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  tableNumber?: number; // 0 (Thầy cô) hoặc 1-5 (Học sinh)
  rsvpList: RsvpData[];
  classRoster: ClassMember[];
  currentMemberName?: string;
  onSelectMember?: (member: ClassMember | RsvpData) => void;
}

export default function TableMembersModal({
  isOpen,
  onClose,
  tableNumber: initialTableNumber,
  rsvpList,
  classRoster,
  currentMemberName,
  onSelectMember
}: TableMembersModalProps) {
  // Cho phép chuyển đổi linh hoạt giữa các bàn
  const [selectedTable, setSelectedTable] = useState<number>(
    initialTableNumber !== undefined ? initialTableNumber : 1
  );

  // Cập nhật selectedTable khi initialTableNumber thay đổi
  React.useEffect(() => {
    if (initialTableNumber !== undefined) {
      setSelectedTable(initialTableNumber);
    }
  }, [initialTableNumber]);

  // Cấu hình của bàn đang chọn
  const activeTableConfig: TableConfigItem = useMemo(() => {
    return getTableConfig(selectedTable);
  }, [selectedTable]);

  // Roster map để lấy avatar, giới tính, vai trò
  const rosterMap = useMemo(() => {
    const map: Record<string, ClassMember> = {};
    classRoster.forEach(m => {
      map[m.id] = m;
      if (m.fullName) {
        map[m.fullName.toLowerCase().trim()] = m;
      }
    });
    return map;
  }, [classRoster]);

  // Danh sách thành viên được phân vào bàn đang chọn
  const tableMembers = useMemo(() => {
    return rsvpList.filter(rsvp => {
      if (rsvp.status !== 'yes') return false;
      // Khớp theo tableNumber
      if (rsvp.tableNumber !== undefined && Number(rsvp.tableNumber) === selectedTable) {
        return true;
      }
      // Khớp theo tên bàn nếu có
      if (selectedTable === 0 && (rsvp.tableName?.toLowerCase().includes('thầy') || rsvp.tableName?.toLowerCase().includes('cô'))) {
        return true;
      }
      if (selectedTable > 0 && rsvp.tableName?.includes(String(selectedTable))) {
        return true;
      }
      return false;
    });
  }, [rsvpList, selectedTable]);

  // Thống kê thành viên trong bàn
  const stats = useMemo(() => {
    const total = tableMembers.length;
    const checkedIn = tableMembers.filter(m => m.checkedIn).length;
    
    // Đếm nam/nữ
    let maleCount = 0;
    let femaleCount = 0;
    tableMembers.forEach(m => {
      const memberInfo = (m.memberId ? rosterMap[m.memberId] : null) || rosterMap[m.fullName.toLowerCase().trim()];
      if (memberInfo?.gender === 'Nam') maleCount++;
      else if (memberInfo?.gender === 'Nữ') femaleCount++;
    });

    return { total, checkedIn, maleCount, femaleCount };
  }, [tableMembers, rosterMap]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 20 }}
          className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white rounded-3xl shadow-2xl border border-amber-500/40 max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden"
        >
          {/* Header Bàn Tiệc */}
          <div className="relative bg-gradient-to-r from-amber-900/60 via-amber-800/40 to-slate-900 p-5 border-b border-amber-500/20 text-center">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-amber-200 hover:text-white transition-colors cursor-pointer"
              aria-label="Đóng"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Badge Icon Bàn Tiệc */}
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 shadow-lg shadow-amber-500/20 mb-2">
              {selectedTable === 0 ? <GraduationCap className="w-7 h-7" /> : <Utensils className="w-6 h-6" />}
            </div>

            <div className="flex items-center justify-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30">
                {activeTableConfig.name}
              </span>
              <span className="text-xs text-amber-200/80 font-medium">
                {activeTableConfig.roleTarget}
              </span>
            </div>

            <h3 className="text-xl font-bold text-amber-100 mt-1 font-serif">
              {activeTableConfig.description}
            </h3>

            <p className="text-xs text-amber-200/70 italic mt-1 max-w-sm mx-auto">
              "{activeTableConfig.meaning}"
            </p>

            {/* Bộ chọn chuyển bàn nhanh */}
            <div className="flex items-center justify-center gap-1.5 mt-3.5 overflow-x-auto pb-1 scrollbar-none">
              {BANQUET_TABLES.map(table => (
                <button
                  key={table.id}
                  onClick={() => setSelectedTable(table.id)}
                  className={`px-2.5 py-1 text-xs rounded-xl font-medium transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                    selectedTable === table.id
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold shadow-md shadow-amber-500/30 scale-105'
                      : 'bg-white/5 hover:bg-white/10 text-amber-200/70 hover:text-amber-100 border border-white/5'
                  }`}
                >
                  {table.id === 0 ? '👑 Thầy Cô' : `Bàn 0${table.id}`}
                </button>
              ))}
            </div>
          </div>

          {/* Thanh Tiến Độ Có Mặt Của Bàn */}
          <div className="bg-slate-900/90 px-5 py-3 border-b border-white/5 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-amber-400" />
              <span className="text-slate-300">
                Có mặt: <strong className="text-emerald-400 font-bold">{stats.checkedIn}</strong> / {stats.total || activeTableConfig.maxCapacity} bạn
              </span>
            </div>

            {selectedTable > 0 && stats.total > 0 && (
              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                <span className="text-sky-400 font-medium">♂ {stats.maleCount} Nam</span>
                <span>•</span>
                <span className="text-rose-400 font-medium">♀ {stats.femaleCount} Nữ</span>
              </div>
            )}
          </div>

          {/* Danh Sách Thành Viên Trong Bàn */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2.5 custom-scrollbar">
            {tableMembers.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-3 text-slate-500">
                  <Utensils className="w-6 h-6" />
                </div>
                <p className="text-sm font-medium text-slate-300">Chưa có thành viên nào được phân vào bàn này</p>
                <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                  Ban tổ chức đang sắp xếp vị trí hoặc số bàn sẽ được kích hoạt tự động khi các bạn check-in tại cổng!
                </p>
              </div>
            ) : (
              tableMembers.map((member, index) => {
                const rosterInfo = (member.memberId ? rosterMap[member.memberId] : null) || rosterMap[member.fullName.toLowerCase().trim()];
                const isCurrentUser = currentMemberName && member.fullName.toLowerCase().trim() === currentMemberName.toLowerCase().trim();
                const isBLL = rosterInfo?.role === 'Ban Liên Lạc' || rosterInfo?.role === 'Trưởng ban' || rosterInfo?.role === 'Phó ban' || rosterInfo?.role === 'Thủ quỹ';

                return (
                  <div
                    key={member.id || index}
                    onClick={() => onSelectMember && onSelectMember(rosterInfo || member)}
                    className={`group relative p-3 rounded-2xl transition-all border flex items-center gap-3.5 ${
                      isCurrentUser
                        ? 'bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-transparent border-amber-500/50 shadow-lg shadow-amber-500/10'
                        : 'bg-slate-800/60 hover:bg-slate-800 border-white/5 hover:border-amber-500/30'
                    } ${onSelectMember ? 'cursor-pointer' : ''}`}
                  >
                    {/* Số thứ tự hoặc icon */}
                    <div className="text-xs font-bold text-slate-500 w-5 text-center font-mono">
                      {index + 1}
                    </div>

                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      {rosterInfo?.avatarUrl || member.avatarUrl ? (
                        <img
                          src={rosterInfo?.avatarUrl || member.avatarUrl}
                          alt={member.fullName}
                          className="w-11 h-11 rounded-full object-cover border-2 border-amber-400/50 shadow-sm"
                        />
                      ) : (
                        <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm shadow-sm border ${
                          rosterInfo?.gender === 'Nữ'
                            ? 'bg-gradient-to-br from-pink-500 to-rose-600 text-white border-pink-400/40'
                            : 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white border-blue-400/40'
                        }`}>
                          {member.fullName.split(' ').pop()?.charAt(0) || 'K'}
                        </div>
                      )}

                      {/* Trạng thái check-in chấm tròn trên avatar */}
                      <span
                        className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-slate-900 ${
                          member.checkedIn ? 'bg-emerald-400' : 'bg-amber-400'
                        }`}
                        title={member.checkedIn ? 'Đã có mặt' : 'Đang tới'}
                      />
                    </div>

                    {/* Họ Tên & Biệt Danh */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`font-bold text-sm truncate ${
                          isCurrentUser ? 'text-amber-300' : 'text-slate-100'
                        }`}>
                          {member.fullName}
                        </span>

                        {isCurrentUser && (
                          <span className="px-1.5 py-0.2 text-[10px] font-bold rounded bg-amber-400 text-slate-950">
                            BẠN
                          </span>
                        )}

                        {isBLL && (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 text-[10px] font-semibold rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            <Crown className="w-2.5 h-2.5 text-amber-400" />
                            {rosterInfo?.role || 'BLL'}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                        {member.nickname ? (
                          <span className="italic text-amber-200/80 truncate">
                            "{member.nickname}"
                          </span>
                        ) : (
                          <span className="text-slate-500">K8A1</span>
                        )}

                        {rosterInfo?.gender && (
                          <span className="text-[11px] text-slate-500">
                            • {rosterInfo.gender}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Trạng Thái Điểm Danh */}
                    <div className="text-right flex-shrink-0">
                      {member.checkedIn ? (
                        <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Đã đến</span>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300/80 text-xs">
                          <Clock className="w-3 h-3 text-amber-400/80" />
                          <span>Đang tới</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Modal */}
          <div className="p-4 bg-slate-950/80 border-t border-white/5 flex items-center justify-between text-xs">
            <div className="text-slate-400 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>5 Bàn Học Sinh + 1 Mâm Thầy Cô</span>
            </div>

            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold transition-all shadow-md shadow-amber-500/20 cursor-pointer"
            >
              Đã hiểu
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
