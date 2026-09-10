import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Heart, 
  Calendar, 
  MapPin, 
  Sparkles, 
  Camera,
  PenTool,
  Clock,
  Compass,
  CheckCircle,
  MailOpen,
  Quote,
  Users,
  Award,
  Lock,
  Crown,
  Shield,
  Coins,
  Music,
  Edit3,
  ScrollText,
  BookOpen,
  GraduationCap,
  RefreshCw,
  X
} from 'lucide-react';

import { UserRole, RsvpData, MemoryImage, MemoryVideo, WishData, ActivityToast, VenueMediaItem, EventConfig, ClassMember, ExpenseItem, ExpenseCategory, IncomeItem, IncomeCategory, TeacherData, TeacherInvitationStatus } from './types';
import { INITIAL_RSVP_LIST, INITIAL_WISHES_LIST, DEFAULT_MEMORIES, DEFAULT_VIDEOS, DEFAULT_EVENT_CONFIG, DEFAULT_APPS_SCRIPT_URL, CLASS_ROSTER_K8A1, normalizeImageUrl, formatDateTimeVi, formatDateOnlyVi, isOfficialBLLMember, isPhoneMatch, isVietnameseNameMatch, TEACHERS_LIST, normalizeShirtSize, purgeOldCacheIfOutdated } from './data';
import { DEFAULT_VENUE_MEDIA } from './components/AlumniConvergenceMap';

import AudioPlayer from './components/AudioPlayer';
import CountdownTimer from './components/CountdownTimer';
import ClassGatheringCounter from './components/ClassGatheringCounter';
import RsvpForm from './components/RsvpForm';
import ConfirmedAttendees from './components/ConfirmedAttendees';
import BankTransfer from './components/BankTransfer';
import MemoryCorner from './components/MemoryCorner';
import AlumniConvergenceMap from './components/AlumniConvergenceMap';
import ViewCounter from './components/ViewCounter';
import ActivityToastManager from './components/ActivityToastManager';
import QuickShare from './components/QuickShare';
import DeveloperGuide from './components/DeveloperGuide';
import StudentPassModal from './components/StudentPassModal';
import AdminManagementHub from './components/AdminManagementHub';
import PinAuthModal from './components/PinAuthModal';
import ReceiptUploadModal from './components/ReceiptUploadModal';
import ClassCharterModal from './components/ClassCharterModal';
import RoleGuideModal from './components/RoleGuideModal';
import QuickNavigation from './components/QuickNavigation';
import TeachersHonorRoll from './components/TeachersHonorRoll';
import { IdentitySelectorModal, NavbarIdentityBadge } from './components/VisitorIdentityWidget';
import ZaloShareInfographicsModal from './components/ZaloShareInfographicsModal';

// ⚡ PHIÊN BẢN CODE WEBAPP - Tự động xóa sạch cache rác trên Zalo Webview của người dùng
export const APP_BUILD_VERSION = '2026.09.10.v4_realtime_sync';
const isZaloBrowser = typeof navigator !== 'undefined' && /zalo/i.test(navigator.userAgent);

// THỰC THI ĐỒNG BỘ TRƯỚC KHI REACT STATE KHỞI TẠO:
// Đảm bảo toàn bộ cache cũ/rác từ các bản trước bị xóa sạch ngay lập tức
purgeOldCacheIfOutdated();
try {
  const storedBuildVer = localStorage.getItem('k8a1_app_build_version');
  if (storedBuildVer !== APP_BUILD_VERSION) {
    [
      'rsvp_list',
      'k8a1_class_roster',
      'wishes_list',
      'k8a1_event_config',
      'k8a1_expenses_list',
      'k8a1_incomes_list',
      'k8a1_teachers_list'
    ].forEach(k => {
      try { localStorage.removeItem(k); } catch (e) {}
    });
    localStorage.setItem('k8a1_app_build_version', APP_BUILD_VERSION);
  }
} catch (e) {}

