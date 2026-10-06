/**
 * Vercel Serverless Function: High-performance Image Proxy for Social Media (Open Graph)
 * - Tự động tải ảnh từ Google Drive (bằng ID) và phục vụ trực tiếp dưới dạng ảnh JPEG tĩnh chuẩn (.jpg)
 * - Giúp Zalo và Facebook đọc ảnh trực tiếp từ domain k8a1.vercel.app mà không bị Google Drive chặn/hạn chế
 * - Cache lâu dài tại CDN Edge toàn cầu của Vercel (Cache-Control: public, s-maxage=31536000)
 */

export const config = {
  maxDuration: 15,
};

export default async function handler(req, res) {
  const { id } = req.query;
  const rawId = String(id || '').trim().replace(/\.jpg$/i, '').replace(/\.png$/i, '').replace(/\.jpeg$/i, '');

  const host = req.headers['x-forwarded-host'] || req.headers.host || 'k8a1.vercel.app';
  const proto = req.headers['x-forwarded-proto'] || 'https';
  const fallbackUrl = `${proto}://${host}/og-image.jpg`;

  if (!rawId) {
    return res.redirect(302, fallbackUrl);
  }

  const driveUrl = `https://lh3.googleusercontent.com/d/${encodeURIComponent(rawId)}=w1200`;

  try {
    const upstreamRes = await fetch(driveUrl, { redirect: 'follow' });
    if (!upstreamRes.ok) {
      return res.redirect(302, fallbackUrl);
    }
    const contentType = upstreamRes.headers.get('content-type') || 'image/jpeg';
    const buffer = await upstreamRes.arrayBuffer();

    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=31536000, immutable');
    return res.status(200).send(Buffer.from(buffer));
  } catch (err) {
    return res.redirect(302, fallbackUrl);
  }
}
