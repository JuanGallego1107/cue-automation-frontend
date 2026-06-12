<template>
  <BaseModal
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    title="Confirmar subida a Google Drive"
    width="460px"
  >
    <div class="confirm-modal-body">
      <!-- Icon Indicator -->
      <div class="info-badge">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          class="info-icon"
        >
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      </div>

      <!-- Summary Card -->
      <div class="document-summary-card">
        <div class="summary-row">
          <span class="label">Archivo:</span>
          <span class="val truncate" :title="submission?.original_filename">
            {{ submission?.original_filename || '—' }}
          </span>
        </div>
        <div class="summary-row">
          <span class="label">Tipo:</span>
          <span class="val">{{ submission?.document_type?.name || '—' }}</span>
        </div>
        <div class="summary-row" v-if="submission?.period">
          <span class="label">Período:</span>
          <span class="val">{{ submission.period.name }}</span>
        </div>
      </div>

      <!-- Explanatory message -->
      <p class="explanatory-text">
        El documento no tiene correcciones pendientes. Al confirmar, se subirá automáticamente a la carpeta de Google Drive correspondiente y esta acción no podrá deshacerse.
      </p>

      <!-- Error display inside modal -->
      <div v-if="store.error" class="modal-error-alert">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          class="error-icon"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <span>{{ store.error }}</span>
      </div>
    </div>

    <!-- Modal Footer Actions -->
    <template #footer>
      <button
        class="btn-ghost"
        type="button"
        @click="handleCancel"
        :disabled="store.isConfirming"
      >
        Cancelar
      </button>
      <button
        class="btn-success-action"
        type="button"
        @click="handleConfirm"
        :disabled="store.isConfirming"
      >
        <span v-if="store.isConfirming" class="spinner-sm"></span>
        <span v-else>Confirmar subida</span>
      </button>
    </template>
  </BaseModal>
</template>

<script setup>
import { useSubmissionStore } from '@/stores/submissionStore'
import BaseModal from '@/components/ui/BaseModal.vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
  submission: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['update:modelValue', 'confirmed', 'cancelled'])

const store = useSubmissionStore()

function handleCancel() {
  store.clearError()
  emit('cancelled')
  emit('update:modelValue', false)
}

async function handleConfirm() {
  store.clearError()
  try {
    await store.confirmSubmission(props.submission.uuid)
    emit('confirmed')
    emit('update:modelValue', false)
  } catch (err) {
    // Keep modal open, error is displayed inside it from the store
  }
}
</script>

<style scoped>
.confirm-modal-body {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 1.25rem;
}

.info-badge {
  width: 52px;
  height: 52px;
  background: rgba(213, 237, 171, 0.4);
  border: 1px solid rgba(58, 98, 0, 0.2);
  color: var(--c-success-text);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.info-icon {
  width: 26px;
  height: 26px;
}

.document-summary-card {
  width: 100%;
  background: #f8fafc;
  border: 1px solid var(--c-border);
  border-radius: 12px;
  padding: 0.85rem 1.15rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  text-align: left;
}

.summary-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.825rem;
}

.summary-row .label {
  color: var(--c-text-muted);
  font-weight: 500;
  width: 60px;
  flex-shrink: 0;
}

.summary-row .val {
  color: var(--c-text);
  font-weight: 600;
}

.truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 280px;
}

.explanatory-text {
  font-size: 0.85rem;
  line-height: 1.55;
  color: var(--c-text-muted);
  margin: 0;
}

/* Error styles */
.modal-error-alert {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  background: var(--c-danger-pale);
  border: 1px solid rgba(207, 99, 107, 0.25);
  color: var(--c-danger);
  padding: 0.7rem 1rem;
  border-radius: 10px;
  font-size: 0.825rem;
  text-align: left;
  width: 100%;
}

.error-icon {
  width: 16px;
  height: 16px;
  margin-top: 1px;
  flex-shrink: 0;
}

/* Success primary button modification */
.btn-success-action {
  background: var(--c-success);
  color: var(--c-success-text);
  border: 1px solid rgba(58, 98, 0, 0.25);
  border-radius: 10px;
  padding: 0.65rem 1.25rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(58, 98, 0, 0.15);
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.btn-success-action:hover:not(:disabled) {
  transform: translateY(-1px);
  background: #c8e89a;
  box-shadow: 0 6px 16px rgba(58, 98, 0, 0.2);
}

.btn-success-action:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spinner-sm {
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid rgba(58, 98, 0, 0.3);
  border-top-color: var(--c-success-text);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
