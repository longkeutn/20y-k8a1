import React from 'react';
import { Award, QrCode, Sparkles, Check, CheckCircle2, Heart, Star, Calendar, MapPin, Shirt, Eye } from 'lucide-react';
import { normalizeShirtSize } from '../data';

interface LiveGoldenPassProps {
  fullName?: string;
  nickname?: string;
  shirtSize?: string;
  status: 'yes' | 'no';
  className?: string;
  memberId?: string;
  role?: string;
  isConfirmed?: boolean;
  checkedIn?: boolean;
  checkedInAt?: string;
  onOpenPassModal?: () => void;
}

export default function LiveGoldenPass({
  fullName,
  nickname,
  shirtSize = 'L',
  status,
  className = 'K8A1',
  memberId,
  role,
  isConfirmed = false,
  checkedIn = false,
  checkedInAt,
  onOpenPassModal
}: LiveGoldenPassProps) {
  const displayName = fullName && fullName.trim() ? fullName.trim() : 'Bạn Cũ K8A1';
  const passCode = memberId 
    ? `#K8A1-${memberId.toUpperCase()}` 
    : `#K8A1-${Math.abs(displayName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 900 + 100)}`;

  const isAttending = status === 'yes';
  const normalizedSize = normalizeShirtSize(shirtSize);

  return (
    <div className="relative group w-full">
      {/* KHỐI THẺ CHÍNH */}
      <div
        className={`relative overflow-hidden rounded-2xl border-2 transition-all duration-500 shadow-md hover:shadow-xl ${
          isAttending
            ? 'bg-gradient-to-br from-[#FFFDF9] via-[#FAF4E6] to-[#F5EACB] border-amber-300 text-slate-800'
            : 'bg-gradient-to-br from-[#F8FAFC] via-[#F1F5F9] to-[#E2E8F0] border-slate-300 text-slate-700'
        }`}
      >
        {/* HIỆU ỨNG PHẢN QUANG ÁNH KIM (HOLOGRAPHIC SHIMMER) */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />

        {/* HOA VĂN THỦ CÔNG GÓC CỔ ĐIỂN */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-amber-400/20 to-transparent pointer-events-none rounded-bl-full" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-amber-400/20 to-transparent pointer-events-none rounded-tr-full" />

        {/* ĐƯỜNG RÃNH BÉ VÉ (VINTAGE TICKET NOTCH / PERFORATION) */}
        <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#FAF7F2] border-r-2 border-amber-300/80 pointer-events-none z-10" />
        <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#FAF7F2] border-l-2 border-amber-300/80 pointer-events-none z-10" />

        {/* NỘI DUNG TẤM VÉ */}
        <div className="p-4 sm:p-5 relative z-0 space-y-3">
          
          {/* HEADER THẺ: VÉ VÀNG THANH XUÂN */}
          <div className="flex items-center justify-between border-b border-amber-200/80 pb-2.5 gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="p-1 rounded-md bg-amber-500/20 text-amber-900 shrink-0">
                <Award className="w-4 h-4 text-amber-700" />
              </span>
              <div className="min-w-0">
                <span className="text-[10px] sm:text-[11px] font-sans font-black uppercase tracking-wider text-amber-950 block">
                  Vé Vàng Thanh Xuân • Hội Ngộ 20 Năm
                </span>
                <span className="text-[9px] text-slate-500 font-serif italic block">
                  Lớp K8A1 (2003 — 2006) • THPT Thái Nguyên
                </span>
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className="inline-block px-2 py-0.5 font-mono font-black text-[11px] bg-white border border-amber-400/80 text-amber-950 rounded-md shadow-2xs">
                {passCode}
              </span>
            </div>
          </div>

          {/* PHẦN TRUNG TÂM: HỌ TÊN & DANH TÍNH */}
          <div className="text-center py-1.5 relative">
            <div className="text-[9.5px] uppercase font-sans font-bold tracking-wider text-amber-800/90 mb-0.5 flex items-center justify-center gap-1.5">
              <span>Hạng vé: Tri Kỷ 20 Năm</span>
              <span className="text-amber-400">•</span>
              <span>2006 ➔ 2026</span>
            </div>
            
            <h4 className="font-serif font-black text-xl sm:text-2xl text-[#1E293B] tracking-tight leading-tight">
              {displayName}
            </h4>

            <div className="flex flex-wrap items-center justify-center gap-1.5 mt-1">
              {nickname && nickname.trim() && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-100 to-amber-200/80 border border-amber-300 text-amber-950 font-serif font-bold text-xs shadow-2xs">
                  <Sparkles className="w-3 h-3 text-amber-700" />
                  <span>Biệt danh: “{nickname.trim()}”</span>
                </span>
              )}
              {role && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-400/50 text-amber-900 font-sans font-bold text-[10.5px]">
                  {role}
                </span>
              )}
            </div>

            {/* DÒNG TRẠNG THÁI HIỆN TẠI (SỬA LỖI KÝ TỰ $ VÀ TRANH CHẤP GIAO DIỆN) */}
            <div className="mt-2 text-xs font-serif italic text-slate-600">
              {isAttending ? (
                <span className={`font-sans font-semibold text-[11px] inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border ${
                  checkedIn
                    ? 'bg-emerald-100 text-emerald-900 border-emerald-400 shadow-2xs font-bold'
                    : isConfirmed 
                    ? 'bg-amber-100/90 text-amber-950 border-amber-300 shadow-2xs font-bold'
                    : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                }`}>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>
                    {checkedIn 
                      ? `Đã check-in có mặt ${checkedInAt ? `(${checkedInAt})` : 'tại sảnh trường'}` 
                      : isConfirmed 
                      ? 'Đã xác nhận có mặt chính thức' 
                      : 'Xác nhận tham dự hội ngộ'}
                  </span>
                </span>
              ) : (
                <span className="text-slate-600 font-sans font-semibold text-[11px] inline-flex items-center gap-1 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-300">
                  <Heart className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <span>Gửi gắm tình cảm yêu thương từ phương xa</span>
                </span>
              )}
            </div>

            {/* CON DẤU ĐỎ SÁP NIÊM PHONG (WAX SEAL STAMP) - CĂN CHỈNH TRÁNH CHE KHUẤT CHỮ */}
            {isConfirmed && (
              <div className="absolute right-0 -bottom-3 sm:right-1 sm:-bottom-4 rotate-[-10deg] pointer-events-none z-10 select-none drop-shadow-xl animate-fadeIn opacity-90 sm:opacity-95">
                <div className="w-16 h-16 sm:w-19 sm:h-19 rounded-full bg-gradient-to-br from-[#9B1E2D] via-[#7A1523] to-[#4D0A13] border-2 border-amber-300 shadow-xl flex flex-col items-center justify-center text-center p-1 text-white ring-2 ring-amber-400/40">
                  <div className="w-13.5 h-13.5 sm:w-16.5 sm:h-16.5 rounded-full border border-dashed border-amber-200/80 flex flex-col items-center justify-center p-0.5 bg-gradient-to-tr from-black/25 to-transparent">
                    <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-300 fill-amber-300/40 mb-0.5" />
                    <span className="text-[7.5px] sm:text-[9px] font-sans font-black uppercase tracking-wider leading-none text-amber-200">
                      {checkedIn ? 'ĐÃ CHECK-IN' : 'ĐÃ ĐIỂM DANH'}
                    </span>
                    <span className="text-[6px] sm:text-[7px] font-serif font-bold text-amber-300/90 tracking-wider mt-0.5 uppercase">
                      K8A1 • 20 NĂM
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* DẢI THÔNG SỐ VÉ: CHỈ GIỮ QUYỀN LỢI ÁO POLO, NGÀY VÀ ĐỊA ĐIỂM */}
          <div className="grid grid-cols-3 gap-2 pt-2.5 border-t border-dashed border-amber-300/80 bg-white/70 rounded-xl p-2 text-center">
            
            {/* Quyền lợi Áo Polo (Giữ nguyên theo yêu cầu) */}
            <div className="space-y-0.5">
              <span className="text-[9px] uppercase font-sans font-bold text-slate-500 block">
                Quyền Lợi Áo Polo
              </span>
              {isAttending ? (
                <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-sans font-bold text-xs rounded-md shadow-2xs">
                  <Shirt className="w-3 h-3 text-amber-100 shrink-0" />
                  <span>Size {normalizedSize}</span>
                </div>
              ) : (
                <span className="text-[11px] font-sans font-medium text-slate-400 block">—</span>
              )}
            </div>

            {/* Thời gian */}
            <div className="space-y-0.5">
              <span className="text-[9px] uppercase font-sans font-bold text-slate-500 block">
                Ngày Hội Ngộ
              </span>
              <span className="text-[11px] font-sans font-bold text-slate-800 block">
                27/09/2026
              </span>
            </div>

            {/* Điểm hẹn */}
            <div className="space-y-0.5">
              <span className="text-[9px] uppercase font-sans font-bold text-slate-500 block">
                Địa Điểm
              </span>
              <span className="text-[10px] font-sans font-bold text-slate-800 block truncate" title="THPT Thái Nguyên">
                THPT Thái Nguyên
              </span>
            </div>
          </div>

          {/* FOOTER THẺ & MÃ QR MÔ PHỎNG VÉ VÀO CỔNG */}
          <div className="flex items-center justify-between pt-2 text-[10.5px] text-slate-600 font-sans border-t border-amber-200/60">
            <div className="flex items-center gap-1.5">
              <QrCode className="w-4 h-4 text-amber-700 shrink-0" />
              <span>Vé điện tử check-in tại sảnh trường</span>
            </div>

            {onOpenPassModal && (
              <button
                type="button"
                onClick={onOpenPassModal}
                className="inline-flex items-center gap-1 text-amber-900 hover:text-amber-950 font-bold underline cursor-pointer transition-colors"
              >
                <Eye className="w-3 h-3" />
                <span>Xem bản in & HD ➔</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
