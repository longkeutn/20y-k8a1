import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { KeyRound, Lock, X, Delete, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { verifyPinViaBackend } from '../data';

interface PinAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (role: 'admin' | 'bll' | 'treasurer') => void;
  appsScriptUrl?: string;
  adminPin?: string;
  bllPin?: string;
  treasurerPin?: string;
}

export default function PinAuthModal({
  isOpen,
  onClose,
  onSuccess,
  appsScriptUrl
}: PinAuthModalProps) {
  const [enteredPin, setEnteredPin] = useState<string>('');
  const [pinError, setPinError] = useState<string>('');
  const [isShake, setIsShake] = useState<boolean>(false);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);

  // Luôn reset sạch sẽ trạng thái mỗi khi mở modal hoặc sau khi đăng xuất
  useEffect(() => {
    if (isOpen) {
      setEnteredPin('');
      setPinError('');
      setIsShake(false);
      setIsVerifying(false);
    }
  }, [isOpen]);

  // Hàm kiểm tra mã PIN an toàn qua Google Apps Script backend
  const verifyPin = useCallback(async (pinToTest: string) => {
    setIsVerifying(true);
    setPinError('');

    try {
      const result = await verifyPinViaBackend(pinToTest, appsScriptUrl);
      if (result.success && result.role) {
        try {
          confetti({ particleCount: 45, spread: 55, origin: { y: 0.5 } });
        } catch (e) {}
        setEnteredPin('');
        setPinError('');
        setIsVerifying(false);
        onSuccess(result.role);
        return;
      }

      setPinError(result.message || 'Mã PIN không đúng! Vui lòng thử lại.');
      setIsShake(true);
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([40, 60, 40]);
      }
      setTimeout(() => {
        setEnteredPin('');
        setIsShake(false);
        setIsVerifying(false);
      }, 500);
    } catch (err: any) {
      setPinError('Lỗi xác thực: ' + (err?.message || 'Vui lòng thử lại!'));
      setIsVerifying(false);
      setIsShake(true);
      setTimeout(() => {
        setEnteredPin('');
        setIsShake(false);
      }, 500);
    }
  }, [onSuccess, appsScriptUrl]);

  // Thao tác nhập từng số (Tối ưu phản hồi tức thì)
  const handleDigit = useCallback((digit: string) => {
    if (isVerifying) return;
    setEnteredPin((prev) => {
      if (prev.length >= 4) return prev;
      const next = prev + digit;
      setPinError('');
      if (next.length === 4) {
        setTimeout(() => verifyPin(next), 20);
      }
      return next;
    });
  }, [verifyPin, isVerifying]);

  // Xóa 1 ký tự cuối
  const handleDelete = useCallback(() => {
    if (isVerifying) return;
    setEnteredPin((prev) => prev.slice(0, -1));
    setPinError('');
  }, [isVerifying]);

  // Xóa toàn bộ
  const handleClear = useCallback(() => {
    setEnteredPin('');
    setPinError('');
  }, []);

  // Bắt sự kiện bàn phím máy tính trực tiếp (hỗ trợ cả phím số hàng trên và numpad)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (/^[0-9]$/.test(e.key)) {
        e.preventDefault();
        handleDigit(e.key);
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        handleDelete();
      } else if (e.key === 'Delete') {
        e.preventDefault();
        handleClear();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleDigit, handleDelete, handleClear, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md select-none"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94 }}
          transition={{ duration: 0.15 }}
          className="bg-gradient-to-b from-[#182030] via-[#0F172A] to-[#090D16] text-white w-full max-w-[330px] sm:max-w-sm rounded-3xl border-2 border-amber-500/50 shadow-2xl p-5 sm:p-6 space-y-4 sm:space-y-5 relative overflow-hidden"
          style={{ touchAction: 'manipulation' }}
        >
          {/* Nút đóng modal */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3.5 right-3.5 text-slate-400 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition cursor-pointer"
            title="Đóng"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header với Icon Ổ Khóa Vàng */}
          <div className="text-center space-y-2 pt-1">
            <div className="w-13 h-13 mx-auto rounded-full bg-gradient-to-br from-amber-400 to-amber-600 p-0.5 shadow-lg shadow-amber-500/20 flex items-center justify-center">
              <div className="w-full h-full rounded-full bg-[#0F172A] flex items-center justify-center">
                {isVerifying ? (
                  <Loader2 className="w-6 h-6 text-amber-400 animate-spin" />
                ) : (
                  <KeyRound className="w-6 h-6 text-amber-400" />
                )}
              </div>
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-serif font-bold text-amber-200 tracking-tight">
                {isVerifying ? 'Đang Xác Thực Mã PIN...' : 'Xác Thực Mã PIN Quản Trị'}
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-300 font-sans mt-0.5">
                Dành riêng cho <strong className="text-amber-300">Admin</strong>, <strong className="text-emerald-300">Thủ Quỹ</strong> & <strong className="text-amber-300">Ban Liên Lạc</strong>
              </p>
            </div>
          </div>

          {/* 4 Chấm tròn hiển thị tiến độ nhập PIN */}
          <div className={`flex justify-center items-center gap-3 py-1 ${isShake ? 'animate-bounce' : ''}`}>
            {[0, 1, 2, 3].map((idx) => {
              const isFilled = enteredPin.length > idx;
              return (
                <div
                  key={idx}
                  className={`w-4 h-4 rounded-full border-2 transition-all duration-150 ${
                    isFilled
                      ? 'bg-amber-400 border-amber-300 scale-110 shadow-md shadow-amber-400/60 ring-2 ring-amber-400/30'
                      : 'border-slate-600 bg-slate-800/90'
                  }`}
                />
              );
            })}
          </div>

          {/* Thông báo lỗi khi gõ sai */}
          {pinError && (
            <p className="text-[11px] text-rose-300 text-center font-medium bg-rose-950/60 py-1.5 px-3 rounded-lg border border-rose-800/60 animate-pulse">
              {pinError}
            </p>
          )}

          {/* Bàn Phím Số Cảm Ứng Tối Ưu Tốc Độ Cao (Zero-latency Touch Keypad) */}
          <div className="grid grid-cols-3 gap-2 sm:gap-2.5 max-w-[250px] mx-auto">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => handleDigit(num)}
                className="h-12 rounded-xl bg-slate-800/90 hover:bg-amber-500/25 active:bg-amber-500/40 active:scale-95 border border-slate-700/90 hover:border-amber-400/60 text-lg font-bold font-mono text-amber-100 transition-transform cursor-pointer flex items-center justify-center shadow-xs touch-manipulation select-none"
              >
                {num}
              </button>
            ))}

            {/* Nút Xóa Hết */}
            <button
              type="button"
              onClick={handleClear}
              className="h-12 rounded-xl bg-slate-900/90 hover:bg-rose-950/50 active:bg-rose-900/60 active:scale-95 border border-slate-800 text-xs font-sans font-bold text-rose-300 transition-transform cursor-pointer flex items-center justify-center touch-manipulation select-none"
            >
              Xóa
            </button>

            {/* Phím số 0 */}
            <button
              type="button"
              onClick={() => handleDigit('0')}
              className="h-12 rounded-xl bg-slate-800/90 hover:bg-amber-500/25 active:bg-amber-500/40 active:scale-95 border border-slate-700/90 hover:border-amber-400/60 text-lg font-bold font-mono text-amber-100 transition-transform cursor-pointer flex items-center justify-center shadow-xs touch-manipulation select-none"
            >
              0
            </button>

            {/* Phím Backspace lùi 1 số */}
            <button
              type="button"
              onClick={handleDelete}
              className="h-12 rounded-xl bg-slate-900/90 hover:bg-amber-950/50 active:bg-amber-900/60 active:scale-95 border border-slate-800 text-amber-300 transition-transform cursor-pointer flex items-center justify-center touch-manipulation select-none"
              title="Xóa 1 số"
            >
              <Delete className="w-5 h-5 text-amber-400" />
            </button>
          </div>

          {/* Dòng ghi chú bảo mật */}
          <div className="bg-white/5 border border-slate-700/60 rounded-xl p-2.5 text-center text-[10px] sm:text-[11px] text-slate-400 font-sans flex items-center justify-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-amber-400/90 shrink-0" />
            <span>Vui lòng nhập mã PIN bảo mật do Ban Quản Trị cấp</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
