import { UserRole, RsvpData, WishData, MemoryImage, MemoryVideo, TimelineMilestone, QuizQuestion, PollItem, ScheduleItem, SponsorItem, EventConfig, ClassMember, ExpenseCategory, IncomeCategory, ExpenseItem, IncomeItem, TeacherData, TeacherTribute, MusicTrack, BackdropItem, StageSettings, TableConfigItem, PhotoAlbum } from './types';
export {
  isValidVietnamesePhone,
  normalizeVietnamesePhone,
  formatPhoneDisplay,
  maskPhoneSecure,
  verifyLast4Digits,
  findDuplicatePhoneInRoster
} from './utils/phoneUtils';

// Phiên bản bộ nhớ đệm ứng dụng (Thay đổi khi có cấu trúc dữ liệu hoặc danh bạ mới để tự động dọn sạch cache cũ trên máy thành viên)
export const CURRENT_CACHE_VERSION = 'k8a1_v2026.09.30_announcements_v13';

/**
 * Tự động kiểm tra và dọn dẹp sạch toàn bộ cache cũ tàn dư trên điện thoại thành viên
 * Đảm bảo 100% người dùng truy cập từ Zalo hôm nay sẽ luôn thấy dữ liệu thật mới nhất
 */
export function purgeOldCacheIfOutdated(): boolean {
  try {
    const storedVersion = localStorage.getItem('app_cache_version');
    if (storedVersion !== CURRENT_CACHE_VERSION) {
      const keysToPurge = [
        'rsvp_list',
        'k8a1_class_roster',
        'wishes_list',
        'k8a1_event_config',
        'k8a1_announcements',
        'k8a1_expenses_list',
        'k8a1_incomes_list',
        'k8a1_teachers_list',
        'k8a1_video_list',
        'custom_videos',
        'k8a1_venue_media_list',
        'uploaded_images'
      ];
      keysToPurge.forEach(k => {
        try { localStorage.removeItem(k); } catch (e) {}
      });
      localStorage.setItem('app_cache_version', CURRENT_CACHE_VERSION);
      return true;
    }
  } catch (err) {
    console.warn('Lỗi kiểm tra phiên bản cache:', err);
  }
  return false;
}

// Danh sách điểm danh RSVP ban đầu (Đồng bộ 100% động từ Google Sheets tab Trang_tinh_1)
export const INITIAL_RSVP_LIST: RsvpData[] = [];

// Danh bạ học sinh lớp K8A1 (Đồng bộ 100% động từ Google Sheets tab Danh_Sach_Lop)
export const CLASS_ROSTER_K8A1: ClassMember[] = [];

export const isOfficialBLLMember = (member?: ClassMember | null): boolean => {
  if (!member || !member.role) return false;
  const r = member.role.toLowerCase().trim();
  return (
    r.includes('ban liên lạc') ||
    r.includes('admin') ||
    r.includes('thủ quỹ') ||
    r.includes('bí thư') ||
    r.includes('lớp trưởng') ||
    r.includes('lớp phó') ||
    r.includes('trưởng ban') ||
    r.includes('bll')
  );
};

export const INITIAL_WISHES_LIST: WishData[] = [];

// =============================================================================
// DANH SÁCH CÁC FOLDER / ALBUM ẢNH KỶ NIỆM MẶC ĐỊNH CHUẨN K8A1
// =============================================================================
export const DEFAULT_ALBUMS: PhotoAlbum[] = [
  {
    id: 'thanh-xuan-2003-2006',
    title: '🎒 K8A1 Thời Niên Thiếu (2003 — 2006)',
    description: 'Những ngày tháng học trò ngây ngô dưới mái trường THPT Thái Nguyên, tà áo trắng, hoa phượng đỏ và bao kỷ niệm thời hoa niên.',
    period: '2003 — 2006',
    order: 1,
    coverPhotoUrl: 'https://lh3.googleusercontent.com/d/1Q05JWOgOF2tWTk0yZ6IRQlnmInLYF5xD=w1600',
    driveFolderId: '1zr5W6Yy7k-eeJ2kVEviqE9Z0bUxVXOgo',
    driveFolderUrl: 'https://drive.google.com/drive/folders/1zr5W6Yy7k-eeJ2kVEviqE9Z0bUxVXOgo',
    allowPublicUpload: true
  },
  {
    id: 'thay-co-mai-truong',
    title: '👨‍🏫 Tri Ân Thầy Cô Giáo',
    description: 'Khoảnh khắc kính dâng tấm lòng tri ân tới những người thầy, người cô đã tận tụy dìu dắt bao thế hệ K8A1.',
    period: '2003 — Nay',
    order: 2,
    coverPhotoUrl: 'https://lh3.googleusercontent.com/d/1Z6wWcSwqY6SqmIawq0Bqixx8bOy55dhv=w1600',
    driveFolderId: '1nbo9ePPdFBSMvvl_fvUk-67P9MiYvC44',
    driveFolderUrl: 'https://drive.google.com/drive/folders/1nbo9ePPdFBSMvvl_fvUk-67P9MiYvC44',
    allowPublicUpload: true
  },
  {
    id: 'hoi-ngo-10-nam',
    title: '🍻 10 Năm Tái Ngộ (2016)',
    description: 'Những nụ cười rạng rỡ và cảm xúc vẹn nguyên trong lần gặp mặt kỷ niệm 10 năm ngày ra trường.',
    period: '2016',
    order: 3,
    coverPhotoUrl: 'https://lh3.googleusercontent.com/d/1iXWP-WZniC5rcV0qevoymDvFxG41DXXX=w1600',
    driveFolderId: '1e6y68lVtLYyXR6et2O2k8jp-UIZYoaH9',
    driveFolderUrl: 'https://drive.google.com/drive/folders/1e6y68lVtLYyXR6et2O2k8jp-UIZYoaH9',
    allowPublicUpload: true
  },
  {
    id: 'hoi-ngo-15-nam',
    title: '🌟 15 Năm Tình Bạn (2021)',
    description: 'Một chặng đường gắn kết, trưởng thành và cùng nhau sẻ chia những câu chuyện đời thường ấm áp.',
    period: '2021',
    order: 4,
    coverPhotoUrl: 'https://lh3.googleusercontent.com/d/1Z7WKN4cvYk_PTpvELz0d75XuVYh17aKh=w1600',
    driveFolderId: '10o1ruR52sOUWeA3nEx4u2d3nnHtNI2QH',
    driveFolderUrl: 'https://drive.google.com/drive/folders/10o1ruR52sOUWeA3nEx4u2d3nnHtNI2QH',
    allowPublicUpload: true
  },
  {
    id: 'dai-le-20-nam',
    title: '🎉 20 Năm Ngày Trở Về (2026)',
    description: 'Công tác chuẩn bị, các buổi gặp gỡ hậu trường và toàn bộ khoảnh khắc bùng nổ của Đại lễ 20 năm.',
    period: '2026',
    order: 5,
    coverPhotoUrl: 'https://lh3.googleusercontent.com/d/1I_28ZEncmuRjMrPHMIg396qa8yko2Tsm=w1600',
    driveFolderId: '19NiwMjF0T4wo_Tq9iFSzSphmtxppkXl2',
    driveFolderUrl: 'https://drive.google.com/drive/folders/19NiwMjF0T4wo_Tq9iFSzSphmtxppkXl2',
    allowPublicUpload: true
  },
  {
    id: 'dong-gop-k8a1',
    title: '📸 Góc Thành Viên Đóng Góp',
    description: 'Những góc ảnh tự chụp, kỷ niệm đời thường do chính các thành viên K8A1 đóng góp và chia sẻ.',
    period: 'Mọi thời điểm',
    order: 6,
    coverPhotoUrl: 'https://lh3.googleusercontent.com/d/1efoyI0s5oo9mIbr6k_ng-tAa2Zk-blDb=w1600',
    driveFolderId: '1oGqhwhNOcbA2soBVCdsd9y6DSsZ3gvWl',
    driveFolderUrl: 'https://drive.google.com/drive/folders/1oGqhwhNOcbA2soBVCdsd9y6DSsZ3gvWl',
    allowPublicUpload: true
  }
];

/**
 * Chuẩn hóa Album ID từ bất kỳ ID cũ (legacy) hoặc alias
 */
export function normalizeAlbumId(rawId?: string | null): string {
  if (!rawId) return 'thanh-xuan-2003-2006';
  const id = rawId.toLowerCase().trim();
  if (id === 'album_cap3_2003_2006' || id === 'thanh-xuan-2003-2006' || id === 'thoi-nien-thieu-2003-2006' || id.includes('thoi_nien_thieu')) return 'thanh-xuan-2003-2006';
  if (id === 'album_thay_co' || id === 'thay-co-mai-truong' || id.includes('thay_co')) return 'thay-co-mai-truong';
  if (id === 'album_hop_lop_10y_2016' || id === 'hoi-ngo-10-nam' || id === 'hoi-ngo-10-nam-2016' || id.includes('10_nam')) return 'hoi-ngo-10-nam';
  if (id === 'album_hop_lop_15y_2021' || id === 'hoi-ngo-15-nam' || id === 'hoi-ngo-15-nam-2021' || id.includes('15_nam')) return 'hoi-ngo-15-nam';
  if (id === 'album_dai_le_20y_2026' || id === 'dai-le-20-nam' || id === 'dai-le-20-nam-2026' || id.includes('20_nam')) return 'dai-le-20-nam';
  if (id === 'album_dong_gop' || id === 'dong-gop-k8a1' || id === 'dong-gop-tu-lieu-anh' || id.includes('dong_gop')) return 'dong-gop-k8a1';
  return id;
}

/**
 * Làm sạch và khử trùng lặp danh sách Album (tự động gộp 12 album về đúng 6 album chuẩn, bảo toàn tiêu đề và thông tin chỉnh sửa)
 */
export function sanitizeAlbums(albums?: PhotoAlbum[] | null): PhotoAlbum[] {
  const defaultMap = new Map<string, PhotoAlbum>();
  DEFAULT_ALBUMS.forEach(def => {
    defaultMap.set(def.id, { ...def });
  });

  if (!albums || !Array.isArray(albums) || albums.length === 0) {
    return Array.from(defaultMap.values()).sort((a, b) => (a.order || 99) - (b.order || 99));
  }

  const resultMap = new Map<string, PhotoAlbum>();
  defaultMap.forEach((def, id) => {
    resultMap.set(id, { ...def });
  });

  // Khử trùng lặp: nếu danh sách có cả ID gốc (legacy) và ID chuẩn (canonical), ưu tiên ID chuẩn
  const hasCanonical = new Set(albums.map(a => a.id));
  const deduped = albums.filter(a => {
    if (!a || !a.id) return false;
    const can = normalizeAlbumId(a.id);
    return !(a.id !== can && hasCanonical.has(can));
  });

  deduped.forEach(alb => {
    if (!alb || !alb.id) return;
    const canonicalId = normalizeAlbumId(alb.id);
    const existing = resultMap.get(canonicalId);
    if (existing) {
      if (alb.title && alb.title.trim() !== '') {
        existing.title = alb.title.trim();
      }
      if (alb.description !== undefined) {
        existing.description = alb.description.trim();
      }
      if (alb.period !== undefined) {
        existing.period = alb.period.trim();
      }
      if (alb.coverPhotoUrl !== undefined && alb.coverPhotoUrl.trim() !== '') {
        existing.coverPhotoUrl = alb.coverPhotoUrl.trim();
      }
      if (alb.driveFolderId !== undefined && alb.driveFolderId.trim() !== '') {
        existing.driveFolderId = alb.driveFolderId.trim();
      }
      if (alb.driveFolderUrl !== undefined && alb.driveFolderUrl.trim() !== '') {
        existing.driveFolderUrl = alb.driveFolderUrl.trim();
      }
      if (alb.order !== undefined && !isNaN(Number(alb.order))) {
        existing.order = Number(alb.order);
      }
      if (alb.allowPublicUpload !== undefined) {
        existing.allowPublicUpload = !!alb.allowPublicUpload;
      }
      if (alb.mediaCount !== undefined) {
        existing.mediaCount = alb.mediaCount;
      }
    } else {
      resultMap.set(alb.id, {
        ...alb,
        id: alb.id,
        title: (alb.title && alb.title.trim()) || 'Album Mới',
        order: (alb.order !== undefined && !isNaN(Number(alb.order))) ? Number(alb.order) : (resultMap.size + 1),
        allowPublicUpload: alb.allowPublicUpload !== false
      });
    }
  });

  return Array.from(resultMap.values()).sort((a, b) => (a.order || 99) - (b.order || 99));
}

/**
 * Tự động phân loại Album cho ảnh nếu ảnh chưa có albumId hoặc chuẩn hóa ID cũ
 */
export function getPhotoAlbumId(photo: Partial<MemoryImage>): string {
  if (photo.albumId) {
    return normalizeAlbumId(photo.albumId);
  }
  const text = `${photo.caption || ''} ${photo.date || ''} ${photo.albumName || ''}`.toLowerCase();
  if (text.includes('thầy') || text.includes('cô') || text.includes('giáo') || text.includes('tri ân') || text.includes('mái trường')) {
    return 'thay-co-mai-truong';
  }
  if (text.includes('2016') || text.includes('10 năm') || text.includes('10y') || text.includes('tái ngộ')) {
    return 'hoi-ngo-10-nam';
  }
  if (text.includes('2021') || text.includes('15 năm') || text.includes('15y') || text.includes('tình bạn')) {
    return 'hoi-ngo-15-nam';
  }
  if (text.includes('2026') || text.includes('20 năm') || text.includes('20y') || text.includes('đại lễ') || text.includes('trở về')) {
    return 'dai-le-20-nam';
  }
  if (text.includes('đóng góp') || text.includes('thành viên') || text.includes('tự chụp') || text.includes('tư liệu')) {
    return 'dong-gop-k8a1';
  }
  return 'thanh-xuan-2003-2006';
}

