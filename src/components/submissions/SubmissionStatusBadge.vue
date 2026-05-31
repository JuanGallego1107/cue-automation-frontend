<template>
  <span
    v-if="config"
    :class="['status-badge', size]"
    :style="{
      color: config.color,
      backgroundColor: config.bgColor,
      borderColor: `${config.color}25`
    }"
    :title="config.description"
  >
    <!-- Dynamic Icon SVG Render -->
    <svg
      v-if="config.icon === 'clock'"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      class="badge-icon"
    >
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>

    <svg
      v-else-if="config.icon === 'refresh'"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      class="badge-icon spin"
    >
      <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
    </svg>

    <svg
      v-else-if="config.icon === 'alert-circle'"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      class="badge-icon"
    >
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="12"/>
      <line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>

    <svg
      v-else-if="config.icon === 'check-circle'"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      class="badge-icon"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
      <polyline points="22 4 12 14.01 9 11.01"/>
    </svg>

    <svg
      v-else-if="config.icon === 'x-circle'"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      class="badge-icon"
    >
      <circle cx="12" cy="12" r="10"/>
      <line x1="15" y1="9" x2="9" y2="15"/>
      <line x1="9" y1="9" x2="15" y2="15"/>
    </svg>

    <svg
      v-else-if="config.icon === 'alert-triangle'"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      class="badge-icon"
    >
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/>
      <line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>

    <span class="badge-label">{{ config.label }}</span>
  </span>
</template>

<script setup>
import { computed } from 'vue'
import { SUBMISSION_STATUS_CONFIG } from '@/constants/submissionStatuses'

const props = defineProps({
  status: {
    type: String,
    required: true,
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value),
  },
})

const config = computed(() => {
  return SUBMISSION_STATUS_CONFIG[props.status] || {
    label: props.status,
    color: '#9ca3af',
    bgColor: 'rgba(156, 163, 175, 0.12)',
    icon: 'clock',
    description: 'Estado desconocido',
  }
})
</script>

<style scoped>
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  border-radius: 20px;
  border: 1px solid;
  font-weight: 600;
  white-space: nowrap;
  user-select: none;
  transition: all 0.2s ease;
}

/* Sizes */
.status-badge.sm {
  padding: 0.15rem 0.5rem;
  font-size: 0.725rem;
}
.status-badge.sm .badge-icon {
  width: 12px;
  height: 12px;
}

.status-badge.md {
  padding: 0.2rem 0.65rem;
  font-size: 0.775rem;
}
.status-badge.md .badge-icon {
  width: 14px;
  height: 14px;
}

.status-badge.lg {
  padding: 0.3rem 0.8rem;
  font-size: 0.85rem;
}
.status-badge.lg .badge-icon {
  width: 16px;
  height: 16px;
}

.badge-icon {
  flex-shrink: 0;
}

/* Animations */
.spin {
  animation: spin 2s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
