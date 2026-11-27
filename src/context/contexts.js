import { createContext, useContext } from 'react'

export const ROLES = { admin: 'administrador', organizer: 'organizador', client: 'cliente' }

export const AuthContext = createContext(null)
export const CartContext = createContext(null)
export const CatalogContext = createContext(null)

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return context
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart debe usarse dentro de <CartProvider>')
  return context
}

export function useCatalog() {
  const context = useContext(CatalogContext)
  if (!context) throw new Error('useCatalog debe usarse dentro de <CatalogProvider>')
  return context
}