// Thư viện ảnh kỷ niệm chính thức lớp K8A1 (Tự động đồng bộ với Google Drive)
export const DEFAULT_MEMORIES: MemoryImage[] = [
  {
    "id": "16qTHGfkz6rB0HrWsXMML3_K9Ji89fUaA",
    "url": "https://lh3.googleusercontent.com/d/16qTHGfkz6rB0HrWsXMML3_K9Ji89fUaA=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/16qTHGfkz6rB0HrWsXMML3_K9Ji89fUaA=w600",
    "driveUrl": "https://drive.google.com/file/d/16qTHGfkz6rB0HrWsXMML3_K9Ji89fUaA/view?usp=drivesdk",
    "caption": "499270042 3806814892797839 2072592384911416816 n",
    "date": "05/09/2026 09:06",
    "albumId": "dong-gop-k8a1",
    "albumName": "Đóng Góp & Tư Liệu Thành Viên",
    "driveFolderId": "1oGqhwhNOcbA2soBVCdsd9y6DSsZ3gvWl"
  },
  {
    "id": "1jpkFZucnRceK3QHI-5oFxVDnU4R00vxP",
    "url": "https://lh3.googleusercontent.com/d/1jpkFZucnRceK3QHI-5oFxVDnU4R00vxP=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1jpkFZucnRceK3QHI-5oFxVDnU4R00vxP=w600",
    "driveUrl": "https://drive.google.com/file/d/1jpkFZucnRceK3QHI-5oFxVDnU4R00vxP/view?usp=drivesdk",
    "caption": "490298270 2920829528090347 1483611416095165429 n",
    "date": "05/09/2026 09:05",
    "albumId": "dong-gop-k8a1",
    "albumName": "Đóng Góp & Tư Liệu Thành Viên",
    "driveFolderId": "1oGqhwhNOcbA2soBVCdsd9y6DSsZ3gvWl"
  },
  {
    "id": "185bsXQ9hPYEfjl1yRRZKVkIVLoIPSam4",
    "url": "https://lh3.googleusercontent.com/d/185bsXQ9hPYEfjl1yRRZKVkIVLoIPSam4=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/185bsXQ9hPYEfjl1yRRZKVkIVLoIPSam4=w600",
    "driveUrl": "https://drive.google.com/file/d/185bsXQ9hPYEfjl1yRRZKVkIVLoIPSam4/view?usp=drivesdk",
    "caption": "489906562 2920829544757012 1498041119239528231 n",
    "date": "05/09/2026 09:04",
    "albumId": "dong-gop-k8a1",
    "albumName": "Đóng Góp & Tư Liệu Thành Viên",
    "driveFolderId": "1oGqhwhNOcbA2soBVCdsd9y6DSsZ3gvWl"
  },
  {
    "id": "15A2sSdUKbxxMcwIfpmpG28BSCRGrBHFx",
    "url": "https://lh3.googleusercontent.com/d/15A2sSdUKbxxMcwIfpmpG28BSCRGrBHFx=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/15A2sSdUKbxxMcwIfpmpG28BSCRGrBHFx=w600",
    "driveUrl": "https://drive.google.com/file/d/15A2sSdUKbxxMcwIfpmpG28BSCRGrBHFx/view?usp=drivesdk",
    "caption": "490652438 2920829568090343 1972879535129963866 n",
    "date": "05/09/2026 09:04",
    "albumId": "dong-gop-k8a1",
    "albumName": "Đóng Góp & Tư Liệu Thành Viên",
    "driveFolderId": "1oGqhwhNOcbA2soBVCdsd9y6DSsZ3gvWl"
  },
  {
    "id": "1gxY87iDXK-DM0woyAalC3THJGu6-0Npe",
    "url": "https://lh3.googleusercontent.com/d/1gxY87iDXK-DM0woyAalC3THJGu6-0Npe=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1gxY87iDXK-DM0woyAalC3THJGu6-0Npe=w600",
    "driveUrl": "https://drive.google.com/file/d/1gxY87iDXK-DM0woyAalC3THJGu6-0Npe/view?usp=drivesdk",
    "caption": "490101062 2920830661423567 2250418056820492208 n",
    "date": "05/09/2026 09:04",
    "albumId": "dong-gop-k8a1",
    "albumName": "Đóng Góp & Tư Liệu Thành Viên",
    "driveFolderId": "1oGqhwhNOcbA2soBVCdsd9y6DSsZ3gvWl"
  },
  {
    "id": "16LvD1l6k3fjeKevsqAFH6dZ9bVGWLyf8",
    "url": "https://lh3.googleusercontent.com/d/16LvD1l6k3fjeKevsqAFH6dZ9bVGWLyf8=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/16LvD1l6k3fjeKevsqAFH6dZ9bVGWLyf8=w600",
    "driveUrl": "https://drive.google.com/file/d/16LvD1l6k3fjeKevsqAFH6dZ9bVGWLyf8/view?usp=drivesdk",
    "caption": "489947984 2920829594757007 2288825474806937438 n",
    "date": "05/09/2026 09:03",
    "albumId": "dong-gop-k8a1",
    "albumName": "Đóng Góp & Tư Liệu Thành Viên",
    "driveFolderId": "1oGqhwhNOcbA2soBVCdsd9y6DSsZ3gvWl"
  },
  {
    "id": "1wAoa1gvTPWjFMhET5udFfDgVAbPfO-pW",
    "url": "https://lh3.googleusercontent.com/d/1wAoa1gvTPWjFMhET5udFfDgVAbPfO-pW=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1wAoa1gvTPWjFMhET5udFfDgVAbPfO-pW=w600",
    "driveUrl": "https://drive.google.com/file/d/1wAoa1gvTPWjFMhET5udFfDgVAbPfO-pW/view?usp=drivesdk",
    "caption": "474871751 1356830585748771 7479293876746198285 n",
    "date": "28/09/2026 14:57",
    "albumId": "hoi-ngo-15-nam",
    "albumName": "Hội Ngộ 15 Năm (2021)",
    "driveFolderId": "10o1ruR52sOUWeA3nEx4u2d3nnHtNI2QH"
  },
  {
    "id": "17SzwC7EbpXf-AS_tqHuLIYUbOS516LSq",
    "url": "https://lh3.googleusercontent.com/d/17SzwC7EbpXf-AS_tqHuLIYUbOS516LSq=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/17SzwC7EbpXf-AS_tqHuLIYUbOS516LSq=w600",
    "driveUrl": "https://drive.google.com/file/d/17SzwC7EbpXf-AS_tqHuLIYUbOS516LSq/view?usp=drivesdk",
    "caption": "475114259 1356829939082169 3046017748641983950 n",
    "date": "28/09/2026 14:57",
    "albumId": "hoi-ngo-15-nam",
    "albumName": "Hội Ngộ 15 Năm (2021)",
    "driveFolderId": "10o1ruR52sOUWeA3nEx4u2d3nnHtNI2QH"
  },
  {
    "id": "1qEABJiATv9oNWItYr2FK95q2gE_qu0m_",
    "url": "https://lh3.googleusercontent.com/d/1qEABJiATv9oNWItYr2FK95q2gE_qu0m_=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1qEABJiATv9oNWItYr2FK95q2gE_qu0m_=w600",
    "driveUrl": "https://drive.google.com/file/d/1qEABJiATv9oNWItYr2FK95q2gE_qu0m_/view?usp=drivesdk",
    "caption": "475164075 1356830695748760 8946071791161163477 n",
    "date": "28/09/2026 14:56",
    "albumId": "hoi-ngo-15-nam",
    "albumName": "Hội Ngộ 15 Năm (2021)",
    "driveFolderId": "10o1ruR52sOUWeA3nEx4u2d3nnHtNI2QH"
  },
  {
    "id": "1EH05UjNOhu8hOCHTPqxAvZ4xpK7Vq8AH",
    "url": "https://lh3.googleusercontent.com/d/1EH05UjNOhu8hOCHTPqxAvZ4xpK7Vq8AH=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1EH05UjNOhu8hOCHTPqxAvZ4xpK7Vq8AH=w600",
    "driveUrl": "https://drive.google.com/file/d/1EH05UjNOhu8hOCHTPqxAvZ4xpK7Vq8AH/view?usp=drivesdk",
    "caption": "475115050 1356830742415422 2641066426338130267 n",
    "date": "28/09/2026 14:56",
    "albumId": "hoi-ngo-15-nam",
    "albumName": "Hội Ngộ 15 Năm (2021)",
    "driveFolderId": "10o1ruR52sOUWeA3nEx4u2d3nnHtNI2QH"
  },
  {
    "id": "1sCkpzQN4PtqTrjBv2tivgOcmabGo-bss",
    "url": "https://lh3.googleusercontent.com/d/1sCkpzQN4PtqTrjBv2tivgOcmabGo-bss=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1sCkpzQN4PtqTrjBv2tivgOcmabGo-bss=w600",
    "driveUrl": "https://drive.google.com/file/d/1sCkpzQN4PtqTrjBv2tivgOcmabGo-bss/view?usp=drivesdk",
    "caption": "475060316 1356830655748764 7207174376143640475 n",
    "date": "28/09/2026 14:56",
    "albumId": "hoi-ngo-15-nam",
    "albumName": "Hội Ngộ 15 Năm (2021)",
    "driveFolderId": "10o1ruR52sOUWeA3nEx4u2d3nnHtNI2QH"
  },
  {
    "id": "1PdKAD_AllwTywPC16PCQCQyINt5GK0Gu",
    "url": "https://lh3.googleusercontent.com/d/1PdKAD_AllwTywPC16PCQCQyINt5GK0Gu=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1PdKAD_AllwTywPC16PCQCQyINt5GK0Gu=w600",
    "driveUrl": "https://drive.google.com/file/d/1PdKAD_AllwTywPC16PCQCQyINt5GK0Gu/view?usp=drivesdk",
    "caption": "475147427 1356830692415427 6421317411585214495 n",
    "date": "28/09/2026 14:55",
    "albumId": "hoi-ngo-15-nam",
    "albumName": "Hội Ngộ 15 Năm (2021)",
    "driveFolderId": "10o1ruR52sOUWeA3nEx4u2d3nnHtNI2QH"
  },
  {
    "id": "1b73xpM6DvzESkW9orZNy_T8ZBFxInmL8",
    "url": "https://lh3.googleusercontent.com/d/1b73xpM6DvzESkW9orZNy_T8ZBFxInmL8=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1b73xpM6DvzESkW9orZNy_T8ZBFxInmL8=w600",
    "driveUrl": "https://drive.google.com/file/d/1b73xpM6DvzESkW9orZNy_T8ZBFxInmL8/view?usp=drivesdk",
    "caption": "474885431 1356830752415421 5307508534759363325 n",
    "date": "28/09/2026 14:55",
    "albumId": "hoi-ngo-15-nam",
    "albumName": "Hội Ngộ 15 Năm (2021)",
    "driveFolderId": "10o1ruR52sOUWeA3nEx4u2d3nnHtNI2QH"
  },
  {
    "id": "1ngm74eu-AsVsYE71l-tT_0V5mqTIkisW",
    "url": "https://lh3.googleusercontent.com/d/1ngm74eu-AsVsYE71l-tT_0V5mqTIkisW=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1ngm74eu-AsVsYE71l-tT_0V5mqTIkisW=w600",
    "driveUrl": "https://drive.google.com/file/d/1ngm74eu-AsVsYE71l-tT_0V5mqTIkisW/view?usp=drivesdk",
    "caption": "475123268 1356830632415433 3698973179484619688 n",
    "date": "28/09/2026 14:55",
    "albumId": "hoi-ngo-15-nam",
    "albumName": "Hội Ngộ 15 Năm (2021)",
    "driveFolderId": "10o1ruR52sOUWeA3nEx4u2d3nnHtNI2QH"
  },
  {
    "id": "1d0VgsAebYFKExFHVgQZrTk2sfcPLIRrc",
    "url": "https://lh3.googleusercontent.com/d/1d0VgsAebYFKExFHVgQZrTk2sfcPLIRrc=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1d0VgsAebYFKExFHVgQZrTk2sfcPLIRrc=w600",
    "driveUrl": "https://drive.google.com/file/d/1d0VgsAebYFKExFHVgQZrTk2sfcPLIRrc/view?usp=drivesdk",
    "caption": "475172922 1356830652415431 8319688608764906255 n",
    "date": "28/09/2026 14:55",
    "albumId": "hoi-ngo-15-nam",
    "albumName": "Hội Ngộ 15 Năm (2021)",
    "driveFolderId": "10o1ruR52sOUWeA3nEx4u2d3nnHtNI2QH"
  },
  {
    "id": "1tF0hRMMN9yBm7rTRhbna6U50-Lxzi1O7",
    "url": "https://lh3.googleusercontent.com/d/1tF0hRMMN9yBm7rTRhbna6U50-Lxzi1O7=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1tF0hRMMN9yBm7rTRhbna6U50-Lxzi1O7=w600",
    "driveUrl": "https://drive.google.com/file/d/1tF0hRMMN9yBm7rTRhbna6U50-Lxzi1O7/view?usp=drivesdk",
    "caption": "475106532 1356830615748768 1558761998908294246 n",
    "date": "28/09/2026 14:55",
    "albumId": "hoi-ngo-15-nam",
    "albumName": "Hội Ngộ 15 Năm (2021)",
    "driveFolderId": "10o1ruR52sOUWeA3nEx4u2d3nnHtNI2QH"
  },
  {
    "id": "1OkRX1kFHQGiVobnhzyds_DUiFjxZDuEI",
    "url": "https://lh3.googleusercontent.com/d/1OkRX1kFHQGiVobnhzyds_DUiFjxZDuEI=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1OkRX1kFHQGiVobnhzyds_DUiFjxZDuEI=w600",
    "driveUrl": "https://drive.google.com/file/d/1OkRX1kFHQGiVobnhzyds_DUiFjxZDuEI/view?usp=drivesdk",
    "caption": "474920887 1356830725748757 2432317177434895658 n",
    "date": "28/09/2026 14:55",
    "albumId": "hoi-ngo-15-nam",
    "albumName": "Hội Ngộ 15 Năm (2021)",
    "driveFolderId": "10o1ruR52sOUWeA3nEx4u2d3nnHtNI2QH"
  },
  {
    "id": "1A9Epvyc72NZPCohmDcKwwpwMPbVHXwj-",
    "url": "https://lh3.googleusercontent.com/d/1A9Epvyc72NZPCohmDcKwwpwMPbVHXwj-=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1A9Epvyc72NZPCohmDcKwwpwMPbVHXwj-=w600",
    "driveUrl": "https://drive.google.com/file/d/1A9Epvyc72NZPCohmDcKwwpwMPbVHXwj-/view?usp=drivesdk",
    "caption": "475235403 1356830482415448 1255230655908895490 n",
    "date": "28/09/2026 14:55",
    "albumId": "hoi-ngo-15-nam",
    "albumName": "Hội Ngộ 15 Năm (2021)",
    "driveFolderId": "10o1ruR52sOUWeA3nEx4u2d3nnHtNI2QH"
  },
  {
    "id": "1ESP6U0lR1t65yu69Fz1J2Sfmym_M-kAy",
    "url": "https://lh3.googleusercontent.com/d/1ESP6U0lR1t65yu69Fz1J2Sfmym_M-kAy=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1ESP6U0lR1t65yu69Fz1J2Sfmym_M-kAy=w600",
    "driveUrl": "https://drive.google.com/file/d/1ESP6U0lR1t65yu69Fz1J2Sfmym_M-kAy/view?usp=drivesdk",
    "caption": "475065481 1356830722415424 5978859464277269402 n",
    "date": "28/09/2026 14:54",
    "albumId": "hoi-ngo-15-nam",
    "albumName": "Hội Ngộ 15 Năm (2021)",
    "driveFolderId": "10o1ruR52sOUWeA3nEx4u2d3nnHtNI2QH"
  },
  {
    "id": "1Z1t8dQTecwv6ehmd2RdWfTCx3HHHl0fZ",
    "url": "https://lh3.googleusercontent.com/d/1Z1t8dQTecwv6ehmd2RdWfTCx3HHHl0fZ=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1Z1t8dQTecwv6ehmd2RdWfTCx3HHHl0fZ=w600",
    "driveUrl": "https://drive.google.com/file/d/1Z1t8dQTecwv6ehmd2RdWfTCx3HHHl0fZ/view?usp=drivesdk",
    "caption": "475293007 1356829975748832 1830052831931879334 n",
    "date": "28/09/2026 14:54",
    "albumId": "hoi-ngo-15-nam",
    "albumName": "Hội Ngộ 15 Năm (2021)",
    "driveFolderId": "10o1ruR52sOUWeA3nEx4u2d3nnHtNI2QH"
  },
  {
    "id": "1Br_T708V_ONjcbL2Md7e0UdLQLySBK4G",
    "url": "https://lh3.googleusercontent.com/d/1Br_T708V_ONjcbL2Md7e0UdLQLySBK4G=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1Br_T708V_ONjcbL2Md7e0UdLQLySBK4G=w600",
    "driveUrl": "https://drive.google.com/file/d/1Br_T708V_ONjcbL2Md7e0UdLQLySBK4G/view?usp=drivesdk",
    "caption": "475112365 1356830565748773 2148331455199405320 n (1)",
    "date": "28/09/2026 14:54",
    "albumId": "hoi-ngo-15-nam",
    "albumName": "Hội Ngộ 15 Năm (2021)",
    "driveFolderId": "10o1ruR52sOUWeA3nEx4u2d3nnHtNI2QH"
  },
  {
    "id": "1a6iDXLvVJD61xvFWnAuIckd2OSgaQ4S-",
    "url": "https://lh3.googleusercontent.com/d/1a6iDXLvVJD61xvFWnAuIckd2OSgaQ4S-=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1a6iDXLvVJD61xvFWnAuIckd2OSgaQ4S-=w600",
    "driveUrl": "https://drive.google.com/file/d/1a6iDXLvVJD61xvFWnAuIckd2OSgaQ4S-/view?usp=drivesdk",
    "caption": "475287890 1356830649082098 8843586079652942965 n",
    "date": "28/09/2026 14:54",
    "albumId": "hoi-ngo-15-nam",
    "albumName": "Hội Ngộ 15 Năm (2021)",
    "driveFolderId": "10o1ruR52sOUWeA3nEx4u2d3nnHtNI2QH"
  },
  {
    "id": "1HhrVSQ-7_xx2H5kPOXpL--JOapuFS0gp",
    "url": "https://lh3.googleusercontent.com/d/1HhrVSQ-7_xx2H5kPOXpL--JOapuFS0gp=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1HhrVSQ-7_xx2H5kPOXpL--JOapuFS0gp=w600",
    "driveUrl": "https://drive.google.com/file/d/1HhrVSQ-7_xx2H5kPOXpL--JOapuFS0gp/view?usp=drivesdk",
    "caption": "474858910 1356830749082088 2812097126335684841 n",
    "date": "28/09/2026 14:53",
    "albumId": "hoi-ngo-15-nam",
    "albumName": "Hội Ngộ 15 Năm (2021)",
    "driveFolderId": "10o1ruR52sOUWeA3nEx4u2d3nnHtNI2QH"
  },
  {
    "id": "1rFxt1-LbWAaUZiufW5gXaA6ktYL8qFB7",
    "url": "https://lh3.googleusercontent.com/d/1rFxt1-LbWAaUZiufW5gXaA6ktYL8qFB7=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1rFxt1-LbWAaUZiufW5gXaA6ktYL8qFB7=w600",
    "driveUrl": "https://drive.google.com/file/d/1rFxt1-LbWAaUZiufW5gXaA6ktYL8qFB7/view?usp=drivesdk",
    "caption": "1656732400277 3024528935703027915 g8213875404109675727 a6dc8aa05a3dd897dbb4313e7acdbdb5",
    "date": "28/09/2026 14:26",
    "albumId": "hoi-ngo-15-nam",
    "albumName": "Hội Ngộ 15 Năm (2021)",
    "driveFolderId": "10o1ruR52sOUWeA3nEx4u2d3nnHtNI2QH"
  },
  {
    "id": "1T3QKDkiDuuytFdOiqtBlN7-rpJ638mUS",
    "url": "https://lh3.googleusercontent.com/d/1T3QKDkiDuuytFdOiqtBlN7-rpJ638mUS=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1T3QKDkiDuuytFdOiqtBlN7-rpJ638mUS=w600",
    "driveUrl": "https://drive.google.com/file/d/1T3QKDkiDuuytFdOiqtBlN7-rpJ638mUS/view?usp=drivesdk",
    "caption": "1656732400278 3024528935703027915 g8213875404109675727 da755d646ab47d045b2a09a04ef1b405",
    "date": "28/09/2026 14:26",
    "albumId": "hoi-ngo-15-nam",
    "albumName": "Hội Ngộ 15 Năm (2021)",
    "driveFolderId": "10o1ruR52sOUWeA3nEx4u2d3nnHtNI2QH"
  },
  {
    "id": "1PQ2zJxRisCa0b0POcmqLNfvb5iiYOcwy",
    "url": "https://lh3.googleusercontent.com/d/1PQ2zJxRisCa0b0POcmqLNfvb5iiYOcwy=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1PQ2zJxRisCa0b0POcmqLNfvb5iiYOcwy=w600",
    "driveUrl": "https://drive.google.com/file/d/1PQ2zJxRisCa0b0POcmqLNfvb5iiYOcwy/view?usp=drivesdk",
    "caption": "1656732400274 3024528935703027915 g8213875404109675727 4a4d1e323a2127c910a03a2611937506",
    "date": "28/09/2026 14:26",
    "albumId": "hoi-ngo-15-nam",
    "albumName": "Hội Ngộ 15 Năm (2021)",
    "driveFolderId": "10o1ruR52sOUWeA3nEx4u2d3nnHtNI2QH"
  },
  {
    "id": "1uqgGX9gNxQp2PUMfYUCVySIz86fMIxMx",
    "url": "https://lh3.googleusercontent.com/d/1uqgGX9gNxQp2PUMfYUCVySIz86fMIxMx=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1uqgGX9gNxQp2PUMfYUCVySIz86fMIxMx=w600",
    "driveUrl": "https://drive.google.com/file/d/1uqgGX9gNxQp2PUMfYUCVySIz86fMIxMx/view?usp=drivesdk",
    "caption": "1656746749554 6072186188646670454 g8213875404109675727 4e1e29648e7d6c146406fd5a0d2cdde0",
    "date": "28/09/2026 14:25",
    "albumId": "hoi-ngo-15-nam",
    "albumName": "Hội Ngộ 15 Năm (2021)",
    "driveFolderId": "10o1ruR52sOUWeA3nEx4u2d3nnHtNI2QH"
  },
  {
    "id": "1akizwjshYrRFHJ9vDbS4yIROINnbstca",
    "url": "https://lh3.googleusercontent.com/d/1akizwjshYrRFHJ9vDbS4yIROINnbstca=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1akizwjshYrRFHJ9vDbS4yIROINnbstca=w600",
    "driveUrl": "https://drive.google.com/file/d/1akizwjshYrRFHJ9vDbS4yIROINnbstca/view?usp=drivesdk",
    "caption": "1656745257607 6072186188646670454 g8213875404109675727 083f68621a575b2d100f30ceaa54fbbd",
    "date": "28/09/2026 14:25",
    "albumId": "hoi-ngo-15-nam",
    "albumName": "Hội Ngộ 15 Năm (2021)",
    "driveFolderId": "10o1ruR52sOUWeA3nEx4u2d3nnHtNI2QH"
  },
  {
    "id": "1UwnpXK7mBdrTJoOVDAOXgArHVRpBQlLR",
    "url": "https://lh3.googleusercontent.com/d/1UwnpXK7mBdrTJoOVDAOXgArHVRpBQlLR=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1UwnpXK7mBdrTJoOVDAOXgArHVRpBQlLR=w600",
    "driveUrl": "https://drive.google.com/file/d/1UwnpXK7mBdrTJoOVDAOXgArHVRpBQlLR/view?usp=drivesdk",
    "caption": "1656745257605 6072186188646670454 g8213875404109675727 73466ec62a3f1bfc27db127c599e1128",
    "date": "28/09/2026 14:25",
    "albumId": "hoi-ngo-15-nam",
    "albumName": "Hội Ngộ 15 Năm (2021)",
    "driveFolderId": "10o1ruR52sOUWeA3nEx4u2d3nnHtNI2QH"
  },
  {
    "id": "1tAxjnRg-7lBpcfg2XVVf7l7ryw7Gi8XV",
    "url": "https://lh3.googleusercontent.com/d/1tAxjnRg-7lBpcfg2XVVf7l7ryw7Gi8XV=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1tAxjnRg-7lBpcfg2XVVf7l7ryw7Gi8XV=w600",
    "driveUrl": "https://drive.google.com/file/d/1tAxjnRg-7lBpcfg2XVVf7l7ryw7Gi8XV/view?usp=drivesdk",
    "caption": "1656743753384 6858201427490636319 g8213875404109675727 fa318b21b12a41acca0822e39e1505da",
    "date": "28/09/2026 14:25",
    "albumId": "hoi-ngo-15-nam",
    "albumName": "Hội Ngộ 15 Năm (2021)",
    "driveFolderId": "10o1ruR52sOUWeA3nEx4u2d3nnHtNI2QH"
  },
  {
    "id": "1fhJZE86zArcwu545fMmSWslYk-IpMcs4",
    "url": "https://lh3.googleusercontent.com/d/1fhJZE86zArcwu545fMmSWslYk-IpMcs4=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1fhJZE86zArcwu545fMmSWslYk-IpMcs4=w600",
    "driveUrl": "https://drive.google.com/file/d/1fhJZE86zArcwu545fMmSWslYk-IpMcs4/view?usp=drivesdk",
    "caption": "1656743694864 1038475801886529371 g8213875404109675727 ea3d1316f16c9736ee56cb9c58b22a10",
    "date": "28/09/2026 14:25",
    "albumId": "hoi-ngo-15-nam",
    "albumName": "Hội Ngộ 15 Năm (2021)",
    "driveFolderId": "10o1ruR52sOUWeA3nEx4u2d3nnHtNI2QH"
  },
  {
    "id": "1WEmRbaXsiVKW_E2pX1dn8yREyrEr0g6p",
    "url": "https://lh3.googleusercontent.com/d/1WEmRbaXsiVKW_E2pX1dn8yREyrEr0g6p=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1WEmRbaXsiVKW_E2pX1dn8yREyrEr0g6p=w600",
    "driveUrl": "https://drive.google.com/file/d/1WEmRbaXsiVKW_E2pX1dn8yREyrEr0g6p/view?usp=drivesdk",
    "caption": "1656743694868 1038475801886529371 g8213875404109675727 301297c044309f305229af829fbc4cb6",
    "date": "28/09/2026 14:25",
    "albumId": "hoi-ngo-15-nam",
    "albumName": "Hội Ngộ 15 Năm (2021)",
    "driveFolderId": "10o1ruR52sOUWeA3nEx4u2d3nnHtNI2QH"
  },
  {
    "id": "1hwFQL-W5YUSL5HSqG9YLpeMCIbO3jgxt",
    "url": "https://lh3.googleusercontent.com/d/1hwFQL-W5YUSL5HSqG9YLpeMCIbO3jgxt=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1hwFQL-W5YUSL5HSqG9YLpeMCIbO3jgxt=w600",
    "driveUrl": "https://drive.google.com/file/d/1hwFQL-W5YUSL5HSqG9YLpeMCIbO3jgxt/view?usp=drivesdk",
    "caption": "1656743694874 1038475801886529371 g8213875404109675727 7ed92a16787d3509d3c431925759225e (1)",
    "date": "28/09/2026 14:25",
    "albumId": "hoi-ngo-15-nam",
    "albumName": "Hội Ngộ 15 Năm (2021)",
    "driveFolderId": "10o1ruR52sOUWeA3nEx4u2d3nnHtNI2QH"
  },
  {
    "id": "1SzFLzLkOM8QRbT2DxGfim80t6gZdccD1",
    "url": "https://lh3.googleusercontent.com/d/1SzFLzLkOM8QRbT2DxGfim80t6gZdccD1=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1SzFLzLkOM8QRbT2DxGfim80t6gZdccD1=w600",
    "driveUrl": "https://drive.google.com/file/d/1SzFLzLkOM8QRbT2DxGfim80t6gZdccD1/view?usp=drivesdk",
    "caption": "1656743694844 1038475801886529371 g8213875404109675727 35b403395509a417eedc61a0a1076021",
    "date": "28/09/2026 14:25",
    "albumId": "hoi-ngo-15-nam",
    "albumName": "Hội Ngộ 15 Năm (2021)",
    "driveFolderId": "10o1ruR52sOUWeA3nEx4u2d3nnHtNI2QH"
  },
  {
    "id": "1Gy_GQYq_0_9papT4niZ3Tmm_ZCuil67g",
    "url": "https://lh3.googleusercontent.com/d/1Gy_GQYq_0_9papT4niZ3Tmm_ZCuil67g=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1Gy_GQYq_0_9papT4niZ3Tmm_ZCuil67g=w600",
    "driveUrl": "https://drive.google.com/file/d/1Gy_GQYq_0_9papT4niZ3Tmm_ZCuil67g/view?usp=drivesdk",
    "caption": "1656743694874 1038475801886529371 g8213875404109675727 7ed92a16787d3509d3c431925759225e",
    "date": "28/09/2026 14:25",
    "albumId": "hoi-ngo-15-nam",
    "albumName": "Hội Ngộ 15 Năm (2021)",
    "driveFolderId": "10o1ruR52sOUWeA3nEx4u2d3nnHtNI2QH"
  },
  {
    "id": "19ut5rwXXdKCciQI6XWIii5m-qf8OD3zV",
    "url": "https://lh3.googleusercontent.com/d/19ut5rwXXdKCciQI6XWIii5m-qf8OD3zV=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/19ut5rwXXdKCciQI6XWIii5m-qf8OD3zV=w600",
    "driveUrl": "https://drive.google.com/file/d/19ut5rwXXdKCciQI6XWIii5m-qf8OD3zV/view?usp=drivesdk",
    "caption": "1656773130990 5070538970915170412 g8213875404109675727 8b9e2730e83cdf370d9594bb598495e2",
    "date": "28/09/2026 14:23",
    "albumId": "hoi-ngo-15-nam",
    "albumName": "Hội Ngộ 15 Năm (2021)",
    "driveFolderId": "10o1ruR52sOUWeA3nEx4u2d3nnHtNI2QH"
  },
  {
    "id": "1iAKfGfNRr1skgFZDOd2W2rUzFwtzbjnl",
    "url": "https://lh3.googleusercontent.com/d/1iAKfGfNRr1skgFZDOd2W2rUzFwtzbjnl=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1iAKfGfNRr1skgFZDOd2W2rUzFwtzbjnl=w600",
    "driveUrl": "https://drive.google.com/file/d/1iAKfGfNRr1skgFZDOd2W2rUzFwtzbjnl/view?usp=drivesdk",
    "caption": "1656773130992 5070538970915170412 g8213875404109675727 bc25ae4755bac0bfaaa11748a662e33f",
    "date": "28/09/2026 14:23",
    "albumId": "hoi-ngo-15-nam",
    "albumName": "Hội Ngộ 15 Năm (2021)",
    "driveFolderId": "10o1ruR52sOUWeA3nEx4u2d3nnHtNI2QH"
  },
  {
    "id": "1oPNHyoTljF8RbllDWJc4_l8jHk5HpH7j",
    "url": "https://lh3.googleusercontent.com/d/1oPNHyoTljF8RbllDWJc4_l8jHk5HpH7j=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1oPNHyoTljF8RbllDWJc4_l8jHk5HpH7j=w600",
    "driveUrl": "https://drive.google.com/file/d/1oPNHyoTljF8RbllDWJc4_l8jHk5HpH7j/view?usp=drivesdk",
    "caption": "1656773130993 5070538970915170412 g8213875404109675727 9f40b21354c7c466bf76dd39571706bf",
    "date": "28/09/2026 14:23",
    "albumId": "hoi-ngo-15-nam",
    "albumName": "Hội Ngộ 15 Năm (2021)",
    "driveFolderId": "10o1ruR52sOUWeA3nEx4u2d3nnHtNI2QH"
  },
  {
    "id": "1KOl0vSIXRbj1hclEbq1t983ZRqK6tYLt",
    "url": "https://lh3.googleusercontent.com/d/1KOl0vSIXRbj1hclEbq1t983ZRqK6tYLt=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1KOl0vSIXRbj1hclEbq1t983ZRqK6tYLt=w600",
    "driveUrl": "https://drive.google.com/file/d/1KOl0vSIXRbj1hclEbq1t983ZRqK6tYLt/view?usp=drivesdk",
    "caption": "1656773130998 5070538970915170412 g8213875404109675727 d51d9ef0e31323df1c7a5774ff43cdb1",
    "date": "28/09/2026 14:23",
    "albumId": "hoi-ngo-15-nam",
    "albumName": "Hội Ngộ 15 Năm (2021)",
    "driveFolderId": "10o1ruR52sOUWeA3nEx4u2d3nnHtNI2QH"
  },
  {
    "id": "1QxEv7zEQg6cwW_2UfgTp-TepnkEZf2Sq",
    "url": "https://lh3.googleusercontent.com/d/1QxEv7zEQg6cwW_2UfgTp-TepnkEZf2Sq=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1QxEv7zEQg6cwW_2UfgTp-TepnkEZf2Sq=w600",
    "driveUrl": "https://drive.google.com/file/d/1QxEv7zEQg6cwW_2UfgTp-TepnkEZf2Sq/view?usp=drivesdk",
    "caption": "1656773130991 5070538970915170412 g8213875404109675727 fda93377bbb668f8c6ef2ffe7bc718b8",
    "date": "28/09/2026 14:23",
    "albumId": "hoi-ngo-15-nam",
    "albumName": "Hội Ngộ 15 Năm (2021)",
    "driveFolderId": "10o1ruR52sOUWeA3nEx4u2d3nnHtNI2QH"
  },
  {
    "id": "1-BRRo_CEL7WOjc0S4x5RhoSW2bHpkSgi",
    "url": "https://lh3.googleusercontent.com/d/1-BRRo_CEL7WOjc0S4x5RhoSW2bHpkSgi=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1-BRRo_CEL7WOjc0S4x5RhoSW2bHpkSgi=w600",
    "driveUrl": "https://drive.google.com/file/d/1-BRRo_CEL7WOjc0S4x5RhoSW2bHpkSgi/view?usp=drivesdk",
    "caption": "1656773227328 2735587425587831748 g8213875404109675727 4d9f07b9c0724f62f97aa1a0f3707237",
    "date": "28/09/2026 14:23",
    "albumId": "hoi-ngo-15-nam",
    "albumName": "Hội Ngộ 15 Năm (2021)",
    "driveFolderId": "10o1ruR52sOUWeA3nEx4u2d3nnHtNI2QH"
  },
  {
    "id": "1JR85fOb4S_tbezvIU1g7jQM16MRTF6AF",
    "url": "https://lh3.googleusercontent.com/d/1JR85fOb4S_tbezvIU1g7jQM16MRTF6AF=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1JR85fOb4S_tbezvIU1g7jQM16MRTF6AF=w600",
    "driveUrl": "https://drive.google.com/file/d/1JR85fOb4S_tbezvIU1g7jQM16MRTF6AF/view?usp=drivesdk",
    "caption": "1656773227333 2735587425587831748 g8213875404109675727 ce6968e945ab32b11f25d8eb4c50c8b2",
    "date": "28/09/2026 14:22",
    "albumId": "hoi-ngo-15-nam",
    "albumName": "Hội Ngộ 15 Năm (2021)",
    "driveFolderId": "10o1ruR52sOUWeA3nEx4u2d3nnHtNI2QH"
  },
  {
    "id": "1Z7yGAwK0HPT62hI0D3n1FC0BaQo2ybCn",
    "url": "https://lh3.googleusercontent.com/d/1Z7yGAwK0HPT62hI0D3n1FC0BaQo2ybCn=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1Z7yGAwK0HPT62hI0D3n1FC0BaQo2ybCn=w600",
    "driveUrl": "https://drive.google.com/file/d/1Z7yGAwK0HPT62hI0D3n1FC0BaQo2ybCn/view?usp=drivesdk",
    "caption": "1656773227331 2735587425587831748 g8213875404109675727 0169565407de4978cdc12d2d0ee8af00",
    "date": "28/09/2026 14:22",
    "albumId": "hoi-ngo-15-nam",
    "albumName": "Hội Ngộ 15 Năm (2021)",
    "driveFolderId": "10o1ruR52sOUWeA3nEx4u2d3nnHtNI2QH"
  },
  {
    "id": "1j198NjA2z8BpH0MaWd8c_InKQWrwN4oc",
    "url": "https://lh3.googleusercontent.com/d/1j198NjA2z8BpH0MaWd8c_InKQWrwN4oc=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1j198NjA2z8BpH0MaWd8c_InKQWrwN4oc=w600",
    "driveUrl": "https://drive.google.com/file/d/1j198NjA2z8BpH0MaWd8c_InKQWrwN4oc/view?usp=drivesdk",
    "caption": "1790045678609 7058842502343911364 g8213875404109675727 01387dba512345da205a843830c97afe",
    "date": "28/09/2026 14:17",
    "albumId": "hoi-ngo-15-nam",
    "albumName": "Hội Ngộ 15 Năm (2021)",
    "driveFolderId": "10o1ruR52sOUWeA3nEx4u2d3nnHtNI2QH"
  },
  {
    "id": "1taPOyrKBJUGgAVKEsjrv4Bp3pwtq0WYb",
    "url": "https://lh3.googleusercontent.com/d/1taPOyrKBJUGgAVKEsjrv4Bp3pwtq0WYb=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1taPOyrKBJUGgAVKEsjrv4Bp3pwtq0WYb=w600",
    "driveUrl": "https://drive.google.com/file/d/1taPOyrKBJUGgAVKEsjrv4Bp3pwtq0WYb/view?usp=drivesdk",
    "caption": "1790045678629 7058842502343911364 g8213875404109675727 ff01ea82f0bae96516c393429902516d",
    "date": "28/09/2026 14:17",
    "albumId": "hoi-ngo-15-nam",
    "albumName": "Hội Ngộ 15 Năm (2021)",
    "driveFolderId": "10o1ruR52sOUWeA3nEx4u2d3nnHtNI2QH"
  },
  {
    "id": "1o_rebpZ-FDzB45CSOD0zdqeH_BoWcOjC",
    "url": "https://lh3.googleusercontent.com/d/1o_rebpZ-FDzB45CSOD0zdqeH_BoWcOjC=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1o_rebpZ-FDzB45CSOD0zdqeH_BoWcOjC=w600",
    "driveUrl": "https://drive.google.com/file/d/1o_rebpZ-FDzB45CSOD0zdqeH_BoWcOjC/view?usp=drivesdk",
    "caption": "1790045678645 7058842502343911364 g8213875404109675727 99498ef4e35ccf524bf68cf02b631e76",
    "date": "28/09/2026 14:17",
    "albumId": "hoi-ngo-15-nam",
    "albumName": "Hội Ngộ 15 Năm (2021)",
    "driveFolderId": "10o1ruR52sOUWeA3nEx4u2d3nnHtNI2QH"
  },
  {
    "id": "14HFJ_Su2j0f35hMo_6PebMgpkIRRQCOy",
    "url": "https://lh3.googleusercontent.com/d/14HFJ_Su2j0f35hMo_6PebMgpkIRRQCOy=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/14HFJ_Su2j0f35hMo_6PebMgpkIRRQCOy=w600",
    "driveUrl": "https://drive.google.com/file/d/14HFJ_Su2j0f35hMo_6PebMgpkIRRQCOy/view?usp=drivesdk",
    "caption": "1790045678671 7058842502343911364 g8213875404109675727 753adf75c3b947bef89ccbe4f193993c",
    "date": "28/09/2026 14:17",
    "albumId": "hoi-ngo-15-nam",
    "albumName": "Hội Ngộ 15 Năm (2021)",
    "driveFolderId": "10o1ruR52sOUWeA3nEx4u2d3nnHtNI2QH"
  },
  {
    "id": "1_2cH87pqykb-t5uw7bqePEr5V2Btz6i-",
    "url": "https://lh3.googleusercontent.com/d/1_2cH87pqykb-t5uw7bqePEr5V2Btz6i-=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1_2cH87pqykb-t5uw7bqePEr5V2Btz6i-=w600",
    "driveUrl": "https://drive.google.com/file/d/1_2cH87pqykb-t5uw7bqePEr5V2Btz6i-/view?usp=drivesdk",
    "caption": "1790045678659 7058842502343911364 g8213875404109675727 d4dcc0df4a5adf696c1985ea8f4d239d",
    "date": "28/09/2026 14:17",
    "albumId": "hoi-ngo-15-nam",
    "albumName": "Hội Ngộ 15 Năm (2021)",
    "driveFolderId": "10o1ruR52sOUWeA3nEx4u2d3nnHtNI2QH"
  },
  {
    "id": "1vJSgydpG27OjHphpqYNW-hcGrsmzm9bi",
    "url": "https://lh3.googleusercontent.com/d/1vJSgydpG27OjHphpqYNW-hcGrsmzm9bi=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1vJSgydpG27OjHphpqYNW-hcGrsmzm9bi=w600",
    "driveUrl": "https://drive.google.com/file/d/1vJSgydpG27OjHphpqYNW-hcGrsmzm9bi/view?usp=drivesdk",
    "caption": "1790045678681 7058842502343911364 g8213875404109675727 1880b49c30711a7ac98c732b7f364918",
    "date": "28/09/2026 14:17",
    "albumId": "hoi-ngo-15-nam",
    "albumName": "Hội Ngộ 15 Năm (2021)",
    "driveFolderId": "10o1ruR52sOUWeA3nEx4u2d3nnHtNI2QH"
  },
  {
    "id": "1dbLpCT-eFb9sMGQh0LkinRMi7wLzGXYP",
    "url": "https://lh3.googleusercontent.com/d/1dbLpCT-eFb9sMGQh0LkinRMi7wLzGXYP=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1dbLpCT-eFb9sMGQh0LkinRMi7wLzGXYP=w600",
    "driveUrl": "https://drive.google.com/file/d/1dbLpCT-eFb9sMGQh0LkinRMi7wLzGXYP/view?usp=drivesdk",
    "caption": "1790045678574 7058842502343911364 g8213875404109675727 eaf523ef4850ec012f5fc87eae2d8b2b",
    "date": "28/09/2026 14:17",
    "albumId": "hoi-ngo-15-nam",
    "albumName": "Hội Ngộ 15 Năm (2021)",
    "driveFolderId": "10o1ruR52sOUWeA3nEx4u2d3nnHtNI2QH"
  },
  {
    "id": "1PyvlmILYdK-Lx12ohrHfBV-ppDjHDhhg",
    "url": "https://lh3.googleusercontent.com/d/1PyvlmILYdK-Lx12ohrHfBV-ppDjHDhhg=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1PyvlmILYdK-Lx12ohrHfBV-ppDjHDhhg=w600",
    "driveUrl": "https://drive.google.com/file/d/1PyvlmILYdK-Lx12ohrHfBV-ppDjHDhhg/view?usp=drivesdk",
    "caption": "Hero Banner K8A1 1788595247751",
    "date": "05/09/2026 15:00",
    "albumId": "hoi-ngo-15-nam",
    "albumName": "Hội Ngộ 15 Năm (2021)",
    "driveFolderId": "10o1ruR52sOUWeA3nEx4u2d3nnHtNI2QH"
  },
  {
    "id": "1IyMW1SCsME0C-mQ6tGkEFH-_RizeCuBf",
    "url": "https://lh3.googleusercontent.com/d/1IyMW1SCsME0C-mQ6tGkEFH-_RizeCuBf=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1IyMW1SCsME0C-mQ6tGkEFH-_RizeCuBf=w600",
    "driveUrl": "https://drive.google.com/file/d/1IyMW1SCsME0C-mQ6tGkEFH-_RizeCuBf/view?usp=drivesdk",
    "caption": "475164842 1356830075748822 5437923390166382806 n",
    "date": "05/09/2026 09:08",
    "albumId": "hoi-ngo-15-nam",
    "albumName": "Hội Ngộ 15 Năm (2021)",
    "driveFolderId": "10o1ruR52sOUWeA3nEx4u2d3nnHtNI2QH"
  },
  {
    "id": "1Tk9X1Hg8SL0NuVz5w9Ae7h6kXeXJdyLb",
    "url": "https://lh3.googleusercontent.com/d/1Tk9X1Hg8SL0NuVz5w9Ae7h6kXeXJdyLb=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1Tk9X1Hg8SL0NuVz5w9Ae7h6kXeXJdyLb=w600",
    "driveUrl": "https://drive.google.com/file/d/1Tk9X1Hg8SL0NuVz5w9Ae7h6kXeXJdyLb/view?usp=drivesdk",
    "caption": "475116469 1356830739082089 1650045069745636096 n",
    "date": "05/09/2026 09:08",
    "albumId": "hoi-ngo-15-nam",
    "albumName": "Hội Ngộ 15 Năm (2021)",
    "driveFolderId": "10o1ruR52sOUWeA3nEx4u2d3nnHtNI2QH"
  },
  {
    "id": "1P8tJYeuh_1HQIWfQ5assg6xu08p0YZEN",
    "url": "https://lh3.googleusercontent.com/d/1P8tJYeuh_1HQIWfQ5assg6xu08p0YZEN=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1P8tJYeuh_1HQIWfQ5assg6xu08p0YZEN=w600",
    "driveUrl": "https://drive.google.com/file/d/1P8tJYeuh_1HQIWfQ5assg6xu08p0YZEN/view?usp=drivesdk",
    "caption": "475272178 1356830555748774 2593652870081312031 n",
    "date": "05/09/2026 09:08",
    "albumId": "hoi-ngo-15-nam",
    "albumName": "Hội Ngộ 15 Năm (2021)",
    "driveFolderId": "10o1ruR52sOUWeA3nEx4u2d3nnHtNI2QH"
  },
  {
    "id": "19f450ovKABWpZLF4ppEByERh3lBZMoxs",
    "url": "https://lh3.googleusercontent.com/d/19f450ovKABWpZLF4ppEByERh3lBZMoxs=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/19f450ovKABWpZLF4ppEByERh3lBZMoxs=w600",
    "driveUrl": "https://drive.google.com/file/d/19f450ovKABWpZLF4ppEByERh3lBZMoxs/view?usp=drivesdk",
    "caption": "475065642 1356830552415441 2066059058356530555 n",
    "date": "05/09/2026 09:07",
    "albumId": "hoi-ngo-15-nam",
    "albumName": "Hội Ngộ 15 Năm (2021)",
    "driveFolderId": "10o1ruR52sOUWeA3nEx4u2d3nnHtNI2QH"
  },
  {
    "id": "1HQRY48oZ8zntDXQtbrsF76k49yMAKyGf",
    "url": "https://lh3.googleusercontent.com/d/1HQRY48oZ8zntDXQtbrsF76k49yMAKyGf=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1HQRY48oZ8zntDXQtbrsF76k49yMAKyGf=w600",
    "driveUrl": "https://drive.google.com/file/d/1HQRY48oZ8zntDXQtbrsF76k49yMAKyGf/view?usp=drivesdk",
    "caption": "475112365 1356830565748773 2148331455199405320 n",
    "date": "05/09/2026 09:07",
    "albumId": "hoi-ngo-15-nam",
    "albumName": "Hội Ngộ 15 Năm (2021)",
    "driveFolderId": "10o1ruR52sOUWeA3nEx4u2d3nnHtNI2QH"
  },
  {
    "id": "1E4sa17GBSncH_kHl-sQYg9m9qCI1NQY-",
    "url": "https://lh3.googleusercontent.com/d/1E4sa17GBSncH_kHl-sQYg9m9qCI1NQY-=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1E4sa17GBSncH_kHl-sQYg9m9qCI1NQY-=w600",
    "driveUrl": "https://drive.google.com/file/d/1E4sa17GBSncH_kHl-sQYg9m9qCI1NQY-/view?usp=drivesdk",
    "caption": "474915648 1356830665748763 7088442939443535675 n",
    "date": "05/09/2026 09:06",
    "albumId": "hoi-ngo-15-nam",
    "albumName": "Hội Ngộ 15 Năm (2021)",
    "driveFolderId": "10o1ruR52sOUWeA3nEx4u2d3nnHtNI2QH"
  },
  {
    "id": "1NfiNoGcXuesjH5SZxKmTNw98LEfJrkjF",
    "url": "https://lh3.googleusercontent.com/d/1NfiNoGcXuesjH5SZxKmTNw98LEfJrkjF=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1NfiNoGcXuesjH5SZxKmTNw98LEfJrkjF=w600",
    "driveUrl": "https://drive.google.com/file/d/1NfiNoGcXuesjH5SZxKmTNw98LEfJrkjF/view?usp=drivesdk",
    "caption": "475134847 1356830729082090 6973331376706866691 n",
    "date": "05/09/2026 09:06",
    "albumId": "hoi-ngo-15-nam",
    "albumName": "Hội Ngộ 15 Năm (2021)",
    "driveFolderId": "10o1ruR52sOUWeA3nEx4u2d3nnHtNI2QH"
  },
  {
    "id": "1U24l1yH6AIRnIKrmGmaHhfElfNlgXvSA",
    "url": "https://lh3.googleusercontent.com/d/1U24l1yH6AIRnIKrmGmaHhfElfNlgXvSA=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1U24l1yH6AIRnIKrmGmaHhfElfNlgXvSA=w600",
    "driveUrl": "https://drive.google.com/file/d/1U24l1yH6AIRnIKrmGmaHhfElfNlgXvSA/view?usp=drivesdk",
    "caption": "2aOboR0DsVrb17DSjXsNFh9zyOxgw9WfaROWRDn6",
    "date": "21/09/2026 21:53",
    "albumId": "hoi-ngo-10-nam",
    "albumName": "Hội Ngộ 10 Năm (2016)",
    "driveFolderId": "1e6y68lVtLYyXR6et2O2k8jp-UIZYoaH9"
  },
  {
    "id": "1OrJVuLO-ADfvlO8Zi0Ad8_9jCwB7Nxq5",
    "url": "https://lh3.googleusercontent.com/d/1OrJVuLO-ADfvlO8Zi0Ad8_9jCwB7Nxq5=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1OrJVuLO-ADfvlO8Zi0Ad8_9jCwB7Nxq5=w600",
    "driveUrl": "https://drive.google.com/file/d/1OrJVuLO-ADfvlO8Zi0Ad8_9jCwB7Nxq5/view?usp=drivesdk",
    "caption": "503504170 2977749089065057 1459925905882967295 n",
    "date": "05/09/2026 09:10",
    "albumId": "hoi-ngo-10-nam",
    "albumName": "Hội Ngộ 10 Năm (2016)",
    "driveFolderId": "1e6y68lVtLYyXR6et2O2k8jp-UIZYoaH9"
  },
  {
    "id": "1sVcXm8RRGoyqKwCbe6dEtRwQMjTnJyqa",
    "url": "https://lh3.googleusercontent.com/d/1sVcXm8RRGoyqKwCbe6dEtRwQMjTnJyqa=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1sVcXm8RRGoyqKwCbe6dEtRwQMjTnJyqa=w600",
    "driveUrl": "https://drive.google.com/file/d/1sVcXm8RRGoyqKwCbe6dEtRwQMjTnJyqa/view?usp=drivesdk",
    "caption": "503605997 2977749192398380 442522293639860588 n",
    "date": "05/09/2026 09:09",
    "albumId": "hoi-ngo-10-nam",
    "albumName": "Hội Ngộ 10 Năm (2016)",
    "driveFolderId": "1e6y68lVtLYyXR6et2O2k8jp-UIZYoaH9"
  },
  {
    "id": "1y-gMPp7z6TqY3txehcYgoEpL4TmxiMs6",
    "url": "https://lh3.googleusercontent.com/d/1y-gMPp7z6TqY3txehcYgoEpL4TmxiMs6=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1y-gMPp7z6TqY3txehcYgoEpL4TmxiMs6=w600",
    "driveUrl": "https://drive.google.com/file/d/1y-gMPp7z6TqY3txehcYgoEpL4TmxiMs6/view?usp=drivesdk",
    "caption": "503828962 2977749182398381 1325996235817212040 n",
    "date": "05/09/2026 09:09",
    "albumId": "hoi-ngo-10-nam",
    "albumName": "Hội Ngộ 10 Năm (2016)",
    "driveFolderId": "1e6y68lVtLYyXR6et2O2k8jp-UIZYoaH9"
  },
  {
    "id": "1FNoMWHGzXTY19rSXd-xyZFxzeDRftG1v",
    "url": "https://lh3.googleusercontent.com/d/1FNoMWHGzXTY19rSXd-xyZFxzeDRftG1v=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1FNoMWHGzXTY19rSXd-xyZFxzeDRftG1v=w600",
    "driveUrl": "https://drive.google.com/file/d/1FNoMWHGzXTY19rSXd-xyZFxzeDRftG1v/view?usp=drivesdk",
    "caption": "503504723 2977749309065035 1228763104923627602 n",
    "date": "05/09/2026 09:09",
    "albumId": "hoi-ngo-10-nam",
    "albumName": "Hội Ngộ 10 Năm (2016)",
    "driveFolderId": "1e6y68lVtLYyXR6et2O2k8jp-UIZYoaH9"
  },
  {
    "id": "1Dei70eQXWBxIxOGXNIE5nX3SfeHm-IRW",
    "url": "https://lh3.googleusercontent.com/d/1Dei70eQXWBxIxOGXNIE5nX3SfeHm-IRW=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1Dei70eQXWBxIxOGXNIE5nX3SfeHm-IRW=w600",
    "driveUrl": "https://drive.google.com/file/d/1Dei70eQXWBxIxOGXNIE5nX3SfeHm-IRW/view?usp=drivesdk",
    "caption": "503889696 2977750115731621 8515012779203325994 n",
    "date": "05/09/2026 09:09",
    "albumId": "hoi-ngo-10-nam",
    "albumName": "Hội Ngộ 10 Năm (2016)",
    "driveFolderId": "1e6y68lVtLYyXR6et2O2k8jp-UIZYoaH9"
  },
  {
    "id": "1lfg_kuf2M_B_UeWTAPcTukXG8ckXYR5g",
    "url": "https://lh3.googleusercontent.com/d/1lfg_kuf2M_B_UeWTAPcTukXG8ckXYR5g=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1lfg_kuf2M_B_UeWTAPcTukXG8ckXYR5g=w600",
    "driveUrl": "https://drive.google.com/file/d/1lfg_kuf2M_B_UeWTAPcTukXG8ckXYR5g/view?usp=drivesdk",
    "caption": "509261017 3393265960816629 6127474883787765388 n",
    "date": "05/09/2026 09:08",
    "albumId": "hoi-ngo-10-nam",
    "albumName": "Hội Ngộ 10 Năm (2016)",
    "driveFolderId": "1e6y68lVtLYyXR6et2O2k8jp-UIZYoaH9"
  },
  {
    "id": "1Lj1AVNvTbkcEe-a7W9SMHSDzs9EUaBYn",
    "url": "https://lh3.googleusercontent.com/d/1Lj1AVNvTbkcEe-a7W9SMHSDzs9EUaBYn=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1Lj1AVNvTbkcEe-a7W9SMHSDzs9EUaBYn=w600",
    "driveUrl": "https://drive.google.com/file/d/1Lj1AVNvTbkcEe-a7W9SMHSDzs9EUaBYn/view?usp=drivesdk",
    "caption": "2aOboR0Dqa5YLCoYqoNdORP4aHUsrxFqziWlHMNk",
    "date": "21/09/2026 21:54",
    "albumId": "thanh-xuan-2003-2006",
    "albumName": "Thời Niên Thiếu (2003 — 2006)",
    "driveFolderId": "1zr5W6Yy7k-eeJ2kVEviqE9Z0bUxVXOgo"
  },
  {
    "id": "1cLs9oKW1nYNyt4ZpzvC6IpDS4SBlI98T",
    "url": "https://lh3.googleusercontent.com/d/1cLs9oKW1nYNyt4ZpzvC6IpDS4SBlI98T=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1cLs9oKW1nYNyt4ZpzvC6IpDS4SBlI98T=w600",
    "driveUrl": "https://drive.google.com/file/d/1cLs9oKW1nYNyt4ZpzvC6IpDS4SBlI98T/view?usp=drivesdk",
    "caption": "1789884839087 1176131752099263072 g8213875404109675727 2dacd7cce777f55d3a6765116b2413c9",
    "date": "21/09/2026 13:11",
    "albumId": "thanh-xuan-2003-2006",
    "albumName": "Thời Niên Thiếu (2003 — 2006)",
    "driveFolderId": "1zr5W6Yy7k-eeJ2kVEviqE9Z0bUxVXOgo"
  },
  {
    "id": "1bIUqUbQ4ST-lzCtYURyy1pmmlAvGBHu9",
    "url": "https://lh3.googleusercontent.com/d/1bIUqUbQ4ST-lzCtYURyy1pmmlAvGBHu9=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1bIUqUbQ4ST-lzCtYURyy1pmmlAvGBHu9=w600",
    "driveUrl": "https://drive.google.com/file/d/1bIUqUbQ4ST-lzCtYURyy1pmmlAvGBHu9/view?usp=drivesdk",
    "caption": "1789886027056 1176131752099263072 g8213875404109675727 2cd6de75d1ed099f76513e72980c1578",
    "date": "21/09/2026 13:11",
    "albumId": "thanh-xuan-2003-2006",
    "albumName": "Thời Niên Thiếu (2003 — 2006)",
    "driveFolderId": "1zr5W6Yy7k-eeJ2kVEviqE9Z0bUxVXOgo"
  },
  {
    "id": "1QUC4zf_Ab6hXoZ8Ehtf2il-xUHEa8fKC",
    "url": "https://lh3.googleusercontent.com/d/1QUC4zf_Ab6hXoZ8Ehtf2il-xUHEa8fKC=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1QUC4zf_Ab6hXoZ8Ehtf2il-xUHEa8fKC=w600",
    "driveUrl": "https://drive.google.com/file/d/1QUC4zf_Ab6hXoZ8Ehtf2il-xUHEa8fKC/view?usp=drivesdk",
    "caption": "1789886315834 1176131752099263072 g8213875404109675727 da5a1ea1f8fafe2742ff88555ba3c03e",
    "date": "21/09/2026 13:10",
    "albumId": "thanh-xuan-2003-2006",
    "albumName": "Thời Niên Thiếu (2003 — 2006)",
    "driveFolderId": "1zr5W6Yy7k-eeJ2kVEviqE9Z0bUxVXOgo"
  },
  {
    "id": "1Mh54EWyGIFKOPYIKOiQYqdlI5YywmwQ0",
    "url": "https://lh3.googleusercontent.com/d/1Mh54EWyGIFKOPYIKOiQYqdlI5YywmwQ0=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1Mh54EWyGIFKOPYIKOiQYqdlI5YywmwQ0=w600",
    "driveUrl": "https://drive.google.com/file/d/1Mh54EWyGIFKOPYIKOiQYqdlI5YywmwQ0/view?usp=drivesdk",
    "caption": "1789886169797 1176131752099263072 g8213875404109675727 68642ec7075bab5187e65efcc7ea3b01",
    "date": "21/09/2026 13:10",
    "albumId": "thanh-xuan-2003-2006",
    "albumName": "Thời Niên Thiếu (2003 — 2006)",
    "driveFolderId": "1zr5W6Yy7k-eeJ2kVEviqE9Z0bUxVXOgo"
  },
  {
    "id": "1Z4IVgYLCZ2AgN3vSjjWNL7CCXj3Om8tB",
    "url": "https://lh3.googleusercontent.com/d/1Z4IVgYLCZ2AgN3vSjjWNL7CCXj3Om8tB=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1Z4IVgYLCZ2AgN3vSjjWNL7CCXj3Om8tB=w600",
    "driveUrl": "https://drive.google.com/file/d/1Z4IVgYLCZ2AgN3vSjjWNL7CCXj3Om8tB/view?usp=drivesdk",
    "caption": "1789886366503 1176131752099263072 g8213875404109675727 f6eabe71abf246d3cb862750981ffbfb",
    "date": "21/09/2026 13:09",
    "albumId": "thanh-xuan-2003-2006",
    "albumName": "Thời Niên Thiếu (2003 — 2006)",
    "driveFolderId": "1zr5W6Yy7k-eeJ2kVEviqE9Z0bUxVXOgo"
  },
  {
    "id": "1naaS7MFXeDFN7qjQFwdsmGHhQq_8-oWn",
    "url": "https://lh3.googleusercontent.com/d/1naaS7MFXeDFN7qjQFwdsmGHhQq_8-oWn=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1naaS7MFXeDFN7qjQFwdsmGHhQq_8-oWn=w600",
    "driveUrl": "https://drive.google.com/file/d/1naaS7MFXeDFN7qjQFwdsmGHhQq_8-oWn/view?usp=drivesdk",
    "caption": "1789886412161 1176131752099263072 g8213875404109675727 fd7c6b8c9e896c796be5f53cea312df6",
    "date": "21/09/2026 13:09",
    "albumId": "thanh-xuan-2003-2006",
    "albumName": "Thời Niên Thiếu (2003 — 2006)",
    "driveFolderId": "1zr5W6Yy7k-eeJ2kVEviqE9Z0bUxVXOgo"
  },
  {
    "id": "1AGnn1HGcJRzi28EsrklRsaYRYUHBk6vV",
    "url": "https://lh3.googleusercontent.com/d/1AGnn1HGcJRzi28EsrklRsaYRYUHBk6vV=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1AGnn1HGcJRzi28EsrklRsaYRYUHBk6vV=w600",
    "driveUrl": "https://drive.google.com/file/d/1AGnn1HGcJRzi28EsrklRsaYRYUHBk6vV/view?usp=drivesdk",
    "caption": "1789463949175 2647631302199896716 g8213875404109675727 65e324102bc593332f3445c9028560ad",
    "date": "15/09/2026 16:18",
    "albumId": "thanh-xuan-2003-2006",
    "albumName": "Thời Niên Thiếu (2003 — 2006)",
    "driveFolderId": "1zr5W6Yy7k-eeJ2kVEviqE9Z0bUxVXOgo"
  },
  {
    "id": "1qE49Y77W-Y6tV8scPcPqoBlPxoJQzxzr",
    "url": "https://lh3.googleusercontent.com/d/1qE49Y77W-Y6tV8scPcPqoBlPxoJQzxzr=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1qE49Y77W-Y6tV8scPcPqoBlPxoJQzxzr=w600",
    "driveUrl": "https://drive.google.com/file/d/1qE49Y77W-Y6tV8scPcPqoBlPxoJQzxzr/view?usp=drivesdk",
    "caption": "1789462217080 5070538970915170412 g8213875404109675727 2a151353c93e2fd6b3defcb451969241",
    "date": "15/09/2026 15:50",
    "albumId": "thanh-xuan-2003-2006",
    "albumName": "Thời Niên Thiếu (2003 — 2006)",
    "driveFolderId": "1zr5W6Yy7k-eeJ2kVEviqE9Z0bUxVXOgo"
  },
  {
    "id": "1tu1yt0wsGBbQ26yNTbGIDC-TQ7Dc-d-X",
    "url": "https://lh3.googleusercontent.com/d/1tu1yt0wsGBbQ26yNTbGIDC-TQ7Dc-d-X=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1tu1yt0wsGBbQ26yNTbGIDC-TQ7Dc-d-X=w600",
    "driveUrl": "https://drive.google.com/file/d/1tu1yt0wsGBbQ26yNTbGIDC-TQ7Dc-d-X/view?usp=drivesdk",
    "caption": "1789461898042 5070538970915170412 g8213875404109675727 c52fbe4deb066b1d8f2830120c6b572b",
    "date": "15/09/2026 15:44",
    "albumId": "thanh-xuan-2003-2006",
    "albumName": "Thời Niên Thiếu (2003 — 2006)",
    "driveFolderId": "1zr5W6Yy7k-eeJ2kVEviqE9Z0bUxVXOgo"
  },
  {
    "id": "1jN5w0eYLL3canmi1geHDhEr2kNy9qJME",
    "url": "https://lh3.googleusercontent.com/d/1jN5w0eYLL3canmi1geHDhEr2kNy9qJME=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1jN5w0eYLL3canmi1geHDhEr2kNy9qJME=w600",
    "driveUrl": "https://drive.google.com/file/d/1jN5w0eYLL3canmi1geHDhEr2kNy9qJME/view?usp=drivesdk",
    "caption": "1789436945354 1622280133582022065 521686868081986063 68d2f5e750f2c472799f8ca91ae1c88a",
    "date": "15/09/2026 08:48",
    "albumId": "thanh-xuan-2003-2006",
    "albumName": "Thời Niên Thiếu (2003 — 2006)",
    "driveFolderId": "1zr5W6Yy7k-eeJ2kVEviqE9Z0bUxVXOgo"
  },
  {
    "id": "14huiGe6H0KkM-Rz53Yu0t0ucP-QU8_qr",
    "url": "https://lh3.googleusercontent.com/d/14huiGe6H0KkM-Rz53Yu0t0ucP-QU8_qr=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/14huiGe6H0KkM-Rz53Yu0t0ucP-QU8_qr=w600",
    "driveUrl": "https://drive.google.com/file/d/14huiGe6H0KkM-Rz53Yu0t0ucP-QU8_qr/view?usp=drivesdk",
    "caption": "IMG",
    "date": "15/09/2026 08:47",
    "albumId": "thanh-xuan-2003-2006",
    "albumName": "Thời Niên Thiếu (2003 — 2006)",
    "driveFolderId": "1zr5W6Yy7k-eeJ2kVEviqE9Z0bUxVXOgo"
  },
  {
    "id": "1Q05JWOgOF2tWTk0yZ6IRQlnmInLYF5xD",
    "url": "https://lh3.googleusercontent.com/d/1Q05JWOgOF2tWTk0yZ6IRQlnmInLYF5xD=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1Q05JWOgOF2tWTk0yZ6IRQlnmInLYF5xD=w600",
    "driveUrl": "https://drive.google.com/file/d/1Q05JWOgOF2tWTk0yZ6IRQlnmInLYF5xD/view?usp=drivesdk",
    "caption": "1788824248451 3501496844115072933 g8213875404109675727 9527bee86c38f35b4561e6a754f06d46",
    "date": "08/09/2026 08:17",
    "albumId": "thanh-xuan-2003-2006",
    "albumName": "Thời Niên Thiếu (2003 — 2006)",
    "driveFolderId": "1zr5W6Yy7k-eeJ2kVEviqE9Z0bUxVXOgo"
  },
  {
    "id": "1Z6wWcSwqY6SqmIawq0Bqixx8bOy55dhv",
    "url": "https://lh3.googleusercontent.com/d/1Z6wWcSwqY6SqmIawq0Bqixx8bOy55dhv=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1Z6wWcSwqY6SqmIawq0Bqixx8bOy55dhv=w600",
    "driveUrl": "https://drive.google.com/file/d/1Z6wWcSwqY6SqmIawq0Bqixx8bOy55dhv/view?usp=drivesdk",
    "caption": "1788824248592 3501496844115072933 g8213875404109675727 ebf9663813a934ae04dd580a52fd3244",
    "date": "08/09/2026 08:17",
    "albumId": "thanh-xuan-2003-2006",
    "albumName": "Thời Niên Thiếu (2003 — 2006)",
    "driveFolderId": "1zr5W6Yy7k-eeJ2kVEviqE9Z0bUxVXOgo"
  },
  {
    "id": "1iXWP-WZniC5rcV0qevoymDvFxG41DXXX",
    "url": "https://lh3.googleusercontent.com/d/1iXWP-WZniC5rcV0qevoymDvFxG41DXXX=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1iXWP-WZniC5rcV0qevoymDvFxG41DXXX=w600",
    "driveUrl": "https://drive.google.com/file/d/1iXWP-WZniC5rcV0qevoymDvFxG41DXXX/view?usp=drivesdk",
    "caption": "1788824248732 3501496844115072933 g8213875404109675727 da08312a632de5f5bf4e6f53ad649388",
    "date": "08/09/2026 08:17",
    "albumId": "thanh-xuan-2003-2006",
    "albumName": "Thời Niên Thiếu (2003 — 2006)",
    "driveFolderId": "1zr5W6Yy7k-eeJ2kVEviqE9Z0bUxVXOgo"
  },
  {
    "id": "1Z7WKN4cvYk_PTpvELz0d75XuVYh17aKh",
    "url": "https://lh3.googleusercontent.com/d/1Z7WKN4cvYk_PTpvELz0d75XuVYh17aKh=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1Z7WKN4cvYk_PTpvELz0d75XuVYh17aKh=w600",
    "driveUrl": "https://drive.google.com/file/d/1Z7WKN4cvYk_PTpvELz0d75XuVYh17aKh/view?usp=drivesdk",
    "caption": "1788824248871 3501496844115072933 g8213875404109675727 23e6f269ae05048e27f12abbf107f266",
    "date": "08/09/2026 08:17",
    "albumId": "thanh-xuan-2003-2006",
    "albumName": "Thời Niên Thiếu (2003 — 2006)",
    "driveFolderId": "1zr5W6Yy7k-eeJ2kVEviqE9Z0bUxVXOgo"
  },
  {
    "id": "1I_28ZEncmuRjMrPHMIg396qa8yko2Tsm",
    "url": "https://lh3.googleusercontent.com/d/1I_28ZEncmuRjMrPHMIg396qa8yko2Tsm=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1I_28ZEncmuRjMrPHMIg396qa8yko2Tsm=w600",
    "driveUrl": "https://drive.google.com/file/d/1I_28ZEncmuRjMrPHMIg396qa8yko2Tsm/view?usp=drivesdk",
    "caption": "1788824249013 3501496844115072933 g8213875404109675727 04f464b9b04065b8e3aa43b6e41f7dd6",
    "date": "08/09/2026 08:17",
    "albumId": "thanh-xuan-2003-2006",
    "albumName": "Thời Niên Thiếu (2003 — 2006)",
    "driveFolderId": "1zr5W6Yy7k-eeJ2kVEviqE9Z0bUxVXOgo"
  },
  {
    "id": "1efoyI0s5oo9mIbr6k_ng-tAa2Zk-blDb",
    "url": "https://lh3.googleusercontent.com/d/1efoyI0s5oo9mIbr6k_ng-tAa2Zk-blDb=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1efoyI0s5oo9mIbr6k_ng-tAa2Zk-blDb=w600",
    "driveUrl": "https://drive.google.com/file/d/1efoyI0s5oo9mIbr6k_ng-tAa2Zk-blDb/view?usp=drivesdk",
    "caption": "1788824249209 3501496844115072933 g8213875404109675727 eb5473dac01488365f15e3dc53c1e935",
    "date": "08/09/2026 08:17",
    "albumId": "thanh-xuan-2003-2006",
    "albumName": "Thời Niên Thiếu (2003 — 2006)",
    "driveFolderId": "1zr5W6Yy7k-eeJ2kVEviqE9Z0bUxVXOgo"
  },
  {
    "id": "1PdyvVtADltoTKFEJxE9tvg9eQqyPZoZi",
    "url": "https://lh3.googleusercontent.com/d/1PdyvVtADltoTKFEJxE9tvg9eQqyPZoZi=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1PdyvVtADltoTKFEJxE9tvg9eQqyPZoZi=w600",
    "driveUrl": "https://drive.google.com/file/d/1PdyvVtADltoTKFEJxE9tvg9eQqyPZoZi/view?usp=drivesdk",
    "caption": "1788824248331 3501496844115072933 g8213875404109675727 065c7067d85cb59faf76157717165807",
    "date": "08/09/2026 08:17",
    "albumId": "thanh-xuan-2003-2006",
    "albumName": "Thời Niên Thiếu (2003 — 2006)",
    "driveFolderId": "1zr5W6Yy7k-eeJ2kVEviqE9Z0bUxVXOgo"
  },
  {
    "id": "1yGjuN21tJ2DW7syA_H6Qr-7KSJuNOCXo",
    "url": "https://lh3.googleusercontent.com/d/1yGjuN21tJ2DW7syA_H6Qr-7KSJuNOCXo=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1yGjuN21tJ2DW7syA_H6Qr-7KSJuNOCXo=w600",
    "driveUrl": "https://drive.google.com/file/d/1yGjuN21tJ2DW7syA_H6Qr-7KSJuNOCXo/view?usp=drivesdk",
    "caption": "2aOboQx0cIp0ytJctMR2mYgDpSIvagbVQ47zopO4",
    "date": "07/09/2026 23:36",
    "albumId": "thanh-xuan-2003-2006",
    "albumName": "Thời Niên Thiếu (2003 — 2006)",
    "driveFolderId": "1zr5W6Yy7k-eeJ2kVEviqE9Z0bUxVXOgo"
  },
  {
    "id": "1peRhGo5OpuungLRfA7vPg_XF5ZumP6Sx",
    "url": "https://lh3.googleusercontent.com/d/1peRhGo5OpuungLRfA7vPg_XF5ZumP6Sx=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1peRhGo5OpuungLRfA7vPg_XF5ZumP6Sx=w600",
    "driveUrl": "https://drive.google.com/file/d/1peRhGo5OpuungLRfA7vPg_XF5ZumP6Sx/view?usp=drivesdk",
    "caption": "2aOboQx0baKOoIURuyvahzXio9cEbiKEgfKnDCcq",
    "date": "07/09/2026 21:39",
    "albumId": "thanh-xuan-2003-2006",
    "albumName": "Thời Niên Thiếu (2003 — 2006)",
    "driveFolderId": "1zr5W6Yy7k-eeJ2kVEviqE9Z0bUxVXOgo"
  },
  {
    "id": "12hYWeHGnHEE2w_SK6Epo_EkypNN3JVx1",
    "url": "https://lh3.googleusercontent.com/d/12hYWeHGnHEE2w_SK6Epo_EkypNN3JVx1=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/12hYWeHGnHEE2w_SK6Epo_EkypNN3JVx1=w600",
    "driveUrl": "https://drive.google.com/file/d/12hYWeHGnHEE2w_SK6Epo_EkypNN3JVx1/view?usp=drivesdk",
    "caption": "569594713 25427700770149816 2644678869832531622 n",
    "date": "07/09/2026 14:29",
    "albumId": "thanh-xuan-2003-2006",
    "albumName": "Thời Niên Thiếu (2003 — 2006)",
    "driveFolderId": "1zr5W6Yy7k-eeJ2kVEviqE9Z0bUxVXOgo"
  },
  {
    "id": "16SjRZNq38EI29_YH6RA7djbmbfOC5Tbc",
    "url": "https://lh3.googleusercontent.com/d/16SjRZNq38EI29_YH6RA7djbmbfOC5Tbc=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/16SjRZNq38EI29_YH6RA7djbmbfOC5Tbc=w600",
    "driveUrl": "https://drive.google.com/file/d/16SjRZNq38EI29_YH6RA7djbmbfOC5Tbc/view?usp=drivesdk",
    "caption": "568591301 25427700846816475 1126852120421423282 n",
    "date": "07/09/2026 14:28",
    "albumId": "thanh-xuan-2003-2006",
    "albumName": "Thời Niên Thiếu (2003 — 2006)",
    "driveFolderId": "1zr5W6Yy7k-eeJ2kVEviqE9Z0bUxVXOgo"
  },
  {
    "id": "1XA2YUEoDtn3l7hF8WkK3cl2qkoD9yW5Q",
    "url": "https://lh3.googleusercontent.com/d/1XA2YUEoDtn3l7hF8WkK3cl2qkoD9yW5Q=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1XA2YUEoDtn3l7hF8WkK3cl2qkoD9yW5Q=w600",
    "driveUrl": "https://drive.google.com/file/d/1XA2YUEoDtn3l7hF8WkK3cl2qkoD9yW5Q/view?usp=drivesdk",
    "caption": "568521421 25427700783483148 7823683749895364541 n",
    "date": "07/09/2026 14:28",
    "albumId": "thanh-xuan-2003-2006",
    "albumName": "Thời Niên Thiếu (2003 — 2006)",
    "driveFolderId": "1zr5W6Yy7k-eeJ2kVEviqE9Z0bUxVXOgo"
  },
  {
    "id": "1H096CF4zzNEHnqLFmf4kWY16ZXv8qNj_",
    "url": "https://lh3.googleusercontent.com/d/1H096CF4zzNEHnqLFmf4kWY16ZXv8qNj_=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1H096CF4zzNEHnqLFmf4kWY16ZXv8qNj_=w600",
    "driveUrl": "https://drive.google.com/file/d/1H096CF4zzNEHnqLFmf4kWY16ZXv8qNj_/view?usp=drivesdk",
    "caption": "568711089 25427701150149778 8533686120286400563 n",
    "date": "07/09/2026 14:28",
    "albumId": "thanh-xuan-2003-2006",
    "albumName": "Thời Niên Thiếu (2003 — 2006)",
    "driveFolderId": "1zr5W6Yy7k-eeJ2kVEviqE9Z0bUxVXOgo"
  },
  {
    "id": "1QiOHc2UiTC21vBT8fVrRo1EIX-LLXYNW",
    "url": "https://lh3.googleusercontent.com/d/1QiOHc2UiTC21vBT8fVrRo1EIX-LLXYNW=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1QiOHc2UiTC21vBT8fVrRo1EIX-LLXYNW=w600",
    "driveUrl": "https://drive.google.com/file/d/1QiOHc2UiTC21vBT8fVrRo1EIX-LLXYNW/view?usp=drivesdk",
    "caption": "568570760 25427700993483127 702110216661534225 n",
    "date": "07/09/2026 14:28",
    "albumId": "thanh-xuan-2003-2006",
    "albumName": "Thời Niên Thiếu (2003 — 2006)",
    "driveFolderId": "1zr5W6Yy7k-eeJ2kVEviqE9Z0bUxVXOgo"
  },
  {
    "id": "1_TEoL7kscr16madk1x_RFk-yYDgdqzR_",
    "url": "https://lh3.googleusercontent.com/d/1_TEoL7kscr16madk1x_RFk-yYDgdqzR_=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1_TEoL7kscr16madk1x_RFk-yYDgdqzR_=w600",
    "driveUrl": "https://drive.google.com/file/d/1_TEoL7kscr16madk1x_RFk-yYDgdqzR_/view?usp=drivesdk",
    "caption": "568684012 25427701193483107 3841298913620152420 n",
    "date": "07/09/2026 14:28",
    "albumId": "thanh-xuan-2003-2006",
    "albumName": "Thời Niên Thiếu (2003 — 2006)",
    "driveFolderId": "1zr5W6Yy7k-eeJ2kVEviqE9Z0bUxVXOgo"
  },
  {
    "id": "1XHVCQdD8zry64VsaguH-qjiDL268sTLO",
    "url": "https://lh3.googleusercontent.com/d/1XHVCQdD8zry64VsaguH-qjiDL268sTLO=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1XHVCQdD8zry64VsaguH-qjiDL268sTLO=w600",
    "driveUrl": "https://drive.google.com/file/d/1XHVCQdD8zry64VsaguH-qjiDL268sTLO/view?usp=drivesdk",
    "caption": "569034083 25427700956816464 1023055468056574601 n",
    "date": "07/09/2026 14:27",
    "albumId": "thanh-xuan-2003-2006",
    "albumName": "Thời Niên Thiếu (2003 — 2006)",
    "driveFolderId": "1zr5W6Yy7k-eeJ2kVEviqE9Z0bUxVXOgo"
  },
  {
    "id": "19kNADaP1ON_IUFfLNmGpzEkOhL1FFVMw",
    "url": "https://lh3.googleusercontent.com/d/19kNADaP1ON_IUFfLNmGpzEkOhL1FFVMw=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/19kNADaP1ON_IUFfLNmGpzEkOhL1FFVMw=w600",
    "driveUrl": "https://drive.google.com/file/d/19kNADaP1ON_IUFfLNmGpzEkOhL1FFVMw/view?usp=drivesdk",
    "caption": "569407909 25427701183483108 3435695790737340030 n",
    "date": "07/09/2026 14:27",
    "albumId": "thanh-xuan-2003-2006",
    "albumName": "Thời Niên Thiếu (2003 — 2006)",
    "driveFolderId": "1zr5W6Yy7k-eeJ2kVEviqE9Z0bUxVXOgo"
  },
  {
    "id": "1lkWz5F_4U-il89ChVGA3xiT_u6VEnk14",
    "url": "https://lh3.googleusercontent.com/d/1lkWz5F_4U-il89ChVGA3xiT_u6VEnk14=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1lkWz5F_4U-il89ChVGA3xiT_u6VEnk14=w600",
    "driveUrl": "https://drive.google.com/file/d/1lkWz5F_4U-il89ChVGA3xiT_u6VEnk14/view?usp=drivesdk",
    "caption": "568465914 25427700736816486 4586619359066166841 n",
    "date": "07/09/2026 14:27",
    "albumId": "thanh-xuan-2003-2006",
    "albumName": "Thời Niên Thiếu (2003 — 2006)",
    "driveFolderId": "1zr5W6Yy7k-eeJ2kVEviqE9Z0bUxVXOgo"
  },
  {
    "id": "1GPulvYg_sAATwp0bBH7DTdXaDYaLEZ74",
    "url": "https://lh3.googleusercontent.com/d/1GPulvYg_sAATwp0bBH7DTdXaDYaLEZ74=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1GPulvYg_sAATwp0bBH7DTdXaDYaLEZ74=w600",
    "driveUrl": "https://drive.google.com/file/d/1GPulvYg_sAATwp0bBH7DTdXaDYaLEZ74/view?usp=drivesdk",
    "caption": "568644863 25427701010149792 2103536203186524603 n",
    "date": "07/09/2026 14:27",
    "albumId": "thanh-xuan-2003-2006",
    "albumName": "Thời Niên Thiếu (2003 — 2006)",
    "driveFolderId": "1zr5W6Yy7k-eeJ2kVEviqE9Z0bUxVXOgo"
  },
  {
    "id": "1bUwUn-aU2_3vh0Li9zz3xQGxCepNc-HQ",
    "url": "https://lh3.googleusercontent.com/d/1bUwUn-aU2_3vh0Li9zz3xQGxCepNc-HQ=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1bUwUn-aU2_3vh0Li9zz3xQGxCepNc-HQ=w600",
    "driveUrl": "https://drive.google.com/file/d/1bUwUn-aU2_3vh0Li9zz3xQGxCepNc-HQ/view?usp=drivesdk",
    "caption": "568660519 25427701133483113 3101238401658299889 n",
    "date": "07/09/2026 14:27",
    "albumId": "thanh-xuan-2003-2006",
    "albumName": "Thời Niên Thiếu (2003 — 2006)",
    "driveFolderId": "1zr5W6Yy7k-eeJ2kVEviqE9Z0bUxVXOgo"
  },
  {
    "id": "14m6tyk5AdU7qT_8DV4Au7mKYsnokXlYO",
    "url": "https://lh3.googleusercontent.com/d/14m6tyk5AdU7qT_8DV4Au7mKYsnokXlYO=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/14m6tyk5AdU7qT_8DV4Au7mKYsnokXlYO=w600",
    "driveUrl": "https://drive.google.com/file/d/14m6tyk5AdU7qT_8DV4Au7mKYsnokXlYO/view?usp=drivesdk",
    "caption": "568391428 25427700786816481 3815322867541178641 n",
    "date": "07/09/2026 14:27",
    "albumId": "thanh-xuan-2003-2006",
    "albumName": "Thời Niên Thiếu (2003 — 2006)",
    "driveFolderId": "1zr5W6Yy7k-eeJ2kVEviqE9Z0bUxVXOgo"
  },
  {
    "id": "1HaSseVibgreTddMgzBONxJgVlpkSTNd7",
    "url": "https://lh3.googleusercontent.com/d/1HaSseVibgreTddMgzBONxJgVlpkSTNd7=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1HaSseVibgreTddMgzBONxJgVlpkSTNd7=w600",
    "driveUrl": "https://drive.google.com/file/d/1HaSseVibgreTddMgzBONxJgVlpkSTNd7/view?usp=drivesdk",
    "caption": "569045915 25427701130149780 6295153971260902112 n",
    "date": "07/09/2026 14:26",
    "albumId": "thanh-xuan-2003-2006",
    "albumName": "Thời Niên Thiếu (2003 — 2006)",
    "driveFolderId": "1zr5W6Yy7k-eeJ2kVEviqE9Z0bUxVXOgo"
  },
  {
    "id": "1PHzGoaJVkVX-uJKODv25tp2pCKQR09d7",
    "url": "https://lh3.googleusercontent.com/d/1PHzGoaJVkVX-uJKODv25tp2pCKQR09d7=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1PHzGoaJVkVX-uJKODv25tp2pCKQR09d7=w600",
    "driveUrl": "https://drive.google.com/file/d/1PHzGoaJVkVX-uJKODv25tp2pCKQR09d7/view?usp=drivesdk",
    "caption": "568732066 25427701006816459 8741581285049397805 n",
    "date": "07/09/2026 14:26",
    "albumId": "thanh-xuan-2003-2006",
    "albumName": "Thời Niên Thiếu (2003 — 2006)",
    "driveFolderId": "1zr5W6Yy7k-eeJ2kVEviqE9Z0bUxVXOgo"
  },
  {
    "id": "1LsKT7Ljbx_g31qUkQPOacv-agqnfgRcX",
    "url": "https://lh3.googleusercontent.com/d/1LsKT7Ljbx_g31qUkQPOacv-agqnfgRcX=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1LsKT7Ljbx_g31qUkQPOacv-agqnfgRcX=w600",
    "driveUrl": "https://drive.google.com/file/d/1LsKT7Ljbx_g31qUkQPOacv-agqnfgRcX/view?usp=drivesdk",
    "caption": "568368382 25427701003483126 6337531773628394740 n",
    "date": "07/09/2026 14:26",
    "albumId": "thanh-xuan-2003-2006",
    "albumName": "Thời Niên Thiếu (2003 — 2006)",
    "driveFolderId": "1zr5W6Yy7k-eeJ2kVEviqE9Z0bUxVXOgo"
  },
  {
    "id": "1GdpubsYWlncsRJ2RBjvglJIUPe-dzGsA",
    "url": "https://lh3.googleusercontent.com/d/1GdpubsYWlncsRJ2RBjvglJIUPe-dzGsA=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1GdpubsYWlncsRJ2RBjvglJIUPe-dzGsA=w600",
    "driveUrl": "https://drive.google.com/file/d/1GdpubsYWlncsRJ2RBjvglJIUPe-dzGsA/view?usp=drivesdk",
    "caption": "568673263 25427700840149809 1166261907794601885 n",
    "date": "07/09/2026 14:26",
    "albumId": "thanh-xuan-2003-2006",
    "albumName": "Thời Niên Thiếu (2003 — 2006)",
    "driveFolderId": "1zr5W6Yy7k-eeJ2kVEviqE9Z0bUxVXOgo"
  },
  {
    "id": "11VWTW8FFIk8S70TGeuSW6iPu-H_QoQyt",
    "url": "https://lh3.googleusercontent.com/d/11VWTW8FFIk8S70TGeuSW6iPu-H_QoQyt=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/11VWTW8FFIk8S70TGeuSW6iPu-H_QoQyt=w600",
    "driveUrl": "https://drive.google.com/file/d/11VWTW8FFIk8S70TGeuSW6iPu-H_QoQyt/view?usp=drivesdk",
    "caption": "568626605 25427701180149775 7581562842138321625 n",
    "date": "07/09/2026 14:25",
    "albumId": "thanh-xuan-2003-2006",
    "albumName": "Thời Niên Thiếu (2003 — 2006)",
    "driveFolderId": "1zr5W6Yy7k-eeJ2kVEviqE9Z0bUxVXOgo"
  },
  {
    "id": "1yKLQQX_KSZmJ7g5sK1UTaWOtUEBELQVt",
    "url": "https://lh3.googleusercontent.com/d/1yKLQQX_KSZmJ7g5sK1UTaWOtUEBELQVt=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1yKLQQX_KSZmJ7g5sK1UTaWOtUEBELQVt=w600",
    "driveUrl": "https://drive.google.com/file/d/1yKLQQX_KSZmJ7g5sK1UTaWOtUEBELQVt/view?usp=drivesdk",
    "caption": "568743815 25427700963483130 2635418458490161686 n",
    "date": "07/09/2026 14:24",
    "albumId": "thanh-xuan-2003-2006",
    "albumName": "Thời Niên Thiếu (2003 — 2006)",
    "driveFolderId": "1zr5W6Yy7k-eeJ2kVEviqE9Z0bUxVXOgo"
  },
  {
    "id": "1kEAtvZGkriNORGy8N6KL3h65TwYGQybD",
    "url": "https://lh3.googleusercontent.com/d/1kEAtvZGkriNORGy8N6KL3h65TwYGQybD=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1kEAtvZGkriNORGy8N6KL3h65TwYGQybD=w600",
    "driveUrl": "https://drive.google.com/file/d/1kEAtvZGkriNORGy8N6KL3h65TwYGQybD/view?usp=drivesdk",
    "caption": "568679026 25427699210149972 7810656936267837094 n",
    "date": "07/09/2026 14:24",
    "albumId": "thanh-xuan-2003-2006",
    "albumName": "Thời Niên Thiếu (2003 — 2006)",
    "driveFolderId": "1zr5W6Yy7k-eeJ2kVEviqE9Z0bUxVXOgo"
  },
  {
    "id": "1CbR0lVmvQ_cPtkdnJeW2dVIu1rYMaVMl",
    "url": "https://lh3.googleusercontent.com/d/1CbR0lVmvQ_cPtkdnJeW2dVIu1rYMaVMl=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1CbR0lVmvQ_cPtkdnJeW2dVIu1rYMaVMl=w600",
    "driveUrl": "https://drive.google.com/file/d/1CbR0lVmvQ_cPtkdnJeW2dVIu1rYMaVMl/view?usp=drivesdk",
    "caption": "569263239 25427700996816460 3729324044172904123 n",
    "date": "07/09/2026 14:24",
    "albumId": "thanh-xuan-2003-2006",
    "albumName": "Thời Niên Thiếu (2003 — 2006)",
    "driveFolderId": "1zr5W6Yy7k-eeJ2kVEviqE9Z0bUxVXOgo"
  },
  {
    "id": "1nUBLpkR8SKMYEh0k2xWxV4ck4HLNtYcx",
    "url": "https://lh3.googleusercontent.com/d/1nUBLpkR8SKMYEh0k2xWxV4ck4HLNtYcx=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1nUBLpkR8SKMYEh0k2xWxV4ck4HLNtYcx=w600",
    "driveUrl": "https://drive.google.com/file/d/1nUBLpkR8SKMYEh0k2xWxV4ck4HLNtYcx/view?usp=drivesdk",
    "caption": "568573499 25427700953483131 5327576891590810063 n",
    "date": "07/09/2026 14:23",
    "albumId": "thanh-xuan-2003-2006",
    "albumName": "Thời Niên Thiếu (2003 — 2006)",
    "driveFolderId": "1zr5W6Yy7k-eeJ2kVEviqE9Z0bUxVXOgo"
  },
  {
    "id": "13zT4aOkSxA64WvjMdnWYnvmQ3ymd8_tP",
    "url": "https://lh3.googleusercontent.com/d/13zT4aOkSxA64WvjMdnWYnvmQ3ymd8_tP=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/13zT4aOkSxA64WvjMdnWYnvmQ3ymd8_tP=w600",
    "driveUrl": "https://drive.google.com/file/d/13zT4aOkSxA64WvjMdnWYnvmQ3ymd8_tP/view?usp=drivesdk",
    "caption": "568695090 25427700926816467 6488015068094102325 n",
    "date": "07/09/2026 14:23",
    "albumId": "thanh-xuan-2003-2006",
    "albumName": "Thời Niên Thiếu (2003 — 2006)",
    "driveFolderId": "1zr5W6Yy7k-eeJ2kVEviqE9Z0bUxVXOgo"
  },
  {
    "id": "10XawSSwZY4SN1VxEiqwu1xTdVDrnHSJ_",
    "url": "https://lh3.googleusercontent.com/d/10XawSSwZY4SN1VxEiqwu1xTdVDrnHSJ_=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/10XawSSwZY4SN1VxEiqwu1xTdVDrnHSJ_=w600",
    "driveUrl": "https://drive.google.com/file/d/10XawSSwZY4SN1VxEiqwu1xTdVDrnHSJ_/view?usp=drivesdk",
    "caption": "569361841 25427700896816470 871589613218143097 n",
    "date": "07/09/2026 14:23",
    "albumId": "thanh-xuan-2003-2006",
    "albumName": "Thời Niên Thiếu (2003 — 2006)",
    "driveFolderId": "1zr5W6Yy7k-eeJ2kVEviqE9Z0bUxVXOgo"
  },
  {
    "id": "1YdNfE3eTp-tFMziZGrXAKBiFGGizxqU5",
    "url": "https://lh3.googleusercontent.com/d/1YdNfE3eTp-tFMziZGrXAKBiFGGizxqU5=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1YdNfE3eTp-tFMziZGrXAKBiFGGizxqU5=w600",
    "driveUrl": "https://drive.google.com/file/d/1YdNfE3eTp-tFMziZGrXAKBiFGGizxqU5/view?usp=drivesdk",
    "caption": "569275669 25427700886816471 1727293045959048178 n",
    "date": "07/09/2026 14:23",
    "albumId": "thanh-xuan-2003-2006",
    "albumName": "Thời Niên Thiếu (2003 — 2006)",
    "driveFolderId": "1zr5W6Yy7k-eeJ2kVEviqE9Z0bUxVXOgo"
  },
  {
    "id": "1TcNE9texOQ_bc3pHFQ5v1GkkC3fmvwa_",
    "url": "https://lh3.googleusercontent.com/d/1TcNE9texOQ_bc3pHFQ5v1GkkC3fmvwa_=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1TcNE9texOQ_bc3pHFQ5v1GkkC3fmvwa_=w600",
    "driveUrl": "https://drive.google.com/file/d/1TcNE9texOQ_bc3pHFQ5v1GkkC3fmvwa_/view?usp=drivesdk",
    "caption": "568636651 25427701116816448 7916458789377339898 n",
    "date": "07/09/2026 14:23",
    "albumId": "thanh-xuan-2003-2006",
    "albumName": "Thời Niên Thiếu (2003 — 2006)",
    "driveFolderId": "1zr5W6Yy7k-eeJ2kVEviqE9Z0bUxVXOgo"
  },
  {
    "id": "1moPfah4fJ65JDeLb2tmsgcUS8wLwKkYJ",
    "url": "https://lh3.googleusercontent.com/d/1moPfah4fJ65JDeLb2tmsgcUS8wLwKkYJ=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1moPfah4fJ65JDeLb2tmsgcUS8wLwKkYJ=w600",
    "driveUrl": "https://drive.google.com/file/d/1moPfah4fJ65JDeLb2tmsgcUS8wLwKkYJ/view?usp=drivesdk",
    "caption": "568630213 25427698856816674 2846856576979995986 n",
    "date": "07/09/2026 14:23",
    "albumId": "thanh-xuan-2003-2006",
    "albumName": "Thời Niên Thiếu (2003 — 2006)",
    "driveFolderId": "1zr5W6Yy7k-eeJ2kVEviqE9Z0bUxVXOgo"
  },
  {
    "id": "1vJNgqD0H1kakbcso-8l2HsmHaea0OTuk",
    "url": "https://lh3.googleusercontent.com/d/1vJNgqD0H1kakbcso-8l2HsmHaea0OTuk=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1vJNgqD0H1kakbcso-8l2HsmHaea0OTuk=w600",
    "driveUrl": "https://drive.google.com/file/d/1vJNgqD0H1kakbcso-8l2HsmHaea0OTuk/view?usp=drivesdk",
    "caption": "569279888 25427698850150008 885288553376472055 n",
    "date": "07/09/2026 14:22",
    "albumId": "thanh-xuan-2003-2006",
    "albumName": "Thời Niên Thiếu (2003 — 2006)",
    "driveFolderId": "1zr5W6Yy7k-eeJ2kVEviqE9Z0bUxVXOgo"
  },
  {
    "id": "17nTPfS_55_e6fRYJWB9H4XZ3PUtZJlCD",
    "url": "https://lh3.googleusercontent.com/d/17nTPfS_55_e6fRYJWB9H4XZ3PUtZJlCD=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/17nTPfS_55_e6fRYJWB9H4XZ3PUtZJlCD=w600",
    "driveUrl": "https://drive.google.com/file/d/17nTPfS_55_e6fRYJWB9H4XZ3PUtZJlCD/view?usp=drivesdk",
    "caption": "568461253 25427698870150006 3328890851937873153 n",
    "date": "07/09/2026 14:22",
    "albumId": "thanh-xuan-2003-2006",
    "albumName": "Thời Niên Thiếu (2003 — 2006)",
    "driveFolderId": "1zr5W6Yy7k-eeJ2kVEviqE9Z0bUxVXOgo"
  },
  {
    "id": "1-hYaSpZ2YuFQ6YegDouhnxs5UPzyLxDS",
    "url": "https://lh3.googleusercontent.com/d/1-hYaSpZ2YuFQ6YegDouhnxs5UPzyLxDS=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1-hYaSpZ2YuFQ6YegDouhnxs5UPzyLxDS=w600",
    "driveUrl": "https://drive.google.com/file/d/1-hYaSpZ2YuFQ6YegDouhnxs5UPzyLxDS/view?usp=drivesdk",
    "caption": "568958945 25427698953483331 796230735043202253 n",
    "date": "07/09/2026 14:22",
    "albumId": "thanh-xuan-2003-2006",
    "albumName": "Thời Niên Thiếu (2003 — 2006)",
    "driveFolderId": "1zr5W6Yy7k-eeJ2kVEviqE9Z0bUxVXOgo"
  },
  {
    "id": "1kitBBq66pBXRT_y9KlZ9kc1mjx1BqPyD",
    "url": "https://lh3.googleusercontent.com/d/1kitBBq66pBXRT_y9KlZ9kc1mjx1BqPyD=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1kitBBq66pBXRT_y9KlZ9kc1mjx1BqPyD=w600",
    "driveUrl": "https://drive.google.com/file/d/1kitBBq66pBXRT_y9KlZ9kc1mjx1BqPyD/view?usp=drivesdk",
    "caption": "568550900 25427698930150000 3725851553165042490 n",
    "date": "07/09/2026 14:22",
    "albumId": "thanh-xuan-2003-2006",
    "albumName": "Thời Niên Thiếu (2003 — 2006)",
    "driveFolderId": "1zr5W6Yy7k-eeJ2kVEviqE9Z0bUxVXOgo"
  },
  {
    "id": "1W2oTKnff98-_a5rVr-XRBDTpyutkQqKC",
    "url": "https://lh3.googleusercontent.com/d/1W2oTKnff98-_a5rVr-XRBDTpyutkQqKC=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1W2oTKnff98-_a5rVr-XRBDTpyutkQqKC=w600",
    "driveUrl": "https://drive.google.com/file/d/1W2oTKnff98-_a5rVr-XRBDTpyutkQqKC/view?usp=drivesdk",
    "caption": "569414997 25427698846816675 5023155042365671726 n",
    "date": "07/09/2026 14:20",
    "albumId": "thanh-xuan-2003-2006",
    "albumName": "Thời Niên Thiếu (2003 — 2006)",
    "driveFolderId": "1zr5W6Yy7k-eeJ2kVEviqE9Z0bUxVXOgo"
  },
  {
    "id": "1xKmYbaLFydr0VR26mARduTiMTq4s7bgJ",
    "url": "https://lh3.googleusercontent.com/d/1xKmYbaLFydr0VR26mARduTiMTq4s7bgJ=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1xKmYbaLFydr0VR26mARduTiMTq4s7bgJ=w600",
    "driveUrl": "https://drive.google.com/file/d/1xKmYbaLFydr0VR26mARduTiMTq4s7bgJ/view?usp=drivesdk",
    "caption": "569032834 25427698886816671 6964238627033919601 n",
    "date": "07/09/2026 14:20",
    "albumId": "thanh-xuan-2003-2006",
    "albumName": "Thời Niên Thiếu (2003 — 2006)",
    "driveFolderId": "1zr5W6Yy7k-eeJ2kVEviqE9Z0bUxVXOgo"
  },
  {
    "id": "1fgIFHatftP7loK7bZBM6yOCJEWhDDx0N",
    "url": "https://lh3.googleusercontent.com/d/1fgIFHatftP7loK7bZBM6yOCJEWhDDx0N=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1fgIFHatftP7loK7bZBM6yOCJEWhDDx0N=w600",
    "driveUrl": "https://drive.google.com/file/d/1fgIFHatftP7loK7bZBM6yOCJEWhDDx0N/view?usp=drivesdk",
    "caption": "568580679 25427698980149995 2528942899829108465 n",
    "date": "07/09/2026 14:20",
    "albumId": "thanh-xuan-2003-2006",
    "albumName": "Thời Niên Thiếu (2003 — 2006)",
    "driveFolderId": "1zr5W6Yy7k-eeJ2kVEviqE9Z0bUxVXOgo"
  },
  {
    "id": "1H-G7waxtCOiIEA_fqeujyRUXD8tVuD9j",
    "url": "https://lh3.googleusercontent.com/d/1H-G7waxtCOiIEA_fqeujyRUXD8tVuD9j=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1H-G7waxtCOiIEA_fqeujyRUXD8tVuD9j=w600",
    "driveUrl": "https://drive.google.com/file/d/1H-G7waxtCOiIEA_fqeujyRUXD8tVuD9j/view?usp=drivesdk",
    "caption": "569014762 25427698990149994 6107575324795489823 n",
    "date": "07/09/2026 14:20",
    "albumId": "thanh-xuan-2003-2006",
    "albumName": "Thời Niên Thiếu (2003 — 2006)",
    "driveFolderId": "1zr5W6Yy7k-eeJ2kVEviqE9Z0bUxVXOgo"
  },
  {
    "id": "12a5k7adTy9CxmOkpbB2k_A9vb8FDQ5fb",
    "url": "https://lh3.googleusercontent.com/d/12a5k7adTy9CxmOkpbB2k_A9vb8FDQ5fb=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/12a5k7adTy9CxmOkpbB2k_A9vb8FDQ5fb=w600",
    "driveUrl": "https://drive.google.com/file/d/12a5k7adTy9CxmOkpbB2k_A9vb8FDQ5fb/view?usp=drivesdk",
    "caption": "568647261 25427699213483305 2404001179269260586 n",
    "date": "07/09/2026 14:20",
    "albumId": "thanh-xuan-2003-2006",
    "albumName": "Thời Niên Thiếu (2003 — 2006)",
    "driveFolderId": "1zr5W6Yy7k-eeJ2kVEviqE9Z0bUxVXOgo"
  },
  {
    "id": "1GArsYh8IcMegJlFN2iTFrrLXMnn04x5L",
    "url": "https://lh3.googleusercontent.com/d/1GArsYh8IcMegJlFN2iTFrrLXMnn04x5L=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1GArsYh8IcMegJlFN2iTFrrLXMnn04x5L=w600",
    "driveUrl": "https://drive.google.com/file/d/1GArsYh8IcMegJlFN2iTFrrLXMnn04x5L/view?usp=drivesdk",
    "caption": "568477608 25427699000149993 7399702547866199340 n",
    "date": "07/09/2026 14:20",
    "albumId": "thanh-xuan-2003-2006",
    "albumName": "Thời Niên Thiếu (2003 — 2006)",
    "driveFolderId": "1zr5W6Yy7k-eeJ2kVEviqE9Z0bUxVXOgo"
  },
  {
    "id": "1rhb4x-AqHEojQCuc6xnaEiyRKQhAI7fI",
    "url": "https://lh3.googleusercontent.com/d/1rhb4x-AqHEojQCuc6xnaEiyRKQhAI7fI=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1rhb4x-AqHEojQCuc6xnaEiyRKQhAI7fI=w600",
    "driveUrl": "https://drive.google.com/file/d/1rhb4x-AqHEojQCuc6xnaEiyRKQhAI7fI/view?usp=drivesdk",
    "caption": "568410051 25427698866816673 2671118570767665667 n",
    "date": "07/09/2026 14:19",
    "albumId": "thanh-xuan-2003-2006",
    "albumName": "Thời Niên Thiếu (2003 — 2006)",
    "driveFolderId": "1zr5W6Yy7k-eeJ2kVEviqE9Z0bUxVXOgo"
  },
  {
    "id": "1DgLheotSEaY8Elguz6C-9ELv83ZWsk0B",
    "url": "https://lh3.googleusercontent.com/d/1DgLheotSEaY8Elguz6C-9ELv83ZWsk0B=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1DgLheotSEaY8Elguz6C-9ELv83ZWsk0B=w600",
    "driveUrl": "https://drive.google.com/file/d/1DgLheotSEaY8Elguz6C-9ELv83ZWsk0B/view?usp=drivesdk",
    "caption": "568916889 25427699006816659 3087752054251687335 n",
    "date": "07/09/2026 14:19",
    "albumId": "thanh-xuan-2003-2006",
    "albumName": "Thời Niên Thiếu (2003 — 2006)",
    "driveFolderId": "1zr5W6Yy7k-eeJ2kVEviqE9Z0bUxVXOgo"
  },
  {
    "id": "15Y7EUSibVURczn5ACyHACR9R5wyze5Ar",
    "url": "https://lh3.googleusercontent.com/d/15Y7EUSibVURczn5ACyHACR9R5wyze5Ar=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/15Y7EUSibVURczn5ACyHACR9R5wyze5Ar=w600",
    "driveUrl": "https://drive.google.com/file/d/15Y7EUSibVURczn5ACyHACR9R5wyze5Ar/view?usp=drivesdk",
    "caption": "568638419 25427698940149999 1402577002769121704 n",
    "date": "07/09/2026 14:19",
    "albumId": "thanh-xuan-2003-2006",
    "albumName": "Thời Niên Thiếu (2003 — 2006)",
    "driveFolderId": "1zr5W6Yy7k-eeJ2kVEviqE9Z0bUxVXOgo"
  },
  {
    "id": "1aY8eo6a1heLuw034pLpDQsYKMMfuLc51",
    "url": "https://lh3.googleusercontent.com/d/1aY8eo6a1heLuw034pLpDQsYKMMfuLc51=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1aY8eo6a1heLuw034pLpDQsYKMMfuLc51=w600",
    "driveUrl": "https://drive.google.com/file/d/1aY8eo6a1heLuw034pLpDQsYKMMfuLc51/view?usp=drivesdk",
    "caption": "554971995 32660542940203212 2424085129544350643 n",
    "date": "05/09/2026 09:15",
    "albumId": "thanh-xuan-2003-2006",
    "albumName": "Thời Niên Thiếu (2003 — 2006)",
    "driveFolderId": "1zr5W6Yy7k-eeJ2kVEviqE9Z0bUxVXOgo"
  },
  {
    "id": "1vnBrGEC8nLBJAxg_9PxK7phhOEHlL94-",
    "url": "https://lh3.googleusercontent.com/d/1vnBrGEC8nLBJAxg_9PxK7phhOEHlL94-=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1vnBrGEC8nLBJAxg_9PxK7phhOEHlL94-=w600",
    "driveUrl": "https://drive.google.com/file/d/1vnBrGEC8nLBJAxg_9PxK7phhOEHlL94-/view?usp=drivesdk",
    "caption": "648357832 10226146414361480 3833201303384509491 n",
    "date": "05/09/2026 09:15",
    "albumId": "thanh-xuan-2003-2006",
    "albumName": "Thời Niên Thiếu (2003 — 2006)",
    "driveFolderId": "1zr5W6Yy7k-eeJ2kVEviqE9Z0bUxVXOgo"
  },
  {
    "id": "1U8SINXpF1ylZgufQEvmavVzhhNkD_fD2",
    "url": "https://lh3.googleusercontent.com/d/1U8SINXpF1ylZgufQEvmavVzhhNkD_fD2=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1U8SINXpF1ylZgufQEvmavVzhhNkD_fD2=w600",
    "driveUrl": "https://drive.google.com/file/d/1U8SINXpF1ylZgufQEvmavVzhhNkD_fD2/view?usp=drivesdk",
    "caption": "506460880 29829890076657001 4142235106235955816 n",
    "date": "05/09/2026 09:14",
    "albumId": "thanh-xuan-2003-2006",
    "albumName": "Thời Niên Thiếu (2003 — 2006)",
    "driveFolderId": "1zr5W6Yy7k-eeJ2kVEviqE9Z0bUxVXOgo"
  },
  {
    "id": "1MYnJ8FSiIFJ7PBXE02xPee9Ls_BOTt2o",
    "url": "https://lh3.googleusercontent.com/d/1MYnJ8FSiIFJ7PBXE02xPee9Ls_BOTt2o=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1MYnJ8FSiIFJ7PBXE02xPee9Ls_BOTt2o=w600",
    "driveUrl": "https://drive.google.com/file/d/1MYnJ8FSiIFJ7PBXE02xPee9Ls_BOTt2o/view?usp=drivesdk",
    "caption": "511009035 30602990642625346 2880448722037149222 n",
    "date": "05/09/2026 09:13",
    "albumId": "thanh-xuan-2003-2006",
    "albumName": "Thời Niên Thiếu (2003 — 2006)",
    "driveFolderId": "1zr5W6Yy7k-eeJ2kVEviqE9Z0bUxVXOgo"
  },
  {
    "id": "1BX0d3-lLRGmAC6cMmzlh3x5jU4TFBOju",
    "url": "https://lh3.googleusercontent.com/d/1BX0d3-lLRGmAC6cMmzlh3x5jU4TFBOju=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1BX0d3-lLRGmAC6cMmzlh3x5jU4TFBOju=w600",
    "driveUrl": "https://drive.google.com/file/d/1BX0d3-lLRGmAC6cMmzlh3x5jU4TFBOju/view?usp=drivesdk",
    "caption": "511330109 3855424527936875 8908743723824579465 n",
    "date": "05/09/2026 09:12",
    "albumId": "thanh-xuan-2003-2006",
    "albumName": "Thời Niên Thiếu (2003 — 2006)",
    "driveFolderId": "1zr5W6Yy7k-eeJ2kVEviqE9Z0bUxVXOgo"
  },
  {
    "id": "1q2hYgMI9dxvzLMwtlji3BiGQC8RNPUTE",
    "url": "https://lh3.googleusercontent.com/d/1q2hYgMI9dxvzLMwtlji3BiGQC8RNPUTE=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1q2hYgMI9dxvzLMwtlji3BiGQC8RNPUTE=w600",
    "driveUrl": "https://drive.google.com/file/d/1q2hYgMI9dxvzLMwtlji3BiGQC8RNPUTE/view?usp=drivesdk",
    "caption": "513896040 24325259480400973 6935572474755808817 n",
    "date": "05/09/2026 09:11",
    "albumId": "thanh-xuan-2003-2006",
    "albumName": "Thời Niên Thiếu (2003 — 2006)",
    "driveFolderId": "1zr5W6Yy7k-eeJ2kVEviqE9Z0bUxVXOgo"
  },
  {
    "id": "1cMx_JjIqNrQ5pbUqPq20iSLjdvQYtvJ9",
    "url": "https://lh3.googleusercontent.com/d/1cMx_JjIqNrQ5pbUqPq20iSLjdvQYtvJ9=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1cMx_JjIqNrQ5pbUqPq20iSLjdvQYtvJ9=w600",
    "driveUrl": "https://drive.google.com/file/d/1cMx_JjIqNrQ5pbUqPq20iSLjdvQYtvJ9/view?usp=drivesdk",
    "caption": "514954212 24325259277067660 1271437142121605245 n",
    "date": "05/09/2026 09:11",
    "albumId": "thanh-xuan-2003-2006",
    "albumName": "Thời Niên Thiếu (2003 — 2006)",
    "driveFolderId": "1zr5W6Yy7k-eeJ2kVEviqE9Z0bUxVXOgo"
  },
  {
    "id": "1f7-mNBmcPwOUILmRCMcNWaGTNB53-AiX",
    "url": "https://lh3.googleusercontent.com/d/1f7-mNBmcPwOUILmRCMcNWaGTNB53-AiX=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1f7-mNBmcPwOUILmRCMcNWaGTNB53-AiX=w600",
    "driveUrl": "https://drive.google.com/file/d/1f7-mNBmcPwOUILmRCMcNWaGTNB53-AiX/view?usp=drivesdk",
    "caption": "515121447 24325259427067645 1046997780096707513 n",
    "date": "05/09/2026 09:11",
    "albumId": "thanh-xuan-2003-2006",
    "albumName": "Thời Niên Thiếu (2003 — 2006)",
    "driveFolderId": "1zr5W6Yy7k-eeJ2kVEviqE9Z0bUxVXOgo"
  },
  {
    "id": "1kDcjDx3TsDAAVvD7WiVQrSaMvHR2B4zQ",
    "url": "https://lh3.googleusercontent.com/d/1kDcjDx3TsDAAVvD7WiVQrSaMvHR2B4zQ=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1kDcjDx3TsDAAVvD7WiVQrSaMvHR2B4zQ=w600",
    "driveUrl": "https://drive.google.com/file/d/1kDcjDx3TsDAAVvD7WiVQrSaMvHR2B4zQ/view?usp=drivesdk",
    "caption": "514405511 24325259380400983 3852819756365493424 n",
    "date": "05/09/2026 09:11",
    "albumId": "thanh-xuan-2003-2006",
    "albumName": "Thời Niên Thiếu (2003 — 2006)",
    "driveFolderId": "1zr5W6Yy7k-eeJ2kVEviqE9Z0bUxVXOgo"
  },
  {
    "id": "11IHAtRXKJv5PNztmdEuGX3p34e7zMWrS",
    "url": "https://lh3.googleusercontent.com/d/11IHAtRXKJv5PNztmdEuGX3p34e7zMWrS=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/11IHAtRXKJv5PNztmdEuGX3p34e7zMWrS=w600",
    "driveUrl": "https://drive.google.com/file/d/11IHAtRXKJv5PNztmdEuGX3p34e7zMWrS/view?usp=drivesdk",
    "caption": "514374652 24325259297067658 8532392626940600440 n",
    "date": "05/09/2026 09:11",
    "albumId": "thanh-xuan-2003-2006",
    "albumName": "Thời Niên Thiếu (2003 — 2006)",
    "driveFolderId": "1zr5W6Yy7k-eeJ2kVEviqE9Z0bUxVXOgo"
  },
  {
    "id": "1LlaKj-K5AKiHwvt0rnh0BlXlnuklYJQZ",
    "url": "https://lh3.googleusercontent.com/d/1LlaKj-K5AKiHwvt0rnh0BlXlnuklYJQZ=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1LlaKj-K5AKiHwvt0rnh0BlXlnuklYJQZ=w600",
    "driveUrl": "https://drive.google.com/file/d/1LlaKj-K5AKiHwvt0rnh0BlXlnuklYJQZ/view?usp=drivesdk",
    "caption": "513898701 24325259320400989 3468692801592186009 n",
    "date": "05/09/2026 09:11",
    "albumId": "thanh-xuan-2003-2006",
    "albumName": "Thời Niên Thiếu (2003 — 2006)",
    "driveFolderId": "1zr5W6Yy7k-eeJ2kVEviqE9Z0bUxVXOgo"
  },
  {
    "id": "15c5vvg8SW44Zv9YyDCEb3ZNYSFWJRHjE",
    "url": "https://lh3.googleusercontent.com/d/15c5vvg8SW44Zv9YyDCEb3ZNYSFWJRHjE=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/15c5vvg8SW44Zv9YyDCEb3ZNYSFWJRHjE=w600",
    "driveUrl": "https://drive.google.com/file/d/15c5vvg8SW44Zv9YyDCEb3ZNYSFWJRHjE/view?usp=drivesdk",
    "caption": "514374655 24325259213734333 978284759044515201 n",
    "date": "05/09/2026 09:11",
    "albumId": "thanh-xuan-2003-2006",
    "albumName": "Thời Niên Thiếu (2003 — 2006)",
    "driveFolderId": "1zr5W6Yy7k-eeJ2kVEviqE9Z0bUxVXOgo"
  },
  {
    "id": "1vyq_e7kQ7erqR67_xNZNQDDlqzMGjbJg",
    "url": "https://lh3.googleusercontent.com/d/1vyq_e7kQ7erqR67_xNZNQDDlqzMGjbJg=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1vyq_e7kQ7erqR67_xNZNQDDlqzMGjbJg=w600",
    "driveUrl": "https://drive.google.com/file/d/1vyq_e7kQ7erqR67_xNZNQDDlqzMGjbJg/view?usp=drivesdk",
    "caption": "515593345 24325259387067649 1247523544945188133 n",
    "date": "05/09/2026 09:11",
    "albumId": "thanh-xuan-2003-2006",
    "albumName": "Thời Niên Thiếu (2003 — 2006)",
    "driveFolderId": "1zr5W6Yy7k-eeJ2kVEviqE9Z0bUxVXOgo"
  },
  {
    "id": "1oKY0PdU3uys-JJ-yQ1w9BcQlcRx6lLCQ",
    "url": "https://lh3.googleusercontent.com/d/1oKY0PdU3uys-JJ-yQ1w9BcQlcRx6lLCQ=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1oKY0PdU3uys-JJ-yQ1w9BcQlcRx6lLCQ=w600",
    "driveUrl": "https://drive.google.com/file/d/1oKY0PdU3uys-JJ-yQ1w9BcQlcRx6lLCQ/view?usp=drivesdk",
    "caption": "566388636 24935157649469681 6276832814599423669 n",
    "date": "05/09/2026 09:10",
    "albumId": "thanh-xuan-2003-2006",
    "albumName": "Thời Niên Thiếu (2003 — 2006)",
    "driveFolderId": "1zr5W6Yy7k-eeJ2kVEviqE9Z0bUxVXOgo"
  },
  {
    "id": "1UmuSDOZalvtoEuFjUVWQBME3__SlnA9h",
    "url": "https://lh3.googleusercontent.com/d/1UmuSDOZalvtoEuFjUVWQBME3__SlnA9h=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1UmuSDOZalvtoEuFjUVWQBME3__SlnA9h=w600",
    "driveUrl": "https://drive.google.com/file/d/1UmuSDOZalvtoEuFjUVWQBME3__SlnA9h/view?usp=drivesdk",
    "caption": "640949231 26726866320232674 2861436457150474237 n",
    "date": "05/09/2026 09:06",
    "albumId": "thanh-xuan-2003-2006",
    "albumName": "Thời Niên Thiếu (2003 — 2006)",
    "driveFolderId": "1zr5W6Yy7k-eeJ2kVEviqE9Z0bUxVXOgo"
  },
  {
    "id": "10yxWan1g7TlbvA1WYiu-lQ8KJMW5zy3K",
    "url": "https://lh3.googleusercontent.com/d/10yxWan1g7TlbvA1WYiu-lQ8KJMW5zy3K=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/10yxWan1g7TlbvA1WYiu-lQ8KJMW5zy3K=w600",
    "driveUrl": "https://drive.google.com/file/d/10yxWan1g7TlbvA1WYiu-lQ8KJMW5zy3K/view?usp=drivesdk",
    "caption": "501748380 3818279548318040 4488756202888224625 n",
    "date": "05/09/2026 09:06",
    "albumId": "thanh-xuan-2003-2006",
    "albumName": "Thời Niên Thiếu (2003 — 2006)",
    "driveFolderId": "1zr5W6Yy7k-eeJ2kVEviqE9Z0bUxVXOgo"
  },
  {
    "id": "1c3pxxcTskjZqjjPkdVL7b3d6QdpWSDdO",
    "url": "https://lh3.googleusercontent.com/d/1c3pxxcTskjZqjjPkdVL7b3d6QdpWSDdO=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1c3pxxcTskjZqjjPkdVL7b3d6QdpWSDdO=w600",
    "driveUrl": "https://drive.google.com/file/d/1c3pxxcTskjZqjjPkdVL7b3d6QdpWSDdO/view?usp=drivesdk",
    "caption": "502689037 3823147487831246 7655701400069318099 n",
    "date": "05/09/2026 09:06",
    "albumId": "thanh-xuan-2003-2006",
    "albumName": "Thời Niên Thiếu (2003 — 2006)",
    "driveFolderId": "1zr5W6Yy7k-eeJ2kVEviqE9Z0bUxVXOgo"
  },
  {
    "id": "1URalctfUl30SRVtpmboOz6lkaMYvAi4C",
    "url": "https://lh3.googleusercontent.com/d/1URalctfUl30SRVtpmboOz6lkaMYvAi4C=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1URalctfUl30SRVtpmboOz6lkaMYvAi4C=w600",
    "driveUrl": "https://drive.google.com/file/d/1URalctfUl30SRVtpmboOz6lkaMYvAi4C/view?usp=drivesdk",
    "caption": "507453999 24185686561024933 8941559406477211526 n",
    "date": "05/09/2026 09:05",
    "albumId": "thanh-xuan-2003-2006",
    "albumName": "Thời Niên Thiếu (2003 — 2006)",
    "driveFolderId": "1zr5W6Yy7k-eeJ2kVEviqE9Z0bUxVXOgo"
  }
];

