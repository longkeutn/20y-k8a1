import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Camera, 
  Image as ImageIcon, 
  Video, 
  HelpCircle, 
  Upload, 
  Eye, 
  Loader2, 
  ArrowRight,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  X,
  ExternalLink
} from 'lucide-react';
import { MemoryImage, MemoryVideo } from '../types';
import NostalgiaTimeline from './NostalgiaTimeline';

interface MemoryCornerProps {
  appsScriptUrl: string;
  images: MemoryImage[];
  videos: MemoryVideo[];
  onAddImage: (newImage: MemoryImage) => void;
}

export default function MemoryCorner({ appsScriptUrl, images, videos, onAddImage }: MemoryCornerProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isNativeFullscreen, setIsNativeFullscreen] = useState(false);
  const [showDriveGuide, setShowDriveGuide] = useState(false);
  const [uploaderName, setUploaderName] = useState('');
  const [caption, setCaption] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const lightboxRef = useRef<HTMLDivElement | null>(null);

  const currentImage = selectedImageIndex !== null ? images[selectedImageIndex] : null;

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

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(Number((prev + 0.3).toFixed(1)), 3));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(Number((prev - 0.3).toFixed(1)), 1));
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
  };

  const handleToggleNativeFullscreen = () => {
    if (!document.fullscreenElement) {
      if (lightboxRef.current?.requestFullscreen) {
        lightboxRef.current.requestFullscreen().catch(() => {});
      } else if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
  };

  // Listen to native fullscreen changes
  useEffect(() => {
    const handleFsChange = () => {
      setIsNativeFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Keyboard navigation shortcuts
  useEffect(() => {
    if (selectedImageIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeFullscreen();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === '+' || e.key === '=') {
        handleZoomIn();
      } else if (e.key === '-') {
        handleZoomOut();
      } else if (e.key === '0') {
        handleResetZoom();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImageIndex, handlePrev, handleNext]);

  // Prevent background body scroll when lightbox is open
  useEffect(() => {
    if (selectedImageIndex !== null) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedImageIndex]);

  // Read and convert file to base64 for submission
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!uploaderName.trim()) {
      setUploadError('Vui lòng nhập tên người gửi trước khi chọn ảnh!');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    setUploadSuccess(null);

    const reader = new FileReader();
    reader.onload = async () => {
      const base64Data = reader.result as string;

      if (appsScriptUrl && appsScriptUrl.startsWith('http')) {
        // Real upload to Google Drive via Google Apps Script
        try {
          await fetch(appsScriptUrl, {
            method: 'POST',
            mode: 'no-cors', // Standard Google Apps Script POST
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              action: 'upload_photo',
              uploaderName: uploaderName.trim(),
              fileData: base64Data
            })
          });

          const simulatedNewImg: MemoryImage = {
            id: `user-${Date.now()}`,
            url: base64Data,
            caption: caption.trim() || `Ảnh gửi từ bạn ${uploaderName}`,
            date: 'Mới đăng tải',
            isUserUploaded: true
          };

          onAddImage(simulatedNewImg);
          setUploadSuccess('Ảnh của bạn đã được gửi thành công lên thư mục Google Drive của lớp! ❤️');
          setCaption('');
          if (fileInputRef.current) fileInputRef.current.value = '';
        } catch (error) {
          console.error('Lỗi khi tải lên Google Drive:', error);
          setUploadError('Có lỗi xảy ra khi truyền ảnh lên Google Drive. Đã tạm thời lưu hiển thị cục bộ!');
          
          const localNewImg: MemoryImage = {
            id: `user-${Date.now()}`,
            url: base64Data,
            caption: caption.trim() || `Ảnh gửi từ bạn ${uploaderName}`,
            date: 'Mới đăng tải',
            isUserUploaded: true
          };
          onAddImage(localNewImg);
        } finally {
          setIsUploading(false);
        }
      } else {
        // Simulation mode
        setTimeout(() => {
          const simulatedNewImg: MemoryImage = {
            id: `user-${Date.now()}`,
            url: base64Data,
            caption: caption.trim() || `Ảnh gửi từ bạn ${uploaderName}`,
            date: 'Mới đăng tải (Giả lập)',
            isUserUploaded: true
          };

          onAddImage(simulatedNewImg);
          setUploadSuccess('Giả lập tải ảnh thành công! Ảnh đã được hiển thị trực tiếp lên Bộ sưu tập.');
          setCaption('');
          if (fileInputRef.current) fileInputRef.current.value = '';
          setIsUploading(false);
        }, 1000);
      }
    };

    reader.onerror = () => {
      setUploadError('Lỗi đọc file từ thiết bị.');
      setIsUploading(false);
    };

    reader.readAsDataURL(file);
  };

  const triggerFileInput = () => {
    if (!uploaderName.trim()) {
      setUploadError('Vui lòng điền Tên người gửi trước để BTC biết ai đã tải ảnh lên nhé! 😊');
      return;
    }
    fileInputRef.current?.click();
  };

  return (
    <div id="memory-corner-section" className="space-y-8">
      {/* Memories Video - Editorial Style */}
      <div id="memories-video-card" className="bg-white rounded-sm p-6 md:p-8 shadow-xs border border-brand-border space-y-4">
        <div className="flex items-center justify-between border-b border-brand-border pb-3">
          <div className="flex items-center gap-2">
            <Video className="w-4 h-4 text-brand-gold" />
            <h3 className="text-xs uppercase tracking-[0.2em] font-sans font-bold text-brand-text">Thước Phim Ngày Ấy</h3>
          </div>
          <button
            type="button"
            onClick={() => setShowDriveGuide(!showDriveGuide)}
            className="flex items-center gap-1 text-[10px] uppercase font-sans tracking-wider text-brand-gold hover:underline font-bold cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Cách lấy link?</span>
          </button>
        </div>

        {showDriveGuide && (
          <div className="bg-[#FAF9F6] p-4 rounded-sm text-xs space-y-2 border border-brand-border leading-relaxed text-brand-text-muted font-serif italic">
            <p className="font-bold text-brand-text font-sans uppercase tracking-wider not-italic text-[10px]">Cách nhúng video từ Google Drive vào web:</p>
            <ol className="list-decimal pl-4 space-y-1">
              <li>Mở video trên Google Drive bằng máy tính.</li>
              <li>Bấm vào biểu tượng <strong>Ba chấm đứng</strong> ở góc trên bên phải → chọn <strong>Mở trong cửa sổ mới</strong>.</li>
              <li>Trong cửa sổ mới, bấm tiếp vào <strong>Ba chấm đứng</strong> → chọn <strong>Nhúng mục...</strong>.</li>
              <li>Sao chép thuộc tính <code>src</code> (ví dụ: <code>https://drive.google.com/file/d/.../preview</code>) hoặc dán toàn bộ mã iframe.</li>
            </ol>
            <button
              type="button"
              onClick={() => setShowDriveGuide(false)}
              className="text-brand-gold hover:underline font-sans font-bold uppercase tracking-wider text-[10px] not-italic block mt-1 cursor-pointer"
            >
              Đóng hướng dẫn
            </button>
          </div>
        )}

        {videos.map((vid) => (
          <div key={vid.id} className="space-y-2">
            <div className="overflow-hidden rounded-sm border border-brand-border bg-black shadow-inner aspect-video relative">
              <iframe
                title={vid.title}
                src={vid.embedUrl}
                width="100%"
                height="100%"
                className="absolute inset-0"
                allow="autoplay; encrypted-media"
                allowFullScreen
                loading="lazy"
              ></iframe>
            </div>
            <p className="text-xs text-center font-serif italic text-brand-text-muted pt-1">
              {vid.title}
            </p>
          </div>
        ))}
      </div>

      {/* 20-Year Nostalgia Timeline Embedded */}
      <NostalgiaTimeline />

      {/* Photo Gallery Grid - Editorial Style */}
      <div id="memories-gallery-card" className="bg-white rounded-sm p-6 md:p-8 shadow-xs border border-brand-border space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-brand-border pb-4 text-left">
          <div className="space-y-1">
            <span className="text-[10px] font-bold tracking-[0.2em] font-sans text-brand-gold uppercase flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5" />
              <span>KÝ ỨC HỌC TRÒ</span>
            </span>
            <h3 className="text-xl font-light text-brand-text font-serif">Thư Viện Ảnh Lớp Mình</h3>
            <p className="text-xs text-brand-text-muted font-serif italic">
              Nơi thời gian dừng lại. Bấm nút "Xem ảnh toàn màn hình" trên từng ảnh để ngắm nhìn rõ nét từng gương mặt bạn bè.
            </p>
          </div>

          <div className="text-[10px] font-sans uppercase tracking-wider text-brand-text-muted bg-[#FAF9F6] border border-brand-border px-3 py-1.5 rounded-sm self-start sm:self-auto shrink-0">
            Tổng cộng: <strong className="text-brand-text font-bold">{images.length} khoảnh khắc</strong>
          </div>
        </div>

        {/* Gallery Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {images.map((img, index) => (
            <div
              key={img.id}
              className="group overflow-hidden rounded-sm border border-brand-border bg-white shadow-xs hover:border-brand-gold hover:shadow-md transition-all duration-300 flex flex-col justify-between"
            >
              {/* Clickable Image Container */}
              <div
                onClick={() => openFullscreen(index)}
                className="relative aspect-4/3 overflow-hidden bg-brand-bg cursor-pointer flex items-center justify-center group"
                title="Bấm để xem ảnh phóng to toàn màn hình"
              >
                <img
                  src={img.url}
                  alt={img.caption}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />

                {/* Hover overlay with button on desktop */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-3">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-white/95 text-brand-text text-[11px] font-sans font-bold uppercase tracking-wider shadow-md backdrop-blur-xs transform translate-y-1 group-hover:translate-y-0 transition-transform">
                    <Maximize2 className="w-3.5 h-3.5 text-brand-gold" />
                    <span>Xem ảnh toàn màn hình</span>
                  </span>
                </div>

                {img.isUserUploaded && (
                  <div className="absolute top-2 left-2 bg-brand-text text-white text-[9px] uppercase font-sans tracking-wider font-bold px-2 py-0.5 rounded-xs shadow-xs z-10">
                    Mới tải lên
                  </div>
                )}
              </div>

              {/* Photo Card Details & Dedicated Fullscreen Action Button */}
              <div className="p-3.5 bg-white space-y-3 flex-1 flex flex-col justify-between border-t border-brand-border/40">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-brand-text line-clamp-2 leading-snug font-serif">
                    {img.caption}
                  </p>
                  {img.date && (
                    <p className="text-[10px] text-brand-text-muted font-sans uppercase tracking-wider">
                      {img.date}
                    </p>
                  )}
                </div>

                {/* Explicit, dedicated button requested by user */}
                <button
                  type="button"
                  id={`btn-fullscreen-${img.id}`}
                  onClick={() => openFullscreen(index)}
                  className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-sm bg-[#FAF9F6] hover:bg-brand-text hover:text-white border border-brand-border text-brand-text text-[10px] uppercase font-sans font-bold tracking-wider transition-all duration-200 cursor-pointer shadow-2xs group/btn"
                  title="Xem ảnh toàn màn hình chi tiết"
                >
                  <Maximize2 className="w-3.5 h-3.5 text-brand-gold group-hover/btn:text-brand-gold-light shrink-0" />
                  <span>Xem ảnh toàn màn hình</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Photo Upload Form - Editorial Style */}
      <div id="photo-upload-card" className="bg-white rounded-sm p-6 md:p-8 shadow-xs border border-brand-border space-y-5">
        <div className="text-left space-y-1.5 border-b border-brand-border pb-4">
          <span className="text-[10px] font-bold tracking-[0.2em] font-sans text-brand-gold uppercase">GÓP ẢNH CHUNG VUI</span>
          <h4 className="text-lg font-light text-brand-text font-serif">Đóng Góp Hình Ảnh Kỷ Niệm</h4>
          <p className="text-xs text-brand-text-muted font-serif italic">
            Gửi những bức ảnh tự chụp, ảnh ngày xưa hoặc ảnh trực tiếp tại sự kiện để ban tổ chức lưu giữ và cập nhật vào thư mục chung của lớp nhé!
          </p>
        </div>

        <div className="space-y-6 max-w-md">
          <div>
            <label htmlFor="uploaderName" className="block text-[10px] font-sans font-bold uppercase tracking-wider text-brand-text mb-1">
              Tên người gửi <span className="text-brand-rose">*</span>
            </label>
            <input
              type="text"
              id="uploaderName"
              placeholder="Nhập tên của bạn để lưu danh"
              required
              value={uploaderName}
              onChange={(e) => setUploaderName(e.target.value)}
              className="w-full border-b border-brand-border py-2 text-sm focus:outline-none focus:border-brand-gold bg-transparent text-brand-text transition-all"
            />
          </div>

          <div>
            <label htmlFor="imageCaption" className="block text-[10px] font-sans font-bold uppercase tracking-wider text-brand-text mb-1">
              Lời tựa cho bức ảnh (Không bắt buộc)
            </label>
            <input
              type="text"
              id="imageCaption"
              placeholder="Ví dụ: Đội bóng lớp mình năm 2005"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full border-b border-brand-border py-2 text-sm focus:outline-none focus:border-brand-gold bg-transparent text-brand-text transition-all"
            />
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />

          {uploadError && (
            <div className="p-3 bg-red-50 border border-red-100 text-xs text-red-600 rounded-sm">
              {uploadError}
            </div>
          )}

          {uploadSuccess && (
            <div className="p-3.5 bg-brand-gold-light/50 border border-brand-border text-xs text-brand-text rounded-sm leading-relaxed italic">
              {uploadSuccess}
            </div>
          )}

          <button
            type="button"
            onClick={triggerFileInput}
            disabled={isUploading}
            className="w-full bg-brand-text hover:bg-brand-text/90 text-white font-sans font-bold text-xs uppercase tracking-widest py-3.5 px-4 rounded-sm shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Đang truyền tải ảnh lên Google Drive...
              </>
            ) : (
              <>
                <Upload className="w-3.5 h-3.5" />
                Chọn Ảnh Từ Máy & Gửi Ngay
              </>
            )}
          </button>
        </div>
      </div>

      {/* Fullscreen Photo Lightbox Modal With Zoom & Detail Inspector */}
      {currentImage && (
        <div
          ref={lightboxRef}
          id="photo-lightbox-modal"
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between select-none"
        >
          {/* Top Control Bar */}
          <div className="p-4 md:px-6 bg-black/60 border-b border-white/10 flex items-center justify-between z-20">
            <div className="flex items-center gap-3 text-white">
              <span className="text-[11px] font-sans uppercase tracking-[0.15em] text-brand-gold font-bold">
                ẢNH {selectedImageIndex! + 1} / {images.length}
              </span>
              <span className="hidden sm:inline-block text-white/30 text-xs">|</span>
              <span className="hidden sm:inline-block text-xs font-serif text-white/80 truncate max-w-[280px]">
                {currentImage.caption}
              </span>
            </div>

            {/* Viewer action tools: Zoom In, Zoom Out, Reset, Fullscreen, Open in new tab, Close */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={handleZoomOut}
                disabled={zoomLevel <= 1}
                className="p-2 rounded-sm text-white/80 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
                title="Thu nhỏ ảnh (-)"
              >
                <ZoomOut className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleResetZoom}
                className="px-2 py-1 rounded-sm text-white/80 hover:text-white hover:bg-white/10 text-[11px] font-mono transition-colors cursor-pointer"
                title="Khôi phục kích thước ban đầu (100%)"
              >
                {Math.round(zoomLevel * 100)}%
              </button>

              <button
                type="button"
                onClick={handleZoomIn}
                disabled={zoomLevel >= 3}
                className="p-2 rounded-sm text-white/80 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
                title="Phóng to ảnh để xem chi tiết (+)"
              >
                <ZoomIn className="w-4 h-4" />
              </button>

              <div className="w-px h-4 bg-white/20 mx-1 hidden xs:block" />

              <button
                type="button"
                onClick={handleToggleNativeFullscreen}
                className="p-2 rounded-sm text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer hidden xs:flex items-center"
                title={isNativeFullscreen ? "Thoát toàn màn hình trình duyệt" : "Toàn màn hình trình duyệt (F11)"}
              >
                {isNativeFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>

              <a
                href={currentImage.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-sm text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer inline-flex items-center"
                title="Mở ảnh gốc trong tab mới"
              >
                <ExternalLink className="w-4 h-4" />
              </a>

              <button
                type="button"
                onClick={closeFullscreen}
                className="p-2 rounded-sm bg-white/10 text-white hover:bg-white/20 transition-colors ml-2 cursor-pointer"
                title="Đóng chế độ xem (Phím Esc)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Central Image Stage with Navigation Chevrons */}
          <div 
            className="flex-1 relative flex items-center justify-center overflow-hidden p-2 md:p-8"
            onClick={(e) => {
              // Clicking outside the image closes or resets zoom
              if (e.target === e.currentTarget) {
                closeFullscreen();
              }
            }}
          >
            {/* Previous Photo Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-black/50 hover:bg-black/80 text-white/90 hover:text-white border border-white/20 backdrop-blur-xs transition-all shadow-lg cursor-pointer"
              title="Xem ảnh trước (Phím mũi tên trái ←)"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            {/* Next Photo Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-black/50 hover:bg-black/80 text-white/90 hover:text-white border border-white/20 backdrop-blur-xs transition-all shadow-lg cursor-pointer"
              title="Xem ảnh kế tiếp (Phím mũi tên phải →)"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* The Image Element with Zoom transform */}
            <div 
              className="max-w-full max-h-[75vh] flex items-center justify-center transition-transform duration-200 ease-out cursor-zoom-in"
              style={{
                transform: `scale(${zoomLevel})`,
                cursor: zoomLevel > 1 ? 'grab' : 'zoom-in'
              }}
              onClick={(e) => {
                e.stopPropagation();
                // Toggle zoom between 1x and 1.8x on click
                if (zoomLevel === 1) {
                  setZoomLevel(1.8);
                } else {
                  setZoomLevel(1);
                }
              }}
              title="Bấm đúp hoặc nhấp để phóng to / thu nhỏ ảnh"
            >
              <img
                src={currentImage.url}
                alt={currentImage.caption}
                className="max-w-full max-h-[75vh] object-contain rounded-xs shadow-2xl border border-white/10 select-none"
                referrerPolicy="no-referrer"
                draggable={false}
              />
            </div>
          </div>

          {/* Bottom Info Bar: Caption, Date, and Viewer Helper Keys */}
          <div className="p-4 md:px-8 bg-black/75 border-t border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-3 text-white z-20">
            <div className="space-y-1 text-left">
              <p className="text-sm md:text-base font-serif italic text-white font-medium">
                "{currentImage.caption}"
              </p>
              {currentImage.date && (
                <p className="text-[11px] text-white/60 font-sans uppercase tracking-wider">
                  Thời gian: {currentImage.date}
                </p>
              )}
            </div>

            <div className="flex items-center gap-3 text-[10px] text-white/50 font-sans">
              <span className="hidden sm:inline">Phím tắt: ← → chuyển ảnh, +/- phóng to, Esc đóng</span>
              <button
                type="button"
                onClick={closeFullscreen}
                className="px-3 py-1 bg-white/15 hover:bg-white/25 rounded-xs text-white uppercase tracking-wider font-bold cursor-pointer"
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

