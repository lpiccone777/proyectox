import React, { useState } from 'react';

interface SpaceImage {
  id: number;
  url: string;
  order: number;
}

interface Space {
  id: number;
  title: string;
  description: string;
  type: string;
  address: string;
  city: string;
  province: string;
  pricePerMonth: number;
  pricePerDay?: number;
  size: number;
  available: boolean;
  features?: string[];
  rules?: string;
  averageRating?: number;
  totalReviews?: number;
  images?: SpaceImage[];
}

interface SpaceDetailModalProps {
  space: Space;
  onClose: () => void;
  onBook: (space: Space) => void;
  showBookButton: boolean;
}

const SpaceDetailModal: React.FC<SpaceDetailModalProps> = ({ space, onClose, onBook, showBookButton }) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const amenitiesMap: { [key: string]: string } = {
    security_camera: 'Cámaras de seguridad',
    climate_control: 'Control de clima',
    '24_7_access': 'Acceso 24/7',
    electricity: 'Electricidad',
    lighting: 'Iluminación',
    shelving: 'Estanterías',
    elevator: 'Ascensor',
    parking: 'Estacionamiento'
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
      zIndex: 2000
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        maxWidth: '900px',
        width: '90%',
        maxHeight: '90vh',
        overflow: 'auto',
        position: 'relative'
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            backgroundColor: 'white',
            border: 'none',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            cursor: 'pointer',
            fontSize: '20px',
            fontWeight: 'bold',
            zIndex: 10,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}
        >
          ×
        </button>

        {space.images && space.images.length > 0 ? (
          <div>
            <div style={{
              width: '100%',
              height: '400px',
              backgroundColor: '#f5f5f5',
              position: 'relative'
            }}>
              <img
                src={space.images[selectedImageIndex].url}
                alt={space.title}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain'
                }}
              />
              {space.images.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedImageIndex(prev => 
                      prev === 0 ? space.images!.length - 1 : prev - 1
                    )}
                    style={{
                      position: 'absolute',
                      left: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      border: 'none',
                      borderRadius: '50%',
                      width: '40px',
                      height: '40px',
                      cursor: 'pointer',
                      fontSize: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    ‹
                  </button>
                  <button
                    onClick={() => setSelectedImageIndex(prev => 
                      prev === space.images!.length - 1 ? 0 : prev + 1
                    )}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      border: 'none',
                      borderRadius: '50%',
                      width: '40px',
                      height: '40px',
                      cursor: 'pointer',
                      fontSize: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    ›
                  </button>
                </>
              )}
            </div>
            {space.images.length > 1 && (
              <div style={{
                display: 'flex',
                gap: '10px',
                padding: '10px',
                overflowX: 'auto',
                backgroundColor: '#f9f9f9'
              }}>
                {space.images.map((image, index) => (
                  <img
                    key={image.id}
                    src={image.url}
                    alt={`${space.title} ${index + 1}`}
                    onClick={() => setSelectedImageIndex(index)}
                    style={{
                      width: '80px',
                      height: '80px',
                      objectFit: 'cover',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      border: selectedImageIndex === index ? '2px solid #4CAF50' : '2px solid transparent',
                      opacity: selectedImageIndex === index ? 1 : 0.7
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div style={{
            width: '100%',
            height: '200px',
            backgroundColor: '#f5f5f5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#999'
          }}>
            Sin imágenes disponibles
          </div>
        )}

        <div style={{ padding: '30px' }}>
          <h2 style={{ marginBottom: '10px' }}>{space.title}</h2>
          
          {space.averageRating && (
            <div style={{ marginBottom: '20px', color: '#666' }}>
              ⭐ {space.averageRating}/5 ({space.totalReviews} reseñas)
            </div>
          )}

          <p style={{ marginBottom: '20px', lineHeight: '1.6' }}>{space.description}</p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '20px',
            marginBottom: '30px'
          }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '10px' }}>Detalles del espacio</h3>
              <div style={{ lineHeight: '1.8' }}>
                <div><strong>Tipo:</strong> {
                  space.type === 'room' ? 'Habitación' : 
                  space.type === 'garage' ? 'Garaje' : 
                  space.type === 'warehouse' ? 'Depósito' : 
                  space.type === 'locker' ? 'Armario/Baulera' : 'Otro'
                }</div>
                <div><strong>Tamaño:</strong> {space.size} m²</div>
                <div><strong>Dirección:</strong> {space.address}</div>
                <div><strong>Ciudad:</strong> {space.city}, {space.province}</div>
              </div>
            </div>

            <div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '10px' }}>Precio</h3>
              <div style={{ lineHeight: '1.8' }}>
                <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#4CAF50' }}>
                  ${space.pricePerMonth}/mes
                </div>
                {space.pricePerDay && (
                  <div style={{ color: '#666' }}>
                    ${space.pricePerDay}/día
                  </div>
                )}
              </div>
            </div>
          </div>

          {space.features && space.features.length > 0 && (
            <div style={{ marginBottom: '30px' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '10px' }}>Comodidades</h3>
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '10px'
              }}>
                {space.features.map((feature, index) => (
                  <span
                    key={index}
                    style={{
                      backgroundColor: '#f0f0f0',
                      padding: '6px 12px',
                      borderRadius: '20px',
                      fontSize: '0.9rem'
                    }}
                  >
                    {amenitiesMap[feature] || feature}
                  </span>
                ))}
              </div>
            </div>
          )}

          {space.rules && (
            <div style={{ marginBottom: '30px' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '10px' }}>Reglas del espacio</h3>
              <p style={{ lineHeight: '1.6', color: '#666' }}>{space.rules}</p>
            </div>
          )}

          <div style={{
            display: 'flex',
            gap: '10px',
            justifyContent: 'flex-end',
            paddingTop: '20px',
            borderTop: '1px solid #eee'
          }}>
            <button
              onClick={onClose}
              style={{
                padding: '10px 20px',
                borderRadius: '4px',
                border: '1px solid #ddd',
                backgroundColor: 'white',
                cursor: 'pointer'
              }}
            >
              Cerrar
            </button>
            {showBookButton && space.available && (
              <button
                onClick={() => onBook(space)}
                style={{
                  padding: '10px 20px',
                  borderRadius: '4px',
                  border: 'none',
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  cursor: 'pointer'
                }}
              >
                Reservar ahora
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpaceDetailModal;