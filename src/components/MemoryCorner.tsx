import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
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
  Folder, 
  CheckCircle2, 
  Loader2, 
  AlertCircle,
  Download,
  LayoutGrid,
  Maximize2,
  Search,
  Filter,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Layers
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { MemoryImage, MemoryVideo } from '../types';
import { K8A1_DRIVE_FOLDER_ID, K8A1_DRIVE_FOLDER_URL } from '../data';

interface MemoryCornerProps {
  appsScriptUrl?: string;
  images: MemoryImage[];
  videos?: MemoryVideo[];
  onAddImage?: (newImage: MemoryImage) => void;
}

// Chuẩn hóa link video YouTube hoặc Google Drive sang Embed URL
export function parseVideoEmbedUrl(url: string): { embedUrl: string; type: 'youtube' | 'drive' | 'direct' } {
  if (!url) return { embedUrl: '', type: 'direct' };

  const ytMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
  if (ytMatch && ytMatch[1]) {
    return {
      embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=0&rel=0`,
      type: 'youtube'
    };
  }

  const driveMatch = url.match(/drive\.google\.com\/(?:file\/d\/|open\?id=)([a-zA-Z0-9_-]+)/i);
  if (driveMatch && driveMatch[1]) {
    return {
      embedUrl: `https://drive.google.com/file/d/${driveMatch[1]}/preview`,
      type: 'drive'
    };
  }

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

type GalleryViewMode = 'stage' | 'polaroid' | 'filmstrip';
type FilterCategory = 'all' | 'class' | 'activity' | 'graduation' | 'uploads';

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

  // Photo Upload Modal State
  const [isPhotoUploadModalOpen, setIsPhotoUploadModalOpen] = useState(false);
  const [uploadPreview, setUploadPreview] = useState<string>('');
  const [uploadCaption, setUploadCaption] = useState<string>('');
  const [uploadDate, setUploadDate] = useState<string>('2006');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string>('');
  const [uploadSuccess, setUploadSuccess] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Gallery Display Mode & Filter State
  const [viewMode, setViewMode] = useState<GalleryViewMode>('stage');
  const [activeFilter, setActiveFilter] = useState<FilterCategory>('all');
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [stageIndex, setStageIndex] = useState<number>(0);
  
  // Display Optimization: Pagination & Visible Item Count
  const INITIAL_VISIBLE_COUNT = 8;
  const [visibleCount, setVisibleCount] = useState<number>(INITIAL_VISIBLE_COUNT);

  // Lightbox State
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const lightboxRef = useRef<HTMLDivElement | null>(null);

  // Likes Counter State
  const [likesMap, setLikesMap] = useState<Record<string, number>>(() => {
    try {
      const local = localStorage.getItem('k8a1_photo_likes');
      return local ? JSON.parse(local) : {};
    } catch {
      return {};
    }
  });

  // Nén ảnh trình duyệt trước khi gửi Google Drive
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const maxDimension = 1600;
          let width = img.width;
          let height = img.height;

          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(e.target?.result as string);
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.85));
        };
        img.onerror = reject;
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Lọc danh sách ảnh theo danh mục & từ khóa tìm kiếm
  const filteredImages = useMemo(() => {
    return images.filter(img => {
      // 1. Keyword search
      if (searchKeyword.trim()) {
        const kw = searchKeyword.toLowerCase();
        const matchCap = img.caption?.toLowerCase().includes(kw);
        const matchDate = img.date?.toLowerCase().includes(kw);
        if (!matchCap && !matchDate) return false;
      }

      // 2. Category filter
      if (activeFilter === 'all') return true;
      if (activeFilter === 'uploads') return !!img.isUserUploaded;

      const text = `${img.caption || ''} ${img.date || ''}`.toLowerCase();
      if (activeFilter === 'class') {
        return text.includes('lớp') || text.includes('học') || text.includes('thầy') || text.includes('cô') || text.includes('bàn') || text.includes('trường') || text.includes('kem');
      }
      if (activeFilter === 'activity') {
        return text.includes('trại') || text.includes('lửa') || text.includes('bóng') || text.includes('hồ') || text.includes('ngoại khóa') || text.includes('hát') || text.includes('đá');
      }
      if (activeFilter === 'graduation') {
        return text.includes('bế giảng') || text.includes('áo trắng') || text.includes('lưu bút') || text.includes('kỷ yếu') || text.includes('tốt nghiệp') || text.includes('chia tay');
      }

      return true;
    });
  }, [images, activeFilter, searchKeyword]);

  // Đếm số lượng theo từng danh mục
  const countsByCategory = useMemo(() => {
    return {
      all: images.length,
      class: images.filter(i => `${i.caption || ''} ${i.date || ''}`.toLowerCase().match(/(lớp|học|thầy|cô|bàn|trường|kem)/)).length,
      activity: images.filter(i => `${i.caption || ''} ${i.date || ''}`.toLowerCase().match(/(trại|lửa|bóng|hồ|ngoại khóa|hát|đá)/)).length,
      graduation: images.filter(i => `${i.caption || ''} ${i.date || ''}`.toLowerCase().match(/(bế giảng|áo trắng|lưu bút|kỷ yếu|tốt nghiệp|chia tay)/)).length,
      uploads: images.filter(i => !!i.isUserUploaded).length,
    };
  }, [images]);

  // Danh sách hiển thị sau khi giới hạn số lượng (Tối ưu performance)
  const displayedImages = useMemo(() => {
    return filteredImages.slice(0, visibleCount);
  }, [filteredImages, visibleCount]);

  const hasMore = visibleCount < filteredImages.length;
  const currentStageImage = filteredImages[stageIndex] || filteredImages[0] || images[0];

  // Reset stage index khi filter thay đổi
  useEffect(() => {
    setStageIndex(0);
    setVisibleCount(INITIAL_VISIBLE_COUNT);
  }, [activeFilter, searchKeyword]);

  // Xử lý nạp thêm ảnh
  const handleLoadMore = () => {
    setVisibleCount(prev => Math.min(prev + 8, filteredImages.length));
  };

  // Thu gọn lại số lượng ảnh
  const handleCollapse = () => {
    setVisibleCount(INITIAL_VISIBLE_COUNT);
    const galleryEl = document.getElementById('photo-gallery-container');
    if (galleryEl) {
      galleryEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Xử lý chọn ảnh upload
  const handlePhotoFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      setUploadError('Kích thước tệp quá lớn! Vui lòng chọn ảnh dưới 15MB.');
      return;
    }

    try {
      setUploadError('');
      const compressed = await compressImage(file);
      setUploadPreview(compressed);
      if (!uploadCaption) {
        setUploadCaption(file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' '));
      }
    } catch (err) {
      setUploadError('Không thể xử lý hình ảnh này. Vui lòng thử bức ảnh khác.');
    }
  };

  // Submit Upload ảnh lên Google Drive
  const handlePhotoUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadPreview) {
      setUploadError('Vui lòng chọn ảnh trước khi tải lên.');
      return;
    }

    setIsUploading(true);
    setUploadError('');
    setUploadSuccess('');

    const finalCaption = uploadCaption.trim() || 'Kỷ niệm lớp K8A1';
    const finalDate = uploadDate.trim() || '2006';

    try {
      if (appsScriptUrl) {
        const response = await fetch(appsScriptUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({
            action: 'upload_photo',
            fileData: uploadPreview,
            caption: finalCaption
          })
        });

        const result = await response.json();

        if (result && result.status === 'success') {
          const newPhoto: MemoryImage = {
            id: result.fileId || `drive-img-${Date.now()}`,
            url: result.data?.url || `https://lh3.googleusercontent.com/d/${result.fileId}=w1600`,
            caption: finalCaption,
            date: finalDate,
            isUserUploaded: true
          };

          if (onAddImage) {
            onAddImage(newPhoto);
          }

          confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
          setUploadSuccess('Tải ảnh lên Google Drive lớp K8A1 thành công! 🎉');
          setTimeout(() => {
            setIsPhotoUploadModalOpen(false);
            setUploadPreview('');
            setUploadCaption('');
            setUploadSuccess('');
          }, 1500);
        } else {
          throw new Error(result?.message || 'Lỗi từ máy chủ Apps Script');
        }
      } else {
        const localPhoto: MemoryImage = {
          id: `local-img-${Date.now()}`,
          url: uploadPreview,
          caption: finalCaption,
          date: finalDate,
          isUserUploaded: true
        };

        if (onAddImage) {
          onAddImage(localPhoto);
        }

        confetti({ particleCount: 40, spread: 50, origin: { y: 0.6 } });
        setUploadSuccess('Đã thêm ảnh vào thư viện kỷ niệm! (Lưu cục bộ) 🎉');
        setTimeout(() => {
          setIsPhotoUploadModalOpen(false);
          setUploadPreview('');
          setUploadCaption('');
          setUploadSuccess('');
        }, 1500);
      }
    } catch (err: any) {
      console.error('Lỗi upload ảnh:', err);
      setUploadError(`Lỗi khi tải ảnh: ${err.message || 'Không thể kết nối Google Drive'}`);
    } finally {
      setIsUploading(false);
    }
  };

  // Submit Video
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
  };

  const handlePrev = useCallback(() => {
    setSelectedImageIndex((prev) => {
      if (prev === null) return null;
      return prev > 0 ? prev - 1 : filteredImages.length - 1;
    });
    setZoomLevel(1);
  }, [filteredImages.length]);

  const handleNext = useCallback(() => {
    setSelectedImageIndex((prev) => {
      if (prev === null) return null;
      return prev < filteredImages.length - 1 ? prev + 1 : 0;
    });
    setZoomLevel(1);
  }, [filteredImages.length]);

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

  const activeVideo = videoList[activeVideoIndex] || videoList[0];
  const currentImage = selectedImageIndex !== null ? filteredImages[selectedImageIndex] : null;

  return (
    <div id="memory-corner-section" className="space-y-12">
      
      {/* ======================================================== */}
      {/* 🎬 KHỐI 1: THƯỚC PHIM NGÀY ẤY (CINEMATIC THEATER SHOWCASE) */}
      {/* ======================================================== */}
      <div className="bg-[#141821] text-white rounded-2xl p-5 sm:p-8 shadow-2xl border-2 border-amber-500/30 relative overflow-hidden space-y-6">
        
        {/* Ambient Warm Cinema Glow */}
        <div className="absolute top-0 right-1/4 w-80 h-80 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Video Header & Add Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-700/80 pb-4 gap-3 relative z-10 text-left">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shadow-inner">
              <Film className="w-4 h-4 text-amber-400 animate-pulse" />
            </div>
            <div>
              <h3 className="font-serif text-lg sm:text-xl font-bold text-amber-100 flex items-center gap-2">
                <span>Thước Phim Ngày Ấy</span>
                <span className="text-[10px] font-sans font-bold bg-amber-950/80 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  {videoList.length} Thước Phim
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

        {/* MÀN HÌNH CHIẾU RẠP CHÍNH */}
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

          <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 gap-2 text-left">
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

        {/* DANH SÁCH CUỘN PLAYLIST VIDEO */}
        {videoList.length > 1 && (
          <div className="space-y-2 pt-2 relative z-10 text-left">
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
                    className={`flex items-center gap-3 p-2.5 rounded-xl border cursor-pointer transition-all duration-200 ${
                      isActive
                        ? 'bg-amber-950/60 border-amber-400 shadow-md ring-1 ring-amber-400/50'
                        : 'bg-slate-900/50 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                    }`}
                  >
                    <div className="w-16 h-11 rounded-lg bg-black shrink-0 relative overflow-hidden flex items-center justify-center border border-slate-700">
                      <Play className={`w-4 h-4 ${isActive ? 'text-amber-400 fill-amber-400' : 'text-slate-400'}`} />
                      <span className="absolute bottom-0.5 right-0.5 text-[8px] font-mono px-1 rounded bg-black/80 text-amber-300">
                        {type === 'youtube' ? 'YT' : 'DRIVE'}
                      </span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className={`text-xs font-serif line-clamp-2 ${isActive ? 'text-amber-200 font-bold' : 'text-slate-300'}`}>
                        {vid.title}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>

      {/* ======================================================== */}
      {/* 📸 KHỐI 2: BẢO TÀNG ẢNH KỶ NIỆM (INTERACTIVE MULTI-VIEW GALLERY) */}
      {/* ======================================================== */}
      <div id="photo-gallery-container" className="bg-[#FAF8F5] rounded-2xl p-5 sm:p-8 shadow-sm border border-amber-200/80 space-y-6">
        
        {/* 🌟 HEADER & NÚT GÓP ẢNH DRIVE */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-amber-300/60 pb-5 gap-4 text-left">
          <div className="space-y-1.5 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold tracking-wider font-sans uppercase">
              <Camera className="w-3.5 h-3.5 text-amber-700" />
              <span>Kho Kỷ Yếu & Ký Ức Học Trò K8A1 ({images.length} Bức Ảnh)</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-serif font-bold text-[#1E293B] tracking-tight">
              Bảo Tàng Ảnh Lớp K8A1
            </h3>
            <p className="text-xs text-slate-500 font-serif italic leading-relaxed">
              Đồng bộ trực tiếp từ Thư mục Google Drive lớp • Chọn phong cách hiển thị yêu thích và nhấp vào ảnh để xem toàn màn hình HD.
            </p>
          </div>

          {/* Action & View Mode Switcher Buttons */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2.5 self-start md:self-auto">
            
            {/* View Mode Tabs */}
            <div className="flex items-center p-1 bg-white rounded-xl border border-amber-300/80 shadow-2xs">
              <button
                type="button"
                onClick={() => setViewMode('stage')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-sans font-bold transition cursor-pointer ${
                  viewMode === 'stage'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-amber-800 hover:bg-amber-50'
                }`}
                title="Sân Khấu Ký Ức (Tiêu điểm + Cuộn phim)"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Tiêu Điểm</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('polaroid')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-sans font-bold transition cursor-pointer ${
                  viewMode === 'polaroid'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-amber-800 hover:bg-amber-50'
                }`}
                title="Sổ Tay Polaroid (Khung ảnh hoài niệm)"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Polaroid</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('filmstrip')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-sans font-bold transition cursor-pointer ${
                  viewMode === 'filmstrip'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-amber-800 hover:bg-amber-50'
                }`}
                title="Dải Phim 35mm (Cuộn ngang nghệ thuật)"
              >
                <Layers className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Dải Phim</span>
              </button>
            </div>

            {/* Upload & Drive Buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsPhotoUploadModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white rounded-lg text-xs font-sans font-bold uppercase tracking-wider shadow-sm transition-all cursor-pointer transform hover:-translate-y-0.5"
              >
                <Upload className="w-3.5 h-3.5 text-amber-200" />
                <span>Góp Ảnh</span>
              </button>

              <a
                href={K8A1_DRIVE_FOLDER_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-3 py-2 bg-white hover:bg-amber-50 text-slate-700 hover:text-amber-900 border border-amber-300/80 rounded-lg text-xs font-sans font-semibold transition cursor-pointer shadow-2xs"
                title={`Mở Thư mục Google Drive (ID: ${K8A1_DRIVE_FOLDER_ID})`}
              >
                <Folder className="w-3.5 h-3.5 text-amber-600" />
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
            </div>

          </div>
        </div>

        {/* 🌟 BỘ LỌC CHỦ ĐỀ & THANH TÌM KIẾM NHANH */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          {/* Category Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none text-left">
            {[
              { id: 'all', label: 'Tất Cả', count: countsByCategory.all },
              { id: 'class', label: '🏫 Góc Lớp', count: countsByCategory.class },
              { id: 'activity', label: '🔥 Hội Trại', count: countsByCategory.activity },
              { id: 'graduation', label: '🌸 Bế Giảng', count: countsByCategory.graduation },
              { id: 'uploads', label: '📸 Bạn Bè Gửi', count: countsByCategory.uploads },
            ].map((tab) => {
              const isActive = activeFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveFilter(tab.id as FilterCategory)}
                  className={`px-3 py-1.5 rounded-full text-xs font-sans font-medium shrink-0 transition flex items-center gap-1.5 cursor-pointer ${
                    isActive
                      ? 'bg-[#1E293B] text-amber-200 shadow-xs border border-slate-700 font-bold'
                      : 'bg-white text-slate-600 border border-slate-200 hover:border-amber-400 hover:bg-amber-50/50'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isActive ? 'bg-amber-400/20 text-amber-300' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Quick Search */}
          <div className="relative w-full sm:w-60">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="Tìm theo chú thích, năm..."
              className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-full text-xs focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-slate-700"
            />
            {searchKeyword && (
              <button
                onClick={() => setSearchKeyword('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Empty State */}
        {filteredImages.length === 0 && (
          <div className="p-10 text-center bg-white rounded-xl border border-dashed border-amber-300 space-y-3">
            <ImageIcon className="w-10 h-10 text-amber-400 mx-auto" />
            <p className="font-serif text-slate-600 text-sm">Không tìm thấy bức ảnh nào phù hợp với bộ lọc hiện tại.</p>
            <button
              onClick={() => { setActiveFilter('all'); setSearchKeyword(''); }}
              className="px-4 py-1.5 bg-amber-600 text-white rounded-lg text-xs font-bold font-sans cursor-pointer hover:bg-amber-700"
            >
              Xem Tất Cả Ảnh Kỷ Niệm
            </button>
          </div>
        )}

        {/* =================================================================== */}
        {/* 🌟 LAYOUT 1: SÂN KHẤU TIÊU ĐIỂM + CUỘN PHIM (SPOTLIGHT STAGE) */}
        {/* =================================================================== */}
        {viewMode === 'stage' && filteredImages.length > 0 && currentStageImage && (
          <div className="space-y-4 pt-1">
            <div className="relative bg-gradient-to-b from-stone-900 to-[#1c1917] rounded-2xl p-3 sm:p-6 shadow-xl border-2 border-amber-500/30 overflow-hidden text-left">
              
              <div className="absolute top-4 right-4 z-20 hidden sm:flex items-center gap-1 px-3 py-1 bg-amber-950/80 backdrop-blur-md rounded-full border border-amber-400/40 text-amber-200 font-mono text-[10px]">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>ẢNH {stageIndex + 1} / {filteredImages.length}</span>
              </div>

              {/* Central Main Stage Display */}
              <div 
                onClick={() => openFullscreen(stageIndex)}
                className="relative aspect-[16/10] sm:aspect-[16/9] max-h-[500px] rounded-xl overflow-hidden bg-black/60 flex items-center justify-center cursor-pointer group shadow-2xl"
              >
                <img
                  src={currentStageImage.url}
                  alt={currentStageImage.caption}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain sm:object-cover group-hover:scale-103 transition-transform duration-700 filter sepia-[0.08]"
                  loading="lazy"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    if (currentStageImage.id && !target.src.includes('thumbnail')) {
                      target.src = `https://drive.google.com/thumbnail?authuser=0&sz=w1200&id=${currentStageImage.id}`;
                    }
                  }}
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-80 group-hover:opacity-95 transition-opacity" />

                {/* Like Button */}
                <button
                  type="button"
                  onClick={(e) => handleLikePhoto(currentStageImage.id, e)}
                  className="absolute top-3 left-3 z-30 bg-black/60 hover:bg-rose-600 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-full border border-white/20 flex items-center gap-1.5 transition-colors shadow"
                >
                  <Heart className="w-4 h-4 text-rose-400 group-hover:text-white fill-rose-400 group-hover:fill-white transition-colors" />
                  <span className="font-mono text-xs font-bold">
                    {likesMap[currentStageImage.id] || 32 + (stageIndex * 5) % 25}
                  </span>
                </button>

                {/* Zoom indicator on hover */}
                <div className="absolute top-3 right-3 sm:top-auto sm:bottom-4 sm:right-4 z-30 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white px-3 py-1.5 rounded-lg text-xs font-sans font-bold flex items-center gap-1.5 opacity-90 transition">
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Phóng To HD</span>
                </div>

                {/* Navigation Arrows */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setStageIndex(prev => prev > 0 ? prev - 1 : filteredImages.length - 1);
                  }}
                  className="absolute left-3 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-full bg-black/60 hover:bg-amber-600 text-white border border-white/20 backdrop-blur-xs transition shadow-lg cursor-pointer"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setStageIndex(prev => prev < filteredImages.length - 1 ? prev + 1 : 0);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-full bg-black/60 hover:bg-amber-600 text-white border border-white/20 backdrop-blur-xs transition shadow-lg cursor-pointer"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>

                {/* Main Caption Card */}
                <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-32 z-20 text-white">
                  <p className="text-[11px] font-mono text-amber-300 font-semibold mb-0.5">
                    {currentStageImage.date || 'Niên khóa 2003 – 2006'}
                  </p>
                  <h4 className="font-serif font-bold text-sm sm:text-lg text-white line-clamp-2 drop-shadow-md">
                    “{currentStageImage.caption}”
                  </h4>
                </div>
              </div>

              {/* Dải Cuộn Thumbnail Phim Nhỏ Dưới Sân Khấu (Interactive Filmstrip) */}
              <div className="pt-3">
                <div className="flex items-center justify-between text-[11px] text-amber-200/70 pb-2 px-1">
                  <span>Dải Phim Kỷ Niệm (Cuộn để chọn nhanh ảnh):</span>
                  <span className="italic font-mono">{stageIndex + 1} / {filteredImages.length}</span>
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
                  {filteredImages.map((img, idx) => {
                    const isSelected = idx === stageIndex;
                    return (
                      <button
                        key={img.id || idx}
                        type="button"
                        onClick={() => setStageIndex(idx)}
                        className={`relative w-20 sm:w-24 aspect-[4/3] rounded-lg overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                          isSelected
                            ? 'border-amber-400 shadow-md ring-2 ring-amber-400/60 scale-105'
                            : 'border-white/20 opacity-60 hover:opacity-100 hover:border-amber-300/80'
                        }`}
                      >
                        <img
                          src={img.url}
                          alt={img.caption}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        {isSelected && (
                          <div className="absolute inset-0 bg-amber-500/15" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* 🌟 LAYOUT 2: SỔ TAY POLAROID KỶ NIỆM (POLAROID ALBUM WITH PROGRESSIVE LOAD) */}
        {/* =================================================================== */}
        {viewMode === 'polaroid' && filteredImages.length > 0 && (
          <div className="space-y-6 pt-1">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              {displayedImages.map((img, index) => {
                const likes = likesMap[img.id] || 26 + (index * 7) % 35;
                const isTiltLeft = index % 4 === 1;
                const isTiltRight = index % 4 === 3;

                return (
                  <div
                    key={img.id || index}
                    onClick={() => openFullscreen(index)}
                    className={`group relative bg-white p-3 pb-4 rounded-xl shadow-md border border-slate-200 hover:shadow-xl hover:border-amber-400/80 transition-all duration-300 cursor-pointer overflow-hidden text-left flex flex-col justify-between ${
                      isTiltLeft ? 'sm:transform sm:-rotate-1 hover:rotate-0' : ''
                    } ${
                      isTiltRight ? 'sm:transform sm:rotate-1 hover:rotate-0' : ''
                    }`}
                  >
                    <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-16 h-5 bg-amber-100/90 border border-amber-300/50 transform rotate-1 z-20 shadow-2xs pointer-events-none" />

                    <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-slate-100 shadow-inner">
                      <img
                        src={img.url}
                        alt={img.caption}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-500 filter sepia-[0.08] group-hover:sepia-0"
                        loading="lazy"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          if (img.id && !target.src.includes('thumbnail')) {
                            target.src = `https://drive.google.com/thumbnail?authuser=0&sz=w600&id=${img.id}`;
                          }
                        }}
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                      <button
                        type="button"
                        onClick={(e) => handleLikePhoto(img.id, e)}
                        className="absolute top-2 right-2 z-20 bg-black/50 hover:bg-rose-600 backdrop-blur-md text-white text-[11px] px-2 py-0.5 rounded-full border border-white/20 flex items-center gap-1 transition-colors shadow"
                      >
                        <Heart className="w-3 h-3 text-rose-400 group-hover:text-white fill-rose-400 group-hover:fill-white" />
                        <span className="font-mono font-bold">{likes}</span>
                      </button>

                      {img.date && (
                        <span className="absolute bottom-2 left-2 z-20 bg-amber-950/80 backdrop-blur-md text-amber-200 text-[9px] font-mono px-1.5 py-0.5 rounded border border-amber-500/30">
                          {img.date}
                        </span>
                      )}
                    </div>

                    <div className="pt-3 px-1 space-y-1">
                      <p className="font-serif italic text-xs text-slate-800 font-semibold line-clamp-2 group-hover:text-amber-900 transition-colors">
                        “{img.caption}”
                      </p>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-sans pt-1 border-t border-slate-100">
                        <span>Lớp K8A1</span>
                        <span className="text-amber-700 font-bold group-hover:underline flex items-center gap-0.5">
                          Xem HD 🔍
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* NÚT TẢI THÊM & THU GỌN ẢNH */}
            <div className="pt-2 flex flex-col items-center justify-center gap-3">
              <div className="text-xs font-sans text-slate-500 font-medium">
                Đang hiển thị <span className="font-bold text-amber-800">{displayedImages.length}</span> trên tổng số <span className="font-bold text-amber-800">{filteredImages.length}</span> bức ảnh kỷ niệm
              </div>

              <div className="flex items-center gap-3 flex-wrap justify-center">
                {hasMore && (
                  <button
                    type="button"
                    onClick={handleLoadMore}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white rounded-full text-xs font-sans font-bold uppercase tracking-wider shadow-md hover:shadow-lg transition-all cursor-pointer transform hover:-translate-y-0.5"
                  >
                    <ChevronDown className="w-4 h-4" />
                    <span>Khám Phá Thêm ({filteredImages.length - visibleCount} ảnh còn lại)</span>
                  </button>
                )}

                {visibleCount > INITIAL_VISIBLE_COUNT && (
                  <button
                    type="button"
                    onClick={handleCollapse}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 rounded-full text-xs font-sans font-bold border border-slate-300 shadow-2xs transition cursor-pointer"
                  >
                    <ChevronUp className="w-3.5 h-3.5 text-slate-500" />
                    <span>Thu Gọn Lại</span>
                  </button>
                )}
              </div>
            </div>

          </div>
        )}

        {/* =================================================================== */}
        {/* 🌟 LAYOUT 3: BĂNG RÔN CUỘN PHIM 35MM (35MM FILMSTRIP CAROUSEL) */}
        {/* =================================================================== */}
        {viewMode === 'filmstrip' && filteredImages.length > 0 && (
          <div className="space-y-4 pt-1">
            <div className="bg-[#18181b] p-4 sm:p-6 rounded-2xl border-2 border-amber-500/40 shadow-xl overflow-hidden relative text-left">
              
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800 text-amber-200">
                <div className="flex items-center gap-2">
                  <Film className="w-4 h-4 text-amber-400" />
                  <span className="font-serif font-bold text-sm">Cuộn Phim Nhựa 35mm Thanh Xuân K8A1</span>
                </div>
                <span className="text-[10px] font-mono text-zinc-400">Trượt ngang để xem toàn bộ cuộn phim</span>
              </div>

              <div className="relative py-4">
                <div className="flex gap-2.5 pb-2 overflow-hidden opacity-40">
                  {Array.from({ length: 40 }).map((_, i) => (
                    <div key={i} className="w-3 h-2 bg-zinc-400 rounded-2xs shrink-0" />
                  ))}
                </div>

                <div className="flex gap-4 overflow-x-auto py-2 scrollbar-thin scroll-smooth">
                  {filteredImages.map((img, idx) => (
                    <div
                      key={img.id || idx}
                      onClick={() => openFullscreen(idx)}
                      className="group relative w-64 sm:w-80 shrink-0 bg-zinc-900 rounded-lg p-2 border border-zinc-700 hover:border-amber-400 transition-all cursor-pointer shadow-lg hover:scale-102"
                    >
                      <div className="relative aspect-[16/10] rounded overflow-hidden bg-black">
                        <img
                          src={img.url}
                          alt={img.caption}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-70 group-hover:opacity-90" />
                        
                        <span className="absolute top-2 left-2 text-[9px] font-mono bg-black/70 text-amber-300 px-1.5 py-0.5 rounded border border-white/20">
                          #{idx + 1}
                        </span>

                        <div className="absolute bottom-2 left-2 right-2 text-white">
                          <p className="font-serif text-xs font-bold line-clamp-1">{img.caption}</p>
                          <p className="text-[9px] text-zinc-400 font-mono">{img.date || '2003 – 2006'}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2.5 pt-2 overflow-hidden opacity-40">
                  {Array.from({ length: 40 }).map((_, i) => (
                    <div key={i} className="w-3 h-2 bg-zinc-400 rounded-2xs shrink-0" />
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* 🌟 Ô KHUYẾN KHÍCH GÓP THÊM ẢNH DRIVE */}
        <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100/60 p-5 sm:p-6 rounded-xl border-2 border-dashed border-amber-400/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left shadow-2xs">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-full bg-amber-200 text-amber-900 flex items-center justify-center shrink-0 shadow-inner">
              <Camera className="w-5 h-5 text-amber-800" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-sm sm:text-base text-amber-950">
                Bạn Còn Giữ Những Bức Ảnh Kỷ Niệm Xưa?
              </h4>
              <p className="text-xs text-slate-600 font-serif italic">
                Mỗi bức ảnh cũ là một mảnh ghép thanh xuân vô giá được lưu trữ tại Thư mục Google Drive của lớp.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setIsPhotoUploadModalOpen(true)}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-sans font-bold uppercase tracking-wider rounded-lg shadow-md transition cursor-pointer inline-flex items-center gap-1.5"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Tải Ảnh Lên</span>
            </button>

            <a
              href={K8A1_DRIVE_FOLDER_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 bg-white hover:bg-amber-50 text-slate-700 border border-amber-300 text-xs font-sans font-bold rounded-lg shadow-2xs transition cursor-pointer inline-flex items-center gap-1.5"
            >
              <Folder className="w-3.5 h-3.5 text-amber-600" />
              <span>Drive Lớp</span>
            </a>
          </div>
        </div>

      </div>

      {/* ======================================================== */}
      {/* 📸 MODAL TẢI ẢNH LÊN GOOGLE DRIVE */}
      {/* ======================================================== */}
      {isPhotoUploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-amber-200 relative text-left space-y-5">
            
            <button
              type="button"
              onClick={() => {
                setIsPhotoUploadModalOpen(false);
                setUploadPreview('');
                setUploadError('');
                setUploadSuccess('');
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1 border-b border-slate-200 pb-3">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Đóng Góp Ảnh Kỷ Niệm K8A1</span>
              </div>
              <h3 className="font-serif font-bold text-xl text-[#1E293B]">
                Tải Ảnh Lên Google Drive Lớp
              </h3>
              <p className="text-xs text-slate-500 font-serif italic">
                Ảnh sẽ được tự động lưu trữ an toàn trong Thư mục Drive K8A1 (ID: <code className="font-mono text-[10px] bg-slate-100 px-1 py-0.5 rounded">{K8A1_DRIVE_FOLDER_ID.slice(0, 10)}...</code>)
              </p>
            </div>

            {uploadError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            {uploadSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{uploadSuccess}</span>
              </div>
            )}

            <form onSubmit={handlePhotoUploadSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Chọn ảnh từ máy tính / điện thoại: <span className="text-rose-500">*</span>
                </label>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoFileSelect}
                  className="hidden"
                  id="photo-file-upload-input"
                />

                {uploadPreview ? (
                  <div className="relative rounded-xl overflow-hidden border-2 border-amber-400 bg-slate-900 group aspect-[16/10] flex items-center justify-center">
                    <img
                      src={uploadPreview}
                      alt="Ảnh xem trước"
                      className="max-h-full max-w-full object-contain"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1.5 bg-white text-slate-800 rounded-lg text-xs font-bold hover:bg-amber-50 cursor-pointer shadow"
                      >
                        Đổi ảnh khác
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-300 hover:border-amber-500 bg-slate-50 hover:bg-amber-50/40 rounded-xl p-6 text-center cursor-pointer transition-colors space-y-2"
                  >
                    <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 mx-auto flex items-center justify-center">
                      <Upload className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-700 text-xs">Bấm vào đây để chọn ảnh</p>
                      <p className="text-[11px] text-slate-400 font-sans">Hỗ trợ JPG, PNG, WEBP (Tự động tối ưu chất lượng HD)</p>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Chú thích / Tiêu đề bức ảnh: <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={uploadCaption}
                  onChange={(e) => setUploadCaption(e.target.value)}
                  placeholder="VD: Lễ bế giảng năm 2006, Chuyến dã ngoại Hồ Núi Cốc..."
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-slate-50 text-xs font-serif"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Thời gian / Niên khóa:
                </label>
                <input
                  type="text"
                  value={uploadDate}
                  onChange={(e) => setUploadDate(e.target.value)}
                  placeholder="VD: 2003, 2004, 2005, 2006, hoặc Hội khóa 10 năm..."
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-slate-50 text-xs font-serif"
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <a
                  href={K8A1_DRIVE_FOLDER_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-700 hover:underline text-[11px] font-sans flex items-center gap-1"
                >
                  <Folder className="w-3.5 h-3.5" />
                  <span>Mở Google Drive</span>
                </a>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsPhotoUploadModalOpen(false)}
                    disabled={isUploading}
                    className="px-4 py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-sans font-semibold cursor-pointer disabled:opacity-50"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={isUploading || !uploadPreview}
                    className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-sans font-bold uppercase tracking-wider shadow-md transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Đang Tải Lên...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        <span>Lưu Vào Drive Lớp</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>

          </div>
        </div>
      )}

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
                  * Hỗ trợ mọi định dạng link YouTube (watch, youtu.be, shorts) và link chia sẻ từ Google Drive.
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
      {/* 🖼️ FULLSCREEN PHOTO LIGHTBOX MODAL WITH ZOOM & FILMSTRIP */}
      {/* ======================================================== */}
      {currentImage && (
        <div
          ref={lightboxRef}
          id="photo-lightbox-modal"
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between select-none"
        >
          {/* Top Bar */}
          <div className="p-4 md:px-6 bg-black/70 border-b border-white/10 flex items-center justify-between z-20">
            <div className="flex items-center gap-3 text-white">
              <span className="text-[11px] font-sans uppercase tracking-[0.15em] text-amber-400 font-bold">
                ẢNH {selectedImageIndex! + 1} / {filteredImages.length}
              </span>
              <span className="hidden sm:inline-block text-white/30 text-xs">|</span>
              <span className="hidden sm:inline-block text-xs font-serif text-white/80 truncate max-w-[320px]">
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
                download
                className="p-2 rounded text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer inline-flex items-center"
                title="Mở ảnh gốc trong tab mới / Tải về"
              >
                <Download className="w-4 h-4" />
              </a>

              <a
                href={K8A1_DRIVE_FOLDER_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer inline-flex items-center"
                title="Mở thư mục Google Drive của lớp"
              >
                <Folder className="w-4 h-4 text-amber-400" />
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
              className="max-w-full max-h-[70vh] flex items-center justify-center transition-transform duration-200 ease-out cursor-zoom-in"
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
                className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-2xl border border-white/10 select-none"
                referrerPolicy="no-referrer"
                draggable={false}
              />
            </div>
          </div>

          {/* Bottom Info Bar with mini thumbnail navigator */}
          <div className="p-3 md:px-8 bg-black/80 border-t border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-3 text-white z-20">
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

            {/* Thumbnail Navigator */}
            <div className="hidden lg:flex items-center gap-1.5 overflow-x-auto max-w-md py-1">
              {filteredImages.map((tImg, tIdx) => (
                <button
                  key={tImg.id || tIdx}
                  type="button"
                  onClick={() => {
                    setSelectedImageIndex(tIdx);
                    setZoomLevel(1);
                  }}
                  className={`w-10 h-8 rounded overflow-hidden shrink-0 border transition ${
                    tIdx === selectedImageIndex ? 'border-amber-400 scale-110' : 'border-white/20 opacity-50 hover:opacity-100'
                  }`}
                >
                  <img src={tImg.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
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
