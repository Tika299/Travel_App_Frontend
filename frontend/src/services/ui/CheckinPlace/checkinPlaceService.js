// src/services/ui/CheckinPlace/checkinPlaceService.js
import axios from 'axios';

// URL gốc của API Laravel - Đảm bảo đây là cổng mà Laravel đang chạy (thường là 8000)
// Thay đổi URL để trỏ tới endpoint admin như trong Route::post của bạn.
// Hoặc bạn có thể tạo một biến khác nếu API admin có URL khác.
const API_URL = 'http://localhost:8000/api'; 


// 1. Tạo một instance Axios tùy chỉnh
const api = axios.create({
    baseURL: API_URL,
});

// 2. Thêm một interceptor cho các yêu cầu đi (request interceptor)
// Interceptor này sẽ được chạy trước khi mỗi yêu cầu được gửi đi
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token'); 

        // Nếu có token, thêm nó vào header Authorization với định dạng 'Bearer'
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        // Xử lý lỗi nếu có trong quá trình cấu hình request
        return Promise.reject(error);
    }
);

// 📍 Lấy tất cả địa điểm check-in
// Các hàm sau đây sẽ sử dụng instance 'api' thay vì 'axios' trực tiếp
export const getAllCheckinPlaces = () => {
    return api.get(`/checkin-places`);
};

// 📍 Lấy chi tiết một địa điểm theo ID
export const getCheckinPlaceById = (id) => {
    return api.get(`/checkin-places/${id}`);
};

// ➕ Thêm mới địa điểm
export const createCheckinPlace = (data) => {
    return api.post(`/checkin-places`, data);
};

// 🔁 Cập nhật địa điểm theo ID
export const updateCheckinPlace = (id, data) => {
    if (data instanceof FormData) {
        data.append('_method', 'PUT');
        return api.post(`/checkin-places/${id}`, data);
    } else {
        return api.put(`/checkin-places/${id}`, data);
    }
};

// 🗑️ Xóa địa điểm theo ID
export const deleteCheckinPlace = (id) => {
    return api.delete(`/checkin-places/${id}`);
};

// 📸 Gửi ảnh check-in của người dùng
export const submitCheckin = (formData) => {
    return api.post(`/checkin-places/checkin`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};

// ✅ Sửa lỗi ở đây: Sử dụng API_URL
export const deleteCheckinPhoto = (photoId) => {
    return api.delete(`/checkin-photos/${photoId}`);
};

// --- HÀM MỚI ---
// ⭐️ Lấy tất cả đánh giá của một địa điểm check-in cụ thể
export const getReviewsForCheckinPlace = (placeId) => {
    return api.get(`/checkin-places/${placeId}/reviews`);
};

// 📝 Gửi đánh giá mới - Hàm này sẽ TỰ ĐỘNG CÓ TOKEN nhờ interceptor
export const submitReview = (reviewData) => {
    return api.post(`/reviews`, reviewData, {
        headers: {
            'Content-Type': 'multipart/form-data', // Rất quan trọng khi gửi ảnh
        },
    });
};

// 📈 Lấy số liệu thống kê địa điểm check-in
export const getCheckinPlaceStatistics = async () => {
    try {
        const response = await api.get(`/checkin-places/statistics`);
        return response.data;
    } catch (error) {
        console.error('Error fetching checkin place statistics:', error);
        throw error;
    }
};

// 📥 HÀM MỚI ĐỂ IMPORT EXCEL
// Sử dụng instance 'api' để tự động đính kèm token xác thực
export const uploadCheckinPlacesExcel = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
        // Sử dụng endpoint admin bạn đã định nghĩa
        const response = await api.post(
            `/checkin-places/import`,
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            }
        );
        return response.data;
    } catch (error) {
        // Ném ra lỗi để component gọi có thể bắt và xử lý
        throw error.response?.data || error.message; 
    }
};