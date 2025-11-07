import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaSearch, FaStar, FaUtensils, FaHeart, FaChevronDown, FaChevronUp, FaAngleDoubleDown, FaAngleDoubleUp } from "react-icons/fa";
import { Star as StarIcon, Clock, Flame, Soup, MapPin, ThumbsUp, MessageCircle, Users } from 'lucide-react';
import cuisineService from "../../services/cuisineService.js";
import categoryService from "../../services/categoryService.js";
import { restaurantAPI } from "../../services/ui/Restaurant/restaurantService.js";
import { favouriteService } from "../../services/ui/favouriteService.js";
import restaurantService from "../../services/restaurantService.js";
import { FiChevronsDown } from "react-icons/fi";
import Header from "../../components/Header.jsx";
import Footer from "../../components/Footer.jsx";
import Swal from 'sweetalert2';
import { getImageUrl } from "../../lib/utils";





/**
 * Hàm render số sao đánh giá
 * @param {number} rating - Số điểm đánh giá (1-5)
 */
const StarRating = ({ rating }) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    if (rating >= i) {
      stars.push(<FaStar key={i} className="text-yellow-400" />);
    } else if (rating >= i - 0.5) {
      stars.push(<FaStar key={i} className="text-yellow-300" />); // nửa sao
    } else {
      stars.push(<FaStar key={i} className="text-gray-300" />);
    }
  }
  return <span className="flex items-center">{stars}</span>;
};

/**
 * Hàm render nhãn miền với màu sắc
 * @param {string} region - Miền (Miền Bắc, Miền Trung, Miền Nam)
 */
const RegionBadge = ({ region }) => {
  let color = "bg-gray-100 text-gray-600";
  if (region === "Miền Bắc") color = "bg-blue-100 text-blue-600";
  if (region === "Miền Trung") color = "bg-orange-100 text-orange-600";
  if (region === "Miền Nam") color = "bg-green-100 text-green-600";
  return (
    <span className={`text-xs px-2 py-1 rounded font-medium ${color}`}>{region}</span>
  );
};

/**
 * Nút tym (yêu thích món ăn)
 */
const HeartButton = ({ liked, onClick, size = 16 }) => (
  <button 
    onClick={onClick} 
    className={`focus:outline-none transition-all duration-200 hover:scale-110 ${
      liked ? 'transform scale-110' : ''
    }`}
  >
    <FaHeart 
      className={`${liked ? "text-red-500 fill-current" : "text-gray-300"} transition-all duration-200`} 
      size={size} 
    />
  </button>
);

/**
 * Component chính hiển thị trang Ẩm thực
 */
