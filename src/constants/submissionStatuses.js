export const SUBMISSION_STATUS = {
  PENDING:          'pending',
  PROCESSING:       'processing',
  PENDING_APPROVAL: 'pending_approval',
  APPROVED:         'approved',
  ISSUES_FOUND:     'issues_found',
  FAILED:           'failed',
}

export const SUBMISSION_STATUS_CONFIG = {
  [SUBMISSION_STATUS.PENDING]: {
    label: 'Pendiente',
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.12)',
    icon: 'clock',
    description: 'El documento está en cola y espera ser procesado por la IA.',
  },
  [SUBMISSION_STATUS.PROCESSING]: {
    label: 'Procesando',
    color: '#3b82f6',
    bgColor: 'rgba(59, 130, 246, 0.12)',
    icon: 'refresh',
    description: 'La IA está analizando y validando el contenido del documento.',
  },
  [SUBMISSION_STATUS.PENDING_APPROVAL]: {
    label: 'Esperando aprobación',
    color: '#a78bfa',
    bgColor: 'rgba(167, 139, 250, 0.12)',
    icon: 'alert-circle',
    description: 'Análisis de IA finalizado sin observaciones críticas. Pendiente de confirmación para Google Drive.',
  },
  [SUBMISSION_STATUS.APPROVED]: {
    label: 'Aprobado',
    color: '#10b981',
    bgColor: 'rgba(16, 185, 129, 0.12)',
    icon: 'check-circle',
    description: 'El documento ha sido aprobado y guardado exitosamente en Google Drive.',
  },
  [SUBMISSION_STATUS.ISSUES_FOUND]: {
    label: 'Con observaciones',
    color: '#dc5111ff',
    bgColor: 'rgba(243, 139, 35, 0.12)',
    icon: 'x-circle',
    description: 'Se encontraron inconsistencias o faltaron campos requeridos en el documento.',
  },
  [SUBMISSION_STATUS.FAILED]: {
    label: 'Error en proceso',
    color: '#ef4444',
    bgColor: 'rgba(250, 64, 1, 0.12)',
    icon: 'alert-triangle',
    description: 'Ocurrió un error técnico al procesar el archivo. Por favor reintente o contacte soporte.',
  },
}

export const ROLES = {
  ADMIN: 'Administrador',
  COORDINATOR: 'Coordinador',
}
