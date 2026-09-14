import React, { useState, useMemo } from 'react';
import { 
  Vote, 
  CheckCircle2, 
  Circle, 
  CheckSquare, 
  Square, 
  Users, 
  Lock, 
  ChevronDown, 
  ChevronUp, 
  UserCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PollData, ClassMember } from '../types';

interface InteractivePollWidgetProps {
  announcementId: string;
  poll: PollData;
  onVote: (announcementId: string, optionId: string, voterName: string) => void;
  activeMember?: ClassMember | null;
  classRoster?: ClassMember[];
  isCompact?: boolean;
}

export default function InteractivePollWidget({
  announcementId,
  poll,
  onVote,
  activeMember,
  classRoster = [],
  isCompact = false,
}: InteractivePollWidgetProps) {
  // Định danh người bình chọn (Ưu tiên activeMember, sau đó là tên đã lưu trong máy)
  const [savedVoterName, setSavedVoterName] = useState<string>(() => {
    try {
      return localStorage.getItem('k8a1_voter_name') || '';
    } catch {
      return '';
    }
  });

  // Modal xác nhận danh tính nhanh nếu chưa đăng nhập
  const [isIdentityPickerOpen, setIsIdentityPickerOpen] = useState(false);
  const [pendingOptionId, setPendingOptionId] = useState<string | null>(null);
  const [selectedMemberName, setSelectedMemberName] = useState('');
  const [searchMemberQuery, setSearchMemberQuery] = useState('');

  // Trạng thái xem danh sách ai đã vote cho từng phương án
  const [expandedOptionVoters, setExpandedOptionVoters] = useState<Record<string, boolean>>({});

  // Tên người dùng thực tế
  const currentVoterName = activeMember?.fullName || savedVoterName;

  // Tổng số phiếu bầu và tổng số người tham gia (unique)
  const { totalVotes, uniqueVotersCount } = useMemo(() => {
    let votesCount = 0;
    const votersSet = new Set<string>();

    poll.options.forEach((opt) => {
      votesCount += opt.votes?.length || 0;
      (opt.votes || []).forEach((v) => votersSet.add(v.trim()));
    });

    return {
      totalVotes: votesCount,
      uniqueVotersCount: votersSet.size
    };
  }, [poll.options]);

  // Kiểm tra xem người dùng hiện tại đã chọn phương án nào chưa
  const userSelectedOptionIds = useMemo(() => {
    if (!currentVoterName) return [];
    return poll.options
      .filter((opt) => (opt.votes || []).some((v) => v.toLowerCase().trim() === currentVoterName.toLowerCase().trim()))
      .map((opt) => opt.id);
  }, [poll.options, currentVoterName]);

  // Xử lý khi nhấn vào 1 phương án
  const handleOptionClick = (optionId: string) => {
    if (poll.isClosed) return;

    if (!currentVoterName) {
      setPendingOptionId(optionId);
      setIsIdentityPickerOpen(true);
      return;
    }

    executeVote(optionId, currentVoterName);
  };

  const executeVote = (optionId: string, voter: string) => {
    try {
      if (navigator.vibrate) navigator.vibrate(25);
    } catch {}

    onVote(announcementId, optionId, voter);

    // Bắn pháo hoa mini ăn mừng khi bỏ phiếu
    confetti({
      particleCount: 22,
      spread: 45,
      origin: { y: 0.75 }
    });
  };

  const handleConfirmIdentity = () => {
    const finalName = selectedMemberName.trim();
    if (!finalName) return;

    try {
      localStorage.setItem('k8a1_voter_name', finalName);
    } catch {}

    setSavedVoterName(finalName);
    setIsIdentityPickerOpen(false);

    if (pendingOptionId) {
      executeVote(pendingOptionId, finalName);
      setPendingOptionId(null);
    }
  };

  const toggleExpandVoters = (optId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedOptionVoters((prev) => ({
      ...prev,
      [optId]: !prev[optId]
    }));
  };

  // Lọc danh bạ khi tìm kiếm trong popup chọn tên
  const filteredRoster = useMemo(() => {
    if (!searchMemberQuery.trim()) return classRoster.slice(0, 20);
    const q = searchMemberQuery.toLowerCase().trim();
    return classRoster.filter(
      (m) => m.fullName.toLowerCase().includes(q) || (m.nickname && m.nickname.toLowerCase().includes(q))
    );
  }, [classRoster, searchMemberQuery]);

  // Màu sắc dải thanh tiến độ luân phiên
  const PROGRESS_GRADIENTS = [
    'from-amber-500 to-amber-600',
    'from-emerald-500 to-emerald-600',
    'from-sky-500 to-sky-600',
    'from-purple-500 to-purple-600',
    'from-rose-500 to-rose-600'
  ];

  return (
    <div className={`rounded-2xl border transition-all ${
      isCompact 
        ? 'bg-amber-950/20 border-amber-500/30 p-3 sm:p-4 my-2 text-left' 
        : 'bg-gradient-to-b from-[#FFFDF9] to-[#FAF6EE] border-amber-300 shadow-md p-4 sm:p-6 my-4 text-left'
    }`}>
      {/* HEADER BÌNH CHỌN */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-amber-200/60">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-xs shrink-0">
            <Vote className="w-4 h-4 sm:w-5 sm:h-5" />
          </span>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200">
                {poll.allowMultiple ? '☑️ Bình chọn nhiều phương án' : '🔘 Chọn 1 phương án duy nhất'}
              </span>
              {poll.isClosed && (
                <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full border border-rose-200 flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Đã chốt kết quả
                </span>
              )}
            </div>
            <h4 className={`font-serif font-bold mt-1 ${isCompact ? 'text-white text-xs sm:text-sm' : 'text-slate-900 text-sm sm:text-base'}`}>
              {poll.question || 'Khảo sát ý kiến lớp K8A1'}
            </h4>
          </div>
        </div>

        {/* THỐNG KÊ TỔNG PHIẾU */}
        <div className={`flex items-center gap-2 text-xs self-start sm:self-center px-3 py-1.5 rounded-xl border shadow-2xs shrink-0 ${
          isCompact ? 'bg-white/10 text-amber-200 border-white/20' : 'bg-white/80 text-slate-700 border-amber-200'
        }`}>
          <Users className="w-3.5 h-3.5 text-amber-500" />
          <span className="font-semibold">
            {uniqueVotersCount} bạn ({totalVotes} phiếu)
          </span>
        </div>
      </div>

      {/* DANH SÁCH CÁC PHƯƠNG ÁN LỰA CHỌN */}
      <div className="space-y-2.5 pt-3">
        {poll.options.map((option, idx) => {
          const isSelected = userSelectedOptionIds.includes(option.id);
          const optVotesCount = option.votes?.length || 0;
          const percentage = totalVotes > 0 ? Math.round((optVotesCount / totalVotes) * 100) : 0;
          const isExpanded = expandedOptionVoters[option.id];
          const gradientClass = PROGRESS_GRADIENTS[idx % PROGRESS_GRADIENTS.length];

          return (
            <div
              key={option.id}
              onClick={() => handleOptionClick(option.id)}
              className={`relative overflow-hidden rounded-xl border transition-all cursor-pointer ${
                poll.isClosed
                  ? 'bg-slate-50/10 border-slate-500/20 cursor-default opacity-85'
                  : isSelected
                  ? isCompact 
                    ? 'bg-amber-500/20 border-amber-400 ring-1 ring-amber-400/50' 
                    : 'bg-amber-50/90 border-amber-500 shadow-sm ring-2 ring-amber-400/40'
                  : isCompact
                    ? 'bg-white/5 hover:bg-white/10 border-white/10 hover:border-amber-400/40'
                    : 'bg-white hover:bg-amber-50/40 border-slate-200 hover:border-amber-300'
              }`}
            >
              {/* THANH TIẾN ĐỘ PHẦN TRĂM (BACKGROUND PROGRESS FILL) */}
              <div
                className={`absolute top-0 bottom-0 left-0 bg-gradient-to-r ${gradientClass} ${isCompact ? 'opacity-30' : 'opacity-20'} transition-all duration-700 ease-out`}
                style={{ width: `${percentage}%` }}
              />

              <div className="relative p-3 flex flex-col gap-1.5">
                <div className="flex items-start justify-between gap-3">
                  {/* ICON CHỌN & NỘI DUNG PHƯƠNG ÁN */}
                  <div className="flex items-start gap-2.5 flex-1 min-w-0">
                    <span className="mt-0.5 shrink-0 text-amber-500">
                      {poll.allowMultiple ? (
                        isSelected ? (
                          <CheckSquare className="w-4 h-4 text-amber-500 fill-amber-500/20" />
                        ) : (
                          <Square className={`w-4 h-4 ${isCompact ? 'text-slate-400' : 'text-slate-300'}`} />
                        )
                      ) : (
                        isSelected ? (
                          <CheckCircle2 className="w-4 h-4 text-amber-500 fill-amber-500/20" />
                        ) : (
                          <Circle className={`w-4 h-4 ${isCompact ? 'text-slate-400' : 'text-slate-300'}`} />
                        )
                      )}
                    </span>
                    <div className="space-y-0.5 min-w-0">
                      <p className={`text-xs sm:text-sm leading-snug font-sans ${
                        isCompact
                          ? isSelected ? 'font-bold text-amber-200' : 'font-medium text-slate-100'
                          : isSelected ? 'font-bold text-slate-950' : 'font-medium text-slate-800'
                      }`}>
                        {option.text}
                      </p>
                      {isSelected && (
                        <span className={`inline-flex items-center gap-1 text-[11px] font-bold ${isCompact ? 'text-amber-300' : 'text-amber-800'}`}>
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Bạn đã chọn
                        </span>
                      )}
                    </div>
                  </div>

                  {/* SỐ PHIẾU & PHẦN TRĂM */}
                  <div className="shrink-0 text-right">
                    <span className={`font-mono font-bold text-xs sm:text-sm ${isCompact ? 'text-white' : 'text-slate-900'}`}>
                      {percentage}%
                    </span>
                    <p className={`text-[11px] font-sans ${isCompact ? 'text-slate-300' : 'text-slate-500'}`}>
                      {optVotesCount} phiếu
                    </p>
                  </div>
                </div>

                {/* DANH SÁCH BẠN HỌC ĐÃ BÌNH CHỌN PHƯƠNG ÁN NÀY (XEM MINH BẠCH) */}
                {!isCompact && option.votes && option.votes.length > 0 && (
                  <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={(e) => toggleExpandVoters(option.id, e)}
                      className="text-[11px] text-amber-800 hover:text-amber-950 font-bold flex items-center gap-1 hover:underline cursor-pointer"
                    >
                      <Users className="w-3 h-3 text-amber-600" />
                      <span>{isExpanded ? 'Ẩn danh sách' : `Xem ${optVotesCount} bạn đã chọn`}</span>
                      {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>

                    <div className="flex -space-x-1.5 overflow-hidden">
                      {option.votes.slice(0, 4).map((name, i) => (
                        <span
                          key={i}
                          title={name}
                          className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-200 border border-white text-[9px] font-bold text-amber-900 shadow-2xs"
                        >
                          {name.trim().charAt(0).toUpperCase()}
                        </span>
                      ))}
                      {option.votes.length > 4 && (
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-slate-200 border border-white text-[9px] font-bold text-slate-700">
                          +{option.votes.length - 4}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* KHỐI MỞ RỘNG DANH SÁCH TÊN BẠN HỌC */}
                {!isCompact && isExpanded && option.votes && (
                  <div className="mt-2 p-2 bg-amber-50/60 rounded-lg border border-amber-200 text-xs text-slate-700 animate-in fade-in duration-200">
                    <p className="font-bold text-amber-900 text-[11px] mb-1.5">
                      Danh sách {optVotesCount} bạn học đã chọn phương án này:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {option.votes.map((voter, vi) => (
                        <span
                          key={vi}
                          className="px-2 py-0.5 rounded-full bg-white border border-amber-200 text-[11px] font-medium text-slate-800 shadow-2xs flex items-center gap-1"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          {voter}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* FOOTER: THÔNG TIN NGƯỜI ĐANG BÌNH CHỌN */}
      <div className={`mt-3 pt-2.5 border-t flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs ${
        isCompact ? 'border-white/10 text-slate-300' : 'border-amber-200/60 text-slate-600'
      }`}>
        <div className="flex items-center gap-1.5">
          <UserCheck className="w-4 h-4 text-emerald-500 shrink-0" />
          {currentVoterName ? (
            <span>
              Bình chọn: <strong className={isCompact ? 'text-amber-300 font-bold' : 'text-slate-900 font-bold'}>{currentVoterName}</strong>
            </span>
          ) : (
            <span className="italic">
              Nhấp vào phương án để bỏ phiếu
            </span>
          )}
        </div>

        {currentVoterName && !activeMember && (
          <button
            type="button"
            onClick={() => setIsIdentityPickerOpen(true)}
            className="text-[11px] text-amber-400 hover:text-amber-300 font-bold hover:underline self-start sm:self-auto cursor-pointer"
          >
            (Đổi người vote)
          </button>
        )}
      </div>

      {/* MODAL NHẬN DIỆN DANH TÍNH NHANH */}
      {isIdentityPickerOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div 
            className="bg-white rounded-2xl border-2 border-amber-300 max-w-md w-full p-5 sm:p-6 shadow-2xl space-y-4 text-slate-800 text-left animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-amber-200">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-amber-100 text-amber-800 rounded-xl">
                  <Vote className="w-5 h-5" />
                </span>
                <h4 className="font-serif font-bold text-base text-slate-900">
                  Xác Nhận Tên Bạn Học K8A1
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setIsIdentityPickerOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Để kết quả khảo sát minh bạch và mỗi bạn chỉ bỏ 1 phiếu đúng danh tính, xin vui lòng chọn tên của bạn trong danh bạ lớp K8A1:
            </p>

            {/* Ô TÌM KIẾM TÊN TRONG DANH BẠ */}
            <div className="space-y-2">
              <input
                type="text"
                value={searchMemberQuery}
                onChange={(e) => setSearchMemberQuery(e.target.value)}
                placeholder="🔍 Gõ tên bạn để tìm nhanh (VD: Tuấn, Dũng, Nhung...)"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-amber-500 font-sans"
              />

              {/* DANH SÁCH TÊN BẠN HỌC */}
              <div className="max-h-48 overflow-y-auto space-y-1 pr-1 border border-slate-200 rounded-xl p-1 bg-slate-50/50">
                {filteredRoster.map((member) => (
                  <button
                    key={member.id}
                    type="button"
                    onClick={() => setSelectedMemberName(member.fullName)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition cursor-pointer ${
                      selectedMemberName === member.fullName
                        ? 'bg-amber-600 text-white font-bold shadow-xs'
                        : 'hover:bg-amber-100/70 text-slate-800'
                    }`}
                  >
                    <span>{member.fullName}</span>
                    {member.nickname && (
                      <span className={`text-[10px] ${selectedMemberName === member.fullName ? 'text-amber-200' : 'text-slate-400'}`}>
                        ({member.nickname})
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* HOẶC TỰ GÕ TÊN */}
              <div className="pt-2">
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  Hoặc tự nhập tên của bạn:
                </label>
                <input
                  type="text"
                  value={selectedMemberName}
                  onChange={(e) => setSelectedMemberName(e.target.value)}
                  placeholder="Họ và tên của bạn..."
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 font-bold focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsIdentityPickerOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Đóng
              </button>
              <button
                type="button"
                disabled={!selectedMemberName.trim()}
                onClick={handleConfirmIdentity}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white shadow-md disabled:opacity-50 cursor-pointer"
              >
                Xác Nhận & Bỏ Phiếu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
