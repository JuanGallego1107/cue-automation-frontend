<template>
  <div class="upload-form-wrapper">
    <!-- Toast Message -->
    <Transition name="toast">
      <div v-if="showToast" class="toast-notification">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          class="toast-icon"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <span>{{ toastMessage }}</span>
      </div>
    </Transition>

    <!-- Blocking Error Alert -->
    <div v-if="blockingError" class="blocking-error-alert">
      <div class="alert-header">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          class="alert-icon"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <h4>Acción Bloqueada</h4>
      </div>
      <p>{{ blockingError }}</p>
    </div>

    <!-- Main Upload Form -->
    <form v-else @submit.prevent="handleSubmit" class="upload-form">
      <!-- 1. Document Type Select -->
      <div class="form-group">
        <label for="document_type_id">Tipo de documento *</label>
        <select
          id="document_type_id"
          v-model="form.document_type_id"
          required
          @change="onDocTypeChange"
        >
          <option value="" disabled>Seleccione un tipo de documento</option>
          <option
            v-for="type in store.documentTypes"
            :key="type.id"
            :value="type.id"
          >
            {{ type.name }}
          </option>
        </select>
        <span v-if="apiErrors.document_type_id" class="field-error">
          {{ apiErrors.document_type_id[0] }}
        </span>
      </div>

      <!-- 2. File Drag & Drop Zone -->
      <div class="form-group">
        <label>Archivo del documento *</label>
        <div
          class="drag-drop-zone"
          :class="{
            'drag-over': isDragOver,
            'has-file': selectedFile,
            'has-error': fileError
          }"
          @dragover.prevent="onDragOver"
          @dragleave="onDragLeave"
          @drop.prevent="onDrop"
          @click="triggerFileInput"
        >
          <input
            type="file"
            ref="fileInput"
            class="hidden-file-input"
            @change="onFileSelected"
            accept=".pdf,.docx,.doc"
          />

          <!-- Empty State -->
          <div v-if="!selectedFile" class="zone-content">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              class="upload-icon"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <p class="primary-text">Arrastra tu archivo aquí o haz clic para seleccionar</p>
            <p class="secondary-text" v-if="selectedDocType">
              Formatos admitidos: {{ formatAllowedExtensions }} (Máx. {{ selectedDocType.max_size_mb }} MB)
            </p>
            <p class="secondary-text" v-else>
              Selecciona primero un tipo de documento para ver restricciones.
            </p>
          </div>

          <!-- File Selected State -->
          <div v-else class="zone-content file-preview">
            <div class="file-icon-wrapper">
              <svg
                v-if="fileExtension === 'pdf'"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                class="file-icon pdf"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <path d="M9 15h2a2 2 0 0 0 0-4H9v6" />
                <path d="M13 11v6" />
                <path d="M13 11a3 3 0 0 1 3 3v0a3 3 0 0 1-3 3" />
              </svg>
              <svg
                v-else
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                class="file-icon doc"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
            </div>
            <div class="file-details">
              <p class="filename">{{ selectedFile.name }}</p>
              <p class="filesize">{{ formattedFileSize }}</p>
            </div>
            <button class="btn-remove-file" type="button" @click.stop="clearSelectedFile" aria-label="Quitar archivo">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>
        <!-- Client Inline Validation Error -->
        <span v-if="fileError" class="field-error">{{ fileError }}</span>
        <!-- Server Validation Error -->
        <span v-if="apiErrors.file" class="field-error">{{ apiErrors.file[0] }}</span>
      </div>

      <!-- 3. Subject Select (Optional) -->
      <div class="form-group">
        <label for="subject_id">Materia <span class="optional-text">(Opcional)</span></label>
        <select id="subject_id" v-model="form.subject_id">
          <option value="">Seleccione una materia</option>
          <option
            v-for="sub in store.subjects"
            :key="sub.id"
            :value="sub.id"
          >
            {{ sub.name }} ({{ sub.code }})
          </option>
        </select>
        <span v-if="apiErrors.subject_id" class="field-error">
          {{ apiErrors.subject_id[0] }}
        </span>
      </div>

      <!-- Upload Progress Bar -->
      <div v-if="store.isUploading" class="progress-bar-container">
        <div class="progress-info">
          <span>Subiendo archivo...</span>
          <span>{{ store.uploadProgress }}%</span>
        </div>
        <div class="progress-track">
          <div class="progress-fill" :style="{ width: `${store.uploadProgress}%` }"></div>
        </div>
      </div>

      <!-- Form Actions -->
      <div class="form-actions">
        <button
          type="submit"
          class="btn-primary w-full"
          :disabled="store.isUploading || !form.document_type_id || !selectedFile"
        >
          <span v-if="store.isUploading" class="spinner-sm"></span>
          <span v-else>Enviar para revisión</span>
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useSubmissionStore } from '@/stores/submissionStore'
import { useAuthStore } from '@/stores/authStore'

const emit = defineEmits(['submitted'])

