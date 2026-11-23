import AuthView from '../components/AuthView'

// Login y registro (diseño de Figma). AuthView guarda la cuenta en localStorage
// y avisa con onAuthSuccess(user); App guarda la sesión y vuelve a donde iba el usuario.
//   props: initialMode ('login' | 'register'), onLogin(user), onNavigate(vista)
function LoginPage({ initialMode = 'login', onLogin, onNavigate }) {
  // AuthView pide volver a "home"; en esta app esa vista se llama "events"
  const handleNavigate = (view) => onNavigate(view === 'home' ? 'events' : view)

  return <AuthView key={initialMode} initialMode={initialMode} onAuthSuccess={onLogin} onNavigate={handleNavigate} />
}

export default LoginPage
