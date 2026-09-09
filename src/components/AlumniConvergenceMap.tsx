import React, { useState, useMemo } from 'react';
import {
  MapPin,
  Navigation,
  Copy,
  Check,
  School,
  UtensilsCrossed,
  Clock,
  Car,
  ArrowRight,
  ExternalLink,
  Sparkles,
  Compass
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserRole, VenueMediaItem, EventConfig } from '../types';

// ============================================================================
// CONSTANTS & FALLBACKS FOR 2-STAGE VENUES
// ============================================================================
export const VENUE_1_FALLBACK = {
  name: 'Trường THPT Thái Nguyên',
  subtitle: 'Chặng 1: Đón tiếp nhận áo, thăm trường xưa, chụp ảnh lưu niệm & tri ân Thầy Cô',
  address: 'Số 127 đường Lương Thế Vinh, P. Quang Trung, TP. Thái Nguyên, Tỉnh Thái Nguyên',
  shortAddress: '127 Lương Thế Vinh, TP. Thái Nguyên',
  time: '08:30 — 11:00 (Sáng)',
  activity: 'Đón tiếp nhận áo polo • Thẻ học sinh tri kỷ • Thăm lớp học xưa • Chụp ảnh lưu niệm sân trường • Tri ân Thầy Cô',
  directionsUrl: 'https://www.google.com/maps/search/?api=1&query=Tr%C6%B0%E1%BB%9Dng+THPT+Th%C3%A1i+Nguy%C3%AAn,+127+L%C6%B0%C6%A1ng+Th%E1%BA%BF+Vinh,+Th%C3%A1i+Nguy%C3%AAn',
  embedMapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3710.2798642279267!2d105.8285514!3d21.5740443!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135272a24921915%3A0xe543df5e9e03fa54!2zVHLGsOG7nW5nIFRIUFQgVGjDoWkgTmd1ecOqbg!5e0!3m2!1svi!2svn!4v1710000000000!5m2!1svi!2svn'
};

export const VENUE_2_FALLBACK = {
  name: 'Trung Tâm Sự Kiện & Nhà Hàng Prime Thái Nguyên',
  subtitle: 'Chặng 2: Khai tiệc liên hoan, nâng ly chúc mừng 20 năm, giao lưu văn nghệ & trao kỷ vật',
  address: 'Số 1 đường Hoàng Văn Thụ, P. Phan Đình Phùng, TP. Thái Nguyên, Tỉnh Thái Nguyên',
  shortAddress: 'Số 1 Hoàng Văn Thụ, TP. Thái Nguyên',
  time: '11:30 — 15:30 (Trưa & Chiều)',
  activity: 'Khai tiệc liên hoan • Nâng ly chúc mừng 20 năm • Giao lưu âm nhạc & chuyện đời tri kỷ • Trao kỷ vật hội ngộ',
  directionsUrl: 'https://maps.app.goo.gl/a3utiYosZqGHKDjYA',
  embedMapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d600!2d105.8386089!3d21.5949009!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x52211cf3f4926b%3A0x6de9f091b88c49ab!2sTh%C3%A1p%20%C4%91%C3%B4i%20Prime%20Th%C3%A1i%20Nguy%C3%AAn!5e1!3m2!1svi!2svn!4v1725550000000!5m2!1svi!2svn'
};

export const ROUTE_FALLBACK = {
  distanceText: '~1.5km (Di chuyển 5 - 10 phút)',
  routeDirectUrl: 'https://www.google.com/maps/dir/?api=1&origin=Tr%C6%B0%E1%BB%9Dng+THPT+Th%C3%A1i+Nguy%C3%AAn,+127+L%C6%B0%C6%A1ng+Th%E1%BA%BF+Vinh,+Th%C3%A1i+Nguy%C3%AAn&destination=Th%C3%A1p+%C4%91%C3%B4i+Prime+Th%C3%A1i+Nguy%C3%AAn,+S%E1%BB%91+1+Ho%C3%A0ng+V%C4%83n+Th%E1%BB%A5,+Th%C3%A1i+Nguy%C3%AAn'
};

// Giữ lại alias VENUE_DETAILS để tương thích ngược nếu có file khác import
export const VENUE_DETAILS = {
  name: VENUE_2_FALLBACK.name,
  subtitle: VENUE_2_FALLBACK.subtitle,
  address: VENUE_2_FALLBACK.address,
  shortAddress: VENUE_2_FALLBACK.shortAddress,
  eventTime: 'Từ 08:30 Sáng — Chủ Nhật, ngày 27/09/2026',
  googleMapsUrl: VENUE_2_FALLBACK.directionsUrl,
  directionsUrl: VENUE_2_FALLBACK.directionsUrl,
  embedMapUrl: VENUE_2_FALLBACK.embedMapUrl
};

// Media mặc định minh họa không gian tổ chức (giữ lại để tương thích ngược)
export const DEFAULT_VENUE_MEDIA: VenueMediaItem[] = [
  {
    id: 'vm-1',
    title: 'Không Gian Họp Lớp K8A1',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    thumbnail: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80',
    desc: 'Không gian chuẩn bị đón tiếp đại gia đình K8A1 nhân kỷ niệm 20 năm.'
  }
];

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
// COMPONENT
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
  // Chế độ 2 chặng: mặc định bật (true nếu không cấu hình rõ false)
  const isTwoVenues = eventConfig?.enableTwoVenues !== false;

  // Tab chặng đang được chọn hiển thị trên bản đồ (1: Trường cũ, 2: Nhà hàng)
  const [activeStage, setActiveStage] = useState<1 | 2>(1);

  // Trạng thái copy địa chỉ riêng cho từng chặng
  const [copiedStage, setCopiedStage] = useState<1 | 2 | null>(null);

  // Chế độ xem: 'satellite' (Vệ tinh chụp thực địa) vs 'roadmap' (Bản đồ số)
  const [mapViewMode, setMapViewMode] = useState<'satellite' | 'roadmap'>('satellite');
  // Mức Zoom: 'close' (~600m sát tòa nhà) vs 'wide' (~3.7km toàn cảnh TP)
  const [mapZoomLevel, setMapZoomLevel] = useState<'close' | 'wide'>('close');

  // Dynamic values cho Chặng 1 (Trường THPT Thái Nguyên)
  const stage1Name = eventConfig?.venueName || VENUE_1_FALLBACK.name;
  const stage1Subtitle = eventConfig?.venueSubtitle || VENUE_1_FALLBACK.subtitle;
  const stage1Address = eventConfig?.venueAddress || VENUE_1_FALLBACK.address;
  const stage1ShortAddress = eventConfig?.shortAddress || VENUE_1_FALLBACK.shortAddress;
  const stage1Time = eventConfig?.venueTime || VENUE_1_FALLBACK.time;
  const stage1Activity = eventConfig?.venueActivity || VENUE_1_FALLBACK.activity;
  const stage1DirectionsUrl = eventConfig?.mapDirectUrl || VENUE_1_FALLBACK.directionsUrl;
  const stage1RawEmbedUrl = eventConfig?.mapEmbedUrl || VENUE_1_FALLBACK.embedMapUrl;

  // Dynamic values cho Chặng 2 (Nhà Hàng Prime Thái Nguyên)
  const stage2Name = eventConfig?.venue2Name || VENUE_2_FALLBACK.name;
  const stage2Subtitle = eventConfig?.venue2Subtitle || VENUE_2_FALLBACK.subtitle;
  const stage2Address = eventConfig?.venue2Address || VENUE_2_FALLBACK.address;
  const stage2ShortAddress = eventConfig?.venue2ShortAddress || VENUE_2_FALLBACK.shortAddress;
  const stage2Time = eventConfig?.venue2Time || VENUE_2_FALLBACK.time;
  const stage2Activity = eventConfig?.venue2Activity || VENUE_2_FALLBACK.activity;
  const stage2DirectionsUrl = eventConfig?.venue2MapDirectUrl || VENUE_2_FALLBACK.directionsUrl;
  const stage2RawEmbedUrl = eventConfig?.venue2MapEmbedUrl || VENUE_2_FALLBACK.embedMapUrl;

  // Dynamic values lộ trình di chuyển
  const routeDistanceText = eventConfig?.routeDistanceText || ROUTE_FALLBACK.distanceText;
  const routeDirectUrl = eventConfig?.routeDirectUrl || ROUTE_FALLBACK.routeDirectUrl;
  const eventDateText = eventConfig?.eventDateText || "Chủ Nhật, 27/09/2026";

  // Thông tin chặng đang chọn hiển thị trên bản đồ
  const currentStageName = activeStage === 1 ? stage1Name : stage2Name;
  const currentStageAddress = activeStage === 1 ? stage1Address : stage2Address;
  const currentStageDirectionsUrl = activeStage === 1 ? stage1DirectionsUrl : stage2DirectionsUrl;
  const currentStageRawEmbedUrl = activeStage === 1 ? stage1RawEmbedUrl : stage2RawEmbedUrl;

  // Tinh chỉnh URL Google Maps theo chế độ Vệ tinh và Mức Zoom
  const activeMapUrl = useMemo(() => {
    let url = currentStageRawEmbedUrl;
    if (!url) return '';

    if (url.includes('!5e')) {
      url = mapViewMode === 'satellite'
        ? url.replace(/!5e[0-9]/, '!5e1')
        : url.replace(/!5e[0-9]/, '!5e0');

      if (mapZoomLevel === 'close') {
        url = url.replace(/!1d[0-9.]+/g, '!1d600');
      } else {
        url = url.replace(/!1d[0-9.]+/g, '!1d3710');
      }
      return url;
    }

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
  }, [currentStageRawEmbedUrl, mapViewMode, mapZoomLevel]);

  // Xử lý sao chép địa chỉ từng chặng
  const handleCopy = (stage: 1 | 2, text: string) => {
    try {
      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(text);
      }
    } catch {}
    setCopiedStage(stage);
    confetti({ particleCount: 20, spread: 45, origin: { y: 0.8 } });
    setTimeout(() => setCopiedStage(null), 2000);
  };

  // Chuyển chuỗi hoạt động thành mảng các gạch đầu dòng
  const stage1Activities = useMemo(() => {
    return stage1Activity.split(/[•|\n]/).map(s => s.trim()).filter(Boolean);
  }, [stage1Activity]);

  const stage2Activities = useMemo(() => {
    return stage2Activity.split(/[•|\n]/).map(s => s.trim()).filter(Boolean);
  }, [stage2Activity]);

  return (
    <section id="dia-diem" className={`space-y-4 scroll-mt-20 ${className}`}>
      {/* Anchor hỗ trợ liên kết cũ #tu-hoi */}
      <span id="tu-hoi" className="block -mt-20 pt-20" aria-hidden="true" />

      {/* 🌟 KHUNG CHÍNH: HÀNH TRÌNH HỘI NGỘ */}
      <div className="bg-[#FAF7F2] border border-amber-200/90 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-md relative overflow-hidden space-y-5 text-left">
        
        {/* Nền hoa văn vân sáng tinh tế */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-amber-200/20 via-orange-100/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        {/* ======================================================== */}
        {/* 1. HEADER KHỐI ĐỊA ĐIỂM */}
        {/* ======================================================== */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-amber-300/60 pb-3.5 gap-3 relative z-10 text-left">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] uppercase tracking-widest font-sans font-bold text-amber-800 bg-amber-100/80 px-2.5 py-0.5 rounded-full border border-amber-200">
                📍 {isTwoVenues ? 'Hành Trình Hội Ngộ 2 Chặng' : 'Địa Điểm Tổ Chức Họp Lớp'}
              </span>
              <span className="text-[11px] font-sans font-semibold text-slate-500">
                {eventDateText}
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#1E293B] tracking-tight">
              {isTwoVenues ? 'Thăm Lại Mái Trường Xưa & Tiệc Hội Ngộ Tri Kỷ' : stage1Name}
            </h3>

            <p className="text-xs text-slate-600 font-serif leading-relaxed">
              {isTwoVenues
                ? 'Chương trình diễn ra liên hoàn: Buổi sáng quy tụ tại trường THPT Thái Nguyên, trưa di chuyển sang nhà hàng khai tiệc.'
                : stage1Subtitle || stage1Address}
            </p>
          </div>

          {/* Nút Lộ Trình Nhanh (nếu có 2 chặng) */}
          {isTwoVenues && (
            <div className="flex items-center gap-2 shrink-0">
              <a
                href={routeDirectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-amber-700 to-amber-800 hover:from-amber-600 hover:to-amber-700 text-white rounded-xl text-xs font-sans font-bold uppercase tracking-wider shadow-sm hover:shadow-md transition-all cursor-pointer"
                title="Mở lộ trình di chuyển từ trường sang nhà hàng trên Google Maps"
              >
                <Car className="w-3.5 h-3.5 text-amber-300" />
                <span>Lộ Trình 2 Điểm ({routeDistanceText})</span>
                <ExternalLink className="w-3 h-3 opacity-80" />
              </a>
            </div>
          )}
        </div>

        {/* ======================================================== */}
        {/* 2. THANH TIẾN TRÌNH LỘ TRÌNH (JOURNEY STEPPER) */}
        {/* ======================================================== */}
        {isTwoVenues && (
          <div className="relative z-10 bg-white rounded-2xl border border-amber-200/80 p-3 sm:p-4 shadow-xs">
            <div className="grid grid-cols-1 md:grid-cols-11 gap-3 items-center">
              
              {/* CHẶNG 1 TAB/PILL */}
              <button
                type="button"
                onClick={() => setActiveStage(1)}
                className={`md:col-span-5 text-left p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                  activeStage === 1
                    ? 'bg-amber-50/90 border-amber-400 ring-2 ring-amber-300/60 shadow-xs'
                    : 'bg-[#FAF9F6] border-slate-200/90 hover:border-amber-300 hover:bg-amber-50/40'
                }`}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-bold transition-all ${
                  activeStage === 1 ? 'bg-amber-700 text-white shadow-xs' : 'bg-slate-100 text-slate-600'
                }`}>
                  <School className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[11px] font-sans font-bold uppercase tracking-wider text-amber-800">
                      Chặng 1 • Buổi Sáng
                    </span>
                    <span className="text-[11px] font-mono font-bold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {stage1Time}
                    </span>
                  </div>
                  <h4 className="font-serif font-bold text-slate-900 text-sm sm:text-base truncate mt-0.5">
                    {stage1Name}
                  </h4>
                  <p className="text-xs text-slate-500 truncate">
                    {stage1ShortAddress}
                  </p>
                </div>
              </button>

              {/* CONNECTOR GIỮA 2 CHẶNG */}
              <div className="md:col-span-1 flex md:flex-col items-center justify-center gap-1 py-1 md:py-0 text-center">
                <div className="h-px md:h-6 w-12 md:w-px bg-amber-300/80 border-t md:border-t-0 md:border-l border-dashed border-amber-400" />
                <a
                  href={routeDirectUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-full text-[10px] font-sans font-bold flex items-center gap-1 transition shadow-2xs border border-amber-200 cursor-pointer shrink-0"
                  title="Xem chỉ đường từ trường sang nhà hàng"
                >
                  <Car className="w-3 h-3 text-amber-700" />
                  <span className="hidden sm:inline">Cách</span> {routeDistanceText}
                </a>
                <div className="h-px md:h-6 w-12 md:w-px bg-amber-300/80 border-t md:border-t-0 md:border-l border-dashed border-amber-400" />
              </div>

              {/* CHẶNG 2 TAB/PILL */}
              <button
                type="button"
                onClick={() => setActiveStage(2)}
                className={`md:col-span-5 text-left p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                  activeStage === 2
                    ? 'bg-rose-50/90 border-rose-400 ring-2 ring-rose-300/60 shadow-xs'
                    : 'bg-[#FAF9F6] border-slate-200/90 hover:border-rose-300 hover:bg-rose-50/40'
                }`}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-bold transition-all ${
                  activeStage === 2 ? 'bg-rose-700 text-white shadow-xs' : 'bg-slate-100 text-slate-600'
                }`}>
                  <UtensilsCrossed className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[11px] font-sans font-bold uppercase tracking-wider text-rose-800">
                      Chặng 2 • Trưa & Chiều
                    </span>
                    <span className="text-[11px] font-mono font-bold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {stage2Time}
                    </span>
                  </div>
                  <h4 className="font-serif font-bold text-slate-900 text-sm sm:text-base truncate mt-0.5">
                    {stage2Name}
                  </h4>
                  <p className="text-xs text-slate-500 truncate">
                    {stage2ShortAddress}
                  </p>
                </div>
              </button>

            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* 3. THẺ CHI TIẾT TỪNG CHẶNG (SIDE-BY-SIDE HOẶC SINGLE) */}
        {/* ======================================================== */}
        <div className={`grid grid-cols-1 ${isTwoVenues ? 'lg:grid-cols-2' : ''} gap-4 relative z-10`}>
          
          {/* THẺ CHẶNG 1 */}
          <div className={`bg-white rounded-2xl border p-4 sm:p-5 shadow-xs flex flex-col justify-between transition-all ${
            activeStage === 1
              ? 'border-amber-400/90 ring-2 ring-amber-200/60 bg-gradient-to-b from-amber-50/30 to-white'
              : 'border-amber-200/70 hover:border-amber-300'
          }`}>
            <div className="space-y-3">
              {/* Header Thẻ Chặng 1 */}
              <div className="flex items-start justify-between gap-2 border-b border-amber-100 pb-3">
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-sans font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                      🏫 Chặng 1 • Thăm Trường Xưa
                    </span>
                    <span className="text-[11px] font-mono font-semibold text-slate-500">
                      {stage1Time}
                    </span>
                  </div>
                  <h4 className="font-serif font-bold text-slate-900 text-base sm:text-lg">
                    {stage1Name}
                  </h4>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveStage(1)}
                  className={`shrink-0 px-2 py-1 rounded-lg text-[11px] font-sans font-bold transition cursor-pointer ${
                    activeStage === 1
                      ? 'bg-amber-600 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-amber-100 hover:text-amber-900'
                  }`}
                  title="Chọn xem bản đồ chặng này"
                >
                  {activeStage === 1 ? '✓ Đang xem map' : 'Xem trên map'}
                </button>
              </div>

              {/* Địa chỉ đầy đủ */}
              <div className="flex items-start gap-2 text-xs text-slate-700 bg-[#FAF9F6] p-2.5 rounded-xl border border-slate-200/80">
                <MapPin className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="font-bold text-slate-900">Địa chỉ tập trung:</p>
                  <p className="text-slate-600 font-serif leading-relaxed">{stage1Address}</p>
                </div>
              </div>

              {/* Danh sách hoạt động chính */}
              <div className="space-y-1.5 pt-1">
                <p className="text-[11px] uppercase font-sans font-bold text-slate-500 tracking-wider">
                  Nội Dung Hoạt Động Chặng 1:
                </p>
                <ul className="space-y-1.5 text-xs text-slate-700">
                  {stage1Activities.map((act, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-1.5" />
                      <span className="leading-snug">{act}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Cụm Nút Hành Động Chặng 1 */}
            <div className="pt-4 mt-3 border-t border-slate-100 grid grid-cols-2 gap-2">
              <a
                href={stage1DirectionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 py-2 px-3 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white rounded-xl text-xs font-sans font-bold uppercase tracking-wider shadow-xs hover:shadow-md transition-all cursor-pointer"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Chỉ Đường</span>
              </a>

              <button
                type="button"
                onClick={() => handleCopy(1, stage1Address)}
                className="inline-flex items-center justify-center gap-1.5 py-2 px-3 bg-white hover:bg-amber-50 text-slate-700 border border-slate-300 rounded-xl text-xs font-sans font-bold uppercase tracking-wider transition-all shadow-2xs cursor-pointer"
              >
                {copiedStage === 1 ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                <span>{copiedStage === 1 ? 'Đã Chép' : 'Chép Địa Chỉ'}</span>
              </button>
            </div>
          </div>

          {/* THẺ CHẶNG 2 (NẾU BẬT 2 CHẶNG) */}
          {isTwoVenues && (
            <div className={`bg-white rounded-2xl border p-4 sm:p-5 shadow-xs flex flex-col justify-between transition-all ${
              activeStage === 2
                ? 'border-rose-400/90 ring-2 ring-rose-200/60 bg-gradient-to-b from-rose-50/30 to-white'
                : 'border-amber-200/70 hover:border-rose-300'
            }`}>
              <div className="space-y-3">
                {/* Header Thẻ Chặng 2 */}
                <div className="flex items-start justify-between gap-2 border-b border-rose-100 pb-3">
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-sans font-bold uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-200">
                        🥂 Chặng 2 • Tiệc Giao Lưu Tri Kỷ
                      </span>
                      <span className="text-[11px] font-mono font-semibold text-slate-500">
                        {stage2Time}
                      </span>
                    </div>
                    <h4 className="font-serif font-bold text-slate-900 text-base sm:text-lg">
                      {stage2Name}
                    </h4>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveStage(2)}
                    className={`shrink-0 px-2 py-1 rounded-lg text-[11px] font-sans font-bold transition cursor-pointer ${
                      activeStage === 2
                        ? 'bg-rose-600 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-rose-100 hover:text-rose-900'
                    }`}
                    title="Chọn xem bản đồ chặng này"
                  >
                    {activeStage === 2 ? '✓ Đang xem map' : 'Xem trên map'}
                  </button>
                </div>

                {/* Địa chỉ đầy đủ */}
                <div className="flex items-start gap-2 text-xs text-slate-700 bg-[#FAF9F6] p-2.5 rounded-xl border border-slate-200/80">
                  <MapPin className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900">Địa chỉ nhà hàng:</p>
                    <p className="text-slate-600 font-serif leading-relaxed">{stage2Address}</p>
                  </div>
                </div>

                {/* Danh sách hoạt động chính */}
                <div className="space-y-1.5 pt-1">
                  <p className="text-[11px] uppercase font-sans font-bold text-slate-500 tracking-wider">
                    Nội Dung Hoạt Động Chặng 2:
                  </p>
                  <ul className="space-y-1.5 text-xs text-slate-700">
                    {stage2Activities.map((act, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 mt-1.5" />
                        <span className="leading-snug">{act}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Cụm Nút Hành Động Chặng 2 */}
              <div className="pt-4 mt-3 border-t border-slate-100 grid grid-cols-2 gap-2">
                <a
                  href={stage2DirectionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 py-2 px-3 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white rounded-xl text-xs font-sans font-bold uppercase tracking-wider shadow-xs hover:shadow-md transition-all cursor-pointer"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Chỉ Đường</span>
                </a>

                <button
                  type="button"
                  onClick={() => handleCopy(2, stage2Address)}
                  className="inline-flex items-center justify-center gap-1.5 py-2 px-3 bg-white hover:bg-rose-50 text-slate-700 border border-slate-300 rounded-xl text-xs font-sans font-bold uppercase tracking-wider transition-all shadow-2xs cursor-pointer"
                >
                  {copiedStage === 2 ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                  <span>{copiedStage === 2 ? 'Đã Chép' : 'Chép Địa Chỉ'}</span>
                </button>
              </div>
            </div>
          )}

        </div>

        {/* ======================================================== */}
        {/* 4. BẢN ĐỒ GOOGLE MAPS TƯƠNG TÁC TỰ ĐỘNG CHUYỂN CHẶNG */}
        {/* ======================================================== */}
        <div className="bg-white rounded-2xl border border-amber-200/90 p-3.5 sm:p-5 shadow-xs flex flex-col space-y-3.5 relative z-10">
          
          {/* Header Bản Đồ & Bộ Điều Khiển Chế Độ Xem */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            
            {/* Tên địa điểm đang soi trên bản đồ */}
            <div className="flex items-center gap-2.5 min-w-0">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold shrink-0 transition-all ${
                activeStage === 1 ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
              }`}>
                <MapPin className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-serif font-bold text-sm sm:text-base text-slate-900 truncate">
                    {currentStageName}
                  </h4>
                  <span className="text-[10px] font-sans font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 shrink-0">
                    Bãi đỗ ô tô & xe máy
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-sans truncate">
                  {currentStageAddress}
                </p>
              </div>
            </div>

            {/* Cụm Nút Điều Khiển Bản Đồ */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              
              {/* Tab chuyển đổi Chặng 1 vs Chặng 2 (nếu bật 2 chặng) */}
              {isTwoVenues && (
                <div className="inline-flex p-0.5 bg-slate-100 rounded-lg border border-slate-200/80 text-xs font-sans font-bold">
                  <button
                    type="button"
                    onClick={() => setActiveStage(1)}
                    className={`px-2.5 py-1 rounded-md text-[11px] transition-all flex items-center gap-1 cursor-pointer ${
                      activeStage === 1
                        ? 'bg-amber-700 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span>🏫 Chặng 1: Trường Cũ</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveStage(2)}
                    className={`px-2.5 py-1 rounded-md text-[11px] transition-all flex items-center gap-1 cursor-pointer ${
                      activeStage === 2
                        ? 'bg-rose-700 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span>🥂 Chặng 2: Nhà Hàng</span>
                  </button>
                </div>
              )}

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
                  title="Chế độ vệ tinh chụp thực địa nét cao"
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
                  title="Bản đồ số giao thông"
                >
                  <span>🗺️ Bản đồ</span>
                  {mapViewMode === 'roadmap' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
                </button>
              </div>

              {/* Zoom: Cận cảnh vs Bao quát */}
              <div className="inline-flex p-0.5 bg-slate-100 rounded-lg border border-slate-200/80 text-xs font-sans font-bold">
                <button
                  type="button"
                  onClick={() => setMapZoomLevel('close')}
                  className={`px-2 py-1 rounded-md text-[11px] transition-all cursor-pointer ${
                    mapZoomLevel === 'close'
                      ? 'bg-amber-800 text-amber-100 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Cận cảnh (~600m)"
                >
                  <span>🔍 Cận cảnh</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMapZoomLevel('wide')}
                  className={`px-2 py-1 rounded-md text-[11px] transition-all cursor-pointer ${
                    mapZoomLevel === 'wide'
                      ? 'bg-amber-800 text-amber-100 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Toàn cảnh TP"
                >
                  <span>🌐 Toàn cảnh</span>
                </button>
              </div>

            </div>
          </div>

          {/* Khung Google Maps Iframe */}
          <div className="relative rounded-xl overflow-hidden border border-amber-300/50 shadow-inner h-[380px] sm:h-[450px] md:h-[500px] w-full bg-[#E5E3DF]">
            <iframe
              key={activeMapUrl}
              title={`Bản đồ ${currentStageName}`}
              src={activeMapUrl}
              className="w-full h-full border-0"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer"
            />

            {/* Badge thông tin góc trên bản đồ */}
            <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-md text-white px-3 py-1.5 rounded-xl text-[11px] font-sans font-bold flex items-center gap-2 shadow-lg border border-white/20 pointer-events-none max-w-[90%]">
              <span className={activeStage === 1 ? 'text-amber-300' : 'text-rose-300'}>
                {activeStage === 1 ? '🏫 Chặng 1' : '🥂 Chặng 2'}: {currentStageName}
              </span>
              <span className="text-white/40">•</span>
              <span className="text-slate-300">
                {mapViewMode === 'satellite' ? '🛰️ Vệ Tinh' : '🗺️ Bản Đồ'} ({mapZoomLevel === 'close' ? '~600m' : 'Toàn cảnh'})
              </span>
            </div>
          </div>

          {/* Thanh Tác Vụ Dưới Bản Đồ */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
            {/* Nút chỉ đường đến chặng hiện tại */}
            <a
              href={currentStageDirectionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center justify-center gap-2 py-2.5 px-3 text-white rounded-xl text-xs font-sans font-bold uppercase tracking-wider shadow-xs hover:shadow-md transition-all cursor-pointer ${
                activeStage === 1
                  ? 'bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600'
                  : 'bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600'
              }`}
            >
              <Navigation className="w-3.5 h-3.5" />
              <span className="truncate">Chỉ Đường: {activeStage === 1 ? 'Trường Cũ' : 'Nhà Hàng'}</span>
            </a>

            {/* Nút xem lộ trình giữa 2 chặng (nếu có 2 chặng) */}
            {isTwoVenues ? (
              <a
                href={routeDirectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 py-2.5 px-3 bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-700 hover:to-slate-800 text-amber-200 rounded-xl text-xs font-sans font-bold uppercase tracking-wider shadow-xs hover:shadow-md transition-all cursor-pointer"
                title="Mở hướng dẫn lái xe từ trường sang nhà hàng"
              >
                <Car className="w-3.5 h-3.5 text-amber-300" />
                <span>Lộ Trình 2 Điểm ({routeDistanceText})</span>
              </a>
            ) : (
              <div />
            )}

            {/* Nút chép địa chỉ chặng hiện tại */}
            <button
              type="button"
              onClick={() => handleCopy(activeStage, currentStageAddress)}
              className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 bg-white hover:bg-amber-50 text-slate-700 border border-slate-300 rounded-xl text-xs font-sans font-bold uppercase tracking-wider transition-all shadow-2xs cursor-pointer"
            >
              {copiedStage === activeStage ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
              <span>{copiedStage === activeStage ? 'Đã Chép Địa Chỉ' : 'Sao Chép Địa Chỉ'}</span>
            </button>
          </div>

        </div>

      </div>
    </section>
  );
}
