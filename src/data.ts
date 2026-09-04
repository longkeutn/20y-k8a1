import { 
  MemoryImage, 
  MemoryVideo, 
  RsvpData, 
  WishData, 
  TeacherData, 
  TeacherTribute, 
  TimelineMilestone, 
  QuizQuestion, 
  PollItem, 
  ScheduleItem, 
  SponsorItem, 
  AlumniRegion 
} from './types';

export const INITIAL_RSVP_LIST: RsvpData[] = [
  {
    id: '1',
    fullName: 'Nguyễn Minh Anh',
    nickname: 'Anh Còi',
    phone: '0901234567',
    status: 'yes',
    className: 'K8A1 (Lớp trưởng)',
    shirtSize: 'L',
    message: 'Nhất định phải có mặt đông đủ nha cả lớp K8A1 ơi! Tròn đúng 20 năm rồi!',
    submittedAt: '2026-09-04 08:30',
    checkedIn: true,
    checkedInAt: '08:45'
  },
  {
    id: '2',
    fullName: 'Trần Thị Mai',
    nickname: 'Mai Tồ',
    phone: '0912345678',
    status: 'yes',
    className: 'K8A1',
    shirtSize: 'M',
    message: 'Nôn nao quá, nhớ lớp A1 Khóa 8 THPT Thái Nguyên thân yêu niên khóa 2003-2006.',
    submittedAt: '2026-09-04 09:15',
    checkedIn: false
  },
  {
    id: '3',
    fullName: 'Lê Hoàng Nam',
    nickname: 'Nam Cận',
    phone: '0987654321',
    status: 'no',
    className: 'K8A1',
    shirtSize: 'XL',
    message: 'Tiếc quá đợt 27/9 mình đang đi công tác nước ngoài không về kịp Crown Palace. Chúc lớp K8A1 mình hội ngộ thật vui!',
    submittedAt: '2026-09-04 10:02',
    checkedIn: false
  },
  {
    id: '4',
    fullName: 'Hoàng Kim Yến',
    nickname: 'Yến Nhỏ',
    phone: '0933221100',
    status: 'yes',
    className: 'K8A1',
    shirtSize: 'S',
    message: 'Hẹn gặp lại các bạn A1 thân yêu sau 2 thập kỷ tại Crown Palace!',
    submittedAt: '2026-09-04 11:20',
    checkedIn: false
  },
  {
    id: '5',
    fullName: 'Vũ Đức Trọng',
    nickname: 'Trọng Béo',
    phone: '0944556677',
    status: 'yes',
    className: 'K8A1',
    shirtSize: 'XL',
    message: 'Đã sẵn sàng bay về Thái Nguyên bùng nổ cùng anh em A1!',
    submittedAt: '2026-09-04 12:45',
    checkedIn: true,
    checkedInAt: '08:52'
  }
];

export const TEACHERS_LIST: TeacherData[] = [
  {
    id: 't-1',
    name: 'Thầy Nguyễn Văn Thành',
    role: 'Hiệu Trưởng Danh Dự',
    subject: 'Nguyên Hiệu trưởng trường (2000 - 2010)',
    status: 'attending',
    quote: '20 năm trôi qua, các em từ những cô cậu học trò ngây thơ nay đã thành đạt, vững vàng trong cuộc sống. Thầy rất tự hào và xúc động được gặp lại khóa 2003 - 2006!',
    avatarUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=400&auto=format&fit=crop'
  },
  {
    id: 't-2',
    name: 'Cô Trần Thị Hương Ly',
    role: 'Giáo Viên Chủ Nhiệm 12A1',
    subject: 'Môn Toán học',
    status: 'attending',
    quote: 'Vẫn nhớ như in góc bàn đầu nghịch ngợm của lớp 12A1. Hẹn gặp lại các cô cậu trò nhỏ của cô tại Sen Tây Hồ nhé!',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400&auto=format&fit=crop'
  },
  {
    id: 't-3',
    name: 'Thầy Lê Quang Đạt',
    role: 'Giáo Viên Bộ Môn',
    subject: 'Môn Ngữ Văn',
    status: 'attending',
    quote: 'Mỗi mùa phượng nở là một chuyến đò qua sông. 20 năm là một chặng đò dài chở đầy hoài niệm yêu thương.',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop'
  },
  {
    id: 't-4',
    name: 'Cô Phạm Thị Mai',
    role: 'Giáo Viên Bộ Môn',
    subject: 'Môn Tiếng Anh',
    status: 'wishing',
    quote: 'Cô hiện đang giảng dạy ở xa không về kịp, nhưng trái tim cô luôn hướng về niên khóa 2003 - 2006. Chúc buổi hội khóa thành công rực rỡ!',
    avatarUrl: 'https://images.unsplash.com/photo-1580894732444-8ecded7900cd?q=80&w=400&auto=format&fit=crop'
  }
];

