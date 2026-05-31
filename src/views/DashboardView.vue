<template>
  <AppLayout>
    <div class="dashboard-page">
      <div class="page-header">
        <div>
          <h1>Dashboard</h1>
          <p class="page-subtitle">Bienvenido de vuelta, <strong>{{ auth.user?.name }}</strong></p>
        </div>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon purple">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <div class="stat-info">
            <span class="stat-label">Rol</span>
            <span class="stat-value">{{ auth.user?.role?.name || '—' }}</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon blue">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <div class="stat-info">
            <span class="stat-label">Permisos</span>
            <span class="stat-value">{{ auth.permissions.length }}</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon green">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>
          <div class="stat-info">
            <span class="stat-label">Estado</span>
            <span class="stat-value connected">● Activo</span>
          </div>
        </div>
      </div>

      <!-- Permisos del usuario -->
      <div class="section-card">
        <h2 class="section-title">Mis permisos</h2>
        <div class="permissions-grid">
          <span v-for="perm in auth.permissions" :key="perm" class="permission-badge">
            {{ perm }}
          </span>
          <span v-if="auth.permissions.length === 0" class="no-data">Sin permisos asignados</span>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import AppLayout from '@/layouts/AppLayout.vue'
import { useAuthStore } from '@/stores/authStore'

const auth = useAuthStore()
</script>

<style scoped>
.dashboard-page {
  padding: 2rem;
  max-width: 1200px;
}

.page-header {
  margin-bottom: 2rem;
}

.page-header h1 {
  font-size: 1.75rem;
  font-weight: 800;
  color: white;
  margin-bottom: 0.25rem;
}

.page-subtitle {
  color: rgba(255, 255, 255, 0.45);
  font-size: 0.9rem;
  margin: 0;
}

.page-subtitle strong { color: rgba(255, 255, 255, 0.7); font-weight: 500; }

/* Stats */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.stat-card {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 1.25rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: transform 0.2s, border-color 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  border-color: rgba(255, 255, 255, 0.14);
}

.stat-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-icon svg { width: 20px; height: 20px; }
.stat-icon.purple { background: rgba(102, 126, 234, 0.15); color: #818cf8; }
.stat-icon.blue   { background: rgba(56, 189, 248, 0.15); color: #38bdf8; }
.stat-icon.green  { background: rgba(74, 222, 128, 0.15); color: #4ade80; }

.stat-info { display: flex; flex-direction: column; gap: 0.2rem; }
.stat-label { font-size: 0.75rem; color: rgba(255,255,255,0.35); text-transform: uppercase; letter-spacing: 0.5px; }
.stat-value { font-size: 1.1rem; font-weight: 700; color: white; }
.stat-value.connected { color: #4ade80; font-size: 0.95rem; }

/* Section card */
.section-card {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 1.5rem;
}

.section-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: white;
  margin-bottom: 1rem;
}

.permissions-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.permission-badge {
  background: rgba(102, 126, 234, 0.12);
  border: 1px solid rgba(102, 126, 234, 0.25);
  color: #a78bfa;
  padding: 0.3rem 0.75rem;
  border-radius: 20px;
  font-size: 0.78rem;
  font-weight: 500;
  font-family: monospace;
}

.no-data { color: rgba(255,255,255,0.25); font-size: 0.875rem; }
</style>
