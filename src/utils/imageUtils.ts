/**
 * Utility helper để nén và xuất ảnh canvas phía client
 */

/**
 * Kiểm tra xem người dùng có đang dùng thiết bị di động (điện thoại/máy tính bảng)
 */
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    /iPhone|iPad|iPod|Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
    (typeof navigator !== 'undefined' && navigator.maxTouchPoints != null && navigator.maxTouchPoints > 1)
  );
}

/**
 * Nén file ảnh người dùng tải lên thành JPEG gọn nhẹ
 */
export async function compressImageToJpeg(file: File, maxWidth = 1600, quality = 0.85): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        try {
          const dataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(dataUrl);
        } catch (canvasErr) {
          resolve(e.target?.result as string);
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Xuất Canvas sang Blob định dạng JPEG chất lượng cao
 */
export function canvasToJpgBlob(canvas: HTMLCanvasElement, quality = 0.92): Promise<Blob> {
  return new Promise((resolve, reject) => {
    try {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            // Fallback sang toDataURL nếu toBlob gặp trục trặc
            try {
              const dataUrl = canvas.toDataURL('image/jpeg', quality);
              const arr = dataUrl.split(',');
              const mime = arr[0].match(/:(.*?);/)![1];
              const bstr = atob(arr[1]);
              let n = bstr.length;
              const u8arr = new Uint8Array(n);
              while (n--) {
                u8arr[n] = bstr.charCodeAt(n);
              }
              resolve(new Blob([u8arr], { type: mime }));
            } catch (err) {
              reject(err);
            }
          }
        },
        'image/jpeg',
        quality
      );
    } catch (e) {
      reject(e);
    }
  });
}

export interface SaveJpgResult {
  success: boolean;
  method: 'share' | 'download' | 'preview_fallback';
  dataUrl?: string;
  blob?: Blob;
  error?: string;
}

/**
 * Lưu hoặc tải Canvas thành file JPG:
 * 1. Trên Mobile: Ưu tiên dùng Web Share API chia sẻ file JPG.
 *    -> Trên iPhone (iOS Safari): Mở bảng chia sẻ của iOS có sẵn nút "Lưu hình ảnh" (Save Image) lưu trực tiếp vào Thư viện ảnh (Cuộn Camera)!
 *    -> Trên Android: Mở bảng chia sẻ lưu vào Gallery / Google Photos.
 * 2. Tải trực tiếp bằng thẻ <a> download (.jpg) để lưu vào máy.
 * 3. Trả về dataUrl để giao diện có thể hiển thị Modal "Nhấn giữ ảnh để lưu" trên mobile khi cần.
 */
export async function saveOrDownloadJpg(
  canvas: HTMLCanvasElement,
  filename: string,
  title: string = 'K8A1 - 20 Năm Ngày Trở Về',
  quality = 0.92
): Promise<SaveJpgResult> {
  try {
    // Đảm bảo tên file kết thúc bằng .jpg
    const safeFilename = filename.replace(/\.(png|jpeg|webp)$/i, '') + '.jpg';
    const blob = await canvasToJpgBlob(canvas, quality);
    const dataUrl = canvas.toDataURL('image/jpeg', quality);
    const isMobile = isMobileDevice();

    // 1. Mobile: Thử dùng Web Share API với file để mở menu "Lưu hình ảnh" vào Thư viện ảnh
    if (isMobile && typeof navigator !== 'undefined' && navigator.canShare) {
      try {
        const file = new File([blob], safeFilename, { type: 'image/jpeg' });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: title,
            text: 'Tấm vé vàng kỷ niệm 20 năm K8A1 — Trường THPT Thái Nguyên'
          });
          return { success: true, method: 'share', dataUrl, blob };
        }
      } catch (shareErr: any) {
        if (shareErr.name === 'AbortError') {
          // Người dùng bấm Hủy trong bảng share
          return { success: false, method: 'share', dataUrl, blob };
        }
        console.warn('Web Share file failed, falling back to download:', shareErr);
      }
    }

    // 2. Kích hoạt tải về trực tiếp qua thẻ <a>
    try {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = safeFilename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 20000);
    } catch (downloadErr) {
      console.warn('Direct download anchor failed:', downloadErr);
    }

    return {
      success: true,
      method: isMobile ? 'preview_fallback' : 'download',
      dataUrl,
      blob
    };
  } catch (err: any) {
    console.error('saveOrDownloadJpg failed:', err);
    return {
      success: false,
      method: 'download',
      error: err.message || 'Không thể xuất ảnh JPG'
    };
  }
}