export const INITIAL_TEACHER_TRIBUTES: TeacherTribute[] = [
  {
    id: 'tr-1',
    teacherName: 'Cô Trần Thị Hương Ly',
    studentName: 'Đặng Thanh Vân',
    className: '12A1',
    message: 'Kính chúc Cô luôn an vui, dồi dào sức khỏe! Nhờ có những bài toán khó và tình yêu thương bao dung của Cô mà chúng em đã trưởng thành như hôm nay.',
    submittedAt: '04/09/2026 10:30',
    likes: 24
  },
  {
    id: 'tr-2',
    teacherName: 'Thầy Lê Quang Đạt',
    studentName: 'Phạm Quốc Bảo',
    className: '12A1',
    message: 'Thầy ơi, những bài giảng Văn trầm ấm và những vần thơ thầy đọc năm ấy vẫn theo em suốt hành trình cuộc đời. Kính mong thầy giữ gìn sức khỏe!',
    submittedAt: '04/09/2026 11:15',
    likes: 19
  }
];

export const NOSTALGIA_TIMELINE: TimelineMilestone[] = [
  {
    id: 'ml-1',
    year: '2003',
    period: 'Tháng 09/2003',
    title: 'Tựu Trường & Bỡ Ngỡ Lớp 10',
    description: 'Những gương mặt ngây thơ từ khắp các trường THCS hội tụ về dưới mái trường chung. Chiếc áo trắng tinh khôi và những ánh mắt bẽn lẽn làm quen.',
    tag: 'Bắt đầu hành trình',
    imageUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: 'ml-2',
    year: '2004',
    period: 'Tháng 03/2004',
    title: 'Hội Trại Thanh Niên & Tiếng Hò Reo',
    description: 'Dựng trại bằng tre nứa, trang trí cổng trại xuyên đêm, thi đấu kéo co và tiếng reo hò rộn rã sân trường dưới nắng xuân rực rỡ.',
    tag: 'Nhiệt huyết thanh xuân',
    imageUrl: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: 'ml-3',
    year: '2005',
    period: 'Tháng 10/2005',
    title: 'Chuyến Đi Dã Ngoại Cuối Cấp',
    description: 'Chuyến xe chở đầy ắp tiếng hát, những chiếc máy nghe nhạc MP3 chuyền tay nhau, bánh mỳ chia đôi và bao câu chuyện bí mật tuổi ô mai.',
    tag: 'Gắn kết tình bạn',
    imageUrl: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: 'ml-4',
    year: '2006',
    period: 'Tháng 05/2006',
    title: 'Tiếng Ve Bế Giảng & Mực Tím Lưu Bút',
    description: 'Giờ phút chia tay nghẹn ngào, áo trắng kín chữ ký của bạn bè và lời dặn dò của thầy cô. Tạm biệt thời áo trắng để bước vào ngưỡng cửa đại học.',
    tag: 'Mùa hoa phượng đỏ',
    imageUrl: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: 'ml-5',
    year: '2006 - 2026',
    period: 'Chặng Đường 20 Năm',
    title: 'Bay Đi Muôn Phương & Trưởng Thành',
    description: 'Mỗi người một lối rẽ, một phương trời lập nghiệp. Đã là những người cha, người mẹ, những kỹ sư, bác sĩ, doanh nhân... nhưng ký ức tuổi 18 vẫn nguyên vẹn.',
    tag: 'Hành trình cuộc đời',
    imageUrl: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: 'ml-6',
    year: '2026',
    period: '27/09/2026',
    title: 'Hội Ngộ 20 Năm Lớp K8A1 — 20 Năm Ngày Trở Về',
    description: 'Trở về hội ngộ cùng bạn bè Lớp K8A1 tại Crown Palace Thái Nguyên để thấy mình vẫn là những cô cậu học trò A1 năm nào. Cùng cười, cùng ôn lại kỷ niệm tươi đẹp nhất thời niên thiếu.',
    tag: 'Ngày hội ngộ bạn bè',
    imageUrl: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?q=80&w=600&auto=format&fit=crop'
  }
];

