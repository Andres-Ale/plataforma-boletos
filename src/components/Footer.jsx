import Logo from './Logo'
import Icon from './Icon'
import './Footer.css'

const FEATURES = [
  { icon: 'shield', title: 'Compra segura', text: 'Tus datos y pagos son protegidos' },
  { icon: 'bolt', title: 'Proceso rápido', text: 'Tu entrada en pocos clics' },
  { icon: 'heart', title: 'Vive la experiencia', text: 'Eventos de todo tipo para todos los gustos' },
]

const SOCIALS = [
  { label: 'Instagram', href: 'https://www.instagram.com' },
  { label: 'Facebook', href: 'https://www.facebook.com' },
  { label: 'X', href: 'https://x.com' },
  { label: 'YouTube', href: 'https://www.youtube.com' },
]

function Footer() {
  return (
    <footer className="footer">
      <ul className="footer__features">
        {FEATURES.map((f) => (
          <li key={f.title}>
            <Icon name={f.icon} size={28} />
            <span>
              <strong>{f.title}</strong>
              <br />
              {f.text}
            </span>
          </li>
        ))}
      </ul>

      <div className="footer__bottom">
        <div className="footer__row">
          <Logo height={40} />
          <ul className="footer__socials" aria-label="Redes sociales">
            {SOCIALS.map((s) => (
              <li key={s.label}>
                <a href={s.href} target="_blank" rel="noreferrer">{s.label}</a>
              </li>
            ))}
          </ul>
        </div>
        <p className="footer__copy">
          © 2026 Easy Ticket | Proyecto POU. Todos los derechos reservados. Universidad Centroamericana José Simeón Cañas
        </p>
      </div>
    </footer>
  )
}

export default Footer
