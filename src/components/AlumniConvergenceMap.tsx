import React, { useState, useMemo } from 'react';
import {
  MapPin,
  Navigation,
  Copy,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserRole, VenueMediaItem, EventConfig } from '../types';

// ============================================================================
// CONSTANTS & VENUE METADATA (TRUNG TÂM SỰ KIỆN & NHÀ HÀNG PRIME THÁI NGUYÊN)
// ============================================================================
export const VENUE_DETAILS = {
  name: 'Trung Tâm Sự Kiện & Nhà Hàng Prime Thái Nguyên',
  subtitle: 'Địa điểm tổ chức Họp Lớp 20 Năm Ngày Trở Về — Lớp K8A1',
  address: 'Số 1 đường Hoàng Văn Thụ, P. Phan Đình Phùng, TP. Thái Nguyên, Tỉnh Thái Nguyên',
  shortAddress: 'Số 1 Hoàng Văn Thụ, TP. Thái Nguyên',
  eventTime: 'Từ 08:30 Sáng — Chủ Nhật, ngày 27/09/2026',
  googleMapsUrl: 'https://maps.app.goo.gl/a3utiYosZqGHKDjYA',
  directionsUrl: 'https://www.google.com/maps/dir/?api=1&destination=21.5949009,105.8386089',
  embedMapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d600!2d105.8386089!3d21.5949009!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x52211cf3f4926b%3A0x6de9f091b88c49ab!2sTh%C3%A1p%20%C4%91%C3%B4i%20Prime%20Th%C3%A1i%20Nguy%C3%AAn!5e1!3m2!1svi!2svn!4v1725550000000!5m2!1svi!2svn'
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

  // Chế độ xem: Mặc định là 'satellite' (Ảnh chụp vệ tinh thực địa có tên đường) và Zoom 'close' (~600m sát tòa nhà)
  const [mapViewMode, setMapViewMode] = useState<'satellite' | 'roadmap'>('satellite');
  const [mapZoomLevel, setMapZoomLevel] = useState<'close' | 'wide'>('close');

  // Dynamic venue values from eventConfig
  const venueName = eventConfig?.venueName || VENUE_DETAILS.name;
  const venueAddress = eventConfig?.venueAddress || VENUE_DETAILS.address;
  const rawMapEmbedUrl = eventConfig?.mapEmbedUrl || VENUE_DETAILS.embedMapUrl;
  const directionsUrl = eventConfig?.mapDirectUrl || VENUE_DETAILS.directionsUrl;
  const eventDateText = eventConfig?.eventDateText || "Ngày hội ngộ";

  // Tự động tinh chỉnh URL Google Maps sang chế độ Vệ tinh / Bản đồ số và Mức Zoom tương ứng
  const activeMapUrl = useMemo(() => {
    let url = rawMapEmbedUrl;
    if (!url) return '';

    // 1. Xử lý định dạng PB URL (!5e... và !1d...)
    if (url.includes('!5e')) {
      // 5e1: Vệ tinh (Hybrid có nhãn đường), 5e0: Bản đồ số vector
      url = mapViewMode === 'satellite'
        ? url.replace(/!5e[0-9]/, '!5e1')
        : url.replace(/!5e[0-9]/, '!5e0');

      // 1d600: Zoom sát (~600m thấy rõ khuôn viên, bãi đỗ xe), 1d3710: Toàn cảnh TP Thái Nguyên
      if (mapZoomLevel === 'close') {
        url = url.replace(/!1d[0-9.]+/g, '!1d600');
      } else {
        url = url.replace(/!1d[0-9.]+/g, '!1d3710');
      }
      return url;
    }

    // 2. Xử lý định dạng URL chuẩn Google Maps (?q=...&t=...&z=...)
    if (url.includes('google.com/maps')) {
      const tVal = mapViewMode === 'satellite' ? 'h' : 'm';
      const zVal = mapZoomLevel === 'close' ? '18' : '15';

      if (/[?&]t=[^&]*/.test(url)) {
        url = url.replace(/([?&]t=)[^&]*/, '$1' + tVal);
      } else {
        url += (url.includes('?') ? '&' : '?') + 't=' + tVal;
      }

      if (/[?&]z=[^&]*/.test(url)) {
        url = url.replace(/([?&]z=)[^&]*/, '$1' + zVal);
      } else {
        url += '&z=' + zVal;
      }
      return url;
    }

    return url;
  }, [rawMapEmbedUrl, mapViewMode, mapZoomLevel]);

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
          
          {/* Header Bản Đồ & Bộ Điều Khiển Chế Độ Xem */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold shrink-0">
                <MapPin className="w-4 h-4 text-amber-700" />
              </div>
              <div className="min-w-0">
                <h4 className="font-serif font-bold text-sm sm:text-base text-slate-800 flex items-center gap-2">
                  <span>Bản Đồ Google Maps</span>
                  <span className="text-[10px] font-sans font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Bãi đỗ xe rộng rãi
                  </span>
                </h4>
                <p className="text-xs text-slate-500 font-sans truncate">
                  {venueAddress}
                </p>
              </div>
            </div>

            {/* Cụm Phím Chuyển Đổi Chế Độ & Mức Zoom */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              {/* Chế độ: Vệ tinh vs Bản đồ */}
              <div className="inline-flex p-0.5 bg-slate-100 rounded-lg border border-slate-200/80 text-xs font-sans font-bold">
                <button
                  type="button"
                  onClick={() => setMapViewMode('satellite')}
                  className={`px-2.5 py-1 rounded-md text-[11px] transition-all flex items-center gap-1 cursor-pointer ${
                    mapViewMode === 'satellite'
                      ? 'bg-[#1E293B] text-amber-300 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Chế độ vệ tinh (Chụp thực địa độ nét cao có nhãn đường)"
                >
                  <span>🛰️ Vệ tinh</span>
                  {mapViewMode === 'satellite' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
                </button>
                <button
                  type="button"
                  onClick={() => setMapViewMode('roadmap')}
                  className={`px-2.5 py-1 rounded-md text-[11px] transition-all flex items-center gap-1 cursor-pointer ${
                    mapViewMode === 'roadmap'
                      ? 'bg-[#1E293B] text-amber-300 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Bản đồ giao thông đường nét tiêu chuẩn"
                >
                  <span>🗺️ Bản đồ</span>
                  {mapViewMode === 'roadmap' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
                </button>
              </div>

              {/* Tầm nhìn: Sát tòa nhà vs Bao quát TP */}
              <div className="inline-flex p-0.5 bg-slate-100 rounded-lg border border-slate-200/80 text-xs font-sans font-bold">
                <button
                  type="button"
                  onClick={() => setMapZoomLevel('close')}
                  className={`px-2.5 py-1 rounded-md text-[11px] transition-all flex items-center gap-1 cursor-pointer ${
                    mapZoomLevel === 'close'
                      ? 'bg-amber-800 text-amber-100 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Phóng to sát (~600m - Thấy rõ khuôn viên, tòa nhà, bãi đỗ xe)"
                >
                  <span>🔍 Sát tòa nhà</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMapZoomLevel('wide')}
                  className={`px-2.5 py-1 rounded-md text-[11px] transition-all flex items-center gap-1 cursor-pointer ${
                    mapZoomLevel === 'wide'
                      ? 'bg-amber-800 text-amber-100 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Bao quát toàn cảnh thành phố Thái Nguyên (~3.7km)"
                >
                  <span>🌐 Bao quát TP</span>
                </button>
              </div>
            </div>
          </div>

          {/* Khung Google Maps Lớn, Toàn Chiều Rộng */}
          <div className="relative rounded-xl overflow-hidden border border-amber-300/50 shadow-inner h-[360px] sm:h-[440px] md:h-[500px] w-full bg-[#E5E3DF]">
            <iframe
              key={activeMapUrl}
              title={`Bản đồ Google Maps ${venueName}`}
              src={activeMapUrl}
              className="w-full h-full border-0"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer"
            />

            {/* Badge chỉ báo chế độ hiện tại */}
            <div className="absolute top-2.5 left-2.5 bg-black/75 backdrop-blur-md text-white px-2.5 py-1 rounded-lg text-[10px] font-sans font-bold flex items-center gap-1.5 shadow-md border border-white/20 pointer-events-none">
              <span>{mapViewMode === 'satellite' ? '🛰️ Vệ Tinh Thực Địa' : '🗺️ Bản Đồ Giao Thông'}</span>
              <span className="text-amber-400">•</span>
              <span>{mapZoomLevel === 'close' ? 'Cận cảnh (~600m)' : 'Toàn cảnh TP'}</span>
            </div>
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
