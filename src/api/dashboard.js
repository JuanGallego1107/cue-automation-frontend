import api from './axios'

export const dashboardApi = {
  getDashboardStats() {
    return api.get('/api/dashboard')
  }
}
