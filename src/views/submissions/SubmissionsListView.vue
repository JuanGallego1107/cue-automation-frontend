<template>
  <AppLayout>
    <div class="page">
      <!-- Encabezado de página -->
      <div class="page-header">
        <div>
          <h1>Revisiones de documentos</h1>
          <p class="page-subtitle">Monitoreo y análisis de planeadores y registros de notas</p>
        </div>

        <!-- Botón de nueva revisión (Sólo Coordinador) -->
        <div v-if="isCoordinator" class="header-action-wrapper">
          <RouterLink
            v-if="!store.hasActiveReview"
            to="/submissions/upload"
            class="btn-primary"
            id="btn-upload-submission"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              class="btn-icon"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Nueva revisión
          </RouterLink>

          <!-- Botón deshabilitado si tiene revisión activa -->
          <button
            v-else
            class="btn-primary disabled"
            disabled
            title="Ya tienes una revisión en proceso. Espera a que finalice antes de subir otro documento."
            id="btn-upload-submission-disabled"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              class="btn-icon"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Nueva revisión
            <!-- Tooltip visual premium -->
            <span class="tooltip-text">
              Ya tienes una revisión en proceso. Espera a que finalice antes de subir otro documento.
            </span>
          </button>
        </div>
      </div>

      <!-- Filtros -->
      <SubmissionFilters />

      <!-- Cargando: Skeleton de 5 tarjetas -->
      <div v-if="store.isLoading" class="submissions-grid" aria-busy="true">
        <div v-for="n in 5" :key="`skeleton-${n}`" class="skeleton-card">
          <div class="skeleton-header">
            <div class="skeleton-circle"></div>
            <div class="skeleton-title"></div>
          </div>
          <div class="skeleton-body">
            <div class="skeleton-line w-1/2"></div>
            <div class="skeleton-line w-3/4"></div>
            <div class="skeleton-line w-2/3"></div>
          </div>
          <div class="skeleton-footer">
            <div class="skeleton-line w-1/3"></div>
          </div>
        </div>
      </div>

      <!-- Contenido de Envíos -->
      <div v-else>
        <!-- Estado Vacío -->
        <div v-if="store.submissions.length === 0" class="empty-state">
          <div class="empty-illustration">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              class="illustration-icon"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="9" y1="15" x2="15" y2="15" />
            </svg>
          </div>
          
          <!-- Mensajes Contextuales -->
          <div v-if="hasActiveFilters" class="empty-text">
            <h3>Sin resultados de búsqueda</h3>
            <p>No hay resultados para los filtros aplicados. Intenta cambiarlos o limpiarlos.</p>
            <button class="btn-ghost mt-3" @click="store.clearFilters">
              Limpiar filtros
            </button>
          </div>
          <div v-else-if="isCoordinator" class="empty-text">
            <h3>Aún no has enviado ningún documento</h3>
            <p>Comienza subiendo tu primer planeador o registro de notas para validarlo con Inteligencia Artificial.</p>
            <RouterLink to="/submissions/upload" class="btn-primary mt-3">
              Subir primero
            </RouterLink>
          </div>
          <div v-else class="empty-text">
            <h3>No hay envíos registrados en el sistema</h3>
            <p>Los envíos y revisiones pendientes de los coordinadores aparecerán en este panel.</p>
          </div>
        </div>

        <!-- Grid de Tarjetas -->
        <div v-else class="submissions-grid">
          <SubmissionCard
            v-for="sub in store.submissions"
            :key="sub.id"
            :submission="sub"
            @click="navigateToDetail"
            @confirm="openConfirmModal"
          />
        </div>

        <!-- Paginación -->
        <div v-if="store.pagination.lastPage > 1" class="pagination">
          <button
            class="page-btn"
            :disabled="store.pagination.currentPage === 1 || store.isLoading"
            @click="changePage(store.pagination.currentPage - 1)"
          >
            &larr; Anterior
          </button>
          <span class="page-info">
            Página {{ store.pagination.currentPage }} de {{ store.pagination.lastPage }}
          </span>
          <button
            class="page-btn"
            :disabled="store.pagination.currentPage === store.pagination.lastPage || store.isLoading"
            @click="changePage(store.pagination.currentPage + 1)"
          >
            Siguiente &rarr;
          </button>
        </div>
      </div>

      <!-- Confirm Approval Modal -->
      <ConfirmApprovalModal
        v-if="submissionToConfirm"
        v-model="showConfirmModal"
        :submission="submissionToConfirm"
        @confirmed="handleConfirmSuccess"
        @cancelled="submissionToConfirm = null"
      />

    </div>
  </AppLayout>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useSubmissionStore } from '@/stores/submissionStore'
import { useAuthStore } from '@/stores/authStore'
import { ROLES } from '@/constants/submissionStatuses'
import AppLayout from '@/layouts/AppLayout.vue'
import SubmissionFilters from '@/components/submissions/SubmissionFilters.vue'
import SubmissionCard from '@/components/submissions/SubmissionCard.vue'
import ConfirmApprovalModal from '@/components/submissions/ConfirmApprovalModal.vue'

const router = useRouter()
const store = useSubmissionStore()
const auth = useAuthStore()

