import React, { useState } from 'react';
import { Calendar, Clock, Sparkles, ChevronRight, Image as ImageIcon, Heart } from 'lucide-react';
import { NOSTALGIA_TIMELINE } from '../data';
import { TimelineMilestone } from '../types';

export default function NostalgiaTimeline() {
  const [milestones] = useState<TimelineMilestone[]>(NOSTALGIA_TIMELINE);
  const [activeMilestone, setActiveMilestone] = useState<TimelineMilestone>(milestones[0]);

  return (
    <section id="timeline-section" className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-2 border-b border-brand-border pb-4">
        <span className="text-[11px] font-sans uppercase tracking-[0.25em] text-brand-gold font-bold">
          Hành Trình Hai Thập Kỷ • 2003 — 2026
        </span>
        <h2 className="text-2xl md:text-3xl font-serif text-brand-text font-bold">
          Dòng Thời Gian Kỷ Niệm
        </h2>
        <p className="text-xs text-brand-text-muted font-serif italic max-w-xl mx-auto">
          Từng dấu mốc thời gian đưa chúng ta trở về với những ký ức rực rỡ nhất của tuổi thanh xuân dưới mái trường xưa.
        </p>
      </div>

      {/* Timeline Steps Bar (Mobile Scrollable) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 pt-1 scrollbar-none">
        {milestones.map((m, idx) => {
          const isSelected = activeMilestone.id === m.id;
          return (
            <button
              key={m.id}
              onClick={() => setActiveMilestone(m)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-full border text-xs font-sans font-bold transition-all shrink-0 cursor-pointer ${
                isSelected
                  ? 'bg-brand-text text-white border-brand-text shadow-xs scale-102'
                  : 'bg-white text-brand-text-muted border-brand-border hover:border-brand-gold hover:text-brand-text'
              }`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                isSelected ? 'bg-brand-gold text-white' : 'bg-brand-border/40 text-brand-text'
              }`}>
                {idx + 1}
              </span>
              <span>{m.period}</span>
            </button>
          );
        })}
      </div>

      {/* Featured Milestone Card */}
      <div className="bg-white border border-brand-border rounded-sm p-6 md:p-8 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Milestone Image */}
          <div className="md:col-span-5 relative group overflow-hidden rounded-xs border border-brand-border">
            <img
              src={activeMilestone.imageUrl}
              alt={activeMilestone.title}
              referrerPolicy="no-referrer"
              className="w-full h-64 md:h-72 object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-xs text-white text-[10px] font-sans font-bold uppercase tracking-wider px-2.5 py-1 rounded-xs border border-white/20 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-brand-gold" />
              <span>{activeMilestone.period}</span>
            </div>
            <div className="absolute bottom-3 right-3 bg-brand-gold text-white text-[9px] font-sans font-bold uppercase tracking-widest px-2 py-0.5 rounded-xs">
              {activeMilestone.tag}
            </div>
          </div>

          {/* Milestone Details */}
          <div className="md:col-span-7 space-y-4">
            <div className="space-y-1">
              <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-brand-gold">
                Cột mốc {activeMilestone.year}
              </span>
              <h3 className="text-xl md:text-2xl font-serif font-bold text-brand-text leading-snug">
                {activeMilestone.title}
              </h3>
            </div>

            <p className="text-sm font-serif text-brand-text-muted leading-relaxed italic bg-[#FAF8F5] p-4 rounded-xs border-l-2 border-brand-gold">
              "{activeMilestone.description}"
            </p>

            <div className="flex items-center gap-3 pt-2 text-xs font-sans text-brand-text-muted">
              <div className="flex items-center gap-1 text-brand-gold">
                <Sparkles className="w-3.5 h-3.5" />
                <span className="font-bold">Ký ức bất tận</span>
              </div>
              <span>•</span>
              <span>Khóa 2003 — 2006</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of All Milestones for fast scanning */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {milestones.map((m) => (
          <div
            key={m.id}
            onClick={() => setActiveMilestone(m)}
            className={`bg-white border rounded-sm p-4 space-y-2 cursor-pointer transition-all hover:shadow-xs ${
              activeMilestone.id === m.id
                ? 'border-brand-gold bg-brand-gold/5 shadow-2xs'
                : 'border-brand-border hover:border-brand-gold/60'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-brand-gold">
                {m.period}
              </span>
              <span className="text-[9px] font-sans bg-[#FAF8F5] text-brand-text-muted px-1.5 py-0.5 rounded-xs border border-brand-border/60">
                {m.tag}
              </span>
            </div>
            <h4 className="font-serif font-bold text-sm text-brand-text line-clamp-1">
              {m.title}
            </h4>
            <p className="text-xs font-serif text-brand-text-muted line-clamp-2 italic">
              {m.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
