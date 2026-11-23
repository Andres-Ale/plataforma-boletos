import { useState } from 'react'

// Afiche del evento. Si la imagen no existe, muestra un recuadro con el título.
function EventImage({ event, className = '' }) {
  const [failed, setFailed] = useState(false)

  if (failed) {
    return (
      <div className={`event-image event-image--fallback ${className}`} role="img" aria-label={`Afiche de ${event.title}`}>
        {event.title}
      </div>
    )
  }

  return (
    <img
      className={`event-image ${className}`}
      src={event.image}
      alt={`Afiche de ${event.title}`}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  )
}

export default EventImage
