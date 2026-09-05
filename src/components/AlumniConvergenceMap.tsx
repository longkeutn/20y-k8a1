import React, { useState } from 'react';
import {
  MapPin,
  Navigation,
  Copy,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserRole, VenueMediaItem, EventConfig } from '../types';

// ============================================================================
// CONSTANTS & VENUE METADATA (CROWN PALACE THÁI NGUYÊN)
// ============================================================================
export const VENUE_DETAILS = {
  name: 'Trung Tâm Tiệc Cưới & Sự Kiện Crown Palace',
  subtitle: 'Địa điểm tổ chức Họp Lớp 20 Năm Ngày Trở Về — Lớp K8A1',
  address: 'Số 779 đường Dương Tự Minh, P. Quang Vinh, TP. Thái Nguyên, Tỉnh Thái Nguyên',
  shortAddress: '779 Dương Tự Minh, TP. Thái Nguyên',
  eventTime: 'Từ 08:30 Sáng — Chủ Nhật, ngày 27/09/2026',
  googleMapsUrl: 'https://maps.google.com/?q=Crown+Palace+779+D%C6%B0%C6%A1ng+T%E1%BB%B1+Minh+Th%C3%A1i+Nguy%C3%AAn&ll=21.6041,105.8286&z=16',
  directionsUrl: 'https://www.google.com/maps/dir/?api=1&destination=21.6041,105.8286',
  embedMapUrl: 'https://maps.google.com/maps?q=Crown+Palace+779+D%C6%B0%C6%A1ng+T%E1%BB%B1+Minh+Th%C3%A1i+Nguy%C3%AAn&t=&z=15&ie=UTF8&iwloc=&output=embed'
};

// Media mặc định minh họa không gian tổ chức họp lớp tại Crown Palace (giữ lại để tương thích ngược)
export const DEFAULT_VENUE_MEDIA: VenueMediaItem[] = [
  {
    id: 'vm-1',
    title: 'Không Gian Sảnh Tiệc & Sân Khấu Crown Palace',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    thumbnail: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80',
    desc: 'Không gian sảnh tiệc chính chuẩn bị đón tiếp đại gia đình K8A1 nhân kỷ niệm 20 năm.'
  }
];

// Hàm parse VenueMedia (giữ lại để tương thích ngược nếu có file khác import)
export function parseVenueMedia(url: string): {
  type: 'youtube' | 'facebook' | 'drive' | 'direct_video' | 'image' | 'empty';
  embedUrl: string;
  rawUrl: string;
  canonicalUrl: string;
  label: string;
  isReel?: boolean;
  videoId?: string;
  driveId?: string;
} {
  if (!url || typeof url !== 'string') {
    return { type: 'empty', embedUrl: '', rawUrl: '', canonicalUrl: '', label: 'Trống' };
  }
  const cleanUrl = url.trim();
  const ytMatch = cleanUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
  if (ytMatch && ytMatch[1]) {
    return {
      type: 'youtube',
      embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=0&rel=0`,
      rawUrl: cleanUrl,
      canonicalUrl: `https://www.youtube.com/watch?v=${ytMatch[1]}`,
      videoId: ytMatch[1],
      label: 'YouTube Video'
    };
  }
  return { type: 'image', embedUrl: cleanUrl, rawUrl: cleanUrl, canonicalUrl: cleanUrl, label: 'Hình ảnh' };
}

// ============================================================================
// STREAMLINED ALUMNI CONVERGENCE MAP (BẢN ĐỒ RỘNG RÃI, RÕ NÉT, TINH TẾ)
// ============================================================================
interface Props {
  className?: string;
  eventConfig?: EventConfig;
  venueMediaList?: VenueMediaItem[];
  onUpdateVenueMediaList?: (list: VenueMediaItem[]) => void;
  currentUserRole?: UserRole;
  onOpenAdminHub?: (tab?: 'members' | 'fund' | 'wishes' | 'media' | 'settings', subTab?: 'banner' | 'videos' | 'photos') => void;
}

