import React, { useState, useRef, useEffect, useMemo } from 'react';
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
  Camera,
  Trash2,
  Download,
  Shirt
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { RsvpData, EventConfig, ClassMember } from '../types';
import { SHIRT_SIZE_OPTIONS, normalizeShirtSize, isVietnameseNameMatch } from '../data';

interface StudentPassModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultAttendee?: RsvpData | null;
  allAttendees?: RsvpData[];
  classRoster?: ClassMember[];
  activeMember?: ClassMember | null;
  eventConfig?: EventConfig;
}

function normalizeName(n?: any): string {
  return String(n || '').trim().toLowerCase().replace(/\s+/g, ' ');
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  if (w < 2 * r) r = w / 2;
  if (h < 2 * r) r = h / 2;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawPlaceholderAvatar(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  ctx.fillStyle = '#EFE6D8';
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = '#C5A880';
  ctx.beginPath();
  ctx.arc(x + w / 2, y + h / 2 - 25, 42, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + w / 2, y + h / 2 + 75, 65, 0, Math.PI * 2);
  ctx.fill();
}

export default function StudentPassModal({
  isOpen,
  onClose,
  defaultAttendee,
  allAttendees = [],
  classRoster = [],
  activeMember,
  eventConfig
}: StudentPassModalProps) {
  const [name, setName] = useState(defaultAttendee?.fullName || 'Thành Long');
  const [className, setClassName] = useState(defaultAttendee?.className || 'K8A1');
  const [shirtSize, setShirtSize] = useState(defaultAttendee?.shirtSize ? normalizeShirtSize(defaultAttendee.shirtSize) : '');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(defaultAttendee?.avatarUrl || null);
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

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
      setShirtSize(defaultAttendee.shirtSize ? normalizeShirtSize(defaultAttendee.shirtSize) : '');
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

  // Find current attendee & nickname based on name (ưu tiên đúng defaultAttendee khi có người trùng tên)
  const currentAttendee = useMemo(() => {
    if (defaultAttendee && normalizeName(defaultAttendee.fullName) === normalizeName(name)) {
      return defaultAttendee;
    }
    return allAttendees.find(
      (a) => normalizeName(a.fullName) === normalizeName(name)
    ) || (defaultAttendee && normalizeName(defaultAttendee.fullName) === normalizeName(name) ? defaultAttendee : null);
  }, [defaultAttendee, allAttendees, name]);

  const currentNickname = currentAttendee?.nickname || (
    normalizeName(name).includes('long') ? 'Long Kều' : undefined
  );

  // Tra cứu mã thành viên (effectiveMemberId) chuẩn xác dựa trên TÊN ĐANG HIỂN THỊ (name)
  const effectiveMember = useMemo(() => {
    const cleanName = name.trim();
    if (!cleanName) return null;

    // 1. Kiểm tra trong danh bạ classRoster:
    if (classRoster.length > 0) {
      // Ưu tiên 1: Tra theo biệt danh nếu có
      if (currentNickname) {
        const nickMatch = classRoster.find((m) => m.nickname && normalizeName(m.nickname) === normalizeName(currentNickname));
        if (nickMatch) return nickMatch;
      }

      // Ưu tiên 2: Khớp tuyệt đối theo họ tên
      const exact = classRoster.find((m) => normalizeName(m.fullName) === normalizeName(cleanName));
      if (exact) return exact;

      // Ưu tiên 3: Khớp theo thuật toán tên / biệt danh tiếng Việt
      const alias = classRoster.find((m) => isVietnameseNameMatch(m, cleanName, currentNickname));
      if (alias) return alias;
    }

    // 2. Nếu defaultAttendee khớp tên với name và có memberId hợp lệ
    if (defaultAttendee && (
      normalizeName(defaultAttendee.fullName) === normalizeName(cleanName) ||
      isVietnameseNameMatch({ fullName: defaultAttendee.fullName, nickname: defaultAttendee.nickname }, cleanName, currentNickname)
    )) {
      if (defaultAttendee.memberId && classRoster.length > 0) {
        const found = classRoster.find((m) => m.id === defaultAttendee.memberId);
        if (found && (normalizeName(found.fullName) === normalizeName(cleanName) || isVietnameseNameMatch(found, cleanName, currentNickname))) {
          return found;
        }
      }
    }

    // 3. Nếu activeMember đang chọn khớp tên với name
    if (activeMember && (
      normalizeName(activeMember.fullName) === normalizeName(cleanName) ||
      isVietnameseNameMatch(activeMember, cleanName, currentNickname)
    )) {
      return activeMember;
    }

    return null;
  }, [name, currentNickname, defaultAttendee, activeMember, classRoster]);

  // PassCode thống nhất: Nếu tìm thấy thành viên trong danh bạ thì lấy ID chính thức (VD: m06 -> #K8A1-M06)
  const effectiveMemberId = effectiveMember?.id || (
    currentAttendee?.memberId && classRoster.some(m => m.id === currentAttendee.memberId && isVietnameseNameMatch(m, name, currentNickname))
      ? currentAttendee.memberId
      : undefined
  );

  const passCode = effectiveMemberId
    ? `K8A1-${effectiveMemberId.toUpperCase()}`
    : `K8A1-${Math.abs(name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % 900 + 100)}`;

  if (!isOpen) return null;

  // Handle changing attendee name
  const handleNameChange = (newName: string) => {
    setName(newName);
    const matched = (defaultAttendee && normalizeName(defaultAttendee.fullName) === normalizeName(newName))
      ? defaultAttendee
      : allAttendees.find(
          (a) => normalizeName(a.fullName) === normalizeName(newName)
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

  const handlePrint = () => {
    try {
      window.print();
    } catch {
      // ignore
    }
  };

  const handleCopyPassText = () => {
    const venue = eventConfig?.venueName 
      ? `${eventConfig.venueName}${eventConfig.venueAddress ? `, ${eventConfig.venueAddress}` : ''}`
      : 'Trường THPT Thái Nguyên';
    const timeText = eventConfig?.eventTimeText || eventConfig?.eventDateText || 'Từ 08:30 Sáng • Chủ Nhật, 27/09/2026';
    const text = `🎓 TẤM VÉ VÀNG THANH XUÂN & THẺ HỌC SINH TRI KỶ 20 NĂM LỚP K8A1 (2006 — 2026)\n👤 Cựu học sinh: ${name}${
      currentNickname ? ` ("${currentNickname}")` : ''
    }\n🏫 Lớp: ${className || 'K8A1'} • Trường THPT Thái Nguyên\n🎟️ Mã thẻ: #${passCode}\n👕 Quyền lợi đón tiếp: ${normalizeShirtSize(shirtSize) ? `Áo Polo Size ${normalizeShirtSize(shirtSize)}` : 'Chưa chọn size áo'}\n📍 Địa điểm: ${venue}\n⏰ Thời gian: ${timeText}\n✨ 20 Năm Ngày Trở Về - K8A1 Mãi Là Anh Em!`;
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
      title: `Tấm Vé Vàng Thanh Xuân 20 Năm Lớp K8A1 - ${name}`,
      text: `Mình vừa nhận Tấm Vé Vàng Thanh Xuân & Thẻ Tri Kỷ 20 Năm Lớp K8A1 (Khóa 8 THPT Thái Nguyên)! Hẹn gặp lại cả lớp trong ngày hội ngộ nhé ❤️`,
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

  // Export card to HD PNG using Canvas 2D
  const handleDownloadCardPng = async () => {
    if (isDownloading) return;
    setIsDownloading(true);

    try {
      const width = 1200;
      const height = 750;
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');

      // 1. Base Background Gradient (Vintage Cream & Gold Ivory)
      const bgGrad = ctx.createLinearGradient(0, 0, width, height);
      bgGrad.addColorStop(0, '#FFFDF9');
      bgGrad.addColorStop(0.45, '#FAF6EE');
      bgGrad.addColorStop(1, '#F3ECE0');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // 2. Decorative Outer Border (Double Gold Outline)
      ctx.lineWidth = 6;
      ctx.strokeStyle = '#C5A880';
      ctx.strokeRect(20, 20, width - 40, height - 40);

      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#D4B996';
      ctx.strokeRect(28, 28, width - 56, height - 56);

      // 3. Ornate Corner Brackets (Gold L-brackets)
      const bracketSize = 35;
      const bracketOffset = 38;
      ctx.lineWidth = 3.5;
      ctx.strokeStyle = '#B8860B';
      // Top-Left
      ctx.beginPath();
      ctx.moveTo(bracketOffset, bracketOffset + bracketSize);
      ctx.lineTo(bracketOffset, bracketOffset);
      ctx.lineTo(bracketOffset + bracketSize, bracketOffset);
      ctx.stroke();
      // Top-Right
      ctx.beginPath();
      ctx.moveTo(width - bracketOffset - bracketSize, bracketOffset);
      ctx.lineTo(width - bracketOffset, bracketOffset);
      ctx.lineTo(width - bracketOffset, bracketOffset + bracketSize);
      ctx.stroke();
      // Bottom-Left
      ctx.beginPath();
      ctx.moveTo(bracketOffset, height - bracketOffset - bracketSize);
      ctx.lineTo(bracketOffset, height - bracketOffset);
      ctx.lineTo(bracketOffset + bracketSize, height - bracketOffset);
      ctx.stroke();
      // Bottom-Right
      ctx.beginPath();
      ctx.moveTo(width - bracketOffset - bracketSize, height - bracketOffset);
      ctx.lineTo(width - bracketOffset, height - bracketOffset);
      ctx.lineTo(width - bracketOffset, height - bracketOffset - bracketSize);
      ctx.stroke();

      // 4. Perforation notches
      ctx.fillStyle = '#FAF8F5';
      ctx.beginPath();
      ctx.arc(20, height / 2, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(width - 20, height / 2, 16, 0, Math.PI * 2);
      ctx.fill();

      // 5. Header Section
      // K8A1 Seal Logo Circle
      const logoX = 75;
      const logoY = 95;
      const logoRadius = 38;
      ctx.beginPath();
      ctx.arc(logoX, logoY, logoRadius, 0, Math.PI * 2);
      ctx.fillStyle = '#FAF0DE';
      ctx.fill();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#B8860B';
      ctx.stroke();

      ctx.fillStyle = '#8B5A2B';
      ctx.font = 'bold 22px Georgia, serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('K8A1', logoX, logoY);

      // School & Event Subtitle
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
      ctx.fillStyle = '#B8860B';
      ctx.font = 'bold 15px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillText('TRƯỜNG THPT THÁI NGUYÊN • NIÊN KHÓA 2003 — 2006', 130, 84);

      // Card Main Title
      ctx.fillStyle = '#1E293B';
      ctx.font = 'bold 28px Georgia, serif';
      ctx.fillText('VÉ VÀNG THANH XUÂN • HỘI NGỘ 20 NĂM', 130, 118);

      // Right Header Badge (Golden Pass Badge)
      const badgeW = 210;
      const badgeH = 46;
      const badgeX = width - 65 - badgeW;
      const badgeY = 70;
      
      const badgeGrad = ctx.createLinearGradient(badgeX, badgeY, badgeX + badgeW, badgeY + badgeH);
      badgeGrad.addColorStop(0, '#B45309');
      badgeGrad.addColorStop(1, '#D97706');
      ctx.fillStyle = badgeGrad;
      roundRect(ctx, badgeX, badgeY, badgeW, badgeH, 8);
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('TRI KỶ 20 NĂM', badgeX + badgeW / 2, badgeY + 28);

      // Pass Code underneath badge
      ctx.fillStyle = '#78350F';
      ctx.font = 'bold 15px monospace';
      ctx.fillText(`#${passCode}`, badgeX + badgeW / 2, badgeY + 68);

      // Divider Line below Header
      ctx.strokeStyle = '#E2CBA8';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(65, 155);
      ctx.lineTo(width - 65, 155);
      ctx.stroke();

      // 6. Avatar / Photo Frame
      const photoX = 75;
      const photoY = 185;
      const photoW = 220;
      const photoH = 280;

      ctx.save();
      roundRect(ctx, photoX, photoY, photoW, photoH, 12);
      ctx.clip();

      if (avatarUrl) {
        try {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          await new Promise<void>((res, rej) => {
            img.onload = () => res();
            img.onerror = () => rej();
            img.src = avatarUrl;
          });
          ctx.drawImage(img, photoX, photoY, photoW, photoH);
        } catch {
          drawPlaceholderAvatar(ctx, photoX, photoY, photoW, photoH);
        }
      } else {
        drawPlaceholderAvatar(ctx, photoX, photoY, photoW, photoH);
      }
      ctx.restore();

      // Gold frame around photo
      ctx.strokeStyle = '#C5A880';
      ctx.lineWidth = 3;
      roundRect(ctx, photoX, photoY, photoW, photoH, 12);
      ctx.stroke();

      // Ribbon under photo
      ctx.fillStyle = 'rgba(26, 24, 22, 0.75)';
      ctx.fillRect(photoX, photoY + photoH - 36, photoW, 36);
      ctx.fillStyle = '#FDE68A';
      ctx.font = 'bold 13px Georgia, serif';
      ctx.textAlign = 'center';
      ctx.fillText('K8A1 • 20 NĂM', photoX + photoW / 2, photoY + photoH - 14);

      // 7. Member Information Details
      const infoX = 330;
      
      ctx.textAlign = 'left';
      ctx.fillStyle = '#64748B';
      ctx.font = 'bold 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillText('HỌ VÀ TÊN THÀNH VIÊN', infoX, 205);

      ctx.fillStyle = '#0F172A';
      ctx.font = 'bold 38px Georgia, serif';
      ctx.fillText(name || 'Bạn Cũ K8A1', infoX, 250);

      // Nickname Pill
      if (currentNickname) {
        const nickText = `"${currentNickname}"`;
        ctx.font = 'italic bold 17px Georgia, serif';
        const nickMetrics = ctx.measureText(nickText);
        const nw = nickMetrics.width + 24;
        const nh = 32;
        const ny = 270;
        
        ctx.fillStyle = '#FEF3C7';
        roundRect(ctx, infoX, ny, nw, nh, 16);
        ctx.fill();
        ctx.strokeStyle = '#FCD34D';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = '#78350F';
        ctx.textAlign = 'left';
        ctx.fillText(nickText, infoX + 12, ny + 22);
      }

      // 2x2 Info Grid Boxes
      const gridY = 325;
      const boxW = 370;
      const boxH = 68;

      // Box 1: Lớp / Niên Khóa
      ctx.fillStyle = '#FFFFFF';
      roundRect(ctx, infoX, gridY, boxW, boxH, 8);
      ctx.fill();
      ctx.strokeStyle = '#E2D3BE';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = '#64748B';
      ctx.font = 'bold 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillText('LỚP / NIÊN KHÓA', infoX + 16, gridY + 26);
      ctx.fillStyle = '#B45309';
      ctx.font = 'bold 20px Georgia, serif';
      ctx.fillText(className || 'K8A1 (2003 — 2006)', infoX + 16, gridY + 54);

      // Box 2: Quyền Lợi Đón Tiếp (Chỉ giữ Áo Polo)
      const box2X = infoX + boxW + 20;
      ctx.fillStyle = '#FFFFFF';
      roundRect(ctx, box2X, gridY, boxW, boxH, 8);
      ctx.fill();
      ctx.strokeStyle = '#E2D3BE';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = '#64748B';
      ctx.font = 'bold 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillText('QUYỀN LỢI ĐÓN TIẾP', box2X + 16, gridY + 26);
      ctx.fillStyle = '#0F172A';
      const passShirtText = normalizeShirtSize(shirtSize) ? `Áo Polo Size ${normalizeShirtSize(shirtSize)}` : 'Áo Polo (Chưa chọn)';
      ctx.fillText(passShirtText, box2X + 16, gridY + 54);

      // Box 3: Thời Gian
      const gridY2 = gridY + boxH + 15;
      ctx.fillStyle = '#FFFFFF';
      roundRect(ctx, infoX, gridY2, boxW, boxH, 8);
      ctx.fill();
      ctx.strokeStyle = '#E2D3BE';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = '#64748B';
      ctx.font = 'bold 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillText('THỜI GIAN TẬP TRUNG', infoX + 16, gridY2 + 26);
      ctx.fillStyle = '#0F172A';
      ctx.font = 'bold 17px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillText(eventConfig?.eventDateText || 'Từ 08:30 • Chủ Nhật, 27/09/2026', infoX + 16, gridY2 + 53);

      // Box 4: Địa Điểm
      ctx.fillStyle = '#FFFFFF';
      roundRect(ctx, box2X, gridY2, boxW, boxH, 8);
      ctx.fill();
      ctx.strokeStyle = '#E2D3BE';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = '#64748B';
      ctx.font = 'bold 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillText('ĐỊA ĐIỂM HỘI TRƯỜNG', box2X + 16, gridY2 + 26);
      ctx.fillStyle = '#0F172A';
      ctx.font = 'bold 17px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillText(eventConfig?.venueName || 'Trường THPT Thái Nguyên', box2X + 16, gridY2 + 53);

      // 8. Card Footer
      const footerY = 665;
      ctx.strokeStyle = '#E2CBA8';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(65, 625);
      ctx.lineTo(width - 65, 625);
      ctx.stroke();

      ctx.fillStyle = '#64748B';
      ctx.font = 'italic 16px Georgia, serif';
      ctx.textAlign = 'left';
      ctx.fillText('“20 năm một chặng đường — K8A1 mãi là thanh xuân rực rỡ!”', 75, footerY);

      // QR Gate simulated pill
      const gateW = 220;
      const gateH = 34;
      const gateX = width - 75 - gateW;
      const gateY = footerY - 24;
      ctx.fillStyle = '#FAF0DE';
      roundRect(ctx, gateX, gateY, gateW, gateH, 6);
      ctx.fill();
      ctx.strokeStyle = '#D4B996';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = '#78350F';
      ctx.font = 'bold 12px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('CHECK-IN GATE • K8A1-20Y', gateX + gateW / 2, gateY + 22);

      // 9. Export to PNG Blob
      canvas.toBlob((blob) => {
        if (!blob) throw new Error('Blob creation failed');
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const safeName = (name || 'K8A1').replace(/[^a-zA-Z0-9\u00C0-\u024F\u1EA0-\u1EF9]/g, '_');
        a.href = url;
        a.download = `Ve_Vang_20Nam_K8A1_${safeName}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        setDownloadSuccess(true);
        setTimeout(() => setDownloadSuccess(false), 3000);
        confetti({
          particleCount: 70,
          spread: 80,
          origin: { y: 0.7 }
        });
      }, 'image/png');
    } catch (err) {
      console.error('Download card error:', err);
      alert('Không thể tạo ảnh thẻ tự động. Bạn có thể dùng nút In thẻ / Lưu PDF hoặc chụp màn hình.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      {/* SCOPED PRINT STYLES */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * {
            visibility: hidden !important;
          }
          #student-souvenir-card, #student-souvenir-card * {
            visibility: visible !important;
          }
          #student-souvenir-card {
            position: fixed !important;
            left: 50% !important;
            top: 50% !important;
            transform: translate(-50%, -50%) !important;
            width: 100% !important;
            max-width: 680px !important;
            margin: 0 !important;
            box-shadow: none !important;
            border: 2px solid #C5A880 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}} />

      <div className="relative w-full max-w-lg bg-[#FAF8F5] rounded-xl shadow-2xl border border-brand-gold/30 p-4 sm:p-6 my-6 text-brand-text">
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
        <div className="text-center mb-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/15 border border-amber-400/50 text-amber-900 text-[10px] font-sans font-bold uppercase tracking-widest rounded-full mb-1.5 shadow-2xs">
            <Award className="w-3.5 h-3.5 text-amber-700" />
            <span>20-Year Golden Alumni Pass</span>
          </div>
          <h3 className="text-xl md:text-2xl font-serif text-brand-text font-bold leading-tight">
            Tấm Vé Vàng Thanh Xuân & Thẻ Học Sinh Tri Kỷ 20 Năm
          </h3>
          <p className="text-xs text-brand-text-muted font-serif italic mt-1">
            Vé mời danh dự & Kỷ vật hội ngộ 20 năm Lớp K8A1 — THPT Thái Nguyên (2006 — 2026)
          </p>
        </div>

        {/* Attendee Info & Avatar Upload Bar */}
        <div className="bg-white/90 p-3 rounded-lg border border-brand-border mb-4 shadow-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs mb-2.5">
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
                  <option key={att.id || idx} value={att.fullName}>
                    {att.nickname ? `Biệt danh: ${att.nickname}` : (att.phone ? `SĐT: ...${String(att.phone).slice(-4)}` : (att.className || 'K8A1'))}
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
                placeholder="VD: K8A1 (2003 — 2006)"
              />
            </div>
            <div>
              <label className="block text-[10px] font-sans font-bold uppercase tracking-wider text-brand-text-muted mb-1">
                Size áo polo đồng phục:
              </label>
              <select
                value={normalizeShirtSize(shirtSize)}
                onChange={(e) => setShirtSize(e.target.value)}
                className={`w-full px-2.5 py-1.5 border rounded bg-white text-xs font-serif font-bold cursor-pointer focus:outline-none ${
                  !normalizeShirtSize(shirtSize)
                    ? 'border-amber-400 bg-amber-50 text-amber-900 focus:border-amber-500 ring-1 ring-amber-300'
                    : 'border-brand-border text-brand-text focus:border-brand-gold'
                }`}
              >
                <option value="">-- Chưa chọn size áo --</option>
                {SHIRT_SIZE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Dedicated Photo Upload Controls */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-brand-border/60">
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
          className="relative bg-gradient-to-br from-[#FFFDF9] via-[#FAF6F0] to-[#F5EFE6] border-2 border-[#C5A880] rounded-xl p-4 sm:p-5 shadow-md overflow-hidden"
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

          {/* Header of Card (No Truncation) */}
          <div className="flex items-center justify-between border-b border-brand-gold/30 pb-2.5 mb-3 gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-9 h-9 rounded-full bg-amber-500/20 border border-amber-600/50 flex items-center justify-center text-amber-900 font-serif font-bold text-xs shrink-0 shadow-2xs">
                K8A1
              </div>
              <div className="min-w-0">
                <p className="text-[9px] font-sans font-bold uppercase tracking-widest text-amber-800 leading-tight">
                  THPT Thái Nguyên • Khóa 8 (2003 — 2006)
                </p>
                <h4 className="text-xs sm:text-sm font-serif font-bold text-brand-text uppercase tracking-wide leading-tight mt-0.5">
                  Vé Vàng Thanh Xuân • Hội Ngộ 20 Năm
                </h4>
              </div>
            </div>
            <div className="text-right shrink-0">
              <span className="inline-block px-2 py-0.5 bg-gradient-to-r from-amber-600 to-amber-700 text-white text-[9px] font-sans font-bold tracking-widest rounded uppercase shadow-2xs">
                Tri Kỷ 20 Năm
              </span>
              <p className="text-[10px] font-mono font-bold text-amber-950 mt-0.5 tracking-wider">
                #{passCode}
              </p>
            </div>
          </div>

          {/* Body with Interactive Photo Upload & Details */}
          <div className="flex gap-3 sm:gap-4 items-center">
            {/* Avatar Frame with Upload Capability */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="group relative shrink-0 w-20 h-26 sm:w-24 sm:h-30 bg-[#F0EAE1] border-2 border-dashed border-brand-gold/70 rounded-md flex flex-col items-center justify-center text-center overflow-hidden cursor-pointer hover:border-brand-gold hover:shadow-md transition-all select-none"
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
                    <Camera className="w-4 h-4 mb-0.5 text-amber-300 drop-shadow" />
                    <span className="text-[8.5px] font-sans font-bold leading-tight drop-shadow">Đổi ảnh</span>
                  </div>
                  {/* Small delete button in top-right */}
                  <button
                    type="button"
                    onClick={handleRemoveAvatar}
                    className="absolute top-1 right-1 w-4 h-4 rounded-full bg-black/70 hover:bg-rose-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all z-10 cursor-pointer shadow"
                    title="Gỡ ảnh"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                  {/* Bottom Golden Ribbon */}
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent py-0.5 px-1 text-center pointer-events-none">
                    <span className="text-[7px] text-amber-200 font-serif tracking-widest font-bold uppercase block drop-shadow">
                      K8A1 • 20 Năm
                    </span>
                  </div>
                </>
              ) : (
                <div className="p-1 flex flex-col items-center justify-center">
                  <div className="w-7 h-7 rounded-full bg-brand-gold/15 flex items-center justify-center mb-1 group-hover:scale-110 group-hover:bg-brand-gold/25 transition-all">
                    <Camera className="w-3.5 h-3.5 text-brand-gold" />
                  </div>
                  <span className="text-[8px] font-sans font-bold uppercase tracking-wider text-brand-text leading-tight">
                    Tải ảnh thẻ
                  </span>
                  <span className="text-[7.5px] font-sans font-medium text-amber-800 mt-0.5">
                    Bấm để tải ảnh
                  </span>
                </div>
              )}
            </div>

            {/* Information Column */}
            <div className="flex-1 min-w-0 space-y-1.5">
              <div>
                <p className="text-[8.5px] uppercase tracking-wider font-sans text-brand-text-muted font-bold">
                  Họ và Tên Thành Viên
                </p>
                <div className="flex flex-wrap items-baseline gap-1.5">
                  <p className="text-base sm:text-xl font-serif font-bold text-brand-text tracking-wide leading-tight">
                    {name || 'Họ và Tên Bạn'}
                  </p>
                  {currentNickname && (
                    <span className="text-[9.5px] font-sans font-bold text-amber-900 bg-amber-100/90 px-2 py-0.5 rounded-full border border-amber-300 italic">
                      "{currentNickname}"
                    </span>
                  )}
                </div>
              </div>

              {/* Dải thông số: Lớp & Quyền Lợi Áo Polo (Không bị tràn/cắt chữ) */}
              <div className="pt-1.5 border-t border-brand-gold/25 space-y-1">
                <div className="flex flex-wrap items-center justify-between gap-1.5 text-xs">
                  <div className="flex items-center gap-1">
                    <span className="text-[8.5px] uppercase font-sans text-slate-500 font-bold">Lớp:</span>
                    <span className="font-serif font-bold text-amber-900 text-xs sm:text-sm">{className || 'K8A1'}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <span className="text-[8.5px] uppercase font-sans text-slate-500 font-bold">Áo Polo:</span>
                    {normalizeShirtSize(shirtSize) ? (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-amber-500/20 border border-amber-500/40 rounded text-amber-950 font-sans font-bold text-[11px] whitespace-nowrap">
                        <Shirt className="w-3 h-3 text-amber-800 shrink-0" />
                        <span>Size {normalizeShirtSize(shirtSize)}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-amber-100 border border-amber-300 rounded text-amber-900 font-sans font-semibold text-[10px] whitespace-nowrap">
                        <Shirt className="w-3 h-3 text-amber-700 shrink-0" />
                        <span>Chưa chọn size</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-[9.5px] text-slate-600 space-y-0.5 pt-0.5">
                  <p className="flex items-center gap-1 truncate">
                    <Calendar className="w-3 h-3 text-amber-700 shrink-0" />
                    <span>Từ 08:30 • Chủ Nhật, 27/09/2026</span>
                  </p>
                  <p className="flex items-center gap-1 truncate" title={eventConfig?.venueName || 'Trường THPT Thái Nguyên'}>
                    <MapPin className="w-3 h-3 text-amber-700 shrink-0" />
                    <span className="truncate">{eventConfig?.venueName || 'Trường THPT Thái Nguyên'}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer of Card with Barcode / Quote */}
          <div className="mt-3 pt-2.5 border-t border-brand-gold/30 flex items-center justify-between">
            <p className="text-[9px] font-serif italic text-brand-text-muted truncate mr-2">
              “20 năm một chặng đường — K8A1 mãi là thanh xuân rực rỡ!”
            </p>
            <div className="flex items-center gap-1 text-[8px] font-mono tracking-widest text-brand-gold uppercase font-bold bg-white/70 px-2 py-0.5 rounded border border-brand-gold/30 shrink-0">
              <QrCode className="w-3 h-3" />
              <span>CHECK-IN GATE</span>
            </div>
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-brand-border">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleDownloadCardPng}
              disabled={isDownloading}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white text-xs font-sans font-bold uppercase tracking-wider rounded shadow-xs cursor-pointer transition-all disabled:opacity-50"
              title="Tải ảnh thẻ độ phân giải cao định dạng PNG về máy"
            >
              <Download className="w-3.5 h-3.5 text-amber-200" />
              <span>{isDownloading ? 'Đang xuất ảnh...' : (downloadSuccess ? 'Đã tải ảnh HD!' : 'Tải Ảnh Thẻ HD')}</span>
            </button>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-brand-bg text-brand-text text-xs font-sans font-bold uppercase tracking-wider border border-brand-border rounded cursor-pointer transition-colors"
            >
              <Printer className="w-3.5 h-3.5 text-brand-gold" />
              <span>In thẻ / PDF</span>
            </button>

            <button
              onClick={handleCopyPassText}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-brand-bg text-brand-text text-xs font-sans font-bold uppercase tracking-wider border border-brand-border rounded cursor-pointer transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5 text-brand-gold" />}
              <span>{copied ? 'Đã sao chép!' : 'Sao chép'}</span>
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
