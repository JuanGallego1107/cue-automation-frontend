<template>
  <AppLayout>
    <div class="page">
      <!-- Page Header -->
      <div class="page-header">
        <div>
          <h1>Roles y Permisos</h1>
          <p class="page-subtitle">Configuración de perfiles y control de acceso del sistema</p>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="loading-container">
        <div class="spinner-lg"></div>
      </div>

      <!-- Roles Grid -->
      <div v-else class="roles-grid">
        <div v-for="role in roles" :key="role.id" class="role-card">
          <div class="role-card-header">
            <div class="role-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
            <div>
              <h3>{{ role.name }}</h3>
              <span class="permission-count-badge">
                {{ role.permissions?.length || 0 }} permisos
              </span>
            </div>
          </div>

          <p class="role-description">{{ role.description || 'Sin descripción disponible.' }}</p>

          <!-- Permissions list inside card -->
          <div class="card-permissions">
            <div class="card-permissions-title">Permisos activos:</div>
            <div v-if="role.permissions?.length === 0" class="no-permissions">
              Ninguno asignado. El rol no tiene acceso a funciones protegidas.
            </div>
            <div v-else class="permission-tags-container">
              <span 
                v-for="perm in role.permissions" 
                :key="perm.id" 
                class="permission-tag"
                :title="perm.description"
              >
                {{ getFriendlyLabel(perm.name) }}
              </span>
            </div>
          </div>

          <!-- Card actions -->
          <div class="card-footer">
            <button
              v-if="auth.hasPermission('roles.manage')"
              class="btn-manage-permissions"
              @click="openSyncPermissions(role)"
              :id="`btn-manage-role-${role.id}`"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              Gestionar Permisos
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Sync Permissions Modal -->
    <BaseModal 
      v-model="showModal" 
      :title="`Gestionar Permisos: ${selectedRole?.name}`"
      width="640px"
    >
      <div class="modal-info-banner">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
        </svg>
        <p>Los cambios en los permisos se aplicarán inmediatamente a todos los usuarios con este rol asignado.</p>
      </div>

      <div class="permissions-manager-body">
        <div v-if="Object.keys(groupedPermissions).length === 0" class="no-available-permissions">
          No hay permisos disponibles en el sistema.
        </div>

        <div 
          v-else 
          v-for="(perms, groupName) in groupedPermissions" 
          :key="groupName" 
          class="permission-group-section"
        >
          <h4 class="group-title">{{ groupName }}</h4>
          <div class="permission-items-grid">
            <div 
              v-for="perm in perms" 
              :key="perm.id" 
              class="permission-item-card"
              :class="{ selected: formPermissions.includes(perm.id) }"
              @click="togglePermission(perm.id)"
            >
              <div class="permission-item-details">
                <span class="permission-label">{{ perm.label }}</span>
                <span class="permission-technical-name">{{ perm.name }}</span>
                <p class="permission-desc">{{ perm.description }}</p>
              </div>
              <div class="permission-checkbox-wrapper">
                <div class="custom-switch">
                  <input 
                    type="checkbox" 
                    :checked="formPermissions.includes(perm.id)"
                    @click.stop="togglePermission(perm.id)"
                  />
                  <span class="switch-slider"></span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Global error notification -->
        <div v-if="modalError" class="alert-error mt-4">{{ modalError }}</div>
      </div>

      <template #footer>
        <button class="btn-ghost" @click="showModal = false">Cancelar</button>
        <button 
          class="btn-primary" 
          @click="savePermissions" 
          :disabled="saving"
          id="btn-save-role-permissions"
        >
          <span v-if="saving" class="spinner-sm"></span>
          <span v-else>Guardar cambios</span>
        </button>
      </template>
    </BaseModal>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import AppLayout from '@/layouts/AppLayout.vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import { useAuthStore } from '@/stores/authStore'
import { rolesApi } from '@/api/roles'

const auth = useAuthStore()

// ── State ──────────────────────────────────────────────────────────────────
const roles = ref([])
const loading = ref(false)
const saving = ref(false)
const showModal = ref(false)
const selectedRole = ref(null)
const formPermissions = ref([])
const modalError = ref('')

// Predefined meta translations for system permissions
const permissionMeta = {
  'users.view': { label: 'Ver Usuarios', group: 'Usuarios' },
  'users.create': { label: 'Crear Usuarios', group: 'Usuarios' },
  'users.update': { label: 'Actualizar Usuarios', group: 'Usuarios' },
  'users.delete': { label: 'Desactivar Usuarios', group: 'Usuarios' },
  'roles.manage': { label: 'Administrar Seguridad', group: 'Seguridad' },
  'subjects.view': { label: 'Ver Asignaturas', group: 'Asignaturas' },
  'subjects.create': { label: 'Crear Asignaturas', group: 'Asignaturas' },
  'subjects.update': { label: 'Actualizar Asignaturas', group: 'Asignaturas' },
  'subjects.delete': { label: 'Desactivar Asignaturas', group: 'Asignaturas' },
}