const store = useSubmissionStore()
const auth = useAuthStore()

// State
const form = reactive({
  document_type_id: '',
  subject_id: '',
  period_id: '',
})

const fileInput = ref(null)
const selectedFile = ref(null)
const fileError = ref('')
const isDragOver = ref(false)

const apiErrors = ref({})
const blockingError = ref('')

const showToast = ref(false)
const toastMessage = ref('')

// Computed properties
const selectedDocType = computed(() => {
  return store.documentTypes.find((t) => t.id === form.document_type_id)
})

const formatAllowedExtensions = computed(() => {
  const allowed = selectedDocType.value?.allowed_extensions || []
  return allowed.map((ext) => `.${ext.toLowerCase()}`).join(', ')
})

const fileExtension = computed(() => {
  if (!selectedFile.value) return ''
  return selectedFile.value.name.split('.').pop().toLowerCase()
})

const formattedFileSize = computed(() => {
  if (!selectedFile.value) return ''
  const bytes = selectedFile.value.size
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
})

// Methods
onMounted(async () => {
  try {
    await Promise.all([
      store.fetchDocumentTypes(),
      store.fetchPeriods(),
    ])
    
    // Predetermina período activo si existe
    const activePeriod = store.periods.find((p) => p.is_active || p.active)
    if (activePeriod) {
      form.period_id = activePeriod.id
    }

    // Carga las materias basadas en el programa del coordinador logueado
    const programId = auth.user?.program_id || auth.user?.program?.id || null
    await store.fetchSubjects(programId)
  } catch (err) {
    triggerToast('Error al cargar datos iniciales del formulario.')
  }
})

function triggerFileInput() {
  if (!selectedFile.value && fileInput.value) {
    fileInput.value.click()
  }
}

function onFileSelected(event) {
  const files = event.target.files
  if (files.length > 0) {
    handleFileAssignment(files[0])
  }
}

function onDragOver() {
  isDragOver.value = true
}

function onDragLeave() {
  isDragOver.value = false
}

function onDrop(event) {
  isDragOver.value = false
  const files = event.dataTransfer.files
  if (files.length > 0) {
    handleFileAssignment(files[0])
  }
}

function handleFileAssignment(file) {
  selectedFile.value = file
  validateFile(file)
}

function clearSelectedFile() {
  selectedFile.value = null
  fileError.value = ''
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

function onDocTypeChange() {
  // Si cambia el tipo de documento, re-validamos el archivo seleccionado
  if (selectedFile.value) {
    validateFile(selectedFile.value)
  }
}

function validateFile(file) {
  fileError.value = ''
  if (!file) return false

  if (!form.document_type_id) {
    fileError.value = 'Por favor, selecciona primero el tipo de documento.'
    selectedFile.value = null
    return false
  }

  const docType = selectedDocType.value
  if (!docType) return false

  // Validar extensión
  const ext = file.name.split('.').pop().toLowerCase()
  const allowed = docType.allowed_extensions || []
  if (allowed.length > 0 && !allowed.map(e => e.toLowerCase()).includes(ext)) {
    fileError.value = `Extensión no permitida. Formatos admitidos: ${formatAllowedExtensions.value}`
    return false
  }

  // Validar tamaño máximo
  const maxBytes = docType.max_size_mb * 1024 * 1024
  if (file.size > maxBytes) {
    fileError.value = `El archivo supera el tamaño máximo permitido de ${docType.max_size_mb} MB.`
    return false
  }

  return true
}

async function handleSubmit() {
  if (!selectedFile.value) {
    fileError.value = 'El archivo es obligatorio.'
    return
  }

  if (!validateFile(selectedFile.value)) {
    return
  }

  const formData = new FormData()
  formData.append('file', selectedFile.value)
  formData.append('document_type_id', form.document_type_id)
  if (form.subject_id) formData.append('subject_id', form.subject_id)
  if (form.period_id) formData.append('period_id', form.period_id)

  apiErrors.value = {}
  blockingError.value = ''

  try {
    const response = await store.uploadDocument(formData)
    emit('submitted', response)
  } catch (err) {
    const status = err.response?.status
    const data = err.response?.data
    const message = data?.message || 'Error inesperado.'

    if (status === 409) {
      if (data?.error_code === 'ACTIVE_REVIEW' || message.toLowerCase().includes('proceso') || message.toLowerCase().includes('activa')) {
        // 409 "Ya tienes una revisión en proceso" → alert bloqueante
        blockingError.value = message || 'Ya tienes una revisión activa en curso. No puedes subir otro documento hasta que finalice.'
      } else {
        // 409 "Documento duplicado" → mensaje inline bajo archivo
        fileError.value = message || 'Este archivo o contenido ya ha sido cargado en el sistema.'
      }
    } else if (status === 422) {
      // 422 errores del servidor
      apiErrors.value = data.errors || {}
    } else {
      // Otros errores
      triggerToast(message || 'Error al enviar el documento para revisión.')
    }
  }
}

function triggerToast(message) {
  toastMessage.value = message
  showToast.value = true
  setTimeout(() => {
    showToast.value = false
  }, 4000)
}
</script>

<style scoped>
.upload-form-wrapper {
  position: relative;
  width: 100%;
}

.upload-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.form-group label {
  font-size: 0.825rem;
  color: var(--c-text);
  font-weight: 500;
}

.optional-text {
  font-size: 0.75rem;
  color: var(--c-text-muted);
  font-weight: 400;
}

.form-group select {
  background: #f8fafc;
  border: 1px solid var(--c-border);
  border-radius: 10px;
  padding: 0.75rem 0.9rem;
  color: var(--c-text);
  font-size: 0.9rem;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
  width: 100%;
}

.form-group select:focus {
  border-color: var(--c-primary);
  box-shadow: 0 0 0 3px var(--c-primary-pale);
}

.form-group select option {
  background: #ffffff;
  color: var(--c-text);
}

/* Drag & Drop Zone */
.drag-drop-zone {
  border: 2px dashed var(--c-border);
  background: #f8fafc;
  border-radius: 16px;
  padding: 2rem 1.5rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.25s ease;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 160px;
}

.drag-drop-zone:hover {
  border-color: var(--c-primary-mid);
  background: var(--c-primary-pale);
}

.drag-drop-zone.drag-over {
  border-color: var(--c-primary);
  background: var(--c-primary-pale);
  transform: scale(1.01);
}

.drag-drop-zone.has-file {
  border-style: solid;
  border-color: var(--c-primary-mid);
  background: var(--c-primary-pale);
  cursor: default;
}

.drag-drop-zone.has-error {
  border-color: rgba(207, 99, 107, 0.4);
  background: var(--c-danger-pale);
}

.hidden-file-input {
  display: none;
}

.zone-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.6rem;
}

