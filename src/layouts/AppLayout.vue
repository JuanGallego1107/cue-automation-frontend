<template>
  <div class="app-layout">
    <!-- Sidebar -->
    <aside class="sidebar" :class="{ collapsed: sidebarCollapsed }">
      <div class="sidebar-header">
        <div class="brand">
          <div class="brand-icon">
            <img src="/owlsight-logo.svg" alt="Owlsight" class="brand-logo" />
          </div>
          <span class="brand-name">Owlsight</span>
        </div>
        <button class="collapse-btn" @click="sidebarCollapsed = !sidebarCollapsed">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
      </div>

      <nav class="sidebar-nav">
        <!-- Dashboard -->
        <RouterLink to="/dashboard" class="nav-item" active-class="active">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="7" height="7"/>
            <rect x="14" y="3" width="7" height="7"/>
            <rect x="14" y="14" width="7" height="7"/>
            <rect x="3" y="14" width="7" height="7"/>
          </svg>
          <span>Dashboard</span>
        </RouterLink>

        <!-- Revisiones (Coordinador y Administrador) -->
        <RouterLink
          v-if="canSeeSubmissions"
          to="/submissions"
          class="nav-item"
          active-class="active"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <polyline points="10 9 9 9 8 9"/>
          </svg>
          <span>Revisiones</span>
          <!-- Badge de pendientes de aprobación -->
          <span v-if="pendingApprovalCount > 0" class="nav-badge">
            {{ pendingApprovalCount }}
          </span>
        </RouterLink>

        <!-- Administración — solo si tiene algún permiso de admin -->
        <template v-if="canSeeAdmin">
          <div class="nav-section-label">Administración</div>

          <RouterLink
            v-if="auth.hasPermission('users.view')"
            to="/admin/users"
            class="nav-item"
            active-class="active"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            <span>Usuarios</span>
          </RouterLink>

          <RouterLink
            v-if="auth.hasPermission('subjects.view')"
            to="/admin/subjects"
            class="nav-item"
            active-class="active"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
            </svg>
            <span>Asignaturas</span>
          </RouterLink>

          <RouterLink
            v-if="auth.hasPermission('roles.manage')"
            to="/admin/roles"
            class="nav-item"
            active-class="active"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            <span>Roles y Permisos</span>
          </RouterLink>

        </template>
      </nav>

      <!-- User info at bottom -->
      <div class="sidebar-footer">
        <div class="user-info">
          <div class="user-avatar">{{ userInitials }}</div>
          <div class="user-details">
            <span class="user-name">{{ auth.user?.name }}</span>
            <span class="user-role">{{ auth.user?.role?.name }}</span>
          </div>
        </div>
        <button class="logout-btn" @click="handleLogout" title="Cerrar sesión">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
        </button>
      </div>
    </aside>

    <!-- Main content -->
    <main class="main-content">
      <slot />
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useSubmissionStore } from '@/stores/submissionStore'

const router = useRouter()
const auth = useAuthStore()
const submissionStore = useSubmissionStore()
const sidebarCollapsed = ref(false)

const userInitials = computed(() => {
  const name = auth.user?.name || ''
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
})

const canSeeAdmin = computed(() => {
  return auth.hasPermission('users.view') || auth.hasPermission('roles.manage') || auth.hasPermission('subjects.view')
})

const canSeeSubmissions = computed(() => {
  const roleName = auth.user?.role?.name
  return roleName === 'Administrador' || roleName === 'Coordinador'
})

const pendingApprovalCount = computed(() => {
  if (auth.user?.role?.name !== 'Coordinador') return 0
  return submissionStore.submissionsByStatus('pending_approval').length
})

async function handleLogout() {
  await auth.logout()
  router.push('/login')
}

// Carga inicial para el badge del sidebar
onMounted(() => {
  if (auth.user?.role?.name === 'Coordinador') {
    submissionStore.fetchSubmissions()
  }
})
</script>

<style scoped>
.app-layout {
  display: flex;
  min-height: 100vh;
  background: var(--c-bg);
}

/* ── Sidebar ────────────────────────────────── */
.sidebar {
  width: 240px;
  min-height: 100vh;
  background: linear-gradient(180deg, #11559C 0%, #0d4080 100%);
  border-right: 1px solid rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  transition: width 0.25s ease;
  position: sticky;
  top: 0;
  height: 100vh;
}

.sidebar.collapsed {
  width: 68px;
}

.sidebar.collapsed .brand,
.sidebar.collapsed .nav-item span,
.sidebar.collapsed .user-details,
.sidebar.collapsed .nav-section-label,
.sidebar.collapsed .nav-badge {
  display: none;
}

.sidebar.collapsed .sidebar-header {
  justify-content: center;
}

.sidebar.collapsed .nav-item {
  justify-content: center;
  padding: 0.6rem 0;
}

.sidebar.collapsed .sidebar-footer {
  flex-direction: column;
  gap: 0.75rem;
  justify-content: center;
  align-items: center;
}

.sidebar.collapsed .user-info {
  justify-content: center;
  flex: none;
}

/* Header */
.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.brand-icon {
  width: 38px;
  height: 38px;
  background: #ffffff;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
  overflow: hidden;
}

.brand-logo {
  width: 28px;
  height: 28px;
  object-fit: contain;
  display: block;
}

.brand-name {
  font-size: 0.95rem;
  font-weight: 700;
  color: white;
  white-space: nowrap;
}

.collapse-btn {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 8px;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #ffffff;
  flex-shrink: 0;
  transition: all 0.15s;
}

.collapse-btn:hover { color: white; background: rgba(255, 255, 255, 0.18); }
.collapse-btn svg { width: 16px; height: 16px; }

/* Nav */
.sidebar-nav {
  flex: 1;
  padding: 1rem 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 2px;
  overflow-y: auto;
}

.nav-section-label {
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  color: rgba(255, 255, 255, 0.5);
  padding: 0.75rem 0.5rem 0.25rem;
  white-space: nowrap;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.6rem 0.75rem;
  border-radius: 10px;
  color: rgba(255, 255, 255, 0.75);
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.15s;
  white-space: nowrap;
}

.nav-item svg {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

.nav-item:hover {
  background: #0e4a88;
  color: #ffffff;
}

.nav-item.active {
  background: #1466B8;
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.25);
}

.nav-badge {
  background: #FFCC9E;
  color: #7A4200;
  font-size: 0.7rem;
  font-weight: 800;
  padding: 0.15rem 0.45rem;
  border-radius: 10px;
  margin-left: auto;
  line-height: 1;
}

/* Footer */
.sidebar-footer {
  padding: 0.75rem;
  border-top: 1px solid rgba(255, 255, 255, 0.15);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.user-info {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  min-width: 0;
}

.user-avatar {
  width: 34px;
  height: 34px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
  color: white;
  flex-shrink: 0;
}

.user-details {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.user-name {
  font-size: 0.8rem;
  font-weight: 600;
  color: white;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-role {
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.65);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.logout-btn {
  background: rgba(207, 99, 107, 0.2);
  border: none;
  border-radius: 8px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #FFAAAD;
  flex-shrink: 0;
  transition: all 0.15s;
}

.logout-btn:hover { background: rgba(207, 99, 107, 0.35); }
.logout-btn svg { width: 15px; height: 15px; }

/* ── Main content ───────────────────────────── */
.main-content {
  flex: 1;
  overflow-y: auto;
  min-width: 0;
}
</style>
