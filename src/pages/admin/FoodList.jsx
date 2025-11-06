import React, { useState, useEffect } from "react";
import { FaSearch, FaCheckCircle, FaTimesCircle, FaTrash, FaEdit, FaPlus, FaFileImport, FaList } from "react-icons/fa";
import cuisineService from "../../services/cuisineService";
import { useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import api from "../../services/api";

// Cấu hình SweetAlert2 với CSS tùy chỉnh
const MySwal = withReactContent(Swal);

// Thêm CSS cho các nút SweetAlert2
const customSwalStyles = `
  .swal2-confirm {
    background-color: #3b82f6 !important;
    color: white !important;
  }
  .swal2-deny {
    background-color: #8b5cf6 !important;
    color: white !important;
  }
  .swal2-cancel {
    background-color: #6b7280 !important;
    color: white !important;
  }
`;

// Thêm CSS vào head
const style = document.createElement('style');
style.textContent = customSwalStyles;
document.head.appendChild(style);

const PAGE_SIZE = 10;

const FoodList = () => {
  const [foods, setFoods] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [meta, setMeta] = useState({});
  const [importMessage, setImportMessage] = useState('');
  const navigate = useNavigate();

  // Lấy dữ liệu từ API
  const fetchFoods = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await cuisineService.getAllCuisines({ per_page: PAGE_SIZE, page, search });
      // Lấy đúng dữ liệu từ response Laravel
      const items = res.data || [];
      const metaData = res.meta || {};
      setFoods(items);
      setTotal(metaData.total || items.length);
      setMeta(metaData);
      
      // Debug: Log ảnh của 3 món ăn đầu tiên
      const firstThree = items.slice(0, 3);
      console.log('=== DEBUG: Dữ liệu API ===');
      console.log('Response:', res);
      console.log('Items:', items);
      console.log('Meta:', metaData);
      firstThree.forEach((food, index) => {
        console.log(`Món ăn ${index + 1}:`, {
          name: food.name,
          image: food.image,
          hasImage: !!food.image,
          fullUrl: food.image?.startsWith('http') ? food.image : `http://localhost:8000${food.image}`
        });
      });
      
      // Nếu không còn dữ liệu ở trang hiện tại và page > 1, chuyển về trang 1
      if (items.length === 0 && page > 1) {
        setPage(1);
      }
    } catch (err) {
      setError("Không thể tải dữ liệu.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFoods();
    // eslint-disable-next-line
  }, [page, search]);

  // Chọn/xóa
  const toggleSelect = (id) => {
    setSelected(selected.includes(id) ? selected.filter(s => s !== id) : [...selected, id]);
  };
  const selectAll = () => {
    if (selected.length === foods.length) setSelected([]);
    else setSelected(foods.map(f => f.id));
  };

  // Xử lý xóa 1 món ăn
  const handleDelete = async (id) => {
    const result = await MySwal.fire({
      title: 'Bạn có chắc chắn muốn xóa?',
      text: 'Hành động này không thể hoàn tác!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy',
    });
    if (result.isConfirmed) {
      try {
        await cuisineService.deleteCuisine(id);
        fetchFoods();
        MySwal.fire('Đã xóa!', 'Món ăn đã được xóa thành công.', 'success');
      } catch (err) {
        MySwal.fire('Lỗi!', 'Xóa thất bại!', 'error');
      }
    }
  };

  // Xử lý xóa nhiều
  const handleDeleteSelected = async () => {
    if (selected.length === 0) return;
    if (!window.confirm("Bạn có chắc chắn muốn xóa các món đã chọn?")) return;
    try {
      await Promise.all(selected.map(id => cuisineService.deleteCuisine(id)));
      setSelected([]);
      fetchFoods();
      alert("Đã xóa các món đã chọn!");
    } catch (err) {
      alert("Xóa thất bại một số hoặc tất cả món!");
      fetchFoods();
    }
  };

  // Xử lý import từ file Excel
  const handleImportFoods = async (e) => {
    const file = e.target.files[0];
    if (!file) {
      setImportMessage('Vui lòng chọn file Excel');
      return;
    }

    // Hiển thị thông báo kiểm tra danh mục trước khi import
    const result = await MySwal.fire({
      title: 'Kiểm tra danh mục',
      text: 'Bạn phải import các danh mục còn thiếu trước khi import ẩm thực',
      icon: 'warning',
      showCancelButton: true,
      showDenyButton: true,
      confirmButtonText: 'Tiếp tục',
      denyButtonText: 'Chuyển hướng tới trang danh mục',
      cancelButtonText: 'Hủy',
      reverseButtons: true,
      customClass: {
        confirmButton: 'swal2-confirm',
        denyButton: 'swal2-deny',
        cancelButton: 'swal2-cancel'
      }
    });

    // Xử lý kết quả từ thông báo
    if (result.isDismissed || result.isDenied) {
      // Hủy hoặc chuyển hướng tới trang danh mục
      if (result.isDenied) {
        navigate("/admin/categories");
      }
      // Reset file input
      e.target.value = '';
      return;
    }

    // Nếu chọn "Tiếp tục", thực hiện import
    const formData = new FormData();
    formData.append('file', file);

    try {
      // Không set Content-Type header để browser tự động set boundary
      const response = await api.post('/cuisines/import', formData);
      
      console.log('Import response:', response);
      
      setImportMessage(response.message || 'Import thành công!');
      await fetchFoods(); // Refresh danh sách
      
      MySwal.fire({
        icon: 'success',
        title: 'Thành công!',
        text: response.message || 'Import dữ liệu ẩm thực thành công!',
        confirmButtonText: 'OK',
      });
      
      // Reset file input
      e.target.value = '';
      
    } catch (error) {
      console.error("Lỗi import món ăn:", error);
      
      const errorMsg = error.response?.data?.message || 'Lỗi khi import món ăn. Vui lòng kiểm tra dữ liệu trong file Excel.';
      setImportMessage(errorMsg);
      
      MySwal.fire({
        icon: 'error',
        title: 'Lỗi!',
        text: errorMsg,
        confirmButtonText: 'OK',
      });
    }
  };

  // Phân trang
  const totalPages = meta.last_page || Math.ceil(total / PAGE_SIZE);

  // Tạo mảng các trang cần hiển thị (tối đa 3 đầu, 1 cuối, ... nếu cần)
  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (page <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (page >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', page - 1, page, page + 1, '...', totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="bg-gray-100 min-h-screen p-4 md:p-6">
      {/* Thống kê tổng số món ăn */}
      <div className="flex items-center mb-6">
        <div className="bg-white rounded shadow p-4 w-full md:w-64">
          <div className="text-gray-600 text-sm mb-1">Tổng số món ăn</div>
          <div className="text-3xl font-bold text-black">{total}</div>
        </div>
      </div>

      {/* Thông báo import */}
      {importMessage && (
        <div className={`mb-4 p-4 rounded-lg ${
          importMessage.includes('thành công') 
            ? 'bg-green-100 text-green-700 border border-green-200' 
            : 'bg-red-100 text-red-700 border border-red-200'
        }`}>
          {importMessage}
        </div>
      )}

      {/* Thanh tìm kiếm và nút */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-2 md:gap-0">
        <div className="w-full md:w-1/3">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
            <input
              type="text"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Tìm món ăn (tên hoặc mô tả)"
              className="w-full pl-10 pr-4 py-2 rounded bg-white border border-gray-200 focus:outline-none text-gray-700 text-base shadow"
            />
          </div>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button onClick={handleDeleteSelected} className="flex items-center px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded shadow w-full md:w-auto">
            <FaTrash className="mr-2" /> Chọn xóa
          </button>
          <label className="flex items-center px-5 py-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded shadow w-full md:w-auto cursor-pointer">
            <FaFileImport className="mr-2" /> Import Excel
            <input type="file" accept=".xlsx,.xls" onChange={handleImportFoods} className="hidden" />
          </label>
          <button onClick={() => navigate("/admin/categories")} 
            className="flex items-center px-5 py-2 bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded shadow w-full md:w-auto">
            <FaList className="mr-2" /> Danh mục
          </button>
          <button onClick={() => navigate("/admin/foods/create")}
            className="flex items-center px-5 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded shadow w-full md:w-auto">
            <FaPlus className="mr-2" /> Thêm món ăn
          </button>
        </div>
      </div>

      {/* Bảng danh sách món ăn */}
      <div className="bg-white rounded shadow overflow-x-auto">
        {loading ? (
          <div className="text-center py-8">Đang tải dữ liệu...</div>
        ) : error ? (
          <div className="text-center text-red-500 py-8">{error}</div>
        ) : (
          <table className="min-w-full text-xs md:text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-700">
                <th className="p-3"><input type="checkbox" checked={selected.length === foods.length && foods.length > 0} onChange={selectAll} /></th>
                <th className="p-3 text-left">Món ăn</th>
                <th className="p-3 text-left">Mô tả ngắn</th>
                <th className="p-3 text-left">Địa chỉ</th>
                <th className="p-3 text-right">Giá(VND)</th>
                <th className="p-3 text-center">Vùng miền</th>
                <th className="p-3 text-center">Trạng thái</th>
                <th className="p-3 text-center">Giao hàng</th>
                <th className="p-3 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {foods.map((food, idx) => (
                <tr key={food.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="p-3 text-center"><input type="checkbox" checked={selected.includes(food.id)} onChange={() => toggleSelect(food.id)} /></td>
                  <td className="p-3 flex items-center gap-2">
                    <img 
                      src={
                        food.image && food.image.trim() !== ''
                          ? food.image.startsWith('http')
                            ? food.image
                            : `http://localhost:8000/${food.image}`
                          : "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=80&h=80&q=80"
                      } 
                      alt={food.name} 
                      className="w-10 h-10 rounded-full object-cover border" 
                      onError={(e) => {
                        console.error('Lỗi load ảnh:', e.target.src, 'Food:', food.name, 'Image field:', food.image);
                        e.target.src = "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=80&h=80&q=80";
                        e.target.style.border = '2px solid red';
                      }}
                      onLoad={(e) => {
                        console.log('Load ảnh thành công:', e.target.src);
                        e.target.style.border = '2px solid green';
                      }}
                    />
                    <div>
                      <div className="font-bold text-gray-800">{food.name}</div>
                      <div className="text-xs text-gray-500">{food.category?.name || ""}</div>
                    </div>
                  </td>
                  <td className="p-3 text-gray-700">{food.short_description}</td>
                  <td className="p-3 text-gray-700">{food.address}</td>
                  <td className="p-3 text-right text-gray-800 font-semibold">{food.price?.toLocaleString() || ""}</td>
                  <td className="p-3 text-center text-gray-700">{food.region}</td>
                  <td className="p-3 text-center">
                    <span className={food.status === "available" ? "text-green-600" : "text-red-500"}>{food.status === "available" ? "Có sẵn" : "Không có sẵn"}</span>
                  </td>
                  <td className="p-3 text-center">
                    {food.delivery ? <FaCheckCircle className="text-green-500 text-lg mx-auto" /> : <FaTimesCircle className="text-red-400 text-lg mx-auto" />}
                  </td>
                  <td className="p-3 text-center flex gap-2 justify-center">
                    <button className="text-blue-500 hover:text-blue-700" onClick={() => navigate(`/admin/foods/${food.id}/edit`)}><FaEdit /></button>
                    <button className="text-red-500 hover:text-red-700" onClick={() => handleDelete(food.id)}><FaTrash /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Phân trang */}
      {totalPages > 1 ? (
        <div className="flex justify-center mt-4 gap-2 items-center select-none">
          <button
            className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >&lt;</button>
          {getPageNumbers().map((i, idx) =>
            i === '...'
              ? <span key={"ellipsis-"+idx} className="px-2">...</span>
              : <button
                  key={i}
                  className={`px-3 py-1 rounded ${page === i ? "bg-blue-500 text-white font-bold" : "bg-gray-200 hover:bg-gray-300"}`}
                  onClick={() => setPage(i)}
                  disabled={page === i}
                >{i}</button>
          )}
          <button
            className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
          >&gt;</button>
          <button
            className="px-4 py-1 rounded bg-gray-200 hover:bg-gray-300 font-semibold"
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
          >Tiếp</button>
        </div>
      ) : (
        <div className="flex justify-center mt-4 gap-2">
          <button className="px-3 py-1 rounded bg-blue-500 text-white font-bold" disabled>1</button>
        </div>
      )}
    </div>
  );
};

export default FoodList; 