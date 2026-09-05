import React, { useState, useMemo } from 'react';
import {
  MapPin,
  Navigation,
  Copy,
  Check,
  Compass,
  Sparkles,
  Play,
  Video,
  Image as ImageIcon,
  Edit3,
  X,
  ExternalLink,
  Shield,
  Upload,
  Plus
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserRole, VenueMediaItem } from '../types';

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

// Media mặc định minh họa không gian tổ chức họp lớp tại Crown Palace
export const DEFAULT_VENUE_MEDIA: VenueMediaItem[] = [
  {
    id: 'vm-1',
    title: 'Không Gian Sảnh Tiệc & Sân Khấu Crown Palace',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    thumbnail: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80',
    desc: 'Không gian sảnh tiệc chính chuẩn bị đón tiếp đại gia đình K8A1 nhân kỷ niệm 20 năm.'
  },
  {
    id: 'vm-2',
    title: 'Bàn Tiệc Hội Ngộ Ấm Cúng',
    url: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=80',
    desc: 'Bàn tiệc sang trọng nơi bạn bè K8A1 cùng quây quần nâng ly sau 20 năm ngày ra trường.'
  },
  {
    id: 'vm-3',
    title: 'Khu Vực Đón Tiếp & Check-in K8A1',
    url: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1200&q=80',
    desc: 'Tiền sảnh bố trí Backdrop "20 Năm Ngày Trở Về" đón bạn bè và thầy cô.'
  },
  {
    id: 'vm-4',
    title: 'Khuôn Viên & Bãi Đỗ Xe Rộng Rãi',
    url: 'https://images.unsplash.com/photo-1545232979-fbf68fe9ec1c?auto=format&fit=crop&w=1200&q=80',
    desc: 'Khuôn viên nằm trên đường lớn Dương Tự Minh, bãi đỗ xe ô tô và xe máy rộng rãi.'
  }
];

// ============================================================================
// HÀM PARSE LINK VIDEO / ẢNH (FACEBOOK REEL, FACEBOOK VIDEO, YOUTUBE, DRIVE, MP4, IMAGE)
// ============================================================================
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

  // 1. Facebook Reel / Video / Watch / Post / Share
  if (cleanUrl.includes('facebook.com') || cleanUrl.includes('fb.watch') || cleanUrl.includes('fb.com')) {
    const isReel = cleanUrl.includes('/reel/') || cleanUrl.includes('/reels/') || cleanUrl.includes('/share/r/');
    
    // Normalize URL for Facebook Plugin
    let canonical = cleanUrl;
    const reelMatch = cleanUrl.match(/(?:reel|reels)\/(\d+)/i);
    if (reelMatch && reelMatch[1]) {
      canonical = `https://www.facebook.com/reel/${reelMatch[1]}/`;
    }
    
    const encoded = encodeURIComponent(canonical);
    const embedUrl = `https://www.facebook.com/plugins/video.php?href=${encoded}&show_text=0&autoplay=0`;

    return {
      type: 'facebook',
      isReel,
      embedUrl,
      rawUrl: cleanUrl,
      canonicalUrl: canonical,
      label: isReel ? 'Facebook Reel' : 'Facebook Video'
    };
  }

  // 2. YouTube Video
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

  // 3. Google Drive Video or File
  const driveMatch = cleanUrl.match(/drive\.google\.com\/(?:file\/d\/|open\?id=)([a-zA-Z0-9_-]+)/i);
  if (driveMatch && driveMatch[1]) {
    const fileId = driveMatch[1];
    return {
      type: 'drive',
      embedUrl: `https://drive.google.com/file/d/${fileId}/preview`,
      rawUrl: cleanUrl,
      canonicalUrl: cleanUrl,
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
      canonicalUrl: cleanUrl,
      label: 'Video Trực Tiếp'
    };
  }

  // 5. Image link (JPG, PNG, WebP, etc.)
  return {
    type: 'image',
    embedUrl: cleanUrl,
    rawUrl: cleanUrl,
    canonicalUrl: cleanUrl,
    label: 'Hình Ảnh'
  };
}

// ============================================================================
// STREAMLINED ALUMNI CONVERGENCE MAP & VENUE SHOWCASE COMPONENT
// ============================================================================
interface Props {
  className?: string;
  venueMediaList?: VenueMediaItem[];
  onUpdateVenueMediaList?: (list: VenueMediaItem[]) => void;
  currentUserRole?: UserRole;
  onOpenAdminHub?: () => void;
}