export const NOSTALGIA_QUIZ: QuizQuestion[] = [
  {
    id: 1,
    question: 'Bác bảo vệ trường năm ấy thường đánh hồi trống vào lớp vào đúng mấy giờ sáng?',
    options: ['06:45', '07:00', '07:15', '07:30'],
    correctIndex: 1,
    explanation: 'Tiếng trống 07:00 vang lên giòn giã là lúc bao bạn học đạp xe cuống cuồng qua cổng trường!'
  },
  {
    id: 2,
    question: 'Món ăn vặt "huyền thoại" cổng trường mà hội con gái mê mẩn nhất thời 2003 - 2006 là món gì?',
    options: ['Bò bía ngọt & kem ốc quế', 'Trà sữa trân châu đường đen', 'Bánh tráng nướng Đà Lạt', 'Gà rán phô mai'],
    correctIndex: 0,
    explanation: 'Thời 2003-2006, bò bía ngọt 1.000đ/chiếc và que kem ốc quế mát lạnh là cả một bầu trời thương nhớ!'
  },
  {
    id: 3,
    question: 'Bài hát nào thường vang lên trong các buổi văn nghệ bế giảng chia tay năm 2006?',
    options: ['Mong Ước Kỷ Niệm Xưa', 'Tạm Biệt Nhé', 'Thời Học Sinh', 'Nhớ Về Hà Nội'],
    correctIndex: 0,
    explanation: '"Nếu có ước muốn trong cuộc đời này, hãy nhớ ước muốn cho thời gian trở lại..." - bản tình ca bất hủ!'
  },
  {
    id: 4,
    question: 'Thiết bị công nghệ nào "sành điệu" nhất được chuyền tay nhau nghe nhạc trong giờ ra chơi năm 2005 - 2006?',
    options: ['Máy nghe nhạc MP3 USB vỏ nhôm / iPod Shuffle', 'iPhone 15 Pro Max', 'Tai nghe Bluetooth không dây', 'Đồng hồ thông minh Smartwatch'],
    correctIndex: 0,
    explanation: 'Chiếc MP3 cắm cổng USB chép nhạc 128MB hay 256MB chia đôi tai nghe nghe bài hát của Đan Trường, Mỹ Tâm!'
  },
  {
    id: 5,
    question: 'Trò chơi dân gian / thể thao nào khiến các bạn nam ướt đẫm mồ hôi mỗi giờ ra chơi 15 phút?',
    options: ['Đá cầu chinh & bóng đá mini sân cát', 'Chơi game thực tế ảo', 'Bắn cung thể thao', 'Bóng rổ chuyên nghiệp'],
    correctIndex: 0,
    explanation: 'Chỉ 15 phút ra chơi ngắn ngủi nhưng vòng tròn đá cầu chinh hay trận bóng đá mini luôn sôi nổi tột cùng!'
  }
];

export const INITIAL_POLLS: PollItem[] = [
  {
    id: 'poll-1',
    question: 'Theo bạn, sau 20 năm ai trong lớp K8A1 vẫn là "Cây hài huyền thoại" vui tính nhất?',
    options: [
      { id: 'opt-1', text: 'Tuấn "Béo" - Nói câu nào cười lăn câu đó', votes: 28 },
      { id: 'opt-2', text: 'Nam "Cận" - Mặt nghiêm túc nhưng phát ngôn siêu hài', votes: 22 },
      { id: 'opt-3', text: 'Linh "Tồ" - Nụ cười rạng rỡ lan tỏa năng lượng tích cực', votes: 16 },
      { id: 'opt-4', text: 'Cả lớp K8A1 ai cũng là danh hài tiềm năng!', votes: 35 }
    ]
  },
  {
    id: 'poll-2',
    question: 'Góc kỷ niệm học trò nào của Lớp A1 (Khóa 8) Trường THPT Thái Nguyên làm bạn bồi hồi nhất?',
    options: [
      { id: 'opt-21', text: 'Cùng nhau chia nhau ổ bánh mì và bịch me cổng trường THPT Thái Nguyên', votes: 42 },
      { id: 'opt-22', text: 'Những đêm dựng trại, đốt lửa hội trại 26/3 của Khóa 8', votes: 36 },
      { id: 'opt-23', text: 'Dãy bàn cuối cùng những trò nghịch ngợm không thể nào quên', votes: 31 },
      { id: 'opt-24', text: 'Dòng lưu bút mực tím chuyền tay nhau ngày bế giảng 2006', votes: 49 }
    ]
  },
  {
    id: 'poll-3',
    question: 'Hoạt động bạn mong chờ nhất trong ngày Hội Ngộ 27/9 tại Crown Palace Thái Nguyên?',
    options: [
      { id: 'opt-31', text: 'Gặp lại và ôm chầm lấy những người bạn thân sau 2 thập kỷ', votes: 44 },
      { id: 'opt-32', text: 'Chụp bộ ảnh thanh xuân với áo đồng phục kỷ niệm K8A1', votes: 35 },
      { id: 'opt-33', text: 'Nâng ly chúc mừng và thưởng thức tiệc tại Crown Palace', votes: 48 },
      { id: 'opt-34', text: 'Ngồi cafe hàn huyên, tâm sự chuyện đời sau 20 năm', votes: 38 }
    ]
  }
];