export default function AlumniConvergenceMap({
  className = '',
  eventConfig
}: Props) {
  const [copied, setCopied] = useState(false);

  // Dynamic venue values from eventConfig
  const venueName = eventConfig?.venueName || VENUE_DETAILS.name;
  const venueAddress = eventConfig?.venueAddress || VENUE_DETAILS.address;
  const mapEmbedUrl = eventConfig?.mapEmbedUrl || VENUE_DETAILS.embedMapUrl;
  const directionsUrl = eventConfig?.mapDirectUrl || VENUE_DETAILS.directionsUrl;
  const eventDateText = eventConfig?.eventDateText || "Ngày hội ngộ";

  // Sao chép địa chỉ nhà hàng
  const handleCopyAddress = () => {
    try {
      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(venueAddress);
      }
    } catch {}
    setCopied(true);
    confetti({ particleCount: 20, spread: 45, origin: { y: 0.8 } });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="dia-diem" className={`space-y-4 scroll-mt-20 ${className}`}>
      {/* Anchor hỗ trợ liên kết cũ #tu-hoi */}
      <span id="tu-hoi" className="block -mt-20 pt-20" aria-hidden="true" />

      {/* 🌟 KHUNG CHÍNH GỌN GÀNG: ĐỊA ĐIỂM HỌP LỚP */}
      <div className="bg-[#FAF7F2] border border-amber-200/90 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-md relative overflow-hidden space-y-4 text-left">
        
        {/* Nền hoa văn vân sáng tinh tế */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-amber-200/20 via-orange-100/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        {/* HEADER ĐỊA ĐIỂM HỌP LỚP */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-amber-300/60 pb-3.5 gap-3 relative z-10 text-left">
          <div className="space-y-1 min-w-0">
            <span className="text-[11px] uppercase tracking-widest font-sans font-bold text-amber-800 block">
              Địa Điểm Tổ Chức Họp Lớp ({eventDateText})
            </span>

            <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#1E293B] tracking-tight truncate">
              {venueName}
            </h3>

            <p className="text-xs text-slate-600 font-serif line-clamp-1">
              {venueAddress}
            </p>
          </div>

          {/* Action Button: Chỉ Đường Trực Tiếp */}
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white rounded-xl text-xs font-sans font-bold uppercase tracking-wider shadow-sm hover:shadow-md transition-all cursor-pointer"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Chỉ Đường</span>
            </a>
          </div>
        </div>

        {/* 🗺️ BẢN ĐỒ GOOGLE MAPS RỘNG RÃI, NỔI BẬT TOÀN DIỆN */}
        <div className="bg-white rounded-2xl border border-amber-200/90 p-3.5 sm:p-5 shadow-xs flex flex-col space-y-3.5 relative z-10">
          
          {/* Header Bản Đồ */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold shrink-0">
                <MapPin className="w-4 h-4 text-amber-700" />
              </div>
              <div className="min-w-0">
                <h4 className="font-serif font-bold text-sm sm:text-base text-slate-800">
                  Bản Đồ Chỉ Đường Trực Tiếp (Google Maps)
                </h4>
                <p className="text-xs text-slate-500 font-sans truncate">
                  {venueAddress}
                </p>
              </div>
            </div>
            <span className="text-[11px] font-sans font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 shrink-0 self-start sm:self-auto">
              ✓ Có chỗ đỗ ô tô & xe máy rộng rãi
            </span>
          </div>

          {/* Khung Google Maps Lớn, Toàn Chiều Rộng */}
          <div className="relative rounded-xl overflow-hidden border border-amber-300/50 shadow-inner h-[340px] sm:h-[420px] md:h-[480px] w-full bg-[#E5E3DF]">
            <iframe
              title={`Bản đồ Google Maps ${venueName}`}
              src={mapEmbedUrl}
              className="w-full h-full border-0"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer"
            />
          </div>

          {/* Thanh Tác Vụ Dưới Bản Đồ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white rounded-xl text-xs font-sans font-bold uppercase tracking-wider shadow-sm hover:shadow-md transition-all cursor-pointer"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Chỉ Đường Google Maps</span>
            </a>

            <button
              type="button"
              onClick={handleCopyAddress}
              className="inline-flex items-center justify-center gap-1.5 py-2.5 px-4 bg-white hover:bg-amber-50 text-slate-700 border border-slate-300/90 rounded-xl text-xs font-sans font-bold uppercase tracking-wider transition-all shadow-2xs cursor-pointer"
              title="Sao chép địa chỉ"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
              <span>{copied ? 'Đã Chép Địa Chỉ' : 'Sao Chép Địa Chỉ'}</span>
            </button>
          </div>

        </div>

      </div>
    </section>
  );
}
