import React, { useState, useMemo } from 'react';
import {
  MapPin,
  Navigation,
  Copy,
  Check,
  ExternalLink,
  Car,
  Compass,
  Sparkles,
  Play,
  Video,
  Image as ImageIcon,
  Calendar,
  Clock,
  Edit3,
  X,
  ShieldCheck,
  Building2,
  Layers,
  Plane,
  Home,
  CheckCircle2,
  Info
} from 'lucide-react';
import confetti from 'canvas-confetti';

// ============================================================================
// CONSTANTS & VENUE METADATA (CROWN PALACE THÁI NGUYÊN)
// ============================================================================
export const VENUE_DETAILS = {
  name: 'Trung Tâm Tổ Chức Sự Kiện & Tiệc Cưới Crown Palace',
  subtitle: 'Địa điểm tổ chức Đại Lễ Kỷ Niệm 20 Năm Ngày Trở Về — Lớp K8A1',
  address: 'Số 779 đường Dương Tự Minh, P. Quang Vinh, TP. Thái Nguyên, Tỉnh Thái Nguyên',
  shortAddress: '779 Dương Tự Minh, TP. Thái Nguyên',
  coordinates: { lat: 21.6041, lng: 105.8286 },
  eventTime: '08:30 — 15:30 • Chủ Nhật, ngày 27/09/2026',
  hotline: '0208 3858 888',
  bllContact: '0912 345 678 (Ban Liên Lạc K8A1)',
  parkingInfo: 'Bãi đỗ xe ô tô & xe máy rộng rãi ngay trong khuôn viên Crown Palace, an ninh 24/7, bảo vệ hướng dẫn tận tình miễn phí.',
  googleMapsUrl: 'https://maps.google.com/?q=Crown+Palace+779+D%C6%B0%C6%A1ng+T%E1%BB%B1+Minh+Th%C3%A1i+Nguy%C3%AAn&ll=21.6041,105.8286&z=16',
  directionsUrl: 'https://www.google.com/maps/dir/?api=1&destination=21.6041,105.8286',
  embedMapUrl: 'https://maps.google.com/maps?q=Crown+Palace+779+D%C6%B0%C6%A1ng+T%E1%BB%B1+Minh+Th%C3%A1i+Nguy%C3%AAn&t=&z=15&ie=UTF8&iwloc=&output=embed'
};

export interface VenueMediaItem {
  id: string;
  title: string;
  url: string;
  type?: 'youtube' | 'facebook' | 'drive' | 'direct_video' | 'image';
  thumbnail?: string;
  desc?: string;
}

// Media mặc định minh họa không gian sang trọng của Crown Palace
export const DEFAULT_VENUE_MEDIA: VenueMediaItem[] = [
  {
    id: 'vm-1',
    title: 'Phóng Sự Video: Không Gian Sảnh Tiệc & Hội Nghị Crown Palace Thái Nguyên',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    thumbnail: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80',
    desc: 'Không gian sảnh tiệc lộng lẫy, hệ thống âm thanh ánh sáng hiện đại chuẩn bị đón tiếp đại gia đình K8A1.'
  },
  {
    id: 'vm-2',
    title: 'Ảnh Toàn Cảnh Sảnh Đại Tiệc Hoàng Gia',
    url: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=80',
    desc: 'Không gian bàn tiệc sang trọng nơi các bạn bè K8A1 cùng quây quần nâng ly sau 20 năm.'
  },
  {
    id: 'vm-3',
    title: 'Ảnh Khu Vực Tiền Sảnh Đón Tiếp & Photobooth Check-in',
    url: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1200&q=80',
    desc: 'Tiền sảnh rộng rãi bố trí Backdrop kỷ niệm 20 năm, bàn lễ tân phát thẻ học sinh và áo đồng phục.'
  },
  {
    id: 'vm-4',
    title: 'Ảnh Khuôn Viên Mặt Tiền & Bãi Đỗ Xe Rộng Rãi',
    url: 'https://images.unsplash.com/photo-1545232979-fbf68fe9ec1c?auto=format&fit=crop&w=1200&q=80',
    desc: 'Khuôn viên Crown Palace nằm trên trục đường lớn Dương Tự Minh với bãi đỗ xe ô tô và xe máy an toàn.'
  }
];

