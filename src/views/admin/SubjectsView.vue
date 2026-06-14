<template>
  <AppLayout>
    <div class="page">
      <!-- Page header -->
      <div class="page-header">
        <div>
          <h1>Asignaturas</h1>
          <p class="page-subtitle">Gestión de asignaturas y planes de estudio</p>
        </div>
        <button
          v-if="auth.hasPermission('subjects.create')"
          class="btn-primary"
          @click="openCreate"
          id="btn-create-subject"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Nueva materia
        </button>
      </div>

      <!-- Filters & Search -->
      <div class="filters-row">
        <!-- Search bar -->
        <div class="search-bar">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Buscar por nombre o código..."
            id="input-search-subjects"
          />
        </div>

        <!-- Program Filter -->
        <div class="filter-select">
          <select v-model="selectedProgram" @change="fetchSubjects" id="select-filter-program">
            <option value="">Todos los programas</option>
            <option v-for="prog in programs" :key="prog.id" :value="prog.id">
              {{ prog.name }}
            </option>
          </select>
        </div>
      </div>

      <!-- Table -->
      <div class="table-card">
        <div v-if="loading" class="table-loading">
          <div class="spinner-lg"></div>
        </div>

        <table v-else class="data-table">
          <thead>
            <tr>
              <th>Código</th>
              <th>Nombre</th>
              <th>Créditos</th>
              <th>Semestre</th>
              <th>Programa Académico</th>
              <th>Plan de Estudios</th>
              <th v-if="auth.hasPermission('subjects.update') || auth.hasPermission('subjects.delete')">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="filteredSubjects.length === 0">
              <td colspan="7" class="empty-row">No se encontraron asignaturas</td>
            </tr>
            <tr v-for="subject in filteredSubjects" :key="subject.id">
              <td class="code-cell">{{ subject.code }}</td>
              <td>
                <div class="subject-name">{{ subject.name }}</div>
              </td>
              <td>{{ subject.credits }}</td>
              <td>Semestre {{ subject.semester }}</td>
              <td>
                <span class="program-badge">{{ subject.program?.name || '—' }}</span>
              </td>
              <td>
                <a
                  v-if="subject.curriculum"
                  :href="getCurriculumUrl(subject.curriculum.url)"
                  target="_blank"
                  class="curriculum-link"
                  title="Descargar Plan de Estudios"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="curriculum-icon">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                    <polyline points="10 9 9 9 8 9"/>
                  </svg>
                  <span>Ver archivo</span>
                </a>
                <span v-else class="no-curriculum">Sin currículo</span>
              </td>
              <td v-if="auth.hasPermission('subjects.update') || auth.hasPermission('subjects.delete')">
                <div class="action-btns">
                  <button
                    v-if="auth.hasPermission('subjects.update')"
                    class="action-btn edit"
                    @click="openEdit(subject)"
                    :title="`Editar ${subject.name}`"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                  </button>
                  <button
                    v-if="auth.hasPermission('subjects.delete')"
                    class="action-btn delete"
                    @click="confirmDelete(subject)"
                    :title="`Eliminar ${subject.name}`"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Crear / Editar -->
    <BaseModal v-model="showModal" :title="editingSubject ? 'Editar materia' : 'Nueva materia'">
      <form @submit.prevent="saveSubject" class="form-grid">
        <div class="form-group">
          <label>Código de la materia</label>
          <input v-model="form.code" type="text" placeholder="Ej: MAT-101" required />
          <span v-if="formErrors.code" class="field-error">{{ formErrors.code[0] }}</span>
        </div>

        <div class="form-group">
          <label>Nombre de la materia</label>
          <input v-model="form.name" type="text" placeholder="Ej: Matemáticas I" required />
          <span v-if="formErrors.name" class="field-error">{{ formErrors.name[0] }}</span>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Créditos</label>
            <input v-model.number="form.credits" type="number" min="1" max="20" required />
            <span v-if="formErrors.credits" class="field-error">{{ formErrors.credits[0] }}</span>
          </div>

          <div class="form-group">
            <label>Semestre</label>
            <input v-model.number="form.semester" type="number" min="1" max="12" required />
            <span v-if="formErrors.semester" class="field-error">{{ formErrors.semester[0] }}</span>
          </div>
        </div>

        <div class="form-group">
          <label>Programa Académico</label>
          <select v-model="form.program_id" required>
            <option value="" disabled>Seleccionar programa</option>
            <option v-for="prog in programs" :key="prog.id" :value="prog.id">
              {{ prog.name }}
            </option>
          </select>
          <span v-if="formErrors.program_id" class="field-error">{{ formErrors.program_id[0] }}</span>
        </div>

        <div class="form-group">
          <label>Currículo / Plan de Estudios (PDF, DOC, DOCX - Max 10MB)</label>
          <div class="file-upload-wrapper">
            <input type="file" @change="handleFileChange" accept=".pdf,.doc,.docx" id="file-curriculum" />
            <div class="file-upload-info" v-if="form.curriculum">
              <span>Archivo seleccionado: {{ form.curriculum.name }}</span>
            </div>
            <div class="file-upload-info current-file" v-else-if="editingSubject?.curriculum">
              <span>Archivo actual: {{ editingSubject.curriculum.original_filename }}</span>
            </div>
          </div>
          <span v-if="formErrors.curriculum" class="field-error">{{ formErrors.curriculum[0] }}</span>
        </div>

        <div v-if="formError" class="alert-error">{{ formError }}</div>
      </form>

      <template #footer>
        <button class="btn-ghost" type="button" @click="showModal = false">Cancelar</button>
        <button class="btn-primary" type="button" @click="saveSubject" :disabled="saving" id="btn-save-subject">
          <span v-if="saving" class="spinner-sm"></span>
          <span v-else>{{ editingSubject ? 'Guardar cambios' : 'Crear materia' }}</span>
        </button>
      </template>
    </BaseModal>

    <!-- Modal Confirmar eliminación -->
    <BaseModal v-model="showDeleteModal" title="Eliminar materia" width="420px">
      <p class="delete-confirm-text">
        ¿Estás seguro de que deseas eliminar la materia
        <strong>{{ deletingSubject?.name }}</strong>?
        Esta acción no se puede deshacer.
      </p>
      <template #footer>
        <button class="btn-ghost" @click="showDeleteModal = false">Cancelar</button>
        <button class="btn-danger" @click="deleteSubject" :disabled="saving" id="btn-confirm-delete-subject">
          <span v-if="saving" class="spinner-sm"></span>
          <span v-else>Sí, eliminar</span>
        </button>
      </template>
    </BaseModal>
  </AppLayout>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import AppLayout from '@/layouts/AppLayout.vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import { useAuthStore } from '@/stores/authStore'
