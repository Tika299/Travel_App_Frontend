import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import cuisineService from '../../services/cuisineService';
import { favouriteService } from '../../services/ui/favouriteService';
import restaurantService from '../../services/restaurantService';
import { Star, Clock, Soup, MapPin, ThumbsUp, MessageCircle, Utensils, Users, Flame, Leaf, Heart, Share2, X, Upload, Star as StarIcon } from 'lucide-react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import SEOHead from '../../components/SEOHead';
import Swal from 'sweetalert2';
import { axiosApi } from '../../services/api';

import { createPlaceholderImage } from '../../utils/shareImageGenerator';
import siteConfig from '../../config/siteConfig';

// Hàm lấy URL đầy đủ cho ảnh (giống như trong FoodList)
const getImageUrl = (imagePath, fallbackUrl = "https://via.placeholder.com/400x300?text=No+Image") => {
  if (!imagePath || imagePath.trim() === '') {
    return fallbackUrl;
  }
  
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  // Xử lý đường dẫn local
  const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
  return `https://travel-app-api-ws77.onrender.com/${cleanPath}`;
};

// Component để hiển thị các ngôi sao đánh giá
const StarRating = ({ rating, className = '' }) => {
  const totalStars = 5;
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 !== 0;
  const emptyStars = totalStars - fullStars - (halfStar ? 1 : 0);

  return (
    <div className={`flex items-center ${className}`}>
      {[...Array(fullStars)].map((_, i) => (
        <Star key={`full-${i}`} className="w-5 h-5 text-yellow-400 fill-current" />
      ))}
      {halfStar && <Star key="half" className="w-5 h-5 text-yellow-400 fill-current" style={{ clipPath: 'polygon(0 0, 50% 0, 50% 100%, 0 100%)' }} />}
      {[...Array(emptyStars)].map((_, i) => (
        <Star key={`empty-${i}`} className="w-5 h-5 text-gray-300 fill-current" />
      ))}
    </div>
  );
};

