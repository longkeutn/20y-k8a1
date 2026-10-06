/**
 * Vercel Serverless Function: Dynamic Open Graph Preview & Redirect for Social Media Sharing
 * - Hỗ trợ Facebook, Zalo, Twitter, Messenger, Telegram tự động lấy ảnh đại diện, tiêu đề và tóm tắt của bài viết
 * - Tự động chuyển hướng ngay lập tức (0.01 giây) khi người dùng bấm vào link
 */
export default function handler(req, res) {
  const { title, desc, img, news, id } = req.query;

  const newsId = news || id || '';
  const postTitle = title ? decodeURIComponent(title) : 'Bản tin K8A1 THPT Thái Nguyên';
  const postDesc = desc ? decodeURIComponent(desc) : 'Kỷ niệm 20 năm ngày ra trường niên khóa 2003 - 2006';
  const postImg = img ? decodeURIComponent(img) : 'https://k8a1.vercel.app/og-image.jpg';

  const host = req.headers['x-forwarded-host'] || req.headers.host || 'k8a1.vercel.app';
  const proto = req.headers['x-forwarded-proto'] || 'https';
  const targetUrl = newsId 
    ? `${proto}://${host}/?news=${encodeURIComponent(newsId)}`
    : `${proto}://${host}/`;

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
  const safeTargetUrl = escapeHtml(targetUrl);

  const html = `<!DOCTYPE html>
<html lang="vi">
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
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:url" content="${safeTargetUrl}">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${safeTitle}">
  <meta name="twitter:description" content="${safeDesc}">
  <meta name="twitter:image" content="${safeImg}">

  <!-- Chuyển hướng siêu tốc về WebApp mở bài viết -->
  <meta http-equiv="refresh" content="0; url=${safeTargetUrl}">
  <script>
    window.location.replace("${safeTargetUrl}");
  </script>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; text-align: center; padding: 40px; background: #FAF6EC; color: #78350f;">
  <h2>🌸 Đang chuyển tiếp tới Bản tin K8A1...</h2>
  <p><a href="${safeTargetUrl}" style="color: #b45309; font-weight: bold;">Bấm vào đây nếu trình duyệt không tự chuyển</a></p>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
  return res.status(200).send(html);
}
