"use client"

import { useState } from "react"
import { Eye, EyeOff, MapPin, Users, Star, Shield } from "lucide-react"
import { useNavigate } from "react-router-dom"
import axios from "axios"

export default function LoginPage() {
  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:8000/api/auth/google/redirect"
  };
  const handleFacebookLogin = () => {
  window.location.href = "http://localhost:8000/api/auth/facebook/redirect";
};
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [identifier, setIdentifier] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const navigate = useNavigate()

  const handleLogin = async (e) => {
  e.preventDefault();
  setError("");

  if (!identifier || !password) {
    setError("Vui lòng nhập đầy đủ thông tin.");
    return;
  }

  try {
    const response = await axios.post("http://localhost:8000/api/login", {
      identifier,
      password,
    });

    const user = response.data.user;
    localStorage.setItem("token", response.data.token);
    localStorage.setItem("user", JSON.stringify(user));

    if (user.role === "admin") {
      navigate("/admin/User"); // hoặc trang admin của bạn
    } else {
      navigate("/"); // người dùng thường
    }

  } catch (err) {
    console.error(err);
    setError(err.response?.data?.message || "Đăng nhập thất bại.");
  }
};
  return (
    <div className="min-h-screen flex items-center justify-center relative">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/img/pho-co-hoi-an.jpg?height=1080&width=1920')",
        }}
      >
        <div className="absolute inset-0 bg-black/20" />
      </div>

      <div className="relative z-10 w-full max-w-4xl mx-4">
        <div className="bg-white rounded-lg overflow-hidden shadow-2xl flex">
          {/* Left */}
          <div className="hidden md:block w-1/2 relative bg-gradient-to-br from-teal-700 to-teal-800 text-white">
            <div
              className="absolute inset-0 bg-cover bg-center opacity-30"
              style={{ backgroundImage: "url('/img/Pho.jpg?height=600&width=400')" }}
            />
            <div className="relative z-10 p-8 h-full flex flex-col">
              <div className="flex items-center mb-8">
                <div className="bg-white p-2 rounded-lg">
                  <img src="/img/Pho.jpg?height=32&width=32" alt="Logo" className="h-8 w-8" />
                </div>
                <span className="ml-3 font-bold text-lg">IPSUM TRAVEL</span>
              </div>
              <div className="flex-grow flex flex-col justify-center">
                <h2 className="text-2xl font-bold mb-4">Khám phá thế giới cùng chúng tôi</h2>
                <p className="mb-8 text-sm opacity-90 leading-relaxed">
                  Tham gia cộng đồng du lịch lớn nhất Việt Nam...
                </p>
                <div className="space-y-4">
                  <div className="flex items-center"><MapPin className="h-4 w-4 mr-3" /><span className="text-sm">1000+ điểm đến</span></div>
                  <div className="flex items-center"><Users className="h-4 w-4 mr-3" /><span className="text-sm">Cộng đồng 500K+</span></div>
                  <div className="flex items-center"><Star className="h-4 w-4 mr-3" /><span className="text-sm">Đánh giá 4.9/5</span></div>
                </div>
              </div>
            </div>
          </div>

          {/* Right - Login */}
          <div className="w-full md:w-1/2 p-8">
            <div className="max-w-sm mx-auto">
              <h1 className="text-2xl font-bold text-center mb-1">Đăng nhập</h1>
              <p className="text-gray-500 text-center text-sm mb-8">Tiếp tục hành trình...</p>

              {error && <div className="text-red-600 text-sm text-center mb-4">{error}</div>}

              <form className="space-y-5" onSubmit={handleLogin}>
                <div>
                  <label className="block text-sm font-medium mb-2">Email hoặc số điện thoại</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="example@email.com / +84 123 456 789"
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Mật khẩu</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-4 w-4 text-teal-600 border-gray-300 rounded"
                    />
                    <label htmlFor="remember-me" className="ml-2 text-sm text-gray-600">Ghi nhớ đăng nhập</label>
                  </div>
                  <a href="/forgot_password" className="text-sm text-teal-600 hover:text-teal-500">Quên mật khẩu?</a>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-teal-600 text-white rounded-md hover:from-blue-700 hover:to-teal-700 transition-all duration-200 font-medium"
                >
                  Đăng nhập
                </button>
              </form>

              {/* Social + Bảo mật */}
              <div className="mt-6 text-center">
                <p className="text-gray-600 text-sm">
                  Chưa có tài khoản?{" "}
                  <a href="/register" className="text-teal-600 hover:text-teal-500 font-medium">Đăng ký ngay</a>
                </p>
                <div className="mt-4 text-sm text-gray-500">Hoặc đăng nhập với</div>
                <div className="mt-4 flex justify-center space-x-3">
                  <button
                    onClick={handleGoogleLogin}
                    className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors w-36"
                  >
                    <img src="/img/google.jpg?height=20&width=20" alt="Google" className="h-5 w-5 mr-2" />
                    <span>Google</span>
                  </button>
                  <button
                  onClick={handleFacebookLogin}
                  className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors flex-1">
                    <img src="/img/facebook.jpg?height=20&width=20" alt="Facebook" className="h-5 w-5 mr-2" />
                    <span className="text-sm">Facebook</span>
                  </button>
                </div>
              </div>

              <div className="mt-6 p-3 bg-blue-50 rounded-md border border-blue-200">
                <div className="flex items-start">
                  <Shield className="h-4 w-4 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-blue-800 mb-1">Bảo mật tuyệt đối</p>
                    <p className="text-xs text-blue-700">
                      Thông tin của bạn được mã hóa và bảo vệ bằng công nghệ SSL 256 bit
                    </p>
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