// Component viết đánh giá cho món ăn
const WriteReviewModal = ({ isOpen, onClose, cuisineId, cuisineName, onReviewSubmitted }) => {
  const [rating, setRating] = useState(0);
  const [content, setContent] = useState('');
  const [images, setImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hoveredStar, setHoveredStar] = useState(0);

  const handleStarClick = (starValue) => {
    setRating(starValue);
  };

  const handleStarHover = (starValue) => {
    setHoveredStar(starValue);
  };

  const handleStarLeave = () => {
    setHoveredStar(0);
  };

     const handleImageChange = (e) => {
     const files = Array.from(e.target.files);
     console.log('Selected files:', files);
     
     // Kiểm tra tổng số ảnh (ảnh hiện tại + ảnh mới)
     const totalImages = images.length + files.length;
     if (totalImages > 3) {
       Swal.fire({
         icon: 'warning',
         title: 'Quá nhiều ảnh',
         text: `Bạn chỉ có thể chọn tối đa 3 ảnh! Hiện tại đã có ${images.length} ảnh.`,
         confirmButtonText: 'OK'
       });
       return;
     }
     
     // Kiểm tra kích thước file (2MB = 2 * 1024 * 1024 bytes)
     const maxSize = 2 * 1024 * 1024; // 2MB
     const oversizedFiles = files.filter(file => file.size > maxSize);
     
     if (oversizedFiles.length > 0) {
       Swal.fire({
         icon: 'warning',
         title: 'File quá lớn',
         text: `Một số file vượt quá 2MB: ${oversizedFiles.map(f => f.name).join(', ')}`,
         confirmButtonText: 'OK'
       });
       return;
     }
     
     // Thêm ảnh mới vào danh sách
     setImages([...images, ...files]);
   };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Vui lòng chọn đánh giá',
        text: 'Bạn cần chọn số sao để đánh giá món ăn!',
        confirmButtonText: 'OK'
      });
      return;
    }

    if (content.trim().length < 10) {
      Swal.fire({
        icon: 'warning',
        title: 'Nội dung quá ngắn',
        text: 'Vui lòng viết ít nhất 10 ký tự cho đánh giá!',
        confirmButtonText: 'OK'
      });
      return;
    }

         let token = localStorage.getItem('token');
     console.log('Raw token from localStorage:', token);
     
     // Thử parse token nếu là JSON
     if (token) {
       try {
         const parsedToken = JSON.parse(token);
         token = parsedToken.token || parsedToken;
         console.log('Parsed token:', token);
       } catch (e) {
         console.log('Token is not JSON, using as is');
       }
     }
     
     console.log('Final token:', token);
     console.log('Token type:', typeof token);
     console.log('Token length:', token ? token.length : 0);
     
     if (!token) {
       Swal.fire({
         icon: 'warning',
         title: 'Cần đăng nhập',
         text: 'Vui lòng đăng nhập để viết đánh giá!',
         confirmButtonText: 'Đăng nhập',
         showCancelButton: true,
         cancelButtonText: 'Hủy'
       }).then((result) => {
         if (result.isConfirmed) {
           window.location.href = '/login';
         }
       });
       return;
     }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('reviewable_type', 'App\\Models\\Cuisine');
      formData.append('reviewable_id', cuisineId);
      formData.append('content', content);
      formData.append('rating', rating);

      // Thêm ảnh nếu có
      images.forEach((image, index) => {
        formData.append(`images[${index}]`, image);
      });

                    console.log('Sending review with formData:', {
         reviewable_type: 'App\\Models\\Cuisine',
         reviewable_id: cuisineId,
         content: content,
         rating: rating,
         images_count: images.length,
         images: images.map(img => ({
           name: img.name,
           size: img.size,
           type: img.type
         }))
       });
       
       const response = await axiosApi.post('/reviews', formData, {
         headers: {
           'Content-Type': 'multipart/form-data'
         }
       });

       console.log('Review response:', response.data);

              if (response.data.success) {
         const imageText = images.length > 0 ? ` và ${images.length} ảnh` : '';
         Swal.fire({
           icon: 'success',
           title: 'Đánh giá đã được gửi!',
           text: `Cảm ơn bạn đã chia sẻ trải nghiệm về món ăn này${imageText}!`,
           confirmButtonText: 'OK'
         });
        
        // Reset form
        setRating(0);
        setContent('');
        setImages([]);
        
        // Đóng modal
        onClose();
        
        // Gọi callback để refresh dữ liệu
        if (onReviewSubmitted) {
          onReviewSubmitted();
        }
      }
         } catch (error) {
       console.error('Lỗi khi gửi đánh giá:', error);
       console.error('Error response:', error.response);
       console.error('Error status:', error.response?.status);
       console.error('Error data:', error.response?.data);
       console.error('Error headers:', error.response?.headers);
       
       Swal.fire({
         icon: 'error',
         title: 'Có lỗi xảy ra',
         text: error.response?.data?.message || 'Không thể gửi đánh giá. Vui lòng thử lại!',
         confirmButtonText: 'OK'
       });
     } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">Viết đánh giá cho {cuisineName}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Đánh giá của bạn *
            </label>
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleStarClick(star)}
                  onMouseEnter={() => handleStarHover(star)}
                  onMouseLeave={handleStarLeave}
                  className="focus:outline-none"
                >
                  <StarIcon
                    className={`w-8 h-8 ${
                      star <= (hoveredStar || rating)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    } transition-colors`}
                  />
                </button>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-2">
              {rating === 0 && 'Vui lòng chọn số sao'}
              {rating === 1 && 'Rất không hài lòng'}
              {rating === 2 && 'Không hài lòng'}
              {rating === 3 && 'Bình thường'}
              {rating === 4 && 'Hài lòng'}
              {rating === 5 && 'Rất hài lòng'}
            </p>
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Nội dung đánh giá *
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Chia sẻ trải nghiệm của bạn về món ăn này... (ít nhất 10 ký tự)"
              className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              maxLength={1000}
            />
            <div className="flex justify-between items-center mt-2">
              <span className="text-sm text-gray-500">
                {content.length}/1000 ký tự
              </span>
              {content.length < 10 && content.length > 0 && (
                <span className="text-sm text-red-500">
                  Cần ít nhất 10 ký tự
                </span>
              )}
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Thêm ảnh (tùy chọn)
            </label>
            <div className="space-y-4">
                             {/* Upload Button */}
               {images.length < 3 && (
                 <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                   <input
                     type="file"
                     multiple
                     accept="image/*"
                     onChange={handleImageChange}
                     className="hidden"
                     id="review-images"
                   />
                   <label htmlFor="review-images" className="cursor-pointer">
                     <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                     <p className="text-gray-600">Chọn ảnh ({images.length}/3)</p>
                     <p className="text-sm text-gray-500">JPG, PNG, GIF (tối đa 2MB mỗi ảnh)</p>
                   </label>
                 </div>
               )}

                             {/* Preview Images */}
               {images.length > 0 && (
                 <div className="space-y-4">
                   <div className="flex items-center justify-between">
                     <h4 className="text-sm font-medium text-gray-700">Ảnh đã chọn ({images.length}/3)</h4>
                     <button
                       onClick={() => setImages([])}
                       className="text-sm text-red-500 hover:text-red-700"
                     >
                       Xóa tất cả
                     </button>
                   </div>
                   <div className="grid grid-cols-3 gap-4">
                     {images.map((image, index) => (
                       <div key={index} className="relative group">
                         <img
                           src={URL.createObjectURL(image)}
                           alt={`Preview ${index + 1}`}
                           className="w-full h-24 object-cover rounded-lg"
                         />
                         <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded-lg flex items-center justify-center">
                           <button
                             onClick={() => removeImage(index)}
                             className="opacity-0 group-hover:opacity-100 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-all"
                           >
                             <X className="w-4 h-4" />
                           </button>
                         </div>
                         <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
                           {image.name.length > 15 ? image.name.substring(0, 15) + '...' : image.name}
                         </div>
                       </div>
                     ))}
                   </div>
                 </div>
               )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-4 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            disabled={isSubmitting}
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || rating === 0 || content.trim().length < 10}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Đang gửi...
              </>
            ) : (
              'Gửi đánh giá'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const RestaurantCard = ({ restaurant }) => {
  const navigate = useNavigate();
  
  const handleViewDetails = () => {
    // Navigate to restaurant detail page
    navigate(`/restaurants/${restaurant.id}`);
  };

  return (
    <div className="bg-white p-4 rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300">
      <div className="flex flex-col sm:flex-row items-start gap-5">
        <img
          src={restaurant.image ? (restaurant.image.startsWith('http') ? restaurant.image : `https://travel-app-api-ws77.onrender.com/${restaurant.image}`) : "https://via.placeholder.com/128x128?text=No+Image"}
          alt={restaurant.name}
          className="w-full sm:w-32 sm:h-32 rounded-lg object-cover"
        />
        <div className="flex flex-col flex-1">
          <div>
            <h3 className="text-xl font-bold text-gray-900">{restaurant.name}</h3>
            <div className="flex flex-wrap items-center text-sm text-gray-500 mt-1 gap-x-2">
              <div className="flex items-center">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 mr-1" />
                <span className="font-semibold text-gray-800">{restaurant.rating || 0}</span>
                <span className="ml-1">({restaurant.total_reviews || 0} reviews)</span>
              </div>
              <span className="hidden sm:inline">-</span>
              <span className="flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                {restaurant.address}
              </span>
            </div>
            <p className="text-gray-600 mt-2 text-sm">{restaurant.description}</p>
          </div>
          <div className="flex justify-between items-center mt-3 w-full">
            <p className="font-bold text-blue-600 text-lg">{restaurant.price_range}</p>
            <button 
              onClick={handleViewDetails}
              className="bg-blue-500 text-white px-5 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm font-semibold cursor-pointer"
            >
              Xem chi tiết
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const CulinaryDetail = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavourite, setIsFavourite] = useState(false);
  const [favouriteLoading, setFavouriteLoading] = useState(false);
  const [featuredRestaurants, setFeaturedRestaurants] = useState([]);
  const [restaurantsLoading, setRestaurantsLoading] = useState(false);
  const [showWriteReviewModal, setShowWriteReviewModal] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsStats, setReviewsStats] = useState({
    average: 0,
    total: 0,
    distribution: []
  });
  
  // Debug: Log reviewsStats changes
  useEffect(() => {
    console.log('reviewsStats changed:', reviewsStats);
  }, [reviewsStats]);
  
  // State để kiểm tra xem user đã đánh giá chưa
  const [userHasReviewed, setUserHasReviewed] = useState(false);
  const [userReview, setUserReview] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [selectedRating, setSelectedRating] = useState(0); // 0 = tất cả, 1-5 = filter theo sao
  const [showImageModal, setShowImageModal] = useState(false);
  const [modalImage, setModalImage] = useState(null);

  // Function để validate rating data
  const validateRatingData = (average, total, distribution) => {
    // Nếu không có review nào, tất cả phải là 0
    if (total === 0) {
      return {
        average: 0,
        total: 0,
        distribution: distribution.map(dist => ({ ...dist, count: 0, percentage: 0 }))
      };
    }
    
    // Kiểm tra tính hợp lệ của average rating
    const validAverage = (average >= 0 && average <= 5 && !isNaN(average)) ? average : 0;
    
    // Kiểm tra distribution có khớp với total không
    const totalFromDistribution = distribution.reduce((sum, dist) => sum + dist.count, 0);
    if (totalFromDistribution !== total) {
      console.warn('Distribution total does not match review total:', totalFromDistribution, 'vs', total);
    }
    
    return {
      average: validAverage,
      total: total,
      distribution: distribution
    };
  };

  // Function để load reviews từ API
  const loadReviews = async (page = 1, rating = 0, append = false) => {
    setReviewsLoading(true);
    try {
      const params = new URLSearchParams({
        reviewable_type: 'App\\Models\\Cuisine',
        reviewable_id: id,
        limit: 3, // Chỉ load 3 reviews mỗi lần
        sort: 'best_and_latest', // Sắp xếp theo cao sao nhất và mới nhất
        page: page
      });
      
      if (rating > 0) {
        params.append('rating', rating);
      }
      
      const response = await axiosApi.get(`/reviews?${params}`);
      console.log('Reviews response:', response.data);
      
      if (response.data.success) {
        const newReviews = response.data.data || [];
        
        if (append) {
          setReviews(prev => [...prev, ...newReviews]);
        } else {
          setReviews(newReviews);
        }
        
        // Cập nhật thống kê từ meta
        const meta = response.data.meta;
        console.log('Reviews meta data:', meta);
        console.log('Average rating from API:', meta.average_rating);
        
        // Validation và đảm bảo dữ liệu chính xác
        const totalReviews = parseInt(meta.total) || 0;
        const averageRating = parseFloat(meta.average_rating) || 0;
        const distribution = meta.rating_distribution || [];
        
        // Sử dụng function validate
        const validatedData = validateRatingData(averageRating, totalReviews, distribution);
        
        console.log('Validated data:', {
          total: validatedData.total,
          average: validatedData.average,
          hasReviews: validatedData.total > 0,
          distribution: validatedData.distribution
        });
        
        setReviewsStats(validatedData);
        
        setCurrentPage(page);
        setHasMore(meta.has_more || false);
      }
    } catch (error) {
      console.error('Lỗi khi load reviews:', error);
      if (!append) {
        setReviews([]);
        setReviewsStats({
          average: 0,
          total: 0,
          distribution: []
        });
      }
    } finally {
      setReviewsLoading(false);
    }
  };

  // Function để load thêm reviews
  const loadMoreReviews = async () => {
    if (!hasMore || reviewsLoading) return;
    await loadReviews(currentPage + 1, selectedRating, true);
  };

  // Function để filter theo rating
  const filterByRating = async (rating) => {
    setSelectedRating(rating);
    setCurrentPage(1);
    await loadReviews(1, rating, false);
  };

  // Function để mở modal ảnh
  const openImageModal = (image) => {
    setModalImage(image);
    setShowImageModal(true);
  };

  // Function để đóng modal ảnh
  const closeImageModal = () => {
    setShowImageModal(false);
    setModalImage(null);
  };

  // Function để refresh dữ liệu món ăn
  const refreshCuisineData = async () => {
    try {
      console.log('Refreshing cuisine data...');
      const res = await cuisineService.getCuisineById(id);
      setData({
        detail: res.data?.data || res.data || res,
        priceDetails: res.data?.priceDetails || res.priceDetails || [],
      });
      await checkFavouriteStatus();
      // Load lại reviews sau khi refresh và clear cache
      console.log('Reloading reviews after refresh...');
      // Reset reviews stats trước khi load lại
      setReviewsStats({
        average: 0,
        total: 0,
        distribution: []
      });
      await loadReviews(1, selectedRating, false);
      console.log('Refresh completed');
    } catch (err) {
      console.error('Lỗi khi refresh dữ liệu món ăn:', err);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Load dữ liệu cơ bản trước
        const res = await cuisineService.getCuisineById(id);
        setData({
          detail: res.data?.data || res.data || res,
          priceDetails: res.data?.priceDetails || res.priceDetails || [],
        });
        
        // Hiển thị ngay lập tức, không chờ các API khác
        setLoading(false);
        
        // Load các dữ liệu khác trong background
        Promise.all([
          checkFavouriteStatus(),
          loadReviews(1, 0, false), // Load reviews ngay từ đầu
          fetchFeaturedRestaurants()
        ]).catch(err => {
          console.error('Lỗi khi load dữ liệu background:', err);
        });
        
      } catch (err) {
        setError('Không thể tải dữ liệu chi tiết.');
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);



  // Kiểm tra trạng thái yêu thích khi component mount
  useEffect(() => {
    if (id) {
      checkFavouriteStatus();
    }
  }, [id]);

  // Lấy danh sách nhà hàng tiêu biểu
  const fetchFeaturedRestaurants = async () => {
    setRestaurantsLoading(true);
    try {
      const response = await restaurantService.getAllRestaurants({ 
        limit: 4, 
        featured: true,
        sort_by: 'rating',
        sort_order: 'desc'
      });
      setFeaturedRestaurants(response.data || response || []);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách nhà hàng tiêu biểu:', error);
      setFeaturedRestaurants([]);
    } finally {
      setRestaurantsLoading(false);
    }
  };



  // Kiểm tra trạng thái yêu thích
  const checkFavouriteStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsFavourite(false);
        return;
      }

      // Sử dụng API mới để kiểm tra trạng thái
      const response = await favouriteService.checkFavouriteStatus(id, 'App\\Models\\Cuisine');
      const isFav = response.is_favourite;
      
      
      
      setIsFavourite(isFav);
      
      // Hiển thị thông báo nếu món ăn đã có trong yêu thích
      if (isFav) {
        Swal.fire({
          icon: 'info',
          title: 'Món ăn đã được lưu',
          text: 'Món ăn này đã có trong danh sách yêu thích của bạn!',
          timer: 3000,
          showConfirmButton: false,
          toast: true,
          position: 'top-end'
        });
      }
    } catch (error) {
      console.error('Lỗi kiểm tra trạng thái yêu thích:', error);
      setIsFavourite(false);
    }
  };

  // Xử lý thêm/xóa yêu thích
  const handleToggleFavourite = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      Swal.fire({
        icon: 'warning',
        title: 'Cần đăng nhập',
        text: 'Vui lòng đăng nhập để lưu món ăn yêu thích!',
        confirmButtonText: 'Đăng nhập',
        showCancelButton: true,
        cancelButtonText: 'Hủy'
      }).then((result) => {
        if (result.isConfirmed) {
          window.location.href = '/login';
        }
      });
      return;
    }

    setFavouriteLoading(true);
    try {
      if (isFavourite) {
        // Xóa khỏi yêu thích
        const statusResponse = await favouriteService.checkFavouriteStatus(id, 'App\\Models\\Cuisine');
        const favouriteId = statusResponse.favourite_id;
        
        if (favouriteId) {
          await favouriteService.deleteFavourite(favouriteId);
 
          setIsFavourite(false);
          
          Swal.fire({
            icon: 'success',
            title: 'Đã xóa khỏi yêu thích',
            text: 'Món ăn đã được xóa khỏi danh sách yêu thích!',
            timer: 2000,
            showConfirmButton: false
          });
        }
      } else {
        // Thêm vào yêu thích
        await favouriteService.addFavourite(id, 'App\\Models\\Cuisine');
        
        setIsFavourite(true);
        
        Swal.fire({
          icon: 'success',
          title: 'Đã lưu món ăn',
          text: 'Món ăn đã được thêm vào danh sách yêu thích!',
            timer: 2000,
            showConfirmButton: false
        });
      }
    } catch (error) {
      console.error('Lỗi khi thay đổi trạng thái yêu thích:', error);
      Swal.fire({
        icon: 'error',
        title: 'Có lỗi xảy ra',
        text: error.response?.data?.message || 'Không thể thay đổi trạng thái yêu thích!',
        confirmButtonText: 'OK'
      });
    } finally {
      setFavouriteLoading(false);
    }
  };

  // Xử lý chia sẻ Facebook
  const handleShareFacebook = () => {
    // Sử dụng URL thật từ config
    const currentUrl = siteConfig.domain + window.location.pathname;
    const shareText = `Khám phá món ăn tuyệt vời: ${detail.name} - ${detail.description || 'Món ăn ngon không thể bỏ qua!'}`;
    
    // Tạo URL chia sẻ Facebook
    const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}&quote=${encodeURIComponent(shareText)}`;
    
    // Mở popup chia sẻ Facebook
    const popup = window.open(
      facebookShareUrl,
      'facebook-share-dialog',
      'width=626,height=436,scrollbars=yes,resizable=yes'
    );
    
    // Kiểm tra nếu popup bị chặn
    if (!popup || popup.closed || typeof popup.closed === 'undefined') {
      Swal.fire({
        icon: 'warning',
        title: 'Popup bị chặn',
        text: 'Vui lòng cho phép popup để chia sẻ Facebook!',
        confirmButtonText: 'OK'
      });
    } else {
      // Thông báo thành công
      Swal.fire({
        icon: 'success',
        title: 'Đang mở Facebook',
        text: 'Cửa sổ chia sẻ Facebook đã được mở!',
        timer: 2000,
        showConfirmButton: false
      });
    }
  };

  // Tạo ảnh chia sẻ động
  const generateShareImage = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 1200;
    canvas.height = 630;

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, 1200, 630);
    gradient.addColorStop(0, '#FF6B35');
    gradient.addColorStop(1, '#F7931E');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1200, 630);

    // Logo/Title
    ctx.fillStyle = 'white';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('🍜 Travel App', 600, 100);

    // Cuisine name
    ctx.font = 'bold 36px Arial';
    ctx.fillText(detail.name || 'Món ăn ngon', 600, 200);

    // Description
    ctx.font = '24px Arial';
    const description = detail.description || 'Món ăn truyền thống Việt Nam';
    const words = description.split(' ');
    let line = '';
    let y = 280;
    for (let word of words) {
      const testLine = line + word + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > 1000) {
        ctx.fillText(line, 600, y);
        line = word + ' ';
        y += 35;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, 600, y);

    // Price and category
    if (detail.price_formatted || detail.price) {
      ctx.font = 'bold 28px Arial';
      ctx.fillText(`💰 ${detail.price_formatted || detail.price}`, 600, y + 60);
    }

    if (detail.category) {
      const categoryName = typeof detail.category === 'object' ? detail.category.name : detail.category;
      ctx.font = '20px Arial';
      ctx.fillText(`📂 ${categoryName}`, 600, y + 100);
    }

    // Footer
    ctx.font = '18px Arial';
    ctx.fillText('🇻🇳 Khám phá ẩm thực Việt Nam', 600, 580);

    return canvas.toDataURL('image/png');
  };

  // Xử lý chia sẻ đa nền tảng
  const handleShareMulti = () => {
    // Sử dụng URL thật từ config
    const currentUrl = siteConfig.domain + window.location.pathname;
    const cuisineName = detail.name || 'Món ăn ngon';
    const cuisineDescription = detail.description || 'Món ăn truyền thống Việt Nam';
    const cuisinePrice = detail.price_formatted || detail.price || '';
    const cuisineCategory = typeof detail.category === 'object' ? detail.category?.name : detail.category || '';
    
    // Tạo nội dung chia sẻ phong phú hơn
    const shareText = `🍜 ${cuisineName} - ${cuisineDescription}${cuisinePrice ? ` | Giá: ${cuisinePrice}` : ''}${cuisineCategory ? ` | Loại: ${cuisineCategory}` : ''} | Khám phá ẩm thực Việt Nam tại Travel App! 🇻🇳`;
    
         // Tạo các URL chia sẻ
     const shareUrls = {
       facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`,
       twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(shareText)}`,
       linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`,
       whatsapp: `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + currentUrl)}`,
       telegram: `https://t.me/share/url?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(shareText)}`,
       zalo: `https://zalo.me/share?u=${encodeURIComponent(currentUrl)}&t=${encodeURIComponent(shareText)}`,
       copy: currentUrl
     };

    // Hiển thị modal chia sẻ với 5 nền tảng chính
    Swal.fire({
      title: '<div class="text-2xl font-bold text-gray-800 mb-4">Chia sẻ món ăn</div>',
      html: `
        <div class="space-y-8">
          <!-- Social Media Icons Grid -->
          <div class="grid grid-cols-5 gap-6">
                         <!-- Facebook -->
             <button onclick="window.open('${shareUrls.facebook}', '_blank')" 
                     class="w-14 h-14 bg-blue-600 rounded-full shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center hover:bg-blue-700 transform hover:scale-105">
               <svg class="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                 <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
               </svg>
             </button>

             <!-- Twitter/X -->
             <button onclick="window.open('${shareUrls.twitter}', '_blank')" 
                     class="w-14 h-14 bg-black rounded-full shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center hover:bg-gray-800 transform hover:scale-105">
               <svg class="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                 <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
               </svg>
             </button>

             <!-- LinkedIn -->
             <button onclick="window.open('${shareUrls.linkedin}', '_blank')" 
                     class="w-14 h-14 bg-blue-700 rounded-full shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center hover:bg-blue-800 transform hover:scale-105">
               <svg class="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                 <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
               </svg>
             </button>

             <!-- WhatsApp -->
             <button onclick="window.open('${shareUrls.whatsapp}', '_blank')" 
                     class="w-14 h-14 bg-green-500 rounded-full shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center hover:bg-green-600 transform hover:scale-105">
               <svg class="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                 <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
               </svg>
             </button>

             <!-- Telegram -->
             <button onclick="window.open('${shareUrls.telegram}', '_blank')" 
                     class="w-14 h-14 bg-blue-500 rounded-full shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center hover:bg-blue-600 transform hover:scale-105">
               <svg class="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                 <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
               </svg>
             </button>
          </div>

                     <!-- Copy Link Section -->
           <div class="mt-8 p-4 bg-gray-50 rounded-xl">
             <div class="text-sm font-semibold text-gray-700 mb-3">Sao chép liên kết</div>
             <div class="flex items-center space-x-2">
               <input type="text" value="${currentUrl}" readonly 
                      class="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
               <button onclick="navigator.clipboard.writeText('${currentUrl}').then(() => { 
                 const btn = this; 
                 btn.innerHTML = '✓'; 
                 btn.className = 'px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-semibold'; 
                 setTimeout(() => { 
                   btn.innerHTML = 'Sao chép'; 
                   btn.className = 'px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-semibold'; 
                 }, 2000); 
               })" 
                       class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-semibold">
                 Sao chép
               </button>
             </div>
             
             
           </div>
        </div>
      `,
      showConfirmButton: false,
      showCloseButton: true,
      width: '500px',
      customClass: {
        popup: 'rounded-2xl shadow-2xl',
        closeButton: 'text-gray-400 hover:text-gray-600'
      }
    });
  };

  const detail = data?.detail || {};
  let filteredPriceDetails = data?.priceDetails || [];
  
  // Debug logging để kiểm tra dữ liệu
  console.log('🔍 Detail data:', {
    name: detail.name,
    image: detail.image,
    imageType: typeof detail.image,
    hasImage: !!detail.image,
    imageStartsWithHttp: detail.image?.startsWith('http'),
    fullImageUrl: getImageUrl(detail.image)
  });

  // Chuẩn hóa dữ liệu info nhanh từ API hoặc mock
  const quickInfo = {
    type: detail.quickInfo?.type || (typeof detail.category === 'object' ? detail.category?.name : detail.category) || detail.category || '',
    openingHours: detail.quickInfo?.openingHours || detail.operating_hours || '',
    suitableFor: detail.quickInfo?.suitableFor || detail.suitable_for || '',
    priceRange: detail.quickInfo?.priceRange || detail.price_formatted || detail.price || '',
  };

  // Chuẩn hóa dữ liệu info hàng ngang
  const infoRow = {
    time: detail.serving_time || detail.metadata?.time || '',
    category: (typeof detail.category === 'object' ? detail.category?.name : detail.category) || detail.metadata?.category || '',
    spicy: detail.spicy_level || 'nhẹ',
  };

  // Chuẩn hóa mô tả chi tiết
  let detailDescription = [];
  if (Array.isArray(detail.detailed_description)) {
    detailDescription = detail.detailed_description;
  } else if (typeof detail.detailed_description === 'string') {
    detailDescription = detail.detailed_description.split('\n').filter(Boolean);
  } else if (Array.isArray(detail.description)) {
    detailDescription = detail.description;
  } else if (typeof detail.description === 'string') {
    detailDescription = detail.description.split('\n').filter(Boolean);
  }

  // Lọc priceDetails theo category hiện tại nếu có, fallback nếu ít hơn 2
  const currentCategory = (typeof detail.category === 'object' ? detail.category?.name : detail.category) || '';
  if (Array.isArray(filteredPriceDetails) && currentCategory) {
    // Chỉ lọc nếu tất cả item đều có trường category
    const allHaveCategory = filteredPriceDetails.every(item => item.category);
    if (allHaveCategory) {
      const byCategory = filteredPriceDetails.filter(item => {
        if (typeof item.category === 'object') {
          return item.category?.name === currentCategory;
        }
        return item.category === currentCategory;
      });
      if (byCategory.length >= 2 && byCategory.length <= 4) {
        filteredPriceDetails = byCategory;
      } else if (byCategory.length > 4) {
        filteredPriceDetails = byCategory.slice(0, 4);
      } else {
        filteredPriceDetails = filteredPriceDetails.slice(0, 4);
      }
    } else {
      filteredPriceDetails = filteredPriceDetails.slice(0, 4);
    }
  } else if (Array.isArray(filteredPriceDetails)) {
    filteredPriceDetails = filteredPriceDetails.slice(0, 4);
  }

  if (loading) return <div className="text-center py-12 text-gray-500">Đang tải dữ liệu...</div>;
  if (error) return <div className="text-center py-12 text-red-500">{error}</div>;

  return (
    <div className="bg-white font-sans">
             <SEOHead 
         title={`${detail.name} - Travel App`}
         description={`🍜 ${detail.name} - ${detail.description || 'Món ăn ngon không thể bỏ qua!'} | Khám phá ẩm thực Việt Nam tại Travel App! 🇻🇳`}
         image={detail.image && detail.image.startsWith('http') ? detail.image : createPlaceholderImage(detail.name, detail.description)}
                   url={siteConfig.domain + window.location.pathname}
         type="article"
         keywords={`${detail.name}, ẩm thực việt nam, ${detail.category || ''}, món ăn ngon, travel app`}
       />
      <Header />
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Phần 1: Banner và Thông tin nhanh */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Cột trái: Ảnh banner */}
          <div className="lg:col-span-2">
            <img
              src={getImageUrl(detail.image)}
              alt={detail.name}
              className="w-full h-[450px] rounded-2xl object-cover"
              onLoad={(e) => {
                console.log('✅ Load ảnh banner thành công:', e.target.src, 'Food:', detail.name, 'Image field:', detail.image);
              }}
              onError={(e) => {
                console.error('❌ Lỗi load ảnh banner:', e.target.src, 'Food:', detail.name, 'Image field:', detail.image);
                e.target.src = "https://via.placeholder.com/400x300?text=No+Image";
              }}
            />
          </div>

          {/* Cột phải: Box thông tin nhanh */}
          <div className="lg:col-span-1 bg-gray-50 rounded-2xl p-6 flex flex-col justify-between">
            <h3 className="text-2xl font-bold mb-6 text-gray-800">Thông tin nhanh</h3>
            {/* Thêm 'flex-grow' để phần này chiếm không gian thừa */}
            <div className="space-y-4 flex-grow">
              <div className="flex items-center">
                <Utensils className="w-6 h-6 text-blue-500 mr-4" />
                <span className="text-gray-700">{quickInfo.type}</span>
              </div>
              <div className="flex items-center">
                <Clock className="w-6 h-6 text-blue-500 mr-4" />
                <span className="text-gray-700">Mở cửa: {quickInfo.openingHours}</span>
              </div>
              <div className="flex items-center">
                <Users className="w-6 h-6 text-blue-500 mr-4" />
                <span className="text-gray-700">Phù hợp: {quickInfo.suitableFor}</span>
              </div>
              <div className="flex items-center">
                <span className="text-2xl font-bold text-blue-500 mr-4">$</span>
                <span className="text-gray-700">Giá: {quickInfo.priceRange}</span>
              </div>
            </div>
            {/* Các nút bấm sẽ được đẩy xuống dưới */}
            <div className="mt-8 space-y-3">
              
              <button 
                onClick={handleToggleFavourite}
                disabled={favouriteLoading}
                className={`w-full font-bold py-3 px-4 rounded-lg transition duration-300 flex items-center justify-center ${
                  isFavourite 
                    ? 'bg-green-500 text-white hover:bg-green-600' 
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                } ${favouriteLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {favouriteLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                ) : (
                  <Heart className={`h-5 w-5 mr-2 ${isFavourite ? 'fill-current' : ''}`} />
                )}
                {isFavourite ? 'Đã lưu' : 'Lưu món ăn'}
              </button>
                             <button 
                 onClick={handleShareMulti}
                 className="w-full bg-white text-gray-800 font-bold py-3 px-4 rounded-lg border border-gray-300 hover:bg-gray-100 transition duration-300 flex items-center justify-center"
               >
                 <Share2 className="h-5 w-5 mr-2" />
                 Chia sẻ
               </button>
               
            </div>
          </div>
        </div>

        {/* Phần 2: Tên, đánh giá, mô tả chi tiết */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">{detail.name}</h1>
          {/* Cấu trúc lại phần đánh giá và thông tin */}
          <div className="flex flex-col gap-1 mb-4">
            <div className="flex items-center text-yellow-500 text-base">
              {reviewsLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-500 mr-2"></div>
                  <span className="text-gray-500">Đang tải đánh giá...</span>
                </>
              ) : (
                <>
                  {console.log('Header rating display:', reviewsStats.average, 'Type:', typeof reviewsStats.average, 'Total:', reviewsStats.total)}
                  <StarRating rating={reviewsStats.total > 0 && Number.isFinite(reviewsStats.average) && reviewsStats.average >= 0 && reviewsStats.average <= 5 ? reviewsStats.average : 0} />
                  <span className="ml-2 text-gray-800 font-semibold text-base">
                    {reviewsStats.total > 0 ? Number(reviewsStats.average || 0).toFixed(1) : '0.0'}
                  </span>
                  <span className="ml-1 text-gray-500 text-sm">({reviewsStats.total} đánh giá)</span>
                </>
              )}
            </div>
            <div className="flex items-center text-gray-700 text-base gap-6 mt-1">
              <span className="flex items-center"><Clock className="w-5 h-5 mr-1" />Thời gian: {infoRow.time}</span>
              <span className="flex items-center"><Leaf className="w-5 h-5 mr-1" />{infoRow.category}</span>
            </div>
          </div>

          <h2 className="text-3xl font-bold text-gray-800 mt-12 mb-4">Mô tả chi tiết</h2>
          <div className="text-gray-700 leading-relaxed space-y-4">
            {detailDescription.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </div>

        {/* Phần 3: Khoảng giá */}
        <div className="mb-12 w-full">
          <div className="w-full max-w-2xl ml-0">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Khoảng giá</h2>
            <div className="bg-blue-50 rounded-lg p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {Array.isArray(filteredPriceDetails) && filteredPriceDetails.length > 0 ? (
                filteredPriceDetails.map((item, index) => (
                  <div key={index}>
                    <p className="text-gray-800 font-semibold">{item.name}</p>
                    <p className="font-bold text-2xl">
                      <span className="text-blue-600">{(item.price || '').replace(/đ|\s*VND/gi, '')}</span>
                      <span className="text-blue-600 font-semibold ml-1">VND</span>
                    </p>
                  </div>
                ))
              ) : (
                <div className="col-span-2 text-center text-gray-500">Không có dữ liệu khoảng giá phù hợp.</div>
              )}
            </div>
          </div>
        </div>


          {/* Phần 4: Nhà hàng tiêu biểu */}
          <div className="mb-12">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-gray-800">Nhà hàng tiêu biểu</h2>
              <a href="/restaurants" className="text-orange-500 font-semibold hover:text-orange-600">Xem tất cả →</a>
            </div>
            
            {restaurantsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                <p className="text-gray-500 mt-2">Đang tải nhà hàng tiêu biểu...</p>
              </div>
            ) : featuredRestaurants.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {featuredRestaurants.map((restaurant) => (
                  <RestaurantCard key={restaurant.id} restaurant={restaurant} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">Chưa có nhà hàng tiêu biểu nào.</p>
              </div>
            )}
          </div>

        {/* Phần 5: Reviews được đánh giá cao */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-gray-800">Reviews được đánh giá cao</h2>
            <button 
              onClick={() => setShowWriteReviewModal(true)}
              className="bg-blue-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Viết đánh giá
            </button>
          </div>

                     <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
             {/* Thống kê review */}
             <div className="p-6 border border-gray-200 rounded-lg flex flex-col items-center justify-center">
               {reviewsLoading ? (
                 <div className="text-center">
                   <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                   <p className="text-gray-500 mt-2">Đang tải...</p>
                 </div>
               ) : (
                 <>
                   {console.log('Stats rating display:', reviewsStats.average, 'Type:', typeof reviewsStats.average, 'Total:', reviewsStats.total)}
                   <p className="text-6xl font-bold text-gray-800">
                     {reviewsStats.total > 0 ? (reviewsStats.average || 0) : '-'}
                   </p>
                   <StarRating rating={reviewsStats.total > 0 && Number.isFinite(reviewsStats.average) && reviewsStats.average >= 0 && reviewsStats.average <= 5 ? reviewsStats.average : 0} />
                   <p className="text-gray-600 mt-2">Dựa trên {reviewsStats.total} đánh giá</p>
                   
                   {/* Filter buttons */}
                   <div className="w-full mt-6 space-y-3">
                     <div className="text-sm font-medium text-gray-700 mb-2">Lọc theo đánh giá:</div>
                     <div className="flex flex-wrap gap-2">
                       <button
                         onClick={() => filterByRating(0)}
                         className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                           selectedRating === 0 
                             ? 'bg-blue-500 text-white border-blue-500' 
                             : 'bg-white text-gray-600 border-gray-300 hover:border-blue-300'
                         }`}
                       >
                         Tất cả
                       </button>
                       {[5, 4, 3, 2, 1].map((star) => (
                         <button
                           key={star}
                           onClick={() => filterByRating(star)}
                           className={`px-3 py-1 text-xs rounded-full border transition-colors flex items-center gap-1 ${
                             selectedRating === star 
                               ? 'bg-blue-500 text-white border-blue-500' 
                               : 'bg-white text-gray-600 border-gray-300 hover:border-blue-300'
                           }`}
                         >
                           <Star className="w-3 h-3" />
                           {star}
                         </button>
                       ))}
                     </div>
                   </div>
                   
                   <div className="w-full mt-6 space-y-2">
                     {reviewsStats.distribution.map((dist) => (
                       <div key={dist.star} className="flex items-center gap-2">
                         <span className="text-sm text-gray-600">{dist.star}</span>
                         <Star className="w-4 h-4 text-yellow-400" />
                         <div className="w-full bg-gray-200 rounded-full h-2">
                           <div className="bg-yellow-400 h-2 rounded-full" style={{ width: `${dist.percentage}%` }}></div>
                         </div>
                         <span className="text-sm text-gray-600 w-8 text-right">{dist.percentage}%</span>
                       </div>
                     ))}
                   </div>
                 </>
               )}
             </div>

             {/* Danh sách review */}
             <div className="lg:col-span-2 space-y-6">
               {reviewsLoading && currentPage === 1 ? (
                 <div className="text-center py-8">
                   <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                   <p className="text-gray-500 mt-2">Đang tải đánh giá...</p>
                 </div>
               ) : reviews.length > 0 ? (
                 <>
                   {reviews.map((review) => (
                     <div key={review.id} className="p-6 border border-gray-200 rounded-lg">
                       <div className="flex justify-between items-start mb-4">
                         <div className="flex items-center">
                           <img 
                             src={getImageUrl(review.user?.avatar, "https://via.placeholder.com/48x48?text=U")} 
                             alt={review.user?.name || 'User'} 
                             className="w-12 h-12 rounded-full mr-4 object-cover"
                             onError={(e) => {
                               e.target.src = "https://via.placeholder.com/48x48?text=U";
                             }}
                           />
                           <div>
                             <p className="font-bold text-gray-800">{review.user?.name || 'Người dùng'}</p>
                             <StarRating rating={Number.isFinite(review.rating) && review.rating >= 0 && review.rating <= 5 ? review.rating : 0} />
                           </div>
                         </div>
                         <span className="text-sm text-gray-500">
                           {new Date(review.created_at).toLocaleDateString('vi-VN')}
                         </span>
                       </div>
                       
                       <p className="text-gray-700 mb-4">{review.content}</p>
                       
                       {/* Hiển thị ảnh nếu có */}
                       {review.images && review.images.length > 0 && (
                         <div className="grid grid-cols-3 gap-2 mb-4">
                           {review.images.map((image, index) => (
                             <img 
                               key={index}
                               src={image.full_image_url || getImageUrl(image.image_path, 'https://via.placeholder.com/100?text=Image+Error')} 
                               alt={`Review image ${index + 1}`}
                               className="w-full h-32 object-cover rounded-lg cursor-pointer hover:scale-105 transition-transform"
                               onClick={() => openImageModal(image)}
                               onError={(e) => {
                                 console.error('Lỗi tải ảnh:', image.image_path);
                                 e.target.src = 'https://via.placeholder.com/100?text=Image+Error';
                               }}
                             />
                           ))}
                         </div>
                       )}
                       
                       <div className="flex items-center text-gray-600">
                         <button className="flex items-center hover:text-blue-500">
                           <ThumbsUp className="w-5 h-5 mr-2" /> 0
                         </button>
                         <button className="flex items-center ml-6 hover:text-blue-500">
                           <MessageCircle className="w-5 h-5 mr-2" /> Trả lời
                         </button>
                       </div>
                     </div>
                   ))}
                   
                   {/* Load more button */}
                   {hasMore && (
                     <button 
                       onClick={loadMoreReviews}
                       disabled={reviewsLoading}
                       className="w-full bg-gray-100 text-gray-800 font-bold py-3 px-4 rounded-lg hover:bg-gray-200 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                     >
                       {reviewsLoading ? (
                         <>
                           <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                           Đang tải...
                         </>
                       ) : (
                         'Xem thêm'
                       )}
                     </button>
                   )}
                   
                   {/* Hiển thị thông tin về filter hiện tại */}
                   {selectedRating > 0 && (
                     <div className="text-center py-4">
                       <p className="text-sm text-gray-500">
                         Đang hiển thị {reviews.length} đánh giá {selectedRating} sao
                         {hasMore && ` (còn ${reviewsStats.total - reviews.length} đánh giá khác)`}
                       </p>
                     </div>
                   )}
                 </>
               ) : (
                 <div className="text-center py-8">
                   <p className="text-gray-500">
                     {selectedRating > 0 
                       ? `Chưa có đánh giá ${selectedRating} sao nào cho món ăn này.`
                       : 'Chưa có đánh giá nào cho món ăn này.'
                     }
                   </p>
                   <p className="text-sm text-gray-400 mt-2">Hãy là người đầu tiên đánh giá!</p>
                 </div>
               )}
             </div>
           </div>
        </div>
      </div>
      <Footer />

             {/* Modal viết đánh giá */}
       <WriteReviewModal
         isOpen={showWriteReviewModal}
         onClose={() => setShowWriteReviewModal(false)}
         cuisineId={id}
         cuisineName={detail.name}
         onReviewSubmitted={refreshCuisineData}
       />

       {/* Modal hiển thị ảnh full size */}
       {showImageModal && modalImage && (
         <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center" onClick={closeImageModal}>
           <div className="relative max-w-4xl max-h-full p-4" onClick={(e) => e.stopPropagation()}>
             {/* Nút đóng */}
             <button
               onClick={closeImageModal}
               className="absolute top-2 right-2 text-white hover:text-gray-300 z-10"
             >
               <X size={32} />
             </button>

             {/* Ảnh chính */}
             <img
               src={modalImage.full_image_url || getImageUrl(modalImage.image_path, 'https://via.placeholder.com/800x600?text=Image+Error')}
               alt="Review image"
               className="max-w-full max-h-full object-contain"
               onError={(e) => {
                 console.error('Lỗi tải ảnh modal:', modalImage.image_path);
                 e.target.src = 'https://via.placeholder.com/800x600?text=Image+Error';
               }}
             />
           </div>
         </div>
       )}
    </div>
  );
};

export default CulinaryDetail; 