import React, { useState, useCallback } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

interface MapPickerProps {
  center?: { lat: number; lng: number };
  onLocationSelect?: (location: { lat: number; lng: number; address?: string }) => void;
  apiKey: string;
  height?: string;
}

const defaultCenter = {
  lat: -34.6037, // Buenos Aires
  lng: -58.3816
};

const mapContainerStyle = {
  width: '100%',
  height: '400px'
};

const MapPicker: React.FC<MapPickerProps> = ({ 
  center = defaultCenter, 
  onLocationSelect,
  apiKey,
  height = '400px'
}) => {
  const [markerPosition, setMarkerPosition] = useState(center);
  const [map, setMap] = useState<google.maps.Map | null>(null);

  const onMapClick = useCallback((event: google.maps.MapMouseEvent) => {
    if (event.latLng) {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      setMarkerPosition({ lat, lng });
      
      // Get address from coordinates (reverse geocoding)
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          onLocationSelect?.({
            lat,
            lng,
            address: results[0].formatted_address
          });
        } else {
          onLocationSelect?.({ lat, lng });
        }
      });
    }
  }, [onLocationSelect]);

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  if (!apiKey || apiKey === 'TU_API_KEY_AQUI') {
    return (
      <div style={{ 
        width: '100%', 
        height: height,
        backgroundColor: '#f0f0f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '8px',
        border: '2px dashed #ccc'
      }}>
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <i className="fas fa-map-marked-alt" style={{ fontSize: '48px', color: '#999', marginBottom: '10px' }}></i>
          <p style={{ color: '#666' }}>
            Para habilitar el mapa interactivo, configura tu API key de Google Maps
          </p>
        </div>
      </div>
    );
  }

  return (
    <LoadScript googleMapsApiKey={apiKey}>
      <GoogleMap
        mapContainerStyle={{ ...mapContainerStyle, height }}
        center={center}
        zoom={15}
        onClick={onMapClick}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={{
          streetViewControl: false,
          mapTypeControl: false,
        }}
      >
        <Marker position={markerPosition} />
      </GoogleMap>
    </LoadScript>
  );
};

export default MapPicker;