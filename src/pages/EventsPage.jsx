import { useEffect, useMemo, useState } from 'react'
import SearchBar from '../components/SearchBar'
import CategoryTabs from '../components/CategoryTabs'
import EventCard from '../components/EventCard'
import { EmptyState, ErrorMessage, LoadingState } from '../components/StatusViews'
import { formatMonthLabel, normalizeText } from '../utils/format'
import { getEventStatus } from '../utils/seats'

const EMPTY_FILTERS = { query: '', month: '', venue: '', category: '' }

function EventsPage({ events, status, error, onRetry, orders, onSelectEvent, scrollTo }) {
  const [filters, setFilters] = useState(EMPTY_FILTERS)

  const updateFilter = (field, value) => setFilters((prev) => ({ ...prev, [field]: value }))

  // Valores derivados de los datos (no se guardan en estado)
  const categories = useMemo(() => (events ? [...new Set(events.map((e) => e.category))] : []), [events])
  const venues = useMemo(() => (events ? [...new Set(events.map((e) => e.venue))].sort() : []), [events])
  const months = useMemo(() => {
    if (!events) return []
    return [...new Set(events.map((e) => e.date.slice(0, 7)))]
      .sort()
      .map((value) => ({ value, label: formatMonthLabel(value) }))
  }, [events])

  const filtered = useMemo(() => {
    if (!events) return []
    const query = normalizeText(filters.query.trim())
    return events.filter((e) => {
      const matchesQuery = !query || normalizeText(`${e.title} ${e.subtitle}`).includes(query)
      const matchesMonth = !filters.month || e.date.startsWith(filters.month)
      const matchesVenue = !filters.venue || e.venue === filters.venue
      const matchesCategory = !filters.category || e.category === filters.category
      return matchesQuery && matchesMonth && matchesVenue && matchesCategory
    })
  }, [events, filters])

  const groups = categories
    .map((category) => ({ category, items: filtered.filter((e) => e.category === category) }))
    .filter((group) => group.items.length > 0)

  // Navegación del header: Eventos / Categorías llevan a su sección
  useEffect(() => {
    if (scrollTo && status === 'success') {
      document.getElementById(scrollTo)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [scrollTo, status])

  const goToResults = () => document.getElementById('eventos')?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  return (
    <div className="page">
      <section className="hero container">
        <h1>Encuentra los mejores eventos en un solo lugar</h1>
        <p>¡No te pierdas los conciertos y espectáculos más esperados!</p>
        {status === 'success' && (
          <SearchBar filters={filters} months={months} venues={venues} onChange={updateFilter} onSubmit={goToResults} />
        )}
      </section>

      <div className="container" id="eventos">
        {status === 'loading' && <LoadingState message="Cargando eventos..." />}
        {status === 'error' && <ErrorMessage message={error} onRetry={onRetry} />}

        {status === 'success' && (
          <>
            <CategoryTabs categories={categories} selected={filters.category} onSelect={(c) => updateFilter('category', c)} />
            <p className="sr-only" role="status">{filtered.length} eventos encontrados</p>

            {groups.length === 0 ? (
              <EmptyState
                title="No encontramos eventos"
                text="Prueba con otro nombre, fecha o lugar."
                actionLabel="Limpiar filtros"
                onAction={() => setFilters(EMPTY_FILTERS)}
              />
            ) : (
              groups.map((group) => (
                <section key={group.category} className="events-section" aria-labelledby={`cat-${group.items[0].id}`}>
                  <h2 id={`cat-${group.items[0].id}`}>{group.category}</h2>
                  <ul className="event-grid">
                    {group.items.map((event) => (
                      <EventCard key={event.id} event={event} status={getEventStatus(event, orders)} onSelect={onSelectEvent} />
                    ))}
                  </ul>
                </section>
              ))
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default EventsPage
