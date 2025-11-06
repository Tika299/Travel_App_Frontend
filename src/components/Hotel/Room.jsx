import { FaSnowflake, FaWifi, FaTv, FaEye } from "react-icons/fa";
import { MdHotTub } from "react-icons/md";
const dataRooms = {
  rooms: [
    {
      name: "Phòng Deluxe",
      size: "30m²",
      bed: "Giường đôi",
      maxGuests: 2,
      pricePerNight: 1200000,
      amenities: [
        "Máy lạnh",
        "Nước nóng",
        "Wifi miễn phí",
        "TV màn hình phẳng",
      ],
    },
    {
      name: "Phòng Suite",
      size: "50m²",
      bed: "Giường king",
      maxGuests: 3,
      pricePerNight: 2500000,
      amenities: [
        "Máy lạnh",
        "Nước nóng",
        "Wifi miễn phí",
        "TV màn hình phẳng",
      ],
    },
    {
      name: "Phòng Presidential Suite",
      size: "80m²",
      bed: "2 giường king",
      maxGuests: 4,
      pricePerNight: 4800000,
      amenities: [
        "Máy lạnh",
        "Nước nóng",
        "Wifi miễn phí",
        "TV màn hình phẳng",
        "View biển",
      ],
    },
  ],
};
const amenityIcons = {
  "Máy lạnh": <FaSnowflake className="text-blue-500" />,
  "Nước nóng": <MdHotTub className="text-red-500" />,
  "Wifi miễn phí": <FaWifi className="text-indigo-500" />,
  "TV màn hình phẳng": <FaTv className="text-gray-600" />,
  "View biển": <FaEye className="text-cyan-600" />,
};
const AmenitiesList = ({ amenities }) => {
  return (
    <div className="flex flex-wrap gap-4">
      {amenities.map((item, index) => (
        <div
          key={index}
          className="flex items-center gap-2 text-sm text-gray-700"
        >
          {amenityIcons[item] ?? <span>❓</span>}
          <span>{item}</span>
        </div>
      ))}
    </div>
  );
};
export default function Room() {
  return (
    <div className="w-full p-4 mt-5 mx-auto max-w-7xl">
      <h2 className="text-2xl font-bold">Các loại phòng</h2>
      {dataRooms.rooms.map((room, index) => (
        <div
          key={index}
          className="my-5 border-2 border-neutral-300 rounded-lg shadow-md w-full p-2 hover:border-blue-400 cursor-pointer"
        >
          <div className="flex justify-between">
            <div>
              <h2 className="text-xl font-bold mb-2">{room.name}</h2>
              <p className="text-sm font-medium mb-1">
                <span>{room.size} • </span>
                <span>{room.bed} • </span>
                <span>Tối đa {room.maxGuests} người</span>
              </p>
              <div className="flex space-x-4">
                <AmenitiesList amenities={room.amenities} />
              </div>
            </div>
            <span>
              <p className="text-blue-600 text-md font-bold mr-3">
                {room.pricePerNight} VNĐ
              </p>
              <p className="text-end italic text-neutral-600">/đêm</p>
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
