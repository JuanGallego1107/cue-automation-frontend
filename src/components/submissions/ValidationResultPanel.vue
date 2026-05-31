<template>
  <div class="result-panel">
    <!-- 1. Carga / Estado Pendiente o Procesando -->
    <div v-if="isLoadingOrPending" class="empty-or-loading">
      <div class="skeleton-card">
        <div class="pulse-ring"></div>
        <h4 class="loading-title">Analizando documento...</h4>
        <p class="loading-desc">La Inteligencia Artificial está validando el contenido del archivo. Esto puede tardar hasta un minuto.</p>
        
        <!-- Skeleton bars -->
        <div class="skeleton-bars">
          <div class="skeleton-bar w-3/4"></div>
          <div class="skeleton-bar w-full"></div>
          <div class="skeleton-bar w-5/6"></div>
        </div>
      </div>
    </div>

    <!-- 2. No Hay Resultados (y no está cargando) -->
    <div v-else-if="!hasResult" class="empty-or-loading">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
        class="empty-icon"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
      <h4>Análisis no disponible</h4>
      <p>El análisis automático no se ejecutó o el envío falló.</p>
    </div>

    <!-- 3. Resultados Disponibles -->
    <div v-else class="result-content">
      <!-- Encabezado de Resultados -->
      <div class="result-header-card">
        <!-- Score Circular Indicator -->
        <div class="score-section">
          <svg class="score-circle" viewBox="0 0 36 36">
            <path
              class="circle-bg"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              class="circle"
              :stroke-dasharray="`${scorePercent}, 100`"
              :stroke="scoreColor"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <text x="18" y="20.35" class="percentage" :fill="scoreColor">{{ scorePercent }}%</text>
          </svg>
          <span class="score-label">Puntaje de Validación</span>
        </div>

        <!-- General Status Info -->
        <div class="status-summary">
          <div class="outcome-badge" :style="{ backgroundColor: outcomeBg, color: outcomeColor }">
            <svg
              v-if="passed"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              class="outcome-icon"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <svg
              v-else
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              class="outcome-icon"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
            <span>{{ passed ? 'Validación Exitosa' : 'Validación con Errores' }}</span>
          </div>
          <p class="summary-text">{{ analysisSummary }}</p>
        </div>
      </div>

      <!-- Sección: Verificaciones (Checks Performados) -->
      <div class="result-section">
        <h4 class="section-title">Chequeos de Cumplimiento</h4>
        <div class="checks-grid">
          <!-- Passed Checks -->
          <div
            v-for="(check, idx) in checksPassed"
            :key="`pass-${idx}`"
            class="check-item passed"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="3"
              class="check-icon"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span>{{ check }}</span>
          </div>

          <!-- Failed Checks -->
          <div
            v-for="(check, idx) in checksFailed"
            :key="`fail-${idx}`"
            class="check-item failed"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="3"
              class="check-icon"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
            <span>{{ check }}</span>
          </div>
        </div>
      </div>

      <!-- Sección: Observaciones Encontradas (Issues) -->
      <div v-if="hasIssues" class="result-section">
        <h4 class="section-title">Observaciones Encontradas</h4>
        
        <div class="issues-list">
          <!-- Critical Issues -->
          <div v-if="groupedIssues.critico.length > 0" class="severity-group critico">
            <div class="severity-header">
              <span class="severity-badge critico">Crítico</span>
              <span class="count-text">{{ groupedIssues.critico.length }} issue(s)</span>
            </div>
            <div class="issues-grid">
              <div v-for="(issue, idx) in groupedIssues.critico" :key="`crit-${idx}`" class="issue-card">
                <div class="issue-meta">
                  <span class="field-tag">Campo: {{ issue.field || 'General' }}</span>
                </div>
                <p class="issue-desc">{{ issue.description }}</p>
                <div class="issue-rec">
                  <strong>Recomendación:</strong> {{ issue.recommendation }}
                </div>
              </div>
            </div>
          </div>

          <!-- Warning Issues -->
          <div v-if="groupedIssues.advertencia.length > 0" class="severity-group advertencia">
            <div class="severity-header">
              <span class="severity-badge advertencia">Advertencia</span>
              <span class="count-text">{{ groupedIssues.advertencia.length }} issue(s)</span>
            </div>
            <div class="issues-grid">
              <div v-for="(issue, idx) in groupedIssues.advertencia" :key="`warn-${idx}`" class="issue-card">
                <div class="issue-meta">
                  <span class="field-tag">Campo: {{ issue.field || 'General' }}</span>
                </div>
                <p class="issue-desc">{{ issue.description }}</p>
                <div class="issue-rec">
                  <strong>Recomendación:</strong> {{ issue.recommendation }}
                </div>
              </div>
            </div>
          </div>

          <!-- Informational Issues -->
          <div v-if="groupedIssues.informativo.length > 0" class="severity-group informativo">
            <div class="severity-header">
              <span class="severity-badge informativo">Informativo</span>
              <span class="count-text">{{ groupedIssues.informativo.length }} issue(s)</span>
            </div>
            <div class="issues-grid">
              <div v-for="(issue, idx) in groupedIssues.informativo" :key="`info-${idx}`" class="issue-card">
                <div class="issue-meta">
                  <span class="field-tag">Campo: {{ issue.field || 'General' }}</span>
                </div>
                <p class="issue-desc">{{ issue.description }}</p>
                <div class="issue-rec">
                  <strong>Recomendación:</strong> {{ issue.recommendation }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Sección: Recomendaciones para el Docente -->
      <div v-if="hasIssues && recommendations" class="result-section recommendations-section">
        <h4 class="section-title text-purple">Recomendaciones para el Docente</h4>
        <p class="recommendations-text">{{ recommendations }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { SUBMISSION_STATUS } from '@/constants/submissionStatuses'

const props = defineProps({
  submission: {
    type: Object,
    required: true,
  },
})

// Determina si está en proceso o pendiente, lo que significa que el análisis de IA está ejecutándose
const isLoadingOrPending = computed(() => {
  return (
    props.submission.status === SUBMISSION_STATUS.PENDING ||
    props.submission.status === SUBMISSION_STATUS.PROCESSING
  )
})

// Determina si hay algún resultado cargado
const hasResult = computed(() => {
  return !!(props.submission.validation_result || props.submission.ai_analysis)
})

const valResult = computed(() => props.submission.validation_result || {})
const aiAnalysis = computed(() => props.submission.ai_analysis || {})

// Campos derivados
const passed = computed(() => {
  if (valResult.value.id !== undefined) return !!valResult.value.passed
  return aiAnalysis.value.result === 'pass'
})

const scorePercent = computed(() => {
  const s = valResult.value.score ?? aiAnalysis.value.confidence_score
  if (s === null || s === undefined) return 0
  // Convertir decimal [0, 1] a porcentaje si es flotante menor a 2, o usar directo
  return s <= 1 && s > 0 ? Math.round(s * 100) : Math.round(Number(s))
})

const scoreColor = computed(() => {
  const s = scorePercent.value
  if (s >= 90) return '#10b981' // emerald-500
  if (s >= 70) return '#f59e0b' // amber-500
  return '#f43f5e' // rose-500
})

const outcomeColor = computed(() => (passed.value ? '#10b981' : '#f43f5e'))
const outcomeBg = computed(() => (passed.value ? 'rgba(16, 185, 129, 0.12)' : 'rgba(244, 63, 94, 0.12)'))

const analysisSummary = computed(() => {
  return aiAnalysis.value.summary || 'Resumen de validación no estructurado por el servidor.'
})

const checksPassed = computed(() => {
  return valResult.value.checks_passed || []
})

const checksFailed = computed(() => {
  return valResult.value.checks_failed || []
})

const recommendations = computed(() => {
  return valResult.value.recommendations || aiAnalysis.value.recommendations || ''
})

// Issues del análisis IA
const hasIssues = computed(() => {
  return (aiAnalysis.value.findings?.length || 0) > 0
})

const groupedIssues = computed(() => {
  const findings = aiAnalysis.value.findings || []
  const groups = {
    critico: [],
    advertencia: [],
    informativo: [],
  }

  findings.forEach((issue) => {
    // Normalizar severidad
    let severity = (issue.severity || 'informativo').toLowerCase()
    
    // Mapear variantes de acentos
    if (severity === 'crítico' || severity === 'critico') severity = 'critico'
    else if (severity === 'advertencia' || severity === 'warning') severity = 'advertencia'
    else severity = 'informativo'

    if (groups[severity]) {
      groups[severity].push(issue)
    } else {
      groups.informativo.push(issue)
    }
  })

  return groups
})
</script>

<style scoped>
.result-panel {
  width: 100%;
}

.empty-or-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 4rem 2rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 16px;
  color: rgba(255, 255, 255, 0.5);
  min-height: 380px;
}

.empty-icon {
  width: 48px;
  height: 48px;
  color: rgba(255, 255, 255, 0.2);
  margin-bottom: 1.25rem;
}

.empty-or-loading h4 {
  font-size: 1.1rem;
  font-weight: 700;
  color: white;
  margin-bottom: 0.5rem;
}

.empty-or-loading p {
  font-size: 0.85rem;
  max-width: 320px;
  line-height: 1.5;
  margin: 0;
}

/* Skeleton Loading styles */
.skeleton-card {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.pulse-ring {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  border: 3px solid rgba(102, 126, 234, 0.2);
  border-top-color: #667eea;
  animation: spin 1s linear infinite;
  margin-bottom: 1.5rem;
}

.loading-title {
  color: white;
  font-size: 1.1rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.loading-desc {
  color: rgba(255, 255, 255, 0.4) !important;
  font-size: 0.85rem;
  max-width: 380px !important;
  margin-bottom: 2rem !important;
}

.skeleton-bars {
  width: 100%;
  max-width: 360px;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  align-items: center;
}

.skeleton-bar {
  height: 10px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 5px;
  animation: pulse 1.5s ease-in-out infinite;
}

.w-3\/4 { width: 75%; }
.w-full { width: 100%; }
.w-5\/6 { width: 83.333%; }

@keyframes pulse {
  0%, 100% {
    opacity: 0.4;
  }
  50% {
    opacity: 0.85;
  }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Result Content */
.result-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Header Card (Circular chart + Summary) */
.result-header-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 16px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 2rem;
}

@media (max-width: 640px) {
  .result-header-card {
    flex-direction: column;
    text-align: center;
    gap: 1.5rem;
  }
}

.score-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.6rem;
  flex-shrink: 0;
}

.score-circle {
  width: 100px;
  height: 100px;
}

.circle-bg {
  fill: none;
  stroke: rgba(255, 255, 255, 0.04);
  stroke-width: 3;
}

.circle {
  fill: none;
  stroke-width: 3;
  stroke-linecap: round;
  transform: rotate(-90deg);
  transform-origin: 50% 50%;
  transition: stroke-dasharray 0.5s ease;
}

.percentage {
  font-family: 'Inter', sans-serif;
  font-size: 8.5px;
  font-weight: 800;
  text-anchor: middle;
}

.score-label {
  font-size: 0.725rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: rgba(255, 255, 255, 0.4);
  font-weight: 600;
}

.status-summary {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.75rem;
  flex: 1;
}

@media (max-width: 640px) {
  .status-summary {
    align-items: center;
  }
}

.outcome-badge {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.825rem;
  font-weight: 700;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.outcome-icon {
  width: 14px;
  height: 14px;
}

.summary-text {
  font-size: 0.875rem;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.75);
  margin: 0;
}

/* Sections */
.result-section {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 16px;
  padding: 1.25rem 1.5rem;
}

.section-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: white;
  margin-bottom: 1rem;
}

/* Compliance Checks grid */
.checks-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 0.75rem;
}

