import { useEffect } from "react";
import L from "leaflet";
import "leaflet.gridlayer.googlemutant";
import { useMap } from "react-leaflet";

const GoogleMapsLayer = ({ type = "roadmap" }) => {
  const map = useMap();

  useEffect(() => {
    if (!window.google || !window.google.maps) {
      console.error("Google Maps API chưa được tải.");
      return;
    }

    const googleLayer = L.gridLayer.googleMutant({
      type, // 'roadmap', 'satellite', 'terrain', 'hybrid'
    });

    map.addLayer(googleLayer);

    return () => {
      map.removeLayer(googleLayer);
    };
  }, [map, type]);

  return null;
};

export default GoogleMapsLayer;
