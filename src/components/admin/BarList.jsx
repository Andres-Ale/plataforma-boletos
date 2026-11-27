// Gráfico de barras horizontales hecho con CSS (sin librerías).
// rows: [{ key, label, meta, value }]; las barras se escalan contra `max` (o el mayor valor).
function BarList({ rows, max, tone = 'primary', label }) {
  const top = max ?? Math.max(1, ...rows.map((row) => row.value))

  return (
    <ul className="admin-bar-list" aria-label={label}>
      {rows.map((row) => {
        const width = Math.round((row.value / top) * 100)
        return (
          <li key={row.key} className="admin-bar-item">
            <div className="admin-bar-item__top">
              <span className="admin-bar-item__name">{row.label}</span>
              <span className="admin-bar-item__meta">{row.meta}</span>
            </div>
            <div className="admin-bar-track" aria-hidden="true">
              <div className={`admin-bar-fill admin-bar-fill--${tone}`} style={{ width: `${width}%` }} />
            </div>
          </li>
        )
      })}
    </ul>
  )
}

export default BarList