export default function App() {
  const [isZaloTipDismissed, setIsZaloTipDismissed] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('k8a1_zalo_tip_dismissed') === '1';
    } catch {
      return false;
    }
  });

  // Trạng thái đồng bộ thời gian thực từ Google Sheet
  const [syncStatus, setSyncStatus] = useState<'syncing' | 'live' | 'error'>('syncing');
  const [lastSyncedTime, setLastSyncedTime] = useState<string>('');

  // Config state (Google Apps Script WebApp URL)
  const [appsScriptUrl, setAppsScriptUrl] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('apps_script_url');
      if (saved && saved.startsWith('https://script.google.com/macros/s/')) {
        return saved;
      }
      return DEFAULT_APPS_SCRIPT_URL;
    } catch {
      return DEFAULT_APPS_SCRIPT_URL;
    }
  });

  // URL kết nối thực tế: ưu tiên cấu hình máy này, nếu trống thì dùng URL mặc định của hệ thống
  const activeAppsScriptUrl = (appsScriptUrl && appsScriptUrl.trim()) || DEFAULT_APPS_SCRIPT_URL || '';

  // Helper chuẩn hóa cấu hình sự kiện, chống crash do dữ liệu số từ Google Sheets hoặc localStorage
  const sanitizeEventConfig = (cfg: any): EventConfig => ({
    ...DEFAULT_EVENT_CONFIG,
    ...cfg,
    bankAccount: String(cfg?.bankAccount || DEFAULT_EVENT_CONFIG.bankAccount),
    bankName: String(cfg?.bankName || DEFAULT_EVENT_CONFIG.bankName),
    bankHolder: String(cfg?.bankHolder || DEFAULT_EVENT_CONFIG.bankHolder),
    transferSyntax: String(cfg?.transferSyntax || DEFAULT_EVENT_CONFIG.transferSyntax),
    venueName: String(cfg?.venueName || DEFAULT_EVENT_CONFIG.venueName),
    venueSubtitle: cfg?.venueSubtitle !== undefined ? String(cfg.venueSubtitle) : DEFAULT_EVENT_CONFIG.venueSubtitle,
    venueAddress: String(cfg?.venueAddress || DEFAULT_EVENT_CONFIG.venueAddress),
    shortAddress: String(cfg?.shortAddress || DEFAULT_EVENT_CONFIG.shortAddress),
    venueTime: cfg?.venueTime !== undefined ? String(cfg.venueTime) : DEFAULT_EVENT_CONFIG.venueTime,
    venueActivity: cfg?.venueActivity !== undefined ? String(cfg.venueActivity) : DEFAULT_EVENT_CONFIG.venueActivity,
    mapEmbedUrl: String(cfg?.mapEmbedUrl || DEFAULT_EVENT_CONFIG.mapEmbedUrl),
    mapDirectUrl: String(cfg?.mapDirectUrl || DEFAULT_EVENT_CONFIG.mapDirectUrl),
    enableTwoVenues: cfg?.enableTwoVenues !== undefined ? Boolean(cfg.enableTwoVenues) : DEFAULT_EVENT_CONFIG.enableTwoVenues,
    venue2Name: cfg?.venue2Name !== undefined ? String(cfg.venue2Name) : DEFAULT_EVENT_CONFIG.venue2Name,
    venue2Subtitle: cfg?.venue2Subtitle !== undefined ? String(cfg.venue2Subtitle) : DEFAULT_EVENT_CONFIG.venue2Subtitle,
    venue2Address: cfg?.venue2Address !== undefined ? String(cfg.venue2Address) : DEFAULT_EVENT_CONFIG.venue2Address,
    venue2ShortAddress: cfg?.venue2ShortAddress !== undefined ? String(cfg.venue2ShortAddress) : DEFAULT_EVENT_CONFIG.venue2ShortAddress,
    venue2Time: cfg?.venue2Time !== undefined ? String(cfg.venue2Time) : DEFAULT_EVENT_CONFIG.venue2Time,
    venue2Activity: cfg?.venue2Activity !== undefined ? String(cfg.venue2Activity) : DEFAULT_EVENT_CONFIG.venue2Activity,
    venue2MapEmbedUrl: cfg?.venue2MapEmbedUrl !== undefined ? String(cfg.venue2MapEmbedUrl) : DEFAULT_EVENT_CONFIG.venue2MapEmbedUrl,
    venue2MapDirectUrl: cfg?.venue2MapDirectUrl !== undefined ? String(cfg.venue2MapDirectUrl) : DEFAULT_EVENT_CONFIG.venue2MapDirectUrl,
    routeDistanceText: cfg?.routeDistanceText !== undefined ? String(cfg.routeDistanceText) : DEFAULT_EVENT_CONFIG.routeDistanceText,
    routeDirectUrl: cfg?.routeDirectUrl !== undefined ? String(cfg.routeDirectUrl) : DEFAULT_EVENT_CONFIG.routeDirectUrl,
    eventDateText: String(cfg?.eventDateText || DEFAULT_EVENT_CONFIG.eventDateText),
    eventTimeText: String(cfg?.eventTimeText || DEFAULT_EVENT_CONFIG.eventTimeText),
    letterTitle: String(cfg?.letterTitle || DEFAULT_EVENT_CONFIG.letterTitle),
    letterSubtitle: String(cfg?.letterSubtitle || DEFAULT_EVENT_CONFIG.letterSubtitle),
    letterParagraph1: String(cfg?.letterParagraph1 || DEFAULT_EVENT_CONFIG.letterParagraph1),
    letterParagraph2: String(cfg?.letterParagraph2 || DEFAULT_EVENT_CONFIG.letterParagraph2),
    letterSignatureTitle: String(cfg?.letterSignatureTitle || DEFAULT_EVENT_CONFIG.letterSignatureTitle),
    fundAmountPerPerson: Number(cfg?.fundAmountPerPerson) || DEFAULT_EVENT_CONFIG.fundAmountPerPerson,
    customQrUrl: cfg?.customQrUrl ? String(cfg.customQrUrl) : '',
    bankCode: cfg?.bankCode ? String(cfg.bankCode) : DEFAULT_EVENT_CONFIG.bankCode,
    qrTemplate: cfg?.qrTemplate || DEFAULT_EVENT_CONFIG.qrTemplate,
    heroBannerUrl: cfg?.heroBannerUrl ? normalizeImageUrl(String(cfg.heroBannerUrl)) : DEFAULT_EVENT_CONFIG.heroBannerUrl,
    heroBannerPosition: cfg?.heroBannerPosition !== undefined ? (Number(cfg.heroBannerPosition) || 50) : 50,
    schoolLogoUrl: cfg?.schoolLogoUrl ? String(cfg.schoolLogoUrl) : DEFAULT_EVENT_CONFIG.schoolLogoUrl
  });

  // Dynamic Event Configuration State (Venue, Date, Letter, Bank Account)
  const [eventConfig, setEventConfig] = useState<EventConfig>(() => {
    try {
      const saved = localStorage.getItem('k8a1_event_config');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Tự động làm mới nếu thiết bị còn lưu địa điểm cũ (Crown Palace)
        if (parsed.venueName && parsed.venueName.includes('Crown Palace')) {
          localStorage.removeItem('k8a1_event_config');
          return DEFAULT_EVENT_CONFIG;
        }
        // Tự động làm mới nếu thiết bị trước đó lưu Prime đơn lẻ ở venueName mà chưa có 2 chặng
        if (parsed.venueName && parsed.venueName.includes('Prime') && !parsed.venue2Name) {
          localStorage.removeItem('k8a1_event_config');
          return DEFAULT_EVENT_CONFIG;
        }
        return sanitizeEventConfig(parsed);
      }
    } catch {}
    return DEFAULT_EVENT_CONFIG;
  });

  // Hàm đồng bộ dữ liệu trực tiếp lên Google Sheet Backend
  const syncToBackend = async (action: string, payload: any) => {
    if (!activeAppsScriptUrl || !activeAppsScriptUrl.startsWith('http')) return;
    try {
      const pin = sessionStorage.getItem('admin_pin_token') || undefined;
      await fetch(activeAppsScriptUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action,
          pin,
          ...payload
        })
      });
    } catch (err) {
      console.warn(`Lỗi đồng bộ ${action} lên Google Sheet:`, err);
    }
  };

  const handleUpdateEventConfig = (newConfig: EventConfig) => {
    const cleanConfig = sanitizeEventConfig(newConfig);
    setEventConfig(cleanConfig);
    if (cleanConfig.heroBannerUrl) {
      setHeroBannerUrl(cleanConfig.heroBannerUrl);
      try {
        localStorage.setItem('k8a1_hero_banner_url', cleanConfig.heroBannerUrl);
      } catch (e) {}
    }
    if (cleanConfig.heroBannerPosition !== undefined) {
      setHeroBannerPosition(cleanConfig.heroBannerPosition);
      try {
        localStorage.setItem('k8a1_hero_banner_position', cleanConfig.heroBannerPosition.toString());
      } catch (e) {}
    }
    try {
      localStorage.setItem('k8a1_event_config', JSON.stringify(cleanConfig));
    } catch (err) {
      console.error('Lỗi lưu event config vào localStorage:', err);
    }
    // Ghi trực tiếp và vĩnh viễn vào Google Sheet tab "Cau_Hinh"
    syncToBackend('save_config', { config: cleanConfig });
  };

  // User Role (RBAC): 'guest' | 'bll' | 'treasurer' | 'admin'
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>(() => {
    try {
      const saved = sessionStorage.getItem('user_role');
      if (saved === 'admin' || saved === 'treasurer' || saved === 'bll') return saved as UserRole;
      return 'guest';
    } catch {
      return 'guest';
    }
  });

  // Admin / BLL Management Hub Modal
  const [isAdminHubOpen, setIsAdminHubOpen] = useState(false);
  const [adminHubInitialTab, setAdminHubInitialTab] = useState<'members' | 'fund' | 'wishes' | 'media' | 'settings'>('members');
  const [adminHubInitialMediaSubTab, setAdminHubInitialMediaSubTab] = useState<'venue' | 'banner' | 'videos' | 'photos'>('venue');

  const handleOpenAdminHub = (
    tab: 'members' | 'fund' | 'wishes' | 'media' | 'settings' = 'members',
    subTab: 'venue' | 'banner' | 'videos' | 'photos' = 'venue'
  ) => {
    setAdminHubInitialTab(tab);
    setAdminHubInitialMediaSubTab(subTab);
    setIsAdminHubOpen(true);
  };

  // Student Souvenir Pass modal state
  const [selectedPassAttendee, setSelectedPassAttendee] = useState<RsvpData | null>(null);
  const [isPassModalOpen, setIsPassModalOpen] = useState(false);

  // Self-service Receipt Upload Modal state
  const [selectedReceiptAttendee, setSelectedReceiptAttendee] = useState<RsvpData | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  const handleOpenReceiptModal = (attendee?: RsvpData | null) => {
    setSelectedReceiptAttendee(attendee || null);
    setIsReceiptModalOpen(true);
  };

  // Class Charter / Quy Chế Modal state
  const [isCharterModalOpen, setIsCharterModalOpen] = useState(false);

  // Role Guide / Cẩm Nang Vận Hành K8A1 Modal state
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);
  const [guideInitialTab, setGuideInitialTab] = useState<'member' | 'bll' | 'treasurer' | 'admin' | 'matrix'>('member');

  const handleOpenGuideModal = (tab: 'member' | 'bll' | 'treasurer' | 'admin' | 'matrix' = 'member') => {
    setGuideInitialTab(tab);
    setIsGuideModalOpen(true);
  };

  // Hero Banner Cover Image URL & Vertical Position State (0% - 100%)
  const [heroBannerUrl, setHeroBannerUrl] = useState<string>(() => {
    try {
      return localStorage.getItem('k8a1_hero_banner_url') || '';
    } catch {
      return '';
    }
  });

  const [heroBannerPosition, setHeroBannerPosition] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('k8a1_hero_banner_position');
      if (saved !== null) {
        const num = parseFloat(saved);
        if (!isNaN(num) && num >= 0 && num <= 100) return num;
      }
      return 50;
    } catch {
      return 50;
    }
  });

  // Helper chuẩn hóa dữ liệu RSVP chống crash do sai lệch kiểu dữ liệu
  const sanitizeRsvp = (item: any): RsvpData => ({
    ...item,
    id: String(item.id || ''),
    rowId: item.rowId ? String(item.rowId).trim() : undefined,
    memberId: item.memberId ? String(item.memberId).trim() : undefined,
    fullName: String(item.fullName || ''),
    phone: String(item.phone || ''),
    nickname: item.nickname ? String(item.nickname) : '',
    className: item.className ? String(item.className) : 'K8A1',
    shirtSize: (item.shirtSize && String(item.shirtSize).trim() !== '' && !String(item.shirtSize).toLowerCase().includes('chưa chọn') && !String(item.shirtSize).toLowerCase().includes('chua chon'))
      ? String(item.shirtSize).trim().toUpperCase()
      : '',
    status: item.status === 'no' ? 'no' : 'yes',
    message: item.message ? String(item.message) : '',
    submittedAt: item.submittedAt ? String(item.submittedAt) : '',
    checkedIn: Boolean(item.checkedIn),
    fundStatus: item.fundStatus || 'unpaid',
    fundAmount: Number(item.fundAmount) || 0,
    fundReceiptUrl: item.fundReceiptUrl ? String(item.fundReceiptUrl) : '',
    fundNote: item.fundNote ? String(item.fundNote) : '',
    fundAuditedBy: item.fundAuditedBy ? String(item.fundAuditedBy) : '',
    fundPaidAt: item.fundPaidAt ? formatDateTimeVi(item.fundPaidAt) : ''
  });

  // Helper chuẩn hóa dữ liệu học sinh danh bạ lớp, chống crash do dữ liệu dạng số từ Google Sheet
  const sanitizeClassMember = (item: any, idx: number): ClassMember => ({
    id: item.id ? String(item.id) : ('m' + (idx < 9 ? '0' + (idx + 1) : (idx + 1))),
    fullName: String(item.fullName || '').trim(),
    nickname: item.nickname ? String(item.nickname).trim() : '',
    phone: item.phone ? String(item.phone).trim() : '',
    role: item.role ? String(item.role).trim() : 'Thành viên',
    gender: (item.gender === 'female' || String(item.gender).toLowerCase().includes('nữ')) ? 'female' : 'male',
    shirtSize: (item.shirtSize && String(item.shirtSize).trim() !== '' && !String(item.shirtSize).toLowerCase().includes('chưa chọn') && !String(item.shirtSize).toLowerCase().includes('chua chon'))
      ? String(item.shirtSize).trim().toUpperCase()
      : '',
    note: item.note ? String(item.note).trim() : ''
  });

  // Class Roster Master Directory state (Sĩ số học sinh lớp K8A1)
  const [classRoster, setClassRoster] = useState<ClassMember[]>(() => {
    try {
      const local = localStorage.getItem('k8a1_class_roster');
      if (!local) return CLASS_ROSTER_K8A1;
      const parsed = JSON.parse(local);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed.map(sanitizeClassMember) : CLASS_ROSTER_K8A1;
    } catch {
      return CLASS_ROSTER_K8A1;
    }
  });

  const handleUpdateClassRoster = (updated: ClassMember[]) => {
    const sanitized = updated.map(sanitizeClassMember);
    setClassRoster(sanitized);
    try {
      localStorage.setItem('k8a1_class_roster', JSON.stringify(sanitized));
    } catch (e) {
      console.warn('Lỗi lưu danh bạ lớp vào localStorage:', e);
    }

    // CASCADE UPDATE: Đồng bộ ngay lập tức sang rsvpList trong bộ nhớ React State
    setRsvpList(prev => {
      const rosterMap = new Map<string, ClassMember>();
      sanitized.forEach(m => rosterMap.set(m.id, m));
      const updatedRsvp = prev.map(r => {
        if (r.memberId && rosterMap.has(r.memberId)) {
          const m = rosterMap.get(r.memberId)!;
          return {
            ...r,
            fullName: m.fullName,
            nickname: m.nickname || r.nickname,
            phone: m.phone || r.phone,
            shirtSize: normalizeShirtSize(m.shirtSize) || normalizeShirtSize(r.shirtSize)
          };
        }
        return r;
      });
      try {
        localStorage.setItem('rsvp_list', JSON.stringify(updatedRsvp));
      } catch (e) {}
      return updatedRsvp;
    });

    // Ghi trực tiếp lên Google Sheet tab "Danh_Sach_Lop" (Backend sẽ tự cascade sang sheet Điểm danh)
    syncToBackend('save_roster', { roster: sanitized });
  };

  // Đồng bộ định danh thành viên toàn bộ WebApp (chọn 1 lần sẽ tự điền ở Lưu bút, Điểm danh RSVP, Quỹ lớp)
  const [activeMember, setActiveMember] = useState<ClassMember | null>(() => {
    try {
      const saved = localStorage.getItem('k8a1_active_member');
      if (saved) {
        return JSON.parse(saved);
      }
      const savedId = localStorage.getItem('k8a1_visitor_id');
      if (savedId) {
        const localRoster = localStorage.getItem('k8a1_class_roster');
        const roster: ClassMember[] = localRoster ? JSON.parse(localRoster) : CLASS_ROSTER_K8A1;
        const found = roster.find(m => m.id === savedId);
        if (found) return found;
      }
      return null;
    } catch {
      return null;
    }
  });

  const handleSelectActiveMember = (member: ClassMember | null) => {
    setActiveMember(member);
    try {
      if (member) {
        localStorage.setItem('k8a1_active_member', JSON.stringify(member));
        localStorage.setItem('k8a1_visitor_id', member.id);
        window.dispatchEvent(new CustomEvent('select-visitor-identity', {
          detail: { memberId: member.id, fullName: member.fullName }
        }));
      } else {
        localStorage.removeItem('k8a1_active_member');
        localStorage.removeItem('k8a1_visitor_id');
      }
    } catch (e) {
      console.warn('Lỗi lưu activeMember vào localStorage:', e);
    }
  };

  // Đồng bộ activeMember khi classRoster được cập nhật từ Google Sheet
  useEffect(() => {
    if (activeMember && classRoster.length > 0) {
      const updated = classRoster.find(m => m.id === activeMember.id);
      if (updated && (updated.fullName !== activeMember.fullName || updated.nickname !== activeMember.nickname || updated.phone !== activeMember.phone)) {
        setActiveMember(updated);
      }
    }
  }, [classRoster]);

  // Quản lý Modal chọn danh tính thành viên K8A1 (Global Modal tại Root App)
  const [isIdentityModalOpen, setIsIdentityModalOpen] = useState(false);
  const [isZaloShareModalOpen, setIsZaloShareModalOpen] = useState(false);

  useEffect(() => {
    const handleOpenIdentity = () => setIsIdentityModalOpen(true);
    const handleOpenZaloShare = () => setIsZaloShareModalOpen(true);
    window.addEventListener('open-identity-modal', handleOpenIdentity);
    window.addEventListener('open-zalo-share-modal', handleOpenZaloShare);
    return () => {
      window.removeEventListener('open-identity-modal', handleOpenIdentity);
      window.removeEventListener('open-zalo-share-modal', handleOpenZaloShare);
    };
  }, []);

  // RSVP list state
  const [rsvpList, setRsvpList] = useState<RsvpData[]>(() => {
    try {
      const local = localStorage.getItem('rsvp_list');
      if (!local) return INITIAL_RSVP_LIST;
      const parsed = JSON.parse(local);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Tự động dọn cache cũ nếu người dùng từng lưu danh sách lỗi ít hơn số lượng chuẩn hiện tại
        if (parsed.length < INITIAL_RSVP_LIST.length) {
          try { localStorage.setItem('rsvp_list', JSON.stringify(INITIAL_RSVP_LIST)); } catch (e) {}
          return INITIAL_RSVP_LIST;
        }
        return parsed.map(sanitizeRsvp);
      }
      return INITIAL_RSVP_LIST;
    } catch (e) {
      console.warn('Lỗi đọc rsvp_list từ localStorage:', e);
      return INITIAL_RSVP_LIST;
    }
  });

  // Đếm số lượng bạn bè đã xác nhận tham dự ('yes') phục vụ điều hướng nhanh
  const confirmedCount = React.useMemo(() => {
    return (rsvpList || []).filter(r => r.status === 'yes').length;
  }, [rsvpList]);

  // Wishes list state
  const [wishesList, setWishesList] = useState<WishData[]>(() => {
    try {
      const local = localStorage.getItem('wishes_list');
      if (!local) return INITIAL_WISHES_LIST;
      const parsed = JSON.parse(local);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_WISHES_LIST;
    } catch (e) {
      console.warn('Lỗi đọc wishes_list từ localStorage:', e);
      return INITIAL_WISHES_LIST;
    }
  });

  // Images list state (kỷ niệm xưa & ảnh bạn bè đóng góp từ Google Drive / Sheet)
  const [images, setImages] = useState<MemoryImage[]>(() => {
    try {
      const local = localStorage.getItem('uploaded_images');
      if (local) {
        const uploaded = JSON.parse(local);
        if (Array.isArray(uploaded) && uploaded.length > 0) return uploaded;
      }
      return [];
    } catch (e) {
      console.warn('Lỗi đọc uploaded_images từ localStorage:', e);
      return [];
    }
  });

  // Videos list state
  const [videos, setVideos] = useState<MemoryVideo[]>(() => {
    try {
      const local = localStorage.getItem('custom_videos') || localStorage.getItem('k8a1_video_list');
      if (local) {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return [];
    } catch {
      return [];
    }
  });

  // Venue media state (Crown Palace)
  const [venueMediaList, setVenueMediaList] = useState<VenueMediaItem[]>(() => {
    try {
      const local = localStorage.getItem('k8a1_venue_media_list');
      if (local) {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return DEFAULT_VENUE_MEDIA;
    } catch {
      return DEFAULT_VENUE_MEDIA;
    }
  });

  // Helper chuẩn hóa dữ liệu khoản chi tiêu quỹ lớp, chống crash dữ liệu
  const sanitizeExpense = (item: any, idx: number): ExpenseItem => ({
    id: item.id ? String(item.id) : ('exp-' + (Date.now() + idx)),
    title: String(item.title || '').trim(),
    category: (item.category || 'other') as ExpenseCategory,
    amount: Number(item.amount) || 0,
    date: formatDateOnlyVi(item.date),
    spender: String(item.spender || '').trim(),
    recipient: item.recipient ? String(item.recipient).trim() : '',
    receiptUrl: item.receiptUrl ? String(item.receiptUrl).trim() : '',
    eventScope: item.eventScope ? String(item.eventScope).trim() : 'Kỷ niệm 20 năm',
    note: item.note ? String(item.note).trim() : '',
    createdAt: item.createdAt ? String(item.createdAt) : new Date().toISOString()
  });

  // Sổ Chi Tiêu Quỹ Lớp (Khoan_Chi) - Quản lý thu chi minh bạch theo Quy chế Điều 3 & 4
  const [expenses, setExpenses] = useState<ExpenseItem[]>(() => {
    try {
      const local = localStorage.getItem('k8a1_expenses_list');
      if (local) {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed)) {
          // Xóa bỏ dữ liệu mẫu ban đầu nếu có để đồng bộ chính xác với Google Sheet
          const isInitialMock = parsed.length === 4 && parsed.some((p: any) => String(p.title || '').includes('Đặt may & In ấn 45 áo polo'));
          if (isInitialMock) {
            localStorage.removeItem('k8a1_expenses_list');
            return [];
          }
          return parsed.map(sanitizeExpense);
        }
      }
    } catch {
      return [];
    }
  });

  // Helper chuẩn hóa dữ liệu khoản thu quỹ lớp, bảo vệ chống crash
  const sanitizeIncome = (item: any, idx: number): IncomeItem => ({
    id: item.id ? String(item.id) : ('inc-' + (Date.now() + idx)),
    title: String(item.title || '').trim(),
    category: (item.category || 'other_income') as IncomeCategory,
    amount: Number(item.amount) || 0,
    date: formatDateOnlyVi(item.date),
    payerName: String(item.payerName || '').trim(),
    payerPhone: item.payerPhone ? String(item.payerPhone).trim() : '',
    memberId: item.memberId ? String(item.memberId).trim() : undefined,
    paymentMethod: (item.paymentMethod === 'cash' || item.paymentMethod === 'other') ? item.paymentMethod : 'bank_transfer',
    auditor: item.auditor ? String(item.auditor).trim() : 'Thủ Quỹ BLL',
    receiptUrl: item.receiptUrl ? String(item.receiptUrl).trim() : '',
    eventScope: item.eventScope ? String(item.eventScope).trim() : 'Kỷ niệm 20 năm',
    note: item.note ? String(item.note).trim() : '',
    createdAt: item.createdAt ? String(item.createdAt) : new Date().toISOString()
  });

  // Sổ Thu Quỹ Lớp (Khoan_Thu) - Quản lý thu quỹ đa danh mục minh bạch
  const [incomes, setIncomes] = useState<IncomeItem[]>(() => {
    try {
      const local = localStorage.getItem('k8a1_incomes_list');
      if (local) {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed)) {
          return parsed.map(sanitizeIncome);
        }
      }
    } catch {
      return [];
    }
    return [];
  });

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showLegacyAdminPanel, setShowLegacyAdminPanel] = useState(false);
  const [latestAction, setLatestAction] = useState<ActivityToast | null>(null);

  // Open pass modal helper
  const handleOpenPass = (attendee?: RsvpData) => {
    if (attendee) {
      setSelectedPassAttendee(attendee);
    } else {
      const defaultUser = rsvpList.find((a) => a.status === 'yes') || rsvpList[0];
      setSelectedPassAttendee(defaultUser);
    }
    setIsPassModalOpen(true);
  };

  // Normalize helper for phone and name (chuyển đổi String an toàn chống lỗi TypeError khi SĐT là dạng số)
  const normalizePhoneForMatch = (p?: any) => {
    if (p === null || p === undefined) return '';
    let clean = String(p).replace(/[^0-9]/g, '');
    if (clean.startsWith('84') && clean.length > 9) clean = '0' + clean.slice(2);
    else if (!clean.startsWith('0') && clean.length === 9) clean = '0' + clean;
    return clean;
  };

  const normalizeNameForMatch = (n?: any) => {
    if (n === null || n === undefined) return '';
    return String(n).trim().toLowerCase().replace(/\s+/g, ' ');
  };

  // Synchronize new RSVP entries (Upsert thông minh chống trùng lặp)
  // Synchronize new RSVP entries (Upsert thông minh chống trùng lặp và phân biệt người trùng tên)
  const handleAddRsvp = (newRsvp: RsvpData) => {
    let wasExisting = false;
    setRsvpList((prev) => {
      const normNewPhone = normalizePhoneForMatch(newRsvp.phone);
      const normNewName = normalizeNameForMatch(newRsvp.fullName);
      const normNewNick = normalizeNameForMatch(newRsvp.nickname);

      const existingIndex = prev.findIndex((item) => {
        // 1. Khớp chính xác theo ID thành viên danh bạ nếu cả 2 bên đều có
        if (newRsvp.memberId && item.memberId && newRsvp.memberId === item.memberId) return true;
        // 2. Khớp theo ID bản ghi nếu có
        if (newRsvp.id && item.id && newRsvp.id === item.id) return true;

        const itemName = normalizeNameForMatch(item.fullName);
        const itemNick = normalizeNameForMatch(item.nickname);

        // NGUYÊN TẮC THÉP: Nếu 2 bản ghi có 2 họ tên khác nhau thì TUYỆT ĐỐI không gộp vào nhau
        if (normNewName && itemName && normNewName !== itemName) {
          return false;
        }

        // 3. Nếu SĐT khớp nhau (chỉ xét khi họ tên không mâu thuẫn):
        if (isPhoneMatch(newRsvp.phone, item.phone)) {
          return true;
        }

        // 4. Nếu có nickname: khớp cả họ tên và biệt danh
        if (normNewNick && itemNick && normNewName === itemName && normNewNick === itemNick) {
          return true;
        }

        // 5. Nếu họ tên khớp:
        if (normNewName && itemName && normNewName === itemName) {
          const currentRoster = classRoster && classRoster.length > 0 ? classRoster : CLASS_ROSTER_K8A1;
          const sameNameCount = currentRoster.filter(
            (r) => normalizeNameForMatch(r.fullName) === normNewName
          ).length;
          if (sameNameCount <= 1) {
            return true;
          }
        }

        return false;
      });

      let updated: RsvpData[];
      if (existingIndex >= 0) {
        wasExisting = true;
        updated = [...prev];
        const prevItem = updated[existingIndex];
        const isAlreadyPaid = prevItem.fundStatus === 'paid';
        const isAlreadyCheckedIn = prevItem.checkedIn;
        updated[existingIndex] = {
          ...prevItem,
          ...newRsvp,
          id: prevItem.id,
          rowId: newRsvp.rowId || prevItem.rowId,
          memberId: newRsvp.memberId || prevItem.memberId,
          phone: normNewPhone || newRsvp.phone || prevItem.phone,
          checkedIn: isAlreadyCheckedIn || newRsvp.checkedIn,
          fundStatus: isAlreadyPaid 
            ? 'paid' 
            : (newRsvp.fundStatus === 'paid' ? 'paid' : (newRsvp.fundStatus || prevItem.fundStatus)),
          fundAmount: Math.max(prevItem.fundAmount || 0, newRsvp.fundAmount || 0),
          fundReceiptUrl: newRsvp.fundReceiptUrl || prevItem.fundReceiptUrl
        };
      } else {
        updated = [newRsvp, ...prev];
      }

      try {
        localStorage.setItem('rsvp_list', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    // ĐỒNG BỘ NGƯỢC: Cập nhật size áo (và SĐT, biệt danh) của bạn học vào Danh bạ 65 thành viên K8A1 để lưu giữ lâu dài
    const chosenSize = normalizeShirtSize(newRsvp.shirtSize);
    if (chosenSize) {
      setClassRoster((prevRoster) => {
        const normName = normalizeNameForMatch(newRsvp.fullName);
        const normPhone = normalizePhoneForMatch(newRsvp.phone);
        let updated = false;

        const nextRoster = prevRoster.map((m) => {
          const isMatch = (newRsvp.memberId && m.id === newRsvp.memberId) ||
            (normPhone && normalizePhoneForMatch(m.phone) === normPhone) ||
            (normName && normalizeNameForMatch(m.fullName) === normName);

          if (isMatch) {
            updated = true;
            return {
              ...m,
              shirtSize: chosenSize,
              phone: m.phone || (normPhone ? normPhone : (newRsvp.phone || '')),
              nickname: m.nickname || (newRsvp.nickname ? newRsvp.nickname.trim() : '')
            };
          }
          return m;
        });

        if (updated) {
          try {
            localStorage.setItem('k8a1_class_roster', JSON.stringify(nextRoster));
          } catch (e) {}
        }
        return nextRoster;
      });

      // Cập nhật activeMember nếu trùng với người vừa điểm danh
      setActiveMember((prevActive) => {
        if (!prevActive) return null;
        const normActiveName = normalizeNameForMatch(prevActive.fullName);
        const normRsvpName = normalizeNameForMatch(newRsvp.fullName);
        const isMatch = (newRsvp.memberId && prevActive.id === newRsvp.memberId) ||
          (normActiveName && normActiveName === normRsvpName);

        if (isMatch) {
          const updatedActive = {
            ...prevActive,
            shirtSize: chosenSize,
            phone: prevActive.phone || newRsvp.phone || '',
            nickname: prevActive.nickname || newRsvp.nickname || ''
          };
          try {
            localStorage.setItem('k8a1_active_member', JSON.stringify(updatedActive));
          } catch (e) {}
          return updatedActive;
        }
        return prevActive;
      });
    }

    // Đồng bộ trực tiếp lên Google Apps Script tab "Trang_tinh_1" / "Diem_Danh" (Backend sẽ tự động đồng bộ ngược sang "Danh_Sach_Lop")
    syncToBackend('rsvp', newRsvp);

    setLatestAction({
      id: `toast-rsvp-${Date.now()}`,
      type: 'rsvp',
      author: newRsvp.fullName,
      className: newRsvp.className || 'K8A1',
      text: wasExisting
        ? 'vừa cập nhật thông tin phản hồi tham dự.'
        : (newRsvp.status === 'yes'
            ? (newRsvp.message ? `vừa xác nhận về lớp: "${newRsvp.message.slice(0, 50)}"` : 'vừa xác nhận chắc chắn có mặt tại Ngày hội ngộ 20 năm!')
            : 'vừa gửi phản hồi về ngày họp lớp K8A1.'),
      timeAgo: 'Vừa xong',
      isNew: true
    });
  };

  // Cập nhật danh sách RSVP và tự động đồng bộ ngược Size áo về Danh Sách Lớp
  const handleUpdateRsvpList = (updated: RsvpData[]) => {
    setRsvpList(updated);
    try {
      localStorage.setItem('rsvp_list', JSON.stringify(updated));
    } catch (e) {}

    // REVERSE SYNC: Tự động lưu Size áo từ Điểm danh (RSVP) về Danh bạ lớp (Danh_Sach_Lop)
    setClassRoster((prevRoster) => {
      let changed = false;
      const nextRoster = prevRoster.map((m) => {
        const matched = updated.find((r) => {
          if (m.id && r.memberId && m.id === r.memberId) return true;
          const p1 = normalizePhoneForMatch(m.phone);
          const p2 = normalizePhoneForMatch(r.phone);
          if (p1 && p2 && p1 === p2) return true;
          const n1 = normalizeNameForMatch(m.fullName);
          const n2 = normalizeNameForMatch(r.fullName);
          return n1 && n2 && n1 === n2;
        });

        if (matched && matched.shirtSize) {
          const cleanSize = normalizeShirtSize(matched.shirtSize);
          if (cleanSize && cleanSize !== m.shirtSize) {
            changed = true;
            return {
              ...m,
              shirtSize: cleanSize
            };
          }
        }
        return m;
      });

      if (changed) {
        try {
          localStorage.setItem('k8a1_class_roster', JSON.stringify(nextRoster));
        } catch (e) {}
        return nextRoster;
      }
      return prevRoster;
    });

    // Đồng bộ nếu activeMember đang chọn
    setActiveMember((prevActive) => {
      if (!prevActive) return null;
      const matched = updated.find((r) => {
        if (prevActive.id && r.memberId && prevActive.id === r.memberId) return true;
        const p1 = normalizePhoneForMatch(prevActive.phone);
        const p2 = normalizePhoneForMatch(r.phone);
        if (p1 && p2 && p1 === p2) return true;
        const n1 = normalizeNameForMatch(prevActive.fullName);
        const n2 = normalizeNameForMatch(r.fullName);
        return n1 && n2 && n1 === n2;
      });
      if (matched && matched.shirtSize) {
        const cleanSize = normalizeShirtSize(matched.shirtSize);
        if (cleanSize && cleanSize !== prevActive.shirtSize) {
          const nextActive = { ...prevActive, shirtSize: cleanSize };
          try {
            localStorage.setItem('k8a1_active_member', JSON.stringify(nextActive));
          } catch (e) {}
          return nextActive;
        }
      }
      return prevActive;
    });
  };

  // Synchronize new wishes
  const handleAddWish = (newWish: WishData) => {
    const updated = [newWish, ...wishesList];
    setWishesList(updated);
    try {
      localStorage.setItem('wishes_list', JSON.stringify(updated));
    } catch (e) {}

    // Đồng bộ trực tiếp lên Google Apps Script tab "Loi_Chuc"
    syncToBackend('add_wish', newWish);

    setLatestAction({
      id: `toast-wish-${Date.now()}`,
      type: 'wish',
      author: newWish.fullName,
      className: newWish.className || 'K8A1',
      text: `vừa gửi lời nhắn: "${newWish.message.slice(0, 50)}${newWish.message.length > 50 ? '...' : ''}"`,
      timeAgo: 'Vừa xong',
      isNew: true
    });
  };

  // Synchronize new image uploads with direct Google Sheet sync (supports single or batch uploads)
  const handleAddImage = (newImgOrImgs: MemoryImage | MemoryImage[]) => {
    const newItems = Array.isArray(newImgOrImgs) ? newImgOrImgs : [newImgOrImgs];
    if (newItems.length === 0) return;
    const local = localStorage.getItem('uploaded_images');
    const uploaded = local ? JSON.parse(local) : [];
    const updatedUploaded = [...newItems, ...uploaded];
    try {
      localStorage.setItem('uploaded_images', JSON.stringify(updatedUploaded));
    } catch (e) {}
    setImages(prev => [...newItems, ...prev]);
    syncToBackend('save_media', { 
      photos: updatedUploaded, 
      videos, 
      venueMedia: venueMediaList 
    });
  };

  // Update venue media (Crown Palace photos/videos) with direct Google Sheet sync
  const handleUpdateVenueMedia = (updated: VenueMediaItem[]) => {
    setVenueMediaList(updated);
    try {
      localStorage.setItem('k8a1_venue_media_list', JSON.stringify(updated));
    } catch (e) {}
    const userPhotos = images.filter(i => i.isUserUploaded);
    syncToBackend('save_media', { venueMedia: updated, videos, photos: userPhotos });
  };

  // Update custom video list with direct Google Sheet sync
  const handleUpdateVideos = (updated: MemoryVideo[]) => {
    setVideos(updated);
    try {
      localStorage.setItem('custom_videos', JSON.stringify(updated));
      localStorage.setItem('k8a1_video_list', JSON.stringify(updated));
    } catch (e) {}
    const userPhotos = images.filter(i => i.isUserUploaded);
    syncToBackend('save_media', { videos: updated, venueMedia: venueMediaList, photos: userPhotos });
  };

  // Update hero banner url and vertical crop position with direct Google Sheet sync
  const handleUpdateHeroBanner = (url: string, positionY: number = 50) => {
    const cleanUrl = normalizeImageUrl(url);
    setHeroBannerUrl(cleanUrl);
    setHeroBannerPosition(positionY);
    try {
      localStorage.setItem('k8a1_hero_banner_url', cleanUrl);
      localStorage.setItem('k8a1_hero_banner_position', positionY.toString());
    } catch (e) {
      console.warn('Lỗi lưu k8a1_hero_banner vào localStorage:', e);
    }
    const nextConfig = { ...eventConfig, heroBannerUrl: cleanUrl, heroBannerPosition: positionY };
    setEventConfig(nextConfig);
    try {
      localStorage.setItem('k8a1_event_config', JSON.stringify(nextConfig));
    } catch (e) {}
    syncToBackend('save_config', { config: nextConfig });
  };

  // Quản lý Sổ Chi Tiêu Quỹ Lớp (Khoan_Chi)
  const handleAddExpense = (newExpense: ExpenseItem) => {
    const clean = sanitizeExpense(newExpense, 0);
    const updated = [clean, ...expenses];
    setExpenses(updated);
    try {
      localStorage.setItem('k8a1_expenses_list', JSON.stringify(updated));
    } catch (e) {}
    syncToBackend('save_expenses', { expenses: updated });
  };

  const handleUpdateExpense = (updatedExpense: ExpenseItem) => {
    const clean = sanitizeExpense(updatedExpense, 0);
    const updated = expenses.map(e => e.id === clean.id ? clean : e);
    setExpenses(updated);
    try {
      localStorage.setItem('k8a1_expenses_list', JSON.stringify(updated));
    } catch (e) {}
    syncToBackend('save_expenses', { expenses: updated });
  };

  const handleDeleteExpense = (id: string) => {
    const updated = expenses.filter(e => e.id !== id);
    setExpenses(updated);
    try {
      localStorage.setItem('k8a1_expenses_list', JSON.stringify(updated));
    } catch (e) {}
    syncToBackend('save_expenses', { expenses: updated });
  };

  const handleSaveAllExpenses = (newList: ExpenseItem[]) => {
    const clean = newList.map(sanitizeExpense);
    setExpenses(clean);
    try {
      localStorage.setItem('k8a1_expenses_list', JSON.stringify(clean));
    } catch (e) {}
    syncToBackend('save_expenses', { expenses: clean });
  };

  // Quản lý Sổ Thu Quỹ Lớp (Khoan_Thu)
  const handleAddIncome = (newIncome: IncomeItem) => {
    const clean = sanitizeIncome(newIncome, 0);
    const updated = [clean, ...incomes];
    setIncomes(updated);
    try {
      localStorage.setItem('k8a1_incomes_list', JSON.stringify(updated));
    } catch (e) {}
    syncToBackend('save_incomes', { incomes: updated });
  };

  const handleUpdateIncome = (updatedIncome: IncomeItem) => {
    const clean = sanitizeIncome(updatedIncome, 0);
    const updated = incomes.map(item => item.id === clean.id ? clean : item);
    setIncomes(updated);
    try {
      localStorage.setItem('k8a1_incomes_list', JSON.stringify(updated));
    } catch (e) {}
    syncToBackend('save_incomes', { incomes: updated });
  };

  const handleDeleteIncome = (id: string) => {
    const updated = incomes.filter(item => item.id !== id);
    setIncomes(updated);
    try {
      localStorage.setItem('k8a1_incomes_list', JSON.stringify(updated));
    } catch (e) {}
    syncToBackend('save_incomes', { incomes: updated });
  };

  const handleSaveAllIncomes = (newList: IncomeItem[]) => {
    const clean = newList.map(sanitizeIncome);
    setIncomes(clean);
    try {
      localStorage.setItem('k8a1_incomes_list', JSON.stringify(clean));
    } catch (e) {}
    syncToBackend('save_incomes', { incomes: clean });
  };

  // Helper chuẩn hóa dữ liệu Thầy Cô giáo K8A1
  const sanitizeTeacher = (item: any, idx: number): TeacherData => ({
    id: item.id ? String(item.id) : ('tc' + (idx < 9 ? '0' + (idx + 1) : (idx + 1))),
    name: String(item.name || '').trim(),
    gender: (item.gender === 'Thầy' || item.gender === 'Cô') ? item.gender : 'Cô',
    birthYear: item.birthYear ? String(item.birthYear).trim() : '',
    phone: item.phone ? String(item.phone).trim() : '',
    relativePhone: item.relativePhone ? String(item.relativePhone).trim() : '',
    address: item.address ? String(item.address).trim() : '',
    subject: item.subject ? String(item.subject).trim() : '',
    role: item.role ? String(item.role).trim() : 'Giáo viên Bộ môn',
    workStatus: item.workStatus ? String(item.workStatus).trim() : 'Đã nghỉ hưu',
    inviteProgress: item.inviteProgress ? String(item.inviteProgress).trim() : 'Chưa gửi',
    status: (item.status || 'pending') as TeacherInvitationStatus,
    companion: item.companion ? String(item.companion).trim() : 'Đi một mình',
    transportation: item.transportation ? String(item.transportation).trim() : 'Tự túc',
    coordinator: item.coordinator ? String(item.coordinator).trim() : '',
    healthNotes: item.healthNotes ? String(item.healthNotes).trim() : '',
    avatarUrl: item.avatarUrl ? String(item.avatarUrl).trim() : '',
    quote: item.quote ? String(item.quote).trim() : '',
    updatedAt: item.updatedAt ? String(item.updatedAt).trim() : ''
  });

  // Quản lý Danh Sách Quý Thầy Cô (Thay_Co_K8A1)
  const [teachersList, setTeachersList] = useState<TeacherData[]>(() => {
    try {
      const local = localStorage.getItem('k8a1_teachers_list');
      if (local) {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Xóa bỏ dữ liệu mẫu ban đầu nếu có để đồng bộ chính xác với Google Sheet
          const isInitialMock = parsed.some((t: any) => t.id === 'tc01' && String(t.name || '').includes('Trần Thị Lan'));
          if (isInitialMock) {
            localStorage.removeItem('k8a1_teachers_list');
            return [];
          }
          return parsed.map(sanitizeTeacher);
        }
      }
    } catch {}
    return [];
  });

  const handleAddTeacher = (newTeacher: TeacherData) => {
    const clean = sanitizeTeacher(newTeacher, teachersList.length);
    const updated = [...teachersList, clean];
    setTeachersList(updated);
    try {
      localStorage.setItem('k8a1_teachers_list', JSON.stringify(updated));
    } catch (e) {}
    syncToBackend('save_teachers', { teachers: updated });
  };

  const handleUpdateTeacher = (updatedTeacher: TeacherData) => {
    const clean = sanitizeTeacher(updatedTeacher, 0);
    const updated = teachersList.map(t => t.id === clean.id ? clean : t);
    setTeachersList(updated);
    try {
      localStorage.setItem('k8a1_teachers_list', JSON.stringify(updated));
    } catch (e) {}
    syncToBackend('save_teachers', { teachers: updated });
  };

  const handleDeleteTeacher = (id: string) => {
    const updated = teachersList.filter(t => t.id !== id);
    setTeachersList(updated);
    try {
      localStorage.setItem('k8a1_teachers_list', JSON.stringify(updated));
    } catch (e) {}
    syncToBackend('save_teachers', { teachers: updated });
  };

  const handleSaveAllTeachers = (newList: TeacherData[]) => {
    const clean = newList.map(sanitizeTeacher);
    setTeachersList(clean);
    try {
      localStorage.setItem('k8a1_teachers_list', JSON.stringify(clean));
    } catch (e) {}
    syncToBackend('save_teachers', { teachers: clean });
  };

  // Helper chuẩn hóa & chống trùng lặp danh sách RSVP (bảo toàn người trùng tên, đối soát chính xác theo SĐT hoặc memberId)
  const processRsvpList = (rawRsvpList: any[], prevRsvpList: RsvpData[] = rsvpList): RsvpData[] => {
    if (!Array.isArray(rawRsvpList) || rawRsvpList.length === 0) return [];
    const uniqueRsvp: RsvpData[] = [];
    const currentRoster = classRoster && classRoster.length > 0 ? classRoster : CLASS_ROSTER_K8A1;

    for (const rawItem of rawRsvpList) {
      if (!rawItem) continue;
      const item = sanitizeRsvp(rawItem);
      if (!item.memberId && currentRoster && currentRoster.length > 0) {
        const found = currentRoster.find(m => isPhoneMatch(m.phone, item.phone) || isVietnameseNameMatch(m, item.fullName));
        if (found) {
          item.memberId = found.id;
        }
      }
      const itemName = normalizeNameForMatch(item.fullName);

      // Kiểm tra xem trong uniqueRsvp đã có bản ghi của CHÍNH người này chưa
      const existingIdx = uniqueRsvp.findIndex((x) => {
        if (item.memberId && x.memberId) return item.memberId === x.memberId;
        if (item.id && x.id && String(item.id) === String(x.id)) return true;

        const xName = normalizeNameForMatch(x.fullName);

        // NGUYÊN TẮC THÉP: Hai bạn có 2 họ tên khác nhau thì TUYỆT ĐỐI không bao giờ gộp vào nhau
        if (itemName && xName && itemName !== xName) {
          return false;
        }

        // 3. Trùng SĐT (chỉ xét khi họ tên không mâu thuẫn):
        if (isPhoneMatch(item.phone, x.phone)) return true;

        // 4. Trùng họ tên:
        if (itemName && xName && itemName === xName) {
          const sameNameCount = currentRoster.filter(
            (r) => normalizeNameForMatch(r.fullName) === itemName
          ).length;
          if (sameNameCount <= 1) return true;
          if (isPhoneMatch(item.phone, x.phone)) return true;
        }
        return false;
      });

      // Bảo tồn link ảnh bill đã lưu trong rsvpList trước đó nếu bản ghi từ server trả về chuỗi rỗng
      let existingLocalReceiptUrl = '';
      const localMatch = (prevRsvpList || []).find((prev) => {
        if (item.memberId && prev.memberId && item.memberId === prev.memberId) return true;
        if (item.id && prev.id && String(item.id) === String(prev.id)) return true;
        const prevName = normalizeNameForMatch(prev.fullName);
        if (itemName && prevName && itemName !== prevName) return false;
        if (isPhoneMatch(item.phone, prev.phone)) return true;
        return prevName === itemName;
      });
      if (localMatch && localMatch.fundReceiptUrl) {
        existingLocalReceiptUrl = localMatch.fundReceiptUrl;
      }

      const finalReceiptUrl = item.fundReceiptUrl || existingLocalReceiptUrl || '';

      if (existingIdx >= 0) {
        uniqueRsvp[existingIdx] = {
          ...uniqueRsvp[existingIdx],
          ...item,
          checkedIn: uniqueRsvp[existingIdx].checkedIn || item.checkedIn,
          fundStatus: (uniqueRsvp[existingIdx].fundStatus === 'paid' || item.fundStatus === 'paid') ? 'paid' : (item.fundStatus || uniqueRsvp[existingIdx].fundStatus),
          fundAmount: Math.max(uniqueRsvp[existingIdx].fundAmount || 0, item.fundAmount || 0),
          fundReceiptUrl: finalReceiptUrl || uniqueRsvp[existingIdx].fundReceiptUrl
        };
      } else {
        uniqueRsvp.push({
          ...item,
          fundReceiptUrl: finalReceiptUrl
        });
      }
    }

    return uniqueRsvp;
  };

  // Nạp toàn bộ dữ liệu từ Google Sheet & Google Drive (Single Source of Truth)
  const hydrateAllData = async (targetUrl: string = activeAppsScriptUrl) => {
    if (!targetUrl || !targetUrl.startsWith('http')) return;
    setIsRefreshing(true);
    setSyncStatus(prev => prev === 'live' ? 'live' : 'syncing');
    try {
      const adminPinToken = sessionStorage.getItem('admin_pin_token') || '';
      const pinQuery = adminPinToken ? `&pin=${encodeURIComponent(adminPinToken)}` : '';
      const antiCache = `&_t=${Date.now()}&_rnd=${Math.random().toString(36).substring(7)}`;

      // ⚡ FAST-TRACK CORE DATA: Tải song song siêu tốc cả Điểm danh (Trang_tinh_1) và Danh bạ 65 bạn (Danh_Sach_Lop)
      // Chỉ ~1-1.5 giây để số người tham gia và thông tin thành viên cập nhật ngay tức thì, không bị trễ
      const fetchCoreFastPromise = (async () => {
        try {
          const [rsvpRes, rosterRes] = await Promise.allSettled([
            fetch(`${targetUrl}?action=get_rsvp${pinQuery}${antiCache}`, {
              cache: 'no-store',
              headers: { 'Cache-Control': 'no-cache, no-store, max-age=0, must-revalidate', 'Pragma': 'no-cache' }
            }).then(r => r.json()),
            fetch(`${targetUrl}?action=get_roster${pinQuery}${antiCache}`, {
              cache: 'no-store',
              headers: { 'Cache-Control': 'no-cache, no-store, max-age=0, must-revalidate', 'Pragma': 'no-cache' }
            }).then(r => r.json())
          ]);

          let gotFastData = false;

          if (rsvpRes.status === 'fulfilled' && rsvpRes.value?.status === 'success' && Array.isArray(rsvpRes.value.data) && rsvpRes.value.data.length > 0) {
            setRsvpList((prev) => {
              const sanitized = processRsvpList(rsvpRes.value.data, prev);
              try { localStorage.setItem('rsvp_list', JSON.stringify(sanitized)); } catch (e) {}
              return sanitized;
            });
            gotFastData = true;
          }

          if (rosterRes.status === 'fulfilled' && rosterRes.value?.status === 'success' && Array.isArray(rosterRes.value.data) && rosterRes.value.data.length > 0) {
            const cleanRoster = rosterRes.value.data
              .filter((r: any) => r && (r.fullName || r.id))
              .map((r: any, idx: number) => sanitizeClassMember(r, idx));
            if (cleanRoster.length > 0) {
              setClassRoster(cleanRoster);
              try { localStorage.setItem('k8a1_class_roster', JSON.stringify(cleanRoster)); } catch (e) {}
            }
            gotFastData = true;
          }

          if (gotFastData) {
            setSyncStatus('live');
            setLastSyncedTime(new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
          }
        } catch (fastErr) {
          console.warn('Lỗi Fast-Track get_rsvp & get_roster:', fastErr);
        }
      })();

      // 📦 MASTER DATA: Tải toàn bộ cấu hình, lưu bút, quỹ, videos, danh bạ
      const fetchMasterPromise = (async () => {
        try {
          const res = await fetch(`${targetUrl}?action=get_all_data${pinQuery}${antiCache}`, {
            cache: 'no-store',
            headers: { 'Cache-Control': 'no-cache, no-store, max-age=0, must-revalidate', 'Pragma': 'no-cache' }
          });
          const result = await res.json();
          if (result && result.status === 'success' && result.data) {
            const { rsvp, wishes, config, media, roster, drivePhotos: embeddedDrivePhotos } = result.data;

            // A. Cập nhật Banner & Cấu hình sự kiện ngay lập tức
            if (config && Object.keys(config).length > 0) {
              setEventConfig((prev) => {
                const updated = sanitizeEventConfig({ ...prev, ...config });
                try { localStorage.setItem('k8a1_event_config', JSON.stringify(updated)); } catch (e) {}
                return updated;
              });

              if (config.heroBannerUrl) {
                const cleanBanner = normalizeImageUrl(config.heroBannerUrl);
                setHeroBannerUrl(cleanBanner);
                try { localStorage.setItem('k8a1_hero_banner_url', cleanBanner); } catch (e) {}
              }
              if (config.heroBannerPosition !== undefined) {
                const pos = Number(config.heroBannerPosition) || 50;
                setHeroBannerPosition(pos);
                try { localStorage.setItem('k8a1_hero_banner_position', pos.toString()); } catch (e) {}
              }
            }

            // B. Cập nhật Videos ngay lập tức
            if (media) {
              if (Array.isArray(media.videos) && media.videos.length > 0) {
                setVideos(media.videos);
                try {
                  localStorage.setItem('k8a1_video_list', JSON.stringify(media.videos));
                  localStorage.setItem('custom_videos', JSON.stringify(media.videos));
                } catch (e) {}
              }
              if (Array.isArray(media.venueMedia) && media.venueMedia.length > 0) {
                setVenueMediaList(media.venueMedia);
                try { localStorage.setItem('k8a1_venue_media_list', JSON.stringify(media.venueMedia)); } catch (e) {}
              }
            }

            // C. Đồng bộ RSVP từ Google Sheet
            if (Array.isArray(rsvp) && rsvp.length > 0) {
              setRsvpList((prev) => {
                const uniqueRsvp = processRsvpList(rsvp, prev);
                try { localStorage.setItem('rsvp_list', JSON.stringify(uniqueRsvp)); } catch (e) {}
                return uniqueRsvp;
              });
            }

            // D. Đồng bộ Lời chúc từ Google Sheet
            if (Array.isArray(wishes)) {
              setWishesList(wishes);
              try { localStorage.setItem('wishes_list', JSON.stringify(wishes)); } catch (e) {}
            }

            // E. Đồng bộ Danh bạ Sĩ số Lớp K8A1 từ Google Sheet
            if (Array.isArray(roster) && roster.length > 0) {
              const rsvpArr = Array.isArray(rsvp) ? rsvp : [];
              const sanitizedRoster = roster
                .filter((r: any) => r && (r.fullName || r.id))
                .map((r: any, idx: number) => {
                  const baseMember = sanitizeClassMember(r, idx);
                  // REVERSE SYNC: Nếu size áo trong danh bạ còn trống, tự động bù từ điểm danh RSVP
                  if (!baseMember.shirtSize && rsvpArr.length > 0) {
                    const matchedRsvp = rsvpArr.find((item: any) => {
                      if (baseMember.id && item.memberId && baseMember.id === item.memberId) return true;
                      const normP = normalizePhoneForMatch(baseMember.phone);
                      const rNormP = normalizePhoneForMatch(item.phone);
                      if (normP && rNormP && normP === rNormP) return true;
                      const normN = normalizeNameForMatch(baseMember.fullName);
                      const rNormN = normalizeNameForMatch(item.fullName);
                      return normN && rNormN && normN === rNormN;
                    });
                    if (matchedRsvp && matchedRsvp.shirtSize) {
                      baseMember.shirtSize = normalizeShirtSize(matchedRsvp.shirtSize);
                    }
                  }
                  return baseMember;
                });
              if (sanitizedRoster.length > 0) {
                setClassRoster(sanitizedRoster);
                try { localStorage.setItem('k8a1_class_roster', JSON.stringify(sanitizedRoster)); } catch (e) {}

                // Đồng bộ nếu activeMember đang chọn mà chưa có size
                setActiveMember((prevActive) => {
                  if (!prevActive) return null;
                  const foundInRoster = sanitizedRoster.find(m => m.id === prevActive.id || normalizeNameForMatch(m.fullName) === normalizeNameForMatch(prevActive.fullName));
                  if (foundInRoster && foundInRoster.shirtSize && foundInRoster.shirtSize !== prevActive.shirtSize) {
                    const nextActive = { ...prevActive, shirtSize: foundInRoster.shirtSize };
                    try { localStorage.setItem('k8a1_active_member', JSON.stringify(nextActive)); } catch (e) {}
                    return nextActive;
                  }
                  return prevActive;
                });
              }
            }

            // F. Cập nhật ảnh tức thời nếu có drivePhotos nhúng trong get_all_data
            if (Array.isArray(embeddedDrivePhotos) && embeddedDrivePhotos.length > 0) {
              const embPhotos: MemoryImage[] = embeddedDrivePhotos.map((p: any) => ({
                id: p.id || `drive-${Date.now()}`,
                url: p.url || `https://lh3.googleusercontent.com/d/${p.id}=w1600`,
                thumbnail: p.thumbnail || `https://lh3.googleusercontent.com/d/${p.id}=w600`,
                caption: p.caption || 'Kỷ niệm Lớp K8A1',
                date: p.date || '2006',
                isUserUploaded: true,
                driveUrl: p.driveUrl
              }));
              setImages(embPhotos);
              try { localStorage.setItem('uploaded_images', JSON.stringify(embPhotos)); } catch (e) {}
            }

            // G. Đồng bộ Sổ Chi Tiêu Quỹ Lớp từ Google Sheet (tab "Khoan_Chi")
            if (Array.isArray(result.data.expenses)) {
              const cleanExp = result.data.expenses.map((item: any, idx: number) => sanitizeExpense(item, idx));
              setExpenses(cleanExp);
              try { localStorage.setItem('k8a1_expenses_list', JSON.stringify(cleanExp)); } catch (e) {}
            }

            // H. Đồng bộ Sổ Thu Quỹ Lớp từ Google Sheet (tab "Khoan_Thu")
            if (Array.isArray(result.data?.incomes)) {
              const cleanInc = result.data.incomes.map((item: any, idx: number) => sanitizeIncome(item, idx));
              setIncomes(cleanInc);
              try { localStorage.setItem('k8a1_incomes_list', JSON.stringify(cleanInc)); } catch (e) {}
            }

            // I. Đồng bộ Danh Sách Quý Thầy Cô từ Google Sheet (tab "Thay_Co_K8A1")
            if (Array.isArray(result.data?.teachers) && result.data.teachers.length > 0) {
              const cleanTeachers = result.data.teachers.map((item: any, idx: number) => sanitizeTeacher(item, idx));
              setTeachersList(cleanTeachers);
              try { localStorage.setItem('k8a1_teachers_list', JSON.stringify(cleanTeachers)); } catch (e) {}
            }

            setSyncStatus('live');
            setLastSyncedTime(new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
          } else {
            // Dự phòng đa tầng: Nếu get_all_data trả về lỗi, nạp fallback song song config, rsvp và roster
            try {
              const [cfgRes, rsvpRes, rosterRes] = await Promise.allSettled([
                fetch(`${targetUrl}?action=get_config${antiCache}`, { cache: 'no-store' }).then(r => r.json()),
                fetch(`${targetUrl}?action=get_rsvp${pinQuery}${antiCache}`, { cache: 'no-store' }).then(r => r.json()),
                fetch(`${targetUrl}?action=get_roster${pinQuery}${antiCache}`, { cache: 'no-store' }).then(r => r.json())
              ]);
              if (cfgRes.status === 'fulfilled' && cfgRes.value?.status === 'success' && cfgRes.value.data) {
                setEventConfig((prev) => sanitizeEventConfig({ ...prev, ...cfgRes.value.data }));
              }
              if (rsvpRes.status === 'fulfilled' && rsvpRes.value?.status === 'success' && Array.isArray(rsvpRes.value.data)) {
                setRsvpList((prev) => {
                  const sanitized = processRsvpList(rsvpRes.value.data, prev);
                  try { localStorage.setItem('rsvp_list', JSON.stringify(sanitized)); } catch (e) {}
                  return sanitized;
                });
              }
              if (rosterRes.status === 'fulfilled' && rosterRes.value?.status === 'success' && Array.isArray(rosterRes.value.data)) {
                const cleanRoster = rosterRes.value.data
                  .filter((r: any) => r && (r.fullName || r.id))
                  .map((r: any, idx: number) => sanitizeClassMember(r, idx));
                if (cleanRoster.length > 0) {
                  setClassRoster(cleanRoster);
                  try { localStorage.setItem('k8a1_class_roster', JSON.stringify(cleanRoster)); } catch (e) {}
                }
              }
              setSyncStatus('live');
              setLastSyncedTime(new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
            } catch (errFallback) {
              console.warn('Lỗi fallback nạp Google Sheet:', errFallback);
            }
          }
        } catch (err) {
          console.warn('Lỗi nạp Master Data từ Google Sheet:', err);
          try {
            const [cfgRes, rsvpRes, rosterRes] = await Promise.allSettled([
              fetch(`${targetUrl}?action=get_config${antiCache}`, { cache: 'no-store' }).then(r => r.json()),
              fetch(`${targetUrl}?action=get_rsvp${pinQuery}${antiCache}`, { cache: 'no-store' }).then(r => r.json()),
              fetch(`${targetUrl}?action=get_roster${pinQuery}${antiCache}`, { cache: 'no-store' }).then(r => r.json())
            ]);
            if (cfgRes.status === 'fulfilled' && cfgRes.value?.status === 'success' && cfgRes.value.data) {
              setEventConfig((prev) => sanitizeEventConfig({ ...prev, ...cfgRes.value.data }));
            }
            if (rsvpRes.status === 'fulfilled' && rsvpRes.value?.status === 'success' && Array.isArray(rsvpRes.value.data)) {
              setRsvpList((prev) => {
                const sanitized = processRsvpList(rsvpRes.value.data, prev);
                try { localStorage.setItem('rsvp_list', JSON.stringify(sanitized)); } catch (e) {}
                return sanitized;
              });
            }
            if (rosterRes.status === 'fulfilled' && rosterRes.value?.status === 'success' && Array.isArray(rosterRes.value.data)) {
              const cleanRoster = rosterRes.value.data
                .filter((r: any) => r && (r.fullName || r.id))
                .map((r: any, idx: number) => sanitizeClassMember(r, idx));
              if (cleanRoster.length > 0) {
                setClassRoster(cleanRoster);
                try { localStorage.setItem('k8a1_class_roster', JSON.stringify(cleanRoster)); } catch (e) {}
              }
            }
            setSyncStatus('live');
            setLastSyncedTime(new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
          } catch (e) {
            setSyncStatus(prev => prev === 'live' ? 'live' : 'error');
          }
        }
      })();

      await Promise.allSettled([fetchCoreFastPromise, fetchMasterPromise]);
    } catch (err) {
      console.warn('Lỗi đồng bộ từ Google Sheet & Drive:', err);
      setSyncStatus(prev => prev === 'live' ? 'live' : 'error');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Live Refresh data from Google Apps Script (ép xóa cache trước khi fetch để dữ liệu tươi mới 100%)
  const handleRefreshData = () => {
    setSyncStatus('syncing');
    try {
      localStorage.removeItem('rsvp_list');
      localStorage.removeItem('k8a1_class_roster');
      localStorage.removeItem('k8a1_event_config');
      localStorage.removeItem('wishes_list');
      localStorage.removeItem('k8a1_expenses_list');
      localStorage.removeItem('k8a1_incomes_list');
      localStorage.removeItem('k8a1_teachers_list');
    } catch (e) {}
    hydrateAllData(activeAppsScriptUrl);
  };

  // Tự động đồng bộ toàn bộ dữ liệu ngay khi tải trang và khi URL thay đổi
  useEffect(() => {
    hydrateAllData(activeAppsScriptUrl);
  }, [activeAppsScriptUrl]);

  // Tự động kiểm tra và đồng bộ lại dữ liệu khi người dùng chuyển từ Zalo chat quay lại tab WebApp
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        hydrateAllData(activeAppsScriptUrl);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [activeAppsScriptUrl]);

  // Tự động làm mới ngầm mỗi 60 giây khi trang đang mở để số liệu điểm danh luôn tươi mới 100%
  useEffect(() => {
    const pollTimer = setInterval(() => {
      if (document.visibilityState === 'visible' && !isRefreshing) {
        hydrateAllData(activeAppsScriptUrl);
      }
    }, 60000);
    return () => clearInterval(pollTimer);
  }, [activeAppsScriptUrl, isRefreshing]);

  // Đồng bộ động tiêu đề trang và thẻ meta mô tả khi chia sẻ link theo cấu hình sự kiện
  useEffect(() => {
    if (eventConfig) {
      const pageTitle = eventConfig.eventTitle 
        ? `${eventConfig.eventTitle} - THPT Thái Nguyên` 
        : 'Hội Ngộ 20 Năm Lớp K8A1 - THPT Thái Nguyên';
      document.title = pageTitle;

      const pageDesc = eventConfig.eventSubtitle 
        ? `${eventConfig.eventSubtitle}. Trang thông tin chính thức, điểm danh và kết nối bạn bè K8A1 (2003 — 2006).`
        : 'Trang thông tin chính thức, điểm danh và đăng ký tham dự Đại lễ Kỷ niệm 20 năm ngày ra trường Lớp K8A1 (Niên khóa 2003 — 2006), Trường THPT Thái Nguyên.';

      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) metaDesc.setAttribute('content', pageDesc);

      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) ogTitle.setAttribute('content', pageTitle);

      const ogDesc = document.querySelector('meta[property="og:description"]');
      if (ogDesc) ogDesc.setAttribute('content', pageDesc);

      const twTitle = document.querySelector('meta[name="twitter:title"]');
      if (twTitle) twTitle.setAttribute('content', pageTitle);

      const twDesc = document.querySelector('meta[name="twitter:description"]');
      if (twDesc) twDesc.setAttribute('content', pageDesc);
    }
  }, [eventConfig]);

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#334155] flex flex-col items-center pb-20 selection:bg-amber-200 selection:text-amber-900 relative overflow-x-hidden font-sans">
      
      {/* 📌 THANH TIÊU ĐỀ CỐ ĐỊNH & TINH GỌN (PREMIUM FIXED NAVBAR) */}
      <header className="fixed top-0 inset-x-0 z-50 w-full backdrop-blur-md bg-[#161B26]/90 border-b border-amber-500/25 text-white shadow-md transition-all">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 h-14 sm:h-15 flex items-center justify-between">
          
          {/* Brand Logo & Class Name */}
          <a href="#hero" className="flex items-center space-x-2 sm:space-x-2.5 group">
            <div className="relative shrink-0">
              <img 
                src={eventConfig.schoolLogoUrl || "https://thpttn.tnue.edu.vn/upload/doantn/logo%20thpttn.jpg"}
                alt="Logo Trường THPT Thái Nguyên"
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover bg-white p-0.5 border border-amber-400/60 shadow-md group-hover:scale-105 transition"
                onError={(e: any) => {
                  e.target.src = '/logo-thpt-thai-nguyen.jpg';
                }}
              />
              <span className="absolute -bottom-1 -right-1 bg-gradient-to-r from-amber-600 to-amber-500 text-white text-[8px] font-bold px-1 rounded-full border border-[#161B26] font-mono leading-tight shadow-xs">
                20y
              </span>
            </div>
            <div>
              <span className="font-serif font-bold text-sm sm:text-base tracking-wide text-amber-200 group-hover:text-amber-300 transition">
                K8A1
              </span>
              <span className="text-[10px] block text-slate-300 -mt-1 font-mono">
                THPT Thái Nguyên
              </span>
            </div>
          </a>

          {/* Navigation Links & Action Buttons */}
          <nav className="flex items-center space-x-1 sm:space-x-2 text-xs font-medium">
            {/* Bạn Bè (Danh sách đã xác nhận) */}
            <a 
              href="#danh-sach-diem-danh" 
              className="hidden md:flex items-center space-x-1 text-slate-300 hover:text-amber-300 transition px-2.5 py-1.5 rounded-lg hover:bg-white/10"
              title="Danh sách bạn bè đã xác nhận"
            >
              <Users className="w-3.5 h-3.5 text-amber-400" />
              <span>Bạn Bè</span>
              {confirmedCount > 0 && (
                <span className="bg-amber-500/30 text-amber-200 text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold leading-none">
                  {confirmedCount}
                </span>
              )}
            </a>

            {/* Sổ Quỹ Lớp */}
            <a 
              href="#bank-transfer-card" 
              className="hidden md:flex items-center space-x-1 text-slate-300 hover:text-amber-300 transition px-2.5 py-1.5 rounded-lg hover:bg-white/10"
              title="Sổ quỹ lớp & Cổng đóng góp"
            >
              <Coins className="w-3.5 h-3.5 text-emerald-400" />
              <span>Quỹ Lớp</span>
            </a>

            {/* Cẩm Nang Hoạt Động & Vận Hành K8A1 */}
            <button
              type="button"
              onClick={() => handleOpenGuideModal()}
              className="flex items-center space-x-1 text-slate-300 hover:text-amber-300 transition px-2 sm:px-2.5 py-1.5 rounded-lg hover:bg-white/10 cursor-pointer"
              title="Cẩm nang hướng dẫn vận hành & nghiệp vụ K8A1"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Cẩm Nang</span>
            </button>

            {/* Background Audio Player (YouTube Audio-Only) */}
            <AudioPlayer variant="navbar" customAudioUrl="https://youtu.be/ocvlV5LZ93Q?si=V4rWQY_LKJTVDaaV" />

            {/* Live Google Sheet Realtime Sync Badge */}
            <button
              type="button"
              onClick={handleRefreshData}
              disabled={isRefreshing}
              className={`flex items-center space-x-1 sm:space-x-1.5 px-2 sm:px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all cursor-pointer shadow-xs ${
                syncStatus === 'live'
                  ? 'bg-emerald-950/70 text-emerald-300 border-emerald-500/40 hover:bg-emerald-900/80 hover:border-emerald-400'
                  : syncStatus === 'syncing'
                  ? 'bg-amber-950/70 text-amber-300 border-amber-500/40 animate-pulse'
                  : 'bg-rose-950/70 text-rose-300 border-rose-500/40 hover:bg-rose-900/80'
              }`}
              title={`Dữ liệu đồng bộ trực tiếp từ Google Sheet. Bấm để làm mới tức thì! ${lastSyncedTime ? `(Cập nhật lúc: ${lastSyncedTime})` : ''}`}
            >
              <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin text-amber-400' : syncStatus === 'live' ? 'text-emerald-400' : 'text-rose-400'}`} />
              <span className="hidden xl:inline">
                {syncStatus === 'live' ? `Google Sheet (${lastSyncedTime || 'Trực tiếp'})` : syncStatus === 'syncing' ? 'Đang nạp...' : 'Dữ liệu tạm'}
              </span>
              <span className="xl:hidden">
                {syncStatus === 'live' ? (lastSyncedTime ? lastSyncedTime.slice(0, 5) : 'Sheet') : 'Nạp'}
              </span>
            </button>

            {/* Nhận Diện Bạn Học K8A1 (Ưu Tiên 2 - Sticky Navbar Cố Định Đỉnh Trang) */}
            <NavbarIdentityBadge
              currentVisitor={activeMember}
              onSelectVisitor={handleSelectActiveMember}
              classRoster={classRoster}
              rsvpList={rsvpList}
              onOpenPassModal={(attendee) => {
                setSelectedPassAttendee(attendee);
                setIsPassModalOpen(true);
              }}
              onOpenIdentityModal={() => setIsIdentityModalOpen(true)}
            />

            {/* Primary Action Button Duy Nhất: Điểm Danh */}
            <a 
              href="#diem-danh" 
              onClick={(e) => {
                e.preventDefault();
                window.dispatchEvent(new CustomEvent('focus-diem-danh'));
              }}
              className="bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 hover:from-red-600 hover:to-rose-600 text-white px-3 sm:px-3.5 py-1.5 rounded-full font-bold shadow-md hover:shadow-lg transition transform hover:-translate-y-0.5 flex items-center space-x-1 text-xs cursor-pointer"
              title="Xác nhận tham dự họp lớp"
            >
              <CheckCircle className="w-3.5 h-3.5 text-amber-200" />
              <span>Điểm Danh</span>
            </a>

            {/* Discrete Mini Admin Button */}
            <button
              onClick={() => setIsAdminHubOpen(true)}
              className={`p-1.5 sm:p-2 rounded-full transition-all duration-200 cursor-pointer ${
                currentUserRole === 'admin'
                  ? 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-400/50 shadow-xs'
                  : currentUserRole === 'treasurer'
                  ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-400/50 shadow-xs'
                  : currentUserRole === 'bll'
                  ? 'bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 border border-indigo-400/50 shadow-xs'
                  : 'text-slate-400 hover:text-amber-300 hover:bg-white/10'
              }`}
              title={
                currentUserRole === 'admin' 
                  ? "Quản trị viên (Admin)" 
                  : currentUserRole === 'treasurer'
                  ? "Thủ Quỹ Lớp (Thu & Chi)"
                  : currentUserRole === 'bll' 
                  ? "Ban liên lạc (BLL)" 
                  : "Dành cho Ban Tổ Chức"
              }
            >
              {currentUserRole === 'admin' ? (
                <Crown className="w-3.5 h-3.5 text-amber-300" />
              ) : currentUserRole === 'treasurer' ? (
                <Coins className="w-3.5 h-3.5 text-emerald-300" />
              ) : currentUserRole === 'bll' ? (
                <Shield className="w-3.5 h-3.5 text-indigo-300" />
              ) : (
                <Lock className="w-3.5 h-3.5" />
              )}
            </button>
          </nav>
        </div>
      </header>

      {/* 📌 NÚT TRUY CẬP QUẢN TRỊ ẨN GỌN GÀNG GÓC DƯỚI (TINY DISCRETE FAB) */}
      <div className="fixed bottom-20 sm:bottom-4 right-3 sm:right-4 z-40">
        <button
          onClick={() => setIsAdminHubOpen(true)}
          className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center backdrop-blur-md shadow-xl transition-all duration-300 cursor-pointer hover:scale-110 active:scale-95 ${
            currentUserRole === 'admin'
              ? 'bg-[#1E293B] text-amber-300 border border-amber-400/60 shadow-amber-950/40 ring-1 ring-amber-400/30'
              : currentUserRole === 'treasurer'
              ? 'bg-[#1E293B] text-emerald-300 border border-emerald-400/60 shadow-emerald-950/40'
              : currentUserRole === 'bll'
              ? 'bg-[#1E293B] text-indigo-300 border border-indigo-400/60 shadow-indigo-950/40'
              : 'bg-[#1E293B]/80 hover:bg-[#1E293B] text-slate-300 hover:text-amber-300 border border-slate-700/60'
          }`}
          title={
            currentUserRole === 'admin' 
              ? "Quản trị viên (Admin)" 
              : currentUserRole === 'treasurer'
              ? "Thủ quỹ lớp (Treasurer)"
              : currentUserRole === 'bll' 
              ? "Ban liên lạc (BLL)" 
              : "Dành cho Ban Tổ Chức"
          }
        >
          {currentUserRole === 'admin' ? (
            <Crown className="w-4 h-4 text-amber-300 animate-pulse" />
          ) : currentUserRole === 'treasurer' ? (
            <Coins className="w-4 h-4 text-emerald-300" />
          ) : currentUserRole === 'bll' ? (
            <Shield className="w-4 h-4 text-indigo-300" />
          ) : (
            <Lock className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* ======================================================== */}
      {/* 🌟 PHÂN VÙNG 1: CINEMATIC FULL-WIDTH HERO COVER BANNER */}
      {/* ======================================================== */}
      <section id="hero" className="w-full relative overflow-hidden bg-[#161B26] scroll-mt-14">
        
        {/* 1. Full-Width Background Panoramic Photo or Branded Dynamic Theme */}
        <div className="absolute inset-0 z-0 overflow-hidden bg-[#161B26]">
          {heroBannerUrl ? (
            <img
              src={heroBannerUrl}
              alt="Kỷ Niệm Thanh Xuân K8A1 THPT Thái Nguyên"
              style={{ objectPosition: `center ${heroBannerPosition}%` }}
              onError={(e) => {
                // Khi ảnh lỗi hoặc link hỏng, ẩn thẻ img để hiển thị nền gradient sang trọng, không dùng link unsplash rác
                (e.target as HTMLImageElement).style.display = 'none';
              }}
              className="w-full h-full object-cover filter brightness-65 contrast-105 saturate-90 scale-102 transition-[object-position] duration-500"
            />
          ) : (
            /* Nền K8A1 Gradient & Glassmorphism sang trọng khi chưa có ảnh hoặc đang tải */
            <div className="w-full h-full bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0A0E17] relative">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,_rgba(245,158,11,0.16),transparent_50%)]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,_rgba(180,83,9,0.12),transparent_50%)]" />
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px] opacity-20" />
            </div>
          )}
          {/* Top Darkening Tint for Navbar Contrast */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-transparent pointer-events-none" />
          
          {/* Warm Golden Sepia Ambient Layer */}
          <div className="absolute inset-0 bg-gradient-to-tr from-amber-950/35 via-transparent to-rose-950/25 pointer-events-none" />
          
          {/* 🌟 CRUCIAL: Soft Gradient Fade Out to Page Cream Background (#FDFBF7) */}
          <div className="absolute inset-x-0 bottom-0 h-40 sm:h-56 bg-gradient-to-t from-[#FDFBF7] via-[#FDFBF7]/85 to-transparent pointer-events-none" />
        </div>

        {/* 2. Overlaid Hero Content (Đè nội dung lên ảnh, căn giữa trong max-w-4xl) */}
        <div className="max-w-4xl mx-auto px-4 pt-20 pb-16 sm:pt-24 sm:pb-24 md:pt-26 md:pb-28 relative z-10 space-y-6 text-left">
          
          {/* Gợi ý thông minh khi truy cập bằng trình duyệt Zalo WebView */}
          {isZaloBrowser && !isZaloTipDismissed && (
            <div className="bg-gradient-to-r from-blue-900/90 via-indigo-900/90 to-blue-950/90 border border-blue-400/40 backdrop-blur-md rounded-2xl p-3 sm:p-3.5 text-white shadow-xl flex items-center justify-between gap-3">
              <div className="flex items-start gap-2.5 text-xs sm:text-sm">
                <span className="text-base sm:text-lg shrink-0">💡</span>
                <div className="space-y-0.5">
                  <p className="font-semibold text-blue-200">
                    Bạn đang mở web trực tiếp trong Zalo
                  </p>
                  <p className="text-slate-200 text-xs leading-relaxed">
                    Nếu tải ảnh/vé chậm hoặc muốn lưu về máy mượt mà nhất, hãy bấm <strong className="text-amber-300 font-bold underline decoration-amber-300/60">[⋮]</strong> (hoặc ⋯) ở góc trên bên phải màn hình rồi chọn <strong className="text-amber-300 font-bold underline decoration-amber-300/60">"Mở bằng trình duyệt"</strong> (Safari / Chrome) nhé!
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={handleRefreshData}
                  className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl text-xs transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
                  title="Làm mới dữ liệu từ Google Sheet"
                >
                  <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
                  <span className="hidden xs:inline">Làm mới</span>
                </button>
                <button
                  onClick={() => {
                    setIsZaloTipDismissed(true);
                    try { sessionStorage.setItem('k8a1_zalo_tip_dismissed', '1'); } catch (e) {}
                  }}
                  className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                  title="Đóng thông báo"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Top Badge Strip */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="inline-flex items-center gap-2 px-3 sm:px-3.5 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-amber-400/50 text-amber-200 text-[10px] sm:text-[11px] font-sans font-bold uppercase tracking-[0.15em] shadow-md">
              <img
                src={eventConfig.schoolLogoUrl || "https://thpttn.tnue.edu.vn/upload/doantn/logo%20thpttn.jpg"}
                alt="Logo THPT Thái Nguyên"
                className="w-4 h-4 sm:w-5 sm:h-5 rounded-full object-cover bg-white p-0.5 border border-amber-300 shrink-0"
                onError={(e: any) => {
                  e.target.src = '/logo-thpt-thai-nguyen.jpg';
                }}
              />
              <span>Trường THPT Thái Nguyên • Khóa 2003 — 2006</span>
            </div>

            {/* Quick Button for Admin / BLL to change Hero Cover Banner */}
            {(currentUserRole === 'admin' || currentUserRole === 'bll') && (
              <button
                type="button"
                onClick={() => handleOpenAdminHub('media', 'banner')}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-black/60 hover:bg-black/80 text-amber-300 border border-amber-400/60 rounded-full text-[10px] font-sans font-bold cursor-pointer transition backdrop-blur-md shadow-md hover:scale-105"
                title="Đổi ảnh bìa banner đầu trang (Dành cho Ban Liên Lạc & Admin)"
              >
                <Camera className="w-3 h-3 text-amber-400" />
                <span>Đổi Ảnh Bìa</span>
              </button>
            )}
          </div>

          {/* Main Title & Subtitle */}
          <div className="space-y-2 max-w-2xl text-left">
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-serif text-white font-black tracking-tight leading-[1.1] drop-shadow-lg">
              {eventConfig.eventTitle || "20 Năm Ngày Trở Về"}
              <span className="block text-xl sm:text-2xl md:text-3xl font-serif font-medium italic text-amber-300 mt-1.5 drop-shadow-md">
                {eventConfig.eventSubtitle || "Lớp K8A1 — Trường THPT Thái Nguyên"}
              </span>
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-slate-100 font-serif italic leading-relaxed pt-1 drop-shadow-md max-w-xl">
              “Hai mươi năm — một chặng đường đủ dài để trưởng thành, nhưng chỉ cần gặp lại bạn bè là thanh xuân tuổi 18 lại bừng sáng vẹn nguyên.”
            </p>
          </div>

          {/* Compact Event Boarding Pass Strip (Glass Card) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 p-3 sm:p-4 rounded-xl bg-[#1E293B]/80 border border-amber-300/40 backdrop-blur-md text-white text-xs shadow-xl max-w-2xl">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shrink-0">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-sans tracking-wider text-amber-200/90 font-bold">Thời gian hội ngộ</p>
                <p className="font-serif font-bold text-white text-xs sm:text-sm">{eventConfig.eventDateText}</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-sans tracking-wider text-amber-200/90 font-bold">Địa điểm gặp mặt</p>
                <p className="font-serif font-bold text-white text-xs sm:text-sm">
                  {eventConfig.enableTwoVenues ? (
                    <span>
                      Chặng 1: {eventConfig.shortAddress || eventConfig.venueName} <span className="text-amber-300 mx-1">➔</span> Chặng 2: {eventConfig.venue2ShortAddress || eventConfig.venue2Name || 'Prime'}
                    </span>
                  ) : (
                    <span>{eventConfig.venueName} {eventConfig.shortAddress ? `(${eventConfig.shortAddress})` : ''}</span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Primary Action Buttons & Quick Jump Pills in Hero */}
          <div className="pt-1 space-y-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('focus-diem-danh'));
                }}
                className="inline-flex items-center gap-2 px-6 sm:px-8 py-3.5 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-white font-sans font-bold text-xs sm:text-sm uppercase tracking-wider rounded-xl shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer border border-amber-300/40"
              >
                <CheckCircle className="w-4 h-4 text-amber-100" />
                <span>Xác Nhận Tham Dự Ngay</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  document.getElementById('danh-sach-diem-danh')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-2 px-4 sm:px-5 py-3.5 bg-white/10 hover:bg-white/20 text-white font-sans font-semibold text-xs sm:text-sm rounded-xl border border-white/20 backdrop-blur-md transition-all cursor-pointer shadow-md hover:scale-105 active:scale-95"
              >
                <Users className="w-4 h-4 text-amber-300" />
                <span>Xem Bạn Bè ({confirmedCount})</span>
              </button>

              <button
                type="button"
                onClick={() => setIsZaloShareModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 sm:px-5 py-3.5 bg-gradient-to-r from-blue-600/90 to-indigo-600/90 hover:from-blue-600 hover:to-indigo-600 text-white font-sans font-semibold text-xs sm:text-sm rounded-xl border border-blue-400/40 backdrop-blur-md transition-all cursor-pointer shadow-md hover:scale-105 active:scale-95"
                title="Tạo ảnh infographic bản tin hội ngộ sắc nét để chia sẻ lên nhóm lớp"
              >
                <Camera className="w-4 h-4 text-blue-200" />
                <span>Tạo Poster Nhóm Lớp</span>
              </button>

              <QuickShare 
                variant="pill"
                eventConfig={eventConfig}
                buttonText="Chia sẻ tới nhóm lớp"
                className="!py-3 !px-4.5 !bg-amber-400/15 hover:!bg-amber-400/25 !text-amber-200 !border-amber-400/40 backdrop-blur-md !rounded-xl !text-xs sm:!text-sm hover:scale-105 active:scale-95"
              />
            </div>

            {/* Quick Jump Ribbon Pills within Hero */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] font-sans">
              <span className="text-slate-300/80 font-medium">Chuyển nhanh tới:</span>
              <button
                type="button"
                onClick={() => setIsIdentityModalOpen(true)}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/25 hover:bg-amber-500/40 text-amber-200 hover:text-white border border-amber-400/60 backdrop-blur-md transition cursor-pointer font-medium"
                title="Bấm để chọn tên bạn trong danh sách 65 bạn học K8A1"
              >
                <GraduationCap className="w-3 h-3 text-amber-300" />
                <span>{activeMember ? activeMember.fullName : 'Chọn Tên Bạn'}</span>
              </button>
              <button
                type="button"
                onClick={() => document.getElementById('dia-diem')?.scrollIntoView({ behavior: 'smooth' })}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-black/40 hover:bg-black/60 text-slate-200 hover:text-amber-300 border border-white/10 hover:border-amber-400/50 backdrop-blur-md transition cursor-pointer"
              >
                <MapPin className="w-3 h-3 text-amber-400" />
                <span>Địa Điểm Họp Lớp</span>
              </button>
              <button
                type="button"
                onClick={() => document.getElementById('bank-transfer-card')?.scrollIntoView({ behavior: 'smooth' })}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-black/40 hover:bg-black/60 text-slate-200 hover:text-amber-300 border border-white/10 hover:border-amber-400/50 backdrop-blur-md transition cursor-pointer"
              >
                <Coins className="w-3 h-3 text-emerald-400" />
                <span>Sổ Quỹ Lớp</span>
              </button>
              {teachersList.length > 0 && (
                <button
                  type="button"
                  onClick={() => document.getElementById('thay-co')?.scrollIntoView({ behavior: 'smooth' })}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-black/40 hover:bg-black/60 text-slate-200 hover:text-amber-300 border border-white/10 hover:border-amber-400/50 backdrop-blur-md transition cursor-pointer"
                >
                  <GraduationCap className="w-3 h-3 text-amber-400" />
                  <span>Quý Thầy Cô ({teachersList.length})</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => document.getElementById('ky-uc')?.scrollIntoView({ behavior: 'smooth' })}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-black/40 hover:bg-black/60 text-slate-200 hover:text-amber-300 border border-white/10 hover:border-amber-400/50 backdrop-blur-md transition cursor-pointer"
              >
                <Camera className="w-3 h-3 text-amber-400" />
                <span>Thước Phim & Kỷ Niệm</span>
              </button>
              <button
                type="button"
                onClick={() => document.getElementById('invitation-letter-card')?.scrollIntoView({ behavior: 'smooth' })}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-black/40 hover:bg-black/60 text-slate-200 hover:text-amber-300 border border-white/10 hover:border-amber-400/50 backdrop-blur-md transition cursor-pointer"
              >
                <MailOpen className="w-3 h-3 text-rose-400" />
                <span>Bức Thư Ngỏ</span>
              </button>
              <button
                type="button"
                onClick={() => handleOpenGuideModal()}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/20 hover:bg-amber-500/35 text-amber-200 hover:text-amber-100 border border-amber-400/50 backdrop-blur-md transition cursor-pointer font-medium"
              >
                <BookOpen className="w-3 h-3 text-amber-300" />
                <span>Cẩm Nang Hoạt Động</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <main className="w-full max-w-4xl px-3 sm:px-4 -mt-6 sm:-mt-8 md:-mt-10 relative z-20 space-y-8 sm:space-y-10">
        
        {showLegacyAdminPanel ? (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-5"
          >
            <div className="bg-white p-4 rounded-xl border border-amber-200 text-center space-y-1 shadow-sm">
              <h2 className="text-lg font-bold text-[#1E293B]">⚙️ Cấu Hình Kết Nối Google Apps Script</h2>
              <p className="text-xs text-slate-500">Dành cho Ban Tổ Chức đồng bộ danh sách điểm danh và lưu bút về Google Sheet</p>
            </div>
            <DeveloperGuide 
              currentUrl={activeAppsScriptUrl}
              appsScriptUrl={activeAppsScriptUrl} 
              onSaveUrl={(url) => {
                setAppsScriptUrl(url);
                localStorage.setItem('apps_script_url', url);
                if (url) {
                  hydrateAllData(url);
                }
              }}
              onResetUrl={() => {
                setAppsScriptUrl('');
                localStorage.removeItem('apps_script_url');
              }}
            />
          </motion.div>
        ) : (
          <div className="space-y-8 sm:space-y-9">

            {/* MODULE ĐẾM NGƯỢC THỜI GIAN */}
            <div className="pt-0.5">
              <CountdownTimer 
                targetDate={eventConfig.countdownTarget} 
                eventDateText={eventConfig.eventDateText}
                venueName={eventConfig.venueName}
                eventTimeText={eventConfig.eventTimeText}
                eventTitle={eventConfig.eventTitle}
              />
            </div>

            {/* KHỐI TÌNH HÌNH BẠN BÈ ĐIỂM DANH HỌP LỚP (GẦN GŨI, ĐỜI THƯỜNG) */}
            <ClassGatheringCounter
              rsvpList={rsvpList}
              classRoster={classRoster}
              activeMember={activeMember}
              isSyncing={isRefreshing}
              onOpenZaloShareModal={() => setIsZaloShareModalOpen(true)}
            />

            {/* 📜 BỨC THƯ NGỎ & THIỆP MỜI DẠ TIỆC (DOUBLE GOLD FOIL & WAX SEAL) */}
            <div 
              id="invitation-letter-card" 
              className="bg-[#FFFEFA] border-[3px] border-double border-amber-500/60 rounded-xl p-6 sm:p-9 md:p-12 shadow-xl relative overflow-hidden text-left space-y-6"
            >
              {/* Classical Ornate Corner Accents */}
              <div className="absolute top-2.5 left-2.5 w-6 h-6 border-t-2 border-l-2 border-amber-600/80 pointer-events-none" />
              <div className="absolute top-2.5 right-2.5 w-6 h-6 border-t-2 border-r-2 border-amber-600/80 pointer-events-none" />
              <div className="absolute bottom-2.5 left-2.5 w-6 h-6 border-b-2 border-l-2 border-amber-600/80 pointer-events-none" />
              <div className="absolute bottom-2.5 right-2.5 w-6 h-6 border-b-2 border-r-2 border-amber-600/80 pointer-events-none" />

              {/* Red Wax Seal Badge in Top Right (Con Dấu Sáp Đỏ K8A1 20 Năm) */}
              <div className="absolute -top-3 right-6 sm:right-10 z-20 pointer-events-none">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-[#8B1E2D] via-[#701524] to-[#4A0D17] shadow-2xl border-2 border-amber-400/80 flex flex-col items-center justify-center text-white text-center select-none transform rotate-6">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300 mb-0.5" />
                  <span className="text-[10px] sm:text-xs font-serif font-black tracking-widest text-amber-200 uppercase">K8A1</span>
                  <span className="text-[7px] sm:text-[8px] font-sans font-bold tracking-wider text-amber-300/90 uppercase">20 NĂM</span>
                </div>
              </div>

              {/* Decorative background watermark */}
              <div className="absolute -right-6 -bottom-8 text-amber-600/5 pointer-events-none select-none">
                <Quote className="w-48 h-48" />
              </div>

              {/* Letter Header */}
              <div className="space-y-1.5 border-b border-amber-300/60 pb-4 relative z-10">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] uppercase tracking-widest font-sans font-bold text-amber-800 block">
                    Thư Ngỏ Họp Lớp 20 Năm (2003 — 2006)
                  </span>

                  {(currentUserRole === 'admin' || currentUserRole === 'bll') && (
                    <button
                      type="button"
                      onClick={() => handleOpenAdminHub('settings')}
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-100/70 hover:bg-amber-200/80 text-amber-900 text-[10px] font-sans font-bold rounded-full border border-amber-300 transition cursor-pointer shrink-0"
                      title="Dành cho Ban Liên Lạc & Admin: Chỉnh sửa lời ngỏ thiệp mời"
                    >
                      <Edit3 className="w-3 h-3 text-amber-700" />
                      <span>Sửa Lời Ngỏ & Địa Điểm</span>
                    </button>
                  )}
                </div>
                
                <h2 className="text-xl sm:text-2xl font-serif text-[#1E293B] font-bold tracking-tight">
                  {eventConfig.letterTitle || "Lời Ngỏ Thân Tình Gửi Bạn Tôi — Lớp K8A1"}
                </h2>
                <p className="text-xs text-slate-500 font-serif italic">
                  {eventConfig.letterSubtitle || "Hai mươi năm một chặng đường — Nơi ký ức thanh xuân THPT Thái Nguyên mãi vẹn nguyên"}
                </p>
              </div>

              {/* Letter Body */}
              <div className="text-sm sm:text-base md:text-lg text-slate-700 leading-relaxed space-y-4 font-serif relative z-10">
                <p className="italic text-slate-800 first-letter:text-4xl sm:first-letter:text-5xl first-letter:font-bold first-letter:text-amber-600 first-letter:mr-2.5 first-letter:float-left first-letter:leading-none whitespace-pre-line">
                  {eventConfig.letterParagraph1}
                </p>

                {/* Golden Ticket Style Callout */}
                <div className="my-4 p-4 sm:p-6 bg-gradient-to-r from-[#FAF3E0] via-[#FFFDF5] to-[#FAF3E0] border-2 border-dashed border-amber-500/70 rounded-xl shadow-xs font-sans relative">
                  <div className="flex items-center gap-2 text-amber-900 font-bold text-xs uppercase tracking-wider mb-2">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <span>Hẹn Ngày Trở Về: {eventConfig.eventDateText}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs text-slate-800">
                    <div className="flex items-start gap-2">
                      <Clock className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                      <div>
                        <p className="font-bold text-slate-900">Thời gian đón tiếp:</p>
                        <p className="text-slate-600">{eventConfig.eventTimeText || 'Từ 08:30 sáng đến 15:30 chiều'}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900">Địa điểm họp mặt:</p>
                        {eventConfig.enableTwoVenues ? (
                          <div className="text-slate-600 text-xs space-y-1 mt-0.5">
                            <div>
                              <span className="font-semibold text-amber-900 bg-amber-100/80 px-1.5 py-0.5 rounded text-[11px] mr-1">Chặng 1 ({eventConfig.venueTime || '08:30 — 11:00'})</span>
                              <span>{eventConfig.venueName} — {eventConfig.shortAddress || eventConfig.venueAddress}</span>
                            </div>
                            <div>
                              <span className="font-semibold text-rose-900 bg-rose-100/80 px-1.5 py-0.5 rounded text-[11px] mr-1">Chặng 2 ({eventConfig.venue2Time || '11:30 — 15:30'})</span>
                              <span>{eventConfig.venue2Name} — {eventConfig.venue2ShortAddress || eventConfig.venue2Address}</span>
                            </div>
                          </div>
                        ) : (
                          <p className="text-slate-600">
                            {eventConfig.venueName} {eventConfig.shortAddress ? `(${eventConfig.shortAddress})` : ''}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <p className="italic text-slate-800 whitespace-pre-line">
                  {eventConfig.letterParagraph2}
                </p>
              </div>

              {/* Primary CTA & Signature */}
              <div className="pt-4 border-t border-amber-400/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      window.dispatchEvent(new CustomEvent('focus-diem-danh'));
                    }}
                    className="inline-flex items-center gap-2 px-5 py-3 bg-[#1E293B] hover:bg-amber-600 text-white text-xs sm:text-sm font-sans font-bold uppercase tracking-wider rounded-lg shadow-md transition-all duration-300 hover:scale-105 cursor-pointer"
                  >
                    <CheckCircle className="w-4 h-4 text-amber-400" />
                    <span>Xác Nhận Tham Dự Ngay</span>
                  </button>
                </div>

                <div className="text-left sm:text-right space-y-0.5">
                  <p className="text-[11px] font-sans font-bold uppercase tracking-wider text-amber-800">
                    {eventConfig.letterSignatureTitle || "Ban Liên Lạc Lớp K8A1 (Khóa 8)"}
                  </p>
                  <p className="text-xs font-serif italic text-slate-500">
                    {eventConfig.letterSignatureSubtitle || "Trường THPT Thái Nguyên (2003 — 2006)"}
                  </p>
                </div>
              </div>
            </div>

            {/* ======================================================== */}
            {/* 📍 PHÂN VÙNG 2: ĐỊA ĐIỂM TỔ CHỨC HỌP LỚP K8A1 */}
            {/* ======================================================== */}
            <AlumniConvergenceMap
              eventConfig={eventConfig}
            />

            {/* ======================================================== */}
            {/* 🎟️ PHÂN VÙNG 3: ĐIỂM DANH & THÀNH VIÊN VÀ QUỸ LỚP */}
            {/* ======================================================== */}
            <section id="diem-danh" className="space-y-6 scroll-mt-20">
              {/* Form Điểm Danh */}
              <RsvpForm 
                appsScriptUrl={activeAppsScriptUrl} 
                rsvpList={rsvpList} 
                eventConfig={eventConfig}
                classRoster={classRoster}
                activeMember={activeMember}
                onSelectActiveMember={handleSelectActiveMember}
                onAddRsvp={handleAddRsvp} 
                onOpenPassModal={handleOpenPass}
                onOpenReceiptModal={handleOpenReceiptModal}
              />

              {/* Danh Sách Thành Viên Đã Xác Nhận */}
              <div id="danh-sach-diem-danh" className="scroll-mt-20">
                <ConfirmedAttendees
                  appsScriptUrl={activeAppsScriptUrl}
                  rsvpList={rsvpList}
                  eventConfig={eventConfig}
                  onRefresh={handleRefreshData}
                  isRefreshing={isRefreshing}
                  onOpenPassModal={handleOpenPass}
                  onOpenReceiptModal={handleOpenReceiptModal}
                />
              </div>

              {/* Thông Tin Quỹ Lớp Minh Bạch */}
              <BankTransfer 
                bankName={eventConfig.bankName}
                bankAccount={eventConfig.bankAccount}
                bankHolder={eventConfig.bankHolder}
                transferSyntax={eventConfig.transferSyntax}
                fundAmount={eventConfig.fundAmountPerPerson}
                customQrUrl={eventConfig.customQrUrl}
                bankCode={eventConfig.bankCode}
                qrTemplate={eventConfig.qrTemplate}
                appsScriptUrl={activeAppsScriptUrl}
                rsvpList={rsvpList}
                expenses={expenses}
                incomes={incomes}
                activeMember={activeMember}
                currentUserRole={currentUserRole}
                onDeleteIncome={handleDeleteIncome}
                onRefreshData={() => hydrateAllData(activeAppsScriptUrl)}
                onOpenReceiptModal={handleOpenReceiptModal}
                onOpenCharterModal={() => setIsCharterModalOpen(true)}
                onUpdateRsvpList={handleUpdateRsvpList}
              />
            </section>

            {/* ======================================================== */}
            {/* 🎓 PHÂN VÙNG 4: TRI ÂN QUÝ THẦY CÔ GIÁO K8A1 */}
            {/* ======================================================== */}
            <TeachersHonorRoll
              teachers={teachersList}
            />

            {/* ======================================================== */}
            {/* 🎞️ PHÂN VÙNG 5: KHO KÝ ỨC THANH XUÂN K8A1 */}
            {/* ======================================================== */}
            <section id="ky-uc" className="space-y-6 scroll-mt-20">
              <MemoryCorner 
                appsScriptUrl={activeAppsScriptUrl} 
                images={images} 
                videos={videos} 
                onAddImage={handleAddImage} 
              />
            </section>

            {/* ======================================================== */}
            {/* ☕ FOOTER: LỜI KẾT ẤM ÁP & THÔNG TIN HỌP LỚP K8A1 */}
            {/* ======================================================== */}
            <footer className="mt-14 pt-8 pb-8 border border-amber-200/80 bg-[#FAF7F2] rounded-3xl p-6 sm:p-8 shadow-xs text-xs text-slate-600">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 pb-6 border-b border-amber-200/60">
                {/* Cột 1: Thông tin Lớp & Tâm tình */}
                <div className="space-y-2.5">
                  <div className="flex items-center gap-3">
                    <img 
                      src={eventConfig.schoolLogoUrl || "https://thpttn.tnue.edu.vn/upload/doantn/logo%20thpttn.jpg"}
                      alt="Logo Trường THPT Thái Nguyên"
                      className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover bg-white p-0.5 border border-amber-300 shadow-xs shrink-0"
                      onError={(e: any) => {
                        e.target.src = '/logo-thpt-thai-nguyen.jpg';
                      }}
                    />
                    <div>
                      <h4 className="font-bold text-[#1E293B] font-serif text-sm sm:text-base">
                        Lớp K8A1 — Trường THPT Thái Nguyên
                      </h4>
                      <p className="text-[11px] text-amber-800/80 font-serif">
                        Niên khóa 2003 — 2006 • 20 Năm Ngày Trở Về
                      </p>
                    </div>
                  </div>
                  <p className="font-serif italic text-slate-600 text-xs leading-relaxed">
                    “20 năm bôn ba muôn phương, khi về lại K8A1 — ta mãi là những cô cậu học trò tuổi 18.”
                  </p>
                </div>

                {/* Cột 2: Thời gian & Địa điểm */}
                <div className="space-y-2">
                  <h4 className="font-bold text-[#1E293B] font-serif text-sm flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-amber-700" />
                    Thời Gian & Địa Điểm
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-600">
                    <li className="flex items-start gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                      <span>{eventConfig.eventDateText || "Chủ Nhật, 27/09/2026 (08:30 — 15:30)"}</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-slate-800 font-medium">{eventConfig.venueName || "TP. Thái Nguyên"}</strong>
                        {eventConfig.venueAddress ? (
                          <>
                            <br />
                            <span className="text-[11px] text-slate-500">{eventConfig.venueAddress}</span>
                          </>
                        ) : null}
                      </span>
                    </li>
                  </ul>
                </div>

                {/* Cột 3: Ban Liên Lạc & Hỗ trợ */}
                <div className="space-y-2">
                  <h4 className="font-bold text-[#1E293B] font-serif text-sm flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-amber-700" />
                    Ban Liên Lạc & Đón Tiếp
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Bạn bè từ xa về cần hỗ trợ đón tiếp, phương tiện hay lưu trú xin liên hệ Ban Liên Lạc để được sắp xếp chu đáo nhất.
                  </p>
                  <div className="pt-1 flex flex-wrap gap-2 text-[11px]">
                    <a 
                      href={eventConfig.venueAddress 
                        ? `https://maps.google.com/?q=${encodeURIComponent(eventConfig.venueAddress)}` 
                        : (eventConfig.venueName 
                          ? `https://maps.google.com/?q=${encodeURIComponent(eventConfig.venueName)}` 
                          : "https://maps.google.com/?q=Thai+Nguyen")}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-amber-200 text-amber-900 hover:bg-amber-50 hover:border-amber-300 transition-colors font-medium shadow-2xs"
                    >
                      <MapPin className="w-3 h-3 text-amber-700" />
                      Chỉ đường Google Maps
                    </a>
                    <button
                      type="button"
                      onClick={() => setIsCharterModalOpen(true)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-amber-200 text-amber-900 hover:bg-amber-50 hover:border-amber-300 transition-colors font-medium shadow-2xs cursor-pointer"
                    >
                      <ScrollText className="w-3 h-3 text-amber-700" />
                      Quy chế & Điều lệ lớp
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenGuideModal()}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-amber-200 text-amber-900 hover:bg-amber-50 hover:border-amber-300 transition-colors font-medium shadow-2xs cursor-pointer"
                    >
                      <BookOpen className="w-3 h-3 text-amber-700" />
                      Cẩm nang K8A1
                    </button>
                    <QuickShare 
                      variant="secondary"
                      eventConfig={eventConfig}
                      buttonText="Chia sẻ link"
                      className="!rounded-lg !border-amber-200 !text-amber-900 hover:!bg-amber-50 shadow-2xs font-medium !text-[11px] !px-2.5 !py-1"
                    />
                  </div>
                </div>
              </div>

              {/* Dòng đáy: Copyright & ViewCounter */}
              <div className="pt-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left text-[11px] text-slate-500">
                <p>
                  © 2006 — 2026 <span className="font-medium text-slate-700">Lớp K8A1</span> (Khóa 2003 — 2006) • Trường THPT Thái Nguyên
                </p>
                <div>
                  <ViewCounter appsScriptUrl={activeAppsScriptUrl} />
                </div>
              </div>
            </footer>

          </div>
        )}

      </main>

      {/* 👑 XÁC THỰC MÃ PIN QUẢN TRỊ (BẢO MẬT QUA GOOGLE APPS SCRIPT BACKEND) */}
      {isAdminHubOpen && currentUserRole === 'guest' && (
        <PinAuthModal
          isOpen={isAdminHubOpen}
          onClose={() => setIsAdminHubOpen(false)}
          appsScriptUrl={activeAppsScriptUrl}
          onSuccess={(role) => {
            setCurrentUserRole(role);
            sessionStorage.setItem('user_role', role);
            hydrateAllData(activeAppsScriptUrl);
          }}
        />
      )}

      {/* 👑 BẢNG ĐIỀU KHIỂN QUẢN TRỊ & ĐỐI SOÁT TOÀN DIỆN (ADMIN & BAN LIÊN LẠC) */}
      {isAdminHubOpen && currentUserRole !== 'guest' && (
        <AdminManagementHub
          isOpen={isAdminHubOpen}
          onClose={() => setIsAdminHubOpen(false)}
          currentUserRole={currentUserRole}
          activeMember={isOfficialBLLMember(activeMember) ? activeMember : null}
          initialTab={adminHubInitialTab}
          initialMediaSubTab={adminHubInitialMediaSubTab}
          onLoginSuccess={(role) => {
            setCurrentUserRole(role);
            sessionStorage.setItem('user_role', role);
            hydrateAllData(activeAppsScriptUrl);
          }}
          onLogout={() => {
            setCurrentUserRole('guest');
            sessionStorage.removeItem('user_role');
            sessionStorage.removeItem('admin_pin_token');
            hydrateAllData(activeAppsScriptUrl);
          }}
          rsvpList={rsvpList}
          onUpdateRsvpList={handleUpdateRsvpList}
          classRoster={classRoster}
          onUpdateClassRoster={handleUpdateClassRoster}
          wishesList={wishesList}
          onUpdateWishesList={(updated) => {
            setWishesList(updated);
            localStorage.setItem('wishes_list', JSON.stringify(updated));
          }}
          images={images}
          onUpdateImages={(updated) => {
            const userOnly = updated.filter(i => i.isUserUploaded);
            setImages(updated);
            try {
              localStorage.setItem('uploaded_images', JSON.stringify(userOnly));
            } catch (e) {}
            syncToBackend('save_media', { photos: userOnly, videos, venueMedia: venueMediaList });
          }}
          videos={videos}
          onUpdateVideos={handleUpdateVideos}
          venueMediaList={venueMediaList}
          onUpdateVenueMediaList={handleUpdateVenueMedia}
          heroBannerUrl={heroBannerUrl}
          heroBannerPosition={heroBannerPosition}
          onUpdateHeroBannerUrl={handleUpdateHeroBanner}
          eventConfig={eventConfig}
          onUpdateEventConfig={handleUpdateEventConfig}
          appsScriptUrl={activeAppsScriptUrl}
          expenses={expenses}
          onAddExpense={handleAddExpense}
          onUpdateExpense={handleUpdateExpense}
          onDeleteExpense={handleDeleteExpense}
          onSaveAllExpenses={handleSaveAllExpenses}
          incomes={incomes}
          onAddIncome={handleAddIncome}
          onUpdateIncome={handleUpdateIncome}
          onDeleteIncome={handleDeleteIncome}
          onSaveAllIncomes={handleSaveAllIncomes}
          teachersList={teachersList}
          onAddTeacher={handleAddTeacher}
          onUpdateTeacher={handleUpdateTeacher}
          onDeleteTeacher={handleDeleteTeacher}
          onSaveAllTeachers={handleSaveAllTeachers}
          onSaveAppsScriptUrl={(url) => {
            setAppsScriptUrl(url);
            if (url) {
              localStorage.setItem('apps_script_url', url);
              hydrateAllData(url);
            } else {
              localStorage.removeItem('apps_script_url');
            }
          }}
          onRefreshData={handleRefreshData}
          onOpenPassModal={handleOpenPass}
          onOpenGuideModal={() => handleOpenGuideModal(
            currentUserRole === 'admin' 
              ? 'admin' 
              : currentUserRole === 'treasurer' 
              ? 'treasurer' 
              : currentUserRole === 'bll' 
              ? 'bll' 
              : 'member'
          )}
        />
      )}

      {/* Thẻ Học Sinh Kỷ Niệm (Digital Souvenir Pass) */}
      <StudentPassModal
        isOpen={isPassModalOpen}
        onClose={() => setIsPassModalOpen(false)}
        defaultAttendee={selectedPassAttendee}
        allAttendees={rsvpList}
        classRoster={classRoster}
        activeMember={activeMember}
        eventConfig={eventConfig}
      />

      {/* Modal Tải Lên Biên Lai Đóng Quỹ (Self-Service Receipt Uploader) */}
      <ReceiptUploadModal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        appsScriptUrl={activeAppsScriptUrl}
        rsvpList={rsvpList}
        classRoster={classRoster}
        eventConfig={eventConfig}
        defaultAttendee={selectedReceiptAttendee}
        onUpdateRsvpList={handleUpdateRsvpList}
        incomes={incomes}
        onAddIncome={handleAddIncome}
      />

      {/* Sổ Tay Quy Chế Tổ Chức & Hoạt Động Lớp K8A1 */}
      <ClassCharterModal
        isOpen={isCharterModalOpen}
        onClose={() => setIsCharterModalOpen(false)}
      />

      {/* 📖 CẨM NANG HƯỚNG DẪN VẬN HÀNH & QUẢN LÝ HOẠT ĐỘNG K8A1 */}
      <RoleGuideModal
        isOpen={isGuideModalOpen}
        onClose={() => setIsGuideModalOpen(false)}
        currentUserRole={currentUserRole}
        initialTab={guideInitialTab}
        onOpenAuthModal={() => {
          setIsAdminHubOpen(true);
        }}
        onNavigateToSection={(sectionId) => {
          setTimeout(() => {
            const el = document.getElementById(sectionId);
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }, 100);
        }}
        onOpenCharterModal={() => setIsCharterModalOpen(true)}
        onOpenAdminHub={(tab) => {
          handleOpenAdminHub(tab || 'members');
        }}
      />

      {/* 🚀 THANH ĐIỀU HƯỚNG NỔI THÔNG MINH & BACK TO TOP */}
      <QuickNavigation 
        confirmedCount={confirmedCount} 
        hasTeachers={teachersList.length > 0} 
        activeMember={activeMember}
        onOpenIdentityModal={() => setIsIdentityModalOpen(true)}
        onOpenZaloShareModal={() => setIsZaloShareModalOpen(true)}
      />

      {/* 🎓 BẢNG DANH BẠ 65 BẠN HỌC K8A1 (CHỌN TÊN ĐỂ NHẬN DIỆN & CÁ NHÂN HÓA) */}
      <IdentitySelectorModal
        isOpen={isIdentityModalOpen}
        onClose={() => setIsIdentityModalOpen(false)}
        classRoster={classRoster}
        rsvpList={rsvpList}
        currentVisitor={activeMember}
        onSelect={(member) => {
          handleSelectActiveMember(member);
          setIsIdentityModalOpen(false);
        }}
      />

      {/* 📸 MODAL TẠO POSTER BẢN TIN HỘI NGỘ K8A1 */}
      <ZaloShareInfographicsModal
        isOpen={isZaloShareModalOpen}
        onClose={() => setIsZaloShareModalOpen(false)}
        rsvpList={rsvpList}
        classRoster={classRoster}
        eventConfig={eventConfig}
        activeMember={activeMember}
        appsScriptUrl={activeAppsScriptUrl}
        onRefreshData={() => hydrateAllData(activeAppsScriptUrl)}
      />

      {/* Toast thông báo realtime */}
      <ActivityToastManager
        rsvpList={rsvpList}
        wishesList={wishesList}
        latestAction={latestAction}
        onClearLatestAction={() => setLatestAction(null)}
      />
    </div>
  );
}
