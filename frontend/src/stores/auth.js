import { defineStore } from 'pinia'
import api from '../utils/api'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: localStorage.getItem('token') || null
  }),
  getters: {
    isLoggedIn: s => !!s.token,
    isActivated: s => s.user?.is_activated ?? false
  },
  actions: {
    async login(username, password) {
      const data = await api.post('/auth/login', { username, password })
      this.token = data.token
      this.user = data.user
      localStorage.setItem('token', data.token)
      return data
    },
    async register(username, password) {
      const data = await api.post('/auth/register', { username, password })
      this.token = data.token
      this.user = data.user
      localStorage.setItem('token', data.token)
      return data
    },
    async activate(code) {
      const data = await api.post('/auth/activate', { code })
      if (this.user) this.user.is_activated = true
      return data
    },
    async fetchUser() {
      const data = await api.get('/auth/me')
      this.user = data.user
    },
    logout() {
      this.token = null
      this.user = null
      localStorage.removeItem('token')
    }
  }
})
