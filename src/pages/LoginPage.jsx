import Button from '../components/Button'
import { USERS } from '../data/users'

// PANTALLA PROVISIONAL (persona B la reemplaza por el diseño de Login/Registro).
// Contrato que debe respetar la versión final:
//   props: onLogin(user)  → App guarda la sesión y vuelve a donde el usuario iba.
function LoginPage({ onLogin, onNavigate }) {
  return (
    <div className="page container login-placeholder">
      <h1 className="page__title">Iniciar sesión</h1>
      <p>Pantalla provisional: elige un usuario de prueba para continuar.</p>
      <ul className="login-placeholder__list">
        {USERS.map((user) => (
          <li key={user.id}>
            <Button block onClick={() => onLogin(user)}>
              Entrar como {user.name} ({user.role})
            </Button>
          </li>
        ))}
      </ul>
      <Button variant="outline" size="sm" onClick={() => onNavigate('events')}>Volver a eventos</Button>
    </div>
  )
}

export default LoginPage
