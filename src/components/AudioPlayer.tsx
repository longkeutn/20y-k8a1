import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Music, Loader2, ListMusic, Play, Pause, SkipForward, SkipBack, Volume2, VolumeX } from 'lucide-react';
import { MusicTrack } from '../types';
import { DEFAULT_PLAYLIST } from '../data';
import MusicPlaylistModal from './MusicPlaylistModal';

interface AudioPlayerProps {
  customAudioUrl?: string;
  variant?: 'navbar' | 'floating' | 'hidden';
  playlist?: MusicTrack[];
  currentTrackIndex?: number;
  onTrackChange?: (index: number) => void;
  isAdmin?: boolean;
}

declare global {
  interface Window {
    onYouTubeIframeAPIReady?: () => void;
    YT?: any;
  }
}

// Trích xuất YouTube Video ID từ link thông dụng (gồm cả youtu.be, shorts, v=...)
export function extractYouTubeVideoId(url: string): string {
  if (!url) return 'ocvlV5LZ93Q';
  const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ \s]{11})/i);
  return match ? match[1] : 'ocvlV5LZ93Q';
}

// Trích xuất file ID từ link Google Drive
export function extractDriveFileId(url: string): string | null {
  if (!url) return null;
  const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
}

// Chuyển đổi link Drive sang link stream âm thanh
export function getDriveAudioStreamUrl(url: string): string {
  const fileId = extractDriveFileId(url);
  if (!fileId) return url;
  return `https://docs.google.com/uc?export=download&id=${fileId}`;
}

// Tự động nạp YouTube IFrame API script an toàn, tránh chèn trùng lặp
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

