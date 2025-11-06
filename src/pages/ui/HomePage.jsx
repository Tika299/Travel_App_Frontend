import React, { useState, useEffect, memo } from "react";
import { Link } from "react-router-dom";
import { PiStar, PiStarFill, PiStarHalfFill } from "react-icons/pi";
import { IoMdHeartEmpty } from "react-icons/io";
import { FaMapMarkerAlt, FaUser, FaHeart, FaTag, FaArrowRight, FaCheck, FaCompass } from "react-icons/fa";
import { PiTriangleFill } from "react-icons/pi";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

import { favouriteService } from "../../services/ui/favouriteService"; // Import favourite API service

const API_BASE_URL = "http://localhost:8000/"; // Base API URL for images

// Function để xử lý URL ảnh (giống như trong FoodList)
const getImageUrl = (imagePath, fallbackUrl = "/public/img/PhoHaNoi.jpg") => {
  if (!imagePath || imagePath.trim() === '') {
    return fallbackUrl;
  }
  
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  // Xử lý đường dẫn local
  const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
  return `http://localhost:8000/${cleanPath}`;
};

// Các thành phần card như DestinationCard, CuisineCard, HotelCard, MembershipCard không thay đổi

const DestinationCard = memo(({ destination, favourites, toggleFavourite }) => {
    const rating = destination.rating || 0;
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating - fullStars >= 0.25 && rating - fullStars < 0.99;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    const isFavourited = favourites.some(fav =>
        fav.favouritable_id === destination.id
        &&
        fav.favouritable_type === 'App\\Models\\CheckinPlace'
    );
    return (
        <div className="relative">
            <Link
                to={`/checkin-places/${destination.id}`}
                className="block bg-white shadow-lg rounded mb-4 hover:shadow-xl transition"
            >
                <div
                    className="bg-cover bg-center h-64 rounded-t"
                    style={{ backgroundImage: `url(${destination.image || '/public/img/VinhHaLong.jpg'})` }}
                >
                    <div className="flex items-center justify-between p-4">
                        <div className="flex bg-white items-center rounded-full p-1 space-x-1">
                            {[...Array(fullStars)].map((_, i) => (
                                <PiStarFill key={i} className="h-6 w-6 text-yellow-500" />
                            ))}
                            {hasHalfStar && <PiStarHalfFill className="h-6 w-6 text-yellow-500" />}
                            {[...Array(emptyStars)].map((_, i) => (
                                <PiStar key={i} className="h-6 w-6 text-yellow-500" />
                            ))}
                            <p className="pr-3">{rating}</p>
                        </div>
                    </div>
                </div>
                <div className="p-4">
                    <h3 className="text-lg font-bold mb-2">{destination.name}</h3>
                    <div className="flex items-center space-x-2 mb-2">
                        <FaMapMarkerAlt className="h-5 w-5 text-red-600" />
                        <span className="text-gray-600 text-xs">{destination.address}</span>
                    </div>
                    <p className="text-gray-600 text-sm mb-6 h-12 overflow-hidden">{destination.description}</p>
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-bold text-green-600">
                            {destination.is_free ? "Miễn phí" : "Có phí"}
                        </span>
                        <p className="italic">{formatReviewCount(destination.review_count)}</p>
                    </div>
                </div>
            </Link>
            <div

                onClick={async (e) => {
                    e.stopPropagation();
                    await toggleFavourite(destination, 'App\\Models\\CheckinPlace');
                }}
                className="absolute top-4 right-4 bg-white p-3 rounded-full cursor-pointer"
            >
                {isFavourited ? (
                    <FaHeart className="h-6 w-6 text-red-600" />
                ) : (
                    <IoMdHeartEmpty className="h-6 w-6" />
                )}
            </div>
        </div>
    );
});


