import React, { useState } from 'react';
import { Heart, Send, Sparkles, GraduationCap, CheckCircle2, MessageSquare, Award } from 'lucide-react';
import { TeacherData, TeacherTribute } from '../types';
import { TEACHERS_LIST, INITIAL_TEACHER_TRIBUTES } from '../data';

export default function TeachersHonorRoll() {
  const [teachers] = useState<TeacherData[]>(TEACHERS_LIST);
  const [tributes, setTributes] = useState<TeacherTribute[]>(INITIAL_TEACHER_TRIBUTES);
  const [selectedTeacher, setSelectedTeacher] = useState<string>(teachers[0]?.name || 'Thầy Hiệu Trưởng');
  const [studentName, setStudentName] = useState('');
  const [className, setClassName] = useState('12A1');
  const [message, setMessage] = useState('');
  const [likedIds, setLikedIds] = useState<Record<string, boolean>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleLike = (id: string) => {
    if (likedIds[id]) return;
    setLikedIds((prev) => ({ ...prev, [id]: true }));
    setTributes((prev) =>
      prev.map((t) => (t.id === id ? { ...t, likes: (t.likes || 0) + 1 } : t))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim() || !message.trim()) return;

    const newTribute: TeacherTribute = {
      id: `tr-${Date.now()}`,
      teacherName: selectedTeacher,
      studentName: studentName.trim(),
      className: className.trim() || 'Cựu học sinh',
      message: message.trim(),
      submittedAt: new Date().toLocaleDateString('vi-VN') + ' ' + new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      likes: 1
    };

    setTributes([newTribute, ...tributes]);
    setMessage('');
    setIsSubmitted(true);
    setTimeout(() => setIsSubmitted(false), 4000);
  };

  return (
    <section id="teachers-section" className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-2 border-b border-brand-border pb-4">
        <span className="text-[11px] font-sans uppercase tracking-[0.25em] text-brand-gold font-bold">
          Bụi Phấn Năm Nào • Khắc Ghi Ơn Người
        </span>
        <h2 className="text-2xl md:text-3xl font-serif text-brand-text font-bold">
          Góc Tri Ân Quý Thầy Cô Giáo
        </h2>
        <p className="text-xs text-brand-text-muted font-serif italic max-w-xl mx-auto">
          "Người thầy vẫn lặng lẽ đi về sớm trưa, từng ngày giọt mồ hôi rơi nhòe trang giấy..." 
          Tấm lòng tri ân chân thành gửi tới những người lái đò tận tụy niên khóa 2003 — 2006.
        </p>
      </div>

      {/* Teachers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {teachers.map((teacher) => (
          <div
            key={teacher.id}
            className="bg-white border border-brand-border rounded-sm p-4 flex flex-col justify-between hover:shadow-sm hover:border-brand-gold/50 transition-all group"
          >
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <img
                  src={teacher.avatarUrl}
                  alt={teacher.name}
                  referrerPolicy="no-referrer"
                  className="w-14 h-14 rounded-full object-cover border-2 border-brand-gold/40 shrink-0 group-hover:scale-105 transition-transform"
                />
                <div>
                  <h4 className="font-serif font-bold text-sm text-brand-text leading-snug">
                    {teacher.name}
                  </h4>
                  <p className="text-[10px] font-sans font-bold text-brand-gold uppercase tracking-wider">
                    {teacher.role}
                  </p>
                  <p className="text-[10px] text-brand-text-muted font-serif italic">
                    {teacher.subject}
                  </p>
                </div>
              </div>

              {/* Quote */}
              {teacher.quote && (
                <div className="bg-[#FAF8F5] p-3 rounded-xs border border-brand-border/60 text-[11px] font-serif italic text-brand-text-muted leading-relaxed">
                  "{teacher.quote}"
                </div>
              )}
            </div>

            {/* Attendance Status */}
            <div className="mt-3 pt-2 border-t border-brand-border/40 flex items-center justify-between">
              <span className="text-[9px] uppercase font-sans font-bold tracking-wider text-brand-text-muted">
                Tình trạng:
              </span>
              {teacher.status === 'attending' ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-sans font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3" />
                  Đã nhận lời tham dự
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-sans font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  <Sparkles className="w-3 h-3" />
                  Gửi lời chúc từ xa
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Tribute Form and Feed Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Tribute Submission Form */}
        <div className="lg:col-span-5 bg-white border border-brand-border p-6 rounded-sm shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-brand-border pb-3">
            <GraduationCap className="w-4 h-4 text-brand-gold" />
            <h3 className="font-serif font-bold text-base text-brand-text">
              Gửi Dòng Tri Ân Đến Thầy Cô
            </h3>
          </div>

          {isSubmitted && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Lời tri ân sâu sắc của bạn đã được lưu vào sổ truyền thống!</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-[10px] font-sans font-bold uppercase tracking-wider text-brand-text mb-1">
                Kính gửi Thầy / Cô:
              </label>
              <select
                value={selectedTeacher}
                onChange={(e) => setSelectedTeacher(e.target.value)}
                className="w-full px-3 py-2 border border-brand-border rounded-xs bg-[#FAF9F6] text-xs font-serif text-brand-text focus:outline-none focus:border-brand-gold cursor-pointer"
              >
                {teachers.map((t) => (
                  <option key={t.id} value={t.name}>
                    {t.name} ({t.role})
                  </option>
                ))}
                <option value="Toàn thể Quý Thầy Cô giáo">Toàn thể Quý Thầy Cô giáo trường xưa</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-sans font-bold uppercase tracking-wider text-brand-text mb-1">
                  Họ và Tên bạn:
                </label>
                <input
                  type="text"
                  required
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="Tên học sinh"
                  className="w-full px-3 py-2 border border-brand-border rounded-xs bg-[#FAF9F6] text-xs font-serif text-brand-text focus:outline-none focus:border-brand-gold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-sans font-bold uppercase tracking-wider text-brand-text mb-1">
                  Chi hội lớp xưa:
                </label>
                <input
                  type="text"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  placeholder="VD: 12A1"
                  className="w-full px-3 py-2 border border-brand-border rounded-xs bg-[#FAF9F6] text-xs font-serif text-brand-text focus:outline-none focus:border-brand-gold"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-sans font-bold uppercase tracking-wider text-brand-text mb-1">
                Dòng tâm sự / Lời chúc tri ân:
              </label>
              <textarea
                required
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Viết nên những ký ức, lòng biết ơn hoặc lời chúc sức khỏe gửi đến Thầy Cô..."
                className="w-full px-3 py-2 border border-brand-border rounded-xs bg-[#FAF9F6] text-xs font-serif text-brand-text focus:outline-none focus:border-brand-gold leading-relaxed"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-brand-text hover:bg-brand-gold text-white text-xs font-sans font-bold uppercase tracking-wider rounded-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <Send className="w-3.5 h-3.5 text-brand-gold" />
              <span>Gửi lời tri ân</span>
            </button>
          </form>
        </div>

        {/* Tributes List */}
        <div className="lg:col-span-7 bg-[#FAF8F5] border border-brand-border p-6 rounded-sm space-y-4">
          <div className="flex items-center justify-between border-b border-brand-border pb-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-brand-gold" />
              <h3 className="font-serif font-bold text-base text-brand-text">
                Dòng Lưu Bút Tri Ân Của Học Trò
              </h3>
            </div>
            <span className="text-[10px] font-sans font-bold text-brand-text-muted bg-white px-2.5 py-0.5 border border-brand-border rounded-full">
              {tributes.length} lời tri ân
            </span>
          </div>

          <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
            {tributes.map((tr) => (
              <div
                key={tr.id}
                className="bg-white border border-brand-border/80 rounded-xs p-3.5 space-y-2 hover:border-brand-gold/60 transition-colors shadow-2xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-serif font-bold text-xs text-brand-text">
                        {tr.studentName}
                      </span>
                      <span className="text-[10px] font-sans font-medium text-brand-gold bg-brand-gold/10 px-1.5 py-0.5 rounded-xs">
                        {tr.className}
                      </span>
                      <span className="text-[10px] text-brand-text-muted font-sans">
                        kính gửi
                      </span>
                      <span className="text-[11px] font-serif font-bold text-brand-text underline decoration-brand-gold/40">
                        {tr.teacherName}
                      </span>
                    </div>
                    <span className="text-[9px] font-sans text-brand-text-muted block mt-0.5">
                      {tr.submittedAt}
                    </span>
                  </div>

                  <button
                    onClick={() => handleLike(tr.id)}
                    className={`inline-flex items-center gap-1 text-[10px] font-sans px-2 py-1 rounded-xs border transition-colors cursor-pointer ${
                      likedIds[tr.id]
                        ? 'border-red-200 bg-red-50 text-red-600 font-bold'
                        : 'border-brand-border bg-white text-brand-text-muted hover:text-red-500'
                    }`}
                  >
                    <Heart className={`w-3 h-3 ${likedIds[tr.id] ? 'fill-red-500 text-red-500' : ''}`} />
                    <span>{tr.likes || 0}</span>
                  </button>
                </div>

                <p className="text-xs font-serif text-brand-text leading-relaxed italic bg-[#FCFAF7] p-2.5 rounded-xs border-l-2 border-brand-gold">
                  "{tr.message}"
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
