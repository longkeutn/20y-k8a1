import React, { useState } from 'react';
import { Calendar, MapPin, Clock, Users, Heart, CheckCircle2, XCircle, Send, Loader2, Sparkles, Shirt, Info, Award } from 'lucide-react';
import { RsvpData } from '../types';
import { triggerFullscreenFireworks } from '../utils/confetti';
import InteractiveMap from './InteractiveMap';
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
  const [className, setClassName] = useState('K8A1');
  const [shirtSize, setShirtSize] = useState('L');
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [status, setStatus] = useState<'yes' | 'no'>('yes');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [lastSubmittedAttendee, setLastSubmittedAttendee] = useState<RsvpData | null>(null);

  // Tab for active list
  const [filterStatus, setFilterStatus] = useState<'all' | 'yes' | 'no'>('all');

  const filteredList = rsvpList.filter(item => {
    if (filterStatus === 'all') return true;
    return item.status === filterStatus;
  });

  // Calculate shirt size breakdown for BTC
  const shirtStats = rsvpList
    .filter(i => i.status === 'yes' && i.shirtSize)
    .reduce((acc, curr) => {
      const size = curr.shirtSize || 'Khác';
      acc[size] = (acc[size] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

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
      className: className.trim() || 'K8A1',
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
    <div id="rsvp-section" className="space-y-8">
      {/* Event Details Card - Editorial Style */}
      <div id="event-details" className="bg-white rounded-sm p-6 md:p-8 shadow-xs border border-brand-border space-y-6">
        <div className="text-left space-y-2 border-b border-brand-border pb-4">
          <span className="text-[10px] font-bold tracking-[0.2em] font-sans text-brand-gold uppercase">THƯ MỜI SỰ KIỆN</span>
          <h3 className="text-2xl font-light text-brand-text">Hội Ngộ 20 Năm Lớp K8A1 (2006 — 2026)</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-brand-gold-light text-brand-gold rounded-sm">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] font-sans font-bold uppercase tracking-wider text-brand-text-muted">Thời gian</p>
              <p className="text-sm font-semibold text-brand-text">Chủ Nhật, 27.09.2026</p>
              <p className="text-xs text-brand-text-muted">Từ 08:30 sáng đến 15:30</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-brand-gold-light text-brand-gold rounded-sm">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] font-sans font-bold uppercase tracking-wider text-brand-text-muted">Địa điểm</p>
              <p className="text-sm font-semibold text-brand-text">Crown Palace Thái Nguyên</p>
              <p className="text-xs text-brand-text-muted font-serif italic">779 Dương Tự Minh, P. Quang Vinh, TP. Thái Nguyên</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-brand-gold-light text-brand-gold rounded-sm">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] font-sans font-bold uppercase tracking-wider text-brand-text-muted">Chương trình</p>
              <p className="text-sm font-semibold text-brand-text">Gặp gỡ bạn bè & Tiệc mừng</p>
              <p className="text-xs text-brand-text-muted">Giao lưu ôn kỷ niệm 20 năm</p>
            </div>
          </div>
        </div>

        {/* Interactive Google Maps Component */}
        <div id="maps-wrapper" className="pt-2">
          <InteractiveMap />
        </div>
      </div>

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
              <label htmlFor="className" className="block text-[10px] font-sans font-bold uppercase tracking-wider text-brand-text mb-1">
                Lớp / Tổ <span className="text-brand-rose">*</span>
              </label>
              <input
                type="text"
                id="className"
                placeholder="VD: K8A1 (Tổ 1, Tổ 2, Tổ 3...)"
                required
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                className="w-full border-b border-brand-border py-2 text-sm focus:outline-none focus:border-brand-gold bg-transparent text-brand-text transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

      {/* Attendees List Card - Editorial Style */}
      <div id="attendees-list-card" className="bg-white rounded-sm p-6 md:p-8 shadow-xs border border-brand-border space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-border pb-4">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-brand-gold" />
            <h3 className="text-xs uppercase tracking-[0.2em] font-sans font-bold text-brand-text">Thành Viên ({rsvpList.length})</h3>
          </div>
          
          <div className="flex gap-1 bg-brand-gold-light p-1 rounded-sm self-start">
            <button
              type="button"
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1 text-[10px] uppercase font-sans font-bold tracking-wider rounded-xs transition-all cursor-pointer ${
                filterStatus === 'all' ? 'bg-white text-brand-text shadow-xs' : 'text-brand-text-muted hover:text-brand-text'
              }`}
            >
              Tất cả
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus('yes')}
              className={`px-3 py-1 text-[10px] uppercase font-sans font-bold tracking-wider rounded-xs transition-all cursor-pointer ${
                filterStatus === 'yes' ? 'bg-white text-brand-gold shadow-xs' : 'text-brand-text-muted hover:text-brand-text'
              }`}
            >
              Tham gia ({rsvpList.filter(i => i.status === 'yes').length})
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus('no')}
              className={`px-3 py-1 text-[10px] uppercase font-sans font-bold tracking-wider rounded-xs transition-all cursor-pointer ${
                filterStatus === 'no' ? 'bg-white text-brand-text shadow-xs' : 'text-brand-text-muted hover:text-brand-text'
              }`}
            >
              Vắng ({rsvpList.filter(i => i.status === 'no').length})
            </button>
          </div>
        </div>

        {/* BTC Shirt Sizes Summary Bar */}
        {Object.keys(shirtStats).length > 0 && (
          <div className="bg-[#FAF8F5] border border-brand-border/80 rounded-xs p-3 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-1.5 font-sans font-bold text-[10px] uppercase tracking-wider text-brand-text">
              <Shirt className="w-3.5 h-3.5 text-brand-gold" />
              <span>Tổng hợp đặt may áo đồng phục:</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {Object.entries(shirtStats).map(([size, count]) => (
                <span
                  key={size}
                  className="bg-white border border-brand-border px-2 py-0.5 rounded text-[10px] font-sans font-bold text-brand-gold"
                >
                  Size {size}: <strong>{count}</strong> áo
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="max-h-[350px] overflow-y-auto pr-2 space-y-3 no-scrollbar">
          {filteredList.length === 0 ? (
            <p className="text-center py-8 text-xs text-brand-text-muted font-serif italic">Chưa có ai đăng ký ở bộ lọc này.</p>
          ) : (
            filteredList.map((rsvp, idx) => (
              <div
                key={rsvp.id || idx}
                className={`p-4 rounded-xs border transition-all flex items-start justify-between gap-4 ${
                  rsvp.status === 'yes' 
                    ? 'border-brand-border bg-brand-bg/20 hover:bg-brand-gold-light/40' 
                    : 'border-brand-border/60 bg-[#FAF9F6]/50 hover:bg-brand-gold-light/20 opacity-80'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm text-brand-text">{rsvp.fullName}</span>
                    {rsvp.className && (
                      <span className="text-[10px] font-sans font-bold text-brand-gold bg-brand-gold/10 px-1.5 py-0.5 rounded-xs">
                        {rsvp.className}
                      </span>
                    )}
                    {rsvp.shirtSize && rsvp.status === 'yes' && (
                      <span className="text-[10px] font-sans font-medium text-brand-text-muted bg-white border border-brand-border px-1.5 py-0.5 rounded-xs flex items-center gap-0.5">
                        <Shirt className="w-2.5 h-2.5 text-brand-gold" />
                        Size {rsvp.shirtSize}
                      </span>
                    )}
                    <span className={`text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-xs font-bold ${
                      rsvp.status === 'yes'
                        ? 'bg-brand-gold/10 text-brand-gold'
                        : 'bg-brand-text/10 text-brand-text-muted'
                    }`}>
                      {rsvp.status === 'yes' ? 'Tham gia' : 'Vắng'}
                    </span>
                  </div>
                  {rsvp.message && (
                    <p className="text-xs text-brand-text-muted italic leading-relaxed font-serif">
                      " {rsvp.message} "
                    </p>
                  )}
                  <p className="text-[10px] text-brand-text-muted/70 font-sans uppercase tracking-wider">
                    SĐT: {rsvp.phone.replace(/(\d{4})(\d{3})(\d{3})/, '$1***$3')} • Gửi lúc {rsvp.submittedAt}
                  </p>
                </div>

                {rsvp.status === 'yes' && onOpenPassModal && (
                  <button
                    type="button"
                    onClick={() => onOpenPassModal(rsvp)}
                    className="shrink-0 inline-flex items-center gap-1 px-2 py-1 bg-white hover:bg-brand-gold-light text-brand-text text-[10px] font-sans font-bold uppercase tracking-wider border border-brand-border rounded-xs transition-colors cursor-pointer"
                    title="Xem Thẻ Học Sinh Cá Nhân Hóa"
                  >
                    <Award className="w-3 h-3 text-brand-gold" />
                    <span>Xem thẻ</span>
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
