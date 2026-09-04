import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Heart, 
  Calendar, 
  MapPin, 
  Sparkles, 
  ArrowDown, 
  Music, 
  Settings, 
  Info, 
  FileCode,
  Users,
  Camera,
  BookOpen,
  GraduationCap,
  History,
  HelpCircle,
  Clock,
  Compass,
  Coins,
  UserCheck,
  Award,
  Quote,
  MailOpen,
  CheckCircle
} from 'lucide-react';

import { RsvpData, MemoryImage, MemoryVideo, WishData, ActivityToast } from './types';
import { INITIAL_RSVP_LIST, INITIAL_WISHES_LIST, DEFAULT_MEMORIES, DEFAULT_VIDEOS } from './data';

import AudioPlayer from './components/AudioPlayer';
import CountdownTimer from './components/CountdownTimer';
import RsvpForm from './components/RsvpForm';
import ConfirmedAttendees from './components/ConfirmedAttendees';
import BankTransfer from './components/BankTransfer';
import WishesGuestbook from './components/WishesGuestbook';
import MemoryCorner from './components/MemoryCorner';
import ViewCounter from './components/ViewCounter';
import ActivityToastManager from './components/ActivityToastManager';
import QuickShare from './components/QuickShare';
import DeveloperGuide from './components/DeveloperGuide';

// Advanced Components
import StudentPassModal from './components/StudentPassModal';
import EventSchedule from './components/EventSchedule';
import SponsorAndFinance from './components/SponsorAndFinance';

type NavTab = 
  | 'all' 
  | 'rsvp' 
  | 'program' 
  | 'memories';

