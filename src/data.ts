import { UserRole, RsvpData, WishData, MemoryImage, MemoryVideo, TimelineMilestone, QuizQuestion, PollItem, ScheduleItem, SponsorItem, EventConfig, ClassMember, ExpenseCategory, IncomeCategory, ExpenseItem, IncomeItem, TeacherData, TeacherTribute, MusicTrack, BackdropItem, StageSettings, TableConfigItem, PhotoAlbum } from './types';
export {
  isValidVietnamesePhone,
  normalizeVietnamesePhone,
  formatPhoneDisplay,
  maskPhoneSecure,
  verifyLast4Digits,
  findDuplicatePhoneInRoster
} from './utils/phoneUtils';

// PhiÃªn báº£n bá»™ nhá»› Ä‘á»‡m á»©ng dá»¥ng (Thay Ä‘á»•i khi cÃ³ cáº¥u trÃºc dá»¯ liá»‡u hoáº·c danh báº¡ má»›i Ä‘á»ƒ tá»± Ä‘á»™ng dá»n sáº¡ch cache cÅ© trÃªn mÃ¡y thÃ nh viÃªn)
export const CURRENT_CACHE_VERSION = 'k8a1_v2026.09.30_announcements_v13';

/**
 * Tá»± Ä‘á»™ng kiá»ƒm tra vÃ  dá»n dáº¹p sáº¡ch toÃ n bá»™ cache cÅ© tÃ n dÆ° trÃªn Ä‘iá»‡n thoáº¡i thÃ nh viÃªn
 * Äáº£m báº£o 100% ngÆ°á»i dÃ¹ng truy cáº­p tá»« Zalo hÃ´m nay sáº½ luÃ´n tháº¥y dá»¯ liá»‡u tháº­t má»›i nháº¥t
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
    console.warn('Lá»—i kiá»ƒm tra phiÃªn báº£n cache:', err);
  }
  return false;
}

// Danh sÃ¡ch Ä‘iá»ƒm danh RSVP ban Ä‘áº§u (Äá»“ng bá»™ 100% Ä‘á»™ng tá»« Google Sheets tab Trang_tinh_1)
export const INITIAL_RSVP_LIST: RsvpData[] = [];

// Danh báº¡ há»c sinh lá»›p K8A1 (Äá»“ng bá»™ 100% Ä‘á»™ng tá»« Google Sheets tab Danh_Sach_Lop)
export const CLASS_ROSTER_K8A1: ClassMember[] = [];

export const isOfficialBLLMember = (member?: ClassMember | null): boolean => {
  if (!member || !member.role) return false;
  const r = member.role.toLowerCase().trim();
  return (
    r.includes('ban liÃªn láº¡c') ||
    r.includes('admin') ||
    r.includes('thá»§ quá»¹') ||
    r.includes('bÃ­ thÆ°') ||
    r.includes('lá»›p trÆ°á»Ÿng') ||
    r.includes('lá»›p phÃ³') ||
    r.includes('trÆ°á»Ÿng ban') ||
    r.includes('bll')
  );
};

export const INITIAL_WISHES_LIST: WishData[] = [];

// =============================================================================
// DANH SÃCH CÃC FOLDER / ALBUM áº¢NH Ká»¶ NIá»†M Máº¶C Äá»ŠNH CHUáº¨N K8A1
// =============================================================================
export const DEFAULT_ALBUMS: PhotoAlbum[] = [
  {
    id: 'thanh-xuan-2003-2006',
    title: 'ðŸŽ’ K8A1 Thá»i NiÃªn Thiáº¿u (2003 â€” 2006)',
    description: 'Nhá»¯ng ngÃ y thÃ¡ng há»c trÃ² ngÃ¢y ngÃ´ dÆ°á»›i mÃ¡i trÆ°á»ng THPT ThÃ¡i NguyÃªn, tÃ  Ã¡o tráº¯ng, hoa phÆ°á»£ng Ä‘á» vÃ  bao ká»· niá»‡m thá»i hoa niÃªn.',
    period: '2003 â€” 2006',
    order: 1,
    coverPhotoUrl: 'https://lh3.googleusercontent.com/d/1Q05JWOgOF2tWTk0yZ6IRQlnmInLYF5xD=w1600',
    driveFolderId: '1zr5W6Yy7k-eeJ2kVEviqE9Z0bUxVXOgo',
    driveFolderUrl: 'https://drive.google.com/drive/folders/1zr5W6Yy7k-eeJ2kVEviqE9Z0bUxVXOgo',
    allowPublicUpload: true
  },
  {
    id: 'thay-co-mai-truong',
    title: 'ðŸ‘¨â€ðŸ« Tri Ã‚n Tháº§y CÃ´ GiÃ¡o',
    description: 'Khoáº£nh kháº¯c kÃ­nh dÃ¢ng táº¥m lÃ²ng tri Ã¢n tá»›i nhá»¯ng ngÆ°á»i tháº§y, ngÆ°á»i cÃ´ Ä‘Ã£ táº­n tá»¥y dÃ¬u dáº¯t bao tháº¿ há»‡ K8A1.',
    period: '2003 â€” Nay',
    order: 2,
    coverPhotoUrl: 'https://lh3.googleusercontent.com/d/1Z6wWcSwqY6SqmIawq0Bqixx8bOy55dhv=w1600',
    driveFolderId: '1nbo9ePPdFBSMvvl_fvUk-67P9MiYvC44',
    driveFolderUrl: 'https://drive.google.com/drive/folders/1nbo9ePPdFBSMvvl_fvUk-67P9MiYvC44',
    allowPublicUpload: true
  },
  {
    id: 'hoi-ngo-10-nam',
    title: 'ðŸ» 10 NÄƒm TÃ¡i Ngá»™ (2016)',
    description: 'Nhá»¯ng ná»¥ cÆ°á»i ráº¡ng rá»¡ vÃ  cáº£m xÃºc váº¹n nguyÃªn trong láº§n gáº·p máº·t ká»· niá»‡m 10 nÄƒm ngÃ y ra trÆ°á»ng.',
    period: '2016',
    order: 3,
    coverPhotoUrl: 'https://lh3.googleusercontent.com/d/1iXWP-WZniC5rcV0qevoymDvFxG41DXXX=w1600',
    driveFolderId: '1e6y68lVtLYyXR6et2O2k8jp-UIZYoaH9',
    driveFolderUrl: 'https://drive.google.com/drive/folders/1e6y68lVtLYyXR6et2O2k8jp-UIZYoaH9',
    allowPublicUpload: true
  },
  {
    id: 'hoi-ngo-15-nam',
    title: 'ðŸŒŸ 15 NÄƒm TÃ¬nh Báº¡n (2021)',
    description: 'Má»™t cháº·ng Ä‘Æ°á»ng gáº¯n káº¿t, trÆ°á»Ÿng thÃ nh vÃ  cÃ¹ng nhau sáº» chia nhá»¯ng cÃ¢u chuyá»‡n Ä‘á»i thÆ°á»ng áº¥m Ã¡p.',
    period: '2021',
    order: 4,
    coverPhotoUrl: 'https://lh3.googleusercontent.com/d/1Z7WKN4cvYk_PTpvELz0d75XuVYh17aKh=w1600',
    driveFolderId: '10o1ruR52sOUWeA3nEx4u2d3nnHtNI2QH',
    driveFolderUrl: 'https://drive.google.com/drive/folders/10o1ruR52sOUWeA3nEx4u2d3nnHtNI2QH',
    allowPublicUpload: true
  },
  {
    id: 'dai-le-20-nam',
    title: 'ðŸŽ‰ 20 NÄƒm NgÃ y Trá»Ÿ Vá» (2026)',
    description: 'CÃ´ng tÃ¡c chuáº©n bá»‹, cÃ¡c buá»•i gáº·p gá»¡ háº­u trÆ°á»ng vÃ  toÃ n bá»™ khoáº£nh kháº¯c bÃ¹ng ná»• cá»§a Äáº¡i lá»… 20 nÄƒm.',
    period: '2026',
    order: 5,
    coverPhotoUrl: 'https://lh3.googleusercontent.com/d/1I_28ZEncmuRjMrPHMIg396qa8yko2Tsm=w1600',
    driveFolderId: '19NiwMjF0T4wo_Tq9iFSzSphmtxppkXl2',
    driveFolderUrl: 'https://drive.google.com/drive/folders/19NiwMjF0T4wo_Tq9iFSzSphmtxppkXl2',
    allowPublicUpload: true
  },
  {
    id: 'dong-gop-k8a1',
    title: 'ðŸ“¸ GÃ³c ThÃ nh ViÃªn ÄÃ³ng GÃ³p',
    description: 'Nhá»¯ng gÃ³c áº£nh tá»± chá»¥p, ká»· niá»‡m Ä‘á»i thÆ°á»ng do chÃ­nh cÃ¡c thÃ nh viÃªn K8A1 Ä‘Ã³ng gÃ³p vÃ  chia sáº».',
    period: 'Má»i thá»i Ä‘iá»ƒm',
    order: 6,
    coverPhotoUrl: 'https://lh3.googleusercontent.com/d/1efoyI0s5oo9mIbr6k_ng-tAa2Zk-blDb=w1600',
    driveFolderId: '1oGqhwhNOcbA2soBVCdsd9y6DSsZ3gvWl',
    driveFolderUrl: 'https://drive.google.com/drive/folders/1oGqhwhNOcbA2soBVCdsd9y6DSsZ3gvWl',
    allowPublicUpload: true
  }
];

/**
 * Chuáº©n hÃ³a Album ID tá»« báº¥t ká»³ ID cÅ© (legacy) hoáº·c alias
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
 * LÃ m sáº¡ch vÃ  khá»­ trÃ¹ng láº·p danh sÃ¡ch Album (tá»± Ä‘á»™ng gá»™p 12 album vá» Ä‘Ãºng 6 album chuáº©n, báº£o toÃ n tiÃªu Ä‘á» vÃ  thÃ´ng tin chá»‰nh sá»­a)
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

  // Khá»­ trÃ¹ng láº·p: náº¿u danh sÃ¡ch cÃ³ cáº£ ID gá»‘c (legacy) vÃ  ID chuáº©n (canonical), Æ°u tiÃªn ID chuáº©n
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
        title: (alb.title && alb.title.trim()) || 'Album Má»›i',
        order: (alb.order !== undefined && !isNaN(Number(alb.order))) ? Number(alb.order) : (resultMap.size + 1),
        allowPublicUpload: alb.allowPublicUpload !== false
      });
    }
  });

  return Array.from(resultMap.values()).sort((a, b) => (a.order || 99) - (b.order || 99));
}

/**
 * Tá»± Ä‘á»™ng phÃ¢n loáº¡i Album cho áº£nh náº¿u áº£nh chÆ°a cÃ³ albumId hoáº·c chuáº©n hÃ³a ID cÅ©
 */
export function getPhotoAlbumId(photo: Partial<MemoryImage>): string {
  if (photo.albumId) {
    return normalizeAlbumId(photo.albumId);
  }
  const text = `${photo.caption || ''} ${photo.date || ''} ${photo.albumName || ''}`.toLowerCase();
  if (text.includes('tháº§y') || text.includes('cÃ´') || text.includes('giÃ¡o') || text.includes('tri Ã¢n') || text.includes('mÃ¡i trÆ°á»ng')) {
    return 'thay-co-mai-truong';
  }
  if (text.includes('2016') || text.includes('10 nÄƒm') || text.includes('10y') || text.includes('tÃ¡i ngá»™')) {
    return 'hoi-ngo-10-nam';
  }
  if (text.includes('2021') || text.includes('15 nÄƒm') || text.includes('15y') || text.includes('tÃ¬nh báº¡n')) {
    return 'hoi-ngo-15-nam';
  }
  if (text.includes('2026') || text.includes('20 nÄƒm') || text.includes('20y') || text.includes('Ä‘áº¡i lá»…') || text.includes('trá»Ÿ vá»')) {
    return 'dai-le-20-nam';
  }
  if (text.includes('Ä‘Ã³ng gÃ³p') || text.includes('thÃ nh viÃªn') || text.includes('tá»± chá»¥p') || text.includes('tÆ° liá»‡u')) {
    return 'dong-gop-k8a1';
  }
  return 'thanh-xuan-2003-2006';
}

// ThÆ° viá»‡n áº£nh ká»· niá»‡m chÃ­nh thá»©c lá»›p K8A1 (Tá»± Ä‘á»™ng Ä‘á»“ng bá»™ vá»›i Google Drive)
export const DEFAULT_MEMORIES: MemoryImage[] = [
  {
    "id": "16qTHGfkz6rB0HrWsXMML3_K9Ji89fUaA",
    "url": "https://lh3.googleusercontent.com/d/16qTHGfkz6rB0HrWsXMML3_K9Ji89fUaA=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/16qTHGfkz6rB0HrWsXMML3_K9Ji89fUaA=w600",
    "driveUrl": "https://drive.google.com/file/d/16qTHGfkz6rB0HrWsXMML3_K9Ji89fUaA/view?usp=drivesdk",
    "caption": "499270042 3806814892797839 2072592384911416816 n",
    "date": "05/09/2026 09:06",
    "albumId": "dong-gop-k8a1",
    "albumName": "ÄÃ³ng GÃ³p & TÆ° Liá»‡u ThÃ nh ViÃªn",
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
    "albumName": "ÄÃ³ng GÃ³p & TÆ° Liá»‡u ThÃ nh ViÃªn",
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
    "albumName": "ÄÃ³ng GÃ³p & TÆ° Liá»‡u ThÃ nh ViÃªn",
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
    "albumName": "ÄÃ³ng GÃ³p & TÆ° Liá»‡u ThÃ nh ViÃªn",
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
    "albumName": "ÄÃ³ng GÃ³p & TÆ° Liá»‡u ThÃ nh ViÃªn",
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
    "albumName": "ÄÃ³ng GÃ³p & TÆ° Liá»‡u ThÃ nh ViÃªn",
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
    "albumName": "Há»™i Ngá»™ 15 NÄƒm (2021)",
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
    "albumName": "Há»™i Ngá»™ 15 NÄƒm (2021)",
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
    "albumName": "Há»™i Ngá»™ 15 NÄƒm (2021)",
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
    "albumName": "Há»™i Ngá»™ 15 NÄƒm (2021)",
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
    "albumName": "Há»™i Ngá»™ 15 NÄƒm (2021)",
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
    "albumName": "Há»™i Ngá»™ 15 NÄƒm (2021)",
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
    "albumName": "Há»™i Ngá»™ 15 NÄƒm (2021)",
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
    "albumName": "Há»™i Ngá»™ 15 NÄƒm (2021)",
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
    "albumName": "Há»™i Ngá»™ 15 NÄƒm (2021)",
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
    "albumName": "Há»™i Ngá»™ 15 NÄƒm (2021)",
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
    "albumName": "Há»™i Ngá»™ 15 NÄƒm (2021)",
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
    "albumName": "Há»™i Ngá»™ 15 NÄƒm (2021)",
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
    "albumName": "Há»™i Ngá»™ 15 NÄƒm (2021)",
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
    "albumName": "Há»™i Ngá»™ 15 NÄƒm (2021)",
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
    "albumName": "Há»™i Ngá»™ 15 NÄƒm (2021)",
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
    "albumName": "Há»™i Ngá»™ 15 NÄƒm (2021)",
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
    "albumName": "Há»™i Ngá»™ 15 NÄƒm (2021)",
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
    "albumName": "Há»™i Ngá»™ 15 NÄƒm (2021)",
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
    "albumName": "Há»™i Ngá»™ 15 NÄƒm (2021)",
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
    "albumName": "Há»™i Ngá»™ 15 NÄƒm (2021)",
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
    "albumName": "Há»™i Ngá»™ 15 NÄƒm (2021)",
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
    "albumName": "Há»™i Ngá»™ 15 NÄƒm (2021)",
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
    "albumName": "Há»™i Ngá»™ 15 NÄƒm (2021)",
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
    "albumName": "Há»™i Ngá»™ 15 NÄƒm (2021)",
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
    "albumName": "Há»™i Ngá»™ 15 NÄƒm (2021)",
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
    "albumName": "Há»™i Ngá»™ 15 NÄƒm (2021)",
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
    "albumName": "Há»™i Ngá»™ 15 NÄƒm (2021)",
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
    "albumName": "Há»™i Ngá»™ 15 NÄƒm (2021)",
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
    "albumName": "Há»™i Ngá»™ 15 NÄƒm (2021)",
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
    "albumName": "Há»™i Ngá»™ 15 NÄƒm (2021)",
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
    "albumName": "Há»™i Ngá»™ 15 NÄƒm (2021)",
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
    "albumName": "Há»™i Ngá»™ 15 NÄƒm (2021)",
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
    "albumName": "Há»™i Ngá»™ 15 NÄƒm (2021)",
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
    "albumName": "Há»™i Ngá»™ 15 NÄƒm (2021)",
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
    "albumName": "Há»™i Ngá»™ 15 NÄƒm (2021)",
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
    "albumName": "Há»™i Ngá»™ 15 NÄƒm (2021)",
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
    "albumName": "Há»™i Ngá»™ 15 NÄƒm (2021)",
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
    "albumName": "Há»™i Ngá»™ 15 NÄƒm (2021)",
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
    "albumName": "Há»™i Ngá»™ 15 NÄƒm (2021)",
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
    "albumName": "Há»™i Ngá»™ 15 NÄƒm (2021)",
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
    "albumName": "Há»™i Ngá»™ 15 NÄƒm (2021)",
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
    "albumName": "Há»™i Ngá»™ 15 NÄƒm (2021)",
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
    "albumName": "Há»™i Ngá»™ 15 NÄƒm (2021)",
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
    "albumName": "Há»™i Ngá»™ 15 NÄƒm (2021)",
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
    "albumName": "Há»™i Ngá»™ 15 NÄƒm (2021)",
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
    "albumName": "Há»™i Ngá»™ 15 NÄƒm (2021)",
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
    "albumName": "Há»™i Ngá»™ 15 NÄƒm (2021)",
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
    "albumName": "Há»™i Ngá»™ 15 NÄƒm (2021)",
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
    "albumName": "Há»™i Ngá»™ 15 NÄƒm (2021)",
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
    "albumName": "Há»™i Ngá»™ 15 NÄƒm (2021)",
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
    "albumName": "Há»™i Ngá»™ 15 NÄƒm (2021)",
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
    "albumName": "Há»™i Ngá»™ 15 NÄƒm (2021)",
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
    "albumName": "Há»™i Ngá»™ 10 NÄƒm (2016)",
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
    "albumName": "Há»™i Ngá»™ 10 NÄƒm (2016)",
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
    "albumName": "Há»™i Ngá»™ 10 NÄƒm (2016)",
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
    "albumName": "Há»™i Ngá»™ 10 NÄƒm (2016)",
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
    "albumName": "Há»™i Ngá»™ 10 NÄƒm (2016)",
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
    "albumName": "Há»™i Ngá»™ 10 NÄƒm (2016)",
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
    "albumName": "Há»™i Ngá»™ 10 NÄƒm (2016)",
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
    "albumName": "Thá»i NiÃªn Thiáº¿u (2003 â€” 2006)",
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
    "albumName": "Thá»i NiÃªn Thiáº¿u (2003 â€” 2006)",
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
    "albumName": "Thá»i NiÃªn Thiáº¿u (2003 â€” 2006)",
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
    "albumName": "Thá»i NiÃªn Thiáº¿u (2003 â€” 2006)",
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
    "albumName": "Thá»i NiÃªn Thiáº¿u (2003 â€” 2006)",
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
    "albumName": "Thá»i NiÃªn Thiáº¿u (2003 â€” 2006)",
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
    "albumName": "Thá»i NiÃªn Thiáº¿u (2003 â€” 2006)",
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
    "albumName": "Thá»i NiÃªn Thiáº¿u (2003 â€” 2006)",
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
    "albumName": "Thá»i NiÃªn Thiáº¿u (2003 â€” 2006)",
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
    "albumName": "Thá»i NiÃªn Thiáº¿u (2003 â€” 2006)",
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
    "albumName": "Thá»i NiÃªn Thiáº¿u (2003 â€” 2006)",
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
    "albumName": "Thá»i NiÃªn Thiáº¿u (2003 â€” 2006)",
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
    "albumName": "Thá»i NiÃªn Thiáº¿u (2003 â€” 2006)",
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
    "albumName": "Thá»i NiÃªn Thiáº¿u (2003 â€” 2006)",
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
    "albumName": "Thá»i NiÃªn Thiáº¿u (2003 â€” 2006)",
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
    "albumName": "Thá»i NiÃªn Thiáº¿u (2003 â€” 2006)",
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
    "albumName": "Thá»i NiÃªn Thiáº¿u (2003 â€” 2006)",
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
    "albumName": "Thá»i NiÃªn Thiáº¿u (2003 â€” 2006)",
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
    "albumName": "Thá»i NiÃªn Thiáº¿u (2003 â€” 2006)",
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
    "albumName": "Thá»i NiÃªn Thiáº¿u (2003 â€” 2006)",
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
    "albumName": "Thá»i NiÃªn Thiáº¿u (2003 â€” 2006)",
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
    "albumName": "Thá»i NiÃªn Thiáº¿u (2003 â€” 2006)",
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
    "albumName": "Thá»i NiÃªn Thiáº¿u (2003 â€” 2006)",
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
    "albumName": "Thá»i NiÃªn Thiáº¿u (2003 â€” 2006)",
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
    "albumName": "Thá»i NiÃªn Thiáº¿u (2003 â€” 2006)",
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
    "albumName": "Thá»i NiÃªn Thiáº¿u (2003 â€” 2006)",
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
    "albumName": "Thá»i NiÃªn Thiáº¿u (2003 â€” 2006)",
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
    "albumName": "Thá»i NiÃªn Thiáº¿u (2003 â€” 2006)",
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
    "albumName": "Thá»i NiÃªn Thiáº¿u (2003 â€” 2006)",
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
    "albumName": "Thá»i NiÃªn Thiáº¿u (2003 â€” 2006)",
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
    "albumName": "Thá»i NiÃªn Thiáº¿u (2003 â€” 2006)",
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
    "albumName": "Thá»i NiÃªn Thiáº¿u (2003 â€” 2006)",
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
    "albumName": "Thá»i NiÃªn Thiáº¿u (2003 â€” 2006)",
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
    "albumName": "Thá»i NiÃªn Thiáº¿u (2003 â€” 2006)",
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
    "albumName": "Thá»i NiÃªn Thiáº¿u (2003 â€” 2006)",
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
    "albumName": "Thá»i NiÃªn Thiáº¿u (2003 â€” 2006)",
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
    "albumName": "Thá»i NiÃªn Thiáº¿u (2003 â€” 2006)",
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
    "albumName": "Thá»i NiÃªn Thiáº¿u (2003 â€” 2006)",
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
    "albumName": "Thá»i NiÃªn Thiáº¿u (2003 â€” 2006)",
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
    "albumName": "Thá»i NiÃªn Thiáº¿u (2003 â€” 2006)",
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
    "albumName": "Thá»i NiÃªn Thiáº¿u (2003 â€” 2006)",
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
    "albumName": "Thá»i NiÃªn Thiáº¿u (2003 â€” 2006)",
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
    "albumName": "Thá»i NiÃªn Thiáº¿u (2003 â€” 2006)",
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
    "albumName": "Thá»i NiÃªn Thiáº¿u (2003 â€” 2006)",
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
    "albumName": "Thá»i NiÃªn Thiáº¿u (2003 â€” 2006)",
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
    "albumName": "Thá»i NiÃªn Thiáº¿u (2003 â€” 2006)",
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
    "albumName": "Thá»i NiÃªn Thiáº¿u (2003 â€” 2006)",
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
    "albumName": "Thá»i NiÃªn Thiáº¿u (2003 â€” 2006)",
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
    "albumName": "Thá»i NiÃªn Thiáº¿u (2003 â€” 2006)",
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
    "albumName": "Thá»i NiÃªn Thiáº¿u (2003 â€” 2006)",
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
    "albumName": "Thá»i NiÃªn Thiáº¿u (2003 â€” 2006)",
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
    "albumName": "Thá»i NiÃªn Thiáº¿u (2003 â€” 2006)",
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
    "albumName": "Thá»i NiÃªn Thiáº¿u (2003 â€” 2006)",
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
    "albumName": "Thá»i NiÃªn Thiáº¿u (2003 â€” 2006)",
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
    "albumName": "Thá»i NiÃªn Thiáº¿u (2003 â€” 2006)",
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
    "albumName": "Thá»i NiÃªn Thiáº¿u (2003 â€” 2006)",
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
    "albumName": "Thá»i NiÃªn Thiáº¿u (2003 â€” 2006)",
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
    "albumName": "Thá»i NiÃªn Thiáº¿u (2003 â€” 2006)",
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
    "albumName": "Thá»i NiÃªn Thiáº¿u (2003 â€” 2006)",
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
    "albumName": "Thá»i NiÃªn Thiáº¿u (2003 â€” 2006)",
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
    "albumName": "Thá»i NiÃªn Thiáº¿u (2003 â€” 2006)",
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
    "albumName": "Thá»i NiÃªn Thiáº¿u (2003 â€” 2006)",
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
    "albumName": "Thá»i NiÃªn Thiáº¿u (2003 â€” 2006)",
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
    "albumName": "Thá»i NiÃªn Thiáº¿u (2003 â€” 2006)",
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
    "albumName": "Thá»i NiÃªn Thiáº¿u (2003 â€” 2006)",
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
    "albumName": "Thá»i NiÃªn Thiáº¿u (2003 â€” 2006)",
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
    "albumName": "Thá»i NiÃªn Thiáº¿u (2003 â€” 2006)",
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
    "albumName": "Thá»i NiÃªn Thiáº¿u (2003 â€” 2006)",
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
    "albumName": "Thá»i NiÃªn Thiáº¿u (2003 â€” 2006)",
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
    "albumName": "Thá»i NiÃªn Thiáº¿u (2003 â€” 2006)",
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
    "albumName": "Thá»i NiÃªn Thiáº¿u (2003 â€” 2006)",
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
    "albumName": "Thá»i NiÃªn Thiáº¿u (2003 â€” 2006)",
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
    "albumName": "Thá»i NiÃªn Thiáº¿u (2003 â€” 2006)",
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
    "albumName": "Thá»i NiÃªn Thiáº¿u (2003 â€” 2006)",
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
    "albumName": "Thá»i NiÃªn Thiáº¿u (2003 â€” 2006)",
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
    "albumName": "Thá»i NiÃªn Thiáº¿u (2003 â€” 2006)",
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
    "albumName": "Thá»i NiÃªn Thiáº¿u (2003 â€” 2006)",
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
    "albumName": "Thá»i NiÃªn Thiáº¿u (2003 â€” 2006)",
    "driveFolderId": "1zr5W6Yy7k-eeJ2kVEviqE9Z0bUxVXOgo"
  }
];

