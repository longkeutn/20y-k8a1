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
  Sparkles, 
  Film, 
  Upload, 
  Link as LinkIcon, 
  CheckCircle2, 
  Loader2, 
  AlertCircle,
  Download,
  Maximize2,
  Minimize2,
  Pause,
  Search,
  Shuffle,
  ChevronDown,
  ChevronUp,
  Sparkle,
  Users,
  Coins,
  ArrowUp,
  Trash2,
  Plus
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { MemoryImage, MemoryVideo } from '../types';

interface MemoryCornerProps {
  appsScriptUrl?: string;
  images: MemoryImage[];
  videos?: MemoryVideo[];
  onAddImage?: (newImage: MemoryImage | MemoryImage[]) => void;
  isMemberVerified?: boolean;
  onRequireMemberAccess?: () => void;
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

const INITIAL_VIDEOS: MemoryVideo[] = [];

type FilterCategory = 'all' | 'class' | 'activity' | 'graduation' | 'uploads';

export default function MemoryCorner({ 
  appsScriptUrl, 
  images, 
  videos = INITIAL_VIDEOS, 
  onAddImage,
  isMemberVerified = true,
  onRequireMemberAccess
}: MemoryCornerProps) {
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

  // Tự động đồng bộ ngay khi Google Sheet trả về danh sách video mà không cần tải lại trang
  useEffect(() => {
    if (videos && videos.length > 0) {
      setVideoList(videos);
    }
  }, [videos]);

  const [activeVideoIndex, setActiveVideoIndex] = useState<number>(0);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const [newVideoTitle, setNewVideoTitle] = useState('');

  // Photo Multi-Upload Modal State
  const [isPhotoUploadModalOpen, setIsPhotoUploadModalOpen] = useState(false);
  const [pendingPhotos, setPendingPhotos] = useState<{
    id: string;
    file: File;
    preview: string;
    caption: string;
    size: number;
  }[]>([]);
  const [uploadDate, setUploadDate] = useState<string>('2006');
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessingFiles, setIsProcessingFiles] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ current: number; total: number; percent: number }>({ current: 0, total: 0, percent: 0 });
  const [uploadError, setUploadError] = useState<string>('');
  const [uploadSuccess, setUploadSuccess] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Gallery Filters & Search State
  const [activeFilter, setActiveFilter] = useState<FilterCategory>('all');
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  
  // Display Optimization: Progressive Pagination (8 ảnh ban đầu)
  const INITIAL_VISIBLE_COUNT = 8;
  const [visibleCount, setVisibleCount] = useState<number>(INITIAL_VISIBLE_COUNT);

  // Lightbox State
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const lightboxRef = useRef<HTMLDivElement | null>(null);

  // Chế độ Trình Chiếu Ảnh Tự Động (Slide Show Mode)
  const [isSlideshowActive, setIsSlideshowActive] = useState<boolean>(false);
  const [isSlideshowPlaying, setIsSlideshowPlaying] = useState<boolean>(true);
  const [slideshowSpeed, setSlideshowSpeed] = useState<number>(4500); // 4.5 giây / ảnh
  const [slideshowProgress, setSlideshowProgress] = useState<number>(0);
  const [isControlsVisible, setIsControlsVisible] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const hideControlsTimerRef = useRef<any>(null);

  // ---------------------------------------------------------------------------
  // LOGIC THẢ TIM TƯƠNG TÁC (TÍNH TOÁN BASELINE & GIẢM 1 KHI BỎ THÍCH)
  // ---------------------------------------------------------------------------
  const getBaseLikes = (id: string, index: number): number => {
    let hash = 0;
    const str = id || `img-${index}`;
    for (let i = 0; i < str.length; i++) hash += str.charCodeAt(i);
    return 24 + (hash % 25);
  };

  // Trạng thái đã thả tim của user (mặc định là true cho số tim có sẵn)
  const [userLikedMap, setUserLikedMap] = useState<Record<string, boolean>>(() => {
    try {
      const local = localStorage.getItem('k8a1_user_liked_status');
      return local ? JSON.parse(local) : {};
    } catch {
      return {};
    }
  });

  // Lưu số lượng tim đã điều chỉnh
  const [likesCountMap, setLikesCountMap] = useState<Record<string, number>>(() => {
    try {
      const local = localStorage.getItem('k8a1_photo_likes_count');
      return local ? JSON.parse(local) : {};
    } catch {
      return {};
    }
  });

  const getPhotoLikes = (imgId: string, index: number): number => {
    if (likesCountMap[imgId] !== undefined) {
      return likesCountMap[imgId];
    }
    return getBaseLikes(imgId, index);
  };

  const isPhotoLiked = (imgId: string): boolean => {
    if (userLikedMap[imgId] !== undefined) {
      return userLikedMap[imgId];
    }
    return true; // Ban đầu mặc định hiển thị trạng thái có sẵn
  };

  const handleLikeToggle = (imgId: string, index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const currentLikes = getPhotoLikes(imgId, index);
    const currentlyLiked = isPhotoLiked(imgId);

    if (currentlyLiked) {
      // Đang có tim -> Nhấp vào để hủy tim (Giảm 1)
      const nextLikes = Math.max(0, currentLikes - 1);
      const nextUserLiked = { ...userLikedMap, [imgId]: false };
      const nextLikesCount = { ...likesCountMap, [imgId]: nextLikes };
      setUserLikedMap(nextUserLiked);
      setLikesCountMap(nextLikesCount);
      localStorage.setItem('k8a1_user_liked_status', JSON.stringify(nextUserLiked));
      localStorage.setItem('k8a1_photo_likes_count', JSON.stringify(nextLikesCount));
    } else {
      // Chưa tim -> Thả tim (Tăng 1)
      const nextLikes = currentLikes + 1;
      const nextUserLiked = { ...userLikedMap, [imgId]: true };
      const nextLikesCount = { ...likesCountMap, [imgId]: nextLikes };
      setUserLikedMap(nextUserLiked);
      setLikesCountMap(nextLikesCount);
      localStorage.setItem('k8a1_user_liked_status', JSON.stringify(nextUserLiked));
      localStorage.setItem('k8a1_photo_likes_count', JSON.stringify(nextLikesCount));
      confetti({ particleCount: 25, spread: 45, origin: { y: 0.6 } });
    }
  };

  // Nén ảnh trình duyệt trước khi upload
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

  // ---------------------------------------------------------------------------
  // SẮP XẾP & XÁO TRỘN ẢNH NGẪU NHIÊN (SHUFFLE / RANDOM DISPLAY ORDER)
  // ---------------------------------------------------------------------------
  const [sortOrder, setSortOrder] = useState<'random' | 'newest' | 'likes'>('random');
  const [shuffleSeed, setShuffleSeed] = useState<number>(() => Math.floor(Math.random() * 1000000));
  const [isShuffling, setIsShuffling] = useState<boolean>(false);

  const handleShuffle = () => {
    setSortOrder('random');
    setShuffleSeed(Date.now());
    setIsShuffling(true);
    setTimeout(() => setIsShuffling(false), 500);
  };

  // Danh sách ảnh đã xáo trộn ngẫu nhiên (Fisher-Yates Shuffle) hoặc sắp xếp
  const shuffledImages = useMemo(() => {
    if (!images || images.length === 0) return [];

    if (sortOrder === 'newest') {
      return [...images]; // Thứ tự mới nhất gốc từ Drive
    }

    if (sortOrder === 'likes') {
      return [...images].sort((a, b) => {
        const likesA = getPhotoLikes(a.id, 0);
        const likesB = getPhotoLikes(b.id, 0);
        return likesB - likesA;
      });
    }

    // Mặc định: Ngẫu nhiên (Fisher-Yates Shuffle với pseudo-random generator từ shuffleSeed)
    const list = [...images];
    let seed = Math.abs(shuffleSeed) || 12345;
    const rnd = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };
    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(rnd() * (i + 1));
      [list[i], list[j]] = [list[j], list[i]];
    }
    return list;
  }, [images, sortOrder, shuffleSeed]);

  // Lọc danh sách ảnh trên nguồn ảnh đã xáo trộn
  const filteredImages = useMemo(() => {
    return shuffledImages.filter(img => {
      if (searchKeyword.trim()) {
        const kw = searchKeyword.toLowerCase();
        const matchCap = img.caption?.toLowerCase().includes(kw);
        const matchDate = img.date?.toLowerCase().includes(kw);
        if (!matchCap && !matchDate) return false;
      }

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
  }, [shuffledImages, activeFilter, searchKeyword]);

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

  useEffect(() => {
    setVisibleCount(INITIAL_VISIBLE_COUNT);
  }, [activeFilter, searchKeyword, sortOrder, shuffleSeed]);

  const handleLoadMore = () => {
    setVisibleCount(prev => Math.min(prev + 8, filteredImages.length));
  };

  const handleCollapse = () => {
    setVisibleCount(INITIAL_VISIBLE_COUNT);
    const galleryEl = document.getElementById('bento-gallery-anchor');
    if (galleryEl) {
      galleryEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // ---------------------------------------------------------------------------
  // XỬ LÝ CHỌN & UPLOAD NHIỀU ẢNH KỶ NIỆM (MULTI-PHOTO BATCH UPLOAD)
  // ---------------------------------------------------------------------------
  const handlePhotoFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadError('');
    setUploadSuccess('');
    setIsProcessingFiles(true);

    try {
      const newItems: {
        id: string;
        file: File;
        preview: string;
        caption: string;
        size: number;
      }[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.size > 25 * 1024 * 1024) {
          continue; // Bỏ qua tệp quá 25MB
        }
        try {
          const compressed = await compressImage(file);
          const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
          newItems.push({
            id: `pending-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 7)}`,
            file,
            preview: compressed,
            caption: cleanName || 'Kỷ niệm lớp K8A1',
            size: file.size
          });
        } catch (err) {
          console.warn('Lỗi nén ảnh:', file.name, err);
        }
      }

      if (newItems.length === 0) {
        setUploadError('Không thể xử lý các tệp ảnh vừa chọn. Vui lòng kiểm tra lại định dạng ảnh.');
      } else {
        setPendingPhotos(prev => [...prev, ...newItems]);
      }
    } catch (err) {
      setUploadError('Có lỗi xảy ra khi nạp ảnh. Vui lòng thử lại.');
    } finally {
      setIsProcessingFiles(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemovePendingPhoto = (id: string) => {
    setPendingPhotos(prev => prev.filter(p => p.id !== id));
  };

  const handleUpdatePendingCaption = (id: string, newCaption: string) => {
    setPendingPhotos(prev => prev.map(p => p.id === id ? { ...p, caption: newCaption } : p));
  };

  const handleApplyBatchCaption = (batchCaption: string) => {
    if (!batchCaption.trim()) return;
    setPendingPhotos(prev => prev.map((p, idx) => ({
      ...p,
      caption: prev.length > 1 ? `${batchCaption.trim()} (${idx + 1})` : batchCaption.trim()
    })));
  };

  const handleClosePhotoModal = () => {
    if (isUploading) return;
    setIsPhotoUploadModalOpen(false);
    setPendingPhotos([]);
    setUploadError('');
    setUploadSuccess('');
    setUploadProgress({ current: 0, total: 0, percent: 0 });
  };

  // Submit Upload toàn bộ ảnh đã chọn lên Google Drive
  const handlePhotoUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pendingPhotos.length === 0) {
      setUploadError('Vui lòng chọn ít nhất một bức ảnh trước khi tải lên.');
      return;
    }

    setIsUploading(true);
    setUploadError('');
    setUploadSuccess('');

    const total = pendingPhotos.length;
    let successCount = 0;
    let failCount = 0;
    const finalDate = uploadDate.trim() || '2006';
    const successfullyAdded: MemoryImage[] = [];

    for (let i = 0; i < total; i++) {
      const item = pendingPhotos[i];
      setUploadProgress({
        current: i + 1,
        total,
        percent: Math.round(((i) / total) * 100)
      });

      const finalCaption = item.caption.trim() || 'Kỷ niệm lớp K8A1';

      try {
        if (appsScriptUrl) {
          const response = await fetch(appsScriptUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify({
              action: 'upload_photo',
              memberKey: 'k8a1',
              fileData: item.preview,
              caption: finalCaption
            })
          });

          const result = await response.json();

          if (result && result.status === 'success') {
            successCount++;
            const newPhoto: MemoryImage = {
              id: result.fileId || `drive-img-${Date.now()}-${i}`,
              url: result.data?.url || `https://lh3.googleusercontent.com/d/${result.fileId}=w1600`,
              caption: finalCaption,
              date: finalDate,
              isUserUploaded: true
            };
            successfullyAdded.push(newPhoto);
          } else {
            failCount++;
          }
        } else {
          // Local fallback
          successCount++;
          const localPhoto: MemoryImage = {
            id: `local-img-${Date.now()}-${i}`,
            url: item.preview,
            caption: finalCaption,
            date: finalDate,
            isUserUploaded: true
          };
          successfullyAdded.push(localPhoto);
        }
      } catch (err: any) {
        console.error('Lỗi upload từng ảnh:', err);
        failCount++;
      }
    }

    setUploadProgress({ current: total, total, percent: 100 });
    setIsUploading(false);

    if (successfullyAdded.length > 0 && onAddImage) {
      onAddImage(successfullyAdded);
    }

    if (successCount > 0) {
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
      if (failCount === 0) {
        setUploadSuccess(`Đã tải lên thành công toàn bộ ${successCount} bức ảnh kỷ niệm vào thư viện lớp! 🎉`);
      } else {
        setUploadSuccess(`Đã tải lên thành công ${successCount}/${total} bức ảnh (${failCount} ảnh bị lỗi). 🎉`);
      }
      setTimeout(() => {
        handleClosePhotoModal();
      }, 2000);
    } else {
      setUploadError('Không thể tải ảnh lên hệ thống. Vui lòng kiểm tra lại kết nối mạng và thử lại.');
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

  // Lightbox Handlers
  const openFullscreen = (index: number) => {
    setSelectedImageIndex(index);
    setZoomLevel(1);
  };

  const stopSlideshow = useCallback(() => {
    setIsSlideshowActive(false);
    setIsSlideshowPlaying(false);
    setSlideshowProgress(0);
    setIsControlsVisible(true);
    if (hideControlsTimerRef.current) clearTimeout(hideControlsTimerRef.current);
    if (document.fullscreenElement) {
      document.exitFullscreen?.().catch(() => {});
    }
  }, []);

  const closeFullscreen = useCallback(() => {
    stopSlideshow();
    setSelectedImageIndex(null);
    setZoomLevel(1);
  }, [stopSlideshow]);

  const startSlideshow = (startIndex = 0) => {
    const targetIndex = selectedImageIndex !== null ? selectedImageIndex : (startIndex || 0);
    setSelectedImageIndex(targetIndex);
    setIsSlideshowActive(true);
    setIsSlideshowPlaying(true);
    setSlideshowProgress(0);
    setZoomLevel(1);
  };

  const toggleSlideshowPlay = () => {
    if (!isSlideshowActive) {
      setIsSlideshowActive(true);
      setIsSlideshowPlaying(true);
    } else {
      setIsSlideshowPlaying(prev => !prev);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      lightboxRef.current?.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Sync fullscreen change state
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const handlePrev = useCallback(() => {
    setSelectedImageIndex((prev) => {
      if (prev === null) return null;
      return prev > 0 ? prev - 1 : filteredImages.length - 1;
    });
    setZoomLevel(1);
    setSlideshowProgress(0);
  }, [filteredImages.length]);

  const handleNext = useCallback(() => {
    setSelectedImageIndex((prev) => {
      if (prev === null) return null;
      return prev < filteredImages.length - 1 ? prev + 1 : 0;
    });
    setZoomLevel(1);
    setSlideshowProgress(0);
  }, [filteredImages.length]);

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(Number((prev + 0.3).toFixed(1)), 3));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(Number((prev - 0.3).toFixed(1)), 1));
  const handleResetZoom = () => setZoomLevel(1);

  // Vòng lặp đếm thời gian & auto-advance Slide Show
  useEffect(() => {
    if (!isSlideshowActive || !isSlideshowPlaying || selectedImageIndex === null) {
      setSlideshowProgress(0);
      return;
    }

    const intervalStep = 50; // Bước nhảy 50ms
    const timer = setInterval(() => {
      setSlideshowProgress((prev) => {
        const next = prev + (intervalStep / slideshowSpeed) * 100;
        if (next >= 100) {
          handleNext();
          return 0;
        }
        return next;
      });
    }, intervalStep);

    return () => clearInterval(timer);
  }, [isSlideshowActive, isSlideshowPlaying, selectedImageIndex, slideshowSpeed, handleNext]);

  // Tự động ẩn thanh công cụ khi trình chiếu
  const handleUserActivity = useCallback(() => {
    setIsControlsVisible(true);
    if (hideControlsTimerRef.current) clearTimeout(hideControlsTimerRef.current);
    if (isSlideshowActive && isSlideshowPlaying) {
      hideControlsTimerRef.current = setTimeout(() => {
        setIsControlsVisible(false);
      }, 3500);
    }
  }, [isSlideshowActive, isSlideshowPlaying]);

  useEffect(() => {
    if (!isSlideshowActive || !isSlideshowPlaying) {
      setIsControlsVisible(true);
      if (hideControlsTimerRef.current) clearTimeout(hideControlsTimerRef.current);
    } else {
      handleUserActivity();
    }
  }, [isSlideshowActive, isSlideshowPlaying, handleUserActivity]);

  // Keyboard navigation
  useEffect(() => {
    if (selectedImageIndex === null) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeFullscreen();
      else if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        toggleSlideshowPlay();
      }
      else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        toggleFullscreen();
      }
      else if (e.key === 'ArrowLeft') handlePrev();
      else if (e.key === 'ArrowRight') handleNext();
      else if (e.key === '+' || e.key === '=') handleZoomIn();
      else if (e.key === '-') handleZoomOut();
      else if (e.key === '0') handleResetZoom();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImageIndex, handlePrev, handleNext, closeFullscreen, isSlideshowActive]);

  const activeVideo = videoList[activeVideoIndex] || videoList[0];
  const currentImage = selectedImageIndex !== null ? filteredImages[selectedImageIndex] : null;

  return (
    <div id="memory-corner-section" className="space-y-12">
      
      {/* ======================================================== */}
      {/* 🎬 KHỐI 1: THƯỚC PHIM NGÀY ẤY (CINEMATIC THEATER SHOWCASE) */}
      {/* ======================================================== */}
      <div className="bg-[#141821] text-white rounded-2xl p-4 sm:p-8 shadow-2xl border-2 border-amber-500/30 relative overflow-hidden space-y-4 sm:space-y-6">
        
        {/* Ambient Warm Cinema Glow */}
        <div className="absolute top-0 right-1/4 w-80 h-80 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Video Header & Add Button */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-slate-700/80 pb-3.5 gap-3 relative z-10 text-left">
          <div className="space-y-1 min-w-0">
            <span className="text-[11px] uppercase tracking-widest font-sans font-bold text-amber-400 block">
              Thước Phim Thanh Xuân K8A1
            </span>
            <h3 className="text-xl sm:text-2xl font-serif font-bold text-white tracking-tight">
              Video Kỷ Niệm 20 Năm Ngày Trở Về
            </h3>
            <p className="text-xs text-slate-400 font-serif italic">
              Xem lại những khoảnh khắc sống động của K8A1 qua YouTube & Video kỷ niệm ({videoList.length} video)
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              if (!isMemberVerified) {
                if (onRequireMemberAccess) onRequireMemberAccess();
                return;
              }
              setIsVideoModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white text-xs font-sans font-bold uppercase tracking-wider shadow-sm transition-all cursor-pointer self-start sm:self-auto"
          >
            <span>+ Thêm Video</span>
          </button>
        </div>

        {/* MÀN HÌNH CHIẾU RẠP CHÍNH */}
        <div className="space-y-2.5 sm:space-y-3 relative z-10">
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
              <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-slate-400 space-y-3 bg-[#0d111a]">
                <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center animate-pulse">
                  <Film className="w-6 h-6 text-amber-400" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-amber-200">Đang đồng bộ thước phim thanh xuân K8A1...</p>
                  <p className="text-xs text-slate-500">Dữ liệu video kỷ niệm đang được nạp tự động</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-slate-900/80 p-3 sm:p-3.5 rounded-xl border border-slate-800 gap-2 text-left">
            <div className="space-y-0.5">
              <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest block">
                ● ĐANG CHIẾU TRÊN MÀN ẢNH
              </span>
              <h4 className="font-serif font-bold text-sm sm:text-base text-white">
                {activeVideo?.title || 'Thước phim kỷ niệm Lớp K8A1'}
              </h4>
            </div>
            <span className="text-[11px] text-slate-400 font-sans italic self-start sm:self-auto">
              Thước phim lưu giữ kỷ niệm tuổi học trò
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

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
              {videoList.map((vid, idx) => {
                const isActive = idx === activeVideoIndex;
                const { type } = parseVideoEmbedUrl(vid.embedUrl);

                return (
                  <div
                    key={vid.id || idx}
                    onClick={() => setActiveVideoIndex(idx)}
                    className={`flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 p-2 sm:p-2.5 rounded-xl border cursor-pointer transition-all duration-200 ${
                      isActive
                        ? 'bg-amber-950/60 border-amber-400 shadow-md ring-1 ring-amber-400/50'
                        : 'bg-slate-900/50 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                    }`}
                  >
                    <div className="w-full sm:w-16 h-20 sm:h-11 rounded-lg bg-black shrink-0 relative overflow-hidden flex items-center justify-center border border-slate-700">
                      <Play className={`w-5 h-5 sm:w-4 sm:h-4 ${isActive ? 'text-amber-400 fill-amber-400' : 'text-slate-400'}`} />
                      <span className="absolute bottom-1 right-1 sm:bottom-0.5 sm:right-0.5 text-[9px] sm:text-[8px] font-mono px-1 rounded bg-black/80 text-amber-300">
                        {type === 'youtube' ? 'YT' : 'VIDEO'}
                      </span>
                    </div>

                    <div className="min-w-0 flex-1 w-full">
                      <p className={`text-[11px] sm:text-xs font-serif line-clamp-2 ${isActive ? 'text-amber-200 font-bold' : 'text-slate-300'}`}>
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
      {/* 📸 KHỐI 2: KHO KỶ YẾU & ẢNH LỚP K8A1 (CLEAN BENTO MOSAIC) */}
      {/* ======================================================== */}
      <div id="bento-gallery-anchor" className="bg-[#FAF7F2] rounded-2xl sm:rounded-3xl p-3.5 sm:p-9 shadow-lg border border-amber-200/90 relative overflow-hidden space-y-4 sm:space-y-7 text-left">
        
        {/* Nền hoa văn vân gỗ / trang trí hoài niệm */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-amber-200/20 via-orange-100/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        {/* 🌟 HEADER KHO KỶ YẾU & ẢNH LỚP K8A1 */}
        {/* HEADER KHO KỶ YẾU & ẢNH LỚP K8A1 */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-amber-300/60 pb-3.5 gap-3 relative z-10 text-left">
          <div className="space-y-1 min-w-0">
            <span className="text-[11px] uppercase tracking-widest font-sans font-bold text-amber-800 block">
              Kho Kỷ Yếu & Ảnh Lớp (2003 — 2006)
            </span>
            
            <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#1E293B] tracking-tight">
              Kho Ảnh Kỷ Niệm Lớp K8A1
            </h3>
            
            <p className="text-xs text-slate-600 font-serif italic">
              Những nụ cười áo trắng và ngọn lửa trại thanh xuân 20 năm trước • {images.length} bức ảnh
            </p>
          </div>

          {/* Action Buttons: Trình Chiếu Slide Show & Góp Thêm Ảnh */}
          <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
            <button
              type="button"
              onClick={() => startSlideshow(0)}
              className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white rounded-xl text-xs font-sans font-bold uppercase tracking-wider shadow-sm hover:shadow-md transition-all cursor-pointer"
              title="Bật trình chiếu tự động toàn màn hình (rất thích hợp chiếu máy chiếu / TV hội trường)"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Trình Chiếu Slide Show</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (!isMemberVerified) {
                  if (onRequireMemberAccess) onRequireMemberAccess();
                  return;
                }
                setIsPhotoUploadModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white rounded-xl text-xs font-sans font-bold uppercase tracking-wider shadow-sm transition-all cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Góp Thêm Ảnh</span>
            </button>
          </div>
        </div>

        {/* BỘ LỌC CHỦ ĐỀ HOÀI NIỆM, SẮP XẾP & THANH TÌM KIẾM */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 relative z-10">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {[
              { id: 'all', label: 'Tất Cả', count: countsByCategory.all },
              { id: 'class', label: 'Góc Lớp', count: countsByCategory.class },
              { id: 'activity', label: 'Hội Trại', count: countsByCategory.activity },
              { id: 'graduation', label: 'Bế Giảng', count: countsByCategory.graduation },
              { id: 'uploads', label: 'Bạn Bè Gửi', count: countsByCategory.uploads },
            ].map((tab) => {
              const isActive = activeFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveFilter(tab.id as FilterCategory)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-sans transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
                    isActive
                      ? 'bg-[#1E293B] text-amber-200 shadow-sm border border-slate-700 font-bold'
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

          <div className="flex flex-wrap items-center gap-2">
            {/* TÙY CHỌN SẮP XẾP & XÁO TRỘN NGẪU NHIÊN */}
            <div className="inline-flex items-center bg-white p-0.5 rounded-full border border-slate-200 shadow-2xs">
              <button
                type="button"
                onClick={handleShuffle}
                className={`px-2.5 py-1 rounded-full text-xs font-sans font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  sortOrder === 'random'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
                title="Hiển thị xáo trộn ngẫu nhiên - Bấm để xáo trộn lại một bộ ảnh mới"
              >
                <Shuffle className={`w-3 h-3 transition-transform duration-500 ${isShuffling ? 'rotate-180' : ''}`} />
                <span>Ngẫu nhiên</span>
              </button>

              <button
                type="button"
                onClick={() => setSortOrder('newest')}
                className={`px-2.5 py-1 rounded-full text-xs font-sans font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  sortOrder === 'newest'
                    ? 'bg-[#1E293B] text-amber-200 shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
                title="Xếp theo thứ tự ảnh mới nhất"
              >
                <span>Mới nhất</span>
              </button>

              <button
                type="button"
                onClick={() => setSortOrder('likes')}
                className={`px-2.5 py-1 rounded-full text-xs font-sans font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  sortOrder === 'likes'
                    ? 'bg-rose-500 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
                title="Xếp theo ảnh được thả tim nhiều nhất"
              >
                <Heart className={`w-3 h-3 ${sortOrder === 'likes' ? 'fill-white text-white' : 'text-slate-400'}`} />
                <span>Yêu thích</span>
              </button>
            </div>

            {/* Ô TÌM KIẾM */}
            <div className="relative flex-1 sm:w-52 min-w-[140px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="Tìm năm, kỷ niệm..."
                className="w-full pl-8 pr-7 py-1.5 bg-white border border-slate-200 rounded-full text-xs focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-slate-700 font-serif"
              />
              {searchKeyword && (
                <button
                  onClick={() => setSearchKeyword('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Loading / Skeleton State khi đang nạp ảnh từ Drive */}
        {images.length === 0 ? (
          <div className="space-y-4 relative z-10">
            <div className="flex items-center gap-2 text-xs font-sans text-amber-700 font-bold">
              <Camera className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
              <span>Đang nạp thư viện ảnh kỷ niệm K8A1...</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-5 lg:gap-6 animate-pulse">
              {[1, 2, 3, 4, 5, 6].map((sk) => (
                <div key={sk} className="bg-white p-2 sm:p-4 pb-2.5 sm:pb-4 rounded-xl sm:rounded-2xl border border-slate-200/90 space-y-2.5">
                  <div className="aspect-square sm:aspect-[4/3] bg-slate-200/80 rounded-lg flex items-center justify-center">
                    <Camera className="w-6 h-6 sm:w-8 sm:h-8 text-slate-400/40" />
                  </div>
                  <div className="h-2.5 bg-slate-200/70 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        ) : filteredImages.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-amber-300 space-y-3">
            <ImageIcon className="w-12 h-12 text-amber-400 mx-auto" />
            <p className="font-serif text-slate-600 text-sm">Không tìm thấy bức ảnh nào phù hợp với bộ lọc hiện tại.</p>
            <button
              onClick={() => { setActiveFilter('all'); setSearchKeyword(''); }}
              className="px-4 py-2 bg-amber-600 text-white rounded-lg text-xs font-bold font-sans cursor-pointer hover:bg-amber-700"
            >
              Xem Tất Cả Ảnh Kỷ Niệm
            </button>
          </div>
        ) : null}

        {/* =================================================================== */}
        {/* 🌟 BỐ CỤC BENTO MOSAIC BẤT ĐỐI XỨNG TUYỆT ĐẸP (CLEAN NO-CAPTION CARDS) */}
        {/* =================================================================== */}
        {filteredImages.length > 0 && (
          <div className="space-y-6 relative z-10">
            
            {/* Header số lượng ảnh */}
            <div className="flex items-center justify-between text-xs font-sans text-slate-500 pt-1">
              <span className="flex items-center gap-1.5 text-amber-900 font-bold">
                <Sparkle className="w-3.5 h-3.5 text-amber-600" />
                <span>Khoảnh khắc thời áo trắng:</span>
              </span>
              <span>
                Đang hiển thị <span className="font-bold text-amber-800">{displayedImages.length}</span> / <span className="font-bold text-amber-800">{filteredImages.length}</span> bức ảnh
              </span>
            </div>

            {/* Lưới Bento Mosaic bất đối xứng (2 cột trên di động, 3 cột trên máy tính) */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-5 lg:gap-6">
              
              {displayedImages.map((img, index) => {
                const isLiked = isPhotoLiked(img.id);
                const likes = getPhotoLikes(img.id, index);

                // Ảnh đầu tiên phóng to dạng Hero Spotlight trên màn hình lớn
                const isHeroSpotlight = index === 0 && displayedImages.length >= 3;
                const isTiltLeft = index % 3 === 1;
                const isTiltRight = index % 3 === 2;

                return (
                  <div
                    key={img.id || index}
                    onClick={() => openFullscreen(index)}
                    className={`group relative bg-white p-2 sm:p-4 pb-2.5 sm:pb-4 rounded-xl sm:rounded-2xl shadow-xs sm:shadow-md border border-slate-200/90 hover:shadow-2xl hover:border-amber-400 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col justify-between ${
                      isHeroSpotlight ? 'col-span-2 sm:col-span-2 sm:row-span-2 p-2.5 sm:p-6 bg-gradient-to-br from-[#FFFDF9] via-white to-amber-50/40 border-amber-400/80 shadow-sm sm:shadow-xl' : 'col-span-1'
                    } ${
                      isTiltLeft ? 'sm:transform sm:-rotate-1 hover:rotate-0' : ''
                    } ${
                      isTiltRight ? 'sm:transform sm:rotate-1 hover:rotate-0' : ''
                    }`}
                  >
                    {/* Băng dính washi hoài niệm dán trên ảnh */}
                    <div className={`hidden sm:block absolute -top-2.5 left-1/2 -translate-x-1/2 ${isHeroSpotlight ? 'w-28 h-6' : 'w-20 h-5'} bg-amber-100/90 border border-amber-300/50 transform rotate-1 z-20 shadow-2xs pointer-events-none`} />

                    {/* Vùng Khung Ảnh */}
                    <div className={`relative rounded-lg sm:rounded-xl overflow-hidden bg-slate-900 shadow-inner ${
                      isHeroSpotlight ? 'aspect-video sm:aspect-[16/10]' : 'aspect-square sm:aspect-[4/3]'
                    }`}>
                      <img
                        src={img.url}
                        alt="Ảnh kỷ niệm K8A1"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 filter sepia-[0.06] group-hover:sepia-0"
                        loading="lazy"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          if (img.id && !target.src.includes('thumbnail')) {
                            target.src = `https://drive.google.com/thumbnail?authuser=0&sz=w800&id=${img.id}`;
                          }
                        }}
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                      {/* Nút Thả Tim Tương Tác */}
                      <button
                        type="button"
                        onClick={(e) => handleLikeToggle(img.id, index, e)}
                        className={`absolute top-1.5 right-1.5 sm:top-3 sm:right-3 z-20 backdrop-blur-md text-[10px] sm:text-xs px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full border transition-all shadow cursor-pointer flex items-center gap-1 sm:gap-1.5 ${
                          isLiked
                            ? 'bg-black/60 hover:bg-rose-600/90 text-rose-300 border-rose-400/40 hover:text-white'
                            : 'bg-black/50 hover:bg-black/75 text-slate-300 border-white/20'
                        }`}
                        title={isLiked ? "Bỏ yêu thích (Giảm 1)" : "Thả tim yêu thích"}
                      >
                        <Heart className={`w-3 h-3 sm:w-3.5 sm:h-3.5 transition-colors ${
                          isLiked ? 'text-rose-400 fill-rose-400 group-hover:text-white' : 'text-slate-300'
                        }`} />
                        <span className="font-mono font-bold text-[10px] sm:text-xs">{likes}</span>
                      </button>

                      {/* Date Badge kiểu tem máy film */}
                      {img.date && (
                        <span className="absolute top-1.5 left-1.5 sm:top-3 sm:left-3 z-20 bg-amber-950/80 backdrop-blur-md text-amber-200 text-[9px] sm:text-[10px] font-mono px-1.5 py-0.2 sm:px-2 sm:py-0.5 rounded border border-amber-500/30">
                          {img.date}
                        </span>
                      )}

                      {/* Nút Xem HD xuất hiện khi rê chuột */}
                      <div className="hidden sm:flex absolute bottom-3 right-3 z-20 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 backdrop-blur-md text-white px-2.5 py-1 rounded-lg text-[11px] font-sans font-semibold items-center gap-1 border border-white/20 shadow">
                        <Maximize2 className="w-3 h-3 text-amber-300" />
                        <span>Phóng to</span>
                      </div>
                    </div>

                    {/* Chân thẻ phong cách Polaroid */}
                    <div className="pt-1.5 sm:pt-2.5 px-0.5 sm:px-1 flex items-center justify-between text-[10px] sm:text-xs text-slate-500 font-serif">
                      <span className="text-[10px] sm:text-[11px] text-slate-400 font-sans italic truncate">
                        {img.date || 'K8A1 (03–06)'}
                      </span>
                      <span className="text-[9px] sm:text-[10px] font-sans font-bold text-amber-800 uppercase tracking-wider bg-amber-100/70 px-1.5 py-0.5 sm:px-2 rounded shrink-0 flex items-center gap-0.5 sm:gap-1">
                        <Maximize2 className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                        <span className="hidden xs:inline">Xem HD</span>
                      </span>
                    </div>
                  </div>
                );
              })}

              {/* Ô Thẻ Góp Thêm Ảnh Kỷ Niệm Ở Cuối Grid */}
              <div 
                onClick={() => {
                  if (!isMemberVerified) {
                    if (onRequireMemberAccess) onRequireMemberAccess();
                    return;
                  }
                  setIsPhotoUploadModalOpen(true);
                }}
                className="col-span-2 sm:col-span-1 bg-gradient-to-br from-amber-50 via-orange-50/50 to-amber-100/60 p-4 sm:p-6 rounded-xl sm:rounded-2xl border-2 border-dashed border-amber-400/80 hover:border-amber-600 flex flex-col items-center justify-center text-center space-y-2 sm:space-y-3.5 shadow-2xs hover:shadow-md transition-all cursor-pointer group min-h-[140px] sm:min-h-[260px]"
              >
                <div className="w-10 h-10 sm:w-13 sm:h-13 rounded-full bg-amber-200 text-amber-900 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                  <Upload className="w-4 h-4 sm:w-6 sm:h-6 text-amber-800" />
                </div>
                <div className="space-y-0.5 sm:space-y-1">
                  <h4 className="font-serif font-bold text-xs sm:text-base text-amber-950 group-hover:text-amber-800 transition-colors">
                    Bạn Còn Giữ Ảnh Kỷ Niệm Xưa?
                  </h4>
                  <p className="text-[10px] sm:text-xs text-slate-600 font-serif italic max-w-xs leading-tight sm:leading-relaxed">
                    Góp thêm những tấm ảnh cũ thời học trò vào cuốn kỷ yếu 20 năm của lớp K8A1!
                  </p>
                </div>
                <span className="px-3 py-1.5 sm:px-4 sm:py-2 bg-amber-600 group-hover:bg-amber-700 text-white text-[10px] sm:text-xs font-sans font-bold uppercase tracking-wider rounded-xl shadow-xs transition inline-flex items-center gap-1.5">
                  <PlusCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  <span>Tải Thêm Ảnh Lên</span>
                </span>
              </div>

            </div>

            {/* 🌟 NÚT NẠP THÊM / THU GỌN ẢNH (TỐI ƯU HIỂN THỊ) */}
            <div className="pt-3 flex flex-col items-center justify-center gap-2">
              <div className="flex items-center gap-3 flex-wrap justify-center">
                {hasMore && (
                  <button
                    type="button"
                    onClick={handleLoadMore}
                    className="inline-flex items-center gap-2 px-7 py-3 bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 hover:from-amber-500 hover:to-amber-700 text-white rounded-full text-xs font-sans font-bold uppercase tracking-wider shadow-md hover:shadow-xl transition-all cursor-pointer transform hover:-translate-y-0.5"
                  >
                    <ChevronDown className="w-4 h-4 text-amber-200 animate-bounce" />
                    <span>Khám Phá Thêm ({filteredImages.length - visibleCount} ảnh còn lại)</span>
                  </button>
                )}

                {visibleCount > INITIAL_VISIBLE_COUNT && (
                  <button
                    type="button"
                    onClick={handleCollapse}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-white hover:bg-slate-100 text-slate-700 rounded-full text-xs font-sans font-bold border border-slate-300 shadow-2xs transition cursor-pointer"
                  >
                    <ChevronUp className="w-3.5 h-3.5 text-slate-500" />
                    <span>Thu Gọn Lại ({INITIAL_VISIBLE_COUNT} ảnh đầu)</span>
                  </button>
                )}
              </div>
            </div>

          </div>
        )}

      </div>

      {/* ======================================================== */}
      {/* 📸 MODAL GÓP ẢNH KỶ NIỆM (IN-APP DIRECT UPLOAD) */}
      {/* ======================================================== */}
      {/* ======================================================== */}
      {/* 📸 MODAL GÓP ẢNH KỶ NIỆM (CHO PHÉP CHỌN & UPLOAD NHIỀU ẢNH) */}
      {/* ======================================================== */}
      {isPhotoUploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg sm:max-w-xl w-full p-5 sm:p-7 shadow-2xl border border-amber-200 relative text-left space-y-4 my-8">
            
            <button
              type="button"
              disabled={isUploading}
              onClick={handleClosePhotoModal}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1 cursor-pointer disabled:opacity-30"
              title="Đóng cửa sổ"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1 border-b border-slate-200 pb-3">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Đóng Góp Ảnh Kỷ Niệm K8A1</span>
              </div>
              <h3 className="font-serif font-bold text-xl text-[#1E293B]">
                Góp Thêm Ảnh Vào Kho Kỷ Yếu Lớp
              </h3>
              <p className="text-xs text-slate-500 font-serif italic">
                Hỗ trợ chọn và tải lên nhiều ảnh cùng lúc. Ảnh sẽ tự động lưu trữ trực tiếp vào kho kỷ yếu chung của lớp.
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
                {/* Ẩn input file, cho phép chọn multiple ảnh */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  disabled={isUploading || isProcessingFiles}
                  onChange={handlePhotoFileSelect}
                  className="hidden"
                  id="photo-file-upload-input"
                />

                {isProcessingFiles && (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs flex items-center justify-center gap-2 text-amber-800 mb-3">
                    <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
                    <span className="font-semibold">Đang xử lý và tối ưu hóa dung lượng ảnh đã chọn...</span>
                  </div>
                )}

                {pendingPhotos.length === 0 ? (
                  <div
                    onClick={() => !isProcessingFiles && !isUploading && fileInputRef.current?.click()}
                    className="border-2 border-dashed border-amber-300 hover:border-amber-500 bg-amber-50/40 hover:bg-amber-50/80 rounded-2xl p-7 sm:p-9 text-center cursor-pointer transition-all space-y-2.5 group"
                  >
                    <div className="w-13 h-13 rounded-full bg-amber-100 text-amber-700 mx-auto flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
                      <Upload className="w-6 h-6 text-amber-800" />
                    </div>
                    <div className="space-y-1">
                      <p className="font-serif font-bold text-slate-800 text-sm sm:text-base">
                        Bấm vào đây để chọn ảnh từ thiết bị
                      </p>
                      <p className="text-xs text-amber-800 font-sans font-medium">
                        ✨ Bạn có thể chọn một hoặc nhiều ảnh cùng lúc
                      </p>
                      <p className="text-[11px] text-slate-400 font-sans">
                        Hỗ trợ JPG, PNG, WEBP • Hệ thống tự động nén giữ độ nét HD
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Thanh thông tin & nút thao tác danh sách ảnh đã chọn */}
                    <div className="flex items-center justify-between gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
                      <span className="text-xs font-bold text-slate-700">
                        📸 Đã chọn: <span className="text-amber-700 font-mono text-sm">{pendingPhotos.length}</span> ảnh
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          disabled={isUploading}
                          onClick={() => fileInputRef.current?.click()}
                          className="px-2.5 py-1 bg-white hover:bg-amber-50 border border-slate-200 hover:border-amber-300 text-amber-900 rounded-lg text-xs font-semibold inline-flex items-center gap-1 cursor-pointer transition disabled:opacity-50"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Thêm ảnh nữa</span>
                        </button>
                        <button
                          type="button"
                          disabled={isUploading}
                          onClick={() => setPendingPhotos([])}
                          className="px-2 py-1 text-slate-400 hover:text-rose-600 rounded-lg text-xs font-sans inline-flex items-center gap-1 cursor-pointer transition disabled:opacity-50"
                          title="Xóa danh sách ảnh vừa chọn"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Xóa hết</span>
                        </button>
                      </div>
                    </div>

                    {/* Danh sách cuộn lưới các ảnh đã chọn */}
                    <div className="max-h-60 sm:max-h-64 overflow-y-auto pr-1 border border-slate-200 rounded-xl p-2 bg-slate-50/50">
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {pendingPhotos.map((item, idx) => (
                          <div key={item.id} className="relative group bg-white border border-slate-200 rounded-lg overflow-hidden p-1.5 flex flex-col gap-1 shadow-2xs">
                            <div className="aspect-[4/3] rounded-md overflow-hidden bg-slate-900 relative">
                              <img
                                src={item.preview}
                                alt={`Ảnh ${idx + 1}`}
                                className="w-full h-full object-cover"
                              />
                              <span className="absolute bottom-1 left-1 bg-black/70 backdrop-blur-xs text-[9px] text-white px-1.5 py-0.2 rounded font-mono">
                                #{idx + 1}
                              </span>
                              {!isUploading && (
                                <button
                                  type="button"
                                  onClick={() => handleRemovePendingPhoto(item.id)}
                                  className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 hover:bg-rose-600 text-white flex items-center justify-center transition-colors cursor-pointer"
                                  title="Bỏ ảnh này"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                            <input
                              type="text"
                              disabled={isUploading}
                              value={item.caption}
                              onChange={(e) => handleUpdatePendingCaption(item.id, e.target.value)}
                              placeholder="Chú thích ảnh..."
                              className="w-full px-1.5 py-0.5 bg-slate-50 border border-slate-200 rounded text-[10px] focus:outline-none focus:border-amber-500 text-slate-700 font-serif"
                              title="Bấm để sửa chú thích riêng cho ảnh này"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {pendingPhotos.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1 text-[11px]">
                      Thời gian / Niên khóa:
                    </label>
                    <input
                      type="text"
                      disabled={isUploading}
                      value={uploadDate}
                      onChange={(e) => setUploadDate(e.target.value)}
                      placeholder="VD: 2006, hoặc Họp lớp 10 năm..."
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-amber-500 bg-slate-50 text-xs font-serif"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1 text-[11px]">
                      Đặt chú thích chung (tùy chọn):
                    </label>
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        disabled={isUploading}
                        id="batch-caption-input"
                        placeholder="VD: Hội trại K8A1 2005..."
                        className="flex-1 px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-amber-500 bg-slate-50 text-xs font-serif"
                      />
                      <button
                        type="button"
                        disabled={isUploading}
                        onClick={() => {
                          const el = document.getElementById('batch-caption-input') as HTMLInputElement;
                          if (el && el.value.trim()) {
                            handleApplyBatchCaption(el.value.trim());
                          }
                        }}
                        className="px-2.5 py-1.5 bg-slate-200 hover:bg-amber-100 text-slate-700 hover:text-amber-900 rounded-lg text-[11px] font-sans font-semibold cursor-pointer shrink-0 transition"
                        title="Áp dụng tên này cho tất cả các ảnh ở trên"
                      >
                        Áp dụng
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Tiến trình Upload (Progress Bar) */}
              {isUploading && (
                <div className="space-y-1.5 p-3 bg-amber-50 rounded-xl border border-amber-200">
                  <div className="flex items-center justify-between text-xs font-bold text-amber-900">
                    <span className="flex items-center gap-1.5">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-600" />
                      <span>Đang tải lên: {uploadProgress.current}/{uploadProgress.total} ảnh...</span>
                    </span>
                    <span className="font-mono">{uploadProgress.percent}%</span>
                  </div>
                  <div className="w-full h-2 bg-amber-200/60 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 transition-all duration-300"
                      style={{ width: `${uploadProgress.percent}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-amber-700 font-serif italic text-center">
                    Ảnh đang được tải lên hệ thống, vui lòng giữ cửa sổ này mở...
                  </p>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleClosePhotoModal}
                  disabled={isUploading}
                  className="px-4 py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-sans font-semibold cursor-pointer disabled:opacity-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isUploading || pendingPhotos.length === 0}
                  className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-sans font-bold uppercase tracking-wider shadow-md transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Đang Tải ({uploadProgress.current}/{uploadProgress.total})...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      <span>{pendingPhotos.length > 0 ? `Tải Lên ${pendingPhotos.length} Ảnh` : 'Tải Lên Thư Viện'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 📹 MODAL CHÈN LINK VIDEO */}
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
                Chèn Link Video YouTube / Video Kỷ Niệm
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
                  placeholder="VD: https://youtu.be/... hoặc https://youtube.com/watch?v=..."
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-slate-50 font-mono text-xs"
                />
                <p className="text-[10px] text-slate-500 mt-1 font-sans italic">
                  * Hỗ trợ mọi định dạng link YouTube (watch, youtu.be, shorts) và video trực tiếp.
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
          onMouseMove={handleUserActivity}
          onTouchStart={handleUserActivity}
          onClick={handleUserActivity}
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between select-none overflow-hidden"
        >
          {/* 🌟 SLIDESHOW PROGRESS BAR (Top Edge) */}
          {isSlideshowActive && (
            <div className="absolute top-0 inset-x-0 h-1 bg-white/10 z-40">
              <div 
                className="h-full bg-gradient-to-r from-amber-400 via-amber-300 to-emerald-400 transition-all duration-75 ease-linear shadow-xs"
                style={{ width: `${slideshowProgress}%` }}
              />
            </div>
          )}

          {/* Top Bar */}
          <div className={`p-3 sm:p-4 md:px-6 bg-black/75 backdrop-blur-md border-b border-white/10 flex items-center justify-between z-30 transition-all duration-300 ${
            isControlsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
          }`}>
            <div className="flex items-center gap-2 sm:gap-3 text-white min-w-0">
              <span className="text-[11px] font-sans uppercase tracking-[0.15em] text-amber-400 font-bold shrink-0">
                ẢNH {selectedImageIndex! + 1} / {filteredImages.length}
              </span>
              <span className="hidden sm:inline-block text-white/30 text-xs shrink-0">|</span>
              <span className="hidden sm:inline-block text-xs font-serif text-white/80 truncate max-w-[280px] lg:max-w-[420px]">
                {currentImage.caption}
              </span>
            </div>

            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              {/* Nút Bật/Tắt Slide Show & Điều chỉnh tốc độ */}
              <div className="flex items-center gap-1 mr-1">
                <button
                  type="button"
                  onClick={toggleSlideshowPlay}
                  className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-sans font-bold flex items-center gap-1.5 transition cursor-pointer ${
                    isSlideshowActive && isSlideshowPlaying
                      ? 'bg-amber-400 text-slate-950 shadow-sm'
                      : isSlideshowActive
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                  title={isSlideshowPlaying ? 'Tạm dừng trình chiếu (Phím Space)' : 'Chạy tiếp trình chiếu (Phím Space)'}
                >
                  {isSlideshowActive && isSlideshowPlaying ? (
                    <>
                      <Pause className="w-3.5 h-3.5 fill-current" />
                      <span className="hidden xs:inline">Tạm dừng</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>{isSlideshowActive ? 'Tiếp tục' : 'Slide Show'}</span>
                    </>
                  )}
                </button>

                {/* Chọn tốc độ chạy Slide Show */}
                {isSlideshowActive && (
                  <div className="hidden sm:flex items-center gap-0.5 bg-white/10 rounded-lg p-0.5 text-[10.5px] font-mono">
                    {[
                      { label: '3s', ms: 3000 },
                      { label: '4.5s', ms: 4500 },
                      { label: '8s', ms: 8000 }
                    ].map(s => (
                      <button
                        key={s.ms}
                        type="button"
                        onClick={() => setSlideshowSpeed(s.ms)}
                        className={`px-1.5 py-0.5 rounded cursor-pointer transition ${
                          slideshowSpeed === s.ms ? 'bg-amber-400 text-slate-950 font-bold' : 'text-white/70 hover:text-white'
                        }`}
                        title={`Chuyển ảnh sau mỗi ${s.label}`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Nút Toàn Màn Hình Máy Chiếu */}
              <button
                type="button"
                onClick={toggleFullscreen}
                className="p-2 rounded text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title={isFullscreen ? 'Thu nhỏ cửa sổ (F)' : 'Toàn màn hình máy chiếu / LED (F)'}
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>

              <div className="w-px h-4 bg-white/20 mx-0.5 hidden xs:block" />

              {/* Zoom Controls */}
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
                className="px-2 py-1 rounded text-white/80 hover:text-white hover:bg-white/10 text-[11px] font-mono transition-colors cursor-pointer hidden xs:inline-block"
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

              <button
                type="button"
                onClick={closeFullscreen}
                className="p-2 rounded bg-white/10 text-white hover:bg-rose-600 transition-colors ml-1 cursor-pointer"
                title="Đóng (Esc)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Central Image Stage */}
          <div 
            className="flex-1 relative flex items-center justify-center overflow-hidden p-2 md:p-6"
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
              className={`absolute left-3 md:left-6 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-black/50 hover:bg-black/80 text-white/90 hover:text-white border border-white/20 backdrop-blur-xs shadow-lg cursor-pointer transition-opacity duration-300 ${
                isControlsVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
              title="Ảnh trước (←)"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              className={`absolute right-3 md:right-6 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-black/50 hover:bg-black/80 text-white/90 hover:text-white border border-white/20 backdrop-blur-xs shadow-lg cursor-pointer transition-opacity duration-300 ${
                isControlsVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
              title="Ảnh tiếp theo (→)"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            <div 
              className="max-w-full max-h-[72vh] sm:max-h-[78vh] flex items-center justify-center transition-transform duration-200 ease-out"
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
                className={`max-w-full max-h-[72vh] sm:max-h-[78vh] object-contain rounded-xl shadow-2xl border border-white/10 select-none transition-all duration-700 ease-out ${
                  isSlideshowActive && isSlideshowPlaying ? 'scale-[1.02]' : 'scale-100'
                }`}
                referrerPolicy="no-referrer"
                draggable={false}
              />
            </div>
          </div>

          {/* Bottom Info Bar with mini thumbnail navigator */}
          <div className={`p-3 md:px-8 bg-black/80 backdrop-blur-md border-t border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-3 text-white z-30 transition-all duration-300 ${
            isControlsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
          }`}>
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
                    setSlideshowProgress(0);
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
              <span className="hidden sm:inline">Phím tắt: Space (Dừng/Chạy), F (Toàn màn hình), ← → (Tua), Esc (Đóng)</span>
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

      {/* ======================================================== */}
      {/* 🚀 CỤM NÚT ĐIỀU HƯỚNG NHANH CUỐI PHÂN VÙNG KÝ ỨC */}
      {/* ======================================================== */}
      <div className="p-4 sm:p-6 bg-gradient-to-r from-[#FAF8F5] via-[#FFFDF8] to-[#FAF8F5] border border-amber-300/80 rounded-2xl space-y-3.5 text-left shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200/60 pb-2.5">
          <div className="space-y-0.5">
            <h4 className="font-serif font-bold text-sm sm:text-base text-[#1E293B]">
              Đại Gia Đình K8A1 — Hẹn Ngày Trở Về 20 Năm
            </h4>
            <p className="text-xs text-slate-500 font-serif italic">
              Hai mươi năm một chặng đường — Hãy cùng gặp lại để thanh xuân một lần nữa rực sáng!
            </p>
          </div>
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1E293B] hover:bg-slate-900 text-amber-300 text-xs font-sans font-bold rounded-xl transition cursor-pointer self-start sm:self-auto shrink-0 shadow-xs"
            title="Cuộn lên đầu trang"
          >
            <ArrowUp className="w-3.5 h-3.5 text-amber-400" />
            <span>Lên Đầu Trang</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 font-sans text-xs">
          <button
            type="button"
            onClick={() => {
              const el = document.getElementById('diem-danh') || document.getElementById('rsvp-form-card');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#8B1E2D] to-[#9B2234] hover:from-rose-700 hover:to-red-700 text-white font-bold shadow-xs cursor-pointer transition"
          >
            <CheckCircle2 className="w-4 h-4 text-amber-300 shrink-0" />
            <span>✍️ Điểm Danh Báo Có Mặt</span>
          </button>

          <button
            type="button"
            onClick={() => {
              document.getElementById('danh-sach-diem-danh')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-white hover:bg-amber-50 text-amber-950 border border-amber-300/80 font-bold shadow-2xs cursor-pointer transition"
          >
            <Users className="w-4 h-4 text-amber-600 shrink-0" />
            <span>👥 Xem Danh Sách Bạn Bè</span>
          </button>

          <button
            type="button"
            onClick={() => {
              document.getElementById('bank-transfer-card')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-white hover:bg-amber-50 text-amber-950 border border-amber-300/80 font-bold shadow-2xs cursor-pointer transition"
          >
            <Coins className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>💰 Xem Sổ Quỹ Lớp</span>
          </button>
        </div>
      </div>

    </div>
  );
}
