import React, { useState, useMemo, useEffect } from 'react';
import { 
  X, Copy, Check, Share2, Sparkles, Folder, ExternalLink, 
  ShieldCheck, Film, Play, Music, Clock, Layers
} from 'lucide-react';
import { PhotoAlbum, MemoryImage, SlideTransitionType } from '../types';
import { SLIDE_TRANSITION_OPTIONS } from './StagePresentationHub';

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
  const [isCopiedLink, setIsCopiedLink] = useState<boolean>(false);
  const [isCopiedZalo, setIsCopiedZalo] = useState<boolean>(false);

  // Cập nhật khi props thay đổi
  useEffect(() => {
    if (defaultAlbumId) setSelectedAlbumId(defaultAlbumId);
    if (defaultSubfolder) setSelectedSubfolder(defaultSubfolder);
  }, [defaultAlbumId, defaultSubfolder, isOpen]);

  // Danh sách các thư mục con (subfolders) thuộc album đang chọn
  const availableSubfolders = useMemo(() => {
    const subMap = new Map<string, number>();
    images.forEach(img => {
      if ((img.albumId || '').toLowerCase() === selectedAlbumId.toLowerCase()) {
        const rawSub = (img.subfolderName || '').trim();
        if (
          rawSub && 
          !rawSub.toLowerCase().includes('thư mục không có tiêu đề') && 
          !rawSub.toLowerCase().includes('untitled')
        ) {
          subMap.set(rawSub, (subMap.get(rawSub) || 0) + 1);
        }
      }
    });

    return Array.from(subMap.entries()).map(([name, count]) => ({
      name,
      count
    }));
  }, [images, selectedAlbumId]);

  // Tổng số ảnh theo bộ lọc đang chọn
  const matchingPhotosCount = useMemo(() => {
    return images.filter(img => {
      if (img.mediaType === 'video') return false;
      const matchAlbum = (img.albumId || '').toLowerCase() === selectedAlbumId.toLowerCase();
      if (!matchAlbum) return false;
      if (selectedSubfolder !== 'all') {
        const sub = (img.subfolderName || '').trim().toLowerCase();
        return sub === selectedSubfolder.trim().toLowerCase();
      }
      return true;
    }).length;
  }, [images, selectedAlbumId, selectedSubfolder]);

  const currentAlbum = useMemo(() => {
    return albums.find(a => a.id === selectedAlbumId) || albums[0];
  }, [albums, selectedAlbumId]);

  // Tạo URL chia sẻ an toàn (Sử dụng URL chuẩn ?view=slideshow hoạt động 100% trên Zalo, Facebook và mọi trình duyệt)
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

  // Bản tin mẫu gửi Zalo
  const zaloMessage = useMemo(() => {
    const folderText = selectedSubfolder && selectedSubfolder !== 'all' 
      ? `\n📁 Thư mục: ${selectedSubfolder}` 
      : '';
    return `📸 K8A1 THPT THÁI NGUYÊN (2003 — 2006)
✨ Thân mời các bạn cùng ngắm lại những khoảnh khắc kỷ niệm:
📂 Album: ${currentAlbum?.title || 'Kỷ Niệm K8A1'}${folderText} (${matchingPhotosCount} bức ảnh)
🎬 Xem trình chiếu ảnh tại đây:
👉 ${shareUrl}

(Chế độ xem trình chiếu tự động • Chúc các bạn có những phút giây hoài niệm thật đẹp!)`;
  }, [currentAlbum, selectedSubfolder, matchingPhotosCount, shareUrl]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setIsCopiedLink(true);
      setTimeout(() => setIsCopiedLink(false), 2500);
    } catch {
      alert('Đã copy đường link: ' + shareUrl);
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100000] flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-fade-in font-sans">
      <div 
        className="bg-white rounded-2xl border border-amber-300 shadow-2xl max-w-lg w-full overflow-hidden text-left animate-scale-up"
        onClick={e => e.stopPropagation()}
      >
        {/* HEADER MODAL */}
        <div className="px-5 py-4 bg-gradient-to-r from-amber-700 via-amber-800 to-amber-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
              <Film className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-amber-100 font-serif">
                Tạo Link Trình Chiếu Ký Ức An Toàn
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-amber-200 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* BODY TÙY CHỈNH */}
        <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
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
              {albums.map(alb => (
                <option key={alb.id} value={alb.id}>
                  {alb.title} {alb.period ? `(${alb.period})` : ''}
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
                {matchingPhotosCount} bức ảnh sẵn sàng
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
                {availableSubfolders.map(sub => (
                  <option key={sub.name} value={sub.name}>
                    📁 {sub.name} ({sub.count} ảnh)
                  </option>
                ))}
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

          {/* 4. KHUNG LINK CHIA SẺ & BẢO MẬT */}
          <div className="space-y-2 pt-2 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">Link chia sẻ an toàn:</span>
              <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-semibold font-mono">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Đã Đóng Dấu Watermark • Chống Tải</span>
              </div>
            </div>

            <div className="p-2.5 bg-slate-100 border border-slate-300 rounded-xl font-mono text-[11px] text-slate-800 break-all select-all flex items-center justify-between gap-2">
              <span className="truncate">{shareUrl}</span>
            </div>

            {/* Cảnh báo bảo mật thông minh */}
            <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl text-[11px] text-emerald-900 space-y-1.5 leading-relaxed">
              <p className="font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Cam kết bảo vệ tư liệu ảnh K8A1:</span>
              </p>
              <ul className="list-disc list-inside space-y-1 text-emerald-800">
                <li>Người nhận link <strong>chỉ xem được ảnh dạng trình chiếu rạp phim</strong>.</li>
                <li><strong>Đã đóng dấu bản quyền Watermark K8A1 trực tiếp lên từng ảnh</strong> để chống chụp màn hình.</li>
                <li>Đã khóa tải ảnh, chặn chuột phải, chặn kéo thả và chặn phím tắt lưu ảnh.</li>
                <li><strong>Cô lập hoàn toàn khỏi trang web gốc</strong>: Người xem không thể xem Danh bạ lớp, Quỹ lớp, Thư mời hay link Google Drive.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* FOOTER ACTIONS */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <a
            href={shareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition"
            title="Mở tab mới xem thử giao diện trình chiếu của người nhận"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Xem Thử Ngay</span>
          </a>

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
              <span>{isCopiedZalo ? 'Đã Copy Mẫu Zalo!' : 'Copy Tin Nhắn Zalo'}</span>
            </button>

            <button
              onClick={handleCopyLink}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer shadow-sm ${
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
};
