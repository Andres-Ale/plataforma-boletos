import { useNavigate } from 'react-router'
import TicketCard from '../components/TicketCard'
import { useAuth } from '../context/contexts'
import { useCatalog } from '../context/contexts'
import { EmptyState } from '../components/StatusViews'

function MyTicketsPage() {
  const { user } = useAuth()
  const { orders, events } = useCatalog()
  const navigate = useNavigate()
  const onGoEvents = () => navigate('/eventos')
  // Solo las órdenes del usuario, las más recientes primero
  const mine = orders.filter((o) => o.userId === user.id).reverse()

  return (
    <div className="page container">
      <h1 className="page__title">Mis boletos</h1>

      {mine.length === 0 ? (
        <EmptyState
          title="Aún no tienes boletos"
          text="Cuando compres entradas, aparecerán aquí."
          actionLabel="Explorar eventos"
          onAction={onGoEvents}
        />
      ) : (
        <ul className="tickets-list">
          {mine.map((order) => {
            const event = events.find((e) => e.id === order.eventId)
            return event ? <li key={order.id}><TicketCard order={order} event={event} /></li> : null
          })}
        </ul>
      )}
    </div>
  )
}

export default MyTicketsPage
