import React, { useState, useEffect } from "react";
import { FaEdit, FaTrash, FaPlus, FaSearch, FaUtensils, FaFileImport } from "react-icons/fa";
import categoryService from "../../services/categoryService";
import { getImageUrl } from "../../lib/utils";
import ReactLogo from "../../assets/react.svg";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
const MySwal = withReactContent(Swal);

const CategoryList = () => {
  const [categories, setCategories] = useState([]);
  const [selected, setSelected] = useState([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", icon: "", type: "" });
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showEmoji, setShowEmoji] = useState(false);
  const [uploadedIcon, setUploadedIcon] = useState(null);
  const [importMessage, setImportMessage] = useState('');

  // Fetch categories from API
  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('🔧 Fetching categories...');
      const res = await categoryService.getCategoriesWithCuisinesCount();
      console.log('🔧 Categories response:', res);
      
             // Chuẩn hóa dữ liệu (cuisines_count -> cuisineCount)
       const normalizedCategories = (res.data || []).map((c) => ({
         ...c,
         cuisineCount: c.cuisines_count ?? 0,
       }));
       
       console.log('🔧 Normalized categories:', normalizedCategories);
       
       // Tìm category ID 2 để debug
       const category2 = normalizedCategories.find(c => c.id === 2);
       if (category2) {
         console.log('🔧 Category ID 2 in response:', category2);
         console.log('🔧 Category ID 2 icon path:', category2.icon);
       }
       
       setCategories(normalizedCategories);
    } catch (err) {
      console.error('🔧 Error fetching categories:', err);
      setError("Không thể tải danh mục.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Theo dõi thay đổi của form.icon để cập nhật uploadedIcon
  useEffect(() => {
    console.log('🔧 form.icon changed:', form.icon);
    console.log('🔧 form.icon type:', typeof form.icon);
    console.log('🔧 form.icon instanceof File:', form.icon instanceof File);
    
    if (form.icon instanceof File) {
      const objectUrl = URL.createObjectURL(form.icon);
      console.log('🔧 Creating new object URL for File:', objectUrl);
      setUploadedIcon(objectUrl);
    } else if (typeof form.icon === 'string' && form.icon) {
      const iconUrl = getImageUrl(form.icon);
      console.log('🔧 Creating URL for string path:', iconUrl);
      setUploadedIcon(iconUrl);
    } else {
      console.log('🔧 No icon, setting uploadedIcon to null');
      setUploadedIcon(null);
    }
  }, [form.icon]);

  // Lọc theo search
  const filtered = categories.filter(
    (cat) =>
      cat.name.toLowerCase().includes(search.toLowerCase()) ||
      cat.type.toLowerCase().includes(search.toLowerCase())
  );

  // Chọn/xóa nhiều
  const toggleSelect = (id) => {
    setSelected(
      selected.includes(id)
        ? selected.filter((s) => s !== id)
        : [...selected, id]
    );
  };
  const selectAll = () => {
    if (selected.length === filtered.length) setSelected([]);
    else setSelected(filtered.map((c) => c.id));
  };
  const handleDeleteSelected = async () => {
    if (selected.length === 0) return;
    const result = await MySwal.fire({
      title: "Bạn có chắc chắn muốn xóa?",
      text: "Hành động này không thể hoàn tác!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
    });
    if (!result.isConfirmed) return;
    try {
      await Promise.all(
        selected.map(async (id) => {
          try {
            await categoryService.deleteCategory(id);
          } catch (err) {
            MySwal.fire({
              icon: "error",
              title: "Lỗi",
              text:
                err?.response?.data?.message ||
                "Xóa thất bại một số hoặc tất cả danh mục!",
            });
          }
        })
      );
      setSelected([]);
      fetchCategories();
      MySwal.fire({
        icon: "success",
        title: "Thành công",
        text: "Xóa danh mục thành công!",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err) {
      MySwal.fire({
        icon: "error",
        title: "Lỗi",
        text:
          err?.response?.data?.message ||
          "Xóa thất bại một số hoặc tất cả danh mục!",
      });
      fetchCategories();
    }
  };
  // Xử lý xóa 1
  const handleDelete = async (id) => {
    const result = await MySwal.fire({
      title: "Bạn có chắc chắn muốn xóa danh mục này?",
      text: "Hành động này không thể hoàn tác!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
    });
    if (!result.isConfirmed) return;
    try {
      await categoryService.deleteCategory(id);
      setSelected(selected.filter((s) => s !== id));
      fetchCategories();
      MySwal.fire({
        icon: "success",
        title: "Thành công",
        text: "Xóa danh mục thành công!",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err) {
      MySwal.fire({
        icon: "error",
        title: "Lỗi",
        text: "Không thể xóa danh mục này!",
      });
    }
  };

  // Xử lý form
  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    console.log('🔧 Submit form - editId:', editId, 'form:', form);
    
    if (
      !form.name.trim() ||
      !form.type.trim()
    ) {
      return alert("Vui lòng nhập đủ thông tin!");
    }
    
    // Kiểm tra icon chỉ khi tạo mới
    if (!editId && (!form.icon || (typeof form.icon === "string" && !form.icon.trim()))) {
      return alert("Vui lòng chọn ảnh cho danh mục!");
    }
    
    try {
      // Chuẩn bị dữ liệu để gửi
      const submitData = {
        name: form.name.trim(),
        type: form.type.trim()
      };
      
             // Nếu có upload ảnh mới (File object) thì thêm vào
       console.log('🔧 Checking form.icon type:', typeof form.icon);
       console.log('🔧 form.icon instanceof File:', form.icon instanceof File);
       console.log('🔧 form.icon value:', form.icon);
       console.log('🔧 form.icon constructor:', form.icon?.constructor?.name);
       console.log('🔧 form.icon name:', form.icon?.name);
       console.log('🔧 form.icon type:', form.icon?.type);
       console.log('🔧 form.icon size:', form.icon?.size);
      
      if (form.icon instanceof File) {
        submitData.icon = form.icon;
        console.log('🔧 Sending new image file:', form.icon.name);
      } else if (editId && form.icon && typeof form.icon === 'string') {
        // Nếu edit và có đường dẫn ảnh cũ, không gửi icon (backend sẽ giữ nguyên)
        console.log('🔧 Keeping existing image:', form.icon);
        // KHÔNG thêm icon vào submitData để backend giữ nguyên
      } else if (!editId) {
        // Nếu tạo mới và không có ảnh
        console.log('🔧 No image provided for new category');
      } else {
        console.log('🔧 Unknown case - form.icon:', form.icon);
      }
      
      if (editId) {
        console.log('🔧 Updating category with data:', submitData);
        console.log('🔧 submitData.icon type:', typeof submitData.icon);
        console.log('🔧 submitData.icon instanceof File:', submitData.icon instanceof File);
        console.log('🔧 submitData keys:', Object.keys(submitData));
        const result = await categoryService.updateCategory(editId, submitData);
        console.log('🔧 Update result:', result);
      } else {
        console.log('🔧 Creating category with data:', submitData);
        const result = await categoryService.createCategory(submitData);
        console.log('🔧 Create result:', result);
      }
      MySwal.fire({
        icon: "success",
        title: "Thành công",
        text: editId
          ? "Cập nhật danh mục thành công!"
          : "Thêm danh mục thành công!",
        timer: 1500,
        showConfirmButton: false,
      });
             // Reset form và states
       setForm({ name: "", icon: "", type: "" });
       setUploadedIcon(null);
       setShowForm(false);
       setEditId(null);
       // Reset file input
       const fileInput = document.getElementById('icon-upload');
       if (fileInput) {
         fileInput.value = '';
       }
      
      // Refresh danh sách để lấy dữ liệu mới
      console.log('🔧 Refreshing categories list...');
      await fetchCategories();
      console.log('🔧 Categories list refreshed');
    } catch (err) {
      console.error('🔧 Error submitting form:', err);
      MySwal.fire({
        icon: "error",
        title: "Lỗi",
        text: "Lưu thất bại!",
      });
    }
  };

  const handleEdit = (cat) => {
    console.log('🔧 Edit category:', cat.name, 'Icon:', cat.icon);
    const formData = { name: cat.name, icon: cat.icon, type: cat.type };
    console.log('🔧 Setting form data:', formData);
    setForm(formData);
    setShowForm(true);
    setEditId(cat.id);
    // Không set uploadedIcon ở đây, để useEffect xử lý
  };
  const handleCancelForm = () => {
    console.log('🔧 Cancel form - resetting states');
    setForm({ name: "", icon: "", type: "" });
    setUploadedIcon(null);
    setShowForm(false);
    setEditId(null);
    // Reset file input
    const fileInput = document.getElementById('icon-upload');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  // Xử lý import từ file Excel
  const handleImportCategories = async (e) => {
    const file = e.target.files[0];
    if (!file) {
      setImportMessage('Vui lòng chọn file Excel');
      return;
    }

    try {
      const response = await categoryService.importCategories(file);
      
      console.log('Import response:', response);
      
      setImportMessage(response.message || 'Import thành công!');
      await fetchCategories(); // Refresh danh sách
      
      MySwal.fire({
        icon: 'success',
        title: 'Thành công!',
        text: response.message || 'Import dữ liệu danh mục thành công!',
        confirmButtonText: 'OK',
      });
      
      // Reset file input
      e.target.value = '';
      
    } catch (error) {
      console.error("Lỗi import danh mục:", error);
      
      const errorMsg = error.response?.data?.message || 'Lỗi khi import danh mục. Vui lòng kiểm tra dữ liệu trong file Excel.';
      setImportMessage(errorMsg);
      
      MySwal.fire({
        icon: 'error',
        title: 'Lỗi!',
        text: errorMsg,
        confirmButtonText: 'OK',
      });
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen p-4 md:p-6">
      {/* Loading/Error */}
      {loading && (
        <div className="text-center py-8 text-gray-500">
          Đang tải dữ liệu...
        </div>
      )}
      {error && <div className="text-center py-8 text-red-500">{error}</div>}
      {/* Thống kê tổng số danh mục */}
      <div className="flex items-center mb-6">
        <div className="bg-white rounded shadow p-4 w-full md:w-64">
          <div className="text-gray-600 text-sm mb-1">Tổng số danh mục</div>
          <div className="text-3xl font-bold text-black">
            {categories.length}
          </div>
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
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm danh mục (tên hoặc loại)"
              className="w-full pl-10 pr-4 py-2 rounded bg-white border border-gray-200 focus:outline-none text-gray-700 text-base shadow"
            />
          </div>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={handleDeleteSelected}
            className="flex items-center px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded shadow w-full md:w-auto"
          >
            <FaTrash className="mr-2" /> Chọn xóa
          </button>
          <label className="flex items-center px-5 py-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded shadow w-full md:w-auto cursor-pointer">
            <FaFileImport className="mr-2" /> Import Excel
            <input type="file" accept=".xlsx,.xls" onChange={handleImportCategories} className="hidden" />
          </label>
          <button
            className="flex items-center px-5 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded shadow w-full md:w-auto"
            onClick={() => setShowForm(true)}
          >
            <FaPlus className="mr-2" /> Thêm danh mục
          </button>
        </div>
      </div>

      {/* Bố cục 2 cột: bảng bên trái, form bên phải */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Bảng danh sách category */}
        <div
          className={`bg-white rounded shadow md:ml-0 mx-0 ${
            showForm ? "w-full md:w-1/2" : "w-full"
          }`}
        >
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs md:text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-700">
                  <th className="p-3">
                    <input
                      type="checkbox"
                      checked={
                        selected.length === filtered.length &&
                        filtered.length > 0
                      }
                      onChange={selectAll}
                    />
                  </th>
                  <th className="p-3 text-left">Tên</th>
                  <th className="p-3 text-left">Icon</th>
                  <th className="p-3 text-left">Type</th>
                  <th className="p-3 text-center">Số món ăn</th>
                  <th className="p-3 text-center">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((cat) => (
                  <tr
                    key={cat.id}
                    className="border-b last:border-0 hover:bg-gray-50"
                  >
                    <td className="p-3 text-center">
                      <input
                        type="checkbox"
                        checked={selected.includes(cat.id)}
                        onChange={() => toggleSelect(cat.id)}
                      />
                    </td>
                    <td className="p-3 font-bold text-gray-800">{cat.name}</td>
                                         <td className="p-3 text-2xl">
                       {console.log('🔧 Rendering category:', cat.id, cat.name, 'Icon:', cat.icon, 'URL:', getImageUrl(cat.icon))}
                       {typeof cat.icon === 'string' && (cat.icon.endsWith('.png') || cat.icon.endsWith('.svg') || cat.icon.endsWith('.jpg') || cat.icon.endsWith('.jpeg') || cat.icon.endsWith('.gif') || cat.icon.endsWith('.webp') || cat.icon.startsWith('http')) ? (
                                                  <div className="relative inline-block">
                                                         <img
                               key={`category-icon-${cat.id}-${cat.icon}`}
                               src={getImageUrl(cat.icon)}
                               alt={cat.name}
                               className="w-8 h-8 object-contain"
                              onError={(e) => {
                                console.error('❌ Lỗi load ảnh category:', e.target.src, 'Category:', cat.name);
                                // Hiển thị fallback icon
                                e.target.style.display = 'none';
                                const fallbackIcon = e.target.parentElement.querySelector('.fallback-icon');
                                if (fallbackIcon) {
                                  fallbackIcon.style.display = 'inline-block';
                                }
                              }}
                              onLoad={(e) => {
                                console.log('✅ Load ảnh category thành công:', e.target.src, 'Category:', cat.name);
                              }}
                            />
                          {/* Fallback icon khi ảnh lỗi */}
                          <div className="fallback-icon hidden w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                            <FaUtensils className="text-gray-400 text-sm" />
                          </div>
                        </div>
                      ) : (
                        <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                          <FaUtensils className="text-gray-400 text-sm" />
                        </div>
                      )}
                    </td>
                    <td className="p-3 text-gray-700">{cat.type}</td>
                    <td className="p-3 text-center text-blue-500 font-semibold">
                      {cat.cuisineCount}
                    </td>
                    <td className="p-3 text-center flex gap-2 justify-center">
                      <button
                        className="text-blue-500 hover:text-blue-700"
                        onClick={() => handleEdit(cat)}
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="text-orange-500 hover:text-orange-600"
                        onClick={() => handleDelete(cat.id)}
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {/* Form thêm danh mục */}
        {showForm && (
          <div className="w-full md:w-1/2">
            <form
              onSubmit={handleFormSubmit}
              className="bg-white rounded shadow p-6 flex flex-col gap-4"
            >
              <h2 className="text-xl font-bold text-gray-800 mb-2">
                {editId ? "Sửa danh mục" : "Thêm danh mục"}
              </h2>
              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Tên danh mục
                </label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleFormChange}
                  className="w-full border rounded px-3 py-2 focus:outline-none"
                  placeholder="Nhập tên danh mục"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Icon (PNG hoặc SVG)
                </label>
                <div className="flex items-center gap-2">
                  {/* Chỉ cho upload file PNG, SVG */}
                                     <input
                     type="file"
                     accept=".svg,.png,.jpg,.jpeg,.gif,.webp"
                     className="hidden"
                     id="icon-upload"
                     key={`file-input-${editId || 'new'}`}
                                                                                      onChange={(e) => {
                        const file = e.target.files[0];
                        console.log('🔧 File input onChange triggered');
                        console.log('🔧 File:', file);
                        console.log('🔧 Current form.icon before change:', form.icon);
                        
                        if (file) {
                          console.log('🔧 File selected:', file.name, file.type, file.size);
                          console.log('🔧 File instanceof File:', file instanceof File);
                          
                          setForm((prevForm) => {
                            const newForm = { ...prevForm, icon: file };
                            console.log('🔧 Updated form with file:', newForm);
                            console.log('🔧 New form.icon instanceof File:', newForm.icon instanceof File);
                            return newForm;
                          });
                        } else {
                          console.log('🔧 No file selected');
                          // Nếu không có file được chọn, giữ nguyên form.icon
                        }
                      }}
                   />
                  <label
                    htmlFor="icon-upload"
                    className="px-2 py-1 border rounded cursor-pointer bg-gray-100 hover:bg-gray-200"
                  >
                    Tải ảnh
                  </label>
                  {/* Hiển thị preview icon vừa upload hoặc ảnh hiện tại */}
                  {console.log('🔧 Rendering preview - uploadedIcon:', uploadedIcon, 'editId:', editId, 'form.icon:', form.icon)}
                  {(uploadedIcon || (editId && form.icon)) && (
                    <div className="relative">
                      <img
                        src={uploadedIcon || (typeof form.icon === 'string' ? getImageUrl(form.icon) : null)}
                        alt="icon preview"
                        className="w-8 h-8 object-contain rounded border"
                        onError={(e) => {
                          console.error('❌ Lỗi load ảnh preview:', e.target.src);
                          e.target.style.display = 'none';
                          // Hiển thị fallback khi ảnh lỗi
                          const fallback = e.target.parentElement.querySelector('.preview-fallback');
                          if (fallback) {
                            fallback.style.display = 'block';
                          }
                        }}
                        onLoad={(e) => {
                          console.log('✅ Load ảnh preview thành công:', e.target.src);
                          // Ẩn fallback khi ảnh load thành công
                          const fallback = e.target.parentElement.querySelector('.preview-fallback');
                          if (fallback) {
                            fallback.style.display = 'none';
                          }
                        }}
                      />
                      <div className="preview-fallback hidden w-8 h-8 bg-gray-100 rounded border flex items-center justify-center">
                        <FaUtensils className="text-gray-400 text-xs" />
                      </div>
                    </div>
                  )}
                  {!uploadedIcon && !form.icon && editId && (
                    <div className="text-xs text-gray-500">Không có ảnh</div>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Type
                </label>
                <input
                  name="type"
                  value={form.type}
                  onChange={handleFormChange}
                  className="w-full border rounded px-3 py-2 focus:outline-none"
                  placeholder="food, drink..."
                />
              </div>
              <div className="flex gap-3 mt-2">
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded"
                >
                  Lưu
                </button>
                <button
                  type="button"
                  className="px-5 py-2 bg-gray-200 hover:bg-gray-300 rounded"
                  onClick={handleCancelForm}
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryList;