.check-item {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  padding: 0.75rem 1rem;
  border-radius: 12px;
  font-size: 0.825rem;
  line-height: 1.4;
  border: 1px solid;
}

.check-item.passed {
  background: rgba(16, 185, 129, 0.03);
  border-color: rgba(16, 185, 129, 0.15);
  color: rgba(255, 255, 255, 0.85);
}

.check-item.passed .check-icon {
  color: #10b981;
}

.check-item.failed {
  background: rgba(244, 63, 94, 0.03);
  border-color: rgba(244, 63, 94, 0.15);
  color: rgba(255, 255, 255, 0.85);
}

.check-item.failed .check-icon {
  color: #f43f5e;
}

.check-icon {
  width: 14px;
  height: 14px;
  margin-top: 2px;
  flex-shrink: 0;
}

/* Issues Severity groupings */
.issues-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.severity-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1rem;
  border-radius: 12px;
  border: 1px solid;
}

.severity-group.critico {
  background: rgba(244, 63, 94, 0.02);
  border-color: rgba(244, 63, 94, 0.15);
}

.severity-group.advertencia {
  background: rgba(245, 158, 11, 0.01);
  border-color: rgba(245, 158, 11, 0.15);
}

.severity-group.informativo {
  background: rgba(59, 130, 246, 0.01);
  border-color: rgba(59, 130, 246, 0.15);
}