const Cuisine = () => {
  // State cho dữ liệu từ API
  const [stats, setStats] = useState([]);
  const [categories, setCategories] = useState([]);
  const [foods, setFoods] = useState([]);
  const [restaurants, setRestaurants] = useState([]); // Có thể xóa nếu không dùng
  const [reviews, setReviews] = useState([]); // Có thể xóa nếu không dùng
     const [loading, setLoading] = useState(false); // Bỏ loading

   const [error, setError] = useState(null);
  // State lưu món ăn đã tym
  const [likedFoods, setLikedFoods] = useState({});
  const [favourites, setFavourites] = useState([]);
  const [favouritesLoaded, setFavouritesLoaded] = useState(false);
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [regionFilter, setRegionFilter] = useState('Tất cả');
  const [sortType, setSortType] = useState('Phổ biến');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('all');
  const navigate = useNavigate();

  /**
   * Load dữ liệu yêu thích từ API
   */
  useEffect(() => {
    const loadFavourites = async () => {
      if (localStorage.getItem('token')) {
        try {
          const response = await favouriteService.getFavourites();
          const favData = response.data || response;
          setFavourites(favData);
          
          // Chuyển đổi thành format likedFoods để tương thích
          const likedFoodsMap = {};
          favData.forEach(fav => {
            if (fav.favouritable_type === 'App\\Models\\Cuisine') {
              likedFoodsMap[fav.favouritable_id] = true;
            }
          });
          setLikedFoods(likedFoodsMap);
          
          setFavouritesLoaded(true);
        } catch (error) {
          console.error('Error loading favourites:', error);
        }
      }
    };
    
    loadFavourites();
  }, []);

     /**
    * Lấy dữ liệu cơ bản ngay lập tức (không có reviews)
    */
   useEffect(() => {
     const fetchBasicData = async () => {
       try {
         setError(null);

         // Lấy danh sách món ăn cơ bản (không có reviews)
         const cuisinesResponse = await cuisineService.getAllCuisines({ per_page: 100 });
         const cuisinesData = cuisinesResponse.data || cuisinesResponse;
         
         // Lấy danh mục
         const categoriesResponse = await categoryService.getAllCategories();
         const categoriesData = categoriesResponse.data || categoriesResponse;

         // Format dữ liệu món ăn cơ bản (không có reviews)
         const basicFoods = cuisinesData.map((cuisine) => ({
           id: cuisine.id,
           name: cuisine.name,
           region: cuisine.region,
           desc: cuisine.short_description,
           category_id: cuisine.category?.id,
           rating: 0, // Tạm thời để 0
           reviews: 0, // Tạm thời để 0
           price: cuisine.price_formatted || `${cuisine.price}đ`,
           img: cuisine.image || "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80",
           address: cuisine.address,
           time: cuisine.serving_time || "15-20 phút",
           delivery: cuisine.delivery,
         }));

         // Format categories
         const formattedCategories = categoriesData.map((category) => ({
           id: category.id,
           name: category.name,
           icon: category.icon,
         }));

         // Stats cơ bản từ API nhanh
         const statsResponse = await fetch('https://travel-app-api-ws77.onrender.com/api/cuisines/stats');
         const statsData = statsResponse.ok ? await statsResponse.json() : null;
         
         const basicStats = [
           { label: "Món ăn", value: statsData?.data?.total_cuisines || cuisinesData.length, color: "text-yellow-500" },
           { label: "Danh mục", value: statsData?.data?.total_categories || categoriesData.length, color: "text-blue-500" },
           { label: "Đánh giá", value: 0, color: "text-fuchsia-600" },
           { label: "Nhà hàng", value: 0, color: "text-red-500" },
         ];

         // Hiển thị ngay lập tức
         setStats(basicStats);
         setCategories(formattedCategories);
         setFoods(basicFoods);

         // Load reviews và restaurants trong background
         fetchReviewsAndRestaurants(cuisinesData, categoriesData.length);

       } catch (err) {
         console.error('Error fetching basic data:', err);
         setError('Không thể tải dữ liệu. Vui lòng thử lại sau.');
       }
     };

     fetchBasicData();
   }, []);

   /**
    * Load reviews và restaurants trong background
    */
   const fetchReviewsAndRestaurants = async (cuisinesData, totalCategories) => {
     try {
       // Load reviews
       console.log('🚀 Bắt đầu lấy reviews trong background...');
       const allReviewsResponse = await fetch(`https://travel-app-api-ws77.onrender.com/api/reviews?reviewable_type=${encodeURIComponent('App\\Models\\Cuisine')}&limit=1000`, {
         method: 'GET',
         headers: {
           'Accept': 'application/json',
           'Content-Type': 'application/json',
         },
       });
       
       if (allReviewsResponse.ok) {
         const allReviewsData = await allReviewsResponse.json();
         
         // Tạo map reviews
         const reviewsMap = {};
         if (allReviewsData.data) {
           allReviewsData.data.forEach(review => {
             const cuisineId = review.reviewable_id;
             if (!reviewsMap[cuisineId]) {
               reviewsMap[cuisineId] = [];
             }
             reviewsMap[cuisineId].push(review);
           });
         }
         
                   // Cập nhật foods với reviews
          const foodsWithReviews = cuisinesData.map((cuisine) => {
            const cuisineReviews = reviewsMap[cuisine.id] || [];
            const reviewCount = cuisineReviews.length;
            const averageRating = reviewCount > 0 
              ? Number((cuisineReviews.reduce((sum, review) => sum + review.rating, 0) / reviewCount).toFixed(1))
              : 0;
            
            return {
              id: cuisine.id,
              name: cuisine.name,
              region: cuisine.region,
              desc: cuisine.short_description,
              category_id: cuisine.category?.id,
              rating: averageRating,
              reviews: reviewCount,
              price: cuisine.price_formatted || `${cuisine.price}đ`,
              img: cuisine.image || "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80",
              address: cuisine.address,
              time: cuisine.serving_time || "15-20 phút",
              delivery: cuisine.delivery,
            };
          });

         const totalReviews = foodsWithReviews.reduce((sum, food) => sum + food.reviews, 0);
         
         // Cập nhật state
         setFoods(foodsWithReviews);
         
         // Load restaurants
         let restaurantsData = [];
         let totalRestaurants = 0;
         try {
           // Sử dụng API /restaurants thay vì /Restaurant
           const restaurantsResponse = await restaurantService.getAllRestaurants({ per_page: 4, sort_by: 'rating', sort_order: 'desc' });
           restaurantsData = restaurantsResponse.success ? restaurantsResponse.data : [];
           
           const totalRestaurantsResponse = await restaurantService.getTotalRestaurants();
           totalRestaurants = totalRestaurantsResponse.total || 0;
         } catch (restaurantError) {
           console.warn('Không thể tải dữ liệu nhà hàng:', restaurantError);
         }

         // Format restaurants với dữ liệu thực từ API
         const formattedRestaurants = restaurantsData.map(restaurant => ({
           id: restaurant.id,
           name: restaurant.name,
           desc: restaurant.description || 'Nhà hàng ngon với không gian ấm cúng',
           rating: restaurant.rating || 0,
           reviews: restaurant.total_reviews || 0,
           price: restaurant.price_range || "100,000 - 300,000 VND",
           img: restaurant.image || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=400&q=80",
           address: restaurant.address || 'Địa chỉ chưa cập nhật',
           distance: "0.5 km",
           status: "Mở cửa"
         }));

         setRestaurants(formattedRestaurants);

         // Cập nhật stats cuối cùng
         const finalStats = [
           { label: "Món ăn", value: cuisinesData.length, color: "text-yellow-500" },
           { label: "Danh mục", value: totalCategories, color: "text-blue-500" },
           { label: "Đánh giá", value: totalReviews, color: "text-fuchsia-600" },
           { label: "Nhà hàng", value: totalRestaurants, color: "text-red-500" },
         ];
         
         setStats(finalStats);
       }
     } catch (err) {
       console.error('Error fetching reviews and restaurants:', err);
     }
   };

  /**
   * Hiển thị thông báo
   */
  const showNotification = (message, type = 'success') => {
    Swal.fire({
      text: message,
      icon: type,
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
    });
  };

  /**
   * Xử lý bấm nút tym (yêu thích món ăn)
   */
  const handleToggleLike = async (foodId, foodName, e) => {
    e.stopPropagation(); // Ngăn chặn event bubble lên parent
    
    // Kiểm tra đăng nhập
    if (!localStorage.getItem('token')) {
      showNotification('Vui lòng đăng nhập để yêu thích món ăn', 'warning');
      return;
    }
    
    try {
      const existing = favourites.find(fav =>
        fav.favouritable_id === foodId &&
        fav.favouritable_type === 'App\\Models\\Cuisine'
      );

      if (existing) {
        // Xóa khỏi yêu thích
        await favouriteService.deleteFavourite(existing.id);
        setFavourites(prev => prev.filter(fav => fav.id !== existing.id));
        setLikedFoods(prev => ({ ...prev, [foodId]: false }));
        showNotification(`Đã xóa "${foodName}" khỏi yêu thích`, 'success');
      } else {
        // Thêm vào yêu thích
        const response = await favouriteService.addFavourite(foodId, 'App\\Models\\Cuisine');
        const newFavourite = response.favourite || response.data;
        setFavourites(prev => [...prev, newFavourite]);
        setLikedFoods(prev => ({ ...prev, [foodId]: true }));
        showNotification(`Đã thêm "${foodName}" vào yêu thích`, 'success');
      }
    } catch (error) {
      console.error('Error toggling favourite:', error);
      showNotification('Có lỗi xảy ra, vui lòng thử lại', 'error');
    }
  };

  /**
   * Cập nhật stats khi favorites thay đổi
   */
  useEffect(() => {
    if (favouritesLoaded && foods.length > 0) {
      const totalCuisines = foods.length;
      const totalCategories = categories.length;
      const totalReviews = foods.reduce((sum, food) => sum + (food.reviews || 0), 0);
      
      // Lấy tổng số nhà hàng từ API
      const fetchTotalRestaurants = async () => {
        try {
          const response = await restaurantService.getTotalRestaurants();
          const totalRestaurants = response.total || 0;
          
          const updatedStats = [
            { label: "Món ăn", value: totalCuisines, color: "text-yellow-500" },
            { label: "Danh mục", value: totalCategories, color: "text-blue-500" },
            { label: "Đánh giá", value: totalReviews, color: "text-fuchsia-600" },
            { label: "Nhà hàng", value: totalRestaurants, color: "text-red-500" },
          ];
          
          setStats(updatedStats);
        } catch (error) {
          console.error('Lỗi khi lấy tổng số nhà hàng:', error);
          // Fallback với số 0 nếu không lấy được
          const updatedStats = [
            { label: "Món ăn", value: totalCuisines, color: "text-yellow-500" },
            { label: "Danh mục", value: totalCategories, color: "text-blue-500" },
            { label: "Đánh giá", value: totalReviews, color: "text-fuchsia-600" },
            { label: "Nhà hàng", value: 0, color: "text-red-500" },
          ];
          setStats(updatedStats);
        }
      };
      
      fetchTotalRestaurants();
    }
  }, [favourites, favouritesLoaded, foods.length, categories.length]);



  // Lọc món ăn theo miền
  const filteredFoods = regionFilter === 'Tất cả'
    ? foods
    : foods.filter(food => food.region === regionFilter);

  // Lọc theo danh mục
  const categoryFilteredFoods = selectedCategoryId === 'all'
    ? filteredFoods
    : filteredFoods.filter(food => String(food.category_id) === String(selectedCategoryId));

  // Lọc theo tìm kiếm
  const searchedFoods = categoryFilteredFoods.filter(food =>
    food.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (food.desc && food.desc.toLowerCase().includes(searchTerm.toLowerCase()))
  );

     // Sắp xếp món ăn theo sortType
   const sortedFoods = [...searchedFoods].sort((a, b) => {
     if (sortType === 'Phổ biến') {
       // Sắp xếp theo số reviews, nếu bằng nhau thì theo rating
       if (a.reviews === b.reviews) {
         return b.rating - a.rating;
       }
       return b.reviews - a.reviews;
     } else if (sortType === 'Mới nhất') {
       return b.id - a.id;
     } else if (sortType === 'Giá tốt') {
       const getPrice = (price) => {
         if (!price) return 0;
         const match = price.toString().replace(/\./g, '').match(/\d+/);
         return match ? parseInt(match[0], 10) : 0;
       };
       return getPrice(a.price) - getPrice(b.price);
     }
     return 0;
   });

     // Số lượng sản phẩm tối đa trên trang đầu (tăng lên để hiển thị nhiều hơn)
   const MAX_PRODUCTS = 20;
   const displayedFoods = sortedFoods.slice(0, MAX_PRODUCTS);

  

  // Hiển thị error
  if (error) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  // Tiêu đề động cho danh sách món ăn
  let dynamicTitle = 'Món ăn nổi bật';
  let dynamicSubtitle = 'Những món ăn được yêu thích nhất tuần này';
  if (searchTerm.trim()) {
    dynamicTitle = `Kết quả tìm kiếm cho: "${searchTerm}"`;
    dynamicSubtitle = `Kết quả tìm kiếm cho từ khóa "${searchTerm}"`;
  } else if (selectedCategoryId !== 'all') {
    const selectedCat = categories.find(cat => String(cat.id) === String(selectedCategoryId));
    if (selectedCat) {
      dynamicTitle = `Món ăn thuộc danh mục: ${selectedCat.name}`;
      dynamicSubtitle = `Danh sách món ăn thuộc danh mục "${selectedCat.name}"`;
    }
  } else if (regionFilter !== 'Tất cả') {
    dynamicTitle = `Món ăn ${regionFilter.toLowerCase()}`;
    dynamicSubtitle = `Danh sách món ăn của ${regionFilter}`;
  } else if (sortType === 'Mới nhất') {
    dynamicTitle = 'Món ăn mới nhất';
    dynamicSubtitle = 'Những món ăn mới nhất vừa được cập nhật';
  } else if (sortType === 'Giá tốt') {
    dynamicTitle = 'Món ăn giá tốt';
    dynamicSubtitle = 'Những món ăn có giá tốt nhất hiện nay';
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <Header/>
      {/* Banner lớn full width */}
      <div className="relative w-full h-[320px] md:h-[400px] flex items-center justify-start bg-black/60" style={{backgroundImage: `url('https://images.unsplash.com/photo-1597345637412-9fd611e758f3')`, backgroundSize: 'cover', backgroundPosition: 'center'}}>
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col items-start justify-center">
          <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-2 mt-8 md:mt-0">Khám Phá Ẩm Thực Việt Nam</h1>
          <p className="text-white text-lg md:text-xl mb-6">Hành trình khám phá hương vị đặc sắc từ Bắc đến Nam</p>
          <div className="w-full max-w-xl">
            <div className="relative w-full">
              {/* Icon kính lúp bên trái */}
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60 text-lg pointer-events-none" />
              <input
                type="text"
                placeholder="Tìm kiếm món ăn, Nhà hàng..."
                className="w-full pl-10 pr-12 py-3 rounded-full bg-white/20 backdrop-blur-md border border-white/30 focus:outline-none text-gray-700 text-base shadow"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
              {/* Icon kính lúp bên phải */}
              <FaSearch className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 text-lg cursor-pointer" />
            </div>
          </div>
        </div>
      </div>

        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Thống kê */}
          <div className="flex flex-wrap justify-center items-center gap-8 py-6 w-full mt-6 relative z-20">
            {stats.map((item, idx) => (
              <div key={idx} className="flex flex-col items-center min-w-[120px]">
                <span className={`text-2xl md:text-3xl font-bold ${item.color}`}>{item.value.toLocaleString()}</span>
                <span className="text-gray-700 mt-1 font-medium">{item.label}</span>
              </div>
            ))}
          </div>

          {/* Danh mục ẩm thực */}
          <div className="w-full mt-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800 mb-2 md:mb-0">Danh mục ẩm thực</h2>
              <div className="flex gap-2">
                <button
                  className={`px-4 py-1 rounded-lg font-semibold transition-all ${selectedCategoryId === 'all' ? 'bg-gray-100 text-gray-800 font-bold' : 'bg-gray-100 text-gray-700'}`}
                  onClick={() => setSelectedCategoryId('all')}
                >
                  Tất cả
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 mb-6">
              {(showAllCategories ? categories : categories.slice(0, 6)).map((cat, idx) => (
                <button
                  key={cat.id}
                  className={`flex flex-col items-center bg-white rounded-xl shadow p-4 hover:shadow-lg transition cursor-pointer border-2 ${selectedCategoryId === cat.id ? 'border-orange-500 font-bold' : 'border-transparent'}`}
                  onClick={() => setSelectedCategoryId(cat.id)}
                  style={{ minWidth: 140 }}
                >
                  {typeof cat.icon === 'string' && (cat.icon.endsWith('.png') || cat.icon.endsWith('.svg') || cat.icon.endsWith('.jpg') || cat.icon.endsWith('.jpeg') || cat.icon.endsWith('.gif') || cat.icon.endsWith('.webp') || cat.icon.startsWith('http') || cat.icon.startsWith('category_icons/')) ? (
                                         <div className="relative inline-block">
                       <img
                         src={getImageUrl(cat.icon)}
                         alt={cat.name}
                         className="w-10 h-10 object-contain"
                         onError={(e) => {
                           console.error('❌ Lỗi load ảnh category:', e.target.src, 'Category:', cat.name);
                           // Hiển thị fallback icon
                           e.target.style.display = 'none';
                           const fallbackIcon = e.target.parentElement.querySelector('.fallback-icon');
                           if (fallbackIcon) {
                             fallbackIcon.style.display = 'inline-block';
                           }
                         }}
                         onLoad={(e) => {
                           console.log('✅ Load ảnh category thành công:', e.target.src, 'Category:', cat.name);
                         }}
                       />
                      {/* Fallback icon khi ảnh lỗi */}
                      <div className="fallback-icon hidden w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
                        <FaUtensils className="text-gray-400 text-xl" />
                      </div>
                    </div>
                  ) : (
                    <div className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded">
                      <FaUtensils className="text-gray-400 text-xl" />
                    </div>
                  )}
                  <span className="mt-2 text-gray-700 text-sm md:text-base">{cat.name}</span>
                </button>
              ))}
            </div>
            {categories.length > 6 && (
              <div className="flex justify-center mb-4">
                <button
                  className="flex items-center justify-center p-0 bg-transparent shadow-none border-none outline-none focus:outline-none group"
                  style={{ minWidth: 40 }}
                  onClick={() => setShowAllCategories((prev) => !prev)}
                >
                  <span
                    className={`transition-transform duration-300 ${showAllCategories ? 'rotate-180' : ''} group-hover:animate-bounce-arrow`}
                  >
                    <FiChevronsDown className="text-orange-500 text-3xl" />
                  </span>
                </button>
              </div>
            )}
          </div>

          {/* Món ăn nổi bật */}
          <div className="w-full mt-4">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-800">{dynamicTitle}</h2>
                <p className="text-gray-500 text-sm">{dynamicSubtitle}</p>
              </div>
              <div className="flex gap-2 items-center">
                {['Phổ biến', 'Mới nhất', 'Giá tốt'].map(type => (
                  <button
                    key={type}
                    className={`px-3 py-1 rounded-lg font-semibold text-sm transition-all ${sortType === type ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-700'}`}
                    onClick={() => setSortType(type)}
                  >
                    {type}
                  </button>
                ))}
                <Link to="/cuisine/all" className="text-orange-500 font-semibold text-sm ml-2 hover:text-orange-600 transition">Xem tất cả &rarr;</Link>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {displayedFoods.map((food, idx) => (
                <div
                  key={food.id}
                  className="bg-white rounded-xl shadow hover:shadow-lg transition flex flex-col h-full cursor-pointer"
                  onClick={() => navigate(`/cuisine/${food.id}`)}
                >
                  <img
                    src={getImageUrl(food.img)}
                    alt={food.name}
                    className="w-full h-36 object-cover rounded-t-xl"
                    onError={(e) => {
                      console.error('Lỗi load ảnh:', e.target.src, 'Food:', food.name, 'Image field:', food.img);
                      e.target.src = "https://via.placeholder.com/400x300?text=No+Image";
                    }}
                  />
                  <div className="flex-1 flex flex-col p-4">
                    {/* Dòng 1: Tên món ăn và nhãn miền */}
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-gray-800 text-base">{food.name}</span>
                      <RegionBadge region={food.region} />
                    </div>
                    {/* Dòng 2: Mô tả */}
                    <p className="text-gray-500 text-sm mb-2 line-clamp-2">{food.desc}</p>
                                         {/* Dòng 3: Đánh giá và giá tiền */}
                     <div className="flex items-center justify-between mb-1">
                       <div className="flex items-center text-sm">
                                                   {food.reviews > 0 ? (
                            <>
                              <StarRating rating={food.rating} />
                              <span className="ml-2 font-bold text-gray-700">{Number(food.rating).toFixed(1)}</span>
                              <span className="ml-1 text-gray-400">({food.reviews.toLocaleString()})</span>
                            </>
                          ) : (
                            <span className="text-gray-400 text-sm">Chưa có đánh giá</span>
                          )}
                       </div>
                       <span className="text-orange-500 font-bold text-base">{food.price}</span>
                     </div>
                    {/* Dòng 4: Địa chỉ/thời gian (trái), tym/giao hàng (phải) */}
                    <div className="flex justify-between items-start mt-auto pt-1 text-xs text-gray-500">
                      {/* Cột trái */}
                      <div className="flex flex-col">
                        <span className="flex items-center"><svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>{food.address}</span>
                        <span className="flex items-center mt-1"><svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3" /><circle cx="12" cy="12" r="10" /></svg>{food.time}</span>
                      </div>
                                             {/* Cột phải */}
                       <div className="flex flex-col items-end">
                         <HeartButton 
                           liked={favourites.some(fav => 
                             fav.favouritable_id === food.id && 
                             fav.favouritable_type === 'App\\Models\\Cuisine'
                           )} 
                           onClick={(e) => handleToggleLike(food.id, food.name, e)} 
                           size={14} 
                         />
                         {food.delivery && <span className="flex items-center text-green-500 mt-1"><svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2a2 2 0 012-2h2a2 2 0 012 2v2" /><path strokeLinecap="round" strokeLinejoin="round" d="M7 17a2 2 0 104 0 2 2 0 00-4 0zM17 17a2 2 0 104 0 2 2 0 00-4 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M5 17V7a2 2 0 012-2h10a2 2 0 012 2v10" /></svg>Giao hàng</span>}
                       </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {sortedFoods.length > MAX_PRODUCTS && (
              <div className="flex justify-center mt-6">
                <Link to="/cuisine/all" className="px-6 py-2 rounded-lg bg-orange-500 text-white font-semibold hover:bg-orange-600 transition">
                  Xem thêm món ăn
                </Link>
              </div>
            )}
          </div>

                 {/* Nhà hàng được đề xuất */}
         <div className="w-full mt-8 mb-16">
           <div className="flex justify-between items-center mb-4">
             <h2 className="text-xl font-bold text-gray-800">Nhà hàng được đề xuất</h2>
             <Link to="/restaurants" className="text-orange-500 font-semibold text-sm hover:text-orange-600 transition">Xem tất cả &rarr;</Link>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {restaurants.map((res, idx) => (
               <div 
                 key={res.id || idx} 
                 className="bg-white rounded-xl shadow hover:shadow-lg transition flex items-center p-4 gap-4 cursor-pointer"
                 onClick={() => navigate(`/restaurants/${res.id}`)}
               >
                                   <img 
                    src={getImageUrl(res.img, "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=400&q=80")} 
                    alt={res.name} 
                    className="w-24 h-24 object-cover rounded-lg" 
                    onError={(e) => {
                      console.error('Lỗi load ảnh nhà hàng:', e.target.src, 'Restaurant:', res.name, 'Image field:', res.img);
                      e.target.src = "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=400&q=80";
                    }}
                  />
                 <div className="flex-1">
                   <div className="flex items-center justify-between">
                     <span className="font-semibold text-gray-800 text-lg">{res.name}</span>
                     <span className="text-xs px-2 py-1 rounded bg-green-100 text-green-600 font-medium">{res.status}</span>
                   </div>
                   <p className="text-gray-500 text-sm mb-1 line-clamp-2">{res.desc}</p>
                                       <div className="flex items-center text-sm mb-1">
                                             {res.reviews > 0 ? (
                         <>
                           <StarRating rating={res.rating} />
                           <span className="ml-2 font-bold text-gray-700">{Number(res.rating).toFixed(1)}</span>
                           <span className="ml-1 text-gray-400">({res.reviews.toLocaleString()})</span>
                         </>
                       ) : (
                         <span className="text-gray-400 text-sm">Chưa có đánh giá</span>
                       )}
                      <span className="ml-2 text-gray-500">{res.price}</span>
                    </div>
                   <div className="flex items-center justify-between text-xs text-gray-500">
                     <span className="flex items-center">
                       <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
                         <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                       </svg>
                       {res.address}
                     </span>
                     <span className="flex items-center">
                       <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                       </svg>
                       {res.distance}
                     </span>
                   </div>
                 </div>
               </div>
             ))}
           </div>
         </div>
       </div>
       <Footer />
    </div>
  );
};

export default Cuisine; 