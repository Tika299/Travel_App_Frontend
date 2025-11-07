import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { getAmenityIcon } from "../../../services/iconConfig";
// Giữ nguyên initialForm


export default function HotelCreateRoom({ onCancel, onSubmit, hotelId = "" }) {

    const initialForm = {
        hotel_id: hotelId,
        room_type: "",
        price_per_night: "",
        description: "",
        room_area: "",
        bed_type: "",
        max_occupancy: "",
        images: [],
    };
    // --- STATE ---
    const [form, setForm] = useState(initialForm);
    const [hotels, setHotels] = useState([]);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // BƯỚC 1: Thêm state cho tiện ích
    const [allAmenities, setAllAmenities] = useState([]);
    const [selectedAmenities, setSelectedAmenities] = useState(new Set());


    // 3. Dùng useEffect để lấy danh sách khách sạn khi component được tải
    useEffect(() => {
        const fetchHotels = async () => {
            try {
                const res = await axios.get("https://travel-app-api-ws77.onrender.com/api/hotels");
                setHotels(res.data.data);
            } catch (error) {
                console.error("Lỗi khi tải danh sách khách sạn", error);
                alert("Không thể tải danh sách khách sạn.");
            }
        };

        // BƯỚC 2: Lấy danh sách tất cả tiện ích
        const fetchAllAmenities = async () => {
            try {
                const res = await axios.get("https://travel-app-api-ws77.onrender.com/api/amenities");
                setAllAmenities(res.data.data || []);
            } catch (error) {
                console.error("Lỗi khi tải danh sách tiện ích", error);
            }
        };
        fetchHotels();
        fetchAllAmenities();
    }, []); // Mảng rỗng đảm bảo chỉ gọi 1 lần


    // --- HANDLERS ---

    const handleChange = useCallback((e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: undefined }));
    }, []);

    // BƯỚC 2: Cập nhật handleFile để xử lý nhiều ảnh
    const handleFile = useCallback((e) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            // Gộp ảnh mới chọn với ảnh đã có (nếu muốn) hoặc thay thế
            setForm((p) => ({ ...p, images: [...p.images, ...Array.from(files)] }));
        }
    }, []);

    // BƯỚC 3: Thêm hàm xóa một ảnh khỏi danh sách
    const handleRemoveFile = useCallback((indexToRemove) => {
        setForm(p => ({
            ...p,
            images: p.images.filter((_, index) => index !== indexToRemove)
        }));
    }, []);

    // BƯỚC 3: Thêm handler để xử lý việc chọn tiện ích
    const handleAmenityChange = (amenityId) => {
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

    const validateForm = () => {
        const newErrors = {};
        if (!form.hotel_id) newErrors.hotel_id = "Vui lòng chọn một khách sạn.";
        if (!form.room_type.trim()) newErrors.room_type = "Loại phòng không được để trống.";
        if (!form.price_per_night || isNaN(form.price_per_night)) newErrors.price_per_night = "Giá phải là một số hợp lệ.";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            alert("Vui lòng điền đầy đủ thông tin bắt buộc!");
            return;
        }

        setIsSubmitting(true);
        const fd = new FormData();

        // 1. Thêm các trường dữ liệu văn bản vào FormData
        // Vòng lặp này sẽ bỏ qua trường 'images'
        Object.entries(form).forEach(([key, value]) => {
            if (key !== 'images' && value !== "" && value !== null) {
                fd.append(key, value);
            }
        });

        // 2. Xử lý và thêm mảng file ảnh một cách chính xác
        // Logic này đảm bảo gửi đúng định dạng mảng cho Laravel
        if (form.images && form.images.length > 0) {
            form.images.forEach(file => {
                // Quan trọng: Sử dụng 'images[]' để PHP hiểu đây là một mảng
                fd.append('images[]', file);
            });
        }

        // 3. Thêm các tiện ích (giữ nguyên)
        fd.append('amenity_ids', JSON.stringify(Array.from(selectedAmenities)));

        // =================================================================
        // ===== BƯỚC DEBUG: Thêm đoạn code này vào =======================
        console.log("--- KIỂM TRA DỮ LIỆU FORMDATA TRƯỚC KHI GỬI ---");
        for (let [key, value] of fd.entries()) {
            console.log(key, value);
        }
        console.log("-------------------------------------------------");
        // =================================================================

        // 4. Gửi dữ liệu đi
        try {
            await onSubmit(fd);
        } catch (err) {
            // Log lỗi chi tiết từ backend để dễ gỡ lỗi
            console.error("Lỗi chi tiết từ server:", err.response?.data);

            const backendErrors = err.response?.data?.errors || {};
            setErrors(backendErrors);

            // Hiển thị thông báo lỗi cụ thể hơn
            if (backendErrors.images) {
                alert(`Lỗi hình ảnh: ${backendErrors.images[0]}`);
            } else {
                alert("Lỗi tạo phòng. Vui lòng kiểm tra lại thông tin đã nhập.");
            }
        } finally {
            setIsSubmitting(false);
        }
    };


    // --- RENDER ---
    return (
        <form onSubmit={handleSubmit} className="space-y-6 p-6 bg-white rounded shadow">
            <Section title="Thông tin phòng" icon="fas fa-bed">
                {/* 5. Thay thế Input bằng Select cho hotel_id */}
                <Select
                    label={
                        <>
                            Khách sạn <span className="text-red-500">*</span>
                        </>
                    }
                    name="hotel_id"
                    value={form.hotel_id}
                    onChange={handleChange}
                    options={[
                        { value: "", label: "--- Chọn khách sạn ---" },
                        ...hotels.map(hotel => ({
                            value: hotel.id,
                            label: `${hotel.name}`
                        }))
                    ]}
                />
                {errors.hotel_id && <p className="text-red-500 text-sm">{errors.hotel_id}</p>}

                <Input name="room_type" label={<>Tên phòng <span className="text-red-500">*</span></>} value={form.room_type} onChange={handleChange} />
                {errors.room_type && <p className="text-red-500 text-sm">{errors.room_type}</p>}

                <Input name="price_per_night" label={<>Giá mỗi đêm <span className="text-red-500">*</span></>} type="number" value={form.price_per_night} onChange={handleChange} />
                {errors.price_per_night && <p className="text-red-500 text-sm">{errors.price_per_night}</p>}

                <Textarea name="description" label="Mô tả" value={form.description} onChange={handleChange} />
                <Input name="room_area" label="Diện tích phòng (m²)" type="number" value={form.room_area} onChange={handleChange} />
                <Input name="bed_type" label="Loại giường" value={form.bed_type} onChange={handleChange} />
                <Input name="max_occupancy" label="Sức chứa tối đa" type="number" value={form.max_occupancy} onChange={handleChange} />
            </Section>

            {/* BƯỚC 5: Thêm Section mới để chọn tiện ích */}
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


            {/* Phần hình ảnh và nút bấm giữ nguyên */}
            <Section title="Hình ảnh" icon="fas fa-image">
                {/* BƯỚC 5: Truyền các props mới vào DropZone */}
                <DropZone files={form.images} onChange={handleFile} onRemoveFile={handleRemoveFile} />

            </Section>

            <div className="flex justify-end gap-4">
                <button type="button" onClick={onCancel} className="btn border px-4 py-2 rounded-md hover:bg-gray-100">Huỷ</button>
                <button type="submit" disabled={isSubmitting} className="btn bg-blue-600 text-white px-4 py-2 rounded-md disabled:bg-blue-300">
                    {isSubmitting ? "Đang lưu..." : "Lưu phòng"}
                </button>
            </div>
        </form>
    );
}

