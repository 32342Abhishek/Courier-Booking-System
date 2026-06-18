import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data: { name: string; email: string; password: string }) => api.post('/auth/register', data),
  login: (data: { email: string; password: string }) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  createAdmin: (data: { name: string; email: string; password: string; adminSecret: string }) => api.post('/auth/create-admin', data),
};

export const bookingsAPI = {
  create: (data: { 
    senderName: string; 
    senderPhone: string; 
    senderAddress: string; 
    receiverName: string; 
    receiverPhone: string; 
    receiverAddress: string; 
    packageType: string; 
    packageWeight: number;
    packageImage?: string;
    calculatedPrice?: number;
  }) => api.post('/bookings', data),
  getMyBookings: () => api.get('/bookings/my'),
  getAllBookings: () => api.get('/bookings'),
  approve: (id: string) => api.patch(`/bookings/${id}/approve`),
  reject: (id: string) => api.patch(`/bookings/${id}/reject`),
};

export const shipmentsAPI = {
  track: (trackingNumber: string) => api.get(`/shipments/track/${trackingNumber}`),
  getAll: () => api.get('/shipments'),
  updateStatus: (id: string, status: string, note?: string) => api.patch(`/shipments/${id}/status`, { status, note }),
};

export default api;
