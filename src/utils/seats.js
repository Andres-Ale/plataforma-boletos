// Lógica del mapa de asientos, precios y disponibilidad.
// Todo lo que se muestra (desde $, disponibles, totales) se CALCULA aquí
// a partir de los datos, para que ninguna pantalla se contradiga.

export const MAX_SEATS = 8

export const ZONES = {
  vip: { name: 'VIP Numerado', label: 'V.I.P.' },
  diamante: { name: 'Diamante', label: 'Diamante' },
  palco: { name: 'Palco', label: 'Palco' },
}

const range = (prefix, from, to) =>
  Array.from({ length: to - from + 1 }, (_, i) => `${prefix}${from + i}`)

// Orden visual del mapa (Palco A y B se dibujan de arriba hacia abajo: 4 → 1)
export const SEAT_LAYOUT = {
  vip: range('V', 1, 7),
  diamante: range('D', 1, 14),
  palcoA: range('A', 1, 4).reverse(),
  palcoB: range('B', 1, 4).reverse(),
  palcoC: range('C', 1, 7),
}

export const ALL_SEATS = Object.values(SEAT_LAYOUT).flat()

export const STATUS_LABEL = {
  available: 'Disponible',
  soldout: 'Agotado',
  past: 'Finalizado',
}

export function getSeatZone(seatId) {
  if (seatId.startsWith('V')) return 'vip'
  if (seatId.startsWith('D')) return 'diamante'
  return 'palco'
}

export const getSeatPrice = (event, seatId) => event.prices[getSeatZone(seatId)]

export const getMinPrice = (event) => Math.min(...Object.values(event.prices))

export const sortSeats = (seats) =>
  [...seats].sort((a, b) => ALL_SEATS.indexOf(a) - ALL_SEATS.indexOf(b))

// Asientos no disponibles = los ocupados de base + los vendidos en órdenes locales
export function getTakenSeats(event, orders) {
  const sold = orders.filter((o) => o.eventId === event.id).flatMap((o) => o.seats)
  return new Set([...event.occupied, ...sold])
}

export const getAvailableCount = (event, orders) =>
  ALL_SEATS.length - getTakenSeats(event, orders).size

export function getEventStatus(event, orders) {
  if (new Date(event.date) < new Date()) return 'past'
  return getAvailableCount(event, orders) === 0 ? 'soldout' : 'available'
}

export const getSeatsTotal = (event, seats) =>
  seats.reduce((sum, id) => sum + getSeatPrice(event, id), 0)

export function groupSeatsByZone(event, seats) {
  const sorted = sortSeats(seats)
  return Object.keys(ZONES)
    .map((zone) => {
      const ids = sorted.filter((id) => getSeatZone(id) === zone)
      return { zone, seats: ids, subtotal: ids.length * event.prices[zone] }
    })
    .filter((group) => group.seats.length > 0)
}
