import React, { useState, useMemo } from 'react';
import {
  MapPin,
  Navigation,
  Copy,
  Check,
  Play,
  Video,
  Image as ImageIcon,
  Edit3,
  X,
  ExternalLink,
  Shield,
  Upload
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
    
    // Clean query parameters to avoid iframe load errors
    let canonical = cleanUrl.split('?')[0].replace(/\/+$/, '');
    const reelMatch = cleanUrl.match(/(?:reel|reels)\/(\d+)/i);
    const videoMatch = cleanUrl.match(/(?:videos|v)\/(\d+)/i) || cleanUrl.match(/[?&]v=(\d+)/i);
    
    if (reelMatch && reelMatch[1]) {
      canonical = `https://www.facebook.com/reel/${reelMatch[1]}/`;
    } else if (videoMatch && videoMatch[1]) {
      canonical = `https://www.facebook.com/watch/?v=${videoMatch[1]}`;
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

  // 3. Google Drive Video / Image Preview
  const driveMatch = cleanUrl.match(/drive\.google\.com\/(?:file\/d\/|open\?id=)([a-zA-Z0-9_-]+)/i);
  if (driveMatch && driveMatch[1]) {
    return {
      type: 'drive',
      embedUrl: `https://drive.google.com/file/d/${driveMatch[1]}/preview`,
      rawUrl: cleanUrl,
      canonicalUrl: cleanUrl,
      driveId: driveMatch[1],
      label: 'Google Drive'
    };
  }

  // 4. Direct Video file (.mp4 / .webm / .mov)
  if (/\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(cleanUrl)) {
    return {
      type: 'direct_video',
      embedUrl: cleanUrl,
      rawUrl: cleanUrl,
      canonicalUrl: cleanUrl,
      label: 'Video Trực Tiếp'
    };
  }

  // 5. Image URLs (jpg, jpeg, png, webp, svg, data:image, unsplash)
  if (
    cleanUrl.startsWith('data:image/') ||
    /\.(jpg|jpeg|png|webp|gif|svg)(\?.*)?$/i.test(cleanUrl) ||
    cleanUrl.includes('images.unsplash.com') ||
    cleanUrl.includes('googleusercontent.com')
  ) {
    return {
      type: 'image',
      embedUrl: cleanUrl,
      rawUrl: cleanUrl,
      canonicalUrl: cleanUrl,
      label: 'Ảnh Kỷ Niệm'
    };
  }

  // Default fallback: Try Facebook Reel/Video if URL pattern looks like social media or treat as image
  return {
    type: 'image',
    embedUrl: cleanUrl,
    rawUrl: cleanUrl,
    canonicalUrl: cleanUrl,
    label: 'Liên Kết'
  };
}

// ============================================================================
// STREAMLINED ALUMNI CONVERGENCE MAP & VENUE SHOWCASE COMPONENT
// ============================================================================
interface Props {
  className?: string;
  eventConfig?: EventConfig;
  venueMediaList?: VenueMediaItem[];
  onUpdateVenueMediaList?: (list: VenueMediaItem[]) => void;
  currentUserRole?: UserRole;
  onOpenAdminHub?: (tab?: 'members' | 'fund' | 'wishes' | 'media' | 'settings', subTab?: 'venue' | 'banner' | 'videos' | 'photos') => void;
}

export default function AlumniConvergenceMap({
  className = '',
  eventConfig,
  venueMediaList,
  onUpdateVenueMediaList,
  currentUserRole = 'guest',
  onOpenAdminHub
}: Props) {
  const [copied, setCopied] = useState(false);
  const isAuthorized = currentUserRole === 'admin' || currentUserRole === 'bll';

  // Dynamic venue values from eventConfig
  const venueName = eventConfig?.venueName || VENUE_DETAILS.name;
  const venueAddress = eventConfig?.venueAddress || VENUE_DETAILS.address;
  const mapEmbedUrl = eventConfig?.mapEmbedUrl || VENUE_DETAILS.embedMapUrl;
  const directionsUrl = eventConfig?.mapDirectUrl || VENUE_DETAILS.directionsUrl;
  const eventDateText = eventConfig?.eventDateText || "08:30 Sáng 27/09";

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
        navigator.clipboard.writeText(venueAddress);
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

          {/* Action Buttons: Chỉ Đường & Sao Chép & Cấu Hình */}
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

            <button
              type="button"
              onClick={handleCopyAddress}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-amber-50 text-slate-700 border border-slate-300/90 rounded-xl text-xs font-sans font-bold uppercase tracking-wider transition-all shadow-2xs cursor-pointer"
              title="Sao chép địa chỉ"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
              <span>{copied ? 'Đã Chép' : 'Sao Chép'}</span>
            </button>

            {isAuthorized && (
              <button
                type="button"
                onClick={() => onOpenAdminHub ? onOpenAdminHub('media', 'venue') : setIsEditMediaModalOpen(true)}
                className="inline-flex items-center gap-1 px-2.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-sans font-bold transition cursor-pointer"
                title="Dành cho BLL / Admin: Đổi video hoặc ảnh không gian nhà hàng"
              >
                <Edit3 className="w-3 h-3 text-amber-700" />
                <span className="hidden sm:inline">Đổi Media</span>
              </button>
            )}
          </div>
        </div>

        {/* 🌟 BỐ CỤC 2 CỘT GỌN NHẸ (MEDIA KHÔNG GIAN + BẢN ĐỒ GOOGLE MAPS) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 relative z-10 items-stretch">
          
          {/* ========================================== */}
          {/* 🎬 CỘT A: VIDEO & ẢNH KHÔNG GIAN NHÀ HÀNG */}
          {/* ========================================== */}
          <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200/90 p-3 sm:p-4 shadow-xs flex flex-col justify-between space-y-2.5">
            
            {/* Header Cột Media */}
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
              <div className="flex items-center gap-1.5 min-w-0">
                <div className="w-5 h-5 rounded-md bg-amber-100 text-amber-800 flex items-center justify-center font-bold shrink-0">
                  {parsedCurrentMedia.type === 'image' ? (
                    <ImageIcon className="w-3 h-3 text-amber-700" />
                  ) : (
                    <Video className="w-3 h-3 text-amber-700" />
                  )}
                </div>
                <h4 className="font-serif font-bold text-xs sm:text-sm text-slate-800 truncate" title={currentMedia.title}>
                  {currentMedia.title}
                </h4>
              </div>
              <span className="text-[10px] font-mono text-slate-400 shrink-0">
                {activeMediaIndex + 1}/{mediaList.length}
              </span>
            </div>

            {/* Khung Player 16:9 sắc nét */}
            <div className="relative rounded-xl overflow-hidden bg-slate-950 border border-amber-300/40 shadow-inner aspect-video flex items-center justify-center">
              {/* 1. Facebook Reel / Video */}
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
                  <div className="absolute top-2 right-2 z-20">
                    <a
                      href={parsedCurrentMedia.rawUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#1877F2] hover:bg-[#166fe5] text-white text-[11px] font-sans font-bold rounded-lg shadow-md transition"
                      title="Mở xem video trên Facebook"
                    >
                      <span>{parsedCurrentMedia.isReel ? 'Reel FB' : 'Xem FB'}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              )}

              {/* 2. YouTube Video */}
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

              {/* 3. Google Drive Video */}
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

              {/* 4. Direct HTML5 Video */}
              {parsedCurrentMedia.type === 'direct_video' && (
                <video
                  src={parsedCurrentMedia.embedUrl}
                  controls
                  className="w-full h-full object-cover"
                  poster={currentMedia.thumbnail}
                >
                  Trình duyệt không hỗ trợ xem video.
                </video>
              )}

              {/* 5. Image Showcase */}
              {parsedCurrentMedia.type === 'image' && (
                <div className="w-full h-full relative group">
                  <img
                    src={parsedCurrentMedia.embedUrl}
                    alt={currentMedia.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=80';
                    }}
                  />
                  {currentMedia.desc && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-90 transition-opacity flex items-end p-2.5">
                      <p className="text-white text-[11px] font-serif line-clamp-1">
                        {currentMedia.desc}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Fallback khi trống */}
              {parsedCurrentMedia.type === 'empty' && (
                <div className="text-center p-4 text-slate-400 space-y-1">
                  <Video className="w-6 h-6 text-slate-500 mx-auto" />
                  <p className="text-xs font-serif">Chưa có ảnh/video minh họa.</p>
                </div>
              )}
            </div>

            {/* Playlist Thumbnails gọn nhẹ */}
            {mediaList.length > 1 && (
              <div className="grid grid-cols-4 gap-1.5 pt-0.5">
                {mediaList.map((item, idx) => {
                  const isActive = idx === activeMediaIndex;
                  const parsed = parseVenueMedia(item.url);
                  const isVid = parsed.type !== 'image';

                  return (
                    <div
                      key={item.id || idx}
                      onClick={() => setActiveMediaIndex(idx)}
                      className={`relative rounded-lg overflow-hidden border cursor-pointer transition-all aspect-[4/3] bg-slate-900 ${
                        isActive
                          ? 'border-amber-500 ring-2 ring-amber-400/50 shadow-xs scale-102'
                          : 'border-slate-200 hover:border-amber-400 opacity-70 hover:opacity-100'
                      }`}
                      title={item.title}
                    >
                      <img
                        src={item.thumbnail || (parsed.type === 'image' ? item.url : 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=400&q=80')}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
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
          {/* 🗺️ CỘT B: BẢN ĐỒ GOOGLE MAPS TRỰC TIẾP */}
          {/* ========================================== */}
          <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200/90 p-3 sm:p-4 shadow-xs flex flex-col justify-between space-y-2.5">
            
            {/* Header Cột Bản Đồ */}
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
              <div className="flex items-center gap-1.5 min-w-0">
                <div className="w-5 h-5 rounded-md bg-amber-100 text-amber-800 flex items-center justify-center font-bold shrink-0">
                  <MapPin className="w-3 h-3 text-amber-700" />
                </div>
                <h4 className="font-serif font-bold text-xs sm:text-sm text-slate-800 truncate">
                  Bản Đồ Google Maps
                </h4>
              </div>
              <span className="text-[10px] font-sans font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Chỉ đường trực tiếp
              </span>
            </div>

            {/* Khung Google Maps Embed (16:9) */}
            <div className="relative rounded-xl overflow-hidden border border-amber-300/40 shadow-inner aspect-video bg-[#E5E3DF]">
              <iframe
                title={`Bản đồ Google Maps ${venueName}`}
                src={mapEmbedUrl}
                className="w-full h-full border-0"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Nút Chỉ Đường Google Maps */}
            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 bg-[#1E293B] hover:bg-slate-800 text-white rounded-xl text-xs font-sans font-bold uppercase tracking-wider shadow-sm transition-all cursor-pointer"
            >
              <Navigation className="w-3.5 h-3.5 text-amber-300" />
              <span>Mở Lộ Trình Chỉ Đường (Google Maps)</span>
            </a>

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
