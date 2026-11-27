import { Link, Navigate, Outlet, useLocation } from 'react-router'
import Button from '../components/Button'
import { useAuth } from '../context/contexts'

// Ruta protegida (layout): exige sesión y, opcionalmente, uno de los `roles` indicados.
//  - Sin sesión  → redirige a /login y recuerda a dónde iba (state.from).
//  - Rol no permitido → muestra "Acceso restringido" (no es un 404: la ruta existe).
function RequireAuth({ roles }) {
  const { user } = useAuth()
  const location = useLocation()

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />
  }

  if (roles && !roles.includes(user.role)) {
    return (
      <div className="page container">
        <div className="status-view" role="alert">
          <h1 className="status-view__title">Acceso restringido</h1>
          <p>
            Tu cuenta tiene el rol <strong>{user.role}</strong> y no puede ver esta sección. Inicia sesión con una cuenta de{' '}
            {roles.join(' o ')}.
          </p>
          <Button as={Link} to="/">Volver al inicio</Button>
        </div>
      </div>
    )
  }

  return <Outlet />
}

export default RequireAuth