// Danh sách video kỷ niệm chính thức lớp K8A1 (đồng bộ 2 chiều với Google Sheet tab Media_Cai_Dat)
export const DEFAULT_VIDEOS: MemoryVideo[] = [
  {
    id: "vid-1788596300181",
    title: "Kỷ niệm thời cấp 3 - K8A1(9)",
    embedUrl: "https://www.youtube.com/embed/qOwNuWY30iw"
  },
  {
    id: "vid-1788596273398",
    title: "Kỷ niệm thời cấp 3 - K8A1(8)",
    embedUrl: "https://www.youtube.com/embed/KNLrdmy_Hvk"
  },
  {
    id: "vid-1788596247429",
    title: "Kỷ niệm thời cấp 3 - K8A1(7)",
    embedUrl: "https://www.youtube.com/embed/ga68cDkrSDo"
  },
  {
    id: "vid-1788596221141",
    title: "Kỷ niệm thời cấp 3 - K8A1(6)",
    embedUrl: "https://www.youtube.com/embed/UX9N3P3yks4"
  },
  {
    id: "vid-1788596163830",
    title: "Kỷ niệm thời cấp 3 - K8A1(5)",
    embedUrl: "https://www.youtube.com/embed/Q0dmNCGbaXs"
  },
  {
    id: "vid-1788596109463",
    title: "Kỷ niệm thời cấp 3 - K8A1(4)",
    embedUrl: "https://www.youtube.com/embed/VHT6ouvKj_Q"
  },
  {
    id: "vid-1788596080960",
    title: "Kỷ niệm thời cấp 3 - K8A1(3)",
    embedUrl: "https://www.youtube.com/embed/Reuz6pHIgGM"
  },
  {
    id: "vid-1788596059982",
    title: "Kỷ niệm thời cấp 3 - K8A1(2)",
    embedUrl: "https://www.youtube.com/embed/Z0R73khjwfg"
  },
  {
    id: "vid-1788595395834",
    title: "Kỷ niệm thời cấp 3 - K8A1(1)",
    embedUrl: "https://www.youtube.com/embed/HyCIkhbalPk"
  }
];

