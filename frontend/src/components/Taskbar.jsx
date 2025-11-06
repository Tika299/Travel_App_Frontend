import React from 'react';
// 1. Thay thế Link bằng NavLink
import { NavLink } from 'react-router-dom';
import { PiChartLineUp, PiForkKnifeFill } from "react-icons/pi";
import { FaUser, FaCar, FaBed, FaBus, FaCamera, FaMapMarkerAlt } from "react-icons/fa";

const Taskbar = () => {
    // 2. Tạo một hàm để xác định class cho NavLink
    // Hàm này sẽ nhận vào { isActive } và trả về chuỗi class tương ứng
    const navLinkClasses = ({ isActive }) => {
        const baseClasses = "flex items-center p-3 delay-100 hover:bg-gray-700 cursor-pointer";
        const activeClasses = "bg-gray-700 font-bold"; // Class cho trạng thái active
        
        // Nếu isActive là true, thêm activeClasses vào
        return `${baseClasses} ${isActive ? activeClasses : ""}`;
    };

    return (
        <div className="bg-[url('/public/img/background_taskbar.jpg')] bg-cover bg-center h-screen w-64 text-white shadow-lg">
            <div className="text-center mb-5">
                <img src="/public/img/logo.png" alt="Ipsumtravel Logo" className="w-24 h-24 mx-auto rounded-full" />
                <h1 className="text-2xl font-bold">IPSUMTRAVEL</h1>
            </div>
            <ul className="space-y-2">
                {/* 3. Thay thế tất cả <Link> bằng <NavLink> và sử dụng hàm navLinkClasses */}
                <NavLink to="/dashboard" className={navLinkClasses}>
                    <PiChartLineUp className="mr-2" /> Dashboard
                </NavLink>
                <NavLink to="/admin/User" className={navLinkClasses}>
                    <FaUser className="mr-2" /> Quản lý người dùng
                </NavLink>
                <NavLink to="/restaurants" className={navLinkClasses}>
                    <PiForkKnifeFill className="mr-2" /> Nhà hàng/quán ăn
                </NavLink>
                <NavLink to="/admin/checkin-places" className={navLinkClasses}>
                    <FaMapMarkerAlt className="mr-2" /> Điểm check-in
                </NavLink>
                <NavLink to="/admin/foods" className={navLinkClasses}>
                    <FaCamera className="mr-2" /> Ẩm thực
                </NavLink>
                <NavLink to="/admin/transportations" className={navLinkClasses}>
                    <FaCar className="mr-2" /> Phương tiện
                </NavLink>
                <NavLink to="/admin/hotels" className={navLinkClasses}>
                    <FaBed className="mr-2" /> Khách sạn
                </NavLink>
                <NavLink to="/admin/transport-companies" className={navLinkClasses}>
                    <FaBus className="mr-2" /> Hàng phương tiện
                </NavLink>
            </ul>
        </div>
    );
};

export default Taskbar;