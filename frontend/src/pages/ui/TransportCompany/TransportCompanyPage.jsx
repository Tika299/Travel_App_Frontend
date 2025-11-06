import React, { useEffect, useState, useMemo, useCallback } from "react";
import { getAllTransportCompanies } from "../../../services/ui/TransportCompany/transportCompanyService";
import { getSuggestedTransportations } from "../../../services/ui/Transportation/transportationService";
import { Link, useLocation } from "react-router-dom";
import Footer from "../../../components/Footer";
import Header from "../../../components/Header";
// Import SweetAlert2
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.css';
import { FaStar } from "react-icons/fa"; // Import FaStar để hiển thị ngôi sao

const ITEMS_PER_PAGE = 6;
const ASSET_BASE_URL = "http://localhost:8000/storage/";

// Function to fetch reviews for a single company
const fetchCompanyReviews = async (companyId) => {
  try {
    const response = await fetch(`http://localhost:8000/api/transport-companies/${companyId}/reviews`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error(`❌ Lỗi khi tải đánh giá cho công ty ID ${companyId}:`, error);
    return [];
  }
};

const TransportCompanyPage = () => {
  const [allCompanies, setAllCompanies] = useState([]);
  const [transportType, setTransportType] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviewsCache, setReviewsCache] = useState({});
  const location = useLocation();

  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("rating_desc");
  const [filterPrice, setFilterPrice] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const query = new URLSearchParams(location.search);
  const filterType = query.get("type");

  const getBasePrice = (company) => {
    let priceRange = {};
    if (typeof company.price_range === "string") {
      try {
        priceRange = JSON.parse(company.price_range || "{}");
      } catch {
        priceRange = {};
      }
    } else {
      priceRange = company.price_range || {};
    }
    return Number(priceRange.base_km) || 0;
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [companyRes, transportRes] = await Promise.all([
          getAllTransportCompanies(),
          getSuggestedTransportations(),
        ]);
        const allActiveCompanies = (companyRes.data.data || []).filter(
          (c) => c.status === "active"
        );
        setAllCompanies(allActiveCompanies);

        const allTransportTypes = transportRes.data.data || [];
        const matchedType = allTransportTypes.find(
          (t) => String(t.id) === filterType
        );
        setTransportType(matchedType || null);
        setCurrentPage(1);
      } catch (err) {
        console.error("❌ Lỗi khi tải dữ liệu:", err);
        Swal.fire({
          icon: 'error',
          title: 'Lỗi',
          text: 'Không thể tải dữ liệu hãng vận chuyển. Vui lòng thử lại sau.',
        });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [filterType]);

  const fetchReviewsForPage = useCallback(async (companiesToFetch) => {
    const newReviews = {};
    const promises = companiesToFetch.map(async (company) => {
      if (reviewsCache[company.id]) {
        return { ...company, ...reviewsCache[company.id] };
      }
      
      const reviews = await fetchCompanyReviews(company.id);
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = reviews.length > 0 ? (totalRating / reviews.length).toFixed(1) : 0;
      const reviewData = { averageRating, reviewsCount: reviews.length };
      
      newReviews[company.id] = reviewData;
      return { ...company, ...reviewData };
    });

    const results = await Promise.all(promises);
    setReviewsCache(prevCache => ({ ...prevCache, ...newReviews }));
    return results;
  }, [reviewsCache]);

  const processedCompanies = useMemo(() => {
    let filtered = allCompanies;
    if (filterType) {
      filtered = filtered.filter((c) => String(c.transportation_id) === filterType);
    }
    if (searchTerm) {
      filtered = filtered.filter((company) =>
        company.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (filterPrice !== "all") {
      filtered = filtered.filter((company) => {
        const basePrice = getBasePrice(company);
        if (filterPrice === "low") return basePrice > 0 && basePrice < 13000;
        if (filterPrice === "medium") return basePrice >= 13000 && basePrice <= 17000;
        if (filterPrice === "high") return basePrice > 20000;
        return true;
      });
    }

    const companiesWithRatings = filtered.map(c => {
      const cachedReview = reviewsCache[c.id] || { averageRating: 0, reviewsCount: 0 };
      return { ...c, ...cachedReview };
    });

    companiesWithRatings.sort((a, b) => {
      if (sortBy === "rating_desc") {
        return b.averageRating - a.averageRating;
      } else if (sortBy === "name_asc") {
        return a.name.localeCompare(b.name);
      } else if (sortBy === "price_asc") {
        return getBasePrice(a) - getBasePrice(b);
      } else if (sortBy === "price_desc") {
        return getBasePrice(b) - getBasePrice(a);
      }
      return 0;
    });

    return companiesWithRatings.map((c) => {
        let tags = [];
        if (typeof c.tags === "string") {
            try {
                tags = JSON.parse(c.tags);
            } catch {
                tags = [];
            }
        } else if (Array.isArray(c.tags)) {
            tags = c.tags;
        }
        return {
            ...c,
            is_new: c.id % 2 === 1,
            operating_hours: "5:00 - 23:00",
            has_promotion: c.id % 3 === 0,
            has_loyalty_program: c.id % 4 === 0,
            transportation_type_name: c.transportation?.name || "Không xác định",
            tags: tags,
        };
    });
  }, [allCompanies, filterType, searchTerm, filterPrice, sortBy, reviewsCache]);

  const [paginatedCompanies, setPaginatedCompanies] = useState([]);
  const totalPages = Math.ceil(processedCompanies.length / ITEMS_PER_PAGE);

  const goPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // useEffect để lấy đánh giá cho các công ty của trang hiện tại
  useEffect(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const companiesOnPage = processedCompanies.slice(startIndex, endIndex);
    
    const fetchAndSet = async () => {
        const companiesWithReviews = await fetchReviewsForPage(companiesOnPage);
        setPaginatedCompanies(companiesWithReviews);
    };
    
    fetchAndSet();
  }, [processedCompanies, currentPage, fetchReviewsForPage]);

  // Thêm useEffect mới để cuộn lên đầu trang mỗi khi currentPage hoặc filterType thay đổi
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage, filterType]);


  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <svg className="animate-spin h-10 w-10 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <Header />
      <div className="flex-grow">
        <div className="relative w-full mb-10 overflow-hidden">
          <div className="relative w-full h-[360px] overflow-hidden">
            {transportType?.banner ? (
              <img
                src={transportType.banner.startsWith("http") ? transportType.banner : `${ASSET_BASE_URL}${transportType.banner}`}
                alt={transportType?.name}
                className="w-full h-full object-cover"
                onError={(e) => (e.target.src = "/default-banner.jpg")}
              />
            ) : (
              <div className="w-full h-full bg-gray-300 flex items-center justify-center text-white">
                Không có banner
              </div>
            )}
            <div className="absolute inset-0 bg-black/50 flex flex-col justify-center items-start text-white text-left pl-8 md:pl-16 pr-4">
              <h1 className="text-4xl font-bold mb-2">
                {transportType?.name || "Phương tiện"}
              </h1>
              <p className="text-lg mb-6">
                {transportType?.description ||
                  "Khám phá các hãng vận chuyển phù hợp với bạn"}
              </p>
              <div className="w-full max-w-xl relative flex rounded-lg overflow-hidden shadow-sm">
                <input
                  type="text"
                  placeholder="Tìm kiếm hãng xe phù hợp..."
                  className="flex-grow pl-10 pr-4 py-3 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                />
                <svg
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  width="20"
                  height="20"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                    clipRule="evenodd"
                  />
                </svg>
                <button
                  onClick={() => setCurrentPage(1)}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-6 transition-colors duration-200"
                >
                  Tìm kiếm
                </button>
              </div>
              <div className="text-sm mt-4 text-gray-200">
                {processedCompanies.length > 0
                  ? `${(processedCompanies.reduce((sum, c) => sum + parseFloat(c.averageRating), 0) / processedCompanies.length).toFixed(1)} sao trung bình - ${processedCompanies.length} hãng xe - 24/7 hoạt động`
                  : 'Đang tải dữ liệu...'
                }
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 mb-8">
          <div className="flex flex-wrap gap-4 justify-center md:justify-start">
            <div className="relative">
              <label htmlFor="sortBy" className="sr-only">
                Sắp xếp
              </label>
              <select
                id="sortBy"
                className="block appearance-none w-full bg-white border border-gray-300 text-gray-700 py-2 px-4 pr-8 rounded-lg shadow-sm leading-tight focus:outline-none focus:bg-white focus:border-blue-500"
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="rating_desc">Phổ biến nhất (Đánh giá cao)</option>
                <option value="name_asc">Tên (A-Z)</option>
                <option value="price_asc">Giá thấp đến cao</option>
                <option value="price_desc">Giá cao đến thấp</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg
                  className="fill-current h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 6.757 7.586 5.343 9z" />
                </svg>
              </div>
            </div>
            <div className="relative">
              <label htmlFor="filterPrice" className="sr-only">
                Giá
              </label>
              <select
                id="filterPrice"
                className="block appearance-none w-full bg-white border border-gray-300 text-gray-700 py-2 px-4 pr-8 rounded-lg shadow-sm leading-tight focus:outline-none focus:bg-white focus:border-blue-500"
                value={filterPrice}
                onChange={(e) => {
                  setFilterPrice(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="all">Tất cả giá</option>
                <option value="low">Giá thấp (&lt; 13.000đ)</option>
                <option value="medium">Giá trung bình (13.000đ - 17.000đ)</option>
                <option value="high">Giá cao (&gt; 20.000đ)</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg
                  className="fill-current h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 6.757 7.586 5.343 9z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Danh sách hãng vận chuyển
          </h2>

          {paginatedCompanies.length === 0 ? (
            <p className="text-center text-gray-600">
              ⚠️ Không có hãng vận chuyển nào đang hoạt động hoặc phù hợp với tiêu
              chí tìm kiếm.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
              {paginatedCompanies.map((c) => {
                const priceRange =
                  typeof c.price_range === "string"
                    ? JSON.parse(c.price_range || "{}")
                    : c.price_range || {};

                const logoDisplayUrl = c.logo
                  ? c.logo.startsWith("http")
                    ? c.logo
                    : ASSET_BASE_URL + c.logo
                  : c.transportation?.icon
                  ? c.transportation.icon.startsWith("http")
                    ? c.transportation.icon
                    : ASSET_BASE_URL + c.transportation.icon
                  : "https://placehold.co/80x80/E0E0E0/4A4A4A?text=No+Logo";
                return (
                  <div
                    key={c.id}
                    className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col hover:shadow-lg transition"
                  >
                    <div className="relative">
                      <img
                        src={logoDisplayUrl}
                        alt={c.name}
                        className="w-full h-40 object-contain bg-gray-100 p-4"
                        onError={(e) => {
                          e.currentTarget.src =
                            "https://media.istockphoto.com/id/1396814518/vi/vec-to/h%C3%ACnh-%E1%BA%A3nh-s%E1%BA%AFp-t%E1%BB%9Bi-kh%C3%B4ng-c%C3%B3-%E1%BA%A3nh-kh%C3%B4ng-c%C3%B3-h%C3%ACnh-%E1%BA%A3nh-thu-nh%E1%BB%8F-c%C3%B3-s%E1%BA%B5n-h%C3%ACnh-minh-h%E1%BB%8Da-vector.jpg?s=612x612&w=0&k=20&c=MKvRDIIUmHTv2M9_Yls35-XhNeksFerTqqXmjR5vyf8=";
                        }}
                      />
                      <div className="absolute top-2 left-2 flex flex-col items-start space-y-1">
                        {c.is_new && (
                          <span className="bg-yellow-500 text-white text-xs font-semibold px-2 py-1 rounded">
                            Mới
                          </span>
                        )}
                        {c.transportation_type_name && (
                          <span className="bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded">
                            {c.transportation_type_name}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="p-4 flex flex-col justify-between flex-1">
                      <div>
                        <h3 className="text-lg font-bold text-gray-800 mb-1">
                          {c.name}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                          {c.description || "Không có mô tả."}
                        </p>
                        {c.tags && c.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-2">
                            {c.tags.map((tag) => (
                              <span
                                key={tag}
                                className="bg-gray-200 text-gray-700 text-xs font-semibold px-2 py-1 rounded-full"
                              >
                                {tag.replace(/_/g, " ")}{" "}
                              </span>
                            ))}
                          </div>
                        )}
                        <div className="flex items-center mb-2">
                          <FaStar className="w-4 h-4 text-yellow-500 mr-1" />
                          <span className="text-sm text-gray-700">
                            {c.reviewsCount > 0 ? `${c.averageRating} (${c.reviewsCount} đánh giá)` : "Chưa có đánh giá"}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 mb-1">
                          <strong>Giá khởi điểm:</strong>{" "}
                          {priceRange.base_km
                            ? `${Number(priceRange.base_km).toLocaleString()}đ`
                            : "Không rõ"}
                        </p>
                        {priceRange.additional_km && (
                          <p className="text-sm text-gray-700 mb-1">
                            <strong>Giá/km:</strong>{" "}
                            {Number(priceRange.additional_km).toLocaleString()}đ
                          </p>
                        )}
                        {c.operating_hours && (
                          <p className="text-sm text-gray-700 mb-2">
                            <strong>Thời gian hoạt động:</strong>{" "}
                            {c.operating_hours}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-2 mb-2">
                          {c.has_promotion && (
                            <span className="inline-flex items-center px-2 py-1 text-xs font-semibold bg-red-200 text-red-700 rounded-full">
                              Khuyến mãi
                            </span>
                          )}
                          {c.has_loyalty_program && (
                            <span className="inline-flex items-center px-2 py-1 text-xs font-semibold bg-blue-200 text-blue-700 rounded-full">
                              Tích điểm
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="mt-4">
                        <Link
                          to={`/transport-companies/${c.id}`}
                          className="block text-center bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md transition"
                        >
                          Xem chi tiết
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex justify-center items-center mt-8 space-x-4">
              <button
                onClick={goPrevPage}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded bg-blue-500 text-white font-semibold hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed`}
              >
                Prev
              </button>
              <span>
                Trang {currentPage} / {totalPages}
              </span>
              <button
                onClick={goNextPage}
                disabled={currentPage === totalPages}
                className={`px-4 py-2 rounded bg-blue-500 text-white font-semibold hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed`}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
      <br />
      <Footer />
    </div>
  );
};

export default TransportCompanyPage;