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
  ExternalLink
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserRole, VenueMediaItem, EventConfig } from '../types';

// ============================================================================
// HELPER: SANITIZE & NORMALIZE VIETNAMESE ACCENTS & REMOVE STRAY GLYPHS
// ============================================================================
export function cleanVietnameseText(text?: string): string {
  if (!text || typeof text !== 'string') return '';
  return text
    // Sửa lỗi phím Telex/VNI bị tách dấu huyền (`):
    .replace(/â`/g, 'ầ').replace(/Â`/g, 'Ầ')
    .replace(/ê`/g, 'ề').replace(/Ê`/g, 'Ề')
    .replace(/ơ`/g, 'ờ').replace(/Ơ`/g, 'Ờ')
    .replace(/ư`/g, 'ừ').replace(/Ư`/g, 'Ừ')
    .replace(/a`/g, 'à').replace(/A`/g, 'À')
    .replace(/e`/g, 'è').replace(/E`/g, 'È')
    .replace(/o`/g, 'ò').replace(/O`/g, 'Ò')
    .replace(/u`/g, 'ù').replace(/U`/g, 'Ù')
    .replace(/i`/g, 'ì').replace(/I`/g, 'Ì')
    .replace(/y`/g, 'ỳ').replace(/Y`/g, 'Ỳ')
    // Sửa lỗi tách dấu sắc ('):
    .replace(/â'/g, 'ấ').replace(/Â'/g, 'Ấ')
    .replace(/ê'/g, 'ế').replace(/Ê'/g, 'Ế')
    .replace(/ơ'/g, 'ớ').replace(/Ơ'/g, 'Ớ')
    .replace(/ư'/g, 'ứ').replace(/Ư'/g, 'Ứ')
    .replace(/a'/g, 'á').replace(/A'/g, 'Á')
    .replace(/e'/g, 'é').replace(/E'/g, 'É')
    .replace(/o'/g, 'ó').replace(/O'/g, 'Ó')
    .replace(/u'/g, 'ú').replace(/U'/g, 'Ú')
    .replace(/i'/g, 'í').replace(/I'/g, 'Í')
    .replace(/y'/g, 'ý').replace(/Y'/g, 'Ý')
    // Sửa lỗi tách dấu hỏi/ngã/nặng:
    .replace(/â\?/g, 'ẩ').replace(/ê\?/g, 'ể')
    .replace(/â~/g, 'ẫ').replace(/ê~/g, 'ễ')
    .replace(/â\./g, 'ậ').replace(/ê\./g, 'ệ')
    // Xóa dấu backtick đơn lẻ do gõ nhầm:
    .replace(/`/g, '')
    .normalize('NFC')
    .trim();
}

// ============================================================================
// CONSTANTS & FALLBACKS FOR 2-STAGE VENUES
// ============================================================================
export const VENUE_1_FALLBACK = {
  name: 'Trường THPT Thái Nguyên',
  subtitle: 'Chặng 1: Đón tiếp nhận áo, thăm trường xưa, chụp ảnh lưu niệm & tri ân Thầy Cô',
  address: 'Số 127 đường Lương Thế Vinh, P. Quang Trung, TP. Thái Nguyên, Tỉnh Thái Nguyên',
  shortAddress: '127 Lương Thế Vinh, TP. Thái Nguyên',
  time: '08:30 — 11:00 (Sáng)',
  activity: 'Đón tiếp & nhận áo đồng phục polo K8A1 • Thẻ học sinh tri kỷ • Thăm lớp học xưa & chụp ảnh kỷ niệm sân trường • Tri ân Thầy Cô giáo cũ',
  directionsUrl: 'https://www.google.com/maps/search/?api=1&query=Tr%C6%B0%E1%BB%9Dng+THPT+Th%C3%A1i+Nguy%C3%AAn,+127+L%C6%B0%C6%A1ng+Th%E1%BA%BF+Vinh,+Th%C3%A1i+Nguy%C3%AAn',
  embedMapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3710.2798642279267!2d105.8285514!3d21.5740443!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135272a24921915%3A0xe543df5e9e03fa54!2zVHLGsOG7nW5nIFRIUFQgVGjDoWkgTmd1ecOqbg!5e0!3m2!1svi!2svn!4v1710000000000!5m2!1svi!2svn'
};

export const VENUE_2_FALLBACK = {
  name: 'Trung Tâm Sự Kiện & Nhà Hàng Prime Thái Nguyên',
  subtitle: 'Chặng 2: Khai tiệc liên hoan, nâng ly chúc mừng 20 năm, giao lưu văn nghệ & trao kỷ vật',
  address: 'Số 1 đường Hoàng Văn Thụ, P. Phan Đình Phùng, TP. Thái Nguyên, Tỉnh Thái Nguyên',
  shortAddress: 'Số 1 Hoàng Văn Thụ, TP. Thái Nguyên',
  time: '11:30 — 15:30 (Trưa & Chiều)',
  activity: 'Cả lớp di chuyển từ trường sang nhà hàng (~1.5km) • Khai tiệc liên hoan, nâng ly mừng 20 năm hội ngộ • Giao lưu âm nhạc, chuyện đời & trao quà kỷ vật',
  directionsUrl: 'https://maps.app.goo.gl/a3utiYosZqGHKDjYA',
  embedMapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d600!2d105.8386089!3d21.5949009!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x52211cf3f4926b%3A0x6de9f091b88c49ab!2sTh%C3%A1p%20%C4%91%C3%B4i%20Prime%20Th%C3%A1i%20Nguy%C3%AAn!5e1!3m2!1svi!2svn!4v1725550000000!5m2!1svi!2svn'
};

export const ROUTE_FALLBACK = {
  distanceText: '~1.5km (Di chuyển 5 - 10 phút)',
  routeDirectUrl: 'https://www.google.com/maps/dir/?api=1&origin=Tr%C6%B0%E1%BB%9Dng+THPT+Th%C3%A1i+Nguy%C3%AAn,+127+L%C6%B0%C6%A1ng+Th%E1%BA%BF+Vinh,+Th%C3%A1i+Nguy%C3%AAn&destination=Th%C3%A1p+%C4%91%C3%B4i+Prime+Th%C3%A1i+Nguy%C3%AAn,+S%E1%BB%91+1+Ho%C3%A0ng+V%C4%83n+Th%E1%BB%A5,+Th%C3%A1i+Nguy%C3%AAn'
};

// Giữ lại alias VENUE_DETAILS để tương thích ngược
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
// COMPONENT: ALUMNI CONVERGENCE MAP (TINH TẾ, SANG TRỌNG, KHÔNG LỖI LAYOUT)
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
  // Chế độ 2 chặng: tuân thủ chính xác cấu hình từ Google Sheet (mặc định tắt nếu không bật)
  const isTwoVenues = Boolean(eventConfig?.enableTwoVenues);

  // Chặng đang được chọn hiển thị trên bản đồ (1: Trường cũ, 2: Nhà hàng)
  const [activeStage, setActiveStage] = useState<1 | 2>(1);

  // Trạng thái copy địa chỉ
  const [copiedStage, setCopiedStage] = useState<1 | 2 | null>(null);

  // Chế độ xem: 'satellite' vs 'roadmap'
  const [mapViewMode, setMapViewMode] = useState<'satellite' | 'roadmap'>('satellite');
  // Mức Zoom: 'close' vs 'wide'
  const [mapZoomLevel, setMapZoomLevel] = useState<'close' | 'wide'>('close');

  // Dynamic values cho Chặng 1 (Trường THPT Thái Nguyên)
  const stage1Name = cleanVietnameseText(eventConfig?.venueName) || VENUE_1_FALLBACK.name;
  const stage1Subtitle = cleanVietnameseText(eventConfig?.venueSubtitle) || VENUE_1_FALLBACK.subtitle;
  const stage1Address = cleanVietnameseText(eventConfig?.venueAddress) || VENUE_1_FALLBACK.address;
  const stage1ShortAddress = cleanVietnameseText(eventConfig?.shortAddress) || VENUE_1_FALLBACK.shortAddress;
  const stage1Time = cleanVietnameseText(eventConfig?.venueTime) || VENUE_1_FALLBACK.time;
  const stage1Activity = cleanVietnameseText(eventConfig?.venueActivity) || VENUE_1_FALLBACK.activity;
  const stage1DirectionsUrl = eventConfig?.mapDirectUrl || VENUE_1_FALLBACK.directionsUrl;
  const stage1RawEmbedUrl = eventConfig?.mapEmbedUrl || VENUE_1_FALLBACK.embedMapUrl;

  // Dynamic values cho Chặng 2 (Nhà Hàng Prime Thái Nguyên)
  const stage2Name = cleanVietnameseText(eventConfig?.venue2Name) || VENUE_2_FALLBACK.name;
  const stage2Subtitle = cleanVietnameseText(eventConfig?.venue2Subtitle) || VENUE_2_FALLBACK.subtitle;
  const stage2Address = cleanVietnameseText(eventConfig?.venue2Address) || VENUE_2_FALLBACK.address;
  const stage2ShortAddress = cleanVietnameseText(eventConfig?.venue2ShortAddress) || VENUE_2_FALLBACK.shortAddress;
  const stage2Time = cleanVietnameseText(eventConfig?.venue2Time) || VENUE_2_FALLBACK.time;
  const stage2Activity = cleanVietnameseText(eventConfig?.venue2Activity) || VENUE_2_FALLBACK.activity;
  const stage2DirectionsUrl = eventConfig?.venue2MapDirectUrl || VENUE_2_FALLBACK.directionsUrl;
  const stage2RawEmbedUrl = eventConfig?.venue2MapEmbedUrl || VENUE_2_FALLBACK.embedMapUrl;

  // Dynamic values lộ trình di chuyển
  const routeDistanceText = cleanVietnameseText(eventConfig?.routeDistanceText) || ROUTE_FALLBACK.distanceText;
  const routeDirectUrl = eventConfig?.routeDirectUrl || ROUTE_FALLBACK.routeDirectUrl;
  const eventDateText = cleanVietnameseText(eventConfig?.eventDateText) || "Chủ Nhật, 27/09/2026 (08:30 — 15:30)";

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

  // Sao chép địa chỉ
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

  // Chuyển chuỗi hoạt động thành mảng các gạch đầu dòng ngắn gọn
  const stage1Activities = useMemo(() => {
    return stage1Activity.split(/[•|\n]/).map(s => cleanVietnameseText(s)).filter(Boolean);
  }, [stage1Activity]);

  const stage2Activities = useMemo(() => {
    return stage2Activity.split(/[•|\n]/).map(s => cleanVietnameseText(s)).filter(Boolean);
  }, [stage2Activity]);

  return (
    <section id="dia-diem" className={`space-y-4 scroll-mt-20 ${className}`}>
      {/* Anchor hỗ trợ liên kết cũ #tu-hoi */}
      <span id="tu-hoi" className="block -mt-20 pt-20" aria-hidden="true" />

      {/* 🌟 KHUNG CHÍNH: LỊCH TRÌNH & ĐỊA ĐIỂM HỘI NGỘ */}
      <div className="bg-[#FAF7F2] border border-amber-200/80 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xs relative overflow-hidden space-y-4 text-left">
        
        {/* Nền hoa văn vân sáng tinh tế */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-amber-100/30 via-orange-50/20 to-transparent rounded-full blur-3xl pointer-events-none" />

        {/* ======================================================== */}
        {/* 1. HEADER KHỐI: RỘNG RÃI, KHÔNG BỊ BÓ HẸP BỞI HUY HIỆU */}
        {/* ======================================================== */}
        <div className="border-b border-amber-200/70 pb-3 space-y-1 relative z-10 text-left">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] uppercase tracking-widest font-sans font-bold text-amber-800 bg-amber-100/70 px-2.5 py-0.5 rounded-full border border-amber-200/80 inline-block">
              📍 Địa Điểm & Lịch Trình Hội Ngộ
            </span>
            <span className="text-xs font-sans text-slate-500 font-medium">
              Chủ Nhật, ngày 27/09/2026 • {isTwoVenues ? '2 Chặng Gặp Mặt' : 'Địa Điểm Gặp Mặt'}
            </span>
          </div>

          <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#1E293B] tracking-tight pt-0.5">
            {eventDateText}
          </h3>

          <p className="text-xs text-slate-600 font-sans leading-relaxed">
            {isTwoVenues
              ? 'Chương trình diễn ra liên hoàn: Sáng đón tiếp & thăm trường xưa (THPT Thái Nguyên), trưa di chuyển sang nhà hàng (Prime) khai tiệc liên hoan.'
              : stage1Subtitle || stage1Address}
          </p>
        </div>

        {/* ======================================================== */}
        {/* 2. HAI THẺ CHẶNG CÂN ĐỐI (FONT SẮC NÉT, KHÔNG LỖI DẤU) */}
        {/* ======================================================== */}
        <div className={`grid grid-cols-1 ${isTwoVenues ? 'md:grid-cols-2' : ''} gap-3.5 relative z-10`}>
          
          {/* THẺ CHẶNG 1 */}
          <div
            onClick={() => setActiveStage(1)}
            className={`bg-white rounded-2xl border p-4 sm:p-5 shadow-2xs flex flex-col justify-between space-y-3.5 transition-all cursor-pointer ${
              activeStage === 1
                ? 'border-amber-400 ring-2 ring-amber-300/50 bg-gradient-to-b from-amber-50/20 to-white'
                : 'border-slate-200 hover:border-amber-300/80 hover:bg-stone-50/30'
            }`}
          >
            <div className="space-y-2.5">
              {/* Top Row: Stage pill & Time */}
              <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-sans font-bold uppercase tracking-wider bg-amber-100/90 text-amber-900 border border-amber-200/90">
                  {isTwoVenues ? '🏫 Chặng 1 • Buổi Sáng' : '🏫 Địa Điểm Gặp Mặt'}
                </span>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-semibold text-slate-600 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200">
                    {stage1Time}
                  </span>
                  {activeStage === 1 && (
                    <span className="text-[10px] font-sans font-bold text-amber-800 bg-amber-100/80 px-1.5 py-0.5 rounded">
                      ● Đang xem
                    </span>
                  )}
                </div>
              </div>

              {/* Venue Name & Subtitle */}
              <div>
                <h4 className="font-serif font-bold text-slate-900 text-base sm:text-lg leading-tight">
                  {stage1Name}
                </h4>
                <p className="text-xs text-slate-500 font-sans leading-relaxed mt-1">
                  {stage1Subtitle}
                </p>
              </div>

              {/* Address Box */}
              <div className="flex items-start gap-2 text-xs text-slate-700 bg-[#FAF9F6] p-2.5 rounded-xl border border-slate-200/80">
                <MapPin className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                <span className="leading-snug font-sans">{stage1Address}</span>
              </div>

              {/* Activities list */}
              <div className="space-y-1 pt-0.5">
                <ul className="space-y-1.5 text-xs text-slate-600 font-sans">
                  {stage1Activities.map((act, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-600 shrink-0 mt-1.5" />
                      <span className="leading-snug">{act}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2.5 border-t border-slate-100 grid grid-cols-2 gap-2" onClick={(e) => e.stopPropagation()}>
              <a
                href={stage1DirectionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 py-2 px-3 bg-[#8D5B28] hover:bg-[#784A1E] text-white rounded-xl text-xs font-sans font-semibold shadow-2xs transition-all cursor-pointer"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Chỉ Đường</span>
              </a>

              <button
                type="button"
                onClick={() => handleCopy(1, stage1Address)}
                className="inline-flex items-center justify-center gap-1.5 py-2 px-3 bg-white hover:bg-stone-50 text-slate-700 border border-slate-300 rounded-xl text-xs font-sans font-semibold transition-all cursor-pointer"
              >
                {copiedStage === 1 ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                <span>{copiedStage === 1 ? 'Đã Chép' : 'Chép Địa Chỉ'}</span>
              </button>
            </div>
          </div>

          {/* THẺ CHẶNG 2 */}
          {isTwoVenues && (
            <div
              onClick={() => setActiveStage(2)}
              className={`bg-white rounded-2xl border p-4 sm:p-5 shadow-2xs flex flex-col justify-between space-y-3.5 transition-all cursor-pointer ${
                activeStage === 2
                  ? 'border-amber-400 ring-2 ring-amber-300/50 bg-gradient-to-b from-amber-50/20 to-white'
                  : 'border-slate-200 hover:border-amber-300/80 hover:bg-stone-50/30'
              }`}
            >
              <div className="space-y-2.5">
                {/* Top Row: Stage pill & Time */}
                <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-sans font-bold uppercase tracking-wider bg-amber-100/90 text-amber-900 border border-amber-200/90">
                    🥂 Chặng 2 • Trưa & Chiều
                  </span>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-semibold text-slate-600 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200">
                      {stage2Time}
                    </span>
                    {activeStage === 2 && (
                      <span className="text-[10px] font-sans font-bold text-amber-800 bg-amber-100/80 px-1.5 py-0.5 rounded">
                        ● Đang xem
                      </span>
                    )}
                  </div>
                </div>

                {/* Venue Name & Subtitle */}
                <div>
                  <h4 className="font-serif font-bold text-slate-900 text-base sm:text-lg leading-tight">
                    {stage2Name}
                  </h4>
                  <p className="text-xs text-slate-500 font-sans leading-relaxed mt-1">
                    {stage2Subtitle}
                  </p>
                </div>

                {/* Address Box */}
                <div className="flex items-start gap-2 text-xs text-slate-700 bg-[#FAF9F6] p-2.5 rounded-xl border border-slate-200/80">
                  <MapPin className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                  <span className="leading-snug font-sans">{stage2Address}</span>
                </div>

                {/* Activities list */}
                <div className="space-y-1 pt-0.5">
                  <ul className="space-y-1.5 text-xs text-slate-600 font-sans">
                    {stage2Activities.map((act, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-600 shrink-0 mt-1.5" />
                        <span className="leading-snug">{act}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2.5 border-t border-slate-100 grid grid-cols-2 gap-2" onClick={(e) => e.stopPropagation()}>
                <a
                  href={stage2DirectionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 py-2 px-3 bg-[#8D5B28] hover:bg-[#784A1E] text-white rounded-xl text-xs font-sans font-semibold shadow-2xs transition-all cursor-pointer"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Chỉ Đường</span>
                </a>

                <button
                  type="button"
                  onClick={() => handleCopy(2, stage2Address)}
                  className="inline-flex items-center justify-center gap-1.5 py-2 px-3 bg-white hover:bg-stone-50 text-slate-700 border border-slate-300 rounded-xl text-xs font-sans font-semibold transition-all cursor-pointer"
                >
                  {copiedStage === 2 ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                  <span>{copiedStage === 2 ? 'Đã Chép' : 'Chép Địa Chỉ'}</span>
                </button>
              </div>
            </div>
          )}

        </div>

        {/* ======================================================== */}
        {/* 3. THANH NỐI LỘ TRÌNH DI CHUYỂN GỌN GÀNG, TRANG NHÃ */}
        {/* ======================================================== */}
        {isTwoVenues && (
          <div className="relative z-10 bg-white rounded-xl border border-amber-200/80 p-2.5 sm:px-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-600 shadow-2xs">
            <div className="flex items-center gap-2 text-left">
              <span className="w-6 h-6 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                <Car className="w-3.5 h-3.5" />
              </span>
              <span>
                <strong>Tuyến đường di chuyển giữa 2 điểm:</strong> {routeDistanceText} (khoảng 5 — 10 phút lái xe)
              </span>
            </div>
            <a
              href={routeDirectUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-amber-800 hover:text-amber-950 font-semibold hover:underline shrink-0 cursor-pointer text-xs"
              title="Mở lộ trình dẫn đường lái xe trên Google Maps"
            >
              <span>Xem chỉ đường tuyến đường</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}

        {/* ======================================================== */}
        {/* 4. BẢN ĐỒ GOOGLE MAPS TƯƠNG TÁC RỘNG RÃI */}
        {/* ======================================================== */}
        <div className="bg-white rounded-2xl border border-amber-200/80 p-3.5 sm:p-4 shadow-xs flex flex-col space-y-3 relative z-10">
          
          {/* Header Bản Đồ */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-slate-100 pb-2.5">
            
            {/* Tab chuyển đổi Chặng 1 vs Chặng 2 */}
            {isTwoVenues ? (
              <div className="inline-flex p-0.5 bg-slate-100 rounded-xl border border-slate-200 text-xs font-sans font-bold">
                <button
                  type="button"
                  onClick={() => setActiveStage(1)}
                  className={`px-3 py-1.5 rounded-lg text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeStage === 1
                      ? 'bg-[#1E293B] text-amber-300 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <School className="w-3.5 h-3.5" />
                  <span>Chặng 1: Trường THPT Thái Nguyên</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveStage(2)}
                  className={`px-3 py-1.5 rounded-lg text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeStage === 2
                      ? 'bg-[#1E293B] text-amber-300 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <UtensilsCrossed className="w-3.5 h-3.5" />
                  <span>Chặng 2: Nhà Hàng Prime</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm font-serif font-bold text-slate-900">
                <MapPin className="w-4 h-4 text-amber-700" />
                <span>{stage1Name}</span>
              </div>
            )}

            {/* Cụm Chuyển Đổi Vệ Tinh / Bản Đồ & Zoom */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="inline-flex p-0.5 bg-slate-100 rounded-lg border border-slate-200 text-xs font-sans font-bold">
                <button
                  type="button"
                  onClick={() => setMapViewMode('satellite')}
                  className={`px-2.5 py-1 rounded-md text-[11px] transition-all cursor-pointer ${
                    mapViewMode === 'satellite'
                      ? 'bg-[#1E293B] text-amber-300 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  🛰️ Vệ tinh
                </button>
                <button
                  type="button"
                  onClick={() => setMapViewMode('roadmap')}
                  className={`px-2.5 py-1 rounded-md text-[11px] transition-all cursor-pointer ${
                    mapViewMode === 'roadmap'
                      ? 'bg-[#1E293B] text-amber-300 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  🗺️ Bản đồ
                </button>
              </div>

              <div className="inline-flex p-0.5 bg-slate-100 rounded-lg border border-slate-200 text-xs font-sans font-bold">
                <button
                  type="button"
                  onClick={() => setMapZoomLevel('close')}
                  className={`px-2 py-1 rounded-md text-[11px] transition-all cursor-pointer ${
                    mapZoomLevel === 'close'
                      ? 'bg-[#8D5B28] text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Cận cảnh
                </button>
                <button
                  type="button"
                  onClick={() => setMapZoomLevel('wide')}
                  className={`px-2 py-1 rounded-md text-[11px] transition-all cursor-pointer ${
                    mapZoomLevel === 'wide'
                      ? 'bg-[#8D5B28] text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Toàn cảnh
                </button>
              </div>
            </div>

          </div>

          {/* Khung Google Maps Iframe */}
          <div className="relative rounded-xl overflow-hidden border border-amber-200/80 shadow-inner h-[360px] sm:h-[420px] md:h-[460px] w-full bg-[#E5E3DF]">
            <iframe
              key={activeMapUrl}
              title={`Bản đồ ${currentStageName}`}
              src={activeMapUrl}
              className="w-full h-full border-0"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer"
            />

            {/* Floating Badge tinh gọn góc trên bản đồ */}
            <div className="absolute top-2.5 left-2.5 bg-black/75 backdrop-blur-md text-white px-2.5 py-1 rounded-lg text-[11px] font-sans font-bold flex items-center gap-1.5 shadow-md border border-white/20 pointer-events-none">
              <span className="text-amber-300">
                {activeStage === 1 ? '🏫 Chặng 1' : '🥂 Chặng 2'}: {currentStageName}
              </span>
              <span className="text-white/40">•</span>
              <span className="text-slate-300 text-[10px]">
                {mapViewMode === 'satellite' ? 'Vệ Tinh' : 'Bản Đồ'} ({mapZoomLevel === 'close' ? '~600m' : 'Toàn cảnh'})
              </span>
            </div>
          </div>

          {/* Thanh Tác Vụ Dưới Bản Đồ */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-1 text-xs">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <a
                href={currentStageDirectionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 py-2 px-3.5 bg-[#8D5B28] hover:bg-[#784A1E] text-white rounded-xl font-sans font-semibold shadow-2xs transition-all cursor-pointer"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Chỉ Đường ({activeStage === 1 ? 'Trường Cũ' : 'Nhà Hàng'})</span>
              </a>

              <button
                type="button"
                onClick={() => handleCopy(activeStage, currentStageAddress)}
                className="inline-flex items-center justify-center gap-1.5 py-2 px-3 bg-white hover:bg-stone-50 text-slate-700 border border-slate-300 rounded-xl font-sans font-semibold transition-all cursor-pointer"
              >
                {copiedStage === activeStage ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                <span>{copiedStage === activeStage ? 'Đã Chép' : 'Chép Địa Chỉ'}</span>
              </button>
            </div>

            {isTwoVenues && (
              <a
                href={routeDirectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 py-2 px-3 text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl font-sans font-semibold transition-all cursor-pointer"
              >
                <Car className="w-3.5 h-3.5 text-amber-700" />
                <span>Lộ Trình 2 Điểm ({routeDistanceText})</span>
              </a>
            )}
          </div>

        </div>

      </div>
    </section>
  );
}