export default function App() {
  // Config state
  const [appsScriptUrl, setAppsScriptUrl] = useState<string>(() => {
    try {
      return localStorage.getItem('apps_script_url') || '';
    } catch {
      return '';
    }
  });

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<NavTab>('all');

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
      console.warn('Lỗi đọc rsvp_list từ localStorage, dùng mặc định:', e);
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
      console.warn('Lỗi đọc wishes_list từ localStorage, dùng mặc định:', e);
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
      console.warn('Lỗi đọc uploaded_images từ localStorage, dùng mặc định:', e);
      return DEFAULT_MEMORIES;
    }
  });

  const [isRefreshing, setIsRefreshing] = useState(false);

  // Active admin/guide tab
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  // Real-time activity toast state
  const [latestAction, setLatestAction] = useState<ActivityToast | null>(null);

  // Synchronize configuration URL
  const handleSaveUrl = (url: string) => {
    setAppsScriptUrl(url);
    localStorage.setItem('apps_script_url', url);
  };

  const handleResetUrl = () => {
    setAppsScriptUrl('');
    localStorage.removeItem('apps_script_url');
  };

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

  // Toggle check-in status for Reception Desk
  const handleToggleCheckIn = (attendeeId: string, currentStatus: boolean) => {
    const updated = rsvpList.map((a) => {
      if (a.id === attendeeId) {
        const nextStatus = !currentStatus;
        return {
          ...a,
          checkedIn: nextStatus,
          checkedInAt: nextStatus
            ? new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
            : undefined
        };
      }
      return a;
    });
    setRsvpList(updated);
    localStorage.setItem('rsvp_list', JSON.stringify(updated));
  };

  // Synchronize new RSVP entries
  const handleAddRsvp = (newRsvp: RsvpData) => {
    const updated = [newRsvp, ...rsvpList];
    setRsvpList(updated);
    localStorage.setItem('rsvp_list', JSON.stringify(updated));

    // Trigger instant activity toast
    setLatestAction({
      id: `toast-rsvp-${Date.now()}`,
      type: 'rsvp',
      author: newRsvp.fullName,
      className: newRsvp.className || 'Vừa đăng ký',
      text: newRsvp.status === 'yes'
        ? (newRsvp.message ? `vừa xác nhận tham gia: "${newRsvp.message.slice(0, 50)}"` : 'vừa xác nhận tham gia Ngày hội ngộ 20 năm!')
        : 'đã gửi phản hồi về ngày hội khóa.',
      timeAgo: 'Vừa xong',
      isNew: true
    });
  };

  // Synchronize new wishes
  const handleAddWish = (newWish: WishData) => {
    const updated = [newWish, ...wishesList];
    setWishesList(updated);
    localStorage.setItem('wishes_list', JSON.stringify(updated));

    // Trigger instant activity toast
    setLatestAction({
      id: `toast-wish-${Date.now()}`,
      type: 'wish',
      author: newWish.fullName,
      className: newWish.className || 'Niên khóa 2003 - 2006',
      text: `vừa gửi lời chúc: "${newWish.message.slice(0, 50)}${newWish.message.length > 50 ? '...' : ''}"`,
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

  // Fetch real data from Google Apps Script on mount or URL change
  useEffect(() => {
    if (!appsScriptUrl) return;

    // Fetch RSVP list
    fetch(`${appsScriptUrl}?action=get_rsvp`)
      .then(res => res.json())
      .then(result => {
        if (result && result.status === 'success' && Array.isArray(result.data)) {
          setRsvpList(result.data);
        }
      })
      .catch(err => console.warn('Không thể tải tự động danh sách RSVP từ Google Sheet:', err));

    // Fetch Wishes list
    fetch(`${appsScriptUrl}?action=get_wishes`)
      .then(res => res.json())
      .then(result => {
        if (result && result.status === 'success' && Array.isArray(result.data)) {
          setWishesList(result.data);
        }
      })
      .catch(err => console.warn('Không thể tải tự động danh sách Lời chúc từ Sheet:', err));

    // Fetch uploaded photos from Drive
    fetch(`${appsScriptUrl}?action=get_photos`)
      .then(res => res.json())
      .then(result => {
        if (result && result.status === 'success' && Array.isArray(result.data)) {
          setImages([...DEFAULT_MEMORIES, ...result.data]);
        }
      })
      .catch(err => console.warn('Không thể tải tự động danh sách ảnh từ Google Drive:', err));
  }, [appsScriptUrl]);

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text flex flex-col items-center pb-20 selection:bg-brand-gold-light/50 relative overflow-x-hidden font-sans">
      
      {/* Dynamic Background Nostalgia Decor */}
      <div className="absolute top-0 inset-x-0 h-[600px] bg-gradient-to-b from-brand-rose-light/20 via-brand-bg to-transparent -z-10" />
      
      {/* Background Audio Player Component */}
      <AudioPlayer customAudioUrl="" />

      {/* Floating Settings/Admin Link */}
      <div className="fixed bottom-4 right-4 z-40">
        <button
          onClick={() => setShowAdminPanel(!showAdminPanel)}
          className="flex items-center gap-2 px-4 py-2.5 bg-brand-text text-white font-bold text-xs rounded-full shadow-lg hover:bg-brand-text/90 hover:scale-105 active:scale-95 transition-all cursor-pointer"
        >
          <Settings className="w-4 h-4 animate-spin-slow" />
          <span>{showAdminPanel ? "Xem giao diện Trang chủ" : "Quản trị Ban Tổ Chức (BTC)"}</span>
        </button>
      </div>

      {/* Main Single Page Container with Adaptive Width */}
      <main className="w-full max-w-4xl px-4 pt-8 md:pt-12 space-y-10">
        
        {/* Toggle to view guide or real Web App */}
        {showAdminPanel ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <div className="bg-white p-4 rounded-xl border border-[#e8dfd5] text-center space-y-1">
              <h2 className="text-xl font-black text-brand-text">🛠️ Quản Trị & Hướng Dẫn Kết Nối (BTC)</h2>
              <p className="text-xs text-brand-text-muted">Cấu hình bảng tính Google Sheets, điểm danh Bàn Lễ Tân và xem lưu trữ Google Drive</p>
              <button
                onClick={() => setShowAdminPanel(false)}
                className="text-xs font-bold text-brand-gold hover:underline mt-2 inline-block cursor-pointer"
              >
                ← Quay lại trang kỷ niệm hội khóa
              </button>
            </div>
            
            <DeveloperGuide 
              appsScriptUrl={appsScriptUrl} 
              onSaveUrl={handleSaveUrl} 
              onReset={handleResetUrl} 
              rsvpList={rsvpList}
              onToggleCheckIn={handleToggleCheckIn}
              onOpenPass={handleOpenPass}
            />
          </motion.div>
        ) : (
          <div className="space-y-10">
            
            {/* MODULE 1: HEADER & LỜI NGỎ */}
            <motion.section 
              id="hero"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-left space-y-6"
            >
              {/* Header block resembling the Editorial aesthetic design */}
              <div className="border-b border-brand-text/20 pb-6 mb-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="max-w-xl">
                  <h1 className="text-4xl md:text-5xl font-light tracking-tight leading-none text-brand-text">
                    Hội Ngộ 20 Năm Lớp K8A1
                  </h1>
                  <p className="text-lg italic mt-2 text-brand-text-muted font-serif">
                    Gặp gỡ bạn bè sau 20 năm (2006 — 2026) • THPT Thái Nguyên
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="inline-flex items-center gap-2 text-[10px] uppercase tracking-widest font-sans font-bold text-brand-text-muted">
                    <Sparkles className="w-3.5 h-3.5 text-brand-gold" />
                    <span>Kỷ niệm 20 năm ngày ra trường</span>
                  </div>
                  <QuickShare variant="pill" buttonText="Chia sẻ" />
                </div>
              </div>

              {/* MODULE ĐẾM NGƯỢC THỜI GIAN (COUNTDOWN TIMER) */}
              <div className="pt-1">
                <CountdownTimer targetDate="2026-09-27T08:30:00+07:00" />
              </div>

              {/* Editorial Invitation Letter (Lời Ngỏ Thân Tình) */}
              <div 
                id="invitation-letter-card" 
                className="bg-gradient-to-br from-[#FFFDF9] via-[#FAF6EE] to-[#F6EFE2] border-2 border-brand-gold/50 rounded-sm p-6 sm:p-9 md:p-10 shadow-sm relative overflow-hidden text-left space-y-6"
              >
                {/* Decorative background watermark */}
                <div className="absolute -right-6 -bottom-8 text-brand-gold/10 pointer-events-none select-none">
                  <Quote className="w-44 h-44" />
                </div>
                <div className="absolute -top-12 -left-12 w-32 h-32 bg-brand-gold/5 rounded-full blur-2xl pointer-events-none" />

                {/* Letter Header */}
                <div className="space-y-2 border-b border-brand-gold/25 pb-5 relative z-10">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-gold/15 border border-brand-gold/30 rounded-full text-brand-gold text-[10px] font-sans font-bold uppercase tracking-[0.2em]">
                    <MailOpen className="w-3.5 h-3.5 text-brand-gold" />
                    <span>Thư Ngỏ Kỷ Niệm 20 Năm • Lớp K8A1 (2006 — 2026)</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif text-brand-text font-normal tracking-tight leading-snug">
                    Lời Ngỏ Thân Tình Gửi Bạn Tôi — Lớp K8A1
                  </h2>
                  <p className="text-xs sm:text-sm text-brand-text-muted font-serif italic">
                    Hai mươi năm một chặng đường — Nơi ký ức thanh xuân THPT Thái Nguyên mãi vẹn nguyên
                  </p>
                </div>

                {/* Letter Body */}
                <div className="text-sm sm:text-base md:text-lg text-brand-text leading-relaxed space-y-4 font-serif relative z-10">
                  <p className="italic text-brand-text/90 first-letter:text-3xl sm:first-letter:text-4xl first-letter:font-bold first-letter:text-brand-gold first-letter:mr-2 first-letter:float-left first-letter:leading-none">
                    Hai mươi năm — một chặng đường đủ dài để mỗi thành viên Lớp K8A1 (Khóa 8) chúng ta trưởng thành, gây dựng sự nghiệp và vun vén cho những tổ ấm riêng. Dù hôm nay mỗi người mỗi ngả, bộn bề với những lo toan cuộc sống, nhưng sâu thẳm trong tim mỗi chúng ta vẫn luôn vẹn nguyên một ngăn ký ức thiêng liêng dành cho những năm tháng cấp 3 rực rỡ dưới mái trường THPT Thái Nguyên thân thương.
                  </p>

                  {/* Rendezvous Highlight Callout inside the letter */}
                  <div className="my-3 p-4 sm:p-5 bg-white/80 backdrop-blur-xs border border-brand-gold/40 rounded-sm space-y-2 shadow-2xs font-sans">
                    <div className="flex items-center gap-2 text-brand-gold font-bold text-xs uppercase tracking-wider">
                      <Sparkles className="w-4 h-4" />
                      <span>Hẹn Ngày Trở Về: Chủ Nhật, 27 Tháng 09 Năm 2026</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs text-brand-text">
                      <div className="flex items-start gap-2">
                        <Clock className="w-3.5 h-3.5 text-brand-gold mt-0.5 shrink-0" />
                        <div>
                          <p className="font-bold">Thời gian đón tiếp:</p>
                          <p className="text-brand-text-muted">Từ 08:30 sáng đến 15:30 chiều</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <MapPin className="w-3.5 h-3.5 text-brand-gold mt-0.5 shrink-0" />
                        <div>
                          <p className="font-bold">Địa điểm họp mặt:</p>
                          <p className="text-brand-text-muted">Crown Palace Thái Nguyên (779 Dương Tự Minh)</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="italic text-brand-text/90">
                    Hãy tạm gác lại những bộn bề âu lo, cùng trở về Crown Palace Thái Nguyên để gặp lại những gương mặt thanh xuân năm nào, cùng viết tiếp câu chuyện tình bạn đẹp đẽ của Lớp K8A1 chúng mình!
                  </p>
                </div>

                {/* Primary CTA: Form Registration Scroll Action */}
                <div className="pt-4 border-t border-brand-gold/25 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        const elem = document.getElementById('rsvp-management-section');
                        if (elem) {
                          elem.scrollIntoView({ behavior: 'smooth' });
                        } else {
                          setActiveTab('rsvp');
                        }
                      }}
                      className="inline-flex items-center gap-2 px-5 py-3 bg-brand-text hover:bg-brand-gold text-white text-xs sm:text-sm font-sans font-bold uppercase tracking-wider rounded-sm shadow-md transition-all duration-300 hover:scale-105 cursor-pointer"
                    >
                      <CheckCircle className="w-4 h-4 text-brand-gold" />
                      <span>Xác Nhận Tham Dự Ngay (RSVP)</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('program')}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-white/90 hover:bg-white text-brand-text text-xs font-sans font-bold uppercase tracking-wider border border-brand-border rounded-sm shadow-2xs transition-colors cursor-pointer"
                    >
                      <Clock className="w-3.5 h-3.5 text-brand-gold" />
                      <span>Xem Lịch Trình</span>
                    </button>
                  </div>

                  <div className="text-left sm:text-right space-y-0.5">
                    <p className="text-[11px] font-sans font-bold uppercase tracking-wider text-brand-gold">
                      Ban Liên Lạc Lớp K8A1 (Khóa 8)
                    </p>
                    <p className="text-xs font-serif italic text-brand-text-muted">
                      Trường THPT Thái Nguyên (2003 — 2006)
                    </p>
                  </div>
                </div>
              </div>

              {/* Secondary Action Bar */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  onClick={() => handleOpenPass()}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-brand-text hover:bg-brand-gold text-white text-xs font-sans font-bold uppercase tracking-wider rounded-sm shadow-xs transition-colors cursor-pointer"
                >
                  <Award className="w-4 h-4 text-brand-gold" />
                  <span>Xem Thẻ Học Sinh Kỷ Niệm 🎓</span>
                </button>

                <button
                  onClick={() => setActiveTab('program')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-[#FAF8F5] text-brand-text text-xs font-sans font-bold uppercase tracking-wider border border-brand-border rounded-sm shadow-2xs transition-colors cursor-pointer"
                >
                  <Clock className="w-4 h-4 text-brand-gold" />
                  <span>Xem Lịch Trình 27/9</span>
                </button>
              </div>

              {/* Quick Share Banner - Web Share API to Zalo / Facebook */}
              <QuickShare variant="banner" />
            </motion.section>

            {/* STICKY STREAMLINED NAVIGATION TABS (3 MAIN TABS) */}
            <div className="sticky top-2 z-30 bg-[#FAF9F6]/95 backdrop-blur-md p-1.5 rounded-sm border border-brand-border shadow-xs">
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`px-3 py-1.5 text-xs font-sans font-bold whitespace-nowrap rounded-xs transition-all cursor-pointer ${
                    activeTab === 'all'
                      ? 'bg-brand-text text-white shadow-xs'
                      : 'text-brand-text-muted hover:text-brand-text hover:bg-white'
                  }`}
                >
                  Tất Cả Các Mục
                </button>

                <button
                  onClick={() => setActiveTab('rsvp')}
                  className={`px-3 py-1.5 text-xs font-sans font-bold whitespace-nowrap rounded-xs transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'rsvp'
                      ? 'bg-brand-text text-white shadow-xs'
                      : 'text-brand-text-muted hover:text-brand-text hover:bg-white'
                  }`}
                >
                  <Users className="w-3.5 h-3.5 text-brand-gold" />
                  <span>Đăng Ký & Thành Viên</span>
                </button>

                <button
                  onClick={() => setActiveTab('program')}
                  className={`px-3 py-1.5 text-xs font-sans font-bold whitespace-nowrap rounded-xs transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'program'
                      ? 'bg-brand-text text-white shadow-xs'
                      : 'text-brand-text-muted hover:text-brand-text hover:bg-white'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5 text-brand-gold" />
                  <span>Lịch Trình & Địa Điểm</span>
                </button>

                <button
                  onClick={() => setActiveTab('memories')}
                  className={`px-3 py-1.5 text-xs font-sans font-bold whitespace-nowrap rounded-xs transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'memories'
                      ? 'bg-brand-text text-white shadow-xs'
                      : 'text-brand-text-muted hover:text-brand-text hover:bg-white'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-brand-gold" />
                  <span>Kỷ Niệm & Lưu Bút</span>
                </button>
              </div>
            </div>

            {/* TAB SECTIONS RENDERING */}
            <div className="space-y-12">
              
              {/* SECTION 1: RSVP & ATTENDEES & BANK TRANSFER (PRIMARY FOCUS - PLACED RIGHT AFTER INVITATION LETTER) */}
              {(activeTab === 'all' || activeTab === 'rsvp') && (
                <section id="rsvp-management-section" className="space-y-10 scroll-mt-16">
                  <RsvpForm 
                    appsScriptUrl={appsScriptUrl} 
                    rsvpList={rsvpList} 
                    onAddRsvp={handleAddRsvp} 
                    onOpenPassModal={handleOpenPass}
                  />

                  <ConfirmedAttendees
                    appsScriptUrl={appsScriptUrl}
                    rsvpList={rsvpList}
                    onRefresh={handleRefreshData}
                    isRefreshing={isRefreshing}
                  />

                  <BankTransfer />
                </section>
              )}

              {/* SECTION 2: PROGRAM & VENUE */}
              {(activeTab === 'all' || activeTab === 'program') && (
                <section id="program-schedule-section" className="space-y-10 scroll-mt-16">
                  <EventSchedule />
                </section>
              )}

              {/* SECTION 3: MEMORIES & WISHES & CONDENSED FINANCE */}
              {(activeTab === 'all' || activeTab === 'memories') && (
                <section id="nostalgia-memories-section" className="space-y-12 scroll-mt-16">
                  <MemoryCorner 
                    appsScriptUrl={appsScriptUrl} 
                    images={images} 
                    videos={DEFAULT_VIDEOS} 
                    onAddImage={handleAddImage} 
                  />
                  <WishesGuestbook
                    appsScriptUrl={appsScriptUrl}
                    wishesList={wishesList}
                    onAddWish={handleAddWish}
                  />
                  <SponsorAndFinance 
                    totalAttendeesCount={rsvpList.filter(a => a.status === 'yes').length}
                  />
                </section>
              )}

            </div>

            {/* Footnote & Live View Counter */}
            <footer className="text-center space-y-4 pt-10 pb-6 border-t border-brand-border text-[11px] text-brand-text-muted flex flex-col items-center">
              <div className="space-y-1">
                <p className="font-bold text-brand-text font-serif text-sm">
                  Hội Ngộ 20 Năm Lớp K8A1 — THPT Thái Nguyên
                </p>
                <p className="font-serif italic">
                  Lớp K8A1 (Khóa 8, 2003 — 2006). Kỷ niệm 20 năm gặp gỡ bạn bè vào Chủ Nhật 27/09/2026 tại Crown Palace Thái Nguyên.
                </p>
                <p className="text-brand-gold font-medium">
                  Kết nối đồng bộ danh sách qua Google Sheets & Google Drive API.
                </p>
              </div>

              {/* View Counter Module */}
              <div className="pt-2">
                <ViewCounter appsScriptUrl={appsScriptUrl} />
              </div>
            </footer>
          </div>
        )}

      </main>

      {/* Digital Souvenir Pass Modal */}
      <StudentPassModal
        isOpen={isPassModalOpen}
        onClose={() => setIsPassModalOpen(false)}
        defaultAttendee={selectedPassAttendee}
        allAttendees={rsvpList}
      />

      {/* Real-time Activity Toast Popup Notifications */}
      <ActivityToastManager
        rsvpList={rsvpList}
        wishesList={wishesList}
        latestAction={latestAction}
        onClearLatestAction={() => setLatestAction(null)}
      />
    </div>
  );
}
