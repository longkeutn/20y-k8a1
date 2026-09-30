import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, Copy, Check, Share2, Sparkles, Folder, ExternalLink, 
  ShieldCheck, Film, Music, Clock, Layers, Tv, QrCode, 
  Download, Smartphone, CheckCircle2
} from 'lucide-react';
import { PhotoAlbum, MemoryImage, SlideTransitionType } from '../types';
import { SLIDE_TRANSITION_OPTIONS } from './StagePresentationHub';
import { generateSlideshowShortCode } from '../utils/slideshowShortCode';
import { normalizeAlbumId, getPhotoAlbumId } from '../data';

interface ShareSlideshowModalProps {
  isOpen: boolean;
  onClose: () => void;
  albums: PhotoAlbum[];
  images: MemoryImage[];
  defaultAlbumId?: string;
  defaultSubfolder?: string;
}

export const ShareSlideshowModal: React.FC<ShareSlideshowModalProps> = ({
  isOpen,
  onClose,
  albums,
  images,
  defaultAlbumId,
  defaultSubfolder
}) => {
  const [selectedAlbumId, setSelectedAlbumId] = useState<string>(defaultAlbumId || (albums[0]?.id || 'thanh-xuan-2003-2006'));
  const [selectedSubfolder, setSelectedSubfolder] = useState<string>(defaultSubfolder || 'all');
  const [speed, setSpeed] = useState<number>(5000);
  const [isMusicEnabled, setIsMusicEnabled] = useState<boolean>(true);
  const [transitionEffect, setTransitionEffect] = useState<SlideTransitionType>('alternate');
  const [activeTab, setActiveTab] = useState<'zalo' | 'tv'>('zalo');
  
  const [isCopiedLink, setIsCopiedLink] = useState<boolean>(false);
  const [isCopiedShort, setIsCopiedShort] = useState<boolean>(false);
  const [isCopiedZalo, setIsCopiedZalo] = useState<boolean>(false);
  const [isDownloadingQr, setIsDownloadingQr] = useState<boolean>(false);

  // Lắng nghe phím ESC để đóng modal nhanh
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Cập nhật khi props thay đổi
  useEffect(() => {
    if (defaultAlbumId) setSelectedAlbumId(defaultAlbumId);
    if (defaultSubfolder) setSelectedSubfolder(defaultSubfolder);
  }, [defaultAlbumId, defaultSubfolder, isOpen]);

  // Danh sách các thư mục con (subfolders) thuộc album đang chọn (Hỗ trợ cả Ảnh và Video)
  const availableSubfolders = useMemo(() => {
    const subMap = new Map<string, { total: number; photos: number; videos: number }>();
    const normSelected = normalizeAlbumId(selectedAlbumId);

    images.forEach(img => {
      const imgAlbum = normalizeAlbumId(img.albumId || getPhotoAlbumId(img));
      if (imgAlbum === normSelected) {
        const rawSub = (img.subfolderName || '').trim();
        if (
          rawSub && 
          !rawSub.toLowerCase().includes('thư mục không có tiêu đề') && 
          !rawSub.toLowerCase().includes('untitled')
        ) {
          const item = subMap.get(rawSub) || { total: 0, photos: 0, videos: 0 };
          item.total += 1;
          if (img.mediaType === 'video') {
            item.videos += 1;
          } else {
            item.photos += 1;
          }
          subMap.set(rawSub, item);
        }
      }
    });

    return Array.from(subMap.entries()).map(([name, s]) => ({
      name,
      count: s.total,
      photos: s.photos,
      videos: s.videos
    }));
  }, [images, selectedAlbumId]);

  // Thống kê số lượng Ảnh & Video theo bộ lọc đang chọn
  const matchingMedia = useMemo(() => {
    const normSelected = normalizeAlbumId(selectedAlbumId);
    const targetSub = selectedSubfolder !== 'all' ? selectedSubfolder.trim().toLowerCase() : null;

    const matched = images.filter(img => {
      const imgAlbum = normalizeAlbumId(img.albumId || getPhotoAlbumId(img));
      if (imgAlbum !== normSelected) return false;
      if (targetSub) {
        const sub = (img.subfolderName || '').trim().toLowerCase();
        return sub === targetSub || sub.includes(targetSub) || targetSub.includes(sub);
      }
      return true;
    });

    const photos = matched.filter(i => i.mediaType !== 'video').length;
    const videos = matched.filter(i => i.mediaType === 'video').length;
    return { total: matched.length, photos, videos };
  }, [images, selectedAlbumId, selectedSubfolder]);

  const matchingPhotosCount = matchingMedia.total;

  const mediaLabel = useMemo(() => {
    const parts = [];
    if (matchingMedia.photos > 0) parts.push(`${matchingMedia.photos} ảnh`);
    if (matchingMedia.videos > 0) parts.push(`${matchingMedia.videos} video`);
    if (parts.length === 0) return '0 mục';
    return parts.join(' • ');
  }, [matchingMedia]);

  const currentAlbum = useMemo(() => {
    return albums.find(a => a.id === selectedAlbumId) || albums[0];
  }, [albums, selectedAlbumId]);

  // 1. Tạo URL chia sẻ chuẩn (Gửi Zalo/Facebook có thẻ xem trước và không bị chặn)
  const shareUrl = useMemo(() => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://k8a1.vercel.app';
    const params = new URLSearchParams();
    params.set('view', 'slideshow');
    params.set('album', selectedAlbumId);
    if (selectedSubfolder && selectedSubfolder !== 'all') {
      params.set('folder', selectedSubfolder);
    }
    if (speed !== 5000) {
      params.set('speed', String(speed));
    }
    if (isMusicEnabled) {
      params.set('music', '1');
    }
    if (transitionEffect && transitionEffect !== 'alternate') {
      params.set('transition', transitionEffect);
    }
    return `${baseUrl}/?${params.toString()}`;
  }, [selectedAlbumId, selectedSubfolder, speed, isMusicEnabled, transitionEffect]);

  // 2. Tạo Mã số ngắn (Short Code) & Link siêu ngắn cho Smart TV
  const shortCode = useMemo(() => {
    return generateSlideshowShortCode(selectedAlbumId, selectedSubfolder, albums, images);
  }, [selectedAlbumId, selectedSubfolder, albums, images]);

  const shortTvUrl = useMemo(() => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://k8a1.vercel.app';
    return `${baseUrl}/?s=${shortCode}`;
  }, [shortCode]);

  // 3. Đường link ảnh Mã QR Code sắc nét từ qrserver
  const qrImageUrl = useMemo(() => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=450x450&data=${encodeURIComponent(
      shortTvUrl
    )}&color=0b1329&bgcolor=ffffff&margin=1`;
  }, [shortTvUrl]);

  // Bản tin mẫu gửi Zalo
  const zaloMessage = useMemo(() => {
    const folderText = selectedSubfolder && selectedSubfolder !== 'all' 
      ? `\n📁 Thư mục: ${selectedSubfolder}` 
      : '';
    return `📸 K8A1 THPT THÁI NGUYÊN (2003 — 2006)
✨ Thân mời các bạn cùng ngắm lại những khoảnh khắc kỷ niệm:
📂 Album: ${currentAlbum?.title || 'Kỷ Niệm K8A1'}${folderText} (${mediaLabel})
🎬 Xem trình chiếu ảnh tại đây:
👉 ${shareUrl}

(Chế độ xem trình chiếu tự động • Chúc các bạn có những phút giây hoài niệm thật đẹp!)`;
  }, [currentAlbum, selectedSubfolder, mediaLabel, shareUrl]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setIsCopiedLink(true);
      setTimeout(() => setIsCopiedLink(false), 2500);
    } catch {
      alert('Đã copy đường link: ' + shareUrl);
    }
  };

  const handleCopyShortLink = async () => {
    try {
      await navigator.clipboard.writeText(shortTvUrl);
      setIsCopiedShort(true);
      setTimeout(() => setIsCopiedShort(false), 2500);
    } catch {
      alert('Đã copy link TV: ' + shortTvUrl);
    }
  };

  const handleCopyZalo = async () => {
    try {
      await navigator.clipboard.writeText(zaloMessage);
      setIsCopiedZalo(true);
      setTimeout(() => setIsCopiedZalo(false), 2500);
    } catch {
      alert('Đã copy tin nhắn Zalo!');
    }
  };

  // Tải ảnh mã QR về máy để gửi vào Zalo hoặc in ấn
  const handleDownloadQr = async () => {
    setIsDownloadingQr(true);
    try {
      const response = await fetch(qrImageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `K8A1_QR_TrinhChieu_Album_${shortCode}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch {
      window.open(qrImageUrl, '_blank');
    } finally {
      setIsDownloadingQr(false);
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <div 
      className="fixed inset-0 z-[999999] flex items-center justify-center p-2.5 sm:p-4 bg-black/85 backdrop-blur-sm animate-fade-in font-sans"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl border border-amber-300 shadow-2xl max-w-xl w-full max-h-[92dvh] sm:max-h-[88vh] flex flex-col overflow-hidden text-left animate-scale-up"
        onClick={e => e.stopPropagation()}
      >
        {/* HEADER MODAL - CỐ ĐỊNH Ở TRÊN CÙNG, KHÔNG BAO GIỜ BỊ CHE */}
        <div className="shrink-0 px-4 sm:px-5 py-3 sm:py-3.5 bg-gradient-to-r from-amber-700 via-amber-800 to-amber-900 text-white flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shrink-0">
              <Film className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-amber-100 font-serif truncate">
                Chia Sẻ Ký Ức & Chiếu Lên Smart TV
              </h3>
              <p className="text-[11px] text-amber-200/80 truncate">
                {currentAlbum?.title} • {mediaLabel}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-xl text-amber-200 hover:text-white hover:bg-white/15 transition cursor-pointer shrink-0 ml-2"
            title="Đóng cửa sổ (Phím Esc)"
            aria-label="Đóng cửa sổ"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* BODY TÙY CHỈNH - CUỘN MƯỢT BÊN TRONG, KHÔNG BỊ TRÀN RA NGOÀI */}
        <div className="flex-1 overflow-y-auto min-h-0 p-4 sm:p-5 space-y-4">
          {/* 1. CHỌN ALBUM */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              1. Chọn Album kỷ niệm muốn chia sẻ:
            </label>
            <select
              value={selectedAlbumId}
              onChange={(e) => {
                setSelectedAlbumId(e.target.value);
                setSelectedSubfolder('all'); // Reset subfolder khi đổi album
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-amber-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
            >
              {albums.map((alb, idx) => (
                <option key={alb.id} value={alb.id}>
                  #{idx + 1} • {alb.title} {alb.period ? `(${alb.period})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* 2. CHỌN FOLDER CON CẤP 2 (NẾU CÓ) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Folder className="w-3.5 h-3.5 text-amber-600" />
                <span>2. Chọn Thư mục con (Folder con):</span>
              </label>
              <span className="text-[11px] font-semibold text-emerald-700 font-mono">
                {mediaLabel} sẵn sàng
              </span>
            </div>
            
            {availableSubfolders.length > 0 ? (
              <select
                value={selectedSubfolder}
                onChange={(e) => setSelectedSubfolder(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-amber-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
              >
                <option value="all">
                  ✨ Toàn bộ Album này (Tất cả {availableSubfolders.length} thư mục con)
                </option>
                {availableSubfolders.map(sub => {
                  const parts = [];
                  if (sub.photos > 0) parts.push(`${sub.photos} ảnh`);
                  if (sub.videos > 0) parts.push(`${sub.videos} video`);
                  const countLabel = parts.join(', ') || `${sub.count} mục`;
                  return (
                    <option key={sub.name} value={sub.name}>
                      📁 {sub.name} ({countLabel})
                    </option>
                  );
                })}
              </select>
            ) : (
              <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-800">
                Album này chưa phân chia thư mục con riêng biệt. Link sẽ tự động trình chiếu toàn bộ ảnh trong album.
              </div>
            )}
          </div>

          {/* 3. TÙY CHỈNH TRÌNH CHIẾU */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-600 flex items-center gap-1">
                <Clock className="w-3 h-3 text-amber-600" />
                <span>Tốc độ đổi ảnh:</span>
              </label>
              <select
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-800"
              >
                <option value={3000}>Nhanh (3 giây / ảnh)</option>
                <option value={5000}>Vừa phải (5 giây / ảnh)</option>
                <option value={8000}>Chậm rãi (8 giây / ảnh)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-600 flex items-center gap-1">
                <Music className="w-3 h-3 text-amber-600" />
                <span>Nhạc nền hoài niệm:</span>
              </label>
              <select
                value={isMusicEnabled ? 'yes' : 'no'}
                onChange={(e) => setIsMusicEnabled(e.target.value === 'yes')}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-800"
              >
                <option value="yes">Bật sẵn nhạc nền</option>
                <option value="no">Tắt nhạc (Im lặng)</option>
              </select>
            </div>

            <div className="space-y-1 col-span-2">
              <label className="text-[11px] font-semibold text-slate-600 flex items-center gap-1">
                <Layers className="w-3 h-3 text-amber-600" />
                <span>Hiệu ứng chuyển cảnh ảnh (Đồng bộ Màn LED & Web):</span>
              </label>
              <select
                value={transitionEffect}
                onChange={(e) => setTransitionEffect(e.target.value as SlideTransitionType)}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-800"
              >
                {SLIDE_TRANSITION_OPTIONS.map(opt => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label} — {opt.desc}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 4. CHUYỂN ĐỔI CHẾ ĐỘ CHIA SẺ (ZALO vs SMART TV & QR CODE) */}
          <div className="pt-2 border-t border-slate-200">
            <div className="flex rounded-xl bg-slate-100 p-1 mb-3">
              <button
                type="button"
                onClick={() => setActiveTab('zalo')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'zalo'
                    ? 'bg-white text-amber-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>1. Gửi Zalo & Mạng Xã Hội</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('tv')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'tv'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Tv className="w-3.5 h-3.5" />
                <span>2. Chiếu Smart TV & Mã QR</span>
              </button>
            </div>

            {/* TAB 1: GỬI ZALO / MẠNG XÃ HỘI */}
            {activeTab === 'zalo' && (
              <div className="space-y-3 animate-fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">Link chia sẻ an toàn chính chủ:</span>
                  <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-semibold font-mono">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Đã Đóng Dấu Watermark • Chống Tải</span>
                  </div>
                </div>

                <div className="p-2.5 bg-slate-100 border border-slate-300 rounded-xl font-mono text-[11px] text-slate-800 break-all select-all flex items-center justify-between gap-2">
                  <span className="truncate">{shareUrl}</span>
                </div>

                {/* Cam kết bảo mật thông minh */}
                <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl text-[11px] text-emerald-900 space-y-1.5 leading-relaxed">
                  <p className="font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Cam kết bảo vệ tư liệu ảnh K8A1:</span>
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-emerald-800">
                    <li>Người nhận link <strong>chỉ xem được ảnh dạng trình chiếu rạp phim</strong>.</li>
                    <li><strong>Đã đóng dấu bản quyền Watermark K8A1 trực tiếp lên từng ảnh</strong>.</li>
                    <li>Đã khóa tải ảnh, chặn chuột phải, chặn kéo thả và chặn phím tắt lưu ảnh.</li>
                    <li><strong>Cô lập hoàn toàn khỏi trang web gốc</strong>: Người xem không thể xem Quỹ lớp, Danh bạ hay link Google Drive.</li>
                  </ul>
                </div>
              </div>
            )}

            {/* TAB 2: SMART TV & MÃ QR CODE */}
            {activeTab === 'tv' && (
              <div className="space-y-3 animate-fade-in">
                {/* Khung Mã QR và Thông tin TV */}
                <div className="flex flex-col sm:flex-row items-center gap-4 p-3.5 bg-gradient-to-br from-amber-50 to-orange-50/60 border border-amber-200 rounded-2xl">
                  {/* Ảnh Mã QR */}
                  <div className="relative group shrink-0 bg-white p-2 rounded-xl border border-amber-300 shadow-md">
                    <img 
                      src={qrImageUrl} 
                      alt="Mã QR Trình Chiếu K8A1" 
                      className="w-32 h-32 sm:w-36 sm:h-36 object-contain"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-slate-900/85 text-amber-200 text-[10px] text-center font-mono py-0.5 rounded-b-lg">
                      Mã TV: #{shortCode}
                    </div>
                  </div>

                  {/* Thông tin link ngắn & nút tải QR */}
                  <div className="flex-1 space-y-2 text-left w-full">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-amber-800 font-mono tracking-wider">
                        Đường dẫn siêu ngắn cho Smart TV:
                      </span>
                      <div className="flex items-center gap-2 mt-1">
                        <input
                          type="text"
                          readOnly
                          value={shortTvUrl}
                          className="w-full px-2.5 py-1.5 bg-white border border-amber-300 rounded-lg text-xs font-mono text-slate-800 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={handleCopyShortLink}
                          className="px-2.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold shrink-0 transition cursor-pointer"
                          title="Sao chép link ngắn"
                        >
                          {isCopiedShort ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleDownloadQr}
                      disabled={isDownloadingQr}
                      className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-white hover:bg-amber-100/70 border border-amber-400 text-amber-900 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-amber-700" />
                      <span>{isDownloadingQr ? 'Đang tải QR...' : 'Tải Ảnh Mã QR Về Máy'}</span>
                    </button>
                  </div>
                </div>

                {/* Hướng dẫn kết nối Smart TV 2 cách */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs text-slate-700">
                  <p className="font-bold text-slate-900 flex items-center gap-1">
                    <Smartphone className="w-3.5 h-3.5 text-amber-600" />
                    <span>Cách phát lên Smart TV cực nhanh:</span>
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] leading-relaxed">
                    <div className="p-2 bg-white rounded-lg border border-slate-200">
                      <p className="font-semibold text-amber-800 mb-0.5">🍎 Dành cho iPhone / iPad:</p>
                      <p>Mở slide trên điện thoại ➔ Vuốt góc trên màn hình ➔ Bấm <strong>Phản chiếu màn hình (AirPlay)</strong> ➔ Chọn Smart TV.</p>
                    </div>
                    <div className="p-2 bg-white rounded-lg border border-slate-200">
                      <p className="font-semibold text-blue-800 mb-0.5">🤖 Dành cho Samsung / Android:</p>
                      <p>Mở slide trên điện thoại ➔ Vuốt thanh công cụ xuống ➔ Chọn <strong>Smart View</strong> hoặc <strong>Truyền màn hình</strong> ➔ Chọn TV.</p>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-500 italic">
                    💡 Hoặc dùng điều khiển Smart TV mở ứng dụng Trình duyệt web và gõ link ngắn: <strong className="font-mono text-slate-700">{shortTvUrl}</strong>
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* FOOTER ACTIONS - CỐ ĐỊNH Ở DƯỚI CÙNG, KHÔNG BAO GIỜ BỊ CHE */}
        <div className="shrink-0 p-3 sm:p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 shadow-xs">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 border border-slate-300 transition cursor-pointer"
            >
              Đóng
            </button>

            <a
              href={shareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition"
              title="Mở tab mới xem thử giao diện trình chiếu của người nhận"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Xem Thử</span>
            </a>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyZalo}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer border ${
                isCopiedZalo 
                  ? 'bg-emerald-600 border-emerald-700 text-white' 
                  : 'bg-white border-blue-400 text-blue-700 hover:bg-blue-50'
              }`}
              title="Copy mẫu tin nhắn Zalo kèm lời mời"
            >
              {isCopiedZalo ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{isCopiedZalo ? 'Đã Copy Zalo!' : 'Copy Tin Zalo'}</span>
            </button>

            <button
              onClick={handleCopyLink}
              className={`inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer shadow-sm ${
                isCopiedLink 
                  ? 'bg-emerald-600 text-white shadow-emerald-500/20' 
                  : 'bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white shadow-amber-600/20'
              }`}
            >
              {isCopiedLink ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
              <span>{isCopiedLink ? 'Đã Copy Link!' : 'Sao Chép Link'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
};
