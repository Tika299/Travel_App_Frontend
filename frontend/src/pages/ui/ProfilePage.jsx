import React, { useState } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

import { useNavigate } from "react-router-dom";

import { FaStar, FaRegStar } from "react-icons/fa";
import { BsThreeDots } from "react-icons/bs";
import { PiMapPinLineBold } from "react-icons/pi";
import { IoCalendarOutline } from "react-icons/io5";
import { HiOutlinePlus } from "react-icons/hi2";
import { FaUserFriends } from "react-icons/fa";
import { FaCheckCircle } from "react-icons/fa";
import { FaPlaneDeparture } from "react-icons/fa";
import MyReviewPage from "./MyReviewPage";

function ProfilePage() {
  const [activeTab, setActiveTab] = useState("overview");
  const itineraries = [
    {
      id: 1,
      title: "Khám phá Đà Lạt mùa hoa",
      status: "Sắp tới",
      date: "20-23/12/2024",
      location: "Đà Lạt, Lâm Đồng",
      people: 4,
      desc: "4 ngày 3 đêm khám phá thành phố ngàn hoa - Thăm các vườn hoa, chợ đêm và trải nghiệm khí hậu mát mẻ",
      progress: 85,
      statusColor: "orange",
      actions: ["Xem chi tiết", "Chỉnh sửa"],
    },
    {
      id: 2,
      title: "Phố cổ Hội An",
      status: "Đã hoàn thành",
      date: "15-17/11/2024",
      location: "Hội An, Quảng Nam",
      people: 2,
      desc: "3 ngày 2 đêm khám phá phố cổ - Thưởng thức ẩm thực, tham quan chùa cầu và mua sắm đèn lồng",
      progress: 100,
      statusColor: "green",
      actions: ["Xem chi tiết", "Đánh giá"],
    },
    {
      id: 3,
      title: "Khám phá Phú Quốc",
      status: "Đang lên kế hoạch",
      date: "05-10/01/2025",
      location: "Phú Quốc, Kiên Giang",
      people: 6,
      desc: "5 ngày 4 đêm nghỉ dưỡng tại đảo ngọc - Tắm biển, lặn ngắm san hô và thưởng thức hải sản tươi sống",
      progress: 25,
      statusColor: "blue",
      actions: ["Tiếp tục lên kế hoạch", "Chỉnh sửa"],
    },
    {
      id: 4,
      title: "Vịnh Hạ Long",
      status: "Đã hoàn thành",
      date: "08-09/11/2024",
      location: "Hạ Long, Quảng Ninh",
      people: 2,
      desc: "2 ngày 1 đêm trên du thuyền - Ngắm cảnh vịnh, thăm động Thiên Cung và trải nghiệm câu cá",
      progress: 100,
      statusColor: "green",
      actions: ["Xem chi tiết", "Đánh giá"],
    },
  ];

  const navigate = useNavigate();

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    if (tab === "account") {
      navigate("/account");
    }
  };

  return (
    <div>
      <Header />
      <main>
        <div>
          {/* ...cover and info... */}
          <div className="bg-[url('/public/img/background_profile.jpg')] bg-cover bg-center bg-no-repeat h-[400px] relative before:bg-black before:bg-opacity-30 before:content-[''] before:absolute before:inset-0">
            <div className="flex items-center h-full text-white ml-40 z-10 relative">
              <img
                className="rounded-full w-72 h-72"
                src="/public/img/t_avatar.png"
                alt="avatar"
              />
              <div className="ml-20">
                <h2 className="text-6xl">User Name</h2>
                <p className="text-sm">user@example.com</p>
                <div className="flex space-x-4 mt-4">
                  <div className="flex flex-col items-start">
                    <BsThreeDots className="ml-4 w-3 h-3" />
                    <div className="flex items-center justify-center bg-stone-400 text-white rounded-3xl p-3 space-x-2">
                      <PiMapPinLineBold className="w-5 h-5 text-white" />
                      <p className="italic font-semibold">15 điểm đã đi</p>
                    </div>
                    {/* Tabs */}
                    <div className="w-[90%] mx-auto mt-32">
                      <div className="flex border-b">
                        <button
                          className={`px-6 py-3 font-semibold ${
                            activeTab === "overview"
                              ? "border-b-2 border-blue-500 text-blue-600"
                              : "text-black-500"
                          }`}
                          onClick={() => setActiveTab("overview")}
                        >
                          Tổng quan
                        </button>
                        <button
                          className={`px-6 py-3 font-semibold ${
                            activeTab === "itinerary"
                              ? "border-b-2 border-blue-500 text-blue-600"
                              : "text-black-500"
                          }`}
                          onClick={() => setActiveTab("itinerary")}
                        >
                          Lịch trình
                        </button>
                        <button
                          className={`px-6 py-3 font-semibold ${
                            activeTab === "review"
                              ? "border-b-2 border-blue-500 text-blue-600"
                              : "text-black-500"
                          }`}
                          onClick={() => setActiveTab("review")}
                        >
                          Đánh giá
                        </button>

                        <button
                          className={`px-6 py-3 font-semibold ${
                            activeTab === "account"
                              ? "border-b-2 border-blue-500 text-blue-600"
                              : "text-black-500"
                          }`}
                          onClick={() => handleTabClick("account")}
                        >
                          Tài khoản
                        </button>
                      </div>
                      {/* Nội dung từng tab */}
                      {activeTab === "overview" && (
                        <div>
                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
                            {/* Left: Chuyến đi gần đây + Lịch trình */}
                            <div className="lg:col-span-2 space-y-8">
                              {/* Chuyến đi gần đây */}
                              <div className="bg-white rounded-xl shadow p-6">
                                <h3 className="font-bold text-lg mb-4">
                                  Chuyến đi gần đây
                                </h3>
                                <div className="space-y-4">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <div className="flex items-center space-x-2">
                                        <span className="font-semibold">
                                          Hạ Long - Ninh Bình
                                        </span>
                                        <span className="flex items-center text-yellow-500">
                                          <FaStar />
                                          <FaStar />
                                          <FaStar />
                                          <FaStar />
                                          <FaStar />
                                        </span>
                                      </div>
                                      <div className="text-gray-500 text-sm">
                                        15-18 Thg 1, 2024 · Tuyệt vời
                                      </div>
                                    </div>
                                    <span className="text-gray-400">&gt;</span>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <div className="flex items-center space-x-2">
                                        <span className="font-semibold">
                                          Hội An - Đà Nẵng
                                        </span>
                                        <span className="flex items-center text-yellow-500">
                                          <FaStar />
                                          <FaStar />
                                          <FaStar />
                                          <FaStar />
                                          <FaRegStar />
                                        </span>
                                      </div>
                                      <div className="text-gray-500 text-sm">
                                        8-12 Thg 10, 2024 · Rất tốt
                                      </div>
                                    </div>
                                    <span className="text-gray-400">&gt;</span>
                                  </div>
                                </div>
                              </div>
                              {/* Lịch trình của tôi */}
                              <div className="bg-white rounded-xl shadow p-6">
                                <div className="flex justify-between items-center mb-4">
                                  <h3 className="font-bold text-lg">
                                    Lịch trình của tôi
                                  </h3>
                                  <button className="flex items-center bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm font-medium">
                                    <HiOutlinePlus className="mr-1" /> Tạo mới
                                  </button>
                                </div>
                                <div className="flex flex-col md:flex-row gap-4">
                                  <div className="bg-gray-100 rounded-lg p-4 flex-1">
                                    <div className="flex justify-between items-center">
                                      <span className="font-semibold">
                                        Sapa - Mù Cang Chải
                                      </span>
                                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">
                                        Công khai
                                      </span>
                                    </div>
                                    <div className="text-gray-500 text-sm mt-1">
                                      4 ngày 3 đêm khám phá vùng núi Tây Bắc
                                    </div>
                                    <div className="flex items-center text-gray-400 text-xs mt-2">
                                      <IoCalendarOutline className="mr-1" />{" "}
                                      20-23 Tháng 12
                                      <span className="mx-2">·</span>
                                      <span>24 lượt thích</span>
                                    </div>
                                  </div>
                                  <div className="bg-gray-100 rounded-lg p-4 flex-1">
                                    <div className="flex justify-between items-center">
                                      <span className="font-semibold">
                                        Phú Quốc Relax
                                      </span>
                                      <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs">
                                        Nháp
                                      </span>
                                    </div>
                                    <div className="text-gray-500 text-sm mt-1">
                                      5 ngày nghỉ dưỡng tại đảo ngọc
                                    </div>
                                    <div className="flex items-center text-gray-400 text-xs mt-2">
                                      <span>Chưa xác định</span>
                                      <span className="mx-2">·</span>
                                      <span>Đang soạn</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            {/* Right: Thống kê, Điểm đã ghé thăm, Thành tích */}
                            <div className="space-y-8">
                              {/* Thống kê */}
                              <div className="bg-white rounded-xl shadow p-6">
                                <h3 className="font-bold text-lg mb-4">
                                  Thống kê
                                </h3>
                                <div className="space-y-2">
                                  <div className="flex justify-between">
                                    <span>Tổng km đã đi</span>
                                    <span className="font-bold text-lg">
                                      2,847 km
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Tỉnh/thành đã đến</span>
                                    <span className="font-bold text-lg">
                                      12/63
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Điểm kinh nghiệm</span>
                                    <span className="font-bold text-blue-600">
                                      8,450 XP
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Lượt theo dõi</span>
                                    <span className="font-bold">342</span>
                                  </div>
                                </div>
                              </div>
                              {/* Điểm đã ghé thăm */}
                              <div className="bg-white rounded-xl shadow p-6">
                                <h3 className="font-bold text-lg mb-4">
                                  Điểm đã ghé thăm
                                </h3>
                                <div className="space-y-2">
                                  <div>
                                    <span className="font-semibold">
                                      Hạ Long Bay
                                    </span>
                                    <span className="text-gray-400 text-xs ml-2">
                                      Quảng Ninh
                                    </span>
                                  </div>
                                  <div>
                                    <span className="font-semibold">
                                      Phố cổ Hội An
                                    </span>
                                    <span className="text-gray-400 text-xs ml-2">
                                      Quảng Nam
                                    </span>
                                  </div>
                                  <div>
                                    <span className="font-semibold">
                                      Ruộng bậc thang Sapa
                                    </span>
                                    <span className="text-gray-400 text-xs ml-2">
                                      Lào Cai
                                    </span>
                                  </div>
                                  <a
                                    href="#"
                                    className="text-blue-600 text-sm mt-2 inline-block"
                                  >
                                    Xem tất cả (15)
                                  </a>
                                </div>
                              </div>
                              {/* Thành tích */}
                              <div className="bg-white rounded-xl shadow p-6">
                                <h3 className="font-bold text-lg mb-4">
                                  Thành tích
                                </h3>
                                <div className="flex space-x-4">
                                  <div className="flex flex-col items-center">
                                    <div className="bg-yellow-100 rounded-full w-12 h-12 flex items-center justify-center mb-2">
                                      <span className="text-yellow-500 text-2xl">
                                        ⛰️
                                      </span>
                                    </div>
                                    <span className="text-xs text-gray-600">
                                      Nhà leo núi
                                    </span>
                                  </div>
                                  <div className="flex flex-col items-center">
                                    <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mb-2">
                                      <span className="text-blue-500 text-2xl">
                                        🧭
                                      </span>
                                    </div>
                                    <span className="text-xs text-gray-600">
                                      Thủ lĩnh
                                    </span>
                                  </div>
                                  <div className="flex flex-col items-center">
                                    <div className="bg-green-100 rounded-full w-12 h-12 flex items-center justify-center mb-2">
                                      <span className="text-green-500 text-2xl">
                                        🌏
                                      </span>
                                    </div>
                                    <span className="text-xs text-gray-600">
                                      Nhà phiêu lưu
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      {activeTab === "itinerary" && (
                        <div>
                          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mt-8">
                            {/* Bộ lọc */}
                            <div className="bg-white rounded-xl shadow p-6 space-y-6">
                              <h3 className="font-bold text-lg mb-2">
                                Bộ lọc lịch trình
                              </h3>
                              <div>
                                <div className="font-semibold mb-1">
                                  Trạng thái
                                </div>
                                <div className="space-y-1">
                                  <label className="flex items-center">
                                    <input
                                      type="checkbox"
                                      className="mr-2"
                                      defaultChecked
                                    />
                                    Tất cả
                                  </label>
                                  <label className="flex items-center">
                                    <input type="checkbox" className="mr-2" />
                                    Sắp tới
                                  </label>
                                  <label className="flex items-center">
                                    <input type="checkbox" className="mr-2" />
                                    Đang lên kế hoạch
                                  </label>
                                  <label className="flex items-center">
                                    <input type="checkbox" className="mr-2" />
                                    Đã hoàn thành
                                  </label>
                                </div>
                              </div>
                              <div>
                                <div className="font-semibold mb-1">
                                  Thời gian
                                </div>
                                <select className="w-full border rounded px-2 py-1 text-sm">
                                  <option>Tất cả thời gian</option>
                                </select>
                              </div>
                              <div>
                                <div className="font-semibold mb-1">
                                  Địa điểm
                                </div>
                                <select className="w-full border rounded px-2 py-1 text-sm">
                                  <option>Tất cả địa điểm</option>
                                </select>
                              </div>
                              <button className="w-full bg-blue-600 text-white py-2 rounded font-semibold mt-2">
                                Áp dụng bộ lọc
                              </button>
                              {/* Thống kê */}
                              <div className="mt-6">
                                <h4 className="font-bold mb-2">
                                  Thống kê lịch trình
                                </h4>
                                <div className="flex justify-between text-sm mb-1">
                                  <span>Tổng lịch trình</span>
                                  <span>15</span>
                                </div>
                                <div className="flex justify-between text-sm mb-1">
                                  <span>Sắp tới</span>
                                  <span>3</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span>Đã hoàn thành</span>
                                  <span>12</span>
                                </div>
                              </div>
                            </div>
                            {/* Danh sách lịch trình */}
                            <div className="lg:col-span-3">
                              <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-lg">
                                  Lịch trình của tôi
                                </h3>
                                <button className="flex items-center bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm font-medium">
                                  + Tạo lịch trình mới
                                </button>
                              </div>
                              <div className="space-y-4">
                                {itineraries.map((item) => (
                                  <div
                                    key={item.id}
                                    className={`bg-white rounded-xl shadow p-6 border-l-4 ${
                                      item.statusColor === "green"
                                        ? "border-green-500"
                                        : item.statusColor === "orange"
                                        ? "border-orange-400"
                                        : "border-blue-400"
                                    }`}
                                  >
                                    <div className="flex justify-between items-start">
                                      <div>
                                        <div className="flex items-center mb-1">
                                          {item.status === "Đã hoàn thành" && (
                                            <FaCheckCircle className="text-green-500 mr-2" />
                                          )}
                                          {item.status === "Sắp tới" && (
                                            <span className="w-3 h-3 rounded-full bg-orange-400 mr-2 inline-block"></span>
                                          )}
                                          {item.status ===
                                            "Đang lên kế hoạch" && (
                                            <FaPlaneDeparture className="text-blue-400 mr-2" />
                                          )}
                                          <span className="font-semibold">
                                            {item.title}
                                          </span>
                                          <span
                                            className={`ml-2 text-xs px-2 py-1 rounded ${
                                              item.statusColor === "green"
                                                ? "bg-green-100 text-green-700"
                                                : item.statusColor === "orange"
                                                ? "bg-orange-100 text-orange-700"
                                                : "bg-blue-100 text-blue-700"
                                            }`}
                                          >
                                            {item.status}
                                          </span>
                                        </div>
                                        <div className="flex items-center text-gray-400 text-xs mb-1">
                                          <IoCalendarOutline className="mr-1" />{" "}
                                          {item.date}
                                          <span className="mx-2">·</span>
                                          <span>{item.location}</span>
                                          <span className="mx-2">·</span>
                                          <FaUserFriends className="mr-1" />{" "}
                                          {item.people} người
                                        </div>
                                        <div className="text-gray-500 text-sm mb-2">
                                          {item.desc}
                                        </div>
                                        {/* Progress */}
                                        <div className="flex items-center text-xs mb-1">
                                          {item.status === "Đã hoàn thành" ? (
                                            <span className="text-green-600 font-semibold">
                                              Hoàn thành: 100%
                                            </span>
                                          ) : (
                                            <>
                                              <span className="mr-2">
                                                Tiến độ: {item.progress}%
                                              </span>
                                              <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                <div
                                                  className={`h-2 rounded-full ${
                                                    item.statusColor === "green"
                                                      ? "bg-green-500"
                                                      : item.statusColor ===
                                                        "orange"
                                                      ? "bg-orange-400"
                                                      : "bg-blue-400"
                                                  }`}
                                                  style={{
                                                    width: `${item.progress}%`,
                                                  }}
                                                ></div>
                                              </div>
                                            </>
                                          )}
                                        </div>
                                      </div>
                                      <div className="flex flex-col items-end space-y-2">
                                        <BsThreeDots className="text-gray-400 cursor-pointer" />
                                        <div className="flex space-x-2">
                                          {item.actions.map((action, idx) => (
                                            <button
                                              key={idx}
                                              className={`px-3 py-1 rounded text-xs font-semibold ${
                                                action === "Xem chi tiết" ||
                                                action ===
                                                  "Tiếp tục lên kế hoạch"
                                                  ? "bg-blue-50 text-blue-600"
                                                  : action === "Đánh giá"
                                                  ? "bg-yellow-50 text-yellow-600"
                                                  : "bg-gray-100 text-gray-600"
                                              }`}
                                            >
                                              {action}
                                            </button>
                                          ))}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                              <div className="flex justify-center mt-6">
                                <button className="text-blue-600 border border-blue-600 px-6 py-2 rounded-full font-semibold bg-white hover:bg-blue-50">
                                  Xem thêm lịch trình
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      {activeTab === "review" && (
                        <div>
                          {/* Nội dung Đánh giá ở đây */}
                          <div className="text-gray-500 text-center py-10">
                            Đây là tab Đánh giá.
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-start">
                    <BsThreeDots className="ml-4 w-3 h-3" />
                    <div className="flex items-center justify-center bg-stone-400 text-white rounded-3xl p-3 space-x-2">
                      <FaRegStar className="w-5 h-5 text-white" />
                      <p className="italic font-semibold">15 điểm đã đi</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Tabs */}
          <div className="w-[90%] mx-auto mt-32">
            <div className="flex border-b">
              <button
                className={`px-6 py-3 font-semibold ${
                  activeTab === "overview"
                    ? "border-b-2 border-blue-500 text-blue-600"
                    : "text-black-500"
                }`}
                onClick={() => setActiveTab("overview")}
              >
                Tổng quan
              </button>
              <button
                className={`px-6 py-3 font-semibold ${
                  activeTab === "itinerary"
                    ? "border-b-2 border-blue-500 text-blue-600"
                    : "text-black-500"
                }`}
                onClick={() => setActiveTab("itinerary")}
              >
                Lịch trình
              </button>
              <button
                className={`px-6 py-3 font-semibold ${
                  activeTab === "review"
                    ? "border-b-2 border-blue-500 text-blue-600"
                    : "text-black-500"
                }`}
                onClick={() => setActiveTab("review")}
              >
                Đánh giá
              </button>
            </div>

            {/* Nội dung từng tab */}
            {activeTab === "overview" && (
              <div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
                  {/* Left: Chuyến đi gần đây + Lịch trình */}
                  <div className="lg:col-span-2 space-y-8">
                    {/* Chuyến đi gần đây */}
                    <div className="bg-white rounded-xl shadow p-6">
                      <h3 className="font-bold text-lg mb-4">
                        Chuyến đi gần đây
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-semibold">
                                Hạ Long - Ninh Bình
                              </span>
                              <span className="flex items-center text-yellow-500">
                                <FaStar />
                                <FaStar />
                                <FaStar />
                                <FaStar />
                                <FaStar />
                              </span>
                            </div>
                            <div className="text-gray-500 text-sm">
                              15-18 Thg 1, 2024 · Tuyệt vời
                            </div>
                          </div>
                          <span className="text-gray-400">&gt;</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-semibold">
                                Hội An - Đà Nẵng
                              </span>
                              <span className="flex items-center text-yellow-500">
                                <FaStar />
                                <FaStar />
                                <FaStar />
                                <FaStar />
                                <FaRegStar />
                              </span>
                            </div>
                            <div className="text-gray-500 text-sm">
                              8-12 Thg 10, 2024 · Rất tốt
                            </div>
                          </div>
                          <span className="text-gray-400">&gt;</span>
                        </div>
                      </div>
                    </div>
                    {/* Lịch trình của tôi */}
                    <div className="bg-white rounded-xl shadow p-6">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-lg">
                          Lịch trình của tôi
                        </h3>
                        <button className="flex items-center bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm font-medium">
                          <HiOutlinePlus className="mr-1" /> Tạo mới
                        </button>
                      </div>
                      <div className="flex flex-col md:flex-row gap-4">
                        <div className="bg-gray-100 rounded-lg p-4 flex-1">
                          <div className="flex justify-between items-center">
                            <span className="font-semibold">
                              Sapa - Mù Cang Chải
                            </span>
                            <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">
                              Công khai
                            </span>
                          </div>
                          <div className="text-gray-500 text-sm mt-1">
                            4 ngày 3 đêm khám phá vùng núi Tây Bắc
                          </div>
                          <div className="flex items-center text-gray-400 text-xs mt-2">
                            <IoCalendarOutline className="mr-1" /> 20-23 Tháng
                            12
                            <span className="mx-2">·</span>
                            <span>24 lượt thích</span>
                          </div>
                        </div>
                        <div className="bg-gray-100 rounded-lg p-4 flex-1">
                          <div className="flex justify-between items-center">
                            <span className="font-semibold">
                              Phú Quốc Relax
                            </span>
                            <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs">
                              Nháp
                            </span>
                          </div>
                          <div className="text-gray-500 text-sm mt-1">
                            5 ngày nghỉ dưỡng tại đảo ngọc
                          </div>
                          <div className="flex items-center text-gray-400 text-xs mt-2">
                            <span>Chưa xác định</span>
                            <span className="mx-2">·</span>
                            <span>Đang soạn</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Right: Thống kê, Điểm đã ghé thăm, Thành tích */}
                  <div className="space-y-8">
                    {/* Thống kê */}
                    <div className="bg-white rounded-xl shadow p-6">
                      <h3 className="font-bold text-lg mb-4">Thống kê</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Tổng km đã đi</span>
                          <span className="font-bold text-lg">2,847 km</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Tỉnh/thành đã đến</span>
                          <span className="font-bold text-lg">12/63</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Điểm kinh nghiệm</span>
                          <span className="font-bold text-blue-600">
                            8,450 XP
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Lượt theo dõi</span>
                          <span className="font-bold">342</span>
                        </div>
                      </div>
                    </div>
                    {/* Điểm đã ghé thăm */}
                    <div className="bg-white rounded-xl shadow p-6">
                      <h3 className="font-bold text-lg mb-4">
                        Điểm đã ghé thăm
                      </h3>
                      <div className="space-y-2">
                        <div>
                          <span className="font-semibold">Hạ Long Bay</span>
                          <span className="text-gray-400 text-xs ml-2">
                            Quảng Ninh
                          </span>
                        </div>
                        <div>
                          <span className="font-semibold">Phố cổ Hội An</span>
                          <span className="text-gray-400 text-xs ml-2">
                            Quảng Nam
                          </span>
                        </div>
                        <div>
                          <span className="font-semibold">
                            Ruộng bậc thang Sapa
                          </span>
                          <span className="text-gray-400 text-xs ml-2">
                            Lào Cai
                          </span>
                        </div>
                        <a
                          href="#"
                          className="text-blue-600 text-sm mt-2 inline-block"
                        >
                          Xem tất cả (15)
                        </a>
                      </div>
                    </div>
                    {/* Thành tích */}
                    <div className="bg-white rounded-xl shadow p-6">
                      <h3 className="font-bold text-lg mb-4">Thành tích</h3>
                      <div className="flex space-x-4">
                        <div className="flex flex-col items-center">
                          <div className="bg-yellow-100 rounded-full w-12 h-12 flex items-center justify-center mb-2">
                            <span className="text-yellow-500 text-2xl">⛰️</span>
                          </div>
                          <span className="text-xs text-gray-600">
                            Nhà leo núi
                          </span>
                        </div>
                        <div className="flex flex-col items-center">
                          <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mb-2">
                            <span className="text-blue-500 text-2xl">🧭</span>
                          </div>
                          <span className="text-xs text-gray-600">
                            Thủ lĩnh
                          </span>
                        </div>
                        <div className="flex flex-col items-center">
                          <div className="bg-green-100 rounded-full w-12 h-12 flex items-center justify-center mb-2">
                            <span className="text-green-500 text-2xl">🌏</span>
                          </div>
                          <span className="text-xs text-gray-600">
                            Nhà phiêu lưu
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {activeTab === "itinerary" && (
              <div>
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mt-8">
                  {/* Bộ lọc */}
                  <div className="bg-white rounded-xl shadow p-6 space-y-6">
                    <h3 className="font-bold text-lg mb-2">
                      Bộ lọc lịch trình
                    </h3>
                    <div>
                      <div className="font-semibold mb-1">Trạng thái</div>
                      <div className="space-y-1">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            className="mr-2"
                            defaultChecked
                          />
                          Tất cả
                        </label>
                        <label className="flex items-center">
                          <input type="checkbox" className="mr-2" />
                          Sắp tới
                        </label>
                        <label className="flex items-center">
                          <input type="checkbox" className="mr-2" />
                          Đang lên kế hoạch
                        </label>
                        <label className="flex items-center">
                          <input type="checkbox" className="mr-2" />
                          Đã hoàn thành
                        </label>
                      </div>
                    </div>
                    <div>
                      <div className="font-semibold mb-1">Thời gian</div>
                      <select className="w-full border rounded px-2 py-1 text-sm">
                        <option>Tất cả thời gian</option>
                      </select>
                    </div>
                    <div>
                      <div className="font-semibold mb-1">Địa điểm</div>
                      <select className="w-full border rounded px-2 py-1 text-sm">
                        <option>Tất cả địa điểm</option>
                      </select>
                    </div>
                    <button className="w-full bg-blue-600 text-white py-2 rounded font-semibold mt-2">
                      Áp dụng bộ lọc
                    </button>
                    {/* Thống kê */}
                    <div className="mt-6">
                      <h4 className="font-bold mb-2">Thống kê lịch trình</h4>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Tổng lịch trình</span>
                        <span>15</span>
                      </div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Sắp tới</span>
                        <span>3</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Đã hoàn thành</span>
                        <span>12</span>
                      </div>
                    </div>
                  </div>
                  {/* Danh sách lịch trình */}
                  <div className="lg:col-span-3">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-bold text-lg">Lịch trình của tôi</h3>
                      <button className="flex items-center bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm font-medium">
                        + Tạo lịch trình mới
                      </button>
                    </div>
                    <div className="space-y-4">
                      {itineraries.map((item) => (
                        <div
                          key={item.id}
                          className={`bg-white rounded-xl shadow p-6 border-l-4 ${
                            item.statusColor === "green"
                              ? "border-green-500"
                              : item.statusColor === "orange"
                              ? "border-orange-400"
                              : "border-blue-400"
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center mb-1">
                                {item.status === "Đã hoàn thành" && (
                                  <FaCheckCircle className="text-green-500 mr-2" />
                                )}
                                {item.status === "Sắp tới" && (
                                  <span className="w-3 h-3 rounded-full bg-orange-400 mr-2 inline-block"></span>
                                )}
                                {item.status === "Đang lên kế hoạch" && (
                                  <FaPlaneDeparture className="text-blue-400 mr-2" />
                                )}
                                <span className="font-semibold">
                                  {item.title}
                                </span>
                                <span
                                  className={`ml-2 text-xs px-2 py-1 rounded ${
                                    item.statusColor === "green"
                                      ? "bg-green-100 text-green-700"
                                      : item.statusColor === "orange"
                                      ? "bg-orange-100 text-orange-700"
                                      : "bg-blue-100 text-blue-700"
                                  }`}
                                >
                                  {item.status}
                                </span>
                              </div>
                              <div className="flex items-center text-gray-400 text-xs mb-1">
                                <IoCalendarOutline className="mr-1" />{" "}
                                {item.date}
                                <span className="mx-2">·</span>
                                <span>{item.location}</span>
                                <span className="mx-2">·</span>
                                <FaUserFriends className="mr-1" /> {item.people}{" "}
                                người
                              </div>
                              <div className="text-gray-500 text-sm mb-2">
                                {item.desc}
                              </div>
                              {/* Progress */}
                              <div className="flex items-center text-xs mb-1">
                                {item.status === "Đã hoàn thành" ? (
                                  <span className="text-green-600 font-semibold">
                                    Hoàn thành: 100%
                                  </span>
                                ) : (
                                  <>
                                    <span className="mr-2">
                                      Tiến độ: {item.progress}%
                                    </span>
                                    <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                                      <div
                                        className={`h-2 rounded-full ${
                                          item.statusColor === "green"
                                            ? "bg-green-500"
                                            : item.statusColor === "orange"
                                            ? "bg-orange-400"
                                            : "bg-blue-400"
                                        }`}
                                        style={{ width: `${item.progress}%` }}
                                      ></div>
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                            <div className="flex flex-col items-end space-y-2">
                              <BsThreeDots className="text-gray-400 cursor-pointer" />
                              <div className="flex space-x-2">
                                {item.actions.map((action, idx) => (
                                  <button
                                    key={idx}
                                    className={`px-3 py-1 rounded text-xs font-semibold ${
                                      action === "Xem chi tiết" ||
                                      action === "Tiếp tục lên kế hoạch"
                                        ? "bg-blue-50 text-blue-600"
                                        : action === "Đánh giá"
                                        ? "bg-yellow-50 text-yellow-600"
                                        : "bg-gray-100 text-gray-600"
                                    }`}
                                  >
                                    {action}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-center mt-6">
                      <button className="text-blue-600 border border-blue-600 px-6 py-2 rounded-full font-semibold bg-white hover:bg-blue-50">
                        Xem thêm lịch trình
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {activeTab === "review" && <MyReviewPage />}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default ProfilePage;
