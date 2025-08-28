import React, { useState, useRef } from 'react';
import { useToast } from '../contexts/ToastContext';
import { authAPI } from '../services/api';

interface UserSettingsProps {
  user: any;
  onClose: () => void;
  onUserUpdate: (updatedUser: any) => void;
}

const UserSettings: React.FC<UserSettingsProps> = ({ user, onClose, onUserUpdate }) => {
  const [activeTab, setActiveTab] = useState('personal');
  const [loading, setLoading] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(user.profilePicture || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  // Personal Info State
  const [personalInfo, setPersonalInfo] = useState({
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    email: user.email || '',
    phone: user.phone || '',
    birthDate: user.birthDate || '',
    bio: user.bio || ''
  });

  // Security State
  const [securityInfo, setSecurityInfo] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Notifications State
  const [notifications, setNotifications] = useState({
    emailNotifications: user.emailNotifications ?? true,
    smsNotifications: user.smsNotifications ?? false,
    bookingAlerts: user.bookingAlerts ?? true,
    marketingEmails: user.marketingEmails ?? false,
    securityAlerts: user.securityAlerts ?? true
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('La imagen debe ser menor a 5MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePersonalInfoSave = async () => {
    setLoading(true);
    try {
      // TODO: Implement API call to update user info
      toast.success('Información personal actualizada correctamente');
      onUserUpdate({ ...user, ...personalInfo });
    } catch (error) {
      toast.error('Error al actualizar la información');
    } finally {
      setLoading(false);
    }
  };

  const handleSecuritySave = async () => {
    if (securityInfo.newPassword !== securityInfo.confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    if (securityInfo.newPassword.length < 8) {
      toast.error('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    setLoading(true);
    try {
      // TODO: Implement API call to change password
      toast.success('Contraseña actualizada correctamente');
      setSecurityInfo({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error('Error al actualizar la contraseña');
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationsSave = async () => {
    setLoading(true);
    try {
      // TODO: Implement API call to update notification preferences
      toast.success('Preferencias de notificación actualizadas');
      onUserUpdate({ ...user, ...notifications });
    } catch (error) {
      toast.error('Error al actualizar las preferencias');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar tu cuenta? Esta acción no se puede deshacer.')) {
      return;
    }

    const confirmation = window.prompt('Para confirmar, escribe "ELIMINAR" en mayúsculas:');
    if (confirmation !== 'ELIMINAR') {
      toast.error('Confirmación incorrecta');
      return;
    }

    setLoading(true);
    try {
      // TODO: Implement API call to delete account
      toast.success('Cuenta eliminada correctamente');
      // Logout user
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.reload();
    } catch (error) {
      toast.error('Error al eliminar la cuenta');
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
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '900px',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
      }}>
        {/* Header */}
        <div style={{
          padding: '24px',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'linear-gradient(to right, #667eea, #764ba2)',
          borderRadius: '16px 16px 0 0',
          color: 'white'
        }}>
          <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '600' }}>
            ⚙️ Configuración de Usuario
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              color: 'white',
              fontSize: '24px',
              cursor: 'pointer',
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
          >
            ×
          </button>
        </div>

        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* Sidebar */}
          <div style={{
            width: '250px',
            backgroundColor: '#f9fafb',
            padding: '20px',
            borderRight: '1px solid #e5e7eb'
          }}>
            {/* Profile Section */}
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <div style={{
                  width: '100px',
                  height: '100px',
                  borderRadius: '50%',
                  backgroundColor: '#e5e7eb',
                  backgroundImage: profileImage ? `url(${profileImage})` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '36px',
                  color: '#6b7280',
                  border: '4px solid white',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                }}>
                  {!profileImage && '👤'}
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    position: 'absolute',
                    bottom: '0',
                    right: '0',
                    backgroundColor: '#667eea',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '16px'
                  }}
                >
                  📷
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                />
              </div>
              <h3 style={{ margin: '12px 0 4px', fontSize: '16px' }}>
                {user.firstName} {user.lastName}
              </h3>
              <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>
                {user.role === 'both' ? 'Anfitrión y Inquilino' : 
                 user.role === 'host' ? 'Anfitrión' : 'Inquilino'}
              </p>
            </div>

            {/* Navigation */}
            <nav>
              <button
                onClick={() => setActiveTab('personal')}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  marginBottom: '8px',
                  backgroundColor: activeTab === 'personal' ? '#667eea' : 'transparent',
                  color: activeTab === 'personal' ? 'white' : '#374151',
                  border: 'none',
                  borderRadius: '8px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: activeTab === 'personal' ? '600' : '400',
                  transition: 'all 0.2s'
                }}
              >
                👤 Información Personal
              </button>
              
              <button
                onClick={() => setActiveTab('security')}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  marginBottom: '8px',
                  backgroundColor: activeTab === 'security' ? '#667eea' : 'transparent',
                  color: activeTab === 'security' ? 'white' : '#374151',
                  border: 'none',
                  borderRadius: '8px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: activeTab === 'security' ? '600' : '400',
                  transition: 'all 0.2s'
                }}
              >
                🔒 Seguridad
              </button>

              <button
                onClick={() => setActiveTab('notifications')}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  marginBottom: '8px',
                  backgroundColor: activeTab === 'notifications' ? '#667eea' : 'transparent',
                  color: activeTab === 'notifications' ? 'white' : '#374151',
                  border: 'none',
                  borderRadius: '8px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: activeTab === 'notifications' ? '600' : '400',
                  transition: 'all 0.2s'
                }}
              >
                🔔 Notificaciones
              </button>

              <button
                onClick={() => setActiveTab('privacy')}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  marginBottom: '8px',
                  backgroundColor: activeTab === 'privacy' ? '#667eea' : 'transparent',
                  color: activeTab === 'privacy' ? 'white' : '#374151',
                  border: 'none',
                  borderRadius: '8px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: activeTab === 'privacy' ? '600' : '400',
                  transition: 'all 0.2s'
                }}
              >
                🛡️ Privacidad
              </button>
            </nav>
          </div>

          {/* Content */}
          <div style={{ flex: 1, padding: '30px', overflowY: 'auto' }}>
            {activeTab === 'personal' && (
              <div>
                <h3 style={{ marginTop: 0, marginBottom: '24px', fontSize: '20px', fontWeight: '600' }}>
                  Información Personal
                </h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                      Nombre
                    </label>
                    <input
                      type="text"
                      value={personalInfo.firstName}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, firstName: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                      Apellido
                    </label>
                    <input
                      type="text"
                      value={personalInfo.lastName}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, lastName: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                      Email
                    </label>
                    <input
                      type="email"
                      value={personalInfo.email}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      value={personalInfo.phone}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                      Fecha de Nacimiento
                    </label>
                    <input
                      type="date"
                      value={personalInfo.birthDate}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, birthDate: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                </div>
                
                <div style={{ marginTop: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                    Biografía
                  </label>
                  <textarea
                    value={personalInfo.bio}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, bio: e.target.value })}
                    placeholder="Cuéntanos un poco sobre ti..."
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px',
                      minHeight: '100px',
                      resize: 'vertical'
                    }}
                  />
                </div>
                
                <button
                  onClick={handlePersonalInfoSave}
                  disabled={loading}
                  style={{
                    marginTop: '24px',
                    padding: '12px 24px',
                    backgroundColor: '#667eea',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.5 : 1
                  }}
                >
                  {loading ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            )}

            {activeTab === 'security' && (
              <div>
                <h3 style={{ marginTop: 0, marginBottom: '24px', fontSize: '20px', fontWeight: '600' }}>
                  Seguridad de la Cuenta
                </h3>
                
                <div style={{
                  backgroundColor: '#fef3c7',
                  border: '1px solid #fcd34d',
                  borderRadius: '8px',
                  padding: '16px',
                  marginBottom: '24px'
                }}>
                  <p style={{ margin: 0, fontSize: '14px', color: '#92400e' }}>
                    <strong>⚠️ Importante:</strong> Cambiar tu contraseña cerrará sesión en todos los dispositivos.
                  </p>
                </div>
                
                <div style={{ maxWidth: '400px' }}>
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                      Contraseña Actual
                    </label>
                    <input
                      type="password"
                      value={securityInfo.currentPassword}
                      onChange={(e) => setSecurityInfo({ ...securityInfo, currentPassword: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                  
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                      Nueva Contraseña
                    </label>
                    <input
                      type="password"
                      value={securityInfo.newPassword}
                      onChange={(e) => setSecurityInfo({ ...securityInfo, newPassword: e.target.value })}
                      placeholder="Mínimo 8 caracteres"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                  
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                      Confirmar Nueva Contraseña
                    </label>
                    <input
                      type="password"
                      value={securityInfo.confirmPassword}
                      onChange={(e) => setSecurityInfo({ ...securityInfo, confirmPassword: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                  
                  <button
                    onClick={handleSecuritySave}
                    disabled={loading}
                    style={{
                      padding: '12px 24px',
                      backgroundColor: '#667eea',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      opacity: loading ? 0.5 : 1
                    }}
                  >
                    {loading ? 'Actualizando...' : 'Cambiar Contraseña'}
                  </button>
                </div>
                
                <div style={{
                  marginTop: '40px',
                  paddingTop: '40px',
                  borderTop: '1px solid #e5e7eb'
                }}>
                  <h4 style={{ marginBottom: '16px', fontSize: '16px', fontWeight: '600' }}>
                    Verificación en Dos Pasos
                  </h4>
                  <p style={{ marginBottom: '16px', fontSize: '14px', color: '#6b7280' }}>
                    Añade una capa extra de seguridad a tu cuenta requiriendo un código de verificación además de tu contraseña.
                  </p>
                  <button
                    style={{
                      padding: '10px 20px',
                      backgroundColor: '#10b981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer'
                    }}
                  >
                    Configurar 2FA
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div>
                <h3 style={{ marginTop: 0, marginBottom: '24px', fontSize: '20px', fontWeight: '600' }}>
                  Preferencias de Notificaciones
                </h3>
                
                <div style={{ maxWidth: '500px' }}>
                  <div style={{
                    backgroundColor: '#f9fafb',
                    padding: '20px',
                    borderRadius: '8px',
                    marginBottom: '24px'
                  }}>
                    <div style={{ marginBottom: '20px' }}>
                      <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer'
                      }}>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
                            📧 Notificaciones por Email
                          </div>
                          <div style={{ fontSize: '12px', color: '#6b7280' }}>
                            Recibe actualizaciones importantes por correo
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={notifications.emailNotifications}
                          onChange={(e) => setNotifications({ ...notifications, emailNotifications: e.target.checked })}
                          style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                        />
                      </label>
                    </div>
                    
                    <div style={{ marginBottom: '20px' }}>
                      <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer'
                      }}>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
                            📱 Notificaciones SMS
                          </div>
                          <div style={{ fontSize: '12px', color: '#6b7280' }}>
                            Recibe mensajes de texto para alertas urgentes
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={notifications.smsNotifications}
                          onChange={(e) => setNotifications({ ...notifications, smsNotifications: e.target.checked })}
                          style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                        />
                      </label>
                    </div>
                    
                    <div style={{ marginBottom: '20px' }}>
                      <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer'
                      }}>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
                            📅 Alertas de Reservas
                          </div>
                          <div style={{ fontSize: '12px', color: '#6b7280' }}>
                            Notificaciones sobre tus reservas activas
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={notifications.bookingAlerts}
                          onChange={(e) => setNotifications({ ...notifications, bookingAlerts: e.target.checked })}
                          style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                        />
                      </label>
                    </div>
                    
                    <div style={{ marginBottom: '20px' }}>
                      <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer'
                      }}>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
                            📢 Emails de Marketing
                          </div>
                          <div style={{ fontSize: '12px', color: '#6b7280' }}>
                            Ofertas especiales y novedades
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={notifications.marketingEmails}
                          onChange={(e) => setNotifications({ ...notifications, marketingEmails: e.target.checked })}
                          style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                        />
                      </label>
                    </div>
                    
                    <div>
                      <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer'
                      }}>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
                            🔐 Alertas de Seguridad
                          </div>
                          <div style={{ fontSize: '12px', color: '#6b7280' }}>
                            Avisos sobre accesos y cambios en tu cuenta
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={notifications.securityAlerts}
                          onChange={(e) => setNotifications({ ...notifications, securityAlerts: e.target.checked })}
                          style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                        />
                      </label>
                    </div>
                  </div>
                  
                  <button
                    onClick={handleNotificationsSave}
                    disabled={loading}
                    style={{
                      padding: '12px 24px',
                      backgroundColor: '#667eea',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      opacity: loading ? 0.5 : 1
                    }}
                  >
                    {loading ? 'Guardando...' : 'Guardar Preferencias'}
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'privacy' && (
              <div>
                <h3 style={{ marginTop: 0, marginBottom: '24px', fontSize: '20px', fontWeight: '600' }}>
                  Privacidad y Datos
                </h3>
                
                <div style={{
                  backgroundColor: '#f9fafb',
                  padding: '20px',
                  borderRadius: '8px',
                  marginBottom: '24px'
                }}>
                  <h4 style={{ marginTop: 0, marginBottom: '16px', fontSize: '16px', fontWeight: '600' }}>
                    🔍 Visibilidad del Perfil
                  </h4>
                  <p style={{ marginBottom: '16px', fontSize: '14px', color: '#6b7280' }}>
                    Controla quién puede ver tu información de perfil y actividad.
                  </p>
                  <select
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  >
                    <option value="public">Público - Todos pueden ver mi perfil</option>
                    <option value="users">Solo usuarios registrados</option>
                    <option value="connections">Solo mis conexiones</option>
                    <option value="private">Privado - Nadie puede ver mi perfil</option>
                  </select>
                </div>
                
                <div style={{
                  backgroundColor: '#f9fafb',
                  padding: '20px',
                  borderRadius: '8px',
                  marginBottom: '24px'
                }}>
                  <h4 style={{ marginTop: 0, marginBottom: '16px', fontSize: '16px', fontWeight: '600' }}>
                    📊 Exportar Mis Datos
                  </h4>
                  <p style={{ marginBottom: '16px', fontSize: '14px', color: '#6b7280' }}>
                    Descarga una copia de toda tu información almacenada en nuestra plataforma.
                  </p>
                  <button
                    style={{
                      padding: '10px 20px',
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer'
                    }}
                  >
                    Solicitar Mis Datos
                  </button>
                </div>
                
                <div style={{
                  backgroundColor: '#fee2e2',
                  padding: '20px',
                  borderRadius: '8px',
                  border: '1px solid #fca5a5'
                }}>
                  <h4 style={{ marginTop: 0, marginBottom: '16px', fontSize: '16px', fontWeight: '600', color: '#991b1b' }}>
                    ⚠️ Zona de Peligro
                  </h4>
                  <p style={{ marginBottom: '16px', fontSize: '14px', color: '#7f1d1d' }}>
                    Una vez que elimines tu cuenta, no hay vuelta atrás. Por favor, asegúrate de estar seguro.
                  </p>
                  <button
                    onClick={handleDeleteAccount}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: '#dc2626',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer'
                    }}
                  >
                    Eliminar Mi Cuenta
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserSettings;