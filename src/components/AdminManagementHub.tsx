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
  Copy,
  FileCode,
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
  Play,
  MoveVertical,
  SlidersHorizontal,
  ZoomIn,
  ZoomOut,
  Camera,
  CheckCheck,
  FileText,
  MapPin,
  MailOpen,
  Landmark,
  QrCode,
  HelpCircle,
  Info,
  Navigation
} from 'lucide-react';
import { UserRole, RsvpData, WishData, MemoryImage, MemoryVideo, VenueMediaItem, EventConfig, ClassMember } from '../types';
import { 
  K8A1_DRIVE_FOLDER_ID, 
  K8A1_DRIVE_FOLDER_URL, 
  DEFAULT_EVENT_CONFIG, 
  VIETNAM_BANKS, 
  resolveBankCode, 
  generateVietQrUrl, 
  sanitizeVietQrText, 
  GOOGLE_APPS_SCRIPT_CODE,
  CLASS_ROSTER_K8A1 
} from '../data';
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
  
  classRoster?: ClassMember[];
  onUpdateClassRoster?: (list: ClassMember[]) => void;
  
  wishesList: WishData[];
  onUpdateWishesList: (list: WishData[]) => void;
  
  images: MemoryImage[];
  onUpdateImages: (list: MemoryImage[]) => void;
  
  videos: MemoryVideo[];
  onUpdateVideos: (list: MemoryVideo[]) => void;

  venueMediaList?: VenueMediaItem[];
  onUpdateVenueMediaList?: (list: VenueMediaItem[]) => void;
  
  heroBannerUrl?: string;
  heroBannerPosition?: number;
  onUpdateHeroBannerUrl?: (url: string, positionY?: number) => void;
  
  eventConfig?: EventConfig;
  onUpdateEventConfig?: (config: EventConfig) => void;

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
  classRoster,
  onUpdateClassRoster,
  wishesList,
  onUpdateWishesList,
  images,
  onUpdateImages,
  videos,
  onUpdateVideos,
  venueMediaList,
  onUpdateVenueMediaList,
  heroBannerUrl = 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1600&q=80',
  heroBannerPosition = 50,
  onUpdateHeroBannerUrl,
  eventConfig,
  onUpdateEventConfig,
  appsScriptUrl,
  onSaveAppsScriptUrl,
  onRefreshData,
  onOpenPassModal
}: AdminManagementHubProps) {
  // User Role Helpers
  const isAdmin = currentUserRole === 'admin';
  const isBll = currentUserRole === 'bll';
  const isAuthorized = isAdmin || isBll;

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
  const [copiedScriptCode, setCopiedScriptCode] = useState(false);
  const [showScriptCodeModal, setShowScriptCodeModal] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionTestResult, setConnectionTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isCleaningDuplicates, setIsCleaningDuplicates] = useState(false);
  const [bannerInput, setBannerInput] = useState(heroBannerUrl);
  const [bannerPositionY, setBannerPositionY] = useState<number>(heroBannerPosition ?? 50);
  const [isDraggingBanner, setIsDraggingBanner] = useState(false);
  const [dragStartY, setDragStartY] = useState(0);
  const [dragStartPos, setDragStartPos] = useState(50);
  const bannerPreviewRef = React.useRef<HTMLDivElement>(null);
  const [settingsSuccessMsg, setSettingsSuccessMsg] = useState('');

  // Event & Venue Configuration State (Full CRUD for BLL & Admin)
  const [eventConfigForm, setEventConfigForm] = useState<EventConfig>(() => {
    return eventConfig || DEFAULT_EVENT_CONFIG;
  });

  useEffect(() => {
    if (eventConfig) {
      setEventConfigForm(eventConfig);
    }
  }, [eventConfig]);

  const [settingsSection, setSettingsSection] = useState<'all' | 'venue' | 'date' | 'letter' | 'bank' | 'security'>('all');

  // Search & Filters for Member Tab
  const rosterList = classRoster && classRoster.length > 0 ? classRoster : CLASS_ROSTER_K8A1;
  const [memberTabSubView, setMemberTabSubView] = useState<'roster' | 'rsvp'>('roster');
  const [memberSearch, setMemberSearch] = useState('');
  const [memberStatusFilter, setMemberStatusFilter] = useState<'all' | 'yes' | 'no' | 'checkedIn' | 'notCheckedIn'>('all');
  const [memberShirtFilter, setMemberShirtFilter] = useState<string>('all');
  const [rosterStatusFilter, setRosterStatusFilter] = useState<'all' | 'confirmed' | 'declined' | 'pending'>('all');

  // Helper chuẩn hóa so khớp danh bạ
  const normPhoneRoster = (p?: any) => {
    if (p === null || p === undefined) return '';
    let clean = String(p).replace(/[^0-9]/g, '');
    if (clean.startsWith('84') && clean.length > 9) clean = '0' + clean.slice(2);
    else if (!clean.startsWith('0') && clean.length === 9) clean = '0' + clean;
    return clean;
  };

  const normNameRoster = (n?: any) => {
    if (n === null || n === undefined) return '';
    return String(n).trim().toLowerCase().replace(/\s+/g, ' ');
  };

  // Đồng bộ mỗi thành viên trong danh bạ với dữ liệu RSVP thực tế
  const enrichedRoster = useMemo(() => {
    return rosterList.map((m, idx) => {
      const matchedRsvp = rsvpList.find((r) => {
        if (!r) return false;
        const rP = normPhoneRoster(r.phone);
        const rN = normNameRoster(r.fullName);
        const mP = normPhoneRoster(m.phone);
        const mN = normNameRoster(m.fullName);
        if (mP && rP && mP === rP) return true;
        if (mN && rN && mN === rN) return true;
        return false;
      });

      let rosterStatus: 'confirmed' | 'declined' | 'pending' = 'pending';
      if (matchedRsvp) {
        rosterStatus = matchedRsvp.status === 'yes' ? 'confirmed' : 'declined';
      }

      return {
        ...m,
        index: idx + 1,
        matchedRsvp,
        rosterStatus
      };
    });
  }, [rosterList, rsvpList]);

  const rosterConfirmedCount = useMemo(() => enrichedRoster.filter(m => m.rosterStatus === 'confirmed').length, [enrichedRoster]);
  const rosterDeclinedCount = useMemo(() => enrichedRoster.filter(m => m.rosterStatus === 'declined').length, [enrichedRoster]);
  const rosterPendingCount = useMemo(() => enrichedRoster.filter(m => m.rosterStatus === 'pending').length, [enrichedRoster]);

  const filteredRoster = useMemo(() => {
    const q = (memberSearch || '').toLowerCase().trim();
    return enrichedRoster.filter(m => {
      const matchQuery = !q ||
        String(m.fullName || '').toLowerCase().includes(q) ||
        String(m.nickname || '').toLowerCase().includes(q) ||
        String(m.phone || '').includes(q) ||
        String(m.role || '').toLowerCase().includes(q);

      const matchFilter =
        rosterStatusFilter === 'all' ||
        m.rosterStatus === rosterStatusFilter;

      return matchQuery && matchFilter;
    });
  }, [enrichedRoster, memberSearch, rosterStatusFilter]);

  const handleQuickRegisterMember = (m: (typeof enrichedRoster)[0]) => {
    if (m.matchedRsvp) {
      handleOpenEditMember(m.matchedRsvp);
    } else {
      setEditingMember(null);
      setMemberFormData({
        fullName: m.fullName,
        nickname: m.nickname || '',
        phone: m.phone || '',
        className: 'K8A1',
        status: 'yes',
        shirtSize: m.shirtSize || 'L',
        message: 'Ban Liên Lạc ghi nhận thông tin tham dự',
        fundStatus: 'unpaid',
        fundAmount: 500000,
        fundNote: ''
      });
      setIsAddMemberModalOpen(true);
    }
  };

  // Search & Filters for Fund Reconciliation Tab
  const [fundSearch, setFundSearch] = useState('');
  const [fundStatusFilter, setFundStatusFilter] = useState<'all' | 'paid' | 'unpaid' | 'pending' | 'extra' | 'has_receipt' | 'no_receipt' | 'bank_transfer' | 'cash'>('all');

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

  // State Quản Lý Danh Bạ Lớp K8A1 (Lưu trên Google Sheet tab "Danh_Sach_Lop")
  const [isRosterModalOpen, setIsRosterModalOpen] = useState(false);
  const [editingRosterMember, setEditingRosterMember] = useState<ClassMember | null>(null);
  const [rosterFormData, setRosterFormData] = useState<Partial<ClassMember>>({
    fullName: '',
    nickname: '',
    phone: '',
    role: 'Thành viên',
    gender: 'male',
    shirtSize: 'L',
    note: ''
  });
  const [isRosterSyncing, setIsRosterSyncing] = useState(false);
  const [rosterFeedbackMsg, setRosterFeedbackMsg] = useState('');

  // Comprehensive Fund Reconciliation & Proof Modal States
  const [adjustFundMember, setAdjustFundMember] = useState<RsvpData | null>(null);
  const [fundAdjustAmount, setFundAdjustAmount] = useState<number>(500000);
  const [fundAdjustStatus, setFundAdjustStatus] = useState<'paid' | 'unpaid' | 'pending' | 'exempt'>('paid');
  const [fundAdjustPaymentMethod, setFundAdjustPaymentMethod] = useState<'bank_transfer' | 'cash' | 'other'>('bank_transfer');
  const [fundAdjustReceiptUrl, setFundAdjustReceiptUrl] = useState<string>('');
  const [fundAdjustPaidAt, setFundAdjustPaidAt] = useState<string>('');
  const [fundAdjustAuditedBy, setFundAdjustAuditedBy] = useState<string>('');
  const [fundAdjustNote, setFundAdjustNote] = useState<string>('');
  const [isUploadingReceipt, setIsUploadingReceipt] = useState<boolean>(false);
  const [receiptUploadSuccessMsg, setReceiptUploadSuccessMsg] = useState<string>('');
  const [receiptUploadErrorMsg, setReceiptUploadErrorMsg] = useState<string>('');

  // Fullscreen Receipt Lightbox Viewer
  const [viewReceiptModal, setViewReceiptModal] = useState<{
    isOpen: boolean;
    receiptUrl: string;
    memberName: string;
    amount: number;
    paymentMethod?: string;
    paidAt?: string;
    note?: string;
    phone?: string;
    auditedBy?: string;
    status?: string;
    attendee?: RsvpData;
  } | null>(null);
  const [lightboxZoom, setLightboxZoom] = useState<number>(1);

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

  useEffect(() => {
    if (heroBannerPosition !== undefined) {
      setBannerPositionY(heroBannerPosition);
    }
  }, [heroBannerPosition]);

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

  // Extra sponsorship fund (> 500,000đ)
  const totalExtraFund = useMemo(() => {
    return rsvpList.reduce((acc, curr) => {
      if (curr.fundStatus === 'paid' && (curr.fundAmount || 0) > 500000) {
        return acc + ((curr.fundAmount || 0) - 500000);
      }
      return acc;
    }, 0);
  }, [rsvpList]);

  const extraMembersCount = useMemo(() => {
    return rsvpList.filter(a => a.fundStatus === 'paid' && (a.fundAmount || 0) > 500000).length;
  }, [rsvpList]);

  const hasReceiptCount = useMemo(() => {
    return rsvpList.filter(a => Boolean(a.fundReceiptUrl && a.fundReceiptUrl.trim())).length;
  }, [rsvpList]);

  const unpaidMembersCount = useMemo(() => {
    return rsvpList.filter(a => a.fundStatus !== 'paid').length;
  }, [rsvpList]);

  const pendingMembersCount = useMemo(() => {
    return rsvpList.filter(a => a.fundStatus === 'pending').length;
  }, [rsvpList]);

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
      fullName: String(attendee.fullName || ''),
      nickname: String(attendee.nickname || ''),
      phone: String(attendee.phone || ''),
      fundAmount: attendee.fundAmount || 500000,
      fundStatus: attendee.fundStatus || 'unpaid'
    });
    setIsAddMemberModalOpen(true);
  };

  const handleSaveMember = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanFullName = String(memberFormData.fullName || '').trim();
    const cleanPhone = String(memberFormData.phone || '').trim();
    if (!cleanFullName || !cleanPhone) {
      alert('Vui lòng điền Họ tên và Số điện thoại!');
      return;
    }

    if (editingMember) {
      const updated = rsvpList.map(item => {
        if ((editingMember.id && item.id === editingMember.id) || String(item.phone || '') === String(editingMember.phone || '')) {
          return {
            ...item,
            ...memberFormData,
            fullName: cleanFullName,
            phone: cleanPhone
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

  // =========================================================================
  // XỬ LÝ QUẢN TRỊ DANH BẠ LỚP K8A1 (GOOGLE SHEET TAB "Danh_Sach_Lop")
  // =========================================================================
  const handleOpenAddRosterMember = () => {
    setEditingRosterMember(null);
    setRosterFormData({
      fullName: '',
      nickname: '',
      phone: '',
      role: 'Thành viên',
      gender: 'male',
      shirtSize: 'L',
      note: ''
    });
    setIsRosterModalOpen(true);
  };

  const handleOpenEditRosterMember = (member: ClassMember) => {
    setEditingRosterMember(member);
    setRosterFormData({
      id: member.id,
      fullName: String(member.fullName || ''),
      nickname: String(member.nickname || ''),
      phone: String(member.phone || ''),
      role: String(member.role || 'Thành viên'),
      gender: member.gender || 'male',
      shirtSize: String(member.shirtSize || 'L'),
      note: String(member.note || '')
    });
    setIsRosterModalOpen(true);
  };

  const handleSaveRosterMember = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = String(rosterFormData.fullName || '').trim();
    if (!cleanName) {
      alert('Vui lòng nhập Họ và Tên bạn học!');
      return;
    }

    let updatedList: ClassMember[] = [];
    if (editingRosterMember) {
      updatedList = rosterList.map(item => {
        if (item.id === editingRosterMember.id) {
          return {
            ...item,
            fullName: cleanName,
            nickname: String(rosterFormData.nickname || '').trim(),
            phone: String(rosterFormData.phone || '').trim(),
            role: String(rosterFormData.role || 'Thành viên').trim(),
            gender: (rosterFormData.gender === 'female' ? 'female' : 'male'),
            shirtSize: String(rosterFormData.shirtSize || 'L').trim().toUpperCase(),
            note: String(rosterFormData.note || '').trim()
          };
        }
        return item;
      });
      setRosterFeedbackMsg(`✓ Đã cập nhật bạn "${cleanName}" vào Google Sheet tab Danh_Sach_Lop!`);
    } else {
      const newId = 'm' + (rosterList.length + 1 < 10 ? '0' + (rosterList.length + 1) : (rosterList.length + 1));
      const newMember: ClassMember = {
        id: newId,
        fullName: cleanName,
        nickname: String(rosterFormData.nickname || '').trim(),
        phone: String(rosterFormData.phone || '').trim(),
        role: String(rosterFormData.role || 'Thành viên').trim(),
        gender: (rosterFormData.gender === 'female' ? 'female' : 'male'),
        shirtSize: String(rosterFormData.shirtSize || 'L').trim().toUpperCase(),
        note: String(rosterFormData.note || '').trim()
      };
      updatedList = [...rosterList, newMember];
      setRosterFeedbackMsg(`✓ Đã thêm bạn "${cleanName}" vào Google Sheet tab Danh_Sach_Lop!`);
    }

    if (onUpdateClassRoster) {
      onUpdateClassRoster(updatedList);
    }
    setTimeout(() => setRosterFeedbackMsg(''), 4000);
    setIsRosterModalOpen(false);
  };

  const handleDeleteRosterMember = (member: ClassMember) => {
    if (currentUserRole !== 'admin') {
      alert('Chỉ Trưởng Ban (Admin) mới có quyền xóa học sinh khỏi danh bạ lớp!');
      return;
    }

    if (confirm(`Bạn có chắc chắn muốn xóa bạn "${member.fullName}" khỏi Danh Bạ Lớp (tab Danh_Sach_Lop trên Google Sheet)?`)) {
      const updatedList = rosterList.filter(item => item.id !== member.id);
      if (onUpdateClassRoster) {
        onUpdateClassRoster(updatedList);
      }
      setRosterFeedbackMsg(`✓ Đã xóa bạn "${member.fullName}" khỏi Danh Bạ Lớp!`);
      setTimeout(() => setRosterFeedbackMsg(''), 4000);
    }
  };

  const handleForceSyncRoster = () => {
    setIsRosterSyncing(true);
    try {
      if (onUpdateClassRoster) {
        onUpdateClassRoster(rosterList);
      }
      if (onRefreshData) {
        onRefreshData();
      }
      setRosterFeedbackMsg(`✓ Đã gửi lệnh đồng bộ toàn bộ danh bạ lớp lên Google Sheet!`);
      setTimeout(() => setRosterFeedbackMsg(''), 4000);
    } catch (e) {
      alert('Lỗi đồng bộ: ' + e);
    } finally {
      setIsRosterSyncing(false);
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
      `"${String(a.message || '').replace(/"/g, '""')}"`
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
    const isCurrentlyPaid = attendee.fundStatus === 'paid';
    const nextStatus = isCurrentlyPaid ? 'unpaid' : 'paid';
    const nextAmount = nextStatus === 'paid' ? (attendee.fundAmount || 500000) : 0;
    const nowStr = new Date().toLocaleDateString('vi-VN') + ' ' + new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    const auditor = currentUserRole === 'admin' ? 'Trưởng Ban (Admin)' : 'Ban Liên Lạc';

    const updated = rsvpList.map(item => {
      if ((item.id && item.id === attendee.id) || item.phone === attendee.phone) {
        return {
          ...item,
          fundStatus: nextStatus,
          fundAmount: nextAmount,
          fundPaidAt: nextStatus === 'paid' ? (item.fundPaidAt || nowStr) : undefined,
          fundAuditedBy: nextStatus === 'paid' ? (item.fundAuditedBy || auditor) : undefined,
          fundPaymentMethod: nextStatus === 'paid' ? (item.fundPaymentMethod || 'bank_transfer') : item.fundPaymentMethod,
          fundNote: nextStatus === 'paid' ? (item.fundNote || 'Đã nộp 500.000đ') : ''
        };
      }
      return item;
    });

    onUpdateRsvpList(updated);
    localStorage.setItem('rsvp_list', JSON.stringify(updated));

    if (appsScriptUrl && appsScriptUrl.trim()) {
      fetch(appsScriptUrl, {
        method: 'POST',
        body: JSON.stringify({
          action: 'update_fund',
          phone: attendee.phone,
          fullName: attendee.fullName,
          fundStatus: nextStatus,
          fundAmount: nextAmount,
          fundPaidAt: nextStatus === 'paid' ? nowStr : '',
          fundAuditedBy: nextStatus === 'paid' ? auditor : '',
          fundPaymentMethod: attendee.fundPaymentMethod || 'bank_transfer',
          fundNote: nextStatus === 'paid' ? (attendee.fundNote || 'Đã nộp 500.000đ') : ''
        })
      }).catch(err => console.warn('Toggle fund sync failed:', err));
    }

    if (nextStatus === 'paid') {
      confetti({ particleCount: 35, spread: 50, origin: { y: 0.6 } });
    }
  };

  const handleApproveFundDirect = (attendee: RsvpData, customAmount: number = 500000, note?: string) => {
    const nowStr = new Date().toLocaleDateString('vi-VN') + ' ' + new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    const auditor = currentUserRole === 'admin' ? 'Trưởng Ban (Admin)' : 'Ban Liên Lạc';
    const finalAmount = customAmount || 500000;
    const finalNote = note || (attendee.fundNote ? `${attendee.fundNote} (BLL đã khớp lệnh)` : 'BLL đã đối soát khớp bill');

    const updated = rsvpList.map(item => {
      if ((item.id && item.id === attendee.id) || item.phone === attendee.phone) {
        return {
          ...item,
          fundStatus: 'paid' as const,
          fundAmount: finalAmount,
          fundPaidAt: nowStr,
          fundAuditedBy: auditor,
          fundPaymentMethod: item.fundPaymentMethod || 'bank_transfer',
          fundNote: finalNote
        };
      }
      return item;
    });

    onUpdateRsvpList(updated);
    localStorage.setItem('rsvp_list', JSON.stringify(updated));

    if (appsScriptUrl && appsScriptUrl.trim()) {
      fetch(appsScriptUrl, {
        method: 'POST',
        body: JSON.stringify({
          action: 'update_fund',
          phone: attendee.phone,
          fullName: attendee.fullName,
          fundStatus: 'paid',
          fundAmount: finalAmount,
          fundPaidAt: nowStr,
          fundAuditedBy: auditor,
          fundPaymentMethod: attendee.fundPaymentMethod || 'bank_transfer',
          fundNote: finalNote
        })
      }).catch(err => console.warn('Approve fund sync failed:', err));
    }

    confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
  };

  const handleApproveFundFromModal = () => {
    if (!viewReceiptModal) return;
    const targetPhone = viewReceiptModal.phone;
    const foundAttendee = viewReceiptModal.attendee || rsvpList.find(r => r.phone === targetPhone || r.fullName === viewReceiptModal.memberName);
    
    if (foundAttendee) {
      handleApproveFundDirect(foundAttendee, viewReceiptModal.amount || 500000);
    }

    const nowStr = new Date().toLocaleDateString('vi-VN') + ' ' + new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    const auditor = currentUserRole === 'admin' ? 'Trưởng Ban (Admin)' : 'Ban Liên Lạc';

    setViewReceiptModal(prev => prev ? {
      ...prev,
      status: 'paid',
      auditedBy: auditor,
      paidAt: nowStr,
      note: prev.note ? `${prev.note} (BLL đã khớp lệnh)` : 'BLL đã đối soát khớp bill'
    } : null);
  };

  const handleOpenAdjustFund = (attendee: RsvpData) => {
    setAdjustFundMember(attendee);
    const isPaid = attendee.fundStatus === 'paid';
    setFundAdjustAmount(attendee.fundAmount !== undefined ? attendee.fundAmount : (isPaid ? 500000 : 0));
    setFundAdjustStatus(attendee.fundStatus || (isPaid ? 'paid' : 'unpaid'));
    setFundAdjustNote(attendee.fundNote || '');
    setFundAdjustPaymentMethod(attendee.fundPaymentMethod || 'bank_transfer');
    setFundAdjustReceiptUrl(attendee.fundReceiptUrl || '');
    setFundAdjustPaidAt(attendee.fundPaidAt || (isPaid ? '01/09/2026' : new Date().toLocaleDateString('vi-VN') + ' ' + new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })));
    setFundAdjustAuditedBy(attendee.fundAuditedBy || (currentUserRole === 'admin' ? 'Trưởng Ban (Admin)' : 'Ban Liên Lạc'));
    setReceiptUploadErrorMsg('');
    setReceiptUploadSuccessMsg('');
  };

  const handleReceiptFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      setReceiptUploadErrorMsg('Kích thước ảnh không được vượt quá 15MB!');
      return;
    }

    setIsUploadingReceipt(true);
    setReceiptUploadErrorMsg('');
    setReceiptUploadSuccessMsg('');

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = reader.result as string;

        // If appsScriptUrl is present, upload to Drive subfolder "ChungTu_QuyLop_K8A1"
        if (appsScriptUrl && appsScriptUrl.trim()) {
          try {
            const payload = {
              action: 'upload_fund_receipt',
              fileData: base64Data,
              mimeType: file.type || 'image/jpeg',
              fullName: adjustFundMember?.fullName || 'ThanhVien',
              phone: adjustFundMember?.phone || '',
              fundAmount: fundAdjustAmount,
              fundPaymentMethod: fundAdjustPaymentMethod,
              fundPaidAt: fundAdjustPaidAt || new Date().toLocaleString('vi-VN'),
              fundAuditedBy: currentUserRole === 'admin' ? 'Trưởng Ban (Admin)' : 'Ban Liên Lạc',
              fundNote: fundAdjustNote
            };

            const res = await fetch(appsScriptUrl, {
              method: 'POST',
              body: JSON.stringify(payload)
            });
            const json = await res.json();
            if (json.status === 'success' && json.url) {
              setFundAdjustReceiptUrl(json.url);
              setReceiptUploadSuccessMsg('Đã lưu bill vào thư mục Drive ChungTu_QuyLop_K8A1!');
              setIsUploadingReceipt(false);
              return;
            }
          } catch (fetchErr) {
            console.warn('Drive upload failed, fallback to local image:', fetchErr);
          }
        }

        // Fallback: Store base64 data URL
        setFundAdjustReceiptUrl(base64Data);
        setReceiptUploadSuccessMsg('Đã đính kèm ảnh chứng từ thành công!');
        setIsUploadingReceipt(false);
      };

      reader.onerror = () => {
        setReceiptUploadErrorMsg('Lỗi khi đọc file ảnh!');
        setIsUploadingReceipt(false);
      };

      reader.readAsDataURL(file);
    } catch (err: any) {
      setReceiptUploadErrorMsg('Lỗi: ' + (err.message || 'Không thể upload ảnh'));
      setIsUploadingReceipt(false);
    }
  };

  const handleSaveAdjustFund = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustFundMember) return;

    const targetStatus = fundAdjustStatus || (fundAdjustAmount > 0 ? 'paid' : 'unpaid');
    const auditedTime = fundAdjustPaidAt || (targetStatus === 'paid' ? new Date().toLocaleDateString('vi-VN') + ' ' + new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : undefined);
    const auditorName = fundAdjustAuditedBy || (currentUserRole === 'admin' ? 'Trưởng Ban (Admin)' : 'Ban Liên Lạc');

    const updated = rsvpList.map(item => {
      if ((adjustFundMember.id && item.id === adjustFundMember.id) || item.phone === adjustFundMember.phone) {
        return {
          ...item,
          fundStatus: targetStatus,
          fundAmount: Number(fundAdjustAmount),
          fundPaymentMethod: fundAdjustPaymentMethod,
          fundReceiptUrl: fundAdjustReceiptUrl?.trim() || undefined,
          fundPaidAt: targetStatus === 'paid' ? auditedTime : undefined,
          fundAuditedBy: targetStatus === 'paid' ? auditorName : undefined,
          fundNote: fundAdjustNote.trim()
        } as RsvpData;
      }
      return item;
    });

    onUpdateRsvpList(updated);
    localStorage.setItem('rsvp_list', JSON.stringify(updated));

    if (appsScriptUrl && appsScriptUrl.trim()) {
      fetch(appsScriptUrl, {
        method: 'POST',
        body: JSON.stringify({
          action: 'update_fund',
          phone: adjustFundMember.phone,
          fullName: adjustFundMember.fullName,
          fundStatus: targetStatus,
          fundAmount: Number(fundAdjustAmount),
          fundPaymentMethod: fundAdjustPaymentMethod,
          fundReceiptUrl: fundAdjustReceiptUrl?.trim() || '',
          fundPaidAt: auditedTime || '',
          fundAuditedBy: auditorName,
          fundNote: fundAdjustNote.trim()
        })
      }).catch(err => console.warn('Sync fund to Google Sheets failed:', err));
    }

    if (targetStatus === 'paid') {
      confetti({ particleCount: 40, spread: 55, origin: { y: 0.6 } });
    }

    setAdjustFundMember(null);
  };

  // Export CSV for Fund Reconciliation
  const handleExportFundCsv = () => {
    const headers = [
      'STT',
      'Họ và Tên',
      'Biệt Danh',
      'Số Điện Thoại',
      'Lớp',
      'Tham Gia',
      'Trạng Thái Đóng Quỹ',
      'Hình Thức TT',
      'Số Tiền Đã Nộp (VNĐ)',
      'Ủng Hộ Thêm (VNĐ)',
      'Link Ảnh Chứng Từ (Drive)',
      'Thời Gian Nộp',
      'Người Đối Soát',
      'Ghi Chú Kế Toán'
    ];

    const rows = rsvpList.map((a, idx) => {
      const isPaid = a.fundStatus === 'paid';
      const amount = isPaid ? (a.fundAmount !== undefined ? a.fundAmount : 500000) : 0;
      const extra = isPaid && amount > 500000 ? amount - 500000 : 0;
      const methodText = a.fundPaymentMethod === 'cash' ? 'Tiền mặt tại bàn đón tiếp' : (a.fundPaymentMethod === 'other' ? 'Khác' : 'Chuyển khoản Ngân hàng');
      const statusText = a.fundStatus === 'paid' ? 'ĐÃ NỘP TIỀN' : (a.fundStatus === 'pending' ? 'CHỜ ĐỐI SOÁT' : (a.fundStatus === 'exempt' ? 'MIỄN ĐÓNG' : 'CHƯA NỘP'));

      return [
        idx + 1,
        `"${a.fullName || ''}"`,
        `"${a.nickname || ''}"`,
        `"${a.phone || ''}"`,
        `"${a.className || 'K8A1'}"`,
        a.status === 'yes' ? 'Tham gia' : 'Vắng mặt',
        `"${statusText}"`,
        `"${methodText}"`,
        amount,
        extra,
        `"${a.fundReceiptUrl || ''}"`,
        `"${a.fundPaidAt || ''}"`,
        `"${a.fundAuditedBy || ''}"`,
        `"${String(a.fundNote || '').replace(/"/g, '""')}"`
      ];
    });

    const summaryRow = [
      '',
      'TỔNG CỘNG ĐÃ THU',
      '',
      '',
      '',
      `Đã nộp: ${paidMembersCount}/${confirmedCount} bạn`,
      '',
      '',
      collectedFund,
      totalExtraFund,
      `Chứng từ đã lưu: ${hasReceiptCount}`,
      '',
      '',
      'VNĐ'
    ];

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(',')), summaryRow.join(',')].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `So_Quy_Doi_Soat_K8A1_20Nam_${new Date().toISOString().slice(0, 10)}.csv`);
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
  // HERO BANNER COVER UPLOAD & DRAG REPOSITION HANDLERS
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

  const handleMouseDownBanner = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDraggingBanner(true);
    setDragStartY(e.clientY);
    setDragStartPos(bannerPositionY);
  };

  const handleMouseMoveBanner = (e: React.MouseEvent) => {
    if (!isDraggingBanner || !bannerPreviewRef.current) return;
    const rect = bannerPreviewRef.current.getBoundingClientRect();
    const deltaY = e.clientY - dragStartY;
    const sensitivity = 0.6;
    const deltaPercent = (deltaY / rect.height) * 100 * sensitivity;
    const newPos = Math.min(100, Math.max(0, Math.round(dragStartPos - deltaPercent)));
    setBannerPositionY(newPos);
  };

  const handleMouseUpBanner = () => {
    setIsDraggingBanner(false);
  };

  const handleTouchStartBanner = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDraggingBanner(true);
      setDragStartY(e.touches[0].clientY);
      setDragStartPos(bannerPositionY);
    }
  };

  const handleTouchMoveBanner = (e: React.TouchEvent) => {
    if (!isDraggingBanner || !bannerPreviewRef.current || e.touches.length !== 1) return;
    const rect = bannerPreviewRef.current.getBoundingClientRect();
    const deltaY = e.touches[0].clientY - dragStartY;
    const sensitivity = 0.6;
    const deltaPercent = (deltaY / rect.height) * 100 * sensitivity;
    const newPos = Math.min(100, Math.max(0, Math.round(dragStartPos - deltaPercent)));
    setBannerPositionY(newPos);
  };

  const handleTouchEndBanner = () => {
    setIsDraggingBanner(false);
  };

  const handleSaveBanner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bannerInput.trim()) {
      alert('Vui lòng nhập link ảnh hoặc chọn file tải lên!');
      return;
    }
    if (onUpdateHeroBannerUrl) {
      onUpdateHeroBannerUrl(bannerInput.trim(), bannerPositionY);
      setSettingsSuccessMsg('Đã lưu ảnh bìa và vị trí hiển thị thành công!');
      setTimeout(() => setSettingsSuccessMsg(''), 4000);
    }
  };

  const handleResetBanner = () => {
    const defaultUrl = 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1600&q=80';
    setBannerInput(defaultUrl);
    setBannerPositionY(50);
    if (onUpdateHeroBannerUrl) {
      onUpdateHeroBannerUrl(defaultUrl, 50);
      setSettingsSuccessMsg('Đã khôi phục ảnh bìa banner và vị trí về mặc định!');
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
  // SETTINGS & EVENT CONFIGURATION SAVE (BLL & ADMIN FULL CRUD)
  // ---------------------------------------------------------------------------
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthorized) {
      alert('Bạn không có quyền chỉnh sửa cấu hình!');
      return;
    }

    // 1. Lưu Cấu Hình Sự Kiện (Địa điểm, Thời gian, Thư ngỏ, Quỹ) cho BLL & Admin
    if (onUpdateEventConfig) {
      onUpdateEventConfig(eventConfigForm);
    }
    try {
      localStorage.setItem('k8a1_event_config', JSON.stringify(eventConfigForm));
    } catch (err) {
      console.error('Lỗi lưu event config:', err);
    }

    let msg = 'Đã lưu cấu hình sự kiện thành công! ';

    // 2. Lưu Cài đặt bảo mật (PIN & Google Apps Script URL) nếu là Admin
    if (currentUserRole === 'admin') {
      if (newAdminPin) {
        if (!/^\d{4}$/.test(newAdminPin)) {
          alert('Mã PIN Admin phải đúng 4 chữ số!');
          return;
        }
        setAdminPin(newAdminPin);
        localStorage.setItem('k8a1_admin_pin', newAdminPin);
        msg += 'Đã đổi mã PIN Admin mới. ';
        setNewAdminPin('');
      }

      if (newBllPin) {
        if (!/^\d{4}$/.test(newBllPin)) {
          alert('Mã PIN Ban Liên Lạc phải đúng 4 chữ số!');
          return;
        }
        setBllPin(newBllPin);
        localStorage.setItem('k8a1_bll_pin', newBllPin);
        msg += 'Đã đổi mã PIN Ban Liên Lạc mới. ';
        setNewBllPin('');
      }

      if (scriptUrlInput !== appsScriptUrl) {
        onSaveAppsScriptUrl(scriptUrlInput.trim());
        msg += 'Đã lưu URL Google Apps Script. ';
      }
    }

    setSettingsSuccessMsg(msg);
    confetti({ particleCount: 25, spread: 60, origin: { y: 0.7 } });
    setTimeout(() => setSettingsSuccessMsg(''), 4000);
  };

  const handleResetEventConfigDefault = () => {
    if (confirm('Bạn có chắc muốn khôi phục toàn bộ thông tin sự kiện (Crown Palace Thái Nguyên, 27/09/2026, Quỹ 500k) về mặc định ban đầu?')) {
      setEventConfigForm(DEFAULT_EVENT_CONFIG);
      if (onUpdateEventConfig) {
        onUpdateEventConfig(DEFAULT_EVENT_CONFIG);
      }
      try {
        localStorage.setItem('k8a1_event_config', JSON.stringify(DEFAULT_EVENT_CONFIG));
      } catch {}
      setSettingsSuccessMsg('Đã khôi phục thông tin sự kiện về mặc định ban đầu!');
      setTimeout(() => setSettingsSuccessMsg(''), 3000);
    }
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

  const handleCopyScriptCode = () => {
    navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_CODE);
    setCopiedScriptCode(true);
    setTimeout(() => setCopiedScriptCode(false), 3000);
  };

  const handleTestConnection = async () => {
    const target = scriptUrlInput ? scriptUrlInput.trim() : '';
    if (!target) {
      alert('Vui lòng nhập URL Google Apps Script Web App trước khi kiểm tra!');
      return;
    }
    setIsTestingConnection(true);
    setConnectionTestResult(null);
    try {
      const res = await fetch(`${target}?action=get_all_data&t=${Date.now()}`);
      const json = await res.json();
      if (json && json.status === 'success') {
        const rsvpCount = json.data?.rsvp?.length ?? 0;
        const wishesCount = json.data?.wishes?.length ?? 0;
        const hasConfig = !!json.data?.config;
        const hasMedia = !!json.data?.media;
        setConnectionTestResult({
          success: true,
          message: `Kết nối thành công! Đã đồng bộ từ Google Sheet (${rsvpCount} điểm danh, ${wishesCount} lời chúc${hasConfig ? ', Cấu hình Sheet: OK' : ''}${hasMedia ? ', Media Sheet: OK' : ''}).`
        });
        onSaveAppsScriptUrl(target);
        if (onRefreshData) onRefreshData();
      } else {
        setConnectionTestResult({
          success: false,
          message: `Kết nối được nhưng trả về: ${json.message || JSON.stringify(json)}`
        });
      }
    } catch (err: any) {
      setConnectionTestResult({
        success: false,
        message: `Lỗi kết nối: ${err.message || 'Không thể gọi Web App. Hãy kiểm tra bạn đã chọn "Ai có quyền truy cập: Bất kỳ ai (Anyone)" khi Triển khai chưa!'}`
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handleCleanDuplicates = async () => {
    const target = (scriptUrlInput || appsScriptUrl || '').trim();
    if (!target || !target.startsWith('http')) {
      alert('Vui lòng nhập URL Google Apps Script Web App trong tab Cấu Hình trước!');
      return;
    }
    if (!confirm('Hệ thống sẽ quét Google Sheet, tự động gộp các bản ghi cùng SĐT / Họ Tên thành 1 bản ghi chính xác nhất và xóa các dòng thừa. Bạn có muốn tiếp tục?')) {
      return;
    }

    setIsCleaningDuplicates(true);
    try {
      const res = await fetch(`${target}?action=deduplicate_rsvp&t=${Date.now()}`);
      const data = await res.json();
      if (data && data.status === 'success') {
        alert(data.message || 'Đã dọn dẹp các bản ghi trùng lặp thành công!');
        if (onRefreshData) onRefreshData();
      } else {
        alert(data.message || 'Không thể dọn dẹp trùng lặp lúc này.');
      }
    } catch (err: any) {
      alert('Lỗi kết nối khi dọn dẹp trùng lặp: ' + (err.message || 'Vui lòng kiểm tra lại'));
    } finally {
      setIsCleaningDuplicates(false);
    }
  };

  // Filtered members list
  const filteredMemberList = useMemo(() => {
    const q = (memberSearch || '').toLowerCase().trim();
    return rsvpList.filter(item => {
      const matchQuery = !q ||
        String(item.fullName || '').toLowerCase().includes(q) ||
        String(item.nickname || '').toLowerCase().includes(q) ||
        String(item.phone || '').includes(q) ||
        String(item.className || '').toLowerCase().includes(q);

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
        String(item.fullName || '').toLowerCase().includes(q) ||
        String(item.nickname || '').toLowerCase().includes(q) ||
        String(item.phone || '').includes(q) ||
        String(item.fundNote || '').toLowerCase().includes(q) ||
        String(item.fundAuditedBy || '').toLowerCase().includes(q);

      const isPaid = item.fundStatus === 'paid';
      const hasReceipt = Boolean(item.fundReceiptUrl && item.fundReceiptUrl.trim());

      const matchFundStatus =
        fundStatusFilter === 'all' ||
        (fundStatusFilter === 'paid' && isPaid) ||
        (fundStatusFilter === 'unpaid' && (item.fundStatus === 'unpaid' || !item.fundStatus)) ||
        (fundStatusFilter === 'pending' && item.fundStatus === 'pending') ||
        (fundStatusFilter === 'extra' && isPaid && (item.fundAmount || 0) > 500000) ||
        (fundStatusFilter === 'has_receipt' && hasReceipt) ||
        (fundStatusFilter === 'no_receipt' && !hasReceipt && isPaid) ||
        (fundStatusFilter === 'bank_transfer' && (item.fundPaymentMethod === 'bank_transfer' || !item.fundPaymentMethod)) ||
        (fundStatusFilter === 'cash' && item.fundPaymentMethod === 'cash');

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

          <button
            onClick={() => setActiveTab('settings')}
            className={`px-3 sm:px-4 py-2 rounded-lg text-xs font-sans font-bold flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap ${
              activeTab === 'settings'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-amber-900 hover:bg-amber-100/70 bg-amber-50/50'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>5. Cấu Hình Sự Kiện & Hệ Thống</span>
            {isAdmin ? (
              <span className="text-[9px] bg-amber-800 text-amber-200 px-1.5 py-0.2 rounded font-mono">Admin 👑</span>
            ) : (
              <span className="text-[9px] bg-emerald-700 text-emerald-100 px-1.5 py-0.2 rounded font-mono">BLL 🛡️</span>
            )}
          </button>
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
              {/* Header Sub-navigation: Sĩ Số Toàn Lớp vs Phản Hồi Web */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-amber-50 to-orange-50/50 border border-amber-200 p-3 rounded-xl shadow-2xs">
                <div className="flex items-center gap-1.5 bg-white p-1 rounded-lg border border-amber-200/80 shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setMemberTabSubView('roster')}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-sans font-bold transition cursor-pointer ${
                      memberTabSubView === 'roster'
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'text-slate-700 hover:bg-amber-50'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Sĩ Số Lớp K8A1 ({rosterList.length} bạn)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMemberTabSubView('rsvp')}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-sans font-bold transition cursor-pointer ${
                      memberTabSubView === 'rsvp'
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'text-slate-700 hover:bg-amber-50'
                    }`}
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Phản Hồi Web ({rsvpList.length})</span>
                  </button>
                </div>

                <div className="flex items-center gap-2 text-xs font-sans text-amber-900">
                  <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    Xác nhận có mặt: <strong className="text-emerald-700">{rosterConfirmedCount}</strong> / {rosterList.length} bạn
                    <span className="text-slate-500 font-mono ml-1">({Math.round((rosterConfirmedCount / (rosterList.length || 1)) * 100)}%)</span>
                  </span>
                </div>
              </div>

              {/* ======================================================== */}
              {/* SUBVIEW 1: SĨ SỐ TOÀN LỚP (DANH BẠ 40 BẠN HỌC K8A1) */}
              {/* ======================================================== */}
              {memberTabSubView === 'roster' && (
                <div className="space-y-4">
                  {/* Summary Stat Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                      <div className="text-[10px] font-sans uppercase font-bold text-slate-500">Sĩ Số Chính Thức</div>
                      <div className="text-xl font-bold font-serif text-slate-800 mt-0.5">{rosterList.length} <span className="text-xs font-normal font-sans">bạn</span></div>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-emerald-200 bg-emerald-50/30 shadow-2xs">
                      <div className="text-[10px] font-sans uppercase font-bold text-emerald-700">Đã Xác Nhận Đi</div>
                      <div className="text-xl font-bold font-serif text-emerald-800 mt-0.5">{rosterConfirmedCount} <span className="text-xs font-normal font-sans">bạn</span></div>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-rose-200 bg-rose-50/30 shadow-2xs">
                      <div className="text-[10px] font-sans uppercase font-bold text-rose-700">Báo Bận / Vắng</div>
                      <div className="text-xl font-bold font-serif text-rose-800 mt-0.5">{rosterDeclinedCount} <span className="text-xs font-normal font-sans">bạn</span></div>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-amber-300 bg-amber-50/40 shadow-2xs">
                      <div className="text-[10px] font-sans uppercase font-bold text-amber-800">Chưa Phản Hồi</div>
                      <div className="text-xl font-bold font-serif text-amber-900 mt-0.5">{rosterPendingCount} <span className="text-xs font-normal font-sans">bạn</span></div>
                    </div>
                  </div>

                  {/* Google Sheet Status & Quick Sync Banner */}
                  <div className="flex flex-wrap items-center justify-between gap-2.5 p-3 bg-gradient-to-r from-amber-50 to-orange-50/50 border border-amber-200 rounded-xl text-xs text-amber-950 shadow-2xs">
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="w-4 h-4 text-emerald-700 shrink-0" />
                      <div>
                        <span>
                          Quản lý danh sách thành viên trực tiếp trên Google Sheet: tab <strong>"Danh_Sach_Lop"</strong> ({rosterList.length} bạn).
                        </span>
                        {rosterFeedbackMsg && (
                          <span className="block sm:inline sm:ml-2 font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded text-[11px] animate-pulse">
                            {rosterFeedbackMsg}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {onRefreshData && (
                        <button
                          type="button"
                          onClick={onRefreshData}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-lg font-bold text-[11px] transition shadow-2xs cursor-pointer"
                          title="Tải lại dữ liệu mới nhất từ Google Sheet"
                        >
                          <RefreshCw className="w-3 h-3 text-slate-500" />
                          <span>Tải lại Sheet</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={handleForceSyncRoster}
                        disabled={isRosterSyncing}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-[11px] transition shadow-xs cursor-pointer"
                        title="Đẩy toàn bộ danh bạ hiện tại lưu vĩnh viễn vào Google Sheet"
                      >
                        <Save className={`w-3 h-3 ${isRosterSyncing ? 'animate-spin' : ''}`} />
                        <span>{isRosterSyncing ? 'Đang lưu...' : 'Lưu Danh Bạ Lên Sheet'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Roster Controls Toolbar */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-amber-200 shadow-2xs">
                    <div className="flex flex-1 items-center gap-2">
                      <div className="relative flex-1">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={memberSearch}
                          onChange={(e) => setMemberSearch(e.target.value)}
                          placeholder="Tìm trong danh bạ (Tên, Biệt danh, Chức vụ, SĐT)..."
                          className="w-full pl-9 pr-3 py-2 bg-[#FAF8F5] border border-slate-300 rounded-lg text-xs font-sans focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <select
                        value={rosterStatusFilter}
                        onChange={(e) => setRosterStatusFilter(e.target.value as any)}
                        className="px-3 py-2 bg-[#FAF8F5] border border-slate-300 rounded-lg text-xs font-sans focus:outline-none focus:border-amber-500 cursor-pointer"
                      >
                        <option value="all">Tất cả ({rosterList.length})</option>
                        <option value="confirmed">Đã xác nhận ({rosterConfirmedCount})</option>
                        <option value="declined">Báo vắng ({rosterDeclinedCount})</option>
                        <option value="pending">Chưa phản hồi ({rosterPendingCount})</option>
                      </select>
                    </div>

                    <button
                      onClick={handleOpenAddRosterMember}
                      className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white text-xs font-sans font-bold rounded-lg shadow-sm transition cursor-pointer shrink-0"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>+ Thêm Bạn Vào Danh Bạ Lớp</span>
                    </button>
                  </div>

                  {/* Roster Table */}
                  <div className="bg-white rounded-xl border border-amber-200 shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-[#F8F5EE] text-slate-600 font-sans uppercase text-[10px] tracking-wider border-b border-amber-200">
                          <tr>
                            <th className="py-3 px-3 w-10 text-center">STT</th>
                            <th className="py-3 px-3">Bạn Học K8A1</th>
                            <th className="py-3 px-3">Số Điện Thoại</th>
                            <th className="py-3 px-3">Phản Hồi Tham Gia</th>
                            <th className="py-3 px-3">Size Áo & Quỹ</th>
                            <th className="py-3 px-3 text-right">Thao Tác BLL</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-sans">
                          {filteredRoster.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="py-8 text-center text-slate-400 italic font-serif">
                                Không tìm thấy bạn học nào khớp với bộ lọc.
                              </td>
                            </tr>
                          ) : (
                            filteredRoster.map((m) => (
                              <tr key={m.id} className="hover:bg-amber-50/40 transition">
                                <td className="py-2.5 px-3 text-center text-slate-400 font-mono">
                                  {m.index}
                                </td>

                                <td className="py-2.5 px-3">
                                  <div className="font-bold text-slate-900 text-sm">
                                    {m.fullName}
                                  </div>
                                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                                    {m.nickname && (
                                      <span className="text-amber-800 italic">“{m.nickname}”</span>
                                    )}
                                    {m.role && m.role !== 'Thành viên' && (
                                      <span className="bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded text-[9px] font-bold">
                                        {m.role}
                                      </span>
                                    )}
                                  </div>
                                </td>

                                <td className="py-2.5 px-3 font-mono text-slate-600">
                                  {m.matchedRsvp?.phone || m.phone || <span className="text-slate-400 italic">Chưa có SĐT</span>}
                                </td>

                                <td className="py-2.5 px-3">
                                  {m.rosterStatus === 'confirmed' ? (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                      <span>Có mặt</span>
                                    </span>
                                  ) : m.rosterStatus === 'declined' ? (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                                      <XCircle className="w-3 h-3 text-rose-600" />
                                      <span>Báo bận / Vắng</span>
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                                      <Clock className="w-3 h-3 text-amber-600" />
                                      <span>Chưa phản hồi</span>
                                    </span>
                                  )}
                                </td>

                                <td className="py-2.5 px-3">
                                  <div className="flex items-center gap-2">
                                    <span className="inline-flex items-center gap-1 font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                                      <Shirt className="w-3 h-3 text-amber-600" />
                                      <span>{m.matchedRsvp?.shirtSize || m.shirtSize || 'L'}</span>
                                    </span>
                                    {m.matchedRsvp?.fundStatus === 'paid' ? (
                                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                                        ✓ Đã đóng quỹ
                                      </span>
                                    ) : m.matchedRsvp?.fundStatus === 'pending' ? (
                                      <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                                        ⏳ Chờ duyệt bill
                                      </span>
                                    ) : (
                                      <span className="text-[10px] text-slate-400">Chưa nộp</span>
                                    )}
                                  </div>
                                </td>

                                <td className="py-2.5 px-3 text-right">
                                   <div className="flex items-center justify-end gap-1">
                                     {m.matchedRsvp ? (
                                       <>
                                         {onOpenPassModal && (
                                           <button
                                             onClick={() => onOpenPassModal(m.matchedRsvp!)}
                                             className="p-1.5 text-slate-500 hover:text-amber-700 hover:bg-amber-100/50 rounded transition cursor-pointer"
                                             title="Xem Thẻ Học Sinh Kỷ Niệm"
                                           >
                                             <Eye className="w-3.5 h-3.5" />
                                           </button>
                                         )}
                                         <button
                                           onClick={() => handleOpenEditMember(m.matchedRsvp!)}
                                           className="inline-flex items-center gap-1 px-2 py-1 text-slate-600 hover:text-blue-700 bg-slate-50 hover:bg-blue-50 border border-slate-200 rounded transition text-[11px] cursor-pointer"
                                           title="Sửa phản hồi RSVP (tham gia, chuyển khoản quỹ...)"
                                         >
                                           <Edit className="w-3 h-3" />
                                           <span>RSVP</span>
                                         </button>
                                       </>
                                     ) : (
                                       <button
                                         onClick={() => handleQuickRegisterMember(m)}
                                         className="inline-flex items-center gap-1 px-2 py-1 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded shadow-2xs transition text-[11px] cursor-pointer"
                                         title="Điểm danh hộ bạn này khi liên hệ qua điện thoại hoặc Zalo"
                                       >
                                         <Sparkles className="w-3 h-3" />
                                         <span>Điểm danh</span>
                                       </button>
                                     )}

                                     {/* Sửa thông tin cố định trong Danh Bạ Lớp (tab Danh_Sach_Lop) */}
                                     <button
                                       onClick={() => handleOpenEditRosterMember(m)}
                                       className="p-1.5 text-slate-500 hover:text-amber-700 hover:bg-amber-100/60 rounded transition cursor-pointer"
                                       title={`Sửa thông tin bạn ${m.fullName} trong Danh Bạ Lớp (Sheet Danh_Sach_Lop)`}
                                     >
                                       <Edit className="w-3.5 h-3.5" />
                                     </button>

                                     {/* Xóa khỏi Danh Bạ (Chỉ dành cho Admin) */}
                                     {isAdmin && (
                                       <button
                                         onClick={() => handleDeleteRosterMember(m)}
                                         className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition cursor-pointer"
                                         title={`Xóa bạn ${m.fullName} khỏi Danh Bạ Lớp`}
                                       >
                                         <Trash2 className="w-3.5 h-3.5" />
                                       </button>
                                     )}

                                     {(m.matchedRsvp?.phone || m.phone) && (
                                       <a
                                         href={`tel:${m.matchedRsvp?.phone || m.phone}`}
                                         className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded transition"
                                         title={`Gọi cho ${m.fullName}: ${m.matchedRsvp?.phone || m.phone}`}
                                       >
                                         <Phone className="w-3.5 h-3.5" />
                                       </a>
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

              {/* ======================================================== */}
              {/* SUBVIEW 2: DANH SÁCH PHẢN HỒI WEB (RSVP LIST) */}
              {/* ======================================================== */}
              {memberTabSubView === 'rsvp' && (
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
                    type="button"
                    onClick={handleCleanDuplicates}
                    disabled={isCleaningDuplicates}
                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 text-xs font-sans font-bold rounded-lg transition cursor-pointer shadow-2xs disabled:opacity-50"
                    title="Quét và xóa tự động các dòng trùng lặp trong Google Sheet"
                  >
                    <Sparkles className={`w-3.5 h-3.5 text-amber-600 ${isCleaningDuplicates ? 'animate-spin' : ''}`} />
                    <span className="hidden sm:inline">{isCleaningDuplicates ? 'Đang lọc...' : '🧹 Dọn Trùng Lặp'}</span>
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
        </div>
      )}

          {/* --------------------------------------------------------------- */}
          {/* TAB 2: FUND RECONCILIATION */}
          {/* --------------------------------------------------------------- */}
          {activeTab === 'fund' && (
            <div className="space-y-4">
              {/* Hero Banner with Actions & Progress */}
              <div className="bg-gradient-to-r from-[#1A1613] via-[#26201A] to-[#14110F] text-white p-5 rounded-2xl border border-amber-400/40 shadow-xl relative overflow-hidden">
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 relative z-10">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-400/40 rounded text-[10px] font-sans font-bold uppercase tracking-wider">
                        Sổ Kế Toán & Đối Soát Quỹ
                      </span>
                      <span className="text-xs text-slate-400">• Hội Khóa 20 Năm K8A1</span>
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-serif font-bold text-amber-100 flex items-center gap-2">
                      <span>Mức thu cố định: 500.000 VNĐ / bạn</span>
                    </h3>
                    <p className="text-xs text-slate-300 font-sans max-w-2xl">
                      Bao gồm: Tiệc trưa Crown Palace, Áo đồng phục 20 năm, Thẻ học sinh kỷ niệm, Backdrop & âm thanh. Ảnh chứng từ nộp quỹ được tự động lưu vào thư mục Drive <code className="text-amber-300 font-mono bg-amber-950/60 px-1 py-0.5 rounded">ChungTu_QuyLop_K8A1</code>.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <button
                      onClick={handleExportFundCsv}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-sans font-bold uppercase tracking-wider rounded-xl shadow-md transition cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>Xuất Sổ Quỹ (CSV)</span>
                    </button>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-amber-400/20 space-y-1.5">
                  <div className="flex justify-between text-xs font-sans">
                    <span className="text-amber-200">
                      Tiến độ đóng quỹ: <strong className="text-white">{paidMembersCount} / {confirmedCount}</strong> bạn tham dự ({expectedFund > 0 ? Math.round((collectedFund / expectedFund) * 100) : 0}%)
                    </span>
                    <span className="font-mono text-amber-300 font-bold">
                      {collectedFund.toLocaleString('vi-VN')} / {expectedFund.toLocaleString('vi-VN')} đ
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden p-0.5 border border-amber-400/20">
                    <div 
                      className="bg-gradient-to-r from-amber-400 via-amber-300 to-emerald-400 h-full rounded-full transition-all duration-500 shadow-sm"
                      style={{ width: `${expectedFund > 0 ? Math.min(100, Math.round((collectedFund / expectedFund) * 100)) : 0}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* 4 Financial KPI Summary Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="bg-white p-4 rounded-xl border border-amber-200 shadow-xs">
                  <span className="text-[11px] text-slate-500 font-sans block">Tổng Thực Thu</span>
                  <div className="text-xl font-bold font-mono text-emerald-700 mt-1">
                    {collectedFund.toLocaleString('vi-VN')} đ
                  </div>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Mục tiêu: {expectedFund.toLocaleString('vi-VN')} đ
                  </span>
                </div>

                <div className="bg-white p-4 rounded-xl border border-amber-200 shadow-xs">
                  <span className="text-[11px] text-slate-500 font-sans block">Đã Nộp / Tham Dự</span>
                  <div className="text-xl font-bold font-mono text-slate-900 mt-1">
                    {paidMembersCount} / {confirmedCount} <span className="text-xs font-normal text-slate-500">bạn</span>
                  </div>
                  <span className="text-[10px] text-rose-600 font-semibold mt-0.5 block">
                    Còn {unpaidMembersCount} bạn chưa nộp
                  </span>
                </div>

                <div className="bg-white p-4 rounded-xl border border-amber-200 shadow-xs">
                  <span className="text-[11px] text-slate-500 font-sans block">Chứng Từ / Bill Đã Lưu</span>
                  <div className="text-xl font-bold font-mono text-blue-700 mt-1 flex items-center gap-1.5">
                    <span>{hasReceiptCount} / {paidMembersCount}</span>
                    <span className="text-xs font-normal text-slate-500">bill</span>
                  </div>
                  <span className="text-[10px] text-slate-500 mt-0.5 block truncate" title="Lưu trong folder ChungTu_QuyLop_K8A1">
                    Folder: ChungTu_QuyLop_K8A1
                  </span>
                </div>

                <div className="bg-white p-4 rounded-xl border border-amber-200 shadow-xs">
                  <span className="text-[11px] text-slate-500 font-sans block">Ủng Hộ Thêm (Mạnh Thường Quân)</span>
                  <div className="text-xl font-bold font-mono text-amber-700 mt-1">
                    {totalExtraFund.toLocaleString('vi-VN')} đ
                  </div>
                  <span className="text-[10px] text-amber-800 font-semibold mt-0.5 block">
                    Từ {extraMembersCount} bạn đóng thêm
                  </span>
                </div>
              </div>

              {/* Fund Search & Filter Toolbar */}
              <div className="bg-white p-3.5 rounded-xl border border-amber-200 space-y-3">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={fundSearch}
                      onChange={(e) => setFundSearch(e.target.value)}
                      placeholder="Tìm theo tên bạn, số điện thoại, ghi chú, người đối soát..."
                      className="w-full pl-9 pr-3 py-2 bg-[#FAF8F5] border border-slate-300 rounded-lg text-xs font-sans focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={fundStatusFilter}
                      onChange={(e) => setFundStatusFilter(e.target.value as any)}
                      className="px-3 py-2 bg-[#FAF8F5] border border-slate-300 rounded-lg text-xs font-sans focus:outline-none focus:border-amber-500 cursor-pointer"
                    >
                      <option value="all">Tất cả trạng thái ({rsvpList.length})</option>
                      <option value="paid">Đã đóng tiền ({paidMembersCount})</option>
                      <option value="unpaid">Chưa đóng tiền ({unpaidMembersCount})</option>
                      <option value="pending">Chờ đối soát ({pendingMembersCount})</option>
                      <option value="has_receipt">Có ảnh Bill/UNC ({hasReceiptCount})</option>
                      <option value="no_receipt">Chưa có ảnh Bill ({paidMembersCount - hasReceiptCount})</option>
                      <option value="extra">Đóng thêm ủng hộ ({extraMembersCount})</option>
                      <option value="bank_transfer">Chuyển khoản Ngân hàng</option>
                      <option value="cash">Tiền mặt bàn đón tiếp</option>
                    </select>
                  </div>
                </div>

                {/* Quick Filter Chips */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-100 text-[11px] font-sans">
                  <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider mr-1">Lọc nhanh:</span>
                  <button
                    type="button"
                    onClick={() => setFundStatusFilter('all')}
                    className={`px-2.5 py-1 rounded-full font-medium transition cursor-pointer ${
                      fundStatusFilter === 'all'
                        ? 'bg-amber-600 text-white shadow-2xs font-bold'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    Tất cả ({rsvpList.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFundStatusFilter('paid')}
                    className={`px-2.5 py-1 rounded-full font-medium transition cursor-pointer ${
                      fundStatusFilter === 'paid'
                        ? 'bg-emerald-600 text-white shadow-2xs font-bold'
                        : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    Đã đóng ({paidMembersCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFundStatusFilter('pending')}
                    className={`px-2.5 py-1 rounded-full font-medium transition cursor-pointer flex items-center gap-1 ${
                      fundStatusFilter === 'pending'
                        ? 'bg-amber-600 text-white shadow-2xs font-bold'
                        : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300'
                    }`}
                  >
                    <span>⏳ Chờ đối soát ({pendingMembersCount})</span>
                    {pendingMembersCount > 0 && (
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping inline-block" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setFundStatusFilter('unpaid')}
                    className={`px-2.5 py-1 rounded-full font-medium transition cursor-pointer ${
                      fundStatusFilter === 'unpaid'
                        ? 'bg-rose-600 text-white shadow-2xs font-bold'
                        : 'bg-rose-50 hover:bg-rose-100 text-rose-700'
                    }`}
                  >
                    Chưa đóng ({unpaidMembersCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFundStatusFilter('has_receipt')}
                    className={`px-2.5 py-1 rounded-full font-medium transition cursor-pointer ${
                      fundStatusFilter === 'has_receipt'
                        ? 'bg-blue-600 text-white shadow-2xs font-bold'
                        : 'bg-blue-50 hover:bg-blue-100 text-blue-800'
                    }`}
                  >
                    Có ảnh Bill ({hasReceiptCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFundStatusFilter('extra')}
                    className={`px-2.5 py-1 rounded-full font-medium transition cursor-pointer ${
                      fundStatusFilter === 'extra'
                        ? 'bg-amber-700 text-white shadow-2xs font-bold'
                        : 'bg-amber-100/70 hover:bg-amber-200 text-amber-900'
                    }`}
                  >
                    + Ủng hộ thêm ({extraMembersCount})
                  </button>
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
                        <th className="py-3 px-3">Hình Thức & Giờ</th>
                        <th className="py-3 px-3 text-center">Chứng Từ / Bill</th>
                        <th className="py-3 px-3 text-center">Trạng Thái 1-Chạm</th>
                        <th className="py-3 px-3">Người & Ghi Chú</th>
                        <th className="py-3 px-3 text-right">Điều Chỉnh</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-sans">
                      {filteredFundList.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="py-10 text-center text-slate-400">
                            Không tìm thấy dữ liệu đối soát nào phù hợp với bộ lọc.
                          </td>
                        </tr>
                      ) : (
                        filteredFundList.map((item, idx) => {
                          const isPaid = item.fundStatus === 'paid';
                          const amount = item.fundAmount !== undefined ? item.fundAmount : (isPaid ? 500000 : 0);
                          const hasReceipt = Boolean(item.fundReceiptUrl && item.fundReceiptUrl.trim());
                          const isExtra = isPaid && amount > 500000;

                          return (
                            <tr key={item.id || item.phone} className="hover:bg-amber-50/40 transition">
                              <td className="py-2.5 px-3 text-center text-slate-400 font-mono">
                                {idx + 1}
                              </td>

                              <td className="py-2.5 px-3">
                                <div className="flex items-center gap-2">
                                  <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-bold flex items-center justify-center text-[11px] shrink-0">
                                    {(item.fullName || 'K').slice(0, 1).toUpperCase()}
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-1.5">
                                      <span className="font-bold text-slate-900 text-xs">
                                        {item.fullName}
                                      </span>
                                      {item.status === 'yes' ? (
                                        <span className="px-1.5 py-0.2 text-[9px] bg-emerald-100 text-emerald-800 rounded font-bold">
                                          Tham gia
                                        </span>
                                      ) : (
                                        <span className="px-1.5 py-0.2 text-[9px] bg-slate-100 text-slate-600 rounded">
                                          Vắng
                                        </span>
                                      )}
                                    </div>
                                    {item.nickname && (
                                      <span className="text-amber-800 text-[11px] block italic">
                                        “{item.nickname}”
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </td>

                              <td className="py-2.5 px-3 font-mono text-slate-600">
                                {item.phone}
                              </td>

                              <td className="py-2.5 px-3">
                                <span className={`font-mono font-bold text-xs ${isPaid ? 'text-emerald-700' : 'text-slate-400'}`}>
                                  {isPaid ? `${amount.toLocaleString('vi-VN')} đ` : '0 đ'}
                                </span>
                                {isExtra && (
                                  <span className="block text-[10px] font-sans font-bold text-amber-700 uppercase">
                                    + Ủng hộ {(amount - 500000).toLocaleString('vi-VN')}đ
                                  </span>
                                )}
                              </td>

                              <td className="py-2.5 px-3">
                                <div className="space-y-0.5">
                                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                                    item.fundPaymentMethod === 'cash'
                                      ? 'bg-amber-100 text-amber-900'
                                      : 'bg-blue-50 text-blue-800 border border-blue-200/60'
                                  }`}>
                                    {item.fundPaymentMethod === 'cash' ? '💵 Tiền mặt' : '🏦 Chuyển khoản'}
                                  </span>
                                  {item.fundPaidAt && (
                                    <span className="text-[10px] text-slate-400 block font-mono">
                                      {item.fundPaidAt}
                                    </span>
                                  )}
                                </div>
                              </td>

                              {/* Receipt Image Thumbnail & Zoom */}
                              <td className="py-2.5 px-3 text-center">
                                {hasReceipt ? (
                                  <button
                                    type="button"
                                    onClick={() => setViewReceiptModal({
                                      isOpen: true,
                                      receiptUrl: item.fundReceiptUrl!,
                                      memberName: item.fullName,
                                      amount: amount,
                                      paymentMethod: item.fundPaymentMethod,
                                      paidAt: item.fundPaidAt,
                                      note: item.fundNote,
                                      phone: item.phone,
                                      auditedBy: item.fundAuditedBy,
                                      status: item.fundStatus,
                                      attendee: item
                                    })}
                                    className="group relative inline-block rounded-lg overflow-hidden border-2 border-emerald-400/80 shadow-2xs hover:shadow-md transition cursor-pointer"
                                    title="Bấm để xem phóng to ảnh Bill/UNC"
                                  >
                                    <img
                                      src={item.fundReceiptUrl}
                                      alt={`Bill ${item.fullName}`}
                                      className="w-10 h-10 object-cover group-hover:scale-110 transition duration-200"
                                      loading="lazy"
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                                      <ZoomIn className="w-4 h-4 text-white" />
                                    </div>
                                    <span className="absolute bottom-0 inset-x-0 bg-emerald-600/90 text-white text-[8px] font-bold leading-tight py-0.2">
                                      Bill
                                    </span>
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handleOpenAdjustFund(item)}
                                    className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 hover:bg-amber-100 text-slate-600 hover:text-amber-900 border border-dashed border-slate-300 hover:border-amber-400 rounded text-[10px] font-sans font-medium transition cursor-pointer"
                                    title="Thêm ảnh chứng từ nộp tiền"
                                  >
                                    <Camera className="w-3 h-3 text-slate-400" />
                                    <span>+ Đính bill</span>
                                  </button>
                                )}
                              </td>

                              {/* 1-Touch Status Toggle */}
                              <td className="py-2.5 px-3 text-center">
                                {item.fundStatus === 'pending' ? (
                                  <div className="inline-flex flex-col items-center gap-1">
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 animate-pulse">
                                      <Clock className="w-3 h-3 text-amber-600" />
                                      <span>Chờ duyệt</span>
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => handleApproveFundDirect(item, 500000)}
                                      className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold shadow-2xs transition cursor-pointer"
                                      title="Khớp lệnh duyệt nhanh 500k cho bạn này"
                                    >
                                      <Check className="w-3 h-3" />
                                      <span>Duyệt 500k</span>
                                    </button>
                                  </div>
                                ) : isPaid ? (
                                  <button
                                    type="button"
                                    onClick={() => handleToggleFundPaid(item)}
                                    className="inline-flex items-center gap-1 px-2.5 py-1.2 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-2xs transition cursor-pointer"
                                    title="Bấm để chuyển về Chưa Thu"
                                  >
                                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                                    <span>Đã Thu Tiền</span>
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handleToggleFundPaid(item)}
                                    className="inline-flex items-center gap-1 px-2.5 py-1.2 rounded-full text-[11px] font-bold bg-rose-50 hover:bg-emerald-50 text-rose-700 hover:text-emerald-700 border border-rose-200 transition cursor-pointer"
                                    title="Bấm để đánh dấu Đã Thu Tiền 500k"
                                  >
                                    <Clock className="w-3.5 h-3.5 text-rose-500" />
                                    <span>Chưa Nộp</span>
                                  </button>
                                )}
                              </td>

                              {/* Audit Trail & Notes */}
                              <td className="py-2.5 px-3 text-slate-600 text-xs">
                                <div className="space-y-0.5">
                                  <p className="italic text-slate-700 line-clamp-2">
                                    {item.fundNote || (isPaid ? 'Đã thu đủ 500k' : 'Chưa nộp')}
                                  </p>
                                  {item.fundAuditedBy && (
                                    <span className="text-[10px] text-amber-800 font-sans font-semibold block">
                                      Duyệt: {item.fundAuditedBy}
                                    </span>
                                  )}
                                </div>
                              </td>

                              {/* Action: Open Deep Reconciliation Modal */}
                              <td className="py-2.5 px-3 text-right">
                                <button
                                  type="button"
                                  onClick={() => handleOpenAdjustFund(item)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-sans font-bold text-amber-900 hover:text-amber-950 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-lg shadow-2xs transition cursor-pointer"
                                  title="Đối soát chi tiết, sửa tiền hoặc upload ảnh chứng từ"
                                >
                                  <Edit className="w-3 h-3 text-amber-700" />
                                  <span>Đối Soát</span>
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
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
                <div className="bg-white p-5 rounded-xl border border-amber-300 shadow-sm space-y-4 text-left">
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-slate-900 font-serif flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-amber-600" />
                      <span>Tùy Chỉnh, Kéo Vị Trí & Tải Lên Ảnh Bìa Đầu Trang (Hero Banner)</span>
                    </h4>
                    <p className="text-xs text-slate-500">
                      Ảnh bìa hiển thị tràn ngang toàn màn hình. Bạn có thể <strong>nhấn giữ và kéo chuột lên/xuống trực tiếp</strong> trên ảnh xem trước hoặc dùng thanh trượt để chọn góc nhìn và khuôn mặt bạn bè đẹp nhất.
                    </p>
                  </div>

                  {settingsSuccessMsg && (
                    <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-lg text-xs font-bold flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      <span>{settingsSuccessMsg}</span>
                    </div>
                  )}

                  {/* Banner Preview With Interactive Drag Reposition */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <MoveVertical className="w-3.5 h-3.5 text-amber-600" />
                        <span>Xem trước & Kéo chỉnh vùng hiển thị ảnh bìa:</span>
                      </label>
                      <span className="text-[11px] font-mono font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded border border-amber-300/80">
                        Vị trí: {bannerPositionY}% {bannerPositionY <= 25 ? '(Phía Trên)' : bannerPositionY >= 75 ? '(Phía Dưới)' : '(Chính Giữa)'}
                      </span>
                    </div>

                    <div
                      ref={bannerPreviewRef}
                      onMouseDown={handleMouseDownBanner}
                      onMouseMove={handleMouseMoveBanner}
                      onMouseUp={handleMouseUpBanner}
                      onMouseLeave={handleMouseUpBanner}
                      onTouchStart={handleTouchStartBanner}
                      onTouchMove={handleTouchMoveBanner}
                      onTouchEnd={handleTouchEndBanner}
                      className={`w-full h-52 sm:h-64 rounded-xl overflow-hidden relative border-2 border-dashed border-amber-400 bg-slate-900 shadow-inner select-none transition-all ${
                        isDraggingBanner ? 'cursor-grabbing ring-2 ring-amber-500 shadow-lg' : 'cursor-grab hover:border-amber-500'
                      }`}
                      title="Nhấn giữ và kéo lên/xuống để chỉnh góc nhìn"
                    >
                      <img
                        src={bannerInput}
                        alt="Preview Banner"
                        style={{ objectPosition: `center ${bannerPositionY}%` }}
                        className="w-full h-full object-cover select-none pointer-events-none transition-[object-position] duration-75 filter contrast-105"
                      />
                      {/* Hiệu ứng mờ dần cạnh dưới như trên trang chủ */}
                      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#FDFBF7] to-transparent pointer-events-none" />

                      {/* Reposition instruction overlay badge */}
                      <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 px-3 py-1.5 bg-black/75 backdrop-blur-md rounded-lg text-[11px] text-amber-200 font-sans font-medium border border-amber-400/40 shadow-md">
                        <MoveVertical className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
                        <span>🖐️ Kéo ảnh lên/xuống trực tiếp để chọn vùng ưng ý</span>
                      </div>

                      <div className="absolute bottom-2.5 right-2.5 px-2.5 py-1 bg-black/70 backdrop-blur-md rounded-lg text-[10px] text-amber-300 font-mono border border-amber-400/30">
                        Object-Position: center {bannerPositionY}%
                      </div>
                    </div>
                  </div>

                  {/* Thanh Trượt & Nút Chọn Vùng Nhanh */}
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2.5">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                      <span className="flex items-center gap-1.5 text-slate-900">
                        <SlidersHorizontal className="w-3.5 h-3.5 text-amber-600" />
                        <span>Thanh trượt vi chỉnh vị trí dọc:</span>
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono">{bannerPositionY}%</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-slate-400 font-bold shrink-0">🔝 Đỉnh (0%)</span>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="1"
                        value={bannerPositionY}
                        onChange={(e) => setBannerPositionY(Number(e.target.value))}
                        className="flex-1 accent-amber-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
                      />
                      <span className="text-[10px] text-slate-400 font-bold shrink-0">🔻 Đáy (100%)</span>
                    </div>

                    {/* Quick Preset Buttons */}
                    <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-200/80">
                      <span className="text-[11px] text-slate-500 italic">Vị trí nhanh:</span>
                      <button
                        type="button"
                        onClick={() => setBannerPositionY(15)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition cursor-pointer ${
                          bannerPositionY === 15 ? 'bg-amber-600 text-white border-amber-600' : 'bg-white text-slate-700 border-slate-300 hover:bg-amber-50'
                        }`}
                      >
                        🔝 Lấy Cảnh Trên (15%)
                      </button>
                      <button
                        type="button"
                        onClick={() => setBannerPositionY(35)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition cursor-pointer ${
                          bannerPositionY === 35 ? 'bg-amber-600 text-white border-amber-600' : 'bg-white text-slate-700 border-slate-300 hover:bg-amber-50'
                        }`}
                      >
                        👥 Canh Khuôn Mặt (35%)
                      </button>
                      <button
                        type="button"
                        onClick={() => setBannerPositionY(50)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition cursor-pointer ${
                          bannerPositionY === 50 ? 'bg-amber-600 text-white border-amber-600' : 'bg-white text-slate-700 border-slate-300 hover:bg-amber-50'
                        }`}
                      >
                        🎯 Chính Giữa (50%)
                      </button>
                      <button
                        type="button"
                        onClick={() => setBannerPositionY(80)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition cursor-pointer ${
                          bannerPositionY === 80 ? 'bg-amber-600 text-white border-amber-600' : 'bg-white text-slate-700 border-slate-300 hover:bg-amber-50'
                        }`}
                      >
                        🔻 Lấy Phần Dưới (80%)
                      </button>
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
                        <span>Lưu Ảnh Bìa & Vị Trí</span>
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
          {/* TAB 5: EVENT CONFIGURATION & SYSTEM SETTINGS (FULL CRUD) */}
          {/* --------------------------------------------------------------- */}
          {activeTab === 'settings' && isAuthorized && (
            <div className="space-y-6 max-w-4xl mx-auto pb-8 text-left">
              
              {/* Header Info */}
              <div className="bg-gradient-to-r from-amber-500/10 via-amber-100/50 to-amber-50 rounded-2xl p-5 border border-amber-300 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 bg-amber-600 text-white rounded-lg shadow-xs">
                      <Settings className="w-4 h-4" />
                    </span>
                    <h3 className="text-base sm:text-lg font-serif font-bold text-slate-900">
                      Cấu Hình Thông Tin Sự Kiện & Hệ Thống
                    </h3>
                  </div>
                  <p className="text-xs text-slate-600 font-sans">
                    Dành cho <strong>Ban Liên Lạc 🛡️</strong> và <strong>Quản Trị Viên 👑</strong>. Mọi chỉnh sửa về Địa điểm, Thời gian, Thư ngỏ, Tài khoản quỹ sẽ cập nhật trực tiếp lên trang chủ.
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleResetEventConfigDefault}
                    className="px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 text-xs font-sans font-bold rounded-lg border border-slate-300 shadow-xs transition cursor-pointer flex items-center gap-1.5"
                    title="Khôi phục thông tin địa điểm và sự kiện mặc định"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                    <span>Mặc Định</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveSettings}
                    className="px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white text-xs font-sans font-bold rounded-lg shadow-md transition cursor-pointer flex items-center gap-1.5 uppercase tracking-wider"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Lưu Cấu Hình</span>
                  </button>
                </div>
              </div>

              {/* Alert Feedback */}
              {settingsSuccessMsg && (
                <div className="p-4 bg-emerald-50 border-2 border-emerald-400 text-emerald-900 rounded-xl font-bold text-xs flex items-center gap-2.5 shadow-sm animate-bounce">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>{settingsSuccessMsg}</span>
                </div>
              )}

              {/* Quick Navigation Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-sans font-bold">
                <button
                  type="button"
                  onClick={() => setSettingsSection('all')}
                  className={`px-3 py-1.5 rounded-lg whitespace-nowrap cursor-pointer transition ${
                    settingsSection === 'all'
                      ? 'bg-slate-900 text-amber-300 shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  🌟 Xem Tất Cả
                </button>
                <button
                  type="button"
                  onClick={() => setSettingsSection('venue')}
                  className={`px-3 py-1.5 rounded-lg whitespace-nowrap cursor-pointer transition ${
                    settingsSection === 'venue'
                      ? 'bg-slate-900 text-amber-300 shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  📍 1. Địa Điểm & Bản Đồ
                </button>
                <button
                  type="button"
                  onClick={() => setSettingsSection('date')}
                  className={`px-3 py-1.5 rounded-lg whitespace-nowrap cursor-pointer transition ${
                    settingsSection === 'date'
                      ? 'bg-slate-900 text-amber-300 shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  📅 2. Thời Gian & Đếm Ngược
                </button>
                <button
                  type="button"
                  onClick={() => setSettingsSection('letter')}
                  className={`px-3 py-1.5 rounded-lg whitespace-nowrap cursor-pointer transition ${
                    settingsSection === 'letter'
                      ? 'bg-slate-900 text-amber-300 shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  📜 3. Thư Ngỏ & Lời Tựa
                </button>
                <button
                  type="button"
                  onClick={() => setSettingsSection('bank')}
                  className={`px-3 py-1.5 rounded-lg whitespace-nowrap cursor-pointer transition ${
                    settingsSection === 'bank'
                      ? 'bg-slate-900 text-amber-300 shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  🏦 4. Tài Khoản Quỹ & Mã QR
                </button>
                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => setSettingsSection('security')}
                    className={`px-3 py-1.5 rounded-lg whitespace-nowrap cursor-pointer transition ${
                      settingsSection === 'security'
                        ? 'bg-slate-900 text-amber-300 shadow-xs'
                        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    🔒 5. Mã PIN & Apps Script
                  </button>
                )}
              </div>

              <form onSubmit={handleSaveSettings} className="space-y-6">

                {/* ============================================================= */}
                {/* SECTION 1: 📍 ĐỊA ĐIỂM TỔ CHỨC & BẢN ĐỒ GOOGLE MAPS */}
                {/* ============================================================= */}
                {(settingsSection === 'all' || settingsSection === 'venue') && (
                  <div className="bg-white rounded-2xl border border-amber-300/80 shadow-sm p-5 sm:p-6 space-y-4">
                    <div className="flex items-center justify-between border-b border-amber-200 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="p-1.5 bg-amber-100 text-amber-800 rounded-lg">
                          <MapPin className="w-4 h-4" />
                        </span>
                        <div>
                          <h4 className="font-serif font-bold text-slate-900 text-sm sm:text-base">
                            1. Địa Điểm Tổ Chức & Bản Đồ Google Maps
                          </h4>
                          <p className="text-[11px] text-slate-500 font-sans">
                            Hiển thị tại mục Hội Ngộ, Thư Ngỏ thiệp mời và Thẻ học sinh
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-bold">
                        BLL & Admin
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div className="space-y-1.5 sm:col-span-2">
                        <label className="font-bold text-slate-700 flex items-center justify-between">
                          <span>Tên Trung Tâm / Nhà Hàng (*):</span>
                          <span className="text-[11px] font-normal text-slate-400">VD: Crown Palace Thái Nguyên</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={eventConfigForm.venueName}
                          onChange={(e) => setEventConfigForm({ ...eventConfigForm, venueName: e.target.value })}
                          placeholder="VD: Trung Tâm Tiệc Cưới & Sự Kiện Crown Palace"
                          className="w-full px-3 py-2 bg-[#FAF9F6] border border-slate-300 rounded-lg font-bold text-slate-900 focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div className="space-y-1.5 sm:col-span-2">
                        <label className="font-bold text-slate-700">
                          Phụ Đề Sự Kiện Tại Địa Điểm:
                        </label>
                        <input
                          type="text"
                          value={eventConfigForm.venueSubtitle || ''}
                          onChange={(e) => setEventConfigForm({ ...eventConfigForm, venueSubtitle: e.target.value })}
                          placeholder="VD: Địa điểm tổ chức Họp Lớp 20 Năm Ngày Trở Về — Lớp K8A1"
                          className="w-full px-3 py-2 bg-[#FAF9F6] border border-slate-300 rounded-lg focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div className="space-y-1.5 sm:col-span-2">
                        <label className="font-bold text-slate-700">
                          Địa Chỉ Đầy Đủ (*):
                        </label>
                        <input
                          type="text"
                          required
                          value={eventConfigForm.venueAddress}
                          onChange={(e) => setEventConfigForm({ ...eventConfigForm, venueAddress: e.target.value })}
                          placeholder="VD: Số 779 đường Dương Tự Minh, P. Quang Vinh, TP. Thái Nguyên, Tỉnh Thái Nguyên"
                          className="w-full px-3 py-2 bg-[#FAF9F6] border border-slate-300 rounded-lg focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="font-bold text-slate-700">
                          Địa Chỉ Rút Gọn (Hiển thị thiệp):
                        </label>
                        <input
                          type="text"
                          value={eventConfigForm.shortAddress}
                          onChange={(e) => setEventConfigForm({ ...eventConfigForm, shortAddress: e.target.value })}
                          placeholder="VD: 779 Dương Tự Minh, TP. Thái Nguyên"
                          className="w-full px-3 py-2 bg-[#FAF9F6] border border-slate-300 rounded-lg focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="font-bold text-slate-700 flex items-center justify-between">
                          <span>Link Google Maps Trực Tiếp / Chỉ Đường:</span>
                          {eventConfigForm.mapDirectUrl && (
                            <a
                              href={eventConfigForm.mapDirectUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[11px] text-amber-700 hover:text-amber-900 inline-flex items-center gap-1 font-bold"
                            >
                              <span>Mở Thử</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </label>
                        <input
                          type="url"
                          value={eventConfigForm.mapDirectUrl}
                          onChange={(e) => setEventConfigForm({ ...eventConfigForm, mapDirectUrl: e.target.value })}
                          placeholder="https://maps.google.com/?q=..."
                          className="w-full px-3 py-2 bg-[#FAF9F6] border border-slate-300 rounded-lg font-mono text-xs focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div className="space-y-1.5 sm:col-span-2">
                        <label className="font-bold text-slate-700 flex items-center justify-between">
                          <span>Link Nhúng Bản Đồ Google Maps (iframe embed):</span>
                          <span className="text-[11px] text-slate-400 font-normal">URL trong thẻ iframe src</span>
                        </label>
                        <input
                          type="url"
                          value={eventConfigForm.mapEmbedUrl}
                          onChange={(e) => setEventConfigForm({ ...eventConfigForm, mapEmbedUrl: e.target.value })}
                          placeholder="https://maps.google.com/maps?q=...&output=embed"
                          className="w-full px-3 py-2 bg-[#FAF9F6] border border-slate-300 rounded-lg font-mono text-xs focus:outline-none focus:border-amber-500"
                        />
                        <p className="text-[11px] text-slate-400">
                          💡 <strong>Cách lấy link nhúng:</strong> Mở Google Maps → Tìm địa điểm → Bấm <em>Chia sẻ</em> → Chọn tab <em>Nhúng bản đồ</em> → Sao chép URL nằm trong thuộc tính <code>src="..."</code> dán vào đây.
                        </p>
                      </div>

                      {/* Live Embed Preview */}
                      {eventConfigForm.mapEmbedUrl && (
                        <div className="sm:col-span-2 space-y-1.5">
                          <label className="font-bold text-slate-600 text-[11px]">Xem trước bản đồ Google Maps:</label>
                          <div className="rounded-xl overflow-hidden border border-amber-300/60 aspect-video max-h-56 bg-slate-100">
                            <iframe
                              title="Xem trước Google Maps"
                              src={eventConfigForm.mapEmbedUrl}
                              className="w-full h-full border-0"
                              loading="lazy"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ============================================================= */}
                {/* SECTION 2: 📅 THỜI GIAN TỔ CHỨC & ĐẾM NGƯỢC */}
                {/* ============================================================= */}
                {(settingsSection === 'all' || settingsSection === 'date') && (
                  <div className="bg-white rounded-2xl border border-amber-300/80 shadow-sm p-5 sm:p-6 space-y-4">
                    <div className="flex items-center justify-between border-b border-amber-200 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="p-1.5 bg-amber-100 text-amber-800 rounded-lg">
                          <Calendar className="w-4 h-4" />
                        </span>
                        <div>
                          <h4 className="font-serif font-bold text-slate-900 text-sm sm:text-base">
                            2. Thời Gian Tổ Chức & Đồng Hồ Đếm Ngược
                          </h4>
                          <p className="text-[11px] text-slate-500 font-sans">
                            Cấu hình ngày giờ hiển thị trên Banner, Đồng hồ đếm ngược và Lịch nhắc Google Calendar
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-bold">
                        BLL & Admin
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div className="space-y-1.5">
                        <label className="font-bold text-slate-700">
                          Tiêu Đề Sự Kiện:
                        </label>
                        <input
                          type="text"
                          value={eventConfigForm.eventTitle}
                          onChange={(e) => setEventConfigForm({ ...eventConfigForm, eventTitle: e.target.value })}
                          placeholder="VD: 20 Năm Ngày Trở Về"
                          className="w-full px-3 py-2 bg-[#FAF9F6] border border-slate-300 rounded-lg font-bold focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="font-bold text-slate-700">
                          Phụ Đề Khóa / Lớp:
                        </label>
                        <input
                          type="text"
                          value={eventConfigForm.eventSubtitle}
                          onChange={(e) => setEventConfigForm({ ...eventConfigForm, eventSubtitle: e.target.value })}
                          placeholder="VD: Lớp K8A1 — Trường THPT Thái Nguyên"
                          className="w-full px-3 py-2 bg-[#FAF9F6] border border-slate-300 rounded-lg focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="font-bold text-slate-700">
                          Dòng Hiển Thị Ngày Tổ Chức (*):
                        </label>
                        <input
                          type="text"
                          required
                          value={eventConfigForm.eventDateText}
                          onChange={(e) => setEventConfigForm({ ...eventConfigForm, eventDateText: e.target.value })}
                          placeholder="VD: Chủ Nhật, 27/09/2026 (08:30 — 15:30)"
                          className="w-full px-3 py-2 bg-[#FAF9F6] border border-slate-300 rounded-lg font-bold text-slate-900 focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="font-bold text-slate-700">
                          Dòng Hiển Thị Giờ Đón Tiếp:
                        </label>
                        <input
                          type="text"
                          value={eventConfigForm.eventTimeText}
                          onChange={(e) => setEventConfigForm({ ...eventConfigForm, eventTimeText: e.target.value })}
                          placeholder="VD: Từ 08:30 Sáng — Chủ Nhật, ngày 27/09/2026"
                          className="w-full px-3 py-2 bg-[#FAF9F6] border border-slate-300 rounded-lg focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div className="space-y-1.5 sm:col-span-2">
                        <label className="font-bold text-slate-700 flex items-center justify-between">
                          <span>Mốc Thời Gian Đích Cho Đồng Hồ Đếm Ngược (Chuẩn ISO):</span>
                          <span className="font-mono text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            {eventConfigForm.countdownTarget}
                          </span>
                        </label>
                        <input
                          type="text"
                          required
                          value={eventConfigForm.countdownTarget}
                          onChange={(e) => setEventConfigForm({ ...eventConfigForm, countdownTarget: e.target.value })}
                          placeholder="2026-09-27T08:30:00+07:00"
                          className="w-full px-3 py-2 bg-[#FAF9F6] border border-slate-300 rounded-lg font-mono text-xs focus:outline-none focus:border-amber-500"
                        />
                        <p className="text-[11px] text-slate-400">
                          Định dạng chuẩn: <code>YYYY-MM-DDTHH:mm:ss+07:00</code> (VD: <code>2026-09-27T08:30:00+07:00</code> cho 8h30 sáng ngày 27/09/2026).
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* ============================================================= */}
                {/* SECTION 3: 📜 THƯ NGỎ & THIỆP MỜI DẠ TIỆC */}
                {/* ============================================================= */}
                {(settingsSection === 'all' || settingsSection === 'letter') && (
                  <div className="bg-white rounded-2xl border border-amber-300/80 shadow-sm p-5 sm:p-6 space-y-4">
                    <div className="flex items-center justify-between border-b border-amber-200 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="p-1.5 bg-amber-100 text-amber-800 rounded-lg">
                          <MailOpen className="w-4 h-4" />
                        </span>
                        <div>
                          <h4 className="font-serif font-bold text-slate-900 text-sm sm:text-base">
                            3. Thư Ngỏ & Lời Tựa Kỷ Niệm 20 Năm
                          </h4>
                          <p className="text-[11px] text-slate-500 font-sans">
                            Nội dung bức thư trang trọng gửi gắm tới các bạn học sinh Lớp K8A1
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-bold">
                        BLL & Admin
                      </span>
                    </div>

                    <div className="space-y-4 text-xs">
                      <div className="space-y-1.5">
                        <label className="font-bold text-slate-700">
                          Tiêu Đề Thư Ngỏ:
                        </label>
                        <input
                          type="text"
                          value={eventConfigForm.letterTitle}
                          onChange={(e) => setEventConfigForm({ ...eventConfigForm, letterTitle: e.target.value })}
                          placeholder="VD: Lời Ngỏ Thân Tình Gửi Bạn Tôi — Lớp K8A1"
                          className="w-full px-3 py-2 bg-[#FAF9F6] border border-slate-300 rounded-lg font-serif font-bold text-slate-900 focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="font-bold text-slate-700">
                          Lời Tựa Dưới Tiêu Đề:
                        </label>
                        <input
                          type="text"
                          value={eventConfigForm.letterSubtitle}
                          onChange={(e) => setEventConfigForm({ ...eventConfigForm, letterSubtitle: e.target.value })}
                          placeholder="VD: Hai mươi năm một chặng đường — Nơi ký ức thanh xuân THPT Thái Nguyên mãi vẹn nguyên"
                          className="w-full px-3 py-2 bg-[#FAF9F6] border border-slate-300 rounded-lg font-serif italic text-slate-700 focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="font-bold text-slate-700">
                          Nội Dung Đoạn 1 (Mở đầu tâm thư):
                        </label>
                        <textarea
                          rows={4}
                          value={eventConfigForm.letterParagraph1}
                          onChange={(e) => setEventConfigForm({ ...eventConfigForm, letterParagraph1: e.target.value })}
                          className="w-full px-3 py-2 bg-[#FAF9F6] border border-slate-300 rounded-lg font-serif text-slate-800 leading-relaxed focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="font-bold text-slate-700">
                          Nội Dung Đoạn 2 (Lời hẹn ngày hội ngộ):
                        </label>
                        <textarea
                          rows={3}
                          value={eventConfigForm.letterParagraph2}
                          onChange={(e) => setEventConfigForm({ ...eventConfigForm, letterParagraph2: e.target.value })}
                          className="w-full px-3 py-2 bg-[#FAF9F6] border border-slate-300 rounded-lg font-serif text-slate-800 leading-relaxed focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="font-bold text-slate-700">
                            Đơn Vị / Đại Diện Ký Tên:
                          </label>
                          <input
                            type="text"
                            value={eventConfigForm.letterSignatureTitle}
                            onChange={(e) => setEventConfigForm({ ...eventConfigForm, letterSignatureTitle: e.target.value })}
                            placeholder="VD: Ban Liên Lạc Lớp K8A1 (Khóa 8)"
                            className="w-full px-3 py-2 bg-[#FAF9F6] border border-slate-300 rounded-lg font-bold focus:outline-none focus:border-amber-500"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="font-bold text-slate-700">
                            Phụ Chú Chữ Ký:
                          </label>
                          <input
                            type="text"
                            value={eventConfigForm.letterSignatureSubtitle}
                            onChange={(e) => setEventConfigForm({ ...eventConfigForm, letterSignatureSubtitle: e.target.value })}
                            placeholder="VD: Trường THPT Thái Nguyên (2003 — 2006)"
                            className="w-full px-3 py-2 bg-[#FAF9F6] border border-slate-300 rounded-lg focus:outline-none focus:border-amber-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ============================================================= */}
                {/* SECTION 4: 🏦 TÀI KHOẢN ĐÓNG QUỸ & MÃ QR TẠM ỨNG */}
                {/* ============================================================= */}
                {(settingsSection === 'all' || settingsSection === 'bank') && (
                  <div className="bg-white rounded-2xl border border-amber-300/80 shadow-sm p-5 sm:p-6 space-y-5">
                    <div className="flex items-center justify-between border-b border-amber-200 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="p-1.5 bg-amber-100 text-amber-800 rounded-lg">
                          <Landmark className="w-4 h-4" />
                        </span>
                        <div>
                          <h4 className="font-serif font-bold text-slate-900 text-sm sm:text-base">
                            4. Tài Khoản Quỹ Lớp & Mã VietQR Đóng Tiền
                          </h4>
                          <p className="text-[11px] text-slate-500 font-sans">
                            Cấu hình tài khoản nhận tiền, tự động sinh mã VietQR chuẩn Napas 24/7 quét được trên tất cả App ngân hàng
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-bold">
                        BLL & Admin
                      </span>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                      {/* Left: Input Form Controls (7 cols) */}
                      <div className="lg:col-span-7 space-y-4 text-xs">
                        <div className="space-y-1.5">
                          <label className="font-bold text-slate-700 flex items-center justify-between">
                            <span>Chọn Ngân Hàng Nhận (*):</span>
                            <span className="text-[10px] text-emerald-700 font-normal">Hỗ trợ 30+ Ngân Hàng Việt Nam</span>
                          </label>
                          <select
                            value={eventConfigForm.bankCode || resolveBankCode(eventConfigForm.bankName)}
                            onChange={(e) => {
                              const found = VIETNAM_BANKS.find(b => b.code === e.target.value);
                              setEventConfigForm({
                                ...eventConfigForm,
                                bankCode: e.target.value,
                                bankName: found ? found.shortName : eventConfigForm.bankName
                              });
                            }}
                            className="w-full px-3 py-2 bg-[#FAF9F6] border border-slate-300 rounded-lg font-bold text-slate-800 text-xs focus:outline-none focus:border-amber-500 cursor-pointer"
                          >
                            {VIETNAM_BANKS.map((b) => (
                              <option key={b.code} value={b.code}>
                                {b.shortName} — {b.name} (BIN: {b.bin})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                          <div className="space-y-1.5">
                            <label className="font-bold text-slate-700">
                              Tên Hiển Thị Ngân Hàng:
                            </label>
                            <input
                              type="text"
                              required
                              value={eventConfigForm.bankName}
                              onChange={(e) => setEventConfigForm({ ...eventConfigForm, bankName: e.target.value })}
                              placeholder="VD: Vietcombank (VCB)"
                              className="w-full px-3 py-2 bg-[#FAF9F6] border border-slate-300 rounded-lg font-bold focus:outline-none focus:border-amber-500"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="font-bold text-slate-700">
                              Số Tài Khoản Nhận Quỹ (*):
                            </label>
                            <input
                              type="text"
                              required
                              value={String(eventConfigForm.bankAccount || '')}
                              onChange={(e) => setEventConfigForm({ ...eventConfigForm, bankAccount: String(e.target.value).replace(/\s+/g, '') })}
                              placeholder="VD: 10123456789"
                              className="w-full px-3 py-2 bg-[#FAF9F6] border border-slate-300 rounded-lg font-mono font-bold text-emerald-700 text-sm focus:outline-none focus:border-amber-500"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                          <div className="space-y-1.5">
                            <label className="font-bold text-slate-700">
                              Chủ Tài Khoản (In Hoa Không Dấu) (*):
                            </label>
                            <input
                              type="text"
                              required
                              value={eventConfigForm.bankHolder}
                              onChange={(e) => setEventConfigForm({ ...eventConfigForm, bankHolder: sanitizeVietQrText(e.target.value) })}
                              placeholder="VD: NGUYEN VAN BAN TO CHUC"
                              className="w-full px-3 py-2 bg-[#FAF9F6] border border-slate-300 rounded-lg font-bold uppercase font-mono focus:outline-none focus:border-amber-500"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="font-bold text-slate-700 flex items-center justify-between">
                              <span>Mức Quỹ Tạm Ứng (VNĐ):</span>
                              <span className="text-[10px] text-amber-700 font-bold">
                                {eventConfigForm.fundAmountPerPerson ? eventConfigForm.fundAmountPerPerson.toLocaleString('vi-VN') + 'đ' : ''}
                              </span>
                            </label>
                            <div className="space-y-1.5">
                              <input
                                type="number"
                                step={50000}
                                value={eventConfigForm.fundAmountPerPerson}
                                onChange={(e) => setEventConfigForm({ ...eventConfigForm, fundAmountPerPerson: Number(e.target.value) || 500000 })}
                                placeholder="500000"
                                className="w-full px-3 py-2 bg-[#FAF9F6] border border-slate-300 rounded-lg font-bold text-amber-800 focus:outline-none focus:border-amber-500"
                              />
                              <div className="flex items-center gap-1.5">
                                {[300000, 500000, 1000000].map((amt) => (
                                  <button
                                    key={amt}
                                    type="button"
                                    onClick={() => setEventConfigForm({ ...eventConfigForm, fundAmountPerPerson: amt })}
                                    className={`text-[10px] px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                                      eventConfigForm.fundAmountPerPerson === amt
                                        ? 'bg-amber-600 text-white border-amber-600 font-bold'
                                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                                    }`}
                                  >
                                    {(amt / 1000).toLocaleString('vi-VN')}k
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Cú pháp chuyển khoản */}
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <label className="font-bold text-slate-700">
                              Cú Pháp Chuyển Khoản Mẫu (*):
                            </label>
                            <button
                              type="button"
                              onClick={() => {
                                setEventConfigForm({
                                  ...eventConfigForm,
                                  transferSyntax: sanitizeVietQrText(eventConfigForm.transferSyntax || 'KY NIEM 20 NAM K8A1')
                                });
                              }}
                              className="text-[10px] text-amber-800 hover:text-amber-950 font-bold underline cursor-pointer"
                            >
                              Chuẩn hóa Napas không dấu
                            </button>
                          </div>
                          <input
                            type="text"
                            value={eventConfigForm.transferSyntax}
                            onChange={(e) => setEventConfigForm({ ...eventConfigForm, transferSyntax: e.target.value })}
                            placeholder="VD: KY NIEM 20 NAM K8A1"
                            className="w-full px-3 py-2 bg-[#FAF9F6] border border-slate-300 rounded-lg font-mono font-bold text-slate-800 text-xs focus:outline-none focus:border-amber-500"
                          />
                          <p className="text-[10px] text-slate-500 font-sans">
                            💡 Khuyên dùng: Chữ in hoa không dấu, không dùng dấu ngoặc vuông <code>[]</code> hay ký tự đặc biệt để App ngân hàng quét 100% thành công.
                          </p>
                        </div>

                        {/* Kiểu hiển thị mã QR */}
                        <div className="space-y-1.5">
                          <label className="font-bold text-slate-700">
                            Kiểu Hiển Thị Khung VietQR:
                          </label>
                          <div className="grid grid-cols-3 gap-2">
                            {[
                              { id: 'compact', label: 'Khung Chuẩn (Gợi ý)', desc: 'Rõ nét, có logo & thông tin' },
                              { id: 'qr_only', label: 'Mã QR Trơn', desc: 'Toàn màn hình, siêu nét' },
                              { id: 'compact2', label: 'Khung Đầy Đủ', desc: 'Kèm banner VietQR' }
                            ].map((tpl) => (
                              <button
                                key={tpl.id}
                                type="button"
                                onClick={() => setEventConfigForm({ ...eventConfigForm, qrTemplate: tpl.id as any })}
                                className={`p-2 rounded-lg border text-left transition-all cursor-pointer ${
                                  (eventConfigForm.qrTemplate || 'compact') === tpl.id
                                    ? 'bg-amber-50 border-amber-400 text-amber-900 font-bold shadow-xs'
                                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                }`}
                              >
                                <p className="text-xs">{tpl.label}</p>
                                <p className="text-[9px] text-slate-400 font-normal">{tpl.desc}</p>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Custom QR URL / Upload file */}
                        <div className="space-y-2 p-3 bg-amber-50/50 rounded-xl border border-amber-200">
                          <label className="font-bold text-slate-700 flex items-center justify-between">
                            <span className="flex items-center gap-1.5">
                              <QrCode className="w-3.5 h-3.5 text-amber-700" />
                              <span>Ảnh Mã QR Tùy Chỉnh (Tùy Chọn):</span>
                            </span>
                            {eventConfigForm.customQrUrl && (
                              <button
                                type="button"
                                onClick={() => setEventConfigForm({ ...eventConfigForm, customQrUrl: '' })}
                                className="text-[10px] text-rose-600 hover:text-rose-800 font-bold cursor-pointer"
                              >
                                ✕ Xóa để dùng VietQR tự sinh
                              </button>
                            )}
                          </label>

                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={eventConfigForm.customQrUrl || ''}
                              onChange={(e) => setEventConfigForm({ ...eventConfigForm, customQrUrl: e.target.value })}
                              placeholder="Dán link ảnh hoặc tải file QR từ App ngân hàng..."
                              className="flex-1 px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-mono text-[11px] focus:outline-none focus:border-amber-500"
                            />
                            
                            <label className="inline-flex items-center gap-1 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 hover:border-amber-400 rounded-lg text-[11px] font-bold text-slate-700 cursor-pointer shrink-0 transition-colors shadow-xs">
                              <Upload className="w-3.5 h-3.5 text-amber-700" />
                              <span>Tải file ảnh</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const reader = new FileReader();
                                    reader.onload = (loadEvt) => {
                                      const b64 = loadEvt.target?.result as string;
                                      if (b64) {
                                        setEventConfigForm({ ...eventConfigForm, customQrUrl: b64 });
                                      }
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }}
                              />
                            </label>
                          </div>
                          <p className="text-[10px] text-slate-500 font-sans">
                            Nếu để trống, hệ thống sẽ tự động sinh mã VietQR sắc nét theo đúng STK và Mức quỹ ở trên.
                          </p>
                        </div>
                      </div>

                      {/* Right: Live Preview Box (5 cols) */}
                      <div className="lg:col-span-5 flex flex-col items-center justify-center p-4 bg-gradient-to-b from-[#FAF8F5] to-[#F5EFE6] rounded-xl border border-amber-200/90 space-y-3.5 text-center">
                        <div className="space-y-0.5">
                          <span className="text-[10px] uppercase font-bold tracking-wider text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-full border border-amber-200">
                            XEM TRƯỚC MÃ QR TRỰC TIẾP
                          </span>
                          <h5 className="font-serif font-bold text-slate-900 text-sm">
                            Mã Quét Sẽ Xuất Hiện Cho Cả Lớp
                          </h5>
                        </div>

                        {/* QR Image Frame */}
                        {(() => {
                          const previewQrUrl = eventConfigForm.customQrUrl && eventConfigForm.customQrUrl.trim() !== ''
                            ? eventConfigForm.customQrUrl
                            : generateVietQrUrl({
                                bankCode: eventConfigForm.bankCode,
                                bankName: eventConfigForm.bankName,
                                bankAccount: String(eventConfigForm.bankAccount || ''),
                                bankHolder: eventConfigForm.bankHolder,
                                fundAmount: eventConfigForm.fundAmountPerPerson,
                                transferSyntax: eventConfigForm.transferSyntax,
                                template: eventConfigForm.qrTemplate || 'compact'
                              });

                          return (
                            <div className="space-y-3 w-full max-w-[240px]">
                              <div className="p-2.5 bg-white border-2 border-amber-400 rounded-2xl shadow-md flex items-center justify-center aspect-square mx-auto">
                                <img
                                  src={previewQrUrl}
                                  alt="Mã QR xem trước"
                                  className="w-full h-full object-contain rounded-lg"
                                  referrerPolicy="no-referrer"
                                />
                              </div>

                              <div className="bg-white p-2.5 rounded-lg border border-amber-200/80 text-[11px] text-left space-y-1">
                                <div className="flex justify-between">
                                  <span className="text-slate-500">Ngân hàng:</span>
                                  <span className="font-bold text-slate-900">{eventConfigForm.bankName}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-slate-500">Số TK:</span>
                                  <span className="font-mono font-bold text-emerald-700">{eventConfigForm.bankAccount}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-slate-500">Số tiền:</span>
                                  <span className="font-bold text-amber-800">
                                    {eventConfigForm.fundAmountPerPerson ? eventConfigForm.fundAmountPerPerson.toLocaleString('vi-VN') + 'đ' : '0đ'}
                                  </span>
                                </div>
                                <div className="flex justify-between pt-0.5 border-t border-slate-100">
                                  <span className="text-slate-500 shrink-0">Cú pháp:</span>
                                  <span className="font-mono font-bold text-slate-800 text-right truncate max-w-[130px]" title={eventConfigForm.transferSyntax}>
                                    {eventConfigForm.transferSyntax}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center justify-center gap-1.5 text-[10px] text-emerald-700 bg-emerald-50 py-1 px-2.5 rounded-full border border-emerald-200 font-bold">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Tương thích 100% App Ngân hàng</span>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                )}

                {/* ============================================================= */}
                {/* SECTION 5: 🔒 CẤU HÌNH MÃ PIN & GOOGLE APPS SCRIPT (ADMIN ONLY) */}
                {/* ============================================================= */}
                {(settingsSection === 'all' || settingsSection === 'security') && (
                  <div className="bg-white rounded-2xl border border-amber-300/80 shadow-sm p-5 sm:p-6 space-y-4">
                    <div className="flex items-center justify-between border-b border-amber-200 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="p-1.5 bg-amber-100 text-amber-800 rounded-lg">
                          <Shield className="w-4 h-4" />
                        </span>
                        <div>
                          <h4 className="font-serif font-bold text-slate-900 text-sm sm:text-base">
                            5. Cấu Hình Mã PIN & Backend Google Apps Script
                          </h4>
                          <p className="text-[11px] text-slate-500 font-sans">
                            Quản lý quyền đăng nhập Admin/BLL và liên kết cơ sở dữ liệu Google Sheet
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-amber-900 bg-amber-100 px-2 py-0.5 rounded border border-amber-300 font-bold">
                        👑 Admin Only
                      </span>
                    </div>

                    {isAdmin ? (
                      <div className="space-y-4 text-xs">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="font-bold text-slate-700 flex items-center justify-between">
                              <span>👑 Mã PIN Admin (Toàn quyền):</span>
                              <span className="font-mono text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-bold">Hiện tại: {adminPin}</span>
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
                              <span className="font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-bold">Hiện tại: {bllPin}</span>
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

                        {/* GOOGLE APPS SCRIPT MASTER BACKEND */}
                        <div className="p-4 bg-gradient-to-br from-amber-500/10 via-amber-100/40 to-slate-50 rounded-xl border-2 border-amber-300 space-y-4">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200 pb-3">
                            <div className="flex items-center gap-2">
                              <span className="p-1.5 bg-amber-600 text-white rounded-lg shadow-xs">
                                <FileSpreadsheet className="w-4 h-4" />
                              </span>
                              <div>
                                <h4 className="font-bold text-slate-900 text-sm">
                                  Máy Chủ Backend Google Sheets & Drive (Code.gs)
                                </h4>
                                <p className="text-[11px] text-slate-500">
                                  Lưu trữ tập trung mọi dữ liệu: Điểm danh, Lời chúc, Cấu hình sự kiện & Thư viện Media.
                                </p>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={handleCopyScriptCode}
                              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 shadow-sm shrink-0 ${
                                copiedScriptCode
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white'
                              }`}
                            >
                              {copiedScriptCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                              <span>{copiedScriptCode ? 'Đã Sao Chép Code.gs!' : '📋 Sao Chép Mã Code.gs Mới'}</span>
                            </button>
                          </div>

                          {/* Quick Deployment Guide */}
                          <div className="bg-white/90 rounded-xl p-3 border border-amber-200 space-y-2 text-[11.5px] text-slate-700 shadow-xs">
                            <div className="font-bold text-amber-900 flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                              <span>Cách triển khai để dữ liệu đồng nhất trên mọi máy tính và điện thoại:</span>
                            </div>
                            <ol className="list-decimal list-inside space-y-1 text-slate-600 pl-1 leading-relaxed">
                              <li>
                                Mở Google Sheet lớp K8A1 &gt; Nhấn menu <strong>Tiện ích mở rộng</strong> &gt; <strong>Apps Script</strong>.
                              </li>
                              <li>
                                Xóa sạch mã cũ trong file <code>Code.gs</code>, dán toàn bộ mã vừa sao chép ở trên &gt; Nhấn <strong>Lưu (Ctrl+S)</strong>.
                              </li>
                              <li>
                                Nhấn nút <strong>Triển khai</strong> (Deploy) màu xanh &gt; <strong>Tùy chọn triển khai mới</strong> &gt; Chọn bánh răng ⚙️ <strong>Ứng dụng web</strong>.
                              </li>
                              <li>
                                Mục <em>"Ai có quyền truy cập"</em> (Who has access): Chọn <strong>Bất kỳ ai</strong> (Anyone) &gt; Nhấn <strong>Triển khai</strong>.
                              </li>
                              <li>
                                Copy đường dẫn <strong>Ứng dụng web</strong> (kết thúc bằng <code>/exec</code>), dán vào ô bên dưới rồi nhấn <strong>"Kiểm Tra & Đồng Bộ"</strong>.
                              </li>
                            </ol>
                          </div>

                          {/* URL Input & Connection Tester */}
                          <div className="space-y-2">
                            <label className="font-bold text-slate-800 block text-xs">
                              🔗 URL Google Apps Script WebApp (kết thúc bằng /exec):
                            </label>
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                              <input
                                type="url"
                                value={scriptUrlInput}
                                onChange={(e) => setScriptUrlInput(e.target.value)}
                                placeholder="https://script.google.com/macros/s/.../exec"
                                className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono text-xs focus:outline-none focus:border-amber-500 shadow-inner"
                              />
                              <button
                                type="button"
                                disabled={isTestingConnection}
                                onClick={handleTestConnection}
                                className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-amber-300 text-xs font-bold rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50 shrink-0"
                              >
                                <RefreshCw className={`w-3.5 h-3.5 ${isTestingConnection ? 'animate-spin text-amber-400' : ''}`} />
                                <span>{isTestingConnection ? 'Đang kiểm tra...' : 'Kiểm Tra & Đồng Bộ'}</span>
                              </button>
                            </div>

                            {/* Connection feedback message */}
                            {connectionTestResult && (
                              <div className={`p-3 rounded-xl border text-xs flex items-center gap-2.5 ${
                                connectionTestResult.success
                                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                                  : 'bg-rose-50 border-rose-300 text-rose-900'
                              }`}>
                                {connectionTestResult.success ? (
                                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                                ) : (
                                  <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                                )}
                                <span className="leading-snug">{connectionTestResult.message}</span>
                              </div>
                            )}

                            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                              <span>💡 Dữ liệu Điểm danh, Lời chúc, Ảnh biên lai và Cấu hình sự kiện được lưu trữ bảo mật trên Google Sheet & Drive.</span>
                              <button
                                type="button"
                                onClick={() => setShowScriptCodeModal(!showScriptCodeModal)}
                                className="text-amber-700 hover:text-amber-900 underline font-semibold cursor-pointer shrink-0 ml-2"
                              >
                                {showScriptCodeModal ? 'Ẩn mã Code.gs' : 'Xem mã Code.gs'}
                              </button>
                            </div>

                            {showScriptCodeModal && (
                              <div className="mt-2 p-3 bg-slate-900 text-slate-200 rounded-xl max-h-64 overflow-y-auto font-mono text-[11px] space-y-2 border border-slate-700">
                                <div className="flex items-center justify-between border-b border-slate-700 pb-2">
                                  <span className="text-amber-400 font-bold">Mã Nguồn Code.gs (Google Apps Script)</span>
                                  <button
                                    type="button"
                                    onClick={handleCopyScriptCode}
                                    className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded text-[10px] transition cursor-pointer flex items-center gap-1"
                                  >
                                    <Copy className="w-3 h-3" />
                                    <span>{copiedScriptCode ? 'Đã sao chép!' : 'Chép mã'}</span>
                                  </button>
                                </div>
                                <pre className="whitespace-pre-wrap select-all leading-relaxed">{GOOGLE_APPS_SCRIPT_CODE}</pre>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="pt-2 flex items-center justify-between">
                          <button
                            type="button"
                            onClick={handleResetToDefault}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 rounded-lg text-xs font-bold border border-slate-200 transition cursor-pointer"
                          >
                            Khôi Phục PIN Mặc Định (8888/2006)
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-center gap-2">
                        <Lock className="w-4 h-4 text-amber-700 shrink-0" />
                        <span>Chỉ Quản trị viên (Admin 👑) mới có quyền đổi mã PIN và cấu hình URL Google Apps Script.</span>
                      </div>
                    )}
                  </div>
                )}

                {/* BOTTOM SAVE ACTION BAR */}
                <div className="pt-4 border-t border-amber-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <p className="text-xs text-slate-500 italic">
                    💡 Nhấn "Lưu Cấu Hình" để áp dụng ngay lập tức cho toàn bộ giao diện WebApp.
                  </p>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={handleResetEventConfigDefault}
                      className="flex-1 sm:flex-none px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-sans font-bold transition cursor-pointer"
                    >
                      Khôi Phục Mặc Định
                    </button>

                    <button
                      type="submit"
                      className="flex-1 sm:flex-none px-6 py-2.5 bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 hover:from-amber-700 hover:to-amber-900 text-white rounded-xl text-xs font-sans font-bold uppercase tracking-wider shadow-lg transition cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      <span>Lưu Cấu Hình Sự Kiện</span>
                    </button>
                  </div>
                </div>

              </form>
            </div>
          )}

        </div>
      </motion.div>

      {/* =================================================================== */}
      {/* MODAL: ADD / EDIT ROSTER MEMBER (DANH BẠ LỚP - TAB "Danh_Sach_Lop") */}
      {/* =================================================================== */}
      <AnimatePresence>
        {isRosterModalOpen && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl border border-amber-300 shadow-2xl w-full max-w-lg p-6 space-y-4 text-xs"
            >
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-800 font-bold">
                    {editingRosterMember ? '✏️' : '➕'}
                  </div>
                  <div>
                    <h3 className="text-base font-bold font-serif text-slate-900">
                      {editingRosterMember ? 'Chỉnh Sửa Bạn Học Trong Danh Bạ Lớp' : 'Thêm Bạn Học Vào Danh Bạ Lớp'}
                    </h3>
                    <p className="text-[11px] text-emerald-700 font-sans">
                      Lưu và đồng bộ trực tiếp vào Google Sheet (tab <strong>"Danh_Sach_Lop"</strong>)
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsRosterModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveRosterMember} className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Họ và Tên (*):</label>
                    <input
                      type="text"
                      required
                      value={rosterFormData.fullName || ''}
                      onChange={(e) => setRosterFormData({ ...rosterFormData, fullName: e.target.value })}
                      placeholder="VD: Nguyễn Tuấn Anh"
                      className="w-full px-3 py-2 bg-[#FAF8F5] border border-slate-300 rounded-lg focus:outline-none focus:border-amber-500 font-bold text-slate-900"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Biệt danh thời cấp 3:</label>
                    <input
                      type="text"
                      value={rosterFormData.nickname || ''}
                      onChange={(e) => setRosterFormData({ ...rosterFormData, nickname: e.target.value })}
                      placeholder="VD: Tuấn Báo, Hương Béo..."
                      className="w-full px-3 py-2 bg-[#FAF8F5] border border-slate-300 rounded-lg focus:outline-none focus:border-amber-500 text-amber-800 font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Số Điện Thoại:</label>
                    <input
                      type="tel"
                      value={rosterFormData.phone || ''}
                      onChange={(e) => setRosterFormData({ ...rosterFormData, phone: e.target.value })}
                      placeholder="VD: 0988123456"
                      className="w-full px-3 py-2 bg-[#FAF8F5] border border-slate-300 rounded-lg font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Vai trò trong lớp:</label>
                    <select
                      value={rosterFormData.role || 'Thành viên'}
                      onChange={(e) => setRosterFormData({ ...rosterFormData, role: e.target.value })}
                      className="w-full px-3 py-2 bg-[#FAF8F5] border border-slate-300 rounded-lg focus:outline-none focus:border-amber-500 cursor-pointer font-medium"
                    >
                      <option value="Thành viên">Thành viên</option>
                      <option value="Lớp trưởng">Lớp trưởng</option>
                      <option value="Lớp phó">Lớp phó</option>
                      <option value="Bí thư">Bí thư</option>
                      <option value="Thủ quỹ">Thủ quỹ</option>
                      <option value="Ban Liên Lạc (Admin)">Ban Liên Lạc (Admin)</option>
                      <option value="Thầy cô">Thầy cô giáo</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Giới tính:</label>
                    <div className="flex items-center gap-4 pt-1.5">
                      <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-700">
                        <input
                          type="radio"
                          name="rosterGender"
                          checked={rosterFormData.gender !== 'female'}
                          onChange={() => setRosterFormData({ ...rosterFormData, gender: 'male' })}
                          className="text-amber-600 focus:ring-amber-500"
                        />
                        <span>Nam</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-700">
                        <input
                          type="radio"
                          name="rosterGender"
                          checked={rosterFormData.gender === 'female'}
                          onChange={() => setRosterFormData({ ...rosterFormData, gender: 'female' })}
                          className="text-amber-600 focus:ring-amber-500"
                        />
                        <span>Nữ</span>
                      </label>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Size Áo Dự Kiến:</label>
                    <select
                      value={rosterFormData.shirtSize || 'L'}
                      onChange={(e) => setRosterFormData({ ...rosterFormData, shirtSize: e.target.value })}
                      className="w-full px-3 py-2 bg-[#FAF8F5] border border-slate-300 rounded-lg focus:outline-none focus:border-amber-500 cursor-pointer"
                    >
                      <option value="S">Size S (&lt; 50kg)</option>
                      <option value="M">Size M (50 - 58kg)</option>
                      <option value="L">Size L (59 - 68kg)</option>
                      <option value="XL">Size XL (69 - 78kg)</option>
                      <option value="2XL">Size 2XL (79 - 88kg)</option>
                      <option value="3XL">Size 3XL (&gt; 88kg)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Ghi chú (Nơi ở, công tác, ghi chú riêng):</label>
                  <textarea
                    rows={2}
                    value={rosterFormData.note || ''}
                    onChange={(e) => setRosterFormData({ ...rosterFormData, note: e.target.value })}
                    placeholder="VD: Đang ở Thái Nguyên, bay từ Sài Gòn..."
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-slate-300 rounded-lg focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setIsRosterModalOpen(false)}
                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-bold transition cursor-pointer"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white rounded-lg font-bold shadow-md transition cursor-pointer flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{editingRosterMember ? 'Lưu Thay Đổi Vào Sheet' : 'Thêm Vào Danh Bạ Sheet'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
      {/* MODAL: COMPREHENSIVE FUND RECONCILIATION & RECEIPT UPLOAD */}
      {/* =================================================================== */}
      <AnimatePresence>
        {adjustFundMember && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-2xl border border-amber-300 shadow-2xl w-full max-w-lg p-5 sm:p-6 space-y-4 text-xs my-auto"
            >
              {/* Header */}
              <div className="flex items-start justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                    {(adjustFundMember.fullName || 'K').slice(0, 1).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold font-serif text-slate-900">
                        {adjustFundMember.fullName}
                      </h3>
                      {adjustFundMember.status === 'yes' ? (
                        <span className="px-2 py-0.5 text-[10px] bg-emerald-100 text-emerald-800 rounded-full font-bold">
                          Tham gia
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 text-[10px] bg-slate-100 text-slate-600 rounded-full">
                          Vắng mặt
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 font-sans">
                      SĐT: <span className="font-mono font-semibold text-slate-700">{adjustFundMember.phone}</span>
                      {adjustFundMember.nickname && <span> • Biệt danh: “{adjustFundMember.nickname}”</span>}
                      {adjustFundMember.shirtSize && <span> • Size: {adjustFundMember.shirtSize}</span>}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setAdjustFundMember(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveAdjustFund} className="space-y-4">
                {/* 1. Số tiền đóng & Presets */}
                <div className="space-y-1.5 bg-[#FAF8F5] p-3.5 rounded-xl border border-amber-200/80">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                      <DollarSign className="w-4 h-4 text-emerald-600" />
                      <span>Số Tiền Thực Nộp (VNĐ):</span>
                    </label>
                    <span className="text-[11px] font-mono text-slate-500">Chuẩn: 500.000 đ</span>
                  </div>

                  <input
                    type="number"
                    step={50000}
                    value={fundAdjustAmount}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setFundAdjustAmount(val);
                      if (val > 0 && fundAdjustStatus === 'unpaid') setFundAdjustStatus('paid');
                    }}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg font-mono text-lg font-bold text-emerald-700 focus:outline-none focus:border-amber-500 shadow-2xs"
                  />

                  {/* Preset Buttons */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <button
                      type="button"
                      onClick={() => { setFundAdjustAmount(500000); setFundAdjustStatus('paid'); }}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition cursor-pointer ${
                        fundAdjustAmount === 500000 ? 'bg-emerald-600 text-white shadow-2xs' : 'bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-200'
                      }`}
                    >
                      500k Chuẩn
                    </button>
                    <button
                      type="button"
                      onClick={() => { setFundAdjustAmount(1000000); setFundAdjustStatus('paid'); }}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition cursor-pointer ${
                        fundAdjustAmount === 1000000 ? 'bg-amber-600 text-white shadow-2xs' : 'bg-white hover:bg-amber-50 text-amber-900 border border-amber-200'
                      }`}
                    >
                      1 Triệu
                    </button>
                    <button
                      type="button"
                      onClick={() => { setFundAdjustAmount(1500000); setFundAdjustStatus('paid'); }}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition cursor-pointer ${
                        fundAdjustAmount === 1500000 ? 'bg-amber-600 text-white shadow-2xs' : 'bg-white hover:bg-amber-50 text-amber-900 border border-amber-200'
                      }`}
                    >
                      1.5 Triệu
                    </button>
                    <button
                      type="button"
                      onClick={() => { setFundAdjustAmount(2000000); setFundAdjustStatus('paid'); }}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition cursor-pointer ${
                        fundAdjustAmount === 2000000 ? 'bg-amber-600 text-white shadow-2xs' : 'bg-white hover:bg-amber-50 text-amber-900 border border-amber-200'
                      }`}
                    >
                      2 Triệu
                    </button>
                    <button
                      type="button"
                      onClick={() => { setFundAdjustAmount(5000000); setFundAdjustStatus('paid'); }}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition cursor-pointer ${
                        fundAdjustAmount === 5000000 ? 'bg-amber-600 text-white shadow-2xs' : 'bg-white hover:bg-amber-50 text-amber-900 border border-amber-200'
                      }`}
                    >
                      5 Triệu
                    </button>
                    <button
                      type="button"
                      onClick={() => { setFundAdjustAmount(0); setFundAdjustStatus('unpaid'); }}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition cursor-pointer ${
                        fundAdjustAmount === 0 ? 'bg-slate-700 text-white' : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-300'
                      }`}
                    >
                      0đ (Chưa nộp)
                    </button>
                  </div>

                  {fundAdjustAmount > 500000 && (
                    <div className="p-2 bg-amber-100 text-amber-900 rounded-lg text-[11px] font-sans font-medium flex items-center gap-1.5 mt-2">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>
                        Ủng hộ thêm: <strong>{(fundAdjustAmount - 500000).toLocaleString('vi-VN')} đ</strong> vào quỹ chung K8A1!
                      </span>
                    </div>
                  )}
                </div>

                {/* 2. Trạng thái & Hình thức thanh toán */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 text-xs block">Trạng thái đối soát:</label>
                    <select
                      value={fundAdjustStatus}
                      onChange={(e) => setFundAdjustStatus(e.target.value as any)}
                      className="w-full px-3 py-2 bg-[#FAF8F5] border border-slate-300 rounded-lg text-xs font-sans focus:outline-none focus:border-amber-500 cursor-pointer"
                    >
                      <option value="paid">✅ Đã nộp đầy đủ</option>
                      <option value="pending">⏳ Chờ đối soát giao dịch</option>
                      <option value="unpaid">❌ Chưa nộp</option>
                      <option value="exempt">🛡️ Miễn đóng</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 text-xs block">Hình thức nộp tiền:</label>
                    <select
                      value={fundAdjustPaymentMethod}
                      onChange={(e) => setFundAdjustPaymentMethod(e.target.value as any)}
                      className="w-full px-3 py-2 bg-[#FAF8F5] border border-slate-300 rounded-lg text-xs font-sans focus:outline-none focus:border-amber-500 cursor-pointer"
                    >
                      <option value="bank_transfer">🏦 Chuyển khoản Ngân hàng (VCB, MB...)</option>
                      <option value="cash">💵 Tiền mặt tại bàn đón tiếp</option>
                      <option value="other">💳 Hình thức khác</option>
                    </select>
                  </div>
                </div>

                {/* 3. Thời gian nộp & Người đối soát */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 text-xs block">Thời gian nộp:</label>
                    <input
                      type="text"
                      value={fundAdjustPaidAt}
                      onChange={(e) => setFundAdjustPaidAt(e.target.value)}
                      placeholder="VD: 01/09/2026 09:30"
                      className="w-full px-3 py-2 bg-[#FAF8F5] border border-slate-300 rounded-lg font-mono text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 text-xs block">Người xác nhận đối soát:</label>
                    <input
                      type="text"
                      value={fundAdjustAuditedBy}
                      onChange={(e) => setFundAdjustAuditedBy(e.target.value)}
                      placeholder="VD: Thủ Quỹ BLL / Admin"
                      className="w-full px-3 py-2 bg-[#FAF8F5] border border-slate-300 rounded-lg text-xs font-sans focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                {/* 4. Ghi chú kế toán */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 text-xs block">Ghi chú giao dịch / Mã tham chiếu:</label>
                  <input
                    type="text"
                    value={fundAdjustNote}
                    onChange={(e) => setFundAdjustNote(e.target.value)}
                    placeholder="VD: Mã GD VCB-98124, bạn Hoàng nộp hộ, nộp tiền mặt..."
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-slate-300 rounded-lg text-xs font-sans focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* 5. Tải Lên & Đính Kèm Ảnh Chứng Từ / Bill (Tự tạo folder trên Drive) */}
                <div className="space-y-2 pt-2 border-t border-slate-200">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                      <Receipt className="w-4 h-4 text-blue-600" />
                      <span>Ảnh Chứng Từ / Bill / UNC Giao Dịch:</span>
                    </label>
                    <span className="text-[10px] text-slate-400">Tự lưu vào folder ChungTu_QuyLop_K8A1</span>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={fundAdjustReceiptUrl}
                      onChange={(e) => setFundAdjustReceiptUrl(e.target.value)}
                      placeholder="Dán link ảnh Google Drive hoặc URL chứng từ..."
                      className="flex-1 px-3 py-2 bg-[#FAF8F5] border border-slate-300 rounded-lg font-mono text-xs focus:outline-none focus:border-amber-500"
                    />

                    <label className={`inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg font-bold text-xs transition cursor-pointer whitespace-nowrap shadow-xs ${
                      isUploadingReceipt
                        ? 'bg-slate-400 text-white cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white'
                    }`}>
                      {isUploadingReceipt ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Đang tải lên Drive...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-3.5 h-3.5" />
                          <span>Tải Bill Từ Máy</span>
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        disabled={isUploadingReceipt}
                        onChange={handleReceiptFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {receiptUploadSuccessMsg && (
                    <p className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{receiptUploadSuccessMsg}</span>
                    </p>
                  )}

                  {receiptUploadErrorMsg && (
                    <p className="text-[11px] text-rose-600 font-semibold flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      <span>{receiptUploadErrorMsg}</span>
                    </p>
                  )}

                  {/* Thumbnail Preview if attached */}
                  {fundAdjustReceiptUrl && (
                    <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                      <div className="flex items-center gap-3">
                        <img
                          src={fundAdjustReceiptUrl}
                          alt="Chứng từ nộp tiền"
                          className="w-12 h-12 object-cover rounded-lg border border-slate-300 shadow-2xs"
                        />
                        <div className="space-y-0.5">
                          <span className="font-bold text-slate-800 text-xs block">
                            Đã đính kèm chứng từ
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono truncate max-w-[200px] block">
                            {fundAdjustReceiptUrl.startsWith('data:') ? 'Ảnh cục bộ (Base64)' : fundAdjustReceiptUrl}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setViewReceiptModal({
                            isOpen: true,
                            receiptUrl: fundAdjustReceiptUrl,
                            memberName: adjustFundMember.fullName,
                            amount: fundAdjustAmount,
                            paymentMethod: fundAdjustPaymentMethod,
                            paidAt: fundAdjustPaidAt,
                            note: fundAdjustNote,
                            phone: adjustFundMember.phone,
                            auditedBy: fundAdjustAuditedBy
                          })}
                          className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded text-[11px] font-bold transition cursor-pointer"
                        >
                          Xem Lớn
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setFundAdjustReceiptUrl('');
                            setReceiptUploadSuccessMsg('');
                          }}
                          className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded text-[11px] font-bold transition cursor-pointer"
                        >
                          Gỡ Ảnh
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setAdjustFundMember(null)}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer transition text-xs"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-xl shadow-md cursor-pointer transition text-xs"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Lưu Đối Soát & Đồng Bộ</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =================================================================== */}
      {/* MODAL: FULLSCREEN RECEIPT LIGHTBOX VIEWER */}
      {/* =================================================================== */}
      <AnimatePresence>
        {viewReceiptModal && viewReceiptModal.isOpen && (
          <div className="fixed inset-0 z-70 flex flex-col bg-black/95 backdrop-blur-md">
            {/* Top Toolbar */}
            <div className="flex items-center justify-between px-4 py-3 bg-black/60 border-b border-white/10 text-white z-10 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-xs">
                  🧾
                </div>
                <div>
                  <h3 className="text-sm font-bold font-serif text-amber-200 flex items-center gap-2">
                    <span>Chứng Từ: {viewReceiptModal.memberName}</span>
                    <span className="px-2 py-0.2 bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 rounded text-[11px] font-mono font-bold">
                      {viewReceiptModal.amount.toLocaleString('vi-VN')} đ
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    SĐT: {viewReceiptModal.phone || 'N/A'} • {viewReceiptModal.paymentMethod === 'cash' ? 'Tiền mặt' : 'Chuyển khoản'} • {viewReceiptModal.paidAt || 'Đã xác nhận'}
                  </p>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setLightboxZoom(prev => Math.min(prev + 0.25, 2.5))}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition cursor-pointer"
                  title="Phóng to"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setLightboxZoom(prev => Math.max(prev - 0.25, 0.75))}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition cursor-pointer"
                  title="Thu nhỏ"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setLightboxZoom(1)}
                  className="px-2.5 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-[11px] font-bold text-white transition cursor-pointer"
                  title="Đặt lại kích thước 100%"
                >
                  100%
                </button>

                {viewReceiptModal.receiptUrl.startsWith('http') && (
                  <a
                    href={viewReceiptModal.receiptUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-amber-300 transition"
                    title="Mở ảnh gốc trong tab mới"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setViewReceiptModal(null);
                    setLightboxZoom(1);
                  }}
                  className="p-2 bg-rose-600/80 hover:bg-rose-600 rounded-lg text-white transition cursor-pointer ml-2"
                  title="Đóng xem ảnh (Esc)"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Center Image Viewport */}
            <div className="flex-1 overflow-auto flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: lightboxZoom }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                className="max-w-4xl max-h-[75vh] flex items-center justify-center"
              >
                <img
                  src={viewReceiptModal.receiptUrl}
                  alt={`Chứng từ ${viewReceiptModal.memberName}`}
                  className="max-w-full max-h-[75vh] object-contain rounded-xl shadow-2xl border border-white/20"
                />
              </motion.div>
            </div>

            {/* Bottom Info & Quick Audit Action Footer */}
            <div className="px-5 py-3.5 bg-black/85 border-t border-white/10 text-xs text-slate-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shrink-0">
              <div className="space-y-1 max-w-md">
                <p className="text-white text-xs">
                  <strong className="text-amber-200">Ghi chú giao dịch:</strong> {viewReceiptModal.note || 'Biên lai giao dịch chuyển khoản'}
                </p>
                {viewReceiptModal.status === 'paid' ? (
                  <p className="text-emerald-300 text-[11px] flex items-center gap-1 font-sans">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Đã đối soát khớp lệnh bởi <strong>{viewReceiptModal.auditedBy || 'Ban Liên Lạc'}</strong> ({viewReceiptModal.paidAt || 'Vừa xong'})</span>
                  </p>
                ) : (
                  <p className="text-amber-300 text-[11px] flex items-center gap-1 font-sans animate-pulse">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Trạng thái: <strong>Chờ Ban Liên Lạc đối soát & duyệt quỹ</strong></span>
                  </p>
                )}
              </div>

              {/* BLL Quick Action Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                {viewReceiptModal.status !== 'paid' ? (
                  <>
                    <button
                      type="button"
                      onClick={handleApproveFundFromModal}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-600 text-white font-sans font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg transition cursor-pointer hover:scale-105 active:scale-95"
                    >
                      <Check className="w-4 h-4" />
                      <span>✅ Duyệt Khớp Lệnh (500.000đ)</span>
                    </button>

                    {viewReceiptModal.attendee && (
                      <button
                        type="button"
                        onClick={() => {
                          const att = viewReceiptModal.attendee!;
                          setViewReceiptModal(null);
                          handleOpenAdjustFund(att);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/20 text-amber-200 border border-amber-400/40 rounded-xl font-sans font-bold text-xs transition cursor-pointer"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Sửa Số Tiền / Ghi Chú</span>
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 rounded-xl text-xs font-bold font-sans">
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                      <span>Đã Duyệt ({viewReceiptModal.amount.toLocaleString('vi-VN')} đ)</span>
                    </span>

                    {viewReceiptModal.attendee && (
                      <button
                        type="button"
                        onClick={() => {
                          const att = viewReceiptModal.attendee!;
                          setViewReceiptModal(null);
                          handleOpenAdjustFund(att);
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-slate-200 border border-white/20 rounded-xl font-sans text-xs transition cursor-pointer"
                      >
                        <Edit className="w-3 h-3 text-slate-300" />
                        <span>Sửa Lại</span>
                      </button>
                    )}
                  </>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setViewReceiptModal(null);
                    setLightboxZoom(1);
                  }}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-sans text-xs font-medium transition cursor-pointer"
                >
                  Đóng
                </button>
              </div>
            </div>
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
