import { FaLocationDot } from "react-icons/fa6";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";
import hotel_1 from "../../assets/images/hotel/hotel_1.jpg";
import hotel_2 from "../../assets/images/hotel/hotel_2.jpg";
import hotel_3 from "../../assets/images/hotel/hotel_3.jpg";
import hotel_4 from "../../assets/images/hotel/hotel_4.jpg";
import hotel_5 from "../../assets/images/hotel/hotel_5.jpg";
import { MessageCircle, Phone } from "lucide-react";
import React, { useState } from "react";

const dataHotel = {
  hotel: {
    name: "Khách sạn Hạ Long Palace",
    rating: 3,
    review_count: 324,
    price_per_night_vnd: 1850000,
    location: "Bãi Cháy, Thành phố Hạ Long, Quảng Ninh",
    description:
      "Khách sạn Hạ Long Palace là một trong những khách sạn 5 sao hàng đầu tại Hạ Long, tọa lạc tại vị trí đắc địa ngay trung tâm thành phố với tầm nhìn panorama tuyệt đẹp ra Vịnh Hạ Long.\n\nVới thiết kế hiện đại kết hợp nét truyền thống Việt Nam, khách sạn mang đến không gian nghỉ dưỡng sang trọng và đầy đủ tiện nghi. Các phòng được trang bị nội thất cao cấp, ban công riêng với view biển tuyệt đẹp.",
    images: {
      main: hotel_1,
      others: [hotel_2, hotel_3, hotel_4, hotel_5],
    },
    contact: {
      phone_button_label: "052251253",
      message_button_label: "Nhắn tin quản lý",
    },
  },
};

const StarRating = ({ rating }) => {
  const stars = [];

  for (let i = 1; i <= 5; i++) {
    if (rating >= i) {
      stars.push(<FaStar key={i} className="text-yellow-400" />);
    } else if (rating >= i - 0.5) {
      stars.push(<FaStarHalfAlt key={i} className="text-yellow-400" />);
    } else {
      stars.push(<FaRegStar key={i} className="text-yellow-400" />);
    }
  }
  return stars;
};

export default function HotelDetail() {
  const [showPhone, setShowPhone] = useState(false);

  const handleTogglePhone = () => {
    setShowPhone((prev) => !prev);
  };
  return (
    <div className="w-full p-4 mt-5 mx-auto max-w-7xl">
      {/* Thông tin khách sạn */}
      <div className="flex justify-between">
        <div className="flex-col space-y-1.5">
          <h2 className="text-2xl font-bold">{dataHotel.hotel.name}</h2>
          <p className="flex space-x-2 items-center">
            <span className="flex items-center space-x-0.5 mr-1">
              <StarRating rating={dataHotel.hotel.rating} />
            </span>
            <span className="text-sm text-neutral-600 italic">
              ({dataHotel.hotel.review_count} đánh giá)
            </span>
          </p>
          <p className="text-sm font-medium flex items-center">
            <FaLocationDot className="text-red-600 mr-1" />{" "}
            {dataHotel.hotel.location}
          </p>
        </div>
        <div className="text-center flex-col items-center justify-center">
          <p className="text-start text-blue-400 font-bold">
            {dataHotel.hotel.price_per_night_vnd} VNĐ
          </p>
          <p className="text-end italic text-sm text-gray-400">/đêm</p>
        </div>
      </div>

      {/* Hình ảnh khách sạn */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 my-8">
        <div className="md:col-span-2">
          <img
            src={dataHotel.hotel.images.main}
            alt="Main Hotel"
            className="w-full h-[600px] object-cover rounded-xl"
          />
        </div>

        <div className="grid grid-cols-2 grid-rows-2 gap-4">
          {dataHotel.hotel.images.others.map((img, index) => (
            <img
              key={index}
              src={img}
              alt={`Hotel ${index + 1}`}
              className="w-full h-[290px] object-cover rounded-xl border-2 hover:border-blue-400 transition-all"
            />
          ))}
        </div>
      </div>

      {/* Mô tả khách sạn */}
      <div className="w-full">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Mô tả khách sạn</h2>
          <div className="flex space-x-4 items-center">
            <button
              className="flex space-x-2 bg-blue-400 px-6 py-2 rounded-md text-white hover:shadow-md
               hover:font-medium transition-all duration-100"
              onClick={handleTogglePhone}
            >
              <Phone />
              {showPhone ? (
                <span>{dataHotel.hotel.contact.phone_button_label}</span>
              ) : (
                <span>Liên hệ</span>
              )}
            </button>
            <button
              className="flex space-x-2 bg-green-500 px-6 py-2 rounded-md text-white hover:shadow-md
               hover:font-medium transition-all duration-100"
            >
              <MessageCircle />
              <span>Nhắn tin quản lý</span>
            </button>
          </div>
        </div>
        <div className="mt-5 ml-5 max-w-5xl text-gray-700 leading-relaxed text-justify ">
          <span>
            {dataHotel.hotel.description.split("\n").map((line, index) => (
              <React.Fragment key={index}>
                {line}
                <br />
              </React.Fragment>
            ))}
          </span>
        </div>
      </div>
    </div>
  );
}
