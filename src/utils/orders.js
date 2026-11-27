import { BASE } from '../api/client'
import { getSeatPrice, getSeatsTotal, getSeatZone, sortSeats } from './seats'

function generateOrderId(existingOrders) {
  let id
  do {
    id = `ET-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`
  } while (existingOrders.some((order) => order.id === id))
  return id
}

// Nunca se guardan datos de tarjeta: solo el método usado.
export function buildOrder({ event, seats, user, method, orders }) {
  return {
    id: generateOrderId(orders),
    eventId: event.id,
    seats: sortSeats(seats),
    total: getSeatsTotal(event, seats),
    // Precio de cada asiento al momento de la compra (los reportes no cambian si luego se editan los precios)
    items: sortSeats(seats).map((seat) => ({ seat, zone: getSeatZone(seat), price: getSeatPrice(event, seat) })),
    method,
    userId: user.id,
    userName: user.name,
    userEmail: user.email,
    createdAt: new Date().toISOString(),
  }
}

// URL que codifica el QR: abre la página de verificación del boleto (funciona con el `base` de GitHub Pages)
export const buildVerifyUrl = (orderId) => `${window.location.origin}${BASE}verificar/${encodeURIComponent(orderId)}`
