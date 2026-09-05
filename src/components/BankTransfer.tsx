import React, { useState } from 'react';
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
  ScrollText
} from 'lucide-react';
import { RsvpData, ClassMember } from '../types';
import { generateVietQrUrl } from '../data';
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
  fundAmount = 500000,
  bankCode = "vietcombank",
  qrTemplate = "compact",
  appsScriptUrl = "",
  rsvpList = [],
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

  // Chuẩn hóa an toàn tuyệt đối các biến cấu hình tài khoản
  const accountStr = String(bankAccount || '10123456789');
  const bankNameStr = String(bankName || 'Vietcombank (VCB)');
  const bankHolderStr = String(bankHolder || 'NGUYEN VAN BAN TO CHUC');
  const transferSyntaxStr = String(transferSyntax || 'KY NIEM 20 NAM K8A1');
  const fundAmountNum = Number(fundAmount) || 500000;
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
        const matched = (rsvpList || []).find(r => r.fullName.toLowerCase() === activeMember.fullName.toLowerCase());
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
            Thông Tin Quỹ Lớp (Tạm Ứng {fundAmountNum ? fundAmountNum.toLocaleString('vi-VN') : '500.000'}đ / Bạn)
          </h3>
          <p className="text-xs text-slate-500 font-serif italic">
            Kinh phí bao gồm: Tiệc trưa Crown Palace, Áo polo đồng phục 20 năm, Thẻ học sinh & quà lưu niệm
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
                  {fundAmountNum ? fundAmountNum.toLocaleString('vi-VN') : '500.000'} VNĐ
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
    </div>
  );
}
