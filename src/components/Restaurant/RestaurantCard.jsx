"use client";

import { Star, MapPin } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const RestaurantCard = ({ restaurant }) => {
  const navigate = useNavigate();
  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${
          index < Math.floor(rating)
            ? "fill-yellow-400 text-yellow-400"
            : "text-gray-300"
        }`}
      />
    ));
  };

  const formatRating = (rating) => {
    return rating ? Number.parseFloat(rating).toFixed(1) : "0.0";
  };
  const handleClick = async (restaurant) => {
    try {
      const response = await fetch(`http://localhost:8000/api/Restaurant/${restaurant.id}`);
      if (!response.ok) throw new Error("Không tìm thấy nhà hàng này");
      const data = await response.json();

      // Nếu có router, điều hướng tới trang chi tiết
      navigate(`/${restaurant.id}`);
    } catch (error) {
      alert("Nhà hàng này đã bị xoá hoặc không còn tồn tại.");
    }
  };

  return (
    <div
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
    >
      <div className="relative h-48 bg-gray-200">
        <img
          src={`/image/${restaurant.image.split("/").pop()}`}
          alt={restaurant.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded-full text-sm font-medium">
          {restaurant.price_range}
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-bold text-gray-900 mb-1 line-clamp-1">
          {restaurant.name}
        </h3>

        <p className="text-gray-600 text-sm mb-2 line-clamp-2">
          {restaurant.description}
        </p>

        <div className="flex items-center space-x-1 mb-2">
          {renderStars(restaurant.rating)}
          <span className="text-gray-900 font-medium ml-1">
            {formatRating(restaurant.rating)}
          </span>
          <span className="text-gray-500">
            ({restaurant.total_reviews || restaurant.reviews?.length || 0} đánh
            giá)
          </span>
        </div>

        <div className="flex items-center text-gray-600 text-sm mb-4">
          <MapPin className="w-4 h-4 text-red-500 mr-1 flex-shrink-0" />
          <span className="line-clamp-1">{restaurant.address}</span>
        </div>

        <button
          className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-lg transition-colors"
          onClick={async (e) => {
            e.stopPropagation();
            try {
              const response = await fetch(`http://localhost:8000/api/Restaurant/${restaurant.id}`); // 💡 Đường dẫn API phải đúng
              if (!response.ok) throw new Error("Không tìm thấy nhà hàng này");
              const data = await response.json();
              navigate(`${restaurant.id}`);
            } catch (error) {
              alert("Nhà hàng này đã bị xoá hoặc không còn tồn tại.");
              window.location.reload();
            }
          }}
        >
          Xem chi tiết
        </button>
      </div>
    </div>
  );
};

export default RestaurantCard;
