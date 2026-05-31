import { defineStore } from 'pinia'
import api from '@/api/axios'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('access_token') || null,
    loading: false,
    error: null,           // Mensaje general de error
    validationErrors: {}, // Errores por campo (ej: { email: ['...'] })
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    userRole: (state) => state.user?.role || null,

    // Array plano de nombres de permisos: ['users.view', 'users.create', ...]
    permissions: (state) => {
      return state.user?.role?.permissions?.map((p) => p.name) ?? []
    },

    // Verifica si el usuario tiene un permiso específico
    hasPermission: (state) => (permissionName) => {
      const perms = state.user?.role?.permissions?.map((p) => p.name) ?? []
      return perms.includes(permissionName)
    },
  },

  actions: {
    async login(credentials) {
      this.loading = true
      this.error = null
      this.validationErrors = {}
      try {
        const response = await api.post('/api/login', credentials)
        const { access_token, user } = response.data

        this.token = access_token
        this.user = user

        // Persistir en localStorage
        localStorage.setItem('access_token', access_token)
        localStorage.setItem('user', JSON.stringify(user))

        return response.data
      } catch (err) {
        const data = err.response?.data

        // Mensaje general (ej: "Los datos proporcionados no son válidos.")
        this.error = data?.message || 'Error al iniciar sesión'

        // Errores por campo (ej: { email: ['These credentials do not match...'] })
        if (data?.errors && typeof data.errors === 'object') {
          this.validationErrors = data.errors
        }

        throw err
      } finally {
        this.loading = false
      }
    },

    async logout() {
      this.loading = true
      try {
        await api.post('/api/logout')
      } catch (_) {
        // Si el backend falla, igual limpiamos localmente
      } finally {
        this.token = null
        this.user = null
        localStorage.removeItem('access_token')
        localStorage.removeItem('user')
        this.loading = false
      }
    },

    async fetchUser() {
      try {
        const response = await api.get('/api/user')
        this.user = response.data.user
        localStorage.setItem('user', JSON.stringify(this.user))
      } catch (_) {
        this.logout()
      }
    },
  },
})