export default function AlumniConvergenceMap({
  className = '',
  venueMediaList,
  onUpdateVenueMediaList,
  currentUserRole = 'guest',
  onOpenAdminHub
}: Props) {
  const [copied, setCopied] = useState(false);
  const isAuthorized = currentUserRole === 'admin' || currentUserRole === 'bll';

  // Danh sách video & ảnh không gian nhà hàng
  const [mediaList, setMediaList] = useState<VenueMediaItem[]>(() => {
    if (venueMediaList && venueMediaList.length > 0) return venueMediaList;
    try {
      const local = localStorage.getItem('k8a1_venue_media_list');
      if (local) {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return DEFAULT_VENUE_MEDIA;
  });

  // Đồng bộ khi prop thay đổi
  React.useEffect(() => {
    if (venueMediaList && venueMediaList.length > 0) {
      setMediaList(venueMediaList);
    }
  }, [venueMediaList]);

  const [activeMediaIndex, setActiveMediaIndex] = useState<number>(0);

  // Modal chỉnh sửa nhanh dành cho BLL / Admin
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
    setTimeout(() => setCopied(false), 2000);
  };

  // Upload file ảnh từ máy
  const handlePhotoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      alert('Kích thước ảnh tối đa là 8MB!');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setNewMediaUrl(result);
        if (!newMediaTitle.trim()) {
          setNewMediaTitle('Ảnh Không Gian Crown Palace');
        }
      }
    };
    reader.readAsDataURL(file);
  };

  // Lưu media mới (Facebook Reel, Facebook Video, YouTube, Drive, MP4, Ảnh)
  const handleAddMediaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMediaUrl.trim()) return;

    const parsed = parseVenueMedia(newMediaUrl.trim());
    const newItem: VenueMediaItem = {
      id: `vm-${Date.now()}`,
      title: newMediaTitle.trim() || (parsed.type === 'image' ? 'Ảnh Không Gian Nhà Hàng' : `${parsed.label} Minh Họa`),
      url: newMediaUrl.trim(),
      type: parsed.type === 'empty' ? 'image' : parsed.type,
      desc: newMediaDesc.trim() || 'Minh họa không gian tổ chức họp lớp tại Crown Palace Thái Nguyên.'
    };

    const updated = [newItem, ...mediaList];
    setMediaList(updated);
    setActiveMediaIndex(0);
    try {
      localStorage.setItem('k8a1_venue_media_list', JSON.stringify(updated));
    } catch {}
    if (onUpdateVenueMediaList) {
      onUpdateVenueMediaList(updated);
    }

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
    if (onUpdateVenueMediaList) {
      onUpdateVenueMediaList(DEFAULT_VENUE_MEDIA);
    }
    setEditSuccessMsg('Đã khôi phục danh sách mặc định!');
    setTimeout(() => setEditSuccessMsg(''), 1500);
  };

  return (
    <section id="tu-hoi" className={`space-y-6 scroll-mt-20 ${className}`}>
      
      {/* ======================================================== */}
      {/* 🌟 CONTAINER CHÍNH: BẢN ĐỒ TỤ HỘI & ĐỊA ĐIỂM HỌP LỚP */}
      {/* ======================================================== */}
      <div className="bg-[#FAF7F2] border border-amber-200/90 rounded-3xl p-5 sm:p-7 shadow-lg relative overflow-hidden space-y-6 text-left">
        
        {/* Nền hoa văn vân sáng */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-amber-200/20 via-orange-100/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        {/* 🌟 HEADER TINH TẾ */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-amber-300/60 pb-4 gap-3 relative z-10">
          <div className="space-y-1.5 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-100 text-amber-950 text-[10px] font-bold tracking-wider font-sans uppercase border border-amber-300/60">
              <Compass className="w-3.5 h-3.5 text-amber-700 animate-spin-slow" />
              <span>Hội Ngộ 20 Năm • K8A1 (2003 — 2006)</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-serif font-bold text-[#1E293B] tracking-tight">
              Bản Đồ Tụ Hội & Địa Điểm Họp Lớp
            </h3>

            <p className="text-xs text-slate-600 font-serif italic leading-relaxed">
              “Hai mươi năm ngày trở về — dù ở bất cứ nơi đâu, ngày 27/09/2026 mọi ngả đường đều dẫn về Thái Nguyên gặp lại bạn bè.”
            </p>
          </div>

          {/* Action Buttons: Chỉ Đường & Sao Chép */}
          <div className="flex items-center gap-2 shrink-0">
            <a
              href={VENUE_DETAILS.directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white rounded-xl text-xs font-sans font-bold uppercase tracking-wider shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              <Navigation className="w-3.5 h-3.5 text-amber-200" />
              <span>Chỉ Đường</span>
            </a>

            <button
              type="button"
              onClick={handleCopyAddress}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-amber-50 text-slate-700 border border-slate-300/90 rounded-xl text-xs font-sans font-bold uppercase tracking-wider transition-colors shadow-2xs cursor-pointer"
              title="Sao chép địa chỉ chính xác"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
              <span>{copied ? 'Đã Sao Chép' : 'Sao Chép'}</span>
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 🗺️ KHỐI 1: BẢN ĐỒ VECTOR HÀNH TRÌNH TỤ HỘI K8A1 */}
        {/* ======================================================== */}
        <div className="bg-gradient-to-br from-[#1E293B] via-[#0F172A] to-[#1E293B] text-white rounded-2xl p-4 sm:p-5 shadow-md border border-slate-700/80 relative z-10 space-y-3.5">
          
          <div className="flex items-center justify-between border-b border-slate-700/80 pb-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-amber-400 text-sm">✈️</span>
              <span className="font-serif font-bold text-xs sm:text-sm text-amber-200">
                Hành Trình Trở Về Của Tập Thể Lớp K8A1
              </span>
            </div>
            <span className="text-[10px] font-mono text-slate-400 italic">
              Chủ Nhật, ngày 27/09/2026
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-center">
            
            {/* Vector Sơ đồ luồng hội tụ */}
            <div className="md:col-span-6 relative flex items-center justify-center bg-slate-950/80 rounded-xl p-2.5 border border-slate-800 h-36 shadow-inner overflow-hidden">
              <svg viewBox="0 0 220 115" className="w-full h-full select-none">
                <defs>
                  <linearGradient id="roleGlowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#e11d48" stopOpacity="0.9" />
                  </linearGradient>
                </defs>

                {/* Đường bay cong hội tụ về Thái Nguyên (130, 28) */}
                <path d="M 35,95 Q 80,68 130,28" fill="none" stroke="url(#roleGlowGrad)" strokeWidth="1.6" strokeDasharray="4 2" className="opacity-80" />
                <path d="M 70,102 Q 105,72 130,28" fill="none" stroke="#f59e0b" strokeWidth="1.6" strokeDasharray="4 2" className="opacity-75" />
                <path d="M 185,70 Q 160,48 130,28" fill="none" stroke="#f59e0b" strokeWidth="1.6" strokeDasharray="4 2" className="opacity-75" />
                
                {/* Điểm xuất phát TP.HCM */}
                <circle cx="35" cy="95" r="3" fill="#94a3b8" />
                <text x="14" y="108" fill="#cbd5e1" fontSize="7.5" fontFamily="sans-serif">TP.HCM</text>
                
                {/* Điểm xuất phát Đà Nẵng */}
                <circle cx="70" cy="102" r="3" fill="#94a3b8" />
                <text x="60" y="112" fill="#cbd5e1" fontSize="7.5" fontFamily="sans-serif">Đà Nẵng</text>

                {/* Điểm xuất phát Hà Nội */}
                <circle cx="185" cy="70" r="3" fill="#94a3b8" />
                <text x="175" y="82" fill="#cbd5e1" fontSize="7.5" fontFamily="sans-serif">Hà Nội</text>

                {/* Đích đến: THÁI NGUYÊN (K8A1 HỘI NGỘ) */}
                <circle cx="130" cy="28" r="8" fill="#e11d48" className="animate-ping opacity-60" />
                <circle cx="130" cy="28" r="4.5" fill="#fbbf24" />
                <circle cx="130" cy="28" r="2" fill="#ffffff" />
                <text x="75" y="17" fill="#fef08a" fontSize="8.5" fontWeight="bold" fontFamily="serif">
                  ★ K8A1 HỘI NGỘ (THÁI NGUYÊN)
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
                  Sẵn sàng đón bạn
                </div>
              </div>

              <div className="bg-slate-800/90 p-2.5 rounded-lg border border-slate-700">
                <div className="text-amber-300 font-bold flex items-center space-x-1">
                  <span>🚗</span> <span>Hà Nội & Lân Cận</span>
                </div>
                <div className="text-slate-100 font-semibold mt-0.5 text-xs">~12 bạn bè</div>
                <div className="text-[10px] text-sky-400 mt-0.5 flex items-center gap-1 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400 inline-block" />
                  Đoàn xe 80km
                </div>
              </div>

              <div className="bg-slate-800/90 p-2.5 rounded-lg border border-slate-700">
                <div className="text-amber-300 font-bold flex items-center space-x-1">
                  <span>✈️</span> <span>Miền Trung / Nam</span>
                </div>
                <div className="text-slate-100 font-semibold mt-0.5 text-xs">~4 bạn bè</div>
                <div className="text-[10px] text-amber-300 mt-0.5 flex items-center gap-1 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-300 inline-block" />
                  Bay về họp khóa
                </div>
              </div>

              <div className="bg-slate-800/90 p-2.5 rounded-lg border border-slate-700">
                <div className="text-amber-300 font-bold flex items-center space-x-1">
                  <span>🌏</span> <span>Phương Xa</span>
                </div>
                <div className="text-slate-100 font-semibold mt-0.5 text-xs">~2 bạn bè</div>
                <div className="text-[10px] text-purple-300 mt-0.5 flex items-center gap-1 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-300 inline-block" />
                  Hướng về K8A1
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ======================================================== */}
        {/* 🌟 KHỐI 2: DUAL COLUMN BENTO (VIDEO/ẢNH MINH HỌA + GOOGLE MAPS) */}
        {/* ======================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 relative z-10 items-stretch">
          
          {/* ========================================== */}
          {/* 🎬 CỘT A: VIDEO & ẢNH MINH HỌA NHÀ HÀNG */}
          {/* ========================================== */}
          <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200/90 p-4 shadow-sm flex flex-col justify-between space-y-3.5">
            
            {/* Media Header */}
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                  {parsedCurrentMedia.type === 'image' ? (
                    <ImageIcon className="w-3.5 h-3.5" />
                  ) : (
                    <Video className="w-3.5 h-3.5" />
                  )}
                </div>
                <div>
                  <h4 className="font-serif font-bold text-xs sm:text-sm text-slate-800 line-clamp-1">
                    {currentMedia.title}
                  </h4>
                </div>
              </div>

              {/* Nút cấu hình theo vai trò BLL / Admin */}
              {isAuthorized ? (
                <button
                  type="button"
                  onClick={() => onOpenAdminHub ? onOpenAdminHub() : setIsEditMediaModalOpen(true)}
                  className="text-[11px] font-sans font-bold text-amber-800 hover:text-amber-950 flex items-center gap-1 bg-amber-50 hover:bg-amber-100 px-2 py-0.5 rounded border border-amber-300/80 cursor-pointer shadow-2xs"
                  title="Dành cho Ban Liên Lạc & Admin: Đổi video hoặc ảnh không gian nhà hàng"
                >
                  <Edit3 className="w-3 h-3 text-amber-700" />
                  <span>Cấu Hình BLL</span>
                </button>
              ) : null}
            </div>

            {/* 🌟 TRÌNH PHÁT ĐA ĐỊNH DẠNG (FACEBOOK REEL/VIDEO, YOUTUBE, DRIVE, MP4, ẢNH) */}
            <div className="relative rounded-xl overflow-hidden bg-slate-950 border-2 border-amber-300/40 shadow-inner aspect-video flex items-center justify-center">
              
              {/* 1. Facebook Reel / Video Embed */}
              {parsedCurrentMedia.type === 'facebook' && (
                <div className="w-full h-full relative flex items-center justify-center bg-black">
                  <iframe
                    title={currentMedia.title}
                    src={parsedCurrentMedia.embedUrl}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    loading="lazy"
                  />

                  {/* Nút hành động mở trực tiếp trên Facebook (giải quyết 100% nếu trình duyệt chặn iframe) */}
                  <div className="absolute top-2.5 right-2.5 z-20">
                    <a
                      href={parsedCurrentMedia.rawUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#1877F2] hover:bg-[#166fe5] text-white text-[10px] font-sans font-bold rounded-lg shadow-md transition transform hover:scale-105"
                      title="Mở xem video trên ứng dụng / web Facebook"
                    >
                      <span>{parsedCurrentMedia.isReel ? 'Mở Reel Facebook' : 'Mở Facebook'}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
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

              {/* 3. Google Drive Video Embed */}
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
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2.5">
                    <p className="text-white text-xs font-serif italic">
                      {currentMedia.desc || 'Không gian sảnh tiệc họp lớp Crown Palace'}
                    </p>
                  </div>
                </div>
              )}

              {/* Fallback khi trống */}
              {parsedCurrentMedia.type === 'empty' && (
                <div className="text-center p-6 text-slate-400 space-y-2">
                  <Video className="w-8 h-8 text-slate-500 mx-auto animate-pulse" />
                  <p className="text-xs font-serif">Chưa có video hoặc ảnh minh họa.</p>
                </div>
              )}
            </div>

            {/* Playlist Thumbnails chuyển đổi góc nhìn */}
            {mediaList.length > 1 && (
              <div className="grid grid-cols-4 gap-2 pt-0.5">
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
                          ? 'border-amber-500 ring-2 ring-amber-400/40 shadow-xs scale-102'
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
                          <Play className={`w-3 h-3 ${isActive ? 'text-amber-300 fill-amber-300' : 'text-white'}`} />
                        ) : (
                          <ImageIcon className={`w-3 h-3 ${isActive ? 'text-amber-300' : 'text-white'}`} />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

          </div>

          {/* ========================================== */}
          {/* 🗺️ CỘT B: BẢN ĐỒ GOOGLE MAPS */}
          {/* ========================================== */}
          <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200/90 p-4 shadow-sm flex flex-col justify-between space-y-3.5">
            
            {/* Map Header */}
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                  <MapPin className="w-3.5 h-3.5 text-amber-700" />
                </div>
                <div>
                  <h4 className="font-serif font-bold text-xs sm:text-sm text-slate-800 line-clamp-1">
                    {VENUE_DETAILS.name}
                  </h4>
                </div>
              </div>

              <span className="text-[10px] font-sans font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                08:30 Sáng 27/09
              </span>
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
            </div>

            {/* Thông tin địa chỉ & Nút Chỉ Đường */}
            <div className="space-y-2 text-xs text-slate-700 font-sans">
              <div className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
                <MapPin className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                <span className="text-slate-600 font-serif leading-snug">{VENUE_DETAILS.address}</span>
              </div>

              <a
                href={VENUE_DETAILS.directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 bg-[#1E293B] hover:bg-slate-800 text-white rounded-xl text-xs font-sans font-bold uppercase tracking-wider shadow-sm transition cursor-pointer"
              >
                <Navigation className="w-3.5 h-3.5 text-amber-300" />
                <span>Mở Lộ Trình Chỉ Đường (Google Maps)</span>
              </a>
            </div>

          </div>

        </div>

      </div>

      {/* ======================================================== */}
      {/* ✏️ MODAL TÙY CHỈNH DÀNH RIÊNG CHO BLL / ADMIN */}
      {/* ======================================================== */}
      {isEditMediaModalOpen && isAuthorized && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-amber-200 relative text-left space-y-4">
            
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

            <div className="space-y-1 border-b border-slate-200 pb-2.5">
              <div className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 uppercase tracking-wider">
                <Shield className="w-3.5 h-3.5 text-amber-600" />
                <span>Cấu Hình Ban Liên Lạc • Không Gian Nhà Hàng</span>
              </div>
              <h3 className="font-serif font-bold text-lg text-[#1E293B]">
                Thêm / Đổi Video & Ảnh Crown Palace
              </h3>
              <p className="text-xs text-slate-500 font-serif italic">
                Hỗ trợ dán link <strong>Facebook Reel, Facebook Video, YouTube, Google Drive, MP4</strong> hoặc tải ảnh trực tiếp từ thiết bị.
              </p>
            </div>

            {editSuccessMsg && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{editSuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleAddMediaSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Đường dẫn Video / Ảnh: <span className="text-rose-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Dán link Facebook Reel, YouTube, Drive, MP4 hoặc ảnh..."
                    value={newMediaUrl}
                    onChange={(e) => setNewMediaUrl(e.target.value)}
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-amber-500 text-slate-800 font-mono text-xs"
                  />
                  
                  <label className="px-3 py-2 bg-slate-800 hover:bg-slate-900 text-amber-200 font-bold rounded-xl cursor-pointer transition flex items-center gap-1 shrink-0">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Tải Ảnh</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Tiêu đề video / ảnh (Tùy chọn):
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Video Facebook Reel Không Gian Crown Palace"
                  value={newMediaTitle}
                  onChange={(e) => setNewMediaTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-amber-500 text-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Mô tả ngắn (Tùy chọn):
                </label>
                <textarea
                  rows={2}
                  placeholder="Mô tả về sảnh tiệc, bàn tiệc..."
                  value={newMediaDesc}
                  onChange={(e) => setNewMediaDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-amber-500 text-slate-800"
                />
              </div>

              <div className="pt-2 flex items-center justify-between gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={handleResetDefaultMedia}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer transition"
                >
                  Mặc Định
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditMediaModalOpen(false)}
                    className="px-3 py-1.5 bg-white border border-slate-300 text-slate-600 rounded-xl hover:bg-slate-50 cursor-pointer"
                  >
                    Đóng
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-md cursor-pointer transition"
                  >
                    Lưu Lại
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
