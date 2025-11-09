import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useRef } from "react";
import { useNavigate } from "react-router-dom";
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

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData); // 🟢 Khai báo đúng
        setUser(parsedUser);
      } catch (err) {
        console.error("Lỗi parse user từ localStorage:", err);
        setUser(null);
      }
    }
  }, []);

  const getAvatarUrl = (avatar) => {
    if (!avatar) return "/img/t_avatar.png"; // fallback ảnh mặc định

    if (avatar.startsWith("http")) return avatar; // Avatar từ Google, Facebook

    // ✅ Ảnh nội bộ lưu tại React: /public/img
    return `https://690ff9c7f7e8158b7a39d76a--dancing-rabanadas-d78186.netlify.app/${avatar}`;
  };


  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user"); // ← Thêm dòng này
    setUser(null);
    setDropdownOpen(false);
    navigate("/login");
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
    <nav className="w-full bg-white shadow flex flex-col items-center justify-between px-4 py-2 md:px-8 sticky top-0 z-20">
      <div className="flex items-center justify-between w-full">
        {/* Logo */}
        <Link to="/" className="flex items-center flex-shrink-0 mr-4">
          <span className="text-2xl font-bold italic text-blue-500 select-none">
            IPSUM <span className="not-italic">TRAVEL</span>
          </span>
        </Link>

        {/* Menu (Desktop) */}
        <div className="hidden md:flex items-center space-x-6">

          <Link
            to="/checkin-places"
            className="flex items-center text-black hover:text-blue-500 font-medium"
          >
            <FaMapMarkerAlt className="mr-1" /> Địa điểm
          </Link>
          <Link
            to="/schedule"
            className="flex items-center text-black hover:text-blue-500 font-medium"
          >
            <FaRegCalendarAlt className="mr-1" /> Lịch trình
          </Link>
          <Link
            to="/hotels"
            className="flex items-center text-black hover:text-blue-500 font-medium"
          >
            <FaBed className="mr-1" /> Khách sạn
          </Link>
          <Link
            to="/cuisine"
            className="flex items-center text-black hover:text-blue-500 font-medium"
          >
            <FaUtensils className="mr-1" /> Ẩm thực
          </Link>
          <Link
            to="/restaurants"
            className="flex items-center text-black hover:text-blue-500 font-medium"
          >
            <TbChefHat className="mr-1" /> Nhà hàng/Quán ăn
          </Link>
          <Link
            to="/review"
            className="flex items-center text-black hover:text-blue-500 font-medium"
          >
            <FaStar className="mr-1" /> Review
          </Link>
          <Link
            to="/favorites"
            className="flex items-center text-black hover:text-blue-500 font-medium"
          >
            <FaHeart className="mr-1" /> Yêu thích
          </Link>
        </div>

        {/* Search bar */}
        <div className="flex-1 mx-4 hidden md:flex">
          <div className="relative w-full max-w-md">
            <input
              type="text"
              placeholder="Tìm kiếm điểm du lịch, khách sạn, nhà hàng..."
              className="w-full pl-4 pr-10 py-2 rounded-full bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
            />
            <FaSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" />
          </div>
        </div>

        {/* User info or Auth buttons */}
        <div className="hidden md:flex items-center space-x-3 relative" ref={dropdownRef}>
          {user ? (
            <div className="relative">
              <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center space-x-2 focus:outline-none">
                <img
                  src={getAvatarUrl(user.avatar)}
                  alt="avatar"
                  className="w-10 h-10 rounded-full"
                  referrerPolicy="no-referrer"
                />
                <span className="font-medium text-sm">{user.name}</span>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded shadow-md z-50">
                  <Link to="/profile" className="block px-4 py-2 hover:bg-gray-100">Hồ sơ</Link>
                  <button onClick={handleLogout} className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-500">
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" className="px-4 py-2 border border-blue-500 text-blue-500 rounded-lg font-medium hover:bg-blue-50 transition">
                Đăng nhập
              </Link>
              <Link to="/register" className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition">

                Đăng ký
              </Link>
            </>
          )}
          {/* admin */}
          {user?.role === "admin" && (
            <button
              onClick={() => navigate("/admin/User")}
              className="ml-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm font-medium"
            >
              Quay về trang Admin
            </button>
          )}

        </div>

        {/* Mobile menu toggle */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-2xl text-blue-500 focus:outline-none"
          >
            <FaBars />
          </button>
        </div>
      </div>


      {/* Mobile Menu */}
      {menuOpen && (
        <div className="absolute top-full left-0 w-full bg-white shadow-md flex flex-col items-start px-4 py-4 space-y-3 md:hidden z-50 animate-fade-in">
          <Link
            to="/checkin-places"
            className="flex items-center text-black hover:text-blue-500 font-medium w-full"
            onClick={() => setMenuOpen(false)}
          >
            <FaMapMarkerAlt className="mr-2" /> Địa điểm
          </Link>
          <Link
            to="/checkin-places/all"
            className="flex items-center text-black hover:text-blue-500 font-medium w-full"
            onClick={() => setMenuOpen(false)}
          >
            <FaRegCalendarAlt className="mr-2" /> Lịch trình
          </Link>
          <Link
            to="/hotels"
            className="flex items-center text-black hover:text-blue-500 font-medium w-full"
            onClick={() => setMenuOpen(false)}
          >
            <FaBed className="mr-2" /> Khách sạn
          </Link>
          <Link
            to="/cuisine"
            className="flex items-center text-black hover:text-blue-500 font-medium w-full"
            onClick={() => setMenuOpen(false)}
          >
            <FaUtensils className="mr-2" /> Ẩm thực
          </Link>
          <Link
            to="/admin/checkin-places"
            className="flex items-center text-black hover:text-blue-500 font-medium w-full"
            onClick={() => setMenuOpen(false)}
          >
            <TbChefHat className="mr-2" /> Nhà hàng/Quán ăn
          </Link>
          <Link
            to="/review"
            className="flex items-center text-black hover:text-blue-500 font-medium w-full"
            onClick={() => setMenuOpen(false)}
          >
            <FaStar className="mr-2" /> Review
          </Link>
          <Link
            to="/favorites"
            className="flex items-center text-black hover:text-blue-500 font-medium w-full"
            onClick={() => setMenuOpen(false)}
          >
            <FaHeart className="mr-2" /> Yêu thích
          </Link>

          {/* Search bar for mobile */}
          <div className="w-full mt-2 mb-2">
            <input
              type="text"
              placeholder="Tìm kiếm điểm du lịch, khách sạn, nhà hàng..."
              className="w-full pl-4 pr-10 py-2 rounded-full bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
            />
          </div>

          {/* User Info or Auth buttons (Mobile) */}
          {user ? (
            <div className="w-full flex items-center space-x-2">
              <img
                src={getAvatarUrl(user.avatar)}
                alt="avatar"
                className="w-10 h-10 rounded-full"
                referrerPolicy="no-referrer"
              />
              <span className="font-medium text-sm">{user.name}</span>
              <button
                onClick={handleLogout}
                className="ml-auto text-red-500 font-medium hover:underline"
              >
                Đăng xuất
              </button>
              {/* admin */}
              {user?.role === "admin" && (
                <button
                  onClick={() => {
                    navigate("/admin");
                    setMenuOpen(false);
                  }}
                  className="w-full mt-3 px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition"
                >
                  Quay về trang Admin
                </button>
              )}

            </div>
          ) : (
            <>
              <Link
                to="/login"
                className="w-full px-4 py-2 border border-blue-500 text-blue-500 rounded-lg font-medium hover:bg-blue-50 transition mb-2"
                onClick={() => setMenuOpen(false)}
              >
                Đăng nhập
              </Link>
              <Link
                to="/register"
                className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition"
                onClick={() => setMenuOpen(false)}
              >
                Đăng ký
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Header;
