import React, { useState } from 'react';
import { LayoutGrid, Users, Sparkles, MapPin, Camera, Utensils, Music, Info } from 'lucide-react';

interface VenueZone {
  id: string;
  name: string;
  type: 'stage' | 'vip' | 'class' | 'buffet' | 'reception' | 'photobooth';
  capacity: string;
  desc: string;
  tags?: string[];
}

const ZONES: VenueZone[] = [
  {
    id: 'z-stage',
    name: 'Sân Khấu Kỷ Niệm K8A1 & Màn Hình LED Lớn',
    type: 'stage',
    capacity: 'Khu vực biểu diễn & phát biểu',
    desc: 'Nơi diễn ra Lễ khai mạc hội ngộ 20 năm, trình chiếu video phóng sự ảnh thanh xuân Lớp K8A1 và gameshow kỷ niệm.',
    tags: ['Âm thanh ánh sáng', 'Màn LED', 'Acoustic K8A1']
  },
  {
    id: 'z-bcs',
    name: 'Bàn Ban Liên Lạc & Khách Mời Thân Hữu (Bàn 1 & 2)',
    type: 'vip',
    capacity: '16 - 20 ghế ngồi',
    desc: 'Vị trí trung tâm sảnh tiệc dành cho Ban cán sự lớp, đội ngũ kết nối và các bạn thân hữu K8A1.',
    tags: ['Ban liên lạc K8A1', 'Điều phối chương trình']
  },
  {
    id: 'z-to1',
    name: 'Bàn Tiệc Chi Hội Tổ 1 - Lớp K8A1 (Bàn 3 & 4)',
    type: 'class',
    capacity: '16 - 20 ghế ngồi',
    desc: 'Khu vực tập trung của các thành viên Tổ 1 Lớp K8A1 niên khóa 2003 - 2006.',
    tags: ['Tổ 1 - K8A1', 'Menu Crown Palace']
  },
  {
    id: 'z-to2',
    name: 'Bàn Tiệc Chi Hội Tổ 2 - Lớp K8A1 (Bàn 5 & 6)',
    type: 'class',
    capacity: '16 - 20 ghế ngồi',
    desc: 'Khu vực tập trung của các thành viên Tổ 2 Lớp K8A1 niên khóa 2003 - 2006.',
    tags: ['Tổ 2 - K8A1', 'Menu Crown Palace']
  },
  {
    id: 'z-to3',
    name: 'Bàn Tiệc Chi Hội Tổ 3 - Lớp K8A1 (Bàn 7 & 8)',
    type: 'class',
    capacity: '16 - 20 ghế ngồi',
    desc: 'Khu vực tập trung của các thành viên Tổ 3 Lớp K8A1 niên khóa 2003 - 2006.',
    tags: ['Tổ 3 - K8A1', 'Menu Crown Palace']
  },
  {
    id: 'z-to4',
    name: 'Bàn Tiệc Chi Hội Tổ 4 - Lớp K8A1 (Bàn 9 & 10)',
    type: 'class',
    capacity: '16 - 20 ghế ngồi',
    desc: 'Khu vực tập trung của các thành viên Tổ 4 Lớp K8A1 niên khóa 2003 - 2006.',
    tags: ['Tổ 4 - K8A1', 'Menu Crown Palace']
  },
  {
    id: 'z-buffet',
    name: 'Quầy Ẩm Thực Tiệc Mừng & Teabreak Crown Palace',
    type: 'buffet',
    capacity: 'Phục vụ xuyên suốt chương trình',
    desc: 'Thực đơn tiệc cao cấp tại Crown Palace Thái Nguyên, kèm quầy cafe, trà và bánh ngọt teabreak giao lưu buổi sáng.',
    tags: ['Ẩm thực Crown Palace', 'Teabreak', 'Tiệc mừng 20 năm']
  },
  {
    id: 'z-photobooth',
    name: 'Photobooth "20 Năm Ngày Trở Về" & Bảng Lưu Bút K8A1',
    type: 'photobooth',
    capacity: 'Khu vực check-in & chụp ảnh',
    desc: 'Backdrop hoành tráng mang tên Lớp K8A1 (Khóa 8) THPT Thái Nguyên, nơi các bạn chụp ảnh kỷ niệm và ký tên lưu bút.',
    tags: ['Check-in K8A1', 'Áo đồng phục', 'Lưu bút 20 năm']
  },
  {
    id: 'z-reception',
    name: 'Bàn Đón Tiếp & Điểm Danh Nhận Áo K8A1 (Cửa Sảnh)',
    type: 'reception',
    capacity: 'Bàn Lễ tân đón bạn bè',
    desc: 'Nơi phát Thẻ học sinh kỷ niệm K8A1, trao áo đồng phục theo size và đón chào bạn bè về dự.',
    tags: ['Đón tiếp', 'Nhận áo K8A1', 'Thẻ học sinh']
  }
];