// ============================================================================
// HÀM PARSE LINK VIDEO / ẢNH TỔNG HỢP (FACEBOOK, YOUTUBE, DRIVE, MP4, IMAGE)
// ============================================================================
export function parseVenueMedia(url: string): {
  type: 'youtube' | 'facebook' | 'drive' | 'direct_video' | 'image' | 'empty';
  embedUrl: string;
  rawUrl: string;
  label: string;
  videoId?: string;
  driveId?: string;
} {
  if (!url || typeof url !== 'string') {
    return { type: 'empty', embedUrl: '', rawUrl: '', label: 'Trống' };
  }
  const cleanUrl = url.trim();

  // 1. Facebook Video / Post / Reel / Watch Link
  if (cleanUrl.includes('facebook.com') || cleanUrl.includes('fb.watch')) {
    const encoded = encodeURIComponent(cleanUrl);
    return {
      type: 'facebook',
      embedUrl: `https://www.facebook.com/plugins/video.php?href=${encoded}&show_text=0&autoplay=0`,
      rawUrl: cleanUrl,
      label: 'Facebook Video'
    };
  }

  // 2. YouTube Video (watch?v=, youtu.be/, embed/, shorts/)
  const ytMatch = cleanUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
  if (ytMatch && ytMatch[1]) {
    return {
      type: 'youtube',
      embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=0&rel=0`,
      rawUrl: cleanUrl,
      videoId: ytMatch[1],
      label: 'YouTube Video'
    };
  }

  // 3. Google Drive Video or Image File
  const driveMatch = cleanUrl.match(/drive\.google\.com\/(?:file\/d\/|open\?id=)([a-zA-Z0-9_-]+)/i);
  if (driveMatch && driveMatch[1]) {
    const fileId = driveMatch[1];
    return {
      type: 'drive',
      embedUrl: `https://drive.google.com/file/d/${fileId}/preview`,
      rawUrl: cleanUrl,
      driveId: fileId,
      label: 'Google Drive'
    };
  }

  // 4. Direct video file (.mp4, .webm, .ogg, .mov)
  if (/\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(cleanUrl)) {
    return {
      type: 'direct_video',
      embedUrl: cleanUrl,
      rawUrl: cleanUrl,
      label: 'Video Trực Tiếp'
    };
  }

  // 5. Image link (JPG, PNG, WebP, SVG, Unsplash, Google Drive Thumbnail, etc.)
  return {
    type: 'image',
    embedUrl: cleanUrl,
    rawUrl: cleanUrl,
    label: 'Hình Ảnh Không Gian'
  };
}

// ============================================================================
// UNIFIED ALUMNI CONVERGENCE MAP & VENUE SHOWCASE COMPONENT
// ============================================================================
interface Props {
  className?: string;
  customVenueMedia?: VenueMediaItem[];
}

