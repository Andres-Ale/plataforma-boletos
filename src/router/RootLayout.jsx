import { useEffect, useRef, useState } from 'react'
import { Outlet, useLocation, useMatches, useNavigate } from 'react-router'
import Header from '../components/Header'
import Footer from '../components/Footer'
import CartPanel from '../components/CartPanel'
import PwaPrompts from '../components/PwaPrompts'
import { useCart } from '../context/contexts'
import { useCatalog } from '../context/contexts'

// Layout compartido por todas las rutas: encabezado, carrito lateral, contenido y pie de página.
function RootLayout() {
  const [cartOpen, setCartOpen] = useState(false)
  const { cart, removeSeat } = useCart()
  const { events } = useCatalog()
  const location = useLocation()
  const matches = useMatches()
  const navigate = useNavigate()
  const mainRef = useRef(null)

  // Al cambiar de ruta: arriba del todo (salvo enlaces con #ancla) y foco al contenido
  useEffect(() => {
    if (!location.hash) window.scrollTo(0, 0)
    mainRef.current?.focus({ preventScroll: true })
  }, [location.pathname, location.hash])

  // Título de la pestaña según la ruta (handle.title en el router)
  const title = [...matches].reverse().find((m) => m.handle?.title)?.handle.title
  useEffect(() => {
    document.title = `${title ?? 'Easy Ticket'} | Easy Ticket`
  }, [title])

  const cartEvent = events.find((e) => e.id === cart.eventId)

  const goToCart = () => {
    setCartOpen(false)
    navigate('/carrito')
  }

  return (
    <>
      <a
        className="skip-link"
        href="#contenido"
        onClick={(e) => {
          e.preventDefault()
          mainRef.current?.focus()
        }}
      >
        Saltar al contenido
      </a>

      <PwaPrompts />
      <Header onCartClick={() => setCartOpen((open) => !open)} />

      <CartPanel
        open={cartOpen}
        event={cartEvent}
        seats={cart.seats}
        onClose={() => setCartOpen(false)}
        onRemoveSeat={removeSeat}
        onCheckout={goToCart}
      />

      <main id="contenido" ref={mainRef} tabIndex={-1}>
        <Outlet />
      </main>

      <Footer />
    </>
  )
}

export default RootLayout
