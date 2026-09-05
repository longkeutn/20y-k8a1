import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Music, Loader2 } from 'lucide-react';

interface AudioPlayerProps {
  customAudioUrl?: string;
  variant?: 'navbar' | 'floating';
}

declare global {
  interface Window {
    onYouTubeIframeAPIReady?: () => void;
    YT?: any;
  }
}

// Mặc định sử dụng video YouTube "Mong Ước Kỷ Niệm Xưa"
const DEFAULT_YOUTUBE_URL = "https://youtu.be/ocvlV5LZ93Q?si=V4rWQY_LKJTVDaaV";
const DEFAULT_VIDEO_ID = "ocvlV5LZ93Q";

export function extractYouTubeVideoId(url: string): string {
  if (!url) return DEFAULT_VIDEO_ID;
  const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ \s]{11})/i);
  return match ? match[1] : DEFAULT_VIDEO_ID;
}

// Tự động tải YouTube IFrame API script an toàn, tránh chèn trùng lặp
function loadYouTubeIframeApi(): Promise<any> {
  return new Promise((resolve) => {
    if (window.YT && window.YT.Player) {
      resolve(window.YT);
      return;
    }

    const SCRIPT_ID = 'k8a1-youtube-iframe-api';
    if (!document.getElementById(SCRIPT_ID)) {
      const tag = document.createElement('script');
      tag.id = SCRIPT_ID;
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScript = document.getElementsByTagName('script')[0];
      firstScript?.parentNode?.insertBefore(tag, firstScript);
    }

    // Polling kiểm tra trạng thái tải của YouTube IFrame API
    let elapsed = 0;
    const interval = setInterval(() => {
      elapsed += 100;
      if (window.YT && window.YT.Player) {
        clearInterval(interval);
        resolve(window.YT);
      } else if (elapsed >= 15000) {
        clearInterval(interval);
        resolve(window.YT || null);
      }
    }, 100);
  });
}

