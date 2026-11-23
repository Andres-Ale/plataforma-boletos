import { formatPrice } from '../utils/format'
import { getSeatsTotal, groupSeatsByZone, ZONES } from '../utils/seats'
import './OrderSummary.css'

// Resumen derivado: nunca guarda estado, todo se calcula de evento + asientos
function OrderSummary({ event, seats, title = 'Resumen de compra' }) {
  const groups = groupSeatsByZone(event, seats)
  const total = getSeatsTotal(event, seats)

  return (
    <section className="order-summary" aria-label={title}>
      <h2 className="order-summary__title">{title}</h2>

      {seats.length === 0 ? (
        <p className="order-summary__empty">Aún no has elegido asientos.</p>
      ) : (
        <>
          <p className="order-summary__event">{event.title}</p>
          <ul className="order-summary__list">
            {groups.map((g) => (
              <li key={g.zone}>
                <span>{ZONES[g.zone].name} (asientos: {g.seats.join(', ')})</span>
                <span>{formatPrice(g.subtotal)}</span>
              </li>
            ))}
          </ul>
        </>
      )}

      <p className="order-summary__total">
        <span>Total a pagar:</span>
        <strong>{formatPrice(total)}</strong>
      </p>
    </section>
  )
}

export default OrderSummary
