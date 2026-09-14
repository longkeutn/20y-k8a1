import React, { useState, useEffect, useRef } from 'react';
import { RefreshCw } from 'lucide-react';

interface PullToRefreshProps {
  onRefresh: () => Promise<void> | void;
  disabled?: boolean;
}

export default function PullToRefresh({ onRefresh, disabled = false }: PullToRefreshProps) {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startYRef = useRef(0);
  const isPullingRef = useRef(false);

  const THRESHOLD = 65; // Ngưỡng kích hoạt làm mới (px)
  const MAX_PULL = 100; // Khoảng kéo tối đa có lực cản

  useEffect(() => {
    if (disabled) return;

    const handleTouchStart = (e: TouchEvent) => {
      // Chỉ kích hoạt khi đang ở đỉnh trang
      if (window.scrollY <= 3) {
        startYRef.current = e.touches[0].clientY;
        isPullingRef.current = true;
      } else {
        isPullingRef.current = false;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isPullingRef.current || isRefreshing) return;

      if (window.scrollY > 3) {
        isPullingRef.current = false;
        setPullDistance(0);
        return;
      }

      const currentY = e.touches[0].clientY;
      const diff = currentY - startYRef.current;

      if (diff > 0) {
        // Áp dụng lực cản kéo phi tuyến tính (damping)
        const distance = Math.min(Math.pow(diff, 0.82), MAX_PULL);
        setPullDistance(distance);

        // Chặn hiệu ứng cuộn mặc định của trình duyệt khi đang thực hiện kéo làm mới
        if (e.cancelable && distance > 10) {
          e.preventDefault();
        }
      } else {
        setPullDistance(0);
      }
    };

    const handleTouchEnd = async () => {
      if (!isPullingRef.current || isRefreshing) return;
      isPullingRef.current = false;

      if (pullDistance >= THRESHOLD) {
        setIsRefreshing(true);
        setPullDistance(THRESHOLD); // Giữ vị trí hiển thị spinner
        try {
          if (navigator.vibrate) navigator.vibrate(20);
        } catch {}

        try {
          await onRefresh();
        } finally {
          setTimeout(() => {
            setIsRefreshing(false);
            setPullDistance(0);
          }, 600);
        }
      } else {
        setPullDistance(0);
      }
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [disabled, isRefreshing, pullDistance, onRefresh]);

  if (pullDistance === 0 && !isRefreshing) return null;

  const isReady = pullDistance >= THRESHOLD;

  return (
    <div 
      className="fixed left-0 right-0 z-[60] flex justify-center pointer-events-none transition-transform duration-200 ease-out"
      style={{
        top: 'calc(env(safe-area-inset-top, 0px) + 62px)',
        transform: `translateY(${isRefreshing ? 10 : Math.max(0, pullDistance - 25)}px)`
      }}
    >
      <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full shadow-2xl backdrop-blur-md text-xs font-sans font-medium transition-all duration-200 border ${
        isReady || isRefreshing
          ? 'bg-[#0B132B]/95 text-amber-300 border-amber-400/80 shadow-amber-950/40 ring-2 ring-amber-400/30 scale-105'
          : 'bg-[#161B26]/90 text-slate-200 border-white/20'
      }`}>
        <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${
          isRefreshing ? 'animate-spin' : isReady ? 'rotate-180 transition-transform duration-200' : ''
        }`} />
        <span>
          {isRefreshing ? 'Đang cập nhật dữ liệu...' : isReady ? 'Thả tay để tải lại!' : 'Kéo xuống để làm mới'}
        </span>
      </div>
    </div>
  );
}
