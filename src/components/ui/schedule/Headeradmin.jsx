import { Bell, Menu, User, LogOut } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../../pages/ui/Restaurant/avatar";
import { Button } from "../../../pages/ui/button_admin.jsx";
import { Badge } from "../../../pages/ui/Restaurant/badge.jsx";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../pages/ui/Restaurant/dropdown-menu";
import { Link, useNavigate, useLocation } from "react-router-dom";
import React, { useState, useEffect, useRef } from "react";
import {
  FaMapMarkerAlt,
  FaRegCalendarAlt,
  FaUtensils,
  FaSearch,
  FaBars,
  FaStar,
  FaHeart,
  FaBed,
} from "react-icons/fa";
import { TbChefHat } from "react-icons/tb";

export default function Headeradmin() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setCurrentUser(parsedUser);

        // ✅ Nếu không phải admin, điều hướng về trang login
        if (parsedUser.role !== "admin") {
          navigate("/login");
        }
      } catch (err) {
        console.error("Lỗi parse user từ localStorage:", err);
        setUser(null);
        navigate("/login"); // lỗi parse cũng cho về login
      }
    } else {
      // ✅ Không có token hoặc user → cũng chuyển về login
      navigate("/login");
    }
  }, []);

  const getAvatarUrl = (avatar) => {
    if (!avatar) return "/img/t_avatar.png"; // fallback ảnh mặc định

    if (avatar.startsWith("http")) return avatar; // Avatar từ Google, Facebook

    // ✅ Ảnh nội bộ lưu tại React: /public/img
    return `https://travelappdeloy.vercel.app/${avatar}`;
  };
  const getPageTitle = () => {
    const path = location.pathname;
    // Lấy Đường Dẫn Theo Tên 
    if (path.includes("/admin/User")) return "Quản lý người dùng";
    if (path.includes("/admin/Restaurant")) return "Quản lý nhà hàng";
    if (path.includes("/admin/hotels")) return "Quản lý khách sạn";
    if (path.includes("/admin/checkin-places")) return "Quản lý Điểm Checkin";
    if (path.includes("/admin/transport-companies")) return "Quản lý hãng xe";
    if (path.includes("/admin/transportations")) return "Quản lý phương tiện";
    if (path.includes("/admin/foods")) return "Quản lý món ăn";

    // thêm các path khác nếu cần

    return "Quản trị";
  };

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user"); // ← Thêm dòng này
    setUser(null);
    setDropdownOpen(false);
    navigate("/");
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  return (
    <header className="bg-white shadow-sm border-b px-6 py-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-800">
         {getPageTitle()}
        </h1>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Bell className="w-6 h-6 text-gray-500" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
          </div>
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center space-x-2 focus:outline-none"
            >
              <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-300 flex items-center justify-center">
                {currentUser?.avatar ? (
                  <img
                    src={`https://travelappdeloy.vercel.app/${currentUser.avatar}`}
                    alt={currentUser.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-sm font-medium text-white">
                    {currentUser?.name?.charAt(0) || "?"}
                  </span>
                )}
              </div>
              <span className="text-sm font-medium text-gray-700">
                {currentUser?.name || "Admin"}
              </span>
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-40 bg-white border rounded-lg shadow-md z-50">
                <button
                  onClick={() => (window.location.href = "/")}
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                >
                  Trang chủ
                </button>
                <button
                  onClick={() => {
                    localStorage.removeItem("token"); // hoặc xử lý logout khác nếu cần
                    window.location.href = "/login"; // chuyển về trang login
                  }}
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-red-600"
                >
                  Đăng xuất
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
