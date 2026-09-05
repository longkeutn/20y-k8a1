import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Shield,
  Crown,
  Lock,
  Unlock,
  KeyRound,
  Users,
  UserCheck,
  UserX,
  UserPlus,
  Edit,
  Trash2,
  DollarSign,
  Receipt,
  Download,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  Sparkles,
  Calendar,
  Clock,
  Video,
  Image as ImageIcon,
  Settings,
  RefreshCw,
  AlertTriangle,
  Check,
  Eye,
  LogOut,
  Plus,
  Pin,
  FileSpreadsheet,
  Shirt,
  Phone,
  MessageSquare,
  X,
  CheckCircle,
  Upload,
  RotateCcw,
  Folder,
  ExternalLink,
  Save,
  Link,
  Building2,
  Play
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserRole, RsvpData, WishData, MemoryImage, MemoryVideo, VenueMediaItem } from '../types';
import { K8A1_DRIVE_FOLDER_ID, K8A1_DRIVE_FOLDER_URL } from '../data';
import { DEFAULT_VENUE_MEDIA, parseVenueMedia } from './AlumniConvergenceMap';

interface AdminManagementHubProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserRole: UserRole;
  onLoginSuccess: (role: UserRole) => void;
  onLogout: () => void;
  initialTab?: 'members' | 'fund' | 'wishes' | 'media' | 'settings';
  initialMediaSubTab?: 'venue' | 'banner' | 'videos' | 'photos';
  
  // Data props
  rsvpList: RsvpData[];
  onUpdateRsvpList: (list: RsvpData[]) => void;
  
  wishesList: WishData[];
  onUpdateWishesList: (list: WishData[]) => void;
  
  images: MemoryImage[];
  onUpdateImages: (list: MemoryImage[]) => void;
  
  videos: MemoryVideo[];
  onUpdateVideos: (list: MemoryVideo[]) => void;

  venueMediaList?: VenueMediaItem[];
  onUpdateVenueMediaList?: (list: VenueMediaItem[]) => void;
  
  heroBannerUrl?: string;
  onUpdateHeroBannerUrl?: (url: string) => void;
  
  appsScriptUrl: string;
  onSaveAppsScriptUrl: (url: string) => void;
  onRefreshData?: () => void;
  onOpenPassModal?: (attendee: RsvpData) => void;
}

