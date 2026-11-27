import { Link, useNavigate } from 'react-router'
import Button from '../components/Button'
import Icon from '../components/Icon'
import OrderSummary from '../components/OrderSummary'
import StepIndicator from '../components/StepIndicator'
import { EmptyState } from '../components/StatusViews'
import { useCart } from '../context/contexts'
import { useCatalog } from '../context/contexts'
import { formatPrice, formatShortDate } from '../utils/format'
import { getSeatPrice, getSeatZone, sortSeats, ZONES } from '../utils/seats'

// Carrito (/carrito): revisión de asientos y resumen antes de pagar. Es público; el pago exige sesión.
function CartPage() {
  const { cart, removeSeat, clear } = useCart()
  const { events } = useCatalog()
  const navigate = useNavigate()
  const event = events.find((e) => e.id === cart.eventId)

  if (!event || cart.seats.length === 0) {
    return (
      <div className="page container">
        <EmptyState
          title="Tu carrito está vacío"
          text="Elige un evento y selecciona tus asientos para comprar."
          actionLabel="Explorar eventos"
          onAction={() => navigate('/eventos')}
        />
      </div>
    )
  }

  return (
    <div className="page container">
      <div className="step-wrap"><StepIndicator current={2} /></div>
      <h1 className="page__title">Tu carrito</h1>

      <p className="cart-page__event">
        <Link to={`/eventos/${event.id}`}>{event.title}</Link> · {formatShortDate(event.date)} · {event.venue}
      </p>

      <ul className="cart-lines" aria-label="Asientos seleccionados">
        {sortSeats(cart.seats).map((id) => (
          <li key={id}>
            <span>Asiento {id} · {ZONES[getSeatZone(id)].name}</span>
            <span className="cart-lines__price">{formatPrice(getSeatPrice(event, id))}</span>
            <button type="button" onClick={() => removeSeat(id)} aria-label={`Quitar asiento ${id}`}>
              <Icon name="trash" size={16} />
            </button>
          </li>
        ))}
      </ul>

      <OrderSummary event={event} seats={cart.seats} title="Resumen de compra" />

      <div className="cart-page__actions">
        <Button as={Link} to={`/eventos/${event.id}/asientos`} variant="outline" size="sm">
          <Icon name="arrowLeft" size={16} />
          Cambiar asientos
        </Button>
        <Button variant="light" size="sm" onClick={clear}>Vaciar carrito</Button>
        <Button as={Link} to="/checkout">
          Ir a pagar
          <Icon name="arrowRight" size={18} />
        </Button>
      </div>
    </div>
  )
}

export default CartPage
