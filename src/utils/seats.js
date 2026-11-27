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

// ---- Inventario por zona (panel administrativo) ----
// Los asientos de cada zona (Palco reúne A, B y C)
export const ZONE_SEATS = {
  vip: SEAT_LAYOUT.vip,
  diamante: SEAT_LAYOUT.diamante,
  palco: [...SEAT_LAYOUT.palcoA, ...SEAT_LAYOUT.palcoB, ...SEAT_LAYOUT.palcoC],
}

export const getSoldSeats = (event, orders) =>
  new Set(orders.filter((o) => o.eventId === event.id).flatMap((o) => o.seats))

// Capacidad, vendidos (por órdenes), bloqueados (por el administrador) y disponibles de una zona
export function getZoneStats(event, orders, zone) {
  const sold = getSoldSeats(event, orders)
  const seats = ZONE_SEATS[zone]
  const soldCount = seats.filter((id) => sold.has(id)).length
  const blockedCount = seats.filter((id) => !sold.has(id) && event.occupied.includes(id)).length
  return {
    capacity: seats.length,
    sold: soldCount,
    blocked: blockedCount,
    available: seats.length - soldCount - blockedCount,
  }
}

// Devuelve la nueva lista de asientos bloqueados para que la zona quede con `available` libres.
// Nunca toca asientos ya vendidos.
export function setZoneAvailability(event, orders, zone, available) {
  const sold = getSoldSeats(event, orders)
  const freeable = ZONE_SEATS[zone].filter((id) => !sold.has(id))
  const target = Math.min(Math.max(0, Math.floor(available)), freeable.length)
  const toBlock = new Set(freeable.slice(target)) // se bloquean los últimos de la zona
  const otherZones = event.occupied.filter((id) => getSeatZone(id) !== zone)
  return [...otherZones, ...toBlock]
}
