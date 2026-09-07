import React, { useState, useMemo } from 'react';
import { 
  Copy, 
  Check, 
  Landmark, 
  HelpCircle, 
  Upload, 
  Receipt, 
  Maximize2, 
  Download, 
  X, 
  QrCode, 
  Sparkles, 
  UserCheck, 
  ScrollText,
  Eye,
  TrendingDown,
  TrendingUp,
  Wallet,
  Calendar,
  ChevronRight,
  ShieldCheck,
  FileText,
  Image as ImageIcon,
  ArrowUpRight,
  Filter
} from 'lucide-react';
import { RsvpData, ClassMember, ExpenseItem } from '../types';
import { generateVietQrUrl, EXPENSE_CATEGORIES, formatDateOnlyVi } from '../data';
import ReceiptUploadModal from './ReceiptUploadModal';

interface BankTransferProps {
  customQrUrl?: string;
  bankName?: string;
  bankAccount?: string;
  bankHolder?: string;
  transferSyntax?: string;
  fundAmount?: number;
  bankCode?: string;
  qrTemplate?: 'compact' | 'compact2' | 'qr_only';
  appsScriptUrl?: string;
  rsvpList?: RsvpData[];
  expenses?: ExpenseItem[];
  activeMember?: ClassMember | null;
  onUpdateRsvpList?: (list: RsvpData[]) => void;
  onOpenReceiptModal?: (attendee?: RsvpData) => void;
  onOpenCharterModal?: () => void;
}