import { subjectsApi } from '@/api/subjects'
import { programsApi } from '@/api/programs'

const auth = useAuthStore()

// ── State ──────────────────────────────────────────────────────────────────
const subjects = ref([])
const programs = ref([])
const loading = ref(false)
const saving = ref(false)
const searchQuery = ref('')
const selectedProgram = ref('')

const showModal = ref(false)
const showDeleteModal = ref(false)
const editingSubject = ref(null)
const deletingSubject = ref(null)
const formError = ref('')
const formErrors = ref({})

const form = reactive({
  code: '',
  name: '',
  credits: 1,
  semester: 1,
  program_id: '',
  curriculum: null,
})

// ── Computed / Filtered Subjects ──────────────────────────────────────────
const filteredSubjects = computed(() => {
  if (!searchQuery.value) return subjects.value
  const query = searchQuery.value.toLowerCase()
  return subjects.value.filter(s =>
    s.name.toLowerCase().includes(query) ||
    s.code.toLowerCase().includes(query)
  )
})

// ── Fetch ──────────────────────────────────────────────────────────────────
async function fetchSubjects() {
  loading.value = true
  try {
    const params = {}
    if (selectedProgram.value) {
      params.program_id = selectedProgram.value
    }
    const res = await subjectsApi.index(params)
    subjects.value = res.data.data
  } catch (err) {
    subjects.value = []
  } finally {
    loading.value = false
  }
}

async function fetchPrograms() {
  try {
    const res = await programsApi.index()
    programs.value = res.data.data ?? res.data
  } catch {
    programs.value = []
  }
}

// ── File Change Handler ────────────────────────────────────────────────────
function handleFileChange(event) {
  const file = event.target.files[0]
  if (file) {
    form.curriculum = file
  } else {
    form.curriculum = null
  }
}

// ── Curriculum URL Builder ─────────────────────────────────────────────────
function getCurriculumUrl(urlPath) {
  if (!urlPath) return '#'
  if (urlPath.startsWith('http')) return urlPath
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
  return `${baseUrl}${urlPath}`
}

