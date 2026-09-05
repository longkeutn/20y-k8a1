import React, { useState, useEffect } from 'react';
import { 
  ScrollText, 
  X, 
  ExternalLink, 
  Phone, 
  Heart, 
  Users, 
  Coins, 
  Calendar, 
  ShieldCheck, 
  Sparkles, 
  Check, 
  Copy,
  BookOpen
} from 'lucide-react';

interface ClassCharterModalProps {
  isOpen: boolean;
  onClose: () => void;
  googleDocsUrl?: string;
}

const BLL_MEMBERS = [
  { id: 1, name: "Hứa Thị Vân Anh", phone: "0912018448", location: "Hà Nội" },
  { id: 2, name: "Nguyễn Tuấn Thành", phone: "0968404466", location: "Hà Nội" },
  { id: 3, name: "Hoàng Đức Kiên", phone: "0979830488", location: "Thái Nguyên" },
  { id: 4, name: "Bùi Thành Long", phone: "0936581222", location: "Thái Nguyên" },
  { id: 5, name: "Trần Đức Quyết", phone: "0943060288", location: "Thái Nguyên" },
  { id: 6, name: "Huyền Trang B", phone: "0985887333", location: "Thái Nguyên" },
  { id: 7, name: "Trần Thanh Nhạn", phone: "", location: "Thái Nguyên" },
  { id: 8, name: "Nguyễn Thành Long", phone: "0919337588", location: "Hà Nội" },
];

