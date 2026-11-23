import Seat from './Seat'
import { SEAT_LAYOUT } from '../utils/seats'
import './SeatMap.css'

function SeatMap({ event, takenSeats, selectedSeats, onToggle }) {
  const renderSeats = (ids) =>
    ids.map((id) => {
      const state = takenSeats.has(id) ? 'taken' : selectedSeats.includes(id) ? 'selected' : 'available'
      return <Seat key={id} id={id} event={event} state={state} onToggle={onToggle} />
    })

  return (
    <div className="seat-map" role="group" aria-label="Mapa de asientos">
      <div className="seat-map__stage">Escenario</div>

      <div className="seat-map__grid">
        <section className="zone zone--palco zone--pa" aria-label="Palco A">
          <h3 className="zone__title zone__title--vertical zone__title--flip">Palco A</h3>
          <div className="zone__col">{renderSeats(SEAT_LAYOUT.palcoA)}</div>
        </section>

        <section className="zone zone--vip zone--vip-area" aria-label="V.I.P.">
          <h3 className="zone__title">V.I.P.</h3>
          <div className="zone__row">{renderSeats(SEAT_LAYOUT.vip)}</div>
        </section>

        <section className="zone zone--palco zone--pb" aria-label="Palco B">
          <div className="zone__col">{renderSeats(SEAT_LAYOUT.palcoB)}</div>
          <h3 className="zone__title zone__title--vertical">Palco B</h3>
        </section>

        <section className="zone zone--diamante zone--dia" aria-label="Diamante">
          <h3 className="zone__title">Diamante</h3>
          <div className="zone__block">{renderSeats(SEAT_LAYOUT.diamante)}</div>
        </section>

        <section className="zone zone--palco zone--pc" aria-label="Palco C">
          <div className="zone__row">{renderSeats(SEAT_LAYOUT.palcoC)}</div>
          <h3 className="zone__title">Palco C</h3>
        </section>
      </div>
    </div>
  )
}

export default SeatMap