// ── Modal Helpers ──────────────────────────────────────────────────────────
function resetForm() {
  form.code = ''
  form.name = ''
  form.credits = 1
  form.semester = 1
  form.program_id = ''
  form.curriculum = null
  formError.value = ''
  formErrors.value = {}
  
  // Reset file input element if found
  const fileInput = document.getElementById('file-curriculum')
  if (fileInput) fileInput.value = ''
}

function openCreate() {
  editingSubject.value = null
  resetForm()
  showModal.value = true
}

function openEdit(subject) {
  editingSubject.value = subject
  form.code = subject.code
  form.name = subject.name
  form.credits = subject.credits
  form.semester = subject.semester
  form.program_id = subject.program_id
  form.curriculum = null
  formError.value = ''
  formErrors.value = {}
  showModal.value = true
}

function confirmDelete(subject) {
  deletingSubject.value = subject
  showDeleteModal.value = true
}

// ── CRUD Actions ───────────────────────────────────────────────────────────
async function saveSubject() {
  saving.value = true
  formError.value = ''
  formErrors.value = {}
  
  try {
    const formData = new FormData()
    formData.append('code', form.code)
    formData.append('name', form.name)
    formData.append('credits', form.credits)
    formData.append('semester', form.semester)
    formData.append('program_id', form.program_id)
    
    if (form.curriculum) {
      formData.append('curriculum', form.curriculum)
    }

    if (editingSubject.value) {
      // Laravel update trick for multipart/form-data
      formData.append('_method', 'PUT')
      await subjectsApi.update(editingSubject.value.id, formData)
    } else {
      await subjectsApi.store(formData)
    }
    
    showModal.value = false
    fetchSubjects()
  } catch (err) {
    const data = err.response?.data
    formError.value = data?.message || 'Error al guardar la materia'
    if (data?.errors) formErrors.value = data.errors
  } finally {
    saving.value = false
  }
}

async function deleteSubject() {
  saving.value = true
  try {
    await subjectsApi.destroy(deletingSubject.value.id)
    showDeleteModal.value = false
    fetchSubjects()
  } catch (err) {
    formError.value = err.response?.data?.message || 'Error al eliminar la materia'
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  fetchSubjects()
  fetchPrograms()
})
</script>

<style scoped>
.page { padding: 2rem; max-width: 1200px; }

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  gap: 1rem;
}

.page-header h1 { font-size: 1.75rem; font-weight: 800; color: var(--c-text); margin-bottom: 0.2rem; }
.page-subtitle { color: var(--c-text-muted); font-size: 0.875rem; margin: 0; }

/* Filters & Search Row */
.filters-row {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  align-items: center;
}

.search-bar {
  position: relative;
  flex: 1;
}

.search-bar svg {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  color: var(--c-text-muted);
}

.search-bar input {
  width: 100%;
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: 12px;
  padding: 0.75rem 1rem 0.75rem 2.75rem;
  color: var(--c-text);
  font-size: 0.9rem;
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.2s;
}

