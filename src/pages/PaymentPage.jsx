import { useEffect, useRef, useState } from 'react'
import { Navigate, useNavigate } from 'react-router'
import Button from '../components/Button'
import Icon from '../components/Icon'
import Input from '../components/Input'
import OrderSummary from '../components/OrderSummary'
import PaymentMethodSelector from '../components/PaymentMethodSelector'
import StepIndicator from '../components/StepIndicator'
import { EmptyState, ErrorMessage } from '../components/StatusViews'
import { isAbortError } from '../api/client'
import { processPayment } from '../api/payments'
import { useAuth } from '../context/contexts'
import { useCart } from '../context/contexts'
import { useCatalog } from '../context/contexts'
import { formatPrice } from '../utils/format'
import { getSeatsTotal } from '../utils/seats'
import { formatCardNumber, formatExpiry, getCardBrand, validateCard } from '../utils/validation'

const FIELD_ORDER = ['name', 'number', 'expiry', 'cvc']
const FIELD_IDS = { name: 'card-name', number: 'card-number', expiry: 'card-expiry', cvc: 'card-cvc' }

// Checkout (paso 3): pago simulado. El carrito y la sesión vienen de los contextos globales.
function PaymentPage() {
  const { user } = useAuth()
  const { cart, clear } = useCart()
  const { events, placeOrder } = useCatalog()
  const navigate = useNavigate()

  const seats = cart.seats
  const event = events.find((e) => e.id === cart.eventId)
  const onBack = () => navigate('/carrito')
  const onGoEvents = () => navigate('/eventos')

  const [method, setMethod] = useState('card')
  const [form, setForm] = useState({ name: user?.name ?? '', number: '', expiry: '', cvc: '' })
  const [saveCard, setSaveCard] = useState(false)
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle') // idle | processing | error
  const [errorMessage, setErrorMessage] = useState('')

  const submittingRef = useRef(false) // evita doble envío aunque se pulse muy rápido
  const mountedRef = useRef(true)
  const controllerRef = useRef(null) // cancela el pago en curso si el usuario sale de la pantalla

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      controllerRef.current?.abort()
    }
  }, [])

  // El checkout es público en la tabla de rutas, pero pagar exige sesión: se envía al login y se vuelve aquí
  if (!user) return <Navigate to="/login" replace state={{ from: '/checkout' }} />

  if (!event || seats.length === 0) {
    return (
      <div className="page container">
        <EmptyState
          title="No tienes asientos seleccionados"
          text="Elige un evento y tus asientos para poder pagar."
          actionLabel="Ver eventos"
          onAction={onGoEvents}
        />
      </div>
    )
  }

  const total = getSeatsTotal(event, seats)
  const isProcessing = status === 'processing'

  const setField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  const submit = async (e) => {
    e?.preventDefault()
    if (submittingRef.current) return

    if (method === 'card') {
      const found = validateCard(form)
      setErrors(found)
      const firstInvalid = FIELD_ORDER.find((field) => found[field])
      if (firstInvalid) {
        document.getElementById(FIELD_IDS[firstInvalid])?.focus()
        return
      }
    }

    submittingRef.current = true
    setStatus('processing')
    setErrorMessage('')

    const controller = new AbortController()
    controllerRef.current = controller

    try {
      await processPayment({ method, cardNumber: form.number }, { signal: controller.signal })
      // La API revalida la disponibilidad y crea la orden (sin datos de tarjeta)
      const order = await placeOrder({ eventId: event.id, seats, user, method }, { signal: controller.signal })
      clear()
      navigate(`/confirmacion/${order.id}`, { replace: true })
    } catch (err) {
      if (isAbortError(err) || !mountedRef.current) return
      setStatus('error')
      setErrorMessage(err.message)
    } finally {
      submittingRef.current = false
    }
  }

  const brand = getCardBrand(form.number)

  return (
    <div className="page container payment">
      <Button variant="outline" size="sm" onClick={onBack} disabled={isProcessing}>
        <Icon name="arrowLeft" size={16} />
        Volver a selección de asientos
      </Button>

      <div className="step-wrap"><StepIndicator current={3} /></div>

      <div className="payment__head">
        <h1><Icon name="card" size={26} /> Finaliza tu compra</h1>
        <p>Ingresa los datos de tu método de pago</p>
      </div>

      <OrderSummary event={event} seats={seats} title="Resumen rápido" />

      <form className="payment__form" onSubmit={submit} noValidate>
        <PaymentMethodSelector value={method} onChange={setMethod} disabled={isProcessing} />

        {method === 'card' ? (
          <div className="payment__fields">
            <Input
              id="card-name"
              label="Nombre del titular:"
              autoComplete="cc-name"
              value={form.name}
              error={errors.name}
              disabled={isProcessing}
              onChange={(e) => setField('name', e.target.value)}
            />
            <Input
              id="card-number"
              label={`Número de tarjeta:${brand ? ` (${brand})` : ''}`}
              inputMode="numeric"
              autoComplete="cc-number"
              placeholder="1234 5678 9012 3456"
              value={form.number}
              error={errors.number}
              hint="Para probar un pago rechazado, usa una tarjeta que termine en 0000."
              disabled={isProcessing}
              onChange={(e) => setField('number', formatCardNumber(e.target.value))}
            />
            <div className="payment__row">
              <Input
                id="card-expiry"
                label="Fecha de expiración (MM/AA):"
                inputMode="numeric"
                autoComplete="cc-exp"
                placeholder="12/28"
                value={form.expiry}
                error={errors.expiry}
                disabled={isProcessing}
                onChange={(e) => setField('expiry', formatExpiry(e.target.value))}
              />
              <Input
                id="card-cvc"
                label="CVC/CVV:"
                type="password"
                inputMode="numeric"
                autoComplete="cc-csc"
                maxLength={4}
                placeholder="***"
                value={form.cvc}
                error={errors.cvc}
                disabled={isProcessing}
                onChange={(e) => setField('cvc', e.target.value.replace(/\D/g, ''))}
              />
            </div>

            <label className="payment__check">
              <input type="checkbox" checked={saveCard} onChange={(e) => setSaveCard(e.target.checked)} disabled={isProcessing} />
              Guardar tarjeta para futuras compras
            </label>
            {saveCard && (
              <p className="field__hint">Simulación: por seguridad, esta aplicación nunca guarda datos de tarjeta.</p>
            )}
          </div>
        ) : (
          <p className="payment__alt">
            Simulación: pagarás con {method === 'paypal' ? 'PayPal' : 'Bitcoin'}. No se abrirá ninguna pasarela real.
          </p>
        )}

        {status === 'error' && <ErrorMessage message={errorMessage} onRetry={() => submit()} />}

        <Button type="submit" block disabled={isProcessing}>
          {isProcessing ? (
            <>
              <span className="spinner spinner--sm" aria-hidden="true" />
              Procesando pago...
            </>
          ) : (
            <>
              <Icon name="lock" size={18} />
              Pagar {formatPrice(total)} USD
            </>
          )}
        </Button>
      </form>
    </div>
  )
}

export default PaymentPage
