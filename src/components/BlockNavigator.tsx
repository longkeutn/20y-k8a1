import React from 'react';
import { 
  MapPin, 
  CheckCircle2, 
  Users, 
  Coins, 
  Camera, 
  BookOpen, 
  MailOpen, 
  GraduationCap, 
  Sparkles,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

export interface BlockMeta {
  id: string;
  title: string;
  shortTitle: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export const PAGE_BLOCKS: BlockMeta[] = [
  { id: 'hero', title: 'Hội Ngộ 20 Năm', shortTitle: 'Trang đầu', icon: Sparkles },
  { id: 'invitation-letter-card', title: 'Bức Thư Ngỏ', shortTitle: 'Thư ngỏ', icon: MailOpen },
  { id: 'dia-diem', title: 'Thời Gian & Địa Điểm', shortTitle: 'Địa điểm', icon: MapPin },
  { id: 'diem-danh', title: 'Báo Danh & Điểm Danh', shortTitle: 'Điểm danh', icon: CheckCircle2 },
  { id: 'danh-sach-diem-danh', title: 'Bảng Vàng & Áo Polo', shortTitle: 'Bạn bè & Áo', icon: Users },
  { id: 'bank-transfer-card', title: 'Sổ Quỹ Kỷ Niệm', shortTitle: 'Sổ quỹ', icon: Coins },
  { id: 'thay-co', title: 'Tri Ân Quý Thầy Cô', shortTitle: 'Thầy cô', icon: GraduationCap },
  { id: 'ky-uc', title: 'Kho Kỷ Niệm Thanh Xuân', shortTitle: 'Kỷ niệm', icon: Camera },
];

/**
 * Cuộn mượt mà đến đúng đầu khối, tự động trừ hao chiều cao thanh Header cố định (70px)
 */
export const scrollToBlock = (blockId: string, headerOffset = 70) => {
  if (blockId === 'hero') {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }

  const el = document.getElementById(blockId);
  if (el) {
    const elementPosition = el.getBoundingClientRect().top + window.pageYOffset;
    const offsetPosition = Math.max(0, elementPosition - headerOffset);

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });

    if (blockId === 'diem-danh') {
      window.dispatchEvent(new CustomEvent('focus-diem-danh'));
    }
  }
};

interface SectionTransitionNavProps {
  currentBlockId: string;
  className?: string;
}

/**
 * Cụm nút mũi tên điều hướng chuyển tiếp giữa 2 khối liền kề
 * Hiển thị tinh tế ở ranh giới giữa các khối, cho phép người dùng lật khối lên/xuống 1 chạm
 */
