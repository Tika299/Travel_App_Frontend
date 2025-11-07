import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

export default function GoogleSuccessPage() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = new URLSearchParams(location.search).get("token");

    if (token) {

      localStorage.setItem("token", token); // Ghi đúng key

      // Lấy thông tin user
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
        alert("Không lấy được thông tin người dùng.");
        navigate("/login");
      });


    } else {
      alert("Đăng nhập thất bại");
      navigate("/login");
    }
  }, []);

  return <p>Đang đăng nhập...</p>;
}
