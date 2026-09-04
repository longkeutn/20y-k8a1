import React, { useState } from 'react';
import { ShieldCheck, Heart, Award, CreditCard, Sparkles, TrendingUp, PieChart, CheckCircle2 } from 'lucide-react';
import { SPONSORS_LIST } from '../data';
import { SponsorItem, ReunionConfig } from '../types';

interface SponsorAndFinanceProps {
  config?: ReunionConfig;
  totalAttendeesCount?: number;
}

export default function SponsorAndFinance({ config, totalAttendeesCount = 45 }: SponsorAndFinanceProps) {
  const [sponsors] = useState<SponsorItem[]>(SPONSORS_LIST);
  const totalSponsorAmount = sponsors.reduce((sum, s) => sum + s.amount, 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  return (
    <section id="finance-section" className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2 border-b border-brand-border pb-4">
        <span className="text-[11px] font-sans uppercase tracking-[0.25em] text-brand-gold font-bold">
          Đoàn Kết • Tự Nguyện • Minh Bạch
        </span>
        <h2 className="text-2xl md:text-3xl font-serif text-brand-text font-bold">
          Tri Ân Đóng Góp & Quỹ Lớp K8A1
        </h2>
        <p className="text-xs text-brand-text-muted font-serif italic max-w-xl mx-auto">
          Trân trọng cảm ơn tình cảm và sự đóng góp của các bạn thành viên Lớp K8A1 cho ngày hội ngộ 20 năm trọn vẹn.
        </p>
      </div>

      {/* Sponsors Thank You Wall */}
      <div className="bg-white border border-brand-border rounded-sm p-5 md:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-brand-border pb-3">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-brand-gold" />
            <h3 className="font-serif font-bold text-base text-brand-text">
              Danh Sách Tri Ân Bạn Bè & Các Tập Thể Tổ K8A1 Tài Trợ
            </h3>
          </div>
          <span className="text-[10px] font-sans font-bold text-brand-gold uppercase tracking-wider">
            {sponsors.length} đóng góp
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {sponsors.map((sp) => (
            <div
              key={sp.id}
              className="bg-[#FAF8F5] border border-brand-border/80 rounded-xs p-3.5 space-y-1 hover:border-brand-gold/60 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-serif font-bold text-sm text-brand-text">
                    {sp.name}
                  </h4>
                  {sp.className && (
                    <span className="text-[10px] font-sans font-bold text-brand-gold bg-brand-gold/10 px-1.5 py-0.5 rounded-xs">
                      {sp.className}
                    </span>
                  )}
                </div>
                <span className="font-serif font-bold text-xs text-emerald-700">
                  +{formatCurrency(sp.amount)}
                </span>
              </div>

              {sp.note && (
                <p className="text-xs font-serif italic text-brand-text-muted leading-relaxed">
                  "{sp.note}"
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
