import './SeatMap.css'

function SeatLegend() {
  return (
    <ul className="seat-legend" aria-label="Leyenda del mapa">
      <li><span className="seat-legend__box seat-legend__box--available" aria-hidden="true" />Disponible</li>
      <li><span className="seat-legend__box seat-legend__box--selected" aria-hidden="true" />Seleccionado</li>
      <li><span className="seat-legend__box seat-legend__box--taken" aria-hidden="true" />No disponible</li>
    </ul>
  )
}

export default SeatLegend
