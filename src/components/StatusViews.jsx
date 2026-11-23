import Button from './Button'
import Icon from './Icon'
import './StatusViews.css'

export function LoadingState({ message = 'Cargando...' }) {
  return (
    <div className="status-view" role="status" aria-live="polite">
      <span className="spinner" aria-hidden="true" />
      <p>{message}</p>
    </div>
  )
}

export function ErrorMessage({ message, onRetry }) {
  return (
    <div className="status-view status-view--error" role="alert">
      <Icon name="alert" size={36} />
      <p>{message}</p>
      {onRetry && <Button onClick={onRetry}>Reintentar</Button>}
    </div>
  )
}

export function EmptyState({ title, text, actionLabel, onAction }) {
  return (
    <div className="status-view">
      <h2 className="status-view__title">{title}</h2>
      {text && <p>{text}</p>}
      {actionLabel && <Button variant="outline" onClick={onAction}>{actionLabel}</Button>}
    </div>
  )
}
