/**
 * Vercel Serverless Function: Dynamic Social Media Link Preview Card (Open Graph)
 * - Tự động tra cứu tiêu đề, tóm tắt và ảnh bìa từ danh sách bản tin (Google Apps Script API & Bộ nhớ đệm)
 * - Đường link chia sẻ siêu ngắn gọn: https://k8a1.vercel.app/s/TB-1791260430101
 * - Đối với người dùng thật: Chuyển hướng 302 siêu tốc về WebApp mở bài viết
 * - Đối với Bot MXH (Facebook, Zalo, Twitter, Telegram...): Trả về thẻ Open Graph đầy đủ để hiển thị ảnh to đẹp
 */

export const config = {
  maxDuration: 15,
};

// Bộ nhớ đệm trong RAM của Serverless instance để phản hồi tức thì (0ms)
let cachedAnnouncements = null;
let lastCacheTime = 0;
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 phút

const GAS_API_URL = 'https://script.google.com/macros/s/AKfycby_hm9akENv_GmNpF8s9ALVReDd_8ORPS_RqpUZ9FS6GB_Qdnmjhh5XZ5iKZhnE_9S0/exec?action=get_announcements';

// Danh mục bài viết mặc định dự phòng phản hồi siêu tốc nếu mạng chậm
// Danh mục bài viết mặc định dự phòng phản hồi siêu tốc nếu mạng chậm
const FALLBACK_ANNOUNCEMENTS = {
  'tb-1791260430101': {
    title: 'Phùng Bá Thắng và chiếc áo lớp số 47',
    desc: 'Bạn rời đi khi tuổi đời vừa tròn 20… cái tuổi mà chúng mình khi ấy còn chưa biết cuộc đời sẽ dài đến đâu, chưa biết 20 năm sau mình sẽ trở thành những ai, chưa kịp hiểu hết hai chữ "vô thường"...',
    img: 'https://lh3.googleusercontent.com/d/1wPROM4Yti-_9IY8-IcHngxv9vhxhbA0n=w1600'
  },
  'tb-report-20y': {
    title: '🏆 DẤU ẤN 2 DECADES: Ký Sự Đại Lễ 20 Năm & Kỳ Tích Số Hóa Hội Khóa K8A1',
    desc: 'Bản ký sự & báo cáo tổng kết chính thức: Nhìn lại hành trình 2 thập kỷ tri kỷ với 24 giờ hội ngộ xúc động nghẹn ngào, 4 con số kỷ lục lịch sử và 5 kỳ tích công nghệ 4.0 tiên phong của ngày 27/09/2026.',
    img: 'https://lh3.googleusercontent.com/d/1PyvlmILYdK-Lx12ohrHfBV-ppDjHDhhg=w1600'
  },
  'tong-ket-20-nam': {
    title: '🏆 DẤU ẤN 2 DECADES: Ký Sự Đại Lễ 20 Năm & Kỳ Tích Số Hóa Hội Khóa K8A1',
    desc: 'Bản ký sự & báo cáo tổng kết chính thức: Nhìn lại hành trình 2 thập kỷ tri kỷ với 24 giờ hội ngộ xúc động nghẹn ngào, 4 con số kỷ lục lịch sử và 5 kỳ tích công nghệ 4.0 tiên phong của ngày 27/09/2026.',
    img: 'https://lh3.googleusercontent.com/d/1PyvlmILYdK-Lx12ohrHfBV-ppDjHDhhg=w1600'
  },
  'tb-01': {
    title: '🚨 Chốt danh sách đặt may Áo Polo kỷ niệm 20 năm K8A1 — Hạn chót 18/09',
    desc: 'Thông báo triển khai phát động đăng ký mẫu áo đồng phục kỷ niệm 20 năm và tiếp nhận đóng góp quỹ lớp.',
    img: '/sample-polo-k8a1.jpg'
  },
  'tb-02': {
    title: '📋 Kế hoạch chi tiết & Lịch trình Ngày Hội Khóa 20 Năm (Chủ Nhật, 27/09/2026)',
    desc: 'Kế hoạch tổng thể ngày hội khóa 20 năm (2006 - 2026), thời gian, địa điểm và chương trình chi tiết.',
    img: ''
  },
  'tb-03': {
    title: '💰 Báo cáo tiến độ Quỹ Lớp K8A1 & Tri ân các bạn đã hoàn thành đóng góp sớm',
    desc: 'Ban Liên Lạc hoàn tất danh sách cựu học sinh tham dự và gửi thư mời trân trọng tới các thầy cô giáo.',
    img: ''
  },
  'tb-04': {
    title: '📸 Ký sự BLL tiền trạm nhà hàng The Prime & Thăm hỏi trường THPT Thái Nguyên',
    desc: 'Đại diện Ban Liên Lạc đã làm việc trực tiếp với Ban Giám Hiệu nhà trường và nhà hàng The Prime.',
    img: ''
  },
  'tb-05': {
    title: '🗳️ Khảo Sát Ý Kiến: Lựa Chọn Quà Lưu Niệm & Thiết Kế Áo Lớp 20 Năm',
    desc: 'Bình chọn và khảo sát ý kiến các thành viên về các hoạt động kỷ niệm 20 năm.',
    img: ''
  },
  'tb-1790736651032': {
    title: '💌 Lời Tri Ân — K8A1 20 Năm: Một Chặng Đường, Một Đời Tình Bạn',
    desc: 'Bản tin tri ân hành trình 20 năm tình bạn niên khóa 2003 - 2006 K8A1 THPT Thái Nguyên.',
    img: ''
  },
  'tb-1790736897269': {
    title: '👗 Thông Báo Từ BTC: Timeline – Concept Chụp Ảnh – Trang Phục 20 Năm',
    desc: 'Thông báo chính thức từ BTC về lịch trình, quy định trang phục và concept chụp ảnh kỷ niệm.',
    img: ''
  }
};

