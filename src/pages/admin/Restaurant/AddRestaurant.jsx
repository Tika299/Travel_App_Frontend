"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, MapPin, Upload, Map } from "lucide-react";
import { Button } from "../../ui/Restaurant/button";
import { Input } from "../../ui/Restaurant/input";
import { Textarea } from "../../ui/Restaurant/textarea";
import FieldError from "../../admin/Restaurant/FieldError";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/Restaurant/select";
import { Card, CardContent } from "../../ui/Restaurant/card";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../ui/Restaurant/avatar";
import { restaurantAPI } from "../../../services/ui/Restaurant/restaurantService";

const AddRestaurant = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState(null);
  const [showMap, setShowMap] = useState(false);

  const [form, setForm] = useState({
    name: "",
    description: "",
    rating: "",
    price_range: "",
    address: "",
    latitude: "",
    longitude: "",
    image: null,
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      const file = files[0];
      if (file && file.type.startsWith("image/")) {
        setForm((prev) => ({ ...prev, image: file }));
        setError(null); // reset lỗi nếu có
      } else {
        setError("Vui lòng chọn một file hình ảnh hợp lệ.");
      }
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };
  const ClickHandler = ({ setForm, setShowMap }) => {
    useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;
        setForm((prev) => ({
          ...prev,
          latitude: lat.toFixed(6),
          longitude: lng.toFixed(6),
        }));
        setShowMap(false);
      },
    });
    return null;
  };

  const handleSelectChange = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prevErrors) => {
      const newErrors = { ...prevErrors };
      delete newErrors[name];
      return newErrors;
    });
  };
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError("");
      }, 10000);

      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const newErrors = {};

    if (!form.name) newErrors.name = "Vui lòng nhập tên nhà hàng.";
    if (!form.description) newErrors.description = "Vui lòng nhập mô tả.";
    if (!form.price_range) newErrors.price_range = "Vui lòng chọn mức giá.";
    if (!form.latitude) newErrors.latitude = "Vui lòng nhập vĩ độ.";
    if (!form.longitude) newErrors.longitude = "Vui lòng nhập kinh độ.";
    if (!form.address) newErrors.address = "Vui lòng nhập địa chỉ.";
    if (!form.rating) newErrors.rating = "Vui lòng chọn đánh giá.";
    if (!form.image) newErrors.image = "Vui lòng chọn ảnh.";

    if (Object.keys(newErrors).length > 0) {
      setFieldErrors(newErrors);
      setLoading(false);
      return;
    }

    setFieldErrors({});

    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("description", form.description);
    formData.append("rating", form.rating);
    formData.append("price_range", form.price_range);
    formData.append("latitude", form.latitude);
    formData.append("longitude", form.longitude);
    formData.append("address", form.address);
    if (form.image) formData.append("image", form.image);

    try {
      await restaurantAPI.create(formData);
      navigate("/admin/Restaurant", {
        state: { successMessage: "Thêm nhà hàng thành công!" },
      });
    } catch (err) {
      if (err.response?.status === 422) {
        const errors = err.response.data.errors;
        const formattedErrors = Object.keys(errors).reduce((acc, key) => {
          acc[key] = errors[key][0];
          return acc;
        }, {});
        setFieldErrors(formattedErrors);
      } else {
        setError("Lỗi máy chủ. Vui lòng thử lại sau.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setForm({
      name: "",
      description: "",
      rating: "",
      price_range: "",
      address: "",
      latitude: "",
      longitude: "",
      image: null,
    });
    setError(null);
  };
  const translateError = (message) => {
    const translations = {
      "The name field must not be greater than 255 characters.":
        "Tên không được vượt quá 255 ký tự.",
      "The description field must not be greater than 1000 characters.":
        "Mô tả không được vượt quá 1000 ký tự.",
      "The address field must not be greater than 500 characters.":
        "Địa chỉ không được vượt quá 500 ký tự.",
      "The latitude field must be between -90 and 90.":
        "Vĩ độ phải nằm trong khoảng -90 đến 90.",
      "The longitude field must be between -180 and 180.":
        "Kinh độ phải nằm trong khoảng -180 đến 180.",
      "The price range field is required.": "Khoảng giá là bắt buộc.",
      "The image must be an image.": "Ảnh tải lên không hợp lệ.",
      "The image may not be greater than 2048 kilobytes.":
        "Ảnh không được vượt quá 2MB.",
    };

    return translations[message] || message;
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      {/* Header */}
      <header className="bg-white border-b border-[#ebebeb] px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-[#000000]">
          Thêm nhà hàng/quán ăn
        </h1>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Bell className="w-5 h-5 text-[#8b8b8b]" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#f73333] rounded-full"></div>
          </div>
          <div className="flex items-center gap-2">
            <Avatar className="w-8 h-8">
              <AvatarImage src="/placeholder.svg?height=32&width=32" />
              {/*Để Avatar*/}
              <AvatarFallback>A</AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium text-[#000000]">Admin</span>
          </div>
        </div>
      </header>
      {showMap && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded-lg w-[90%] h-[500px] relative">
            <button
              onClick={() => setShowMap(false)}
              className="absolute top-2 right-2 text-gray-500 text-xl"
            >
              ✕
            </button>

            <MapContainer
              center={[
                parseFloat(form.latitude) || 21.0286,
                parseFloat(form.longitude) || 105.8342,
              ]}
              zoom={13}
              scrollWheelZoom={true}
              className="h-full w-full rounded"
              whenCreated={(map) => setTimeout(() => map.invalidateSize(), 0)}
            >
              <ClickHandler setForm={setForm} setShowMap={setShowMap} />

              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              <Marker
                position={[
                  parseFloat(form.latitude) || 21.0286,
                  parseFloat(form.longitude) || 105.8342,
                ]}
              />
            </MapContainer>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-6">
        <Card className="max-w-4xl mx-auto">
          <CardContent className="p-6">
            {/* Info Banner */}
            <div className="bg-[#e3f2fd] border border-[#02abff] rounded-lg p-4 mb-6 flex items-start gap-3">
              <div className="w-5 h-5 bg-[#02abff] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
              <div>
                <div className="font-medium text-[#000000] mb-1">
                  Bắt đầu điền thông tin nhà hàng/quán ăn
                </div>
                <div className="text-sm text-[#8b8b8b]">
                  Điền đầy đủ thông tin để thêm nhà hàng/quán ăn mới
                </div>
              </div>
            </div>

            {/* Error Message */}
            {Array.isArray(error) && error.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-600 font-semibold mb-2">
                  Đã xảy ra lỗi:
                </p>
                <ul className="text-red-600 text-sm list-disc pl-5">
                  {error.map((err, index) => (
                    <li key={index}>{translateError(err)}</li>
                  ))}
                </ul>
              </div>
            )}

            {Object.keys(fieldErrors).length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-600 text-sm font-semibold mb-2">
                  Đã xảy ra lỗi:
                </p>
                <ul className="list-disc list-inside text-red-600 text-sm">
                  {Object.entries(fieldErrors).map(
                    ([field, message], index) => (
                      <li key={index}>{message}</li>
                    )
                  )}
                </ul>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info Section */}
              <div className="flex items-center gap-2 mb-4">
                <div className="w-5 h-5 bg-[#02abff] rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <span className="font-medium text-[#000000]">
                  Thông tin cơ bản
                </span>
              </div>

              {/* Restaurant Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#000000]">
                  Tên nhà hàng/quán ăn <span className="text-[#f73333]">*</span>
                </label>
                <Input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Nhập tên nhà hàng/quán ăn..."
                  className={`border ${
                    fieldErrors.name ? "border-red-500" : "border-[#ebebeb]"
                  }`}
                  //required
                />
                <FieldError field="name" errors={fieldErrors} />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#000000]">
                  Mô tả
                </label>
                <Textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Viết mô tả chi tiết về nhà hàng/quán ăn..."
                  className={`border ${
                    fieldErrors.description
                      ? "border-red-500"
                      : "border-[#ebebeb]"
                  }`}
                  rows={4}
                  // required
                />
                <FieldError field="description" errors={fieldErrors} />
              </div>

              {/* Rating Dropdowns */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#000000]">
                    Đánh giá
                  </label>
                  <Select
                    value={form.rating}
                    onValueChange={(value) =>
                      handleSelectChange("rating", value)
                    }
                  >
                    <SelectTrigger
                      className={`border ${
                        fieldErrors.rating
                          ? "border-red-500"
                          : "border-[#ebebeb]"
                      }`}
                    >
                      <SelectValue placeholder="-- Chọn đánh giá --" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <SelectItem key={star} value={star.toString()}>
                          {star} sao
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldError field="rating" errors={fieldErrors} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#000000]">
                    Khoảng giá
                  </label>
                  <Select
                    value={form.price_range}
                    onValueChange={(value) =>
                      handleSelectChange("price_range", value)
                    }
                  >
                    <SelectTrigger
                      className={`border ${
                        fieldErrors.price_range
                          ? "border-red-500"
                          : "border-[#ebebeb]"
                      }`}
                    >
                      <SelectValue placeholder="Chọn mức giá" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="100,000 - 300,000 VND">
                        100,000 - 300,000 VND
                      </SelectItem>
                      <SelectItem value="300,000 - 500,000 VND">
                        300,000 - 500,000 VND
                      </SelectItem>
                      <SelectItem value="500,000 - 800,000 VND">
                        500,000 - 800,000 VND
                      </SelectItem>
                      <SelectItem value="1,000,000 - 1,500,000 VND">
                        1,000,000 - 1,500,000 VND
                      </SelectItem>
                      <SelectItem value="1,800,000 VND">
                        Trên 1,800,000 VND
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FieldError field="price_range" errors={fieldErrors} />
                </div>
              </div>

              {/* Address */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#000000]">
                  Địa chỉ
                </label>
                <Input
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="Nhập địa chỉ chi tiết"
                  className={`border ${
                    fieldErrors.address ? "border-red-500" : "border-[#ebebeb]"
                  }`}
                  // required
                />
                <FieldError field="address" errors={fieldErrors} />
              </div>

              {/* Coordinates Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Map className="w-4 h-4 text-[#02abff]" />
                  <span className="text-sm font-medium text-[#02abff]">
                    Tọa độ địa lý
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#000000]">
                      Kinh độ
                    </label>
                    <div className="relative">
                      <Input
                        name="longitude"
                        type="number"
                        step="any"
                        value={form.longitude}
                        onChange={handleChange}
                        placeholder="105.0345"
                        className={`w-full border px-3 py-2 rounded ${
                          fieldErrors.longitude
                            ? "border-red-500"
                            : "border-gray-300"
                        } pr-10`} // thêm pr-10 để icon không đè chữ
                        // required
                      />
                      <div
                        onClick={() => setShowMap(true)}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                      >
                        <div className="w-6 h-6 bg-[#02abff] rounded flex items-center justify-center">
                          <MapPin className="w-3 h-3 text-white" />
                        </div>
                      </div>
                    </div>
                    <FieldError field="longitude" errors={fieldErrors} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#000000]">
                      Vĩ độ
                    </label>
                    <div className="relative">
                      <Input
                        name="latitude"
                        type="number"
                        step="any"
                        // min="-90"
                        // max="90"
                        value={form.latitude}
                        onChange={handleChange}
                        placeholder="21.0286"
                        className={`border ${
                          fieldErrors.latitude
                            ? "border-red-500"
                            : "border-[#ebebeb]"
                        }`}
                        // // required
                      />
                      <div
                        onClick={() => setShowMap(true)}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                      >
                        <div className="w-6 h-6 bg-[#02abff] rounded flex items-center justify-center">
                          <MapPin className="w-3 h-3 text-white" />
                        </div>
                      </div>
                    </div>
                    <FieldError field="latitude" errors={fieldErrors} />
                  </div>
                </div>

                {/* Location Info Banner */}
                <div className="bg-[#e3f2fd] border border-[#02abff] rounded-lg p-3 flex items-start gap-2">
                  <div className="w-6 h-6 bg-[#02abff] rounded flex items-center justify-center">
                    <MapPin className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-sm text-[#000000]">
                    Nhấn vào nút bản đồ để chọn tọa độ trực tiếp trên bản đồ
                  </span>
                </div>
              </div>
              {/* Image Upload */}
              <div
                className="relative w-full h-64 border-2 border-dashed border-[#ebebeb] rounded-lg overflow-hidden group"
                onDragOver={(e) => e.preventDefault()} // Ngăn chặn hành vi mặc định khi kéo ảnh vào
                onDrop={(e) => {
                  e.preventDefault();
                  const file = e.dataTransfer.files[0];
                  if (file && file.type.startsWith("image/")) {
                    setForm((prev) => ({
                      ...prev,
                      image: file,
                    }));
                  }
                }}
              >
                {/* Hiển thị ảnh nếu đã chọn */}
                {form.image ? (
                  <img
                    src={URL.createObjectURL(form.image)}
                    alt="Ảnh xem trước"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-[#f5f5f5] flex flex-col items-center justify-center gap-2">
                    
                  </div>
                )}

                {/* Overlay chữ + nút đè lên ảnh */}
                <div className="absolute inset-0 bg-black/40 text-white flex flex-col items-center justify-center gap-2 opacity-100 group-hover:opacity-100 transition">
                  <Upload className="w-6 h-6" />
                  <div className="text-sm">
                    {form.image
                      ? "Đã chọn: " + form.image.name
                      : "Kéo thả hoặc bấm để chọn ảnh"}
                  </div>
                  <Button
                    type="button"
                    variant="link"
                    className="text-[#02abff] p-0 h-auto"
                    onClick={() =>
                      document.getElementById("image-upload")?.click()
                    }
                  >
                    Chọn file
                  </Button>
                </div>

                <input
                  type="file"
                  name="image"
                  accept="image/*"
                  onChange={handleChange}
                  className="hidden"
                  id="image-upload"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-[#ebebeb]">
                <Button
                  type="button"
                  variant="outline"
                  className="border-[#8b8b8b] text-[#8b8b8b] bg-transparent"
                  onClick={() => navigate(-1)}
                >
                  Hủy
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="border-[#000000] text-[#000000] bg-[#8b8b8b] text-white"
                  onClick={handleReset}
                >
                  Đặt lại
                </Button>
                <Button
                  type="submit"
                  className="bg-[#02abff] hover:bg-[#0554ff] text-white"
                  disabled={loading}
                >
                  {loading ? "Đang lưu..." : "Lưu nhà hàng/quán ăn"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AddRestaurant;
