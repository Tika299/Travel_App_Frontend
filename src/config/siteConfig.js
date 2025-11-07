// Cấu hình domain cho website
const siteConfig = {
  // Thay đổi domain này khi deploy lên production
  domain: process.env.NODE_ENV === 'production' 
    ? 'https://your-domain.com' 
    : 'http://localhost:5173',
  
  // API URL
  apiUrl: process.env.NODE_ENV === 'production'
    ? 'https://your-api-domain.com'
    : 'https://travel-app-api-ws77.onrender.com',
  
  // Tên website
  siteName: 'Travel App - Khám phá ẩm thực Việt Nam',
  
  // Mô tả mặc định
  defaultDescription: 'Khám phá những món ăn ngon nhất Việt Nam',
  
  // Ảnh mặc định cho social sharing
  defaultImage: 'https://via.placeholder.com/1200x630/FF6B35/FFFFFF?text=Travel+App',
};

export default siteConfig;
