import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Modal from "react-modal";
import {
  getTransportCompanyById,
  getReviewsForTransportCompany,
  submitReview,
} from "../../../services/ui/TransportCompany/transportCompanyService";
import MyMap from "../../../MyMap";
import Footer from "../../../components/Footer";
import Header from "../../../components/Header";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.css";

// --- START: Các Component và Hàm hỗ trợ cần thêm ---
// Hàm helper để tạo URL hình ảnh đầy đủ từ đường dẫn
const getFullImageUrl = (imagePath) => {
  if (!imagePath) {
    return "";
  }
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }
  const ASSET_BASE_URL = "https://travel-app-api-ws77.onrender.com/storage/";
  const cleanPath = imagePath.startsWith("/") ? imagePath.substring(1) : imagePath;
  return `${ASSET_BASE_URL}${cleanPath}`;
};
// Component StarRating: Giả định bạn có component này
const StarRating = ({ rating, setRating, editable = false }) => {
  const fullStars = Math.floor(rating);
  const halfStar = rating - fullStars >= 0.5;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
  const handleClick = (star) => {
    if (editable && setRating) {
      setRating(star);
    }
  };

  return (
    <div className="flex items-center">
      {[...Array(fullStars)].map((_, i) => (
        <svg
          key={`full-${i}`}
          onClick={() => handleClick(i + 1)}
          className={`w-5 h-5 text-yellow-400 cursor-pointer ${
            editable ? "hover:scale-110 transform" : ""
          }`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.92 8.517c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      {halfStar && (
        <svg
          className="w-5 h-5 text-yellow-400"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.92 8.517c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292zM10 2.927V17.073L10 2.927z">
            <defs>
              <linearGradient id="half" x1="0" x2="100%" y1="0" y2="0">
                <stop offset="50%" stopColor="currentColor" />
                <stop offset="50%" stopColor="transparent" />
              </linearGradient>
            </defs>
          </path>
        </svg>
      )}
      {[...Array(emptyStars)].map((_, i) => (
        <svg
          key={`empty-${i}`}
          onClick={() => handleClick(fullStars + (halfStar ?
            1 : 0) + i + 1)}
          className={`w-5 h-5 text-gray-300 cursor-pointer ${
            editable ?
              "hover:scale-110 transform" : ""
          }`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.92 8.517c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
};
const formatTimeAgo = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " năm trước";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " tháng trước";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " ngày trước";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " giờ trước";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " phút trước";
  return Math.floor(seconds) + " giây trước";
};
// --- END: Các Component và Hàm hỗ trợ cần thêm ---

const labelMapPrice = {
  base_km: "Giá khởi điểm (2km đầu)",
  additional_km: "Giá mỗi km thêm",
  waiting_hour: "Phí thời gian muộn mỗi giờ",
  waiting_minute_fee: "Phụ phí chờ mỗi phút",
  night_fee: "Phụ phí 22h - 5h",
  daily_rate: "Giá thuê theo ngày",
  hourly_rate: "Giá thuê theo giờ",
  base_fare: "Giá vé cơ bản (xe buýt)",
};
const labelMapPayment = {
  cash: "Tiền mặt",
  bank_card: "Thanh toán thẻ",
  insurance: "Bảo hiểm",
  momo: "MoMo",
  zalopay: "ZaloPay",
};
const TransportCompanyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [locationPermissionDenied, setLocationPermissionDenied] =
    useState(false);
  const mapRef = useRef(null);
  // --- States for Reviews ---
  const [reviews, setReviews] = useState([]);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);

  // --- NEW: States cho việc gửi đánh giá ---
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewContent, setReviewContent] = useState("");
  const [reviewImages, setReviewImages] = useState([]);
  const [submittingReview, setSubmittingReview] = useState(false);
  // Helper function to safely parse JSON strings
  const parseJSON = (value) => {
    if (typeof value === "string") {
      try {
        return JSON.parse(value);
      } catch {
        return {};
      }
    }
    return value || {};
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
  // Function to get user's geolocation
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
            Swal.fire({
              icon: "warning",
              title: "Lỗi Vị trí",
              text: "Bạn đã từ chối cấp quyền vị trí. Vui lòng bật quyền vị trí trong cài đặt trình duyệt để sử dụng tính năng chỉ đường.",
            });
            setLocationPermissionDenied(true);
          }
          if (callback) callback(null, null);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    } else {
      Swal.fire({
        icon: "error",
        title: "Lỗi",
        text: "Trình duyệt của bạn không hỗ trợ Geolocation.",
      });
      if (callback) callback(null, null);
    }
  }, []);
  // Function to fetch company details
  const fetchCompanyDetails = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getTransportCompanyById(id);
      const rawData = res.data?.data;
      if (rawData) {
        let parsedOperatingHours = {};
        if (rawData.operating_hours) {
          try {
            parsedOperatingHours =
              typeof rawData.operating_hours === "string"
                ? JSON.parse(rawData.operating_hours)
                : rawData.operating_hours;
          } catch (e) {
            console.error("Lỗi khi parse operating_hours:", e);
            parsedOperatingHours = {};
          }
        }

        let parsedHighlightServices = parseArray(rawData.highlight_services);

        setCompany({
          ...rawData,
          operating_hours: parsedOperatingHours,
          highlight_services: parsedHighlightServices,
        });
      }
    } catch (err) {
      console.error("Lỗi khi tải dữ liệu hãng vận chuyển:", err);
      Swal.fire({
        icon: "error",
        title: "Lỗi",
        text: "Không thể tải dữ liệu hãng vận chuyển. Vui lòng thử lại sau.",
      });
    } finally {
      setLoading(false);
    }
  }, [id]);
  // Function to fetch reviews for the company
  const fetchReviews = useCallback(async () => {
    try {
      const response = await getReviewsForTransportCompany(id);
      setReviews(response.data.data);
    } catch (err) {
      console.error("Lỗi khi tải đánh giá:", err);
    }
  }, [id]);
  useEffect(() => {
    fetchCompanyDetails();
    fetchReviews();
  }, [fetchCompanyDetails, fetchReviews]);
  // --- NEW: Hàm xử lý sự kiện cho Modal Review ---

  const handleReviewImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (reviewImages.length + files.length > 3) {
      Swal.fire({
        icon: "warning",
        title: "Quá giới hạn ảnh",
        text: "Bạn chỉ có thể tải lên tối đa 3 ảnh.",
      });
      return;
    }
    setReviewImages([...reviewImages, ...files]);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setSubmittingReview(true);
    try {
      // SỬ DỤNG FormData ĐỂ GỬI CẢ DỮ LIỆU VĂN BẢN VÀ ẢNH TRONG MỘT LẦN GỌI
      const formData = new FormData();
      formData.append("transport_company_id", company.id);
      formData.append("rating", reviewRating);
      formData.append("content", reviewContent);
      reviewImages.forEach((file) => {
        formData.append('images[]', file);
      });
      // --- LOGGING for DEBUGGING ---
      // Log các trường trong FormData để kiểm tra dữ liệu gửi đi
      console.log("Dữ liệu FormData đang được gửi:");
      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }
      // --- END LOGGING ---
      const response = await submitReview(formData);
      console.log("Response từ API submitReview:", response.data);

      // Cập nhật reviews state ngay lập tức với dữ liệu mới từ response
      if (response.data && response.data.data) {
        // Tạo một bản sao mới của mảng reviews và thêm đánh giá mới vào đầu
        setReviews(prevReviews => [response.data.data, ...prevReviews]);
      }
      Swal.fire({
        icon: "success",
        title: "Thành công!",
        text: "Đánh giá của bạn đã được gửi thành công.",
      });
      // Reset form và cập nhật UI. Gọi fetchReviews() như một cơ chế dự phòng.
      setIsReviewModalOpen(false);
      setReviewRating(0);
      setReviewContent("");
      setReviewImages([]);
      fetchReviews();
    } catch (error) {
      console.error("Lỗi khi gửi đánh giá:", error);
      Swal.fire({
        icon: "error",
        title: "Lỗi!",
        text: error.response?.data?.message || "Đã xảy ra lỗi khi gửi đánh giá.",
      });
    } finally {
      setSubmittingReview(false);
    }
  };
  // --- Event Handlers (giữ nguyên) ---
  const handleDirections = () => {
    if (!company.latitude || !company.longitude) {
      Swal.fire({
        icon: "warning",
        title: "Thông tin không khả dụng",
        text: "Thông tin vị trí của hãng không có sẵn.",
      });
      return;
    }

    if (!userLocation) {
      getUserLocation((lat, lng) => {
        if (lat && lng) {
          const url = `https://www.google.com/maps/dir/?api=1&origin=${lat},${lng}&destination=${company.latitude},${company.longitude}`;
          window.open(url, "_blank");
        } else {
          // Callback will already show an alert via getUserLocation
        }
      });
    } else {
      const url = `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${company.latitude},${company.longitude}`;
      window.open(url, "_blank");
    }
  };
  const handleMapSectionInteraction = () => {
    if (!userLocation && !locationPermissionDenied) {
      getUserLocation();
    }
  };

  // --- Loading and Error States ---
  if (loading)
    return <p className="p-4 text-center text-lg">🔄 Đang tải dữ liệu...</p>;
  if (!company)
    return (
      <p className="p-4 text-center text-lg text-red-500">
        ❌ Không tìm thấy hãng.
      </p>
    );
  // --- Data Preparation ---
  const price = company.price_range ? parseJSON(company.price_range) : {};
  const hours = company.operating_hours || {};
  const paymentMethodsRaw = company.payment_methods;
  const paymentMethods =
    typeof paymentMethodsRaw === "string"
      ? parseArray(paymentMethodsRaw)
      : Array.isArray(paymentMethodsRaw)
        ? paymentMethodsRaw
        : [];

  const logoPath = company.logo || company.transportation?.icon;
  const logoUrl = logoPath
    ? getFullImageUrl(logoPath)
    : "https://placehold.co/80x80/E0E0E0/4A4A4A?text=No+Logo";
  const bannerUrl = getFullImageUrl(
    company.transportation?.banner ||
      "https://placehold.co/1280x256/E0E0E0/4A4A4A?text=No+Banner"
  );
  // --- Review Calculation Logic ---
  const placeReviews = reviews.filter((review) => review.is_approved);
  const totalReviews = placeReviews.length;
  const sumRatings = placeReviews.reduce(
    (sum, review) => sum + review.rating,
    0
  );
  const averageRating =
    totalReviews > 0 ? (sumRatings / totalReviews).toFixed(1) : "0.0";

  const ratingBreakdown = {};
  for (let i = 1; i <= 5; i++) {
    const count = placeReviews.filter(
      (review) => Math.floor(review.rating) === i
    ).length;
    ratingBreakdown[i] =
      totalReviews > 0 ? ((count / totalReviews) * 100).toFixed(0) : 0;
  }

  const reviewsToDisplay = showAllReviews
    ? placeReviews
    : placeReviews.slice(0, 2);
  return (
    <div className="h-screen flex flex-col bg-gray-100 font-sans text-gray-800">
      <Header />
      <div className="flex-grow">
        {/* --- Header Section (giữ nguyên) --- */}
        <div
          className="relative bg-cover bg-center h-64 flex items-center justify-start pl-8 md:pl-16"
          style={{ backgroundImage: `url('${bannerUrl}')` }}
        >
          <div className="flex items-center gap-6 text-white">
            <img
              src={logoUrl}
              alt={company.name}
              onError={(e) => {
                e.currentTarget.src =
                  "https://media.istockphoto.com/id/1396814518/vi/vec-to/h%C3%ACnh-%E1%BA%A3nh-s%E1%BA%AFp-t%E1%BB%9Bi-kh%C3%B4ng-c%C3%B3-%E1%BA%A3nh-kh%C3%B4ng-c%C3%B3-h%C3%ACnh-%E1%BA%A3nh-thu-nh%E1%BB%8F-c%C3%B3-s%E1%BA%B5n-h%C3%ACnh-minh-h%E1%BB%8Da-vector.jpg?s=612x612&w=0&k=20&c=MKvRDIIUmHTv2M9_Yls35-XhNeksFerTqqXmjR5vyf8=";
              }}
              className="w-20 h-20 object-contain rounded-full border-4 border-white shadow-lg bg-white p-1"
            />
            <div className="bg-white/80 rounded-xl px-6 py-4 shadow-lg">
              <h1 className="text-3xl font-extrabold text-gray-800">
                {company.name}
              </h1>
              <p className="text-base font-light text-gray-600">
                {company.short_description ||
                  "Hãng xe uy tín hàng đầu Việt Nam"}
              </p>
              <p className="text-sm mt-1 text-gray-500">
                {company.coverage_area ||
                  "Toàn quốc"} -{" "}
                {company.is_24_7 ? "24/7 hoạt động" : "Giờ giới hạn"}
              </p>
            </div>
          </div>
        </div>

        {/* --- Main Content Section (giữ nguyên) --- */}
        <section className="max-w-6xl mx-auto mt-6 grid lg:grid-cols-10 gap-6 px-4">
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="bg-white rounded-xl shadow p-6 border">
              <h2 className="text-xl font-bold mb-3">Thông tin chi tiết</h2>
              <p className="text-sm text-gray-700 mb-6 leading-relaxed">
                {company.description ||
                  "Không có mô tả chi tiết."}
              </p>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="border rounded-lg p-4 bg-gray-50 shadow-sm">
                  <h3 className="font-semibold mb-3">Bảng giá dịch vụ</h3>
                  <ul className="text-sm space-y-1">
                    {Object.keys(price).length ?
                      (
                        Object.entries(price).map(([k, v]) => (
                          <li key={k} className="flex justify-between">
                            <span>{labelMapPrice[k] || k}</span>
                            <span className="font-medium text-emerald-600">
                              {Number(v).toLocaleString()}đ
                            </span>
                          </li>
                        ))
                      ) : (
                        <li>—</li>
                      )}
                  </ul>
                </div>
                <div className="border rounded-lg p-4 bg-gray-50 shadow-sm">
                  <h3 className="font-semibold mb-3">Thời gian hoạt động</h3>
                  <ul className="text-sm space-y-1">
                    {hours["Thứ 2- Chủ Nhật"] && (
                      <li className="flex justify-between">
                        <span>Thứ 2 - Chủ Nhật</span>
                        <span className="font-medium text-emerald-600">
                          {hours["Thứ 2- Chủ Nhật"]}
                        </span>
                      </li>
                    )}
                    {hours["Tổng Đài "] && (
                      <li className="flex justify-between">
                        <span>Tổng Đài</span>
                        <span className="font-medium text-emerald-600">
                          {hours["Tổng Đài "]}
                        </span>
                      </li>
                    )}
                    {hours["Thời gian phản hồi"] && (
                      <li className="flex justify-between">
                        <span>Thời gian phản hồi</span>
                        <span className="font-medium text-emerald-600">
                          {hours["Thời gian phản hồi"]}
                        </span>
                      </li>
                    )}
                    {!hours["Thứ 2- Chủ Nhật"] &&
                      !hours["Tổng Đài "] &&
                      !hours["Thời gian phản hồi"] && <li>—</li>}
                  </ul>
                </div>
              </div>
              <div className="mt-6">
                <h3 className="font-semibold mb-2">Dịch vụ nổi bật</h3>
                <div className="flex flex-wrap gap-3 text-sm">
                  {company.highlight_services &&
                    company.highlight_services.length > 0 ?
                    (
                      company.highlight_services.map((service, index) => (
                        <span
                          key={index}
                          className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full"
                        >
                          {service.replace(/_/g, " ")}
                        </span>
                      ))
                    ) : (
                      <p className="text-gray-500">
                        Chưa có dịch vụ nổi bật nào.
                      </p>
                    )}
                  {paymentMethods.includes("momo") && (
                    <span className="bg-pink-50 text-pink-700 px-3 py-1 rounded-full">
                      MoMo
                    </span>
                  )}
                  {paymentMethods.includes("zalopay") && (
                    <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full">
                      ZaloPay
                    </span>
                  )}
                  {company.has_mobile_app && (
                    <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full">
                      Ứng dụng di động
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
          <aside className="lg:col-span-3 flex flex-col gap-6">
            <div className="bg-white rounded-xl shadow p-6 border flex flex-col gap-4">
              <h3 className="font-semibold text-lg">Thông tin liên hệ</h3>
              <ul className="text-sm space-y-3">
                <li className="flex items-start gap-2">
                  <span className="material-icons text-indigo-600">place</span>
                  <span>{company.address || "—"}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="material-icons text-green-600">call</span>
                  <span>{company.phone_number || "—"}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="material-icons text-pink-600">email</span>
                  <span>{company.email || "—"}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="material-icons text-red-600">web</span>
                  {company.website ?
                    (
                      <a
                        href={company.website}
                        target="_blank"
                        rel="noreferrer"
                        className="underline text-blue-600"
                      >
                        {company.website}
                      </a>
                    ) : (
                      "—"
                    )}
                </li>
              </ul>
              <div className="pt-4 mt-auto grid gap-3">
                <a
                  href={`tel:${company.phone_number}`}
                  className="py-3 bg-blue-500 text-white font-medium rounded-lg shadow hover:bg-blue-600 flex items-center justify-center gap-2"
                >
                  Gọi ngay
                </a>
                <button
                  onClick={handleDirections}
                  className="py-3 bg-orange-500 text-white font-medium rounded-lg shadow hover:bg-orange-600 flex items-center justify-center gap-2"
                >
                  Chỉ đường
                </button>
              </div>
            </div>
          </aside>
        </section>

        {/* --- Map Section (giữ nguyên) --- */}
        <div
          className="max-w-6xl mx-auto mt-6 bg-white p-6 rounded-xl shadow-md border border-gray-200 mb-8"
          ref={mapRef}
          onMouseEnter={handleMapSectionInteraction}
        >
          <h3 className="text-xl font-bold mb-4 border-b pb-2">
            Vị trí trên bản đồ
          </h3>
          <div className="w-full h-96 rounded-md overflow-hidden">
            {company.latitude && company.longitude ?
              (
                <MyMap
                  lat={parseFloat(company.latitude)}
                  lng={parseFloat(company.longitude)}
                  name={company.name}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  Không có thông tin vị trí.
                </div>
              )}
          </div>
        </div>

        {/* --- NEW: Customer Reviews Section with two columns --- */}
        <div className="mt-10 p-6 bg-white rounded-lg shadow-lg max-w-6xl mx-auto">
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

          {totalReviews > 0 ?
            (
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
                    {/* --- Khối code hiển thị bình luận đã được chỉnh sửa --- */}
                    {reviews.map((review) => (
                      <div key={review.id} className="bg-white p-4 rounded-lg mb-4 shadow-sm border border-gray-100">
                        <div className="flex items-start gap-4 mb-2">
                          <img
                            src={review.user?.avatar ? getFullImageUrl(review.user.avatar) : "https://media.istockphoto.com/id/1396814518/vi/vec-to/h%C3%ACnh-%E1%BA%A3nh-s%E1%BA%AFp-t%C3%BBi-kh%C3%B4ng-c%C3%B3-%E1%BA%A3nh-kh%C3%B4ng-c%C3%B3-h%C3%ACnh-%E1%BA%A3nh-thu-nh%E1%BB%8F-c%C3%B3-s%C3%A2n-h%C3%ACnh-minh-h%C3%ACa-vector.jpg?s=612x612&w=0&k=20&c=MKvRDIIUmHTv2M9_Yls35-XhNeksFerTqqXmjR5vyf8="}
                            alt={review.user?.name || review.guest_name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                          <div>
                            <div className="font-semibold text-lg text-gray-800">
                              {review.user?.name || review.guest_name || "Người dùng ẩn danh"}
                            </div>
                            {/* Hiển thị số sao */}
                            <div className="flex items-center">
                              <StarRating rating={review.rating} />
                            </div>
                            <div className="text-sm text-gray-400 mt-1">
                              {formatTimeAgo(review.created_at)}
                            </div>
                          </div>
                        </div>
                        <p className="text-gray-600 my-2">{review.content}</p>
                        {review.images && JSON.parse(review.images).length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {JSON.parse(review.images).map((imagePath, i) => (
                              <img
                                key={i}
                                src={getFullImageUrl(imagePath)}
                                alt={`Review image ${i}`}
                                className="w-24 h-24 object-cover rounded-md border border-gray-300"
                                onError={(e) =>
                                  (e.target.src = "https://media.istockphoto.com/id/1396814518/vi/vec-to/h%C3%ACnh-%E1%BA%A3nh-s%E1%BA%AFp-t%C3%BBi-kh%C3%B4ng-c%C3%B3-%E1%BA%A3nh-kh%C3%B4ng-c%C3%B3-h%C3%ACnh-%E1%BA%A3nh-thu-nh%E1%BB%8F-c%C3%B3-s%C3%A2n-h%C3%ACnh-minh-h%C3%ACa-vector.jpg?s=612x612&w=0&k=20&c=MKvRDIIUmHTv2M9_Yls35-XhNeksFerTqqXmjR5vyf8=")
                                }
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                    {/* --- End of review display block --- */}
                  </div>

                  {placeReviews.length > reviewsToDisplay.length && (
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
      </div>
      <Footer />
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
              submittingReview || reviewRating === 0 || reviewContent.trim() === ""
            }
          >
            {submittingReview ? "Đang gửi..." : "Gửi đánh giá"}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default TransportCompanyDetail;