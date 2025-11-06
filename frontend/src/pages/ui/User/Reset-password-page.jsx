"use client"

import { useState, useEffect } from "react"
import { Eye, EyeOff, Shield, Hash, Lock, HelpCircle, Check } from "lucide-react"

export default function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [email, setEmail] = useState("")

  useEffect(() => {
    const storedEmail = localStorage.getItem("resetEmail")
    if (!storedEmail) {
      alert("Không tìm thấy email khôi phục. Vui lòng thử lại.")
      window.location.href = "/forgot_password"
    } else {
      setEmail(storedEmail)
    }
  }, [])

  const passwordRequirements = [
    { text: "Ít nhất 8 ký tự", met: newPassword.length >= 8 },
    { text: "Có chữ hoa", met: /[A-Z]/.test(newPassword) },
    { text: "Có chữ thường", met: /[a-z]/.test(newPassword) },
    { text: "Có số", met: /\d/.test(newPassword) },
    { text: "Có ký tự đặc biệt", met: /[!@#$%^&*(),.?\":{}|<>]/.test(newPassword) },
  ]

  const isPasswordValid = passwordRequirements.every((req) => req.met)
  const doPasswordsMatch = newPassword === confirmPassword && confirmPassword.length > 0

  const handleSubmit = async (e) => {
  e.preventDefault()
  if (!isPasswordValid || !doPasswordsMatch) {
    alert("Vui lòng kiểm tra lại mật khẩu")
    return
  }

  const email = localStorage.getItem("resetEmail")
  const code = localStorage.getItem("resetCode")

  if (!email || !code) {
    alert("Thiếu thông tin xác minh (email hoặc mã)")
    return
  }

  setIsSubmitting(true)

  try {
    const response = await fetch("http://localhost:8000/api/reset-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        email,
        code,
        password: newPassword,
        password_confirmation: confirmPassword,
      }),
    })

    const data = await response.json()

    if (!response.ok) throw new Error(data.message || "Có lỗi xảy ra")

    alert("🎉 Mật khẩu đã được đặt lại thành công!")
    localStorage.removeItem("resetEmail")
    localStorage.removeItem("resetCode")
    window.location.href = "/login"
  } catch (error) {
    alert("❌ Lỗi: " + error.message)
  } finally {
    setIsSubmitting(false)
  }
}


  return (
    <div className="min-h-screen flex items-center justify-center relative">
      {/* Background img */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundimg: "url('/img/pho-co-hoi-an.jpg?height=1080&width=1920')",
        }}
      >
        <div className="absolute inset-0 bg-black/20"></div>
      </div>

      {/* Reset Password Modal */}
      <div className="relative z-10 w-full max-w-4xl mx-4">
        <div className="bg-white rounded-lg overflow-hidden shadow-2xl flex">
          {/* Left side - Reset info */}
          <div className="hidden md:block w-1/2 relative bg-gradient-to-br from-teal-700 to-teal-800 text-white">
            <div
              className="absolute inset-0 bg-cover bg-center opacity-30"
              style={{ backgroundimg: "url('/img/Pho.jpg?height=600&width=400')" }}
            ></div>

            <div className="relative z-10 p-8 h-full flex flex-col">
              <div className="flex items-center mb-8">
                <div className="bg-white p-2 rounded-lg">
                  <img src="/img/Pho.jpg?height=32&width=32" alt="Logo" className="h-8 w-8" />
                </div>
                <span className="ml-3 font-bold text-lg">IPSUM TRAVEL</span>
              </div>

              <div className="flex-grow flex flex-col justify-center">
                <h2 className="text-2xl font-bold mb-4">Đặt lại mật khẩu</h2>
                <p className="mb-8 text-sm opacity-90 leading-relaxed">
                  Tạo mật khẩu mới để bảo vệ tài khoản của bạn. Hãy chọn mật khẩu mạnh và dễ nhớ.
                </p>

                <div className="space-y-4">
                  <div className="flex items-center">
                    <Lock className="h-4 w-4 mr-3 flex-shrink-0" />
                    <span className="text-sm">Ít nhất 8 ký tự</span>
                  </div>
                  <div className="flex items-center">
                    <Hash className="h-4 w-4 mr-3 flex-shrink-0" />
                    <span className="text-sm">Bao gồm số và ký tự đặc biệt</span>
                  </div>
                  <div className="flex items-center">
                    <Shield className="h-4 w-4 mr-3 flex-shrink-0" />
                    <span className="text-sm">Kết hợp chữ hoa và thường</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Reset Password form */}
          <div className="w-full md:w-1/2 p-8">
            <div className="max-w-sm mx-auto">
              <h1 className="text-2xl font-bold text-center mb-1">Quên mật khẩu?</h1>
              <p className="text-gray-500 text-center text-sm mb-6">
                Nhập email hoặc số điện thoại để nhận liên kết đặt lại mật khẩu
              </p>

              {/* Progress Steps */}
              <div className="flex items-center justify-center mb-8">
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-8 h-8 bg-green-600 text-white rounded-full text-sm font-medium">
                    ✓
                  </div>
                  <span className="ml-2 text-sm text-green-600 font-medium">Nhập thông tin</span>
                </div>
                <div className="w-8 h-px bg-green-600 mx-4"></div>
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-8 h-8 bg-green-600 text-white rounded-full text-sm font-medium">
                    ✓
                  </div>
                  <span className="ml-2 text-sm text-green-600 font-medium">Xác nhận</span>
                </div>
                <div className="w-8 h-px bg-blue-600 mx-4"></div>
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full text-sm font-medium">
                    3
                  </div>
                  <span className="ml-2 text-sm text-blue-600 font-medium">Đặt lại</span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium mb-2">Mật khẩu mới</label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Nhập mật khẩu mới"
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                    >
                      {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Độ mạnh mật khẩu</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Xác nhận mật khẩu</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Nhập lại mật khẩu mới"
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {/* Password Requirements */}
                <div className="bg-gray-50 rounded-md p-4">
                  <p className="text-sm font-medium text-gray-700 mb-3">Yêu cầu mật khẩu:</p>
                  <div className="space-y-2">
                    {passwordRequirements.map((req, index) => (
                      <div key={index} className="flex items-center text-sm">
                        <div
                          className={`w-4 h-4 rounded-full mr-2 flex items-center justify-center ${
                            req.met ? "bg-green-500 text-white" : "bg-red-500 text-white"
                          }`}
                        >
                          {req.met ? <Check className="h-3 w-3" /> : "●"}
                        </div>
                        <span className={req.met ? "text-green-600" : "text-red-600"}>{req.text}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !isPasswordValid || !doPasswordsMatch}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-teal-600 text-white rounded-md hover:from-blue-700 hover:to-teal-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Đang cập nhật...
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4 mr-2" />
                      Đặt lại mật khẩu
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-gray-600 text-sm mb-4">
                  Muốn thay đổi email?{" "}
                  <a href="/forgot_password" className="text-teal-600 hover:text-teal-500 font-medium">
                    Quay lại
                  </a>
                </p>

                <button className="w-full py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-sm flex items-center justify-center">
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Liên hệ hỗ trợ
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
