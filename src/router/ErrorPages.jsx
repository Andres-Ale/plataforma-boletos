import { Link, isRouteErrorResponse, useRouteError } from 'react-router'
import Button from '../components/Button'

// Ruta "*": página no encontrada
export function NotFoundPage() {
  return (
    <div className="page container">
      <div className="status-view">
        <p className="status-view__code" aria-hidden="true">404</p>
        <h1 className="status-view__title">Página no encontrada</h1>
        <p>La dirección que buscas no existe o fue movida.</p>
        <Button as={Link} to="/eventos">Ver eventos</Button>
      </div>
    </div>
  )
}

// errorElement: errores inesperados al renderizar una ruta
export function RouteError() {
  const error = useRouteError()
  const message = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : 'Ocurrió un error inesperado en esta pantalla.'

  return (
    <div className="page container">
      <div className="status-view status-view--error" role="alert">
        <h1 className="status-view__title">Algo salió mal</h1>
        <p>{message}</p>
        <Button as={Link} to="/">Volver al inicio</Button>
      </div>
    </div>
  )
}