.severity-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.severity-badge {
  font-size: 0.725rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 0.15rem 0.5rem;
  border-radius: 6px;
}

.severity-badge.critico { background: #f43f5e; color: white; }
.severity-badge.advertencia { background: #f59e0b; color: #1e1b3a; }
.severity-badge.informativo { background: #3b82f6; color: white; }

.count-text {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.35);
  font-weight: 600;
}

.issues-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.75rem;
}

.issue-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 8px;
  padding: 0.75rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.field-tag {
  font-size: 0.75rem;
  font-weight: 600;
  color: #a78bfa;
}

.issue-desc {
  font-size: 0.825rem;
  line-height: 1.4;
  color: rgba(255, 255, 255, 0.85);
  margin: 0;
}

.issue-rec {
  font-size: 0.8rem;
  line-height: 1.4;
  color: rgba(255, 255, 255, 0.5);
  margin: 0;
  border-top: 1px dashed rgba(255, 255, 255, 0.05);
  padding-top: 0.4rem;
  margin-top: 0.2rem;
}

.issue-rec strong {
  color: rgba(255, 255, 255, 0.7);
}

/* Recommendations Section */
.recommendations-section {
  border-color: rgba(167, 139, 250, 0.25);
  background: rgba(167, 139, 250, 0.03);
}

.text-purple {
  color: #a78bfa !important;
}

.recommendations-text {
  font-size: 0.85rem;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.85);
  margin: 0;
  white-space: pre-wrap;
}
</style>
