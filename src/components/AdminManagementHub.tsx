import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
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
  Edit3,
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
  HelpCircle,
  Info,
  Navigation,
  Heart,
  Utensils,
  Coins,
  Wallet,
  TrendingUp,
  TrendingDown,
  Scale,
  Maximize2,
  Landmark,
  QrCode,
  ShieldCheck,
  Loader2,
  GraduationCap,
  Car,
  HeartHandshake,
  PhoneCall,
  Tv,
  Music,
  Disc,
  Volume2,
  VolumeX,
  Trash2,
  ArrowUp,
  ArrowDown,
  Layers,
  PlaySquare
} from 'lucide-react';
import { UserRole, RsvpData, WishData, MemoryImage, MemoryVideo, VenueMediaItem, EventConfig, ClassMember, ExpenseItem, ExpenseCategory, IncomeItem, IncomeCategory, TeacherData, TeacherInvitationStatus, BackdropItem, MusicTrack, StageSettings, StagePresentationScene } from '../types';
import { 
  K8A1_DRIVE_FOLDER_ID, 
  K8A1_DRIVE_FOLDER_URL, 
  DEFAULT_EVENT_CONFIG, 
  DEFAULT_BACKDROPS,
  DEFAULT_PLAYLIST,
  DEFAULT_STAGE_SETTINGS,
  uploadBackdropViaBackend,
  fetchDriveBackdrops,
  VIETNAM_BANKS, 
  resolveBankCode, 
  generateVietQrUrl, 
  sanitizeVietQrText, 
  GOOGLE_APPS_SCRIPT_CODE,
  CLASS_ROSTER_K8A1,
  TEACHERS_LIST,
  TEACHER_SUBJECT_OPTIONS,
  TEACHER_ROLE_OPTIONS,
  TEACHER_TRANSPORTATION_OPTIONS,
  TEACHER_HEALTH_OPTIONS,
  normalizeImageUrl,
  SHIRT_SIZE_OPTIONS,
  normalizeShirtSize,
  formatDateTimeVi,
  formatDateOnlyVi,
  parseDate,
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  IncomeCategoryMeta,
  updatePinsViaBackend,
  initSecuritySheetViaBackend,
  isOfficialBLLMember,
  extractPhones,
  isPhoneMatch,
  isVietnameseNameMatch
} from '../data';
import { DEFAULT_VENUE_MEDIA, parseVenueMedia } from './AlumniConvergenceMap';
import PinAuthModal from './PinAuthModal';

/**
 * Nén ảnh bằng Canvas HTML5 trước khi lưu trữ hoặc đẩy lên Google Drive / Sheet:
 * Giới hạn chiều rộng tối đa 1600px, chất lượng JPEG 0.82.
 * Giảm kích thước ảnh từ 5-10MB xuống chỉ còn ~80-120KB,
 * giải quyết triệt để lỗi QuotaExceededError của localStorage và lỗi ô 50,000 ký tự của Google Sheets.
 */
export async function compressImageToJpeg(file: File, maxWidth = 1600, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

// Lấy mã PIN quản trị đã xác thực từ session để ký các lệnh ghi nhạy cảm
const getAdminPinToken = (): string => {
  try {
    return sessionStorage.getItem('admin_pin_token') || '';
  } catch {
    return '';
  }
};

interface AdminManagementHubProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserRole: UserRole;
  onLoginSuccess: (role: UserRole) => void;
  onLogout: () => void;
  initialTab?: 'members' | 'fund' | 'teachers' | 'wishes' | 'media' | 'settings' | 'presentation';
  initialMediaSubTab?: 'venue' | 'banner' | 'videos' | 'photos';
  onOpenStagePresentation?: () => void;
  
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
  activeMember?: ClassMember | null;

  // Quản lý Sổ Chi Tiêu Quỹ Lớp (Khoan_Chi)
  expenses?: ExpenseItem[];
  onAddExpense?: (item: ExpenseItem) => void;
  onUpdateExpense?: (item: ExpenseItem) => void;
  onDeleteExpense?: (id: string) => void;
  onSaveAllExpenses?: (list: ExpenseItem[]) => void;

  // Quản lý Sổ Thu Quỹ Lớp (Khoan_Thu - Đa Dạng Danh Mục)
  incomes?: IncomeItem[];
  onAddIncome?: (item: IncomeItem) => void;
  onUpdateIncome?: (item: IncomeItem) => void;
  onDeleteIncome?: (id: string) => void;
  onSaveAllIncomes?: (list: IncomeItem[]) => void;

  // Quản lý Quý Thầy Cô giáo K8A1 (Thay_Co_K8A1)
  teachersList?: TeacherData[];
  onAddTeacher?: (teacher: TeacherData) => void;
  onUpdateTeacher?: (teacher: TeacherData) => void;
  onDeleteTeacher?: (id: string) => void;
  onSaveAllTeachers?: (list: TeacherData[]) => void;

  // Cẩm Nang Hướng Dẫn Vận Hành & Nghiệp Vụ
  onOpenGuideModal?: () => void;
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
  heroBannerUrl = '',
  heroBannerPosition = 50,
  onUpdateHeroBannerUrl,
  eventConfig,
  onUpdateEventConfig,
  appsScriptUrl,
  onSaveAppsScriptUrl,
  onRefreshData,
  onOpenPassModal,
  activeMember,
  expenses = [],
  onAddExpense,
  onUpdateExpense,
  onDeleteExpense,
  onSaveAllExpenses,
  incomes = [],
  onAddIncome,
  onUpdateIncome,
  onDeleteIncome,
  onSaveAllIncomes,
  teachersList = [],
  onAddTeacher,
  onUpdateTeacher,
  onDeleteTeacher,
  onSaveAllTeachers,
  onOpenGuideModal,
  onOpenStagePresentation
}: AdminManagementHubProps) {
  // User Role Helpers (RBAC)
  const isAdmin = currentUserRole === 'admin';
  const isTreasurer = currentUserRole === 'treasurer';
  const isBll = currentUserRole === 'bll';
  const isAuthorized = isAdmin || isTreasurer || isBll;
  const canAuditAndSpend = isTreasurer || isAdmin; // Chỉ Thủ Quỹ hoặc Admin mới có quyền đối soát và nhập liệu chi

  // Helper tính tên người đối soát tự động theo vai trò và danh tính chính thức
  const getDefaultAuditorName = useCallback(() => {
    // Chỉ cho phép gắn tên cá nhân nếu thành viên này thực sự thuộc Ban Liên Lạc / Ban Tổ Chức
    const isBllOfficer = isOfficialBLLMember(activeMember);

    if (isTreasurer) {
      if (isBllOfficer && activeMember?.role?.toLowerCase().includes('thủ quỹ')) {
        return `Thủ Quỹ ${activeMember.fullName}`;
      }
      return 'Thủ Quỹ BLL';
    }

    if (isAdmin) {
      if (isBllOfficer && activeMember?.fullName) {
        return `Admin (${activeMember.fullName})`;
      }
      return 'Trưởng Ban (Admin)';
    }

    if (isBllOfficer && activeMember?.fullName) {
      return `${activeMember.fullName} (BLL)`;
    }
    return 'Ban Liên Lạc K8A1';
  }, [isTreasurer, isAdmin, activeMember]);

  // Navigation tabs
  type ActiveTab = 'members' | 'fund' | 'teachers' | 'wishes' | 'media' | 'settings' | 'presentation';
  const [activeTab, setActiveTab] = useState<ActiveTab>(initialTab || 'members');

  // Media Tab subtab state
  const [mediaSubTab, setMediaSubTab] = useState<'banner' | 'videos' | 'photos'>((initialMediaSubTab === 'venue' || !initialMediaSubTab ? 'banner' : initialMediaSubTab) as any);

  // Stage Presentation & LED Backdrop States
  const [presentationSubTab, setPresentationSubTab] = useState<'backdrop' | 'music' | 'settings'>('backdrop');
  const [stageBackdrops, setStageBackdrops] = useState<BackdropItem[]>(() => {
    return (eventConfig && eventConfig.backdrops && eventConfig.backdrops.length > 0)
      ? eventConfig.backdrops
      : DEFAULT_BACKDROPS;
  });
  const [stagePlaylist, setStagePlaylist] = useState<MusicTrack[]>(() => {
    return (eventConfig && eventConfig.musicPlaylist && eventConfig.musicPlaylist.length > 0)
      ? eventConfig.musicPlaylist
      : DEFAULT_PLAYLIST;
  });
  const [stageSettingsState, setStageSettingsState] = useState<StageSettings>(() => {
    return (eventConfig && eventConfig.stageSettings)
      ? eventConfig.stageSettings
      : DEFAULT_STAGE_SETTINGS;
  });
  const [newBackdropTitle, setNewBackdropTitle] = useState('');
  const [newBackdropUrl, setNewBackdropUrl] = useState('');
  const [isUploadingBackdrop, setIsUploadingBackdrop] = useState(false);
  const [newTrackTitle, setNewTrackTitle] = useState('');
  const [newTrackArtist, setNewTrackArtist] = useState('');
  const [newTrackUrl, setNewTrackUrl] = useState('');
  const [isSavingPresentation, setIsSavingPresentation] = useState(false);
  const [presentationSuccessMsg, setPresentationSuccessMsg] = useState('');
  const [viewingBackdropPreview, setViewingBackdropPreview] = useState<string | null>(null);

  // Auto-switch to initialTab and initialMediaSubTab when hub is opened
  useEffect(() => {
    if (isOpen) {
      if (initialTab) setActiveTab(initialTab);
      if (initialMediaSubTab && (initialMediaSubTab as string) !== 'venue') setMediaSubTab(initialMediaSubTab as any);
    }
  }, [isOpen, initialTab, initialMediaSubTab]);

  // Đồng bộ cấu hình trình chiếu khi eventConfig từ cha thay đổi
  useEffect(() => {
    if (eventConfig) {
      if (eventConfig.backdrops && eventConfig.backdrops.length > 0) {
        setStageBackdrops(eventConfig.backdrops);
      }
      if (eventConfig.musicPlaylist && eventConfig.musicPlaylist.length > 0) {
        setStagePlaylist(eventConfig.musicPlaylist);
      }
      if (eventConfig.stageSettings) {
        setStageSettingsState(eventConfig.stageSettings);
      }
    }
  }, [eventConfig]);

  // Settings form states (Bảo mật qua Google Sheets & Google Apps Script Backend)
  const [currentAdminPinConfirm, setCurrentAdminPinConfirm] = useState('');
  const [newAdminPin, setNewAdminPin] = useState('');
  const [newTreasurerPin, setNewTreasurerPin] = useState('');
  const [newBllPin, setNewBllPin] = useState('');
  const [isUpdatingPins, setIsUpdatingPins] = useState(false);
  const [scriptUrlInput, setScriptUrlInput] = useState(appsScriptUrl);
  const [copiedScriptCode, setCopiedScriptCode] = useState(false);
  const [showScriptCodeModal, setShowScriptCodeModal] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [isCheckingSecuritySheet, setIsCheckingSecuritySheet] = useState(false);
  const [connectionTestResult, setConnectionTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isCleaningDuplicates, setIsCleaningDuplicates] = useState(false);
  const [bannerInput, setBannerInput] = useState(heroBannerUrl);
  const [bannerPositionY, setBannerPositionY] = useState<number>(heroBannerPosition ?? 50);
  const [isDraggingBanner, setIsDraggingBanner] = useState(false);
  const [dragStartY, setDragStartY] = useState(0);
  const [dragStartPos, setDragStartPos] = useState(50);
  const bannerPreviewRef = React.useRef<HTMLDivElement>(null);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isUploadingVenuePhoto, setIsUploadingVenuePhoto] = useState(false);
  const [isUploadingCustomQr, setIsUploadingCustomQr] = useState(false);
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

  // Chuẩn hóa số tiền đóng quỹ sự kiện K8A1 động theo cấu hình (mặc định 700.000đ)
  const standardFundAmount = Number(eventConfigForm?.fundAmountPerPerson) || 700000;

  const [settingsSection, setSettingsSection] = useState<'all' | 'venue' | 'date' | 'letter' | 'bank' | 'security'>('all');
  const [venueSettingsTab, setVenueSettingsTab] = useState<'stage1' | 'stage2' | 'route'>('stage1');

  // Search & Filters for Member Tab
  const rosterList = classRoster && classRoster.length > 0 ? classRoster : CLASS_ROSTER_K8A1;
  const [memberTabSubView, setMemberTabSubView] = useState<'roster' | 'rsvp'>('roster');
  const [memberSearch, setMemberSearch] = useState('');
  const [memberStatusFilter, setMemberStatusFilter] = useState<'all' | 'yes' | 'no' | 'checkedIn' | 'notCheckedIn'>('all');
  const [memberShirtFilter, setMemberShirtFilter] = useState<string>('all');
  const [rosterStatusFilter, setRosterStatusFilter] = useState<'all' | 'confirmed' | 'declined' | 'pending'>('all');

  // Helper chuẩn hóa so khớp danh bạ
  // Helper chuẩn hóa so khớp danh bạ
  const normPhoneRoster = (p?: any) => {
    const phones = extractPhones(p);
    return phones[0] || '';
  };

  const normNameRoster = (n?: any) => {
    if (n === null || n === undefined) return '';
    return String(n).trim().toLowerCase().replace(/\s+/g, ' ');
  };

  // Đếm số lượng thành viên cùng họ tên trong danh bạ để nhận diện các bạn trùng tên
  const rosterNameCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    rosterList.forEach((m) => {
      const n = normNameRoster(m.fullName);
      if (n) counts[n] = (counts[n] || 0) + 1;
    });
    return counts;
  }, [rosterList]);

  // Đồng bộ mỗi thành viên trong danh bạ với dữ liệu RSVP thực tế (bảo toàn 1-1, không gộp nhầm người trùng tên)
  const enrichedRoster = useMemo(() => {
    const claimedRsvpKeys = new Set<string>();

    const getRsvpKey = (r: RsvpData, index: number) => {
      if (r.id) return `id_${r.id}`;
      if (r.memberId) return `mid_${r.memberId}`;
      const ph = extractPhones(r.phone)[0] || '';
      return `p_${ph}_n_${normNameRoster(r.fullName)}_idx_${index}`;
    };

    return rosterList.map((m, idx) => {
      const mN = normNameRoster(m.fullName);
      const isDupName = mN ? (rosterNameCounts[mN] || 0) > 1 : false;

      let matchedIndex = -1;
      const matchedRsvp = rsvpList.find((r, rIdx) => {
        if (!r) return false;
        const rKey = getRsvpKey(r, rIdx);
        if (claimedRsvpKeys.has(rKey)) return false;

        // 1. Ưu tiên khớp chính xác theo memberId
        if (m.id && r.memberId) {
          if (m.id === r.memberId) {
            matchedIndex = rIdx;
            return true;
          }
          return false; // Khác memberId => chắc chắn không phải bạn này dù trùng tên
        }

        // 2. So khớp theo họ tên chuẩn
        const rN = normNameRoster(r.fullName);
        if (mN && rN && mN === rN) {
          if (isDupName) {
            return false;
          }
          matchedIndex = rIdx;
          return true;
        }

        // 3. So khớp số điện thoại (hỗ trợ nhiều số, định dạng linh hoạt, chuyển đổi 11 số sang 10 số)
        if (isPhoneMatch(m.phone, r.phone)) {
          matchedIndex = rIdx;
          return true;
        }

        // 4. So khớp thông minh theo tên tiếng Việt (nếu tên là duy nhất trong danh bạ)
        if (!isDupName && isVietnameseNameMatch(m, r.fullName)) {
          matchedIndex = rIdx;
          return true;
        }

        return false;
      });

      let rosterStatus: 'confirmed' | 'declined' | 'pending' = 'pending';
      if (matchedRsvp && matchedIndex >= 0) {
        const rKey = getRsvpKey(matchedRsvp, matchedIndex);
        claimedRsvpKeys.add(rKey);
        rosterStatus = matchedRsvp.status === 'yes' ? 'confirmed' : 'declined';
        if (!matchedRsvp.memberId && m.id) {
          matchedRsvp.memberId = m.id;
        }
      }

      return {
        ...m,
        index: idx + 1,
        matchedRsvp,
        rosterStatus
      };
    });
  }, [rosterList, rsvpList, rosterNameCounts]);

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
        shirtSize: m.shirtSize ? normalizeShirtSize(m.shirtSize) : '',
        message: 'Ban Liên Lạc ghi nhận thông tin tham dự',
        fundStatus: 'unpaid',
        fundAmount: standardFundAmount,
        fundNote: ''
      });
      setIsAddMemberModalOpen(true);
    }
  };

  // Search & Filters for Fund Reconciliation Tab
  const [fundSearch, setFundSearch] = useState('');
  const [fundStatusFilter, setFundStatusFilter] = useState<'all' | 'paid' | 'unpaid' | 'pending' | 'extra' | 'has_receipt' | 'no_receipt' | 'bank_transfer' | 'cash' | 'absent'>('all');
  const [fundDateFilter, setFundDateFilter] = useState<'all' | 'today' | '7days' | 'this_month' | 'year_2026' | 'custom'>('all');
  const [fundCustomStartDate, setFundCustomStartDate] = useState('');
  const [fundCustomEndDate, setFundCustomEndDate] = useState('');

  // Modals for CRUD operations
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<RsvpData | null>(null);
  const [memberFormData, setMemberFormData] = useState<Partial<RsvpData>>({
    fullName: '',
    nickname: '',
    phone: '',
    className: 'K8A1',
    status: 'yes',
    shirtSize: '',
    message: '',
    fundStatus: 'unpaid',
    fundAmount: standardFundAmount,
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
    shirtSize: '',
    note: ''
  });
  const [isRosterSyncing, setIsRosterSyncing] = useState(false);
  const [rosterFeedbackMsg, setRosterFeedbackMsg] = useState('');

  // Comprehensive Fund Reconciliation & Proof Modal States
  const [adjustFundMember, setAdjustFundMember] = useState<RsvpData | null>(null);
  const [fundAdjustAmount, setFundAdjustAmount] = useState<number>(standardFundAmount);
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

  // ---------------------------------------------------------------------------
  // SỔ QUỸ THU - CHI LỚP K8A1 STATE (CHUẨN QUY CHẾ ĐIỀU 3 & 4)
  // ---------------------------------------------------------------------------
  const [fundSubTab, setFundSubTab] = useState<'income' | 'expense'>('income');
  const [expenseSearch, setExpenseSearch] = useState('');
  const [expenseCategoryFilter, setExpenseCategoryFilter] = useState<string>('all');
  const [expenseDateFilter, setExpenseDateFilter] = useState<'all' | 'today' | '7days' | 'this_month' | 'year_2026' | 'custom'>('all');
  const [expenseCustomStartDate, setExpenseCustomStartDate] = useState('');
  const [expenseCustomEndDate, setExpenseCustomEndDate] = useState('');

  // Helper lọc thời gian cho cả 2 phân hệ Thu Quỹ và Chi Tiêu Quỹ
  const isDateInFilter = useCallback((dateStr: string | undefined, filterType: 'all' | 'today' | '7days' | 'this_month' | 'year_2026' | 'custom', customStart?: string, customEnd?: string): boolean => {
    if (filterType === 'all') return true;
    if (!dateStr || !String(dateStr).trim()) return false;

    const itemDate = parseDate(dateStr);
    if (!itemDate || isNaN(itemDate.getTime())) return false;

    const now = new Date();
    const itemDay = new Date(itemDate.getFullYear(), itemDate.getMonth(), itemDate.getDate()).getTime();
    const todayDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

    if (filterType === 'today') {
      return itemDay === todayDay;
    }

    if (filterType === '7days') {
      const sevenDaysAgo = todayDay - 7 * 24 * 60 * 60 * 1000;
      return itemDay >= sevenDaysAgo && itemDay <= todayDay + 24 * 60 * 60 * 1000;
    }

    if (filterType === 'this_month') {
      return itemDate.getMonth() === now.getMonth() && itemDate.getFullYear() === now.getFullYear();
    }

    if (filterType === 'year_2026') {
      return itemDate.getFullYear() === 2026;
    }

    if (filterType === 'custom') {
      if (customStart && customStart.trim()) {
        const start = new Date(customStart);
        if (!isNaN(start.getTime())) {
          const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime();
          if (itemDay < startDay) return false;
        }
      }
      if (customEnd && customEnd.trim()) {
        const end = new Date(customEnd);
        if (!isNaN(end.getTime())) {
          const endDay = new Date(end.getFullYear(), end.getMonth(), end.getDate()).getTime();
          if (itemDay > endDay) return false;
        }
      }
      return true;
    }

    return true;
  }, []);
  // ---------------------------------------------------------------------------
  // QUẢN LÝ QUÝ THẦY CÔ GIÁO K8A1 STATE (SHEET: "Thay_Co_K8A1")
  // ---------------------------------------------------------------------------
  const effectiveTeachers = useMemo(() => {
    return Array.isArray(teachersList) ? teachersList : [];
  }, [teachersList]);

  const [teacherSearch, setTeacherSearch] = useState('');
  const [teacherStatusFilter, setTeacherStatusFilter] = useState<string>('all');
  const [teacherRoleFilter, setTeacherRoleFilter] = useState<string>('all');
  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<TeacherData | null>(null);
  const [teacherFormData, setTeacherFormData] = useState<Partial<TeacherData>>({
    name: '',
    gender: 'Cô',
    birthYear: '',
    phone: '',
    relativePhone: '',
    address: '',
    subject: '',
    role: 'Giáo viên Bộ môn',
    workStatus: 'Đã nghỉ hưu',
    inviteProgress: 'Chưa gửi',
    status: 'pending',
    companion: 'Đi một mình',
    transportation: 'Tự túc',
    coordinator: '',
    healthNotes: '',
    avatarUrl: '',
    quote: ''
  });
  const [isUploadingTeacherAvatar, setIsUploadingTeacherAvatar] = useState(false);
  const [isSyncingTeachers, setIsSyncingTeachers] = useState(false);

  const handleOpenAddTeacher = () => {
    setEditingTeacher(null);
    setTeacherFormData({
      name: '',
      gender: 'Cô',
      birthYear: '',
      phone: '',
      relativePhone: '',
      address: '',
      subject: '',
      role: 'Giáo viên Bộ môn',
      workStatus: 'Đã nghỉ hưu',
      inviteProgress: 'Chưa gửi',
      status: 'pending',
      companion: 'Đi một mình',
      transportation: 'Tự túc',
      coordinator: (isOfficialBLLMember(activeMember) && activeMember?.fullName) ? activeMember.fullName : '',
      healthNotes: '',
      avatarUrl: '',
      quote: ''
    });
    setIsTeacherModalOpen(true);
  };

  const handleOpenEditTeacher = (t: TeacherData) => {
    setEditingTeacher(t);
    setTeacherFormData({ ...t });
    setIsTeacherModalOpen(true);
  };

  const handleSaveTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = String(teacherFormData.name || '').trim();
    if (!cleanName) {
      alert('Vui lòng nhập họ tên Thầy / Cô!');
      return;
    }

    const nowStr = new Date().toLocaleDateString('vi-VN') + ' ' + new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    const teacherToSave: TeacherData = {
      id: editingTeacher?.id || ('tc' + (Date.now() % 10000)),
      name: cleanName,
      gender: (teacherFormData.gender as 'Thầy' | 'Cô') || 'Cô',
      birthYear: String(teacherFormData.birthYear || '').trim(),
      phone: String(teacherFormData.phone || '').trim(),
      relativePhone: String(teacherFormData.relativePhone || '').trim(),
      address: String(teacherFormData.address || '').trim(),
      subject: String(teacherFormData.subject || '').trim(),
      role: String(teacherFormData.role || 'Giáo viên Bộ môn').trim(),
      workStatus: String(teacherFormData.workStatus || 'Đã nghỉ hưu').trim(),
      inviteProgress: String(teacherFormData.inviteProgress || 'Chưa gửi').trim(),
      status: (teacherFormData.status || 'pending') as TeacherInvitationStatus,
      companion: String(teacherFormData.companion || 'Đi một mình').trim(),
      transportation: String(teacherFormData.transportation || 'Tự túc').trim(),
      coordinator: String(teacherFormData.coordinator || '').trim(),
      healthNotes: String(teacherFormData.healthNotes || '').trim(),
      avatarUrl: String(teacherFormData.avatarUrl || '').trim(),
      quote: String(teacherFormData.quote || '').trim(),
      updatedAt: nowStr
    };

    if (editingTeacher) {
      if (onUpdateTeacher) {
        onUpdateTeacher(teacherToSave);
      } else if (onSaveAllTeachers) {
        onSaveAllTeachers(effectiveTeachers.map(t => t.id === teacherToSave.id ? teacherToSave : t));
      }
    } else {
      if (onAddTeacher) {
        onAddTeacher(teacherToSave);
      } else if (onSaveAllTeachers) {
        onSaveAllTeachers([...effectiveTeachers, teacherToSave]);
      }
    }

    setIsTeacherModalOpen(false);
    setEditingTeacher(null);
  };

  const handleDeleteTeacherItem = (t: TeacherData) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa "${t.name}" khỏi danh sách Thầy Cô không?`)) {
      return;
    }
    if (onDeleteTeacher) {
      onDeleteTeacher(t.id);
    } else if (onSaveAllTeachers) {
      onSaveAllTeachers(effectiveTeachers.filter(x => x.id !== t.id));
    }
  };

  const handleTeacherAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingTeacherAvatar(true);
    try {
      const base64Jpeg = await compressImageToJpeg(file, 800, 0.82);
      const targetUrl = appsScriptUrl || localStorage.getItem('apps_script_url') || '';
      if (targetUrl && targetUrl.trim()) {
        try {
          const payload = {
            action: 'upload_teacher_avatar',
            fileData: base64Jpeg,
            mimeType: 'image/jpeg',
            name: teacherFormData.name || 'ThayCo'
          };
          const res = await fetch(targetUrl, {
            method: 'POST',
            body: JSON.stringify(payload)
          });
          const json = await res.json();
          if (json.status === 'success' && json.url) {
            setTeacherFormData(prev => ({ ...prev, avatarUrl: json.url }));
            setIsUploadingTeacherAvatar(false);
            return;
          }
        } catch (fetchErr) {
          console.warn('Lỗi tải ảnh thầy cô lên Drive, lưu base64:', fetchErr);
        }
      }
      setTeacherFormData(prev => ({ ...prev, avatarUrl: base64Jpeg }));
    } catch (err) {
      console.warn('Lỗi nén ảnh chân dung:', err);
      alert('Không thể đọc file ảnh, vui lòng thử lại!');
    } finally {
      setIsUploadingTeacherAvatar(false);
    }
  };

  const handleSyncTeachersFromSheet = async () => {
    const target = (scriptUrlInput || appsScriptUrl || '').trim();
    if (!target || !target.startsWith('http')) {
      alert('Vui lòng kiểm tra URL Google Apps Script trong tab Cấu Hình!');
      return;
    }
    setIsSyncingTeachers(true);
    try {
      const adminPin = getAdminPinToken();
      const pinQuery = adminPin ? `&pin=${encodeURIComponent(adminPin)}` : '';
      const res = await fetch(`${target}?action=get_teachers${pinQuery}&t=${Date.now()}`);
      const json = await res.json();
      if (json && json.status === 'success' && Array.isArray(json.data)) {
        if (onSaveAllTeachers) {
          onSaveAllTeachers(json.data);
        }
        alert(`Đã tải về danh sách ${json.data.length} Thầy Cô thành công!`);
      } else {
        alert(json.message || 'Không thể đồng bộ danh sách Thầy Cô lúc này.');
      }
    } catch (err: any) {
      alert('Lỗi kết nối khi đồng bộ Thầy Cô: ' + (err.message || 'Vui lòng thử lại'));
    } finally {
      setIsSyncingTeachers(false);
    }
  };

  // Lọc danh sách thầy cô trong bảng admin
  const filteredAdminTeachers = useMemo(() => {
    const q = teacherSearch.toLowerCase().trim();
    return effectiveTeachers.filter(t => {
      const matchQ = !q ||
        t.name.toLowerCase().includes(q) ||
        (t.subject && t.subject.toLowerCase().includes(q)) ||
        (t.role && t.role.toLowerCase().includes(q)) ||
        (t.phone && t.phone.includes(q)) ||
        (t.coordinator && t.coordinator.toLowerCase().includes(q)) ||
        (t.address && t.address.toLowerCase().includes(q));

      const matchStatus = teacherStatusFilter === 'all' || t.status === teacherStatusFilter;
      const matchRole = teacherRoleFilter === 'all' || 
        (teacherRoleFilter === 'homeroom' && t.role?.toLowerCase().includes('chủ nhiệm')) ||
        (teacherRoleFilter === 'subject' && !t.role?.toLowerCase().includes('chủ nhiệm'));

      return matchQ && matchStatus && matchRole;
    });
  }, [effectiveTeachers, teacherSearch, teacherStatusFilter, teacherRoleFilter]);

  // Thống kê thầy cô
  const teacherStats = useMemo(() => {
    const total = effectiveTeachers.length;
    const attending = effectiveTeachers.filter(t => t.status === 'attending').length;
    const wishing = effectiveTeachers.filter(t => t.status === 'wishing').length;
    const pending = effectiveTeachers.filter(t => !t.status || t.status === 'pending').length;
    const needCar = effectiveTeachers.filter(t => t.transportation && t.transportation.includes('đón')).length;
    const invitedHand = effectiveTeachers.filter(t => t.inviteProgress && t.inviteProgress.includes('tận tay')).length;
    return { total, attending, wishing, pending, needCar, invitedHand };
  }, [effectiveTeachers]);

  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<ExpenseItem | null>(null);
  const [expenseFormData, setExpenseFormData] = useState<Partial<ExpenseItem>>({
    title: '',
    category: 'party',
    amount: 500000,
    date: new Date().toLocaleDateString('vi-VN'),
    spender: '',
    recipient: '',
    receiptUrl: '',
    eventScope: 'Kỷ niệm 20 năm',
    note: ''
  });
  const [expenseAmountFormatted, setExpenseAmountFormatted] = useState<string>('500.000');
  const [isUploadingExpenseReceipt, setIsUploadingExpenseReceipt] = useState<boolean>(false);
  const [viewingExpenseReceipt, setViewingExpenseReceipt] = useState<{ url: string; title: string } | null>(null);

  // ---------------------------------------------------------------------------
  // SỔ THU QUỸ LỚP K8A1 STATE (KHOAN_THU - ĐA DẠNG DANH MỤC THU)
  // ---------------------------------------------------------------------------
  const effectiveIncomes = useMemo(() => {
    return Array.isArray(incomes) ? incomes : [];
  }, [incomes]);

  const [fundIncomeViewMode, setFundIncomeViewMode] = useState<'rsvp_members' | 'income_ledger'>('rsvp_members');
  const [incomeCategoryFilter, setIncomeCategoryFilter] = useState<string>('all');
  const [incomeSearch, setIncomeSearch] = useState('');
  const [incomeDateFilter, setIncomeDateFilter] = useState<'all' | 'today' | '7days' | 'this_month' | 'year_2026' | 'custom'>('all');
  const [incomeCustomStartDate, setIncomeCustomStartDate] = useState('');
  const [incomeCustomEndDate, setIncomeCustomEndDate] = useState('');

  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState<IncomeItem | null>(null);
  const [incomeFormData, setIncomeFormData] = useState<Partial<IncomeItem>>({
    title: '',
    category: 'event',
    amount: standardFundAmount,
    date: new Date().toLocaleDateString('vi-VN'),
    payerName: '',
    payerPhone: '',
    memberId: undefined,
    paymentMethod: 'bank_transfer',
    auditor: '',
    receiptUrl: '',
    eventScope: 'Kỷ niệm 20 năm',
    note: ''
  });
  const [incomeAmountFormatted, setIncomeAmountFormatted] = useState<string>(standardFundAmount.toLocaleString('vi-VN'));
  const [incomePayerType, setIncomePayerType] = useState<'roster' | 'external'>('roster');
  const [incomeSearchMember, setIncomeSearchMember] = useState('');
  const [isUploadingIncomeReceipt, setIsUploadingIncomeReceipt] = useState<boolean>(false);
  const [viewingIncomeReceipt, setViewingIncomeReceipt] = useState<{ url: string; title: string } | null>(null);

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

  // ---------------------------------------------------------------------------
  // KPI COMPUTATIONS (ĐÃ TÁCH BẠCH CHUẨN XÁC GIỮA THAM DỰ & BÁO VẮNG)
  // ---------------------------------------------------------------------------
  const confirmedCount = useMemo(() => rsvpList.filter(a => a.status === 'yes').length, [rsvpList]);
  const absentMembersCount = useMemo(() => rsvpList.filter(a => a.status === 'no').length, [rsvpList]);
  const declinedCount = absentMembersCount;
  const checkedInCount = useMemo(() => rsvpList.filter(a => a.status === 'yes' && a.checkedIn).length, [rsvpList]);
  
  // Total expected fund based on standard fee (chỉ tính những bạn xác nhận tham gia)
  const expectedFund = useMemo(() => confirmedCount * standardFundAmount, [confirmedCount, standardFundAmount]);
  
  // Tổng các khoản thu ngoài quỹ sự kiện trong Sổ Thu (áo polo, người thân, tài trợ ngoài, quỹ thường niên...)
  const totalExtraIncomes = useMemo(() => {
    return effectiveIncomes.filter(item => item.category !== 'event').reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  }, [effectiveIncomes]);

  // Actual collected fund: gồm Quỹ sự kiện từ RSVP + các nguồn thu ngoài sự kiện trong Sổ Thu
  const collectedFund = useMemo(() => {
    const rsvpCollected = rsvpList.reduce((acc, curr) => {
      if (curr.fundStatus === 'paid') {
        return acc + (curr.fundAmount !== undefined ? curr.fundAmount : (curr.status === 'yes' ? standardFundAmount : 0));
      }
      return acc;
    }, 0);
    return rsvpCollected + totalExtraIncomes;
  }, [rsvpList, standardFundAmount, totalExtraIncomes]);

  // Số bạn THAM DỰ đã đóng quỹ sự kiện:
  const paidConfirmedCount = useMemo(() => {
    return rsvpList.filter(a => a.status === 'yes' && a.fundStatus === 'paid').length;
  }, [rsvpList]);

  // Số bạn BÁO VẮNG tự nguyện ủng hộ quỹ:
  const absentSupportersCount = useMemo(() => {
    return rsvpList.filter(a => a.status === 'no' && a.fundStatus === 'paid').length;
  }, [rsvpList]);

  // Tổng số bạn đã đóng quỹ hoặc ủng hộ (cả tham gia + vắng ủng hộ):
  const paidMembersCount = useMemo(() => rsvpList.filter(a => a.fundStatus === 'paid').length, [rsvpList]);

  // Extra sponsorship fund (> standardFundAmount đối với bạn tham gia, hoặc toàn bộ tiền ủng hộ từ bạn báo vắng)
  const totalExtraFund = useMemo(() => {
    return rsvpList.reduce((acc, curr) => {
      if (curr.fundStatus === 'paid') {
        if (curr.status === 'yes' && (curr.fundAmount || 0) > standardFundAmount) {
          return acc + ((curr.fundAmount || 0) - standardFundAmount);
        } else if (curr.status === 'no' && (curr.fundAmount || 0) > 0) {
          return acc + (curr.fundAmount || 0);
        }
      }
      return acc;
    }, 0);
  }, [rsvpList, standardFundAmount]);

  const extraMembersCount = useMemo(() => {
    return rsvpList.filter(a => {
      if (a.fundStatus !== 'paid') return false;
      if (a.status === 'yes') return (a.fundAmount || 0) > standardFundAmount;
      if (a.status === 'no') return (a.fundAmount || 0) > 0;
      return false;
    }).length;
  }, [rsvpList, standardFundAmount]);

  const hasReceiptCount = useMemo(() => {
    return rsvpList.filter(a => Boolean(a.fundReceiptUrl && a.fundReceiptUrl.trim())).length;
  }, [rsvpList]);

  // CHỈ ĐẾM CÁC BẠN XÁC NHẬN THAM GIA MÀ CHƯA NỘP (KHÔNG ĐẾM BẠN VẮNG)
  const unpaidMembersCount = useMemo(() => {
    return rsvpList.filter(a => a.status === 'yes' && a.fundStatus !== 'paid' && a.fundStatus !== 'exempt').length;
  }, [rsvpList]);

  const pendingMembersCount = useMemo(() => {
    return rsvpList.filter(a => a.fundStatus === 'pending').length;
  }, [rsvpList]);

  // ---------------------------------------------------------------------------
  // SỔ QUỸ THU - CHI LỚP K8A1 COMPUTATIONS & HANDLERS (QUY CHẾ ĐIỀU 3 & 4)
  // ---------------------------------------------------------------------------
  const effectiveExpenses = useMemo(() => {
    return Array.isArray(expenses) ? expenses : [];
  }, [expenses]);

  const totalExpense = useMemo(() => {
    return effectiveExpenses.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  }, [effectiveExpenses]);

  const fundBalance = useMemo(() => {
    return collectedFund - totalExpense;
  }, [collectedFund, totalExpense]);

  const filteredExpensesList = useMemo(() => {
    const term = (expenseSearch || '').toLowerCase().trim();
    return effectiveExpenses.filter(item => {
      if (expenseCategoryFilter !== 'all' && item.category !== expenseCategoryFilter) return false;
      if (!isDateInFilter(item.date || item.createdAt, expenseDateFilter, expenseCustomStartDate, expenseCustomEndDate)) {
        return false;
      }
      if (term) {
        const matchTitle = (item.title || '').toLowerCase().includes(term);
        const matchSpender = (item.spender || '').toLowerCase().includes(term);
        const matchRecipient = (item.recipient || '').toLowerCase().includes(term);
        const matchNote = (item.note || '').toLowerCase().includes(term);
        const matchEvent = (item.eventScope || '').toLowerCase().includes(term);
        return matchTitle || matchSpender || matchRecipient || matchNote || matchEvent;
      }
      return true;
    });
  }, [effectiveExpenses, expenseSearch, expenseCategoryFilter, expenseDateFilter, expenseCustomStartDate, expenseCustomEndDate, isDateInFilter]);

  const filteredExpensesTotal = useMemo(() => {
    return filteredExpensesList.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  }, [filteredExpensesList]);

  // Sổ Thu Quỹ Lớp - Danh sách & Tổng tiền sau lọc
  const filteredIncomesList = useMemo(() => {
    const term = (incomeSearch || '').toLowerCase().trim();
    return effectiveIncomes.filter(item => {
      if (incomeCategoryFilter !== 'all' && item.category !== incomeCategoryFilter) return false;
      if (!isDateInFilter(item.date || item.createdAt, incomeDateFilter, incomeCustomStartDate, incomeCustomEndDate)) {
        return false;
      }
      if (term) {
        const matchTitle = (item.title || '').toLowerCase().includes(term);
        const matchPayer = (item.payerName || '').toLowerCase().includes(term);
        const matchPhone = (item.payerPhone || '').toLowerCase().includes(term);
        const matchAuditor = (item.auditor || '').toLowerCase().includes(term);
        const matchNote = (item.note || '').toLowerCase().includes(term);
        const matchEvent = (item.eventScope || '').toLowerCase().includes(term);
        return matchTitle || matchPayer || matchPhone || matchAuditor || matchNote || matchEvent;
      }
      return true;
    });
  }, [effectiveIncomes, incomeSearch, incomeCategoryFilter, incomeDateFilter, incomeCustomStartDate, incomeCustomEndDate, isDateInFilter]);

  const filteredIncomesTotal = useMemo(() => {
    return filteredIncomesList.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  }, [filteredIncomesList]);

  const handleOpenAddExpense = (preset?: Partial<ExpenseItem>) => {
    if (!canAuditAndSpend) {
      alert('Chỉ Thủ Quỹ lớp (hoặc Admin) mới có quyền tạo khoản chi tiêu!');
      return;
    }
    const defaultSpender = (isOfficialBLLMember(activeMember) && activeMember?.fullName) ? activeMember.fullName : 'Thủ Quỹ BLL';
    const amountVal = preset?.amount !== undefined ? Number(preset.amount) : 500000;
    setEditingExpense(null);
    setExpenseFormData({
      title: preset?.title || '',
      category: (preset?.category as ExpenseCategory) || 'party',
      amount: amountVal,
      date: preset?.date || new Date().toISOString().split('T')[0],
      spender: preset?.spender || defaultSpender,
      recipient: preset?.recipient || '',
      receiptUrl: preset?.receiptUrl || '',
      eventScope: preset?.eventScope || 'Kỷ niệm 20 năm',
      note: preset?.note || ''
    });
    setExpenseAmountFormatted(amountVal > 0 ? amountVal.toLocaleString('vi-VN') : '');
    setIsExpenseModalOpen(true);
  };

  const handleOpenEditExpense = (item: ExpenseItem) => {
    if (!canAuditAndSpend) {
      alert('Chỉ Thủ Quỹ lớp (hoặc Admin) mới có quyền chỉnh sửa khoản chi tiêu!');
      return;
    }
    setEditingExpense(item);
    setExpenseFormData({ ...item });
    setExpenseAmountFormatted((item.amount || 0).toLocaleString('vi-VN'));
    setIsExpenseModalOpen(true);
  };

  const handleSaveExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canAuditAndSpend) {
      alert('Chỉ Thủ Quỹ lớp (hoặc Admin) mới có quyền lưu khoản chi tiêu!');
      return;
    }
    const cleanTitle = String(expenseFormData.title || '').trim();
    if (!cleanTitle) {
      alert('Vui lòng nhập tên / nội dung khoản chi!');
      return;
    }

    const cleanAmountStr = String(expenseAmountFormatted || '').replace(/[^0-9]/g, '');
    const amountNum = parseInt(cleanAmountStr, 10);
    if (isNaN(amountNum) || amountNum <= 0) {
      alert('Vui lòng nhập số tiền chi hợp lệ (lớn hơn 0đ)!');
      return;
    }

    const itemToSave: ExpenseItem = {
      id: editingExpense?.id || ('exp-' + Date.now()),
      title: cleanTitle,
      category: (expenseFormData.category as ExpenseCategory) || 'party',
      amount: amountNum,
      date: String(expenseFormData.date || '').trim() || new Date().toISOString().split('T')[0],
      spender: String(expenseFormData.spender || '').trim() || ((isOfficialBLLMember(activeMember) && activeMember?.fullName) ? activeMember.fullName : 'Thủ Quỹ BLL'),
      recipient: String(expenseFormData.recipient || '').trim(),
      receiptUrl: String(expenseFormData.receiptUrl || '').trim(),
      eventScope: String(expenseFormData.eventScope || '').trim() || 'Kỷ niệm 20 năm',
      note: String(expenseFormData.note || '').trim(),
      createdAt: editingExpense?.createdAt || new Date().toISOString()
    };

    if (editingExpense) {
      if (onUpdateExpense) {
        onUpdateExpense(itemToSave);
      } else if (onSaveAllExpenses) {
        onSaveAllExpenses(effectiveExpenses.map(x => x.id === itemToSave.id ? itemToSave : x));
      }
    } else {
      if (onAddExpense) {
        onAddExpense(itemToSave);
      } else if (onSaveAllExpenses) {
        onSaveAllExpenses([itemToSave, ...effectiveExpenses]);
      }
    }

    setIsExpenseModalOpen(false);
    setEditingExpense(null);
  };

  const handleDeleteExpenseItem = (item: ExpenseItem) => {
    if (!canAuditAndSpend) {
      alert('Chỉ Thủ Quỹ lớp (hoặc Admin) mới có quyền xóa khoản chi tiêu!');
      return;
    }
    if (!window.confirm(`Bạn có chắc chắn muốn xóa khoản chi "${item.title}" (${(item.amount || 0).toLocaleString('vi-VN')} đ) không?`)) {
      return;
    }
    if (onDeleteExpense) {
      onDeleteExpense(item.id);
    } else if (onSaveAllExpenses) {
      onSaveAllExpenses(effectiveExpenses.filter(x => x.id !== item.id));
    }
  };

  const handleExpenseReceiptUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploadingExpenseReceipt(true);
      const base64Jpeg = await compressImageToJpeg(file, 1600, 0.82);

      const targetUrl = appsScriptUrl || localStorage.getItem('apps_script_url') || '';
      if (targetUrl && targetUrl.trim()) {
        try {
          const payload = {
            action: 'upload_expense_receipt',
            receiptType: 'chi',
            fileData: base64Jpeg,
            mimeType: 'image/jpeg',
            title: expenseFormData.title || 'KhoanChi',
            category: expenseFormData.category || 'other',
            amount: expenseFormData.amount || 0,
            spender: expenseFormData.spender || '',
            date: expenseFormData.date || new Date().toISOString().split('T')[0]
          };

          const res = await fetch(targetUrl, {
            method: 'POST',
            body: JSON.stringify(payload)
          });
          const json = await res.json();
          if (json.status === 'success' && json.url) {
            setExpenseFormData(prev => ({ ...prev, receiptUrl: json.url }));
            setIsUploadingExpenseReceipt(false);
            return;
          }
        } catch (fetchErr) {
          console.warn('Lỗi tải hóa đơn lên Drive, chuyển sang lưu cục bộ:', fetchErr);
        }
      }

      setExpenseFormData(prev => ({ ...prev, receiptUrl: base64Jpeg }));
    } catch (err) {
      console.warn('Lỗi nén ảnh chứng từ:', err);
      alert('Không thể đọc file ảnh, vui lòng thử lại!');
    } finally {
      setIsUploadingExpenseReceipt(false);
    }
  };

  // ---------------------------------------------------------------------------
  // SỔ THU QUỸ LỚP K8A1 HANDLERS (KHOAN_THU - ĐA DẠNG DANH MỤC THU)
  // ---------------------------------------------------------------------------
  const handleOpenAddIncome = (preset?: Partial<IncomeItem>) => {
    if (!canAuditAndSpend) {
      alert('Chỉ Thủ Quỹ lớp (hoặc Admin) mới có quyền ghi nhận khoản thu!');
      return;
    }
    const defaultAuditor = (isOfficialBLLMember(activeMember) && activeMember?.fullName) ? `Thủ Quỹ ${activeMember.fullName}` : getDefaultAuditorName();
    const category = (preset?.category as IncomeCategory) || 'event';
    const catMeta = INCOME_CATEGORIES.find(c => c.id === category);
    const amountVal = preset?.amount !== undefined ? Number(preset.amount) : (catMeta?.defaultAmount || standardFundAmount);

    setEditingIncome(null);
    setIncomePayerType(preset?.payerName && !preset?.memberId ? 'external' : 'roster');
    setIncomeSearchMember('');
    setIncomeFormData({
      title: preset?.title || catMeta?.quickTitle || 'Đóng quỹ họp lớp 20 năm',
      category: category,
      amount: amountVal,
      date: preset?.date || new Date().toISOString().split('T')[0],
      payerName: preset?.payerName || '',
      payerPhone: preset?.payerPhone || '',
      memberId: preset?.memberId || undefined,
      paymentMethod: preset?.paymentMethod || 'bank_transfer',
      auditor: preset?.auditor || defaultAuditor,
      receiptUrl: preset?.receiptUrl || '',
      eventScope: preset?.eventScope || 'Kỷ niệm 20 năm',
      note: preset?.note || ''
    });
    setIncomeAmountFormatted(amountVal > 0 ? amountVal.toLocaleString('vi-VN') : '');
    setIsIncomeModalOpen(true);
  };

  const handleOpenEditIncome = (item: IncomeItem) => {
    if (!canAuditAndSpend) {
      alert('Chỉ Thủ Quỹ lớp (hoặc Admin) mới có quyền chỉnh sửa khoản thu!');
      return;
    }
    setEditingIncome(item);
    setIncomePayerType(item.memberId ? 'roster' : 'external');
    setIncomeSearchMember('');
    setIncomeFormData({ ...item });
    setIncomeAmountFormatted((item.amount || 0).toLocaleString('vi-VN'));
    setIsIncomeModalOpen(true);
  };

  const handleSaveIncome = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canAuditAndSpend) {
      alert('Chỉ Thủ Quỹ lớp (hoặc Admin) mới có quyền lưu khoản thu!');
      return;
    }
    const cleanTitle = String(incomeFormData.title || '').trim();
    if (!cleanTitle) {
      alert('Vui lòng nhập tên / nội dung khoản thu!');
      return;
    }

    const cleanPayerName = String(incomeFormData.payerName || '').trim();
    if (!cleanPayerName) {
      alert('Vui lòng chọn hoặc nhập họ tên người nộp!');
      return;
    }

    const cleanAmountStr = String(incomeAmountFormatted || '').replace(/[^0-9]/g, '');
    const amountNum = parseInt(cleanAmountStr, 10);
    if (isNaN(amountNum) || amountNum <= 0) {
      alert('Vui lòng nhập số tiền thu hợp lệ (lớn hơn 0đ)!');
      return;
    }

    const itemToSave: IncomeItem = {
      id: editingIncome?.id || ('inc-' + Date.now()),
      title: cleanTitle,
      category: (incomeFormData.category as IncomeCategory) || 'event',
      amount: amountNum,
      date: String(incomeFormData.date || '').trim() || new Date().toISOString().split('T')[0],
      payerName: cleanPayerName,
      payerPhone: String(incomeFormData.payerPhone || '').trim(),
      memberId: incomeFormData.memberId,
      paymentMethod: incomeFormData.paymentMethod || 'bank_transfer',
      auditor: String(incomeFormData.auditor || '').trim() || getDefaultAuditorName(),
      receiptUrl: String(incomeFormData.receiptUrl || '').trim(),
      eventScope: String(incomeFormData.eventScope || '').trim() || 'Kỷ niệm 20 năm',
      note: String(incomeFormData.note || '').trim(),
      createdAt: editingIncome?.createdAt || new Date().toISOString()
    };

    // 1. Lưu vào danh sách Sổ Thu (incomes)
    if (editingIncome) {
      if (onUpdateIncome) {
        onUpdateIncome(itemToSave);
      } else if (onSaveAllIncomes) {
        onSaveAllIncomes(effectiveIncomes.map(x => x.id === itemToSave.id ? itemToSave : x));
      }
    } else {
      if (onAddIncome) {
        onAddIncome(itemToSave);
      } else if (onSaveAllIncomes) {
        onSaveAllIncomes([itemToSave, ...effectiveIncomes]);
      }
    }

    // 2. NẾU là khoản thu Quỹ Sự Kiện (event) hoặc có liên kết thành viên trong lớp:
    // Tự động đồng bộ cập nhật trạng thái PAID cho bạn đó trong rsvpList!
    if (itemToSave.category === 'event' || itemToSave.memberId) {
      const targetPhone = normPhoneRoster(itemToSave.payerPhone);
      const targetName = normNameRoster(itemToSave.payerName);
      const targetMemberId = itemToSave.memberId;

      const foundRsvpIndex = rsvpList.findIndex(r => {
        if (targetMemberId && r.memberId === targetMemberId) return true;
        if (isPhoneMatch(itemToSave.payerPhone, r.phone)) return true;
        if (normNameRoster(r.fullName) === targetName) return true;
        return false;
      });

      const nowStr = new Date().toLocaleDateString('vi-VN') + ' ' + new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
      const auditor = itemToSave.auditor || getDefaultAuditorName();

      if (foundRsvpIndex > -1) {
        const updated = rsvpList.map((item, idx) => {
          if (idx === foundRsvpIndex) {
            return {
              ...item,
              fundStatus: 'paid' as const,
              fundAmount: itemToSave.amount,
              fundPaidAt: item.fundPaidAt || nowStr,
              fundPaymentMethod: itemToSave.paymentMethod,
              fundAuditedBy: auditor,
              fundReceiptUrl: itemToSave.receiptUrl || item.fundReceiptUrl,
              fundNote: itemToSave.note || itemToSave.title
            };
          }
          return item;
        });
        onUpdateRsvpList(updated);
        localStorage.setItem('rsvp_list', JSON.stringify(updated));

        // Sync to Apps Script
        if (appsScriptUrl && appsScriptUrl.trim()) {
          const matchedItem = updated[foundRsvpIndex];
          fetch(appsScriptUrl, {
            method: 'POST',
            body: JSON.stringify({
              action: 'update_fund',
              pin: getAdminPinToken(),
              phone: matchedItem.phone,
              fullName: matchedItem.fullName,
              fundStatus: 'paid',
              fundAmount: itemToSave.amount,
              fundPaidAt: matchedItem.fundPaidAt || nowStr,
              fundAuditedBy: auditor,
              fundPaymentMethod: itemToSave.paymentMethod,
              fundReceiptUrl: itemToSave.receiptUrl || matchedItem.fundReceiptUrl || '',
              fundNote: itemToSave.note || itemToSave.title
            })
          }).catch(err => console.warn('Sync fund to Google Sheets failed:', err));
        }
      } else if (itemToSave.category === 'event') {
        // Nếu chưa có trong RSVP nhưng có trong Roster: Tự tạo bản ghi RSVP mới với fundStatus = 'paid'
        const rosterMember = rosterList.find(m => {
          if (targetMemberId && m.id === targetMemberId) return true;
          if (isPhoneMatch(itemToSave.payerPhone, m.phone)) return true;
          if (normNameRoster(m.fullName) === targetName) return true;
          return false;
        });

        const newRsvp: RsvpData = {
          id: 'rsvp-' + Date.now(),
          memberId: rosterMember?.id || targetMemberId,
          fullName: itemToSave.payerName,
          nickname: rosterMember?.nickname,
          phone: itemToSave.payerPhone || rosterMember?.phone || '0900000000',
          status: 'yes',
          className: 'K8A1',
          shirtSize: rosterMember?.shirtSize ? normalizeShirtSize(rosterMember.shirtSize) : '',
          fundStatus: 'paid',
          fundAmount: itemToSave.amount,
          fundPaidAt: nowStr,
          fundPaymentMethod: itemToSave.paymentMethod,
          fundAuditedBy: auditor,
          fundReceiptUrl: itemToSave.receiptUrl,
          fundNote: itemToSave.note || itemToSave.title,
          submittedAt: nowStr
        };

        const updated = [newRsvp, ...rsvpList];
        onUpdateRsvpList(updated);
        localStorage.setItem('rsvp_list', JSON.stringify(updated));

        if (appsScriptUrl && appsScriptUrl.trim()) {
          fetch(appsScriptUrl, {
            method: 'POST',
            body: JSON.stringify({
              action: 'rsvp',
              pin: getAdminPinToken(),
              ...newRsvp
            })
          }).catch(err => console.warn('Create RSVP sync failed:', err));
        }
      }
    }

    confetti({ particleCount: 45, spread: 60, origin: { y: 0.6 } });
    setIsIncomeModalOpen(false);
    setEditingIncome(null);
  };

  const handleDeleteIncomeItem = (item: IncomeItem) => {
    if (!canAuditAndSpend) {
      alert('Chỉ Thủ Quỹ lớp (hoặc Admin) mới có quyền xóa khoản thu!');
      return;
    }
    if (!window.confirm(`Bạn có chắc chắn muốn xóa khoản thu "${item.title}" (${(item.amount || 0).toLocaleString('vi-VN')} đ) của "${item.payerName}" không?`)) {
      return;
    }
    if (onDeleteIncome) {
      onDeleteIncome(item.id);
    } else if (onSaveAllIncomes) {
      onSaveAllIncomes(effectiveIncomes.filter(x => x.id !== item.id));
    }
  };

  const handleIncomeReceiptUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploadingIncomeReceipt(true);
      const base64Jpeg = await compressImageToJpeg(file, 1600, 0.82);

      const targetUrl = appsScriptUrl || localStorage.getItem('apps_script_url') || '';
      if (targetUrl && targetUrl.trim()) {
        try {
          const payload = {
            action: 'upload_fund_receipt',
            receiptType: 'thu',
            fileData: base64Jpeg,
            mimeType: 'image/jpeg',
            fullName: incomeFormData.payerName || 'ThanhVien',
            phone: incomeFormData.payerPhone || '',
            category: incomeFormData.category || 'event',
            title: incomeFormData.title || 'KhoanThu',
            fundAmount: incomeFormData.amount || standardFundAmount,
            fundPaymentMethod: incomeFormData.paymentMethod || 'bank_transfer',
            fundAuditedBy: getDefaultAuditorName(),
            fundNote: incomeFormData.note || ''
          };

          const res = await fetch(targetUrl, {
            method: 'POST',
            body: JSON.stringify(payload)
          });
          const json = await res.json();
          if (json.status === 'success' && json.url) {
            setIncomeFormData(prev => ({ ...prev, receiptUrl: json.url }));
            setIsUploadingIncomeReceipt(false);
            return;
          }
        } catch (fetchErr) {
          console.warn('Drive upload failed, fallback to local image:', fetchErr);
        }
      }

      setIncomeFormData(prev => ({ ...prev, receiptUrl: base64Jpeg }));
      setIsUploadingIncomeReceipt(false);
    } catch (err: any) {
      alert('Lỗi tải ảnh: ' + (err.message || 'Không thể upload ảnh'));
      setIsUploadingIncomeReceipt(false);
    }
  };

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
      shirtSize: '',
      message: '',
      fundStatus: 'unpaid',
      fundAmount: standardFundAmount,
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
      shirtSize: attendee.shirtSize ? normalizeShirtSize(attendee.shirtSize) : '',
      fundAmount: attendee.fundAmount !== undefined ? attendee.fundAmount : standardFundAmount,
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

    let autoMemberId = memberFormData.memberId;
    if (!autoMemberId && rosterList && rosterList.length > 0) {
      const match = rosterList.find(m => isPhoneMatch(m.phone, cleanPhone) || isVietnameseNameMatch(m, cleanFullName));
      if (match) autoMemberId = match.id;
    }

    const memberPayload: RsvpData = {
      ...memberFormData,
      memberId: autoMemberId || undefined,
      fullName: cleanFullName,
      phone: cleanPhone,
      className: memberFormData.className || 'K8A1',
      shirtSize: memberFormData.shirtSize ? normalizeShirtSize(memberFormData.shirtSize) : '',
      status: memberFormData.status || 'yes',
      fundStatus: memberFormData.fundStatus || 'unpaid',
      fundAmount: memberFormData.fundAmount !== undefined ? memberFormData.fundAmount : standardFundAmount,
      fundNote: memberFormData.fundNote || '',
      message: memberFormData.message || ''
    };

    if (editingMember) {
      const updated = rsvpList.map(item => {
        if ((editingMember.id && item.id === editingMember.id) || String(item.phone || '') === String(editingMember.phone || '')) {
          return {
            ...item,
            ...memberPayload
          } as RsvpData;
        }
        return item;
      });
      onUpdateRsvpList(updated);
      localStorage.setItem('rsvp_list', JSON.stringify(updated));
    } else {
      const newMember: RsvpData = {
        ...memberPayload,
        id: 'user-' + Date.now(),
        submittedAt: new Date().toLocaleDateString('vi-VN') + ' ' + new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        checkedIn: false
      };
      const updated = [newMember, ...rsvpList];
      onUpdateRsvpList(updated);
      localStorage.setItem('rsvp_list', JSON.stringify(updated));
    }

    // Đồng bộ ngược lại Danh bạ sĩ số (classRoster) nếu có size áo
    if (onUpdateClassRoster && rosterList && rosterList.length > 0 && memberPayload.shirtSize) {
      const targetMid = autoMemberId || memberPayload.memberId;
      const updatedRoster = rosterList.map(m => {
        const isMatch = (targetMid && m.id === targetMid) || 
                        (m.fullName && cleanFullName && m.fullName.trim().toLowerCase() === cleanFullName.toLowerCase()) ||
                        (m.phone && cleanPhone && isPhoneMatch(m.phone, cleanPhone));
        if (isMatch) {
          return {
            ...m,
            shirtSize: memberPayload.shirtSize
          };
        }
        return m;
      });
      onUpdateClassRoster(updatedRoster);
      try { localStorage.setItem('class_roster_custom', JSON.stringify(updatedRoster)); } catch(e) {}
    }

    // Đồng bộ tức thì lên Google Sheet tab "Diem_Danh"
    if (appsScriptUrl && appsScriptUrl.trim()) {
      fetch(appsScriptUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'rsvp',
          ...memberPayload
        })
      }).catch(err => console.warn('Lỗi đồng bộ member lên Google Sheet:', err));
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

      // Xóa trực tiếp trên Google Sheet tab "Diem_Danh"
      if (appsScriptUrl && appsScriptUrl.trim()) {
        fetch(appsScriptUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({
            action: 'delete_rsvp',
            pin: getAdminPinToken(),
            fullName: attendee.fullName,
            phone: attendee.phone,
            rowId: attendee.rowId
          })
        }).catch(err => console.warn('Lỗi xóa rsvp trên Google Sheet:', err));
      }
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
      shirtSize: '',
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
      shirtSize: member.shirtSize ? normalizeShirtSize(member.shirtSize) : '',
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

    const cleanShirt = rosterFormData.shirtSize ? normalizeShirtSize(rosterFormData.shirtSize) : '';

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
            shirtSize: cleanShirt,
            note: String(rosterFormData.note || '').trim()
          };
        }
        return item;
      });
      setRosterFeedbackMsg(`✓ Đã cập nhật thông tin bạn "${cleanName}" thành công!`);
    } else {
      const newId = 'm' + (rosterList.length + 1 < 10 ? '0' + (rosterList.length + 1) : (rosterList.length + 1));
      const newMember: ClassMember = {
        id: newId,
        fullName: cleanName,
        nickname: String(rosterFormData.nickname || '').trim(),
        phone: String(rosterFormData.phone || '').trim(),
        role: String(rosterFormData.role || 'Thành viên').trim(),
        gender: (rosterFormData.gender === 'female' ? 'female' : 'male'),
        shirtSize: cleanShirt,
        note: String(rosterFormData.note || '').trim()
      };
      updatedList = [...rosterList, newMember];
      setRosterFeedbackMsg(`✓ Đã thêm bạn "${cleanName}" vào danh bạ lớp thành công!`);
    }

    if (onUpdateClassRoster) {
      onUpdateClassRoster(updatedList);
    }

    // Đồng bộ tức thời sang rsvpList nếu đang sửa bạn học đã có trong danh bạ
    if (editingRosterMember && rsvpList && rsvpList.length > 0) {
      const targetMid = editingRosterMember.id;
      const cleanTargetName = editingRosterMember.fullName.trim().toLowerCase();
      const updatedRsvp = rsvpList.map(r => {
        const isMatch = (r.memberId && r.memberId === targetMid) ||
                        (r.fullName && cleanTargetName && r.fullName.trim().toLowerCase() === cleanTargetName) ||
                        (r.fullName && cleanName && r.fullName.trim().toLowerCase() === cleanName.toLowerCase()) ||
                        (r.phone && rosterFormData.phone && isPhoneMatch(r.phone, String(rosterFormData.phone)));
        if (isMatch) {
          return {
            ...r,
            fullName: cleanName,
            nickname: String(rosterFormData.nickname || '').trim(),
            phone: String(rosterFormData.phone || '').trim(),
            shirtSize: cleanShirt
          };
        }
        return r;
      });
      onUpdateRsvpList(updatedRsvp);
      try {
        localStorage.setItem('rsvp_list', JSON.stringify(updatedRsvp));
      } catch (e) {}
    }

    setTimeout(() => setRosterFeedbackMsg(''), 4000);
    setIsRosterModalOpen(false);
  };

  const handleDeleteRosterMember = (member: ClassMember) => {
    if (currentUserRole !== 'admin') {
      alert('Chỉ Trưởng Ban (Admin) mới có quyền xóa học sinh khỏi danh bạ lớp!');
      return;
    }

    if (confirm(`Bạn có chắc chắn muốn xóa bạn "${member.fullName}" khỏi Danh Bạ Lớp K8A1?`)) {
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
      setRosterFeedbackMsg(`✓ Đã lưu và đồng bộ toàn bộ danh bạ lớp lên hệ thống!`);
      setTimeout(() => setRosterFeedbackMsg(''), 4000);
    } catch (e) {
      alert('Lỗi đồng bộ: ' + e);
    } finally {
      setIsRosterSyncing(false);
    }
  };

  // Export CSV
  const handleExportRsvpCsv = () => {
    const headers = ['STT', 'Họ và Tên', 'Biệt Danh', 'Số Điện Thoại', 'Lớp', 'Tham Gia', 'Size Áo', 'Điểm Danh Đến', 'Thời Gian Đến', `Trạng Thái Quỹ (${standardFundAmount.toLocaleString('vi-VN')}đ)`, 'Số Tiền Đóng', 'Ghi Chú Quỹ', 'Lời Nhắn'];
    const rows = rsvpList.map((a, idx) => [
      idx + 1,
      `"${a.fullName || ''}"`,
      `"${a.nickname || ''}"`,
      `"${a.phone || ''}"`,
      `"${a.className || 'K8A1'}"`,
      a.status === 'yes' ? 'CÓ THAM GIA' : 'VẮNG MẶT',
      `"${a.shirtSize ? normalizeShirtSize(a.shirtSize) : 'Chưa chọn'}"`,
      a.checkedIn ? 'ĐÃ ĐẾN' : 'CHƯA ĐẾN',
      `"${a.checkedInAt || ''}"`,
      a.fundStatus === 'paid' ? 'ĐÃ ĐÓNG' : 'CHƯA ĐÓNG',
      a.fundAmount || (a.fundStatus === 'paid' ? standardFundAmount : 0),
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
    if (!canAuditAndSpend) {
      alert('Chỉ Thủ Quỹ lớp (hoặc Admin) mới có quyền đối soát và xác nhận nộp tiền!');
      return;
    }
    const isCurrentlyPaid = attendee.fundStatus === 'paid';
    const nextStatus = isCurrentlyPaid ? 'unpaid' : 'paid';
    const nextAmount = nextStatus === 'paid' ? (attendee.fundAmount || standardFundAmount) : 0;
    const nowStr = new Date().toLocaleDateString('vi-VN') + ' ' + new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    const auditor = getDefaultAuditorName();

    const updated = rsvpList.map(item => {
      if ((item.id && item.id === attendee.id) || item.phone === attendee.phone) {
        return {
          ...item,
          fundStatus: nextStatus,
          fundAmount: nextAmount,
          fundPaidAt: nextStatus === 'paid' ? (item.fundPaidAt || nowStr) : undefined,
          fundAuditedBy: nextStatus === 'paid' ? (item.fundAuditedBy || auditor) : undefined,
          fundPaymentMethod: nextStatus === 'paid' ? (item.fundPaymentMethod || 'bank_transfer') : item.fundPaymentMethod,
          fundNote: nextStatus === 'paid' ? (item.fundNote || `Đã nộp ${standardFundAmount.toLocaleString('vi-VN')}đ`) : ''
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
          pin: getAdminPinToken(),
          phone: attendee.phone,
          fullName: attendee.fullName,
          fundStatus: nextStatus,
          fundAmount: nextAmount,
          fundPaidAt: nextStatus === 'paid' ? nowStr : '',
          fundAuditedBy: nextStatus === 'paid' ? auditor : '',
          fundPaymentMethod: attendee.fundPaymentMethod || 'bank_transfer',
          fundNote: nextStatus === 'paid' ? (attendee.fundNote || `Đã nộp ${standardFundAmount.toLocaleString('vi-VN')}đ`) : ''
        })
      }).catch(err => console.warn('Toggle fund sync failed:', err));
    }

    if (nextStatus === 'paid') {
      confetti({ particleCount: 35, spread: 50, origin: { y: 0.6 } });
    }
  };

  const handleApproveFundDirect = (attendee: RsvpData, customAmount: number = standardFundAmount, note?: string) => {
    if (!canAuditAndSpend) {
      alert('Chỉ Thủ Quỹ lớp (hoặc Admin) mới có quyền đối soát và duyệt tiền quỹ!');
      return;
    }
    const nowStr = new Date().toLocaleDateString('vi-VN') + ' ' + new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    const auditor = getDefaultAuditorName();
    const finalAmount = customAmount || standardFundAmount;
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
          pin: getAdminPinToken(),
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
      handleApproveFundDirect(foundAttendee, viewReceiptModal.amount || standardFundAmount);
    }

    const nowStr = new Date().toLocaleDateString('vi-VN') + ' ' + new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    const auditor = getDefaultAuditorName();

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
    setFundAdjustAmount(attendee.fundAmount !== undefined ? attendee.fundAmount : (isPaid ? standardFundAmount : 0));
    setFundAdjustStatus(attendee.fundStatus || (isPaid ? 'paid' : 'unpaid'));
    setFundAdjustNote(attendee.fundNote || '');
    setFundAdjustPaymentMethod(attendee.fundPaymentMethod || 'bank_transfer');
    setFundAdjustReceiptUrl(attendee.fundReceiptUrl || '');
    setFundAdjustPaidAt(attendee.fundPaidAt ? formatDateTimeVi(attendee.fundPaidAt) : (isPaid ? '01/09/2026' : new Date().toLocaleDateString('vi-VN') + ' ' + new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })));
    setFundAdjustAuditedBy(attendee.fundAuditedBy || getDefaultAuditorName());
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
      const base64Data = await compressImageToJpeg(file, 1600, 0.82);

      // If appsScriptUrl is present, upload to Drive subfolder "ChungTu_QuyLop_K8A1"
      const targetUrl = appsScriptUrl || localStorage.getItem('apps_script_url') || '';
      if (targetUrl && targetUrl.trim()) {
        try {
          const payload = {
            action: 'upload_fund_receipt',
            receiptType: 'thu',
            fileData: base64Data,
            mimeType: 'image/jpeg',
            fullName: adjustFundMember?.fullName || 'ThanhVien',
            phone: adjustFundMember?.phone || '',
            fundAmount: fundAdjustAmount,
            fundPaymentMethod: fundAdjustPaymentMethod,
            fundPaidAt: fundAdjustPaidAt || new Date().toLocaleString('vi-VN'),
            fundAuditedBy: getDefaultAuditorName(),
            fundNote: fundAdjustNote
          };

          const res = await fetch(targetUrl, {
            method: 'POST',
            body: JSON.stringify(payload)
          });
          const json = await res.json();
          if (json.status === 'success' && json.url) {
            setFundAdjustReceiptUrl(json.url);
            setReceiptUploadSuccessMsg('Đã lưu ảnh chứng từ an toàn lên hệ thống!');
            setIsUploadingReceipt(false);
            return;
          }
        } catch (fetchErr) {
          console.warn('Drive upload failed, fallback to local image:', fetchErr);
        }
      }

      // Fallback: Store compressed base64 data URL
      setFundAdjustReceiptUrl(base64Data);
      setReceiptUploadSuccessMsg('Đã đính kèm ảnh chứng từ thành công!');
      setIsUploadingReceipt(false);
    } catch (err: any) {
      setReceiptUploadErrorMsg('Lỗi: ' + (err.message || 'Không thể upload ảnh'));
      setIsUploadingReceipt(false);
    }
  };

  const handleSaveAdjustFund = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustFundMember) return;
    if (!canAuditAndSpend) {
      alert('Chỉ Thủ Quỹ lớp (hoặc Admin) mới có quyền lưu chỉnh sửa đối soát!');
      return;
    }

    const targetStatus = fundAdjustStatus || (fundAdjustAmount > 0 ? 'paid' : 'unpaid');
    const auditedTime = fundAdjustPaidAt || (targetStatus === 'paid' ? new Date().toLocaleDateString('vi-VN') + ' ' + new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : undefined);
    const auditorName = fundAdjustAuditedBy || getDefaultAuditorName();

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
          pin: getAdminPinToken(),
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

  // Export CSV for Sổ Quỹ Thu - Chi K8A1 (Chuẩn UTF-8 mở trực tiếp bằng Excel)
  const handleExportFundCsv = () => {
    const categoryLabels: Record<string, string> = {
      care: 'Hiếu Hỷ & Thăm Hỏi',
      teacher: 'Tri Ân Thầy Cô',
      party: 'Tiệc & Sự Kiện Gặp Mặt',
      souvenir: 'Đồng Phục & Kỷ Niệm',
      media: 'Sân Khấu & Truyền Thông',
      other: 'Chi Khác & Dự Phòng'
    };

    const headerLines = [
      'BÁO CÁO SỔ QUỸ THU - CHI LỚP K8A1 (THPT THÁI NGUYÊN 2003 - 2006)',
      `Thời điểm xuất file: ${new Date().toLocaleString('vi-VN')}`,
      `TỔNG THU: ${collectedFund.toLocaleString('vi-VN')} VNĐ (Từ ${paidMembersCount} bạn đã đóng)`,
      `TỔNG CHI: ${totalExpense.toLocaleString('vi-VN')} VNĐ (Từ ${effectiveExpenses.length} khoản chi thực tế)`,
      `SỐ DƯ QUỸ CÒN LẠI: ${fundBalance.toLocaleString('vi-VN')} VNĐ`,
      ''
    ];

    // PHẦN 1: SỔ CHI TIÊU
    const expenseHeaders = [
      'STT',
      'Ngày Chi',
      'Tên Khoản Chi',
      'Nhóm Chi',
      'Số Tiền (VNĐ)',
      'Người Chi / Phụ Trách',
      'Đơn Vị Thụ Hưởng / Người Nhận',
      'Phạm Vi Sự Kiện',
      'Link Hóa Đơn / Bill',
      'Ghi Chú Chi Tiết'
    ];

    const expenseRows = effectiveExpenses.map((exp, idx) => [
      idx + 1,
      `"${formatDateOnlyVi(exp.date)}"`,
      `"${String(exp.title || '').replace(/"/g, '""')}"`,
      `"${categoryLabels[exp.category] || exp.category || 'Chi khác'}"`,
      Number(exp.amount) || 0,
      `"${String(exp.spender || '').replace(/"/g, '""')}"`,
      `"${String(exp.recipient || '').replace(/"/g, '""')}"`,
      `"${String(exp.eventScope || '').replace(/"/g, '""')}"`,
      `"${exp.receiptUrl || ''}"`,
      `"${String(exp.note || '').replace(/"/g, '""')}"`
    ]);

    const expenseSummaryRow = [
      '',
      '',
      'TỔNG CỘNG TIỀN CHI',
      '',
      totalExpense,
      `Tổng: ${effectiveExpenses.length} khoản chi`,
      '',
      '',
      '',
      ''
    ];

    // PHẦN 2: SỔ THU QUỸ
    const incomeHeaders = [
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

    const incomeRows = rsvpList.map((a, idx) => {
      const isPaid = a.fundStatus === 'paid';
      const amount = isPaid ? (a.fundAmount !== undefined ? a.fundAmount : standardFundAmount) : 0;
      const extra = isPaid && amount > standardFundAmount ? amount - standardFundAmount : 0;
      const methodText = a.fundPaymentMethod === 'cash' ? 'Tiền mặt bàn đón tiếp' : (a.fundPaymentMethod === 'other' ? 'Khác' : 'Chuyển khoản Ngân hàng');
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
        `"${formatDateTimeVi(a.fundPaidAt) || ''}"`,
        `"${a.fundAuditedBy || ''}"`,
        `"${String(a.fundNote || '').replace(/"/g, '""')}"`
      ];
    });

    const incomeSummaryRow = [
      '',
      'TỔNG CỘNG TIỀN THU',
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
      ''
    ];

    const allLines = [
      ...headerLines,
      '=== PHẦN 1: BẢNG KHOẢN CHI QUỸ LỚP (SỔ CHI) ===',
      expenseHeaders.join(','),
      ...expenseRows.map(r => r.join(',')),
      expenseSummaryRow.join(','),
      '',
      '=== PHẦN 2: BẢNG ĐỐI SOÁT THU QUỸ (SỔ THU) ===',
      incomeHeaders.join(','),
      ...incomeRows.map(r => r.join(',')),
      incomeSummaryRow.join(',')
    ];

    const csvContent = '\uFEFF' + allLines.join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `So_Quy_Thu_Chi_K8A1_${new Date().toISOString().slice(0, 10)}.csv`);
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
  const handleBannerFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 15 * 1024 * 1024) {
      alert('Kích thước file ảnh tối đa là 15MB!');
      return;
    }

    setIsUploadingBanner(true);
    const targetScriptUrl = (appsScriptUrl && appsScriptUrl.trim()) || DEFAULT_APPS_SCRIPT_URL;

    try {
      // 1. Tự động nén ảnh qua Canvas HTML5 (rộng tối đa 1600px, chất lượng 0.82) -> ~80-120KB
      const compressedDataUrl = await compressImageToJpeg(file, 1600, 0.82);
      setBannerInput(compressedDataUrl);

      // 2. Tải trực tiếp lên Google Drive qua action 'upload_photo' để nhận link CDN vĩnh viễn
      if (targetScriptUrl && targetScriptUrl.startsWith('http')) {
        try {
          const res = await fetch(targetScriptUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify({
              action: 'upload_photo',
              fileData: compressedDataUrl,
              caption: 'Hero_Banner_K8A1'
            })
          });
          const result = await res.json();
          if (result && result.status === 'success' && result.data && (result.data.url || result.data.driveUrl)) {
            const driveUrl = result.data.url || result.data.driveUrl;
            setBannerInput(driveUrl);
            setEventConfigForm(prev => ({
              ...prev,
              heroBannerUrl: driveUrl,
              heroBannerPosition: bannerPositionY
            }));

            // Lưu vào state và localStorage của App
            if (onUpdateHeroBannerUrl) {
              onUpdateHeroBannerUrl(driveUrl, bannerPositionY);
            }

            // Ghi trực tiếp vào Google Sheet tab "Cau_Hinh" để đảm bảo lưu vĩnh viễn
            try {
              await fetch(targetScriptUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify({
                  action: 'save_config',
                  config: {
                    heroBannerUrl: driveUrl,
                    heroBannerPosition: bannerPositionY
                  }
                })
              });
            } catch (errSheet) {
              console.warn('Lỗi ghi save_config từ handleBannerFileUpload:', errSheet);
            }

            setSettingsSuccessMsg('Đã tải ảnh lên hệ thống và lưu cấu hình thành công!');
            setTimeout(() => setSettingsSuccessMsg(''), 5000);
            return;
          } else {
            console.warn('Kết quả upload_photo không mong đợi:', result);
          }
        } catch (uploadErr) {
          console.warn('Không tải được lên Drive, sử dụng ảnh nén cục bộ:', uploadErr);
        }
      }

      // Cập nhật eventConfigForm với ảnh nén nếu chưa kết nối Script
      setEventConfigForm(prev => ({
        ...prev,
        heroBannerUrl: compressedDataUrl,
        heroBannerPosition: bannerPositionY
      }));
    } catch (err: any) {
      console.error('Lỗi xử lý nén ảnh banner:', err);
      alert('Không thể đọc file ảnh: ' + (err?.message || err));
    } finally {
      setIsUploadingBanner(false);
      e.target.value = '';
    }
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

  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    let cleanUrl = normalizeImageUrl(bannerInput.trim());
    if (!cleanUrl) {
      alert('Vui lòng nhập link ảnh hoặc chọn file tải lên!');
      return;
    }

    const targetScriptUrl = (appsScriptUrl && appsScriptUrl.trim()) || DEFAULT_APPS_SCRIPT_URL;

    // Nếu ảnh vẫn là dạng Base64 và có kết nối Apps Script, tự động đẩy lên Google Drive trước khi lưu Sheet
    if (cleanUrl.startsWith('data:image/') && targetScriptUrl && targetScriptUrl.startsWith('http')) {
      try {
        setIsUploadingBanner(true);
        const res = await fetch(targetScriptUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({
            action: 'upload_photo',
            fileData: cleanUrl,
            caption: 'Hero_Banner_K8A1'
          })
        });
        const result = await res.json();
        if (result && result.status === 'success' && result.data && (result.data.url || result.data.driveUrl)) {
          cleanUrl = result.data.url || result.data.driveUrl;
        }
      } catch (err) {
        console.warn('Lỗi tải ảnh base64 lên Drive khi bấm lưu banner:', err);
      } finally {
        setIsUploadingBanner(false);
      }
    }

    setBannerInput(cleanUrl);
    // Đồng bộ vào form cấu hình chung để tránh bị ghi đè khi lưu settings
    setEventConfigForm(prev => ({
      ...prev,
      heroBannerUrl: cleanUrl,
      heroBannerPosition: bannerPositionY
    }));
    if (onUpdateHeroBannerUrl) {
      onUpdateHeroBannerUrl(cleanUrl, bannerPositionY);
    }

    // Ghi trực tiếp vào Google Sheet tab "Cau_Hinh"
    if (targetScriptUrl && targetScriptUrl.startsWith('http')) {
      try {
        await fetch(targetScriptUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({
            action: 'save_config',
            config: {
              heroBannerUrl: cleanUrl,
              heroBannerPosition: bannerPositionY
            }
          })
        });
      } catch (eSync) {
        console.warn('Lỗi ghi save_config từ handleSaveBanner:', eSync);
      }
    }

    setSettingsSuccessMsg('Đã lưu ảnh bìa và cập nhật thành công!');
    setTimeout(() => setSettingsSuccessMsg(''), 4000);
  };

  const handleResetBanner = async () => {
    const defaultUrl = DEFAULT_EVENT_CONFIG.heroBannerUrl || '';
    setBannerInput(defaultUrl);
    setBannerPositionY(50);
    setEventConfigForm(prev => ({
      ...prev,
      heroBannerUrl: defaultUrl,
      heroBannerPosition: 50
    }));
    if (onUpdateHeroBannerUrl) {
      onUpdateHeroBannerUrl(defaultUrl, 50);
    }
    const targetScriptUrl = (appsScriptUrl && appsScriptUrl.trim()) || DEFAULT_APPS_SCRIPT_URL;
    if (targetScriptUrl && targetScriptUrl.startsWith('http')) {
      try {
        await fetch(targetScriptUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({
            action: 'save_config',
            config: {
              heroBannerUrl: defaultUrl,
              heroBannerPosition: 50
            }
          })
        });
      } catch (eSync) {}
    }
    setSettingsSuccessMsg('Đã khôi phục ảnh bìa banner và vị trí về mặc định!');
    setTimeout(() => setSettingsSuccessMsg(''), 4000);
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

  const handlePhotoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingPhoto(true);
    try {
      const compressed = await compressImageToJpeg(file, 1600, 0.82);
      const cleanCaption = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');

      const targetScriptUrl = appsScriptUrl || localStorage.getItem('apps_script_url') || '';
      if (targetScriptUrl && targetScriptUrl.trim()) {
        try {
          const res = await fetch(targetScriptUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify({
              action: 'upload_photo',
              fileData: compressed,
              caption: cleanCaption
            })
          });
          const result = await res.json();
          if (result && result.status === 'success' && result.data && (result.data.url || result.data.driveUrl)) {
            const driveUrl = result.data.url || result.data.driveUrl;
            setPhotoFormData(prev => ({
              ...prev,
              url: driveUrl,
              caption: prev.caption || cleanCaption
            }));
            return;
          }
        } catch (uploadErr) {
          console.warn('Lỗi upload photo lên Drive:', uploadErr);
        }
      }

      setPhotoFormData(prev => ({
        ...prev,
        url: compressed,
        caption: prev.caption || cleanCaption
      }));
    } catch (err: any) {
      console.error('Lỗi xử lý file ảnh:', err);
      alert('Không thể đọc file ảnh: ' + (err?.message || err));
    } finally {
      setIsUploadingPhoto(false);
      e.target.value = '';
    }
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

  const handleVenuePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 15 * 1024 * 1024) {
      alert('Kích thước ảnh tối đa là 15MB!');
      return;
    }
    setIsUploadingVenuePhoto(true);
    try {
      const compressed = await compressImageToJpeg(file, 1600, 0.82);
      const cleanTitle = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ') || 'Ảnh Không Gian Crown Palace';

      const targetScriptUrl = appsScriptUrl || localStorage.getItem('apps_script_url') || '';
      if (targetScriptUrl && targetScriptUrl.trim()) {
        try {
          const res = await fetch(targetScriptUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify({
              action: 'upload_photo',
              fileData: compressed,
              caption: 'Venue_' + cleanTitle
            })
          });
          const result = await res.json();
          if (result && result.status === 'success' && result.data && (result.data.url || result.data.driveUrl)) {
            const driveUrl = result.data.url || result.data.driveUrl;
            setVenueMediaFormData(prev => ({
              ...prev,
              url: driveUrl,
              title: prev.title || cleanTitle
            }));
            return;
          }
        } catch (uploadErr) {
          console.warn('Lỗi upload venue photo lên Drive:', uploadErr);
        }
      }

      setVenueMediaFormData(prev => ({
        ...prev,
        url: compressed,
        title: prev.title || cleanTitle
      }));
    } catch (err: any) {
      console.error('Lỗi xử lý file ảnh không gian:', err);
      alert('Không thể đọc file ảnh: ' + (err?.message || err));
    } finally {
      setIsUploadingVenuePhoto(false);
      e.target.value = '';
    }
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
    const mergedConfig: EventConfig = {
      ...eventConfigForm,
      heroBannerUrl: normalizeImageUrl(bannerInput.trim() || eventConfigForm.heroBannerUrl || heroBannerUrl || DEFAULT_EVENT_CONFIG.heroBannerUrl),
      heroBannerPosition: bannerPositionY !== undefined ? bannerPositionY : (eventConfigForm.heroBannerPosition ?? 50)
    };

    if (onUpdateEventConfig) {
      onUpdateEventConfig(mergedConfig);
    }
    try {
      localStorage.setItem('k8a1_event_config', JSON.stringify(mergedConfig));
    } catch (err) {
      console.error('Lỗi lưu event config:', err);
    }

    let msg = 'Đã lưu cấu hình sự kiện thành công! ';

    // 2. Lưu URL Google Apps Script nếu là Admin
    if (currentUserRole === 'admin' && scriptUrlInput !== appsScriptUrl) {
      onSaveAppsScriptUrl(scriptUrlInput.trim());
      msg += 'Đã lưu URL Google Apps Script. ';
    }

    setSettingsSuccessMsg(msg);
    confetti({ particleCount: 25, spread: 60, origin: { y: 0.7 } });
    setTimeout(() => setSettingsSuccessMsg(''), 4000);
  };

  // ---------------------------------------------------------------------------
  // STAGE PRESENTATION & MUSIC PLAYLIST SAVE (BLL & ADMIN)
  // ---------------------------------------------------------------------------
  // Tự động đồng bộ danh sách Backdrop vào EventConfig và Google Sheets
  const persistPresentationBackdrops = (newBackdrops: BackdropItem[]) => {
    setStageBackdrops(newBackdrops);
    const updatedConfig: EventConfig = {
      ...(eventConfig || DEFAULT_EVENT_CONFIG),
      ...eventConfigForm,
      backdrops: newBackdrops,
      musicPlaylist: stagePlaylist,
      stageSettings: stageSettingsState
    };
    if (onUpdateEventConfig) {
      onUpdateEventConfig(updatedConfig);
    }
    try {
      localStorage.setItem('k8a1_event_config', JSON.stringify(updatedConfig));
    } catch (e) {}

    const targetScriptUrl = (appsScriptUrl && appsScriptUrl.trim()) || localStorage.getItem('apps_script_url') || DEFAULT_APPS_SCRIPT_URL;
    if (targetScriptUrl && !targetScriptUrl.includes('YOUR_NEW_DEPLOYMENT_ID')) {
      const pin = getAdminPinToken();
      fetch(targetScriptUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'save_config',
          pin: pin,
          config: updatedConfig
        })
      }).catch((e) => console.warn('Lỗi auto save backdrops:', e));
    }
  };

  const handleSavePresentationConfig = async () => {
    setIsSavingPresentation(true);
    setPresentationSuccessMsg('');
    try {
      const updatedConfig: EventConfig = {
        ...(eventConfig || DEFAULT_EVENT_CONFIG),
        ...eventConfigForm,
        backdrops: stageBackdrops,
        musicPlaylist: stagePlaylist,
        stageSettings: stageSettingsState
      };

      if (onUpdateEventConfig) {
        onUpdateEventConfig(updatedConfig);
      }

      try {
        localStorage.setItem('k8a1_event_config', JSON.stringify(updatedConfig));
      } catch (e) {}

      // Đồng bộ trực tiếp lên Google Apps Script / Google Sheets
      const targetScriptUrl = (appsScriptUrl && appsScriptUrl.trim()) || localStorage.getItem('apps_script_url') || DEFAULT_APPS_SCRIPT_URL;
      if (targetScriptUrl && !targetScriptUrl.includes('YOUR_NEW_DEPLOYMENT_ID')) {
        const pin = getAdminPinToken();
        const res = await fetch(targetScriptUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({
            action: 'save_config',
            pin: pin,
            config: updatedConfig
          })
        });
        const json = await res.json();
        if (json.status === 'success') {
          setPresentationSuccessMsg('Đã đồng bộ thành công cấu hình Màn LED & Playlist lên Google Sheets!');
        } else {
          setPresentationSuccessMsg('Đã lưu cục bộ! Phản hồi máy chủ: ' + (json.message || 'Thành công'));
        }
      } else {
        setPresentationSuccessMsg('Đã lưu cấu hình Màn LED & Playlist cục bộ thành công!');
      }
      confetti({ particleCount: 30, spread: 60, origin: { y: 0.7 } });
    } catch (err: any) {
      console.warn('Lỗi lưu cấu hình màn LED:', err);
      setPresentationSuccessMsg('Đã lưu cấu hình Màn LED & Playlist thành công!');
    } finally {
      setIsSavingPresentation(false);
      setTimeout(() => setPresentationSuccessMsg(''), 5000);
    }
  };

  const handleUpdateSecurityPins = async () => {
    if (currentUserRole !== 'admin') return;
    if (!currentAdminPinConfirm) {
      alert('Vui lòng nhập mã PIN Admin hiện tại để xác minh quyền quản trị!');
      return;
    }
    if (!newAdminPin && !newTreasurerPin && !newBllPin) {
      alert('Vui lòng nhập ít nhất một mã PIN mới cần thay đổi!');
      return;
    }
    if (newAdminPin && !/^\d{4}$/.test(newAdminPin)) {
      alert('Mã PIN Admin mới phải đúng 4 chữ số!');
      return;
    }
    if (newTreasurerPin && !/^\d{4}$/.test(newTreasurerPin)) {
      alert('Mã PIN Thủ Quỹ mới phải đúng 4 chữ số!');
      return;
    }
    if (newBllPin && !/^\d{4}$/.test(newBllPin)) {
      alert('Mã PIN Ban Liên Lạc mới phải đúng 4 chữ số!');
      return;
    }

    setIsUpdatingPins(true);
    try {
      const res = await updatePinsViaBackend({
        currentAdminPin: currentAdminPinConfirm,
        newAdminPin: newAdminPin || undefined,
        newTreasurerPin: newTreasurerPin || undefined,
        newBllPin: newBllPin || undefined
      }, appsScriptUrl);

      if (res.success) {
        try { confetti({ particleCount: 35, spread: 65, origin: { y: 0.6 } }); } catch (e) {}
        alert(res.message);
        setCurrentAdminPinConfirm('');
        setNewAdminPin('');
        setNewTreasurerPin('');
        setNewBllPin('');
      } else {
        alert('Cập nhật thất bại: ' + res.message);
      }
    } catch (e: any) {
      alert('Lỗi khi cập nhật mã PIN: ' + (e?.message || e));
    } finally {
      setIsUpdatingPins(false);
    }
  };

  const handleInitSecuritySheet = async () => {
    setIsCheckingSecuritySheet(true);
    try {
      const res = await initSecuritySheetViaBackend(appsScriptUrl);
      if (res.success) {
        try { confetti({ particleCount: 30, spread: 50, origin: { y: 0.6 } }); } catch (e) {}
        alert('✅ ' + res.message);
      } else {
        alert('Không thể khởi tạo: ' + res.message);
      }
    } catch (e: any) {
      alert('Lỗi kết nối: ' + (e?.message || e));
    } finally {
      setIsCheckingSecuritySheet(false);
    }
  };

  const handleResetEventConfigDefault = () => {
    if (confirm('Bạn có chắc muốn khôi phục toàn bộ thông tin sự kiện về mặc định ban đầu?')) {
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

  const handleResetToDefault = async () => {
    if (currentUserRole !== 'admin') return;
    const pinConfirm = prompt('Nhập mã PIN Admin hiện tại để xác nhận khôi phục mã PIN hệ thống về mặc định:');
    if (!pinConfirm) return;

    setIsUpdatingPins(true);
    try {
      const res = await updatePinsViaBackend({
        currentAdminPin: pinConfirm.trim(),
        newAdminPin: '8888',
        newTreasurerPin: '6868',
        newBllPin: '2006'
      }, appsScriptUrl);

      if (res.success) {
        localStorage.removeItem('k8a1_admin_pin');
        localStorage.removeItem('k8a1_treasurer_pin');
        localStorage.removeItem('k8a1_bll_pin');
        alert('Đã khôi phục cài đặt mã PIN về mặc định thành công!');
      } else {
        alert('Khôi phục thất bại: ' + res.message);
      }
    } catch (e: any) {
      alert('Lỗi kết nối: ' + (e?.message || e));
    } finally {
      setIsUpdatingPins(false);
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
      const adminPin = getAdminPinToken();
      const pinQuery = adminPin ? `&pin=${encodeURIComponent(adminPin)}` : '';
      const res = await fetch(`${target}?action=get_all_data${pinQuery}&t=${Date.now()}`);
      const json = await res.json();
      if (json && json.status === 'success') {
        const rsvpCount = json.data?.rsvp?.length ?? 0;
        const wishesCount = json.data?.wishes?.length ?? 0;
        const hasConfig = !!json.data?.config;
        const hasMedia = !!json.data?.media;
        setConnectionTestResult({
          success: true,
          message: `Kết nối thành công! Đã đồng bộ dữ liệu (${rsvpCount} điểm danh, ${wishesCount} lời chúc${hasConfig ? ', Cấu hình: OK' : ''}${hasMedia ? ', Media: OK' : ''}).`
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
    if (!confirm('Hệ thống sẽ quét và tự động gộp các bản ghi cùng SĐT / Họ Tên thành 1 bản ghi chính xác nhất và xóa các dòng thừa. Bạn có muốn tiếp tục?')) {
      return;
    }

    setIsCleaningDuplicates(true);
    try {
      const adminPin = getAdminPinToken();
      const pinQuery = adminPin ? `&pin=${encodeURIComponent(adminPin)}` : '';
      const res = await fetch(`${target}?action=deduplicate_rsvp${pinQuery}&t=${Date.now()}`);
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

  const [isSyncingRosterToRsvp, setIsSyncingRosterToRsvp] = useState(false);
  const handleSyncRosterToRsvp = async () => {
    const target = (scriptUrlInput || appsScriptUrl || '').trim();
    if (!target || !target.startsWith('http')) {
      alert('Vui lòng nhập URL Google Apps Script Web App trong tab Cấu Hình trước!');
      return;
    }
    if (!confirm('Hệ thống sẽ quét toàn bộ Sheet Điểm Danh, tự động so khớp với Danh Bạ 65 học sinh K8A1 và điền chuẩn Mã TV (Cột 17) kèm đồng bộ chuẩn Họ tên, SĐT, Size áo. Bạn có muốn thực hiện ngay?')) {
      return;
    }

    setIsSyncingRosterToRsvp(true);
    try {
      const adminPin = getAdminPinToken();
      const pinQuery = adminPin ? `&pin=${encodeURIComponent(adminPin)}` : '';
      const res = await fetch(`${target}?action=sync_roster_to_rsvp${pinQuery}&t=${Date.now()}`);
      const data = await res.json();
      if (data && data.status === 'success') {
        alert(data.message || 'Đã quét và đồng bộ dữ liệu Danh Bạ sang Điểm Danh thành công!');
        if (onRefreshData) onRefreshData();
      } else {
        alert(data.message || 'Không thể đồng bộ lúc này.');
      }
    } catch (err: any) {
      alert('Lỗi kết nối khi đồng bộ danh bạ: ' + (err.message || 'Vui lòng kiểm tra lại'));
    } finally {
      setIsSyncingRosterToRsvp(false);
    }
  };

  const [isSyncingSizesToRoster, setIsSyncingSizesToRoster] = useState(false);
  const handleSyncRsvpSizesToRoster = async () => {
    const target = (scriptUrlInput || appsScriptUrl || '').trim();
    if (!target || !target.startsWith('http')) {
      alert('Vui lòng nhập URL Google Apps Script Web App trong tab Cấu Hình trước!');
      return;
    }
    if (!confirm('Hệ thống sẽ quét toàn bộ Sheet Điểm Danh, tự động lưu giữ Size Áo của các bạn đã chọn về Sheet Danh Sách Lớp (65 thành viên) để lưu trữ sử dụng lâu dài cho các kỳ họp sau. Bạn có muốn thực hiện ngay?')) {
      return;
    }

    setIsSyncingSizesToRoster(true);
    try {
      const adminPin = getAdminPinToken();
      const pinQuery = adminPin ? `&pin=${encodeURIComponent(adminPin)}` : '';
      const res = await fetch(`${target}?action=sync_rsvp_to_roster${pinQuery}&t=${Date.now()}`);
      const data = await res.json();
      if (data && data.status === 'success') {
        alert(data.message || 'Đã đồng bộ thành công Size Áo về Danh Sách Lớp!');
        if (onRefreshData) onRefreshData();
      } else {
        alert(data.message || 'Không thể đồng bộ lúc này.');
      }
    } catch (err: any) {
      alert('Lỗi kết nối khi đồng bộ size áo: ' + (err.message || 'Vui lòng kiểm tra lại'));
    } finally {
      setIsSyncingSizesToRoster(false);
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

      const matchShirt = 
        memberShirtFilter === 'all' ||
        (memberShirtFilter === 'unselected' ? !normalizeShirtSize(item.shirtSize) : normalizeShirtSize(item.shirtSize) === normalizeShirtSize(memberShirtFilter));

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

      const isAbsent = item.status === 'no';
      const matchFundStatus =
        fundStatusFilter === 'all' ||
        (fundStatusFilter === 'paid' && isPaid) ||
        (fundStatusFilter === 'unpaid' && !isPaid && item.status === 'yes' && item.fundStatus !== 'exempt') ||
        (fundStatusFilter === 'absent' && isAbsent) ||
        (fundStatusFilter === 'pending' && item.fundStatus === 'pending') ||
        (fundStatusFilter === 'extra' && isPaid && ((item.status === 'yes' && (item.fundAmount || 0) > standardFundAmount) || (item.status === 'no' && (item.fundAmount || 0) > 0))) ||
        (fundStatusFilter === 'has_receipt' && hasReceipt) ||
        (fundStatusFilter === 'no_receipt' && !hasReceipt && isPaid) ||
        (fundStatusFilter === 'bank_transfer' && (item.fundPaymentMethod === 'bank_transfer' || !item.fundPaymentMethod)) ||
        (fundStatusFilter === 'cash' && item.fundPaymentMethod === 'cash');

      // Check date filter
      const paymentDate = item.fundPaidAt || item.submittedAt || (isPaid ? '2026-09-01' : undefined);
      const matchDate = isDateInFilter(paymentDate, fundDateFilter, fundCustomStartDate, fundCustomEndDate);

      return matchQuery && matchFundStatus && matchDate;
    });
  }, [rsvpList, fundSearch, fundStatusFilter, fundDateFilter, fundCustomStartDate, fundCustomEndDate, isDateInFilter, standardFundAmount]);

  const filteredFundCollected = useMemo(() => {
    return filteredFundList.reduce((sum, item) => {
      if (item.fundStatus === 'paid') {
        return sum + (item.fundAmount !== undefined ? item.fundAmount : standardFundAmount);
      }
      return sum;
    }, 0);
  }, [filteredFundList, standardFundAmount]);

  if (!isOpen) return null;

  // ===========================================================================
  // SCREEN 1: 4-DIGIT PIN AUTHENTICATION MODAL (FOR GUEST ROLE FALLBACK)
  // ===========================================================================
  if (currentUserRole === 'guest') {
    return (
      <PinAuthModal
        isOpen={isOpen}
        onClose={onClose}
        onSuccess={onLoginSuccess}
        appsScriptUrl={appsScriptUrl}
      />
    );
  }

  // ===========================================================================
  // SCREEN 2: MAIN MANAGEMENT HUB (WHEN AUTHENTICATED AS ADMIN, TREASURER OR BLL)
  // ===========================================================================

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md overflow-hidden">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="bg-[#FAF9F5] text-[#1E293B] w-full max-w-5xl h-full sm:h-[92vh] sm:max-h-[850px] rounded-none sm:rounded-2xl border-0 sm:border-2 border-amber-500/60 shadow-2xl flex flex-col overflow-hidden"
      >
        {/* =================================================================== */}
        {/* TOP HEADER BAR */}
        {/* =================================================================== */}
        <header className="bg-gradient-to-r from-[#1E293B] via-[#0F172A] to-[#1E293B] text-white px-3 sm:px-5 py-1.5 sm:py-2.5 border-b border-amber-500/30 flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <img 
              src="https://thpttn.tnue.edu.vn/upload/doantn/logo%20thpttn.jpg"
              alt="Logo Trường THPT Thái Nguyên"
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover bg-white p-0.5 border border-amber-400/60 shadow-xs shrink-0"
              onError={(e: any) => {
                e.target.src = '/logo-thpt-thai-nguyen.jpg';
              }}
            />
            <div className={`p-1 sm:p-1.5 rounded-lg flex items-center justify-center shadow-inner ${
              isAdmin 
                ? 'bg-gradient-to-br from-amber-500 to-amber-700 text-white' 
                : isTreasurer
                ? 'bg-gradient-to-br from-emerald-600 to-teal-700 text-white'
                : 'bg-gradient-to-br from-indigo-600 to-blue-700 text-white'
            }`}>
              {isAdmin ? <Crown className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : isTreasurer ? <Coins className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h2 className="text-xs sm:text-base font-serif font-bold text-amber-200 leading-tight">
                <span className="sm:hidden">Quản Trị K8A1</span>
                <span className="hidden sm:inline">Trung Tâm Quản Trị & Điều Hành K8A1</span>
              </h2>
              <span className={`px-1.5 sm:px-2 py-0.2 sm:py-0.5 rounded-full text-[8px] sm:text-[9px] font-sans font-bold uppercase tracking-wider shrink-0 ${
                isAdmin 
                  ? 'bg-amber-400 text-amber-950 shadow-xs' 
                  : isTreasurer
                  ? 'bg-emerald-400 text-emerald-950 shadow-xs'
                  : 'bg-indigo-300 text-indigo-950 shadow-xs'
              }`}>
                {isAdmin ? '👑 ADMIN' : isTreasurer ? '💰 THỦ QUỸ' : '🛡️ BLL'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-1.5">
            {onOpenGuideModal && (
              <button
                type="button"
                onClick={onOpenGuideModal}
                className="flex items-center gap-1 p-1.5 sm:px-2.5 sm:py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 text-xs font-sans font-bold rounded-lg border border-amber-400/40 transition cursor-pointer"
                title="Mở Cẩm nang hoạt động & Hướng dẫn nghiệp vụ K8A1"
              >
                <HelpCircle className="w-3.5 h-3.5 text-amber-300" />
                <span className="hidden sm:inline">Cẩm Nang</span>
              </button>
            )}

            {onRefreshData && (
              <button
                onClick={onRefreshData}
                className="hidden sm:flex items-center gap-1 px-2.5 py-1 bg-white/10 hover:bg-white/20 text-amber-200 text-xs font-sans font-bold rounded-lg border border-amber-400/30 transition cursor-pointer"
                title="Làm mới dữ liệu mới nhất"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Làm Mới</span>
              </button>
            )}

            <button
              onClick={onLogout}
              className="flex items-center gap-1 p-1.5 sm:px-2.5 sm:py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 text-xs font-sans font-bold rounded-lg border border-rose-500/40 transition cursor-pointer"
              title="Đăng xuất khỏi phiên làm việc"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Khóa PIN</span>
            </button>

            <button
              onClick={onClose}
              className="p-1 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition cursor-pointer ml-0.5"
              title="Đóng bảng điều khiển"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* =================================================================== */}
        {/* NAVIGATION TABS */}
        {/* =================================================================== */}
        <div className="bg-white border-b border-amber-200 px-2 sm:px-5 flex items-center gap-1 sm:gap-1.5 overflow-x-auto shrink-0 py-1 sm:py-1.5 no-scrollbar">
          <button
            onClick={() => setActiveTab('members')}
            className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs font-sans font-bold flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'members'
                ? 'bg-[#1E293B] text-amber-300 shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Users className="w-3.5 h-3.5 shrink-0" />
            <span className="sm:hidden">1. Thành viên</span>
            <span className="hidden sm:inline">1. Điểm Danh & Thành Viên</span>
          </button>

          <button
            onClick={() => setActiveTab('fund')}
            className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs font-sans font-bold flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'fund'
                ? 'bg-[#1E293B] text-amber-300 shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Receipt className="w-3.5 h-3.5 shrink-0" />
            <span className="sm:hidden">2. Quỹ lớp</span>
            <span className="hidden sm:inline">2. Thu & Chi Quỹ Lớp</span>
            {canAuditAndSpend ? (
              <span className="text-[9px] bg-emerald-700 text-emerald-100 px-1.5 py-0.2 rounded font-mono hidden sm:inline">Thủ Quỹ 💰</span>
            ) : (
              <span className="text-[9px] bg-indigo-800 text-indigo-200 px-1.5 py-0.2 rounded font-mono hidden sm:inline">Giám Sát 👁️</span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('teachers')}
            className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs font-sans font-bold flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'teachers'
                ? 'bg-[#1E293B] text-amber-300 shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5 shrink-0" />
            <span className="sm:hidden">3. Thầy cô ({effectiveTeachers.length})</span>
            <span className="hidden sm:inline">3. Quý Thầy Cô ({effectiveTeachers.length})</span>
            {teacherStats.attending > 0 && (
              <span className="text-[9px] bg-emerald-700 text-emerald-100 px-1.5 py-0.2 rounded font-mono hidden sm:inline">
                {teacherStats.attending} tham dự
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('wishes')}
            className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs font-sans font-bold flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'wishes'
                ? 'bg-[#1E293B] text-amber-300 shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 shrink-0" />
            <span className="sm:hidden">4. Lưu bút</span>
            <span className="hidden sm:inline">4. Lưu Bút & Lời Chúc</span>
          </button>

          <button
            onClick={() => setActiveTab('media')}
            className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs font-sans font-bold flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'media'
                ? 'bg-[#1E293B] text-amber-300 shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Video className="w-3.5 h-3.5 shrink-0" />
            <span className="sm:hidden">5. Media</span>
            <span className="hidden sm:inline">5. Ảnh Bìa, Video & Gallery</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs font-sans font-bold flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'settings'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-amber-900 hover:bg-amber-100/70 bg-amber-50/50'
            }`}
          >
            <Settings className="w-3.5 h-3.5 shrink-0" />
            <span className="sm:hidden">6. Cài đặt</span>
            <span className="hidden sm:inline">6. Cấu Hình & Cài Đặt</span>
            {isAdmin ? (
              <span className="text-[9px] bg-amber-800 text-amber-200 px-1.5 py-0.2 rounded font-mono hidden sm:inline">Admin 👑</span>
            ) : isTreasurer ? (
              <span className="text-[9px] bg-emerald-700 text-emerald-100 px-1.5 py-0.2 rounded font-mono hidden sm:inline">Thủ Quỹ 💰</span>
            ) : (
              <span className="text-[9px] bg-indigo-700 text-indigo-100 px-1.5 py-0.2 rounded font-mono hidden sm:inline">BLL 🛡️</span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('presentation')}
            className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs font-sans font-bold flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'presentation'
                ? 'bg-gradient-to-r from-purple-700 to-indigo-700 text-white shadow-sm'
                : 'text-purple-900 hover:bg-purple-100/70 bg-purple-50/50 border border-purple-200/60'
            }`}
          >
            <Tv className="w-3.5 h-3.5 shrink-0 text-purple-500" />
            <span className="sm:hidden">7. Màn LED</span>
            <span className="hidden sm:inline">7. Màn LED & Nhạc Nền</span>
            <span className="text-[9px] bg-purple-900/60 text-purple-200 px-1.5 py-0.2 rounded font-mono hidden sm:inline">Sân Khấu 🎬</span>
          </button>
        </div>

        {/* =================================================================== */}
        {/* TAB BODY CONTAINER */}
        {/* =================================================================== */}
        <div className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-2.5 sm:space-y-3">

          {/* --------------------------------------------------------------- */}
          {/* TAB 1: MEMBER MANAGEMENT */}
          {/* --------------------------------------------------------------- */}
          {activeTab === 'members' && (
            <div className="space-y-2.5">
              {/* Header Sub-navigation: Sĩ Số Toàn Lớp vs Phản Hồi Web */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-2 bg-gradient-to-r from-amber-50 to-orange-50/50 border border-amber-200 p-1.5 sm:p-2 rounded-xl shadow-2xs">
                <div className="flex items-center gap-1 sm:gap-1.5 bg-white p-1 rounded-lg border border-amber-200/80 shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setMemberTabSubView('roster')}
                    className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-md text-xs font-sans font-bold transition cursor-pointer shrink-0 ${
                      memberTabSubView === 'roster'
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'text-slate-700 hover:bg-amber-50'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5 shrink-0" />
                    <span className="sm:hidden">Sĩ số ({rosterList.length})</span>
                    <span className="hidden sm:inline">Sĩ Số Lớp K8A1 ({rosterList.length} bạn)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMemberTabSubView('rsvp')}
                    className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-md text-xs font-sans font-bold transition cursor-pointer shrink-0 ${
                      memberTabSubView === 'rsvp'
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'text-slate-700 hover:bg-amber-50'
                    }`}
                  >
                    <UserCheck className="w-3.5 h-3.5 shrink-0" />
                    <span className="sm:hidden">Web ({rsvpList.length})</span>
                    <span className="hidden sm:inline">Phản Hồi Web ({rsvpList.length})</span>
                  </button>
                </div>

                <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-sans text-amber-900 pr-1 sm:pr-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>
                    Có mặt: <strong className="text-emerald-700 font-bold">{rosterConfirmedCount}</strong> / {rosterList.length} bạn
                    <span className="text-slate-500 font-mono ml-1">({Math.round((rosterConfirmedCount / (rosterList.length || 1)) * 100)}%)</span>
                  </span>
                </div>
              </div>

              {/* ======================================================== */}
              {/* SUBVIEW 1: SĨ SỐ TOÀN LỚP (DANH BẠ 40 BẠN HỌC K8A1) */}
              {/* ======================================================== */}
              {memberTabSubView === 'roster' && (
                <div className="space-y-2.5">
                  {/* Thanh công cụ quản trị & Lọc trạng thái 1-chạm (Interactive Filter Chips) */}
                  <div className="bg-white p-2 sm:p-2.5 rounded-xl border border-amber-200 shadow-2xs space-y-2">
                    {/* Hàng 1: Ô tìm kiếm + Các nút tác vụ (Thêm bạn, Đồng bộ Sheet) */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-2.5">
                      <div className="relative flex-1">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={memberSearch}
                          onChange={(e) => setMemberSearch(e.target.value)}
                          placeholder="Tìm trong danh bạ (Tên, Biệt danh, Chức vụ, SĐT)..."
                          className="w-full pl-9 pr-8 py-1.5 bg-[#FAF8F5] border border-slate-300 rounded-lg text-xs font-sans focus:outline-none focus:border-amber-500"
                        />
                        {memberSearch && (
                          <button
                            type="button"
                            onClick={() => setMemberSearch('')}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 flex-wrap shrink-0">
                        <button
                          onClick={handleOpenAddRosterMember}
                          className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white text-xs font-sans font-bold rounded-lg shadow-sm transition cursor-pointer shrink-0"
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                          <span>+ Thêm Bạn Mới</span>
                        </button>

                        {onRefreshData && (
                          <button
                            type="button"
                            onClick={onRefreshData}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-lg font-bold text-xs transition shadow-2xs cursor-pointer"
                            title="Tải lại dữ liệu mới nhất"
                          >
                            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                            <span className="hidden sm:inline">Tải lại</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={handleForceSyncRoster}
                          disabled={isRosterSyncing}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold text-xs transition shadow-xs cursor-pointer disabled:opacity-50"
                          title="Lưu toàn bộ danh bạ hiện tại lên hệ thống"
                        >
                          <Save className={`w-3.5 h-3.5 ${isRosterSyncing ? 'animate-spin' : ''}`} />
                          <span>{isRosterSyncing ? 'Đang lưu...' : 'Lưu Danh Bạ'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Hàng 2: Các nút lọc tương tác thay thế 4 thẻ tĩnh (Filter Chips 1-Chạm) */}
                    <div className="flex flex-wrap items-center justify-between gap-1.5 pt-1.5 border-t border-slate-100">
                      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 max-w-full">
                        <button
                          type="button"
                          onClick={() => setRosterStatusFilter('all')}
                          className={`px-2.5 py-1 rounded-full text-xs font-sans font-bold transition cursor-pointer shrink-0 whitespace-nowrap ${
                            rosterStatusFilter === 'all'
                              ? 'bg-[#1E293B] text-amber-300 shadow-xs'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                          }`}
                        >
                          Tất cả ({rosterList.length})
                        </button>

                        <button
                          type="button"
                          onClick={() => setRosterStatusFilter('confirmed')}
                          className={`px-2.5 py-1 rounded-full text-xs font-sans font-bold transition cursor-pointer flex items-center gap-1 shrink-0 whitespace-nowrap ${
                            rosterStatusFilter === 'confirmed'
                              ? 'bg-emerald-700 text-white shadow-xs'
                              : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
                          }`}
                        >
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                          <span>Đã xác nhận ({rosterConfirmedCount})</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setRosterStatusFilter('declined')}
                          className={`px-2.5 py-1 rounded-full text-xs font-sans font-bold transition cursor-pointer flex items-center gap-1 shrink-0 whitespace-nowrap ${
                            rosterStatusFilter === 'declined'
                              ? 'bg-rose-700 text-white shadow-xs'
                              : 'bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200'
                          }`}
                        >
                          <XCircle className="w-3 h-3 text-rose-500" />
                          <span>Báo vắng ({rosterDeclinedCount})</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setRosterStatusFilter('pending')}
                          className={`px-2.5 py-1 rounded-full text-xs font-sans font-bold transition cursor-pointer flex items-center gap-1 shrink-0 whitespace-nowrap ${
                            rosterStatusFilter === 'pending'
                              ? 'bg-amber-600 text-white shadow-xs'
                              : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200'
                          }`}
                        >
                          <Clock className="w-3 h-3 text-amber-600" />
                          <span>Chưa phản hồi ({rosterPendingCount})</span>
                        </button>
                      </div>

                      {rosterFeedbackMsg && (
                        <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded animate-pulse shrink-0">
                          {rosterFeedbackMsg}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Roster Table */}
                  <div className="bg-white rounded-xl border border-amber-200 shadow-xs overflow-hidden">
                    <div className="overflow-x-auto overflow-y-auto max-h-[62vh] sm:max-h-[68vh] relative">
                      <table className="w-full text-left text-xs border-separate border-spacing-0">
                        <thead className="bg-[#F8F5EE] text-slate-600 font-sans uppercase text-[9px] sm:text-[10px] tracking-tight sm:tracking-wider">
                          <tr>
                            <th className="py-1.5 px-1 sm:py-2.5 sm:px-3 w-8 min-w-[32px] max-w-[32px] sm:w-10 sm:min-w-[40px] sm:max-w-[40px] text-center sticky top-0 left-0 z-30 bg-[#F8F5EE] border-b border-amber-200">STT</th>
                            <th className="py-1.5 px-1.5 sm:py-2.5 sm:px-3 min-w-[105px] sm:min-w-[160px] sticky top-0 left-8 sm:left-10 z-30 bg-[#F8F5EE] border-b border-r border-amber-200 shadow-[3px_0_6px_-2px_rgba(0,0,0,0.08)]">Bạn Học K8A1</th>
                            <th className="py-1.5 px-1.5 sm:py-2.5 sm:px-3 sticky top-0 z-20 bg-[#F8F5EE] border-b border-amber-200">Số Điện Thoại</th>
                            <th className="py-1.5 px-1.5 sm:py-2.5 sm:px-3 sticky top-0 z-20 bg-[#F8F5EE] border-b border-amber-200">Phản Hồi Tham Gia</th>
                            <th className="py-1.5 px-1.5 sm:py-2.5 sm:px-3 sticky top-0 z-20 bg-[#F8F5EE] border-b border-amber-200">Size Áo & Quỹ</th>
                            <th className="py-1.5 px-1.5 sm:py-2.5 sm:px-3 text-right sticky top-0 z-20 bg-[#F8F5EE] border-b border-amber-200">Thao Tác BLL</th>
                          </tr>
                        </thead>
                        <tbody className="font-sans">
                          {filteredRoster.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="py-8 text-center text-slate-400 italic font-serif">
                                Không tìm thấy bạn học nào khớp với bộ lọc.
                              </td>
                            </tr>
                          ) : (
                            filteredRoster.map((m) => (
                              <tr key={m.id} className="group hover:bg-amber-50/40 transition">
                                <td className="py-1 px-1 sm:py-2.5 sm:px-3 text-center text-slate-400 font-mono sticky left-0 z-10 bg-white group-hover:bg-[#FFF9EE] w-8 min-w-[32px] max-w-[32px] sm:w-10 sm:min-w-[40px] sm:max-w-[40px] border-b border-slate-100 text-[10px] sm:text-xs">
                                  {m.index}
                                </td>

                                <td className="py-1 px-1.5 sm:py-2.5 sm:px-3 sticky left-8 sm:left-10 z-10 bg-white group-hover:bg-[#FFF9EE] min-w-[105px] sm:min-w-[160px] border-b border-r border-amber-200/80 shadow-[3px_0_6px_-2px_rgba(0,0,0,0.08)]">
                                  <div className="font-bold text-slate-900 text-xs sm:text-sm leading-tight sm:leading-normal">
                                    {m.fullName}
                                  </div>
                                  <div className="flex items-center gap-1 text-[10px] sm:text-[11px] text-slate-500 mt-0.5">
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

                                <td className="py-1 px-1.5 sm:py-2.5 sm:px-3 font-mono text-slate-600 text-[11px] sm:text-xs border-b border-slate-100">
                                  {m.matchedRsvp?.phone || m.phone || <span className="text-slate-400 italic">Chưa có SĐT</span>}
                                </td>

                                <td className="py-1 px-1.5 sm:py-2.5 sm:px-3 border-b border-slate-100">
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

                                <td className="py-1 px-1.5 sm:py-2.5 sm:px-3 border-b border-slate-100">
                                  <div className="flex items-center gap-2">
                                    {normalizeShirtSize(m.matchedRsvp?.shirtSize || m.shirtSize) ? (
                                      <span className="inline-flex items-center gap-1 font-bold text-amber-900 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded text-[11px]">
                                        <Shirt className="w-3 h-3 text-amber-600" />
                                        <span>Size {normalizeShirtSize(m.matchedRsvp?.shirtSize || m.shirtSize)}</span>
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-800 bg-amber-100/90 border border-amber-300 px-1.5 py-0.5 rounded shadow-2xs">
                                        <Shirt className="w-3 h-3 text-amber-600" />
                                        <span>Chưa chọn size</span>
                                      </span>
                                    )}
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

                                <td className="py-1 px-1.5 sm:py-2.5 sm:px-3 text-right border-b border-slate-100">
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
                                       title={`Sửa thông tin bạn ${m.fullName}`}
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
                <div className="space-y-2.5">
                  {/* Controls Toolbar */}
                  <div className="bg-white p-2.5 rounded-xl border border-amber-200 shadow-2xs space-y-2">
                    {/* Hàng 1: Ô tìm kiếm, lọc size áo và các nút tác vụ */}
                    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5">
                      <div className="flex flex-1 items-center gap-2">
                        <div className="relative flex-1">
                          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            value={memberSearch}
                            onChange={(e) => setMemberSearch(e.target.value)}
                            placeholder="Tìm theo tên bạn, biệt danh, số điện thoại..."
                            className="w-full pl-9 pr-8 py-1.5 bg-[#FAF8F5] border border-slate-300 rounded-lg text-xs font-sans focus:outline-none focus:border-amber-500"
                          />
                          {memberSearch && (
                            <button
                              type="button"
                              onClick={() => setMemberSearch('')}
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        <select
                          value={memberShirtFilter}
                          onChange={(e) => setMemberShirtFilter(e.target.value)}
                          className="hidden sm:block px-2.5 py-1.5 bg-[#FAF8F5] border border-slate-300 rounded-lg text-xs font-sans focus:outline-none focus:border-amber-500 cursor-pointer"
                        >
                          <option value="all">Tất cả size áo</option>
                          <option value="unselected">⚠️ Chưa chọn size áo</option>
                          {SHIRT_SIZE_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>Size {opt.value} ({opt.weightHint})</option>
                          ))}
                        </select>
                      </div>

                      <div className="flex items-center gap-1.5 flex-wrap shrink-0">
                        <button
                          onClick={handleOpenAddMember}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white text-xs font-sans font-bold rounded-lg shadow-sm transition cursor-pointer"
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                          <span>+ Thêm Bạn Học</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleSyncRosterToRsvp}
                          disabled={isSyncingRosterToRsvp}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-sans font-bold rounded-lg transition cursor-pointer shadow-2xs disabled:opacity-50"
                          title="Quét toàn bộ sheet Điểm Danh, tự động ánh xạ và điền Mã TV từ Danh Bạ Lớp"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 text-emerald-600 ${isSyncingRosterToRsvp ? 'animate-spin' : ''}`} />
                          <span className="hidden sm:inline">{isSyncingRosterToRsvp ? 'Đang đồng bộ...' : 'Đồng Bộ Danh Bạ'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleSyncRsvpSizesToRoster}
                          disabled={isSyncingSizesToRoster}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-300 text-blue-900 text-xs font-sans font-bold rounded-lg transition cursor-pointer shadow-2xs disabled:opacity-50"
                          title="Quét toàn bộ sheet Điểm Danh, lưu giữ size may áo của thành viên về Danh Sách Lớp lâu dài"
                        >
                          <Shirt className={`w-3.5 h-3.5 text-blue-600 ${isSyncingSizesToRoster ? 'animate-spin' : ''}`} />
                          <span className="hidden sm:inline">{isSyncingSizesToRoster ? 'Đang lưu...' : 'Lưu Size Về Danh Bạ'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleCleanDuplicates}
                          disabled={isCleaningDuplicates}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 text-xs font-sans font-bold rounded-lg transition cursor-pointer shadow-2xs disabled:opacity-50"
                          title="Quét và lọc tự động các bản ghi trùng lặp"
                        >
                          <Sparkles className={`w-3.5 h-3.5 text-amber-600 ${isCleaningDuplicates ? 'animate-spin' : ''}`} />
                          <span className="hidden sm:inline">{isCleaningDuplicates ? 'Đang lọc...' : 'Dọn Trùng'}</span>
                        </button>

                        <button
                          onClick={handleExportRsvpCsv}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-sans font-bold rounded-lg transition cursor-pointer"
                          title="Xuất file danh sách điểm danh Excel/CSV"
                        >
                          <Download className="w-3.5 h-3.5 text-slate-500" />
                          <span className="hidden sm:inline">Xuất CSV</span>
                        </button>
                      </div>
                    </div>

                    {/* Hàng 2: Filter Chips trạng thái tham gia */}
                    <div className="flex items-center gap-1.5 pt-1.5 border-t border-slate-100 overflow-x-auto no-scrollbar py-0.5">
                      <button
                        type="button"
                        onClick={() => setMemberStatusFilter('all')}
                        className={`px-2.5 py-1 rounded-full text-xs font-sans font-bold transition cursor-pointer shrink-0 whitespace-nowrap ${
                          memberStatusFilter === 'all'
                            ? 'bg-[#1E293B] text-amber-300 shadow-xs'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        Tất cả ({rsvpList.length})
                      </button>

                      <button
                        type="button"
                        onClick={() => setMemberStatusFilter('yes')}
                        className={`px-2.5 py-1 rounded-full text-xs font-sans font-bold transition cursor-pointer flex items-center gap-1 shrink-0 whitespace-nowrap ${
                          memberStatusFilter === 'yes'
                            ? 'bg-emerald-700 text-white shadow-xs'
                            : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}
                      >
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        <span>Có mặt ({confirmedCount})</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setMemberStatusFilter('checkedIn')}
                        className={`px-2.5 py-1 rounded-full text-xs font-sans font-bold transition cursor-pointer flex items-center gap-1 shrink-0 whitespace-nowrap ${
                          memberStatusFilter === 'checkedIn'
                            ? 'bg-blue-700 text-white shadow-xs'
                            : 'bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200'
                        }`}
                      >
                        <UserCheck className="w-3 h-3 text-blue-500" />
                        <span>Đã check-in ({checkedInCount})</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setMemberStatusFilter('notCheckedIn')}
                        className={`px-2.5 py-1 rounded-full text-xs font-sans font-bold transition cursor-pointer flex items-center gap-1 shrink-0 whitespace-nowrap ${
                          memberStatusFilter === 'notCheckedIn'
                            ? 'bg-amber-600 text-white shadow-xs'
                            : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200'
                        }`}
                      >
                        <Clock className="w-3 h-3 text-amber-600" />
                        <span>Chưa check-in ({confirmedCount - checkedInCount})</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setMemberStatusFilter('no')}
                        className={`px-2.5 py-1 rounded-full text-xs font-sans font-bold transition cursor-pointer flex items-center gap-1 shrink-0 whitespace-nowrap ${
                          memberStatusFilter === 'no'
                            ? 'bg-rose-700 text-white shadow-xs'
                            : 'bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200'
                        }`}
                      >
                        <XCircle className="w-3 h-3 text-rose-500" />
                        <span>Vắng mặt ({declinedCount})</span>
                      </button>
                    </div>
                  </div>

              {/* Members Table */}
              <div className="bg-white rounded-xl border border-amber-200 shadow-xs overflow-hidden">
                <div className="overflow-x-auto overflow-y-auto max-h-[62vh] sm:max-h-[68vh] relative">
                  <table className="w-full text-left text-xs border-separate border-spacing-0">
                    <thead className="bg-[#F8F5EE] text-slate-600 font-sans uppercase text-[9px] sm:text-[10px] tracking-tight sm:tracking-wider">
                      <tr>
                        <th className="py-1.5 px-1 sm:py-2.5 sm:px-3 w-8 min-w-[32px] max-w-[32px] sm:w-10 sm:min-w-[40px] sm:max-w-[40px] text-center sticky top-0 left-0 z-30 bg-[#F8F5EE] border-b border-amber-200">STT</th>
                        <th className="py-1.5 px-1.5 sm:py-2.5 sm:px-3 min-w-[105px] sm:min-w-[160px] sticky top-0 left-8 sm:left-10 z-30 bg-[#F8F5EE] border-b border-r border-amber-200 shadow-[3px_0_6px_-2px_rgba(0,0,0,0.08)]">Họ và Tên</th>
                        <th className="py-1.5 px-1.5 sm:py-2.5 sm:px-3 sticky top-0 z-20 bg-[#F8F5EE] border-b border-amber-200">Số Điện Thoại</th>
                        <th className="py-1.5 px-1.5 sm:py-2.5 sm:px-3 sticky top-0 z-20 bg-[#F8F5EE] border-b border-amber-200">Size Áo</th>
                        <th className="py-1.5 px-1.5 sm:py-2.5 sm:px-3 sticky top-0 z-20 bg-[#F8F5EE] border-b border-amber-200">Điểm Danh Đến</th>
                        <th className="py-1.5 px-1.5 sm:py-2.5 sm:px-3 sticky top-0 z-20 bg-[#F8F5EE] border-b border-amber-200">Quỹ {standardFundAmount.toLocaleString('vi-VN')}đ</th>
                        <th className="py-1.5 px-1.5 sm:py-2.5 sm:px-3 text-right sticky top-0 z-20 bg-[#F8F5EE] border-b border-amber-200">Thao Tác</th>
                      </tr>
                    </thead>
                    <tbody className="font-sans">
                      {filteredMemberList.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-slate-400 italic font-serif">
                            Không tìm thấy bạn học nào khớp với bộ lọc tìm kiếm.
                          </td>
                        </tr>
                      ) : (
                        filteredMemberList.map((item, idx) => (
                          <tr key={item.id || item.phone} className="group hover:bg-amber-50/40 transition">
                            <td className="py-1 px-1 sm:py-2.5 sm:px-3 text-center text-slate-400 font-mono sticky left-0 z-10 bg-white group-hover:bg-[#FFF9EE] w-8 min-w-[32px] max-w-[32px] sm:w-10 sm:min-w-[40px] sm:max-w-[40px] border-b border-slate-100 text-[10px] sm:text-xs">
                              {idx + 1}
                            </td>

                            <td className="py-1 px-1.5 sm:py-2.5 sm:px-3 sticky left-8 sm:left-10 z-10 bg-white group-hover:bg-[#FFF9EE] min-w-[105px] sm:min-w-[160px] border-b border-r border-amber-200/80 shadow-[3px_0_6px_-2px_rgba(0,0,0,0.08)]">
                              <div className="flex items-center gap-2">
                                <div className="font-bold text-slate-900 text-xs sm:text-sm leading-tight sm:leading-normal">
                                  {item.fullName}
                                </div>
                                {item.memberId && (
                                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-100 text-amber-900 border border-amber-300" title="Mã thành viên danh bạ lớp">
                                    {item.memberId}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1 text-[10px] sm:text-[11px] text-slate-500 mt-0.5">
                                {item.nickname && (
                                  <span className="text-amber-800 italic">“{item.nickname}”</span>
                                )}
                                <span className="bg-slate-100 px-1.5 py-0.2 rounded text-[10px] font-mono">
                                  {item.className || 'K8A1'}
                                </span>
                              </div>
                            </td>

                            <td className="py-1 px-1.5 sm:py-2.5 sm:px-3 font-mono text-slate-600 text-[11px] sm:text-xs border-b border-slate-100">
                              {item.phone}
                            </td>

                            <td className="py-1 px-1.5 sm:py-2.5 sm:px-3 border-b border-slate-100">
                              {normalizeShirtSize(item.shirtSize) ? (
                                <span className="inline-flex items-center gap-1 font-bold text-amber-900 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded text-[11px]">
                                  <Shirt className="w-3 h-3 text-amber-600" />
                                  <span>Size {normalizeShirtSize(item.shirtSize)}</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-800 bg-amber-100/90 border border-amber-300 px-1.5 py-0.5 rounded shadow-2xs">
                                  <Shirt className="w-3 h-3 text-amber-600" />
                                  <span>Chưa chọn size</span>
                                </span>
                              )}
                            </td>

                            <td className="py-1 px-1.5 sm:py-2.5 sm:px-3 border-b border-slate-100">
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

                            <td className="py-1 px-1.5 sm:py-2.5 sm:px-3 border-b border-slate-100">
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
                                    <span>Đã nộp {(item.fundAmount || standardFundAmount).toLocaleString('vi-VN')}đ</span>
                                  </>
                                ) : (
                                  <>
                                    <Clock className="w-3 h-3 text-amber-600" />
                                    <span>Chưa nộp</span>
                                  </>
                                )}
                              </button>
                            </td>

                            <td className="py-1 px-1.5 sm:py-2.5 sm:px-3 text-right border-b border-slate-100">
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
              {/* Giám Sát BLL Info Banner */}
              {!canAuditAndSpend && (
                <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4 flex items-center justify-between gap-3 text-xs text-indigo-900 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0 text-lg">
                      👁️
                    </div>
                    <div>
                      <h4 className="font-bold text-indigo-950 text-sm">Chế độ Giám Sát Ban Liên Lạc</h4>
                      <p className="text-indigo-700 text-xs mt-0.5">
                        Bạn đang xem toàn bộ sổ thu - chi và hóa đơn chứng từ với vai trò Ban Liên Lạc. Thẩm quyền đối soát duyệt bill và nhập khoản chi quỹ thuộc về <strong>Thủ Quỹ</strong> hoặc Admin.
                      </p>
                    </div>
                  </div>
                  <span className="shrink-0 px-2.5 py-1 bg-indigo-100 text-indigo-800 border border-indigo-200 rounded-lg font-mono font-bold text-[11px] hidden sm:inline-block">
                    Chỉ Đọc (Read-Only)
                  </span>
                </div>
              )}

              {/* Thanh Tóm Tắt Tài Chính & Tiến Độ Hợp Nhất (Single Ultra-Compact Financial Bar) */}
              <div className="bg-[#181512] text-white px-3.5 py-2 rounded-xl border border-amber-400/30 shadow-xs flex flex-wrap items-center justify-between gap-2.5 text-xs font-sans">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400 text-[11px]">Đã Thu:</span>
                    <span className="font-mono font-bold text-emerald-400 text-xs sm:text-sm">
                      {collectedFund.toLocaleString('vi-VN')} đ
                    </span>
                    <span className="text-[10px] text-slate-400">({paidMembersCount} bạn)</span>
                  </div>

                  <span className="text-slate-600 hidden sm:inline">•</span>

                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400 text-[11px]">Đã Chi:</span>
                    <span className="font-mono font-bold text-rose-400 text-xs sm:text-sm">
                      {totalExpense.toLocaleString('vi-VN')} đ
                    </span>
                    <span className="text-[10px] text-slate-400">({effectiveExpenses.length} khoản)</span>
                  </div>

                  <span className="text-slate-600 hidden sm:inline">•</span>

                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400 text-[11px]">Dư Quỹ:</span>
                    <span className={`font-mono font-bold text-xs sm:text-sm ${fundBalance >= 0 ? 'text-amber-300' : 'text-rose-400'}`}>
                      {fundBalance.toLocaleString('vi-VN')} đ
                    </span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                      fundBalance >= 0 
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    }`}>
                      {fundBalance >= 0 ? '✓ Thặng Dư' : '⚠️ Cần Thu Thêm'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="hidden md:flex items-center gap-1.5 text-[11px] text-slate-300">
                    <span>Tiến độ: <strong className="text-emerald-300">{paidMembersCount}/{confirmedCount}</strong> ({expectedFund > 0 ? Math.round((collectedFund / expectedFund) * 100) : 0}%)</span>
                    <div className="w-16 bg-slate-700 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-emerald-500 h-full rounded-full"
                        style={{ width: `${expectedFund > 0 ? Math.min(100, Math.round((collectedFund / expectedFund) * 100)) : 0}%` }}
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleExportFundCsv}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-400/40 text-[11px] font-sans font-semibold rounded-lg transition cursor-pointer"
                    title="Xuất cả Sổ Thu và Sổ Chi ra file Excel/CSV"
                  >
                    <Download className="w-3 h-3" />
                    <span>Xuất CSV</span>
                  </button>
                </div>
              </div>

              {/* Sub-Tab Navigation Hợp Nhất */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200 pb-1.5">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    type="button"
                    onClick={() => {
                      setFundSubTab('income');
                      setFundIncomeViewMode('rsvp_members');
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-sans font-bold flex items-center gap-1.5 transition cursor-pointer ${
                      fundSubTab === 'income' && fundIncomeViewMode === 'rsvp_members'
                        ? 'bg-amber-700 text-white shadow-xs'
                        : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>1. Đối Soát Thành Viên</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      fundSubTab === 'income' && fundIncomeViewMode === 'rsvp_members' ? 'bg-amber-800 text-white' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {paidConfirmedCount}/{confirmedCount}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setFundSubTab('income');
                      setFundIncomeViewMode('income_ledger');
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-sans font-bold flex items-center gap-1.5 transition cursor-pointer ${
                      fundSubTab === 'income' && fundIncomeViewMode === 'income_ledger'
                        ? 'bg-emerald-700 text-white shadow-xs'
                        : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    <Coins className="w-3.5 h-3.5" />
                    <span>2. Sổ Thu Chi Tiết</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      fundSubTab === 'income' && fundIncomeViewMode === 'income_ledger' ? 'bg-emerald-800 text-white' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {effectiveIncomes.length}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFundSubTab('expense')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-sans font-bold flex items-center gap-1.5 transition cursor-pointer ${
                      fundSubTab === 'expense'
                        ? 'bg-rose-700 text-white shadow-xs'
                        : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    <Receipt className="w-3.5 h-3.5" />
                    <span>3. Chi Tiêu Lớp</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      fundSubTab === 'expense' ? 'bg-rose-800 text-white' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {effectiveExpenses.length} khoản
                    </span>
                  </button>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                  {fundSubTab === 'income' && (
                    canAuditAndSpend ? (
                      <button
                        type="button"
                        onClick={() => handleOpenAddIncome()}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white text-xs font-sans font-bold rounded-lg shadow-xs transition cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>+ Thêm Khoản Thu Mới</span>
                      </button>
                    ) : (
                      <span className="text-xs text-indigo-700 font-sans italic px-2.5 py-1 bg-indigo-50 rounded-lg border border-indigo-100 flex items-center gap-1.5">
                        👁️ Quyền thu quỹ: Thủ Quỹ
                      </span>
                    )
                  )}

                  {fundSubTab === 'expense' && (
                    canAuditAndSpend ? (
                      <button
                        type="button"
                        onClick={() => handleOpenAddExpense()}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white text-xs font-sans font-bold rounded-lg shadow-xs transition cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>+ Thêm Khoản Chi Mới</span>
                      </button>
                    ) : (
                      <span className="text-xs text-indigo-700 font-sans italic px-2.5 py-1 bg-indigo-50 rounded-lg border border-indigo-100 flex items-center gap-1.5">
                        👁️ Quyền chi quỹ: Thủ Quỹ
                      </span>
                    )
                  )}
                </div>
              </div>

              {/* ------------------------------------------------------------- */}
              {/* PHÂN HỆ 1: THU QUỸ (BẠN BÈ ĐÓNG) */}
              {/* ------------------------------------------------------------- */}
              {fundSubTab === 'income' && (
                <div className="space-y-3">

                  {/* ------------------------------------------------------------- */}
                  {/* VIEW 1: ĐỐI SOÁT THEO THÀNH VIÊN LỚP (RSVP RECONCILIATION) */}
                  {/* ------------------------------------------------------------- */}
                  {fundIncomeViewMode === 'rsvp_members' && (
                <div className="space-y-3">
                  {/* Fund Search & Filter Toolbar */}
                  <div className="bg-white p-2.5 rounded-xl border border-amber-200 shadow-2xs space-y-2">
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                      <div className="relative flex-1">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={fundSearch}
                          onChange={(e) => setFundSearch(e.target.value)}
                          placeholder="Tìm theo tên bạn, số điện thoại, ghi chú, người đối soát..."
                          className="w-full pl-9 pr-8 py-1.5 bg-[#FAF8F5] border border-slate-300 rounded-lg text-xs font-sans focus:outline-none focus:border-amber-500"
                        />
                        {fundSearch && (
                          <button
                            type="button"
                            onClick={() => setFundSearch('')}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="flex items-center gap-1 bg-[#FAF8F5] border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-sans">
                          <Calendar className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                          <select
                            value={fundDateFilter}
                            onChange={(e) => setFundDateFilter(e.target.value as any)}
                            className="bg-transparent focus:outline-none cursor-pointer text-slate-700 font-medium text-xs"
                          >
                            <option value="all">Toàn bộ thời gian</option>
                            <option value="today">Hôm nay</option>
                            <option value="7days">7 ngày qua</option>
                            <option value="this_month">Tháng này</option>
                            <option value="year_2026">Năm 2026 (Họp lớp)</option>
                            <option value="custom">Khoảng ngày tùy chọn...</option>
                          </select>
                        </div>

                        <span className="text-[11px] font-sans text-slate-600 hidden sm:inline">
                          Hiển thị: <strong className="text-slate-900">{filteredFundList.length}</strong> bạn • Thu: <strong className="text-emerald-700 font-mono">{filteredFundCollected.toLocaleString('vi-VN')} đ</strong>
                        </span>
                      </div>
                    </div>

                    {/* Custom Date Range Picker for Income */}
                    {fundDateFilter === 'custom' && (
                      <div className="flex flex-wrap items-center gap-2 p-2 bg-amber-50/70 border border-amber-200 rounded-lg text-xs font-sans">
                        <span className="font-bold text-amber-900 flex items-center gap-1 text-[11px]">
                          <Calendar className="w-3 h-3 text-amber-700" />
                          Khoảng ngày nộp:
                        </span>
                        <label className="flex items-center gap-1 text-slate-600 text-xs">
                          <span>Từ:</span>
                          <input
                            type="date"
                            value={fundCustomStartDate}
                            onChange={(e) => setFundCustomStartDate(e.target.value)}
                            className="px-2 py-0.5 bg-white border border-slate-300 rounded text-xs"
                          />
                        </label>
                        <label className="flex items-center gap-1 text-slate-600 text-xs">
                          <span>Đến:</span>
                          <input
                            type="date"
                            value={fundCustomEndDate}
                            onChange={(e) => setFundCustomEndDate(e.target.value)}
                            className="px-2 py-0.5 bg-white border border-slate-300 rounded text-xs"
                          />
                        </label>
                        {(fundCustomStartDate || fundCustomEndDate) && (
                          <button
                            type="button"
                            onClick={() => { setFundCustomStartDate(''); setFundCustomEndDate(''); }}
                            className="px-2 py-0.5 text-[11px] text-rose-600 hover:text-rose-800 hover:underline cursor-pointer"
                          >
                            Xóa mốc
                          </button>
                        )}
                      </div>
                    )}

                    {/* Quick Status Filter Chips */}
                    <div className="flex items-center gap-1.5 pt-1.5 border-t border-slate-100 text-[11px] font-sans overflow-x-auto no-scrollbar py-0.5">
                      <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider shrink-0 mr-0.5">Lọc:</span>
                      <button
                        type="button"
                        onClick={() => setFundStatusFilter('all')}
                        className={`px-2.5 py-0.5 rounded-full font-medium transition cursor-pointer shrink-0 whitespace-nowrap ${
                          fundStatusFilter === 'all'
                            ? 'bg-amber-700 text-white shadow-2xs font-bold'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        Tất cả ({rsvpList.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setFundStatusFilter('paid')}
                        className={`px-2.5 py-0.5 rounded-full font-medium transition cursor-pointer shrink-0 whitespace-nowrap ${
                          fundStatusFilter === 'paid'
                            ? 'bg-emerald-600 text-white shadow-2xs font-bold'
                            : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        ✓ Đã đóng ({paidMembersCount})
                      </button>
                      <button
                        type="button"
                        onClick={() => setFundStatusFilter('pending')}
                        className={`px-2.5 py-0.5 rounded-full font-medium transition cursor-pointer flex items-center gap-1 shrink-0 whitespace-nowrap ${
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
                        className={`px-2.5 py-0.5 rounded-full font-medium transition cursor-pointer shrink-0 whitespace-nowrap ${
                          fundStatusFilter === 'unpaid'
                            ? 'bg-rose-600 text-white shadow-2xs font-bold'
                            : 'bg-rose-50 hover:bg-rose-100 text-rose-700'
                        }`}
                        title="Chỉ lọc danh sách các bạn xác nhận tham gia mà chưa hoàn tất đóng quỹ"
                      >
                        ⚠️ Chưa nộp ({unpaidMembersCount})
                      </button>
                      <button
                        type="button"
                        onClick={() => setFundStatusFilter('absent')}
                        className={`px-2.5 py-0.5 rounded-full font-medium transition cursor-pointer flex items-center gap-1 shrink-0 whitespace-nowrap ${
                          fundStatusFilter === 'absent'
                            ? 'bg-slate-700 text-white shadow-2xs font-bold'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300/80'
                        }`}
                        title="Các bạn báo vắng họp lớp (không bắt buộc đóng tiền hay ủng hộ)"
                      >
                        <span>🕊️ Báo vắng ({absentMembersCount})</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setFundStatusFilter('has_receipt')}
                        className={`px-2.5 py-0.5 rounded-full font-medium transition cursor-pointer shrink-0 whitespace-nowrap ${
                          fundStatusFilter === 'has_receipt'
                            ? 'bg-blue-600 text-white shadow-2xs font-bold'
                            : 'bg-blue-50 hover:bg-blue-100 text-blue-800'
                        }`}
                      >
                        🧾 Có ảnh Bill ({hasReceiptCount})
                      </button>
                      <button
                        type="button"
                        onClick={() => setFundStatusFilter('extra')}
                        className={`px-2.5 py-0.5 rounded-full font-medium transition cursor-pointer shrink-0 whitespace-nowrap ${
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
                <div className="overflow-x-auto overflow-y-auto max-h-[62vh] sm:max-h-[68vh] relative">
                  <table className="w-full text-left text-xs border-separate border-spacing-0">
                    <thead className="bg-[#F8F5EE] text-slate-600 font-sans uppercase text-[9px] sm:text-[10px] tracking-tight sm:tracking-wider">
                      <tr>
                        <th className="py-1.5 px-1 sm:py-2.5 sm:px-3 w-8 min-w-[32px] max-w-[32px] sm:w-10 sm:min-w-[40px] sm:max-w-[40px] text-center sticky top-0 left-0 z-30 bg-[#F8F5EE] border-b border-amber-200">STT</th>
                        <th className="py-1.5 px-1.5 sm:py-2.5 sm:px-3 min-w-[105px] sm:min-w-[160px] sticky top-0 left-8 sm:left-10 z-30 bg-[#F8F5EE] border-b border-r border-amber-200 shadow-[3px_0_6px_-2px_rgba(0,0,0,0.08)]">Họ và Tên</th>
                        <th className="py-1.5 px-1.5 sm:py-2.5 sm:px-3 sticky top-0 z-20 bg-[#F8F5EE] border-b border-amber-200">Số Điện Thoại</th>
                        <th className="py-1.5 px-1.5 sm:py-2.5 sm:px-3 sticky top-0 z-20 bg-[#F8F5EE] border-b border-amber-200">Số Tiền Đã Thu</th>
                        <th className="py-1.5 px-1.5 sm:py-2.5 sm:px-3 sticky top-0 z-20 bg-[#F8F5EE] border-b border-amber-200">Hình Thức & Giờ</th>
                        <th className="py-1.5 px-1.5 sm:py-2.5 sm:px-3 text-center sticky top-0 z-20 bg-[#F8F5EE] border-b border-amber-200">Chứng Từ / Bill</th>
                        <th className="py-1.5 px-1.5 sm:py-2.5 sm:px-3 text-center sticky top-0 z-20 bg-[#F8F5EE] border-b border-amber-200">Trạng Thái 1-Chạm</th>
                        <th className="py-1.5 px-1.5 sm:py-2.5 sm:px-3 sticky top-0 z-20 bg-[#F8F5EE] border-b border-amber-200">Người & Ghi Chú</th>
                        <th className="py-1.5 px-1.5 sm:py-2.5 sm:px-3 text-right sticky top-0 z-20 bg-[#F8F5EE] border-b border-amber-200">Điều Chỉnh</th>
                      </tr>
                    </thead>
                    <tbody className="font-sans">
                      {filteredFundList.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="py-10 text-center text-slate-400">
                            Không tìm thấy dữ liệu đối soát nào phù hợp với bộ lọc.
                          </td>
                        </tr>
                      ) : (
                        filteredFundList.map((item, idx) => {
                          const isPaid = item.fundStatus === 'paid';
                          const isAbsent = item.status === 'no';
                          const amount = item.fundAmount !== undefined ? item.fundAmount : (isPaid ? (isAbsent ? 0 : standardFundAmount) : 0);
                          const hasReceipt = Boolean(item.fundReceiptUrl && item.fundReceiptUrl.trim());
                          const isExtra = isPaid && (isAbsent ? amount > 0 : amount > standardFundAmount);

                          return (
                            <tr key={item.id || item.phone} className={`group transition ${isAbsent && !isPaid ? 'bg-slate-50/60 hover:bg-slate-100/70 text-slate-600' : 'hover:bg-amber-50/40'}`}>
                              <td className={`py-1 px-1 sm:py-2.5 sm:px-3 text-center text-slate-400 font-mono sticky left-0 z-10 ${isAbsent && !isPaid ? 'bg-[#F9FAFB] group-hover:bg-[#F3F4F6]' : 'bg-white group-hover:bg-[#FFF9EE]'} w-8 min-w-[32px] max-w-[32px] sm:w-10 sm:min-w-[40px] sm:max-w-[40px] border-b border-slate-100 text-[10px] sm:text-xs`}>
                                {idx + 1}
                              </td>

                              <td className={`py-1 px-1.5 sm:py-2.5 sm:px-3 sticky left-8 sm:left-10 z-10 ${isAbsent && !isPaid ? 'bg-[#F9FAFB] group-hover:bg-[#F3F4F6]' : 'bg-white group-hover:bg-[#FFF9EE]'} min-w-[105px] sm:min-w-[160px] border-b border-r border-amber-200/80 shadow-[3px_0_6px_-2px_rgba(0,0,0,0.08)]`}>
                                <div className="flex items-center gap-2">
                                  <div className="w-5 h-5 sm:w-7 sm:h-7 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-bold flex items-center justify-center text-[9px] sm:text-[11px] shrink-0">
                                    {(item.fullName || 'K').slice(0, 1).toUpperCase()}
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-1.5">
                                      <span className="font-bold text-slate-900 text-xs">
                                        {item.fullName}
                                      </span>
                                      {item.memberId && (
                                        <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-amber-100 text-amber-900 border border-amber-300" title="Mã thành viên danh bạ lớp">
                                          {item.memberId}
                                        </span>
                                      )}
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

                              <td className="py-1 px-1.5 sm:py-2.5 sm:px-3 font-mono text-slate-600 text-[11px] sm:text-xs border-b border-slate-100">
                                {item.phone}
                              </td>

                              <td className="py-1 px-1.5 sm:py-2.5 sm:px-3 border-b border-slate-100">
                                {isPaid ? (
                                  <>
                                    <span className={`font-mono font-bold text-xs ${isAbsent ? 'text-indigo-700' : 'text-emerald-700'}`}>
                                      {amount.toLocaleString('vi-VN')} đ
                                    </span>
                                    {isAbsent ? (
                                      <span className="block text-[10px] font-sans font-bold text-indigo-600">
                                        💜 Tự nguyện ủng hộ
                                      </span>
                                    ) : isExtra && (
                                      <span className="block text-[10px] font-sans font-bold text-amber-700 uppercase">
                                        + Ủng hộ {(amount - standardFundAmount).toLocaleString('vi-VN')}đ
                                      </span>
                                    )}
                                  </>
                                ) : item.fundStatus === 'pending' ? (
                                  <div>
                                    <span className="font-mono font-bold text-xs text-amber-700">
                                      {(item.fundAmount || (isAbsent ? 500000 : standardFundAmount)).toLocaleString('vi-VN')} đ
                                    </span>
                                    <span className="block text-[9px] font-sans font-bold text-amber-600 uppercase">
                                      ⏳ Khai báo chờ duyệt
                                    </span>
                                  </div>
                                ) : isAbsent ? (
                                  <div>
                                    <span className="font-mono font-medium text-xs text-slate-400">
                                      —
                                    </span>
                                    <span className="block text-[9.5px] font-sans text-slate-400 italic">
                                      Miễn đóng (Báo vắng)
                                    </span>
                                  </div>
                                ) : (
                                  <span className="font-mono font-bold text-xs text-slate-400">
                                    0 đ
                                  </span>
                                )}
                              </td>

                              <td className="py-1 px-1.5 sm:py-2.5 sm:px-3 border-b border-slate-100">
                                {isPaid ? (
                                  <div className="space-y-0.5">
                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                                      item.fundPaymentMethod === 'cash'
                                        ? 'bg-amber-100 text-amber-900'
                                        : 'bg-blue-50 text-blue-800 border border-blue-200/60'
                                    }`}>
                                      {item.fundPaymentMethod === 'cash' ? '💵 Tiền mặt' : '🏦 Chuyển khoản'}
                                    </span>
                                    {item.fundPaidAt && (
                                      <span className="text-[11px] text-slate-500 block font-mono font-medium whitespace-nowrap pt-0.5">
                                        {formatDateTimeVi(item.fundPaidAt)}
                                      </span>
                                    )}
                                  </div>
                                ) : isAbsent ? (
                                  <span className="text-slate-400 text-xs font-mono">—</span>
                                ) : (
                                  <div className="space-y-0.5">
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-500">
                                      {item.fundPaymentMethod === 'cash' ? '💵 Tiền mặt' : '🏦 Chuyển khoản'}
                                    </span>
                                  </div>
                                )}
                              </td>

                              {/* Receipt Image Thumbnail & Zoom */}
                              <td className="py-1 px-1.5 sm:py-2.5 sm:px-3 text-center border-b border-slate-100">
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
                                      className="w-7 h-7 sm:w-10 sm:h-10 object-cover group-hover:scale-110 transition duration-200"
                                      loading="lazy"
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                                      <ZoomIn className="w-4 h-4 text-white" />
                                    </div>
                                    <span className="absolute bottom-0 inset-x-0 bg-emerald-600/90 text-white text-[8px] font-bold leading-tight py-0.2">
                                      Bill
                                    </span>
                                  </button>
                                ) : isAbsent && !isPaid ? (
                                  <span className="text-[10px] text-slate-400 italic">—</span>
                                ) : canAuditAndSpend ? (
                                  <button
                                    type="button"
                                    onClick={() => handleOpenAdjustFund(item)}
                                    className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 hover:bg-amber-100 text-slate-600 hover:text-amber-900 border border-dashed border-slate-300 hover:border-amber-400 rounded text-[10px] font-sans font-medium transition cursor-pointer"
                                    title="Thêm ảnh chứng từ nộp tiền"
                                  >
                                    <Camera className="w-3 h-3 text-slate-400" />
                                    <span>+ Đính bill</span>
                                  </button>
                                ) : (
                                  <span className="text-[10px] text-slate-400 italic">Chưa có</span>
                                )}
                              </td>

                              {/* 1-Touch Status Toggle */}
                              <td className="py-1 px-1.5 sm:py-2.5 sm:px-3 text-center border-b border-slate-100">
                                {isAbsent && !isPaid && item.fundStatus !== 'pending' ? (
                                  <div className="inline-flex flex-col items-center gap-0.5">
                                    <span
                                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10.5px] font-medium bg-slate-100 text-slate-600 border border-slate-200 shadow-2xs"
                                      title="Thành viên báo vắng mặt — Không bắt buộc đóng tiền hay ủng hộ"
                                    >
                                      <span>🕊️ Miễn Đóng (Vắng)</span>
                                    </span>
                                    {canAuditAndSpend && (
                                      <button
                                        type="button"
                                        onClick={() => handleOpenAdjustFund(item)}
                                        className="text-[9.5px] text-indigo-600 hover:text-indigo-800 hover:underline pt-0.5 cursor-pointer font-sans"
                                        title="Ghi nhận nếu bạn ấy tự nguyện gửi tiền ủng hộ quỹ lớp"
                                      >
                                        + Nhận ủng hộ
                                      </button>
                                    )}
                                  </div>
                                ) : !canAuditAndSpend ? (
                                  item.fundStatus === 'pending' ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                                      <Clock className="w-3 h-3 text-amber-600" />
                                      <span>Chờ duyệt</span>
                                    </span>
                                  ) : isPaid ? (
                                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                                      isAbsent ? 'bg-indigo-50 text-indigo-800 border border-indigo-200' : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                    }`}>
                                      {isAbsent ? <Heart className="w-3.5 h-3.5 text-indigo-600" /> : <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />}
                                      <span>{isAbsent ? 'Đã Ủng Hộ' : 'Đã Thu Tiền'}</span>
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                                      <span>Chưa Nộp</span>
                                    </span>
                                  )
                                ) : item.fundStatus === 'pending' ? (
                                  <div className="inline-flex flex-col items-center gap-1">
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 animate-pulse">
                                      <Clock className="w-3 h-3 text-amber-600" />
                                      <span>Chờ duyệt</span>
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => handleApproveFundDirect(item, item.fundAmount || (isAbsent ? 500000 : standardFundAmount))}
                                      className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold shadow-2xs transition cursor-pointer"
                                      title={`Khớp lệnh duyệt ${(item.fundAmount || standardFundAmount).toLocaleString('vi-VN')}đ cho bạn này`}
                                    >
                                      <Check className="w-3 h-3" />
                                      <span>Duyệt {(item.fundAmount || (isAbsent ? 500000 : standardFundAmount)).toLocaleString('vi-VN')}đ</span>
                                    </button>
                                  </div>
                                ) : isPaid ? (
                                  <button
                                    type="button"
                                    onClick={() => handleToggleFundPaid(item)}
                                    className={`inline-flex items-center gap-1 px-2.5 py-1.2 rounded-full text-[11px] font-bold shadow-2xs transition cursor-pointer ${
                                      isAbsent ? 'bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200' : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                    }`}
                                    title="Bấm để chuyển trạng thái"
                                  >
                                    {isAbsent ? <Heart className="w-3.5 h-3.5 text-indigo-600" /> : <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />}
                                    <span>{isAbsent ? 'Đã Ủng Hộ' : 'Đã Thu Tiền'}</span>
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handleToggleFundPaid(item)}
                                    className="inline-flex items-center gap-1 px-2.5 py-1.2 rounded-full text-[11px] font-bold bg-rose-50 hover:bg-emerald-50 text-rose-700 hover:text-emerald-700 border border-rose-200 transition cursor-pointer"
                                    title={`Bấm để đánh dấu Đã Thu Tiền ${standardFundAmount.toLocaleString('vi-VN')}đ`}
                                  >
                                    <Clock className="w-3.5 h-3.5 text-rose-500" />
                                    <span>Chưa Nộp</span>
                                  </button>
                                )}
                              </td>

                              {/* Audit Trail & Notes */}
                              <td className="py-1 px-1.5 sm:py-2.5 sm:px-3 text-slate-600 text-[10px] sm:text-xs border-b border-slate-100">
                                <div className="space-y-0.5">
                                  <p className="italic text-slate-700 line-clamp-2">
                                    {item.fundNote || (isPaid ? (isAbsent ? 'Tự nguyện ủng hộ quỹ chung' : `Đã thu đủ ${standardFundAmount.toLocaleString('vi-VN')}đ`) : (isAbsent ? 'Báo vắng (Không bắt buộc đóng)' : 'Chưa nộp'))}
                                  </p>
                                  {item.fundAuditedBy && (
                                    <span className="text-[10px] text-amber-800 font-sans font-semibold block">
                                      Duyệt: {item.fundAuditedBy}
                                    </span>
                                  )}
                                </div>
                              </td>

                              {/* Action: Open Deep Reconciliation Modal */}
                              <td className="py-1 px-1.5 sm:py-2.5 sm:px-3 text-right border-b border-slate-100">
                                {canAuditAndSpend ? (
                                  <button
                                    type="button"
                                    onClick={() => handleOpenAdjustFund(item)}
                                    className={`inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-sans font-bold rounded-lg shadow-2xs transition cursor-pointer ${
                                      isAbsent && !isPaid
                                        ? 'text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-300'
                                        : 'text-amber-900 hover:text-amber-950 bg-amber-100 hover:bg-amber-200 border border-amber-300'
                                    }`}
                                    title={isAbsent ? 'Ghi nhận tiền ủng hộ tự nguyện (nếu có)' : 'Đối soát chi tiết, sửa tiền hoặc upload ảnh chứng từ'}
                                  >
                                    <Edit className="w-3 h-3 text-amber-700" />
                                    <span>Đối Soát</span>
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handleOpenAdjustFund(item)}
                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-sans font-bold text-indigo-900 hover:text-indigo-950 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg shadow-2xs transition cursor-pointer"
                                    title="Xem chi tiết thông tin đóng quỹ"
                                  >
                                    <Eye className="w-3 h-3 text-indigo-700" />
                                    <span>Chi Tiết</span>
                                  </button>
                                )}
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

          {/* ------------------------------------------------------------- */}
          {/* VIEW 2: SỔ THU CHI TIẾT (TOÀN BỘ CÁC KHOẢN THU K8A1) */}
          {/* ------------------------------------------------------------- */}
          {fundIncomeViewMode === 'income_ledger' && (
            <div className="space-y-3">
              {/* Toolbar lọc Sổ Thu */}
              <div className="bg-white p-3.5 rounded-xl border border-emerald-200 space-y-3">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={incomeSearch}
                      onChange={(e) => setIncomeSearch(e.target.value)}
                      placeholder="Tìm theo nội dung thu, người nộp, SĐT, người nhận tiền, ghi chú..."
                      className="w-full pl-9 pr-3 py-2 bg-[#FAF8F5] border border-slate-300 rounded-lg text-xs font-sans focus:outline-none focus:border-emerald-600"
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      value={incomeCategoryFilter}
                      onChange={(e) => setIncomeCategoryFilter(e.target.value)}
                      className="px-3 py-2 bg-[#FAF8F5] border border-slate-300 rounded-lg text-xs font-sans focus:outline-none focus:border-emerald-600 cursor-pointer"
                    >
                      <option value="all">Tất cả danh mục thu ({effectiveIncomes.length})</option>
                      {INCOME_CATEGORIES.map(cat => (
                        <option key={cat.id} value={cat.id}>
                          {cat.icon} {cat.label}
                        </option>
                      ))}
                    </select>

                    <div className="flex items-center gap-1.5 bg-[#FAF8F5] border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-sans">
                      <Calendar className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                      <select
                        value={incomeDateFilter}
                        onChange={(e) => setIncomeDateFilter(e.target.value as any)}
                        className="bg-transparent focus:outline-none cursor-pointer text-slate-700 font-medium"
                      >
                        <option value="all">Toàn bộ thời gian</option>
                        <option value="today">Hôm nay</option>
                        <option value="7days">7 ngày qua</option>
                        <option value="this_month">Tháng này</option>
                        <option value="year_2026">Năm 2026</option>
                        <option value="custom">Tùy chọn ngày...</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Custom date range picker if custom */}
                {incomeDateFilter === 'custom' && (
                  <div className="flex flex-wrap items-center gap-2 p-2.5 bg-emerald-50/70 border border-emerald-200 rounded-lg text-xs font-sans">
                    <span className="font-bold text-emerald-950 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-emerald-700" />
                      Khoảng ngày thu:
                    </span>
                    <label className="flex items-center gap-1 text-slate-600">
                      <span>Từ:</span>
                      <input
                        type="date"
                        value={incomeCustomStartDate}
                        onChange={(e) => setIncomeCustomStartDate(e.target.value)}
                        className="px-2 py-1 bg-white border border-slate-300 rounded text-xs"
                      />
                    </label>
                    <label className="flex items-center gap-1 text-slate-600">
                      <span>Đến:</span>
                      <input
                        type="date"
                        value={incomeCustomEndDate}
                        onChange={(e) => setIncomeCustomEndDate(e.target.value)}
                        className="px-2 py-1 bg-white border border-slate-300 rounded text-xs"
                      />
                    </label>
                    {(incomeCustomStartDate || incomeCustomEndDate) && (
                      <button
                        type="button"
                        onClick={() => { setIncomeCustomStartDate(''); setIncomeCustomEndDate(''); }}
                        className="px-2 py-1 text-[11px] text-rose-600 hover:text-rose-800 hover:underline cursor-pointer"
                      >
                        Xóa mốc
                      </button>
                    )}
                  </div>
                )}

                {/* Quick Category Chips Filter */}
                <div className="flex items-center gap-1.5 pt-1 border-t border-slate-100 text-[11px] font-sans overflow-x-auto no-scrollbar py-0.5">
                  <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider shrink-0 mr-0.5">Danh mục:</span>
                  <button
                    type="button"
                    onClick={() => setIncomeCategoryFilter('all')}
                    className={`px-2.5 py-1 rounded-full font-medium transition cursor-pointer shrink-0 whitespace-nowrap ${
                      incomeCategoryFilter === 'all'
                        ? 'bg-emerald-700 text-white shadow-2xs font-bold'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    Tất cả ({effectiveIncomes.length})
                  </button>
                  {INCOME_CATEGORIES.map(cat => {
                    const count = effectiveIncomes.filter(i => i.category === cat.id).length;
                    const isActive = incomeCategoryFilter === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setIncomeCategoryFilter(cat.id)}
                        className={`px-2.5 py-1 rounded-full font-medium transition cursor-pointer flex items-center gap-1 shrink-0 whitespace-nowrap ${
                          isActive
                            ? `${cat.badgeBg} ${cat.badgeText} border ${cat.badgeBorder} ring-1 ring-emerald-600 font-bold shadow-2xs`
                            : `${cat.badgeBg} ${cat.badgeText} border ${cat.badgeBorder} hover:opacity-90`
                        }`}
                      >
                        <span>{cat.icon}</span>
                        <span>{cat.shortLabel}</span>
                        <span className="opacity-75 font-mono text-[10px]">({count})</span>
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px] font-sans text-slate-600">
                  <span>
                    Hiển thị: <strong>{filteredIncomesList.length}</strong> khoản thu
                  </span>
                  <span>
                    Tổng tiền: <strong className="text-emerald-700 font-mono text-sm">{filteredIncomesTotal.toLocaleString('vi-VN')} đ</strong>
                  </span>
                </div>
              </div>

              {/* Sổ Thu Table */}
              <div className="bg-white rounded-xl border border-emerald-200 shadow-xs overflow-hidden">
                <div className="overflow-x-auto overflow-y-auto max-h-[62vh] sm:max-h-[68vh] relative">
                  <table className="w-full text-left text-xs border-separate border-spacing-0">
                    <thead className="bg-[#F0FDF4] text-emerald-950 font-sans uppercase text-[9px] sm:text-[10px] tracking-tight sm:tracking-wider">
                      <tr>
                        <th className="py-1.5 px-1 sm:py-2.5 sm:px-3 w-8 min-w-[32px] max-w-[32px] sm:w-10 sm:min-w-[40px] sm:max-w-[40px] text-center sticky top-0 left-0 z-30 bg-[#F0FDF4] border-b border-emerald-200">STT</th>
                        <th className="py-1.5 px-1.5 sm:py-2.5 sm:px-3 min-w-[110px] sm:min-w-[180px] sticky top-0 left-8 sm:left-10 z-30 bg-[#F0FDF4] border-b border-r border-emerald-200 shadow-[3px_0_6px_-2px_rgba(0,0,0,0.08)]">Khoản Thu & Danh Mục</th>
                        <th className="py-1.5 px-1.5 sm:py-2.5 sm:px-3 sticky top-0 z-20 bg-[#F0FDF4] border-b border-emerald-200">Người Nộp / Đơn Vị</th>
                        <th className="py-1.5 px-1.5 sm:py-2.5 sm:px-3 sticky top-0 z-20 bg-[#F0FDF4] border-b border-emerald-200">Số Tiền (VNĐ)</th>
                        <th className="py-1.5 px-1.5 sm:py-2.5 sm:px-3 sticky top-0 z-20 bg-[#F0FDF4] border-b border-emerald-200">Hình Thức & Giờ</th>
                        <th className="py-1.5 px-1.5 sm:py-2.5 sm:px-3 text-center sticky top-0 z-20 bg-[#F0FDF4] border-b border-emerald-200">Chứng Từ / Bill</th>
                        <th className="py-1.5 px-1.5 sm:py-2.5 sm:px-3 sticky top-0 z-20 bg-[#F0FDF4] border-b border-emerald-200">Người Thu & Ghi Chú</th>
                        <th className="py-1.5 px-1.5 sm:py-2.5 sm:px-3 text-right sticky top-0 z-20 bg-[#F0FDF4] border-b border-emerald-200">Thao Tác</th>
                      </tr>
                    </thead>
                    <tbody className="font-sans">
                      {filteredIncomesList.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="py-12 text-center text-slate-400 space-y-2">
                            <Coins className="w-8 h-8 text-slate-300 mx-auto" />
                            <p>Chưa có khoản thu nào trong danh sách hoặc không khớp bộ lọc.</p>
                            {canAuditAndSpend && (
                              <button
                                type="button"
                                onClick={() => handleOpenAddIncome()}
                                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition cursor-pointer"
                              >
                                + Thêm Khoản Thu Đầu Tiên
                              </button>
                            )}
                          </td>
                        </tr>
                      ) : (
                        filteredIncomesList.map((item, idx) => {
                          const catMeta = INCOME_CATEGORIES.find(c => c.id === item.category);
                          const hasReceipt = Boolean(item.receiptUrl && item.receiptUrl.trim());

                          return (
                            <tr key={item.id} className="group hover:bg-emerald-50/30 transition">
                              <td className="py-1 px-1 sm:py-2.5 sm:px-3 text-center text-slate-400 font-mono sticky left-0 z-10 bg-white group-hover:bg-[#F0FDF4] w-8 min-w-[32px] max-w-[32px] sm:w-10 sm:min-w-[40px] sm:max-w-[40px] border-b border-slate-100 text-[10px] sm:text-xs">
                                {idx + 1}
                              </td>

                              <td className="py-1 px-1.5 sm:py-2.5 sm:px-3 sticky left-8 sm:left-10 z-10 bg-white group-hover:bg-[#F0FDF4] min-w-[110px] sm:min-w-[180px] border-b border-r border-emerald-200/80 shadow-[3px_0_6px_-2px_rgba(0,0,0,0.08)]">
                                <div>
                                  <span className="font-bold text-slate-900 text-xs sm:text-sm block leading-tight sm:leading-normal">
                                    {item.title}
                                  </span>
                                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 mt-0.5 rounded text-[10px] font-bold ${catMeta?.badgeBg || 'bg-slate-100'} ${catMeta?.badgeText || 'text-slate-700'} border ${catMeta?.badgeBorder || 'border-slate-200'}`}>
                                    <span>{catMeta?.icon || '📦'}</span>
                                    <span>{catMeta?.label || item.category}</span>
                                  </span>
                                </div>
                              </td>

                              <td className="py-1 px-1.5 sm:py-2.5 sm:px-3 border-b border-slate-100">
                                <div>
                                  <span className="font-bold text-slate-900">
                                    {item.payerName}
                                  </span>
                                  {item.payerPhone && (
                                    <span className="font-mono text-slate-500 text-[11px] block">
                                      {item.payerPhone}
                                    </span>
                                  )}
                                  {item.memberId && (
                                    <span className="text-[10px] text-emerald-700 font-medium">
                                      ✓ Lớp K8A1
                                    </span>
                                  )}
                                </div>
                              </td>

                              <td className="py-1 px-1.5 sm:py-2.5 sm:px-3 border-b border-slate-100">
                                <span className="font-mono font-bold text-xs text-emerald-700">
                                  +{(Number(item.amount) || 0).toLocaleString('vi-VN')} đ
                                </span>
                              </td>

                              <td className="py-1 px-1.5 sm:py-2.5 sm:px-3 border-b border-slate-100">
                                <div className="space-y-0.5">
                                  <span className={`inline-block px-1.5 py-0.2 text-[10px] font-bold rounded ${
                                    item.paymentMethod === 'cash' 
                                      ? 'bg-amber-100 text-amber-800 border border-amber-300' 
                                      : 'bg-blue-100 text-blue-800 border border-blue-200'
                                  }`}>
                                    {item.paymentMethod === 'cash' ? '💵 Tiền mặt' : '🏦 Chuyển khoản'}
                                  </span>
                                  <span className="text-[11px] text-slate-500 block font-mono">
                                    {formatDateOnlyVi(item.date)}
                                  </span>
                                </div>
                              </td>

                              <td className="py-1 px-1.5 sm:py-2.5 sm:px-3 text-center border-b border-slate-100">
                                {hasReceipt ? (
                                  <button
                                    type="button"
                                    onClick={() => setViewingIncomeReceipt({ url: item.receiptUrl!, title: `${item.title} - ${item.payerName}` })}
                                    className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded text-[11px] font-semibold transition cursor-pointer"
                                    title="Xem ảnh chứng từ"
                                  >
                                    <ImageIcon className="w-3 h-3 text-emerald-600" />
                                    <span>Xem bill</span>
                                  </button>
                                ) : (
                                  <span className="text-[11px] text-slate-400 italic">Chưa có</span>
                                )}
                              </td>

                              <td className="py-1 px-1.5 sm:py-2.5 sm:px-3 border-b border-slate-100">
                                <div>
                                  <span className="text-slate-700 text-[11px] font-semibold block">
                                    {item.auditor || 'Thủ Quỹ BLL'}
                                  </span>
                                  {item.note && (
                                    <span className="text-[11px] text-slate-500 italic line-clamp-1" title={item.note}>
                                      "{item.note}"
                                    </span>
                                  )}
                                </div>
                              </td>

                              <td className="py-1 px-1.5 sm:py-2.5 sm:px-3 text-right border-b border-slate-100">
                                {canAuditAndSpend ? (
                                  <div className="flex items-center justify-end gap-1">
                                    <button
                                      type="button"
                                      onClick={() => handleOpenEditIncome(item)}
                                      className="p-1.5 text-slate-500 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition cursor-pointer"
                                      title="Chỉnh sửa khoản thu này"
                                    >
                                      <Edit3 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteIncomeItem(item)}
                                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                                      title="Xóa khoản thu này"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                ) : (
                                  <span className="text-[11px] text-slate-400">Chỉ xem</span>
                                )}
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
        </div>
      )}

          {/* ------------------------------------------------------------- */}
          {/* PHÂN HỆ 2: CHI TIÊU QUỸ (CÁC KHOẢN CHI LỚP) */}
          {/* ------------------------------------------------------------- */}
          {fundSubTab === 'expense' && (
            <div className="space-y-4">
              {/* Expense Search & Category Filters Toolbar */}
              <div className="bg-white p-3.5 rounded-xl border border-amber-200 space-y-3">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={expenseSearch}
                      onChange={(e) => setExpenseSearch(e.target.value)}
                      placeholder="Tìm theo tên khoản chi, người chi, người nhận, ghi chú..."
                      className="w-full pl-9 pr-3 py-2 bg-[#FAF8F5] border border-slate-300 rounded-lg text-xs font-sans focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      value={expenseCategoryFilter}
                      onChange={(e) => setExpenseCategoryFilter(e.target.value)}
                      className="px-3 py-2 bg-[#FAF8F5] border border-slate-300 rounded-lg text-xs font-sans focus:outline-none focus:border-amber-500 cursor-pointer"
                    >
                      <option value="all">Tất cả nhóm chi ({effectiveExpenses.length})</option>
                      {EXPENSE_CATEGORIES.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.label}</option>
                      ))}
                    </select>

                    <div className="flex items-center gap-1.5 bg-[#FAF8F5] border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-sans">
                      <Calendar className="w-3.5 h-3.5 text-rose-700 shrink-0" />
                      <select
                        value={expenseDateFilter}
                        onChange={(e) => setExpenseDateFilter(e.target.value as any)}
                        className="bg-transparent focus:outline-none cursor-pointer text-slate-700 font-medium"
                      >
                        <option value="all">Toàn bộ thời gian</option>
                        <option value="today">Hôm nay</option>
                        <option value="7days">7 ngày qua</option>
                        <option value="this_month">Tháng này</option>
                        <option value="year_2026">Năm 2026 (Họp lớp)</option>
                        <option value="custom">Tùy chọn khoảng ngày...</option>
                      </select>
                    </div>

                    {canAuditAndSpend && (
                      <button
                        type="button"
                        onClick={() => handleOpenAddExpense()}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white text-xs font-sans font-bold rounded-lg shadow-sm transition cursor-pointer whitespace-nowrap"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>+ Thêm Chi</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Custom Date Range Inputs for Expense */}
                {expenseDateFilter === 'custom' && (
                  <div className="flex flex-wrap items-center gap-2 p-2.5 bg-rose-50/70 border border-rose-200 rounded-lg text-xs font-sans">
                    <span className="font-bold text-rose-900 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-rose-700" />
                      Khoảng ngày chi:
                    </span>
                    <label className="flex items-center gap-1 text-slate-600">
                      <span>Từ:</span>
                      <input
                        type="date"
                        value={expenseCustomStartDate}
                        onChange={(e) => setExpenseCustomStartDate(e.target.value)}
                        className="px-2 py-1 bg-white border border-slate-300 rounded text-xs"
                      />
                    </label>
                    <label className="flex items-center gap-1 text-slate-600">
                      <span>Đến:</span>
                      <input
                        type="date"
                        value={expenseCustomEndDate}
                        onChange={(e) => setExpenseCustomEndDate(e.target.value)}
                        className="px-2 py-1 bg-white border border-slate-300 rounded text-xs"
                      />
                    </label>
                    {(expenseCustomStartDate || expenseCustomEndDate) && (
                      <button
                        type="button"
                        onClick={() => { setExpenseCustomStartDate(''); setExpenseCustomEndDate(''); }}
                        className="px-2 py-1 text-[11px] text-rose-600 hover:text-rose-800 hover:underline cursor-pointer"
                      >
                        Xóa mốc
                      </button>
                    )}
                  </div>
                )}

                {/* Quick Category Filter Badges */}
                <div className="flex items-center gap-1.5 pt-1 border-t border-slate-100 text-[11px] font-sans overflow-x-auto no-scrollbar py-0.5">
                  <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider shrink-0 mr-0.5">Nhóm chi:</span>
                  <button
                    type="button"
                    onClick={() => setExpenseCategoryFilter('all')}
                    className={`px-2.5 py-1 rounded-full font-medium transition cursor-pointer shrink-0 whitespace-nowrap ${
                      expenseCategoryFilter === 'all'
                        ? 'bg-slate-800 text-white shadow-2xs font-bold'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    Tất cả ({effectiveExpenses.length})
                  </button>

                  {EXPENSE_CATEGORIES.map(cat => {
                    const count = effectiveExpenses.filter(e => e.category === cat.id).length;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setExpenseCategoryFilter(cat.id)}
                        className={`px-2.5 py-1 rounded-full font-medium transition cursor-pointer flex items-center gap-1 shrink-0 whitespace-nowrap ${
                          expenseCategoryFilter === cat.id
                            ? 'bg-amber-700 text-white shadow-2xs font-bold'
                            : `${cat.badgeBg} ${cat.badgeText} border ${cat.badgeBorder} hover:opacity-80`
                        }`}
                      >
                        <span>{cat.label}</span>
                        <span className="text-[10px] opacity-75 font-mono">({count})</span>
                      </button>
                    );
                  })}
                </div>

                {/* Time Quick Chips for Expense */}
                <div className="flex flex-wrap items-center justify-between gap-1.5 pt-1 border-t border-slate-100 text-[11px] font-sans">
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                    <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider shrink-0 mr-0.5">Thời gian:</span>
                    {(['all', 'today', '7days', 'this_month', 'year_2026'] as const).map(f => {
                      const labels = {
                        all: 'Tất cả',
                        today: 'Hôm nay',
                        '7days': '7 ngày',
                        this_month: 'Tháng này',
                        year_2026: 'Năm 2026'
                      };
                      const isActive = expenseDateFilter === f;
                      return (
                        <button
                          key={f}
                          type="button"
                          onClick={() => setExpenseDateFilter(f)}
                          className={`px-2.5 py-0.5 rounded-full transition cursor-pointer shrink-0 whitespace-nowrap ${
                            isActive
                              ? 'bg-rose-700 text-white font-bold shadow-2xs'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                          }`}
                        >
                          {labels[f]}
                        </button>
                      );
                    })}
                  </div>

                  <span className="text-[11px] font-sans text-slate-600 shrink-0">
                    Hiển thị: <strong>{filteredExpensesList.length}</strong> • Tổng: <strong className="text-rose-700 font-mono">-{filteredExpensesTotal.toLocaleString('vi-VN')} đ</strong>
                  </span>
                </div>
              </div>

              {/* Expense Items Table */}
              <div className="bg-white rounded-xl border border-amber-200 shadow-xs overflow-hidden">
                <div className="overflow-x-auto overflow-y-auto max-h-[62vh] sm:max-h-[68vh] relative">
                  <table className="w-full text-left text-xs border-separate border-spacing-0">
                    <thead className="bg-[#F8F5EE] text-slate-600 font-sans uppercase text-[9px] sm:text-[10px] tracking-tight sm:tracking-wider">
                      <tr>
                        <th className="py-1.5 px-1 sm:py-2.5 sm:px-3 w-8 min-w-[32px] max-w-[32px] sm:w-10 sm:min-w-[40px] sm:max-w-[40px] text-center sticky top-0 left-0 z-30 bg-[#F8F5EE] border-b border-amber-200">STT</th>
                        <th className="py-1.5 px-1.5 sm:py-2.5 sm:px-3 min-w-[110px] sm:min-w-[180px] sticky top-0 left-8 sm:left-10 z-30 bg-[#F8F5EE] border-b border-r border-amber-200 shadow-[3px_0_6px_-2px_rgba(0,0,0,0.08)]">Khoản Chi & Mục Đích</th>
                        <th className="py-1.5 px-1.5 sm:py-2.5 sm:px-3 w-20 sm:w-24 sticky top-0 z-20 bg-[#F8F5EE] border-b border-amber-200">Ngày Chi</th>
                        <th className="py-1.5 px-1.5 sm:py-2.5 sm:px-3 sticky top-0 z-20 bg-[#F8F5EE] border-b border-amber-200">Nhóm Chi</th>
                        <th className="py-1.5 px-1.5 sm:py-2.5 sm:px-3 text-right sticky top-0 z-20 bg-[#F8F5EE] border-b border-amber-200">Số Tiền (VNĐ)</th>
                        <th className="py-1.5 px-1.5 sm:py-2.5 sm:px-3 sticky top-0 z-20 bg-[#F8F5EE] border-b border-amber-200">Người Chi ➔ Thụ Hưởng</th>
                        <th className="py-1.5 px-1.5 sm:py-2.5 sm:px-3 text-center sticky top-0 z-20 bg-[#F8F5EE] border-b border-amber-200">Hóa Đơn / Bill</th>
                        <th className="py-1.5 px-1.5 sm:py-2.5 sm:px-3 text-right sticky top-0 z-20 bg-[#F8F5EE] border-b border-amber-200">Thao Tác</th>
                      </tr>
                    </thead>
                    <tbody className="font-sans">
                      {filteredExpensesList.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="py-12 text-center text-slate-400">
                            <Receipt className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                            <p className="font-serif italic text-sm">Chưa có khoản chi nào phù hợp với bộ lọc.</p>
                            <button
                              type="button"
                              onClick={() => handleOpenAddExpense()}
                              className="mt-2 text-xs text-rose-700 hover:text-rose-900 font-bold underline cursor-pointer"
                            >
                              + Thêm khoản chi đầu tiên ngay
                            </button>
                          </td>
                        </tr>
                      ) : (
                        filteredExpensesList.map((item, idx) => {
                          const catMeta = EXPENSE_CATEGORIES.find(c => c.id === item.category) || {
                            label: 'Chi khác',
                            badgeBg: 'bg-slate-100',
                            badgeText: 'text-slate-700',
                            badgeBorder: 'border-slate-200'
                          };
                          const hasReceipt = Boolean(item.receiptUrl && item.receiptUrl.trim());

                          return (
                            <tr key={item.id} className="group hover:bg-amber-50/40 transition">
                              <td className="py-1 px-1 sm:py-2.5 sm:px-3 text-center text-slate-400 font-mono sticky left-0 z-10 bg-white group-hover:bg-[#FFF9EE] w-8 min-w-[32px] max-w-[32px] sm:w-10 sm:min-w-[40px] sm:max-w-[40px] border-b border-slate-100 text-[10px] sm:text-xs">
                                {idx + 1}
                              </td>

                              <td className="py-1 px-1.5 sm:py-2.5 sm:px-3 sticky left-8 sm:left-10 z-10 bg-white group-hover:bg-[#FFF9EE] min-w-[110px] sm:min-w-[180px] border-b border-r border-amber-200/80 shadow-[3px_0_6px_-2px_rgba(0,0,0,0.08)]">
                                <div className="font-bold text-slate-900 text-xs sm:text-sm leading-tight sm:leading-normal">
                                  {item.title}
                                </div>
                                <div className="flex items-center gap-1 text-[10px] sm:text-[11px] text-slate-500 mt-0.5">
                                  {item.eventScope && (
                                    <span className="bg-amber-50 text-amber-800 border border-amber-200 px-1.5 py-0.2 rounded text-[10px] font-medium">
                                      {item.eventScope}
                                    </span>
                                  )}
                                  {item.note && (
                                    <span className="italic line-clamp-1">{item.note}</span>
                                  )}
                                </div>
                              </td>

                              <td className="py-1 px-1.5 sm:py-2.5 sm:px-3 font-mono text-slate-700 text-[10px] sm:text-xs whitespace-nowrap font-medium border-b border-slate-100">
                                {formatDateOnlyVi(item.date)}
                              </td>

                              <td className="py-1 px-1.5 sm:py-2.5 sm:px-3 whitespace-nowrap border-b border-slate-100">
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${catMeta.badgeBg} ${catMeta.badgeText} ${catMeta.badgeBorder}`}>
                                  {catMeta.label}
                                </span>
                              </td>

                              <td className="py-1 px-1.5 sm:py-2.5 sm:px-3 text-right font-mono font-bold text-rose-700 text-xs sm:text-sm whitespace-nowrap border-b border-slate-100">
                                -{Number(item.amount || 0).toLocaleString('vi-VN')} đ
                              </td>

                              <td className="py-1 px-1.5 sm:py-2.5 sm:px-3 border-b border-slate-100">
                                <div className="text-slate-900 font-semibold text-xs">
                                  {item.spender || 'Thủ Quỹ BLL'}
                                </div>
                                {item.recipient && (
                                  <div className="text-[11px] text-slate-500 flex items-center gap-1">
                                    <span className="text-slate-400">➔</span>
                                    <span className="truncate max-w-[160px]">{item.recipient}</span>
                                  </div>
                                )}
                              </td>

                              <td className="py-1 px-1.5 sm:py-2.5 sm:px-3 text-center border-b border-slate-100">
                                {hasReceipt ? (
                                  <button
                                    type="button"
                                    onClick={() => setViewingExpenseReceipt({ url: item.receiptUrl!, title: item.title })}
                                    className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-[11px] font-semibold transition cursor-pointer shadow-2xs"
                                    title="Bấm để xem ảnh hóa đơn chứng từ"
                                  >
                                    <Eye className="w-3 h-3" />
                                    <span>Xem Bill</span>
                                  </button>
                                ) : (
                                  <span className="text-[11px] text-slate-400 italic">
                                    Chưa có
                                  </span>
                                )}
                              </td>

                              <td className="py-1 px-1.5 sm:py-2.5 sm:px-3 text-right whitespace-nowrap border-b border-slate-100">
                                {canAuditAndSpend ? (
                                  <div className="flex items-center justify-end gap-1">
                                    <button
                                      type="button"
                                      onClick={() => handleOpenEditExpense(item)}
                                      className="p-1.5 text-slate-500 hover:text-amber-800 hover:bg-amber-50 rounded-lg transition cursor-pointer"
                                      title="Sửa thông tin khoản chi"
                                    >
                                      <Edit className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteExpenseItem(item)}
                                      className="p-1.5 text-slate-400 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                                      title="Xóa khoản chi này"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                ) : (
                                  <span className="text-[11px] text-slate-400 font-sans italic">
                                    Chỉ xem
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                    {filteredExpensesList.length > 0 && (
                      <tfoot className="bg-[#FAF8F5] border-t border-amber-200 font-sans text-xs sticky bottom-0 z-20">
                        <tr>
                          <td colSpan={4} className="py-1.5 px-1.5 sm:py-2.5 sm:px-3 font-bold text-slate-700 text-right text-[10px] sm:text-xs">
                            TỔNG CỘNG CHI ({filteredExpensesList.length} khoản):
                          </td>
                          <td className="py-1.5 px-1.5 sm:py-2.5 sm:px-3 text-right font-mono font-bold text-rose-800 text-xs sm:text-sm whitespace-nowrap">
                            -{filteredExpensesList.reduce((sum, item) => sum + (Number(item.amount) || 0), 0).toLocaleString('vi-VN')} đ
                          </td>
                          <td colSpan={3} className="py-1.5 px-1.5 sm:py-2.5 sm:px-3 text-slate-500 text-[9.5px] sm:text-[11px]">
                            (Số dư quỹ hiện tại: <strong>{fundBalance.toLocaleString('vi-VN')} đ</strong>)
                          </td>
                        </tr>
                      </tfoot>
                    )}
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

          {/* --------------------------------------------------------------- */}
          {/* TAB 3: QUÝ THẦY CÔ GIÁO K8A1 (SHEET: "Thay_Co_K8A1") */}
          {/* --------------------------------------------------------------- */}
          {activeTab === 'teachers' && (
            <div className="space-y-4">
              {/* Header card with Action Toolbar */}
              <div className="bg-white p-3.5 rounded-xl border border-amber-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-bold font-serif text-slate-900 flex items-center gap-2">
                      <GraduationCap className="w-5 h-5 text-amber-600" />
                      <span>Danh Sách Quý Thầy Cô K8A1 ({teacherStats.total} Thầy Cô)</span>
                    </h3>
                    <p className="text-xs text-slate-500 font-sans">
                      Quản lý công tác tri ân, tiến độ gửi thiệp mời, phương án đưa đón và đón tiếp tại Hội Khóa 20 Năm.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={handleSyncTeachersFromSheet}
                      disabled={isSyncingTeachers}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-amber-50 text-amber-900 border border-amber-300 text-xs font-sans font-bold rounded-lg transition cursor-pointer shadow-2xs"
                      title="Tải lại danh sách Thầy Cô mới nhất"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 text-amber-700 ${isSyncingTeachers ? 'animate-spin' : ''}`} />
                      <span>{isSyncingTeachers ? 'Đang tải...' : 'Làm Mới'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleOpenAddTeacher}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 text-white text-xs font-sans font-bold rounded-lg shadow-sm transition cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Thêm Quý Thầy Cô</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Filters Toolbar with Interactive Chips */}
              <div className="bg-white p-3 rounded-xl border border-amber-200 space-y-2.5">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={teacherSearch}
                      onChange={(e) => setTeacherSearch(e.target.value)}
                      placeholder="Tìm theo tên Thầy Cô, môn dạy, SĐT, BLL phụ trách..."
                      className="w-full pl-9 pr-3 py-1.5 bg-[#FAF9F5] border border-slate-300 rounded-lg text-xs font-serif text-slate-900 focus:outline-none focus:border-amber-500"
                    />
                    {teacherSearch && (
                      <button
                        type="button"
                        onClick={() => setTeacherSearch('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-wrap text-xs">
                    <select
                      value={teacherStatusFilter}
                      onChange={(e) => setTeacherStatusFilter(e.target.value)}
                      className="px-2.5 py-1.5 bg-[#FAF9F5] border border-slate-300 rounded-lg font-sans text-xs focus:outline-none focus:border-amber-500"
                    >
                      <option value="all">Tất cả trạng thái</option>
                      <option value="attending">Chắc chắn tham dự</option>
                      <option value="pending">Đang liên hệ</option>
                      <option value="wishing">Gửi lời chúc từ xa</option>
                      <option value="declined">Báo bận / Không về</option>
                      <option value="memorial">Tưởng nhớ tri ân</option>
                    </select>

                    <select
                      value={teacherRoleFilter}
                      onChange={(e) => setTeacherRoleFilter(e.target.value)}
                      className="px-2.5 py-1.5 bg-[#FAF9F5] border border-slate-300 rounded-lg font-sans text-xs focus:outline-none focus:border-amber-500"
                    >
                      <option value="all">Tất cả vai trò</option>
                      <option value="homeroom">Giáo viên Chủ nhiệm</option>
                      <option value="subject">Giáo viên Bộ môn</option>
                    </select>
                  </div>
                </div>

                {/* Quick Status Filter Chips */}
                <div className="flex items-center gap-1.5 pt-2 border-t border-slate-100 text-[11px] font-sans overflow-x-auto no-scrollbar py-0.5">
                  <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider shrink-0 mr-0.5">Lọc:</span>
                  <button
                    type="button"
                    onClick={() => setTeacherStatusFilter('all')}
                    className={`px-2.5 py-1 rounded-full font-medium transition cursor-pointer shrink-0 whitespace-nowrap ${
                      teacherStatusFilter === 'all'
                        ? 'bg-amber-800 text-white shadow-xs font-bold'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    Tất cả ({teacherStats.total})
                  </button>
                  <button
                    type="button"
                    onClick={() => setTeacherStatusFilter('attending')}
                    className={`px-2.5 py-1 rounded-full font-medium transition cursor-pointer shrink-0 whitespace-nowrap ${
                      teacherStatusFilter === 'attending'
                        ? 'bg-emerald-700 text-white shadow-xs font-bold'
                        : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    ✓ Chắc chắn về ({teacherStats.attending})
                  </button>
                  <button
                    type="button"
                    onClick={() => setTeacherStatusFilter('pending')}
                    className={`px-2.5 py-1 rounded-full font-medium transition cursor-pointer shrink-0 whitespace-nowrap ${
                      teacherStatusFilter === 'pending'
                        ? 'bg-amber-600 text-white shadow-xs font-bold'
                        : 'bg-amber-50 hover:bg-amber-100 text-amber-900'
                    }`}
                  >
                    ⏳ Đang liên hệ ({teacherStats.pending})
                  </button>
                  <button
                    type="button"
                    onClick={() => setTeacherStatusFilter('wishing')}
                    className={`px-2.5 py-1 rounded-full font-medium transition cursor-pointer shrink-0 whitespace-nowrap ${
                      teacherStatusFilter === 'wishing'
                        ? 'bg-purple-700 text-white shadow-xs font-bold'
                        : 'bg-purple-50 hover:bg-purple-100 text-purple-800'
                    }`}
                  >
                    💌 Lời chúc từ xa ({teacherStats.wishing})
                  </button>
                  <button
                    type="button"
                    onClick={() => setTeacherStatusFilter('declined')}
                    className={`px-2.5 py-1 rounded-full font-medium transition cursor-pointer shrink-0 whitespace-nowrap ${
                      teacherStatusFilter === 'declined'
                        ? 'bg-rose-700 text-white shadow-xs font-bold'
                        : 'bg-rose-50 hover:bg-rose-100 text-rose-800'
                    }`}
                  >
                    ✕ Báo bận
                  </button>
                </div>
              </div>

              {/* Table / List */}
              <div className="bg-white rounded-xl border border-amber-200 shadow-xs overflow-hidden">
                <div className="overflow-x-auto overflow-y-auto max-h-[62vh] sm:max-h-[68vh] relative">
                  <table className="w-full text-left text-xs border-separate border-spacing-0">
                    <thead className="bg-[#F8F5EE] text-slate-600 font-sans uppercase text-[9px] sm:text-[10px] tracking-tight sm:tracking-wider">
                      <tr>
                        <th className="py-1.5 px-1 sm:py-2.5 sm:px-3 w-8 min-w-[32px] max-w-[32px] sm:w-10 sm:min-w-[40px] sm:max-w-[40px] text-center sticky top-0 left-0 z-30 bg-[#F8F5EE] border-b border-amber-200">STT</th>
                        <th className="py-1.5 px-1.5 sm:py-2.5 sm:px-3 min-w-[110px] sm:min-w-[170px] sticky top-0 left-8 sm:left-10 z-30 bg-[#F8F5EE] border-b border-r border-amber-200 shadow-[3px_0_6px_-2px_rgba(0,0,0,0.08)]">Quý Thầy / Cô</th>
                        <th className="py-1.5 px-1.5 sm:py-2.5 sm:px-3 sticky top-0 z-20 bg-[#F8F5EE] border-b border-amber-200">Môn & Vai Trò</th>
                        <th className="py-1.5 px-1.5 sm:py-2.5 sm:px-3 sticky top-0 z-20 bg-[#F8F5EE] border-b border-amber-200">Liên Hệ & Địa Chỉ</th>
                        <th className="py-1.5 px-1.5 sm:py-2.5 sm:px-3 text-center sticky top-0 z-20 bg-[#F8F5EE] border-b border-amber-200">Tiến Độ Thiệp</th>
                        <th className="py-1.5 px-1.5 sm:py-2.5 sm:px-3 text-center sticky top-0 z-20 bg-[#F8F5EE] border-b border-amber-200">Tham Dự</th>
                        <th className="py-1.5 px-1.5 sm:py-2.5 sm:px-3 sticky top-0 z-20 bg-[#F8F5EE] border-b border-amber-200">Đưa Đón & Đi Kèm</th>
                        <th className="py-1.5 px-1.5 sm:py-2.5 sm:px-3 sticky top-0 z-20 bg-[#F8F5EE] border-b border-amber-200">BLL Phụ Trách</th>
                        <th className="py-1.5 px-1.5 sm:py-2.5 sm:px-3 text-right sticky top-0 z-20 bg-[#F8F5EE] border-b border-amber-200">Thao Tác</th>
                      </tr>
                    </thead>
                    <tbody className="font-sans">
                      {filteredAdminTeachers.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="py-12 text-center text-slate-400">
                            <GraduationCap className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                            <p className="font-serif italic text-sm">Chưa có Thầy Cô nào phù hợp bộ lọc.</p>
                            <button
                              type="button"
                              onClick={handleOpenAddTeacher}
                              className="mt-2 text-xs text-amber-700 hover:text-amber-900 font-bold underline cursor-pointer"
                            >
                              + Thêm Thầy Cô đầu tiên
                            </button>
                          </td>
                        </tr>
                      ) : (
                        filteredAdminTeachers.map((t, idx) => {
                          const isAttending = t.status === 'attending';
                          const isWishing = t.status === 'wishing';
                          const isMemorial = t.status === 'memorial';

                          return (
                            <tr key={t.id} className="group hover:bg-amber-50/40 transition">
                              <td className="py-1 px-1 sm:py-2.5 sm:px-3 text-center text-slate-400 font-mono sticky left-0 z-10 bg-white group-hover:bg-[#FFF9EE] w-8 min-w-[32px] max-w-[32px] sm:w-10 sm:min-w-[40px] sm:max-w-[40px] border-b border-slate-100 text-[10px] sm:text-xs">
                                {idx + 1}
                              </td>

                              <td className="py-1 px-1.5 sm:py-2.5 sm:px-3 sticky left-8 sm:left-10 z-10 bg-white group-hover:bg-[#FFF9EE] min-w-[110px] sm:min-w-[170px] border-b border-r border-amber-200/80 shadow-[3px_0_6px_-2px_rgba(0,0,0,0.08)]">
                                <div className="flex items-center gap-2.5">
                                  <img
                                    src={t.avatarUrl || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80'}
                                    alt={t.name}
                                    referrerPolicy="no-referrer"
                                    className="w-7 h-7 sm:w-10 sm:h-10 rounded-full object-cover border border-amber-300 shrink-0"
                                    onError={(e: any) => {
                                      e.target.src = 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80';
                                    }}
                                  />
                                  <div>
                                    <div className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-1 leading-tight sm:leading-normal">
                                      <span>{t.name}</span>
                                      <span className="text-[10px] font-mono text-slate-400">({t.id})</span>
                                    </div>
                                    <div className="text-[10px] sm:text-[11px] text-slate-500 font-serif italic">
                                      {t.gender || 'Cô'} {t.birthYear ? `• Sinh năm ${t.birthYear}` : ''} {t.workStatus ? `• ${t.workStatus}` : ''}
                                    </div>
                                  </div>
                                </div>
                              </td>

                              <td className="py-1 px-1.5 sm:py-2.5 sm:px-3 border-b border-slate-100">
                                <div className="font-semibold text-amber-900 text-xs">
                                  {t.role || 'Giáo viên'}
                                </div>
                                <div className="text-[11px] text-slate-500 font-medium">
                                  Môn: {t.subject || 'Toàn trường'}
                                </div>
                              </td>

                              <td className="py-1 px-1.5 sm:py-2.5 sm:px-3 border-b border-slate-100">
                                <div className="font-mono text-slate-800 text-xs">
                                  {t.phone || 'Chưa có SĐT'}
                                </div>
                                {t.relativePhone && (
                                  <div className="text-[10.5px] text-slate-500 font-sans">
                                    Người thân: <span className="font-mono">{t.relativePhone}</span>
                                  </div>
                                )}
                                {t.address && (
                                  <div className="text-[10.5px] text-slate-500 truncate max-w-[180px]" title={t.address}>
                                    📍 {t.address}
                                  </div>
                                )}
                              </td>

                              <td className="py-1 px-1.5 sm:py-2.5 sm:px-3 text-center whitespace-nowrap border-b border-slate-100">
                                <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                  t.inviteProgress?.includes('tận tay')
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                    : t.inviteProgress?.includes('điện tử') || t.inviteProgress?.includes('đã gửi')
                                    ? 'bg-blue-50 text-blue-800 border-blue-300'
                                    : 'bg-slate-100 text-slate-600 border-slate-200'
                                }`}>
                                  {t.inviteProgress || 'Chưa gửi'}
                                </span>
                              </td>

                              <td className="py-1 px-1.5 sm:py-2.5 sm:px-3 text-center whitespace-nowrap border-b border-slate-100">
                                {isAttending ? (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-300">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                    <span>Tham dự</span>
                                  </span>
                                ) : isWishing ? (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-300">
                                    <Sparkles className="w-3 h-3 text-amber-600" />
                                    <span>Gửi lời chúc</span>
                                  </span>
                                ) : isMemorial ? (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-purple-800 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-300">
                                    <Heart className="w-3 h-3 text-purple-600 fill-purple-200" />
                                    <span>Tưởng nhớ</span>
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-sky-800 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-300">
                                    <Clock className="w-3 h-3 text-sky-600" />
                                    <span>Đang liên hệ</span>
                                  </span>
                                )}
                              </td>

                              <td className="py-1 px-1.5 sm:py-2.5 sm:px-3 border-b border-slate-100">
                                {t.transportation && (
                                  <div className="text-slate-800 font-medium text-xs flex items-center gap-1">
                                    <Car className="w-3 h-3 text-amber-700 shrink-0" />
                                    <span>{t.transportation}</span>
                                  </div>
                                )}
                                {t.companion && t.companion !== 'Đi một mình' && (
                                  <div className="text-[11px] text-emerald-700 font-sans">
                                    Đi kèm: {t.companion}
                                  </div>
                                )}
                              </td>

                              <td className="py-1 px-1.5 sm:py-2.5 sm:px-3 border-b border-slate-100">
                                <div className="font-semibold text-slate-800 text-xs">
                                  {t.coordinator || 'Chưa phân công'}
                                </div>
                                {t.healthNotes && (
                                  <div className="text-[10.5px] text-rose-600 italic truncate max-w-[140px]" title={t.healthNotes}>
                                    ⚠️ {t.healthNotes}
                                  </div>
                                )}
                              </td>

                              <td className="py-1 px-1.5 sm:py-2.5 sm:px-3 text-right whitespace-nowrap border-b border-slate-100">
                                <div className="flex items-center justify-end gap-1">
                                  <button
                                    type="button"
                                    onClick={() => handleOpenEditTeacher(t)}
                                    className="p-1.5 text-slate-500 hover:text-amber-800 hover:bg-amber-50 rounded-lg transition cursor-pointer"
                                    title="Sửa thông tin Thầy Cô"
                                  >
                                    <Edit className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteTeacherItem(t)}
                                    className="p-1.5 text-slate-400 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                                    title="Xóa Thầy Cô này"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
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
          {/* TAB 4: WISHES GUESTBOOK CRUD */}
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
                      title="Mở kho ảnh kỷ niệm trực tuyến của lớp K8A1"
                    >
                      <Folder className="w-3.5 h-3.5 text-amber-600" />
                      <span>Kho Ảnh Kỷ Niệm</span>
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
                        onError={(e) => {
                          const fallback = DEFAULT_EVENT_CONFIG.heroBannerUrl || '';
                          if (fallback && (e.target as HTMLImageElement).src !== fallback) {
                            (e.target as HTMLImageElement).src = fallback;
                          } else {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }
                        }}
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
                          placeholder="https://... dán link ảnh JPG/PNG/Web"
                          className="flex-1 px-3 py-2 bg-[#FAF8F5] border border-slate-300 rounded-lg font-mono text-xs focus:outline-none focus:border-amber-500"
                        />
                        
                        <label className={`inline-flex items-center justify-center gap-1.5 px-4 py-2 ${isUploadingBanner ? 'bg-amber-700 text-white cursor-wait opacity-80' : 'bg-slate-800 hover:bg-slate-900 text-amber-200 cursor-pointer'} font-bold rounded-lg transition whitespace-nowrap shadow-xs`}>
                          {isUploadingBanner ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-300" />
                              <span>Đang nén & tải lên...</span>
                            </>
                          ) : (
                            <>
                              <Upload className="w-3.5 h-3.5" />
                              <span>Tải Ảnh Từ Máy</span>
                            </>
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            disabled={isUploadingBanner}
                            onChange={handleBannerFileUpload}
                            className="hidden"
                          />
                        </label>
                      </div>
                      <p className="text-[11px] text-slate-500 italic">
                        💡 Hỗ trợ: Link ảnh trực tiếp JPG/PNG, link ảnh trực tuyến (tự động chuyển thành CDN hiển thị trực tiếp), hoặc chọn file từ máy (tự động nén &amp; lưu trữ an toàn).
                      </p>
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
                  <div className="bg-white rounded-2xl border border-amber-300/80 shadow-sm p-5 sm:p-6 space-y-5">
                    {/* Header & Quick Action Presets */}
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between border-b border-amber-200 pb-3.5 gap-3">
                      <div className="flex items-center gap-2.5">
                        <span className="p-2 bg-amber-100 text-amber-800 rounded-xl">
                          <MapPin className="w-5 h-5" />
                        </span>
                        <div>
                          <h4 className="font-serif font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                            <span>1. Địa Điểm Tổ Chức & Hành Trình Hội Ngộ</span>
                            {Boolean(eventConfigForm.enableTwoVenues) && (
                              <span className="text-[10px] font-sans font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full border border-amber-200">
                                2 Chặng Liên Hoàn
                              </span>
                            )}
                          </h4>
                          <p className="text-[11px] text-slate-500 font-sans">
                            Hiển thị tại mục Hội Ngộ, Thư Ngỏ thiệp mời, Thẻ học sinh và Lịch trình họp lớp
                          </p>
                        </div>
                      </div>

                      {/* Presets Button Bar */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          type="button"
                          onClick={() => {
                            setEventConfigForm({
                              ...eventConfigForm,
                              enableTwoVenues: true,
                              venueName: "Trường THPT Thái Nguyên",
                              venueSubtitle: "Chặng 1: Đón tiếp nhận áo, thăm trường xưa, chụp ảnh lưu niệm & tri ân Thầy Cô",
                              venueAddress: "Số 127 đường Lương Thế Vinh, P. Quang Trung, TP. Thái Nguyên, Tỉnh Thái Nguyên",
                              shortAddress: "127 Lương Thế Vinh, TP. Thái Nguyên",
                              venueTime: "08:30 — 11:00 (Sáng)",
                              venueActivity: "Đón tiếp nhận áo polo • Thẻ học sinh tri kỷ • Thăm lớp học xưa • Chụp ảnh lưu niệm sân trường • Tri ân Thầy Cô",
                              mapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3710.2798642279267!2d105.8285514!3d21.5740443!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135272a24921915%3A0xe543df5e9e03fa54!2zVHLGsOG7nW5nIFRIUFQgVGjDoWkgTmd1ecOqbg!5e0!3m2!1svi!2svn!4v1710000000000!5m2!1svi!2svn",
                              mapDirectUrl: "https://www.google.com/maps/search/?api=1&query=Tr%C6%B0%E1%BB%9Dng+THPT+Th%C3%A1i+Nguy%C3%AAn,+127+L%C6%B0%C6%A1ng+Th%E1%BA%BF+Vinh,+Th%C3%A1i+Nguy%C3%AAn",
                              venue2Name: "Trung Tâm Sự Kiện & Nhà Hàng Prime Thái Nguyên",
                              venue2Subtitle: "Chặng 2: Khai tiệc liên hoan, nâng ly chúc mừng 20 năm, giao lưu văn nghệ & trao kỷ vật",
                              venue2Address: "Số 1 đường Hoàng Văn Thụ, P. Phan Đình Phùng, TP. Thái Nguyên, Tỉnh Thái Nguyên",
                              venue2ShortAddress: "Số 1 Hoàng Văn Thụ, TP. Thái Nguyên",
                              venue2Time: "11:30 — 15:30 (Trưa & Chiều)",
                              venue2Activity: "Khai tiệc liên hoan • Nâng ly chúc mừng 20 năm • Giao lưu âm nhạc & chuyện đời tri kỷ • Trao kỷ vật hội ngộ",
                              venue2MapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d600!2d105.8386089!3d21.5949009!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x52211cf3f4926b%3A0x6de9f091b88c49ab!2sTh%C3%A1p%20%C4%91%C3%B4i%20Prime%20Th%C3%A1i%20Nguy%C3%AAn!5e1!3m2!1svi!2svn!4v1725550000000!5m2!1svi!2svn",
                              venue2MapDirectUrl: "https://maps.app.goo.gl/a3utiYosZqGHKDjYA",
                              routeDistanceText: "~1.5km (Di chuyển 5 - 10 phút)",
                              routeDirectUrl: "https://www.google.com/maps/dir/?api=1&origin=Tr%C6%B0%E1%BB%9Dng+THPT+Th%C3%A1i+Nguy%C3%AAn,+127+L%C6%B0%C6%A1ng+Th%E1%BA%BF+Vinh,+Th%C3%A1i+Nguy%C3%AAn&destination=Th%C3%A1p+%C4%91%C3%B4i+Prime+Th%C3%A1i+Nguy%C3%AAn,+S%E1%BB%91+1+Ho%C3%A0ng+V%C4%83n+Th%E1%BB%A5,+Th%C3%A1i+Nguy%C3%AAn"
                            });
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer"
                          title="Áp dụng cấu hình chuẩn 2 chặng: Trường THPT Thái Nguyên + Tháp đôi Prime"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                          <span>⚡ Mẫu Chuẩn 2 Chặng K8A1</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setEventConfigForm({
                              ...eventConfigForm,
                              enableTwoVenues: false,
                              venueName: "Trung Tâm Sự Kiện & Nhà Hàng Prime Thái Nguyên",
                              venueSubtitle: "Địa điểm tổ chức Họp Lớp 20 Năm Ngày Trở Về — Lớp K8A1",
                              venueAddress: "Số 1 đường Hoàng Văn Thụ, P. Phan Đình Phùng, TP. Thái Nguyên, Tỉnh Thái Nguyên",
                              shortAddress: "Số 1 Hoàng Văn Thụ, TP. Thái Nguyên",
                              mapDirectUrl: "https://maps.app.goo.gl/a3utiYosZqGHKDjYA",
                              mapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d600!2d105.8386089!3d21.5949009!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x52211cf3f4926b%3A0x6de9f091b88c49ab!2sTh%C3%A1p%20%C4%91%C3%B4i%20Prime%20Th%C3%A1i%20Nguy%C3%AAn!5e1!3m2!1svi!2svn!4v1725550000000!5m2!1svi!2svn"
                            });
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition cursor-pointer"
                          title="Chỉ dùng 1 địa điểm là Nhà hàng Prime"
                        >
                          <span>Chỉ Prime</span>
                        </button>
                      </div>
                    </div>

                    {/* Toggle Bật/Tắt 2 Chặng */}
                    <div className="p-3.5 bg-[#FAF9F6] rounded-xl border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-0.5">
                        <label className="font-bold text-slate-800 text-xs sm:text-sm flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={Boolean(eventConfigForm.enableTwoVenues)}
                            onChange={(e) => setEventConfigForm({ ...eventConfigForm, enableTwoVenues: e.target.checked })}
                            className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
                          />
                          <span>Bật chế độ Hành Trình Hội Ngộ 2 Chặng (Trường Cũ + Nhà Hàng Liên Hoan)</span>
                        </label>
                        <p className="text-[11px] text-slate-500 pl-6">
                          Hiển thị lộ trình liên hoàn: Sáng đón tiếp & thăm trường cũ (THPT Thái Nguyên), trưa di chuyển sang nhà hàng (Prime) khai tiệc.
                        </p>
                      </div>

                      <span className={`self-start sm:self-center px-2.5 py-1 rounded-full text-[11px] font-sans font-bold uppercase tracking-wider shrink-0 ${
                        Boolean(eventConfigForm.enableTwoVenues)
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-slate-100 text-slate-600 border border-slate-300'
                      }`}>
                        {Boolean(eventConfigForm.enableTwoVenues) ? '✓ Đang Bật 2 Chặng' : '1 Địa Điểm Đơn Lẻ'}
                      </span>
                    </div>

                    {/* Sub-Tab Navigation (nếu bật 2 chặng) */}
                    {Boolean(eventConfigForm.enableTwoVenues) && (
                      <div className="flex border-b border-amber-200 gap-2 overflow-x-auto">
                        <button
                          type="button"
                          onClick={() => setVenueSettingsTab('stage1')}
                          className={`pb-2.5 px-3 text-xs font-sans font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap border-b-2 -mb-px ${
                            venueSettingsTab === 'stage1'
                              ? 'border-amber-600 text-amber-900 bg-amber-50/50 rounded-t-lg'
                              : 'border-transparent text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          <GraduationCap className="w-4 h-4 text-amber-700" />
                          <span>Chặng 1: Trường Cũ (Sáng)</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setVenueSettingsTab('stage2')}
                          className={`pb-2.5 px-3 text-xs font-sans font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap border-b-2 -mb-px ${
                            venueSettingsTab === 'stage2'
                              ? 'border-rose-600 text-rose-900 bg-rose-50/50 rounded-t-lg'
                              : 'border-transparent text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          <Utensils className="w-4 h-4 text-rose-700" />
                          <span>Chặng 2: Nhà Hàng (Trưa & Chiều)</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setVenueSettingsTab('route')}
                          className={`pb-2.5 px-3 text-xs font-sans font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap border-b-2 -mb-px ${
                            venueSettingsTab === 'route'
                              ? 'border-slate-800 text-slate-900 bg-slate-50 rounded-t-lg'
                              : 'border-transparent text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          <Car className="w-4 h-4 text-slate-700" />
                          <span>Lộ Trình Di Chuyển ({eventConfigForm.routeDistanceText || '~1.5km'})</span>
                        </button>
                      </div>
                    )}

                    {/* ======================================================== */}
                    {/* SUB-PANEL 1: CHẶNG 1 (TRƯỜNG CŨ HOẶC ĐỊA ĐIỂM DUY NHẤT) */}
                    {/* ======================================================== */}
                    {(!eventConfigForm.enableTwoVenues || venueSettingsTab === 'stage1') && (
                      <div className="space-y-4 pt-1">
                        {Boolean(eventConfigForm.enableTwoVenues) && (
                          <div className="p-2.5 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center justify-between">
                            <span className="font-semibold">🏫 Cấu hình Chặng 1: Tập trung đón tiếp, điểm danh nhận áo, chụp ảnh kỷ niệm & tri ân Thầy Cô</span>
                            <span className="font-mono text-[11px] text-amber-700 bg-white px-2 py-0.5 rounded border border-amber-200">08:30 — 11:00</span>
                          </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                          <div className="space-y-1.5">
                            <label className="font-bold text-slate-700 flex items-center justify-between">
                              <span>{Boolean(eventConfigForm.enableTwoVenues) ? 'Tên Điểm Chặng 1 (*):' : 'Tên Địa Điểm (*):'}</span>
                              <span className="text-[11px] font-normal text-slate-400">VD: Trường THPT Thái Nguyên</span>
                            </label>
                            <input
                              type="text"
                              required
                              value={eventConfigForm.venueName}
                              onChange={(e) => setEventConfigForm({ ...eventConfigForm, venueName: e.target.value })}
                              placeholder="VD: Trường THPT Thái Nguyên"
                              className="w-full px-3 py-2 bg-[#FAF9F6] border border-slate-300 rounded-lg font-bold text-slate-900 focus:outline-none focus:border-amber-500"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="font-bold text-slate-700">
                              Khung Giờ Chặng 1:
                            </label>
                            <input
                              type="text"
                              value={eventConfigForm.venueTime || ''}
                              onChange={(e) => setEventConfigForm({ ...eventConfigForm, venueTime: e.target.value })}
                              placeholder="VD: 08:30 — 11:00 (Sáng)"
                              className="w-full px-3 py-2 bg-[#FAF9F6] border border-slate-300 rounded-lg focus:outline-none focus:border-amber-500"
                            />
                          </div>

                          <div className="space-y-1.5 sm:col-span-2">
                            <label className="font-bold text-slate-700">
                              Phụ Đề / Ý Nghĩa Chặng 1:
                            </label>
                            <input
                              type="text"
                              value={eventConfigForm.venueSubtitle || ''}
                              onChange={(e) => setEventConfigForm({ ...eventConfigForm, venueSubtitle: e.target.value })}
                              placeholder="VD: Chặng 1: Đón tiếp nhận áo, thăm trường xưa, chụp ảnh lưu niệm & tri ân Thầy Cô"
                              className="w-full px-3 py-2 bg-[#FAF9F6] border border-slate-300 rounded-lg focus:outline-none focus:border-amber-500"
                            />
                          </div>

                          <div className="space-y-1.5 sm:col-span-2">
                            <label className="font-bold text-slate-700">
                              Địa Chỉ Đầy Đủ Chặng 1 (*):
                            </label>
                            <input
                              type="text"
                              required
                              value={eventConfigForm.venueAddress}
                              onChange={(e) => setEventConfigForm({ ...eventConfigForm, venueAddress: e.target.value })}
                              placeholder="VD: Số 127 đường Lương Thế Vinh, P. Quang Trung, TP. Thái Nguyên, Tỉnh Thái Nguyên"
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
                              placeholder="VD: 127 Lương Thế Vinh, TP. Thái Nguyên"
                              className="w-full px-3 py-2 bg-[#FAF9F6] border border-slate-300 rounded-lg focus:outline-none focus:border-amber-500"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="font-bold text-slate-700 flex items-center justify-between">
                              <span>Link Google Maps Trực Tiếp:</span>
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
                              placeholder="https://maps.app.goo.gl/..."
                              className="w-full px-3 py-2 bg-[#FAF9F6] border border-slate-300 rounded-lg font-mono text-xs focus:outline-none focus:border-amber-500"
                            />
                          </div>

                          <div className="space-y-1.5 sm:col-span-2">
                            <label className="font-bold text-slate-700 flex items-center justify-between">
                              <span>Danh Sách Hoạt Động Chặng 1:</span>
                              <span className="text-[11px] text-slate-400 font-normal">Ngăn cách các hoạt động bằng dấu • hoặc xuống dòng</span>
                            </label>
                            <textarea
                              rows={2}
                              value={eventConfigForm.venueActivity || ''}
                              onChange={(e) => setEventConfigForm({ ...eventConfigForm, venueActivity: e.target.value })}
                              placeholder="Đón tiếp nhận áo polo • Thẻ học sinh tri kỷ • Thăm lớp học xưa • Chụp ảnh lưu niệm • Tri ân Thầy Cô"
                              className="w-full px-3 py-2 bg-[#FAF9F6] border border-slate-300 rounded-lg text-xs focus:outline-none focus:border-amber-500"
                            />
                          </div>

                          <div className="space-y-1.5 sm:col-span-2">
                            <label className="font-bold text-slate-700 flex items-center justify-between">
                              <span>Link Nhúng Bản Đồ Google Maps (iframe embed):</span>
                              <span className="text-[11px] text-slate-400 font-normal">Dán nguyên thẻ iframe, hệ thống sẽ tự bóc tách link</span>
                            </label>
                            <input
                              type="text"
                              value={eventConfigForm.mapEmbedUrl}
                              onChange={(e) => {
                                const raw = e.target.value;
                                const iframeMatch = raw.match(/src=["']([^"']+)["']/i);
                                const cleaned = iframeMatch && iframeMatch[1] ? iframeMatch[1] : raw.trim();
                                setEventConfigForm({ ...eventConfigForm, mapEmbedUrl: cleaned });
                              }}
                              placeholder="https://www.google.com/maps/embed?pb=..."
                              className="w-full px-3 py-2 bg-[#FAF9F6] border border-slate-300 rounded-lg font-mono text-xs focus:outline-none focus:border-amber-500"
                            />
                          </div>

                          {/* Live Preview Chặng 1 */}
                          {eventConfigForm.mapEmbedUrl && (
                            <div className="sm:col-span-2 space-y-1.5">
                              <label className="font-bold text-slate-600 text-[11px]">Xem trước bản đồ Chặng 1:</label>
                              <div className="rounded-xl overflow-hidden border border-amber-300/60 aspect-video max-h-52 bg-slate-100">
                                <iframe
                                  title="Xem trước bản đồ Chặng 1"
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

                    {/* ======================================================== */}
                    {/* SUB-PANEL 2: CHẶNG 2 (NHÀ HÀNG / TRUNG TÂM SỰ KIỆN) */}
                    {/* ======================================================== */}
                    {Boolean(eventConfigForm.enableTwoVenues) && venueSettingsTab === 'stage2' && (
                      <div className="space-y-4 pt-1">
                        <div className="p-2.5 bg-rose-50/70 border border-rose-200 rounded-xl text-xs text-rose-900 flex items-center justify-between">
                          <span className="font-semibold">🥂 Cấu hình Chặng 2: Khai tiệc liên hoan, nâng ly chúc mừng 20 năm, giao lưu văn nghệ & trao kỷ vật</span>
                          <span className="font-mono text-[11px] text-rose-700 bg-white px-2 py-0.5 rounded border border-rose-200">11:30 — 15:30</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                          <div className="space-y-1.5">
                            <label className="font-bold text-slate-700 flex items-center justify-between">
                              <span>Tên Nhà Hàng / Trung Tâm Sự Kiện (*):</span>
                              <span className="text-[11px] font-normal text-slate-400">VD: Tháp đôi Prime Thái Nguyên</span>
                            </label>
                            <input
                              type="text"
                              required
                              value={eventConfigForm.venue2Name || ''}
                              onChange={(e) => setEventConfigForm({ ...eventConfigForm, venue2Name: e.target.value })}
                              placeholder="VD: Trung Tâm Sự Kiện & Nhà Hàng Prime Thái Nguyên"
                              className="w-full px-3 py-2 bg-[#FAF9F6] border border-slate-300 rounded-lg font-bold text-slate-900 focus:outline-none focus:border-rose-500"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="font-bold text-slate-700">
                              Khung Giờ Chặng 2:
                            </label>
                            <input
                              type="text"
                              value={eventConfigForm.venue2Time || ''}
                              onChange={(e) => setEventConfigForm({ ...eventConfigForm, venue2Time: e.target.value })}
                              placeholder="VD: 11:30 — 15:30 (Trưa & Chiều)"
                              className="w-full px-3 py-2 bg-[#FAF9F6] border border-slate-300 rounded-lg focus:outline-none focus:border-rose-500"
                            />
                          </div>

                          <div className="space-y-1.5 sm:col-span-2">
                            <label className="font-bold text-slate-700">
                              Phụ Đề / Ý Nghĩa Chặng 2:
                            </label>
                            <input
                              type="text"
                              value={eventConfigForm.venue2Subtitle || ''}
                              onChange={(e) => setEventConfigForm({ ...eventConfigForm, venue2Subtitle: e.target.value })}
                              placeholder="VD: Chặng 2: Khai tiệc liên hoan, giao lưu văn nghệ & trao kỷ vật hội ngộ"
                              className="w-full px-3 py-2 bg-[#FAF9F6] border border-slate-300 rounded-lg focus:outline-none focus:border-rose-500"
                            />
                          </div>

                          <div className="space-y-1.5 sm:col-span-2">
                            <label className="font-bold text-slate-700">
                              Địa Chỉ Đầy Đủ Nhà Hàng (*):
                            </label>
                            <input
                              type="text"
                              required
                              value={eventConfigForm.venue2Address || ''}
                              onChange={(e) => setEventConfigForm({ ...eventConfigForm, venue2Address: e.target.value })}
                              placeholder="VD: Số 1 đường Hoàng Văn Thụ, P. Phan Đình Phùng, TP. Thái Nguyên, Tỉnh Thái Nguyên"
                              className="w-full px-3 py-2 bg-[#FAF9F6] border border-slate-300 rounded-lg focus:outline-none focus:border-rose-500"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="font-bold text-slate-700">
                              Địa Chỉ Rút Gọn Nhà Hàng:
                            </label>
                            <input
                              type="text"
                              value={eventConfigForm.venue2ShortAddress || ''}
                              onChange={(e) => setEventConfigForm({ ...eventConfigForm, venue2ShortAddress: e.target.value })}
                              placeholder="VD: Số 1 Hoàng Văn Thụ, TP. Thái Nguyên"
                              className="w-full px-3 py-2 bg-[#FAF9F6] border border-slate-300 rounded-lg focus:outline-none focus:border-rose-500"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="font-bold text-slate-700 flex items-center justify-between">
                              <span>Link Google Maps Nhà Hàng:</span>
                              {eventConfigForm.venue2MapDirectUrl && (
                                <a
                                  href={eventConfigForm.venue2MapDirectUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[11px] text-rose-700 hover:text-rose-900 inline-flex items-center gap-1 font-bold"
                                >
                                  <span>Mở Thử</span>
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                            </label>
                            <input
                              type="url"
                              value={eventConfigForm.venue2MapDirectUrl || ''}
                              onChange={(e) => setEventConfigForm({ ...eventConfigForm, venue2MapDirectUrl: e.target.value })}
                              placeholder="https://maps.app.goo.gl/..."
                              className="w-full px-3 py-2 bg-[#FAF9F6] border border-slate-300 rounded-lg font-mono text-xs focus:outline-none focus:border-rose-500"
                            />
                          </div>

                          <div className="space-y-1.5 sm:col-span-2">
                            <label className="font-bold text-slate-700 flex items-center justify-between">
                              <span>Danh Sách Hoạt Động Chặng 2:</span>
                              <span className="text-[11px] text-slate-400 font-normal">Ngăn cách các hoạt động bằng dấu • hoặc xuống dòng</span>
                            </label>
                            <textarea
                              rows={2}
                              value={eventConfigForm.venue2Activity || ''}
                              onChange={(e) => setEventConfigForm({ ...eventConfigForm, venue2Activity: e.target.value })}
                              placeholder="Khai tiệc liên hoan • Nâng ly chúc mừng 20 năm • Giao lưu âm nhạc & chuyện đời • Trao quà kỷ niệm"
                              className="w-full px-3 py-2 bg-[#FAF9F6] border border-slate-300 rounded-lg text-xs focus:outline-none focus:border-rose-500"
                            />
                          </div>

                          <div className="space-y-1.5 sm:col-span-2">
                            <label className="font-bold text-slate-700 flex items-center justify-between">
                              <span>Link Nhúng Bản Đồ Nhà Hàng (iframe embed):</span>
                              <span className="text-[11px] text-slate-400 font-normal">Dán nguyên thẻ iframe, hệ thống sẽ tự bóc tách link</span>
                            </label>
                            <input
                              type="text"
                              value={eventConfigForm.venue2MapEmbedUrl || ''}
                              onChange={(e) => {
                                const raw = e.target.value;
                                const iframeMatch = raw.match(/src=["']([^"']+)["']/i);
                                const cleaned = iframeMatch && iframeMatch[1] ? iframeMatch[1] : raw.trim();
                                setEventConfigForm({ ...eventConfigForm, venue2MapEmbedUrl: cleaned });
                              }}
                              placeholder="https://www.google.com/maps/embed?pb=..."
                              className="w-full px-3 py-2 bg-[#FAF9F6] border border-slate-300 rounded-lg font-mono text-xs focus:outline-none focus:border-rose-500"
                            />
                          </div>

                          {/* Live Preview Chặng 2 */}
                          {eventConfigForm.venue2MapEmbedUrl && (
                            <div className="sm:col-span-2 space-y-1.5">
                              <label className="font-bold text-slate-600 text-[11px]">Xem trước bản đồ Chặng 2:</label>
                              <div className="rounded-xl overflow-hidden border border-rose-300/60 aspect-video max-h-52 bg-slate-100">
                                <iframe
                                  title="Xem trước bản đồ Chặng 2"
                                  src={eventConfigForm.venue2MapEmbedUrl}
                                  className="w-full h-full border-0"
                                  loading="lazy"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* ======================================================== */}
                    {/* SUB-PANEL 3: LỘ TRÌNH DI CHUYỂN GIỮA 2 ĐIỂM */}
                    {/* ======================================================== */}
                    {Boolean(eventConfigForm.enableTwoVenues) && venueSettingsTab === 'route' && (
                      <div className="space-y-4 pt-1">
                        <div className="p-2.5 bg-slate-100 border border-slate-300 rounded-xl text-xs text-slate-800 flex items-center justify-between">
                          <span className="font-semibold">🚗 Hướng dẫn di chuyển từ Trường THPT Thái Nguyên sang Nhà Hàng Prime</span>
                          <span className="font-mono text-[11px] text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                            {eventConfigForm.routeDistanceText || '~1.5km (5 - 10 phút)'}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                          <div className="space-y-1.5">
                            <label className="font-bold text-slate-700">
                              Mô Tả Khoảng Cách & Thời Gian:
                            </label>
                            <input
                              type="text"
                              value={eventConfigForm.routeDistanceText || ''}
                              onChange={(e) => setEventConfigForm({ ...eventConfigForm, routeDistanceText: e.target.value })}
                              placeholder="VD: ~1.5km (Di chuyển 5 - 10 phút)"
                              className="w-full px-3 py-2 bg-[#FAF9F6] border border-slate-300 rounded-lg focus:outline-none focus:border-slate-500"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="font-bold text-slate-700 flex items-center justify-between">
                              <span>Link Google Maps Lộ Trình (Dir):</span>
                              {eventConfigForm.routeDirectUrl && (
                                <a
                                  href={eventConfigForm.routeDirectUrl}
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
                              value={eventConfigForm.routeDirectUrl || ''}
                              onChange={(e) => setEventConfigForm({ ...eventConfigForm, routeDirectUrl: e.target.value })}
                              placeholder="https://www.google.com/maps/dir/?api=1&origin=...&destination=..."
                              className="w-full px-3 py-2 bg-[#FAF9F6] border border-slate-300 rounded-lg font-mono text-xs focus:outline-none focus:border-slate-500"
                            />
                          </div>

                          <div className="sm:col-span-2 p-3 bg-amber-50/50 rounded-xl border border-amber-200 text-slate-600 text-xs leading-relaxed space-y-1">
                            <p className="font-bold text-amber-900">💡 Mẹo tạo đường link lộ trình tự động trên Google Maps:</p>
                            <p>
                              Link lộ trình có cấu trúc chuẩn dạng:
                              <br />
                              <code className="text-[11px] text-amber-800 bg-white px-1.5 py-0.5 rounded border border-amber-200 break-all">
                                https://www.google.com/maps/dir/?api=1&origin=Trường+THPT+Thái+Nguyên&destination=Tháp+đôi+Prime+Thái+Nguyên
                              </code>
                            </p>
                            <p>Khi thành viên bấm vào nút trên WebApp, Google Maps trên điện thoại sẽ tự động mở ứng dụng và dẫn đường lái xe từ trường sang nhà hàng một cách mượt mà.</p>
                          </div>
                        </div>
                      </div>
                    )}

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
                        <label className="font-bold text-slate-700 flex items-center justify-between">
                          <span>Logo Trường THPT Thái Nguyên:</span>
                          <span className="text-[10px] text-amber-700 font-normal">Hiển thị ở Navbar, Hero, Bảng vàng & Footer</span>
                        </label>
                        <div className="flex items-center gap-2">
                          <img 
                            src={eventConfigForm.schoolLogoUrl || "https://thpttn.tnue.edu.vn/upload/doantn/logo%20thpttn.jpg"}
                            alt="Logo Trường" 
                            className="w-9 h-9 rounded-full object-cover bg-white p-0.5 border border-amber-300 shrink-0 shadow-2xs"
                            onError={(e: any) => {
                              e.target.src = '/logo-thpt-thai-nguyen.jpg';
                            }}
                          />
                          <input
                            type="text"
                            value={eventConfigForm.schoolLogoUrl || ''}
                            onChange={(e) => setEventConfigForm({ ...eventConfigForm, schoolLogoUrl: e.target.value })}
                            placeholder="https://thpttn.tnue.edu.vn/upload/doantn/logo%20thpttn.jpg"
                            className="w-full px-3 py-2 bg-[#FAF9F6] border border-slate-300 rounded-lg text-xs font-mono focus:outline-none focus:border-amber-500"
                          />
                        </div>
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
                                onChange={(e) => setEventConfigForm({ ...eventConfigForm, fundAmountPerPerson: Number(e.target.value) || 700000 })}
                                placeholder="700000"
                                className="w-full px-3 py-2 bg-[#FAF9F6] border border-slate-300 rounded-lg font-bold text-amber-800 focus:outline-none focus:border-amber-500"
                              />
                              <div className="flex items-center gap-1.5">
                                {[500000, 700000, 1000000, 1500000].map((amt) => (
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
                            
                            {isUploadingCustomQr ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-300 rounded-lg text-[11px] font-bold text-amber-800 animate-pulse shrink-0">
                                <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-600" />
                                <span>Đang tải lên...</span>
                              </span>
                            ) : (
                              <label className="inline-flex items-center gap-1 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 hover:border-amber-400 rounded-lg text-[11px] font-bold text-slate-700 cursor-pointer shrink-0 transition-colors shadow-xs">
                                <Upload className="w-3.5 h-3.5 text-amber-700" />
                                <span>Tải file ảnh</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    setIsUploadingCustomQr(true);
                                    try {
                                      const compressed = await compressImageToJpeg(file, 800, 0.85);
                                      const targetScriptUrl = appsScriptUrl || localStorage.getItem('apps_script_url') || '';
                                      if (targetScriptUrl && targetScriptUrl.trim()) {
                                        try {
                                          const res = await fetch(targetScriptUrl, {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                                            body: JSON.stringify({
                                              action: 'upload_photo',
                                              fileData: compressed,
                                              caption: 'Custom_VietQR_K8A1'
                                            })
                                          });
                                          const result = await res.json();
                                          if (result && result.status === 'success' && result.data && (result.data.url || result.data.driveUrl)) {
                                            const driveUrl = result.data.url || result.data.driveUrl;
                                            setEventConfigForm(prev => ({ ...prev, customQrUrl: driveUrl }));
                                            return;
                                          }
                                        } catch (uploadErr) {
                                          console.warn('Lỗi upload custom QR lên Drive:', uploadErr);
                                        }
                                      }
                                      setEventConfigForm(prev => ({ ...prev, customQrUrl: compressed }));
                                    } catch (err) {
                                      console.error('Lỗi xử lý file QR:', err);
                                    } finally {
                                      setIsUploadingCustomQr(false);
                                      e.target.value = '';
                                    }
                                  }}
                                />
                              </label>
                            )}
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
                            5. Cấu Hình Mã PIN & Máy Chủ Dữ Liệu
                          </h4>
                          <p className="text-[11px] text-slate-500 font-sans">
                            Quản lý quyền đăng nhập Admin/BLL và liên kết hệ thống dữ liệu
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-amber-900 bg-amber-100 px-2 py-0.5 rounded border border-amber-300 font-bold">
                        👑 Admin Only
                      </span>
                    </div>

                    {isAdmin ? (
                      <div className="space-y-4 text-xs">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="space-y-1.5">
                            <label className="font-bold text-slate-700 flex items-center justify-between">
                              <span>👑 Mã PIN Admin:</span>
                              <span className="font-mono text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 font-bold text-[10px]">••••</span>
                            </label>
                            <input
                              type="password"
                              maxLength={4}
                              value={newAdminPin}
                              onChange={(e) => setNewAdminPin(e.target.value.replace(/\D/g, ''))}
                              placeholder="Nhập 4 số PIN Admin mới..."
                              className="w-full px-3 py-2 bg-[#FAF8F5] border border-slate-300 rounded-lg font-mono text-sm focus:outline-none focus:border-amber-500"
                            />
                            <p className="text-[10px] text-slate-500">Toàn quyền hệ thống & cấu hình</p>
                          </div>

                          <div className="space-y-1.5">
                            <label className="font-bold text-slate-700 flex items-center justify-between">
                              <span>💰 Mã PIN Thủ Quỹ:</span>
                              <span className="font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 font-bold text-[10px]">••••</span>
                            </label>
                            <input
                              type="password"
                              maxLength={4}
                              value={newTreasurerPin}
                              onChange={(e) => setNewTreasurerPin(e.target.value.replace(/\D/g, ''))}
                              placeholder="Nhập 4 số PIN Thủ Quỹ mới..."
                              className="w-full px-3 py-2 bg-[#FAF8F5] border border-slate-300 rounded-lg font-mono text-sm focus:outline-none focus:border-emerald-500"
                            />
                            <p className="text-[10px] text-slate-500">Đối soát bill nộp & chi tiêu quỹ</p>
                          </div>

                          <div className="space-y-1.5">
                            <label className="font-bold text-slate-700 flex items-center justify-between">
                              <span>🛡️ Mã PIN Ban Liên Lạc:</span>
                              <span className="font-mono text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200 font-bold text-[10px]">••••</span>
                            </label>
                            <input
                              type="password"
                              maxLength={4}
                              value={newBllPin}
                              onChange={(e) => setNewBllPin(e.target.value.replace(/\D/g, ''))}
                              placeholder="Nhập 4 số PIN BLL mới..."
                              className="w-full px-3 py-2 bg-[#FAF8F5] border border-slate-300 rounded-lg font-mono text-sm focus:outline-none focus:border-indigo-500"
                            />
                            <p className="text-[10px] text-slate-500">Giám sát, điểm danh, xuất CSV</p>
                          </div>
                        </div>

                        {/* Admin verification & Save PIN button */}
                        <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-xl space-y-3">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="space-y-1">
                              <label className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                                <Lock className="w-3.5 h-3.5 text-amber-700" />
                                <span>Xác minh mã PIN Admin hiện tại (*):</span>
                              </label>
                              <p className="text-[11px] text-slate-500">
                                Nhập 4 số PIN Admin đang dùng để xác thực quyền đổi mã PIN hệ thống
                              </p>
                            </div>
                            <input
                              type="password"
                              maxLength={4}
                              value={currentAdminPinConfirm}
                              onChange={(e) => setCurrentAdminPinConfirm(e.target.value.replace(/\D/g, ''))}
                              placeholder="••••"
                              className="w-32 px-3 py-1.5 bg-white border border-amber-300 rounded-lg font-mono text-center tracking-widest text-sm focus:outline-none focus:border-amber-600 font-bold shadow-inner"
                            />
                          </div>

                          <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 border-t border-amber-200/80">
                            <p className="text-[11px] text-amber-900/80 flex items-center gap-1">
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span>Mã PIN được băm mật mã SHA-256 và đồng bộ bảo mật trực tiếp</span>
                            </p>
                            <button
                              type="button"
                              disabled={isUpdatingPins}
                              onClick={handleUpdateSecurityPins}
                              className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-amber-700 to-amber-800 hover:from-amber-800 hover:to-amber-900 text-white font-bold rounded-xl text-xs shadow-sm transition cursor-pointer disabled:opacity-50"
                            >
                              {isUpdatingPins ? (
                                <>
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  <span>Đang Đồng Bộ Mã PIN...</span>
                                </>
                              ) : (
                                <>
                                  <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
                                  <span>Lưu & Đồng Bộ Mã PIN</span>
                                </>
                              )}
                            </button>
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
                                  Máy Chủ Dữ Liệu & Backend (Code.gs)
                                </h4>
                                <p className="text-[11px] text-slate-500">
                                  Lưu trữ tập trung mọi dữ liệu: Điểm danh, Lời chúc, Cấu hình sự kiện & Thư viện Media.
                                </p>
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-2 shrink-0">
                              <button
                                type="button"
                                disabled={isCheckingSecuritySheet}
                                onClick={handleInitSecuritySheet}
                                className="px-3 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 shadow-sm bg-slate-900 hover:bg-slate-800 text-amber-300 disabled:opacity-50"
                              >
                                {isCheckingSecuritySheet ? (
                                  <>
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    <span>Đang tạo sheet...</span>
                                  </>
                                ) : (
                                  <>
                                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                                    <span>Khởi Tạo Sheet PIN</span>
                                  </>
                                )}
                              </button>

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
                          </div>

                          {/* Quick Deployment Guide */}
                          <div className="bg-white/90 rounded-xl p-3 border border-amber-200 space-y-2 text-[11.5px] text-slate-700 shadow-xs">
                            <div className="font-bold text-amber-900 flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                              <span>Cách triển khai để dữ liệu đồng nhất trên mọi máy tính và điện thoại:</span>
                            </div>
                            <ol className="list-decimal list-inside space-y-1 text-slate-600 pl-1 leading-relaxed">
                              <li>
                                Mở bảng dữ liệu quản trị lớp &gt; Nhấn menu <strong>Tiện ích mở rộng</strong> &gt; <strong>Apps Script</strong>.
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
                              <span>💡 Dữ liệu Điểm danh, Lời chúc, Ảnh biên lai và Cấu hình sự kiện được lưu trữ bảo mật trên hệ thống.</span>
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
                            disabled={isUpdatingPins}
                            onClick={handleResetToDefault}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 rounded-lg text-xs font-bold border border-slate-200 transition cursor-pointer disabled:opacity-50"
                          >
                            {isUpdatingPins ? 'Đang Xử Lý...' : 'Khôi Phục PIN Mặc Định (8888 / 6868 / 2006)'}
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

          {/* --------------------------------------------------------------- */}
          {/* TAB 7: STAGE PRESENTATION & MUSIC PLAYLIST SETTINGS             */}
          {/* --------------------------------------------------------------- */}
          {activeTab === 'presentation' && (
            <div className="space-y-6 max-w-4xl mx-auto pb-8 text-left">
              {/* Header Info Banner */}
              <div className="bg-gradient-to-r from-purple-900/20 via-indigo-900/10 to-slate-900/40 rounded-2xl p-5 border border-purple-400/40 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="p-2 bg-gradient-to-tr from-purple-600 to-indigo-600 text-white rounded-xl shadow-md">
                      <Tv className="w-5 h-5" />
                    </span>
                    <div>
                      <h3 className="text-base sm:text-lg font-serif font-bold text-slate-900">
                        Cấu Hình Trình Chiếu Màn LED & Playlist Nhạc Nền
                      </h3>
                      <p className="text-xs text-slate-600 font-sans">
                        Chuẩn bị sân khấu hội trường tiệc kỷ niệm: Chiếu backdrop 16:9 sắc nét, phát nhạc nền thanh xuân & lồng ghép thư viện ảnh kỷ niệm Ken Burns thay thế video tốn kém.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {onOpenStagePresentation && (
                    <button
                      type="button"
                      onClick={onOpenStagePresentation}
                      className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-sans font-bold rounded-xl shadow-md transition cursor-pointer flex items-center gap-2"
                      title="Mở toàn màn hình để chiếu thử lên màn LED"
                    >
                      <PlaySquare className="w-4 h-4" />
                      <span>Chiếu Thử Màn LED</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleSavePresentationConfig}
                    disabled={isSavingPresentation}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-sans font-bold rounded-xl shadow-md transition cursor-pointer flex items-center gap-2 disabled:opacity-50"
                  >
                    {isSavingPresentation ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    <span>{isSavingPresentation ? 'Đang lưu...' : 'Lưu Lên Google Sheets'}</span>
                  </button>
                </div>
              </div>

              {presentationSuccessMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2 animate-fadeIn">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{presentationSuccessMsg}</span>
                </div>
              )}

              {/* Sub-navigation inside Presentation Tab */}
              <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                <button
                  type="button"
                  onClick={() => setPresentationSubTab('backdrop')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                    presentationSubTab === 'backdrop'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100 bg-white border border-slate-200'
                  }`}
                >
                  <ImageIcon className="w-4 h-4" />
                  <span>1. Backdrop Sân Khấu ({stageBackdrops.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPresentationSubTab('music')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                    presentationSubTab === 'music'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100 bg-white border border-slate-200'
                  }`}
                >
                  <Music className="w-4 h-4" />
                  <span>2. Playlist Nhạc Nền ({stagePlaylist.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPresentationSubTab('settings')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                    presentationSubTab === 'settings'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100 bg-white border border-slate-200'
                  }`}
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  <span>3. Cài Đặt Hiệu Ứng Sân Khấu</span>
                </button>
              </div>

              {/* ------------------------------------------------------------- */}
              {/* SUB-PANEL 1: BACKDROPS                                        */}
              {/* ------------------------------------------------------------- */}
              {presentationSubTab === 'backdrop' && (
                <div className="space-y-4">
                  {/* Notice */}
                  <div className="p-4 bg-sky-50 border border-sky-200 rounded-2xl text-xs text-sky-900 flex items-start gap-3">
                    <Info className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold mb-1">Thư mục Google Drive lưu trữ Maket / Backdrop sân khấu:</p>
                      <p className="text-slate-600 leading-relaxed">
                        Các ảnh backdrop được lưu trữ tự động trong thư mục con <strong className="font-mono bg-sky-100 px-1 py-0.5 rounded text-sky-800">"Backdrops_SanKhau"</strong> trên Google Drive của lớp (ID: <code className="text-sky-800">{K8A1_DRIVE_FOLDER_ID}</code>). Tỷ lệ chuẩn cho màn LED hội trường là <strong>16:9</strong> (1920x1080 hoặc 3840x2160).
                      </p>
                    </div>
                  </div>

                  {/* Add Backdrop Form */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                      <Plus className="w-4 h-4 text-purple-600" />
                      Thêm Maket / Backdrop Màn LED Mới
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          Tiêu đề / Tên mẫu Backdrop *
                        </label>
                        <input
                          type="text"
                          placeholder="VD: Backdrop Tiệc Trưa Nhà Hàng Prime"
                          value={newBackdropTitle}
                          onChange={(e) => setNewBackdropTitle(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-purple-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          Tải ảnh từ máy (Tự động tải lên Google Drive)
                        </label>
                        <label className="flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-purple-300 hover:border-purple-500 bg-purple-50/50 hover:bg-purple-50 text-purple-700 rounded-xl text-xs font-bold cursor-pointer transition">
                          {isUploadingBackdrop ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>Đang tải lên Drive...</span>
                            </>
                          ) : (
                            <>
                              <Upload className="w-4 h-4" />
                              <span>Chọn file ảnh Backdrop</span>
                            </>
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            disabled={isUploadingBackdrop}
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              setIsUploadingBackdrop(true);
                              try {
                                const base64 = await compressImageToJpeg(file, 2560, 0.88);
                                const title = newBackdropTitle.trim() || file.name.replace(/\.[^/.]+$/, '');
                                const pin = getAdminPinToken();
                                const res = await uploadBackdropViaBackend({ fileData: base64, title, pin }, appsScriptUrl);
                                if (res.success && res.data) {
                                  const updated = [...stageBackdrops, res.data];
                                  persistPresentationBackdrops(updated);
                                  setNewBackdropTitle('');
                                  setNewBackdropUrl('');
                                  setPresentationSuccessMsg('Đã tải backdrop lên Google Drive và tự động lưu cấu hình thành công!');
                                } else {
                                  alert('Không thể tải backdrop lên Google Drive: ' + (res.message || 'Lỗi không xác định'));
                                }
                              } catch (err: any) {
                                alert('Lỗi xử lý file ảnh: ' + (err?.message || err));
                              } finally {
                                setIsUploadingBackdrop(false);
                                e.target.value = '';
                              }
                            }}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Hoặc Dán Đường Link URL Ảnh Backdrop Trực Tiếp:
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="url"
                          placeholder="https://... (Link ảnh trực tiếp hoặc link xem trước Google Drive)"
                          value={newBackdropUrl}
                          onChange={(e) => setNewBackdropUrl(e.target.value)}
                          className="flex-1 px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-purple-500"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (!newBackdropUrl.trim()) {
                              alert('Vui lòng nhập đường link ảnh backdrop!');
                              return;
                            }
                            const title = newBackdropTitle.trim() || `Backdrop Sân Khấu #${stageBackdrops.length + 1}`;
                            const newBd: BackdropItem = {
                              id: 'bd_' + Date.now(),
                              title,
                              url: normalizeImageUrl(newBackdropUrl.trim()),
                              thumbnail: normalizeImageUrl(newBackdropUrl.trim()),
                              isDefault: stageBackdrops.length === 0
                            };
                            const updated = [...stageBackdrops, newBd];
                            persistPresentationBackdrops(updated);
                            setNewBackdropTitle('');
                            setNewBackdropUrl('');
                            setPresentationSuccessMsg('Đã thêm backdrop mới và tự động lưu cấu hình thành công!');
                          }}
                          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Thêm URL</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Backdrops Cards List */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {stageBackdrops.map((bd, idx) => (
                      <div
                        key={bd.id || idx}
                        className={`bg-white border rounded-2xl overflow-hidden shadow-xs transition hover:shadow-md flex flex-col ${
                          bd.isDefault ? 'border-purple-400 ring-2 ring-purple-400/20' : 'border-slate-200'
                        }`}
                      >
                        {/* Image Preview 16:9 */}
                        <div className="relative aspect-video bg-slate-950 flex items-center justify-center overflow-hidden group">
                          <img
                            src={bd.url}
                            alt={bd.title}
                            className="w-full h-full object-contain group-hover:scale-105 transition duration-500"
                          />
                          {bd.isDefault && (
                            <span className="absolute top-2 left-2 px-2.5 py-1 bg-purple-600 text-white rounded-full text-[10px] font-bold shadow-md flex items-center gap-1">
                              <Check className="w-3 h-3" />
                              Mặc định
                            </span>
                          )}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => setViewingBackdropPreview(bd.url)}
                              className="p-2 bg-white/90 hover:bg-white text-slate-900 rounded-full shadow cursor-pointer"
                              title="Xem kích thước đầy đủ"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Card Content */}
                        <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2">
                          <div>
                            <h5 className="text-xs font-bold text-slate-900 line-clamp-2">
                              {bd.title}
                            </h5>
                            {bd.dateCreated && (
                              <p className="text-[10px] text-slate-400 mt-0.5">
                                Tạo ngày: {bd.dateCreated}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                            <button
                              type="button"
                              onClick={() => {
                                const updated = stageBackdrops.map((item, i) => ({
                                  ...item,
                                  isDefault: i === idx
                                }));
                                persistPresentationBackdrops(updated);
                              }}
                              className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer text-[11px] ${
                                bd.isDefault
                                  ? 'text-purple-700 font-bold bg-purple-50'
                                  : 'text-slate-600 hover:text-purple-600 hover:bg-slate-100'
                              }`}
                            >
                              {bd.isDefault ? '✓ Đang làm mặc định' : 'Đặt làm mặc định'}
                            </button>

                            {stageBackdrops.length > 1 && (
                              <button
                                type="button"
                                onClick={() => {
                                  if (confirm(`Bạn có chắc muốn xóa backdrop "${bd.title}"?`)) {
                                    const updated = stageBackdrops.filter((_, i) => i !== idx);
                                    persistPresentationBackdrops(updated);
                                  }
                                }}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                                title="Xóa backdrop này"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ------------------------------------------------------------- */}
              {/* SUB-PANEL 2: MUSIC PLAYLIST                                   */}
              {/* ------------------------------------------------------------- */}
              {presentationSubTab === 'music' && (
                <div className="space-y-4">
                  {/* Notice */}
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 flex items-start gap-3">
                    <Music className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold mb-1">Playlist âm thanh thanh xuân phục vụ Trình Chiếu Màn LED & WebApp:</p>
                      <p className="text-slate-600 leading-relaxed">
                        Thay vì thuê dựng video kỷ niệm tốn kém hàng triệu đồng, hệ thống sẽ <strong>tự động đồng bộ các giai điệu này</strong> cùng hiệu ứng lướt ảnh Ken Burns trên màn hình LED lớn, giúp tiết kiệm tối đa kinh phí mà vẫn tạo cảm xúc hoài niệm sâu lắng.
                      </p>
                    </div>
                  </div>

                  {/* Add Track Form */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                      <Plus className="w-4 h-4 text-purple-600" />
                      Thêm Bài Hát Mới Vào Playlist
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          Tên ca khúc *
                        </label>
                        <input
                          type="text"
                          placeholder="VD: Phượng Hồng"
                          value={newTrackTitle}
                          onChange={(e) => setNewTrackTitle(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-purple-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          Ca sĩ / Người thể hiện
                        </label>
                        <input
                          type="text"
                          placeholder="VD: Vũ Khanh / Nhóm Tam Ca"
                          value={newTrackArtist}
                          onChange={(e) => setNewTrackArtist(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-purple-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Đường link YouTube hoặc Google Drive MP3 *
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="url"
                          placeholder="https://youtu.be/... hoặc https://drive.google.com/file/d/.../view"
                          value={newTrackUrl}
                          onChange={(e) => setNewTrackUrl(e.target.value)}
                          className="flex-1 px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-purple-500"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (!newTrackUrl.trim()) {
                              alert('Vui lòng nhập đường link bài hát!');
                              return;
                            }
                            if (!newTrackTitle.trim()) {
                              alert('Vui lòng nhập tên bài hát!');
                              return;
                            }
                            const isDrive = newTrackUrl.includes('drive.google.com');
                            const newTrack: MusicTrack = {
                              id: 'track_' + Date.now(),
                              title: newTrackTitle.trim(),
                              artist: newTrackArtist.trim() || 'K8A1 Tuyển Chọn',
                              sourceType: isDrive ? 'drive' : 'youtube',
                              url: newTrackUrl.trim(),
                              duration: 'Tùy chỉnh',
                              isCustom: true
                            };
                            setStagePlaylist((prev) => [...prev, newTrack]);
                            setNewTrackTitle('');
                            setNewTrackArtist('');
                            setNewTrackUrl('');
                            setPresentationSuccessMsg('Đã thêm bài hát mới vào Playlist!');
                          }}
                          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Thêm Bài</span>
                        </button>
                      </div>
                    </div>

                    {/* Quick Presets for Classic School Songs */}
                    <div className="pt-2 border-t border-slate-100">
                      <p className="text-[11px] font-bold text-slate-500 mb-2">
                        Gợi ý thêm nhanh các bài ca học trò kinh điển:
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          { title: "Mong Ước Kỷ Niệm Xưa", artist: "Tam Ca 3A", url: "https://youtu.be/ocvlV5LZ93Q" },
                          { title: "Tạm Biệt", artist: "Quang Vinh", url: "https://youtu.be/h9Hk_P1Xv2Y" },
                          { title: "Ngày Ấy Bạn Và Tôi", artist: "Lynk Lee", url: "https://youtu.be/Z0R73khjwfg" },
                          { title: "Xe Đạp", artist: "Thùy Chi & M4U", url: "https://youtu.be/HyCIkhbalPk" },
                          { title: "Giấc Mơ Thần Tiên", artist: "Miu Lê", url: "https://youtu.be/VHT6ouvKj_Q" },
                          { title: "Nụ Cười 18 20", artist: "Doãn Hiếu", url: "https://youtu.be/qOwNuWY30iw" }
                        ].map((preset, pIdx) => {
                          const isAlreadyIn = stagePlaylist.some(t => t.title.toLowerCase() === preset.title.toLowerCase());
                          return (
                            <button
                              key={pIdx}
                              type="button"
                              disabled={isAlreadyIn}
                              onClick={() => {
                                const newTrack: MusicTrack = {
                                  id: 'track_preset_' + Date.now() + '_' + pIdx,
                                  title: preset.title,
                                  artist: preset.artist,
                                  sourceType: 'youtube',
                                  url: preset.url,
                                  duration: '04:00'
                                };
                                setStagePlaylist((prev) => [...prev, newTrack]);
                              }}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition cursor-pointer flex items-center gap-1 ${
                                isAlreadyIn
                                  ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                                  : 'bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-800'
                              }`}
                            >
                              <span>+</span>
                              <span>{preset.title}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Playlist Reorder Table */}
                  <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                    <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Danh Sách Thứ Tự Phát ({stagePlaylist.length} bài)
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Có thể đổi thứ tự bằng nút mũi tên lên / xuống
                      </span>
                    </div>

                    <div className="divide-y divide-slate-100">
                      {stagePlaylist.map((track, idx) => (
                        <div
                          key={track.id || idx}
                          className="p-3 sm:p-3.5 flex items-center justify-between gap-3 hover:bg-slate-50/80 transition"
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <span className="w-6 text-center text-xs font-mono font-bold text-slate-400">
                              {(idx + 1).toString().padStart(2, '0')}
                            </span>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <p className="text-xs font-bold text-slate-900 truncate">
                                  {track.title}
                                </p>
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-mono">
                                  {track.sourceType === 'drive' ? 'Drive' : 'YouTube'}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 truncate">
                                {track.artist || 'K8A1 Tuyển Chọn'}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1">
                            {/* Move Up */}
                            <button
                              type="button"
                              disabled={idx === 0}
                              onClick={() => {
                                if (idx === 0) return;
                                const updated = [...stagePlaylist];
                                const temp = updated[idx - 1];
                                updated[idx - 1] = updated[idx];
                                updated[idx] = temp;
                                setStagePlaylist(updated);
                              }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
                              title="Di chuyển lên trên"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>

                            {/* Move Down */}
                            <button
                              type="button"
                              disabled={idx === stagePlaylist.length - 1}
                              onClick={() => {
                                if (idx === stagePlaylist.length - 1) return;
                                const updated = [...stagePlaylist];
                                const temp = updated[idx + 1];
                                updated[idx + 1] = updated[idx];
                                updated[idx] = temp;
                                setStagePlaylist(updated);
                              }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
                              title="Di chuyển xuống dưới"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete */}
                            {stagePlaylist.length > 1 && (
                              <button
                                type="button"
                                onClick={() => {
                                  if (confirm(`Bạn có chắc muốn xóa ca khúc "${track.title}"?`)) {
                                    setStagePlaylist((prev) => prev.filter((_, i) => i !== idx));
                                  }
                                }}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer transition"
                                title="Xóa bài hát"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ------------------------------------------------------------- */}
              {/* SUB-PANEL 3: STAGE SETTINGS                                   */}
              {/* ------------------------------------------------------------- */}
              {presentationSubTab === 'settings' && (
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-5">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4 text-purple-600" />
                    Cài Đặt Chế Độ Trình Chiếu Sân Khấu & Hiệu Ứng
                  </h4>

                  {/* Default Scene */}
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-2">
                      Chế độ hiển thị mặc định khi MC bấm mở Màn LED:
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {[
                        { id: 'backdrop' as StagePresentationScene, title: '1. Backdrop Màn LED', desc: 'Chỉ hiển thị ảnh phông nền sân khấu chính' },
                        { id: 'slideshow' as StagePresentationScene, title: '2. Ảnh Kỷ Niệm Ken Burns', desc: 'Lướt toàn màn hình toàn bộ 87+ ảnh kỷ niệm' },
                        { id: 'dual' as StagePresentationScene, title: '3. Kết Hợp Sân Khấu', desc: 'Backdrop làm khung viền, ảnh kỷ niệm ở giữa' }
                      ].map((sc) => (
                        <div
                          key={sc.id}
                          onClick={() => setStageSettingsState(prev => ({ ...prev, defaultScene: sc.id }))}
                          className={`p-3.5 rounded-xl border cursor-pointer transition ${
                            stageSettingsState.defaultScene === sc.id
                              ? 'bg-purple-50/80 border-purple-500 ring-2 ring-purple-500/20'
                              : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          <p className="text-xs font-bold text-slate-900">{sc.title}</p>
                          <p className="text-[11px] text-slate-500 mt-1">{sc.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Slideshow Speed */}
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-2">
                      Thời gian chuyển ảnh kỷ niệm (Tốc độ Ken Burns):
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {[4000, 6000, 8000, 10000].map((spd) => (
                        <button
                          key={spd}
                          type="button"
                          onClick={() => setStageSettingsState(prev => ({ ...prev, slideshowSpeed: spd }))}
                          className={`py-2 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                            stageSettingsState.slideshowSpeed === spd
                              ? 'bg-purple-600 border-purple-600 text-white shadow-sm'
                              : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          {spd / 1000} giây
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Toggles */}
                  <div className="space-y-3 pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <div>
                        <p className="text-xs font-bold text-slate-900">Tự động phát nhạc nền khi mở màn LED</p>
                        <p className="text-[11px] text-slate-500">Giúp hội trường lập tức có không khí âm nhạc du dương</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={stageSettingsState.autoPlayMusic !== false}
                        onChange={(e) => setStageSettingsState(prev => ({ ...prev, autoPlayMusic: e.target.checked }))}
                        className="w-4 h-4 accent-purple-600 rounded cursor-pointer"
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <div>
                        <p className="text-xs font-bold text-slate-900">Hiệu ứng bụi sao hoàng kim (Golden Sparkles)</p>
                        <p className="text-[11px] text-slate-500">Tạo ánh sáng lấp lánh sang trọng trên màn hình LED lớn</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={stageSettingsState.enableSparkles !== false}
                        onChange={(e) => setStageSettingsState(prev => ({ ...prev, enableSparkles: e.target.checked }))}
                        className="w-4 h-4 accent-purple-600 rounded cursor-pointer"
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <div>
                        <p className="text-xs font-bold text-slate-900">Hiển thị chú thích ảnh kỷ niệm</p>
                        <p className="text-[11px] text-slate-500">Hiển thị tên khoảnh khắc và thời gian ở cuối màn hình</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={stageSettingsState.showCaption !== false}
                        onChange={(e) => setStageSettingsState(prev => ({ ...prev, showCaption: e.target.checked }))}
                        className="w-4 h-4 accent-purple-600 rounded cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Volume Slider */}
                  <div className="pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-slate-800">Âm lượng khởi động mặc định:</span>
                      <span className="text-xs font-mono font-bold text-purple-700">{stageSettingsState.volume || 80}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={stageSettingsState.volume || 80}
                      onChange={(e) => setStageSettingsState(prev => ({ ...prev, volume: Number(e.target.value) }))}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                    />
                  </div>
                </div>
              )}

              {/* Bottom Save Button */}
              <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                <p className="text-xs text-slate-500 italic">
                  💡 Nhấn "Lưu Cấu Hình Màn LED" để đồng bộ lên Google Sheets và áp dụng ngay cho ngày hội ngộ.
                </p>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {onOpenStagePresentation && (
                    <button
                      type="button"
                      onClick={onOpenStagePresentation}
                      className="flex-1 sm:flex-none px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-purple-800 rounded-xl text-xs font-sans font-bold transition cursor-pointer flex items-center justify-center gap-2"
                    >
                      <PlaySquare className="w-4 h-4 text-purple-600" />
                      <span>Chiếu Thử Màn LED</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleSavePresentationConfig}
                    disabled={isSavingPresentation}
                    className="flex-1 sm:flex-none px-6 py-2.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs font-sans font-bold uppercase tracking-wider shadow-lg transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isSavingPresentation ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    <span>{isSavingPresentation ? 'Đang Lưu...' : 'Lưu Cấu Hình Màn LED'}</span>
                  </button>
                </div>
              </div>
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
                      Lưu và đồng bộ trực tiếp lên hệ thống
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
                      value={normalizeShirtSize(rosterFormData.shirtSize)}
                      onChange={(e) => setRosterFormData({ ...rosterFormData, shirtSize: e.target.value })}
                      className="w-full px-3 py-2 bg-[#FAF8F5] border border-slate-300 rounded-lg focus:outline-none focus:border-amber-500 cursor-pointer text-xs sm:text-sm"
                    >
                      <option value="">-- Chưa chọn size áo --</option>
                      {SHIRT_SIZE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
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
                <div className="p-2.5 bg-amber-50/70 border border-amber-200 rounded-lg space-y-1">
                  <label className="font-bold text-amber-950 flex items-center justify-between text-xs">
                    <span>🔗 Liên kết bạn học trong Danh bạ (Sĩ số 65 bạn):</span>
                    {memberFormData.memberId && (
                      <span className="font-mono text-amber-800 font-bold">Mã: {memberFormData.memberId}</span>
                    )}
                  </label>
                  <select
                    value={memberFormData.memberId || ''}
                    onChange={(e) => {
                      const selId = e.target.value;
                      const matched = rosterList.find(m => m.id === selId);
                      setMemberFormData({
                        ...memberFormData,
                        memberId: selId || undefined,
                        fullName: matched && !memberFormData.fullName ? matched.fullName : memberFormData.fullName,
                        nickname: matched && !memberFormData.nickname ? matched.nickname : memberFormData.nickname,
                        phone: matched && !memberFormData.phone ? matched.phone : memberFormData.phone
                      });
                    }}
                    className="w-full px-2.5 py-1.5 bg-white border border-amber-300 rounded-lg text-xs font-sans text-slate-800 focus:outline-none focus:border-amber-600 cursor-pointer"
                  >
                    <option value="">-- Tự động ghép nối theo Tên / SĐT --</option>
                    {rosterList.map((m, idx) => (
                      <option key={m.id || idx} value={m.id}>
                        {idx + 1}. {m.fullName} {m.nickname ? `(${m.nickname})` : ''} {m.id ? `[${m.id}]` : ''}
                      </option>
                    ))}
                  </select>
                </div>

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
                      value={normalizeShirtSize(memberFormData.shirtSize)}
                      onChange={(e) => setMemberFormData({ ...memberFormData, shirtSize: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-amber-500 cursor-pointer text-xs sm:text-sm"
                    >
                      <option value="">-- Chưa chọn size áo --</option>
                      {SHIRT_SIZE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
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
                      <option value="yes">✅ Có tham gia họp lớp</option>
                      <option value="no">❌ Rất tiếc vắng mặt</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Trạng Thái Đóng Quỹ ({standardFundAmount.toLocaleString('vi-VN')}đ):</label>
                    <select
                      value={memberFormData.fundStatus || 'unpaid'}
                      onChange={(e) => setMemberFormData({ ...memberFormData, fundStatus: e.target.value as any })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-amber-500 cursor-pointer"
                    >
                      <option value="unpaid">Chưa đóng</option>
                      <option value="paid">Đã đóng {standardFundAmount.toLocaleString('vi-VN')}đ</option>
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
                {adjustFundMember.status === 'no' && (
                  <div className="bg-slate-100 border border-slate-300 rounded-xl p-3 flex items-center gap-2 text-xs text-slate-700 shadow-2xs">
                    <span className="text-base shrink-0">🕊️</span>
                    <span>
                      <strong>Thành viên báo vắng mặt:</strong> Theo quy chế họp lớp K8A1, thành viên vắng <strong>không bắt buộc đóng tiền hay ủng hộ</strong>. Bạn chỉ cần nhập số tiền nếu bạn ấy <strong>tự nguyện đóng góp / ủng hộ quỹ lớp</strong>.
                    </span>
                  </div>
                )}

                {!canAuditAndSpend && (
                  <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3 flex items-center gap-2.5 text-xs text-indigo-900 shadow-2xs">
                    <span className="text-base shrink-0">👁️</span>
                    <span><strong>Chế độ Giám Sát BLL:</strong> Bạn đang xem chi tiết thông tin đối soát. Thẩm quyền duyệt khớp lệnh và lưu sửa đổi thuộc về <strong>Thủ Quỹ</strong> hoặc Admin.</span>
                  </div>
                )}

                {/* 1. Số tiền đóng & Presets */}
                <div className="space-y-1.5 bg-[#FAF8F5] p-3.5 rounded-xl border border-amber-200/80">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                      <DollarSign className="w-4 h-4 text-emerald-600" />
                      <span>Số Tiền Thực Nộp (VNĐ):</span>
                    </label>
                    <span className="text-[11px] font-mono text-slate-500">Chuẩn: {standardFundAmount.toLocaleString('vi-VN')} đ</span>
                  </div>

                  <input
                    type="number"
                    step={50000}
                    disabled={!canAuditAndSpend}
                    value={fundAdjustAmount}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setFundAdjustAmount(val);
                      if (val > 0 && fundAdjustStatus === 'unpaid') setFundAdjustStatus('paid');
                    }}
                    className={`w-full px-3.5 py-2.5 border rounded-lg font-mono text-lg font-bold shadow-2xs ${
                      canAuditAndSpend
                        ? 'bg-white border-slate-300 text-emerald-700 focus:outline-none focus:border-amber-500'
                        : 'bg-slate-100 border-slate-200 text-slate-700 cursor-not-allowed'
                    }`}
                  />

                  {/* Preset Buttons */}
                  {canAuditAndSpend && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {adjustFundMember.status === 'no' ? (
                        <>
                          <button
                            type="button"
                            onClick={() => { setFundAdjustAmount(0); setFundAdjustStatus('exempt'); }}
                            className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition cursor-pointer ${
                              fundAdjustAmount === 0 ? 'bg-slate-700 text-white' : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-300'
                            }`}
                          >
                            0đ (Miễn đóng)
                          </button>
                          <button
                            type="button"
                            onClick={() => { setFundAdjustAmount(500000); setFundAdjustStatus('paid'); }}
                            className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition cursor-pointer ${
                              fundAdjustAmount === 500000 ? 'bg-indigo-600 text-white shadow-2xs' : 'bg-white hover:bg-indigo-50 text-indigo-900 border border-indigo-200'
                            }`}
                          >
                            500k (Ủng hộ)
                          </button>
                          <button
                            type="button"
                            onClick={() => { setFundAdjustAmount(1000000); setFundAdjustStatus('paid'); }}
                            className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition cursor-pointer ${
                              fundAdjustAmount === 1000000 ? 'bg-indigo-600 text-white shadow-2xs' : 'bg-white hover:bg-indigo-50 text-indigo-900 border border-indigo-200'
                            }`}
                          >
                            1 Triệu (Ủng hộ)
                          </button>
                          <button
                            type="button"
                            onClick={() => { setFundAdjustAmount(2000000); setFundAdjustStatus('paid'); }}
                            className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition cursor-pointer ${
                              fundAdjustAmount === 2000000 ? 'bg-indigo-600 text-white shadow-2xs' : 'bg-white hover:bg-indigo-50 text-indigo-900 border border-indigo-200'
                            }`}
                          >
                            2 Triệu (Ủng hộ)
                          </button>
                          <button
                            type="button"
                            onClick={() => { setFundAdjustAmount(5000000); setFundAdjustStatus('paid'); }}
                            className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition cursor-pointer ${
                              fundAdjustAmount === 5000000 ? 'bg-amber-600 text-white shadow-2xs' : 'bg-white hover:bg-amber-50 text-amber-900 border border-amber-200'
                            }`}
                          >
                            5 Triệu (Tài trợ)
                          </button>
                        </>
                      ) : (
                        <>
                      <button
                        type="button"
                        onClick={() => { setFundAdjustAmount(standardFundAmount); setFundAdjustStatus('paid'); }}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition cursor-pointer ${
                          fundAdjustAmount === standardFundAmount ? 'bg-emerald-600 text-white shadow-2xs' : 'bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-200'
                        }`}
                      >
                        {standardFundAmount.toLocaleString('vi-VN')}đ Chuẩn
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
                        </>
                      )}
                    </div>
                  )}

                  {fundAdjustAmount > standardFundAmount && (
                    <div className="p-2 bg-amber-100 text-amber-900 rounded-lg text-[11px] font-sans font-medium flex items-center gap-1.5 mt-2">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>
                        Ủng hộ thêm: <strong>{(fundAdjustAmount - standardFundAmount).toLocaleString('vi-VN')} đ</strong> vào quỹ chung K8A1!
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
                      disabled={!canAuditAndSpend}
                      onChange={(e) => setFundAdjustStatus(e.target.value as any)}
                      className={`w-full px-3 py-2 border rounded-lg text-xs font-sans ${
                        canAuditAndSpend ? 'bg-[#FAF8F5] border-slate-300 focus:outline-none focus:border-amber-500 cursor-pointer' : 'bg-slate-100 border-slate-200 text-slate-600 cursor-not-allowed'
                      }`}
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
                      disabled={!canAuditAndSpend}
                      onChange={(e) => setFundAdjustPaymentMethod(e.target.value as any)}
                      className={`w-full px-3 py-2 border rounded-lg text-xs font-sans ${
                        canAuditAndSpend ? 'bg-[#FAF8F5] border-slate-300 focus:outline-none focus:border-amber-500 cursor-pointer' : 'bg-slate-100 border-slate-200 text-slate-600 cursor-not-allowed'
                      }`}
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
                      disabled={!canAuditAndSpend}
                      value={fundAdjustPaidAt}
                      onChange={(e) => setFundAdjustPaidAt(e.target.value)}
                      placeholder="VD: 01/09/2026 09:30"
                      className={`w-full px-3 py-2 border rounded-lg font-mono text-xs ${
                        canAuditAndSpend ? 'bg-[#FAF8F5] border-slate-300 focus:outline-none focus:border-amber-500' : 'bg-slate-100 border-slate-200 text-slate-600 cursor-not-allowed'
                      }`}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 text-xs block">Người xác nhận đối soát:</label>
                    <input
                      type="text"
                      disabled={!canAuditAndSpend}
                      value={fundAdjustAuditedBy}
                      onChange={(e) => setFundAdjustAuditedBy(e.target.value)}
                      placeholder="VD: Thủ Quỹ BLL / Admin"
                      className={`w-full px-3 py-2 border rounded-lg text-xs font-sans ${
                        canAuditAndSpend ? 'bg-[#FAF8F5] border-slate-300 focus:outline-none focus:border-amber-500' : 'bg-slate-100 border-slate-200 text-slate-600 cursor-not-allowed'
                      }`}
                    />
                  </div>
                </div>

                {/* 4. Ghi chú kế toán */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 text-xs block">Ghi chú giao dịch / Mã tham chiếu:</label>
                  <input
                    type="text"
                    disabled={!canAuditAndSpend}
                    value={fundAdjustNote}
                    onChange={(e) => setFundAdjustNote(e.target.value)}
                    placeholder="VD: Mã GD VCB-98124, bạn Hoàng nộp hộ, nộp tiền mặt..."
                    className={`w-full px-3 py-2 border rounded-lg text-xs font-sans ${
                      canAuditAndSpend ? 'bg-[#FAF8F5] border-slate-300 focus:outline-none focus:border-amber-500' : 'bg-slate-100 border-slate-200 text-slate-600 cursor-not-allowed'
                    }`}
                  />
                </div>

                {/* 5. Tải Lên & Đính Kèm Ảnh Chứng Từ / Bill (Tự tạo folder trên Drive) */}
                <div className="space-y-2 pt-2 border-t border-slate-200">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                      <Receipt className="w-4 h-4 text-blue-600" />
                      <span>Ảnh Chứng Từ / Bill / UNC Giao Dịch:</span>
                    </label>
                    <span className="text-[10px] text-slate-400">Tự động lưu trữ an toàn trên hệ thống</span>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      disabled={!canAuditAndSpend}
                      value={fundAdjustReceiptUrl}
                      onChange={(e) => setFundAdjustReceiptUrl(e.target.value)}
                      placeholder="Dán link ảnh hoặc URL chứng từ..."
                      className={`flex-1 px-3 py-2 border rounded-lg font-mono text-xs ${
                        canAuditAndSpend ? 'bg-[#FAF8F5] border-slate-300 focus:outline-none focus:border-amber-500' : 'bg-slate-100 border-slate-200 text-slate-600 cursor-not-allowed'
                      }`}
                    />

                    {canAuditAndSpend && (
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
                    )}
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
                        {canAuditAndSpend && (
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
                        )}
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
                    {canAuditAndSpend ? 'Hủy' : 'Đóng'}
                  </button>
                  {canAuditAndSpend ? (
                    <button
                      type="submit"
                      className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-xl shadow-md cursor-pointer transition text-xs"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Lưu Đối Soát & Đồng Bộ</span>
                    </button>
                  ) : (
                    <span className="text-xs text-indigo-700 font-sans italic px-3 py-1.5 bg-indigo-50 rounded-xl border border-indigo-200 flex items-center gap-1">
                      👁️ Read-Only (Chỉ Thủ Quỹ mới có quyền lưu)
                    </span>
                  )}
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
                    SĐT: {viewReceiptModal.phone || 'N/A'} • {viewReceiptModal.paymentMethod === 'cash' ? 'Tiền mặt' : 'Chuyển khoản'} • {formatDateTimeVi(viewReceiptModal.paidAt) || 'Đã xác nhận'}
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
                    <span>Đã đối soát khớp lệnh bởi <strong>{viewReceiptModal.auditedBy || 'Ban Liên Lạc'}</strong> ({formatDateTimeVi(viewReceiptModal.paidAt) || 'Vừa xong'})</span>
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
                {!canAuditAndSpend ? (
                  <span className="text-xs text-indigo-300 font-sans italic px-3 py-1.5 bg-indigo-950/60 rounded-xl border border-indigo-400/30">
                    👁️ Chế độ Giám Sát (Chỉ Thủ Quỹ mới có quyền duyệt bill)
                  </span>
                ) : viewReceiptModal.status !== 'paid' ? (
                  <>
                    <button
                      type="button"
                      onClick={handleApproveFundFromModal}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-600 text-white font-sans font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg transition cursor-pointer hover:scale-105 active:scale-95"
                    >
                      <Check className="w-4 h-4" />
                      <span>✅ Duyệt Khớp Lệnh ({(viewReceiptModal.amount || standardFundAmount).toLocaleString('vi-VN')} đ)</span>
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
                        <Edit className="w-3.5 h-3.5" />
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
                  🎬 Chèn Link Video Kỷ Niệm
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
                    placeholder="https://youtu.be/... hoặc link video preview"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:outline-none focus:border-amber-500"
                  />
                  <p className="text-[11px] text-slate-400">
                    Tự động hỗ trợ link YouTube, YouTube Shorts hoặc file MP4 trực tuyến.
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
                    {isUploadingPhoto ? (
                      <span className="px-3 py-2 bg-amber-50 text-amber-800 border border-amber-300 rounded-lg flex items-center gap-1.5 font-semibold text-[11px] animate-pulse">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-600" />
                        <span>Đang nén và tải lên Drive...</span>
                      </span>
                    ) : (
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
                    )}
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
                    placeholder="https://... dán link ảnh kỷ niệm"
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
      {/* MODAL: THÊM / SỬA KHOẢN CHI QUỸ LỚP (KHOAN_CHI) */}
      {/* =================================================================== */}
      <AnimatePresence>
        {isExpenseModalOpen && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl border border-amber-300 shadow-2xl w-full max-w-lg p-5 sm:p-6 space-y-4 text-xs my-auto max-h-[92vh] flex flex-col overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-rose-50 border border-rose-200 text-rose-700 flex items-center justify-center font-bold">
                    <Receipt className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold font-serif text-slate-900">
                      {editingExpense ? '✏️ Cập Nhật Khoản Chi' : '➕ Thêm Khoản Chi Mới'}
                    </h3>
                    <p className="text-[11px] text-slate-500 font-sans">
                      Sổ Chi Tiêu Quỹ Lớp K8A1 • Chuẩn Quy chế Điều 3 & 4
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsExpenseModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded-full cursor-pointer transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveExpense} className="space-y-3 overflow-y-auto pr-1 flex-1">
                {/* Gợi ý chi nhanh theo Quy chế & Sự kiện 20 năm */}
                <div className="bg-amber-50/60 p-2.5 rounded-2xl border border-amber-200/80 space-y-1.5">
                  <span className="text-[11px] font-sans font-bold text-amber-900 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>Chọn nhanh mẫu chi theo Quy chế:</span>
                  </span>
                  <div className="flex flex-wrap items-center gap-1.5 text-xs font-sans">
                    {[
                      { title: 'Phúng viếng tứ thân phụ mẫu (kèm vòng hoa)', cat: 'care', amt: 500000, label: '🌹 Viếng phụ mẫu (500k)', scope: 'Thường niên theo quy chế' },
                      { title: 'Thăm hỏi ốm đau / khó khăn đột xuất', cat: 'care', amt: 300000, label: '🩹 Thăm ốm đau (300k)', scope: 'Thường niên theo quy chế' },
                      { title: 'Đặt cọc sảnh tiệc Crown Palace Thái Nguyên', cat: 'party', amt: 5000000, label: '🍽️ Cọc tiệc Crown Palace (5tr)', scope: 'Kỷ niệm 20 năm' },
                      { title: 'Đặt may in áo polo đồng phục 20 năm K8A1', cat: 'souvenir', amt: 6750000, label: '👕 May áo polo K8A1 (6.75tr)', scope: 'Kỷ niệm 20 năm' },
                      { title: 'Hoa tươi & quà tri ân các Thầy Cô giáo cũ', cat: 'teacher', amt: 3000000, label: '💐 Quà tri ân Thầy Cô (3tr)', scope: 'Kỷ niệm 20 năm' },
                      { title: 'In ấn Backdrop sân khấu & Thẻ học sinh', cat: 'media', amt: 2500000, label: '📸 Backdrop & Thẻ (2.5tr)', scope: 'Kỷ niệm 20 năm' },
                    ].map(p => (
                      <button
                        key={p.title}
                        type="button"
                        onClick={() => {
                          setExpenseFormData(prev => ({
                            ...prev,
                            title: p.title,
                            category: p.cat as ExpenseCategory,
                            amount: p.amt,
                            eventScope: p.scope
                          }));
                          setExpenseAmountFormatted(p.amt.toLocaleString('vi-VN'));
                        }}
                        className="px-2 py-1 bg-white hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-lg text-[11px] font-medium transition cursor-pointer shadow-2xs"
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 1. Tên khoản chi */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 flex items-center gap-1">
                    <span>Nội dung / Tên khoản chi (*):</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={expenseFormData.title || ''}
                    onChange={(e) => setExpenseFormData({ ...expenseFormData, title: e.target.value })}
                    placeholder="VD: Đặt cọc sảnh tiệc Crown Palace, Phúng viếng phụ mẫu..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:border-amber-500 text-xs font-sans"
                  />
                </div>

                {/* 2. Nhóm chi & Phạm vi sự kiện */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Nhóm chi phí (*):</label>
                    <select
                      value={expenseFormData.category || 'party'}
                      onChange={(e) => setExpenseFormData({ ...expenseFormData, category: e.target.value as ExpenseCategory })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:border-amber-500 text-xs font-sans cursor-pointer bg-white"
                    >
                      {EXPENSE_CATEGORIES.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Phạm vi sự kiện:</label>
                    <input
                      type="text"
                      value={expenseFormData.eventScope || 'Kỷ niệm 20 năm'}
                      onChange={(e) => setExpenseFormData({ ...expenseFormData, eventScope: e.target.value })}
                      placeholder="VD: Kỷ niệm 20 năm, Thường niên..."
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:border-amber-500 text-xs font-sans"
                    />
                  </div>
                </div>

                {/* 3. Số tiền chi */}
                <div className="space-y-1.5 bg-amber-50/50 p-3 rounded-2xl border border-amber-200/80">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-800 flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5 text-rose-600" />
                      <span>Số tiền chi (VNĐ) (*):</span>
                    </label>
                    <span className="text-[11px] font-mono font-bold text-rose-700">
                      {expenseAmountFormatted || '0'} VNĐ
                    </span>
                  </div>

                  <input
                    type="text"
                    required
                    value={expenseAmountFormatted}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/[^0-9]/g, '');
                      if (!digits) {
                        setExpenseAmountFormatted('');
                        return;
                      }
                      const num = parseInt(digits, 10);
                      setExpenseAmountFormatted(num.toLocaleString('vi-VN'));
                    }}
                    placeholder="Nhập số tiền..."
                    className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl font-mono font-bold text-slate-900 text-base focus:outline-none focus:border-rose-500"
                  />

                  {/* Nút chọn nhanh số tiền */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[10px] text-slate-400 font-sans">Chọn nhanh:</span>
                    {[300000, 500000, 1000000, 2000000, 5000000].map(val => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setExpenseAmountFormatted(val.toLocaleString('vi-VN'))}
                        className="px-2 py-0.5 bg-white hover:bg-amber-100 text-slate-700 border border-slate-200 rounded-md font-mono text-[11px] cursor-pointer transition shadow-2xs"
                      >
                        {(val / 1000).toLocaleString('vi-VN')}k
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4. Ngày chi & Người phụ trách chi */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Ngày chi (*):</label>
                    <input
                      type="text"
                      required
                      value={expenseFormData.date || ''}
                      onChange={(e) => setExpenseFormData({ ...expenseFormData, date: e.target.value })}
                      placeholder="DD/MM/YYYY hoặc YYYY-MM-DD"
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:border-amber-500 text-xs font-sans"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Người thực hiện chi (*):</label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        list="roster-spender-list"
                        value={expenseFormData.spender || ''}
                        onChange={(e) => setExpenseFormData({ ...expenseFormData, spender: e.target.value })}
                        placeholder="Chọn từ danh bạ hoặc nhập tên..."
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:border-amber-500 text-xs font-sans"
                      />
                      <datalist id="roster-spender-list">
                        {(classRoster || []).map(m => (
                          <option key={m.id} value={m.fullName}>
                            {m.fullName} {m.nickname ? `(${m.nickname})` : ''} - {m.role}
                          </option>
                        ))}
                      </datalist>
                    </div>
                  </div>
                </div>

                {/* 5. Đơn vị / Người nhận tiền */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Đơn vị nhận tiền / Người thụ hưởng:</label>
                  <input
                    type="text"
                    value={expenseFormData.recipient || ''}
                    onChange={(e) => setExpenseFormData({ ...expenseFormData, recipient: e.target.value })}
                    placeholder="VD: Trung tâm Crown Palace, Xưởng may, Gia đình bạn A..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:border-amber-500 text-xs font-sans"
                  />
                </div>

                {/* 6. Hóa đơn / Bill chứng từ thanh toán */}
                <div className="space-y-1.5 p-3 rounded-2xl bg-slate-50 border border-slate-200">
                  <label className="font-bold text-slate-700 flex items-center justify-between">
                    <span>Ảnh hóa đơn / Biên lai thanh toán:</span>
                    <span className="text-[10px] text-slate-400 font-normal">Tùy chọn</span>
                  </label>

                  <div className="flex items-center gap-2">
                    {isUploadingExpenseReceipt ? (
                      <span className="px-3 py-2 bg-amber-50 text-amber-800 border border-amber-300 rounded-xl flex items-center gap-1.5 font-semibold text-xs animate-pulse">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-600" />
                        <span>Đang tải hóa đơn chứng từ lên hệ thống...</span>
                      </span>
                    ) : (
                      <label className="px-3 py-2 bg-white hover:bg-amber-50 text-slate-700 border border-slate-300 rounded-xl cursor-pointer flex items-center gap-1.5 font-semibold text-xs transition shadow-2xs">
                        <Upload className="w-3.5 h-3.5 text-amber-600" />
                        <span>Tải ảnh từ máy / Chụp hóa đơn</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleExpenseReceiptUpload}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>

                  {expenseFormData.receiptUrl && (
                    <div className="mt-2 space-y-1">
                      <div className="relative rounded-xl overflow-hidden border border-amber-300 bg-slate-900 h-28 flex items-center justify-center group">
                        <img
                          src={expenseFormData.receiptUrl}
                          alt="Ảnh hóa đơn"
                          className="max-h-full max-w-full object-contain"
                        />
                        <button
                          type="button"
                          onClick={() => setExpenseFormData(prev => ({ ...prev, receiptUrl: '' }))}
                          className="absolute top-2 right-2 p-1 bg-black/60 hover:bg-rose-600 text-white rounded-full transition cursor-pointer"
                          title="Xóa ảnh này"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-[10.5px] text-slate-500 font-mono truncate">
                        {expenseFormData.receiptUrl.startsWith('http') ? (
                          <span className="text-emerald-700 flex items-center gap-1 font-sans font-semibold">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600 inline" />
                            Đã lưu trữ chứng từ an toàn trên hệ thống
                          </span>
                        ) : 'Ảnh đính kèm cục bộ (Base64)'}
                      </p>
                    </div>
                  )}

                  <input
                    type="text"
                    value={expenseFormData.receiptUrl || ''}
                    onChange={(e) => setExpenseFormData({ ...expenseFormData, receiptUrl: e.target.value })}
                    placeholder="Hoặc dán URL ảnh Drive / Unsplash..."
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl font-mono text-[11px] focus:outline-none focus:border-amber-500 mt-1"
                  />
                </div>

                {/* 7. Ghi chú chi tiết */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Ghi chú thêm:</label>
                  <textarea
                    rows={2}
                    value={expenseFormData.note || ''}
                    onChange={(e) => setExpenseFormData({ ...expenseFormData, note: e.target.value })}
                    placeholder="Ghi chú thêm chi tiết về số lượng, hình thức, thời hạn..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:border-amber-500 text-xs font-sans resize-none"
                  />
                </div>

                {/* Nút hành động */}
                <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsExpenseModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer transition"
                  >
                    Hủy Bỏ
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white font-bold rounded-xl shadow-md cursor-pointer transition"
                  >
                    {editingExpense ? 'Lưu Cập Nhật' : 'Lưu Khoản Chi'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =================================================================== */}
      {/* MODAL: PHÓNG TO XEM ẢNH HÓA ĐƠN CHỨNG TỪ (EXPENSE LIGHTBOX) */}
      {/* =================================================================== */}
      <AnimatePresence>
        {viewingExpenseReceipt && (
          <div
            className="fixed inset-0 z-70 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-sm"
            onClick={() => setViewingExpenseReceipt(null)}
          >
            <div
              className="bg-slate-900 rounded-3xl border border-slate-700 max-w-2xl w-full p-4 sm:p-5 shadow-2xl flex flex-col gap-3 relative overflow-hidden text-white"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <div className="flex items-center gap-2 min-w-0">
                  <Receipt className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="font-serif font-bold text-sm text-slate-100 truncate">
                    Hóa Đơn: {viewingExpenseReceipt.title}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setViewingExpenseReceipt(null)}
                  className="p-1 text-slate-400 hover:text-white rounded-full transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="w-full max-h-[70vh] flex items-center justify-center bg-black/50 rounded-2xl overflow-hidden p-2">
                <img
                  src={viewingExpenseReceipt.url}
                  alt={viewingExpenseReceipt.title}
                  className="max-h-[65vh] max-w-full object-contain rounded-lg"
                />
              </div>

              <div className="flex items-center justify-between pt-1 text-xs">
                <a
                  href={viewingExpenseReceipt.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition font-sans text-xs"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
                  <span>Mở ảnh gốc</span>
                </a>

                <button
                  type="button"
                  onClick={() => setViewingExpenseReceipt(null)}
                  className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-sans font-bold transition cursor-pointer"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* =================================================================== */}
      {/* MODAL: THÊM / SỬA QUÝ THẦY CÔ GIÁO K8A1 (FULL 18 FIELDS) */}
      {/* =================================================================== */}
      <AnimatePresence>
        {isTeacherModalOpen && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl border-2 border-amber-500/80 shadow-2xl max-w-3xl w-full p-5 sm:p-6 my-6 overflow-hidden space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-amber-200 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-800 flex items-center justify-center">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-base sm:text-lg text-slate-900">
                      {editingTeacher ? `Chỉnh Sửa Thông Tin: ${editingTeacher.name}` : 'Thêm Quý Thầy Cô Mới Vào Sổ Tri Ân'}
                    </h3>
                    <p className="text-[11px] text-slate-500 font-sans">
                      Thiết lập hồ sơ tri ân, số điện thoại, tiến độ thiệp mời và phương án đưa đón tại Hội Khóa
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsTeacherModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body Form */}
              <form onSubmit={handleSaveTeacher} className="space-y-4 max-h-[72vh] overflow-y-auto pr-1 text-xs">
                {/* PHẦN 1: THÔNG TIN CÁ NHÂN & GIẢNG DẠY */}
                <div className="p-3.5 bg-amber-50/50 rounded-xl border border-amber-200 space-y-3">
                  <h4 className="font-serif font-bold text-amber-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <span>1. Thông Tin Cá Nhân & Giảng Dạy</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                    <div className="sm:col-span-3 space-y-1">
                      <label className="font-bold text-slate-700">Danh xưng:</label>
                      <select
                        value={teacherFormData.gender || 'Cô'}
                        onChange={(e) => setTeacherFormData({ ...teacherFormData, gender: e.target.value as any })}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-bold"
                      >
                        <option value="Cô">Cô giáo</option>
                        <option value="Thầy">Thầy giáo</option>
                      </select>
                    </div>

                    <div className="sm:col-span-6 space-y-1">
                      <label className="font-bold text-slate-700">Họ và Tên (*):</label>
                      <input
                        type="text"
                        required
                        value={teacherFormData.name || ''}
                        onChange={(e) => setTeacherFormData({ ...teacherFormData, name: e.target.value })}
                        placeholder="VD: Cô Trần Thị Lan"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-bold text-slate-900"
                      />
                    </div>

                    <div className="sm:col-span-3 space-y-1">
                      <label className="font-bold text-slate-700">Năm sinh / Tuổi:</label>
                      <input
                        type="text"
                        value={teacherFormData.birthYear || ''}
                        onChange={(e) => setTeacherFormData({ ...teacherFormData, birthYear: e.target.value })}
                        placeholder="VD: 1960"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">Môn giảng dạy (*):</label>
                      <select
                        value={TEACHER_SUBJECT_OPTIONS.includes(teacherFormData.subject || '') ? teacherFormData.subject : (teacherFormData.subject ? 'other' : '')}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === 'other') {
                            setTeacherFormData(prev => ({ ...prev, subject: '' }));
                          } else {
                            setTeacherFormData(prev => ({ ...prev, subject: val }));
                          }
                        }}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-medium focus:outline-none focus:border-amber-500 cursor-pointer"
                      >
                        <option value="">-- Chọn môn giảng dạy --</option>
                        {TEACHER_SUBJECT_OPTIONS.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                        <option value="other">✏️ Môn khác (Nhập tay)...</option>
                      </select>
                      {(!TEACHER_SUBJECT_OPTIONS.includes(teacherFormData.subject || '') || teacherFormData.subject === '') && (
                        <input
                          type="text"
                          value={teacherFormData.subject || ''}
                          onChange={(e) => setTeacherFormData({ ...teacherFormData, subject: e.target.value })}
                          placeholder="Nhập tên môn dạy..."
                          className="w-full px-3 py-1.5 bg-white border border-amber-300 rounded-lg text-xs mt-1 focus:outline-none focus:border-amber-600"
                        />
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">Vai trò với K8A1:</label>
                      <select
                        value={TEACHER_ROLE_OPTIONS.includes(teacherFormData.role || '') ? teacherFormData.role : (teacherFormData.role ? 'other' : 'Giáo viên Bộ môn')}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === 'other') {
                            setTeacherFormData(prev => ({ ...prev, role: '' }));
                          } else {
                            setTeacherFormData(prev => ({ ...prev, role: val }));
                          }
                        }}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-semibold text-amber-900 focus:outline-none focus:border-amber-500 cursor-pointer"
                      >
                        {TEACHER_ROLE_OPTIONS.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                        <option value="other">✏️ Vai trò khác (Nhập tay)...</option>
                      </select>
                      {(!TEACHER_ROLE_OPTIONS.includes(teacherFormData.role || '') || teacherFormData.role === '') && (
                        <input
                          type="text"
                          value={teacherFormData.role || ''}
                          onChange={(e) => setTeacherFormData({ ...teacherFormData, role: e.target.value })}
                          placeholder="Nhập vai trò cụ thể..."
                          className="w-full px-3 py-1.5 bg-white border border-amber-300 rounded-lg text-xs mt-1 focus:outline-none focus:border-amber-600"
                        />
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">Tình trạng công tác:</label>
                      <select
                        value={teacherFormData.workStatus || 'Đã nghỉ hưu'}
                        onChange={(e) => setTeacherFormData({ ...teacherFormData, workStatus: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-amber-500 cursor-pointer"
                      >
                        <option value="Đã nghỉ hưu">Đã nghỉ hưu</option>
                        <option value="Đang công tác tại trường">Đang công tác tại trường</option>
                        <option value="Đang công tác đơn vị khác">Đang công tác đơn vị khác</option>
                        <option value="Chuyển đơn vị">Chuyển đơn vị / Tỉnh ngoài</option>
                      </select>
                    </div>
                  </div>

                  {/* Avatar Upload */}
                  <div className="space-y-1.5 pt-1">
                    <label className="font-bold text-slate-700">Ảnh đại diện Thầy Cô:</label>
                    <div className="flex items-center gap-3">
                      <img
                        src={teacherFormData.avatarUrl || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80'}
                        alt="Avatar preview"
                        className="w-12 h-12 rounded-xl object-cover border border-amber-300 shadow-2xs shrink-0"
                        onError={(e: any) => {
                          e.target.src = 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80';
                        }}
                      />
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <label className="px-3 py-1.5 bg-white hover:bg-amber-50 text-slate-700 border border-slate-300 rounded-lg cursor-pointer flex items-center gap-1.5 font-semibold text-xs transition">
                            <Upload className="w-3.5 h-3.5 text-amber-600" />
                            <span>Tải ảnh từ máy</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleTeacherAvatarUpload}
                              className="hidden"
                            />
                          </label>
                          {isUploadingTeacherAvatar && (
                            <span className="text-amber-700 font-semibold animate-pulse flex items-center gap-1">
                              <RefreshCw className="w-3 h-3 animate-spin" /> Đang xử lý ảnh...
                            </span>
                          )}
                        </div>
                        <input
                          type="text"
                          value={teacherFormData.avatarUrl || ''}
                          onChange={(e) => setTeacherFormData({ ...teacherFormData, avatarUrl: e.target.value })}
                          placeholder="Hoặc dán URL ảnh chân dung..."
                          className="w-full px-2.5 py-1 bg-white border border-slate-300 rounded-lg font-mono text-[11px]"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* PHẦN 2: LIÊN LẠC & ĐỊA CHỈ */}
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <h4 className="font-serif font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <span>2. Thông Tin Liên Lạc & Địa Chỉ Nhà Riêng</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">Số Điện Thoại Chính:</label>
                      <input
                        type="text"
                        value={teacherFormData.phone || ''}
                        onChange={(e) => setTeacherFormData({ ...teacherFormData, phone: e.target.value })}
                        placeholder="VD: 0912 345 678"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">SĐT Người Thân / Con cái (dự phòng):</label>
                      <input
                        type="text"
                        value={teacherFormData.relativePhone || ''}
                        onChange={(e) => setTeacherFormData({ ...teacherFormData, relativePhone: e.target.value })}
                        placeholder="VD: 0987 654 321 (Con gái Thầy)"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Địa Chỉ Nhà Riêng (để gửi thiệp & đón tiếp):</label>
                    <input
                      type="text"
                      value={teacherFormData.address || ''}
                      onChange={(e) => setTeacherFormData({ ...teacherFormData, address: e.target.value })}
                      placeholder="VD: P. Hoàng Văn Thụ, TP. Thái Nguyên"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg"
                    />
                  </div>
                </div>

                {/* PHẦN 3: KẾ HOẠCH TIẾP ĐÓN & HẬU CẦN HỘI KHÓA */}
                <div className="p-3.5 bg-emerald-50/40 rounded-xl border border-emerald-200 space-y-3">
                  <h4 className="font-serif font-bold text-emerald-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <span>3. Kế Hoạch Tiếp Đón & Hậu Cần Hội Khóa 20 Năm</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">Tiến độ gửi thiệp mời:</label>
                      <select
                        value={teacherFormData.inviteProgress || 'Chưa gửi'}
                        onChange={(e) => setTeacherFormData({ ...teacherFormData, inviteProgress: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg"
                      >
                        <option value="Chưa gửi">Chưa gửi thiệp</option>
                        <option value="Đang liên hệ">Đang liên hệ đặt lịch</option>
                        <option value="Đã gửi thiệp điện tử">Đã gửi thiệp điện tử</option>
                        <option value="Đã trao thiệp tận tay">Đã trao thiệp tận tay</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">Trạng thái tham dự:</label>
                      <select
                        value={teacherFormData.status || 'pending'}
                        onChange={(e) => setTeacherFormData({ ...teacherFormData, status: e.target.value as any })}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-bold"
                      >
                        <option value="pending">Đang liên hệ (Chờ phản hồi)</option>
                        <option value="attending">Chắc chắn tham dự</option>
                        <option value="wishing">Gửi lời chúc từ xa</option>
                        <option value="declined">Báo bận / Không tham dự</option>
                        <option value="memorial">Tưởng nhớ tri ân</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">Người đi kèm:</label>
                      <select
                        value={teacherFormData.companion || 'Đi một mình'}
                        onChange={(e) => setTeacherFormData({ ...teacherFormData, companion: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg"
                      >
                        <option value="Đi một mình">Đi một mình</option>
                        <option value="Kèm phu quân (+1)">Kèm phu quân (+1)</option>
                        <option value="Kèm phu nhân (+1)">Kèm phu nhân (+1)</option>
                        <option value="Kèm con/cháu (+1)">Kèm con/cháu (+1)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">Phương án đưa đón:</label>
                      <select
                        value={TEACHER_TRANSPORTATION_OPTIONS.includes(teacherFormData.transportation || '') ? teacherFormData.transportation : (teacherFormData.transportation ? 'other' : 'Tự túc')}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === 'other') {
                            setTeacherFormData(prev => ({ ...prev, transportation: '' }));
                          } else {
                            setTeacherFormData(prev => ({ ...prev, transportation: val }));
                          }
                        }}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-medium text-blue-900 focus:outline-none focus:border-amber-500 cursor-pointer"
                      >
                        {TEACHER_TRANSPORTATION_OPTIONS.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                        <option value="other">✏️ Phương án khác (Nhập tay)...</option>
                      </select>
                      {(!TEACHER_TRANSPORTATION_OPTIONS.includes(teacherFormData.transportation || '') || teacherFormData.transportation === '') && (
                        <input
                          type="text"
                          value={teacherFormData.transportation || ''}
                          onChange={(e) => setTeacherFormData({ ...teacherFormData, transportation: e.target.value })}
                          placeholder="Ghi rõ địa điểm/phương án xe đón..."
                          className="w-full px-3 py-1.5 bg-white border border-amber-300 rounded-lg text-xs mt-1 focus:outline-none focus:border-amber-600 font-medium text-blue-900"
                        />
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">Cán bộ BLL phụ trách đón tiếp:</label>
                      <input
                        type="text"
                        value={teacherFormData.coordinator || ''}
                        onChange={(e) => setTeacherFormData({ ...teacherFormData, coordinator: e.target.value })}
                        placeholder="VD: Long Kều, Tuấn Báo, Hương Béo..."
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Lưu ý sức khỏe / vị trí ngồi danh dự:</label>
                    <select
                      value={TEACHER_HEALTH_OPTIONS.includes(teacherFormData.healthNotes || '') ? teacherFormData.healthNotes : (teacherFormData.healthNotes ? 'other' : 'Bình thường (Không yêu cầu đặc biệt)')}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === 'other') {
                          setTeacherFormData(prev => ({ ...prev, healthNotes: '' }));
                        } else {
                          setTeacherFormData(prev => ({ ...prev, healthNotes: val }));
                        }
                      }}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-amber-500 cursor-pointer"
                    >
                      {TEACHER_HEALTH_OPTIONS.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                      <option value="other">✏️ Lưu ý khác (Nhập tay)...</option>
                    </select>
                    {(!TEACHER_HEALTH_OPTIONS.includes(teacherFormData.healthNotes || '') || teacherFormData.healthNotes === '') && (
                      <input
                        type="text"
                        value={teacherFormData.healthNotes || ''}
                        onChange={(e) => setTeacherFormData({ ...teacherFormData, healthNotes: e.target.value })}
                        placeholder="Ghi rõ lưu ý sức khỏe, kiêng cữ..."
                        className="w-full px-3 py-1.5 bg-white border border-amber-300 rounded-lg text-xs mt-1 focus:outline-none focus:border-amber-600"
                      />
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Lời dặn dò / Kỷ niệm với tập thể K8A1:</label>
                    <textarea
                      rows={2}
                      value={teacherFormData.quote || ''}
                      onChange={(e) => setTeacherFormData({ ...teacherFormData, quote: e.target.value })}
                      placeholder="VD: 20 năm qua đi như một cái chớp mắt, chúc các em luôn giữ trọn tình bạn..."
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-serif italic"
                    />
                  </div>
                </div>

                {/* Submit button */}
                <div className="pt-2 border-t border-slate-200 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsTeacherModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer transition"
                  >
                    Hủy Bỏ
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 text-white font-bold rounded-xl shadow-md cursor-pointer transition"
                  >
                    {editingTeacher ? 'Lưu Cập Nhật Thầy Cô' : 'Thêm Vào Danh Sách'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =================================================================== */}
      {/* MODAL: THÊM / CẬP NHẬT KHOẢN THU QUỸ LỚP (INCOME MODAL) */}
      {/* =================================================================== */}
      <AnimatePresence>
        {isIncomeModalOpen && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl border border-emerald-300 shadow-2xl w-full max-w-xl p-5 sm:p-6 space-y-4 text-xs max-h-[92vh] flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-700 flex items-center justify-center font-bold">
                    <Coins className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold font-serif text-slate-900">
                      {editingIncome ? '✏️ Cập Nhật Khoản Thu' : '➕ Ghi Nhận Khoản Thu Mới'}
                    </h3>
                    <p className="text-[11px] text-slate-500 font-sans">
                      Sổ Thu Quỹ Lớp K8A1 • Đa Dạng Danh Mục Thu & Minh Bạch 100%
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsIncomeModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded-full cursor-pointer transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleSaveIncome} className="space-y-3.5 overflow-y-auto pr-1 flex-1">
                {/* 1. Chọn Danh Mục Khoản Thu (Lưới 8 danh mục 1-chạm) */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-800 flex items-center justify-between">
                    <span>1. Danh mục khoản thu (*):</span>
                    <span className="text-[10.5px] font-normal text-slate-500">Bấm để chọn nhanh định mức</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                    {INCOME_CATEGORIES.map(cat => {
                      const isSelected = (incomeFormData.category || 'event') === cat.id;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => {
                            const newCategory = cat.id;
                            const currentDefault = INCOME_CATEGORIES.find(c => c.id === incomeFormData.category)?.quickTitle;
                            const shouldUpdateTitle = !incomeFormData.title || incomeFormData.title === currentDefault;
                            const newAmount = cat.defaultAmount || standardFundAmount;
                            
                            setIncomeFormData(prev => ({
                              ...prev,
                              category: newCategory,
                              title: shouldUpdateTitle ? cat.quickTitle : prev.title,
                              amount: newAmount
                            }));
                            setIncomeAmountFormatted(newAmount.toLocaleString('vi-VN'));
                          }}
                          className={`p-2 rounded-xl text-left border transition cursor-pointer flex flex-col justify-between min-h-[58px] ${
                            isSelected
                              ? `${cat.badgeBg} ${cat.badgeText} border-emerald-500 ring-2 ring-emerald-500/30 font-bold shadow-xs`
                              : 'bg-[#FAF8F5] border-slate-200 hover:bg-slate-100 text-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-1">
                            <span className="text-sm">{cat.icon}</span>
                            <span className="text-[11px] leading-tight font-medium truncate">{cat.shortLabel}</span>
                          </div>
                          <span className="text-[10px] opacity-75 font-mono">
                            {cat.defaultAmount ? `${(cat.defaultAmount >= 1000000 ? (cat.defaultAmount / 1000000) + 'tr' : (cat.defaultAmount / 1000) + 'k')} đ` : 'Tùy ý'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Tiêu đề / Nội dung khoản thu */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">
                    2. Nội dung / Tên khoản thu (*):
                  </label>
                  <input
                    type="text"
                    required
                    value={incomeFormData.title || ''}
                    onChange={(e) => setIncomeFormData({ ...incomeFormData, title: e.target.value })}
                    placeholder="VD: Đóng quỹ họp lớp 20 năm, Mua thêm 2 áo polo, Ủng hộ thêm..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-600 text-xs font-sans"
                  />
                </div>

                {/* 3. Người nộp tiền (Thành viên K8A1 vs Người ngoài / Tài trợ) */}
                <div className="space-y-2 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-800">
                      3. Người nộp tiền (*):
                    </label>
                    <div className="flex items-center gap-2 bg-white px-2 py-1 rounded-lg border border-slate-200 text-[11px]">
                      <label className="flex items-center gap-1 cursor-pointer font-medium text-slate-700">
                        <input
                          type="radio"
                          name="payerType"
                          checked={incomePayerType === 'roster'}
                          onChange={() => setIncomePayerType('roster')}
                          className="text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                        />
                        <span>Bạn cùng lớp K8A1</span>
                      </label>
                      <span className="text-slate-300">|</span>
                      <label className="flex items-center gap-1 cursor-pointer font-medium text-slate-700">
                        <input
                          type="radio"
                          name="payerType"
                          checked={incomePayerType === 'external'}
                          onChange={() => {
                            setIncomePayerType('external');
                            setIncomeFormData(prev => ({ ...prev, memberId: undefined }));
                          }}
                          className="text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                        />
                        <span>Nhà tài trợ / Ngoài lớp</span>
                      </label>
                    </div>
                  </div>

                  {incomePayerType === 'roster' ? (
                    <div className="space-y-2">
                      <div className="relative">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={incomeSearchMember}
                          onChange={(e) => setIncomeSearchMember(e.target.value)}
                          placeholder="🔍 Gõ tên (có/không dấu), biệt danh hoặc SĐT để chọn bạn..."
                          className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-sans focus:outline-none focus:border-emerald-600"
                        />
                      </div>

                      {/* Dropdown danh sách lọc nhanh */}
                      <div className="max-h-36 overflow-y-auto space-y-1 bg-white border border-slate-200 rounded-xl p-1.5">
                        {rosterList
                          .filter(m => {
                            if (!incomeSearchMember.trim()) return true;
                            const term = incomeSearchMember.toLowerCase().trim();
                            const name = (m.fullName || '').toLowerCase();
                            const nick = (m.nickname || '').toLowerCase();
                            const phone = (m.phone || '').replace(/[^0-9]/g, '');
                            return name.includes(term) || nick.includes(term) || phone.includes(term);
                          })
                          .slice(0, 8)
                          .map(m => {
                            const isSelected = incomeFormData.memberId === m.id || incomeFormData.payerName === m.fullName;
                            const matchedRsvp = rsvpList.find(r => r.memberId === m.id || r.phone === m.phone || r.fullName === m.fullName);
                            const isPaid = matchedRsvp?.fundStatus === 'paid';

                            return (
                              <button
                                key={m.id}
                                type="button"
                                onClick={() => {
                                  setIncomeFormData(prev => ({
                                    ...prev,
                                    payerName: m.fullName,
                                    payerPhone: m.phone || '',
                                    memberId: m.id
                                  }));
                                  setIncomeSearchMember('');
                                }}
                                className={`w-full text-left p-1.5 rounded-lg flex items-center justify-between transition cursor-pointer ${
                                  isSelected ? 'bg-emerald-100 text-emerald-950 font-bold' : 'hover:bg-slate-100 text-slate-700'
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center justify-center shrink-0">
                                    {m.fullName.slice(0, 1)}
                                  </div>
                                  <div>
                                    <span className="text-xs font-medium">{m.fullName}</span>
                                    {m.nickname && <span className="text-slate-500 text-[10px] ml-1">({m.nickname})</span>}
                                  </div>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  {isPaid ? (
                                    <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded font-semibold">
                                      Đã đóng quỹ
                                    </span>
                                  ) : (
                                    <span className="text-[10px] text-rose-600 bg-rose-50 border border-rose-200 px-1.5 py-0.2 rounded font-semibold">
                                      Chưa đóng quỹ
                                    </span>
                                  )}
                                  {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                                </div>
                              </button>
                            );
                          })}
                      </div>

                      {/* Hiển thị bạn đã chọn */}
                      {incomeFormData.payerName && (
                        <div className="p-2 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-emerald-700 font-bold">✓ Đã chọn:</span>
                            <span className="font-bold text-slate-900">{incomeFormData.payerName}</span>
                            {incomeFormData.payerPhone && (
                              <span className="text-slate-500 font-mono text-[11px]">({incomeFormData.payerPhone})</span>
                            )}
                          </div>
                          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-200/60 px-2 py-0.5 rounded-md">
                            Thành viên Lớp K8A1
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                          Họ tên người nộp / Nhà tài trợ (*):
                        </label>
                        <input
                          type="text"
                          required={incomePayerType === 'external'}
                          value={incomeFormData.payerName || ''}
                          onChange={(e) => setIncomeFormData({ ...incomeFormData, payerName: e.target.value })}
                          placeholder="VD: Anh Nam (Bạn lớp A2), Doanh nghiệp X..."
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-sans focus:outline-none focus:border-emerald-600"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                          Số điện thoại (tùy chọn):
                        </label>
                        <input
                          type="text"
                          value={incomeFormData.payerPhone || ''}
                          onChange={(e) => setIncomeFormData({ ...incomeFormData, payerPhone: e.target.value })}
                          placeholder="VD: 0912345678"
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-sans focus:outline-none focus:border-emerald-600"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* 4. Số tiền thu (VNĐ) */}
                <div className="space-y-1.5 bg-emerald-50/60 p-3.5 rounded-2xl border border-emerald-200/90">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-800 flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-700" />
                      <span>4. Số tiền thu (VNĐ) (*):</span>
                    </label>
                    <span className="text-[11px] font-mono font-bold text-emerald-800">
                      {incomeAmountFormatted || '0'} VNĐ
                    </span>
                  </div>

                  <input
                    type="text"
                    required
                    value={incomeAmountFormatted}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/[^0-9]/g, '');
                      if (!digits) {
                        setIncomeAmountFormatted('');
                        return;
                      }
                      const num = parseInt(digits, 10);
                      setIncomeAmountFormatted(num.toLocaleString('vi-VN'));
                    }}
                    placeholder="Nhập số tiền thu..."
                    className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-xl font-mono font-bold text-slate-900 text-base focus:outline-none focus:border-emerald-600"
                  />

                  {/* Nút chọn nhanh số tiền */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[10px] text-slate-500 font-sans">Chọn nhanh:</span>
                    {[100000, 150000, 300000, 350000, 700000, 1000000, 2000000, 5000000, 10000000].map(val => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setIncomeAmountFormatted(val.toLocaleString('vi-VN'))}
                        className="px-2 py-0.5 bg-white hover:bg-emerald-100 text-slate-700 border border-slate-200 rounded-md font-mono text-[11px] cursor-pointer transition shadow-2xs"
                      >
                        {val >= 1000000 ? `${val / 1000000}tr` : `${val / 1000}k`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 5. Hình thức thanh toán & Ngày thu */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">5. Hình thức thanh toán (*):</label>
                    <select
                      value={incomeFormData.paymentMethod || 'bank_transfer'}
                      onChange={(e) => setIncomeFormData({ ...incomeFormData, paymentMethod: e.target.value as any })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-600 text-xs font-sans cursor-pointer bg-white"
                    >
                      <option value="bank_transfer">🏦 Chuyển khoản Ngân hàng</option>
                      <option value="cash">💵 Tiền mặt (Bàn đón tiếp / Gặp mặt)</option>
                      <option value="other">📱 Ví điện tử / Khác</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Ngày thu (*):</label>
                    <input
                      type="text"
                      required
                      value={incomeFormData.date || ''}
                      onChange={(e) => setIncomeFormData({ ...incomeFormData, date: e.target.value })}
                      placeholder="DD/MM/YYYY hoặc YYYY-MM-DD"
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-600 text-xs font-sans"
                    />
                  </div>
                </div>

                {/* 6. Người thu tiền & Phạm vi */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Người thu tiền / Đối soát (*):</label>
                    <input
                      type="text"
                      value={incomeFormData.auditor || ''}
                      onChange={(e) => setIncomeFormData({ ...incomeFormData, auditor: e.target.value })}
                      placeholder="VD: Thủ Quỹ BLL, Bùi Thành Long..."
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-600 text-xs font-sans"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Phạm vi sự kiện:</label>
                    <input
                      type="text"
                      value={incomeFormData.eventScope || 'Kỷ niệm 20 năm'}
                      onChange={(e) => setIncomeFormData({ ...incomeFormData, eventScope: e.target.value })}
                      placeholder="VD: Kỷ niệm 20 năm, Thường niên..."
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-600 text-xs font-sans"
                    />
                  </div>
                </div>

                {/* 7. Ảnh chứng từ / Bill / Giấy nộp tiền */}
                <div className="space-y-1.5 p-3 rounded-2xl bg-slate-50 border border-slate-200">
                  <label className="font-bold text-slate-700 flex items-center justify-between">
                    <span>Ảnh chứng từ / Bill nộp tiền:</span>
                    <span className="text-[10px] text-slate-400 font-normal">Tùy chọn</span>
                  </label>

                  <div className="flex items-center gap-2">
                    {isUploadingIncomeReceipt ? (
                      <span className="px-3 py-2 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-xl flex items-center gap-1.5 font-semibold text-xs animate-pulse">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                        <span>Đang tải chứng từ lên hệ thống...</span>
                      </span>
                    ) : (
                      <label className="px-3 py-2 bg-white hover:bg-emerald-50 text-slate-700 border border-slate-300 rounded-xl cursor-pointer flex items-center gap-1.5 font-semibold text-xs transition shadow-2xs">
                        <Upload className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Tải ảnh từ máy / Chụp biên lai</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleIncomeReceiptUpload}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>

                  {incomeFormData.receiptUrl && (
                    <div className="mt-2 space-y-1">
                      <div className="relative rounded-xl overflow-hidden border border-emerald-300 bg-slate-900 h-28 flex items-center justify-center group">
                        <img
                          src={incomeFormData.receiptUrl}
                          alt="Ảnh chứng từ"
                          className="max-h-full max-w-full object-contain"
                        />
                        <button
                          type="button"
                          onClick={() => setIncomeFormData(prev => ({ ...prev, receiptUrl: '' }))}
                          className="absolute top-2 right-2 p-1 bg-black/60 hover:bg-rose-600 text-white rounded-full transition cursor-pointer"
                          title="Xóa ảnh này"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-[10.5px] text-slate-500 font-mono truncate">
                        {incomeFormData.receiptUrl.startsWith('http') ? (
                          <span className="text-emerald-700 flex items-center gap-1 font-sans font-semibold">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600 inline" />
                            Đã lưu trữ chứng từ an toàn trên hệ thống
                          </span>
                        ) : 'Ảnh đính kèm cục bộ (Base64)'}
                      </p>
                    </div>
                  )}

                  <input
                    type="text"
                    value={incomeFormData.receiptUrl || ''}
                    onChange={(e) => setIncomeFormData({ ...incomeFormData, receiptUrl: e.target.value })}
                    placeholder="Hoặc dán URL ảnh Drive / Web..."
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl font-mono text-[11px] focus:outline-none focus:border-emerald-600 mt-1"
                  />
                </div>

                {/* 8. Ghi chú chi tiết */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Ghi chú thêm:</label>
                  <textarea
                    rows={2}
                    value={incomeFormData.note || ''}
                    onChange={(e) => setIncomeFormData({ ...incomeFormData, note: e.target.value })}
                    placeholder="VD: Nộp tiền mặt tại quán cafe họp ban, đặt mua 1 áo polo size XL cho chồng..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-600 text-xs font-sans resize-none"
                  />
                </div>

                {/* Nút hành động */}
                <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsIncomeModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer transition"
                  >
                    Hủy Bỏ
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold rounded-xl shadow-md cursor-pointer transition"
                  >
                    {editingIncome ? 'Lưu Cập Nhật' : 'Lưu Khoản Thu'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =================================================================== */}
      {/* MODAL: PHÓNG TO XEM ẢNH CHỨNG TỪ THU (INCOME LIGHTBOX) */}
      {/* =================================================================== */}
      <AnimatePresence>
        {viewingIncomeReceipt && (
          <div
            className="fixed inset-0 z-70 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-sm"
            onClick={() => setViewingIncomeReceipt(null)}
          >
            <div
              className="bg-slate-900 rounded-3xl border border-slate-700 max-w-2xl w-full p-4 sm:p-5 shadow-2xl flex flex-col gap-3 relative overflow-hidden text-white"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <div className="flex items-center gap-2 min-w-0">
                  <Coins className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="font-serif font-bold text-sm text-slate-100 truncate">
                    Chứng Từ Thu: {viewingIncomeReceipt.title}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setViewingIncomeReceipt(null)}
                  className="p-1 text-slate-400 hover:text-white rounded-full transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="w-full max-h-[70vh] flex items-center justify-center bg-black/50 rounded-2xl overflow-hidden p-2">
                <img
                  src={viewingIncomeReceipt.url}
                  alt={viewingIncomeReceipt.title}
                  className="max-h-[65vh] max-w-full object-contain rounded-lg"
                />
              </div>

              <div className="flex items-center justify-between pt-1 text-xs">
                <a
                  href={viewingIncomeReceipt.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition font-sans text-xs"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Mở ảnh gốc</span>
                </a>

                <button
                  type="button"
                  onClick={() => setViewingIncomeReceipt(null)}
                  className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-sans font-bold transition cursor-pointer"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}

        {viewingBackdropPreview && (
          <div 
            className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm"
            onClick={() => setViewingBackdropPreview(null)}
          >
            <div 
              className="bg-slate-900 border border-purple-500/40 rounded-2xl p-4 max-w-4xl w-full flex flex-col gap-3"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between text-white">
                <span className="text-xs font-bold text-purple-300">Xem Trước Maket Backdrop Sân Khấu (16:9)</span>
                <button
                  onClick={() => setViewingBackdropPreview(null)}
                  className="p-1 text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="aspect-video w-full bg-black rounded-xl overflow-hidden flex items-center justify-center">
                <img
                  src={viewingBackdropPreview}
                  alt="Backdrop Preview"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* =================================================================== */}
    </div>
  );
}
