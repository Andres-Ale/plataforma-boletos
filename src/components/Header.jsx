import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router'
import Logo from './Logo'
import Icon from './Icon'
import Button from './Button'
import { useAuth } from '../context/contexts'
import { useCart } from '../context/contexts'
import useLogout from '../context/useLogout'
import './Header.css'

function Header({ onCartClick }) {
  const { user } = useAuth()
  const { count: cartCount } = useCart()
  const logout = useLogout()
  const location = useLocation()

  const [menuOpen, setMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const userMenuRef = useRef(null)

  // Cierra el menú de usuario al hacer clic fuera o con Escape
  useEffect(() => {
    if (!userMenuOpen) return undefined

    const handleClick = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setUserMenuOpen(false)
    }
    const handleKey = (e) => {
      if (e.key === 'Escape') setUserMenuOpen(false)
    }

    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [userMenuOpen])

  const closeMenus = () => {
    setMenuOpen(false)
    setUserMenuOpen(false)
  }

  const canManage = user && (user.role === 'administrador' || user.role === 'organizador')
  const authState = { from: location.pathname }

  return (
    <header className="header">
      <div className="header__inner">
        <Link to="/" className="header__logo" onClick={closeMenus} aria-label="Easy Ticket, ir al inicio">
          <Logo />
        </Link>

        <button
          type="button"
          className="header__burger"
          aria-expanded={menuOpen}
          aria-controls="main-nav"
          aria-label="Menú principal"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <Icon name={menuOpen ? 'close' : 'menu'} size={24} />
        </button>

        <nav id="main-nav" className={`header__nav ${menuOpen ? 'is-open' : ''}`} aria-label="Principal">
          <ul>
            <li>
              <NavLink to="/" end className="header__link" onClick={closeMenus}>Inicio</NavLink>
            </li>
            <li>
              <NavLink to="/eventos" className="header__link" onClick={closeMenus}>Eventos</NavLink>
            </li>
            <li>
              <Link to="/eventos#categorias" className="header__link" onClick={closeMenus}>Categorías</Link>
            </li>
            <li>
              <NavLink to="/ayuda" className="header__link" onClick={closeMenus}>Ayuda</NavLink>
            </li>
          </ul>
        </nav>

        <div className="header__actions">
          {user ? (
            <div className="user-menu" ref={userMenuRef}>
              <button
                type="button"
                className="user-menu__btn"
                aria-expanded={userMenuOpen}
                aria-label={`Menú de ${user.name}`}
                onClick={() => setUserMenuOpen((open) => !open)}
              >
                <Icon name="user" size={16} />
                <span className="user-menu__name">{user.name}</span>
                <Icon name="chevronDown" size={14} />
              </button>
              {userMenuOpen && (
                <ul className="user-menu__list">
                  <li><Link to="/boletos" onClick={closeMenus}>Mis boletos</Link></li>
                  <li><Link to="/perfil" onClick={closeMenus}>Mi perfil</Link></li>
                  {canManage && <li><Link to="/admin" onClick={closeMenus}>Panel de administración</Link></li>}
                  <li>
                    <button type="button" onClick={() => { closeMenus(); logout() }}>
                      Cerrar sesión
                    </button>
                  </li>
                </ul>
              )}
            </div>
          ) : (
            <>
              <Button as={Link} to="/registro" state={authState} variant="outline" size="sm" className="header__register">
                Crear cuenta
              </Button>
              <Button as={Link} to="/login" state={authState} variant="outline" size="sm">
                <Icon name="user" size={16} />
                Iniciar sesión
              </Button>
            </>
          )}

          <button type="button" className="cart-btn" onClick={onCartClick} aria-label={`Carrito, ${cartCount} asientos`}>
            <Icon name="cart" size={20} />
            {cartCount > 0 && <span className="cart-btn__badge" aria-hidden="true">{cartCount}</span>}
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header
