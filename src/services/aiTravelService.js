import { axiosApi } from './api';

export const aiTravelService = {
    async generateItinerary(data) {
        try {
            const response = await axiosApi.post('/ai/generate-itinerary', data);
            return response.data;
        } catch (error) {
            console.error('Error generating itinerary:', error);
            throw error;
        }
    },

    async saveItinerary(itineraryData) {
        try {
            const response = await axiosApi.post('/ai/save-itinerary', itineraryData);
            return response.data;
        } catch (error) {
            console.error('Error saving itinerary:', error);
            throw error;
        }
    },

    async getUpgradeInfo() {
        try {
            const response = await axiosApi.get('/ai/upgrade-info');
            return response.data;
        } catch (error) {
            console.error('Error getting upgrade info:', error);
            throw error;
        }
    },

    /**
     * Lấy chi tiết lịch trình với các event con
     */
    async getItineraryDetail(scheduleId) {
        try {
            const response = await axiosApi.get(`/ai/itinerary/${scheduleId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching itinerary detail:', error);
            throw error;
        }
    },

    /**
     * Cập nhật event con
     */
    async updateItineraryEvent(eventId, eventData) {
        try {
            const response = await axiosApi.put(`/ai/events/${eventId}`, eventData);
            return response.data;
        } catch (error) {
            console.error('Error updating itinerary event:', error);
            throw error;
        }
    },

    /**
     * Xóa event con
     */
    async deleteItineraryEvent(eventId) {
        try {
            const response = await axiosApi.delete(`/ai/events/${eventId}`);
            return response.data;
        } catch (error) {
            console.error('Error deleting itinerary event:', error);
            throw error;
        }
    },

    // Helper function to validate itinerary data
    validateItineraryData(data) {
        const errors = [];

        if (!data.destination || data.destination.trim() === '') {
            errors.push('Vui lòng nhập điểm đến');
        }

        if (!data.start_date) {
            errors.push('Vui lòng chọn ngày bắt đầu');
        }

        if (!data.end_date) {
            errors.push('Vui lòng chọn ngày kết thúc');
        }

        if (data.start_date && data.end_date) {
            const startDate = new Date(data.start_date);
            const endDate = new Date(data.end_date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (startDate < today) {
                errors.push('Ngày bắt đầu phải từ hôm nay trở đi');
            }

            if (endDate <= startDate) {
                errors.push('Ngày kết thúc phải sau ngày bắt đầu');
            }

            const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
            if (daysDiff > 5) {
                errors.push('Lịch trình tối đa 5 ngày cho tài khoản miễn phí');
            }
        }

        if (!data.budget || data.budget < 100000) {
            errors.push('Ngân sách tối thiểu 100,000 VND');
        }

        if (!data.travelers || data.travelers < 1 || data.travelers > 10) {
            errors.push('Số lượng người từ 1-10 người');
        }

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    },

    // Helper function to format itinerary for display
    formatItinerary(itinerary) {
        if (!itinerary || !itinerary.days) {
            return null;
        }

        return {
            summary: itinerary.summary,
            days: itinerary.days.map(day => ({
                ...day,
                activities: day.activities.map(activity => ({
                    ...activity,
                    formattedCost: new Intl.NumberFormat('vi-VN').format(activity.cost),
                    icon: this.getActivityIcon(activity.type),
                    color: this.getActivityColor(activity.type)
                }))
            }))
        };
    },

    getActivityIcon(type) {
        const icons = {
            'attraction': '🏛️',
            'hotel': '🏨',
            'restaurant': '🍽️',
            'transport': '🚗'
        };
        return icons[type] || '📍';
    },

    getActivityColor(type) {
        const colors = {
            'attraction': 'blue',
            'hotel': 'green',
            'restaurant': 'orange',
            'transport': 'purple'
        };
        return colors[type] || 'gray';
    },

    /**
     * Lấy icon cho loại event
     */
    getEventIcon(type) {
        const icons = {
            'activity': '🎯',
            'restaurant': '🍽️',
            'hotel': '🏨',
            'transport': '🚗',
            'shopping': '🛍️',
            'culture': '🏛️',
            'nature': '🌿',
            'entertainment': '🎪'
        };
        return icons[type] || '📍';
    },

    /**
     * Format thời gian hiển thị
     */
    formatTimeDisplay(startTime, endTime) {
        if (startTime && endTime) {
            return `${startTime} - ${endTime}`;
        } else if (startTime) {
            return startTime;
        }
        return '';
    },

    /**
     * Format chi phí hiển thị
     */
    formatCostDisplay(cost) {
        return new Intl.NumberFormat('vi-VN').format(cost) + ' VND';
    },

    /**
     * Nhóm events theo ngày
     */
    groupEventsByDate(events) {
        const grouped = {};
        events.forEach(event => {
            const date = event.date;
            if (!grouped[date]) {
                grouped[date] = [];
            }
            grouped[date].push(event);
        });
        
        // Sắp xếp events trong mỗi ngày theo order_index
        Object.keys(grouped).forEach(date => {
            grouped[date].sort((a, b) => a.order_index - b.order_index);
        });
        
        return grouped;
    }
};