export const EVENT_SCHEDULE: ScheduleItem[] = [
  {
    time: '08:30 — 09:15',
    title: 'Đón Tiếp, Check-in & Chụp Ảnh Kỷ Niệm Bạn Bè K8A1',
    desc: 'Đón tiếp các thành viên Lớp K8A1, nhận Thẻ Học Sinh kỷ niệm & Áo đồng phục 20 năm, ký tên lên Bảng Kỷ Niệm và chụp ảnh lưu niệm tại Photobooth thanh xuân.',
    location: 'Sảnh chính & Photobooth Crown Palace'
  },
  {
    time: '09:15 — 10:15',
    title: 'Khai Mạc Hội Ngộ & Thước Phim Ký Ức 20 Năm K8A1',
    desc: 'Tuyên bố lý do ngày hội ngộ 20 năm, điểm danh các thành viên K8A1, trình chiếu video phóng sự ảnh "20 Năm Ngày Trở Về - K8A1 THPT Thái Nguyên" và các bạn thành viên chia sẻ cảm xúc.',
    location: 'Sân khấu Sảnh Tiệc Crown Palace'
  },
  {
    time: '10:15 — 11:30',
    title: 'Minigame Kết Nối K8A1 & Chụp Ảnh Tập Thể Lớp',
    desc: 'Gameshow vui nhộn "Ai còn nhớ ai", "Chuyện xưa giờ mới kể", trắc nghiệm ký ức lớp A1 và cùng nhau chụp bức hình đại gia đình K8A1 sau 20 năm ngày ra trường.',
    location: 'Khu vực sân khấu & Hội trường'
  },
  {
    time: '11:30 — 13:30',
    title: 'Khai Tiệc Liên Hoan Ấm Cúng & Giao Lưu Âm Nhạc',
    desc: 'Thưởng thức thực đơn tiệc mừng tại Crown Palace Thái Nguyên, cùng nâng ly chúc mừng 20 năm tình bạn gắn kết và thưởng thức các tiết mục văn nghệ acoustic cây nhà lá vườn.',
    location: 'Không gian tiệc Crown Palace'
  },
  {
    time: '13:30 — 15:30',
    title: 'Cafe Tâm Sự, Hàn Huyên & Lên Kế Hoạch Tương Lai',
    desc: 'Thảnh thơi ngồi bên tách cafe, tâm sự về gia đình, công việc, chia sẻ kỷ niệm và cùng thống nhất kế hoạch gặp mặt định kỳ hàng năm của Lớp K8A1.',
    location: 'Không gian Lounge Cafe Crown Palace'
  }
];

export const SPONSORS_LIST: SponsorItem[] = [
  {
    id: 'sp-1',
    name: 'Nhóm Cựu Học Sinh K8A1',
    className: 'K8A1',
    amount: 5000000,
    note: 'Ủng hộ chi phí Backdrop chụp hình và quà tặng kỷ niệm lớp',
    date: '01/09/2026'
  },
  {
    id: 'sp-2',
    name: 'Bạn Nguyễn Minh Anh & Gia đình',
    className: 'Lớp trưởng K8A1',
    amount: 4000000,
    note: 'Ủng hộ kinh phí may áo đồng phục kỷ niệm 20 năm cho các bạn',
    date: '02/09/2026'
  },
  {
    id: 'sp-3',
    name: 'Nhóm Bạn K8A1 Hà Nội',
    className: 'K8A1',
    amount: 6000000,
    note: 'Tài trợ hệ thống âm thanh, ánh sáng và nhạc cụ giao lưu',
    date: '03/09/2026'
  },
  {
    id: 'sp-4',
    name: 'Nhóm Bạn K8A1 Thái Nguyên',
    className: 'K8A1',
    amount: 5000000,
    note: 'Tài trợ chi phí in ấn thẻ học sinh, phóng sự ảnh và video lưu niệm',
    date: '04/09/2026'
  }
];

