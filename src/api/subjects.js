import api from './axios'

export const subjectsApi = {
  /** GET /api/subjects?program_id= */
  index(params = {}) {
    return api.get('/api/subjects', { params })
  },

  /** GET /api/subjects/:id */
  show(id) {
    return api.get(`/api/subjects/${id}`)
  },

  /** 
   * POST /api/subjects 
   * Expects a FormData object containing the fields and the curriculum file if present.
   */
  store(formData) {
    return api.post('/api/subjects', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },

  /** 
   * POST /api/subjects/:id 
   * In Laravel, to update an resource with files using PUT, we send a POST 
   * with '_method: PUT' in the FormData.
   */
  update(id, formData) {
    return api.post(`/api/subjects/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },

  /** DELETE /api/subjects/:id */
  destroy(id) {
    return api.delete(`/api/subjects/${id}`)
  },
}
