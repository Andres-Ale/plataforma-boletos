import { useNavigate, useLocation } from 'react-router'
import AuthView from '../components/AuthView'

// Login y registro. AuthView llama a useAuth().login/register (API falsa); al terminar,
// se vuelve a la ruta que el usuario intentaba abrir (location.state.from) o al inicio.
//   props: initialMode ('login' | 'register')
function LoginPage({ initialMode = 'login' }) {
  const navigate = useNavigate()
  const location = useLocation()
  const destination = location.state?.from ?? '/'

  return (
    <AuthView
      key={initialMode}
      initialMode={initialMode}
      onAuthSuccess={() => navigate(destination, { replace: true })}
      onNavigate={(view) => navigate(view === 'home' ? '/' : `/${view}`)}
    />
  )
}

export default LoginPage
