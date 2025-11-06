"use client";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { restaurantAPI } from "../../../services/ui/Restaurant/restaurantService";

const RestaurantManagement = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [successMessage, setSuccessMessage] = useState(null);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRestaurants, setSelectedRestaurants] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  const fetchRestaurants = async (page = 1) => {
    try {
      setLoading(true);
      const response = await restaurantAPI.getAll({ page, per_page: 5 }); // <-- ở đây
      const data = response.data;
      setRestaurants(data.data);
      setCurrentPage(data.pagination.current_page);
      setLastPage(data.pagination.last_page);
    } catch (err) {
      console.error("Lỗi lấy nhà hàng:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await restaurantAPI.destroy(id);
      fetchRestaurants(currentPage);
    } catch (err) {
      console.error("Lỗi xóa:", err);
    }
  };

  const handleBulkDelete = async () => {
    try {
      await Promise.all(
        selectedRestaurants.map((id) => restaurantAPI.destroy(id))
      );
      setSelectedRestaurants([]);
      fetchRestaurants(currentPage);
    } catch (err) {
      console.error("Lỗi xóa nhiều:", err);
    }
  };

  const toggleSelect = (id) => {
    setSelectedRestaurants((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    const allIds = restaurants.map((res) => res.id);
    const isAllSelected = allIds.every((id) =>
      selectedRestaurants.includes(id)
    );
    setSelectedRestaurants(isAllSelected ? [] : allIds);
  };

  const handleSearch = async (query) => {
    setSearchQuery(query); // luôn cập nhật query trước

    if (!query.trim()) {
      fetchRestaurants(); // fallback nếu rỗng
      return;
    }

    try {
      setLoading(true);
      const response = await restaurantAPI.getAll({
        search: query,
        per_page: 5,
      });
      setRestaurants(response.data.data);

      // cập nhật lại phân trang nếu có
      setCurrentPage(response.data.pagination?.current_page || 1);
      setLastPage(response.data.pagination?.last_page || 1);
    } catch {
      setError("Không thể tìm kiếm.");
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= lastPage) {
      fetchRestaurants(page);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleSearch(searchQuery);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);
  useEffect(() => {
    if (location.state?.successMessage) {
      setSuccessMessage(location.state.successMessage);
      window.history.replaceState({}, document.title); // reset
      const timeoutId = setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
      return () => clearTimeout(timeoutId);
    }
  }, [location.state]);
  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-100 text-red-700 p-2 rounded">{error}</div>
      )}

      <div className="flex justify-between items-center">
        {/* <h1 className="text-xl font-bold">Quản lý Nhà hàng</h1> */}
      </div>

      <div className="flex flex-wrap justify-between items-center gap-4">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Tìm kiếm nhà hàng..."
            className="pl-10 pr-4 py-2 border rounded w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          {selectedRestaurants.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              <Trash2 className="w-4 h-4 inline-block mr-1" />
              Xóa {selectedRestaurants.length} mục
            </button>
          )}
          <button
            onClick={() => navigate("/Admin/AddRestaurant")}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            <Plus className="w-4 h-4 inline-block mr-1" />
            Thêm nhà hàng
          </button>
        </div>
      </div>
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded mb-4">
          {successMessage}
        </div>
      )}

      {/* Các phần UI còn lại */}
      <div className="bg-white shadow rounded overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3">
                <input
                  type="checkbox"
                  checked={
                    selectedRestaurants.length > 0 &&
                    restaurants.every((res) =>
                      selectedRestaurants.includes(res.id)
                    )
                  }
                  onChange={toggleSelectAll}
                />
              </th>
              <th className="p-3 text-left">Hình ảnh</th>
              <th className="p-3 text-left">Tên</th>
              <th className="p-3 text-left">Mô tả</th>
              <th className="p-3 text-left">Địa chỉ</th>
              <th className="p-3 text-left">Giá</th>
              <th className="p-3 text-left">Đánh giá</th>
              <th className="p-3 text-left">Ngày tạo</th>
              <th className="p-3 text-left">Hành động</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="9" className="p-6 text-center text-gray-500">
                  Đang tải dữ liệu...
                </td>
              </tr>
            ) : restaurants.length === 0 ? (
              <tr>
                <td colSpan="9" className="p-6 text-center text-gray-500">
                  Không có nhà hàng nào.
                </td>
              </tr>
            ) : (
              restaurants.map((res) => (
                <tr key={res.id} className="border-b">
                  <td className="p-3">
                    <input
                      type="checkbox"
                      checked={selectedRestaurants.includes(res.id)}
                      onChange={() => toggleSelect(res.id)}
                    />
                  </td>
                  <td className="p-3">
                    <img
                      src={`/${res.image}`}
                      alt={res.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                  </td>
                  <td className="p-3 font-semibold">{res.name}</td>
                  <td className="p-3 text-sm text-gray-600 max-w-[200px]">
                    <div className="line-clamp-2 overflow-hidden text-ellipsis">
                      {res.description}
                    </div>
                  </td>

                  <td className="p-3 text-sm">{res.address}</td>
                  <td className="p-3 text-sm">{res.price_range}</td>
                  <td className="p-3 text-sm">
                    {res.rating !== null && res.rating !== undefined
                      ? `${res.rating.toFixed(1)} ⭐`
                      : "Chưa có"}
                  </td>
                  <td className="p-3 text-sm">
                    {new Date(res.created_at).toLocaleDateString()}
                  </td>
                  <td className="p-3">
                    <div className="flex justify-center items-center gap-3">
                      <button
                        onClick={() =>
                          navigate(`/Admin/EditRestaurant/${res.id}`)
                        }
                        className="text-blue-500 hover:scale-110 transition"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(res.id)}
                        className="text-red-500 hover:scale-110 transition"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex justify-center items-center gap-2 p-4">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 border rounded"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          {Array.from({ length: lastPage }, (_, i) => i + 1)
            .filter((page) => {
              return (
                page === 1 ||
                page === lastPage ||
                (page >= currentPage - 2 && page <= currentPage + 2)
              );
            })
            .reduce((acc, page, idx, arr) => {
              // Thêm dấu "..." nếu không liên tiếp
              if (idx > 0 && page - arr[idx - 1] > 1) {
                acc.push("...");
              }
              acc.push(page);
              return acc;
            }, [])
            .map((item, i) =>
              item === "..." ? (
                <span key={`dots-${i}`} className="px-2 text-gray-500">
                  ...
                </span>
              ) : (
                <button
                  key={item}
                  onClick={() => handlePageChange(item)}
                  className={`px-3 py-1 border rounded ${
                    item === currentPage ? "bg-blue-500 text-white" : ""
                  }`}
                >
                  {item}
                </button>
              )
            )}

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === lastPage}
            className="px-3 py-1 border rounded"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default RestaurantManagement;
