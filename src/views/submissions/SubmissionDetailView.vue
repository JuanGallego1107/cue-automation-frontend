<template>
  <AppLayout>
    <div class="page">
      <!-- Botón de retorno -->
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

      <!-- Cargando Detalle -->
      <div v-if="store.isLoadingDetail && !store.currentSubmission" class="detail-loading" aria-busy="true">
        <div class="spinner-lg"></div>
        <p>Cargando información del envío...</p>
      </div>

      <!-- Envío Encontrado -->
      <div v-else-if="store.currentSubmission" class="detail-container">
        <!-- Banner de Procesamiento (Polling Activo) -->
        <div v-if="isProcessing" class="info-banner-processing">
          <div class="banner-content">
            <div class="spinner-sm-blue"></div>
            <span>
              <strong>Tu documento está siendo analizado.</strong> Este proceso se realiza mediante IA y puede tardar unos minutos. La página se actualizará automáticamente.
            </span>
          </div>
        </div>

        <!-- Banner de Fallido -->
        <div v-if="isFailed" class="info-banner-failed">
          <div class="banner-content">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              class="banner-icon"
            >
              <polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <div class="failed-info">
              <span>
                <strong>Error en proceso:</strong>
                {{ store.currentSubmission.rejection_reason || 'Ocurrió un problema técnico inesperado durante el análisis.' }}
              </span>
              <a href="mailto:soporte@cue.edu.co" class="support-link">Contactar a soporte</a>
            </div>
          </div>
        </div>

        <!-- Encabezado de Detalle -->
        <div class="detail-header">
          <div class="header-main">
            <div class="header-title-group">
              <h1 :title="store.currentSubmission.original_filename">
                {{ store.currentSubmission.original_filename }}
              </h1>
              <SubmissionStatusBadge :status="store.currentSubmission.status" size="md" />
            </div>

            <!-- Acciones en el header, siempre visibles -->
            <div v-if="canShowActions" class="header-actions">
              <!-- Cancelar -->
              <button
                v-if="canCancel"
                class="btn-danger"
                @click="handleCancel"
                id="btn-cancel-submission"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="btn-icon">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                </svg>
                Cancelar revisión
              </button>

              <!-- Confirmar y subir a Drive -->
              <button
                v-if="canConfirm"
                class="btn-success"
                @click="showConfirmModal = true"
                id="btn-confirm-drive"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="btn-icon">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                Confirmar y subir a Drive
              </button>
            </div>
          </div>
        </div>

        <!-- Paneles apilados: Detalles arriba, Resultados IA abajo -->
        <div class="detail-stack">
          <SubmissionDetailPanel :submission="store.currentSubmission" />
          <ValidationResultPanel :submission="store.currentSubmission" />
        </div>
      </div>

      <!-- Confirm Approval Modal -->
      <ConfirmApprovalModal
        v-if="store.currentSubmission"
        v-model="showConfirmModal"
        :submission="store.currentSubmission"
      />
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSubmissionStore } from '@/stores/submissionStore'
import { useAuthStore } from '@/stores/authStore'
import { ROLES, SUBMISSION_STATUS } from '@/constants/submissionStatuses'
import AppLayout from '@/layouts/AppLayout.vue'
import SubmissionStatusBadge from '@/components/submissions/SubmissionStatusBadge.vue'
import SubmissionDetailPanel from '@/components/submissions/SubmissionDetailPanel.vue'
import ValidationResultPanel from '@/components/submissions/ValidationResultPanel.vue'
import ConfirmApprovalModal from '@/components/submissions/ConfirmApprovalModal.vue'

const route = useRoute()
const router = useRouter()
const store = useSubmissionStore()
const auth = useAuthStore()

const uuid = route.params.uuid
const showConfirmModal = ref(false)

// Polling interval state
let pollInterval = null

// Computeds
const isCoordinator = computed(() => auth.user?.role?.name === ROLES.COORDINATOR)

const isProcessing = computed(() => {
  return store.currentSubmission?.status === SUBMISSION_STATUS.PROCESSING
})

const isFailed = computed(() => {
  return store.currentSubmission?.status === SUBMISSION_STATUS.FAILED
})

// Verificar dueño del envío
const isOwner = computed(() => {
  if (!store.currentSubmission || !auth.user) return false
  const submissionUserId = store.currentSubmission.user_id || store.currentSubmission.coordinator?.id
  return submissionUserId === auth.user.id
})

// Reglas de botones de acción
const canCancel = computed(() => {
  return (
    isCoordinator.value &&
    isOwner.value &&
    store.currentSubmission?.status === SUBMISSION_STATUS.PENDING
  )
})

const canConfirm = computed(() => {
  return (
    isCoordinator.value &&
    isOwner.value &&
    store.currentSubmission?.status === SUBMISSION_STATUS.PENDING_APPROVAL
  )
})

const canShowActions = computed(() => {
  return canCancel.value || canConfirm.value
})

// Acciones
async function handleCancel() {
  const confirmed = window.confirm(
    '¿Estás seguro de que deseas cancelar esta revisión? Esta acción eliminará el envío del sistema.'
  )
  if (!confirmed) return

  try {
    await store.cancelSubmission(uuid)
    router.push('/submissions')
  } catch (err) {
    alert('Error al cancelar la revisión: ' + store.error)
  }
}

// Polling Logic
function startPolling() {
  stopPolling()
  pollInterval = setInterval(async () => {
    try {
      const updated = await store.fetchSubmission(uuid)
      // Si el estado deja de ser processing, detenemos el refresco
      if (updated.status !== SUBMISSION_STATUS.PROCESSING) {
        stopPolling()
      }
    } catch (_) {
      // Si falla la petición (ej: se cancela la sesión), detenemos
      stopPolling()
    }
  }, 15000) // cada 15 segundos
}

function stopPolling() {
  if (pollInterval) {
    clearInterval(pollInterval)
    pollInterval = null
  }
}

// Observa el estado del envío para encender/apagar polling
watch(isProcessing, (processingActive) => {
  if (processingActive) {
    startPolling()
  } else {
    stopPolling()
  }
})

// Lifecycle
onMounted(async () => {
  try {
    const submission = await store.fetchSubmission(uuid)
    if (submission.status === SUBMISSION_STATUS.PROCESSING) {
      startPolling()
    }
  } catch (err) {
    // Si no encuentra el envío (404) o hay error de carga, redirigir
    const status = err.response?.status
    if (status === 404) {
      alert('El envío solicitado no existe.')
      router.push('/submissions')
    }
  }
})

onUnmounted(() => {
  stopPolling()
})
</script>

<style scoped>
.page {
  padding: 2rem;
  max-width: 1200px;
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
  color: rgba(255, 255, 255, 0.45);
  font-size: 0.85rem;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition: color 0.15s;
  padding: 0.25rem 0;
}

.btn-back:hover {
  color: white;
}

.back-icon {
  width: 16px;
  height: 16px;
}

.detail-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 8rem 0;
  color: rgba(255, 255, 255, 0.4);
  gap: 1rem;
}

.detail-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Banner de Procesamiento */
.info-banner-processing {
  background: rgba(59, 130, 246, 0.08);
  border: 1px solid rgba(59, 130, 246, 0.25);
  border-radius: 12px;
  padding: 0.85rem 1.25rem;
  color: #60a5fa;
  animation: pulse-banner 2s infinite ease-in-out;
}

.banner-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.85rem;
  line-height: 1.45;
}

.spinner-sm-blue {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(96, 165, 250, 0.3);
  border-top-color: #60a5fa;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  flex-shrink: 0;
}

@keyframes pulse-banner {
  0%, 100% { opacity: 0.9; }
  50% { opacity: 1; border-color: rgba(59, 130, 246, 0.4); }
}

/* Banner de Fallo */
.info-banner-failed {
  background: rgba(239, 68, 68, 0.08);
  border: 1px solid rgba(239, 68, 68, 0.25);
  border-radius: 12px;
  padding: 1rem 1.25rem;
  color: #f87171;
}

.banner-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  margin-top: 2px;
}

.failed-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.support-link {
  color: white;
  text-decoration: underline;
  font-weight: 600;
  width: fit-content;
}

.support-link:hover {
  color: #f87171;
}

/* Encabezado */
.detail-header {
  margin-bottom: 1.5rem;
}

.header-main {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
}

.header-title-group {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  min-width: 0;
  flex: 1;
}

.header-title-group h1 {
  font-size: 1.5rem;
  font-weight: 800;
  color: white;
  margin: 0;
  word-break: break-word;
  min-width: 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-shrink: 0;
}

/* Stack de paneles: una columna, apilados verticalmente */
.detail-stack {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}



/* Botones de acción */
.btn-icon {
  width: 15px;
  height: 15px;
}

.btn-danger {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(248, 113, 113, 0.12);
  border: 1px solid rgba(248, 113, 113, 0.3);
  color: #f87171;
  border-radius: 10px;
  padding: 0.7rem 1.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-danger:hover {
  background: rgba(248, 113, 113, 0.22);
}

.btn-success {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border: none;
  border-radius: 10px;
  padding: 0.7rem 1.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25);
}

.btn-success:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(16, 185, 129, 0.35);
}

/* Spinners */
.spinner-lg {
  width: 36px;
  height: 36px;
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
