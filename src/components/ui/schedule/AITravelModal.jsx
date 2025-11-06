import React, { useState, useEffect } from 'react';
import { aiTravelService } from '../../../services/aiTravelService';
import usePlacesAutocomplete, { getGeocode, getLatLng } from "use-places-autocomplete";
import { 
    FiX, 
    FiMapPin, 
    FiCalendar, 
    FiDollarSign, 
    FiUsers, 
    FiClock,
    FiStar,
    FiAward,
    FiCheckCircle,
    FiAlertCircle,
    FiCloud,
    FiEye
} from 'react-icons/fi';

const AITravelModal = ({ isOpen, onClose, onSuccess, formData: initialFormData }) => {
    const [formData, setFormData] = useState({
        destination: initialFormData?.destination || '',
        start_date: initialFormData?.start_date || '',
        end_date: initialFormData?.end_date || '',
        budget: initialFormData?.budget || 1000000,
        travelers: 2
    });

    const [suggestWeather, setSuggestWeather] = useState(initialFormData?.suggestWeather || false);
    const [suggestBudget, setSuggestBudget] = useState(initialFormData?.suggestBudget || false);

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState([]);
    const [result, setResult] = useState(null);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [upgradeInfo, setUpgradeInfo] = useState(null);

    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [pendingItinerary, setPendingItinerary] = useState(null);

    // Google Places Autocomplete setup
    const {
        ready,
        value: placesValue,
        setValue: setPlacesValue,
        suggestions: { status, data },
        clearSuggestions,
    } = usePlacesAutocomplete({
        requestOptions: {
            // Optionally restrict to Vietnam
            componentRestrictions: { country: "vn" },
        },
        debounce: 300,
    });

    // Khi chọn địa điểm từ Google
    const handleSelectPlace = async (description) => {
        try {
            setPlacesValue(description, false);
            handleInputChange('destination', description);
            clearSuggestions();
        } catch (error) {
            // Silent error handling
        }
    };

    useEffect(() => {
        if (isOpen) {
            loadUpgradeInfo();
        }
    }, [isOpen]);

    useEffect(() => {
        if (initialFormData) {
            setFormData({
                destination: initialFormData.destination || '',
                start_date: initialFormData.start_date || '',
                end_date: initialFormData.end_date || '',
                budget: initialFormData.budget || 1000000,
                travelers: 2
            });
            setPlacesValue(initialFormData.destination || '', false);
            setSuggestWeather(initialFormData.suggestWeather || false);
            setSuggestBudget(initialFormData.suggestBudget || false);
        }
    }, [initialFormData]);

    const loadUpgradeInfo = async () => {
        try {
            const response = await aiTravelService.getUpgradeInfo();
            setUpgradeInfo(response.data);
        } catch (error) {
            console.error('Error loading upgrade info:', error);
        }
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        setErrors([]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors([]);

        // Validate form data
        const validation = aiTravelService.validateItineraryData(formData);
        if (!validation.isValid) {
            setErrors(validation.errors);
            setLoading(false);
            return;
        }

        try {
            // Thêm thông tin về smart suggestions
            const requestData = {
                ...formData,
                suggestWeather,
                suggestBudget
            };
            
            const response = await aiTravelService.generateItinerary(requestData);
            
            if (response.success) {
                // Hiển thị popup xác nhận thay vì lưu ngay
                setPendingItinerary(response.data.itinerary_data);
                setShowConfirmModal(true);
            } else {
                setErrors([response.message || 'Có lỗi xảy ra']);
            }
        } catch (error) {
            if (error.response?.status === 403 && error.response?.data?.upgrade_required) {
                setShowUpgradeModal(true);
            } else {
                setErrors([error.response?.data?.message || 'Có lỗi xảy ra khi tạo lịch trình']);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmSave = async () => {
        try {
            setLoading(true);
            
            // Thêm thông tin ngày từ formData vào pendingItinerary
            const itineraryData = {
                ...pendingItinerary,
                summary: {
                    ...pendingItinerary.summary,
                    start_date: formData.start_date,
                    end_date: formData.end_date,
                    destination: formData.destination
                }
            };
            
            // Debug log
            console.log('Saving itinerary data:', itineraryData);
            
            // Lưu lịch trình vào database
            const saveResponse = await aiTravelService.saveItinerary(itineraryData);
            
            if (saveResponse.success) {
                setResult(saveResponse.data);
                setShowConfirmModal(false);
                setPendingItinerary(null);
                
                // Gọi callback success để cập nhật dữ liệu
                if (onSuccess) {
                    onSuccess(saveResponse.data);
                }
            } else {
                setErrors([saveResponse.message || 'Có lỗi xảy ra khi lưu lịch trình']);
            }
        } catch (error) {
            setErrors([error.response?.data?.message || 'Có lỗi xảy ra khi lưu lịch trình']);
        } finally {
            setLoading(false);
        }
    };

    const handleCancelSave = () => {
        setShowConfirmModal(false);
        setPendingItinerary(null);
    };

    const handleClose = () => {
        setFormData({
            destination: '',
            start_date: '',
            end_date: '',
            budget: 1000000,
            travelers: 2
        });
        setPlacesValue('', false);
        setErrors([]);
        setResult(null);
        setShowUpgradeModal(false);
        setShowConfirmModal(false);
        setPendingItinerary(null);
        onClose();
    };

    const calculateDays = () => {
        if (formData.start_date && formData.end_date) {
            const start = new Date(formData.start_date);
            const end = new Date(formData.end_date);
            const diffTime = Math.abs(end - start);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays + 1;
        }
        return 0;
    };

    const daysCount = calculateDays();

    if (!isOpen) return null;

    return (
        <div className="ai-travel-modal animate-fadeIn">
            {!showConfirmModal && (
                <div className="bg-white rounded-xl max-w-4xl w-[600px] h-auto overflow-hidden shadow-2xl transform transition-all duration-300 animate-scaleIn mx-4">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b">
                        <div className="flex items-center space-x-2">
                            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                                <FiStar className="text-white text-base" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-gray-800">AI Travel Planning</h2>
                                <p className="text-sm text-gray-600">Tạo lịch trình thông minh dựa trên dữ liệu thực tế</p>
                            </div>
                        </div>
                        <button
                            onClick={handleClose}
                            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <FiX className="text-gray-500 text-sm" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                        {!result ? (
                            // Form
                            <form onSubmit={handleSubmit} className="space-y-3">
                                {/* Destination - Editable with Google Places Autocomplete */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                        <FiMapPin className="inline mr-1" />
                                        Điểm đến
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={placesValue}
                                            onChange={(e) => {
                                                setPlacesValue(e.target.value);
                                                handleInputChange('destination', e.target.value);
                                            }}
                                            className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs pr-8"
                                            placeholder="Nhập địa điểm (Google Maps)"
                                            autoComplete="off"
                                            disabled={!ready}
                                        />
                                        <FiMapPin className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-xs" />
                                        {status === "OK" && data.length > 0 && (
                                            <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded shadow-lg z-[9999] max-h-40 overflow-y-auto">
                                                {data.map(({ place_id, description }, idx) => (
                                                    <div
                                                        key={place_id}
                                                        className="px-3 py-2 cursor-pointer hover:bg-gray-100 text-xs"
                                                        onMouseDown={() => handleSelectPlace(description)}
                                                    >
                                                        {description}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        {status === "ZERO_RESULTS" && placesValue.length > 2 && (
                                            <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded shadow-lg z-[9999] p-2 text-xs text-gray-500">
                                                Không tìm thấy địa điểm phù hợp
                                            </div>
                                        )}
                                        {!ready && (
                                            <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded shadow-lg z-[9999] p-2 text-xs text-gray-500">
                                                Đang tải Google Maps...
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Dates - Editable */}
                                <div className="grid grid-cols-2 gap-2">
                                    <div style={{ zIndex: 50 }}>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">
                                            <FiCalendar className="inline mr-1" />
                                            Ngày bắt đầu
                                        </label>
                                        <input
                                            type="date"
                                            value={formData.start_date}
                                            onChange={(e) => handleInputChange('start_date', e.target.value)}
                                            className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs"
                                            style={{ position: 'relative', zIndex: 50 }}
                                        />
                                    </div>
                                    <div style={{ zIndex: 40 }}>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">
                                            <FiCalendar className="inline mr-1" />
                                            Ngày kết thúc
                                        </label>
                                        <input
                                            type="date"
                                            value={formData.end_date}
                                            onChange={(e) => handleInputChange('end_date', e.target.value)}
                                            className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs"
                                            style={{ position: 'relative', zIndex: 40 }}
                                        />
                                    </div>
                                </div>

                                {/* Days Info */}
                                {daysCount > 0 && (
                                    <div className={`p-1.5 rounded-lg ${daysCount > 5 ? 'bg-yellow-50 border border-yellow-200' : 'bg-blue-50 border border-blue-200'}`}>
                                        <div className="flex items-center">
                                            <FiClock className={`mr-1 text-xs ${daysCount > 5 ? 'text-yellow-600' : 'text-blue-600'}`} />
                                            <span className={`text-xs font-medium ${daysCount > 5 ? 'text-yellow-800' : 'text-blue-800'}`}>
                                                {daysCount} ngày {daysCount > 5 && '(Cần nâng cấp VIP)'}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {/* Smart Suggestions Info */}
                                {(suggestWeather || suggestBudget) && (
                                    <div className="p-2 bg-green-50 border border-green-200 rounded-lg">
                                        <div className="flex items-center mb-1">
                                            <FiStar className="mr-1 text-green-600 text-xs" />
                                            <span className="text-xs font-medium text-green-800">Gợi ý thông minh:</span>
                                        </div>
                                        <div className="space-y-0.5">
                                            {suggestWeather && (
                                                <div className="flex items-center text-xs text-green-700">
                                                    <FiCloud className="mr-1 text-blue-500" />
                                                    <span>Theo thời tiết</span>
                                                </div>
                                            )}
                                            {suggestBudget && (
                                                <div className="flex items-center text-xs text-green-700">
                                                    <FiDollarSign className="mr-1 text-green-500" />
                                                    <span>Tối ưu ngân sách</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Travelers and Budget */}
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">
                                            <FiUsers className="inline mr-1" />
                                            Số người
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.travelers}
                                            onChange={(e) => handleInputChange('travelers', parseInt(e.target.value))}
                                            min="1"
                                            max="10"
                                            className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">
                                            <FiDollarSign className="inline mr-1" />
                                            Ngân sách (VND)
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.budget.toLocaleString('vi-VN')}
                                            onChange={(e) => {
                                                const value = e.target.value.replace(/\D/g, '');
                                                handleInputChange('budget', parseInt(value) || 0);
                                            }}
                                            className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs"
                                            placeholder="10.000.000"
                                        />
                                    </div>
                                </div>

                                {/* Errors */}
                                {errors.length > 0 && (
                                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                                        {errors.map((error, index) => (
                                            <div key={index} className="flex items-center text-red-700">
                                                <FiAlertCircle className="mr-2 flex-shrink-0" />
                                                <span className="text-sm">{error}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`w-full py-4 px-6 rounded-xl font-bold text-white transition-all text-base shadow-lg hover:shadow-xl transform hover:scale-105 ${
                                        loading
                                            ? 'bg-gray-400 cursor-not-allowed'
                                            : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'
                                    }`}
                                >
                                    {loading ? (
                                        <div className="flex items-center justify-center">
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                            <span className="text-base">Đang tạo lịch trình...</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-center">
                                            <FiStar className="mr-2 text-lg" />
                                            <span className="text-base">Tạo lịch trình AI</span>
                                        </div>
                                    )}
                                </button>
                            </form>
                        ) : (
                            // Result
                            <div className="space-y-6">
                                {/* Summary */}
                                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Tóm tắt lịch trình</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-blue-600">{result.data?.summary?.destination || result.summary?.destination}</div>
                                            <div className="text-sm text-gray-600">Điểm đến</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-green-600">{result.data?.summary?.duration || result.summary?.duration}</div>
                                            <div className="text-sm text-gray-600">Thời gian</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-orange-600">{result.data?.summary?.budget || result.summary?.budget}</div>
                                            <div className="text-sm text-gray-600">Ngân sách</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-purple-600">{result.data?.summary?.travelers || result.summary?.travelers}</div>
                                            <div className="text-sm text-gray-600">Số người</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex space-x-4">
                                    <button
                                        onClick={() => setResult(null)}
                                        className="flex-1 py-3 px-6 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                                    >
                                        Tạo lịch trình mới
                                    </button>
                                    <button
                                        onClick={handleClose}
                                        className="flex-1 py-3 px-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all"
                                    >
                                        Hoàn thành
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Upgrade Modal */}
            {showUpgradeModal && upgradeInfo && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-md w-full p-6">
                        <div className="text-center mb-6">
                            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mb-4">
                                <FiAward className="text-white text-2xl" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">Nâng cấp VIP</h3>
                            <p className="text-gray-600">Để tạo lịch trình hơn 5 ngày, bạn cần nâng cấp tài khoản VIP</p>
                        </div>

                        <div className="space-y-4 mb-6">
                            <h4 className="font-semibold text-gray-800">Quyền lợi VIP:</h4>
                            <ul className="space-y-2">
                                {upgradeInfo.vip_benefits.map((benefit, index) => (
                                    <li key={index} className="flex items-center text-sm text-gray-600">
                                        <FiCheckCircle className="text-green-500 mr-2 flex-shrink-0" />
                                        {benefit}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="space-y-4 mb-6">
                            <h4 className="font-semibold text-gray-800">Giá cả:</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="text-center p-3 border border-gray-200 rounded-lg">
                                    <div className="text-lg font-bold text-blue-600">
                                        {new Intl.NumberFormat('vi-VN').format(upgradeInfo.pricing.monthly)} VND
                                    </div>
                                    <div className="text-sm text-gray-600">Tháng</div>
                                </div>
                                <div className="text-center p-3 border border-gray-200 rounded-lg">
                                    <div className="text-lg font-bold text-green-600">
                                        {new Intl.NumberFormat('vi-VN').format(upgradeInfo.pricing.yearly)} VND
                                    </div>
                                    <div className="text-sm text-gray-600">Năm</div>
                                </div>
                            </div>
                        </div>

                        <div className="flex space-x-4">
                            <button
                                onClick={() => setShowUpgradeModal(false)}
                                className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Để sau
                            </button>
                            <button
                                onClick={() => {
                                    // Handle upgrade logic here
                                    window.open(`mailto:${upgradeInfo.contact}?subject=Nâng cấp VIP`, '_blank');
                                }}
                                className="flex-1 py-2 px-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-lg font-semibold hover:from-yellow-500 hover:to-orange-600 transition-all"
                            >
                                Liên hệ nâng cấp
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirm Save Modal */}
            {showConfirmModal && pendingItinerary && (
                <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-2xl">
                        <div className="text-center mb-6">
                            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center mb-4">
                                <FiCheckCircle className="text-white text-2xl" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">Xác nhận lưu lịch trình</h3>
                            <p className="text-gray-600">Bạn có muốn lưu lịch trình này vào hệ thống không?</p>
                        </div>

                        <div className="space-y-4 mb-6">
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="font-semibold text-gray-800 mb-2">Thông tin lịch trình:</h4>
                                <div className="space-y-2 text-sm text-gray-600">
                                    <div><strong>Điểm đến:</strong> {formData.destination}</div>
                                    <div><strong>Số ngày:</strong> {calculateDays()} ngày</div>
                                    <div><strong>Tổng chi phí:</strong> {new Intl.NumberFormat('vi-VN').format(pendingItinerary.summary?.total_cost || 0)} VND</div>
                                    <div><strong>Số hoạt động:</strong> {pendingItinerary.days?.reduce((total, day) => total + (day.activities?.length || 0), 0) || 0} hoạt động</div>
                                </div>
                            </div>
                        </div>

                        <div className="flex space-x-4">
                            <button
                                onClick={handleCancelSave}
                                disabled={loading}
                                className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleConfirmSave}
                                disabled={loading}
                                className="flex-1 py-2 px-4 bg-gradient-to-r from-green-400 to-blue-500 text-white rounded-lg font-semibold hover:from-green-500 hover:to-blue-600 transition-all disabled:opacity-50"
                            >
                                {loading ? 'Đang lưu...' : 'Lưu lịch trình'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AITravelModal;
