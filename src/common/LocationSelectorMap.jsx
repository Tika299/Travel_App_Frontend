import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  MapContainer,
  Marker,
  Popup,
  useMapEvents,
  useMap
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import GoogleMapsLayer from '../components/GoogleMapsLayer'; 

// ✅ Sửa lỗi icon marker không hiển thị
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// ✅ Component cập nhật view của bản đồ khi center thay đổi
const ChangeMapView = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
};

// ✅ Component xử lý sự kiện click trên bản đồ
const MapClickHandler = ({ onMapClick }) => {
  useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;
      onMapClick([lat, lng]);
    }
  });
  return null;
};

const LocationSelectorMap = ({ onLocationSelect, initialLatitude, initialLongitude }) => {
  const defaultPosition = [10.762622, 106.660172]; // TP.HCM
  const [selectedPosition, setSelectedPosition] = useState(
    initialLatitude && initialLongitude
      ? [parseFloat(initialLatitude), parseFloat(initialLongitude)]
      : defaultPosition
  );

  // ✅ Cập nhật vị trí nếu props thay đổi
  useEffect(() => {
    if (initialLatitude && initialLongitude) {
      const lat = parseFloat(initialLatitude);
      const lng = parseFloat(initialLongitude);
      setSelectedPosition([lat, lng]);
    }
  }, [initialLatitude, initialLongitude]);

  // ✅ Hàm khi người dùng chọn vị trí mới (click map hoặc kéo marker)
  const handleLocationChange = (lat, lng) => {
    setSelectedPosition([lat, lng]);
    if (typeof onLocationSelect === 'function') {
      onLocationSelect(lat, lng);
    }
  };

  return (
    <MapContainer
      center={selectedPosition}
      zoom={13}
      scrollWheelZoom
      style={{ height: '400px', width: '100%', borderRadius: '8px', zIndex: 0 }}
    >
      <ChangeMapView center={selectedPosition} zoom={13} />

      {/* ✅ Dùng Google Maps làm layer nền */}
      <GoogleMapsLayer type="roadmap" />

      {/* ✅ Marker có thể kéo */}
      <Marker
        position={selectedPosition}
        draggable
        eventHandlers={{
          dragend: (e) => {
            const { lat, lng } = e.target.getLatLng();
            handleLocationChange(lat, lng);
          }
        }}
      >
        <Popup>
          Vĩ độ: {selectedPosition[0].toFixed(6)} <br />
          Kinh độ: {selectedPosition[1].toFixed(6)}
        </Popup>
      </Marker>

      <MapClickHandler
        onMapClick={([lat, lng]) => handleLocationChange(lat, lng)}
      />
    </MapContainer>
  );
};

// ✅ Kiểm tra props đầu vào
LocationSelectorMap.propTypes = {
  onLocationSelect: PropTypes.func,
  initialLatitude: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  initialLongitude: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default LocationSelectorMap;
