import React, { useMemo } from 'react';
import { Sparkles, Users, CheckCircle2, ArrowRight, Eye, Heart, Coins, MapPin, Camera } from 'lucide-react';
import { RsvpData, ClassMember } from '../types';
import { CLASS_ROSTER_K8A1 } from '../data';

interface ClassGatheringCounterProps {
  rsvpList: RsvpData[];
  classRoster?: ClassMember[];
  activeMember?: ClassMember | null;
}

// Bảng màu avatar luân phiên ấm áp
const AVATAR_COLORS = [
  'from-amber-400 to-amber-600 text-white',
  'from-rose-400 to-rose-600 text-white',
  'from-emerald-400 to-emerald-600 text-white',
  'from-sky-400 to-sky-600 text-white',
  'from-indigo-400 to-indigo-600 text-white',
  'from-amber-300 to-orange-500 text-amber-950',
  'from-teal-400 to-teal-600 text-white',
  'from-purple-400 to-purple-600 text-white',
];

export default function ClassGatheringCounter({
  rsvpList,
  classRoster,
  activeMember
}: ClassGatheringCounterProps) {
  // Lọc danh sách các bạn đã xác nhận tham gia ('yes')
  const confirmedAttendees = useMemo(() => {
    return rsvpList.filter(item => item.status === 'yes');
  }, [rsvpList]);

  const confirmedCount = confirmedAttendees.length;

  // Tổng sĩ số chuẩn của lớp (ưu tiên từ danh bạ động nếu có, hoặc dùng 40 bạn chuẩn)
  const totalRoster = (classRoster && classRoster.length > 0) 
    ? classRoster.length 
    : CLASS_ROSTER_K8A1.length;

  // Tỷ lệ % tham gia
  const percent = Math.min(100, Math.round((confirmedCount / Math.max(totalRoster, 1)) * 100));

  // Chuẩn hóa họ tên & SĐT để đối soát chính xác
  const normalizeName = (n?: any) => {
    if (!n) return '';
    return String(n).trim().toLowerCase().replace(/\s+/g, ' ');
  };
  const normalizePhone = (p?: any) => {
    if (!p) return '';
    let clean = String(p).replace(/[^0-9]/g, '');
    if (clean.startsWith('84') && clean.length > 9) clean = '0' + clean.slice(2);
    else if (!clean.startsWith('0') && clean.length === 9) clean = '0' + clean;
    return clean;
  };

  const currentRoster = useMemo(() => {
    return classRoster && classRoster.length > 0 ? classRoster : CLASS_ROSTER_K8A1;
  }, [classRoster]);

  // Kiểm tra thành viên đang tương tác đã điểm danh có mặt chưa (phân biệt chính xác người trùng tên)
  const isActiveMemberConfirmed = useMemo(() => {
    if (!activeMember) return false;

    const mName = normalizeName(activeMember.fullName);
    const mPhone = normalizePhone(activeMember.phone);

    // Kiểm tra số lượng bạn trùng họ tên trong danh bạ
    const sameNameCount = currentRoster.filter(
      (r) => normalizeName(r.fullName) === mName
    ).length;

    return confirmedAttendees.some((a) => {
      // 1. Khớp chính xác theo memberId
      if (a.memberId && activeMember.id) {
        return a.memberId === activeMember.id;
      }

      const aPhone = normalizePhone(a.phone);
      const aName = normalizeName(a.fullName);

      // 2. Nếu cả 2 đều có SĐT và SĐT khác nhau => chắc chắn không phải
      if (mPhone && aPhone && mPhone !== aPhone) return false;

      // 3. Nếu SĐT trùng nhau
      if (mPhone && aPhone && mPhone === aPhone) return true;

      // 4. Nếu họ tên trùng nhau:
      if (mName && aName && mName === aName) {
        // Nếu trong danh bạ có nhiều bạn trùng tên này => không nhận vơ nếu không có SĐT khớp
        if (sameNameCount > 1) return false;
        return true;
      }

      return false;
    });
  }, [activeMember, confirmedAttendees, currentRoster]);

  // Lấy danh sách 8 bạn báo có mặt gần nhất để xếp lớp avatar
  const recentConfirmed = useMemo(() => {
    return [...confirmedAttendees].reverse().slice(0, 8);
  }, [confirmedAttendees]);

  // Cuộn mượt đến form điểm danh
  const scrollToRsvpForm = () => {
    const el = document.getElementById('diem-danh');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Cuộn mượt đến danh sách các bạn đã điểm danh
  const scrollToConfirmedList = () => {
    const el = document.getElementById('danh-sach-diem-danh') || document.getElementById('confirmed-attendees-module');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Thông điệp mộc mạc theo từng mốc số lượng bạn bè báo về
  const getMotivationalNote = () => {
    if (confirmedCount >= 35) {
      return 'Gần như cả lớp đã tụ họp đủ rồi! Ai chưa kịp báo danh thì nhanh tay để Ban Liên Lạc chốt danh sách nhé!';
    }
    if (confirmedCount >= 25) {
      return 'Đã hơn nửa lớp báo về rồi, không khí đang xôm lắm anh em ơi! Bạn vào báo danh luôn cho vui nhé!';
    }
    if (confirmedCount >= 15) {
      return 'Anh em các tổ, các nhóm đang rủ nhau về dần rồi. Bạn bớt chút thời gian vào báo danh với lớp nhé!';
    }
    return '20 năm rồi mới có một dịp đông đủ thế này. Bạn bớt 1 phút vào báo danh để lớp chuẩn bị áo đồng phục và đón tiếp chu đáo nhé!';
  };

  return (
    <div className="bg-gradient-to-br from-[#FFFDF9] via-[#FAF6EE] to-[#F5EFE6] border-2 border-amber-300/80 rounded-2xl p-4 sm:p-6 md:p-7 shadow-md sm:shadow-lg relative overflow-hidden text-left transition-all">
      {/* Vệt trang trí ánh sáng nhẹ phía góc */}
      <div className="absolute -top-16 -right-16 w-48 h-48 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-rose-400/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 space-y-4 sm:space-y-5">
        
        {/* HÀNG 1: HUY HIỆU LIVE & TIÊU ĐỀ CHÍNH */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-amber-200/70 pb-3.5">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-[11px] sm:text-xs font-sans font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100/80 px-2.5 py-0.5 rounded-full border border-emerald-300/60 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-600" />
              Điểm danh trực tiếp
            </span>
          </div>

          <div className="text-xs sm:text-sm font-sans font-semibold text-amber-900/80">
            Sĩ số K8A1: <span className="font-bold text-[#1E293B]">{totalRoster} bạn</span>
          </div>
        </div>

        {/* HÀNG 2: THÔNG BÁO SỐ BẠN ĐÃ BÁO CÓ MẶT */}
        <div className="space-y-1.5">
          <h3 className="text-lg sm:text-xl md:text-2xl font-serif font-bold text-[#1E293B] leading-snug">
            Lớp mình đã có{' '}
            <span className="inline-block text-[#8B1E2D] bg-amber-100/90 px-2 py-0.5 rounded-md border border-amber-300 font-sans font-black text-xl sm:text-2xl md:text-3xl">
              {confirmedCount} / {totalRoster}
            </span>{' '}
            bạn báo có mặt rồi! 🎉
          </h3>
          
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-sans">
            {getMotivationalNote()}
          </p>
        </div>

        {/* HÀNG 3: THANH TIẾN ĐỘ SĨ SỐ */}
        <div className="space-y-1.5 bg-white/70 p-3 sm:p-3.5 rounded-xl border border-amber-200/80 shadow-inner">
          <div className="flex items-center justify-between text-xs sm:text-sm font-sans">
            <span className="font-medium text-slate-700 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-amber-700" />
              Đã tập hợp được:
            </span>
            <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              {percent}% cả lớp
            </span>
          </div>

          {/* Progress Bar Container */}
          <div className="w-full bg-slate-200/80 rounded-full h-3 sm:h-3.5 overflow-hidden p-0.5 shadow-inner">
            <div 
              className="bg-gradient-to-r from-amber-500 via-emerald-500 to-emerald-600 h-full rounded-full transition-all duration-700 shadow-sm"
              style={{ width: `${Math.max(percent, 5)}%` }}
            />
          </div>
        </div>

        {/* HÀNG 4: DẢI AVATAR BẠN BÈ & TÊN NHANH */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FCFAF5] p-3 sm:p-3.5 rounded-xl border border-amber-200/70">
          <div className="flex items-center gap-3 min-w-0">
            {/* Overlapping Avatars */}
            <div className="flex -space-x-2.5 overflow-hidden py-0.5 shrink-0">
              {recentConfirmed.map((att, idx) => {
                const colorClass = AVATAR_COLORS[idx % AVATAR_COLORS.length];
                const displayName = att.nickname ? att.nickname : att.fullName;
                const initial = displayName.charAt(0).toUpperCase();

                return (
                  <div
                    key={att.id || idx}
                    className={`inline-flex h-9 w-9 sm:h-10 sm:w-10 rounded-full ring-2 ring-white bg-gradient-to-br ${colorClass} font-serif font-bold text-xs sm:text-sm items-center justify-center shadow-xs select-none`}
                    title={`${att.fullName} ${att.nickname ? `("${att.nickname}")` : ''} - Đã báo có mặt`}
                  >
                    {att.avatarUrl ? (
                      <img 
                        src={att.avatarUrl} 
                        alt={att.fullName} 
                        className="h-full w-full rounded-full object-cover" 
                      />
                    ) : (
                      initial
                    )}
                  </div>
                );
              })}

              {confirmedCount > 8 && (
                <div 
                  className="inline-flex h-9 w-9 sm:h-10 sm:w-10 rounded-full ring-2 ring-white bg-[#1E293B] text-amber-300 font-sans font-bold text-[10px] sm:text-xs items-center justify-center shadow-xs cursor-pointer"
                  onClick={scrollToConfirmedList}
                  title="Bấm để xem toàn bộ danh sách"
                >
                  +{confirmedCount - 8}
                </div>
              )}
            </div>

            {/* Danh sách tên vừa điểm danh */}
            <div className="min-w-0 text-left">
              <p className="text-[11px] sm:text-xs font-medium text-slate-500 font-sans truncate">
                Vừa báo có mặt:
              </p>
              <p className="text-xs sm:text-sm font-semibold text-[#1E293B] font-sans truncate">
                {recentConfirmed.slice(0, 4).map(a => a.nickname || a.fullName.split(' ').pop()).join(', ')}
                {recentConfirmed.length > 4 ? '...' : ''}
              </p>
            </div>
          </div>

          {/* Lời nhắn cá nhân hóa nếu đã nhận diện activeMember */}
          {activeMember && (
            <div className="text-[11px] sm:text-xs font-sans rounded-lg px-2.5 py-1.5 bg-amber-100/70 border border-amber-300/60 text-amber-950 shrink-0 self-start sm:self-auto">
              {isActiveMemberConfirmed ? (
                <span className="flex items-center gap-1 text-emerald-800 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Chào <strong>{activeMember.fullName}</strong>! Bạn đã có tên trong danh sách rồi 👍</span>
                </span>
              ) : (
                <span className="flex items-center gap-1 text-amber-900 font-medium">
                  <Heart className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                  <span>Chào <strong>{activeMember.fullName}</strong>! Bạn bớt chút thời gian báo danh nhé!</span>
                </span>
              )}
            </div>
          )}
        </div>

        {/* HÀNG 5: 2 NÚT HÀNH ĐỘNG RÕ RÀNG, DỄ BẤM */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 pt-1">
          {/* Nút Chính: Báo danh ngay */}
          <button
            type="button"
            onClick={scrollToRsvpForm}
            className="w-full py-3 px-4 bg-gradient-to-r from-[#8B1E2D] via-[#9B2234] to-[#701524] hover:from-[#7A1926] hover:to-[#5E101D] text-white font-sans font-bold text-xs sm:text-sm uppercase tracking-wider rounded-xl shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 group active:scale-[0.99]"
          >
            <span>👉 Tôi đi! Báo danh ngay</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>

          {/* Nút Phụ: Xem danh sách bạn bè đã đi */}
          <button
            type="button"
            onClick={scrollToConfirmedList}
            className="w-full py-3 px-4 bg-white hover:bg-amber-50/80 text-amber-950 border border-amber-300/90 font-sans font-semibold text-xs sm:text-sm rounded-xl shadow-xs hover:shadow-sm transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 active:scale-[0.99]"
          >
            <Eye className="w-4 h-4 text-amber-700" />
            <span>Xem ai đã đi rồi ({confirmedCount})</span>
          </button>
        </div>

        {/* HÀNG 6: CÁC NÚT ĐIỀU HƯỚNG NHANH BỔ TRỢ */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-amber-200/60 text-[11px] font-sans text-slate-500">
          <span className="italic font-serif">Chuyển nhanh:</span>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => document.getElementById('bank-transfer-card')?.scrollIntoView({ behavior: 'smooth' })}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white hover:bg-amber-50 text-amber-900 border border-amber-200 transition cursor-pointer font-medium shadow-2xs"
            >
              <Coins className="w-3 h-3 text-emerald-600" />
              <span>Đóng Quỹ (VietQR)</span>
            </button>
            <button
              type="button"
              onClick={() => document.getElementById('dia-diem')?.scrollIntoView({ behavior: 'smooth' })}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white hover:bg-amber-50 text-amber-900 border border-amber-200 transition cursor-pointer font-medium shadow-2xs"
            >
              <MapPin className="w-3 h-3 text-amber-600" />
              <span>Địa Điểm Prime</span>
            </button>
            <button
              type="button"
              onClick={() => document.getElementById('ky-uc')?.scrollIntoView({ behavior: 'smooth' })}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white hover:bg-amber-50 text-amber-900 border border-amber-200 transition cursor-pointer font-medium shadow-2xs"
            >
              <Camera className="w-3 h-3 text-amber-600" />
              <span>Ký Ức 20 Năm</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