// ============================================================================
// DANH MỤC & DỮ LIỆU SỔ QUỸ THU - CHI LỚP K8A1 (CHUẨN THEO QUY CHẾ ĐIỀU 3 & 4)
// ============================================================================

export interface ExpenseCategoryMeta {
  id: ExpenseCategory;
  label: string;
  shortLabel: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  description: string;
}

export const EXPENSE_CATEGORIES: ExpenseCategoryMeta[] = [
  {
    id: 'care',
    label: 'Hiếu Hỷ & Thăm Hỏi',
    shortLabel: 'Hiếu hỷ',
    badgeBg: 'bg-rose-50',
    badgeText: 'text-rose-700',
    badgeBorder: 'border-rose-200',
    description: 'Thăm viếng tứ thân phụ mẫu (500k), thăm hỏi ốm đau/tai nạn (300k), việc hỷ theo Quy chế'
  },
  {
    id: 'teacher',
    label: 'Tri Ân Thầy Cô',
    shortLabel: 'Tri ân',
    badgeBg: 'bg-purple-50',
    badgeText: 'text-purple-700',
    badgeBorder: 'border-purple-200',
    description: 'Hoa tươi & quà tặng tri ân các thầy cô giáo cũ dịp 20/11, Tết Nguyên Đán, ngày họp lớp'
  },
  {
    id: 'party',
    label: 'Tiệc & Sự Kiện Gặp Mặt',
    shortLabel: 'Tiệc & Sự kiện',
    badgeBg: 'bg-emerald-50',
    badgeText: 'text-emerald-800',
    badgeBorder: 'border-emerald-200',
    description: 'Đặt cọc & thanh toán tiệc Crown Palace, ẩm thực, đồ uống, liên hoan gặp mặt định kỳ'
  },
  {
    id: 'souvenir',
    label: 'Đồng Phục & Kỷ Niệm',
    shortLabel: 'Đồng phục & Quà',
    badgeBg: 'bg-blue-50',
    badgeText: 'text-blue-700',
    badgeBorder: 'border-blue-200',
    description: 'Áo polo đồng phục 20 năm K8A1, thẻ cựu học sinh kỷ niệm, quà lưu niệm'
  },
  {
    id: 'media',
    label: 'Sân Khấu & Truyền Thông',
    shortLabel: 'Sân khấu & Media',
    badgeBg: 'bg-amber-50',
    badgeText: 'text-amber-800',
    badgeBorder: 'border-amber-200',
    description: 'In ấn backdrop sân khấu, âm thanh ánh sáng, quay chụp phóng sự kỷ niệm, duy trì webapp'
  },
  {
    id: 'other',
    label: 'Chi Khác & Dự Phòng',
    shortLabel: 'Khác',
    badgeBg: 'bg-slate-100',
    badgeText: 'text-slate-700',
    badgeBorder: 'border-slate-200',
    description: 'Nước suối, đạo cụ trò chơi, chi phí phát sinh chuẩn bị'
  }
];

