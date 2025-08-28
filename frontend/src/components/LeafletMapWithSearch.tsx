import React, { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import { OpenStreetMapProvider } from 'leaflet-geosearch';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface LocationData {
  address: string;
  city: string;
  province: string;
  postalCode: string;
  latitude?: number;
  longitude?: number;
}

interface LeafletMapWithSearchProps {
  value: LocationData;
  onChange: (value: LocationData) => void;
}

// Component for handling map clicks and marker placement
const LocationMarker: React.FC<{
  position: [number, number] | null;
  onLocationSelect: (lat: number, lng: number) => void;
}> = ({ position, onLocationSelect }) => {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });

  return position ? <Marker position={position} /> : null;
};

// Component to update map center when address changes
const MapUpdater: React.FC<{ center: [number, number] }> = ({ center }) => {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  
  return null;
};

const LeafletMapWithSearch: React.FC<LeafletMapWithSearchProps> = ({ value, onChange }) => {
  const [markerPosition, setMarkerPosition] = useState<[number, number] | null>(
    value.latitude && value.longitude ? [value.latitude, value.longitude] : null
  );
  const [mapCenter, setMapCenter] = useState<[number, number]>(
    value.latitude && value.longitude 
      ? [value.latitude, value.longitude]
      : [-34.6037, -58.3816] // Buenos Aires default
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const provider = new OpenStreetMapProvider({
    params: {
      countrycodes: 'ar', // Restrict to Argentina
      'accept-language': 'es', // Spanish language
      limit: 5,
    }
  });

  const handleSearch = useCallback(async (query: string) => {
    if (query.length < 3) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const results = await provider.search({ query });
      setSearchResults(results);
      setShowResults(true);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    }
    setIsSearching(false);
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleSearch(searchQuery);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, handleSearch]);

  const handleResultSelect = async (result: any) => {
    const lat = result.y;
    const lng = result.x;
    
    // Get detailed information through reverse geocoding
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&accept-language=es`
      );
      const data = await response.json();
      
      let address = '';
      let city = '';
      let province = '';
      let postalCode = '';
      
      if (data.address) {
        // Build the street address
        const streetName = data.address.road || data.address.pedestrian || '';
        const houseNumber = data.address.house_number || '';
        address = houseNumber ? `${streetName} ${houseNumber}` : streetName;
        
        // Get city (trying different fields in order of preference)
        city = data.address.city || 
               data.address.town || 
               data.address.village || 
               data.address.municipality ||
               data.address.suburb ||
               data.address.neighbourhood || '';
        
        // Get province/state
        province = data.address.state || data.address.state_district || '';
        
        // Clean up common province names
        if (province === 'Ciudad Autónoma de Buenos Aires' || province === 'Buenos Aires F.D.') {
          province = 'CABA';
          if (!city) city = 'Buenos Aires';
        } else if (province === 'Buenos Aires') {
          province = 'Buenos Aires';
        }
        
        // Get postal code
        postalCode = data.address.postcode || '';
      }
      
      // If we didn't get good data from reverse geocoding, parse the label
      if (!address || !city) {
        const labelParts = result.label.split(', ');
        if (!address) address = labelParts[0];
        if (!city && labelParts.length > 1) city = labelParts[1];
        if (!province && labelParts.length > 2) province = labelParts[labelParts.length - 2];
      }

      const newLocation = {
        address: address || result.label.split(',')[0],
        city: city,
        province: province,
        postalCode: postalCode,
        latitude: lat,
        longitude: lng,
      };

      onChange(newLocation);
      setMarkerPosition([lat, lng]);
      setMapCenter([lat, lng]);
      setSearchQuery(address || result.label);
      setShowResults(false);
    } catch (error) {
      console.error('Error getting detailed location:', error);
      // Fallback to basic parsing
      const labelParts = result.label.split(', ');
      const newLocation = {
        address: labelParts[0],
        city: labelParts[1] || '',
        province: labelParts[2] || '',
        postalCode: '',
        latitude: lat,
        longitude: lng,
      };
      onChange(newLocation);
      setMarkerPosition([lat, lng]);
      setMapCenter([lat, lng]);
      setSearchQuery(result.label);
      setShowResults(false);
    }
  };

  const handleMapClick = async (lat: number, lng: number) => {
    setMarkerPosition([lat, lng]);
    
    // Reverse geocoding with detailed address
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&accept-language=es`
      );
      const data = await response.json();
      
      if (data && data.address) {
        // Build the street address
        const streetName = data.address.road || data.address.pedestrian || '';
        const houseNumber = data.address.house_number || '';
        const address = houseNumber ? `${streetName} ${houseNumber}` : streetName;
        
        // Get city (trying different fields)
        const city = data.address.city || 
                    data.address.town || 
                    data.address.village || 
                    data.address.municipality ||
                    data.address.suburb ||
                    data.address.neighbourhood || '';
        
        // Get province
        let province = data.address.state || data.address.state_district || '';
        
        // Clean up province names
        if (province === 'Ciudad Autónoma de Buenos Aires' || province === 'Buenos Aires F.D.') {
          province = 'CABA';
        }
        
        const postalCode = data.address.postcode || '';
        
        onChange({
          address: address,
          city: city === 'Buenos Aires' && province === 'CABA' ? 'Buenos Aires' : city,
          province: province,
          postalCode: postalCode,
          latitude: lat,
          longitude: lng,
        });
        
        setSearchQuery(address || data.display_name.split(',')[0]);
      } else {
        onChange({
          ...value,
          latitude: lat,
          longitude: lng,
        });
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      onChange({
        ...value,
        latitude: lat,
        longitude: lng,
      });
    }
  };

  const provinces = [
    'Buenos Aires', 'CABA', 'Catamarca', 'Chaco', 'Chubut', 'Córdoba',
    'Corrientes', 'Entre Ríos', 'Formosa', 'Jujuy', 'La Pampa', 'La Rioja',
    'Mendoza', 'Misiones', 'Neuquén', 'Río Negro', 'Salta', 'San Juan',
    'San Luis', 'Santa Cruz', 'Santa Fe', 'Santiago del Estero',
    'Tierra del Fuego', 'Tucumán'
  ];

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
          <i className="fas fa-search"></i> Buscar dirección
        </label>
        
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowResults(true);
            }}
            onFocus={() => searchResults.length > 0 && setShowResults(true)}
            placeholder="Buscar calle, avenida o lugar en Argentina..."
            style={{
              width: '100%',
              padding: '12px',
              fontSize: '14px',
              border: '1px solid #ddd',
              borderRadius: '8px',
              outline: 'none',
            }}
          />
          
          {isSearching && (
            <div style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
            }}>
              Buscando...
            </div>
          )}
          
          {showResults && searchResults.length > 0 && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              backgroundColor: 'white',
              border: '1px solid #ddd',
              borderRadius: '8px',
              marginTop: '4px',
              maxHeight: '200px',
              overflowY: 'auto',
              zIndex: 1000,
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            }}>
              {searchResults.map((result, index) => (
                <div
                  key={index}
                  onClick={() => handleResultSelect(result)}
                  style={{
                    padding: '12px',
                    cursor: 'pointer',
                    borderBottom: index < searchResults.length - 1 ? '1px solid #f0f0f0' : 'none',
                    transition: 'background-color 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f5f5f5';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'white';
                  }}
                >
                  <div style={{ fontSize: '14px', color: '#333' }}>
                    {result.label}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {(value.address || value.city || value.province) && (
        <div style={{ 
          backgroundColor: '#f0f9ff', 
          padding: '16px', 
          borderRadius: '8px', 
          marginBottom: '20px',
          border: '1px solid #0ea5e9'
        }}>
          <h4 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#0369a1' }}>
            📍 Ubicación seleccionada
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: '500', color: '#64748b' }}>
                Dirección
              </label>
              <input
                type="text"
                value={value.address}
                onChange={(e) => onChange({ ...value, address: e.target.value })}
                placeholder="Calle y número"
                style={{
                  width: '100%',
                  padding: '8px',
                  fontSize: '14px',
                  border: '1px solid #cbd5e1',
                  borderRadius: '4px',
                  backgroundColor: value.latitude ? '#f8fafc' : 'white',
                }}
              />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: '500', color: '#64748b' }}>
                Ciudad
              </label>
              <input
                type="text"
                value={value.city}
                onChange={(e) => onChange({ ...value, city: e.target.value })}
                placeholder="Ej: Buenos Aires"
                style={{
                  width: '100%',
                  padding: '8px',
                  fontSize: '14px',
                  border: '1px solid #cbd5e1',
                  borderRadius: '4px',
                  backgroundColor: value.latitude ? '#f8fafc' : 'white',
                }}
              />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: '500', color: '#64748b' }}>
                Provincia
              </label>
              <select
                value={value.province}
                onChange={(e) => onChange({ ...value, province: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px',
                  fontSize: '14px',
                  border: '1px solid #cbd5e1',
                  borderRadius: '4px',
                  backgroundColor: value.latitude ? '#f8fafc' : 'white',
                }}
              >
                <option value="">Seleccionar...</option>
                {provinces.map(prov => (
                  <option key={prov} value={prov}>{prov}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: '500', color: '#64748b' }}>
                Código Postal {value.postalCode && '✓'}
              </label>
              <input
                type="text"
                value={value.postalCode}
                onChange={(e) => onChange({ ...value, postalCode: e.target.value })}
                placeholder="Ej: 1714"
                style={{
                  width: '100%',
                  padding: '8px',
                  fontSize: '14px',
                  border: '1px solid #cbd5e1',
                  borderRadius: '4px',
                  backgroundColor: value.postalCode ? '#f8fafc' : 'white',
                }}
              />
            </div>
          </div>
          
          {value.latitude && value.longitude && (
            <div style={{ marginTop: '12px', fontSize: '12px', color: '#64748b' }}>
              Coordenadas: {value.latitude.toFixed(6)}, {value.longitude.toFixed(6)}
            </div>
          )}
        </div>
      )}

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
          <i className="fas fa-map-marked-alt"></i> Haz clic en el mapa para marcar la ubicación exacta
        </label>
        
        <div style={{
          height: '300px',
          borderRadius: '8px',
          overflow: 'hidden',
          border: '1px solid #ddd',
        }}>
          <MapContainer
            center={mapCenter}
            zoom={15}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />
            <LocationMarker 
              position={markerPosition} 
              onLocationSelect={handleMapClick}
            />
            <MapUpdater center={mapCenter} />
          </MapContainer>
        </div>
      </div>

      {value.latitude && value.longitude && value.address && value.city && value.province && (
        <div style={{
          backgroundColor: '#e8f5e9',
          padding: '12px',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <span style={{ fontSize: '20px' }}>✅</span>
          <div>
            <div style={{ fontWeight: '600', color: '#2e7d32' }}>
              Ubicación completa
            </div>
            <div style={{ fontSize: '12px', color: '#388e3c' }}>
              Todos los campos están completos y la ubicación está marcada en el mapa
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeafletMapWithSearch;