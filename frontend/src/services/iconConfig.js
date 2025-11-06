import * as FaIcons from 'react-icons/fa';
import * as MdIcons from 'react-icons/md';
import * as IoIcons from 'react-icons/io';
import * as BsIcons from 'react-icons/bs'; 
import * as GiIcons from 'react-icons/gi';// Có thể thêm các module khác nếu cần

// Gộp tất cả các biểu tượng từ các module vào một object
const allIcons = {
  ...FaIcons,
  ...MdIcons,
  ...IoIcons,
  ...BsIcons,
  ...GiIcons,
};

// Hàm để lấy component biểu tượng dựa trên tên
export const getAmenityIcon = (iconName) => {
  return allIcons[iconName] || null; // Trả về null nếu không tìm thấy biểu tượng
};

// Hàm để lấy danh sách tất cả tên biểu tượng (dùng cho gợi ý trong form)
export const getAllIconNames = () => {
  return Object.keys(allIcons);
};