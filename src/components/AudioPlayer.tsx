import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Music, Loader2, ListMusic, Play, Pause, SkipForward, SkipBack, Volume2, VolumeX } from 'lucide-react';
import { MusicTrack } from '../types';
import { DEFAULT_PLAYLIST } from '../data';
import MusicPlaylistModal from './MusicPlaylistModal';
import { saveOfflineTrackFile, loadAllOfflineTracks, deleteOfflineTrack } from '../utils/offlineStorage';

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

// Trích xuất YouTube Video ID từ link thông dụng (gồm cả youtu.be, shorts, live, embed, music.youtube, v=...)
export function extractYouTubeVideoId(url: string): string {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();

  // 1. Nếu dán trực tiếp 11 ký tự Video ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  // 2. Nhận diện các định dạng link YouTube thông dụng
  const patterns = [
    /(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:embed\/|v\/|shorts\/|live\/))([a-zA-Z0-9_-]{11})/i,
    /[?&]v=([a-zA-Z0-9_-]{11})/i
  ];

  for (const regex of patterns) {
    const match = trimmed.match(regex);
    if (match && match[1]) {
      return match[1];
    }
  }

  return '';
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

    const prevOnReady = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (typeof prevOnReady === 'function') {
        try { prevOnReady(); } catch (e) {}
      }
      if (window.YT && window.YT.Player) {
        resolve(window.YT);
      }
    };

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
  const [repeatMode, setRepeatMode] = useState<'all' | 'one' | 'off'>(() => {
    try {
      const saved = localStorage.getItem('k8a1_music_repeat_mode');
      if (saved === 'all' || saved === 'one' || saved === 'off') return saved;
    } catch {}
    return 'all';
  });
  const [volume, setVolume] = useState<number>(85);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isOnline, setIsOnline] = useState<boolean>(() => typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [offlineNotice, setOfflineNotice] = useState<string>('');

  // Thay đổi chế độ lặp và lưu vào localStorage
  const handleToggleRepeat = useCallback(() => {
    const modes: ('all' | 'one' | 'off')[] = ['all', 'one', 'off'];
    const curIdx = modes.indexOf(repeatMode);
    const nextMode = modes[(curIdx + 1) % modes.length];
    setRepeatMode(nextMode);
    try {
      localStorage.setItem('k8a1_music_repeat_mode', nextMode);
    } catch {}
  }, [repeatMode]);

  // Nạp toàn bộ các ca khúc offline đã lưu trong IndexedDB vào playlist
  useEffect(() => {
    loadAllOfflineTracks().then((offlineTracks) => {
      if (offlineTracks && offlineTracks.length > 0) {
        setInternalPlaylist((prev) => {
          const existingIds = new Set(prev.map(t => t.id));
          const toAdd = offlineTracks.filter(t => !existingIds.has(t.id));
          return [...prev, ...toAdd];
        });
      }
    }).catch((e) => console.warn('Lỗi nạp bài hát offline:', e));
  }, []);

  // Theo dõi trạng thái mạng Internet
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setOfflineNotice('✅ Đã kết nối Internet trở lại!');
      setTimeout(() => setOfflineNotice(''), 4000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setOfflineNotice('⚠️ Mất kết nối mạng! Hệ thống đang kích hoạt chế độ dự phòng Offline.');
      
      // Nếu đang phát bài YouTube trực tuyến mà mất mạng, kiểm tra xem có bài Offline lưu sẵn trong máy không
      const cur = internalPlaylistRef.current[currentIndexRef.current];
      const isCurYt = cur && (cur.sourceType === 'youtube' || (!cur.sourceType && !cur.url.includes('drive.google.com') && !cur.url.endsWith('.mp3'))) && !cur.isOffline && cur.sourceType !== 'offline' && !cur.url.startsWith('blob:');
      
      if (isCurYt && isPlayingRef.current) {
        const offlineIdx = internalPlaylistRef.current.findIndex(t => t.sourceType === 'offline' || t.isOffline);
        if (offlineIdx !== -1) {
          setOfflineNotice(`⚠️ Mất kết nối Internet! Tự động chuyển sang bài "${internalPlaylistRef.current[offlineIdx].title}" lưu trên máy.`);
          setTimeout(() => {
            handleSelectTrack(offlineIdx);
          }, 800);
        } else {
          setOfflineNotice('⚠️ Mất mạng Internet! Bạn có thể bấm "Nạp file MP3 từ máy tính" để phát không cần mạng.');
        }
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Sync khi prop playlist thay đổi
  useEffect(() => {
    if (playlist && playlist.length > 0) {
      setInternalPlaylist((prev) => {
        // Giữ lại các ca khúc offline đã thêm
        const offlineTracks = prev.filter(t => t.isOffline || t.sourceType === 'offline');
        const existingIds = new Set(playlist.map(t => t.id));
        const customPreserved = offlineTracks.filter(t => !existingIds.has(t.id));
        return [...playlist, ...customPreserved];
      });
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

  const isYouTube = (currentTrack.sourceType === 'youtube' || (!currentTrack.sourceType && !currentTrack.url.includes('drive.google.com') && !currentTrack.url.endsWith('.mp3'))) && !currentTrack.isOffline && currentTrack.sourceType !== 'offline' && !currentTrack.url.startsWith('blob:');
  const videoId = isYouTube ? extractYouTubeVideoId(currentTrack.url) : '';

  const playerRef = useRef<any>(null);
  const isPlayerReadyRef = useRef<boolean>(false);
  const lastLoadedVideoIdRef = useRef<string>('');
  const audioTagRef = useRef<HTMLAudioElement | null>(null);
  const pendingPlayRef = useRef<boolean>(false);
  const mountWrapperRef = useRef<HTMLDivElement | null>(null);
  const consecutiveErrorsRef = useRef<number>(0);

  const volumeRef = useRef<number>(volume);
  const repeatModeRef = useRef<'all' | 'one' | 'off'>(repeatMode);
  const isShuffledRef = useRef<boolean>(isShuffled);
  const currentIndexRef = useRef<number>(currentIndex);
  const internalPlaylistRef = useRef<MusicTrack[]>(internalPlaylist);
  const isPlayingRef = useRef<boolean>(isPlaying);
  const currentTrackRef = useRef<MusicTrack>(currentTrack);
  const handleNextTrackRef = useRef<(isManual?: boolean) => void>(() => {});

  useEffect(() => { volumeRef.current = volume; }, [volume]);
  useEffect(() => { repeatModeRef.current = repeatMode; }, [repeatMode]);
  useEffect(() => { isShuffledRef.current = isShuffled; }, [isShuffled]);
  useEffect(() => { currentIndexRef.current = currentIndex; }, [currentIndex]);
  useEffect(() => { internalPlaylistRef.current = internalPlaylist; }, [internalPlaylist]);
  useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);
  useEffect(() => { currentTrackRef.current = currentTrack; }, [currentTrack]);

  // Đồng bộ âm lượng
  useEffect(() => {
    if (audioTagRef.current) {
      audioTagRef.current.volume = volume / 100;
    }
    if (playerRef.current && isPlayerReadyRef.current && typeof playerRef.current.setVolume === 'function') {
      try {
        playerRef.current.setVolume(volume);
      } catch (e) {}
    }
  }, [volume]);

  // Xử lý chuyển bài kế tiếp (isManual = true khi người dùng bấm nút Next trên UI, false khi tự động hết bài)
  const handleNextTrack = useCallback((isManual = false) => {
    const list = internalPlaylistRef.current;
    if (list.length <= 1) {
      // Chỉ có 1 bài, phát lại từ đầu
      if (isYouTube && playerRef.current && isPlayerReadyRef.current && typeof playerRef.current.seekTo === 'function') {
        try {
          playerRef.current.seekTo(0);
          playerRef.current.playVideo();
          setIsPlaying(true);
        } catch (e) {}
      } else if (audioTagRef.current) {
        audioTagRef.current.currentTime = 0;
        audioTagRef.current.play().catch(() => {});
        setIsPlaying(true);
      }
      return;
    }

    let nextIdx = currentIndexRef.current + 1;
    if (isShuffledRef.current) {
      nextIdx = Math.floor(Math.random() * list.length);
      if (nextIdx === currentIndexRef.current && list.length > 1) {
        nextIdx = (currentIndexRef.current + 1) % list.length;
      }
    } else if (nextIdx >= list.length) {
      // ĐÃ ĐẾN CUỐI DANH SÁCH:
      if (!isManual && repeatModeRef.current === 'off') {
        // Tự động hết bài ở chế độ "Không lặp":
        // Dừng phát nhạc và đưa con trỏ về Bài 1 (đầu danh sách) ở trạng thái chờ sẵn
        setIsPlaying(false);
        setIsBuffering(false);
        pendingPlayRef.current = false;
        setCurrentIndex(0);
        currentIndexRef.current = 0;
        if (onTrackChange) onTrackChange(0);
        window.dispatchEvent(new CustomEvent('k8a1-track-changed', { detail: { index: 0, track: list[0] } }));
        return;
      }
      // Người dùng chủ động bấm nút Next HOẶC chế độ lặp toàn bộ (repeatMode === 'all'):
      // Luôn luôn quay vòng về bài đầu tiên (Bài 1)
      nextIdx = 0;
    }

    currentIndexRef.current = nextIdx;
    setCurrentIndex(nextIdx);
    if (onTrackChange) onTrackChange(nextIdx);
    window.dispatchEvent(new CustomEvent('k8a1-track-changed', { detail: { index: nextIdx, track: list[nextIdx] } }));
    pendingPlayRef.current = true;
    setIsPlaying(true);
    setIsBuffering(true);
  }, [isYouTube, onTrackChange]);

  useEffect(() => {
    handleNextTrackRef.current = handleNextTrack;
  }, [handleNextTrack]);

  // Xử lý chuyển bài trước đó
  const handlePrevTrack = useCallback(() => {
    const list = internalPlaylistRef.current;
    let prevIdx = currentIndexRef.current - 1;
    if (prevIdx < 0) {
      prevIdx = list.length - 1;
    }
    currentIndexRef.current = prevIdx;
    setCurrentIndex(prevIdx);
    if (onTrackChange) onTrackChange(prevIdx);
    window.dispatchEvent(new CustomEvent('k8a1-track-changed', { detail: { index: prevIdx, track: list[prevIdx] } }));
    pendingPlayRef.current = true;
    setIsPlaying(true);
    setIsBuffering(true);
  }, [onTrackChange]);

  // Chọn trực tiếp 1 bài từ modal
  const handleSelectTrack = useCallback((index: number) => {
    const list = internalPlaylistRef.current;
    if (index >= 0 && index < list.length) {
      consecutiveErrorsRef.current = 0;
      currentIndexRef.current = index;
      setCurrentIndex(index);
      if (onTrackChange) onTrackChange(index);
      window.dispatchEvent(new CustomEvent('k8a1-track-changed', { detail: { index: index, track: list[index] } }));
      pendingPlayRef.current = true;
      setIsPlaying(true);
      setIsBuffering(true);
    }
  }, [onTrackChange]);

  // Khởi tạo YouTube IFrame Player (Chạy duy nhất 1 lần, tuyệt đối không destroy rồi tạo lại)
  useEffect(() => {
    let isCancelled = false;

    loadYouTubeIframeApi().then((YT) => {
      if (isCancelled || !YT || !YT.Player || !mountWrapperRef.current) return;
      if (playerRef.current) return;

      try {
        let mountEl = mountWrapperRef.current.querySelector('#yt-audio-mount') as HTMLElement | null;
        if (!mountEl) {
          mountEl = document.createElement('div');
          mountEl.id = 'yt-audio-mount';
          mountWrapperRef.current.appendChild(mountEl);
        }

        const initialVideoId = videoId || 'ocvlV5LZ93Q';
        lastLoadedVideoIdRef.current = initialVideoId;

        playerRef.current = new YT.Player(mountEl, {
          height: '180',
          width: '320',
          videoId: initialVideoId,
          playerVars: {
            autoplay: 0,
            controls: 0,
            disablekb: 1,
            fs: 0,
            iv_load_policy: 3,
            playsinline: 1,
            rel: 0,
            modestbranding: 1
          },
          events: {
            onReady: (event: any) => {
              if (isCancelled) return;
              isPlayerReadyRef.current = true;
              setIsReady(true);
              try { event.target.setVolume(volumeRef.current); } catch (e) {}

              if (pendingPlayRef.current || isPlayingRef.current) {
                try {
                  event.target.playVideo();
                } catch (e) {}
                pendingPlayRef.current = false;
              }
            },
            onStateChange: (event: any) => {
              if (isCancelled) return;
              // 1: PLAYING, 2: PAUSED, 0: ENDED, 3: BUFFERING, -1: UNSTARTED
              if (event.data === 1) {
                setIsPlaying(true);
                setIsBuffering(false);
                consecutiveErrorsRef.current = 0; // Đã phát mượt mà -> reset bộ đếm lỗi
              } else if (event.data === 2) {
                setIsPlaying(false);
                setIsBuffering(false);
              } else if (event.data === 0) {
                setIsBuffering(false);
                if (repeatModeRef.current === 'one') {
                  try {
                    event.target.seekTo(0);
                    event.target.playVideo();
                  } catch (e) {}
                } else {
                  if (handleNextTrackRef.current) {
                    handleNextTrackRef.current(false);
                  }
                }
              } else if (event.data === 3) {
                setIsBuffering(true);
              }
            },
            onError: (err: any) => {
              console.warn('[YouTube Audio Player] Mã lỗi YouTube:', err?.data, 'videoId:', lastLoadedVideoIdRef.current);
              if (isCancelled) return;
              setIsBuffering(false);

              consecutiveErrorsRef.current += 1;
              const maxAllowed = Math.min(internalPlaylistRef.current.length, 3);

              if (consecutiveErrorsRef.current < maxAllowed && internalPlaylistRef.current.length > 1) {
                console.warn(`[YouTube Audio Player] Bài bị lỗi/hạn chế bản quyền phát nhúng. Tự động chuyển bài tiếp theo (${consecutiveErrorsRef.current}/${maxAllowed})...`);
                setTimeout(() => {
                  if (handleNextTrackRef.current) {
                    handleNextTrackRef.current(false);
                  }
                }, 600);
              } else {
                console.warn('[YouTube Audio Player] Dừng phát do các bài hát liên tiếp bị hạn chế bản quyền YouTube.');
                consecutiveErrorsRef.current = 0;
                setIsPlaying(false);
                pendingPlayRef.current = false;
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
  }, []);

  // Điều khiển nạp và phát bài hát khi videoId hoặc nguồn phát thay đổi
  useEffect(() => {
    if (!isYouTube) {
      if (playerRef.current && isPlayerReadyRef.current && typeof playerRef.current.pauseVideo === 'function') {
        try { playerRef.current.pauseVideo(); } catch (e) {}
      }
      return;
    }

    if (!videoId) {
      console.warn('[AudioPlayer] Link YouTube không trích xuất được Video ID:', currentTrack.url);
      setIsBuffering(false);
      return;
    }

    if (playerRef.current && isPlayerReadyRef.current) {
      if (lastLoadedVideoIdRef.current !== videoId) {
        lastLoadedVideoIdRef.current = videoId;
        try {
          if (isPlaying || pendingPlayRef.current) {
            setIsBuffering(true);
            playerRef.current.loadVideoById(videoId);
            pendingPlayRef.current = false;
          } else {
            playerRef.current.cueVideoById(videoId);
          }
        } catch (e) {
          console.warn('[AudioPlayer] Lỗi khi nạp video YouTube:', e);
        }
      } else {
        if (isPlaying || pendingPlayRef.current) {
          try {
            playerRef.current.playVideo();
            pendingPlayRef.current = false;
          } catch (e) {}
        }
      }
    } else {
      lastLoadedVideoIdRef.current = videoId;
    }
  }, [videoId, isYouTube, isPlaying, currentTrack.url]);

  // Quản lý thẻ <audio> cho Drive / Direct MP3 / File Offline
  useEffect(() => {
    if (isYouTube) {
      if (audioTagRef.current) {
        audioTagRef.current.pause();
      }
      return;
    }

    const audio = audioTagRef.current;
    if (!audio) return;

    const streamUrl = (currentTrack.sourceType === 'offline' || currentTrack.isOffline || currentTrack.url.startsWith('blob:'))
      ? currentTrack.url
      : getDriveAudioStreamUrl(currentTrack.url);

    if (audio.src !== streamUrl) {
      audio.src = streamUrl;
      audio.load();
    }
    audio.volume = volume / 100;
    audio.loop = repeatMode === 'one';

    if (isPlaying || pendingPlayRef.current) {
      audio.play().catch((err) => {
        console.warn('Audio tag autoplay blocked:', err);
      });
      pendingPlayRef.current = false;
    }
  }, [currentTrack.url, isYouTube, repeatMode, volume, isPlaying, currentTrack.sourceType, currentTrack.isOffline]);

  // Lắng nghe Custom Events toàn hệ thống
  useEffect(() => {
    const handlePauseBgMusic = () => {
      if (playerRef.current && isPlayerReadyRef.current && typeof playerRef.current.pauseVideo === 'function') {
        try { playerRef.current.pauseVideo(); } catch (e) {}
      }
      if (audioTagRef.current) {
        audioTagRef.current.pause();
      }
      setIsPlaying(false);
      setIsBuffering(false);
      pendingPlayRef.current = false;
    };

    const handlePlayMusic = (e: CustomEvent) => {
      if (e.detail && typeof e.detail.index === 'number') {
        handleSelectTrack(e.detail.index);
      } else {
        if (isYouTube && playerRef.current && isPlayerReadyRef.current && typeof playerRef.current.playVideo === 'function') {
          playerRef.current.playVideo();
        } else if (audioTagRef.current) {
          audioTagRef.current.play().catch(() => {});
        }
        setIsPlaying(true);
      }
    };

    const handleNextMusic = () => handleNextTrack(true);
    const handlePrevMusic = () => handlePrevTrack();
    const handleOpenModal = () => setIsModalOpen(true);
    const handleOfflineTrackAdded = (e: any) => {
      if (e.detail?.track) {
        const track = e.detail.track;
        setInternalPlaylist((prev) => {
          if (prev.some(t => t.id === track.id)) return prev;
          return [...prev, track];
        });
        setOfflineNotice(`✅ Đã lưu bài Offline: "${track.title}"`);
        setTimeout(() => setOfflineNotice(''), 5000);
      }
    };

    window.addEventListener('pause-bg-music', handlePauseBgMusic);
    window.addEventListener('k8a1-play-music' as any, handlePlayMusic);
    window.addEventListener('k8a1-next-music' as any, handleNextMusic);
    window.addEventListener('k8a1-prev-music' as any, handlePrevMusic);
    window.addEventListener('open-music-modal' as any, handleOpenModal);
    window.addEventListener('k8a1-offline-track-added' as any, handleOfflineTrackAdded);

    return () => {
      window.removeEventListener('pause-bg-music', handlePauseBgMusic);
      window.removeEventListener('k8a1-play-music' as any, handlePlayMusic);
      window.removeEventListener('k8a1-next-music' as any, handleNextMusic);
      window.removeEventListener('k8a1-prev-music' as any, handlePrevMusic);
      window.removeEventListener('open-music-modal' as any, handleOpenModal);
      window.removeEventListener('k8a1-offline-track-added' as any, handleOfflineTrackAdded);
    };
  }, [handleNextTrack, handlePrevTrack, handleSelectTrack, isYouTube]);

  // Xử lý nút bấm Bật / Tắt nhạc
  const togglePlay = useCallback(() => {
    if (isPlaying) {
      if (isYouTube && playerRef.current && isPlayerReadyRef.current && typeof playerRef.current.pauseVideo === 'function') {
        try { playerRef.current.pauseVideo(); } catch (e) {}
      } else if (audioTagRef.current) {
        audioTagRef.current.pause();
      }
      setIsPlaying(false);
      setIsBuffering(false);
      pendingPlayRef.current = false;
    } else {
      if (isYouTube) {
        if (isPlayerReadyRef.current && playerRef.current && typeof playerRef.current.playVideo === 'function') {
          try { 
            playerRef.current.playVideo(); 
            setIsBuffering(true);
          } catch (e) {
            console.warn('Lỗi khi gọi playVideo:', e);
          }
        } else {
          pendingPlayRef.current = true;
          setIsBuffering(true);
        }
      } else if (audioTagRef.current) {
        audioTagRef.current.play().catch((e) => {
          console.warn('Lỗi khi phát audio tag:', e);
        });
        setIsPlaying(true);
      }
    }
  }, [isPlaying, isYouTube]);

  // Thêm bài hát vào playlist
  const handleAddTrack = (newTrack: MusicTrack) => {
    const updated = [...internalPlaylist, newTrack];
    setInternalPlaylist(updated);
    const newIdx = updated.length - 1;
    currentIndexRef.current = newIdx;
    setCurrentIndex(newIdx);
    if (onTrackChange) onTrackChange(newIdx);
    window.dispatchEvent(new CustomEvent('k8a1-track-changed', { detail: { index: newIdx, track: newTrack } }));
    pendingPlayRef.current = true;
    setIsPlaying(true);
  };

  // Nạp file MP3 từ máy tính để phát offline
  const handleUploadOfflineFile = async (file: File) => {
    try {
      setIsBuffering(true);
      const newTrack = await saveOfflineTrackFile(file);
      const updated = [...internalPlaylist, newTrack];
      setInternalPlaylist(updated);
      const newIdx = updated.length - 1;
      currentIndexRef.current = newIdx;
      setCurrentIndex(newIdx);
      if (onTrackChange) onTrackChange(newIdx);
      window.dispatchEvent(new CustomEvent('k8a1-track-changed', { detail: { index: newIdx, track: newTrack } }));
      window.dispatchEvent(new CustomEvent('k8a1-offline-track-added', { detail: { track: newTrack } }));
      pendingPlayRef.current = true;
      setIsPlaying(true);
      setOfflineNotice(`✅ Đã lưu bài "${newTrack.title}" vào bộ nhớ máy để phát offline!`);
      setTimeout(() => setOfflineNotice(''), 5000);
    } catch (err: any) {
      alert('Không thể lưu file âm thanh offline: ' + (err?.message || err));
    } finally {
      setIsBuffering(false);
    }
  };

  // Xóa bài hát khỏi playlist
  const handleRemoveTrack = async (trackId: string) => {
    if (internalPlaylist.length <= 1) {
      alert('Playlist cần giữ lại ít nhất 1 bài hát!');
      return;
    }
    const target = internalPlaylist.find(t => t.id === trackId);
    if (target?.isOffline) {
      await deleteOfflineTrack(trackId);
    }
    const updated = internalPlaylist.filter(t => t.id !== trackId);
    setInternalPlaylist(updated);
    if (currentIndex >= updated.length) {
      setCurrentIndex(0);
      currentIndexRef.current = 0;
    }
  };

  // Render player ẩn
  const renderHiddenEngines = () => (
    <>
      {/* Vùng nhúng YouTube IFrame off-screen chuẩn kích thước 320x180 để chống trình duyệt & YouTube bóp/tạm dừng luồng ngầm */}
      <div
        ref={mountWrapperRef}
        style={{
          position: 'fixed',
          top: '-9999px',
          left: '-9999px',
          width: '320px',
          height: '180px',
          pointerEvents: 'none',
          zIndex: -9999,
          visibility: 'visible',
          opacity: 1
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
            handleNextTrack(false);
          }
        }}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        style={{ display: 'none' }}
      />
    </>
  );

  // Banner thông báo trạng thái mạng / Offline
  const renderOfflineNoticeToast = () => {
    if (!offlineNotice) return null;
    return (
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[300] max-w-md w-[92vw] md:w-auto bg-slate-950/95 text-amber-200 border border-amber-500/60 px-4 py-2.5 rounded-2xl shadow-2xl backdrop-blur-md text-xs font-semibold flex items-center justify-between gap-3 animate-fadeIn">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping flex-shrink-0" />
          <span>{offlineNotice}</span>
        </div>
        <button
          type="button"
          onClick={() => setOfflineNotice('')}
          className="text-slate-400 hover:text-white text-xs px-1.5 py-0.5 rounded cursor-pointer"
        >
          ✕
        </button>
      </div>
    );
  };

  if (variant === 'hidden') {
    return (
      <>
        {renderHiddenEngines()}
        {renderOfflineNoticeToast()}
        <MusicPlaylistModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          playlist={internalPlaylist}
          currentTrackIndex={currentIndex}
          isPlaying={isPlaying}
          isShuffled={isShuffled}
          repeatMode={repeatMode}
          volume={volume}
          isOnline={isOnline}
          onUploadOfflineFile={handleUploadOfflineFile}
          onSelectTrack={handleSelectTrack}
          onTogglePlay={togglePlay}
          onNextTrack={() => handleNextTrack(true)}
          onPrevTrack={handlePrevTrack}
          onToggleShuffle={() => setIsShuffled(!isShuffled)}
          onToggleRepeat={handleToggleRepeat}
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
        <div className="flex items-center gap-0.5 sm:gap-1 bg-white/10 hover:bg-white/15 border border-white/10 rounded-full p-0.5 transition-all shrink-0">
          {/* Nút Play / Pause */}
          <button
            onClick={togglePlay}
            className={`flex items-center gap-1.5 p-1.5 sm:px-2.5 sm:py-1.5 rounded-full text-xs font-sans font-medium transition-all duration-300 cursor-pointer select-none ${
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
            <span className="hidden sm:inline text-[11px] font-sans font-semibold max-w-[110px] md:max-w-[140px] truncate">
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
        {renderOfflineNoticeToast()}

        <MusicPlaylistModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          playlist={internalPlaylist}
          currentTrackIndex={currentIndex}
          isPlaying={isPlaying}
          isShuffled={isShuffled}
          repeatMode={repeatMode}
          volume={volume}
          isOnline={isOnline}
          onUploadOfflineFile={handleUploadOfflineFile}
          onSelectTrack={handleSelectTrack}
          onTogglePlay={togglePlay}
          onNextTrack={() => handleNextTrack(true)}
          onPrevTrack={handlePrevTrack}
          onToggleShuffle={() => setIsShuffled(!isShuffled)}
          onToggleRepeat={handleToggleRepeat}
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
      {renderOfflineNoticeToast()}

      <MusicPlaylistModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        playlist={internalPlaylist}
        currentTrackIndex={currentIndex}
        isPlaying={isPlaying}
        isShuffled={isShuffled}
        repeatMode={repeatMode}
        volume={volume}
        isOnline={isOnline}
        onUploadOfflineFile={handleUploadOfflineFile}
        onSelectTrack={handleSelectTrack}
        onTogglePlay={togglePlay}
        onNextTrack={() => handleNextTrack(true)}
        onPrevTrack={handlePrevTrack}
        onToggleShuffle={() => setIsShuffled(!isShuffled)}
        onToggleRepeat={handleToggleRepeat}
        onVolumeChange={(v) => setVolume(v)}
        onAddTrack={handleAddTrack}
        onRemoveTrack={handleRemoveTrack}
        isAdmin={isAdmin}
      />
    </>
  );
}