// Danh sÃ¡ch video ká»· niá»‡m chÃ­nh thá»©c lá»›p K8A1 (Ä‘á»“ng bá»™ 2 chiá»u vá»›i Google Sheet tab Media_Cai_Dat)
export const DEFAULT_VIDEOS: MemoryVideo[] = [
  {
    id: "vid-1788596300181",
    title: "Ká»· niá»‡m thá»i cáº¥p 3 - K8A1(9)",
    embedUrl: "https://www.youtube.com/embed/qOwNuWY30iw"
  },
  {
    id: "vid-1788596273398",
    title: "Ká»· niá»‡m thá»i cáº¥p 3 - K8A1(8)",
    embedUrl: "https://www.youtube.com/embed/KNLrdmy_Hvk"
  },
  {
    id: "vid-1788596247429",
    title: "Ká»· niá»‡m thá»i cáº¥p 3 - K8A1(7)",
    embedUrl: "https://www.youtube.com/embed/ga68cDkrSDo"
  },
  {
    id: "vid-1788596221141",
    title: "Ká»· niá»‡m thá»i cáº¥p 3 - K8A1(6)",
    embedUrl: "https://www.youtube.com/embed/UX9N3P3yks4"
  },
  {
    id: "vid-1788596163830",
    title: "Ká»· niá»‡m thá»i cáº¥p 3 - K8A1(5)",
    embedUrl: "https://www.youtube.com/embed/Q0dmNCGbaXs"
  },
  {
    id: "vid-1788596109463",
    title: "Ká»· niá»‡m thá»i cáº¥p 3 - K8A1(4)",
    embedUrl: "https://www.youtube.com/embed/VHT6ouvKj_Q"
  },
  {
    id: "vid-1788596080960",
    title: "Ká»· niá»‡m thá»i cáº¥p 3 - K8A1(3)",
    embedUrl: "https://www.youtube.com/embed/Reuz6pHIgGM"
  },
  {
    id: "vid-1788596059982",
    title: "Ká»· niá»‡m thá»i cáº¥p 3 - K8A1(2)",
    embedUrl: "https://www.youtube.com/embed/Z0R73khjwfg"
  },
  {
    id: "vid-1788595395834",
    title: "Ká»· niá»‡m thá»i cáº¥p 3 - K8A1(1)",
    embedUrl: "https://www.youtube.com/embed/HyCIkhbalPk"
  }
];

// ============================================================================
// DANH Má»¤C & Dá»® LIá»†U Sá»” QUá»¸ THU - CHI Lá»šP K8A1 (CHUáº¨N THEO QUY CHáº¾ ÄIá»€U 3 & 4)
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
    label: 'Hiáº¿u Há»· & ThÄƒm Há»i',
    shortLabel: 'Hiáº¿u há»·',
    badgeBg: 'bg-rose-50',
    badgeText: 'text-rose-700',
    badgeBorder: 'border-rose-200',
    description: 'ThÄƒm viáº¿ng tá»© thÃ¢n phá»¥ máº«u (500k), thÄƒm há»i á»‘m Ä‘au/tai náº¡n (300k), viá»‡c há»· theo Quy cháº¿'
  },
  {
    id: 'teacher',
    label: 'Tri Ã‚n Tháº§y CÃ´',
    shortLabel: 'Tri Ã¢n',
    badgeBg: 'bg-purple-50',
    badgeText: 'text-purple-700',
    badgeBorder: 'border-purple-200',
    description: 'Hoa tÆ°Æ¡i & quÃ  táº·ng tri Ã¢n cÃ¡c tháº§y cÃ´ giÃ¡o cÅ© dá»‹p 20/11, Táº¿t NguyÃªn ÄÃ¡n, ngÃ y há»p lá»›p'
  },
  {
    id: 'party',
    label: 'Tiá»‡c & Sá»± Kiá»‡n Gáº·p Máº·t',
    shortLabel: 'Tiá»‡c & Sá»± kiá»‡n',
    badgeBg: 'bg-emerald-50',
    badgeText: 'text-emerald-800',
    badgeBorder: 'border-emerald-200',
    description: 'Äáº·t cá»c & thanh toÃ¡n tiá»‡c Crown Palace, áº©m thá»±c, Ä‘á»“ uá»‘ng, liÃªn hoan gáº·p máº·t Ä‘á»‹nh ká»³'
  },
  {
    id: 'souvenir',
    label: 'Äá»“ng Phá»¥c & Ká»· Niá»‡m',
    shortLabel: 'Äá»“ng phá»¥c & QuÃ ',
    badgeBg: 'bg-blue-50',
    badgeText: 'text-blue-700',
    badgeBorder: 'border-blue-200',
    description: 'Ão polo Ä‘á»“ng phá»¥c 20 nÄƒm K8A1, tháº» cá»±u há»c sinh ká»· niá»‡m, quÃ  lÆ°u niá»‡m'
  },
  {
    id: 'media',
    label: 'SÃ¢n Kháº¥u & Truyá»n ThÃ´ng',
    shortLabel: 'SÃ¢n kháº¥u & Media',
    badgeBg: 'bg-amber-50',
    badgeText: 'text-amber-800',
    badgeBorder: 'border-amber-200',
    description: 'In áº¥n backdrop sÃ¢n kháº¥u, Ã¢m thanh Ã¡nh sÃ¡ng, quay chá»¥p phÃ³ng sá»± ká»· niá»‡m, duy trÃ¬ webapp'
  },
  {
    id: 'other',
    label: 'Chi KhÃ¡c & Dá»± PhÃ²ng',
    shortLabel: 'KhÃ¡c',
    badgeBg: 'bg-slate-100',
    badgeText: 'text-slate-700',
    badgeBorder: 'border-slate-200',
    description: 'NÆ°á»›c suá»‘i, Ä‘áº¡o cá»¥ trÃ² chÆ¡i, chi phÃ­ phÃ¡t sinh chuáº©n bá»‹'
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
    label: 'Quá»¹ Há»p Lá»›p 20 NÄƒm',
    shortLabel: 'Quá»¹ 20 nÄƒm',
    badgeBg: 'bg-emerald-50',
    badgeText: 'text-emerald-800',
    badgeBorder: 'border-emerald-200',
    icon: 'ðŸŽ“',
    defaultAmount: 700000,
    description: 'ÄÃ³ng quá»¹ tham gia ngÃ y há»™i ngá»™ 20 nÄƒm (Ä‘á»‹nh má»©c chuáº©n 700.000Ä‘/báº¡n tham dá»±)',
    quickTitle: 'ÄÃ³ng quá»¹ há»p lá»›p ká»· niá»‡m 20 nÄƒm K8A1'
  },
  {
    id: 'sponsor',
    label: 'TÃ i Trá»£ & á»¦ng Há»™ Lá»›p',
    shortLabel: 'TÃ i trá»£ / á»¦ng há»™',
    badgeBg: 'bg-amber-50',
    badgeText: 'text-amber-800',
    badgeBorder: 'border-amber-200',
    icon: 'ðŸ’Ž',
    defaultAmount: 1000000,
    description: 'Máº¡nh thÆ°á»ng quÃ¢n, báº¡n bÃ¨ vÃ  gia Ä‘Ã¬nh Ä‘Ã³ng gÃ³p tÃ i trá»£ thÃªm Ä‘á»ƒ ngÃ y vui thÃªm chu toÃ n',
    quickTitle: 'TÃ i trá»£ & á»§ng há»™ quá»¹ lá»›p K8A1'
  },
  {
    id: 'extra_shirt',
    label: 'Mua ThÃªm Ão Polo',
    shortLabel: 'Mua thÃªm Ã¡o',
    badgeBg: 'bg-blue-50',
    badgeText: 'text-blue-700',
    badgeBorder: 'border-blue-200',
    icon: 'ðŸ‘•',
    defaultAmount: 150000,
    description: 'ÄÄƒng kÃ½ may thÃªm Ã¡o polo Ä‘á»“ng phá»¥c 20 nÄƒm cho vá»£/chá»“ng/con cÃ¡i/ngÆ°á»i thÃ¢n',
    quickTitle: 'Mua thÃªm Ã¡o polo Ä‘á»“ng phá»¥c K8A1'
  },
  {
    id: 'guest',
    label: 'NgÆ°á»i ThÃ¢n / F1 Äi KÃ¨m',
    shortLabel: 'NgÆ°á»i thÃ¢n Ä‘i kÃ¨m',
    badgeBg: 'bg-rose-50',
    badgeText: 'text-rose-700',
    badgeBorder: 'border-rose-200',
    icon: 'ðŸ‘¨â€ðŸ‘©â€ðŸ‘§',
    defaultAmount: 350000,
    description: 'Kinh phÃ­ suáº¥t Äƒn vÃ  Ä‘á»“ uá»‘ng cho phu huynh, con nhá» Ä‘i tham dá»± cÃ¹ng',
    quickTitle: 'ÄÃ³ng kinh phÃ­ ngÆ°á»i thÃ¢n / F1 Ä‘i kÃ¨m'
  },
  {
    id: 'teacher_tribute',
    label: 'Quá»¹ Tri Ã‚n Tháº§y CÃ´',
    shortLabel: 'Tri Ã¢n tháº§y cÃ´',
    badgeBg: 'bg-purple-50',
    badgeText: 'text-purple-700',
    badgeBorder: 'border-purple-200',
    icon: 'ðŸ’',
    defaultAmount: 500000,
    description: 'Khoáº£n Ä‘Ã³ng gÃ³p riÃªng Ä‘á»ƒ chuáº©n bá»‹ hoa tÆ°Æ¡i, quÃ  táº·ng ká»· niá»‡m tri Ã¢n tháº§y cÃ´ giÃ¡o cÅ©',
    quickTitle: 'ÄÃ³ng gÃ³p Quá»¹ tri Ã¢n Tháº§y CÃ´ giÃ¡o'
  },
  {
    id: 'alumni_care',
    label: 'Quá»¹ TÃ¬nh NghÄ©a & ThÄƒm Há»i',
    shortLabel: 'TÃ¬nh nghÄ©a K8A1',
    badgeBg: 'bg-indigo-50',
    badgeText: 'text-indigo-800',
    badgeBorder: 'border-indigo-200',
    icon: 'â¤ï¸',
    defaultAmount: 500000,
    description: 'Quá»¹ tÆ°Æ¡ng trá»£, thÄƒm há»i báº¡n bÃ¨ lÃºc Ä‘au á»‘m, viá»‡c hiáº¿u há»· theo Quy cháº¿ tá»• chá»©c',
    quickTitle: 'ÄÃ³ng gÃ³p Quá»¹ tÃ¬nh nghÄ©a & thÄƒm há»i K8A1'
  },
  {
    id: 'annual',
    label: 'Quá»¹ Lá»›p ThÆ°á»ng NiÃªn',
    shortLabel: 'Quá»¹ thÆ°á»ng niÃªn',
    badgeBg: 'bg-teal-50',
    badgeText: 'text-teal-800',
    badgeBorder: 'border-teal-200',
    icon: 'ðŸ“…',
    defaultAmount: 100000,
    description: 'Quá»¹ hoáº¡t Ä‘á»™ng thÆ°á»ng niÃªn 100.000 Ä‘/ngÆ°á»i/nÄƒm theo Äiá»u 4 Quy cháº¿ tá»• chá»©c',
    quickTitle: 'ÄÃ³ng quá»¹ lá»›p thÆ°á»ng niÃªn theo Quy cháº¿'
  },
  {
    id: 'other_income',
    label: 'Khoáº£n Thu KhÃ¡c & VÃ£ng Lai',
    shortLabel: 'Thu khÃ¡c',
    badgeBg: 'bg-slate-100',
    badgeText: 'text-slate-700',
    badgeBorder: 'border-slate-200',
    icon: 'ðŸ“¦',
    defaultAmount: 500000,
    description: 'LÃ£i tiá»n gá»­i ngÃ¢n hÃ ng, sá»‘ dÆ° chuyá»ƒn ká»³ trÆ°á»›c, hoáº·c cÃ¡c khoáº£n thu phÃ¡t sinh ngoÃ i káº¿ hoáº¡ch',
    quickTitle: 'Ghi nháº­n khoáº£n thu khÃ¡c'
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
    name: 'NgÃ¢n hÃ ng Ngoáº¡i thÆ°Æ¡ng Viá»‡t Nam',
    aliases: ['vcb', 'vietcombank', 'ngoai thuong', '970436']
  },
  {
    code: 'mbbank',
    bin: '970422',
    shortName: 'MB Bank (QuÃ¢n Äá»™i)',
    name: 'NgÃ¢n hÃ ng QuÃ¢n Äá»™i',
    aliases: ['mb', 'mbbank', 'quan doi', 'mb bank', '970422']
  },
  {
    code: 'techcombank',
    bin: '970407',
    shortName: 'Techcombank (TCB)',
    name: 'NgÃ¢n hÃ ng Ká»¹ ThÆ°Æ¡ng Viá»‡t Nam',
    aliases: ['tcb', 'techcombank', 'ky thuong', 'techcom', '970407']
  },
  {
    code: 'vietinbank',
    bin: '970415',
    shortName: 'VietinBank (CTG)',
    name: 'NgÃ¢n hÃ ng CÃ´ng ThÆ°Æ¡ng Viá»‡t Nam',
    aliases: ['icb', 'ctg', 'vietinbank', 'vietin', 'cong thuong', '970415']
  },
  {
    code: 'bidv',
    bin: '970418',
    shortName: 'BIDV',
    name: 'NgÃ¢n hÃ ng Äáº§u tÆ° vÃ  PhÃ¡t triá»ƒn Viá»‡t Nam',
    aliases: ['bidv', 'dau tu va phat trien', '970418']
  },
  {
    code: 'agribank',
    bin: '970405',
    shortName: 'Agribank (VBA)',
    name: 'NgÃ¢n hÃ ng NÃ´ng nghiá»‡p & PT NÃ´ng thÃ´n Viá»‡t Nam',
    aliases: ['vba', 'agr', 'agribank', 'nong nghiep', '970405']
  },
  {
    code: 'vpbank',
    bin: '970432',
    shortName: 'VPBank (VPB)',
    name: 'NgÃ¢n hÃ ng Viá»‡t Nam Thá»‹nh VÆ°á»£ng',
    aliases: ['vpb', 'vpbank', 'thinh vuong', '970432']
  },
  {
    code: 'tpbank',
    bin: '970423',
    shortName: 'TPBank (TPB)',
    name: 'NgÃ¢n hÃ ng TiÃªn Phong',
    aliases: ['tpb', 'tpbank', 'tien phong', '970423']
  },
  {
    code: 'acb',
    bin: '970416',
    shortName: 'ACB (Ã ChÃ¢u)',
    name: 'NgÃ¢n hÃ ng TMCP Ã ChÃ¢u',
    aliases: ['acb', 'a chau', '970416']
  },
  {
    code: 'sacombank',
    bin: '970403',
    shortName: 'Sacombank (STB)',
    name: 'NgÃ¢n hÃ ng SÃ i GÃ²n ThÆ°Æ¡ng TÃ­n',
    aliases: ['stb', 'sacombank', 'sai gon thuong tin', 'sacom', '970403']
  },
  {
    code: 'hdbank',
    bin: '970437',
    shortName: 'HDBank (HDB)',
    name: 'NgÃ¢n hÃ ng PhÃ¡t triá»ƒn TP.HCM',
    aliases: ['hdb', 'hdbank', '970437']
  },
  {
    code: 'vib',
    bin: '970441',
    shortName: 'VIB (Quá»‘c Táº¿)',
    name: 'NgÃ¢n hÃ ng Quá»‘c Táº¿ Viá»‡t Nam',
    aliases: ['vib', 'quoc te', '970441']
  },
  {
    code: 'shb',
    bin: '970443',
    shortName: 'SHB',
    name: 'NgÃ¢n hÃ ng SÃ i GÃ²n - HÃ  Ná»™i',
    aliases: ['shb', 'sai gon ha noi', '970443']
  },
  {
    code: 'ocb',
    bin: '970448',
    shortName: 'OCB (PhÆ°Æ¡ng ÄÃ´ng)',
    name: 'NgÃ¢n hÃ ng PhÆ°Æ¡ng ÄÃ´ng',
    aliases: ['ocb', 'phuong dong', '970448']
  },
  {
    code: 'msb',
    bin: '970426',
    shortName: 'MSB (HÃ ng Háº£i)',
    name: 'NgÃ¢n hÃ ng HÃ ng Háº£i Viá»‡t Nam',
    aliases: ['msb', 'hang hai', 'maritime', '970426']
  },
  {
    code: 'lienvietpostbank',
    bin: '970449',
    shortName: 'LPBank (Lá»™c PhÃ¡t)',
    name: 'NgÃ¢n hÃ ng TMCP Lá»™c PhÃ¡t Viá»‡t Nam',
    aliases: ['lpb', 'lpbank', 'loc phat', 'lienvietpostbank', 'lien viet', '970449']
  },
  {
    code: 'seabank',
    bin: '970440',
    shortName: 'SeABank (ÄÃ´ng Nam Ã)',
    name: 'NgÃ¢n hÃ ng ÄÃ´ng Nam Ã',
    aliases: ['seabank', 'seab', 'dong nam a', '970440']
  },
  {
    code: 'namabank',
    bin: '970428',
    shortName: 'Nam A Bank (NAB)',
    name: 'NgÃ¢n hÃ ng Nam Ã',
    aliases: ['nab', 'nam a', 'namabank', '970428']
  },
  {
    code: 'abbank',
    bin: '970425',
    shortName: 'ABBANK (An BÃ¬nh)',
    name: 'NgÃ¢n hÃ ng An BÃ¬nh',
    aliases: ['abb', 'abbank', 'an binh', '970425']
  },
  {
    code: 'bacabank',
    bin: '970409',
    shortName: 'Bac A Bank (Báº¯c Ã)',
    name: 'NgÃ¢n hÃ ng Báº¯c Ã',
    aliases: ['bab', 'bac a', 'bacabank', '970409']
  },
  {
    code: 'baovietbank',
    bin: '970438',
    shortName: 'BaoViet Bank (Báº£o Viá»‡t)',
    name: 'NgÃ¢n hÃ ng Báº£o Viá»‡t',
    aliases: ['bvb', 'baoviet', 'baovietbank', 'bao viet', '970438']
  },
  {
    code: 'vietabank',
    bin: '970427',
    shortName: 'VietABank (Viá»‡t Ã)',
    name: 'NgÃ¢n hÃ ng Viá»‡t Ã',
    aliases: ['vab', 'vieta', 'vietabank', 'viet a', '970427']
  },
  {
    code: 'kienlongbank',
    bin: '970452',
    shortName: 'KienlongBank (KiÃªn Long)',
    name: 'NgÃ¢n hÃ ng KiÃªn Long',
    aliases: ['klb', 'kienlong', 'kienlongbank', 'kien long', '970452']
  },
  {
    code: 'pgbank',
    bin: '970430',
    shortName: 'PGBank (XÄƒng Dáº§u)',
    name: 'NgÃ¢n hÃ ng TMCP Thá»‹nh VÆ°á»£ng vÃ  PhÃ¡t triá»ƒn',
    aliases: ['pgb', 'pgbank', 'xang dau', '970430']
  },
  {
    code: 'cake',
    bin: '546034',
    shortName: 'Cake by VPBank',
    name: 'NgÃ¢n hÃ ng sá»‘ Cake by VPBank',
    aliases: ['cake', 'cake by vpbank', '546034']
  },
  {
    code: 'timo',
    bin: '963388',
    shortName: 'Timo by BVBank',
    name: 'NgÃ¢n hÃ ng sá»‘ Timo',
    aliases: ['timo', 'timo plus', '963388']
  },
  {
    code: 'viettelmoney',
    bin: '971005',
    shortName: 'Viettel Money',
    name: 'Tá»•ng CÃ´ng ty Dá»‹ch vá»¥ Sá»‘ Viettel',
    aliases: ['viettelmoney', 'viettel pay', 'viettel', '971005']
  },
  {
    code: 'vnptmoney',
    bin: '971011',
    shortName: 'VNPT Money',
    name: 'Táº­p Ä‘oÃ n BÆ°u chÃ­nh Viá»…n thÃ´ng Viá»‡t Nam',
    aliases: ['vnptmoney', 'vnpt pay', 'vnpt', '971011']
  },
  {
    code: 'shinhan',
    bin: '970424',
    shortName: 'Shinhan Bank Viá»‡t Nam',
    name: 'NgÃ¢n hÃ ng TNHH MTV Shinhan Viá»‡t Nam',
    aliases: ['shinhan', 'shinhanbank', 'shbvn', '970424']
  },
  {
    code: 'wooribank',
    bin: '970457',
    shortName: 'Woori Bank Viá»‡t Nam',
    name: 'NgÃ¢n hÃ ng TNHH MTV Woori Viá»‡t Nam',
    aliases: ['woori', 'wooribank', '970457']
  },
  {
    code: 'publicbank',
    bin: '970439',
    shortName: 'Public Bank Viá»‡t Nam',
    name: 'NgÃ¢n hÃ ng TNHH MTV Public Viá»‡t Nam',
    aliases: ['pbvn', 'publicbank', 'public', '970439']
  }
];

