import axios from "axios"

console.log('=== API.JS LOADED ===');
console.log('localStorage token:', localStorage.getItem('token'));
console.log('localStorage userInfo:', localStorage.getItem('userInfo'));
console.log('localStorage adminInfo:', localStorage.getItem('adminInfo'));

// Cấu hình API cho kết nối với backend Laravel
const API_BASE_URL = "https://travel-app-api-ws77.onrender.com/api";

const axiosApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Thêm interceptor để tự động thêm token
axiosApi.interceptors.request.use(
  (config) => {
    // Thử lấy token trực tiếp trước (Laravel Sanctum format)
    let token = localStorage.getItem('token');
    console.log('Direct token from localStorage:', token);
    
    // Nếu không có direct token, thử lấy từ userInfo
    if (!token) {
      const userInfo = localStorage.getItem('userInfo');
      console.log('UserInfo from localStorage:', userInfo);
      
      if (userInfo) {
        try {
          const parsedUserInfo = JSON.parse(userInfo);
          token = parsedUserInfo.token;
          console.log('Token from userInfo:', token);
        } catch (e) {
          console.log('Failed to parse userInfo:', e);
        }
      }
    }
    
    // Nếu vẫn không có token, thử lấy từ adminInfo
    if (!token) {
      const adminInfo = localStorage.getItem('adminInfo');
      console.log('AdminInfo from localStorage:', adminInfo);
      
      if (adminInfo) {
        try {
          const parsedAdminInfo = JSON.parse(adminInfo);
          token = parsedAdminInfo.token;
          console.log('Token from adminInfo:', token);
        } catch (e) {
          console.log('Failed to parse adminInfo:', e);
        }
      }
    }
    
    console.log('=== FINAL TOKEN SELECTED ===');
    console.log('Selected token:', token);
    console.log('Token type:', typeof token);
    console.log('Token length:', token ? token.length : 0);
    
    if (token) {
      // Debug token
      console.log('Token before encoding:', token);
      console.log('Token length:', token.length);
      console.log('Token type:', typeof token);
      
      // Kiểm tra token có ký tự không hợp lệ không
      const hasInvalidChars = /[^\x00-\x7F]/.test(token);
      console.log('Has invalid chars:', hasInvalidChars);
      
      if (hasInvalidChars) {
        // Nếu có ký tự không hợp lệ, sử dụng base64
        const base64Token = btoa(token);
        console.log('Using base64 token:', base64Token);
        config.headers.Authorization = `Bearer ${base64Token}`;
      } else {
        // Nếu không có ký tự không hợp lệ, sử dụng trực tiếp
        console.log('Using direct token:', token);
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      console.log('Final Authorization header:', config.headers.Authorization);
    } else {
      console.log('No token found!');
    }
    
    // Debug request
    console.log('=== API REQUEST DEBUG ===');
    console.log('Request URL:', config.url);
    console.log('Request method:', config.method);
    console.log('Request headers:', config.headers);
    console.log('=== END DEBUG ===');
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const restaurantAPI = {
  getAll: (params = {}) => axiosApi.get("/Restaurant", { params }),
  getById: (id) => axiosApi.get(`/Restaurant/${id}`),
  getDishes: (restaurantId) => axiosApi.get(`/Restaurant/${restaurantId}/dishes`),
  create: (data) => axiosApi.post("/Restaurant", data),

  getReviews: (id) =>
  axiosApi.get(`/Restaurant/${id}/reviews`, {
    params: {
      reviewable_type: "App\\Models\\Restaurant",
      reviewable_id: id,
    },
  }),

getReviewStats: (id) =>
  axiosApi.get(`/Restaurant/${id}/reviews/stats`, {
    params: {
      type: "App\\Models\\Restaurant",
    },
  }),
  createReview: (id, data) => axiosApi.post(`/Restaurant/${id}`, data),
}
export const itinerariesAPI = {
  getAll: (params) => axiosApi.get("/itineraries", { params }),
  getById: (id) => axiosApi.get(`/itineraries/${id}`),
  create: (data) => axiosApi.post("/itineraries", data),
  update: (id, data) => axiosApi.put(`/itineraries/${id}`, data),
  delete: (id) => axiosApi.delete(`/itineraries/${id}`),
};

// Schedule API
export const scheduleAPI = {
  getAll: (params = {}) => axiosApi.get("/schedules", { params }),
  getById: (id) => axiosApi.get(`/schedules/${id}`),
  create: (data) => axiosApi.post("/schedules", data),
  update: (id, data) => axiosApi.put(`/schedules/${id}`, data),
  delete: (id) => axiosApi.delete(`/schedules/${id}`),
  getDefault: () => axiosApi.get("/schedules/default"),
};

// Schedule Items API
export const scheduleItemsAPI = {
  getAll: (params = {}) => axiosApi.get("/schedule-items", { params }),
  getById: (id) => axiosApi.get(`/schedule-items/${id}`),
  create: (data) => axiosApi.post("/schedule-items", data),
  update: (id, data) => axiosApi.put(`/schedule-items/${id}`, data),
  delete: (id) => axiosApi.delete(`/schedule-items/${id}`),
  getByDate: (params) => axiosApi.get("/schedule-items/by-date", { params }),
  getByDateRange: (params) => axiosApi.get("/schedule-items/by-date-range", { params }),
};

// Schedule Details API
export const scheduleDetailsAPI = {
  getAll: (params = {}) => axiosApi.get("/schedule-details", { params }),
  getById: (id) => axiosApi.get(`/schedule-details/${id}`),
  create: (data) => axiosApi.post("/schedule-details", data),
  update: (id, data) => axiosApi.put(`/schedule-details/${id}`, data),
  delete: (id) => axiosApi.delete(`/schedule-details/${id}`),
  getByType: (params) => axiosApi.get("/schedule-details/by-type", { params }),
  getByStatus: (params) => axiosApi.get("/schedule-details/by-status", { params }),
};

export const locationAPI = {
  getAll: (params = {}) => axiosApi.get("/Location", { params }),
  getById: (id) => axiosApi.get(`/Location/${id}`),
  create: (data) => axiosApi.post("/Location", data),
  update: (id, data) => axiosApi.put(`/Location/${id}`, data),
  delete: (id) => axiosApi.delete(`/Location/${id}`),
  getFeatured: (params = {}) => axiosApi.get("/Location/featured", { params }),
  getNearby: (params = {}) => axiosApi.get("/Location/nearby", { params }),
  getReviews: (id, params = {}) => axiosApi.get(`/Location/${id}/reviews`, { params }),
  createReview: (id, data) => axiosApi.post(`/Location/${id}/reviews`, data),
}

// Hàm helper để gọi API
const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  let defaultHeaders = {
    'Accept': 'application/json',
  };
  
  // Thêm token authentication
  let token = localStorage.getItem('user');
  
  // Nếu không có user token, thử lấy token từ token field
  if (!token) {
    const tokenData = localStorage.getItem('token');
    if (tokenData) {
      try {
        // Parse token nếu là JSON object
        const parsedToken = JSON.parse(tokenData);
        token = parsedToken.token || tokenData;
      } catch (e) {
        // Nếu không phải JSON, sử dụng trực tiếp
        token = tokenData;
      }
    }
  }
  
  if (token) {
    // Encode token để tránh ký tự không hợp lệ
    const encodedToken = encodeURIComponent(token);
    defaultHeaders['Authorization'] = `Bearer ${encodedToken}`;
  }
  
  let body = options.body;

  // Nếu body là FormData thì KHÔNG set Content-Type
  if (body instanceof FormData) {
    // Không set Content-Type, để trình duyệt tự động
  } else if (body && typeof body === 'object') {
    defaultHeaders['Content-Type'] = 'application/json';
    body = JSON.stringify(body);
  }

  const defaultOptions = {
    headers: {
      ...defaultHeaders,
      ...(options.headers || {})
    },
    ...options,
    body,
  };

  try {
    const response = await fetch(url, defaultOptions);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    // Đọc text, chỉ parse JSON nếu có nội dung
    const text = await response.text();
    return text ? JSON.parse(text) : {};
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};

// Các phương thức HTTP
export const api = {
  get: (endpoint, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    return apiCall(url, { method: 'GET' });
  },
  
  post: (endpoint, data = {}) => {
    return apiCall(endpoint, {
      method: 'POST',
      body: data,
    });
  },
  
  put: (endpoint, data = {}) => {
    return apiCall(endpoint, {
      method: 'PUT',
      body: data,
    });
  },
  
  patch: (endpoint, data = {}) => {
    return apiCall(endpoint, {
      method: 'PATCH',
      body: data,
    });
  },
  
  delete: (endpoint) => {
    return apiCall(endpoint, { method: 'DELETE' });
  },
};

export { axiosApi };
export default api; 
