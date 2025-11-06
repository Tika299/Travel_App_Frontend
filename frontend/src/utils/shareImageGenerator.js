// Utility để tạo ảnh chia sẻ động
export const generateShareImage = (cuisineData) => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = 1200;
  canvas.height = 630;

  // Background gradient đẹp
  const gradient = ctx.createLinearGradient(0, 0, 1200, 630);
  gradient.addColorStop(0, '#FF6B35');
  gradient.addColorStop(0.5, '#F7931E');
  gradient.addColorStop(1, '#FF8C42');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 1200, 630);

  // Thêm pattern overlay
  ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
  for (let i = 0; i < 1200; i += 50) {
    for (let j = 0; j < 630; j += 50) {
      ctx.fillRect(i, j, 2, 2);
    }
  }

  // Logo/Title chính
  ctx.fillStyle = 'white';
  ctx.font = 'bold 60px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('🍜 Travel App', 600, 80);

  // Tên món ăn
  ctx.font = 'bold 48px Arial';
  const cuisineName = cuisineData.name || 'Món ăn ngon';
  ctx.fillText(cuisineName, 600, 160);

  // Mô tả
  ctx.font = '28px Arial';
  const description = cuisineData.description || 'Món ăn truyền thống Việt Nam';
  const words = description.split(' ');
  let line = '';
  let y = 220;
  for (let word of words) {
    const testLine = line + word + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > 1000) {
      ctx.fillText(line, 600, y);
      line = word + ' ';
      y += 40;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, 600, y);

  // Thông tin bổ sung
  y += 60;
  ctx.font = 'bold 32px Arial';
  
  // Giá
  if (cuisineData.price_formatted || cuisineData.price) {
    ctx.fillText(`💰 ${cuisineData.price_formatted || cuisineData.price}`, 600, y);
    y += 50;
  }

  // Loại món ăn
  if (cuisineData.category) {
    const categoryName = typeof cuisineData.category === 'object' ? cuisineData.category.name : cuisineData.category;
    ctx.font = '24px Arial';
    ctx.fillText(`📂 ${categoryName}`, 600, y);
    y += 40;
  }

  // Footer
  ctx.font = 'bold 24px Arial';
  ctx.fillText('🇻🇳 Khám phá ẩm thực Việt Nam', 600, 580);

  // Thêm border
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.lineWidth = 4;
  ctx.strokeRect(20, 20, 1160, 590);

  return canvas.toDataURL('image/png');
};

// Function để tạo URL ảnh placeholder với thông tin
export const createPlaceholderImage = (cuisineName, description = '') => {
  const text = encodeURIComponent(cuisineName || 'Travel App');
  const desc = encodeURIComponent(description || 'Khám phá ẩm thực Việt Nam');
  return `https://via.placeholder.com/1200x630/FF6B35/FFFFFF?text=${text}`;
};

// Function để kiểm tra ảnh có thể truy cập được không
export const checkImageAccessibility = async (imageUrl) => {
  try {
    const response = await fetch(imageUrl, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    return false;
  }
};
