let cachedCode: string | null = null;

/**
 * Tải mã nguồn Google Apps Script (Code.gs) bất đồng bộ từ file tĩnh /Code.gs
 * Giúp giao diện Admin copy/xem mã nguồn mới nhất mà không làm phình to bundle JS chính.
 */
export async function fetchGoogleAppsScriptCode(): Promise<string> {
  if (cachedCode) return cachedCode;
  try {
    const res = await fetch('/Code.gs?v=' + Date.now());
    if (res.ok) {
      cachedCode = await res.text();
      return cachedCode;
    }
  } catch (err) {
    console.warn('Không thể nạp file /Code.gs từ máy chủ:', err);
  }
  return '';
}
