import React, { useState, useRef, useEffect } from 'react';
import { spacesAPI } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import LeafletMapWithSearch from './LeafletMapWithSearch';
import { useDraftSpace } from '../hooks/useDraftSpace';

interface CreateSpaceModalProps {
  onClose: () => void;
  onSuccess: () => void;
  draftId?: string | null;
}

const CreateSpaceModalV2: React.FC<CreateSpaceModalProps> = ({ onClose, onSuccess, draftId }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const toast = useToast();
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { saveDraft, clearDraft, loadDraft } = useDraftSpace();
  const [isSaving, setIsSaving] = useState(false);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
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
    { value: 'room', label: 'Habitación', icon: '🏠', color: '#4CAF50' },
    { value: 'garage', label: 'Garaje', icon: '🚗', color: '#2196F3' },
    { value: 'warehouse', label: 'Depósito', icon: '📦', color: '#FF9800' },
    { value: 'locker', label: 'Baulera', icon: '🗄️', color: '#9C27B0' },
    { value: 'other', label: 'Otro', icon: '📍', color: '#607D8B' }
  ];


  const amenitiesList = [
    { value: 'security_camera', label: 'Cámaras de seguridad', icon: '📹' },
    { value: 'climate_control', label: 'Control de clima', icon: '🌡️' },
    { value: '24_7_access', label: 'Acceso 24/7', icon: '🔓' },
    { value: 'electricity', label: 'Electricidad', icon: '💡' },
    { value: 'lighting', label: 'Iluminación', icon: '💡' },
    { value: 'shelving', label: 'Estanterías', icon: '📚' },
    { value: 'elevator', label: 'Ascensor', icon: '🛗' },
    { value: 'parking', label: 'Estacionamiento', icon: '🅿️' }
  ];

  // Load draft if draftId is provided
  useEffect(() => {
    const loadDraftData = async () => {
      if (draftId && loadDraft) {
        const draft = await loadDraft();
        if (draft) {
          setFormData(draft.formData);
          setCurrentStep(draft.currentStep);
          setSelectedImages(draft.selectedImages);
          
          // Generate previews for loaded images
          const previews = draft.selectedImages.map((file: File) => URL.createObjectURL(file));
          setImagePreviews(previews);
          
          toast.success('Borrador cargado');
        }
      }
    };
    
    loadDraftData();
  }, [draftId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-save draft whenever form changes
  useEffect(() => {
    // Clear previous timeout
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    // Set new timeout for auto-save (1 second after last change)
    autoSaveTimeoutRef.current = setTimeout(() => {
      if (formData.title || formData.address || selectedImages.length > 0) {
        setIsSaving(true);
        saveDraft(formData, currentStep, selectedImages);
        setTimeout(() => setIsSaving(false), 500);
      }
    }, 1000);

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [formData, currentStep, selectedImages, saveDraft]);


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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const fileArray = Array.from(files);
      
      if (fileArray.length + selectedImages.length > 10) {
        setError('Máximo 10 imágenes permitidas');
        return;
      }

      const validFiles = fileArray.filter(file => {
        if (file.size > 5 * 1024 * 1024) {
          setError(`${file.name} es muy grande. Máximo 5MB por imagen.`);
          return false;
        }
        return true;
      });

      setSelectedImages(prev => [...prev, ...validFiles]);

      validFiles.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreviews(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type.startsWith('image/')
    );
    
    if (files.length > 0) {
      const input = { target: { files } } as any;
      handleImageChange(input);
    }
  };

  const handleAddressChange = (addressData: any) => {
    setFormData({
      ...formData,
      address: addressData.address,
      city: addressData.city,
      province: addressData.province,
      postalCode: addressData.postalCode || formData.postalCode,
      latitude: addressData.latitude?.toString() || formData.latitude,
      longitude: addressData.longitude?.toString() || formData.longitude
    });
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return formData.title !== '' && formData.description !== '' && formData.type !== '';
      case 2:
        return formData.address !== '' && formData.city !== '' && formData.province !== '';
      case 3:
        return true; // Features and rules are optional
      case 4:
        return formData.size !== '' && formData.pricePerMonth !== '';
      case 5:
        return selectedImages.length > 0;
      default:
        return true;
    }
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
        latitude: formData.latitude ? parseFloat(formData.latitude) : -34.6037,
        longitude: formData.longitude ? parseFloat(formData.longitude) : -58.3816,
        available: true,
        features: formData.features,
        rules: formData.rules || null,
        minBookingDays: parseInt(formData.minBookingDays) || 1,
        maxBookingDays: formData.maxBookingDays ? parseInt(formData.maxBookingDays) : null
      };

      const response = await spacesAPI.create(dataToSend);
      const spaceId = response.data.id;

      if (selectedImages.length > 0) {
        const formData = new FormData();
        selectedImages.forEach(image => {
          formData.append('images', image);
        });

        await spacesAPI.uploadImages(spaceId, formData);
      }

      toast.success('¡Espacio creado exitosamente!');
      clearDraft(); // Clear draft on successful creation
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Error al crear el espacio');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 5));
    } else {
      setError('Por favor, completa todos los campos requeridos');
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    setError('');
  };

  const styles = {
    overlay: {
      position: 'fixed' as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    },
    modal: {
      backgroundColor: 'white',
      borderRadius: '16px',
      maxWidth: '800px',
      width: '100%',
      maxHeight: '90vh',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column' as const,
      boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
    },
    header: {
      padding: '24px 32px',
      borderBottom: '1px solid #f0f0f0',
      position: 'relative' as const
    },
    closeButton: {
      position: 'absolute' as const,
      top: '20px',
      right: '20px',
      backgroundColor: 'transparent',
      border: 'none',
      fontSize: '24px',
      cursor: 'pointer',
      color: '#666',
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'background-color 0.2s'
    },
    progressBar: {
      display: 'flex',
      justifyContent: 'space-between',
      padding: '0 32px',
      marginTop: '20px'
    },
    progressStep: {
      flex: 1,
      height: '4px',
      backgroundColor: '#e0e0e0',
      margin: '0 4px',
      borderRadius: '2px',
      position: 'relative' as const,
      overflow: 'hidden'
    },
    progressStepActive: {
      backgroundColor: '#4CAF50'
    },
    content: {
      flex: 1,
      overflowY: 'auto' as const,
      padding: '32px'
    },
    footer: {
      padding: '24px 32px',
      borderTop: '1px solid #f0f0f0',
      display: 'flex',
      justifyContent: 'space-between',
      gap: '12px'
    },
    button: {
      padding: '12px 24px',
      borderRadius: '8px',
      border: 'none',
      cursor: 'pointer',
      fontSize: '16px',
      fontWeight: '600',
      transition: 'all 0.2s',
      minWidth: '120px'
    },
    primaryButton: {
      backgroundColor: '#4CAF50',
      color: 'white'
    },
    secondaryButton: {
      backgroundColor: '#f5f5f5',
      color: '#333'
    },
    inputGroup: {
      marginBottom: '24px'
    },
    label: {
      display: 'block',
      marginBottom: '8px',
      fontWeight: '600',
      fontSize: '14px',
      color: '#333'
    },
    input: {
      width: '100%',
      padding: '12px 16px',
      borderRadius: '8px',
      border: '1px solid #ddd',
      fontSize: '16px',
      transition: 'border-color 0.2s'
    },
    textarea: {
      width: '100%',
      padding: '12px 16px',
      borderRadius: '8px',
      border: '1px solid #ddd',
      fontSize: '16px',
      resize: 'vertical' as const,
      minHeight: '120px'
    },
    typeCard: {
      padding: '16px',
      borderRadius: '12px',
      border: '2px solid #e0e0e0',
      cursor: 'pointer',
      transition: 'all 0.2s',
      textAlign: 'center' as const
    },
    typeCardSelected: {
      borderColor: '#4CAF50',
      backgroundColor: '#f1f8f4'
    },
    amenityChip: {
      padding: '8px 16px',
      borderRadius: '20px',
      border: '1px solid #ddd',
      backgroundColor: 'white',
      cursor: 'pointer',
      transition: 'all 0.2s',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      fontSize: '14px'
    },
    amenityChipSelected: {
      backgroundColor: '#4CAF50',
      color: 'white',
      borderColor: '#4CAF50'
    },
    imageUploadArea: {
      border: '2px dashed #ddd',
      borderRadius: '12px',
      padding: '40px',
      textAlign: 'center' as const,
      cursor: 'pointer',
      transition: 'all 0.2s',
      backgroundColor: '#fafafa'
    },
    imageGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
      gap: '16px',
      marginTop: '24px'
    },
    imagePreview: {
      position: 'relative' as const,
      paddingBottom: '100%',
      borderRadius: '8px',
      overflow: 'hidden',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    },
    imagePreviewImg: {
      position: 'absolute' as const,
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      objectFit: 'cover' as const
    },
    deleteImageButton: {
      position: 'absolute' as const,
      top: '8px',
      right: '8px',
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      border: 'none',
      borderRadius: '50%',
      width: '32px',
      height: '32px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '18px',
      fontWeight: 'bold',
      color: '#666',
      boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <button 
            onClick={onClose}
            style={styles.closeButton}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            ✕
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h2 style={{ margin: 0, fontSize: '24px', color: '#333' }}>
              Crear Nuevo Espacio
            </h2>
            {isSaving && (
              <span style={{ 
                fontSize: '12px', 
                color: '#666',
                backgroundColor: '#f0f0f0',
                padding: '4px 8px',
                borderRadius: '4px'
              }}>
                💾 Guardando...
              </span>
            )}
          </div>
          <div style={styles.progressBar}>
            {[1, 2, 3, 4, 5].map((step) => (
              <div
                key={step}
                style={{
                  ...styles.progressStep,
                  ...(step <= currentStep ? styles.progressStepActive : {})
                }}
              />
            ))}
          </div>
          <div style={{ marginTop: '12px', fontSize: '14px', color: '#666' }}>
            Paso {currentStep} de 5: {
              currentStep === 1 ? 'Información básica' :
              currentStep === 2 ? 'Ubicación' :
              currentStep === 3 ? 'Características y reglas' :
              currentStep === 4 ? 'Precio y disponibilidad' :
              'Imágenes'
            }
          </div>
        </div>

        <div style={styles.content}>
          {error && (
            <div style={{
              backgroundColor: '#ffebee',
              color: '#c62828',
              padding: '12px 16px',
              borderRadius: '8px',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              ⚠️ {error}
            </div>
          )}

          {currentStep === 1 && (
            <>
              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  Título del espacio *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Ej: Habitación luminosa en Palermo"
                  style={styles.input}
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  Descripción detallada *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe tu espacio, qué lo hace especial, qué puede almacenarse, condiciones, etc."
                  style={styles.textarea}
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  Tipo de espacio *
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '12px' }}>
                  {spaceTypes.map(type => (
                    <div
                      key={type.value}
                      onClick={() => setFormData(prev => ({ ...prev, type: type.value }))}
                      style={{
                        ...styles.typeCard,
                        ...(formData.type === type.value ? styles.typeCardSelected : {})
                      }}
                    >
                      <div style={{ fontSize: '32px', marginBottom: '8px' }}>{type.icon}</div>
                      <div style={{ fontWeight: '600', fontSize: '14px' }}>{type.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}


          {currentStep === 2 && (
            <>
              <LeafletMapWithSearch
                value={{
                  address: formData.address,
                  city: formData.city,
                  province: formData.province,
                  postalCode: formData.postalCode,
                  latitude: formData.latitude ? parseFloat(formData.latitude) : undefined,
                  longitude: formData.longitude ? parseFloat(formData.longitude) : undefined
                }}
                onChange={handleAddressChange}
              />
            </>
          )}

          {currentStep === 3 && (
            <>
              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  🏠 Comodidades y características
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                  {amenitiesList.map(amenity => (
                    <div
                      key={amenity.value}
                      onClick={() => handleAmenityToggle(amenity.value)}
                      style={{
                        ...styles.amenityChip,
                        ...(formData.features.includes(amenity.value) ? styles.amenityChipSelected : {})
                      }}
                    >
                      <span style={{ fontSize: '20px', marginRight: '8px' }}>{amenity.icon}</span>
                      <span>{amenity.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  📋 Reglas y restricciones del espacio
                </label>
                <textarea
                  name="rules"
                  value={formData.rules}
                  onChange={handleInputChange}
                  rows={5}
                  placeholder="Ej: No se permiten materiales inflamables, horario de acceso de 8:00 a 20:00, se requiere aviso previo para retirar objetos, no se aceptan productos perecederos..."
                  style={styles.textarea}
                />
                <div style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
                  Especifica claramente qué está permitido y qué no en tu espacio
                </div>
              </div>
            </>
          )}

          {currentStep === 4 && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>
                    Tamaño (m²) *
                  </label>
                  <input
                    type="number"
                    name="size"
                    value={formData.size}
                    onChange={handleInputChange}
                    min="1"
                    step="0.5"
                    placeholder="10"
                    style={styles.input}
                  />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>
                    Disponibilidad
                  </label>
                  <select
                    name="availability"
                    value={formData.availability}
                    onChange={handleInputChange}
                    style={styles.input}
                  >
                    <option value="full">Tiempo completo</option>
                    <option value="partial">Horarios específicos</option>
                    <option value="flexible">Flexible</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>
                    Precio por mes (ARS) *
                  </label>
                  <input
                    type="number"
                    name="pricePerMonth"
                    value={formData.pricePerMonth}
                    onChange={handleInputChange}
                    min="1"
                    placeholder="15000"
                    style={styles.input}
                  />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>
                    Precio por día (ARS)
                  </label>
                  <input
                    type="number"
                    name="pricePerDay"
                    value={formData.pricePerDay}
                    onChange={handleInputChange}
                    min="1"
                    placeholder="800"
                    style={styles.input}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>
                    Días mínimos de reserva *
                  </label>
                  <input
                    type="number"
                    name="minBookingDays"
                    value={formData.minBookingDays}
                    onChange={handleInputChange}
                    min="1"
                    placeholder="1"
                    style={styles.input}
                  />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>
                    Días máximos de reserva
                  </label>
                  <input
                    type="number"
                    name="maxBookingDays"
                    value={formData.maxBookingDays}
                    onChange={handleInputChange}
                    min="1"
                    placeholder="Sin límite"
                    style={styles.input}
                  />
                </div>
              </div>
            </>
          )}


          {currentStep === 5 && (
            <>
              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  Imágenes del espacio (mínimo 1, máximo 10)
                </label>
                
                <div 
                  style={styles.imageUploadArea}
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{ display: 'none' }}
                  />
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>📷</div>
                  <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
                    Arrastra tus imágenes aquí
                  </div>
                  <div style={{ fontSize: '14px', color: '#666', marginBottom: '16px' }}>
                    o haz clic para seleccionarlas
                  </div>
                  <div style={{ fontSize: '12px', color: '#999' }}>
                    JPG, PNG o WEBP • Máximo 5MB por imagen
                  </div>
                </div>

                {imagePreviews.length > 0 && (
                  <>
                    <div style={{ marginTop: '24px', marginBottom: '12px', fontSize: '14px', color: '#666' }}>
                      {imagePreviews.length} imagen{imagePreviews.length !== 1 ? 'es' : ''} seleccionada{imagePreviews.length !== 1 ? 's' : ''}
                    </div>
                    <div style={styles.imageGrid}>
                      {imagePreviews.map((preview, index) => (
                        <div key={index} style={styles.imagePreview}>
                          <img
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            style={styles.imagePreviewImg}
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            style={styles.deleteImageButton}
                          >
                            ✕
                          </button>
                          {index === 0 && (
                            <div style={{
                              position: 'absolute',
                              bottom: '8px',
                              left: '8px',
                              backgroundColor: '#4CAF50',
                              color: 'white',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              fontSize: '12px',
                              fontWeight: 'bold'
                            }}>
                              PRINCIPAL
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </div>

        <div style={styles.footer}>
          {currentStep > 1 && (
            <button
              type="button"
              onClick={prevStep}
              style={{ ...styles.button, ...styles.secondaryButton }}
            >
              ← Anterior
            </button>
          )}
          
          <div style={{ display: 'flex', gap: '12px', marginLeft: 'auto' }}>
            <button
              type="button"
              onClick={onClose}
              style={{ ...styles.button, ...styles.secondaryButton }}
            >
              Cancelar
            </button>
            
            {currentStep < 5 ? (
              <button
                type="button"
                onClick={nextStep}
                style={{ ...styles.button, ...styles.primaryButton }}
              >
                Siguiente →
              </button>
            ) : (
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={loading}
                style={{
                  ...styles.button,
                  ...styles.primaryButton,
                  opacity: loading ? 0.6 : 1,
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? 'Creando...' : '✓ Crear Espacio'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateSpaceModalV2;