export interface IncomeCategoryMeta {
  id: IncomeCategory;
  label: string;
  shortLabel: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  icon: string;
  defaultAmount?: number;
  description: string;
  quickTitle: string;
}

export const INCOME_CATEGORIES: IncomeCategoryMeta[] = [
  {
    id: 'event',
    label: 'Quỹ Họp Lớp 20 Năm',
    shortLabel: 'Quỹ 20 năm',
    badgeBg: 'bg-emerald-50',
    badgeText: 'text-emerald-800',
    badgeBorder: 'border-emerald-200',
    icon: '🎓',
    defaultAmount: 700000,
    description: 'Đóng quỹ tham gia ngày hội ngộ 20 năm (định mức chuẩn 700.000đ/bạn tham dự)',
    quickTitle: 'Đóng quỹ họp lớp kỷ niệm 20 năm K8A1'
  },
  {
    id: 'sponsor',
    label: 'Tài Trợ & Ủng Hộ Lớp',
    shortLabel: 'Tài trợ / Ủng hộ',
    badgeBg: 'bg-amber-50',
    badgeText: 'text-amber-800',
    badgeBorder: 'border-amber-200',
    icon: '💎',
    defaultAmount: 1000000,
    description: 'Mạnh thường quân, bạn bè và gia đình đóng góp tài trợ thêm để ngày vui thêm chu toàn',
    quickTitle: 'Tài trợ & ủng hộ quỹ lớp K8A1'
  },
  {
    id: 'extra_shirt',
    label: 'Mua Thêm Áo Polo',
    shortLabel: 'Mua thêm áo',
    badgeBg: 'bg-blue-50',
    badgeText: 'text-blue-700',
    badgeBorder: 'border-blue-200',
    icon: '👕',
    defaultAmount: 150000,
    description: 'Đăng ký may thêm áo polo đồng phục 20 năm cho vợ/chồng/con cái/người thân',
    quickTitle: 'Mua thêm áo polo đồng phục K8A1'
  },
  {
    id: 'guest',
    label: 'Người Thân / F1 Đi Kèm',
    shortLabel: 'Người thân đi kèm',
    badgeBg: 'bg-rose-50',
    badgeText: 'text-rose-700',
    badgeBorder: 'border-rose-200',
    icon: '👨‍👩‍👧',
    defaultAmount: 350000,
    description: 'Kinh phí suất ăn và đồ uống cho phu huynh, con nhỏ đi tham dự cùng',
    quickTitle: 'Đóng kinh phí người thân / F1 đi kèm'
  },
  {
    id: 'teacher_tribute',
    label: 'Quỹ Tri Ân Thầy Cô',
    shortLabel: 'Tri ân thầy cô',
    badgeBg: 'bg-purple-50',
    badgeText: 'text-purple-700',
    badgeBorder: 'border-purple-200',
    icon: '💐',
    defaultAmount: 500000,
    description: 'Khoản đóng góp riêng để chuẩn bị hoa tươi, quà tặng kỷ niệm tri ân thầy cô giáo cũ',
    quickTitle: 'Đóng góp Quỹ tri ân Thầy Cô giáo'
  },
  {
    id: 'alumni_care',
    label: 'Quỹ Tình Nghĩa & Thăm Hỏi',
    shortLabel: 'Tình nghĩa K8A1',
    badgeBg: 'bg-indigo-50',
    badgeText: 'text-indigo-800',
    badgeBorder: 'border-indigo-200',
    icon: '❤️',
    defaultAmount: 500000,
    description: 'Quỹ tương trợ, thăm hỏi bạn bè lúc đau ốm, việc hiếu hỷ theo Quy chế tổ chức',
    quickTitle: 'Đóng góp Quỹ tình nghĩa & thăm hỏi K8A1'
  },
  {
    id: 'annual',
    label: 'Quỹ Lớp Thường Niên',
    shortLabel: 'Quỹ thường niên',
    badgeBg: 'bg-teal-50',
    badgeText: 'text-teal-800',
    badgeBorder: 'border-teal-200',
    icon: '📅',
    defaultAmount: 100000,
    description: 'Quỹ hoạt động thường niên 100.000 đ/người/năm theo Điều 4 Quy chế tổ chức',
    quickTitle: 'Đóng quỹ lớp thường niên theo Quy chế'
  },
  {
    id: 'other_income',
    label: 'Khoản Thu Khác & Vãng Lai',
    shortLabel: 'Thu khác',
    badgeBg: 'bg-slate-100',
    badgeText: 'text-slate-700',
    badgeBorder: 'border-slate-200',
    icon: '📦',
    defaultAmount: 500000,
    description: 'Lãi tiền gửi ngân hàng, số dư chuyển kỳ trước, hoặc các khoản thu phát sinh ngoài kế hoạch',
    quickTitle: 'Ghi nhận khoản thu khác'
  }
];

export const INITIAL_INCOMES_LIST: IncomeItem[] = [];

export const INITIAL_EXPENSES_LIST: ExpenseItem[] = [];

export const SPONSORS_LIST: SponsorItem[] = [];

export interface BankItem {
  code: string;       // VietQR identifier / short code
  bin: string;        // 6-digit Napas BIN
  shortName: string;  // Display name short (e.g. MB Bank, Vietcombank)
  name: string;       // Official full name
  aliases: string[];  // Synonyms for search & matching
}

export const VIETNAM_BANKS: BankItem[] = [
  {
    code: 'vietcombank',
    bin: '970436',
    shortName: 'Vietcombank (VCB)',
    name: 'Ngân hàng Ngoại thương Việt Nam',
    aliases: ['vcb', 'vietcombank', 'ngoai thuong', '970436']
  },
  {
    code: 'mbbank',
    bin: '970422',
    shortName: 'MB Bank (Quân Đội)',
    name: 'Ngân hàng Quân Đội',
    aliases: ['mb', 'mbbank', 'quan doi', 'mb bank', '970422']
  },
  {
    code: 'techcombank',
    bin: '970407',
    shortName: 'Techcombank (TCB)',
    name: 'Ngân hàng Kỹ Thương Việt Nam',
    aliases: ['tcb', 'techcombank', 'ky thuong', 'techcom', '970407']
  },
  {
    code: 'vietinbank',
    bin: '970415',
    shortName: 'VietinBank (CTG)',
    name: 'Ngân hàng Công Thương Việt Nam',
    aliases: ['icb', 'ctg', 'vietinbank', 'vietin', 'cong thuong', '970415']
  },
  {
    code: 'bidv',
    bin: '970418',
    shortName: 'BIDV',
    name: 'Ngân hàng Đầu tư và Phát triển Việt Nam',
    aliases: ['bidv', 'dau tu va phat trien', '970418']
  },
  {
    code: 'agribank',
    bin: '970405',
    shortName: 'Agribank (VBA)',
    name: 'Ngân hàng Nông nghiệp & PT Nông thôn Việt Nam',
    aliases: ['vba', 'agr', 'agribank', 'nong nghiep', '970405']
  },
  {
    code: 'vpbank',
    bin: '970432',
    shortName: 'VPBank (VPB)',
    name: 'Ngân hàng Việt Nam Thịnh Vượng',
    aliases: ['vpb', 'vpbank', 'thinh vuong', '970432']
  },
  {
    code: 'tpbank',
    bin: '970423',
    shortName: 'TPBank (TPB)',
    name: 'Ngân hàng Tiên Phong',
    aliases: ['tpb', 'tpbank', 'tien phong', '970423']
  },
  {
    code: 'acb',
    bin: '970416',
    shortName: 'ACB (Á Châu)',
    name: 'Ngân hàng TMCP Á Châu',
    aliases: ['acb', 'a chau', '970416']
  },
  {
    code: 'sacombank',
    bin: '970403',
    shortName: 'Sacombank (STB)',
    name: 'Ngân hàng Sài Gòn Thương Tín',
    aliases: ['stb', 'sacombank', 'sai gon thuong tin', 'sacom', '970403']
  },
  {
    code: 'hdbank',
    bin: '970437',
    shortName: 'HDBank (HDB)',
    name: 'Ngân hàng Phát triển TP.HCM',
    aliases: ['hdb', 'hdbank', '970437']
  },
  {
    code: 'vib',
    bin: '970441',
    shortName: 'VIB (Quốc Tế)',
    name: 'Ngân hàng Quốc Tế Việt Nam',
    aliases: ['vib', 'quoc te', '970441']
  },
  {
    code: 'shb',
    bin: '970443',
    shortName: 'SHB',
    name: 'Ngân hàng Sài Gòn - Hà Nội',
    aliases: ['shb', 'sai gon ha noi', '970443']
  },
  {
    code: 'ocb',
    bin: '970448',
    shortName: 'OCB (Phương Đông)',
    name: 'Ngân hàng Phương Đông',
    aliases: ['ocb', 'phuong dong', '970448']
  },
  {
    code: 'msb',
    bin: '970426',
    shortName: 'MSB (Hàng Hải)',
    name: 'Ngân hàng Hàng Hải Việt Nam',
    aliases: ['msb', 'hang hai', 'maritime', '970426']
  },
  {
    code: 'lienvietpostbank',
    bin: '970449',
    shortName: 'LPBank (Lộc Phát)',
    name: 'Ngân hàng TMCP Lộc Phát Việt Nam',
    aliases: ['lpb', 'lpbank', 'loc phat', 'lienvietpostbank', 'lien viet', '970449']
  },
  {
    code: 'seabank',
    bin: '970440',
    shortName: 'SeABank (Đông Nam Á)',
    name: 'Ngân hàng Đông Nam Á',
    aliases: ['seabank', 'seab', 'dong nam a', '970440']
  },
  {
    code: 'namabank',
    bin: '970428',
    shortName: 'Nam A Bank (NAB)',
    name: 'Ngân hàng Nam Á',
    aliases: ['nab', 'nam a', 'namabank', '970428']
  },
  {
    code: 'abbank',
    bin: '970425',
    shortName: 'ABBANK (An Bình)',
    name: 'Ngân hàng An Bình',
    aliases: ['abb', 'abbank', 'an binh', '970425']
  },
  {
    code: 'bacabank',
    bin: '970409',
    shortName: 'Bac A Bank (Bắc Á)',
    name: 'Ngân hàng Bắc Á',
    aliases: ['bab', 'bac a', 'bacabank', '970409']
  },
  {
    code: 'baovietbank',
    bin: '970438',
    shortName: 'BaoViet Bank (Bảo Việt)',
    name: 'Ngân hàng Bảo Việt',
    aliases: ['bvb', 'baoviet', 'baovietbank', 'bao viet', '970438']
  },
  {
    code: 'vietabank',
    bin: '970427',
    shortName: 'VietABank (Việt Á)',
    name: 'Ngân hàng Việt Á',
    aliases: ['vab', 'vieta', 'vietabank', 'viet a', '970427']
  },
  {
    code: 'kienlongbank',
    bin: '970452',
    shortName: 'KienlongBank (Kiên Long)',
    name: 'Ngân hàng Kiên Long',
    aliases: ['klb', 'kienlong', 'kienlongbank', 'kien long', '970452']
  },
  {
    code: 'pgbank',
    bin: '970430',
    shortName: 'PGBank (Xăng Dầu)',
    name: 'Ngân hàng TMCP Thịnh Vượng và Phát triển',
    aliases: ['pgb', 'pgbank', 'xang dau', '970430']
  },
  {
    code: 'cake',
    bin: '546034',
    shortName: 'Cake by VPBank',
    name: 'Ngân hàng số Cake by VPBank',
    aliases: ['cake', 'cake by vpbank', '546034']
  },
  {
    code: 'timo',
    bin: '963388',
    shortName: 'Timo by BVBank',
    name: 'Ngân hàng số Timo',
    aliases: ['timo', 'timo plus', '963388']
  },
  {
    code: 'viettelmoney',
    bin: '971005',
    shortName: 'Viettel Money',
    name: 'Tổng Công ty Dịch vụ Số Viettel',
    aliases: ['viettelmoney', 'viettel pay', 'viettel', '971005']
  },
  {
    code: 'vnptmoney',
    bin: '971011',
    shortName: 'VNPT Money',
    name: 'Tập đoàn Bưu chính Viễn thông Việt Nam',
    aliases: ['vnptmoney', 'vnpt pay', 'vnpt', '971011']
  },
  {
    code: 'shinhan',
    bin: '970424',
    shortName: 'Shinhan Bank Việt Nam',
    name: 'Ngân hàng TNHH MTV Shinhan Việt Nam',
    aliases: ['shinhan', 'shinhanbank', 'shbvn', '970424']
  },
  {
    code: 'wooribank',
    bin: '970457',
    shortName: 'Woori Bank Việt Nam',
    name: 'Ngân hàng TNHH MTV Woori Việt Nam',
    aliases: ['woori', 'wooribank', '970457']
  },
  {
    code: 'publicbank',
    bin: '970439',
    shortName: 'Public Bank Việt Nam',
    name: 'Ngân hàng TNHH MTV Public Việt Nam',
    aliases: ['pbvn', 'publicbank', 'public', '970439']
  }
];

/**
 * Tìm mã ngân hàng VietQR theo tên hoặc alias
 */
export function resolveBankCode(bankInput?: any): string {
  if (bankInput === null || bankInput === undefined) return 'vietcombank';
  const clean = String(bankInput).toLowerCase().trim();
  
  // 1. Khớp mã định danh hoặc BIN
  const direct = VIETNAM_BANKS.find(b => b.code.toLowerCase() === clean || b.bin === clean);
  if (direct) return direct.code;

  // 2. Khớp alias
  const byAlias = VIETNAM_BANKS.find(b => 
    b.aliases.some(alias => clean.includes(alias) || alias === clean)
  );
  if (byAlias) return byAlias.code;

  // 3. Khớp tên ngân hàng
  const byName = VIETNAM_BANKS.find(b => 
    clean.includes(b.shortName.toLowerCase()) || clean.includes(b.name.toLowerCase())
  );
  if (byName) return byName.code;

  return 'vietcombank';
}

/**
 * Chuẩn hóa chuỗi text sang chuẩn Napas / VietQR EMVCo Tag 62:
 * - Loại bỏ dấu tiếng Việt (NFD)
 * - Loại bỏ các ký tự đặc biệt [ ] { } < > # % @ $ ^ & * ( ) = + \\ / | ~ ` " ' ; : , . ? !
 * - Giữ lại chữ cái, số và dấu cách
 * - Chuyển sang chữ IN HOA
 * - Giới hạn tối đa 50 ký tự để không tràn buffer Napas
 */
export function sanitizeVietQrText(text?: any): string {
  if (text === null || text === undefined) return '';
  return String(text)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'D')
    .replace(/[^a-zA-Z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toUpperCase()
    .slice(0, 50);
}

export interface ShirtSizeOption {
  value: string;
  label: string;
  weightHint: string;
  shoulder: string;
  width: string;
  length: string;
}

/**
 * Bảng kích cỡ áo đồng phục polo Họp lớp 20 năm K8A1 chuẩn hóa theo bảng xưởng may (Người lớn)
 * S:    Vai 35cm | Rộng 41cm | Dài 55cm | 35kg - 45kg
 * M:    Vai 37cm | Rộng 44cm | Dài 59cm | 45kg - 55kg
 * L:    Vai 39cm | Rộng 47cm | Dài 63cm | 55kg - 65kg
 * XL:   Vai 41cm | Rộng 49cm | Dài 67cm | 65kg - 75kg
 * XXL:  Vai 43cm | Rộng 51cm | Dài 70cm | 75kg - 85kg
 * XXXL: Vai 45cm | Rộng 53cm | Dài 73cm | 85kg - 95kg
 */
export const SHIRT_SIZE_OPTIONS: ShirtSizeOption[] = [
  { 
    value: 'S', 
    label: 'Size S (35 - 45kg) • Vai 35 / Rộng 41 / Dài 55cm', 
    weightHint: '35 - 45kg',
    shoulder: '35cm',
    width: '41cm',
    length: '55cm'
  },
  { 
    value: 'M', 
    label: 'Size M (45 - 55kg) • Vai 37 / Rộng 44 / Dài 59cm', 
    weightHint: '45 - 55kg',
    shoulder: '37cm',
    width: '44cm',
    length: '59cm'
  },
  { 
    value: 'L', 
    label: 'Size L (55 - 65kg) • Vai 39 / Rộng 47 / Dài 63cm', 
    weightHint: '55 - 65kg',
    shoulder: '39cm',
    width: '47cm',
    length: '63cm'
  },
  { 
    value: 'XL', 
    label: 'Size XL (65 - 75kg) • Vai 41 / Rộng 49 / Dài 67cm', 
    weightHint: '65 - 75kg',
    shoulder: '41cm',
    width: '49cm',
    length: '67cm'
  },
  { 
    value: 'XXL', 
    label: 'Size XXL (75 - 85kg) • Vai 43 / Rộng 51 / Dài 70cm', 
    weightHint: '75 - 85kg',
    shoulder: '43cm',
    width: '51cm',
    length: '70cm'
  },
  { 
    value: 'XXXL', 
    label: 'Size XXXL (85 - 95kg) • Vai 45 / Rộng 53 / Dài 73cm', 
    weightHint: '85 - 95kg',
    shoulder: '45cm',
    width: '53cm',
    length: '73cm'
  }
];

export function normalizeShirtSize(size?: string): string {
  if (!size) return '';
  const s = size.trim().toUpperCase();
  if (!s || s === 'CHƯA CHỌN' || s === 'CHUA CHON' || s === 'NONE' || s === 'NULL' || s === 'UNDEFINED') return '';
  if (s === '2XL') return 'XXL';
  if (s === '3XL') return 'XXXL';
  return s;
}

/**
 * Sinh URL tạo ảnh mã VietQR chuẩn xác, tương thích 100% App Ngân hàng Việt Nam
 */
export function generateVietQrUrl(opts?: {
  bankCode?: any;
  bankName?: any;
  bankAccount?: any;
  bankHolder?: any;
  fundAmount?: any;
  transferSyntax?: any;
  template?: 'compact' | 'compact2' | 'qr_only';
}): string {
  if (!opts) return '';
  const bankId = opts.bankCode ? String(opts.bankCode).toLowerCase() : resolveBankCode(opts.bankName);
  const cleanAcc = String(opts.bankAccount || '').replace(/[^0-9a-zA-Z]/g, '');
  const template = opts.template || 'compact';
  const amount = opts.fundAmount && Number(opts.fundAmount) > 0 ? Number(opts.fundAmount) : 0;
  const cleanMemo = sanitizeVietQrText(opts.transferSyntax || 'DONG QUY K8A1');
  const cleanName = sanitizeVietQrText(opts.bankHolder || '');

  let url = `https://img.vietqr.io/image/${bankId}-${cleanAcc}-${template}.png?amount=${amount}&addInfo=${encodeURIComponent(cleanMemo)}`;
  if (cleanName) {
    url += `&accountName=${encodeURIComponent(cleanName)}`;
  }
  return url;
}

/**
 * Chuẩn hóa URL hình ảnh:
 * - Tự động nhận diện & chuyển đổi link chia sẻ Google Drive thành URL CDN lh3.googleusercontent.com hiển thị trực tiếp và nhanh chóng trong thẻ <img>.
 * - Hỗ trợ các dạng: /file/d/ID/view, open?id=ID, uc?id=ID, thumbnail?id=ID.
 * - Chuyển link Dropbox thành raw=1 để hiển thị trực tiếp.
 * - Bảo toàn các link ảnh tiêu chuẩn (Unsplash, HTTPS, Data URLs hợp lệ).
 */
export function normalizeImageUrl(rawUrl?: string): string {
  if (!rawUrl || typeof rawUrl !== 'string') return '';
  const trimmed = rawUrl.trim();
  if (!trimmed) return '';

  // 1. Nhận diện link Google Drive
  const driveFileMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (driveFileMatch && driveFileMatch[1]) {
    return `https://lh3.googleusercontent.com/d/${driveFileMatch[1]}=w1600`;
  }
  const driveIdMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (trimmed.includes('drive.google.com') && driveIdMatch && driveIdMatch[1]) {
    return `https://lh3.googleusercontent.com/d/${driveIdMatch[1]}=w1600`;
  }

  // 2. Nhận diện link Dropbox
  if (trimmed.includes('dropbox.com')) {
    return trimmed.replace(/\?dl=0$/, '?raw=1').replace(/&dl=0$/, '&raw=1');
  }

  return trimmed;
}

/**
 * Chuyển đổi an toàn bất kỳ định dạng ngày nào thành đối tượng Date hợp lệ
 * Xử lý: "09:30 • 01/09/2026", "01/09/2026 09:30", "01/09/2026", ISO, Timestamp, Date object...
 * Trả về null nếu không hợp lệ hoặc nếu gặp "Invalid Date" (chống triệt để lỗi hiển thị Invalid Date)
 */
export function parseDate(rawDate?: any): Date | null {
  if (!rawDate) return null;
  if (rawDate instanceof Date) {
    return isNaN(rawDate.getTime()) ? null : rawDate;
  }
  const str = String(rawDate).trim();
  if (!str || str.toLowerCase() === 'invalid date' || str.toLowerCase() === 'null' || str.toLowerCase() === 'undefined') {
    return null;
  }

  // Nếu là số timestamp mili-giây dạng chuỗi hoặc số
  if (/^\d{10,14}$/.test(str)) {
    const d = new Date(Number(str));
    if (!isNaN(d.getTime())) return d;
  }

  // Dạng HH:mm • DD/MM/YYYY hoặc HH:mm:ss • DD/MM/YYYY
  const bulletMatch = str.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?\s*•\s*(\d{1,2})[/-](\d{1,2})[/-](\d{4})/);
  if (bulletMatch) {
    const [, h, min, s, d, m, y] = bulletMatch;
    return new Date(Number(y), Number(m) - 1, Number(d), Number(h), Number(min), Number(s || 0));
  }

  // Dạng DD/MM/YYYY • HH:mm
  const bulletMatch2 = str.match(/(\d{1,2})[/-](\d{1,2})[/-](\d{4})\s*•\s*(\d{1,2}):(\d{2})(?::(\d{2}))?/);
  if (bulletMatch2) {
    const [, d, m, y, h, min, s] = bulletMatch2;
    return new Date(Number(y), Number(m) - 1, Number(d), Number(h), Number(min), Number(s || 0));
  }

  // Dạng DD/MM/YYYY HH:mm:ss hoặc DD/MM/YYYY
  const dmyTimeMatch = str.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?$/);
  if (dmyTimeMatch) {
    const [, d, m, y, h, min, s] = dmyTimeMatch;
    return new Date(Number(y), Number(m) - 1, Number(d), Number(h || 0), Number(min || 0), Number(s || 0));
  }

  // Dạng ISO YYYY-MM-DD hoặc YYYY-MM-DD HH:mm:ss
  const ymdTimeMatch = str.match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})(?:[\sT](\d{1,2}):(\d{2})(?::(\d{2}))?)?/);
  if (ymdTimeMatch) {
    const [, y, m, d, h, min, s] = ymdTimeMatch;
    return new Date(Number(y), Number(m) - 1, Number(d), Number(h || 0), Number(min || 0), Number(s || 0));
  }

  // Thử parse qua Date tiêu chuẩn
  const fallback = new Date(str);
  if (!isNaN(fallback.getTime())) {
    return fallback;
  }

  return null;
}

