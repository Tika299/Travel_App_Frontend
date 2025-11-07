"use client"

import { useState, useRef, useEffect } from "react"
import { Shield, Clock, Mail, HelpCircle } from "lucide-react"

export default function VerifyCodePage() {
  const email = localStorage.getItem("resetEmail")

  const [code, setCode] = useState(["", "", "", "", "", ""])
  const [isExpired, setIsExpired] = useState(false)
  const [timeLeft, setTimeLeft] = useState(300)
  const [isResending, setIsResending] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const inputRefs = useRef([])

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else {
      setIsExpired(true)
    }
  }, [timeLeft])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handleInputChange = (index, value) => {
    if (value.length > 1) return
    const newCode = [...code]
    newCode[index] = value
    setCode(newCode)
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleVerify = async () => {
    const verificationCode = code.join("")

    if (verificationCode.length !== 6 || !email) {
      alert("Vui lòng nhập đủ 6 số và đảm bảo có email")
      return
    }

    setIsVerifying(true)
    try {
      const res = await fetch("https://travel-app-api-ws77.onrender.com/api/verify-reset-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email, code: verificationCode }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "Xác nhận thất bại")

      localStorage.setItem("resetEmail", email)
      localStorage.setItem("resetCode", verificationCode)
      window.location.href = "/resetpass"
    } catch (error) {
      alert(error.message)
    } finally {
      setIsVerifying(false)
    }
  }

  const handleResendCode = async () => {
    setIsResending(true)
    try {
      await fetch("https://travel-app-api-ws77.onrender.com/api/send-reset-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email }),
      })
      setTimeLeft(300)
      setIsExpired(false)
      setCode(["", "", "", "", "", ""])
      alert("Mã xác nhận mới đã được gửi")
    } catch (error) {
      alert("Không gửi lại được mã")
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/img/pho-co-hoi-an.jpg?height=1080&width=1920')",
        }}
      >
        <div className="absolute inset-0 bg-black/20"></div>
      </div>

      <div className="relative z-10 w-full max-w-4xl mx-4">
        <div className="bg-white rounded-lg overflow-hidden shadow-2xl flex">
          <div className="hidden md:block w-1/2 relative bg-gradient-to-br from-teal-700 to-teal-800 text-white">
            <div
              className="absolute inset-0 bg-cover bg-center opacity-30"
              style={{ backgroundImage: "url('/img/Pho.jpg?height=600&width=400')" }}
            ></div>
            <div className="relative z-10 p-8 h-full flex flex-col">
              <div className="flex items-center mb-8">
                <div className="bg-white p-2 rounded-lg">
                  <img src="/img/Pho.jpg?height=32&width=32" alt="Logo" className="h-8 w-8" />
                </div>
                <span className="ml-3 font-bold text-lg">IPSUM TRAVEL</span>
              </div>
              <div className="flex-grow flex flex-col justify-center">
                <h2 className="text-2xl font-bold mb-4">Xác nhận danh tính</h2>
                <p className="mb-8 text-sm opacity-90">
                  Chúng tôi đã gửi mã xác nhận đến email của bạn. Vui lòng nhập mã để tiếp tục.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center"><Shield className="h-4 w-4 mr-3" /><span className="text-sm">Bảo mật 2 lớp</span></div>
                  <div className="flex items-center"><Clock className="h-4 w-4 mr-3" /><span className="text-sm">Hiệu lực 5 phút</span></div>
                  <div className="flex items-center"><Mail className="h-4 w-4 mr-3" /><span className="text-sm">Gửi qua email</span></div>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full md:w-1/2 p-8">
            <div className="max-w-sm mx-auto">
              <h1 className="text-2xl font-bold text-center mb-1">Quên mật khẩu?</h1>
              <p className="text-gray-500 text-center text-sm mb-6">
                Vui lòng kiểm tra email để lấy mã xác nhận
              </p>

              {email && (
                <p className="text-sm text-gray-600 mb-4 text-center">
                  Đang xác nhận cho email: <b>{email}</b>
                </p>
              )}

              <div className="text-center mb-6">
                <h2 className="text-lg font-semibold mb-2">Nhập mã xác nhận 6 số</h2>
              </div>

              <div className="flex justify-center space-x-3 mb-6">
                {code.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleInputChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-12 text-center text-xl font-bold border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isExpired}
                  />
                ))}
              </div>

              <div className="text-center mb-6">
                {isExpired ? (
                  <div className="bg-red-50 border border-red-200 rounded-md p-3">
                    <p className="text-red-600 text-sm font-medium">Mã đã hết hạn</p>
                  </div>
                ) : (
                  <p className="text-gray-600 text-sm">
                    Mã hết hạn sau:{" "}
                    <span className="font-mono font-bold text-blue-600">{formatTime(timeLeft)}</span>
                  </p>
                )}
              </div>

              <button
                onClick={handleVerify}
                disabled={isVerifying || isExpired || code.join("").length !== 6}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-teal-600 text-white rounded-md hover:from-blue-700 hover:to-teal-700 font-medium disabled:opacity-50 flex items-center justify-center mb-4"
              >
                {isVerifying ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Đang xác nhận...
                  </>
                ) : (
                  <>
                    <Shield className="h-4 w-4 mr-2" />
                    Xác nhận mã
                  </>
                )}
              </button>

              <div className="text-center mb-4">
                <button
                  onClick={handleResendCode}
                  disabled={isResending || !isExpired}
                  className="text-blue-600 hover:text-blue-500 text-sm font-medium disabled:opacity-50"
                >
                  {isResending ? "Đang gửi lại..." : "Gửi lại mã"}
                </button>
              </div>

              <div className="text-center">
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
