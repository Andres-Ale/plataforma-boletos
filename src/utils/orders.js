import { getSeatsTotal, sortSeats } from './seats'

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
    method,
    userId: user.id,
    userName: user.name,
    userEmail: user.email,
    createdAt: new Date().toISOString(),
  }
}