export default function AlumniConvergenceMap({ className = '', customVenueMedia }: Props) {
  // Tab controller: 'all' (Song song 2 cột) | 'media' (Video & Không Gian) | 'map' (Bản Đồ Chỉ Đường)
  const [activeTab, setActiveTab] = useState<'all' | 'media' | 'map'>('all');
  const [copied, setCopied] = useState(false);

  // Danh sách video & ảnh không gian nhà hàng
  const [mediaList, setMediaList] = useState<VenueMediaItem[]>(() => {
    try {
      const local = localStorage.getItem('k8a1_venue_media_list');
      if (local) {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return customVenueMedia && customVenueMedia.length > 0 ? customVenueMedia : DEFAULT_VENUE_MEDIA;
  });

  const [activeMediaIndex, setActiveMediaIndex] = useState<number>(0);

  // Modal chỉnh sửa link video/ảnh nhà hàng
  const [isEditMediaModalOpen, setIsEditMediaModalOpen] = useState(false);
  const [newMediaUrl, setNewMediaUrl] = useState('');
  const [newMediaTitle, setNewMediaTitle] = useState('');
  const [newMediaDesc, setNewMediaDesc] = useState('');
  const [editSuccessMsg, setEditSuccessMsg] = useState('');

  const currentMedia = mediaList[activeMediaIndex] || mediaList[0] || DEFAULT_VENUE_MEDIA[0];
  const parsedCurrentMedia = useMemo(() => parseVenueMedia(currentMedia.url), [currentMedia.url]);

  // Sao chép địa chỉ nhà hàng
  const handleCopyAddress = () => {
    try {
      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(VENUE_DETAILS.address);
      }
    } catch {}
    setCopied(true);
    confetti({ particleCount: 20, spread: 45, origin: { y: 0.8 } });
    setTimeout(() => setCopied(false), 2500);
  };

  // Thêm sự kiện vào Google Calendar
  const handleAddToCalendar = () => {
    const title = encodeURIComponent('[Hội Ngộ 20 Năm Lớp K8A1] Ngày Trở Về — THPT Thái Nguyên');
    const details = encodeURIComponent(
      `Đại Lễ Kỷ Niệm 20 Năm Ngày Trở Về — Tập Thể Lớp K8A1 (Khóa 8, 2003 - 2006).\n` +
      `Địa điểm: ${VENUE_DETAILS.name} (${VENUE_DETAILS.address}).\n` +
      `Thời gian đón tiếp: 08:30 sáng - 15:30 chiều Chủ Nhật ngày 27/09/2026.\n` +
      `Liên hệ BLL: ${VENUE_DETAILS.bllContact}`
    );
    const location = encodeURIComponent(`${VENUE_DETAILS.name}, ${VENUE_DETAILS.address}`);
    const dates = "20260927T013000Z/20260927T083000Z";
    window.open(`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}&location=${location}`, '_blank');
  };

  // Lưu media mới (Facebook, YouTube, Drive, MP4, Ảnh)
  const handleAddMediaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMediaUrl.trim()) return;

    const parsed = parseVenueMedia(newMediaUrl.trim());
    const newItem: VenueMediaItem = {
      id: `vm-${Date.now()}`,
      title: newMediaTitle.trim() || (parsed.type === 'image' ? 'Ảnh Không Gian Nhà Hàng' : `Video Minh Họa (${parsed.label})`),
      url: newMediaUrl.trim(),
      type: parsed.type === 'empty' ? 'image' : parsed.type,
      desc: newMediaDesc.trim() || 'Minh họa không gian tổ chức sự kiện tại Crown Palace Thái Nguyên.'
    };

    const updated = [newItem, ...mediaList];
    setMediaList(updated);
    setActiveMediaIndex(0);
    try {
      localStorage.setItem('k8a1_venue_media_list', JSON.stringify(updated));
    } catch {}

    setEditSuccessMsg('Đã cập nhật video/ảnh nhà hàng thành công!');
    setTimeout(() => {
      setEditSuccessMsg('');
      setIsEditMediaModalOpen(false);
      setNewMediaUrl('');
      setNewMediaTitle('');
      setNewMediaDesc('');
    }, 1200);
  };

  // Reset về danh sách mặc định
  const handleResetDefaultMedia = () => {
    setMediaList(DEFAULT_VENUE_MEDIA);
    setActiveMediaIndex(0);
    try {
      localStorage.removeItem('k8a1_venue_media_list');
    } catch {}
    setEditSuccessMsg('Đã khôi phục danh sách mặc định!');
    setTimeout(() => setEditSuccessMsg(''), 1500);
  };

  return (
    <section id="tu-hoi" className={`space-y-6 scroll-mt-20 ${className}`}>
      
      {/* ======================================================== */}
      {/* 🌟 CONTAINER CHÍNH: BẢN ĐỒ TỤ HỘI & ĐỊA ĐIỂM CROWN PALACE */}
      {/* ======================================================== */}
      <div className="bg-[#FAF7F2] border border-amber-200/90 rounded-3xl p-5 sm:p-8 shadow-lg relative overflow-hidden space-y-6 text-left">
        
        {/* Nền hoa văn vân sáng & hiệu ứng Glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-amber-200/20 via-orange-100/10 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-rose-100/20 via-transparent to-transparent rounded-full blur-3xl pointer-events-none" />

        {/* 🌟 HEADER CHÍNH */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-amber-300/60 pb-5 gap-4 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-100 to-amber-200/80 text-amber-950 text-[10px] font-bold tracking-wider font-sans uppercase border border-amber-300/60 shadow-2xs">
              <Compass className="w-3.5 h-3.5 text-amber-700 animate-spin-slow" />
              <span>Tọa Độ Hội Ngộ 20 Năm • Crown Palace Thái Nguyên</span>
            </div>

            <h3 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-[#1E293B] tracking-tight">
              Bản Đồ Tụ Hội & Địa Điểm Tổ Chức K8A1
            </h3>

            <p className="text-xs sm:text-sm text-slate-600 font-serif italic leading-relaxed">
              “Hai mươi năm bôn ba khắp muôn phương, ngày 27/09/2026 — mọi ngả đường đều dẫn về Crown Palace Thái Nguyên để cùng viết tiếp thanh xuân.”
            </p>
          </div>

          {/* Quick Action Navigation Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <a
              href={VENUE_DETAILS.directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white rounded-xl text-xs font-sans font-bold uppercase tracking-wider shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 cursor-pointer"
            >
              <Navigation className="w-3.5 h-3.5 text-amber-200" />
              <span>Chỉ Đường Google Maps</span>
            </a>

            <button
              type="button"
              onClick={handleCopyAddress}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-white hover:bg-amber-50 text-slate-700 border border-slate-300/90 rounded-xl text-xs font-sans font-bold uppercase tracking-wider transition-colors shadow-2xs cursor-pointer"
              title="Sao chép địa chỉ chính xác"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
              <span>{copied ? 'Đã Sao Chép' : 'Sao Chép Địa Chỉ'}</span>
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 🗺️ KHỐI 1: BẢN ĐỒ VECTOR HÀNH TRÌNH TỤ HỘI TOÀN QUỐC */}
        {/* ======================================================== */}
        <div className="bg-gradient-to-br from-[#1E293B] via-[#0F172A] to-[#1E293B] text-white rounded-2xl p-4 sm:p-6 shadow-md border border-slate-700/80 relative z-10 space-y-4">
          
          <div className="flex items-center justify-between border-b border-slate-700/80 pb-2.5 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-amber-400 text-base">✈️</span>
              <span className="font-serif font-bold text-sm text-amber-200">
                Hành Trình Tụ Hội Về Đất Trà Thái Nguyên
              </span>
            </div>
            <span className="text-[10px] font-mono text-slate-400 italic hidden sm:inline">
              Chủ Nhật, ngày 27/09/2026
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            
            {/* Vector Sơ đồ luồng hội tụ */}
            <div className="md:col-span-6 relative flex items-center justify-center bg-slate-950/80 rounded-xl p-3 border border-slate-800 h-40 shadow-inner overflow-hidden">
              <svg viewBox="0 0 220 120" className="w-full h-full select-none">
                <defs>
                  <linearGradient id="unifyGlowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#e11d48" stopOpacity="0.9" />
                  </linearGradient>
                </defs>

                {/* Đường bay cong hội tụ về Thái Nguyên (130, 30) */}
                <path d="M 35,100 Q 80,70 130,30" fill="none" stroke="url(#unifyGlowGrad)" strokeWidth="1.6" strokeDasharray="4 2" className="opacity-80" />
                <path d="M 70,108 Q 105,75 130,30" fill="none" stroke="#f59e0b" strokeWidth="1.6" strokeDasharray="4 2" className="opacity-75" />
                <path d="M 185,75 Q 160,52 130,30" fill="none" stroke="#f59e0b" strokeWidth="1.6" strokeDasharray="4 2" className="opacity-75" />
                
                {/* Điểm xuất phát TP.HCM */}
                <circle cx="35" cy="100" r="3" fill="#94a3b8" />
                <text x="14" y="113" fill="#cbd5e1" fontSize="7.5" fontFamily="sans-serif">TP.HCM</text>
                
                {/* Điểm xuất phát Đà Nẵng */}
                <circle cx="70" cy="108" r="3" fill="#94a3b8" />
                <text x="60" y="118" fill="#cbd5e1" fontSize="7.5" fontFamily="sans-serif">Đà Nẵng</text>

                {/* Điểm xuất phát Hà Nội */}
                <circle cx="185" cy="75" r="3" fill="#94a3b8" />
                <text x="175" y="87" fill="#cbd5e1" fontSize="7.5" fontFamily="sans-serif">Hà Nội</text>

                {/* Đích đến: THÁI NGUYÊN (CROWN PALACE) */}
                <circle cx="130" cy="30" r="9" fill="#e11d48" className="animate-ping opacity-60" />
                <circle cx="130" cy="30" r="5" fill="#fbbf24" />
                <circle cx="130" cy="30" r="2.5" fill="#ffffff" />
                <text x="82" y="18" fill="#fef08a" fontSize="8.5" fontWeight="bold" fontFamily="serif">
                  ★ CROWN PALACE THÁI NGUYÊN
                </text>
              </svg>
            </div>

            {/* Thống kê các trạm bạn bè xuất phát */}
            <div className="md:col-span-6 grid grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-800/90 p-2.5 rounded-lg border border-slate-700">
                <div className="text-amber-300 font-bold flex items-center space-x-1">
                  <span>🏡</span> <span>Thái Nguyên</span>
                </div>
                <div className="text-slate-100 font-semibold mt-0.5 text-xs">~25 bạn bè</div>
                <div className="text-[10px] text-emerald-400 mt-0.5 flex items-center gap-1 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
                  Sẵn sàng đón tiếp
                </div>
              </div>

              <div className="bg-slate-800/90 p-2.5 rounded-lg border border-slate-700">
                <div className="text-amber-300 font-bold flex items-center space-x-1">
                  <span>🚗</span> <span>Hà Nội & Lân Cận</span>
                </div>
                <div className="text-slate-100 font-semibold mt-0.5 text-xs">~12 bạn bè</div>
                <div className="text-[10px] text-sky-400 mt-0.5 flex items-center gap-1 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400 inline-block" />
                  Đoàn xe cao tốc 80km
                </div>
              </div>

              <div className="bg-slate-800/90 p-2.5 rounded-lg border border-slate-700">
                <div className="text-amber-300 font-bold flex items-center space-x-1">
                  <span>✈️</span> <span>Miền Trung / Nam</span>
                </div>
                <div className="text-slate-100 font-semibold mt-0.5 text-xs">~4 bạn bè</div>
                <div className="text-[10px] text-amber-300 mt-0.5 flex items-center gap-1 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-300 inline-block" />
                  Bay về sân bay Nội Bài
                </div>
              </div>

              <div className="bg-slate-800/90 p-2.5 rounded-lg border border-slate-700">
                <div className="text-amber-300 font-bold flex items-center space-x-1">
                  <span>🌏</span> <span>Phương Xa</span>
                </div>
                <div className="text-slate-100 font-semibold mt-0.5 text-xs">~2 bạn bè</div>
                <div className="text-[10px] text-purple-300 mt-0.5 flex items-center gap-1 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-300 inline-block" />
                  Gửi trọn tình cảm
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ======================================================== */}
        {/* 🌟 THANH CHUYỂN TAB TRỰC QUAN */}
        {/* ======================================================== */}
        <div className="flex items-center justify-between gap-3 flex-wrap relative z-10">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-sans font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
                activeTab === 'all'
                  ? 'bg-[#1E293B] text-amber-200 shadow-sm border border-slate-700'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-amber-400 hover:bg-amber-50/50'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Xem Song Song (Bản Đồ & Video)</span>
            </button>

            <button
              onClick={() => setActiveTab('media')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-sans font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
                activeTab === 'media'
                  ? 'bg-[#1E293B] text-amber-200 shadow-sm border border-slate-700'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-amber-400 hover:bg-amber-50/50'
              }`}
            >
              <Video className="w-3.5 h-3.5" />
              <span>Video & Không Gian Nhà Hàng ({mediaList.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('map')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-sans font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
                activeTab === 'map'
                  ? 'bg-[#1E293B] text-amber-200 shadow-sm border border-slate-700'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-amber-400 hover:bg-amber-50/50'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Bản Đồ Google Maps</span>
            </button>
          </div>

          {/* Nút tùy chỉnh link video/ảnh nhà hàng */}
          <button
            type="button"
            onClick={() => setIsEditMediaModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-100/80 hover:bg-amber-200 text-amber-950 rounded-lg text-xs font-sans font-bold border border-amber-300/80 transition cursor-pointer"
            title="Dán link Facebook, YouTube, Google Drive hoặc ảnh minh họa nhà hàng"
          >
            <Edit3 className="w-3.5 h-3.5 text-amber-700" />
            <span>Đổi Video / Ảnh Nhà Hàng</span>
          </button>
        </div>

        {/* ======================================================== */}
        {/* 🌟 KHỐI 2: DUAL COLUMN (VIDEO/ẢNH MINH HỌA + GOOGLE MAPS) */}
        {/* ======================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10 items-stretch">
          
          {/* ========================================== */}
          {/* 🎬 CỘT A: VIDEO & ẢNH MINH HỌA NHÀ HÀNG */}
          {/* ========================================== */}
          {(activeTab === 'all' || activeTab === 'media') && (
            <div className={`${activeTab === 'media' ? 'lg:col-span-12' : 'lg:col-span-6'} bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-sm flex flex-col justify-between space-y-4`}>
              
              {/* Media Title & Badges */}
              <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                    {parsedCurrentMedia.type === 'image' ? (
                      <ImageIcon className="w-4 h-4" />
                    ) : (
                      <Video className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-amber-800 block">
                      {parsedCurrentMedia.label}
                    </span>
                    <h4 className="font-serif font-bold text-xs sm:text-sm text-slate-800 line-clamp-1">
                      {currentMedia.title}
                    </h4>
                  </div>
                </div>

                <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold">
                  {activeMediaIndex + 1} / {mediaList.length}
                </span>
              </div>

              {/* 🌟 TRÌNH PHÁT ĐA ĐỊNH DẠNG (FACEBOOK, YOUTUBE, DRIVE, MP4, ẢNH) */}
              <div className="relative rounded-xl overflow-hidden bg-slate-950 border-2 border-amber-300/40 shadow-inner aspect-video flex items-center justify-center">
                
                {/* 1. Facebook Video Embed */}
                {parsedCurrentMedia.type === 'facebook' && (
                  <iframe
                    title={currentMedia.title}
                    src={parsedCurrentMedia.embedUrl}
                    className="w-full h-full border-0"
                    allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                    allowFullScreen
                    loading="lazy"
                  />
                )}

                {/* 2. YouTube Video Embed */}
                {parsedCurrentMedia.type === 'youtube' && (
                  <iframe
                    title={currentMedia.title}
                    src={parsedCurrentMedia.embedUrl}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    loading="lazy"
                  />
                )}

                {/* 3. Google Drive Video / File Embed */}
                {parsedCurrentMedia.type === 'drive' && (
                  <iframe
                    title={currentMedia.title}
                    src={parsedCurrentMedia.embedUrl}
                    className="w-full h-full border-0"
                    allow="autoplay"
                    allowFullScreen
                    loading="lazy"
                  />
                )}

                {/* 4. Direct HTML5 Video (.mp4 / .webm) */}
                {parsedCurrentMedia.type === 'direct_video' && (
                  <video
                    src={parsedCurrentMedia.embedUrl}
                    controls
                    className="w-full h-full object-cover"
                    poster={currentMedia.thumbnail}
                  >
                    Trình duyệt của bạn không hỗ trợ thẻ video.
                  </video>
                )}

                {/* 5. Image Showcase */}
                {parsedCurrentMedia.type === 'image' && (
                  <div className="w-full h-full relative group">
                    <img
                      src={parsedCurrentMedia.embedUrl}
                      alt={currentMedia.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=80';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                      <p className="text-white text-xs font-serif italic">
                        {currentMedia.desc || 'Không gian sảnh tiệc sang trọng tại Crown Palace Thái Nguyên'}
                      </p>
                    </div>
                  </div>
                )}

                {/* Fallback khi link trống */}
                {parsedCurrentMedia.type === 'empty' && (
                  <div className="text-center p-6 text-slate-400 space-y-2">
                    <Video className="w-10 h-10 text-slate-500 mx-auto animate-pulse" />
                    <p className="text-xs font-serif">Chưa có video hoặc ảnh minh họa nào được cấu hình.</p>
                  </div>
                )}
              </div>

              {/* Mô tả media hiện tại */}
              {currentMedia.desc && (
                <p className="text-xs text-slate-600 font-serif italic bg-amber-50/70 p-2.5 rounded-lg border border-amber-200/60">
                  💡 {currentMedia.desc}
                </p>
              )}

              {/* Playlist Thumbnails chuyển đổi nhanh góc nhìn */}
              {mediaList.length > 1 && (
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-slate-500 block">
                    Góc nhìn không gian Crown Palace:
                  </span>
                  
                  <div className="grid grid-cols-4 gap-2">
                    {mediaList.map((item, idx) => {
                      const isActive = idx === activeMediaIndex;
                      const parsed = parseVenueMedia(item.url);
                      const isVid = parsed.type !== 'image';

                      return (
                        <div
                          key={item.id || idx}
                          onClick={() => setActiveMediaIndex(idx)}
                          className={`relative rounded-lg overflow-hidden border-2 cursor-pointer transition-all aspect-[4/3] bg-slate-900 ${
                            isActive
                              ? 'border-amber-500 ring-2 ring-amber-400/40 shadow-sm scale-102'
                              : 'border-slate-200 hover:border-amber-400 opacity-75 hover:opacity-100'
                          }`}
                          title={item.title}
                        >
                          <img
                            src={item.thumbnail || (parsed.type === 'image' ? item.url : 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=400&q=80')}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                            {isVid ? (
                              <Play className={`w-3.5 h-3.5 ${isActive ? 'text-amber-300 fill-amber-300' : 'text-white'}`} />
                            ) : (
                              <ImageIcon className={`w-3 h-3 ${isActive ? 'text-amber-300' : 'text-white'}`} />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>
          )}

          {/* ========================================== */}
          {/* 🗺️ CỘT B: BẢN ĐỒ GOOGLE MAPS TƯƠNG TÁC */}
          {/* ========================================== */}
          {(activeTab === 'all' || activeTab === 'map') && (
            <div className={`${activeTab === 'map' ? 'lg:col-span-12' : 'lg:col-span-6'} bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-sm flex flex-col justify-between space-y-4`}>
              
              {/* Map Header */}
              <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                    <Compass className="w-4 h-4 text-amber-700" />
                  </div>
                  <div>
                    <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-amber-800 block">
                      Vị Trí Bản Đồ Google Maps
                    </span>
                    <h4 className="font-serif font-bold text-xs sm:text-sm text-slate-800 line-clamp-1">
                      {VENUE_DETAILS.name}
                    </h4>
                  </div>
                </div>

                <a
                  href={VENUE_DETAILS.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] font-sans font-bold text-amber-800 hover:text-amber-950 flex items-center gap-1 bg-amber-50 px-2 py-1 rounded border border-amber-200"
                >
                  <span>Mở Toàn Màn Hình</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* 🌟 GOOGLE MAPS EMBED */}
              <div className="relative rounded-xl overflow-hidden border-2 border-amber-300/40 shadow-inner aspect-video bg-[#E5E3DF]">
                <iframe
                  title="Bản đồ Google Maps Crown Palace Thái Nguyên"
                  src={VENUE_DETAILS.embedMapUrl}
                  className="w-full h-full border-0"
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />

                {/* Location Badge */}
                <div className="absolute top-2.5 left-2.5 bg-black/80 backdrop-blur-md text-white px-2.5 py-1 rounded-lg text-[10px] font-sans font-bold flex items-center gap-1.5 shadow-md border border-white/20 pointer-events-none">
                  <MapPin className="w-3 h-3 text-amber-400" />
                  <span>Crown Palace Thái Nguyên</span>
                </div>
              </div>

              {/* Thông tin chi tiết */}
              <div className="space-y-2 text-xs text-slate-700 font-sans">
                <div className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
                  <MapPin className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-900 block">Địa chỉ tổ chức:</span>
                    <span className="text-slate-600 font-serif">{VENUE_DETAILS.address}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
                    <Clock className="w-4 h-4 text-amber-700 shrink-0" />
                    <div>
                      <span className="font-bold text-[11px] text-slate-900 block">Thời gian:</span>
                      <span className="text-[11px] text-slate-600 font-mono">Từ 08:30 Sáng 27/09</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
                    <Car className="w-4 h-4 text-amber-700 shrink-0" />
                    <div>
                      <span className="font-bold text-[11px] text-slate-900 block">Bãi đỗ xe:</span>
                      <span className="text-[11px] text-emerald-700 font-bold">Ô tô & Xe máy Free</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-1">
                <a
                  href={VENUE_DETAILS.directionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 bg-[#1E293B] hover:bg-slate-800 text-white rounded-xl text-xs font-sans font-bold uppercase tracking-wider shadow-sm transition"
                >
                  <Navigation className="w-3.5 h-3.5 text-amber-300" />
                  <span>Bật Chỉ Đường Ngay</span>
                </a>

                <button
                  type="button"
                  onClick={handleAddToCalendar}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300/80 rounded-xl text-xs font-sans font-bold uppercase tracking-wider transition cursor-pointer"
                  title="Thêm vào Google Calendar"
                >
                  <Calendar className="w-3.5 h-3.5 text-amber-700" />
                  <span className="hidden sm:inline">Lưu Lịch Hẹn</span>
                </button>
              </div>

            </div>
          )}

        </div>

        {/* ======================================================== */}
        {/* 🚗 KHỐI 3: HƯỚNG DẪN DI CHUYỂN & ĐỖ XE TIỆN LỢI */}
        {/* ======================================================== */}
        <div className="bg-gradient-to-r from-amber-50 via-orange-50/40 to-amber-50 rounded-2xl border border-amber-200/90 p-4 sm:p-5 relative z-10 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-900 font-sans uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Hướng Dẫn Di Chuyển & Đón Tiếp Cho Bạn Bè K8A1</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="bg-white/90 p-3 rounded-xl border border-amber-200/60 space-y-1">
              <span className="font-bold text-amber-950 flex items-center gap-1">
                🚗 Bạn đi Ô Tô Riêng:
              </span>
              <p className="text-slate-600 font-serif italic text-[11px] leading-relaxed">
                Crown Palace có khuôn viên đỗ xe ô tô cực kỳ rộng rãi và râm mát ngay phía trước sảnh tiệc. Có bảo vệ túc trực phân làn 24/7.
              </p>
            </div>

            <div className="bg-white/90 p-3 rounded-xl border border-amber-200/60 space-y-1">
              <span className="font-bold text-amber-950 flex items-center gap-1">
                🛵 Bạn đi Xe Máy:
              </span>
              <p className="text-slate-600 font-serif italic text-[11px] leading-relaxed">
                Khu vực để xe máy có mái che, bảo vệ phát thẻ xe tự động và hướng dẫn chu đáo ngay khi bạn rẽ vào cổng 779 Dương Tự Minh.
              </p>
            </div>

            <div className="bg-white/90 p-3 rounded-xl border border-amber-200/60 space-y-1">
              <span className="font-bold text-amber-950 flex items-center gap-1">
                ✈️ Bạn ở xa về (Hà Nội / Tỉnh khác):
              </span>
              <p className="text-slate-600 font-serif italic text-[11px] leading-relaxed">
                Xe khách hoặc Taxi chạy thẳng theo cao tốc Hà Nội - Thái Nguyên, qua cầu Gia Bảy đến đường Dương Tự Minh (~5 phút).
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* ======================================================== */}
      {/* ✏️ MODAL TÙY CHỈNH LINK VIDEO / ẢNH MINH HỌA NHÀ HÀNG */}
      {/* ======================================================== */}
      {isEditMediaModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-amber-200 relative text-left space-y-5">
            
            <button
              type="button"
              onClick={() => {
                setIsEditMediaModalOpen(false);
                setEditSuccessMsg('');
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1 border-b border-slate-200 pb-3">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Cấu Hình Không Gian Sự Kiện</span>
              </div>
              <h3 className="font-serif font-bold text-xl text-[#1E293B]">
                Tùy Chỉnh Video & Ảnh Nhà Hàng
              </h3>
              <p className="text-xs text-slate-500 font-serif italic">
                Hỗ trợ dán link video từ <strong>Facebook, YouTube, Google Drive, Direct MP4</strong> hoặc link ảnh chụp không gian Crown Palace.
              </p>
            </div>

            {editSuccessMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{editSuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleAddMediaSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Đường dẫn Link (Facebook / YouTube / Google Drive / Ảnh): <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="https://www.facebook.com/watch/?v=... hoặc https://youtu.be/..."
                  value={newMediaUrl}
                  onChange={(e) => setNewMediaUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-amber-500 text-slate-800 font-mono text-xs"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  💡 Bạn có thể dán link video Facebook fanpage nhà hàng, video review YouTube, hoặc link ảnh sảnh tiệc.
                </span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Tiêu đề video / ảnh (Tùy chọn):
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Video Giới Thiệu Sảnh Tiệc Hoàng Gia Crown Palace"
                  value={newMediaTitle}
                  onChange={(e) => setNewMediaTitle(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-amber-500 text-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Mô tả ngắn (Tùy chọn):
                </label>
                <textarea
                  rows={2}
                  placeholder="Mô tả về không gian, thực đơn, bãi đỗ xe..."
                  value={newMediaDesc}
                  onChange={(e) => setNewMediaDesc(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-amber-500 text-slate-800"
                />
              </div>

              <div className="pt-2 flex items-center justify-between gap-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={handleResetDefaultMedia}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer transition"
                >
                  Khôi Phục Mặc Định
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditMediaModalOpen(false)}
                    className="px-3.5 py-2 bg-white border border-slate-300 text-slate-600 rounded-xl hover:bg-slate-50 cursor-pointer"
                  >
                    Đóng
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-md cursor-pointer transition"
                  >
                    Lưu & Hiển Thị Ngay
                  </button>
                </div>
              </div>
            </form>

          </div>
        </div>
      )}

    </section>
  );
}