const CuisineCard = memo(({ cuisine, favourites, toggleFavourite }) => {
    const isFavourited = favourites.some(fav =>
        fav.favouritable_id === cuisine.id
        &&
        fav.favouritable_type === 'App\\Models\\Cuisine'
    );

    return (
        <div className="relative bg-white shadow-lg rounded mb-4">
            <Link
                                        to={`/cuisine/${cuisine.id}`}
                className="block"
            >
                <div
                    className="bg-cover bg-center h-64 rounded-t"
                    style={{ backgroundImage: `url(${getImageUrl(cuisine.image)})` }}
                />
                <div className="p-4">
                    <h3 className="text-lg font-bold mb-2">{cuisine.name}</h3>
                    <div className="flex items-center space-x-2 mb-2">
                        <FaMapMarkerAlt className="h-5 w-5 text-red-600" />
                        <span className="text-gray-600 text-xs">{cuisine.address}</span>
                    </div>
                    <p className="text-gray-600 text-sm mb-6 h-12 overflow-hidden">{cuisine.short_description}</p>
                    <div className="flex justify-between items-center">
                        <span className="flex items-center text-lg text-black-600 tracking-widest">
                            <FaTag className="w-4 h-4 text-black-600 mr-1" />
                            {cuisine.price_formatted}
                        </span>
                    </div>
                </div>
            </Link>
            <div
                onClick={async (e) => {
                    e.stopPropagation();
                    await toggleFavourite(cuisine, 'App\\Models\\Cuisine');
                }}
                className="absolute top-4 right-4 bg-white p-3 rounded-full cursor-pointer"
            >
                {isFavourited ? (
                    <FaHeart className="h-6 w-6 text-red-600" />
                ) : (
                    <IoMdHeartEmpty className="h-6 w-6" />
                )}
            </div>
        </div>
    );
});

const HotelCard = memo(({ hotel, favourites, toggleFavourite }) => {
    const roomImage = hotel.images
        ? `${API_BASE_URL}storage/${hotel.images[0]}`
        : (hotel.rooms && hotel.rooms[0] && hotel.rooms[0].images && hotel.rooms[0].images[0]
            ? `${API_BASE_URL}${hotel.rooms[0].images[0]}`
            : "/img/default-hotel.jpg");
    const price = hotel.rooms.length !== 0 ? hotel.rooms[0].price_per_night : "Liên hệ";
    const isFavourited = favourites.some(fav => fav.favouritable_id === hotel.id && fav.favouritable_type === 'App\\Models\\Hotel');
    const truncateDescription = (description, maxLength = 100) => {
        if (description.length <= maxLength) return description;
        return description.substring(0, maxLength) + "...";
    };

    return (
        <div className="relative">
            <Link
                to={`/hotels/${hotel.id}`}
                className="bg-white shadow-lg rounded mb-4"
            >
                <div className="flex p-3 rounded-lg shadow-xl">
                    <div
                        className="bg-cover bg-center w-48 h-64 rounded-xl"
                        style={{ backgroundImage: `url(${roomImage})` }}
                    />
                    <div className="px-4 w-full">
                        <div className="bg-blue-400 text-white px-4 rounded text-lg w-fit my-2">{hotel.type}</div>
                        <h3 className="text-xl font-bold mb-2">{hotel.name}</h3>
                        <div className="flex items-center space-x-2 my-4">
                            <FaMapMarkerAlt className="h-5 w-5 text-red-600" />
                            <span className="text-gray-600">{hotel.address}</span>
                        </div>
                        <p className="text-black-600 text-sm h-12 overflow-hidden">
                            {hotel.description ? truncateDescription(hotel.description) : "Không có mô tả"}
                        </p>
                        <div className="flex items-center space-x-2 mb-3">
                            <p className="text-blue-500 font-bold text-sm">{price}</p>
                            <p className="text-gray-400 italic text-sm">/đêm</p>
                        </div>
                        <div className="flex items-center justify-between">
                            <p className="text-gray-400 text-sm italic">Đã bao gồm thuế và phí</p>
                            <button className="bg-blue-500 text-white px-4 py-2 rounded-xl">Xem chi tiết</button>
                        </div>
                    </div>
                </div>
            </Link>
            <div
                onClick={async (e) => {
                    e.stopPropagation();
                    await toggleFavourite(hotel, 'App\\Models\\Hotel');
                }}
                className="absolute top-4 right-4 bg-white p-3 rounded-full cursor-pointer"
            >
                {isFavourited ? (
                    <FaHeart className="h-6 w-6 text-red-600" />
                ) : (
                    <IoMdHeartEmpty className="h-6 w-6" />
                )}
            </div>
        </div>
    );

});

