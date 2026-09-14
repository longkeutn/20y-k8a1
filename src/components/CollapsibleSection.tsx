import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export interface CollapsibleSectionProps {
  id?: string;
  title: string;
  shortTitle?: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: React.ReactNode;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  previewSnippet?: React.ReactNode;
  headerRight?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  variant?: 'slate' | 'amber' | 'paper' | 'default';
}

/**
 * Wrapper đóng/mở khối tinh tế, tối giản:
 * - Khi ĐANG MỞ: Giữ nguyên vẹn giao diện gốc của khối, KHÔNG chèn dải đen to cồng kềnh,
 *   chỉ có một nút nhỏ "Thu gọn ⌃" thanh mảnh, kín đáo ở góc trên bên phải.
 * - Khi ĐANG THU GỌN: Hiển thị 1 thanh mỏng nhẹ (~36px), nền sáng ấm áp hài hòa với trang web,
 *   kèm icon nhỏ, tên khối vắn tắt và nút "Mở rộng ⌄".
 */
export default function CollapsibleSection({
  id,
  title,
  shortTitle,
  icon: Icon,
  badge,
  isCollapsed,
  onToggleCollapse,
  previewSnippet,
  headerRight,
  children,
  className = '',
}: CollapsibleSectionProps) {
  // Tránh lặp badge nếu badge trùng với shortTitle hoặc title (ví dụ "Đếm ngược Đếm ngược")
  const isDuplicateBadge = typeof badge === 'string' && (badge === shortTitle || badge === title);
  const shouldRenderBadge = badge && !isDuplicateBadge;

  // =========================================================================
  // 1. KHI KHỐI ĐANG THU GỌN: THANH TỐI GIẢN, TƯƠNG PHẢN CAO, DỄ ĐỌC
  // =========================================================================
  if (isCollapsed) {
    return (
      <section id={id} className={`scroll-mt-20 ${className}`}>
        <div 
          role="button"
          tabIndex={0}
          onClick={onToggleCollapse}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onToggleCollapse();
            }
          }}
          className="w-full px-3.5 sm:px-4 py-2.5 rounded-xl bg-white hover:bg-amber-50/50 border border-slate-200 hover:border-amber-400 shadow-xs flex items-center justify-between gap-2.5 cursor-pointer transition-all duration-150 select-none group"
          title={`Nhấn để mở rộng: ${title}`}
        >
          {/* Nhóm thông tin tóm tắt bên trái */}
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1">
            {Icon && (
              <span className="w-7 h-7 rounded-lg bg-amber-100/70 border border-amber-300/60 flex items-center justify-center text-amber-800 shrink-0">
                <Icon className="w-4 h-4" />
              </span>
            )}
            <span className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-amber-900 transition truncate">
              {shortTitle || title}
            </span>
            {shouldRenderBadge && (
              <span className="hidden sm:inline-block text-[11px] font-sans font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-300 shrink-0">
                {badge}
              </span>
            )}
            {previewSnippet && (
              <span className="hidden md:inline-block text-xs text-slate-700 font-sans truncate max-w-sm pl-2.5 border-l border-slate-300">
                {previewSnippet}
              </span>
            )}
          </div>

          {/* Nút bấm Mở Rộng bên phải: Rõ ràng, nổi bật, dễ nhìn */}
          <div className="flex items-center gap-2 shrink-0">
            {headerRight}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleCollapse();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-sans font-bold shadow-xs transition active:scale-95 cursor-pointer"
            >
              <span>Mở rộng</span>
              <ChevronDown className="w-3.5 h-3.5 text-amber-100" />
            </button>
          </div>
        </div>
      </section>
    );
  }

  // =========================================================================
  // 2. KHI KHỐI ĐANG MỞ RỘNG: NÚT THU GỌN RÕ RÀNG, ĐẦY ĐỦ TƯƠNG PHẢN
  // =========================================================================
  return (
    <section id={id} className={`scroll-mt-20 relative group ${className}`}>
      {/* Nút thu gọn tinh tế, rõ ràng ở góc phải phía trên */}
      <div className="flex items-center justify-end mb-1.5 select-none pr-0.5">
        <button
          type="button"
          onClick={onToggleCollapse}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-slate-300 hover:border-amber-400 shadow-xs text-xs font-sans font-bold transition-all duration-150 cursor-pointer active:scale-95"
          title={`Thu gọn khối: ${title}`}
        >
          <span>Thu gọn</span>
          <ChevronUp className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-600" />
        </button>
      </div>

      <div className="animate-in fade-in zoom-in-[0.99] duration-200">
        {children}
      </div>
    </section>
  );
}