export default function VenueLayout() {
  const [selectedZone, setSelectedZone] = useState<VenueZone>(ZONES[0]);

  return (
    <section id="venue-layout-section" className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-2 border-b border-brand-border pb-4">
        <span className="text-[11px] font-sans uppercase tracking-[0.25em] text-brand-gold font-bold">
          Không Gian Sảnh Tiệc • Crown Palace Thái Nguyên
        </span>
        <h2 className="text-2xl md:text-3xl font-serif text-brand-text font-bold">
          Sơ Đồ Bàn Tiệc & Khu Vực Hội Ngộ Lớp K8A1
        </h2>
        <p className="text-xs text-brand-text-muted font-serif italic max-w-xl mx-auto">
          Bấm vào từng khu vực trên sơ đồ để xem vị trí bàn tiệc của từng tổ và các không gian đón tiếp tại Crown Palace.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Visual Map Layout */}
        <div className="lg:col-span-8 bg-white border border-brand-border rounded-sm p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between text-xs text-brand-text-muted pb-2 border-b border-brand-border">
            <span className="font-sans font-bold uppercase tracking-wider text-[10px] text-brand-gold">
              Mặt Bằng Sảnh Hội Ngộ K8A1 - Crown Palace
            </span>
            <span className="font-serif italic text-[11px]">
              * Bấm vào từng khối để xem chi tiết
            </span>
          </div>

          {/* Schematic Diagram */}
          <div className="space-y-3 bg-[#FAF8F5] p-5 rounded border border-brand-border">
            {/* Stage */}
            <button
              onClick={() => setSelectedZone(ZONES[0])}
              className={`w-full py-4 px-3 rounded text-center transition-all border cursor-pointer ${
                selectedZone.id === 'z-stage'
                  ? 'bg-brand-text text-white border-brand-text shadow-sm'
                  : 'bg-white text-brand-text border-brand-gold/60 hover:bg-brand-gold/10'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Music className="w-4 h-4 text-brand-gold" />
                <span className="font-serif font-bold text-sm tracking-wide uppercase">
                  SÂN KHẤU KỶ NIỆM K8A1 & MÀN HÌNH LED
                </span>
              </div>
              <p className="text-[10px] font-sans text-brand-gold mt-0.5 uppercase tracking-wider">
                Chiếu phóng sự ảnh 20 năm & Minigame bạn bè
              </p>
            </button>

            {/* VIP Class Committee */}
            <button
              onClick={() => setSelectedZone(ZONES[1])}
              className={`w-full py-2.5 px-3 rounded text-center transition-all border cursor-pointer ${
                selectedZone.id === 'z-bcs'
                  ? 'bg-amber-100 border-brand-gold text-brand-text font-bold shadow-xs'
                  : 'bg-white text-brand-text border-amber-200 hover:bg-amber-50'
              }`}
            >
              <span className="font-serif font-bold text-xs text-brand-gold uppercase tracking-wider block">
                ⭐ BÀN BAN LIÊN LẠC & KHÁCH MỜI THÂN HỮU (BÀN 1 & 2) ⭐
              </span>
            </button>

            {/* Class Teams Grid (2x2) */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                onClick={() => setSelectedZone(ZONES[2])}
                className={`py-3 px-2 rounded border text-center transition-all cursor-pointer ${
                  selectedZone.id === 'z-to1'
                    ? 'bg-brand-text text-white border-brand-text shadow-xs'
                    : 'bg-white text-brand-text border-brand-border hover:border-brand-gold'
                }`}
              >
                <span className="font-serif font-bold text-xs block">Bàn 3 & 4</span>
                <span className="text-[10px] font-sans text-brand-gold font-bold uppercase">Tổ 1 — K8A1</span>
              </button>

              <button
                onClick={() => setSelectedZone(ZONES[3])}
                className={`py-3 px-2 rounded border text-center transition-all cursor-pointer ${
                  selectedZone.id === 'z-to2'
                    ? 'bg-brand-text text-white border-brand-text shadow-xs'
                    : 'bg-white text-brand-text border-brand-border hover:border-brand-gold'
                }`}
              >
                <span className="font-serif font-bold text-xs block">Bàn 5 & 6</span>
                <span className="text-[10px] font-sans text-brand-gold font-bold uppercase">Tổ 2 — K8A1</span>
              </button>

              <button
                onClick={() => setSelectedZone(ZONES[4])}
                className={`py-3 px-2 rounded border text-center transition-all cursor-pointer ${
                  selectedZone.id === 'z-to3'
                    ? 'bg-brand-text text-white border-brand-text shadow-xs'
                    : 'bg-white text-brand-text border-brand-border hover:border-brand-gold'
                }`}
              >
                <span className="font-serif font-bold text-xs block">Bàn 7 & 8</span>
                <span className="text-[10px] font-sans text-brand-gold font-bold uppercase">Tổ 3 — K8A1</span>
              </button>

              <button
                onClick={() => setSelectedZone(ZONES[5])}
                className={`py-3 px-2 rounded border text-center transition-all cursor-pointer ${
                  selectedZone.id === 'z-to4'
                    ? 'bg-brand-text text-white border-brand-text shadow-xs'
                    : 'bg-white text-brand-text border-brand-border hover:border-brand-gold'
                }`}
              >
                <span className="font-serif font-bold text-xs block">Bàn 9 & 10</span>
                <span className="text-[10px] font-sans text-brand-gold font-bold uppercase">Tổ 4 — K8A1</span>
              </button>
            </div>

            {/* Buffet Area Bar */}
            <button
              onClick={() => setSelectedZone(ZONES[6])}
              className={`w-full py-2 px-3 rounded text-center transition-all border cursor-pointer ${
                selectedZone.id === 'z-buffet'
                  ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                  : 'bg-emerald-50 text-emerald-900 border-emerald-200 hover:bg-emerald-100'
              }`}
            >
              <div className="flex items-center justify-center gap-1.5 text-xs font-serif font-bold">
                <Utensils className="w-3.5 h-3.5" />
                <span>QUẦY TIỆC MỪNG & TEABREAK CROWN PALACE</span>
              </div>
            </button>

            {/* Reception & Photobooth Footer */}
            <div className="grid grid-cols-2 gap-3 pt-1 border-t border-brand-border/60">
              <button
                onClick={() => setSelectedZone(ZONES[7])}
                className={`py-2 px-2 rounded border text-center transition-all cursor-pointer ${
                  selectedZone.id === 'z-photobooth'
                    ? 'bg-brand-text text-white border-brand-text shadow-xs'
                    : 'bg-white text-brand-text border-brand-border hover:border-brand-gold'
                }`}
              >
                <div className="flex items-center justify-center gap-1 text-[11px] font-serif font-bold">
                  <Camera className="w-3 h-3 text-brand-gold" />
                  <span>Photobooth K8A1</span>
                </div>
              </button>

              <button
                onClick={() => setSelectedZone(ZONES[8])}
                className={`py-2 px-2 rounded border text-center transition-all cursor-pointer ${
                  selectedZone.id === 'z-reception'
                    ? 'bg-brand-text text-white border-brand-text shadow-xs'
                    : 'bg-white text-brand-text border-brand-border hover:border-brand-gold'
                }`}
              >
                <div className="flex items-center justify-center gap-1 text-[11px] font-serif font-bold">
                  <Users className="w-3 h-3 text-brand-gold" />
                  <span>Bàn Lễ Tân Nhận Áo</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Zone Details Panel */}
        <div className="lg:col-span-4 bg-[#FAF8F5] border border-brand-border rounded-sm p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-brand-border pb-3">
            <Info className="w-4 h-4 text-brand-gold" />
            <h3 className="font-serif font-bold text-base text-brand-text">
              Thông Tin Khu Vực
            </h3>
          </div>

          <div className="space-y-3">
            <div>
              <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-brand-gold block">
                Khu vực đang chọn
              </span>
              <h4 className="font-serif font-bold text-lg text-brand-text leading-snug mt-0.5">
                {selectedZone.name}
              </h4>
            </div>

            <div className="p-3 bg-white rounded border border-brand-border/80 text-xs font-serif text-brand-text-muted leading-relaxed italic">
              "{selectedZone.desc}"
            </div>

            <div className="pt-2 border-t border-brand-border/60 space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-sans text-[10px] font-bold uppercase text-brand-text-muted">Sức chứa / Quy mô:</span>
                <span className="font-serif font-bold text-brand-text">{selectedZone.capacity}</span>
              </div>
            </div>

            {selectedZone.tags && (
              <div className="pt-2 flex flex-wrap gap-1.5">
                {selectedZone.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="text-[9px] font-sans font-bold uppercase bg-white text-brand-gold border border-brand-gold/30 px-2 py-0.5 rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
