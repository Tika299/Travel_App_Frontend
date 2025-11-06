import { axiosApi } from './api';

export const eventService = {
  // Lưu event mới
  async createEvent(eventData) {
    try {
      const response = await axiosApi.post('/events', eventData);
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        throw new Error('Vui lòng đăng nhập để lưu event');
      }
      throw error;
    }
  },

  // Lấy tất cả events của user
  async getUserEvents() {
    try {
      const response = await axiosApi.get('/events');
      console.log('API Response:', response.data);
      
      // Đảm bảo trả về array
      const events = Array.isArray(response.data) ? response.data : [];
      console.log('Processed events:', events);
      
      return events;
    } catch (error) {
      if (error.response?.status === 401) {
        throw new Error('Vui lòng đăng nhập để xem events');
      }
      console.error('Error fetching events:', error);
      return [];
    }
  },

  // Kiểm tra user đã đăng nhập chưa
  isLoggedIn() {
    // Kiểm tra token trực tiếp
    const directToken = localStorage.getItem('token');
    if (directToken) return true;

    // Kiểm tra userInfo
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      try {
        const parsedUserInfo = JSON.parse(userInfo);
        return !!parsedUserInfo.token;
      } catch (e) {
        return false;
      }
    }

    // Kiểm tra adminInfo
    const adminInfo = localStorage.getItem('adminInfo');
    if (adminInfo) {
      try {
        const parsedAdminInfo = JSON.parse(adminInfo);
        return !!parsedAdminInfo.token;
      } catch (e) {
        return false;
      }
    }

    return false;
  },

  // Cập nhật event khi kéo sang ngày khác
  async updateEvent(id, eventData) {
    try {
      const response = await axiosApi.put(`/events/${id}`, eventData);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi cập nhật event:', error);
      throw error;
    }
  },

  // Xóa event
  async deleteEvent(id) {
    try {
      const response = await axiosApi.delete(`/events/${id}`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        throw new Error('Vui lòng đăng nhập để xóa event');
      }
      console.error('Lỗi khi xóa event:', error);
      throw error;
    }
  },

  // Cập nhật thông tin event
  async updateEventInfo(id, eventData) {
    try {
      const response = await axiosApi.put(`/events/${id}/info`, eventData);
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        throw new Error('Vui lòng đăng nhập để cập nhật event');
      }
      console.error('Lỗi khi cập nhật event:', error);
      throw error;
    }
  },

  // Chia sẻ event qua email
  async shareEvent(id, email, message = '') {
    try {
      const response = await axiosApi.post(`/events/${id}/share`, {
        email: email,
        message: message
      });
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        throw new Error('Vui lòng đăng nhập để chia sẻ event');
      }
      console.error('Lỗi khi chia sẻ event:', error);
      throw error;
    }
  }
}; 