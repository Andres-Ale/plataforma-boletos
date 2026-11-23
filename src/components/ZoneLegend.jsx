import { formatPrice } from '../utils/format'
import { ZONES } from '../utils/seats'
import './ZoneLegend.css'

function ZoneLegend({ prices }) {
  return (
    <ul className="zone-legend" aria-label="Zonas y precios">
      {Object.keys(ZONES).map((zone) => (
        <li key={zone}>
          <span className={`zone-legend__swatch zone-legend__swatch--${zone}`} aria-hidden="true" />
          <span>{ZONES[zone].name} ({formatPrice(prices[zone])})</span>
        </li>
      ))}
      <li>
        <span className="zone-legend__swatch zone-legend__swatch--taken" aria-hidden="true" />
        <span>Asientos ocupados / No disponibles (gris)</span>
      </li>
    </ul>
  )
}

export default ZoneLegend
