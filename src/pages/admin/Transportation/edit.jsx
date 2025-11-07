import React, { useState, useCallback, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

// Import thư viện thông báo
import Swal from "sweetalert2";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Đảm bảo đường dẫn này đúng:
import {
    getTransportationById,
    updateTransportation,
} from "../../../services/ui/Transportation/transportationService";

// Định nghĩa tags và features (Không thay đổi, lấy từ CreateTransportation)
const tags = [
    { value: "uy_tin", label: "Uy tín" },
    { value: "pho_bien", label: "Phổ biến" },
    { value: "cong_nghe", label: "Công nghệ" },
    // Thêm các tags khác nếu có
];

const features = [
    { value: "has_app", label: "Có ứng dụng đặt xe" },
    { value: "card_payment", label: "Hỗ trợ thanh toán app/ngân hàng" },
    { value: "insurance", label: "Có bảo hiểm chuyến đi" },
    { value: "gps_tracking", label: "Theo dõi GPS" },
];

// Định nghĩa component Label
const Label = ({ text, htmlFor, className = "" }) => (
    <label
        htmlFor={htmlFor}
        className={`block text-sm font-medium text-gray-700 ${className}`}
    >
        {text}
    </label>
);

// Định nghĩa component InputField
const InputField = ({
    label,
    id,
    name,
    value,
    onChange,
    placeholder,
    type = "text",
    errors,
    min,
    max,
    step,
    checked,
}) => {
    const isTextArea = type === "textarea";
    const isCheckbox = type === "checkbox";

    const inputElement = isTextArea ? (
        <textarea
            id={id}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            rows={3}
            className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                errors ? "border-red-500" : "border-gray-300"
            }`}
        />
    ) : isCheckbox ? (
        <input
            type="checkbox"
            id={id}
            name={name}
            checked={checked}
            onChange={onChange}
            className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded ${
                errors ? "border-red-500" : ""
            }`}
        />
    ) : (
        <input
            type={type}
            id={id}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            min={min}
            max={max}
            step={step}
            className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                errors ? "border-red-500" : "border-gray-300"
            }`}
        />
    );

    return (
        <div className="mb-4">
            {isCheckbox ? (
                <div className="flex items-center">
                    {inputElement}
                    <Label htmlFor={id} text={label} className="ml-2" />
                </div>
            ) : (
                <>
                    <Label htmlFor={id} text={label} />
                    {inputElement}
                </>
            )}
            {errors &&
                errors.map((error, index) => (
                    <p key={index} className="text-red-500 text-xs mt-1">
                        {error}
                    </p>
                ))}
        </div>
    );
};

// Định nghĩa component ImageUpload
const ImageUpload = ({
    label,
    currentFile,
    currentImageUrl,
    onFileChange,
    onFileRemove,
    errors,
}) => {
    const [previewUrl, setPreviewUrl] = useState(null);

    useEffect(() => {
        if (currentFile) {
            const url = URL.createObjectURL(currentFile);
            setPreviewUrl(url);
            return () => URL.revokeObjectURL(url);
        } else if (currentImageUrl) {
            setPreviewUrl(currentImageUrl);
        } else {
            setPreviewUrl(null);
        }
    }, [currentFile, currentImageUrl]);

    return (
        <div className="mb-4">
            <Label text={label} />
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md relative group">
                <input
                    id={`file-upload-${label.replace(/\s+/g, "-")}`}
                    name="image"
                    type="file"
                    accept="image/*"
                    onChange={onFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="space-y-1 text-center">
                    {previewUrl ? (
                        <>
                            <img
                                src={previewUrl}
                                alt="Preview"
                                className="mx-auto h-32 object-contain rounded-md"
                            />
                            <button
                                type="button"
                                onClick={onFileRemove}
                                className="text-red-600 hover:text-red-800 text-sm mt-2"
                            >
                                Xóa ảnh
                            </button>
                        </>
                    ) : (
                        <>
                            <svg
                                className="mx-auto h-12 w-12 text-gray-400"
                                stroke="currentColor"
                                fill="none"
                                viewBox="0 0 48 48"
                                aria-hidden="true"
                            >
                                <path
                                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                            <div className="flex text-sm text-gray-600">
                                <label
                                    htmlFor={`file-upload-${label.replace(/\s+/g, "-")}`}
                                    className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                                >
                                    <span>Kéo thả hình ảnh vào đây</span>
                                    <span className="sr-only">Choose file</span>
                                </label>
                                <p className="pl-1">hoặc</p>
                                <label
                                    htmlFor={`file-upload-${label.replace(/\s+/g, "-")}`}
                                    className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                                >
                                    <span className="ml-1">Chọn file</span>
                                    <span className="sr-only">Upload file</span>
                                </label>
                            </div>
                        </>
                    )}
                </div>
                {errors &&
                    errors.map((error, index) => (
                        <p key={index} className="text-red-500 text-xs mt-1">
                            {error}
                        </p>
                    ))}
            </div>
        </div>
    );
};

const EditTransportationComponent = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [form, setForm] = useState(null);
    const [initialFormState, setInitialFormState] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({});

    // Effect để tải dữ liệu khi component mount hoặc ID thay đổi
    useEffect(() => {
        const fetchTransportation = async () => {
            try {
                const res = await getTransportationById(id);
                const t = res.data.data;

                const backendBaseUrl = "https://travel-app-api-ws77.onrender.com/storage/";

                const fullIconUrl = t.icon ? `${backendBaseUrl}${t.icon}` : null;
                const fullBannerUrl = t.banner ? `${backendBaseUrl}${t.banner}` : null;

                const parsedTags = Array.isArray(t.tags)
                    ? t.tags
                    : JSON.parse(t.tags || "[]");
                const parsedFeatures = Array.isArray(t.features)
                    ? t.features
                    : JSON.parse(t.features || "[]");

                const initialData = {
                    name: t.name ?? "",
                    average_price: t.average_price ?? "",
                    description: t.description ?? "",
                    tags: parsedTags,
                    features: parsedFeatures,
                    icon: null,
                    banner: null,
                    icon_url: fullIconUrl,
                    banner_url: fullBannerUrl,
                    is_visible: t.is_visible === 1,
                };
                setForm(initialData);
                setInitialFormState(initialData);
                console.log("Full Icon URL:", fullIconUrl);
                console.log("Full Banner URL:", fullBannerUrl);
            } catch (err) {
                console.error("Lỗi khi tải dữ liệu phương tiện:", err);
                Swal.fire({
                    icon: "error",
                    title: "Lỗi!",
                    text: "Không thể tải dữ liệu phương tiện. Vui lòng thử lại.",
                });
                setTimeout(() => navigate("/admin/transportations"), 3000);
            }
        };

        fetchTransportation();
    }, [id, navigate]);

    const handleChange = useCallback((e) => {
        const { name, value, type, checked } = e.target;
        let newValue = value;
        if (type === "checkbox") {
            newValue = checked;
        }
        if (name === "is_visible") {
            newValue = value === "true";
        }

        setForm((prevForm) => ({
            ...prevForm,
            [name]: newValue,
        }));
        setFieldErrors((prevErrors) => ({ ...prevErrors, [name]: undefined }));
    }, []);

    // **ĐIỂM CHỈNH SỬA**: Thêm hàm handleCheckboxChange cho Tags và Features
    const handleCheckboxChange = useCallback((e, name) => {
        const { value, checked } = e.target;
        setForm((prevForm) => {
            const currentValues = prevForm[name] || [];
            const newValues = checked
                ? [...currentValues, value]
                : currentValues.filter((item) => item !== value);
            return {
                ...prevForm,
                [name]: newValues,
            };
        });
        setFieldErrors((prevErrors) => ({ ...prevErrors, [name]: undefined }));
    }, []);

    const handleIconChange = useCallback((e) => {
        const file = e.target.files[0];
        if (file) {
            setForm((prevForm) => ({ ...prevForm, icon: file, icon_url: null }));
        }
        setFieldErrors((prevErrors) => ({ ...prevErrors, icon: undefined }));
    }, []);

    const handleIconRemove = useCallback(() => {
        setForm((prevForm) => ({ ...prevForm, icon: null, icon_url: null }));
        setFieldErrors((prevErrors) => ({ ...prevErrors, icon: undefined }));
    }, []);

    const handleBannerChange = useCallback((e) => {
        const file = e.target.files[0];
        if (file) {
            setForm((prevForm) => ({ ...prevForm, banner: file, banner_url: null }));
        }
        setFieldErrors((prevErrors) => ({ ...prevErrors, banner: undefined }));
    }, []);

    const handleBannerRemove = useCallback(() => {
        setForm((prevForm) => ({ ...prevForm, banner: null, banner_url: null }));
        setFieldErrors((prevErrors) => ({ ...prevErrors, banner: undefined }));
    }, []);

    const handleReset = useCallback(() => {
        if (initialFormState) {
            setForm(initialFormState);
            setFieldErrors({});
            toast.info("Đã đặt lại form thành công!");
        }
    }, [initialFormState]);

    const handleSubmit = useCallback(
        async (e) => {
            e.preventDefault();
            setSubmitting(true);
            setFieldErrors({});

            const formData = new FormData();

            for (const key in form) {
                if (form[key] !== null && form[key] !== undefined) {
                    if (key === "tags" || key === "features") {
                        form[key].forEach((item) => {
                            formData.append(`${key}[]`, item);
                        });
                    } else if (key === "icon" && form[key] instanceof File) {
                        formData.append("icon", form[key]);
                    } else if (key === "banner" && form[key] instanceof File) {
                        formData.append("banner", form[key]);
                    } else if (key === "is_visible") {
                        formData.append(key, form[key] ? "1" : "0");
                    } else if (key !== "icon_url" && key !== "banner_url") {
                        formData.append(key, form[key]);
                    }
                }
            }

            formData.append("_method", "PUT");

            try {
                const response = await updateTransportation(id, formData);
                if (response.data.success) {
                    toast.success(
                        response.data.message ||
                            "Phương tiện đã được cập nhật thành công!"
                    );
                    setTimeout(() => navigate("/admin/transportations"), 2000);
                } else {
                    toast.error(
                        response.data.message ||
                            "Có lỗi xảy ra khi cập nhật phương tiện."
                    );
                    if (response.data.errors) {
                        setFieldErrors(response.data.errors);
                    }
                }
            } catch (err) {
                console.error("Lỗi khi cập nhật phương tiện:", err);
                Swal.fire({
                    icon: "error",
                    title: "Lỗi!",
                    text:
                        (err.response && err.response.data && err.response.data.message) ||
                        "Đã xảy ra lỗi không mong muốn. Vui lòng thử lại.",
                });
                if (err.response && err.response.data && err.response.data.errors) {
                    setFieldErrors(err.response.data.errors);
                }
            } finally {
                setSubmitting(false);
            }
        },
        [id, form, navigate]
    );

    if (!form) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100 font-inter">
                <p className="text-gray-700 text-lg">Đang tải dữ liệu phương tiện...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center py-8 px-4">
            <ToastContainer />
            <main className="w-full max-w-4xl bg-white p-8 rounded-lg shadow-lg">
                <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
                    Chỉnh Sửa Phương Tiện
                </h1>

                <form onSubmit={handleSubmit}>
                    <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <InputField
                                label="Tên phương tiện"
                                id="name"
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                placeholder="Nhập tên phương tiện"
                                required
                                errors={fieldErrors.name}
                            />
                            <InputField
                                label="Giá trung bình"
                                id="average_price"
                                name="average_price"
                                type="number"
                                value={form.average_price}
                                onChange={handleChange}
                                placeholder="Ví dụ: 50000"
                                errors={fieldErrors.average_price}
                            />
                            <InputField
                                label="Mô tả"
                                id="description"
                                name="description"
                                type="textarea"
                                value={form.description}
                                onChange={handleChange}
                                placeholder="Mô tả về phương tiện..."
                                errors={fieldErrors.description}
                            />

                            {/* **ĐIỂM CHỈNH SỬA**: Thay thế select tags bằng checkbox */}
                            <div className="mb-4">
                                <Label text="Tags" />
                                <div className="mt-2 grid grid-cols-2 gap-2">
                                    {tags.map((tag) => (
                                        <div key={tag.value} className="flex items-center">
                                            <input
                                                type="checkbox"
                                                id={`tag-${tag.value}`}
                                                name="tags"
                                                value={tag.value}
                                                checked={form.tags.includes(tag.value)}
                                                onChange={(e) => handleCheckboxChange(e, "tags")}
                                                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                            />
                                            <label
                                                htmlFor={`tag-${tag.value}`}
                                                className="ml-2 text-sm text-gray-700"
                                            >
                                                {tag.label}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                                {fieldErrors.tags &&
                                    fieldErrors.tags.map((error, index) => (
                                        <p key={index} className="text-red-500 text-xs mt-1">
                                            {error}
                                        </p>
                                    ))}
                            </div>
                        </div>

                        <div>
                            <ImageUpload
                                label="Icon (Biểu tượng - Ảnh)"
                                currentFile={form.icon}
                                currentImageUrl={form.icon_url}
                                onFileChange={handleIconChange}
                                onFileRemove={handleIconRemove}
                                errors={fieldErrors.icon}
                            />
                            <ImageUpload
                                label="Banner (Ảnh lớn)"
                                currentFile={form.banner}
                                currentImageUrl={form.banner_url}
                                onFileChange={handleBannerChange}
                                onFileRemove={handleBannerRemove}
                                errors={fieldErrors.banner}
                            />

                            {/* **ĐIỂM CHỈNH SỬA**: Thay thế select features bằng checkbox */}
                            <div className="mb-4">
                                <Label text="Features" />
                                <div className="mt-2 grid grid-cols-2 gap-2">
                                    {features.map((feature) => (
                                        <div key={feature.value} className="flex items-center">
                                            <input
                                                type="checkbox"
                                                id={`feature-${feature.value}`}
                                                name="features"
                                                value={feature.value}
                                                checked={form.features.includes(feature.value)}
                                                onChange={(e) => handleCheckboxChange(e, "features")}
                                                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                            />
                                            <label
                                                htmlFor={`feature-${feature.value}`}
                                                className="ml-2 text-sm text-gray-700"
                                            >
                                                {feature.label}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                                {fieldErrors.features &&
                                    fieldErrors.features.map((error, index) => (
                                        <p key={index} className="text-red-500 text-xs mt-1">
                                            {error}
                                        </p>
                                    ))}
                            </div>

                            <div className="mb-4">
                                <Label text="Hiển thị trên ứng dụng/website" htmlFor="is_visible" />
                                <select
                                    id="is_visible"
                                    name="is_visible"
                                    value={form.is_visible ? "true" : "false"}
                                    onChange={handleChange}
                                    className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                                        fieldErrors.is_visible ? "border-red-500" : "border-gray-300"
                                    }`}
                                >
                                    <option value="true">Có</option>
                                    <option value="false">Không</option>
                                </select>
                                {fieldErrors.is_visible &&
                                    fieldErrors.is_visible.map((error, index) => (
                                        <p key={index} className="text-red-500 text-xs mt-1">
                                            {error}
                                        </p>
                                    ))}
                            </div>
                        </div>
                    </section>

                    <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 mt-6">
                        <button
                            type="button"
                            onClick={() => navigate("/admin/transportations")}
                            className="px-5 py-2 bg-gray-300 text-gray-800 rounded-md font-medium hover:bg-gray-400 transition-colors"
                        >
                            Hủy
                        </button>
                        <button
                            type="button"
                            onClick={handleReset}
                            className="px-5 py-2 bg-gray-600 text-white rounded-md font-medium hover:bg-gray-700 transition-colors"
                            disabled={submitting}
                        >
                            Đặt lại
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className={`px-5 py-2 rounded-md font-medium text-white transition-colors ${
                                submitting
                                    ? "bg-blue-300 cursor-not-allowed"
                                    : "bg-blue-600 hover:bg-blue-700"
                            }`}
                        >
                            {submitting ? "Đang lưu..." : "Lưu chỉnh sửa"}
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
};

export default EditTransportationComponent;