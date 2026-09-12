import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  X, Maximize2, Minimize2, Play, Pause, SkipForward, SkipBack, 
  Image as ImageIcon, Sparkles, Music, Volume2, VolumeX, Settings, 
  ChevronLeft, ChevronRight, Sliders, Layers, Tv, RefreshCw, Eye, EyeOff,
  WifiOff, Palette, Frame, QrCode, CheckCircle2
} from 'lucide-react';
import { BackdropItem, MemoryImage, MusicTrack, StagePresentationScene, StageSettings } from '../types';
import { getNostalgicPhotoCaption } from '../data';
import MusicPlaylistModal from './MusicPlaylistModal';
import { precacheMediaList, saveOfflineTrackFile, loadAllOfflineTracks } from '../utils/offlineStorage';

// Họa tiết góc hoa văn cổ điển mạ vàng (Vintage Golden Corner Filigree)
function VintageCorner({ position }: { position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' }) {
  const posClasses = {
    'top-left': 'top-2 left-2',
    'top-right': 'top-2 right-2 rotate-90',
    'bottom-right': 'bottom-2 right-2 rotate-180',
    'bottom-left': 'bottom-2 left-2 -rotate-90'
  }[position];

  return (
    <div className={`absolute z-30 pointer-events-none w-9 h-9 md:w-14 md:h-14 ${posClasses} drop-shadow-[0_2px_6px_rgba(0,0,0,0.85)]`}>
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <defs>
          <linearGradient id={`goldCornerGrad-${position}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FEF08A" />
            <stop offset="35%" stopColor="#F59E0B" />
            <stop offset="70%" stopColor="#D97706" />
            <stop offset="100%" stopColor="#78350F" />
          </linearGradient>
        </defs>
        {/* Outer Corner Filigree Frame */}
        <path
          d="M 5 5 L 85 5 C 80 12, 70 18, 55 18 L 18 18 L 18 55 C 18 70, 12 80, 5 85 Z"
          fill={`url(#goldCornerGrad-${position})`}
        />
        {/* Intricate Filigree Scroll */}
        <path
          d="M 12 12 L 65 12 C 55 22, 45 22, 38 18 C 30 18, 25 24, 25 32 C 25 40, 32 45, 40 45 C 48 45, 55 38, 55 30 C 55 20, 48 15, 40 15 C 32 15, 28 20, 28 28 L 28 65 C 20 55, 15 45, 12 12 Z"
          fill="#FEF08A"
          opacity="0.85"
        />
        {/* Corner Diamond / Jewel Accent */}
        <polygon points="12,12 18,8 24,12 18,16" fill="#FFFBEB" />
        <circle cx="20" cy="20" r="3.5" fill="#78350F" stroke="#FEF08A" strokeWidth="1" />
      </svg>
    </div>
  );
}

// Hiệu ứng hạt bay hoài niệm (Hoa phượng đỏ rơi / Bụi phấn nắng vàng / Bụi sao sân khấu)
function NostalgiaParticles({ type }: { type: 'petals' | 'chalk' | 'sparkles' | 'none' }) {
  if (type === 'none') return null;

  if (type === 'petals') {
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
        {[...Array(16)].map((_, i) => {
          const left = (i * 6.5 + (i % 3) * 3) % 96;
          const delay = (i * 0.55) % 6;
          const duration = 7 + (i % 5) * 1.5;
          const size = 16 + (i % 4) * 6;
          return (
            <div
              key={i}
              className="absolute top-[-35px] animate-[k8a1PetalFall_linear_infinite]"
              style={{
                left: `${left}%`,
                animationDelay: `${delay}s`,
                animationDuration: `${duration}s`,
              }}
            >
              <div 
                className="animate-[k8a1PetalSway_ease-in-out_infinite]"
                style={{
                  animationDuration: `${2.8 + (i % 3) * 0.8}s`,
                  animationDelay: `${delay * 0.5}s`
                }}
              >
                <svg width={size} height={size * 1.25} viewBox="0 0 24 30" fill="none">
                  <path
                    d="M12 0 C16 8, 24 15, 20 25 C 16 32, 8 32, 4 25 C 0 15, 8 8, 12 0 Z"
                    fill="url(#petalGradK8)"
                    opacity="0.85"
                  />
                  <defs>
                    <linearGradient id="petalGradK8" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#f87171" />
                      <stop offset="40%" stopColor="#ef4444" />
                      <stop offset="100%" stopColor="#991b1b" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  if (type === 'chalk') {
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
        {[...Array(24)].map((_, i) => {
          const left = (i * 4.5 + 2) % 96;
          const top = (i * 6.5 + 8) % 86;
          const size = 3 + (i % 4) * 2.5;
          const delay = (i * 0.35) % 5;
          const duration = 3.5 + (i % 4) * 1.8;
          const isSunbeam = i % 3 === 0;
          return (
            <div
              key={i}
              className={`absolute rounded-full ${isSunbeam ? 'bg-amber-300/40 blur-[1px]' : 'bg-white/50 blur-[0.5px]'} animate-pulse`}
              style={{
                left: `${left}%`,
                top: `${top}%`,
                width: `${size}px`,
                height: `${size}px`,
                animationDelay: `${delay}s`,
                animationDuration: `${duration}s`
              }}
            />
          );
        })}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-amber-400/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-yellow-400/10 rounded-full blur-3xl pointer-events-none" />
      </div>
    );
  }

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
      <div className="absolute top-1/4 left-1/5 w-2.5 h-2.5 bg-yellow-300 rounded-full blur-[1px] animate-ping opacity-70" />
      <div className="absolute top-1/3 right-1/4 w-3.5 h-3.5 bg-amber-400 rounded-full blur-[1px] animate-pulse opacity-80" />
      <div className="absolute bottom-1/3 left-1/3 w-2.5 h-2.5 bg-yellow-200 rounded-full blur-[1px] animate-ping opacity-60" style={{ animationDelay: '1s' }} />
      <div className="absolute top-2/3 right-1/5 w-3 h-3 bg-amber-300 rounded-full blur-[1px] animate-pulse opacity-70" style={{ animationDelay: '1.5s' }} />
      <div className="absolute bottom-1/4 right-1/3 w-2 h-2 bg-yellow-400 rounded-full blur-[1px] animate-ping opacity-60" style={{ animationDelay: '2s' }} />
    </div>
  );
}

interface StagePresentationHubProps {
  isOpen: boolean;
  onClose: () => void;
  backdrops: BackdropItem[];
  memories: MemoryImage[];
  playlist: MusicTrack[];
  stageSettings: StageSettings;
  eventTitle?: string;
  eventSubtitle?: string;
  onUpdateSettings?: (settings: StageSettings) => void;
  isAdmin?: boolean;
  totalAttendees?: number;
  checkedInAttendees?: number;
}

export default function StagePresentationHub({
  isOpen,
  onClose,
  backdrops = [],
  memories = [],
  playlist = [],
  stageSettings,
  eventTitle = "KỶ NIỆM 20 NĂM NGÀY TRỞ VỀ — K8A1",
  eventSubtitle = "Trường THPT Thái Nguyên (2003 — 2006)",
  onUpdateSettings,
  isAdmin = false,
  totalAttendees,
  checkedInAttendees
}: StagePresentationHubProps) {
  // Cài đặt hiện tại
  const [currentScene, setCurrentScene] = useState<StagePresentationScene>(stageSettings.defaultScene || 'backdrop');
  const [slideshowSpeed, setSlideshowSpeed] = useState<number>(stageSettings.slideshowSpeed || 6000);
  const [enableSparkles, setEnableSparkles] = useState<boolean>(stageSettings.enableSparkles !== false);
  const [showCaption, setShowCaption] = useState<boolean>(stageSettings.showCaption !== false);
  const [showCheckinQr, setShowCheckinQr] = useState<boolean>(false);

  // Hiệu ứng hoài niệm & Khung ảnh kỷ niệm
  const [photoFrameStyle, setPhotoFrameStyle] = useState<'gold' | 'polaroid' | 'none'>(stageSettings.photoFrameStyle || 'gold');
  const [particleEffect, setParticleEffect] = useState<'none' | 'petals' | 'chalk' | 'sparkles'>(stageSettings.particleEffect || 'petals');
  const [photoFilter, setPhotoFilter] = useState<'original' | 'sepia' | 'film' | 'bw'>(stageSettings.photoFilter || 'sepia');
  const [showCorners, setShowCorners] = useState<boolean>(stageSettings.showCorners !== false);

  // Bộ lọc màu ảnh kỷ niệm theo phong cách hoài niệm
  const getPhotoFilterStyle = () => {
    switch (photoFilter) {
      case 'sepia':
        return 'sepia(0.35) contrast(1.08) brightness(0.96) saturate(1.15)';
      case 'film':
        return 'contrast(1.2) brightness(0.92) saturate(0.82) hue-rotate(-6deg)';
      case 'bw':
        return 'grayscale(1) contrast(1.2) brightness(0.94)';
      default:
        return 'none';
    }
  };

  // Danh sách Backdrop & Backdrop đang chọn
  const defaultBdIndex = Math.max(0, backdrops.findIndex(b => b.isDefault));
  const [selectedBackdropIndex, setSelectedBackdropIndex] = useState<number>(defaultBdIndex >= 0 ? defaultBdIndex : 0);

  // Trình chiếu ảnh kỷ niệm
  const [photoIndex, setPhotoIndex] = useState<number>(0);
  const [isPhotoPaused, setIsPhotoPaused] = useState<boolean>(false);
  const [kenBurnsStyle, setKenBurnsStyle] = useState<number>(0);

  // Trạng thái Fullscreen & Điều khiển ẩn/hiện
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showControls, setShowControls] = useState<boolean>(true);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [showMusicModal, setShowMusicModal] = useState<boolean>(false);
  const [showBackdropSelector, setShowBackdropSelector] = useState<boolean>(false);

  // Trạng thái mạng Online / Offline
  const [isOnline, setIsOnline] = useState<boolean>(() => typeof navigator !== 'undefined' ? navigator.onLine : true);

  // Quản lý âm thanh Playlist
  const [internalPlaylist, setInternalPlaylist] = useState<MusicTrack[]>(playlist && playlist.length > 0 ? playlist : []);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0);
  const [isMusicPlaying, setIsMusicPlaying] = useState<boolean>(stageSettings.autoPlayMusic !== false);
  const [volume, setVolume] = useState<number>(stageSettings.volume || 85);
  const [isShuffled, setIsShuffled] = useState<boolean>(false);
  const [repeatMode, setRepeatMode] = useState<'all' | 'one' | 'off'>(() => {
    try {
      const saved = localStorage.getItem('k8a1_music_repeat_mode');
      if (saved === 'all' || saved === 'one' || saved === 'off') return saved;
    } catch {}
    return 'all';
  });

  const containerRef = useRef<HTMLDivElement | null>(null);
  const idleTimeoutRef = useRef<any>(null);

  // Nạp toàn bộ các ca khúc offline đã lưu trong máy
  useEffect(() => {
    loadAllOfflineTracks().then((offlineTracks) => {
      if (offlineTracks && offlineTracks.length > 0) {
        setInternalPlaylist((prev) => {
          const base = prev.length > 0 ? prev : playlist;
          const existingIds = new Set(base.map(t => t.id));
          const toAdd = offlineTracks.filter(t => !existingIds.has(t.id));
          return [...base, ...toAdd];
        });
      }
    }).catch(() => {});
  }, [playlist]);

  // Đồng bộ khi prop playlist thay đổi
  useEffect(() => {
    if (playlist && playlist.length > 0) {
      setInternalPlaylist((prev) => {
        const offlineTracks = prev.filter(t => t.isOffline || t.sourceType === 'offline');
        const existingIds = new Set(playlist.map(t => t.id));
        const customPreserved = offlineTracks.filter(t => !existingIds.has(t.id));
        return [...playlist, ...customPreserved];
      });
    }
  }, [playlist]);

  // Lắng nghe bài offline mới được nạp từ bất kỳ đâu
  useEffect(() => {
    const handleOfflineTrackAdded = (e: any) => {
      if (e.detail?.track) {
        setInternalPlaylist((prev) => {
          if (prev.some(t => t.id === e.detail.track.id)) return prev;
          return [...prev, e.detail.track];
        });
      }
    };
    window.addEventListener('k8a1-offline-track-added' as any, handleOfflineTrackAdded);
    return () => {
      window.removeEventListener('k8a1-offline-track-added' as any, handleOfflineTrackAdded);
    };
  }, []);

  const handleUploadOfflineFile = async (file: File) => {
    try {
      const newTrack = await saveOfflineTrackFile(file);
      setInternalPlaylist((prev) => [...prev, newTrack]);
      window.dispatchEvent(new CustomEvent('k8a1-offline-track-added', { detail: { track: newTrack } }));
    } catch (err: any) {
      alert('Không thể lưu file offline: ' + (err?.message || err));
    }
  };

  // Theo dõi trạng thái mạng Internet để hiển thị chỉ báo trên sân khấu
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Lắng nghe sự kiện đổi bài từ AudioPlayer để đồng bộ bài đang phát trên sân khấu
  useEffect(() => {
    const handleTrackChanged = (e: any) => {
      if (e.detail && typeof e.detail.index === 'number') {
        setCurrentTrackIndex(e.detail.index);
        setIsMusicPlaying(true);
      }
    };
    window.addEventListener('k8a1-track-changed' as any, handleTrackChanged);
    return () => {
      window.removeEventListener('k8a1-track-changed' as any, handleTrackChanged);
    };
  }, []);

  // Tiền tải (pre-cache) toàn bộ ảnh backdrop và thư viện kỷ niệm vào bộ nhớ trình duyệt để chiếu offline mượt mà
  useEffect(() => {
    if (!isOpen) return;
    const urlsToCache: string[] = [];
    backdrops.forEach(b => { if (b.url) urlsToCache.push(b.url); });
    memories.forEach(m => { if (m.url) urlsToCache.push(m.url); });
    if (urlsToCache.length > 0) {
      precacheMediaList(urlsToCache);
    }
  }, [isOpen, backdrops, memories]);

  // Tự động phát nhạc khi mở trình chiếu
  useEffect(() => {
    if (isOpen && stageSettings.autoPlayMusic) {
      window.dispatchEvent(new CustomEvent('k8a1-play-music'));
      setIsMusicPlaying(true);
    }
  }, [isOpen, stageSettings.autoPlayMusic]);

  // Bộ hẹn giờ chuyển ảnh tự động (Ken Burns Slideshow)
  useEffect(() => {
    if (!isOpen || (currentScene !== 'slideshow' && currentScene !== 'dual') || isPhotoPaused) {
      return;
    }

    if (!memories || memories.length <= 1) return;

    const timer = setInterval(() => {
      setPhotoIndex((prev) => (prev + 1) % memories.length);
      setKenBurnsStyle((prev) => (prev + 1) % 4);
    }, slideshowSpeed);

    return () => clearInterval(timer);
  }, [isOpen, currentScene, isPhotoPaused, memories, slideshowSpeed]);

  // Bộ đếm tự động ẩn thanh điều khiển sau 3.5s không rê chuột
  const resetIdleTimer = useCallback(() => {
    setShowControls(true);
    if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
    idleTimeoutRef.current = setTimeout(() => {
      // Chỉ ẩn khi không mở các modal con
      setShowControls(false);
    }, 3500);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    window.addEventListener('mousemove', resetIdleTimer);
    window.addEventListener('mousedown', resetIdleTimer);
    window.addEventListener('touchstart', resetIdleTimer);
    resetIdleTimer();

    return () => {
      window.removeEventListener('mousemove', resetIdleTimer);
      window.removeEventListener('mousedown', resetIdleTimer);
      window.removeEventListener('touchstart', resetIdleTimer);
      if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
    };
  }, [isOpen, resetIdleTimer]);

  // Xử lý phím tắt sân khấu
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Bỏ qua nếu đang gõ trong ô input
      if (['input', 'textarea', 'select'].includes((e.target as HTMLElement)?.tagName?.toLowerCase())) {
        return;
      }

      resetIdleTimer();

      switch (e.key.toLowerCase()) {
        case 'f':
          toggleFullscreen();
          break;
        case 'b':
          setCurrentScene('backdrop');
          break;
        case 'p':
          setCurrentScene('slideshow');
          break;
        case 'c':
        case 'd':
          setCurrentScene('dual');
          break;
        case 'm':
          setShowMusicModal(prev => !prev);
          break;
        case 'q':
          setShowCheckinQr(prev => !prev);
          break;
        case ' ':
          e.preventDefault();
          setIsPhotoPaused(prev => !prev);
          break;
        case 'arrowright':
          if (memories.length > 0) {
            setPhotoIndex(prev => (prev + 1) % memories.length);
            setKenBurnsStyle(prev => (prev + 1) % 4);
          }
          break;
        case 'arrowleft':
          if (memories.length > 0) {
            setPhotoIndex(prev => (prev - 1 + memories.length) % memories.length);
            setKenBurnsStyle(prev => (prev + 1) % 4);
          }
          break;
        case 'escape':
          if (document.fullscreenElement) {
            document.exitFullscreen().catch(() => {});
          } else {
            onClose();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, memories.length, onClose, resetIdleTimer]);

  // Bật / tắt toàn màn hình Fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      if (containerRef.current?.requestFullscreen) {
        containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
      }
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  if (!isOpen) return null;

  const currentBackdrop = backdrops[selectedBackdropIndex] || backdrops[0];
  const currentPhoto = memories[photoIndex] || memories[0];
  const effectivePlaylist = internalPlaylist.length > 0 ? internalPlaylist : playlist;
  const currentTrack = effectivePlaylist[currentTrackIndex] || effectivePlaylist[0];

  // Các hiệu ứng Ken Burns Pan & Zoom đa hướng
  const getKenBurnsClass = () => {
    switch (kenBurnsStyle) {
      case 0: return 'scale-110 translate-x-3 translate-y-2';
      case 1: return 'scale-115 -translate-x-3 -translate-y-2';
      case 2: return 'scale-110 -translate-x-2 translate-y-3';
      case 3: return 'scale-115 translate-x-2 -translate-y-2';
      default: return 'scale-110';
    }
  };

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 z-[200] bg-black text-white select-none overflow-hidden flex flex-col justify-between"
      style={{ cursor: showControls ? 'default' : 'none' }}
    >
      {/* Keyframe animation cho cánh hoa phượng rơi */}
      <style>{`
        @keyframes k8a1PetalFall {
          0% { transform: translateY(0vh) rotate(0deg); opacity: 0; }
          12% { opacity: 0.95; }
          88% { opacity: 0.95; }
          100% { transform: translateY(105vh) rotate(360deg); opacity: 0; }
        }
        @keyframes k8a1PetalSway {
          0%, 100% { transform: translateX(0px) rotate(0deg); }
          50% { transform: translateX(38px) rotate(28deg); }
        }
      `}</style>
      {/* ========================================================================= */}
      {/* 1. SCENE 1: BACKDROP MÀN LED SÂN KHẤU CHÍNH                               */}
      {/* ========================================================================= */}
      {currentScene === 'backdrop' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black animate-fadeIn">
          {currentBackdrop?.url ? (
            <img
              src={currentBackdrop.url}
              alt={currentBackdrop.title}
              className="w-full h-full object-contain md:object-cover"
              style={{ maxHeight: '100vh', maxWidth: '100vw' }}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-gradient-to-b from-[#0b1329] via-[#050b18] to-black text-center">
              <div className="w-24 h-24 rounded-3xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 mb-6 shadow-2xl shadow-amber-500/20">
                <Tv className="w-12 h-12" />
              </div>
              <h1 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-300 uppercase tracking-wider mb-4">
                {eventTitle}
              </h1>
              <p className="text-lg md:text-2xl text-amber-300/80 font-serif max-w-2xl">
                {eventSubtitle}
              </p>
            </div>
          )}

          {/* Hiệu ứng hạt bay hoài niệm */}
          <NostalgiaParticles type={particleEffect} />
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. SCENE 2: KEN BURNS PHOTO SLIDESHOW (ẢNH KỶ NIỆM TOÀN MÀN HÌNH)         */}
      {/* ========================================================================= */}
      {currentScene === 'slideshow' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black overflow-hidden animate-fadeIn">
          {currentPhoto ? (
            <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
              {/* Nền mờ nghệ thuật phía sau */}
              <div 
                className="absolute inset-0 bg-cover bg-center filter blur-2xl scale-125 opacity-40 brightness-50"
                style={{ backgroundImage: `url(${currentPhoto.url})` }}
              />

              {/* Hiệu ứng hạt bay hoài niệm */}
              <NostalgiaParticles type={particleEffect} />

              {/* KHUNG ẢNH KỶ NIỆM THEO PHONG CÁCH TÙY CHỌN */}
              {photoFrameStyle === 'gold' && (
                <div className="relative z-10 max-w-[92vw] md:max-w-[82vw] max-h-[74vh] md:max-h-[78vh] p-2 md:p-3.5 bg-gradient-to-b from-amber-500/25 via-amber-950/20 to-black/85 rounded-2xl md:rounded-3xl border-2 md:border-4 border-amber-400/80 shadow-[0_0_60px_rgba(0,0,0,0.95),0_0_25px_rgba(245,158,11,0.25)] flex items-center justify-center overflow-hidden">
                  {showCorners && (
                    <>
                      <VintageCorner position="top-left" />
                      <VintageCorner position="top-right" />
                      <VintageCorner position="bottom-left" />
                      <VintageCorner position="bottom-right" />
                    </>
                  )}
                  <div className="w-full h-full overflow-hidden rounded-xl md:rounded-2xl flex items-center justify-center bg-black/40">
                    <img
                      key={currentPhoto.id || photoIndex}
                      src={currentPhoto.url}
                      alt={currentPhoto.caption || "Ảnh kỷ niệm K8A1"}
                      style={{ filter: getPhotoFilterStyle() }}
                      className={`max-w-full max-h-full object-contain transition-all duration-[6000ms] ease-out ${getKenBurnsClass()}`}
                    />
                  </div>
                </div>
              )}

              {photoFrameStyle === 'polaroid' && (
                <div className="relative z-10 max-w-[88vw] md:max-w-[68vw] max-h-[74vh] bg-[#FAF7F2] p-3 md:p-4 pb-12 md:pb-16 rounded-xl shadow-[0_20px_70px_rgba(0,0,0,0.95)] border border-amber-200/70 rotate-[-0.6deg] flex flex-col items-center">
                  {/* Dải băng dính washi hoài niệm dán ở trên */}
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-32 md:w-44 h-6 bg-amber-100/80 border border-amber-300/50 backdrop-blur-xs shadow-xs rotate-[-1deg] z-30" />

                  {showCorners && (
                    <>
                      <VintageCorner position="top-left" />
                      <VintageCorner position="top-right" />
                      <VintageCorner position="bottom-left" />
                      <VintageCorner position="bottom-right" />
                    </>
                  )}

                  <div className="w-full overflow-hidden rounded-lg bg-slate-950 flex items-center justify-center max-h-[57vh]">
                    <img
                      key={currentPhoto.id || photoIndex}
                      src={currentPhoto.url}
                      alt={currentPhoto.caption || "Ảnh kỷ niệm K8A1"}
                      style={{ filter: getPhotoFilterStyle() }}
                      className={`max-w-full max-h-full object-contain transition-all duration-[6000ms] ease-out ${getKenBurnsClass()}`}
                    />
                  </div>

                  {/* Chữ viết tay hoài niệm dưới chân ảnh Polaroid */}
                  <div className="absolute bottom-2 md:bottom-3 left-4 right-4 text-center">
                    <p className="text-xs md:text-sm font-serif italic text-amber-950/85 font-bold tracking-wider">
                      Kỷ niệm K8A1 — 20 Năm Ngày Trở Về (2003 — 2006)
                    </p>
                  </div>
                </div>
              )}

              {photoFrameStyle === 'none' && (
                <img
                  key={currentPhoto.id || photoIndex}
                  src={currentPhoto.url}
                  alt={currentPhoto.caption || "Ảnh kỷ niệm K8A1"}
                  style={{ filter: getPhotoFilterStyle() }}
                  className={`relative z-10 max-w-full max-h-full object-contain transition-all duration-[6000ms] ease-out ${getKenBurnsClass()}`}
                />
              )}

              {/* Dải Caption chú thích ảnh hoài niệm (ĐÃ BỎ DÒNG DATE/UPLOAD TIME) */}
              {showCaption && (
                <div className="absolute bottom-16 md:bottom-20 left-0 right-0 z-20 flex justify-center px-6 pointer-events-none">
                  <div className="max-w-3xl bg-black/75 backdrop-blur-md px-6 py-3 rounded-2xl border border-amber-500/40 text-center shadow-2xl">
                    <p className="text-base md:text-xl font-bold font-serif italic text-amber-200 tracking-wide leading-relaxed">
                      “{getNostalgicPhotoCaption(photoIndex, currentPhoto.caption)}”
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-slate-400">
              <ImageIcon className="w-12 h-12 mx-auto mb-3 text-slate-600" />
              <p>Chưa có ảnh kỷ niệm nào trong thư viện</p>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. SCENE 3: DUAL SCENE (BACKDROP SÂN KHẤU LÀM NỀN + ẢNH KỶ NIỆM Ở TRUNG TÂM) */}
      {/* ========================================================================= */}
      {currentScene === 'dual' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black overflow-hidden animate-fadeIn">
          {/* Backdrop sân khấu làm khung viền nghệ thuật phía sau */}
          {currentBackdrop?.url ? (
            <div 
              className="absolute inset-0 bg-cover bg-center filter blur-[4px] brightness-50 scale-105"
              style={{ backgroundImage: `url(${currentBackdrop.url})` }}
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-b from-[#0e162e] to-black" />
          )}

          {/* Lớp ánh sáng Vignette nghệ thuật cho sân khấu */}
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(circle at center, transparent 40%, rgba(0,0,0,0.75) 100%)' }} />

          {/* Hiệu ứng hạt bay hoài niệm */}
          <NostalgiaParticles type={particleEffect} />

          {/* Vùng ảnh kỷ niệm nổi bật ở trung tâm */}
          {currentPhoto && (
            <>
              {photoFrameStyle === 'polaroid' ? (
                <div className="relative z-10 max-w-[85vw] md:max-w-[70vw] max-h-[72vh] bg-[#FAF7F2] p-3 md:p-4 pb-12 md:pb-16 rounded-xl shadow-[0_20px_70px_rgba(0,0,0,0.95)] border border-amber-200/70 rotate-[-0.6deg] flex flex-col items-center">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-32 md:w-44 h-6 bg-amber-100/80 border border-amber-300/50 backdrop-blur-xs shadow-xs rotate-[-1deg] z-30" />
                  {showCorners && (
                    <>
                      <VintageCorner position="top-left" />
                      <VintageCorner position="top-right" />
                      <VintageCorner position="bottom-left" />
                      <VintageCorner position="bottom-right" />
                    </>
                  )}
                  <div className="w-full overflow-hidden rounded-lg bg-slate-950 flex items-center justify-center max-h-[55vh]">
                    <img
                      key={currentPhoto.id || photoIndex}
                      src={currentPhoto.url}
                      alt={currentPhoto.caption || "Kỷ niệm K8A1"}
                      style={{ filter: getPhotoFilterStyle() }}
                      className={`max-w-full max-h-full object-contain transition-all duration-[6000ms] ease-out ${getKenBurnsClass()}`}
                    />
                  </div>
                  <div className="absolute bottom-2 md:bottom-3 left-4 right-4 text-center">
                    <p className="text-xs md:text-sm font-serif italic text-amber-950/85 font-bold tracking-wider">
                      Kỷ niệm K8A1 — 20 Năm Ngày Trở Về (2003 — 2006)
                    </p>
                  </div>
                </div>
              ) : photoFrameStyle === 'gold' ? (
                <div className="relative z-10 w-[90vw] md:w-[76vw] h-[65vh] md:h-[72vh] p-2.5 md:p-4 bg-gradient-to-b from-amber-500/25 via-amber-900/15 to-black/80 rounded-3xl border-2 md:border-4 border-amber-400/80 shadow-[0_0_60px_rgba(0,0,0,0.95),0_0_30px_rgba(245,158,11,0.3)] flex items-center justify-center overflow-hidden">
                  {showCorners && (
                    <>
                      <VintageCorner position="top-left" />
                      <VintageCorner position="top-right" />
                      <VintageCorner position="bottom-left" />
                      <VintageCorner position="bottom-right" />
                    </>
                  )}
                  <div className="w-full h-full overflow-hidden rounded-2xl flex items-center justify-center bg-black/40">
                    <img
                      key={currentPhoto.id || photoIndex}
                      src={currentPhoto.url}
                      alt={currentPhoto.caption || "Kỷ niệm K8A1"}
                      style={{ filter: getPhotoFilterStyle() }}
                      className={`w-full h-full object-contain transition-all duration-[6000ms] ease-out ${getKenBurnsClass()}`}
                    />
                  </div>
                </div>
              ) : (
                <div className="relative z-10 w-[90vw] md:w-[75vw] h-[65vh] md:h-[72vh] rounded-3xl overflow-hidden shadow-2xl shadow-black/90 bg-black flex items-center justify-center">
                  <img
                    key={currentPhoto.id || photoIndex}
                    src={currentPhoto.url}
                    alt={currentPhoto.caption || "Kỷ niệm K8A1"}
                    style={{ filter: getPhotoFilterStyle() }}
                    className={`w-full h-full object-contain transition-all duration-[6000ms] ease-out ${getKenBurnsClass()}`}
                  />
                </div>
              )}

              {showCaption && (
                <div className="absolute bottom-4 left-4 right-4 z-20 bg-black/75 backdrop-blur-md px-5 py-2.5 rounded-xl border border-amber-500/30 text-center">
                  <p className="text-sm md:text-lg font-bold font-serif italic text-amber-200">
                    “{getNostalgicPhotoCaption(photoIndex, currentPhoto.caption)}”
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. FLOATING CHECK-IN QR CODE OVERLAY (BẬT / TẮT BẰNG NÚT HOẶC PHÍM Q)     */}
      {/* ========================================================================= */}
      {showCheckinQr && (
        <div className="absolute top-20 right-6 md:right-10 z-40 max-w-sm w-full bg-slate-950/92 backdrop-blur-xl border-2 border-amber-400/90 rounded-3xl p-5 shadow-[0_0_50px_rgba(0,0,0,0.9),0_0_30px_rgba(245,158,11,0.35)] animate-fadeIn text-white pointer-events-auto">
          {/* Ornate Corner Ornaments */}
          <div className="absolute top-2 left-2 w-3.5 h-3.5 border-t-2 border-l-2 border-amber-400/80" />
          <div className="absolute top-2 right-2 w-3.5 h-3.5 border-t-2 border-r-2 border-amber-400/80" />
          <div className="absolute bottom-2 left-2 w-3.5 h-3.5 border-b-2 border-l-2 border-amber-400/80" />
          <div className="absolute bottom-2 right-2 w-3.5 h-3.5 border-b-2 border-r-2 border-amber-400/80" />

          {/* Close button */}
          <button
            onClick={() => setShowCheckinQr(false)}
            className="absolute top-3 right-3 p-1.5 rounded-full bg-white/10 hover:bg-rose-900/80 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Đóng bảng QR (Phím Q)"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Header */}
          <div className="text-center space-y-1 mb-3.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-[10px] font-sans font-black uppercase tracking-widest">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Quét Mã Tự Điểm Danh</span>
            </div>
            <h3 className="text-base md:text-lg font-serif font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-300 uppercase tracking-wide">
              Nhận Vé Vàng Hội Ngộ
            </h3>
            <p className="text-[11px] text-amber-200/80 font-serif italic">
              Dùng Camera điện thoại hoặc Zalo để quét mã
            </p>
          </div>

          {/* QR Code Container */}
          <div className="bg-white p-3 rounded-2xl border-2 border-amber-400/60 flex flex-col items-center justify-center shadow-inner mx-auto max-w-[210px]">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
                typeof window !== 'undefined'
                  ? `${window.location.origin}${window.location.pathname}?mode=checkin`
                  : ''
              )}&color=0b1329&bgcolor=ffffff&margin=1`}
              alt="QR Code Điểm Danh K8A1"
              className="w-44 h-44 object-contain"
            />
            <span className="text-[9px] font-mono font-bold text-slate-800 mt-1 uppercase tracking-wider">
              Scan to Self Check-in
            </span>
          </div>

          {/* Live attendance count */}
          {typeof totalAttendees === 'number' && (
            <div className="mt-3.5 pt-3 border-t border-slate-800 text-center space-y-1">
              <div className="flex items-center justify-between text-xs px-2 text-slate-300">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Đã có mặt:</span>
                </span>
                <span className="font-bold text-amber-300 font-mono text-sm">
                  {checkedInAttendees || 0} / {totalAttendees} bạn
                </span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-amber-500 to-emerald-400 h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${totalAttendees > 0 ? Math.min(100, Math.round(((checkedInAttendees || 0) / totalAttendees) * 100)) : 0}%`
                  }}
                />
              </div>
            </div>
          )}

          {/* Bottom Hint */}
          <div className="mt-2.5 text-center">
            <span className="text-[10px] text-slate-400 font-sans">
              Bấm phím <kbd className="px-1 py-0.5 rounded bg-slate-800 text-amber-300 font-mono text-[9px]">Q</kbd> trên bàn phím để ẩn/hiện
            </span>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TOP STATUS BAR (Huy hiệu sự kiện & đồng hồ trực tiếp)                     */}
      {/* ========================================================================= */}
      <div 
        className={`relative z-30 flex items-center justify-between p-4 md:p-6 transition-all duration-500 pointer-events-none ${
          showControls ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
        }`}
      >
        <div className="flex items-center gap-3 bg-black/60 backdrop-blur-md px-4 py-2 rounded-2xl border border-amber-500/30 pointer-events-auto">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-slate-950 font-black text-xs shadow-md">
            20Y
          </div>
          <div>
            <h2 className="text-xs md:text-sm font-bold text-amber-200 uppercase tracking-wider">
              {eventTitle}
            </h2>
            <p className="text-[10px] text-slate-300">
              {currentScene === 'backdrop' ? 'Chế độ: Backdrop Màn LED' : currentScene === 'slideshow' ? `Trình chiếu kỷ niệm (${photoIndex + 1}/${memories.length})` : 'Chế độ Kết hợp Backdrop & Kỷ niệm'}
            </p>
          </div>
        </div>

        {/* Nút thoát, trạng thái mạng & Fullscreen góc phải trên */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {!isOnline && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-semibold animate-pulse">
              <WifiOff className="w-3.5 h-3.5" />
              <span>Ngoại tuyến</span>
            </div>
          )}
          <button
            onClick={toggleFullscreen}
            className="p-2.5 rounded-xl bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/10 text-slate-300 hover:text-white transition-all cursor-pointer"
            title={isFullscreen ? "Thu nhỏ (F)" : "Toàn màn hình (F)"}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
          <button
            onClick={onClose}
            className="p-2.5 rounded-xl bg-black/60 hover:bg-rose-900/80 backdrop-blur-md border border-white/10 text-slate-300 hover:text-rose-200 transition-all cursor-pointer"
            title="Thoát trình chiếu (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* BOTTOM PRESENTER BAR (Bảng điều khiển sân khấu thông minh tự động ẩn)      */}
      {/* ========================================================================= */}
      <div 
        className={`relative z-30 p-4 md:p-6 transition-all duration-500 flex flex-col md:flex-row items-center justify-between gap-3 pointer-events-none ${
          showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        {/* Nhạc nền đang phát (Mini ticker ticker) */}
        <div 
          onClick={() => setShowMusicModal(true)}
          className="bg-black/70 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-amber-500/30 flex items-center gap-3 cursor-pointer hover:border-amber-400 transition-all pointer-events-auto shadow-lg"
          title="Bấm để mở Playlist nhạc (Phím M)"
        >
          <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 flex-shrink-0">
            <Music className="w-4 h-4" />
          </div>
          <div className="min-w-0 max-w-[180px] md:max-w-[240px]">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <p className="text-xs font-bold text-amber-200 truncate">
                {currentTrack?.title || 'Nhạc Nền K8A1'}
              </p>
            </div>
            <p className="text-[10px] text-slate-400 truncate">
              {currentTrack?.artist || 'Bấm để chọn bài'}
            </p>
          </div>
        </div>

        {/* Bảng nút chuyển Chế độ & Điều khiển Slide */}
        <div className="flex items-center gap-2 md:gap-3 bg-black/80 backdrop-blur-xl px-4 py-2.5 rounded-2xl border border-amber-500/40 shadow-2xl pointer-events-auto">
          {/* Nút đổi Chế độ trình chiếu */}
          <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-700/60">
            <button
              onClick={() => setCurrentScene('backdrop')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                currentScene === 'backdrop' 
                  ? 'bg-amber-400 text-slate-950 shadow-md font-bold' 
                  : 'text-slate-300 hover:text-white'
              }`}
              title="Chuyển sang Backdrop Sân Khấu (Phím B)"
            >
              <Tv className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Backdrop</span>
            </button>

            <button
              onClick={() => setCurrentScene('slideshow')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                currentScene === 'slideshow' 
                  ? 'bg-amber-400 text-slate-950 shadow-md font-bold' 
                  : 'text-slate-300 hover:text-white'
              }`}
              title="Chuyển sang Trình chiếu Kỷ niệm (Phím P)"
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Ảnh Kỷ Niệm</span>
            </button>

            <button
              onClick={() => setCurrentScene('dual')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                currentScene === 'dual' 
                  ? 'bg-amber-400 text-slate-950 shadow-md font-bold' 
                  : 'text-slate-300 hover:text-white'
              }`}
              title="Chuyển sang Chế độ Kết hợp (Phím C)"
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Kết Hợp</span>
            </button>
          </div>

          <div className="h-6 w-px bg-slate-700" />

          {/* Điều khiển lật ảnh trước / sau nếu đang ở chế độ ảnh */}
          {(currentScene === 'slideshow' || currentScene === 'dual') && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  setPhotoIndex(prev => (prev - 1 + memories.length) % memories.length);
                  setKenBurnsStyle(prev => (prev + 1) % 4);
                }}
                className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
                title="Ảnh trước (Mũi tên trái)"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsPhotoPaused(!isPhotoPaused)}
                className="p-2 rounded-lg text-amber-300 hover:bg-amber-500/20 transition-all cursor-pointer font-bold"
                title={isPhotoPaused ? "Tiếp tục chạy (Space)" : "Tạm dừng chuyển ảnh (Space)"}
              >
                {isPhotoPaused ? <Play className="w-4 h-4 fill-current" /> : <Pause className="w-4 h-4 fill-current" />}
              </button>

              <button
                onClick={() => {
                  setPhotoIndex(prev => (prev + 1) % memories.length);
                  setKenBurnsStyle(prev => (prev + 1) % 4);
                }}
                className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
                title="Ảnh kế tiếp (Mũi tên phải)"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Nếu đang ở chế độ Backdrop: Nút đổi Maket Backdrop */}
          {currentScene === 'backdrop' && backdrops.length > 1 && (
            <button
              onClick={() => setSelectedBackdropIndex((prev) => (prev + 1) % backdrops.length)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 text-amber-300 hover:bg-slate-700 transition-all cursor-pointer flex items-center gap-1.5"
              title="Đổi sang mẫu Backdrop khác"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Đổi Backdrop ({selectedBackdropIndex + 1}/{backdrops.length})</span>
            </button>
          )}

          <div className="h-6 w-px bg-slate-700" />

          {/* Bật / Tắt QR Tự Điểm Danh trên sân khấu */}
          <button
            onClick={() => setShowCheckinQr(prev => !prev)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              showCheckinQr
                ? 'bg-amber-400 text-slate-950 shadow-md font-bold'
                : 'text-amber-300 hover:text-white bg-slate-800/80 hover:bg-slate-700'
            }`}
            title="Bật / Tắt Mã QR Tự Điểm Danh (Phím Q)"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">QR Điểm Danh</span>
          </button>

          <div className="h-6 w-px bg-slate-700" />

          {/* Cài đặt tốc độ & hiệu ứng */}
          <button
            onClick={() => setShowSettingsModal(true)}
            className="p-2 rounded-lg text-slate-300 hover:text-amber-300 hover:bg-slate-800 transition-all cursor-pointer"
            title="Cài đặt tốc độ & hiệu ứng sân khấu"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>

        {/* Phím tắt gợi ý cho MC / Kỹ thuật viên hội trường */}
        <div className="hidden lg:flex items-center gap-2 text-[11px] text-slate-400 bg-black/60 backdrop-blur-md px-3 py-2 rounded-xl border border-white/5 pointer-events-auto">
          <span>Phím tắt:</span>
          <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 font-mono">F</kbd> Toàn màn hình
          <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 font-mono">B</kbd> Backdrop
          <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 font-mono">P</kbd> Kỷ niệm
          <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 font-mono">Q</kbd> QR Điểm danh
          <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 font-mono">M</kbd> Playlist
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL CÀI ĐẶT SÂN KHẤU (SPEED, SPARKLES, CAPTIONS)                        */}
      {/* ========================================================================= */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-3 md:p-5 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-lg bg-slate-900 border border-amber-500/50 rounded-2xl p-5 md:p-6 shadow-2xl text-slate-100 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-amber-200 text-base">Cài Đặt Trình Chiếu Sân Khấu & Hiệu Ứng Hoài Niệm</h3>
              </div>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Tốc độ chuyển ảnh Ken Burns */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Tốc độ chuyển ảnh kỷ niệm (Ken Burns Slideshow):
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[4000, 6000, 8000, 10000].map((spd) => (
                    <button
                      key={spd}
                      type="button"
                      onClick={() => setSlideshowSpeed(spd)}
                      className={`py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        slideshowSpeed === spd
                          ? 'bg-amber-500/25 border-amber-400 text-amber-300 shadow-sm'
                          : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {spd / 1000} giây
                    </button>
                  ))}
                </div>
              </div>

              {/* Bộ lọc màu ảnh xưa (Vintage Filters) */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-amber-400" />
                  <span>Bộ lọc màu ảnh kỷ niệm (Phong cách xưa cũ):</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'original', label: '🎨 Màu Gốc', desc: 'Sắc nét gốc' },
                    { id: 'sepia', label: '🍂 Sepia Ấm', desc: 'Ánh vàng hoài niệm' },
                    { id: 'film', label: '🎞️ Phim 2000s', desc: 'Màu phim xưa' },
                    { id: 'bw', label: '📷 Đen Trắng', desc: 'Ký ức kinh điển' }
                  ].map((flt) => (
                    <button
                      key={flt.id}
                      type="button"
                      onClick={() => setPhotoFilter(flt.id as any)}
                      className={`p-2 rounded-xl text-xs font-medium border text-left transition-all cursor-pointer ${
                        photoFilter === flt.id
                          ? 'bg-amber-500/25 border-amber-400 text-amber-200 ring-1 ring-amber-400/40'
                          : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      <p className="font-bold">{flt.label}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{flt.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Kiểu khung ảnh kỷ niệm */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
                  <Frame className="w-3.5 h-3.5 text-amber-400" />
                  <span>Kiểu khung ảnh kỷ niệm:</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'gold', label: '🏆 Khung Mạ Vàng', desc: 'Viền hoàng gia sang trọng' },
                    { id: 'polaroid', label: '📸 Khung Polaroid', desc: 'Băng dính & Chữ viết tay' },
                    { id: 'none', label: '🔲 Không Khung', desc: 'Toàn màn hình tự do' }
                  ].map((frm) => (
                    <button
                      key={frm.id}
                      type="button"
                      onClick={() => setPhotoFrameStyle(frm.id as any)}
                      className={`p-2 rounded-xl text-xs font-medium border text-left transition-all cursor-pointer ${
                        photoFrameStyle === frm.id
                          ? 'bg-amber-500/25 border-amber-400 text-amber-200 ring-1 ring-amber-400/40'
                          : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      <p className="font-bold">{frm.label}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{frm.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Hiệu ứng hạt bay hoài niệm */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Hiệu ứng hạt bay lơ lửng trên sân khấu:</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'petals', label: '🌸 Hoa Phượng Rơi', desc: 'Mùa thi trường xưa' },
                    { id: 'chalk', label: '☀️ Bụi Phấn & Nắng', desc: 'Ánh nắng lớp học' },
                    { id: 'sparkles', label: '✨ Bụi Sao Hoàng Kim', desc: 'Lấp lánh sân khấu' },
                    { id: 'none', label: '❌ Tắt Hạt Bay', desc: 'Màn hình tĩnh' }
                  ].map((pt) => (
                    <button
                      key={pt.id}
                      type="button"
                      onClick={() => {
                        setParticleEffect(pt.id as any);
                        setEnableSparkles(pt.id === 'sparkles');
                      }}
                      className={`p-2 rounded-xl text-xs font-medium border text-left transition-all cursor-pointer ${
                        particleEffect === pt.id
                          ? 'bg-amber-500/25 border-amber-400 text-amber-200 ring-1 ring-amber-400/40'
                          : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      <p className="font-bold">{pt.label}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{pt.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Toggles chi tiết */}
              <div className="space-y-2.5 pt-2 border-t border-slate-800">
                {/* Bật/Tắt họa tiết 4 góc cổ điển mạ vàng */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
                  <div>
                    <span className="text-xs font-medium text-slate-200">Họa tiết hoa văn 4 góc cổ điển mạ vàng</span>
                    <p className="text-[10px] text-slate-400">Góc kim loại hoa văn phong cách album kỷ niệm gia đình</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={showCorners}
                    onChange={(e) => setShowCorners(e.target.checked)}
                    className="w-4 h-4 accent-amber-400 rounded cursor-pointer"
                  />
                </div>

                {/* Bật/Tắt chú thích ảnh hoài niệm */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
                  <div>
                    <span className="text-xs font-medium text-slate-200">Hiển thị trích dẫn hoài niệm ở cuối màn hình</span>
                    <p className="text-[10px] text-slate-400">Chỉ hiển thị các câu nói thanh xuân ý nghĩa, không hiện ngày giờ upload</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={showCaption}
                    onChange={(e) => setShowCaption(e.target.checked)}
                    className="w-4 h-4 accent-amber-400 rounded cursor-pointer"
                  />
                </div>
              </div>

              {/* Chọn Backdrop mặc định */}
              {backdrops.length > 0 && (
                <div className="pt-2 border-t border-slate-800">
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Chọn Maket Backdrop sân khấu:
                  </label>
                  <select
                    value={selectedBackdropIndex}
                    onChange={(e) => setSelectedBackdropIndex(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
                  >
                    {backdrops.map((bd, idx) => (
                      <option key={bd.id || idx} value={idx}>
                        {bd.title} {bd.isDefault ? ' (Mặc định)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="mt-5 pt-3 border-t border-slate-800 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowSettingsModal(false)}
                className="px-4 py-2 rounded-xl text-xs text-slate-300 bg-slate-800 hover:bg-slate-700"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onUpdateSettings) {
                    onUpdateSettings({
                      slideshowSpeed,
                      defaultScene: currentScene,
                      autoPlayMusic: isMusicPlaying,
                      enableSparkles: particleEffect === 'sparkles',
                      volume,
                      showCaption,
                      shufflePhotos: isShuffled,
                      photoFrameStyle,
                      particleEffect,
                      photoFilter,
                      showCorners
                    });
                  }
                  setShowSettingsModal(false);
                }}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 font-bold text-xs hover:brightness-110 shadow-lg cursor-pointer"
              >
                Lưu cài đặt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL PLAYLIST NHẠC NỀN                                                  */}
      {/* ========================================================================= */}
      <MusicPlaylistModal
        isOpen={showMusicModal}
        onClose={() => setShowMusicModal(false)}
        playlist={effectivePlaylist}
        currentTrackIndex={currentTrackIndex}
        isPlaying={isMusicPlaying}
        isShuffled={isShuffled}
        repeatMode={repeatMode}
        volume={volume}
        isOnline={isOnline}
        onUploadOfflineFile={handleUploadOfflineFile}
        onSelectTrack={(idx) => {
          setCurrentTrackIndex(idx);
          window.dispatchEvent(new CustomEvent('k8a1-play-music', { detail: { index: idx } }));
        }}
        onTogglePlay={() => {
          if (isMusicPlaying) {
            window.dispatchEvent(new CustomEvent('pause-bg-music'));
            setIsMusicPlaying(false);
          } else {
            window.dispatchEvent(new CustomEvent('k8a1-play-music'));
            setIsMusicPlaying(true);
          }
        }}
        onNextTrack={() => {
          window.dispatchEvent(new CustomEvent('k8a1-next-music'));
        }}
        onPrevTrack={() => {
          window.dispatchEvent(new CustomEvent('k8a1-prev-music'));
        }}
        onToggleShuffle={() => setIsShuffled(!isShuffled)}
        onToggleRepeat={() => {
          const modes: ('all' | 'one' | 'off')[] = ['all', 'one', 'off'];
          const curIdx = modes.indexOf(repeatMode);
          const nextMode = modes[(curIdx + 1) % modes.length];
          setRepeatMode(nextMode);
          try {
            localStorage.setItem('k8a1_music_repeat_mode', nextMode);
          } catch {}
        }}
        onVolumeChange={(v) => setVolume(v)}
        isAdmin={isAdmin}
      />
    </div>
  );
}
