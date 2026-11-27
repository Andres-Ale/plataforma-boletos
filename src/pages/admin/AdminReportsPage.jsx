import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import BarList from '../../components/admin/BarList'
import KpiCard from '../../components/admin/KpiCard'
import { useCatalog } from '../../context/contexts'
import { formatMonthLabel, formatPrice, formatShortDate } from '../../utils/format'
import {
  chooseUnit,
  filterOrders,
  groupByCategory,
  groupByEvent,
  groupByPeriod,
  groupByZone,
  ordersToCsv,
  summarize,
} from '../../utils/reports'
import { ZONES } from '../../utils/seats'

const EMPTY = { eventId: '', from: '', to: '' }

// /admin/reportes (solo Administrador): reportes dinámicos por evento y por periodo, a partir de las órdenes.
function AdminReportsPage() {
  const { events, orders } = useCatalog()
  const [filters, setFilters] = useState(EMPTY)

  const setFilter = (field, value) => setFilters((prev) => ({ ...prev, [field]: value }))

  // Valores derivados: ningún total se guarda en estado
  const report = useMemo(() => {
    const matching = filterOrders(orders, filters)
    const totals = summarize(matching)
    const unit = chooseUnit(matching)
    return {
      matching: [...matching].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
      totals,
      unit,
      byEvent: groupByEvent(matching, events),
      byPeriod: groupByPeriod(matching, unit),
      byCategory: groupByCategory(matching, events),
      byZone: groupByZone(matching, events),
    }
  }, [orders, events, filters])

  const applyLastDays = (days) => {
    const end = new Date()
    const start = new Date(end.getTime() - days * 86_400_000)
    setFilters((prev) => ({ ...prev, from: start.toISOString().slice(0, 10), to: end.toISOString().slice(0, 10) }))
  }

  const downloadCsv = () => {
    const blob = new Blob([ordersToCsv(report.matching, events)], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'reporte-ventas-easyticket.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="admin-stack">
      <article className="admin-card">
        <div className="admin-card__header">
          <div>
            <h2 className="admin-card__title">Filtros del reporte</h2>
            <p className="admin-card__subtitle">Filtra las órdenes por evento y por rango de fechas</p>
          </div>
          <div className="admin-quick">
            <button type="button" className="admin-btn-secondary" onClick={() => applyLastDays(30)}>Últimos 30 días</button>
            <button type="button" className="admin-btn-secondary" onClick={() => setFilters(EMPTY)}>Todo el historial</button>
            <button type="button" className="admin-btn-primary" onClick={downloadCsv} disabled={report.matching.length === 0}>
              Exportar CSV
            </button>
          </div>
        </div>

        <div className="admin-filters">
          <div className="admin-filter-group">
            <label htmlFor="rep-event">Evento</label>
            <select id="rep-event" className="admin-select" value={filters.eventId} onChange={(e) => setFilter('eventId', e.target.value)}>
              <option value="">Todos los eventos</option>
              {events.map((ev) => <option key={ev.id} value={ev.id}>{ev.title}</option>)}
            </select>
          </div>
          <div className="admin-filter-group">
            <label htmlFor="rep-from">Desde</label>
            <input id="rep-from" type="date" className="admin-select" value={filters.from} onChange={(e) => setFilter('from', e.target.value)} />
          </div>
          <div className="admin-filter-group">
            <label htmlFor="rep-to">Hasta</label>
            <input id="rep-to" type="date" className="admin-select" value={filters.to} onChange={(e) => setFilter('to', e.target.value)} />
          </div>
        </div>
      </article>

      <div className="admin-kpis" role="region" aria-label="Totales del periodo">
        <KpiCard tone="accent" label="Ingresos" value={formatPrice(report.totals.revenue)} hint="En el filtro seleccionado" />
        <KpiCard label="Boletos vendidos" value={`${report.totals.tickets}`} hint="Asientos confirmados" />
        <KpiCard tone="sky" label="Órdenes" value={`${report.totals.count}`} hint="Compras registradas" />
        <KpiCard tone="success" label="Ticket promedio" value={formatPrice(report.totals.average)} hint="Por orden" />
      </div>

      {report.matching.length === 0 ? (
        <article className="admin-card">
          <p className="admin-empty">No hay órdenes en ese periodo o evento. Prueba ampliando las fechas.</p>
        </article>
      ) : (
        <>
          <div className="admin-reports-grid">
            <article className="admin-card">
              <h2 className="admin-card__title">Ventas por evento</h2>
              <p className="admin-card__subtitle">Ingresos y boletos emitidos por función</p>
              <BarList
                label="Ventas por evento"
                rows={report.byEvent.map(({ event, revenue, tickets }) => ({
                  key: event.id,
                  label: event.title,
                  meta: `${tickets} boletos · ${formatPrice(revenue)}`,
                  value: revenue,
                }))}
              />
            </article>

            <article className="admin-card">
              <h2 className="admin-card__title">
                Ventas por periodo ({report.unit === 'month' ? 'mensual' : 'diario'})
              </h2>
              <p className="admin-card__subtitle">Evolución cronológica de los ingresos</p>
              <BarList
                tone="sky"
                label="Ventas por periodo"
                rows={report.byPeriod.map((row) => ({
                  key: row.key,
                  label: report.unit === 'month' ? formatMonthLabel(row.key) : row.key,
                  meta: `${row.tickets} boletos · ${formatPrice(row.revenue)}`,
                  value: row.revenue,
                }))}
              />
            </article>
          </div>

          <div className="admin-reports-grid">
            <article className="admin-card">
              <h2 className="admin-card__title">Ventas por categoría</h2>
              <BarList
                tone="success"
                label="Ventas por categoría"
                rows={report.byCategory.map((row) => ({
                  key: row.category,
                  label: row.category,
                  meta: `${row.tickets} boletos · ${formatPrice(row.revenue)}`,
                  value: row.revenue,
                }))}
              />
            </article>

            <article className="admin-card">
              <h2 className="admin-card__title">Rendimiento por zona</h2>
              <div className="admin-zone-cards">
                {Object.keys(ZONES).map((zone) => {
                  const z = report.byZone[zone]
                  return (
                    <div key={zone} className="admin-zone-box">
                      <h3 className="admin-zone-box__title">{ZONES[zone].name}</h3>
                      <p className="admin-zone-box__money">{formatPrice(z.revenue)}</p>
                      <p className="admin-zone-box__detail">{z.tickets} boletos vendidos</p>
                    </div>
                  )
                })}
              </div>
            </article>
          </div>

          <article className="admin-card">
            <h2 className="admin-card__title">Órdenes del periodo ({report.matching.length})</h2>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th scope="col">Código</th>
                    <th scope="col">Fecha</th>
                    <th scope="col">Evento</th>
                    <th scope="col">Cliente</th>
                    <th scope="col">Boletos</th>
                    <th scope="col">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {report.matching.slice(0, 20).map((order) => {
                    const event = events.find((e) => e.id === order.eventId)
                    return (
                      <tr key={order.id}>
                        <td><Link to={`/verificar/${order.id}`} className="admin-table__link">#{order.id}</Link></td>
                        <td>{formatShortDate(order.createdAt)}</td>
                        <td>{event ? event.title : 'Evento eliminado'}</td>
                        <td>{order.userName}</td>
                        <td>{order.seats.length} ({order.seats.join(', ')})</td>
                        <td><strong>{formatPrice(order.total)}</strong></td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </article>
        </>
      )}
    </div>
  )
}

export default AdminReportsPage
