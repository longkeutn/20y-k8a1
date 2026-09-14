import React, { useState, useMemo, useRef } from 'react';
import {
  Megaphone,
  Pin,
  Plus,
  Search,
  Filter,
  Trash2,
  Edit3,
  Share2,
  Check,
  Copy,
  Eye,
  X,
  Upload,
  Image as ImageIcon,
  Link as LinkIcon,
  Calendar,
  User,
  Heart,
  Sparkles,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
  MessageSquare
} from 'lucide-react';
import { Announcement, AnnouncementCategory } from '../types';
import { CATEGORY_STYLES } from './AnnouncementDetailModal';

// Các đích đến phổ biến trong webapp để gợi ý cho Ban Liên Lạc
const QUICK_ACTION_TARGETS = [
  { label: '🎫 Điểm danh & Nhận vé vàng', value: '#diem-danh' },
  { label: '💰 Đóng góp & Quỹ lớp', value: '#bank-transfer-card' },
  { label: '👕 Xem mẫu đồng phục áo polo', value: '#dong-phuc-polo' },
  { label: '📸 Thư viện ảnh kỷ niệm', value: '#album-ky-niem' },
  { label: '🎥 Video phóng sự 20 năm', value: '#video-chinh' },
  { label: '✍️ Viết lưu bút & Lời chúc', value: '#luu-but' },
  { label: '👨‍🏫 Tri ân Quý Thầy Cô', value: '#tri-an-thay-co' },
  { label: '🗺️ Bản đồ hội tụ cựu học sinh', value: '#hoi-tu-dia-ly' },
];

/**
 * Nén ảnh Canvas JPEG trước khi gán vào thông báo
 */
async function compressImage(file: File, maxWidth = 1200, quality = 0.8): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

interface AdminAnnouncementManagerProps {
  announcements: Announcement[];
  onSaveAnnouncement: (announcement: Announcement) => void;
  onDeleteAnnouncement: (id: string) => void;
  onPreviewAnnouncement?: (announcement: Announcement) => void;
  currentAuthorName?: string;
  isAuthorized?: boolean;
}

