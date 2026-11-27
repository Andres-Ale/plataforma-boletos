// Tarjeta de indicador del panel. tone: 'accent' | 'sky' | 'success' | undefined
function KpiCard({ label, value, hint, tone }) {
  return (
    <article className={`admin-kpi-card ${tone ? `admin-kpi-card--${tone}` : ''}`}>
      <span className="admin-kpi-card__label">{label}</span>
      <strong className="admin-kpi-card__value">{value}</strong>
      {hint && <span className="admin-kpi-card__hint">{hint}</span>}
    </article>
  )
}

export default KpiCard
