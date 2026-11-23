import './StepIndicator.css'

const STEPS = ['Evento', 'Asientos', 'Pago', 'Confirmación']

function StepIndicator({ current }) {
  return (
    <ol className="steps" aria-label="Progreso de la compra">
      {STEPS.map((label, index) => {
        const number = index + 1
        const state = number < current ? 'done' : number === current ? 'current' : 'todo'
        return (
          <li key={label} className={`steps__item steps__item--${state}`} aria-current={state === 'current' ? 'step' : undefined}>
            <span className="steps__dot" aria-hidden="true">{state === 'done' ? '✓' : number}</span>
            <span className="steps__label">{label}</span>
          </li>
        )
      })}
    </ol>
  )
}

export default StepIndicator