/**
 * TÃ¬m mÃ£ ngÃ¢n hÃ ng VietQR theo tÃªn hoáº·c alias
 */
export function resolveBankCode(bankInput?: any): string {
  if (bankInput === null || bankInput === undefined) return 'vietcombank';
  const clean = String(bankInput).toLowerCase().trim();
  
  // 1. Khá»›p mÃ£ Ä‘á»‹nh danh hoáº·c BIN
  const direct = VIETNAM_BANKS.find(b => b.code.toLowerCase() === clean || b.bin === clean);
  if (direct) return direct.code;

  // 2. Khá»›p alias
  const byAlias = VIETNAM_BANKS.find(b => 
    b.aliases.some(alias => clean.includes(alias) || alias === clean)
  );
  if (byAlias) return byAlias.code;

  // 3. Khá»›p tÃªn ngÃ¢n hÃ ng
  const byName = VIETNAM_BANKS.find(b => 
    clean.includes(b.shortName.toLowerCase()) || clean.includes(b.name.toLowerCase())
  );
  if (byName) return byName.code;

  return 'vietcombank';
}

/**
 * Chuáº©n hÃ³a chuá»—i text sang chuáº©n Napas / VietQR EMVCo Tag 62:
 * - Loáº¡i bá» dáº¥u tiáº¿ng Viá»‡t (NFD)
 * - Loáº¡i bá» cÃ¡c kÃ½ tá»± Ä‘áº·c biá»‡t [ ] { } < > # % @ $ ^ & * ( ) = + \\ / | ~ ` " ' ; : , . ? !
 * - Giá»¯ láº¡i chá»¯ cÃ¡i, sá»‘ vÃ  dáº¥u cÃ¡ch
 * - Chuyá»ƒn sang chá»¯ IN HOA
 * - Giá»›i háº¡n tá»‘i Ä‘a 50 kÃ½ tá»± Ä‘á»ƒ khÃ´ng trÃ n buffer Napas
 */
export function sanitizeVietQrText(text?: any): string {
  if (text === null || text === undefined) return '';
  return String(text)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[Ä‘Ä]/g, 'D')
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
 * Báº£ng kÃ­ch cá»¡ Ã¡o Ä‘á»“ng phá»¥c polo Há»p lá»›p 20 nÄƒm K8A1 chuáº©n hÃ³a theo báº£ng xÆ°á»Ÿng may (NgÆ°á»i lá»›n)
 * S:    Vai 35cm | Rá»™ng 41cm | DÃ i 55cm | 35kg - 45kg
 * M:    Vai 37cm | Rá»™ng 44cm | DÃ i 59cm | 45kg - 55kg
 * L:    Vai 39cm | Rá»™ng 47cm | DÃ i 63cm | 55kg - 65kg
 * XL:   Vai 41cm | Rá»™ng 49cm | DÃ i 67cm | 65kg - 75kg
 * XXL:  Vai 43cm | Rá»™ng 51cm | DÃ i 70cm | 75kg - 85kg
 * XXXL: Vai 45cm | Rá»™ng 53cm | DÃ i 73cm | 85kg - 95kg
 */
export const SHIRT_SIZE_OPTIONS: ShirtSizeOption[] = [
  { 
    value: 'S', 
    label: 'Size S (35 - 45kg) â€¢ Vai 35 / Rá»™ng 41 / DÃ i 55cm', 
    weightHint: '35 - 45kg',
    shoulder: '35cm',
    width: '41cm',
    length: '55cm'
  },
  { 
    value: 'M', 
    label: 'Size M (45 - 55kg) â€¢ Vai 37 / Rá»™ng 44 / DÃ i 59cm', 
    weightHint: '45 - 55kg',
    shoulder: '37cm',
    width: '44cm',
    length: '59cm'
  },
  { 
    value: 'L', 
    label: 'Size L (55 - 65kg) â€¢ Vai 39 / Rá»™ng 47 / DÃ i 63cm', 
    weightHint: '55 - 65kg',
    shoulder: '39cm',
    width: '47cm',
    length: '63cm'
  },
  { 
    value: 'XL', 
    label: 'Size XL (65 - 75kg) â€¢ Vai 41 / Rá»™ng 49 / DÃ i 67cm', 
    weightHint: '65 - 75kg',
    shoulder: '41cm',
    width: '49cm',
    length: '67cm'
  },
  { 
    value: 'XXL', 
    label: 'Size XXL (75 - 85kg) â€¢ Vai 43 / Rá»™ng 51 / DÃ i 70cm', 
    weightHint: '75 - 85kg',
    shoulder: '43cm',
    width: '51cm',
    length: '70cm'
  },
  { 
    value: 'XXXL', 
    label: 'Size XXXL (85 - 95kg) â€¢ Vai 45 / Rá»™ng 53 / DÃ i 73cm', 
    weightHint: '85 - 95kg',
    shoulder: '45cm',
    width: '53cm',
    length: '73cm'
  }
];

export function normalizeShirtSize(size?: string): string {
  if (!size) return '';
  const s = size.trim().toUpperCase();
  if (!s || s === 'CHÆ¯A CHá»ŒN' || s === 'CHUA CHON' || s === 'NONE' || s === 'NULL' || s === 'UNDEFINED') return '';
  if (s === '2XL') return 'XXL';
  if (s === '3XL') return 'XXXL';
  return s;
}

/**
 * Sinh URL táº¡o áº£nh mÃ£ VietQR chuáº©n xÃ¡c, tÆ°Æ¡ng thÃ­ch 100% App NgÃ¢n hÃ ng Viá»‡t Nam
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
 * Chuáº©n hÃ³a URL hÃ¬nh áº£nh:
 * - Tá»± Ä‘á»™ng nháº­n diá»‡n & chuyá»ƒn Ä‘á»•i link chia sáº» Google Drive thÃ nh URL CDN lh3.googleusercontent.com hiá»ƒn thá»‹ trá»±c tiáº¿p vÃ  nhanh chÃ³ng trong tháº» <img>.
 * - Há»— trá»£ cÃ¡c dáº¡ng: /file/d/ID/view, open?id=ID, uc?id=ID, thumbnail?id=ID.
 * - Chuyá»ƒn link Dropbox thÃ nh raw=1 Ä‘á»ƒ hiá»ƒn thá»‹ trá»±c tiáº¿p.
 * - Báº£o toÃ n cÃ¡c link áº£nh tiÃªu chuáº©n (Unsplash, HTTPS, Data URLs há»£p lá»‡).
 */
export function normalizeImageUrl(rawUrl?: string): string {
  if (!rawUrl || typeof rawUrl !== 'string') return '';
  const trimmed = rawUrl.trim();
  if (!trimmed) return '';

  // 1. Nháº­n diá»‡n link Google Drive
  const driveFileMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (driveFileMatch && driveFileMatch[1]) {
    return `https://lh3.googleusercontent.com/d/${driveFileMatch[1]}=w1600`;
  }
  const driveIdMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (trimmed.includes('drive.google.com') && driveIdMatch && driveIdMatch[1]) {
    return `https://lh3.googleusercontent.com/d/${driveIdMatch[1]}=w1600`;
  }

  // 2. Nháº­n diá»‡n link Dropbox
  if (trimmed.includes('dropbox.com')) {
    return trimmed.replace(/\?dl=0$/, '?raw=1').replace(/&dl=0$/, '&raw=1');
  }

  return trimmed;
}

/**
 * Chuyá»ƒn Ä‘á»•i an toÃ n báº¥t ká»³ Ä‘á»‹nh dáº¡ng ngÃ y nÃ o thÃ nh Ä‘á»‘i tÆ°á»£ng Date há»£p lá»‡
 * Xá»­ lÃ½: "09:30 â€¢ 01/09/2026", "01/09/2026 09:30", "01/09/2026", ISO, Timestamp, Date object...
 * Tráº£ vá» null náº¿u khÃ´ng há»£p lá»‡ hoáº·c náº¿u gáº·p "Invalid Date" (chá»‘ng triá»‡t Ä‘á»ƒ lá»—i hiá»ƒn thá»‹ Invalid Date)
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

  // Náº¿u lÃ  sá»‘ timestamp mili-giÃ¢y dáº¡ng chuá»—i hoáº·c sá»‘
  if (/^\d{10,14}$/.test(str)) {
    const d = new Date(Number(str));
    if (!isNaN(d.getTime())) return d;
  }

  // Dáº¡ng HH:mm â€¢ DD/MM/YYYY hoáº·c HH:mm:ss â€¢ DD/MM/YYYY
  const bulletMatch = str.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?\s*â€¢\s*(\d{1,2})[/-](\d{1,2})[/-](\d{4})/);
  if (bulletMatch) {
    const [, h, min, s, d, m, y] = bulletMatch;
    return new Date(Number(y), Number(m) - 1, Number(d), Number(h), Number(min), Number(s || 0));
  }

  // Dáº¡ng DD/MM/YYYY â€¢ HH:mm
  const bulletMatch2 = str.match(/(\d{1,2})[/-](\d{1,2})[/-](\d{4})\s*â€¢\s*(\d{1,2}):(\d{2})(?::(\d{2}))?/);
  if (bulletMatch2) {
    const [, d, m, y, h, min, s] = bulletMatch2;
    return new Date(Number(y), Number(m) - 1, Number(d), Number(h), Number(min), Number(s || 0));
  }

  // Dáº¡ng DD/MM/YYYY HH:mm:ss hoáº·c DD/MM/YYYY
  const dmyTimeMatch = str.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?$/);
  if (dmyTimeMatch) {
    const [, d, m, y, h, min, s] = dmyTimeMatch;
    return new Date(Number(y), Number(m) - 1, Number(d), Number(h || 0), Number(min || 0), Number(s || 0));
  }

  // Dáº¡ng ISO YYYY-MM-DD hoáº·c YYYY-MM-DD HH:mm:ss
  const ymdTimeMatch = str.match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})(?:[\sT](\d{1,2}):(\d{2})(?::(\d{2}))?)?/);
  if (ymdTimeMatch) {
    const [, y, m, d, h, min, s] = ymdTimeMatch;
    return new Date(Number(y), Number(m) - 1, Number(d), Number(h || 0), Number(min || 0), Number(s || 0));
  }

  // Thá»­ parse qua Date tiÃªu chuáº©n
  const fallback = new Date(str);
  if (!isNaN(fallback.getTime())) {
    return fallback;
  }

  return null;
}

/**
 * Äá»‹nh dáº¡ng thá»i gian chuáº©n tiáº¿ng Viá»‡t cho giao diá»‡n:
 * - Chuyá»ƒn Ä‘á»•i cÃ¡c chuá»—i Date rÆ°á»m rÃ  (vÃ­ dá»¥: "Sat Sep 05 2026 16:24:00 GMT+0700 (Indochina Time)", ISO, Timestamp)
 *   thÃ nh dáº¡ng gá»n gÃ ng, trang trá»ng: "16:24 â€¢ 05/09/2026"
 * - Chuáº©n hÃ³a cÃ¡c dáº¡ng DD/MM/YYYY HH:mm
 * - Tuyá»‡t Ä‘á»‘i khÃ´ng bao giá» tráº£ vá» chuá»—i "Invalid Date"
 */
export function formatDateTimeVi(rawDate?: any): string {
  if (!rawDate) return '';
  const str = String(rawDate).trim();
  if (!str || str.toLowerCase() === 'invalid date' || str.toLowerCase() === 'null' || str.toLowerCase() === 'undefined') {
    return '';
  }

  // Náº¿u Ä‘Ã£ lÃ  Ä‘á»‹nh dáº¡ng chuáº©n "HH:mm â€¢ DD/MM/YYYY" thÃ¬ giá»¯ nguyÃªn
  if (/^\d{2}:\d{2}\s*â€¢\s*\d{2}\/\d{2}\/\d{4}$/.test(str)) {
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

  // Náº¿u khÃ´ng cÃ³ thÃ nh pháº§n giá» phÃºt trong chuá»—i gá»‘c vÃ  giá» phÃºt báº±ng 0 thÃ¬ chá»‰ tráº£ vá» ngÃ y
  if (d.getHours() === 0 && d.getMinutes() === 0 && !str.includes(':')) {
    return `${day}/${month}/${year}`;
  }

  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());
  return `${hours}:${minutes} â€¢ ${day}/${month}/${year}`;
}

/**
 * Äá»‹nh dáº¡ng thá»i gian Ä‘iá»ƒm danh ngáº¯n gá»n, tinh táº¿ cho báº£ng quáº£n trá»‹ & danh sÃ¡ch:
 * - "Sat Sep 12 2026 13:06:00 GMT+0700 (Indochina Time)" -> "13:06 â€¢ 12/09"
 * - "12/09/2026 13:06" -> "13:06 â€¢ 12/09"
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
    str.toLowerCase() === 'Ä‘Ã£ Ä‘áº¿n'
  ) {
    return '';
  }

  // Náº¿u chá»‰ lÃ  HH:mm (vÃ­ dá»¥ "13:06")
  if (/^\d{1,2}:\d{2}$/.test(str)) {
    return str;
  }

  // Náº¿u Ä‘Ã£ lÃ  HH:mm â€¢ DD/MM (vÃ­ dá»¥ "13:06 â€¢ 12/09")
  if (/^\d{1,2}:\d{2}\s*â€¢\s*\d{1,2}\/\d{1,2}$/.test(str)) {
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

  return `${hours}:${minutes} â€¢ ${day}/${month}`;
}

/**
 * Äá»‹nh dáº¡ng ngÃ y chuáº©n tiáº¿ng Viá»‡t (DD/MM/YYYY):
 * - Xá»­ lÃ½ triá»‡t Ä‘á»ƒ cÃ¡c chuá»—i Date tá»« Google Sheets nhÆ° "Sat Aug 15 2026 00:00:00 GMT+0700 (Indochina Time)",
 *   "09:30 â€¢ 01/09/2026", ISO "2026-08-15" thÃ nh "15/08/2026"
 * - Tuyá»‡t Ä‘á»‘i khÃ´ng bao giá» tráº£ vá» chuá»—i "Invalid Date"
 */
