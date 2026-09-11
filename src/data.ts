import { UserRole, RsvpData, WishData, MemoryImage, MemoryVideo, TimelineMilestone, QuizQuestion, PollItem, ScheduleItem, SponsorItem, EventConfig, ClassMember, ExpenseCategory, IncomeCategory, ExpenseItem, IncomeItem, TeacherData, TeacherTribute, MusicTrack, BackdropItem, StageSettings } from './types';
export {
  isValidVietnamesePhone,
  normalizeVietnamesePhone,
  formatPhoneDisplay,
  maskPhoneSecure,
  verifyLast4Digits,
  findDuplicatePhoneInRoster
} from './utils/phoneUtils';

// Phiên bản bộ nhớ đệm ứng dụng (Thay đổi khi có cấu trúc dữ liệu hoặc danh bạ mới để tự động dọn sạch cache cũ trên máy thành viên)
export const CURRENT_CACHE_VERSION = 'k8a1_v2026.09.11_dynamic_sheets_v11';

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

// Thư viện ảnh kỷ niệm chính thức lớp K8A1 (Tự động đồng bộ với Google Drive)
export const DEFAULT_MEMORIES: MemoryImage[] = [
  {
    "id": "1Q05JWOgOF2tWTk0yZ6IRQlnmInLYF5xD",
    "url": "https://lh3.googleusercontent.com/d/1Q05JWOgOF2tWTk0yZ6IRQlnmInLYF5xD=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1Q05JWOgOF2tWTk0yZ6IRQlnmInLYF5xD=w600",
    "driveUrl": "https://drive.google.com/file/d/1Q05JWOgOF2tWTk0yZ6IRQlnmInLYF5xD/view?usp=drivesdk",
    "caption": "1788824248451 3501496844115072933 g8213875404109675727 9527bee86c38f35b4561e6a754f06d46",
    "date": "08/09/2026 08:17"
  },
  {
    "id": "1Z6wWcSwqY6SqmIawq0Bqixx8bOy55dhv",
    "url": "https://lh3.googleusercontent.com/d/1Z6wWcSwqY6SqmIawq0Bqixx8bOy55dhv=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1Z6wWcSwqY6SqmIawq0Bqixx8bOy55dhv=w600",
    "driveUrl": "https://drive.google.com/file/d/1Z6wWcSwqY6SqmIawq0Bqixx8bOy55dhv/view?usp=drivesdk",
    "caption": "1788824248592 3501496844115072933 g8213875404109675727 ebf9663813a934ae04dd580a52fd3244",
    "date": "08/09/2026 08:17"
  },
  {
    "id": "1iXWP-WZniC5rcV0qevoymDvFxG41DXXX",
    "url": "https://lh3.googleusercontent.com/d/1iXWP-WZniC5rcV0qevoymDvFxG41DXXX=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1iXWP-WZniC5rcV0qevoymDvFxG41DXXX=w600",
    "driveUrl": "https://drive.google.com/file/d/1iXWP-WZniC5rcV0qevoymDvFxG41DXXX/view?usp=drivesdk",
    "caption": "1788824248732 3501496844115072933 g8213875404109675727 da08312a632de5f5bf4e6f53ad649388",
    "date": "08/09/2026 08:17"
  },
  {
    "id": "1Z7WKN4cvYk_PTpvELz0d75XuVYh17aKh",
    "url": "https://lh3.googleusercontent.com/d/1Z7WKN4cvYk_PTpvELz0d75XuVYh17aKh=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1Z7WKN4cvYk_PTpvELz0d75XuVYh17aKh=w600",
    "driveUrl": "https://drive.google.com/file/d/1Z7WKN4cvYk_PTpvELz0d75XuVYh17aKh/view?usp=drivesdk",
    "caption": "1788824248871 3501496844115072933 g8213875404109675727 23e6f269ae05048e27f12abbf107f266",
    "date": "08/09/2026 08:17"
  },
  {
    "id": "1I_28ZEncmuRjMrPHMIg396qa8yko2Tsm",
    "url": "https://lh3.googleusercontent.com/d/1I_28ZEncmuRjMrPHMIg396qa8yko2Tsm=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1I_28ZEncmuRjMrPHMIg396qa8yko2Tsm=w600",
    "driveUrl": "https://drive.google.com/file/d/1I_28ZEncmuRjMrPHMIg396qa8yko2Tsm/view?usp=drivesdk",
    "caption": "1788824249013 3501496844115072933 g8213875404109675727 04f464b9b04065b8e3aa43b6e41f7dd6",
    "date": "08/09/2026 08:17"
  },
  {
    "id": "1efoyI0s5oo9mIbr6k_ng-tAa2Zk-blDb",
    "url": "https://lh3.googleusercontent.com/d/1efoyI0s5oo9mIbr6k_ng-tAa2Zk-blDb=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1efoyI0s5oo9mIbr6k_ng-tAa2Zk-blDb=w600",
    "driveUrl": "https://drive.google.com/file/d/1efoyI0s5oo9mIbr6k_ng-tAa2Zk-blDb/view?usp=drivesdk",
    "caption": "1788824249209 3501496844115072933 g8213875404109675727 eb5473dac01488365f15e3dc53c1e935",
    "date": "08/09/2026 08:17"
  },
  {
    "id": "1PdyvVtADltoTKFEJxE9tvg9eQqyPZoZi",
    "url": "https://lh3.googleusercontent.com/d/1PdyvVtADltoTKFEJxE9tvg9eQqyPZoZi=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1PdyvVtADltoTKFEJxE9tvg9eQqyPZoZi=w600",
    "driveUrl": "https://drive.google.com/file/d/1PdyvVtADltoTKFEJxE9tvg9eQqyPZoZi/view?usp=drivesdk",
    "caption": "1788824248331 3501496844115072933 g8213875404109675727 065c7067d85cb59faf76157717165807",
    "date": "08/09/2026 08:17"
  },
  {
    "id": "1yGjuN21tJ2DW7syA_H6Qr-7KSJuNOCXo",
    "url": "https://lh3.googleusercontent.com/d/1yGjuN21tJ2DW7syA_H6Qr-7KSJuNOCXo=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1yGjuN21tJ2DW7syA_H6Qr-7KSJuNOCXo=w600",
    "driveUrl": "https://drive.google.com/file/d/1yGjuN21tJ2DW7syA_H6Qr-7KSJuNOCXo/view?usp=drivesdk",
    "caption": "2aOboQx0cIp0ytJctMR2mYgDpSIvagbVQ47zopO4",
    "date": "07/09/2026 23:36"
  },
  {
    "id": "1peRhGo5OpuungLRfA7vPg_XF5ZumP6Sx",
    "url": "https://lh3.googleusercontent.com/d/1peRhGo5OpuungLRfA7vPg_XF5ZumP6Sx=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1peRhGo5OpuungLRfA7vPg_XF5ZumP6Sx=w600",
    "driveUrl": "https://drive.google.com/file/d/1peRhGo5OpuungLRfA7vPg_XF5ZumP6Sx/view?usp=drivesdk",
    "caption": "2aOboQx0baKOoIURuyvahzXio9cEbiKEgfKnDCcq",
    "date": "07/09/2026 21:39"
  },
  {
    "id": "12hYWeHGnHEE2w_SK6Epo_EkypNN3JVx1",
    "url": "https://lh3.googleusercontent.com/d/12hYWeHGnHEE2w_SK6Epo_EkypNN3JVx1=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/12hYWeHGnHEE2w_SK6Epo_EkypNN3JVx1=w600",
    "driveUrl": "https://drive.google.com/file/d/12hYWeHGnHEE2w_SK6Epo_EkypNN3JVx1/view?usp=drivesdk",
    "caption": "569594713 25427700770149816 2644678869832531622 n",
    "date": "07/09/2026 14:29"
  },
  {
    "id": "16SjRZNq38EI29_YH6RA7djbmbfOC5Tbc",
    "url": "https://lh3.googleusercontent.com/d/16SjRZNq38EI29_YH6RA7djbmbfOC5Tbc=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/16SjRZNq38EI29_YH6RA7djbmbfOC5Tbc=w600",
    "driveUrl": "https://drive.google.com/file/d/16SjRZNq38EI29_YH6RA7djbmbfOC5Tbc/view?usp=drivesdk",
    "caption": "568591301 25427700846816475 1126852120421423282 n",
    "date": "07/09/2026 14:28"
  },
  {
    "id": "1XA2YUEoDtn3l7hF8WkK3cl2qkoD9yW5Q",
    "url": "https://lh3.googleusercontent.com/d/1XA2YUEoDtn3l7hF8WkK3cl2qkoD9yW5Q=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1XA2YUEoDtn3l7hF8WkK3cl2qkoD9yW5Q=w600",
    "driveUrl": "https://drive.google.com/file/d/1XA2YUEoDtn3l7hF8WkK3cl2qkoD9yW5Q/view?usp=drivesdk",
    "caption": "568521421 25427700783483148 7823683749895364541 n",
    "date": "07/09/2026 14:28"
  },
  {
    "id": "1H096CF4zzNEHnqLFmf4kWY16ZXv8qNj_",
    "url": "https://lh3.googleusercontent.com/d/1H096CF4zzNEHnqLFmf4kWY16ZXv8qNj_=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1H096CF4zzNEHnqLFmf4kWY16ZXv8qNj_=w600",
    "driveUrl": "https://drive.google.com/file/d/1H096CF4zzNEHnqLFmf4kWY16ZXv8qNj_/view?usp=drivesdk",
    "caption": "568711089 25427701150149778 8533686120286400563 n",
    "date": "07/09/2026 14:28"
  },
  {
    "id": "1QiOHc2UiTC21vBT8fVrRo1EIX-LLXYNW",
    "url": "https://lh3.googleusercontent.com/d/1QiOHc2UiTC21vBT8fVrRo1EIX-LLXYNW=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1QiOHc2UiTC21vBT8fVrRo1EIX-LLXYNW=w600",
    "driveUrl": "https://drive.google.com/file/d/1QiOHc2UiTC21vBT8fVrRo1EIX-LLXYNW/view?usp=drivesdk",
    "caption": "568570760 25427700993483127 702110216661534225 n",
    "date": "07/09/2026 14:28"
  },
  {
    "id": "1_TEoL7kscr16madk1x_RFk-yYDgdqzR_",
    "url": "https://lh3.googleusercontent.com/d/1_TEoL7kscr16madk1x_RFk-yYDgdqzR_=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1_TEoL7kscr16madk1x_RFk-yYDgdqzR_=w600",
    "driveUrl": "https://drive.google.com/file/d/1_TEoL7kscr16madk1x_RFk-yYDgdqzR_/view?usp=drivesdk",
    "caption": "568684012 25427701193483107 3841298913620152420 n",
    "date": "07/09/2026 14:28"
  },
  {
    "id": "1XHVCQdD8zry64VsaguH-qjiDL268sTLO",
    "url": "https://lh3.googleusercontent.com/d/1XHVCQdD8zry64VsaguH-qjiDL268sTLO=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1XHVCQdD8zry64VsaguH-qjiDL268sTLO=w600",
    "driveUrl": "https://drive.google.com/file/d/1XHVCQdD8zry64VsaguH-qjiDL268sTLO/view?usp=drivesdk",
    "caption": "569034083 25427700956816464 1023055468056574601 n",
    "date": "07/09/2026 14:27"
  },
  {
    "id": "19kNADaP1ON_IUFfLNmGpzEkOhL1FFVMw",
    "url": "https://lh3.googleusercontent.com/d/19kNADaP1ON_IUFfLNmGpzEkOhL1FFVMw=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/19kNADaP1ON_IUFfLNmGpzEkOhL1FFVMw=w600",
    "driveUrl": "https://drive.google.com/file/d/19kNADaP1ON_IUFfLNmGpzEkOhL1FFVMw/view?usp=drivesdk",
    "caption": "569407909 25427701183483108 3435695790737340030 n",
    "date": "07/09/2026 14:27"
  },
  {
    "id": "1lkWz5F_4U-il89ChVGA3xiT_u6VEnk14",
    "url": "https://lh3.googleusercontent.com/d/1lkWz5F_4U-il89ChVGA3xiT_u6VEnk14=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1lkWz5F_4U-il89ChVGA3xiT_u6VEnk14=w600",
    "driveUrl": "https://drive.google.com/file/d/1lkWz5F_4U-il89ChVGA3xiT_u6VEnk14/view?usp=drivesdk",
    "caption": "568465914 25427700736816486 4586619359066166841 n",
    "date": "07/09/2026 14:27"
  },
  {
    "id": "1GPulvYg_sAATwp0bBH7DTdXaDYaLEZ74",
    "url": "https://lh3.googleusercontent.com/d/1GPulvYg_sAATwp0bBH7DTdXaDYaLEZ74=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1GPulvYg_sAATwp0bBH7DTdXaDYaLEZ74=w600",
    "driveUrl": "https://drive.google.com/file/d/1GPulvYg_sAATwp0bBH7DTdXaDYaLEZ74/view?usp=drivesdk",
    "caption": "568644863 25427701010149792 2103536203186524603 n",
    "date": "07/09/2026 14:27"
  },
  {
    "id": "1bUwUn-aU2_3vh0Li9zz3xQGxCepNc-HQ",
    "url": "https://lh3.googleusercontent.com/d/1bUwUn-aU2_3vh0Li9zz3xQGxCepNc-HQ=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1bUwUn-aU2_3vh0Li9zz3xQGxCepNc-HQ=w600",
    "driveUrl": "https://drive.google.com/file/d/1bUwUn-aU2_3vh0Li9zz3xQGxCepNc-HQ/view?usp=drivesdk",
    "caption": "568660519 25427701133483113 3101238401658299889 n",
    "date": "07/09/2026 14:27"
  },
  {
    "id": "14m6tyk5AdU7qT_8DV4Au7mKYsnokXlYO",
    "url": "https://lh3.googleusercontent.com/d/14m6tyk5AdU7qT_8DV4Au7mKYsnokXlYO=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/14m6tyk5AdU7qT_8DV4Au7mKYsnokXlYO=w600",
    "driveUrl": "https://drive.google.com/file/d/14m6tyk5AdU7qT_8DV4Au7mKYsnokXlYO/view?usp=drivesdk",
    "caption": "568391428 25427700786816481 3815322867541178641 n",
    "date": "07/09/2026 14:27"
  },
  {
    "id": "1HaSseVibgreTddMgzBONxJgVlpkSTNd7",
    "url": "https://lh3.googleusercontent.com/d/1HaSseVibgreTddMgzBONxJgVlpkSTNd7=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1HaSseVibgreTddMgzBONxJgVlpkSTNd7=w600",
    "driveUrl": "https://drive.google.com/file/d/1HaSseVibgreTddMgzBONxJgVlpkSTNd7/view?usp=drivesdk",
    "caption": "569045915 25427701130149780 6295153971260902112 n",
    "date": "07/09/2026 14:26"
  },
  {
    "id": "1PHzGoaJVkVX-uJKODv25tp2pCKQR09d7",
    "url": "https://lh3.googleusercontent.com/d/1PHzGoaJVkVX-uJKODv25tp2pCKQR09d7=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1PHzGoaJVkVX-uJKODv25tp2pCKQR09d7=w600",
    "driveUrl": "https://drive.google.com/file/d/1PHzGoaJVkVX-uJKODv25tp2pCKQR09d7/view?usp=drivesdk",
    "caption": "568732066 25427701006816459 8741581285049397805 n",
    "date": "07/09/2026 14:26"
  },
  {
    "id": "1LsKT7Ljbx_g31qUkQPOacv-agqnfgRcX",
    "url": "https://lh3.googleusercontent.com/d/1LsKT7Ljbx_g31qUkQPOacv-agqnfgRcX=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1LsKT7Ljbx_g31qUkQPOacv-agqnfgRcX=w600",
    "driveUrl": "https://drive.google.com/file/d/1LsKT7Ljbx_g31qUkQPOacv-agqnfgRcX/view?usp=drivesdk",
    "caption": "568368382 25427701003483126 6337531773628394740 n",
    "date": "07/09/2026 14:26"
  },
  {
    "id": "1GdpubsYWlncsRJ2RBjvglJIUPe-dzGsA",
    "url": "https://lh3.googleusercontent.com/d/1GdpubsYWlncsRJ2RBjvglJIUPe-dzGsA=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1GdpubsYWlncsRJ2RBjvglJIUPe-dzGsA=w600",
    "driveUrl": "https://drive.google.com/file/d/1GdpubsYWlncsRJ2RBjvglJIUPe-dzGsA/view?usp=drivesdk",
    "caption": "568673263 25427700840149809 1166261907794601885 n",
    "date": "07/09/2026 14:26"
  },
  {
    "id": "11VWTW8FFIk8S70TGeuSW6iPu-H_QoQyt",
    "url": "https://lh3.googleusercontent.com/d/11VWTW8FFIk8S70TGeuSW6iPu-H_QoQyt=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/11VWTW8FFIk8S70TGeuSW6iPu-H_QoQyt=w600",
    "driveUrl": "https://drive.google.com/file/d/11VWTW8FFIk8S70TGeuSW6iPu-H_QoQyt/view?usp=drivesdk",
    "caption": "568626605 25427701180149775 7581562842138321625 n",
    "date": "07/09/2026 14:25"
  },
  {
    "id": "1yKLQQX_KSZmJ7g5sK1UTaWOtUEBELQVt",
    "url": "https://lh3.googleusercontent.com/d/1yKLQQX_KSZmJ7g5sK1UTaWOtUEBELQVt=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1yKLQQX_KSZmJ7g5sK1UTaWOtUEBELQVt=w600",
    "driveUrl": "https://drive.google.com/file/d/1yKLQQX_KSZmJ7g5sK1UTaWOtUEBELQVt/view?usp=drivesdk",
    "caption": "568743815 25427700963483130 2635418458490161686 n",
    "date": "07/09/2026 14:24"
  },
  {
    "id": "1kEAtvZGkriNORGy8N6KL3h65TwYGQybD",
    "url": "https://lh3.googleusercontent.com/d/1kEAtvZGkriNORGy8N6KL3h65TwYGQybD=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1kEAtvZGkriNORGy8N6KL3h65TwYGQybD=w600",
    "driveUrl": "https://drive.google.com/file/d/1kEAtvZGkriNORGy8N6KL3h65TwYGQybD/view?usp=drivesdk",
    "caption": "568679026 25427699210149972 7810656936267837094 n",
    "date": "07/09/2026 14:24"
  },
  {
    "id": "1CbR0lVmvQ_cPtkdnJeW2dVIu1rYMaVMl",
    "url": "https://lh3.googleusercontent.com/d/1CbR0lVmvQ_cPtkdnJeW2dVIu1rYMaVMl=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1CbR0lVmvQ_cPtkdnJeW2dVIu1rYMaVMl=w600",
    "driveUrl": "https://drive.google.com/file/d/1CbR0lVmvQ_cPtkdnJeW2dVIu1rYMaVMl/view?usp=drivesdk",
    "caption": "569263239 25427700996816460 3729324044172904123 n",
    "date": "07/09/2026 14:24"
  },
  {
    "id": "1nUBLpkR8SKMYEh0k2xWxV4ck4HLNtYcx",
    "url": "https://lh3.googleusercontent.com/d/1nUBLpkR8SKMYEh0k2xWxV4ck4HLNtYcx=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1nUBLpkR8SKMYEh0k2xWxV4ck4HLNtYcx=w600",
    "driveUrl": "https://drive.google.com/file/d/1nUBLpkR8SKMYEh0k2xWxV4ck4HLNtYcx/view?usp=drivesdk",
    "caption": "568573499 25427700953483131 5327576891590810063 n",
    "date": "07/09/2026 14:23"
  },
  {
    "id": "13zT4aOkSxA64WvjMdnWYnvmQ3ymd8_tP",
    "url": "https://lh3.googleusercontent.com/d/13zT4aOkSxA64WvjMdnWYnvmQ3ymd8_tP=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/13zT4aOkSxA64WvjMdnWYnvmQ3ymd8_tP=w600",
    "driveUrl": "https://drive.google.com/file/d/13zT4aOkSxA64WvjMdnWYnvmQ3ymd8_tP/view?usp=drivesdk",
    "caption": "568695090 25427700926816467 6488015068094102325 n",
    "date": "07/09/2026 14:23"
  },
  {
    "id": "10XawSSwZY4SN1VxEiqwu1xTdVDrnHSJ_",
    "url": "https://lh3.googleusercontent.com/d/10XawSSwZY4SN1VxEiqwu1xTdVDrnHSJ_=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/10XawSSwZY4SN1VxEiqwu1xTdVDrnHSJ_=w600",
    "driveUrl": "https://drive.google.com/file/d/10XawSSwZY4SN1VxEiqwu1xTdVDrnHSJ_/view?usp=drivesdk",
    "caption": "569361841 25427700896816470 871589613218143097 n",
    "date": "07/09/2026 14:23"
  },
  {
    "id": "1YdNfE3eTp-tFMziZGrXAKBiFGGizxqU5",
    "url": "https://lh3.googleusercontent.com/d/1YdNfE3eTp-tFMziZGrXAKBiFGGizxqU5=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1YdNfE3eTp-tFMziZGrXAKBiFGGizxqU5=w600",
    "driveUrl": "https://drive.google.com/file/d/1YdNfE3eTp-tFMziZGrXAKBiFGGizxqU5/view?usp=drivesdk",
    "caption": "569275669 25427700886816471 1727293045959048178 n",
    "date": "07/09/2026 14:23"
  },
  {
    "id": "1TcNE9texOQ_bc3pHFQ5v1GkkC3fmvwa_",
    "url": "https://lh3.googleusercontent.com/d/1TcNE9texOQ_bc3pHFQ5v1GkkC3fmvwa_=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1TcNE9texOQ_bc3pHFQ5v1GkkC3fmvwa_=w600",
    "driveUrl": "https://drive.google.com/file/d/1TcNE9texOQ_bc3pHFQ5v1GkkC3fmvwa_/view?usp=drivesdk",
    "caption": "568636651 25427701116816448 7916458789377339898 n",
    "date": "07/09/2026 14:23"
  },
  {
    "id": "1moPfah4fJ65JDeLb2tmsgcUS8wLwKkYJ",
    "url": "https://lh3.googleusercontent.com/d/1moPfah4fJ65JDeLb2tmsgcUS8wLwKkYJ=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1moPfah4fJ65JDeLb2tmsgcUS8wLwKkYJ=w600",
    "driveUrl": "https://drive.google.com/file/d/1moPfah4fJ65JDeLb2tmsgcUS8wLwKkYJ/view?usp=drivesdk",
    "caption": "568630213 25427698856816674 2846856576979995986 n",
    "date": "07/09/2026 14:23"
  },
  {
    "id": "1vJNgqD0H1kakbcso-8l2HsmHaea0OTuk",
    "url": "https://lh3.googleusercontent.com/d/1vJNgqD0H1kakbcso-8l2HsmHaea0OTuk=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1vJNgqD0H1kakbcso-8l2HsmHaea0OTuk=w600",
    "driveUrl": "https://drive.google.com/file/d/1vJNgqD0H1kakbcso-8l2HsmHaea0OTuk/view?usp=drivesdk",
    "caption": "569279888 25427698850150008 885288553376472055 n",
    "date": "07/09/2026 14:22"
  },
  {
    "id": "17nTPfS_55_e6fRYJWB9H4XZ3PUtZJlCD",
    "url": "https://lh3.googleusercontent.com/d/17nTPfS_55_e6fRYJWB9H4XZ3PUtZJlCD=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/17nTPfS_55_e6fRYJWB9H4XZ3PUtZJlCD=w600",
    "driveUrl": "https://drive.google.com/file/d/17nTPfS_55_e6fRYJWB9H4XZ3PUtZJlCD/view?usp=drivesdk",
    "caption": "568461253 25427698870150006 3328890851937873153 n",
    "date": "07/09/2026 14:22"
  },
  {
    "id": "1-hYaSpZ2YuFQ6YegDouhnxs5UPzyLxDS",
    "url": "https://lh3.googleusercontent.com/d/1-hYaSpZ2YuFQ6YegDouhnxs5UPzyLxDS=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1-hYaSpZ2YuFQ6YegDouhnxs5UPzyLxDS=w600",
    "driveUrl": "https://drive.google.com/file/d/1-hYaSpZ2YuFQ6YegDouhnxs5UPzyLxDS/view?usp=drivesdk",
    "caption": "568958945 25427698953483331 796230735043202253 n",
    "date": "07/09/2026 14:22"
  },
  {
    "id": "1kitBBq66pBXRT_y9KlZ9kc1mjx1BqPyD",
    "url": "https://lh3.googleusercontent.com/d/1kitBBq66pBXRT_y9KlZ9kc1mjx1BqPyD=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1kitBBq66pBXRT_y9KlZ9kc1mjx1BqPyD=w600",
    "driveUrl": "https://drive.google.com/file/d/1kitBBq66pBXRT_y9KlZ9kc1mjx1BqPyD/view?usp=drivesdk",
    "caption": "568550900 25427698930150000 3725851553165042490 n",
    "date": "07/09/2026 14:22"
  },
  {
    "id": "1W2oTKnff98-_a5rVr-XRBDTpyutkQqKC",
    "url": "https://lh3.googleusercontent.com/d/1W2oTKnff98-_a5rVr-XRBDTpyutkQqKC=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1W2oTKnff98-_a5rVr-XRBDTpyutkQqKC=w600",
    "driveUrl": "https://drive.google.com/file/d/1W2oTKnff98-_a5rVr-XRBDTpyutkQqKC/view?usp=drivesdk",
    "caption": "569414997 25427698846816675 5023155042365671726 n",
    "date": "07/09/2026 14:20"
  },
  {
    "id": "1xKmYbaLFydr0VR26mARduTiMTq4s7bgJ",
    "url": "https://lh3.googleusercontent.com/d/1xKmYbaLFydr0VR26mARduTiMTq4s7bgJ=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1xKmYbaLFydr0VR26mARduTiMTq4s7bgJ=w600",
    "driveUrl": "https://drive.google.com/file/d/1xKmYbaLFydr0VR26mARduTiMTq4s7bgJ/view?usp=drivesdk",
    "caption": "569032834 25427698886816671 6964238627033919601 n",
    "date": "07/09/2026 14:20"
  },
  {
    "id": "1fgIFHatftP7loK7bZBM6yOCJEWhDDx0N",
    "url": "https://lh3.googleusercontent.com/d/1fgIFHatftP7loK7bZBM6yOCJEWhDDx0N=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1fgIFHatftP7loK7bZBM6yOCJEWhDDx0N=w600",
    "driveUrl": "https://drive.google.com/file/d/1fgIFHatftP7loK7bZBM6yOCJEWhDDx0N/view?usp=drivesdk",
    "caption": "568580679 25427698980149995 2528942899829108465 n",
    "date": "07/09/2026 14:20"
  },
  {
    "id": "1H-G7waxtCOiIEA_fqeujyRUXD8tVuD9j",
    "url": "https://lh3.googleusercontent.com/d/1H-G7waxtCOiIEA_fqeujyRUXD8tVuD9j=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1H-G7waxtCOiIEA_fqeujyRUXD8tVuD9j=w600",
    "driveUrl": "https://drive.google.com/file/d/1H-G7waxtCOiIEA_fqeujyRUXD8tVuD9j/view?usp=drivesdk",
    "caption": "569014762 25427698990149994 6107575324795489823 n",
    "date": "07/09/2026 14:20"
  },
  {
    "id": "12a5k7adTy9CxmOkpbB2k_A9vb8FDQ5fb",
    "url": "https://lh3.googleusercontent.com/d/12a5k7adTy9CxmOkpbB2k_A9vb8FDQ5fb=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/12a5k7adTy9CxmOkpbB2k_A9vb8FDQ5fb=w600",
    "driveUrl": "https://drive.google.com/file/d/12a5k7adTy9CxmOkpbB2k_A9vb8FDQ5fb/view?usp=drivesdk",
    "caption": "568647261 25427699213483305 2404001179269260586 n",
    "date": "07/09/2026 14:20"
  },
  {
    "id": "1GArsYh8IcMegJlFN2iTFrrLXMnn04x5L",
    "url": "https://lh3.googleusercontent.com/d/1GArsYh8IcMegJlFN2iTFrrLXMnn04x5L=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1GArsYh8IcMegJlFN2iTFrrLXMnn04x5L=w600",
    "driveUrl": "https://drive.google.com/file/d/1GArsYh8IcMegJlFN2iTFrrLXMnn04x5L/view?usp=drivesdk",
    "caption": "568477608 25427699000149993 7399702547866199340 n",
    "date": "07/09/2026 14:20"
  },
  {
    "id": "1rhb4x-AqHEojQCuc6xnaEiyRKQhAI7fI",
    "url": "https://lh3.googleusercontent.com/d/1rhb4x-AqHEojQCuc6xnaEiyRKQhAI7fI=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1rhb4x-AqHEojQCuc6xnaEiyRKQhAI7fI=w600",
    "driveUrl": "https://drive.google.com/file/d/1rhb4x-AqHEojQCuc6xnaEiyRKQhAI7fI/view?usp=drivesdk",
    "caption": "568410051 25427698866816673 2671118570767665667 n",
    "date": "07/09/2026 14:19"
  },
  {
    "id": "1DgLheotSEaY8Elguz6C-9ELv83ZWsk0B",
    "url": "https://lh3.googleusercontent.com/d/1DgLheotSEaY8Elguz6C-9ELv83ZWsk0B=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1DgLheotSEaY8Elguz6C-9ELv83ZWsk0B=w600",
    "driveUrl": "https://drive.google.com/file/d/1DgLheotSEaY8Elguz6C-9ELv83ZWsk0B/view?usp=drivesdk",
    "caption": "568916889 25427699006816659 3087752054251687335 n",
    "date": "07/09/2026 14:19"
  },
  {
    "id": "15Y7EUSibVURczn5ACyHACR9R5wyze5Ar",
    "url": "https://lh3.googleusercontent.com/d/15Y7EUSibVURczn5ACyHACR9R5wyze5Ar=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/15Y7EUSibVURczn5ACyHACR9R5wyze5Ar=w600",
    "driveUrl": "https://drive.google.com/file/d/15Y7EUSibVURczn5ACyHACR9R5wyze5Ar/view?usp=drivesdk",
    "caption": "568638419 25427698940149999 1402577002769121704 n",
    "date": "07/09/2026 14:19"
  },
  {
    "id": "1PyvlmILYdK-Lx12ohrHfBV-ppDjHDhhg",
    "url": "https://lh3.googleusercontent.com/d/1PyvlmILYdK-Lx12ohrHfBV-ppDjHDhhg=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1PyvlmILYdK-Lx12ohrHfBV-ppDjHDhhg=w600",
    "driveUrl": "https://drive.google.com/file/d/1PyvlmILYdK-Lx12ohrHfBV-ppDjHDhhg/view?usp=drivesdk",
    "caption": "Hero Banner K8A1 1788595247751",
    "date": "05/09/2026 15:00"
  },
  {
    "id": "1aY8eo6a1heLuw034pLpDQsYKMMfuLc51",
    "url": "https://lh3.googleusercontent.com/d/1aY8eo6a1heLuw034pLpDQsYKMMfuLc51=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1aY8eo6a1heLuw034pLpDQsYKMMfuLc51=w600",
    "driveUrl": "https://drive.google.com/file/d/1aY8eo6a1heLuw034pLpDQsYKMMfuLc51/view?usp=drivesdk",
    "caption": "554971995 32660542940203212 2424085129544350643 n",
    "date": "05/09/2026 09:15"
  },
  {
    "id": "1vnBrGEC8nLBJAxg_9PxK7phhOEHlL94-",
    "url": "https://lh3.googleusercontent.com/d/1vnBrGEC8nLBJAxg_9PxK7phhOEHlL94-=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1vnBrGEC8nLBJAxg_9PxK7phhOEHlL94-=w600",
    "driveUrl": "https://drive.google.com/file/d/1vnBrGEC8nLBJAxg_9PxK7phhOEHlL94-/view?usp=drivesdk",
    "caption": "648357832 10226146414361480 3833201303384509491 n",
    "date": "05/09/2026 09:15"
  },
  {
    "id": "1U8SINXpF1ylZgufQEvmavVzhhNkD_fD2",
    "url": "https://lh3.googleusercontent.com/d/1U8SINXpF1ylZgufQEvmavVzhhNkD_fD2=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1U8SINXpF1ylZgufQEvmavVzhhNkD_fD2=w600",
    "driveUrl": "https://drive.google.com/file/d/1U8SINXpF1ylZgufQEvmavVzhhNkD_fD2/view?usp=drivesdk",
    "caption": "506460880 29829890076657001 4142235106235955816 n",
    "date": "05/09/2026 09:14"
  },
  {
    "id": "1MYnJ8FSiIFJ7PBXE02xPee9Ls_BOTt2o",
    "url": "https://lh3.googleusercontent.com/d/1MYnJ8FSiIFJ7PBXE02xPee9Ls_BOTt2o=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1MYnJ8FSiIFJ7PBXE02xPee9Ls_BOTt2o=w600",
    "driveUrl": "https://drive.google.com/file/d/1MYnJ8FSiIFJ7PBXE02xPee9Ls_BOTt2o/view?usp=drivesdk",
    "caption": "511009035 30602990642625346 2880448722037149222 n",
    "date": "05/09/2026 09:13"
  },
  {
    "id": "1BX0d3-lLRGmAC6cMmzlh3x5jU4TFBOju",
    "url": "https://lh3.googleusercontent.com/d/1BX0d3-lLRGmAC6cMmzlh3x5jU4TFBOju=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1BX0d3-lLRGmAC6cMmzlh3x5jU4TFBOju=w600",
    "driveUrl": "https://drive.google.com/file/d/1BX0d3-lLRGmAC6cMmzlh3x5jU4TFBOju/view?usp=drivesdk",
    "caption": "511330109 3855424527936875 8908743723824579465 n",
    "date": "05/09/2026 09:12"
  },
  {
    "id": "1q2hYgMI9dxvzLMwtlji3BiGQC8RNPUTE",
    "url": "https://lh3.googleusercontent.com/d/1q2hYgMI9dxvzLMwtlji3BiGQC8RNPUTE=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1q2hYgMI9dxvzLMwtlji3BiGQC8RNPUTE=w600",
    "driveUrl": "https://drive.google.com/file/d/1q2hYgMI9dxvzLMwtlji3BiGQC8RNPUTE/view?usp=drivesdk",
    "caption": "513896040 24325259480400973 6935572474755808817 n",
    "date": "05/09/2026 09:11"
  },
  {
    "id": "1cMx_JjIqNrQ5pbUqPq20iSLjdvQYtvJ9",
    "url": "https://lh3.googleusercontent.com/d/1cMx_JjIqNrQ5pbUqPq20iSLjdvQYtvJ9=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1cMx_JjIqNrQ5pbUqPq20iSLjdvQYtvJ9=w600",
    "driveUrl": "https://drive.google.com/file/d/1cMx_JjIqNrQ5pbUqPq20iSLjdvQYtvJ9/view?usp=drivesdk",
    "caption": "514954212 24325259277067660 1271437142121605245 n",
    "date": "05/09/2026 09:11"
  },
  {
    "id": "1f7-mNBmcPwOUILmRCMcNWaGTNB53-AiX",
    "url": "https://lh3.googleusercontent.com/d/1f7-mNBmcPwOUILmRCMcNWaGTNB53-AiX=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1f7-mNBmcPwOUILmRCMcNWaGTNB53-AiX=w600",
    "driveUrl": "https://drive.google.com/file/d/1f7-mNBmcPwOUILmRCMcNWaGTNB53-AiX/view?usp=drivesdk",
    "caption": "515121447 24325259427067645 1046997780096707513 n",
    "date": "05/09/2026 09:11"
  },
  {
    "id": "1kDcjDx3TsDAAVvD7WiVQrSaMvHR2B4zQ",
    "url": "https://lh3.googleusercontent.com/d/1kDcjDx3TsDAAVvD7WiVQrSaMvHR2B4zQ=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1kDcjDx3TsDAAVvD7WiVQrSaMvHR2B4zQ=w600",
    "driveUrl": "https://drive.google.com/file/d/1kDcjDx3TsDAAVvD7WiVQrSaMvHR2B4zQ/view?usp=drivesdk",
    "caption": "514405511 24325259380400983 3852819756365493424 n",
    "date": "05/09/2026 09:11"
  },
  {
    "id": "11IHAtRXKJv5PNztmdEuGX3p34e7zMWrS",
    "url": "https://lh3.googleusercontent.com/d/11IHAtRXKJv5PNztmdEuGX3p34e7zMWrS=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/11IHAtRXKJv5PNztmdEuGX3p34e7zMWrS=w600",
    "driveUrl": "https://drive.google.com/file/d/11IHAtRXKJv5PNztmdEuGX3p34e7zMWrS/view?usp=drivesdk",
    "caption": "514374652 24325259297067658 8532392626940600440 n",
    "date": "05/09/2026 09:11"
  },
  {
    "id": "1LlaKj-K5AKiHwvt0rnh0BlXlnuklYJQZ",
    "url": "https://lh3.googleusercontent.com/d/1LlaKj-K5AKiHwvt0rnh0BlXlnuklYJQZ=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1LlaKj-K5AKiHwvt0rnh0BlXlnuklYJQZ=w600",
    "driveUrl": "https://drive.google.com/file/d/1LlaKj-K5AKiHwvt0rnh0BlXlnuklYJQZ/view?usp=drivesdk",
    "caption": "513898701 24325259320400989 3468692801592186009 n",
    "date": "05/09/2026 09:11"
  },
  {
    "id": "15c5vvg8SW44Zv9YyDCEb3ZNYSFWJRHjE",
    "url": "https://lh3.googleusercontent.com/d/15c5vvg8SW44Zv9YyDCEb3ZNYSFWJRHjE=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/15c5vvg8SW44Zv9YyDCEb3ZNYSFWJRHjE=w600",
    "driveUrl": "https://drive.google.com/file/d/15c5vvg8SW44Zv9YyDCEb3ZNYSFWJRHjE/view?usp=drivesdk",
    "caption": "514374655 24325259213734333 978284759044515201 n",
    "date": "05/09/2026 09:11"
  },
  {
    "id": "1vyq_e7kQ7erqR67_xNZNQDDlqzMGjbJg",
    "url": "https://lh3.googleusercontent.com/d/1vyq_e7kQ7erqR67_xNZNQDDlqzMGjbJg=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1vyq_e7kQ7erqR67_xNZNQDDlqzMGjbJg=w600",
    "driveUrl": "https://drive.google.com/file/d/1vyq_e7kQ7erqR67_xNZNQDDlqzMGjbJg/view?usp=drivesdk",
    "caption": "515593345 24325259387067649 1247523544945188133 n",
    "date": "05/09/2026 09:11"
  },
  {
    "id": "1oKY0PdU3uys-JJ-yQ1w9BcQlcRx6lLCQ",
    "url": "https://lh3.googleusercontent.com/d/1oKY0PdU3uys-JJ-yQ1w9BcQlcRx6lLCQ=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1oKY0PdU3uys-JJ-yQ1w9BcQlcRx6lLCQ=w600",
    "driveUrl": "https://drive.google.com/file/d/1oKY0PdU3uys-JJ-yQ1w9BcQlcRx6lLCQ/view?usp=drivesdk",
    "caption": "566388636 24935157649469681 6276832814599423669 n",
    "date": "05/09/2026 09:10"
  },
  {
    "id": "1OrJVuLO-ADfvlO8Zi0Ad8_9jCwB7Nxq5",
    "url": "https://lh3.googleusercontent.com/d/1OrJVuLO-ADfvlO8Zi0Ad8_9jCwB7Nxq5=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1OrJVuLO-ADfvlO8Zi0Ad8_9jCwB7Nxq5=w600",
    "driveUrl": "https://drive.google.com/file/d/1OrJVuLO-ADfvlO8Zi0Ad8_9jCwB7Nxq5/view?usp=drivesdk",
    "caption": "503504170 2977749089065057 1459925905882967295 n",
    "date": "05/09/2026 09:10"
  },
  {
    "id": "1sVcXm8RRGoyqKwCbe6dEtRwQMjTnJyqa",
    "url": "https://lh3.googleusercontent.com/d/1sVcXm8RRGoyqKwCbe6dEtRwQMjTnJyqa=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1sVcXm8RRGoyqKwCbe6dEtRwQMjTnJyqa=w600",
    "driveUrl": "https://drive.google.com/file/d/1sVcXm8RRGoyqKwCbe6dEtRwQMjTnJyqa/view?usp=drivesdk",
    "caption": "503605997 2977749192398380 442522293639860588 n",
    "date": "05/09/2026 09:09"
  },
  {
    "id": "1y-gMPp7z6TqY3txehcYgoEpL4TmxiMs6",
    "url": "https://lh3.googleusercontent.com/d/1y-gMPp7z6TqY3txehcYgoEpL4TmxiMs6=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1y-gMPp7z6TqY3txehcYgoEpL4TmxiMs6=w600",
    "driveUrl": "https://drive.google.com/file/d/1y-gMPp7z6TqY3txehcYgoEpL4TmxiMs6/view?usp=drivesdk",
    "caption": "503828962 2977749182398381 1325996235817212040 n",
    "date": "05/09/2026 09:09"
  },
  {
    "id": "1FNoMWHGzXTY19rSXd-xyZFxzeDRftG1v",
    "url": "https://lh3.googleusercontent.com/d/1FNoMWHGzXTY19rSXd-xyZFxzeDRftG1v=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1FNoMWHGzXTY19rSXd-xyZFxzeDRftG1v=w600",
    "driveUrl": "https://drive.google.com/file/d/1FNoMWHGzXTY19rSXd-xyZFxzeDRftG1v/view?usp=drivesdk",
    "caption": "503504723 2977749309065035 1228763104923627602 n",
    "date": "05/09/2026 09:09"
  },
  {
    "id": "1Dei70eQXWBxIxOGXNIE5nX3SfeHm-IRW",
    "url": "https://lh3.googleusercontent.com/d/1Dei70eQXWBxIxOGXNIE5nX3SfeHm-IRW=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1Dei70eQXWBxIxOGXNIE5nX3SfeHm-IRW=w600",
    "driveUrl": "https://drive.google.com/file/d/1Dei70eQXWBxIxOGXNIE5nX3SfeHm-IRW/view?usp=drivesdk",
    "caption": "503889696 2977750115731621 8515012779203325994 n",
    "date": "05/09/2026 09:09"
  },
  {
    "id": "1lfg_kuf2M_B_UeWTAPcTukXG8ckXYR5g",
    "url": "https://lh3.googleusercontent.com/d/1lfg_kuf2M_B_UeWTAPcTukXG8ckXYR5g=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1lfg_kuf2M_B_UeWTAPcTukXG8ckXYR5g=w600",
    "driveUrl": "https://drive.google.com/file/d/1lfg_kuf2M_B_UeWTAPcTukXG8ckXYR5g/view?usp=drivesdk",
    "caption": "509261017 3393265960816629 6127474883787765388 n",
    "date": "05/09/2026 09:08"
  },
  {
    "id": "1IyMW1SCsME0C-mQ6tGkEFH-_RizeCuBf",
    "url": "https://lh3.googleusercontent.com/d/1IyMW1SCsME0C-mQ6tGkEFH-_RizeCuBf=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1IyMW1SCsME0C-mQ6tGkEFH-_RizeCuBf=w600",
    "driveUrl": "https://drive.google.com/file/d/1IyMW1SCsME0C-mQ6tGkEFH-_RizeCuBf/view?usp=drivesdk",
    "caption": "475164842 1356830075748822 5437923390166382806 n",
    "date": "05/09/2026 09:08"
  },
  {
    "id": "1Tk9X1Hg8SL0NuVz5w9Ae7h6kXeXJdyLb",
    "url": "https://lh3.googleusercontent.com/d/1Tk9X1Hg8SL0NuVz5w9Ae7h6kXeXJdyLb=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1Tk9X1Hg8SL0NuVz5w9Ae7h6kXeXJdyLb=w600",
    "driveUrl": "https://drive.google.com/file/d/1Tk9X1Hg8SL0NuVz5w9Ae7h6kXeXJdyLb/view?usp=drivesdk",
    "caption": "475116469 1356830739082089 1650045069745636096 n",
    "date": "05/09/2026 09:08"
  },
  {
    "id": "1P8tJYeuh_1HQIWfQ5assg6xu08p0YZEN",
    "url": "https://lh3.googleusercontent.com/d/1P8tJYeuh_1HQIWfQ5assg6xu08p0YZEN=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1P8tJYeuh_1HQIWfQ5assg6xu08p0YZEN=w600",
    "driveUrl": "https://drive.google.com/file/d/1P8tJYeuh_1HQIWfQ5assg6xu08p0YZEN/view?usp=drivesdk",
    "caption": "475272178 1356830555748774 2593652870081312031 n",
    "date": "05/09/2026 09:08"
  },
  {
    "id": "19f450ovKABWpZLF4ppEByERh3lBZMoxs",
    "url": "https://lh3.googleusercontent.com/d/19f450ovKABWpZLF4ppEByERh3lBZMoxs=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/19f450ovKABWpZLF4ppEByERh3lBZMoxs=w600",
    "driveUrl": "https://drive.google.com/file/d/19f450ovKABWpZLF4ppEByERh3lBZMoxs/view?usp=drivesdk",
    "caption": "475065642 1356830552415441 2066059058356530555 n",
    "date": "05/09/2026 09:07"
  },
  {
    "id": "1HQRY48oZ8zntDXQtbrsF76k49yMAKyGf",
    "url": "https://lh3.googleusercontent.com/d/1HQRY48oZ8zntDXQtbrsF76k49yMAKyGf=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1HQRY48oZ8zntDXQtbrsF76k49yMAKyGf=w600",
    "driveUrl": "https://drive.google.com/file/d/1HQRY48oZ8zntDXQtbrsF76k49yMAKyGf/view?usp=drivesdk",
    "caption": "475112365 1356830565748773 2148331455199405320 n",
    "date": "05/09/2026 09:07"
  },
  {
    "id": "1E4sa17GBSncH_kHl-sQYg9m9qCI1NQY-",
    "url": "https://lh3.googleusercontent.com/d/1E4sa17GBSncH_kHl-sQYg9m9qCI1NQY-=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1E4sa17GBSncH_kHl-sQYg9m9qCI1NQY-=w600",
    "driveUrl": "https://drive.google.com/file/d/1E4sa17GBSncH_kHl-sQYg9m9qCI1NQY-/view?usp=drivesdk",
    "caption": "474915648 1356830665748763 7088442939443535675 n",
    "date": "05/09/2026 09:06"
  },
  {
    "id": "1NfiNoGcXuesjH5SZxKmTNw98LEfJrkjF",
    "url": "https://lh3.googleusercontent.com/d/1NfiNoGcXuesjH5SZxKmTNw98LEfJrkjF=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1NfiNoGcXuesjH5SZxKmTNw98LEfJrkjF=w600",
    "driveUrl": "https://drive.google.com/file/d/1NfiNoGcXuesjH5SZxKmTNw98LEfJrkjF/view?usp=drivesdk",
    "caption": "475134847 1356830729082090 6973331376706866691 n",
    "date": "05/09/2026 09:06"
  },
  {
    "id": "1UmuSDOZalvtoEuFjUVWQBME3__SlnA9h",
    "url": "https://lh3.googleusercontent.com/d/1UmuSDOZalvtoEuFjUVWQBME3__SlnA9h=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1UmuSDOZalvtoEuFjUVWQBME3__SlnA9h=w600",
    "driveUrl": "https://drive.google.com/file/d/1UmuSDOZalvtoEuFjUVWQBME3__SlnA9h/view?usp=drivesdk",
    "caption": "640949231 26726866320232674 2861436457150474237 n",
    "date": "05/09/2026 09:06"
  },
  {
    "id": "16qTHGfkz6rB0HrWsXMML3_K9Ji89fUaA",
    "url": "https://lh3.googleusercontent.com/d/16qTHGfkz6rB0HrWsXMML3_K9Ji89fUaA=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/16qTHGfkz6rB0HrWsXMML3_K9Ji89fUaA=w600",
    "driveUrl": "https://drive.google.com/file/d/16qTHGfkz6rB0HrWsXMML3_K9Ji89fUaA/view?usp=drivesdk",
    "caption": "499270042 3806814892797839 2072592384911416816 n",
    "date": "05/09/2026 09:06"
  },
  {
    "id": "10yxWan1g7TlbvA1WYiu-lQ8KJMW5zy3K",
    "url": "https://lh3.googleusercontent.com/d/10yxWan1g7TlbvA1WYiu-lQ8KJMW5zy3K=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/10yxWan1g7TlbvA1WYiu-lQ8KJMW5zy3K=w600",
    "driveUrl": "https://drive.google.com/file/d/10yxWan1g7TlbvA1WYiu-lQ8KJMW5zy3K/view?usp=drivesdk",
    "caption": "501748380 3818279548318040 4488756202888224625 n",
    "date": "05/09/2026 09:06"
  },
  {
    "id": "1H1WnZyWGa_IlJXB5K61fhVHva3j9Ayjh",
    "url": "https://lh3.googleusercontent.com/d/1H1WnZyWGa_IlJXB5K61fhVHva3j9Ayjh=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1H1WnZyWGa_IlJXB5K61fhVHva3j9Ayjh=w600",
    "driveUrl": "https://drive.google.com/file/d/1H1WnZyWGa_IlJXB5K61fhVHva3j9Ayjh/view?usp=drivesdk",
    "caption": "500479710 3818279618318033 1462160208812744168 n",
    "date": "05/09/2026 09:06"
  },
  {
    "id": "1c3pxxcTskjZqjjPkdVL7b3d6QdpWSDdO",
    "url": "https://lh3.googleusercontent.com/d/1c3pxxcTskjZqjjPkdVL7b3d6QdpWSDdO=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1c3pxxcTskjZqjjPkdVL7b3d6QdpWSDdO=w600",
    "driveUrl": "https://drive.google.com/file/d/1c3pxxcTskjZqjjPkdVL7b3d6QdpWSDdO/view?usp=drivesdk",
    "caption": "502689037 3823147487831246 7655701400069318099 n",
    "date": "05/09/2026 09:06"
  },
  {
    "id": "1URalctfUl30SRVtpmboOz6lkaMYvAi4C",
    "url": "https://lh3.googleusercontent.com/d/1URalctfUl30SRVtpmboOz6lkaMYvAi4C=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1URalctfUl30SRVtpmboOz6lkaMYvAi4C=w600",
    "driveUrl": "https://drive.google.com/file/d/1URalctfUl30SRVtpmboOz6lkaMYvAi4C/view?usp=drivesdk",
    "caption": "507453999 24185686561024933 8941559406477211526 n",
    "date": "05/09/2026 09:05"
  },
  {
    "id": "1jpkFZucnRceK3QHI-5oFxVDnU4R00vxP",
    "url": "https://lh3.googleusercontent.com/d/1jpkFZucnRceK3QHI-5oFxVDnU4R00vxP=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1jpkFZucnRceK3QHI-5oFxVDnU4R00vxP=w600",
    "driveUrl": "https://drive.google.com/file/d/1jpkFZucnRceK3QHI-5oFxVDnU4R00vxP/view?usp=drivesdk",
    "caption": "490298270 2920829528090347 1483611416095165429 n",
    "date": "05/09/2026 09:05"
  },
  {
    "id": "185bsXQ9hPYEfjl1yRRZKVkIVLoIPSam4",
    "url": "https://lh3.googleusercontent.com/d/185bsXQ9hPYEfjl1yRRZKVkIVLoIPSam4=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/185bsXQ9hPYEfjl1yRRZKVkIVLoIPSam4=w600",
    "driveUrl": "https://drive.google.com/file/d/185bsXQ9hPYEfjl1yRRZKVkIVLoIPSam4/view?usp=drivesdk",
    "caption": "489906562 2920829544757012 1498041119239528231 n",
    "date": "05/09/2026 09:04"
  },
  {
    "id": "15A2sSdUKbxxMcwIfpmpG28BSCRGrBHFx",
    "url": "https://lh3.googleusercontent.com/d/15A2sSdUKbxxMcwIfpmpG28BSCRGrBHFx=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/15A2sSdUKbxxMcwIfpmpG28BSCRGrBHFx=w600",
    "driveUrl": "https://drive.google.com/file/d/15A2sSdUKbxxMcwIfpmpG28BSCRGrBHFx/view?usp=drivesdk",
    "caption": "490652438 2920829568090343 1972879535129963866 n",
    "date": "05/09/2026 09:04"
  },
  {
    "id": "1gxY87iDXK-DM0woyAalC3THJGu6-0Npe",
    "url": "https://lh3.googleusercontent.com/d/1gxY87iDXK-DM0woyAalC3THJGu6-0Npe=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/1gxY87iDXK-DM0woyAalC3THJGu6-0Npe=w600",
    "driveUrl": "https://drive.google.com/file/d/1gxY87iDXK-DM0woyAalC3THJGu6-0Npe/view?usp=drivesdk",
    "caption": "490101062 2920830661423567 2250418056820492208 n",
    "date": "05/09/2026 09:04"
  },
  {
    "id": "16LvD1l6k3fjeKevsqAFH6dZ9bVGWLyf8",
    "url": "https://lh3.googleusercontent.com/d/16LvD1l6k3fjeKevsqAFH6dZ9bVGWLyf8=w1600",
    "thumbnail": "https://lh3.googleusercontent.com/d/16LvD1l6k3fjeKevsqAFH6dZ9bVGWLyf8=w600",
    "driveUrl": "https://drive.google.com/file/d/16LvD1l6k3fjeKevsqAFH6dZ9bVGWLyf8/view?usp=drivesdk",
    "caption": "489947984 2920829594757007 2288825474806937438 n",
    "date": "05/09/2026 09:03"
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

export const INITIAL_EXPENSES_LIST: ExpenseItem[] = [
  {
    id: 'exp-01',
    title: 'Đặt cọc sảnh tiệc Trung Tâm Sự Kiện & Nhà Hàng Prime Thái Nguyên',
    category: 'party',
    amount: 5000000,
    date: '15/08/2026',
    spender: 'Bùi Thành Long',
    recipient: 'Trung Tâm Sự Kiện & Nhà Hàng Prime Thái Nguyên',
    receiptUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80',
    eventScope: 'Kỷ niệm 20 năm',
    note: 'Đặt cọc giữ chỗ sảnh tiệc trưa ngày 27/09/2026 (dự kiến 40-45 suất tiệc VIP)',
    createdAt: '2026-08-15T09:00:00.000Z'
  },
  {
    id: 'exp-02',
    title: 'Đặt may & in ấn 45 áo polo đồng phục 20 năm K8A1',
    category: 'souvenir',
    amount: 6750000,
    date: '20/08/2026',
    spender: 'Huyền Trang B',
    recipient: 'Xưởng may đồng phục Thái Nguyên',
    receiptUrl: 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?auto=format&fit=crop&w=800&q=80',
    eventScope: 'Kỷ niệm 20 năm',
    note: 'May 45 áo polo cá sấu cao cấp thêu logo 20 năm K8A1 theo bảng size đã đăng ký',
    createdAt: '2026-08-20T14:30:00.000Z'
  },
  {
    id: 'exp-03',
    title: 'In ấn Backdrop check-in, sân khấu & 45 Thẻ học sinh lưu niệm',
    category: 'media',
    amount: 2500000,
    date: '28/08/2026',
    spender: 'Nguyễn Tuấn Thành',
    recipient: 'Quảng cáo & In ấn Thái Nguyên',
    receiptUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80',
    eventScope: 'Kỷ niệm 20 năm',
    note: 'Backdrop bạt hiflex căng khung sắt + 45 thẻ học sinh K8A1 kèm dây đeo cổ',
    createdAt: '2026-08-28T16:00:00.000Z'
  },
  {
    id: 'exp-04',
    title: 'Đặt 5 giỏ hoa tươi & quà tặng tri ân Thầy Cô giáo cũ',
    category: 'teacher',
    amount: 3000000,
    date: '01/09/2026',
    spender: 'Hứa Thị Vân Anh',
    recipient: 'Tiệm hoa tươi Thái Nguyên',
    eventScope: 'Kỷ niệm 20 năm',
    note: 'Tri ân thầy cô giáo chủ nhiệm và các thầy cô bộ môn gắn bó cùng lớp K8A1',
    createdAt: '2026-09-01T10:00:00.000Z'
  }
];

export const SPONSORS_LIST: SponsorItem[] = [
  {
    id: 'sp-1',
    name: 'Lê Hoàng Nam',
    className: 'K8A1',
    amount: 300000,
    note: 'Ủng hộ thêm quỹ lớp cho ngày hội ngộ 20 năm thêm tưng bừng',
    date: '02/09/2026'
  },
  {
    id: 'sp-2',
    name: 'Nguyễn Tuấn Anh',
    className: 'K8A1',
    amount: 500000,
    note: 'Góp thêm vào quỹ nước uống & đạo cụ trò chơi anh em',
    date: '01/09/2026'
  }
];

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
  showCorners: true
};

// Danh sách các câu trích dẫn thanh xuân, hoài niệm tuổi học trò K8A1
export const NOSTALGIC_QUOTES: string[] = [
  "Hai mươi năm ngày trở về — Ký ức năm tháng học trò K8A1 vẫn vẹn nguyên như ngày hôm qua.",
  "Thanh xuân như một cơn mưa rào, dẫu có ướt lạnh vẫn muốn đắm mình lần nữa.",
  "Những nụ cười ngây ngô thuở ấy, nay đã hóa thành ký ức vô giá của cuộc đời.",
  "Nắng sân trường THPT Thái Nguyên năm ấy, lưu giữ trọn vẹn những ước mơ tuổi mười tám.",
  "Thời gian có thể trôi mau, nhưng tình bạn tuổi học trò sẽ sống mãi trong tim chúng ta.",
  "Gặp lại nhau sau 20 năm, để thấy tuổi trẻ của chúng ta chưa từng phai nhòa theo năm tháng.",
  "Tháng năm rực rỡ dưới mái trường THPT Thái Nguyên — Nơi thanh xuân chúng ta bắt đầu.",
  "Mỗi bức ảnh là một mảnh ghép hoài niệm, gửi gắm trọn vẹn tình bạn mang tên K8A1.",
  "Áo trắng ngày xưa, tiếng cười ngày cũ — Kho báu vô giá sau hai mươi năm đường đời.",
  "Cảm ơn vì chúng ta đã cùng nhau đi qua những năm tháng thanh xuân tươi đẹp nhất!"
];

/**
 * Lấy câu chú thích hoài niệm thay thế cho tên file ảnh kỹ thuật số
 */
export function getNostalgicPhotoCaption(index: number, customCaption?: string): string {
  if (customCaption) {
    const trimmed = customCaption.trim();
    // Loại bỏ các chuỗi tên file máy ảnh, timestamp, hash ngẫu nhiên
    const isMachineName = /^(img|image|dsc|photo|pasted|screenshot|178\d+|[0-9a-f]{16,}|[\d\s_.-]{10,})/i.test(trimmed) 
      || trimmed.includes('9527bee86c')
      || /^\d{10,}/.test(trimmed);
    if (!isMachineName && trimmed.length > 0) {
      return trimmed;
    }
  }
  return NOSTALGIC_QUOTES[Math.abs(index) % NOSTALGIC_QUOTES.length];
}

export const DEFAULT_EVENT_CONFIG: EventConfig = {
  eventTitle: "20 Năm Ngày Trở Về",
  eventSubtitle: "Lớp K8A1 — Trường THPT Thái Nguyên",
  eventDateText: "Chủ Nhật, 27/09/2026 (08:30 — 15:30)",
  eventTimeText: "Từ 08:30 Sáng — Chủ Nhật, ngày 27/09/2026",
  countdownTarget: "2026-09-27T08:30:00+07:00",

  // Chặng 1: Trường THPT Thái Nguyên
  venueName: "Trường THPT Thái Nguyên",
  venueSubtitle: "Chặng 1: Đón tiếp nhận áo, thăm trường xưa, chụp ảnh lưu niệm & tri ân Thầy Cô",
  venueAddress: "Số 127 đường Lương Thế Vinh, P. Quang Trung, TP. Thái Nguyên, Tỉnh Thái Nguyên",
  shortAddress: "127 Lương Thế Vinh, TP. Thái Nguyên",
  venueTime: "08:30 — 11:00 (Sáng)",
  venueActivity: "Đón tiếp nhận áo polo • Thẻ kỷ niệm • Thăm lớp học xưa • Chụp ảnh lưu niệm sân trường • Tri ân Thầy Cô",
  mapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3710.2798642279267!2d105.8285514!3d21.5740443!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135272a24921915%3A0xe543df5e9e03fa54!2zVHLGsOG7nW5nIFRIUFQgVGjDoWkgTmd1ecOqbg!5e0!3m2!1svi!2svn!4v1710000000000!5m2!1svi!2svn",
  mapDirectUrl: "https://www.google.com/maps/search/?api=1&query=Tr%C6%B0%E1%BB%9Dng+THPT+Th%C3%A1i+Nguy%C3%AAn,+127+L%C6%B0%C6%A1ng+Th%E1%BA%BF+Vinh,+Th%C3%A1i+Nguy%C3%AAn",

  // Chặng 2: Nhà Hàng & Trung Tâm Sự Kiện Prime Thái Nguyên (Mặc định tắt theo cấu hình Google Sheet)
  enableTwoVenues: false,
  venue2Name: "Trung Tâm Sự Kiện & Nhà Hàng Prime Thái Nguyên",
  venue2Subtitle: "Chặng 2: Khai tiệc liên hoan, giao lưu văn nghệ & trao kỷ vật hội ngộ",
  venue2Address: "Số 1 đường Hoàng Văn Thụ, P. Phan Đình Phùng, TP. Thái Nguyên, Tỉnh Thái Nguyên",
  venue2ShortAddress: "Số 1 Hoàng Văn Thụ, TP. Thái Nguyên",
  venue2Time: "11:30 — 15:30 (Trưa & Chiều)",
  venue2Activity: "Khai tiệc liên hoan • Nâng ly chúc mừng 20 năm • Giao lưu âm nhạc & Chuyện đời tri kỷ",
  venue2MapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d600!2d105.8386089!3d21.5949009!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x52211cf3f4926b%3A0x6de9f091b88c49ab!2sTh%C3%A1p%20%C4%91%C3%B4i%20Prime%20Th%C3%A1i%20Nguy%C3%AAn!5e1!3m2!1svi!2svn!4v1725550000000!5m2!1svi!2svn",
  venue2MapDirectUrl: "https://maps.app.goo.gl/a3utiYosZqGHKDjYA",
  routeDistanceText: "~1.5km (Di chuyển 5 - 10 phút)",
  routeDirectUrl: "https://www.google.com/maps/dir/?api=1&origin=Tr%C6%B0%E1%BB%9Dng+THPT+Th%C3%A1i+Nguy%C3%AAn,+127+L%C6%B0%C6%A1ng+Th%E1%BA%BF+Vinh,+Th%C3%A1i+Nguy%C3%AAn&destination=Th%C3%A1p+%C4%91%C3%B4i+Prime+Th%C3%A1i+Nguy%C3%AAn,+S%E1%BB%91+1+Ho%C3%A0ng+V%C4%83n+Th%E1%BB%A5,+Th%C3%A1i+Nguy%C3%AAn",

  letterTitle: "Lời Ngỏ Thân Tình Gửi Bạn Tôi — Lớp K8A1",
  letterSubtitle: "Hai mươi năm một chặng đường — Nơi ký ức thanh xuân THPT Thái Nguyên mãi vẹn nguyên",
  letterParagraph1: "Hai mươi năm — một chặng đường đủ dài để mỗi thành viên Lớp K8A1 (Khóa 8) chúng ta trưởng thành, gây dựng sự nghiệp và vun vén cho những tổ ấm riêng. Dù hôm nay mỗi người mỗi ngả, bộn bề với những lo toan cuộc sống, nhưng sâu thẳm trong tim mỗi chúng ta vẫn luôn vẹn nguyên một ngăn ký ức thiêng liêng dành cho những năm tháng cấp 3 rực rỡ dưới mái trường THPT Thái Nguyên thân thương.",
  letterParagraph2: "Hãy tạm gác lại những bộn bề âu lo, cùng trở về mái trường xưa và nâng ly hội ngộ để gặp lại những gương mặt thanh xuân năm nào, cùng viết tiếp câu chuyện tình bạn đẹp đẽ của Lớp K8A1 chúng mình!",
  letterSignatureTitle: "Ban Liên Lạc Lớp K8A1 (Khóa 8)",
  letterSignatureSubtitle: "Trường THPT Thái Nguyên (2003 — 2006)",
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
  backdrops: DEFAULT_BACKDROPS,
  musicPlaylist: DEFAULT_PLAYLIST,
  stageSettings: DEFAULT_STAGE_SETTINGS
};

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
 * 🔐 BẢO MẬT XÁC THỰC MÃ PIN CLIENT & SERVER (SHA-256 + GOOGLE APPS SCRIPT)
 * ============================================================================
 */
const SALT_PIN = 'k8a1_2026_secure_salt_';

export async function hashPinWithSalt(pin: string): Promise<string> {
  const clean = String(pin || '').trim();
  try {
    if (typeof crypto !== 'undefined' && crypto.subtle) {
      const msgUint8 = new TextEncoder().encode(SALT_PIN + clean);
      const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
  } catch (e) {}
  // Basic fallback if crypto.subtle is unavailable
  let hash = 0;
  const str = SALT_PIN + clean;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return String(hash);
}

// Băm mật mã SHA-256 dự phòng ngoại tuyến (Tuyệt đối không lưu số thô trong source code)
export const OFFLINE_PIN_HASHES = {
  admin: '2ab5884752e41a50371f5c94a5e9dcd5ae6afcfd44f260b8537658fa0ee698af',
  treasurer: '80b1cb0fcdaabeb4ecaf7a38408205a1752a480009f59abe79aa03fab60e0b63',
  bll: '098bb9c2c2bf457738976a8b3fe99c535151ae8759d3e4161558ddd25f65845f'
};

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

  // 1. Thử xác thực trực tuyến qua Google Apps Script / Google Sheets
  if (targetUrl && !targetUrl.includes('YOUR_NEW_DEPLOYMENT_ID')) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

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
      // Fallback qua GET nếu POST bị mạng/CORS can thiệp
      try {
        const getRes = await fetch(`${targetUrl}?action=verify_pin&pin=${encodeURIComponent(cleanPin)}&t=${Date.now()}`);
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
        console.warn('Backend PIN check failed, using secure offline hash fallback:', getErr);
      }
    }
  }

  // 2. Chế độ dự phòng Ngoại tuyến (Offline): So sánh chuỗi băm SHA-256 (không để lộ mã thô)
  const hashed = await hashPinWithSalt(cleanPin);
  if (hashed === OFFLINE_PIN_HASHES.admin) {
    return { success: true, role: 'admin' };
  }
  if (hashed === OFFLINE_PIN_HASHES.treasurer) {
    return { success: true, role: 'treasurer' };
  }
  if (hashed === OFFLINE_PIN_HASHES.bll) {
    return { success: true, role: 'bll' };
  }

  return { success: false, message: 'Mã PIN không đúng! Vui lòng thử lại.' };
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



