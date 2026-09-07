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
  Sparkles 
} from 'lucide-react';

interface QuickNavigationProps {
  confirmedCount?: number;
}

interface NavItem {
  id: string;
  label: string;
  shortLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  isPrimary?: boolean;
  badge?: number;
}

export default function QuickNavigation({ confirmedCount = 0 }: QuickNavigationProps) {
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
    }
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
  }, []);

  // Nếu chưa cuộn đủ thì không render để tối ưu giao diện đầu trang
  if (!isVisible) return null;

  return (
    <aside 
      aria-label="Thanh điều hướng nhanh họp lớp K8A1"
      className="fixed bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-40 max-w-[96vw] sm:max-w-fit pointer-events-auto select-none transition-all duration-300"
    >
      {isCollapsed ? (
        /* Trạng thái thu gọn: 1 nút tròn nổi tinh tế cho phép người dùng mở lại */
        <button
          type="button"
          onClick={() => setIsCollapsed(false)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#1E293B]/95 hover:bg-[#0F172A] text-amber-300 border border-amber-400/60 shadow-2xl backdrop-blur-md cursor-pointer transition-all transform hover:scale-105 active:scale-95 text-xs font-sans font-bold"
          title="Mở thanh điều hướng nhanh"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span>Điều Hướng Nhanh</span>
          <ChevronUp className="w-3.5 h-3.5 text-amber-300" />
        </button>
      ) : (
        /* Trạng thái mở rộng: Floating Quick Dock thanh lịch */
        <div className="flex items-center gap-1 sm:gap-1.5 p-1 sm:p-1.5 rounded-full bg-[#1E293B]/92 hover:bg-[#1E293B]/98 backdrop-blur-md border border-amber-400/50 shadow-2xl ring-1 ring-black/20 transition-all">
          
          {/* Nút các chuyên mục chính */}
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => scrollToTarget(item.id)}
                className={`relative flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-full text-xs font-sans transition-all duration-200 cursor-pointer ${
                  item.isPrimary
                    ? isActive
                      ? 'bg-gradient-to-r from-rose-600 to-red-600 text-white font-bold shadow-md ring-2 ring-amber-300/80 scale-105'
                      : 'bg-gradient-to-r from-[#8B1E2D] to-[#9B2234] hover:from-rose-600 hover:to-red-600 text-white font-bold shadow-xs'
                    : isActive
                    ? 'bg-amber-500/25 text-amber-300 border border-amber-400/70 font-bold shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
                title={`Nhảy nhanh đến ${item.label}`}
              >
                <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 ${
                  item.isPrimary 
                    ? 'text-amber-200' 
                    : isActive 
                    ? 'text-amber-300' 
                    : 'text-slate-300'
                }`} />
                
                {/* Chữ hiển thị: trên mobile hiển thị nhãn ngắn, trên sm+ hiển thị nhãn đầy đủ */}
                <span className="text-[11px] sm:text-xs font-medium">
                  {item.shortLabel}
                </span>

                {/* Badge đếm số lượng bạn bè */}
                {typeof item.badge === 'number' && item.badge > 0 && (
                  <span className={`inline-flex items-center justify-center min-w-[18px] h-4 px-1 rounded-full text-[9px] sm:text-[10px] font-mono font-bold leading-none ${
                    isActive
                      ? 'bg-amber-400 text-amber-950 shadow-xs'
                      : 'bg-amber-500/30 text-amber-200 border border-amber-400/40'
                  }`}>
                    {item.badge}
                  </span>
                )}

                {/* Chấm tròn biểu thị phân vùng đang xem */}
                {isActive && !item.isPrimary && (
                  <span className="absolute -top-1 right-2 w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                )}
              </button>
            );
          })}

          {/* Vạch ngăn cách trang nhã */}
          <div className="w-[1px] h-4 bg-slate-700 mx-0.5" />

          {/* Nút Cuộn Lên Đầu Trang (Back-to-Top) */}
          <button
            type="button"
            onClick={() => scrollToTarget('hero')}
            className="p-1.5 sm:p-2 rounded-full text-slate-300 hover:text-amber-300 hover:bg-white/10 transition-all cursor-pointer"
            title="Cuộn lên đầu trang"
            aria-label="Cuộn lên đầu trang"
          >
            <ArrowUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>

          {/* Nút Thu Gọn Dock */}
          <button
            type="button"
            onClick={() => setIsCollapsed(true)}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-200 hover:bg-white/10 transition-all cursor-pointer hidden sm:flex"
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
