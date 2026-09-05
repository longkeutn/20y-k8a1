import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Camera, 
  Image as ImageIcon, 
  Video, 
  Play,
  PlusCircle,
  Heart,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  X,
  ExternalLink,
  Sparkles,
  Film,
  Upload,
  Link as LinkIcon,
  Maximize2,
  Minimize2,
  Share2
} from 'lucide-react';
import { MemoryImage, MemoryVideo } from '../types';

interface MemoryCornerProps {
  appsScriptUrl?: string;
  images: MemoryImage[];
  videos?: MemoryVideo[];
  onAddImage?: (newImage: MemoryImage) => void;
}

// Hàm chuẩn hóa link video YouTube hoặc Google Drive sang link nhúng (Embed URL)
export function parseVideoEmbedUrl(url: string): { embedUrl: string; type: 'youtube' | 'drive' | 'direct' } {
  if (!url) return { embedUrl: '', type: 'direct' };

  // 1. YouTube link
  const ytMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
  if (ytMatch && ytMatch[1]) {
    return {
      embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=0&rel=0`,
      type: 'youtube'
    };
  }

  // 2. Google Drive link (file/d/ID hoặc open?id=ID)
  const driveMatch = url.match(/drive\.google\.com\/(?:file\/d\/|open\?id=)([a-zA-Z0-9_-]+)/i);
  if (driveMatch && driveMatch[1]) {
    return {
      embedUrl: `https://drive.google.com/file/d/${driveMatch[1]}/preview`,
      type: 'drive'
    };
  }

  // 3. Fallback direct or already embed link
  return {
    embedUrl: url,
    type: 'direct'
  };
}

const INITIAL_VIDEOS: MemoryVideo[] = [
  {
    id: 'vid-1',
    title: 'Phóng Sự Kỷ Niệm: 20 Năm Ngày Trở Về — Lớp K8A1',
    embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    thumbnail: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'vid-2',
    title: 'Giai Điệu Thanh Xuân: Mong Ước Kỷ Niệm Xưa (Niên Khóa 2003 — 2006)',
    embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    thumbnail: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'vid-3',
    title: 'Hội Trại 26/3 & Những Tiếng Hát Dưới Tán Cây Bàng Sân Trường',
    embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    thumbnail: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=600&q=80'
  }
];

