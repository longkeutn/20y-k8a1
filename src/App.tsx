import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Heart, 
  Calendar, 
  MapPin, 
  Sparkles, 
  ArrowDown, 
  Settings, 
  Camera,
  PenTool,
  Clock,
  Compass,
  CheckCircle,
  MailOpen,
  Quote,
  Users
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
import AlumniConvergenceMap from './components/AlumniConvergenceMap';
import ViewCounter from './components/ViewCounter';
import ActivityToastManager from './components/ActivityToastManager';
import QuickShare from './components/QuickShare';
import DeveloperGuide from './components/DeveloperGuide';
import StudentPassModal from './components/StudentPassModal';

export default function App() {
  // Config state
  const [appsScriptUrl, setAppsScriptUrl] = useState<string>(() => {
    try {
      return localStorage.getItem('apps_script_url') || '';
    } catch {
      return '';
    }
  });

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

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
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
      className: newRsvp.className || 'Vừa xác nhận',
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
      
      {/* Background Audio Player */}
      <AudioPlayer customAudioUrl="" />

      {/* 📌 THANH ĐIỀU HƯỚNG CỐ ĐỊNH (STICKY NAVBAR) */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-[#1E293B]/90 border-b border-amber-500/20 text-white shadow-md">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <a href="#hero" className="flex items-center space-x-2 group">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center font-serif font-bold text-white shadow">
              20
            </div>
            <div>
              <span className="font-serif font-bold text-base tracking-wide text-amber-200 group-hover:text-amber-300 transition">K8A1</span>
              <span className="text-[10px] block text-slate-300 -mt-1 font-mono">THPT Thái Nguyên</span>
            </div>
          </a>

          <nav className="flex items-center space-x-2 sm:space-x-5 text-xs sm:text-sm font-medium">
            <a href="#ky-uc" className="hover:text-amber-300 transition px-2 py-1 rounded hover:bg-white/10 flex items-center space-x-1">
              <Camera className="w-3.5 h-3.5 text-amber-400" />
              <span>Ký Ức</span>
            </a>
            <a href="#tu-hoi" className="hover:text-amber-300 transition px-2 py-1 rounded hover:bg-white/10 flex items-center space-x-1">
              <Compass className="w-3.5 h-3.5 text-amber-400" />
              <span>Tụ Hội</span>
            </a>
            <a href="#luu-but" className="hover:text-amber-300 transition px-2 py-1 rounded hover:bg-white/10 flex items-center space-x-1">
              <PenTool className="w-3.5 h-3.5 text-amber-400" />
              <span>Lưu Bút</span>
            </a>
            <a 
              href="#diem-danh" 
              className="bg-gradient-to-r from-rose-600 to-red-600 hover:from-red-600 hover:to-rose-600 text-white px-3.5 py-1.5 rounded-full font-bold shadow-md hover:shadow-lg transition transform hover:-translate-y-0.5 flex items-center space-x-1 text-xs"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Điểm Danh</span>
            </a>
          </nav>
        </div>
      </header>

      {/* Nút Bật/Tắt Quản Trị Cấu Hình (Góc Dưới Màn Hình) */}
      <div className="fixed bottom-4 right-4 z-40">
        <button
          onClick={() => setShowAdminPanel(!showAdminPanel)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-[#1E293B] text-amber-300 font-sans font-bold text-xs rounded-full shadow-lg border border-amber-500/30 hover:bg-[#0F172A] hover:scale-105 active:scale-95 transition-all cursor-pointer"
        >
          <Settings className="w-3.5 h-3.5 text-amber-400" />
          <span>{showAdminPanel ? "Về Trang Chủ" : "Cấu Hình Sheet"}</span>
        </button>
      </div>

      {/* Main Container */}
      <main className="w-full max-w-4xl px-4 pt-6 md:pt-10 space-y-12">
        
        {showAdminPanel ? (
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
            {/* 🌟 PHÂN VÙNG 1: HERO SECTION - "CHUYẾN TÀU 20 NĂM" */}
            {/* ======================================================== */}
            <section id="hero" className="text-center space-y-6 scroll-mt-20">
              
              {/* Badge 20 Năm */}
              <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-xs font-semibold shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>HỘI KHÓA KỶ NIỆM 20 NĂM NGÀY RA TRƯỜNG (2004 - 2024 / 2006 - 2026)</span>
              </div>

              {/* Tiêu đề cảm xúc */}
              <div className="space-y-2">
                <h1 className="font-serif text-3xl sm:text-5xl font-extrabold text-[#0F172A] tracking-tight leading-tight">
                  Về Lại Tuổi 18 Rực Rỡ
                </h1>
                <p className="font-serif italic text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
                  “Dù ngoài kia ta có là ai, bôn ba muôn nẻo đường đời, khi về lại K8A1 – ta vẫn mãi là chúng ta của những năm tháng vô tư nhất.”
                </p>
              </div>

              {/* Countdown Timer */}
              <div className="max-w-md mx-auto">
                <CountdownTimer />
              </div>

              {/* Khung Thư Ngỏ Chạm Đến Trái Tim */}
              <div 
                className="bg-[#FFFEFA] border-[2px] border-amber-500/40 rounded-xl p-6 sm:p-8 shadow-md relative overflow-hidden text-left space-y-4"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-bl-full pointer-events-none" />
                <div className="flex items-center gap-2 text-amber-800 text-xs font-bold uppercase tracking-wider border-b border-amber-200/60 pb-2">
                  <MailOpen className="w-4 h-4 text-amber-600" />
                  <span>Lời Ngỏ Từ Ban Liên Lạc K8A1</span>
                </div>
                
                <p className="text-sm sm:text-base font-serif italic text-slate-700 leading-relaxed">
                  Hai mươi năm – một chặng đường đủ dài để mỗi thành viên lớp chúng ta trưởng thành và xây dựng sự nghiệp riêng. Dẫu hôm nay mỗi người một ngả, bận rộn với những lo toan, nhưng trong tim mỗi chúng ta vẫn luôn vẹn nguyên một ngăn ký ức thiêng liêng về mái trường THPT Thái Nguyên thân thương. Hãy cùng trở về để gặp lại những nụ cười năm ấy!
                </p>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs border-t border-amber-200/60 font-sans">
                  <div className="text-amber-800 font-semibold flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-amber-600" />
                    <span>Hẹn gặp nhau: Chủ Nhật, 27/09/2026</span>
                  </div>
                  <a
                    href="#diem-danh"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1E293B] hover:bg-amber-600 text-white font-bold rounded-lg transition shadow-sm"
                  >
                    <CheckCircle className="w-3.5 h-3.5 text-amber-400" />
                    <span>Xác Nhận Có Mặt Ngay</span>
                  </a>
                </div>
              </div>

              <QuickShare variant="banner" />
            </section>

            {/* ======================================================== */}
            {/* 🎞️ PHÂN VÙNG 2: KHO KÝ ỨC THANH XUÂN K8A1 */}
            {/* ======================================================== */}
            <section id="ky-uc" className="space-y-6 scroll-mt-20">
              <MemoryCorner 
                appsScriptUrl={appsScriptUrl} 
                images={images} 
                videos={DEFAULT_VIDEOS} 
                onAddImage={handleAddImage} 
              />
            </section>

            {/* ======================================================== */}
            {/* Phân vùng */}
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
                  Hội Ngộ 20 Năm Lớp K8A1 – THPT Thái Nguyên
                </p>
                <p className="font-serif italic text-slate-600">
                  “20 năm bôn ba muôn phương, khi về lại K8A1 – ta mãi là những cô cậu học trò tuổi 18.”
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


