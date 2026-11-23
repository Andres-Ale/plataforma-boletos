import './Input.css'

// Campo con etiqueta asociada, ayuda y mensaje de error accesible
function Input({ id, label, error, hint, className = '', ...rest }) {
  const describedBy = [error && `${id}-error`, hint && `${id}-hint`].filter(Boolean).join(' ') || undefined

  return (
    <div className={`field ${error ? 'field--error' : ''} ${className}`}>
      <label htmlFor={id} className="field__label">{label}</label>
      <input
        id={id}
        className="field__input"
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        {...rest}
      />
      {hint && <p id={`${id}-hint`} className="field__hint">{hint}</p>}
      {error && <p id={`${id}-error`} className="field__error" role="alert">{error}</p>}
    </div>
  )
}

export default Input
