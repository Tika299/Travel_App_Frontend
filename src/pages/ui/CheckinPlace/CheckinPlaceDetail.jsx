import React, {
  useEffect,
  useState,
  useMemo,
  useRef,
  useCallback,
} from "react";
import { useParams, useNavigate } from "react-router-dom";
import Modal from "react-modal";
import { FaHeart, FaMapMarkerAlt, FaRegHeart } from "react-icons/fa";
// Import SweetAlert2
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.css";

// Import Font Awesome icons

import {
  getCheckinPlaceById,
  getReviewsForCheckinPlace,
  submitReview,
} from "../../../services/ui/CheckinPlace/checkinPlaceService";

import { getSuggestedHotels } from "../../../services/ui/Hotel/hotelService";
import MyMap from "../../../MyMap";

// Đảm bảo bạn có các file Header.jsx và Footer.jsx đúng
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";

Modal.setAppElement("#root");

// Component hiển thị xếp hạng sao (giữ nguyên)
const StarRating = ({ rating, setRating = null, editable = false }) => {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
  const handleClick = (starValue) => {
    if (editable && setRating) {
      setRating(starValue);
    }
  };

  return (
    <div className="flex">
      {[...Array(5)].map((_, i) => {
        const starValue = i + 1;
        return (
          <svg
            key={`star-${i}`}
            className={`w-5 h-5 ${
              starValue <= rating ? "text-yellow-400" : "text-gray-300"
            } ${editable ? "cursor-pointer" : ""} fill-current`}
            viewBox="0 0 24 24"
            onClick={() => handleClick(starValue)}
          >
            {editable &&
            starValue === Math.ceil(rating) &&
            rating % 1 > 0 &&
            halfStar ? (
              <defs>
                <linearGradient id={`half-editable-${starValue}`}>
                  <stop offset="50%" stopColor="currentColor" />
                  <stop offset="50%" stopColor="transparent" />
                </linearGradient>
              </defs>
            ) : null}
            <path
              d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
              fill={
                editable &&
                starValue === Math.ceil(rating) &&
                rating % 1 > 0 &&
                halfStar
                  ? `url(#half-editable-${starValue})`
                  : "currentColor"
              }
            />
          </svg>
        );
      })}
    </div>
  );
};

