// src/services/checkinPlaceService.js
import axios from 'axios';

// URL gốc của API Laravel - Đảm bảo đây là cổng mà Laravel đang chạy (thường là 8000)
const API_URL = 'http://localhost:8000/api';

// 📍 Lấy tất cả địa điểm check-in
export const getAllCheckinPlaces = () => {
    return axios.get(`${API_URL}/checkin-places`);
};

// 📍 Lấy chi tiết một địa điểm theo ID
export const getCheckinPlaceById = (id) => {
    return axios.get(`${API_URL}/checkin-places/${id}`);
};

// ➕ Thêm mới địa điểm
export const createCheckinPlace = (data) => {
    return axios.post(`${API_URL}/checkin-places`, data);
};

// 🔁 Cập nhật địa điểm theo ID
export const updateCheckinPlace = (id, data) => {
    if (data instanceof FormData) {
        // Laravel expects _method override when using POST with FormData for PUT/PATCH
        data.append('_method', 'PUT');
        return axios.post(`${API_URL}/checkin-places/${id}`, data);
    } else {
        // For plain JSON (if you don't use FormData for some updates)
        return axios.put(`${API_URL}/checkin-places/${id}`, data);
    }
};

// 🗑️ Xóa địa điểm theo ID
export const deleteCheckinPlace = (id) => {
    return axios.delete(`${API_URL}/checkin-places/${id}`);
};

// 📸 Gửi ảnh check-in của người dùng
export const submitCheckin = (formData) => {
    return axios.post(`${API_URL}/checkin-places/checkin`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};

// ✅ Sửa lỗi ở đây: Sử dụng API_URL
export const deleteCheckinPhoto = (photoId) => {
    return axios.delete(`${API_URL}/checkin-photos/${photoId}`);
};

// --- HÀM MỚI ---
// ⭐️ Lấy tất cả đánh giá của một địa điểm check-in cụ thể
export const getReviewsForCheckinPlace = (placeId) => {
    return axios.get(`${API_URL}/checkin-places/${placeId}/reviews`);
};

// 📝 Gửi đánh giá mới
export const submitReview = (reviewData) => {
    return axios.post(`${API_URL}/reviews`, reviewData, {
        headers: {
            'Content-Type': 'multipart/form-data', // Rất quan trọng khi gửi ảnh
        },
    });
};

// 📈 Lấy số liệu thống kê địa điểm check-in
export const getCheckinPlaceStatistics = async () => {
    try {
        // ✅ ĐÃ SỬA: Đảm bảo URL này khớp với route bạn đã định nghĩa trong Laravel
        // Laravel route: /api/checkin-places/statistics
        const response = await axios.get(`${API_URL}/checkin-places/statistics`);
        return response.data;
    } catch (error) {
        console.error('Error fetching checkin place statistics:', error);
        throw error;
    }
};