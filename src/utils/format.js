const MONTHS_SHORT = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
const MONTHS_LONG = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
const DAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

const pad = (n) => String(n).padStart(2, '0')
const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

export const formatPrice = (amount) => money.format(amount)

// "05 de Abr, 2027 - 20:00"  (tarjetas del listado)
export function formatShortDate(iso) {
  const d = new Date(iso)
  return `${pad(d.getDate())} de ${MONTHS_SHORT[d.getMonth()]}, ${d.getFullYear()} - ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

// "Lunes, 05 de Abril de 2027 – 20:00 h"  (detalle y boleto)
export function formatLongDate(iso) {
  const d = new Date(iso)
  return `${DAYS[d.getDay()]}, ${pad(d.getDate())} de ${MONTHS_LONG[d.getMonth()]} de ${d.getFullYear()} – ${pad(d.getHours())}:${pad(d.getMinutes())} h`
}

// "2027-04" → "Abril 2027"
export function formatMonthLabel(yearMonth) {
  const [year, month] = yearMonth.split('-')
  return `${MONTHS_LONG[Number(month) - 1]} ${year}`
}

// Para búsquedas sin tildes ni mayúsculas
export const normalizeText = (text) =>
  text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
