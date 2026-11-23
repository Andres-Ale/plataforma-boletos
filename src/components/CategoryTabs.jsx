import './CategoryTabs.css'

function CategoryTabs({ categories, selected, onSelect }) {
  const options = [{ value: '', label: 'Todas' }, ...categories.map((c) => ({ value: c, label: c }))]

  return (
    <div id="categorias" className="category-tabs" role="group" aria-label="Filtrar por categoría">
      {options.map((opt) => (
        <button
          key={opt.value || 'all'}
          type="button"
          className="category-tabs__btn"
          aria-pressed={selected === opt.value}
          onClick={() => onSelect(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

export default CategoryTabs
