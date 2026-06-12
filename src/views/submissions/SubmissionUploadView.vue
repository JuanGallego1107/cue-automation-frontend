<template>
  <AppLayout>
    <div class="page">
      <!-- Volver a la lista -->
      <div class="back-navigation">
        <RouterLink to="/submissions" class="btn-back">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            class="back-icon"
          >
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Volver a la lista
        </RouterLink>
      </div>

      <!-- Título de la vista -->
      <div class="view-header">
        <h1>Subir documento para revisión</h1>
        <p class="view-subtitle">Los archivos serán analizados de forma automática mediante Inteligencia Artificial</p>
      </div>

      <div class="upload-content-container">
        <!-- 1. Cargando Datos de Validación -->
        <div v-if="loadingValidation" class="loading-state">
          <div class="spinner-lg"></div>
          <p>Verificando estado de revisiones activas...</p>
        </div>

        <!-- 2. Alerta Bloqueante si ya tiene una revisión activa -->
        <div v-else-if="store.hasActiveReview && activeReview" class="blocking-alert-container">
          <div class="alert-circle-icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h3>Revisión Activa en Curso</h3>
          <p class="alert-message">
            Ya tienes una revisión activa en estado <strong>[{{ activeReviewStatusLabel }}]</strong>.
            No puedes subir otro documento hasta que finalice el proceso actual o sea resuelto.
          </p>
          
          <div class="active-file-card" v-if="activeReview">
            <div class="file-info">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                class="file-icon"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              <div class="file-details">
                <span class="filename" :title="activeReview.original_filename">
                  {{ activeReview.original_filename }}
                </span>
                <span class="status-badge-inline">
                  {{ activeReviewStatusLabel }}
                </span>
              </div>
            </div>
            <RouterLink :to="`/submissions/${activeReview.uuid}`" class="btn-primary btn-sm">
              Ver revisión activa
            </RouterLink>
          </div>
        </div>

        <!-- 3. Formulario de subida -->
        <div v-else class="form-container-box">
          <SubmissionUploadForm @submitted="handleUploadSuccess" />
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSubmissionStore } from '@/stores/submissionStore'
import { useAuthStore } from '@/stores/authStore'
import { ROLES, SUBMISSION_STATUS_CONFIG } from '@/constants/submissionStatuses'
import AppLayout from '@/layouts/AppLayout.vue'
import SubmissionUploadForm from '@/components/submissions/SubmissionUploadForm.vue'

const router = useRouter()
const store = useSubmissionStore()
const auth = useAuthStore()

const loadingValidation = ref(true)

// Redireccionar si no es Coordinador
onMounted(async () => {
  if (auth.user?.role?.name !== ROLES.COORDINATOR) {
    router.push('/submissions')
    return
  }

  // Carga envíos para calcular hasActiveReview en el store
  try {
    await store.fetchSubmissions()
  } catch (err) {
    // Manejar error silenciosamente
  } finally {
    loadingValidation.value = false
  }
})

// Envío activo
const activeReview = computed(() => store.activeSubmission)

const activeReviewStatusLabel = computed(() => {
  if (!activeReview.value) return ''
  return SUBMISSION_STATUS_CONFIG[activeReview.value.status]?.label || activeReview.value.status
})

// Callback tras subida exitosa
function handleUploadSuccess(newSubmission) {
  // Redireccionar al detalle del nuevo envío
  router.push({
    name: 'submissions.detail',
    params: { uuid: newSubmission.uuid }
  })
}
</script>

<style scoped>
.page {
  padding: 2rem;
  max-width: 720px; /* Ancho acotado para formularios */
  margin: 0 auto;
}

.back-navigation {
  margin-bottom: 1.5rem;
}

.btn-back {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: transparent;
  border: none;
  color: var(--c-text-muted);
  font-size: 0.85rem;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition: color 0.15s;
  padding: 0.25rem 0;
}

.btn-back:hover {
  color: var(--c-primary);
}

.back-icon {
  width: 16px;
  height: 16px;
}

.view-header {
  margin-bottom: 2rem;
}

.view-header h1 {
  font-size: 1.75rem;
  font-weight: 800;
  color: var(--c-text);
  margin-bottom: 0.25rem;
}

.view-subtitle {
  color: var(--c-text-muted);
  font-size: 0.9rem;
  margin: 0;
}

.upload-content-container {
  width: 100%;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  color: var(--c-text-muted);
  gap: 1rem;
}

.form-container-box {
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: 20px;
  padding: 2rem;
}

@media (max-width: 640px) {
  .form-container-box {
    padding: 1.5rem 1.25rem;
  }
}

/* Alerta Bloqueante */
.blocking-alert-container {
  background: var(--c-surface);
  border: 1px solid rgba(255, 204, 158, 0.4);
  border-radius: 20px;
  padding: 2.5rem 2rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.alert-circle-icon {
  width: 56px;
  height: 56px;
  background: rgba(255, 204, 158, 0.3);
  border: 1px solid rgba(122, 66, 0, 0.2);
  color: var(--c-warning-text);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.25rem;
}

.alert-circle-icon svg {
  width: 26px;
  height: 26px;
}

.blocking-alert-container h3 {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--c-text);
  margin-bottom: 0.75rem;
}

.alert-message {
  font-size: 0.9rem;
  color: var(--c-text-muted);
  max-width: 440px;
  line-height: 1.6;
  margin: 0 0 2rem 0;
}

.alert-message strong {
  color: var(--c-warning-text);
}

/* Ficha del Envío Activo */
.active-file-card {
  width: 100%;
  max-width: 460px;
  background: #f8fafc;
  border: 1px solid var(--c-border);
  border-radius: 14px;
  padding: 1rem 1.25rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  text-align: left;
}

@media (max-width: 480px) {
  .active-file-card {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }
}

.file-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 0;
}

.file-icon {
  width: 24px;
  height: 24px;
  color: var(--c-text-muted);
  flex-shrink: 0;
}

.file-details {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  min-width: 0;
}

.file-details .filename {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--c-text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.status-badge-inline {
  font-size: 0.725rem;
  font-weight: 600;
  color: var(--c-warning-text);
  background: rgba(255, 204, 158, 0.35);
  padding: 0.1rem 0.45rem;
  border-radius: 4px;
  width: fit-content;
  border: 1px solid rgba(122, 66, 0, 0.15);
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--c-primary);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
  white-space: nowrap;
  box-shadow: 0 4px 10px rgba(17, 85, 156, 0.2);
}

.btn-primary:hover {
  transform: translateY(-1px);
  background: #0e4a88;
}

.btn-sm {
  font-size: 0.75rem;
  padding: 0.45rem 0.9rem;
}

/* Spinner */
.spinner-lg {
  width: 36px;
  height: 36px;
  border: 3px solid var(--c-border);
  border-top-color: var(--c-primary);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
