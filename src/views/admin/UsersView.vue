<template>
  <AppLayout>
    <div class="page">
      <!-- Page header -->
      <div class="page-header">
        <div>
          <h1>Usuarios</h1>
          <p class="page-subtitle">Gestión de cuentas del sistema</p>
        </div>
        <button
          v-if="auth.hasPermission('users.create')"
          class="btn-primary"
          @click="openCreate"
          id="btn-create-user"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Nuevo usuario
        </button>
      </div>

      <!-- Search bar -->
      <div class="search-bar">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Buscar por nombre o email..."
          @input="debouncedSearch"
          id="input-search-users"
        />
      </div>

      <!-- Table -->
      <div class="table-card">
        <div v-if="loading" class="table-loading">
          <div class="spinner-lg"></div>
        </div>

        <table v-else class="data-table">
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>Creado</th>
              <th v-if="auth.hasPermission('users.edit') || auth.hasPermission('users.delete')">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="users.length === 0">
              <td colspan="5" class="empty-row">No se encontraron usuarios</td>
            </tr>
            <tr v-for="user in users" :key="user.id">
              <td>
                <div class="user-cell">
                  <div class="user-avatar-sm">{{ initials(user.name) }}</div>
                  <div>
                    <div class="user-name">{{ user.name }}</div>
                    <div class="user-email">{{ user.email }}</div>
                  </div>
                </div>
              </td>
              <td>
                <span class="role-badge">{{ user.role?.name || '—' }}</span>
                <div v-if="user.program" class="program-subtext">{{ user.program.name }}</div>
              </td>
              <td>
                <span :class="['status-badge', user.is_active ? 'active' : 'inactive']">
                  {{ user.is_active ? 'Activo' : 'Inactivo' }}
                </span>
              </td>
              <td class="date-cell">{{ formatDate(user.created_at) }}</td>
              <td v-if="auth.hasPermission('users.edit') || auth.hasPermission('users.delete')">
                <div class="action-btns">
                  <button
                    v-if="auth.hasPermission('users.edit')"
                    class="action-btn edit"
                    @click="openEdit(user)"
                    :title="`Editar ${user.name}`"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                  </button>
                  <button
                    v-if="auth.hasPermission('users.delete')"
                    class="action-btn delete"
                    @click="confirmDelete(user)"
                    :title="`Eliminar ${user.name}`"
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

        <!-- Pagination -->
        <div v-if="pagination.last_page > 1" class="pagination">
          <button
            class="page-btn"
            :disabled="pagination.current_page === 1"
            @click="fetchUsers(pagination.current_page - 1)"
          >← Anterior</button>
          <span class="page-info">
            Página {{ pagination.current_page }} de {{ pagination.last_page }}
          </span>
          <button
            class="page-btn"
            :disabled="pagination.current_page === pagination.last_page"
            @click="fetchUsers(pagination.current_page + 1)"
          >Siguiente →</button>
        </div>
      </div>
    </div>

    <!-- Modal Crear / Editar -->
    <BaseModal v-model="showModal" :title="editingUser ? 'Editar usuario' : 'Nuevo usuario'">
      <form @submit.prevent="saveUser" class="form-grid">
        <div class="form-group">
          <label>Nombre completo</label>
          <input v-model="form.name" type="text" placeholder="Ej: Juan García" required />
          <span v-if="formErrors.name" class="field-error">{{ formErrors.name[0] }}</span>
        </div>

        <div class="form-group">
          <label>Correo electrónico</label>
          <input v-model="form.email" type="email" placeholder="juan@cue.edu.co" required />
          <span v-if="formErrors.email" class="field-error">{{ formErrors.email[0] }}</span>
        </div>

        <div class="form-group">
          <label>{{ editingUser ? 'Nueva contraseña (dejar vacío para no cambiar)' : 'Contraseña' }}</label>
          <input v-model="form.password" type="password" placeholder="••••••••" :required="!editingUser" />
          <span v-if="formErrors.password" class="field-error">{{ formErrors.password[0] }}</span>
        </div>

        <div class="form-group">
          <label>Rol</label>
          <select v-model="form.role_id" required>
            <option value="" disabled>Seleccionar rol</option>
            <option v-for="role in roles" :key="role.id" :value="role.id">{{ role.name }}</option>
          </select>
          <span v-if="formErrors.role_id" class="field-error">{{ formErrors.role_id[0] }}</span>
        </div>

        <div v-if="isCoordinator" class="form-group">
          <label>Programa Académico</label>
          <select v-model="form.program_id" required>
            <option value="" disabled>Seleccionar programa</option>
            <option v-for="prog in programs" :key="prog.id" :value="prog.id">
              {{ prog.name }} ({{ prog.code }})
            </option>
          </select>
          <span v-if="formErrors.program_id" class="field-error">{{ formErrors.program_id[0] }}</span>
        </div>

        <div class="form-group">
          <label class="checkbox-label">
            <input v-model="form.is_active" type="checkbox" />
            <span>Usuario activo</span>
          </label>
        </div>

        <div v-if="formError" class="alert-error">{{ formError }}</div>
      </form>

      <template #footer>
        <button class="btn-ghost" type="button" @click="showModal = false">Cancelar</button>
        <button class="btn-primary" type="button" @click="saveUser" :disabled="saving" id="btn-save-user">
          <span v-if="saving" class="spinner-sm"></span>
          <span v-else>{{ editingUser ? 'Guardar cambios' : 'Crear usuario' }}</span>
        </button>
      </template>
    </BaseModal>

    <!-- Modal Confirmar eliminación -->
    <BaseModal v-model="showDeleteModal" title="Eliminar usuario" width="420px">
      <p class="delete-confirm-text">
        ¿Estás seguro de que deseas eliminar a
        <strong>{{ deletingUser?.name }}</strong>?
        Esta acción no se puede deshacer.
      </p>
      <template #footer>
        <button class="btn-ghost" @click="showDeleteModal = false">Cancelar</button>
        <button class="btn-danger" @click="deleteUser" :disabled="saving" id="btn-confirm-delete">
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
import { usersApi } from '@/api/users'
import { rolesApi } from '@/api/roles'
import { programsApi } from '@/api/programs'

