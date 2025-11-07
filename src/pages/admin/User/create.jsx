"use client"

import { useState } from "react"
import axios from "axios"
import { Bell, Eye, EyeOff, ArrowLeft, RotateCcw, Plus, Phone } from "lucide-react"

const AddUserForm = ({ onClose }) => {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    status: "active",
    avatar: null,
    avatarPreview: null,
    bio: "",
    role: "user",
  })

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    if (formData.password !== formData.confirmPassword) {
      alert("Mật khẩu không khớp!")
      return
    }

    const token = localStorage.getItem("token")
    if (!token) {
      alert("Bạn chưa đăng nhập!")
      return
    }

    try {
      // Gửi thông tin cơ bản để tạo user
      const res = await axios.post("https://travel-app-api-ws77.onrender.com/api/users", {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        bio: formData.bio,
        status: formData.status,
        role: formData.role,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const userId = res.data.user.id

      // Nếu có avatar thì gửi tiếp ảnh
      if (formData.avatar) {
        const avatarData = new FormData()
        avatarData.append("avatar", formData.avatar)

        await axios.post(`https://travel-app-api-ws77.onrender.com/api/users/${userId}/avatar`, avatarData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        })
      }

      alert("Tạo người dùng thành công!")
      handleReset()
      onClose()
    } catch (error) {
      console.error(error)
      if (error.response?.data?.errors) {
        alert("Lỗi: " + JSON.stringify(error.response.data.errors))
      } else {
        alert("Có lỗi xảy ra khi tạo người dùng!")
      }
    }
  }



  const handleReset = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      phone: "",
      status: "active",
      avatar: null,
      avatarPreview: null,
      bio: "",
      role: "user",
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b px-6 py-4">
        {/* ... giữ nguyên phần header ... */}
      </header>

      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white shadow-sm rounded-lg border">
            <div className="border-b bg-blue-50 p-6">
              <div className="flex items-center text-blue-700">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <Plus className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Thông tin người dùng</h2>
                  <p className="text-sm text-gray-600 mt-1">Điền đầy đủ thông tin để tạo tài khoản</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Thông tin cá nhân */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-6">Thông tin cá nhân</h3>

                  {/* Avatar */}
                  <div className="flex flex-col items-center mb-6">
                    {formData.avatarPreview ? (
                      <img
                        src={formData.avatarPreview}
                        alt="Avatar Preview"
                        className="w-32 h-32 rounded-full object-cover mb-2"
                      />
                    ) : (
                      <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                        <span className="text-4xl text-gray-400">U</span>
                      </div>
                    )}

                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0]
                        if (file) {
                          handleInputChange("avatar", file)
                          const previewUrl = URL.createObjectURL(file)
                          handleInputChange("avatarPreview", previewUrl)
                        }
                      }}
                      className="text-sm text-gray-600"
                    />
                  </div>


                  {/* Họ tên */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Họ và tên <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Nhập họ tên..."
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Số điện thoại */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại</label>
                    <div className="relative">
                      <input
                        type="tel"
                        placeholder="Nhập số điện thoại..."
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <Phone className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </div>
                  </div>

                  {/* Bio */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                    <textarea
                      placeholder="Nhập Bio..."
                      value={formData.bio}
                      onChange={(e) => handleInputChange("bio", e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                  </div>
                </div>

                {/* Thông tin tài khoản */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-6">Thông tin tài khoản</h3>

                  {/* Email */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      placeholder="Nhập địa chỉ email..."
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Mật khẩu */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu *</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Nhập mật khẩu"
                        value={formData.password}
                        onChange={(e) => handleInputChange("password", e.target.value)}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Xác nhận mật khẩu */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Xác nhận mật khẩu *</label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Nhập lại mật khẩu"
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Role & Status */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Vai trò</label>
                      <select
                        value={formData.role}
                        onChange={(e) => handleInputChange("role", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                        <option value="moderator">Moderator</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái</label>
                      <select
                        value={formData.status}
                        onChange={(e) => handleInputChange("status", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="active">Hoạt động</option>
                        <option value="inactive">Tạm khóa</option>
                      </select>
                    </div>
                  </div>

                  {/* Action buttons giữ nguyên */}
                  <div className="space-y-3">
                    <button onClick={handleSubmit} className="w-full px-4 py-2 bg-blue-600 text-white rounded-md flex items-center justify-center">
                      <Plus className="w-4 h-4 mr-2" />
                      Tạo người dùng
                    </button>
                    <button onClick={handleReset} className="w-full px-4 py-2 bg-green-500 text-white rounded-md flex items-center justify-center">
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Đặt lại
                    </button>
                    <button onClick={onClose} className="w-full px-4 py-2 bg-red-500 text-white rounded-md flex items-center justify-center">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Thoát
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AddUserForm
