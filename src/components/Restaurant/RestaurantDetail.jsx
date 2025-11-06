"use client";

import { useState, useEffect } from "react";
import { Star, MapPin, Phone, Clock, ArrowLeft } from "lucide-react";
import { restaurantAPI } from "../../services/ui/Restaurant/restaurantService";
// import { restaurantAPI } from "../../services/api";

import { useParams, useNavigate } from "react-router-dom";
import { Map } from "lucide-react";

const RestaurantDetail = ({ onBack }) => {
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams(); // Lấy từ URL

  useEffect(() => {
    if (!id) {
    setError("Không tìm thấy nhà hàng"); // hoặc navigate về trang chủ
    return;
  }
    fetchRestaurantData();
  }, [id]);

  const fetchRestaurantData = async () => {
    if (!id) return;
    try {
      setLoading(true);

      const restaurantResponse = await restaurantAPI.getById(id);
      if (restaurantResponse.data.success) {
        setRestaurant(restaurantResponse.data.data);
      } else {
        throw new Error("Không tìm thấy nhà hàng");
      }

      const dishesResponse = await restaurantAPI.getDishes(id);
      if (dishesResponse.data.success) {
        setMenuItems(dishesResponse.data.data);
      }

      const reviewsResponse = await restaurantAPI.getReviews(id);
      if (reviewsResponse.data.success) {
        setReviews(reviewsResponse.data.data.reviews);
      }

      const statsResponse = await restaurantAPI.getReviewStats(id);
      if (statsResponse.data.success) {
        setReviewStats(statsResponse.data.data);
      }

      setError(null);
    } catch (err) {
      console.error("Error fetching restaurant data:", err);
      setError("Không thể tải thông tin nhà hàng");
      setRestaurant(null); 
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) =>
    [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating)
            ? "fill-yellow-400 text-yellow-400"
            : "text-gray-300"
        }`}
      />
    ));

  const formatRating = (rating) =>
    rating ? Number.parseFloat(rating).toFixed(1) : "0.0";

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">
          {error || "Không tìm thấy nhà hàng"}
        </p>
        <button
          onClick={onBack}
          className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg"
        >
          Quay lại
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="relative aspect-[20/5]">
        <img
          src={`/image/${restaurant.image.split("/").pop()}`}
          alt={restaurant.name}
          className="w-full h-full object-cover"
        />

        <div className="absolute inset-0 bg-black bg-opacity-40"></div>

        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 bg-white bg-opacity-90 hover:bg-opacity-100 p-2 rounded-full transition"
        >
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>

        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-6">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-white mb-2">
              {restaurant.name}
            </h1>
            <div className="flex items-center space-x-4 text-white">
              <div className="flex items-center space-x-1">
                {renderStars(restaurant.rating)}
                <span className="ml-1">{formatRating(restaurant.rating)}</span>
              </div>
              <span>•</span>
              <span>{restaurant.price_range}</span>
              <span>•</span>
              <span>Ẩm thực Việt Nam</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main */}
        <div className="lg:col-span-2">
          {/* Info */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Thông tin nhà hàng
            </h2>
            <p className="text-gray-600 mb-4">{restaurant.description}</p>

            <div className="space-y-3">
              <div className="flex items-center text-gray-700">
                <MapPin className="w-5 h-5 text-red-500 mr-3" />
                <span>{restaurant.address}</span>
              </div>
              <div className="flex items-center text-gray-700">
                <Phone className="w-5 h-5 text-green-500 mr-3" />
                <span>0123 456 789</span>
              </div>
              <div className="flex items-center text-gray-700">
                <Clock className="w-5 h-5 text-blue-500 mr-3" />
                <span>8:00 - 22:00 (Thứ 2 - Chủ nhật)</span>
              </div>
            </div>
          </div>

          {/* Menu */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Thực đơn nổi bật
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {menuItems.map((item) => (
                <div
                  key={item.id}
                  className="border border-gray-200 rounded-lg overflow-hidden"
                >
                  <img
                    src={`/image/${item.image.split("/").pop()}`}
                    alt={item.name}
                    className="w-full h-32 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {item.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-2">
                      {item.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-orange-500 font-bold">
                        {item.price.toLocaleString("vi-VN")}đ
                      </span>
                      <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-1 rounded text-sm">
                        Đặt món
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Reviews */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Đánh giá khách hàng
            </h2>
            {Array.isArray(reviews) && reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.slice(0, 3).map((review, index) => (
                  <div
                    key={index}
                    className="border-b border-gray-200 pb-4 last:border-b-0"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                        <span className="text-gray-600 font-medium">{`U${
                          index + 1
                        }`}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-gray-900">
                            Khách hàng {index + 1}
                          </span>
                          <div className="flex items-center">
                            {renderStars(review.rating)}
                          </div>
                          <span className="text-gray-500 text-sm">
                            2 ngày trước
                          </span>
                        </div>
                        <p className="text-gray-700 text-sm">
                          {review.content}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">Chưa có đánh giá nào</p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          {/* Summary */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="font-bold text-gray-900 mb-4">Đánh giá tổng quan</h3>
            <div className="text-center mb-4">
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {formatRating(restaurant.rating)}
              </div>
              <div className="flex justify-center mb-1">
                {renderStars(restaurant.rating)}
              </div>
              <p className="text-gray-600 text-sm">
                {reviewStats?.total_reviews || 0} đánh giá
              </p>
            </div>

            {reviewStats?.rating_distribution && (
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((rating) => (
                  <div key={rating} className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600 w-2">{rating}</span>
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-yellow-400 h-2 rounded-full"
                        style={{
                          width: `${
                            reviewStats.rating_distribution[rating]
                              ?.percentage || 0
                          }%`,
                        }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 w-8">
                      {reviewStats.rating_distribution[rating]?.percentage || 0}
                      %
                    </span>
                  </div>
                ))}
              </div>
            )}

            <button className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg mt-4">
              Viết đánh giá
            </button>
          </div>
          {/* Location box */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="font-bold text-gray-900 mb-4">Vị trí</h3>

            <div className="flex items-start space-x-2 mb-4">
              <MapPin className="w-5 h-5 text-red-500 mt-1" />
              <div>
                <span className="text-sm font-semibold text-gray-700">
                  Địa chỉ
                </span>
                <p className="text-sm text-gray-600">{restaurant.address}</p>
              </div>
            </div>

            {/* Google Maps Placeholder */}
            <div className="w-full h-32 bg-gray-100 flex items-center justify-center rounded-md text-gray-500 text-sm mb-4">
              <Map className="w-5 h-5 mr-1" />
              Google Maps
            </div>

            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                restaurant.address
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-block text-center bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg"
            >
              🧭 Xem đường đi
            </a>
          </div>

          {/* Quick Info */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="font-bold text-gray-900 mb-4">Thông tin nhanh</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Mức giá:</span>
                <span className="font-medium">{restaurant.price_range}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Phục vụ:</span>
                <span className="font-medium">Ăn tại chỗ</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Thanh toán:</span>
                <span className="font-medium">Tiền mặt, Thẻ</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Wifi:</span>
                <span className="font-medium text-green-600">Có</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantDetail;
