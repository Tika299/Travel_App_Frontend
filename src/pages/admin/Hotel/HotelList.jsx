import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { FaEdit, FaTrash, FaBed, FaPlus, FaChevronDown, FaChevronRight, FaFileImport } from 'react-icons/fa';
import HotelEdit from './HotelEditForm';
import HotelCreate from './HotelCreateForm';
import HotelCreateRoom from './HotelCreateRoom';
import HotelEditRoom from './HotelEditRoom';
import AmenityCreate from './AmenityCreate';
import Pagination from "../../../components/Pagination";
import { deleteHotel, createHotel } from '../../../services/ui/Hotel/hotelService';

const API_BASE_URL = 'https://travel-app-api-ws77.onrender.com';

function HotelList() {
    const [hotels, setHotels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState('HotelList');
    const [selectedHotel, setSelectedHotel] = useState(null);
    const [selectedRoomId, setSelectedRoomId] = useState(null);
    const [expandedHotelId, setExpandedHotelId] = useState(null);
    const [rooms, setRooms] = useState([]);
    const [isRoomsLoading, setIsRoomsLoading] = useState(false);
    const [isImportLoading, setIsImportLoading] = useState(false);
    const [importMessage, setImportMessage] = useState('');
    const [pagination, setPagination] = useState({
        hotels: { currentPage: 1, totalPages: 1, perPage: 10 },
    });

    // Hàm giải mã JSON an toàn
    const parseImages = (images) => {
        if (!images) return [];
        if (Array.isArray(images)) return images;
        try {
            return JSON.parse(images) || [];
        } catch (e) {
            console.error("Lỗi giải mã JSON images:", e);
            return [];
        }
    };

    const fetchHotels = useCallback(async (pageNumber = 1) => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_BASE_URL}/api/hotels`, {
                params: {
                    page: pageNumber,
                    per_page: pagination.hotels.perPage
                }
            });
            const { data, current_page, last_page } = response.data;
            // Giải mã JSON cho images trước khi lưu vào state
            const parsedHotels = data.map(hotel => ({
                ...hotel,
                images: parseImages(hotel.images)
            }));
            setHotels(parsedHotels);
            setPagination(prev => ({
                hotels: {
                    ...prev.hotels,
                    currentPage: current_page,
                    totalPages: last_page
                }
            }));
        } catch (e) {
            console.error("Lỗi khi tải khách sạn", e);
            setImportMessage('Lỗi khi tải danh sách khách sạn');
        } finally {
            setLoading(false);
        }
    }, [pagination.hotels.perPage]);

    useEffect(() => {
        fetchHotels(pagination.hotels.currentPage);
    }, [fetchHotels, pagination.hotels.currentPage]);

    const handlePageChange = useCallback((pageNumber) => {
        setPagination(prev => ({
            hotels: {
                ...prev.hotels,
                currentPage: pageNumber
            }
        }));
    }, []);

    const handleToggleExpand = useCallback(async (hotelId) => {
        const newExpandedId = expandedHotelId === hotelId ? null : hotelId;
        setExpandedHotelId(newExpandedId);

        if (newExpandedId !== null) {
            setIsRoomsLoading(true);
            try {
                const res = await axios.get(`${API_BASE_URL}/api/hotels/${newExpandedId}/rooms`);
                // Giải mã JSON cho images của phòng
                const parsedRooms = res.data.data.map(room => ({
                    ...room,
                    images: parseImages(room.images)
                }));
                setRooms(parsedRooms);
            } catch (error) {
                console.error(`Lỗi khi tải phòng cho khách sạn ${newExpandedId}:`, error);
                setRooms([]);
            } finally {
                setIsRoomsLoading(false);
            }
        }
    }, [expandedHotelId]);

    const handleDelete = async (id) => {
        if (!window.confirm("Bạn có chắc muốn xóa khách sạn này?")) return;

        try {
            await deleteHotel(id);
            setHotels(prev => prev.filter(h => h.id !== id));
        } catch (error) {
            console.error("Lỗi khi xóa khách sạn", error);
            alert("Không thể xóa khách sạn.");
        }
    };

    const handleDeleteRoom = async (roomId) => {
        if (!window.confirm("Bạn có chắc muốn xóa phòng này?")) return;
        try {
            await axios.delete(`${API_BASE_URL}/api/hotel-rooms/${roomId}`);
            alert('Xóa phòng thành công!');
            setRooms(prev => prev.filter(r => r.id !== roomId));
        } catch (e) {
            alert("Không thể xóa phòng.");
            console.error("Lỗi xóa phòng:", e);
        }
    };

    const handleImportHotels = async (e) => {
        const file = e.target.files[0];
        if (!file) {
            setImportMessage('Vui lòng chọn file Excel');
            return;
        }

        setIsImportLoading(true);
        setImportMessage('');

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await axios.post(`${API_BASE_URL}/api/hotels/import`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setImportMessage(response.data.message);
            if (response.data.failed_images && response.data.failed_images.length > 0) {
                setImportMessage(prev => prev + '\nLỗi ảnh: ' + response.data.failed_images.join('; '));
            }
            await fetchHotels(pagination.hotels.currentPage);
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Lỗi khi import khách sạn.';
            setImportMessage(errorMsg);
        } finally {
            setIsImportLoading(false);
        }
    };

    const handleImportHotelRooms = async (e) => {
        const file = e.target.files[0];
        if (!file) {
            setImportMessage('Vui lòng chọn file Excel');
            return;
        }

        setIsImportLoading(true);
        setImportMessage('');

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await axios.post(`${API_BASE_URL}/api/hotel-rooms/import`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setImportMessage(response.data.message);
            if (response.data.failed_images && response.data.failed_images.length > 0) {
                setImportMessage(prev => prev + '\nLỗi ảnh: ' + response.data.failed_images.join('; '));
            }
            await fetchHotels(pagination.hotels.currentPage);
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Lỗi khi import phòng khách sạn.';
            setImportMessage(errorMsg);
        } finally {
            setIsImportLoading(false);
        }
    };

    const navigateTo = (pageName, params = {}) => {
        setSelectedHotel(params.hotel || null);
        setSelectedRoomId(params.roomId || null);
        setPage(pageName);
    };

    const submitCreateHotel = async (data) => {
        try {
            const res = await createHotel(data);
            setHotels(prev => [...prev, { ...res.data.data, images: parseImages(res.data.data.images) }]);
            alert("Thêm khách sạn thành công!");
            navigateTo("HotelList");
        } catch (e) {
            alert("Thêm thất bại");
        }
    };

    const submitCreateRoom = async (data) => {
        try {
            await axios.post(`${API_BASE_URL}/api/hotel-rooms`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
            alert("Thêm phòng thành công!");
            await handleToggleExpand(data.get('hotel_id'));
            navigateTo("HotelList");
        } catch (e) {
            console.error("Lỗi khi thêm phòng:", e.response?.data);
            throw e;
        }
    };

    const submitEditRoom = async (roomId, data) => {
        try {
            await axios.post(`${API_BASE_URL}/api/hotel-rooms/${roomId}`, data);
            alert("Cập nhật phòng thành công!");
            await handleToggleExpand(data.get('hotel_id'));
            navigateTo("HotelList");
        } catch (e) {
            console.error("Lỗi khi cập nhật phòng:", e.response?.data);
            throw e;
        }
    };

    const renderContent = () => {
        switch (page) {
            case 'HotelCreate':
                return <HotelCreate onSubmit={submitCreateHotel} onCancel={() => navigateTo('HotelList')} />;
            case 'HotelCreateRoom':
                return <HotelCreateRoom onSubmit={submitCreateRoom} onCancel={() => navigateTo('HotelList')} hotelId={selectedHotel?.id} />;
            case 'HotelEditRoom':
                return <HotelEditRoom roomId={selectedRoomId} onSubmit={submitEditRoom} onCancel={() => navigateTo('HotelList')} />;
            case 'HotelEdit':
                return <HotelEdit hotelData={selectedHotel} onSubmit={() => navigateTo('HotelList')} onCancel={() => navigateTo('HotelList')} />;
            case 'AmenityCreate':
                return <AmenityCreate onSubmit={() => navigateTo('HotelList')} onCancel={() => navigateTo('HotelList')} />;
            default:
                return <HotelTableView />;
        }
    };

    const HotelTableView = () => (
        <>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Quản lý khách sạn</h2>
                <div className="flex gap-2">
                    <button onClick={() => navigateTo('HotelCreate')} className="bg-blue-500 text-white px-4 py-2 rounded flex items-center">
                        <FaPlus className="mr-2" /> Thêm khách sạn
                    </button>
                    <button onClick={() => navigateTo('AmenityCreate')} className="bg-blue-500 text-white px-4 py-2 rounded flex items-center">
                        <FaPlus className="mr-2" /> Thêm tiện ích
                    </button>
                    <label className={`bg-green-500 text-white px-4 py-2 rounded flex items-center cursor-pointer ${isImportLoading ? 'opacity-50 pointer-events-none' : ''}`}>
                        <FaFileImport className="mr-2" /> {isImportLoading ? 'Đang import...' : 'Import Khách Sạn'}
                        <input type="file" accept=".xlsx,.xls" onChange={handleImportHotels} className="hidden" disabled={isImportLoading} />
                    </label>
                    <label className={`bg-green-600 text-white px-4 py-2 rounded flex items-center cursor-pointer ${isImportLoading ? 'opacity-50 pointer-events-none' : ''}`}>
                        <FaFileImport className="mr-2" /> {isImportLoading ? 'Đang import...' : 'Import Phòng'}
                        <input type="file" accept=".xlsx,.xls" onChange={handleImportHotelRooms} className="hidden" disabled={isImportLoading} />
                    </label>
                </div>
            </div>
            {importMessage && <p className={`mb-4 ${importMessage.includes('thành công') ? 'text-green-500' : 'text-red-500'}`}>{importMessage}</p>}
            {isImportLoading && (
                <div className="flex items-center justify-center mb-4">
                    <svg className="animate-spin h-5 w-5 mr-3 text-blue-500" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-blue-500">Đang xử lý file import...</p>
                </div>
            )}
            <div className="bg-white shadow-md rounded overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-200">
                        <tr>
                            <th className="p-3 w-8"></th>
                            <th className="p-3 text-left">Tên khách sạn</th>
                            <th className="p-3 text-left">Điện thoại</th>
                            <th className="p-3 text-left">Ngày tạo</th>
                            <th className="p-3 text-left">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="5" className="text-center p-4">Đang tải...</td></tr>
                        ) : hotels.map(hotel => {
                            console.log("Hotel:", hotel.images.length);
                            return (
                                <React.Fragment key={hotel.id}>
                                    <tr className="border-b hover:bg-gray-50">
                                        <td className="p-3 text-center">
                                            <button onClick={() => handleToggleExpand(hotel.id)} className="text-blue-500">
                                                {expandedHotelId === hotel.id ? <FaChevronDown /> : <FaChevronRight />}
                                            </button>
                                        </td>
                                        <td className="p-3 flex items-center">
                                            {hotel.images && hotel.images.length > 0 ? (
                                                <img
                                                    src={`${API_BASE_URL}/storage/${hotel.images[0]}`}
                                                    alt="Hotel"
                                                    className="w-12 h-12 rounded-md object-cover mr-4"
                                                />
                                            ) : (
                                                <img
                                                    src="https://via.placeholder.com/100x100?text=No+Image"
                                                    alt="No Image"
                                                    className="w-12 h-12 rounded-md object-cover mr-4"
                                                />
                                            )}
                                            <span>{hotel.name}</span>
                                        </td>
                                        <td className="p-3">{hotel.phone}</td>
                                        <td className="p-3">{new Date(hotel.created_at).toLocaleDateString()}</td>
                                        <td className="p-3">
                                            <button onClick={() => navigateTo('HotelEdit', { hotel })} className="text-blue-500 mr-4"><FaEdit /></button>
                                            <button onClick={() => handleDelete(hotel.id)} className="text-red-500"><FaTrash /></button>
                                        </td>
                                    </tr>
                                    {expandedHotelId === hotel.id && (
                                        <tr>
                                            <td colSpan="5" className="p-4 bg-gray-50">
                                                <RoomsTableView hotel={hotel} />
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            )
                        })}
                    </tbody>
                </table>
            </div>

            <Pagination
                currentPage={pagination.hotels.currentPage}
                totalPages={pagination.hotels.totalPages}
                onPageChange={handlePageChange}
            />
        </>
    );

    const RoomsTableView = ({ hotel }) => (
        <div className="pl-8">
            <div className="flex justify-between items-center mb-2">
                <h4 className="text-lg font-semibold text-gray-700">Danh sách phòng</h4>
                <button onClick={() => navigateTo('HotelCreateRoom', { hotel })} className="bg-green-500 text-white px-3 py-1 rounded text-sm flex items-center">
                    <FaPlus className="mr-1" /> Thêm phòng
                </button>
            </div>
            {isRoomsLoading ? <p>Đang tải danh sách phòng...</p> : (
                <table className="w-full bg-white rounded shadow-inner">
                    <thead className='bg-gray-100'>
                        <tr>
                            <th className="p-2 text-left">Ảnh</th>
                            <th className="p-2 text-left">Loại phòng</th>
                            <th className="p-2 text-left">Giá / đêm</th>
                            <th className="p-2 text-left">Sức chứa</th>
                            <th className="p-2 text-left">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rooms.length > 0 ? rooms.map(room => (
                            <tr key={room.id} className="border-b">
                                <td className="p-2">
                                    {room.images && room.images.length > 0 ? (
                                        <img
                                            src={`${API_BASE_URL}/storage/${room.images[0]}`}
                                            alt="Room"
                                            className="w-12 h-12 rounded-md object-cover"
                                            onError={(e) => { e.target.src = 'https://via.placeholder.com/100x100?text=No+Image'; }}
                                        />
                                    ) : (
                                        <img
                                            src="https://via.placeholder.com/100x100?text=No+Image"
                                            alt="No Image"
                                            className="w-12 h-12 rounded-md object-cover"
                                        />
                                    )}
                                </td>
                                <td className="p-2">{room.room_type}</td>
                                <td className="p-2">{room.price_per_night}</td>
                                <td className="p-2">{room.max_occupancy}</td>
                                <td className="p-2">
                                    <button onClick={() => navigateTo('HotelEditRoom', { roomId: room.id })} className="text-blue-500 mr-3"><FaEdit /></button>
                                    <button onClick={() => handleDeleteRoom(room.id)} className="text-red-500"><FaTrash /></button>
                                </td>
                            </tr>
                        )) : (
                            <tr><td colSpan="5" className="p-4 text-center text-gray-500">Khách sạn này chưa có phòng nào.</td></tr>
                        )}
                    </tbody>
                </table>
            )}
        </div>
    );

    return (
        <div className="flex h-screen bg-gray-100">
            <div className="flex-1 p-6 overflow-auto">
                {renderContent()}
            </div>
        </div>
    );
}

export default HotelList;