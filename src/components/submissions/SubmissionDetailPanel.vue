<template>
  <div class="detail-panel">
    <!-- Seccion 1: Información del documento -->
    <div class="panel-section">
      <h3 class="section-title">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          class="section-icon"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
        Información del documento
      </h3>
      <div class="grid-details">
        <div class="detail-item">
          <span class="label">Archivo original</span>
          <span class="val truncate" :title="submission.original_filename">
            {{ submission.original_filename || '—' }}
          </span>
        </div>
        <div class="detail-item">
          <span class="label">Tipo de documento</span>
          <span class="val">{{ submission.document_type?.name || '—' }}</span>
        </div>
        <div class="detail-item">
          <span class="label">Tamaño</span>
          <span class="val">{{ formattedSize }}</span>
        </div>
      </div>
    </div>

    <!-- Seccion 2: Clasificación -->
    <div class="panel-section">
      <h3 class="section-title">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          class="section-icon"
        >
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
        </svg>
        Clasificación Académica
      </h3>
      <div class="grid-details">
        <div class="detail-item">
          <span class="label">Materia</span>
          <span class="val">
            {{ submission.subject ? `${submission.subject.name} (${submission.subject.code})` : '—' }}
          </span>
        </div>
        <div class="detail-item">
          <span class="label">Programa Académico</span>
          <span class="val">
            {{ submission.coordinator?.program?.name || '—' }}
          </span>
        </div>
        <div class="detail-item">
          <span class="label">Período</span>
          <span class="val">{{ submission.period?.name || '—' }}</span>
        </div>
      </div>
    </div>

    <!-- Seccion 3: Envío -->
    <div class="panel-section">
      <h3 class="section-title">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          class="section-icon"
        >
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
        Detalles de Envío
      </h3>
      <div class="grid-details">
        <div class="detail-item">
          <span class="label">Coordinador</span>
          <span class="val">
            {{ submission.coordinator?.name || '—' }}
          </span>
        </div>
        <div class="detail-item">
          <span class="label">Correo electrónico</span>
          <span class="val text-dim font-sm truncate" :title="submission.coordinator?.email">
            {{ submission.coordinator?.email || '—' }}
          </span>
        </div>
        <div class="detail-item">
          <span class="label">Fecha de envío</span>
          <span class="val">{{ formattedCreatedAt }}</span>
        </div>
        <div class="detail-item">
          <span class="label">Última actualización</span>
          <span class="val">{{ formattedUpdatedAt }}</span>
        </div>
      </div>
    </div>

    <!-- Seccion 4: Proceso -->
    <div class="panel-section">
      <h3 class="section-title">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          class="section-icon"
        >
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
        Estado del Proceso
      </h3>
      <div class="grid-details">
        <div class="detail-item">
          <span class="label">Estado actual</span>
          <span class="val-badge">
            <SubmissionStatusBadge :status="submission.status" size="md" />
          </span>
        </div>
        <div class="detail-item">
          <span class="label">Reintentos automáticos</span>
          <span class="val">{{ submission.retry_count ?? 0 }}</span>
        </div>
        <div class="detail-item">
          <span class="label">Fecha de revisión</span>
          <span class="val">{{ formattedReviewedAt }}</span>
        </div>
      </div>
    </div>

    <!-- Seccion 5: Notas del revisor (Condicional) -->
    <div v-if="submission.reviewer_notes" class="panel-section notes-section">
      <h3 class="section-title text-warning">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          class="section-icon"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        Notas del revisor
      </h3>
      <div class="notes-content">
        {{ submission.reviewer_notes }}
      </div>
    </div>

    <!-- Seccion 6: Almacenamiento en Google Drive (Condicional) -->
    <div v-if="isApproved && submission.drive_storage" class="panel-section drive-section">
      <h3 class="section-title text-success">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          class="section-icon"
        >
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
        Almacenamiento en Google Drive
      </h3>
      <div class="drive-content">
        <div class="detail-item mb-3">
          <span class="label">Ruta de carpeta</span>
          <span class="val drive-path">{{ submission.drive_storage.folder_path || '/' }}</span>
        </div>
        <a
          :href="submission.drive_storage.drive_url"
          target="_blank"
          class="btn-drive-link"
          rel="noopener noreferrer"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            class="drive-icon"
          >
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
          Abrir en Google Drive
        </a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { SUBMISSION_STATUS } from '@/constants/submissionStatuses'
import { formatDate } from '@/utils/formatDate'
import SubmissionStatusBadge from './SubmissionStatusBadge.vue'

const props = defineProps({
  submission: {
    type: Object,
    required: true,
  },
})

const isApproved = computed(() => props.submission.status === SUBMISSION_STATUS.APPROVED)

const formattedSize = computed(() => {
  const bytes = props.submission.file_size_bytes
  if (!bytes) return '—'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
})

const truncatedHash = computed(() => {
  const hash = props.submission.file_hash || props.submission.hash
  if (!hash) return '—'
  return hash.length > 16 ? hash.substring(0, 16) + '...' : hash
})

const formattedCreatedAt = computed(() => formatDate(props.submission.created_at))
const formattedUpdatedAt = computed(() => formatDate(props.submission.updated_at))
const formattedReviewedAt = computed(() => formatDate(props.submission.reviewed_at))
</script>

<style scoped>
.detail-panel {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.panel-section {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 16px;
  padding: 1.25rem 1.5rem;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 0.95rem;
  font-weight: 700;
  color: white;
  margin-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  padding-bottom: 0.6rem;
}

.section-icon {
  width: 16px;
  height: 16px;
  color: #a78bfa;
}

.grid-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 0;
}

.label {
  font-size: 0.725rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: rgba(255, 255, 255, 0.35);
  font-weight: 600;
}

.val {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.85);
  font-weight: 500;
}

.val-badge {
  display: inline-block;
  margin-top: 0.15rem;
}

.truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.code-font {
  font-family: monospace;
  font-size: 0.775rem;
  color: rgba(167, 139, 250, 0.8);
}

.text-dim {
  color: rgba(255, 255, 255, 0.5);
}

.font-sm {
  font-size: 0.8rem;
}

/* Notes section styling */
.notes-section {
  border-color: rgba(245, 158, 11, 0.2);
  background: rgba(245, 158, 11, 0.02);
}

.text-warning {
  color: #f59e0b !important;
}

.text-warning .section-icon {
  color: #f59e0b;
}

.notes-content {
  font-size: 0.85rem;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.85);
  white-space: pre-wrap;
}

/* Drive section styling */
.drive-section {
  border-color: rgba(16, 185, 129, 0.25);
  background: rgba(16, 185, 129, 0.02);
}

.text-success {
  color: #10b981 !important;
}

.text-success .section-icon {
  color: #10b981;
}

.drive-content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.drive-path {
  font-family: monospace;
  font-size: 0.8rem;
  color: #10b981;
  background: rgba(16, 185, 129, 0.08);
  padding: 0.25rem 0.6rem;
  border-radius: 6px;
  display: inline-block;
  width: fit-content;
}

.btn-drive-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  text-decoration: none;
  font-size: 0.825rem;
  font-weight: 600;
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  transition: all 0.2s ease;
  width: fit-content;
  box-shadow: 0 4px 10px rgba(16, 185, 129, 0.2);
}

.btn-drive-link:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 14px rgba(16, 185, 129, 0.3);
}

.drive-icon {
  width: 14px;
  height: 14px;
}

.mb-3 {
  margin-bottom: 0.75rem;
}
</style>
