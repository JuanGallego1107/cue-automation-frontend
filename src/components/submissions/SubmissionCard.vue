<template>
  <div
    class="submission-card"
    :class="{
      'status-processing': isProcessing,
      'status-pending-approval': isPendingApproval
    }"
    @click="emitClick"
    role="button"
    tabindex="0"
    @keydown.enter="emitClick"
    @keydown.space.prevent="emitClick"
  >
    <div class="card-header">
      <div class="title-section">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          class="doc-icon"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
        <h3 :title="submission.original_filename" class="filename">
          {{ truncatedFilename }}
        </h3>
      </div>
      <SubmissionStatusBadge :status="submission.status" size="sm" />
    </div>

    <div class="card-body">
      <div class="meta-row">
        <span class="meta-label">Tipo:</span>
        <span class="meta-val">{{ submission.document_type?.name || 'Desconocido' }}</span>
      </div>

      <div v-if="submission.subject" class="meta-row">
        <span class="meta-label">Materia:</span>
        <span class="meta-val">{{ submission.subject.name }} ({{ submission.subject.code }})</span>
      </div>

      <div v-if="submission.period" class="meta-row">
        <span class="meta-label">Período:</span>
        <span class="meta-val">{{ submission.period.name }}</span>
      </div>

      <div v-if="isAdmin && submission.coordinator" class="meta-row coordinator-row">
        <span class="meta-label">Coordinador:</span>
        <span class="meta-val highlight-user">{{ submission.coordinator.name }}</span>
      </div>
    </div>

    <div class="card-footer">
      <span class="date">{{ formattedDate }}</span>
      <div v-if="isProcessing" class="pulse-indicator" aria-label="Procesando documento">
        <span class="dot"></span>
        <span class="dot-pulse"></span>
      </div>
      <div v-else-if="isPendingApproval && isOwner && isCoordinator" class="card-actions" @click.stop>
        <button class="btn-confirm-sm" @click.stop="$emit('confirm', submission)" title="Confirmar y subir a Drive">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="sm-icon">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          Confirmar
        </button>
      </div>
      <span v-else class="action-hint">Ver detalle →</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { ROLES, SUBMISSION_STATUS } from '@/constants/submissionStatuses'
import { formatDate } from '@/utils/formatDate'
import SubmissionStatusBadge from './SubmissionStatusBadge.vue'

const props = defineProps({
  submission: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['click', 'confirm'])

const auth = useAuthStore()

const isAdmin = computed(() => auth.user?.role?.name === ROLES.ADMIN)
const isCoordinator = computed(() => auth.user?.role?.name === ROLES.COORDINATOR)

const isOwner = computed(() => {
  if (!auth.user) return false
  const submissionUserId = props.submission.user_id || props.submission.coordinator?.id
  return submissionUserId === auth.user.id
})

const isProcessing = computed(() => props.submission.status === SUBMISSION_STATUS.PROCESSING)
const isPendingApproval = computed(() => props.submission.status === SUBMISSION_STATUS.PENDING_APPROVAL)

const truncatedFilename = computed(() => {
  const name = props.submission.original_filename || ''
  return name.length > 38 ? name.substring(0, 35) + '...' : name
})

const formattedDate = computed(() => {
  return formatDate(props.submission.created_at)
})

function emitClick() {
  emit('click', props.submission.uuid)
}
</script>

<style scoped>
.submission-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 1.25rem;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  gap: 1rem;
  outline: none;
}

.submission-card:hover {
  transform: translateY(-2px);
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(102, 126, 234, 0.3);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
}

.submission-card:focus-visible {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.25);
}

/* Header */
.card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.title-section {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  min-width: 0;
}

.doc-icon {
  width: 18px;
  height: 18px;
  color: rgba(255, 255, 255, 0.55);
  flex-shrink: 0;
}

.filename {
  font-size: 0.925rem;
  font-weight: 600;
  color: white;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Body */
.card-body {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  flex: 1;
}

.meta-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
}

.meta-label {
  color: rgba(255, 255, 255, 0.35);
  font-weight: 500;
}

.meta-val {
  color: rgba(255, 255, 255, 0.7);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.coordinator-row {
  border-top: 1px solid rgba(255, 255, 255, 0.04);
  padding-top: 0.4rem;
  margin-top: 0.2rem;
}

.highlight-user {
  color: #a78bfa;
  font-weight: 500;
}

/* Footer */
.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  padding-top: 0.75rem;
  font-size: 0.75rem;
}

.date {
  color: rgba(255, 255, 255, 0.35);
}

.action-hint {
  color: rgba(102, 126, 234, 0.8);
  font-weight: 600;
  transition: color 0.15s;
}

.submission-card:hover .action-hint {
  color: #a78bfa;
}

/* Custom Status Highlights */
.submission-card.status-processing {
  border-color: rgba(59, 130, 246, 0.25);
  background: rgba(59, 130, 246, 0.02);
}

.submission-card.status-pending-approval {
  border-color: rgba(167, 139, 250, 0.35);
  background: rgba(167, 139, 250, 0.04);
  box-shadow: 0 4px 15px rgba(167, 139, 250, 0.08);
}

/* Pulse animation details */
.pulse-indicator {
  position: relative;
  width: 10px;
  height: 10px;
  margin-right: 4px;
}

.dot {
  position: absolute;
  width: 10px;
  height: 10px;
  background: #3b82f6;
  border-radius: 50%;
}

.dot-pulse {
  position: absolute;
  width: 10px;
  height: 10px;
  background: #3b82f6;
  border-radius: 50%;
  animation: pulse 1.5s ease-out infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 0.8;
  }
  100% {
    transform: scale(2.8);
    opacity: 0;
  }
}

.card-actions {
  display: flex;
  align-items: center;
}

.btn-confirm-sm {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.4rem 0.85rem;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 10px rgba(16, 185, 129, 0.2);
}

.btn-confirm-sm:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 14px rgba(16, 185, 129, 0.3);
}

.sm-icon {
  width: 14px;
  height: 14px;
}
</style>
