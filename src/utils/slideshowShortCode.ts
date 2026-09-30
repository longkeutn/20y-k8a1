import { PhotoAlbum, MemoryImage } from '../types';
import { DEFAULT_ALBUMS, DEFAULT_MEMORIES, normalizeAlbumId, getPhotoAlbumId } from '../data';

/**
 * Danh sách mã định danh album ngắn dạng số (1 - 6)
 */
export const ALBUM_SHORT_CODE_MAP: Record<number, string> = {
  1: 'thanh-xuan-2003-2006',
  2: 'thay-co-mai-truong',
  3: 'hoi-ngo-10-nam',
  4: 'hoi-ngo-15-nam',
  5: 'dai-le-20-nam',
  6: 'dong-gop-k8a1'
};

export const REVERSE_ALBUM_SHORT_CODE_MAP: Record<string, number> = {
  'thanh-xuan-2003-2006': 1,
  'thay-co-mai-truong': 2,
  'hoi-ngo-10-nam': 3,
  'hoi-ngo-15-nam': 4,
  'dai-le-20-nam': 5,
  'dong-gop-k8a1': 6
};

/**
 * Lấy mã số ngắn (Short Code) cho Album và Folder con
 * Ví dụ: 
 * - Album 1, toàn bộ -> '1'
 * - Album 1, folder con thứ 2 -> '1.2' hoặc '1-2'
 */
export function generateSlideshowShortCode(
  albumId: string,
  subfolderName?: string,
  albums: PhotoAlbum[] = DEFAULT_ALBUMS,
  images: MemoryImage[] = DEFAULT_MEMORIES
): string {
  const normAlbumId = normalizeAlbumId(albumId);
  const mediaList = images && images.length > 0 ? images : DEFAULT_MEMORIES;
  
  // Tìm số thứ tự album (1-indexed)
  let albumNum = REVERSE_ALBUM_SHORT_CODE_MAP[normAlbumId];
  if (!albumNum) {
    const foundIdx = albums.findIndex(a => normalizeAlbumId(a.id) === normAlbumId);
    albumNum = foundIdx >= 0 ? foundIdx + 1 : 1;
  }

  // Nếu không chọn folder con hoặc chọn "all", trả về mã số album đơn
  if (!subfolderName || subfolderName === 'all' || !subfolderName.trim()) {
    return String(albumNum);
  }

  // Nếu có folder con, tìm thứ tự của folder con trong album đó
  const subfoldersList: string[] = [];
  mediaList.forEach(img => {
    const imgAlbum = normalizeAlbumId(img.albumId || getPhotoAlbumId(img));
    if (imgAlbum === normAlbumId) {
      const rawSub = (img.subfolderName || '').trim();
      if (rawSub && !rawSub.toLowerCase().includes('thư mục không có tiêu đề') && !subfoldersList.includes(rawSub)) {
        subfoldersList.push(rawSub);
      }
    }
  });

  const subIdx = subfoldersList.indexOf(subfolderName.trim());
  if (subIdx >= 0) {
    return `${albumNum}.${subIdx + 1}`;
  }

  return String(albumNum);
}

/**
 * Giải mã mã ngắn (Short Code) từ URL thành Album ID và Subfolder
 * Hỗ trợ các định dạng:
 * - '1', '2', '3'... -> Album số 1, 2, 3...
 * - '1.2' hoặc '1-2' hoặc '1_2' -> Album 1, Subfolder số 2
 * - 'cap3', 'thayco', '10y', '15y', '20y', 'donggop' -> Alias chữ ngắn
 */
export function resolveSlideshowShortCode(
  code: string,
  albums: PhotoAlbum[] = DEFAULT_ALBUMS,
  images: MemoryImage[] = DEFAULT_MEMORIES
): { albumId: string; subfolder: string } {
  if (!code || !code.trim()) {
    return { albumId: 'thanh-xuan-2003-2006', subfolder: 'all' };
  }

  const cleanCode = code.trim().toLowerCase();

  // Alias chữ ngắn gọn
  if (cleanCode === 'cap3' || cleanCode === 'hocsinh') return { albumId: 'thanh-xuan-2003-2006', subfolder: 'all' };
  if (cleanCode === 'thayco' || cleanCode === 'giaovien') return { albumId: 'thay-co-mai-truong', subfolder: 'all' };
  if (cleanCode === '10y' || cleanCode === '10nam') return { albumId: 'hoi-ngo-10-nam', subfolder: 'all' };
  if (cleanCode === '15y' || cleanCode === '15nam') return { albumId: 'hoi-ngo-15-nam', subfolder: 'all' };
  if (cleanCode === '20y' || cleanCode === '20nam' || cleanCode === 'daile') return { albumId: 'dai-le-20-nam', subfolder: 'all' };
  if (cleanCode === 'donggop' || cleanCode === 'thanhvien') return { albumId: 'dong-gop-k8a1', subfolder: 'all' };

  // Tách albumNum và subNum từ dấu '.', '-', hoặc '_'
  const parts = cleanCode.split(/[.\-_]/);
  const albumNum = parseInt(parts[0], 10);

  let targetAlbumId = 'thanh-xuan-2003-2006';
  if (!isNaN(albumNum) && albumNum >= 1) {
    if (ALBUM_SHORT_CODE_MAP[albumNum]) {
      targetAlbumId = ALBUM_SHORT_CODE_MAP[albumNum];
    } else if (albums[albumNum - 1]) {
      targetAlbumId = albums[albumNum - 1].id;
    }
  }

  let targetSubfolder = 'all';
  if (parts.length > 1) {
    const subNum = parseInt(parts[1], 10);
    if (!isNaN(subNum) && subNum >= 1) {
      // Tìm danh sách folder con của album này
      const mediaList = images && images.length > 0 ? images : DEFAULT_MEMORIES;
      const subfoldersList: string[] = [];
      const normTarget = normalizeAlbumId(targetAlbumId);

      mediaList.forEach(img => {
        const imgAlbum = normalizeAlbumId(img.albumId || getPhotoAlbumId(img));
        if (imgAlbum === normTarget) {
          const rawSub = (img.subfolderName || '').trim();
          if (rawSub && !rawSub.toLowerCase().includes('thư mục không có tiêu đề') && !subfoldersList.includes(rawSub)) {
            subfoldersList.push(rawSub);
          }
        }
      });

      if (subfoldersList[subNum - 1]) {
        targetSubfolder = subfoldersList[subNum - 1];
      }
    }
  }

  return { albumId: targetAlbumId, subfolder: targetSubfolder };
}