// Helper function to format time difference (giữ nguyên)
const formatTimeAgo = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Hôm nay";
  if (diffDays === 1) return "Hôm qua";
  return `${diffDays} ngày trước`;
};
const CheckinPlaceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [place, setPlace] = useState(null);
  const [suggestedHotels, setSuggestedHotels] = useState([]);
  const [placeReviews, setPlaceReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  // State for image handling
  const [mainImage, setMainImage] = useState("");
  const [showAllThumbnails, setShowAllThumbnails] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // State for Review Modal
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewContent, setReviewContent] = useState("");
  const [reviewImages, setReviewImages] = useState([]);
  const [submittingReview, setSubmittingReview] = useState(false);
  // State for user location and review display
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [locationPermissionDenied, setLocationPermissionDenied] =
    useState(false);
  const mapSectionRef = useRef(null);

  // State mới để quản lý danh sách ID của các mục yêu thích
  const [favoritePlaceIds, setFavoritePlaceIds] = useState(() => {
    try {
      const storedFavorites = localStorage.getItem("favoritePlaceIds");
      return storedFavorites ? JSON.parse(storedFavorites) : [];
    } catch (error) {
      console.error("Lỗi khi đọc favorites từ localStorage:", error);
      return [];
    }
  });
  // Sử dụng useEffect để lưu favoritePlaceIds vào localStorage mỗi khi nó thay đổi
  useEffect(() => {
    localStorage.setItem("favoritePlaceIds", JSON.stringify(favoritePlaceIds));
  }, [favoritePlaceIds]);
  // Function to get full image URL (giữ nguyên)
  const getFullImageUrl = (imgPath) => {
    if (!imgPath)
      return "https://media.istockphoto.com/id/1396814518/vi/vec-to/h%C3%ACnh-%E1%BA%A3nh-s%E1%BA%AFp-t%E1%BB%9Bi-kh%C3%B4ng-c%C3%B3-%E1%BA%A3nh-kh%C3%B4ng-c%C3%B3-h%C3%ình-minh-h%E1%BB%8Da-vector.jpg?s=612x612&w=0&k=20&c=MKvRDIIUmHTv2M9_Yls35-XhNeksFerTqqXmjR5vyf8=";
    if (imgPath.startsWith("http://") || imgPath.startsWith("https://")) {
      return imgPath;
    }
    if (imgPath.startsWith("/storage")) {
      return `https://travel-app-api-ws77.onrender.com${imgPath}`;
    }
    return `https://travel-app-api-ws77.onrender.com/storage/${imgPath.replace(/^\/+/, "")}`;
  };

  // Function to load place data (giữ nguyên)
  const loadPlaceData = useCallback(() => {
    getCheckinPlaceById(id)
      .then((res) => {
        const data = res.data.data;

        let parsedImages = [];
        if (Array.isArray(data.images)) {
          parsedImages = data.images;
        } else if (typeof data.images === "string") {
          try {
            parsedImages = JSON.parse(data.images);
            if (!Array.isArray(parsedImages)) {
              parsedImages = [parsedImages];
            }
          } catch (e) {
            console.warn("Lỗi khi parse data.images (không phải JSON):", e);
            parsedImages = [data.images];
          }
        } else {
          parsedImages = [];
        }

        const combinedImages = [];
        if (data.image) {
          combinedImages.push(data.image);
        }
        if (Array.isArray(parsedImages) && parsedImages.length > 0) {
          combinedImages.push(...parsedImages);
        }
        if (
          Array.isArray(data.checkin_photos) &&
          data.checkin_photos.length > 0
        ) {
          combinedImages.push(...data.checkin_photos.map((p) => p.image));
        }

        const uniqueImages = [...new Set(combinedImages)];
        setPlace({
          ...data,
          images: uniqueImages,
        });
        const initialMainImage =
          data.image || (uniqueImages.length > 0 ? uniqueImages[0] : "");
        setMainImage(initialMainImage);
      })
      .catch((err) => console.error("❌ Lỗi khi lấy chi tiết địa điểm:", err))
      .finally(() => setLoading(false));
  }, [id]);

  // Function to load place reviews
  const loadPlaceReviews = useCallback(() => {
    getReviewsForCheckinPlace(id)
      .then((res) => {
        // Nếu API trả về res.data.data là mảng review
        setPlaceReviews(res.data.data || []);
      })
      .catch((err) => console.error("❌ Lỗi khi lấy đánh giá địa điểm:", err));
  }, [id]);
  // Function to get user's location (giữ nguyên)
  const getUserLocation = useCallback((callback = null) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
          setLocationPermissionDenied(false);
          if (callback) callback(pos.coords.latitude, pos.coords.longitude);
        },
        (err) => {
          console.warn("Không thể lấy vị trí người dùng:", err);
          if (err.code === 1) {
            setLocationPermissionDenied(true);
            Swal.fire({
              icon: "warning",
              title: "Từ chối truy cập vị trí",
              text: "Bạn đã từ chối quyền truy cập vị trí. Vui lòng bật quyền truy cập vị trí trong cài đặt trình duyệt để sử dụng tính năng chỉ đường.",
            });
          }
          if (callback) callback(null, null);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    } else {
      Swal.fire({
        icon: "info",
        title: "Trình duyệt không hỗ trợ",
        text: "Trình duyệt của bạn không hỗ trợ Định vị địa lý.",
      });
      if (callback) callback(null, null);
    }
  }, []);
  // Effect to load data on component mount or ID change (giữ nguyên)
  useEffect(() => {
    loadPlaceData(); // Chỉ lấy thông tin địa điểm
    loadPlaceReviews(); // Lấy review từ API riêng
    getSuggestedHotels()
      .then((res) => setSuggestedHotels(res.data.data || []))
      .catch((err) => console.error("❌ Lỗi khi lấy khách sạn đề xuất:", err));
  }, [id, loadPlaceData, loadPlaceReviews]);
  // Handle directions to the place (giữ nguyên)
  const handleDirections = () => {
    if (!userLocation) {
      getUserLocation((lat, lng) => {
        if (lat && lng && place) {
          const url = `https://www.google.com/maps/dir/${lat},${lng}/${place.latitude},${place.longitude}`;
          window.open(url, "_blank");
        }
      });
    } else if (place) {
      const url = `https://www.google.com/maps/dir/${userLocation.lat},${userLocation.lng}/${place.latitude},${place.longitude}`;
      window.open(url, "_blank");
    }
  };
  // Handle map section interaction (to request location if needed) (giữ nguyên)
  const handleMapSectionInteraction = () => {
    if (!userLocation && !locationPermissionDenied) {
      getUserLocation();
    }
  };

  // Memoized thumbnails for performance (giữ nguyên)
  const allDisplayImages = useMemo(() => {
    if (!place) return [];
    return place.images;
  }, [place]);
  const thumbnailsToShow = useMemo(() => {
    return showAllThumbnails ? allDisplayImages : allDisplayImages.slice(0, 3);
  }, [showAllThumbnails, allDisplayImages]);
  // Memoized reviews to display (giữ nguyên)
  const user = JSON.parse(localStorage.getItem("user")); // Lấy user hiện tại

  const approvedOrMineReviews = useMemo(() => {
    return placeReviews.filter(
      (review) =>
        review.is_approved === 1 || (user && review.user_id === user.id)
    );
  }, [placeReviews, user]);

  const reviewsToDisplay = useMemo(() => {
    return showAllReviews ? placeReviews : placeReviews.slice(0, 2);
  }, [showAllReviews, placeReviews]);
  // Calculate overall rating and breakdown from placeReviews (giữ nguyên)
  const { averageRating, totalReviews, ratingBreakdown } = useMemo(() => {
    const total = placeReviews.length;
    let sumRatings = 0;
    const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

    placeReviews.forEach((review) => {
      sumRatings += review.rating;
      const roundedRating = Math.floor(review.rating);
      if (roundedRating >= 1 && roundedRating <= 5) {
        breakdown[roundedRating]++;
      }
    });

    const avg = total > 0 ? (sumRatings / total).toFixed(1) : "0.0";
    const calculatedBreakdown = Object.keys(breakdown).reduce((acc, star) => {
      acc[star] = total > 0 ? ((breakdown[star] / total) * 100).toFixed(0) : 0;
      return acc;
    }, {});

    return {
      averageRating: avg,
      totalReviews: total,
      ratingBreakdown: calculatedBreakdown,
    };
  }, [placeReviews]);

  // Function to format price (giữ nguyên)
  const formatPrice = (price) => Number(price).toLocaleString("vi-VN") + " VND";
  // Handle favorite button click (giữ nguyên)
  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setFavoritePlaceIds((prevFavoriteIds) => {
      if (prevFavoriteIds.includes(place.id)) {
        console.log(`Đã bỏ yêu thích: ${place.id}`);
        return prevFavoriteIds.filter((favId) => favId !== place.id);
      } else {
        console.log(`Đã thêm vào yêu thích: ${place.id}`);
        return [...prevFavoriteIds, place.id];
      }
    });
  };

  const isFavorited = favoritePlaceIds.includes(place?.id); // Kiểm tra trạng thái yêu thích

  // Handle review image selection (giữ nguyên)
  const handleReviewImageChange = (e) => {
    const files = Array.from(e.target.files);
    setReviewImages(files.slice(0, 3));
  };

  // Handle review submission (giữ nguyên)
  const handleReviewSubmit = async () => {
    if (reviewRating === 0) {
      Swal.fire({
        icon: "warning",
        title: "Lỗi",
        text: "Vui lòng chọn số sao để đánh giá.",
      });
      return;
    }
    if (reviewContent.trim() === "") {
      Swal.fire({
        icon: "warning",
        title: "Lỗi",
        text: "Vui lòng nhập nội dung đánh giá.",
      });
      return;
    }

    const formData = new FormData();
    formData.append("reviewable_type", "App\\Models\\CheckinPlace");
    formData.append("reviewable_id", id);
    formData.append("content", reviewContent);
    formData.append("rating", reviewRating);
    reviewImages.forEach((image, index) => {
      formData.append(`images[${index}]`, image);
    });

    setSubmittingReview(true);
    try {
      const res = await submitReview(formData);
      const newReview = res.data.data; // Giả sử API trả về review vừa tạo
      Swal.fire({
        icon: "success",
        title: "Thành công!",
        text: "Đánh giá của bạn đã được gửi thành công và đang chờ duyệt!",
      });
      setIsReviewModalOpen(false);
      setReviewRating(0);
      setReviewContent("");
      setReviewImages([]);
      // Thêm review mới vào đầu danh sách
      setPlaceReviews((prev) => [newReview, ...prev]);
      // Nếu muốn đồng bộ với backend, vẫn gọi lại loadPlaceReviews sau đó
      // loadPlaceReviews();
    } catch (err) {
      console.error("❌ Lỗi khi gửi đánh giá:", err);
      if (err.response && err.response.data && err.response.data.message) {
        Swal.fire({
          icon: "error",
          title: "Lỗi",
          text: `Đã xảy ra lỗi: ${err.response.data.message}`,
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Lỗi",
          text: "Đã xảy ra lỗi trong quá trình gửi đánh giá.",
        });
      }
    } finally {
      setSubmittingReview(false);
    }
  };
  if (loading)
    return <div className="p-6 text-center text-gray-600">🔄 Đang tải...</div>;
  if (!place)
    return (
      <div className="p-6 text-center text-red-500">
        ❌ Không tìm thấy địa điểm.
      </div>
    );
  return (
    <>
      {" "}
      {/* Sử dụng Fragment hoặc một div không có giới hạn chiều rộng */}
      <Header />
      {/* Nội dung chính của trang, được bọc trong div có giới hạn chiều rộng */}
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Main image and thumbnails section */}
          <div className="md:w-1/2">
            <img
              src={getFullImageUrl(mainImage)}
              alt={place.name}
              className="w-full h-96 object-cover rounded shadow border-2 border-blue-400 cursor-pointer"
              onClick={() => {
                setIsPreviewOpen(true);
              }}
            />
            <div className="grid grid-cols-4 gap-2 mt-2">
              {thumbnailsToShow.map((img, idx) => (
                <img
                  key={idx}
                  src={getFullImageUrl(img)}
                  className={`h-20 w-full object-cover rounded cursor-pointer ${
                    mainImage === img ? "border-2 border-blue-500" : "border"
                  }`}
                  onClick={() => setMainImage(img)}
                />
              ))}
              {!showAllThumbnails && allDisplayImages.length > 3 && (
                <div
                  onClick={() => setShowAllThumbnails(true)}
                  className="h-20 flex items-center justify-center bg-gray-200 rounded cursor-pointer text-gray-700 font-medium hover:bg-gray-300 transition-colors duration-200"
                >
                  +{allDisplayImages.length - 3} ảnh
                </div>
              )}
            </div>
          </div>

          {/* Basic Information Section */}
          <div className="md:w-1/2 space-y-4">
            <h1 className="text-3xl font-bold text-gray-900">{place.name}</h1>
            <p className="text-gray-600 flex items-center gap-1">
              <FaMapMarkerAlt className="h-4 w-4 text-gray-500" />{" "}
              {/* Icon địa điểm */}
              {place.address}
            </p>

            <div className="bg-pink-100 border border-pink-300 rounded p-4 shadow">
              <div className="flex justify-around items-center">
                <div className="text-center">
                  <p className="text-xl font-bold text-pink-600">
                    {place.checkin_count?.toLocaleString() || 0}
                  </p>
                  <p className="text-sm text-pink-700">Lượt check-in</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-purple-600">
                    {totalReviews?.toLocaleString() || 0}
                  </p>
                  <p className="text-sm text-purple-700">
                    Người ghé thăm / Đánh giá
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-1 text-sm text-gray-800">
              <div className="flex justify-between items-center">
                <span className="font-medium">💸 Giá vé:</span>
                <span className="text-right">
                  {place.is_free ? "Miễn phí" : formatPrice(place.price)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">🕒 Giờ mở cửa:</span>
                <span className="text-right">
                  {place.operating_hours?.open && place.operating_hours?.close
                    ? `${place.operating_hours.open} - ${place.operating_hours.close}`
                    : "Không có thông tin"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">⌛ Thời gian tham quan:</span>
                <span className="text-right">4-6 giờ</span>
              </div>
            </div>

            <div className="flex gap-4 mt-4">
              <button
                onClick={() => navigate(`/review`)}
                className="flex-1 bg-blue-500 text-white px-4 py-3 rounded-lg hover:bg-blue-600 transition-colors duration-200 text-lg font-semibold shadow-md"
              >
                Đánh giá ngay
              </button>
              <button
                onClick={handleFavoriteClick}
                className={`p-3 rounded-lg transition-colors duration-200 shadow-md flex items-center justify-center
                  ${
                    isFavorited
                      ? "bg-red-500 hover:bg-red-600"
                      : "bg-gray-200 hover:bg-gray-300"
                  }
                `}
              >
                <FaHeart
                  className={`w-6 h-6 ${
                    isFavorited ? "text-white" : "text-gray-600"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Detailed Description */}
        <div className="mt-10 p-6 bg-white rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-2 text-gray-800 border-b pb-2">
            📌 Mô tả chi tiết
          </h2>
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
            {place.description}
          </p>
        </div>

        {/* Map Section */}
        <div
          className="max-w-6xl mx-auto mt-6 bg-white p-6 rounded-xl shadow-md border border-gray-200 mb-8"
          ref={mapSectionRef}
          onMouseEnter={handleMapSectionInteraction}
        >
          <h3 className="text-xl font-bold mb-4 border-b pb-2 text-gray-800">
            Vị trí trên bản đồ
          </h3>
          <div className="w-full h-96 rounded-md overflow-hidden bg-gray-100 flex items-center justify-center">
            {place.latitude && place.longitude ? (
              <MyMap
                lat={parseFloat(place.latitude)}
                lng={parseFloat(place.longitude)}
                name={place.name}
              />
            ) : (
              <div className="text-gray-500">
                Không có thông tin vị trí để hiển thị bản đồ.
              </div>
            )}
          </div>
          {place.latitude && place.longitude && (
            <button
              onClick={handleDirections}
              className="mt-4 bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors duration-200 font-semibold shadow-md"
            >
              Chỉ đường đến đây
            </button>
          )}
          {locationPermissionDenied && (
            <p className="text-red-500 text-sm mt-2">
              Không thể hiển thị chỉ đường. Vui lòng cấp quyền vị trí trong cài
              đặt trình duyệt của bạn.
            </p>
          )}
        </div>

        {/* Suggested Hotels */}
        <h2 className="text-2xl font-bold mt-10 mb-4 text-gray-800">
          🏨 Khách sạn đề xuất
        </h2>
        <div className="mt-6 p-6 bg-white rounded-lg shadow-lg">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {suggestedHotels.slice(0, 3).map((hotel) => (
              <div
                key={hotel.id}
                className="border border-gray-200 rounded-xl shadow-sm overflow-hidden bg-white hover:shadow-md transition-shadow duration-200 cursor-pointer"
              >
                <img
                  src={getFullImageUrl(hotel.image)}
                  className="w-full h-40 object-cover"
                  alt={hotel.name}
                />
                <div className="p-3">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {hotel.name}
                  </h3>
                  <p className="text-sm text-gray-600 flex items-center gap-1">
                    <FaMapMarkerAlt className="h-4 w-4" />
                    {hotel.address}
                  </p>
                  <p className="text-blue-600 font-bold mt-1">
                    {formatPrice(hotel.price)} / đêm
                  </p>
                </div>
              </div>
            ))}
            {suggestedHotels.length === 0 && (
              <p className="text-gray-500 text-center col-span-full">
                Không có khách sạn đề xuất nào.
              </p>
            )}
          </div>
        </div>

        {/* Customer Reviews Section with two columns */}
        <div className="mt-10 p-6 bg-white rounded-lg shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">
              Đánh giá từ khách hàng
            </h2>
            <button
              onClick={() => setIsReviewModalOpen(true)}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-200 font-semibold shadow-md"
            >
              Viết đánh giá
            </button>
          </div>

          {totalReviews > 0 ? (
            <div className="flex flex-col md:flex-row gap-8">
              {/* Left Column: Overall Rating and Breakdown */}
              <div className="md:w-1/3 flex-shrink-0">
                <div className="sticky top-6">
                  <div className="flex flex-col items-center mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-5xl font-bold text-gray-900">
                      {averageRating}
                    </p>
                    <StarRating rating={parseFloat(averageRating)} />
                    <p className="text-sm text-gray-600 mt-1">
                      Dựa trên {totalReviews} đánh giá
                    </p>
                  </div>

                  <div className="space-y-2 mt-4">
                    {Object.keys(ratingBreakdown)
                      .sort((a, b) => b - a)
                      .map((star) => (
                        <div key={star} className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-700">
                            {star} sao
                          </span>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-yellow-400 h-2 rounded-full"
                              style={{ width: `${ratingBreakdown[star]}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600 w-10 text-right">
                            {ratingBreakdown[star]}%
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Individual Reviews */}
              <div className="md:w-2/3">
                <div className="space-y-6">
                  {reviewsToDisplay.length > 0 ? (
                    reviewsToDisplay.map((review) => (
                      <div
                        key={review.id}
                        className="p-4 mb-4 bg-gray-50 rounded-lg border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4"
                      >
                        <div className="flex-shrink-0 flex items-center gap-3">
                          <img
                            src={
                              review.user?.avatar
                                ? `https://travel-app-api-ws77.onrender.com/storage/${review.user.avatar}`
                                : "https://ui-avatars.com/api/?name=" +
                                  review.user?.name
                            }
                            alt={review.user?.name}
                            className="w-12 h-12 rounded-full object-cover border"
                          />
                          <div>
                            <p className="font-semibold text-gray-800">
                              {review.user?.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatTimeAgo(review.created_at)}
                            </p>
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-bold text-yellow-500">
                              {review.rating}★
                            </span>
                            <StarRating rating={review.rating} />
                          </div>
                          <p className="text-gray-700">{review.content}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p>Chưa có bình luận nào cho địa điểm này.</p>
                  )}
                </div>

                {/* "Show more reviews" button for the right column */}
                {placeReviews.length > 2 && (
                  <div className="text-center mt-6">
                    <button
                      onClick={() => setShowAllReviews(!showAllReviews)}
                      className="bg-gray-200 text-gray-700 px-6 py-3 rounded-full hover:bg-gray-300 transition-colors duration-200 font-semibold shadow-sm"
                    >
                      {showAllReviews
                        ? "Thu gọn"
                        : `Xem thêm (${
                            placeReviews.length - reviewsToDisplay.length
                          } đánh giá)`}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <p className="text-gray-600 text-center py-4">
              Chưa có bình luận nào cho địa điểm này. Hãy là người đầu tiên!
            </p>
          )}
        </div>

        {/* Image Preview Modal */}
        <Modal
          isOpen={isPreviewOpen}
          onRequestClose={() => setIsPreviewOpen(false)}
          className="relative max-w-5xl mx-auto my-8 bg-white rounded-lg shadow-xl overflow-hidden focus:outline-none"
          overlayClassName="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[100]"
        >
          <button
            onClick={() => setIsPreviewOpen(false)}
            className="absolute top-3 right-3 text-white bg-gray-800 bg-opacity-75 rounded-full p-2 text-sm hover:bg-opacity-100 transition-all duration-200 z-10"
            aria-label="Close image preview"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
          <img
            src={getFullImageUrl(mainImage)}
            className="w-full h-auto max-h-[90vh] object-contain mx-auto"
            alt="Large preview"
            onError={(e) => {
              e.target.src =
                "https://media.istockphoto.com/id/1396814518/vi/vec-to/h%C3%ACnh-%E1%BA%A3nh-s%E1%BA%AFp-t%E1%BB%9Bi-kh%C3%B4ng-c%C3%B3-%E1%BA%A3nh-kh%C3%B4ng-c%C3%B3-h%C3%ình-%E1%BA%A3nh-thu-nh%E1%BB%8F-c%C3%B5-s%E1%BA%B5n-h%C3%ình-minh-h%E1%BB%8Da-vector.jpg?s=612x612&w=0&k=20&c=MKvRDIIUmHTv2M9_Yls35-XhNeksFerTqqXmjR5vyf8=";
            }}
          />
        </Modal>

        {/* Review Modal */}
        <Modal
          isOpen={isReviewModalOpen}
          onRequestClose={() => {
            setIsReviewModalOpen(false);
            setReviewRating(0);
            setReviewContent("");
            setReviewImages([]);
          }}
          className="relative bg-white p-6 rounded-lg shadow-xl max-w-lg mx-auto my-12 focus:outline-none"
          overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        >
          <h2 className="text-2xl font-bold mb-4 text-gray-800 border-b pb-2">
            📝 Viết đánh giá của bạn
          </h2>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Xếp hạng của bạn:
            </label>
            <StarRating
              rating={reviewRating}
              setRating={setReviewRating}
              editable={true}
            />
          </div>
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="reviewContent"
            >
              Nội dung đánh giá:
            </label>
            <textarea
              id="reviewContent"
              rows="4"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
              placeholder="Chia sẻ trải nghiệm của bạn về địa điểm này..."
              value={reviewContent}
              onChange={(e) => setReviewContent(e.target.value)}
            ></textarea>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Thêm ảnh (tối đa 3 ảnh):
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleReviewImageChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 mb-2"
            />
            <div className="flex gap-2 mt-2">
              {reviewImages.map((file, index) => (
                <img
                  key={index}
                  src={URL.createObjectURL(file)}
                  alt={`Review preview ${index}`}
                  className="w-24 h-24 object-cover rounded-md border border-gray-300"
                />
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={() => {
                setIsReviewModalOpen(false);
                setReviewRating(0);
                setReviewContent("");
                setReviewImages([]);
              }}
              className="px-5 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors duration-200 font-semibold"
            >
              Hủy
            </button>
            <button
              onClick={handleReviewSubmit}
              className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-semibold shadow-md"
              disabled={
                submittingReview ||
                reviewRating === 0 ||
                reviewContent.trim() === ""
              }
            >
              {submittingReview ? "Đang gửi..." : "Gửi đánh giá"}
            </button>
          </div>
        </Modal>
      </div>{" "}
      {/* Kết thúc div chứa nội dung chính */}
      <Footer />
    </>
  );
};

export default CheckinPlaceDetail;
