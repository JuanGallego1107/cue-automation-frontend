import api from '@/api/axios'

export const submissionService = {
  /**
   * GET /api/submissions
   * params: { status, period_id, document_type_id, date_from, date_to, page }
   */
  getAll(params = {}) {
    return api.get('/api/submissions', { params })
  },

  /**
   * GET /api/submissions/:uuid
   */
  getByUuid(uuid) {
    return api.get(`/api/submissions/${uuid}`)
  },

  /**
   * POST /api/submissions (multipart/form-data)
   * payload: FormData with { file, document_type_id, subject_id?, period_id? }
   */
  create(formData, config = {}) {
    return api.post('/api/submissions', formData, {
      ...config,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },

  /**
   * POST /api/submissions/:uuid/confirm
   */
  confirm(uuid) {
    return api.post(`/api/submissions/${uuid}/confirm`)
  },

  /**
   * DELETE /api/submissions/:uuid
   */
  cancel(uuid) {
    return api.delete(`/api/submissions/${uuid}`)
  },

  /**
   * GET /api/document-types
   */
  getDocumentTypes() {
    return api.get('/api/document-types')
  },

  /**
   * GET /api/subjects?program_id=X
   */
  getSubjects(programId = null) {
    const params = programId ? { program_id: programId } : {}
    return api.get('/api/subjects', { params })
  },

  /**
   * GET /api/periods
   */
  getPeriods() {
    return api.get('/api/periods')
  },
}