export const ALUMNI_DISTRIBUTION: AlumniRegion[] = [
  {
    id: 'reg-tn',
    regionName: 'TP. Thái Nguyên & Khu Vực Lân Cận',
    count: 28,
    membersHighlight: ['Minh Anh (Lớp trưởng)', 'Thanh Vân', 'Quốc Bảo', 'Hải Yến'],
    note: 'Lực lượng nòng cốt tại quê nhà chuẩn bị chu đáo sảnh tiệc Crown Palace đón bạn bè!'
  },
  {
    id: 'reg-hn',
    regionName: 'Hà Nội & Các Tỉnh Phía Bắc',
    count: 12,
    membersHighlight: ['Đức Trọng', 'Thu Thảo', 'Hoàng Long'],
    note: 'Đã lập nhóm xe chung từ Hà Nội về Thái Nguyên vào sáng ngày 27/9.'
  },
  {
    id: 'reg-south',
    regionName: 'TP. Hồ Chí Minh & Các Tỉnh Miền Nam',
    count: 5,
    membersHighlight: ['Bảo Ngọc', 'Văn Hưng', 'Thành Đạt'],
    note: 'Đã đặt vé máy bay ra Nội Bài trước 1 ngày để kịp về dự cùng lớp.'
  },
  {
    id: 'reg-intl',
    regionName: 'Hải Ngoại & Đang Công Tác Xa',
    count: 3,
    membersHighlight: ['Hoàng Nam (Nhật Bản)', 'Khánh Linh (Úc)'],
    note: 'Dù ở xa nhưng luôn hướng về lớp A1 và gửi lời chúc mừng kết nối qua video call.'
  }
];

export const INITIAL_WISHES_LIST: WishData[] = [
  {
    id: 'wish-1',
    fullName: 'Đặng Thanh Vân',
    className: 'K8A1',
    message: 'Hai mươi năm rồi mới lại có dịp ngồi lại bên nhau đông đủ như thế này! Chúc đại gia đình K8A1 Trường THPT Thái Nguyên luôn tràn đầy niềm vui, thành công và mãi giữ tinh thần đoàn kết!',
    tag: '🎓 Tự hào K8A1',
    likes: 18,
    submittedAt: '04/09/2026 09:20'
  },
  {
    id: 'wish-2',
    fullName: 'Phạm Quốc Bảo',
    className: 'K8A1',
    message: 'Hẹn gặp lại tất cả các bạn lớp A1 vào sáng 27/9 tại Crown Palace nhé! Cảm ơn Ban Cán Sự Lớp đã nhiệt tình kết nối bạn bè sau 20 năm.',
    tag: '❤️ Tình bạn 20 năm',
    likes: 14,
    submittedAt: '04/09/2026 10:15'
  },
  {
    id: 'wish-3',
    fullName: 'Vũ Thúy Hằng',
    className: 'K8A1',
    message: 'Mãi mãi một tình yêu với K8A1 THPT Thái Nguyên! Nhớ từng nụ cười, từng trò nghịch ngợm thời áo trắng.',
    tag: '🌸 Kỷ niệm thanh xuân',
    likes: 16,
    submittedAt: '04/09/2026 11:30'
  }
];

export const DEFAULT_MEMORIES: MemoryImage[] = [
  {
    id: 'img1',
    url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=800&auto=format&fit=crop',
    caption: 'Mái trường xưa ngói đỏ rêu phong, nơi lưu dấu thanh xuân rực rỡ.',
    date: 'Tháng 5, 2006'
  },
  {
    id: 'img2',
    url: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=800&auto=format&fit=crop',
    caption: 'Bản tin lớp đầy hoa phượng vĩ và những dòng lưu bút viết vội.',
    date: 'Tháng 6, 2006'
  },
  {
    id: 'img3',
    url: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?q=80&w=800&auto=format&fit=crop',
    caption: 'Nhóm bạn thân cùng chiếc xe đạp cọc cạch những buổi tan trường.',
    date: 'Niên khóa 2003-2006'
  },
  {
    id: 'img4',
    url: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=800&auto=format&fit=crop',
    caption: 'Bảng đen rực rỡ nét phấn trắng, ghi lại những ước mơ thuở học trò.',
    date: 'Tháng 4, 2006'
  }
];

export const DEFAULT_VIDEOS: MemoryVideo[] = [
  {
    id: 'vid1',
    title: 'Thước phim kỷ niệm ngày ra trường - Niên khóa 2003-2006',
    embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' // Fallback youtube, will instruct how to use Google Drive
  }
];

