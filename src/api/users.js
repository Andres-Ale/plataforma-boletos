import { delay } from './client'
import { loadUsers } from './store'

// GET /users  (sin contraseñas)
export async function listUsers({ signal } = {}) {
  await delay(400, signal)
  const users = await loadUsers(signal)
  return users.map(({ password: _password, ...publicData }) => ({ ...publicData, role: publicData.role ?? 'cliente' }))
}
