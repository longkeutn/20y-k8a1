import React, { useState } from 'react';
import { 
  Copy, 
  Check, 
  Info, 
  Landmark, 
  HelpCircle, 
  Upload, 
  CheckCircle2, 
  Sparkles, 
  AlertTriangle, 
  RefreshCw, 
  X, 
  Receipt, 
  DollarSign, 
  UserCheck, 
  Image as ImageIcon,
  CheckCircle,
  FileCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { RsvpData } from '../types';

interface BankTransferProps {
  customQrUrl?: string;
  bankName?: string;
  bankAccount?: string;
  bankHolder?: string;
  transferSyntax?: string;
  appsScriptUrl?: string;
  rsvpList?: RsvpData[];
  onUpdateRsvpList?: (list: RsvpData[]) => void;
}

export default function BankTransfer({
  customQrUrl,
  bankName = "Vietcombank (VCB)",
  bankAccount = "10123456789",
  bankHolder = "NGUYEN VAN BAN TO CHUC",
  transferSyntax = "KY NIEM 20 NAM [HO TEN] [SDT]",
  appsScriptUrl = "",
  rsvpList = [],
  onUpdateRsvpList
}: BankTransferProps) {
  // Use a beautifully generated QR Code or template as default
  const defaultQrUrl = "https://img.vietqr.io/image/vietcombank-10123456789-compact2.jpg?amount=500000&addInfo=KY%20NIEM%2020%20NAM%20[HO%20TEN]%20[SDT]";
  const qrUrl = customQrUrl || defaultQrUrl;

  const [copiedAccount, setCopiedAccount] = useState(false);
  const [copiedSyntax, setCopiedSyntax] = useState(false);

  // Self-service upload receipt states
  const [selectedMemberPhone, setSelectedMemberPhone] = useState<string>('');
  const [customFullName, setCustomFullName] = useState<string>('');
  const [customPhone, setCustomPhone] = useState<string>('');
  const [transferAmount, setTransferAmount] = useState<number>(500000);
  const [transferNote, setTransferNote] = useState<string>('');
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

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

  // Handle selecting a member from RSVP list
  const handleSelectMember = (phoneVal: string) => {
    setSelectedMemberPhone(phoneVal);
    if (phoneVal) {
      const found = rsvpList.find(r => r.phone === phoneVal);
      if (found) {
        setCustomFullName(found.fullName);
        setCustomPhone(found.phone);
      }
    } else {
      setCustomFullName('');
      setCustomPhone('');
    }
  };

  // Handle receipt image file select
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      setUploadError('Kích thước ảnh không được vượt quá 15MB!');
      return;
    }

    setUploadError(null);
    const reader = new FileReader();
    reader.onload = () => {
      setReceiptImage(reader.result as string);
    };
    reader.onerror = () => {
      setUploadError('Không thể đọc file ảnh, vui lòng thử lại.');
    };
    reader.readAsDataURL(file);
  };

  // Handle submit receipt form
  const handleSubmitReceipt = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = customFullName.trim();
    const finalPhone = customPhone.trim();

    if (!finalName || !finalPhone) {
      setUploadError('Vui lòng chọn hoặc nhập đầy đủ Họ Tên và Số Điện Thoại!');
      return;
    }

    if (!receiptImage) {
      setUploadError('Vui lòng chọn ảnh chụp màn hình giao dịch chuyển khoản!');
      return;
    }

    setIsSubmitting(true);
    setUploadError(null);
    setUploadSuccess(null);

    const nowStr = new Date().toLocaleDateString('vi-VN') + ' ' + new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    let uploadedReceiptUrl = receiptImage;

    // 1. If Apps Script URL is configured, upload image to Google Drive (folder ChungTu_QuyLop_K8A1)
    if (appsScriptUrl && appsScriptUrl.trim()) {
      try {
        const payload = {
          action: 'upload_fund_receipt',
          fileData: receiptImage,
          fullName: finalName,
          phone: finalPhone,
          fundAmount: transferAmount,
          fundStatus: 'pending',
          fundPaymentMethod: 'bank_transfer',
          fundPaidAt: nowStr,
          fundNote: transferNote.trim() || `Thành viên tự tải lên bill ${transferAmount.toLocaleString('vi-VN')}đ qua WebApp`
        };

        const res = await fetch(appsScriptUrl, {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        const json = await res.json();
        if (json.status === 'success' && json.url) {
          uploadedReceiptUrl = json.url;
        }
      } catch (err) {
        console.warn('Lỗi gửi bill lên Apps Script, lưu cục bộ để đối soát:', err);
      }
    }

    // 2. Synchronize to RSVP List State & Local Storage
    if (onUpdateRsvpList) {
      const existingIdx = rsvpList.findIndex(r => r.phone === finalPhone || r.fullName.toLowerCase() === finalName.toLowerCase());
      let updatedList: RsvpData[];
      if (existingIdx >= 0) {
        updatedList = rsvpList.map((r, i) => {
          if (i === existingIdx) {
            return {
              ...r,
              fundStatus: 'pending',
              fundAmount: transferAmount,
              fundReceiptUrl: uploadedReceiptUrl,
              fundPaidAt: nowStr,
              fundPaymentMethod: 'bank_transfer',
              fundNote: transferNote.trim() || `Thành viên tự tải lên bill ${transferAmount.toLocaleString('vi-VN')}đ qua WebApp`
            };
          }
          return r;
        });
      } else {
        const newEntry: RsvpData = {
          id: `user-${Date.now()}`,
          fullName: finalName,
          phone: finalPhone,
          className: 'K8A1',
          status: 'yes',
          shirtSize: 'L',
          submittedAt: nowStr,
          fundStatus: 'pending',
          fundAmount: transferAmount,
          fundReceiptUrl: uploadedReceiptUrl,
          fundPaidAt: nowStr,
          fundPaymentMethod: 'bank_transfer',
          fundNote: transferNote.trim() || `Thành viên tự tải lên bill ${transferAmount.toLocaleString('vi-VN')}đ qua WebApp`
        };
        updatedList = [newEntry, ...rsvpList];
      }

      onUpdateRsvpList(updatedList);
      localStorage.setItem('rsvp_list', JSON.stringify(updatedList));
    }

    confetti({ particleCount: 65, spread: 70, origin: { y: 0.6 } });
    setUploadSuccess(`Cảm ơn bạn ${finalName}! Hệ thống đã tiếp nhận ảnh biên lai ${transferAmount.toLocaleString('vi-VN')}đ. Ban Liên Lạc sẽ kiểm tra và đối soát khớp lệnh cho bạn sớm nhất.`);
    setIsSubmitting(false);
    setReceiptImage(null);
    setTransferNote('');
  };

  return (
    <div id="bank-transfer-card" className="bg-white rounded-xl p-6 md:p-8 shadow-xs border border-amber-200 space-y-8">
      {/* Header */}
      <div className="text-left space-y-1.5 border-b border-amber-200/80 pb-4">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold tracking-[0.2em] font-sans text-amber-800 uppercase bg-amber-100/70 px-2 py-0.5 rounded">
            GÓP GIÓ THÀNH BÃO
          </span>
          <span className="text-xs text-slate-400">• Quỹ Tổ Chức Hội Khóa 20 Năm K8A1</span>
        </div>
        <h3 className="text-2xl font-serif font-bold text-slate-900">
          Đóng Quỹ Sự Kiện (Tạm Ứng 500.000 VNĐ / Bạn)
        </h3>
        <p className="text-xs text-slate-600 font-sans leading-relaxed">
          Kinh phí bao gồm: Tiệc trưa Crown Palace Thái Nguyên, Áo polo đồng phục kỷ niệm 20 năm, Thẻ học sinh, Backdrop & quà lưu niệm.
        </p>
      </div>

      {/* Grid: Bank Details & QR Code */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Bank Details */}
        <div className="space-y-4 order-2 md:order-1">
          <div className="bg-[#FAF9F6] p-5 rounded-xl border border-amber-200/70 space-y-4">
            <div className="flex items-center gap-2 border-b border-amber-200/60 pb-2.5">
              <Landmark className="w-4 h-4 text-amber-700" />
              <span className="text-[11px] font-sans font-bold uppercase tracking-wider text-slate-800">
                Thông tin tài khoản nhận quỹ
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-slate-500">Ngân hàng</span>
              <p className="text-sm font-bold text-slate-900">{bankName}</p>
            </div>

            <div className="space-y-1">
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
                      <span className="text-emerald-700">Đã sao chép</span>
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
              <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-slate-500">Chủ tài khoản (Thủ Quỹ BLL)</span>
              <p className="text-sm font-semibold text-slate-900">{bankHolder}</p>
            </div>

            <div className="space-y-1 bg-white p-3 rounded-lg border border-amber-200/70">
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

          <div className="flex items-start gap-2 text-[11px] text-slate-600 bg-amber-50/60 p-3.5 rounded-xl leading-relaxed border border-amber-200/60">
            <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <p className="font-sans">
              Sau khi chuyển khoản, bạn hãy <strong>tải ảnh biên lai (bill) giao dịch vào khung bên dưới</strong> để Ban Liên Lạc đối soát và đánh dấu hoàn thành trên bảng tin lớp nhé!
            </p>
          </div>
        </div>

        {/* QR Code */}
        <div className="flex flex-col items-center justify-center space-y-3 order-1 md:order-2 self-center">
          <div className="relative p-2.5 bg-white border-2 border-amber-300 rounded-2xl shadow-md max-w-[210px] w-full aspect-square flex items-center justify-center overflow-hidden">
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
            <span>Mở App Ngân hàng quét mã để tự điền thông tin</span>
          </p>
        </div>
      </div>

      {/* =================================================================== */}
      {/* SELF-SERVICE RECEIPT UPLOAD SECTION FOR CLASSMATES */}
      {/* =================================================================== */}
      <div className="bg-gradient-to-br from-[#FAF8F5] via-white to-[#F7F3EB] rounded-2xl border-2 border-amber-300/80 p-5 sm:p-7 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-amber-200/70 pb-3.5">
          <div className="space-y-0.5">
            <h4 className="text-base sm:text-lg font-serif font-bold text-slate-900 flex items-center gap-2">
              <Receipt className="w-5 h-5 text-amber-700" />
              <span>Gửi Ảnh Biên Lai / Bill Chuyển Khoản Cho Ban Liên Lạc</span>
            </h4>
            <p className="text-xs text-slate-500 font-sans">
              Ảnh chụp giao dịch sẽ được gửi trực tiếp để Ban Liên Lạc đối soát và cập nhật danh sách.
            </p>
          </div>
          <span className="px-2.5 py-1 bg-amber-100 text-amber-900 border border-amber-300 rounded-full text-[10px] font-sans font-bold uppercase tracking-wider shrink-0">
            Tự động đồng bộ
          </span>
        </div>

        <form onSubmit={handleSubmitReceipt} className="space-y-4">
          {/* Step 1: Chọn bạn từ danh sách hoặc nhập mới */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-sans font-bold text-slate-800">
                Chọn tên của bạn trong lớp <span className="text-slate-400 font-normal">(nếu đã đăng ký):</span>
              </label>
              <select
                value={selectedMemberPhone}
                onChange={(e) => handleSelectMember(e.target.value)}
                className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-sans focus:outline-none focus:border-amber-500 shadow-2xs cursor-pointer"
              >
                <option value="">-- Hoặc tự điền họ tên bên dưới --</option>
                {rsvpList.map((m) => {
                  const statusNote = m.fundStatus === 'paid' ? ' (Đã đóng)' : (m.fundStatus === 'pending' ? ' (Đang chờ duyệt)' : ' (Chưa đóng)');
                  return (
                    <option key={m.id || m.phone} value={m.phone}>
                      {m.fullName} {m.nickname ? `(“${m.nickname}”)` : ''} - {m.phone} {statusNote}
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-sans font-bold text-slate-800">
                Họ và tên của bạn: <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={customFullName}
                onChange={(e) => setCustomFullName(e.target.value)}
                placeholder="Ví dụ: Nguyễn Văn A"
                required
                className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-sans focus:outline-none focus:border-amber-500 shadow-2xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-sans font-bold text-slate-800">
                Số điện thoại của bạn: <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                value={customPhone}
                onChange={(e) => setCustomPhone(e.target.value)}
                placeholder="Ví dụ: 0912 345 678"
                required
                className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl font-mono text-xs focus:outline-none focus:border-amber-500 shadow-2xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-sans font-bold text-slate-800">
                Số tiền bạn đã chuyển (VNĐ): <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                step={50000}
                value={transferAmount}
                onChange={(e) => setTransferAmount(Number(e.target.value))}
                required
                className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl font-mono text-base font-bold text-emerald-700 focus:outline-none focus:border-amber-500 shadow-2xs"
              />
            </div>
          </div>

          {/* Quick Amount Presets */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-slate-500 font-sans mr-1">Mức nhanh:</span>
            <button
              type="button"
              onClick={() => setTransferAmount(500000)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                transferAmount === 500000
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-200'
              }`}
            >
              500.000đ (Mặc định)
            </button>
            <button
              type="button"
              onClick={() => setTransferAmount(1000000)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                transferAmount === 1000000
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'bg-white hover:bg-amber-50 text-amber-900 border border-amber-200'
              }`}
            >
              1.000.000đ (+ Ủng hộ 500k)
            </button>
            <button
              type="button"
              onClick={() => setTransferAmount(2000000)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                transferAmount === 2000000
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'bg-white hover:bg-amber-50 text-amber-900 border border-amber-200'
              }`}
            >
              2.000.000đ (+ Ủng hộ 1.5tr)
            </button>
          </div>

          {/* Step 2: Chọn ảnh biên lai */}
          <div className="space-y-2">
            <label className="block text-xs font-sans font-bold text-slate-800">
              Ảnh chụp màn hình biên lai / Bill chuyển khoản thành công: <span className="text-rose-500">*</span>
            </label>

            {!receiptImage ? (
              <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-amber-300 hover:border-amber-500 bg-white hover:bg-amber-50/30 rounded-2xl transition cursor-pointer group">
                <div className="w-12 h-12 rounded-full bg-amber-100 group-hover:bg-amber-200 flex items-center justify-center text-amber-700 mb-2 transition">
                  <Upload className="w-6 h-6" />
                </div>
                <span className="text-xs font-sans font-bold text-slate-800">
                  Bấm vào đây để chọn ảnh từ điện thoại hoặc máy tính
                </span>
                <span className="text-[11px] text-slate-400 font-sans mt-0.5">
                  Hỗ trợ định dạng JPG, PNG, WebP (Tối đa 15MB)
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="flex items-center justify-between p-3.5 bg-white border border-amber-200 rounded-2xl shadow-2xs">
                <div className="flex items-center gap-3">
                  <img
                    src={receiptImage}
                    alt="Biên lai chuyển khoản"
                    className="w-16 h-16 object-cover rounded-xl border border-slate-200 shadow-2xs"
                  />
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-emerald-800 flex items-center gap-1">
                      <FileCheck className="w-4 h-4 text-emerald-600" />
                      <span>Đã chọn ảnh biên lai</span>
                    </span>
                    <span className="text-[11px] text-slate-500 font-sans block">
                      Ảnh đã sẵn sàng để gửi lên hệ thống đối soát
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setReceiptImage(null)}
                  className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Chọn ảnh khác
                </button>
              </div>
            )}
          </div>

          {/* Ghi chú thêm */}
          <div className="space-y-1">
            <label className="block text-xs font-sans font-bold text-slate-800">
              Ghi chú thêm (Tùy chọn):
            </label>
            <input
              type="text"
              value={transferNote}
              onChange={(e) => setTransferNote(e.target.value)}
              placeholder="VD: Mình chuyển từ app Techcombank lúc 14:30 nhé..."
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-sans focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Alerts */}
          {uploadError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}

          {uploadSuccess && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-900 font-medium space-y-1">
              <div className="flex items-center gap-2 font-bold text-emerald-800 text-sm">
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>Gửi ảnh biên lai thành công!</span>
              </div>
              <p className="text-xs text-emerald-800 leading-relaxed font-sans pl-7">
                {uploadSuccess}
              </p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-5 bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 hover:from-amber-700 hover:to-amber-900 text-white font-sans font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-75 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Đang gửi biên lai lên hệ thống...</span>
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                <span>Gửi Ảnh Xác Nhận Đã Chuyển Tiền</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
