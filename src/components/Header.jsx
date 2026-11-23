import { useEffect, useRef, useState } from 'react'
import Logo from './Logo'
import Icon from './Icon'
import Button from './Button'
import './Header.css'

const NAV = [
  { label: 'Inicio', view: 'events' },
  { label: 'Eventos', view: 'events', scrollTo: 'eventos' },
  { label: 'Categorías', view: 'events', scrollTo: 'categorias' },
  { label: 'Ayuda', view: 'help' },
]

function Header({ user, cartCount, currentView, onNavigate, onLogout, onCartClick }) {
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

  const go = (view, params = {}) => {
    setMenuOpen(false)
    setUserMenuOpen(false)
    onNavigate(view, params)
  }

  const canManage = user && (user.role === 'administrador' || user.role === 'organizador')

  return (
    <header className="header">
      <div className="header__inner">
        <button type="button" className="header__logo" onClick={() => go('events')} aria-label="Easy Ticket, ir al inicio">
          <Logo />
        </button>

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
            {NAV.map((item) => (
              <li key={item.label}>
                <button
                  type="button"
                  className="header__link"
                  aria-current={item.view === currentView && !item.scrollTo ? 'page' : undefined}
                  onClick={() => go(item.view, item.scrollTo ? { scrollTo: item.scrollTo } : {})}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="header__actions">
          {user ? (
            <>
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
                    <li><button type="button" onClick={() => go('tickets')}>Mis boletos</button></li>
                    <li><button type="button" onClick={() => go('profile')}>Mi perfil</button></li>
                    {canManage && <li><button type="button" onClick={() => go('admin')}>Panel de administración</button></li>}
                    <li>
                      <button type="button" onClick={() => { setUserMenuOpen(false); setMenuOpen(false); onLogout() }}>
                        Cerrar sesión
                      </button>
                    </li>
                  </ul>
                )}
              </div>

              <button type="button" className="cart-btn" onClick={onCartClick} aria-label={`Carrito, ${cartCount} asientos`}>
                <Icon name="cart" size={20} />
                {cartCount > 0 && <span className="cart-btn__badge" aria-hidden="true">{cartCount}</span>}
              </button>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" className="header__register" onClick={() => go('register')}>
                Crear cuenta
              </Button>
              <Button variant="outline" size="sm" onClick={() => go('login')}>
                <Icon name="user" size={16} />
                Iniciar sesión
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