const auth = useAuthStore()

// ── State ──────────────────────────────────────────────────────────────────
const users = ref([])
const roles = ref([])
const programs = ref([])
const loading = ref(false)
const saving = ref(false)
const searchQuery = ref('')
const pagination = ref({ current_page: 1, last_page: 1 })

const showModal = ref(false)
const showDeleteModal = ref(false)
const editingUser = ref(null)
const deletingUser = ref(null)
const formError = ref('')
const formErrors = ref({})

const form = reactive({
  name: '',
  email: '',
  password: '',
  role_id: '',
  program_id: '',
  is_active: true,
})

const isCoordinator = computed(() => {
  const selected = roles.value.find(r => r.id === form.role_id)
  return selected?.name === 'Coordinador'
})

// ── Fetch ──────────────────────────────────────────────────────────────────
async function fetchUsers(page = 1) {
  loading.value = true
  try {
    const res = await usersApi.index({ page, search: searchQuery.value || undefined })
    users.value = res.data.data
    pagination.value = {
      current_page: res.data.meta?.current_page ?? 1,
      last_page: res.data.meta?.last_page ?? 1,
    }
  } catch {
    users.value = []
  } finally {
    loading.value = false
  }
}

async function fetchRoles() {
  try {
    const res = await rolesApi.index()
    roles.value = res.data.data ?? res.data
  } catch {
    roles.value = []
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

// ── Debounce search ────────────────────────────────────────────────────────
let searchTimer = null
function debouncedSearch() {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => fetchUsers(1), 400)
}

// ── Modal helpers ──────────────────────────────────────────────────────────
function resetForm() {
  form.name = ''
  form.email = ''
  form.password = ''
  form.role_id = ''
  form.program_id = ''
  form.is_active = true
  formError.value = ''
  formErrors.value = {}
}

function openCreate() {
  editingUser.value = null
  resetForm()
  showModal.value = true
}

function openEdit(user) {
  editingUser.value = user
  form.name = user.name
  form.email = user.email
  form.password = ''
  form.role_id = user.role?.id || ''
  form.program_id = user.program?.id || ''
  form.is_active = user.is_active
  formError.value = ''
  formErrors.value = {}
  showModal.value = true
}

function confirmDelete(user) {
  deletingUser.value = user
  showDeleteModal.value = true
}

// ── CRUD ───────────────────────────────────────────────────────────────────
async function saveUser() {
  saving.value = true
  formError.value = ''
  formErrors.value = {}
  try {
    const payload = { ...form }
    if (!isCoordinator.value) {
      payload.program_id = null
    } else if (!payload.program_id) {
      payload.program_id = null
    }

    if (editingUser.value) {
      if (!payload.password) delete payload.password
      await usersApi.update(editingUser.value.id, payload)
    } else {
      await usersApi.store(payload)
    }
    showModal.value = false
    fetchUsers(pagination.value.current_page)
  } catch (err) {
    const data = err.response?.data
    formError.value = data?.message || 'Error al guardar el usuario'
    if (data?.errors) formErrors.value = data.errors
  } finally {
    saving.value = false
  }
}

async function deleteUser() {
  saving.value = true
  try {
    await usersApi.destroy(deletingUser.value.id)
    showDeleteModal.value = false
    fetchUsers(pagination.value.current_page)
  } catch (err) {
    formError.value = err.response?.data?.message || 'Error al eliminar'
  } finally {
    saving.value = false
  }
}

// ── Utils ──────────────────────────────────────────────────────────────────
function initials(name) {
  return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??'
}

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
}

