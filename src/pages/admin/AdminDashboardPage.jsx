import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { listUsers } from '../../api/users'
import KpiCard from '../../components/admin/KpiCard'
import BarList from '../../components/admin/BarList'
import { ErrorMessage, LoadingState } from '../../components/StatusViews'
import { ROLES, useAuth } from '../../context/contexts'
import { useCatalog } from '../../context/contexts'
import useAsync from '../../hooks/useAsync'
import { formatPrice } from '../../utils/format'
import { groupByEvent, occupancy, summarize } from '../../utils/reports'
import { ALL_SEATS, getEventStatus } from '../../utils/seats'

const ROLE_TEXT = { administrador: 'Administrador', organizador: 'Organizador', cliente: 'Cliente' }
const ROLE_BADGE = { administrador: 'admin-badge--admin', organizador: 'admin-badge--org', cliente: 'admin-badge--client' }

// /admin: métricas generales + accesos rápidos + directorio de usuarios (desde la API falsa)
function AdminDashboardPage() {
  const { user } = useAuth()
  const { events, orders } = useCatalog()
  const { status, data: users, error, reload } = useAsync(listUsers)
  const [roleFilter, setRoleFilter] = useState('all')

  const stats = useMemo(() => {
    const totals = summarize(orders)
    const capacity = events.length * ALL_SEATS.length
    const taken = events.reduce((sum, e) => sum + occupancy(e, orders).taken, 0)
    const active = events.filter((e) => getEventStatus(e, orders) === 'available').length
    const soldOut = events.filter((e) => getEventStatus(e, orders) === 'soldout').length
    const topEvents = groupByEvent(orders, events).slice(0, 5)
    return { ...totals, capacity, taken, pct: capacity ? Math.round((taken / capacity) * 100) : 0, active, soldOut, topEvents }
  }, [events, orders])

  const filteredUsers = useMemo(
    () => (users ?? []).filter((u) => roleFilter === 'all' || u.role === roleFilter),
    [users, roleFilter],
  )

  return (
    <div className="admin-stack">
      <div className="admin-kpis" role="region" aria-label="Indicadores generales">
        <KpiCard
          tone="accent"
          label="Ingresos por ventas"
          value={formatPrice(stats.revenue)}
          hint={`${stats.count} órdenes confirmadas`}
        />
        <KpiCard
          label="Ocupación de cartelera"
          value={`${stats.taken} / ${stats.capacity}`}
          hint={`${stats.tickets} boletos vendidos · ${stats.pct}% ocupado`}
        />
        <KpiCard
          tone="sky"
          label="Eventos en cartelera"
          value={`${events.length} eventos`}
          hint={`${stats.active} disponibles · ${stats.soldOut} agotados`}
        />
        <KpiCard
          tone="success"
          label="Usuarios registrados"
          value={users ? `${users.length} cuentas` : '…'}
          hint="Clientes, organizadores y administradores"
        />
      </div>

      <article className="admin-card">
        <div className="admin-card__header">
          <div>
            <h2 className="admin-card__title">Eventos con mayores ingresos</h2>
            <p className="admin-card__subtitle">Calculado a partir de las órdenes confirmadas</p>
          </div>
          <div className="admin-quick">
            <Link to="/admin/eventos" className="admin-btn-secondary">Gestionar eventos</Link>
            <Link to="/admin/inventario" className="admin-btn-secondary">Ajustar inventario</Link>
            {user.role === ROLES.admin && (
              <Link to="/admin/reportes" className="admin-btn-secondary">Ver reportes completos</Link>
            )}
          </div>
        </div>
        {stats.topEvents.length === 0 ? (
          <p className="admin-empty">Todavía no hay ventas registradas.</p>
        ) : (
          <BarList
            label="Ingresos por evento"
            rows={stats.topEvents.map(({ event, revenue, tickets }) => ({
              key: event.id,
              label: event.title,
              meta: `${tickets} boletos · ${formatPrice(revenue)}`,
              value: revenue,
            }))}
          />
        )}
      </article>

      <article className="admin-card">
        <div className="admin-card__header">
          <div>
            <h2 className="admin-card__title">Directorio de usuarios y roles</h2>
            <p className="admin-card__subtitle">Consulta de cuentas desde la API falsa (sin contraseñas)</p>
          </div>
          <div className="admin-filter-group">
            <label htmlFor="admin-role-filter">Rol</label>
            <select
              id="admin-role-filter"
              className="admin-select"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="all">Todos los roles</option>
              <option value="administrador">Administrador</option>
              <option value="organizador">Organizador</option>
              <option value="cliente">Cliente</option>
            </select>
          </div>
        </div>

        {status === 'loading' && <LoadingState message="Cargando usuarios..." />}
        {status === 'error' && <ErrorMessage message={error} onRetry={reload} />}
        {status === 'success' && (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th scope="col">Usuario</th>
                  <th scope="col">Correo</th>
                  <th scope="col">Rol</th>
                  <th scope="col">Órdenes</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="admin-user-cell">
                        <span className="admin-user-avatar" aria-hidden="true">{item.name.charAt(0).toUpperCase()}</span>
                        <strong>{item.name}</strong>
                      </div>
                    </td>
                    <td>{item.email}</td>
                    <td>
                      <span className={`admin-badge ${ROLE_BADGE[item.role] || 'admin-badge--client'}`}>
                        {ROLE_TEXT[item.role] || item.role}
                      </span>
                    </td>
                    <td>{orders.filter((o) => o.userId === item.id).length}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </article>
    </div>
  )
}

export default AdminDashboardPage
