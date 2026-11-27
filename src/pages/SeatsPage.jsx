import { useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import Button from '../components/Button'
import Icon from '../components/Icon'
import SeatMap from '../components/SeatMap'
import SeatLegend from '../components/SeatLegend'
import StepIndicator from '../components/StepIndicator'
import OrderSummary from '../components/OrderSummary'
import { EmptyState } from '../components/StatusViews'
import { useCart } from '../context/contexts'
import { useCatalog } from '../context/contexts'
import { MAX_SEATS, getEventStatus, getTakenSeats } from '../utils/seats'

function SeatsPage() {
  const { id } = useParams()
  const { events, orders } = useCatalog()
  const { cart, toggleSeat } = useCart()
  const navigate = useNavigate()
  const [notice, setNotice] = useState('')

  const event = events.find((e) => e.id === id)
  if (!event) {
    return (
      <div className="page container">
        <EmptyState title="Evento no encontrado" actionLabel="Ver eventos" onAction={() => navigate('/eventos')} />
      </div>
    )
  }

  // Valores derivados (no se guardan): estado del evento, asientos ocupados y selección del carrito
  const status = getEventStatus(event, orders)
  const takenSeats = getTakenSeats(event, orders)
  const selectedSeats = cart.eventId === event.id ? cart.seats : []
  const onToggleSeat = (seatId) => toggleSeat(event.id, seatId)
  const onBack = () => navigate(`/eventos/${event.id}`)
  const onContinue = () => navigate('/carrito')

  if (status !== 'available') {
    return (
      <div className="page container">
        <EmptyState
          title="Este evento no tiene asientos disponibles"
          text={status === 'soldout' ? 'Los asientos se agotaron.' : 'El evento ya finalizó.'}
          actionLabel="Volver al detalle"
          onAction={onBack}
        />
      </div>
    )
  }

  const handleToggle = (seatId) => {
    if (!selectedSeats.includes(seatId) && selectedSeats.length >= MAX_SEATS) {
      setNotice(`Puedes comprar hasta ${MAX_SEATS} asientos por compra.`)
      return
    }
    setNotice('')
    onToggleSeat(seatId)
  }

  return (
    <div className="page container">
      <Button variant="outline" size="sm" onClick={onBack}>
        <Icon name="arrowLeft" size={16} />
        Volver al detalle
      </Button>

      <div className="step-wrap"><StepIndicator current={2} /></div>
      <h1 className="page__title">Selecciona tus asientos · {event.title}</h1>

      <SeatMap event={event} takenSeats={takenSeats} selectedSeats={selectedSeats} onToggle={handleToggle} />

      <p className="sr-only" role="status">{selectedSeats.length} asientos seleccionados</p>
      {notice && <p className="notice" role="alert">{notice}</p>}

      <div className="seats-footer">
        <SeatLegend />
        <div className="seats-footer__summary">
          <OrderSummary event={event} seats={selectedSeats} />
          <Button block disabled={selectedSeats.length === 0} onClick={onContinue}>
            Continuar
            <Icon name="arrowRight" size={18} />
          </Button>
        </div>
      </div>
    </div>
  )
}

export default SeatsPage
