/**
 * Vercel Serverless Function: Dynamic Social Media Link Preview Card (Open Graph)
 * - Tự động hiển thị ảnh đại diện bài viết, tiêu đề và trích dẫn trên Facebook, Zalo, Messenger, Telegram...
 * - Đối với người dùng thật: Chuyển hướng siêu tốc (HTTP 302) về WebApp mở bài viết
 * - Đối với Bot/Crawler của MXH: Trả về HTML chứa đầy đủ thẻ Open Graph (Không redirect, không canonical sai)
 */
export default function handler(req, res) {
  const { title, desc, img, news, id } = req.query;

  const newsId = news || id || '';
  const postTitle = title ? String(title).trim() : 'Bản tin K8A1 THPT Thái Nguyên';
  const postDesc = desc ? String(desc).trim() : 'Kỷ niệm 20 năm ngày ra trường niên khóa 2003 - 2006';
  const host = req.headers['x-forwarded-host'] || req.headers.host || 'k8a1.vercel.app';
  const proto = req.headers['x-forwarded-proto'] || 'https';
  const defaultFallbackImage = `${proto}://${host}/og-image.jpg`;

  let postImg = img ? String(img).trim() : '';
  if (!postImg || postImg.startsWith('data:image/') || postImg === 'undefined' || postImg === 'null') {
    postImg = defaultFallbackImage;
  } else if (postImg.startsWith('/')) {
    postImg = `${proto}://${host}${postImg}`;
  }
  
  // Link đích mà người dùng sẽ xem trên WebApp
  const targetUrl = newsId 
    ? `${proto}://${host}/?news=${encodeURIComponent(newsId)}`
    : `${proto}://${host}/`;

  // Kiểm tra xem User-Agent có phải là Bot / Crawler của Mạng xã hội không
  const userAgent = req.headers['user-agent'] || '';
  const isBot = /facebookexternalhit|facebot|facebookcatalog|zalo|twitterbot|telegrambot|linkedinbot|slackbot|whatsapp|bingbot|googlebot|crawler|spider/i.test(userAgent);

  // 1. Nếu là NGƯỜI DÙNG THẬT: Chuyển hướng 302 ngay lập tức về WebApp
  if (!isBot) {
    return res.redirect(302, targetUrl);
  }

  // 2. Nếu là BOT CRAWLER (Facebook, Zalo...): Trả về trang HTML thuần chứa đầy đủ thẻ Open Graph
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  const safeTitle = escapeHtml(postTitle);
  const safeDesc = escapeHtml(postDesc);
  const safeImg = escapeHtml(postImg);
  const currentShareUrl = escapeHtml(`${proto}://${host}${req.url}`);

  const html = `<!DOCTYPE html>
<html lang="vi" prefix="og: https://ogp.me/ns#">
<head>
  <meta charset="UTF-8">
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
  <meta property="og:url" content="${currentShareUrl}">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${safeTitle}">
  <meta name="twitter:description" content="${safeDesc}">
  <meta name="twitter:image" content="${safeImg}">
</head>
<body style="font-family: sans-serif; text-align: center; padding: 40px; background: #FAF6EC; color: #78350f;">
  <h1>${safeTitle}</h1>
  <p>${safeDesc}</p>
  <img src="${safeImg}" alt="${safeTitle}" style="max-width: 100%; height: auto; border-radius: 8px;" />
  <p><a href="${escapeHtml(targetUrl)}" style="color: #b45309; font-weight: bold;">Bấm vào đây để xem trực tiếp bản tin</a></p>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=86400');
  return res.status(200).send(html);
}
