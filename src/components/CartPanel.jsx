import { useEffect } from 'react'
import Button from './Button'
import Icon from './Icon'
import { formatPrice } from '../utils/format'
import { getSeatPrice, getSeatsTotal, sortSeats, ZONES, getSeatZone } from '../utils/seats'
import './CartPanel.css'

function CartPanel({ open, event, seats, onClose, onRemoveSeat, onCheckout }) {
  useEffect(() => {
    if (!open) return undefined
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  if (!open) return null

  const isEmpty = !event || seats.length === 0

  return (
    <aside className="cart-panel" role="dialog" aria-label="Carrito de compra">
      <div className="cart-panel__head">
        <h2>Tu carrito</h2>
        <button type="button" className="cart-panel__close" onClick={onClose} aria-label="Cerrar carrito">
          <Icon name="close" size={20} />
        </button>
      </div>

      {isEmpty ? (
        <p className="cart-panel__empty">Tu carrito está vacío. Elige un evento y selecciona tus asientos.</p>
      ) : (
        <>
          <p className="cart-panel__event">{event.title}</p>
          <ul className="cart-panel__list">
            {sortSeats(seats).map((id) => (
              <li key={id}>
                <span>
                  Asiento {id} · {ZONES[getSeatZone(id)].name}
                </span>
                <span className="cart-panel__price">{formatPrice(getSeatPrice(event, id))}</span>
                <button type="button" onClick={() => onRemoveSeat(id)} aria-label={`Quitar asiento ${id}`}>
                  <Icon name="trash" size={16} />
                </button>
              </li>
            ))}
          </ul>
          <p className="cart-panel__total">
            <span>Total</span>
            <strong>{formatPrice(getSeatsTotal(event, seats))}</strong>
          </p>
          <Button block onClick={onCheckout}>Ir a pagar</Button>
        </>
      )}
    </aside>
  )
}

export default CartPanel
