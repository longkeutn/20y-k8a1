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
      const isCtrlOrMeta = e.ctrlKey || e.metaKey;

      // Phím tắt bí mật dành cho Ban Quản Trị / Lập trình viên để mở khóa DevTools: Ctrl + Alt + Shift + D
      if (isCtrlOrMeta && e.altKey && e.shiftKey && (e.key || '').toUpperCase() === 'D') {
        e.preventDefault();
        const currentAllowed = sessionStorage.getItem('k8a1_allow_devtools') === 'true';
        if (currentAllowed) {
          sessionStorage.removeItem('k8a1_allow_devtools');
          alert('🔒 Đã bật lại bảo vệ giao diện & bẫy Debugger Trap!');
          location.reload();
        } else {
          sessionStorage.setItem('k8a1_allow_devtools', 'true');
          alert('🔓 Chế độ Nhà phát triển đã mở khóa! Bạn có thể sử dụng DevTools bình thường.');
          location.reload();
        }
        return false;
      }

      // Nếu đã được mở khóa DevTools thì cho phép bình thường
      if (sessionStorage.getItem('k8a1_allow_devtools') === 'true') {
        return;
      }

      // F12
      if (e.key === 'F12' || e.keyCode === 123) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

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

  // 5. Bẫy Debugger Trap: Đóng băng tiến trình nếu người dùng cố tình mở DevTools qua Menu trình duyệt
  let antiDebugTimer: ReturnType<typeof setInterval> | null = null;
  const triggerDebugger = () => {
    if (typeof window === 'undefined') return;
    // Nếu Admin hoặc Lập trình viên đã mở khóa chế độ DevTools thì bỏ qua
    if (sessionStorage.getItem('k8a1_allow_devtools') === 'true') {
      if (antiDebugTimer) {
        clearInterval(antiDebugTimer);
        antiDebugTimer = null;
      }
      return;
    }

    try {
      // Gọi lệnh debugger qua hàm constructor động để ngăn minifier/bundler bỏ qua
      (function () {
        Function('debugger')();
      })();
    } catch (_) {}
  };

  if (sessionStorage.getItem('k8a1_allow_devtools') !== 'true') {
    antiDebugTimer = setInterval(triggerDebugger, 1200);
  }
}

/**
 * Cho phép bật/tắt chế độ DevTools (dành cho Admin khi đăng nhập thành công)
 */
export function setDevToolsAllowed(allowed: boolean) {
  if (typeof window === 'undefined') return;
  if (allowed) {
    sessionStorage.setItem('k8a1_allow_devtools', 'true');
  } else {
    sessionStorage.removeItem('k8a1_allow_devtools');
  }
}

export function isDevToolsAllowed(): boolean {
  if (typeof window === 'undefined') return false;
  return sessionStorage.getItem('k8a1_allow_devtools') === 'true';
}