const MembershipCard = memo(({ title, description, icon: Icon, color, benefits, isPopular }) => (
    <div className={`bg-white shadow-lg rounded-2xl p-6 border-t-4 border-${color}-400 relative h-fit`}>
        {isPopular && (
            <div className={`absolute -top-1 right-0 p-1 bg-${color}-400 text-white rounded-bl-2xl rounded-tr-2xl`}>
                Phổ biến
            </div>
        )}
        <div className="flex items-center justify-between mb-4 mt-3">
            <h2 className={`text-xl font-bold text-${color}-500`}>{title}</h2>
            <div className={`bg-${color}-100 px-2 py-3 rounded-full`}>
                <Icon className={`h-5 w-5 text-${color}-500`} />
            </div>
        </div>
        <p>{description}</p>
        <div className="my-4">
            {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center space-x-2 mb-2">
                    <FaCheck className="text-green-500" />
                    <p className="text-sm text-gray-500">{benefit}</p>
                </div>
            ))}
        </div>
        <div className="flex justify-center">
            <button className={`bg-${color}-500 text-white px-6 py-2 rounded-3xl`}>
                {isPopular ? "Nâng cấp ngay" : "Tham gia ngay"}
            </button>
        </div>
    </div>
));

const formatReviewCount = (count) => {
    if (count >= 1000) {
        return (count / 1000).toFixed(count % 1000 === 0 ? 0 : 1) + "k";
    }
    return count;
};

const parseImages = (images) => {
        if (!images) return [];
        if (Array.isArray(images)) return images;
        try {
            return JSON.parse(images) || [];
        } catch (e) {
            console.error("Lỗi giải mã JSON images:", e);
            return [];
        }
    };

