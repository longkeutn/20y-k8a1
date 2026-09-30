import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, Pause, ChevronLeft, ChevronRight, Maximize, Minimize, 
  Volume2, VolumeX, Shield, Sparkles, Folder, Image as ImageIcon,
  Clock, X, Check, Layers, ChevronDown, CheckCircle2,
  Shuffle, LayoutGrid, Search, Film, Tv, Smartphone, QrCode, Copy
} from 'lucide-react';
import { MemoryImage, PhotoAlbum, MusicTrack, SlideTransitionType } from '../types';
import { DEFAULT_PLAYLIST } from '../data';
import { 
  ROTATING_TRANSITIONS, 
  TRANSITION_PRESETS, 
  TransitionConfig, 
  SLIDE_TRANSITION_OPTIONS 
} from './StagePresentationHub';
import { generateSlideshowShortCode } from '../utils/slideshowShortCode';

interface SecureSlideshowViewerProps {
  images: MemoryImage[];
  albums: PhotoAlbum[];
  targetAlbumId?: string;
  targetSubfolder?: string;
  initialSpeed?: number;
  initialMusic?: boolean;
  initialTransition?: SlideTransitionType;
  playlist?: MusicTrack[];
  onExit?: () => void;
}

export const SecureSlideshowViewer: React.FC<SecureSlideshowViewerProps> = ({
  images,
  albums,
  targetAlbumId,
  targetSubfolder,
  initialSpeed = 5000,
  initialMusic = false,
  initialTransition = 'alternate',
  playlist = DEFAULT_PLAYLIST,
  onExit
}) => {
  // 1. Lọc danh sách ảnh theo Album và Folder con chỉ định
  const filteredPhotos = useMemo(() => {
    let result = images.filter(img => img.mediaType !== 'video'); // Mặc định trình chiếu 100% ảnh

    if (targetAlbumId && targetAlbumId !== 'all') {
      const targetId = targetAlbumId.toLowerCase().trim();
      result = result.filter(img => (img.albumId || '').toLowerCase().trim() === targetId);
    }

    if (targetSubfolder && targetSubfolder !== 'all' && targetSubfolder !== '') {
      const cleanTargetSub = targetSubfolder.toLowerCase().trim();
      result = result.filter(img => {
        const sub = (img.subfolderName || '').toLowerCase().trim();
        return sub === cleanTargetSub || sub.includes(cleanTargetSub);
      });
    }

    // Nếu không khớp ảnh nào do sai lệch ID, fallback về toàn bộ ảnh trong album hoặc toàn bộ thư viện
    if (result.length === 0) {
      if (targetAlbumId && targetAlbumId !== 'all') {
        const fallbackAlbum = images.filter(img => (img.albumId || '').toLowerCase() === targetAlbumId.toLowerCase() && img.mediaType !== 'video');
        if (fallbackAlbum.length > 0) return fallbackAlbum;
      }
      return images.filter(img => img.mediaType !== 'video');
    }

    return result;
  }, [images, targetAlbumId, targetSubfolder]);

  // Thông tin tiêu đề hiển thị
  const albumMeta = useMemo(() => {
    const alb = albums.find(a => a.id === targetAlbumId);
    return {
      albumTitle: alb ? alb.title : 'Kho Kỷ Niệm K8A1',
      subfolderTitle: targetSubfolder && targetSubfolder !== 'all' ? targetSubfolder : ''
    };
  }, [albums, targetAlbumId, targetSubfolder]);

  // Trạng thái trình chiếu
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [speed, setSpeed] = useState<number>(initialSpeed);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showControls, setShowControls] = useState<boolean>(true);
  const [shieldNotice, setShieldNotice] = useState<string | null>(null);

  // Hiệu ứng chuyển cảnh & Ken Burns (đồng bộ 100% logic Web & Màn LED)
  const [slideshowTransition, setSlideshowTransition] = useState<SlideTransitionType>(initialTransition || 'alternate');
  const [showTransitionMenu, setShowTransitionMenu] = useState<boolean>(false);
  const [kenBurnsStyle, setKenBurnsStyle] = useState<number>(0);
  const [slideshowProgress, setSlideshowProgress] = useState<number>(0);

  // Chế độ phát ngẫu nhiên (Shuffle) & Danh sách chọn ảnh (Gallery Modal)
  const [isShuffle, setIsShuffle] = useState<boolean>(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState<boolean>(false);
  const [gallerySearch, setGallerySearch] = useState<string>('');
  const playHistoryRef = useRef<number[]>([]);
  const thumbnailRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const thumbnailsScrollRef = useRef<HTMLDivElement | null>(null);

  // Hướng dẫn kết nối Smart TV & Mã QR Code
  const [isTvGuideOpen, setIsTvGuideOpen] = useState<boolean>(false);
  const [isCopiedTvLink, setIsCopiedTvLink] = useState<boolean>(false);

  const tvShortCode = useMemo(() => {
    return generateSlideshowShortCode(targetAlbumId || 'all', targetSubfolder, albums, images);
  }, [targetAlbumId, targetSubfolder, albums, images]);

  const tvShortUrl = useMemo(() => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://k8a1.vercel.app';
    return `${baseUrl}/?s=${tvShortCode}`;
  }, [tvShortCode]);

  const tvQrImageUrl = useMemo(() => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=420x420&data=${encodeURIComponent(
      tvShortUrl
    )}&color=0b1329&bgcolor=ffffff&margin=1`;
  }, [tvShortUrl]);

  // Âm thanh nền
  const [isMusicEnabled, setIsMusicEnabled] = useState<boolean>(initialMusic);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Tham chiếu DOM & Touch Swiping
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);

  // Danh sách ảnh lọc trong Gallery Grid
  const galleryPhotos = useMemo(() => {
    if (!gallerySearch.trim()) return filteredPhotos;
    const q = gallerySearch.toLowerCase().trim();
    return filteredPhotos.filter(p => 
      (p.caption || '').toLowerCase().includes(q) ||
      (p.subfolderName || '').toLowerCase().includes(q) ||
      (p.date || '').toLowerCase().includes(q)
    );
  }, [filteredPhotos, gallerySearch]);

  // Kiểu chuyển động Ken Burns pan & zoom 4 hướng (chuẩn xác 100% như Màn LED & Web)
  const getKenBurnsClass = useCallback(() => {
    switch (kenBurnsStyle) {
      case 0: return 'scale-110 translate-x-3 translate-y-2';
      case 1: return 'scale-115 -translate-x-3 -translate-y-2';
      case 2: return 'scale-110 -translate-x-2 translate-y-3';
      case 3: return 'scale-115 translate-x-2 -translate-y-2';
      default: return 'scale-110';
    }
  }, [kenBurnsStyle]);

  // Cấu hình hiệu ứng chuyển cảnh cho ảnh hiện tại (tự động luân phiên nếu là 'alternate')
  const currentTransitionConfig = useMemo<TransitionConfig>(() => {
    if (slideshowTransition === 'none') {
      return TRANSITION_PRESETS.none;
    }
    if (slideshowTransition === 'alternate') {
      const idx = Math.abs(currentIndex || 0);
      const selectedKey = ROTATING_TRANSITIONS[idx % ROTATING_TRANSITIONS.length];
      return TRANSITION_PRESETS[selectedKey] || TRANSITION_PRESETS.crossfade;
    }
    return TRANSITION_PRESETS[slideshowTransition] || TRANSITION_PRESETS.crossfade;
  }, [slideshowTransition, currentIndex]);

  // Điều khiển ẩn/hiện thanh công cụ sau 4 giây không chạm
  const resetControlsTimer = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying && !isGalleryOpen) {
        setShowControls(false);
        setShowTransitionMenu(false);
      }
    }, 4000);
  }, [isPlaying, isGalleryOpen]);

  // Chuyển ảnh tiếp theo (Hỗ trợ phát Tuần tự hoặc Ngẫu nhiên Shuffle)
  const handleNext = useCallback(() => {
    resetControlsTimer();
    setCurrentIndex(prev => {
      if (filteredPhotos.length <= 1) return prev;
      playHistoryRef.current.push(prev);
      if (playHistoryRef.current.length > 50) playHistoryRef.current.shift();

      if (isShuffle) {
        let nextIdx = Math.floor(Math.random() * filteredPhotos.length);
        if (nextIdx === prev) {
          nextIdx = (nextIdx + 1) % filteredPhotos.length;
        }
        return nextIdx;
      }
      return (prev + 1) % filteredPhotos.length;
    });
    setKenBurnsStyle(prev => (prev + 1) % 4);
    setSlideshowProgress(0);
  }, [filteredPhotos.length, isShuffle, resetControlsTimer]);

  // Chuyển ảnh trước đó
  const handlePrev = useCallback(() => {
    resetControlsTimer();
    setCurrentIndex(prev => {
      if (filteredPhotos.length <= 1) return prev;
      if (isShuffle && playHistoryRef.current.length > 0) {
        const lastIdx = playHistoryRef.current.pop();
        if (lastIdx !== undefined && lastIdx >= 0 && lastIdx < filteredPhotos.length) {
          return lastIdx;
        }
      }
      return (prev - 1 + filteredPhotos.length) % filteredPhotos.length;
    });
    setKenBurnsStyle(prev => (prev + 1) % 4);
    setSlideshowProgress(0);
  }, [filteredPhotos.length, isShuffle, resetControlsTimer]);

  // Tự động cuộn thanh filmstrip thumbnails đến ảnh đang xem
  useEffect(() => {
    if (thumbnailRefs.current[currentIndex]) {
      thumbnailRefs.current[currentIndex]?.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest'
      });
    }
  }, [currentIndex]);

  // Vòng lặp đếm thời gian & auto-advance Slide Show (chuẩn xác từng 50ms)
  useEffect(() => {
    if (!isPlaying || filteredPhotos.length <= 1 || isGalleryOpen) {
      setSlideshowProgress(0);
      return;
    }
    const intervalStep = 50;
    const timer = setInterval(() => {
      setSlideshowProgress(prev => {
        const next = prev + (intervalStep / speed) * 100;
        if (next >= 100) {
          handleNext();
          return 0;
        }
        return next;
      });
    }, intervalStep);
    return () => clearInterval(timer);
  }, [isPlaying, filteredPhotos.length, speed, handleNext, isGalleryOpen]);

  // Quản lý âm thanh nền
  useEffect(() => {
    if (!audioRef.current) return;
    if (isMusicEnabled) {
      audioRef.current.play().catch(() => {
        // Trình duyệt chặn autoplay âm thanh
        setIsMusicEnabled(false);
      });
    } else {
      audioRef.current.pause();
    }
  }, [isMusicEnabled, currentTrackIndex]);

  useEffect(() => {
    resetControlsTimer();
    return () => {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, [resetControlsTimer]);

  // Bật/tắt toàn màn hình
  const toggleFullscreen = () => {
    resetControlsTimer();
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // =========================================================================
  // 🛡️ 5 TẦNG BẢO MẬT: CHỐNG TẢI ẢNH, CHẶN CHUỘT PHẢI, CHẶN PHÍM TẮT & CHỐNG SOI LINK
  // =========================================================================
  const triggerShieldAlert = useCallback((msg: string) => {
    setShieldNotice(msg);
    setTimeout(() => setShieldNotice(null), 3000);
  }, []);

  useEffect(() => {
    // Chặn chuột phải trên toàn màn hình trình chiếu
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      triggerShieldAlert('🛡️ Chế độ xem an toàn: Đã khóa tính năng tải ảnh để bảo vệ tư liệu kỷ niệm của lớp!');
    };

    // Chặn kéo thả hình ảnh
    const handleDragStart = (e: DragEvent) => {
      e.preventDefault();
    };

    // Chặn các phím tắt trình duyệt: Ctrl+S (Lưu), Ctrl+P (In), Ctrl+U (Xem mã), F12 (Inspect)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey || e.metaKey) && 
        ['s', 'S', 'p', 'P', 'u', 'U'].includes(e.key)
      ) {
        e.preventDefault();
        triggerShieldAlert('🛡️ Chế độ xem an toàn: Thao tác lưu trang bị hạn chế!');
        return;
      }
      if (e.key === 'F12') {
        e.preventDefault();
        return;
      }

      // Phím thoát các modal
      if (e.key === 'Escape') {
        if (isGalleryOpen) {
          e.preventDefault();
          setIsGalleryOpen(false);
          return;
        }
        if (showTransitionMenu) {
          e.preventDefault();
          setShowTransitionMenu(false);
          return;
        }
        if (onExit) {
          onExit();
        }
      }

      // Phím điều hướng trình chiếu
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      }
    };

    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('dragstart', handleDragStart);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('dragstart', handleDragStart);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [triggerShieldAlert, handleNext, handlePrev, onExit, isGalleryOpen, showTransitionMenu]);

  // Xử lý vuốt chạm trên thiết bị di động (Mobile Touch Swipe)
  const handleTouchStart = (e: React.TouchEvent) => {
    resetControlsTimer();
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null || touchStartYRef.current === null) return;
    const diffX = touchStartXRef.current - e.changedTouches[0].clientX;
    const diffY = touchStartYRef.current - e.changedTouches[0].clientY;

    // Chỉ nhận diện vuốt ngang nếu khoảng cách lớn hơn 45px và không bị kéo dọc quá nhiều
    if (Math.abs(diffX) > 45 && Math.abs(diffX) > Math.abs(diffY)) {
      if (diffX > 0) {
        handleNext(); // Vuốt sang trái -> Ảnh tiếp theo
      } else {
        handlePrev(); // Vuốt sang phải -> Ảnh trước
      }
    }
    touchStartXRef.current = null;
    touchStartYRef.current = null;
  };

  const currentPhoto = filteredPhotos[currentIndex];
  const totalPhotos = filteredPhotos.length;

  return (
    <div 
      ref={containerRef}
      onMouseMove={resetControlsTimer}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onClick={() => {
        if (showTransitionMenu) setShowTransitionMenu(false);
      }}
      className="fixed inset-0 z-[999999] bg-black text-white select-none overflow-hidden flex flex-col justify-between font-sans"
      style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
    >
      {/* ẨN AUDIO PLAYER CHO NHẠC NỀN */}
      {playlist && playlist.length > 0 && (
        <audio 
          ref={audioRef}
          src={playlist[currentTrackIndex]?.url}
          loop={playlist.length === 1}
          onEnded={() => setCurrentTrackIndex(prev => (prev + 1) % playlist.length)}
        />
      )}

      {/* 🎬 THANH TIẾN ĐỘ SLIDESHOW (Top Edge - Đồng bộ Web & Màn LED) */}
      {isPlaying && !isGalleryOpen && (
        <div className="absolute top-0 inset-x-0 h-1 bg-white/10 z-40 pointer-events-none">
          <div 
            className="h-full bg-gradient-to-r from-amber-400 via-amber-300 to-emerald-400 transition-all duration-75 ease-linear shadow-xs"
            style={{ width: `${slideshowProgress}%` }}
          />
        </div>
      )}

      {/* ===================================================================== */}
      {/* 1. THANH TIÊU ĐỀ TRÊN CÙNG (AUTO-HIDE)                                 */}
      {/* ===================================================================== */}
      <div 
        className={`absolute top-0 inset-x-0 z-30 p-4 sm:p-6 bg-gradient-to-b from-black/90 via-black/50 to-transparent transition-opacity duration-500 flex items-center justify-between pointer-events-auto ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="text-left">
            <h1 className="text-sm sm:text-base font-bold text-amber-200 tracking-wide font-serif line-clamp-1">
              {albumMeta.albumTitle}
            </h1>
            <div className="flex items-center gap-2 text-xs text-slate-300">
              {albumMeta.subfolderTitle && (
                <span className="flex items-center gap-1 text-emerald-400 font-medium">
                  <Folder className="w-3 h-3" />
                  <span>{albumMeta.subfolderTitle}</span>
                  <span className="text-slate-500">•</span>
                </span>
              )}
              <span>Kỷ niệm 20 năm K8A1 (2003 — 2006)</span>
            </div>
          </div>
        </div>

        {/* Nút Danh sách tất cả ảnh & Chế độ trình chiếu */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              resetControlsTimer();
              setIsGalleryOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-xs text-amber-200 font-bold transition cursor-pointer shadow-sm"
            title="Mở toàn bộ danh sách ảnh để chọn xem"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Tất Cả Ảnh ({totalPhotos})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              resetControlsTimer();
              setIsTvGuideOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-xs text-white font-medium transition cursor-pointer shadow-sm"
            title="Hướng dẫn chiếu lên Smart TV phòng khách"
          >
            <Tv className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Chiếu TV</span>
          </button>

          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-[11px] text-amber-200/90 font-mono">
            <Shield className="w-3 h-3 text-emerald-400" />
            <span>Chế độ an toàn</span>
          </div>

          {onExit && (
            <button
              onClick={onExit}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
              title="Đóng trình chiếu"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 2. KHUNG HIỂN THỊ ẢNH CHÍNH & LỚP KÍNH BẢO VỆ CHỐNG TẢI               */}
      {/* ===================================================================== */}
      <div className="relative flex-1 w-full h-full flex items-center justify-center overflow-hidden">
        {currentPhoto ? (
          <div className="relative w-full h-full flex items-center justify-center p-2 sm:p-6 md:p-8">
            {/* Ambient Blurred Background (Glow điện ảnh đồng bộ Web & Màn LED) */}
            <motion.div 
              key={`bg-${currentPhoto.id || currentIndex}`}
              className="absolute inset-0 bg-cover bg-center filter blur-3xl scale-125 brightness-[0.25] pointer-events-none"
              style={{ backgroundImage: `url(${currentPhoto.thumbnail || currentPhoto.url})` }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.55 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2 }}
            />

            {/* Hiển thị ảnh kèm hiệu ứng chuyển cảnh mượt mà & Ken Burns */}
            <AnimatePresence mode="sync">
              <motion.div
                key={currentPhoto.id || `${currentIndex}-${currentPhoto.url}`}
                className="absolute inset-0 flex items-center justify-center pointer-events-none transform-gpu will-change-[transform,opacity] p-3 sm:p-6 md:p-8"
                initial={currentTransitionConfig.initial}
                animate={currentTransitionConfig.animate}
                exit={currentTransitionConfig.exit}
                transition={currentTransitionConfig.transition}
              >
                <div className="relative inline-block max-w-full max-h-full rounded-2xl overflow-hidden shadow-2xl pointer-events-none">
                  <img 
                    src={currentPhoto.url}
                    alt={currentPhoto.caption || 'K8A1 Kỷ Niệm'}
                    style={{
                      transitionDuration: isPlaying ? `${speed}ms` : '350ms',
                      WebkitTouchCallout: 'none',
                      WebkitUserSelect: 'none',
                      userSelect: 'none',
                      pointerEvents: 'none'
                    }}
                    className={`max-w-full max-h-[70vh] sm:max-h-[74vh] object-contain pointer-events-none rounded-2xl transition-transform ease-out ${isPlaying ? getKenBurnsClass() : ''}`}
                    draggable={false}
                  />

                  {/* 🛡️ WATERMARK ĐÓNG DẤU BẢN QUYỀN GÓC DƯỚI ẢNH (RÕ NÉT, NỔI BẬT) */}
                  <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 z-20 pointer-events-none select-none flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/75 backdrop-blur-md border border-amber-400/60 shadow-2xl">
                    <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse shrink-0" />
                    <span className="text-[11px] sm:text-xs font-serif font-bold text-amber-200 tracking-wider drop-shadow-md">
                      K8A1 THPT THÁI NGUYÊN • 20 NĂM NGÀY TRỞ VỀ
                    </span>
                  </div>

                  {/* 🛡️ WATERMARK CHÉO DẬP CHÌM BẢN QUYỀN (CHỐNG CHỤP MÀN HÌNH CẮT XÉN) */}
                  <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none select-none opacity-20">
                    <span className="text-xl sm:text-3xl md:text-4xl font-serif font-extrabold tracking-widest text-amber-100 uppercase drop-shadow-2xl -rotate-12 border-y-2 border-amber-200/40 py-2 px-6">
                      K8A1 (2003 — 2006)
                    </span>
                  </div>

                  {/* 🛡️ WATERMARK GÓC TRÊN TRANG TRỌNG */}
                  <div className="absolute top-3 left-3 z-20 pointer-events-none select-none px-2 py-0.5 rounded-md bg-black/50 backdrop-blur-xs text-[10px] font-mono font-medium text-white/90 border border-white/20">
                    K8A1 MEMORY ARCHIVE
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* 🛡️ LỚP KÍNH BẢO VỆ VÔ HÌNH (INVISIBLE SHIELD OVERLAY) */}
            {/* Khi người dùng click, chuột phải hoặc tap vào màn hình chỉ chạm vào lớp div trong suốt này */}
            <div 
              className="absolute inset-0 z-20 cursor-default bg-transparent"
              onClick={resetControlsTimer}
              onContextMenu={(e) => {
                e.preventDefault();
                triggerShieldAlert('🛡️ Tư liệu kỷ niệm của lớp K8A1: Tính năng tải ảnh đã được khóa an toàn!');
              }}
              draggable={false}
            />
          </div>
        ) : (
          <div className="text-center p-8 text-slate-400">
            <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-40 text-amber-400" />
            <p className="text-sm">Chưa có hình ảnh nào trong mục này.</p>
          </div>
        )}

        {/* NÚT NEXT & PREV TRÊN MÀN HÌNH (LỚN, BÁN TRONG SUỐT) */}
        {filteredPhotos.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className={`absolute left-3 sm:left-6 z-30 p-3 sm:p-4 rounded-full bg-black/40 hover:bg-black/80 text-white/80 hover:text-white backdrop-blur-md border border-white/10 transition-all duration-300 cursor-pointer ${
                showControls ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-6 pointer-events-none'
              }`}
              title="Ảnh trước (Phím ←)"
            >
              <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8" />
            </button>
            <button
              onClick={handleNext}
              className={`absolute right-3 sm:right-6 z-30 p-3 sm:p-4 rounded-full bg-black/40 hover:bg-black/80 text-white/80 hover:text-white backdrop-blur-md border border-white/10 transition-all duration-300 cursor-pointer ${
                showControls ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-6 pointer-events-none'
              }`}
              title="Ảnh sau (Phím →)"
            >
              <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8" />
            </button>
          </>
        )}
      </div>

      {/* ===================================================================== */}
      {/* 2.5. THANH FILMSTRIP THUMBNAILS (CUỘN NGANG CHỌN ẢNH NHANH)            */}
      {/* ===================================================================== */}
      {filteredPhotos.length > 1 && (
        <div 
          className={`absolute bottom-20 sm:bottom-24 inset-x-0 z-30 px-3 sm:px-6 transition-all duration-300 pointer-events-auto ${
            showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6 pointer-events-none'
          }`}
        >
          <div className="max-w-4xl mx-auto bg-black/75 backdrop-blur-md p-1.5 sm:p-2 rounded-2xl border border-white/15 shadow-2xl flex items-center gap-1.5 sm:gap-2">
            {/* Nút mở toàn bộ lưới ảnh */}
            <button
              type="button"
              onClick={() => {
                resetControlsTimer();
                setIsGalleryOpen(true);
              }}
              className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/40 text-[11px] font-bold shrink-0 transition cursor-pointer"
              title="Mở toàn bộ danh sách ảnh dạng lưới"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Tất Cả ({totalPhotos})</span>
            </button>

            <div className="w-px h-6 bg-white/20 shrink-0" />

            {/* Dải cuộn ảnh ngang Filmstrip */}
            <div 
              ref={thumbnailsScrollRef}
              className="flex items-center gap-1.5 overflow-x-auto py-1 scroll-smooth flex-1"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {filteredPhotos.map((photo, idx) => {
                const isSelected = idx === currentIndex;
                return (
                  <button
                    key={photo.id || idx}
                    ref={el => { thumbnailRefs.current[idx] = el; }}
                    type="button"
                    onClick={() => {
                      resetControlsTimer();
                      setCurrentIndex(idx);
                      setKenBurnsStyle(prev => (prev + 1) % 4);
                      setSlideshowProgress(0);
                    }}
                    className={`relative w-11 h-8 sm:w-14 sm:h-10 rounded-lg overflow-hidden shrink-0 transition-all cursor-pointer border ${
                      isSelected 
                        ? 'border-amber-400 ring-2 ring-amber-400/70 scale-105 shadow-lg opacity-100' 
                        : 'border-white/20 opacity-55 hover:opacity-90 hover:scale-100'
                    }`}
                    title={`#${idx + 1}: ${photo.caption || 'Ảnh kỷ niệm'}`}
                  >
                    <img 
                      src={photo.thumbnail || photo.url} 
                      alt="" 
                      className="w-full h-full object-cover pointer-events-none" 
                      loading="lazy"
                    />
                    <span className="absolute bottom-0 inset-x-0 bg-black/75 text-[9px] font-mono text-center text-white/90 leading-tight">
                      #{idx + 1}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 3. THANH ĐIỀU KHIỂN DƯỚI CÙNG (AUTO-HIDE)                              */}
      {/* ===================================================================== */}
      <div 
        className={`absolute bottom-0 inset-x-0 z-30 p-3 sm:p-5 bg-gradient-to-t from-black/95 via-black/70 to-transparent transition-opacity duration-500 flex flex-col sm:flex-row items-center justify-between gap-3 pointer-events-auto ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Chú thích ảnh & Mốc thời gian */}
        <div className="text-center sm:text-left max-w-xl">
          {currentPhoto?.caption && (
            <p className="text-xs sm:text-sm font-medium text-amber-100 font-serif italic line-clamp-1">
              "{currentPhoto.caption}"
            </p>
          )}
          <div className="flex items-center justify-center sm:justify-start gap-2 text-[11px] text-slate-400 mt-0.5">
            {currentPhoto?.subfolderName && (
              <span className="text-amber-300 font-semibold">📁 {currentPhoto.subfolderName}</span>
            )}
            {currentPhoto?.date && (
              <span>• {currentPhoto.date}</span>
            )}
          </div>
        </div>

        {/* Cụm nút Play / Shuffle / Tốc độ / Hiệu ứng / Nhạc / Lưới ảnh / Toàn màn hình */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 bg-black/75 px-3 sm:px-4 py-2 rounded-full border border-white/10 backdrop-blur-md shadow-xl flex-wrap justify-center">
          {/* Nút Play / Pause */}
          <button
            onClick={() => {
              resetControlsTimer();
              setIsPlaying(!isPlaying);
            }}
            className="p-2 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition cursor-pointer"
            title={isPlaying ? 'Tạm dừng (Phím Space)' : 'Tự động phát'}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
          </button>

          {/* Nút Xáo Trộn Ngẫu Nhiên (Shuffle) */}
          <button
            type="button"
            onClick={() => {
              resetControlsTimer();
              setIsShuffle(!isShuffle);
            }}
            className={`p-1.5 rounded-full transition cursor-pointer border ${
              isShuffle 
                ? 'bg-amber-400/30 text-amber-300 border-amber-400/70 shadow-sm' 
                : 'text-slate-400 hover:text-white border-transparent'
            }`}
            title={isShuffle ? 'Đang phát ngẫu nhiên (Bấm để phát theo thứ tự)' : 'Bật phát ngẫu nhiên (Shuffle)'}
          >
            <Shuffle className="w-4 h-4" />
          </button>

          {/* Bộ đếm ảnh: 1 / 48 */}
          <button
            type="button"
            onClick={() => {
              resetControlsTimer();
              setIsGalleryOpen(true);
            }}
            className="text-xs font-mono font-semibold text-slate-300 hover:text-amber-300 px-1 sm:px-2 transition cursor-pointer"
            title="Bấm để xem danh sách toàn bộ ảnh"
          >
            {currentIndex + 1} <span className="text-slate-500">/</span> {totalPhotos}
          </button>

          <div className="w-px h-4 bg-white/20" />

          {/* Chọn tốc độ chạy (3s, 5s, 8s) */}
          <div className="flex items-center gap-1">
            {[3000, 5000, 8000].map(s => (
              <button
                key={s}
                onClick={() => {
                  resetControlsTimer();
                  setSpeed(s);
                  setSlideshowProgress(0);
                }}
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition cursor-pointer ${
                  speed === s 
                    ? 'bg-amber-400/30 text-amber-300 border border-amber-400/50' 
                    : 'text-slate-400 hover:text-white'
                }`}
                title={`Tốc độ chuyển ảnh ${s / 1000} giây`}
              >
                {s / 1000}s
              </button>
            ))}
          </div>

          <div className="w-px h-4 bg-white/20" />

          {/* CHỌN HIỆU ỨNG CHUYỂN CẢNH (ĐỒNG BỘ 100% WEB & MÀN LED) */}
          <div className="relative">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                resetControlsTimer();
                setShowTransitionMenu(!showTransitionMenu);
              }}
              className={`px-2 py-1 rounded-lg text-xs font-sans font-medium flex items-center gap-1 transition cursor-pointer border ${
                slideshowTransition !== 'alternate'
                  ? 'bg-amber-500/25 border-amber-400 text-amber-200'
                  : 'bg-white/10 border-white/15 text-white/90 hover:bg-white/20'
              }`}
              title="Chọn hiệu ứng chuyển cảnh ảnh (Đồng bộ Web & Màn LED)"
            >
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline text-[11px] font-semibold">
                {SLIDE_TRANSITION_OPTIONS.find(t => t.id === slideshowTransition)?.shortLabel || 'Xen Kẽ'}
              </span>
              <ChevronDown className="w-3 h-3 opacity-70" />
            </button>

            {showTransitionMenu && (
              <div 
                className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-52 bg-slate-900/95 backdrop-blur-md border border-white/20 rounded-xl p-1.5 shadow-2xl z-50 space-y-0.5"
                onClick={e => e.stopPropagation()}
              >
                <div className="px-2 py-1 text-[10px] font-bold text-amber-300 font-mono border-b border-white/10 mb-1">
                  HIỆU ỨNG ĐIỆN ẢNH
                </div>
                {SLIDE_TRANSITION_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setSlideshowTransition(opt.id as SlideTransitionType);
                      setShowTransitionMenu(false);
                      resetControlsTimer();
                    }}
                    className={`w-full px-2 py-1.5 rounded-lg text-xs flex items-center justify-between transition cursor-pointer text-left ${
                      slideshowTransition === opt.id
                        ? 'bg-amber-400 text-slate-950 font-bold'
                        : 'text-slate-200 hover:bg-white/10'
                    }`}
                  >
                    <div>
                      <p className="font-semibold">{opt.label}</p>
                      <p className="text-[10px] text-slate-400">{opt.desc}</p>
                    </div>
                    {slideshowTransition === opt.id && <CheckCircle2 className="w-3.5 h-3.5 text-slate-950 shrink-0 ml-1" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="w-px h-4 bg-white/20" />

          {/* Nút Xem Danh Sách Tất Cả Ảnh (Mở Lưới Chọn Ảnh) */}
          <button
            type="button"
            onClick={() => {
              resetControlsTimer();
              setIsGalleryOpen(true);
            }}
            className="p-1.5 rounded-full text-slate-300 hover:text-amber-300 hover:bg-white/10 transition cursor-pointer"
            title="Xem danh sách tất cả ảnh (Mở lưới chọn ảnh)"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>

          {/* Bật / Tắt nhạc nền (Nếu có playlist) */}
          {playlist && playlist.length > 0 && (
            <button
              onClick={() => {
                resetControlsTimer();
                setIsMusicEnabled(!isMusicEnabled);
              }}
              className={`p-1.5 rounded-full transition cursor-pointer ${
                isMusicEnabled ? 'text-amber-400 bg-amber-400/20' : 'text-slate-400 hover:text-white'
              }`}
              title={isMusicEnabled ? 'Tắt nhạc nền' : 'Bật nhạc nền'}
            >
              {isMusicEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          )}

          {/* Nút Chiếu Lên Smart TV */}
          <button
            type="button"
            onClick={() => {
              resetControlsTimer();
              setIsTvGuideOpen(true);
            }}
            className="p-1.5 rounded-full text-slate-300 hover:text-amber-300 hover:bg-white/10 transition cursor-pointer"
            title="Chiếu lên Smart TV phòng khách"
          >
            <Tv className="w-4 h-4" />
          </button>

          {/* Nút Toàn Màn Hình */}
          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded-full text-slate-300 hover:text-white transition cursor-pointer"
            title={isFullscreen ? 'Thu nhỏ' : 'Toàn màn hình'}
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 4. MODAL LƯỚI TOÀN BỘ ẢNH KỶ NIỆM (ALL PHOTOS GALLERY GRID)           */}
      {/* ===================================================================== */}
      {isGalleryOpen && (
        <div 
          className="fixed inset-0 z-[1000000] bg-black/90 backdrop-blur-xl flex flex-col justify-between pointer-events-auto"
          onClick={() => setIsGalleryOpen(false)}
        >
          {/* Header Modal Lưới Ảnh */}
          <div 
            className="p-4 sm:p-5 border-b border-white/10 bg-slate-900/95 flex items-center justify-between gap-3 shrink-0"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
                <LayoutGrid className="w-4 h-4" />
              </div>
              <div className="text-left">
                <h2 className="text-sm sm:text-base font-bold text-amber-100 font-serif">
                  Danh Sách Tất Cả Ảnh Kỷ Niệm
                </h2>
                <p className="text-xs text-slate-400">
                  {albumMeta.albumTitle} • Tổng cộng {totalPhotos} bức ảnh (Bấm vào ảnh bất kỳ để phát)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsShuffle(true);
                  const randomIdx = Math.floor(Math.random() * filteredPhotos.length);
                  setCurrentIndex(randomIdx);
                  setSlideshowProgress(0);
                  setIsGalleryOpen(false);
                }}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/40 text-xs font-bold transition cursor-pointer"
                title="Bật xáo trộn ngẫu nhiên và phát ngay"
              >
                <Shuffle className="w-3.5 h-3.5" />
                <span>Phát Ngẫu Nhiên</span>
              </button>
              <button
                type="button"
                onClick={() => setIsGalleryOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
                title="Đóng danh sách ảnh (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Ô tìm kiếm nhanh */}
          <div 
            className="p-3 bg-slate-900/60 border-b border-white/5 flex items-center justify-between gap-3 shrink-0"
            onClick={e => e.stopPropagation()}
          >
            <div className="relative flex-1 max-w-md mx-auto">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={gallerySearch}
                onChange={e => setGallerySearch(e.target.value)}
                placeholder="Tìm ảnh theo chú thích, thư mục..."
                className="w-full pl-9 pr-4 py-1.5 bg-white/10 border border-white/15 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-400"
              />
              {gallerySearch && (
                <button
                  type="button"
                  onClick={() => setGallerySearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Lưới danh sách toàn bộ ảnh */}
          <div 
            className="flex-1 overflow-y-auto p-4 sm:p-6"
            onClick={e => e.stopPropagation()}
          >
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 max-w-6xl mx-auto">
              {galleryPhotos.map((photo) => {
                const originalIndex = filteredPhotos.findIndex(p => p.id === photo.id);
                const isSelected = originalIndex === currentIndex;
                return (
                  <div
                    key={photo.id || originalIndex}
                    onClick={() => {
                      setCurrentIndex(originalIndex >= 0 ? originalIndex : 0);
                      setKenBurnsStyle(prev => (prev + 1) % 4);
                      setSlideshowProgress(0);
                      setIsGalleryOpen(false);
                    }}
                    className={`group relative aspect-4/3 rounded-xl overflow-hidden cursor-pointer border transition-all duration-200 transform hover:-translate-y-1 shadow-md ${
                      isSelected 
                        ? 'border-amber-400 ring-2 ring-amber-400/80 shadow-amber-500/20' 
                        : 'border-white/10 hover:border-amber-300/60'
                    }`}
                  >
                    <img 
                      src={photo.thumbnail || photo.url} 
                      alt={photo.caption || ''} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 pointer-events-none"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />
                    
                    {/* Badge số thứ tự */}
                    <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-[10px] font-mono font-bold text-amber-200 border border-white/10">
                      #{originalIndex + 1}
                    </span>

                    {/* Badge đang xem */}
                    {isSelected && (
                      <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded-md bg-amber-500 text-[10px] font-sans font-bold text-slate-950 flex items-center gap-1 shadow-md animate-pulse">
                        <Sparkles className="w-2.5 h-2.5" />
                        <span>Đang chiếu</span>
                      </span>
                    )}

                    {/* Chú thích ảnh */}
                    {photo.caption && (
                      <p className="absolute bottom-2 inset-x-2 text-[11px] text-white/90 line-clamp-1 font-sans text-left">
                        {photo.caption}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
            {galleryPhotos.length === 0 && (
              <div className="text-center py-12 text-slate-400">
                <ImageIcon className="w-10 h-10 mx-auto mb-2 opacity-30 text-amber-400" />
                <p className="text-xs">Không tìm thấy bức ảnh nào phù hợp từ khóa.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 4.5. MODAL HƯỚNG DẪN CHIẾU LÊN SMART TV & MÃ QR CODE                  */}
      {/* ===================================================================== */}
      {isTvGuideOpen && (
        <div 
          className="fixed inset-0 z-[1000000] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 pointer-events-auto animate-fade-in"
          onClick={() => setIsTvGuideOpen(false)}
        >
          <div 
            className="bg-slate-900 border border-amber-400/50 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl text-left animate-scale-up"
            onClick={e => e.stopPropagation()}
          >
            {/* Header Modal TV */}
            <div className="p-4 bg-gradient-to-r from-amber-700 via-amber-800 to-amber-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
                  <Tv className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-amber-100 font-serif">
                    Chiếu Ký Ức Lên Smart TV Phòng Khách
                  </h3>
                  <p className="text-[11px] text-amber-200/80">
                    Phát toàn màn hình, chuyển cảnh mượt & âm thanh nổi
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsTvGuideOpen(false)}
                className="p-1.5 rounded-lg text-amber-200 hover:text-white hover:bg-white/10 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Nội dung kết nối TV */}
            <div className="p-4 sm:p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              {/* Box Mã QR và Link ngắn */}
              <div className="flex flex-col sm:flex-row items-center gap-4 p-3.5 bg-slate-950/70 border border-amber-400/30 rounded-2xl">
                <div className="bg-white p-2 rounded-xl border border-amber-300 shadow-md shrink-0">
                  <img 
                    src={tvQrImageUrl} 
                    alt="Mã QR TV" 
                    className="w-28 h-28 sm:w-32 sm:h-32 object-contain"
                  />
                  <div className="text-center font-mono text-[10px] text-slate-900 font-bold mt-1">
                    Mã TV: #{tvShortCode}
                  </div>
                </div>

                <div className="flex-1 space-y-2 text-left w-full">
                  <p className="text-xs text-amber-200 font-medium">
                    Quét mã QR bằng điện thoại để xem ngay hoặc bấm link siêu ngắn dưới đây trên TV:
                  </p>
                  <div className="flex items-center gap-1.5">
                    <input 
                      type="text"
                      readOnly
                      value={tvShortUrl}
                      className="w-full px-2.5 py-1.5 bg-slate-800 border border-white/20 rounded-lg text-xs font-mono text-amber-100 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(tvShortUrl);
                          setIsCopiedTvLink(true);
                          setTimeout(() => setIsCopiedTvLink(false), 2000);
                        } catch {
                          alert('Đã copy: ' + tvShortUrl);
                        }
                      }}
                      className="px-2.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-bold transition shrink-0 cursor-pointer"
                      title="Sao chép link TV"
                    >
                      {isCopiedTvLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    💡 Remote TV chỉ cần gõ: <span className="text-amber-300 font-mono font-bold">{tvShortUrl.replace('https://', '')}</span>
                  </p>
                </div>
              </div>

              {/* Hướng dẫn 2 bước chiếu không dây (Khuyên dùng) */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                  <span>Cách 1: Chiếu không dây 1 chạm từ Điện thoại (Tiện nhất)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-3 rounded-xl bg-slate-800/80 border border-white/10 space-y-1">
                    <p className="font-bold text-amber-200 flex items-center gap-1">
                      <span>🍎 iPhone / iPad</span>
                    </p>
                    <ol className="list-decimal list-inside text-slate-300 text-[11px] space-y-1">
                      <li>Vuốt mở <strong>Trung tâm điều khiển</strong>.</li>
                      <li>Bấm <strong>Phản chiếu màn hình</strong> (AirPlay).</li>
                      <li>Chọn Smart TV phòng khách của bạn.</li>
                    </ol>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-800/80 border border-white/10 space-y-1">
                    <p className="font-bold text-amber-200 flex items-center gap-1">
                      <span>🤖 Samsung / Android</span>
                    </p>
                    <ol className="list-decimal list-inside text-slate-300 text-[11px] space-y-1">
                      <li>Vuốt thanh thông báo từ trên xuống.</li>
                      <li>Bấm <strong>Smart View</strong> hoặc <strong>Truyền</strong>.</li>
                      <li>Chọn Smart TV để kết nối.</li>
                    </ol>
                  </div>
                </div>
              </div>

              {/* Cách 2: Mở trực tiếp bằng trình duyệt trên TV */}
              <div className="p-3 rounded-xl bg-slate-800/50 border border-white/10 text-xs space-y-1 text-slate-300">
                <p className="font-bold text-slate-200">
                  🌐 Cách 2: Mở trực tiếp trên Trình duyệt Smart TV (Bằng remote)
                </p>
                <p className="text-[11px] leading-relaxed text-slate-400">
                  Mở ứng dụng <strong>Internet</strong> / <strong>Trình duyệt</strong> trên TV ➔ Nhập link ngắn <strong className="text-amber-300 font-mono">{tvShortUrl}</strong> ➔ Bấm nút Toàn Màn Hình để phát tự động.
                </p>
              </div>
            </div>

            {/* Footer Modal TV */}
            <div className="p-3 bg-slate-950 border-t border-white/10 flex justify-end">
              <button
                type="button"
                onClick={() => setIsTvGuideOpen(false)}
                className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition cursor-pointer"
              >
                Đã Hiểu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 5. THÔNG BÁO BẢO MẬT (KHI CỐ TÌNH CHUỘT PHẢI HOẶC LƯU)               */}
      {/* ===================================================================== */}
      {shieldNotice && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[1000000] px-4 py-2.5 rounded-xl bg-slate-900/95 border border-amber-400/80 text-amber-200 text-xs sm:text-sm font-medium shadow-2xl backdrop-blur-md flex items-center gap-2 animate-bounce">
          <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{shieldNotice}</span>
        </div>
      )}
    </div>
  );
};