export function SectionTransitionNav({ currentBlockId, className = '' }: SectionTransitionNavProps) {
  const currentIndex = PAGE_BLOCKS.findIndex((b) => b.id === currentBlockId);
  if (currentIndex === -1) return null;

  const currentBlock = PAGE_BLOCKS[currentIndex];
  const prevBlock = currentIndex > 0 ? PAGE_BLOCKS[currentIndex - 1] : null;
  const nextBlock = currentIndex < PAGE_BLOCKS.length - 1 ? PAGE_BLOCKS[currentIndex + 1] : null;

  return (
    <div className={`w-full flex items-center justify-center py-2.5 my-1 select-none ${className}`}>
      <div className="flex items-center gap-1 sm:gap-2 px-3 py-1.5 rounded-full bg-[#161B26]/85 backdrop-blur-md border border-amber-400/40 shadow-lg text-xs">
        
        {/* Nút lùi về khối trước */}
        {prevBlock ? (
          <button
            type="button"
            onClick={() => scrollToBlock(prevBlock.id)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full text-amber-200 hover:text-white hover:bg-white/10 active:scale-95 transition cursor-pointer font-sans font-medium whitespace-nowrap"
            title={`Cuộn lên đầu khối: ${prevBlock.title}`}
          >
            <ArrowUp className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="hidden sm:inline">{prevBlock.shortTitle}</span>
          </button>
        ) : (
          <span className="px-2 text-slate-500 text-[11px] font-sans">Đầu trang</span>
        )}

        {/* Chỉ báo khối hiện tại */}
        <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono text-[11px] font-semibold border border-amber-400/30">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          <span>{currentIndex + 1}/{PAGE_BLOCKS.length}</span>
          <span className="hidden md:inline font-sans text-amber-200/90 font-normal">
            • {currentBlock.shortTitle}
          </span>
        </div>

        {/* Nút chuyển sang khối tiếp theo */}
        {nextBlock ? (
          <button
            type="button"
            onClick={() => scrollToBlock(nextBlock.id)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full text-amber-200 hover:text-white hover:bg-white/10 active:scale-95 transition cursor-pointer font-sans font-medium whitespace-nowrap"
            title={`Chuyển tiếp đến đầu khối: ${nextBlock.title}`}
          >
            <span className="hidden sm:inline">{nextBlock.shortTitle}</span>
            <ArrowDown className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          </button>
        ) : (
          <span className="px-2 text-slate-500 text-[11px] font-sans">Cuối trang</span>
        )}
      </div>
    </div>
  );
}

interface QuickJumpRibbonProps {
  confirmedCount?: number;
  teachersCount?: number;
  onOpenGuideModal?: () => void;
  className?: string;
}

/**
 * Cụm nút điều hướng nhanh tinh gọn trong Hero (Quick Jump Ribbon)
 * Nhãn ngắn gọn, icon rõ ràng, cuộn ngang mượt mà, loại bỏ chữ dài lê thê
 */
export function QuickJumpRibbon({
  confirmedCount = 0,
  teachersCount = 0,
  onOpenGuideModal,
  className = ''
}: QuickJumpRibbonProps) {
  const jumpItems = [
    { id: 'dia-diem', label: 'Địa Điểm', icon: MapPin },
    { id: 'diem-danh', label: 'Điểm Danh', icon: CheckCircle2, highlight: true },
    { 
      id: 'danh-sach-diem-danh', 
      label: confirmedCount > 0 ? `Bạn Bè (${confirmedCount})` : 'Bạn Bè', 
      icon: Users 
    },
    { id: 'bank-transfer-card', label: 'Sổ Quỹ', icon: Coins },
    ...(teachersCount > 0 ? [{ id: 'thay-co', label: `Thầy Cô (${teachersCount})`, icon: GraduationCap }] : []),
    { id: 'ky-uc', label: 'Kỷ Niệm', icon: Camera },
    { id: 'invitation-letter-card', label: 'Thư Ngỏ', icon: MailOpen },
  ];

  return (
    <nav 
      aria-label="Điều hướng nhanh các khối chính"
      className={`w-full flex items-center gap-2 overflow-x-auto no-scrollbar py-1 text-xs font-sans select-none ${className}`}
    >
      <span className="text-slate-300/80 font-medium shrink-0 flex items-center gap-1 pl-0.5 text-[11px]">
        <Sparkles className="w-3 h-3 text-amber-400" />
        <span>Chuyển tới:</span>
      </span>

      <div className="flex items-center gap-1.5 shrink-0">
        {jumpItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => scrollToBlock(item.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border backdrop-blur-md transition-all duration-200 cursor-pointer whitespace-nowrap active:scale-95 shadow-xs ${
                item.highlight
                  ? 'bg-rose-600/30 hover:bg-rose-600/50 text-rose-200 hover:text-white border-rose-400/50 font-bold'
                  : 'bg-black/35 hover:bg-black/60 text-slate-200 hover:text-amber-200 border-white/10 hover:border-amber-400/50 font-medium'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 shrink-0 ${item.highlight ? 'text-rose-300' : 'text-amber-300'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}

        {onOpenGuideModal && (
          <button
            type="button"
            onClick={onOpenGuideModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/20 hover:bg-amber-500/35 text-amber-200 hover:text-white border border-amber-400/50 backdrop-blur-md transition-all duration-200 cursor-pointer whitespace-nowrap active:scale-95 font-medium shadow-xs"
            title="Mở cẩm nang hướng dẫn K8A1"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-300 shrink-0" />
            <span>Cẩm Nang</span>
          </button>
        )}
      </div>
    </nav>
  );
}
