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
  // =========================================================================
  // 1. KHI KHỐI ĐANG THU GỌN: THANH TỐI GIẢN, TINH TẾ, KHÔNG CỒNG KỀNH
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
          className="w-full px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-white/95 hover:bg-white border border-amber-200/80 hover:border-amber-400/80 shadow-xs flex items-center justify-between gap-2.5 cursor-pointer transition-all duration-150 select-none group"
          title={`Nhấn để mở rộng: ${title}`}
        >
          {/* Nhóm thông tin tóm tắt bên trái */}
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1">
            {Icon && (
              <span className="w-6 h-6 rounded-lg bg-amber-50 border border-amber-200/80 flex items-center justify-center text-amber-700 shrink-0">
                <Icon className="w-3.5 h-3.5" />
              </span>
            )}
            <span className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-amber-900 transition truncate">
              {shortTitle || title}
            </span>
            {badge && (
              <span className="hidden sm:inline-block text-[10px] font-sans font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
                {badge}
              </span>
            )}
            {previewSnippet && (
              <span className="hidden md:inline-block text-xs text-slate-500 font-sans truncate max-w-sm pl-2 border-l border-slate-200">
                {previewSnippet}
              </span>
            )}
          </div>

          {/* Nút bấm Mở Rộng bên phải */}
          <div className="flex items-center gap-2 shrink-0">
            {headerRight}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleCollapse();
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100/70 hover:bg-amber-200/90 text-amber-900 text-[11px] font-sans font-bold border border-amber-300/70 transition cursor-pointer active:scale-95 shadow-2xs"
            >
              <span>Mở rộng</span>
              <ChevronDown className="w-3.5 h-3.5 text-amber-700" />
            </button>
          </div>
        </div>
      </section>
    );
  }

  // =========================================================================
  // 2. KHI KHỐI ĐANG MỞ RỘNG: HIỂN THỊ NGUYÊN BẢN, KHÔNG DẢI ĐEN CỒNG KỀNH
  // =========================================================================
  return (
    <section id={id} className={`scroll-mt-20 relative group ${className}`}>
      {/* Nút thu gọn tinh tế, nhỏ gọn ở góc phải phía trên */}
      <div className="flex items-center justify-end mb-1 select-none pr-0.5">
        <button
          type="button"
          onClick={onToggleCollapse}
          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/80 hover:bg-white text-slate-500 hover:text-slate-800 border border-slate-200/90 shadow-2xs text-[11px] font-sans font-medium transition-all duration-150 cursor-pointer active:scale-95 hover:border-amber-300"
          title={`Thu gọn khối: ${title}`}
        >
          <span>Thu gọn</span>
          <ChevronUp className="w-3 h-3 text-slate-400" />
        </button>
      </div>

      <div className="animate-in fade-in zoom-in-[0.99] duration-200">
        {children}
      </div>
    </section>
  );
}
