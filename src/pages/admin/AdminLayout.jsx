import { Link, NavLink, Outlet } from 'react-router'
import { ROLES, useAuth } from '../../context/contexts'
import './admin.css'

const ROLE_TEXT = {
  administrador: 'Administrador',
  organizador: 'Organizador',
  cliente: 'Cliente',
}

// Layout compartido de /admin/*: cabecera + navegación entre secciones + <Outlet />.
// La pestaña "Reportes" solo aparece para el rol Administrador (la ruta también está protegida).
function AdminLayout() {
  const { user } = useAuth()
  const isAdmin = user?.role === ROLES.admin

  const tabClass = ({ isActive }) => `admin-tab ${isActive ? 'is-active' : ''}`

  return (
    <section className="admin-page" aria-label="Panel de administración">
      <div className="admin-container">
        <header className="admin-hero">
          <div>
            <span className="admin-hero__eyebrow">Easy Ticket · Gestión y Analítica</span>
            <h1 className="admin-hero__title">Panel de Administración</h1>
            <p className="admin-hero__subtitle">
              Sesión activa: <strong>{user.name}</strong> ({user.email})
            </p>
          </div>
          <div className="admin-hero__actions">
            <span className="admin-role-pill">Rol: {ROLE_TEXT[user.role] || user.role}</span>
            <Link to="/eventos" className="admin-btn-primary">Ver cartelera</Link>
          </div>
        </header>

        <nav className="admin-tabs" aria-label="Secciones del panel">
          <NavLink to="/admin" end className={tabClass}>Resumen</NavLink>
          <NavLink to="/admin/eventos" className={tabClass}>Eventos (CRUD)</NavLink>
          <NavLink to="/admin/inventario" className={tabClass}>Inventario y precios</NavLink>
          {isAdmin && <NavLink to="/admin/reportes" className={tabClass}>Reportes</NavLink>}
        </nav>

        <Outlet />
      </div>
    </section>
  )
}

export default AdminLayout
