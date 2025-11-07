import { useState, useEffect, memo } from "react";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import Pagination from "../../../components/Pagination";
import { Link } from "react-router-dom";
import { FaMapMarkerAlt, FaHeart } from "react-icons/fa";
import { IoMdHeartEmpty } from "react-icons/io";
import { favouriteService } from "../../../services/ui/favouriteService";

const HotelCard = memo(({ hotel, favourites, toggleFavourite }) => {
    const API_BASE_URL = 'https://travel-app-api-ws77.onrender.com/';
    const roomImage = hotel.images
        ? `${API_BASE_URL}storage/${hotel.images[0]}`
        : (hotel.rooms && hotel.rooms[0] && hotel.rooms[0].images && hotel.rooms[0].images[0]
            ? `${API_BASE_URL}${hotel.rooms[0].images[0]}`
            : "/img/default-hotel.jpg");
    const price = hotel.rooms.length !== 0 ? hotel.rooms[0].price_per_night : "Liên hệ";
    const isFavourited = favourites.some(
        (fav) =>
            fav.favouritable_id === hotel.id && fav.favouritable_type === "App\\Models\\Hotel"
    );
    const truncateDescription = (description, maxLength = 100) => {
        if (description.length <= maxLength) return description;
        return description.substring(0, maxLength) + "...";
    };

    return (
        <div className="relative">
            <Link to={`/hotels/${hotel.id}`} className="bg-white shadow-lg rounded mb-4">
                <div className="flex p-3 rounded-lg shadow-xl">
                    <div
                        className="bg-cover bg-center w-48 h-64 rounded-xl"
                        style={{ backgroundImage: `url(${roomImage})` }}
                    />
                    <div className="px-4 w-full">
                        <div className="bg-blue-400 text-white px-4 rounded text-lg w-fit my-2">
                            {hotel.type}
                        </div>
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
                            <p className="text-gray-400 text-sm italic">
                                Đã bao gồm thuế và phí
                            </p>
                            <button className="bg-blue-500 text-white px-4 py-2 rounded-xl">
                                Xem chi tiết
                            </button>
                        </div>
                    </div>
                </div>
            </Link>
            <div
                onClick={async (e) => {
                    e.stopPropagation();
                    await toggleFavourite(hotel, "App\\Models\\Hotel");
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

function HotelPage() {
    const [favourites, setFavourites] = useState([]);
    const [favouritesLoaded, setFavouritesLoaded] = useState(false);
    const [loading, setLoading] = useState(false);
    const [hotels, setHotels] = useState([]);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({
        hotels: { currentPage: 1, totalPages: 1 },
    });

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

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Lấy danh sách khách sạn từ API với phân trang
                const res = await fetch(`https://travel-app-api-ws77.onrender.com/api/hotels?page=${pagination.hotels.currentPage}`);
                const data = await res.json();

                if (!data.success) {
                    throw new Error(data.message || "Lỗi khi lấy dữ liệu khách sạn");
                }
                const parsedHotels = data.data.map(hotel => ({
                    ...hotel,
                    images: parseImages(hotel.images),
                }));
                setHotels(parsedHotels || []);
                setPagination({
                    hotels: {
                        currentPage: data.current_page || 1,
                        totalPages: data.last_page || 1,
                    },
                });

                // Lấy danh sách yêu thích
                try {
                    let favData = [];
                    if (localStorage.getItem("token")) {
                        const favResponse = await favouriteService.getFavourites();
                        favData = favResponse.data || favResponse;
                    }
                    setFavourites(favData);
                    setFavouritesLoaded(true);
                } catch (err) {
                    console.error("Lỗi khi lấy danh sách yêu thích:", err);
                }
            } catch (error) {
                console.error("Lỗi khi lấy dữ liệu:", error);
                setError(error.message || "Lỗi khi lấy dữ liệu khách sạn");
                setHotels([]);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [pagination.hotels.currentPage]);

    const toggleFavourite = async (item, type) => {
        try {
            const existing = favourites.find(
                (fav) => fav.favouritable_id === item.id && fav.favouritable_type === type
            );

            if (existing) {
                await favouriteService.deleteFavourite(existing.id);
                setFavourites((prev) => prev.filter((fav) => fav.id !== existing.id));
            } else {
                const response = await favouriteService.addFavourite(item.id, type);
                const newFavourite = response.favourite || response.data;
                setFavourites((prev) => [...prev, newFavourite]);
            }
        } catch (err) {
            console.error("Lỗi khi cập nhật yêu thích:", err);
            setError("Không thể cập nhật danh sách yêu thích");
        }
    };

    const handlePageChange = (section, page) => {
        setPagination((prev) => ({
            ...prev,
            [section]: { ...prev[section], currentPage: page },
        }));
    };

    return (
        <div>
            <Header />
            <div className="container mx-auto p-4">
                <h1 className="text-2xl font-bold mb-4">Tất cả khách sạn</h1>
                {error && <p className="text-red-500 mb-4">{error}</p>}
                {loading ? (
                    <p className="text-gray-500">Đang tải...</p>
                ) : hotels.length === 0 ? (
                    <p className="text-gray-500">Không có khách sạn nào để hiển thị</p>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                            {favouritesLoaded &&
                                hotels.map((hotel) => (
                                    <HotelCard
                                        key={hotel.id}
                                        hotel={hotel}
                                        favourites={favourites}
                                        toggleFavourite={toggleFavourite}
                                    />
                                ))}
                        </div>
                        <Pagination
                            currentPage={pagination.hotels.currentPage}
                            totalPages={pagination.hotels.totalPages}
                            onPageChange={(page) => handlePageChange("hotels", page)}
                        />
                    </>
                )}
            </div>
            <Footer />
        </div>
    );
}

export default HotelPage;