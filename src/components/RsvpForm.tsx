import React, { useState } from 'react';
import { CheckCircle2, Send, Loader2, Sparkles, Shirt, Info, Award, UserCheck } from 'lucide-react';
import { RsvpData } from '../types';
import { triggerFullscreenFireworks } from '../utils/confetti';
import QuickShare from './QuickShare';

interface RsvpFormProps {
  appsScriptUrl: string;
  rsvpList: RsvpData[];
  onAddRsvp: (newRsvp: RsvpData) => void;
  onOpenPassModal?: (attendee: RsvpData) => void;
}

export default function RsvpForm({ appsScriptUrl, rsvpList, onAddRsvp, onOpenPassModal }: RsvpFormProps) {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [shirtSize, setShirtSize] = useState('L');
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [status, setStatus] = useState<'yes' | 'no'>('yes');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [lastSubmittedAttendee, setLastSubmittedAttendee] = useState<RsvpData | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim()) {
      setSubmitError('Vui lòng điền đầy đủ Họ tên và Số điện thoại.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(null);

    const rsvpPayload: RsvpData = {
      id: `rsvp-${Date.now()}`,
      fullName: fullName.trim(),
      phone: phone.trim(),
      className: 'K8A1',
      shirtSize: status === 'yes' ? shirtSize : undefined,
      status,
      message: message.trim(),
      submittedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    setLastSubmittedAttendee(rsvpPayload);

    if (appsScriptUrl && appsScriptUrl.startsWith('http')) {
      // Real API request to Google Apps Script
      try {
        await fetch(appsScriptUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'rsvp',
            ...rsvpPayload
          })
        });

        const successMessage = status === 'yes'
          ? 'Chúc mừng! Bạn đã xác nhận tham dự thành công. Hẹn gặp lại bạn trong ngày hội ngộ 20 năm Lớp K8A1! 🎉'
          : 'Cảm ơn bạn đã phản hồi! Dù bạn không thể đến, tập thể Lớp K8A1 vẫn luôn lưu giữ những kỷ niệm đẹp về bạn.';
        
        setSubmitSuccess(successMessage);
        onAddRsvp(rsvpPayload);

        if (status === 'yes') {
          triggerFullscreenFireworks();
        }

        // Clear form
        setFullName('');
        setPhone('');
        setMessage('');
      } catch (error) {
        console.error('Lỗi khi gửi lên Apps Script:', error);
        setSubmitError('Có lỗi xảy ra khi kết nối tới máy chủ Google Sheets. Đăng ký tạm thời lưu cục bộ!');
        onAddRsvp(rsvpPayload);
        if (status === 'yes') {
          triggerFullscreenFireworks();
        }
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Simulation mode
      setTimeout(() => {
        onAddRsvp(rsvpPayload);
        const successMessage = status === 'yes'
          ? 'Chúc mừng! Bạn đã xác nhận tham dự thành công. Hẹn gặp lại bạn trong ngày hội ngộ 20 năm Lớp K8A1! 🎉'
          : 'Cảm ơn bạn đã phản hồi! Dù bạn không thể đến, tập thể Lớp K8A1 vẫn luôn nhớ về bạn.';
        
        setSubmitSuccess(successMessage);
        setIsSubmitting(false);

        if (status === 'yes') {
          triggerFullscreenFireworks();
        }

        // Clear form
        setFullName('');
        setPhone('');
        setMessage('');
      }, 800);
    }
  };


  return (
    <div id="rsvp-section" className="space-y-6">
      {/* Biểu mẫu Xác Nhận Tham Dự - Phong cách Tạp chí */}
      <div id="rsvp-form-card" className="bg-white rounded-sm p-6 md:p-8 shadow-xs border border-brand-border">
        <div className="text-left space-y-2 mb-6 border-b border-brand-border pb-4">
          <h3 className="text-xl font-light text-brand-text">Xác Nhận Tham Dự Lớp K8A1</h3>
          <p className="text-xs text-brand-text-muted">
            Hạn chót chốt danh sách đến hết ngày 20/09/2026 để Ban liên lạc lớp chuẩn bị chu đáo nhất.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="fullName" className="block text-[10px] font-sans font-bold uppercase tracking-wider text-brand-text mb-1">
                Họ và tên của bạn <span className="text-brand-rose">*</span>
              </label>
              <input
                type="text"
                id="fullName"
                placeholder="Nguyễn Văn A"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full border-b border-brand-border py-2 text-sm focus:outline-none focus:border-brand-gold bg-transparent text-brand-text transition-all"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-[10px] font-sans font-bold uppercase tracking-wider text-brand-text mb-1">
                Số điện thoại <span className="text-brand-rose">*</span>
              </label>
              <input
                type="tel"
                id="phone"
                placeholder="090x xxx xxx"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full border-b border-brand-border py-2 text-sm focus:outline-none focus:border-brand-gold bg-transparent text-brand-text transition-all"
              />
            </div>
          </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="shirtSize" className="block text-[10px] font-sans font-bold uppercase tracking-wider text-brand-text">
                  Kích cỡ áo đồng phục kỷ niệm
                </label>
                <button
                  type="button"
                  onClick={() => setShowSizeGuide(!showSizeGuide)}
                  className="text-[10px] font-sans text-brand-gold hover:underline cursor-pointer flex items-center gap-0.5"
                >
                  <Info className="w-3 h-3" />
                  <span>Bảng size</span>
                </button>
              </div>
              <select
                id="shirtSize"
                value={shirtSize}
                onChange={(e) => setShirtSize(e.target.value)}
                disabled={status === 'no'}
                className="w-full border-b border-brand-border py-2 text-sm focus:outline-none focus:border-brand-gold bg-transparent text-brand-text transition-all cursor-pointer disabled:opacity-50"
              >
                <option value="S">Size S (Dưới 50kg, Cao dưới 1m60)</option>
                <option value="M">Size M (50 - 60kg, Cao 1m60 - 1m68)</option>
                <option value="L">Size L (61 - 70kg, Cao 1m68 - 1m75)</option>
                <option value="XL">Size XL (71 - 80kg, Cao 1m73 - 1m80)</option>
                <option value="2XL">Size 2XL (81 - 90kg, Cao trên 1m75)</option>
                <option value="3XL">Size 3XL (Trên 90kg)</option>
              </select>
            </div>

          {/* Size Chart Popover */}
          {showSizeGuide && (
            <div className="bg-[#FAF8F5] border border-brand-gold/40 rounded p-3 text-xs space-y-2">
              <div className="flex items-center justify-between font-bold text-brand-text font-serif">
                <span className="flex items-center gap-1">
                  <Shirt className="w-3.5 h-3.5 text-brand-gold" />
                  Hướng dẫn chọn size áo đồng phục Hội khóa 20 năm:
                </span>
                <button
                  type="button"
                  onClick={() => setShowSizeGuide(false)}
                  className="text-brand-text-muted hover:text-brand-text"
                >
                  ✕
                </button>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center text-[10px] font-sans">
                <div className="bg-white p-1.5 rounded border border-brand-border">
                  <span className="font-bold block text-brand-gold">Size S</span>
                  <span className="text-brand-text-muted">Dưới 50kg</span>
                </div>
                <div className="bg-white p-1.5 rounded border border-brand-border">
                  <span className="font-bold block text-brand-gold">Size M</span>
                  <span className="text-brand-text-muted">50 - 60kg</span>
                </div>
                <div className="bg-white p-1.5 rounded border border-brand-border">
                  <span className="font-bold block text-brand-gold">Size L</span>
                  <span className="text-brand-text-muted">61 - 70kg</span>
                </div>
                <div className="bg-white p-1.5 rounded border border-brand-border">
                  <span className="font-bold block text-brand-gold">Size XL</span>
                  <span className="text-brand-text-muted">71 - 80kg</span>
                </div>
                <div className="bg-white p-1.5 rounded border border-brand-border">
                  <span className="font-bold block text-brand-gold">Size 2XL</span>
                  <span className="text-brand-text-muted">81 - 90kg</span>
                </div>
                <div className="bg-white p-1.5 rounded border border-brand-border">
                  <span className="font-bold block text-brand-gold">Size 3XL</span>
                  <span className="text-brand-text-muted">&gt; 90kg</span>
                </div>
              </div>
              <p className="text-[10px] text-brand-text-muted font-serif italic">
                * Form áo polo cổ bẻ cao cấp, co giãn thoải mái. Nếu phân vân giữa 2 cỡ, bạn nên chọn tăng 1 size để mặc rộng rãi.
              </p>
            </div>
          )}

          <div>
            <label className="block text-[10px] font-sans font-bold uppercase tracking-wider text-brand-text mb-2">
              Bạn có thể tham gia được không? <span className="text-brand-rose">*</span>
            </label>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 text-sm cursor-pointer text-brand-text">
                <input
                  type="radio"
                  name="rsvp-status"
                  checked={status === 'yes'}
                  onChange={() => setStatus('yes')}
                  className="accent-brand-gold h-4 w-4"
                />
                Có tham gia
              </label>

              <label className="flex items-center gap-2 text-sm cursor-pointer text-brand-text-muted opacity-80">
                <input
                  type="radio"
                  name="rsvp-status"
                  checked={status === 'no'}
                  onChange={() => setStatus('no')}
                  className="accent-brand-gold h-4 w-4"
                />
                Rất tiếc không thể đến
              </label>
            </div>
          </div>

          <div>
            <label htmlFor="message" className="block text-[10px] font-sans font-bold uppercase tracking-wider text-brand-text mb-1">
              Lời nhắn gửi tới cả lớp (Tùy chọn)
            </label>
            <textarea
              id="message"
              rows={2}
              placeholder="Gửi gắm lời chào, kỷ niệm xưa hoặc lý do vắng mặt..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full border-b border-brand-border py-2 text-sm focus:outline-none focus:border-brand-gold bg-transparent text-brand-text transition-all resize-none"
            ></textarea>
          </div>

          {submitError && (
            <div className="p-3 bg-red-50 border border-red-100 text-xs text-red-600 rounded-sm">
              {submitError}
            </div>
          )}

          {submitSuccess && (
            <div className="p-4 bg-[#FAF9F6] border border-brand-gold/50 text-xs text-brand-text rounded-sm shadow-xs space-y-2.5">
              <div className="flex items-start gap-2.5 text-left">
                <CheckCircle2 className="w-4 h-4 text-brand-gold shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-serif font-medium text-xs sm:text-sm text-brand-text leading-relaxed">
                    {submitSuccess}
                  </p>
                  <p className="text-[10px] text-brand-text-muted font-sans">
                    Thông tin đã được đồng bộ. Bạn có thể tra cứu tên mình trong danh sách thành viên tham dự phía dưới.
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-brand-border/40 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={triggerFullscreenFireworks}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-brand-gold-light hover:bg-brand-gold/20 text-brand-text text-[10px] font-sans font-bold uppercase tracking-wider transition-colors cursor-pointer"
                    title="Nhấn để bắn pháo hoa ăn mừng lần nữa"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-brand-gold" />
                    <span>Bắn lại pháo hoa 🎉</span>
                  </button>

                  {lastSubmittedAttendee && onOpenPassModal && (
                    <button
                      type="button"
                      onClick={() => onOpenPassModal(lastSubmittedAttendee)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-brand-text hover:bg-brand-gold text-white text-[10px] font-sans font-bold uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      <Award className="w-3.5 h-3.5 text-brand-gold" />
                      <span>Nhận Thẻ Học Sinh Của Bạn 🎓</span>
                    </button>
                  )}
                </div>

                <QuickShare variant="pill" buttonText="Rủ thêm bạn trong lớp" />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-brand-text hover:bg-brand-text/90 text-white font-sans font-bold text-xs uppercase tracking-widest py-3.5 px-4 rounded-sm shadow-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-75 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Đang gửi đăng ký...
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                Gửi Xác Nhận Tham Dự
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