/**
 * Định dạng thời gian chuẩn tiếng Việt cho giao diện:
 * - Chuyển đổi các chuỗi Date rườm rà (ví dụ: "Sat Sep 05 2026 16:24:00 GMT+0700 (Indochina Time)", ISO, Timestamp)
 *   thành dạng gọn gàng, trang trọng: "16:24 • 05/09/2026"
 * - Chuẩn hóa các dạng DD/MM/YYYY HH:mm
 * - Tuyệt đối không bao giờ trả về chuỗi "Invalid Date"
 */
export function formatDateTimeVi(rawDate?: any): string {
  if (!rawDate) return '';
  const str = String(rawDate).trim();
  if (!str || str.toLowerCase() === 'invalid date' || str.toLowerCase() === 'null' || str.toLowerCase() === 'undefined') {
    return '';
  }

  // Nếu đã là định dạng chuẩn "HH:mm • DD/MM/YYYY" thì giữ nguyên
  if (/^\d{2}:\d{2}\s*•\s*\d{2}\/\d{2}\/\d{4}$/.test(str)) {
    return str;
  }

  const d = parseDate(rawDate);
  if (!d) {
    return '';
  }

  const pad = (n: number) => n < 10 ? '0' + n : String(n);
  const day = pad(d.getDate());
  const month = pad(d.getMonth() + 1);
  const year = d.getFullYear();

  // Nếu không có thành phần giờ phút trong chuỗi gốc và giờ phút bằng 0 thì chỉ trả về ngày
  if (d.getHours() === 0 && d.getMinutes() === 0 && !str.includes(':')) {
    return `${day}/${month}/${year}`;
  }

  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());
  return `${hours}:${minutes} • ${day}/${month}/${year}`;
}

/**
 * Định dạng thời gian điểm danh ngắn gọn, tinh tế cho bảng quản trị & danh sách:
 * - "Sat Sep 12 2026 13:06:00 GMT+0700 (Indochina Time)" -> "13:06 • 12/09"
 * - "12/09/2026 13:06" -> "13:06 • 12/09"
 * - "13:06" -> "13:06"
 */
export function formatCheckInTimeShort(rawDate?: any): string {
  if (!rawDate) return '';
  const str = String(rawDate).trim();
  if (
    !str || 
    str.toLowerCase() === 'invalid date' || 
    str.toLowerCase() === 'null' || 
    str.toLowerCase() === 'undefined' || 
    str.toLowerCase() === 'ok' ||
    str.toLowerCase() === 'đã đến'
  ) {
    return '';
  }

  // Nếu chỉ là HH:mm (ví dụ "13:06")
  if (/^\d{1,2}:\d{2}$/.test(str)) {
    return str;
  }

  // Nếu đã là HH:mm • DD/MM (ví dụ "13:06 • 12/09")
  if (/^\d{1,2}:\d{2}\s*•\s*\d{1,2}\/\d{1,2}$/.test(str)) {
    return str;
  }

  const d = parseDate(rawDate);
  if (!d) {
    const timeMatch = str.match(/(\d{1,2}:\d{2})/);
    return timeMatch ? timeMatch[1] : '';
  }

  const pad = (n: number) => (n < 10 ? '0' + n : String(n));
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());
  const day = pad(d.getDate());
  const month = pad(d.getMonth() + 1);

  return `${hours}:${minutes} • ${day}/${month}`;
}

/**
 * Định dạng ngày chuẩn tiếng Việt (DD/MM/YYYY):
 * - Xử lý triệt để các chuỗi Date từ Google Sheets như "Sat Aug 15 2026 00:00:00 GMT+0700 (Indochina Time)",
 *   "09:30 • 01/09/2026", ISO "2026-08-15" thành "15/08/2026"
 * - Tuyệt đối không bao giờ trả về chuỗi "Invalid Date"
 */
