import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-pink-50 text-gray-700 p-6">
      <h1 className="text-3xl font-bold text-pink-600 mb-6">🌸 Chào mừng bạn đến với hệ thống du lịch</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-xl">
        <Link
          to="/checkin-places"
          className="p-6 bg-white shadow-md rounded-lg hover:bg-pink-100 transition duration-300 text-center border"
        >
          <h2 className="text-xl font-semibold mb-2">📍 Địa điểm Check-in</h2>
          <p className="text-sm">Khám phá những điểm đến hấp dẫn</p>
        </Link>

        <Link
          to="/transport-companies"
          className="p-6 bg-white shadow-md rounded-lg hover:bg-pink-100 transition duration-300 text-center border"
        >
          <h2 className="text-xl font-semibold mb-2">🚍 Hãng vận chuyển</h2>
          <p className="text-sm">Tìm hiểu các hãng xe uy tín</p>
        </Link>
      </div>
    </div>
  );
};

export default HomePage;