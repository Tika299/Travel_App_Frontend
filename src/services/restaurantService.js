import axios from 'axios';

const API_URL = 'https://travel-app-api-ws77.onrender.com/api';

const restaurantService = {
  // Lấy tổng số nhà hàng
  getTotalRestaurants: async () => {
    try {
      const response = await axios.get(`${API_URL}/restaurants/count`);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi lấy tổng số nhà hàng:', error);
      throw error;
    }
  },

  // Lấy danh sách nhà hàng
  getAllRestaurants: async (params = {}) => {
    try {
      const response = await axios.get(`${API_URL}/restaurants`, { params });
      return response.data;
    } catch (error) {
      console.error('Lỗi khi lấy danh sách nhà hàng:', error);
      throw error;
    }
  },

  // Lấy chi tiết nhà hàng
  getRestaurantById: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/restaurants/${id}`);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi lấy chi tiết nhà hàng:', error);
      throw error;
    }
  }
};

export default restaurantService;
