"use client";

import { useState, useEffect } from "react";
import RestaurantCard from "../Restaurant/RestaurantCard";
import RestaurantDetail from "../Restaurant/RestaurantDetail";
import { restaurantAPI } from "../../services/ui/Restaurant/restaurantService";
// import { restaurantAPI } from "../../services/api";
import Hearder from "../../components/Header";
import Footer from "../../components/Footer";
import { Rocket } from "lucide-react";

const RestaurantList = () => {
  const [restaurants, setRestaurants] = useState([]);
  // const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const [filters, setFilters] = useState({
    price_range: "",
    min_rating: "",
    sort_by: "created_at",
    sort_order: "desc",
  });

  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
  });

  const priceRanges = [
    { label: "Tất cả mức giá", min: null, max: null },
    { label: "100,000 - 300,000 VND", min: 100000, max: 300000 },
    { label: "500,000 - 800,000 VND", min: 500000, max: 800000 },
    { label: "1,000,000 - 1,500,000 VND", min: 1000000, max: 1500000 },
    { label: "Trên 1,800,000 VND", min: 1800000, max: null },
  ];

  const ratingFilters = [
    { value: "", label: "Tất cả đánh giá" },
    { value: "4", label: "4+ sao" },
    { value: "4.5", label: "4.5+ sao" },
  ];

  useEffect(() => {
    // if (!selectedRestaurant) {
    // setPagination((prev) => ({ ...prev, current_page: 1 }));
    fetchRestaurants(page);
    // }
  }, [page, filters]);

  const fetchRestaurants = async (page = 1) => {
    try {
      setLoading(true);

      const params = {
        ...filters,
        page,
        per_page: 9,
      };

      // Xoá key rỗng
      Object.keys(params).forEach((key) => {
        if (
          params[key] === "" ||
          params[key] === null ||
          params[key] === undefined
        ) {
          delete params[key];
        }
      });

      console.log("📡 Gọi API với params:", params);

      const response = await restaurantAPI.getAll(params);

      const rawData = response.data;
      console.log("✅ Kết quả trả về:", rawData);

      let data = [];
      let paginationData = {
        current_page: page,
        last_page: 1,
        total: 0,
      };

      if (Array.isArray(rawData)) {
        data = rawData;
        paginationData.total = rawData.length;
      } else if (rawData.success && Array.isArray(rawData.data)) {
        data = rawData.data;
        paginationData = rawData.pagination || paginationData;
      } else {
        throw new Error("Không có dữ liệu hợp lệ");
      }
      // Phân Trang Cộng dồn
      // if (page === 1) {
      //   setRestaurants(data);
      // } else {
      //   setRestaurants((prev) => [...prev, ...data]);
      // }

      // phân trang riêng lẻ
      setRestaurants(data);

      setPagination(paginationData);
      setError(null);
    } catch (err) {
      console.error("❌ Lỗi khi fetch:", err);
      setError("Không thể tải danh sách nhà hàng");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleLoadMore = () => {
    if (pagination.current_page < pagination.last_page) {
      fetchRestaurants(pagination.current_page + 1);
    }
  };

  // const handleRestaurantClick = (restaurant) => {
  //   setSelectedRestaurant(restaurant.id);
  // };

  // 👉 Trang chi tiết

  // 👉 Loading đầu
  if (loading && restaurants.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  // 👉 Lỗi
  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={() => fetchRestaurants(1)}
          className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg"
        >
          Thử lại
        </button>
      </div>
    );
  }

  // 👉 Trang danh sách
  return (
    <>
      <Hearder />

      <main className="max-w-screen-xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Tất cả nhà hàng/ quán ăn
          </h2>
          <p className="text-gray-600">
            Khám phá những địa điểm ẩm thực tuyệt vời của Việt Nam
          </p>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 space-y-4 lg:space-y-0">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-gray-700 font-medium">Đánh giá:</span>
              {ratingFilters.map((rating) => (
                <button
                  key={rating.value}
                  onClick={() => handleFilterChange("min_rating", rating.value)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    filters.min_rating === rating.value
                      ? "bg-orange-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {rating.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-gray-700">Sắp xếp:</span>
            <select
              value={filters.sort_by}
              onChange={(e) => handleFilterChange("sort_by", e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="created_at">Mới nhất</option>
              <option value="rating">Đánh giá cao</option>
              <option value="name">Tên A-Z</option>
            </select>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-gray-600">Tìm thấy {pagination.total} nhà hàng</p>
        </div>

        {restaurants.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {restaurants.map((restaurant) => (
                <RestaurantCard key={restaurant.id} restaurant={restaurant} />
              ))}
            </div>

            <div className="flex justify-center gap-2 mt-4">
              {Array.from({ length: pagination.last_page }, (_, index) => {
                const pageNumber = index + 1;
                return (
                  <button
                    key={pageNumber}
                    onClick={() => setPage(pageNumber)}
                    className={`px-3 py-1 rounded ${
                      pageNumber === pagination.current_page
                        ? "bg-black text-white"
                        : "bg-gray-200 text-black hover:bg-gray-300"
                    }`}
                  >
                    {pageNumber}
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Không tìm thấy nhà hàng nào</p>
          </div>
        )}
      </main>

      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 w-16 h-16 flex items-center justify-center 
           bg-gradient-to-br from-purple-500 to-blue-500 text-white 
           rounded-full border-2 border-white shadow-lg 
           transition-transform hover:scale-110 z-50"
        >
          <Rocket className="w-6 h-6" />
        </button>
      )}

      <Footer />
    </>
  );
};

export default RestaurantList;
