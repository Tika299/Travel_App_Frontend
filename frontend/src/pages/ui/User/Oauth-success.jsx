// src/pages/oauth-success.jsx
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function OAuthSuccessPage() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    const email = params.get("email");
    const avatar = params.get("avatar");
    const name = params.get("name");
    const bio = params.get("bio");
    const phone = params.get("phone");
    const created_at = params.get("created_at"); // 👈 THÊM DÒNG NÀY

    if (token && email) {
      // Lưu token và thông tin người dùng
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify({ email, avatar, name, bio, phone, created_at }));

      // Điều hướng về trang chính
      navigate("/");
    } else {
      alert("Đăng nhập thất bại");
      navigate("/login");
    }
  }, []);

  return <p>Đang đăng nhập...</p>;
}
