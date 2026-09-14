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
  variant = 'default',
}: CollapsibleSectionProps) {
  // Phong cách viền & nền header tùy biến theo chuyên mục
  const variantStyles = {
    default: {
      header: 'bg-gradient-to-r from-[#111827] via-[#1F2937] to-[#111827] border-amber-500/30 text-white',
      iconBox: 'bg-amber-500/20 border-amber-400/30 text-amber-300',
      title: 'text-amber-200',
      previewBox: 'bg-slate-900/60 border-amber-500/20 text-slate-300',
    },
    slate: {
      header: 'bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#0F172A] border-slate-700 text-white',
      iconBox: 'bg-sky-500/20 border-sky-400/30 text-sky-300',
      title: 'text-slate-100',
      previewBox: 'bg-slate-900/70 border-slate-700/60 text-slate-300',
    },
    amber: {
      header: 'bg-gradient-to-r from-[#2A1705] via-[#3D220A] to-[#2A1705] border-amber-500/40 text-amber-100',
      iconBox: 'bg-amber-500/25 border-amber-400/40 text-amber-300',
      title: 'text-amber-200',
      previewBox: 'bg-amber-950/40 border-amber-500/25 text-amber-200/80',
    },
    paper: {
      header: 'bg-gradient-to-r from-[#FFFDF8] via-[#FAF6EE] to-[#FFFDF8] border-amber-400/50 text-slate-900 shadow-xs',
      iconBox: 'bg-amber-100 border-amber-300 text-amber-800',
      title: 'text-slate-900 font-serif',
      previewBox: 'bg-amber-50/80 border-amber-300/60 text-slate-700',
    }
  }[variant];

  return (
    <section 
      id={id} 
      className={`scroll-mt-20 transition-all duration-200 ${className}`}
    >
      {/* THANH HEADER ĐÓNG / MỞ (COLLAPSIBLE HEADER) */}
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
        className={`w-full px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-2xl border shadow-md flex items-center justify-between gap-2.5 cursor-pointer transition select-none ${variantStyles.header} ${
          isCollapsed ? 'hover:brightness-110 active:scale-[0.99]' : 'mb-3'
        }`}
        title={isCollapsed ? `Nhấn để mở rộng: ${title}` : `Nhấn để thu gọn: ${title}`}
      >
        {/* NHÓM TIÊU ĐỀ & ICON BÊN TRÁI */}
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1">
          {Icon && (
            <span className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg border flex items-center justify-center shrink-0 ${variantStyles.iconBox}`}>
              <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </span>
          )}

          <div className="min-w-0 flex items-center gap-2 flex-wrap">
            <h3 className={`text-xs sm:text-sm font-bold truncate leading-snug ${variantStyles.title}`}>
              <span className="hidden sm:inline">{title}</span>
              <span className="sm:hidden">{shortTitle || title}</span>
            </h3>

            {badge && (
              <div className="shrink-0">
                {badge}
              </div>
            )}
          </div>
        </div>

        {/* NHÓM THAO TÁC BÊN PHẢI (HEADER RIGHT & NÚT THU GỌN / MỞ RỘNG) */}
        <div 
          className="flex items-center gap-1.5 sm:gap-2 shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          {headerRight}

          {/* Nút bấm Đóng / Mở */}
          <button
            type="button"
            onClick={onToggleCollapse}
            className={`px-2.5 py-1 rounded-full text-[11px] font-sans font-bold flex items-center gap-1 border transition cursor-pointer active:scale-95 ${
              isCollapsed
                ? 'bg-amber-400 text-slate-950 border-amber-300 hover:bg-amber-300 shadow-sm animate-pulse'
                : 'bg-white/10 hover:bg-white/20 text-slate-200 border-white/20'
            }`}
          >
            {isCollapsed ? (
              <>
                <span>Mở rộng</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </>
            ) : (
              <>
                <span>Thu gọn</span>
                <ChevronUp className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* THANH XEM TRƯỚC TÓM TẮT KHI ĐANG THU GỌN */}
      {isCollapsed && previewSnippet && (
        <div 
          onClick={onToggleCollapse}
          className={`px-4 py-2.5 rounded-xl border border-dashed text-xs cursor-pointer hover:border-amber-400/60 transition flex items-center justify-between gap-2 shadow-xs ${variantStyles.previewBox}`}
          title="Nhấn để mở rộng toàn bộ khối này"
        >
          <div className="truncate flex-1 font-sans text-[11px] sm:text-xs">
            {previewSnippet}
          </div>
          <span className="text-[10px] text-amber-400 font-semibold shrink-0 flex items-center gap-0.5">
            <span>Chi tiết</span>
            <ChevronDown className="w-3 h-3" />
          </span>
        </div>
      )}

      {/* NỘI DUNG ĐẦY ĐỦ KHI MỞ RỘNG */}
      {!isCollapsed && (
        <div className="animate-in fade-in zoom-in-[0.99] duration-200">
          {children}
        </div>
      )}
    </section>
  );
}
