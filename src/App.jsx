import { useCallback, useEffect, useRef, useState } from 'react'
import Header from './components/Header'
import Footer from './components/Footer'
import CartPanel from './components/CartPanel'
import { EmptyState, ErrorMessage, LoadingState } from './components/StatusViews'
import AdminPage from './pages/AdminPage'
import EventsPage from './pages/EventsPage'
import EventDetailPage from './pages/EventDetailPage'
import SeatsPage from './pages/SeatsPage'
import PaymentPage from './pages/PaymentPage'
import ConfirmationPage from './pages/ConfirmationPage'
import MyTicketsPage from './pages/MyTicketsPage'
import HelpPage from './pages/HelpPage'
import LoginPage from './pages/LoginPage'
import ProfilePage from './pages/ProfilePage'
import useAsync from './hooks/useAsync'
import useLocalStorage from './hooks/useLocalStorage'
import { fetchEvents } from './utils/fakeApi'
import { buildOrder } from './utils/orders'
import { logoutUser } from './services/auth'
import { getEventStatus, getTakenSeats } from './utils/seats'

// Vistas que exigen sesión iniciada
const PROTECTED_VIEWS = ['seats', 'payment', 'confirmation', 'tickets', 'profile', 'admin']
// Vistas que necesitan los eventos ya cargados
const NEEDS_EVENTS = ['detail', 'seats', 'payment', 'confirmation', 'tickets', 'admin']

const EMPTY_CART = { eventId: null, seats: [] }

const TITLES = {
  events: 'Eventos',
  detail: 'Detalle del evento',
  seats: 'Selección de asientos',
  payment: 'Pago',
  confirmation: 'Compra exitosa',
  tickets: 'Mis boletos',
  help: 'Ayuda',
  login: 'Iniciar sesión',
  register: 'Crear cuenta',
  profile: 'Mi perfil',
  admin: 'Panel de administración',
}

