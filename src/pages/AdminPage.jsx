import { useMemo, useState } from 'react'
import { getStoredUsers } from '../services/auth'
import {
  ALL_SEATS,
  SEAT_LAYOUT,
  STATUS_LABEL,
  ZONES,
  getAvailableCount,
  getEventStatus,
  getSeatPrice,
  getSeatZone,
  getTakenSeats,
} from '../utils/seats'
import './AdminPage.css'

const ROLE_TEXT = {
  administrador: 'Administrador',
  organizador: 'Organizador',
  cliente: 'Cliente',
}

const ZONE_CAPACITY = {
  vip: SEAT_LAYOUT.vip.length,
  diamante: SEAT_LAYOUT.diamante.length,
  palco: SEAT_LAYOUT.palcoA.length + SEAT_LAYOUT.palcoB.length + SEAT_LAYOUT.palcoC.length,
}

function formatCurrency(amount) {
  return `$${Number(amount || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

function formatShortDate(isoDate) {
  const date = new Date(isoDate)
  if (Number.isNaN(date.getTime())) return isoDate
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function AdminPage({ user, events = [], orders = [], onSelectEvent, onGoEvents }) {
  const [activeTab, setActiveTab] = useState('reports')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [roleFilter, setRoleFilter] = useState('all')

  const isAuthorized = user && (user.role === 'administrador' || user.role === 'organizador')

  const users = useMemo(() => getStoredUsers(), [])

  // Analítica derivada de eventos + órdenes locales (cero estado duplicado)
  const analytics = useMemo(() => {
    const totalSeatsPerEvent = ALL_SEATS.length
    const totalCapacity = events.length * totalSeatsPerEvent

    const zoneTotals = {
      vip: { sold: 0, capacity: events.length * ZONE_CAPACITY.vip, revenue: 0 },
      diamante: { sold: 0, capacity: events.length * ZONE_CAPACITY.diamante, revenue: 0 },
      palco: { sold: 0, capacity: events.length * ZONE_CAPACITY.palco, revenue: 0 },
    }

    const categoryTotals = {}
    const monthlyTotals = {}

    const eventRows = events.map((event) => {
      const takenSet = getTakenSeats(event, orders)
      const soldCount = takenSet.size
      const availableCount = getAvailableCount(event, orders)
      const status = getEventStatus(event, orders)
      const occupancyPct = Math.round((soldCount / totalSeatsPerEvent) * 100)

      let eventRevenue = 0
      const byZone = {
        vip: { sold: 0, total: ZONE_CAPACITY.vip, price: event.prices.vip },
        diamante: { sold: 0, total: ZONE_CAPACITY.diamante, price: event.prices.diamante },
        palco: { sold: 0, total: ZONE_CAPACITY.palco, price: event.prices.palco },
      }

      takenSet.forEach((seatId) => {
        const zone = getSeatZone(seatId)
        const price = getSeatPrice(event, seatId)
        eventRevenue += price
        byZone[zone].sold += 1
        zoneTotals[zone].sold += 1
        zoneTotals[zone].revenue += price
      })

      if (!categoryTotals[event.category]) {
        categoryTotals[event.category] = { category: event.category, sold: 0, revenue: 0, events: 0 }
      }
      categoryTotals[event.category].sold += soldCount
      categoryTotals[event.category].revenue += eventRevenue
      categoryTotals[event.category].events += 1

      const monthKey = new Date(event.date).toLocaleDateString('es-ES', {
        month: 'short',
        year: 'numeric',
      })
      if (!monthlyTotals[monthKey]) {
        monthlyTotals[monthKey] = { period: monthKey, sold: 0, revenue: 0 }
      }
      monthlyTotals[monthKey].sold += soldCount
      monthlyTotals[monthKey].revenue += eventRevenue

      return {
        ...event,
        soldCount,
        availableCount,
        totalSeats: totalSeatsPerEvent,
        occupancyPct,
        eventRevenue,
        status,
        byZone,
      }
    })

    const totalRevenue = eventRows.reduce((sum, item) => sum + item.eventRevenue, 0)
    const totalSold = eventRows.reduce((sum, item) => sum + item.soldCount, 0)
    const activeEvents = eventRows.filter((item) => item.status === 'available').length
    const soldOutEvents = eventRows.filter((item) => item.status === 'soldout').length
    const avgOccupancy = totalCapacity > 0 ? Math.round((totalSold / totalCapacity) * 100) : 0
    const maxEventRevenue = Math.max(1, ...eventRows.map((item) => item.eventRevenue))
    const sessionOrdersRevenue = orders.reduce((sum, o) => sum + Number(o.total || 0), 0)

    return {
      eventRows,
      totalRevenue,
      totalSold,
      totalCapacity,
      activeEvents,
      soldOutEvents,
      avgOccupancy,
      maxEventRevenue,
      zoneTotals,
      categoryList: Object.values(categoryTotals),
      monthlyList: Object.values(monthlyTotals),
      sessionOrdersRevenue,
    }
  }, [events, orders])

  if (!isAuthorized) {
    return (
      <section className="admin-page" aria-label="Acceso restringido">
        <div className="admin-denied">
          <h2>Acceso solo para personal autorizado</h2>
          <p>
            Tu sesión actual tiene rol de <strong>Cliente</strong>. Inicia sesión con una cuenta de{' '}
            <strong>Administrador</strong> u <strong>Organizador</strong> para entrar al panel.
          </p>
          <button type="button" className="admin-btn-primary" onClick={onGoEvents}>
            Volver a eventos
          </button>
        </div>
      </section>
    )
  }

  const categories = ['all', ...new Set(events.map((e) => e.category))]

  const filteredEvents = analytics.eventRows.filter((ev) => {
    const matchCategory = categoryFilter === 'all' || ev.category === categoryFilter
    const matchStatus = statusFilter === 'all' || ev.status === statusFilter
    return matchCategory && matchStatus
  })

  const filteredUsers = users.filter((u) => roleFilter === 'all' || (u.role || 'cliente') === roleFilter)

  return (
    <section className="admin-page" aria-label="Panel de administración y reportes">
      <div className="admin-container">
        {/* Banner superior */}
        <header className="admin-hero">
          <div>
            <span className="admin-hero__eyebrow">Easy Ticket · Gestión y Analítica</span>
            <h1 className="admin-hero__title">Panel de Administración</h1>
            <p className="admin-hero__subtitle">
              Sesión activa: <strong>{user.name}</strong> ({user.email})
            </p>
          </div>
          <div className="admin-hero__actions">
            <span className="admin-role-pill">Rol: {ROLE_TEXT[user.role] || user.role}</span>
            <button type="button" className="admin-btn-primary" onClick={onGoEvents}>
              Ver cartelera
            </button>
          </div>
        </header>

        {/* Dashboard KPIs (Módulo 7) */}
        <div className="admin-kpis" role="region" aria-label="Indicadores generales">
          <article className="admin-kpi-card admin-kpi-card--accent">
            <span className="admin-kpi-card__label">Ingresos estimados</span>
            <strong className="admin-kpi-card__value">{formatCurrency(analytics.totalRevenue)}</strong>
            <span className="admin-kpi-card__hint">
              {orders.length > 0
                ? `Incluye ${formatCurrency(analytics.sessionOrdersRevenue)} en compras recientes`
                : 'Consolidado de boletería activa'}
            </span>
          </article>

          <article className="admin-kpi-card">
            <span className="admin-kpi-card__label">Boletos emitidos</span>
            <strong className="admin-kpi-card__value">
              {analytics.totalSold} / {analytics.totalCapacity}
            </strong>
            <span className="admin-kpi-card__hint">Ocupación global del {analytics.avgOccupancy}%</span>
          </article>

          <article className="admin-kpi-card admin-kpi-card--sky">
            <span className="admin-kpi-card__label">Eventos en cartelera</span>
            <strong className="admin-kpi-card__value">{events.length} eventos</strong>
            <span className="admin-kpi-card__hint">
              {analytics.activeEvents} disponibles · {analytics.soldOutEvents} agotados
            </span>
          </article>

          <article className="admin-kpi-card admin-kpi-card--success">
            <span className="admin-kpi-card__label">Usuarios registrados</span>
            <strong className="admin-kpi-card__value">{users.length} cuentas</strong>
            <span className="admin-kpi-card__hint">{orders.length} órdenes guardadas en sesión</span>
          </article>
        </div>

        {/* Navegación por pestañas */}
        <div className="admin-tabs" role="tablist" aria-label="Secciones del panel de administración">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'reports'}
            className={`admin-tab ${activeTab === 'reports' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('reports')}
          >
            Reportes y analítica
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'inventory'}
            className={`admin-tab ${activeTab === 'inventory' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('inventory')}
          >
            Eventos, inventario y precios ({events.length})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'users'}
            className={`admin-tab ${activeTab === 'users' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            Usuarios y roles ({users.length})
          </button>
        </div>

        {/* MÓDULO 8: Reportes y analítica */}
        {activeTab === 'reports' && (
          <div role="tabpanel" aria-label="Reportes y analítica">
            <div className="admin-reports-grid">
              <article className="admin-card">
                <div className="admin-card__header">
                  <div>
                    <h2 className="admin-card__title">Ingresos y ocupación por evento</h2>
                    <p className="admin-card__subtitle">
                      Comparativa de ventas acumuladas por función en cartelera
                    </p>
                  </div>
                </div>

                <div className="admin-bar-list">
                  {analytics.eventRows.map((item) => {
                    const widthPct = Math.round((item.eventRevenue / analytics.maxEventRevenue) * 100)
                    return (
                      <div key={item.id} className="admin-bar-item">
                        <div className="admin-bar-item__top">
                          <span className="admin-bar-item__name">{item.title}</span>
                          <span className="admin-bar-item__meta">
                            {item.soldCount}/{item.totalSeats} ({item.occupancyPct}%) ·{' '}
                            <strong>{formatCurrency(item.eventRevenue)}</strong>
                          </span>
                        </div>
                        <div className="admin-bar-track" aria-hidden="true">
                          <div
                            className={`admin-bar-fill ${
                              item.status === 'soldout' ? 'admin-bar-fill--success' : ''
                            }`}
                            style={{ width: `${widthPct}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </article>

              <article className="admin-card">
                <div className="admin-card__header">
                  <div>
                    <h2 className="admin-card__title">Ventas por categoría y periodo</h2>
                    <p className="admin-card__subtitle">Distribución por línea cultural y mes</p>
                  </div>
                </div>

                <div className="admin-bar-list">
                  {analytics.categoryList.map((cat) => {
                    const pct =
                      analytics.totalRevenue > 0
                        ? Math.round((cat.revenue / analytics.totalRevenue) * 100)
                        : 0
                    return (
                      <div key={cat.category} className="admin-bar-item">
                        <div className="admin-bar-item__top">
                          <span className="admin-bar-item__name">{cat.category}</span>
                          <span className="admin-bar-item__meta">
                            {cat.sold} boletos · <strong>{formatCurrency(cat.revenue)}</strong> ({pct}%)
                          </span>
                        </div>
                        <div className="admin-bar-track" aria-hidden="true">
                          <div
                            className="admin-bar-fill admin-bar-fill--primary"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}

                  <hr style={{ border: 0, borderTop: '1px solid var(--color-line)', margin: '8px 0' }} />

                  {analytics.monthlyList.map((periodItem) => {
                    const pct =
                      analytics.totalRevenue > 0
                        ? Math.round((periodItem.revenue / analytics.totalRevenue) * 100)
                        : 0
                    return (
                      <div key={periodItem.period} className="admin-bar-item">
                        <div className="admin-bar-item__top">
                          <span className="admin-bar-item__name">Periodo: {periodItem.period}</span>
                          <span className="admin-bar-item__meta">
                            {periodItem.sold} boletos · {formatCurrency(periodItem.revenue)}
                          </span>
                        </div>
                        <div className="admin-bar-track" aria-hidden="true">
                          <div
                            className="admin-bar-fill admin-bar-fill--sky"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </article>
            </div>

            <article className="admin-card">
              <div className="admin-card__header">
                <div>
                  <h2 className="admin-card__title">Rendimiento por zona de localidad</h2>
                  <p className="admin-card__subtitle">
                    Desglose de ocupación e ingresos entre VIP Numerado, Diamante y Palco
                  </p>
                </div>
              </div>

              <div className="admin-zone-cards">
                {Object.keys(ZONES).map((zoneKey) => {
                  const z = analytics.zoneTotals[zoneKey]
                  const pct = z.capacity > 0 ? Math.round((z.sold / z.capacity) * 100) : 0
                  return (
                    <div key={zoneKey} className="admin-zone-box">
                      <h3 className="admin-zone-box__title">{ZONES[zoneKey].name}</h3>
                      <p className="admin-zone-box__money">{formatCurrency(z.revenue)}</p>
                      <div className="admin-bar-track" aria-hidden="true">
                        <div
                          className="admin-bar-fill admin-bar-fill--primary"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <p className="admin-zone-box__detail">
                        {z.sold} de {z.capacity} asientos vendidos ({pct}% de ocupación)
                      </p>
                    </div>
                  )
                })}
              </div>
            </article>
          </div>
        )}

        {/* MÓDULO 7: Eventos, inventario y precios */}
        {activeTab === 'inventory' && (
          <article className="admin-card" role="tabpanel" aria-label="Eventos, inventario y precios">
            <div className="admin-card__header">
              <div>
                <h2 className="admin-card__title">Inventario y tarifas por evento</h2>
                <p className="admin-card__subtitle">
                  Disponibilidad en tiempo real sincronizada con el mapa de asientos y compras locales
                </p>
              </div>

              <div className="admin-filters">
                <div className="admin-filter-group">
                  <label htmlFor="admin-cat-filter">Categoría</label>
                  <select
                    id="admin-cat-filter"
                    className="admin-select"
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat === 'all' ? 'Todas las categorías' : cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="admin-filter-group">
                  <label htmlFor="admin-status-filter">Estado</label>
                  <select
                    id="admin-status-filter"
                    className="admin-select"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="all">Todos los estados</option>
                    <option value="available">Disponible</option>
                    <option value="soldout">Agotado</option>
                    <option value="past">Finalizado</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th scope="col">Evento y recinto</th>
                    <th scope="col">Fecha</th>
                    <th scope="col">Tarifas por zona</th>
                    <th scope="col">Disponibilidad</th>
                    <th scope="col">Ingresos</th>
                    <th scope="col">Estado</th>
                    <th scope="col">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEvents.map((ev) => (
                    <tr key={ev.id}>
                      <td>
                        <span className="admin-event-cell__title">{ev.title}</span>
                        <span className="admin-event-cell__sub">
                          {ev.venue}
                          {ev.city ? `, ${ev.city}` : ''} · {ev.category}
                        </span>
                      </td>
                      <td>{formatShortDate(ev.date)}</td>
                      <td>
                        <div className="admin-zones-inline">
                          <span className="admin-chip">VIP ${ev.prices.vip}</span>
                          <span className="admin-chip">Diamante ${ev.prices.diamante}</span>
                          <span className="admin-chip">Palco ${ev.prices.palco}</span>
                        </div>
                      </td>
                      <td>
                        <strong>
                          {ev.availableCount} libres / {ev.totalSeats}
                        </strong>
                        <div className="admin-event-cell__sub">
                          VIP {ev.byZone.vip.total - ev.byZone.vip.sold}/{ev.byZone.vip.total} · Dia{' '}
                          {ev.byZone.diamante.total - ev.byZone.diamante.sold}/{ev.byZone.diamante.total} ·
                          Pal {ev.byZone.palco.total - ev.byZone.palco.sold}/{ev.byZone.palco.total}
                        </div>
                      </td>
                      <td>
                        <strong>{formatCurrency(ev.eventRevenue)}</strong>
                      </td>
                      <td>
                        <span className={`admin-badge admin-badge--${ev.status}`}>
                          {STATUS_LABEL[ev.status] || ev.status}
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="admin-table__link"
                          onClick={() => onSelectEvent && onSelectEvent(ev.id)}
                        >
                          Ver detalle
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>
        )}

        {/* MÓDULO 7: Usuarios y roles */}
        {activeTab === 'users' && (
          <article className="admin-card" role="tabpanel" aria-label="Usuarios y roles">
            <div className="admin-card__header">
              <div>
                <h2 className="admin-card__title">Directorio de usuarios y roles</h2>
                <p className="admin-card__subtitle">
                  Cuentas persistidas en localStorage con control de acceso basado en rol
                </p>
              </div>

              <div className="admin-filter-group">
                <label htmlFor="admin-role-filter">Filtrar por rol</label>
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

            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th scope="col">Usuario</th>
                    <th scope="col">Correo electrónico</th>
                    <th scope="col">Rol asignado</th>
                    <th scope="col">Órdenes en sesión</th>
                    <th scope="col">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((item) => {
                    const role = item.role || 'cliente'
                    const badgeClass =
                      role === 'administrador'
                        ? 'admin-badge--admin'
                        : role === 'organizador'
                          ? 'admin-badge--org'
                          : 'admin-badge--client'
                    const userOrdersCount = orders.filter((o) => o.userId === item.id).length

                    return (
                      <tr key={item.id}>
                        <td>
                          <div className="admin-user-cell">
                            <span className="admin-user-avatar" aria-hidden="true">
                              {(item.name || 'U').charAt(0).toUpperCase()}
                            </span>
                            <strong>{item.name}</strong>
                          </div>
                        </td>
                        <td>{item.email}</td>
                        <td>
                          <span className={`admin-badge ${badgeClass}`}>
                            {ROLE_TEXT[role] || role}
                          </span>
                        </td>
                        <td>{userOrdersCount}</td>
                        <td>
                          <span className="admin-badge admin-badge--available">Activo</span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </article>
        )}
      </div>
    </section>
  )
}

export default AdminPage