export function formatDateOnlyVi(rawDate?: any): string {
  if (!rawDate) return '';
  const str = String(rawDate).trim();
  if (!str || str.toLowerCase() === 'invalid date' || str.toLowerCase() === 'null' || str.toLowerCase() === 'undefined') {
    return '';
  }

  const d = parseDate(rawDate);
  if (!d) {
    // Dá»± phÃ²ng: trÃ­ch xuáº¥t cá»¥m DD/MM/YYYY náº¿u cÃ³ trong chuá»—i
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
 * Che má» sá»‘ Ä‘iá»‡n thoáº¡i Ä‘á»ƒ báº£o vá»‡ thÃ´ng tin cÃ¡ nhÃ¢n (PII):
 * Hiá»ƒn thá»‹ 4 sá»‘ Ä‘áº§u vÃ  2 sá»‘ cuá»‘i, á»Ÿ giá»¯a thay báº±ng kÃ½ tá»± che: 0919 â€¢â€¢â€¢ â€¢88
 */
export function maskPhone(phone?: any): string {
  if (!phone) return '';
  const str = String(phone).trim();

  // 1. Náº¿u chuá»—i ÄÃƒ ÄÆ¯á»¢C CHE Má»œ trÆ°á»›c Ä‘Ã³ (chá»©a â€¢ hoáº·c *):
  if (str.includes('â€¢') || str.includes('*')) {
    const match = str.match(/^([0-9]{3,4})[^0-9]+([0-9]{2,4})$/);
    if (match) {
      return `${match[1]} â€¢â€¢â€¢ ${match[2]}`;
    }
    return str.replace(/\s+/g, ' ').trim();
  }

  // 2. Náº¿u lÃ  sá»‘ thÃ´ (chÆ°a che):
  const clean = str.replace(/[^0-9]/g, '');
  if (clean.length < 7) return clean;
  if (clean.length === 10) {
    return `${clean.slice(0, 4)} â€¢â€¢â€¢ ${clean.slice(-3)}`;
  }
  return `${clean.slice(0, 3)} â€¢â€¢â€¢ ${clean.slice(-3)}`;
}

/**
 * TrÃ­ch xuáº¥t vÃ  chuáº©n hÃ³a táº¥t cáº£ cÃ¡c sá»‘ Ä‘iá»‡n thoáº¡i tá»« chuá»—i (há»— trá»£ nhiá»u sá»‘ phÃ¢n cÃ¡ch báº±ng -, /, ;, dáº¥u cÃ¡ch)
 * Chuáº©n hÃ³a:
 * - Bá» kÃ½ tá»± khÃ´ng pháº£i sá»‘
 * - 84xxxxxxxxx -> 0xxxxxxxxx
 * - 9 chá»¯ sá»‘ báº¯t Ä‘áº§u tá»« [3,5,7,8,9] -> thÃªm 0 á»Ÿ Ä‘áº§u (do Google Sheets lÆ°u dáº¡ng number lÃ m máº¥t sá»‘ 0)
 * - 10 chá»¯ sá»‘ báº¯t Ä‘áº§u tá»« 1 (Ä‘áº§u 01 cÅ©) -> thÃªm 0 á»Ÿ Ä‘áº§u
 * - Chá»‰ cháº¥p nháº­n SÄT há»£p lá»‡ cÃ³ tá»« 9 Ä‘áº¿n 12 chá»¯ sá»‘, loáº¡i bá» cÃ¡c máº£nh 2-4 chá»¯ sá»‘ vá»¥n
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

  // Náº¿u chuá»—i chá»©a kÃ½ tá»± mask (â€¢ hoáº·c *), khÃ´ng bÃ³c tÃ¡ch thÃ nh cÃ¡c máº£nh sá»‘ vá»¥n Ä‘á»ƒ trÃ¡nh so khá»›p sai
  if (str.includes('â€¢') || str.includes('*')) {
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

    // SÄT há»£p lá»‡ táº¡i Viá»‡t Nam pháº£i cÃ³ Ã­t nháº¥t 9 Ä‘áº¿n 12 chá»¯ sá»‘
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
 * Kiá»ƒm tra xem 2 Ä‘á»‘i tÆ°á»£ng SÄT cÃ³ trÃ¹ng nhau hay khÃ´ng (so khá»›p an toÃ n, há»— trá»£ chuyá»ƒn Ä‘á»•i 11 sá»‘ sang 10 sá»‘)
 */
export function isPhoneMatch(phoneA?: any, phoneB?: any): boolean {
  if (!phoneA || !phoneB) return false;
  const strA = String(phoneA).trim();
  const strB = String(phoneB).trim();
  if (!strA || !strB) return false;

  const isMaskedA = strA.includes('â€¢') || strA.includes('*');
  const isMaskedB = strB.includes('â€¢') || strB.includes('*');

  // 1. Cáº£ 2 Ä‘á»u lÃ  sá»‘ bá»‹ che: so khá»›p an toÃ n qua suffix (2 sá»‘ cuá»‘i) vÃ  prefix nhÃ  máº¡ng
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

  // 2. Náº¿u 1 bÃªn bá»‹ che vÃ  1 bÃªn lÃ  sá»‘ Ä‘áº§y Ä‘á»§:
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

  // 3. Cáº£ 2 Ä‘á»u lÃ  sá»‘ Ä‘áº§y Ä‘á»§: so khá»›p chuáº©n qua danh sÃ¡ch SÄT há»£p lá»‡
  const listA = extractPhones(phoneA);
  const listB = extractPhones(phoneB);
  if (listA.length === 0 || listB.length === 0) return false;
  return listA.some(a => listB.includes(a));
}

/**
 * So khá»›p thÃ´ng minh tÃªn há»c sinh trong Danh báº¡ (Master Roster) vá»›i Há» tÃªn gá»­i tá»« Web
 * Há»— trá»£ cÃ¡c trÆ°á»ng há»£p thá»±c táº¿:
 * - Danh báº¡ ghi ngáº¯n gá»n: "Tráº§n Khuyáº¿n" <-> Web nháº­p: "Tráº§n vÄƒn Khuyáº¿n"
 * - Danh báº¡ chá»‰ ghi tÃªn/Ä‘á»‡m: "Báº£o Thi" <-> Web nháº­p: "HoÃ ng Báº£o Thi"
 * - Danh báº¡ ghi tÃªn Ä‘áº£o: "Linh Há»¯u" <-> Web nháº­p: "ThÃ¡i há»¯u linh"
 * - Khá»›p theo Biá»‡t danh
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

  // Khá»›p trá»±c tiáº¿p theo nickname náº¿u cáº£ 2 bÃªn Ä‘á»u cÃ³ biá»‡t danh
  if (rNick && mNick && rNick === mNick) return true;

  if (!rName || !mName) return false;
  if (mName === rName) return true;
  if (mNick && mNick === rName) return true;
  if (rNick && mName === rNick) return true;

  const rTokens = rName.split(' ').filter(Boolean);
  const mTokens = mName.split(' ').filter(Boolean);

  // 1. ToÃ n bá»™ cÃ¡c tá»« cá»§a tÃªn danh báº¡ náº±m trong tÃªn Ä‘Äƒng kÃ½ web
  if (mTokens.length >= 2 && mTokens.every(t => rTokens.includes(t))) {
    return true;
  }

  // 2. ToÃ n bá»™ cÃ¡c tá»« cá»§a tÃªn web náº±m trong danh báº¡
  if (rTokens.length >= 2 && rTokens.every(t => mTokens.includes(t))) {
    return true;
  }

  // 3. Biá»‡t danh khá»›p vá»›i tÃªn web
  if (mNick && mNick.length >= 2) {
    const nickTokens = mNick.split(' ').filter(Boolean);
    if (nickTokens.length >= 2 && nickTokens.every(t => rTokens.includes(t))) {
      return true;
    }
  }

  // 4. TrÃ¹ng tÃªn gá»i (given name) vÃ  trÃ¹ng biá»‡t danh
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
// ðŸŽ¬ Cáº¤U HÃŒNH TRÃŒNH CHIáº¾U SÃ‚N KHáº¤U (MÃ€N LED) & PLAYLIST NHáº C Ná»€N K8A1
// ============================================================================

// Danh sÃ¡ch bÃ i hÃ¡t máº·c Ä‘á»‹nh (Ca khÃºc thanh xuÃ¢n tuá»•i há»c trÃ² K8A1)
export const DEFAULT_PLAYLIST: MusicTrack[] = [
  {
    id: "track-1",
    title: "Mong Æ¯á»›c Ká»· Niá»‡m XÆ°a",
    artist: "Tam Ca 3A",
    sourceType: "youtube",
    url: "https://youtu.be/ocvlV5LZ93Q",
    duration: "05:12"
  },
  {
    id: "track-2",
    title: "Táº¡m Biá»‡t (Thá»i Ão Tráº¯ng)",
    artist: "Quang Vinh",
    sourceType: "youtube",
    url: "https://youtu.be/zXHEZ0SLj1A",
    duration: "04:30"
  },
  {
    id: "track-3",
    title: "NgÃ y áº¤y Báº¡n VÃ  TÃ´i",
    artist: "Lynk Lee",
    sourceType: "youtube",
    url: "https://youtu.be/Z0R73khjwfg",
    duration: "04:15"
  },
  {
    id: "track-4",
    title: "Xe Äáº¡p",
    artist: "ThÃ¹y Chi & M4U",
    sourceType: "youtube",
    url: "https://youtu.be/HyCIkhbalPk",
    duration: "04:45"
  },
  {
    id: "track-5",
    title: "Giáº¥c MÆ¡ Tháº§n TiÃªn",
    artist: "Miu LÃª",
    sourceType: "youtube",
    url: "https://youtu.be/VHT6ouvKj_Q",
    duration: "03:55"
  },
  {
    id: "track-6",
    title: "Ná»¥ CÆ°á»i 18 20",
    artist: "DoÃ£n Hiáº¿u",
    sourceType: "youtube",
    url: "https://youtu.be/qOwNuWY30iw",
    duration: "03:40"
  }
];

// Danh sÃ¡ch Maket / Backdrop sÃ¢n kháº¥u há»™i trÆ°á»ng máº·c Ä‘á»‹nh
export const DEFAULT_BACKDROPS: BackdropItem[] = [
  {
    id: "bd-main",
    title: "Backdrop SÃ¢n Kháº¥u ChÃ­nh â€¢ Ká»· Niá»‡m 20 NÄƒm NgÃ y Trá»Ÿ Vá» K8A1 (2003 - 2006)",
    url: "https://lh3.googleusercontent.com/d/1PyvlmILYdK-Lx12ohrHfBV-ppDjHDhhg=w1600",
    thumbnail: "https://lh3.googleusercontent.com/d/1PyvlmILYdK-Lx12ohrHfBV-ppDjHDhhg=w600",
    isDefault: true
  },
  {
    id: "bd-school",
    title: "Maket Há»™i Ngá»™ MÃ¡i TrÆ°á»ng THPT ThÃ¡i NguyÃªn XÆ°a & Nay",
    url: "https://thpttn.tnue.edu.vn/upload/doantn/logo%20thpttn.jpg",
    thumbnail: "https://thpttn.tnue.edu.vn/upload/doantn/logo%20thpttn.jpg",
    isDefault: false
  }
];

// Cáº¥u hÃ¬nh Ä‘iá»u khiá»ƒn trÃ¬nh chiáº¿u sÃ¢n kháº¥u máº·c Ä‘á»‹nh
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
 * Nháº­n diá»‡n chuá»—i chÃº thÃ­ch lÃ  tÃªn file mÃ¡y áº£nh, mÃ£ bÄƒm Drive, chuá»—i sá»‘ Facebook hoáº·c tá»« khÃ³a máº·c Ä‘á»‹nh chung chung
 */
export function isMachineOrGenericCaption(caption?: string): boolean {
  if (!caption) return true;
  const trimmed = String(caption).trim();
  if (trimmed.length < 4) return true;

  // 1. Kiá»ƒm tra danh sÃ¡ch tá»« khÃ³a máº·c Ä‘á»‹nh chung chung
  const lower = trimmed.toLowerCase().replace(/\s+/g, ' ');
  const genericList = [
    'ká»· niá»‡m lá»›p k8a1',
    'ká»· niá»‡m k8a1',
    'áº£nh ká»· niá»‡m',
    'áº£nh ká»· niá»‡m k8a1',
    'áº£nh k8a1',
    'k8a1',
    'ká»· niá»‡m 20 nÄƒm',
    'ká»· niá»‡m 20 nÄƒm k8a1',
    'ká»· niá»‡m',
    'chÆ°a cÃ³ chÃº thÃ­ch',
    'default',
    'untitled',
    'null',
    'undefined',
    'image',
    'photo',
    'hinh anh',
    'áº£nh',
    'hÃ¬nh áº£nh'
  ];
  if (genericList.includes(lower)) return true;

  // 2. Äá»‹nh dáº¡ng Ä‘uÃ´i file hÃ¬nh áº£nh / video
  if (/\.(jpg|jpeg|png|webp|gif|bmp|mp4|mov|heic|heif|raw)$/i.test(trimmed)) return true;

  // 3. Tiá»n tá»‘ mÃ¡y áº£nh / chá»¥p mÃ n hÃ¬nh / máº¡ng xÃ£ há»™i
  if (/^(img|image|dsc|photo|pasted|screenshot|zalo|fb|facebook|snap|178\d+|569\d+)/i.test(trimmed)) return true;

  // 4. Chuá»—i sá»‘ dÃ i liÃªn tiáº¿p hoáº·c chuá»—i timestamp Facebook (chá»©a nhiá»u cá»¥m sá»‘ 8+ chá»¯ sá»‘, hoáº·c káº¿t thÃºc báº±ng 'n')
  if (/^\d{8,}/.test(trimmed) || /^[\d\s_.-]{8,}/.test(trimmed) || (/\s+n$/i.test(trimmed) && /\d{8,}/.test(trimmed))) return true;

  // 5. Chuá»—i ngáº«u nhiÃªn khÃ´ng cÃ³ dáº¥u cÃ¡ch dÃ i >= 16 kÃ½ tá»± (mÃ£ bÄƒm Drive nhÆ° 2aOboQx0cIp0ytJctMR2mYgDpSIvagbVQ47zopO4)
  if (!trimmed.includes(' ') && trimmed.length >= 16) return true;

  // 6. MÃ£ hex dÃ i hoáº·c chá»©a hash ná»™i bá»™
  if (/^[0-9a-f]{16,}$/i.test(trimmed) || trimmed.includes('9527bee86c')) return true;

  return false;
}

// Danh sÃ¡ch cÃ¢u dáº«n thanh xuÃ¢n K8A1 â€” Sáº¯p xáº¿p XEN Káº¼ giá»¯a Vui Váº», ThÃ¢n Thiá»‡n vÃ  SÃ¢u Láº¯ng, HoÃ i Niá»‡m
export const NOSTALGIC_QUOTES: string[] = [
  "Gáº·p láº¡i nhau lÃ  cá»© pháº£i cÆ°á»i tháº­t tÆ°Æ¡i tháº¿ nÃ y má»›i chá»‹u cÆ¡! ðŸ˜„",
  "Hai mÆ°Æ¡i nÄƒm ngÃ y trá»Ÿ vá» â€” KÃ½ á»©c nÄƒm thÃ¡ng tuá»•i há»c trÃ² K8A1 váº«n váº¹n nguyÃªn nhÆ° ngÃ y hÃ´m qua.",
  "20 nÄƒm rá»“i mÃ  nhÃ¬n ná»¥ cÆ°á»i cá»§a ai cÅ©ng váº«n tráº» trung y nhÆ° ngÃ y nÃ o!",
  "Thá»i gian cÃ³ thá»ƒ trÃ´i mau, nhÆ°ng tÃ¬nh báº¡n cá»§a chÃºng mÃ¬nh thÃ¬ mÃ£i mÃ£i cÃ²n láº¡i.",
  "NhÃ¬n láº¡i áº£nh cÅ© má»›i tháº¥y ngÃ y xÆ°a chÃºng mÃ¬nh ngá»‘ tÃ u mÃ  vui tháº­t sá»±.",
  "Cáº£m Æ¡n vÃ¬ chÃºng ta Ä‘Ã£ cÃ¹ng nhau Ä‘i qua nhá»¯ng nÄƒm thÃ¡ng thanh xuÃ¢n trong tráº»o nháº¥t cuá»™c Ä‘á»i.",
  "ÄÃºng cháº¥t K8A1 â€” ÄÃ£ tá»¥ táº­p lÃ  pháº£i vui háº¿t náº¥c!",
  "CÃ³ nhá»¯ng ngÆ°á»i báº¡n, dáº«u bao nÄƒm xa cÃ¡ch, gáº·p láº¡i váº«n váº¹n nguyÃªn sá»± chÃ¢n thÃ nh.",
  "áº¢nh cÃ³ thá»ƒ má» theo nÄƒm thÃ¡ng, nhÆ°ng tÃ¬nh báº¡n cá»§a chÃºng mÃ¬nh thÃ¬ lÃºc nÃ o cÅ©ng nÃ©t cÄƒng!",
  "Hai mÆ°Æ¡i nÄƒm â€” Má»™t cháº·ng Ä‘Æ°á»ng Ä‘á»§ dÃ i Ä‘á»ƒ tháº¥u hiá»ƒu giÃ¡ trá»‹ thiÃªng liÃªng cá»§a hai chá»¯ tri ká»·.",
  "Ai báº£o 20 nÄƒm lÃ  lÃ¢u? Cá»© Ä‘á»©ng chung má»™t khung hÃ¬nh lÃ  láº¡i thÃ nh báº¡n cÃ¹ng lá»›p ngay!",
  "Äi tháº­t xa qua bao thÄƒng tráº§m cuá»™c Ä‘á»i, nháº­n ra tÃ¬nh báº¡n tuá»•i há»c trÃ² váº«n lÃ  Ä‘iá»u bÃ¬nh yÃªn nháº¥t.",
  "Thá»i gian trÃ´i nhanh tháº­t, nhÆ°ng ná»¥ cÆ°á»i cá»§a K8A1 thÃ¬ cháº³ng chá»‹u giÃ  Ä‘i chÃºt nÃ o!",
  "Ão tráº¯ng ngÃ y xÆ°a, tiáº¿ng cÆ°á»i ngÃ y cÅ© â€” Kho bÃ¡u vÃ´ giÃ¡ sau hai mÆ°Æ¡i nÄƒm Ä‘Æ°á»ng Ä‘á»i.",
  "NhÃ¬n nhá»¯ng gÆ°Æ¡ng máº·t thÃ¢n quen nÃ y, bao nhiÃªu má»‡t má»i tá»± nhiÃªn tan biáº¿n háº¿t!",
  "NÄƒm thÃ¡ng cÃ³ thá»ƒ láº¥y Ä‘i tuá»•i tráº», nhÆ°ng khÃ´ng thá»ƒ láº¥y Ä‘i nhá»¯ng há»“i á»©c Ä‘áº¹p Ä‘áº½ chÃºng mÃ¬nh tá»«ng cÃ³.",
  "Thanh xuÃ¢n cá»§a lá»›p mÃ¬nh cháº³ng cáº§n cáº§u ká»³, chá»‰ cáº§n cÃ³ nhau lÃ  vui ná»• trá»i rá»“i!",
  "TÃ¬nh báº¡n tuá»•i mÆ°á»i tÃ¡m lÃ  mÃ³n quÃ  quÃ½ giÃ¡ mÃ  thá»i gian khÃ´ng thá»ƒ nÃ o xÃ³a nhÃ²a.",
  "20 nÄƒm má»™t cháº·ng Ä‘Æ°á»ng â€” Vá» bÃªn nhau lÃ  cá»© tÃ­u tÃ­t nhÆ° chÆ°a tá»«ng xa cÃ¡ch.",
  "DÃ¹ mai nÃ y má»—i ngÆ°á»i má»™t phÆ°Æ¡ng, K8A1 váº«n luÃ´n lÃ  mÃ¡i nhÃ  áº¥m Ã¡p Ä‘á»ƒ tÃ¬m vá».",
  "Ná»¥ cÆ°á»i ráº¡ng rá»¡ cá»§a K8A1 â€” Äá»™c quyá»n chá»‰ lá»›p mÃ¬nh má»›i cÃ³ thÃ´i nhÃ©!",
  "Trá»Ÿ vá» Ä‘á»ƒ nhá»›, trá»Ÿ vá» Ä‘á»ƒ thÆ°Æ¡ng vÃ  cÃ¹ng nhau trÃ¢n trá»ng tá»«ng phÃºt giÃ¢y cá»§a hiá»‡n táº¡i.",
  "Gáº·p láº¡i sau 20 nÄƒm mÃ  cáº£m giÃ¡c thÃ¢n quen cá»© nhÆ° vá»«a má»›i tan há»c hÃ´m qua.",
  "Háº¡nh phÃºc Ä‘Æ¡n sÆ¡ lÃ  Ä‘Æ°á»£c ngá»“i láº¡i bÃªn nhau, nhÃ¬n ngáº¯m nhá»¯ng ná»¥ cÆ°á»i thÃ¢n thÆ°Æ¡ng ngÃ y cÅ©.",
  "Chá»‰ cáº§n Ä‘á»©ng cáº¡nh nhau lÃ  tá»± kháº¯c tháº¥y mÃ¬nh tráº» láº¡i chá»¥c tuá»•i!",
  "Má»—i bá»©c áº£nh lÃ  má»™t chiáº¿c vÃ© ká»³ diá»‡u Ä‘Æ°a chÃºng mÃ¬nh tÃ¬m láº¡i nhá»¯ng nÄƒm thÃ¡ng vÃ´ tÆ° nháº¥t.",
  "DÃ¹ á»Ÿ Ä‘Ã¢u, lÃ m gÃ¬ thÃ¬ K8A1 gáº·p nhau váº«n cá»© lÃ  nhá»¯ng ngÆ°á»i báº¡n tinh nghá»‹ch ngÃ y nÃ o.",
  "DÃ¹ báº¡n Ä‘ang á»Ÿ Ä‘Ã¢u, lÃ m gÃ¬, hÃ£y luÃ´n nhá»› ráº±ng báº¡n lÃ  má»™t pháº§n khÃ´ng thá»ƒ thiáº¿u cá»§a K8A1.",
  "20 nÄƒm má»›i cÃ³ dá»‹p Ä‘Ã´ng Ä‘á»§ tháº¿ nÃ y, cÆ°á»i tháº­t tÆ°Æ¡i lÃªn nÃ o cÃ¡c báº¡n Æ¡i!",
  "Gáº·p láº¡i nhau sau 20 nÄƒm, Ä‘á»ƒ tháº¥y tuá»•i tráº» cá»§a chÃºng mÃ¬nh chÆ°a tá»«ng phai má» theo nÄƒm thÃ¡ng.",
  "Gáº·p láº¡i nhau, bao nhiÃªu chuyá»‡n vui ngÃ y xÆ°a láº¡i Ä‘Æ°á»£c ká»ƒ ra cÆ°á»i nghiÃªng ngáº£.",
  "Bao nhiÃªu nÄƒm bÃ´n ba, báº¿n Ä‘á»— áº¥m Ã¡p vÃ  chÃ¢n thÃ nh nháº¥t váº«n lÃ  báº¡n bÃ¨ Ä‘á»“ng mÃ´n.",
  "GÆ°Æ¡ng máº·t ráº¡ng ngá»i tháº¿ nÃ y thÃ¬ ai Ä‘oÃ¡n Ä‘Æ°á»£c lá»›p mÃ¬nh Ä‘Ã£ ra trÆ°á»ng 20 nÄƒm rá»“i chá»©!",
  "HÃ£y giá»¯ cháº·t láº¥y nhá»¯ng kÃ½ á»©c tuyá»‡t vá»i nÃ y, Ä‘á»ƒ tiáº¿p thÃªm sá»©c máº¡nh cho cháº·ng Ä‘Æ°á»ng phÃ­a trÆ°á»›c.",
  "Má»™t bá»©c áº£nh, triá»‡u niá»m vui â€” Cáº£m Æ¡n vÃ¬ Ä‘Ã£ cÃ¹ng nhau táº¡o nÃªn nhá»¯ng khoáº£nh kháº¯c nÃ y.",
  "TÃ¬nh báº¡n Ä‘á»“ng mÃ´n son sáº¯t, vÆ°á»£t qua má»i ranh giá»›i cá»§a thá»i gian vÃ  khoáº£ng cÃ¡ch.",
  "NgÃ y xÆ°a vui má»™t, ngÃ y há»™i ngá»™ 20 nÄƒm gáº·p láº¡i cÃ²n vui gáº¥p mÆ°á»i láº§n!",
  "Tuá»•i há»c trÃ² Ä‘Ã£ lÃ¹i xa, nhÆ°ng nhá»¯ng Ã¢n tÃ¬nh gá»­i gáº¯m nÆ¡i nhau thÃ¬ mÃ£i mÃ£i váº¹n nguyÃªn.",
  "Thanh xuÃ¢n trÃ´i qua cÃ¡i vÃ¨o, nhÆ°ng tÃ¬nh báº¡n K8A1 thÃ¬ á»Ÿ láº¡i mÃ£i mÃ£i.",
  "CÃ³ nhá»¯ng khoáº£nh kháº¯c giáº£n dá»‹ bÃªn nhau, nay Ä‘Ã£ hÃ³a thÃ nh kÃ½ á»©c vÃ´ giÃ¡ cá»§a cuá»™c Ä‘á»i.",
  "Khoáº£nh kháº¯c Ä‘Ã¡ng nhá»› cá»§a nhá»¯ng ngÆ°á»i báº¡n cÃ¹ng chung má»™t thá»i thanh xuÃ¢n.",
  "Cáº£m Æ¡n nhá»¯ng cÃ¡i Ã´m, nhá»¯ng ná»¥ cÆ°á»i chÃ¢n tÃ¬nh Ä‘Ã£ lÃ m nÃªn ngÃ y há»™i ngá»™ Ä‘ong Ä‘áº§y yÃªu thÆ°Æ¡ng.",
  "Ná»¥ cÆ°á»i nÃ y, Ã¡nh máº¯t nÃ y â€” ÄÃºng lÃ  báº¡n thÃ¢n cá»§a tÃ´i Ä‘Ã¢y rá»“i!",
  "DÃ¹ cuá»™c sá»‘ng cÃ³ thÄƒng tráº§m sÃ³ng giÃ³, ná»¥ cÆ°á»i báº¡n bÃ¨ váº«n lÃ  Ä‘iá»u xoa dá»‹u lÃ²ng ta nháº¥t.",
  "Hai mÆ°Æ¡i nÄƒm xa cÃ¡ch, gáº·p láº¡i lÃ  chuyá»‡n trÃ² rÃ´m ráº£ ká»ƒ mÃ£i khÃ´ng háº¿t.",
  "Äá»i ngÆ°á»i Ä‘Æ°á»£c máº¥y láº§n hai mÆ°Æ¡i nÄƒm, hÃ£y trÃ¢n trá»ng tá»«ng phÃºt giÃ¢y quÃ½ giÃ¡ khi Ä‘Æ°á»£c bÃªn nhau.",
  "Bá»©c áº£nh Ä‘áº¹p nháº¥t lÃ  bá»©c áº£nh cÃ³ ná»¥ cÆ°á»i ráº¡ng rá»¡ cá»§a táº¥t cáº£ chÃºng mÃ¬nh.",
  "Khoáº£ng cÃ¡ch Ä‘á»‹a lÃ½ cÃ³ thá»ƒ xa xÃ´i, nhÆ°ng trÃ¡i tim K8A1 luÃ´n cÃ¹ng chung má»™t nhá»‹p Ä‘áº­p.",
  "DÃ¹ nÄƒm thÃ¡ng cÃ³ Ä‘á»•i thay, K8A1 gáº·p nhau lÃ  nÄƒng lÆ°á»£ng tÃ­ch cá»±c láº¡i trÃ n Ä‘áº§y!",
  "Náº¿p nhÄƒn cÃ³ thá»ƒ háº±n lÃªn khÃ³e máº¯t, nhÆ°ng tÃ¢m há»“n tuá»•i Ä‘Ã´i mÆ°Æ¡i váº«n sá»‘ng mÃ£i trong ta.",
  "Thanh xuÃ¢n khÃ´ng quay láº¡i, nhÆ°ng chÃºng mÃ¬nh cÃ³ thá»ƒ cÃ¹ng nhau táº¡o thÃªm tháº­t nhiá»u ká»· niá»‡m má»›i!",
  "TÃ¬nh báº¡n K8A1 nhÆ° ngá»n lá»­a áº¥m Ã¡p, cÃ ng qua nÄƒm thÃ¡ng láº¡i cÃ ng bá»n cháº·t vÃ  sÃ¢u sáº¯c hÆ¡n.",
  "20 nÄƒm ngÃ y há»™i ngá»™ â€” Giá»¯ mÃ£i tinh tháº§n tráº» trung, yÃªu Ä‘á»i nÃ y nhÃ© K8A1!",
  "Má»—i bá»©c hÃ¬nh lÃ  má»™t nhá»‹p cáº§u yÃªu thÆ°Æ¡ng Ä‘Æ°a ta trá»Ÿ vá» vá»›i miá»n kÃ½ á»©c dáº¥u yÃªu.",
  "Thá»i gian lÃ m thay Ä‘á»•i nhiá»u thá»©, nhÆ°ng Ä‘á»™ vui tÃ­nh vÃ  láº§y lá»™i cá»§a lá»›p mÃ¬nh thÃ¬ váº«n tháº¿!",
  "Thanh xuÃ¢n khÃ´ng bao giá» káº¿t thÃºc chá»«ng nÃ o chÃºng mÃ¬nh váº«n luÃ´n nhá»› vá» nhau.",
  "NhÃ¬n bá»©c áº£nh nÃ y lÃ  tháº¥y cáº£ má»™t báº§u trá»i vui nhá»™n Ã¹a vá» rá»“i!",
  "Biáº¿t Æ¡n vÃ¬ trong nhá»¯ng nÄƒm thÃ¡ng Ä‘áº¹p nháº¥t cá»§a cuá»™c Ä‘á»i, chÃºng ta Ä‘Ã£ cÃ³ nhau bÃªn cáº¡nh.",
  "Ai cÅ©ng ráº¡ng rá»¡, ai cÅ©ng tÆ°Æ¡i vui â€” K8A1 hÃ´m nay Ä‘á»‰nh tháº­t sá»±!",
  "TÃ¬nh báº¡n Ä‘Ã­ch thá»±c khÃ´ng Ä‘o báº±ng thá»i gian, mÃ  Ä‘o báº±ng sá»± gáº¯n káº¿t chÃ¢n thÃ nh giá»¯a nhá»¯ng tÃ¢m há»“n.",
  "Tuá»•i há»c trÃ² vui nháº¥t lÃ  khi cÃ³ nhá»¯ng Ä‘á»©a báº¡n thÃ¢n cÃ¹ng cÆ°á»i, cÃ¹ng sáº» chia.",
  "Hai mÆ°Æ¡i nÄƒm â€” Äá»§ Ä‘á»ƒ nháº­n ra tÃ¬nh báº¡n thuá»Ÿ hoa niÃªn lÃ  Ä‘iá»u thuáº§n khiáº¿t vÃ  quÃ½ giÃ¡ nháº¥t.",
  "Cháº³ng cáº§n táº¡o dÃ¡ng cáº§u ká»³, cá»© cÆ°á»i tá»± nhiÃªn lÃ  cÃ³ ngay bá»©c áº£nh ká»· niá»‡m cá»±c Ä‘áº¹p!",
  "Nhá»¯ng ká»· niá»‡m nÄƒm áº¥y sáº½ mÃ£i lÃ  hÃ nh trang áº¥m Ã¡p theo chÃºng mÃ¬nh trÃªn váº¡n náº»o Ä‘Æ°á»ng Ä‘á»i.",
  "K8A1 â€” NÆ¡i tá»¥ há»™i cá»§a nhá»¯ng ná»¥ cÆ°á»i tÆ°Æ¡i nháº¥t vÃ  nhá»¯ng ngÆ°á»i báº¡n tuyá»‡t vá»i nháº¥t!",
  "Gáº·p láº¡i nhau hÃ´m nay, tháº¥y bÃ³ng hÃ¬nh cá»§a chÃ­nh mÃ¬nh hai mÆ°Æ¡i nÄƒm trÆ°á»›c Ä‘ang má»‰m cÆ°á»i.",
  "20 nÄƒm rá»“i má»›i láº¡i Ä‘Æ°á»£c chá»¥p áº£nh cÃ¹ng nhau, vá»«a bá»“i há»“i vá»«a vui khÃ³ táº£!",
  "Cáº£m Æ¡n vÃ¬ Ä‘Ã£ luÃ´n lÃ  nhá»¯ng ngÆ°á»i báº¡n tuyá»‡t vá»i nháº¥t trong thanh xuÃ¢n cá»§a nhau.",
  "TÃ¬nh báº¡n K8A1: KhÃ´ng khoáº£ng cÃ¡ch, gáº·p nhau lÃ  rá»™n rÃ£ tiáº¿ng cÆ°á»i tá»« Ä‘áº§u Ä‘áº¿n cuá»‘i!",
  "Má»™t cháº·ng Ä‘Æ°á»ng hai mÆ°Æ¡i nÄƒm, Ä‘ong Ä‘áº§y nhá»¯ng nghÄ©a tÃ¬nh Ä‘á»“ng mÃ´n khÃ´ng thá»ƒ nÃ o phai.",
  "Nhá»¯ng khoáº£nh kháº¯c tá»± nhiÃªn tháº¿ nÃ y má»›i Ä‘Ãºng lÃ  'cháº¥t' K8A1 cá»§a chÃºng mÃ¬nh chá»©!",
  "Thá»i gian trÃ´i Ä‘i khÃ´ng láº¥y láº¡i Ä‘Æ°á»£c, nhÆ°ng ká»· niá»‡m lÃ  bÃ¡u váº­t mÃ£i mÃ£i thuá»™c vá» chÃºng ta.",
  "Há»™i ngá»™ sau 20 nÄƒm â€” Nhá»¯ng cÃ¡i báº¯t tay tháº­t cháº·t vÃ  nhá»¯ng tiáº¿ng cÆ°á»i giÃ²n tan!",
  "TÃ¬nh báº¡n Ä‘Æ°á»£c tÃ´i luyá»‡n qua hai mÆ°Æ¡i nÄƒm sÆ°Æ¡ng giÃ³ cÃ ng trá»Ÿ nÃªn son sáº¯t vÃ  Ä‘Ã¡ng quÃ½ hÆ¡n.",
  "áº¢nh chá»¥p lÃºc nÃ o cÅ©ng tháº¥y lá»›p mÃ¬nh tÆ°Æ¡i vui vÃ  trÃ n Ä‘áº§y sá»©c sá»‘ng!",
  "DÃ¹ á»Ÿ lá»©a tuá»•i nÃ o, trá»Ÿ vá» trong vÃ²ng tay bÃ¨ báº¡n cÅ©, ta láº¡i tháº¥y lÃ²ng mÃ¬nh bÃ¬nh yÃªn nhÆ° xÆ°a.",
  "Gáº·p láº¡i báº¡n bÃ¨ cÅ©, tháº¥y nhÆ° Ä‘Æ°á»£c náº¡p thÃªm bao nhiÃªu nÄƒng lÆ°á»£ng vui váº» cho cuá»™c sá»‘ng!",
  "Ká»· niá»‡m Ä‘áº¹p khÃ´ng pháº£i vÃ¬ nÃ³ hoÃ n háº£o, mÃ  vÃ¬ chÃºng mÃ¬nh Ä‘Ã£ cÃ¹ng nhau sá»‘ng trá»n váº¹n nhá»¯ng ngÃ y thÃ¡ng áº¥y.",
  "20 NÄƒm NgÃ y Trá»Ÿ Vá» â€” Má»™t ngÃ y trá»n váº¹n cá»§a niá»m vui, tiáº¿ng cÆ°á»i vÃ  sá»± sáº» chia!",
  "Háº¡nh phÃºc vá»¡ Ã²a khi sau hai tháº­p ká»·, chÃºng mÃ¬nh váº«n gá»i tÃªn nhau thÃ¢n thÆ°Æ¡ng nhÆ° thuá»Ÿ nÃ o.",
  "Cá»© vui nhÆ° tháº¿ nÃ y nhÃ©, dÃ¹ 20 hay 30 nÄƒm ná»¯a gáº·p láº¡i váº«n pháº£i cÆ°á»i tháº­t tÆ°Æ¡i!",
  "Má»—i ná»¥ cÆ°á»i trong bá»©c áº£nh nÃ y Ä‘á»u chá»Ÿ che bao nghÄ©a tÃ¬nh sÃ¢u Ä‘áº­m cá»§a báº¡n bÃ¨ cÃ¹ng lá»›p.",
  "Lá»›p mÃ¬nh ai cÅ©ng cÆ°á»i xinh, cÆ°á»i tÆ°Æ¡i â€” NhÃ¬n áº£nh lÃ  tháº¥y khÃ´ng khÃ­ rá»™n rÃ ng ngay!",
  "ChÃ o má»«ng báº¡n Ä‘Ã£ trá»Ÿ vá» nhÃ  â€” NgÃ´i nhÃ  K8A1 áº¥m Ã¡p luÃ´n má»Ÿ rá»™ng cá»­a Ä‘Ã³n chÃ o.",
  "Hai mÆ°Æ¡i nÄƒm trÃ´i qua, ná»¥ cÆ°á»i cá»§a chÃºng mÃ¬nh váº«n váº¹n nguyÃªn nÃ©t vui tÆ°Æ¡i ngÃ y áº¥y.",
  "NgÃ y trá»Ÿ vá» khÃ´ng chá»‰ lÃ  hoÃ i niá»‡m, mÃ  cÃ²n lÃ  lá»i há»©a sáº½ luÃ´n Ä‘á»“ng hÃ nh bÃªn nhau mai sau.",
  "K8A1 mÃ£i Ä‘á»‰nh â€” LuÃ´n vui váº», yÃªu Ä‘á»i vÃ  trÃ n ngáº­p tÃ¬nh cáº£m bÃ¨ báº¡n!",
  "ChÃºc cho Ä‘áº¡i gia Ä‘Ã¬nh K8A1 luÃ´n trÃ n Ä‘áº§y sá»©c khá»e, háº¡nh phÃºc vÃ  mÃ£i mÃ£i gáº¯n káº¿t bá»n lÃ¢u.",
  "Thanh xuÃ¢n rá»±c rá»¡ nháº¥t lÃ  khi chÃºng mÃ¬nh Ä‘Æ°á»£c cÃ¹ng nhau cÆ°á»i Ä‘Ã¹a vÃ´ tÆ° tháº¿ nÃ y!",
  "HÃ£y Ä‘á»ƒ ngÃ y hÃ´m nay trá»Ÿ thÃ nh má»™t cá»™t má»‘c vÃ ng son, ghi dáº¥u tÃ¬nh báº¡n báº¥t diá»‡t cá»§a lá»›p K8A1.",
  "DÃ¹ mai nÃ y báº­n rá»™n Ä‘áº¿n Ä‘Ã¢u, nhá»› lÃ  K8A1 chÃºng mÃ¬nh luÃ´n cÃ³ nhau nhÃ©!",
  "K8A1 â€” MÃ£i mÃ£i lÃ  má»™t thá»i tuá»•i tráº» rá»±c rá»¡ vÃ  nhá»¯ng ngÆ°á»i báº¡n tri ká»· suá»‘t cuá»™c Ä‘á»i."
];

/**
 * Láº¥y cÃ¢u chÃº thÃ­ch hoÃ i niá»‡m thay tháº¿ cho tÃªn file áº£nh ká»¹ thuáº­t sá»‘ hoáº·c caption máº·c Ä‘á»‹nh chung chung
 */
export function getNostalgicPhotoCaption(index: number, customCaption?: string): string {
  if (customCaption && !isMachineOrGenericCaption(customCaption)) {
    return customCaption.trim();
  }
  return NOSTALGIC_QUOTES[Math.abs(index) % NOSTALGIC_QUOTES.length];
}

export const DEFAULT_EVENT_CONFIG: EventConfig = {
  eventTitle: "20 NÄƒm NgÃ y Trá»Ÿ Vá»",
  eventSubtitle: "Lá»›p K8A1 â€” TrÆ°á»ng THPT ThÃ¡i NguyÃªn",
  eventDateText: "Chá»§ Nháº­t, 27/09/2026 (07:30 â€” 12:30)",
  eventTimeText: "Tá»« 07:30 SÃ¡ng â€” Chá»§ Nháº­t, ngÃ y 27/09/2026",
  countdownTarget: "2026-09-27T07:30:00+07:00",

  // Cháº·ng 1: TrÆ°á»ng THPT ThÃ¡i NguyÃªn
  venueName: "TrÆ°á»ng THPT ThÃ¡i NguyÃªn",
  venueSubtitle: "Cháº·ng 1: 07:30 â€“ 09:00 â€¢ ThÄƒm trÆ°á»ng, Ä‘Ã³n cÃ´ chá»§ nhiá»‡m & chá»¥p áº£nh lÆ°u niá»‡m (Concept 1 & 2)",
  venueAddress: "Sá»‘ 127 Ä‘Æ°á»ng LÆ°Æ¡ng Tháº¿ Vinh, P. Quang Trung, TP. ThÃ¡i NguyÃªn, Tá»‰nh ThÃ¡i NguyÃªn",
  shortAddress: "127 LÆ°Æ¡ng Tháº¿ Vinh, TP. ThÃ¡i NguyÃªn",
  venueTime: "07:30 â€” 09:00 (SÃ¡ng)",
  venueActivity: "07h30: BTC cÃ³ máº·t, Ä‘Ã³n cÃ´ chá»§ nhiá»‡m â€¢ 08h00: Concept 1 'K8A1 Má»™t thá»i Ä‘á»ƒ nhá»›' (Ão Ä‘á»“ng phá»¥c) â€¢ 08h30: Concept 2 'Thanh xuÃ¢n trá»Ÿ láº¡i' (Ná»¯ Ã¡o dÃ i/vÃ¡y tráº¯ng, Nam sÆ¡ mi tráº¯ng) â€¢ 09h00: Di chuyá»ƒn vá» XHotel / X - Restaurant",
  mapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m4!2m1!1zVHLGsOG7nW5nIFRIUFQgVGjDoWkgTmd1ecOqbiwgMTI3IEzGsMahbmcgVGjhur8gVmluaCwgVGjDoWkgTmd1ecOqbg!5e0!6i17!3m1!1svi!5m1!1svi",
  mapDirectUrl: "https://www.google.com/maps/search/?api=1&query=Tr%C6%B0%E1%BB%9Dng+THPT+Th%C3%A1i+Nguy%C3%AAn,+127+L%C6%B0%C6%A1ng+Th%E1%BA%BF+Vinh,+Th%C3%A1i+Nguy%C3%AAn",

  // Cháº·ng 2: NhÃ  HÃ ng & Trung TÃ¢m Sá»± Kiá»‡n Prime ThÃ¡i NguyÃªn (Máº·c Ä‘á»‹nh táº¯t theo cáº¥u hÃ¬nh Google Sheet)
  enableTwoVenues: true,
  venue2Name: "XHotel / X - Restaurant",
  venue2Subtitle: "Cháº·ng 2: 09:15 â€“ 12:30 â€¢ Check-in Ä‘Ã³n Tháº§y CÃ´, Gala Há»™i ngá»™ 20 nÄƒm, tri Ã¢n & tiá»‡c trÆ°a",
  venue2Address: "XHotel / X - Restaurant, TP. ThÃ¡i NguyÃªn, Tá»‰nh ThÃ¡i NguyÃªn",
  venue2ShortAddress: "XHotel / X - Restaurant, TP. ThÃ¡i NguyÃªn",
  venue2Time: "09:15 â€” 12:30 (TrÆ°a)",
  venue2Activity: "09h15: Check-in Ä‘Ã³n Tháº§y CÃ´ (Ão Ä‘á»“ng phá»¥c K8A1) â€¢ 10h00: Khai máº¡c, Tri Ã¢n Tháº§y CÃ´ â€¢ 10h30: Khai tiá»‡c Concept 3 (Trang phá»¥c tá»± do thanh lá»‹ch) â€¢ 11h30: Lá»i nháº¯n 10 nÄƒm sau, trao quÃ  â€¢ 12h00: áº¢nh táº­p thá»ƒ, báº¿ máº¡c",
  venue2MapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d600!2d105.8386089!3d21.5949009!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x52211cf3f4926b%3A0x6de9f091b88c49ab!2sTh%C3%A1p%20%C4%91%C3%B4i%20Prime%20Th%C3%A1i%20Nguy%C3%AAn!5e1!3m2!1svi!2svn!4v1725550000000!5m2!1svi!2svn",
  venue2MapDirectUrl: "https://maps.app.goo.gl/a3utiYosZqGHKDjYA",
  routeDistanceText: "~1.5km (Di chuyá»ƒn 5 - 10 phÃºt)",
  routeDirectUrl: "https://www.google.com/maps/dir/?api=1&origin=Tr%C6%B0%E1%BB%9Dng+THPT+Th%C3%A1i+Nguy%C3%AAn,+127+L%C6%B0%C6%A1ng+Th%E1%BA%BF+Vinh,+Th%C3%A1i+Nguy%C3%AAn&destination=Th%C3%A1p+%C4%91%C3%B4i+Prime+Th%C3%A1i+Nguy%C3%AAn,+S%E1%BB%91+1+Ho%C3%A0ng+V%C4%83n+Th%E1%BB%A5,+Th%C3%A1i+Nguy%C3%AAn",

  letterTitle: "Lá»i Tri Ã‚n â€” K8A1 20 NÄƒm: Má»™t Cháº·ng ÄÆ°á»ng, Má»™t Äá»i TÃ¬nh Báº¡n",
  letterSubtitle: "Hai mÆ°Æ¡i nÄƒm â€“ má»™t cháº·ng Ä‘Æ°á»ng, má»™t láº§n trá»Ÿ vá», ngÃ n láº§n thÆ°Æ¡ng nhá»›...",
  letterParagraph1: "KÃ­nh gá»­i Ban GiÃ¡m hiá»‡u TrÆ°á»ng THPT ThÃ¡i NguyÃªn, cÃ¡c cÃ´ giÃ¡o chá»§ nhiá»‡m cÃ¹ng toÃ n thá»ƒ cÃ¡c tháº§y cÃ´ giÃ¡o bá»™ mÃ´n Ä‘Ã£ tá»«ng giáº£ng dáº¡y táº­p thá»ƒ lá»›p K8A1 niÃªn khÃ³a 2003 â€“ 2006.\n\nHai mÆ°Æ¡i nÄƒm trÆ°á»›c, chÃºng em rá»i xa mÃ¡i trÆ°á»ng thÃ¢n yÃªu mang theo hÃ nh trang lÃ  tri thá»©c, lÃ  nhá»¯ng bÃ i há»c lÃ m ngÆ°á»i sÃ¢u sáº¯c vÃ  cáº£ niá»m tin yÃªu mÃ  tháº§y cÃ´ Ä‘Ã£ cáº§n máº«n trao gá»­i. Hai mÆ°Æ¡i nÄƒm trÃ´i qua, dÃ¹ á»Ÿ báº¥t ká»³ phÆ°Æ¡ng trá»i nÃ o, trÃªn má»—i bÆ°á»›c Ä‘Æ°á»ng trÆ°á»Ÿng thÃ nh cá»§a má»—i chÃºng em Ä‘á»u cÃ³ bÃ³ng hÃ¬nh cá»§a mÃ¡i trÆ°á»ng xÆ°a, cÃ³ sá»± chá»Ÿ che, dÃ¬u dáº¯t tá»« nhá»¯ng thÃ¡ng nÄƒm hoa niÃªn tÆ°Æ¡i Ä‘áº¹p. HÃ´m nay, trong niá»m xÃºc Ä‘á»™ng ngháº¹n ngÃ o cá»§a ngÃ y trá»Ÿ vá», táº­p thá»ƒ K8A1 xin Ä‘Æ°á»£c cÃºi Ä‘áº§u kÃ­nh cáº©n dÃ¢ng lÃªn tháº§y cÃ´ lá»i tri Ã¢n sÃ¢u sáº¯c vÃ  lÃ²ng biáº¿t Æ¡n vÃ´ háº¡n. Cáº£m Æ¡n tháº§y cÃ´ vÃ¬ Ä‘Ã£ dÃ nh trá»n tÃ¢m huyáº¿t, tÃ¬nh thÆ°Æ¡ng Ä‘á»ƒ tháº¯p sÃ¡ng Æ°á»›c mÆ¡ cho chÃºng em.",
  letterParagraph2: "Äá»“ng thá»i, xin gá»­i lá»i cáº£m Æ¡n chÃ¢n thÃ nh tá»›i 50 trÃ¡i tim K8A1 Ä‘Ã£ cÃ¹ng nhau tá» tá»±u, gáº¯n káº¿t vÃ  tiáº¿p ná»‘i máº¡ch nguá»“n tÃ¬nh báº¡n thiÃªng liÃªng sau 20 nÄƒm xa cÃ¡ch. DÃ¹ thá»i gian cÃ³ Ä‘á»•i thay, mÃ¡i tÃ³c cÃ³ ngáº£ mÃ u, tÃ¬nh báº¡n cá»§a chÃºng ta váº«n mÃ£i váº¹n nguyÃªn nhÆ° nhá»¯ng ngÃ y Ä‘áº§u dÆ°á»›i mÃ¡i trÆ°á»ng THPT ThÃ¡i NguyÃªn.\n\nKÃ­nh chÃºc cÃ¡c tháº§y cÃ´ luÃ´n dá»“i dÃ o sá»©c khá»e, háº¡nh phÃºc vÃ  an yÃªn! ChÃºc cho tÃ¬nh báº¡n K8A1 mÃ£i mÃ£i xanh tÆ°Æ¡i, bá»n cháº·t theo nÄƒm thÃ¡ng! Thanh xuÃ¢n cÃ³ báº¡n lÃ  táº¥t cáº£ lÃ  nhá»¯ng Ä‘iá»u tuyá»‡t vá»i nháº¥t! â™¡",
  letterSignatureTitle: "TrÆ°á»Ÿng Ban LiÃªn Láº¡c K8A1",
  letterSignatureSubtitle: "Tráº§n Thá»‹ Thanh Nháº¡n",
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
  poloDescription: "Thun cÃ¡ sáº¥u 4 chiá»u cao cáº¥p â€¢ Cá»• Ã¡o & tay Ã¡o bo viá»n há»• phÃ¡ch â€¢ ThÃªu logo vÃ ng kim ngá»±c trÃ¡i",
  backdrops: DEFAULT_BACKDROPS,
  musicPlaylist: DEFAULT_PLAYLIST,
  stageSettings: DEFAULT_STAGE_SETTINGS,
  albums: DEFAULT_ALBUMS,
  showAnnouncements: true,
  blockVisibility: {
    hero: true,
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
  },
  isPostEvent: true, // Sá»± kiá»‡n 20 nÄƒm Ä‘Ã£ tá»• chá»©c xong â€” KhÃ³a quyá»n ghi cho guest
};

// =============================================================================
// DANH SÃCH Báº¢N TIN & THÃ”NG BÃO CHÃNH THá»¨C K8A1 Máº¶C Äá»ŠNH
// =============================================================================
export const DEFAULT_ANNOUNCEMENTS: import('./types').Announcement[] = [
  {
    id: "TB-REPORT-20Y",
    slug: "tong-ket-20-nam",
    title: "ðŸ† Dáº¤U áº¤N 2 DECADES: KÃ½ Sá»± Äáº¡i Lá»… 20 NÄƒm & Ká»³ TÃ­ch Sá»‘ HÃ³a Há»™i KhÃ³a K8A1",
    category: "report",
    summary: "Báº£n kÃ½ sá»± & bÃ¡o cÃ¡o tá»•ng káº¿t chÃ­nh thá»©c: NhÃ¬n láº¡i hÃ nh trÃ¬nh 2 tháº­p ká»· tri ká»· vá»›i 24 giá» há»™i ngá»™ xÃºc Ä‘á»™ng ngháº¹n ngÃ o, 4 con sá»‘ ká»· lá»¥c lá»‹ch sá»­ vÃ  5 ká»³ tÃ­ch cÃ´ng nghá»‡ 4.0 tiÃªn phong cá»§a ngÃ y 27/09/2026.",
    content: `BÃO CÃO Tá»”NG Káº¾T & KÃ Sá»° Äáº I Lá»„ 20 NÄ‚M NGÃ€Y TRá»ž Vá»€
"HÃ€NH TRÃŒNH 2 THáº¬P Ká»¶ â€” Má»˜T Äá»œI TRI Ká»¶ & Dáº¤U áº¤N TIÃŠN PHONG Sá» HÃ“A K8A1"
Táº¬P THá»‚ Cá»°U Há»ŒC SINH NIÃŠN KHÃ“A 2003 â€” 2006 | TRÆ¯á»œNG THPT THÃI NGUYÃŠN
(NgÃ y há»™i tá»¥ lá»‹ch sá»­: Chá»§ Nháº­t, 27/09/2026)

KÃ­nh gá»­i: CÃ¡c Tháº§y CÃ´ giÃ¡o kÃ­nh yÃªu â€” nhá»¯ng ngÆ°á»i lÃ¡i Ä‘Ã² táº­n tá»¥y Ä‘Ã£ nÃ¢ng bÆ°á»›c thanh xuÃ¢n cá»§a chÃºng em;
CÃ¹ng toÃ n thá»ƒ 50 trÃ¡i tim K8A1 thÃ¢n thÆ°Æ¡ng tá»« kháº¯p bá»‘n phÆ°Æ¡ng trá»i!

Hai mÆ°Æ¡i nÄƒm â€” hai pháº§n mÆ°á»i tháº¿ ká»· Ä‘Ã£ trÃ´i qua ká»ƒ tá»« mÃ¹a hÃ¨ rá»±c lá»­a hoa phÆ°á»£ng vÄ© nÄƒm 2006, khi 50 cÃ´ cáº­u há»c trÃ² lá»›p K8A1 bÆ°á»›c ra khá»i cÃ¡nh cá»•ng trÆ°á»ng THPT ThÃ¡i NguyÃªn mang theo bao hoÃ i bÃ£o tuá»•i tráº». Hai mÆ°Æ¡i nÄƒm áº¥y, cuá»™c Ä‘á»i má»—i ngÆ°á»i Ä‘Ã£ cÃ³ biáº¿t bao Ä‘á»•i thay, ai cÅ©ng xuÃ´i ngÆ°á»£c vá»›i sá»± nghiá»‡p, gia Ä‘Ã¬nh vÃ  nhá»¯ng bá»™n bá» thÄƒng tráº§m cá»§a Ä‘á»i sá»‘ng. NhÆ°ng cÃ³ má»™t Ä‘iá»u ká»³ diá»‡u chÆ°a bao giá» nháº¡t phai: ngá»n lá»­a tÃ¬nh báº¡n vÃ´ tÆ°, trong sÃ¡ng cá»§a K8A1 váº«n luÃ´n Ã¢m á»‰ chÃ¡y, chá» ngÃ y bÃ¹ng lÃªn thÃ nh má»™t khÃºc hoan ca rá»±c rá»¡.

VÃ  ngÃ y Chá»§ Nháº­t, 27/09/2026 vá»«a qua, khÃºc hoan ca áº¥y Ä‘Ã£ cáº¥t lÃªn vang dá»™i trong ngÃ y Äáº¡i lá»… "20 NÄƒm NgÃ y Trá»Ÿ Vá»". ÄÃ³ khÃ´ng Ä‘Æ¡n thuáº§n lÃ  má»™t buá»•i há»p lá»›p â€” Ä‘Ã³ lÃ  ngÃ y cá»§a nhá»¯ng giá»t nÆ°á»›c máº¯t ngháº¹n ngÃ o trong vÃ²ng tay Tháº§y CÃ´, lÃ  nhá»¯ng cÃ¡i Ã´m siáº¿t cháº·t xÃ³a nhÃ²a má»i khoáº£ng cÃ¡ch thá»i gian, lÃ  tiáº¿ng cÆ°á»i há»“n nhiÃªn khÃ´ng vÆ°á»›ng báº­n danh vá»ng, vÃ  lÃ  sá»± thÄƒng hoa cá»§a má»™t táº­p thá»ƒ xuáº¥t sáº¯c Ä‘Ã£ tá»± tay kiáº¿n táº¡o nÃªn má»™t ká»³ tÃ­ch há»™i khÃ³a chÆ°a tá»«ng cÃ³ trong lá»‹ch sá»­ trÆ°á»ng THPT ThÃ¡i NguyÃªn.

Thay máº·t Ban Tá»• Chá»©c, chÃºng tÃ´i trÃ¢n trá»ng cÃ´ng bá»‘ Báº£n BÃ¡o CÃ¡o Tá»•ng Káº¿t & KÃ½ Sá»± Dáº¥u áº¤n Äáº¡i Lá»… 20 NÄƒm:

â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”
I. KÃ Sá»° 24 GIá»œ HUY HOÃ€NG â€” KHI Ká»¶ NIá»†M HÃ“A VÄ¨NH Cá»¬U
â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”
ðŸŒ… 08:30 SÃNG â€” TRá»ž Vá»€ MIá»€N KÃ á»¨C DÆ¯á»šI BÃ“NG TRÆ¯á»œNG XÆ¯A:
Khoáº£nh kháº¯c Ä‘oÃ n xe chá»Ÿ cÃ¡c báº¡n tá» tá»±u trÆ°á»›c cá»•ng trÆ°á»ng THPT ThÃ¡i NguyÃªn, dÆ°á»ng nhÆ° thá»i gian 20 nÄƒm Ä‘Ã£ ngá»«ng láº¡i. Nhá»¯ng tÃ  Ã¡o polo Ä‘á»“ng phá»¥c K8A1 mang mÃ u xanh hy vá»ng ná»•i báº­t giá»¯a sÃ¢n trÆ°á»ng ngáº­p náº¯ng mÃ¹a thu. 

XÃºc Ä‘á»™ng vÃ  thiÃªng liÃªng nháº¥t lÃ  giÃ¢y phÃºt Ä‘Ã³n chÃ o cÃ¡c Tháº§y CÃ´ giÃ¡o chá»§ nhiá»‡m vÃ  bá»™ mÃ´n kÃ­nh yÃªu. MÃ¡i tÃ³c Tháº§y CÃ´ nay Ä‘Ã£ pha sÆ°Æ¡ng theo nÄƒm thÃ¡ng, nhÆ°ng Ã¡nh máº¯t trÃ¬u máº¿n dÃµi theo Ä‘Ã n con thÆ¡ ngÃ y nÃ o váº«n áº¥m Ã¡p nguyÃªn váº¹n. Nhá»¯ng Ä‘Ã³a hoa tÆ°Æ¡i tháº¯m, nhá»¯ng lá»i tri Ã¢n tá»« Ä‘Ã¡y lÃ²ng vÃ  nhá»¯ng giá»t nÆ°á»›c máº¯t lÄƒn dÃ i trÃªn mÃ¡ Ä‘Ã£ lÃ m rung Ä‘á»™ng cáº£ khÃ´ng gian trÆ°á»ng cÅ©. Tiáº¿ng chuÃ´ng trÆ°á»ng nhÆ° láº¡i vang vá»ng, Ä‘Æ°a 50 con ngÆ°á»i trá»Ÿ vá» trá»n váº¹n vá»›i tuá»•i 18 tinh khÃ´i.

ðŸ¥‚ 11:30 TRÆ¯A â€” Äáº I TIá»†C Há»˜I NGá»˜ BÃ™NG Ná»” Táº I THE PRIME:
Náº¿u buá»•i sÃ¡ng lÃ  sá»± láº¯ng Ä‘á»ng vÃ  biáº¿t Æ¡n, thÃ¬ buá»•i trÆ°a táº¡i trung tÃ¢m The Prime lÃ  má»™t Ä‘áº¡i dÆ°Æ¡ng cáº£m xÃºc bÃ¹ng chÃ¡y. Má»i chá»©c danh xÃ£ há»™i, má»i vá»‹ tháº¿ ngoÃ i Ä‘á»i sá»‘ng Ä‘á»u Ä‘Æ°á»£c trÃºt bá» ngoÃ i cÃ¡nh cá»­a; bÃªn trong chá»‰ cÃ²n láº¡i "mÃ y - tao", nhá»¯ng cÃ¢u chuyá»‡n nghá»‹ch ngá»£m thuá»Ÿ cáº¯p sÃ¡ch, nhá»¯ng biá»‡t danh gáº¯n bÃ³ má»™t thá»i vÃ  nhá»¯ng chÃ©n rÆ°á»£u ná»“ng áº¥m tÃ¬nh báº±ng há»¯u. 

SÃ¢n kháº¥u lá»›n lung linh vá»›i mÃ n LED khá»•ng lá»“ trÃ¬nh chiáº¿u nhá»¯ng thÆ°á»›c phim tÆ° liá»‡u 20 nÄƒm chuyá»ƒn Ä‘á»™ng sá»‘ng Ä‘á»™ng, tiáº¿ng nháº¡c hÃ²a quyá»‡n khiáº¿n ai náº¥y Ä‘á»u rÆ°ng rÆ°ng tá»± hÃ o vÃ¬ mÃ¬nh lÃ  má»™t pháº§n cá»§a Ä‘áº¡i gia Ä‘Ã¬nh K8A1.

â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”
II. Bá»N CON Sá» Ká»¶ Lá»¤C Cá»¦A Äáº I Lá»„ K8A1
â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”
KhÃ´ng chá»‰ thÃ nh cÃ´ng vá» máº·t cáº£m xÃºc, Äáº¡i lá»… K8A1 20 NÄƒm cÃ²n xÃ¡c láº­p 4 con sá»‘ ká»· lá»¥c mang tÃ­nh Ä‘á»‹nh chuáº©n cho phong trÃ o cá»±u há»c sinh:

â€¢ 100% Cáº¤P THáºº Há»ŒC SINH Sá» HÃ“A (STUDENT PASS): 100% thÃ nh viÃªn tham dá»± Ä‘Æ°á»£c trao táº·ng chiáº¿c Tháº» Há»c Sinh K8A1 Digital Ä‘á»™c báº£n vá»›i áº£nh chÃ¢n dung, niÃªn khÃ³a vÃ  mÃ£ váº¡ch nháº­n diá»‡n cÃ¡ nhÃ¢n hÃ³a â€” má»™t ká»· váº­t thanh xuÃ¢n Ä‘Æ°á»£c sá»‘ hÃ³a vÄ©nh viá»…n trÃªn Ä‘iá»‡n thoáº¡i.

â€¢ 0.8 GIÃ‚Y QUÃ‰T QR CHECK-IN ÄÃ“N TIáº¾P: Láº§n Ä‘áº§u tiÃªn, quy trÃ¬nh lá»… tÃ¢n há»p lá»›p Ä‘Æ°á»£c tá»± Ä‘á»™ng hÃ³a hoÃ n toÃ n. Chá»‰ má»™t thao tÃ¡c quÃ©t mÃ£ táº¡i cá»•ng tiá»‡c, há»‡ thá»‘ng tá»©c thÃ¬ nháº­n diá»‡n danh tÃ­nh, phÃ¡t lá»i chÃ o vinh danh trÃªn mÃ n hÃ¬nh vÃ  Ä‘iá»u hÆ°á»›ng bÃ n tiá»‡c chÃ­nh xÃ¡c mÃ  khÃ´ng má»™t giÃ¢y chen chÃºc.

â€¢ 500+ TÆ¯ LIá»†U Sá» HÃ“A HD & Báº¢O Máº¬T 5 Táº¦NG: HÆ¡n ná»­a nghÃ¬n bá»©c áº£nh vÃ  video clip quÃ½ giÃ¡ tráº£i dÃ i 4 má»‘c son (2003â€“2006, 10 nÄƒm, 15 nÄƒm vÃ  Ä‘áº¡i lá»… 20 nÄƒm) Ä‘Æ°á»£c lÆ°u trá»¯ trÃªn ná»n táº£ng Ä‘Ã¡m mÃ¢y tá»‘c Ä‘á»™ cao, tÃ­ch há»£p cÃ´ng nghá»‡ Ä‘Ã³ng dáº¥u báº£n quyá»n Watermark Ä‘á»™c quyá»n vÃ  báº£o máº­t 5 táº§ng chá»‘ng táº£i láº­u.

â€¢ 100% MINH Báº CH TÃ€I CHÃNH Tá»ªNG NGHÃŒN Äá»’NG: ToÃ n bá»™ ngÃ¢n sÃ¡ch thu chi tá»« nguá»“n Ä‘Ã³ng gÃ³p cá»§a cÃ¡c thÃ nh viÃªn, cÃ¡c khoáº£n tÃ i trá»£ danh dá»± cho Ä‘áº¿n chi phÃ­ quÃ  táº·ng Tháº§y CÃ´, tiá»‡c má»«ng, Ã¡o lá»›p... Ä‘Æ°á»£c quyáº¿t toÃ¡n sá»‘ hÃ³a theo thá»i gian thá»±c vá»›i biá»ƒu Ä‘á»“ trá»±c quan, rÃµ rÃ ng, táº¡o niá»m tin tuyá»‡t Ä‘á»‘i.

â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”
III. NÄ‚M TRá»¤ Cá»˜T CÃ”NG NGHá»† 4.0 TIÃŠN PHONG
â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”
Äá»ƒ tá»• chá»©c má»™t sá»± kiá»‡n táº§m vÃ³c sÃ¡nh ngang cÃ¡c há»™i tháº£o chuyÃªn nghiá»‡p, Ban Tá»• Chá»©c K8A1 Ä‘Ã£ tá»± phÃ¡t triá»ƒn trá»n váº¹n Há»‡ sinh thÃ¡i WebApp Ä‘á»™c quyá»n vá»›i 5 cÃ´ng nghá»‡ mÅ©i nhá»n:

â‘  Báº¢N Äá»’ 3D Há»˜I Tá»¤ TOÃ€N Cáº¦U: Trá»±c quan hÃ³a tá»a Ä‘á»™ cá»§a 50 cá»±u há»c sinh tá»« HÃ  Ná»™i, TP.HCM, ÄÃ  Náºµng, cÃ¡c tá»‰nh thÃ nh trÃªn cáº£ nÆ°á»›c vÃ  cáº£ báº¡n bÃ¨ Ä‘á»‹nh cÆ° á»Ÿ nÆ°á»›c ngoÃ i cÃ¹ng hÆ°á»›ng vá» mÃ¡i trÆ°á»ng THPT ThÃ¡i NguyÃªn.
â‘¡ THáºº Há»ŒC SINH DIGITAL & ÄIá»‚M DANH QR: Chuyá»ƒn Ä‘á»•i sá»‘ toÃ n diá»‡n khÃ¢u Ä‘Ã³n tiáº¿p, biáº¿n ká»· niá»‡m thÃ nh tráº£i nghiá»‡m cÃ´ng nghá»‡ Ä‘Ã¡ng nhá»›.
â‘¢ TRUNG TÃ‚M ÄIá»€U KHIá»‚N MÃ€N LED & HÃ’A Ã‚M ÄIá»†N áº¢NH: ToÃ n bá»™ tÆ° liá»‡u kÃ½ á»©c Ä‘Æ°á»£c phÃ¡t sÃ³ng vá»›i hiá»‡u á»©ng Ken Burns Ä‘iá»‡n áº£nh, tÃ­ch há»£p tÃ­nh nÄƒng tá»± Ä‘á»™ng ngáº¯t hÃ²a Ã¢m Ä‘á»ƒ nhÆ°á»ng Ã¢m thanh khi phÃ¡t cÃ¡c video clip ká»· niá»‡m cá»§a lá»›p.
â‘£ Há»† THá»NG Báº¢O Vá»† TÆ¯ LIá»†U 5 Táº¦NG & WATERMARK K8A1: Báº£o vá»‡ hÃ¬nh áº£nh cÃ¡ nhÃ¢n vÃ  gia Ä‘Ã¬nh cá»§a cÃ¡c báº¡n khá»i nguy cÆ¡ bá»‹ sao chÃ©p hoáº·c phÃ¡t tÃ¡n ngoÃ i Ã½ muá»‘n.
â‘¤ TRÃŒNH CHIáº¾U KHÃ”NG DÃ‚Y LÃŠN SMART TV GIA ÄÃŒNH: TÃ­nh nÄƒng chia sáº» link ngáº¯n vÃ  mÃ£ QR cho phÃ©p báº¥t ká»³ thÃ nh viÃªn nÃ o cÅ©ng cÃ³ thá»ƒ chiáº¿u toÃ n bá»™ slide áº£nh lá»›p lÃªn TV phÃ²ng khÃ¡ch nhÃ  mÃ¬nh chá»‰ sau 2 giÃ¢y.

â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”
IV. Lá»œI TRI Ã‚N Tá»ª TRÃI TIM & Sá»¨ Má»†NH Káº¾T Ná»I VÄ¨NH Cá»¬U
â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”
ThÃ nh cÃ´ng rá»±c rá»¡ cá»§a ngÃ y há»™i hÃ´m nay Ä‘Æ°á»£c tháº¯p sÃ¡ng bá»Ÿi tÃ¬nh yÃªu thÆ°Æ¡ng vÃ  sá»± Ä‘á»“ng lÃ²ng cá»§a 50 trÃ¡i tim K8A1; sá»± táº­n tÃ¢m, dáº«n dáº¯t cá»§a cÃ¡c Tháº§y CÃ´ giÃ¡o kÃ­nh yÃªu; vÃ  sá»± cá»‘ng hiáº¿n khÃ´ng má»‡t má»i cá»§a Ban Tá»• Chá»©c suá»‘t nhiá»u thÃ¡ng chuáº©n bá»‹.

Hai mÆ°Æ¡i nÄƒm Ä‘Ã£ qua chá»‰ lÃ  má»™t cháº·ng nghá»‰ chÃ¢n Ä‘á»ƒ chÃºng ta cÃ¹ng nhÃ¬n láº¡i, tiáº¿p thÃªm cho nhau sá»©c máº¡nh vÃ  niá»m tin trÃªn con Ä‘Æ°á»ng phÃ­a trÆ°á»›c. K8A1 sáº½ tiáº¿p tá»¥c bÆ°á»›c tá»›i nhá»¯ng cá»™t má»‘c 25 nÄƒm, 30 nÄƒm vá»›i lá»i há»©a sáº¯t son: "Má»™t ngÃ y lÃ  K8A1 â€” Má»™t Ä‘á»i lÃ  tri ká»·!".

Äá»“ng thá»i, vá»›i lÃ²ng tá»± hÃ o vÃ  tri Ã¢n mÃ¡i trÆ°á»ng THPT ThÃ¡i NguyÃªn, Ban Tá»• Chá»©c K8A1 sáºµn lÃ²ng chia sáº» trá»n bá»™ ká»‹ch báº£n, kinh nghiá»‡m tá»• chá»©c cÅ©ng nhÆ° chuyá»ƒn giao giáº£i phÃ¡p WebApp sá»‘ hÃ³a cho cÃ¡c lá»›p báº¡n cÃ¹ng khÃ³a K8 vÃ  cÃ¡c tháº¿ há»‡ khÃ³a sau, chung tay lÃ m ráº¡ng danh truyá»n thá»‘ng nhÃ  trÆ°á»ng!

K8A1 â€” 20 NÄ‚M Má»˜T CHáº¶NG ÄÆ¯á»œNG, Má»˜T Äá»œI TÃŒNH Báº N!
TrÃ¢n trá»ng,
BAN Tá»” CHá»¨C Äáº I Lá»„ 20 NÄ‚M K8A1
NiÃªn khÃ³a 2003 â€” 2006 | THPT ThÃ¡i NguyÃªn`,
    actionUrl: "#lich-trinh",
    actionLabel: "ðŸ† KhÃ¡m PhÃ¡ Dáº¥u áº¤n Ká»· Niá»‡m 20 NÄƒm",
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
    author: "Ban Tá»• Chá»©c Äáº¡i Lá»… 20 NÄƒm K8A1",
    status: "published",
    likesCount: 168,
    metrics: [
      { label: "Tháº» Há»c Sinh Sá»‘ HÃ³a", value: "100%", desc: "CÃ¡ nhÃ¢n hÃ³a cho toÃ n bá»™ thÃ nh viÃªn K8A1" },
      { label: "Tá»‘c Äá»™ Check-in QR", value: "0.8s", desc: "Tá»± Ä‘á»™ng nháº­n diá»‡n & chá»‰ Ä‘á»‹nh bÃ n tiá»‡c" },
      { label: "TÆ° Liá»‡u HD LÆ°u Trá»¯", value: "500+", desc: "Báº£o máº­t 5 táº§ng & Watermark báº£n quyá»n" },
      { label: "Minh Báº¡ch TÃ i ChÃ­nh", value: "100%", desc: "Quyáº¿t toÃ¡n rÃµ rÃ ng tá»«ng khoáº£n má»¥c" }
    ]
  },
  {
    id: "TB-01",
    title: "ðŸ‘— ThÃ´ng BÃ¡o Tá»« BTC: Timeline â€“ Concept Chá»¥p áº¢nh â€“ Trang Phá»¥c 20 NÄƒm",
    category: "urgent",
    summary: "Chi tiáº¿t 3 concept trang phá»¥c chuáº©n bá»‹ cho ngÃ y 27/09: Concept 1 Ão Ä‘á»“ng phá»¥c K8A1, Concept 2 Thanh xuÃ¢n trá»Ÿ láº¡i (Ão dÃ i/VÃ¡y tráº¯ng & SÆ¡ mi tráº¯ng), Concept 3 Há»™i ngá»™ sau 20 nÄƒm.",
    content: "THÃ”NG BÃO Tá»ª BAN Tá»” CHá»¨C K8A1\nTIMELINE â€“ CONCEPT â€“ TRANG PHá»¤C\n(07:30 â€“ 12:30 | Chá»§ Nháº­t, ngÃ y 27/09/2026)\n\nBan Tá»• Chá»©c xin gá»­i tá»›i toÃ n thá»ƒ cÃ¡c thÃ nh viÃªn lá»›p K8A1 káº¿ hoáº¡ch chi tiáº¿t vá» thá»i gian, concept chá»¥p áº£nh vÃ  quy Ä‘á»‹nh trang phá»¥c trong ngÃ y Äáº¡i lá»… 20 NÄƒm NgÃ y Trá»Ÿ Vá»:\n\nâ° 07h30: CÃ“ Máº¶T Táº I TRÆ¯á»œNG THPT THÃI NGUYÃŠN\nâ€¢ Ban Tá»• Chá»©c cÃ³ máº·t, Ä‘Ã³n cÃ´ giÃ¡o chá»§ nhiá»‡m, chuáº©n bá»‹ hoa & quÃ .\nâ€¢ CÃ¡c thÃ nh viÃªn cÃ³ máº·t trÆ°á»›c 07h45 Ä‘á»ƒ á»•n Ä‘á»‹nh vÃ  chuáº©n bá»‹ trang phá»¥c chá»¥p áº£nh.\n\nðŸ“¸ 08h00: CONCEPT 1 â€” \"K8A1 Má»˜T THá»œI Äá»‚ NHá»š\"\nâ€¢ Trang phá»¥c: Ão Ä‘á»“ng phá»¥c K8A1 ká»· niá»‡m 20 nÄƒm.\nâ€¢ Hoáº¡t Ä‘á»™ng: Chá»¥p áº£nh lÆ°u niá»‡m toÃ n bá»™ táº­p thá»ƒ lá»›p, ban cÃ¡n sá»±, chá»¥p áº£nh cÃ¹ng cÃ´ giÃ¡o chá»§ nhiá»‡m táº¡i sÃ¢n trÆ°á»ng & lá»›p há»c xÆ°a.\n\nâœ¨ 08h30: CONCEPT 2 â€” \"THANH XUÃ‚N TRá»ž Láº I\"\nâ€¢ Trang phá»¥c:\n  - Ná»¯: Ão dÃ i tráº¯ng hoáº·c VÃ¡y tráº¯ng tinh khÃ´i.\n  - Nam: Ão sÆ¡ mi tráº¯ng + Quáº§n dÃ i lá»‹ch sá»±.\nâ€¢ Hoáº¡t Ä‘á»™ng: TÃ¡i hiá»‡n nhá»¯ng khoáº£nh kháº¯c há»c trÃ² ngÃ¢y ngÃ´, trong tráº»o dÆ°á»›i mÃ¡i trÆ°á»ng vÃ  hÃ ng cÃ¢y rá»£p bÃ³ng ká»· niá»‡m.\n\nðŸš— 09h00: DI CHUYá»‚N Vá»€ XHOTEL\nâ€¢ Táº­p thá»ƒ lá»›p chá»§ Ä‘á»™ng phÆ°Æ¡ng tiá»‡n, di chuyá»ƒn an toÃ n vÃ  Ä‘Ãºng giá» vá» nhÃ  hÃ ng / khÃ¡ch sáº¡n XHotel (X - Restaurant).\n\nðŸŒ¹ 09h15: CHECK-IN & ÄÃ“N TIáº¾P THáº¦Y CÃ” Táº I XHOTEL\nâ€¢ Trang phá»¥c: Giá»¯ nguyÃªn Ão Ä‘á»“ng phá»¥c K8A1.\nâ€¢ Hoáº¡t Ä‘á»™ng: ÄÃ³n tiáº¿p cÃ¡c Tháº§y CÃ´ giÃ¡o, chá»¥p áº£nh tháº£m Ä‘á», backdrop check-in ká»· niá»‡m 20 nÄƒm, giao lÆ°u vÃ  á»•n Ä‘á»‹nh bÃ n tiá»‡c.\n\nðŸ¥‚ 11h00: CONCEPT 3 â€” \"Há»˜I NGá»˜ SAU 20 NÄ‚M\"\nâ€¢ Trang phá»¥c: Tá»± do, lá»‹ch sá»±, thanh lá»‹ch (tiá»‡c má»«ng).\nâ€¢ Hoáº¡t Ä‘á»™ng: Khai tiá»‡c má»«ng 20 nÄƒm ngÃ y trá»Ÿ vá», thÆ°á»Ÿng thá»©c áº©m thá»±c, giao lÆ°u vÄƒn nghá»‡, trÃ² chÆ¡i bá»‘c thÄƒm ká»· váº­t vÃ  nÃ¢ng ly chÃºc má»«ng cháº·ng Ä‘Æ°á»ng 20 nÄƒm.\n\nðŸ“Œ LÆ¯U Ã QUAN TRá»ŒNG Tá»ª BAN Tá»” CHá»¨C:\n1. ÄÃºng giá» lÃ  Æ°u tiÃªn sá»‘ 1: Äá» nghá»‹ cÃ¡c báº¡n cÃ³ máº·t Ä‘Ãºng khung giá» 07h30 â€“ 08h00 táº¡i trÆ°á»ng Ä‘á»ƒ Ä‘áº£m báº£o Ä‘áº§y Ä‘á»§ hÃ¬nh áº£nh trong toÃ n bá»™ cÃ¡c concept.\n2. Chuáº©n bá»‹ trang phá»¥c: Mang sáºµn trang phá»¥c Concept 2 (Ã¡o dÃ i / vÃ¡y tráº¯ng cho ná»¯; sÆ¡ mi tráº¯ng cho nam) vÃ  Concept 3 Ä‘á»ƒ thay táº¡i trÆ°á»ng vÃ  khÃ¡ch sáº¡n.\n3. Ão Ä‘á»“ng phá»¥c K8A1: Giá»¯ Ã¡o pháº³ng, Ä‘áº¹p Ä‘á»ƒ lÃªn hÃ¬nh táº­p thá»ƒ Ä‘á»“ng Ä‘á»u vÃ  ráº¡ng rá»¡ nháº¥t.",
    imageUrl: "/sample-polo-k8a1.jpg",
    actionUrl: "#lich-trinh",
    actionLabel: "ðŸ‘— Xem Chi Tiáº¿t Concept & Trang Phá»¥c",
    isPinned: true,
    createdAt: "28/09/2026 08:00",
    author: "BTC K8A1 â€” TrÆ°á»Ÿng Ban Tráº§n Thá»‹ Thanh Nháº¡n",
    status: "published",
    likesCount: 68
  },
  {
    id: "TB-02",
    title: "ðŸ“‹ Ká»‹ch Báº£n & Timeline ChÆ°Æ¡ng TrÃ¬nh Chi Tiáº¿t (07:30 â€“ 12:30)",
    category: "schedule",
    summary: "Lá»‹ch trÃ¬nh chi tiáº¿t tá»«ng khung giá»: 07:30 Ä‘Ã³n táº¡i trÆ°á»ng THPT ThÃ¡i NguyÃªn, 08:00 chá»¥p áº£nh ká»· niá»‡m, 09:00 di chuyá»ƒn sang X - Restaurant, 10:00 khai máº¡c & tri Ã¢n Tháº§y CÃ´, 10:30 khai tiá»‡c.",
    content: "TIMELINE CHÆ¯Æ NG TRÃŒNH CHI TIáº¾T\nKhÃ³a 8 (2003 â€“ 2006) â€” TrÆ°á»ng THPT ThÃ¡i NguyÃªn\nChá»§ Nháº­t, ngÃ y 27/09/2026\n\nBan Tá»• Chá»©c trÃ¢n trá»ng gá»­i tá»›i cÃ¡c báº¡n lá»‹ch trÃ¬nh hoáº¡t Ä‘á»™ng chi tiáº¿t tá»« 07:30 Ä‘áº¿n 12:30:\n\nâ° 07:30 â€“ 08:00 | ÄÃ“N TIáº¾P Táº I TRÆ¯á»œNG CÅ¨\nâ€¢ Ná»™i dung: ÄÃ³n tiáº¿p thÃ nh viÃªn táº¡i cá»•ng trÆ°á»ng THPT ThÃ¡i NguyÃªn, Ä‘iá»ƒm danh, phÃ¡t hashtag cáº§m tay vÃ  hoa cÃ i Ã¡o.\nâ€¢ Phá»¥ trÃ¡ch: BLL - Media.\n\nðŸ“¸ 08:00 â€“ 09:00 | CHá»¤P áº¢NH Ká»¶ NIá»†M SÃ‚N TRÆ¯á»œNG & Lá»šP Há»ŒC\nâ€¢ Ná»™i dung: Chá»¥p áº£nh lÆ°u niá»‡m táº¡i sÃ¢n trÆ°á»ng, dÃ¢ng hoa tri Ã¢n cÃ´ giÃ¡o chá»§ nhiá»‡m, chá»¥p áº£nh Concept 1 (Äá»“ng phá»¥c) & Concept 2 (Thanh xuÃ¢n trá»Ÿ láº¡i), thÄƒm láº¡i lá»›p há»c cÅ©.\nâ€¢ Phá»¥ trÃ¡ch: BLL - Media.\n\nðŸš— 09:00 â€“ 09:15 | DI CHUYá»‚N SANG NHÃ€ HÃ€NG\nâ€¢ Ná»™i dung: Táº­p thá»ƒ lá»›p di chuyá»ƒn tá»« TrÆ°á»ng THPT ThÃ¡i NguyÃªn sang nhÃ  hÃ ng X - Restaurant (XHotel).\nâ€¢ Phá»¥ trÃ¡ch: BTC Äiá»u phá»‘i.\n\nðŸ¥‚ 09:15 â€“ 10:00 | CHECK-IN THáº¢M Äá»Ž & ÄÃ“N TIáº¾P THáº¦Y CÃ”\nâ€¢ Ná»™i dung: Check-in tháº£m Ä‘á», Ä‘Ã³n tiáº¿p cÃ¡c Tháº§y CÃ´ giÃ¡o, á»•n Ä‘á»‹nh bÃ n tiá»‡c, trÃ¬nh chiáº¿u slideshow phÃ³ng sá»± ká»· niá»‡m 20 nÄƒm vÃ  vÄƒn nghá»‡ chÃ o má»«ng.\nâ€¢ Phá»¥ trÃ¡ch: BLL + Media.\n\nðŸŽ¤ 10:00 â€“ 10:15 | KHAI Máº C Äáº I Lá»„ 20 NÄ‚M\nâ€¢ Ná»™i dung: Khai máº¡c chÆ°Æ¡ng trÃ¬nh: TuyÃªn bá»‘ lÃ½ do, giá»›i thiá»‡u Ä‘áº¡i biá»ƒu vÃ  cÃ¡c Tháº§y CÃ´ tham dá»±.\nâ€¢ Phá»¥ trÃ¡ch: MC - Media.\n\nðŸ’ 10:15 â€“ 10:30 | TRI Ã‚N THáº¦Y CÃ” GIÃO\nâ€¢ Ná»™i dung: Äáº¡i diá»‡n táº­p thá»ƒ K8A1 phÃ¡t biá»ƒu tri Ã¢n, táº·ng hoa vÃ  quÃ  ká»· niá»‡m tá»›i Tháº§y CÃ´; Láº¯ng nghe nhá»¯ng lá»i chia sáº», cÄƒn dáº·n thÃ¢n thÆ°Æ¡ng tá»« Tháº§y CÃ´.\nâ€¢ Phá»¥ trÃ¡ch: Äáº¡i diá»‡n K8A1 - Tháº§y CÃ´.\n\nðŸ¾ 10:30 | NÃ‚NG LY KHAI TIá»†C Há»˜I NGá»˜\nâ€¢ Ná»™i dung: ToÃ n thá»ƒ Tháº§y CÃ´ vÃ  cÃ¡c báº¡n cá»±u há»c sinh K8A1 cÃ¹ng nÃ¢ng ly khai tiá»‡c má»«ng 20 nÄƒm ngÃ y trá»Ÿ vá».\nâ€¢ Phá»¥ trÃ¡ch: MC - Media.\n\nðŸŽ¶ 10:30 â€“ 11:30 | TIá»†C TRÆ¯A & GIAO LÆ¯U Gáº®N Káº¾T\nâ€¢ Ná»™i dung: DÃ¹ng tiá»‡c trÆ°a thÃ¢n máº­t káº¿t há»£p giao lÆ°u vÄƒn nghá»‡ ngáº«u há»©ng, trÃ² chÆ¡i ká»· niá»‡m vÃ  chia sáº» tÃ¢m sá»± chuyá»‡n Ä‘á»i, chuyá»‡n nghá».\nâ€¢ Phá»¥ trÃ¡ch: MC - Media.\n\nðŸŽ 11:30 â€“ 12:00 | Lá»œI NHáº®N 10 NÄ‚M SAU & TRAO QUÃ€\nâ€¢ Ná»™i dung: Hoáº¡t Ä‘á»™ng Ã½ nghÄ©a \"Gá»­i lá»i nháº¯n Ä‘áº¿n 10 nÄƒm sau\", trao quÃ  lÆ°u niá»‡m ká»· niá»‡m 20 nÄƒm cho cÃ¡c thÃ nh viÃªn.\nâ€¢ Phá»¥ trÃ¡ch: BTC - Media.\n\nðŸ“¸ 12:00 â€“ 12:30 | áº¢NH Táº¬P THá»‚ Báº¾ Máº C & Cáº¢M Æ N\nâ€¢ Ná»™i dung: Chá»¥p áº£nh ká»· niá»‡m táº­p thá»ƒ báº¿ máº¡c, gá»­i lá»i cáº£m Æ¡n vÃ  káº¿t thÃºc chÆ°Æ¡ng trÃ¬nh trong niá»m hÃ¢n hoan trá»n váº¹n.\nâ€¢ Phá»¥ trÃ¡ch: MC + Media.\n\nTrÆ°á»Ÿng ban: Tráº§n Thá»‹ Thanh Nháº¡n",
    actionUrl: "#lich-trinh",
    actionLabel: "ðŸ“… Theo DÃµi Khung Giá» Hoáº¡t Äá»™ng",
    isPinned: true,
    createdAt: "28/09/2026 08:30",
    author: "BTC K8A1 â€” TrÆ°á»Ÿng Ban Tráº§n Thá»‹ Thanh Nháº¡n",
    status: "published",
    likesCount: 75
  },
  {
    id: "TB-03",
    title: "ðŸ’Œ Lá»i Tri Ã‚n â€” K8A1 20 NÄƒm: Má»™t Cháº·ng ÄÆ°á»ng, Má»™t Äá»i TÃ¬nh Báº¡n",
    category: "activity",
    summary: "Bá»©c tÃ¢m thÆ° tri Ã¢n sÃ¢u sáº¯c gá»­i Ban GiÃ¡m hiá»‡u, cÃ¡c cÃ´ giÃ¡o chá»§ nhiá»‡m, tháº§y cÃ´ bá»™ mÃ´n vÃ  lá»i cáº£m Æ¡n 50 trÃ¡i tim K8A1 cÃ¹ng há»™i tá»¥ sau 20 nÄƒm.",
    content: "Lá»œI TRI Ã‚N\nK8A1 20 NÄ‚M: Má»˜T CHáº¶NG ÄÆ¯á»œNG, Má»˜T Äá»œI TÃŒNH Báº N\n\"Hai mÆ°Æ¡i nÄƒm â€“ má»™t cháº·ng Ä‘Æ°á»ng, má»™t láº§n trá»Ÿ vá», ngÃ n láº§n thÆ°Æ¡ng nhá»›...\"\n\nKÃ­nh gá»­i Ban GiÃ¡m hiá»‡u TrÆ°á»ng THPT ThÃ¡i NguyÃªn, cÃ¡c cÃ´ giÃ¡o chá»§ nhiá»‡m cÃ¹ng toÃ n thá»ƒ cÃ¡c tháº§y cÃ´ giÃ¡o bá»™ mÃ´n Ä‘Ã£ tá»«ng giáº£ng dáº¡y táº­p thá»ƒ lá»›p K8A1 niÃªn khÃ³a 2003 â€“ 2006.\n\nHai mÆ°Æ¡i nÄƒm trÆ°á»›c, chÃºng em rá»i xa mÃ¡i trÆ°á»ng thÃ¢n yÃªu mang theo hÃ nh trang lÃ  tri thá»©c, lÃ  nhá»¯ng bÃ i há»c lÃ m ngÆ°á»i sÃ¢u sáº¯c vÃ  cáº£ niá»m tin yÃªu mÃ  tháº§y cÃ´ Ä‘Ã£ cáº§n máº«n trao gá»­i. Hai mÆ°Æ¡i nÄƒm trÃ´i qua, dÃ¹ á»Ÿ báº¥t ká»³ phÆ°Æ¡ng trá»i nÃ o, trÃªn má»—i bÆ°á»›c Ä‘Æ°á»ng trÆ°á»Ÿng thÃ nh cá»§a má»—i chÃºng em Ä‘á»u cÃ³ bÃ³ng hÃ¬nh cá»§a mÃ¡i trÆ°á»ng xÆ°a, cÃ³ sá»± chá»Ÿ che, dÃ¬u dáº¯t tá»« nhá»¯ng thÃ¡ng nÄƒm hoa niÃªn tÆ°Æ¡i Ä‘áº¹p.\n\nHÃ´m nay, trong niá»m xÃºc Ä‘á»™ng ngháº¹n ngÃ o cá»§a ngÃ y trá»Ÿ vá», táº­p thá»ƒ K8A1 xin Ä‘Æ°á»£c cÃºi Ä‘áº§u kÃ­nh cáº©n dÃ¢ng lÃªn tháº§y cÃ´ lá»i tri Ã¢n sÃ¢u sáº¯c vÃ  lÃ²ng biáº¿t Æ¡n vÃ´ háº¡n. Cáº£m Æ¡n tháº§y cÃ´ vÃ¬ Ä‘Ã£ dÃ nh trá»n tÃ¢m huyáº¿t, tÃ¬nh thÆ°Æ¡ng Ä‘á»ƒ tháº¯p sÃ¡ng Æ°á»›c mÆ¡ cho chÃºng em.\n\nÄá»“ng thá»i, xin gá»­i lá»i cáº£m Æ¡n chÃ¢n thÃ nh tá»›i 50 trÃ¡i tim K8A1 Ä‘Ã£ cÃ¹ng nhau tá» tá»±u, gáº¯n káº¿t vÃ  tiáº¿p ná»‘i máº¡ch nguá»“n tÃ¬nh báº¡n thiÃªng liÃªng sau 20 nÄƒm xa cÃ¡ch. DÃ¹ thá»i gian cÃ³ Ä‘á»•i thay, mÃ¡i tÃ³c cÃ³ ngáº£ mÃ u, tÃ¬nh báº¡n cá»§a chÃºng ta váº«n mÃ£i váº¹n nguyÃªn nhÆ° nhá»¯ng ngÃ y Ä‘áº§u dÆ°á»›i mÃ¡i trÆ°á»ng THPT ThÃ¡i NguyÃªn.\n\nKÃ­nh chÃºc cÃ¡c tháº§y cÃ´ luÃ´n dá»“i dÃ o sá»©c khá»e, háº¡nh phÃºc vÃ  an yÃªn!\nChÃºc cho tÃ¬nh báº¡n K8A1 mÃ£i mÃ£i xanh tÆ°Æ¡i, bá»n cháº·t theo nÄƒm thÃ¡ng!\n\n\"Thanh xuÃ¢n cÃ³ báº¡n lÃ  táº¥t cáº£ lÃ  nhá»¯ng Ä‘iá»u tuyá»‡t vá»i nháº¥t! â™¡\"\n\nTrÆ°á»Ÿng ban liÃªn láº¡c: Tráº§n Thá»‹ Thanh Nháº¡n",
    actionUrl: "#thu-ngo",
    actionLabel: "ðŸŒ¹ Äá»c Bá»©c ThÆ° Tri Ã‚n",
    isPinned: true,
    createdAt: "28/09/2026 09:00",
    author: "TrÆ°á»Ÿng Ban LiÃªn Láº¡c: Tráº§n Thá»‹ Thanh Nháº¡n",
    status: "published",
    likesCount: 89
  },
  {
    id: "TB-04",
    title: "ðŸ‘• Ão Polo K8A1 Äá»“ng Phá»¥c Ká»· Niá»‡m 20 NÄƒm NgÃ y Trá»Ÿ Vá»",
    category: "activity",
    summary: "Äá»“ng phá»¥c ká»· niá»‡m 20 nÄƒm Ä‘Æ°á»£c thiáº¿t káº¿ Ä‘á»™c quyá»n: váº£i thun cÃ¡ sáº¥u 4 chiá»u cao cáº¥p, cá»• Ã¡o dá»‡t viá»n há»• phÃ¡ch, thÃªu logo máº¡ vÃ ng.",
    content: "KÃ­nh gá»­i toÃ n thá»ƒ cÃ¡c thÃ nh viÃªn táº­p thá»ƒ K8A1 â€” NiÃªn khÃ³a 2003 - 2006,\n\nÄá»ƒ chuáº©n bá»‹ chu Ä‘Ã¡o nháº¥t cho ngÃ y Há»™i khÃ³a 20 NÄƒm NgÃ y Trá»Ÿ Vá» (Chá»§ Nháº­t, 27/09/2026), Ban LiÃªn Láº¡c Ä‘Ã£ hoÃ n táº¥t sáº£n xuáº¥t Ã¡o Polo Ä‘á»“ng phá»¥c cao cáº¥p cho toÃ n bá»™ lá»›p.\n\nÃo Polo K8A1 ká»· niá»‡m 20 nÄƒm Ä‘Æ°á»£c may báº±ng cháº¥t liá»‡u thun cÃ¡ sáº¥u 4 chiá»u co giÃ£n cao cáº¥p, cá»• Ã¡o bo viá»n mÃ u há»• phÃ¡ch sang trá»ng, thÃªu ná»•i logo trÆ°á»ng THPT ThÃ¡i NguyÃªn vÃ  sá»‘ hiá»‡u 20 NÄƒm máº¡ vÃ ng tinh táº¿ bÃªn ngá»±c trÃ¡i.\n\nâš ï¸ LÆ¯U Ã KHI Máº¶C ÃO Äá»’NG PHá»¤C:\nâ€¢ ToÃ n bá»™ lá»›p máº·c Ã¡o Ä‘á»“ng phá»¥c K8A1 trong Concept 1 (08h00 táº¡i sÃ¢n trÆ°á»ng) vÃ  khi ÄÃ³n tiáº¿p Tháº§y CÃ´ táº¡i XHotel (09h15).\nâ€¢ Giá»¯ Ã¡o pháº³ng, Ä‘áº¹p Ä‘á»ƒ lÃªn hÃ¬nh táº­p thá»ƒ Ä‘á»“ng Ä‘á»u vÃ  ráº¡ng rá»¡ nháº¥t.\nâ€¢ CÃ¡c báº¡n cÃ³ thá»ƒ Ä‘Äƒng kÃ½ bá»• sung Ã¡o cho ngÆ°á»i thÃ¢n hoáº·c F1 báº±ng cÃ¡ch liÃªn há»‡ trá»±c tiáº¿p vá»›i Ban LiÃªn Láº¡c.",
    imageUrl: "/sample-polo-k8a1.jpg",
    actionUrl: "#diem-danh",
    actionLabel: "ðŸ‘• Xem Danh SÃ¡ch Ão Cá»§a Báº¡n",
    isPinned: false,
    createdAt: "18/09/2026 08:30",
    author: "Ban LiÃªn Láº¡c K8A1",
    status: "published",
    likesCount: 52
  },
  {
    id: "TB-05",
    title: "ðŸ—³ï¸ Kháº£o SÃ¡t Ã Kiáº¿n: Báº¡n mong chá» hoáº¡t Ä‘á»™ng hoÃ i niá»‡m nÃ o nháº¥t táº¡i Gala 20 NÄƒm?",
    category: "poll",
    summary: "BÃ¬nh chá»n trá»±c tiáº¿p ngay trÃªn WebApp Ä‘á»ƒ Ban Tá»• Chá»©c chuáº©n bá»‹ ká»‹ch báº£n giao lÆ°u Ã½ nghÄ©a nháº¥t cho ngÃ y há»™i ngá»™ 27/09/2026.",
    content: "ThÃ¢n gá»­i cÃ¡c báº¡n há»c K8A1 thÃ¢n máº¿n,\n\nÄá»ƒ chÆ°Æ¡ng trÃ¬nh Há»™i khÃ³a 20 NÄƒm NgÃ y Trá»Ÿ Vá» diá»…n ra tháº­t Ä‘áº§m áº¥m, giÃ u cáº£m xÃºc vÃ  gáº¯n káº¿t táº¥t cáº£ cÃ¡c thÃ nh viÃªn, Ban LiÃªn Láº¡c phÃ¡t Ä‘á»™ng cuá»™c bÃ¬nh chá»n trá»±c tiáº¿p 100% ngay trÃªn WebApp lá»›p mÃ¬nh (khÃ´ng cáº§n dÃ¹ng link Google Form bÃªn ngoÃ i).\n\nCÃ¡c báº¡n hÃ£y bÃ¬nh chá»n cÃ¡c hoáº¡t Ä‘á»™ng hoÃ i niá»‡m vÃ  giao lÆ°u mÃ  báº¡n mong muá»‘n Ä‘Æ°á»£c tráº£i nghiá»‡m nháº¥t trong buá»•i tiá»‡c táº¡i XHotel / X - Restaurant (há»— trá»£ chá»n nhiá»u phÆ°Æ¡ng Ã¡n cÃ¹ng lÃºc).\n\nKáº¿t quáº£ bÃ¬nh chá»n theo thá»i gian thá»±c sáº½ lÃ  cÄƒn cá»© Ä‘á»ƒ Ban Tá»• Chá»©c chá»‘t ká»‹ch báº£n sÃ¢n kháº¥u, chuáº©n bá»‹ quÃ  táº·ng vÃ  Ä‘áº¡o cá»¥ hoÃ i niá»‡m tÆ°Æ¡ng á»©ng!",
    actionUrl: "#ban-tin",
    actionLabel: "ðŸ—³ï¸ BÃ¬nh Chá»n Ngay",
    isPinned: false,
    createdAt: "14/09/2026 15:30",
    author: "Ban LiÃªn Láº¡c K8A1",
    status: "published",
    likesCount: 58,
    poll: {
      question: "Báº¡n hÃ o há»©ng nháº¥t vá»›i hoáº¡t Ä‘á»™ng giao lÆ°u nÃ o táº¡i buá»•i tiá»‡c há»™i ngá»™ K8A1?",
      allowMultiple: true,
      isClosed: false,
      options: [
        {
          id: "opt-1",
          text: "ðŸŽ¬ Chiáº¿u phÃ³ng sá»± áº£nh Ä‘á»™c quyá»n 'K8A1 â€” 20 NÄƒm NgÃ y áº¤y & BÃ¢y Giá»' trÃªn mÃ n LED lá»›n",
          votes: ["ÄÃ o Thá»‹ Há»“ng Nhung", "Tráº§n ÄÄƒng Tuáº¥n", "VÅ© PhÆ°Æ¡ng Tháº£o"]
        },
        {
          id: "opt-2",
          text: "ðŸŽ¸ HÃ¡t live ca khÃºc tuá»•i há»c trÃ² (Xe Ä‘áº¡p, PhÆ°á»£ng há»“ng, Ká»· niá»‡m mÃ¡i trÆ°á»ng...) & Ban nháº¡c acoustic",
          votes: ["Nguyá»…n HoÃ ng Long", "Tráº§n ÄÄƒng Tuáº¥n", "Äá»— Mai HÆ°Æ¡ng", "Pháº¡m Quá»‘c HÃ¹ng"]
        },
        {
          id: "opt-3",
          text: "ðŸ† Minigame Ã´n láº¡i ká»· niá»‡m 'Ai thÃ´ng minh hÆ¡n há»c sinh K8A1' & Bá»‘c thÄƒm ká»· váº­t máº¡ vÃ ng",
          votes: ["VÅ© PhÆ°Æ¡ng Tháº£o", "Nguyá»…n Thá»‹ Thu HÃ ", "BÃ¹i Tiáº¿n DÅ©ng"]
        },
        {
          id: "opt-4",
          text: "ðŸ¥‚ Thá»i kháº¯c NÃ¢ng Ly Tri Ã‚n Tháº§y CÃ´ giÃ¡o & Trao gá»­i tÃ¢m thÆ° 20 nÄƒm xÃºc Ä‘á»™ng",
          votes: ["ÄÃ o Thá»‹ Há»“ng Nhung", "Nguyá»…n HoÃ ng Long", "Tráº§n ÄÄƒng Tuáº¥n", "VÅ© PhÆ°Æ¡ng Tháº£o", "LÃª VÄƒn HoÃ ng"]
        },
        {
          id: "opt-5",
          text: "ðŸ“¸ Check-in Photobooth ká»· yáº¿u 2003-2006 phong cÃ¡ch Retro & Quay clip ká»· niá»‡m TikTok/Reels",
          votes: ["Äá»— Mai HÆ°Æ¡ng", "Nguyá»…n Thá»‹ Thu HÃ "]
        }
      ]
    }
  }
];

// Logo chÃ­nh thá»©c TrÆ°á»ng THPT ThÃ¡i NguyÃªn (thuá»™c ÄH SÆ° Pháº¡m - ÄH ThÃ¡i NguyÃªn)
export const SCHOOL_LOGO_URL = "https://thpttn.tnue.edu.vn/upload/doantn/logo%20thpttn.jpg";

// URL Google Apps Script WebApp máº·c Ä‘á»‹nh toÃ n há»‡ thá»‘ng
// BLL cÃ³ thá»ƒ dÃ¡n URL triá»ƒn khai (/exec) vÃ o Ä‘Ã¢y Ä‘á»ƒ má»i thiáº¿t bá»‹/áº©n danh tá»± Ä‘á»™ng Ä‘á»“ng bá»™ cÃ¹ng 1 Sheet
export const DEFAULT_APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycby_hm9akENv_GmNpF8s9ALVReDd_8ORPS_RqpUZ9FS6GB_Qdnmjhh5XZ5iKZhnE_9S0/exec";

export const K8A1_DRIVE_FOLDER_ID = "1Skmip1HQhmXan-58kwbY_msamP-bWokq";
export const K8A1_DRIVE_FOLDER_URL = "https://drive.google.com/drive/folders/1Skmip1HQhmXan-58kwbY_msamP-bWokq";

export const TEACHERS_LIST: TeacherData[] = [];

export const INITIAL_TEACHER_TRIBUTES: TeacherTribute[] = [];

export const TEACHER_SUBJECT_OPTIONS = [
  "ToÃ¡n Há»c",
  "Ngá»¯ VÄƒn",
  "Tiáº¿ng Anh",
  "Váº­t LÃ½",
  "HÃ³a Há»c",
  "Sinh Há»c",
  "Lá»‹ch Sá»­",
  "Äá»‹a LÃ½",
  "Tin Há»c",
  "GDCD",
  "Thá»ƒ Dá»¥c",
  "GDQP-AN",
  "CÃ´ng Nghá»‡ / Ká»¹ Thuáº­t",
  "Ban GiÃ¡m Hiá»‡u"
];

export const TEACHER_ROLE_OPTIONS = [
  "GiÃ¡o viÃªn Bá»™ mÃ´n",
  "Chá»§ nhiá»‡m Lá»›p 12A1",
  "Chá»§ nhiá»‡m Lá»›p 11A1",
  "Chá»§ nhiá»‡m Lá»›p 10A1",
  "Hiá»‡u TrÆ°á»Ÿng",
  "PhÃ³ Hiá»‡u TrÆ°á»Ÿng",
  "BÃ­ ThÆ° ÄoÃ n TrÆ°á»ng",
  "Tá»•ng Phá»¥ TrÃ¡ch Äá»™i / ÄoÃ n"
];

export const TEACHER_TRANSPORTATION_OPTIONS = [
  "Tá»± tÃºc",
  "Lá»›p cá»­ xe Ä‘Ã³n táº¡i nhÃ ",
  "Tháº§y tá»± Ä‘i cÃ¹ng há»c trÃ²",
  "CÃ´ tá»± Ä‘i cÃ¹ng há»c trÃ²",
  "Äi cÃ¹ng Tháº§y/CÃ´ khÃ¡c",
  "Cáº§n xe Ä‘Ã³n tuyáº¿n HÃ  Ná»™i - ThÃ¡i NguyÃªn",
  "Cáº§n há»— trá»£ Ä‘Æ°a Ä‘Ã³n táº¡i ThÃ¡i NguyÃªn",
  "Cáº§n xe Ä‘Æ°a vá» sau dáº¡ tiá»‡c"
];

export const TEACHER_HEALTH_OPTIONS = [
  "BÃ¬nh thÆ°á»ng (KhÃ´ng yÃªu cáº§u Ä‘áº·c biá»‡t)",
  "Ngá»“i bÃ n danh dá»± táº§ng 1 (Ã­t báº­c thang)",
  "Cáº§n há»— trá»£ di chuyá»ƒn (chÃ¢n yáº¿u / Ä‘i láº¡i cháº­m)",
  "Ä‚n chay",
  "Ä‚n kiÃªng / Cháº¿ Ä‘á»™ Äƒn thanh Ä‘áº¡m",
  "KhÃ´ng uá»‘ng rÆ°á»£u bia / Ä‘á»“ uá»‘ng cÃ³ cá»“n"
];

export const GOOGLE_APPS_SCRIPT_CODE = `/**
 * MÃ£ nguá»“n Google Apps Script (Code.gs) Ä‘Æ°á»£c lÆ°u trá»¯ Ä‘á»™c láº­p táº¡i file Code.gs trong kho mÃ£ nguá»“n.
 * Äá»ƒ báº£o máº­t há»‡ thá»‘ng vÃ  ngÄƒn lá»™ thÃ´ng tin quáº£n trá»‹ trÃªn trÃ¬nh duyá»‡t (F12),
 * toÃ n bá»™ mÃ£ xá»­ lÃ½ mÃ¡y chá»§ Ä‘Ã£ Ä‘Æ°á»£c tÃ¡ch rá»i khá»i frontend bundle.
 *
 * Vui lÃ²ng xem vÃ  chá»‰nh sá»­a file Code.gs trá»±c tiáº¿p trÃªn GitHub repository.
 */`;

/**
 * ============================================================================
/**
 * ============================================================================
 * ðŸ” XÃC THá»°C MÃƒ PIN Báº¢O Máº¬T 100% QUA GOOGLE APPS SCRIPT
 * Tuyá»‡t Ä‘á»‘i khÃ´ng lÆ°u mÃ£ PIN hay chuá»—i bÄƒm dá»± phÃ²ng trÃªn trÃ¬nh duyá»‡t frontend.
 * Má»i yÃªu cáº§u Ä‘Äƒng nháº­p báº¯t buá»™c pháº£i Ä‘Æ°á»£c mÃ¡y chá»§ Google Sheets xÃ¡c thá»±c.
 * ============================================================================
 */

/**
 * XÃ¡c thá»±c mÃ£ PIN an toÃ n qua Google Apps Script / Google Sheets
 */
export async function verifyPinViaBackend(
  pin: string,
  appsScriptUrl?: string
): Promise<{ success: boolean; role?: UserRole; message?: string; isLocked?: boolean }> {
  const cleanPin = String(pin || '').trim();
  if (!cleanPin) {
    return { success: false, message: 'Vui lÃ²ng nháº­p mÃ£ PIN!' };
  }

  const targetUrl = appsScriptUrl && appsScriptUrl.trim() !== ''
    ? appsScriptUrl.trim()
    : DEFAULT_APPS_SCRIPT_URL;

  if (!targetUrl || targetUrl.includes('YOUR_NEW_DEPLOYMENT_ID')) {
    return { success: false, message: 'ChÆ°a cáº¥u hÃ¬nh URL Google Apps Script há»£p lá»‡!' };
  }

  // 1. Thá»­ xÃ¡c thá»±c trá»±c tuyáº¿n qua Google Apps Script / Google Sheets (POST)
  try {
    const controller = new AbortController();
    // TÄƒng timeout lÃªn 15 giÃ¢y Ä‘á»ƒ khÃ´ng bá»‹ abort khi server Ä‘ang Ä‘á»“ng bá»™ dá»¯ liá»‡u lÃºc táº£i Ä‘áº§u trang
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
      message: json.message || 'MÃ£ PIN khÃ´ng Ä‘Ãºng!',
      isLocked: json.code === 'LOCKED'
    };
  } catch (netErr: any) {
    // 2. Dá»± phÃ²ng qua GET náº¿u POST bá»‹ máº¡ng/CORS can thiá»‡p
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
        message: getJson.message || 'MÃ£ PIN khÃ´ng Ä‘Ãºng!',
        isLocked: getJson.code === 'LOCKED'
      };
    } catch (getErr) {
      return {
        success: false,
        message: 'KhÃ´ng thá»ƒ káº¿t ná»‘i tá»›i mÃ¡y chá»§ Google Sheets Ä‘á»ƒ xÃ¡c thá»±c mÃ£ PIN. Vui lÃ²ng kiá»ƒm tra láº¡i káº¿t ná»‘i máº¡ng!'
      };
    }
  }
}

