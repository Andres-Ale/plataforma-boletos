import { ApiError, delay } from './client'
import { loadUsers, saveUsers } from './store'

export const DEMO_PASSWORD = 'Password123!'

// Cuentas de demostración (se muestran en la pantalla de login; coinciden con public/api/users.json)
export const DEMO_ACCOUNTS = [
  { name: 'Luis Pacheco', email: 'luis.pacheco@easyticket.com', role: 'cliente' },
  { name: 'Andrés Ale', email: 'andres.ale@easyticket.com', role: 'administrador' },
  { name: 'Carlos Rivera', email: 'carlos.rivera@easyticket.com', role: 'organizador' },
]

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
export const isValidEmail = (email) => EMAIL_RE.test((email || '').trim())

const EMAIL_HINT = 'Ingresa un correo electrónico válido, por ejemplo nombre@correo.com.'

// La sesión solo lleva los datos públicos (nunca la contraseña)
const toSession = ({ id, name, email, role }) => ({ id, name, email, role: role ?? 'cliente' })

// POST /auth/login
export async function login({ email, password }, { signal } = {}) {
  await delay(600, signal)
  const normalized = (email || '').trim().toLowerCase()
  if (!normalized || !password) throw new ApiError('Completa tu correo electrónico y contraseña.')
  if (!isValidEmail(normalized)) throw new ApiError(EMAIL_HINT)

  const users = await loadUsers(signal)
  const found = users.find((u) => u.email.toLowerCase() === normalized && u.password === password)
  if (!found) throw new ApiError('Correo o contraseña incorrectos.')
  return toSession(found)
}

// POST /auth/register
export async function register({ name, email, password }, { signal } = {}) {
  await delay(600, signal)
  const cleanName = (name || '').trim()
  const normalized = (email || '').trim().toLowerCase()
  if (!cleanName) throw new ApiError('Ingresa tu nombre completo.')
  if (!isValidEmail(normalized)) throw new ApiError(EMAIL_HINT)
  if (!password || password.length < 6) throw new ApiError('La contraseña debe tener al menos 6 caracteres.')

  const users = await loadUsers(signal)
  if (users.some((u) => u.email.toLowerCase() === normalized)) {
    throw new ApiError('Ya existe una cuenta registrada con ese correo.')
  }
  const newUser = { id: `usr-${Date.now()}`, name: cleanName, email: normalized, password, role: 'cliente' }
  saveUsers([...users, newUser])
  return toSession(newUser)
}

// PUT /users/:id
export async function updateProfile(userId, { name, email }, { signal } = {}) {
  await delay(500, signal)
  const cleanName = (name || '').trim()
  const normalized = (email || '').trim().toLowerCase()
  if (!cleanName || !normalized) throw new ApiError('Nombre y correo son obligatorios.')
  if (!isValidEmail(normalized)) throw new ApiError(EMAIL_HINT)

  const users = await loadUsers(signal)
  if (users.some((u) => u.id !== userId && u.email.toLowerCase() === normalized)) {
    throw new ApiError('Ese correo ya está en uso por otra cuenta.')
  }
  saveUsers(users.map((u) => (u.id === userId ? { ...u, name: cleanName, email: normalized } : u)))
  return { name: cleanName, email: normalized }
}

// Recuperación de contraseña simulada: no envía correos y no revela si la cuenta existe.
export async function requestPasswordReset(email, { signal } = {}) {
  if (!isValidEmail(email)) throw new ApiError(EMAIL_HINT)
  await delay(1200, signal)
  return { ok: true }
}
