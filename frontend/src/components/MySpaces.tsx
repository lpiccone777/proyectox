import React, { useState } from 'react';
import { Space } from '../types';
import { spacesAPI } from '../services/api';
import { useToast } from '../contexts/ToastContext';

interface MySpacesProps {
  spaces: Space[];
  drafts: any[];
  onEditDraft: (draftId: string) => void;
  onDeleteDraft: (draftId: string) => void;
  onCreateNew: () => void;
  onRefresh: () => void;
}

const MySpaces: React.FC<MySpacesProps> = ({
  spaces,
  drafts,
  onEditDraft,
  onDeleteDraft,
  onCreateNew,
  onRefresh,
}) => {
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const { success: toastSuccess, error: toastError } = useToast();


  const handleDeleteSpace = async (spaceId: number) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este espacio?')) {
      return;
    }

    setDeletingId(spaceId);
    try {
      await spacesAPI.delete(spaceId);
      toastSuccess('Espacio eliminado exitosamente');
      onRefresh();
    } catch (error) {
      toastError('Error al eliminar el espacio');
    } finally {
      setDeletingId(null);
    }
  };

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

  return (
    <div className="my-spaces-container">
      <div className="header-section" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '32px',
        padding: '0 8px'
      }}>
        <h2 style={{
          fontSize: '28px',
          fontWeight: '700',
          color: '#1f2937',
          margin: 0
        }}>Mis Espacios</h2>
        
        <button
          onClick={onCreateNew}
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '12px',
            fontSize: '15px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 14px rgba(102, 126, 234, 0.3)',
            transition: 'transform 0.2s, box-shadow 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 14px rgba(102, 126, 234, 0.3)';
          }}
        >
          + Crear Nuevo Espacio
        </button>
      </div>

      {drafts.length === 0 && spaces.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '80px 20px',
          backgroundColor: '#f9fafb',
          borderRadius: '16px',
          border: '2px dashed #e5e7eb'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>🏠</div>
          <h3 style={{
            fontSize: '24px',
            fontWeight: '600',
            color: '#374151',
            marginBottom: '8px'
          }}>No tienes espacios aún</h3>
          <p style={{
            fontSize: '16px',
            color: '#6b7280',
            marginBottom: '24px'
          }}>¡Crea tu primer espacio y comienza a ganar dinero!</p>
          <button
            onClick={onCreateNew}
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              padding: '14px 32px',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            Crear Mi Primer Espacio
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Drafts Section */}
          {drafts.map((draft) => (
            <div
              key={draft.id}
              style={{
                display: 'flex',
                backgroundColor: '#fffbeb',
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                border: '2px solid #fbbf24',
                transition: 'transform 0.2s, box-shadow 0.2s',
                cursor: 'pointer',
              }}
              onClick={() => onEditDraft(draft.id)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.12)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.08)';
              }}
            >
              {/* Image Section */}
              <div style={{
                width: '300px',
                height: '200px',
                flexShrink: 0,
                position: 'relative',
                backgroundColor: '#f3f4f6'
              }}>
                {draft.images && draft.images.length > 0 ? (
                  <img
                    src={draft.images[0]}
                    alt={draft.title}
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
                <div style={{
                  position: 'absolute',
                  top: '12px',
                  left: '12px',
                  backgroundColor: '#fbbf24',
                  color: '#78350f',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: '600'
                }}>
                  📄 Borrador
                </div>
              </div>

              {/* Content Section */}
              <div style={{
                flex: 1,
                padding: '24px',
                display: 'flex',
                justifyContent: 'space-between'
              }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{
                    fontSize: '20px',
                    fontWeight: '600',
                    color: '#111827',
                    marginBottom: '8px'
                  }}>
                    {draft.title || 'Sin título'}
                  </h3>
                  
                  <p style={{
                    fontSize: '14px',
                    color: '#6b7280',
                    marginBottom: '16px',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {draft.description || 'Sin descripción'}
                  </p>

                  {draft.address && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      color: '#6b7280',
                      fontSize: '14px',
                      marginBottom: '8px'
                    }}>
                      📍
                      <span>{draft.address}, {draft.city}</span>
                    </div>
                  )}

                  <div style={{
                    display: 'flex',
                    gap: '16px',
                    fontSize: '14px',
                    color: '#6b7280'
                  }}>
                    {draft.type && (
                      <span>📦 {getSpaceTypeLabel(draft.type)}</span>
                    )}
                    {draft.size && (
                      <span>📏 {draft.size} m²</span>
                    )}
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  marginLeft: '24px'
                }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditDraft(draft.id);
                    }}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb',
                      backgroundColor: 'white',
                      color: '#4b5563',
                      fontSize: '14px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                  >
                    ✏️ Continuar
                  </button>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteDraft(draft.id);
                    }}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      border: '1px solid #fca5a5',
                      backgroundColor: '#fef2f2',
                      color: '#dc2626',
                      fontSize: '14px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fee2e2'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fef2f2'}
                  >
                    🗑️ Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Published Spaces Section */}
          {spaces.map((space) => (
            <div
              key={space.id}
              style={{
                display: 'flex',
                backgroundColor: 'white',
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                border: '1px solid #e5e7eb',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.12)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.08)';
              }}
            >
              {/* Image Section */}
              <div style={{
                width: '300px',
                height: '200px',
                flexShrink: 0,
                position: 'relative',
                backgroundColor: '#f3f4f6'
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
                {space.available && (
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    backgroundColor: '#10b981',
                    color: 'white',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: '600'
                  }}>
                    ✓ Disponible
                  </div>
                )}
              </div>

              {/* Content Section */}
              <div style={{
                flex: 1,
                padding: '24px',
                display: 'flex',
                justifyContent: 'space-between'
              }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{
                    fontSize: '20px',
                    fontWeight: '600',
                    color: '#111827',
                    marginBottom: '8px'
                  }}>
                    {space.title}
                  </h3>
                  
                  <p style={{
                    fontSize: '14px',
                    color: '#6b7280',
                    marginBottom: '16px',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {space.description}
                  </p>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: '#6b7280',
                    fontSize: '14px',
                    marginBottom: '12px'
                  }}>
                    📍
                    <span>{space.address}, {space.city}</span>
                  </div>

                  <div style={{
                    display: 'flex',
                    gap: '20px',
                    fontSize: '14px',
                    color: '#6b7280',
                    marginBottom: '16px'
                  }}>
                    <span>📦 {getSpaceTypeLabel(space.type)}</span>
                    <span>📏 {space.size} m²</span>
                    {space.averageRating && (
                      <span>⭐ {space.averageRating.toFixed(1)} ({space.totalReviews})</span>
                    )}
                  </div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '20px',
                    fontWeight: '700',
                    color: '#10b981'
                  }}>
                    💰
                    <span>{formatPrice(space.pricePerMonth)}</span>
                    <span style={{
                      fontSize: '14px',
                      fontWeight: '400',
                      color: '#6b7280'
                    }}>/mes</span>
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  marginLeft: '24px'
                }}>
                  <button
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb',
                      backgroundColor: 'white',
                      color: '#4b5563',
                      fontSize: '14px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                  >
                    👁️ Ver detalles
                  </button>
                  
                  <button
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb',
                      backgroundColor: 'white',
                      color: '#4b5563',
                      fontSize: '14px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                  >
                    ✏️ Editar
                  </button>
                  
                  <button
                    onClick={() => handleDeleteSpace(space.id)}
                    disabled={deletingId === space.id}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      border: '1px solid #fca5a5',
                      backgroundColor: '#fef2f2',
                      color: '#dc2626',
                      fontSize: '14px',
                      cursor: deletingId === space.id ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'background-color 0.2s',
                      opacity: deletingId === space.id ? 0.5 : 1
                    }}
                    onMouseEnter={(e) => {
                      if (deletingId !== space.id) {
                        e.currentTarget.style.backgroundColor = '#fee2e2';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#fef2f2';
                    }}
                  >
                    🗑️ {deletingId === space.id ? 'Eliminando...' : 'Eliminar'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MySpaces;