import { defineStore } from 'pinia'
import { submissionService } from '@/services/submissionService'
import { SUBMISSION_STATUS } from '@/constants/submissionStatuses'

export const useSubmissionStore = defineStore('submission', {
  state: () => ({
    submissions: [],
    currentSubmission: null,
    pagination: {
      currentPage: 1,
      lastPage: 1,
      total: 0,
      perPage: 10,
    },
    filters: {
      status: '',
      period_id: '',
      document_type_id: '',
      date_from: '',
      date_to: '',
    },
    isLoading: false,
    isLoadingDetail: false,
    isUploading: false,
    isConfirming: false,
    uploadProgress: 0,
    error: null,
    documentTypes: [],
    subjects: [],
    periods: [],
  }),

  getters: {
    /**
     * Devuelve el primer envío activo (pending, processing, pending_approval)
     */
    activeSubmission: (state) => {
      const activeStatuses = [
        SUBMISSION_STATUS.PENDING,
        SUBMISSION_STATUS.PROCESSING,
        SUBMISSION_STATUS.PENDING_APPROVAL,
      ]
      return state.submissions.find((s) => activeStatuses.includes(s.status)) || null
    },

    /**
     * Determina si el coordinador tiene una revisión activa en curso
     */
    hasActiveReview: (state) => {
      const activeStatuses = [
        SUBMISSION_STATUS.PENDING,
        SUBMISSION_STATUS.PROCESSING,
        SUBMISSION_STATUS.PENDING_APPROVAL,
      ]
      return state.submissions.some((s) => activeStatuses.includes(s.status))
    },

    /**
     * Filtra los envíos por un estado específico
     */
    submissionsByStatus: (state) => {
      return (status) => state.submissions.filter((s) => s.status === status)
    },
  },

  actions: {
    /**
     * Carga la lista de envíos aplicando los filtros activos y paginación
     */
    async fetchSubmissions(page = 1) {
      this.isLoading = true
      this.error = null
      try {
        const params = {
          page,
          ...Object.fromEntries(
            Object.entries(this.filters).filter(([_, v]) => v !== '' && v !== null && v !== undefined)
          ),
        }
        const res = await submissionService.getAll(params)
        
        // El API responde con data: { data: [...], meta: { current_page, last_page, total, per_page } }
        const responseData = res.data
        this.submissions = responseData.data || []
        
        const meta = responseData.meta || {}
        this.pagination = {
          currentPage: meta.current_page || 1,
          lastPage: meta.last_page || 1,
          total: meta.total || 0,
          perPage: meta.per_page || 10,
        }
      } catch (err) {
        this.submissions = []
        this.error = this.normalizeError(err)
        throw err;
      } finally {
        this.isLoading = false
      }
    },

    /**
     * Carga el detalle de un envío específico por UUID
     */
    async fetchSubmission(uuid) {
      this.isLoadingDetail = true
      this.error = null
      try {
        const res = await submissionService.getByUuid(uuid)
        this.currentSubmission = res.data.data || res.data
        return this.currentSubmission
      } catch (err) {
        this.currentSubmission = null
        this.error = this.normalizeError(err)
        throw err
      } finally {
        this.isLoadingDetail = false
      }
    },

    /**
     * Crea un nuevo envío subiendo un archivo con progreso real
     */
    async uploadDocument(formData) {
      this.isUploading = true
      this.uploadProgress = 0
      this.error = null
      try {
        const res = await submissionService.create(formData, {
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              this.uploadProgress = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              )
            }
          },
        })
        const newSubmission = res.data.data || res.data
        
        // Agregar a la lista localmente
        this.submissions.unshift(newSubmission)
        return newSubmission
      } catch (err) {
        this.error = this.normalizeError(err)
        throw err
      } finally {
        this.isUploading = false
        this.uploadProgress = 0
      }
    },

    /**
     * Confirma la aprobación y carga en Drive de un envío
     */
    async confirmSubmission(uuid) {
      this.isConfirming = true
      this.error = null
      try {
        const res = await submissionService.confirm(uuid)
        const updatedSubmission = res.data.data || res.data

        // Actualizar en el estado local
        if (this.currentSubmission && this.currentSubmission.uuid === uuid) {
          this.currentSubmission = updatedSubmission
        }
        const index = this.submissions.findIndex((s) => s.uuid === uuid)
        if (index !== -1) {
          this.submissions[index] = updatedSubmission
        }
        return updatedSubmission
      } catch (err) {
        this.error = this.normalizeError(err)
        throw err
      } finally {
        this.isConfirming = false
      }
    },

    /**
     * Cancela una revisión pendiente
     */
    async cancelSubmission(uuid) {
      this.error = null
      try {
        await submissionService.cancel(uuid)
        
        // Quitar de la lista local
        this.submissions = this.submissions.filter((s) => s.uuid !== uuid)
        if (this.currentSubmission && this.currentSubmission.uuid === uuid) {
          this.currentSubmission = null
        }
      } catch (err) {
        this.error = this.normalizeError(err)
        throw err
      }
    },

    /**
     * Actualiza un filtro individual y recarga la lista
     */
    setFilter(key, value) {
      this.filters[key] = value
      this.fetchSubmissions(1)
    },

    /**
     * Resetea todos los filtros y recarga la lista
     */
    clearFilters() {
      this.filters = {
        status: '',
        period_id: '',
        document_type_id: '',
        date_from: '',
        date_to: '',
      }
      this.fetchSubmissions(1)
    },

    /**
     * Carga el catálogo de tipos de documento
     */
    async fetchDocumentTypes() {
      try {
        const res = await submissionService.getDocumentTypes()
        this.documentTypes = res.data.data || res.data || []
      } catch (err) {
        this.documentTypes = []
        this.error = this.normalizeError(err)
      }
    },

    /**
     * Carga el catálogo de materias filtrado por programa opcionalmente
     */
    async fetchSubjects(programId = null) {
      try {
        const res = await submissionService.getSubjects(programId)
        this.subjects = res.data.data || res.data || []
      } catch (err) {
        this.subjects = []
        this.error = this.normalizeError(err)
      }
    },

    /**
     * Carga el catálogo de períodos
     */
    async fetchPeriods() {
      try {
        const res = await submissionService.getPeriods()
        this.periods = res.data.data || res.data || []
      } catch (err) {
        this.periods = []
        this.error = this.normalizeError(err)
      }
    },

    /**
     * Limpia los errores almacenados en el store
     */
    clearError() {
      this.error = null
    },

    /**
     * Normaliza los errores del API a un mensaje legible
     */
    normalizeError(err) {
      const data = err.response?.data
      return data?.message || err.message || 'Error de conexión con el servidor.'
    },
  },
})
