import React, { useState, useMemo } from 'react';
import { 
  Heart, 
  Send, 
  Sparkles, 
  GraduationCap, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  MessageSquare, 
  Award, 
  Car, 
  Users, 
  MapPin, 
  BookOpen, 
  Search
} from 'lucide-react';
import { TeacherData, TeacherTribute, TeacherInvitationStatus } from '../types';
import { TEACHERS_LIST, INITIAL_TEACHER_TRIBUTES } from '../data';

interface TeachersHonorRollProps {
  teachers?: TeacherData[];
  onAddTribute?: (tribute: TeacherTribute) => void;
}

export default function TeachersHonorRoll({ teachers: propTeachers, onAddTribute }: TeachersHonorRollProps) {
  const teachers = useMemo(() => {
    return Array.isArray(propTeachers) ? propTeachers : [];
  }, [propTeachers]);



  const [tributes, setTributes] = useState<TeacherTribute[]>(INITIAL_TEACHER_TRIBUTES);
  const [selectedTeacher, setSelectedTeacher] = useState<string>(teachers[0]?.name || 'Toàn thể Quý Thầy Cô giáo');
  const [studentName, setStudentName] = useState('');
  const [className, setClassName] = useState('12A1');
  const [message, setMessage] = useState('');
  const [likedIds, setLikedIds] = useState<Record<string, boolean>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [teacherFilter, setTeacherFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

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
      className: className.trim() || 'Cựu học sinh K8A1',
      message: message.trim(),
      submittedAt: new Date().toLocaleDateString('vi-VN') + ' ' + new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      likes: 1
    };

    setTributes([newTribute, ...tributes]);
    if (onAddTribute) onAddTribute(newTribute);
    setMessage('');
    setIsSubmitted(true);
    setTimeout(() => setIsSubmitted(false), 4000);
  };

  // Lọc danh sách thầy cô
  const filteredTeachers = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return teachers.filter((t) => {
      const matchQuery = !q ||
        t.name.toLowerCase().includes(q) ||
        (t.subject && t.subject.toLowerCase().includes(q)) ||
        (t.role && t.role.toLowerCase().includes(q)) ||
        (t.address && t.address.toLowerCase().includes(q));

      const matchFilter = 
        teacherFilter === 'all' ||
        (teacherFilter === 'attending' && t.status === 'attending') ||
        (teacherFilter === 'wishing' && t.status === 'wishing') ||
        (teacherFilter === 'pending' && (!t.status || t.status === 'pending')) ||
        (teacherFilter === 'memorial' && t.status === 'memorial');

      return matchQuery && matchFilter;
    });
  }, [teachers, searchQuery, teacherFilter]);

  // Thống kê nhanh
  const stats = useMemo(() => {
    const total = teachers.length;
    const attending = teachers.filter(t => t.status === 'attending').length;
    const wishing = teachers.filter(t => t.status === 'wishing').length;
    const memorial = teachers.filter(t => t.status === 'memorial').length;
    return { total, attending, wishing, memorial };
  }, [teachers]);

  // Helper render huy hiệu trạng thái
  const renderStatusBadge = (status?: TeacherInvitationStatus) => {
    switch (status) {
      case 'attending':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-sans font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-300 shadow-2xs">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>Chắc chắn tham dự</span>
          </span>
        );
      case 'wishing':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-sans font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-300 shadow-2xs">
            <Sparkles className="w-3 h-3 text-amber-600" />
            <span>Gửi lời chúc từ xa</span>
          </span>
        );
      case 'memorial':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-sans font-bold text-purple-800 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-300 shadow-2xs">
            <Heart className="w-3 h-3 text-purple-600 fill-purple-200" />
            <span>Tưởng nhớ tri ân</span>
          </span>
        );
      case 'declined':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-sans font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-300">
            <XCircle className="w-3 h-3 text-slate-500" />
            <span>Báo bận</span>
          </span>
        );
      case 'pending':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-sans font-bold text-sky-800 bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-300">
            <Clock className="w-3 h-3 text-sky-600" />
            <span>BLL đang liên hệ</span>
          </span>
        );
    }
  };

  // Nếu sheet chưa có dữ liệu thì ẩn toàn bộ khối này
  if (!teachers || teachers.length === 0) {
    return null;
  }

  return (
    <section id="thay-co" className="space-y-8 scroll-mt-20">
      {/* Header */}
      <div className="text-center space-y-2.5 border-b border-amber-200/80 pb-5">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100/70 border border-amber-300/80 text-amber-900 text-[11px] font-sans uppercase tracking-[0.2em] font-bold shadow-2xs">
          <GraduationCap className="w-3.5 h-3.5 text-amber-700" />
          <span>Bụi Phấn Năm Nào • Khắc Ghi Ơn Người</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-serif text-[#1E293B] font-bold tracking-tight">
          Bảng Vàng Tri Ân Quý Thầy Cô Giáo K8A1
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 font-serif italic max-w-2xl mx-auto leading-relaxed">
          "Người thầy vẫn lặng lẽ đi về sớm trưa, từng ngày giọt mồ hôi rơi nhòe trang giấy..."
          <br className="hidden sm:inline" />
          Tấm lòng tri ân sâu sắc của 65 cô cậu học trò gửi tới những người lái đò tận tụy niên khóa 2003 — 2006.
        </p>

        {/* Quick Stats Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-xs">
          <button
            onClick={() => setTeacherFilter('all')}
            className={`px-3 py-1 rounded-full font-sans font-bold transition cursor-pointer ${
              teacherFilter === 'all'
                ? 'bg-[#1E293B] text-amber-300 shadow-sm'
                : 'bg-white border border-amber-200 text-slate-600 hover:bg-amber-50'
            }`}
          >
            Tất cả ({stats.total})
          </button>
          <button
            onClick={() => setTeacherFilter('attending')}
            className={`px-3 py-1 rounded-full font-sans font-bold transition cursor-pointer flex items-center gap-1 ${
              teacherFilter === 'attending'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'bg-emerald-50 border border-emerald-300 text-emerald-800 hover:bg-emerald-100'
            }`}
          >
            <CheckCircle2 className="w-3 h-3" />
            <span>Về dự hội khóa ({stats.attending})</span>
          </button>
          <button
            onClick={() => setTeacherFilter('wishing')}
            className={`px-3 py-1 rounded-full font-sans font-bold transition cursor-pointer flex items-center gap-1 ${
              teacherFilter === 'wishing'
                ? 'bg-amber-700 text-white shadow-sm'
                : 'bg-amber-50 border border-amber-300 text-amber-800 hover:bg-amber-100'
            }`}
          >
            <Sparkles className="w-3 h-3" />
            <span>Gửi lời chúc ({stats.wishing})</span>
          </button>
          {stats.memorial > 0 && (
            <button
              onClick={() => setTeacherFilter('memorial')}
              className={`px-3 py-1 rounded-full font-sans font-bold transition cursor-pointer flex items-center gap-1 ${
                teacherFilter === 'memorial'
                  ? 'bg-purple-700 text-white shadow-sm'
                  : 'bg-purple-50 border border-purple-300 text-purple-800 hover:bg-purple-100'
              }`}
            >
              <Heart className="w-3 h-3" />
              <span>Tưởng nhớ ({stats.memorial})</span>
            </button>
          )}
        </div>
      </div>

      {/* Search Bar */}
      {teachers.length > 4 && (
        <div className="max-w-md mx-auto">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tên Thầy/Cô, môn dạy, vai trò..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-amber-200 rounded-full focus:outline-none focus:border-amber-500 font-serif"
            />
          </div>
        </div>
      )}

      {/* Teachers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredTeachers.map((teacher) => (
          <div
            key={teacher.id}
            className="bg-[#FFFEFA] border border-amber-200/90 rounded-xl p-5 flex flex-col justify-between shadow-xs hover:shadow-md hover:border-amber-400 transition-all group relative overflow-hidden"
          >
            {/* Top accent bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600" />

            <div className="space-y-4 pt-1">
              {/* Profile Header */}
              <div className="flex items-start gap-3.5">
                <div className="relative shrink-0">
                  <img
                    src={teacher.avatarUrl || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80'}
                    alt={teacher.name}
                    referrerPolicy="no-referrer"
                    className="w-16 h-16 rounded-xl object-cover border-2 border-amber-300 shadow-xs group-hover:scale-105 transition-transform"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80';
                    }}
                  />
                  <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center text-[10px] font-serif font-bold shadow-xs">
                    {teacher.gender === 'Thầy' ? '👨‍🏫' : '👩‍🏫'}
                  </span>
                </div>

                <div className="space-y-1 min-w-0 flex-1">
                  <h4 className="font-serif font-bold text-base text-[#1E293B] leading-snug group-hover:text-amber-800 transition-colors truncate">
                    {teacher.name}
                  </h4>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="inline-flex items-center gap-1 text-[10px] font-sans font-bold text-amber-900 bg-amber-100/90 px-2 py-0.5 rounded-md">
                      <Award className="w-2.5 h-2.5 text-amber-700" />
                      {teacher.role || 'Giáo viên'}
                    </span>
                    {teacher.subject && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-sans text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md font-medium">
                        <BookOpen className="w-2.5 h-2.5 text-slate-500" />
                        Môn: {teacher.subject}
                      </span>
                    )}
                  </div>
                  {teacher.workStatus && (
                    <p className="text-[10px] text-slate-500 font-serif italic">
                      {teacher.workStatus} {teacher.birthYear ? `• Sinh năm ${teacher.birthYear}` : ''}
                    </p>
                  )}
                </div>
              </div>

              {/* Quote / Words of wisdom */}
              {teacher.quote ? (
                <div className="bg-gradient-to-br from-[#FAF8F5] to-[#F5EFE6] p-3 rounded-lg border-l-3 border-amber-500 text-[11px] font-serif italic text-slate-700 leading-relaxed shadow-2xs">
                  “{teacher.quote}”
                </div>
              ) : null}

              {/* Logistic Details (Phu quân / Xe đưa đón) */}
              <div className="space-y-1.5 pt-1 text-[11px] text-slate-600 font-sans border-t border-amber-100/80">
                {teacher.address && (
                  <div className="flex items-center gap-1.5 text-slate-500 truncate">
                    <MapPin className="w-3 h-3 text-amber-600 shrink-0" />
                    <span className="truncate">{teacher.address}</span>
                  </div>
                )}
                {teacher.status === 'attending' && (
                  <>
                    {teacher.companion && teacher.companion !== 'Đi một mình' && (
                      <div className="flex items-center gap-1.5 text-emerald-800 font-medium">
                        <Users className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span>Người đi cùng: {teacher.companion}</span>
                      </div>
                    )}
                    {teacher.transportation && teacher.transportation !== 'Tự túc' && (
                      <div className="flex items-center gap-1.5 text-blue-800 font-medium">
                        <Car className="w-3 h-3 text-blue-600 shrink-0" />
                        <span>Đón tiếp: {teacher.transportation}</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Attendance Status Bar */}
            <div className="mt-4 pt-3 border-t border-amber-200/60 flex items-center justify-between">
              <span className="text-[10px] uppercase font-sans font-bold tracking-wider text-slate-500">
                Tham dự:
              </span>
              {renderStatusBadge(teacher.status)}
            </div>
          </div>
        ))}
      </div>

      {/* Tribute Form and Feed Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start pt-4">
        {/* Tribute Submission Form */}
        <div className="lg:col-span-5 bg-[#FFFEFA] border-2 border-amber-300/80 p-6 rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-amber-200 pb-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-700 flex items-center justify-center">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-[#1E293B]">
                Gửi Dòng Tri Ân Đến Thầy Cô
              </h3>
              <p className="text-[11px] text-slate-500 font-sans">
                Lưu lại những lời dặn dò, kỷ niệm sâu sắc thời áo trắng
              </p>
            </div>
          </div>

          {isSubmitted && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-2 shadow-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Lời tri ân sâu sắc của bạn đã được ghi vào Sổ Truyền Thống K8A1!</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-[10px] font-sans font-bold uppercase tracking-wider text-slate-700 mb-1">
                Kính gửi Thầy / Cô:
              </label>
              <select
                value={selectedTeacher}
                onChange={(e) => setSelectedTeacher(e.target.value)}
                className="w-full px-3 py-2 border border-amber-200 rounded-lg bg-[#FAF9F5] text-xs font-serif text-[#1E293B] focus:outline-none focus:border-amber-500 cursor-pointer shadow-2xs"
              >
                <option value="Toàn thể Quý Thầy Cô giáo trường xưa">
                  Toàn thể Quý Thầy Cô giáo THPT Thái Nguyên
                </option>
                {teachers.map((t) => (
                  <option key={t.id} value={t.name}>
                    {t.name} ({t.role || t.subject})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-sans font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Họ và Tên bạn:
                </label>
                <input
                  type="text"
                  required
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="Họ tên cựu học sinh"
                  className="w-full px-3 py-2 border border-amber-200 rounded-lg bg-[#FAF9F5] text-xs font-serif text-[#1E293B] focus:outline-none focus:border-amber-500 shadow-2xs"
                />
              </div>
              <div>
                <label className="block text-[10px] font-sans font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Chi hội lớp xưa:
                </label>
                <input
                  type="text"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  placeholder="VD: 12A1"
                  className="w-full px-3 py-2 border border-amber-200 rounded-lg bg-[#FAF9F5] text-xs font-serif text-[#1E293B] focus:outline-none focus:border-amber-500 shadow-2xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-sans font-bold uppercase tracking-wider text-slate-700 mb-1">
                Dòng tâm sự / Lời chúc tri ân:
              </label>
              <textarea
                required
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Viết nên những ký ức, lòng biết ơn hoặc lời chúc sức khỏe gửi đến Thầy Cô..."
                className="w-full px-3 py-2 border border-amber-200 rounded-lg bg-[#FAF9F5] text-xs font-serif text-[#1E293B] focus:outline-none focus:border-amber-500 leading-relaxed shadow-2xs"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-[#1E293B] hover:bg-amber-600 text-white text-xs font-sans font-bold uppercase tracking-wider rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <Send className="w-3.5 h-3.5 text-amber-300" />
              <span>Gửi Lời Tri Ân Sâu Sắc</span>
            </button>
          </form>
        </div>

        {/* Tributes List */}
        <div className="lg:col-span-7 bg-[#FAF8F5] border border-amber-200/90 p-6 rounded-2xl space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-amber-200 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-700 flex items-center justify-center">
                <MessageSquare className="w-4 h-4" />
              </div>
              <h3 className="font-serif font-bold text-base text-[#1E293B]">
                Sổ Lưu Bút Tri Ân Của Học Trò
              </h3>
            </div>
            <span className="text-[10px] font-sans font-bold text-amber-900 bg-amber-100 px-2.5 py-0.5 border border-amber-300 rounded-full">
              {tributes.length} lời tri ân
            </span>
          </div>

          <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
            {tributes.map((tr) => (
              <div
                key={tr.id}
                className="bg-white border border-amber-200/80 rounded-xl p-3.5 space-y-2 hover:border-amber-400 transition-colors shadow-2xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-serif font-bold text-xs text-[#1E293B]">
                        {tr.studentName}
                      </span>
                      <span className="text-[10px] font-sans font-semibold text-amber-800 bg-amber-100/80 px-1.5 py-0.5 rounded-md">
                        {tr.className}
                      </span>
                      <span className="text-[10px] text-slate-500 font-sans">
                        kính gửi
                      </span>
                      <span className="text-[11px] font-serif font-bold text-amber-900 underline decoration-amber-400">
                        {tr.teacherName}
                      </span>
                    </div>
                    <span className="text-[9px] font-sans text-slate-400 block mt-0.5">
                      {tr.submittedAt}
                    </span>
                  </div>

                  <button
                    onClick={() => handleLike(tr.id)}
                    className={`inline-flex items-center gap-1 text-[10px] font-sans px-2 py-1 rounded-lg border transition-colors cursor-pointer ${
                      likedIds[tr.id]
                        ? 'border-rose-200 bg-rose-50 text-rose-600 font-bold'
                        : 'border-slate-200 bg-white text-slate-500 hover:text-rose-500'
                    }`}
                  >
                    <Heart className={`w-3 h-3 ${likedIds[tr.id] ? 'fill-rose-500 text-rose-500' : ''}`} />
                    <span>{tr.likes || 0}</span>
                  </button>
                </div>

                <p className="text-xs font-serif text-slate-700 leading-relaxed italic bg-[#FAF9F5] p-2.5 rounded-lg border-l-2 border-amber-500">
                  “{tr.message}”
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
