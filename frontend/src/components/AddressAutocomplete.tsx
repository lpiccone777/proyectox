import React, { useRef, useEffect } from 'react';
import { Autocomplete, LoadScript } from '@react-google-maps/api';

interface AddressAutocompleteProps {
  value: {
    address: string;
    city: string;
    province: string;
    postalCode: string;
    latitude?: number;
    longitude?: number;
  };
  onChange: (value: any) => void;
  apiKey: string;
}

const libraries: ("places")[] = ['places'];

const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({ value, onChange, apiKey }) => {
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handlePlaceSelect = () => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      
      if (place.geometry && place.geometry.location) {
        let streetNumber = '';
        let streetName = '';
        let city = '';
        let province = '';
        let country = '';
        let postalCode = '';
        
        // Parse address components
        if (place.address_components) {
          for (const component of place.address_components) {
            const types = component.types;
            
            if (types.includes('street_number')) {
              streetNumber = component.long_name;
            }
            if (types.includes('route')) {
              streetName = component.long_name;
            }
            if (types.includes('locality')) {
              city = component.long_name;
            }
            if (types.includes('administrative_area_level_1')) {
              province = component.long_name;
            }
            if (types.includes('country')) {
              country = component.long_name;
            }
            if (types.includes('postal_code')) {
              postalCode = component.long_name;
            }
          }
        }
        
        const fullAddress = streetNumber ? `${streetName} ${streetNumber}` : streetName;
        
        onChange({
          address: fullAddress || place.formatted_address || '',
          city: city,
          province: province,
          postalCode: postalCode,
          latitude: place.geometry.location.lat(),
          longitude: place.geometry.location.lng(),
        });
      }
    }
  };

  const onLoad = (autocomplete: google.maps.places.Autocomplete) => {
    autocompleteRef.current = autocomplete;
    // Restrict to Argentina
    autocomplete.setComponentRestrictions({ country: 'ar' });
  };

  if (!apiKey || apiKey === 'TU_API_KEY_AQUI') {
    // Fallback to regular inputs if no API key
    return (
      <div className="address-inputs">
        <div className="form-group">
          <label className="form-label">
            <i className="fas fa-map-marker-alt"></i> Dirección
          </label>
          <input
            type="text"
            className="form-control"
            placeholder="Ej: Av. Corrientes 1234"
            value={value.address}
            onChange={(e) => onChange({ ...value, address: e.target.value })}
            required
          />
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Ciudad</label>
            <input
              type="text"
              className="form-control"
              placeholder="Ej: Buenos Aires"
              value={value.city}
              onChange={(e) => onChange({ ...value, city: e.target.value })}
              required
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Provincia</label>
            <select
              className="form-select"
              value={value.province}
              onChange={(e) => onChange({ ...value, province: e.target.value })}
              required
            >
              <option value="">Seleccionar...</option>
              <option value="Buenos Aires">Buenos Aires</option>
              <option value="CABA">Ciudad Autónoma de Buenos Aires</option>
              <option value="Catamarca">Catamarca</option>
              <option value="Chaco">Chaco</option>
              <option value="Chubut">Chubut</option>
              <option value="Córdoba">Córdoba</option>
              <option value="Corrientes">Corrientes</option>
              <option value="Entre Ríos">Entre Ríos</option>
              <option value="Formosa">Formosa</option>
              <option value="Jujuy">Jujuy</option>
              <option value="La Pampa">La Pampa</option>
              <option value="La Rioja">La Rioja</option>
              <option value="Mendoza">Mendoza</option>
              <option value="Misiones">Misiones</option>
              <option value="Neuquén">Neuquén</option>
              <option value="Río Negro">Río Negro</option>
              <option value="Salta">Salta</option>
              <option value="San Juan">San Juan</option>
              <option value="San Luis">San Luis</option>
              <option value="Santa Cruz">Santa Cruz</option>
              <option value="Santa Fe">Santa Fe</option>
              <option value="Santiago del Estero">Santiago del Estero</option>
              <option value="Tierra del Fuego">Tierra del Fuego</option>
              <option value="Tucumán">Tucumán</option>
            </select>
          </div>
        </div>
        
        <div className="form-group">
          <label className="form-label">Código Postal</label>
          <input
            type="text"
            className="form-control"
            placeholder="Ej: 1414"
            value={value.postalCode}
            onChange={(e) => onChange({ ...value, postalCode: e.target.value })}
          />
        </div>
      </div>
    );
  }

  return (
    <LoadScript googleMapsApiKey={apiKey} libraries={libraries}>
      <div className="address-autocomplete">
        <div className="form-group">
          <label className="form-label">
            <i className="fas fa-search"></i> Buscar dirección
          </label>
          <Autocomplete onLoad={onLoad} onPlaceChanged={handlePlaceSelect}>
            <input
              ref={inputRef}
              type="text"
              className="form-control"
              placeholder="Ingresa una dirección y selecciona de la lista"
              style={{ width: '100%' }}
            />
          </Autocomplete>
        </div>
        
        {value.address && (
          <div className="selected-address">
            <h4>Dirección seleccionada:</h4>
            <p><strong>Dirección:</strong> {value.address}</p>
            <p><strong>Ciudad:</strong> {value.city}</p>
            <p><strong>Provincia:</strong> {value.province}</p>
            {value.postalCode && <p><strong>Código Postal:</strong> {value.postalCode}</p>}
            {value.latitude && value.longitude && (
              <p className="text-muted">
                <small>Coordenadas: {value.latitude.toFixed(6)}, {value.longitude.toFixed(6)}</small>
              </p>
            )}
          </div>
        )}
      </div>
    </LoadScript>
  );
};

export default AddressAutocomplete;