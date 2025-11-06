import { useEffect } from 'react';

const SEOHead = ({ 
  title, 
  description, 
  image, 
  url, 
  type = 'website',
  keywords = ''
}) => {
  useEffect(() => {
    // Cập nhật title
    document.title = title || 'Travel App - Khám phá ẩm thực Việt Nam';
    
    // Cập nhật hoặc tạo meta tags
    const updateMetaTag = (property, content) => {
      let meta = document.querySelector(`meta[property="${property}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('property', property);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    const updateNameTag = (name, content) => {
      let meta = document.querySelector(`meta[name="${name}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', name);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    // Open Graph tags - Cải thiện cho Facebook
    updateMetaTag('og:title', title || 'Travel App - Khám phá ẩm thực Việt Nam');
    updateMetaTag('og:description', description || 'Khám phá những món ăn ngon nhất Việt Nam');
    updateMetaTag('og:image', image || 'https://via.placeholder.com/1200x630/FF6B35/FFFFFF?text=Travel+App');
    updateMetaTag('og:url', url || window.location.href);
    updateMetaTag('og:type', type);
    updateMetaTag('og:site_name', 'Travel App - Khám phá ẩm thực Việt Nam');
    updateMetaTag('og:locale', 'vi_VN');
    
    // Thêm kích thước ảnh cho Facebook
    updateMetaTag('og:image:width', '1200');
    updateMetaTag('og:image:height', '630');
    updateMetaTag('og:image:type', 'image/png');
    updateMetaTag('og:image:alt', title || 'Travel App - Khám phá ẩm thực Việt Nam');
    
    // Thêm canonical URL
    updateMetaTag('og:url', url || window.location.href);

    // Twitter Card tags
    updateNameTag('twitter:card', 'summary_large_image');
    updateNameTag('twitter:title', title || 'Travel App - Khám phá ẩm thực Việt Nam');
    updateNameTag('twitter:description', description || 'Khám phá những món ăn ngon nhất Việt Nam');
    updateNameTag('twitter:image', image || 'https://via.placeholder.com/1200x630/FF6B35/FFFFFF?text=Travel+App');
    updateNameTag('twitter:site', '@travelapp');
    updateNameTag('twitter:creator', '@travelapp');

    // Description và keywords
    updateNameTag('description', description || 'Khám phá những món ăn ngon nhất Việt Nam');
    if (keywords) {
      updateNameTag('keywords', keywords);
    }

    // Thêm canonical URL
    updateMetaTag('og:url', url || window.location.href);



  }, [title, description, image, url, type, keywords]);

  return null; // Component này không render gì
};

export default SEOHead;
