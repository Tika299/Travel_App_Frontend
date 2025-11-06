import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { getAmenityIcon } from "../../../services/iconConfig";

const API_BASE_URL = "http://localhost:8000/";

export default function HotelEditRoom({ roomId, onCancel, onSubmit }) {
    // --- STATE ---
    const [form, setForm] = useState(null); // Bắt đầu với null để biết đang tải
    const [hotels, setHotels] = useState([]);
    const [allAmenities, setAllAmenities] = useState([]);
    const [selectedAmenities, setSelectedAmenities] = useState(new Set());

    // State riêng để quản lý ảnh
    const [existingImages, setExistingImages] = useState([]); // Ảnh đã có trên server
    const [newImages, setNewImages] = useState([]); // Ảnh mới người dùng chọn
    const [imagesToRemove, setImagesToRemove] = useState([]); // Danh sách ảnh cũ cần xóa

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);

    // --- DATA FETCHING ---
    useEffect(() => {
        const fetchInitialData = async () => {
            setLoading(true);
            try {
                // Sử dụng Promise.all để tải song song
                const [roomRes, hotelsRes, amenitiesRes] = await Promise.all([
                    axios.get(`${API_BASE_URL}api/hotel-rooms/${roomId}`),
                    axios.get(`${API_BASE_URL}api/hotels`),
                    axios.get(`${API_BASE_URL}api/amenities`)
                ]);

                // Xử lý dữ liệu phòng
                const roomData = roomRes.data.data;
                setForm({
                    hotel_id: roomData.hotel_id,
                    room_type: roomData.room_type,
                    price_per_night: roomData.price_per_night,
                    description: roomData.description || "",
                    room_area: roomData.room_area || "",
                    bed_type: roomData.bed_type || "",
                    max_occupancy: roomData.max_occupancy || "",
                });
                setExistingImages(roomData.images || []);
                setSelectedAmenities(new Set(roomData.amenity_list.map(a => a.id)));

                // Xử lý dữ liệu hotels và amenities
                setHotels(hotelsRes.data.data || []);
                setAllAmenities(amenitiesRes.data.data || []);

            } catch (error) {
                console.error("Lỗi khi tải dữ liệu phòng:", error);
                alert("Không thể tải dữ liệu. Vui lòng thử lại.");
                onCancel(); // Quay về trang trước nếu có lỗi
            } finally {
                setLoading(false);
            }
        };

        if (roomId) {
            fetchInitialData();
        }
    }, [roomId, onCancel]);

    // --- HANDLERS ---
    const handleChange = useCallback((e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: undefined }));
    }, []);

    const handleAmenityChange = (amenityId) => {
        setSelectedAmenities(prev => {
            const newSelected = new Set(prev);
            if (newSelected.has(amenityId)) newSelected.delete(amenityId);
            else newSelected.add(amenityId);
            return newSelected;
        });
    };

    const handleAddNewFiles = useCallback((e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            setNewImages(prev => [...prev, ...files]);
        }
    }, []);

    const handleRemoveNewImage = useCallback((indexToRemove) => {
        setNewImages(prev => prev.filter((_, index) => index !== indexToRemove));
    }, []);

    const handleRemoveExistingImage = useCallback((imagePath) => {
        // Thêm vào danh sách chờ xóa
        setImagesToRemove(prev => [...prev, imagePath]);
        // Xóa khỏi danh sách hiển thị
        setExistingImages(prev => prev.filter(img => img !== imagePath));
    }, []);


    // --- FORM SUBMISSION ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        const fd = new FormData();

        // Thêm trường _method để Laravel hiểu đây là request PUT
        fd.append('_method', 'PUT');

        // Thêm các trường dữ liệu văn bản vào FormData
        Object.entries(form).forEach(([key, value]) => {
            if (value !== "" && value !== null) fd.append(key, value);
        });

        // Thêm các file ảnh mới
        newImages.forEach(file => {
            fd.append('images[]', file);
        });

        // Thêm danh sách ảnh cũ cần xóa (dưới dạng JSON)
        if (imagesToRemove.length > 0) {
            fd.append('images_to_remove', JSON.stringify(imagesToRemove));
        }

        // Thêm các tiện ích (dưới dạng JSON)
        fd.append('amenity_ids', JSON.stringify(Array.from(selectedAmenities)));

        try {
            // onSubmit được truyền từ component cha, trỏ đến hàm gọi API
            await onSubmit(roomId, fd);
        } catch (err) {
            const backendErrors = err.response?.data?.errors || {};
            setErrors(backendErrors);
            alert("Lỗi cập nhật phòng. Vui lòng kiểm tra lại thông tin.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- RENDER ---
    if (loading) {
        return <div className="p-6">Đang tải thông tin phòng...</div>;
    }

    if (!form) {
        return <div className="p-6">Không tìm thấy thông tin phòng.</div>;
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6 p-6 bg-white rounded shadow">
            <Section title="Chỉnh sửa thông tin phòng" icon="fas fa-edit">
                <Select
                    label={<>Khách sạn <span className="text-red-500">*</span></>}
                    name="hotel_id"
                    value={form.hotel_id}
                    onChange={handleChange}
                    options={[
                        { value: "", label: "--- Chọn khách sạn ---" },
                        ...hotels.map(hotel => ({ value: hotel.id, label: hotel.name }))
                    ]}
                />
                <Input name="room_type" label="Tên phòng" value={form.room_type} onChange={handleChange} />
                <Input name="price_per_night" label="Giá mỗi đêm" type="number" value={form.price_per_night} onChange={handleChange} />
                <Textarea name="description" label="Mô tả" value={form.description} onChange={handleChange} />
                <Input name="room_area" label="Diện tích phòng (m²)" type="number" value={form.room_area} onChange={handleChange} />
                <Input name="bed_type" label="Loại giường" value={form.bed_type} onChange={handleChange} />
                <Input name="max_occupancy" label="Sức chứa tối đa" type="number" value={form.max_occupancy} onChange={handleChange} />
            </Section>

            <Section title="Tiện ích" icon="fas fa-concierge-bell">
                <div className="md:col-span-2">
                    <Label>Tiện ích</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-2">
                        {allAmenities.map((amenity) => {
                            const IconComponent = getAmenityIcon(amenity.react_icon);
                            return (
                                <label key={amenity.id} className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        checked={selectedAmenities.has(amenity.id)}
                                        onChange={() => handleAmenityChange(amenity.id)}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    {IconComponent && <IconComponent className="h-4 w-4 text-blue-400" />}
                                    <span className="text-sm text-gray-700">{amenity.name}</span>
                                </label>
                            );
                        })}
                    </div>
                </div>
            </Section>

            <Section title="Hình ảnh" icon="fas fa-image">
                <DropZone
                    existingImages={existingImages}
                    newImages={newImages}
                    onFileChange={handleAddNewFiles}
                    onRemoveNew={handleRemoveNewImage}
                    onRemoveExisting={handleRemoveExistingImage}
                />
            </Section>

            <div className="flex justify-end gap-4">
                <button type="button" onClick={onCancel} className="btn border px-4 py-2 rounded-md hover:bg-gray-100">Huỷ</button>
                <button type="submit" disabled={isSubmitting} className="btn bg-blue-600 text-white px-4 py-2 rounded-md disabled:bg-blue-300">
                    {isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
            </div>
        </form>
    );
}

// --- UI Components ---
// Các component UI này được thiết kế để có thể tái sử dụng, tương tự file HotelCreateRoom.
const Section = ({ title, icon, children }) => (
    <section className="space-y-6 border-b last:border-0 pb-6 mb-6">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-800"><i className={`${icon} text-blue-500`} /> {title}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{children}</div>
    </section>
);

const Label = ({ children }) => <label className="block text-sm font-medium text-gray-700">{children}</label>;

const Input = ({ label, name, ...rest }) => (
    <div className="space-y-1">
        {label && <Label>{label}</Label>}
        <input {...rest} name={name} className="w-full rounded-md border border-gray-300 p-2 text-sm focus:border-blue-500 focus:ring-blue-500" />
    </div>
);

const Textarea = ({ label, name, ...rest }) => (
    <div className="space-y-1 md:col-span-2">
        {label && <Label>{label}</Label>}
        <textarea {...rest} name={name} rows={4} className="w-full rounded-md border border-gray-300 p-3 text-sm focus:border-blue-500 focus:ring-blue-500" />
    </div>
);

const Select = ({ label, name, options, ...rest }) => (
    <div className="space-y-1">
        {label && <Label>{label}</Label>}
        <select {...rest} name={name} className="w-full rounded-md border border-gray-300 p-2 text-sm focus:border-blue-500 focus:ring-blue-500">
            {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
    </div>
);

// Component DropZone nâng cấp để xử lý cả ảnh cũ và ảnh mới
const DropZone = ({ existingImages, newImages, onFileChange, onRemoveNew, onRemoveExisting }) => {
    const allImageCount = (existingImages?.length || 0) + (newImages?.length || 0);

    return (
        <div className="md:col-span-2">
            <div className="flex flex-col items-center justify-center rounded-md border-2 border-dashed border-gray-300 p-6 text-center">
                {allImageCount > 0 ? (
                    <div className="w-full">
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-4">
                            {/* Hiển thị ảnh cũ */}
                            {existingImages.map((imageUrl) => (
                                <div key={imageUrl} className="group relative aspect-square">
                                    <img src={`${API_BASE_URL}${imageUrl}`} alt="Existing" className="h-full w-full object-cover rounded-md" />
                                    <button type="button" onClick={() => onRemoveExisting(imageUrl)} className="absolute right-1 top-1 rounded-full bg-red-600 p-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                                        <i className="fas fa-times" />
                                    </button>
                                </div>
                            ))}
                            {/* Hiển thị preview ảnh mới */}
                            {newImages.map((file, index) => (
                                <div key={index} className="group relative aspect-square">
                                    <img src={URL.createObjectURL(file)} alt={`preview ${index}`} className="h-full w-full object-cover rounded-md" onLoad={() => URL.revokeObjectURL(file.src)} />
                                    <button type="button" onClick={() => onRemoveNew(index)} className="absolute right-1 top-1 rounded-full bg-red-600 p-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                                        <i className="fas fa-times" />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <label htmlFor="file-upload-more" className="cursor-pointer text-sm text-blue-600 hover:underline">+ Thêm ảnh khác</label>
                        <input id="file-upload-more" type="file" accept="image/*" multiple onChange={onFileChange} className="hidden" />
                    </div>
                ) : (
                    <>
                        <i className="fas fa-cloud-upload-alt text-5xl text-gray-400" />
                        <p className="mt-3 text-sm text-gray-600">Kéo và thả ảnh vào đây hoặc</p>
                        <label htmlFor="file-upload" className="cursor-pointer text-sm text-blue-600 hover:underline">Duyệt ảnh từ thiết bị</label>
                        <input id="file-upload" type="file" accept="image/*" multiple onChange={onFileChange} className="hidden" />
                    </>
                )}
            </div>
        </div>
    );
};