onMounted(() => {
  fetchUsers()
  fetchRoles()
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

.page-header h1 { font-size: 1.75rem; font-weight: 800; color: white; margin-bottom: 0.2rem; }
.page-subtitle { color: rgba(255,255,255,0.4); font-size: 0.875rem; margin: 0; }

/* Search */
.search-bar {
  position: relative;
  margin-bottom: 1rem;
}

.search-bar svg {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  color: rgba(255,255,255,0.3);
}

.search-bar input {
  width: 100%;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 12px;
  padding: 0.75rem 1rem 0.75rem 2.75rem;
  color: white;
  font-size: 0.9rem;
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.2s;
}

.search-bar input:focus { border-color: #667eea; }
.search-bar input::placeholder { color: rgba(255,255,255,0.2); }

/* Table */
.table-card {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
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
  color: rgba(255,255,255,0.35);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}

.data-table td {
  padding: 1rem 1.25rem;
  color: rgba(255,255,255,0.75);
  border-bottom: 1px solid rgba(255,255,255,0.04);
}

.data-table tr:last-child td { border-bottom: none; }
.data-table tr:hover td { background: rgba(255,255,255,0.02); }

.empty-row { text-align: center; color: rgba(255,255,255,0.2); padding: 3rem !important; }

.user-cell { display: flex; align-items: center; gap: 0.75rem; }

.user-avatar-sm {
  width: 36px; height: 36px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.75rem; font-weight: 700; color: white; flex-shrink: 0;
}

.user-name { font-weight: 600; color: white; font-size: 0.875rem; }
.user-email { font-size: 0.775rem; color: rgba(255,255,255,0.35); }
.date-cell { font-size: 0.8rem; color: rgba(255,255,255,0.35); }

.role-badge {
  background: rgba(102,126,234,0.12);
  border: 1px solid rgba(102,126,234,0.2);
  color: #a78bfa;
  padding: 0.2rem 0.6rem;
  border-radius: 20px;
  font-size: 0.775rem;
  font-weight: 500;
}

.status-badge {
  padding: 0.2rem 0.6rem;
  border-radius: 20px;
  font-size: 0.775rem;
  font-weight: 600;
}

.status-badge.active { background: rgba(74,222,128,0.12); color: #4ade80; border: 1px solid rgba(74,222,128,0.25); }
.status-badge.inactive { background: rgba(248,113,113,0.12); color: #f87171; border: 1px solid rgba(248,113,113,0.25); }

.action-btns { display: flex; gap: 0.4rem; }

.action-btn {
  width: 32px; height: 32px;
  border: none; border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: all 0.15s;
}

.action-btn svg { width: 14px; height: 14px; }
.action-btn.edit { background: rgba(102,126,234,0.12); color: #a78bfa; }
.action-btn.edit:hover { background: rgba(102,126,234,0.25); }
.action-btn.delete { background: rgba(248,113,113,0.1); color: #f87171; }
.action-btn.delete:hover { background: rgba(248,113,113,0.2); }

/* Pagination */
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 1rem;
  border-top: 1px solid rgba(255,255,255,0.06);
}

.page-btn {
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.1);
  color: rgba(255,255,255,0.7);
  padding: 0.4rem 1rem;
  border-radius: 8px;
  font-size: 0.825rem;
  cursor: pointer;
  transition: all 0.15s;
}

.page-btn:hover:not(:disabled) { background: rgba(255,255,255,0.12); }
.page-btn:disabled { opacity: 0.3; cursor: not-allowed; }
.page-info { font-size: 0.825rem; color: rgba(255,255,255,0.35); }

/* Form */
.form-grid { display: flex; flex-direction: column; gap: 1rem; }

.form-group { display: flex; flex-direction: column; gap: 0.4rem; }
.form-group label { font-size: 0.825rem; color: rgba(255,255,255,0.6); font-weight: 500; }

.form-group input[type="text"],
.form-group input[type="email"],
.form-group input[type="password"],
.form-group select {
  background: rgba(255,255,255,0.07);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 10px;
  padding: 0.7rem 0.9rem;
  color: white;
  font-size: 0.9rem;
  outline: none;
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group select:focus { border-color: #667eea; }

.form-group select option { background: #1a1535; }

.checkbox-label {
  display: flex !important;
  flex-direction: row !important;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.field-error { font-size: 0.78rem; color: #f87171; }

.alert-error {
  background: rgba(248,113,113,0.1);
  border: 1px solid rgba(248,113,113,0.3);
  border-radius: 8px;
  padding: 0.7rem 1rem;
  color: #f87171;
  font-size: 0.85rem;
}

.delete-confirm-text { color: rgba(255,255,255,0.7); font-size: 0.9rem; line-height: 1.6; margin: 0; }
.delete-confirm-text strong { color: white; }

/* Buttons */
.btn-primary {
  display: flex; align-items: center; gap: 0.4rem;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white; border: none; border-radius: 10px;
  padding: 0.65rem 1.25rem; font-size: 0.875rem; font-weight: 600;
  cursor: pointer; transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(102,126,234,0.35);
  white-space: nowrap;
}

.btn-primary:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 16px rgba(102,126,234,0.45); }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-primary svg { width: 16px; height: 16px; }

.btn-ghost {
  background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12);
  color: rgba(255,255,255,0.7); border-radius: 10px;
  padding: 0.65rem 1.25rem; font-size: 0.875rem; font-weight: 500;
  cursor: pointer; transition: all 0.15s;
}

.btn-ghost:hover { background: rgba(255,255,255,0.1); }

.btn-danger {
  background: rgba(248,113,113,0.15); border: 1px solid rgba(248,113,113,0.3);
  color: #f87171; border-radius: 10px;
  padding: 0.65rem 1.25rem; font-size: 0.875rem; font-weight: 600;
  cursor: pointer; transition: all 0.15s; display: flex; align-items: center; gap: 0.4rem;
}

.btn-danger:hover:not(:disabled) { background: rgba(248,113,113,0.25); }
.btn-danger:disabled { opacity: 0.6; cursor: not-allowed; }

/* Spinners */
.spinner-lg {
  width: 36px; height: 36px;
  border: 3px solid rgba(255,255,255,0.1);
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

.spinner-sm {
  display: inline-block;
  width: 14px; height: 14px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.program-subtext {
  font-size: 0.725rem;
  color: rgba(167, 139, 250, 0.75);
  margin-top: 0.25rem;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 160px;
}
</style>
