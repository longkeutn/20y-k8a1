import React, { useState, useEffect } from 'react';
import { 
  X, 
  Upload, 
  Receipt, 
  CheckCircle, 
  AlertTriangle, 
  RefreshCw, 
  FileCheck, 
  DollarSign, 
  UserCheck, 
  Image as ImageIcon,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { RsvpData } from '../types';

interface ReceiptUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  appsScriptUrl?: string;
  rsvpList?: RsvpData[];
  defaultAttendee?: RsvpData | null;
  onUpdateRsvpList?: (list: RsvpData[]) => void;
}

export default function ReceiptUploadModal({
  isOpen,
  onClose,
  appsScriptUrl = '',
  rsvpList = [],
  defaultAttendee,
  onUpdateRsvpList
}: ReceiptUploadModalProps) {
  const [selectedMemberPhone, setSelectedMemberPhone] = useState<string>('');
  const [customFullName, setCustomFullName] = useState<string>('');
  const [customPhone, setCustomPhone] = useState<string>('');
  const [transferAmount, setTransferAmount] = useState<number>(500000);
  const [transferNote, setTransferNote] = useState<string>('');
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Auto-select attendee when modal opens or defaultAttendee changes
  useEffect(() => {
    if (isOpen) {
      setUploadSuccess(null);
      setUploadError(null);
      setReceiptImage(null);
      setTransferNote('');
      setTransferAmount(500000);

      if (defaultAttendee) {
        setSelectedMemberPhone(defaultAttendee.phone || '');
        setCustomFullName(defaultAttendee.fullName || '');
        setCustomPhone(defaultAttendee.phone || '');
      } else {
        setSelectedMemberPhone('');
        setCustomFullName('');
        setCustomPhone('');
      }
    }
  }, [isOpen, defaultAttendee]);

  if (!isOpen) return null;

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = customFullName.trim();
    const finalPhone = customPhone.trim();

    if (!finalName || !finalPhone) {
      setUploadError('Vui lòng chọn hoặc điền đầy đủ Họ Tên và Số Điện Thoại!');
      return;
    }

    if (!receiptImage) {
      setUploadError('Vui lòng chọn ảnh chụp biên lai / bill chuyển khoản!');
      return;
    }

    setIsSubmitting(true);
    setUploadError(null);
    setUploadSuccess(null);

    const nowStr = new Date().toLocaleDateString('vi-VN') + ' ' + new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    let uploadedReceiptUrl = receiptImage;

    // Upload to Apps Script Google Drive subfolder "ChungTu_QuyLop_K8A1"
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
          fundNote: transferNote.trim() || `Thành viên tự tải lên bill ${transferAmount.toLocaleString('vi-VN')}đ`
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

    // Synchronize to state & localStorage
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
              fundNote: transferNote.trim() || `Thành viên gửi bill ${transferAmount.toLocaleString('vi-VN')}đ`
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
          fundNote: transferNote.trim() || `Thành viên gửi bill ${transferAmount.toLocaleString('vi-VN')}đ`
        };
        updatedList = [newEntry, ...rsvpList];
      }

      onUpdateRsvpList(updatedList);
      localStorage.setItem('rsvp_list', JSON.stringify(updatedList));
    }

    confetti({ particleCount: 65, spread: 70, origin: { y: 0.6 } });
    setUploadSuccess(`Cảm ơn bạn ${finalName}! Biên lai ${transferAmount.toLocaleString('vi-VN')}đ đã được gửi tới Ban Liên Lạc đối soát.`);
    setIsSubmitting(false);

    setTimeout(() => {
      onClose();
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl border border-amber-300 shadow-2xl w-full max-w-lg overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-[#1A1613] via-[#26201A] to-[#14110F] text-white flex items-center justify-between border-b border-amber-500/30">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-serif font-bold text-amber-100">
                Gửi Ảnh Biên Lai / Bill Nộp Quỹ
              </h3>
              <p className="text-[10px] sm:text-[11px] text-slate-300 font-sans">
                Hội Khóa 20 Năm Lớp K8A1 • Tạm ứng 500.000 VNĐ
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
            title="Đóng cửa sổ"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          
          {/* Step 1: Chọn bạn từ danh sách hoặc nhập mới */}
          <div className="space-y-1">
            <label className="block text-slate-800 font-sans font-bold">
              Chọn tên của bạn trong lớp:
            </label>
            <select
              value={selectedMemberPhone}
              onChange={(e) => handleSelectMember(e.target.value)}
              className="w-full px-3 py-2 bg-[#FAF8F5] border border-slate-300 rounded-xl text-xs font-sans focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="">-- Chọn tên bạn (hoặc tự điền bên dưới) --</option>
              {rsvpList.map((m) => {
                const note = m.fundStatus === 'paid' ? ' (Đã đóng)' : (m.fundStatus === 'pending' ? ' (Chờ duyệt)' : '');
                return (
                  <option key={m.id || m.phone} value={m.phone}>
                    {m.fullName} {m.nickname ? `(“${m.nickname}”)` : ''} - {m.phone} {note}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-slate-800 font-sans font-bold">
                Họ và tên: <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={customFullName}
                onChange={(e) => setCustomFullName(e.target.value)}
                placeholder="VD: Nguyễn Văn A"
                required
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:outline-none focus:border-amber-500 font-sans"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-slate-800 font-sans font-bold">
                Số điện thoại: <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                value={customPhone}
                onChange={(e) => setCustomPhone(e.target.value)}
                placeholder="VD: 0912 345 678"
                required
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-mono text-xs focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Amount Presets */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-slate-800 font-sans font-bold">
                Số tiền đã chuyển:
              </label>
              <span className="font-mono font-bold text-emerald-700 text-sm">
                {transferAmount.toLocaleString('vi-VN')} đ
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setTransferAmount(500000)}
                className={`py-1.5 px-2 rounded-lg font-sans text-center transition cursor-pointer ${
                  transferAmount === 500000
                    ? 'bg-emerald-600 text-white font-bold shadow-2xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                500.000đ
              </button>
              <button
                type="button"
                onClick={() => setTransferAmount(1000000)}
                className={`py-1.5 px-2 rounded-lg font-sans text-center transition cursor-pointer ${
                  transferAmount === 1000000
                    ? 'bg-amber-600 text-white font-bold shadow-2xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                1.000.000đ
              </button>
              <button
                type="button"
                onClick={() => setTransferAmount(2000000)}
                className={`py-1.5 px-2 rounded-lg font-sans text-center transition cursor-pointer ${
                  transferAmount === 2000000
                    ? 'bg-amber-600 text-white font-bold shadow-2xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                2.000.000đ
              </button>
            </div>
          </div>

          {/* Step 2: Chọn ảnh biên lai */}
          <div className="space-y-1.5">
            <label className="block text-slate-800 font-sans font-bold">
              Ảnh chụp màn hình biên lai / Bill chuyển khoản: <span className="text-rose-500">*</span>
            </label>

            {!receiptImage ? (
              <label className="flex flex-col items-center justify-center p-4 sm:p-5 border-2 border-dashed border-amber-300 hover:border-amber-500 bg-[#FAF8F5] hover:bg-amber-50/50 rounded-xl transition cursor-pointer group">
                <div className="w-10 h-10 rounded-full bg-amber-100 group-hover:bg-amber-200 flex items-center justify-center text-amber-700 mb-1.5 transition">
                  <Upload className="w-5 h-5" />
                </div>
                <span className="text-xs font-sans font-bold text-slate-800">
                  Bấm vào đây để chọn ảnh từ thư viện
                </span>
                <span className="text-[10px] text-slate-400 font-sans">
                  Hỗ trợ JPG, PNG, WebP (Ảnh màn hình app ngân hàng)
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="flex items-center justify-between p-2.5 bg-[#FAF8F5] border border-amber-200 rounded-xl">
                <div className="flex items-center gap-2.5">
                  <img
                    src={receiptImage}
                    alt="Biên lai"
                    className="w-12 h-12 object-cover rounded-lg border border-slate-200 shadow-2xs"
                  />
                  <div>
                    <span className="text-xs font-bold text-emerald-800 flex items-center gap-1">
                      <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Đã chọn ảnh biên lai</span>
                    </span>
                    <span className="text-[10px] text-slate-500 font-sans block">
                      Sẵn sàng gửi Ban Liên Lạc
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setReceiptImage(null)}
                  className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-[11px] font-bold transition cursor-pointer"
                >
                  Chọn lại
                </button>
              </div>
            )}
          </div>

          {/* Ghi chú */}
          <div className="space-y-1">
            <label className="block text-slate-800 font-sans font-bold">
              Ghi chú thêm (Tùy chọn):
            </label>
            <input
              type="text"
              value={transferNote}
              onChange={(e) => setTransferNote(e.target.value)}
              placeholder="VD: Mình chuyển từ app Techcombank lúc 10:15..."
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-sans focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Alerts */}
          {uploadError && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}

          {uploadSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 font-medium space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-emerald-800 text-xs">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Gửi ảnh biên lai thành công!</span>
              </div>
              <p className="text-[11px] text-emerald-800 font-sans">
                {uploadSuccess}
              </p>
            </div>
          )}

          {/* Submit Action */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold font-sans transition cursor-pointer text-xs"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white rounded-xl font-bold font-sans shadow-md transition cursor-pointer text-xs uppercase tracking-wider disabled:opacity-75"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Đang gửi...</span>
                </>
              ) : (
                <>
                  <Upload className="w-3.5 h-3.5" />
                  <span>Gửi Ảnh Xác Nhận</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
