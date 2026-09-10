import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert, KeyRound, ArrowRight, X, Sparkles, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface MemberAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const VALID_MEMBER_KEYS = ['k8a1', '20nam', 'k8a1tn', 'thanhxuan20nam'];

export default function MemberAccessModal({ isOpen, onClose, onSuccess }: MemberAccessModalProps) {
  const [accessCode, setAccessCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = accessCode.trim().toLowerCase();
    
    if (VALID_MEMBER_KEYS.includes(clean)) {
      setErrorMsg('');
      setIsSuccess(true);
      try {
        localStorage.setItem('k8a1_member_verified', 'true');
        confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 } });
      } catch (err) {}

      setTimeout(() => {
        setIsSuccess(false);
        setAccessCode('');
        onSuccess();
      }, 700);
    } else {
      setErrorMsg('Mã chưa chính xác. Gợi ý: Tên viết tắt của lớp mình (ví dụ: k8a1)');
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-amber-200"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-slate-900 p-6 text-white text-center relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors cursor-pointer"
              aria-label="Đóng"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-14 h-14 mx-auto mb-3 bg-white/15 rounded-2xl flex items-center justify-center shadow-inner backdrop-blur-xs border border-white/20">
              <ShieldAlert className="w-7 h-7 text-amber-300" />
            </div>

            <h3 className="text-xl font-bold font-serif tracking-wide text-amber-100">
              Khu Vực Nội Bộ Lớp K8A1
            </h3>
            <p className="text-xs text-amber-200/90 mt-1 font-sans">
              Dành riêng cho các bạn học sinh Khóa 2003 — 2006
            </p>
          </div>

          {/* Content */}
          <div className="p-6 space-y-5">
            <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-4 text-xs text-slate-700 leading-relaxed space-y-2">
              <p className="font-semibold text-amber-900 flex items-center gap-1.5 text-sm">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                Chào bạn học K8A1!
              </p>
              <p>
                Để giữ gìn không gian kỷ niệm và tránh các sửa đổi ngoài ý muốn từ người ngoài, chức năng <strong>Điểm danh</strong>, <strong>Gửi lưu bút</strong> và <strong>Đóng góp ảnh</strong> chỉ mở cho thành viên lớp.
              </p>
              <p className="text-slate-600 italic">
                💡 <strong>Mẹo:</strong> Bạn chỉ cần truy cập website qua đường link được gửi trong <strong>Nhóm Zalo Lớp K8A1</strong> là hệ thống sẽ tự động ghi nhận vĩnh viễn, không cần nhập lại.
              </p>
            </div>

            {/* Form mở khóa nhanh */}
            <form onSubmit={handleVerifyCode} className="space-y-3">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Hoặc mở khóa trực tiếp tại đây:
              </label>
              
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={accessCode}
                  onChange={(e) => {
                    setAccessCode(e.target.value);
                    if (errorMsg) setErrorMsg('');
                  }}
                  placeholder="Nhập mã lớp (ví dụ: k8a1)..."
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                  autoFocus
                />
              </div>

              {errorMsg && (
                <p className="text-xs text-rose-600 font-medium animate-in fade-in">
                  {errorMsg}
                </p>
              )}

              {isSuccess && (
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Xác nhận thành công! Chào mừng bạn về với K8A1 🎉</span>
                </div>
              )}

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Để sau / Xem nội dung
                </button>
                <button
                  type="submit"
                  disabled={!accessCode.trim() || isSuccess}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  <span>Mở Khóa Ngay</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
