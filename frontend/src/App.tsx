import React, { useState, useEffect } from 'react';
import './App.css';
import { authAPI, spacesAPI, bookingsAPI } from './services/api';
import BookingModal from './components/BookingModal';
import CreateSpaceModal from './components/CreateSpaceModal';
import { useToast } from './contexts/ToastContext';

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface Space {
  id: number;
  title: string;
  description: string;
  type: string;
  city: string;
  province: string;
  pricePerMonth: number;
  pricePerDay?: number;
  size: number;
  available: boolean;
  averageRating?: number;
  totalReviews?: number;
}

interface Booking {
  id: number;
  spaceId: number;
  space?: Space;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: string;
  createdAt: string;
}

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
  const toast = useToast();
  
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
    if (token) {
      fetchUser();
    }
  }, []);

  const fetchUser = async () => {
    try {
      const response = await authAPI.getMe();
      setUser(response.data);
    } catch (err) {
      localStorage.removeItem('token');
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
    setUser(null);
    setSpaces([]);
    setActiveTab('search');
    toast.info('Sesión cerrada correctamente');
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
  };

  if (!user) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <h1 className="auth-title">Depósito Urbano</h1>
          
          {!showRegister ? (
            <form onSubmit={handleLogin}>
              <h2 style={{ textAlign: 'center', marginBottom: '24px' }}>Iniciar Sesión</h2>
              {error && <div className="error-message">{error}</div>}
              
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Contraseña</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              
              <button 
                type="submit" 
                disabled={loading}
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '8px' }}
              >
                {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </button>
              
              <div className="auth-switch">
                ¿No tienes una cuenta?{' '}
                <button 
                  type="button"
                  onClick={() => setShowRegister(true)}
                  className="auth-switch-link"
                >
                  Regístrate
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegister}>
              <h2 style={{ textAlign: 'center', marginBottom: '24px' }}>Crear Cuenta</h2>
              {error && <div className="error-message">{error}</div>}
              
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="tu@email.com"
                  value={registerData.email}
                  onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Contraseña</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="Mínimo 8 caracteres"
                  value={registerData.password}
                  onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Nombre</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Juan"
                  value={registerData.firstName}
                  onChange={(e) => setRegisterData({...registerData, firstName: e.target.value})}
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Apellido</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Pérez"
                  value={registerData.lastName}
                  onChange={(e) => setRegisterData({...registerData, lastName: e.target.value})}
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Teléfono</label>
                <input
                  type="tel"
                  className="form-input"
                  placeholder="+54 11 1234-5678"
                  value={registerData.phone}
                  onChange={(e) => setRegisterData({...registerData, phone: e.target.value})}
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Tipo de usuario</label>
                <select
                  className="form-select"
                  value={registerData.role}
                  onChange={(e) => setRegisterData({...registerData, role: e.target.value})}
                >
                  <option value="tenant">Inquilino (Busco espacio)</option>
                  <option value="host">Anfitrión (Ofrezco espacio)</option>
                  <option value="both">Ambos</option>
                </select>
              </div>
              
              <button 
                type="submit" 
                disabled={loading}
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '8px' }}
              >
                {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
              </button>
              
              <div className="auth-switch">
                ¿Ya tienes una cuenta?{' '}
                <button 
                  type="button"
                  onClick={() => setShowRegister(false)}
                  className="auth-switch-link"
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
    <div className="App">
      <header className="app-header">
        <div className="header-content">
          <h1 className="header-title">Depósito Urbano Compartido</h1>
          <div className="user-info">
            <div className="user-details">
              <p>Bienvenido, {user.firstName} {user.lastName}</p>
              <p>
                Rol: 
                <span className="user-role">
                  {user.role === 'both' ? 'Anfitrión y Inquilino' : user.role === 'host' ? 'Anfitrión' : 'Inquilino'}
                </span>
              </p>
            </div>
            <button onClick={handleLogout} className="btn btn-secondary">
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>
      
      <nav className="app-nav">
        <div className="nav-container">
          <button 
            onClick={() => setActiveTab('search')} 
            className={`nav-button ${activeTab === 'search' ? 'active' : ''}`}
          >
            Buscar Espacios
          </button>
          {(user.role === 'host' || user.role === 'both') && (
            <button 
              onClick={() => {
                setActiveTab('mySpaces');
                fetchMySpaces();
              }} 
              className={`nav-button ${activeTab === 'mySpaces' ? 'active' : ''}`}
            >
              Mis Espacios
            </button>
          )}
          {(user.role === 'tenant' || user.role === 'both') && (
            <button 
              onClick={() => setActiveTab('myBookings')} 
              className={`nav-button ${activeTab === 'myBookings' ? 'active' : ''}`}
            >
              Mis Reservas
            </button>
          )}
        </div>
      </nav>
      
      <main className="main-content">
        {activeTab === 'search' && (
          <>
            <h2 className="section-title">Espacios Disponibles</h2>
            <div className="search-container">
              <input 
                type="text" 
                className="search-input"
                placeholder="Buscar por ciudad..." 
                value={searchCity}
                onChange={(e) => setSearchCity(e.target.value)}
              />
              <button onClick={handleSearch} className="btn btn-primary">
                Buscar
              </button>
              <button onClick={fetchSpaces} className="btn btn-secondary">
                Mostrar Todos
              </button>
            </div>
            
            {spaces.length === 0 ? (
              <div className="empty-state">
                <p className="empty-state-title">No hay espacios disponibles</p>
                <p className="empty-state-description">Intenta buscar en otra ciudad o vuelve más tarde.</p>
              </div>
            ) : (
              <div className="cards-grid">
                {spaces.map((space) => (
                  <div key={space.id} className="space-card">
                    <div className="space-card-content">
                      <h3 className="space-card-title">{space.title}</h3>
                      <p className="space-card-description">{space.description}</p>
                      
                      <div className="space-info">
                        <div className="space-info-item">
                          <span className="space-info-label">Tipo:</span>
                          <span>{space.type === 'room' ? 'Habitación' : 
                                 space.type === 'garage' ? 'Garaje' : 
                                 space.type === 'warehouse' ? 'Depósito' : 
                                 space.type === 'locker' ? 'Armario/Baulera' : 'Otro'}</span>
                        </div>
                        <div className="space-info-item">
                          <span className="space-info-label">Ubicación:</span>
                          <span>{space.city}, {space.province}</span>
                        </div>
                        <div className="space-info-item">
                          <span className="space-info-label">Tamaño:</span>
                          <span>{space.size} m²</span>
                        </div>
                      </div>
                      
                      <div className="space-price">
                        ${space.pricePerMonth}/mes
                        {space.pricePerDay && (
                          <span style={{ fontSize: '0.85rem', color: 'var(--dark-gray)', marginLeft: '12px' }}>
                            (${space.pricePerDay}/día)
                          </span>
                        )}
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                        <span className={`space-availability ${space.available ? 'available' : 'unavailable'}`}>
                          {space.available ? 'Disponible' : 'No disponible'}
                        </span>
                        {space.averageRating && (
                          <span className="space-rating">
                            ⭐ {space.averageRating}/5 ({space.totalReviews} reseñas)
                          </span>
                        )}
                      </div>
                      
                      {(user.role === 'tenant' || user.role === 'both') && space.available && (
                        <button 
                          onClick={() => handleBookSpace(space)}
                          className="btn btn-success"
                          style={{ width: '100%' }}
                        >
                          Reservar
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === 'mySpaces' && (
          <>
            <h2 className="section-title">Mis Espacios</h2>
            <button 
              onClick={() => setShowCreateSpace(true)}
              className="btn btn-success"
              style={{ marginBottom: '24px' }}
            >
              + Crear Nuevo Espacio
            </button>
            
            {mySpaces.length === 0 ? (
              <div className="empty-state">
                <p className="empty-state-title">No tienes espacios publicados</p>
                <p className="empty-state-description">¡Crea tu primer espacio y comienza a ganar dinero!</p>
              </div>
            ) : (
              <div className="cards-grid">
                {mySpaces.map((space) => (
                  <div key={space.id} className="space-card">
                    <div className="space-card-content">
                      <h3 className="space-card-title">{space.title}</h3>
                      <p className="space-card-description">{space.description}</p>
                      
                      <div className="space-info">
                        <div className="space-info-item">
                          <span className="space-info-label">Tipo:</span>
                          <span>{space.type === 'room' ? 'Habitación' : 
                                 space.type === 'garage' ? 'Garaje' : 
                                 space.type === 'warehouse' ? 'Depósito' : 
                                 space.type === 'locker' ? 'Armario/Baulera' : 'Otro'}</span>
                        </div>
                        <div className="space-info-item">
                          <span className="space-info-label">Ubicación:</span>
                          <span>{space.city}, {space.province}</span>
                        </div>
                        <div className="space-info-item">
                          <span className="space-info-label">Tamaño:</span>
                          <span>{space.size} m²</span>
                        </div>
                      </div>
                      
                      <div className="space-price">
                        ${space.pricePerMonth}/mes
                        {space.pricePerDay && (
                          <span style={{ fontSize: '0.85rem', color: 'var(--dark-gray)', marginLeft: '12px' }}>
                            (${space.pricePerDay}/día)
                          </span>
                        )}
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                        <span className={`space-availability ${space.available ? 'available' : 'unavailable'}`}>
                          {space.available ? 'Disponible' : 'Pausado'}
                        </span>
                        {space.averageRating && (
                          <span className="space-rating">
                            ⭐ {space.averageRating}/5 ({space.totalReviews} reseñas)
                          </span>
                        )}
                      </div>
                      
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn btn-primary" style={{ flex: 1 }}>
                          Editar
                        </button>
                        <button 
                          className={space.available ? 'btn btn-warning' : 'btn btn-success'}
                          style={{ flex: 1 }}
                        >
                          {space.available ? 'Pausar' : 'Activar'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
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
        <CreateSpaceModal
          onClose={() => setShowCreateSpace(false)}
          onSuccess={handleCreateSpaceSuccess}
        />
      )}
    </div>
  );
}

export default App;