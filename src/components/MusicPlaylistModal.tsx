import React, { useState } from 'react';
import { 
  X, Play, Pause, SkipForward, SkipBack, Shuffle, Repeat, 
  Volume2, VolumeX, Plus, Trash2, ExternalLink, Music, Disc, Sparkles,
  Search, Check
} from 'lucide-react';
import { MusicTrack } from '../types';

interface MusicPlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  playlist: MusicTrack[];
  currentTrackIndex: number;
  isPlaying: boolean;
  isShuffled: boolean;
  repeatMode: 'all' | 'one' | 'off';
  volume: number;
  onSelectTrack: (index: number) => void;
  onTogglePlay: () => void;
  onNextTrack: () => void;
  onPrevTrack: () => void;
  onToggleShuffle: () => void;
  onToggleRepeat: () => void;
  onVolumeChange: (vol: number) => void;
  onAddTrack?: (track: MusicTrack) => void;
  onRemoveTrack?: (trackId: string) => void;
  isAdmin?: boolean;
}

export default function MusicPlaylistModal({
  isOpen,
  onClose,
  playlist,
  currentTrackIndex,
  isPlaying,
  isShuffled,
  repeatMode,
  volume,
  onSelectTrack,
  onTogglePlay,
  onNextTrack,
  onPrevTrack,
  onToggleShuffle,
  onToggleRepeat,
  onVolumeChange,
  onAddTrack,
  onRemoveTrack,
  isAdmin = false
}: MusicPlaylistModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newArtist, setNewArtist] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [addError, setAddError] = useState('');

  if (!isOpen) return null;

  const currentTrack = playlist[currentTrackIndex] || playlist[0];

  const filteredPlaylist = playlist.filter(track => {
    const q = searchTerm.toLowerCase().trim();
    if (!q) return true;
    return (
      track.title.toLowerCase().includes(q) ||
      (track.artist && track.artist.toLowerCase().includes(q))
    );
  });

  const handleAddNewTrack = (e: React.FormEvent) => {
    e.preventDefault();
    setAddError('');

    const cleanUrl = newUrl.trim();
    const cleanTitle = newTitle.trim();
    if (!cleanUrl) {
      setAddError('Vui lòng nhập đường link bài hát (YouTube hoặc Google Drive / MP3)!');
      return;
    }
    if (!cleanTitle) {
      setAddError('Vui lòng nhập tên bài hát!');
      return;
    }

    let sourceType: 'youtube' | 'drive' | 'direct' = 'youtube';
    if (cleanUrl.includes('drive.google.com')) {
      sourceType = 'drive';
    } else if (cleanUrl.endsWith('.mp3') || cleanUrl.endsWith('.m4a') || cleanUrl.endsWith('.wav')) {
      sourceType = 'direct';
    }

    const newTrack: MusicTrack = {
      id: 'track_' + Date.now(),
      title: cleanTitle,
      artist: newArtist.trim() || 'K8A1 Tuyển Chọn',
      sourceType,
      url: cleanUrl,
      duration: 'Tuyển chọn',
      isCustom: true
    };

    if (onAddTrack) {
      onAddTrack(newTrack);
    }

    // Reset form
    setNewTitle('');
    setNewArtist('');
    setNewUrl('');
    setShowAddForm(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 md:p-6 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div 
        className="relative w-full max-w-2xl bg-gradient-to-b from-[#131b2e] via-[#0b1120] to-[#070b14] border border-amber-500/30 rounded-2xl shadow-2xl shadow-amber-950/40 flex flex-col max-h-[92vh] overflow-hidden text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-slate-950 shadow-md">
              <Music className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-amber-200 uppercase tracking-wide">
                  Playlist Nhạc Nền Sự Kiện K8A1
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  {playlist.length} ca khúc
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Giai điệu thanh xuân thời áo trắng hội ngộ 20 năm
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-all cursor-pointer"
            title="Đóng bảng điều khiển nhạc"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Playing Banner (Hero Mini Player) */}
        {currentTrack && (
          <div className="p-4 md:p-5 bg-gradient-to-r from-amber-950/30 via-slate-900/60 to-amber-950/20 border-b border-slate-800/80 flex flex-col md:flex-row items-center gap-4">
            {/* Spinning Disc / Cover */}
            <div className="relative flex-shrink-0">
              <div className={`w-16 h-16 md:w-20 md:h-20 rounded-full border-2 border-amber-400/40 bg-slate-950 flex items-center justify-center shadow-lg relative overflow-hidden ${isPlaying ? 'animate-[spin_6s_linear_infinite]' : ''}`}>
                <Disc className="w-10 h-10 text-amber-400/80" />
                <div className="absolute w-4 h-4 rounded-full bg-amber-400/90 border border-slate-900" />
              </div>
              {isPlaying && (
                <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center text-slate-950 text-[10px] shadow-sm animate-pulse">
                  <Sparkles className="w-3 h-3" />
                </div>
              )}
            </div>

            {/* Track Info */}
            <div className="flex-1 min-w-0 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {isPlaying ? "Đang phát" : "Tạm dừng"}
                </span>
                <span className="text-[10px] text-slate-400 uppercase font-mono">
                  {currentTrack.sourceType === 'youtube' ? 'YouTube' : currentTrack.sourceType === 'drive' ? 'Google Drive' : 'MP3 Trực tiếp'}
                </span>
              </div>
              <h4 className="text-base md:text-lg font-bold text-amber-100 truncate">
                {currentTrack.title}
              </h4>
              <p className="text-xs text-slate-400 truncate">
                {currentTrack.artist || 'K8A1 Tuyển Chọn'}
              </p>
            </div>

            {/* Main Controls Deck */}
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-2 md:gap-3">
                {/* Shuffle Button */}
                <button
                  onClick={onToggleShuffle}
                  className={`p-2 rounded-full transition-all cursor-pointer ${
                    isShuffled 
                      ? 'text-amber-400 bg-amber-500/20 border border-amber-500/40' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                  title={isShuffled ? "Tắt phát ngẫu nhiên" : "Bật phát ngẫu nhiên"}
                >
                  <Shuffle className="w-4 h-4" />
                </button>

                {/* Prev Track */}
                <button
                  onClick={onPrevTrack}
                  className="p-2 rounded-full text-slate-300 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
                  title="Bài trước"
                >
                  <SkipBack className="w-5 h-5" />
                </button>

                {/* Play / Pause Toggle */}
                <button
                  onClick={onTogglePlay}
                  className="w-12 h-12 rounded-full bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-500/30 hover:scale-105 active:scale-95 transition-all cursor-pointer font-bold"
                  title={isPlaying ? "Tạm dừng" : "Phát nhạc"}
                >
                  {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-0.5" />}
                </button>

                {/* Next Track */}
                <button
                  onClick={onNextTrack}
                  className="p-2 rounded-full text-slate-300 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
                  title="Bài kế tiếp"
                >
                  <SkipForward className="w-5 h-5" />
                </button>

                {/* Repeat Button */}
                <button
                  onClick={onToggleRepeat}
                  className={`p-2 rounded-full transition-all cursor-pointer relative ${
                    repeatMode !== 'off' 
                      ? 'text-amber-400 bg-amber-500/20 border border-amber-500/40' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                  title={repeatMode === 'one' ? "Đang lặp 1 bài" : repeatMode === 'all' ? "Đang lặp toàn bộ danh sách" : "Không lặp lại"}
                >
                  <Repeat className="w-4 h-4" />
                  {repeatMode === 'one' && (
                    <span className="absolute -bottom-0.5 -right-0.5 text-[8px] font-bold bg-amber-400 text-slate-950 px-1 rounded-full">
                      1
                    </span>
                  )}
                </button>
              </div>

              {/* Volume Slider */}
              <div className="flex items-center gap-2 w-full max-w-[180px]">
                <button 
                  onClick={() => onVolumeChange(volume > 0 ? 0 : 80)}
                  className="text-slate-400 hover:text-amber-300"
                >
                  {volume === 0 ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={(e) => onVolumeChange(Number(e.target.value))}
                  className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-400"
                  title={`Âm lượng: ${volume}%`}
                />
                <span className="text-[10px] text-slate-400 w-6 font-mono text-right">
                  {volume}%
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Filter & Action Toolbar */}
        <div className="px-4 py-3 bg-slate-900/40 border-b border-slate-800 flex items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm bài hát, ca sĩ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-amber-400/60"
            />
          </div>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 transition-all cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm bài hát</span>
          </button>
        </div>

        {/* Add Track Collapsible Form */}
        {showAddForm && (
          <form onSubmit={handleAddNewTrack} className="p-4 bg-slate-900/90 border-b border-amber-500/30 flex flex-col gap-3 animate-fadeIn">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5" />
                Thêm bài hát mới vào Playlist
              </span>
              <button 
                type="button" 
                onClick={() => setShowAddForm(false)}
                className="text-xs text-slate-400 hover:text-slate-200"
              >
                Hủy
              </button>
            </div>

            {addError && (
              <p className="text-xs text-rose-400 bg-rose-950/40 p-2 rounded-lg border border-rose-800/50">
                {addError}
              </p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Tên bài hát *</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Phượng Hồng"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Ca sĩ / Thể hiện</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Vũ Khanh"
                  value={newArtist}
                  onChange={(e) => setNewArtist(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">
                Link YouTube hoặc Google Drive MP3 *
              </label>
              <input
                type="url"
                placeholder="https://youtu.be/... hoặc https://drive.google.com/file/d/.../view"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Hệ thống tự động phát âm thanh nền mượt mà từ video YouTube hoặc file Drive MP3 được cấp quyền xem công khai.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-3 py-1.5 rounded-lg text-xs bg-slate-800 text-slate-300 hover:bg-slate-700"
              >
                Đóng
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 hover:brightness-110 shadow-md flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                Lưu vào danh sách
              </button>
            </div>
          </form>
        )}

        {/* Playlist Items List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60 p-2 md:p-3 max-h-[380px] custom-scrollbar">
          {filteredPlaylist.length === 0 ? (
            <div className="py-10 text-center text-slate-400">
              <Music className="w-8 h-8 mx-auto text-slate-600 mb-2" />
              <p className="text-sm">Không tìm thấy bài hát nào phù hợp</p>
            </div>
          ) : (
            filteredPlaylist.map((track) => {
              const originalIndex = playlist.findIndex(t => t.id === track.id);
              const isCurrent = originalIndex === currentTrackIndex;

              return (
                <div
                  key={track.id}
                  onClick={() => onSelectTrack(originalIndex)}
                  className={`flex items-center justify-between p-2.5 md:p-3 rounded-xl transition-all cursor-pointer group ${
                    isCurrent 
                      ? 'bg-amber-500/15 border border-amber-400/40 shadow-sm' 
                      : 'hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {/* Index / Wave indicator */}
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0">
                      {isCurrent && isPlaying ? (
                        <div className="flex gap-0.5 items-end h-3.5">
                          <span className="w-1 bg-amber-400 block rounded-full animate-bounce h-3.5" style={{ animationDelay: '0.1s' }} />
                          <span className="w-1 bg-amber-400 block rounded-full animate-bounce h-2" style={{ animationDelay: '0.3s' }} />
                          <span className="w-1 bg-amber-400 block rounded-full animate-bounce h-4" style={{ animationDelay: '0.5s' }} />
                        </div>
                      ) : (
                        <span className={`text-xs font-mono font-bold ${isCurrent ? 'text-amber-400' : 'text-slate-400 group-hover:text-slate-200'}`}>
                          {(originalIndex + 1).toString().padStart(2, '0')}
                        </span>
                      )}
                    </div>

                    {/* Track info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className={`text-xs md:text-sm font-semibold truncate ${isCurrent ? 'text-amber-300' : 'text-slate-200 group-hover:text-amber-200'}`}>
                          {track.title}
                        </p>
                        {track.isCustom && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
                            Tự thêm
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 truncate">
                        {track.artist || 'K8A1 Tuyển Chọn'}
                      </p>
                    </div>
                  </div>

                  {/* Actions & Badge */}
                  <div className="flex items-center gap-2 ml-3">
                    <span className="hidden sm:inline-block text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
                      {track.sourceType === 'youtube' ? 'YouTube' : 'Drive'}
                    </span>

                    {/* Play/Pause icon button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isCurrent) {
                          onTogglePlay();
                        } else {
                          onSelectTrack(originalIndex);
                        }
                      }}
                      className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                        isCurrent 
                          ? 'bg-amber-400 text-slate-950 hover:bg-amber-300' 
                          : 'text-slate-400 hover:text-white hover:bg-slate-700'
                      }`}
                      title={isCurrent && isPlaying ? "Tạm dừng" : "Phát bài này"}
                    >
                      {isCurrent && isPlaying ? (
                        <Pause className="w-3.5 h-3.5 fill-current" />
                      ) : (
                        <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                      )}
                    </button>

                    {/* Remove button */}
                    {(isAdmin || track.isCustom) && onRemoveTrack && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Bạn có chắc muốn xóa ca khúc "${track.title}" khỏi danh sách phát?`)) {
                            onRemoveTrack(track.id);
                          }
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-all cursor-pointer"
                        title="Xóa bài hát"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Nhạc nền tự động phát tiếp bài kế tiếp khi kết thúc
          </span>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition-all"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
