import React, { useState, useEffect, useRef } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { FiGift, FiSun, FiDollarSign, FiFilter, FiMapPin, FiCalendar, FiCloud, FiAlertCircle, FiCheckCircle, FiX, FiMessageCircle } from 'react-icons/fi';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { getAllCheckinPlaces } from '../../../services/ui/CheckinPlace/checkinPlaceService';
import usePlacesAutocomplete, { getGeocode, getLatLng } from "use-places-autocomplete";
import FeaturedActivities from './FeaturedActivities';


// Danh sách địa điểm mẫu để gợi ý
const locationSuggestions = [
  { name: 'Hồ Chí Minh', detail: 'Ho Chi Minh City, Vietnam' },
  { name: 'Hà Nội', detail: 'Hanoi, Vietnam' },
  { name: 'Đà Nẵng', detail: 'Da Nang, Vietnam' },
  { name: 'Nha Trang', detail: 'Khanh Hoa, Vietnam' },
  { name: 'Hạ Long', detail: 'Quang Ninh, Vietnam' },
  { name: 'Phú Quốc', detail: 'Kien Giang, Vietnam' },
  { name: 'Sa Pa', detail: 'Lao Cai, Vietnam' },
  { name: 'Hội An', detail: 'Quang Nam, Vietnam' },
  { name: 'Huế', detail: 'Thua Thien Hue, Vietnam' },
  { name: 'Vũng Tàu', detail: 'Ba Ria - Vung Tau, Vietnam' },
  { name: 'Cần Thơ', detail: 'Can Tho, Vietnam' },
  { name: 'Đà Lạt', detail: 'Lam Dong, Vietnam' },
];

