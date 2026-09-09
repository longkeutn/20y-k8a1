import React, { useState, useEffect, useCallback } from 'react';
import { 
  MapPin, 
  CheckCircle2, 
  Users, 
  Coins, 
  Camera, 
  ArrowUp, 
  ChevronDown, 
  ChevronUp, 
  Sparkles,
  GraduationCap,
  BookOpen
} from 'lucide-react';

import { ClassMember } from '../types';

interface QuickNavigationProps {
  confirmedCount?: number;
  hasTeachers?: boolean;
  activeMember?: ClassMember | null;
  onOpenIdentityModal?: () => void;
}

interface NavItem {
  id: string;
  label: string;
  shortLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  isPrimary?: boolean;
  badge?: number;
}

export default function QuickNavigation({ 
  confirmedCount = 0, 
  hasTeachers = false,
  activeMember,
  onOpenIdentityModal
}: QuickNavigationProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('hero');

  // Danh sách các mục điều hướng nhanh then chốt
  const navItems: NavItem[] = [
    {
      id: 'dia-diem',
      label: 'Địa Điểm',
      shortLabel: 'Địa điểm',
      icon: MapPin,
    },
    {
      id: 'diem-danh',
      label: 'Điểm Danh',
      shortLabel: 'Báo danh',
      icon: CheckCircle2,
      isPrimary: true,
    },
    {
      id: 'danh-sach-diem-danh',
      label: 'Bạn Bè',
      shortLabel: 'Bạn bè',
      icon: Users,
      badge: confirmedCount > 0 ? confirmedCount : undefined,
    },
    {
      id: 'bank-transfer-card',
      label: 'Quỹ Lớp',
      shortLabel: 'Quỹ lớp',
      icon: Coins,
    },
    ...(hasTeachers ? [{
      id: 'thay-co',
      label: 'Thầy Cô',
      shortLabel: 'Thầy cô',
      icon: BookOpen,
    }] : []),
    {
      id: 'ky-uc',
      label: 'Ký Ức',
      shortLabel: 'Kỷ niệm',
      icon: Camera,
    },
  ];

  // Cuộn mượt mà đến phần tử theo ID
  const scrollToTarget = useCallback((targetId: string) => {
    if (targetId === 'hero') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const element = document.getElementById(targetId);
    if (element) {
      // Tính toán offset để trừ hao chiều cao navbar cố định (khoảng 64px)
      const navOffset = 64;
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = Math.max(0, elementPosition - navOffset);

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });

      if (targetId === 'diem-danh') {
        setIsCollapsed(true);
        window.dispatchEvent(new CustomEvent('focus-diem-danh'));
        return;
      }
    }
  }, []);

  // Tự động thu gọn floating dock khi người dùng bấm mở Điểm Danh / Báo Danh để không che khuất danh sách
  useEffect(() => {
    const handleCollapseOnFocus = () => {
      setIsCollapsed(true);
    };
    window.addEventListener('focus-diem-danh', handleCollapseOnFocus);
    return () => window.removeEventListener('focus-diem-danh', handleCollapseOnFocus);
  }, []);

  // Lắng nghe sự kiện cuộn trang để kích hoạt Scroll Spy & ẩn/hiện Dock
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollY = window.pageYOffset || document.documentElement.scrollTop;

          // Hiện floating dock khi cuộn qua 260px (qua khỏi phần đỉnh banner)
          setIsVisible(scrollY > 260);

          // Nhận diện phân vùng đang đọc (Scroll Spy)
          const sectionIds = [
            'ky-uc',
            ...(hasTeachers ? ['thay-co'] : []),
            'bank-transfer-card',
            'danh-sach-diem-danh',
            'diem-danh',
            'dia-diem',
            'hero'
          ];

          const scrollMiddle = scrollY + 200;

          for (const sId of sectionIds) {
            const el = document.getElementById(sId);
            if (el) {
              const top = el.offsetTop;
              if (scrollMiddle >= top) {
                setActiveSection(sId);
                break;
              }
            }
          }

          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Chạy ngay lần đầu

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [hasTeachers]);

  // Nếu chưa cuộn đủ thì không render để tối ưu giao diện đầu trang
  if (!isVisible) return null;

  return (
    <aside 
      aria-label="Thanh điều hướng nhanh họp lớp K8A1"
      className="fixed bottom-2.5 sm:bottom-4 left-1/2 -translate-x-1/2 z-30 max-w-[calc(100vw-1rem)] sm:max-w-fit pointer-events-auto select-none transition-all duration-300"
    >
      {isCollapsed ? (
        /* Trạng thái thu gọn: 1 nút tròn nổi tinh tế cho phép người dùng mở lại */
        <button
          type="button"
          onClick={() => setIsCollapsed(false)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#1E293B]/95 hover:bg-[#0F172A] text-amber-300 border border-amber-400/60 shadow-2xl backdrop-blur-md cursor-pointer transition-all transform hover:scale-105 active:scale-95 text-xs font-sans font-bold"
          title="Mở thanh điều hướng nhanh"
          aria-label="Mở thanh điều hướng nhanh"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span>Điều Hướng Nhanh</span>
          <ChevronUp className="w-3.5 h-3.5 text-amber-300" />
        </button>
      ) : (
        /* Trạng thái mở rộng: Floating Quick Dock thanh lịch, siêu gọn trên mobile */
        <div className="flex items-center gap-0.5 sm:gap-1.5 p-1 sm:p-1.5 rounded-full bg-[#1E293B]/95 backdrop-blur-md border border-amber-400/50 shadow-2xl ring-1 ring-black/30 overflow-x-auto no-scrollbar">
          
          {/* Nút các chuyên mục chính */}
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => scrollToTarget(item.id)}
                className={`relative flex items-center gap-1.5 rounded-full font-sans transition-all duration-200 cursor-pointer shrink-0 ${
                  item.isPrimary
                    ? isActive
                      ? 'px-3 py-1.5 sm:px-3.5 sm:py-2 bg-gradient-to-r from-rose-600 to-red-600 text-white font-bold shadow-md ring-2 ring-amber-300/80 scale-105'
                      : 'px-3 py-1.5 sm:px-3.5 sm:py-2 bg-gradient-to-r from-[#8B1E2D] to-[#9B2234] hover:from-rose-600 hover:to-red-600 text-white font-bold shadow-xs'
                    : isActive
                    ? 'p-2 sm:px-3 sm:py-2 bg-amber-500/25 text-amber-300 border border-amber-400/70 font-bold shadow-xs'
                    : 'p-2 sm:px-3 sm:py-2 text-slate-300 hover:text-white hover:bg-white/10'
                }`}
                title={`Nhảy nhanh đến ${item.label}`}
                aria-label={item.label}
              >
                <Icon className={`w-4 h-4 shrink-0 ${
                  item.isPrimary 
                    ? 'text-amber-200' 
                    : isActive 
                    ? 'text-amber-300' 
                    : 'text-slate-300'
                }`} />
                
                {/* Chữ hiển thị: Mục Báo danh luôn hiện chữ; Các mục khác ẩn trên mobile (<sm), hiện trên tablet/desktop (sm+) */}
                <span className={`${
                  item.isPrimary 
                    ? 'text-[11px] sm:text-xs font-bold whitespace-nowrap' 
                    : 'hidden sm:inline text-xs font-medium whitespace-nowrap'
                }`}>
                  {item.shortLabel}
                </span>

                {/* Badge đếm số lượng bạn bè: Mobile hiển thị góc trên icon, Desktop hiển thị cạnh chữ */}
                {typeof item.badge === 'number' && item.badge > 0 && (
                  <span className={`inline-flex items-center justify-center min-w-[15px] h-3.5 px-1 rounded-full text-[9px] font-mono font-bold leading-none sm:relative sm:top-auto sm:right-auto absolute -top-1 -right-1 sm:ml-0.5 ${
                    isActive
                      ? 'bg-amber-400 text-amber-950 shadow-xs'
                      : 'bg-rose-600 text-white border border-rose-400/40 shadow-xs'
                  }`}>
                    {item.badge}
                  </span>
                )}

                {/* Chấm tròn biểu thị phân vùng đang xem trên mobile */}
                {isActive && !item.isPrimary && (
                  <span className="sm:hidden absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-amber-400 shadow-sm" />
                )}
              </button>
            );
          })}

          {/* Nút Chọn Tên / Nhận Diện Bạn Học K8A1 ở Bottom Floating Dock */}
          <button
            type="button"
            onClick={() => {
              if (onOpenIdentityModal) onOpenIdentityModal();
              else window.dispatchEvent(new CustomEvent('open-identity-modal'));
            }}
            className={`relative flex items-center gap-1.5 p-2 sm:px-3 sm:py-2 rounded-full font-sans transition-all duration-200 cursor-pointer shrink-0 ${
              activeMember
                ? 'bg-amber-500/20 text-amber-200 hover:text-white hover:bg-amber-500/30 border border-amber-400/60 font-semibold shadow-2xs'
                : 'text-amber-300/80 hover:text-amber-200 hover:bg-white/10'
            }`}
            title={activeMember ? `Đang nhận diện: ${activeMember.fullName} (Bấm để xem thẻ kỷ niệm)` : 'Bấm để chọn tên bạn trong danh sách K8A1'}
            aria-label={activeMember ? `Thẻ kỷ niệm của ${activeMember.fullName}` : 'Chọn tên bạn trong danh sách K8A1'}
          >
            <div className="relative">
              <GraduationCap className="w-4 h-4 text-amber-300 shrink-0" />
              {activeMember && (
                <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-400 ring-1 ring-slate-900" />
              )}
            </div>
            <span className="hidden sm:inline text-xs font-medium truncate max-w-[85px] whitespace-nowrap">
              {activeMember ? (activeMember.fullName.split(' ').pop() || 'Tên bạn') : 'Chọn tên'}
            </span>
          </button>

          {/* Vạch ngăn cách trang nhã */}
          <div className="w-[1px] h-4 bg-slate-700 mx-0.5 shrink-0" />

          {/* Nút Cuộn Lên Đầu Trang (Back-to-Top) */}
          <button
            type="button"
            onClick={() => scrollToTarget('hero')}
            className="p-2 rounded-full text-slate-400 hover:text-amber-300 hover:bg-white/10 transition-all cursor-pointer shrink-0"
            title="Cuộn lên đầu trang"
            aria-label="Cuộn lên đầu trang"
          >
            <ArrowUp className="w-4 h-4" />
          </button>

          {/* Nút Thu Gọn Dock (chỉ hiện trên tablet/desktop sm+) */}
          <button
            type="button"
            onClick={() => setIsCollapsed(true)}
            className="p-2 rounded-full text-slate-400 hover:text-slate-200 hover:bg-white/10 transition-all cursor-pointer hidden sm:flex shrink-0"
            title="Thu gọn thanh điều hướng"
            aria-label="Thu gọn thanh điều hướng"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>

        </div>
      )}
    </aside>
  );
}
