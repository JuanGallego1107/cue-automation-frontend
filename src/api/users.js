import api from './axios'

export const usersApi = {
  /** GET /api/users?search=&role_id=&page= */
  index(params = {}) {
    return api.get('/api/users', { params })
  },

  /** GET /api/users/:id */
  show(id) {
    return api.get(`/api/users/${id}`)
  },

  /** POST /api/users */
  store(data) {
    return api.post('/api/users', data)
  },

  /** PUT /api/users/:id */
  update(id, data) {
    return api.put(`/api/users/${id}`, data)
  },

  /** DELETE /api/users/:id */
  destroy(id) {
    return api.delete(`/api/users/${id}`)
  },
}
