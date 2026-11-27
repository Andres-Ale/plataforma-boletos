import { ApiError, delay } from './client'

// Pago simulado. Una tarjeta que termina en 0000 simula un pago rechazado.
export async function processPayment({ method, cardNumber }, { signal } = {}) {
  await delay(1800, signal)
  if (method === 'card' && cardNumber.replace(/\s/g, '').endsWith('0000')) {
    throw new ApiError('Tu banco rechazó el pago. Verifica los datos o prueba con otra tarjeta.')
  }
  return { ok: true }
}