// ── Fetch ──────────────────────────────────────────────────────────────────
async function fetchRoles() {
  loading.value = true
  try {
    const res = await rolesApi.index()
    roles.value = res.data.data ?? res.data
  } catch (err) {
    roles.value = []
  } finally {
    loading.value = false
  }
}

// ── Permission Grouping & Translation Helpers ─────────────────────────────
function getFriendlyLabel(name) {
  return permissionMeta[name]?.label || name
}

const groupedPermissions = computed(() => {
  const groups = {
    'Usuarios': [],
    'Seguridad': [],
    'Otros': []
  }

  // Build a unique map of permissions dynamically from the payload
  const map = new Map()
  roles.value.forEach(role => {
    if (role.permissions) {
      role.permissions.forEach(perm => {
        map.set(perm.name, {
          id: perm.id,
          name: perm.name,
          description: perm.description
        })
      })
    }
  })

  // Group permissions and inject beautiful metadata
  map.forEach((perm) => {
    const meta = permissionMeta[perm.name] || { label: perm.name, group: 'Otros' }
    groups[meta.group].push({
      ...perm,
      label: meta.label,
    })
  })

  // Filter out any empty groups
  return Object.keys(groups).reduce((acc, key) => {
    if (groups[key].length > 0) acc[key] = groups[key]
    return acc
  }, {})
})

// ── Actions ────────────────────────────────────────────────────────────────
function openSyncPermissions(role) {
  selectedRole.value = role
  formPermissions.value = role.permissions ? role.permissions.map(p => p.id) : []
  modalError.value = ''
  showModal.value = true
}

function togglePermission(id) {
  const index = formPermissions.value.indexOf(id)
  if (index === -1) {
    formPermissions.value.push(id)
  } else {
    formPermissions.value.splice(index, 1)
  }
}

async function savePermissions() {
  saving.value = true
  modalError.value = ''
  try {
    const res = await rolesApi.syncPermissions(selectedRole.value.id, formPermissions.value)
    
    // Update local role data with response
    const updatedRole = res.data.data ?? res.data
    const index = roles.value.findIndex(r => r.id === updatedRole.id)
    if (index !== -1) {
      roles.value[index] = updatedRole
    }
    
    // If the logged in user belongs to this role, update their cached credentials!
    if (auth.user?.role?.id === selectedRole.value.id) {
      auth.user.role.permissions = updatedRole.permissions
    }
    
    showModal.value = false
  } catch (err) {
    modalError.value = err.response?.data?.message || 'Error al actualizar los permisos del rol.'
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  fetchRoles()
})
</script>

<style scoped>
.page { padding: 2rem; max-width: 1200px; margin: 0 auto; }

.page-header {
  margin-bottom: 2rem;
}

.page-header h1 { font-size: 1.75rem; font-weight: 800; color: var(--c-text); margin-bottom: 0.2rem; }
.page-subtitle { color: var(--c-text-muted); font-size: 0.875rem; margin: 0; }

.loading-container {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8rem 0;
}

/* Roles Grid */
.roles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 1.5rem;
}

.role-card {
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: 20px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  transition: transform 0.25s, border-color 0.25s, box-shadow 0.25s;
}

.role-card:hover {
  transform: translateY(-2px);
  border-color: var(--c-primary-mid);
  box-shadow: 0 10px 30px rgba(17, 85, 156, 0.1);
}

.role-card-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.role-icon {
  width: 44px;
  height: 44px;
  background: var(--c-primary-pale);
  border: 1px solid var(--c-primary-mid);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--c-primary);
  flex-shrink: 0;
}

.role-icon svg { width: 22px; height: 22px; }

.role-card-header h3 { font-size: 1.15rem; font-weight: 700; color: var(--c-text); margin: 0; }

.permission-count-badge {
  font-size: 0.725rem;
  color: var(--c-primary);
  background: var(--c-primary-pale);
  padding: 0.15rem 0.5rem;
  border-radius: 10px;
  font-weight: 600;
  display: inline-block;
  margin-top: 0.15rem;
  border: 1px solid var(--c-primary-mid);
}

.role-description {
  font-size: 0.85rem;
  color: var(--c-text-muted);
  line-height: 1.5;
  margin: 0 0 1.25rem 0;
  min-height: 2.7rem;
}

.card-permissions {
  border-top: 1px solid var(--c-border);
  padding-top: 1rem;
  margin-bottom: 1.5rem;
  flex: 1;
}

.card-permissions-title {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--c-text-muted);
  font-weight: 600;
  margin-bottom: 0.75rem;
}

.no-permissions {
  font-size: 0.775rem;
  color: var(--c-danger);
  font-style: italic;
  line-height: 1.4;
}

