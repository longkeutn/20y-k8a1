import React, { useState, useEffect, useRef } from 'react';
import { Music, Volume2, VolumeX } from 'lucide-react';

interface AudioPlayerProps {
  customAudioUrl?: string;
  variant?: 'navbar' | 'floating';
}

export default function AudioPlayer({ customAudioUrl, variant = 'navbar' }: AudioPlayerProps) {
  // Use a nostalgic, beautiful, royalty-free acoustic background music as fallback
  const defaultAudioUrl = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";
  const audioUrl = customAudioUrl || defaultAudioUrl;

  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio(audioUrl);
    audioRef.current.loop = true;
    
    // Cleanup on unmount
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [audioUrl]);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch((err) => {
        console.warn("Audio playback blocked by browser autocomplete/gestures:", err);
      });
    }
  };

  if (variant === 'navbar') {
    return (
      <button
        onClick={togglePlay}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-sans font-medium transition-all duration-300 cursor-pointer ${
          isPlaying 
            ? 'bg-amber-500/20 text-amber-300 border border-amber-400/50 shadow-inner' 
            : 'bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white border border-white/10'
        }`}
        title={isPlaying ? "Tắt nhạc nền hoài niệm" : "Bật giai điệu thanh xuân: Mong Ước Kỷ Niệm Xưa"}
      >
        {isPlaying ? (
          <div className="flex gap-0.5 items-center h-3">
            <span className="w-0.5 h-3 bg-amber-400 block rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
            <span className="w-0.5 h-4 bg-amber-400 block rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
            <span className="w-0.5 h-2 bg-amber-400 block rounded-full animate-bounce" style={{ animationDelay: '0.5s' }} />
          </div>
        ) : (
          <Music className="w-3.5 h-3.5 text-amber-400" />
        )}
        <span className="text-[11px] font-sans font-semibold hidden md:inline">
          {isPlaying ? "Đang phát nhạc" : "Nhạc nền"}
        </span>
      </button>
    );
  }

  // Floating variant
  return (
    <div id="audio-player-container" className="fixed top-3 right-3 z-50 flex items-center">
      <button
        id="btn-toggle-audio"
        onClick={togglePlay}
        className="flex items-center gap-2 border border-slate-700 rounded-full px-3 py-1.5 bg-[#1E293B]/90 shadow-md backdrop-blur-md hover:border-amber-400 transition-all cursor-pointer group active:scale-95 text-xs text-amber-200"
        title={isPlaying ? "Tắt giai điệu hoài niệm" : "Lắng nghe giai điệu tuổi học trò"}
      >
        <Music className="w-3.5 h-3.5 text-amber-400" />
        <span className="text-[10px] uppercase tracking-wider font-sans font-bold">
          {isPlaying ? "Đang phát: Mong Ước Kỷ Niệm Xưa" : "Nhạc nền: Mong Ước Kỷ Niệm Xưa"}
        </span>
      </button>
    </div>
  );
}
