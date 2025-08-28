import React, { useState } from 'react';
import { Space } from '../types';
import BookingModal from './BookingModal';

interface SearchSpacesProps {
  spaces: Space[];
  loading: boolean;
  onSearch: (filters: any) => void;
  onBookingSuccess: () => void;
}

const SearchSpaces: React.FC<SearchSpacesProps> = ({
  spaces,
  loading,
  onSearch,
  onBookingSuccess,
}) => {
  const [selectedSpace, setSelectedSpace] = useState<Space | null>(null);
  const [showFilters, setShowFilters] = useState(true);
  const [filters, setFilters] = useState({
    type: '',
    minPrice: '',
    maxPrice: '',
    minSize: '',
    maxSize: '',
    city: '',
    sortBy: 'relevant',
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getSpaceTypeLabel = (type: string) => {
    const types: { [key: string]: string } = {
      room: 'Habitación',
      garage: 'Garaje',
      warehouse: 'Depósito',
      locker: 'Locker',
      other: 'Otro',
    };
    return types[type] || type;
  };

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onSearch(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      type: '',
      minPrice: '',
      maxPrice: '',
      minSize: '',
      maxSize: '',
      city: '',
      sortBy: 'relevant',
    };
    setFilters(clearedFilters);
    onSearch(clearedFilters);
  };

  return (
    <div style={{ display: 'flex', gap: '24px', position: 'relative' }}>
      {/* Filters Sidebar */}
      <div style={{
        width: showFilters ? '280px' : '0',
        transition: 'width 0.3s ease',
        overflow: 'hidden',
        flexShrink: 0,
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
          position: 'sticky',
          top: '20px',
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#111827',
              margin: 0
            }}>Filtros</h3>
            <button
              onClick={clearFilters}
              style={{
                background: 'none',
                border: 'none',
                color: '#3b82f6',
                fontSize: '14px',
                cursor: 'pointer',
                padding: '4px 8px',
                borderRadius: '6px',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#eff6ff'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              Limpiar
            </button>
          </div>

          {/* Type Filter */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '8px'
            }}>Tipo de espacio</label>
            <select
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                fontSize: '14px',
                color: '#374151',
                backgroundColor: 'white',
                cursor: 'pointer'
              }}
            >
              <option value="">Todos</option>
              <option value="room">Habitación</option>
              <option value="garage">Garaje</option>
              <option value="warehouse">Depósito</option>
              <option value="locker">Locker</option>
              <option value="other">Otro</option>
            </select>
          </div>

          {/* Price Range */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '8px'
            }}>Precio por mes</label>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input
                type="number"
                placeholder="Min"
                value={filters.minPrice}
                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  fontSize: '14px'
                }}
              />
              <span style={{ color: '#9ca3af' }}>-</span>
              <input
                type="number"
                placeholder="Max"
                value={filters.maxPrice}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  fontSize: '14px'
                }}
              />
            </div>
          </div>

          {/* Size Range */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '8px'
            }}>Tamaño (m²)</label>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input
                type="number"
                placeholder="Min"
                value={filters.minSize}
                onChange={(e) => handleFilterChange('minSize', e.target.value)}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  fontSize: '14px'
                }}
              />
              <span style={{ color: '#9ca3af' }}>-</span>
              <input
                type="number"
                placeholder="Max"
                value={filters.maxSize}
                onChange={(e) => handleFilterChange('maxSize', e.target.value)}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  fontSize: '14px'
                }}
              />
            </div>
          </div>

          {/* City Filter */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '8px'
            }}>Ciudad</label>
            <input
              type="text"
              placeholder="Buscar ciudad..."
              value={filters.city}
              onChange={(e) => handleFilterChange('city', e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                fontSize: '14px'
              }}
            />
          </div>
        </div>
      </div>

      {/* Toggle Filters Button */}
      <button
        onClick={() => setShowFilters(!showFilters)}
        style={{
          position: 'absolute',
          left: showFilters ? '268px' : '-12px',
          top: '20px',
          backgroundColor: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '50%',
          width: '32px',
          height: '32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          transition: 'left 0.3s ease',
          zIndex: 10
        }}
      >
        🔍
      </button>

      {/* Main Content */}
      <div style={{ flex: 1 }}>
        {/* Results Header */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '16px 20px',
          marginBottom: '20px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h2 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: '#111827',
              margin: '0 0 4px 0'
            }}>
              {spaces.length} espacios encontrados
            </h2>
            <p style={{
              fontSize: '14px',
              color: '#6b7280',
              margin: 0
            }}>
              en Buenos Aires y alrededores
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              fontSize: '14px',
              color: '#6b7280'
            }}>Ordenar por:</span>
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                fontSize: '14px',
                color: '#374151',
                backgroundColor: 'white',
                cursor: 'pointer'
              }}
            >
              <option value="relevant">Más relevantes</option>
              <option value="price_asc">Menor precio</option>
              <option value="price_desc">Mayor precio</option>
              <option value="size_asc">Menor tamaño</option>
              <option value="size_desc">Mayor tamaño</option>
              <option value="rating">Mejor calificación</option>
            </select>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            backgroundColor: 'white',
            borderRadius: '12px'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
            <p style={{ color: '#6b7280' }}>Buscando espacios...</p>
          </div>
        )}

        {/* No Results */}
        {!loading && spaces.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏠</div>
            <h3 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '8px'
            }}>No encontramos espacios</h3>
            <p style={{
              fontSize: '14px',
              color: '#6b7280'
            }}>Intenta ajustar los filtros o buscar en otra zona</p>
          </div>
        )}

        {/* Results Grid */}
        {!loading && spaces.length > 0 && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: showFilters ? 'repeat(auto-fill, minmax(280px, 1fr))' : 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: '20px'
          }}>
            {spaces.map((space) => (
              <div
                key={space.id}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  cursor: 'pointer'
                }}
                onClick={() => setSelectedSpace(space)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.12)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.08)';
                }}
              >
                {/* Image */}
                <div style={{
                  width: '100%',
                  height: '200px',
                  backgroundColor: '#f3f4f6',
                  position: 'relative'
                }}>
                  {space.images && space.images.length > 0 ? (
                    <img
                      src={space.images[0].url}
                      alt={space.title}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                  ) : (
                    <div style={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#9ca3af'
                    }}>
                      <div style={{ fontSize: '48px' }}>🏠</div>
                    </div>
                  )}
                  
                  {/* Badge */}
                  {space.available && (
                    <div style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      backgroundColor: 'rgba(16, 185, 129, 0.95)',
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}>
                      Disponible
                    </div>
                  )}
                </div>

                {/* Content */}
                <div style={{ padding: '16px' }}>
                  {/* Price */}
                  <div style={{
                    fontSize: '24px',
                    fontWeight: '700',
                    color: '#111827',
                    marginBottom: '8px'
                  }}>
                    {formatPrice(space.pricePerMonth)}
                    <span style={{
                      fontSize: '14px',
                      fontWeight: '400',
                      color: '#6b7280',
                      marginLeft: '4px'
                    }}>/mes</span>
                  </div>

                  {/* Title */}
                  <h3 style={{
                    fontSize: '16px',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '8px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {space.title}
                  </h3>

                  {/* Location */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '13px',
                    color: '#6b7280',
                    marginBottom: '12px'
                  }}>
                    📍
                    <span style={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {space.city}, {space.province}
                    </span>
                  </div>

                  {/* Features */}
                  <div style={{
                    display: 'flex',
                    gap: '12px',
                    fontSize: '13px',
                    color: '#6b7280',
                    borderTop: '1px solid #f3f4f6',
                    paddingTop: '12px'
                  }}>
                    <span>📦 {getSpaceTypeLabel(space.type)}</span>
                    <span>📏 {space.size} m²</span>
                    {space.averageRating && (
                      <span style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '2px'
                      }}>
                        ⭐
                        {space.averageRating.toFixed(1)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {selectedSpace && (
        <BookingModal
          space={selectedSpace}
          onClose={() => setSelectedSpace(null)}
          onSuccess={onBookingSuccess}
        />
      )}
    </div>
  );
};

export default SearchSpaces;