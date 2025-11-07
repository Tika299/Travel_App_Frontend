import React, { useEffect, useState } from "react";
import cuisineService from "../../services/cuisineService";
import { FaSearch, FaMapMarkerAlt, FaHeart } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import Hearder from "../../components/Header";
import Footer from "../../components/Footer";

// Function để xử lý URL ảnh (giống như trong FoodList)
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

const PAGE_SIZE = 8;

const CuisineAll = () => {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [city, setCity] = useState("");
  const [price, setPrice] = useState("");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({});
  const [provinces, setProvinces] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("/datatinhthanh34.json")
      .then(res => res.json())
      .then(data => {
        const provinceNames = data.map(p => p.name);
        provinceNames.sort((a, b) => a.localeCompare(b, 'vi'));
        setProvinces(provinceNames);
      });
  }, []);

  useEffect(() => {
    const fetchFoods = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = {
          page,
          per_page: PAGE_SIZE,
          search: searchTerm,
          city,
          price,
        };
        const res = await cuisineService.getAllCuisines(params);
        
        // Hiển thị ngay lập tức
        setFoods(res.data || []);
        setMeta(res.meta || {});
        setLoading(false);
        
      } catch (err) {
        setError("Không thể tải dữ liệu.");
        setLoading(false);
      }
    };
    fetchFoods();
  }, [searchTerm, city, price, page]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPage(1);
  };

  const handleCityChange = (e) => {
    setCity(e.target.value);
    setPage(1);
  };

  const handlePriceChange = (e) => {
    setPrice(e.target.value);
    setPage(1);
  };

  const totalPages = meta.last_page || 1;
  const getPageNumbers = () => {
    const arr = [];
    for (let i = 1; i <= totalPages; i++) arr.push(i);
    return arr;
  };

  // Lọc foods theo tỉnh/thành và giá
  let filteredFoods = foods;
  if (city) {
    filteredFoods = filteredFoods.filter(food =>
      (food.address || "").toLowerCase().includes(city.toLowerCase())
    );
  }
  if (price) {
    // price dạng "min-max" (chuỗi)
    const [min, max] = price.split("-").map(Number);
    filteredFoods = filteredFoods.filter(food => {
      // Lấy giá số từ price hoặc price_formatted
      let foodPrice = 0;
      if (food.price) {
        foodPrice = typeof food.price === 'number' ? food.price : parseInt((food.price + '').replace(/\D/g, ""));
      } else if (food.price_formatted) {
        foodPrice = parseInt((food.price_formatted + '').replace(/\D/g, ""));
      }
      return foodPrice >= min && foodPrice <= max;
    });
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <Hearder />
      {/* Banner lớn full width giống Cuisine */}
      <div className="relative w-full h-[320px] md:h-[400px] flex items-center justify-start bg-black/60" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1597345637412-9fd611e758f3')`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col items-start justify-center">
          <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-2 mt-8 md:mt-0">Khám Phá Ẩm Thực Việt Nam</h1>
          <p className="text-white text-lg md:text-xl mb-6">Hành trình khám phá hương vị đặc sắc từ Bắc đến Nam</p>
        </div>
      </div>

      {/* Filter bar */}
      <div className="max-w-screen-xl mx-auto px-4 py-6 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Tìm kiếm món ăn..."
            className="w-full pl-10 pr-4 py-2 rounded-full bg-white border border-gray-200 focus:outline-none text-gray-700 text-base shadow"
          />
        </div>
        <select
          value={city}
          onChange={handleCityChange}
          className="px-4 py-2 rounded-full bg-white border border-gray-200 text-gray-700 min-w-[160px]"
        >
          <option value="">Tỉnh/Thành phố</option>
          {provinces.map((province, idx) => (
            <option key={idx} value={province}>{province}</option>
          ))}
        </select>
        <select
          value={price}
          onChange={handlePriceChange}
          className="px-4 py-2 rounded-full bg-white border border-gray-200 text-gray-700 min-w-[140px]"
        >
          <option value="">Giá</option>
          <option value="1-50000">Dưới 50,000đ</option>
          <option value="50000-100000">50,000đ - 100,000đ</option>
          <option value="100000-9999999">Trên 100,000đ</option>
        </select>
        <button
          onClick={() => { setSearchTerm(""); setCity(""); setPrice(""); setPage(1); }}
          className="px-4 py-2 rounded-full bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300"
        >
          Đặt lại
        </button>
      </div>

      {/* Grid */}
      <div className="max-w-screen-xl mx-auto px-4">
        <h2 className="text-2xl font-bold mb-4">Ẩm thực đặc sản</h2>
        {loading ? (
          <div className="text-center py-12 text-gray-500">Đang tải dữ liệu...</div>
        ) : error ? (
          <div className="text-center py-12 text-red-500">{error}</div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {filteredFoods.map(food => (
                <div
                  key={food.id}
                  className="bg-white rounded-2xl shadow hover:shadow-xl transition flex flex-col h-full border border-gray-100 cursor-pointer"
                  onClick={() => navigate(`/cuisine/${food.id}`)}
                >
                                     <img
                     src={getImageUrl(food.image)}
                     alt={food.name}
                     className="w-full h-40 object-cover rounded-t-2xl"
                     onError={(e) => {
                       console.error('Lỗi load ảnh:', e.target.src, 'Food:', food.name, 'Image field:', food.image);
                       e.target.src = "https://via.placeholder.com/400x300?text=No+Image";
                     }}
                   />
                  <div className="flex-1 flex flex-col p-4">
                    <h3 className="font-bold text-lg text-gray-900 mb-1 truncate">{food.name}</h3>
                    <div className="flex items-center gap-2 mb-1">
                      <FaMapMarkerAlt className="text-red-400 text-sm" />
                      <span className="text-gray-700 text-sm font-semibold truncate">{food.address}</span>
                    </div>
                    <p className="text-gray-600 text-sm mb-2 line-clamp-2">{food.short_description}</p>
                    <div className="flex items-center gap-2 mt-auto">
                      <span className="text-green-600 font-bold text-base">{food.price_formatted || food.price}</span>
                      <button className="ml-auto"><FaHeart className="text-gray-300 hover:text-red-500 transition" /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-8 gap-2 items-center select-none">
                <button
                  className="px-3 py-1 rounded-full bg-gray-200 hover:bg-gray-300"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >&lt;</button>
                {getPageNumbers().map(i =>
                  <button
                    key={i}
                    className={`px-3 py-1 rounded-full font-semibold ${page === i ? "bg-orange-500 text-white" : "bg-gray-200 hover:bg-gray-300"}`}
                    onClick={() => setPage(i)}
                    disabled={page === i}
                  >{i}</button>
                )}
                <button
                  className="px-3 py-1 rounded-full bg-gray-200 hover:bg-gray-300"
                  disabled={page === totalPages}
                  onClick={() => setPage(page + 1)}
                >&gt;</button>
              </div>
            )}
          </>
        )}
      </div>
      <div className="mt-16"></div>
      <Footer />
    </div>
  );
};

export default CuisineAll; 