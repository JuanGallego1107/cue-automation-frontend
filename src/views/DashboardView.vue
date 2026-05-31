<template>
  <AppLayout>
    <div class="dashboard-page">
      <div class="page-header">
        <div>
          <h1>Dashboard</h1>
          <p class="page-subtitle">Bienvenido de vuelta, <strong>{{ auth.user?.name }}</strong></p>
        </div>
      </div>

      <!-- Info de Usuario -->
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

      <!-- Estadísticas de la API -->
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <span>Cargando estadísticas...</span>
      </div>

      <template v-else-if="dashboardData">
        <!-- Periodo Activo -->
        <div v-if="dashboardData.active_period" class="period-banner">
          <div class="period-info">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            <div>
              <strong>Periodo Activo: {{ dashboardData.active_period.name }}</strong>
              <span>({{ dashboardData.active_period.start_date }} - {{ dashboardData.active_period.end_date }})</span>
            </div>
          </div>
          <div v-if="dashboardData.has_active_review" class="review-badge">
            Revisión en curso
          </div>
        </div>

        <h2 class="section-title">
          Resumen de Revisiones 
          <span class="title-badge">{{ auth.user?.role?.name === 'Administrador' ? 'Global' : 'Mis revisiones' }}</span>
        </h2>
        
        <div class="stats-grid">
          <!-- Total -->
          <div class="stat-card">
            <div class="stat-icon purple">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10 9 9 9 8 9"/>
              </svg>
            </div>
            <div class="stat-info">
              <span class="stat-label">Total Documentos</span>
              <span class="stat-value">{{ dashboardData.total_submissions }}</span>
            </div>
          </div>

          <!-- Pendientes Aprobación -->
          <div class="stat-card">
            <div class="stat-icon blue">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
            <div class="stat-info">
              <span class="stat-label">Pendientes Aprobación</span>
              <span class="stat-value">{{ dashboardData.by_status.pending_approval || 0 }}</span>
            </div>
          </div>

          <!-- Aprobados -->
          <div class="stat-card">
            <div class="stat-icon green">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            </div>
            <div class="stat-info">
              <span class="stat-label">Aprobados</span>
              <span class="stat-value">{{ dashboardData.by_status.approved || 0 }}</span>
            </div>
          </div>

          <!-- Con problemas -->
          <div class="stat-card">
            <div class="stat-icon red">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <div class="stat-info">
              <span class="stat-label">Con observaciones</span>
              <span class="stat-value">{{ dashboardData.by_status.issues_found || 0 }}</span>
            </div>
          </div>
        </div>

        <div class="dashboard-columns">
          <!-- Actividad Reciente -->
          <div class="section-card flex-2">
            <h2 class="section-title">Actividad Reciente</h2>
            <div v-if="dashboardData.recent_submissions?.length" class="recent-list">
              <div v-for="sub in dashboardData.recent_submissions" :key="sub.id" class="recent-item">
                <div class="recent-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                  </svg>
                </div>
                <div class="recent-details">
                  <div class="recent-name">{{ sub.document_type?.name }} - {{ sub.subject?.name }}</div>
                  <div class="recent-meta">Modificado: {{ sub.updated_at ? new Date(sub.updated_at).toLocaleDateString() : '—' }}</div>
                </div>
                <div class="recent-status" :class="sub.status">
                  {{ formatStatus(sub.status) }}
                </div>
              </div>
            </div>
            <div v-else class="no-data">
              No hay actividad reciente.
            </div>
          </div>

        </div>
      </template>

    </div>
  </AppLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import AppLayout from '@/layouts/AppLayout.vue'
import { useAuthStore } from '@/stores/authStore'
import { dashboardApi } from '@/api/dashboard'

const auth = useAuthStore()
const dashboardData = ref(null)
const loading = ref(true)

onMounted(async () => {
  try {
    const response = await dashboardApi.getDashboardStats()
    dashboardData.value = response.data.data
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
  } finally {
    loading.value = false
  }
})

function formatStatus(status) {
  const statusMap = {
    pending: 'Pendiente',
    processing: 'Procesando',
    pending_approval: 'Por Aprobar',
    approved: 'Aprobado',
    issues_found: 'Con observaciones',
    failed: 'Error',
  }
  return statusMap[status] || status
}
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

.title-badge {
  background: rgba(102, 126, 234, 0.2);
  color: #a78bfa;
  font-size: 0.7rem;
  padding: 0.2rem 0.6rem;
  border-radius: 12px;
  vertical-align: middle;
  margin-left: 0.5rem;
  font-weight: 800;
  text-transform: uppercase;
}

/* Period Banner */
.period-banner {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
  border: 1px solid rgba(102, 126, 234, 0.2);
  border-radius: 16px;
  padding: 1.25rem 1.5rem;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.period-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.period-info svg {
  width: 24px;
  height: 24px;
  color: #818cf8;
}

.period-info strong {
  display: block;
  color: white;
  font-size: 1.05rem;
  margin-bottom: 0.2rem;
}

.period-info span {
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.85rem;
}

.review-badge {
  background: rgba(245, 158, 11, 0.15);
  color: #fcd34d;
  border: 1px solid rgba(245, 158, 11, 0.3);
  padding: 0.4rem 1rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
}

/* Stats */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
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
.stat-icon.red    { background: rgba(248, 113, 113, 0.15); color: #dc5111ff; }

.stat-info { display: flex; flex-direction: column; gap: 0.2rem; }
.stat-label { font-size: 0.75rem; color: rgba(255,255,255,0.35); text-transform: uppercase; letter-spacing: 0.5px; }
.stat-value { font-size: 1.1rem; font-weight: 700; color: white; }
.stat-value.connected { color: #4ade80; font-size: 0.95rem; }

/* Dashboard Columns */
.dashboard-columns {
  display: flex;
  gap: 1.5rem;
}
@media (max-width: 768px) {
  .dashboard-columns { flex-direction: column; }
}

.flex-1 { flex: 1; }
.flex-2 { flex: 2; }

/* Section card */
.section-card {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 1.5rem;
}

.section-title {
  font-size: 1.05rem;
  font-weight: 700;
  color: white;
  margin-bottom: 1.25rem;
}

/* Recent List */
.recent-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.recent-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  padding: 1rem;
  border-radius: 12px;
}

.recent-icon {
  width: 36px;
  height: 36px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.5);
}
.recent-icon svg { width: 16px; height: 16px; }

.recent-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.recent-name {
  font-size: 0.9rem;
  font-weight: 600;
  color: white;
}

.recent-meta {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.4);
}

.recent-status {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.6rem;
  border-radius: 8px;
}
.recent-status.pending { background: rgba(255, 255, 255, 0.1); color: rgba(255, 255, 255, 0.7); }
.recent-status.processing { background: rgba(56, 189, 248, 0.1); color: #38bdf8; }
.recent-status.pending_approval { background: rgba(245, 158, 11, 0.1); color: #fbbf24; }
.recent-status.approved { background: rgba(74, 222, 128, 0.1); color: #4ade80; }
.recent-status.issues_found { background: rgba(248, 113, 113, 0.1); color: #dc5111ff; }

/* Permissions */
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

/* Loading */
.loading-state {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 2rem 0;
  color: rgba(255, 255, 255, 0.5);
}

.spinner {
  width: 24px;
  height: 24px;
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-top-color: #818cf8;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
