import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Share2,
  Printer,
  X,
  Check,
  Award,
  School,
  Calendar,
  MapPin,
  QrCode,
  User,
  Camera,
  Trash2,
  Upload
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { RsvpData } from '../types';
import { SHIRT_SIZE_OPTIONS } from '../data';

interface StudentPassModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultAttendee?: RsvpData | null;
  allAttendees?: RsvpData[];
}

export default function StudentPassModal({
  isOpen,
  onClose,
  defaultAttendee,
  allAttendees = []
}: StudentPassModalProps) {
  const [name, setName] = useState(defaultAttendee?.fullName || 'Nguyễn Minh Anh');
  const [className, setClassName] = useState(defaultAttendee?.className || 'K8A1');
  const [shirtSize, setShirtSize] = useState(defaultAttendee?.shirtSize || 'L');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(defaultAttendee?.avatarUrl || null);
  const [copied, setCopied] = useState(false);
  
  const cardRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper to load avatar from localStorage or attendee
  const getSavedAvatar = (personName: string, attendeeObj?: RsvpData | null): string | null => {
    if (attendeeObj?.avatarUrl) return attendeeObj.avatarUrl;
    try {
      const key = `k8a1_avatar_${personName.trim().toLowerCase()}`;
      return localStorage.getItem(key) || null;
    } catch {
      return null;
    }
  };

  // Sync state if defaultAttendee updates or modal opens
  useEffect(() => {
    if (defaultAttendee) {
      setName(defaultAttendee.fullName);
      if (defaultAttendee.className) setClassName(defaultAttendee.className);
      if (defaultAttendee.shirtSize) setShirtSize(defaultAttendee.shirtSize);
      setAvatarUrl(getSavedAvatar(defaultAttendee.fullName, defaultAttendee));
    } else {
      setAvatarUrl(getSavedAvatar(name));
    }
  }, [defaultAttendee, isOpen]);

  useEffect(() => {
    if (isOpen) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 }
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Find current nickname based on name
  const currentAttendee = allAttendees.find(
    (a) => a.fullName.trim().toLowerCase() === name.trim().toLowerCase()
  ) || defaultAttendee;
  const currentNickname = currentAttendee?.nickname;

  // Handle changing attendee name
  const handleNameChange = (newName: string) => {
    setName(newName);
    const matched = allAttendees.find(
      (a) => a.fullName.trim().toLowerCase() === newName.trim().toLowerCase()
    );
    if (matched) {
      if (matched.className) setClassName(matched.className);
      if (matched.shirtSize) setShirtSize(matched.shirtSize);
      setAvatarUrl(getSavedAvatar(matched.fullName, matched));
    } else {
      setAvatarUrl(getSavedAvatar(newName));
    }
  };

  // Image Upload with client-side canvas compression
  const handleImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn file hình ảnh (JPG, PNG, WebP)!');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const MAX_WIDTH = 400;
        const MAX_HEIGHT = 500;
        let { width, height } = img;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
          setAvatarUrl(dataUrl);
          try {
            const key = `k8a1_avatar_${name.trim().toLowerCase()}`;
            localStorage.setItem(key, dataUrl);
          } catch (err) {
            console.warn('LocalStorage save error:', err);
          }
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setAvatarUrl(null);
    try {
      const key = `k8a1_avatar_${name.trim().toLowerCase()}`;
      localStorage.removeItem(key);
    } catch {}
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const passCode = `K8A1-${(name.split(' ').pop() || '2006').toUpperCase().slice(0, 4)}-${Math.abs(
    name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % 900 + 100
  )}`;

  const handlePrint = () => {
    try {
      window.print();
    } catch {
      // ignore
    }
  };

  const handleCopyPassText = () => {
    const text = `🎓 THẺ THÀNH VIÊN HỘI NGỘ 20 NĂM LỚP K8A1 (2006 — 2026)\n👤 Cựu học sinh: ${name}${
      currentNickname ? ` ("${currentNickname}")` : ''
    }\n🏫 Lớp: ${className} • Trường THPT Thái Nguyên\n🎟️ Mã thẻ: #${passCode}\n📍 Địa điểm: Crown Palace, 779 Dương Tự Minh, TP. Thái Nguyên\n⏰ Thời gian: Từ 08:30 Sáng - Chủ Nhật, 27/09/2026\n✨ 20 Năm Ngày Trở Về - K8A1 Mãi Là Anh Em!`;
    try {
      if (navigator.clipboard?.writeText) {
        navigator.clipboard
          .writeText(text)
          .then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
          })
          .catch(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
          });
      } else {
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleNativeShare = async () => {
    const shareData = {
      title: `Thẻ Kỷ Niệm 20 Năm Lớp K8A1 - ${name}`,
      text: `Mình vừa nhận Thẻ Thành Viên Hội Ngộ 20 Năm Lớp K8A1 (Khóa 8 THPT Thái Nguyên)! Hẹn gặp lại cả lớp tại Crown Palace ngày 27/09/2026 nhé ❤️`,
      url: window.location.href
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        handleCopyPassText();
      }
    } else {
      handleCopyPassText();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-lg bg-[#FAF8F5] rounded-xl shadow-2xl border border-brand-gold/30 p-5 md:p-7 my-8 text-brand-text">
        {/* Hidden file input for avatar upload */}
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleImageFile(file);
          }}
        />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-brand-border/40 text-brand-text-muted hover:text-brand-text transition-colors cursor-pointer"
          title="Đóng thẻ"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-gold/10 border border-brand-gold/30 text-brand-gold text-[10px] font-sans font-bold uppercase tracking-widest rounded-full mb-1.5">
            <Award className="w-3.5 h-3.5" />
            <span>Kỷ Vật Hội Ngộ 20 Năm</span>
          </div>
          <h3 className="text-xl md:text-2xl font-serif text-brand-text font-bold">
            Thẻ Kỷ Niệm 20 Năm Lớp K8A1
          </h3>
          <p className="text-xs text-brand-text-muted font-serif italic mt-0.5">
            Lưu giữ kỷ niệm thanh xuân 20 năm Lớp K8A1 - THPT Thái Nguyên
          </p>
        </div>

        {/* Attendee Info & Avatar Upload Bar */}
        <div className="bg-white/90 p-3.5 rounded-lg border border-brand-border mb-5 shadow-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs mb-3">
            <div>
              <label className="block text-[10px] font-sans font-bold uppercase tracking-wider text-brand-text-muted mb-1">
                Họ và Tên:
              </label>
              <input
                type="text"
                list="k8a1-attendees-list"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-brand-border rounded bg-white text-xs font-serif font-bold text-brand-text focus:outline-none focus:border-brand-gold"
                placeholder="Nhập hoặc chọn tên bạn"
              />
              <datalist id="k8a1-attendees-list">
                {allAttendees.map((att, idx) => (
                  <option key={idx} value={att.fullName}>
                    {att.nickname ? `Biệt danh: ${att.nickname}` : att.className || 'K8A1'}
                  </option>
                ))}
              </datalist>
            </div>
            <div>
              <label className="block text-[10px] font-sans font-bold uppercase tracking-wider text-brand-text-muted mb-1">
                Lớp / Khóa:
              </label>
              <input
                type="text"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-brand-border rounded bg-white text-xs font-serif font-bold text-brand-text focus:outline-none focus:border-brand-gold"
                placeholder="VD: K8A1 (2003 - 2006)"
              />
            </div>
            <div>
              <label className="block text-[10px] font-sans font-bold uppercase tracking-wider text-brand-text-muted mb-1">
                Size áo đồng phục:
              </label>
              <select
                value={shirtSize}
                onChange={(e) => setShirtSize(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-brand-border rounded bg-white text-xs font-serif font-bold text-brand-text focus:outline-none focus:border-brand-gold cursor-pointer"
              >
                {SHIRT_SIZE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Dedicated Photo Upload Controls */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 border-t border-brand-border/60">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded text-xs font-sans font-semibold transition-colors cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5 text-amber-700" />
                <span>{avatarUrl ? 'Đổi ảnh chân dung' : 'Tải ảnh đại diện / thẻ'}</span>
              </button>

              {avatarUrl && (
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  className="inline-flex items-center gap-1 px-2 py-1 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                  title="Xóa ảnh này"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Xóa ảnh</span>
                </button>
              )}
            </div>
            <span className="text-[10.5px] text-brand-text-muted italic">
              💡 Bấm vào khung ảnh trên thẻ hoặc nút này để chọn ảnh
            </span>
          </div>
        </div>

        {/* The Souvenir Card (Editorial Vintage Style) */}
        <div
          ref={cardRef}
          id="student-souvenir-card"
          className="relative bg-gradient-to-br from-[#FFFDF9] via-[#FAF6F0] to-[#F5EFE6] border-2 border-[#C5A880] rounded-lg p-5 sm:p-6 shadow-md overflow-hidden"
        >
          {/* Decorative Corner Ornaments */}
          <div className="absolute top-1.5 left-1.5 w-3 h-3 border-t-2 border-l-2 border-brand-gold"></div>
          <div className="absolute top-1.5 right-1.5 w-3 h-3 border-t-2 border-r-2 border-brand-gold"></div>
          <div className="absolute bottom-1.5 left-1.5 w-3 h-3 border-b-2 border-l-2 border-brand-gold"></div>
          <div className="absolute bottom-1.5 right-1.5 w-3 h-3 border-b-2 border-r-2 border-brand-gold"></div>

          {/* Watermark Emblem */}
          <div className="absolute inset-0 flex items-center justify-center opacity-4 pointer-events-none">
            <School className="w-56 h-56 text-brand-gold" />
          </div>

          {/* Header of Card */}
          <div className="flex items-center justify-between border-b border-brand-gold/30 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-brand-gold/20 border border-brand-gold flex items-center justify-center text-brand-gold font-serif font-bold text-xs">
                K8A1
              </div>
              <div>
                <p className="text-[9px] font-sans font-bold uppercase tracking-widest text-brand-gold">
                  THPT Thái Nguyên • Khóa 8 (2003 — 2006)
                </p>
                <h4 className="text-sm font-serif font-bold text-brand-text uppercase tracking-wide">
                  Hội Ngộ 20 Năm Lớp K8A1
                </h4>
              </div>
            </div>
            <div className="text-right">
              <span className="inline-block px-2 py-0.5 bg-brand-gold text-white text-[9px] font-sans font-bold tracking-widest rounded-xs uppercase">
                Thành Viên K8A1
              </span>
              <p className="text-[9px] font-mono text-brand-text-muted mt-0.5">
                #{passCode}
              </p>
            </div>
          </div>

          {/* Body with Interactive Photo Upload & Details */}
          <div className="flex gap-4 items-center">
            {/* Avatar Frame with Upload Capability */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="group relative shrink-0 w-22 h-28 sm:w-24 sm:h-30 bg-[#F0EAE1] border-2 border-dashed border-brand-gold/70 rounded-md flex flex-col items-center justify-center text-center overflow-hidden cursor-pointer hover:border-brand-gold hover:shadow-md transition-all select-none"
              title="Bấm để tải ảnh đại diện / ảnh chân dung"
            >
              {avatarUrl ? (
                <>
                  <img
                    src={avatarUrl}
                    alt={name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white p-1">
                    <Camera className="w-5 h-5 mb-0.5 text-amber-300 drop-shadow" />
                    <span className="text-[9px] font-sans font-bold leading-tight drop-shadow">Đổi ảnh</span>
                  </div>
                  {/* Small delete button in top-right */}
                  <button
                    type="button"
                    onClick={handleRemoveAvatar}
                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 hover:bg-rose-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all z-10 cursor-pointer shadow"
                    title="Gỡ ảnh"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  {/* Bottom Golden Ribbon */}
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent py-0.5 px-1 text-center pointer-events-none">
                    <span className="text-[7.5px] text-amber-200 font-serif tracking-widest font-bold uppercase block drop-shadow">
                      K8A1 • 20 Năm
                    </span>
                  </div>
                </>
              ) : (
                <div className="p-1 flex flex-col items-center justify-center">
                  <div className="w-8 h-8 rounded-full bg-brand-gold/15 flex items-center justify-center mb-1 group-hover:scale-110 group-hover:bg-brand-gold/25 transition-all">
                    <Camera className="w-4 h-4 text-brand-gold" />
                  </div>
                  <span className="text-[8.5px] font-sans font-bold uppercase tracking-wider text-brand-text leading-tight">
                    Tải ảnh thẻ
                  </span>
                  <span className="text-[7.5px] font-serif italic text-brand-gold mt-0.5">
                    Bấm để chọn
                  </span>
                </div>
              )}
            </div>

            {/* Information */}
            <div className="flex-1 space-y-1.5">
              <div>
                <p className="text-[9px] uppercase tracking-wider font-sans text-brand-text-muted font-bold">
                  Họ và Tên Thành Viên
                </p>
                <div className="flex flex-wrap items-baseline gap-2">
                  <p className="text-lg sm:text-xl font-serif font-bold text-brand-text tracking-wide leading-tight">
                    {name || 'Họ và Tên Bạn'}
                  </p>
                  {currentNickname && (
                    <span className="text-[10px] font-sans font-bold text-amber-900 bg-amber-100/90 px-2 py-0.5 rounded-full border border-amber-300 italic">
                      "{currentNickname}"
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-brand-gold/20">
                <div>
                  <span className="text-[8px] uppercase font-sans text-brand-text-muted block font-bold">Lớp:</span>
                  <span className="font-serif font-bold text-brand-gold text-sm">{className || 'K8A1'}</span>
                </div>
                <div>
                  <span className="text-[8px] uppercase font-sans text-brand-text-muted block font-bold">Áo kỷ niệm:</span>
                  <span className="font-serif font-bold text-brand-text text-sm">Size {shirtSize}</span>
                </div>
              </div>

              <div className="text-[10px] text-brand-text-muted space-y-0.5 pt-1">
                <p className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-brand-gold shrink-0" />
                  <span>Từ 08:30 Sáng • Chủ Nhật, 27/09/2026</span>
                </p>
                <p className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-brand-gold shrink-0" />
                  <span className="truncate">Crown Palace (779 Dương Tự Minh, Thái Nguyên)</span>
                </p>
              </div>
            </div>
          </div>

          {/* Footer of Card with Barcode / Quote */}
          <div className="mt-4 pt-3 border-t border-brand-gold/30 flex items-center justify-between">
            <p className="text-[9px] font-serif italic text-brand-text-muted">
              "20 năm một chặng đường — K8A1 mãi là thanh xuân rực rỡ!"
            </p>
            <div className="flex items-center gap-1 text-[8px] font-mono tracking-widest text-brand-gold uppercase font-bold bg-white/70 px-2 py-1 rounded border border-brand-gold/30">
              <QrCode className="w-3 h-3" />
              <span>CHECK-IN GATE</span>
            </div>
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-brand-border">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-brand-bg text-brand-text text-xs font-sans font-bold uppercase tracking-wider border border-brand-border rounded cursor-pointer transition-colors"
            >
              <Printer className="w-3.5 h-3.5 text-brand-gold" />
              <span>In thẻ / Lưu PDF</span>
            </button>
            <button
              onClick={handleCopyPassText}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-brand-bg text-brand-text text-xs font-sans font-bold uppercase tracking-wider border border-brand-border rounded cursor-pointer transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5 text-brand-gold" />}
              <span>{copied ? 'Đã sao chép!' : 'Sao chép thẻ'}</span>
            </button>
          </div>

          <button
            onClick={handleNativeShare}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-text hover:bg-brand-gold text-white text-xs font-sans font-bold uppercase tracking-wider rounded cursor-pointer transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-brand-gold" />
            <span>Chia sẻ Story / Zalo</span>
          </button>
        </div>
      </div>
    </div>
  );
}
