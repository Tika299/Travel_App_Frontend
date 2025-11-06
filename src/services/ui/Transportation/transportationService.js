// src/services/transportationService.js
import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

// 📌 Lấy tất cả loại phương tiện
export const getAllTransportations = () => axios.get(`${API_URL}/transportations`);

// 📌 Lấy chi tiết loại phương tiện theo ID
export const getTransportationById = (id) => axios.get(`${API_URL}/transportations/${id}`);

// 📌 Tạo mới loại phương tiện
export const createTransportation = (data) => axios.post(`${API_URL}/transportations`, data);

// 📌 Cập nhật loại phương tiện
export const updateTransportation = (id, data) => axios.put(`${API_URL}/transportations/${id}`, data);

// 📌 Xoá loại phương tiện
export const deleteTransportation = (id) => axios.delete(`${API_URL}/transportations/${id}`);

// 📌 Lấy danh sách gợi ý (tối đa 6)
export const getSuggestedTransportations = () => axios.get(`${API_URL}/transportations/suggested`);
