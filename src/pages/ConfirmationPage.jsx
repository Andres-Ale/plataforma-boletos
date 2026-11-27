import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import Button from '../components/Button'
import Icon from '../components/Icon'
import TicketCard from '../components/TicketCard'
import { EmptyState } from '../components/StatusViews'
import { useCatalog } from '../context/contexts'

function ConfirmationPage() {
  const { orderId } = useParams()
  const { orders, events } = useCatalog()
  const navigate = useNavigate()
  const order = orders.find((o) => o.id === orderId)
  const event = order && events.find((e) => e.id === order.eventId)
  const onViewTickets = () => navigate('/boletos')
  const onGoEvents = () => navigate('/eventos')
  const [mailStatus, setMailStatus] = useState('idle') // idle | sending | sent
  const timerRef = useRef(null)

  useEffect(() => () => clearTimeout(timerRef.current), [])

  if (!order || !event) {
    return (
      <div className="page container">
        <EmptyState title="No encontramos esa compra" actionLabel="Ver eventos" onAction={onGoEvents} />
      </div>
    )
  }

  const firstName = order.userName.split(' ')[0]

  const sendByMail = () => {
    if (mailStatus !== 'idle') return
    setMailStatus('sending')
    timerRef.current = setTimeout(() => setMailStatus('sent'), 1200)
  }

  return (
    <div className="page container confirmation">
      <section className="success-card" role="status">
        <span className="success-card__icon" aria-hidden="true"><Icon name="check" size={40} /></span>
        <div>
          <h1>¡Compra exitosa, {firstName}!</h1>
          <p>Tu pago ha sido procesado correctamente. ¡Disfruta el evento!</p>
        </div>
      </section>

      <TicketCard order={order} event={event} />

      <div className="confirmation__actions">
        <Button onClick={() => window.print()}>
          <Icon name="download" size={18} />
          Descargar PDF
        </Button>
        <Button onClick={sendByMail} disabled={mailStatus !== 'idle'}>
          <Icon name="mail" size={18} />
          {mailStatus === 'sending' ? 'Enviando...' : 'Enviar a mi correo'}
        </Button>
      </div>

      {mailStatus === 'sent' && (
        <p className="notice notice--ok" role="status">
          Simulación: enviamos una copia del boleto a {order.userEmail}. No se envía ningún correo real.
        </p>
      )}

      <div className="confirmation__links">
        <Button variant="outline" size="sm" onClick={onViewTickets}>Ver mis boletos</Button>
        <Button variant="outline" size="sm" onClick={onGoEvents}>Seguir explorando eventos</Button>
      </div>
    </div>
  )
}

export default ConfirmationPage
