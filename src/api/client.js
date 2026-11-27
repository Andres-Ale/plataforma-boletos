// Utilidades de la API falsa: latencia simulada, lectura de JSON y errores uniformes.
// No hay backend: los datos "semilla" son archivos JSON en public/api/ y las
// escrituras se guardan en localStorage (ver store.js).

export const BASE = import.meta.env.BASE_URL

// Convierte una ruta relativa ("images/logo.png") en una URL válida con el `base` de Vite
export function assetUrl(path = '') {
  if (/^(https?:|data:|blob:)/.test(path)) return path
  return `${BASE}${path.replace(/^\//, '')}`
}

export class ApiError extends Error {
  constructor(message, { fields } = {}) {
    super(message)
    this.name = 'ApiError'
    this.fields = fields
  }
}

export const isAbortError = (err) => err?.name === 'AbortError'

function abortError() {
  return new DOMException('La operación fue cancelada', 'AbortError')
}

// Espera `ms` milisegundos; si la señal se cancela, rechaza de inmediato (sin fugas de temporizador)
export function delay(ms, signal) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(abortError())
      return
    }
    const onAbort = () => {
      clearTimeout(timer)
      reject(abortError())
    }
    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort)
      resolve()
    }, ms)
    signal?.addEventListener('abort', onAbort, { once: true })
  })
}

// Lee un JSON de public/api/. Distingue cancelación, error de red y respuesta inválida.
export async function fetchJson(path, { signal } = {}) {
  let response
  try {
    response = await fetch(assetUrl(path), { signal })
  } catch (err) {
    if (isAbortError(err)) throw err
    throw new ApiError('No pudimos conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.')
  }
  if (!response.ok) {
    throw new ApiError(`No pudimos cargar los datos (error ${response.status}).`)
  }
  try {
    return await response.json()
  } catch {
    throw new ApiError('Recibimos una respuesta inválida del servidor.')
  }
}

// ---- Persistencia local (las mutaciones de la API falsa) ----
export function readLocal(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key)
    return raw === null ? fallback : JSON.parse(raw)
  } catch {
    return fallback
  }
}

export function writeLocal(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Almacenamiento lleno o bloqueado: la app sigue funcionando sin persistir
  }
}

export function removeLocal(key) {
  try {
    window.localStorage.removeItem(key)
  } catch {
    // sin acción
  }
}