function App() {
  // ---- Estado elevado: vista actual, sesión, carrito y órdenes ----
  const [view, setView] = useState({ name: 'events', params: {} })
  const [user, setUser] = useLocalStorage('et_user', null)
  const [cart, setCart] = useLocalStorage('et_cart', EMPTY_CART)
  const [orders, setOrders] = useLocalStorage('et_orders', [])
  const [cartOpen, setCartOpen] = useState(false)

  const { data: events, status, error, reload } = useAsync(fetchEvents)
  const mainRef = useRef(null)

  // ---- Navegación por estado de vista (sin React Router) ----
  const navigate = useCallback(
    (name, params = {}) => {
      setCartOpen(false)
      if (PROTECTED_VIEWS.includes(name) && !user) {
        setView({ name: 'login', params: { next: { name, params } } })
        return
      }
      setView({ name, params })
    },
    [user],
  )

  // Al cambiar de vista: arriba del todo, foco al contenido y título de la pestaña
  useEffect(() => {
    if (!view.params.scrollTo) window.scrollTo(0, 0)
    mainRef.current?.focus({ preventScroll: true })
    document.title = `${TITLES[view.name] ?? 'Easy Ticket'} | Easy Ticket`
  }, [view])

  // ---- Sesión ----
  const handleLogin = (loggedUser) => {
    setUser(loggedUser)
    const next = view.params.next
    setView(next ? { name: next.name, params: next.params } : { name: 'events', params: {} })
  }

  const handleLogout = () => {
    logoutUser()
    setUser(null)
    setCart(EMPTY_CART)
    setView({ name: 'events', params: {} })
  }

  // ProfileView avisa con el usuario actualizado, o con null si cerró sesión
  const handleUserChange = (updated) => {
    if (updated) setUser((prev) => ({ ...prev, ...updated }))
    else handleLogout()
  }

  // ---- Carrito: un solo evento a la vez; los totales se derivan ----
  const toggleSeat = (eventId, seatId) => {
    setCart((prev) => {
      const current = prev.eventId === eventId ? prev.seats : []
      const seats = current.includes(seatId) ? current.filter((s) => s !== seatId) : [...current, seatId]
      return { eventId: seats.length > 0 ? eventId : null, seats }
    })
  }

  // ---- Compra: revalida disponibilidad y crea la orden (sin datos de tarjeta) ----
  const handlePaid = (event, method) => {
    const taken = getTakenSeats(event, orders)
    if (cart.seats.some((id) => taken.has(id))) {
      return { ok: false, message: 'Algunos asientos ya no están disponibles. Vuelve al mapa y elige otros.' }
    }
    const order = buildOrder({ event, seats: cart.seats, user, method, orders })
    setOrders((prev) => [...prev, order])
    setCart(EMPTY_CART)
    setView({ name: 'confirmation', params: { orderId: order.id } })
    return { ok: true }
  }

  // ---- Qué se muestra ----
  const renderView = () => {
    const { name, params } = view

    if (name === 'events') {
      return (
        <EventsPage
          events={events}
          status={status}
          error={error}
          onRetry={reload}
          orders={orders}
          scrollTo={params.scrollTo}
          onSelectEvent={(id) => navigate('detail', { eventId: id })}
        />
      )
    }
    if (name === 'help') return <HelpPage />
    if (name === 'login' || name === 'register') {
      return <LoginPage initialMode={name} onLogin={handleLogin} onNavigate={navigate} />
    }
    if (name === 'profile') return <ProfilePage user={user} onUserChange={handleUserChange} onNavigate={navigate} />

    if (NEEDS_EVENTS.includes(name)) {
      if (status === 'loading') return <div className="container"><LoadingState message="Cargando..." /></div>
      if (status === 'error') return <div className="container"><ErrorMessage message={error} onRetry={reload} /></div>
    } else {
      return (
        <div className="container">
          <EmptyState
            title="Sección en construcción"
            text="Esta pantalla todavía no está disponible."
            actionLabel="Volver a eventos"
            onAction={() => navigate('events')}
          />
        </div>
      )
    }

    if (name === 'admin') {
  return (
    <AdminPage
      user={user}
      events={events}
      orders={orders}
      onSelectEvent={(id) => navigate('detail', { eventId: id })}
      onGoEvents={() => navigate('events')}
    />
  )
}

    const event = events.find((e) => e.id === params.eventId)
    const goEvents = () => navigate('events')

    if (name === 'tickets') {
      const mine = orders.filter((o) => o.userId === user?.id)
      return <MyTicketsPage orders={mine} events={events} onGoEvents={goEvents} />
    }

    if (name === 'confirmation') {
      const order = orders.find((o) => o.id === params.orderId)
      const orderEvent = order && events.find((e) => e.id === order.eventId)
      return <ConfirmationPage order={order} event={orderEvent} onViewTickets={() => navigate('tickets')} onGoEvents={goEvents} />
    }

    if (!event) {
      return (
        <div className="container">
          <EmptyState title="Evento no encontrado" actionLabel="Ver eventos" onAction={goEvents} />
        </div>
      )
    }

    const eventStatus = getEventStatus(event, orders)
    const selectedSeats = cart.eventId === event.id ? cart.seats : []

    if (name === 'detail') {
      return (
        <EventDetailPage
          event={event}
          status={eventStatus}
          onBack={goEvents}
          onSelectSeats={() => navigate('seats', { eventId: event.id })}
        />
      )
    }

    if (name === 'seats') {
      return (
        <SeatsPage
          event={event}
          status={eventStatus}
          takenSeats={getTakenSeats(event, orders)}
          selectedSeats={selectedSeats}
          onToggleSeat={(seatId) => toggleSeat(event.id, seatId)}
          onBack={() => navigate('detail', { eventId: event.id })}
          onContinue={() => navigate('payment', { eventId: event.id })}
        />
      )
    }

    // payment
    return (
      <PaymentPage
        event={event}
        seats={selectedSeats}
        user={user}
        onBack={() => navigate('seats', { eventId: event.id })}
        onGoEvents={goEvents}
        onPaid={(method) => handlePaid(event, method)}
      />
    )
  }

  const cartEvent = events?.find((e) => e.id === cart.eventId)

  return (
    <>
      <a className="skip-link" href="#contenido" onClick={(e) => { e.preventDefault(); mainRef.current?.focus() }}>
        Saltar al contenido
      </a>

      <Header
        user={user}
        cartCount={cart.seats.length}
        currentView={view.name}
        onNavigate={navigate}
        onLogout={handleLogout}
        onCartClick={() => setCartOpen((open) => !open)}
      />

      <CartPanel
        open={cartOpen}
        event={cartEvent}
        seats={cart.seats}
        onClose={() => setCartOpen(false)}
        onRemoveSeat={(seatId) => toggleSeat(cart.eventId, seatId)}
        onCheckout={() => navigate('payment', { eventId: cart.eventId })}
      />

      <main id="contenido" ref={mainRef} tabIndex={-1}>
        {renderView()}
      </main>

      <Footer />
    </>
  )
}

export default App
