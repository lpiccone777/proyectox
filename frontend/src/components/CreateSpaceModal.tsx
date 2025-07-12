import React, { useState } from 'react';
import { spacesAPI } from '../services/api';
import { useToast } from '../contexts/ToastContext';

interface CreateSpaceModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const CreateSpaceModal: React.FC<CreateSpaceModalProps> = ({ onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const toast = useToast();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'room',
    address: '',
    city: '',
    province: 'Buenos Aires',
    postalCode: '',
    size: '',
    pricePerMonth: '',
    pricePerDay: '',
    features: [] as string[],
    rules: '',
    availability: 'full',
    latitude: '',
    longitude: '',
    minBookingDays: '1',
    maxBookingDays: ''
  });

  const spaceTypes = [
    { value: 'room', label: 'Habitación' },
    { value: 'garage', label: 'Garaje' },
    { value: 'warehouse', label: 'Depósito' },
    { value: 'locker', label: 'Armario/Baulera' },
    { value: 'other', label: 'Otro' }
  ];

  const availabilityTypes = [
    { value: 'full', label: 'Tiempo completo' },
    { value: 'partial', label: 'Horarios específicos' },
    { value: 'flexible', label: 'Flexible' }
  ];

  const provinces = [
    'Buenos Aires', 'Catamarca', 'Chaco', 'Chubut', 'Córdoba', 'Corrientes',
    'Entre Ríos', 'Formosa', 'Jujuy', 'La Pampa', 'La Rioja', 'Mendoza',
    'Misiones', 'Neuquén', 'Río Negro', 'Salta', 'San Juan', 'San Luis',
    'Santa Cruz', 'Santa Fe', 'Santiago del Estero', 'Tierra del Fuego',
    'Tucumán'
  ];

  const amenitiesList = [
    { value: 'security_camera', label: 'Cámaras de seguridad' },
    { value: 'climate_control', label: 'Control de clima' },
    { value: '24_7_access', label: 'Acceso 24/7' },
    { value: 'electricity', label: 'Electricidad' },
    { value: 'lighting', label: 'Iluminación' },
    { value: 'shelving', label: 'Estanterías' },
    { value: 'elevator', label: 'Ascensor' },
    { value: 'parking', label: 'Estacionamiento' }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAmenityToggle = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.includes(amenity)
        ? prev.features.filter(a => a !== amenity)
        : [...prev.features, amenity]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const dataToSend = {
        title: formData.title,
        description: formData.description,
        type: formData.type,
        address: formData.address,
        city: formData.city,
        province: formData.province,
        postalCode: formData.postalCode,
        size: parseFloat(formData.size),
        pricePerMonth: parseFloat(formData.pricePerMonth),
        pricePerDay: formData.pricePerDay ? parseFloat(formData.pricePerDay) : null,
        latitude: formData.latitude ? parseFloat(formData.latitude) : -34.6037, // Default Buenos Aires
        longitude: formData.longitude ? parseFloat(formData.longitude) : -58.3816,
        available: true,
        features: formData.features,
        rules: formData.rules || null,
        minBookingDays: parseInt(formData.minBookingDays) || 1,
        maxBookingDays: formData.maxBookingDays ? parseInt(formData.maxBookingDays) : null
      };

      await spacesAPI.create(dataToSend);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Error al crear el espacio');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '8px',
        maxWidth: '600px',
        width: '90%',
        maxHeight: '90vh',
        overflow: 'auto'
      }}>
        <h2>Crear Nuevo Espacio</h2>
        
        {error && (
          <div style={{
            backgroundColor: '#fee',
            color: '#c00',
            padding: '10px',
            borderRadius: '4px',
            marginBottom: '20px'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Título del espacio *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              placeholder="Ej: Habitación luminosa en Palermo"
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '4px',
                border: '1px solid #ddd'
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Descripción *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              rows={4}
              placeholder="Describe tu espacio, qué lo hace especial, qué puede almacenarse..."
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '4px',
                border: '1px solid #ddd'
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Tipo de espacio *
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                required
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '4px',
                  border: '1px solid #ddd'
                }}
              >
                {spaceTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Tamaño (m²) *
              </label>
              <input
                type="number"
                name="size"
                value={formData.size}
                onChange={handleInputChange}
                required
                min="1"
                step="0.5"
                placeholder="10"
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '4px',
                  border: '1px solid #ddd'
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Dirección *
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              required
              placeholder="Calle y número"
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '4px',
                border: '1px solid #ddd'
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Ciudad *
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                required
                placeholder="Buenos Aires"
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '4px',
                  border: '1px solid #ddd'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Provincia *
              </label>
              <select
                name="province"
                value={formData.province}
                onChange={handleInputChange}
                required
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '4px',
                  border: '1px solid #ddd'
                }}
              >
                {provinces.map(province => (
                  <option key={province} value={province}>{province}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                CP *
              </label>
              <input
                type="text"
                name="postalCode"
                value={formData.postalCode}
                onChange={handleInputChange}
                required
                placeholder="1234"
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '4px',
                  border: '1px solid #ddd'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Precio por mes (ARS) *
              </label>
              <input
                type="number"
                name="pricePerMonth"
                value={formData.pricePerMonth}
                onChange={handleInputChange}
                required
                min="1"
                placeholder="15000"
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '4px',
                  border: '1px solid #ddd'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Precio por día (ARS)
              </label>
              <input
                type="number"
                name="pricePerDay"
                value={formData.pricePerDay}
                onChange={handleInputChange}
                min="1"
                placeholder="800"
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '4px',
                  border: '1px solid #ddd'
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Disponibilidad *
            </label>
            <select
              name="availability"
              value={formData.availability}
              onChange={handleInputChange}
              required
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '4px',
                border: '1px solid #ddd'
              }}
            >
              {availabilityTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
              Comodidades
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
              {amenitiesList.map(amenity => (
                <label key={amenity.value} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formData.features.includes(amenity.value)}
                    onChange={() => handleAmenityToggle(amenity.value)}
                    style={{ marginRight: '8px' }}
                  />
                  {amenity.label}
                </label>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Reglas del espacio
            </label>
            <textarea
              name="rules"
              value={formData.rules}
              onChange={handleInputChange}
              rows={3}
              placeholder="Ej: No se permiten materiales inflamables, horario de acceso de 8:00 a 20:00..."
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '4px',
                border: '1px solid #ddd'
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Días mínimos de reserva *
              </label>
              <input
                type="number"
                name="minBookingDays"
                value={formData.minBookingDays}
                onChange={handleInputChange}
                required
                min="1"
                placeholder="1"
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '4px',
                  border: '1px solid #ddd'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Días máximos de reserva
              </label>
              <input
                type="number"
                name="maxBookingDays"
                value={formData.maxBookingDays}
                onChange={handleInputChange}
                min="1"
                placeholder="Sin límite"
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '4px',
                  border: '1px solid #ddd'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '10px 20px',
                borderRadius: '4px',
                border: '1px solid #ddd',
                backgroundColor: 'white',
                cursor: 'pointer'
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '10px 20px',
                borderRadius: '4px',
                border: 'none',
                backgroundColor: '#4CAF50',
                color: 'white',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1
              }}
            >
              {loading ? 'Creando...' : 'Crear Espacio'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateSpaceModal;