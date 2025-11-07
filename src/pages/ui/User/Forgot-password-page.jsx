"use client"

import { useState } from "react"
import { ArrowLeft, Shield, Zap, Mail, AlertTriangle, HelpCircle } from "lucide-react"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [captchaVerified, setCaptchaVerified] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!captchaVerified) {
      alert("Vui lòng xác minh bạn không phải robot")
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("https://travel-app-api-ws77.onrender.com/api/send-reset-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) throw new Error(data.message || "Có lỗi xảy ra")

        // ✅ Lưu email vào localStorage
    localStorage.setItem("resetEmail", email)

      alert("✅ Đã gửi mã xác thực về email của bạn!")
      window.location.href = `/verify?email=${encodeURIComponent(email)}`
    } catch (error) {
      alert("❌ Lỗi gửi mã: " + error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/img/pho-co-hoi-an.jpg')" }}
      >
        <div className="absolute inset-0 bg-black/20"></div>
      </div>

      {/* Modal */}
      <div className="relative z-10 w-full max-w-4xl mx-4">
        <div className="bg-white rounded-lg overflow-hidden shadow-2xl flex">
          {/* Left info */}
          <div className="hidden md:block w-1/2 bg-gradient-to-br from-teal-700 to-teal-800 text-white relative">
            <div
              className="absolute inset-0 bg-cover bg-center opacity-30"
              style={{ backgroundImage: "url('/img/Pho.jpg')" }}
            ></div>

            <div className="relative z-10 p-8 h-full flex flex-col">
              <div className="flex items-center mb-8">
                <div className="bg-white p-2 rounded-lg">
                  <img src="/img/Pho.jpg" alt="Logo" className="h-8 w-8" />
                </div>
                <span className="ml-3 font-bold text-lg">IPSUM TRAVEL</span>
              </div>

              <div className="flex-grow flex flex-col justify-center">
                <h2 className="text-2xl font-bold mb-4">Khôi phục tài khoản</h2>
                <p className="mb-8 text-sm opacity-90 leading-relaxed">
                  Đừng lo lắng! Chúng tôi sẽ giúp bạn lấy lại quyền truy cập vào tài khoản để tiếp tục hành trình khám phá thế giới.
                </p>

                <div className="space-y-4">
                  <div className="flex items-center">
                    <Shield className="h-4 w-4 mr-3 flex-shrink-0" />
                    <span className="text-sm">Bảo mật tuyệt đối</span>
                  </div>
                  <div className="flex items-center">
                    <Zap className="h-4 w-4 mr-3 flex-shrink-0" />
                    <span className="text-sm">Khôi phục nhanh chóng</span>
                  </div>
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-3 flex-shrink-0" />
                    <span className="text-sm">Hướng dẫn qua email</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right form */}
          <div className="w-full md:w-1/2 p-8">
            <div className="max-w-sm mx-auto">
              <h1 className="text-2xl font-bold text-center mb-1">Quên mật khẩu?</h1>
              <p className="text-gray-500 text-center text-sm mb-6">
                Nhập email hoặc số điện thoại để nhận liên kết đặt lại mật khẩu
              </p>

              {/* Steps */}
              <div className="flex items-center justify-center mb-8">
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full text-sm font-medium">
                    1
                  </div>
                  <span className="ml-2 text-sm text-blue-600 font-medium">Nhập thông tin</span>
                </div>
                <div className="w-8 h-px bg-gray-300 mx-4"></div>
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gray-300 text-gray-600 rounded-full text-sm font-medium flex items-center justify-center">2</div>
                  <span className="ml-2 text-sm text-gray-500">Xác nhận</span>
                </div>
                <div className="w-8 h-px bg-gray-300 mx-4"></div>
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gray-300 text-gray-600 rounded-full text-sm font-medium flex items-center justify-center">3</div>
                  <span className="ml-2 text-sm text-gray-500">Đặt lại</span>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium mb-2">Email hoặc số điện thoại</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="example@email.com / +84 123 456 789"
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                      required
                    />
                    <div className="absolute right-3 top-3.5 text-gray-400">
                      <Mail className="h-5 w-5" />
                    </div>
                  </div>
                  <p className="text-xs text-orange-600 mt-1">
                    Chúng tôi sẽ gửi liên kết đặt lại mật khẩu đến địa chỉ này
                  </p>
                </div>

                {/* Captcha */}
                <div>
                  <label className="block text-sm font-medium mb-2">Xác minh bảo mật</label>
                  <div className="border border-gray-300 rounded-md p-4 bg-gray-50">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="captcha"
                        checked={captchaVerified}
                        onChange={(e) => setCaptchaVerified(e.target.checked)}
                        className="h-4 w-4 text-teal-600 border-gray-300 rounded mr-3"
                      />
                      <label htmlFor="captcha" className="text-sm text-gray-700">
                        Tôi là người không phải robot
                      </label>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !email || !captchaVerified}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-teal-600 text-white rounded-md hover:from-blue-700 hover:to-teal-700 transition-all duration-200 font-medium disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Đang gửi...
                    </>
                  ) : (
                    <>
                      <Mail className="h-4 w-4 mr-2" />
                      Gửi liên kết khôi phục
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-gray-600 text-sm">
                  Nhớ mật khẩu?{" "}
                  <a href="/login" className="text-teal-600 hover:text-teal-500 font-medium inline-flex items-center">
                    <ArrowLeft className="h-3 w-3 mr-1" />
                    Đăng nhập ngay
                  </a>
                </p>

                <div className="mt-4">
                  <button className="w-full py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-sm flex items-center justify-center">
                    <HelpCircle className="h-4 w-4 mr-2" />
                    Liên hệ hỗ trợ
                  </button>
                </div>
              </div>

              <div className="mt-6 p-3 bg-orange-50 rounded-md border border-orange-200">
                <div className="flex items-start">
                  <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5 mr-2" />
                  <div>
                    <p className="text-xs font-medium text-orange-800 mb-1">Mẹo hữu ích</p>
                    <p className="text-xs text-orange-700">
                      Kiểm tra thư mục spam nếu không nhận được email. Liên kết có hiệu lực trong 15 phút.
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
