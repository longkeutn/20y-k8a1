import React, { useState } from 'react';
import { Globe, MapPin, Users, Heart, Sparkles, Send, CheckCircle2 } from 'lucide-react';
import { ALUMNI_DISTRIBUTION } from '../data';
import { AlumniRegion } from '../types';

export default function AlumniDistribution() {
  const [regions, setRegions] = useState<AlumniRegion[]>(ALUMNI_DISTRIBUTION);
  const [selectedRegion, setSelectedRegion] = useState<AlumniRegion | null>(regions[0] || null);
  const [myCity, setMyCity] = useState('');
  const [myName, setMyName] = useState('');
  const [markedSuccess, setMarkedSuccess] = useState(false);

  const totalAlumniCount = regions.reduce((sum, r) => sum + r.count, 0) || 1;

  const handleMarkMyCity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!myCity.trim() || !myName.trim()) return;

    // Check if region exists or append to closest
    setRegions((prev) =>
      prev.map((r) => {
        if (r.regionName.toLowerCase().includes(myCity.trim().toLowerCase())) {
          return {
            ...r,
            count: r.count + 1,
            membersHighlight: [myName.trim(), ...r.membersHighlight]
          };
        }
        return r;
      })
    );

    setMarkedSuccess(true);
    setMyCity('');
    setMyName('');
    setTimeout(() => setMarkedSuccess(false), 4000);
  };

  return (
    <section id="alumni-map-section" className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-2 border-b border-brand-border pb-4">
        <span className="text-[11px] font-sans uppercase tracking-[0.25em] text-brand-gold font-bold">
          Dấu Chân Thanh Xuân • Khắp Bốn Phương Trời
        </span>
        <h2 className="text-2xl md:text-3xl font-serif text-brand-text font-bold">
          Bản Đồ Cựu Học Sinh "Phương Trời Bốn Bể"
        </h2>
        <p className="text-xs text-brand-text-muted font-serif italic max-w-xl mx-auto">
          Dù công tác và sinh sống ở bất kỳ đâu trên thế giới, trái tim niên khóa 2003 — 2006 luôn chung một nhịp đập khi nhớ về mái trường xưa.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Regions List & Stats */}
        <div className="lg:col-span-7 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {regions.map((region) => {
              const isSelected = selectedRegion?.id === region.id;
              const percent = Math.round((region.count / totalAlumniCount) * 100);

              return (
                <div
                  key={region.id}
                  onClick={() => setSelectedRegion(region)}
                  className={`bg-white border rounded-sm p-4 cursor-pointer transition-all hover:shadow-xs space-y-2 ${
                    isSelected
                      ? 'border-brand-gold bg-brand-gold/5 shadow-2xs'
                      : 'border-brand-border hover:border-brand-gold/60'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin className={`w-4 h-4 ${isSelected ? 'text-brand-gold' : 'text-brand-text-muted'}`} />
                      <h4 className="font-serif font-bold text-sm text-brand-text">
                        {region.regionName}
                      </h4>
                    </div>
                    <span className="font-sans font-bold text-xs text-brand-gold bg-white px-2 py-0.5 rounded border border-brand-border">
                      {region.count} bạn
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-brand-gold h-full rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-brand-text-muted font-sans">
                      <span>Chiếm {percent}% toàn khóa</span>
                      <span>{region.membersHighlight.length} tiêu biểu</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Detailed Card for Selected Region */}
          {selectedRegion && (
            <div className="bg-[#FAF8F5] border border-brand-border rounded-sm p-6 space-y-3">
              <div className="flex items-center justify-between border-b border-brand-border/80 pb-3">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-brand-gold" />
                  <h4 className="font-serif font-bold text-base text-brand-text">
                    Khu Vực: {selectedRegion.regionName}
                  </h4>
                </div>
                <span className="text-xs font-serif font-bold text-brand-gold">
                  {selectedRegion.count} cựu học sinh
                </span>
              </div>

              {selectedRegion.note && (
                <p className="text-xs font-serif italic text-brand-text-muted leading-relaxed">
                  "{selectedRegion.note}"
                </p>
              )}

              <div className="pt-2">
                <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-brand-text-muted block mb-1.5">
                  Một số bạn bè đang sinh sống tại đây:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedRegion.membersHighlight.map((m, idx) => (
                    <span
                      key={idx}
                      className="text-xs font-serif bg-white text-brand-text px-2.5 py-1 rounded border border-brand-border shadow-2xs"
                    >
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Form: Mark My Current Location */}
        <div className="lg:col-span-5 bg-white border border-brand-border rounded-sm p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-brand-border pb-3">
            <MapPin className="w-4 h-4 text-brand-gold" />
            <h3 className="font-serif font-bold text-base text-brand-text">
              Bạn Đang Ở Đâu? Điểm Danh Nhé!
            </h3>
          </div>

          <p className="text-xs font-serif text-brand-text-muted italic leading-relaxed">
            Dù bạn đang ở Hà Nội, Sài Gòn hay bất kỳ châu lục nào, hãy gửi thông tin để Ban Liên Lạc kết nối các bạn đồng hương cùng khóa nhé!
          </p>

          {markedSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Cảm ơn bạn! Thông tin nơi sinh sống đã được lưu vào bản đồ!</span>
            </div>
          )}

          <form onSubmit={handleMarkMyCity} className="space-y-3">
            <div>
              <label className="block text-[10px] font-sans font-bold uppercase tracking-wider text-brand-text mb-1">
                Họ và Tên của bạn:
              </label>
              <input
                type="text"
                required
                value={myName}
                onChange={(e) => setMyName(e.target.value)}
                placeholder="VD: Trần Hải Yến"
                className="w-full px-3 py-2 border border-brand-border rounded-xs bg-[#FAF9F6] text-xs font-serif text-brand-text focus:outline-none focus:border-brand-gold"
              />
            </div>

            <div>
              <label className="block text-[10px] font-sans font-bold uppercase tracking-wider text-brand-text mb-1">
                Thành phố / Quốc gia hiện tại:
              </label>
              <input
                type="text"
                required
                value={myCity}
                onChange={(e) => setMyCity(e.target.value)}
                placeholder="VD: Hà Nội, TP.HCM, Tokyo, Sydney..."
                className="w-full px-3 py-2 border border-brand-border rounded-xs bg-[#FAF9F6] text-xs font-serif text-brand-text focus:outline-none focus:border-brand-gold"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-brand-text hover:bg-brand-gold text-white text-xs font-sans font-bold uppercase tracking-wider rounded-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <Send className="w-3.5 h-3.5 text-brand-gold" />
              <span>Ghi dấu vị trí của tôi</span>
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
