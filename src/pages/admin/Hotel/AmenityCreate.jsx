import React, { useState, useCallback } from "react";
import axios from "axios";
import Select from "react-select";
import { getAllIconNames, getAmenityIcon } from "../../../services/iconConfig";

export default function AmenityCreate({ onCancel, onSubmit }) {
    // --- STATE ---
    const [form, setForm] = useState({
        name: "",
        react_icon: "",
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Lấy danh sách tên biểu tượng
    const iconOptions = getAllIconNames().map((iconName) => ({
        value: iconName,
        label: iconName,
    }));

    // --- HANDLERS ---
    const handleChange = useCallback((e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: undefined }));
    }, []);

    const handleIconChange = useCallback((selectedOption) => {
        setForm((prev) => ({ ...prev, react_icon: selectedOption ? selectedOption.value : "" }));
        setErrors((prev) => ({ ...prev, react_icon: undefined }));
    }, []);

    const validateForm = () => {
        const newErrors = {};
        if (!form.name.trim()) newErrors.name = "Tên tiện ích không được để trống.";
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
        try {
            const response = await axios.post("http://localhost:8000/api/amenities", form);
            alert("Tạo tiện ích thành công!");
            onSubmit();
        } catch (err) {
            const backendErrors = err.response?.data?.errors || {};
            setErrors(backendErrors);
            alert("Lỗi tạo tiện ích. Vui lòng kiểm tra lại thông tin.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-md">
            <Section title="Thông tin tiện ích" icon="fas fa-concierge-bell">
                <Input
                    label="Tên tiện ích"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="VD: Wifi miễn phí"
                    error={errors.name}
                />
                <div className="space-y-1">
                    <Label>Biểu tượng React (tùy chọn)</Label>
                    <Select
                        options={iconOptions}
                        onChange={handleIconChange}
                        placeholder="Chọn biểu tượng..."
                        isClearable
                        className="text-sm"
                        styles={{
                            control: (base) => ({
                                ...base,
                                borderColor: errors.react_icon ? '#ef4444' : '#d1d5db',
                                '&:hover': { borderColor: errors.react_icon ? '#ef4444' : '#3b82f6' },
                            }),
                        }}
                    />
                    {form.react_icon && (() => {
                        const IconComponent = getAmenityIcon(form.react_icon);
                        return IconComponent ? (
                            <div className="mt-2 flex items-center">
                                <IconComponent className="h-6 w-6 text-blue-400 mr-2" />
                                <span>{form.react_icon}</span>
                            </div>
                        ) : null;
                    })()}
                    {errors.react_icon && <p className="text-red-500 text-xs mt-1">{errors.react_icon}</p>}
                </div>
            </Section>

            <div className="flex justify-end gap-4">
                <button type="button" onClick={onCancel} className="btn border px-4 py-2 rounded-md hover:bg-gray-100">
                    Hủy
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn bg-blue-600 text-white px-4 py-2 rounded-md disabled:bg-blue-300"
                >
                    {isSubmitting ? "Đang lưu..." : "Lưu tiện ích"}
                </button>
            </div>
        </form>
    );
}



// --- UI Components ---
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

const Input = ({ label, name, error, ...rest }) => (
    <div className="space-y-1">
        {label && <Label>{label}</Label>}
        <input
            {...rest}
            name={name}
            className={`w-full rounded-md border border-gray-300 p-2 text-sm focus:border-blue-500 focus:ring-blue-500 ${error ? "border-red-500" : ""}`}
        />
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
);