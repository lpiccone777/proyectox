import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  
  register: (data: any) =>
    api.post('/auth/register', data),
  
  getMe: () =>
    api.get('/auth/me'),
};

// Spaces API
export const spacesAPI = {
  search: (params?: any) =>
    api.get('/spaces/search', { params }),
  
  getById: (id: number) =>
    api.get(`/spaces/${id}`),
  
  getMySpaces: () =>
    api.get('/spaces/my-spaces'),
  
  create: (data: any) =>
    api.post('/spaces', data),
  
  update: (id: number, data: any) =>
    api.put(`/spaces/${id}`, data),
  
  delete: (id: number) =>
    api.delete(`/spaces/${id}`),
};

// Bookings API
export const bookingsAPI = {
  getMyBookings: () =>
    api.get('/bookings'),
  
  create: (data: any) =>
    api.post('/bookings', data),
  
  getById: (id: number) =>
    api.get(`/bookings/${id}`),
  
  cancel: (id: number) =>
    api.put(`/bookings/${id}/cancel`),
};

export default api;