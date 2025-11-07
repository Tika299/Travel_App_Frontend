import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import axios from "axios";

const EditAccount = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    email: "",
    phone: "",
    bio: "",
    created_at: "",
  });

  const [avatarUrl, setAvatarUrl] = useState("");
  const [loading, setLoading] = useState(true);

  const getAvatarUrl = (avatar) => {
    if (!avatar) return "https://via.placeholder.com/150";
    if (avatar.startsWith("http")) return avatar;
    return `/${avatar}`; // Từ public/img/...
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("https://travel-app-api-ws77.onrender.com/api/user", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const user = response.data;

        setFormData({
          id: user.id || "",
          name: user.name || "",
          email: user.email || "",
          phone: user.phone || "",
          bio: user.bio || "",
          created_at: user.created_at || "",
        });

        setAvatarUrl(getAvatarUrl(user.avatar));
      } catch (error) {
        console.error("Lỗi khi lấy thông tin người dùng:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      const { id, created_at, email, ...payload } = formData;

      await axios.put(`https://travel-app-api-ws77.onrender.com/api/user/${id}`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const response = await axios.get("https://travel-app-api-ws77.onrender.com/api/user", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      localStorage.setItem("user", JSON.stringify(response.data));

      alert("Lưu thông tin thành công!");
      navigate("/account");
    } catch (error) {
      alert("Lỗi khi lưu thông tin");
      console.error(error);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formDataUpload = new FormData();
    formDataUpload.append("avatar", file);

    const token = localStorage.getItem("token");

    try {
      const response = await axios.post(
        "https://travel-app-api-ws77.onrender.com/api/user/avatar",
        formDataUpload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setAvatarUrl(getAvatarUrl(response.data.avatar_url));

      const userRes = await axios.get("https://travel-app-api-ws77.onrender.com/api/user", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      localStorage.setItem("user", JSON.stringify(userRes.data));

      alert("Đã cập nhật ảnh đại diện!");
      window.location.reload();
    } catch (error) {
      console.error("Lỗi cập nhật avatar:", error);
      alert("Lỗi khi cập nhật ảnh đại diện");
    }
  };

  if (loading) return <div className="text-center mt-10">Đang tải dữ liệu...</div>;

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-grow mt-8 px-4 md:px-0">
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-sm border">
          <h2 className="text-2xl font-bold mb-6">Chỉnh sửa thông tin tài khoản</h2>

          {/* Ảnh đại diện */}
          <div className="mb-8 text-center">
            <div className="inline-block relative">
              <img
                src={avatarUrl}
                alt="Avatar"
                className="w-32 h-32 rounded-full object-cover border shadow"
              />
              <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-1 rounded-full cursor-pointer hover:bg-blue-700">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15.232 5.232l3.536 3.536M9 13h3l8-8a2.828 2.828 0 10-4-4l-8 8v3z"
                  />
                </svg>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleAvatarChange}
                />
              </label>
            </div>
            <div className="mt-2 text-sm text-gray-500">Chọn ảnh đại diện mới</div>
          </div>

          {/* Thông tin tài khoản */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Họ và tên</label>
              <input name="name" value={formData.name} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input name="email" value={formData.email} disabled className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại</label>
              <input name="phone" value={formData.phone} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ngày tạo tài khoản</label>
              <input
                type="text"
                name="created_at"
                value={new Date(formData.created_at).toLocaleDateString("vi-VN")}
                disabled
                className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Giới thiệu (Bio)</label>
            <textarea name="bio" rows="4" value={formData.bio} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
          </div>

          <div className="flex justify-end space-x-4">
            <button onClick={() => navigate("/account")} className="px-4 py-2 bg-gray-200 rounded-lg">Huỷ</button>
            <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Lưu</button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default EditAccount;
