import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  X, 
  Download, 
  Copy, 
  Share2, 
  Sparkles, 
  Check, 
  Shirt, 
  Users, 
  Calendar, 
  Coins, 
  Award,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  MessageCircle,
  HelpCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { RsvpData, ClassMember, EventConfig } from '../types';
import { CLASS_ROSTER_K8A1, SHIRT_SIZE_OPTIONS, normalizeShirtSize } from '../data';

interface ZaloShareInfographicsModalProps {
  isOpen: boolean;
  onClose: () => void;
  rsvpList: RsvpData[];
  classRoster?: ClassMember[];
  eventConfig?: EventConfig;
  activeMember?: ClassMember | null;
  appsScriptUrl?: string;
  onUpdateRsvpList?: (list: RsvpData[]) => void;
  onUpdateClassRoster?: (list: ClassMember[]) => void;
  onRefreshData?: () => void;
}

type TemplateId = 'milestone' | 'attendees' | 'shirts' | 'finances';

export default function ZaloShareInfographicsModal({
  isOpen,
  onClose,
  rsvpList,
  classRoster,
  eventConfig,
  activeMember,
  appsScriptUrl,
  onUpdateRsvpList,
  onUpdateClassRoster,
  onRefreshData
}: ZaloShareInfographicsModalProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateId>('milestone');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedImage, setCopiedImage] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Bộ nhớ đệm dữ liệu trực tiếp lấy từ Google Sheet
  const [liveRsvpList, setLiveRsvpList] = useState<RsvpData[]>(rsvpList);
  const [liveClassRoster, setLiveClassRoster] = useState<ClassMember[]>(classRoster || []);

  // Tự động đồng bộ khi props bên ngoài thay đổi
  useEffect(() => {
    if (rsvpList && rsvpList.length > 0) {
      setLiveRsvpList(rsvpList);
    }
  }, [rsvpList]);

  useEffect(() => {
    if (classRoster && classRoster.length > 0) {
      setLiveClassRoster(classRoster);
    }
  }, [classRoster]);

  const effectiveRsvp = liveRsvpList && liveRsvpList.length > 0 ? liveRsvpList : rsvpList;
  const rosterList = liveClassRoster && liveClassRoster.length > 0 ? liveClassRoster : (classRoster && classRoster.length > 0 ? classRoster : CLASS_ROSTER_K8A1);
  const totalRoster = rosterList.length || 65;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewImgRef = useRef<HTMLImageElement>(null);
  const [previewDataUrl, setPreviewDataUrl] = useState<string>('');

  // ⚡ TẢI DỮ LIỆU GỐC TRỰC TIẾP TỪ GOOGLE SHEET (KHÔNG THÔNG QUA CACHE)
  const fetchFreshDataFromSheet = async () => {
    const targetUrl = appsScriptUrl;
    if (!targetUrl || !targetUrl.startsWith('http')) {
      if (onRefreshData) onRefreshData();
      return;
    }

    setIsRefreshing(true);
    setFeedbackMsg('⏳ Đang tự động nạp dữ liệu gốc mới nhất từ Google Sheet...');

    try {
      const adminPinToken = sessionStorage.getItem('admin_pin_token') || '';
      const pinQuery = adminPinToken ? `&pin=${encodeURIComponent(adminPinToken)}` : '';
      const timestamp = Date.now();

      // Tải song song siêu tốc cả sheet Điểm danh (Trang_tinh_1) và Danh bạ (Danh_Sach_Lop)
      const [rsvpRes, rosterRes] = await Promise.allSettled([
        fetch(`${targetUrl}?action=get_rsvp${pinQuery}&t=${timestamp}`, { cache: 'no-store' }).then(r => r.json()),
        fetch(`${targetUrl}?action=get_roster${pinQuery}&t=${timestamp}`, { cache: 'no-store' }).then(r => r.json())
      ]);

      let updatedRsvp = false;
      let updatedRoster = false;

      if (rsvpRes.status === 'fulfilled' && rsvpRes.value?.status === 'success' && Array.isArray(rsvpRes.value.data) && rsvpRes.value.data.length > 0) {
        setLiveRsvpList(rsvpRes.value.data);
        try { localStorage.setItem('rsvp_list', JSON.stringify(rsvpRes.value.data)); } catch (e) {}
        updatedRsvp = true;
      }

      if (rosterRes.status === 'fulfilled' && rosterRes.value?.status === 'success' && Array.isArray(rosterRes.value.data) && rosterRes.value.data.length > 0) {
        setLiveClassRoster(rosterRes.value.data);
        try { localStorage.setItem('k8a1_class_roster', JSON.stringify(rosterRes.value.data)); } catch (e) {}
        updatedRoster = true;
      }

      const syncTimeStr = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

      if (updatedRsvp || updatedRoster) {
        setFeedbackMsg(`✓ Đã nạp dữ liệu gốc từ Google Sheet thành công (${syncTimeStr})!`);
      } else {
        setFeedbackMsg(`✓ Dữ liệu hiện tại đã khớp 100% với Google Sheet (${syncTimeStr})`);
      }

      // Kích hoạt ngầm toàn bộ app
      if (onRefreshData) {
        onRefreshData();
      }
    } catch (err) {
      console.warn('Lỗi tải dữ liệu gốc từ Google Sheet:', err);
      setFeedbackMsg('⚠️ Lỗi kết nối Google Sheet. Đang dùng dữ liệu sẵn có.');
      if (onRefreshData) onRefreshData();
    } finally {
      setIsRefreshing(false);
      setTimeout(() => setFeedbackMsg(''), 4500);
    }
  };

  // 🚀 TỰ ĐỘNG NẠP DỮ LIỆU GỐC TỪ GOOGLE SHEET MỖI KHI MỞ MODAL XUẤT ẢNH
  useEffect(() => {
    if (isOpen) {
      fetchFreshDataFromSheet();
    }
  }, [isOpen]);

  // Bản đồ tra cứu thông tin học sinh từ danh bạ lớp (Master Roster)
  const rosterMap = useMemo(() => {
    const map = new Map<string, ClassMember>();
    rosterList.forEach(m => {
      if (m.id) map.set(m.id.toLowerCase(), m);
      if (m.fullName) map.set(m.fullName.trim().toLowerCase(), m);
    });
    return map;
  }, [rosterList]);

  // Lấy size áo chính xác nhất của thành viên (kết hợp thông minh giữa Điểm danh & Danh bạ)
  const getAttendeeShirtSize = (att: RsvpData): string => {
    const fromRsvp = normalizeShirtSize(att.shirtSize);
    const rosterMem = (att.memberId ? rosterMap.get(att.memberId.toLowerCase()) : null) || 
                      rosterMap.get(att.fullName?.trim().toLowerCase());
    const fromRoster = normalizeShirtSize(rosterMem?.shirtSize);

    // 1. Nếu trên phiếu điểm danh RSVP đã chọn size
    if (fromRsvp) {
      // Nếu trong Danh bạ được admin cập nhật size mới khác 'L'
      if (fromRsvp === 'L' && fromRoster && fromRoster !== 'L') {
        return fromRoster;
      }
      return fromRsvp;
    }

    // 2. Nếu trên phiếu RSVP để trống (chưa chọn size hoặc bị xóa trống):
    // Chỉ lấy từ Danh bạ nếu Danh bạ có size cụ thể KHÁC 'L' (để không bị dính chữ L mặc định cũ)
    if (fromRoster && fromRoster !== 'L') {
      return fromRoster;
    }

    // 3. Mặc định: Chưa chọn size
    return '';
  };

  // Tính toán số liệu thống kê dựa trên dữ liệu gốc
  const confirmedAttendees = useMemo(() => effectiveRsvp.filter(r => r.status === 'yes'), [effectiveRsvp]);
  const absentAttendees = useMemo(() => effectiveRsvp.filter(r => r.status === 'no'), [effectiveRsvp]);
  const confirmedCount = confirmedAttendees.length;
  const absentCount = absentAttendees.length;
  
  // Tính danh sách chưa phản hồi
  const pendingMembers = useMemo(() => {
    return rosterList.filter(m => {
      return !effectiveRsvp.some(r => (r.memberId && r.memberId === m.id) || r.fullName.trim().toLowerCase() === m.fullName.trim().toLowerCase());
    });
  }, [rosterList, effectiveRsvp]);

  // Phân bổ size áo trong số các bạn đã xác nhận tham dự
  const shirtDistribution = useMemo(() => {
    const counts: Record<string, number> = {
      'S': 0,
      'M': 0,
      'L': 0,
      'XL': 0,
      'XXL': 0,
      'XXXL': 0
    };
    confirmedAttendees.forEach(r => {
      const s = getAttendeeShirtSize(r);
      if (s && counts[s] !== undefined) {
        counts[s]++;
      }
    });
    return counts;
  }, [confirmedAttendees, rosterMap]);

  // Các bạn đã xác nhận CÓ THAM GIA nhưng CHƯA CHỌN SIZE ÁO
  const confirmedPendingShirt = useMemo(() => {
    return confirmedAttendees.filter(r => !getAttendeeShirtSize(r));
  }, [confirmedAttendees, rosterMap]);

  // Tính quỹ
  const standardFund = Number(eventConfig?.fundAmountPerPerson) || 700000;
  const paidAttendees = useMemo(() => effectiveRsvp.filter(r => r.fundStatus === 'paid'), [effectiveRsvp]);
  const totalFundCollected = useMemo(() => {
    return effectiveRsvp.reduce((acc, cur) => {
      if (cur.fundStatus === 'paid') {
        return acc + (Number(cur.fundAmount) || standardFund);
      }
      return acc;
    }, 0);
  }, [effectiveRsvp, standardFund]);

  // Đếm ngược ngày
  const daysLeft = useMemo(() => {
    const targetDate = new Date('2026-09-27T08:30:00');
    const now = new Date();
    const diffTime = targetDate.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  }, []);

  // Đóng modal bằng phím ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Khóa cuộn trang khi modal mở
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Helper vẽ hình bo góc trên Canvas
  const drawRoundRect = (
    ctx: CanvasRenderingContext2D, 
    x: number, 
    y: number, 
    w: number, 
    h: number, 
    r: number | { tl?: number; tr?: number; br?: number; bl?: number }
  ) => {
    ctx.beginPath();
    if (typeof r === 'number') {
      ctx.roundRect(x, y, w, h, r);
    } else {
      const radius = { tl: 0, tr: 0, br: 0, bl: 0, ...r };
      ctx.roundRect(x, y, w, h, [radius.tl, radius.tr, radius.br, radius.bl]);
    }
  };

  // Helper vẽ chữ tự động xuống dòng và căn giữa
  const wrapAndCenterText = (
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    lineHeight: number
  ) => {
    const words = text.split(' ');
    let line = '';
    let currentY = y;
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        ctx.fillText(line.trim(), x, currentY);
        line = words[n] + ' ';
        currentY += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line.trim(), x, currentY);
    return currentY;
  };

  // Render Canvas khi đổi template hoặc dữ liệu
  useEffect(() => {
    if (!isOpen) return;

    const renderCard = async () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      setIsGenerating(true);

      // Kích thước chuẩn 1080 x 1350 (4:5 vertical). Tự động mở rộng chiều cao khi danh sách điểm danh dài để hiển thị ĐẦY ĐỦ 100%
      const width = 1080;
      let height = 1350;

      if (selectedTemplate === 'attendees') {
        const totalItems = confirmedAttendees.length;
        const rows = Math.max(1, Math.ceil(totalItems / 3));
        const gridH = rows * 46 + 28;
        // bodyY (295) + 55 + 38 + gridH + 20 (alert) + 76 (alert box) + 24 (gap) + 165 (footer) + 30 (padding)
        const neededH = 388 + gridH + 20 + 76 + 24 + 165 + 30;
        height = Math.max(1350, Math.round(neededH));
      } else if (selectedTemplate === 'shirts') {
        const pendingCount = confirmedPendingShirt.length;
        if (pendingCount > 15) {
          const pRows = Math.ceil(pendingCount / 3);
          const pBoxH = 65 + pRows * 42 + 20;
          const neededH = 295 + 60 + 240 + 20 + pBoxH + 25 + 40 + 165 + 30;
          height = Math.max(1350, Math.round(neededH));
        }
      }

      canvas.width = width;
      canvas.height = height;

      // 1. NỀN GIẤY THƠM VÀNG KIM CỔ ĐIỂN
      const bgGrad = ctx.createLinearGradient(0, 0, width, height);
      bgGrad.addColorStop(0, '#FFFDF9');
      bgGrad.addColorStop(0.5, '#FBF6EC');
      bgGrad.addColorStop(1, '#F3E8CE');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // HOA VĂN CHÌM NỀN
      ctx.save();
      ctx.strokeStyle = '#8D5B28';
      ctx.globalAlpha = 0.04;
      ctx.lineWidth = 1;
      for (let i = 0; i < width; i += 40) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, height);
        ctx.stroke();
      }
      for (let j = 0; j < height; j += 40) {
        ctx.beginPath();
        ctx.moveTo(0, j);
        ctx.lineTo(width, j);
        ctx.stroke();
      }
      ctx.restore();

      // 2. KHUNG VIỀN ĐÔI SANG TRỌNG HOÀNG GIA (GOLD LUXURY BORDER)
      ctx.save();
      ctx.strokeStyle = '#8D5B28';
      ctx.lineWidth = 6;
      drawRoundRect(ctx, 36, 36, width - 72, height - 72, 28);
      ctx.stroke();

      ctx.strokeStyle = '#D4AF37';
      ctx.lineWidth = 2;
      drawRoundRect(ctx, 48, 48, width - 96, height - 96, 20);
      ctx.stroke();

      // Họa tiết 4 góc phong cách kỷ niệm
      const drawCorner = (cx: number, cy: number, rot: number) => {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(rot);
        ctx.strokeStyle = '#D4AF37';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(32, 0);
        ctx.moveTo(0, 0);
        ctx.lineTo(0, 32);
        ctx.stroke();
        ctx.fillStyle = '#8D5B28';
        ctx.beginPath();
        ctx.arc(8, 8, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      };
      drawCorner(60, 60, 0);
      drawCorner(width - 60, 60, Math.PI / 2);
      drawCorner(width - 60, height - 60, Math.PI);
      drawCorner(60, height - 60, -Math.PI / 2);
      ctx.restore();

      // 3. HEADER LOGO TRƯỜNG & DANH XƯNG K8A1
      const headerY = 90;

      // Cố gắng tải logo trường cục bộ (/logo-thpt-thai-nguyen.jpg)
      try {
        const logoImg = new Image();
        logoImg.crossOrigin = 'anonymous';
        logoImg.src = '/logo-thpt-thai-nguyen.jpg';
        await new Promise((resolve) => {
          logoImg.onload = resolve;
          logoImg.onerror = resolve; // nếu lỗi vẫn vẽ fallback
        });

        if (logoImg.complete && logoImg.naturalWidth > 0) {
          ctx.save();
          // Vòng tròn bảo vệ logo
          const logoX = width / 2;
          const logoY = headerY + 45;
          const logoR = 48;

          ctx.beginPath();
          ctx.arc(logoX, logoY, logoR + 4, 0, Math.PI * 2);
          ctx.fillStyle = '#D4AF37';
          ctx.fill();

          ctx.beginPath();
          ctx.arc(logoX, logoY, logoR, 0, Math.PI * 2);
          ctx.clip();
          ctx.drawImage(logoImg, logoX - logoR, logoY - logoR, logoR * 2, logoR * 2);
          ctx.restore();
        }
      } catch (e) {
        console.warn('Canvas logo load skip:', e);
      }

      // DÒNG TIÊU ĐỀ TRƯỜNG & KHÓA HỌC
      ctx.fillStyle = '#784A1E';
      ctx.font = 'bold 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('TRƯỜNG THPT THÁI NGUYÊN (1988 — 2026)', width / 2, headerY + 125);

      ctx.fillStyle = '#8D5B28';
      ctx.font = 'bold 36px Georgia, serif';
      ctx.fillText('HỘI KHÓA 20 NĂM NGÀY TRỞ VỀ', width / 2, headerY + 172);

      ctx.fillStyle = '#1E293B';
      ctx.font = 'bold 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillText('TẬP THỂ LỚP K8A1 • NIÊN KHÓA 2003 — 2006', width / 2, headerY + 208);

      // ĐƯỜNG PHÂN CÁCH VÀNG KIM CÓ NGÔI SAO
      ctx.save();
      ctx.strokeStyle = '#D4AF37';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(width / 2 - 220, headerY + 230);
      ctx.lineTo(width / 2 - 25, headerY + 230);
      ctx.moveTo(width / 2 + 25, headerY + 230);
      ctx.lineTo(width / 2 + 220, headerY + 230);
      ctx.stroke();

      ctx.fillStyle = '#D4AF37';
      ctx.font = '16px sans-serif';
      ctx.fillText('★', width / 2, headerY + 235);
      ctx.restore();

      // ==========================================
      // 4. VẼ NỘI DUNG TỪNG TEMPLATE
      // ==========================================
      const bodyY = headerY + 270;

      if (selectedTemplate === 'milestone') {
        // --- TEMPLATE 1: TIẾN ĐỘ & ĐẾM NGƯỢC ---
        
        // Thẻ Tag chủ đề
        ctx.fillStyle = '#8D5B28';
        drawRoundRect(ctx, width / 2 - 190, bodyY, 380, 42, 21);
        ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 17px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('🔥 TIẾN ĐỘ ĐIỂM DANH HỘI NGỘ 🔥', width / 2, bodyY + 27);

        // Khối Card lớn hiển thị con số % và số bạn
        const card1Y = bodyY + 65;
        ctx.fillStyle = '#FFFFFF';
        ctx.shadowColor = 'rgba(141, 91, 40, 0.15)';
        ctx.shadowBlur = 18;
        ctx.shadowOffsetY = 6;
        drawRoundRect(ctx, 90, card1Y, width - 180, 310, 24);
        ctx.fill();
        ctx.shadowColor = 'transparent';

        ctx.strokeStyle = '#E2D3BE';
        ctx.lineWidth = 2;
        drawRoundRect(ctx, 90, card1Y, width - 180, 310, 24);
        ctx.stroke();

        // Số liệu phần trăm to nổi bật
        const percent = Math.round((confirmedCount / totalRoster) * 100);
        ctx.fillStyle = '#8D5B28';
        ctx.font = '900 86px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.fillText(`${percent}%`, width / 2, card1Y + 105);

        ctx.fillStyle = '#64748B';
        ctx.font = 'bold 18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.fillText('SĨ SỐ LỚP ĐÃ CHÍNH THỨC BÁO DANH', width / 2, card1Y + 140);

        // Thanh tiến độ thanh lịch
        const barX = 140;
        const barY = card1Y + 165;
        const barW = width - 280;
        const barH = 24;

        ctx.fillStyle = '#F1F5F9';
        drawRoundRect(ctx, barX, barY, barW, barH, 12);
        ctx.fill();

        const progressW = Math.max(16, (barW * Math.min(100, percent)) / 100);
        const barGrad = ctx.createLinearGradient(barX, barY, barX + barW, barY);
        barGrad.addColorStop(0, '#D4AF37');
        barGrad.addColorStop(1, '#8D5B28');
        ctx.fillStyle = barGrad;
        drawRoundRect(ctx, barX, barY, progressW, barH, 12);
        ctx.fill();

        // 3 Cột thống kê nhỏ bên dưới thanh tiến độ
        const colY = card1Y + 245;
        const colW = (width - 240) / 3;

        // Cột 1: Đã xác nhận
        ctx.fillStyle = '#15803D';
        ctx.font = '900 36px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.fillText(`${confirmedCount}`, 120 + colW * 0.5, colY);
        ctx.fillStyle = '#475569';
        ctx.font = 'bold 14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.fillText('Đã có mặt', 120 + colW * 0.5, colY + 26);

        // Cột 2: Báo bận
        ctx.fillStyle = '#BE123C';
        ctx.font = '900 36px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.fillText(`${absentCount}`, 120 + colW * 1.5, colY);
        ctx.fillStyle = '#475569';
        ctx.font = 'bold 14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.fillText('Báo bận vắng', 120 + colW * 1.5, colY + 26);

        // Cột 3: Chưa liên lạc
        ctx.fillStyle = '#D97706';
        ctx.font = '900 36px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.fillText(`${pendingMembers.length}`, 120 + colW * 2.5, colY);
        ctx.fillStyle = '#475569';
        ctx.font = 'bold 14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.fillText('Chưa phản hồi', 120 + colW * 2.5, colY + 26);

        // Khối Card 2: ĐỒNG HỒ ĐẾM NGƯỢC
        const countCardY = card1Y + 335;
        ctx.fillStyle = '#FAF5E8';
        drawRoundRect(ctx, 90, countCardY, width - 180, 160, 20);
        ctx.fill();
        ctx.strokeStyle = '#D4AF37';
        ctx.lineWidth = 1.5;
        drawRoundRect(ctx, 90, countCardY, width - 180, 160, 20);
        ctx.stroke();

        ctx.fillStyle = '#8D5B28';
        ctx.font = 'bold 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.fillText('⏰ THỜI GIAN ĐẾM NGƯỢC ĐẾN NGÀY HỘI NGỘ', width / 2, countCardY + 45);

        ctx.fillStyle = '#991B1B';
        ctx.font = '900 52px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.fillText(`CHỈ CÒN ${daysLeft} NGÀY NỮA!`, width / 2, countCardY + 105);

        ctx.fillStyle = '#784A1E';
        ctx.font = 'italic 16px Georgia, serif';
        ctx.fillText('Chủ Nhật, ngày 27 tháng 09 năm 2026 • THPT Thái Nguyên', width / 2, countCardY + 138);

        // LỜI HIỆU TRIỆU THÂN THƯƠNG
        const callY = countCardY + 195;
        ctx.fillStyle = '#334155';
        ctx.font = 'bold 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.fillText('📢 Các bạn K8A1 ơi, hãy vào điểm danh và chọn size áo đồng phục nhé!', width / 2, callY);

        ctx.fillStyle = '#8D5B28';
        ctx.font = 'italic 16px Georgia, serif';
        ctx.fillText('"20 năm gặp lại, đừng để thiếu mất một nụ cười nào của bạn cùng bàn năm xưa!"', width / 2, callY + 34);

      } else if (selectedTemplate === 'attendees') {
        // --- TEMPLATE 2: BẢNG VÀNG ĐIỂM DANH ---
        ctx.fillStyle = '#8D5B28';
        drawRoundRect(ctx, width / 2 - 220, bodyY, 440, 42, 21);
        ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 17px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('⭐ BẢNG VÀNG ĐIỂM DANH HỘI NGỘ ⭐', width / 2, bodyY + 27);

        // Dải tóm tắt sĩ số
        const sumY = bodyY + 55;
        ctx.fillStyle = '#784A1E';
        ctx.font = 'bold 18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.fillText(`ĐÃ CÓ MẶT: ${confirmedCount} BẠN  •  BÁO VẮNG: ${absentCount} BẠN  •  CHƯA ĐIỂM DANH: ${pendingMembers.length} BẠN`, width / 2, sumY + 18);

        // Khung danh sách FULL các bạn đã báo danh (thẻ 2 dòng siêu nét, không bao giờ chồng chéo)
        const gridY = sumY + 38;
        const gridMarginX = 65;
        const gridW = width - gridMarginX * 2; // 950px
        const cols = 3;
        const rows = Math.max(1, Math.ceil(confirmedAttendees.length / cols));
        const rowH = 46;
        const gridH = rows * rowH + 26;

        ctx.fillStyle = '#FFFFFF';
        drawRoundRect(ctx, gridMarginX, gridY, gridW, gridH, 20);
        ctx.fill();
        ctx.strokeStyle = '#E2D3BE';
        ctx.lineWidth = 2;
        drawRoundRect(ctx, gridMarginX, gridY, gridW, gridH, 20);
        ctx.stroke();

        // Vẽ lưới tên 3 cột - HIỂN THỊ TRỌN VẸN 100% DANH SÁCH BẠN HỌC
        const colWidth = (gridW - 24) / cols;
        const cardW = colWidth - 8;
        const cardH = 39;

        confirmedAttendees.forEach((att, idx) => {
          const col = idx % cols;
          const row = Math.floor(idx / cols);
          const cellX = gridMarginX + 12 + col * colWidth;
          const cellY = gridY + 15 + row * rowH;

          // Hộp con cho từng bạn
          ctx.fillStyle = '#FAF7F2';
          drawRoundRect(ctx, cellX, cellY, cardW, cardH, 8);
          ctx.fill();
          ctx.strokeStyle = '#E5D5BC';
          ctx.lineWidth = 1;
          drawRoundRect(ctx, cellX, cellY, cardW, cardH, 8);
          ctx.stroke();

          // Dấu tick xanh lá tròn xinh
          ctx.fillStyle = '#DCFCE7';
          ctx.beginPath();
          ctx.arc(cellX + 16, cellY + 20, 8, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#15803D';
          ctx.font = 'bold 11px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('✓', cellX + 16, cellY + 24);

          // Xử lý tên và biệt danh (THIẾT KẾ 2 DÒNG ĐỘC LẬP — KHÔNG BAO GIỜ CHỒNG CHÉO)
          const cleanName = att.fullName.trim();
          const cleanNick = (att.nickname || '').trim().replace(/^["'(]+|[)"']+$/g, '').trim();
          const isDistinctNick = cleanNick && cleanNick.toLowerCase() !== cleanName.toLowerCase();

          const shirt = getAttendeeShirtSize(att);
          const shirtLabel = shirt ? `Size ${shirt}` : 'Chưa chọn size';

          // DÒNG 1: Họ và tên (In đậm, màu navy sẫm, độ rộng thoải mái)
          ctx.fillStyle = '#0F172A';
          ctx.font = 'bold 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
          ctx.textAlign = 'left';
          const nameDisplay = cleanName.length > 25 ? cleanName.substring(0, 24) + '..' : cleanName;
          ctx.fillText(nameDisplay, cellX + 30, cellY + 16);

          // DÒNG 2: Biệt danh thân thương & Cỡ áo polo (Tách biệt hoàn toàn ở dòng dưới)
          ctx.fillStyle = isDistinctNick ? '#8D5B28' : '#64748B';
          ctx.font = isDistinctNick ? 'italic 11px Georgia, serif' : '500 11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
          
          let line2 = isDistinctNick ? `“${cleanNick}”` : 'Thành viên K8A1';
          if (shirt) {
            line2 += ` • ${shirtLabel}`;
          } else {
            line2 += ` • ⚠️ ${shirtLabel}`;
          }
          if (line2.length > 28) {
            line2 = line2.substring(0, 27) + '..';
          }
          ctx.fillText(line2, cellX + 30, cellY + 31);
        });

        // Khối nhắc nhở tag tên (Vị trí bám sát sau lưới danh sách full)
        const alertY = gridY + gridH + 20;
        ctx.fillStyle = '#FEF2F2';
        drawRoundRect(ctx, gridMarginX, alertY, gridW, 76, 16);
        ctx.fill();
        ctx.strokeStyle = '#FECACA';
        ctx.lineWidth = 1.5;
        drawRoundRect(ctx, gridMarginX, alertY, gridW, 76, 16);
        ctx.stroke();

        ctx.fillStyle = '#991B1B';
        ctx.font = 'bold 17px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('🔍 VẪN CÒN THIẾU TÊN BẠN CÙNG BÀN CỦA BẠN?', width / 2, alertY + 30);
        ctx.fillStyle = '#475569';
        ctx.font = '15px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.fillText('Hãy tag tên bạn bè vào nhóm Zalo để rủ nhau điểm danh ngay hôm nay!', width / 2, alertY + 56);

      } else if (selectedTemplate === 'shirts') {
        // --- TEMPLATE 3: CHỐT SIZE ÁO MAY ĐO ---
        ctx.fillStyle = '#8D5B28';
        drawRoundRect(ctx, width / 2 - 210, bodyY, 420, 42, 21);
        ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 17px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('👕 CHỐT KÈO ĐỒNG PHỤC KỶ NIỆM 👕', width / 2, bodyY + 27);

        // Khung thống kê các cỡ áo
        const boxY = bodyY + 60;
        ctx.fillStyle = '#FFFFFF';
        drawRoundRect(ctx, 80, boxY, width - 160, 240, 20);
        ctx.fill();
        ctx.strokeStyle = '#E2D3BE';
        ctx.lineWidth = 2;
        drawRoundRect(ctx, 80, boxY, width - 160, 240, 20);
        ctx.stroke();

        ctx.fillStyle = '#8D5B28';
        ctx.font = 'bold 20px Georgia, serif';
        ctx.fillText('SỐ LƯỢNG ĐẶT MAY THEO TỪNG SIZE ÁO POLO', width / 2, boxY + 40);

        // 6 cột size áo: S, M, L, XL, XXL, XXXL
        const sizes = ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
        const sizeW = (width - 220) / 6;

        sizes.forEach((sz, i) => {
          const szX = 110 + i * sizeW;
          const szY = boxY + 70;
          const count = shirtDistribution[sz] || 0;

          ctx.fillStyle = '#FAF7F2';
          drawRoundRect(ctx, szX, szY, sizeW - 12, 130, 14);
          ctx.fill();
          ctx.strokeStyle = '#D4AF37';
          ctx.lineWidth = 1.5;
          drawRoundRect(ctx, szX, szY, sizeW - 12, 130, 14);
          ctx.stroke();

          // Tên size
          ctx.fillStyle = '#8D5B28';
          ctx.font = '900 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(sz === 'XXL' ? '2XL' : sz === 'XXXL' ? '3XL' : sz, szX + (sizeW - 12) / 2, szY + 40);

          // Số lượng áo
          ctx.fillStyle = '#0F172A';
          ctx.font = '900 36px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
          ctx.fillText(`${count}`, szX + (sizeW - 12) / 2, szY + 86);

          ctx.fillStyle = '#64748B';
          ctx.font = 'bold 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
          ctx.fillText('áo', szX + (sizeW - 12) / 2, szY + 112);
        });

        // MỤC ĐẶC BIỆT: CẢNH BÁO CÁC BẠN CHƯA CHỌN SIZE ÁO (HIỂN THỊ FULL DANH SÁCH)
        const warnY = boxY + 260;
        const pCols = 3;
        const pRows = Math.max(1, Math.ceil(confirmedPendingShirt.length / pCols));
        const warnH = confirmedPendingShirt.length > 0 ? (65 + pRows * 42 + 20) : 220;

        ctx.fillStyle = '#FFFBEB';
        drawRoundRect(ctx, 80, warnY, width - 160, warnH, 20);
        ctx.fill();
        ctx.strokeStyle = '#F59E0B';
        ctx.lineWidth = 2;
        drawRoundRect(ctx, 80, warnY, width - 160, warnH, 20);
        ctx.stroke();

        ctx.fillStyle = '#B45309';
        ctx.font = '900 21px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`⚠️ CÒN ${confirmedPendingShirt.length} BẠN ĐÃ ĐIỂM DANH NHƯNG CHƯA CHỌN SIZE ÁO:`, width / 2, warnY + 42);

        // Liệt kê FULL danh sách các bạn chưa chọn size áo
        if (confirmedPendingShirt.length > 0) {
          const pColW = (width - 220) / pCols;

          confirmedPendingShirt.forEach((att, idx) => {
            const c = idx % pCols;
            const r = Math.floor(idx / pCols);
            const pX = 110 + c * pColW;
            const pY = warnY + 76 + r * 42;

            ctx.fillStyle = '#FEF3C7';
            drawRoundRect(ctx, pX, pY - 16, pColW - 14, 34, 8);
            ctx.fill();

            ctx.fillStyle = '#92400E';
            ctx.font = 'bold 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
            ctx.textAlign = 'left';
            const cleanName = att.fullName.trim();
            const cleanNick = (att.nickname || '').trim().replace(/^["'(]+|[)"']+$/g, '').trim();
            const isDistinct = cleanNick && cleanNick.toLowerCase() !== cleanName.toLowerCase();
            const displayName = isDistinct ? `${cleanName} (${cleanNick})` : cleanName;
            const shortName = displayName.length > 19 ? displayName.substring(0, 18) + '..' : displayName;
            ctx.fillText(`• ${shortName}`, pX + 8, pY + 6);
          });
        } else {
          ctx.fillStyle = '#15803D';
          ctx.font = 'bold 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('🎉 Tuyệt vời! 100% các bạn đã điểm danh đều đã chọn xong size áo!', width / 2, warnY + 130);
        }

        // Lời nhắn nhắc gấp
        const noteY = warnY + warnH + 25;
        ctx.fillStyle = '#991B1B';
        ctx.font = 'bold 18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('📢 XƯỞNG MAY SẮP CẮT VẢI! BẠN NÀO CHƯA CHỌN THÌ VÀO WEB CHỌN GẤP NHÉ!', width / 2, noteY);

      } else if (selectedTemplate === 'finances') {
        // --- TEMPLATE 4: MINH BẠCH QUỸ LỚP ---
        ctx.fillStyle = '#8D5B28';
        drawRoundRect(ctx, width / 2 - 210, bodyY, 420, 42, 21);
        ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 17px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('💰 BÁO CÁO MINH BẠCH QUỸ LỚP 💰', width / 2, bodyY + 27);

        // Khối Card lớn Tổng tiền thu được
        const fCardY = bodyY + 65;
        ctx.fillStyle = '#FFFFFF';
        drawRoundRect(ctx, 90, fCardY, width - 180, 260, 24);
        ctx.fill();
        ctx.strokeStyle = '#E2D3BE';
        ctx.lineWidth = 2;
        drawRoundRect(ctx, 90, fCardY, width - 180, 260, 24);
        ctx.stroke();

        ctx.fillStyle = '#64748B';
        ctx.font = 'bold 18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.fillText('TỔNG KINH PHÍ ĐÃ ĐÓNG GÓP & ỦNG HỘ', width / 2, fCardY + 45);

        ctx.fillStyle = '#15803D';
        ctx.font = '900 68px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.fillText(`${totalFundCollected.toLocaleString('vi-VN')} đ`, width / 2, fCardY + 125);

        // 2 Cột thống kê nhỏ
        const c1X = 260;
        const c2X = width - 260;
        const cY = fCardY + 195;

        ctx.fillStyle = '#8D5B28';
        ctx.font = '900 34px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.fillText(`${paidAttendees.length} bạn`, c1X, cY);
        ctx.fillStyle = '#475569';
        ctx.font = 'bold 15px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.fillText('Đã đóng góp', c1X, cY + 28);

        ctx.fillStyle = '#8D5B28';
        ctx.font = '900 34px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.fillText(`${standardFund.toLocaleString('vi-VN')} đ`, c2X, cY);
        ctx.fillStyle = '#475569';
        ctx.font = 'bold 15px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.fillText('Mức chuẩn / người', c2X, cY + 28);

        // Khối Tri ân & Sao kê minh bạch
        const tCardY = fCardY + 280;
        ctx.fillStyle = '#FAF5E8';
        drawRoundRect(ctx, 90, tCardY, width - 180, 190, 20);
        ctx.fill();
        ctx.strokeStyle = '#D4AF37';
        ctx.lineWidth = 1.5;
        drawRoundRect(ctx, 90, tCardY, width - 180, 190, 20);
        ctx.stroke();

        ctx.fillStyle = '#784A1E';
        ctx.font = 'bold 22px Georgia, serif';
        ctx.fillText('TRÂN TRỌNG CẢM ƠN TẤM LÒNG CỦA CẢ LỚP K8A1!', width / 2, tCardY + 45);

        ctx.fillStyle = '#334155';
        ctx.font = '16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        wrapAndCenterText(
          ctx,
          'Mọi khoản đóng góp đều được Thủ Quỹ và Ban Liên Lạc đối soát tự động, công khai minh bạch 100% trên WebApp và cập nhật liên tục vào Google Sheet.',
          width / 2,
          tCardY + 85,
          width - 260,
          26
        );

        ctx.fillStyle = '#15803D';
        ctx.font = 'bold 16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.fillText('✓ Toàn bộ hóa đơn & sao kê đều lưu trữ công khai', width / 2, tCardY + 155);
      }

      // ==========================================
      // 5. FOOTER THÔNG TIN SỰ KIỆN & WEBSITE
      // ==========================================
      const footerY = height - 165;

      ctx.strokeStyle = '#D4AF37';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(90, footerY);
      ctx.lineTo(width - 90, footerY);
      ctx.stroke();

      ctx.fillStyle = '#0F172A';
      ctx.font = 'bold 18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('HẸN GẶP LẠI VÀO 08:30 • CHỦ NHẬT, 27/09/2026', width / 2, footerY + 34);

      ctx.fillStyle = '#64748B';
      ctx.font = '15px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillText('Địa điểm: Trường THPT Thái Nguyên  •  K8A1 (2003 — 2006) Mãi Là Anh Em!', width / 2, footerY + 62);

      // Thẻ link WebApp
      ctx.fillStyle = '#8D5B28';
      drawRoundRect(ctx, width / 2 - 170, footerY + 80, 340, 34, 17);
      ctx.fill();
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 14px font-mono, monospace';
      ctx.fillText('🌐 Bấm vào link web lớp để điểm danh', width / 2, footerY + 102);

      // Cập nhật ảnh xem trước
      try {
        const url = canvas.toDataURL('image/png');
        setPreviewDataUrl(url);
      } catch (err) {
        console.warn('Canvas toDataURL warning:', err);
      }

      setIsGenerating(false);
    };

    const t = setTimeout(renderCard, 80);
    return () => clearTimeout(t);
  }, [isOpen, selectedTemplate, effectiveRsvp, rosterList, eventConfig, daysLeft]);

  // Bộ lời bình Zalo dí dỏm, kích thích tương tác cho từng template
  const getZaloShareText = () => {
    const webUrl = window.location.origin + window.location.pathname;
    if (selectedTemplate === 'milestone') {
      const percent = Math.round((confirmedCount / totalRoster) * 100);
      return `📢 THÔNG BÁO TIẾN ĐỘ HỘI NGỘ 20 NĂM K8A1 (2003 - 2006) 📢\n🔥 Cả lớp ơi, hiện tại đã có ${confirmedCount}/${totalRoster} bạn (${percent}%) chính thức báo danh có mặt rồi nhé!\n⏰ Chỉ còn đúng ${daysLeft} ngày nữa là đến ngày trở về trường xưa (27/09/2026).\n👉 Bạn nào chưa điểm danh hoặc chưa chọn size áo đồng phục thì vào nhận thẻ thanh xuân ngay nhé:\n🔗 ${webUrl}#diem-danh`;
    }
    if (selectedTemplate === 'attendees') {
      const sampleNames = confirmedAttendees.slice(0, 8).map(a => a.nickname ? `${a.fullName} (${a.nickname})` : a.fullName).join(', ');
      return `⭐ BẢNG VÀNG ĐIỂM DANH HỘI NGỘ 20 NĂM K8A1 ⭐\n✨ Đã có ${confirmedCount} bạn xác nhận có mặt: ${sampleNames}...\n❓ Vẫn còn ${pendingMembers.length} bạn chưa thấy tên trên bảng vàng! Anh em cùng bàn vào ngó xem thiếu ai thì tag ới nhau vào báo danh ngay nhé:\n🔗 ${webUrl}#diem-danh`;
    }
    if (selectedTemplate === 'shirts') {
      const pendingNames = confirmedPendingShirt.slice(0, 10).map(a => a.nickname ? `${a.fullName} (${a.nickname})` : a.fullName).join(', ');
      return `👕 THÔNG BÁO GẤP VỀ SIZE ÁO POLO ĐỒNG PHỤC K8A1 👕\n✂️ Ban Liên Lạc chuẩn bị chốt số lượng gửi sang xưởng may áo.\n⚠️ Hiện tại vẫn còn ${confirmedPendingShirt.length} bạn đã đăng ký nhưng CHƯA CHỌN SIZE ÁO: ${pendingNames}...\n👉 Các bạn có tên tranh thủ bấm vào link chọn cỡ áo (S, M, L, XL, 2XL, 3XL) gấp hôm nay nhé:\n🔗 ${webUrl}#diem-danh`;
    }
    return `💰 BÁO CÁO MINH BẠCH TÀI CHÍNH HỘI NGỘ 20 NĂM K8A1 💰\n✅ Tổng quỹ đóng góp đã thu: ${totalFundCollected.toLocaleString('vi-VN')} đ (${paidAttendees.length} bạn đã hoàn thành).\n🙏 Ban Liên Lạc xin trân trọng cảm ơn sự chung tay và ủng hộ nhiệt tình của cả lớp!\n🔍 Toàn bộ sao kê và danh sách đóng quỹ được công khai minh bạch tại:\n🔗 ${webUrl}#tai-chinh`;
  };

  // Tải ảnh PNG về máy
  const handleDownloadPng = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      const link = document.createElement('a');
      link.download = `K8A1-ThongKeZalo-${selectedTemplate}-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      setDownloadSuccess(true);
      setFeedbackMsg('✓ Đã tải ảnh PNG độ nét cao về máy thành công!');
      setTimeout(() => setDownloadSuccess(false), 3000);
      try {
        confetti({ particleCount: 40, spread: 60, origin: { y: 0.7 } });
      } catch {}
    } catch (err) {
      console.error('Lỗi tải ảnh:', err);
      setFeedbackMsg('Không thể tải ảnh trực tiếp. Vui lòng thử nút Sao Chép Ảnh.');
    }
  };

  // Sao chép ảnh vào Clipboard để dán thẳng (Ctrl+V) vào Zalo
  const handleCopyImageToClipboard = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        try {
          // Trình duyệt hỗ trợ ClipboardItem
          const item = new ClipboardItem({ 'image/png': blob });
          await navigator.clipboard.write([item]);
          setCopiedImage(true);
          setFeedbackMsg('✓ Đã sao chép ảnh! Bạn hãy mở Zalo và nhấn Ctrl + V để gửi nhé!');
          setTimeout(() => setCopiedImage(false), 3500);
          try {
            confetti({ particleCount: 30, spread: 50, origin: { y: 0.7 } });
          } catch {}
        } catch (clipErr) {
          console.warn('ClipboardItem error, fallback to download:', clipErr);
          // Fallback tải ảnh và sao chép text
          handleDownloadPng();
          handleCopyText();
          setFeedbackMsg('Đã tải ảnh về máy và sao chép lời nhắn. Bạn chỉ cần gửi ảnh vào Zalo!');
        }
      }, 'image/png');
    } catch (e) {
      console.error('Copy image failed:', e);
      handleDownloadPng();
    }
  };

  // Sao chép lời bình Zalo
  const handleCopyText = () => {
    const text = getZaloShareText();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedText(true);
      setFeedbackMsg('✓ Đã sao chép nội dung lời nhắn Zalo vào bộ nhớ tạm!');
      setTimeout(() => setCopiedText(false), 3000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      {/* KHỐI MODAL CHÍNH */}
      <div className="relative w-full max-w-4xl max-h-[96vh] bg-[#FAF8F5] rounded-2xl shadow-2xl border border-amber-200/80 flex flex-col overflow-hidden text-slate-800">
        
        {/* HEADER MODAL */}
        <div className="flex items-center justify-between px-4 py-3 sm:px-6 sm:py-3.5 bg-gradient-to-r from-[#8D5B28] via-[#784A1E] to-[#5C3714] text-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-white/15 border border-white/30 flex items-center justify-center text-amber-200">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base font-serif flex items-center gap-1.5 text-amber-100">
                <span>🎨 Tạo Poster & Bản Tin Hội Ngộ K8A1</span>
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              </h3>
              <p className="text-[11px] text-amber-200/80 font-sans hidden sm:block">
                Xuất hình ảnh infographic sắc nét, chuẩn nhận diện 20 năm để chia sẻ lên nhóm lớp Zalo / Facebook
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={fetchFreshDataFromSheet}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 active:bg-white/30 text-amber-100 hover:text-white text-xs font-sans font-medium transition cursor-pointer border border-white/20 disabled:opacity-60"
              title="Tải lại số liệu gốc mới nhất trực tiếp từ Google Sheets"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-amber-300' : ''}`} />
              <span className="hidden sm:inline">
                {isRefreshing ? 'Đang nạp...' : 'Làm mới số liệu'}
              </span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
              title="Đóng (ESC)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* FEEDBACK BANNER (NẾU VỪA THAO TÁC HOẶC ĐANG TẢI) */}
        {feedbackMsg && (
          <div className={`px-4 py-2 text-white text-xs font-sans font-bold flex items-center justify-between animate-fadeIn ${
            feedbackMsg.startsWith('⏳') ? 'bg-amber-600' : feedbackMsg.startsWith('⚠️') ? 'bg-rose-600' : 'bg-emerald-600'
          }`}>
            <span className="flex items-center gap-2">
              {isRefreshing && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
              <span>{feedbackMsg}</span>
            </span>
            <button 
              onClick={() => setFeedbackMsg('')} 
              className="text-white/80 hover:text-white cursor-pointer ml-2 text-sm"
            >
              ✕
            </button>
          </div>
        )}

        {/* NỘI DUNG CUỘN ĐƯỢC */}
        <div className="p-3 sm:p-5 overflow-y-auto space-y-4">
          
          {/* THANH CHỌN 4 MẪU THẺ INFOGRAPHIC */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              type="button"
              onClick={() => setSelectedTemplate('milestone')}
              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                selectedTemplate === 'milestone'
                  ? 'bg-gradient-to-br from-amber-500 to-amber-700 text-white border-amber-600 shadow-md scale-[1.01]'
                  : 'bg-white hover:bg-amber-50/50 text-slate-700 border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-base">🏆</span>
                {selectedTemplate === 'milestone' && <Check className="w-3.5 h-3.5 text-amber-200" />}
              </div>
              <div className="mt-1">
                <span className="text-xs font-bold font-sans block leading-tight">1. Cột Mốc Tiến Độ</span>
                <span className={`text-[10px] block mt-0.5 ${selectedTemplate === 'milestone' ? 'text-amber-100' : 'text-slate-500'}`}>
                  {confirmedCount}/{totalRoster} bạn • Đếm ngược
                </span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setSelectedTemplate('attendees')}
              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                selectedTemplate === 'attendees'
                  ? 'bg-gradient-to-br from-amber-500 to-amber-700 text-white border-amber-600 shadow-md scale-[1.01]'
                  : 'bg-white hover:bg-amber-50/50 text-slate-700 border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-base">⭐</span>
                {selectedTemplate === 'attendees' && <Check className="w-3.5 h-3.5 text-amber-200" />}
              </div>
              <div className="mt-1">
                <span className="text-xs font-bold font-sans block leading-tight">2. Bảng Vàng Điểm Danh</span>
                <span className={`text-[10px] block mt-0.5 ${selectedTemplate === 'attendees' ? 'text-amber-100' : 'text-slate-500'}`}>
                  Biệt danh thời đi học
                </span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setSelectedTemplate('shirts')}
              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                selectedTemplate === 'shirts'
                  ? 'bg-gradient-to-br from-amber-500 to-amber-700 text-white border-amber-600 shadow-md scale-[1.01]'
                  : 'bg-white hover:bg-amber-50/50 text-slate-700 border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-base">👕</span>
                {selectedTemplate === 'shirts' && <Check className="w-3.5 h-3.5 text-amber-200" />}
              </div>
              <div className="mt-1">
                <span className="text-xs font-bold font-sans block leading-tight">3. Chốt Size May Áo</span>
                <span className={`text-[10px] block mt-0.5 ${selectedTemplate === 'shirts' ? 'text-amber-100' : 'text-slate-500'}`}>
                  Nhắc bạn chưa chọn size
                </span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setSelectedTemplate('finances')}
              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                selectedTemplate === 'finances'
                  ? 'bg-gradient-to-br from-amber-500 to-amber-700 text-white border-amber-600 shadow-md scale-[1.01]'
                  : 'bg-white hover:bg-amber-50/50 text-slate-700 border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-base">💰</span>
                {selectedTemplate === 'finances' && <Check className="w-3.5 h-3.5 text-amber-200" />}
              </div>
              <div className="mt-1">
                <span className="text-xs font-bold font-sans block leading-tight">4. Minh Bạch Quỹ Lớp</span>
                <span className={`text-[10px] block mt-0.5 ${selectedTemplate === 'finances' ? 'text-amber-100' : 'text-slate-500'}`}>
                  {totalFundCollected.toLocaleString('vi-VN')} đ đã thu
                </span>
              </div>
            </button>
          </div>

          {/* KHUNG HIỂN THỊ PREVIEW VÀ CÔNG CỤ */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
            
            {/* CỘT TRÁI: PREVIEW THẺ ẢNH */}
            <div className="md:col-span-6 flex flex-col items-center">
              <div className="relative w-full max-w-[340px] aspect-[4/5] rounded-xl overflow-hidden shadow-xl border-2 border-amber-300/80 bg-[#FFFDF9] flex items-center justify-center">
                {previewDataUrl ? (
                  <img
                    ref={previewImgRef}
                    src={previewDataUrl}
                    alt="Infographic Preview"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center gap-2 text-amber-800">
                    <RefreshCw className="w-6 h-6 animate-spin" />
                    <span className="text-xs font-sans">Đang kết xuất ảnh nét cao...</span>
                  </div>
                )}

                {/* Watermark preview */}
                <div className="absolute top-2 right-2 px-2 py-0.5 bg-black/60 text-white text-[9.5px] rounded font-mono pointer-events-none">
                  1080 x 1350 HD
                </div>
              </div>

              {/* Canvas ẩn phục vụ xuất ảnh nét cao */}
              <canvas ref={canvasRef} className="hidden" />
              
              <span className="text-[10.5px] text-slate-500 italic mt-2 text-center">
                * Ảnh xuất ra đạt chuẩn tỉ lệ 4:5, sắc nét tuyệt đối trên cả điện thoại và máy tính.
              </span>
            </div>

            {/* CỘT PHẢI: BỘ NÚT HÀNH ĐỘNG & NỘI DUNG ZALO */}
            <div className="md:col-span-6 space-y-3">
              
              {/* KHỐI NÚT CHIA SẺ 1-CHẠM */}
              <div className="p-3.5 bg-white rounded-xl border border-amber-200/80 shadow-xs space-y-2.5">
                <span className="text-xs font-bold text-amber-950 font-serif flex items-center gap-1.5">
                  <Share2 className="w-3.5 h-3.5 text-amber-700" />
                  <span>Hành động 1-chạm gửi vào Zalo:</span>
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {/* NÚT 1: SAO CHÉP ẢNH (DÁN THẲNG VÀO ZALO) */}
                  <button
                    type="button"
                    onClick={handleCopyImageToClipboard}
                    className="w-full py-2.5 px-3 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white text-xs font-sans font-bold rounded-xl shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Copy className="w-4 h-4" />
                    <span>{copiedImage ? '✓ Đã sao chép ảnh' : 'Sao chép ảnh (Ctrl+V)'}</span>
                  </button>

                  {/* NÚT 2: TẢI ẢNH PNG */}
                  <button
                    type="button"
                    onClick={handleDownloadPng}
                    className="w-full py-2.5 px-3 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white text-xs font-sans font-bold rounded-xl shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>{downloadSuccess ? '✓ Đã tải xong' : 'Tải ảnh về máy (PNG)'}</span>
                  </button>
                </div>

                <div className="p-2 bg-blue-50/70 border border-blue-200/80 rounded-lg text-[11px] text-blue-900 flex items-start gap-1.5">
                  <span className="text-sm shrink-0">💡</span>
                  <span>
                    <strong>Mẹo gửi nhanh:</strong> Bấm <em>"Sao chép ảnh"</em>, sau đó mở khung chat nhóm Zalo lớp K8A1 và bấm <strong>Ctrl + V</strong> (hoặc Dán) để gửi ảnh ngay mà không cần lưu vào máy!
                  </span>
                </div>
              </div>

              {/* KHỐI LỜI NHẮN ĐI KÈM ZALO CÓ SẴN */}
              <div className="p-3.5 bg-white rounded-xl border border-amber-200/80 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-950 font-serif flex items-center gap-1.5">
                    <MessageCircle className="w-3.5 h-3.5 text-amber-700" />
                    <span>Lời nhắn Zalo đi kèm (Copy & Paste):</span>
                  </span>

                  <button
                    type="button"
                    onClick={handleCopyText}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-100/90 hover:bg-amber-200 text-amber-900 text-[11px] font-sans font-bold rounded-lg transition cursor-pointer border border-amber-300/80"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copiedText ? '✓ Đã chép' : 'Sao chép lời nhắn'}</span>
                  </button>
                </div>

                <div className="p-2.5 bg-[#FAF8F5] border border-slate-200 rounded-lg font-sans text-xs text-slate-700 whitespace-pre-line max-h-36 overflow-y-auto leading-relaxed select-all">
                  {getZaloShareText()}
                </div>
              </div>

              {/* HƯỚNG DẪN DÀNH CHO ADMIN / THÀNH VIÊN */}
              <div className="p-3 bg-amber-50/60 border border-amber-200/70 rounded-xl text-xs text-amber-950 space-y-1">
                <span className="font-bold font-serif flex items-center gap-1 text-[11.5px]">
                  <span>📌 Lợi ích khi gửi ảnh thống kê vào Zalo:</span>
                </span>
                <ul className="list-disc list-inside text-[11px] text-slate-600 space-y-0.5">
                  <li>Tránh trôi tin nhắn văn bản thông thường.</li>
                  <li>Tạo sự tò mò và cảm giác hào hứng ("sợ bị bỏ lỡ") cho các bạn chưa báo danh.</li>
                  <li>Nhắc nhở nhẹ nhàng nhưng dứt khoát việc <strong>chọn size áo may đo</strong> trước hạn chốt của xưởng may.</li>
                </ul>
              </div>

            </div>

          </div>

        </div>

        {/* FOOTER MODAL */}
        <div className="px-4 py-3 bg-[#F4EFE6] border-t border-amber-200 flex items-center justify-between shrink-0">
          <div className="text-[11px] text-slate-500 font-sans hidden sm:block">
            Tập thể K8A1 (2003 — 2006) • Trường THPT Thái Nguyên
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-sans font-bold rounded-lg transition cursor-pointer"
            >
              Đóng
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