export default function AudioPlayer({
  customAudioUrl,
  variant = 'navbar',
  playlist = DEFAULT_PLAYLIST,
  currentTrackIndex: propIndex,
  onTrackChange,
  isAdmin = false
}: AudioPlayerProps) {
  // Quản lý danh sách bài hát cục bộ
  const [internalPlaylist, setInternalPlaylist] = useState<MusicTrack[]>(playlist && playlist.length > 0 ? playlist : DEFAULT_PLAYLIST);
  const [currentIndex, setCurrentIndex] = useState<number>(propIndex ?? 0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isBuffering, setIsBuffering] = useState<boolean>(false);
  const [isReady, setIsReady] = useState<boolean>(false);
  const [isShuffled, setIsShuffled] = useState<boolean>(false);
  const [repeatMode, setRepeatMode] = useState<'all' | 'one' | 'off'>('all');
  const [volume, setVolume] = useState<number>(85);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Sync khi prop playlist thay đổi
  useEffect(() => {
    if (playlist && playlist.length > 0) {
      setInternalPlaylist(playlist);
    }
  }, [playlist]);

  // Sync khi propIndex thay đổi
  useEffect(() => {
    if (typeof propIndex === 'number' && propIndex >= 0 && propIndex < internalPlaylist.length) {
      setCurrentIndex(propIndex);
    }
  }, [propIndex, internalPlaylist.length]);

  const currentTrack: MusicTrack = internalPlaylist[currentIndex] || internalPlaylist[0] || {
    id: 'default',
    title: 'Mong Ước Kỷ Niệm Xưa',
    artist: 'Tam Ca 3A',
    sourceType: 'youtube',
    url: customAudioUrl || 'https://youtu.be/ocvlV5LZ93Q'
  };

  const isYouTube = currentTrack.sourceType === 'youtube' || !currentTrack.sourceType || currentTrack.url.includes('youtu');
  const videoId = extractYouTubeVideoId(currentTrack.url);

  const playerRef = useRef<any>(null);
  const audioTagRef = useRef<HTMLAudioElement | null>(null);
  const pendingPlayRef = useRef<boolean>(false);
  const mountWrapperRef = useRef<HTMLDivElement | null>(null);

  // Đồng bộ âm lượng
  useEffect(() => {
    if (audioTagRef.current) {
      audioTagRef.current.volume = volume / 100;
    }
    if (playerRef.current && typeof playerRef.current.setVolume === 'function') {
      try {
        playerRef.current.setVolume(volume);
      } catch (e) {}
    }
  }, [volume]);

  // Xử lý chuyển bài kế tiếp
  const handleNextTrack = useCallback(() => {
    if (internalPlaylist.length <= 1) {
      // Chỉ có 1 bài, phát lại từ đầu
      if (isYouTube && playerRef.current && typeof playerRef.current.seekTo === 'function') {
        playerRef.current.seekTo(0);
        playerRef.current.playVideo();
      } else if (audioTagRef.current) {
        audioTagRef.current.currentTime = 0;
        audioTagRef.current.play().catch(() => {});
      }
      return;
    }

    let nextIdx = currentIndex + 1;
    if (isShuffled) {
      nextIdx = Math.floor(Math.random() * internalPlaylist.length);
      if (nextIdx === currentIndex && internalPlaylist.length > 1) {
        nextIdx = (currentIndex + 1) % internalPlaylist.length;
      }
    } else if (nextIdx >= internalPlaylist.length) {
      nextIdx = repeatMode === 'off' ? 0 : 0;
      if (repeatMode === 'off') {
        setIsPlaying(false);
        return;
      }
    }

    setCurrentIndex(nextIdx);
    if (onTrackChange) onTrackChange(nextIdx);
    pendingPlayRef.current = true;
  }, [currentIndex, internalPlaylist.length, isShuffled, repeatMode, isYouTube, onTrackChange]);

  // Xử lý chuyển bài trước đó
  const handlePrevTrack = useCallback(() => {
    let prevIdx = currentIndex - 1;
    if (prevIdx < 0) {
      prevIdx = internalPlaylist.length - 1;
    }
    setCurrentIndex(prevIdx);
    if (onTrackChange) onTrackChange(prevIdx);
    pendingPlayRef.current = true;
  }, [currentIndex, internalPlaylist.length, onTrackChange]);

  // Chọn trực tiếp 1 bài từ modal
  const handleSelectTrack = useCallback((index: number) => {
    if (index >= 0 && index < internalPlaylist.length) {
      setCurrentIndex(index);
      if (onTrackChange) onTrackChange(index);
      pendingPlayRef.current = true;
      setIsPlaying(true);
    }
  }, [internalPlaylist.length, onTrackChange]);

  // Khởi tạo YouTube IFrame Player (Chỉ phát tiếng, ẩn 100% video)
  useEffect(() => {
    if (!isYouTube) {
      // Dừng YouTube nếu chuyển sang file Audio trực tiếp
      if (playerRef.current && typeof playerRef.current.pauseVideo === 'function') {
        try { playerRef.current.pauseVideo(); } catch (e) {}
      }
      return;
    }

    let isCancelled = false;

    loadYouTubeIframeApi().then((YT) => {
      if (isCancelled || !YT || !YT.Player || !mountWrapperRef.current) return;

      try {
        let mountEl = mountWrapperRef.current.querySelector('#yt-audio-mount') as HTMLElement | null;
        if (!mountEl) {
          mountEl = document.createElement('div');
          mountEl.id = 'yt-audio-mount';
          mountWrapperRef.current.appendChild(mountEl);
        }

        if (playerRef.current && typeof playerRef.current.destroy === 'function') {
          try { playerRef.current.destroy(); } catch (e) {}
          playerRef.current = null;
        }

        playerRef.current = new YT.Player(mountEl, {
          height: '1',
          width: '1',
          videoId: videoId,
          playerVars: {
            autoplay: pendingPlayRef.current ? 1 : 0,
            controls: 0,
            disablekb: 1,
            fs: 0,
            iv_load_policy: 3,
            loop: repeatMode === 'one' ? 1 : 0,
            playlist: repeatMode === 'one' ? videoId : undefined,
            playsinline: 1,
            rel: 0,
            modestbranding: 1
          },
          events: {
            onReady: (event: any) => {
              if (isCancelled) return;
              setIsReady(true);
              try { event.target.setVolume(volume); } catch (e) {}

              if (pendingPlayRef.current || isPlaying) {
                try { event.target.playVideo(); } catch (e) {}
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
                // Hết bài
                if (repeatMode === 'one') {
                  try {
                    event.target.seekTo(0);
                    event.target.playVideo();
                  } catch (e) {}
                } else {
                  handleNextTrack();
                }
              } else if (event.data === 3) {
                setIsBuffering(true);
              }
            },
            onError: (err: any) => {
              console.warn('YouTube Audio Player error:', err);
              if (!isCancelled) {
                setIsBuffering(false);
                // Thử chuyển bài tiếp theo nếu video lỗi
                handleNextTrack();
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
    };
  }, [videoId, isYouTube, repeatMode, handleNextTrack, volume]);

  // Quản lý thẻ <audio> cho Drive / Direct MP3
  useEffect(() => {
    if (isYouTube) {
      if (audioTagRef.current) {
        audioTagRef.current.pause();
      }
      return;
    }

    const audio = audioTagRef.current;
    if (!audio) return;

    const streamUrl = getDriveAudioStreamUrl(currentTrack.url);
    audio.src = streamUrl;
    audio.volume = volume / 100;
    audio.loop = repeatMode === 'one';

    if (isPlaying || pendingPlayRef.current) {
      audio.play().catch((err) => {
        console.warn('Audio tag autoplay blocked:', err);
      });
      pendingPlayRef.current = false;
    }
  }, [currentTrack.url, isYouTube, repeatMode, volume]);

  // Lắng nghe Custom Events toàn hệ thống
  useEffect(() => {
    const handlePauseBgMusic = () => {
      if (playerRef.current && typeof playerRef.current.pauseVideo === 'function') {
        try { playerRef.current.pauseVideo(); } catch (e) {}
      }
      if (audioTagRef.current) {
        audioTagRef.current.pause();
      }
      setIsPlaying(false);
      setIsBuffering(false);
    };

    const handlePlayMusic = (e: CustomEvent) => {
      if (e.detail && typeof e.detail.index === 'number') {
        handleSelectTrack(e.detail.index);
      } else {
        if (isYouTube && playerRef.current && typeof playerRef.current.playVideo === 'function') {
          playerRef.current.playVideo();
        } else if (audioTagRef.current) {
          audioTagRef.current.play().catch(() => {});
        }
        setIsPlaying(true);
      }
    };

    const handleNextMusic = () => handleNextTrack();
    const handlePrevMusic = () => handlePrevTrack();
    const handleOpenModal = () => setIsModalOpen(true);

    window.addEventListener('pause-bg-music', handlePauseBgMusic);
    window.addEventListener('k8a1-play-music' as any, handlePlayMusic);
    window.addEventListener('k8a1-next-music' as any, handleNextMusic);
    window.addEventListener('k8a1-prev-music' as any, handlePrevMusic);
    window.addEventListener('open-music-modal' as any, handleOpenModal);

    return () => {
      window.removeEventListener('pause-bg-music', handlePauseBgMusic);
      window.removeEventListener('k8a1-play-music' as any, handlePlayMusic);
      window.removeEventListener('k8a1-next-music' as any, handleNextMusic);
      window.removeEventListener('k8a1-prev-music' as any, handlePrevMusic);
      window.removeEventListener('open-music-modal' as any, handleOpenModal);
    };
  }, [handleNextTrack, handlePrevTrack, handleSelectTrack, isYouTube]);

  // Xử lý nút bấm Bật / Tắt nhạc
  const togglePlay = useCallback(() => {
    if (isPlaying) {
      if (isYouTube && playerRef.current && typeof playerRef.current.pauseVideo === 'function') {
        try { playerRef.current.pauseVideo(); } catch (e) {}
      } else if (audioTagRef.current) {
        audioTagRef.current.pause();
      }
      setIsPlaying(false);
      setIsBuffering(false);
      pendingPlayRef.current = false;
    } else {
      if (isYouTube) {
        if (isReady && playerRef.current && typeof playerRef.current.playVideo === 'function') {
          try { playerRef.current.playVideo(); } catch (e) {}
          setIsBuffering(true);
        } else {
          pendingPlayRef.current = true;
          setIsBuffering(true);
        }
      } else if (audioTagRef.current) {
        audioTagRef.current.play().catch(() => {});
        setIsPlaying(true);
      }
    }
  }, [isPlaying, isReady, isYouTube]);

  // Thêm bài hát vào playlist
  const handleAddTrack = (newTrack: MusicTrack) => {
    const updated = [...internalPlaylist, newTrack];
    setInternalPlaylist(updated);
    // Tự động chuyển sang bài vừa thêm và phát
    const newIdx = updated.length - 1;
    setCurrentIndex(newIdx);
    if (onTrackChange) onTrackChange(newIdx);
    pendingPlayRef.current = true;
    setIsPlaying(true);
  };

  // Xóa bài hát khỏi playlist
  const handleRemoveTrack = (trackId: string) => {
    if (internalPlaylist.length <= 1) {
      alert('Playlist cần giữ lại ít nhất 1 bài hát!');
      return;
    }
    const updated = internalPlaylist.filter(t => t.id !== trackId);
    setInternalPlaylist(updated);
    if (currentIndex >= updated.length) {
      setCurrentIndex(0);
    }
  };

  // Render player ẩn
  const renderHiddenEngines = () => (
    <>
      {/* Vùng nhúng YouTube IFrame 1x1 ẩn */}
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

      {/* Thẻ audio cho Drive / MP3 link */}
      <audio
        ref={audioTagRef}
        onEnded={() => {
          if (repeatMode === 'one') {
            if (audioTagRef.current) {
              audioTagRef.current.currentTime = 0;
              audioTagRef.current.play().catch(() => {});
            }
          } else {
            handleNextTrack();
          }
        }}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        style={{ display: 'none' }}
      />
    </>
  );

  if (variant === 'hidden') {
    return (
      <>
        {renderHiddenEngines()}
        <MusicPlaylistModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          playlist={internalPlaylist}
          currentTrackIndex={currentIndex}
          isPlaying={isPlaying}
          isShuffled={isShuffled}
          repeatMode={repeatMode}
          volume={volume}
          onSelectTrack={handleSelectTrack}
          onTogglePlay={togglePlay}
          onNextTrack={handleNextTrack}
          onPrevTrack={handlePrevTrack}
          onToggleShuffle={() => setIsShuffled(!isShuffled)}
          onToggleRepeat={() => {
            const modes: ('all' | 'one' | 'off')[] = ['all', 'one', 'off'];
            const curIdx = modes.indexOf(repeatMode);
            setRepeatMode(modes[(curIdx + 1) % modes.length]);
          }}
          onVolumeChange={(v) => setVolume(v)}
          onAddTrack={handleAddTrack}
          onRemoveTrack={handleRemoveTrack}
          isAdmin={isAdmin}
        />
      </>
    );
  }

  if (variant === 'navbar') {
    return (
      <>
        <div className="flex items-center gap-1 bg-white/10 hover:bg-white/15 border border-white/10 rounded-full p-0.5 transition-all">
          {/* Nút Play / Pause */}
          <button
            onClick={togglePlay}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-sans font-medium transition-all duration-300 cursor-pointer select-none ${
              isPlaying 
                ? 'bg-amber-500/25 text-amber-300 border border-amber-400/50 shadow-inner' 
                : 'text-slate-300 hover:text-white'
            }`}
            title={isPlaying ? `Đang phát: ${currentTrack.title}. Bấm để tạm dừng` : `Bật nhạc: ${currentTrack.title}`}
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
            <span className="text-[11px] font-sans font-semibold max-w-[110px] md:max-w-[140px] truncate">
              {isBuffering ? "Đang kết nối..." : currentTrack.title}
            </span>
          </button>

          {/* Nút mở Modal Playlist */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="p-1.5 text-slate-400 hover:text-amber-300 hover:bg-white/10 rounded-full transition-all cursor-pointer"
            title={`Mở danh sách ${internalPlaylist.length} bài hát`}
          >
            <ListMusic className="w-3.5 h-3.5" />
          </button>
        </div>

        {renderHiddenEngines()}

        <MusicPlaylistModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          playlist={internalPlaylist}
          currentTrackIndex={currentIndex}
          isPlaying={isPlaying}
          isShuffled={isShuffled}
          repeatMode={repeatMode}
          volume={volume}
          onSelectTrack={handleSelectTrack}
          onTogglePlay={togglePlay}
          onNextTrack={handleNextTrack}
          onPrevTrack={handlePrevTrack}
          onToggleShuffle={() => setIsShuffled(!isShuffled)}
          onToggleRepeat={() => {
            const modes: ('all' | 'one' | 'off')[] = ['all', 'one', 'off'];
            const curIdx = modes.indexOf(repeatMode);
            setRepeatMode(modes[(curIdx + 1) % modes.length]);
          }}
          onVolumeChange={(v) => setVolume(v)}
          onAddTrack={handleAddTrack}
          onRemoveTrack={handleRemoveTrack}
          isAdmin={isAdmin}
        />
      </>
    );
  }

  // Floating variant
  return (
    <>
      <div id="audio-player-container" className="fixed top-3 right-3 z-50 flex items-center gap-1.5">
        <div className="flex items-center gap-1 border border-slate-700/80 rounded-full pl-3 pr-1.5 py-1 bg-[#1E293B]/95 shadow-xl backdrop-blur-md hover:border-amber-400/60 transition-all">
          <button
            id="btn-toggle-audio"
            onClick={togglePlay}
            className="flex items-center gap-2 cursor-pointer group active:scale-95 text-xs text-amber-200"
            title={isPlaying ? `Tạm dừng: ${currentTrack.title}` : `Phát: ${currentTrack.title}`}
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
            <span className="text-[10px] uppercase tracking-wider font-sans font-bold max-w-[130px] truncate">
              {isBuffering ? "Đang tải..." : currentTrack.title}
            </span>
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="p-1 rounded-full text-slate-400 hover:text-amber-300 hover:bg-slate-700/60 transition-all cursor-pointer ml-1"
            title="Mở Playlist nhạc"
          >
            <ListMusic className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {renderHiddenEngines()}

      <MusicPlaylistModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        playlist={internalPlaylist}
        currentTrackIndex={currentIndex}
        isPlaying={isPlaying}
        isShuffled={isShuffled}
        repeatMode={repeatMode}
        volume={volume}
        onSelectTrack={handleSelectTrack}
        onTogglePlay={togglePlay}
        onNextTrack={handleNextTrack}
        onPrevTrack={handlePrevTrack}
        onToggleShuffle={() => setIsShuffled(!isShuffled)}
        onToggleRepeat={() => {
          const modes: ('all' | 'one' | 'off')[] = ['all', 'one', 'off'];
          const curIdx = modes.indexOf(repeatMode);
          setRepeatMode(modes[(curIdx + 1) % modes.length]);
        }}
        onVolumeChange={(v) => setVolume(v)}
        onAddTrack={handleAddTrack}
        onRemoveTrack={handleRemoveTrack}
        isAdmin={isAdmin}
      />
    </>
  );
}
