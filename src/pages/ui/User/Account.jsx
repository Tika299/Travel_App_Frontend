import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil } from "lucide-react";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";

const Account = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    navigate("/login");
                    return;
                }

                const response = await fetch("http://localhost:8000/api/user", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!response.ok) throw new Error("Không thể lấy thông tin người dùng");

                const data = await response.json();
                setUser(data);
                localStorage.setItem("user", JSON.stringify(data)); // optional: cập nhật localStorage
            } catch (error) {
                console.error("Lỗi khi tải user:", error);
                navigate("/login");
            }
        };

        fetchUser();
    }, [navigate]);

    const handleEdit = () => {
        navigate("/edit-account");
    };

    if (!user) return null;

    return (
        <>
            <Header />
            <button
                onClick={() => navigate("/profile")}
                className="mb-4 inline-flex items-center px-4 py-2 bg-gray-200 hover:bg-gray-300 text-sm rounded"
            >
                ← Quay lại hồ sơ
            </button>

            <div className="mt-8 px-4 md:px-0">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-2xl font-bold mb-2">Cài đặt tài khoản</h2>
                    <p className="text-gray-600 mb-8">Quản lý thông tin cá nhân và tùy chọn tài khoản của bạn</p>

                    <div className="bg-white rounded-xl shadow-sm border p-8">
                        <h3 className="text-lg font-semibold mb-6">Thông tin cá nhân</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Họ và tên</label>
                                <div className="relative">
                                    <input type="text" value={user.name} readOnly className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100" />
                                    <Pencil onClick={handleEdit} className="absolute top-3 right-3 h-4 w-4 text-gray-500 cursor-pointer" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                <div className="relative">
                                    <input type="email" value={user.email} readOnly className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100" />
                                    <Pencil onClick={handleEdit} className="absolute top-3 right-3 h-4 w-4 text-gray-500 cursor-pointer" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại</label>
                                <div className="relative">
                                    <input type="tel" value={user.phone} readOnly className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100" />
                                    <Pencil onClick={handleEdit} className="absolute top-3 right-3 h-4 w-4 text-gray-500 cursor-pointer" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Ngày tạo tài khoản</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={
                                            user.created_at
                                                ? new Date(user.created_at.replace(" ", "T")).toLocaleDateString("vi-VN")
                                                : "Không có dữ liệu"
                                        }
                                        readOnly
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100"
                                    />
                                    <Pencil onClick={handleEdit} className="absolute top-3 right-3 h-4 w-4 text-gray-500 cursor-pointer" />
                                </div>
                            </div>
                        </div>

                        <div className="mb-8">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Thêm mô tả (bio)</label>
                            <div className="relative">
                                <input type="text" value={user.bio || ""} readOnly className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100" />
                                <Pencil onClick={handleEdit} className="absolute top-3 right-3 h-4 w-4 text-gray-500 cursor-pointer" />
                            </div>
                        </div>

                        <div className="mb-8">
                            <label className="block text-sm font-medium text-gray-700 mb-4">Ảnh đại diện</label>
                            <div className="flex items-center space-x-6">
                                <img src={user.avatar} alt="avatar" className="w-24 h-24 rounded-full border-4 border-gray-200" />
                                <button className="text-blue-500 text-sm underline" onClick={() => navigate('/edit-account')}>Chọn ảnh đại diện mới</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </>
    );
};

export default Account;
