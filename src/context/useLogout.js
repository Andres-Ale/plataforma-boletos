import { useCallback } from 'react'
import { useAuth } from './contexts'
import { useCart } from './contexts'

// Cerrar sesión coordina dos contextos: sesión y carrito (el carrito se vacía al salir)
export default function useLogout() {
  const { logout } = useAuth()
  const { clear } = useCart()
  return useCallback(() => {
    logout()
    clear()
  }, [logout, clear])
}