export const GOOGLE_APPS_SCRIPT_CODE = `/**
 * GOOGLE APPS SCRIPT (Code.gs)
 * Phục vụ Sự kiện "Hội ngộ 20 năm - Chuyến đi thanh xuân"
 * 
 * Hướng dẫn: Gắn script này vào Container-bound Script của Google Sheet.
 * Xem hướng dẫn chi tiết từng bước ở phần "Admin Panel" trên giao diện Web App.
 */

const CONFIG = {
  // Thay thế bằng ID thư mục Google Drive của bạn (nơi lưu ảnh kỷ niệm)
  DRIVE_FOLDER_ID: "1sQg-XNUTIdJITSIdoiIGai-7cari7xBz",
  // Tên trang tính lưu RSVP đăng ký tham dự
  RSVP_SHEET_NAME: "Trang_tinh_1", 
  // Tên trang tính riêng biệt lưu Lời chúc & Sổ lưu bút (Wishes & Comments)
  WISHES_SHEET_NAME: "Loi_Chuc",
  // Tên trang tính lưu Lượt truy cập (View Counter)
  VIEW_COUNTER_SHEET_NAME: "Luot_Truy_Cap"
};

// Cấu hình CORS để cho phép yêu cầu từ Web App
function handleResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeader('Access-Control-Allow-Origin', '*')
    .setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    .setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

// Xử lý yêu cầu preflight OPTIONS cho CORS
function doOptions(e) {
  return handleResponse({ status: "success", message: "CORS preflight ok" });
}

/**
 * API GET: Trả về dữ liệu RSVP, Lời chúc, hoặc Ảnh Drive
 */
function doGet(e) {
  try {
    const action = e.parameter.action;
    
    if (action === 'get_photos') {
      return handleResponse(getDrivePhotos());
    }
    
    if (action === 'get_wishes') {
      return handleResponse(getWishesList());
    }

    if (action === 'get_confirmed_attendees') {
      return handleResponse(getConfirmedAttendees());
    }

    if (action === 'get_view_count') {
      return handleResponse(getViewCount());
    }

    if (action === 'record_view' || action === 'hit_view') {
      return handleResponse(recordPageView());
    }
    
    // Mặc định trả về toàn bộ danh sách RSVP
    return handleResponse(getRSVPList());
  } catch (err) {
    return handleResponse({ status: 'error', message: err.toString() });
  }
}

/**
 * API POST: Nhận dữ liệu RSVP, Lời chúc mừng, hoặc File ảnh tải lên
 */
function doPost(e) {
  try {
    let postData;
    if (e.postData && e.postData.contents) {
      try {
        postData = JSON.parse(e.postData.contents);
      } catch (ex) {
        postData = e.parameter;
      }
    } else {
      postData = e.parameter;
    }

    const action = postData.action;

    if (action === 'record_view' || action === 'hit_view') {
      return handleResponse(recordPageView());
    }

    if (action === 'upload_photo') {
      return handleResponse(uploadPhotoToDrive(postData));
    }

    if (action === 'add_wish') {
      return handleResponse(saveWish(postData));
    }

    if (action === 'rsvp') {
      return handleResponse(saveRSVP(postData));
    }

    if (postData.fullName && postData.phone) {
      return handleResponse(saveRSVP(postData));
    }

    return handleResponse({ status: 'error', message: 'Hành động không hợp lệ!' });
  } catch (err) {
    return handleResponse({ status: 'error', message: err.toString() });
  }
}

/**
 * Lấy danh sách RSVP từ Google Sheet
 */
function getRSVPList() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.RSVP_SHEET_NAME) || ss.getSheets()[0];
  
  const rows = sheet.getDataRange().getValues();
  if (rows.length <= 1) {
    return { status: 'success', data: [] };
  }

  const headers = rows[0];
  const list = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const rsvp = {};
    headers.forEach((header, index) => {
      let key = header.toString().trim();
      if (key === 'Họ tên') rsvp.fullName = row[index];
      else if (key === 'Số điện thoại') rsvp.phone = row[index];
      else if (key === 'Tình trạng') rsvp.status = row[index] === 'Có tham gia' ? 'yes' : 'no';
      else if (key === 'Lời nhắn') rsvp.message = row[index];
      else if (key === 'Thời gian gửi') rsvp.submittedAt = formatDate(row[index]);
      else rsvp[key] = row[index];
    });
    list.push(rsvp);
  }

  return { status: 'success', data: list };
}

/**
 * Lấy danh sách NHỮNG NGƯỜI ĐÃ XÁC NHẬN THAM DỰ (status = yes)
 */
function getConfirmedAttendees() {
  const fullResult = getRSVPList();
  if (fullResult.status !== 'success') return fullResult;
  
  const confirmed = (fullResult.data || []).filter(function(item) {
    return item.status === 'yes';
  });

  return { status: 'success', count: confirmed.length, data: confirmed };
}

/**
 * Lưu đăng ký RSVP mới vào Google Sheet
 */
function saveRSVP(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(CONFIG.RSVP_SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.RSVP_SHEET_NAME);
  }
  
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['Họ tên', 'Số điện thoại', 'Tình trạng', 'Lời nhắn', 'Thời gian gửi']);
  }

  const fullName = data.fullName || '';
  const phone = data.phone || '';
  const statusStr = data.status === 'yes' ? 'Có tham gia' : 'Rất tiếc không thể đến';
  const message = data.message || '';
  const timestamp = new Date();

  // Kiểm tra trùng lặp theo số điện thoại
  const range = sheet.getDataRange();
  const values = range.getValues();
  let updatedRowIndex = -1;

  for (let i = 1; i < values.length; i++) {
    if (values[i][1].toString().trim() === phone.toString().trim()) {
      updatedRowIndex = i + 1;
      break;
    }
  }

  if (updatedRowIndex > -1) {
    sheet.getRange(updatedRowIndex, 1).setValue(fullName);
    sheet.getRange(updatedRowIndex, 3).setValue(statusStr);
    sheet.getRange(updatedRowIndex, 4).setValue(message);
    sheet.getRange(updatedRowIndex, 5).setValue(timestamp);
  } else {
    sheet.appendRow([fullName, phone, statusStr, message, timestamp]);
  }

  return { 
    status: 'success', 
    message: updatedRowIndex > -1 ? 'Cập nhật đăng ký thành công!' : 'Gửi đăng ký RSVP thành công!' 
  };
}

/**
 * =========================================================================
 * MODULE: SỔ LƯU BÚT & LỜI CHÚC MỪNG (LƯU TRỮ TRONG SHEET RIÊNG BIỆT)
 * =========================================================================
 */

/**
 * Lấy danh sách Lời chúc từ Sheet riêng ("Loi_Chuc")
 */
function getWishesList() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(CONFIG.WISHES_SHEET_NAME);
  
  // Tự động tạo Sheet nếu chưa có
  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.WISHES_SHEET_NAME);
    sheet.appendRow(['Họ tên', 'Lớp / Niên khóa', 'Lời chúc mừng', 'Cảm xúc', 'Lượt thích', 'Thời gian gửi']);
    return { status: 'success', data: [] };
  }

  const rows = sheet.getDataRange().getValues();
  if (rows.length <= 1) {
    return { status: 'success', data: [] };
  }

  const list = [];
  for (let i = rows.length - 1; i >= 1; i--) { // Sắp xếp lời chúc mới nhất lên đầu
    const row = rows[i];
    list.push({
      id: 'wish-' + i,
      fullName: row[0],
      className: row[1],
      message: row[2],
      tag: row[3] || '❤️',
      likes: parseInt(row[4], 10) || 0,
      submittedAt: formatDate(row[5])
    });
  }

  return { status: 'success', data: list };
}

/**
 * Lưu Lời chúc mừng mới vào Sheet riêng ("Loi_Chuc")
 */
function saveWish(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(CONFIG.WISHES_SHEET_NAME);
  
  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.WISHES_SHEET_NAME);
    sheet.appendRow(['Họ tên', 'Lớp / Niên khóa', 'Lời chúc mừng', 'Cảm xúc', 'Lượt thích', 'Thời gian gửi']);
  }

  const fullName = data.fullName || 'Người bạn giấu tên';
  const className = data.className || 'Niên khóa 2003 - 2006';
  const message = data.message || '';
  const tag = data.tag || '❤️';
  const likes = 0;
  const timestamp = new Date();

  sheet.appendRow([fullName, className, message, tag, likes, timestamp]);

  return { 
    status: 'success', 
    message: 'Gửi lời chúc thành công! Cảm ơn bạn rất nhiều.' 
  };
}

/**
 * =========================================================================
 * MODULE: SỐ LƯỢT TRUY CẬP (VIEW COUNTER - LƯU TRONG SCRIPT PROPERTIES & SHEET)
 * =========================================================================
 */

/**
 * Ghi nhận lượt truy cập mới, tăng số lượng và lưu vào Script Properties lẫn Sheet "Luot_Truy_Cap"
 */
function recordPageView() {
  const scriptProps = PropertiesService.getScriptProperties();
  let currentCount = parseInt(scriptProps.getProperty('VIEW_COUNT') || '0', 10);
  
  // Tăng số lượt truy cập
  currentCount++;
  scriptProps.setProperty('VIEW_COUNT', currentCount.toString());

  // Đồng thời ghi lại lịch sử vào Sheet "Luot_Truy_Cap"
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(CONFIG.VIEW_COUNTER_SHEET_NAME);
    if (!sheet) {
      sheet = ss.insertSheet(CONFIG.VIEW_COUNTER_SHEET_NAME);
      sheet.appendRow(['Thời gian truy cập', 'Lượt thứ', 'Ghi chú']);
    }
    sheet.appendRow([new Date(), currentCount, 'Lượt ghé thăm trang web']);
  } catch (err) {
    // Không làm gián đoạn nếu ghi sheet bị lỗi quyền
  }

  return { 
    status: 'success', 
    count: currentCount, 
    message: 'Ghi nhận lượt truy cập thành công!' 
  };
}

/**
 * Lấy số lượt truy cập hiện tại
 */
function getViewCount() {
  const scriptProps = PropertiesService.getScriptProperties();
  let currentCount = parseInt(scriptProps.getProperty('VIEW_COUNT') || '0', 10);

  // Nếu Script Properties chưa có giá trị, thử đếm số dòng trong Sheet "Luot_Truy_Cap"
  if (currentCount === 0) {
    try {
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      const sheet = ss.getSheetByName(CONFIG.VIEW_COUNTER_SHEET_NAME);
      if (sheet && sheet.getLastRow() > 1) {
        currentCount = sheet.getLastRow() - 1;
        scriptProps.setProperty('VIEW_COUNT', currentCount.toString());
      }
    } catch (err) {}
  }

  return { 
    status: 'success', 
    count: currentCount 
  };
}

/**
 * Upload ảnh dạng Base64 từ Web App lên thư mục Google Drive chỉ định
 */
function uploadPhotoToDrive(data) {
  if (!CONFIG.DRIVE_FOLDER_ID || CONFIG.DRIVE_FOLDER_ID === "YOUR_DRIVE_FOLDER_ID_HERE") {
    return { status: 'error', message: 'Vui lòng cấu hình DRIVE_FOLDER_ID trong Google Apps Script!' };
  }

  const folder = DriveApp.getFolderById(CONFIG.DRIVE_FOLDER_ID);
  
  const base64Data = data.fileData.split(',')[1];
  const decoded = Utilities.base64Decode(base64Data);
  
  let contentType = 'image/jpeg';
  let ext = 'jpg';
  
  const match = data.fileData.match(/^data:(image\\/[a-zA-Z+.-]+);base64,/);
  if (match) {
    contentType = match[1];
    ext = contentType.split('/')[1] || 'jpg';
  }

  const fileName = \`KyNiem20Nam_\${data.uploaderName || 'GiaDinh2003_2006'}_\${Date.now()}.\${ext}\`;
  const blob = Utilities.newBlob(decoded, contentType, fileName);
  
  const file = folder.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  
  return {
    status: 'success',
    message: 'Tải ảnh lên thành công!',
    fileId: file.getId(),
    viewUrl: file.getUrl()
  };
}

/**
 * Lấy danh sách ảnh trong thư mục Google Drive để hiển thị lên Gallery
 */
function getDrivePhotos() {
  if (!CONFIG.DRIVE_FOLDER_ID || CONFIG.DRIVE_FOLDER_ID === "YOUR_DRIVE_FOLDER_ID_HERE") {
    return { status: 'success', data: [] };
  }

  const folder = DriveApp.getFolderById(CONFIG.DRIVE_FOLDER_ID);
  const files = folder.getFiles();
  const photos = [];

  while (files.hasNext()) {
    const file = files.next();
    const mimeType = file.getMimeType();
    
    if (mimeType.indexOf('image/') === 0) {
      photos.push({
        id: file.getId(),
        url: 'https://drive.google.com/thumbnail?authuser=0&sz=w800&id=' + file.getId(),
        caption: file.getName(),
        date: formatDate(file.getDateCreated())
      });
    }
  }

  photos.sort((a, b) => b.id.localeCompare(a.id));

  return { status: 'success', data: photos };
}

function formatDate(date) {
  if (!(date instanceof Date)) return date;
  const pad = (n) => n < 10 ? '0' + n : n;
  return \`\${pad(date.getDate())}/\${pad(date.getMonth() + 1)}/\${date.getFullYear()} \${pad(date.getHours())}:\${pad(date.getMinutes())}\`;
}
`;
