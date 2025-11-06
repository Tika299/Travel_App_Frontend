import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaHeart, FaMapMarkerAlt, FaTrashAlt, FaBed } from "react-icons/fa";
import { PiForkKnife } from "react-icons/pi";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import Pagination from "../../components/Pagination";
import { favouriteService } from "../../services/ui/favouriteService.js";

// Function để xử lý URL ảnh (hỗ trợ cả Google Drive và local storage)
const getImageUrl = (imagePath, fallbackUrl = "/img/default.jpg") => {
  if (!imagePath || imagePath.trim() === '') {
    return fallbackUrl;
  }
  
  // Nếu là URL đầy đủ (Google Drive, external URL)
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  // Xử lý đường dẫn local storage
  const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
  return `http://localhost:8000/${cleanPath}`;
};

const FavouritePage = () => {
    const [favourites, setFavourites] = useState([]);
    const [favouritesCache, setFavouritesCache] = useState({});
    const [categoryCounts, setCategoryCounts] = useState({
        all: 0,
        cuisine: 0,
        checkin_place: 0,
        hotel: 0,
    });
    const [selectedItems, setSelectedItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [filter, setFilter] = useState("all");
    const itemsPerPage = 10;

    // Fetch category counts
    useEffect(() => {
        const fetchCategoryCounts = async () => {
            try {
                const response = await favouriteService.getCategoryCounts();
                setCategoryCounts(response);
            } catch (error) {
                console.error("Error fetching category counts:", error);
            }
        };
        fetchCategoryCounts();
    }, []);

    // Fetch favourites with pagination and filter
    useEffect(() => {
        const fetchFavourites = async () => {
            const cacheKey = `${currentPage}-${filter}`;
            if (favouritesCache[cacheKey]) {
                setFavourites(favouritesCache[cacheKey]);
                return;
            }

            try {
                setLoading(true);
                const response = await favouriteService.getFavourites({
                    page: currentPage,
                    per_page: itemsPerPage,
                    type: filter !== "all" ? filter : undefined,
                });
                setFavourites(response.data);
                setTotalPages(Math.ceil(response.total / itemsPerPage));

                // Update cache
                setFavouritesCache((prev) => ({
                    ...prev,
                    [cacheKey]: response.data,
                }));
            } catch (error) {
                console.error("Error fetching favourites:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchFavourites();
    }, [currentPage, filter, favouritesCache]);

    // Clear cache when filter changes
    useEffect(() => {
        setFavouritesCache({});
    }, [filter]);

    // Handle individual checkbox toggle
    const handleCheckboxChange = (id) => {
        setSelectedItems((prev) =>
            prev.includes(id)
                ? prev.filter((itemId) => itemId !== id)
                : [...prev, id]
        );
    };

    // Handle select all checkbox
    const handleSelectAll = () => {
        if (selectedItems.length === favourites.length) {
            setSelectedItems([]);
        } else {
            setSelectedItems(favourites.map((fav) => fav.id));
        }
    };

    // Handle delete selected items
    const handleDeleteSelected = async () => {
        try {
            for (const id of selectedItems) {
                await favouriteService.deleteFavourite(id);
            }
            setFavourites((prev) =>
                prev.filter((fav) => !selectedItems.includes(fav.id))
            );
            setSelectedItems([]);
            // Refetch to update pagination and counts
            const response = await favouriteService.getFavourites({
                page: currentPage,
                per_page: itemsPerPage,
                type: filter !== "all" ? filter : undefined,
            });
            setFavourites(response.data);
            setTotalPages(Math.ceil(response.total / itemsPerPage));
            // Update category counts
            const counts = await favouriteService.getCategoryCounts();
            setCategoryCounts(counts);
            alert("Selected favourites deleted successfully");
        } catch (error) {
            console.error("Error deleting favourites:", error);
            alert("Failed to delete selected favourites");
        }
    };

    // Handle page change
    const handlePageChange = (page) => {
        setCurrentPage(page);
        setSelectedItems([]);
    };

    // Handle filter change
    const handleFilterChange = (newFilter) => {
        setFilter(newFilter);
        setCurrentPage(1);
        setSelectedItems([]);
    };

    // Determine detail page URL based on favouritable_type
    const getDetailPath = (fav) => {
        const typeMap = {
            "App\\Models\\CheckinPlace": "/checkin-places",
            "App\\Models\\Hotel": "/hotels",
            "App\\Models\\Cuisine": "/cuisine",
        };
        return `${typeMap[fav.favouritable_type]}/${fav.favouritable_id}`;
    };

    return (
        <div>
            <Header />
            <main>
                <div className="container mx-auto py-8">
                    <h1 className="text-5xl font-medium mb-4">Danh sách yêu thích</h1>
                    <p className="text-lg">Quản lý toàn bộ những địa điểm, trải nghiệm và đặc sản mà bạn đã thích</p>
                    <div className="w-full mt-8 bg-white shadow-xl rounded-lg p-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => handleFilterChange("all")}
                                className={`flex items-center space-x-4 p-3 rounded-lg ${
                                    filter === "all" ? "text-white bg-sky-600" : "text-black bg-gray-300 hover:text-red-400"
                                }`}
                            >
                                <FaHeart className="text-2xl" />
                                <p>Tất cả ({categoryCounts.all})</p>
                            </button>
                            <button
                                onClick={() => handleFilterChange("cuisine")}
                                className={`flex items-center space-x-4 p-3 rounded-lg ${
                                    filter === "cuisine" ? "text-white bg-sky-600" : "text-black bg-gray-300 hover:text-red-400"
                                }`}
                            >
                                <PiForkKnife className="text-2xl" />
                                <p>Đặc sản ({categoryCounts.cuisine})</p>
                            </button>
                            <button
                                onClick={() => handleFilterChange("checkin_place")}
                                className={`flex items-center space-x-4 p-3 rounded-lg ${
                                    filter === "checkin_place" ? "text-white bg-sky-600" : "text-black bg-gray-300 hover:text-red-400"
                                }`}
                            >
                                <FaMapMarkerAlt className="text-2xl" />
                                <p>Địa điểm ({categoryCounts.checkin_place})</p>
                            </button>
                            <button
                                onClick={() => handleFilterChange("hotel")}
                                className={`flex items-center space-x-4 p-3 rounded-lg ${
                                    filter === "hotel" ? "text-white bg-sky-600" : "text-black bg-gray-300 hover:text-red-400"
                                }`}
                            >
                                <FaBed className="text-2xl" />
                                <p>Khách sạn ({categoryCounts.hotel})</p>
                            </button>
                        </div>
                        <div className="flex items-center space-x-4">
                            <input
                                type="checkbox"
                                checked={selectedItems.length === favourites.length && favourites.length > 0}
                                onChange={handleSelectAll}
                                className="w-4 h-4"
                            />
                            <span className="text-sm">Chọn tất cả</span>
                            <select name="sort" className="border border-gray-300 rounded-lg p-3 text-black focus:outline-none focus:ring-2">
                                <option value="default">Mới nhất</option>
                                <option value="oldest">Cũ nhất</option>
                            </select>
                            <button
                                onClick={handleDeleteSelected}
                                disabled={selectedItems.length === 0}
                                className={`flex items-center space-x-4 p-3 rounded-lg ${
                                    selectedItems.length === 0
                                        ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                                        : "bg-red-200 text-red-600 hover:text-red-400"
                                }`}
                            >
                                <FaTrashAlt className="text-2xl" />
                                <p>Xóa đã chọn ({selectedItems.length})</p>
                            </button>
                        </div>
                    </div>
                    {loading ? (
                        <div className="flex justify-center items-center py-20">
                            <p className="text-lg text-gray-500 animate-pulse">Đang tải dữ liệu...</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-10">
                            {favourites.map((fav) => (
                                <div key={fav.id} className="relative bg-white rounded-xl shadow-md overflow-hidden">
                                    <label className="absolute top-3 right-3 z-10 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="w-4 h-4"
                                            checked={selectedItems.includes(fav.id)}
                                            onChange={() => handleCheckboxChange(fav.id)}
                                            aria-label={`Chọn ${fav.favouritable?.name || "mục yêu thích"}`}
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                    </label>
                                    <Link to={getDetailPath(fav)} className="block hover:opacity-90 transition-all">
                                        <img
                                            src={getImageUrl(fav.favouritable?.image_path || fav.favouritable?.image)}
                                            onError={(e) => {
                                                console.error('❌ Lỗi load ảnh yêu thích:', e.target.src, 'Item:', fav.favouritable?.name, 'Image:', fav.favouritable?.image_path || fav.favouritable?.image);
                                                e.target.onerror = null;
                                                e.target.src = "/img/default.jpg";
                                            }}
                                            onLoad={(e) => {
                                                console.log('✅ Load ảnh yêu thích thành công:', e.target.src, 'Item:', fav.favouritable?.name);
                                            }}
                                            alt={fav.favouritable?.name || "Ảnh yêu thích"}
                                            className="w-full h-56 object-cover"
                                        />
                                        <div className="p-6">
                                            <h2 className="text-xl font-semibold mb-2">
                                                {fav.favouritable?.name || "Không rõ"}
                                            </h2>
                                            <div className="flex items-center space-x-2 my-3">
                                                <FaMapMarkerAlt className="h-5 w-5 text-red-600" />
                                                <span className="text-gray-600 text-xs">
                                                    {fav.favouritable?.address || ""}
                                                </span>
                                            </div>
                                            <p className="text-sm h-12 overflow-hidden">
                                                {fav.favouritable?.description || ""}
                                            </p>
                                            <div className="flex items-center justify-end">
                                                <p className="text-gray-500 text-xs">
                                                    {new Date(fav.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    </Link>
                                </div>
                            ))}
                        </div>
                    )}
                    {!loading && favourites.length === 0 && (
                        <div className="text-center mt-10 text-gray-500">
                            Bạn chưa có mục yêu thích nào trong danh sách này.
                        </div>
                    )}
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                    />
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default FavouritePage;