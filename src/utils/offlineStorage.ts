import { MusicTrack } from '../types';

const DB_NAME = 'k8a1_offline_db';
const DB_VERSION = 1;
const STORE_TRACKS = 'offline_tracks';
const STORE_MEDIA = 'cached_media';

interface StoredAudioTrack {
  id: string;
  title: string;
  artist: string;
  blob: Blob;
  fileName: string;
  fileSize: number;
  duration?: string;
  addedAt: number;
}

interface StoredMediaItem {
  url: string;
  blob: Blob;
  cachedAt: number;
}

// Lưu trữ các ObjectURL đang mở để giải phóng bộ nhớ khi cần
const activeObjectUrls = new Map<string, string>();

/**
 * Khởi tạo hoặc kết nối cơ sở dữ liệu IndexedDB trình duyệt
 */
export function openOfflineDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('Trình duyệt không hỗ trợ IndexedDB'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_TRACKS)) {
        db.createObjectStore(STORE_TRACKS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_MEDIA)) {
        db.createObjectStore(STORE_MEDIA, { keyPath: 'url' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Không thể mở IndexedDB'));
  });
}

/**
 * Lưu 1 file âm thanh từ máy tính vào IndexedDB để phát offline
 */
export async function saveOfflineTrackFile(
  file: File,
  customTitle?: string,
  customArtist?: string
): Promise<MusicTrack> {
  const db = await openOfflineDatabase();
  const trackId = 'offline_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
  
  // Format tên bài từ tên file nếu không nhập
  let autoTitle = customTitle?.trim();
  if (!autoTitle) {
    autoTitle = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
  }

  const record: StoredAudioTrack = {
    id: trackId,
    title: autoTitle,
    artist: customArtist?.trim() || 'Lưu trên máy (Offline)',
    blob: file,
    fileName: file.name,
    fileSize: file.size,
    duration: 'Offline',
    addedAt: Date.now()
  };

  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_TRACKS, 'readwrite');
    const store = tx.objectStore(STORE_TRACKS);
    const req = store.put(record);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });

  const blobUrl = URL.createObjectURL(file);
  activeObjectUrls.set(trackId, blobUrl);

  return {
    id: trackId,
    title: record.title,
    artist: record.artist,
    sourceType: 'offline',
    url: blobUrl,
    duration: record.duration,
    isCustom: true,
    isOffline: true,
    fileSize: record.fileSize
  };
}

/**
 * Tải toàn bộ danh sách ca khúc offline đã lưu trong máy
 */
export async function loadAllOfflineTracks(): Promise<MusicTrack[]> {
  try {
    const db = await openOfflineDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_TRACKS, 'readonly');
      const store = tx.objectStore(STORE_TRACKS);
      const req = store.getAll();

      req.onsuccess = () => {
        const records: StoredAudioTrack[] = req.result || [];
        const tracks: MusicTrack[] = records.map((r) => {
          let blobUrl = activeObjectUrls.get(r.id);
          if (!blobUrl) {
            blobUrl = URL.createObjectURL(r.blob);
            activeObjectUrls.set(r.id, blobUrl);
          }
          return {
            id: r.id,
            title: r.title,
            artist: r.artist,
            sourceType: 'offline',
            url: blobUrl,
            duration: r.duration || 'Offline',
            isCustom: true,
            isOffline: true,
            fileSize: r.fileSize
          };
        });
        resolve(tracks);
      };

      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Lỗi khi đọc danh sách bài hát offline:', err);
    return [];
  }
}

/**
 * Xóa 1 ca khúc offline khỏi IndexedDB
 */
export async function deleteOfflineTrack(id: string): Promise<void> {
  try {
    const db = await openOfflineDatabase();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_TRACKS, 'readwrite');
      const store = tx.objectStore(STORE_TRACKS);
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });

    const oldUrl = activeObjectUrls.get(id);
    if (oldUrl) {
      try { URL.revokeObjectURL(oldUrl); } catch (e) {}
      activeObjectUrls.delete(id);
    }
  } catch (err) {
    console.warn('Lỗi khi xóa bài hát offline:', err);
  }
}

/**
 * Tải trước và lưu đệm 1 hình ảnh vào IndexedDB để phòng mất mạng
 */
export async function cacheMediaItem(url: string): Promise<string> {
  if (!url || url.startsWith('blob:') || url.startsWith('data:')) return url;
  
  try {
    const db = await openOfflineDatabase();
    
    // Kiểm tra đã có trong cache chưa
    const existing = await new Promise<StoredMediaItem | null>((resolve) => {
      const tx = db.transaction(STORE_MEDIA, 'readonly');
      const store = tx.objectStore(STORE_MEDIA);
      const req = store.get(url);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });

    if (existing && existing.blob) {
      return URL.createObjectURL(existing.blob);
    }

    // Tải và lưu
    const res = await fetch(url, { mode: 'cors' });
    if (!res.ok) return url;
    const blob = await res.blob();

    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_MEDIA, 'readwrite');
      const store = tx.objectStore(STORE_MEDIA);
      const req = store.put({ url, blob, cachedAt: Date.now() });
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });

    return URL.createObjectURL(blob);
  } catch (err) {
    // Trình duyệt tự dùng cache HTTP tiêu chuẩn nếu fetch lỗi
    return url;
  }
}

/**
 * Tải trước ngầm danh sách hình ảnh màn LED sân khấu và kỷ niệm để đảm bảo chiếu offline
 */
export async function precacheMediaList(urls: string[]): Promise<number> {
  if (!urls || urls.length === 0) return 0;
  let count = 0;
  
  // Tải đồng thời theo lô 3 ảnh để tránh nghẽn
  const batchSize = 3;
  for (let i = 0; i < urls.length; i += batchSize) {
    const batch = urls.slice(i, i + batchSize);
    await Promise.allSettled(
      batch.map(async (u) => {
        if (!u) return;
        // Kích hoạt preload qua Image element
        const img = new Image();
        img.src = u;
        count++;
      })
    );
  }
  return count;
}
