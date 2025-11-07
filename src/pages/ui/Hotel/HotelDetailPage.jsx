import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import { favouriteService } from "../../../services/ui/favouriteService";
import { FaStar, FaMapMarkerAlt } from "react-icons/fa";
import { MdCall, MdMessage } from "react-icons/md";
import { IoMdHeartEmpty, IoMdHeart } from "react-icons/io";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import MyMap from "../../../MyMap";
import { getAmenityIcon } from "../../../services/iconConfig";

function HotelDetailPage() {
  const { id } = useParams();
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [favourites, setFavourites] = useState([]);
  const [favouritesLoaded, setFavouritesLoaded] = useState(false);
  const mapSectionRef = useRef(null);
  const [locationPermissionDenied, setLocationPermissionDenied] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [roomAmenities, setRoomAmenities] = useState({});
  const API_BASE_URL = 'https://travel-app-api-ws77.onrender.com';

  const parseImages = (images) => {
    if (!images) return [];
    if (Array.isArray(images)) {
      return images.map(path => path.replace(/^storage\//, '')); // Loại bỏ 'storage/' khỏi đường dẫn
    }
    try {
      const parsed = JSON.parse(images) || [];
      return parsed.map(path => path.replace(/^storage\//, '')); // Loại bỏ 'storage/' khỏi đường dẫn
    } catch (e) {
      console.error("Lỗi giải mã JSON images:", e);
      return [];
    }
  };

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
            alert(
              "Bạn đã từ chối quyền truy cập vị trí. Vui lòng bật quyền truy cập vị trí trong cài đặt trình duyệt để sử dụng tính năng chỉ đường."
            );
          }
          if (callback) callback(null, null);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    } else {
      alert("Trình duyệt của bạn không hỗ trợ Định vị địa lý.");
      if (callback) callback(null, null);
    }
  }, []);

  const fetchRoomAmenities = useCallback(async (roomId) => {
    try {
      const response = await fetch(`https://travel-app-api-ws77.onrender.com/api/hotel-rooms/${roomId}/amenities`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      let amenities = [];
      if (typeof data.data === 'string') {
        amenities = JSON.parse(data.data);
      } else if (Array.isArray(data.data)) {
        amenities = data.data;
      }
      setRoomAmenities(prev => ({
        ...prev,
        [roomId]: amenities
      }));
    } catch (error) {
      console.error('Lỗi khi lấy danh sách tiện ích:', error);
    }
  }, []);

  useEffect(() => {
    if (hotel?.rooms) {
      hotel.rooms.forEach(room => {
        fetchRoomAmenities(room.id);
      });
    }
  }, [hotel?.rooms, fetchRoomAmenities]);

  useEffect(() => {
    const fetchHotelAndFavourites = async () => {
      setLoading(true);
      try {
        const res = await fetch(`https://travel-app-api-ws77.onrender.com/api/hotels/${id}`);
        const data = await res.json();

        if (!data.success) throw new Error(data.message || "Khách sạn không tồn tại");
        if (!data.data.hotel || !data.data.hotel.id) throw new Error("Dữ liệu khách sạn không hợp lệ hoặc thiếu ID");
        console.log("Dữ liệu khách sạn:", data.data);
        const parsedHotels = {
          ...data.data,
          hotel: {
            ...data.data.hotel,
            images: parseImages(data.data.hotel.images), // Áp dụng parseImages cho hotel.images
          },
          rooms: data.data.rooms.map(room => ({
            ...room,
            images: parseImages(room.images), // Áp dụng parseImages cho room.images
          })),
        };

        setHotel(parsedHotels);
        console.log("Dữ liệu khách sạn đã xử lý:", parsedHotels);
        let favData = [];
        const token = localStorage.getItem('token');
        if (token) {
          try {
            const favResponse = await favouriteService.getFavourites();
            favData = Array.isArray(favResponse.data) ? favResponse.data : [];
          } catch (err) {
            toast.error('Không thể tải danh sách yêu thích');
          }
        }

        setFavourites(favData);
        setFavouritesLoaded(true);
      } catch (error) {
        setError(error.message || "Lỗi khi tải thông tin khách sạn");
        toast.error(error.message || "Lỗi khi tải thông tin khách sạn");
      } finally {
        setLoading(false);
      }
    };
    fetchHotelAndFavourites();
  }, [id]);

  const isFavourited = useMemo(() => {
    if (!hotel || !hotel.hotel || !hotel.hotel.id || !Array.isArray(favourites)) return false;
    return favourites.some(fav =>
      String(fav.favouritable_id) === String(hotel.hotel.id) &&
      fav.favouritable_type === 'App\\Models\\Hotel'
    );
  }, [favourites, hotel]);

  const toggleFavourite = async () => {
    if (!hotel || !hotel.hotel || !hotel.hotel.id) {
      toast.error('Không thể thêm yêu thích: Dữ liệu khách sạn chưa tải');
      return;
    }
    if (!localStorage.getItem('token')) {
      toast.error('Vui lòng đăng nhập để thêm vào danh sách yêu thích');
      return;
    }
    try {
      const existing = favourites.find(fav =>
        String(fav.favouritable_id) === String(hotel.hotel.id) &&
        fav.favouritable_type === 'App\\Models\\Hotel'
      );

      if (existing) {
        await favouriteService.deleteFavourite(existing.id);
        const favResponse = await favouriteService.getFavourites();
        setFavourites(Array.isArray(favResponse.data) ? favResponse.data : []);
        toast.success('Đã xóa khỏi danh sách yêu thích');
      } else {
        await favouriteService.addFavourite(hotel.hotel.id, 'App\\Models\\Hotel');
        const favResponse = await favouriteService.getFavourites();
        setFavourites(Array.isArray(favResponse.data) ? favResponse.data : []);
        toast.success('Đã thêm vào danh sách yêu thích');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.errors
        ? Object.values(err.response.data.errors).flat().join(', ')
        : 'Không thể cập nhật danh sách yêu thích';
      toast.error(errorMessage);
    }
  };

  const handleMapSectionInteraction = () => {
    if (!userLocation && !locationPermissionDenied) {
      getUserLocation();
    }
  };

  const handleDirections = () => {
    if (!userLocation) {
      getUserLocation((lat, lng) => {
        if (lat && lng && hotel) {
          const url = `http://maps.google.com/maps?saddr=${lat},${lng}&daddr=${hotel.hotel.latitude},${hotel.hotel.longitude}`;
          window.open(url, "_blank");
        }
      });
    } else if (hotel) {
      const url = `http://maps.google.com/maps?saddr=${userLocation.lat},${userLocation.lng}&daddr=${hotel.hotel.latitude},${hotel.hotel.longitude}`;
      window.open(url, "_blank");
    }
  };

  if (loading) return <p className="text-center text-gray-500 py-10">Đang tải...</p>;
  if (error) return <p className="text-center text-red-500 py-10">{error}</p>;
  if (!hotel) return <p className="text-center text-gray-500 py-10">Không tìm thấy khách sạn</p>;

  const roomImage = hotel.hotel.images && hotel.hotel.images.length > 0
    ? `${API_BASE_URL}/storage/${hotel.hotel.images[0]}`
    : (hotel.rooms && hotel.rooms[0] && hotel.rooms[0].images && hotel.rooms[0].images.length > 0
      ? `${API_BASE_URL}/storage/${hotel.rooms[0].images[0]}`
      : "/img/default-hotel.jpg");

  const price = hotel.rooms.length !== 0 ? hotel.rooms[0].price_per_night : "Liên hệ";
  const reviewCount = hotel.hotel.reviews?.length || 0;
  const reviewAverage = reviewCount > 0
    ? (hotel.hotel.reviews.reduce((sum, review) => sum + review.rating, 0) / reviewCount).toFixed(1)
    : 0;

  return (
    <div className="font-sans text-gray-800">
      <ToastContainer />
      <Header />
      <div className="max-w-6xl mx-auto p-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">{hotel.hotel.name}</h2>
            <div className="flex items-center text-yellow-500">
              {[...Array(5)].map((_, i) => (
                <FaStar key={i} className={i < Math.round(reviewAverage || 0) ? "" : "opacity-20"} />
              ))}
              <span className="ml-2 text-sm text-gray-500">({reviewAverage || 0}/5 - {reviewCount || 0} đánh giá)</span>
            </div>
            <p className="text-gray-600 flex items-center gap-1 mt-1">
              <FaMapMarkerAlt /> {hotel.hotel.address}
            </p>
          </div>
          <div className="flex flex-col items-end">
            <div className="text-blue-600 text-lg font-semibold">{price} <span className="text-sm text-gray-500">/đêm</span></div>
            <button
              onClick={toggleFavourite}
              className="p-3 bg-white rounded-full shadow-md hover:bg-gray-100"
              disabled={!favouritesLoaded}
            >
              {isFavourited ? (
                <IoMdHeart className="h-6 w-6 text-red-600" />
              ) : (
                <IoMdHeartEmpty className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2 mt-4">
          <img
            src={roomImage}
            alt="Hotel"
            className="col-span-2 row-span-2 object-cover w-full h-64 rounded-xl"
            onError={(e) => { e.target.src = "/img/default-hotel.jpg"; }}
          />
          {hotel.hotel.images && hotel.hotel.images.length > 1 ? (
            hotel.hotel.images.slice(1, 5).map((image, index) => (
              <img
                key={index}
                src={`${API_BASE_URL}/storage/${image}`}
                alt="Hotel"
                className="object-cover w-full h-32 rounded-xl"
                onError={(e) => { e.target.src = "/img/default-hotel.jpg"; }}
              />
            ))
          ) : hotel.rooms && hotel.rooms[0] && hotel.rooms[0].images && hotel.rooms[0].images.length > 1 ? (
            hotel.rooms[0].images.slice(1, 5).map((image, index) => (
              <img
                key={index}
                src={`${API_BASE_URL}/storage/${image}`}
                alt="Room"
                className="object-cover w-full h-32 rounded-xl"
                onError={(e) => { e.target.src = "/img/default-hotel.jpg"; }}
              />
            ))
          ) : (
            <>
              <img
                src="/img/default-hotel.jpg"
                alt="Default Hotel"
                className="object-cover w-full h-32 rounded-xl"
              />
              <img
                src="/img/default-hotel.jpg"
                alt="Default Hotel"
                className="object-cover w-full h-32 rounded-xl"
              />
              <img
                src="/img/default-hotel.jpg"
                alt="Default Hotel"
                className="object-cover w-full h-32 rounded-xl"
              />
              <img
                src="/img/default-hotel.jpg"
                alt="Default Hotel"
                className="object-cover w-full h-32 rounded-xl"
              />
            </>
          )}
        </div>

        <section className="mt-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Mô tả khách sạn</h3>
            <div className="mt-4 flex gap-2">
              <button className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md"><MdCall className="h-5 w-5 mr-3" />Liên hệ</button>
              <button className="flex items-center bg-green-500 text-white px-4 py-2 rounded-md"><MdMessage className="h-5 w-5 mr-3" />Nhắn tin</button>
            </div>
          </div>
          <p className="mt-2 text-gray-700">{hotel.hotel.description}</p>
        </section>

        <section className="mt-8">
          <h3 className="text-lg font-semibold">Các loại phòng</h3>
          <div className="mt-4 space-y-4">
            {hotel.rooms.map((room, index) => {
              const roomPrice = room.price_per_night !== 0 ? room.price_per_night : "Liên hệ";
              const roomImages = room.images && room.images.length > 0 ? room.images : [];
              const amenities = roomAmenities[room.id] || [];
              return (
                <div
                  key={index}
                  className="border p-4 rounded-lg flex justify-between items-center bg-gray-50"
                >
                  <div className="flex items-center">
                    {roomImages.length > 0 ? (
                      <img
                        src={`${API_BASE_URL}/storage/${roomImages[0]}`}
                        alt="Room"
                        className="w-24 h-24 rounded-md object-cover mr-4"
                        onError={(e) => { e.target.src = "/img/default-hotel.jpg"; }}
                      />
                    ) : (
                      <img
                        src="/img/default-hotel.jpg"
                        alt="No Image"
                        className="w-24 h-24 rounded-md object-cover mr-4"
                      />
                    )}
                    <div>
                      <h4 className="font-semibold text-lg">{room.room_type}</h4>
                      <p className="text-sm text-gray-500">
                        {room.room_area ? `${Math.round(room.room_area)}` : "--"} •
                        {room.bed_type || "--"} •
                        Tối đa {room.max_occupancy || "--"} người
                      </p>
                      <div className="flex flex-wrap gap-2 text-sm mt-1 text-gray-600">
                        {amenities.length > 0 ? (
                          amenities.map((amenity, idx) => {
                            const IconComponent = getAmenityIcon(amenity.react_icon);
                            return (
                              <span
                                key={idx}
                                className="flex items-center bg-gray-100 px-2 py-1 rounded"
                              >
                                {IconComponent && (
                                  <IconComponent className="h-5 w-5 mr-1 text-blue-400 shrink-0" />
                                )}
                                <span className="truncate">{amenity.name}</span>
                              </span>
                            );
                          })
                        ) : (
                          <span className="text-gray-400">
                            Không có thông tin tiện ích
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-blue-600 font-semibold">{roomPrice}</p>
                    <p className="text-sm text-gray-500">/đêm</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="mt-8">
          <h3 className="text-lg font-semibold">Vị trí & bản đồ</h3>
          <div
            className="max-w-6xl mx-auto mt-6 bg-white p-6 rounded-xl shadow-md border border-gray-200 mb-8"
            ref={mapSectionRef}
            onMouseEnter={handleMapSectionInteraction}
          >
            <h3 className="text-xl font-bold mb-4 border-b pb-2 text-gray-800">
              Vị trí trên bản đồ
            </h3>
            <div className="w-full h-96 rounded-md overflow-hidden bg-gray-100 flex items-center justify-center">
              {hotel.hotel.latitude && hotel.hotel.longitude ? (
                <MyMap
                  lat={parseFloat(hotel.hotel.latitude)}
                  lng={parseFloat(hotel.hotel.longitude)}
                  name={hotel.hotel.name}
                />
              ) : (
                <div className="text-gray-500">
                  Không có thông tin vị trí để hiển thị bản đồ.
                </div>
              )}
            </div>
            {hotel.hotel.latitude && hotel.hotel.longitude && (
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
          <div className="flex gap-6 mt-4 text-sm text-gray-600">
            <span>Ô tô: 45 phút từ trung tâm</span>
            <span>Xe buýt: Tuyến 1,2 từ Quảng Ninh</span>
            <span>Xe máy: 35 phút, có bãi gửi xe</span>
          </div>
        </section>

        <section className="mt-8">
          <h3 className="text-lg font-semibold">Đánh giá từ khách hàng</h3>
          <div className="mt-4 flex items-start gap-8">
            <div className="text-center">
              <p className="text-4xl font-bold text-yellow-500">{reviewAverage || 0}</p>
              <p className="text-sm text-gray-500">Dựa trên {reviewCount || 0} đánh giá</p>
            </div>
            <div className="space-y-4 flex-1">
              {hotel.hotel.reviews && hotel.hotel.reviews.length > 0 ? (
                hotel.hotel.reviews.map((review, index) => (
                  <div key={index} className="bg-gray-100 p-4 rounded-lg">
                    <p className="font-semibold">{review.user?.name || 'Ẩn danh'}</p>
                    <p className="text-sm text-gray-500 mb-1">{new Date(review.created_at).toLocaleDateString('vi-VN')}</p>
                    <p className="text-gray-700">{review.comment}</p>
                    <div className="flex items-center text-yellow-500 mt-1">
                      {[...Array(5)].map((_, i) => (
                        <FaStar key={i} className={i < Math.round(review.rating || 0) ? "" : "opacity-20"} />
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">Chưa có đánh giá nào cho khách sạn này.</p>
              )}
              <button className="mt-2 text-blue-600">Xem thêm</button>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
}

export default HotelDetailPage;