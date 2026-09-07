import React from 'react';
import { Award, QrCode, Sparkles, Check, CheckCircle2, Heart, Star, Calendar, MapPin, Shirt, Eye } from 'lucide-react';

interface LiveGoldenPassProps {
  fullName?: string;
  nickname?: string;
  shirtSize?: string;
  status: 'yes' | 'no';
  className?: string;
  memberId?: string;
  isConfirmed?: boolean;
  onOpenPassModal?: () => void;
}

export default function LiveGoldenPass({
  fullName,
  nickname,
  shirtSize = 'L',
  status,
  className = 'K8A1',
  memberId,
  isConfirmed = false,
  onOpenPassModal
}: LiveGoldenPassProps) {
  const displayName = fullName && fullName.trim() ? fullName.trim() : 'Bạn Cũ K8A1';
  const passCode = memberId 
    ? `#K8A1-${memberId.toUpperCase()}` 
    : `#K8A1-${Math.abs(displayName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 900 + 100)}`;

  const isAttending = status === 'yes';

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
        <div className="p-4 sm:p-5 relative z-0 space-y-3.5">
          
          {/* HEADER THẺ */}
          <div className="flex items-center justify-between border-b border-amber-200/80 pb-2.5 gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="p-1 rounded-md bg-amber-500/15 text-amber-900 shrink-0">
                <Award className="w-4 h-4 text-amber-700" />
              </span>
              <div className="min-w-0">
                <span className="text-[10px] sm:text-[11px] font-sans font-bold uppercase tracking-widest text-amber-900 block truncate">
                  Thẻ Kỷ Niệm 20 Năm Hội Ngộ
                </span>
                <span className="text-[9px] text-slate-500 font-serif italic block">
                  Niên khóa 2003 — 2006 • THPT Thái Nguyên
                </span>
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className="inline-block px-2 py-0.5 font-mono font-bold text-[11px] bg-white/80 border border-amber-300/80 text-amber-950 rounded-md shadow-2xs">
                {passCode}
              </span>
            </div>
          </div>

          {/* PHẦN TRUNG TÂM: HỌ TÊN & DANH TÍNH */}
          <div className="text-center py-2 relative">
            <div className="text-[10px] uppercase font-sans font-bold tracking-widest text-slate-500 mb-0.5">
              Cựu Học Sinh Lớp {className}
            </div>
            
            <h4 className="font-serif font-black text-xl sm:text-2xl text-[#1E293B] tracking-tight leading-tight">
              {displayName}
            </h4>

            {nickname && nickname.trim() && (
              <div className="mt-1">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-100 to-amber-200/70 border border-amber-300 text-amber-950 font-serif font-bold text-xs shadow-2xs">
                  <Sparkles className="w-3 h-3 text-amber-700" />
                  <span>Biệt danh: “{nickname.trim()}”</span>
                </span>
              </div>
            )}

            {/* DÒNG TRẠNG THÁI HIỆN TẠI */}
            <div className="mt-2 text-xs font-serif italic text-slate-600">
              {isAttending ? (
                <span className="text-emerald-800 font-sans font-semibold text-[11px] inline-flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Xác nhận tham dự hội ngộ trực tiếp</span>
                </span>
              ) : (
                <span className="text-slate-600 font-sans font-semibold text-[11px] inline-flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded border border-slate-300">
                  <Heart className="w-3.5 h-3.5 text-rose-500" />
                  <span>Gửi gắm tình cảm yêu thương từ phương xa</span>
                </span>
              )}
            </div>

            {/* CON DẤU ĐỎ SÁP NIÊM PHONG (WAX SEAL STAMP) KHI ĐÃ GỬI XÁC NHẬN */}
            {isConfirmed && (
              <div className="absolute right-1 -bottom-2 sm:right-3 sm:-bottom-3 rotate-[-12deg] pointer-events-none animate-bounce-short z-20">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-rose-600 via-rose-700 to-rose-900 border-2 border-amber-300 shadow-md flex flex-col items-center justify-center text-center p-1 text-white ring-2 ring-rose-400/40">
                  <div className="w-14 h-14 sm:w-18 sm:h-18 rounded-full border border-dashed border-amber-200/70 flex flex-col items-center justify-center p-0.5">
                    <Star className="w-2.5 h-2.5 text-amber-300 fill-amber-300 mb-0.5" />
                    <span className="text-[8px] sm:text-[9px] font-sans font-black uppercase tracking-wider leading-tight text-amber-200">
                      ĐÃ ĐIỂM DANH
                    </span>
                    <span className="text-[7px] font-serif font-bold text-amber-100">
                      K8A1 • 20 NĂM
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* DẢI THÔNG SỐ VÉ (SIZE ÁO, ĐỊA ĐIỂM, CHECK-IN) */}
          <div className="grid grid-cols-3 gap-2 pt-2.5 border-t border-dashed border-amber-300/80 bg-white/60 rounded-xl p-2.5 text-center">
            
            {/* Size Áo */}
            <div className="space-y-0.5">
              <span className="text-[9px] uppercase font-sans font-bold text-slate-500 block">
                Size Áo Polo
              </span>
              {isAttending ? (
                <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-500 text-white font-mono font-black text-xs rounded-md shadow-2xs">
                  <Shirt className="w-3 h-3 text-amber-200" />
                  <span>Size {shirtSize}</span>
                </div>
              ) : (
                <span className="text-[11px] font-sans font-medium text-slate-400 block">—</span>
              )}
            </div>

            {/* Thời gian */}
            <div className="space-y-0.5">
              <span className="text-[9px] uppercase font-sans font-bold text-slate-500 block">
                Ngày Tụ Họp
              </span>
              <span className="text-[11px] font-sans font-bold text-slate-800 block">
                09/2026
              </span>
            </div>

            {/* Điểm hẹn */}
            <div className="space-y-0.5">
              <span className="text-[9px] uppercase font-sans font-bold text-slate-500 block">
                Địa Điểm
              </span>
              <span className="text-[10px] font-sans font-bold text-slate-800 block truncate" title="TP. Thái Nguyên">
                Thái Nguyên
              </span>
            </div>
          </div>

          {/* FOOTER THẺ & MÃ QR MÔ PHỎNG VÉ VÀO CỔNG */}
          <div className="flex items-center justify-between pt-2 text-[10px] text-slate-500 font-sans border-t border-amber-200/60">
            <div className="flex items-center gap-1.5">
              <QrCode className="w-4 h-4 text-amber-700 shrink-0" />
              <span>Vé điện tử có giá trị check-in ngày hội</span>
            </div>

            {onOpenPassModal && (
              <button
                type="button"
                onClick={onOpenPassModal}
                className="inline-flex items-center gap-1 text-amber-800 hover:text-amber-950 font-bold underline cursor-pointer transition-colors"
              >
                <Eye className="w-3 h-3" />
                <span>Xem bản in ➔</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
