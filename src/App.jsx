import { RouterProvider } from 'react-router/dom'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { CatalogProvider } from './context/CatalogContext'
import router from './router'

// Raíz de la aplicación: providers de estado global + enrutador (React Router en modo datos).
// Los providers están por fuera del router; las rutas los consumen con useAuth, useCart y useCatalog.
function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <CatalogProvider>
          <RouterProvider router={router} />
        </CatalogProvider>
      </CartProvider>
    </AuthProvider>
  )
}

export default App
