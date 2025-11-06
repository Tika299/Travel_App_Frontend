import React, { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createTransportCompany } from "../../../services/ui/TransportCompany/transportCompanyService";
import { getAllTransportations } from "../../../services/ui/Transportation/transportationService";
import LocationSelectorMap from '../../../common/LocationSelectorMap.jsx';

// --- Các Component UI cơ bản ---
const Section = ({ title, icon, children, iconColor = "text-blue-500" }) => (
    <section className="space-y-6 border-b last:border-0 pb-6 mb-6">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-800">
            {icon && <i className={`${icon} ${iconColor}`} />} {title}
        </h2>
        {children}
    </section>
);
const Label = ({ text, icon, iconColor = "text-blue-500", className = "" }) => (
    <p className={`flex items-center text-sm font-medium text-gray-700 ${className}`}>
        {icon && <i className={`${icon} mr-2 ${iconColor}`} />} {text}
    </p>
);
const Input = ({ label, name, value, onChange, required = false, type = "text", placeholder = "", readOnly = false, min, max, step, className = "" }) => (
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
            className={`w-full rounded-md border border-gray-300 p-2 text-sm focus:border-blue-500 focus:ring-blue-500 ${className}`}
        />
    </div>
);
const Textarea = ({ label, name, value, onChange, placeholder = "", rows = 3, className = "" }) => (
    <div className="space-y-1">
        {label && (typeof label === 'string' ? <Label text={label} /> : label)}
        <textarea
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            rows={rows}
            className={`w-full rounded-md border border-gray-300 p-3 text-sm focus:border-blue-500 focus:ring-blue-500 ${className}`}
        />
    </div>
);
const Select = ({ label, options, ...rest }) => (
    <div className="space-y-1">
        {label && (typeof label === 'string' ? <Label text={label} /> : label)}
        <select
            {...rest}
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
const DropZone = ({ file, onChange, onRemove }) => (
    <div className="flex flex-col items-center justify-center rounded-md border-2 border-dashed border-gray-300 p-6 text-center">
        {file ? (
            <div className="group relative h-40 w-full">
                <img src={URL.createObjectURL(file)} alt="preview" className="h-full w-full object-cover" />
                <button
                    type="button"
                    onClick={onRemove}
                    className="absolute right-2 top-2 rounded-full bg-red-500 p-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100"
                >
                    <i className="fas fa-times" />
                </button>
            </div>
        ) : (
            <>
                <i className="fas fa-cloud-upload-alt text-5xl text-gray-400" />
                <p className="mt-3 text-sm text-gray-600">Kéo và thả ảnh vào đây hoặc</p>
                <label htmlFor="file-upload" className="cursor-pointer text-sm text-blue-600 hover:underline">
                    Duyệt ảnh từ thiết bị
                </label>
                <input id="file-upload" type="file" accept="image/*" onChange={onChange} className="hidden" />
            </>
        )}
    </div>
);

// --- Component CreateTransportCompany chính ---
const CreateTransportCompany = () => {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        name: "",
        transportation_id: "",
        description: "",
        address: "",
        latitude: "",
        longitude: "",
        logo_file: null,
        phone_number: "",
        email: "",
        website: "",
        price_range: {
            base_km: "",
            additional_km: "",
            waiting_minute_fee: "",
            night_fee: ""
        },
        has_mobile_app: false,
        payment_methods: [],
        operating_hours: { "Thứ 2 - Chủ Nhật": "" },
        status: "active",
    });

    const [previewLogo, setPreviewLogo] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState({});
    const [transportationTypes, setTransportationTypes] = useState([]);
    const [showMap, setShowMap] = useState(false);
    const [statusMessage, setStatusMessage] = useState(null);

    // Effect để tự động ẩn thông báo sau 5 giây
    useEffect(() => {
        if (statusMessage) {
            const timer = setTimeout(() => {
                setStatusMessage(null);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [statusMessage]);

    useEffect(() => {
        const fetchTransportations = async () => {
            try {
                const response = await getAllTransportations();
                if (response && response.data && Array.isArray(response.data.data)) {
                    setTransportationTypes(response.data.data);
                } else {
                    console.error("Unexpected API response for transportations:", response);
                    setTransportationTypes([]);
                }
            } catch (error) {
                console.error("Lỗi khi tải danh sách phương tiện:", error);
                setStatusMessage({ type: 'error', text: "Không thể tải danh sách phương tiện. Vui lòng thử lại." });
            }
        };
        fetchTransportations();
    }, []);

    const handleChange = useCallback((e) => {
        const { name, value, type, checked } = e.target;
        let finalValue = value;
        if (type === "checkbox") {
            finalValue = checked;
        } else if (type === "number") {
            finalValue = value === "" ? "" : parseFloat(value);
            if (isNaN(finalValue) && value !== "") {
                finalValue = "";
            }
        }
        setForm((p) => ({ ...p, [name]: finalValue }));
        setErrors((p) => ({ ...p, [name]: undefined }));
        setStatusMessage(null);
    }, []);

    const handlePriceRangeChange = useCallback((e) => {
        const { name, value } = e.target;
        let finalValue = value === "" ? "" : parseFloat(value);
        if (isNaN(finalValue) && value !== "") {
            finalValue = "";
        }
        setForm(p => ({
            ...p,
            price_range: {
                ...p.price_range,
                [name]: finalValue
            }
        }));
        setErrors(p => ({ ...p, [name]: undefined }));
        setStatusMessage(null);
    }, []);

    const handlePaymentMethodsChange = useCallback((e) => {
        const { value, checked } = e.target;
        setForm(p => {
            const currentMethods = [...p.payment_methods];
            if (checked) {
                if (!currentMethods.includes(value)) {
                    currentMethods.push(value);
                }
            } else {
                const index = currentMethods.indexOf(value);
                if (index > -1) {
                    currentMethods.splice(index, 1);
                }
            }
            return { ...p, payment_methods: currentMethods };
        });
    }, []);

    const handleFileChange = useCallback((e) => {
        const file = e.target.files?.[0];
        if (file) {
            setForm(prev => ({ ...prev, logo_file: file }));
            setPreviewLogo(URL.createObjectURL(file));
            setErrors(prev => ({ ...prev, logo: undefined }));
        } else {
            setForm(prev => ({ ...prev, logo_file: null }));
            setPreviewLogo(null);
            setErrors(prev => ({ ...prev, logo: "Vui lòng tải lên ảnh logo." }));
        }
        setStatusMessage(null);
    }, []);

    const handleRemoveLogo = useCallback(() => {
        setForm(prev => ({ ...prev, logo_file: null }));
        setPreviewLogo(null);
        setErrors(prev => ({ ...prev, logo: "Vui lòng tải lên ảnh logo." }));
        setStatusMessage(null);
    }, []);

    const handleOperatingHoursChange = useCallback((e) => {
        const { name, value } = e.target;
        setForm((p) => ({
            ...p,
            operating_hours: { ...p.operating_hours, [name]: value },
        }));
    }, []);

    const handleLocationSelect = useCallback((lat, lng) => {
        const newLat = typeof lat === 'number' ? lat.toFixed(6) : "";
        const newLng = typeof lng === 'number' ? lng.toFixed(6) : "";
        setForm((p) => ({ ...p, latitude: newLat, longitude: newLng }));
        setErrors((p) => ({ ...p, latitude: undefined, longitude: undefined }));
    }, []);

    const validateForm = () => {
        const newErrors = {};
        if (!form.name.trim()) {
            newErrors.name = "Vui lòng nhập tên hãng xe.";
        }
        if (!form.address.trim()) {
            newErrors.address = "Vui lòng nhập địa chỉ.";
        }
        if (!form.transportation_id) {
            newErrors.transportation_id = "Vui lòng chọn loại phương tiện.";
        }
        const lat = parseFloat(form.latitude);
        const lng = parseFloat(form.longitude);
        if (isNaN(lat) || isNaN(lng)) {
            newErrors.latitude = "Tọa độ không được để trống hoặc không hợp lệ.";
            newErrors.longitude = "Tọa độ không được để trống hoặc không hợp lệ.";
        } else if (lat < -90 || lat > 90) {
            newErrors.latitude = "Vĩ độ phải nằm trong khoảng -90 đến 90.";
        } else if (lng < -180 || lng > 180) {
            newErrors.longitude = "Kinh độ phải nằm trong khoảng -180 đến 180.";
        }
        if (!form.logo_file) {
            newErrors.logo = "Vui lòng tải lên logo.";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            setStatusMessage({ type: 'error', text: "Vui lòng điền đầy đủ và chính xác các thông tin bắt buộc đã được đánh dấu (*)." });
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        setSubmitting(true);
        setErrors({});
        setStatusMessage(null);

        const payload = new FormData();
        payload.append('name', form.name);
        payload.append('transportation_id', form.transportation_id);
        payload.append('description', form.description);
        payload.append('address', form.address);
        payload.append('latitude', form.latitude);
        payload.append('longitude', form.longitude);
        payload.append('phone_number', form.phone_number);
        payload.append('email', form.email);
        payload.append('website', form.website);
        payload.append('status', form.status);
        payload.append('has_mobile_app', form.has_mobile_app ? '1' : '0');

        if (form.logo_file) {
            payload.append('logo', form.logo_file);
        }

        payload.append('operating_hours', JSON.stringify(form.operating_hours));
        const priceRangePayload = {
            base_km: parseFloat(form.price_range.base_km) || 0,
            additional_km: parseFloat(form.price_range.additional_km) || 0,
            waiting_minute_fee: parseFloat(form.price_range.waiting_minute_fee) || 0,
            night_fee: parseFloat(form.price_range.night_fee) || 0,
        };
        payload.append('price_range', JSON.stringify(priceRangePayload));
        payload.append('payment_methods', JSON.stringify(form.payment_methods));

        try {
            await createTransportCompany(payload);
            setStatusMessage({ type: 'success', text: "✅ Tạo hãng vận chuyển thành công!" });
            setTimeout(() => {
                navigate("/admin/transport-companies");
            }, 1000);
        } catch (error) {
            console.error("❌ Lỗi khi tạo hãng vận chuyển:", error);
            if (error.response && error.response.status === 422) {
                const backendErrors = error.response.data.errors;
                const formattedErrors = {};
                for (const key in backendErrors) {
                    if (backendErrors.hasOwnProperty(key)) {
                        formattedErrors[key] = backendErrors[key][0];
                    }
                }
                setErrors(formattedErrors);
                setStatusMessage({ type: 'error', text: "❌ Lỗi dữ liệu nhập vào. Vui lòng kiểm tra lại các trường đã được đánh dấu." });
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                setStatusMessage({ type: 'error', text: "❌ Đã xảy ra lỗi không xác định. Vui lòng kiểm tra lại kết nối mạng hoặc thử lại sau." });
            }
        } finally {
            setSubmitting(false);
        }
    };

    const resetForm = useCallback(() => {
        setForm({
            name: "",
            transportation_id: "",
            description: "",
            address: "",
            latitude: "",
            longitude: "",
            logo_file: null,
            phone_number: "",
            email: "",
            website: "",
            price_range: {
                base_km: "",
                additional_km: "",
                waiting_minute_fee: "",
                night_fee: ""
            },
            has_mobile_app: false,
            payment_methods: [],
            operating_hours: { "Thứ 2 - Chủ Nhật": "" },
            status: "active",
        });
        setPreviewLogo(null);
        setErrors({});
        setStatusMessage({ type: 'info', text: "Form đã được đặt lại." });
    }, []);

    const getMessageStyle = (type) => {
        switch (type) {
            case 'success':
                return "bg-green-100 text-green-700 border-green-400";
            case 'error':
                return "bg-red-100 text-red-700 border-red-400";
            case 'info':
                return "bg-blue-100 text-blue-700 border-blue-400";
            default:
                return "bg-gray-100 text-gray-700 border-gray-400";
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-6 font-sans">
            <div className="mb-4">
                <h1 className="text-2xl font-bold text-gray-800">Thêm hãng vận chuyển mới</h1>
                <p className="text-sm text-gray-500">Điền đầy đủ thông tin để thêm hãng vận chuyển mới</p>
            </div>
            <div className="rounded-lg bg-white shadow-lg">
                <div className="flex items-center gap-3 border-b p-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-500 text-white">
                        <i className="fas fa-building" />
                    </div>
                    <div>
                        <p className="font-medium text-gray-800">Thông tin hãng vận chuyển</p>
                        <p className="text-xs text-gray-500">Điền đầy đủ thông tin để thêm hãng vận chuyển mới</p>
                    </div>
                </div>
                <form onSubmit={handleSubmit} className="space-y-10 p-6">
                    {/* Message Area */}
                    {statusMessage && (
                        <div className={`p-4 rounded-md border-l-4 ${getMessageStyle(statusMessage.type)}`}>
                            <p className="font-medium">{statusMessage.text}</p>
                        </div>
                    )}
                    
                    {/* 1. Thông tin cơ bản */}
                    <Section title="Thông tin cơ bản" icon="fas fa-info-circle">
                        <Input
                            name="name"
                            label={<>Tên hãng xe <span className="text-red-500">*</span></>}
                            placeholder="Nhập tên hãng xe...."
                            required
                            value={form.name}
                            onChange={handleChange}
                        />
                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                        <Select
                            name="transportation_id"
                            label={<>Loại phương tiện <span className="text-red-500">*</span></>}
                            value={form.transportation_id}
                            onChange={handleChange}
                            required
                            options={[
                                { value: "", label: "--Chọn loại phương tiện--" },
                                ...transportationTypes.map((type) => ({ value: type.id, label: type.name })),
                            ]}
                        />
                        {errors.transportation_id && <p className="text-red-500 text-xs mt-1">{errors.transportation_id}</p>}
                        <Textarea
                            name="description"
                            label="Mô tả chi tiết"
                            placeholder="Mô tả chi tiết về hãng xe...."
                            value={form.description}
                            onChange={handleChange}
                        />
                        <Input
                            name="address"
                            label={<>Địa chỉ <span className="text-red-500">*</span></>}
                            placeholder="Nhập địa chỉ chi tiết"
                            value={form.address}
                            onChange={handleChange}
                        />
                        {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                        {/* Tọa độ địa lý */}
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
                                    className={`flex-1 rounded-md border p-2 text-sm bg-white ${errors.latitude ? 'border-red-500' : 'border-gray-300'}`}
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
                                    className="rounded-md bg-blue-500 px-3 text-white"
                                    onClick={() => {
                                        setForm((p) => ({ ...p, latitude: "", longitude: "" }));
                                        setErrors((p) => ({ ...p, latitude: undefined, longitude: undefined }));
                                        setStatusMessage({ type: 'info', text: "Đã đặt lại tọa độ về rỗng." });
                                    }}
                                >
                                    <i className="fas fa-sync" />
                                </button>
                            </div>
                            {errors.latitude && <p className="text-red-500 text-xs mt-1">{errors.latitude}</p>}
                            <p className="rounded-md bg-blue-100 p-2 text-xs text-blue-700">
                                Bạn có thể **nhập trực tiếp tọa độ** vào các ô trên, HOẶC nhấn vào nút bản đồ (<i className="fas fa-map-marker-alt text-blue-700"></i>) để mở bản đồ và chọn tọa độ.
                                Sau khi chọn trên bản đồ, tọa độ sẽ tự động hiển thị tại đây.
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
                    {/* 2. Logo */}
                    <Section title="Logo" icon="fas fa-image">
                        <Label text="Ảnh Logo" />
                        <DropZone
                            file={form.logo_file}
                            onChange={handleFileChange}
                            onRemove={handleRemoveLogo}
                        />
                        {previewLogo && (
                            <div className="mt-2 text-center text-sm text-gray-500">
                                <img src={previewLogo} alt="Logo Preview" className="max-w-xs mx-auto rounded-md shadow" />
                            </div>
                        )}
                        {errors.logo && <p className="text-red-500 text-xs mt-1">{errors.logo}</p>}
                    </Section>
                    {/* 3. Chi tiết hoạt động và thanh toán */}
                    <Section title="Chi tiết hoạt động" icon="fas fa-clock">
                        <Input
  name="phone_number"
  label={
    <>
      Số điện thoại <span className="text-red-500">*</span>
    </>
  }
  placeholder="Nhập số điện thoại"
  value={form.phone_number}
  onChange={(e) => {
    const value = e.target.value.replace(/\D/g, ""); // chỉ giữ số
    if (value.length <= 10) {
      handleChange({ target: { name: "phone_number", value } });
    }
  }}
  error={errors.phone_number}
  maxLength={10}
/>

                        <Input
                            name="email"
                            label="Email"
                            type="email"
                            placeholder="Nhập email liên hệ"
                            value={form.email}
                            onChange={handleChange}
                        />
                        <Input
                            name="website"
                            label="Website"
                            type="url"
                            placeholder="Nhập địa chỉ website (nếu có)"
                            value={form.website}
                            onChange={handleChange}
                        />
                        <div className="space-y-1">
                            <Label text="Giờ hoạt động" />
                            <div className="flex items-center gap-2">
                                <Input
                                    name="start_time"
                                    type="time"
                                    value={form.operating_hours.start_time}
                                    onChange={handleOperatingHoursChange}
                                    placeholder="Giờ bắt đầu"
                                    className="flex-1"
                                />
                                <span>-</span>
                                <Input
                                    name="end_time"
                                    type="time"
                                    value={form.operating_hours.end_time}
                                    onChange={handleOperatingHoursChange}
                                    placeholder="Giờ kết thúc"
                                    className="flex-1"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label text="Phương thức thanh toán" icon="fas fa-money-bill-wave" />
                            <div className="flex flex-wrap gap-4">
                                <label className="flex items-center gap-2 text-sm">
                                    <input
                                        type="checkbox"
                                        value="cash"
                                        checked={form.payment_methods.includes("cash")}
                                        onChange={handlePaymentMethodsChange}
                                    /> Tiền mặt
                                </label>
                                <label className="flex items-center gap-2 text-sm">
                                    <input
                                        type="checkbox"
                                        value="bank_card"
                                        checked={form.payment_methods.includes("bank_card")}
                                        onChange={handlePaymentMethodsChange}
                                    /> Chuyển khoản ngân hàng
                                </label>
                                <label className="flex items-center gap-2 text-sm">
                                    <input
                                        type="checkbox"
                                        value="momo"
                                        checked={form.payment_methods.includes("momo")}
                                        onChange={handlePaymentMethodsChange}
                                    /> Momo
                                </label>
                                <label className="flex items-center gap-2 text-sm">
                                    <input
                                        type="checkbox"
                                        value="zalo_pay"
                                        checked={form.payment_methods.includes("zalo_pay")}
                                        onChange={handlePaymentMethodsChange}
                                    /> ZaloPay
                                </label>
                            </div>
                        </div>
                        <label className="flex items-center gap-2 text-sm">
                            <input
                                type="checkbox"
                                name="has_mobile_app"
                                checked={form.has_mobile_app}
                                onChange={handleChange}
                            /> Có ứng dụng di động
                        </label>
                    </Section>
                    {/* 4. Giá cước và Đánh giá */}
                    <Section title="Giá cước" icon="fas fa-dollar-sign" iconColor="text-green-500">
                        <Input
                            name="base_km"
                            label="Giá cước km cơ bản (VND/km)"
                            type="number"
                            placeholder="Nhập giá cước km đầu tiên"
                            value={form.price_range.base_km}
                            onChange={handlePriceRangeChange}
                            min="0"
                        />
                        <Input
                            name="additional_km"
                            label="Giá cước km bổ sung (VND/km)"
                            type="number"
                            placeholder="Nhập giá cước cho các km tiếp theo"
                            value={form.price_range.additional_km}
                            onChange={handlePriceRangeChange}
                            min="0"
                        />
                        <Input
                            name="waiting_minute_fee"
                            label="Phí chờ (VND/phút)"
                            type="number"
                            placeholder="Nhập phí chờ mỗi phút"
                            value={form.price_range.waiting_minute_fee}
                            onChange={handlePriceRangeChange}
                            min="0"
                        />
                        <Input
                            name="night_fee"
                            label="Phụ thu ban đêm (VND/chuyến)"
                            type="number"
                            placeholder="Nhập phụ thu ban đêm"
                            value={form.price_range.night_fee}
                            onChange={handlePriceRangeChange}
                            min="0"
                        />
                        <Select
                            name="status"
                            label="Trạng thái"
                            value={form.status}
                            onChange={handleChange}
                            options={[
                                { value: "active", label: "Đang hoạt động" },
                                { value: "inactive", label: "Ngừng hoạt động" },
                                { value: "draft", label: "Bản nháp" },
                            ]}
                        />
                    </Section>
                    {/* Các nút hành động */}
                    <div className="flex justify-end gap-4 pt-4">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="px-6 py-2 bg-gray-200 text-gray-800 font-semibold rounded-md shadow-md hover:bg-gray-300 transition-colors duration-200"
                        >
                            <i className="fas fa-times mr-2"></i> Huỷ
                        </button>
                        <button
                            type="button"
                            onClick={resetForm}
                            className="px-6 py-2 bg-yellow-500 text-white font-semibold rounded-md shadow-md hover:bg-yellow-600 transition-colors duration-200"
                            disabled={submitting}
                        >
                            <i className="fas fa-sync-alt mr-2"></i> Đặt lại
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md shadow-md hover:bg-blue-700 transition-colors duration-200"
                        >
                            {submitting ? (
                                <span className="flex items-center">
                                    <i className="fas fa-spinner fa-spin mr-2"></i> Đang lưu...
                                </span>
                            ) : (
                                <span className="flex items-center">
                                    <i className="fas fa-save mr-2"></i> Lưu hãng xe
                                </span>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
export default CreateTransportCompany;