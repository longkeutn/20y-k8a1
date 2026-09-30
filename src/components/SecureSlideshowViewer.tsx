import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, Pause, ChevronLeft, ChevronRight, Maximize, Minimize, 
  Volume2, VolumeX, Shield, Sparkles, Folder, Image as ImageIcon,
  Clock, X, Check, Layers, ChevronDown, CheckCircle2
} from 'lucide-react';
import { MemoryImage, PhotoAlbum, MusicTrack, SlideTransitionType } from '../types';
import { DEFAULT_PLAYLIST } from '../data';
import { 
  ROTATING_TRANSITIONS, 
  TRANSITION_PRESETS, 
  TransitionConfig, 
  SLIDE_TRANSITION_OPTIONS 
} from './StagePresentationHub';

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

  // Âm thanh nền
  const [isMusicEnabled, setIsMusicEnabled] = useState<boolean>(initialMusic);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Tham chiếu DOM & Touch Swiping
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);

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

  // Điều khiển ẩn/hiện thanh công cụ sau 3.5 giây không chạm
  const resetControlsTimer = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
        setShowTransitionMenu(false);
      }
    }, 3500);
  }, [isPlaying]);

  // Chuyển ảnh tiếp theo / trước đó
  const handleNext = useCallback(() => {
    resetControlsTimer();
    setCurrentIndex(prev => (prev + 1) % filteredPhotos.length);
    setKenBurnsStyle(prev => (prev + 1) % 4);
    setSlideshowProgress(0);
  }, [filteredPhotos.length, resetControlsTimer]);

  const handlePrev = useCallback(() => {
    resetControlsTimer();
    setCurrentIndex(prev => (prev - 1 + filteredPhotos.length) % filteredPhotos.length);
    setKenBurnsStyle(prev => (prev + 1) % 4);
    setSlideshowProgress(0);
  }, [filteredPhotos.length, resetControlsTimer]);

  // Vòng lặp đếm thời gian & auto-advance Slide Show (chuẩn xác từng 50ms)
  useEffect(() => {
    if (!isPlaying || filteredPhotos.length <= 1) {
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
  }, [isPlaying, filteredPhotos.length, speed, handleNext]);

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

      // Phím điều hướng trình chiếu
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'Escape' && onExit) {
        onExit();
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
  }, [triggerShieldAlert, handleNext, handlePrev, onExit]);

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
      {isPlaying && (
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

        {/* Nút thoát & Phím tắt */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[11px] text-amber-200/90 font-mono">
            <Shield className="w-3 h-3 text-emerald-400" />
            <span>Chế độ trình chiếu an toàn</span>
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
                    className={`max-w-full max-h-[72vh] sm:max-h-[78vh] object-contain pointer-events-none rounded-2xl transition-transform ease-out ${isPlaying ? getKenBurnsClass() : ''}`}
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
      {/* 3. THANH ĐIỀU KHIỂN DƯỚI CÙNG (AUTO-HIDE)                              */}
      {/* ===================================================================== */}
      <div 
        className={`absolute bottom-0 inset-x-0 z-30 p-4 sm:p-6 bg-gradient-to-t from-black/95 via-black/60 to-transparent transition-opacity duration-500 flex flex-col sm:flex-row items-center justify-between gap-3 pointer-events-auto ${
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

        {/* Cụm nút Play / Pause / Tốc độ / Hiệu ứng chuyển cảnh / Nhạc / Toàn màn hình */}
        <div className="flex items-center gap-2 sm:gap-2.5 bg-black/70 px-3 sm:px-4 py-2 rounded-full border border-white/10 backdrop-blur-md shadow-xl flex-wrap justify-center">
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

          {/* Bộ đếm ảnh: 1 / 48 */}
          <span className="text-xs font-mono font-semibold text-slate-300 px-1 sm:px-2">
            {currentIndex + 1} <span className="text-slate-500">/</span> {totalPhotos}
          </span>

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
      {/* 4. THÔNG BÁO BẢO MẬT (KHI CỐ TÌNH CHUỘT PHẢI HOẶC LƯU)               */}
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
