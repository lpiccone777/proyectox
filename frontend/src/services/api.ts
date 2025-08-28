import axios from 'axios';

const API_BASE_URL = 'http://localhost:5001/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token and user ID to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Temporary: add user ID to headers for routes without auth
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      if (user?.id) {
        config.headers['x-user-id'] = user.id;
      }
    } catch (e) {
      // Ignore parse errors
    }
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
  
  googleLogin: (credential: string) =>
    api.post('/auth/google', { credential }),
  
  appleLogin: (idToken: string) =>
    api.post('/auth/apple', { idToken }),
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
  
  uploadImages: (spaceId: number, formData: FormData) =>
    api.post(`/spaces/${spaceId}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
  
  deleteImage: (spaceId: number, imageId: number) =>
    api.delete(`/spaces/${spaceId}/images/${imageId}`),
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