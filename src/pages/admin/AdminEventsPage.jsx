import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import ConfirmDialog from '../../components/admin/ConfirmDialog'
import EventForm from '../../components/admin/EventForm'
import { useCatalog } from '../../context/contexts'
import { formatShortDate } from '../../utils/format'
import { ALL_SEATS, STATUS_LABEL, getAvailableCount, getEventStatus } from '../../utils/seats'

// /admin/eventos: listado filtrable + crear, editar y eliminar eventos (con confirmación).
function AdminEventsPage() {
  const { events, orders, createEvent, updateEvent, deleteEvent } = useCatalog()
  const [editing, setEditing] = useState(null) // null | 'new' | Event
  const [toDelete, setToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [feedback, setFeedback] = useState(null) // { type: 'ok' | 'error', text }

  const categories = useMemo(() => [...new Set(events.map((e) => e.category))], [events])

  const filtered = useMemo(
    () =>
      events.filter((ev) => {
        const status = getEventStatus(ev, orders)
        return (
          (categoryFilter === 'all' || ev.category === categoryFilter) &&
          (statusFilter === 'all' || status === statusFilter)
        )
      }),
    [events, orders, categoryFilter, statusFilter],
  )

  const handleSave = async (data) => {
    if (editing === 'new') {
      const created = await createEvent(data)
      setFeedback({ type: 'ok', text: `Evento "${created.title}" creado. Ya aparece en la cartelera.` })
    } else {
      const updated = await updateEvent(editing.id, data)
      setFeedback({ type: 'ok', text: `Evento "${updated.title}" actualizado.` })
    }
    setEditing(null)
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await deleteEvent(toDelete.id)
      setFeedback({ type: 'ok', text: `Evento "${toDelete.title}" eliminado.` })
    } catch (err) {
      setFeedback({ type: 'error', text: err.message })
    } finally {
      setDeleting(false)
      setToDelete(null)
    }
  }

  return (
    <div className="admin-stack">
      {feedback && (
        <p className={`admin-alert admin-alert--${feedback.type}`} role="status">{feedback.text}</p>
      )}

      {editing && (
        <article className="admin-card">
          <EventForm
            key={editing === 'new' ? 'new' : editing.id}
            initialEvent={editing === 'new' ? null : editing}
            categories={categories}
            onSave={handleSave}
            onCancel={() => setEditing(null)}
          />
        </article>
      )}

      <article className="admin-card">
        <div className="admin-card__header">
          <div>
            <h2 className="admin-card__title">Catálogo de eventos ({filtered.length})</h2>
            <p className="admin-card__subtitle">Crear, editar y eliminar eventos; los cambios se reflejan al instante en la cartelera</p>
          </div>
          <div className="admin-filters">
            <div className="admin-filter-group">
              <label htmlFor="ev-cat-filter">Categoría</label>
              <select id="ev-cat-filter" className="admin-select" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                <option value="all">Todas</option>
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="admin-filter-group">
              <label htmlFor="ev-status-filter">Estado</label>
              <select id="ev-status-filter" className="admin-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="all">Todos</option>
                <option value="available">Disponible</option>
                <option value="soldout">Agotado</option>
                <option value="past">Finalizado</option>
              </select>
            </div>
            {!editing && (
              <button type="button" className="admin-btn-primary" onClick={() => setEditing('new')}>+ Nuevo evento</button>
            )}
          </div>
        </div>

        {filtered.length === 0 ? (
          <p className="admin-empty">No hay eventos que coincidan con esos filtros.</p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th scope="col">Evento y recinto</th>
                  <th scope="col">Fecha</th>
                  <th scope="col">Precios</th>
                  <th scope="col">Disponibles</th>
                  <th scope="col">Estado</th>
                  <th scope="col">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((ev) => {
                  const status = getEventStatus(ev, orders)
                  return (
                    <tr key={ev.id}>
                      <td>
                        <span className="admin-event-cell__title">{ev.title}</span>
                        <span className="admin-event-cell__sub">{ev.venue}{ev.city ? `, ${ev.city}` : ''} · {ev.category}</span>
                      </td>
                      <td>{formatShortDate(ev.date)}</td>
                      <td>
                        <div className="admin-zones-inline">
                          <span className="admin-chip">VIP ${ev.prices.vip}</span>
                          <span className="admin-chip">Dia ${ev.prices.diamante}</span>
                          <span className="admin-chip">Palco ${ev.prices.palco}</span>
                        </div>
                      </td>
                      <td>{getAvailableCount(ev, orders)} / {ALL_SEATS.length}</td>
                      <td><span className={`admin-badge admin-badge--${status}`}>{STATUS_LABEL[status]}</span></td>
                      <td>
                        <div className="admin-row-actions">
                          <Link to={`/eventos/${ev.id}`} className="admin-table__link">Ver</Link>
                          <button type="button" className="admin-table__link" onClick={() => setEditing(ev)}>Editar</button>
                          <button type="button" className="admin-table__link admin-table__link--danger" onClick={() => setToDelete(ev)}>
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </article>

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="¿Eliminar evento?"
        message={toDelete ? `Se eliminará "${toDelete.title}". Si ya tiene compras registradas, la operación será rechazada.` : ''}
        confirmLabel="Sí, eliminar"
        busy={deleting}
        onConfirm={handleDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  )
}

export default AdminEventsPage