/**
 * Cáº­p nháº­t vÃ  Ä‘á»“ng bá»™ mÃ£ PIN báº£o máº­t lÃªn Google Sheets
 */
export async function updatePinsViaBackend(
  payload: { currentAdminPin: string; newAdminPin?: string; newTreasurerPin?: string; newBllPin?: string; newMemberPin?: string },
  appsScriptUrl?: string
): Promise<{ success: boolean; message: string }> {
  const targetUrl = appsScriptUrl && appsScriptUrl.trim() !== ''
    ? appsScriptUrl.trim()
    : DEFAULT_APPS_SCRIPT_URL;

  if (!targetUrl || targetUrl.includes('YOUR_NEW_DEPLOYMENT_ID')) {
    return { success: false, message: 'ChÆ°a cáº¥u hÃ¬nh URL Google Apps Script há»£p lá»‡!' };
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
      return { success: true, message: json.message || 'ÄÃ£ Ä‘á»“ng bá»™ mÃ£ PIN má»›i lÃªn Google Sheets thÃ nh cÃ´ng!' };
    }
    return { success: false, message: json.message || 'KhÃ´ng thá»ƒ cáº­p nháº­t mÃ£ PIN trÃªn mÃ¡y chá»§!' };
  } catch (err: any) {
    return { success: false, message: 'Lá»—i káº¿t ná»‘i mÃ¡y chá»§ Google Apps Script: ' + (err?.message || err) };
  }
}

