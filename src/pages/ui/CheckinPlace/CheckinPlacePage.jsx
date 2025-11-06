import React, { useEffect, useState, useMemo } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  FaHeart,
  FaSearch,
  FaUtensils,
  FaHotel,
  FaCar,
  FaMapMarkerAlt,
  FaStar,
} from "react-icons/fa";
import { getAllCheckinPlaces } from "../../../services/ui/CheckinPlace/checkinPlaceService";
import { getSuggestedHotels } from "../../../services/ui/Hotel/hotelService";
// Đã thay đổi import từ getSuggestedDishes sang cuisineService
import cuisineService from "../../../services/cuisineService.js"; // Import cuisineService
import { getSuggestedTransportations } from "../../../services/ui/Transportation/transportationService";
import bannerImage from "../../../assets/images/banner.png";
import bannerImageAllPlaces from "../../../assets/images/bannerImageAllPlaces.png"; // Import new banner image for all places page
import Footer from "../../../components/Footer";
import Header from "../../../components/Header";
// Import SweetAlert2
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.css';

const HeartIcon = ({ filled = false, className = "" }) => (
  <FaHeart
    className={`w-6 h-6 ${filled ? "text-red-500" : "text-white"} ${className}`}
  />
);
const CheckinPlacePage = () => {
  const [places, setPlaces] = useState([]);
  const [suggestedHotels, setSuggestedHotels] = useState([]);
  const [suggestedDishes, setSuggestedDishes] = useState([]);
  const [suggestedTransportations, setSuggestedTransportations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favoritePlaceIds, setFavoritePlaceIds] = useState(() => {
    try {
      const storedFavorites = localStorage.getItem("favoritePlaceIds");
      return storedFavorites ? JSON.parse(storedFavorites) : [];
    } catch (error) {
      console.error("Lỗi khi đọc favorites từ localStorage:", error);
      return [];
    }
  });
  useEffect(() => {
    localStorage.setItem("favoritePlaceIds", JSON.stringify(favoritePlaceIds));
  }, [favoritePlaceIds]);

  const [searchTermInput, setSearchTermInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [regionFilter, setRegionFilter] = useState("Tất cả miền");
  const [placeTypeFilter, setPlaceTypeFilter] = useState("Tất cả");
  const [sortOrder, setSortOrder] = useState("popular");

  const showMoreIncrement = 6;
  const itemsPerPageInPagination = 12; // 12 thẻ trên 1 trang

  const initialVisibleCounts = useMemo(
    () => ({
      mainPlaces: 3,
      hotels: 3,
      dishes: 3,
      transports: 8,
    }),
    []
  );
  const navigate = useNavigate();
  const location = useLocation(); // Lấy thông tin về URL hiện tại

  // Xác định nếu đây là trang "Xem tất cả"
  const isAllPlacesPage = useMemo(
    () => location.pathname === "/checkin-places/all",
    [location.pathname]
  );
  const [mainPlacesState, setMainPlacesState] = useState(() => {
    // Thiết lập trạng thái ban đầu dựa trên việc có phải là trang "Tất cả" hay không
    return {
      visibleCount: isAllPlacesPage
        ? itemsPerPageInPagination
        : initialVisibleCounts.mainPlaces,
      currentPage: 1,
      itemsPerPage: itemsPerPageInPagination,
      isPaginatedMode: isAllPlacesPage, // Nếu là trang "Tất cả", bật chế độ phân trang
    };
  });
  // Giữ nguyên các state khác vì chúng không phải là "mainPlaces"
  const [hotelsState, setHotelsState] = useState({
    visibleCount: initialVisibleCounts.hotels,
    currentPage: 1,
    itemsPerPage: itemsPerPageInPagination,
    isPaginatedMode: false,
  });
  const [dishesState, setDishesState] = useState({
    visibleCount: initialVisibleCounts.dishes,
    currentPage: 1,
    itemsPerPage: itemsPerPageInPagination,
    isPaginatedMode: false,
  });
  const [transportsState, setTransportsState] = useState({
    visibleCount: initialVisibleCounts.transports,
    currentPage: 1,
    itemsPerPage: itemsPerPageInPagination,
    isPaginatedMode: false,
  });
  // ĐỊNH NGHĨA HÀM renderFeaturedPlaceCard TRƯỚC KHI SỬ DỤNG
  const renderFeaturedPlaceCard = (item) => {
    const linkPath = item.id ?
    `/checkin-places/${item.id}` : "#";
    const isFavorited = favoritePlaceIds.includes(item.id);
    const reviewsCount = item.reviews?.length || 0; // Use optional chaining
    const averageRating = reviewsCount > 0
        ? item.reviews.reduce((acc, review) => acc + (review.rating || 0), 0) / reviewsCount
        : 0;
    const formattedRating = averageRating.toFixed(1); // Làm tròn đến 1 chữ số thập phân
    const showRating = `${formattedRating} (${reviewsCount})`;
    return (
      <Link to={linkPath} key={item.id || item.name} className="block h-full">
        <div className="relative border rounded-lg bg-white shadow hover:shadow-lg transition duration-200 h-full flex flex-col">
          <div className="relative w-full h-48 overflow-hidden rounded-t-lg">
            {item.image ? (
              <img
                src={`http://localhost:8000/storage/${item.image}`}
                alt={item.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://media.istockphoto.com/id/1396814518/vi/vec-to/h%C3%ACnh-%E1%BA%A3nh-s%E1%BA%AFp-t%E1%BB%9Bi-kh%C3%B4ng-c%C3%B3-%E1%BA%A3nh-kh%C3%B4ng-c%C3%B3-h%C3%ACnh-%E1%BA%A3nh-thu-nh%E1%BB%8F-c%C3%B3-s%E1%BA%B5n-h%C3%ACnh-minh-h%E1%BB%8Da-vector.jpg?s=612x612&w=0&k=20&c=MKvRDIIUmHTv2M9_Yls35-XhNeksFerTqqXmjR5vyf8="; // Fallback image
                }}
              />
            ) : (
              <div className="w-full h-40 bg-gray-200 flex items-center justify-center text-gray-500">
                Không có ảnh
              </div>
            )}

            <button
              onClick={(e) => handleFavoriteClick(e, item.id)}
              className="absolute top-2 right-2 p-1 bg-black bg-opacity-30 rounded-full hover:bg-opacity-50 transition-all z-10"
            >
              <HeartIcon filled={isFavorited} />
            </button>
          </div>

          <div className="p-3 flex-grow flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-1">
                <h3 className="font-bold text-gray-800 text-lg line-clamp-2 pr-2">
                  {item.name || "Không có tên"}
                </h3>
                <div className="flex items-center text-yellow-500 text-sm whitespace-nowrap flex-shrink-0">
                  <FaStar className="inline-block mr-1" />
                  {`${showRating || "Chưa có đánh giá"}`}
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-2">
                {item.address || "Không có địa chỉ"}
              </p>
              <p className="text-sm text-gray-500 line-clamp-3 mb-3">
                {item.description || "Không có mô tả"}
              </p>
            </div>

            <div className="flex justify-between items-center mt-auto">
              {item.specialties_count && (
                <span className="text-sm text-gray-700 font-medium flex items-center gap-1">
                  <FaUtensils className="inline-block" />
                  {item.specialties_count} đặc sản
                </span>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  console.log(`Khám phá: ${item.name}`);
                }}
                className="bg-red-500 text-white text-sm font-semibold px-4 py-2 rounded-full hover:bg-red-600 transition-colors duration-300 shadow"
              >
                Khám phá
              </button>
            </div>
          </div>
        </div>
      </Link>
    );
  };
  // KẾT THÚC ĐỊNH NGHĨA HÀM renderFeaturedPlaceCard

  useEffect(() => {
    fetchData();
  }, []);
  // Nếu là trang /checkin-places/all, cuộn lên đầu trang khi tải
  useEffect(() => {
    if (isAllPlacesPage) {
      window.scrollTo(0, 0);
      // Ensure the mainPlacesState is correctly set for pagination when navigating directly
      setMainPlacesState((prev) => ({
        ...prev,
        isPaginatedMode: true,
        visibleCount: itemsPerPageInPagination, // Ensure it's ready to show paginated items
        currentPage: 1,
      }));
    } else {
      // Reset to initial visible count when not on the "all" page
      setMainPlacesState((prev) => ({
        ...prev,
        isPaginatedMode: false,
        visibleCount: initialVisibleCounts.mainPlaces,
        currentPage: 1,
      }));
    }
  }, [isAllPlacesPage, initialVisibleCounts.mainPlaces]);
  const fetchData = async () => {
    try {
      const resPlaces = await getAllCheckinPlaces();
      const activePlaces =
        resPlaces.data?.data
          ?.filter((p) => p.status === "active")
          ?.map((place) => {
            const reviewsCount = place.reviews?.length || 0;
            const averageRating = reviewsCount > 0
              ? place.reviews.reduce((acc, review) => acc + (review.rating || 0), 0) / reviewsCount
              : 0;
            return {
              ...place,
              specialties_count: Math.floor(Math.random() * 20) + 5, // Random 5-24
              calculatedRating: averageRating, // Add calculatedRating here for sorting
            };
          }) || [];
      setPlaces(activePlaces);

      const hotelRes = await getSuggestedHotels();
      setSuggestedHotels(hotelRes.data?.data || []);
      // ĐÃ SỬA PHẦN NÀY: Lấy danh sách món ăn từ cuisineService và định dạng lại
      const cuisinesResponse = await cuisineService.getAllCuisines();
      const cuisinesData = cuisinesResponse.data || []; // Đảm bảo là một mảng

      const formattedDishes = cuisinesData.map(cuisine => ({
        id: cuisine.id,
        name: cuisine.name,
        region: cuisine.region,
        short_description: cuisine.short_description,
        description: cuisine.detailed_description, // Fallback to detailed_description
        category_id: cuisine.category?.id,
        rating: 4.5, // Mock rating
        reviews: Math.floor(Math.random() * 1000) + 100, // Mock reviews
        price: cuisine.price,
        price_formatted: cuisine.price_formatted || `${cuisine.price}đ`,
        image: cuisine.image, // Sử dụng trực tiếp image từ API
        address: cuisine.address,
        time: cuisine.serving_time || "15-20 phút",
        delivery: cuisine.delivery,
      }));
      setSuggestedDishes(formattedDishes); // Cập nhật state suggestedDishes

      const transportationRes = await getSuggestedTransportations();
      setSuggestedTransportations(transportationRes.data?.data || []);
    } catch (err) {
      console.error("❌ Lỗi khi tải dữ liệu:", err);
      Swal.fire({
        icon: 'error',
        title: 'Lỗi',
        text: 'Đã xảy ra lỗi khi tải dữ liệu.',
      });
    } finally {
      setLoading(false);
    }
  };
  const paginate = (sectionSetter, pageNumber) => {
    sectionSetter((prev) => ({
      ...prev,
      currentPage: pageNumber,
      isPaginatedMode: true, // Luôn bật chế độ phân trang khi paginate
      visibleCount: 0, // Không dùng visibleCount khi đang ở chế độ phân trang
    }));
  };

  // CHỈNH SỬA LẠI HÀM handleShowMore
  const handleShowMore = (sectionName) => {
    // Không dùng "Xem tất cả" trên trang "Tất cả địa điểm"
    if (sectionName === "mainPlaces" && isAllPlacesPage) {
      return;
    }

    // Chuyển hướng đến trang "tất cả" tương ứng thay vì tăng số lượng hiển thị
    let path = "";
    switch (sectionName) {
      case "mainPlaces":
        path = "/checkin-places/all";
        break;
      case "hotels":
        path = "/hotels";
        break;
      case "dishes":
        path = "/cuisine/all";
        // ĐÃ SỬA ĐƯỜNG DẪN TẠI ĐÂY
        break;
      case "transports":
        // Đối với transports, bạn đã xử lý phân trang trực tiếp trên cùng một trang.
        // Nếu muốn nhấn "Xem tất cả" trên trang chủ để hiển thị tất cả transports
        // trên cùng trang đó, bạn sẽ bật chế độ phân trang và đặt lại visibleCount.
        setTransportsState((prev) => ({
          ...prev,
          isPaginatedMode: true,
          currentPage: 1,
          visibleCount: 0, // Không dùng visibleCount khi ở chế độ phân trang
        }));
        return; // Không navigate vì xử lý trên cùng trang
      default:
        return;
    }
    navigate(path);
  };

  const handleShowAll = (sectionName) => {
    // Giữ nguyên hàm này nếu bạn vẫn có nút "Xem tất cả" cứng
    let path = "";
    switch (sectionName) {
      case "mainPlaces":
        path = "/checkin-places/all";
        break;
      case "hotels":
        path = "/hotels/all";
        break;
      case "dishes":
        path = "/cuisine/all";
        // ĐÃ SỬA ĐƯỜNG DẪN TẠI ĐÂY
        break;
      case "transports":
        const setter = setTransportsState;
        setter((prev) => ({
          ...prev,
          isPaginatedMode: true,
          currentPage: 1,
          visibleCount: 0,
        }));
        return;
      default:
        return;
    }
    navigate(path);
  };
  const parseArray = (data) => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    try {
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return String(data)
        .split(",")
        .map((item) => item.trim())
        .filter((item) => item);
    }
  };
  const filteredAndSortedMainPlaces = useMemo(() => {
    let currentPlaces = [...places];

    if (searchTerm) {
      currentPlaces = currentPlaces.filter(
        (place) =>
          place.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (place.description &&
            place.description
              .toLowerCase()
              .includes(searchTerm.toLowerCase())) ||
          (place.address &&
            place.address.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (regionFilter !== "Tất cả miền") {
      currentPlaces = currentPlaces.filter(
        (place) =>
          (place.region || "").trim().toLowerCase() ===
          regionFilter.toLowerCase()
      );
    }

    if (placeTypeFilter !== "Tất cả") {
      currentPlaces = currentPlaces.filter((place) => {
        if (placeTypeFilter === "Miễn phí") {
          return place.is_free === true;
        } else if (placeTypeFilter === "Có phí") {
          return place.is_free === false;
        }
        return (
          (place.type || "").trim().toLowerCase() ===
          placeTypeFilter.toLowerCase()
        );
      });
    }

    currentPlaces.sort((a, b) => {
      if (sortOrder === "newest") {
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      } else if (sortOrder === "rating") {
        // Use the pre-calculated 'calculatedRating' for sorting
        return (b.calculatedRating || 0) - (a.calculatedRating || 0);
      } else if (sortOrder === "popular") {
        return (b.specialties_count || 0) - (a.specialties_count || 0);
      }

      return 0;
    });
    return currentPlaces;
  }, [places, searchTerm, regionFilter, placeTypeFilter, sortOrder]);
  const getPaginatedData = (data, state) => {
    if (state.isPaginatedMode) {
      const indexOfLastItem = state.currentPage * state.itemsPerPage;
      const indexOfFirstItem = indexOfLastItem - state.itemsPerPage;
      return data.slice(indexOfFirstItem, indexOfLastItem);
    } else {
      return data.slice(0, state.visibleCount);
    }
  };
  // Các dữ liệu hiển thị chính
  const mainPlacesToDisplay = getPaginatedData(
    filteredAndSortedMainPlaces,
    mainPlacesState
  );
  const hotelsToDisplay = getPaginatedData(suggestedHotels, hotelsState);
  const dishesToDisplay = getPaginatedData(suggestedDishes, dishesState);
  const transportsToDisplay = getPaginatedData(
    suggestedTransportations,
    transportsState
  );
  const renderCard = (item, type) => {
    let linkPath = "#";
    if (type === "places" && item.id) {
      linkPath = `/checkin-places/${item.id}`;
    } else if (type === "hotels" && item.id) {
      linkPath = `/hotels/${item.id}`;
    } else if (type === "dishes" && item.id) { // Đảm bảo link cho dishes
      linkPath = `/cuisine/${item.id}`;
      // Thay đổi đường dẫn nếu cần
    } else if (type === "transports" && item.id) {
      linkPath = `/transport-companies?type=${item.id}`;
    }
    const cardContent = (
      <>
        {type === "places" && (
          <>
            <p className="text-sm text-gray-600 line-clamp-2">
              {item.address || "Không có địa chỉ"}
            </p>
            <p className="text-sm text-gray-600 line-clamp-2">
              {item.description || "Không có mô tả"}
            </p>
            {/* Đã thay đổi thẻ <p> thành <div> để tránh lỗi lồng thẻ */}
            <div>đây làm thêm</div>
          </>
        )}
        {type === "hotels" && (
          <>
            {item.image ? (
              <img
                src={`http://localhost:8000/storage/${item.image}`}
                alt={item.name}
                className="w-full h-40 object-cover rounded mb-2"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://media.istockphoto.com/id/1396814518/vi/vec-to/h%C3%ACnh-%E1%BA%A3nh-s%E1%BA%AFp-t%E1%BB%9Bi-kh%C3%B4ng-c%C3%B3-%E1%BA%A3nh-kh%C3%B4ng-c%C3%B3-h%C3%ACnh-%E1%BA%A3nh-thu-nh%E1%BB%8F-c%C3%B3-s%E1%BA%B5n-h%C3%ACnh-minh-h%E1%BB%8Da-vector.jpg?s=612x612&w=0&k=20&c=MKvRDIIUmHTv2M9_Yls35-XhNeksFerTqqXmjR5vyf8="; // Fallback image
                }}
              />
            ) : (
              <div className="w-full h-40 bg-gray-200 flex items-center justify-center text-gray-500 rounded mb-2">
                Không có ảnh
              </div>
            )}
            <div className="flex justify-between items-center w-full">
              <p className="text-sm text-gray-600 font-bold">
                {item.name || "Chưa có tên"}
              </p>
              <p className="text-sm text-black-500">
                {item.price ? `${Number(item.price).toLocaleString()} đ/đêm` : "—"}
              </p>
            </div>
            <p className="text-sm text-gray-600">{item.address || "—"}</p>
            <p className="text-sm text-yellow-600">
              <FaStar className="inline-block mr-1" /> {item.rating || "4.5"} / 5
            </p>
          </>
        )}
        {type === "dishes" && (
          <>
            {/* Đảm bảo hình ảnh được tải đúng cách */}
            {item.image ? (
              <img
                src={item.image.startsWith('http') ? item.image : `http://localhost:8000${item.image}`}
                alt={item.name}
                className="w-full h-40 object-cover rounded mb-2"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://media.istockphoto.com/id/1396814518/vi/vec-to/h%C3%ACnh-%E1%BA%A3nh-s%E1%BA%AFp-t%E1%BB%9Bi-kh%C3%B4ng-c%C3%B3-%E1%BA%A3nh-kh%C3%B4ng-c%C3%B3-h%C3%ACnh-%E1%BA%A3nh-thu-nh%E1%BB%8F-c%C3%B3-s%E1%BA%B5n-h%C3%ACnh-minh-h%E1%BB%8Da-vector.jpg?s=612x612&w=0&k=20&c=MKvRDIIUmHTv2M9_Yls35-XhNeksFerTqqXmjR5vyf8="; // Fallback image
                }}
              />
            ) : (
              <div className="w-full h-40 bg-gray-200 flex items-center justify-center text-gray-500 rounded mb-2">
                Không có ảnh
              </div>
            )}
            <p className="text-sm text-gray-600 font-bold">
              {item.name || "Chưa có tên"}
            </p>
            <p className="text-sm text-yellow-500">
              Khu vực: {item.region || "Không rõ"}
            </p>
            <p className="text-sm text-black-500">
              Giá: {item.price_formatted || (item.price ? `${Number(item.price).toLocaleString()} đ` : "—")}
            </p>
            <div>
              <p className="text-sm text-black-500">
                {item.short_description || item.description || "—"}
              </p>
            </div>
          </>
        )}
        {type === "transports" && (
          <>
            <div className="flex flex-col items-center text-center p-4">
              {/* Icon động từ backend */}
              <img
                src={`http://localhost:8000/storage/${item.icon}`}
                alt={item.name}
                className="w-10 h-10 mb-2 object-contain"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://media.istockphoto.com/id/1396814518/vi/vec-to/h%C3%ACnh-%E1%BA%A3nh-s%E1%BA%AFp-t%E1%BB%9Bi-kh%C3%B4ng-c%C3%B3-%E1%BA%A3nh-kh%C3%B4ng-c%C3%B3-h%C3%ACnh-%E1%BA%A3nh-thu-nh%E1%BB%8F-c%C3%B3-s%E1%BA%B5n-h%C3%ACnh-minh-h%E1%BB%8Da-vector.jpg?s=612x612&w=0&k=20&c=MKvRDIIUmHTv2M9_Yls35-XhNeksFerTqqXmjR5vyf8="; // Fallback icon
                }}
              />

              {/* Tên */}
              <h3 className="font-semibold text-black text-base font-bold">
                {item.name || "Không có tên"}
              </h3>

              {/* Giá */}
              <p className="text-black-500 mt-2">
                Giá trung bình:
                {item.average_price
                  ? ` ${Number(item.average_price).toLocaleString()} đ`
                  : " —"}
              </p>
            </div>
          </>
        )}
      </>
    );
    return (
      <Link
        to={linkPath}
        key={item.id || `${item.name}-${type}`}
        className="block h-full"
      >
        <div className="border rounded p-3 bg-white shadow hover:shadow-md transition duration-200 h-full flex flex-col justify-between">
          {cardContent}
        </div>
      </Link>
    );
  };

  const handleFavoriteClick = (e, itemId) => {
    e.stopPropagation();
    e.preventDefault();
    setFavoritePlaceIds((prevFavoriteIds) => {
      if (prevFavoriteIds.includes(itemId)) {
        console.log(`Đã bỏ yêu thích: ${itemId}`);
        // Sử dụng SweetAlert2 cho thông báo
        Swal.fire({
          icon: 'success',
          title: 'Đã bỏ yêu thích!',
          text: `Đã xóa địa điểm có ID ${itemId} khỏi danh sách yêu thích.`,
          timer: 1500,
          showConfirmButton: false,
        });
        return prevFavoriteIds.filter((id) => id !== itemId);
      } else {
        console.log(`Đã thêm vào yêu thích: ${itemId}`);
        // Sử dụng SweetAlert2 cho thông báo
        Swal.fire({
          icon: 'success',
          title: 'Đã thêm vào yêu thích!',
          text: `Đã thêm địa điểm có ID ${itemId} vào danh sách yêu thích.`,
          timer: 1500,
          showConfirmButton: false,
        });
        return [...prevFavoriteIds, itemId];
      }
    });
  };

  const PaginationControls = ({
    totalItems,
    currentState,
    sectionSetter,
    sectionName,
  }) => {
    const totalPages = Math.ceil(totalItems / currentState.itemsPerPage);
    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(i);
    }

    if (totalItems === 0 || totalPages <= 1) return null;
    return (
      <nav className="flex justify-center items-center gap-2 mt-8">
        <button
          onClick={() => paginate(sectionSetter, currentState.currentPage - 1)}
          disabled={currentState.currentPage === 1}
          className="px-3 py-1 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50"
        >
          Trước
        </button>

        {pageNumbers.map((number) => (
          <button
            key={number}
            onClick={() => paginate(sectionSetter, number)}
            className={`px-3 py-1 rounded-md ${
              currentState.currentPage === number
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {number}
          </button>
        ))}
        <button
          onClick={() => paginate(sectionSetter, currentState.currentPage + 1)}
          disabled={currentState.currentPage === totalPages}
          className="px-3 py-1 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50"
        >
          Sau
        </button>
      </nav>
    );
  };
  return (
    <div className="bg-gray-100 min-h-screen font-sans">
      <Header />
      {/* Banner và ô tìm kiếm */}
      <div
        className="relative bg-cover bg-center h-[400px] flex items-center justify-start"
        style={{
          backgroundImage: `url(${
            isAllPlacesPage ? bannerImageAllPlaces : bannerImage
          })`,
        }}
        // Conditional banner image
      >
        <div className="absolute inset-0 bg-black bg-opacity-50" />
        <div className="relative text-white z-10 px-4 max-w-3xl ml-20">
          <h1 className="text-5xl md:text-4xl font-bold mb-4 text-left">
            KHÁM PHÁ ĐIỂM ĐẾN TUYỆT VỜI
          </h1>
          <p className="text-lg mb-6 text-left">
            Trải nghiệm những địa điểm tuyệt vời, ẩm thực đặc sắc và văn hóa độc đáo
          </p>
          <div className="flex items-center justify-start gap-2">
            <input
              type="text"
              placeholder="📍 Tìm kiếm địa điểm..."
              className="bg-transparent placeholder-white px-4 py-2 rounded-md w-full md:w-64 focus:outline-none text-white shadow-inner border border-white"
              value={searchTermInput}
              onChange={(e) => setSearchTermInput(e.target.value)}
            />
            <button
              onClick={() => {
                if (searchTermInput.trim() === "") {
                    // Sử dụng SweetAlert2 cho thông báo rỗng
                    Swal.fire({
                        icon: 'warning',
                        title: 'Thông báo',
                        text: 'Vui lòng nhập từ khóa tìm kiếm.',
                        timer: 2000,
                        showConfirmButton: false,
                    });
                } else {
                    setSearchTerm(searchTermInput);
                }
              }}
              className="bg-blue-400 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2 transition-colors duration-200"
            >
              <span className="hidden md:inline ">
                <FaSearch className="w-6 h-6" />
              </span>{" "}
              Tìm kiếm
            </button>
          </div>
        </div>
      </div>
      {/* Thanh lọc và sắp xếp luôn hiển thị */}
      <div
        className="bg-white py-4 px-6 flex flex-wrap gap-4 shadow-sm border-b border-gray-200 mx-auto max-w-7xl"
      >
        <div className="flex flex-wrap items-center gap-3">
          <label htmlFor="region-filter" className="font-medium text-gray-700">
            Lọc theo:
          </label>
          <select
            id="region-filter"
            className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
          >
            <option value="Tất cả miền">Tất cả miền</option>
            <option value="Bắc">Miền Bắc</option>
            <option value="Trung">Miền Trung</option>
            <option value="Nam">Miền Nam</option>
          </select>
          <select
            id="type-filter"
            className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={placeTypeFilter}
            onChange={(e) => setPlaceTypeFilter(e.target.value)}
          >
            <option value="Tất cả">Loại địa điểm</option>
            <option value="Miễn phí">Miễn phí</option>
            <option value="Có phí">Có phí</option>
          </select>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            className={`px-3 py-1 rounded-md ms-20 text-sm transition-colors duration-200 ${
              sortOrder === "popular"
                ? "bg-red-500 text-white shadow"
                : "bg-black text-white "
            }`}
            onClick={() => setSortOrder("popular")}
          >
            Phổ biến
          </button>
          <button
            className={`px-3 py-1 rounded-md text-sm transition-colors duration-200 ${
              sortOrder === "newest"
                ? "bg-red-500 text-white shadow"
                : "bg-black text-white "
            }`}
            onClick={() => setSortOrder("newest")}
          >
            Mới nhất
          </button>
          <button
            className={`px-3 py-1 rounded-md text-sm transition-colors duration-200 ${
              sortOrder === "rating"
                ? "bg-red-500 text-white shadow"
                : "bg-black text-white "
            }`}
            onClick={() => setSortOrder("rating")}
          >
            Đánh giá cao
          </button>
        </div>
      </div>
      <div className="max-w-7xl mx-auto p-6 bg-white rounded-lg shadow-lg my-6">
        {/* Tiêu đề cho trang "Tất cả Địa điểm" */}
        {isAllPlacesPage ? (
          <h2 className="text-3xl font-bold text-black-700 mb-6 text-center">
            Tất Cả Địa Điểm Du Lịch
          </h2>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-black-600 ">
              Gợi ý điểm đến
            </h2>
            <p className="pb-10">
              Khám phá những địa điểm tuyệt vời cho chuyến đi của bạn
            </p>
            <div className="flex justify-between items-center mb-2 pb-2">
              <h2 className="text-2xl font-bold text-black-600">
                Điểm đến nổi bật
              </h2>
              <Link
                to="/checkin-places/all"
                className="text-blue-500 hover:underline flex items-center gap-1"
              >
                Xem tất cả <span className="text-lg">→</span>
              </Link>
            </div>
          </>
        )}
        {loading ? (
          <p className="text-center text-gray-500">Đang tải địa điểm...</p>
        ) : filteredAndSortedMainPlaces.length === 0 ? (
          <p className="text-center text-gray-500">
            Không tìm thấy địa điểm nào phù hợp với tiêu chí tìm kiếm và lọc của bạn.
          </p>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 justify-items-center">
              {mainPlacesToDisplay.map((place) => (
                <div className="w-full h-full" key={place.id}>
                  {renderFeaturedPlaceCard(place)}
                </div>
              ))}
            </div>
            {/* Hiển thị phân trang TRÊN TRANG "TẤT CẢ" */}
            {isAllPlacesPage && (
              <PaginationControls
                totalItems={filteredAndSortedMainPlaces.length}
                currentState={mainPlacesState}
                sectionSetter={setMainPlacesState}
                sectionName="mainPlaces"
              />
            )}
          </>
        )}
      </div>
      {/* Các phần khác (Khách sạn, Đặc sản, Phương tiện) chỉ hiển thị trên trang chủ */}
      {!isAllPlacesPage && (
        <>
          <section className="max-w-7xl mx-auto py-6 px-4 bg-white rounded-lg shadow-lg mb-6">
            <h2 className="text-2xl font-bold text-black-600 mb-4 border-b pb-2 ">
              Khách sạn đề xuất
            </h2>
            {suggestedHotels.length > 0 && suggestedHotels.length > initialVisibleCounts.hotels && (
              <div className="text-right mb-4">
                <button
                  onClick={() => handleShowMore("hotels")}
                  className="text-blue-500 hover:underline flex items-center gap-1 ml-auto"
                >
                  Xem tất cả <span className="text-lg">→</span>
                </button>
              </div>
            )}
            {loading ? (
              <p className="text-center text-gray-500">Đang tải khách sạn...</p>
            ) : suggestedHotels.length === 0 ? (
              <p className="text-center text-gray-500">
                Không có khách sạn nào được đề xuất.
              </p>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {hotelsToDisplay.map((hotel) => (
                    <div className="w-full h-full" key={hotel.id}>
                      {renderCard(hotel, "hotels")}
                    </div>
                  ))}
                </div>
                {hotelsToDisplay.length < suggestedHotels.length && (
                  <div className="text-center mt-6">
                    <button
                      onClick={() =>
                        setHotelsState((prev) => ({
                          ...prev,
                          visibleCount: prev.visibleCount + showMoreIncrement,
                        }))
                      }
                      className="bg-blue-500 text-white px-6 py-3 rounded-full hover:bg-blue-600 transition-colors duration-200 font-semibold shadow-sm"
                    >
                      Xem thêm
                    </button>
                  </div>
                )}
              </>
            )}
          </section>

          <section className="max-w-7xl mx-auto py-6 px-4 bg-white rounded-lg shadow-lg mb-6">
            <h2 className="text-2xl font-bold text-black-600 mb-4 border-b pb-2 ">
              Đặc sản địa phương
            </h2>
            {suggestedDishes.length > 0 && suggestedDishes.length > initialVisibleCounts.dishes && (
              <div className="text-right mb-4">
                <button
                  onClick={() => handleShowMore("dishes")}
                  className="text-blue-500 hover:underline flex items-center gap-1 ml-auto"
                >
                  Xem tất cả <span className="text-lg">→</span>
                </button>
              </div>
            )}
            {loading ? (
              <p className="text-center text-gray-500">
                Đang tải đặc sản...
              </p>
            ) : suggestedDishes.length === 0 ? (
              <p className="text-center text-gray-500">
                Không có đặc sản nào được đề xuất.
              </p>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {dishesToDisplay.map((dish) => (
                    <div className="w-full h-full" key={dish.id}>
                      {renderCard(dish, "dishes")}
                    </div>
                  ))}
                </div>
                {dishesToDisplay.length < suggestedDishes.length && (
                  <div className="text-center mt-6">
                    <button
                      onClick={() =>
                        setDishesState((prev) => ({
                          ...prev,
                          visibleCount: prev.visibleCount + showMoreIncrement,
                        }))
                      }
                      className="bg-blue-500 text-white px-6 py-3 rounded-full hover:bg-blue-600 transition-colors duration-200 font-semibold shadow-sm"
                    >
                      Xem thêm
                    </button>
                  </div>
                )}
              </>
            )}
          </section>

          <section className="max-w-7xl mx-auto py-6 px-4 bg-white rounded-lg shadow-lg mb-6">
            <h2 className="text-2xl font-bold text-black-600 mb-4 border-b pb-2 ">
              Phương tiện di chuyển
            </h2>
            {suggestedTransportations.length > 0 && suggestedTransportations.length > initialVisibleCounts.transports && (
              <div className="text-right mb-4">
                <button
                  onClick={() => handleShowMore("transports")}
                  className="text-blue-500 hover:underline flex items-center gap-1 ml-auto"
                >
                  Xem tất cả <span className="text-lg">→</span>
                </button>
              </div>
            )}
            {loading ? (
              <p className="text-center text-gray-500">
                Đang tải phương tiện...
              </p>
            ) : suggestedTransportations.length === 0 ? (
              <p className="text-center text-gray-500">
                Không có phương tiện nào được đề xuất.
              </p>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-4">
                  {transportsToDisplay.map((transport) => (
                    <div className="w-full h-full" key={transport.id}>
                      {renderCard(transport, "transports")}
                    </div>
                  ))}
                </div>
                {transportsToDisplay.length < suggestedTransportations.length && (
                  <div className="text-center mt-6">
                    <button
                      onClick={() =>
                        setTransportsState((prev) => ({
                          ...prev,
                          visibleCount: prev.visibleCount + showMoreIncrement,
                        }))
                      }
                      className="bg-blue-500 text-white px-6 py-3 rounded-full hover:bg-blue-600 transition-colors duration-200 font-semibold shadow-sm"
                    >
                      Xem thêm
                    </button>
                  </div>
                )}
              </>
            )}
          </section>
        </>
      )}

      <Footer />
    </div>
  );
};

export default CheckinPlacePage;