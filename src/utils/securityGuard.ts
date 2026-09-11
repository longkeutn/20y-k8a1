/**
 * Security Guard for K8A1 Webapp
 * Giúp bảo vệ giao diện, hạn chế người dùng tò mò mở DevTools, sao chép hoặc xem mã nguồn.
 */

export function initSecurityGuard() {
  if (typeof window === 'undefined') return;

  // 1. Chặn chuột phải (Context Menu) - Ngoại trừ trên các trường nhập liệu input / textarea
  window.addEventListener(
    'contextmenu',
    (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return; // Vẫn cho phép chuột phải để Dán (Paste) hoặc Chọn văn bản trong ô nhập
      }
      e.preventDefault();
    },
    { capture: true }
  );

  // 2. Chặn các phím tắt mở DevTools và Xem mã nguồn
  window.addEventListener(
    'keydown',
    (e: KeyboardEvent) => {
      // F12
      if (e.key === 'F12' || e.keyCode === 123) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      const isCtrlOrMeta = e.ctrlKey || e.metaKey;

      // Ctrl + Shift + I (Inspect)
      // Ctrl + Shift + J (Console)
      // Ctrl + Shift + C (Inspect Element)
      if (isCtrlOrMeta && e.shiftKey) {
        const key = (e.key || '').toUpperCase();
        if (key === 'I' || key === 'J' || key === 'C') {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }
      }

      // Ctrl + U (View Source)
      // Ctrl + S (Save Page)
      if (isCtrlOrMeta && !e.shiftKey) {
        const key = (e.key || '').toUpperCase();
        if (key === 'U' || key === 'S') {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }
      }
    },
    { capture: true }
  );

  // 3. Chặn kéo thả hình ảnh (ngăn kéo ảnh ra ngoài màn hình để sao lưu)
  window.addEventListener(
    'dragstart',
    (e: DragEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && target.tagName === 'IMG') {
        e.preventDefault();
      }
    },
    { capture: true }
  );

  // 4. Banner cảnh báo bảo mật tự động trong DevTools Console
  try {
    const bannerStyle =
      'color: #dc2626; font-size: 22px; font-weight: bold; text-shadow: 1px 1px 2px #000; padding: 4px;';
    const subStyle = 'color: #334155; font-size: 13px; font-weight: 500;';
    console.log('%c⚠️ DỪNG LẠI (STOP)!', bannerStyle);
    console.log(
      '%cĐây là khu vực bảo mật nội bộ K8A1 THPT Thái Nguyên.\nMọi hành vi can thiệp, sao chép hoặc trích xuất dữ liệu không được phép đều bị nghiêm cấm.',
      subStyle
    );
  } catch (_) {}
}
