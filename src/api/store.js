// "Base de datos" de la API falsa.
//  - Eventos y usuarios: el JSON semilla se lee con fetch; en cuanto hay una escritura,
//    la lista completa se guarda en localStorage y pasa a ser la fuente de verdad.
//  - Órdenes: el JSON semilla (historial) + las órdenes nuevas guardadas en localStorage.
import { fetchJson, readLocal, writeLocal } from './client'

export const KEYS = {
  events: 'et_events',
  orders: 'et_orders',
  users: 'et_users',
}

export async function loadEvents(signal) {
  const local = readLocal(KEYS.events, null)
  if (Array.isArray(local)) return local
  return fetchJson('api/events.json', { signal })
}
export const saveEvents = (events) => writeLocal(KEYS.events, events)

export async function loadOrders(signal) {
  const seed = await fetchJson('api/orders.json', { signal })
  const local = readLocal(KEYS.orders, [])
  return [...seed, ...(Array.isArray(local) ? local : [])]
}
export function addLocalOrder(order) {
  const local = readLocal(KEYS.orders, [])
  writeLocal(KEYS.orders, [...(Array.isArray(local) ? local : []), order])
}

export async function loadUsers(signal) {
  const local = readLocal(KEYS.users, null)
  if (Array.isArray(local)) return local
  return fetchJson('api/users.json', { signal })
}
export const saveUsers = (users) => writeLocal(KEYS.users, users)
