import axios from 'axios'
import { useAuthStore } from '../store/authStore'

const API_BASE_URL = '/api'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      
      const authStore = useAuthStore.getState()
      authStore.logout()
      
      window.location.href = '/login'
      return Promise.reject(error)
    }
    
    const errorMessage = getReadableError(error)
    return Promise.reject(new Error(errorMessage))
  }
)

function getReadableError(error) {
  const status = error.response?.status
  const data = error.response?.data
  
  switch (status) {
    case 404:
      return 'Resource not found (404): The requested endpoint does not exist'
    case 401:
      return 'Unauthorized (401): Please login to access this resource'
    case 403:
      return 'Forbidden (403): You do not have permission to access this resource'
    case 500:
      return 'Server Error (500): Internal server error occurred'
    case 409:
      return 'Conflict (409): Resource conflict detected'
    default:
      break
  }
  
  if (data?.message) {
    return `[${status}] ${data.message}`
  }
  if (data?.error) {
    return `[${status}] ${data.error}`
  }
  
  return error.message || 'Network error occurred'
}

export const authAPI = {
  login: (email, password) => apiClient.post('/auth/login', { email, password }),
  register: (name, email, password, hospitalId) => 
    apiClient.post('/auth/register', { name, email, password, hospitalId }),
  getMe: () => apiClient.get('/auth/me'),
}

export const ticketsAPI = {
  getAll: () => apiClient.get('/tickets'),
  getAdmin: () => apiClient.get('/tickets/admin'),
  getPending: () => apiClient.get('/tickets/pending'),
  getById: (id) => apiClient.get(`/tickets/${id}`),
  create: (data) => apiClient.post('/tickets', data),
  update: (id, data) => apiClient.patch(`/tickets/${id}`, data),
  delete: (id) => apiClient.delete(`/tickets/${id}`),
  assign: (id, adminId) => apiClient.patch(`/tickets/${id}/assign`, { adminId }),
  reply: (id, data) => apiClient.patch(`/tickets/${id}/reply`, data),
}

export const hospitalsAPI = {
  getAll: () => apiClient.get('/hospitals'),
  getById: (id) => apiClient.get(`/hospitals/${id}`),
  create: (data) => apiClient.post('/hospitals', data),
  update: (id, data) => apiClient.patch(`/hospitals/${id}`, data),
  delete: (id) => apiClient.delete(`/hospitals/${id}`),
}

export const usersAPI = {
  getAll: () => apiClient.get('/users'),
  assignAdmin: (data) => apiClient.post('/users/assign-admin', data),
}

export const chatAPI = {
  getMessages: (ticketId) => apiClient.get(`/chat/${ticketId}`),
  sendMessage: (ticketId, text) => 
    apiClient.post('/chat', { ticketId, text }),
}

export const dashboardAPI = {
  getStats: () => apiClient.get('/dashboard/stats'),
}

export default apiClient