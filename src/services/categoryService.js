import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

const categoryService = {
  // Lấy tất cả categories
  getAllCategories: async (params = {}) => {
    try {
      const response = await axios.get(`${API_URL}/categories`, { params });
      return response.data;
    } catch (error) {
      console.error('Lỗi khi lấy danh sách danh mục:', error);
      throw error;
    }
  },

  // Lấy category theo ID
  getCategoryById: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/categories/${id}`);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi lấy chi tiết danh mục:', error);
      throw error;
    }
  },

  // Tạo category mới
  createCategory: async (categoryData) => {
    try {
      let response;
      
      // Kiểm tra xem có file ảnh không
      if (categoryData.icon instanceof File) {
        // Nếu có file, gửi FormData
        const formData = new FormData();
        formData.append('name', categoryData.name || '');
        formData.append('type', categoryData.type || '');
        formData.append('icon', categoryData.icon);
        
        response = await axios.post(`${API_URL}/categories`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      } else {
        // Nếu không có file, gửi JSON
        response = await axios.post(`${API_URL}/categories`, categoryData);
      }
      
      return response.data;
    } catch (error) {
      console.error('Lỗi khi tạo danh mục:', error);
      throw error;
    }
  },

  // Cập nhật category
  updateCategory: async (id, categoryData) => {
    try {
      console.log('🔧 categoryService.updateCategory called with:', categoryData);
      let response;
      
      // Kiểm tra xem có file ảnh không
      if (categoryData.icon instanceof File) {
        // Nếu có file, gửi FormData
        const formData = new FormData();
        formData.append('name', categoryData.name || '');
        formData.append('type', categoryData.type || '');
        formData.append('icon', categoryData.icon);
        
        console.log('🔧 Sending FormData with file:', categoryData.icon.name);
        response = await axios.put(`${API_URL}/categories/${id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      } else {
        // Nếu không có file, gửi JSON
        console.log('🔧 Sending JSON data:', categoryData);
        response = await axios.put(`${API_URL}/categories/${id}`, categoryData);
      }
      
      console.log('🔧 Response received:', response.data);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi cập nhật danh mục:', error);
      throw error;
    }
  },

  // Xóa category
  deleteCategory: async (id) => {
    try {
      const response = await axios.delete(`${API_URL}/categories/${id}`);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi xóa danh mục:', error);
      throw error;
    }
  },

  // Import categories từ Excel
  importCategories: async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(`${API_URL}/categories/import`, formData);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi import danh mục:', error);
      throw error;
    }
  },

  // Lấy danh mục với số lượng món ăn
  getCategoriesWithCuisinesCount: async () => {
    try {
      const response = await axios.get(`${API_URL}/categories`, {
        params: {
          with_cuisines_count: true
        }
      });
      return response.data;
    } catch (error) {
      console.error('Lỗi khi lấy danh mục với số lượng món ăn:', error);
      throw error;
    }
  }
};

export default categoryService; 