export default function AudioPlayer({ customAudioUrl, variant = 'navbar' }: AudioPlayerProps) {
  const activeUrl = customAudioUrl || DEFAULT_YOUTUBE_URL;
  const videoId = extractYouTubeVideoId(activeUrl);

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isBuffering, setIsBuffering] = useState<boolean>(false);
  const [isReady, setIsReady] = useState<boolean>(false);

  const playerRef = useRef<any>(null);
  const pendingPlayRef = useRef<boolean>(false);
  const mountWrapperRef = useRef<HTMLDivElement | null>(null);

  // Khởi tạo YouTube IFrame Player (Chỉ phát tiếng, ẩn 100% video)
  useEffect(() => {
    let isCancelled = false;

    loadYouTubeIframeApi().then((YT) => {
      if (isCancelled || !YT || !YT.Player || !mountWrapperRef.current) return;

      try {
        // Đảm bảo phần tử mount luôn tồn tại (kể cả sau khi React re-mount)
        let mountEl = mountWrapperRef.current.querySelector('#yt-audio-mount') as HTMLElement | null;
        if (!mountEl) {
          mountEl = document.createElement('div');
          mountEl.id = 'yt-audio-mount';
          mountWrapperRef.current.appendChild(mountEl);
        }

        // Hủy instance cũ nếu đã tồn tại
        if (playerRef.current && typeof playerRef.current.destroy === 'function') {
          try {
            playerRef.current.destroy();
          } catch (e) {}
          playerRef.current = null;
        }

        playerRef.current = new YT.Player(mountEl, {
          height: '1',
          width: '1',
          videoId: videoId,
          playerVars: {
            autoplay: 0,
            controls: 0,
            disablekb: 1,
            fs: 0,
            iv_load_policy: 3,
            loop: 1,
            playlist: videoId, // Bắt buộc để YouTube tự động lặp vô tận một video
            playsinline: 1,    // Ngăn chặn Safari/iOS mở toàn màn hình
            rel: 0,
            modestbranding: 1
          },
          events: {
            onReady: (event: any) => {
              if (isCancelled) return;
              setIsReady(true);
              try {
                event.target.setVolume(85);
              } catch (e) {}

              // Nếu người dùng bấm play trong khi đang tải API
              if (pendingPlayRef.current) {
                try {
                  event.target.playVideo();
                } catch (e) {}
                pendingPlayRef.current = false;
              }
            },
            onStateChange: (event: any) => {
              if (isCancelled) return;
              // 1: PLAYING, 2: PAUSED, 0: ENDED, 3: BUFFERING
              if (event.data === 1) {
                setIsPlaying(true);
                setIsBuffering(false);
              } else if (event.data === 2) {
                setIsPlaying(false);
                setIsBuffering(false);
              } else if (event.data === 0) {
                // Tự động lặp lại bài hát mượt mà
                try {
                  event.target.seekTo(0);
                  event.target.playVideo();
                } catch (e) {}
              } else if (event.data === 3) {
                setIsBuffering(true);
              }
            },
            onError: (err: any) => {
              console.warn('YouTube Audio Player error:', err);
              if (!isCancelled) {
                setIsBuffering(false);
                setIsPlaying(false);
              }
            }
          }
        });
      } catch (err) {
        console.warn('Không thể khởi tạo YouTube Player:', err);
      }
    });

    return () => {
      isCancelled = true;
      if (playerRef.current && typeof playerRef.current.destroy === 'function') {
        try {
          playerRef.current.destroy();
        } catch (e) {}
        playerRef.current = null;
      }
    };
  }, [videoId]);

  // Lắng nghe sự kiện dừng nhạc nền khi có video kỷ niệm khác được bật trên trang
  useEffect(() => {
    const handlePauseBgMusic = () => {
      if (playerRef.current && typeof playerRef.current.pauseVideo === 'function') {
        try {
          playerRef.current.pauseVideo();
          setIsPlaying(false);
          setIsBuffering(false);
        } catch (e) {}
      }
    };

    window.addEventListener('pause-bg-music', handlePauseBgMusic);
    return () => window.removeEventListener('pause-bg-music', handlePauseBgMusic);
  }, []);

  // Xử lý nút bấm Bật / Tắt nhạc
  const togglePlay = useCallback(() => {
    if (isPlaying) {
      if (playerRef.current && typeof playerRef.current.pauseVideo === 'function') {
        try {
          playerRef.current.pauseVideo();
        } catch (e) {}
      }
      setIsPlaying(false);
      setIsBuffering(false);
      pendingPlayRef.current = false;
    } else {
      if (isReady && playerRef.current && typeof playerRef.current.playVideo === 'function') {
        try {
          playerRef.current.playVideo();
          setIsBuffering(true);
        } catch (e) {}
      } else {
        pendingPlayRef.current = true;
        setIsBuffering(true);
      }
    }
  }, [isPlaying, isReady]);

  // JSX vùng nhúng ẩn (Audio only: 1px x 1px, độ mờ 0.001, hoàn toàn không thấy video)
  const renderHiddenPlayer = () => (
    <div
      ref={mountWrapperRef}
      style={{
        position: 'fixed',
        bottom: 0,
        right: 0,
        width: '1px',
        height: '1px',
        opacity: 0.001,
        pointerEvents: 'none',
        zIndex: -9999,
        overflow: 'hidden'
      }}
      aria-hidden="true"
    >
      <div id="yt-audio-mount" />
    </div>
  );

  if (variant === 'navbar') {
    return (
      <>
        <button
          onClick={togglePlay}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-sans font-medium transition-all duration-300 cursor-pointer select-none ${
            isPlaying 
              ? 'bg-amber-500/20 text-amber-300 border border-amber-400/50 shadow-inner' 
              : 'bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white border border-white/10'
          }`}
          title={isPlaying ? "Tắt nhạc nền: Mong Ước Kỷ Niệm Xưa" : "Bật giai điệu thanh xuân: Mong Ước Kỷ Niệm Xưa"}
        >
          {isBuffering ? (
            <Loader2 className="w-3.5 h-3.5 text-amber-400 animate-spin" />
          ) : isPlaying ? (
            <div className="flex gap-0.5 items-center h-3">
              <span className="w-0.5 h-3 bg-amber-400 block rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
              <span className="w-0.5 h-4 bg-amber-400 block rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
              <span className="w-0.5 h-2 bg-amber-400 block rounded-full animate-bounce" style={{ animationDelay: '0.5s' }} />
            </div>
          ) : (
            <Music className="w-3.5 h-3.5 text-amber-400" />
          )}
          <span className="text-[11px] font-sans font-semibold hidden md:inline">
            {isBuffering ? "Đang kết nối..." : isPlaying ? "Đang phát nhạc" : "Nhạc nền"}
          </span>
        </button>

        {renderHiddenPlayer()}
      </>
    );
  }

  // Floating variant
  return (
    <>
      <div id="audio-player-container" className="fixed top-3 right-3 z-50 flex items-center">
        <button
          id="btn-toggle-audio"
          onClick={togglePlay}
          className="flex items-center gap-2 border border-slate-700 rounded-full px-3 py-1.5 bg-[#1E293B]/90 shadow-md backdrop-blur-md hover:border-amber-400 transition-all cursor-pointer group active:scale-95 text-xs text-amber-200"
          title={isPlaying ? "Tắt giai điệu hoài niệm" : "Lắng nghe giai điệu: Mong Ước Kỷ Niệm Xưa"}
        >
          {isBuffering ? (
            <Loader2 className="w-3.5 h-3.5 text-amber-400 animate-spin" />
          ) : (
            <Music className="w-3.5 h-3.5 text-amber-400" />
          )}
          <span className="text-[10px] uppercase tracking-wider font-sans font-bold">
            {isBuffering ? "Đang tải..." : isPlaying ? "Đang phát: Mong Ước Kỷ Niệm Xưa" : "Nhạc nền: Mong Ước Kỷ Niệm Xưa"}
          </span>
        </button>
      </div>

      {renderHiddenPlayer()}
    </>
  );
}