const HomePage = () => {
    const [data, setData] = useState({
        destinations: [],
        hotels: [],

        cuisines: [],
    });
    const [error, setError] = useState(null);
    const [favourites, setFavourites] = useState([]);
    const [favouritesLoaded, setFavouritesLoaded] = useState(false);
    const [loading, setLoading] = useState(true);


    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {

                const [destinationsRes, hotelsRes, cuisinesRes] = await Promise.all([
                    fetch("http://localhost:8000/api/checkin-places/popular").then(res => res.json()),
                    fetch("http://localhost:8000/api/hotels/popular").then(res => res.json()),
                    fetch("http://localhost:8000/api/cuisines/latest").then(res => res.json()),
                ]);


                try {
                    // Fetch favorites riêng biệt
                    let favData = [];
                    if (localStorage.getItem('token')) {
                        const favResponse = await favouriteService.getFavourites();
                        favData = favResponse.data || favResponse;
                    }

                    setFavourites(favData);
                    setFavouritesLoaded(true);

                } catch (err) {
                    console.error('Error fetching favourites:', err);
                }

                const parsedHotels = hotelsRes.data.map(hotel => ({
                    ...hotel,
                    images: parseImages(hotel.images),
                }));

                setData({
                    destinations: destinationsRes.success ? destinationsRes.data : [],
                    hotels: hotelsRes.success ? parsedHotels : [],
                    cuisines: cuisinesRes.success ? cuisinesRes.data : [],
                });

            } catch (err) {
                console.error(err);

                setData({ destinations: [], hotels: [], cuisines: [] });
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);


    // Hàm toggleFavourite sử dụng API từ favouriteService
    const toggleFavourite = async (item, type) => {
        try {
            const existing = favourites.find(fav =>
                fav.favouritable_id === item.id &&
                fav.favouritable_type === type
            );

            if (existing) {
                await favouriteService.deleteFavourite(existing.id);
                setFavourites(prev => prev.filter(fav => fav.id !== existing.id));
            } else {
                const response = await favouriteService.addFavourite(item.id, type);

                // Kiểm tra cấu trúc response
                const newFavourite = response.favourite || response.data;
                setFavourites(prev => [...prev, newFavourite]);
            }
        } catch (err) {
            console.error('Toggle favourite error:', err);
            setError('Failed to update favorite');
        }

    };

    const membershipPlans = [
        {
            title: "Người mới",
            description: "Dành cho người dùng mới bắt đầu hành trình khám phá",
            icon: FaUser,
            color: "gray",
            benefits: ["Được hỗ trợ 24/7"],
            isPopular: false,
        },
        {
            title: "Lữ khách",
            description: "Dành cho người dùng yêu thích khám phá",
            icon: FaCompass,
            color: "blue",
            benefits: ["Được hỗ trợ 24/7"],
            isPopular: true,
        },
        {
            title: "Du mục",
            description: "Dành cho người dùng đam mê du lịch",
            icon: PiTriangleFill,
            color: "orange",
            benefits: ["Được hỗ trợ 24/7", "Ưu đãi đặc biệt", "Hỗ trợ ưu tiên"],
            isPopular: false,
        },
    ];

    return (
        <div>
            <Header />
            <main className="mx-auto">
                <div className="bg-[url('/public/img/SliderHomePage.jpg')] bg-cover bg-center sm:h-[300px] md:h-[400px] lg:h-[500px] shadow-lg">
                    <div className="container mx-auto flex flex-col justify-center h-full px-4">
                        <h1 className="text-2xl sm:text-4xl lg:text-6xl font-bold text-white" style={{ textShadow: "1px 1px 2px rgba(0, 0, 0, 1)" }}>
                            Khám phá Việt Nam tuyệt vời
                        </h1>
                        <p className="text-sm sm:text-base lg:text-lg text-white mt-4 font-bold" style={{ textShadow: "1px 1px 2px rgba(0, 0, 0, 1)" }}>
                            Trải nghiệm những địa điểm tuyệt vời, ẩm thực đặc sắc và văn hóa độc đáo
                        </p>
                        <div className="w-full sm:w-fit bg-gray-400 bg-opacity-20 mt-6 p-4 sm:p-8 rounded-lg">
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-8">
                                <div className="space-y-3">
                                    <label htmlFor="destination" className="font-bold text-white">Điểm đến</label>
                                    <select
                                        name="destination"
                                        id="destination"
                                        className="w-full p-2 border border-gray-300 rounded"
                                    >
                                        <option value="default">Chọn điểm đến</option>
                                        <option value="1">Đà Nẵng</option>
                                        <option value="2">Hồ Chí Minh</option>
                                    </select>
                                </div>
                                <div className="space-y-3">
                                    <label htmlFor="startDate" className="font-bold text-white">Ngày khởi hành</label>
                                    <input
                                        type="date"
                                        name="startDate"
                                        id="startDate"
                                        className="w-full p-2 border border-gray-300 rounded"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label htmlFor="numDays" className="font-bold text-white">Số ngày</label>
                                    <input
                                        type="number"
                                        name="numDays"
                                        id="numDays"
                                        className="w-full p-2 border border-gray-300 rounded"
                                        placeholder="Nhập số ngày"
                                    />
                                </div>
                            </div>
                            <button className="w-full mt-6 px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition">
                                Bắt đầu khám phá
                            </button>
                        </div>
                    </div>
                </div>


                {/* Địa điểm du lịch */}

                <div className="container mx-auto mt-10">
                    <h1 className="text-3xl font-bold mb-3">Điểm đến du lịch phổ biến</h1>
                    <p className="text-lg mb-6">Khám phá những địa điểm du lịch nổi tiếng ở Việt Nam</p>
                    {loading ? (
                        <p className="text-gray-500">Đang tải...</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

                            {favouritesLoaded && data.destinations.map((destination) => (

                                <DestinationCard
                                    key={destination.id}
                                    destination={destination}
                                    favourites={favourites}
                                    toggleFavourite={toggleFavourite}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Ẩm thực đặc sản */}

                <div className="container mx-auto mt-10">
                    <div className="flex items-center justify-between">
                        <h1 className="text-3xl font-bold mb-3">Ẩm thực đặc sản</h1>
                        <a href="#" className="text-blue-600 flex items-center">
                            Xem tất cả <FaArrowRight className="ml-1 mt-1" />
                        </a>
                    </div>
                    <p className="text-lg mb-6">Cùng khám phá những món ăn đặc trưng tại các địa phương</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

                        {favouritesLoaded && data.cuisines.map((cuisine) => (
                            <CuisineCard
                                key={cuisine.id}
                                cuisine={cuisine}
                                favourites={favourites}
                                toggleFavourite={toggleFavourite}
                            />
                        ))}
                    </div>
                </div>
                {/* Khách sạn */}

                <div className="container mx-auto mt-10">
                    <div className="flex items-center justify-between">
                        <h1 className="text-3xl font-bold mb-3">Khách sạn</h1>
                        <a href="#" className="text-blue-600 flex items-center">
                            Xem tất cả <FaArrowRight className="ml-1 mt-1" />
                        </a>
                    </div>
                    <p className="text-lg mb-6">Khám phá những khách sạn nổi bật</p>
                    {loading ? (
                        <p className="text-gray-500">Đang tải...</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                            {favouritesLoaded && data.hotels.map((hotel) => (
                                <HotelCard
                                    key={hotel.id}
                                    hotel={hotel}
                                    favourites={favourites}
                                    toggleFavourite={toggleFavourite}
                                />

                            ))}
                        </div>
                    )}
                </div>

                {/* Thẻ thành viên */}

                <div className="container mx-auto mt-10 mb-10">
                    <div className="flex flex-col items-center">
                        <h1 className="text-3xl font-bold mb-1">Trở thành thành viên của IPSUM Travel</h1>
                        <p className="text-gray-500">Tham gia cộng đồng du lịch và nhận nhiều đặc quyền</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-6">
                        {membershipPlans.map((plan) => (
                            <MembershipCard key={plan.title} {...plan} />
                        ))}
                    </div>
                </div>

                {/* Kế hoạch chuyến đi */}

                <div className="w-full bg-sky-600 p-10">
                    <div className="flex flex-col items-center">
                        <h1 className="text-3xl text-white font-bold">Lên kế hoạch cho chuyến đi của bạn</h1>
                        <p className="text-white opacity-80 text-lg">Tạo lịch trình du lịch chi tiết</p>
                    </div>
                    <div className="container mx-auto mt-6 bg-white rounded-lg shadow-lg p-6">
                        <h2 className="text-2xl font-semibold text-gray-800">Tạo lịch trình</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
                            <div>
                                <label htmlFor="destination" className="block text-sm font-medium text-gray-700">Điểm đến</label>
                                <select id="destination" name="destination" className="w-full p-2 border border-gray-300 rounded">
                                    <option value="default">Chọn điểm đến</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="date" className="block text-sm font-medium text-gray-700">Ngày đi</label>
                                <input type="date" id="date" name="date" className="w-full p-2 border border-gray-300 rounded" />
                            </div>
                            <div>
                                <label htmlFor="number-date" className="block text-sm font-medium text-gray-700">Số ngày</label>
                                <input
                                    type="number"
                                    id="number-date"
                                    name="number-date"
                                    className="w-full p-2 border border-gray-300 rounded"
                                    placeholder="Nhập số ngày"
                                />
                            </div>
                            <div>
                                <label htmlFor="budget" className="block text-sm font-medium text-gray-700">Ngân sách</label>
                                <input
                                    type="number"
                                    id="budget"
                                    name="budget"
                                    className="w-full p-2 border border-gray-300 rounded"
                                    placeholder="Nhập ngân sách"
                                />
                            </div>
                        </div>
                        <div className="flex justify-center mt-6">
                            <button className="bg-sky-600 text-white px-6 py-2 rounded-3xl">Tạo lịch trình</button>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default HomePage;