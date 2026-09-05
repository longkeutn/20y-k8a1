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
  Music
} from 'lucide-react';

import { UserRole, RsvpData, MemoryImage, MemoryVideo, WishData, ActivityToast } from './types';
import { INITIAL_RSVP_LIST, INITIAL_WISHES_LIST, DEFAULT_MEMORIES, DEFAULT_VIDEOS } from './data';

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

export default function App() {
  // Config state (Google Apps Script WebApp URL)
  const [appsScriptUrl, setAppsScriptUrl] = useState<string>(() => {
    try {
      return localStorage.getItem('apps_script_url') || '';
    } catch {
      return '';
    }
  });

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

  // Student Souvenir Pass modal state
  const [selectedPassAttendee, setSelectedPassAttendee] = useState<RsvpData | null>(null);
  const [isPassModalOpen, setIsPassModalOpen] = useState(false);

  // RSVP list state
  const [rsvpList, setRsvpList] = useState<RsvpData[]>(() => {
    try {
      const local = localStorage.getItem('rsvp_list');
      if (!local) return INITIAL_RSVP_LIST;
      const parsed = JSON.parse(local);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_RSVP_LIST;
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

  // Images list state
  const [images, setImages] = useState<MemoryImage[]>(() => {
    try {
      const local = localStorage.getItem('uploaded_images');
      const uploaded = local ? JSON.parse(local) : [];
      return [...DEFAULT_MEMORIES, ...(Array.isArray(uploaded) ? uploaded : [])];
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

  // Synchronize new RSVP entries
  const handleAddRsvp = (newRsvp: RsvpData) => {
    const updated = [newRsvp, ...rsvpList];
    setRsvpList(updated);
    localStorage.setItem('rsvp_list', JSON.stringify(updated));

    setLatestAction({
      id: `toast-rsvp-${Date.now()}`,
      type: 'rsvp',
      author: newRsvp.fullName,
      className: newRsvp.className || 'K8A1',
      text: newRsvp.status === 'yes'
        ? (newRsvp.message ? `vừa xác nhận về lớp: "${newRsvp.message.slice(0, 50)}"` : 'vừa xác nhận chắc chắn có mặt tại Ngày hội ngộ 20 năm!')
        : 'vừa gửi phản hồi về ngày hội khóa.',
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

  // Synchronize new image uploads
  const handleAddImage = (newImg: MemoryImage) => {
    const local = localStorage.getItem('uploaded_images');
    const uploaded = local ? JSON.parse(local) : [];
    const updatedUploaded = [newImg, ...uploaded];
    localStorage.setItem('uploaded_images', JSON.stringify(updatedUploaded));
    setImages([newImg, ...images]);
  };

  // Live Refresh data from Google Apps Script
  const handleRefreshData = () => {
    if (!appsScriptUrl) return;
    setIsRefreshing(true);

    const rsvpPromise = fetch(`${appsScriptUrl}?action=get_rsvp`)
      .then(res => res.json())
      .then(result => {
        if (result && result.status === 'success' && Array.isArray(result.data)) {
          setRsvpList(result.data);
        }
      })
      .catch(err => console.warn('Lỗi khi tải RSVP:', err));

    const wishesPromise = fetch(`${appsScriptUrl}?action=get_wishes`)
      .then(res => res.json())
      .then(result => {
        if (result && result.status === 'success' && Array.isArray(result.data)) {
          setWishesList(result.data);
        }
      })
      .catch(err => console.warn('Lỗi khi tải Lời chúc:', err));

    Promise.allSettled([rsvpPromise, wishesPromise]).finally(() => {
      setTimeout(() => setIsRefreshing(false), 400);
    });
  };

  // Fetch initial data
  useEffect(() => {
    if (!appsScriptUrl) return;

    fetch(`${appsScriptUrl}?action=get_rsvp`)
      .then(res => res.json())
      .then(result => {
        if (result && result.status === 'success' && Array.isArray(result.data)) {
          setRsvpList(result.data);
        }
      })
      .catch(err => console.warn('Lỗi kết nối RSVP Sheet:', err));

    fetch(`${appsScriptUrl}?action=get_wishes`)
      .then(res => res.json())
      .then(result => {
        if (result && result.status === 'success' && Array.isArray(result.data)) {
          setWishesList(result.data);
        }
      })
      .catch(err => console.warn('Lỗi kết nối Lời chúc Sheet:', err));

    fetch(`${appsScriptUrl}?action=get_photos`)
      .then(res => res.json())
      .then(result => {
        if (result && result.status === 'success' && Array.isArray(result.data)) {
          setImages([...DEFAULT_MEMORIES, ...result.data]);
        }
      })
      .catch(err => console.warn('Lỗi kết nối Photo Drive:', err));
  }, [appsScriptUrl]);

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
            <a href="#tu-hoi" className="text-slate-300 hover:text-amber-300 transition px-2 py-1 rounded hover:bg-white/10 flex items-center space-x-1">
              <Compass className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Tụ Hội</span>
            </a>
            <a href="#luu-but" className="text-slate-300 hover:text-amber-300 transition px-2 py-1 rounded hover:bg-white/10 flex items-center space-x-1">
              <PenTool className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Lưu Bút</span>
            </a>

            {/* Background Audio Player integrated into navbar */}
            <AudioPlayer variant="navbar" customAudioUrl="" />

            {/* Primary RSVP CTA */}
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

      {/* Main Container */}
      <main className="w-full max-w-4xl px-3 sm:px-4 pt-5 md:pt-7 space-y-12">
        
        {showLegacyAdminPanel ? (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-white p-4 rounded-xl border border-amber-200 text-center space-y-1 shadow-sm">
              <h2 className="text-lg font-bold text-[#1E293B]">⚙️ Cấu Hình Kết Nối Google Apps Script</h2>
              <p className="text-xs text-slate-500">Dành cho Ban Tổ Chức đồng bộ danh sách điểm danh và lưu bút về Google Sheet</p>
            </div>
            <DeveloperGuide 
              currentUrl={appsScriptUrl} 
              onSaveUrl={(url) => {
                setAppsScriptUrl(url);
                localStorage.setItem('apps_script_url', url);
              }}
              onResetUrl={() => {
                setAppsScriptUrl('');
                localStorage.removeItem('apps_script_url');
              }}
            />
          </motion.div>
        ) : (
          <div className="space-y-14">

            {/* ======================================================== */}
            {/* 🌟 PHÂN VÙNG 1: CINEMATIC HERO POSTER & THIỆP MỜI VIP */}
            {/* ======================================================== */}
            <motion.section 
              id="hero"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-left space-y-6 scroll-mt-20"
            >
              {/* 🌟 CINEMATIC HERO POSTER BANNER (HOÀNG KIM SANG TRỌNG) */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1C1613] via-[#2A1E1A] to-[#140F0D] border-2 border-amber-400/50 p-6 sm:p-10 md:p-12 shadow-2xl text-white space-y-6">
                
                {/* Ambient Golden Glows */}
                <div className="absolute -top-24 -left-24 w-80 h-80 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-amber-600/20 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute inset-0 bg-[radial-gradient(#C5A059_1px,transparent_1px)] [background-size:20px_20px] opacity-15 pointer-events-none" />

                {/* Classical Corner Accents */}
                <div className="absolute top-3 left-3 w-5 h-5 border-t-2 border-l-2 border-amber-400/60 pointer-events-none" />
                <div className="absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2 border-amber-400/60 pointer-events-none" />
                <div className="absolute bottom-3 left-3 w-5 h-5 border-b-2 border-l-2 border-amber-400/60 pointer-events-none" />
                <div className="absolute bottom-3 right-3 w-5 h-5 border-b-2 border-r-2 border-amber-400/60 pointer-events-none" />

                {/* Top Badge: 20th Anniversary Emblem */}
                <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 border-b border-amber-400/20 pb-5">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-amber-400/40 bg-amber-950/70 backdrop-blur-md text-amber-200 text-[10px] sm:text-[11px] font-sans font-bold uppercase tracking-[0.22em] shadow-inner">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                    <span>Hội Khóa 20 Năm • Niên Khóa 2003 — 2006</span>
                  </div>
                  <QuickShare variant="pill" buttonText="Rủ bạn vào Zalo" />
                </div>

                {/* Hero Title & Emotional Subtitle */}
                <div className="relative z-10 space-y-3 max-w-2xl">
                  <h1 className="text-3xl sm:text-5xl md:text-6xl font-serif text-[#FFFDF8] font-bold tracking-tight leading-[1.12]">
                    20 Năm Ngày Trở Về
                    <span className="block text-xl sm:text-2xl md:text-3xl font-light italic text-amber-200/90 mt-2 font-serif">
                      Lớp K8A1 — Trường THPT Thái Nguyên
                    </span>
                  </h1>
                  <p className="text-xs sm:text-sm md:text-base text-amber-100/90 font-serif italic leading-relaxed pt-1">
                    “Hai mươi năm — một chặng đường đủ dài để trưởng thành, nhưng chỉ cần gặp lại bạn bè là thanh xuân tuổi 18 lại bừng sáng vẹn nguyên.”
                  </p>
                </div>

                {/* Quick Event Summary Strip inside Poster */}
                <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 sm:p-4 rounded-xl bg-white/10 border border-amber-400/30 backdrop-blur-xs text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shrink-0">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-sans tracking-wider text-amber-200/80 font-bold">Thời gian hội ngộ</p>
                      <p className="font-serif font-bold text-white text-sm">Chủ Nhật, 27/09/2026 (08:30 — 15:30)</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shrink-0">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-sans tracking-wider text-amber-200/80 font-bold">Địa điểm gặp mặt</p>
                      <p className="font-serif font-bold text-white text-sm">Crown Palace Thái Nguyên (779 Dương Tự Minh)</p>
                    </div>
                  </div>
                </div>

                {/* Primary Action Buttons on Banner */}
                <div className="relative z-10 flex flex-wrap items-center gap-3 pt-2">
                  <button
                    onClick={() => {
                      document.getElementById('diem-danh')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="inline-flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-white font-sans font-bold text-xs sm:text-sm uppercase tracking-wider rounded-lg shadow-xl shadow-amber-950/60 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                  >
                    <CheckCircle className="w-4 h-4 text-amber-100" />
                    <span>Xác Nhận Tham Dự Ngay (RSVP)</span>
                  </button>

                  <button
                    onClick={() => handleOpenPass()}
                    className="inline-flex items-center gap-1.5 px-4 py-3 bg-white/10 hover:bg-white/20 border border-amber-400/40 text-amber-100 font-sans font-bold text-xs uppercase tracking-wider rounded-lg backdrop-blur-xs transition-colors cursor-pointer"
                  >
                    <Award className="w-4 h-4 text-amber-300" />
                    <span>Thẻ Học Sinh Kỷ Niệm 🎓</span>
                  </button>
                </div>
              </div>

              {/* MODULE ĐẾM NGƯỢC THỜI GIAN */}
              <div className="pt-1">
                <CountdownTimer targetDate="2026-09-27T08:30:00+07:00" />
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
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 border border-amber-300/70 rounded-full text-amber-900 text-[10px] font-sans font-bold uppercase tracking-[0.2em]">
                    <MailOpen className="w-3.5 h-3.5 text-amber-600" />
                    <span>Thư Ngỏ Kỷ Niệm 20 Năm • Lớp K8A1 (2006 — 2026)</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif text-[#1E293B] font-bold tracking-tight leading-snug">
                    Lời Ngỏ Thân Tình Gửi Bạn Tôi — Lớp K8A1
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 font-serif italic">
                    Hai mươi năm một chặng đường — Nơi ký ức thanh xuân THPT Thái Nguyên mãi vẹn nguyên
                  </p>
                </div>

                {/* Letter Body */}
                <div className="text-sm sm:text-base md:text-lg text-slate-700 leading-relaxed space-y-4 font-serif relative z-10">
                  <p className="italic text-slate-800 first-letter:text-4xl sm:first-letter:text-5xl first-letter:font-bold first-letter:text-amber-600 first-letter:mr-2.5 first-letter:float-left first-letter:leading-none">
                    Hai mươi năm — một chặng đường đủ dài để mỗi thành viên Lớp K8A1 (Khóa 8) chúng ta trưởng thành, gây dựng sự nghiệp và vun vén cho những tổ ấm riêng. Dù hôm nay mỗi người mỗi ngả, bộn bề với những lo toan cuộc sống, nhưng sâu thẳm trong tim mỗi chúng ta vẫn luôn vẹn nguyên một ngăn ký ức thiêng liêng dành cho những năm tháng cấp 3 rực rỡ dưới mái trường THPT Thái Nguyên thân thương.
                  </p>

                  {/* Golden Ticket Style Callout */}
                  <div className="my-4 p-4 sm:p-6 bg-gradient-to-r from-[#FAF3E0] via-[#FFFDF5] to-[#FAF3E0] border-2 border-dashed border-amber-500/70 rounded-xl shadow-xs font-sans relative">
                    <div className="flex items-center gap-2 text-amber-900 font-bold text-xs uppercase tracking-wider mb-2">
                      <Sparkles className="w-4 h-4 text-amber-600" />
                      <span>Hẹn Ngày Trở Về: Chủ Nhật, 27 Tháng 09 Năm 2026</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs text-slate-800">
                      <div className="flex items-start gap-2">
                        <Clock className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                        <div>
                          <p className="font-bold text-slate-900">Thời gian đón tiếp:</p>
                          <p className="text-slate-600">Từ 08:30 sáng đến 15:30 chiều</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                        <div>
                          <p className="font-bold text-slate-900">Địa điểm họp mặt:</p>
                          <p className="text-slate-600">Crown Palace Thái Nguyên (779 Dương Tự Minh)</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="italic text-slate-800">
                    Hãy tạm gác lại những bộn bề âu lo, cùng trở về Crown Palace Thái Nguyên để gặp lại những gương mặt thanh xuân năm nào, cùng viết tiếp câu chuyện tình bạn đẹp đẽ của Lớp K8A1 chúng mình!
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
                      <span>Xác Nhận Tham Dự Ngay (RSVP)</span>
                    </button>
                  </div>

                  <div className="text-left sm:text-right space-y-0.5">
                    <p className="text-[11px] font-sans font-bold uppercase tracking-wider text-amber-800">
                      Ban Liên Lạc Lớp K8A1 (Khóa 8)
                    </p>
                    <p className="text-xs font-serif italic text-slate-500">
                      Trường THPT Thái Nguyên (2003 — 2006)
                    </p>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* ======================================================== */}
            {/* 🎞️ PHÂN VÙNG 2: KHO KÝ ỨC THANH XUÂN K8A1 */}
            {/* ======================================================== */}
            <section id="ky-uc" className="space-y-6 scroll-mt-20">
              <MemoryCorner 
                appsScriptUrl={appsScriptUrl} 
                images={images} 
                videos={videos} 
                onAddImage={handleAddImage} 
              />
            </section>

            {/* ======================================================== */}
            {/* 🗺️ PHÂN VÙNG 3: BẢN ĐỒ TỤ HỘI K8A1 (SIÊU GỌN ~220PX) */}
            {/* ======================================================== */}
            <AlumniConvergenceMap />

            {/* ======================================================== */}
            {/* 💬 PHÂN VÙNG 4: BỨC TƯỜNG LƯU BÚT SỐ K8A1 */}
            {/* ======================================================== */}
            <section id="luu-but" className="space-y-6 scroll-mt-20">
              <WishesGuestbook
                appsScriptUrl={appsScriptUrl}
                wishesList={wishesList}
                onAddWish={handleAddWish}
              />
            </section>

            {/* ======================================================== */}
            {/* 🎟️ PHÂN VÙNG 5: ĐIỂM DANH & THÀNH VIÊN VÀ QUỸ LỚP */}
            {/* ======================================================== */}
            <section id="diem-danh" className="space-y-10 scroll-mt-20">
              
              {/* Form Điểm Danh */}
              <RsvpForm 
                appsScriptUrl={appsScriptUrl} 
                rsvpList={rsvpList} 
                onAddRsvp={handleAddRsvp} 
                onOpenPassModal={handleOpenPass}
              />

              {/* Danh Sách Thành Viên Đã Xác Nhận */}
              <ConfirmedAttendees
                appsScriptUrl={appsScriptUrl}
                rsvpList={rsvpList}
                onRefresh={handleRefreshData}
                isRefreshing={isRefreshing}
                onOpenPassModal={handleOpenPass}
              />

              {/* Thông Tin Quỹ Lớp Minh Bạch */}
              <BankTransfer />
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
                <ViewCounter appsScriptUrl={appsScriptUrl} />
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
        wishesList={wishesList}
        onUpdateWishesList={(updated) => {
          setWishesList(updated);
          localStorage.setItem('wishes_list', JSON.stringify(updated));
        }}
        images={images}
        onUpdateImages={(updated) => {
          setImages(updated);
          localStorage.setItem('uploaded_images', JSON.stringify(updated.filter(i => i.isUserUploaded)));
        }}
        videos={videos}
        onUpdateVideos={(updated) => {
          setVideos(updated);
          localStorage.setItem('custom_videos', JSON.stringify(updated));
          localStorage.setItem('k8a1_video_list', JSON.stringify(updated));
        }}
        appsScriptUrl={appsScriptUrl}
        onSaveAppsScriptUrl={(url) => {
          setAppsScriptUrl(url);
          localStorage.setItem('apps_script_url', url);
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
