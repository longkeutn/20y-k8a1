import React, { useState } from 'react';
import { CreditCard, Copy, Check, Info, Landmark, HelpCircle } from 'lucide-react';

interface BankTransferProps {
  customQrUrl?: string;
  bankName?: string;
  bankAccount?: string;
  bankHolder?: string;
  transferSyntax?: string;
}

export default function BankTransfer({
  customQrUrl,
  bankName = "Vietcombank (VCB)",
  bankAccount = "10123456789",
  bankHolder = "NGUYEN VAN BAN TO CHUC",
  transferSyntax = "KY NIEM 20 NAM [HO TEN] [SDT]"
}: BankTransferProps) {
  // Use a beautifully generated QR Code or template as default
  const defaultQrUrl = "https://img.vietqr.io/image/vietcombank-10123456789-compact2.jpg?amount=500000&addInfo=KY%20NIEM%2020%20NAM%20[HO%20TEN]%20[SDT]";
  const qrUrl = customQrUrl || defaultQrUrl;

  const [copiedAccount, setCopiedAccount] = useState(false);
  const [copiedSyntax, setCopiedSyntax] = useState(false);

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

  return (
    <div id="bank-transfer-card" className="bg-white rounded-sm p-6 md:p-8 shadow-xs border border-brand-border space-y-6">
      <div className="text-left space-y-2 border-b border-brand-border pb-4">
        <span className="text-[10px] font-bold tracking-[0.2em] font-sans text-brand-gold uppercase">GÓP GIÓ THÀNH BÃO</span>
        <h3 className="text-xl font-light text-brand-text">Đóng Quỹ Sự Kiện (Tạm Ứng)</h3>
        <p className="text-xs text-brand-text-muted">
          Mức đóng góp dự kiến: <strong>500.000đ / thành viên</strong> (Kinh phí dùng để thuê hội trường, tiệc mặn, quà tặng thầy cô và làm kỷ yếu).
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Bank Details */}
        <div className="space-y-4 order-2 md:order-1">
          <div className="bg-[#FAF9F6] p-5 rounded-sm border border-brand-border space-y-4">
            <div className="flex items-center gap-2 border-b border-brand-border pb-2">
              <Landmark className="w-4 h-4 text-brand-gold" />
              <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-brand-text">Thông tin chuyển khoản</span>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-brand-text-muted">Ngân hàng</span>
              <p className="text-sm font-semibold text-brand-text">{bankName}</p>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-brand-text-muted">Số tài khoản</span>
              <div className="flex items-center justify-between gap-2">
                <span className="text-base font-bold text-brand-text tracking-wider">{bankAccount}</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(bankAccount, 'account')}
                  className="flex items-center gap-1 text-[11px] text-brand-gold hover:text-brand-gold-dark font-bold cursor-pointer transition-all"
                >
                  {copiedAccount ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-green-600" />
                      <span className="text-green-600">Đã sao chép</span>
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

            <div className="space-y-1">
              <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-brand-text-muted">Chủ tài khoản</span>
              <p className="text-sm font-semibold text-brand-text">{bankHolder}</p>
            </div>

            <div className="space-y-1 bg-white p-3 rounded-sm border border-brand-border">
              <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-brand-text-muted">Cú pháp chuyển khoản</span>
              <div className="flex items-start justify-between gap-2 mt-0.5">
                <p className="text-xs font-semibold text-brand-text leading-relaxed break-all select-all font-mono">
                  {transferSyntax}
                </p>
                <button
                  type="button"
                  onClick={() => copyToClipboard(transferSyntax, 'syntax')}
                  className="flex items-center gap-1 text-[11px] text-brand-gold hover:text-brand-gold-dark font-bold shrink-0 mt-0.5 cursor-pointer"
                >
                  {copiedSyntax ? (
                    <>
                      <Check className="w-3 h-3 text-green-600" />
                      <span className="text-green-600">Đã sao chép</span>
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

          <div className="flex items-start gap-2 text-[11px] text-brand-text-muted bg-[#FAF9F6]/50 p-3 rounded-sm leading-relaxed border border-brand-border/60">
            <Info className="w-3.5 h-3.5 text-brand-gold shrink-0 mt-0.5" />
            <p className="font-serif italic">
              Sau khi chuyển khoản, Ban tổ chức sẽ đối soát thủ công và cập nhật lên bảng tin tài chính của lớp. Bạn nhớ giữ lại ảnh chụp biên lai giao dịch nhé!
            </p>
          </div>
        </div>

        {/* QR Code */}
        <div className="flex flex-col items-center justify-center space-y-3 order-1 md:order-2 self-center">
          <div className="relative p-2 bg-white border border-brand-border rounded-sm shadow-xs max-w-[200px] w-full aspect-square flex items-center justify-center">
            <img
              src={qrUrl}
              alt="Mã QR Chuyển khoản đóng quỹ"
              className="rounded-none w-full object-contain"
              referrerPolicy="no-referrer"
            />
            <div className="absolute top-1 right-1 bg-brand-text text-white text-[9px] uppercase font-sans tracking-widest px-2 py-0.5 rounded-none font-bold">
              QUÉT NHANH
            </div>
          </div>
          <p className="text-[10px] uppercase font-sans tracking-wider text-brand-text-muted flex items-center gap-1 text-center">
            <HelpCircle className="w-3.5 h-3.5" />
            Quét mã để tự điền thông tin
          </p>
        </div>
      </div>
    </div>
  );
}
