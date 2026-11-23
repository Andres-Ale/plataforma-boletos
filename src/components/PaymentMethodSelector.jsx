import Icon from './Icon'
import './PaymentMethodSelector.css'

const METHODS = [
  { id: 'card', label: 'Tarjeta de crédito/débito', icon: 'card' },
  { id: 'paypal', label: 'PayPal' },
  { id: 'bitcoin', label: 'Bitcoin' },
]

// Grupo de opciones (radio) con aspecto de botones
function PaymentMethodSelector({ value, onChange, disabled }) {
  return (
    <fieldset className="methods" disabled={disabled}>
      <legend className="sr-only">Método de pago</legend>
      {METHODS.map((m) => (
        <label key={m.id} className="methods__option">
          <input
            type="radio"
            name="payment-method"
            value={m.id}
            checked={value === m.id}
            onChange={() => onChange(m.id)}
          />
          <span className="methods__box">
            {m.icon && <Icon name={m.icon} size={18} />}
            {m.label}
          </span>
        </label>
      ))}
    </fieldset>
  )
}

export default PaymentMethodSelector
