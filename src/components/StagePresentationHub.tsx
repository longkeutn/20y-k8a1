import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  X, Maximize2, Minimize2, Play, Pause, SkipForward, SkipBack, 
  Image as ImageIcon, Sparkles, Music, Volume2, VolumeX, Settings, 
  ChevronLeft, ChevronRight, Sliders, Layers, Tv, RefreshCw, Eye, EyeOff
} from 'lucide-react';
import { BackdropItem, MemoryImage, MusicTrack, StagePresentationScene, StageSettings } from '../types';
import { getNostalgicPhotoCaption } from '../data';
import MusicPlaylistModal from './MusicPlaylistModal';

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
  isAdmin = false
}: StagePresentationHubProps) {
  // Cài đặt hiện tại
  const [currentScene, setCurrentScene] = useState<StagePresentationScene>(stageSettings.defaultScene || 'backdrop');
  const [slideshowSpeed, setSlideshowSpeed] = useState<number>(stageSettings.slideshowSpeed || 6000);
  const [enableSparkles, setEnableSparkles] = useState<boolean>(stageSettings.enableSparkles !== false);
  const [showCaption, setShowCaption] = useState<boolean>(stageSettings.showCaption !== false);

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

  // Quản lý âm thanh Playlist
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0);
  const [isMusicPlaying, setIsMusicPlaying] = useState<boolean>(stageSettings.autoPlayMusic !== false);
  const [volume, setVolume] = useState<number>(stageSettings.volume || 85);
  const [isShuffled, setIsShuffled] = useState<boolean>(false);
  const [repeatMode, setRepeatMode] = useState<'all' | 'one' | 'off'>('all');

  const containerRef = useRef<HTMLDivElement | null>(null);
  const idleTimeoutRef = useRef<any>(null);

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
  const currentTrack = playlist[currentTrackIndex] || playlist[0];

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

          {/* Hiệu ứng bụi sao lấp lánh (Golden Sparkles) */}
          {enableSparkles && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="absolute top-1/4 left-1/5 w-2 h-2 bg-yellow-300 rounded-full blur-[1px] animate-ping opacity-60" />
              <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-amber-400 rounded-full blur-[1px] animate-pulse opacity-70" />
              <div className="absolute bottom-1/3 left-1/3 w-2 h-2 bg-yellow-200 rounded-full blur-[1px] animate-ping opacity-50" style={{ animationDelay: '1s' }} />
              <div className="absolute top-2/3 right-1/5 w-2.5 h-2.5 bg-amber-300 rounded-full blur-[1px] animate-pulse opacity-60" style={{ animationDelay: '1.5s' }} />
            </div>
          )}
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

              {/* Ảnh chính với hiệu ứng chuyển động Ken Burns */}
              <img
                key={currentPhoto.id || photoIndex}
                src={currentPhoto.url}
                alt={currentPhoto.caption || "Ảnh kỷ niệm K8A1"}
                className={`relative z-10 max-w-full max-h-full object-contain transition-all duration-[6000ms] ease-out ${getKenBurnsClass()}`}
              />

              {/* Dải Caption chú thích ảnh hoài niệm */}
              {showCaption && (
                <div className="absolute bottom-16 md:bottom-20 left-0 right-0 z-20 flex justify-center px-6 pointer-events-none">
                  <div className="max-w-3xl bg-black/70 backdrop-blur-md px-6 py-3 rounded-2xl border border-amber-500/40 text-center shadow-2xl">
                    <p className="text-base md:text-xl font-bold font-serif italic text-amber-200 tracking-wide leading-relaxed">
                      “{getNostalgicPhotoCaption(photoIndex, currentPhoto.caption)}”
                    </p>
                    {currentPhoto.date && (
                      <p className="text-xs text-slate-300 mt-1 font-sans">
                        {currentPhoto.date}
                      </p>
                    )}
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

          {/* Vùng ảnh kỷ niệm nổi bật ở trung tâm với khung viền mạ vàng */}
          <div className="relative z-10 w-[90vw] md:w-[75vw] h-[65vh] md:h-[72vh] rounded-3xl overflow-hidden shadow-2xl shadow-black/90 border-2 border-amber-400/60 bg-black flex items-center justify-center">
            {currentPhoto && (
              <>
                <img
                  key={currentPhoto.id || photoIndex}
                  src={currentPhoto.url}
                  alt={currentPhoto.caption || "Kỷ niệm K8A1"}
                  className={`w-full h-full object-contain transition-all duration-[6000ms] ease-out ${getKenBurnsClass()}`}
                />

                {showCaption && (
                  <div className="absolute bottom-4 left-4 right-4 bg-black/75 backdrop-blur-md px-5 py-2.5 rounded-xl border border-amber-500/30 text-center">
                    <p className="text-sm md:text-lg font-bold font-serif italic text-amber-200">
                      “{getNostalgicPhotoCaption(photoIndex, currentPhoto.caption)}”
                    </p>
                  </div>
                )}
              </>
            )}
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

        {/* Nút thoát & Fullscreen góc phải trên */}
        <div className="flex items-center gap-2 pointer-events-auto">
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
          <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 font-mono">M</kbd> Playlist
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL CÀI ĐẶT SÂN KHẤU (SPEED, SPARKLES, CAPTIONS)                        */}
      {/* ========================================================================= */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md bg-slate-900 border border-amber-500/40 rounded-2xl p-6 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-amber-200 text-base">Cài Đặt Trình Chiếu Sân Khấu</h3>
              </div>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Tốc độ chuyển ảnh */}
              <div>
                <label className="block text-xs text-slate-400 mb-2">
                  Tốc độ chuyển ảnh kỷ niệm Ken Burns:
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[4000, 6000, 8000, 10000].map((spd) => (
                    <button
                      key={spd}
                      onClick={() => setSlideshowSpeed(spd)}
                      className={`py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        slideshowSpeed === spd
                          ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                          : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {spd / 1000} giây
                    </button>
                  ))}
                </div>
              </div>

              {/* Bật/Tắt hiệu ứng bụi sao */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-medium">Bụi sao lấp lánh trên màn LED</span>
                </div>
                <input
                  type="checkbox"
                  checked={enableSparkles}
                  onChange={(e) => setEnableSparkles(e.target.checked)}
                  className="w-4 h-4 accent-amber-400 rounded cursor-pointer"
                />
              </div>

              {/* Bật/Tắt chú thích ảnh */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-medium">Hiển thị chú thích ảnh</span>
                </div>
                <input
                  type="checkbox"
                  checked={showCaption}
                  onChange={(e) => setShowCaption(e.target.checked)}
                  className="w-4 h-4 accent-amber-400 rounded cursor-pointer"
                />
              </div>

              {/* Chọn Backdrop mặc định */}
              {backdrops.length > 0 && (
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">
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

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => {
                  if (onUpdateSettings) {
                    onUpdateSettings({
                      slideshowSpeed,
                      defaultScene: currentScene,
                      autoPlayMusic: isMusicPlaying,
                      enableSparkles,
                      volume,
                      showCaption,
                      shufflePhotos: isShuffled
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
        playlist={playlist}
        currentTrackIndex={currentTrackIndex}
        isPlaying={isMusicPlaying}
        isShuffled={isShuffled}
        repeatMode={repeatMode}
        volume={volume}
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
          const nextIdx = (currentTrackIndex + 1) % playlist.length;
          setCurrentTrackIndex(nextIdx);
          window.dispatchEvent(new CustomEvent('k8a1-play-music', { detail: { index: nextIdx } }));
        }}
        onPrevTrack={() => {
          const prevIdx = (currentTrackIndex - 1 + playlist.length) % playlist.length;
          setCurrentTrackIndex(prevIdx);
          window.dispatchEvent(new CustomEvent('k8a1-play-music', { detail: { index: prevIdx } }));
        }}
        onToggleShuffle={() => setIsShuffled(!isShuffled)}
        onToggleRepeat={() => {
          const modes: ('all' | 'one' | 'off')[] = ['all', 'one', 'off'];
          const curIdx = modes.indexOf(repeatMode);
          setRepeatMode(modes[(curIdx + 1) % modes.length]);
        }}
        onVolumeChange={(v) => setVolume(v)}
        isAdmin={isAdmin}
      />
    </div>
  );
}