function stripHtml(html) {
  if (!html) return '';
  return String(html).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

async function fetchAnnouncements() {
  const now = Date.now();
  if (cachedAnnouncements && (now - lastCacheTime < CACHE_TTL_MS)) {
    return cachedAnnouncements;
  }
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);
    const res = await fetch(GAS_API_URL, { 
      signal: controller.signal,
      redirect: 'follow'
    });
    clearTimeout(timeout);
    if (!res.ok) return cachedAnnouncements || [];
    const json = await res.json();
    if (json && Array.isArray(json.data) && json.data.length > 0) {
      cachedAnnouncements = json.data;
      lastCacheTime = now;
      return cachedAnnouncements;
    }
  } catch (err) {
    console.warn('[api/share] Fetch from GAS error or timeout:', err.message);
  }
  return cachedAnnouncements || [];
}

export default async function handler(req, res) {
  const { title, desc, img, news, id, t, i } = req.query;
  const rawNewsId = news || id || '';
  const newsId = decodeURIComponent(String(rawNewsId).trim());

  const host = req.headers['x-forwarded-host'] || req.headers.host || 'k8a1.vercel.app';
  const proto = req.headers['x-forwarded-proto'] || 'https';
  const defaultFallbackImage = `${proto}://${host}/og-image.jpg`;

  // Link đích mở bài viết trên WebApp
  const targetUrl = newsId 
    ? `${proto}://${host}/?news=${encodeURIComponent(newsId)}`
    : `${proto}://${host}/`;

  // Kiểm tra xem User-Agent có phải là Bot / Crawler của Mạng xã hội không
  const userAgent = req.headers['user-agent'] || '';
  const isBot = /facebookexternalhit|facebot|facebookcatalog|zalobot|twitterbot|telegrambot|linkedinbot|slackbot|whatsapp|bingbot|googlebot|crawler|spider/i.test(userAgent) ||
    (!/mobile|android|iphone|ipad/i.test(userAgent) && /zalo/i.test(userAgent));

  // 1. Nếu là NGƯỜI DÙNG THẬT: Chuyển hướng 302 ngay lập tức về WebApp
  if (!isBot) {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Vary', 'User-Agent');
    return res.redirect(302, targetUrl);
  }

  // 2. Nếu là BOT CRAWLER (Facebook, Zalo...):
  let postTitle = (title || t) ? String(title || t).trim() : '';
  let postDesc = desc ? String(desc).trim() : '';
  let postImg = (img || i) ? String(img || i).trim() : '';
  let isFound = false;

  // Nếu postImg chỉ là ID ảnh Drive (ví dụ: 1wPROM4Yti-_9IY8-IcHngxv9vhxhbA0n), mở rộng thành URL đầy đủ
  if (postImg && !postImg.startsWith('http') && !postImg.startsWith('/') && !postImg.startsWith('data:')) {
    postImg = `https://lh3.googleusercontent.com/d/${postImg}=w1200`;
    isFound = true;
  }

  // Tra cứu tự động nếu chưa có đủ tiêu đề hoặc ảnh từ query string
  if (newsId && (!postTitle || !postImg)) {
    const keyLower = newsId.toLowerCase();

    // 2a. Tra cứu fallback tĩnh (0ms)
    if (FALLBACK_ANNOUNCEMENTS[keyLower]) {
      const fb = FALLBACK_ANNOUNCEMENTS[keyLower];
      if (!postTitle) postTitle = fb.title;
      if (!postDesc) postDesc = fb.desc;
      if (!postImg && fb.img) postImg = fb.img;
      isFound = true;
    }

    // 2b. Nếu vẫn chưa đủ, tra cứu từ Google Apps Script
    if (!postTitle || !postImg) {
      const list = await fetchAnnouncements();
      const match = list.find(a => 
        (a.id && a.id.toLowerCase() === keyLower) ||
        (a.slug && a.slug.toLowerCase() === keyLower)
      );
      if (match) {
        if (!postTitle) postTitle = match.title || '';
        if (!postDesc) {
          postDesc = match.summary || stripHtml(match.content).slice(0, 160);
        }
        if (!postImg) {
          postImg = match.imageUrl || (Array.isArray(match.images) && match.images[0]) || '';
        }
        isFound = true;
      }
    }
  } else if (postTitle && postImg) {
    isFound = true;
  }

  // Tiêu đề & trích dẫn dự phòng nếu không tìm thấy bài
  if (!postTitle) postTitle = 'Bản tin K8A1 THPT Thái Nguyên';
  if (!postDesc) postDesc = 'Kỷ niệm 20 năm ngày ra trường niên khóa 2003 - 2006';

  // Chuẩn hóa đường link ảnh đại diện
  if (!postImg || postImg.startsWith('data:image/') || postImg === 'undefined' || postImg === 'null') {
    postImg = defaultFallbackImage;
  } else if (postImg.includes('googleusercontent.com') || postImg.includes('drive.google.com')) {
    // Chuyển link ảnh Google Drive sang proxy tĩnh chuẩn .jpg trên domain k8a1.vercel.app
    // Giúp Facebook và Zalo nhận diện và tải ảnh lập tức 100%, không bị chặn
    const driveMatch = postImg.match(/\/d\/([a-zA-Z0-9_-]+)/) || postImg.match(/id=([a-zA-Z0-9_-]+)/);
    if (driveMatch && driveMatch[1]) {
      postImg = `${proto}://${host}/img/${driveMatch[1]}.jpg`;
    }
  } else if (postImg.startsWith('/')) {
    postImg = `${proto}://${host}${postImg}`;
  }

  const safeTitle = escapeHtml(postTitle);
  const safeDesc = escapeHtml(postDesc);
  const vParam = req.query.v ? `?v=${encodeURIComponent(req.query.v)}` : '';
  const canonicalUrl = newsId 
    ? `${proto}://${host}/s/${encodeURIComponent(newsId)}${vParam}`
    : `${proto}://${host}/`;
  const safeCanonicalUrl = escapeHtml(canonicalUrl);
  const safeTargetUrl = escapeHtml(targetUrl);

  const html = `<!DOCTYPE html>
<html lang="vi" prefix="og: https://ogp.me/ns#">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${safeTitle} | K8A1 THPT Thái Nguyên</title>
  <meta name="description" content="${safeDesc}">
  
  <!-- Open Graph / Facebook / Zalo -->
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="K8A1 THPT Thái Nguyên (2003 - 2006)">
  <meta property="og:title" content="${safeTitle}">
  <meta property="og:description" content="${safeDesc}">
  <meta property="og:image" content="${safeImg}">
  <meta property="og:image:secure_url" content="${safeImg}">
  <meta property="og:image:type" content="image/jpeg">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="${safeTitle}">
  <meta property="og:url" content="${safeCanonicalUrl}">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${safeTitle}">
  <meta name="twitter:description" content="${safeDesc}">
  <meta name="twitter:image" content="${safeImg}">

  <!-- Tự động chuyển tiếp bằng JS nếu trình duyệt người dùng mở trực tiếp (Bot không chạy JS nên không bị ảnh hưởng) -->
  <script>window.location.replace(${JSON.stringify(targetUrl)});</script>
</head>
<body style="font-family: sans-serif; text-align: center; padding: 40px; background: #FAF6EC; color: #78350f;">
  <h1>${safeTitle}</h1>
  <p>${safeDesc}</p>
  <img src="${safeImg}" alt="${safeTitle}" style="max-width: 100%; height: auto; border-radius: 8px;" />
  <p style="margin-top: 20px;"><a href="${safeTargetUrl}" style="color: #b45309; font-weight: bold; font-size: 16px;">👉 Bấm vào đây để mở bài viết trên WebApp K8A1</a></p>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Vary', 'User-Agent');
  if (isFound) {
    res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=86400, stale-while-revalidate=604800');
  } else {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  }
  return res.status(200).send(html);
}
