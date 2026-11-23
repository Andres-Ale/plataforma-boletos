import Button from '../components/Button'
import Icon from '../components/Icon'
import EventImage from '../components/EventImage'
import ZoneLegend from '../components/ZoneLegend'
import StepIndicator from '../components/StepIndicator'
import { formatLongDate } from '../utils/format'

function EventDetailPage({ event, status, onBack, onSelectSeats }) {
  return (
    <div className="page container">
      <Button variant="outline" size="sm" onClick={onBack}>
        <Icon name="arrowLeft" size={16} />
        Volver a eventos
      </Button>

      <div className="step-wrap"><StepIndicator current={1} /></div>

      <div className="detail">
        <div className="detail__poster">
          <EventImage event={event} />
          <ZoneLegend prices={event.prices} />
        </div>

        <div className="detail__info">
          <h1>{event.title}</h1>
          <p className="detail__subtitle">{event.subtitle}</p>

          <dl className="detail__list">
            <div><dt>Fecha y Hora:</dt><dd>{formatLongDate(event.date)}</dd></div>
            <div><dt>Lugar / Recinto:</dt><dd>{event.venue}{event.city ? `, ${event.city}` : ''}</dd></div>
            <div><dt>Duración:</dt><dd>{event.duration}</dd></div>
            <div><dt>Clasificación:</dt><dd>{event.rating}</dd></div>
          </dl>

          <figure className="synopsis">
            <figcaption>Sinopsis</figcaption>
            <blockquote>{event.synopsis}</blockquote>
          </figure>

          {status === 'available' ? (
            <Button onClick={onSelectSeats}>Seleccionar asientos</Button>
          ) : (
            <p className="detail__notice" role="status">
              {status === 'soldout' ? 'Este evento está agotado: ya no quedan asientos disponibles.' : 'Este evento ya finalizó.'}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default EventDetailPage