export function formatDateOnlyVi(rawDate?: any): string {
  if (!rawDate) return '';
  const str = String(rawDate).trim();
  if (!str || str.toLowerCase() === 'invalid date' || str.toLowerCase() === 'null' || str.toLowerCase() === 'undefined') {
    return '';
  }

  const d = parseDate(rawDate);
  if (!d) {
    // Dự phòng: trích xuất cụm DD/MM/YYYY nếu có trong chuỗi
    const dmy = str.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    if (dmy) {
      const [, dStr, mStr, yStr] = dmy;
      const pad = (n: string) => n.length === 1 ? '0' + n : n;
      return `${pad(dStr)}/${pad(mStr)}/${yStr}`;
    }
    return '';
  }

  const pad = (n: number) => n < 10 ? '0' + n : String(n);
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

/**
 * Che mờ số điện thoại để bảo vệ thông tin cá nhân (PII):
 * Hiển thị 4 số đầu và 2 số cuối, ở giữa thay bằng ký tự che: 0919 ••• •88
 */
export function maskPhone(phone?: any): string {
  if (!phone) return '';
  const str = String(phone).trim();

  // 1. Nếu chuỗi ĐÃ ĐƯỢC CHE MỜ trước đó (chứa • hoặc *):
  if (str.includes('•') || str.includes('*')) {
    const match = str.match(/^([0-9]{3,4})[^0-9]+([0-9]{2,4})$/);
    if (match) {
      return `${match[1]} ••• ${match[2]}`;
    }
    return str.replace(/\s+/g, ' ').trim();
  }

  // 2. Nếu là số thô (chưa che):
  const clean = str.replace(/[^0-9]/g, '');
  if (clean.length < 7) return clean;
  if (clean.length === 10) {
    return `${clean.slice(0, 4)} ••• ${clean.slice(-3)}`;
  }
  return `${clean.slice(0, 3)} ••• ${clean.slice(-3)}`;
}

/**
 * Trích xuất và chuẩn hóa tất cả các số điện thoại từ chuỗi (hỗ trợ nhiều số phân cách bằng -, /, ;, dấu cách)
 * Chuẩn hóa:
 * - Bỏ ký tự không phải số
 * - 84xxxxxxxxx -> 0xxxxxxxxx
 * - 9 chữ số bắt đầu từ [3,5,7,8,9] -> thêm 0 ở đầu (do Google Sheets lưu dạng number làm mất số 0)
 * - 10 chữ số bắt đầu từ 1 (đầu 01 cũ) -> thêm 0 ở đầu
 * - Chỉ chấp nhận SĐT hợp lệ có từ 9 đến 12 chữ số, loại bỏ các mảnh 2-4 chữ số vụn
 */
export const OLD_TO_NEW_VIETNAMESE_PREFIXES: Record<string, string> = {
  '0162': '032', '0163': '033', '0164': '034', '0165': '035',
  '0166': '036', '0167': '037', '0168': '038', '0169': '039',
  '0120': '070', '0121': '079', '0122': '077', '0126': '076', '0128': '078',
  '0123': '083', '0124': '084', '0125': '085', '0127': '081', '0129': '082',
  '0186': '056', '0188': '058',
  '0199': '059'
};

export function convertOldVietnamesePhone(phone: string): string {
  if (!phone) return phone;
  let p = String(phone).replace(/\D/g, '');
  if (p.startsWith('84') && p.length >= 10) p = '0' + p.slice(2);
  if (!p.startsWith('0') && (p.length === 9 || p.length === 10)) p = '0' + p;
  if (p.length === 11 && p.startsWith('01')) {
    const prefix4 = p.slice(0, 4);
    if (OLD_TO_NEW_VIETNAMESE_PREFIXES[prefix4]) {
      return OLD_TO_NEW_VIETNAMESE_PREFIXES[prefix4] + p.slice(4);
    }
  }
  return p;
}

export function extractPhones(raw?: any): string[] {
  if (raw === null || raw === undefined) return [];
  const str = String(raw).trim();
  if (!str) return [];

  // Nếu chuỗi chứa ký tự mask (• hoặc *), không bóc tách thành các mảnh số vụn để tránh so khớp sai
  if (str.includes('•') || str.includes('*')) {
    return [];
  }

  const parts = str.split(/[\s,;\/\-]+/).filter(Boolean);
  const phones: string[] = [];

  const cleanAndAdd = (numStr: string) => {
    let clean = numStr.replace(/[^0-9]/g, '');
    if (!clean) return;

    if (clean.startsWith('84') && clean.length >= 10) {
      clean = '0' + clean.slice(2);
    } else if (!clean.startsWith('0') && clean.length === 9) {
      clean = '0' + clean;
    } else if (!clean.startsWith('0') && clean.length === 10 && clean.startsWith('1')) {
      clean = '0' + clean;
    }

    // SĐT hợp lệ tại Việt Nam phải có ít nhất 9 đến 12 chữ số
    if (clean.length < 9 || clean.length > 12) return;

    if (clean && !phones.includes(clean)) {
      phones.push(clean);
    }
    const converted = convertOldVietnamesePhone(clean);
    if (converted && !phones.includes(converted)) {
      phones.push(converted);
    }
  };

  parts.forEach(cleanAndAdd);

  if (phones.length === 0) {
    const matches = str.match(/(?:0|\+?84)?[0-9]{8,11}/g);
    if (matches) {
      matches.forEach(cleanAndAdd);
    }
  }

  return phones;
}

/**
 * Kiểm tra xem 2 đối tượng SĐT có trùng nhau hay không (so khớp an toàn, hỗ trợ chuyển đổi 11 số sang 10 số)
 */
export function isPhoneMatch(phoneA?: any, phoneB?: any): boolean {
  if (!phoneA || !phoneB) return false;
  const strA = String(phoneA).trim();
  const strB = String(phoneB).trim();
  if (!strA || !strB) return false;

  const isMaskedA = strA.includes('•') || strA.includes('*');
  const isMaskedB = strB.includes('•') || strB.includes('*');

  // 1. Cả 2 đều là số bị che: so khớp an toàn qua suffix (2 số cuối) và prefix nhà mạng
  if (isMaskedA && isMaskedB) {
    const cleanA = strA.replace(/\D/g, '');
    const cleanB = strB.replace(/\D/g, '');
    if (cleanA.length >= 4 && cleanB.length >= 4) {
      const sufA = cleanA.slice(-2);
      const sufB = cleanB.slice(-2);
      if (sufA !== sufB) return false;
      let preA = cleanA.slice(0, cleanA.length - 2);
      let preB = cleanB.slice(0, cleanB.length - 2);
      if (preA.length === 4 && !preA.startsWith('0') && preA.startsWith('1')) preA = '0' + preA;
      if (preB.length === 4 && !preB.startsWith('0') && preB.startsWith('1')) preB = '0' + preB;
      const convA = OLD_TO_NEW_VIETNAMESE_PREFIXES[preA] || preA;
      const convB = OLD_TO_NEW_VIETNAMESE_PREFIXES[preB] || preB;
      return (convA.length >= 3 && convB.length >= 3) && (convA.endsWith(convB) || convB.endsWith(convA));
    }
    return false;
  }

  // 2. Nếu 1 bên bị che và 1 bên là số đầy đủ:
  if (isMaskedA !== isMaskedB) {
    const masked = isMaskedA ? strA : strB;
    const full = isMaskedA ? strB : strA;
    const fullPhones = extractPhones(full);
    if (fullPhones.length === 0) return false;

    const cleanMasked = masked.replace(/[^0-9]/g, '');
    if (cleanMasked.length >= 6) {
      let prefix = cleanMasked.slice(0, 4);
      const suffix = cleanMasked.slice(-2);
      if (prefix.length === 4 && !prefix.startsWith('0') && prefix.startsWith('1')) prefix = '0' + prefix;
      const convPrefix = OLD_TO_NEW_VIETNAMESE_PREFIXES[prefix] || prefix;
      return fullPhones.some(fp => {
        if (!fp.endsWith(suffix)) return false;
        return fp.startsWith(prefix) || fp.startsWith(convPrefix);
      });
    }
    return false;
  }

  // 3. Cả 2 đều là số đầy đủ: so khớp chuẩn qua danh sách SĐT hợp lệ
  const listA = extractPhones(phoneA);
  const listB = extractPhones(phoneB);
  if (listA.length === 0 || listB.length === 0) return false;
  return listA.some(a => listB.includes(a));
}

/**
 * So khớp thông minh tên học sinh trong Danh bạ (Master Roster) với Họ tên gửi từ Web
 * Hỗ trợ các trường hợp thực tế:
 * - Danh bạ ghi ngắn gọn: "Trần Khuyến" <-> Web nhập: "Trần văn Khuyến"
 * - Danh bạ chỉ ghi tên/đệm: "Bảo Thi" <-> Web nhập: "Hoàng Bảo Thi"
 * - Danh bạ ghi tên đảo: "Linh Hữu" <-> Web nhập: "Thái hữu linh"
 * - Khớp theo Biệt danh
 */
export function isVietnameseNameMatch(
  rosterMember: { fullName: string; nickname?: string },
  targetName?: string,
  targetNickname?: string
): boolean {
  if (!rosterMember || !rosterMember.fullName) return false;

  const normalize = (s: string) =>
    String(s)
      .trim()
      .toLowerCase()
      .replace(/\s+/g, ' ');

  const rName = targetName ? normalize(targetName) : '';
  const rNick = targetNickname ? normalize(targetNickname) : '';
  const mName = normalize(rosterMember.fullName);
  const mNick = rosterMember.nickname ? normalize(rosterMember.nickname) : '';

  // Khớp trực tiếp theo nickname nếu cả 2 bên đều có biệt danh
  if (rNick && mNick && rNick === mNick) return true;

  if (!rName || !mName) return false;
  if (mName === rName) return true;
  if (mNick && mNick === rName) return true;
  if (rNick && mName === rNick) return true;

  const rTokens = rName.split(' ').filter(Boolean);
  const mTokens = mName.split(' ').filter(Boolean);

  // 1. Toàn bộ các từ của tên danh bạ nằm trong tên đăng ký web
  if (mTokens.length >= 2 && mTokens.every(t => rTokens.includes(t))) {
    return true;
  }

  // 2. Toàn bộ các từ của tên web nằm trong danh bạ
  if (rTokens.length >= 2 && rTokens.every(t => mTokens.includes(t))) {
    return true;
  }

  // 3. Biệt danh khớp với tên web
  if (mNick && mNick.length >= 2) {
    const nickTokens = mNick.split(' ').filter(Boolean);
    if (nickTokens.length >= 2 && nickTokens.every(t => rTokens.includes(t))) {
      return true;
    }
  }

  // 4. Trùng tên gọi (given name) và trùng biệt danh
  if (rTokens.length > 0 && mTokens.length > 0) {
    const rGivenName = rTokens[rTokens.length - 1];
    const mGivenName = mTokens[mTokens.length - 1];
    if (rGivenName === mGivenName && ((rNick && mNick && rNick === mNick) || (mNick && rName.includes(mNick)))) {
      return true;
    }
  }

  return false;
}

// ============================================================================
// 🎬 CẤU HÌNH TRÌNH CHIẾU SÂN KHẤU (MÀN LED) & PLAYLIST NHẠC NỀN K8A1
// ============================================================================

// Danh sách bài hát mặc định (Ca khúc thanh xuân tuổi học trò K8A1)
export const DEFAULT_PLAYLIST: MusicTrack[] = [
  {
    id: "track-1",
    title: "Mong Ước Kỷ Niệm Xưa",
    artist: "Tam Ca 3A",
    sourceType: "youtube",
    url: "https://youtu.be/ocvlV5LZ93Q",
    duration: "05:12"
  },
  {
    id: "track-2",
    title: "Tạm Biệt (Thời Áo Trắng)",
    artist: "Quang Vinh",
    sourceType: "youtube",
    url: "https://youtu.be/zXHEZ0SLj1A",
    duration: "04:30"
  },
  {
    id: "track-3",
    title: "Ngày Ấy Bạn Và Tôi",
    artist: "Lynk Lee",
    sourceType: "youtube",
    url: "https://youtu.be/Z0R73khjwfg",
    duration: "04:15"
  },
  {
    id: "track-4",
    title: "Xe Đạp",
    artist: "Thùy Chi & M4U",
    sourceType: "youtube",
    url: "https://youtu.be/HyCIkhbalPk",
    duration: "04:45"
  },
  {
    id: "track-5",
    title: "Giấc Mơ Thần Tiên",
    artist: "Miu Lê",
    sourceType: "youtube",
    url: "https://youtu.be/VHT6ouvKj_Q",
    duration: "03:55"
  },
  {
    id: "track-6",
    title: "Nụ Cười 18 20",
    artist: "Doãn Hiếu",
    sourceType: "youtube",
    url: "https://youtu.be/qOwNuWY30iw",
    duration: "03:40"
  }
];

// Danh sách Maket / Backdrop sân khấu hội trường mặc định
export const DEFAULT_BACKDROPS: BackdropItem[] = [
  {
    id: "bd-main",
    title: "Backdrop Sân Khấu Chính • Kỷ Niệm 20 Năm Ngày Trở Về K8A1 (2003 - 2006)",
    url: "https://lh3.googleusercontent.com/d/1PyvlmILYdK-Lx12ohrHfBV-ppDjHDhhg=w1600",
    thumbnail: "https://lh3.googleusercontent.com/d/1PyvlmILYdK-Lx12ohrHfBV-ppDjHDhhg=w600",
    isDefault: true
  },
  {
    id: "bd-school",
    title: "Maket Hội Ngộ Mái Trường THPT Thái Nguyên Xưa & Nay",
    url: "https://thpttn.tnue.edu.vn/upload/doantn/logo%20thpttn.jpg",
    thumbnail: "https://thpttn.tnue.edu.vn/upload/doantn/logo%20thpttn.jpg",
    isDefault: false
  }
];

// Cấu hình điều khiển trình chiếu sân khấu mặc định
export const DEFAULT_STAGE_SETTINGS: StageSettings = {
  slideshowSpeed: 6000,
  defaultScene: 'backdrop',
  autoPlayMusic: true,
  enableSparkles: true,
  volume: 80,
  showCaption: true,
  shufflePhotos: false,
  photoFrameStyle: 'gold',
  particleEffect: 'petals',
  photoFilter: 'sepia',
  showCorners: true,
  transitionEffect: 'alternate'
};

/**
 * Nhận diện chuỗi chú thích là tên file máy ảnh, mã băm Drive, chuỗi số Facebook hoặc từ khóa mặc định chung chung
 */
export function isMachineOrGenericCaption(caption?: string): boolean {
  if (!caption) return true;
  const trimmed = String(caption).trim();
  if (trimmed.length < 4) return true;

  // 1. Kiểm tra danh sách từ khóa mặc định chung chung
  const lower = trimmed.toLowerCase().replace(/\s+/g, ' ');
  const genericList = [
    'kỷ niệm lớp k8a1',
    'kỷ niệm k8a1',
    'ảnh kỷ niệm',
    'ảnh kỷ niệm k8a1',
    'ảnh k8a1',
    'k8a1',
    'kỷ niệm 20 năm',
    'kỷ niệm 20 năm k8a1',
    'kỷ niệm',
    'chưa có chú thích',
    'default',
    'untitled',
    'null',
    'undefined',
    'image',
    'photo',
    'hinh anh',
    'ảnh',
    'hình ảnh'
  ];
  if (genericList.includes(lower)) return true;

  // 2. Định dạng đuôi file hình ảnh / video
  if (/\.(jpg|jpeg|png|webp|gif|bmp|mp4|mov|heic|heif|raw)$/i.test(trimmed)) return true;

  // 3. Tiền tố máy ảnh / chụp màn hình / mạng xã hội
  if (/^(img|image|dsc|photo|pasted|screenshot|zalo|fb|facebook|snap|178\d+|569\d+)/i.test(trimmed)) return true;

  // 4. Chuỗi số dài liên tiếp hoặc chuỗi timestamp Facebook (chứa nhiều cụm số 8+ chữ số, hoặc kết thúc bằng 'n')
  if (/^\d{8,}/.test(trimmed) || /^[\d\s_.-]{8,}/.test(trimmed) || (/\s+n$/i.test(trimmed) && /\d{8,}/.test(trimmed))) return true;

  // 5. Chuỗi ngẫu nhiên không có dấu cách dài >= 16 ký tự (mã băm Drive như 2aOboQx0cIp0ytJctMR2mYgDpSIvagbVQ47zopO4)
  if (!trimmed.includes(' ') && trimmed.length >= 16) return true;

  // 6. Mã hex dài hoặc chứa hash nội bộ
  if (/^[0-9a-f]{16,}$/i.test(trimmed) || trimmed.includes('9527bee86c')) return true;

  return false;
}

// Danh sách câu dẫn thanh xuân K8A1 — Sắp xếp XEN KẼ giữa Vui Vẻ, Thân Thiện và Sâu Lắng, Hoài Niệm
export const NOSTALGIC_QUOTES: string[] = [
  "Gặp lại nhau là cứ phải cười thật tươi thế này mới chịu cơ! 😄",
  "Hai mươi năm ngày trở về — Ký ức năm tháng tuổi học trò K8A1 vẫn vẹn nguyên như ngày hôm qua.",
  "20 năm rồi mà nhìn nụ cười của ai cũng vẫn trẻ trung y như ngày nào!",
  "Thời gian có thể trôi mau, nhưng tình bạn của chúng mình thì mãi mãi còn lại.",
  "Nhìn lại ảnh cũ mới thấy ngày xưa chúng mình ngố tàu mà vui thật sự.",
  "Cảm ơn vì chúng ta đã cùng nhau đi qua những năm tháng thanh xuân trong trẻo nhất cuộc đời.",
  "Đúng chất K8A1 — Đã tụ tập là phải vui hết nấc!",
  "Có những người bạn, dẫu bao năm xa cách, gặp lại vẫn vẹn nguyên sự chân thành.",
  "Ảnh có thể mờ theo năm tháng, nhưng tình bạn của chúng mình thì lúc nào cũng nét căng!",
  "Hai mươi năm — Một chặng đường đủ dài để thấu hiểu giá trị thiêng liêng của hai chữ tri kỷ.",
  "Ai bảo 20 năm là lâu? Cứ đứng chung một khung hình là lại thành bạn cùng lớp ngay!",
  "Đi thật xa qua bao thăng trầm cuộc đời, nhận ra tình bạn tuổi học trò vẫn là điều bình yên nhất.",
  "Thời gian trôi nhanh thật, nhưng nụ cười của K8A1 thì chẳng chịu già đi chút nào!",
  "Áo trắng ngày xưa, tiếng cười ngày cũ — Kho báu vô giá sau hai mươi năm đường đời.",
  "Nhìn những gương mặt thân quen này, bao nhiêu mệt mỏi tự nhiên tan biến hết!",
  "Năm tháng có thể lấy đi tuổi trẻ, nhưng không thể lấy đi những hồi ức đẹp đẽ chúng mình từng có.",
  "Thanh xuân của lớp mình chẳng cần cầu kỳ, chỉ cần có nhau là vui nổ trời rồi!",
  "Tình bạn tuổi mười tám là món quà quý giá mà thời gian không thể nào xóa nhòa.",
  "20 năm một chặng đường — Về bên nhau là cứ tíu tít như chưa từng xa cách.",
  "Dù mai này mỗi người một phương, K8A1 vẫn luôn là mái nhà ấm áp để tìm về.",
  "Nụ cười rạng rỡ của K8A1 — Độc quyền chỉ lớp mình mới có thôi nhé!",
  "Trở về để nhớ, trở về để thương và cùng nhau trân trọng từng phút giây của hiện tại.",
  "Gặp lại sau 20 năm mà cảm giác thân quen cứ như vừa mới tan học hôm qua.",
  "Hạnh phúc đơn sơ là được ngồi lại bên nhau, nhìn ngắm những nụ cười thân thương ngày cũ.",
  "Chỉ cần đứng cạnh nhau là tự khắc thấy mình trẻ lại chục tuổi!",
  "Mỗi bức ảnh là một chiếc vé kỳ diệu đưa chúng mình tìm lại những năm tháng vô tư nhất.",
  "Dù ở đâu, làm gì thì K8A1 gặp nhau vẫn cứ là những người bạn tinh nghịch ngày nào.",
  "Dù bạn đang ở đâu, làm gì, hãy luôn nhớ rằng bạn là một phần không thể thiếu của K8A1.",
  "20 năm mới có dịp đông đủ thế này, cười thật tươi lên nào các bạn ơi!",
  "Gặp lại nhau sau 20 năm, để thấy tuổi trẻ của chúng mình chưa từng phai mờ theo năm tháng.",
  "Gặp lại nhau, bao nhiêu chuyện vui ngày xưa lại được kể ra cười nghiêng ngả.",
  "Bao nhiêu năm bôn ba, bến đỗ ấm áp và chân thành nhất vẫn là bạn bè đồng môn.",
  "Gương mặt rạng ngời thế này thì ai đoán được lớp mình đã ra trường 20 năm rồi chứ!",
  "Hãy giữ chặt lấy những ký ức tuyệt vời này, để tiếp thêm sức mạnh cho chặng đường phía trước.",
  "Một bức ảnh, triệu niềm vui — Cảm ơn vì đã cùng nhau tạo nên những khoảnh khắc này.",
  "Tình bạn đồng môn son sắt, vượt qua mọi ranh giới của thời gian và khoảng cách.",
  "Ngày xưa vui một, ngày hội ngộ 20 năm gặp lại còn vui gấp mười lần!",
  "Tuổi học trò đã lùi xa, nhưng những ân tình gửi gắm nơi nhau thì mãi mãi vẹn nguyên.",
  "Thanh xuân trôi qua cái vèo, nhưng tình bạn K8A1 thì ở lại mãi mãi.",
  "Có những khoảnh khắc giản dị bên nhau, nay đã hóa thành ký ức vô giá của cuộc đời.",
  "Khoảnh khắc đáng nhớ của những người bạn cùng chung một thời thanh xuân.",
  "Cảm ơn những cái ôm, những nụ cười chân tình đã làm nên ngày hội ngộ đong đầy yêu thương.",
  "Nụ cười này, ánh mắt này — Đúng là bạn thân của tôi đây rồi!",
  "Dù cuộc sống có thăng trầm sóng gió, nụ cười bạn bè vẫn là điều xoa dịu lòng ta nhất.",
  "Hai mươi năm xa cách, gặp lại là chuyện trò rôm rả kể mãi không hết.",
  "Đời người được mấy lần hai mươi năm, hãy trân trọng từng phút giây quý giá khi được bên nhau.",
  "Bức ảnh đẹp nhất là bức ảnh có nụ cười rạng rỡ của tất cả chúng mình.",
  "Khoảng cách địa lý có thể xa xôi, nhưng trái tim K8A1 luôn cùng chung một nhịp đập.",
  "Dù năm tháng có đổi thay, K8A1 gặp nhau là năng lượng tích cực lại tràn đầy!",
  "Nếp nhăn có thể hằn lên khóe mắt, nhưng tâm hồn tuổi đôi mươi vẫn sống mãi trong ta.",
  "Thanh xuân không quay lại, nhưng chúng mình có thể cùng nhau tạo thêm thật nhiều kỷ niệm mới!",
  "Tình bạn K8A1 như ngọn lửa ấm áp, càng qua năm tháng lại càng bền chặt và sâu sắc hơn.",
  "20 năm ngày hội ngộ — Giữ mãi tinh thần trẻ trung, yêu đời này nhé K8A1!",
  "Mỗi bức hình là một nhịp cầu yêu thương đưa ta trở về với miền ký ức dấu yêu.",
  "Thời gian làm thay đổi nhiều thứ, nhưng độ vui tính và lầy lội của lớp mình thì vẫn thế!",
  "Thanh xuân không bao giờ kết thúc chừng nào chúng mình vẫn luôn nhớ về nhau.",
  "Nhìn bức ảnh này là thấy cả một bầu trời vui nhộn ùa về rồi!",
  "Biết ơn vì trong những năm tháng đẹp nhất của cuộc đời, chúng ta đã có nhau bên cạnh.",
  "Ai cũng rạng rỡ, ai cũng tươi vui — K8A1 hôm nay đỉnh thật sự!",
  "Tình bạn đích thực không đo bằng thời gian, mà đo bằng sự gắn kết chân thành giữa những tâm hồn.",
  "Tuổi học trò vui nhất là khi có những đứa bạn thân cùng cười, cùng sẻ chia.",
  "Hai mươi năm — Đủ để nhận ra tình bạn thuở hoa niên là điều thuần khiết và quý giá nhất.",
  "Chẳng cần tạo dáng cầu kỳ, cứ cười tự nhiên là có ngay bức ảnh kỷ niệm cực đẹp!",
  "Những kỷ niệm năm ấy sẽ mãi là hành trang ấm áp theo chúng mình trên vạn nẻo đường đời.",
  "K8A1 — Nơi tụ hội của những nụ cười tươi nhất và những người bạn tuyệt vời nhất!",
  "Gặp lại nhau hôm nay, thấy bóng hình của chính mình hai mươi năm trước đang mỉm cười.",
  "20 năm rồi mới lại được chụp ảnh cùng nhau, vừa bồi hồi vừa vui khó tả!",
  "Cảm ơn vì đã luôn là những người bạn tuyệt vời nhất trong thanh xuân của nhau.",
  "Tình bạn K8A1: Không khoảng cách, gặp nhau là rộn rã tiếng cười từ đầu đến cuối!",
  "Một chặng đường hai mươi năm, đong đầy những nghĩa tình đồng môn không thể nào phai.",
  "Những khoảnh khắc tự nhiên thế này mới đúng là 'chất' K8A1 của chúng mình chứ!",
  "Thời gian trôi đi không lấy lại được, nhưng kỷ niệm là báu vật mãi mãi thuộc về chúng ta.",
  "Hội ngộ sau 20 năm — Những cái bắt tay thật chặt và những tiếng cười giòn tan!",
  "Tình bạn được tôi luyện qua hai mươi năm sương gió càng trở nên son sắt và đáng quý hơn.",
  "Ảnh chụp lúc nào cũng thấy lớp mình tươi vui và tràn đầy sức sống!",
  "Dù ở lứa tuổi nào, trở về trong vòng tay bè bạn cũ, ta lại thấy lòng mình bình yên như xưa.",
  "Gặp lại bạn bè cũ, thấy như được nạp thêm bao nhiêu năng lượng vui vẻ cho cuộc sống!",
  "Kỷ niệm đẹp không phải vì nó hoàn hảo, mà vì chúng mình đã cùng nhau sống trọn vẹn những ngày tháng ấy.",
  "20 Năm Ngày Trở Về — Một ngày trọn vẹn của niềm vui, tiếng cười và sự sẻ chia!",
  "Hạnh phúc vỡ òa khi sau hai thập kỷ, chúng mình vẫn gọi tên nhau thân thương như thuở nào.",
  "Cứ vui như thế này nhé, dù 20 hay 30 năm nữa gặp lại vẫn phải cười thật tươi!",
  "Mỗi nụ cười trong bức ảnh này đều chở che bao nghĩa tình sâu đậm của bạn bè cùng lớp.",
  "Lớp mình ai cũng cười xinh, cười tươi — Nhìn ảnh là thấy không khí rộn ràng ngay!",
  "Chào mừng bạn đã trở về nhà — Ngôi nhà K8A1 ấm áp luôn mở rộng cửa đón chào.",
  "Hai mươi năm trôi qua, nụ cười của chúng mình vẫn vẹn nguyên nét vui tươi ngày ấy.",
  "Ngày trở về không chỉ là hoài niệm, mà còn là lời hứa sẽ luôn đồng hành bên nhau mai sau.",
  "K8A1 mãi đỉnh — Luôn vui vẻ, yêu đời và tràn ngập tình cảm bè bạn!",
  "Chúc cho đại gia đình K8A1 luôn tràn đầy sức khỏe, hạnh phúc và mãi mãi gắn kết bền lâu.",
  "Thanh xuân rực rỡ nhất là khi chúng mình được cùng nhau cười đùa vô tư thế này!",
  "Hãy để ngày hôm nay trở thành một cột mốc vàng son, ghi dấu tình bạn bất diệt của lớp K8A1.",
  "Dù mai này bận rộn đến đâu, nhớ là K8A1 chúng mình luôn có nhau nhé!",
  "K8A1 — Mãi mãi là một thời tuổi trẻ rực rỡ và những người bạn tri kỷ suốt cuộc đời."
];

/**
 * Lấy câu chú thích hoài niệm thay thế cho tên file ảnh kỹ thuật số hoặc caption mặc định chung chung
 */
export function getNostalgicPhotoCaption(index: number, customCaption?: string): string {
  if (customCaption && !isMachineOrGenericCaption(customCaption)) {
    return customCaption.trim();
  }
  return NOSTALGIC_QUOTES[Math.abs(index) % NOSTALGIC_QUOTES.length];
}

export const DEFAULT_EVENT_CONFIG: EventConfig = {
  eventTitle: "20 Năm Ngày Trở Về",
  eventSubtitle: "Lớp K8A1 — Trường THPT Thái Nguyên",
  eventDateText: "Chủ Nhật, 27/09/2026 (07:30 — 12:30)",
  eventTimeText: "Từ 07:30 Sáng — Chủ Nhật, ngày 27/09/2026",
  countdownTarget: "2026-09-27T07:30:00+07:00",

  // Chặng 1: Trường THPT Thái Nguyên
  venueName: "Trường THPT Thái Nguyên",
  venueSubtitle: "Chặng 1: 07:30 – 09:00 • Thăm trường, đón cô chủ nhiệm & chụp ảnh lưu niệm (Concept 1 & 2)",
  venueAddress: "Số 127 đường Lương Thế Vinh, P. Quang Trung, TP. Thái Nguyên, Tỉnh Thái Nguyên",
  shortAddress: "127 Lương Thế Vinh, TP. Thái Nguyên",
  venueTime: "07:30 — 09:00 (Sáng)",
  venueActivity: "07h30: BTC có mặt, đón cô chủ nhiệm • 08h00: Concept 1 'K8A1 Một thời để nhớ' (Áo đồng phục) • 08h30: Concept 2 'Thanh xuân trở lại' (Nữ áo dài/váy trắng, Nam sơ mi trắng) • 09h00: Di chuyển về XHotel / X - Restaurant",
  mapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m4!2m1!1zVHLGsOG7nW5nIFRIUFQgVGjDoWkgTmd1ecOqbiwgMTI3IEzGsMahbmcgVGjhur8gVmluaCwgVGjDoWkgTmd1ecOqbg!5e0!6i17!3m1!1svi!5m1!1svi",
  mapDirectUrl: "https://www.google.com/maps/search/?api=1&query=Tr%C6%B0%E1%BB%9Dng+THPT+Th%C3%A1i+Nguy%C3%AAn,+127+L%C6%B0%C6%A1ng+Th%E1%BA%BF+Vinh,+Th%C3%A1i+Nguy%C3%AAn",

  // Chặng 2: Nhà Hàng & Trung Tâm Sự Kiện Prime Thái Nguyên (Mặc định tắt theo cấu hình Google Sheet)
  enableTwoVenues: true,
  venue2Name: "XHotel / X - Restaurant",
  venue2Subtitle: "Chặng 2: 09:15 – 12:30 • Check-in đón Thầy Cô, Gala Hội ngộ 20 năm, tri ân & tiệc trưa",
  venue2Address: "XHotel / X - Restaurant, TP. Thái Nguyên, Tỉnh Thái Nguyên",
  venue2ShortAddress: "XHotel / X - Restaurant, TP. Thái Nguyên",
  venue2Time: "09:15 — 12:30 (Trưa)",
  venue2Activity: "09h15: Check-in đón Thầy Cô (Áo đồng phục K8A1) • 10h00: Khai mạc, Tri ân Thầy Cô • 10h30: Khai tiệc Concept 3 (Trang phục tự do thanh lịch) • 11h30: Lời nhắn 10 năm sau, trao quà • 12h00: Ảnh tập thể, bế mạc",
  venue2MapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d600!2d105.8386089!3d21.5949009!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x52211cf3f4926b%3A0x6de9f091b88c49ab!2sTh%C3%A1p%20%C4%91%C3%B4i%20Prime%20Th%C3%A1i%20Nguy%C3%AAn!5e1!3m2!1svi!2svn!4v1725550000000!5m2!1svi!2svn",
  venue2MapDirectUrl: "https://maps.app.goo.gl/a3utiYosZqGHKDjYA",
  routeDistanceText: "~1.5km (Di chuyển 5 - 10 phút)",
  routeDirectUrl: "https://www.google.com/maps/dir/?api=1&origin=Tr%C6%B0%E1%BB%9Dng+THPT+Th%C3%A1i+Nguy%C3%AAn,+127+L%C6%B0%C6%A1ng+Th%E1%BA%BF+Vinh,+Th%C3%A1i+Nguy%C3%AAn&destination=Th%C3%A1p+%C4%91%C3%B4i+Prime+Th%C3%A1i+Nguy%C3%AAn,+S%E1%BB%91+1+Ho%C3%A0ng+V%C4%83n+Th%E1%BB%A5,+Th%C3%A1i+Nguy%C3%AAn",

  letterTitle: "Lời Tri Ân — K8A1 20 Năm: Một Chặng Đường, Một Đời Tình Bạn",
  letterSubtitle: "Hai mươi năm – một chặng đường, một lần trở về, ngàn lần thương nhớ...",
  letterParagraph1: "Kính gửi Ban Giám hiệu Trường THPT Thái Nguyên, các cô giáo chủ nhiệm cùng toàn thể các thầy cô giáo bộ môn đã từng giảng dạy tập thể lớp K8A1 niên khóa 2003 – 2006.\n\nHai mươi năm trước, chúng em rời xa mái trường thân yêu mang theo hành trang là tri thức, là những bài học làm người sâu sắc và cả niềm tin yêu mà thầy cô đã cần mẫn trao gửi. Hai mươi năm trôi qua, dù ở bất kỳ phương trời nào, trên mỗi bước đường trưởng thành của mỗi chúng em đều có bóng hình của mái trường xưa, có sự chở che, dìu dắt từ những tháng năm hoa niên tươi đẹp. Hôm nay, trong niềm xúc động nghẹn ngào của ngày trở về, tập thể K8A1 xin được cúi đầu kính cẩn dâng lên thầy cô lời tri ân sâu sắc và lòng biết ơn vô hạn. Cảm ơn thầy cô vì đã dành trọn tâm huyết, tình thương để thắp sáng ước mơ cho chúng em.",
  letterParagraph2: "Đồng thời, xin gửi lời cảm ơn chân thành tới 50 trái tim K8A1 đã cùng nhau tề tựu, gắn kết và tiếp nối mạch nguồn tình bạn thiêng liêng sau 20 năm xa cách. Dù thời gian có đổi thay, mái tóc có ngả màu, tình bạn của chúng ta vẫn mãi vẹn nguyên như những ngày đầu dưới mái trường THPT Thái Nguyên.\n\nKính chúc các thầy cô luôn dồi dào sức khỏe, hạnh phúc và an yên! Chúc cho tình bạn K8A1 mãi mãi xanh tươi, bền chặt theo năm tháng! Thanh xuân có bạn là tất cả là những điều tuyệt vời nhất! ♡",
  letterSignatureTitle: "Trưởng Ban Liên Lạc K8A1",
  letterSignatureSubtitle: "Trần Thị Thanh Nhạn",
  bankName: "VietinBank (CTG)",
  bankAccount: "103004505646",
  bankHolder: "DAO THI HONG NHUNG",
  transferSyntax: "KY NIEM 20 NAM [HO TEN] [SDT]",
  fundAmountPerPerson: 700000,
  customQrUrl: "",
  bankCode: "vietinbank",
  qrTemplate: "compact",
  heroBannerUrl: "https://lh3.googleusercontent.com/d/1PyvlmILYdK-Lx12ohrHfBV-ppDjHDhhg=w1600",
  heroBannerPosition: 82,
  schoolLogoUrl: "https://thpttn.tnue.edu.vn/upload/doantn/logo%20thpttn.jpg",
  poloSampleUrl: "/sample-polo-k8a1.jpg",
  poloDescription: "Thun cá sấu 4 chiều cao cấp • Cổ áo & tay áo bo viền hổ phách • Thêu logo vàng kim ngực trái",
  backdrops: DEFAULT_BACKDROPS,
  musicPlaylist: DEFAULT_PLAYLIST,
  stageSettings: DEFAULT_STAGE_SETTINGS,
  albums: DEFAULT_ALBUMS,
  showAnnouncements: true,
  blockVisibility: {
    countdown: true,
    gatheringCounter: true,
    announcements: true,
    invitationLetter: true,
    venueMap: true,
    rsvpForm: true,
    confirmedAttendees: true,
    fundBankTransfer: true,
    teachers: true,
    memories: true,
  }
};

// =============================================================================
// DANH SÁCH BẢN TIN & THÔNG BÁO CHÍNH THỨC K8A1 MẶC ĐỊNH
// =============================================================================
export const DEFAULT_ANNOUNCEMENTS: import('./types').Announcement[] = [
  {
    id: "TB-REPORT-20Y",
    slug: "tong-ket-20-nam",
    title: "🏆 DẤU ẤN 2 DECADES: Ký Sự Đại Lễ 20 Năm & Kỳ Tích Số Hóa Hội Khóa K8A1",
    category: "report",
    summary: "Bản ký sự & báo cáo tổng kết chính thức: Nhìn lại hành trình 2 thập kỷ tri kỷ với 24 giờ hội ngộ xúc động nghẹn ngào, 4 con số kỷ lục lịch sử và 5 kỳ tích công nghệ 4.0 tiên phong của ngày 27/09/2026.",
    content: `BÁO CÁO TỔNG KẾT & KÝ SỰ ĐẠI LỄ 20 NĂM NGÀY TRỞ VỀ
"HÀNH TRÌNH 2 THẬP KỶ — MỘT ĐỜI TRI KỶ & DẤU ẤN TIÊN PHONG SỐ HÓA K8A1"
TẬP THỂ CỰU HỌC SINH NIÊN KHÓA 2003 — 2006 | TRƯỜNG THPT THÁI NGUYÊN
(Ngày hội tụ lịch sử: Chủ Nhật, 27/09/2026)

Kính gửi: Các Thầy Cô giáo kính yêu — những người lái đò tận tụy đã nâng bước thanh xuân của chúng em;
Cùng toàn thể 50 trái tim K8A1 thân thương từ khắp bốn phương trời!

Hai mươi năm — hai phần mười thế kỷ đã trôi qua kể từ mùa hè rực lửa hoa phượng vĩ năm 2006, khi 50 cô cậu học trò lớp K8A1 bước ra khỏi cánh cổng trường THPT Thái Nguyên mang theo bao hoài bão tuổi trẻ. Hai mươi năm ấy, cuộc đời mỗi người đã có biết bao đổi thay, ai cũng xuôi ngược với sự nghiệp, gia đình và những bộn bề thăng trầm của đời sống. Nhưng có một điều kỳ diệu chưa bao giờ nhạt phai: ngọn lửa tình bạn vô tư, trong sáng của K8A1 vẫn luôn âm ỉ cháy, chờ ngày bùng lên thành một khúc hoan ca rực rỡ.

Và ngày Chủ Nhật, 27/09/2026 vừa qua, khúc hoan ca ấy đã cất lên vang dội trong ngày Đại lễ "20 Năm Ngày Trở Về". Đó không đơn thuần là một buổi họp lớp — đó là ngày của những giọt nước mắt nghẹn ngào trong vòng tay Thầy Cô, là những cái ôm siết chặt xóa nhòa mọi khoảng cách thời gian, là tiếng cười hồn nhiên không vướng bận danh vọng, và là sự thăng hoa của một tập thể xuất sắc đã tự tay kiến tạo nên một kỳ tích hội khóa chưa từng có trong lịch sử trường THPT Thái Nguyên.

Thay mặt Ban Tổ Chức, chúng tôi trân trọng công bố Bản Báo Cáo Tổng Kết & Ký Sự Dấu Ấn Đại Lễ 20 Năm:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
I. KÝ SỰ 24 GIỜ HUY HOÀNG — KHI KỶ NIỆM HÓA VĨNH CỬU
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🌅 08:30 SÁNG — TRỞ VỀ MIỀN KÝ ỨC DƯỚI BÓNG TRƯỜNG XƯA:
Khoảnh khắc đoàn xe chở các bạn tề tựu trước cổng trường THPT Thái Nguyên, dường như thời gian 20 năm đã ngừng lại. Những tà áo polo đồng phục K8A1 mang màu xanh hy vọng nổi bật giữa sân trường ngập nắng mùa thu. 

Xúc động và thiêng liêng nhất là giây phút đón chào các Thầy Cô giáo chủ nhiệm và bộ môn kính yêu. Mái tóc Thầy Cô nay đã pha sương theo năm tháng, nhưng ánh mắt trìu mến dõi theo đàn con thơ ngày nào vẫn ấm áp nguyên vẹn. Những đóa hoa tươi thắm, những lời tri ân từ đáy lòng và những giọt nước mắt lăn dài trên má đã làm rung động cả không gian trường cũ. Tiếng chuông trường như lại vang vọng, đưa 50 con người trở về trọn vẹn với tuổi 18 tinh khôi.

🥂 11:30 TRƯA — ĐẠI TIỆC HỘI NGỘ BÙNG NỔ TẠI THE PRIME:
Nếu buổi sáng là sự lắng đọng và biết ơn, thì buổi trưa tại trung tâm The Prime là một đại dương cảm xúc bùng cháy. Mọi chức danh xã hội, mọi vị thế ngoài đời sống đều được trút bỏ ngoài cánh cửa; bên trong chỉ còn lại "mày - tao", những câu chuyện nghịch ngợm thuở cắp sách, những biệt danh gắn bó một thời và những chén rượu nồng ấm tình bằng hữu. 

Sân khấu lớn lung linh với màn LED khổng lồ trình chiếu những thước phim tư liệu 20 năm chuyển động sống động, tiếng nhạc hòa quyện khiến ai nấy đều rưng rưng tự hào vì mình là một phần của đại gia đình K8A1.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
II. BỐN CON SỐ KỶ LỤC CỦA ĐẠI LỄ K8A1
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Không chỉ thành công về mặt cảm xúc, Đại lễ K8A1 20 Năm còn xác lập 4 con số kỷ lục mang tính định chuẩn cho phong trào cựu học sinh:

• 100% CẤP THẺ HỌC SINH SỐ HÓA (STUDENT PASS): 100% thành viên tham dự được trao tặng chiếc Thẻ Học Sinh K8A1 Digital độc bản với ảnh chân dung, niên khóa và mã vạch nhận diện cá nhân hóa — một kỷ vật thanh xuân được số hóa vĩnh viễn trên điện thoại.

• 0.8 GIÂY QUÉT QR CHECK-IN ĐÓN TIẾP: Lần đầu tiên, quy trình lễ tân họp lớp được tự động hóa hoàn toàn. Chỉ một thao tác quét mã tại cổng tiệc, hệ thống tức thì nhận diện danh tính, phát lời chào vinh danh trên màn hình và điều hướng bàn tiệc chính xác mà không một giây chen chúc.

• 500+ TƯ LIỆU SỐ HÓA HD & BẢO MẬT 5 TẦNG: Hơn nửa nghìn bức ảnh và video clip quý giá trải dài 4 mốc son (2003–2006, 10 năm, 15 năm và đại lễ 20 năm) được lưu trữ trên nền tảng đám mây tốc độ cao, tích hợp công nghệ đóng dấu bản quyền Watermark độc quyền và bảo mật 5 tầng chống tải lậu.

• 100% MINH BẠCH TÀI CHÍNH TỪNG NGHÌN ĐỒNG: Toàn bộ ngân sách thu chi từ nguồn đóng góp của các thành viên, các khoản tài trợ danh dự cho đến chi phí quà tặng Thầy Cô, tiệc mừng, áo lớp... được quyết toán số hóa theo thời gian thực với biểu đồ trực quan, rõ ràng, tạo niềm tin tuyệt đối.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
III. NĂM TRỤ CỘT CÔNG NGHỆ 4.0 TIÊN PHONG
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Để tổ chức một sự kiện tầm vóc sánh ngang các hội thảo chuyên nghiệp, Ban Tổ Chức K8A1 đã tự phát triển trọn vẹn Hệ sinh thái WebApp độc quyền với 5 công nghệ mũi nhọn:

① BẢN ĐỒ 3D HỘI TỤ TOÀN CẦU: Trực quan hóa tọa độ của 50 cựu học sinh từ Hà Nội, TP.HCM, Đà Nẵng, các tỉnh thành trên cả nước và cả bạn bè định cư ở nước ngoài cùng hướng về mái trường THPT Thái Nguyên.
② THẺ HỌC SINH DIGITAL & ĐIỂM DANH QR: Chuyển đổi số toàn diện khâu đón tiếp, biến kỷ niệm thành trải nghiệm công nghệ đáng nhớ.
③ TRUNG TÂM ĐIỀU KHIỂN MÀN LED & HÒA ÂM ĐIỆN ẢNH: Toàn bộ tư liệu ký ức được phát sóng với hiệu ứng Ken Burns điện ảnh, tích hợp tính năng tự động ngắt hòa âm để nhường âm thanh khi phát các video clip kỷ niệm của lớp.
④ HỆ THỐNG BẢO VỆ TƯ LIỆU 5 TẦNG & WATERMARK K8A1: Bảo vệ hình ảnh cá nhân và gia đình của các bạn khỏi nguy cơ bị sao chép hoặc phát tán ngoài ý muốn.
⑤ TRÌNH CHIẾU KHÔNG DÂY LÊN SMART TV GIA ĐÌNH: Tính năng chia sẻ link ngắn và mã QR cho phép bất kỳ thành viên nào cũng có thể chiếu toàn bộ slide ảnh lớp lên TV phòng khách nhà mình chỉ sau 2 giây.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
IV. LỜI TRI ÂN TỪ TRÁI TIM & SỨ MỆNH KẾT NỐI VĨNH CỬU
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Thành công rực rỡ của ngày hội hôm nay được thắp sáng bởi tình yêu thương và sự đồng lòng của 50 trái tim K8A1; sự tận tâm, dẫn dắt của các Thầy Cô giáo kính yêu; và sự cống hiến không mệt mỏi của Ban Tổ Chức suốt nhiều tháng chuẩn bị.

Hai mươi năm đã qua chỉ là một chặng nghỉ chân để chúng ta cùng nhìn lại, tiếp thêm cho nhau sức mạnh và niềm tin trên con đường phía trước. K8A1 sẽ tiếp tục bước tới những cột mốc 25 năm, 30 năm với lời hứa sắt son: "Một ngày là K8A1 — Một đời là tri kỷ!".

Đồng thời, với lòng tự hào và tri ân mái trường THPT Thái Nguyên, Ban Tổ Chức K8A1 sẵn lòng chia sẻ trọn bộ kịch bản, kinh nghiệm tổ chức cũng như chuyển giao giải pháp WebApp số hóa cho các lớp bạn cùng khóa K8 và các thế hệ khóa sau, chung tay làm rạng danh truyền thống nhà trường!

K8A1 — 20 NĂM MỘT CHẶNG ĐƯỜNG, MỘT ĐỜI TÌNH BẠN!
Trân trọng,
BAN TỔ CHỨC ĐẠI LỄ 20 NĂM K8A1
Niên khóa 2003 — 2006 | THPT Thái Nguyên`,
    actionUrl: "#lich-trinh",
    actionLabel: "🏆 Khám Phá Dấu Ấn Kỷ Niệm 20 Năm",
    imageUrl: "https://lh3.googleusercontent.com/d/1PyvlmILYdK-Lx12ohrHfBV-ppDjHDhhg=w1600",
    images: [
      "https://lh3.googleusercontent.com/d/1PyvlmILYdK-Lx12ohrHfBV-ppDjHDhhg=w1600",
      "https://lh3.googleusercontent.com/d/13zT4aOkSxA64WvjMdnWYnvmQ3ymd8_tP=w1600",
      "https://lh3.googleusercontent.com/d/10XawSSwZY4SN1VxEiqwu1xTdVDrnHSJ_=w1600",
      "https://lh3.googleusercontent.com/d/1YdNfE3eTp-tFMziZGrXAKBiFGGizxqU5=w1600",
      "https://lh3.googleusercontent.com/d/1TcNE9texOQ_bc3pHFQ5v1GkkC3fmvwa_=w1600",
      "https://lh3.googleusercontent.com/d/1moPfah4fJ65JDeLb2tmsgcUS8wLwKkYJ=w1600",
      "https://lh3.googleusercontent.com/d/1vJNgqD0H1kakbcso-8l2HsmHaea0OTuk=w1600",
      "https://lh3.googleusercontent.com/d/17nTPfS_55_e6fRYJWB9H4XZ3PUtZJlCD=w1600"
    ],
    isPinned: true,
    createdAt: "28/09/2026 18:00",
    author: "Ban Tổ Chức Đại Lễ 20 Năm K8A1",
    status: "published",
    likesCount: 168,
    metrics: [
      { label: "Thẻ Học Sinh Số Hóa", value: "100%", desc: "Cá nhân hóa cho toàn bộ thành viên K8A1" },
      { label: "Tốc Độ Check-in QR", value: "0.8s", desc: "Tự động nhận diện & chỉ định bàn tiệc" },
      { label: "Tư Liệu HD Lưu Trữ", value: "500+", desc: "Bảo mật 5 tầng & Watermark bản quyền" },
      { label: "Minh Bạch Tài Chính", value: "100%", desc: "Quyết toán rõ ràng từng khoản mục" }
    ]
  },
  {
    id: "TB-01",
    title: "👗 Thông Báo Từ BTC: Timeline – Concept Chụp Ảnh – Trang Phục 20 Năm",
    category: "urgent",
    summary: "Chi tiết 3 concept trang phục chuẩn bị cho ngày 27/09: Concept 1 Áo đồng phục K8A1, Concept 2 Thanh xuân trở lại (Áo dài/Váy trắng & Sơ mi trắng), Concept 3 Hội ngộ sau 20 năm.",
    content: "THÔNG BÁO TỪ BAN TỔ CHỨC K8A1\nTIMELINE – CONCEPT – TRANG PHỤC\n(07:30 – 12:30 | Chủ Nhật, ngày 27/09/2026)\n\nBan Tổ Chức xin gửi tới toàn thể các thành viên lớp K8A1 kế hoạch chi tiết về thời gian, concept chụp ảnh và quy định trang phục trong ngày Đại lễ 20 Năm Ngày Trở Về:\n\n⏰ 07h30: CÓ MẶT TẠI TRƯỜNG THPT THÁI NGUYÊN\n• Ban Tổ Chức có mặt, đón cô giáo chủ nhiệm, chuẩn bị hoa & quà.\n• Các thành viên có mặt trước 07h45 để ổn định và chuẩn bị trang phục chụp ảnh.\n\n📸 08h00: CONCEPT 1 — \"K8A1 MỘT THỜI ĐỂ NHỚ\"\n• Trang phục: Áo đồng phục K8A1 kỷ niệm 20 năm.\n• Hoạt động: Chụp ảnh lưu niệm toàn bộ tập thể lớp, ban cán sự, chụp ảnh cùng cô giáo chủ nhiệm tại sân trường & lớp học xưa.\n\n✨ 08h30: CONCEPT 2 — \"THANH XUÂN TRỞ LẠI\"\n• Trang phục:\n  - Nữ: Áo dài trắng hoặc Váy trắng tinh khôi.\n  - Nam: Áo sơ mi trắng + Quần dài lịch sự.\n• Hoạt động: Tái hiện những khoảnh khắc học trò ngây ngô, trong trẻo dưới mái trường và hàng cây rợp bóng kỷ niệm.\n\n🚗 09h00: DI CHUYỂN VỀ XHOTEL\n• Tập thể lớp chủ động phương tiện, di chuyển an toàn và đúng giờ về nhà hàng / khách sạn XHotel (X - Restaurant).\n\n🌹 09h15: CHECK-IN & ĐÓN TIẾP THẦY CÔ TẠI XHOTEL\n• Trang phục: Giữ nguyên Áo đồng phục K8A1.\n• Hoạt động: Đón tiếp các Thầy Cô giáo, chụp ảnh thảm đỏ, backdrop check-in kỷ niệm 20 năm, giao lưu và ổn định bàn tiệc.\n\n🥂 11h00: CONCEPT 3 — \"HỘI NGỘ SAU 20 NĂM\"\n• Trang phục: Tự do, lịch sự, thanh lịch (tiệc mừng).\n• Hoạt động: Khai tiệc mừng 20 năm ngày trở về, thưởng thức ẩm thực, giao lưu văn nghệ, trò chơi bốc thăm kỷ vật và nâng ly chúc mừng chặng đường 20 năm.\n\n📌 LƯU Ý QUAN TRỌNG TỪ BAN TỔ CHỨC:\n1. Đúng giờ là ưu tiên số 1: Đề nghị các bạn có mặt đúng khung giờ 07h30 – 08h00 tại trường để đảm bảo đầy đủ hình ảnh trong toàn bộ các concept.\n2. Chuẩn bị trang phục: Mang sẵn trang phục Concept 2 (áo dài / váy trắng cho nữ; sơ mi trắng cho nam) và Concept 3 để thay tại trường và khách sạn.\n3. Áo đồng phục K8A1: Giữ áo phẳng, đẹp để lên hình tập thể đồng đều và rạng rỡ nhất.",
    imageUrl: "/sample-polo-k8a1.jpg",
    actionUrl: "#lich-trinh",
    actionLabel: "👗 Xem Chi Tiết Concept & Trang Phục",
    isPinned: true,
    createdAt: "28/09/2026 08:00",
    author: "BTC K8A1 — Trưởng Ban Trần Thị Thanh Nhạn",
    status: "published",
    likesCount: 68
  },
  {
    id: "TB-02",
    title: "📋 Kịch Bản & Timeline Chương Trình Chi Tiết (07:30 – 12:30)",
    category: "schedule",
    summary: "Lịch trình chi tiết từng khung giờ: 07:30 đón tại trường THPT Thái Nguyên, 08:00 chụp ảnh kỷ niệm, 09:00 di chuyển sang X - Restaurant, 10:00 khai mạc & tri ân Thầy Cô, 10:30 khai tiệc.",
    content: "TIMELINE CHƯƠNG TRÌNH CHI TIẾT\nKhóa 8 (2003 – 2006) — Trường THPT Thái Nguyên\nChủ Nhật, ngày 27/09/2026\n\nBan Tổ Chức trân trọng gửi tới các bạn lịch trình hoạt động chi tiết từ 07:30 đến 12:30:\n\n⏰ 07:30 – 08:00 | ĐÓN TIẾP TẠI TRƯỜNG CŨ\n• Nội dung: Đón tiếp thành viên tại cổng trường THPT Thái Nguyên, điểm danh, phát hashtag cầm tay và hoa cài áo.\n• Phụ trách: BLL - Media.\n\n📸 08:00 – 09:00 | CHỤP ẢNH KỶ NIỆM SÂN TRƯỜNG & LỚP HỌC\n• Nội dung: Chụp ảnh lưu niệm tại sân trường, dâng hoa tri ân cô giáo chủ nhiệm, chụp ảnh Concept 1 (Đồng phục) & Concept 2 (Thanh xuân trở lại), thăm lại lớp học cũ.\n• Phụ trách: BLL - Media.\n\n🚗 09:00 – 09:15 | DI CHUYỂN SANG NHÀ HÀNG\n• Nội dung: Tập thể lớp di chuyển từ Trường THPT Thái Nguyên sang nhà hàng X - Restaurant (XHotel).\n• Phụ trách: BTC Điều phối.\n\n🥂 09:15 – 10:00 | CHECK-IN THẢM ĐỎ & ĐÓN TIẾP THẦY CÔ\n• Nội dung: Check-in thảm đỏ, đón tiếp các Thầy Cô giáo, ổn định bàn tiệc, trình chiếu slideshow phóng sự kỷ niệm 20 năm và văn nghệ chào mừng.\n• Phụ trách: BLL + Media.\n\n🎤 10:00 – 10:15 | KHAI MẠC ĐẠI LỄ 20 NĂM\n• Nội dung: Khai mạc chương trình: Tuyên bố lý do, giới thiệu đại biểu và các Thầy Cô tham dự.\n• Phụ trách: MC - Media.\n\n💐 10:15 – 10:30 | TRI ÂN THẦY CÔ GIÁO\n• Nội dung: Đại diện tập thể K8A1 phát biểu tri ân, tặng hoa và quà kỷ niệm tới Thầy Cô; Lắng nghe những lời chia sẻ, căn dặn thân thương từ Thầy Cô.\n• Phụ trách: Đại diện K8A1 - Thầy Cô.\n\n🍾 10:30 | NÂNG LY KHAI TIỆC HỘI NGỘ\n• Nội dung: Toàn thể Thầy Cô và các bạn cựu học sinh K8A1 cùng nâng ly khai tiệc mừng 20 năm ngày trở về.\n• Phụ trách: MC - Media.\n\n🎶 10:30 – 11:30 | TIỆC TRƯA & GIAO LƯU GẮN KẾT\n• Nội dung: Dùng tiệc trưa thân mật kết hợp giao lưu văn nghệ ngẫu hứng, trò chơi kỷ niệm và chia sẻ tâm sự chuyện đời, chuyện nghề.\n• Phụ trách: MC - Media.\n\n🎁 11:30 – 12:00 | LỜI NHẮN 10 NĂM SAU & TRAO QUÀ\n• Nội dung: Hoạt động ý nghĩa \"Gửi lời nhắn đến 10 năm sau\", trao quà lưu niệm kỷ niệm 20 năm cho các thành viên.\n• Phụ trách: BTC - Media.\n\n📸 12:00 – 12:30 | ẢNH TẬP THỂ BẾ MẠC & CẢM ƠN\n• Nội dung: Chụp ảnh kỷ niệm tập thể bế mạc, gửi lời cảm ơn và kết thúc chương trình trong niềm hân hoan trọn vẹn.\n• Phụ trách: MC + Media.\n\nTrưởng ban: Trần Thị Thanh Nhạn",
    actionUrl: "#lich-trinh",
    actionLabel: "📅 Theo Dõi Khung Giờ Hoạt Động",
    isPinned: true,
    createdAt: "28/09/2026 08:30",
    author: "BTC K8A1 — Trưởng Ban Trần Thị Thanh Nhạn",
    status: "published",
    likesCount: 75
  },
  {
    id: "TB-03",
    title: "💌 Lời Tri Ân — K8A1 20 Năm: Một Chặng Đường, Một Đời Tình Bạn",
    category: "activity",
    summary: "Bức tâm thư tri ân sâu sắc gửi Ban Giám hiệu, các cô giáo chủ nhiệm, thầy cô bộ môn và lời cảm ơn 50 trái tim K8A1 cùng hội tụ sau 20 năm.",
    content: "LỜI TRI ÂN\nK8A1 20 NĂM: MỘT CHẶNG ĐƯỜNG, MỘT ĐỜI TÌNH BẠN\n\"Hai mươi năm – một chặng đường, một lần trở về, ngàn lần thương nhớ...\"\n\nKính gửi Ban Giám hiệu Trường THPT Thái Nguyên, các cô giáo chủ nhiệm cùng toàn thể các thầy cô giáo bộ môn đã từng giảng dạy tập thể lớp K8A1 niên khóa 2003 – 2006.\n\nHai mươi năm trước, chúng em rời xa mái trường thân yêu mang theo hành trang là tri thức, là những bài học làm người sâu sắc và cả niềm tin yêu mà thầy cô đã cần mẫn trao gửi. Hai mươi năm trôi qua, dù ở bất kỳ phương trời nào, trên mỗi bước đường trưởng thành của mỗi chúng em đều có bóng hình của mái trường xưa, có sự chở che, dìu dắt từ những tháng năm hoa niên tươi đẹp.\n\nHôm nay, trong niềm xúc động nghẹn ngào của ngày trở về, tập thể K8A1 xin được cúi đầu kính cẩn dâng lên thầy cô lời tri ân sâu sắc và lòng biết ơn vô hạn. Cảm ơn thầy cô vì đã dành trọn tâm huyết, tình thương để thắp sáng ước mơ cho chúng em.\n\nĐồng thời, xin gửi lời cảm ơn chân thành tới 50 trái tim K8A1 đã cùng nhau tề tựu, gắn kết và tiếp nối mạch nguồn tình bạn thiêng liêng sau 20 năm xa cách. Dù thời gian có đổi thay, mái tóc có ngả màu, tình bạn của chúng ta vẫn mãi vẹn nguyên như những ngày đầu dưới mái trường THPT Thái Nguyên.\n\nKính chúc các thầy cô luôn dồi dào sức khỏe, hạnh phúc và an yên!\nChúc cho tình bạn K8A1 mãi mãi xanh tươi, bền chặt theo năm tháng!\n\n\"Thanh xuân có bạn là tất cả là những điều tuyệt vời nhất! ♡\"\n\nTrưởng ban liên lạc: Trần Thị Thanh Nhạn",
    actionUrl: "#thu-ngo",
    actionLabel: "🌹 Đọc Bức Thư Tri Ân",
    isPinned: true,
    createdAt: "28/09/2026 09:00",
    author: "Trưởng Ban Liên Lạc: Trần Thị Thanh Nhạn",
    status: "published",
    likesCount: 89
  },
  {
    id: "TB-04",
    title: "👕 Áo Polo K8A1 Đồng Phục Kỷ Niệm 20 Năm Ngày Trở Về",
    category: "activity",
    summary: "Đồng phục kỷ niệm 20 năm được thiết kế độc quyền: vải thun cá sấu 4 chiều cao cấp, cổ áo dệt viền hổ phách, thêu logo mạ vàng.",
    content: "Kính gửi toàn thể các thành viên tập thể K8A1 — Niên khóa 2003 - 2006,\n\nĐể chuẩn bị chu đáo nhất cho ngày Hội khóa 20 Năm Ngày Trở Về (Chủ Nhật, 27/09/2026), Ban Liên Lạc đã hoàn tất sản xuất áo Polo đồng phục cao cấp cho toàn bộ lớp.\n\nÁo Polo K8A1 kỷ niệm 20 năm được may bằng chất liệu thun cá sấu 4 chiều co giãn cao cấp, cổ áo bo viền màu hổ phách sang trọng, thêu nổi logo trường THPT Thái Nguyên và số hiệu 20 Năm mạ vàng tinh tế bên ngực trái.\n\n⚠️ LƯU Ý KHI MẶC ÁO ĐỒNG PHỤC:\n• Toàn bộ lớp mặc áo đồng phục K8A1 trong Concept 1 (08h00 tại sân trường) và khi Đón tiếp Thầy Cô tại XHotel (09h15).\n• Giữ áo phẳng, đẹp để lên hình tập thể đồng đều và rạng rỡ nhất.\n• Các bạn có thể đăng ký bổ sung áo cho người thân hoặc F1 bằng cách liên hệ trực tiếp với Ban Liên Lạc.",
    imageUrl: "/sample-polo-k8a1.jpg",
    actionUrl: "#diem-danh",
    actionLabel: "👕 Xem Danh Sách Áo Của Bạn",
    isPinned: false,
    createdAt: "18/09/2026 08:30",
    author: "Ban Liên Lạc K8A1",
    status: "published",
    likesCount: 52
  },
  {
    id: "TB-05",
    title: "🗳️ Khảo Sát Ý Kiến: Bạn mong chờ hoạt động hoài niệm nào nhất tại Gala 20 Năm?",
    category: "poll",
    summary: "Bình chọn trực tiếp ngay trên WebApp để Ban Tổ Chức chuẩn bị kịch bản giao lưu ý nghĩa nhất cho ngày hội ngộ 27/09/2026.",
    content: "Thân gửi các bạn học K8A1 thân mến,\n\nĐể chương trình Hội khóa 20 Năm Ngày Trở Về diễn ra thật đầm ấm, giàu cảm xúc và gắn kết tất cả các thành viên, Ban Liên Lạc phát động cuộc bình chọn trực tiếp 100% ngay trên WebApp lớp mình (không cần dùng link Google Form bên ngoài).\n\nCác bạn hãy bình chọn các hoạt động hoài niệm và giao lưu mà bạn mong muốn được trải nghiệm nhất trong buổi tiệc tại XHotel / X - Restaurant (hỗ trợ chọn nhiều phương án cùng lúc).\n\nKết quả bình chọn theo thời gian thực sẽ là căn cứ để Ban Tổ Chức chốt kịch bản sân khấu, chuẩn bị quà tặng và đạo cụ hoài niệm tương ứng!",
    actionUrl: "#ban-tin",
    actionLabel: "🗳️ Bình Chọn Ngay",
    isPinned: false,
    createdAt: "14/09/2026 15:30",
    author: "Ban Liên Lạc K8A1",
    status: "published",
    likesCount: 58,
    poll: {
      question: "Bạn hào hứng nhất với hoạt động giao lưu nào tại buổi tiệc hội ngộ K8A1?",
      allowMultiple: true,
      isClosed: false,
      options: [
        {
          id: "opt-1",
          text: "🎬 Chiếu phóng sự ảnh độc quyền 'K8A1 — 20 Năm Ngày Ấy & Bây Giờ' trên màn LED lớn",
          votes: ["Đào Thị Hồng Nhung", "Trần Đăng Tuấn", "Vũ Phương Thảo"]
        },
        {
          id: "opt-2",
          text: "🎸 Hát live ca khúc tuổi học trò (Xe đạp, Phượng hồng, Kỷ niệm mái trường...) & Ban nhạc acoustic",
          votes: ["Nguyễn Hoàng Long", "Trần Đăng Tuấn", "Đỗ Mai Hương", "Phạm Quốc Hùng"]
        },
        {
          id: "opt-3",
          text: "🏆 Minigame ôn lại kỷ niệm 'Ai thông minh hơn học sinh K8A1' & Bốc thăm kỷ vật mạ vàng",
          votes: ["Vũ Phương Thảo", "Nguyễn Thị Thu Hà", "Bùi Tiến Dũng"]
        },
        {
          id: "opt-4",
          text: "🥂 Thời khắc Nâng Ly Tri Ân Thầy Cô giáo & Trao gửi tâm thư 20 năm xúc động",
          votes: ["Đào Thị Hồng Nhung", "Nguyễn Hoàng Long", "Trần Đăng Tuấn", "Vũ Phương Thảo", "Lê Văn Hoàng"]
        },
        {
          id: "opt-5",
          text: "📸 Check-in Photobooth kỷ yếu 2003-2006 phong cách Retro & Quay clip kỷ niệm TikTok/Reels",
          votes: ["Đỗ Mai Hương", "Nguyễn Thị Thu Hà"]
        }
      ]
    }
  }
];

// Logo chính thức Trường THPT Thái Nguyên (thuộc ĐH Sư Phạm - ĐH Thái Nguyên)
export const SCHOOL_LOGO_URL = "https://thpttn.tnue.edu.vn/upload/doantn/logo%20thpttn.jpg";

// URL Google Apps Script WebApp mặc định toàn hệ thống
// BLL có thể dán URL triển khai (/exec) vào đây để mọi thiết bị/ẩn danh tự động đồng bộ cùng 1 Sheet
export const DEFAULT_APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycby_hm9akENv_GmNpF8s9ALVReDd_8ORPS_RqpUZ9FS6GB_Qdnmjhh5XZ5iKZhnE_9S0/exec";

export const K8A1_DRIVE_FOLDER_ID = "1Skmip1HQhmXan-58kwbY_msamP-bWokq";
export const K8A1_DRIVE_FOLDER_URL = "https://drive.google.com/drive/folders/1Skmip1HQhmXan-58kwbY_msamP-bWokq";

export const TEACHERS_LIST: TeacherData[] = [];

export const INITIAL_TEACHER_TRIBUTES: TeacherTribute[] = [];

export const TEACHER_SUBJECT_OPTIONS = [
  "Toán Học",
  "Ngữ Văn",
  "Tiếng Anh",
  "Vật Lý",
  "Hóa Học",
  "Sinh Học",
  "Lịch Sử",
  "Địa Lý",
  "Tin Học",
  "GDCD",
  "Thể Dục",
  "GDQP-AN",
  "Công Nghệ / Kỹ Thuật",
  "Ban Giám Hiệu"
];

export const TEACHER_ROLE_OPTIONS = [
  "Giáo viên Bộ môn",
  "Chủ nhiệm Lớp 12A1",
  "Chủ nhiệm Lớp 11A1",
  "Chủ nhiệm Lớp 10A1",
  "Hiệu Trưởng",
  "Phó Hiệu Trưởng",
  "Bí Thư Đoàn Trường",
  "Tổng Phụ Trách Đội / Đoàn"
];

export const TEACHER_TRANSPORTATION_OPTIONS = [
  "Tự túc",
  "Lớp cử xe đón tại nhà",
  "Thầy tự đi cùng học trò",
  "Cô tự đi cùng học trò",
  "Đi cùng Thầy/Cô khác",
  "Cần xe đón tuyến Hà Nội - Thái Nguyên",
  "Cần hỗ trợ đưa đón tại Thái Nguyên",
  "Cần xe đưa về sau dạ tiệc"
];

export const TEACHER_HEALTH_OPTIONS = [
  "Bình thường (Không yêu cầu đặc biệt)",
  "Ngồi bàn danh dự tầng 1 (ít bậc thang)",
  "Cần hỗ trợ di chuyển (chân yếu / đi lại chậm)",
  "Ăn chay",
  "Ăn kiêng / Chế độ ăn thanh đạm",
  "Không uống rượu bia / đồ uống có cồn"
];

export const GOOGLE_APPS_SCRIPT_CODE = `/**
 * Mã nguồn Google Apps Script (Code.gs) được lưu trữ độc lập tại file Code.gs trong kho mã nguồn.
 * Để bảo mật hệ thống và ngăn lộ thông tin quản trị trên trình duyệt (F12),
 * toàn bộ mã xử lý máy chủ đã được tách rời khỏi frontend bundle.
 *
 * Vui lòng xem và chỉnh sửa file Code.gs trực tiếp trên GitHub repository.
 */`;

/**
 * ============================================================================
/**
 * ============================================================================
 * 🔐 XÁC THỰC MÃ PIN BẢO MẬT 100% QUA GOOGLE APPS SCRIPT
 * Tuyệt đối không lưu mã PIN hay chuỗi băm dự phòng trên trình duyệt frontend.
 * Mọi yêu cầu đăng nhập bắt buộc phải được máy chủ Google Sheets xác thực.
 * ============================================================================
 */

/**
 * Xác thực mã PIN an toàn qua Google Apps Script / Google Sheets
 */
export async function verifyPinViaBackend(
  pin: string,
  appsScriptUrl?: string
): Promise<{ success: boolean; role?: UserRole; message?: string; isLocked?: boolean }> {
  const cleanPin = String(pin || '').trim();
  if (!cleanPin) {
    return { success: false, message: 'Vui lòng nhập mã PIN!' };
  }

  const targetUrl = appsScriptUrl && appsScriptUrl.trim() !== ''
    ? appsScriptUrl.trim()
    : DEFAULT_APPS_SCRIPT_URL;

  if (!targetUrl || targetUrl.includes('YOUR_NEW_DEPLOYMENT_ID')) {
    return { success: false, message: 'Chưa cấu hình URL Google Apps Script hợp lệ!' };
  }

  // 1. Thử xác thực trực tuyến qua Google Apps Script / Google Sheets (POST)
  try {
    const controller = new AbortController();
    // Tăng timeout lên 15 giây để không bị abort khi server đang đồng bộ dữ liệu lúc tải đầu trang
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const res = await fetch(targetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action: 'verify_pin', pin: cleanPin }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    const json = await res.json();
    if (json.status === 'success' && json.role) {
      return { success: true, role: json.role as UserRole, message: json.message };
    }
    return {
      success: false,
      message: json.message || 'Mã PIN không đúng!',
      isLocked: json.code === 'LOCKED'
    };
  } catch (netErr: any) {
    // 2. Dự phòng qua GET nếu POST bị mạng/CORS can thiệp
    try {
      const getController = new AbortController();
      const getTimerId = setTimeout(() => getController.abort(), 10000);
      const getRes = await fetch(`${targetUrl}?action=verify_pin&pin=${encodeURIComponent(cleanPin)}&t=${Date.now()}`, {
        signal: getController.signal
      });
      clearTimeout(getTimerId);
      const getJson = await getRes.json();
      if (getJson.status === 'success' && getJson.role) {
        return { success: true, role: getJson.role as UserRole, message: getJson.message };
      }
      return {
        success: false,
        message: getJson.message || 'Mã PIN không đúng!',
        isLocked: getJson.code === 'LOCKED'
      };
    } catch (getErr) {
      return {
        success: false,
        message: 'Không thể kết nối tới máy chủ Google Sheets để xác thực mã PIN. Vui lòng kiểm tra lại kết nối mạng!'
      };
    }
  }
}

/**
 * Cập nhật và đồng bộ mã PIN bảo mật lên Google Sheets
 */
export async function updatePinsViaBackend(
  payload: { currentAdminPin: string; newAdminPin?: string; newTreasurerPin?: string; newBllPin?: string },
  appsScriptUrl?: string
): Promise<{ success: boolean; message: string }> {
  const targetUrl = appsScriptUrl && appsScriptUrl.trim() !== ''
    ? appsScriptUrl.trim()
    : DEFAULT_APPS_SCRIPT_URL;

  if (!targetUrl || targetUrl.includes('YOUR_NEW_DEPLOYMENT_ID')) {
    return { success: false, message: 'Chưa cấu hình URL Google Apps Script hợp lệ!' };
  }

  try {
    const res = await fetch(targetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        action: 'update_pins',
        ...payload
      })
    });
    const json = await res.json();
    if (json.status === 'success') {
      return { success: true, message: json.message || 'Đã đồng bộ mã PIN mới lên Google Sheets thành công!' };
    }
    return { success: false, message: json.message || 'Không thể cập nhật mã PIN trên máy chủ!' };
  } catch (err: any) {
    return { success: false, message: 'Lỗi kết nối máy chủ Google Apps Script: ' + (err?.message || err) };
  }
}

