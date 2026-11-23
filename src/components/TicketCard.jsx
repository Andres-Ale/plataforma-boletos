import { QRCodeSVG } from 'qrcode.react'
import Icon from './Icon'
import { formatLongDate } from '../utils/format'
import { groupSeatsByZone, ZONES } from '../utils/seats'
import './TicketCard.css'

function TicketCard({ order, event }) {
  const seatsText = groupSeatsByZone(event, order.seats)
    .map((g) => `Zona ${ZONES[g.zone].name} (${g.seats.join(', ')})`)
    .join(' · ')

  // El QR codifica los datos de la reserva (generado en el cliente)
  const qrValue = `EASYTICKET|${order.id}|${event.id}|${order.seats.join(',')}`

  return (
    <article className="ticket" aria-label={`Boleto ${order.id}`}>
      <header className="ticket__head">
        <Icon name="ticket" size={26} />
        <h3>Boleto electrónico / {event.kind} {event.title}</h3>
        <Icon name="ticket" size={26} />
      </header>

      <div className="ticket__body">
        <dl className="ticket__info">
          <div><dt>Lugar:</dt><dd>{event.venue}{event.city ? `, ${event.city}` : ''}</dd></div>
          <div><dt>Fecha:</dt><dd>{formatLongDate(event.date)}</dd></div>
          <div><dt>Asientos:</dt><dd>{seatsText}</dd></div>
          <div><dt>ID de Reserva:</dt><dd>#{order.id}</dd></div>
        </dl>

        <div className="ticket__qr">
          <div role="img" aria-label={`Código QR del boleto ${order.id}`}>
            <QRCodeSVG value={qrValue} size={128} />
          </div>
          <span>(Código simulado)</span>
        </div>
      </div>
    </article>
  )
}

export default TicketCard
