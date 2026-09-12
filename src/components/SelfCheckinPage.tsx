import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Search,
  UserCheck,
  CheckCircle2,
  Award,
  School,
  Sparkles,
  Download,
  ArrowLeft,
  RefreshCw,
  Shirt,
  Phone,
  Check,
  Share2,
  Camera,
  Calendar,
  MapPin,
  QrCode,
  Clock,
  ChevronRight,
  User,
  AlertCircle,
  X,
  Loader2,
  ThumbsUp
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { RsvpData, ClassMember, EventConfig } from '../types';
import {
  SHIRT_SIZE_OPTIONS,
  normalizeShirtSize,
  isVietnameseNameMatch,
  maskPhone,
  uploadMemberAvatarViaBackend,
  formatCheckInTimeShort
} from '../data';
import { parseMemberNote } from '../utils/memberUtils';
import { saveOrDownloadJpg } from '../utils/imageUtils';
import MobilePhotoSaveModal from './MobilePhotoSaveModal';

interface SelfCheckinPageProps {
  classRoster: ClassMember[];
  rsvpList: RsvpData[];
  eventConfig: EventConfig;
  appsScriptUrl: string;
  onCheckIn: (attendeeData: {
    fullName: string;
    phone?: string;
    memberId?: string;
    className?: string;
    shirtSize?: string;
    avatarUrl?: string;
    nickname?: string;
  }) => Promise<{ success: boolean; message?: string; checkedInAt?: string }>;
  onExitCheckin: () => void;
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

export default function SelfCheckinPage({
  classRoster = [],
  rsvpList = [],
  eventConfig,
  appsScriptUrl,
  onCheckIn,
  onExitCheckin
}: SelfCheckinPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMember, setSelectedMember] = useState<ClassMember | null>(null);
  const [selectedShirtSize, setSelectedShirtSize] = useState<string>('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [checkInDone, setCheckInDone] = useState(false);
  const [checkInTime, setCheckInTime] = useState<string>('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [photoSaveModal, setPhotoSaveModal] = useState<{
    isOpen: boolean;
    imageUrl: string;
    filename: string;
    title: string;
  }>({
    isOpen: false,
    imageUrl: '',
    filename: '',
    title: ''
  });
  const [copiedLink, setCopiedLink] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cardPreviewRef = useRef<HTMLDivElement>(null);

  // Thống kê sĩ số có mặt
  const confirmedAttendees = useMemo(() => rsvpList.filter((a) => a.status === 'yes'), [rsvpList]);
  const checkedInCount = useMemo(() => confirmedAttendees.filter((a) => a.checkedIn).length, [confirmedAttendees]);
  const totalRosterCount = classRoster.length > 0 ? classRoster.length : 43;

  // Lấy avatar đã lưu cho thành viên
  const getSavedAvatar = (personName: string, memberId?: string): string | null => {
    // 1. Kiểm tra trong rsvpList
    const rsvpItem = rsvpList.find(
      (r) => (memberId && r.memberId === memberId) || normalizeName(r.fullName) === normalizeName(personName)
    );
    if (rsvpItem?.avatarUrl) return rsvpItem.avatarUrl;

    // 2. Kiểm tra trong noteMeta của classRoster
    if (classRoster.length > 0) {
      const found = classRoster.find(
        (m) => (memberId && m.id === memberId) || normalizeName(m.fullName) === normalizeName(personName)
      );
      if (found) {
        const meta = found.noteMeta || parseMemberNote(found.note).meta;
        if (meta?.avatarUrl) return meta.avatarUrl;
      }
    }

    // 3. Fallback localStorage
    try {
      const key = `k8a1_avatar_${personName.trim().toLowerCase()}`;
      return localStorage.getItem(key) || null;
    } catch {
      return null;
    }
  };

  // Tra cứu thông tin RSVP tương ứng với selectedMember
  const matchedRsvp = useMemo(() => {
    if (!selectedMember) return null;
    return (
      rsvpList.find(
        (r) =>
          (selectedMember.id && r.memberId === selectedMember.id) ||
          normalizeName(r.fullName) === normalizeName(selectedMember.fullName) ||
          isVietnameseNameMatch(selectedMember, r.fullName, r.nickname)
      ) || null
    );
  }, [selectedMember, rsvpList]);

  // Khi chọn một thành viên từ danh sách
  const handleSelectMember = (member: ClassMember) => {
    setSelectedMember(member);
    const rsvp = rsvpList.find(
      (r) =>
        (member.id && r.memberId === member.id) ||
        normalizeName(r.fullName) === normalizeName(member.fullName) ||
        isVietnameseNameMatch(member, r.fullName, r.nickname)
    );

    const size = rsvp?.shirtSize || member.shirtSize || '';
    setSelectedShirtSize(normalizeShirtSize(size));

    const av = getSavedAvatar(member.fullName, member.id);
    setAvatarUrl(av);

    const isAlreadyCheckedIn = Boolean(rsvp?.checkedIn);
    setCheckInDone(isAlreadyCheckedIn);
    setCheckInTime(formatCheckInTimeShort(rsvp?.checkedInAt) || rsvp?.checkedInAt || '');

    // Cuộn nhẹ xuống khung vé
    setTimeout(() => {
      cardPreviewRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  // Upload avatar
  const handleImageFile = async (file: File) => {
    if (!selectedMember) return;
    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn file hình ảnh (PNG, JPG, WebP)!');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      alert('Ảnh có dung lượng quá lớn (>8MB). Vui lòng chọn ảnh nhỏ hơn.');
      return;
    }

    setIsUploadingAvatar(true);
    try {
      const driveUrl = await uploadMemberAvatarViaBackend(file, selectedMember.fullName, appsScriptUrl);
      setAvatarUrl(driveUrl);
      try {
        localStorage.setItem(`k8a1_avatar_${selectedMember.fullName.trim().toLowerCase()}`, driveUrl);
      } catch {}
    } catch (err: any) {
      // Fallback base64 local
      const reader = new FileReader();
      reader.onload = (e) => {
        const b64 = e.target?.result as string;
        setAvatarUrl(b64);
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // Xác nhận điểm danh
  const handleConfirmCheckin = async () => {
    if (!selectedMember) return;
    setIsCheckingIn(true);

    try {
      const payload = {
        fullName: selectedMember.fullName,
        phone: matchedRsvp?.phone || selectedMember.phone || '',
        memberId: selectedMember.id,
        className: selectedMember.className || 'K8A1',
        shirtSize: selectedShirtSize || matchedRsvp?.shirtSize || selectedMember.shirtSize,
        avatarUrl: avatarUrl || undefined,
        nickname: selectedMember.nickname || matchedRsvp?.nickname
      };

      const res = await onCheckIn(payload);
      if (res.success) {
        setCheckInDone(true);
        setCheckInTime(res.checkedInAt || new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }));
        confetti({
          particleCount: 80,
          spread: 80,
          origin: { y: 0.6 }
        });
      } else {
        alert(res.message || 'Không thể ghi nhận điểm danh. Vui lòng thử lại hoặc báo Bàn Lễ Tân.');
      }
    } catch (err: any) {
      alert('Lỗi kết nối điểm danh: ' + (err?.message || err));
    } finally {
      setIsCheckingIn(false);
    }
  };

  // Lọc danh sách thành viên theo từ khóa tìm kiếm
  const filteredMembers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return classRoster;

    return classRoster.filter((m) => {
      const matchName = normalizeName(m.fullName).includes(q);
      const matchNick = m.nickname && normalizeName(m.nickname).includes(q);
      const matchPhone = m.phone && m.phone.includes(q);
      const matchId = m.id && m.id.toLowerCase().includes(q);
      return matchName || matchNick || matchPhone || matchId;
    });
  }, [classRoster, searchQuery]);

  // Passcode của thành viên đang chọn
  const currentPassCode = useMemo(() => {
    if (!selectedMember) return '';
    return selectedMember.id ? `K8A1-${selectedMember.id.toUpperCase()}` : 'K8A1-PASS';
  }, [selectedMember]);

  // Tải tấm vé vàng HD bằng Canvas 2D
  const handleDownloadCardPng = async () => {
    if (!selectedMember || isDownloading) return;
    setIsDownloading(true);

    try {
      const width = 1200;
      const height = 750;
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas context unavailable');

      // 1. Nền kem vàng thượng hạng
      const bgGrad = ctx.createLinearGradient(0, 0, width, height);
      bgGrad.addColorStop(0, '#FFFDF9');
      bgGrad.addColorStop(0.45, '#FAF6EE');
      bgGrad.addColorStop(1, '#F3ECE0');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // 2. Khung viền chỉ vàng đôi
      ctx.lineWidth = 6;
      ctx.strokeStyle = '#C5A880';
      ctx.strokeRect(20, 20, width - 40, height - 40);

      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#D4B996';
      ctx.strokeRect(28, 28, width - 56, height - 56);

      // 3. Họa tiết góc mạ vàng
      const bracketSize = 35;
      const bracketOffset = 38;
      ctx.lineWidth = 3.5;
      ctx.strokeStyle = '#B8860B';
      // TL
      ctx.beginPath();
      ctx.moveTo(bracketOffset, bracketOffset + bracketSize);
      ctx.lineTo(bracketOffset, bracketOffset);
      ctx.lineTo(bracketOffset + bracketSize, bracketOffset);
      ctx.stroke();
      // TR
      ctx.beginPath();
      ctx.moveTo(width - bracketOffset - bracketSize, bracketOffset);
      ctx.lineTo(width - bracketOffset, bracketOffset);
      ctx.lineTo(width - bracketOffset, bracketOffset + bracketSize);
      ctx.stroke();
      // BL
      ctx.beginPath();
      ctx.moveTo(bracketOffset, height - bracketOffset - bracketSize);
      ctx.lineTo(bracketOffset, height - bracketOffset);
      ctx.lineTo(bracketOffset + bracketSize, height - bracketOffset);
      ctx.stroke();
      // BR
      ctx.beginPath();
      ctx.moveTo(width - bracketOffset - bracketSize, height - bracketOffset);
      ctx.lineTo(width - bracketOffset, height - bracketOffset);
      ctx.lineTo(width - bracketOffset, height - bracketOffset - bracketSize);
      ctx.stroke();

      // 4. Rãnh xé vé cổ điển
      ctx.fillStyle = '#FAF8F5';
      ctx.beginPath();
      ctx.arc(20, height / 2, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(width - 20, height / 2, 16, 0, Math.PI * 2);
      ctx.fill();

      // 5. Header: Logo Trường THPT Thái Nguyên
      const logoX = 75;
      const logoY = 95;
      const logoRadius = 38;
      ctx.beginPath();
      ctx.arc(logoX, logoY, logoRadius, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#B8860B';
      ctx.stroke();

      const schoolLogoSrc = eventConfig?.schoolLogoUrl || 'https://thpttn.tnue.edu.vn/upload/doantn/logo%20thpttn.jpg';
      let logoDrawn = false;
      try {
        const logoImg = new Image();
        logoImg.crossOrigin = 'anonymous';
        await new Promise<void>((resolve, reject) => {
          const timeout = setTimeout(() => resolve(), 1500);
          logoImg.onload = () => {
            clearTimeout(timeout);
            try {
              ctx.save();
              ctx.beginPath();
              ctx.arc(logoX, logoY, logoRadius - 2, 0, Math.PI * 2);
              ctx.clip();
              ctx.drawImage(logoImg, logoX - logoRadius + 2, logoY - logoRadius + 2, (logoRadius - 2) * 2, (logoRadius - 2) * 2);
              ctx.restore();
              logoDrawn = true;
            } catch {}
            resolve();
          };
          logoImg.onerror = () => {
            clearTimeout(timeout);
            resolve();
          };
          logoImg.src = schoolLogoSrc;
        });
      } catch {}

      if (!logoDrawn) {
        ctx.fillStyle = '#78350F';
        ctx.font = 'bold 16px Georgia, serif';
        ctx.textAlign = 'center';
        ctx.fillText('THPT TN', logoX, logoY + 6);
      }

      // Tiêu đề trường & niên khóa
      ctx.fillStyle = '#78350F';
      ctx.font = 'bold 14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('TRƯỜNG THPT THÁI NGUYÊN • NIÊN KHÓA 2003 — 2006', 130, 80);

      ctx.fillStyle = '#0F172A';
      ctx.font = 'bold 24px Georgia, serif';
      ctx.fillText('TẤM VÉ VÀNG THANH XUÂN • HỘI NGỘ 20 NĂM NGÀY TRỞ VỀ', 130, 114);

      // Badge mã vé bên phải
      const badgeW = 200;
      const badgeH = 50;
      const badgeX = width - 65 - badgeW;
      const badgeY = 68;
      ctx.fillStyle = '#78350F';
      roundRect(ctx, badgeX, badgeY, badgeW, badgeH, 8);
      ctx.fill();

      ctx.fillStyle = '#FEF3C7';
      ctx.font = 'bold 11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('VÉ MỜI DANH DỰ', badgeX + badgeW / 2, badgeY + 20);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 17px monospace';
      ctx.fillText(`#${currentPassCode}`, badgeX + badgeW / 2, badgeY + 41);

      // Đường kẻ phân cách Header
      ctx.strokeStyle = '#E2CBA8';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(65, 155);
      ctx.lineTo(width - 65, 155);
      ctx.stroke();

      // 6. Avatar thành viên
      const photoX = 65;
      const photoY = 185;
      const photoW = 210;
      const photoH = 265;
      ctx.fillStyle = '#FFFFFF';
      roundRect(ctx, photoX, photoY, photoW, photoH, 12);
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#B8860B';
      ctx.stroke();

      let avatarDrawn = false;
      if (avatarUrl) {
        try {
          const avImg = new Image();
          avImg.crossOrigin = 'anonymous';
          await new Promise<void>((resolve) => {
            const timeout = setTimeout(() => resolve(), 1500);
            avImg.onload = () => {
              clearTimeout(timeout);
              try {
                ctx.save();
                roundRect(ctx, photoX + 6, photoY + 6, photoW - 12, photoH - 12, 8);
                ctx.clip();
                ctx.drawImage(avImg, photoX + 6, photoY + 6, photoW - 12, photoH - 12);
                ctx.restore();
                avatarDrawn = true;
              } catch {}
              resolve();
            };
            avImg.onerror = () => {
              clearTimeout(timeout);
              resolve();
            };
            avImg.src = avatarUrl;
          });
        } catch {}
      }

      if (!avatarDrawn) {
        ctx.fillStyle = '#FAF0DE';
        roundRect(ctx, photoX + 6, photoY + 6, photoW - 12, photoH - 12, 8);
        ctx.fill();
        ctx.fillStyle = '#B45309';
        ctx.beginPath();
        ctx.arc(photoX + photoW / 2, photoY + photoH / 2 - 25, 38, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(photoX + photoW / 2, photoY + photoH / 2 + 65, 58, 0, Math.PI * 2);
        ctx.fill();
      }

      // Ribbon dưới ảnh chân dung
      const ribH = 30;
      ctx.fillStyle = 'rgba(120, 53, 15, 0.9)';
      roundRect(ctx, photoX + 6, photoY + photoH - ribH - 6, photoW - 12, ribH, 6);
      ctx.fill();
      ctx.fillStyle = '#FEF3C7';
      ctx.font = 'bold 11px Georgia, serif';
      ctx.textAlign = 'center';
      ctx.fillText('K8A1 • 20 NĂM TRI KỶ', photoX + photoW / 2, photoY + photoH - 14);

      // 7. Chi tiết thành viên
      const infoX = 310;
      ctx.fillStyle = '#78350F';
      ctx.font = 'bold 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('THÀNH VIÊN KHÓA 8 (2003 — 2006)', infoX, 205);

      ctx.fillStyle = '#0F172A';
      ctx.font = 'bold 44px Georgia, serif';
      ctx.fillText(selectedMember.fullName, infoX, 255);

      if (selectedMember.nickname) {
        const nickText = `"${selectedMember.nickname}"`;
        ctx.font = 'italic bold 17px Georgia, serif';
        const nw = ctx.measureText(nickText).width + 24;
        ctx.fillStyle = '#FEF3C7';
        roundRect(ctx, infoX, 275, nw, 32, 16);
        ctx.fill();
        ctx.strokeStyle = '#FCD34D';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = '#78350F';
        ctx.fillText(nickText, infoX + 12, 297);
      }

      // 4 Hộp thông số 2x2
      const gridY = 330;
      const boxW = 370;
      const boxH = 68;

      // Box 1: Lớp
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
      ctx.fillText('K8A1 (2003 — 2006)', infoX + 16, gridY + 54);

      // Box 2: Hạng vé danh dự
      const box2X = infoX + boxW + 20;
      ctx.fillStyle = '#FFFFFF';
      roundRect(ctx, box2X, gridY, boxW, boxH, 8);
      ctx.fill();
      ctx.strokeStyle = '#E2D3BE';
      ctx.stroke();
      ctx.fillStyle = '#64748B';
      ctx.font = 'bold 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillText('HẠNG VÉ MỜI', box2X + 16, gridY + 26);
      ctx.fillStyle = '#0F172A';
      ctx.font = 'bold 20px Georgia, serif';
      ctx.fillText('Vé Vàng Tri Kỷ 20 Năm', box2X + 16, gridY + 54);

      // Box 3: Thời gian
      const gridY2 = gridY + boxH + 15;
      ctx.fillStyle = '#FFFFFF';
      roundRect(ctx, infoX, gridY2, boxW, boxH, 8);
      ctx.fill();
      ctx.strokeStyle = '#E2D3BE';
      ctx.stroke();
      ctx.fillStyle = '#64748B';
      ctx.font = 'bold 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillText('THỜI GIAN TẬP TRUNG', infoX + 16, gridY2 + 26);
      ctx.fillStyle = '#0F172A';
      ctx.font = 'bold 16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillText(eventConfig?.eventDateText || 'Từ 08:30 • Chủ Nhật, 27/09/2026', infoX + 16, gridY2 + 53);

      // Box 4: Địa điểm
      ctx.fillStyle = '#FFFFFF';
      roundRect(ctx, box2X, gridY2, boxW, boxH, 8);
      ctx.fill();
      ctx.strokeStyle = '#E2D3BE';
      ctx.stroke();
      ctx.fillStyle = '#64748B';
      ctx.font = 'bold 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillText('ĐỊA ĐIỂM HỘI TRƯỜNG', box2X + 16, gridY2 + 26);
      ctx.fillStyle = '#0F172A';
      ctx.font = 'bold 16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillText(eventConfig?.venueName || 'Trường THPT Thái Nguyên', box2X + 16, gridY2 + 53);

      // Con Dấu Sáp Đỏ Điểm Danh (Nếu đã điểm danh)
      if (checkInDone) {
        const sealX = width - 180;
        const sealY = 240;
        ctx.save();
        ctx.translate(sealX, sealY);
        ctx.rotate(-0.15);

        ctx.fillStyle = 'rgba(220, 38, 38, 0.9)';
        ctx.beginPath();
        ctx.arc(0, 0, 54, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#FEE2E2';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('★ ĐÃ ĐẾN ★', 0, -20);
        ctx.font = 'bold 14px Georgia, serif';
        ctx.fillText('ĐIỂM DANH', 0, 2);
        ctx.font = 'bold 10px monospace';
        ctx.fillText(checkInTime || 'CÓ MẶT', 0, 22);

        ctx.restore();
      }

      // 8. Footer
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

      // Gate badge
      const gateW = 230;
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

      // Xuất sang JPG độ nét cao và hỗ trợ lưu vào Thư viện ảnh điện thoại
      const safeName = (selectedMember.fullName || 'K8A1').replace(/[^a-zA-Z0-9\u00C0-\u024F\u1EA0-\u1EF9]/g, '_');
      const filename = `Ve_Vang_20Nam_K8A1_${safeName}.jpg`;
      const cardTitle = `Tấm Vé Vàng 20 Năm K8A1 — ${selectedMember.fullName || 'Thành Viên'}`;

      const res = await saveOrDownloadJpg(canvas, filename, cardTitle, 0.92);

      if (res.success) {
        setDownloadSuccess(true);
        setTimeout(() => setDownloadSuccess(false), 3000);
        try {
          confetti({
            particleCount: 50,
            spread: 70,
            origin: { y: 0.7 }
          });
        } catch {}

        if (res.method === 'preview_fallback' && res.dataUrl) {
          setPhotoSaveModal({
            isOpen: true,
            imageUrl: res.dataUrl,
            filename,
            title: cardTitle
          });
        }
      } else if (res.dataUrl) {
        setPhotoSaveModal({
          isOpen: true,
          imageUrl: res.dataUrl,
          filename,
          title: cardTitle
        });
      }
    } catch (err: any) {
      console.error('Download card error:', err);
      alert('Không thể tạo ảnh thẻ tự động. Bạn có thể chụp màn hình.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCopyLink = () => {
    try {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      alert('Không thể tự động sao chép link.');
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-brand-text flex flex-col justify-between selection:bg-brand-gold/20 pb-16">
      {/* Hidden file input */}
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

      {/* TOP HEADER */}
      <header className="sticky top-0 z-40 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-brand-border/80 shadow-2xs">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <button
            onClick={onExitCheckin}
            className="inline-flex items-center gap-1.5 text-xs font-sans font-bold text-brand-text hover:text-brand-gold px-2.5 py-1.5 rounded-lg border border-brand-border bg-white hover:bg-amber-50/50 transition-colors cursor-pointer shrink-0 shadow-2xs"
            title="Quay lại trang chủ WebApp K8A1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Về Trang Chủ WebApp</span>
            <span className="sm:hidden">Trang Chủ</span>
          </button>

          <div className="flex items-center gap-2 text-center min-w-0">
            <div className="w-8 h-8 rounded-full overflow-hidden border border-brand-gold bg-white p-0.5 shrink-0 shadow-2xs">
              <img
                src={eventConfig?.schoolLogoUrl || 'https://thpttn.tnue.edu.vn/upload/doantn/logo%20thpttn.jpg'}
                alt="Logo THPT Thái Nguyên"
                className="w-full h-full object-cover rounded-full"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <div className="min-w-0">
              <h1 className="text-xs sm:text-sm font-serif font-black uppercase text-brand-text tracking-wide truncate">
                Cổng Tự Điểm Danh K8A1
              </h1>
              <p className="text-[10px] text-brand-gold font-sans font-bold uppercase tracking-widest truncate">
                20 Năm Ngày Trở Về (2006 — 2026)
              </p>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-1.5">
            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1 text-[11px] font-sans font-bold px-2 py-1 bg-white border border-brand-border rounded-md hover:border-brand-gold text-brand-text-muted hover:text-brand-text cursor-pointer transition-colors shadow-2xs"
              title="Sao chép liên kết điểm danh"
            >
              <Share2 className="w-3 h-3" />
              <span className="hidden md:inline">{copiedLink ? 'Đã chép!' : 'Chia sẻ'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="max-w-3xl mx-auto px-4 py-6 w-full space-y-6">
        {/* KPI ATTENDANCE BANNER */}
        <div className="bg-gradient-to-r from-[#FAF3E0] via-[#FFF9E6] to-[#FAF3E0] border border-brand-gold/40 rounded-xl p-4 shadow-sm text-center relative overflow-hidden">
          <div className="relative z-10 space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-500/15 border border-amber-400/50 text-amber-900 text-[10px] font-sans font-black uppercase tracking-widest">
              <Award className="w-3.5 h-3.5 text-amber-700" />
              <span>Sĩ Số Điểm Danh Thực Tế Hội Trường</span>
            </div>
            <div className="flex items-baseline justify-center gap-2">
              <span className="text-2xl sm:text-3xl font-serif font-black text-emerald-800">
                {checkedInCount}
              </span>
              <span className="text-sm font-serif text-brand-text-muted font-bold">
                / {confirmedAttendees.length > 0 ? confirmedAttendees.length : totalRosterCount} bạn đã có mặt
              </span>
            </div>
            {/* Progress Bar */}
            <div className="w-full max-w-md mx-auto bg-amber-200/50 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-600 h-full rounded-full transition-all duration-700"
                style={{
                  width: `${Math.min(
                    100,
                    Math.round(
                      (checkedInCount /
                        (confirmedAttendees.length > 0 ? confirmedAttendees.length : totalRosterCount)) *
                        100
                    )
                  )}%`
                }}
              />
            </div>
          </div>
        </div>

        {/* STEP 1: SEARCH & SELECT MEMBER */}
        {!selectedMember ? (
          <section className="bg-white border border-brand-border rounded-xl p-4 sm:p-6 shadow-sm space-y-4">
            <div className="text-center space-y-1">
              <h2 className="text-lg sm:text-xl font-serif font-bold text-brand-text">
                Bước 1: Tìm & Chọn Tên Bạn Để Nhận Vé Vàng
              </h2>
              <p className="text-xs text-brand-text-muted font-serif italic">
                Gõ tên, biệt danh học trò hoặc số điện thoại để tìm nhanh trong danh sách 43 bạn Lớp K8A1.
              </p>
            </div>

            {/* Search Box */}
            <div className="relative">
              <Search className="w-4 h-4 text-brand-gold absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Nhập tên bạn (Ví dụ: Long, Phương, Hạnh...)"
                className="w-full pl-10 pr-4 py-2.5 bg-[#FAF8F5] border border-brand-border rounded-lg text-sm font-serif text-brand-text focus:outline-none focus:border-brand-gold focus:ring-1 focus:ring-brand-gold shadow-2xs"
                autoFocus
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Members Grid / List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[60vh] overflow-y-auto pr-1">
              {filteredMembers.length === 0 ? (
                <div className="col-span-full py-10 text-center text-brand-text-muted italic text-xs">
                  Không tìm thấy tên bạn trong danh bạ Lớp K8A1. Vui lòng liên hệ Bàn Lễ Tân để được hỗ trợ!
                </div>
              ) : (
                filteredMembers.map((m) => {
                  const rsvp = rsvpList.find(
                    (r) =>
                      (m.id && r.memberId === m.id) ||
                      normalizeName(r.fullName) === normalizeName(m.fullName) ||
                      isVietnameseNameMatch(m, r.fullName, r.nickname)
                  );
                  const isChecked = Boolean(rsvp?.checkedIn);

                  return (
                    <button
                      key={m.id || m.fullName}
                      onClick={() => handleSelectMember(m)}
                      className="group text-left p-3 rounded-lg border border-brand-border/80 bg-[#FAF9F6] hover:bg-amber-50/70 hover:border-brand-gold transition-all flex items-center justify-between gap-2.5 cursor-pointer shadow-2xs"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-white border border-brand-gold/60 flex items-center justify-center text-brand-gold font-serif font-bold text-sm shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                          {m.fullName
                            .split(' ')
                            .filter(Boolean)
                            .slice(-1)[0]?.[0] || 'K'}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h3 className="font-serif font-bold text-sm text-brand-text group-hover:text-amber-900 transition-colors">
                              {m.fullName}
                            </h3>
                            {m.nickname && (
                              <span className="text-[10px] font-sans font-bold text-amber-900 bg-amber-100/90 px-1.5 py-0.2 rounded border border-amber-300 italic">
                                "{m.nickname}"
                              </span>
                            )}
                          </div>
                          <p className="text-[10.5px] text-brand-text-muted font-mono truncate">
                            {m.id ? `#${m.id.toUpperCase()}` : 'K8A1'} • {m.phone ? maskPhone(m.phone) : 'Chưa có SĐT'}
                          </p>
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center gap-1">
                        {isChecked ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-sans font-bold rounded-full">
                            <Check className="w-3 h-3" />
                            <span>Đã đến</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-brand-gold group-hover:translate-x-0.5 transition-transform">
                            <ChevronRight className="w-4 h-4" />
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </section>
        ) : (
          /* STEP 2: GOLDEN PASS & CHECK-IN ACTION */
          <section ref={cardPreviewRef} className="space-y-5 animate-fadeIn">
            {/* Action Bar: Change Member */}
            <div className="flex items-center justify-between gap-2">
              <button
                onClick={() => setSelectedMember(null)}
                className="inline-flex items-center gap-1 text-xs font-sans font-bold text-brand-text-muted hover:text-brand-text px-3 py-1.5 rounded-lg border border-brand-border bg-white hover:bg-brand-border/20 transition-colors cursor-pointer shadow-2xs"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Chọn thành viên khác</span>
              </button>

              <span className="text-[11px] font-sans font-bold uppercase tracking-wider text-amber-900 bg-amber-100/80 border border-amber-300/80 px-2.5 py-1 rounded-md shadow-2xs">
                Mã Thẻ: #{currentPassCode}
              </span>
            </div>

            {/* THE GOLDEN ALUMNI PASS (HTML RENDER) */}
            <div className="relative bg-gradient-to-br from-[#FFFDF9] via-[#FAF6F0] to-[#F5EFE6] border-2 border-[#C5A880] rounded-xl p-4 sm:p-5 shadow-lg overflow-hidden">
              {/* Corner Ornaments */}
              <div className="absolute top-2 left-2 w-3.5 h-3.5 border-t-2 border-l-2 border-brand-gold" />
              <div className="absolute top-2 right-2 w-3.5 h-3.5 border-t-2 border-r-2 border-brand-gold" />
              <div className="absolute bottom-2 left-2 w-3.5 h-3.5 border-b-2 border-l-2 border-brand-gold" />
              <div className="absolute bottom-2 right-2 w-3.5 h-3.5 border-b-2 border-r-2 border-brand-gold" />

              {/* Watermark */}
              <div className="absolute inset-0 flex items-center justify-center opacity-4 pointer-events-none">
                <School className="w-64 h-64 text-brand-gold" />
              </div>

              {/* Card Header with School Logo */}
              <div className="flex items-center justify-between border-b border-brand-gold/30 pb-3 mb-3 gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-amber-500/80 bg-white flex items-center justify-center shrink-0 shadow-2xs">
                    <img
                      src={eventConfig?.schoolLogoUrl || 'https://thpttn.tnue.edu.vn/upload/doantn/logo%20thpttn.jpg'}
                      alt="Logo Trường THPT Thái Nguyên"
                      className="w-full h-full object-cover p-0.5"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[9.5px] font-sans font-bold uppercase tracking-widest text-amber-800 leading-tight">
                      THPT Thái Nguyên • Khóa 8 (2003 — 2006)
                    </p>
                    <h3 className="text-xs sm:text-sm font-serif font-bold text-brand-text uppercase tracking-wide leading-tight mt-0.5">
                      Vé Vàng Thanh Xuân • Hội Ngộ 20 Năm
                    </h3>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="inline-block px-2.5 py-0.5 bg-gradient-to-r from-amber-600 to-amber-700 text-white text-[9.5px] font-sans font-bold tracking-widest rounded uppercase shadow-2xs">
                    Tri Kỷ 20 Năm
                  </span>
                  <p className="text-[10.5px] font-mono font-bold text-amber-950 mt-0.5 tracking-wider">
                    #{currentPassCode}
                  </p>
                </div>
              </div>

              {/* Card Body */}
              <div className="flex gap-3 sm:gap-4 items-center">
                {/* Avatar Frame with Upload */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="group relative shrink-0 w-20 h-26 sm:w-24 sm:h-30 bg-[#F0EAE1] border-2 border-dashed border-brand-gold/70 rounded-md flex flex-col items-center justify-center text-center overflow-hidden cursor-pointer hover:border-brand-gold transition-all select-none shadow-xs"
                  title="Bấm để tải ảnh đại diện / ảnh selfie"
                >
                  {avatarUrl ? (
                    <>
                      <img
                        src={avatarUrl}
                        alt={selectedMember.fullName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white p-1">
                        <Camera className="w-4 h-4 mb-0.5 text-amber-300 drop-shadow" />
                        <span className="text-[8px] font-sans font-bold">Đổi ảnh</span>
                      </div>
                      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent py-0.5 text-center pointer-events-none">
                        <span className="text-[7px] text-amber-200 font-serif tracking-widest font-bold uppercase block">
                          K8A1 • 20Y
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="p-1 flex flex-col items-center justify-center">
                      <div className="w-7 h-7 rounded-full bg-brand-gold/15 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                        <Camera className="w-3.5 h-3.5 text-brand-gold" />
                      </div>
                      <span className="text-[8px] font-sans font-bold uppercase text-brand-text">
                        Tải ảnh thẻ
                      </span>
                      <span className="text-[7px] font-sans font-medium text-amber-800">
                        Bấm để chọn
                      </span>
                    </div>
                  )}
                </div>

                {/* Member Details */}
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div>
                    <p className="text-[8.5px] uppercase tracking-wider font-sans text-brand-text-muted font-bold">
                      Họ và Tên Thành Viên
                    </p>
                    <div className="flex flex-wrap items-baseline gap-1.5">
                      <h4 className="text-base sm:text-xl font-serif font-black text-brand-text tracking-wide leading-tight">
                        {selectedMember.fullName}
                      </h4>
                      {selectedMember.nickname && (
                        <span className="text-[9.5px] font-sans font-bold text-amber-900 bg-amber-100/90 px-2 py-0.5 rounded-full border border-amber-300 italic">
                          "{selectedMember.nickname}"
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="pt-1.5 border-t border-brand-gold/25 space-y-1">
                    <div className="flex flex-wrap items-center justify-between gap-1 text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[8.5px] uppercase font-sans text-slate-500 font-bold">Lớp:</span>
                        <span className="font-serif font-bold text-amber-900 text-xs sm:text-sm">K8A1 (2003 — 2006)</span>
                        {selectedShirtSize && (
                          <span className="text-[9px] font-sans text-slate-400 font-normal ml-0.5">
                            (Size {selectedShirtSize})
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        <span className="text-[8.5px] uppercase font-sans text-slate-500 font-bold">Hạng Vé:</span>
                        <span className="font-serif font-bold text-amber-900 text-xs sm:text-sm">Tri Kỷ 20 Năm</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-[10.5px] text-brand-text-muted">
                      <Calendar className="w-3 h-3 text-brand-gold shrink-0" />
                      <span className="truncate">{eventConfig?.eventDateText || '08:30 • 27/09/2026'}</span>
                      <span className="mx-1">•</span>
                      <MapPin className="w-3 h-3 text-brand-gold shrink-0" />
                      <span className="truncate">{eventConfig?.venueName || 'THPT Thái Nguyên'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Wax Seal Overlay if Checked In */}
              {checkInDone && (
                <div className="absolute top-12 right-4 sm:right-8 rotate-[-12deg] pointer-events-none animate-fadeIn">
                  <div className="w-24 h-24 rounded-full bg-rose-700/95 border-2 border-amber-300 shadow-xl flex flex-col items-center justify-center text-white text-center p-1">
                    <div className="border border-white/60 rounded-full w-full h-full flex flex-col items-center justify-center p-1">
                      <span className="text-[8px] font-sans font-bold uppercase tracking-wider text-amber-200">
                        ★ ĐÃ ĐẾN ★
                      </span>
                      <span className="text-[11px] font-serif font-black uppercase tracking-wider leading-tight">
                        ĐÃ ĐIỂM DANH
                      </span>
                      <span className="text-[8px] font-mono font-semibold text-rose-100 mt-0.5">
                        {checkInTime || 'CÓ MẶT'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* CHECK-IN ACTION BUTTONS */}
            <div className="space-y-3 pt-2">
              {!checkInDone ? (
                <button
                  onClick={handleConfirmCheckin}
                  disabled={isCheckingIn}
                  className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-700 hover:to-amber-700 text-slate-950 font-sans font-black text-base uppercase tracking-wider shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isCheckingIn ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Đang xác nhận điểm danh...</span>
                    </>
                  ) : (
                    <>
                      <UserCheck className="w-5 h-5 text-slate-950" />
                      <span>Xác Nhận Điểm Danh Có Mặt Ngay</span>
                      <Sparkles className="w-4 h-4 text-amber-950" />
                    </>
                  )}
                </button>
              ) : (
                <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-4 text-center space-y-2 shadow-sm">
                  <div className="flex items-center justify-center gap-2 text-emerald-800 font-serif font-bold text-base">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>Chào mừng {selectedMember.fullName} đã có mặt tại ngày hội ngộ!</span>
                  </div>
                  <p className="text-xs text-emerald-700 font-sans">
                    Điểm danh thành công lúc {checkInTime || 'vừa xong'}. Chào mừng bạn đã về lại mái trường xưa hội ngộ cùng thầy cô và bạn bè K8A1!
                  </p>
                </div>
              )}

              {/* SUB BUTTONS: DOWNLOAD PASS & RETURN */}
              <div className="p-2.5 bg-amber-500/10 border border-amber-300/70 rounded-xl text-xs text-amber-950 flex items-center gap-2">
                <span className="text-base shrink-0">💡</span>
                <span><strong>Mẹo lưu trên điện thoại:</strong> Bấm <em>"Lưu Vé Vàng Vào Thư Viện"</em> để chọn lưu vào Thư viện ảnh (Cuộn Camera) hoặc chia sẻ nhanh!</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  onClick={handleDownloadCardPng}
                  disabled={isDownloading}
                  className="py-2.5 px-4 rounded-lg bg-white border border-brand-gold/80 hover:bg-amber-50 text-brand-text font-sans font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                >
                  {isDownloading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-brand-gold" />
                      <span>Đang xuất JPG...</span>
                    </>
                  ) : downloadSuccess ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>Đã tải ảnh JPG!</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 text-brand-gold" />
                      <span>Lưu Vé Vàng Vào Thư Viện (.JPG)</span>
                    </>
                  )}
                </button>

                <button
                  onClick={onExitCheckin}
                  className="py-2.5 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-sans font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                >
                  <span>Khám phá WebApp 20 Năm</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* FOOTER */}
      <footer className="text-center py-4 px-4 text-[11px] text-brand-text-muted border-t border-brand-border/60">
        <p className="font-serif italic">
          Kỷ niệm 20 năm ngày ra trường Lớp K8A1 — Trường THPT Thái Nguyên (2003 — 2006)
        </p>
      </footer>
    </div>
  );
}
