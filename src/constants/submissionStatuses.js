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
    color: '#7A4200',
    bgColor: 'rgba(255, 204, 158, 0.35)',
    icon: 'clock',
    description: 'El documento está en cola y espera ser procesado por la IA.',
  },
  [SUBMISSION_STATUS.PROCESSING]: {
    label: 'Procesando',
    color: '#11559C',
    bgColor: 'rgba(17, 85, 156, 0.1)',
    icon: 'refresh',
    description: 'La IA está analizando y validando el contenido del documento.',
  },
  [SUBMISSION_STATUS.PENDING_APPROVAL]: {
    label: 'Esperando aprobación',
    color: '#11559C',
    bgColor: 'rgba(17, 85, 156, 0.12)',
    icon: 'alert-circle',
    description: 'Análisis de IA finalizado sin observaciones críticas. Pendiente de confirmación para Google Drive.',
  },
  [SUBMISSION_STATUS.APPROVED]: {
    label: 'Aprobado',
    color: '#3A6200',
    bgColor: 'rgba(213, 237, 171, 0.5)',
    icon: 'check-circle',
    description: 'El documento ha sido aprobado y guardado exitosamente en Google Drive.',
  },
  [SUBMISSION_STATUS.ISSUES_FOUND]: {
    label: 'Con observaciones',
    color: '#CF636B',
    bgColor: 'rgba(207, 99, 107, 0.1)',
    icon: 'x-circle',
    description: 'Se encontraron inconsistencias o faltaron campos requeridos en el documento.',
  },
  [SUBMISSION_STATUS.FAILED]: {
    label: 'Error en proceso',
    color: '#CF636B',
    bgColor: 'rgba(207, 99, 107, 0.08)',
    icon: 'alert-triangle',
    description: 'Ocurrió un error técnico al procesar el archivo. Por favor reintente o contacte soporte.',
  },
}

export const ROLES = {
  ADMIN: 'Administrador',
  COORDINATOR: 'Coordinador',
}