export default function ClassCharterModal({
  isOpen,
  onClose,
  googleDocsUrl = "https://docs.google.com/document/d/1TCh66RwSevWDaHbbAZPADyJt0lzVO7G2dNI6JPAPMZI/edit?usp=sharing"
}: ClassCharterModalProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'd1' | 'd2' | 'd3' | 'd4' | 'd5'>('all');
  const [copiedPhone, setCopiedPhone] = useState<string | null>(null);

  // Đóng modal bằng phím ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Khóa cuộn trang khi modal đang mở
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopyPhone = (phone: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!phone) return;
    navigator.clipboard.writeText(phone);
    setCopiedPhone(phone);
    setTimeout(() => setCopiedPhone(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      {/* Khung Modal */}
      <div 
        className="relative w-full max-w-4xl max-h-[92vh] bg-[#FAF7F2] rounded-3xl border border-amber-300/80 shadow-2xl flex flex-col overflow-hidden text-slate-700 font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER MODAL */}
        <div className="relative bg-gradient-to-r from-amber-800 via-amber-900 to-[#1E293B] text-white p-4 sm:p-6 pb-5 shadow-sm">
          {/* Họa tiết trang trí */}
          <div className="absolute top-0 right-0 w-64 h-32 bg-amber-500/10 rounded-bl-full pointer-events-none" />
          
          <div className="flex items-start justify-between gap-3 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-amber-500/20 border border-amber-300/40 flex items-center justify-center text-amber-300 shadow-inner shrink-0">
                <ScrollText className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-widest uppercase bg-amber-400/20 text-amber-300 border border-amber-400/30">
                    Văn Bản Chính Thức
                  </span>
                  <span className="text-amber-200/80 text-xs hidden sm:inline">• Niên khóa 2003 — 2006</span>
                </div>
                <h3 className="text-lg sm:text-2xl font-serif font-bold tracking-tight text-white mt-1">
                  Quy Chế Tổ Chức & Hoạt Động
                </h3>
                <p className="text-xs text-amber-100/90 font-serif italic">
                  Tập thể Lớp 12A1 Khóa 8 — Trường THPT Thái Nguyên
                </p>
              </div>
            </div>

            {/* Nút tác vụ nhanh */}
            <div className="flex items-center gap-1.5 shrink-0">
              <a
                href={googleDocsUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="Mở văn bản gốc trên Google Docs"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-medium transition cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Bản gốc Google Docs</span>
              </a>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 sm:p-2 rounded-full text-slate-300 hover:text-white hover:bg-white/15 transition cursor-pointer"
                aria-label="Đóng"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick highlight bar */}
          <div className="mt-4 pt-3 border-t border-amber-500/20 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
            <div className="bg-white/5 rounded-xl p-2 border border-white/10">
              <span className="text-[10px] text-amber-200/80 block uppercase tracking-wider">Tôn chỉ cốt lõi</span>
              <span className="font-serif font-bold text-amber-300">Nghĩa nhân làm gốc</span>
            </div>
            <div className="bg-white/5 rounded-xl p-2 border border-white/10">
              <span className="text-[10px] text-amber-200/80 block uppercase tracking-wider">Quỹ duy trì năm</span>
              <span className="font-serif font-bold text-amber-300">100.000 đ / người</span>
            </div>
            <div className="bg-white/5 rounded-xl p-2 border border-white/10">
              <span className="text-[10px] text-amber-200/80 block uppercase tracking-wider">Thăm viếng tứ thân</span>
              <span className="font-serif font-bold text-amber-300">500.000 đ + hoa</span>
            </div>
            <div className="bg-white/5 rounded-xl p-2 border border-white/10">
              <span className="text-[10px] text-amber-200/80 block uppercase tracking-wider">Gặp mặt định kỳ</span>
              <span className="font-serif font-bold text-amber-300">1 năm & 5 năm</span>
            </div>
          </div>
        </div>

        {/* BỘ LỌC ĐIỀU KHOẢN (TABS) */}
        <div className="flex items-center gap-1.5 px-4 sm:px-6 py-2.5 bg-[#F4EFE6] border-b border-amber-200/80 overflow-x-auto text-xs no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition shrink-0 cursor-pointer ${
              activeTab === 'all'
                ? 'bg-amber-800 text-white shadow-xs'
                : 'bg-white/70 text-slate-700 hover:bg-white border border-amber-200/60'
            }`}
          >
            Toàn bộ văn bản
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('d1')}
            className={`px-3 py-1.5 rounded-lg font-medium transition shrink-0 cursor-pointer ${
              activeTab === 'd1'
                ? 'bg-amber-800 text-white shadow-xs'
                : 'bg-white/70 text-slate-700 hover:bg-white border border-amber-200/60'
            }`}
          >
            Điều 1: Mục đích & Yêu cầu
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('d2')}
            className={`px-3 py-1.5 rounded-lg font-medium transition shrink-0 cursor-pointer ${
              activeTab === 'd2'
                ? 'bg-amber-800 text-white shadow-xs'
                : 'bg-white/70 text-slate-700 hover:bg-white border border-amber-200/60'
            }`}
          >
            Điều 2: Tổ chức & Ban Liên Lạc
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('d3')}
            className={`px-3 py-1.5 rounded-lg font-medium transition shrink-0 cursor-pointer ${
              activeTab === 'd3'
                ? 'bg-amber-800 text-white shadow-xs'
                : 'bg-white/70 text-slate-700 hover:bg-white border border-amber-200/60'
            }`}
          >
            Điều 3: Họp lớp & Thăm hỏi
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('d4')}
            className={`px-3 py-1.5 rounded-lg font-medium transition shrink-0 cursor-pointer ${
              activeTab === 'd4'
                ? 'bg-amber-800 text-white shadow-xs'
                : 'bg-white/70 text-slate-700 hover:bg-white border border-amber-200/60'
            }`}
          >
            Điều 4: Quỹ Lớp
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('d5')}
            className={`px-3 py-1.5 rounded-lg font-medium transition shrink-0 cursor-pointer ${
              activeTab === 'd5'
                ? 'bg-amber-800 text-white shadow-xs'
                : 'bg-white/70 text-slate-700 hover:bg-white border border-amber-200/60'
            }`}
          >
            Điều 5: Thi hành
          </button>
        </div>

        {/* NỘI DUNG VĂN BẢN (CUỘN ĐỘC LẬP) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 text-sm text-slate-700 leading-relaxed">
          
          {/* LỜI MỞ ĐẦU */}
          {(activeTab === 'all' || activeTab === 'd1') && (
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-amber-200/80 shadow-2xs space-y-3">
              <div className="flex items-center gap-2 text-amber-800">
                <BookOpen className="w-4 h-4" />
                <h4 className="font-serif font-bold text-base text-slate-900">
                  Lời Mở Đầu & Căn Cứ Xây Dựng
                </h4>
              </div>
              <p className="font-serif italic text-slate-600 text-xs sm:text-sm bg-amber-50/50 p-3 rounded-xl border-l-3 border-amber-500">
                “Căn cứ tâm tư và nguyện vọng của các thành viên trong lớp nhằm từng bước xây dựng một tập thể lớp K8A1 ngày càng đoàn kết, gắn bó, vững mạnh. Trên tinh thần bình đẳng, tôn trọng, chia sẻ, lấy nghĩa nhân làm gốc, ban liên lạc đã xây dựng bản dự thảo: Quy chế tổ chức và hoạt động của tập thể lớp 12A1 khóa 8 (2003 - 2006) Trường THPT Thái Nguyên.”
              </p>
            </div>
          )}

          {/* ĐIỀU 1 */}
          {(activeTab === 'all' || activeTab === 'd1') && (
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-amber-200/80 shadow-2xs space-y-3.5">
              <div className="flex items-center justify-between border-b border-amber-100 pb-2.5">
                <h4 className="font-serif font-bold text-base text-amber-900 flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-100 text-amber-800 font-sans text-xs font-bold">1</span>
                  Điều 1 : Đối Tượng, Mục Đích, Yêu Cầu
                </h4>
                <span className="text-[11px] font-medium text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/60">
                  Tôn chỉ
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-[#FAF9F6] p-3 rounded-xl border border-amber-200/60 space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 block">1. Đối tượng</span>
                  <p className="text-xs text-slate-700">
                    Tất cả các thành viên lớp 12A1 niên khóa 2003 — 2006 Trường THPT Thái Nguyên.
                  </p>
                </div>

                <div className="bg-[#FAF9F6] p-3 rounded-xl border border-amber-200/60 space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 block">2. Mục đích</span>
                  <p className="text-xs text-slate-700">
                    Tăng cường tình đoàn kết, gắn bó, sẻ chia giữa các thành viên, xây dựng mối quan hệ bền vững và cùng nhau vươn lên trong cuộc sống.
                  </p>
                </div>

                <div className="bg-[#FAF9F6] p-3 rounded-xl border border-amber-200/60 space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 block">3. Yêu cầu</span>
                  <p className="text-xs text-slate-700">
                    Tham gia tự nguyện, có trách nhiệm. Mọi hoạt động dựa trên nguyên tắc dân chủ, bình đẳng, tôn trọng, công khai minh bạch và biểu quyết đa số.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ĐIỀU 2 */}
          {(activeTab === 'all' || activeTab === 'd2') && (
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-amber-200/80 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-amber-100 pb-2.5">
                <h4 className="font-serif font-bold text-base text-amber-900 flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-100 text-amber-800 font-sans text-xs font-bold">2</span>
                  Điều 2 : Xây Dựng Tổ Chức & Ban Liên Lạc
                </h4>
                <span className="text-[11px] font-medium text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/60">
                  Cơ cấu lớp
                </span>
              </div>

              {/* Quyền lợi & Nghĩa vụ thành viên */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div className="bg-emerald-50/40 p-3.5 rounded-xl border border-emerald-200/60 space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wide text-emerald-900 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                    a. Quyền lợi của thành viên
                  </span>
                  <ul className="text-xs text-slate-700 space-y-1.5 list-disc pl-4">
                    <li>Được tham gia bàn bạc, thảo luận các công việc của tập thể.</li>
                    <li>Được hưởng các chế độ, tiêu chuẩn theo quy định của tập thể.</li>
                    <li>Có quyền giám sát, yêu cầu Ban liên lạc báo cáo, giải trình về kết quả hoạt động, tình hình tài chính.</li>
                  </ul>
                </div>

                <div className="bg-blue-50/40 p-3.5 rounded-xl border border-blue-200/60 space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wide text-blue-900 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-blue-700" />
                    b. Nghĩa vụ của thành viên
                  </span>
                  <ul className="text-xs text-slate-700 space-y-1.5 list-disc pl-4">
                    <li>Kịp thời thông báo cho BLL về việc trọng đại (cưới hỏi, làm nhà, ốm đau, hoạn nạn...).</li>
                    <li>Khi được ủy quyền, có trách nhiệm đại diện BLL đến thăm hỏi, chia sẻ với bạn bè.</li>
                    <li>Có trách nhiệm đóng góp xây dựng quỹ phục vụ hoạt động của tập thể.</li>
                  </ul>
                </div>
              </div>

              {/* Nhiệm vụ của Ban Liên Lạc */}
              <div className="bg-[#FAF9F6] p-3.5 rounded-xl border border-amber-200/60 space-y-2 text-xs">
                <span className="font-bold text-slate-900 block uppercase tracking-wide text-[11px] text-amber-900">
                  Nhiệm vụ & Cơ cấu Ban Liên Lạc
                </span>
                <p className="text-slate-600">
                  BLL được bầu dựa trên tinh thần trách nhiệm, tâm huyết và phân bổ theo khu vực sinh sống (Hà Nội, Thái Nguyên). Nhiệm kỳ theo kỳ họp lớp (1 năm quy mô nhỏ — 5 năm quy mô lớn).
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 font-sans">
                  <div className="p-2 bg-white rounded-lg border border-amber-200/60">
                    <strong className="text-amber-900 block text-xs">Trưởng ban liên lạc</strong>
                    <span className="text-[11px] text-slate-600">Phụ trách chung, đối nội đối ngoại, đôn đốc giám sát.</span>
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-amber-200/60">
                    <strong className="text-amber-900 block text-xs">Phó ban liên lạc</strong>
                    <span className="text-[11px] text-slate-600">Phó ban thường trực, giải quyết các công việc thường xuyên.</span>
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-amber-200/60">
                    <strong className="text-amber-900 block text-xs">Thủ quỹ lớp</strong>
                    <span className="text-[11px] text-slate-600">Quản lý thu - chi quỹ lớp, công khai minh bạch qua group lớp.</span>
                  </div>
                </div>
              </div>

              {/* DANH SÁCH BAN LIÊN LẠC LÂM THỜI */}
              <div className="space-y-2.5 pt-1">
                <div className="flex items-center justify-between">
                  <span className="font-serif font-bold text-xs sm:text-sm text-slate-900 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-amber-700" />
                    Danh Sách Ban Liên Lạc Lâm Thời K8A1
                  </span>
                  <span className="text-[11px] text-slate-500 font-sans">
                    Bấm vào SĐT để gọi trực tiếp
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
                  {BLL_MEMBERS.map((m) => (
                    <div 
                      key={m.id} 
                      className="p-2.5 rounded-xl bg-white border border-amber-200/70 hover:border-amber-400 transition-all shadow-2xs space-y-1.5 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800 truncate">{m.name}</span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded font-sans font-medium ${
                          m.location === 'Hà Nội' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {m.location}
                        </span>
                      </div>

                      {m.phone ? (
                        <div className="flex items-center justify-between gap-1 pt-0.5">
                          <a 
                            href={`tel:${m.phone}`} 
                            className="text-amber-900 hover:text-amber-700 font-mono font-bold flex items-center gap-1 text-xs"
                            title="Bấm để gọi"
                          >
                            <Phone className="w-3 h-3 text-emerald-600 shrink-0" />
                            {m.phone}
                          </a>
                          <button
                            type="button"
                            onClick={(e) => handleCopyPhone(m.phone, e)}
                            className="p-1 text-slate-400 hover:text-slate-700 rounded transition cursor-pointer"
                            title="Sao chép số"
                          >
                            {copiedPhone === m.phone ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">Đang cập nhật SĐT</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ĐIỀU 3 */}
          {(activeTab === 'all' || activeTab === 'd3') && (
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-amber-200/80 shadow-2xs space-y-3.5">
              <div className="flex items-center justify-between border-b border-amber-100 pb-2.5">
                <h4 className="font-serif font-bold text-base text-amber-900 flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-100 text-amber-800 font-sans text-xs font-bold">3</span>
                  Điều 3 : Hoạt Động Của Lớp & Chế Độ Thăm Hỏi
                </h4>
                <span className="text-[11px] font-medium text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/60">
                  Hiếu hỉ & Họp mặt
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 bg-[#FAF9F6] rounded-xl border border-amber-200/60 space-y-1">
                  <strong className="text-amber-950 block text-xs flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-amber-700" />
                    1. Tổ chức gặp mặt định kỳ
                  </strong>
                  <p className="text-slate-700">
                    Kỳ họp lớp <strong>1 năm tổ chức 1 lần</strong> (quy mô nhỏ) — <strong>5 năm tổ chức 1 lần</strong> (quy mô lớn). Buổi họp sẽ tổng kết, báo cáo tài chính, sửa đổi quy chế và bầu ban liên lạc nhiệm kỳ mới.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 bg-rose-50/50 rounded-xl border border-rose-200/70 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <strong className="text-rose-950 flex items-center gap-1.5">
                        <Heart className="w-3.5 h-3.5 text-rose-600" />
                        2. Thăm viếng tứ thân phụ mẫu
                      </strong>
                      <span className="font-serif font-bold text-rose-700 text-xs">500.000 đ</span>
                    </div>
                    <p className="text-slate-700">
                      Áp dụng thăm viếng gia đình và tứ thân phụ mẫu của các thành viên. Mức chi là <strong>500.000 đ/người</strong> gồm cả vòng hoa (trích từ Quỹ lớp).
                    </p>
                  </div>

                  <div className="p-3.5 bg-amber-50/50 rounded-xl border border-amber-200/70 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <strong className="text-amber-950 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                        3. Thăm hỏi ốm đau & Đột xuất
                      </strong>
                      <span className="font-serif font-bold text-amber-800 text-xs">300.000 đ</span>
                    </div>
                    <p className="text-slate-700">
                      Áp dụng cho thành viên (hoặc dâu/rể) mắc bệnh hiểm nghèo, tai nạn nguy hiểm hoặc hoàn cảnh đặc biệt khó khăn. Mức kinh phí: <strong>300.000 đ/trường hợp</strong>. BLL thay mặt lớp hoặc ủy quyền bạn ở gần đến thăm hỏi.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ĐIỀU 4 */}
          {(activeTab === 'all' || activeTab === 'd4') && (
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-amber-200/80 shadow-2xs space-y-3.5">
              <div className="flex items-center justify-between border-b border-amber-100 pb-2.5">
                <h4 className="font-serif font-bold text-base text-amber-900 flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-100 text-amber-800 font-sans text-xs font-bold">4</span>
                  Điều 4 : Quỹ Lớp & Quản Lý Tài Chính
                </h4>
                <span className="text-[11px] font-medium text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/60">
                  Tài chính minh bạch
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/80 space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900 block flex items-center gap-1">
                    <Coins className="w-3.5 h-3.5 text-amber-700" />
                    Mức đóng quỹ định kỳ
                  </span>
                  <p className="text-sm font-serif font-bold text-amber-900">
                    100.000 VNĐ / người / năm
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Duy trì quỹ hoạt động thăm hỏi hiếu hỉ thường niên. Nộp chuyển khoản hoặc tiền mặt.
                  </p>
                </div>

                <div className="p-3 bg-[#FAF9F6] rounded-xl border border-amber-200/60 space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-800 block">
                    Nguyên tắc liên hoan
                  </span>
                  <p className="text-xs text-slate-700">
                    Kinh phí tiệc liên hoan trong các buổi gặp mặt định kỳ do các thành viên tham dự đóng góp theo nguyên tắc <strong>chia đều bình quân</strong>.
                  </p>
                </div>

                <div className="p-3 bg-[#FAF9F6] rounded-xl border border-amber-200/60 space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-800 block">
                    Công khai & Minh bạch
                  </span>
                  <p className="text-xs text-slate-700">
                    Thủ quỹ có sổ theo dõi chi tiết. Toàn bộ thu chi được quyết toán và công khai rõ ràng trên group lớp và WebApp.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ĐIỀU 5 */}
          {(activeTab === 'all' || activeTab === 'd5') && (
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-amber-200/80 shadow-2xs space-y-3">
              <div className="flex items-center justify-between border-b border-amber-100 pb-2.5">
                <h4 className="font-serif font-bold text-base text-amber-900 flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-100 text-amber-800 font-sans text-xs font-bold">5</span>
                  Điều 5 : Điều Khoản Thi Hành
                </h4>
                <span className="text-[11px] font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                  Hiệu lực
                </span>
              </div>

              <div className="space-y-2 text-xs text-slate-700 bg-amber-50/30 p-3.5 rounded-xl border border-amber-200/50">
                <p>
                  • Bản quy chế này là nguyên tắc, tiếng nói chung của tập thể và là cơ sở để Ban liên lạc thay mặt tập thể hoạt động.
                </p>
                <p>
                  • Quy chế được bổ sung, hoàn chỉnh định kỳ hàng năm sau khi thống nhất ý kiến đóng góp của các thành viên.
                </p>
                <p className="font-semibold text-slate-900 pt-1">
                  • Tất cả các thành viên Lớp 12A1 Khóa 8 (2003 — 2006) có trách nhiệm thực hiện nghiêm chỉnh các quy định này.
                </p>
              </div>
            </div>
          )}

        </div>

        {/* FOOTER MODAL */}
        <div className="bg-[#F4EFE6] border-t border-amber-200/80 px-4 sm:px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs">
          <span className="text-slate-500 text-[11px] text-center sm:text-left">
            Tập thể K8A1 — THPT Thái Nguyên • Đoàn kết, gắn bó & sẻ chia
          </span>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <a
              href={googleDocsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-amber-300 text-amber-950 hover:bg-amber-50 font-medium text-xs shadow-2xs transition cursor-pointer flex-1 sm:flex-initial"
            >
              <ExternalLink className="w-3.5 h-3.5 text-amber-700" />
              <span>Xem trên Docs</span>
            </a>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-amber-800 hover:bg-amber-900 text-white font-medium text-xs shadow-xs transition cursor-pointer flex-1 sm:flex-initial"
            >
              Đóng lại
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
