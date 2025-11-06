import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { createHotel } from "../../../services/ui/Hotel/hotelService";
import LocationSelectorMap from '../../../common/LocationSelectorMap';

const initialForm = {
    name: "",
    description: "",
    address: "",
    latitude: "",
    longitude: "",
    images: [],
    phone: "",
    email: "",
    website: "",
};

export default function HotelCreate({ onCancel, onSubmit }) {
    const navigate = useNavigate();
    const [form, setForm] = useState(initialForm);
    const [showMap, setShowMap] = useState(false);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [geocodeError, setGeocodeError] = useState(null);

    // Hàm gọi Google Maps Geocoding API để lấy tọa độ từ địa chỉ
    const geocodeAddress = useCallback(async (address) => {
        if (!address.trim()) {
            setGeocodeError(null);
            return;
        }

        try {
            const response = await fetch(
                `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=AIzaSyCjBOhlC7914uPrWPffPIHZO8mTzcgtkow`
            );
            const data = await response.json();

            if (data.status === "OK" && data.results.length > 0) {
                const { lat, lng } = data.results[0].geometry.location;
                setForm((prev) => ({
                    ...prev,
                    latitude: lat.toFixed(6),
                    longitude: lng.toFixed(6),
                }));
                setShowMap(true);
                setGeocodeError(null);
            } else {
                setGeocodeError("Không tìm thấy tọa độ cho địa chỉ này.");
                setForm((prev) => ({
                    ...prev,
                    latitude: "",
                    longitude: "",
                }));
                setShowMap(false);
            }
        } catch (error) {
            console.error("Lỗi khi gọi Geocoding API:", error);
            setGeocodeError("Có lỗi khi lấy tọa độ. Vui lòng thử lại.");
            setForm((prev) => ({
                ...prev,
                latitude: "",
                longitude: "",
            }));
            setShowMap(false);
        }
    }, []);

    // Gọi geocodeAddress khi địa chỉ thay đổi
    useEffect(() => {
        const timeout = setTimeout(() => {
            geocodeAddress(form.address);
        }, 500); // Debounce 500ms để tránh gọi API quá nhanh
        return () => clearTimeout(timeout);
    }, [form.address, geocodeAddress]);

    const handleChange = useCallback((e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: undefined }));
    }, []);

    const handleFile = useCallback((e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            setForm((prev) => ({ ...prev, images: [...prev.images, ...files] }));
        }
    }, []);

    const removeImage = useCallback((indexToRemove) => {
        setForm((prev) => ({
            ...prev,
            images: prev.images.filter((_, index) => index !== indexToRemove)
        }));
    }, []);

    const handleLocationSelect = useCallback((lat, lng) => {
        const newLat = typeof lat === 'number' ? lat.toFixed(6) : "";
        const newLng = typeof lng === 'number' ? lng.toFixed(6) : "";
        setForm((prev) => ({ ...prev, latitude: newLat, longitude: newLng }));
        setErrors((prev) => ({ ...prev, latitude: undefined, longitude: undefined }));
        setGeocodeError(null);
    }, []);

    const validateForm = () => {
        const newErrors = {};

        if (!form.name.trim()) {
            newErrors.name = "Tên khách sạn không được để trống.";
        }
        if (!form.address.trim()) {
            newErrors.address = "Địa chỉ không được để trống.";
        }
        if (form.latitude === "" || form.longitude === "" || isNaN(parseFloat(form.latitude)) || isNaN(parseFloat(form.longitude))) {
            newErrors.latitude = "Vĩ độ và kinh độ không hợp lệ.";
            newErrors.longitude = "Vĩ độ và kinh độ không hợp lệ.";
        }
        if (!form.phone.trim()) {
            newErrors.phone = "Số điện thoại không được để trống.";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            alert("Vui lòng điền đầy đủ và chính xác các thông tin bắt buộc!");
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        setIsSubmitting(true);
        setErrors({});

        try {
            const fd = new FormData();

            Object.entries(form).forEach(([key, value]) => {
                if (key !== 'images' && value !== "" && value !== null) {
                    fd.append(key, value);
                }
            });

            if (form.images && form.images.length > 0) {
                form.images.forEach(file => {
                    fd.append('images[]', file);
                });
            }

            onSubmit(fd);
        } catch (err) {
            console.error("Lỗi tạo khách sạn:", err.response?.data || err.message);
            if (err.response?.data?.errors) {
                const formattedErrors = {};
                for (const key in err.response.data.errors) {
                    formattedErrors[key] = err.response.data.errors[key][0];
                }
                setErrors(formattedErrors);
                const errorMessages = Object.values(err.response.data.errors).flat().join('\n');
                alert("Có lỗi xảy ra:\n" + errorMessages);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                alert("Có lỗi, kiểm tra console để biết chi tiết: " + (err.response?.data?.message || err.message));
            }
        } finally {
            setIsSubmitting(false);
            setForm((prev) => ({ ...prev, images: [] }));
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-6 font-sans">
            <div className="mb-4">
                <h1 className="text-2xl font-bold text-gray-800">Thêm khách sạn mới</h1>
                <p className="text-sm text-gray-500">Thêm thông tin khách sạn mới vào hệ thống</p>
            </div>

            <div className="rounded-lg bg-white shadow-lg">
                <div className="flex items-center gap-3 border-b p-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-500 text-white">
                        <i className="fas fa-hotel" />
                    </div>
                    <div>
                        <p className="font-medium text-gray-800">Bắt đầu điền thông tin khách sạn</p>
                        <p className="text-xs text-gray-500">Điền đầy đủ thông tin để thêm khách sạn mới</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-10 p-6">
                    <Section title="Thông tin cơ bản" icon="fas fa-info-circle">
                        <Input
                            name="name"
                            label={<>Tên khách sạn <span className="text-red-500">*</span></>}
                            placeholder="Nhập tên khách sạn..."
                            required
                            value={form.name}
                            onChange={handleChange}
                        />
                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}

                        <Textarea
                            name="description"
                            label="Mô tả"
                            placeholder="Mô tả chi tiết về khách sạn..."
                            value={form.description}
                            onChange={handleChange}
                        />
                        {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}

                        <Input
                            name="address"
                            label="Địa chỉ"
                            placeholder="Nhập địa chỉ chi tiết"
                            value={form.address}
                            onChange={handleChange}
                        />
                        {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}

                        <div className="space-y-2">
                            <Label text="Tọa độ địa lý" icon="fas fa-map-marker-alt" />
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    name="latitude"
                                    value={form.latitude}
                                    onChange={handleChange}
                                    placeholder="Vĩ độ"
                                    step="0.000001"
                                    className={`w-full rounded-md border p-2 text-sm bg-white shadow-sm ${errors.latitude ? 'border-red-500' : 'border-gray-300'}`}
                                />
                                <button
                                    type="button"
                                    className="rounded-md bg-blue-500 px-3 text-white"
                                    onClick={() => setShowMap((s) => !s)}
                                >
                                    <i className="fas fa-map-marker-alt" />
                                </button>
                                <input
                                    type="number"
                                    name="longitude"
                                    value={form.longitude}
                                    onChange={handleChange}
                                    placeholder="Kinh độ"
                                    step="0.000001"
                                    className={`flex-1 rounded-md border p-2 text-sm bg-white ${errors.longitude ? 'border-red-500' : 'border-gray-300'}`}
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        setForm((prev) => ({ ...prev, latitude: "", longitude: "" }));
                                        setErrors((prev) => ({ ...prev, latitude: undefined, longitude: undefined }));
                                        setGeocodeError(null);
                                    }}
                                    className="rounded-md bg-gray-300 px-3 text-white"
                                >
                                    <i className="fas fa-sync" />
                                </button>
                            </div>
                            {errors.latitude && <p className="text-red-500 text-xs mt-1">{errors.latitude}</p>}
                            {geocodeError && <p className="text-red-500 text-xs mt-1">{geocodeError}</p>}
                            <p className="rounded-md bg-blue-100 p-2 text-xs text-blue-700">
                                Bạn có thể nhập trực tiếp tọa độ, nhấn vào nút bản đồ để chọn vị trí, hoặc nhập địa chỉ để tự động lấy tọa độ.
                            </p>
                            {showMap && (
                                <div className="overflow-hidden rounded-md border">
                                    <LocationSelectorMap
                                        initialLatitude={parseFloat(form.latitude) || 21.028511}
                                        initialLongitude={parseFloat(form.longitude) || 105.804817}
                                        onLocationSelect={handleLocationSelect}
                                    />
                                </div>
                            )}
                        </div>
                    </Section>

                    <Section title="Thông tin liên hệ" icon="fas fa-phone-alt">
                        <div className="grid gap-6 md:grid-cols-2">
                            <Input
                                name="phone"
                                label={<>Số điện thoại <span className="text-red-500">*</span></>}
                                placeholder="Nhập số điện thoại..."
                                value={form.phone}
                                onChange={handleChange}
                            />
                            <Input
                                name="email"
                                label="Email"
                                placeholder="Nhập email..."
                                type="email"
                                value={form.email}
                                onChange={handleChange}
                            />
                            <Input
                                name="website"
                                label="Website"
                                placeholder="Nhập website..."
                                value={form.website}
                                onChange={handleChange}
                            />
                        </div>
                        {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                    </Section>

                    <Section title="Hình ảnh" icon="fas fa-image">
                        <Label text="Ảnh chính" />
                        <DropZone
                            files={form.images}
                            onChange={handleFile}
                            onRemoveFile={removeImage}
                        />
                        {errors.images && <p className="text-red-500 text-xs mt-1">{errors.images}</p>}
                    </Section>

                    <div className="flex justify-end gap-4 pt-4">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="rounded-md border px-6 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                            Huỷ
                        </button>
                        <button
                            type="button"
                            onClick={() => { setForm(initialForm); setErrors({}); setGeocodeError(null); setShowMap(false); }}
                            className="rounded-md bg-gray-300 px-6 py-2 text-sm text-gray-800 hover:bg-gray-400"
                        >
                            Đặt lại
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="rounded-md bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700"
                        >
                            {isSubmitting ? 'Đang lưu...' : 'Lưu khách sạn'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

const Section = ({ title, icon, children, iconColor = "text-blue-500" }) => (
    <section className="space-y-6 border-b last:border-0 pb-6 mb-6">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-800">
            <i className={`${icon} ${iconColor}`} /> {title}
        </h2>
        {children}
    </section>
);

const Label = ({ text, icon, iconColor = "text-blue-500", className = "" }) => (
    <p className={`flex items-center text-sm font-medium text-gray-700 ${className}`}>
        {icon && <i className={`${icon} mr-2 ${iconColor}`} />} {text}
    </p>
);

const Input = ({ label, name, value, onChange, required = false, type = "text", placeholder = "", readOnly = false, min, max, step }) => (
    <div className="space-y-1">
        {label && (typeof label === 'string' ? <Label text={label} /> : label)}
        <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            required={required}
            placeholder={placeholder}
            readOnly={readOnly}
            min={min}
            max={max}
            step={step}
            className="w-full rounded-md border border-gray-300 p-2 text-sm focus:border-blue-500 focus:ring-blue-500"
        />
    </div>
);

const Textarea = ({ label, name, value, onChange, placeholder = "", rows = 3 }) => (
    <div className="space-y-1">
        {label && (typeof label === 'string' ? <Label text={label} /> : label)}
        <textarea
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            rows={rows}
            className="w-full rounded-md border border-gray-300 p-3 text-sm focus:border-blue-500 focus:ring-blue-500"
        />
    </div>
);

const DropZone = ({ files, onChange, onRemoveFile }) => {
    return (
        <div className="md:col-span-2">
            <div className="flex flex-col items-center justify-center rounded-md border-2 border-dashed border-gray-300 p-6 text-center">
                {files && files.length > 0 ? (
                    <div className="w-full">
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-4">
                            {files.map((file, index) => (
                                <div key={index} className="group relative aspect-square">
                                    <img
                                        src={URL.createObjectURL(file)}
                                        alt={`preview ${index}`}
                                        className="h-full w-full object-cover rounded-md"
                                        onLoad={() => URL.revokeObjectURL(file.src)}
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
                        <input id="file-upload" type="file" accept="image/*" multiple onChange={onChange} className="hidden" />
                    </>
                )}
            </div>
        </div>
    );
};