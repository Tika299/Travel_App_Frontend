import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

function ManageRoomAmenities({ roomId, onComplete }) {
    const [allAmenities, setAllAmenities] = useState([]);
    const [selectedAmenities, setSelectedAmenities] = useState(new Set());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    // Lấy tất cả tiện ích có sẵn và các tiện ích đã được chọn cho phòng này
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError('');
            try {
                // Gọi API lấy tất cả tiện ích
                const allAmenitiesRes = await axios.get(`${API_BASE_URL}/amenities`);
                setAllAmenities(allAmenitiesRes.data.data || []);

                // Gọi API lấy các tiện ích đã có của phòng
                const roomAmenitiesRes = await axios.get(`${API_BASE_URL}/amenities/room/${roomId}`);
                const initialSelectedIds = new Set(
                    (roomAmenitiesRes.data.data || []).map(a => a.id)
                );
                setSelectedAmenities(initialSelectedIds);

            } catch (err) {
                console.error("Lỗi khi tải dữ liệu tiện ích:", err);
                setError('Không thể tải dữ liệu. Vui lòng thử lại.');
            } finally {
                setLoading(false);
            }
        };

        if (roomId) {
            fetchData();
        }
    }, [roomId]);

    // Xử lý khi người dùng check/uncheck một tiện ích
    const handleCheckboxChange = (amenityId) => {
        setSelectedAmenities(prevSelected => {
            const newSelected = new Set(prevSelected);
            if (newSelected.has(amenityId)) {
                newSelected.delete(amenityId);
            } else {
                newSelected.add(amenityId);
            }
            return newSelected;
        });
    };

    // Xử lý khi nhấn nút lưu
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setError('');
        try {
            await axios.post(`${API_BASE_URL}/rooms/${roomId}/amenities`, {
                amenity_ids: Array.from(selectedAmenities), // Gửi mảng các ID đã chọn
            });
            alert('Cập nhật tiện ích thành công!');
            if (onComplete) onComplete(); // Gọi hàm callback nếu có
        } catch (err) {
            console.error("Lỗi khi lưu tiện ích:", err);
            setError('Lưu thất bại. Vui lòng thử lại.');
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) return <div>Đang tải danh sách tiện ích...</div>;
    if (error) return <div className="text-red-500">{error}</div>;

    return (
        <div className="p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">Quản lý tiện ích cho phòng #{roomId}</h2>
            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
                    {allAmenities.map(amenity => (
                        <label key={amenity.id} className="flex items-center space-x-3 p-3 border rounded-md hover:bg-gray-50 cursor-pointer">
                            <input
                                type="checkbox"
                                className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                checked={selectedAmenities.has(amenity.id)}
                                onChange={() => handleCheckboxChange(amenity.id)}
                            />
                            <span className="text-gray-700">{amenity.name}</span>
                        </label>
                    ))}
                </div>
                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:bg-blue-300"
                    >
                        {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default ManageRoomAmenities;