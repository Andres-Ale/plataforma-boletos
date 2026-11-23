import Icon from './Icon'
import Button from './Button'
import './SearchBar.css'

// Filtros del listado: la lista se filtra mientras se escribe;
// el botón "Buscar" lleva la vista a los resultados.
function SearchBar({ filters, months, venues, onChange, onSubmit }) {
  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit()
  }

  return (
    <form className="search-bar" role="search" onSubmit={handleSubmit}>
      <div className="search-bar__field search-bar__field--grow">
        <Icon name="user" size={18} />
        <label htmlFor="filter-query" className="sr-only">Buscar por artista o evento</label>
        <input
          id="filter-query"
          type="search"
          placeholder="Buscar por artista o evento..."
          value={filters.query}
          onChange={(e) => onChange('query', e.target.value)}
        />
      </div>

      <div className="search-bar__field">
        <Icon name="calendar" size={18} />
        <label htmlFor="filter-month" className="sr-only">Fecha</label>
        <select id="filter-month" value={filters.month} onChange={(e) => onChange('month', e.target.value)}>
          <option value="">Fecha</option>
          {months.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
        </select>
      </div>

      <div className="search-bar__field">
        <Icon name="pin" size={18} />
        <label htmlFor="filter-venue" className="sr-only">Lugar</label>
        <select id="filter-venue" value={filters.venue} onChange={(e) => onChange('venue', e.target.value)}>
          <option value="">Lugar</option>
          {venues.map((v) => <option key={v} value={v}>{v}</option>)}
        </select>
      </div>

      <Button type="submit">Buscar</Button>
    </form>
  )
}

export default SearchBar
