import React, { useState, useCallback, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getTransportCompanyById } from "../../../services/ui/TransportCompany/transportCompanyService";
import { getAllTransportations } from "../../../services/ui/Transportation/transportationService";
import LocationSelectorMap from '../../../common/LocationSelectorMap.jsx';
import axios from "axios";

// Import SweetAlert2
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.css';

// --- Basic UI Components for reusability ---
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
const Input = ({ label, name, value, onChange, required = false, type = "text", placeholder = "", readOnly = false, min, max, step, className = "", error }) => (
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
            className={`w-full rounded-md border ${error ? 'border-red-500' : 'border-gray-300'} p-2 text-sm focus:border-blue-500 focus:ring-blue-500 ${className}`}
        />
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
);
const Textarea = ({ label, name, value, onChange, placeholder = "", rows = 3, className = "", error }) => (
    <div className="space-y-1">
        {label && (typeof label === 'string' ? <Label text={label} /> : label)}
        <textarea
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            rows={rows}
            className={`w-full rounded-md border ${error ? 'border-red-500' : 'border-gray-300'} p-3 text-sm focus:border-blue-500 focus:ring-blue-500 ${className}`}
        />
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
);
const Select = ({ label, options, error, ...rest }) => (
    <div className="space-y-1">
        {label && (typeof label === 'string' ? <Label text={label} /> : label)}
        <select
            {...rest}
            className={`w-full rounded-md border ${error ? 'border-red-500' : 'border-gray-300'} p-2 text-sm focus:border-blue-500 focus:ring-blue-500`}
        >
            {options.map((o) => (
                <option key={o.value} value={o.value}>
                    {o.label}
                </option>
            ))}
        </select>
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
);
const DropZone = ({ file, onChange, onRemove, existingUrl, error }) => (
    <div className={`flex flex-col items-center justify-center rounded-md border-2 border-dashed p-6 text-center ${error ? 'border-red-500' : 'border-gray-300'}`}>
        {file || existingUrl ? (
            <div className="group relative h-40 w-full">
                <img
                    src={file ? URL.createObjectURL(file) : `https://travel-app-api-ws77.onrender.com${existingUrl.startsWith('/') ? '' : '/'}${existingUrl}`}
                    alt="preview"
                    className="h-full w-full object-contain"
                />
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
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
);

// --- Main EditTransportCompany component ---
const EditTransportCompany = () => {
    const { id } = useParams();
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
        operating_hours: { start_time: "", end_time: "" },
        status: "active",
    });

    const [previewLogo, setPreviewLogo] = useState(null);
    const [existingLogoUrl, setExistingLogoUrl] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);
    const [errors, setErrors] = useState({});
    const [transportationTypes, setTransportationTypes] = useState([]);
    const [showMap, setShowMap] = useState(false);

    // Fetch transportation types and existing company data on component mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                const transportationResponse = await getAllTransportations();
                if (transportationResponse && transportationResponse.data && Array.isArray(transportationResponse.data.data)) {
                    setTransportationTypes(transportationResponse.data.data);
                } else {
                    console.error("Unexpected API response for transportations:", transportationResponse);
                }

                if (id) {
                    const companyResponse = await getTransportCompanyById(id);
                    const companyData = companyResponse.data.data;
                    console.log("Dữ liệu hãng xe được tải về:", companyData);
                    if (companyData) {
                        // Phân tích chuỗi giờ hoạt động nếu có
                        const operatingHoursString = companyData.operating_hours?.["Thứ 2 - Chủ Nhật"] || "";
                        let start_time = "";
                        let end_time = "";
                        const timeParts = operatingHoursString.split(' - ');
                        if (timeParts.length === 2) {
                            start_time = timeParts[0];
                            end_time = timeParts[1];
                        }

                        setForm({
                            name: companyData.name || "",
                            transportation_id: companyData.transportation_id || "",
                            description: companyData.description || "",
                            address: companyData.address || "",
                            latitude: companyData.latitude || "",
                            longitude: companyData.longitude || "",
                            logo_file: null,
                            phone_number: companyData.phone_number || "",
                            email: companyData.email || "",
                            website: companyData.website || "",
                            price_range: companyData.price_range || { base_km: "", additional_km: "", waiting_minute_fee: "", night_fee: "" },
                            has_mobile_app: companyData.has_mobile_app || false,
                            payment_methods: companyData.payment_methods || [],
                            operating_hours: { start_time, end_time },
                            status: companyData.status || "active",
                        });
                        setExistingLogoUrl(companyData.logo || null);
                    }
                }
            } catch (error) {
                console.error("Lỗi khi tải dữ liệu:", error);
                Swal.fire({
                    icon: 'error',
                    title: 'Lỗi!',
                    text: 'Không thể tải dữ liệu hãng vận chuyển. Vui lòng thử lại.',
                    confirmButtonText: 'Đóng'
                });
                navigate("/admin/transport-companies");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id, navigate]);

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
            setExistingLogoUrl(null);
            setErrors(prev => ({ ...prev, logo: undefined }));
        } else {
            setForm(prev => ({ ...prev, logo_file: null }));
            setPreviewLogo(null);
            setErrors(prev => ({ ...prev, logo: "Vui lòng tải lên ảnh logo." }));
        }
    }, []);

    const handleRemoveLogo = useCallback(() => {
        setForm(prev => ({ ...prev, logo_file: null }));
        setPreviewLogo(null);
        setExistingLogoUrl(null);
        setErrors(prev => ({ ...prev, logo: "Vui lòng tải lên ảnh logo." }));
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
            newErrors.name = "Tên hãng xe không được để trống.";
        }
        if (!form.address.trim()) {
            newErrors.address = "Địa chỉ không được để trống.";
        }
        if (!form.transportation_id) {
            newErrors.transportation_id = "Vui lòng chọn loại phương tiện.";
        }
        const lat = parseFloat(form.latitude);
        const lng = parseFloat(form.longitude);
        if (isNaN(lat) || isNaN(lng)) {
            newErrors.latitude = "Vĩ độ và kinh độ không được để trống hoặc không hợp lệ.";
            newErrors.longitude = "Vĩ độ và kinh độ không được để trống hoặc không hợp lệ.";
        } else if (lat < -90 || lat > 90) {
            newErrors.latitude = "Vĩ độ phải nằm trong khoảng -90 đến 90.";
        } else if (lng < -180 || lng > 180) {
            newErrors.longitude = "Kinh độ phải nằm trong khoảng -180 đến 180.";
        }
        if (!form.logo_file && !existingLogoUrl) {
            newErrors.logo = "Vui lòng tải lên ảnh logo.";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            console.error("Lỗi xác thực form phía client.");
            Swal.fire({
                icon: 'warning',
                title: 'Dữ liệu không hợp lệ!',
                text: 'Vui lòng điền đầy đủ và chính xác các thông tin bắt buộc.',
            });
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        setSubmitting(true);
        setErrors({});

        const payload = new FormData();
        payload.append('_method', 'PUT');
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
        } else if (existingLogoUrl === null) {
            payload.append('logo', '');
        }

        // Tạo chuỗi giờ hoạt động từ hai giá trị start_time và end_time
        const operatingHoursPayload = {
            "Thứ 2 - Chủ Nhật": `${form.operating_hours.start_time} - ${form.operating_hours.end_time}`
        };
        payload.append('operating_hours', JSON.stringify(operatingHoursPayload));

        const priceRangePayload = {
            base_km: parseFloat(form.price_range.base_km) || 0,
            additional_km: parseFloat(form.price_range.additional_km) || 0,
            waiting_minute_fee: parseFloat(form.price_range.waiting_minute_fee) || 0,
            night_fee: parseFloat(form.price_range.night_fee) || 0,
        };
        payload.append('price_range', JSON.stringify(priceRangePayload));
        payload.append('payment_methods', JSON.stringify(form.payment_methods));

        console.log("Đang chuẩn bị gửi payload FormData:");
        for (let [key, value] of payload.entries()) {
            console.log(`${key}:`, value);
        }

        try {
            // Lấy token từ localStorage
            const token = localStorage.getItem('token');
            
            // Nếu không có token, hiển thị lỗi và dừng lại
            if (!token) {
                console.error("Lỗi: Không tìm thấy token xác thực trong localStorage.");
                Swal.fire({
                    icon: 'error',
                    title: 'Lỗi!',
                    text: 'Không tìm thấy token xác thực. Vui lòng đăng nhập lại.',
                    confirmButtonText: 'Đóng'
                });
                setSubmitting(false);
                return;
            }

            const response = await axios.post(`https://travel-app-api-ws77.onrender.com/api/transport-companies/${id}`, payload, {
                headers: {
                    // Thêm Authorization header với token để xác thực
                    'Authorization': `Bearer ${token}`
                }
            });
            console.log("API response:", response);
            Swal.fire({
                icon: 'success',
                title: 'Thành công!',
                text: 'Cập nhật hãng vận chuyển thành công!',
                timer: 2000,
                showConfirmButton: false
            });
            navigate("/admin/transport-companies");
        } catch (error) {
            console.error("❌ Lỗi khi cập nhật hãng vận chuyển:", error);
            if (error.response && error.response.status === 422) {
                const backendErrors = error.response.data.errors;
                const formattedErrors = {};
                for (const key in backendErrors) {
                    if (backendErrors.hasOwnProperty(key)) {
                        formattedErrors[key] = backendErrors[key][0];
                    }
                }
                setErrors(formattedErrors);
                Swal.fire({
                    icon: 'error',
                    title: 'Lỗi!',
                    html: `Lỗi dữ liệu nhập vào. Vui lòng kiểm tra console để biết chi tiết.<br><b>${error.response.data.message || 'Lỗi không xác định'}</b>`,
                    confirmButtonText: 'Đóng'
                });
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Lỗi!',
                    text: 'Có lỗi xảy ra khi cập nhật. Vui lòng thử lại.',
                    confirmButtonText: 'Đóng'
                });
            }
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <p className="text-xl text-gray-600">Đang tải dữ liệu...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 p-6 font-sans">
            <div className="mb-4">
                <h1 className="text-2xl font-bold text-gray-800">Chỉnh sửa hãng vận chuyển</h1>
                <p className="text-sm text-gray-500">Cập nhật thông tin chi tiết cho hãng vận chuyển</p>
            </div>

            <div className="rounded-lg bg-white shadow-lg">
                <div className="flex items-center gap-3 border-b p-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-500 text-white">
                        <i className="fas fa-edit" />
                    </div>
                    <div>
                        <p className="font-medium text-gray-800">Thông tin hãng vận chuyển</p>
                        <p className="text-xs text-gray-500">Chỉnh sửa và cập nhật các thông tin cần thiết</p>
                    </div>
                </div>
                <form onSubmit={handleSubmit} className="space-y-10 p-6">
                    <Section title="Thông tin cơ bản" icon="fas fa-info-circle">
                        <Input name="name" label={<>Tên hãng xe <span className="text-red-500">*</span></>} placeholder="Nhập tên hãng xe...." required value={form.name} onChange={handleChange} error={errors.name} />
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
                            error={errors.transportation_id}
                        />
                        <Textarea name="description" label="Mô tả chi tiết" placeholder="Mô tả chi tiết về hãng xe...." value={form.description} onChange={handleChange} error={errors.description} />
                        <Input name="address" label={<>Địa chỉ <span className="text-red-500">*</span></>} placeholder="Nhập địa chỉ chi tiết" value={form.address} onChange={handleChange} error={errors.address} />
                        <div className="space-y-2">
                            <Label text="Tọa độ địa lý" icon="fas fa-map-marker-alt" />
                            <div className="flex gap-2">
                                <Input
                                    type="number"
                                    name="latitude"
                                    value={form.latitude}
                                    onChange={handleChange}
                                    placeholder="Vĩ độ"
                                    step="0.000001"
                                    className="flex-1"
                                    error={errors.latitude}
                                />
                                <button type="button" className="rounded-md bg-blue-500 px-3 text-white" onClick={() => setShowMap((s) => !s)} >
                                    <i className="fas fa-map-marker-alt" />
                                </button>
                                <Input
                                    type="number"
                                    name="longitude"
                                    value={form.longitude}
                                    onChange={handleChange}
                                    placeholder="Kinh độ"
                                    step="0.000001"
                                    className="flex-1"
                                    error={errors.longitude}
                                />
                                <button type="button" className="rounded-md bg-blue-500 px-3 text-white" onClick={() => { setForm((p) => ({ ...p, latitude: "", longitude: "" })); setErrors((p) => ({ ...p, latitude: undefined, longitude: undefined })); Swal.fire("Đã đặt lại tọa độ về rỗng."); }} >
                                    <i className="fas fa-sync" />
                                </button>
                            </div>
                            {errors.latitude && <p className="text-red-500 text-xs mt-1">{errors.latitude}</p>}
                            <p className="rounded-md bg-blue-100 p-2 text-xs text-blue-700">
                                Bạn có thể **nhập trực tiếp tọa độ** vào các ô trên, HOẶC nhấn vào nút bản đồ (<i className="fas fa-map-marker-alt" />) để chọn vị trí.
                            </p>
                        </div>
                    </Section>
                    <Section title="Logo" icon="fas fa-image">
                        <DropZone
                            file={form.logo_file}
                            onChange={handleFileChange}
                            onRemove={handleRemoveLogo}
                            existingUrl={existingLogoUrl}
                            error={errors.logo}
                        />
                    </Section>
                    <Section title="Liên hệ" icon="fas fa-phone">
                        <div className="grid gap-4 md:grid-cols-3">
                            <Input name="phone_number" label={<>Số điện thoại <span className="text-red-500">*</span></>} placeholder="Nhập số điện thoại" value={form.phone_number} onChange={handleChange} error={errors.phone_number} maxLength={10} />
                            <Input name="email" label="Email" type="email" placeholder="Nhập email" value={form.email} onChange={handleChange} error={errors.email} />
                            <Input name="website" label="Website" placeholder="Nhập website" value={form.website} onChange={handleChange} error={errors.website} />
                        </div>
                    </Section>
                    <Section title="Giá cước" icon="fas fa-dollar-sign">
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <Input name="base_km" label={<>Giá cước cơ bản (mỗi km) <span className="text-red-500">*</span></>} type="number" placeholder="VNĐ" value={form.price_range.base_km} onChange={handlePriceRangeChange} error={errors.price_range} />
                            <Input name="additional_km" label={<>Giá cước phụ trội (mỗi km) <span className="text-red-500">*</span></>} type="number" placeholder="VNĐ" value={form.price_range.additional_km} onChange={handlePriceRangeChange} error={errors.price_range} />
                            <Input name="waiting_minute_fee" label={<>Phí chờ (mỗi phút) <span className="text-red-500">*</span></>} type="number" placeholder="VNĐ" value={form.price_range.waiting_minute_fee} onChange={handlePriceRangeChange} error={errors.price_range} />
                            <Input name="night_fee" label={<>Phí ban đêm <span className="text-red-500">*</span></>} type="number" placeholder="VNĐ" value={form.price_range.night_fee} onChange={handlePriceRangeChange} error={errors.price_range} />
                        </div>
                    </Section>
                    <Section title="Thông tin thêm" icon="fas fa-plus">
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
                        <div className="grid gap-4 md:grid-cols-2">
                            <Select
                                name="status"
                                label="Trạng thái"
                                value={form.status}
                                onChange={handleChange}
                                options={[
                                    { value: "active", label: "Hoạt động" },
                                    { value: "inactive", label: "Ngừng hoạt động" },
                                    { value: "draft", label: "Bản nháp" },
                                ]}
                                error={errors.status}
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <input type="checkbox" id="has_mobile_app" name="has_mobile_app" checked={form.has_mobile_app} onChange={handleChange} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                            <label htmlFor="has_mobile_app" className="text-sm text-gray-900">Có ứng dụng di động</label>
                        </div>
                        <div className="space-y-1">
                            <Label text="Phương thức thanh toán" />
                            <div className="flex flex-wrap gap-4">
                                {['cash', 'bank_transfer', 'bank_card', 'momo', 'zalo_pay'].map((method) => (
                                    <label key={method} className="flex items-center gap-2 text-sm text-gray-700">
                                        <input
                                            type="checkbox"
                                            value={method}
                                            checked={form.payment_methods.includes(method)}
                                            onChange={handlePaymentMethodsChange}
                                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="capitalize">{method.replace('_', ' ')}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </Section>
                    <div className="flex justify-end gap-4 border-t pt-6">
                        <button type="button" onClick={() => navigate('/admin/transport-companies')} className="rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300">Hủy</button>
                        <button type="submit" disabled={submitting} className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">
                            {submitting ? 'Đang cập nhật...' : 'Cập nhật'}
                        </button>
                    </div>
                </form>
            </div>
            {showMap && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-75 p-4">
                    <div className="relative w-full max-w-4xl rounded-lg bg-white p-6 shadow-xl">
                        <button onClick={() => setShowMap(false)} className="absolute right-4 top-4 text-gray-500 hover:text-gray-800">
                            <i className="fas fa-times-circle text-2xl"></i>
                        </button>
                        <h2 className="text-2xl font-bold mb-4">Chọn vị trí trên bản đồ</h2>
                        <LocationSelectorMap
                            onSelectLocation={handleLocationSelect}
                            initialCenter={{ lat: parseFloat(form.latitude) || 21.0278, lng: parseFloat(form.longitude) || 105.8342 }}
                        />
                        <div className="mt-4 flex justify-end">
                            <button onClick={() => setShowMap(false)} className="rounded-md bg-gray-500 px-4 py-2 text-white">Đóng</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EditTransportCompany;