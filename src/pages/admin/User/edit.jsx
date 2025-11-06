"use client"

import { useEffect, useState } from "react"
import {
  Bell,
  Eye,
  EyeOff,
  ArrowLeft,
  RotateCcw,
  Save,
  Phone,
  Settings,
} from "lucide-react"
import axios from "axios"

const EditUserForm = ({ user, onClose }) => {
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
    bio: "",
    role: "user",
  })

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        password: "",
        confirmPassword: "",
        phone: user.phone || "",
        status: user.status || "active",
        avatar: user.avatar || null,
        bio: user.bio || "",
        role: user.role || "user",
      })
    }
  }, [user])

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    if (formData.password && formData.password !== formData.confirmPassword) {
      alert("Mật khẩu xác nhận không khớp")
      return
    }

    try {
      const token = localStorage.getItem("token")
      const payload = new FormData()

      payload.append("name", formData.name)
      payload.append("email", formData.email)
      if (formData.password) payload.append("password", formData.password)
      payload.append("phone", formData.phone)
      payload.append("status", formData.status)
      payload.append("bio", formData.bio)
      payload.append("role", formData.role)

      if (formData.avatar) {
        payload.append("avatar", formData.avatar)
      }


      await axios.post(
        `http://localhost:8000/api/users/${user.id}?_method=PUT`,
        payload,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      )

      alert("Cập nhật thành công")
    } catch (error) {
      console.error(error)
      alert("Có lỗi xảy ra")
    }
  }

  const handleAvatarUpload = async (file) => {
    const formData = new FormData()
    formData.append("avatar", file)

    try {
      const token = localStorage.getItem("token")
      const response = await axios.post(`http://localhost:8000/api/users/${user.id}/avatar?_method=POST`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      })

      // Cập nhật ảnh mới
      setFormData(prev => ({
        ...prev,
        avatar: response.data.avatar_url, // đường dẫn: /img/xxx.jpg
      }))

      alert("Cập nhật ảnh đại diện thành công")
    } catch (error) {
      console.error(error)
      alert("Không thể cập nhật ảnh")
    }
  }


  const handleReset = () => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        password: "",
        confirmPassword: "",
        phone: user.phone || "",
        status: user.status || "active",
        avatar: user.avatar || null,
        bio: user.bio || "",
        role: user.role || "user",
      })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-800">Chỉnh sửa người dùng</h1>
            <p className="text-sm text-gray-500 mt-1">Cập nhật thông tin tài khoản</p>
          </div>
          <div className="flex items-center space-x-4">
            <Bell className="w-6 h-6 text-gray-500" />
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden">
                {formData.avatar ? (
                  <img
                    src={`http://localhost:8000/${formData.avatar}`} // Ví dụ: http://localhost:8000/img/xyz.jpg
                    alt="avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-sm font-medium">{formData.name.charAt(0)}</span>
                )}

              </div>
              <span className="text-sm font-medium text-gray-700">{formData.name}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="p-6 max-w-4xl mx-auto bg-white shadow-sm rounded-lg border">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Họ tên</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái</label>
            <select
              value={formData.status}
              onChange={(e) => handleInputChange("status", e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="active">Hoạt động</option>
              <option value="inactive">Tạm khóa</option>
            </select>
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
            <textarea
              rows="3"
              value={formData.bio}
              onChange={(e) => handleInputChange("bio", e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Vai trò</label>
            <select
              value={formData.role}
              onChange={(e) => handleInputChange("role", e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
              <option value="moderator">Moderator</option>
            </select>
          </div>
        </div>

        {/* avatar */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ảnh đại diện
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files[0]
              if (file) handleAvatarUpload(file)
            }}
            className="w-full px-3 py-2 border rounded-md"
          />

        </div>



        <div className="flex gap-3 mt-6">
          <button
            onClick={handleSubmit}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md flex items-center justify-center"
          >
            <Save className="w-4 h-4 mr-2" /> Lưu
          </button>
          <button
            onClick={handleReset}
            className="flex-1 px-4 py-2 bg-gray-300 rounded-md flex items-center justify-center"
          >
            <RotateCcw className="w-4 h-4 mr-2" /> Đặt lại
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-red-500 text-white rounded-md flex items-center justify-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Thoát
          </button>
        </div>
      </div>
    </div>
  )
}

export default EditUserForm