/**
 * Chá»§ Ä‘á»™ng gá»­i yÃªu cáº§u khá»Ÿi táº¡o hoáº·c kiá»ƒm tra Sheet Bao_Mat_PIN lÃªn Google Sheets
 */
export async function initSecuritySheetViaBackend(
  appsScriptUrl?: string
): Promise<{ success: boolean; message: string }> {
  const targetUrl = appsScriptUrl && appsScriptUrl.trim() !== ''
    ? appsScriptUrl.trim()
    : DEFAULT_APPS_SCRIPT_URL;

  if (!targetUrl || targetUrl.includes('YOUR_NEW_DEPLOYMENT_ID')) {
    return { success: false, message: 'ChÆ°a cáº¥u hÃ¬nh URL Google Apps Script há»£p lá»‡!' };
  }

  try {
    const res = await fetch(`${targetUrl}?action=init_security&t=${Date.now()}`);
    const json = await res.json();
    if (json.status === 'success') {
      return { success: true, message: json.message || 'ÄÃ£ khá»Ÿi táº¡o sheet Bao_Mat_PIN thÃ nh cÃ´ng!' };
    }
    return { success: false, message: json.message || 'KhÃ´ng thá»ƒ khá»Ÿi táº¡o sheet!' };
  } catch (err: any) {
    return { success: false, message: 'Lá»—i káº¿t ná»‘i mÃ¡y chá»§: ' + (err?.message || err) };
  }
}

