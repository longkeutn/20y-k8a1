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
  Music,
  Edit3
} from 'lucide-react';

import { UserRole, RsvpData, MemoryImage, MemoryVideo, WishData, ActivityToast, VenueMediaItem, EventConfig, ClassMember } from './types';
import { INITIAL_RSVP_LIST, INITIAL_WISHES_LIST, DEFAULT_MEMORIES, DEFAULT_VIDEOS, DEFAULT_EVENT_CONFIG, DEFAULT_APPS_SCRIPT_URL, CLASS_ROSTER_K8A1, normalizeImageUrl } from './data';
import { DEFAULT_VENUE_MEDIA } from './components/AlumniConvergenceMap';

import AudioPlayer from './components/AudioPlayer';
import CountdownTimer from './components/CountdownTimer';
import RsvpForm from './components/RsvpForm';
import ConfirmedAttendees from './components/ConfirmedAttendees';
import BankTransfer from './components/BankTransfer';
import WishesGuestbook from './components/WishesGuestbook';
import MemoryCorner from './components/MemoryCorner';
import AlumniConvergenceMap from './components/AlumniConvergenceMap';
import ViewCounter from './components/ViewCounter';
import ActivityToastManager from './components/ActivityToastManager';
import QuickShare from './components/QuickShare';
import DeveloperGuide from './components/DeveloperGuide';
import StudentPassModal from './components/StudentPassModal';
import AdminManagementHub from './components/AdminManagementHub';
import ReceiptUploadModal from './components/ReceiptUploadModal';