export default function BankTransfer({
  customQrUrl,
  bankName = "Vietcombank (VCB)",
  bankAccount = "10123456789",
  bankHolder = "NGUYEN VAN BAN TO CHUC",
  transferSyntax = "KY NIEM 20 NAM K8A1",
  fundAmount = 700000,
  bankCode = "vietcombank",
  qrTemplate = "compact",
  appsScriptUrl = "",
  rsvpList = [],
  expenses = [],
  activeMember,
  onUpdateRsvpList,
  onOpenReceiptModal,
  onOpenCharterModal
}: BankTransferProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<'compact' | 'qr_only'>(
    qrTemplate === 'qr_only' ? 'qr_only' : 'compact'
  );
  const [copiedAccount, setCopiedAccount] = useState(false);
  const [copiedSyntax, setCopiedSyntax] = useState(false);
  const [isLocalModalOpen, setIsLocalModalOpen] = useState(false);
  const [isZoomQrOpen, setIsZoomQrOpen] = useState(false);
  const [isLedgerModalOpen, setIsLedgerModalOpen] = useState(false);
  const [ledgerTab, setLedgerTab] = useState<'expense' | 'income'>('expense');
  const [ledgerTimeFilter, setLedgerTimeFilter] = useState<'all' | 'this_month' | 'year_2026'>('all');
  const [viewingPublicReceipt, setViewingPublicReceipt] = useState<string | null>(null);

  // Chuẩn hóa an toàn tuyệt đối các biến cấu hình tài khoản
  const accountStr = String(bankAccount || '10123456789');
  const bankNameStr = String(bankName || 'Vietcombank (VCB)');
  const bankHolderStr = String(bankHolder || 'NGUYEN VAN BAN TO CHUC');
  const transferSyntaxStr = String(transferSyntax || 'KY NIEM 20 NAM K8A1');
  const fundAmountNum = Number(fundAmount) || 700000;
  const bankCodeStr = String(bankCode || 'vietcombank');

  // Tự động cá nhân hóa cú pháp chuyển khoản khi đã nhận diện thành viên
  const effectiveSyntax = activeMember
    ? `K8A1 ${activeMember.fullName.toUpperCase()} ${activeMember.phone ? activeMember.phone : ''}`.trim()
    : transferSyntaxStr;

  // Sinh mã VietQR chuẩn xác, tương thích 100% Napas và app ngân hàng
  const dynamicQrUrl = generateVietQrUrl({
    bankCode: bankCodeStr,
    bankName: bankNameStr,
    bankAccount: accountStr,
    bankHolder: bankHolderStr,
    fundAmount: fundAmountNum,
    transferSyntax: effectiveSyntax,
    template: selectedTemplate
  });

  const qrUrl = customQrUrl && String(customQrUrl).trim() !== '' ? String(customQrUrl) : dynamicQrUrl;

  // Helper lọc thời gian cho Sổ quỹ minh bạch
  const isLedgerDateInFilter = (dateStr: string | undefined, filter: 'all' | 'this_month' | 'year_2026') => {
    if (filter === 'all' || !dateStr) return true;
    let d: Date | null = null;
    const s = String(dateStr).trim();
    const dmyMatch = s.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
    if (dmyMatch) {
      const day = parseInt(dmyMatch[1], 10);
      const month = parseInt(dmyMatch[2], 10) - 1;
      const year = parseInt(dmyMatch[3], 10);
      d = new Date(year, month, day);
    } else {
      const parsed = new Date(s);
      if (!isNaN(parsed.getTime())) {
        d = parsed;
      }
    }
    if (!d) return true;
    const now = new Date();
    if (filter === 'this_month') {
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }
    if (filter === 'year_2026') {
      return d.getFullYear() === 2026;
    }
    return true;
  };

  // Danh sách các khoản chi (lấy từ prop expenses, mặc định là mảng rỗng nếu chưa có)
  const effectiveExpenses: ExpenseItem[] = Array.isArray(expenses) ? expenses : [];

  // Tính tổng thu từ rsvpList
  const paidAttendees = (rsvpList || []).filter(r => r.fundStatus === 'paid' || (r as any).paid);
  const totalIncome = paidAttendees.reduce((sum, r) => {
    const verified = Number(r.fundAmount) || Number((r as any).verifiedAmount);
    if (!isNaN(verified) && verified > 0) return sum + verified;
    return sum + (Number((r as any).paidAmount) || fundAmountNum);
  }, 0);

  // Tính tổng chi từ effectiveExpenses
  const totalExpense = effectiveExpenses.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

  // Số dư quỹ = Thu - Chi
  const fundBalance = totalIncome - totalExpense;

  // Lọc theo kỳ thời gian
  const displayedExpenses = useMemo(() => {
    return effectiveExpenses.filter(item => isLedgerDateInFilter(item.date, ledgerTimeFilter));
  }, [effectiveExpenses, ledgerTimeFilter]);

  const displayedPaidAttendees = useMemo(() => {
    return paidAttendees.filter(r => isLedgerDateInFilter(r.fundPaidAt || (r as any).paidAt || r.submittedAt, ledgerTimeFilter));
  }, [paidAttendees, ledgerTimeFilter]);

  const copyToClipboard = (text: any, type: 'account' | 'syntax') => {
    navigator.clipboard.writeText(String(text || ''));
    if (type === 'account') {
      setCopiedAccount(true);
      setTimeout(() => setCopiedAccount(false), 2000);
    } else {
      setCopiedSyntax(true);
      setTimeout(() => setCopiedSyntax(false), 2000);
    }
  };

  const handleOpenUpload = () => {
    if (onOpenReceiptModal) {
      if (activeMember) {
        const matched = (rsvpList || []).find(r => {
          if (activeMember.id && r.memberId) return r.memberId === activeMember.id;
          const p1 = String(activeMember.phone || '').replace(/[^0-9]/g, '');
          const p2 = String(r.phone || '').replace(/[^0-9]/g, '');
          if (p1 && p2) return p1 === p2;
          return r.fullName.toLowerCase().trim() === activeMember.fullName.toLowerCase().trim();
        });
        onOpenReceiptModal(matched || {
          id: `temp-${Date.now()}`,
          fullName: activeMember.fullName,
          nickname: activeMember.nickname,
          phone: activeMember.phone || '',
          className: 'K8A1',
          status: 'yes',
          shirtSize: activeMember.shirtSize || 'L',
          message: '',
          submittedAt: new Date().toISOString()
        });
      } else {
        onOpenReceiptModal();
      }
    } else {
      setIsLocalModalOpen(true);
    }
  };

  const handleDownloadQr = () => {
    const link = document.createElement('a');
    link.href = qrUrl;
    link.download = `VietQR_DongQuy_K8A1_${accountStr}.png`;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="bank-transfer-card" className="bg-[#FAF7F2] border border-amber-200/90 rounded-2xl p-4 sm:p-6 shadow-md space-y-4 text-left relative overflow-hidden">
      {/* HEADER QUỸ LỚP */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-amber-200/80 pb-3.5 gap-3">
        <div className="space-y-1 min-w-0">
          <span className="text-[11px] uppercase tracking-widest font-sans font-bold text-amber-800 block">
            Đóng Quỹ Họp Lớp K8A1
          </span>
          <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#1E293B] tracking-tight">
            Thông Tin Quỹ Lớp (Tạm Ứng {fundAmountNum ? fundAmountNum.toLocaleString('vi-VN') : '700.000'}đ / Bạn)
          </h3>
          <p className="text-xs text-slate-500 font-serif italic">
            Kinh phí bao gồm: Tiệc trưa giao lưu hội ngộ, Áo polo đồng phục 20 năm, Thẻ học sinh & quà lưu niệm
          </p>

          {activeMember && (
            <div className="pt-1 flex items-center gap-1.5 text-xs text-emerald-800 font-sans font-medium">
              <UserCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Đã tự động điền cú pháp cho <strong>{activeMember.fullName}</strong> {activeMember.nickname ? `(“${activeMember.nickname}”)` : ''}</span>
            </div>
          )}
        </div>

        {onOpenCharterModal && (
          <button
            type="button"
            onClick={onOpenCharterModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-amber-50 border border-amber-300/80 text-amber-950 text-xs font-sans font-semibold tracking-wide shadow-2xs transition cursor-pointer shrink-0 self-start sm:self-auto"
            title="Xem Quy chế Tổ chức & Hoạt động lớp K8A1"
          >
            <ScrollText className="w-3.5 h-3.5 text-amber-800" />
            <span>Quy Chế Lớp</span>
          </button>
        )}
      </div>

      {/* Grid: Bank Details & QR Code */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-center">
        {/* Bank Details */}
        <div className="space-y-4 order-2 md:order-1">
          <div className="bg-[#FAF9F6] p-4 sm:p-5 rounded-2xl border border-amber-200/70 space-y-3.5">
            <div className="flex items-center gap-2 border-b border-amber-200/60 pb-2">
              <Landmark className="w-4 h-4 text-amber-700" />
              <span className="text-[11px] font-sans font-bold uppercase tracking-wider text-slate-800">
                Thông tin tài khoản nhận quỹ
              </span>
            </div>

            <div className="space-y-0.5">
              <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-slate-500">Ngân hàng</span>
              <p className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <span>{bankNameStr}</span>
                <span className="text-[10px] font-normal text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                  Napas 24/7
                </span>
              </p>
            </div>

            <div className="space-y-0.5">
              <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-slate-500">Số tài khoản</span>
              <div className="flex items-center justify-between gap-2">
                <span className="text-base font-mono font-bold text-emerald-700 tracking-wider select-all">{accountStr}</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(accountStr, 'account')}
                  className="flex items-center gap-1 text-[11px] text-amber-800 hover:text-amber-950 bg-amber-100/70 hover:bg-amber-200/80 px-2.5 py-1 rounded-lg font-bold cursor-pointer transition-all"
                >
                  {copiedAccount ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">Đã chép</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Sao chép</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-0.5">
              <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-slate-500">Chủ tài khoản (Thủ Quỹ BLL)</span>
              <p className="text-sm font-semibold text-slate-900 uppercase font-mono">{bankHolderStr}</p>
            </div>

            <div className="space-y-1 bg-white p-2.5 rounded-xl border border-amber-200/70">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-slate-500">
                  Nội dung chuyển khoản
                </span>
                <span className="text-[9px] text-slate-400 font-sans">
                  (Chuẩn Napas không dấu)
                </span>
              </div>
              <div className="flex items-start justify-between gap-2 mt-0.5">
                <p className="text-xs font-semibold text-slate-800 leading-relaxed break-all select-all font-mono">
                  {effectiveSyntax}
                </p>
                <button
                  type="button"
                  onClick={() => copyToClipboard(effectiveSyntax, 'syntax')}
                  className="flex items-center gap-1 text-[11px] text-amber-800 hover:text-amber-950 bg-amber-100/70 hover:bg-amber-200/80 px-2 py-0.5 rounded-md font-bold shrink-0 mt-0.5 cursor-pointer"
                >
                  {copiedSyntax ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span className="text-emerald-700">Đã chép</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Sao chép</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* QR Code */}
        <div className="flex flex-col items-center justify-center space-y-2.5 order-1 md:order-2 self-center">
          {/* QR Container with Zoom trigger */}
          <div 
            onClick={() => setIsZoomQrOpen(true)}
            className="group relative p-2.5 bg-white border-2 border-amber-300 hover:border-amber-500 rounded-2xl shadow-md hover:shadow-lg transition-all duration-200 max-w-[220px] w-full aspect-square flex items-center justify-center overflow-hidden cursor-pointer"
            title="Bấm để phóng to mã QR"
          >
            <img
              src={qrUrl}
              alt="Mã QR Chuyển khoản đóng quỹ"
              className="w-full h-full object-contain rounded-lg transition-transform duration-300 group-hover:scale-105"
              referrerPolicy="no-referrer"
            />
            
            {/* Badges */}
            <div className="absolute top-1.5 right-1.5 bg-gradient-to-r from-amber-600 to-amber-700 text-white text-[9px] uppercase font-sans tracking-widest px-2 py-0.5 rounded-full font-bold shadow-xs">
              QUÉT NHANH
            </div>

            {/* Hover overlay hint */}
            <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 text-white text-xs font-bold rounded-2xl">
              <Maximize2 className="w-6 h-6 drop-shadow" />
              <span className="text-[11px] drop-shadow">Phóng to mã QR</span>
            </div>
          </div>

          {/* Quick controls under QR */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsZoomQrOpen(true)}
              className="inline-flex items-center gap-1 text-[11px] text-amber-800 hover:text-amber-950 font-semibold bg-amber-50 hover:bg-amber-100 px-2.5 py-1 rounded-lg border border-amber-200 cursor-pointer transition-colors"
            >
              <Maximize2 className="w-3 h-3" />
              <span>Phóng to</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadQr}
              className="inline-flex items-center gap-1 text-[11px] text-slate-700 hover:text-slate-900 font-semibold bg-slate-50 hover:bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 cursor-pointer transition-colors"
            >
              <Download className="w-3 h-3" />
              <span>Tải ảnh</span>
            </button>
          </div>

          <p className="text-[11px] font-sans font-medium text-slate-500 flex items-center gap-1 text-center">
            <HelpCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>Mở App Ngân hàng quét mã để tự điền số tiền & nội dung</span>
          </p>
        </div>
      </div>

      {/* MINH BẠCH TÀI CHÍNH QUỸ LỚP */}
      <div className="bg-gradient-to-br from-white to-amber-50/50 border border-amber-200/90 rounded-2xl p-4 sm:p-5 space-y-3 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-sans font-bold uppercase tracking-wider text-amber-950 flex items-center gap-1.5">
                <Wallet className="w-3.5 h-3.5 text-amber-700" />
                Minh Bạch Quỹ Lớp K8A1
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-sans font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                <ShieldCheck className="w-3 h-3 text-emerald-600" /> Công khai
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-sans">
              Công khai thu chi định kỳ & sự kiện 20 năm theo Quy chế Hoạt động Lớp
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsLedgerModalOpen(true)}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-950 font-sans font-bold text-xs rounded-xl border border-amber-300/80 transition cursor-pointer shadow-2xs hover:shadow-xs self-start sm:self-auto"
          >
            <Eye className="w-3.5 h-3.5 text-amber-800" />
            <span>Xem Sổ Thu — Chi Minh Bạch</span>
            <ChevronRight className="w-3.5 h-3.5 text-amber-700" />
          </button>
        </div>

        {/* 3 Master Stats */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 pt-1">
          {/* Tổng Thu */}
          <div className="bg-white p-2.5 sm:p-3 rounded-xl border border-emerald-200/80 shadow-2xs">
            <span className="text-[10px] sm:text-[11px] font-sans font-semibold text-emerald-700 uppercase tracking-wider flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-emerald-600 shrink-0" />
              <span className="truncate">Tổng Thu ({paidAttendees.length} bạn)</span>
            </span>
            <p className="text-xs sm:text-base font-bold font-mono text-emerald-800 mt-1 truncate">
              {totalIncome.toLocaleString('vi-VN')} <span className="text-[10px] font-normal">đ</span>
            </p>
          </div>

          {/* Tổng Chi */}
          <div className="bg-white p-2.5 sm:p-3 rounded-xl border border-rose-200/80 shadow-2xs">
            <span className="text-[10px] sm:text-[11px] font-sans font-semibold text-rose-700 uppercase tracking-wider flex items-center gap-1">
              <TrendingDown className="w-3 h-3 text-rose-600 shrink-0" />
              <span className="truncate">Tổng Chi ({effectiveExpenses.length} mục)</span>
            </span>
            <p className="text-xs sm:text-base font-bold font-mono text-rose-800 mt-1 truncate">
              {totalExpense.toLocaleString('vi-VN')} <span className="text-[10px] font-normal">đ</span>
            </p>
          </div>

          {/* Số Dư Quỹ */}
          <div className={`p-2.5 sm:p-3 rounded-xl border shadow-2xs ${
            fundBalance >= 0 ? 'bg-amber-50/70 border-amber-300/80' : 'bg-rose-50/70 border-rose-300/80'
          }`}>
            <span className="text-[10px] sm:text-[11px] font-sans font-semibold text-amber-900 uppercase tracking-wider flex items-center gap-1">
              <Wallet className="w-3 h-3 text-amber-700 shrink-0" />
              <span className="truncate">Số Dư Quỹ</span>
            </span>
            <p className={`text-xs sm:text-base font-bold font-mono mt-1 truncate ${
              fundBalance >= 0 ? 'text-amber-950 font-black' : 'text-rose-700'
            }`}>
              {fundBalance.toLocaleString('vi-VN')} <span className="text-[10px] font-normal">đ</span>
            </p>
          </div>
        </div>
      </div>

      {/* COMPACT & ELEGANT ACTION FOOTER STRIP */}
      <div className="pt-4 border-t border-amber-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 bg-gradient-to-r from-[#FAF8F5] to-[#F5EFE6] -mx-6 -mb-6 sm:-mx-8 sm:-mb-8 p-4 sm:p-5 rounded-b-2xl sm:rounded-b-3xl">
        <div className="flex items-center gap-2.5 text-left">
          <div className="w-9 h-9 rounded-full bg-amber-500/20 text-amber-900 border border-amber-400/40 flex items-center justify-center shrink-0">
            <Receipt className="w-4 h-4 text-amber-700" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900 font-sans">
              Bạn đã chuyển khoản thành công?
            </p>
            <p className="text-[11px] text-slate-600 font-sans">
              Tải ảnh biên lai (bill) để Ban Liên Lạc đối soát và cập nhật danh sách lớp nhé!
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleOpenUpload}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-sans font-bold text-xs uppercase tracking-wider rounded-xl shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 cursor-pointer shrink-0 whitespace-nowrap"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Gửi Ảnh Biên Lai</span>
        </button>
      </div>

      {/* FULLSCREEN / ZOOM QR MODAL CHO APP QUÉT CỰC NÉT */}
      {isZoomQrOpen && (
        <div 
          className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setIsZoomQrOpen(false)}
        >
          <div 
            className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-amber-200 space-y-5 animate-in zoom-in-95 duration-200 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setIsZoomQrOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full cursor-pointer transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Title */}
            <div className="text-center space-y-1">
              <div className="inline-flex items-center gap-1.5 bg-amber-100/80 text-amber-900 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                <QrCode className="w-3.5 h-3.5 text-amber-700" />
                <span>Mã VietQR Chuyển Khoản Đóng Quỹ</span>
              </div>
              <h4 className="text-lg font-serif font-bold text-slate-900">
                Họp Lớp 20 Năm K8A1 THPT Thái Nguyên
              </h4>
              <p className="text-xs text-slate-500 font-sans">
                Mở ứng dụng ngân hàng bất kỳ (VCB, MB, Techcom, BIDV...) để quét
              </p>
            </div>

            {/* Template Selector (Compact vs Pure QR) */}
            <div className="flex items-center justify-center gap-2 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setSelectedTemplate('compact')}
                className={`flex-1 py-1.5 px-3 rounded-lg transition-all cursor-pointer ${
                  selectedTemplate === 'compact'
                    ? 'bg-white text-amber-900 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Khung VietQR Chuẩn
              </button>
              <button
                type="button"
                onClick={() => setSelectedTemplate('qr_only')}
                className={`flex-1 py-1.5 px-3 rounded-lg transition-all cursor-pointer ${
                  selectedTemplate === 'qr_only'
                    ? 'bg-white text-amber-900 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Mã QR Toàn Màn Hình
              </button>
            </div>

            {/* Giant QR Image */}
            <div className="p-3 bg-white border-2 border-amber-300 rounded-2xl shadow-inner flex items-center justify-center aspect-square max-w-[320px] mx-auto">
              <img
                src={qrUrl}
                alt="Mã VietQR phóng to"
                className="w-full h-full object-contain rounded-lg"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Quick Info Summary */}
            <div className="bg-[#FAF9F6] p-3.5 rounded-xl border border-amber-200 text-xs space-y-1.5">
              <div className="flex justify-between items-center text-slate-600">
                <span>Ngân hàng:</span>
                <span className="font-bold text-slate-900">{bankNameStr}</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>Số tài khoản:</span>
                <span className="font-mono font-bold text-emerald-700 select-all">{accountStr}</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>Chủ tài khoản:</span>
                <span className="font-bold text-slate-900 uppercase font-mono">{bankHolderStr}</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>Số tiền:</span>
                <span className="font-bold text-amber-800">
                  {fundAmountNum ? fundAmountNum.toLocaleString('vi-VN') : '700.000'} VNĐ
                </span>
              </div>
              <div className="flex justify-between items-start text-slate-600 pt-1 border-t border-amber-100">
                <span className="shrink-0">Nội dung:</span>
                <span className="font-mono font-bold text-slate-800 text-right select-all break-all">
                  {effectiveSyntax}
                </span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleDownloadQr}
                className="flex-1 py-2.5 px-4 bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Tải Ảnh QR</span>
              </button>
              <button
                type="button"
                onClick={() => copyToClipboard(accountStr, 'account')}
                className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {copiedAccount ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copiedAccount ? 'Đã Chép STK' : 'Chép STK'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Self-contained modal when triggered locally */}
      {!onOpenReceiptModal && (
        <ReceiptUploadModal
          isOpen={isLocalModalOpen}
          onClose={() => setIsLocalModalOpen(false)}
          appsScriptUrl={appsScriptUrl}
          rsvpList={rsvpList}
          onUpdateRsvpList={onUpdateRsvpList}
        />
      )}

      {/* ======================================================== */}
      {/* 📊 SỔ THU CHI MINH BẠCH MODAL DÀNH CHO CẢ LỚP */}
      {/* ======================================================== */}
      {isLedgerModalOpen && (
        <div 
          className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200"
          onClick={() => setIsLedgerModalOpen(false)}
        >
          <div 
            className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-amber-200 overflow-hidden animate-in zoom-in-95 duration-200 text-left"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 sm:p-6 bg-gradient-to-r from-amber-50 via-white to-amber-50/50 border-b border-amber-200/80 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-900 border border-amber-300/60 flex items-center justify-center shrink-0">
                  <Wallet className="w-5 h-5 text-amber-700" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg sm:text-xl font-serif font-bold text-slate-900 tracking-tight flex items-center gap-2">
                    <span>Sổ Quỹ K8A1 — Thu & Chi Minh Bạch</span>
                  </h3>
                  <p className="text-xs text-slate-500 font-sans">
                    Công khai mọi khoản thu và chi tiêu thực tế của lớp K8A1 THPT Thái Nguyên
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsLedgerModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full cursor-pointer transition-colors shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 3 Summary Stats Strip */}
            <div className="bg-[#FAF9F6] border-b border-amber-200/60 px-4 py-3 sm:px-6 grid grid-cols-3 gap-2 sm:gap-4 shrink-0">
              <div className="text-center sm:text-left">
                <span className="text-[10px] font-sans font-bold uppercase text-emerald-700 tracking-wider">Tổng Thu</span>
                <p className="text-xs sm:text-sm font-bold font-mono text-emerald-800">
                  {totalIncome.toLocaleString('vi-VN')} đ
                </p>
                <span className="text-[10px] text-slate-400">({paidAttendees.length} bạn đã nộp)</span>
              </div>
              <div className="text-center sm:text-left">
                <span className="text-[10px] font-sans font-bold uppercase text-rose-700 tracking-wider">Tổng Chi</span>
                <p className="text-xs sm:text-sm font-bold font-mono text-rose-800">
                  {totalExpense.toLocaleString('vi-VN')} đ
                </p>
                <span className="text-[10px] text-slate-400">({effectiveExpenses.length} khoản chi)</span>
              </div>
              <div className="text-center sm:text-left">
                <span className="text-[10px] font-sans font-bold uppercase text-amber-900 tracking-wider">Số Dư Quỹ</span>
                <p className={`text-xs sm:text-sm font-bold font-mono ${fundBalance >= 0 ? 'text-amber-900' : 'text-rose-700'}`}>
                  {fundBalance.toLocaleString('vi-VN')} đ
                </p>
                <span className="text-[10px] text-slate-400">({fundBalance >= 0 ? 'Dư quỹ' : 'Thiếu hụt'})</span>
              </div>
            </div>

            {/* Tab Switcher & Bộ lọc thời gian */}
            <div className="px-4 sm:px-6 pt-3 pb-2 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shrink-0 bg-white">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setLedgerTab('expense')}
                  className={`inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-sans font-bold transition cursor-pointer ${
                    ledgerTab === 'expense'
                      ? 'bg-rose-100 text-rose-900 shadow-2xs border border-rose-300/80'
                      : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <TrendingDown className="w-3.5 h-3.5 text-rose-600" />
                  <span>Các Khoản Chi ({displayedExpenses.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setLedgerTab('income')}
                  className={`inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-sans font-bold transition cursor-pointer ${
                    ledgerTab === 'income'
                      ? 'bg-emerald-100 text-emerald-900 shadow-2xs border border-emerald-300/80'
                      : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Danh Sách Đóng Quỹ ({displayedPaidAttendees.length})</span>
                </button>
              </div>

              {/* Quick Time Filters */}
              <div className="flex items-center gap-1.5 self-start sm:self-auto overflow-x-auto text-xs font-sans">
                <span className="text-slate-400 text-[11px] font-medium flex items-center gap-1">
                  <Filter className="w-3 h-3 text-slate-400" /> Kỳ:
                </span>
                <button
                  type="button"
                  onClick={() => setLedgerTimeFilter('all')}
                  className={`px-2.5 py-1 rounded-lg font-bold text-xs transition cursor-pointer ${
                    ledgerTimeFilter === 'all'
                      ? 'bg-amber-900 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Tất cả
                </button>
                <button
                  type="button"
                  onClick={() => setLedgerTimeFilter('this_month')}
                  className={`px-2.5 py-1 rounded-lg font-bold text-xs transition cursor-pointer ${
                    ledgerTimeFilter === 'this_month'
                      ? 'bg-amber-900 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Tháng này
                </button>
                <button
                  type="button"
                  onClick={() => setLedgerTimeFilter('year_2026')}
                  className={`px-2.5 py-1 rounded-lg font-bold text-xs transition cursor-pointer ${
                    ledgerTimeFilter === 'year_2026'
                      ? 'bg-amber-900 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Năm 2026
                </button>
              </div>
            </div>

            {/* Modal Body - Scrollable Content */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-3">
              {ledgerTab === 'expense' ? (
                displayedExpenses.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 text-sm font-sans">
                    Chưa có khoản chi tiêu nào trong kỳ được chọn.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {displayedExpenses.map((item, idx) => {
                      const catMeta = EXPENSE_CATEGORIES.find(c => c.id === item.category) || {
                        label: 'Chi khác',
                        shortLabel: 'Khác',
                        badgeBg: 'bg-slate-100',
                        badgeText: 'text-slate-700',
                        badgeBorder: 'border-slate-200'
                      };
                      return (
                        <div 
                          key={item.id || idx}
                          className="bg-[#FAF9F6] border border-amber-200/70 rounded-2xl p-3.5 sm:p-4 hover:border-amber-400/80 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
                        >
                          <div className="space-y-1.5 min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className={`inline-flex items-center gap-1 text-[11px] font-sans font-bold px-2.5 py-0.5 rounded-full border ${catMeta.badgeBg} ${catMeta.badgeText} ${catMeta.badgeBorder}`}>
                                <span>{catMeta.label}</span>
                              </span>
                              <span className="text-xs text-slate-500 font-sans flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {formatDateOnlyVi(item.date) || '—'}
                              </span>
                              {item.eventScope && (
                                <span className="text-[10px] font-sans font-medium bg-amber-50 text-amber-800 border border-amber-200 px-1.5 py-0.2 rounded">
                                  {item.eventScope}
                                </span>
                              )}
                            </div>

                            <h4 className="text-sm font-sans font-bold text-slate-900 leading-snug">
                              {item.title}
                            </h4>

                            {item.note && (
                              <p className="text-xs text-slate-600 font-sans leading-relaxed">
                                {item.note}
                              </p>
                            )}

                            {item.spender && (
                              <p className="text-[11px] text-slate-500 font-sans">
                                Người thực hiện / chi: <strong className="text-slate-800">{item.spender}</strong>
                                {item.recipient && (
                                  <> • Nơi nhận: <span className="text-slate-700 font-medium">{item.recipient}</span></>
                                )}
                              </p>
                            )}
                          </div>

                          <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0 border-t sm:border-t-0 border-slate-200/60 pt-2 sm:pt-0">
                            <span className="text-base sm:text-lg font-bold font-mono text-rose-700">
                              -{Number(item.amount || 0).toLocaleString('vi-VN')} đ
                            </span>

                            {item.receiptUrl && (
                              <button
                                type="button"
                                onClick={() => setViewingPublicReceipt(item.receiptUrl || null)}
                                className="inline-flex items-center gap-1 text-[11px] font-sans font-bold text-amber-900 bg-amber-100/80 hover:bg-amber-200 px-2.5 py-1 rounded-lg border border-amber-300/80 transition cursor-pointer"
                              >
                                <ImageIcon className="w-3 h-3 text-amber-700" />
                                <span>Xem Hóa Đơn</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )
              ) : (
                displayedPaidAttendees.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 text-sm font-sans">
                    Chưa có bạn nào đóng quỹ trong kỳ được chọn.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {displayedPaidAttendees.map((att, idx) => {
                      const amount = Number(att.fundAmount) || Number((att as any).verifiedAmount) || Number((att as any).paidAmount) || fundAmountNum;
                      const dateDisplay = att.fundPaidAt || (att as any).paidAt || att.submittedAt;
                      return (
                        <div 
                          key={att.id || idx}
                          className="bg-[#FAF9F6] border border-emerald-200/70 rounded-xl p-3 flex items-center justify-between gap-2 shadow-2xs"
                        >
                          <div className="min-w-0 space-y-0.5">
                            <p className="text-xs sm:text-sm font-sans font-bold text-slate-900 truncate">
                              {idx + 1}. {att.fullName} {att.nickname ? `(“${att.nickname}”)` : ''}
                            </p>
                            <p className="text-[11px] text-slate-500 font-sans">
                              {dateDisplay ? new Date(dateDisplay).toLocaleDateString('vi-VN') : 'Đã xác nhận'}
                            </p>
                          </div>
                          <span className="text-xs sm:text-sm font-bold font-mono text-emerald-800 shrink-0">
                            +{amount.toLocaleString('vi-VN')} đ
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )
              )}
            </div>

            {/* Modal Footer Note */}
            <div className="p-3 sm:p-4 bg-slate-50 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-600 font-sans shrink-0">
              <p className="italic text-center sm:text-left">
                Mọi khoản thu chi được thực hiện công khai, minh bạch theo Quy chế Hoạt động Lớp K8A1.
              </p>
              <button
                type="button"
                onClick={() => setIsLedgerModalOpen(false)}
                className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl transition cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 🖼️ PUBLIC RECEIPT LIGHTBOX MODAL */}
      {/* ======================================================== */}
      {viewingPublicReceipt && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setViewingPublicReceipt(null)}
        >
          <div 
            className="bg-white rounded-3xl max-w-lg w-full p-4 sm:p-6 shadow-2xl border border-amber-200 space-y-4 animate-in zoom-in-95 duration-200 text-left relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-amber-700" />
                <h4 className="text-sm font-bold text-slate-900 font-sans">
                  Hóa Đơn / Chứng Từ Khoản Chi
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setViewingPublicReceipt(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-auto rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center p-2">
              <img 
                src={viewingPublicReceipt} 
                alt="Hóa đơn chứng từ"
                className="max-h-[55vh] w-auto object-contain rounded-lg"
              />
            </div>

            <div className="flex items-center justify-between gap-3 pt-1">
              <a
                href={viewingPublicReceipt}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-amber-800 hover:text-amber-950 font-bold"
              >
                <ArrowUpRight className="w-4 h-4" />
                <span>Mở ảnh gốc trong tab mới</span>
              </a>
              <button
                type="button"
                onClick={() => setViewingPublicReceipt(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
