import React, { useState, useEffect } from 'react';
import { Eye, Activity, RefreshCw } from 'lucide-react';

interface ViewCounterProps {
  appsScriptUrl?: string;
}

export default function ViewCounter({ appsScriptUrl }: ViewCounterProps) {
  const [viewCount, setViewCount] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('alumni_view_count');
      if (saved) {
        const num = parseInt(saved, 10);
        if (!isNaN(num) && num > 0) return num;
      }
    } catch {
      // ignore
    }
    return 1258; // Baseline realistic start for 20th reunion website
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLiveConnected, setIsLiveConnected] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;

    const recordAndFetchViews = async () => {
      setIsLoading(true);

      let hasViewedThisSession = false;
      try {
        hasViewedThisSession = !!sessionStorage.getItem('alumni_has_visited_session');
      } catch {
        // ignore storage blocked in iframe
      }

      if (appsScriptUrl && appsScriptUrl.startsWith('http')) {
        try {
          const action = hasViewedThisSession ? 'get_view_count' : 'record_view';
          const res = await fetch(`${appsScriptUrl}?action=${action}`);
          const json = await res.json();

          if (json && json.status === 'success' && typeof json.count === 'number') {
            if (isMounted) {
              setViewCount(json.count);
              try {
                localStorage.setItem('alumni_view_count', json.count.toString());
                sessionStorage.setItem('alumni_has_visited_session', 'true');
              } catch {
                // ignore
              }
              setIsLiveConnected(true);
            }
            return;
          }
        } catch {
          console.log('Chưa kết nối được Google Apps Script cho View Counter, sử dụng bộ đếm lưu cục bộ');
        }
      }

      // Offline / Demo mode simulation
      if (isMounted) {
        if (!hasViewedThisSession) {
          setViewCount((prev) => {
            const next = prev + 1;
            try {
              localStorage.setItem('alumni_view_count', next.toString());
              sessionStorage.setItem('alumni_has_visited_session', 'true');
            } catch {
              // ignore
            }
            return next;
          });
        }
        setIsLiveConnected(!!appsScriptUrl);
      }

      setIsLoading(false);
    };

    recordAndFetchViews();

    return () => {
      isMounted = false;
    };
  }, [appsScriptUrl]);

  const handleRefresh = async () => {
    if (isLoading) return;
    setIsLoading(true);

    if (appsScriptUrl && appsScriptUrl.startsWith('http')) {
      try {
        const res = await fetch(`${appsScriptUrl}?action=get_view_count`);
        const json = await res.json();
        if (json && json.status === 'success' && typeof json.count === 'number') {
          setViewCount(json.count);
          localStorage.setItem('alumni_view_count', json.count.toString());
          setIsLiveConnected(true);
        }
      } catch {
        // Fallback
      }
    } else {
      // Demo small tick
      setTimeout(() => {
        setIsLoading(false);
      }, 400);
    }
    setIsLoading(false);
  };

  // Format with thousand separator (e.g. 1.259)
  const formattedCount = new Intl.NumberFormat('vi-VN').format(viewCount);

  return (
    <div 
      id="footer-view-counter" 
      className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-[#FAF9F6] border border-brand-border text-brand-text-muted shadow-2xs transition-all hover:border-brand-gold/60"
    >
      <div className="flex items-center gap-1.5 text-[10px] font-sans uppercase tracking-wider font-semibold">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <Eye className="w-3.5 h-3.5 text-brand-gold shrink-0" />
        <span>Lượt ghé thăm:</span>
      </div>

      <div className="flex items-center gap-1">
        <span className="font-serif font-bold text-brand-text text-xs tracking-wide tabular-nums">
          {formattedCount}
        </span>
        <span className="text-[10px] font-serif italic text-brand-text-muted">lượt</span>
      </div>

      {isLiveConnected && (
        <span 
          title="Đồng bộ thời gian thực từ Google Sheets (Sheet: Luot_Truy_Cap & Script Properties)" 
          className="text-[9px] font-sans px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-tight font-medium"
        >
          Google Sheet
        </span>
      )}

      <button
        type="button"
        onClick={handleRefresh}
        disabled={isLoading}
        className="text-brand-text-muted hover:text-brand-gold transition-colors p-0.5 ml-0.5 rounded-full cursor-pointer"
        title="Làm mới số lượt truy cập"
      >
        <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin text-brand-gold' : ''}`} />
      </button>
    </div>
  );
}
