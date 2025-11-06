import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { createCheckinPlace } from "../../../services/ui/CheckinPlace/checkinPlaceService.js";
import { fetchLocations } from "../../../services/ui/Location/locationService.js";
import { getAllTransportations } from "../../../services/ui/Transportation/transportationService.js";
import LocationSelectorMap from "../../../common/LocationSelectorMap.jsx";

// Import thư viện thông báo
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Khởi tạo form với các giá trị mặc định
const initialForm = {
  name: "",
  description: "",
  address: "",
  latitude: "",
  longitude: "",
  image: null,
  price: "",
  is_free: false,
  start_time: "",
  end_time: "",
  all_day: false,
  transport: "",
  status: "active",
  note: "",
  gallery: [],
  location_id: "",
  region: "",
};

export default function CreateCheckinPlace() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [showMap, setShowMap] = useState(false);
  const [locations, setLocations] = useState([]);
  const [transportationTypes, setTransportationTypes] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const regionOptions = [
    { value: "", label: "--Chọn miền/khu vực--" },
    { value: "Bắc", label: "Miền Bắc" },
    { value: "Trung", label: "Miền Trung" },
    { value: "Nam", label: "Miền Nam" },
  ];

  // Effect để fetch danh sách thành phố và loại phương tiện
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Locations
        const locationsResponse = await fetchLocations();
        if (Array.isArray(locationsResponse) || (locationsResponse && Array.isArray(locationsResponse.data))) {
          setLocations(locationsResponse.data || locationsResponse);
        } else {
          console.error("Unexpected API response for locations:", locationsResponse);
          setLocations([]);
        }

        // Fetch Transportation Types
        const transportResponse = await getAllTransportations();
        if (transportResponse && transportResponse.data && Array.isArray(transportResponse.data.data)) {
          setTransportationTypes(transportResponse.data.data);
        } else {
          console.error("Unexpected API response for transportations:", transportResponse);
          setTransportationTypes([]);
        }
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu ban đầu:", error);
        Swal.fire({
          icon: "error",
          title: "Lỗi",
          text: "Không thể tải dữ liệu cần thiết (thành phố, phương tiện). Vui lòng thử lại.",
        });
      }
    };
    fetchData();
  }, []);

  /* -------------------------- Các hàm xử lý thay đổi form --------------------------- */

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    let finalValue = value;

    if (name === "location_id" && value === "") {
      finalValue = null;
    } else if (type === "number") {
      finalValue = value === "" ? "" : parseFloat(value);
    } else if (type === "checkbox") {
      finalValue = checked;
    }

    setForm((p) => ({ ...p, [name]: finalValue }));
    setErrors((p) => ({ ...p, [name]: undefined }));
  }, []);

  const handleFile = useCallback((e, field, index = null) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn một tệp ảnh hợp lệ.");
      return;
    }

    if (field === "image") {
      setForm((p) => ({ ...p, image: file }));
      setErrors((p) => ({ ...p, image: undefined }));
    } else if (field === "gallery") {
      const nextGallery = [...form.gallery];
      if (index === null) {
        nextGallery.push(file);
      } else {
        nextGallery[index] = file;
      }
      setForm((p) => ({ ...p, gallery: nextGallery }));
      setErrors((p) => ({ ...p, gallery: undefined }));
    }
  }, [form.gallery]);

  const removeGallery = useCallback((idx) => {
    setForm((p) => ({ ...p, gallery: p.gallery.filter((_, i) => i !== idx) }));
    setErrors((p) => ({ ...p, gallery: undefined }));
  }, []);

  const handleLocationSelect = useCallback((lat, lng) => {
    const newLat = typeof lat === "number" ? lat.toFixed(6) : "";
    const newLng = typeof lng === "number" ? lng.toFixed(6) : "";

    setForm((p) => ({ ...p, latitude: newLat, longitude: newLng }));
    setErrors((p) => ({ ...p, latitude: undefined, longitude: undefined }));
    toast.info(`✅ Đã chọn tọa độ: Vĩ độ ${newLat}, Kinh độ ${newLng}`);
  }, []);

  /* --------------------------- Xác thực và Gửi Form --------------------------- */

  const validateForm = () => {
    const newErrors = {};

    // 1. Tên địa điểm
    if (!form.name.trim()) {
      newErrors.name = "Tên địa điểm không được để trống.";
    }

    // 2. Địa chỉ
    if (!form.address.trim()) {
      newErrors.address = "Địa chỉ không được để trống.";
    }

    // 3. Thành phố
    if (!form.location_id) {
      newErrors.location_id = "Vui lòng chọn một thành phố.";
    }

    // 4. Tọa độ (Vĩ độ và Kinh độ)
    if (
      form.latitude === "" ||
      form.longitude === "" ||
      isNaN(parseFloat(form.latitude)) ||
      isNaN(parseFloat(form.longitude))
    ) {
      newErrors.latitude = "Vĩ độ và kinh độ không được để trống hoặc không hợp lệ.";
      newErrors.longitude = "Vĩ độ và kinh độ không được để trống hoặc không hợp lệ.";
    }

    // 5. Giá
    if (!form.is_free && (isNaN(parseFloat(form.price)) || parseFloat(form.price) < 0)) {
      newErrors.price = "Giá phải là một số không âm.";
    }

    // 6. Giờ hoạt động
    if (!form.all_day) {
      if (!form.start_time) {
        newErrors.start_time = "Giờ mở cửa không được để trống.";
      }
      if (!form.end_time) {
        newErrors.end_time = "Giờ đóng cửa không được để trống.";
      }
      if (form.start_time && form.end_time && form.start_time >= form.end_time) {
        newErrors.end_time = "Giờ đóng cửa phải sau giờ mở cửa.";
      }
    }

    // 7. Ảnh chính
    if (!form.image) {
      newErrors.image = "Vui lòng tải lên ảnh chính.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

 const handleSubmit = async (e) => {
  e.preventDefault();
  if (!validateForm()) {
    toast.warn("Vui lòng điền đầy đủ và chính xác các thông tin bắt buộc!");
    // Cuộn trang lên đầu với một độ trễ nhỏ để đảm bảo các lỗi đã render
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 100);
    return;
  }

    setIsSubmitting(true);
    setErrors({});
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (k === "image" && v) {
          fd.append("image", v);
        } else if (k === "gallery") {
          v.forEach((f, i) => f && fd.append(`images[${i}]`, f));
        } else if (k === "start_time" || k === "end_time" || k === "all_day") {
          // Xử lý riêng
        } else if (k === "transport") {
          if (v) fd.append("transport_options", JSON.stringify([v]));
          else fd.append("transport_options", JSON.stringify([]));
        } else if (k === "is_free") {
          fd.append("is_free", v ? "1" : "0");
        } else if (k === "note") {
          if (v !== "" && v !== null) fd.append("caption", v);
        } else if (v !== "" && v !== null) {
          fd.append(k, v);
        }
      });
      const operatingHours = {
        all_day: form.all_day,
        open: form.all_day ? null : form.start_time,
        close: form.all_day ? null : form.end_time,
      };
      fd.append("operating_hours", JSON.stringify(operatingHours));

      await createCheckinPlace(fd);
      toast.success("✅ Tạo địa điểm thành công!");
      navigate("/admin/checkin-places");
    } catch (err) {
      console.error("Lỗi tạo địa điểm:", err.response?.data || err.message);
      if (err.response && err.response.data && err.response.data.errors) {
        const backendErrors = err.response.data.errors;
        const formattedErrors = {};
        for (const key in backendErrors) {
          if (backendErrors.hasOwnProperty(key)) {
            formattedErrors[key] = backendErrors[key][0];
          }
        }
        setErrors(formattedErrors);
        toast.error("❌ Có lỗi xảy ra. Vui lòng kiểm tra lại các trường bị lỗi.");
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        Swal.fire({
          icon: "error",
          title: "Lỗi",
          text: err.response?.data?.message || err.message || "Đã xảy ra lỗi không xác định. Vui lòng thử lại sau.",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    Swal.fire({
      title: "Bạn có chắc chắn không?",
      text: "Tất cả dữ liệu đã nhập sẽ bị xóa!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Vâng, đặt lại!",
      cancelButtonText: "Hủy",
    }).then((result) => {
      if (result.isConfirmed) {
        setForm(initialForm);
        setErrors({});
        toast.info("Đã đặt lại form thành công.");
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 font-sans">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-800">
          Thêm điểm check‑in mới
        </h1>
        <p className="text-sm text-gray-500">
          Thêm những điểm check‑in ấn tượng với người dùng
        </p>
      </div>

      <div className="rounded-lg bg-white shadow-lg">
        <div className="flex items-center gap-3 border-b p-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-500 text-white">
            <i className="fas fa-map-marker-alt" />
          </div>
          <div>
            <p className="font-medium text-gray-800">
              Bắt đầu điền thông tin điểm check‑in
            </p>
            <p className="text-xs text-gray-500">
              Điền đầy đủ thông tin để thêm điểm check‑in mới
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-10 p-6">
          {/* 1. Thông tin cơ bản */}
          <Section title="Thông tin cơ bản" icon="fas fa-info-circle">
            <Input
              name="name"
              label={
                <>
                  Tên địa điểm check‑in <span className="text-red-500">*</span>
                </>
              }
              placeholder="Nhập tên địa điểm...."
              required
              value={form.name}
              onChange={handleChange}
              error={errors.name}
            />
            <Textarea
              name="description"
              label="Mô tả"
              placeholder="Mô tả chi tiết về địa điểm...."
              value={form.description}
              onChange={handleChange}
              error={errors.description}
            />
            <Input
              name="address"
              label={
                <>
                  Địa chỉ <span className="text-red-500">*</span>
                </>}
              placeholder="Nhập địa chỉ chi tiết"
              value={form.address}
              onChange={handleChange}
              error={errors.address}
            />
            <Select
              name="region"
              label="Miền / Khu vực"
              value={form.region}
              onChange={handleChange}
              options={regionOptions}
              error={errors.region}
            />
            <Select
              name="location_id"
              label={
                <>
                  Thành phố <span className="text-red-500">*</span>
                </>
              }
              value={form.location_id}
              onChange={handleChange}
              required
              options={[
                { value: "", label: "--Chọn thành phố--" },
                ...locations.map((loc) => ({ value: loc.id, label: loc.name })),
              ]}
              error={errors.location_id}
            />
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
                  error={errors.latitude}
                  className="flex-1"
                />
                <span className="text-red-500">*</span>
                <button
                  type="button"
                  className="rounded-md bg-blue-500 px-3 text-white"
                  onClick={() => setShowMap((s) => !s)}
                >
                  <i className="fas fa-map-marker-alt" />
                </button>
                <Input
                  type="number"
                  name="longitude"
                  value={form.longitude}
                  onChange={handleChange}
                  placeholder="Kinh độ"
                  step="0.000001"
                  error={errors.longitude}
                  className="flex-1"
                />
                <span className="text-red-500">*</span>
                <button
                  type="button"
                  className="rounded-md bg-blue-500 px-3 text-white"
                  onClick={() => {
                    setForm((p) => ({ ...p, latitude: "", longitude: "" }));
                    setErrors((p) => ({ ...p, latitude: undefined, longitude: undefined }));
                    toast.info("Đã đặt lại tọa độ về rỗng.");
                  }}
                >
                  <i className="fas fa-sync" />
                </button>
              </div>
              <p className="rounded-md bg-blue-100 p-2 text-xs text-blue-700">
                Bạn có thể **nhập trực tiếp tọa độ** vào các ô trên, HOẶC nhấn
                vào nút bản đồ (<i className="fas fa-map-marker-alt text-blue-700"></i>) để mở bản đồ và chọn tọa độ.
                Sau khi chọn trên bản đồ, tọa độ sẽ tự
                động hiển thị tại đây.
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

          {/* 2. Hình ảnh */}
          <Section title="Hình ảnh" icon="fas fa-image">
            <Label text="Ảnh chính" /><span className="text-red-500">*</span>
            <DropZone
              file={form.image}
              onRemove={() => {
                setForm((p) => ({ ...p, image: null }));
                setErrors((p) => ({ ...p, image: undefined }));
              }}
              onChange={(e) => handleFile(e, "image")}
            />
            {errors.image && <p className="text-red-500 text-xs mt-1">{errors.image}</p>}
            <Label text="Thư viện ảnh" className="mt-6" />
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {form.gallery.map((img, i) => (
                img && (
                  <Thumb
                    key={i}
                    src={URL.createObjectURL(img)}
                    onRemove={() => removeGallery(i)}
                    onReplace={(e) => handleFile(e, "gallery", i)}
                  />
                )
              ))}
              <label
                type="button"
                className="flex aspect-video cursor-pointer items-center justify-center rounded-md border-2 border-dashed border-gray-300 text-gray-500"
              >
                <i className="fas fa-plus text-2xl" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFile(e, "gallery", null)}
                  className="hidden"
                />
              </label>
            </div>
            {errors.gallery && <p className="text-red-500 text-xs mt-1">{errors.gallery}</p>}
          </Section>

          {/* 3. Giá cả và Thời gian */}
          <Section title="Giá cả & Thời gian" icon="fas fa-dollar-sign">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Giờ hoạt động */}
              <div className="space-y-6">
                <div className="space-y-3">
                  <Label text={<>Giờ hoạt động <span className="text-red-500">*</span></>} icon="fas fa-clock" />

                  <div className="flex gap-3">
                    <Input
                      type="time"
                      name="start_time"
                      value={form.start_time}
                      onChange={handleChange}
                      disabled={form.all_day}
                      required={!form.all_day}
                      error={errors.start_time}
                      className="flex-1"
                    />
                    <Input
                      type="time"
                      name="end_time"
                      value={form.end_time}
                      onChange={handleChange}
                      disabled={form.all_day}
                      required={!form.all_day}
                      error={errors.end_time}
                      className="flex-1"
                    />
                  </div>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      name="all_day"
                      checked={form.all_day}
                      onChange={handleChange}
                      className="form-checkbox"
                    />{" "}
                    Mở cửa 24/24
                  </label>
                </div>
              </div>

              {/* Giá và Phương tiện */}
              <div className="space-y-6 md:border-l md:pl-6">
                <div className="space-y-2">
                  <Label text={<>Giá (VND) <span className="text-red-500">*</span></>} icon="fas fa-clock" />

                  <div className="flex items-center gap-6 text-sm">
                    <label className="flex items-center gap-1">
                      <input
                        type="radio"
                        name="price_type"
                        checked={!form.is_free}
                        onChange={() => setForm((p) => ({ ...p, is_free: false, price: "" }))}
                        className="form-radio"
                      />
                      Có phí
                    </label>
                    <label className="flex items-center gap-1">
                      <input
                        type="radio"
                        name="price_type"
                        checked={form.is_free}
                        onChange={() => setForm((p) => ({ ...p, is_free: true, price: "0" }))}
                        className="form-radio"
                      />
                      Miễn phí
                    </label>
                  </div>
                  {!form.is_free && (
                    <Input
                      type="number"
                      name="price"
                      value={form.price}
                      onChange={handleChange}
                      min="0"
                      error={errors.price}
                      className="w-full"
                    />
                  )}
                </div>

                <div className="space-y-2">
                  <Label text="Phương tiện di chuyển" icon="fas fa-car" />
                  <Select
                    name="transport"
                    value={form.transport}
                    onChange={handleChange}
                    options={[
                      { value: "", label: "--Chọn phương tiện--" },
                      ...transportationTypes.map((type) => ({
                        value: type.name,
                        label: type.name,
                      })),
                    ]}
                    error={errors.transport}
                    className="w-full"
                  />
                </div>

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
                  error={errors.status}
                />
              </div>
            </div>
          </Section>

          {/* 4. Ghi chú */}
          <Section title="Ghi chú" icon="fas fa-sticky-note">
            <Textarea
              name="note"
              value={form.note}
              onChange={handleChange}
              placeholder="Thêm ghi chú..."
              rows={3}
              error={errors.note}
            />
          </Section>

          {/* Các nút hành động */}
          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="rounded-md border px-6 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              Huỷ
            </button>
            <button
              type="button"
              onClick={handleResetForm}
              className="rounded-md bg-gray-300 px-6 py-2 text-sm text-gray-800 hover:bg-gray-400"
            >
              Đặt lại
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`rounded-md px-6 py-2 text-sm font-medium text-white ${
                isSubmitting ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {isSubmitting ? "Đang lưu..." : "Lưu điểm check‑in"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ----------------------- UI primitives (Các component UI cơ bản) ------------------------ */
// Để giữ code gọn gàng và dễ đọc, tôi đã thêm trường 'error' vào các component này.
const Section = ({ title, icon, children }) => (
  <section className="space-y-6 border-b last:border-0 pb-6 mb-6">
    <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-800">
      <i className={`${icon}`} /> {title}
    </h2>
    {children}
  </section>
);

const Label = ({ text, icon, className = "" }) => (
  <p className={`flex items-center text-sm font-medium text-gray-700 ${className}`}>
    {icon && <i className={`${icon} mr-2`} />} {text}
  </p>
);

const Input = ({ label, name, value, onChange, required = false, type = "text", placeholder = "", readOnly = false, min, max, step, error, className }) => (
  <div className="space-y-1">
    {label && (typeof label === "string" ? <Label text={label} /> : label)}
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
      className={`w-full rounded-md border p-2 text-sm focus:border-blue-500 focus:ring-blue-500 ${className} ${error ? "border-red-500" : "border-gray-300"}`}
    />
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);

const Textarea = ({ label, name, value, onChange, placeholder = "", rows = 3, error }) => (
  <div className="space-y-1">
    {label && (typeof label === "string" ? <Label text={label} /> : label)}
    <textarea
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      className={`w-full rounded-md border p-3 text-sm focus:border-blue-500 focus:ring-blue-500 ${error ? "border-red-500" : "border-gray-300"}`}
    />
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);

const Select = ({ label, options, error, className, ...rest }) => (
  <div className="space-y-1">
    {label && (typeof label === "string" ? <Label text={label} /> : label)}
    <select
      {...rest}
      className={`w-full rounded-md border p-2 text-sm focus:border-blue-500 focus:ring-blue-500 ${className} ${error ? "border-red-500" : "border-gray-300"}`}
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

const DropZone = ({ file, onChange, onRemove }) => (
  <div className="flex flex-col items-center justify-center rounded-md border-2 border-dashed border-gray-300 p-6 text-center">
    {file ? (
      <div className="group relative h-40 w-full">
        <img src={URL.createObjectURL(file)} alt="preview" className="h-full w-full object-cover rounded-md" />
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

const Thumb = ({ src, onRemove, onReplace }) => (
  <div className="group relative aspect-video overflow-hidden rounded-md border">
    <img src={src} alt="thumbnail" className="h-full w-full object-cover" />
    <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black bg-opacity-50 opacity-0 transition-opacity group-hover:opacity-100">
      <label className="cursor-pointer rounded-full bg-blue-500 p-2 text-white">
        <i className="fas fa-pencil-alt text-xs" />
        <input type="file" accept="image/*" onChange={onReplace} className="hidden" />
      </label>
      <button type="button" onClick={onRemove} className="rounded-full bg-red-500 p-2 text-white">
        <i className="fas fa-trash-alt text-xs" />
      </button>
    </div>
  </div>
);