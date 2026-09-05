import React from 'react';
import { motion } from 'motion/react';
import { MapPin, Compass, Navigation } from 'lucide-react';

interface Props {
  className?: string;
}

export default function AlumniConvergenceMap({ className = '' }: Props) {
  return (
    <section id="tu-hoi" className={`space-y-4 scroll-mt-20 ${className}`}>
      {/* Container Thẻ Tụ Hội K8A1 */}
      <div className="bg-gradient-to-br from-[#1E293B] via-[#0F172A] to-[#1E293B] text-white rounded-xl p-5 sm:p-6 shadow-xl border border-amber-500/30 relative overflow-hidden">
        
        {/* Glow Effects */}
        <div className="absolute top-0 right-1/4 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-48 h-48 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header Thẻ */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-700/80 pb-3 mb-4 gap-2">
          <div className="flex items-center space-x-2">
            <span className="text-amber-400 text-lg">🗺️</span>
            <div>
              <h3 className="font-serif text-base sm:text-lg font-bold text-amber-200">
                Bản Đồ Tụ Hội K8A1
              </h3>
              <p className="text-[11px] text-slate-300 font-serif italic">
                “Dù ở bất cứ phương trời nào, mọi ngả đường đều dẫn về Thái Nguyên”
              </p>
            </div>
          </div>
          <div className="inline-flex items-center space-x-1.5 text-xs text-amber-300 bg-slate-800/90 px-3 py-1 rounded-full border border-amber-500/20 font-sans self-start sm:self-auto">
            <Compass className="w-3.5 h-3.5 text-amber-400 animate-spin-slow" />
            <span>Tọa độ hẹn: TP. Thái Nguyên</span>
          </div>
        </div>

        {/* Nội dung 2 cột: Vector Bản đồ & Các Trạm */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6 items-center">
          
          {/* Cột 1: Vector Đồ họa Đường bay & Xe Hội tụ (5 cột) */}
          <div className="md:col-span-6 relative flex items-center justify-center bg-slate-950/70 rounded-xl p-3 border border-slate-800 h-44 shadow-inner">
            <svg viewBox="0 0 220 125" className="w-full h-full select-none">
              <defs>
                <linearGradient id="glowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#e11d48" stopOpacity="0.8" />
                </linearGradient>
              </defs>

              {/* Các đường bay nét đứt cong hội tụ về Thái Nguyên (130, 32) */}
              <path 
                d="M 35,105 Q 80,75 130,32" 
                fill="none" 
                stroke="url(#glowGrad)" 
                strokeWidth="1.5" 
                strokeDasharray="4 2" 
                className="opacity-80"
              />
              <path 
                d="M 70,112 Q 105,80 130,32" 
                fill="none" 
                stroke="#f59e0b" 
                strokeWidth="1.5" 
                strokeDasharray="4 2" 
                className="opacity-75"
              />
              <path 
                d="M 185,78 Q 160,55 130,32" 
                fill="none" 
                stroke="#f59e0b" 
                strokeWidth="1.5" 
                strokeDasharray="4 2" 
                className="opacity-75"
              />
              
              {/* Điểm xuất phát: TP.HCM / Miền Nam */}
              <circle cx="35" cy="105" r="3" fill="#94a3b8" />
              <text x="14" y="118" fill="#cbd5e1" fontSize="7.5" fontFamily="sans-serif">TP.HCM</text>
              
              {/* Điểm xuất phát: Đà Nẵng / Miền Trung */}
              <circle cx="70" cy="112" r="3" fill="#94a3b8" />
              <text x="60" y="122" fill="#cbd5e1" fontSize="7.5" fontFamily="sans-serif">Đà Nẵng</text>

              {/* Điểm xuất phát: Hà Nội */}
              <circle cx="185" cy="78" r="3" fill="#94a3b8" />
              <text x="175" y="90" fill="#cbd5e1" fontSize="7.5" fontFamily="sans-serif">Hà Nội</text>

              {/* Tọa độ ĐÍCH: Thái Nguyên */}
              <circle cx="130" cy="32" r="10" fill="#e11d48" className="animate-ping opacity-50" />
              <circle cx="130" cy="32" r="5" fill="#fbbf24" />
              <circle cx="130" cy="32" r="2.5" fill="#ffffff" />
              <text x="88" y="20" fill="#fef08a" fontSize="9" fontWeight="bold" fontFamily="serif">
                ★ THÁI NGUYÊN
              </text>
            </svg>
          </div>

          {/* Cột 2: Các Trạm Tụ Hội (6 cột) */}
          <div className="md:col-span-6 grid grid-cols-2 gap-2.5 text-xs">
            <div className="bg-slate-800/90 p-3 rounded-lg border border-slate-700 hover:border-amber-500/50 transition">
              <div className="text-amber-300 font-bold flex items-center space-x-1">
                <span>🏡</span> <span>Thái Nguyên</span>
              </div>
              <div className="text-slate-100 font-semibold mt-0.5 text-xs">~25 thành viên</div>
              <div className="text-[10px] text-emerald-400 mt-0.5 flex items-center gap-1 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
                Sẵn sàng đón bạn
              </div>
            </div>

            <div className="bg-slate-800/90 p-3 rounded-lg border border-slate-700 hover:border-amber-500/50 transition">
              <div className="text-amber-300 font-bold flex items-center space-x-1">
                <span>🚗</span> <span>Hà Nội</span>
              </div>
              <div className="text-slate-100 font-semibold mt-0.5 text-xs">~12 thành viên</div>
              <div className="text-[10px] text-sky-400 mt-0.5 flex items-center gap-1 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400 inline-block" />
                Đoàn xe 80km
              </div>
            </div>

            <div className="bg-slate-800/90 p-3 rounded-lg border border-slate-700 hover:border-amber-500/50 transition">
              <div className="text-amber-300 font-bold flex items-center space-x-1">
                <span>✈️</span> <span>Miền Nam / Xa</span>
              </div>
              <div className="text-slate-100 font-semibold mt-0.5 text-xs">~4 thành viên</div>
              <div className="text-[10px] text-amber-300 mt-0.5 flex items-center gap-1 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-300 inline-block" />
                Đặt vé bay ra
              </div>
            </div>

            <div className="bg-slate-800/90 p-3 rounded-lg border border-slate-700 hover:border-amber-500/50 transition">
              <div className="text-amber-300 font-bold flex items-center space-x-1">
                <span>🌏</span> <span>Phương xa</span>
              </div>
              <div className="text-slate-100 font-semibold mt-0.5 text-xs">~2 thành viên</div>
              <div className="text-[10px] text-purple-300 mt-0.5 flex items-center gap-1 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-300 inline-block" />
                Hướng về K8A1
              </div>
            </div>
          </div>
          
        </div>

        {/* Slogan dưới chân */}
        <p className="text-center text-[11px] text-slate-400 font-serif italic mt-3 pt-2.5 border-t border-slate-800/80">
          “20 năm bôn ba khắp muôn phương, ngày hẹn đã đến — cùng quay về điểm xuất phát!”
        </p>
      </div>
    </section>
  );
}