export default function AdminManagementHub({
  isOpen,
  onClose,
  currentUserRole,
  onLoginSuccess,
  onLogout,
  initialTab,
  initialMediaSubTab,
  rsvpList,
  onUpdateRsvpList,
  wishesList,
  onUpdateWishesList,
  images,
  onUpdateImages,
  videos,
  onUpdateVideos,
  venueMediaList,
  onUpdateVenueMediaList,
  heroBannerUrl = 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1600&q=80',
  onUpdateHeroBannerUrl,
  appsScriptUrl,
  onSaveAppsScriptUrl,
  onRefreshData,
  onOpenPassModal
}: AdminManagementHubProps) {
  // Navigation tabs
  type ActiveTab = 'members' | 'fund' | 'wishes' | 'media' | 'settings';
  const [activeTab, setActiveTab] = useState<ActiveTab>(initialTab || 'members');

  // Media Tab subtab state
  const [mediaSubTab, setMediaSubTab] = useState<'venue' | 'banner' | 'videos' | 'photos'>(initialMediaSubTab || 'venue');

  // Auto-switch to initialTab and initialMediaSubTab when hub is opened
  useEffect(() => {
    if (isOpen) {
      if (initialTab) setActiveTab(initialTab);
      if (initialMediaSubTab) setMediaSubTab(initialMediaSubTab);
    }
  }, [isOpen, initialTab, initialMediaSubTab]);

  // PIN Authentication state
  const [enteredPin, setEnteredPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [isPinSubmitting, setIsPinSubmitting] = useState(false);

  // Stored PINs (default Admin 8888, BLL 2006)
  const [adminPin, setAdminPin] = useState(() => {
    return localStorage.getItem('k8a1_admin_pin') || '8888';
  });
  const [bllPin, setBllPin] = useState(() => {
    return localStorage.getItem('k8a1_bll_pin') || '2006';
  });

  // Settings form states
  const [newAdminPin, setNewAdminPin] = useState('');
  const [newBllPin, setNewBllPin] = useState('');
  const [scriptUrlInput, setScriptUrlInput] = useState(appsScriptUrl);
  const [bannerInput, setBannerInput] = useState(heroBannerUrl);
  const [settingsSuccessMsg, setSettingsSuccessMsg] = useState('');

  // Search & Filters for Member Tab
  const [memberSearch, setMemberSearch] = useState('');
  const [memberStatusFilter, setMemberStatusFilter] = useState<'all' | 'yes' | 'no' | 'checkedIn' | 'notCheckedIn'>('all');
  const [memberShirtFilter, setMemberShirtFilter] = useState<string>('all');

  // Search & Filters for Fund Reconciliation Tab
  const [fundSearch, setFundSearch] = useState('');
  const [fundStatusFilter, setFundStatusFilter] = useState<'all' | 'paid' | 'unpaid' | 'extra'>('all');

  // Modals for CRUD operations
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<RsvpData | null>(null);
  const [memberFormData, setMemberFormData] = useState<Partial<RsvpData>>({
    fullName: '',
    nickname: '',
    phone: '',
    className: 'K8A1',
    status: 'yes',
    shirtSize: 'L',
    message: '',
    fundStatus: 'unpaid',
    fundAmount: 500000,
    fundNote: ''
  });

  // Quick Fund Adjust Modal
  const [adjustFundMember, setAdjustFundMember] = useState<RsvpData | null>(null);
  const [fundAdjustAmount, setFundAdjustAmount] = useState<number>(500000);
  const [fundAdjustNote, setFundAdjustNote] = useState<string>('');

  // Modals for Wishes
  const [isAddWishModalOpen, setIsAddWishModalOpen] = useState(false);
  const [editingWish, setEditingWish] = useState<WishData | null>(null);
  const [wishFormData, setWishFormData] = useState<Partial<WishData>>({
    fullName: '',
    className: 'K8A1',
    message: '',
    tag: 'bg-amber-100/90 text-amber-900 border-amber-200'
  });

  // Media Tab state
  const [venueMediaListState, setVenueMediaListState] = useState<VenueMediaItem[]>(() => {
    if (venueMediaList && venueMediaList.length > 0) return venueMediaList;
    try {
      const local = localStorage.getItem('k8a1_venue_media_list');
      if (local) {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return DEFAULT_VENUE_MEDIA;
  });

  useEffect(() => {
    if (venueMediaList && venueMediaList.length > 0) {
      setVenueMediaListState(venueMediaList);
    }
  }, [venueMediaList]);

  const [isAddVenueMediaModalOpen, setIsAddVenueMediaModalOpen] = useState(false);
  const [venueMediaFormData, setVenueMediaFormData] = useState({ title: '', url: '', desc: '' });

  const [isAddVideoModalOpen, setIsAddVideoModalOpen] = useState(false);
  const [videoFormData, setVideoFormData] = useState({ title: '', url: '' });
  const [isAddPhotoModalOpen, setIsAddPhotoModalOpen] = useState(false);
  const [photoFormData, setPhotoFormData] = useState({ url: '', caption: '', date: '' });

  // Update script input when prop changes
  useEffect(() => {
    setScriptUrlInput(appsScriptUrl);
  }, [appsScriptUrl]);

  useEffect(() => {
    setBannerInput(heroBannerUrl);
  }, [heroBannerUrl]);

  // Handle PIN input button click
  const handlePinDigit = (digit: string) => {
    if (enteredPin.length < 4) {
      const nextPin = enteredPin + digit;
      setEnteredPin(nextPin);
      setPinError('');
      if (nextPin.length === 4) {
        verifyPin(nextPin);
      }
    }
  };

  const handlePinDelete = () => {
    setEnteredPin(prev => prev.slice(0, -1));
    setPinError('');
  };

  const handlePinClear = () => {
    setEnteredPin('');
    setPinError('');
  };

  // Verify PIN
  const verifyPin = (pinToTest: string) => {
    setIsPinSubmitting(true);
    setTimeout(() => {
      if (pinToTest === adminPin) {
        onLoginSuccess('admin');
        setEnteredPin('');
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.5 } });
      } else if (pinToTest === bllPin) {
        onLoginSuccess('bll');
        setEnteredPin('');
        confetti({ particleCount: 40, spread: 50, origin: { y: 0.5 } });
      } else {
        setPinError('Mã PIN không đúng! Vui lòng thử lại.');
        setEnteredPin('');
      }
      setIsPinSubmitting(false);
    }, 250);
  };

  // Keyboard handler for PIN
  useEffect(() => {
    if (!isOpen || currentUserRole !== 'guest') return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (/^[0-9]$/.test(e.key)) {
        handlePinDigit(e.key);
      } else if (e.key === 'Backspace') {
        handlePinDelete();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentUserRole, enteredPin, adminPin, bllPin]);

  // ---------------------------------------------------------------------------
  // KPI COMPUTATIONS
  // ---------------------------------------------------------------------------
  const confirmedCount = useMemo(() => rsvpList.filter(a => a.status === 'yes').length, [rsvpList]);
  const checkedInCount = useMemo(() => rsvpList.filter(a => a.status === 'yes' && a.checkedIn).length, [rsvpList]);
  
  // Total expected fund (500,000đ per attending member)
  const expectedFund = useMemo(() => confirmedCount * 500000, [confirmedCount]);
  
  // Actual collected fund
  const collectedFund = useMemo(() => {
    return rsvpList.reduce((acc, curr) => {
      if (curr.fundStatus === 'paid') {
        return acc + (curr.fundAmount !== undefined ? curr.fundAmount : 500000);
      }
      return acc;
    }, 0);
  }, [rsvpList]);

  const paidMembersCount = useMemo(() => rsvpList.filter(a => a.fundStatus === 'paid').length, [rsvpList]);

  // ---------------------------------------------------------------------------
  // MEMBER CRUD HANDLERS
  // ---------------------------------------------------------------------------
  const handleToggleCheckIn = (attendee: RsvpData) => {
    const updated = rsvpList.map(item => {
      if ((item.id && item.id === attendee.id) || item.phone === attendee.phone) {
        const nextState = !item.checkedIn;
        return {
          ...item,
          checkedIn: nextState,
          checkedInAt: nextState ? new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : undefined
        };
      }
      return item;
    });

    onUpdateRsvpList(updated);
    localStorage.setItem('rsvp_list', JSON.stringify(updated));

    if (!attendee.checkedIn) {
      confetti({ particleCount: 30, spread: 45, origin: { y: 0.6 } });
    }
  };

  const handleOpenAddMember = () => {
    setEditingMember(null);
    setMemberFormData({
      fullName: '',
      nickname: '',
      phone: '',
      className: 'K8A1',
      status: 'yes',
      shirtSize: 'L',
      message: '',
      fundStatus: 'unpaid',
      fundAmount: 500000,
      fundNote: ''
    });
    setIsAddMemberModalOpen(true);
  };

  const handleOpenEditMember = (attendee: RsvpData) => {
    setEditingMember(attendee);
    setMemberFormData({
      ...attendee,
      fundAmount: attendee.fundAmount || 500000,
      fundStatus: attendee.fundStatus || 'unpaid'
    });
    setIsAddMemberModalOpen(true);
  };

  const handleSaveMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberFormData.fullName?.trim() || !memberFormData.phone?.trim()) {
      alert('Vui lòng điền Họ tên và Số điện thoại!');
      return;
    }

    if (editingMember) {
      const updated = rsvpList.map(item => {
        if ((editingMember.id && item.id === editingMember.id) || item.phone === editingMember.phone) {
          return {
            ...item,
            ...memberFormData,
            fullName: memberFormData.fullName!.trim(),
            phone: memberFormData.phone!.trim()
          } as RsvpData;
        }
        return item;
      });
      onUpdateRsvpList(updated);
      localStorage.setItem('rsvp_list', JSON.stringify(updated));
    } else {
      const newMember: RsvpData = {
        id: 'user-' + Date.now(),
        fullName: memberFormData.fullName!.trim(),
        nickname: memberFormData.nickname?.trim() || '',
        phone: memberFormData.phone!.trim(),
        className: memberFormData.className || 'K8A1',
        status: memberFormData.status || 'yes',
        shirtSize: memberFormData.shirtSize || 'L',
        message: memberFormData.message?.trim() || '',
        submittedAt: new Date().toLocaleDateString('vi-VN') + ' ' + new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        checkedIn: false,
        fundStatus: memberFormData.fundStatus || 'unpaid',
        fundAmount: memberFormData.fundAmount || 500000,
        fundNote: memberFormData.fundNote || ''
      };
      const updated = [newMember, ...rsvpList];
      onUpdateRsvpList(updated);
      localStorage.setItem('rsvp_list', JSON.stringify(updated));
    }

    setIsAddMemberModalOpen(false);
  };

  const handleDeleteMember = (attendee: RsvpData) => {
    if (currentUserRole !== 'admin') {
      alert('Chỉ Trưởng Ban (Admin) mới có quyền xóa thành viên!');
      return;
    }

    if (confirm(`Bạn có chắc chắn muốn xóa bạn "${attendee.fullName}" khỏi danh sách? Hành động này không thể hoàn tác.`)) {
      const updated = rsvpList.filter(item => {
        if (attendee.id && item.id) return item.id !== attendee.id;
        return item.phone !== attendee.phone;
      });
      onUpdateRsvpList(updated);
      localStorage.setItem('rsvp_list', JSON.stringify(updated));
    }
  };

  // Export CSV
  const handleExportRsvpCsv = () => {
    const headers = ['STT', 'Họ và Tên', 'Biệt Danh', 'Số Điện Thoại', 'Lớp', 'Tham Gia', 'Size Áo', 'Điểm Danh Đến', 'Thời Gian Đến', 'Trạng Thái Quỹ 500k', 'Số Tiền Đóng', 'Ghi Chú Quỹ', 'Lời Nhắn'];
    const rows = rsvpList.map((a, idx) => [
      idx + 1,
      `"${a.fullName || ''}"`,
      `"${a.nickname || ''}"`,
      `"${a.phone || ''}"`,
      `"${a.className || 'K8A1'}"`,
      a.status === 'yes' ? 'CÓ THAM GIA' : 'VẮNG MẶT',
      `"${a.shirtSize || 'L'}"`,
      a.checkedIn ? 'ĐÃ ĐẾN' : 'CHƯA ĐẾN',
      `"${a.checkedInAt || ''}"`,
      a.fundStatus === 'paid' ? 'ĐÃ ĐÓNG' : 'CHƯA ĐÓNG',
      a.fundAmount || (a.fundStatus === 'paid' ? 500000 : 0),
      `"${a.fundNote || ''}"`,
      `"${(a.message || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `Diem_Danh_K8A1_20Nam_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ---------------------------------------------------------------------------
  // FUND RECONCILIATION CRUD HANDLERS
  // ---------------------------------------------------------------------------
  const handleToggleFundPaid = (attendee: RsvpData) => {
    const nextStatus = attendee.fundStatus === 'paid' ? 'unpaid' : 'paid';
    const updated = rsvpList.map(item => {
      if ((item.id && item.id === attendee.id) || item.phone === attendee.phone) {
        return {
          ...item,
          fundStatus: nextStatus,
          fundAmount: nextStatus === 'paid' ? (item.fundAmount || 500000) : 0,
          fundNote: nextStatus === 'paid' ? (item.fundNote || 'Đã đóng 500k') : ''
        };
      }
      return item;
    });

    onUpdateRsvpList(updated);
    localStorage.setItem('rsvp_list', JSON.stringify(updated));

    if (nextStatus === 'paid') {
      confetti({ particleCount: 35, spread: 50, origin: { y: 0.6 } });
    }
  };

  const handleOpenAdjustFund = (attendee: RsvpData) => {
    setAdjustFundMember(attendee);
    setFundAdjustAmount(attendee.fundAmount || 500000);
    setFundAdjustNote(attendee.fundNote || '');
  };

  const handleSaveAdjustFund = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustFundMember) return;

    const updated = rsvpList.map(item => {
      if ((adjustFundMember.id && item.id === adjustFundMember.id) || item.phone === adjustFundMember.phone) {
        return {
          ...item,
          fundStatus: fundAdjustAmount > 0 ? 'paid' : 'unpaid',
          fundAmount: Number(fundAdjustAmount),
          fundNote: fundAdjustNote.trim()
        } as RsvpData;
      }
      return item;
    });

    onUpdateRsvpList(updated);
    localStorage.setItem('rsvp_list', JSON.stringify(updated));
    setAdjustFundMember(null);
  };

  // Export CSV for Fund Reconciliation
  const handleExportFundCsv = () => {
    const headers = ['STT', 'Họ và Tên', 'Biệt Danh', 'Số Điện Thoại', 'Lớp', 'Tham Gia', 'Trạng Thái Đóng Quỹ', 'Số Tiền Thực Thu (VNĐ)', 'Ghi Chú Đối Soát'];
    const rows = rsvpList.map((a, idx) => [
      idx + 1,
      `"${a.fullName || ''}"`,
      `"${a.nickname || ''}"`,
      `"${a.phone || ''}"`,
      `"${a.className || 'K8A1'}"`,
      a.status === 'yes' ? 'Tham gia' : 'Vắng mặt',
      a.fundStatus === 'paid' ? 'ĐÃ NỘP TIỀN' : 'CHƯA NỘP',
      a.fundStatus === 'paid' ? (a.fundAmount || 500000) : 0,
      `"${(a.fundNote || '').replace(/"/g, '""')}"`
    ]);

    const summaryRow = ['', 'TỔNG CỘNG ĐÃ THU', '', '', '', '', '', collectedFund, 'VNĐ'];

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(',')), summaryRow.join(',')].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `Doi_Soat_Quy_K8A1_20Nam_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ---------------------------------------------------------------------------
  // WISHES CRUD HANDLERS
  // ---------------------------------------------------------------------------
  const handleOpenAddWish = () => {
    setEditingWish(null);
    setWishFormData({
      fullName: '',
      className: 'K8A1',
      message: '',
      tag: 'bg-amber-100/90 text-amber-900 border-amber-200'
    });
    setIsAddWishModalOpen(true);
  };

  const handleOpenEditWish = (wish: WishData) => {
    setEditingWish(wish);
    setWishFormData(wish);
    setIsAddWishModalOpen(true);
  };

  const handleSaveWish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wishFormData.fullName?.trim() || !wishFormData.message?.trim()) {
      alert('Vui lòng điền Họ tên và Lời chúc!');
      return;
    }

    if (editingWish) {
      const updated = wishesList.map(item => {
        if (item.id === editingWish.id) {
          return {
            ...item,
            ...wishFormData,
            fullName: wishFormData.fullName!.trim(),
            message: wishFormData.message!.trim()
          } as WishData;
        }
        return item;
      });
      onUpdateWishesList(updated);
      localStorage.setItem('wishes_list', JSON.stringify(updated));
    } else {
      const newWish: WishData = {
        id: 'wish-' + Date.now(),
        fullName: wishFormData.fullName!.trim(),
        className: wishFormData.className || 'K8A1',
        message: wishFormData.message!.trim(),
        tag: wishFormData.tag || 'bg-amber-100/90 text-amber-900 border-amber-200',
        submittedAt: 'Vừa xong',
        likes: 1,
        isPinned: false
      };
      const updated = [newWish, ...wishesList];
      onUpdateWishesList(updated);
      localStorage.setItem('wishes_list', JSON.stringify(updated));
    }

    setIsAddWishModalOpen(false);
  };

  const handleTogglePinWish = (wish: WishData) => {
    const updated = wishesList.map(item => {
      if (item.id === wish.id) {
        return { ...item, isPinned: !item.isPinned };
      }
      return item;
    });
    onUpdateWishesList(updated);
    localStorage.setItem('wishes_list', JSON.stringify(updated));
  };

  const handleDeleteWish = (wish: WishData) => {
    if (confirm(`Bạn có chắc muốn xóa lời chúc của "${wish.fullName}"?`)) {
      const updated = wishesList.filter(item => item.id !== wish.id);
      onUpdateWishesList(updated);
      localStorage.setItem('wishes_list', JSON.stringify(updated));
    }
  };

  // ---------------------------------------------------------------------------
  // HERO BANNER COVER UPLOAD HANDLER
  // ---------------------------------------------------------------------------
  const handleBannerFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      alert('Kích thước ảnh tối đa là 8MB!');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setBannerInput(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveBanner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bannerInput.trim()) {
      alert('Vui lòng nhập link ảnh hoặc chọn file tải lên!');
      return;
    }
    if (onUpdateHeroBannerUrl) {
      onUpdateHeroBannerUrl(bannerInput.trim());
      setSettingsSuccessMsg('Đã cập nhật ảnh bìa banner đầu trang thành công!');
      setTimeout(() => setSettingsSuccessMsg(''), 4000);
    }
  };

  const handleResetBanner = () => {
    const defaultUrl = 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1600&q=80';
    setBannerInput(defaultUrl);
    if (onUpdateHeroBannerUrl) {
      onUpdateHeroBannerUrl(defaultUrl);
      setSettingsSuccessMsg('Đã khôi phục ảnh bìa banner về mặc định!');
      setTimeout(() => setSettingsSuccessMsg(''), 4000);
    }
  };

  // ---------------------------------------------------------------------------
  // MEDIA (VIDEOS / PHOTOS) CRUD HANDLERS
  // ---------------------------------------------------------------------------
  const convertToEmbedUrl = (rawUrl: string): string => {
    const trimmed = rawUrl.trim();
    const ytMatch = trimmed.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    if (ytMatch && ytMatch[1]) {
      return `https://www.youtube.com/embed/${ytMatch[1]}`;
    }
    const driveMatch = trimmed.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (driveMatch && driveMatch[1]) {
      return `https://drive.google.com/file/d/${driveMatch[1]}/preview`;
    }
    return trimmed;
  };

  const handleSaveVideo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoFormData.url.trim() || !videoFormData.title.trim()) {
      alert('Vui lòng nhập Tiêu đề và Đường dẫn Video!');
      return;
    }

    const embedUrl = convertToEmbedUrl(videoFormData.url);
    const newVideo: MemoryVideo = {
      id: 'vid-' + Date.now(),
      title: videoFormData.title.trim(),
      embedUrl
    };

    const updated = [newVideo, ...videos];
    onUpdateVideos(updated);
    localStorage.setItem('custom_videos', JSON.stringify(updated));
    setIsAddVideoModalOpen(false);
    setVideoFormData({ title: '', url: '' });
  };

  const handleDeleteVideo = (video: MemoryVideo) => {
    if (confirm(`Bạn có chắc muốn xóa video "${video.title}"?`)) {
      const updated = videos.filter(v => v.id !== video.id);
      onUpdateVideos(updated);
      localStorage.setItem('custom_videos', JSON.stringify(updated));
    }
  };

  const handlePhotoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setPhotoFormData(prev => ({
          ...prev,
          url: result,
          caption: prev.caption || file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ')
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSavePhoto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoFormData.url?.trim() || !photoFormData.caption?.trim()) {
      alert('Vui lòng chọn ảnh hoặc nhập Link ảnh và Chú thích!');
      return;
    }

    const newPhoto: MemoryImage = {
      id: 'img-' + Date.now(),
      url: photoFormData.url.trim(),
      caption: photoFormData.caption.trim(),
      date: photoFormData.date?.trim() || 'Kỷ niệm xưa',
      isUserUploaded: true
    };

    const updated = [newPhoto, ...images];
    onUpdateImages(updated);
    localStorage.setItem('uploaded_images', JSON.stringify(updated));
    setIsAddPhotoModalOpen(false);
    setPhotoFormData({ url: '', caption: '', date: '' });
  };

  const handleDeletePhoto = (photo: MemoryImage) => {
    if (confirm(`Bạn có chắc muốn xóa ảnh "${photo.caption}"?`)) {
      const updated = images.filter(p => p.id !== photo.id);
      onUpdateImages(updated);
      localStorage.setItem('uploaded_images', JSON.stringify(updated));
    }
  };

  // ---------------------------------------------------------------------------
  // VENUE MEDIA (REELS / VIDEOS / PHOTOS) HANDLERS FOR BLL & ADMIN
  // ---------------------------------------------------------------------------
  const handleSaveVenueMedia = (e: React.FormEvent) => {
    e.preventDefault();
    if (!venueMediaFormData.url.trim()) {
      alert('Vui lòng nhập đường dẫn Link hoặc chọn file ảnh!');
      return;
    }

    const parsed = parseVenueMedia(venueMediaFormData.url.trim());
    const newItem: VenueMediaItem = {
      id: `vm-${Date.now()}`,
      title: venueMediaFormData.title.trim() || (parsed.type === 'image' ? 'Ảnh Không Gian Nhà Hàng' : `${parsed.label} Minh Họa`),
      url: venueMediaFormData.url.trim(),
      type: parsed.type === 'empty' ? 'image' : parsed.type,
      desc: venueMediaFormData.desc.trim() || 'Minh họa không gian tổ chức họp lớp tại Crown Palace Thái Nguyên.'
    };

    const updated = [newItem, ...venueMediaListState];
    setVenueMediaListState(updated);
    localStorage.setItem('k8a1_venue_media_list', JSON.stringify(updated));
    if (onUpdateVenueMediaList) {
      onUpdateVenueMediaList(updated);
    }
    setIsAddVenueMediaModalOpen(false);
    setVenueMediaFormData({ title: '', url: '', desc: '' });
  };

  const handleDeleteVenueMedia = (item: VenueMediaItem) => {
    if (confirm(`Bạn có chắc muốn xóa mục "${item.title}"?`)) {
      const updated = venueMediaListState.filter(v => v.id !== item.id);
      setVenueMediaListState(updated);
      localStorage.setItem('k8a1_venue_media_list', JSON.stringify(updated));
      if (onUpdateVenueMediaList) {
        onUpdateVenueMediaList(updated);
      }
    }
  };

  const handleVenuePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      alert('Kích thước ảnh tối đa là 8MB!');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setVenueMediaFormData(prev => ({
          ...prev,
          url: result,
          title: prev.title || 'Ảnh Không Gian Crown Palace'
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleResetVenueMedia = () => {
    if (confirm('Khôi phục danh sách video & ảnh không gian Crown Palace về mặc định?')) {
      setVenueMediaListState(DEFAULT_VENUE_MEDIA);
      localStorage.removeItem('k8a1_venue_media_list');
      if (onUpdateVenueMediaList) {
        onUpdateVenueMediaList(DEFAULT_VENUE_MEDIA);
      }
    }
  };

  // ---------------------------------------------------------------------------
  // SETTINGS & PIN CHANGE (ADMIN ONLY)
  // ---------------------------------------------------------------------------
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUserRole !== 'admin') {
      alert('Chỉ Quản trị viên (Admin) mới có quyền chỉnh sửa cấu hình hệ thống!');
      return;
    }

    let msg = '';
    if (newAdminPin) {
      if (!/^\d{4}$/.test(newAdminPin)) {
        alert('Mã PIN Admin phải đúng 4 chữ số!');
        return;
      }
      setAdminPin(newAdminPin);
      localStorage.setItem('k8a1_admin_pin', newAdminPin);
      msg += 'Đã cập nhật mã PIN Admin mới. ';
      setNewAdminPin('');
    }

    if (newBllPin) {
      if (!/^\d{4}$/.test(newBllPin)) {
        alert('Mã PIN Ban Liên Lạc phải đúng 4 chữ số!');
        return;
      }
      setBllPin(newBllPin);
      localStorage.setItem('k8a1_bll_pin', newBllPin);
      msg += 'Đã cập nhật mã PIN Ban Liên Lạc mới. ';
      setNewBllPin('');
    }

    if (scriptUrlInput !== appsScriptUrl) {
      onSaveAppsScriptUrl(scriptUrlInput.trim());
      msg += 'Đã lưu URL Google Apps Script. ';
    }

    setSettingsSuccessMsg(msg || 'Đã lưu cài đặt thành công!');
    setTimeout(() => setSettingsSuccessMsg(''), 4000);
  };

  const handleResetToDefault = () => {
    if (currentUserRole !== 'admin') return;
    if (confirm('CẢNH BÁO: Bạn có chắc muốn khôi phục toàn bộ cài đặt mã PIN về mặc định (Admin: 8888, BLL: 2006)?')) {
      setAdminPin('8888');
      setBllPin('2006');
      localStorage.removeItem('k8a1_admin_pin');
      localStorage.removeItem('k8a1_bll_pin');
      alert('Đã khôi phục mã PIN mặc định thành công!');
    }
  };

  // Filtered members list
  const filteredMemberList = useMemo(() => {
    const q = (memberSearch || '').toLowerCase().trim();
    return rsvpList.filter(item => {
      const matchQuery = !q ||
        (item.fullName || '').toLowerCase().includes(q) ||
        (item.nickname || '').toLowerCase().includes(q) ||
        (item.phone || '').includes(q) ||
        (item.className || '').toLowerCase().includes(q);

      const matchStatus = 
        memberStatusFilter === 'all' ||
        (memberStatusFilter === 'yes' && item.status === 'yes') ||
        (memberStatusFilter === 'no' && item.status === 'no') ||
        (memberStatusFilter === 'checkedIn' && item.checkedIn) ||
        (memberStatusFilter === 'notCheckedIn' && item.status === 'yes' && !item.checkedIn);

      const matchShirt = memberShirtFilter === 'all' || item.shirtSize === memberShirtFilter;

      return matchQuery && matchStatus && matchShirt;
    });
  }, [rsvpList, memberSearch, memberStatusFilter, memberShirtFilter]);

  // Filtered fund list
  const filteredFundList = useMemo(() => {
    const q = (fundSearch || '').toLowerCase().trim();
    return rsvpList.filter(item => {
      const matchQuery = !q ||
        (item.fullName || '').toLowerCase().includes(q) ||
        (item.nickname || '').toLowerCase().includes(q) ||
        (item.phone || '').includes(q);

      const isPaid = item.fundStatus === 'paid';
      const matchFundStatus =
        fundStatusFilter === 'all' ||
        (fundStatusFilter === 'paid' && isPaid) ||
        (fundStatusFilter === 'unpaid' && !isPaid) ||
        (fundStatusFilter === 'extra' && isPaid && (item.fundAmount || 0) > 500000);

      return matchQuery && matchFundStatus;
    });
  }, [rsvpList, fundSearch, fundStatusFilter]);

  if (!isOpen) return null;

  // ===========================================================================
  // SCREEN 1: 4-DIGIT PIN AUTHENTICATION MODAL (FOR GUEST ROLE)
  // ===========================================================================
  if (currentUserRole === 'guest') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-gradient-to-b from-[#1E293B] via-[#0F172A] to-[#020617] text-white w-full max-w-sm rounded-2xl border-2 border-amber-500/40 shadow-2xl p-6 sm:p-7 space-y-6 relative overflow-hidden"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-14 h-14 mx-auto rounded-full bg-gradient-to-br from-amber-500 to-amber-700 p-0.5 shadow-lg flex items-center justify-center">
              <div className="w-full h-full rounded-full bg-[#0F172A] flex items-center justify-center">
                <KeyRound className="w-6 h-6 text-amber-400" />
              </div>
            </div>
            <h3 className="text-lg font-serif font-bold text-amber-200">
              Xác Thực Mã PIN Quản Trị
            </h3>
            <p className="text-xs text-slate-300 font-sans">
              Dành riêng cho <strong className="text-amber-300">Admin</strong> và <strong className="text-amber-300">Ban Liên Lạc K8A1</strong>
            </p>
          </div>

          {/* PIN Indicators (4 dots) */}
          <div className="flex justify-center items-center gap-3 py-2">
            {[0, 1, 2, 3].map((idx) => {
              const isFilled = enteredPin.length > idx;
              return (
                <div
                  key={idx}
                  className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
                    isFilled
                      ? 'bg-amber-400 border-amber-300 scale-110 shadow-md shadow-amber-400/50'
                      : 'border-slate-600 bg-slate-800/80'
                  }`}
                />
              );
            })}
          </div>

          {/* Error Message */}
          {pinError && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs text-rose-400 text-center font-medium bg-rose-950/50 py-1.5 px-3 rounded-lg border border-rose-800/40"
            >
              {pinError}
            </motion.p>
          )}

          {/* Numeric Keypad */}
          <div className="grid grid-cols-3 gap-2.5 max-w-[240px] mx-auto">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
              <button
                key={num}
                onClick={() => handlePinDigit(num)}
                disabled={isPinSubmitting}
                className="h-12 rounded-xl bg-slate-800/80 hover:bg-amber-500/20 active:bg-amber-500/30 border border-slate-700 hover:border-amber-400/50 text-base font-bold font-mono text-amber-100 transition-all active:scale-95 cursor-pointer flex items-center justify-center shadow-xs"
              >
                {num}
              </button>
            ))}
            <button
              onClick={handlePinClear}
              className="h-12 rounded-xl bg-slate-900/80 hover:bg-rose-950/40 border border-slate-800 text-xs font-sans font-bold text-rose-300 transition-all active:scale-95 cursor-pointer flex items-center justify-center"
            >
              Xóa
            </button>
            <button
              onClick={() => handlePinDigit('0')}
              disabled={isPinSubmitting}
              className="h-12 rounded-xl bg-slate-800/80 hover:bg-amber-500/20 active:bg-amber-500/30 border border-slate-700 hover:border-amber-400/50 text-base font-bold font-mono text-amber-100 transition-all active:scale-95 cursor-pointer flex items-center justify-center shadow-xs"
            >
              0
            </button>
            <button
              onClick={handlePinDelete}
              className="h-12 rounded-xl bg-slate-900/80 hover:bg-amber-950/40 border border-slate-800 text-sm font-sans font-bold text-amber-300 transition-all active:scale-95 cursor-pointer flex items-center justify-center"
            >
              ⌫
            </button>
          </div>

          {/* Hint info */}
          <div className="bg-white/5 border border-amber-400/20 rounded-xl p-3 text-[11px] text-slate-300 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-amber-300 font-bold">👑 Admin (Toàn quyền):</span>
              <span className="font-mono text-white bg-amber-950/80 px-2 py-0.5 rounded border border-amber-500/40">PIN: 8888</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-emerald-300 font-bold">🛡️ Ban Liên Lạc (Trực lễ tân):</span>
              <span className="font-mono text-white bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/40">PIN: 2006</span>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // ===========================================================================
  // SCREEN 2: MAIN MANAGEMENT HUB (WHEN AUTHENTICATED AS ADMIN OR BLL)
  // ===========================================================================
  const isAdmin = currentUserRole === 'admin';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md overflow-hidden">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="bg-[#FAF9F5] text-[#1E293B] w-full max-w-5xl h-[92vh] max-h-[850px] rounded-2xl border-2 border-amber-500/60 shadow-2xl flex flex-col overflow-hidden"
      >
        {/* =================================================================== */}
        {/* TOP HEADER BAR */}
        {/* =================================================================== */}
        <header className="bg-gradient-to-r from-[#1E293B] via-[#0F172A] to-[#1E293B] text-white px-4 sm:px-6 py-3.5 border-b border-amber-500/30 flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl flex items-center justify-center shadow-inner ${
              isAdmin 
                ? 'bg-gradient-to-br from-amber-500 to-amber-700 text-white' 
                : 'bg-gradient-to-br from-emerald-600 to-teal-700 text-white'
            }`}>
              {isAdmin ? <Crown className="w-5 h-5" /> : <Shield className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-serif font-bold text-amber-200 leading-tight">
                  Trung Tâm Quản Trị & Đối Soát K8A1
                </h2>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-sans font-bold uppercase tracking-wider ${
                  isAdmin 
                    ? 'bg-amber-400 text-amber-950 shadow-xs' 
                    : 'bg-emerald-400 text-emerald-950 shadow-xs'
                }`}>
                  {isAdmin ? '👑 ADMIN (Toàn Quyền)' : '🛡️ BAN LIÊN LẠC'}
                </span>
              </div>
              <p className="text-[11px] text-slate-300 font-sans">
                {isAdmin 
                  ? 'Quản lý thành viên, đối soát quỹ 500k, đổi ảnh bìa, video & cấu hình' 
                  : 'Tiếp đón thành viên, check-in tại bàn lễ tân và đối soát quỹ lớp'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onRefreshData && (
              <button
                onClick={onRefreshData}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-amber-200 text-xs font-sans font-bold rounded-lg border border-amber-400/30 transition cursor-pointer"
                title="Đồng bộ dữ liệu mới nhất từ Google Sheet"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Đồng Bộ Sheet</span>
              </button>
            )}

            <button
              onClick={onLogout}
              className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 text-xs font-sans font-bold rounded-lg border border-rose-500/40 transition cursor-pointer"
              title="Đăng xuất khỏi phiên làm việc"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Khóa PIN</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition cursor-pointer"
              title="Đóng bảng điều khiển"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* =================================================================== */}
        {/* KPI SUMMARY CARDS STRIP */}
        {/* =================================================================== */}
        <div className="bg-gradient-to-r from-amber-50 via-white to-amber-50 px-4 sm:px-6 py-2.5 border-b border-amber-200 grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 shrink-0 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-700 flex items-center justify-center font-bold">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-sans text-slate-500 font-bold">Xác Nhận Về Lớp</p>
              <p className="font-serif font-bold text-slate-900 text-sm">{confirmedCount} bạn</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-700 flex items-center justify-center font-bold">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-sans text-slate-500 font-bold">Đã Có Mặt (Check-in)</p>
              <p className="font-serif font-bold text-emerald-800 text-sm">{checkedInCount} / {confirmedCount}</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-700 flex items-center justify-center font-bold">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-sans text-slate-500 font-bold">Đã Đóng Quỹ 500k</p>
              <p className="font-serif font-bold text-blue-800 text-sm">{paidMembersCount} / {confirmedCount} bạn</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-700 flex items-center justify-center font-bold">
              <DollarSign className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-sans text-slate-500 font-bold">Tổng Quỹ Đã Thu</p>
              <p className="font-serif font-bold text-amber-900 text-sm">
                {(collectedFund / 1000000).toFixed(1)} triệu VNĐ
              </p>
            </div>
          </div>
        </div>

        {/* =================================================================== */}
        {/* NAVIGATION TABS */}
        {/* =================================================================== */}
        <div className="bg-white border-b border-amber-200 px-4 sm:px-6 flex items-center gap-1 sm:gap-2 overflow-x-auto shrink-0 py-2">
          <button
            onClick={() => setActiveTab('members')}
            className={`px-3 sm:px-4 py-2 rounded-lg text-xs font-sans font-bold flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap ${
              activeTab === 'members'
                ? 'bg-[#1E293B] text-amber-300 shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>1. Điểm Danh & Thành Viên</span>
          </button>

          <button
            onClick={() => setActiveTab('fund')}
            className={`px-3 sm:px-4 py-2 rounded-lg text-xs font-sans font-bold flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap ${
              activeTab === 'fund'
                ? 'bg-[#1E293B] text-amber-300 shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>2. Đối Soát Quỹ Lớp (500k)</span>
          </button>

          <button
            onClick={() => setActiveTab('wishes')}
            className={`px-3 sm:px-4 py-2 rounded-lg text-xs font-sans font-bold flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap ${
              activeTab === 'wishes'
                ? 'bg-[#1E293B] text-amber-300 shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>3. Lưu Bút & Lời Chúc</span>
          </button>

          <button
            onClick={() => setActiveTab('media')}
            className={`px-3 sm:px-4 py-2 rounded-lg text-xs font-sans font-bold flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap ${
              activeTab === 'media'
                ? 'bg-[#1E293B] text-amber-300 shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span>4. Ảnh Bìa, Video & Gallery</span>
          </button>

          {isAdmin && (
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-3 sm:px-4 py-2 rounded-lg text-xs font-sans font-bold flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap ${
                activeTab === 'settings'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-amber-800 hover:bg-amber-50'
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              <span>5. Cài Đặt Hệ Thống 👑</span>
            </button>
          )}
        </div>

        {/* =================================================================== */}
        {/* TAB BODY CONTAINER */}
        {/* =================================================================== */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">

          {/* --------------------------------------------------------------- */}
          {/* TAB 1: MEMBER MANAGEMENT */}
          {/* --------------------------------------------------------------- */}
          {activeTab === 'members' && (
            <div className="space-y-4">
              {/* Controls Toolbar */}
              <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-amber-200 shadow-2xs">
                <div className="flex flex-1 items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={memberSearch}
                      onChange={(e) => setMemberSearch(e.target.value)}
                      placeholder="Tìm theo tên bạn, biệt danh, số điện thoại..."
                      className="w-full pl-9 pr-3 py-2 bg-[#FAF8F5] border border-slate-300 rounded-lg text-xs font-sans focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <select
                    value={memberStatusFilter}
                    onChange={(e) => setMemberStatusFilter(e.target.value as any)}
                    className="px-3 py-2 bg-[#FAF8F5] border border-slate-300 rounded-lg text-xs font-sans focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    <option value="all">Tất cả ({rsvpList.length})</option>
                    <option value="yes">Có tham gia ({confirmedCount})</option>
                    <option value="checkedIn">Đã check-in ({checkedInCount})</option>
                    <option value="notCheckedIn">Chưa check-in ({confirmedCount - checkedInCount})</option>
                    <option value="no">Vắng mặt ({rsvpList.length - confirmedCount})</option>
                  </select>

                  <select
                    value={memberShirtFilter}
                    onChange={(e) => setMemberShirtFilter(e.target.value)}
                    className="hidden sm:block px-3 py-2 bg-[#FAF8F5] border border-slate-300 rounded-lg text-xs font-sans focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    <option value="all">Tất cả size áo</option>
                    <option value="S">Size S</option>
                    <option value="M">Size M</option>
                    <option value="L">Size L</option>
                    <option value="XL">Size XL</option>
                    <option value="XXL">Size XXL</option>
                    <option value="3XL">Size 3XL</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={handleOpenAddMember}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white text-xs font-sans font-bold rounded-lg shadow-sm transition cursor-pointer"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>+ Thêm Bạn Học</span>
                  </button>

                  <button
                    onClick={handleExportRsvpCsv}
                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-sans font-bold rounded-lg transition cursor-pointer"
                    title="Xuất file danh sách điểm danh Excel/CSV"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-500" />
                    <span className="hidden sm:inline">Xuất CSV</span>
                  </button>
                </div>
              </div>

              {/* Members Table */}
              <div className="bg-white rounded-xl border border-amber-200 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#F8F5EE] text-slate-600 font-sans uppercase text-[10px] tracking-wider border-b border-amber-200">
                      <tr>
                        <th className="py-3 px-3 w-10 text-center">STT</th>
                        <th className="py-3 px-3">Họ và Tên</th>
                        <th className="py-3 px-3">Số Điện Thoại</th>
                        <th className="py-3 px-3">Size Áo</th>
                        <th className="py-3 px-3">Điểm Danh Đến</th>
                        <th className="py-3 px-3">Quỹ 500k</th>
                        <th className="py-3 px-3 text-right">Thao Tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-sans">
                      {filteredMemberList.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-slate-400 italic font-serif">
                            Không tìm thấy bạn học nào khớp với bộ lọc tìm kiếm.
                          </td>
                        </tr>
                      ) : (
                        filteredMemberList.map((item, idx) => (
                          <tr key={item.id || item.phone} className="hover:bg-amber-50/40 transition">
                            <td className="py-2.5 px-3 text-center text-slate-400 font-mono">
                              {idx + 1}
                            </td>

                            <td className="py-2.5 px-3">
                              <div className="font-bold text-slate-900 text-sm">
                                {item.fullName}
                              </div>
                              <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                                {item.nickname && (
                                  <span className="text-amber-800 italic">“{item.nickname}”</span>
                                )}
                                <span className="bg-slate-100 px-1.5 py-0.2 rounded text-[10px] font-mono">
                                  {item.className || 'K8A1'}
                                </span>
                              </div>
                            </td>

                            <td className="py-2.5 px-3 font-mono text-slate-600">
                              {item.phone}
                            </td>

                            <td className="py-2.5 px-3">
                              <span className="inline-flex items-center gap-1 font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                                <Shirt className="w-3 h-3 text-amber-600" />
                                <span>{item.shirtSize || 'L'}</span>
                              </span>
                            </td>

                            <td className="py-2.5 px-3">
                              {item.status === 'yes' ? (
                                <button
                                  onClick={() => handleToggleCheckIn(item)}
                                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition cursor-pointer ${
                                    item.checkedIn
                                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-2xs'
                                      : 'bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 border border-slate-300'
                                  }`}
                                >
                                  {item.checkedIn ? (
                                    <>
                                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                      <span>Đã Đến ({item.checkedInAt || 'OK'})</span>
                                    </>
                                  ) : (
                                    <>
                                      <UserX className="w-3.5 h-3.5 text-slate-400" />
                                      <span>Chưa Đến</span>
                                    </>
                                  )}
                                </button>
                              ) : (
                                <span className="text-rose-600 font-serif italic text-xs">Vắng mặt</span>
                              )}
                            </td>

                            <td className="py-2.5 px-3">
                              <button
                                onClick={() => handleToggleFundPaid(item)}
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold transition cursor-pointer ${
                                  item.fundStatus === 'paid'
                                    ? 'bg-blue-100 text-blue-800 border border-blue-300'
                                    : 'bg-amber-100/60 text-amber-800 border border-amber-300/80 hover:bg-blue-50'
                                }`}
                              >
                                {item.fundStatus === 'paid' ? (
                                  <>
                                    <Check className="w-3 h-3 text-blue-700" />
                                    <span>Đã nộp {(item.fundAmount || 500000).toLocaleString('vi-VN')}đ</span>
                                  </>
                                ) : (
                                  <>
                                    <Clock className="w-3 h-3 text-amber-600" />
                                    <span>Chưa nộp</span>
                                  </>
                                )}
                              </button>
                            </td>

                            <td className="py-2.5 px-3 text-right">
                              <div className="flex items-center justify-end gap-1">
                                {onOpenPassModal && (
                                  <button
                                    onClick={() => onOpenPassModal(item)}
                                    className="p-1.5 text-slate-500 hover:text-amber-700 hover:bg-amber-100/50 rounded transition"
                                    title="Xem Thẻ Học Sinh Kỷ Niệm"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>
                                )}

                                <button
                                  onClick={() => handleOpenEditMember(item)}
                                  className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-100/50 rounded transition"
                                  title="Sửa thông tin"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>

                                {isAdmin && (
                                  <button
                                    onClick={() => handleDeleteMember(item)}
                                    className="p-1.5 text-slate-500 hover:text-rose-700 hover:bg-rose-100/50 rounded transition"
                                    title="Xóa thành viên (Chỉ Admin)"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* --------------------------------------------------------------- */}
          {/* TAB 2: FUND RECONCILIATION */}
          {/* --------------------------------------------------------------- */}
          {activeTab === 'fund' && (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-[#1A1613] via-[#26201A] to-[#14110F] text-white p-5 rounded-xl border border-amber-400/40 shadow-lg relative overflow-hidden">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
                  <div className="space-y-1">
                    <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-amber-300">
                      Bảng Kế Toán & Đối Soát Đóng Góp Hội Khóa K8A1
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-serif font-bold text-amber-100">
                      Mức thu cố định: 500.000 VNĐ / bạn
                    </h3>
                    <p className="text-xs text-slate-300 font-sans">
                      Chi phí bao gồm: Tiệc trưa Crown Palace, Áo đồng phục kỷ niệm 20 năm, Thẻ quà tặng và Backdrop chụp hình.
                    </p>
                  </div>

                  <button
                    onClick={handleExportFundCsv}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-sans font-bold uppercase tracking-wider rounded-lg shadow-md transition cursor-pointer shrink-0"
                  >
                    <Download className="w-4 h-4" />
                    <span>Xuất Sổ Quỹ (CSV)</span>
                  </button>
                </div>

                <div className="mt-4 pt-3 border-t border-amber-400/20 space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-amber-200">
                      Tiến độ thu: <strong>{paidMembersCount} / {confirmedCount}</strong> bạn ({expectedFund > 0 ? Math.round((collectedFund / expectedFund) * 100) : 0}%)
                    </span>
                    <span className="font-mono text-amber-300 font-bold">
                      {collectedFund.toLocaleString('vi-VN')} / {expectedFund.toLocaleString('vi-VN')} đ
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-amber-400 to-emerald-400 h-full rounded-full transition-all duration-500"
                      style={{ width: `${expectedFund > 0 ? Math.min(100, Math.round((collectedFund / expectedFund) * 100)) : 0}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Fund Search Toolbar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-amber-200">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={fundSearch}
                    onChange={(e) => setFundSearch(e.target.value)}
                    placeholder="Tìm theo tên bạn, số điện thoại..."
                    className="w-full pl-9 pr-3 py-2 bg-[#FAF8F5] border border-slate-300 rounded-lg text-xs font-sans focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={fundStatusFilter}
                    onChange={(e) => setFundStatusFilter(e.target.value as any)}
                    className="px-3 py-2 bg-[#FAF8F5] border border-slate-300 rounded-lg text-xs font-sans focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    <option value="all">Tất cả trạng thái</option>
                    <option value="paid">Đã đóng tiền ({paidMembersCount})</option>
                    <option value="unpaid">Chưa đóng tiền ({rsvpList.length - paidMembersCount})</option>
                    <option value="extra">Đóng thêm ủng hộ ({rsvpList.filter(a => a.fundStatus === 'paid' && (a.fundAmount || 0) > 500000).length})</option>
                  </select>
                </div>
              </div>

              {/* Fund Table */}
              <div className="bg-white rounded-xl border border-amber-200 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#F8F5EE] text-slate-600 font-sans uppercase text-[10px] tracking-wider border-b border-amber-200">
                      <tr>
                        <th className="py-3 px-3 w-10 text-center">STT</th>
                        <th className="py-3 px-3">Họ và Tên</th>
                        <th className="py-3 px-3">Số Điện Thoại</th>
                        <th className="py-3 px-3">Số Tiền Đã Thu</th>
                        <th className="py-3 px-3">Trạng Thái 1-Chạm</th>
                        <th className="py-3 px-3">Ghi Chú Kế Toán</th>
                        <th className="py-3 px-3 text-right">Điều Chỉnh</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-sans">
                      {filteredFundList.map((item, idx) => {
                        const isPaid = item.fundStatus === 'paid';
                        const amount = item.fundAmount !== undefined ? item.fundAmount : (isPaid ? 500000 : 0);
                        return (
                          <tr key={item.id || item.phone} className="hover:bg-amber-50/40 transition">
                            <td className="py-2.5 px-3 text-center text-slate-400 font-mono">
                              {idx + 1}
                            </td>

                            <td className="py-2.5 px-3">
                              <span className="font-bold text-slate-900 text-sm">
                                {item.fullName}
                              </span>
                              {item.nickname && (
                                <span className="text-amber-800 text-[11px] block italic">
                                  “{item.nickname}”
                                </span>
                              )}
                            </td>

                            <td className="py-2.5 px-3 font-mono text-slate-600">
                              {item.phone}
                            </td>

                            <td className="py-2.5 px-3">
                              <span className={`font-mono font-bold text-xs ${isPaid ? 'text-emerald-700' : 'text-slate-400'}`}>
                                {isPaid ? `${amount.toLocaleString('vi-VN')} đ` : '0 đ'}
                              </span>
                              {isPaid && amount > 500000 && (
                                <span className="block text-[10px] font-sans font-bold text-amber-700 uppercase">
                                  + Ủng hộ thêm {(amount - 500000).toLocaleString('vi-VN')}đ
                                </span>
                              )}
                            </td>

                            <td className="py-2.5 px-3">
                              <button
                                onClick={() => handleToggleFundPaid(item)}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
                                  isPaid
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-2xs'
                                    : 'bg-rose-50 hover:bg-emerald-50 text-rose-700 hover:text-emerald-700 border border-rose-200'
                                }`}
                              >
                                {isPaid ? (
                                  <>
                                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                                    <span>Đã Thu Tiền</span>
                                  </>
                                ) : (
                                  <>
                                    <Clock className="w-3.5 h-3.5 text-rose-500" />
                                    <span>Chưa Nộp (Bấm để thu)</span>
                                  </>
                                )}
                              </button>
                            </td>

                            <td className="py-2.5 px-3 text-slate-600 text-xs italic">
                              {item.fundNote || (isPaid ? 'Đã đóng 500.000đ' : 'Chưa đóng')}
                            </td>

                            <td className="py-2.5 px-3 text-right">
                              <button
                                onClick={() => handleOpenAdjustFund(item)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-sans font-bold text-amber-800 hover:text-amber-950 bg-amber-100/60 hover:bg-amber-200/80 border border-amber-300/80 rounded transition cursor-pointer"
                              >
                                <Edit className="w-3 h-3" />
                                <span>Sửa Tiền</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* --------------------------------------------------------------- */}
          {/* TAB 3: WISHES GUESTBOOK CRUD */}
          {/* --------------------------------------------------------------- */}
          {activeTab === 'wishes' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-white p-3.5 rounded-xl border border-amber-200">
                <div>
                  <h3 className="text-sm font-bold font-serif text-slate-900">
                    Bức Tường Lưu Bút & Lời Chúc K8A1 ({wishesList.length} lời nhắn)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Admin & Ban Liên Lạc có thể kiểm duyệt, sửa, ghim hoặc xóa các lời chúc không phù hợp.
                  </p>
                </div>

                <button
                  onClick={handleOpenAddWish}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 text-white text-xs font-sans font-bold rounded-lg shadow-sm transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Viết Lưu Bút Mới</span>
                </button>
              </div>

              {/* Wishes Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {wishesList.map((wish) => (
                  <div
                    key={wish.id}
                    className={`p-4 rounded-xl border shadow-xs flex flex-col justify-between space-y-3 relative ${
                      wish.isPinned ? 'bg-amber-50/90 border-amber-400 ring-2 ring-amber-300' : 'bg-white border-slate-200'
                    }`}
                  >
                    {wish.isPinned && (
                      <span className="absolute top-2 right-2 px-2 py-0.5 bg-amber-500 text-white text-[9px] font-bold uppercase tracking-wider rounded-full shadow-2xs flex items-center gap-1">
                        <Pin className="w-2.5 h-2.5" /> Đã Ghim
                      </span>
                    )}

                    <div className="space-y-2">
                      <div className="flex items-center justify-between pr-14">
                        <div className="font-bold text-slate-900 text-sm font-serif">
                          {wish.fullName}
                          <span className="ml-1.5 text-[11px] font-sans font-normal text-slate-500">
                            ({wish.className || 'K8A1'})
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-700 font-serif leading-relaxed italic">
                        “{wish.message}”
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-[10px] text-slate-400 font-sans">
                        {wish.submittedAt || 'Mới đây'}
                      </span>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleTogglePinWish(wish)}
                          className={`p-1.5 rounded transition ${wish.isPinned ? 'text-amber-600 bg-amber-100' : 'text-slate-400 hover:text-amber-600'}`}
                          title={wish.isPinned ? 'Bỏ ghim' : 'Ghim lên đầu'}
                        >
                          <Pin className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleOpenEditWish(wish)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 transition"
                          title="Sửa lời chúc"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleDeleteWish(wish)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 transition"
                          title="Xóa lời chúc"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* --------------------------------------------------------------- */}
          {/* TAB 4: MEDIA, HERO BANNER & GALLERY */}
          {/* --------------------------------------------------------------- */}
          {activeTab === 'media' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-amber-200 gap-2 flex-wrap">
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                  <button
                    onClick={() => setMediaSubTab('venue')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-sans font-bold flex items-center gap-1.5 transition cursor-pointer shrink-0 ${
                      mediaSubTab === 'venue' ? 'bg-[#1E293B] text-amber-300' : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    <span>Không Gian Nhà Hàng ({venueMediaListState.length})</span>
                  </button>

                  <button
                    onClick={() => setMediaSubTab('banner')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-sans font-bold flex items-center gap-1.5 transition cursor-pointer shrink-0 ${
                      mediaSubTab === 'banner' ? 'bg-[#1E293B] text-amber-300' : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Ảnh Bìa Hero Banner</span>
                  </button>

                  <button
                    onClick={() => setMediaSubTab('videos')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-sans font-bold flex items-center gap-1.5 transition cursor-pointer shrink-0 ${
                      mediaSubTab === 'videos' ? 'bg-[#1E293B] text-amber-300' : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Thước Phim Video ({videos.length})</span>
                  </button>

                  <button
                    onClick={() => setMediaSubTab('photos')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-sans font-bold flex items-center gap-1.5 transition cursor-pointer shrink-0 ${
                      mediaSubTab === 'photos' ? 'bg-[#1E293B] text-amber-300' : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Thư Viện Kỷ Yếu ({images.length})</span>
                  </button>
                </div>

                {mediaSubTab === 'venue' && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleResetVenueMedia}
                      className="px-2.5 py-1.5 text-xs text-slate-600 hover:text-slate-900 bg-slate-100 rounded-lg hover:bg-slate-200 transition cursor-pointer"
                    >
                      Khôi Phục Mặc Định
                    </button>
                    <button
                      onClick={() => {
                        setVenueMediaFormData({ title: '', url: '', desc: '' });
                        setIsAddVenueMediaModalOpen(true);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-sans font-bold rounded-lg transition cursor-pointer shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Thêm Video / Ảnh Nhà Hàng</span>
                    </button>
                  </div>
                )}

                {mediaSubTab === 'videos' && (
                  <button
                    onClick={() => setIsAddVideoModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-sans font-bold rounded-lg transition cursor-pointer shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Chèn Link Video</span>
                  </button>
                )}

                {mediaSubTab === 'photos' && (
                  <div className="flex items-center gap-2">
                    <a
                      href={K8A1_DRIVE_FOLDER_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-amber-50 text-slate-700 border border-slate-300 rounded-lg text-xs font-sans font-semibold transition cursor-pointer"
                      title={`Mở thư mục Google Drive (ID: ${K8A1_DRIVE_FOLDER_ID})`}
                    >
                      <Folder className="w-3.5 h-3.5 text-amber-600" />
                      <span>Folder Drive Lớp</span>
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </a>
                    <button
                      onClick={() => setIsAddPhotoModalOpen(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-sans font-bold rounded-lg transition cursor-pointer shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Thêm Ảnh Mới</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Sub-tab: VENUE MEDIA MANAGEMENT (FACEBOOK REELS, VIDEOS, PHOTOS) */}
              {mediaSubTab === 'venue' && (
                <div className="space-y-4">
                  <div className="bg-amber-50/70 border border-amber-200/80 p-3.5 rounded-xl text-xs space-y-1 text-left">
                    <p className="font-bold text-amber-950 flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-amber-700" />
                      <span>Quản Lý Video & Ảnh Không Gian Nhà Hàng (Dành cho Ban Liên Lạc)</span>
                    </p>
                    <p className="text-slate-600 font-serif italic text-[11px]">
                      Hỗ trợ dán link <strong>Facebook Reel, Facebook Video, YouTube, Google Drive, MP4</strong> hoặc tải ảnh trực tiếp để minh họa không gian tổ chức tại Crown Palace Thái Nguyên.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {venueMediaListState.map((item, idx) => {
                      const parsed = parseVenueMedia(item.url);
                      return (
                        <div key={item.id || idx} className="bg-white rounded-xl border border-amber-200 overflow-hidden shadow-xs flex flex-col justify-between text-left group">
                          <div className="aspect-video bg-black relative flex items-center justify-center overflow-hidden">
                            {parsed.type === 'image' ? (
                              <img
                                src={parsed.embedUrl}
                                alt={item.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition"
                              />
                            ) : (
                              <div className="w-full h-full relative">
                                <iframe
                                  src={parsed.embedUrl}
                                  title={item.title}
                                  className="w-full h-full border-0 pointer-events-none"
                                />
                                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                                  <Play className="w-8 h-8 text-amber-300 fill-amber-300/60" />
                                </div>
                              </div>
                            )}

                            <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[9px] font-sans font-bold bg-black/75 text-amber-300 border border-amber-400/30">
                              {parsed.label}
                            </span>
                          </div>

                          <div className="p-3 space-y-1.5">
                            <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{item.title}</h4>
                            <p className="text-[11px] text-slate-500 font-serif italic line-clamp-2">{item.desc || item.url}</p>
                            
                            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                              <a
                                href={item.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[10px] text-amber-800 hover:text-amber-950 flex items-center gap-1 font-semibold"
                              >
                                <span>Xem link gốc</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>

                              <button
                                onClick={() => handleDeleteVenueMedia(item)}
                                className="p-1 text-slate-400 hover:text-rose-600 transition"
                                title="Xóa mục này"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Sub-tab: HERO BANNER COVER MANAGEMENT */}
              {mediaSubTab === 'banner' && (
                <div className="bg-white p-5 rounded-xl border border-amber-300 shadow-sm space-y-4">
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-slate-900 font-serif flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-amber-600" />
                      <span>Tùy Chỉnh & Tải Lên Ảnh Bìa Đầu Trang (Hero Banner)</span>
                    </h4>
                    <p className="text-xs text-slate-500">
                      Ảnh bìa hiển thị tràn ngang toàn màn hình trên desktop và mờ dần xuống nền trang. Bạn có thể dán đường link ảnh hoặc bấm "Tải ảnh từ máy" lên.
                    </p>
                  </div>

                  {settingsSuccessMsg && (
                    <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-lg text-xs font-bold flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      <span>{settingsSuccessMsg}</span>
                    </div>
                  )}

                  {/* Banner Preview */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 block">Xem trước ảnh bìa hiện tại:</label>
                    <div className="w-full h-48 sm:h-56 rounded-xl overflow-hidden relative border-2 border-dashed border-amber-300 bg-slate-900 shadow-inner">
                      <img
                        src={bannerInput}
                        alt="Preview Banner"
                        className="w-full h-full object-cover object-center"
                      />
                      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#FDFBF7] to-transparent pointer-events-none" />
                      <span className="absolute top-2 left-2 px-2 py-1 bg-black/60 backdrop-blur-md rounded text-[10px] text-amber-200 font-mono">
                        Ảnh xem trước (Hiệu ứng mờ dần cạnh dưới)
                      </span>
                    </div>
                  </div>

                  <form onSubmit={handleSaveBanner} className="space-y-3 text-xs">
                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-700 block">
                        Đường dẫn ảnh (URL) hoặc tải file từ máy tính/điện thoại:
                      </label>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <input
                          type="text"
                          value={bannerInput}
                          onChange={(e) => setBannerInput(e.target.value)}
                          placeholder="https://... dán link ảnh JPG/PNG/Unsplash/Google Drive"
                          className="flex-1 px-3 py-2 bg-[#FAF8F5] border border-slate-300 rounded-lg font-mono text-xs focus:outline-none focus:border-amber-500"
                        />
                        
                        <label className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-amber-200 font-bold rounded-lg cursor-pointer transition whitespace-nowrap shadow-xs">
                          <Upload className="w-3.5 h-3.5" />
                          <span>Tải Ảnh Từ Máy</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleBannerFileUpload}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={handleResetBanner}
                        className="inline-flex items-center gap-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                        <span>Khôi Phục Mặc Định</span>
                      </button>

                      <button
                        type="submit"
                        className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 text-white font-bold rounded-lg shadow-sm transition cursor-pointer"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>Lưu Ảnh Bìa Hero</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Sub-tab: Videos */}
              {mediaSubTab === 'videos' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {videos.map((vid, idx) => (
                    <div key={vid.id || idx} className="bg-white rounded-xl border border-amber-200 overflow-hidden shadow-xs flex flex-col justify-between">
                      <div className="aspect-video bg-black relative">
                        <iframe
                          src={vid.embedUrl}
                          title={vid.title}
                          className="w-full h-full border-0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                      <div className="p-3 space-y-2">
                        <h4 className="text-xs font-bold text-slate-900 line-clamp-2">{vid.title}</h4>
                        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                          <span className="text-[10px] text-slate-400 font-mono truncate max-w-[140px]">{vid.embedUrl}</span>
                          <button
                            onClick={() => handleDeleteVideo(vid)}
                            className="p-1 text-slate-400 hover:text-rose-600 transition"
                            title="Xóa video"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Sub-tab: Photos */}
              {mediaSubTab === 'photos' && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {images.map((img, idx) => (
                    <div key={img.id || idx} className="bg-white rounded-xl border border-amber-200 overflow-hidden shadow-xs flex flex-col justify-between group">
                      <div className="aspect-square bg-slate-100 relative overflow-hidden">
                        <img
                          src={img.url}
                          alt={img.caption}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        />
                      </div>
                      <div className="p-2.5 space-y-1">
                        <p className="text-[11px] font-bold text-slate-800 line-clamp-1">{img.caption}</p>
                        <div className="flex items-center justify-between text-[10px] text-slate-400">
                          <span>{img.date || 'Kỷ niệm xưa'}</span>
                          <button
                            onClick={() => handleDeletePhoto(img)}
                            className="p-1 text-slate-400 hover:text-rose-600 transition"
                            title="Xóa ảnh"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* --------------------------------------------------------------- */}
          {/* TAB 5: SYSTEM SETTINGS & PIN MANAGEMENT (ADMIN ONLY) */}
          {/* --------------------------------------------------------------- */}
          {activeTab === 'settings' && isAdmin && (
            <div className="space-y-5 max-w-2xl mx-auto">
              <div className="bg-white p-5 rounded-xl border border-amber-300 shadow-sm space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-amber-200">
                  <Shield className="w-5 h-5 text-amber-600" />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 font-serif">
                      Cấu Hình Mã PIN & Bảo Mật Hệ Thống
                    </h3>
                    <p className="text-xs text-slate-500">
                      Mã PIN 4 số giúp Trưởng Ban & Ban Liên Lạc truy cập nhanh các quyền quản trị.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
                  {settingsSuccessMsg && (
                    <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-lg font-bold flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      <span>{settingsSuccessMsg}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-700 flex items-center justify-between">
                        <span>👑 Mã PIN Admin (Toàn quyền):</span>
                        <span className="font-mono text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">Hiện tại: {adminPin}</span>
                      </label>
                      <input
                        type="password"
                        maxLength={4}
                        value={newAdminPin}
                        onChange={(e) => setNewAdminPin(e.target.value.replace(/\D/g, ''))}
                        placeholder="Nhập 4 số PIN Admin mới..."
                        className="w-full px-3 py-2 bg-[#FAF8F5] border border-slate-300 rounded-lg font-mono text-sm focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-700 flex items-center justify-between">
                        <span>🛡️ Mã PIN Ban Liên Lạc:</span>
                        <span className="font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">Hiện tại: {bllPin}</span>
                      </label>
                      <input
                        type="password"
                        maxLength={4}
                        value={newBllPin}
                        onChange={(e) => setNewBllPin(e.target.value.replace(/\D/g, ''))}
                        placeholder="Nhập 4 số PIN BLL mới..."
                        className="w-full px-3 py-2 bg-[#FAF8F5] border border-slate-300 rounded-lg font-mono text-sm focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-2">
                    <label className="font-bold text-slate-700 block">
                      🔗 URL Google Apps Script WebApp (Backend Sheet):
                    </label>
                    <input
                      type="url"
                      value={scriptUrlInput}
                      onChange={(e) => setScriptUrlInput(e.target.value)}
                      placeholder="https://script.google.com/macros/s/.../exec"
                      className="w-full px-3 py-2 bg-[#FAF8F5] border border-slate-300 rounded-lg font-mono text-xs focus:outline-none focus:border-amber-500"
                    />
                    <p className="text-[11px] text-slate-400">
                      URL này kết nối trực tiếp với Google Sheets và Google Drive để đồng bộ Điểm danh, Lưu bút và Đếm lượt xem.
                    </p>
                  </div>

                  <div className="pt-3 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={handleResetToDefault}
                      className="px-3 py-2 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 rounded-lg text-xs font-bold border border-slate-200 transition cursor-pointer"
                    >
                      Khôi Phục PIN Mặc Định (8888/2006)
                    </button>

                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 text-white rounded-lg text-xs font-bold uppercase tracking-wider shadow-md transition cursor-pointer flex items-center gap-1.5"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Lưu Cấu Hình</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

        </div>
      </motion.div>

      {/* =================================================================== */}
      {/* MODAL: ADD / EDIT MEMBER */}
      {/* =================================================================== */}
      <AnimatePresence>
        {isAddMemberModalOpen && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl border border-amber-300 shadow-2xl w-full max-w-md p-6 space-y-4 text-xs"
            >
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <h3 className="text-base font-bold font-serif text-slate-900">
                  {editingMember ? '✏️ Chỉnh Sửa Thông Tin Thành Viên' : '➕ Thêm Bạn Học Mới (K8A1)'}
                </h3>
                <button
                  onClick={() => setIsAddMemberModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded-full"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveMember} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Họ và Tên (*):</label>
                    <input
                      type="text"
                      required
                      value={memberFormData.fullName || ''}
                      onChange={(e) => setMemberFormData({ ...memberFormData, fullName: e.target.value })}
                      placeholder="VD: Nguyễn Tuấn Anh"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Biệt danh thời cấp 3:</label>
                    <input
                      type="text"
                      value={memberFormData.nickname || ''}
                      onChange={(e) => setMemberFormData({ ...memberFormData, nickname: e.target.value })}
                      placeholder="VD: Tuấn Báo"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Số Điện Thoại (*):</label>
                    <input
                      type="tel"
                      required
                      value={memberFormData.phone || ''}
                      onChange={(e) => setMemberFormData({ ...memberFormData, phone: e.target.value })}
                      placeholder="0988..."
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Size Áo Đồng Phục:</label>
                    <select
                      value={memberFormData.shirtSize || 'L'}
                      onChange={(e) => setMemberFormData({ ...memberFormData, shirtSize: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-amber-500 cursor-pointer"
                    >
                      <option value="S">Size S (Nữ &lt;48kg / Nam &lt;55kg)</option>
                      <option value="M">Size M (48-56kg)</option>
                      <option value="L">Size L (57-65kg)</option>
                      <option value="XL">Size XL (66-74kg)</option>
                      <option value="XXL">Size XXL (75-84kg)</option>
                      <option value="3XL">Size 3XL (&gt;85kg)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Xác Nhận Tham Dự:</label>
                    <select
                      value={memberFormData.status || 'yes'}
                      onChange={(e) => setMemberFormData({ ...memberFormData, status: e.target.value as any })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-amber-500 cursor-pointer"
                    >
                      <option value="yes">✅ Có tham gia hội khóa</option>
                      <option value="no">❌ Rất tiếc vắng mặt</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Trạng Thái Quỹ 500k:</label>
                    <select
                      value={memberFormData.fundStatus || 'unpaid'}
                      onChange={(e) => setMemberFormData({ ...memberFormData, fundStatus: e.target.value as any })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-amber-500 cursor-pointer"
                    >
                      <option value="unpaid">Chưa đóng</option>
                      <option value="paid">Đã đóng 500.000đ</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Lời nhắn gửi cả lớp:</label>
                  <textarea
                    rows={2}
                    value={memberFormData.message || ''}
                    onChange={(e) => setMemberFormData({ ...memberFormData, message: e.target.value })}
                    placeholder="VD: Hẹn gặp anh em bàn cuối nhé!"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddMemberModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg shadow-sm cursor-pointer"
                  >
                    {editingMember ? 'Cập Nhật' : 'Lưu Thành Viên'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =================================================================== */}
      {/* MODAL: ADJUST FUND AMOUNT */}
      {/* =================================================================== */}
      <AnimatePresence>
        {adjustFundMember && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl border border-amber-300 shadow-2xl w-full max-w-sm p-6 space-y-4 text-xs"
            >
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <h3 className="text-base font-bold font-serif text-slate-900">
                    💰 Đối Soát Quỹ: {adjustFundMember.fullName}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Cập nhật số tiền thực nộp và ghi chú giao dịch
                  </p>
                </div>
                <button
                  onClick={() => setAdjustFundMember(null)}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded-full"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveAdjustFund} className="space-y-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Số Tiền Đã Nộp (VNĐ):</label>
                  <input
                    type="number"
                    step={50000}
                    value={fundAdjustAmount}
                    onChange={(e) => setFundAdjustAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-base font-bold text-emerald-700 focus:outline-none focus:border-amber-500"
                  />
                  <div className="flex gap-1 pt-1">
                    <button
                      type="button"
                      onClick={() => setFundAdjustAmount(500000)}
                      className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[10px] font-bold"
                    >
                      500k chuẩn
                    </button>
                    <button
                      type="button"
                      onClick={() => setFundAdjustAmount(1000000)}
                      className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[10px] font-bold"
                    >
                      1 triệu
                    </button>
                    <button
                      type="button"
                      onClick={() => setFundAdjustAmount(2000000)}
                      className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[10px] font-bold"
                    >
                      2 triệu
                    </button>
                    <button
                      type="button"
                      onClick={() => setFundAdjustAmount(0)}
                      className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[10px] font-bold"
                    >
                      0đ
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Ghi chú đối soát:</label>
                  <input
                    type="text"
                    value={fundAdjustNote}
                    onChange={(e) => setFundAdjustNote(e.target.value)}
                    placeholder="VD: CK VCB lúc 10:30, Tiền mặt bàn đón tiếp..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setAdjustFundMember(null)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-sm cursor-pointer"
                  >
                    Lưu Đối Soát
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =================================================================== */}
      {/* MODAL: ADD / EDIT WISH */}
      {/* =================================================================== */}
      <AnimatePresence>
        {isAddWishModalOpen && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl border border-amber-300 shadow-2xl w-full max-w-md p-6 space-y-4 text-xs"
            >
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <h3 className="text-base font-bold font-serif text-slate-900">
                  {editingWish ? '✏️ Sửa Lưu Bút' : '💌 Viết Lưu Bút Mới'}
                </h3>
                <button
                  onClick={() => setIsAddWishModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded-full"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveWish} className="space-y-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Tên người gửi (*):</label>
                  <input
                    type="text"
                    required
                    value={wishFormData.fullName || ''}
                    onChange={(e) => setWishFormData({ ...wishFormData, fullName: e.target.value })}
                    placeholder="VD: Tuấn Anh (Tổ 1)"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Nội dung lưu bút (*):</label>
                  <textarea
                    rows={4}
                    required
                    value={wishFormData.message || ''}
                    onChange={(e) => setWishFormData({ ...wishFormData, message: e.target.value })}
                    placeholder="Viết lời nhắn gửi tới bạn bè và thầy cô..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddWishModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg shadow-sm cursor-pointer"
                  >
                    {editingWish ? 'Cập Nhật' : 'Đăng Lưu Bút'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =================================================================== */}
      {/* MODAL: ADD VIDEO */}
      {/* =================================================================== */}
      <AnimatePresence>
        {isAddVideoModalOpen && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl border border-amber-300 shadow-2xl w-full max-w-md p-6 space-y-4 text-xs"
            >
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <h3 className="text-base font-bold font-serif text-slate-900">
                  🎬 Chèn Link Video YouTube / Google Drive
                </h3>
                <button
                  onClick={() => setIsAddVideoModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded-full"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveVideo} className="space-y-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Tiêu đề video (*):</label>
                  <input
                    type="text"
                    required
                    value={videoFormData.title}
                    onChange={(e) => setVideoFormData({ ...videoFormData, title: e.target.value })}
                    placeholder="VD: Phóng Sự 20 Năm Ngày Trở Về — K8A1"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Đường dẫn Video (*):</label>
                  <input
                    type="url"
                    required
                    value={videoFormData.url}
                    onChange={(e) => setVideoFormData({ ...videoFormData, url: e.target.value })}
                    placeholder="https://youtu.be/... hoặc Google Drive preview link"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:outline-none focus:border-amber-500"
                  />
                  <p className="text-[11px] text-slate-400">
                    Tự động hỗ trợ link YouTube, YouTube Shorts hoặc file MP4 trên Google Drive.
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddVideoModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg shadow-sm cursor-pointer"
                  >
                    Thêm Video
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =================================================================== */}
      {/* MODAL: ADD PHOTO */}
      {/* =================================================================== */}
      <AnimatePresence>
        {isAddPhotoModalOpen && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl border border-amber-300 shadow-2xl w-full max-w-md p-6 space-y-4 text-xs"
            >
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <h3 className="text-base font-bold font-serif text-slate-900">
                  📸 Thêm Ảnh Kỷ Niệm Vào Thư Viện
                </h3>
                <button
                  onClick={() => setIsAddPhotoModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded-full"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSavePhoto} className="space-y-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Tải ảnh từ thiết bị hoặc dán URL:</label>
                  <div className="flex items-center gap-2">
                    <label className="px-3 py-2 bg-slate-100 hover:bg-amber-100 text-slate-700 border border-slate-300 rounded-lg cursor-pointer flex items-center gap-1.5 font-semibold text-[11px] transition">
                      <Upload className="w-3.5 h-3.5 text-amber-600" />
                      <span>Chọn file ảnh</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoFileUpload}
                        className="hidden"
                      />
                    </label>
                    <span className="text-[10px] text-slate-400">hoặc dán link bên dưới</span>
                  </div>

                  {photoFormData.url && (
                    <div className="mt-2 relative rounded-lg overflow-hidden border border-amber-300 bg-slate-900 h-24 flex items-center justify-center">
                      <img src={photoFormData.url} alt="Xem trước" className="max-h-full max-w-full object-contain" />
                    </div>
                  )}

                  <input
                    type="text"
                    required
                    value={photoFormData.url}
                    onChange={(e) => setPhotoFormData({ ...photoFormData, url: e.target.value })}
                    placeholder="https://... ảnh Unsplash hoặc Google Drive direct link"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:outline-none focus:border-amber-500 mt-1"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Chú thích kỷ niệm (*):</label>
                  <input
                    type="text"
                    required
                    value={photoFormData.caption}
                    onChange={(e) => setPhotoFormData({ ...photoFormData, caption: e.target.value })}
                    placeholder="VD: Giờ ra chơi năm 2004 dưới tán cây bàng"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Thời gian chụp:</label>
                  <input
                    type="text"
                    value={photoFormData.date}
                    onChange={(e) => setPhotoFormData({ ...photoFormData, date: e.target.value })}
                    placeholder="VD: Tháng 10/2004"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddPhotoModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg shadow-sm cursor-pointer"
                  >
                    Thêm Ảnh
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =================================================================== */}
      {/* MODAL: ADD / EDIT VENUE MEDIA (CROWN PALACE) */}
      {/* =================================================================== */}
      <AnimatePresence>
        {isAddVenueMediaModalOpen && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl border border-amber-300 shadow-2xl w-full max-w-md p-6 space-y-4 text-xs"
            >
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <h3 className="text-base font-bold font-serif text-slate-900 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-amber-600" />
                  <span>Thêm Video / Ảnh Crown Palace</span>
                </h3>
                <button
                  onClick={() => setIsAddVenueMediaModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded-full cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveVenueMedia} className="space-y-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Đường dẫn Link hoặc Tải ảnh từ máy (*):</label>
                  <div className="flex items-center gap-2">
                    <label className="px-3 py-2 bg-slate-800 hover:bg-slate-900 text-amber-200 rounded-lg cursor-pointer flex items-center gap-1.5 font-bold text-[11px] transition shrink-0">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Chọn file ảnh</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleVenuePhotoUpload}
                        className="hidden"
                      />
                    </label>
                    <span className="text-[10px] text-slate-400">hoặc dán link Facebook, YouTube, Drive</span>
                  </div>

                  {venueMediaFormData.url && (
                    <div className="mt-2 relative rounded-lg overflow-hidden border border-amber-300 bg-slate-900 h-24 flex items-center justify-center">
                      {venueMediaFormData.url.startsWith('data:image') || /\.(jpg|jpeg|png|webp)/i.test(venueMediaFormData.url) ? (
                        <img src={venueMediaFormData.url} alt="Xem trước" className="max-h-full max-w-full object-contain" />
                      ) : (
                        <span className="text-[10px] font-mono text-amber-300 p-2 truncate max-w-full">
                          {venueMediaFormData.url}
                        </span>
                      )}
                    </div>
                  )}

                  <input
                    type="text"
                    required
                    value={venueMediaFormData.url}
                    onChange={(e) => setVenueMediaFormData({ ...venueMediaFormData, url: e.target.value })}
                    placeholder="https://www.facebook.com/reel/... hoặc https://youtu.be/..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:outline-none focus:border-amber-500 mt-1"
                  />
                  <p className="text-[11px] text-slate-400">
                    Hỗ trợ: <strong>Facebook Reel, Facebook Video, YouTube, Google Drive, MP4, hoặc Ảnh</strong>.
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Tiêu đề (Tùy chọn):</label>
                  <input
                    type="text"
                    value={venueMediaFormData.title}
                    onChange={(e) => setVenueMediaFormData({ ...venueMediaFormData, title: e.target.value })}
                    placeholder="VD: Video Facebook Reel Không Gian Sảnh Tiệc"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Mô tả ngắn (Tùy chọn):</label>
                  <textarea
                    rows={2}
                    value={venueMediaFormData.desc}
                    onChange={(e) => setVenueMediaFormData({ ...venueMediaFormData, desc: e.target.value })}
                    placeholder="VD: Không gian sảnh tiệc hoàng gia Crown Palace Thái Nguyên"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddVenueMediaModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg shadow-sm cursor-pointer"
                  >
                    Lưu Mục Này
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
