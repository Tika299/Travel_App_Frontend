import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const favouriteService = {
  getFavourites: async ({ page = 1, per_page = 10, type } = {}) => {
    try {
      const response = await axiosInstance.get('/favourites', {
        params: { page, per_page, type }, // Include type parameter
      });
      return {
        data: response.data.data,
        total: response.data.total,
      };
    } catch (error) {
      console.error('Lỗi khi lấy danh sách yêu thích:', error.response?.data || error.message);
      throw error;
    }
  },

  getCategoryCounts: async () => {
    try {
      const response = await axiosInstance.get('/favourites/counts');
      return response.data;
    } catch (error) {
      console.error('Lỗi khi lấy số lượng danh mục:', error.response?.data || error.message);
      throw error;
    }
  },

  addFavourite: async (favouritable_id, favouritable_type) => {
    try {
      const response = await axiosInstance.post('/favourites', {
        favouritable_id,
        favouritable_type,
      });
      return response.data;
    } catch (error) {
      console.error('Lỗi khi thêm yêu thích:', error.response?.data || error.message);
      throw error;
    }
  },

  checkFavouriteStatus: async (favouritable_id, favouritable_type) => {
    try {
      const response = await axiosInstance.post('/favourites/check-status', {
        favouritable_id,
        favouritable_type,
      });
      return response.data;
    } catch (error) {
      console.error('Lỗi khi kiểm tra trạng thái yêu thích:', error.response?.data || error.message);
      throw error;
    }
  },

  updateFavourite: async (id, data) => {
    try {
      const response = await axiosInstance.put(`/favourites/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi cập nhật yêu thích:', error.response?.data || error.message);
      throw error;
    }
  },

  deleteFavourite: async (id) => {
    try {
      const response = await axiosInstance.delete(`/favourites/${id}`);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi xóa yêu thích:', error.response?.data || error.message);
      throw error;
    }
  },
};