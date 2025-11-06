import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/hotels';

export const getAllHotels = (perPage = 10, page = 1) => {
  return axios.get(`${API_BASE_URL}?per_page=${perPage}&page=${page}`);
};

export const getHotelById = (id) => {
  return axios.get(`${API_BASE_URL}/${id}`);
};

export const createHotel = (hotelData) => {

  // Khi tạo mới, luôn dùng POST với FormData nếu có file hoặc dữ liệu phức tạp
  return axios.post(API_BASE_URL, hotelData, {
    headers: {
      'Content-Type': 'multipart/form-data' // Đảm bảo luôn gửi multipart/form-data khi tạo mới
    }
  });
};

export const updateHotel = (id, hotelData) => { // hotelData ở đây là FormData
  // hotelData đã chứa _method: 'PUT' từ frontend, không cần thêm lại
  return axios.post(`${API_BASE_URL}/${id}`, hotelData, {
    headers: {
      'Content-Type': 'multipart/form-data' // Luôn khai báo để đảm bảo đúng định dạng
    }
  });
};


export const deleteHotel = (id) => {
  return axios.delete(`${API_BASE_URL}/${id}`);
};

export const getSuggestedHotels = () => {
  return axios.get(`${API_BASE_URL}/suggested`);
};

export const getPopularHotels = () => {
  return axios.get(`${API_BASE_URL}/popular`);
};