.upload-icon {
  width: 32px;
  height: 32px;
  color: var(--c-text-muted);
  margin-bottom: 0.2rem;
}

.drag-drop-zone:hover .upload-icon {
  color: var(--c-primary);
}

.primary-text {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--c-text);
  margin: 0;
}

.secondary-text {
  font-size: 0.775rem;
  color: var(--c-text-muted);
  margin: 0;
}

/* File Selected State */
.file-preview {
  flex-direction: row !important;
  justify-content: flex-start;
  gap: 1rem !important;
  width: 100%;
  padding: 0 0.5rem;
  text-align: left;
}

.file-icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: var(--c-primary-pale);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.file-icon {
  width: 24px;
  height: 24px;
}

.file-icon.pdf {
  color: var(--c-danger);
}

.file-icon.doc {
  color: var(--c-primary);
}

.file-details {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  min-width: 0;
  flex: 1;
}

.file-details .filename {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--c-text);
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-details .filesize {
  font-size: 0.75rem;
  color: var(--c-text-muted);
  margin: 0;
}

.btn-remove-file {
  background: var(--c-danger-pale);
  border: none;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--c-danger);
  transition: all 0.2s;
  flex-shrink: 0;
}

.btn-remove-file:hover {
  background: rgba(207, 99, 107, 0.2);
  transform: scale(1.05);
}

.btn-remove-file svg {
  width: 13px;
  height: 13px;
}

.field-error {
  font-size: 0.78rem;
  color: var(--c-danger);
  margin-top: 0.1rem;
}

/* Progress bar styles */
.progress-bar-container {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin-top: 0.5rem;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  font-size: 0.775rem;
  color: var(--c-text-muted);
  font-weight: 500;
}

.progress-track {
  height: 6px;
  background: var(--c-border);
  border-radius: 4px;
  overflow: hidden;
  position: relative;
}

.progress-fill {
  height: 100%;
  background: var(--c-primary);
  border-radius: 4px;
  transition: width 0.1s ease;
}

.form-actions {
  margin-top: 0.75rem;
}

.w-full {
  width: 100%;
  justify-content: center;
}

/* Blocking Error Alert */
.blocking-error-alert {
  background: var(--c-danger-pale);
  border: 1px solid rgba(207, 99, 107, 0.25);
  border-radius: 16px;
  padding: 1.25rem 1.5rem;
  color: var(--c-danger);
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.alert-header {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.alert-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.alert-header h4 {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 700;
}

.blocking-error-alert p {
  margin: 0;
  font-size: 0.85rem;
  line-height: 1.5;
  color: var(--c-text-muted);
}

/* Toast Animation & Styling */
.toast-notification {
  position: fixed;
  top: 1.5rem;
  right: 1.5rem;
  background: var(--c-surface);
  border: 1px solid rgba(207, 99, 107, 0.4);
  border-radius: 12px;
  padding: 0.85rem 1.25rem;
  color: var(--c-danger);
  box-shadow: 0 10px 30px rgba(17, 85, 156, 0.15);
  z-index: 2000;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.85rem;
  font-weight: 600;
  max-width: 380px;
}

.toast-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateY(-20px) scale(0.95);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(40px);
}
</style>
