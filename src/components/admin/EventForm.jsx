import { useState } from 'react'
import { EVENT_KINDS, validateEvent } from '../../utils/validation'

// Afiches disponibles en public/images/events/ (evita pedir subir archivos sin servidor)
const POSTERS = [
  { label: 'Turandot', value: 'images/events/turandot.webp' },
  { label: 'La traviata', value: 'images/events/la-traviata.webp' },
  { label: 'Carmen', value: 'images/events/carmen.webp' },
  { label: 'I Pagliacci', value: 'images/events/i-pagliacci.webp' },
  { label: 'Hans Zimmer', value: 'images/events/hans-zimmer.webp' },
  { label: 'John Williams', value: 'images/events/john-williams.webp' },
  { label: 'Einaudi', value: 'images/events/einaudi.webp' },
  { label: 'Morricone', value: 'images/events/morricone.webp' },
]

const EMPTY = {
  title: '',
  subtitle: '',
  kind: 'Concierto',
  category: 'Cine y Conciertos Sinfónicos',
  date: '2027-07-15T20:00',
  venue: '',
  city: '',
  duration: '120 minutos',
  rating: 'Todo público',
  synopsis: '',
  prices: { vip: 80, diamante: 40, palco: 75 },
  image: POSTERS[0].value,
}

const toInitial = (event) =>
  event
    ? {
        ...EMPTY,
        ...event,
        date: event.date.slice(0, 16), // formato que pide <input type="datetime-local">
        prices: { ...event.prices },
      }
    : EMPTY

// Formulario controlado de alta y edición de eventos.
function EventForm({ initialEvent, categories, onSave, onCancel }) {
  const [form, setForm] = useState(() => toInitial(initialEvent))
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState('')
  const [saving, setSaving] = useState(false)

  const setField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  const setPrice = (zone, value) => {
    setForm((prev) => ({ ...prev, prices: { ...prev.prices, [zone]: value } }))
    if (errors[`price_${zone}`]) setErrors((prev) => ({ ...prev, [`price_${zone}`]: undefined }))
  }

  const submit = async (e) => {
    e.preventDefault()
    if (saving) return
    const payload = { ...form, date: form.date.length === 16 ? `${form.date}:00` : form.date }
    const found = validateEvent(payload)
    setErrors(found)
    if (Object.keys(found).length > 0) return

    setSaving(true)
    setApiError('')
    try {
      await onSave(payload)
    } catch (err) {
      if (err.fields) setErrors(err.fields)
      setApiError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form className="admin-form" onSubmit={submit} noValidate aria-label={initialEvent ? 'Editar evento' : 'Nuevo evento'}>
      <h3 className="admin-form__title">{initialEvent ? `Editar: ${initialEvent.title}` : 'Nuevo evento'}</h3>

      {apiError && <p className="admin-alert admin-alert--error" role="alert">{apiError}</p>}

      <div className="admin-form__grid">
        <Field id="ev-title" label="Título *" error={errors.title}>
          <input id="ev-title" value={form.title} onChange={(e) => setField('title', e.target.value)} disabled={saving} />
        </Field>

        <Field id="ev-subtitle" label="Subtítulo">
          <input id="ev-subtitle" value={form.subtitle} onChange={(e) => setField('subtitle', e.target.value)} disabled={saving} />
        </Field>

        <Field id="ev-kind" label="Tipo *" error={errors.kind}>
          <select id="ev-kind" value={form.kind} onChange={(e) => setField('kind', e.target.value)} disabled={saving}>
            {EVENT_KINDS.map((k) => <option key={k} value={k}>{k}</option>)}
          </select>
        </Field>

        <Field id="ev-cat" label="Categoría *" error={errors.category}>
          <input id="ev-cat" list="ev-categories" value={form.category} onChange={(e) => setField('category', e.target.value)} disabled={saving} />
          <datalist id="ev-categories">
            {categories.map((c) => <option key={c} value={c} />)}
          </datalist>
        </Field>

        <Field id="ev-date" label="Fecha y hora *" error={errors.date}>
          <input id="ev-date" type="datetime-local" value={form.date} onChange={(e) => setField('date', e.target.value)} disabled={saving} />
        </Field>

        <Field id="ev-poster" label="Afiche">
          <select id="ev-poster" value={form.image} onChange={(e) => setField('image', e.target.value)} disabled={saving}>
            {POSTERS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
        </Field>

        <Field id="ev-venue" label="Recinto / lugar *" error={errors.venue}>
          <input id="ev-venue" value={form.venue} onChange={(e) => setField('venue', e.target.value)} disabled={saving} />
        </Field>

        <Field id="ev-city" label="Ciudad">
          <input id="ev-city" value={form.city} onChange={(e) => setField('city', e.target.value)} disabled={saving} />
        </Field>

        <Field id="ev-duration" label="Duración">
          <input id="ev-duration" value={form.duration} onChange={(e) => setField('duration', e.target.value)} disabled={saving} />
        </Field>

        <Field id="ev-rating" label="Clasificación">
          <input id="ev-rating" value={form.rating} onChange={(e) => setField('rating', e.target.value)} disabled={saving} />
        </Field>

        <Field id="ev-vip" label="Precio VIP (USD) *" error={errors.price_vip}>
          <input id="ev-vip" type="number" min="1" step="1" value={form.prices.vip} onChange={(e) => setPrice('vip', e.target.value)} disabled={saving} />
        </Field>

        <Field id="ev-dia" label="Precio Diamante (USD) *" error={errors.price_diamante}>
          <input id="ev-dia" type="number" min="1" step="1" value={form.prices.diamante} onChange={(e) => setPrice('diamante', e.target.value)} disabled={saving} />
        </Field>

        <Field id="ev-pal" label="Precio Palco (USD) *" error={errors.price_palco}>
          <input id="ev-pal" type="number" min="1" step="1" value={form.prices.palco} onChange={(e) => setPrice('palco', e.target.value)} disabled={saving} />
        </Field>
      </div>

      <Field id="ev-synopsis" label="Sinopsis">
        <textarea id="ev-synopsis" rows={3} value={form.synopsis} onChange={(e) => setField('synopsis', e.target.value)} disabled={saving} />
      </Field>

      <div className="admin-form__actions">
        <button type="button" className="admin-btn-secondary" onClick={onCancel} disabled={saving}>Cancelar</button>
        <button type="submit" className="admin-btn-primary" disabled={saving}>
          {saving ? 'Guardando...' : initialEvent ? 'Guardar cambios' : 'Crear evento'}
        </button>
      </div>
    </form>
  )
}

function Field({ id, label, error, children }) {
  return (
    <div className={`admin-field ${error ? 'admin-field--error' : ''}`}>
      <label htmlFor={id}>{label}</label>
      {children}
      {error && <span className="admin-field__error" role="alert">{error}</span>}
    </div>
  )
}

export default EventForm
