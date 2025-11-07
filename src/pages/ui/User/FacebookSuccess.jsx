import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function FacebookSuccess() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      localStorage.setItem("token", token); // Sửa lại tên key cho thống nhất

      // Gửi request để lấy user từ backend
      axios.get("https://travel-app-api-ws77.onrender.com/api/user", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then(res => {
        localStorage.setItem("user", JSON.stringify(res.data));
        navigate("/");
      })
      .catch(err => {
        console.error("Lỗi khi lấy user:", err);
        alert("Lỗi khi lấy thông tin người dùng");
        navigate("/login");
      });

    } else {
      alert("Đăng nhập thất bại");
      navigate("/login");
    }
  }, []);

  return <p>Đang đăng nhập bằng Facebook...</p>;
}
