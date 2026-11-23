import EventImage from './EventImage'
import Icon from './Icon'
import { formatPrice, formatShortDate } from '../utils/format'
import { getMinPrice, STATUS_LABEL } from '../utils/seats'
import './EventCard.css'

function EventCard({ event, status, onSelect }) {
  const isAvailable = status === 'available'

  return (
    <li className="event-card">
      <button type="button" className="event-card__btn" onClick={() => onSelect(event.id)}>
        <EventImage event={event} />
        <span className="event-card__body">
          <span className="event-card__title">{event.title}</span>
          <span className="event-card__meta">{formatShortDate(event.date)}</span>
          <span className="event-card__meta">{event.venue}</span>
          <span className="event-card__price">
            {isAvailable ? `Desde ${formatPrice(getMinPrice(event))}` : STATUS_LABEL[status]}
          </span>
        </span>
        <span className="event-card__corner" aria-hidden="true">
          <Icon name="cart" size={16} />
        </span>
      </button>
    </li>
  )
}

export default EventCard
