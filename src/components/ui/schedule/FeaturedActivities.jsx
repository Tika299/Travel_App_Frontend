import React, { useState, useEffect } from 'react';
import { featuredActivitiesService } from '../../../services/featuredActivitiesService';
import { 
    FiCalendar, 
    FiClock, 
    FiMapPin, 
    FiGift, 
    FiActivity, 
    FiStar,
    FiCoffee,
    FiCamera,
    FiShoppingBag,
    FiMusic,
    FiBook,
    FiHeart,
    FiZap,
    FiSun,
    FiCloud,
    FiCloudRain
} from 'react-icons/fi';

const FeaturedActivities = ({ selectedDate, location, budget, onActivityClick }) => {
    const [nextActivity, setNextActivity] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Chỉ load khi có selectedDate và không có location (hoặc location đã ổn định)
        if (selectedDate) {
            loadNextActivity();
        }
    }, [selectedDate, budget]); // Bỏ location khỏi dependencies

    const loadNextActivity = async () => {
        setLoading(true);
        setError(null);
        try {
            // Debug: Kiểm tra authentication
            console.log('=== FeaturedActivities Debug ===');
            console.log('localStorage token:', localStorage.getItem('token'));
            console.log('localStorage userInfo:', localStorage.getItem('userInfo'));
            console.log('localStorage adminInfo:', localStorage.getItem('adminInfo'));
            
            // Kiểm tra xem có token không
            const token = localStorage.getItem('token') || 
                         (localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')).token : null) ||
                         (localStorage.getItem('adminInfo') ? JSON.parse(localStorage.getItem('adminInfo')).token : null);
            
            if (!token) {
                setError('Chưa đăng nhập. Vui lòng đăng nhập để xem hoạt động sắp tới.');
                setLoading(false);
                return;
            }
            
            // Lấy hoạt động cho ngày hôm nay và 7 ngày tới
            const today = new Date();
            const nextWeek = new Date();
            nextWeek.setDate(today.getDate() + 7);
            
            console.log('Calling API with params:', { selectedDate, location, budget });
            
            const data = await featuredActivitiesService.getFeaturedActivities(
                selectedDate, 
                '', // Không sử dụng location từ props để tránh reload liên tục
                budget || 0
            );
            
            console.log('API response:', data);
            
            // Chỉ lấy user events từ database, không lấy smart suggestions
            const userActivities = data.user_events.map(event => ({ ...event, source: 'user' }));
            
            // Lọc và sắp xếp theo thời gian sắp tới
            const sortedActivities = userActivities
                .filter(activity => {
                    if (activity.start_date) {
                        const activityDate = new Date(activity.start_date);
                        return activityDate >= today;
                    }
                    return false; // Nếu không có start_date thì loại bỏ
                })
                .sort((a, b) => {
                    return new Date(a.start_date) - new Date(b.start_date);
                });
            
            setNextActivity(sortedActivities[0] || null);
        } catch (err) {
            setError('Không thể tải hoạt động nổi bật');
            console.error('Error loading featured activities:', err);
        } finally {
            setLoading(false);
        }
    };

    const getColorClass = (color) => {
        const colorMap = {
            'blue': 'bg-blue-50 border-blue-200 hover:bg-blue-100',
            'green': 'bg-green-50 border-green-200 hover:bg-green-100',
            'purple': 'bg-purple-50 border-purple-200 hover:bg-purple-100',
            'orange': 'bg-orange-50 border-orange-200 hover:bg-orange-100',
            'red': 'bg-red-50 border-red-200 hover:bg-red-100',
            'yellow': 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100'
        };
        return colorMap[color] || 'bg-gray-50 border-gray-200 hover:bg-gray-100';
    };

    const formatTime = (dateString) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleTimeString('vi-VN', { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
        } catch (e) {
            return '';
        }
    };

    const formatDate = (dateString) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('vi-VN', { 
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        } catch (e) {
            return '';
        }
    };

    const handleActivityClick = (activity) => {
        if (onActivityClick) {
            onActivityClick(activity);
        }
    };

    // Hàm chọn icon dựa trên loại hoạt động
    const getActivityIcon = (activity) => {
        const title = activity.title?.toLowerCase() || '';
        const description = activity.description?.toLowerCase() || '';
        
        // Kiểm tra từ khóa trong title và description
        if (title.includes('cafe') || title.includes('coffee') || description.includes('cafe')) {
            return <FiCoffee className="text-2xl text-orange-500" />;
        }
        if (title.includes('chụp') || title.includes('photo') || title.includes('camera') || description.includes('chụp')) {
            return <FiCamera className="text-2xl text-purple-500" />;
        }
        if (title.includes('mua sắm') || title.includes('shopping') || description.includes('mua sắm')) {
            return <FiShoppingBag className="text-2xl text-pink-500" />;
        }
        if (title.includes('nhạc') || title.includes('music') || description.includes('nhạc')) {
            return <FiMusic className="text-2xl text-green-500" />;
        }
        if (title.includes('đọc') || title.includes('book') || description.includes('đọc')) {
            return <FiBook className="text-2xl text-blue-500" />;
        }
        if (title.includes('yoga') || title.includes('gym') || description.includes('yoga')) {
            return <FiActivity className="text-2xl text-red-500" />;
        }
        if (title.includes('du lịch') || title.includes('travel') || description.includes('du lịch')) {
            return <FiMapPin className="text-2xl text-indigo-500" />;
        }
        if (title.includes('ăn') || title.includes('food') || description.includes('ăn')) {
            return <FiCoffee className="text-2xl text-yellow-500" />;
        }
        if (title.includes('thời tiết') || description.includes('thời tiết')) {
            return <FiSun className="text-2xl text-yellow-400" />;
        }
        if (title.includes('mưa') || description.includes('mưa')) {
            return <FiCloudRain className="text-2xl text-blue-400" />;
        }
        if (title.includes('âm u') || description.includes('âm u')) {
            return <FiCloud className="text-2xl text-gray-400" />;
        }
        
        // Icon mặc định cho các hoạt động khác
        return <FiStar className="text-2xl text-blue-500" />;
    };

    if (loading) {
        return (
            <div className="bg-white rounded-lg p-4 shadow-sm border w-full max-w-full overflow-hidden">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                    <FiGift className="text-gray-400 mr-2 text-xl" />
                    Hoạt động sắp tới
                </h3>
                <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white rounded-lg p-4 shadow-sm border w-full max-w-full overflow-hidden">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                    <FiGift className="text-gray-400 mr-2 text-xl" />
                    Hoạt động sắp tới
                </h3>
                <div className="text-red-500 text-sm">{error}</div>
            </div>
        );
    }

    if (!nextActivity) {
        return (
            <div className="bg-white rounded-lg p-4 shadow-sm border w-full max-w-full overflow-hidden">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                    <FiGift className="text-gray-400 mr-2 text-xl" />
                    Hoạt động sắp tới
                </h3>
                <div className="text-gray-500 text-sm">
                    Không có hoạt động nào sắp tới
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg p-4 shadow-sm border w-full max-w-full overflow-hidden">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                <FiGift className="text-gray-400 mr-2 text-xl" />
                Hoạt động sắp tới
            </h3>
            <div 
                className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md hover:scale-105 ${getColorClass(nextActivity.color)} w-full max-w-full overflow-hidden`}
                onClick={() => handleActivityClick(nextActivity)}
            >
                <div className="flex items-start space-x-2">
                    <div className="flex-shrink-0">
                        {getActivityIcon(nextActivity)}
                    </div>
                    <div className="flex-1 min-w-0 overflow-hidden">
                        <h4 className="font-semibold text-sm mb-2 text-gray-800 truncate">
                            {nextActivity.title}
                        </h4>
                        {nextActivity.description && (
                            <p className="text-xs text-gray-600 leading-relaxed mb-2 overflow-hidden" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                                {nextActivity.description}
                            </p>
                        )}
                        {nextActivity.start_date && (
                            <div className="flex flex-col space-y-1 text-xs text-gray-500 mb-2">
                                <div className="flex items-center">
                                    <FiCalendar className="mr-1 text-blue-500 flex-shrink-0" />
                                    <span className="truncate">{formatDate(nextActivity.start_date)}</span>
                                </div>
                                <div className="flex items-center">
                                    <FiClock className="mr-1 text-green-500 flex-shrink-0" />
                                    <span className="truncate">{formatTime(nextActivity.start_date)}</span>
                                    {nextActivity.end_date && (
                                        <span className="ml-1 truncate">- {formatTime(nextActivity.end_date)}</span>
                                    )}
                                </div>
                            </div>
                        )}
                        <div className="flex items-center justify-between">
                            <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 font-medium flex items-center flex-shrink-0">
                                <FiStar className="mr-1 text-xs" />
                                <span className="truncate">Sự kiện của bạn</span>
                            </span>
                            <FiZap className="text-yellow-400 text-sm flex-shrink-0 ml-2" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FeaturedActivities;
