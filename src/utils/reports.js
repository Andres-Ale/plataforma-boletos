// Cálculo de métricas y reportes. Todo se DERIVA de los eventos y las órdenes (nada se guarda duplicado).
import { ALL_SEATS, ZONES, getSeatPrice, getSeatZone, getTakenSeats } from './seats'

// Líneas de una orden: usa los precios del momento de la compra (items) o, en órdenes antiguas, los precios actuales
export const orderItems = (order, event) =>
  order.items ??
  order.seats.map((seat) => ({ seat, zone: getSeatZone(seat), price: event ? getSeatPrice(event, seat) : 0 }))

// Filtra por evento y por periodo (fechas "YYYY-MM-DD" incluyentes)
export function filterOrders(orders, { eventId = '', from = '', to = '' } = {}) {
  const start = from ? new Date(`${from}T00:00:00`) : null
  const end = to ? new Date(`${to}T23:59:59.999`) : null
  return orders.filter((order) => {
    if (eventId && order.eventId !== eventId) return false
    const date = new Date(order.createdAt)
    return (!start || date >= start) && (!end || date <= end)
  })
}

export function summarize(orders) {
  const revenue = orders.reduce((sum, o) => sum + o.total, 0)
  const tickets = orders.reduce((sum, o) => sum + o.seats.length, 0)
  return { revenue, tickets, count: orders.length, average: orders.length ? revenue / orders.length : 0 }
}

export function groupByEvent(orders, events) {
  return events
    .map((event) => {
      const own = orders.filter((o) => o.eventId === event.id)
      const { revenue, tickets, count } = summarize(own)
      return { event, revenue, tickets, count }
    })
    .filter((row) => row.count > 0)
    .sort((a, b) => b.revenue - a.revenue)
}

export function groupByCategory(orders, events) {
  const rows = new Map()
  orders.forEach((order) => {
    const event = events.find((e) => e.id === order.eventId)
    const key = event?.category ?? 'Evento eliminado'
    const row = rows.get(key) ?? { category: key, revenue: 0, tickets: 0 }
    row.revenue += order.total
    row.tickets += order.seats.length
    rows.set(key, row)
  })
  return [...rows.values()].sort((a, b) => b.revenue - a.revenue)
}

export function groupByZone(orders, events) {
  const result = Object.fromEntries(Object.keys(ZONES).map((zone) => [zone, { tickets: 0, revenue: 0 }]))
  orders.forEach((order) => {
    const event = events.find((e) => e.id === order.eventId)
    orderItems(order, event).forEach((item) => {
      result[item.zone].tickets += 1
      result[item.zone].revenue += item.price
    })
  })
  return result
}

// Agrupa por día o por mes (según el tamaño del periodo) en orden cronológico
export function groupByPeriod(orders, unit) {
  const size = unit === 'month' ? 7 : 10
  const rows = new Map()
  orders.forEach((order) => {
    const key = order.createdAt.slice(0, size)
    const row = rows.get(key) ?? { key, revenue: 0, tickets: 0 }
    row.revenue += order.total
    row.tickets += order.seats.length
    rows.set(key, row)
  })
  return [...rows.values()].sort((a, b) => a.key.localeCompare(b.key))
}

// Si el periodo abarca más de 45 días se agrupa por mes; si no, por día
export function chooseUnit(orders) {
  if (orders.length === 0) return 'day'
  const times = orders.map((o) => new Date(o.createdAt).getTime())
  const days = (Math.max(...times) - Math.min(...times)) / 86_400_000
  return days > 45 ? 'month' : 'day'
}

export function occupancy(event, orders) {
  const taken = getTakenSeats(event, orders).size
  return { taken, total: ALL_SEATS.length, percent: Math.round((taken / ALL_SEATS.length) * 100) }
}

// CSV (con BOM para que Excel respete los acentos)
export function ordersToCsv(orders, events) {
  const header = ['Código', 'Fecha', 'Evento', 'Cliente', 'Boletos', 'Total (USD)', 'Método']
  const lines = orders.map((o) => {
    const title = events.find((e) => e.id === o.eventId)?.title ?? 'Evento eliminado'
    return [o.id, o.createdAt.slice(0, 10), title, o.userName, o.seats.length, o.total.toFixed(2), o.method]
      .map((cell) => `"${String(cell).replaceAll('"', '""')}"`)
      .join(',')
  })
  return `\uFEFF${[header.join(','), ...lines].join('\n')}`
}