.permission-tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.permission-tag {
  font-size: 0.725rem;
  background: #f8fafc;
  border: 1px solid var(--c-border);
  color: var(--c-text-muted);
  padding: 0.25rem 0.5rem;
  border-radius: 8px;
  cursor: help;
  transition: all 0.15s;
}

.permission-tag:hover {
  background: var(--c-primary-pale);
  color: var(--c-primary);
  border-color: var(--c-primary-mid);
}

.card-footer {
  border-top: 1px solid var(--c-border);
  padding-top: 1rem;
}

.btn-manage-permissions {
  width: 100%;
  background: var(--c-primary-pale);
  border: 1px solid var(--c-primary-mid);
  border-radius: 12px;
  color: var(--c-primary);
  padding: 0.6rem;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.2s;
}

.btn-manage-permissions:hover {
  background: var(--c-primary);
  border-color: var(--c-primary);
  color: white;
}

.btn-manage-permissions svg { width: 14px; height: 14px; }

/* Sync Permissions Modal components */
.modal-info-banner {
  background: var(--c-primary-pale);
  border: 1px solid var(--c-primary-mid);
  border-radius: 12px;
  padding: 0.75rem 1rem;
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.modal-info-banner svg {
  width: 18px;
  height: 18px;
  color: var(--c-primary);
  flex-shrink: 0;
  margin-top: 1px;
}

.modal-info-banner p {
  margin: 0;
  font-size: 0.8rem;
  color: var(--c-text);
  line-height: 1.4;
}

.permissions-manager-body {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-height: 55vh;
  overflow-y: auto;
  padding-right: 0.5rem;
}

.no-available-permissions {
  text-align: center;
  color: var(--c-text-faint);
  padding: 2rem 0;
}

.permission-group-section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.group-title {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: var(--c-text-muted);
  font-weight: 700;
  border-bottom: 1px solid var(--c-border);
  padding-bottom: 0.4rem;
  margin: 0;
}

.permission-items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 0.75rem;
}

.permission-item-card {
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: 12px;
  padding: 0.85rem 1rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  cursor: pointer;
  transition: all 0.2s;
  user-select: none;
}

.permission-item-card:hover {
  background: #f8fafc;
  border-color: var(--c-primary-mid);
}

.permission-item-card.selected {
  background: var(--c-primary-pale);
  border-color: var(--c-primary-mid);
}

.permission-item-details {
  display: flex;
  flex-direction: column;
  padding-right: 1rem;
  min-width: 0;
}

.permission-label {
  font-size: 0.825rem;
  font-weight: 600;
  color: var(--c-text);
  margin-bottom: 0.1rem;
}

.permission-technical-name {
  font-size: 0.675rem;
  font-family: monospace;
  color: var(--c-text-muted);
  margin-bottom: 0.4rem;
}

.permission-desc {
  font-size: 0.725rem;
  color: var(--c-text-muted);
  line-height: 1.4;
  margin: 0;
}

.permission-checkbox-wrapper {
  padding-top: 0.2rem;
  flex-shrink: 0;
}

/* Custom switch toggle styles */
.custom-switch {
  position: relative;
  display: inline-block;
  width: 34px;
  height: 18px;
}

.custom-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.switch-slider {
  position: absolute;
  cursor: pointer;
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: var(--c-border);
  transition: .2s;
  border-radius: 20px;
  border: 1px solid #cbd5e1;
}

.switch-slider:before {
  position: absolute;
  content: "";
  height: 10px;
  width: 10px;
  left: 3px;
  bottom: 3px;
  background-color: #94a3b8;
  transition: .2s;
  border-radius: 50%;
}

.custom-switch input:checked + .switch-slider {
  background-color: var(--c-primary);
  border-color: var(--c-primary);
}

.custom-switch input:checked + .switch-slider:before {
  transform: translateX(16px);
  background-color: white;
}

.mt-4 { margin-top: 1rem; }

.alert-error {
  background: var(--c-danger-pale);
  border: 1px solid rgba(207, 99, 107, 0.3);
  border-radius: 8px;
  padding: 0.7rem 1rem;
  color: var(--c-danger);
  font-size: 0.85rem;
}

/* Spinners and basic buttons */
.btn-primary {
  display: flex; align-items: center; gap: 0.4rem;
  background: var(--c-primary);
  color: white; border: none; border-radius: 10px;
  padding: 0.65rem 1.25rem; font-size: 0.875rem; font-weight: 600;
  cursor: pointer; transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(17,85,156,0.25);
  white-space: nowrap;
}

.btn-primary:hover:not(:disabled) { transform: translateY(-1px); background: #0e4a88; }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

.btn-ghost {
  background: var(--c-surface); border: 1px solid var(--c-border);
  color: var(--c-text-muted); border-radius: 10px;
  padding: 0.65rem 1.25rem; font-size: 0.875rem; font-weight: 500;
  cursor: pointer; transition: all 0.15s;
}

.btn-ghost:hover { background: var(--c-primary-pale); color: var(--c-primary); }

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
