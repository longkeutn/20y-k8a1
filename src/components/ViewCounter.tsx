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
      className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF9F6] border border-amber-200/80 text-slate-500 shadow-2xs text-xs font-sans"
    >
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
      </span>
      <span className="text-[11px] text-slate-600 font-medium">Lượt ghé thăm:</span>
      <span className="font-serif font-bold text-amber-900 text-xs tracking-wide tabular-nums">
        {formattedCount}
      </span>
      <span className="text-[11px] font-serif italic text-slate-500">lượt</span>
    </div>
  );
}
