import { ApiError, delay } from './client'
import { loadEvents, loadOrders, saveEvents } from './store'
import { validateEvent } from '../utils/validation'

const LATENCY = 600

// Simula un fallo de red solo la primera vez si la URL trae ?fail (para demostrar el error + reintento)
let failedOnce = false
function maybeFail() {
  if (!failedOnce && new URLSearchParams(window.location.search).has('fail')) {
    failedOnce = true
    throw new ApiError('No pudimos cargar los eventos. Revisa tu conexión e inténtalo de nuevo.')
  }
}

// GET /events
export async function listEvents({ signal } = {}) {
  await delay(LATENCY, signal)
  maybeFail()
  return loadEvents(signal)
}

const slugify = (text) =>
  text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

function uniqueId(title, events) {
  const base = slugify(title) || 'evento'
  let id = base
  let n = 2
  while (events.some((e) => e.id === id)) id = `${base}-${n++}`
  return id
}

function assertValid(data) {
  const errors = validateEvent(data)
  if (Object.keys(errors).length > 0) {
    throw new ApiError('Revisa los datos del evento.', { fields: errors })
  }
}

const normalize = (data) => ({
  title: data.title.trim(),
  subtitle: (data.subtitle || '').trim(),
  kind: data.kind,
  category: data.category.trim(),
  date: data.date,
  venue: data.venue.trim(),
  city: (data.city || '').trim(),
  duration: (data.duration || '').trim(),
  rating: (data.rating || '').trim(),
  synopsis: (data.synopsis || '').trim(),
  prices: {
    vip: Number(data.prices.vip),
    diamante: Number(data.prices.diamante),
    palco: Number(data.prices.palco),
  },
  image: data.image,
})

// POST /events
export async function createEvent(data, { signal } = {}) {
  await delay(400, signal)
  assertValid(data)
  const events = await loadEvents(signal)
  const event = { id: uniqueId(data.title, events), ...normalize(data), occupied: [] }
  saveEvents([...events, event])
  return event
}

// PUT /events/:id  (datos generales, precios, asientos bloqueados)
export async function updateEvent(id, patch, { signal } = {}) {
  await delay(400, signal)
  const events = await loadEvents(signal)
  const current = events.find((e) => e.id === id)
  if (!current) throw new ApiError('El evento ya no existe.')

  let next
  if (patch.occupied) {
    // Edición de inventario: solo precios y asientos bloqueados
    const prices = { ...current.prices, ...(patch.prices || {}) }
    const bad = Object.values(prices).some((p) => !Number.isFinite(Number(p)) || Number(p) <= 0)
    if (bad) throw new ApiError('Los precios deben ser números mayores que cero.')
    next = { ...current, prices: Object.fromEntries(Object.entries(prices).map(([k, v]) => [k, Number(v)])), occupied: patch.occupied }
  } else {
    assertValid({ ...current, ...patch })
    next = { ...current, ...normalize({ ...current, ...patch }) }
  }
  saveEvents(events.map((e) => (e.id === id ? next : e)))
  return next
}

// DELETE /events/:id  (no se permite si ya hay boletos vendidos, para no dejar órdenes huérfanas)
export async function deleteEvent(id, { signal } = {}) {
  await delay(400, signal)
  const [events, orders] = await Promise.all([loadEvents(signal), loadOrders(signal)])
  if (!events.some((e) => e.id === id)) throw new ApiError('El evento ya no existe.')
  const sold = orders.filter((o) => o.eventId === id).length
  if (sold > 0) {
    throw new ApiError(`No se puede eliminar: el evento tiene ${sold} compra(s) registrada(s).`)
  }
  saveEvents(events.filter((e) => e.id !== id))
  return { id }
}
