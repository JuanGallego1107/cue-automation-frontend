<template>
  <div class="filters-container">
    <div class="filters-grid">
      <!-- Status Filter -->
      <div class="filter-group">
        <label for="filter-status">Estado</label>
        <select
          id="filter-status"
          :value="store.filters.status"
          @change="store.setFilter('status', $event.target.value)"
        >
          <option value="">Todos los estados</option>
          <option
            v-for="(config, statusKey) in SUBMISSION_STATUS_CONFIG"
            :key="statusKey"
            :value="statusKey"
          >
            {{ config.label }}
          </option>
        </select>
      </div>

      <!-- Period Filter -->
      <div class="filter-group">
        <label for="filter-period">Período</label>
        <select
          id="filter-period"
          :value="store.filters.period_id"
          @change="store.setFilter('period_id', $event.target.value ? Number($event.target.value) : '')"
        >
          <option value="">Todos los períodos</option>
          <option
            v-for="period in store.periods"
            :key="period.id"
            :value="period.id"
          >
            {{ period.name }}
          </option>
        </select>
      </div>

      <!-- Document Type Filter -->
      <div class="filter-group">
        <label for="filter-doc-type">Tipo de documento</label>
        <select
          id="filter-doc-type"
          :value="store.filters.document_type_id"
          @change="store.setFilter('document_type_id', $event.target.value ? Number($event.target.value) : '')"
        >
          <option value="">Todos los tipos</option>
          <option
            v-for="type in store.documentTypes"
            :key="type.id"
            :value="type.id"
          >
            {{ type.name }}
          </option>
        </select>
      </div>

      <!-- Date From -->
      <div class="filter-group">
        <label for="filter-date-from">Fecha desde</label>
        <input
          type="date"
          id="filter-date-from"
          v-model="localDateFrom"
          @input="onDateFromInput"
        />
      </div>

      <!-- Date To -->
      <div class="filter-group">
        <label for="filter-date-to">Fecha hasta</label>
        <input
          type="date"
          id="filter-date-to"
          v-model="localDateTo"
          @input="onDateToInput"
        />
      </div>
    </div>

    <!-- Clear Filters Button -->
    <div v-if="hasActiveFilters" class="clear-filters-wrapper">
      <button class="btn-clear" @click="clearAllFilters">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          class="btn-icon"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
        Limpiar filtros
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { useSubmissionStore } from '@/stores/submissionStore'
import { SUBMISSION_STATUS_CONFIG } from '@/constants/submissionStatuses'

const store = useSubmissionStore()

// Local state for dates to handle debounce
const localDateFrom = ref(store.filters.date_from)
const localDateTo = ref(store.filters.date_to)

// Watchers to update local date values when cleared or set programmatically
watch(
  () => store.filters.date_from,
  (newVal) => {
    localDateFrom.value = newVal
  }
)

watch(
  () => store.filters.date_to,
  (newVal) => {
    localDateTo.value = newVal
  }
)

// Check if any filters are active to show/hide "Limpiar filtros"
const hasActiveFilters = computed(() => {
  return Object.values(store.filters).some((v) => v !== '' && v !== null && v !== undefined)
})

// Debounced inputs for dates
let dateFromTimeout = null
function onDateFromInput() {
  clearTimeout(dateFromTimeout)
  dateFromTimeout = setTimeout(() => {
    store.setFilter('date_from', localDateFrom.value)
  }, 400)
}

let dateToTimeout = null
function onDateToInput() {
  clearTimeout(dateToTimeout)
  dateToTimeout = setTimeout(() => {
    store.setFilter('date_to', localDateTo.value)
  }, 400)
}

function clearAllFilters() {
  localDateFrom.value = ''
  localDateTo.value = ''
  store.clearFilters()
}
</script>

<style scoped>
.filters-container {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 16px;
  padding: 1.25rem 1.5rem;
  margin-bottom: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.filters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.filter-group label {
  font-size: 0.775rem;
  color: rgba(255, 255, 255, 0.4);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.filter-group select,
.filter-group input[type="date"] {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 0.6rem 0.8rem;
  color: white;
  font-size: 0.85rem;
  outline: none;
  transition: all 0.2s;
  width: 100%;
  box-sizing: border-box;
}

.filter-group select:focus,
.filter-group input[type="date"]:focus {
  border-color: #667eea;
  background: rgba(255, 255, 255, 0.09);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.15);
}

.filter-group select option {
  background: #151230;
  color: white;
}

.clear-filters-wrapper {
  display: flex;
  justify-content: flex-end;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  padding-top: 0.75rem;
}

.btn-clear {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background: rgba(248, 113, 113, 0.1);
  border: 1px solid rgba(248, 113, 113, 0.2);
  color: #f87171;
  padding: 0.45rem 1rem;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-clear:hover {
  background: rgba(248, 113, 113, 0.18);
  border-color: rgba(248, 113, 113, 0.35);
  transform: translateY(-1px);
}

.btn-clear:active {
  transform: translateY(0);
}

.btn-icon {
  width: 13px;
  height: 13px;
}
</style>