export default function App() {
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
    venueAddress: String(cfg?.venueAddress || DEFAULT_EVENT_CONFIG.venueAddress),
    shortAddress: String(cfg?.shortAddress || DEFAULT_EVENT_CONFIG.shortAddress),
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
    heroBannerPosition: cfg?.heroBannerPosition !== undefined ? (Number(cfg.heroBannerPosition) || 50) : 50
  });

  // Dynamic Event Configuration State (Venue, Date, Letter, Bank Account)
  const [eventConfig, setEventConfig] = useState<EventConfig>(() => {
    try {
      const saved = localStorage.getItem('k8a1_event_config');
      if (saved) {
        const parsed = JSON.parse(saved);
        return sanitizeEventConfig(parsed);
      }
    } catch {}
    return DEFAULT_EVENT_CONFIG;
  });

  // Hàm đồng bộ dữ liệu trực tiếp lên Google Sheet Backend
  const syncToBackend = async (action: string, payload: any) => {
    if (!activeAppsScriptUrl || !activeAppsScriptUrl.startsWith('http')) return;
    try {
      await fetch(activeAppsScriptUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action,
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

  // User Role (RBAC): 'guest' | 'bll' | 'admin'
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>(() => {
    try {
      const saved = sessionStorage.getItem('user_role');
      if (saved === 'admin' || saved === 'bll') return saved;
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

  // Hero Banner Cover Image URL & Vertical Position State (0% - 100%)
  const [heroBannerUrl, setHeroBannerUrl] = useState<string>(() => {
    try {
      return localStorage.getItem('k8a1_hero_banner_url') || 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1600&q=80';
    } catch {
      return 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1600&q=80';
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
    fullName: String(item.fullName || ''),
    phone: String(item.phone || ''),
    nickname: item.nickname ? String(item.nickname) : '',
    className: item.className ? String(item.className) : 'K8A1',
    shirtSize: item.shirtSize ? String(item.shirtSize) : 'L',
    status: item.status === 'no' ? 'no' : 'yes',
    message: item.message ? String(item.message) : '',
    submittedAt: item.submittedAt ? String(item.submittedAt) : '',
    checkedIn: Boolean(item.checkedIn),
    fundStatus: item.fundStatus || 'unpaid',
    fundAmount: Number(item.fundAmount) || 0,
    fundReceiptUrl: item.fundReceiptUrl ? String(item.fundReceiptUrl) : '',
    fundNote: item.fundNote ? String(item.fundNote) : '',
    fundAuditedBy: item.fundAuditedBy ? String(item.fundAuditedBy) : '',
    fundPaidAt: item.fundPaidAt ? String(item.fundPaidAt) : ''
  });

  // Helper chuẩn hóa dữ liệu học sinh danh bạ lớp, chống crash do dữ liệu dạng số từ Google Sheet
  const sanitizeClassMember = (item: any, idx: number): ClassMember => ({
    id: item.id ? String(item.id) : ('m' + (idx < 9 ? '0' + (idx + 1) : (idx + 1))),
    fullName: String(item.fullName || '').trim(),
    nickname: item.nickname ? String(item.nickname).trim() : '',
    phone: item.phone ? String(item.phone).trim() : '',
    role: item.role ? String(item.role).trim() : 'Thành viên',
    gender: (item.gender === 'female' || String(item.gender).toLowerCase().includes('nữ')) ? 'female' : 'male',
    shirtSize: item.shirtSize ? String(item.shirtSize).trim().toUpperCase() : 'L',
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
    // Ghi trực tiếp lên Google Sheet tab "Danh_Sach_Lop"
    syncToBackend('save_roster', { roster: sanitized });
  };

  // Đồng bộ định danh thành viên toàn bộ WebApp (chọn 1 lần sẽ tự điền ở Lưu bút, Điểm danh RSVP, Quỹ lớp)
  const [activeMember, setActiveMember] = useState<ClassMember | null>(() => {
    try {
      const saved = localStorage.getItem('k8a1_active_member');
      if (saved) {
        return JSON.parse(saved);
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
      } else {
        localStorage.removeItem('k8a1_active_member');
      }
    } catch (e) {
      console.warn('Lỗi lưu activeMember vào localStorage:', e);
    }
  };

  // RSVP list state
  const [rsvpList, setRsvpList] = useState<RsvpData[]>(() => {
    try {
      const local = localStorage.getItem('rsvp_list');
      if (!local) return INITIAL_RSVP_LIST;
      const parsed = JSON.parse(local);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map(sanitizeRsvp);
      }
      return INITIAL_RSVP_LIST;
    } catch (e) {
      console.warn('Lỗi đọc rsvp_list từ localStorage:', e);
      return INITIAL_RSVP_LIST;
    }
  });

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
      const uploaded = local ? JSON.parse(local) : [];
      if (Array.isArray(uploaded) && uploaded.length > 0) {
        return [...uploaded, ...DEFAULT_MEMORIES.filter(d => !uploaded.some((u: any) => u.id === d.id))];
      }
      return DEFAULT_MEMORIES;
    } catch (e) {
      console.warn('Lỗi đọc uploaded_images từ localStorage:', e);
      return DEFAULT_MEMORIES;
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
      return DEFAULT_VIDEOS;
    } catch {
      return DEFAULT_VIDEOS;
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
  const handleAddRsvp = (newRsvp: RsvpData) => {
    let wasExisting = false;
    setRsvpList((prev) => {
      const normNewPhone = normalizePhoneForMatch(newRsvp.phone);
      const normNewName = normalizeNameForMatch(newRsvp.fullName);

      const existingIndex = prev.findIndex((item) => {
        const itemPhone = normalizePhoneForMatch(item.phone);
        const itemName = normalizeNameForMatch(item.fullName);
        if (normNewPhone && itemPhone && normNewPhone === itemPhone) return true;
        if (!normNewPhone && normNewName && itemName && normNewName === itemName) return true;
        if (normNewName && itemName && normNewName === itemName && (!itemPhone || !normNewPhone || normNewPhone === itemPhone)) return true;
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

    setLatestAction({
      id: `toast-rsvp-${Date.now()}`,
      type: 'rsvp',
      author: newRsvp.fullName,
      className: newRsvp.className || 'K8A1',
      text: wasExisting
        ? 'vừa cập nhật thông tin phản hồi tham dự.'
        : (newRsvp.status === 'yes'
            ? (newRsvp.message ? `vừa xác nhận về lớp: "${newRsvp.message.slice(0, 50)}"` : 'vừa xác nhận chắc chắn có mặt tại Ngày hội ngộ 20 năm!')
            : 'vừa gửi phản hồi về ngày hội khóa.'),
      timeAgo: 'Vừa xong',
      isNew: true
    });
  };

  // Synchronize new wishes
  const handleAddWish = (newWish: WishData) => {
    const updated = [newWish, ...wishesList];
    setWishesList(updated);
    localStorage.setItem('wishes_list', JSON.stringify(updated));

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

  // Synchronize new image uploads with direct Google Sheet sync
  const handleAddImage = (newImg: MemoryImage) => {
    const local = localStorage.getItem('uploaded_images');
    const uploaded = local ? JSON.parse(local) : [];
    const updatedUploaded = [newImg, ...uploaded];
    try {
      localStorage.setItem('uploaded_images', JSON.stringify(updatedUploaded));
    } catch (e) {}
    setImages([newImg, ...images]);
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

  // Nạp toàn bộ dữ liệu từ Google Sheet & Google Drive (Single Source of Truth)
  const hydrateAllData = async (targetUrl: string = activeAppsScriptUrl) => {
    if (!targetUrl || !targetUrl.startsWith('http')) return;
    setIsRefreshing(true);
    try {
      // 1. Tải song song cả Master Data (Sheet) và Thư Viện Ảnh (Google Drive)
      const [allDataSettled, photosSettled] = await Promise.allSettled([
        fetch(`${targetUrl}?action=get_all_data&t=${Date.now()}`).then(r => r.json()),
        fetch(`${targetUrl}?action=get_photos&t=${Date.now()}`).then(r => r.json())
      ]);

      let drivePhotos: MemoryImage[] = [];

      // 2. Xử lý Thư Viện Ảnh từ Google Drive (Kho Kỷ Yếu của Lớp K8A1)
      if (photosSettled.status === 'fulfilled' && photosSettled.value) {
        const photosJson = photosSettled.value;
        if (photosJson.status === 'success' && Array.isArray(photosJson.data) && photosJson.data.length > 0) {
          drivePhotos = photosJson.data
            .filter((p: any) => {
              const cap = (p.caption || '').toLowerCase();
              return !cap.includes('hero banner') && 
                     !cap.includes('hero_banner') && 
                     !cap.includes('test upload') && 
                     !cap.includes('bill_');
            })
            .map((p: any) => ({
              id: p.id || `drive-${Date.now()}`,
              url: p.url || `https://lh3.googleusercontent.com/d/${p.id}=w1600`,
              thumbnail: p.thumbnail || `https://lh3.googleusercontent.com/d/${p.id}=w600`,
              caption: p.caption || 'Kỷ niệm Lớp K8A1',
              date: p.date || '2006',
              isUserUploaded: true,
              driveUrl: p.driveUrl
            }));
        }
      }

      // 3. Xử lý Master Data từ Google Sheet
      let sheetPhotos: MemoryImage[] = [];

      if (allDataSettled.status === 'fulfilled' && allDataSettled.value) {
        const result = allDataSettled.value;
        if (result && result.status === 'success' && result.data) {
          const { rsvp, wishes, config, media, roster, drivePhotos: embeddedDrivePhotos } = result.data;

          // Nếu có drivePhotos nhúng sẵn trong get_all_data
          if (drivePhotos.length === 0 && Array.isArray(embeddedDrivePhotos) && embeddedDrivePhotos.length > 0) {
            drivePhotos = embeddedDrivePhotos.map((p: any) => ({
              id: p.id,
              url: p.url,
              caption: p.caption || 'Kỷ niệm Lớp K8A1',
              date: p.date || '2006',
              isUserUploaded: true,
              driveUrl: p.driveUrl
            }));
          }

          // A. Đồng bộ RSVP từ Google Sheet (lọc trùng lặp thông minh)
          if (Array.isArray(rsvp) && rsvp.length > 0) {
            const uniqueRsvp: RsvpData[] = [];
            const seen = new Set<string>();

            for (const rawItem of rsvp) {
              if (!rawItem) continue;
              const item = sanitizeRsvp(rawItem);
              const key = normalizePhoneForMatch(item.phone) || normalizeNameForMatch(item.fullName);
              if (key && seen.has(key)) {
                const idx = uniqueRsvp.findIndex(x => (normalizePhoneForMatch(x.phone) || normalizeNameForMatch(x.fullName)) === key);
                if (idx >= 0) {
                  uniqueRsvp[idx] = {
                    ...uniqueRsvp[idx],
                    ...item,
                    checkedIn: uniqueRsvp[idx].checkedIn || item.checkedIn,
                    fundStatus: (uniqueRsvp[idx].fundStatus === 'paid' || item.fundStatus === 'paid') ? 'paid' : (item.fundStatus || uniqueRsvp[idx].fundStatus),
                    fundAmount: Math.max(uniqueRsvp[idx].fundAmount || 0, item.fundAmount || 0),
                    fundReceiptUrl: item.fundReceiptUrl || uniqueRsvp[idx].fundReceiptUrl
                  };
                }
              } else {
                if (key) seen.add(key);
                uniqueRsvp.push(item);
              }
            }

            setRsvpList(uniqueRsvp);
            try {
              localStorage.setItem('rsvp_list', JSON.stringify(uniqueRsvp));
            } catch (e) {}
          }

          // B. Đồng bộ Lời chúc từ Google Sheet
          if (Array.isArray(wishes) && wishes.length > 0) {
            setWishesList(wishes);
            localStorage.setItem('wishes_list', JSON.stringify(wishes));
          }

          // C. Đồng bộ Cấu hình sự kiện từ Google Sheet
          if (config && Object.keys(config).length > 0) {
            setEventConfig((prev) => {
              const updated = sanitizeEventConfig({ ...prev, ...config });
              localStorage.setItem('k8a1_event_config', JSON.stringify(updated));
              return updated;
            });

            if (config.heroBannerUrl) {
              const cleanBanner = normalizeImageUrl(config.heroBannerUrl);
              setHeroBannerUrl(cleanBanner);
              try {
                localStorage.setItem('k8a1_hero_banner_url', cleanBanner);
              } catch (e) {}
            }
            if (config.heroBannerPosition !== undefined) {
              const pos = Number(config.heroBannerPosition) || 50;
              setHeroBannerPosition(pos);
              try {
                localStorage.setItem('k8a1_hero_banner_position', pos.toString());
              } catch (e) {}
            }
          }

          // D. Đồng bộ Media (Video & Venue Media) từ Google Sheet
          if (media) {
            if (Array.isArray(media.videos) && media.videos.length > 0) {
              setVideos(media.videos);
              localStorage.setItem('k8a1_video_list', JSON.stringify(media.videos));
              localStorage.setItem('custom_videos', JSON.stringify(media.videos));
            }
            if (Array.isArray(media.venueMedia) && media.venueMedia.length > 0) {
              setVenueMediaList(media.venueMedia);
              localStorage.setItem('k8a1_venue_media_list', JSON.stringify(media.venueMedia));
            }
            if (Array.isArray(media.photos) && media.photos.length > 0) {
              sheetPhotos = media.photos.map((p: any) => ({ ...p, isUserUploaded: true }));
            }
          }

          // E. Đồng bộ Danh bạ Sĩ số Lớp K8A1 từ Google Sheet (tab "Danh_Sach_Lop")
          if (Array.isArray(roster) && roster.length > 0) {
            const sanitizedRoster = roster
              .filter((r: any) => r && (r.fullName || r.id))
              .map((r: any, idx: number) => sanitizeClassMember(r, idx));
            if (sanitizedRoster.length > 0) {
              setClassRoster(sanitizedRoster);
              try {
                localStorage.setItem('k8a1_class_roster', JSON.stringify(sanitizedRoster));
              } catch (e) {}
            }
          }
        }
      }

      // 4. Hợp nhất Thư Viện Ảnh (Kho Kỷ Yếu & Kỷ Niệm): Ưu tiên ảnh thật từ Google Drive và Sheet
      const photoMap = new Map<string, MemoryImage>();
      const combinedPhotos: MemoryImage[] = [];

      // Đưa ảnh Drive của lớp vào trước
      drivePhotos.forEach(dp => {
        if (!photoMap.has(dp.id)) {
          photoMap.set(dp.id, dp);
          combinedPhotos.push(dp);
        }
      });

      // Hợp nhất thêm ảnh từ Sheet (nếu có id khác)
      sheetPhotos.forEach(sp => {
        if (sp && sp.url && !photoMap.has(sp.id)) {
          photoMap.set(sp.id, sp);
          combinedPhotos.push(sp);
        }
      });

      if (combinedPhotos.length > 0) {
        // Kết hợp ảnh đã upload đưa lên đầu + các ảnh mẫu mặc định còn lại
        const finalImages = [
          ...combinedPhotos,
          ...DEFAULT_MEMORIES.filter(dm => !photoMap.has(dm.id))
        ];
        setImages(finalImages);
        try {
          localStorage.setItem('uploaded_images', JSON.stringify(combinedPhotos));
        } catch (e) {}
      }
    } catch (err) {
      console.warn('Lỗi đồng bộ từ Google Sheet & Drive:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Live Refresh data from Google Apps Script
  const handleRefreshData = () => {
    hydrateAllData(activeAppsScriptUrl);
  };

  // Tự động đồng bộ toàn bộ dữ liệu ngay khi tải trang và khi URL thay đổi
  useEffect(() => {
    hydrateAllData(activeAppsScriptUrl);
  }, [activeAppsScriptUrl]);

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#334155] flex flex-col items-center pb-20 selection:bg-amber-200 selection:text-amber-900 relative overflow-x-hidden font-sans">
      
      {/* 📌 THANH ĐIỀU HƯỚNG CỐ ĐỊNH (ELEGANT GLASS NAVBAR) */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-[#161B26]/95 border-b border-amber-500/30 text-white shadow-md transition-all">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 h-14 sm:h-15 flex items-center justify-between">
          
          {/* Brand Logo & Class Name */}
          <a href="#hero" className="flex items-center space-x-2.5 group">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-tr from-amber-600 via-amber-500 to-amber-300 flex items-center justify-center font-serif font-bold text-[#1A1613] shadow-md group-hover:scale-105 transition">
              20
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
          <nav className="flex items-center space-x-1 sm:space-x-2.5 text-xs font-medium">
            <a href="#ky-uc" className="text-slate-300 hover:text-amber-300 transition px-2 py-1 rounded hover:bg-white/10 flex items-center space-x-1">
              <Camera className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Ký Ức</span>
            </a>
            <a href="#dia-diem" className="text-slate-300 hover:text-amber-300 transition px-2 py-1 rounded hover:bg-white/10 flex items-center space-x-1">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Địa Điểm</span>
            </a>
            <a href="#luu-but" className="text-slate-300 hover:text-amber-300 transition px-2 py-1 rounded hover:bg-white/10 flex items-center space-x-1">
              <PenTool className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Lưu Bút</span>
            </a>

            {/* Background Audio Player integrated into navbar */}
            <AudioPlayer variant="navbar" customAudioUrl="" />

            {/* Primary Action Button */}
            <a 
              href="#diem-danh" 
              className="bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 hover:from-red-600 hover:to-rose-600 text-white px-3 sm:px-3.5 py-1.5 rounded-full font-bold shadow-md hover:shadow-lg transition transform hover:-translate-y-0.5 flex items-center space-x-1 text-xs"
            >
              <CheckCircle className="w-3.5 h-3.5 text-amber-200" />
              <span>Điểm Danh</span>
            </a>

            {/* Discrete Mini Admin Button in Navbar (Subtle icon with tooltip) */}
            <button
              onClick={() => setIsAdminHubOpen(true)}
              className={`p-1.5 sm:p-2 rounded-full transition-all duration-200 cursor-pointer ${
                currentUserRole === 'admin'
                  ? 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-400/50 shadow-xs'
                  : currentUserRole === 'bll'
                  ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-400/50 shadow-xs'
                  : 'text-slate-400 hover:text-amber-300 hover:bg-white/10'
              }`}
              title={currentUserRole === 'admin' ? "Quản trị viên (Admin)" : currentUserRole === 'bll' ? "Ban liên lạc (BLL)" : "Dành cho Ban Tổ Chức"}
            >
              {currentUserRole === 'admin' ? (
                <Crown className="w-3.5 h-3.5 text-amber-300" />
              ) : currentUserRole === 'bll' ? (
                <Shield className="w-3.5 h-3.5 text-emerald-300" />
              ) : (
                <Lock className="w-3.5 h-3.5" />
              )}
            </button>
          </nav>
        </div>
      </header>

      {/* 📌 NÚT TRUY CẬP QUẢN TRỊ ẨN GỌN GÀNG GÓC DƯỚI (TINY DISCRETE FAB) */}
      <div className="fixed bottom-3 right-3 z-40">
        <button
          onClick={() => setIsAdminHubOpen(true)}
          className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center backdrop-blur-md shadow-lg transition-all duration-300 cursor-pointer hover:scale-110 active:scale-95 ${
            currentUserRole === 'admin'
              ? 'bg-[#1E293B] text-amber-300 border border-amber-400/60 shadow-amber-950/40 ring-1 ring-amber-400/30'
              : currentUserRole === 'bll'
              ? 'bg-[#1E293B] text-emerald-300 border border-emerald-400/60 shadow-emerald-950/40'
              : 'bg-[#1E293B]/70 hover:bg-[#1E293B] text-slate-400 hover:text-amber-300 border border-slate-700/60'
          }`}
          title={currentUserRole === 'admin' ? "Quản trị viên" : currentUserRole === 'bll' ? "Ban liên lạc" : "Dành cho Ban Tổ Chức"}
        >
          {currentUserRole === 'admin' ? (
            <Crown className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
          ) : currentUserRole === 'bll' ? (
            <Shield className="w-3.5 h-3.5 text-emerald-300" />
          ) : (
            <Lock className="w-3.5 h-3.5" />
          )}
        </button>
      </div>

      {/* ======================================================== */}
      {/* 🌟 PHÂN VÙNG 1: CINEMATIC FULL-WIDTH HERO COVER BANNER */}
      {/* ======================================================== */}
      <section id="hero" className="w-full relative overflow-hidden bg-[#161B26] scroll-mt-14">
        
        {/* 1. Full-Width Background Panoramic Photo with Smooth Bottom Fade */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img
            src={heroBannerUrl}
            alt="Kỷ Niệm Thanh Xuân K8A1 THPT Thái Nguyên"
            style={{ objectPosition: `center ${heroBannerPosition}%` }}
            onError={(e) => {
              const fallback = DEFAULT_EVENT_CONFIG.heroBannerUrl || 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1600&q=80';
              if ((e.target as HTMLImageElement).src !== fallback) {
                (e.target as HTMLImageElement).src = fallback;
              }
            }}
            className="w-full h-full object-cover filter brightness-65 contrast-105 saturate-90 scale-102 transition-[object-position] duration-300"
          />
          {/* Top Darkening Tint for Navbar Contrast */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-transparent pointer-events-none" />
          
          {/* Warm Golden Sepia Ambient Layer */}
          <div className="absolute inset-0 bg-gradient-to-tr from-amber-950/35 via-transparent to-rose-950/25 pointer-events-none" />
          
          {/* 🌟 CRUCIAL: Soft Gradient Fade Out to Page Cream Background (#FDFBF7) */}
          <div className="absolute inset-x-0 bottom-0 h-40 sm:h-56 bg-gradient-to-t from-[#FDFBF7] via-[#FDFBF7]/85 to-transparent pointer-events-none" />
        </div>

        {/* 2. Overlaid Hero Content (Đè nội dung lên ảnh, căn giữa trong max-w-4xl) */}
        <div className="max-w-4xl mx-auto px-4 pt-10 pb-16 sm:pt-14 sm:pb-24 md:pt-16 md:pb-28 relative z-10 space-y-6 text-left">
          
          {/* Top Badge Strip */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-amber-400/50 text-amber-200 text-[10px] sm:text-[11px] font-sans font-bold uppercase tracking-[0.2em] shadow-md">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              <span>Hội Khóa 20 Năm • Niên Khóa 2003 — 2006</span>
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
                  {eventConfig.venueName} {eventConfig.shortAddress ? `(${eventConfig.shortAddress})` : ''}
                </p>
              </div>
            </div>
          </div>

          {/* Primary Action Button */}
          <div className="pt-1">
            <button
              onClick={() => {
                document.getElementById('diem-danh')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-2 px-6 sm:px-8 py-3.5 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-white font-sans font-bold text-xs sm:text-sm uppercase tracking-wider rounded-xl shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer border border-amber-300/40"
            >
              <CheckCircle className="w-4 h-4 text-amber-100" />
              <span>Xác Nhận Tham Dự Ngay</span>
            </button>
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

            {/* LIVE CLASSMATES GATHERING STRIP (SOCIAL PROOF) */}
            <div className="bg-gradient-to-r from-[#FFFDF9] via-[#FAF6F0] to-[#F5EFE6] border border-amber-300/80 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {/* Overlapping Avatars */}
                <div className="flex -space-x-2.5 overflow-hidden py-1 shrink-0">
                  {rsvpList.filter(a => a.status === 'yes').slice(0, 5).map((att, i) => (
                    <div 
                      key={att.id || i}
                      className="inline-block h-9 w-9 rounded-full ring-2 ring-white bg-gradient-to-br from-amber-200 to-amber-400 text-amber-950 font-serif font-bold text-xs flex items-center justify-center shadow-xs"
                      title={`${att.fullName} ${att.nickname ? `("${att.nickname}")` : ''}`}
                    >
                      {att.fullName.charAt(0).toUpperCase()}
                    </div>
                  ))}
                  <div className="inline-block h-9 w-9 rounded-full ring-2 ring-white bg-[#1E293B] text-amber-300 font-sans font-bold text-[10px] flex items-center justify-center shadow-xs">
                    +{rsvpList.filter(a => a.status === 'yes').length}
                  </div>
                </div>

                <div className="text-left space-y-0.5">
                  <p className="text-xs sm:text-sm font-serif font-bold text-[#1E293B] flex items-center gap-1.5">
                    <span>{rsvpList.filter(a => a.status === 'yes').length} bạn bè K8A1 đã xác nhận trở về!</span>
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                  </p>
                  <p className="text-[10px] sm:text-[11px] text-slate-500 font-sans">
                    Các bạn vào điền tên và biệt danh để lớp chuẩn bị đón tiếp chu đáo nhé!
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  document.getElementById('diem-danh')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-4 py-2 bg-[#8B1E2D] hover:bg-[#701524] text-white font-sans font-bold text-[11px] uppercase tracking-wider rounded-lg shadow-sm transition-all cursor-pointer whitespace-nowrap self-stretch sm:self-auto text-center"
              >
                Điền Điểm Danh Ngay ✍️
              </button>
            </div>

            {/* 📜 TẤM THIỆP MỜI VIP DẠ TIỆC (DOUBLE GOLD FOIL & WAX SEAL ĐỈNH CAO) */}
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
              <div className="space-y-2 border-b border-amber-400/40 pb-5 relative z-10 max-w-xl">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 border border-amber-300/70 rounded-full text-amber-900 text-[10px] font-sans font-bold uppercase tracking-[0.2em]">
                    <MailOpen className="w-3.5 h-3.5 text-amber-600" />
                    <span>Thư Ngỏ Kỷ Niệm 20 Năm • Lớp K8A1 (2006 — 2026)</span>
                  </div>

                  {(currentUserRole === 'admin' || currentUserRole === 'bll') && (
                    <button
                      type="button"
                      onClick={() => handleOpenAdminHub('settings')}
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-100/70 hover:bg-amber-200/80 text-amber-900 text-[10px] font-sans font-bold rounded-full border border-amber-300 transition cursor-pointer"
                      title="Dành cho Ban Liên Lạc & Admin: Chỉnh sửa lời ngỏ thiệp mời"
                    >
                      <Edit3 className="w-3 h-3 text-amber-700" />
                      <span>Sửa Lời Ngỏ & Địa Điểm</span>
                    </button>
                  )}
                </div>
                
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif text-[#1E293B] font-bold tracking-tight leading-snug">
                  {eventConfig.letterTitle || "Lời Ngỏ Thân Tình Gửi Bạn Tôi — Lớp K8A1"}
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 font-serif italic">
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
                      <div>
                        <p className="font-bold text-slate-900">Địa điểm họp mặt:</p>
                        <p className="text-slate-600">
                          {eventConfig.venueName} {eventConfig.shortAddress ? `(${eventConfig.shortAddress})` : ''}
                        </p>
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
                      document.getElementById('diem-danh')?.scrollIntoView({ behavior: 'smooth' });
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
            {/* 🎞️ PHÂN VÙNG 2: KHO KÝ ỨC THANH XUÂN K8A1 */}
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
            {/* 📍 PHÂN VÙNG 3: ĐỊA ĐIỂM TỔ CHỨC HỌP LỚP K8A1 */}
            {/* ======================================================== */}
            <AlumniConvergenceMap
              eventConfig={eventConfig}
              venueMediaList={venueMediaList}
              onUpdateVenueMediaList={handleUpdateVenueMedia}
              currentUserRole={currentUserRole}
              onOpenAdminHub={(tab, subTab) => handleOpenAdminHub(tab || 'media', subTab || 'venue')}
            />

            {/* ======================================================== */}
            {/* 💬 PHÂN VÙNG 4: BỨC TƯỜNG LƯU BÚT SỐ K8A1 */}
            {/* ======================================================== */}
            <section id="luu-but" className="space-y-4 scroll-mt-20">
              <WishesGuestbook
                appsScriptUrl={activeAppsScriptUrl}
                wishesList={wishesList}
                onAddWish={handleAddWish}
                classRoster={classRoster}
                activeMember={activeMember}
                onSelectActiveMember={handleSelectActiveMember}
              />
            </section>

            {/* ======================================================== */}
            {/* 🎟️ PHÂN VÙNG 5: ĐIỂM DANH & THÀNH VIÊN VÀ QUỸ LỚP */}
            {/* ======================================================== */}
            <section id="diem-danh" className="space-y-6 scroll-mt-20">
              
              {/* Form Điểm Danh */}
              <RsvpForm 
                appsScriptUrl={activeAppsScriptUrl} 
                rsvpList={rsvpList} 
                classRoster={classRoster}
                activeMember={activeMember}
                onSelectActiveMember={handleSelectActiveMember}
                onAddRsvp={handleAddRsvp} 
                onOpenPassModal={handleOpenPass}
                onOpenReceiptModal={handleOpenReceiptModal}
              />

              {/* Danh Sách Thành Viên Đã Xác Nhận */}
              <ConfirmedAttendees
                appsScriptUrl={activeAppsScriptUrl}
                rsvpList={rsvpList}
                onRefresh={handleRefreshData}
                isRefreshing={isRefreshing}
                onOpenPassModal={handleOpenPass}
                onOpenReceiptModal={handleOpenReceiptModal}
              />

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
                activeMember={activeMember}
                onOpenReceiptModal={handleOpenReceiptModal}
                onUpdateRsvpList={(updated) => {
                  setRsvpList(updated);
                  localStorage.setItem('rsvp_list', JSON.stringify(updated));
                }}
              />
            </section>

            {/* ======================================================== */}
            {/* ☕ FOOTER: LỜI KẾT ẤM ÁP */}
            {/* ======================================================== */}
            <footer className="text-center space-y-3 pt-10 pb-6 border-t border-slate-200 text-xs text-slate-500 flex flex-col items-center">
              <div className="space-y-1">
                <p className="font-bold text-[#1E293B] font-serif text-sm">
                  Hội Ngộ 20 Năm Lớp K8A1 — THPT Thái Nguyên
                </p>
                <p className="font-serif italic text-slate-600">
                  “20 năm bôn ba muôn phương, khi về lại K8A1 — ta mãi là những cô cậu học trò tuổi 18.”
                </p>
                <p className="text-amber-700 font-mono text-[11px] pt-1">
                  Đồng bộ dữ liệu tự động với Google Sheets & Google Drive
                </p>
              </div>

              <div className="pt-2">
                <ViewCounter appsScriptUrl={activeAppsScriptUrl} />
              </div>
            </footer>

          </div>
        )}

      </main>

      {/* 👑 BẢNG ĐIỀU KHIỂN QUẢN TRỊ & ĐỐI SOÁT TOÀN DIỆN (ADMIN & BAN LIÊN LẠC) */}
      <AdminManagementHub
        isOpen={isAdminHubOpen}
        onClose={() => setIsAdminHubOpen(false)}
        currentUserRole={currentUserRole}
        initialTab={adminHubInitialTab}
        initialMediaSubTab={adminHubInitialMediaSubTab}
        onLoginSuccess={(role) => {
          setCurrentUserRole(role);
          sessionStorage.setItem('user_role', role);
        }}
        onLogout={() => {
          setCurrentUserRole('guest');
          sessionStorage.removeItem('user_role');
        }}
        rsvpList={rsvpList}
        onUpdateRsvpList={(updated) => {
          setRsvpList(updated);
          localStorage.setItem('rsvp_list', JSON.stringify(updated));
        }}
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
      />

      {/* Thẻ Học Sinh Kỷ Niệm (Digital Souvenir Pass) */}
      <StudentPassModal
        isOpen={isPassModalOpen}
        onClose={() => setIsPassModalOpen(false)}
        defaultAttendee={selectedPassAttendee}
        allAttendees={rsvpList}
      />

      {/* Modal Tải Lên Biên Lai Đóng Quỹ (Self-Service Receipt Uploader) */}
      <ReceiptUploadModal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        appsScriptUrl={activeAppsScriptUrl}
        rsvpList={rsvpList}
        defaultAttendee={selectedReceiptAttendee}
        onUpdateRsvpList={(updated) => {
          setRsvpList(updated);
          localStorage.setItem('rsvp_list', JSON.stringify(updated));
        }}
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
