import { create } from 'zustand'
import { authAPI } from '../api/axiosClient'

const getStoredToken = () => localStorage.getItem('token')

export const useAuthStore = create((set, get) => ({
  user: null,
  token: getStoredToken(),
  isLoading: true,

  initialize: async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      set({ isLoading: false })
      return
    }

    try {
      const response = await authAPI.getMe()
      set({ user: response.data, token, isLoading: false })
    } catch (error) {
      localStorage.removeItem('token')
      set({ isLoading: false })
    }
  },

  login: async (email, password) => {
    const response = await authAPI.login(email, password)
    const { token, ...user } = response.data
    
    localStorage.setItem('token', token)
    localStorage.setItem('lastEmail', email)
    
    set({ user: response.data, token })
    return response.data
  },

  register: async (name, email, password, hospitalId) => {
    const response = await authAPI.register(name, email, password, hospitalId)
    const { token, ...user } = response.data
    
    localStorage.setItem('token', token)
    
    set({ user: response.data, token })
    return response.data
  },

  logout: () => {
    localStorage.removeItem('token')
    set({ user: null, token: null })
  },

  updateUser: (userData) => {
    set({ user: { ...get().user, ...userData } })
  },
}))