export default function Sidebar({ onCreateEvent, onAIGenerateEvents, onAILoadingChange, onAIConfirmModal, onShowToast, onOpenAITravelModal }) {
  const [date, setDate] = useState(new Date());
  const [address, setAddress] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredLocations, setFilteredLocations] = useState([]);
  const [loadingLocations, setLoadingLocations] = useState(false);
  const debounceRef = useRef();
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)); // 3 ngày sau
  const [budget, setBudget] = useState(10000000);
  const [suggestWeather, setSuggestWeather] = useState(true);
  const [allPlaces, setAllPlaces] = useState([]);
  const [suggestBudget, setSuggestBudget] = useState(true);
  const [message, setMessage] = useState('');
  const [showMessage, setShowMessage] = useState(false);
  const [events, setEvents] = useState([]); // New: store created events
  const [showToast, setShowToast] = useState(false);
  const [toastEvent, setToastEvent] = useState(null);
  const [toastProgress, setToastProgress] = useState(0);
  const toastTimerRef = useRef();
  const [showAddModal, setShowAddModal] = useState(false);
  const [addEventData, setAddEventData] = useState({
    title: '',
    startDate: '',
    endDate: '',
    location: '',
    description: ''
  });
  const calendarRef = useRef();
  const [isAILoading, setIsAILoading] = useState(false);


  // Update parent's AI loading state
  const updateAILoading = (loading) => {
    setIsAILoading(loading);
    if (onAILoadingChange) {
      onAILoadingChange(loading);
    }
  };

  const showPopupMessage = (msg, type = 'success') => {
    if (onShowToast) {
      onShowToast(msg, type);
    } else {
      // Fallback to old method if prop not provided
      setMessage(msg);
      setShowMessage(true);
      setTimeout(() => setShowMessage(false), 3000);
    }
  };



  // Fetch toàn bộ địa điểm, khách sạn, nhà hàng 1 lần khi mount
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoadingLocations(true);
        
        // Lấy địa điểm check-in
        const res = await getAllCheckinPlaces();
        const places = res.data?.data || [];
        
        // Lấy khách sạn (nếu có API)
        let hotels = [];
        try {
          const hotelRes = await fetch('http://localhost:8000/api/hotels');
          if (hotelRes.ok) {
            const hotelData = await hotelRes.json();
            hotels = hotelData.data || [];
          }
        } catch (e) {
          console.log('Không thể lấy dữ liệu khách sạn:', e);
        }
        
        // Lấy nhà hàng (nếu có API)
        let restaurants = [];
        try {
          const restaurantRes = await fetch('http://localhost:8000/api/Restaurant');
          if (restaurantRes.ok) {
            const restaurantData = await restaurantRes.json();
            restaurants = restaurantData.data || [];
          }
        } catch (e) {
          console.log('Không thể lấy dữ liệu nhà hàng:', e);
        }
        
        // Kết hợp tất cả dữ liệu
        const allData = [
          ...places.map(p => ({ ...p, type: 'place' })),
          ...hotels.map(h => ({ ...h, type: 'hotel' })),
          ...restaurants.map(r => ({ ...r, type: 'restaurant' }))
        ];
        
        if (mounted) setAllPlaces(allData);
        console.log('Loaded data:', { places: places.length, hotels: hotels.length, restaurants: restaurants.length });
      } catch (e) {
        if (mounted) setAllPlaces([]);
      } finally {
        if (mounted) setLoadingLocations(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

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

  useEffect(() => {
    if (!ready) {
      console.log('Google Places API chưa sẵn sàng');
    } else {
      console.log('Google Places API đã sẵn sàng');
    }
  }, [ready]);

  // Đợi Google Maps API load xong
  useEffect(() => {
    const checkGoogleMapsLoaded = () => {
      if (window.google && window.google.maps && window.google.maps.places) {
        console.log('Google Maps Places API đã được load');
      } else {
        console.log('Đang đợi Google Maps Places API...');
        setTimeout(checkGoogleMapsLoaded, 100);
      }
    };
    checkGoogleMapsLoaded();
  }, []);

  // Khi chọn địa điểm từ Google
  const handleSelectPlace = async (description) => {
    try {
      setPlacesValue(description, false);
      setAddress(description);
      clearSuggestions();
      // Nếu muốn lấy lat/lng:
      // const results = await getGeocode({ address: description });
      // const { lat, lng } = await getLatLng(results[0]);
      // setLatLng({ lat, lng });
    } catch (error) {
      console.error('Lỗi khi chọn địa điểm:', error);
      showPopupMessage('Có lỗi xảy ra khi chọn địa điểm. Vui lòng thử lại.', 'error');
    }
  };

  // Khi chọn địa điểm từ dropdown
  const handleSelectLocation = (loc) => {
    setAddress(loc.name);
    setShowDropdown(false);
  };

  // Hàm reset form
  const resetForm = () => {
    setAddress('');
    setStartDate(null);
    setEndDate(null);
    const budgetInput = document.getElementById('sidebar-budget');
    if (budgetInput) budgetInput.value = '';
  };

  // Toast tự động ẩn sau 4s
  useEffect(() => {
    let timer;
    if (showToast) {
      timer = setTimeout(() => setShowToast(false), 4000);
    }
    return () => clearTimeout(timer);
  }, [showToast]);

    // Hàm gợi ý AI - Mở AITravelModal
  const handleAIGenerateSchedule = async () => {
    if (!address || !startDate || !endDate || startDate >= endDate) {
      showPopupMessage('Vui lòng chọn đầy đủ địa điểm, ngày đi phải trước ngày về!', 'error');
      return;
    }
    
    // Tạo form data cho AITravelModal
    const formData = {
      destination: address,
      start_date: startDate.toISOString().slice(0, 10),
      end_date: endDate.toISOString().slice(0, 10),
      budget: budget || 10000000,
      suggestWeather: suggestWeather,
      suggestBudget: suggestBudget
    };



    // Mở AITravelModal
    if (onOpenAITravelModal) {
      onOpenAITravelModal(formData);
    } else {
      showPopupMessage('Tính năng AI Travel chưa sẵn sàng!', 'error');
    }
  };

  // Hàm test kết nối backend và tạo dữ liệu mẫu
  const testBackendConnection = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/checkin-places');
      console.log('Backend connection test:', response.ok);
      return response.ok;
    } catch (error) {
      console.error('Backend connection failed:', error);
      return false;
    }
  };

  // Hàm tạo dữ liệu mẫu dựa trên database thực tế
  const createSampleEvents = () => {
    const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    const events = [];
    
    // Tìm địa điểm phù hợp từ database
    const selectedPlace = allPlaces.find(place => 
      place.name.toLowerCase().includes(address.toLowerCase()) ||
      place.address.toLowerCase().includes(address.toLowerCase())
    );
    
    // Lọc địa điểm theo địa chỉ nhập
    const filteredPlaces = allPlaces.filter(place => {
      const searchTerm = address.toLowerCase();
      return place.name.toLowerCase().includes(searchTerm) ||
             place.address.toLowerCase().includes(searchTerm) ||
             (place.description && place.description.toLowerCase().includes(searchTerm));
    });
    
    // Lấy các địa điểm nổi bật trong khu vực từ database
    const topPlaces = filteredPlaces.filter(place => place.rating >= 4.0).slice(0, 10);
    const freePlaces = filteredPlaces.filter(place => place.is_free === true).slice(0, 5);
    
    // Tạo lịch trình cho từng ngày
    for (let day = 0; day < daysDiff; day++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(currentDate.getDate() + day);
      const dateStr = currentDate.toISOString().slice(0, 10);
      
      // Ngày 1: Khám phá chính
      if (day === 0) {
        events.push({
          title: selectedPlace ? `Tham quan ${selectedPlace.name}` : "Khám phá địa điểm chính",
          start: `${dateStr}T08:00:00`,
          end: `${dateStr}T12:00:00`,
          location: selectedPlace ? selectedPlace.name : address,
          description: selectedPlace ? selectedPlace.description : "Khám phá địa điểm du lịch chính",
          cost: selectedPlace && selectedPlace.price ? `${selectedPlace.price.toLocaleString('vi-VN')} VND` : "Miễn phí",
          weather: "Nắng đẹp, 28°C"
        });
        
        // Tìm nhà hàng gần đó
        const nearbyRestaurants = filteredPlaces.filter(p => p.type === 'restaurant').slice(0, 3);
        const restaurant = nearbyRestaurants[0] || null;
        
        if (restaurant) {
          events.push({
            title: `Ăn trưa tại ${restaurant.name}`,
            start: `${dateStr}T12:30:00`,
            end: `${dateStr}T14:00:00`,
            location: restaurant.name,
            description: restaurant.description || "Thưởng thức ẩm thực đặc trưng của vùng",
            cost: restaurant.price_range === 'low' ? "80.000 VND" : "150.000 VND",
            weather: "Nắng đẹp, 28°C"
          });
        }
      }
      
      // Ngày 2-6: Khám phá các địa điểm nổi bật
      else if (day < 6 && topPlaces.length > 0) {
        const placeIndex = (day - 1) % topPlaces.length;
        const place = topPlaces[placeIndex];
        
        events.push({
          title: `Tham quan ${place.name}`,
          start: `${dateStr}T09:00:00`,
          end: `${dateStr}T11:30:00`,
          location: place.name,
          description: place.description || "Khám phá địa điểm nổi bật",
          cost: place.price ? `${place.price.toLocaleString('vi-VN')} VND` : "Miễn phí",
          weather: "Nắng đẹp, 28°C"
        });
        
        // Tìm nhà hàng gần đó
        const nearbyRestaurants = filteredPlaces.filter(p => p.type === 'restaurant').slice(0, 3);
        const restaurant = nearbyRestaurants[Math.floor(Math.random() * nearbyRestaurants.length)] || null;
        
        if (restaurant) {
          events.push({
            title: `Ăn trưa tại ${restaurant.name}`,
            start: `${dateStr}T12:00:00`,
            end: `${dateStr}T14:00:00`,
            location: restaurant.name,
            description: restaurant.description || "Thưởng thức bữa trưa và nghỉ ngơi",
            cost: restaurant.price_range === 'low' ? "80.000 VND" : "120.000 VND",
            weather: "Nắng đẹp, 28°C"
          });
        }
      }
      
      // Ngày cuối: Tổng kết
      else if (day === daysDiff - 1) {
        // Tìm chợ hoặc trung tâm mua sắm
        const shoppingPlaces = filteredPlaces.filter(p => 
          p.name.toLowerCase().includes('chợ') || 
          p.name.toLowerCase().includes('mall') ||
          p.name.toLowerCase().includes('center')
        );
        const shoppingPlace = shoppingPlaces[0] || null;
        
        if (shoppingPlace) {
          events.push({
            title: `Mua sắm tại ${shoppingPlace.name}`,
            start: `${dateStr}T09:00:00`,
            end: `${dateStr}T11:00:00`,
            location: shoppingPlace.name,
            description: shoppingPlace.description || "Mua sắm quà lưu niệm và đặc sản địa phương",
            cost: shoppingPlace.price ? `${shoppingPlace.price.toLocaleString('vi-VN')} VND` : "Miễn phí",
            weather: "Nắng đẹp, 28°C"
          });
        }
        
        // Tìm nhà hàng cao cấp
        const highEndRestaurants = filteredPlaces.filter(p => 
          p.type === 'restaurant' && p.price_range === 'high'
        );
        const highEndRestaurant = highEndRestaurants[0] || null;
        
        if (highEndRestaurant) {
          events.push({
            title: `Bữa tối tại ${highEndRestaurant.name}`,
            start: `${dateStr}T18:00:00`,
            end: `${dateStr}T20:00:00`,
            location: highEndRestaurant.name,
            description: highEndRestaurant.description || "Thưởng thức bữa tối đặc biệt cuối chuyến đi",
            cost: "300.000 VND",
            weather: "Mát mẻ, 25°C"
          });
        }
      }
      
      // Các ngày khác: Hoạt động tự do hoặc địa điểm cụ thể
      else {
        // Tìm địa điểm miễn phí hoặc có rating cao
        const availablePlaces = filteredPlaces.filter(p => 
          p.is_free === true || p.rating >= 4.0
        ).slice(0, 3);
        
        if (availablePlaces.length > 0) {
          const place = availablePlaces[Math.floor(Math.random() * availablePlaces.length)];
          events.push({
            title: `Tham quan ${place.name}`,
            start: `${dateStr}T10:00:00`,
            end: `${dateStr}T17:00:00`,
            location: place.name,
            description: place.description || "Khám phá địa điểm thú vị",
            cost: place.price ? `${place.price.toLocaleString('vi-VN')} VND` : "Miễn phí",
            weather: "Nắng đẹp, 28°C"
          });
        }
      }
    }
    
    return events;
  };

  return (
    <aside className="relative w-full md:w-[260px] min-w-[200px] max-w-[280px] h-full shadow-xl p-4 pb-10 flex flex-col custom-scrollbar overflow-visible backdrop-blur-sm" style={{ zIndex: 10 }}>
      {/* Nền trắng đục kéo dài với hiệu ứng glass */}
      <div className="absolute inset-0 w-full h-full bg-white/95 backdrop-blur-sm z-0 border border-white/20"></div>
      <div className="relative z-10 flex flex-col flex-1">
        {/* Mini Calendar */}
        <div className="w-full min-w-[200px] max-w-[280px] mx-auto flex justify-center">
          <Calendar
            onChange={setDate}
            value={date}
            locale="vi-VN"
            className="border-none rounded-xl"
            formatMonthYear={(_, date) => `Tháng ${date.getMonth() + 1} năm ${date.getFullYear()}`}
            prev2Label={null}
            next2Label={null}
            navigationLabel={({ date, view, label, locale }) => (
              <div className="flex items-center justify-center text-base font-normal text-gray-600">
                {label}
              </div>
            )}
            formatShortWeekday={(locale, date) => {
              const day = date.getDay();
              if (day === 0) return "CN";
              return `T${day + 1}`;
            }}
            tileClassName={({ date, view, activeStartDate }) => {
              const isToday = date.toDateString() === new Date().toDateString();
              const isOtherMonth = date.getMonth() !== activeStartDate.getMonth();
              let classes = "flex items-center justify-center w-8 h-8 aspect-square rounded-full text-sm";
              if (isToday) classes += " bg-blue-500 text-white";
              if (isOtherMonth) classes += " text-gray-300";
              return classes;
            }}
            dayHeaderContent={info => {
              const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
              return (
                <span className="uppercase text-xs font-normal text-gray-500">{days[info.date.getDay()]}</span>
              );
            }}
          />
        </div>

                 {/* Hoạt động sắp tới */}
         <div>
           <FeaturedActivities 
             selectedDate={date.toISOString().split('T')[0]}
             budget={30000000}
             onActivityClick={(activity) => {
               console.log('Activity clicked:', activity);
             }}
           />
         </div>

         {/* Lên kế hoạch */}
         <div>
           <div className="font-semibold mb-1">Lên kế hoạch chuyến đi</div>
           <form className="flex flex-col gap-2" onSubmit={e => { e.preventDefault(); }}>
             <div style={{ zIndex: 9999 }}>
               <label className="block text-xs font-semibold text-gray-600 mb-1" htmlFor="sidebar-address">Địa chỉ</label>
               <div className="relative">
                 <input
                   id="sidebar-address"
                   type="text"
                   className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full pr-8 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200"
                   placeholder="Nhập địa điểm (Google Maps)"
                   value={placesValue}
                   onChange={e => {
                     setPlacesValue(e.target.value);
                     setAddress(e.target.value);
                   }}
                   autoComplete="off"
                   disabled={!ready}
                 />
                 <FiMapPin className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                   {status === "OK" && data.length > 0 && (
                    <div className="absolute left-0 right-0 bottom-full mb-1 bg-white border border-gray-200 rounded shadow-lg z-[30] max-h-40 overflow-y-auto">
                      {data.map(({ place_id, description }, idx) => (
                        <div
                          key={place_id}
                          className="px-3 py-2 cursor-pointer hover:bg-gray-100 text-sm"
                          onMouseDown={() => handleSelectPlace(description)}
                        >
                          {description}
                        </div>
                      ))}
                    </div>
                  )}
                  {status === "ZERO_RESULTS" && placesValue.length > 2 && (
                    <div className="absolute left-0 right-0 bottom-full mb-1 bg-white border border-gray-200 rounded shadow-lg z-[30] p-2 text-sm text-gray-500">
                      Không tìm thấy địa điểm phù hợp
                    </div>
                  )}
                  {!ready && (
                    <div className="absolute left-0 right-0 bottom-full mb-1 bg-white border border-gray-200 rounded shadow-lg z-[30] p-2 text-sm text-gray-500">
                      Đang tải Google Maps...
                    </div>
                  )}
               </div>
             </div>
             <div>
               <label className="block text-xs font-semibold text-gray-600 mb-1" htmlFor="sidebar-budget">Ngân sách (VND)</label>
               <div className="relative">
                 <input
                   id="sidebar-budget"
                   type="text"
                   className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full pr-8 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200"
                   placeholder="10.000.000"
                   value={budget.toLocaleString('vi-VN')}
                   onChange={e => {
                     const value = e.target.value.replace(/\D/g, '');
                     setBudget(parseInt(value) || 0);
                   }}
                 />
                 <FiDollarSign className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
               </div>
             </div>
             <div className="flex gap-2">
               <div className="w-1/2 relative" style={{ zIndex: 9999 }}>
                 <label className="block text-xs font-semibold text-gray-600 mb-1" htmlFor="sidebar-start-date">Ngày đi</label>
                 <div className="relative">
                   <DatePicker
                     id="sidebar-start-date"
                     selected={startDate}
                     onChange={date => setStartDate(date)}
                     dateFormat="dd/MM/yyyy"
                     placeholderText="dd/mm/yyyy"
                     className="border border-gray-300 rounded-lg px-2 py-1.5 w-full text-xs text-left pr-6 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200"
                     calendarClassName="rounded-xl shadow-lg border border-gray-200"
                     popperPlacement="bottom"
                     maxDate={endDate}
                   />
                   <FiCalendar className="absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-sm" />
                 </div>
               </div>
               <div className="w-1/2 relative" style={{ zIndex: 9999 }}>
                 <label className="block text-xs font-semibold text-gray-600 mb-1" htmlFor="sidebar-end-date">Ngày về</label>
                 <div className="relative">
                   <DatePicker
                     id="sidebar-end-date"
                     selected={endDate}
                     onChange={date => setEndDate(date)}
                     dateFormat="dd/MM/yyyy"
                     placeholderText="dd/mm/yyyy"
                     className="border border-gray-300 rounded-lg px-2 py-1.5 w-full text-xs text-left pr-6 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200"
                     calendarClassName="rounded-xl shadow-lg border border-gray-200"
                     popperPlacement="bottom"
                     minDate={startDate}
                   />
                   <FiCalendar className="absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-sm" />
                 </div>
               </div>
             </div>

             <button
               type="button"
               className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg py-3 mt-2 font-semibold hover:from-blue-600 hover:to-purple-700 shadow-lg transition-all duration-300 transform hover:scale-105"
               onClick={() => {
                 onCreateEvent({
                   location: address,
                   startDate: startDate ? startDate.toISOString().slice(0, 10) : '',
                   endDate: endDate ? endDate.toISOString().slice(0, 10) : '',
                 });
               }}
             >
               Tạo lịch trình
             </button>
           </form>
         </div>

         {/* Gợi ý thông minh */}
         <div className="mb-2">
           <div className="flex items-center gap-2 mb-3">
             <span className="text-lg text-yellow-400"><svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" stroke="#facc15" strokeWidth="2" strokeLinecap="round"/><circle cx="12" cy="12" r="5" stroke="#facc15" strokeWidth="2"/></svg></span>
             <span className="text-base font-bold text-gray-700">Gợi ý thông minh</span>
           </div>
           <div className="flex flex-col gap-4">
                           {/* Card: Theo thời tiết */}
              <div className="relative flex items-center p-3 rounded-lg bg-gradient-to-r from-pink-300 to-pink-400 shadow-md">
                <div className="flex-1 flex flex-col">
                  <div className="flex items-center gap-2">
                    <FiCloud className="text-white text-xl drop-shadow" />
                    <span className="text-base font-bold text-white">Theo thời tiết</span>
                  </div>
                  <span className="text-white text-xs opacity-90 mt-1">Tạo gợi ý hoạt động phù hợp cho thời tiết hôm nay</span>
                </div>
              </div>
              {/* Card: Tối ưu ngân sách */}
              <div className="relative flex items-center p-3 rounded-lg bg-gradient-to-r from-blue-400 to-blue-500 shadow-md">
                <div className="flex-1 flex flex-col">
                  <div className="flex items-center gap-2">
                    <FiDollarSign className="text-white text-xl drop-shadow" />
                    <span className="text-base font-bold text-white">Tối ưu ngân sách</span>
                  </div>
                  <span className="text-white text-xs opacity-90 mt-1">Tạo gợi ý hoạt động tiết kiệm chi phí</span>
                </div>
              </div>
           </div>
         </div>

        {/* Nút Gợi ý lịch trình AI */}
        <div className="mt-4">
          <button 
            className={`rounded-xl py-3 font-semibold flex items-center justify-center gap-2 w-full shadow-lg transition-all duration-300 transform hover:scale-105 ${
              isAILoading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700'
            } text-white`}
            onClick={handleAIGenerateSchedule}
            disabled={isAILoading}
          >
            {isAILoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Đang xử lý AI...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                </svg>
                Gợi ý lịch trình AI
              </>
            )}
          </button>
        </div>
      </div>

      {/* Toast notification */}
      {showToast && toastEvent && (
        <div className="fixed bottom-8 right-8 z-50 bg-green-500 text-white px-6 py-4 rounded-xl shadow-lg flex items-center gap-3 animate-fadeIn">
          <FiCheckCircle className="text-2xl text-white drop-shadow" />
          <div>
            <div className="font-bold">Tạo lịch trình thành công!</div>
            <div className="text-sm">{toastEvent.title}</div>
          </div>
        </div>
      )}



    </aside>
  );
} 