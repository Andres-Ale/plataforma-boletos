import { EVENTS } from '../data/events'

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// Carga simulada de eventos.
// Para mostrar el estado de error en la demo: abrir la app con  /?fail
// (falla la primera vez y funciona al pulsar "Reintentar").
export async function fetchEvents(attempt = 0) {
  await delay(800)
  if (attempt === 0 && new URLSearchParams(window.location.search).has('fail')) {
    throw new Error('No pudimos cargar los eventos. Revisa tu conexión e inténtalo de nuevo.')
  }
  return EVENTS
}

// Pago simulado. Una tarjeta que termina en 0000 simula un pago rechazado.
export async function processPayment({ method, cardNumber }) {
  await delay(1800)
  if (method === 'card' && cardNumber.replace(/\s/g, '').endsWith('0000')) {
    throw new Error('Tu banco rechazó el pago. Verifica los datos o prueba con otra tarjeta.')
  }
  return { ok: true }
}
