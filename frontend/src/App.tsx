import React, { useState, useEffect } from 'react';
import './App.css';
import { authAPI, spacesAPI, bookingsAPI } from './services/api';
import BookingModal from './components/BookingModal';
import CreateSpaceModalV2 from './components/CreateSpaceModalV2';
import SpaceDetailModal from './components/SpaceDetailModal';
import UserSettings from './components/UserSettings';
import MySpaces from './components/MySpaces';
import SearchSpaces from './components/SearchSpaces';
import { useToast } from './contexts/ToastContext';
import { useDraftSpace } from './hooks/useDraftSpace';
import { useGoogleLogin, GoogleLogin } from '@react-oauth/google';
import { User, Space, SpaceImage, Booking } from './types';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('search');
  const [searchCity, setSearchCity] = useState('');
  const [bookingSpace, setBookingSpace] = useState<Space | null>(null);
  const [showCreateSpace, setShowCreateSpace] = useState(false);
  const [mySpaces, setMySpaces] = useState<Space[]>([]);
  const [selectedSpace, setSelectedSpace] = useState<Space | null>(null);
  const [editingDraftId, setEditingDraftId] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<any[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const toast = useToast();
  const { getAllDrafts, clearDraft } = useDraftSpace();
  
  // Login form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Register form
  const [showRegister, setShowRegister] = useState(false);
  const [registerData, setRegisterData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    role: 'tenant'
  });

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        // Load initial data
        fetchSpaces();
        fetchBookings();
        if (parsedUser.role === 'host' || parsedUser.role === 'both') {
          fetchMySpaces();
        }
        // Optionally verify token is still valid in background (silent check)
        authAPI.getMe().then(response => {
          const userData = response.data.data || response.data;
          // Update user data if changed
          if (JSON.stringify(userData) !== JSON.stringify(parsedUser)) {
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
          }
        }).catch(() => {
          // Token expired, clear session
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
          toast.error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
        });
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    } else if (token) {
      // Have token but no user, fetch user data
      fetchUser();
    } else {
      // Temporary: Create a test user for development
      const testUser: User = {
        id: 0,
        email: 'test@example.com',
        firstName: 'Usuario',
        lastName: 'Prueba',
        role: 'both',
        verifiedEmail: true,
        verifiedPhone: false
      };
      setUser(testUser);
      localStorage.setItem('user', JSON.stringify(testUser));
      // Load initial data
      fetchSpaces();
      fetchBookings();
      fetchMySpaces();
    }
  }, []);

  useEffect(() => {
    // Load drafts and mySpaces when mySpaces tab is active
    if (activeTab === 'mySpaces') {
      setDrafts(getAllDrafts());
      fetchMySpaces();
    }
  }, [activeTab, getAllDrafts]);

  const fetchUser = async () => {
    try {
      const response = await authAPI.getMe();
      const userData = response.data.data || response.data;
      setUser(userData);
      // Save user to localStorage for session persistence
      localStorage.setItem('user', JSON.stringify(userData));
      // Load initial data after fetching user
      fetchSpaces();
      fetchBookings();
      if (userData.role === 'host' || userData.role === 'both') {
        fetchMySpaces();
      }
      return userData;
    } catch (err) {
      console.error('Failed to fetch user:', err);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      throw err;
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await authAPI.login(email, password);
      console.log('Login response:', response.data);
      
      // Check if response has the expected structure
      if (response.data.success && response.data.data) {
        localStorage.setItem('token', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
        setUser(response.data.data.user);
        setEmail('');
        setPassword('');
        toast.success(`¡Bienvenido ${response.data.data.user.firstName}!`);
        fetchSpaces();
        fetchBookings();
        if (response.data.data.user.role === 'host' || response.data.data.user.role === 'both') {
          fetchMySpaces();
        }
      } else {
        setError('Invalid response from server');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      const errorData = err.response?.data?.error;
      const errorMessage = typeof errorData === 'object' && errorData.message 
        ? errorData.message 
        : errorData || 'Login failed';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await authAPI.register(registerData);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      setUser(response.data.user);
      setShowRegister(false);
      toast.success('¡Cuenta creada exitosamente!');
      fetchSpaces();
      fetchBookings();
    } catch (err: any) {
      const errorData = err.response?.data?.error;
      const errorMessage = typeof errorData === 'object' && errorData.message 
        ? errorData.message 
        : errorData || 'Registration failed';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setSpaces([]);
    setActiveTab('search');
    toast.info('Sesión cerrada correctamente');
  };

  const handleGoogleLogin = async (credential: string) => {
    setLoading(true);
    try {
      const response = await authAPI.googleLogin(credential);
      
      if (response.data.success && response.data.data) {
        localStorage.setItem('token', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
        setUser(response.data.data.user);
        toast.success(`¡Bienvenido ${response.data.data.user.firstName}!`);
        fetchSpaces();
        fetchBookings();
        if (response.data.data.user.role === 'host' || response.data.data.user.role === 'both') {
          fetchMySpaces();
        }
      } else {
        toast.error('Error al iniciar sesión con Google');
      }
    } catch (error) {
      console.error('Google login error:', error);
      toast.error('Error al iniciar sesión con Google');
    } finally {
      setLoading(false);
    }
  };

  const handleAppleLogin = async () => {
    // TODO: Implement actual Apple Sign In
    toast.info('Login con Apple próximamente disponible');
  };

  const fetchSpaces = async () => {
    try {
      console.log('Fetching spaces...');
      const response = await spacesAPI.search();
      console.log('Spaces response:', response.data);
      // La respuesta tiene la estructura: { success: true, data: [...], meta: {...} }
      if (response.data.success && response.data.data) {
        setSpaces(response.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch spaces', err);
    }
  };

  const handleSearch = async () => {
    try {
      const response = await spacesAPI.search({ city: searchCity });
      if (response.data.success && response.data.data) {
        setSpaces(response.data.data);
      }
    } catch (err) {
      console.error('Failed to search spaces', err);
    }
  };

  const handleBookSpace = (space: Space) => {
    setBookingSpace(space);
  };

  const fetchBookings = async () => {
    try {
      const response = await bookingsAPI.getMyBookings();
      if (response.data.success && response.data.data) {
        setBookings(response.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch bookings', err);
    }
  };

  const handleBookingSuccess = () => {
    toast.success('¡Reserva creada exitosamente!');
    fetchBookings();
    setActiveTab('myBookings');
  };

  const fetchMySpaces = async () => {
    if (!user) return;
    
    try {
      const response = await spacesAPI.getMySpaces();
      if (response.data.success && response.data.data) {
        setMySpaces(response.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch my spaces', err);
      toast.error('Error al cargar tus espacios');
    }
  };

  const handleCreateSpaceSuccess = () => {
    toast.success('¡Espacio creado exitosamente!');
    fetchMySpaces();
    setShowCreateSpace(false);
    setEditingDraftId(null);
    // Refresh drafts after successful creation
    setDrafts(getAllDrafts());
  };

  const editDraft = (draftId: string) => {
    setEditingDraftId(draftId);
    setShowCreateSpace(true);
  };

  const deleteDraft = (draftId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este borrador? Esta acción no se puede deshacer.')) {
      clearDraft(draftId);
      setDrafts(getAllDrafts());
      toast.success('Borrador eliminado');
    }
  };

  if (!user) {
    return (
      <div style={{
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        overflow: 'hidden'
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '24px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
          width: '100%',
          maxWidth: showRegister ? '480px' : '400px',
          maxHeight: '90vh',
          padding: showRegister ? '30px' : '35px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Decorative circles */}
          <div style={{
            position: 'absolute',
            top: '-50px',
            right: '-50px',
            width: '150px',
            height: '150px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            opacity: 0.1
          }} />
          <div style={{
            position: 'absolute',
            bottom: '-30px',
            left: '-30px',
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
            opacity: 0.1
          }} />
          
          <div style={{
            textAlign: 'center',
            marginBottom: showRegister ? '20px' : '24px',
            position: 'relative',
            zIndex: 1
          }}>
            <div style={{
              width: '60px',
              height: '60px',
              margin: '0 auto 12px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '30px',
              boxShadow: '0 6px 12px rgba(102, 126, 234, 0.3)'
            }}>
              🏢
            </div>
            <h1 style={{
              margin: '0 0 4px',
              fontSize: '24px',
              fontWeight: '700',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.5px'
            }}>
              Depósito Urbano
            </h1>
            <p style={{
              margin: 0,
              color: '#6b7280',
              fontSize: '12px'
            }}>
              Tu espacio de almacenamiento compartido
            </p>
          </div>
          
          {!showRegister ? (
            <form onSubmit={handleLogin}>
              <h2 style={{
                textAlign: 'center',
                marginBottom: '18px',
                fontSize: '18px',
                fontWeight: '600',
                color: '#1f2937'
              }}>
                Bienvenido de vuelta
              </h2>
              
              {error && (
                <div style={{
                  backgroundColor: '#fee2e2',
                  border: '1px solid #fca5a5',
                  color: '#991b1b',
                  padding: '12px',
                  borderRadius: '12px',
                  marginBottom: '16px',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  ⚠️ {error}
                </div>
              )}
              
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151'
                }}>
                  📧 Email
                </label>
                <input
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '12px',
                    fontSize: '14px',
                    transition: 'all 0.2s',
                    outline: 'none'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#667eea';
                    e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e5e7eb';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
              
              <div style={{ marginBottom: '24px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151'
                }}>
                  🔒 Contraseña
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '12px',
                    fontSize: '14px',
                    transition: 'all 0.2s',
                    outline: 'none'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#667eea';
                    e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e5e7eb';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                <a href="#" style={{
                  display: 'inline-block',
                  marginTop: '8px',
                  fontSize: '13px',
                  color: '#667eea',
                  textDecoration: 'none'
                }}>
                  ¿Olvidaste tu contraseña?
                </a>
              </div>
              
              <button 
                type="submit" 
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: loading ? '#9ca3af' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: loading ? 'none' : '0 4px 14px rgba(102, 126, 234, 0.4)'
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.5)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  if (!loading) {
                    e.currentTarget.style.boxShadow = '0 4px 14px rgba(102, 126, 234, 0.4)';
                  }
                }}
              >
                {loading ? '⏳ Iniciando sesión...' : '🚀 Iniciar Sesión'}
              </button>
              
              <div style={{
                marginTop: '24px',
                paddingTop: '24px',
                borderTop: '1px solid #e5e7eb',
                textAlign: 'center'
              }}>
                <p style={{
                  margin: '0 0 16px',
                  color: '#6b7280',
                  fontSize: '14px'
                }}>
                  O continúa con
                </p>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <div style={{ flex: 1 }}>
                    <GoogleLogin
                      onSuccess={(credentialResponse) => {
                        if (credentialResponse.credential) {
                          handleGoogleLogin(credentialResponse.credential);
                        }
                      }}
                      onError={() => {
                        toast.error('Error al iniciar sesión con Google');
                      }}
                      text="signin_with"
                      shape="rectangular"
                      theme="outline"
                      size="large"
                      width="100"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAppleLogin()}
                    style={{
                      flex: 1,
                      padding: '10px',
                      backgroundColor: 'white',
                      border: '2px solid #e5e7eb',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '500',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#000000';
                      e.currentTarget.style.backgroundColor = '#f9fafb';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#e5e7eb';
                      e.currentTarget.style.backgroundColor = 'white';
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="#000000">
                      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                    </svg>
                    Apple
                  </button>
                </div>
              </div>
              
              <div style={{
                marginTop: '24px',
                textAlign: 'center',
                fontSize: '14px',
                color: '#6b7280'
              }}>
                ¿No tienes una cuenta?{' '}
                <button 
                  type="button"
                  onClick={() => setShowRegister(true)}
                  style={{
                    color: '#667eea',
                    fontWeight: '600',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  Regístrate gratis
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegister}>
              <h2 style={{
                textAlign: 'center',
                marginBottom: '18px',
                fontSize: '18px',
                fontWeight: '600',
                color: '#1f2937'
              }}>
                Crea tu cuenta
              </h2>
              
              {error && (
                <div style={{
                  backgroundColor: '#fee2e2',
                  border: '1px solid #fca5a5',
                  color: '#991b1b',
                  padding: '12px',
                  borderRadius: '12px',
                  marginBottom: '16px',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  ⚠️ {error}
                </div>
              )}
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '6px',
                    fontSize: '13px',
                    fontWeight: '500',
                    color: '#374151'
                  }}>
                    👤 Nombre
                  </label>
                  <input
                    type="text"
                    placeholder="Juan"
                    value={registerData.firstName}
                    onChange={(e) => setRegisterData({...registerData, firstName: e.target.value})}
                    required
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '10px',
                      fontSize: '14px',
                      transition: 'all 0.2s',
                      outline: 'none'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#667eea';
                      e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e5e7eb';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>
                
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '6px',
                    fontSize: '13px',
                    fontWeight: '500',
                    color: '#374151'
                  }}>
                    👤 Apellido
                  </label>
                  <input
                    type="text"
                    placeholder="Pérez"
                    value={registerData.lastName}
                    onChange={(e) => setRegisterData({...registerData, lastName: e.target.value})}
                    required
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '10px',
                      fontSize: '14px',
                      transition: 'all 0.2s',
                      outline: 'none'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#667eea';
                      e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e5e7eb';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>
              </div>
              
              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '6px',
                  fontSize: '13px',
                  fontWeight: '500',
                  color: '#374151'
                }}>
                  📧 Email
                </label>
                <input
                  type="email"
                  placeholder="tu@email.com"
                  value={registerData.email}
                  onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '10px',
                    fontSize: '14px',
                    transition: 'all 0.2s',
                    outline: 'none'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#667eea';
                    e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e5e7eb';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
              
              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '6px',
                  fontSize: '13px',
                  fontWeight: '500',
                  color: '#374151'
                }}>
                  📱 Teléfono
                </label>
                <input
                  type="tel"
                  placeholder="+54 11 1234-5678"
                  value={registerData.phone}
                  onChange={(e) => setRegisterData({...registerData, phone: e.target.value})}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '10px',
                    fontSize: '14px',
                    transition: 'all 0.2s',
                    outline: 'none'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#667eea';
                    e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e5e7eb';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
              
              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '6px',
                  fontSize: '13px',
                  fontWeight: '500',
                  color: '#374151'
                }}>
                  🔒 Contraseña
                </label>
                <input
                  type="password"
                  placeholder="Mínimo 8 caracteres"
                  value={registerData.password}
                  onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '10px',
                    fontSize: '14px',
                    transition: 'all 0.2s',
                    outline: 'none'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#667eea';
                    e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e5e7eb';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '6px',
                  fontSize: '13px',
                  fontWeight: '500',
                  color: '#374151'
                }}>
                  🎯 ¿Cómo quieres usar Depósito Urbano?
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setRegisterData({...registerData, role: 'tenant'})}
                    style={{
                      padding: '12px 8px',
                      backgroundColor: registerData.role === 'tenant' ? '#667eea' : 'white',
                      color: registerData.role === 'tenant' ? 'white' : '#374151',
                      border: registerData.role === 'tenant' ? '2px solid #667eea' : '2px solid #e5e7eb',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: '500',
                      transition: 'all 0.2s',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <span style={{ fontSize: '20px' }}>🔑</span>
                    Inquilino
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setRegisterData({...registerData, role: 'host'})}
                    style={{
                      padding: '12px 8px',
                      backgroundColor: registerData.role === 'host' ? '#667eea' : 'white',
                      color: registerData.role === 'host' ? 'white' : '#374151',
                      border: registerData.role === 'host' ? '2px solid #667eea' : '2px solid #e5e7eb',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: '500',
                      transition: 'all 0.2s',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <span style={{ fontSize: '20px' }}>🏠</span>
                    Anfitrión
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setRegisterData({...registerData, role: 'both'})}
                    style={{
                      padding: '12px 8px',
                      backgroundColor: registerData.role === 'both' ? '#667eea' : 'white',
                      color: registerData.role === 'both' ? 'white' : '#374151',
                      border: registerData.role === 'both' ? '2px solid #667eea' : '2px solid #e5e7eb',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: '500',
                      transition: 'all 0.2s',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <span style={{ fontSize: '20px' }}>🔄</span>
                    Ambos
                  </button>
                </div>
                <p style={{
                  marginTop: '8px',
                  fontSize: '11px',
                  color: '#6b7280',
                  textAlign: 'center'
                }}>
                  {registerData.role === 'tenant' ? 'Buscarás espacios para alquilar' :
                   registerData.role === 'host' ? 'Ofrecerás espacios para alquilar' :
                   'Podrás buscar y ofrecer espacios'}
                </p>
              </div>
              
              <button 
                type="submit" 
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: loading ? '#9ca3af' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: loading ? 'none' : '0 4px 14px rgba(102, 126, 234, 0.4)'
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.5)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  if (!loading) {
                    e.currentTarget.style.boxShadow = '0 4px 14px rgba(102, 126, 234, 0.4)';
                  }
                }}
              >
                {loading ? '⏳ Creando cuenta...' : '🎉 Crear Cuenta'}
              </button>
              
              <div style={{
                marginTop: '20px',
                textAlign: 'center',
                fontSize: '14px',
                color: '#6b7280'
              }}>
                ¿Ya tienes una cuenta?{' '}
                <button 
                  type="button"
                  onClick={() => setShowRegister(false)}
                  style={{
                    color: '#667eea',
                    fontWeight: '600',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  Iniciar Sesión
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="App" style={{ backgroundColor: '#f3f4f6', minHeight: '100vh' }}>
      <header style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        padding: '16px 0',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              backgroundColor: 'white',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px'
            }}>
              🏢
            </div>
            <h1 style={{
              margin: 0,
              color: 'white',
              fontSize: '24px',
              fontWeight: '700',
              letterSpacing: '-0.5px'
            }}>
              Depósito Urbano
            </h1>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              padding: '8px 16px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <div style={{
                width: '36px',
                height: '36px',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px'
              }}>
                👤
              </div>
              <div>
                <p style={{ margin: 0, color: 'white', fontSize: '14px', fontWeight: '600' }}>
                  {user.firstName} {user.lastName}
                </p>
                <p style={{ margin: 0, color: 'rgba(255, 255, 255, 0.8)', fontSize: '12px' }}>
                  {user.role === 'both' ? '🏠 Anfitrión y Inquilino' : 
                   user.role === 'host' ? '🏠 Anfitrión' : '🔑 Inquilino'}
                </p>
              </div>
            </div>
            
            <button
              onClick={() => setShowSettings(true)}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                color: 'white',
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                e.currentTarget.style.transform = 'scale(1)';
              }}
              title="Configuración"
            >
              ⚙️
            </button>
            
            <button
              onClick={handleLogout}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '12px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
                e.currentTarget.style.transform = 'scale(1.02)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              🚪 Salir
            </button>
          </div>
        </div>
      </header>
      
      <nav style={{
        backgroundColor: 'white',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        position: 'sticky',
        top: '72px',
        zIndex: 99
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 20px',
          display: 'flex',
          gap: '8px',
          paddingTop: '12px',
          paddingBottom: '12px'
        }}>
          <button 
            onClick={() => setActiveTab('search')}
            style={{
              backgroundColor: activeTab === 'search' ? '#667eea' : 'transparent',
              color: activeTab === 'search' ? 'white' : '#4b5563',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '10px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: activeTab === 'search' ? '600' : '500',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
            onMouseEnter={(e) => {
              if (activeTab !== 'search') {
                e.currentTarget.style.backgroundColor = '#f3f4f6';
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== 'search') {
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            }}
          >
            🔍 Buscar Espacios
          </button>
          
          {(user.role === 'host' || user.role === 'both') && (
            <button 
              onClick={() => {
                setActiveTab('mySpaces');
                fetchMySpaces();
              }}
              style={{
                backgroundColor: activeTab === 'mySpaces' ? '#667eea' : 'transparent',
                color: activeTab === 'mySpaces' ? 'white' : '#4b5563',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '10px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: activeTab === 'mySpaces' ? '600' : '500',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e) => {
                if (activeTab !== 'mySpaces') {
                  e.currentTarget.style.backgroundColor = '#f3f4f6';
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== 'mySpaces') {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              🏠 Mis Espacios
            </button>
          )}
          
          {(user.role === 'tenant' || user.role === 'both') && (
            <button 
              onClick={() => setActiveTab('myBookings')}
              style={{
                backgroundColor: activeTab === 'myBookings' ? '#667eea' : 'transparent',
                color: activeTab === 'myBookings' ? 'white' : '#4b5563',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '10px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: activeTab === 'myBookings' ? '600' : '500',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e) => {
                if (activeTab !== 'myBookings') {
                  e.currentTarget.style.backgroundColor = '#f3f4f6';
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== 'myBookings') {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              📅 Mis Reservas
            </button>
          )}
        </div>
      </nav>
      
      <main style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '20px',
        minHeight: 'calc(100vh - 144px)'
      }}>
        {activeTab === 'search' && (
          <SearchSpaces
            spaces={spaces}
            loading={false}
            onSearch={(filters) => {
              // Handle search with filters
              fetchSpaces();
            }}
            onBookingSuccess={handleBookingSuccess}
          />
        )}

        {activeTab === 'mySpaces' && (
          <MySpaces
            spaces={mySpaces}
            drafts={drafts}
            onEditDraft={editDraft}
            onDeleteDraft={deleteDraft}
            onCreateNew={() => setShowCreateSpace(true)}
            onRefresh={fetchMySpaces}
          />
        )}

        {activeTab === 'myBookings' && (
          <>
            <h2 className="section-title">Mis Reservas</h2>
            {bookings.length === 0 ? (
              <div className="empty-state">
                <p className="empty-state-title">No tienes reservas activas</p>
                <p className="empty-state-description">Explora los espacios disponibles y realiza tu primera reserva.</p>
              </div>
            ) : (
              <div className="cards-grid">
                {bookings.map((booking) => (
                  <div key={booking.id} className="booking-card">
                    <h3 className="space-card-title">
                      {booking.space?.title || `Espacio #${booking.spaceId}`}
                    </h3>
                    
                    <div className="space-info">
                      <div className="space-info-item">
                        <span className="space-info-label">Fecha inicio:</span>
                        <span>{new Date(booking.startDate).toLocaleDateString('es-AR')}</span>
                      </div>
                      <div className="space-info-item">
                        <span className="space-info-label">Fecha fin:</span>
                        <span>{new Date(booking.endDate).toLocaleDateString('es-AR')}</span>
                      </div>
                      <div className="space-info-item">
                        <span className="space-info-label">Precio total:</span>
                        <span style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--success-color)' }}>
                          ${booking.totalPrice}
                        </span>
                      </div>
                    </div>
                    
                    <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <span style={{ fontSize: '0.9rem', color: 'var(--dark-gray)' }}>Estado:</span>
                        <span className={`booking-status ${booking.status === 'confirmed' ? 'status-confirmed' : 
                                                          booking.status === 'pending' ? 'status-pending' : 
                                                          'status-cancelled'}`}>
                          {booking.status === 'confirmed' ? 'Confirmada' : 
                           booking.status === 'pending' ? 'Pendiente' : 'Cancelada'}
                        </span>
                      </div>
                      <span style={{ fontSize: '0.85rem', color: 'var(--dark-gray)' }}>
                        {new Date(booking.createdAt).toLocaleDateString('es-AR')}
                      </span>
                    </div>
                    
                    {booking.status === 'confirmed' && new Date(booking.startDate) > new Date() && (
                      <button className="btn btn-danger" style={{ width: '100%', marginTop: '16px' }}>
                        Cancelar Reserva
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>
      
      {bookingSpace && (
        <BookingModal
          space={bookingSpace}
          onClose={() => setBookingSpace(null)}
          onSuccess={handleBookingSuccess}
        />
      )}
      
      {showCreateSpace && (
        <CreateSpaceModalV2
          onClose={() => {
            setShowCreateSpace(false);
            setEditingDraftId(null);
            // Refresh drafts when modal closes (in case autosave happened)
            setDrafts(getAllDrafts());
          }}
          onSuccess={handleCreateSpaceSuccess}
          draftId={editingDraftId}
        />
      )}
      
      {selectedSpace && (
        <SpaceDetailModal
          space={selectedSpace}
          onClose={() => setSelectedSpace(null)}
          onBook={(space) => {
            setSelectedSpace(null);
            handleBookSpace(space);
          }}
          showBookButton={user && (user.role === 'tenant' || user.role === 'both')}
        />
      )}
      
      {showSettings && (
        <UserSettings
          user={user}
          onClose={() => setShowSettings(false)}
          onUserUpdate={(updatedUser) => {
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
          }}
        />
      )}
    </div>
  );
}

export default App;