const showConfirmModal = ref(false)
const submissionToConfirm = ref(null)

// Rol verificación
const isCoordinator = computed(() => auth.user?.role?.name === ROLES.COORDINATOR)

// Chequea si hay filtros aplicados
const hasActiveFilters = computed(() => {
  return Object.values(store.filters).some((v) => v !== '' && v !== null && v !== undefined)
})

// Acciones
function navigateToDetail(uuid) {
  router.push(`/submissions/${uuid}`)
}

function changePage(page) {
  store.fetchSubmissions(page)
}

function openConfirmModal(submission) {
  submissionToConfirm.value = submission
  showConfirmModal.value = true
}

function handleConfirmSuccess() {
  submissionToConfirm.value = null
}

onMounted(async () => {
  // Cargar lista con filtros actuales
  store.fetchSubmissions()
  // Llenar selectores del filtro
  store.fetchPeriods()
  store.fetchDocumentTypes()
})
</script>

<style scoped>
.page {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 2rem;
  gap: 1rem;
}

.page-header h1 {
  font-size: 1.75rem;
  font-weight: 800;
  color: var(--c-text);
  margin-bottom: 0.25rem;
}

.page-subtitle {
  color: var(--c-text-muted);
  font-size: 0.9rem;
  margin: 0;
}

/* Botón deshabilitado con Tooltip visual premium */
.header-action-wrapper {
  position: relative;
  display: inline-block;
}

.btn-primary.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: var(--c-border);
  border: 1px solid var(--c-border);
  color: var(--c-text-muted);
  box-shadow: none;
}

.btn-primary.disabled:hover {
  transform: none;
}

.tooltip-text {
  visibility: hidden;
  width: 260px;
  background-color: var(--c-text);
  color: white;
  text-align: center;
  border-radius: 8px;
  padding: 0.6rem 0.8rem;
  position: absolute;
  z-index: 100;
  bottom: 125%;
  right: 0;
  opacity: 0;
  transition: opacity 0.2s;
  font-size: 0.775rem;
  line-height: 1.4;
  border: 1px solid rgba(0, 0, 0, 0.1);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  pointer-events: none;
}

.header-action-wrapper:hover .tooltip-text {
  visibility: visible;
  opacity: 1;
}

/* Grid layout para submissions */
.submissions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

/* Skeleton Loading indicator */
.skeleton-card {
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: 16px;
  padding: 1.25rem;
  min-height: 190px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.skeleton-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.skeleton-circle {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #e2e8f0;
  animation: pulse 1.5s ease-in-out infinite;
  flex-shrink: 0;
}

.skeleton-title {
  height: 14px;
  background: #e2e8f0;
  border-radius: 4px;
  width: 60%;
  animation: pulse 1.5s ease-in-out infinite;
}

.skeleton-body {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
}

.skeleton-line {
  height: 10px;
  background: #e2e8f0;
  border-radius: 3px;
  animation: pulse 1.5s ease-in-out infinite;
}

.skeleton-footer {
  border-top: 1px solid var(--c-border);
  padding-top: 0.75rem;
}

.w-1\/2 { width: 50%; }
.w-3\/4 { width: 75%; }
.w-2\/3 { width: 66.666%; }
.w-1\/3 { width: 33.333%; }

@keyframes pulse {
  0%, 100% { opacity: 0.5; }
  50%       { opacity: 1;   }
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 5rem 2rem;
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: 20px;
  min-height: 350px;
}

.empty-illustration {
  width: 64px;
  height: 64px;
  background: var(--c-primary-pale);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
  color: var(--c-primary);
}

.illustration-icon {
  width: 28px;
  height: 28px;
}

.empty-text h3 {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--c-text);
  margin-bottom: 0.5rem;
}

.empty-text p {
  font-size: 0.875rem;
  color: var(--c-text-muted);
  max-width: 420px;
  line-height: 1.5;
  margin: 0;
}

.mt-3 {
  margin-top: 1rem;
}

/* Paginación */
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 1.5rem 1rem 0;
  border-top: 1px solid var(--c-border);
  margin-top: 1rem;
}

.page-btn {
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  color: var(--c-text-muted);
  padding: 0.45rem 1.15rem;
  border-radius: 8px;
  font-size: 0.825rem;
  cursor: pointer;
  transition: all 0.15s;
  font-weight: 500;
}

.page-btn:hover:not(:disabled) {
  background: var(--c-primary-pale);
  border-color: var(--c-primary-mid);
  color: var(--c-primary);
}

.page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.page-info {
  font-size: 0.825rem;
  color: var(--c-text-muted);
}

.btn-icon {
  width: 14px;
  height: 14px;
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background: var(--c-primary);
  color: white;
  border: none;
  border-radius: 10px;
  padding: 0.6rem 1.25rem;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
  box-shadow: 0 4px 12px rgba(17, 85, 156, 0.25);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  background: #0e4a88;
  box-shadow: 0 6px 16px rgba(17, 85, 156, 0.35);
}

.btn-ghost {
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  color: var(--c-text-muted);
  border-radius: 10px;
  padding: 0.6rem 1.25rem;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
}

.btn-ghost:hover {
  background: var(--c-primary-pale);
  color: var(--c-primary);
}
</style>