export default function MemoryCorner({ appsScriptUrl, images, videos = INITIAL_VIDEOS, onAddImage }: MemoryCornerProps) {
  // Video State
  const [videoList, setVideoList] = useState<MemoryVideo[]>(() => {
    try {
      const local = localStorage.getItem('k8a1_video_list');
      if (local) {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return videos.length > 0 ? videos : INITIAL_VIDEOS;
  });

  const [activeVideoIndex, setActiveVideoIndex] = useState<number>(0);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const [newVideoTitle, setNewVideoTitle] = useState('');

  // Photo Gallery State
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'lop-hoc' | 'hoat-dong' | 'be-giang'>('all');
  const [likesMap, setLikesMap] = useState<Record<string, number>>(() => {
    try {
      const local = localStorage.getItem('k8a1_photo_likes');
      return local ? JSON.parse(local) : {};
    } catch {
      return {};
    }
  });

  // Lightbox Zoom & Controls
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isNativeFullscreen, setIsNativeFullscreen] = useState(false);
  const lightboxRef = useRef<HTMLDivElement | null>(null);

  const activeVideo = videoList[activeVideoIndex] || videoList[0];
  const currentImage = selectedImageIndex !== null ? images[selectedImageIndex] : null;

  // Xử lý thêm Video mới (YouTube / Google Drive)
  const handleAddVideoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVideoUrl.trim()) return;

    const { embedUrl } = parseVideoEmbedUrl(newVideoUrl.trim());
    const newVideo: MemoryVideo = {
      id: `vid-${Date.now()}`,
      title: newVideoTitle.trim() || `Thước phim kỷ niệm #${videoList.length + 1}`,
      embedUrl
    };

    const updated = [newVideo, ...videoList];
    setVideoList(updated);
    localStorage.setItem('k8a1_video_list', JSON.stringify(updated));
    setActiveVideoIndex(0);
    setNewVideoUrl('');
    setNewVideoTitle('');
    setIsVideoModalOpen(false);
  };

  // Thả tim ảnh
  const handleLikePhoto = (imgId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const currentLikes = likesMap[imgId] || 25;
    const updated = { ...likesMap, [imgId]: currentLikes + 1 };
    setLikesMap(updated);
    localStorage.setItem('k8a1_photo_likes', JSON.stringify(updated));
  };

  // Lightbox Handlers
  const openFullscreen = (index: number) => {
    setSelectedImageIndex(index);
    setZoomLevel(1);
  };

  const closeFullscreen = () => {
    setSelectedImageIndex(null);
    setZoomLevel(1);
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
  };

  const handlePrev = useCallback(() => {
    setSelectedImageIndex((prev) => {
      if (prev === null) return null;
      return prev > 0 ? prev - 1 : images.length - 1;
    });
    setZoomLevel(1);
  }, [images.length]);

  const handleNext = useCallback(() => {
    setSelectedImageIndex((prev) => {
      if (prev === null) return null;
      return prev < images.length - 1 ? prev + 1 : 0;
    });
    setZoomLevel(1);
  }, [images.length]);

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(Number((prev + 0.3).toFixed(1)), 3));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(Number((prev - 0.3).toFixed(1)), 1));
  const handleResetZoom = () => setZoomLevel(1);

  // Keyboard navigation
  useEffect(() => {
    if (selectedImageIndex === null) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeFullscreen();
      else if (e.key === 'ArrowLeft') handlePrev();
      else if (e.key === 'ArrowRight') handleNext();
      else if (e.key === '+' || e.key === '=') handleZoomIn();
      else if (e.key === '-') handleZoomOut();
      else if (e.key === '0') handleResetZoom();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImageIndex, handlePrev, handleNext]);

  return (
    <div id="memory-corner-section" className="space-y-12">
      
      {/* ======================================================== */}
      {/* 🎬 KHỐI 1: THƯỚC PHIM NGÀY ẤY (CINEMATIC THEATER SHOWCASE) */}
      {/* ======================================================== */}
      <div className="bg-[#1A1613] text-white rounded-2xl p-5 sm:p-8 shadow-2xl border-2 border-amber-500/30 relative overflow-hidden space-y-6">
        
        {/* Ambient Warm Cinema Glow */}
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Video Header & Add Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-700/80 pb-4 gap-3 relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shadow-inner">
              <Film className="w-4 h-4 text-amber-400 animate-pulse" />
            </div>
            <div>
              <h3 className="font-serif text-lg sm:text-xl font-bold text-amber-100 flex items-center gap-2">
                <span>Thước Phim Ngày Ấy</span>
                <span className="text-[10px] font-sans font-bold bg-amber-950/80 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  {videoList.length} Video
                </span>
              </h3>
              <p className="text-xs text-slate-400 font-serif italic">
                Xem lại những khoảnh khắc sống động của K8A1 qua YouTube & Google Drive
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsVideoModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white text-xs font-sans font-bold uppercase tracking-wider shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 cursor-pointer self-start sm:self-auto"
          >
            <PlusCircle className="w-3.5 h-3.5 text-amber-200" />
            <span>Chèn Link Video</span>
          </button>
        </div>

        {/* 🌟 MÀN HÌNH CHIẾU RẠP CHÍNH (THEATER SPOTLIGHT) */}
        <div className="space-y-3 relative z-10">
          <div className="relative overflow-hidden rounded-xl bg-black border-2 border-amber-400/40 shadow-2xl aspect-video">
            {activeVideo && activeVideo.embedUrl ? (
              <iframe
                title={activeVideo.title}
                src={activeVideo.embedUrl}
                width="100%"
                height="100%"
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                loading="lazy"
              ></iframe>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 space-y-2">
                <Video className="w-12 h-12 text-slate-600 animate-pulse" />
                <p className="text-xs font-serif">Chưa có video nào. Bấm nút "Chèn Link Video" để thêm video YouTube/Drive.</p>
              </div>
            )}
          </div>

          {/* Tiêu đề & Thông tin Video đang chiếu */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 gap-2">
            <div className="space-y-0.5">
              <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest block">
                ● ĐANG CHIẾU TRÊN MÀN ẢNH
              </span>
              <h4 className="font-serif font-bold text-sm sm:text-base text-white">
                {activeVideo?.title}
              </h4>
            </div>
            <span className="text-[11px] text-slate-400 font-sans italic self-start sm:self-auto">
              Hỗ trợ link YouTube & Google Drive
            </span>
          </div>
        </div>

        {/* 🎞️ DANH SÁCH CUỘN PLAYLIST VIDEO (BENTO VIDEO THUMBNAILS) */}
        {videoList.length > 1 && (
          <div className="space-y-2 pt-2 relative z-10">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-sans uppercase font-bold tracking-wider text-[11px] text-amber-200/80">
                Danh Sách Thước Phim Kỷ Niệm:
              </span>
              <span className="text-[10px] italic">Bấm vào video để chuyển màn ảnh</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {videoList.map((vid, idx) => {
                const isActive = idx === activeVideoIndex;
                const { type } = parseVideoEmbedUrl(vid.embedUrl);

                return (
                  <div
                    key={vid.id || idx}
                    onClick={() => setActiveVideoIndex(idx)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center gap-3 relative group overflow-hidden ${
                      isActive 
                        ? 'bg-gradient-to-r from-amber-950/80 to-slate-900 border-amber-400 shadow-md ring-1 ring-amber-400/50' 
                        : 'bg-slate-900/60 border-slate-800 hover:border-amber-500/50 hover:bg-slate-800/80'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-lg bg-black/60 border border-slate-700 flex items-center justify-center text-amber-400 shrink-0 group-hover:scale-105 transition-transform">
                      {isActive ? (
                        <div className="w-2.5 h-2.5 bg-amber-400 rounded-full animate-ping" />
                      ) : (
                        <Play className="w-4 h-4 fill-amber-400 text-amber-400" />
                      )}
                    </div>
                    
                    <div className="space-y-0.5 overflow-hidden text-left flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold uppercase ${
                          type === 'youtube' ? 'bg-red-950 text-red-300 border border-red-800' : 'bg-blue-950 text-blue-300 border border-blue-800'
                        }`}>
                          {type === 'youtube' ? 'YouTube' : 'Drive'}
                        </span>
                        <span className="text-[10px] text-slate-400">Video #{idx + 1}</span>
                      </div>
                      <h5 className="font-serif text-xs font-semibold text-slate-200 truncate group-hover:text-amber-200 transition-colors">
                        {vid.title}
                      </h5>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>

      {/* ======================================================== */}
      {/* 📸 KHỐI 2: THƯ VIỆN ẢNH LỚP MÌNH (ASYMMETRIC SCRAPBOOK COLLAGE) */}
      {/* ======================================================== */}
      <div className="bg-[#FAF8F5] rounded-2xl p-6 sm:p-8 shadow-sm border border-amber-200/80 space-y-6">
        
        {/* Header Kho Ảnh & Bộ Lọc */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-amber-300/60 pb-4 gap-4 text-left">
          <div className="space-y-1">
            <span className="text-[10px] font-bold tracking-[0.2em] font-sans text-amber-800 uppercase flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5 text-amber-600" />
              <span>Kho Kỷ Yếu & Ký Ức Học Trò</span>
            </span>
            <h3 className="text-2xl sm:text-3xl font-serif font-bold text-[#1E293B]">
              Thư Viện Ảnh Lớp Mình
            </h3>
            <p className="text-xs text-slate-500 font-serif italic">
              Bố cục cuộn Scrapbook sống động — Nhấp vào từng ảnh để phóng to và thả tim ❤️
            </p>
          </div>

          <a
            href="https://drive.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1E293B] hover:bg-amber-600 text-white rounded-lg text-xs font-sans font-bold uppercase tracking-wider shadow-sm transition-all cursor-pointer self-start sm:self-auto"
          >
            <Upload className="w-3.5 h-3.5 text-amber-300" />
            <span>Góp Ảnh Vào Drive Lớp</span>
          </a>
        </div>

        {/* 🌟 BỘ LỌC CHỦ ĐỀ HOÀI NIỆM */}
        <div className="flex flex-wrap gap-2 pt-1">
          {[
            { id: 'all', label: 'Tất Cả Kỷ Niệm' },
            { id: 'lop-hoc', label: '🏫 Góc Lớp Thân Thương' },
            { id: 'hoat-dong', label: '🔥 Hội Trại & Ngoại Khóa' },
            { id: 'be-giang', label: '🌸 Ngày Bế Giảng & Áo Trắng' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-sans font-semibold transition-all cursor-pointer ${
                activeFilter === tab.id
                  ? 'bg-[#1E293B] text-amber-200 shadow-sm border border-slate-700'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-amber-400 hover:bg-amber-50/50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 🌟 BỐ CỤC BENTO / SCRAPBOOK BẤT ĐỐI XỨNG (ASYMMETRIC COLLAGE) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 pt-2">
          
          {images.map((img, index) => {
            // Lọc theo tag nếu có
            const likes = likesMap[img.id] || 28 + (index * 7) % 30;
            const isHeroSpotlight = index === 0;
            const isTiltedLeft = index % 3 === 1;
            const isTiltedRight = index % 3 === 2;

            return (
              <div
                key={img.id || index}
                onClick={() => openFullscreen(index)}
                className={`group relative bg-white p-3 rounded-xl shadow-md border border-slate-200 hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden ${
                  isHeroSpotlight ? 'sm:col-span-2 sm:row-span-2 p-4 bg-gradient-to-br from-[#FFFDF9] to-white border-amber-400/80 shadow-lg' : ''
                } ${
                  isTiltedLeft ? 'sm:transform sm:-rotate-1 hover:rotate-0' : ''
                } ${
                  isTiltedRight ? 'sm:transform sm:rotate-1 hover:rotate-0' : ''
                }`}
              >
                {/* Giả lập băng dính hoài niệm ở ảnh tiêu điểm */}
                {isHeroSpotlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-28 h-6 bg-amber-100/80 backdrop-blur-xs border border-amber-300/40 transform -rotate-2 z-20 shadow-xs pointer-events-none" />
                )}

                {/* Khung chứa ảnh */}
                <div className={`relative overflow-hidden rounded-lg bg-slate-100 ${
                  isHeroSpotlight ? 'aspect-video sm:aspect-[16/10]' : 'aspect-square sm:aspect-[4/3]'
                }`}>
                  <img
                    src={img.url}
                    alt={img.caption}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 filter sepia-[0.15] group-hover:sepia-0"
                    loading="lazy"
                  />

                  {/* Lớp gradient mờ khi hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

                  {/* Nút Thả Tim Góc Trên */}
                  <button
                    type="button"
                    onClick={(e) => handleLikePhoto(img.id, e)}
                    className="absolute top-2.5 right-2.5 z-20 bg-black/50 hover:bg-rose-600 backdrop-blur-md text-white text-xs px-2.5 py-1 rounded-full border border-white/20 flex items-center gap-1.5 transition-colors shadow"
                  >
                    <Heart className="w-3.5 h-3.5 text-rose-400 group-hover:text-white fill-rose-400 group-hover:fill-white transition-colors" />
                    <span className="font-mono text-[11px] font-bold">{likes}</span>
                  </button>

                  {/* Date badge */}
                  {img.date && (
                    <div className="absolute top-2.5 left-2.5 z-20 bg-amber-950/70 backdrop-blur-md text-amber-200 text-[10px] font-mono px-2 py-0.5 rounded border border-amber-500/30">
                      {img.date}
                    </div>
                  )}

                  {/* Chú thích trên ảnh */}
                  <div className="absolute bottom-2.5 left-2.5 right-2.5 z-20 text-white text-left">
                    <p className="font-serif text-xs sm:text-sm font-semibold line-clamp-1 drop-shadow-md">
                      {img.caption}
                    </p>
                  </div>
                </div>

                {/* Chú thích dưới đáy phong cách Polaroid */}
                <div className="pt-2.5 pb-0.5 flex items-center justify-between text-xs text-slate-500 font-serif">
                  <span className="italic truncate max-w-[200px]">“{img.caption}”</span>
                  <span className="text-[10px] font-sans font-bold text-amber-800 uppercase tracking-wider bg-amber-100/60 px-2 py-0.5 rounded">
                    Phóng to 🔍
                  </span>
                </div>
              </div>
            );
          })}

          {/* Ô Khuyến Khích Gửi Thêm Ảnh */}
          <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100/60 p-6 rounded-xl border-2 border-dashed border-amber-400/80 flex flex-col items-center justify-center text-center space-y-3 shadow-xs min-h-[220px]">
            <div className="w-12 h-12 rounded-full bg-amber-200 text-amber-900 flex items-center justify-center shadow-inner">
              <Camera className="w-6 h-6 text-amber-700" />
            </div>
            <div className="space-y-1">
              <h4 className="font-serif font-bold text-sm sm:text-base text-amber-950">
                Bạn Còn Giữ Ảnh Kỷ Niệm?
              </h4>
              <p className="text-xs text-slate-600 font-serif italic max-w-xs">
                Mỗi bức ảnh cũ là một mảnh ghép thanh xuân vô giá của tập thể K8A1.
              </p>
            </div>
            <a
              href="https://drive.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-sans font-bold uppercase tracking-wider rounded-lg shadow-md transition-all cursor-pointer inline-flex items-center gap-1.5"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Tải Ảnh Vào Kho Drive</span>
            </a>
          </div>

        </div>

      </div>

      {/* ======================================================== */}
      {/* 📹 MODAL CHÈN LINK VIDEO (YOUTUBE / DRIVE) */}
      {/* ======================================================== */}
      {isVideoModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative text-left space-y-4">
            
            <button
              type="button"
              onClick={() => setIsVideoModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1 border-b border-slate-200 pb-3">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 uppercase tracking-wider">
                <LinkIcon className="w-3.5 h-3.5" />
                <span>Thêm Video Kỷ Niệm K8A1</span>
              </div>
              <h3 className="font-serif font-bold text-lg text-[#1E293B]">
                Chèn Link Video YouTube / Google Drive
              </h3>
            </div>

            <form onSubmit={handleAddVideoSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Đường dẫn Video (URL): <span className="text-rose-500">*</span>
                </label>
                <input
                  type="url"
                  required
                  value={newVideoUrl}
                  onChange={(e) => setNewVideoUrl(e.target.value)}
                  placeholder="VD: https://youtu.be/... hoặc https://drive.google.com/file/d/.../view"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-slate-50 font-mono text-xs"
                />
                <p className="text-[10px] text-slate-500 mt-1 font-sans italic">
                  * Hỗ trợ mọi định dạng link YouTube (watch, youtu.be, shorts) và link chia sẻ công khai từ Google Drive.
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Tiêu đề thước phim:
                </label>
                <input
                  type="text"
                  value={newVideoTitle}
                  onChange={(e) => setNewVideoTitle(e.target.value)}
                  placeholder="VD: Video kỷ yếu bế giảng năm 2006..."
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-slate-50 text-xs font-serif"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsVideoModalOpen(false)}
                  className="px-4 py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-sans font-semibold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-sans font-bold uppercase tracking-wider shadow-md transition-all cursor-pointer"
                >
                  Lưu & Chiếu Video
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 🖼️ FULLSCREEN PHOTO LIGHTBOX MODAL WITH ZOOM */}
      {/* ======================================================== */}
      {currentImage && (
        <div
          ref={lightboxRef}
          id="photo-lightbox-modal"
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between select-none"
        >
          {/* Top Bar */}
          <div className="p-4 md:px-6 bg-black/60 border-b border-white/10 flex items-center justify-between z-20">
            <div className="flex items-center gap-3 text-white">
              <span className="text-[11px] font-sans uppercase tracking-[0.15em] text-amber-400 font-bold">
                ẢNH {selectedImageIndex! + 1} / {images.length}
              </span>
              <span className="hidden sm:inline-block text-white/30 text-xs">|</span>
              <span className="hidden sm:inline-block text-xs font-serif text-white/80 truncate max-w-[280px]">
                {currentImage.caption}
              </span>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={handleZoomOut}
                disabled={zoomLevel <= 1}
                className="p-2 rounded text-white/80 hover:text-white hover:bg-white/10 disabled:opacity-30 transition-colors cursor-pointer"
                title="Thu nhỏ (-)"
              >
                <ZoomOut className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleResetZoom}
                className="px-2 py-1 rounded text-white/80 hover:text-white hover:bg-white/10 text-[11px] font-mono transition-colors cursor-pointer"
              >
                {Math.round(zoomLevel * 100)}%
              </button>

              <button
                type="button"
                onClick={handleZoomIn}
                disabled={zoomLevel >= 3}
                className="p-2 rounded text-white/80 hover:text-white hover:bg-white/10 disabled:opacity-30 transition-colors cursor-pointer"
                title="Phóng to (+)"
              >
                <ZoomIn className="w-4 h-4" />
              </button>

              <div className="w-px h-4 bg-white/20 mx-1 hidden xs:block" />

              <a
                href={currentImage.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer inline-flex items-center"
                title="Mở ảnh gốc trong tab mới"
              >
                <ExternalLink className="w-4 h-4" />
              </a>

              <button
                type="button"
                onClick={closeFullscreen}
                className="p-2 rounded bg-white/10 text-white hover:bg-rose-600 transition-colors ml-2 cursor-pointer"
                title="Đóng (Esc)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Central Image Stage */}
          <div 
            className="flex-1 relative flex items-center justify-center overflow-hidden p-2 md:p-8"
            onClick={(e) => {
              if (e.target === e.currentTarget) closeFullscreen();
            }}
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-black/50 hover:bg-black/80 text-white/90 hover:text-white border border-white/20 backdrop-blur-xs transition-all shadow-lg cursor-pointer"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-black/50 hover:bg-black/80 text-white/90 hover:text-white border border-white/20 backdrop-blur-xs transition-all shadow-lg cursor-pointer"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            <div 
              className="max-w-full max-h-[75vh] flex items-center justify-center transition-transform duration-200 ease-out cursor-zoom-in"
              style={{
                transform: `scale(${zoomLevel})`,
                cursor: zoomLevel > 1 ? 'grab' : 'zoom-in'
              }}
              onClick={(e) => {
                e.stopPropagation();
                setZoomLevel(zoomLevel === 1 ? 1.8 : 1);
              }}
            >
              <img
                src={currentImage.url}
                alt={currentImage.caption}
                className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-2xl border border-white/10 select-none"
                referrerPolicy="no-referrer"
                draggable={false}
              />
            </div>
          </div>

          {/* Bottom Info Bar */}
          <div className="p-4 md:px-8 bg-black/75 border-t border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-3 text-white z-20">
            <div className="space-y-0.5 text-left">
              <p className="text-sm md:text-base font-serif italic text-white font-medium">
                “{currentImage.caption}”
              </p>
              {currentImage.date && (
                <p className="text-[11px] text-white/60 font-sans">
                  Thời gian: {currentImage.date}
                </p>
              )}
            </div>

            <div className="flex items-center gap-3 text-[10px] text-white/50 font-sans">
              <span className="hidden sm:inline">Phím tắt: ← → chuyển ảnh, +/- phóng to, Esc đóng</span>
              <button
                type="button"
                onClick={closeFullscreen}
                className="px-3 py-1 bg-white/15 hover:bg-white/25 rounded text-white uppercase tracking-wider font-bold cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
