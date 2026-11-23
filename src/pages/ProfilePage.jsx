import ProfileView from '../components/ProfileView'

// Perfil de usuario. ProfileView edita nombre y correo en localStorage.
//   props: user (sesión actual), onUserChange(user | null), onNavigate(vista)
function ProfilePage({ user, onUserChange, onNavigate }) {
  const handleNavigate = (view) => onNavigate(view === 'home' ? 'events' : view)

  return <ProfileView session={user} onSessionChange={onUserChange} onNavigate={handleNavigate} />
}

export default ProfilePage
