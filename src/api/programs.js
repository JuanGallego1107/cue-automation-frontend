import api from './axios'

export const programsApi = {
  /** GET /api/programs */
  index() {
    return api.get('/api/programs')
  },
}
