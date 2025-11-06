export function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

/**
 * Function để xử lý URL ảnh (hỗ trợ cả Google Drive và local storage)
 * @param {string} imagePath - Đường dẫn ảnh
 * @param {string} fallbackUrl - URL fallback khi không có ảnh
 * @returns {string} URL ảnh đầy đủ
 */
export const getImageUrl = (imagePath, fallbackUrl = "https://via.placeholder.com/400x300?text=No+Image") => {
  // Kiểm tra nếu imagePath là File object hoặc không phải string
  if (!imagePath || typeof imagePath !== 'string') {
    return fallbackUrl;
  }
  
  if (imagePath.trim() === '') {
    return fallbackUrl;
  }
  
  // Nếu là URL đầy đủ (Google Drive, external URL)
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  // Xử lý đường dẫn local storage
  let cleanPath = imagePath;
  
  // Nếu đã có http://localhost:8000/ thì bỏ đi để xử lý lại
  if (cleanPath.startsWith('http://localhost:8000/')) {
    cleanPath = cleanPath.substring(21); // Bỏ 'http://localhost:8000/'
  }
  
  // Loại bỏ dấu / ở đầu nếu có
  if (cleanPath.startsWith('/')) {
    cleanPath = cleanPath.substring(1);
  }
  
  // Nếu đường dẫn bắt đầu bằng uploads/ thì thêm storage/ vào đầu
  if (cleanPath.startsWith('uploads/')) {
    cleanPath = `storage/${cleanPath}`;
  }
  // Nếu đường dẫn không bắt đầu bằng storage/ và không phải uploads/ thì thêm storage/ vào đầu
  else if (!cleanPath.startsWith('storage/')) {
    cleanPath = `storage/${cleanPath}`;
  }
  
  // Thêm cache buster để force reload ảnh
  const cacheBuster = Date.now();
  return `http://localhost:8000/${cleanPath}?t=${cacheBuster}`;
};

/**
 * Function để xử lý URL ảnh với error handling
 * @param {string} imagePath - Đường dẫn ảnh
 * @param {string} fallbackUrl - URL fallback khi không có ảnh
 * @param {Function} onError - Callback khi ảnh lỗi
 * @returns {Object} Object chứa src và onError handler
 */
export const getImageWithErrorHandling = (imagePath, fallbackUrl = "https://via.placeholder.com/400x300?text=No+Image", onError = null) => {
  const src = getImageUrl(imagePath, fallbackUrl);
  
  return {
    src,
    onError: (e) => {
      console.error('Lỗi load ảnh:', e.target.src, 'Image field:', imagePath);
      e.target.src = fallbackUrl;
      if (onError) onError(e);
    }
  };
};
