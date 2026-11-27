import { Link, useNavigate } from 'react-router'
import Button from '../components/Button'
import Icon from '../components/Icon'
import EventCard from '../components/EventCard'
import { EmptyState, ErrorMessage, LoadingState } from '../components/StatusViews'
import { useCatalog } from '../context/contexts'
import { getEventStatus } from '../utils/seats'

// Inicio ("/"): presentación y próximos eventos destacados
function HomePage() {
  const { events, orders, status, error, reload } = useCatalog()
  const navigate = useNavigate()

  // Destacados = los 3 próximos eventos con asientos disponibles (valor derivado)
  const featured = [...events]
    .filter((e) => getEventStatus(e, orders) === 'available')
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 3)

  return (
    <div className="page">
      <section className="hero container">
        <h1>Encuentra los mejores eventos en un solo lugar</h1>
        <p>¡No te pierdas los conciertos y espectáculos más esperados!</p>
        <Button as={Link} to="/eventos">
          Explorar eventos
          <Icon name="arrowRight" size={18} />
        </Button>
      </section>

      <div className="container">
        <h2 className="home__title">Próximos eventos destacados</h2>

        {status === 'loading' && <LoadingState message="Cargando eventos..." />}
        {status === 'error' && <ErrorMessage message={error} onRetry={reload} />}
        {status === 'success' && featured.length === 0 && (
          <EmptyState
            title="No hay eventos disponibles por ahora"
            text="Vuelve pronto: estamos preparando nueva cartelera."
            actionLabel="Ver todos los eventos"
            onAction={() => navigate('/eventos')}
          />
        )}
        {status === 'success' && featured.length > 0 && (
          <>
            <ul className="event-grid">
              {featured.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  status={getEventStatus(event, orders)}
                  onSelect={(id) => navigate(`/eventos/${id}`)}
                />
              ))}
            </ul>
            <p className="home__more">
              <Button as={Link} to="/eventos" variant="light">Ver todos los eventos</Button>
            </p>
          </>
        )}
      </div>
    </div>
  )
}

export default HomePage
