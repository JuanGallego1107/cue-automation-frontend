/**
 * Formatea una cadena de fecha ISO al formato de Colombia (es-CO)
 * Ej: "15 mar. 2025, 10:30"
 * 
 * @param {string} isoString - Fecha en formato ISO
 * @param {boolean} includeTime - Si incluye o no la hora
 * @returns {string} Fecha formateada
 */
export function formatDate(isoString, includeTime = true) {
  if (!isoString) return '—'
  const date = new Date(isoString)
  if (isNaN(date.getTime())) return '—'
  
  const dateStr = date.toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
  
  if (!includeTime) return dateStr
  
  const timeStr = date.toLocaleTimeString('es-CO', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })
  
  return `${dateStr}, ${timeStr}`
}
