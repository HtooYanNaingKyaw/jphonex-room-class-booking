import axios, { AxiosError } from 'axios';
import type { AxiosResponse } from 'axios';
import toast from 'react-hot-toast';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: 'http://localhost:3000/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    // Handle common errors
    if (error.response?.status === 401) {
      // Unauthorized - redirect to login
      localStorage.removeItem('admin_token');
      window.location.href = '/login';
      return Promise.reject(error);
    }

    if (error.response?.status === 403) {
      toast.error('Access denied');
    } else if (error.response?.status === 404) {
      toast.error('Resource not found');
    } else if (error.response && error.response.status >= 500) {
      toast.error('Server error. Please try again later.');
    } else if (error.code === 'ECONNABORTED') {
      toast.error('Request timeout. Please try again.');
    } else if (!error.response) {
      toast.error('Network error. Please check your connection.');
    }

    return Promise.reject(error);
  }
);

// User API
export const userAPI = {
  // Get users with pagination and filters
  getUsers: (params: URLSearchParams) => 
    api.get(`/users?${params.toString()}`),
  
  // Get user roles
  getRoles: () => 
    api.get('/users/roles/list'),
  
  // Create user
  createUser: (userData: any) => 
    api.post('/users', userData),
  
  // Update user
  updateUser: (id: string, data: any) => 
    api.put(`/users/${id}`, data),
  
  // Delete user
  deleteUser: (id: string) => 
    api.delete(`/users/${id}`),
  
  // Adjust user points
  adjustPoints: (id: string, data: { delta: number; reason: string }) => 
    api.post(`/users/${id}/points`, data),
  
  // Get user point history  
  getPointHistory: (id: string, params?: URLSearchParams) => 
    api.get(`/users/${id}/points${params ? `?${params.toString()}` : ''}`),
};

// Classes API
export const classAPI = {
  // Get classes
  getClasses: (params?: URLSearchParams) => 
    api.get(`/classes${params ? `?${params.toString()}` : ''}`),
  
  // Create class
  createClass: (data: any) => 
    api.post('/classes', data),
  
  // Update class
  updateClass: (id: string, data: any) => 
    api.put(`/classes/${id}`, data),
  
  // Delete class
  deleteClass: (id: string) => 
    api.delete(`/classes/${id}`),
  
  // Get class schedules
  getSchedules: (classId?: string) => 
    api.get(`/schedules${classId ? `?class_id=${classId}` : ''}`),
  
  // Create schedule
  createSchedule: (data: any) => 
    api.post('/schedules', data),
  
  // Update schedule
  updateSchedule: (id: string, data: any) => 
    api.put(`/schedules/${id}`, data),
  
  // Delete schedule
  deleteSchedule: (id: string) => 
    api.delete(`/schedules/${id}`),
};

// Rooms API
export const roomAPI = {
  // Get rooms
  getRooms: (params?: URLSearchParams) => 
    api.get(`/rooms${params ? `?${params.toString()}` : ''}`),
  
  // Create room
  createRoom: (data: any) => 
    api.post('/rooms', data),
  
  // Update room
  updateRoom: (id: string, data: any) => 
    api.put(`/rooms/${id}`, data),
  
  // Delete room
  deleteRoom: (id: string) => 
    api.delete(`/rooms/${id}`),
  
  // Get room types
  getRoomTypes: () => 
    api.get('/rooms/types'),
  
  // Create room type
  createRoomType: (data: any) => 
    api.post('/rooms/types', data),
  
  // Update room type
  updateRoomType: (id: string, data: any) => 
    api.put(`/rooms/types/${id}`, data),
  
  // Delete room type
  deleteRoomType: (id: string) => 
    api.delete(`/rooms/types/${id}`),
};

// Auth API
export const authAPI = {
  // Login
  login: (credentials: { email: string; password: string }) => 
    api.post('/auth/login', credentials),
  
  // Logout
  logout: () => 
    api.post('/auth/logout'),
  
  // Get current user
  getCurrentUser: () => 
    api.get('/auth/me'),
};

// Analytics API
export const analyticsAPI = {
  // Get dashboard analytics
  getDashboardAnalytics: () =>
    api.get(`/analytics/dashboard`),
  
  // Get bookings analytics
  getBookingsAnalytics: (params?: URLSearchParams) => 
    api.get(`/analytics/bookings${params ? `?${params.toString()}` : ''}`),
  
  // Get revenue analytics
  getRevenueAnalytics: (params?: URLSearchParams) => 
    api.get(`/analytics/revenue${params ? `?${params.toString()}` : ''}`),
  
  // Get users analytics
  getUsersAnalytics: (params?: URLSearchParams) => 
    api.get(`/analytics/users${params ? `?${params.toString()}` : ''}`),
};

// Policies API
export const policyAPI = {
  // Get policies
  getPolicies: (params?: URLSearchParams) => 
    api.get(`/policies${params ? `?${params.toString()}` : ''}`),
  
  // Create policy
  createPolicy: (data: any) => 
    api.post('/policies', data),
  
  // Update policy
  updatePolicy: (id: string, data: any) => 
    api.put(`/policies/${id}`, data),
  
  // Delete policy
  deletePolicy: (id: string) => 
    api.delete(`/policies/${id}`),
  
  // Toggle policy status
  togglePolicy: (id: string) => 
    api.patch(`/policies/${id}/toggle`),
};

// Dashboard API
export const dashboardAPI = {
  // Get dashboard data
  getDashboard: () => 
    api.get('/dashboard'),
};

export default api;
