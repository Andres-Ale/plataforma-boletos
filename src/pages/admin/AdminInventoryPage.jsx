import { useState } from 'react'
import SeatMap from '../../components/SeatMap'
import { useCatalog } from '../../context/contexts'
import { ALL_SEATS, ZONES, getSoldSeats, getTakenSeats, getZoneStats, setZoneAvailability } from '../../utils/seats'

// /admin/inventario: edición de precios y disponibilidad por zona + bloqueo asiento por asiento.
function AdminInventoryPage() {
  const { events, orders, updateEvent } = useCatalog()
  const [selectedId, setSelectedId] = useState(() => events[0]?.id ?? '')
  const event = events.find((e) => e.id === selectedId) ?? events[0]

  if (!event) return <p className="admin-card admin-empty">No hay eventos en el catálogo.</p>

  // key={event.id}: al cambiar de evento (o tras guardar), el editor se reinicia con los valores del evento
  return <InventoryEditor key={`${event.id}-${event.occupied.join(',')}-${Object.values(event.prices).join(',')}`} event={event} events={events} orders={orders} onSelect={setSelectedId} onSave={updateEvent} />
}

function InventoryEditor({ event, events, orders, onSelect, onSave }) {
  const [prices, setPrices] = useState({ ...event.prices })
  const [occupied, setOccupied] = useState(event.occupied)
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState(null)

  const draft = { ...event, prices, occupied }
  const sold = getSoldSeats(event, orders)
  const taken = getTakenSeats(draft, orders)

  const changeZoneAvailable = (zone, value) => {
    setOccupied(setZoneAvailability(draft, orders, zone, Number(value)))
  }

  // En el mapa: los vendidos no se pueden liberar; los demás se bloquean o desbloquean con un clic
  const toggleBlocked = (seatId) => {
    if (sold.has(seatId)) return
    setOccupied((prev) => (prev.includes(seatId) ? prev.filter((id) => id !== seatId) : [...prev, seatId]))
  }

  const save = async (e) => {
    e.preventDefault()
    if (saving) return
    setSaving(true)
    setFeedback(null)
    try {
      await onSave(event.id, { prices, occupied })
      setFeedback({ type: 'ok', text: `Inventario y precios de "${event.title}" guardados.` })
    } catch (err) {
      setFeedback({ type: 'error', text: err.message })
    } finally {
      setSaving(false)
    }
  }

  return (
    <form className="admin-stack" onSubmit={save}>
      {feedback && <p className={`admin-alert admin-alert--${feedback.type}`} role="status">{feedback.text}</p>}

      <article className="admin-card">
        <div className="admin-card__header">
          <div>
            <h2 className="admin-card__title">Precios y cupos por zona</h2>
            <p className="admin-card__subtitle">
              Disponibles: <strong>{ALL_SEATS.length - taken.size}</strong> de {ALL_SEATS.length} · Vendidos (fijos): {sold.size} · Bloqueados: {occupied.length}
            </p>
          </div>
          <div className="admin-filter-group">
            <label htmlFor="inv-event">Evento</label>
            <select id="inv-event" className="admin-select" value={event.id} onChange={(e) => onSelect(e.target.value)}>
              {events.map((ev) => <option key={ev.id} value={ev.id}>{ev.title}</option>)}
            </select>
          </div>
        </div>

        <div className="admin-zone-cards">
          {Object.keys(ZONES).map((zone) => {
            const stats = getZoneStats(draft, orders, zone)
            const maxAvailable = stats.capacity - stats.sold
            return (
              <div key={zone} className="admin-zone-box">
                <h3 className="admin-zone-box__title">{ZONES[zone].name}</h3>
                <p className="admin-zone-box__detail">
                  Capacidad {stats.capacity} · Vendidos {stats.sold} · Bloqueados {stats.blocked}
                </p>
                <div className="admin-field">
                  <label htmlFor={`price-${zone}`}>Precio (USD)</label>
                  <input
                    id={`price-${zone}`}
                    type="number"
                    min="1"
                    value={prices[zone]}
                    onChange={(e) => setPrices((p) => ({ ...p, [zone]: e.target.value }))}
                  />
                </div>
                <div className="admin-field">
                  <label htmlFor={`avail-${zone}`}>Asientos disponibles (máx. {maxAvailable})</label>
                  <input
                    id={`avail-${zone}`}
                    type="number"
                    min="0"
                    max={maxAvailable}
                    value={stats.available}
                    onChange={(e) => changeZoneAvailable(zone, e.target.value)}
                  />
                </div>
              </div>
            )
          })}
        </div>

        <div className="admin-form__actions">
          <button type="button" className="admin-btn-secondary" onClick={() => setOccupied([])}>
            Liberar bloqueados
          </button>
          <button type="submit" className="admin-btn-primary" disabled={saving}>
            {saving ? 'Guardando...' : 'Guardar inventario y precios'}
          </button>
        </div>
      </article>

      <article className="admin-card admin-map-card">
        <h2 className="admin-card__title">Bloqueo por asiento</h2>
        <p className="admin-card__subtitle">
          Pulsa un asiento para bloquearlo (naranja) o liberarlo. Los asientos ya vendidos aparecen tachados y no se pueden liberar.
        </p>
        <div className="admin-map-dark">
          <SeatMap event={draft} takenSeats={sold} selectedSeats={occupied} onToggle={toggleBlocked} />
        </div>
      </article>
    </form>
  )
}

export default AdminInventoryPage
