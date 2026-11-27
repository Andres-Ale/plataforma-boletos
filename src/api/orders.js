import { ApiError, delay } from './client'
import { addLocalOrder, loadEvents, loadOrders } from './store'
import { getTakenSeats } from '../utils/seats'
import { buildOrder } from '../utils/orders'

// GET /orders
export async function listOrders({ signal } = {}) {
  await delay(400, signal)
  return loadOrders(signal)
}

// POST /orders: revalida la disponibilidad y guarda la orden (nunca datos de tarjeta)
export async function createOrder({ eventId, seats, user, method }, { signal } = {}) {
  await delay(500, signal)
  const [events, orders] = await Promise.all([loadEvents(signal), loadOrders(signal)])
  const event = events.find((e) => e.id === eventId)
  if (!event) throw new ApiError('Este evento ya no está disponible.')

  const taken = getTakenSeats(event, orders)
  if (seats.some((id) => taken.has(id))) {
    throw new ApiError('Algunos asientos ya no están disponibles. Vuelve al mapa y elige otros.')
  }
  const order = buildOrder({ event, seats, user, method, orders })
  addLocalOrder(order)
  return order
}

// GET /orders/:code  (verificación del QR)
export async function getOrderByCode(code, { signal } = {}) {
  await delay(500, signal)
  const normalized = (code || '').trim().toUpperCase()
  const [orders, events] = await Promise.all([loadOrders(signal), loadEvents(signal)])
  const order = orders.find((o) => o.id.toUpperCase() === normalized)
  if (!order) return null
  return { order, event: events.find((e) => e.id === order.eventId) ?? null }
}
