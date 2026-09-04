import React, { useState, useEffect, useRef } from 'react';
import { Music, Volume2, VolumeX } from 'lucide-react';

interface AudioPlayerProps {
  customAudioUrl?: string;
}

export default function AudioPlayer({ customAudioUrl }: AudioPlayerProps) {
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
        console.error("Audio playback blocked by browser autocomplete/gestures:", err);
      });
    }
  };

  return (
    <div id="audio-player-container" className="fixed top-4 right-4 z-50 flex items-center">
      <button
        id="btn-toggle-audio"
        onClick={togglePlay}
        className="flex items-center gap-3 border border-brand-text/30 rounded-full px-4 py-2 bg-white/80 shadow-xs backdrop-blur-md hover:border-brand-gold transition-all cursor-pointer group active:scale-95"
        title={isPlaying ? "Tắt giai điệu hoài niệm" : "Lắng nghe giai điệu tuổi học trò"}
      >
        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
          isPlaying ? 'bg-brand-gold text-white animate-pulse' : 'bg-brand-text text-brand-bg group-hover:bg-brand-gold'
        }`}>
          {isPlaying ? (
            <div className="flex gap-0.5 items-center justify-center">
              <span className="w-1 h-3 bg-white block rounded-xs animate-bounce" style={{ animationDelay: '0.1s' }}></span>
              <span className="w-1 h-4 bg-white block rounded-xs animate-bounce" style={{ animationDelay: '0.3s' }}></span>
              <span className="w-1 h-2 bg-white block rounded-xs animate-bounce" style={{ animationDelay: '0.5s' }}></span>
            </div>
          ) : (
            <div className="w-0 h-0 border-t-[5px] border-t-transparent border-l-[8px] border-l-white border-b-[5px] border-b-transparent ml-1"></div>
          )}
        </div>
        <span className="text-[10px] uppercase tracking-widest font-sans font-bold text-brand-text">
          {isPlaying ? "Đang phát: Mong Ước Kỷ Niệm Xưa" : "Nhạc nền: Mong Ước Kỷ Niệm Xưa"}
        </span>
      </button>
    </div>
  );
}