/* ----------------------- Các component UI cơ bản (giữ nguyên không đổi) ------------------------ */
const Section = ({ title, icon, children, iconColor = "text-blue-500" }) => (
    <section className="space-y-6 border-b last:border-0 pb-6 mb-6">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-800">
            <i className={`${icon} ${iconColor}`} /> {title}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{children}</div>
    </section>
);

const Label = ({ children }) => (
    <label className="block text-sm font-medium text-gray-700">{children}</label>
);

const Input = ({ label, name, ...rest }) => (
    <div className="space-y-1">
        {label && <Label>{label}</Label>}
        <input
            {...rest}
            name={name}
            className="w-full rounded-md border border-gray-300 p-2 text-sm focus:border-blue-500 focus:ring-blue-500"
        />
    </div>
);

const Textarea = ({ label, name, ...rest }) => (
    <div className="space-y-1 md:col-span-2">
        {label && <Label>{label}</Label>}
        <textarea
            {...rest}
            name={name}
            rows={4}
            className="w-full rounded-md border border-gray-300 p-3 text-sm focus:border-blue-500 focus:ring-blue-500"
        />
    </div>
);

const Select = ({ label, name, options, ...rest }) => (
    <div className="space-y-1">
        {label && <Label>{label}</Label>}
        <select
            {...rest}
            name={name}
            className="w-full rounded-md border border-gray-300 p-2 text-sm focus:border-blue-500 focus:ring-blue-500"
        >
            {options.map((o) => (
                <option key={o.value} value={o.value}>
                    {o.label}
                </option>
            ))}
        </select>
    </div>
);

// BƯỚC 6: Nâng cấp component DropZone để hiển thị nhiều ảnh
const DropZone = ({ files, onChange, onRemoveFile }) => {
    return (
        <div className="md:col-span-2">
            <div className="flex flex-col items-center justify-center rounded-md border-2 border-dashed border-gray-300 p-6 text-center">
                {files && files.length > 0 ? (
                    <div className="w-full">
                        {/* Grid để hiển thị ảnh preview */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-4">
                            {files.map((file, index) => (
                                <div key={index} className="group relative aspect-square">
                                    <img
                                        src={URL.createObjectURL(file)}
                                        alt={`preview ${index}`}
                                        className="h-full w-full object-cover rounded-md"
                                        onLoad={() => URL.revokeObjectURL(file.src)} // Dọn dẹp memory
                                    />
                                    <button
                                        type="button"
                                        onClick={() => onRemoveFile(index)}
                                        className="absolute right-1 top-1 rounded-full bg-red-600 p-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100"
                                    >
                                        <i className="fas fa-times" />
                                    </button>
                                </div>
                            ))}
                        </div>
                        {/* Nút để thêm ảnh khác */}
                        <label htmlFor="file-upload-more" className="cursor-pointer text-sm text-blue-600 hover:underline">
                            + Thêm ảnh khác
                        </label>
                        <input id="file-upload-more" type="file" accept="image/*" multiple onChange={onChange} className="hidden" />
                    </div>
                ) : (
                    <>
                        <i className="fas fa-cloud-upload-alt text-5xl text-gray-400" />
                        <p className="mt-3 text-sm text-gray-600">Kéo và thả ảnh vào đây hoặc</p>
                        <label htmlFor="file-upload" className="cursor-pointer text-sm text-blue-600 hover:underline">
                            Duyệt ảnh từ thiết bị
                        </label>
                        {/* Thêm 'multiple' vào đây */}
                        <input id="file-upload" type="file" accept="image/*" multiple onChange={onChange} className="hidden" />
                    </>
                )}
            </div>
        </div>
    );
};