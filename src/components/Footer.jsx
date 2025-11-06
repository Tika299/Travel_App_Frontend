import React from "react";
import { FaFacebook } from "react-icons/fa"; // Importing FontAwesome icon for Facebook
import { FaInstagram } from "react-icons/fa6"; // Importing FontAwesome icon for Instagram
import { FaYoutube } from "react-icons/fa6"; // Importing FontAwesome icon for YouTube
import { FaTiktok } from "react-icons/fa"; // Importing FontAwesome icon for TikTok

const Footer = () => {
  return (
    <footer className="bg-[#111827] text-white py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* Brand Section */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">IPSUM TRAVEL</h2>
          <p className="text-sm">Khám phá thế giới cùng chúng tôi.</p>
          <p className="text-sm">Những chuyến đi đáng nhớ bắt đầu từ đây.</p>
          <div className="flex items-center space-x-2">
            <FaFacebook className="text-xl text-blue-600 hover:text-red-400 cursor-pointer transition-colors" />
            <FaInstagram className="text-xl text-pink-600 hover:text-red-400 cursor-pointer transition-colors" />
            <FaYoutube className="text-xl text-red-600 hover:text-red-400 cursor-pointer transition-colors" />
            <FaTiktok className="text-xl hover:text-red-400 cursor-pointer transition-colors" />
          </div>
        </div>

        {/* Destinations */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Điểm đến</h3>
          <ul className="space-y-2">
            {["Hạ Long", "Hội An", "Sapa", "Phú Quốc", "Đà Lạt"].map((item) => (
              <li
                key={item}
                className="text-sm hover:text-red-400 cursor-pointer transition-colors"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Services */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Dịch vụ</h3>
          <ul className="space-y-2">
            {[
              "Đặt tour",
              "Đặt vé máy bay",
              "Đặt khách sạn",
              "Thuê xe",
              "Bảo hiểm du lịch",
            ].map((item) => (
              <li
                key={item}
                className="text-sm hover:text-red-400 cursor-pointer transition-colors"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Support */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Hỗ trợ</h3>
          <ul className="space-y-2">
            {["Liên hệ", "FAQ", "Chính sách", "Điều khoản", "Sitemap"].map(
              (item) => (
                <li
                  key={item}
                  className="text-sm hover:text-red-400 cursor-pointer transition-colors"
                >
                  {item}
                </li>
              )
            )}
          </ul>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="container mx-auto mt-8 pt-6 border-t border-gray-700 text-sm">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p>© 2024 IPSUM TRAVEL. All rights reserved.</p>
          <p className="mt-2 md:mt-0">
            Hotline: 1900-1234 Email: info@ipsumtravel.com
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 