export default function AdminAnnouncementManager({
  announcements = [],
  onSaveAnnouncement,
  onDeleteAnnouncement,
  onPreviewAnnouncement,
  currentAuthorName = 'Ban Liên Lạc K8A1',
  isAuthorized = true,
}: AdminAnnouncementManagerProps) {
  // Bộ lọc & Tìm kiếm
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [filterPinnedOnly, setFilterPinnedOnly] = useState(false);

  // Modal Soạn thảo / Chỉnh sửa
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    title: string;
    category: AnnouncementCategory;
    summary: string;
    content: string;
    imageUrl: string;
    actionUrl: string;
    actionLabel: string;
    isPinned: boolean;
    author: string;
    status: 'published' | 'draft' | 'archived';
  }>({
    title: '',
    category: 'schedule',
    summary: '',
    content: '',
    imageUrl: '',
    actionUrl: '#diem-danh',
    actionLabel: '🎫 Xem Chi Tiết',
    isPinned: false,
    author: currentAuthorName || 'Ban Liên Lạc K8A1',
    status: 'published',
  });

  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Trạng thái thao tác nhanh
  const [copiedZaloId, setCopiedZaloId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Lọc danh sách thông báo
  const filteredAnnouncements = useMemo(() => {
    return announcements.filter((item) => {
      // Tìm kiếm từ khóa
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchTitle = item.title?.toLowerCase().includes(query);
        const matchSummary = item.summary?.toLowerCase().includes(query);
        const matchContent = item.content?.toLowerCase().includes(query);
        const matchAuthor = item.author?.toLowerCase().includes(query);
        if (!matchTitle && !matchSummary && !matchContent && !matchAuthor) return false;
      }

      // Lọc theo danh mục
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }

      // Lọc ghim
      if (filterPinnedOnly && !item.isPinned) {
        return false;
      }

      return true;
    });
  }, [announcements, searchTerm, selectedCategory, filterPinnedOnly]);

  // Đếm thống kê
  const stats = useMemo(() => {
    const total = announcements.length;
    const pinned = announcements.filter((a) => a.isPinned).length;
    const totalLikes = announcements.reduce((sum, a) => sum + (a.likesCount || 0), 0);
    return { total, pinned, totalLikes };
  }, [announcements]);

  // Mở form tạo mới
  const handleOpenCreateForm = () => {
    setEditingId(null);
    setFormData({
      title: '',
      category: 'schedule',
      summary: '',
      content: '',
      imageUrl: '',
      actionUrl: '#diem-danh',
      actionLabel: '🎫 Xem Chi Tiết',
      isPinned: announcements.length === 0, // Ghim mặc định nếu là tin đầu
      author: currentAuthorName || 'Ban Liên Lạc K8A1',
      status: 'published',
    });
    setIsFormOpen(true);
  };

  // Mở form chỉnh sửa
  const handleOpenEditForm = (item: Announcement) => {
    setEditingId(item.id);
    setFormData({
      title: item.title || '',
      category: item.category || 'schedule',
      summary: item.summary || '',
      content: item.content || '',
      imageUrl: item.imageUrl || '',
      actionUrl: item.actionUrl || '',
      actionLabel: item.actionLabel || '',
      isPinned: !!item.isPinned,
      author: item.author || currentAuthorName || 'Ban Liên Lạc K8A1',
      status: item.status || 'published',
    });
    setIsFormOpen(true);
  };

  // Upload & nén ảnh
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploadingImage(true);
      const compressedBase64 = await compressImage(file, 1200, 0.8);
      setFormData((prev) => ({ ...prev, imageUrl: compressedBase64 }));
    } catch (err) {
      console.error('Lỗi nén ảnh thông báo:', err);
      alert('Không thể tải ảnh. Vui lòng thử lại với file dung lượng nhỏ hơn.');
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Lưu thông báo (Tạo mới hoặc Sửa)
  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('Vui lòng nhập tiêu đề bản tin!');
      return;
    }

    const nowStr = new Date().toLocaleDateString('vi-VN') + ' ' + new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

    const updatedAnnouncement: Announcement = {
      id: editingId || `TB-${Date.now()}`,
      title: formData.title.trim(),
      category: formData.category,
      summary: formData.summary.trim() || formData.title.trim(),
      content: formData.content.trim() || formData.summary.trim() || formData.title.trim(),
      imageUrl: formData.imageUrl.trim() || undefined,
      actionUrl: formData.actionUrl.trim() || undefined,
      actionLabel: formData.actionLabel.trim() || undefined,
      isPinned: formData.isPinned,
      createdAt: editingId ? (announcements.find((a) => a.id === editingId)?.createdAt || nowStr) : nowStr,
      author: formData.author.trim() || 'Ban Liên Lạc K8A1',
      status: formData.status,
      likesCount: editingId ? (announcements.find((a) => a.id === editingId)?.likesCount || 0) : 0,
    };

    onSaveAnnouncement(updatedAnnouncement);
    setIsFormOpen(false);
    setEditingId(null);
  };

  // Chuyển đổi nhanh trạng thái ghim
  const handleTogglePin = (item: Announcement) => {
    onSaveAnnouncement({
      ...item,
      isPinned: !item.isPinned,
    });
  };

  // 1-Chạm Bắn Zalo (sao chép văn bản đã format đẹp vào clipboard)
  const handleCopyZalo = async (item: Announcement) => {
    const catInfo = CATEGORY_STYLES[item.category] || CATEGORY_STYLES.schedule;
    const webUrl = `${window.location.origin}${window.location.pathname}#ban-tin`;

    const zaloMessage = `📢 [K8A1 - 20 NĂM NGÀY TRỞ VỀ]
${catInfo.icon} ${item.title.toUpperCase()}
-----------------------------------
${item.summary || item.content.slice(0, 160)}

${item.actionLabel ? `👉 ${item.actionLabel}: ` : '👉 Xem chi tiết & tương tác ngay tại Web Lớp: '}
${webUrl}

(Ban Liên Lạc K8A1 trân trọng thông báo)`;

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(zaloMessage);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = zaloMessage;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopiedZaloId(item.id);
      setTimeout(() => {
        setCopiedZaloId(null);
      }, 2500);
    } catch (err) {
      console.error('Lỗi copy Zalo:', err);
      alert('Không thể sao chép văn bản tự động. Vui lòng thử lại.');
    }
  };

  // Xác nhận xóa
  const handleConfirmDelete = (id: string) => {
    onDeleteAnnouncement(id);
    setDeleteConfirmId(null);
  };

  return (
    <div className="space-y-4">
      {/* =================================================================== */}
      {/* HEADER & THỐNG KÊ NHANH */}
      {/* =================================================================== */}
      <div className="bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#0F172A] p-4 sm:p-5 rounded-2xl border border-amber-500/30 text-white shadow-md relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
                <Megaphone className="w-4 h-4" />
              </span>
              <h2 className="text-base sm:text-lg font-serif font-bold text-amber-200">
                Quản Trị Bảng Tin & Thông Báo K8A1
              </h2>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Soạn thảo, ghim tin tức nóng hổi, đồng bộ Google Sheets và phát thanh 1-chạm gửi nhanh lên nhóm Zalo lớp.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleOpenCreateForm}
              className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 text-xs font-sans font-bold rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Soạn Bản Tin Mới</span>
            </button>
          </div>
        </div>

        {/* THẺ CHỈ SỐ NHANH */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 mt-4 pt-3 border-t border-slate-700/60 text-center">
          <div className="bg-slate-800/60 backdrop-blur rounded-xl p-2 border border-slate-700/40">
            <div className="text-base sm:text-lg font-bold font-mono text-amber-300">{stats.total}</div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-sans">Tổng bản tin</div>
          </div>
          <div className="bg-slate-800/60 backdrop-blur rounded-xl p-2 border border-slate-700/40">
            <div className="text-base sm:text-lg font-bold font-mono text-amber-400 flex items-center justify-center gap-1">
              <Pin className="w-3.5 h-3.5" />
              {stats.pinned}
            </div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-sans">Đang ghim ưu tiên</div>
          </div>
          <div className="bg-slate-800/60 backdrop-blur rounded-xl p-2 border border-slate-700/40">
            <div className="text-base sm:text-lg font-bold font-mono text-rose-400 flex items-center justify-center gap-1">
              <Heart className="w-3.5 h-3.5 fill-rose-500/20" />
              {stats.totalLikes}
            </div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-sans">Lượt yêu thích</div>
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* THANH CÔNG CỤ: TÌM KIẾM, LỌC DANH MỤC */}
      {/* =================================================================== */}
      <div className="bg-white p-3 sm:p-3.5 rounded-xl border border-amber-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-2.5">
        {/* Input Tìm kiếm */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Tìm theo tiêu đề, tác giả..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 bg-slate-50/50"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Lọc danh mục & nút Ghim */}
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto no-scrollbar">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:border-amber-500 font-sans cursor-pointer shrink-0"
          >
            <option value="all">Tất cả chuyên mục</option>
            <option value="schedule">📋 Kế hoạch & Lịch trình</option>
            <option value="urgent">🔥 Thông báo Khẩn</option>
            <option value="shirts">👕 Đồng phục Áo lớp</option>
            <option value="fund">💰 Minh bạch Quỹ lớp</option>
            <option value="activity">📸 Ký sự & Hoạt động</option>
            <option value="poll">🗳️ Khảo sát ý kiến</option>
          </select>

          <button
            onClick={() => setFilterPinnedOnly((prev) => !prev)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-sans font-bold flex items-center gap-1 transition cursor-pointer shrink-0 ${
              filterPinnedOnly
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Pin className="w-3.5 h-3.5" />
            <span>Chỉ xem tin ghim</span>
          </button>
        </div>
      </div>

      {/* =================================================================== */}
      {/* DANH SÁCH THÔNG BÁO */}
      {/* =================================================================== */}
      {filteredAnnouncements.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-amber-200 p-8 text-center">
          <Megaphone className="w-10 h-10 text-amber-400/60 mx-auto mb-2 stroke-1" />
          <h3 className="text-sm font-bold font-serif text-slate-800">Chưa có thông báo nào phù hợp</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {searchTerm || selectedCategory !== 'all' || filterPinnedOnly
              ? 'Thử xóa bộ lọc hoặc tìm kiếm với từ khóa khác.'
              : 'Hãy bấm nút "Soạn Bản Tin Mới" ở trên để đăng thông báo đầu tiên cho lớp K8A1.'}
          </p>
          {(searchTerm || selectedCategory !== 'all' || filterPinnedOnly) && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
                setFilterPinnedOnly(false);
              }}
              className="mt-3 px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-800 text-xs font-bold rounded-lg transition cursor-pointer"
            >
              Xóa bộ lọc
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filteredAnnouncements.map((item) => {
            const catInfo = CATEGORY_STYLES[item.category] || CATEGORY_STYLES.schedule;
            const isCopied = copiedZaloId === item.id;
            const isConfirmingDelete = deleteConfirmId === item.id;

            return (
              <div
                key={item.id}
                className={`bg-white rounded-xl border transition-all p-3.5 sm:p-4 shadow-sm relative ${
                  item.isPinned
                    ? 'border-amber-400/80 bg-gradient-to-r from-amber-50/40 via-white to-amber-50/20 ring-1 ring-amber-400/30'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex flex-col sm:flex-row items-start justify-between gap-3">
                  {/* CỘT NỘI DUNG CHÍNH */}
                  <div className="flex-1 min-w-0 space-y-1.5">
                    {/* HÀNG BADGE: DANH MỤC, GHIM, NGÀY ĐĂNG */}
                    <div className="flex flex-wrap items-center gap-1.5 text-xs">
                      {item.isPinned && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-500 text-slate-950 shadow-xs">
                          <Pin className="w-3 h-3" />
                          <span>ĐANG GHIM</span>
                        </span>
                      )}

                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${catInfo.badgeClass}`}>
                        <span>{catInfo.icon}</span>
                        <span>{catInfo.label}</span>
                      </span>

                      <span className="text-[11px] text-slate-400 flex items-center gap-1 ml-auto sm:ml-0">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>{item.createdAt}</span>
                      </span>

                      {item.author && (
                        <span className="text-[11px] text-slate-500 flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-md">
                          <User className="w-3 h-3 text-slate-400" />
                          <span>{item.author}</span>
                        </span>
                      )}
                    </div>

                    {/* TIÊU ĐỀ */}
                    <h3 className="text-sm sm:text-base font-bold font-serif text-slate-900 leading-snug">
                      {item.title}
                    </h3>

                    {/* TÓM TẮT */}
                    {item.summary && (
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {item.summary}
                      </p>
                    )}

                    {/* LIÊN KẾT HÀNH ĐỘNG & THỐNG KÊ LƯỢT THÍCH */}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      {item.actionLabel && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-sans font-bold text-amber-700 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-md">
                          <LinkIcon className="w-3 h-3 text-amber-600" />
                          <span>{item.actionLabel}</span>
                          {item.actionUrl && <span className="text-[10px] text-slate-400 font-mono">({item.actionUrl})</span>}
                        </span>
                      )}

                      <span className="inline-flex items-center gap-1 text-[11px] font-mono text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100">
                        <Heart className="w-3 h-3 fill-rose-500/20" />
                        <span>{item.likesCount || 0} thích</span>
                      </span>
                    </div>
                  </div>

                  {/* ẢNH THUMBNAIL (NẾU CÓ) */}
                  {item.imageUrl && (
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden border border-slate-200 shrink-0 bg-slate-100 self-center sm:self-start">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        onError={(e) => {
                          (e.currentTarget as HTMLElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* =============================================================== */}
                {/* THANH THAO TÁC CỦA TỪNG BẢN TIN */}
                {/* =============================================================== */}
                <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                  {/* NHÓM BÊN TRÁI: 1-CHẠM BẮN ZALO & XEM TRƯỚC */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleCopyZalo(item)}
                      className={`px-2.5 py-1 text-xs font-sans font-bold rounded-lg transition flex items-center gap-1 cursor-pointer ${
                        isCopied
                          ? 'bg-emerald-600 text-white'
                          : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
                      }`}
                      title="Sao chép nội dung đã định dạng chuẩn để dán vào Zalo nhóm lớp"
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5 text-white" /> : <Share2 className="w-3.5 h-3.5 text-blue-600" />}
                      <span>{isCopied ? '✓ Đã Chép Zalo!' : '1-Chạm Bắn Zalo'}</span>
                    </button>

                    {onPreviewAnnouncement && (
                      <button
                        onClick={() => onPreviewAnnouncement(item)}
                        className="px-2.5 py-1 text-xs font-sans text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition flex items-center gap-1 cursor-pointer border border-slate-200"
                        title="Xem trước bài viết như giao diện thành viên thấy"
                      >
                        <Eye className="w-3.5 h-3.5 text-slate-500" />
                        <span className="hidden sm:inline">Xem thử</span>
                      </button>
                    )}
                  </div>

                  {/* NHÓM BÊN PHẢI: GHIM, SỬA, XÓA */}
                  <div className="flex items-center gap-1">
                    {/* NÚT GHIM / BỎ GHIM NHANH */}
                    <button
                      onClick={() => handleTogglePin(item)}
                      className={`p-1.5 rounded-lg text-xs transition cursor-pointer ${
                        item.isPinned
                          ? 'text-amber-600 bg-amber-100 hover:bg-amber-200'
                          : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                      }`}
                      title={item.isPinned ? 'Bỏ ghim khỏi đầu bảng tin' : 'Ghim bản tin này lên đầu'}
                    >
                      <Pin className={`w-3.5 h-3.5 ${item.isPinned ? 'fill-amber-600' : ''}`} />
                    </button>

                    {/* NÚT CHỈNH SỬA */}
                    <button
                      onClick={() => handleOpenEditForm(item)}
                      className="p-1.5 rounded-lg text-xs text-slate-600 hover:text-amber-700 hover:bg-amber-50 transition cursor-pointer"
                      title="Chỉnh sửa nội dung bản tin"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    {/* NÚT XÓA HOẶC XÁC NHẬN XÓA */}
                    {isConfirmingDelete ? (
                      <div className="flex items-center gap-1 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-lg">
                        <span className="text-[11px] text-rose-700 font-bold">Xóa?</span>
                        <button
                          onClick={() => handleConfirmDelete(item.id)}
                          className="text-[10px] bg-rose-600 hover:bg-rose-700 text-white font-bold px-1.5 py-0.5 rounded cursor-pointer"
                        >
                          Có
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="text-[10px] text-slate-500 hover:text-slate-700 font-bold px-1 py-0.5 cursor-pointer"
                        >
                          Hủy
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirmId(item.id)}
                        className="p-1.5 rounded-lg text-xs text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                        title="Xóa bản tin này"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL FORM SOẠN THẢO / CHỈNH SỬA BẢN TIN */}
      {/* =================================================================== */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-amber-300 shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#0F172A] to-[#1E293B] px-4 sm:px-5 py-3.5 text-white flex items-center justify-between border-b border-amber-500/30">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
                  <Megaphone className="w-3.5 h-3.5" />
                </span>
                <h3 className="text-sm sm:text-base font-bold font-serif text-amber-200">
                  {editingId ? 'Chỉnh Sửa Bản Tin K8A1' : 'Soạn Thảo Bản Tin BLL Mới'}
                </h3>
              </div>
              <button
                onClick={() => setIsFormOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSaveForm} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-xs font-sans">
              {/* TIÊU ĐỀ */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Tiêu đề bản tin <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: 📸 Ký sự BLL tiền trạm nhà hàng The Prime..."
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 font-bold"
                />
              </div>

              {/* HÀNG 2 CỘT: CHUYÊN MỤC & TÁC GIẢ */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Chuyên mục bản tin</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as AnnouncementCategory })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-amber-500 bg-white cursor-pointer"
                  >
                    <option value="schedule">📋 Kế Hoạch & Lịch Trình</option>
                    <option value="urgent">🔥 Thông Báo Khẩn Cấp</option>
                    <option value="shirts">👕 Đồng Phục Áo Lớp</option>
                    <option value="fund">💰 Minh Bạch Quỹ Lớp</option>
                    <option value="activity">📸 Ký Sự & Hoạt Động</option>
                    <option value="poll">🗳️ Khảo Sát Ý Kiến</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Người phát ngôn / Tác giả</label>
                  <input
                    type="text"
                    placeholder="Ban Liên Lạc K8A1"
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* TÓM TẮT NGẮN */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-800">
                    Tóm tắt ngắn (hiển thị trên thanh cuộn / thẻ tin nhanh)
                  </label>
                  <span className="text-[10px] text-slate-400">1 - 2 câu súc tích</span>
                </div>
                <textarea
                  rows={2}
                  placeholder="Tóm tắt 1 - 2 câu quan trọng nhất để các bạn lướt qua nắm bắt ngay..."
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-amber-500 leading-relaxed"
                />
              </div>

              {/* NỘI DUNG CHI TIẾT */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-800">
                    Nội dung chi tiết bản tin <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[10px] text-slate-400">Hỗ trợ xuống dòng, danh sách, emoji</span>
                </div>
                <textarea
                  rows={6}
                  required
                  placeholder="Nhập toàn bộ thông tin chi tiết, lịch trình, lưu ý, số điện thoại liên hệ..."
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-amber-500 leading-relaxed font-sans"
                />
              </div>

              {/* ẢNH MINH HỌA */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-amber-600" />
                    <span>Ảnh minh họa (Tùy chọn)</span>
                  </label>

                  <div className="flex items-center gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingImage}
                      className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Upload className="w-3 h-3 text-slate-500" />
                      <span>{isUploadingImage ? 'Đang nén ảnh...' : 'Tải ảnh từ máy'}</span>
                    </button>
                  </div>
                </div>

                <input
                  type="text"
                  placeholder="Dán URL ảnh hoặc dùng nút tải ảnh từ máy ở trên..."
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-amber-500 bg-white"
                />

                {formData.imageUrl && (
                  <div className="relative inline-block mt-2 rounded-lg overflow-hidden border border-slate-300 max-w-[200px] max-h-[120px]">
                    <img
                      src={formData.imageUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, imageUrl: '' })}
                      className="absolute top-1 right-1 p-1 bg-black/60 text-white rounded-full hover:bg-black/80"
                      title="Gỡ ảnh"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>

              {/* NÚT HÀNH ĐỘNG KÊU GỌI (CTA) */}
              <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/80 space-y-2">
                <div className="flex items-center gap-1.5 text-amber-900 font-bold text-xs">
                  <LinkIcon className="w-3.5 h-3.5 text-amber-600" />
                  <span>Nút hành động nhanh (CTA)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] text-slate-600 mb-1">Nhãn nút hiển thị</label>
                    <input
                      type="text"
                      placeholder="Ví dụ: 🎫 Nhận Vé Vàng, 💰 Đóng Góp Quỹ..."
                      value={formData.actionLabel}
                      onChange={(e) => setFormData({ ...formData, actionLabel: e.target.value })}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-amber-200 bg-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-600 mb-1">Địa chỉ liên kết đích</label>
                    <div className="space-y-1">
                      <input
                        type="text"
                        placeholder="Ví dụ: #diem-danh hoặc https://..."
                        value={formData.actionUrl}
                        onChange={(e) => setFormData({ ...formData, actionUrl: e.target.value })}
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-amber-200 bg-white focus:outline-none focus:border-amber-500 font-mono"
                      />
                      <select
                        onChange={(e) => {
                          if (e.target.value) {
                            setFormData({
                              ...formData,
                              actionUrl: e.target.value,
                              actionLabel: formData.actionLabel || QUICK_ACTION_TARGETS.find(q => q.value === e.target.value)?.label || 'Xem Chi Tiết'
                            });
                          }
                        }}
                        className="w-full text-[11px] px-2 py-1 rounded border border-amber-200 bg-amber-100/50 text-amber-900 cursor-pointer"
                      >
                        <option value="">-- Gợi ý nhanh các khu vực trên Web --</option>
                        {QUICK_ACTION_TARGETS.map((target) => (
                          <option key={target.value} value={target.value}>
                            {target.label} ({target.value})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* TÙY CHỌN GHIM & TRẠNG THÁI */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formData.isPinned}
                    onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
                    className="w-4 h-4 text-amber-600 rounded border-slate-300 focus:ring-amber-500 cursor-pointer"
                  />
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                    <Pin className="w-3.5 h-3.5 text-amber-600" />
                    <span>Ghim bản tin này lên đầu danh sách</span>
                  </span>
                </label>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-500">Trạng thái:</span>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="text-xs px-2 py-1 rounded-lg border border-slate-300 bg-white cursor-pointer font-bold"
                  >
                    <option value="published">✓ Công Khai (Hiển thị ngay)</option>
                    <option value="draft">Bản Nháp (Ẩn)</option>
                    <option value="archived">Lưu Trữ</option>
                  </select>
                </div>
              </div>

              {/* Modal Footer Buttons */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 rounded-xl shadow-md transition cursor-pointer flex items-center gap-1.5 active:scale-95"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{editingId ? 'Cập Nhật Bản Tin' : 'Đăng Bản Tin Ngay'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
