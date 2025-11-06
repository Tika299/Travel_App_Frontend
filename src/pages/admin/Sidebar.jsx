"use client";
import {
  BarChart3,
  Users,
  MapPin,
  Camera,
  Utensils,
  Car,
  Building,
  Calendar,
  MessageSquare,
  Settings,
  UtensilsCrossed,
  Factory,
  FileText,
  Bot
} from "lucide-react";

import { useCallback, useMemo } from "react";
import { useLocation } from "react-router-dom";

const Sidebar = ({ onMenuClick }) => {
  const { pathname } = useLocation();
  const currentPath = pathname.replace(/^\//, "");

  const menuItems = useMemo(() => [
    { icon: BarChart3, label: "Dashboard", path: "admin/dashboard" },
    { icon: Users, label: "Quản lý người dùng", path: "admin/User" },
    { icon: Factory, label: "Hãng xe", path: "admin/transport-companies" },
    { icon: Camera, label: "Điểm check-in", path: "admin/checkin-places" },
    { icon: Utensils, label: "Ẩm thực", path: "admin/foods" },
    { icon: Car, label: "Phương tiện", path: "admin/transportations" },
    { icon: Building, label: "Khách sạn", path: "admin/hotels" },
    { icon: UtensilsCrossed, label: "Nhà hàng", path: "admin/Restaurant" },
    { icon: Calendar, label: "Lịch trình", path: "admin/schedule" },
    { icon: FileText, label: "Bài viết", path: "admin/articles" },
    { icon: Bot, label: "Chatbot", path: "admin/chatbot" },
    { icon: Settings, label: "Cài đặt", path: "admin/settings" },
  ], []);

  const handleMenuClick = useCallback((path) => {
    onMenuClick?.(path);
  }, [onMenuClick]);

  return (
    <div className="w-64 relative">
      {/* Background Layer */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/image/sidebar-bg.jpg')" }}
      />
      <div className="absolute inset-0 bg-black/60" />

      <div className="relative z-10 p-6 h-full flex flex-col overflow-y-auto">
        {/* Logo Section */}
        <div className="flex flex-col items-center gap-3 pt-4 pb-6">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg overflow-hidden">
            <img
              src="/image/Logo.png"
              alt="Ipsum Travel Logo"
              className="w-16 h-16 object-contain"
            />
          </div>
          <div className="text-white text-xl font-bold tracking-wide">
            IPSUMTRAVEL
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1">
          {menuItems.map(({ icon: Icon, label, path }) => {
            const isActive = currentPath.toLowerCase() === path.toLowerCase();
            return (
              <div
                key={path}
                onClick={() => handleMenuClick(path)}
                className={`flex items-center gap-3 px-3 py-3 rounded-lg mb-2 cursor-pointer transition-colors ${isActive
                  ? "bg-blue-400 text-white"
                  : "text-white/80 hover:text-white hover:bg-white/10"
                  }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm">{label}</span>
              </div>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
