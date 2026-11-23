import { formatPrice } from '../utils/format'
import { ZONES, getSeatPrice, getSeatZone } from '../utils/seats'

const STATE_TEXT = { available: 'disponible', selected: 'seleccionado', taken: 'no disponible' }

// state: 'available' | 'selected' | 'taken'
function Seat({ id, event, state, onToggle }) {
  const zoneName = ZONES[getSeatZone(id)].name
  const label = `Asiento ${id}, ${zoneName}, ${formatPrice(getSeatPrice(event, id))}, ${STATE_TEXT[state]}`

  return (
    <button
      type="button"
      className={`seat seat--${state}`}
      aria-pressed={state === 'selected'}
      aria-label={label}
      disabled={state === 'taken'}
      onClick={() => onToggle(id)}
    >
      {id}
    </button>
  )
}

export default Seat
