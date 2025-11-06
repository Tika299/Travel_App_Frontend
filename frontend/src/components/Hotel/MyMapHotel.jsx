import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";

const YOUR_API_KEY = "AIza..yourKeyhere";

const containerStyle = {
  width: "100%",
  height: "400px",
};

const center = {
  lat: 20.956360424004693,
  lng: 107.02285119039234,
};
export default function MyMapHotel() {
  return (
    <div className="w-full p-4 mx-auto max-w-7xl">
      <h2 className="text-2xl font-bold">Vị trí & bản đồ</h2>
      <LoadScript googleMapsApiKey={"YOUR_API_KEY"}>
        <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={15}>
          <Marker position={center} />
        </GoogleMap>
      </LoadScript>
    </div>
  );
}
