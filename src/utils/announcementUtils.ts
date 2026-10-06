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

  // 4. Loại bỏ các đoạn văn <p> rỗng sinh ra sau khi đã xóa link
  text = text.replace(/<p[^>]*>\s*(?:<br\s*\/?>|&nbsp;|\s)*\s*<\/p>/gi, '');

  return text.trim();
}