.search-bar input:focus { border-color: var(--c-primary); box-shadow: 0 0 0 3px var(--c-primary-pale); }
.search-bar input::placeholder { color: #94a3b8; }

.filter-select select {
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: 12px;
  padding: 0.75rem 1rem;
  color: var(--c-text);
  font-size: 0.9rem;
  outline: none;
  min-width: 200px;
  cursor: pointer;
  transition: border-color 0.2s;
}

.filter-select select:focus { border-color: var(--c-primary); }

/* Table */
.table-card {
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: 16px;
  overflow: hidden;
}

.table-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4rem;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.data-table th {
  text-align: left;
  padding: 0.875rem 1.25rem;
  color: var(--c-text-muted);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
  border-bottom: 1px solid var(--c-border);
  background: #f8fafc;
}

.data-table td {
  padding: 1rem 1.25rem;
  color: var(--c-text);
  border-bottom: 1px solid var(--c-border);
}

.data-table tr:last-child td { border-bottom: none; }
.data-table tr:hover td { background: #f8fafc; }

.empty-row { text-align: center; color: var(--c-text-faint); padding: 3rem !important; }

.code-cell {
  font-weight: 700;
  font-family: monospace;
  color: var(--c-text-muted);
  font-size: 0.9rem;
}

.subject-name { font-weight: 600; color: var(--c-text); font-size: 0.875rem; }

.program-badge {
  background: var(--c-primary-pale);
  border: 1px solid var(--c-primary-mid);
  color: var(--c-primary);
  padding: 0.2rem 0.6rem;
  border-radius: 20px;
  font-size: 0.775rem;
  font-weight: 500;
  display: inline-block;
  max-width: 220px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.curriculum-link {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  color: var(--c-primary);
  text-decoration: none;
  font-weight: 500;
  font-size: 0.825rem;
}

.curriculum-link:hover {
  text-decoration: underline;
}

.curriculum-icon {
  width: 16px;
  height: 16px;
}

.no-curriculum {
  color: var(--c-text-faint);
  font-style: italic;
  font-size: 0.825rem;
}

.action-btns { display: flex; gap: 0.4rem; }

.action-btn {
  width: 32px; height: 32px;
  border: none; border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: all 0.15s;
}

.action-btn svg { width: 14px; height: 14px; }
.action-btn.edit   { background: var(--c-primary-pale); color: var(--c-primary); }
.action-btn.edit:hover   { background: var(--c-primary-mid); }
.action-btn.delete { background: var(--c-danger-pale); color: var(--c-danger); }
.action-btn.delete:hover { background: rgba(207,99,107,0.2); }

/* Form */
.form-grid { display: flex; flex-direction: column; gap: 1rem; }

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-group { display: flex; flex-direction: column; gap: 0.4rem; }
.form-group label { font-size: 0.825rem; color: var(--c-text); font-weight: 500; }

.form-group input[type="text"],
.form-group input[type="number"],
.form-group select {
  background: #f8fafc;
  border: 1px solid var(--c-border);
  border-radius: 10px;
  padding: 0.7rem 0.9rem;
  color: var(--c-text);
  font-size: 0.9rem;
  outline: none;
  transition: border-color 0.2s;
  width: 100%;
  box-sizing: border-box;
}

.form-group input:focus,
.form-group select:focus { border-color: var(--c-primary); box-shadow: 0 0 0 3px var(--c-primary-pale); }

.file-upload-wrapper {
  border: 2px dashed var(--c-border);
  padding: 1rem;
  border-radius: 10px;
  background: #f8fafc;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.file-upload-wrapper input[type="file"] {
  font-size: 0.85rem;
}

.file-upload-info {
  font-size: 0.8rem;
  color: var(--c-text-muted);
}

.current-file {
  color: var(--c-primary);
  font-weight: 500;
}

.field-error { font-size: 0.78rem; color: var(--c-danger); }

.alert-error {
  background: var(--c-danger-pale);
  border: 1px solid rgba(207,99,107,0.3);
  border-radius: 8px;
  padding: 0.7rem 1rem;
  color: var(--c-danger);
  font-size: 0.85rem;
}

.delete-confirm-text { color: var(--c-text); font-size: 0.9rem; line-height: 1.6; margin: 0; }
.delete-confirm-text strong { color: var(--c-text); font-weight: 700; }

/* Buttons */
.btn-primary {
  display: inline-flex; align-items: center; gap: 0.4rem;
  background: var(--c-primary);
  color: white; border: none; border-radius: 10px;
  padding: 0.65rem 1.25rem; font-size: 0.875rem; font-weight: 600;
  cursor: pointer; transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(17,85,156,0.25);
  white-space: nowrap;
}

.btn-primary:hover:not(:disabled) { transform: translateY(-1px); background: #0e4a88; }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-primary svg { width: 16px; height: 16px; }

.btn-ghost {
  background: var(--c-surface); border: 1px solid var(--c-border);
  color: var(--c-text-muted); border-radius: 10px;
  padding: 0.65rem 1.25rem; font-size: 0.875rem; font-weight: 500;
  cursor: pointer; transition: all 0.15s;
}

.btn-ghost:hover { background: var(--c-primary-pale); color: var(--c-primary); }

.btn-danger {
  background: var(--c-danger-pale); border: 1px solid rgba(207,99,107,0.3);
  color: var(--c-danger); border-radius: 10px;
  padding: 0.65rem 1.25rem; font-size: 0.875rem; font-weight: 600;
  cursor: pointer; transition: all 0.15s; display: flex; align-items: center; gap: 0.4rem;
}

.btn-danger:hover:not(:disabled) { background: rgba(207,99,107,0.2); }
.btn-danger:disabled { opacity: 0.6; cursor: not-allowed; }

/* Spinners */
.spinner-lg {
  width: 36px; height: 36px;
  border: 3px solid var(--c-border);
  border-top-color: var(--c-primary);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

.spinner-sm {
  display: inline-block;
  width: 14px; height: 14px;
  border: 2px solid rgba(255,255,255,0.4);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }
</style>
