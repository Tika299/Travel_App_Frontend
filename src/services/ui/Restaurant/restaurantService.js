// src/services/ui/Hotel/hotelService.js
import axios from 'axios';
const API_BASE_URL = import.meta.env.VITE_API_URL || "https://travel-app-api-ws77.onrender.com/api";

const restaurantService = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});
export const restaurantAPI = {
   getReviews: (id, params = {}) =>
    restaurantService.get(`/Restaurant/${id}`, { params }),
  getDishes: (restaurantId) => restaurantService.get(`/Restaurant/${restaurantId}/dishes`),
  getAll: (params = {}) => restaurantService.get("/Restaurant", { params }),
  getById: (id) => restaurantService.get(`/Restaurant/show/${id}`),
  create: (data) =>
    restaurantService.post("/Restaurant", data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),

  update: (id, data) => {
    data.append("_method", "PUT"); // Laravel cần _method nếu gửi qua POST
    return restaurantService.post(`/Restaurant/${id}`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
  destroy: (id) => restaurantService.delete(`/Restaurant/delete/${id}`),
  getReviewStats: (id) =>
    restaurantService.get(`/Restaurant/${id}/reviews/stats`, {
      params: {
        type: "App\\Models\\Restaurant",
      },
    }),
};
export default restaurantService;
