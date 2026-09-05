import React, { useState } from 'react';
import { 
  Copy, 
  Check, 
  Info, 
  Landmark, 
  HelpCircle, 
  Upload, 
  Receipt, 
  Sparkles
} from 'lucide-react';
import { RsvpData } from '../types';
import ReceiptUploadModal from './ReceiptUploadModal';

interface BankTransferProps {
  customQrUrl?: string;
  bankName?: string;
  bankAccount?: string;
  bankHolder?: string;
  transferSyntax?: string;
  appsScriptUrl?: string;
  rsvpList?: RsvpData[];
  onUpdateRsvpList?: (list: RsvpData[]) => void;
  onOpenReceiptModal?: (attendee?: RsvpData) => void;
}

export default function BankTransfer({
  customQrUrl,
  bankName = "Vietcombank (VCB)",
  bankAccount = "10123456789",
  bankHolder = "NGUYEN VAN BAN TO CHUC",
  transferSyntax = "KY NIEM 20 NAM [HO TEN] [SDT]",
  appsScriptUrl = "",
  rsvpList = [],
  onUpdateRsvpList,
  onOpenReceiptModal
}: BankTransferProps) {
  // Use a beautifully generated QR Code or template as default
  const defaultQrUrl = "https://img.vietqr.io/image/vietcombank-10123456789-compact2.jpg?amount=500000&addInfo=KY%20NIEM%2020%20NAM%20[HO%20TEN]%20[SDT]";
  const qrUrl = customQrUrl || defaultQrUrl;

  const [copiedAccount, setCopiedAccount] = useState(false);
  const [copiedSyntax, setCopiedSyntax] = useState(false);
  const [isLocalModalOpen, setIsLocalModalOpen] = useState(false);

  const copyToClipboard = (text: string, type: 'account' | 'syntax') => {
    navigator.clipboard.writeText(text);
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
      onOpenReceiptModal();
    } else {
      setIsLocalModalOpen(true);
    }
  };

  return (
    <div id="bank-transfer-card" className="bg-white rounded-2xl p-6 sm:p-8 shadow-xs border border-amber-200/90 space-y-6">
      {/* Header */}
      <div className="text-left space-y-1.5 border-b border-amber-200/80 pb-4">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold tracking-[0.2em] font-sans text-amber-800 uppercase bg-amber-100/70 px-2 py-0.5 rounded">
            GÓP GIÓ THÀNH BÃO
          </span>
          <span className="text-xs text-slate-400">• Quỹ Tổ Chức Hội Khóa 20 Năm K8A1</span>
        </div>
        <h3 className="text-xl sm:text-2xl font-serif font-bold text-slate-900">
          Đóng Quỹ Sự Kiện (Tạm Ứng 500.000 VNĐ / Bạn)
        </h3>
        <p className="text-xs text-slate-600 font-sans leading-relaxed">
          Kinh phí bao gồm: Tiệc trưa Crown Palace Thái Nguyên, Áo polo đồng phục kỷ niệm 20 năm, Thẻ học sinh, Backdrop & quà lưu niệm.
        </p>
      </div>

      {/* Grid: Bank Details & QR Code */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-center">
        {/* Bank Details */}
        <div className="space-y-4 order-2 md:order-1">
          <div className="bg-[#FAF9F6] p-4 sm:p-5 rounded-xl border border-amber-200/70 space-y-3.5">
            <div className="flex items-center gap-2 border-b border-amber-200/60 pb-2">
              <Landmark className="w-4 h-4 text-amber-700" />
              <span className="text-[11px] font-sans font-bold uppercase tracking-wider text-slate-800">
                Thông tin tài khoản nhận quỹ
              </span>
            </div>

            <div className="space-y-0.5">
              <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-slate-500">Ngân hàng</span>
              <p className="text-sm font-bold text-slate-900">{bankName}</p>
            </div>

            <div className="space-y-0.5">
              <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-slate-500">Số tài khoản</span>
              <div className="flex items-center justify-between gap-2">
                <span className="text-base font-mono font-bold text-emerald-700 tracking-wider">{bankAccount}</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(bankAccount, 'account')}
                  className="flex items-center gap-1 text-[11px] text-amber-800 hover:text-amber-950 bg-amber-100/70 hover:bg-amber-200/80 px-2.5 py-1 rounded-md font-bold cursor-pointer transition-all"
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
              <p className="text-sm font-semibold text-slate-900">{bankHolder}</p>
            </div>

            <div className="space-y-1 bg-white p-2.5 rounded-lg border border-amber-200/70">
              <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-slate-500">Nội dung chuyển khoản chuẩn</span>
              <div className="flex items-start justify-between gap-2 mt-0.5">
                <p className="text-xs font-semibold text-slate-800 leading-relaxed break-all select-all font-mono">
                  {transferSyntax}
                </p>
                <button
                  type="button"
                  onClick={() => copyToClipboard(transferSyntax, 'syntax')}
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
          <div className="relative p-2.5 bg-white border-2 border-amber-300 rounded-2xl shadow-md max-w-[200px] w-full aspect-square flex items-center justify-center overflow-hidden">
            <img
              src={qrUrl}
              alt="Mã QR Chuyển khoản đóng quỹ"
              className="w-full h-full object-contain rounded-lg"
              referrerPolicy="no-referrer"
            />
            <div className="absolute top-1 right-1 bg-gradient-to-r from-amber-600 to-amber-700 text-white text-[9px] uppercase font-sans tracking-widest px-2 py-0.5 rounded-full font-bold shadow-xs">
              QUÉT NHANH
            </div>
          </div>
          <p className="text-[11px] font-sans font-medium text-slate-500 flex items-center gap-1 text-center">
            <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
            <span>Mở App Ngân hàng quét mã để tự điền</span>
          </p>
        </div>
      </div>

      {/* COMPACT & ELEGANT ACTION FOOTER STRIP */}
      <div className="pt-4 border-t border-amber-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 bg-gradient-to-r from-[#FAF8F5] to-[#F5EFE6] -mx-6 -mb-6 sm:-mx-8 sm:-mb-8 p-4 sm:p-5 rounded-b-2xl">
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
