/**
 * Tiện ích xử lý và chuẩn hóa nội dung Bản Tin / Thông Báo K8A1
 */

/**
 * Làm sạch nội dung bài viết thông báo:
 * - Loại bỏ triệt để các cú pháp markdown ảnh thô như ![Ảnh minh họa](https://...) 
 *   hoặc ![Ảnh minh họa] \n (https://...) bị sót lại ở cuối bài viết.
 * - Loại bỏ các thẻ <p> rỗng phát sinh sau khi xóa link.
 */
export function cleanAnnouncementContent(content: string): string {
  if (!content) return '';
  let text = content;

  // 1. Loại bỏ các khối thẻ <p> chứa cú pháp markdown ảnh bị phân tách theo dòng
  // ví dụ: <p>![Ảnh minh họa]</p><p>(https://...)</p> hoặc <p>![Ảnh minh họa](https://...)</p>
  text = text.replace(/<p[^>]*>\s*!\[.*?\]\s*<\/p>\s*<p[^>]*>\s*\(?https?:\/\/[^\s\)<>"]+\)?\s*<\/p>/gi, '');
  text = text.replace(/<p[^>]*>\s*!\[.*?\]\s*\(?https?:\/\/[^\s\)<>"]+\)?\s*<\/p>/gi, '');

  // 2. Loại bỏ cú pháp markdown ảnh đơn dòng hoặc nhiều dòng
  // ví dụ: ![Ảnh minh họa](https://...) hoặc ![Ảnh minh họa]\n(https://...)
  text = text.replace(/!\[.*?\]\s*(?:<br\s*\/?>|\n)?\s*\(?https?:\/\/[^\s\)<>"]+\)?/gi, '');

  // 3. Loại bỏ thẻ <p> chỉ chứa ![Ảnh minh họa] hoặc các link ảnh trần còn sót lại
  text = text.replace(/<p[^>]*>\s*!\[.*?\]\s*<\/p>/gi, '');
  text = text.replace(/!\[.*?\]/gi, '');
  text = text.replace(/\(https?:\/\/[^\s\)]+(?:googleusercontent|drive\.google|\.jpg|\.jpeg|\.png|\.webp)[^\s\)]*\)/gi, '');

  // 4. Chỉ loại bỏ các đoạn văn <p> rỗng ở cuối cùng của bài viết (sau khi đã gỡ link ảnh)
  text = text.replace(/(?:<p[^>]*>\s*(?:<br\s*\/?>|&nbsp;|\s)*\s*<\/p>\s*)+$/gi, '');

  return text.trim();
}

/**
 * Chuẩn hóa hiển thị toàn văn nội dung bài viết:
 * - Gọi cleanAnnouncementContent để gỡ bỏ cú pháp link ảnh thừa
 * - Nếu nội dung là văn bản thường / markdown (chưa có thẻ <p>, <div>, v.v.):
 *   Tự động tách các đoạn văn (theo 1 hoặc 2 dấu xuống dòng) thành các khối <p>
 *   và chuyển đổi cú pháp in đậm **...**, in nghiêng _..._ để giữ nguyên định dạng dàn trang đẹp mắt.
 * - Nếu đã có thẻ HTML (từ trình soạn thảo Quill):
 *   Bảo toàn các thẻ định dạng, đảm bảo dàn trang cách dòng chuẩn chỉ.
 */
export function formatAnnouncementContent(content: string): string {
  if (!content) return '';
  const cleaned = cleanAnnouncementContent(content);
  if (!cleaned) return '';

  const hasHtmlBlocks = /<\/?(p|div|br|h[1-6]|ul|ol|li|blockquote|table)[^>]*>/i.test(cleaned);

  if (!hasHtmlBlocks) {
    // Tách các đoạn văn bản theo các dòng trống hoặc các lần xuống dòng
    const rawBlocks = cleaned.split(/\n\s*\n/);
    const htmlParts: string[] = [];

    rawBlocks.forEach((block) => {
      const trimmed = block.trim();
      if (!trimmed) return;

      // Xử lý tiêu đề Markdown ### hoặc ##
      if (trimmed.startsWith('### ')) {
        htmlParts.push(`<h3>${trimmed.slice(4).trim()}</h3>`);
        return;
      }
      if (trimmed.startsWith('## ')) {
        htmlParts.push(`<h2>${trimmed.slice(3).trim()}</h2>`);
        return;
      }
      if (trimmed.startsWith('# ')) {
        htmlParts.push(`<h2>${trimmed.slice(2).trim()}</h2>`);
        return;
      }

      // Xử lý in đậm **text**, in nghiêng _text_, giữ ngắt dòng đơn \n thành <br/>
      const formatted = trimmed
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/_(.+?)_/g, '<em>$1</em>')
        .replace(/\n/g, '<br/>');

      htmlParts.push(`<p>${formatted}</p>`);
    });

    return htmlParts.join('');
  }

  return cleaned;
}
