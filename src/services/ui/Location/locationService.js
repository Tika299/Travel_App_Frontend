// src/services/ui/Location/locationService.js

// Import Axios hoặc bất kỳ thư viện HTTP client nào bạn đang dùng
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://travel-app-api-ws77.onrender.com/api"; // Giả định base URL của API Laravel

/**
 * Hàm để lấy danh sách tất cả các locations (thành phố) từ API.
 * @returns {Promise<Array>} Danh sách các đối tượng location.
 */
export const fetchLocations = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/locations`);
        // Giả sử API trả về dữ liệu trực tiếp hoặc trong trường 'data'
        return response.data; // Hoặc response.data.data nếu API của bạn bọc trong 'data'
    } catch (error) {
        console.error("Error fetching locations:", error);
        throw error; // Ném lỗi để component có thể xử lý
    }
};