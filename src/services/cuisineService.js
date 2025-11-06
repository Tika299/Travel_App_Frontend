import api from './api.js';

// Service cho Cuisine API
export const cuisineService = {
  // Lấy danh sách tất cả món ăn
  getAllCuisines: async (params = {}) => {
    try {
      const response = await api.get('/cuisines', params);
      return response;
    } catch (error) {
      console.error('Error fetching cuisines:', error);
      throw error;
    }
  },

  // Lấy món ăn theo ID
  getCuisineById: async (id) => {
    try {
      const response = await api.get(`/cuisines/${id}`);
      return response;
    } catch (error) {
      console.error('Error fetching cuisine:', error);
      throw error;
    }
  },

  // Tạo món ăn mới
  createCuisine: async (cuisineData) => {
    try {
      const response = await api.post('/cuisines', cuisineData);
      return response;
    } catch (error) {
      console.error('Error creating cuisine:', error);
      throw error;
    }
  },

  // Cập nhật món ăn
  updateCuisine: async (id, cuisineData) => {
    try {
      const response = await api.put(`/cuisines/${id}`, cuisineData);
      return response;
    } catch (error) {
      console.error('Error updating cuisine:', error);
      throw error;
    }
  },

  // Xóa món ăn
  deleteCuisine: async (id) => {
    try {
      return await api.delete(`/cuisines/${id}`);
    } catch (error) {
      console.error('Error deleting cuisine:', error);
      throw error;
    }
  },

  // Lấy món ăn theo danh mục
  getCuisinesByCategory: async (categoryId, params = {}) => {
    try {
      const response = await api.get('/cuisines', {
        category_id: categoryId,
        ...params
      });
      return response;
    } catch (error) {
      console.error('Error fetching cuisines by category:', error);
      throw error;
    }
  },

  // Lấy món ăn theo miền
  getCuisinesByRegion: async (region, params = {}) => {
    try {
      const response = await api.get('/cuisines', {
        region: region,
        ...params
      });
      return response;
    } catch (error) {
      console.error('Error fetching cuisines by region:', error);
      throw error;
    }
  },

  // Tìm kiếm món ăn
  searchCuisines: async (searchTerm, params = {}) => {
    try {
      const response = await api.get('/cuisines', {
        search: searchTerm,
        ...params
      });
      return response;
    } catch (error) {
      console.error('Error searching cuisines:', error);
      throw error;
    }
  },
};

export default cuisineService; 