/**
 * Chuáº©n hÃ³a chuá»—i bá» dáº¥u tiáº¿ng Viá»‡t Ä‘á»ƒ tÃ¬m kiáº¿m thÃ´ng minh
 */
export function removeVietnameseAccents(str: string): string {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/Ä‘/g, 'd')
    .replace(/Ä/g, 'D')
    .toLowerCase();
}

/**
 * TÃ¡ch tÃªn gá»i cuá»‘i cÃ¹ng cá»§a ngÆ°á»i Viá»‡t Ä‘á»ƒ sáº¯p xáº¿p A-Z (VD: Nguyá»…n Tuáº¥n Anh -> Anh)
 */
export function getVietnameseGivenName(fullName: string): string {
  if (!fullName) return '';
  const parts = fullName.trim().split(/\s+/);
  return parts[parts.length - 1] || fullName;
}

/**
 * TrÃ­ch xuáº¥t chá»¯ cÃ¡i viáº¿t táº¯t (monogram initials) cá»§a Tháº§y CÃ´ Ä‘á»ƒ hiá»ƒn thá»‹ avatar trang trá»ng khi chÆ°a cÃ³ áº£nh
 * VD: "CÃ´ Tráº§n Thá»‹ Lan" -> "TL", "Tháº§y Nguyá»…n VÄƒn HÃ¹ng" -> "NH", "VÅ© ÄÃ¬nh Thu" -> "VT"
 */
