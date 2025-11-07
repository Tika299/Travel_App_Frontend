import { axiosApi } from './api';

const API_BASE_URL = 'https://travel-app-api-ws77.onrender.com/api';

export const featuredActivitiesService = {
    // Lấy hoạt động nổi bật theo ngày
    async getFeaturedActivities(date, location = '', budget = 0) {
        try {
            const params = new URLSearchParams({
                date: date,
                location: location,
                budget: budget
            });

            const response = await axiosApi.get(`/featured-activities?${params}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching featured activities:', error);
            throw error;
        }
    },

    // Lấy hoạt động nổi bật cho ngày hôm nay
    async getTodayFeaturedActivities(location = '', budget = 0) {
        const today = new Date().toISOString().split('T')[0];
        return this.getFeaturedActivities(today, location, budget);
    },

    // Lấy hoạt động nổi bật cho ngày được chọn
    async getSelectedDateActivities(selectedDate, location = '', budget = 0) {
        return this.getFeaturedActivities(selectedDate, location, budget);
    }
};
