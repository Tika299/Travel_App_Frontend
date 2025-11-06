import React from 'react';
import { MapContainer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import GoogleMapsLayer from './components/GoogleMapsLayer';

// Sửa lỗi icon marker không hiển thị
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function ChangeView({ center }) {
  const map = useMap();
  map.setView(center);
  return null;
}

const MyMap = ({ lat, lng }) => {
  const position = [lat, lng];

  return (
    <MapContainer center={position} zoom={13} style={{ height: '450px', width: '100%' }}>
      <ChangeView center={position} />
      <GoogleMapsLayer type="roadmap" />
      <Marker position={position}>
        <Popup>
          Vĩ độ: {lat} <br />
          Kinh độ: {lng}
        </Popup>
      </Marker>
    </MapContainer>
  );
};

export default MyMap;