export function getTeacherInitials(name?: string): string {
  if (!name || !name.trim()) return 'TC';
  const clean = name.replace(/^(Tháº§y|CÃ´|GS|PGS|TS|ThS)\.?\s+/i, '').trim();
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'TC';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  const first = parts[0][0];
  const last = parts[parts.length - 1][0];
  return (first + last).toUpperCase();
}

/**
 * Láº¥y danh sÃ¡ch áº£nh Backdrop mÃ n LED tá»« thÆ° má»¥c "Backdrops_SanKhau" trÃªn Google Drive
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
    console.warn('Lá»—i láº¥y backdrop tá»« Drive, sá»­ dá»¥ng máº·c Ä‘á»‹nh:', e);
  }
  return DEFAULT_BACKDROPS;
}

/**
 * Táº£i áº£nh backdrop má»›i lÃªn thÆ° má»¥c Drive "Backdrops_SanKhau" qua Google Apps Script
 */
export async function uploadBackdropViaBackend(
  payload: { fileData: string; title: string; pin?: string },
  appsScriptUrl?: string
): Promise<{ success: boolean; data?: BackdropItem; message?: string }> {
  const targetUrl = appsScriptUrl && appsScriptUrl.trim() !== ''
    ? appsScriptUrl.trim()
    : DEFAULT_APPS_SCRIPT_URL;

  if (!targetUrl || targetUrl.includes('YOUR_NEW_DEPLOYMENT_ID')) {
    return { success: false, message: 'ChÆ°a cáº¥u hÃ¬nh URL Google Apps Script há»£p lá»‡!' };
  }

  try {
    // 1. Thá»­ gá»­i action 'upload_backdrop' (ChuyÃªn dá»¥ng cho thÆ° má»¥c Backdrops_SanKhau)
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
      return { success: true, data: json.data, message: json.message || 'Táº£i backdrop lÃªn Google Drive thÃ nh cÃ´ng!' };
    }

    // 2. Dá»± phÃ²ng (Fallback): Náº¿u Apps Script trÃªn Google chÆ°a deploy báº£n má»›i, dÃ¹ng action 'upload_photo' Ä‘Ã£ hoáº¡t Ä‘á»™ng á»•n Ä‘á»‹nh trÃªn live Drive
    console.warn('Endpoint chÆ°a cáº­p nháº­t upload_backdrop, tá»± Ä‘á»™ng chuyá»ƒn sang upload_photo trÃªn Drive:', json?.message);
    res = await fetch(targetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        action: 'upload_photo',
        fileData: payload.fileData,
        caption: '[Backdrop] ' + (payload.title || 'Backdrop SÃ¢n Kháº¥u')
      })
    });
    json = await res.json();
    if (json && json.status === 'success' && json.data) {
      const backdropItem: BackdropItem = {
        id: json.data.id || ('bd_' + Date.now()),
        title: payload.title || 'Backdrop SÃ¢n Kháº¥u',
        url: json.data.url,
        thumbnail: json.data.thumbnail,
        driveUrl: json.data.driveUrl,
        dateCreated: json.data.date,
        isDefault: false
      };
      return { success: true, data: backdropItem, message: 'ÄÃ£ táº£i backdrop lÃªn Google Drive thÃ nh cÃ´ng!' };
    }

    return { success: false, message: json?.message || 'KhÃ´ng thá»ƒ táº£i backdrop lÃªn Google Drive!' };
  } catch (err: any) {
    return { success: false, message: 'Lá»—i káº¿t ná»‘i mÃ¡y chá»§ Drive: ' + (err?.message || err) };
  }
}

/**
 * Táº£i áº£nh Ä‘áº¡i diá»‡n cá»§a há»c sinh lÃªn thÆ° má»¥c con "Avatar_Thanh_Vien" trÃªn Google Drive
 * Äá»“ng thá»i tá»± Ä‘á»™ng cáº­p nháº­t link áº£nh vÃ o chuá»—i JSON cá»§a thÃ nh viÃªn
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
    return { success: false, message: 'ChÆ°a cáº¥u hÃ¬nh URL Google Apps Script há»£p lá»‡!' };
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
        message: json.message || 'ÄÃ£ lÆ°u avatar vÃ o thÆ° má»¥c Avatar_Thanh_Vien trÃªn Google Drive!'
      };
    }

    return {
      success: false,
      message: json?.message || 'KhÃ´ng thá»ƒ lÆ°u avatar lÃªn Google Drive'
    };
  } catch (err: any) {
    return {
      success: false,
      message: 'Lá»—i káº¿t ná»‘i mÃ¡y chá»§ Google Drive: ' + (err?.message || err)
    };
  }
}

/**
 * ---------------------------------------------------------------------------
 * Cáº¤U HÃŒNH & THUáº¬T TOÃN PHÃ‚N BÃ€N TIá»†C K8A1 (5 BÃ€N Há»ŒC SINH + 1 MÃ‚M THáº¦Y CÃ”)
 * ---------------------------------------------------------------------------
 */
export const BANQUET_TABLES: TableConfigItem[] = [
  {
    id: 0,
    name: 'MÃ¢m Tri Ã‚n Tháº§y CÃ´',
    shortName: 'MÃ¢m Tháº§y CÃ´',
    description: 'DÃ nh riÃªng Ä‘Ã³n tiáº¿p Tháº§y CÃ´ giÃ¡o chá»§ nhiá»‡m vÃ  bá»™ mÃ´n K8A1',
    maxCapacity: 12,
    isTeacherTable: true,
    badgeBg: 'bg-rose-100',
    badgeText: 'text-rose-900',
    badgeBorder: 'border-rose-300'
  },
  {
    id: 1,
    name: 'BÃ n 01 (MÃ¢m 1)',
    shortName: 'BÃ n 01',
    description: 'MÃ¢m tiá»‡c há»c sinh K8A1 â€” Tuá»•i Tráº» & Ká»· Niá»‡m',
    maxCapacity: 10,
    badgeBg: 'bg-amber-100',
    badgeText: 'text-amber-900',
    badgeBorder: 'border-amber-300'
  },
  {
    id: 2,
    name: 'BÃ n 02 (MÃ¢m 2)',
    shortName: 'BÃ n 02',
    description: 'MÃ¢m tiá»‡c há»c sinh K8A1 â€” Thanh XuÃ¢n Rá»±c Rá»¡',
    maxCapacity: 10,
    badgeBg: 'bg-emerald-100',
    badgeText: 'text-emerald-900',
    badgeBorder: 'border-emerald-300'
  },
  {
    id: 3,
    name: 'BÃ n 03 (MÃ¢m 3)',
    shortName: 'BÃ n 03',
    description: 'MÃ¢m tiá»‡c há»c sinh K8A1 â€” Gáº¯n Káº¿t Bá»n LÃ¢u',
    maxCapacity: 10,
    badgeBg: 'bg-blue-100',
    badgeText: 'text-blue-900',
    badgeBorder: 'border-blue-300'
  },
  {
    id: 4,
    name: 'BÃ n 04 (MÃ¢m 4)',
    shortName: 'BÃ n 04',
    description: 'MÃ¢m tiá»‡c há»c sinh K8A1 â€” 20 NÄƒm NgÃ y Trá»Ÿ Vá»',
    maxCapacity: 10,
    badgeBg: 'bg-purple-100',
    badgeText: 'text-purple-900',
    badgeBorder: 'border-purple-300'
  },
  {
    id: 5,
    name: 'BÃ n 05 (MÃ¢m 5)',
    shortName: 'BÃ n 05',
    description: 'MÃ¢m tiá»‡c há»c sinh K8A1 â€” MÃ£i MÃ£i Má»™t Thá»i',
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
    name: `BÃ n 0${num} (MÃ¢m ${num})`,
    shortName: `BÃ n 0${num}`,
    description: 'MÃ¢m tiá»‡c há»c sinh K8A1',
    maxCapacity: 10,
    badgeBg: 'bg-amber-100',
    badgeText: 'text-amber-900',
    badgeBorder: 'border-amber-300'
  };
}

/**
 * Thuáº­t toÃ¡n phÃ¢n bÃ n thÃ´ng minh cho há»c sinh K8A1:
 * - Ráº£i Ä‘á»u thÃ nh viÃªn BLL (háº¡t nhÃ¢n káº¿t ná»‘i) vÃ o 5 bÃ n
 * - CÃ¢n báº±ng tá»· lá»‡ Nam / Ná»¯
 * - Tá»‘i Ä‘a 10 ngÆ°á»i/bÃ n (1 Ä‘áº¿n 5)
 * - Giá»¯ nguyÃªn nhá»¯ng ai Ä‘Ã£ Ä‘Æ°á»£c phÃ¢n bÃ n tá»« trÆ°á»›c (khÃ´ng Ä‘á»•i náº¿u Ä‘Ã£ cÃ³)
 */
export function autoAssignStudentTables(
  rsvpList: RsvpData[], 
  rosterList: ClassMember[] = CLASS_ROSTER_K8A1,
  options?: { studentHostsForTeacherTable?: number }
): { updatedList: RsvpData[]; stats: Record<number, number> } {
  const attendees = rsvpList.filter(a => a.status === 'yes');
  // Sá»©c chá»©a cÃ¡c bÃ n: 0 (MÃ¢m Tháº§y CÃ´ - há»c sinh tiáº¿p Ä‘Ã³n), 1-5 (Há»c sinh)
  const tableCounts: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  const assignedMap = new Map<string, number>();

  // 1. GIá»® NGUYÃŠN TUYá»†T Äá»I nhá»¯ng ai Ä‘Ã£ cÃ³ bÃ n há»£p lá»‡ (BÃ n 0 MÃ¢m Tháº§y CÃ´ hoáº·c BÃ n 1-5)
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
      if (g.includes('ná»¯') || g.includes('female') || g === 'f') return true;
      const fn = a.fullName.toLowerCase();
      return fn.includes('thá»‹') || fn.includes('ngá»c') || fn.includes('hÆ°Æ¡ng') || fn.includes('mai') || fn.includes('lan');
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

    // TÃ¹y chá»n: Bá»‘ trÃ­ há»c sinh ngá»“i MÃ¢m Tháº§y CÃ´ Ä‘á»ƒ tiáº¿p Ä‘Ã³n (máº·c Ä‘á»‹nh 2-4 báº¡n náº¿u chÆ°a ai Ä‘Æ°á»£c phÃ¢n)
    const targetHosts = options?.studentHostsForTeacherTable !== undefined ? options.studentHostsForTeacherTable : 2;
    let currentHosts = tableCounts[0] || 0;

    // Náº¿u MÃ¢m Tháº§y CÃ´ chÆ°a Ä‘á»§ sá»‘ há»c sinh tiáº¿p Ä‘Ã³n, Æ°u tiÃªn phÃ¢n CÃ¡n sá»± BLL vÃ o MÃ¢m 0
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

    // 1. Ráº£i Ä‘á»u BLL cÃ²n láº¡i vÃ o 5 bÃ n há»c sinh (1-5)
    bllMembers.forEach(a => {
      const t = pickBestTable();
      const key = a.memberId || a.phone || a.fullName;
      assignedMap.set(key, t);
      tableCounts[t] = (tableCounts[t] || 0) + 1;
    });

    // 2. Ráº£i Ä‘á»u Ná»¯
    females.forEach(a => {
      const t = pickBestTable();
      const key = a.memberId || a.phone || a.fullName;
      assignedMap.set(key, t);
      tableCounts[t] = (tableCounts[t] || 0) + 1;
    });

    // 3. Ráº£i Ä‘á»u Nam
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
    const tableNameStr = tNum === 0 ? 'MÃ¢m Tháº§y CÃ´' : tCfg.name;
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
 * Äá»‹nh dáº¡ng thá»i gian hiá»ƒn thá»‹ gá»n gÃ ng, Ä‘áº¹p máº¯t cho áº£nh/video ká»· niá»‡m
 * Loáº¡i bá» chuá»—i ngÃ y giá» dÃ i thÃ´ ká»‡ch dáº¡ng 'Mon Sep 28 2026 22:29:00 GMT+0700...'
 */
export function formatDisplayDate(dateStr?: any): string {
  if (!dateStr) return '';
  if (dateStr instanceof Date) {
    const pad = (n: number) => n < 10 ? '0' + n : n;
    return pad(dateStr.getDate()) + '/' + pad(dateStr.getMonth() + 1) + '/' + dateStr.getFullYear();
  }
  const str = String(dateStr).trim();
  if (!str) return '';

  // Náº¿u lÃ  nÄƒm hoáº·c khoáº£ng nÄƒm Ä‘Æ¡n thuáº§n (vÃ­ dá»¥: '2006', '2003-2006', '2003 â€” 2006')
  if (/^\d{4}(\s*[-â€”â€“]\s*\d{4})?$/.test(str)) {
    return str;
  }

  // Náº¿u lÃ  chuá»—i ngÃ y dáº¡ng DD/MM/YYYY ngáº¯n gá»n (vÃ­ dá»¥: '28/09/2026')
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(str)) {
    return str;
  }

  // Náº¿u lÃ  dáº¡ng cÃ³ giá» '28/09/2026 14:25' -> láº¥y ngÃ y '28/09/2026'
  const dateMatch = str.match(/^(\d{1,2}\/\d{1,2}\/\d{4})/);
  if (dateMatch) {
    return dateMatch[1];
  }

  // Náº¿u chá»©a ngÃ y giá» dÃ i dáº¡ng 'Mon Sep 28 2026 22:29:00 GMT+0700...' hoáº·c ISO
  const d = new Date(str);
  if (!isNaN(d.getTime())) {
    const pad = (n: number) => n < 10 ? '0' + n : n;
    const year = d.getFullYear();
    // Náº¿u lÃ  niÃªn khÃ³a 2003-2006 thÃ¬ hiá»ƒn thá»‹ nÄƒm
    if (year >= 2003 && year <= 2006) {
      return '' + year;
    }
    return pad(d.getDate()) + '/' + pad(d.getMonth() + 1) + '/' + year;
  }

  return str.length > 15 ? '' : str;
}