/**
 * Chủ động gửi yêu cầu khởi tạo hoặc kiểm tra Sheet Bao_Mat_PIN lên Google Sheets
 */
export async function initSecuritySheetViaBackend(
  appsScriptUrl?: string
): Promise<{ success: boolean; message: string }> {
  const targetUrl = appsScriptUrl && appsScriptUrl.trim() !== ''
    ? appsScriptUrl.trim()
    : DEFAULT_APPS_SCRIPT_URL;

  if (!targetUrl || targetUrl.includes('YOUR_NEW_DEPLOYMENT_ID')) {
    return { success: false, message: 'Chưa cấu hình URL Google Apps Script hợp lệ!' };
  }

  try {
    const res = await fetch(`${targetUrl}?action=init_security&t=${Date.now()}`);
    const json = await res.json();
    if (json.status === 'success') {
      return { success: true, message: json.message || 'Đã khởi tạo sheet Bao_Mat_PIN thành công!' };
    }
    return { success: false, message: json.message || 'Không thể khởi tạo sheet!' };
  } catch (err: any) {
    return { success: false, message: 'Lỗi kết nối máy chủ: ' + (err?.message || err) };
  }
}

/**
 * Chuẩn hóa chuỗi bỏ dấu tiếng Việt để tìm kiếm thông minh
 */
export function removeVietnameseAccents(str: string): string {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase();
}

/**
 * Tách tên gọi cuối cùng của người Việt để sắp xếp A-Z (VD: Nguyễn Tuấn Anh -> Anh)
 */
export function getVietnameseGivenName(fullName: string): string {
  if (!fullName) return '';
  const parts = fullName.trim().split(/\s+/);
  return parts[parts.length - 1] || fullName;
}

/**
 * Trích xuất chữ cái viết tắt (monogram initials) của Thầy Cô để hiển thị avatar trang trọng khi chưa có ảnh
 * VD: "Cô Trần Thị Lan" -> "TL", "Thầy Nguyễn Văn Hùng" -> "NH", "Vũ Đình Thu" -> "VT"
 */
export function getTeacherInitials(name?: string): string {
  if (!name || !name.trim()) return 'TC';
  const clean = name.replace(/^(Thầy|Cô|GS|PGS|TS|ThS)\.?\s+/i, '').trim();
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'TC';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  const first = parts[0][0];
  const last = parts[parts.length - 1][0];
  return (first + last).toUpperCase();
}

/**
 * Lấy danh sách ảnh Backdrop màn LED từ thư mục "Backdrops_SanKhau" trên Google Drive
 */
export async function fetchDriveBackdrops(appsScriptUrl?: string): Promise<BackdropItem[]> {
  const targetUrl = appsScriptUrl && appsScriptUrl.trim() !== ''
    ? appsScriptUrl.trim()
    : DEFAULT_APPS_SCRIPT_URL;

  if (!targetUrl || targetUrl.includes('YOUR_NEW_DEPLOYMENT_ID')) {
    return DEFAULT_BACKDROPS;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    const res = await fetch(`${targetUrl}?action=get_backdrops&t=${Date.now()}`, {
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    const json = await res.json();
    if (json && json.status === 'success' && Array.isArray(json.data) && json.data.length > 0) {
      return json.data;
    }
  } catch (e) {
    console.warn('Lỗi lấy backdrop từ Drive, sử dụng mặc định:', e);
  }
  return DEFAULT_BACKDROPS;
}

/**
 * Tải ảnh backdrop mới lên thư mục Drive "Backdrops_SanKhau" qua Google Apps Script
 */
export async function uploadBackdropViaBackend(
  payload: { fileData: string; title: string; pin?: string },
  appsScriptUrl?: string
): Promise<{ success: boolean; data?: BackdropItem; message?: string }> {
  const targetUrl = appsScriptUrl && appsScriptUrl.trim() !== ''
    ? appsScriptUrl.trim()
    : DEFAULT_APPS_SCRIPT_URL;

  if (!targetUrl || targetUrl.includes('YOUR_NEW_DEPLOYMENT_ID')) {
    return { success: false, message: 'Chưa cấu hình URL Google Apps Script hợp lệ!' };
  }

  try {
    // 1. Thử gửi action 'upload_backdrop' (Chuyên dụng cho thư mục Backdrops_SanKhau)
    let res = await fetch(targetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        action: 'upload_backdrop',
        fileData: payload.fileData,
        title: payload.title,
        pin: payload.pin || ''
      })
    });
    let json = await res.json();
    if (json && json.status === 'success' && json.data) {
      return { success: true, data: json.data, message: json.message || 'Tải backdrop lên Google Drive thành công!' };
    }

    // 2. Dự phòng (Fallback): Nếu Apps Script trên Google chưa deploy bản mới, dùng action 'upload_photo' đã hoạt động ổn định trên live Drive
    console.warn('Endpoint chưa cập nhật upload_backdrop, tự động chuyển sang upload_photo trên Drive:', json?.message);
    res = await fetch(targetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        action: 'upload_photo',
        fileData: payload.fileData,
        caption: '[Backdrop] ' + (payload.title || 'Backdrop Sân Khấu')
      })
    });
    json = await res.json();
    if (json && json.status === 'success' && json.data) {
      const backdropItem: BackdropItem = {
        id: json.data.id || ('bd_' + Date.now()),
        title: payload.title || 'Backdrop Sân Khấu',
        url: json.data.url,
        thumbnail: json.data.thumbnail,
        driveUrl: json.data.driveUrl,
        dateCreated: json.data.date,
        isDefault: false
      };
      return { success: true, data: backdropItem, message: 'Đã tải backdrop lên Google Drive thành công!' };
    }

    return { success: false, message: json?.message || 'Không thể tải backdrop lên Google Drive!' };
  } catch (err: any) {
    return { success: false, message: 'Lỗi kết nối máy chủ Drive: ' + (err?.message || err) };
  }
}

/**
 * Tải ảnh đại diện của học sinh lên thư mục con "Avatar_Thanh_Vien" trên Google Drive
 * Đồng thời tự động cập nhật link ảnh vào chuỗi JSON của thành viên
 */
export async function uploadMemberAvatarViaBackend(
  payload: {
    fileData: string;
    memberId?: string;
    fullName?: string;
  },
  appsScriptUrl?: string
): Promise<{ success: boolean; avatarUrl?: string; message?: string }> {
  const targetUrl = appsScriptUrl && appsScriptUrl.trim() !== ''
    ? appsScriptUrl.trim()
    : DEFAULT_APPS_SCRIPT_URL;

  if (!targetUrl || targetUrl.includes('YOUR_NEW_DEPLOYMENT_ID')) {
    return { success: false, message: 'Chưa cấu hình URL Google Apps Script hợp lệ!' };
  }

  try {
    const res = await fetch(targetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        action: 'upload_member_avatar',
        fileData: payload.fileData,
        memberId: payload.memberId || '',
        fullName: payload.fullName || ''
      })
    });

    const json = await res.json();
    if (json && (json.status === 'success' || json.avatarUrl)) {
      return {
        success: true,
        avatarUrl: json.avatarUrl || json.directUrl || json.url,
        message: json.message || 'Đã lưu avatar vào thư mục Avatar_Thanh_Vien trên Google Drive!'
      };
    }

    return {
      success: false,
      message: json?.message || 'Không thể lưu avatar lên Google Drive'
    };
  } catch (err: any) {
    return {
      success: false,
      message: 'Lỗi kết nối máy chủ Google Drive: ' + (err?.message || err)
    };
  }
}

/**
 * ---------------------------------------------------------------------------
 * CẤU HÌNH & THUẬT TOÁN PHÂN BÀN TIỆC K8A1 (5 BÀN HỌC SINH + 1 MÂM THẦY CÔ)
 * ---------------------------------------------------------------------------
 */
export const BANQUET_TABLES: TableConfigItem[] = [
  {
    id: 0,
    name: 'Mâm Tri Ân Thầy Cô',
    shortName: 'Mâm Thầy Cô',
    description: 'Dành riêng đón tiếp Thầy Cô giáo chủ nhiệm và bộ môn K8A1',
    maxCapacity: 12,
    isTeacherTable: true,
    badgeBg: 'bg-rose-100',
    badgeText: 'text-rose-900',
    badgeBorder: 'border-rose-300'
  },
  {
    id: 1,
    name: 'Bàn 01 (Mâm 1)',
    shortName: 'Bàn 01',
    description: 'Mâm tiệc học sinh K8A1 — Tuổi Trẻ & Kỷ Niệm',
    maxCapacity: 10,
    badgeBg: 'bg-amber-100',
    badgeText: 'text-amber-900',
    badgeBorder: 'border-amber-300'
  },
  {
    id: 2,
    name: 'Bàn 02 (Mâm 2)',
    shortName: 'Bàn 02',
    description: 'Mâm tiệc học sinh K8A1 — Thanh Xuân Rực Rỡ',
    maxCapacity: 10,
    badgeBg: 'bg-emerald-100',
    badgeText: 'text-emerald-900',
    badgeBorder: 'border-emerald-300'
  },
  {
    id: 3,
    name: 'Bàn 03 (Mâm 3)',
    shortName: 'Bàn 03',
    description: 'Mâm tiệc học sinh K8A1 — Gắn Kết Bền Lâu',
    maxCapacity: 10,
    badgeBg: 'bg-blue-100',
    badgeText: 'text-blue-900',
    badgeBorder: 'border-blue-300'
  },
  {
    id: 4,
    name: 'Bàn 04 (Mâm 4)',
    shortName: 'Bàn 04',
    description: 'Mâm tiệc học sinh K8A1 — 20 Năm Ngày Trở Về',
    maxCapacity: 10,
    badgeBg: 'bg-purple-100',
    badgeText: 'text-purple-900',
    badgeBorder: 'border-purple-300'
  },
  {
    id: 5,
    name: 'Bàn 05 (Mâm 5)',
    shortName: 'Bàn 05',
    description: 'Mâm tiệc học sinh K8A1 — Mãi Mãi Một Thời',
    maxCapacity: 10,
    badgeBg: 'bg-amber-100',
    badgeText: 'text-amber-900',
    badgeBorder: 'border-amber-400'
  }
];

export function getTableConfig(tableNumber?: number): TableConfigItem {
  if (tableNumber === 0) {
    return BANQUET_TABLES[0];
  }
  const found = BANQUET_TABLES.find(t => t.id === tableNumber);
  if (found) return found;
  const num = tableNumber || 1;
  return {
    id: num,
    name: `Bàn 0${num} (Mâm ${num})`,
    shortName: `Bàn 0${num}`,
    description: 'Mâm tiệc học sinh K8A1',
    maxCapacity: 10,
    badgeBg: 'bg-amber-100',
    badgeText: 'text-amber-900',
    badgeBorder: 'border-amber-300'
  };
}

/**
 * Thuật toán phân bàn thông minh cho học sinh K8A1:
 * - Rải đều thành viên BLL (hạt nhân kết nối) vào 5 bàn
 * - Cân bằng tỷ lệ Nam / Nữ
 * - Tối đa 10 người/bàn (1 đến 5)
 * - Giữ nguyên những ai đã được phân bàn từ trước (không đổi nếu đã có)
 */
export function autoAssignStudentTables(
  rsvpList: RsvpData[], 
  rosterList: ClassMember[] = CLASS_ROSTER_K8A1,
  options?: { studentHostsForTeacherTable?: number }
): { updatedList: RsvpData[]; stats: Record<number, number> } {
  const attendees = rsvpList.filter(a => a.status === 'yes');
  // Sức chứa các bàn: 0 (Mâm Thầy Cô - học sinh tiếp đón), 1-5 (Học sinh)
  const tableCounts: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  const assignedMap = new Map<string, number>();

  // 1. GIỮ NGUYÊN TUYỆT ĐỐI những ai đã có bàn hợp lệ (Bàn 0 Mâm Thầy Cô hoặc Bàn 1-5)
  attendees.forEach(a => {
    const key = a.memberId || a.phone || a.fullName;
    if (a.tableNumber !== undefined && a.tableNumber !== null && a.tableNumber >= 0 && a.tableNumber <= 5) {
      assignedMap.set(key, a.tableNumber);
      tableCounts[a.tableNumber] = (tableCounts[a.tableNumber] || 0) + 1;
    }
  });

  const unassigned = attendees.filter(a => {
    const key = a.memberId || a.phone || a.fullName;
    return !assignedMap.has(key);
  });

  if (unassigned.length > 0) {
    const isBLL = (a: RsvpData) => {
      const roster = rosterList.find(m => (a.memberId && m.id === a.memberId) || isVietnameseNameMatch(m.fullName, a.fullName));
      return isOfficialBLLMember(roster) || isOfficialBLLMember(a as any);
    };

    const isFemale = (a: RsvpData) => {
      const roster = rosterList.find(m => (a.memberId && m.id === a.memberId) || isVietnameseNameMatch(m.fullName, a.fullName));
      const g = (roster?.gender || '').toLowerCase();
      if (g.includes('nữ') || g.includes('female') || g === 'f') return true;
      const fn = a.fullName.toLowerCase();
      return fn.includes('thị') || fn.includes('ngọc') || fn.includes('hương') || fn.includes('mai') || fn.includes('lan');
    };

    const bllMembers = unassigned.filter(isBLL);
    const nonBllMembers = unassigned.filter(a => !isBLL(a));
    const females = nonBllMembers.filter(isFemale);
    const males = nonBllMembers.filter(a => !isFemale(a));

    const pickBestTable = () => {
      let bestTable = 1;
      let minCount = 999;
      for (let t = 1; t <= 5; t++) {
        const count = tableCounts[t] || 0;
        if (count < minCount && count < 10) {
          minCount = count;
          bestTable = t;
        }
      }
      return bestTable;
    };

    // Tùy chọn: Bố trí học sinh ngồi Mâm Thầy Cô để tiếp đón (mặc định 2-4 bạn nếu chưa ai được phân)
    const targetHosts = options?.studentHostsForTeacherTable !== undefined ? options.studentHostsForTeacherTable : 2;
    let currentHosts = tableCounts[0] || 0;

    // Nếu Mâm Thầy Cô chưa đủ số học sinh tiếp đón, ưu tiên phân Cán sự BLL vào Mâm 0
    if (currentHosts < targetHosts && bllMembers.length > 0) {
      const hostsToPick = Math.min(targetHosts - currentHosts, bllMembers.length);
      for (let h = 0; h < hostsToPick; h++) {
        const host = bllMembers.shift();
        if (host) {
          const key = host.memberId || host.phone || host.fullName;
          assignedMap.set(key, 0);
          tableCounts[0] = (tableCounts[0] || 0) + 1;
        }
      }
    }

    // 1. Rải đều BLL còn lại vào 5 bàn học sinh (1-5)
    bllMembers.forEach(a => {
      const t = pickBestTable();
      const key = a.memberId || a.phone || a.fullName;
      assignedMap.set(key, t);
      tableCounts[t] = (tableCounts[t] || 0) + 1;
    });

    // 2. Rải đều Nữ
    females.forEach(a => {
      const t = pickBestTable();
      const key = a.memberId || a.phone || a.fullName;
      assignedMap.set(key, t);
      tableCounts[t] = (tableCounts[t] || 0) + 1;
    });

    // 3. Rải đều Nam
    males.forEach(a => {
      const t = pickBestTable();
      const key = a.memberId || a.phone || a.fullName;
      assignedMap.set(key, t);
      tableCounts[t] = (tableCounts[t] || 0) + 1;
    });
  }

  const nowStr = new Date().toLocaleDateString('vi-VN') + ' ' + new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  const updatedList = rsvpList.map(item => {
    if (item.status !== 'yes') return item;
    const key = item.memberId || item.phone || item.fullName;
    const tNum = assignedMap.get(key) !== undefined ? assignedMap.get(key)! : (item.tableNumber !== undefined ? item.tableNumber : 1);
    const tCfg = getTableConfig(tNum);
    const tableNameStr = tNum === 0 ? 'Mâm Thầy Cô' : tCfg.name;
    return {
      ...item,
      tableNumber: tNum,
      tableName: tableNameStr,
      tableAssignedAt: item.tableAssignedAt || nowStr
    };
  });

  return { updatedList, stats: tableCounts };
}




/**
 * Định dạng thời gian hiển thị gọn gàng, đẹp mắt cho ảnh/video kỷ niệm
 * Loại bỏ chuỗi ngày giờ dài thô kệch dạng 'Mon Sep 28 2026 22:29:00 GMT+0700...'
 */
export function formatDisplayDate(dateStr?: any): string {
  if (!dateStr) return '';
  if (dateStr instanceof Date) {
    const pad = (n: number) => n < 10 ? '0' + n : n;
    return pad(dateStr.getDate()) + '/' + pad(dateStr.getMonth() + 1) + '/' + dateStr.getFullYear();
  }
  const str = String(dateStr).trim();
  if (!str) return '';

  // Nếu là năm hoặc khoảng năm đơn thuần (ví dụ: '2006', '2003-2006', '2003 — 2006')
  if (/^\d{4}(\s*[-—–]\s*\d{4})?$/.test(str)) {
    return str;
  }

  // Nếu là chuỗi ngày dạng DD/MM/YYYY ngắn gọn (ví dụ: '28/09/2026')
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(str)) {
    return str;
  }

  // Nếu là dạng có giờ '28/09/2026 14:25' -> lấy ngày '28/09/2026'
  const dateMatch = str.match(/^(\d{1,2}\/\d{1,2}\/\d{4})/);
  if (dateMatch) {
    return dateMatch[1];
  }

  // Nếu chứa ngày giờ dài dạng 'Mon Sep 28 2026 22:29:00 GMT+0700...' hoặc ISO
  const d = new Date(str);
  if (!isNaN(d.getTime())) {
    const pad = (n: number) => n < 10 ? '0' + n : n;
    const year = d.getFullYear();
    // Nếu là niên khóa 2003-2006 thì hiển thị năm
    if (year >= 2003 && year <= 2006) {
      return '' + year;
    }
    return pad(d.getDate()) + '/' + pad(d.getMonth() + 1) + '/' + year;
  }

  return str.length > 15 ? '' : str;
}
