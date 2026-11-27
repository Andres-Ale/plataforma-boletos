import { useNavigate } from 'react-router'
import ProfileView from '../components/ProfileView'
import { useAuth } from '../context/contexts'
import useLogout from '../context/useLogout'

// Perfil de usuario (ruta protegida): edita nombre y correo contra la API falsa.
function ProfilePage() {
  const { user, updateProfile } = useAuth()
  const logout = useLogout()
  const navigate = useNavigate()

  return (
    <ProfileView
      session={user}
      onSave={(data) => updateProfile(user.id, data)}
      onLogout={logout}
      onNavigate={(view) => navigate(view === 'home' ? '/eventos' : `/${view}`)}
    />
  )
}

export default ProfilePage
