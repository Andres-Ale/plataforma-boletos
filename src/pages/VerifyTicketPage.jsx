import { useCallback } from 'react'
import { Link, useParams } from 'react-router'
import Button from '../components/Button'
import Icon from '../components/Icon'
import { ErrorMessage, LoadingState } from '../components/StatusViews'
import useAsync from '../hooks/useAsync'
import { getOrderByCode } from '../api/orders'
import { formatLongDate, formatPrice } from '../utils/format'
import { getEventStatus, groupSeatsByZone, ZONES } from '../utils/seats'

// Verificación de boleto (/verificar/:code): es la URL que codifica el QR del boleto.
function VerifyTicketPage() {
  const { code } = useParams()
  const fetchOrder = useCallback((signal) => getOrderByCode(code, { signal }), [code])
  const { status, data, error, reload } = useAsync(fetchOrder)

  return (
    <div className="page container verify">
      <h1 className="page__title">Verificación de boleto</h1>

      {status === 'loading' && <LoadingState message="Verificando boleto..." />}
      {status === 'error' && <ErrorMessage message={error} onRetry={reload} />}

      {status === 'success' && !data && (
        <div className="verify__card verify__card--invalid" role="alert">
          <Icon name="alert" size={36} />
          <h2>Boleto no válido</h2>
          <p>No encontramos ninguna compra con el código <strong>{code}</strong>.</p>
          <Button as={Link} to="/eventos" variant="light">Ver eventos</Button>
        </div>
      )}

      {status === 'success' && data && <VerifiedTicket order={data.order} event={data.event} />}
    </div>
  )
}

function VerifiedTicket({ order, event }) {
  const finished = event && getEventStatus(event, []) === 'past'
  const seatsText = event
    ? groupSeatsByZone(event, order.seats).map((g) => `${ZONES[g.zone].name} (${g.seats.join(', ')})`).join(' · ')
    : order.seats.join(', ')
  const buyer = `${order.userName.split(' ')[0]} ${order.userName.split(' ')[1]?.charAt(0) ?? ''}.`.trim()

  return (
    <div className={`verify__card ${finished ? 'verify__card--warn' : 'verify__card--valid'}`} role="status">
      <Icon name={finished ? 'alert' : 'check'} size={36} />
      <h2>{finished ? 'Boleto auténtico · evento finalizado' : 'Boleto válido'}</h2>
      <dl className="verify__list">
        <div><dt>Código:</dt><dd>#{order.id}</dd></div>
        <div><dt>Evento:</dt><dd>{event ? event.title : 'Evento no disponible'}</dd></div>
        {event && <div><dt>Fecha:</dt><dd>{formatLongDate(event.date)}</dd></div>}
        {event && <div><dt>Lugar:</dt><dd>{event.venue}{event.city ? `, ${event.city}` : ''}</dd></div>}
        <div><dt>Asientos:</dt><dd>{seatsText}</dd></div>
        <div><dt>Comprador:</dt><dd>{buyer}</dd></div>
        <div><dt>Total pagado:</dt><dd>{formatPrice(order.total)}</dd></div>
      </dl>
    </div>
  )
}

export default VerifyTicketPage
