import { useState } from "react";
import Logo from "./Logo";
import { loginUser, registerUser } from "../services/auth";
import "./AuthSection.css";

export default function AuthView({
  initialMode = "login",
  onAuthSuccess,
  onNavigate,
}) {
  const [mode, setMode] = useState(initialMode); // "login" | "register"

  // Estados Login
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPass, setShowLoginPass] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Estados Registro
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [showRegPass, setShowRegPass] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  // Feedback
  const [feedback, setFeedback] = useState(null); // { type: "error" | "success", text: string }

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setFeedback(null);
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setFeedback(null);

    const result = loginUser({
      email: loginEmail,
      password: loginPassword,
      remember: rememberMe,
    });

    if (!result.ok) {
      setFeedback({ type: "error", text: result.error });
      return;
    }

    setFeedback({
      type: "success",
      text: `¡Bienvenido de nuevo, ${result.user.name}!`,
    });
    if (onAuthSuccess) onAuthSuccess(result.user);
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    setFeedback(null);

    if (regPassword !== regConfirmPassword) {
      setFeedback({
        type: "error",
        text: "Las contraseñas no coinciden.",
      });
      return;
    }

    if (!acceptTerms) {
      setFeedback({
        type: "error",
        text: "Debes aceptar los términos, condiciones y políticas de privacidad.",
      });
      return;
    }

    const result = registerUser({
      name: regName,
      email: regEmail,
      password: regPassword,
    });

    if (!result.ok) {
      setFeedback({ type: "error", text: result.error });
      return;
    }

    setFeedback({
      type: "success",
      text: `¡Cuenta creada! Sesión iniciada como ${result.user.name}.`,
    });
    if (onAuthSuccess) onAuthSuccess(result.user);
  };

  const handleDemoGoogle = () => {
    const result = loginUser({
      email: "luis.pacheco@easyticket.com",
      password: "Password123!",
      remember: true,
    });
    if (result.ok && onAuthSuccess) {
      onAuthSuccess(result.user);
    }
  };

  return (
    <section className="auth-page" aria-label="Autenticación de usuario">
      <div className="container auth-grid">
        {/* Columna izquierda: identidad de marca */}
        <div className="auth-brand-panel">
          <div className="auth-logo-box">
            <Logo height={96} />
            <span className="auth-brand-badge">Easy Ticket</span>
          </div>

          <h1 className="auth-slogan">Tu próxima experiencia cultural</h1>
          <p className="auth-sublead">Empieza aquí</p>
          <p className="auth-description">
            Conecta con la música, el teatro, el arte y mucho más. Encuentra y
            asegura tus boletos en un solo lugar.
          </p>

          <div className="auth-highlights">
            <div className="auth-highlight-item">
              <span>Boletos 100% Digitales</span>
            </div>
            <div className="auth-highlight-item">
              <span>Compra 100% Segura</span>
            </div>
            <div className="auth-highlight-item">
              <span>Acceso Anticipado</span>
            </div>
            <div className="auth-highlight-item">
              <span>Variedad Cultural</span>
            </div>
          </div>
        </div>

        {/* Columna derecha: tarjeta blanca de Login o Registro */}
        <div className="auth-card">
          {mode === "login" ? (
            <>
              <div className="auth-card-header">
                <h2>Iniciar sesión</h2>
                <p>Ingresa con tu cuenta para continuar</p>
              </div>

              {feedback && (
                <div
                  className={`auth-alert auth-alert--${feedback.type}`}
                  role="alert"
                >
                  {feedback.text}
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="auth-form" noValidate>
                <div className="auth-field">
                  <label htmlFor="login-email" className="sr-only">
                    Correo electrónico
                  </label>
                  <input
                    id="login-email"
                    type="email"
                    placeholder="Correo electrónico"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="auth-field auth-field--password">
                  <label htmlFor="login-password" className="sr-only">
                    Contraseña
                  </label>
                  <input
                    id="login-password"
                    type={showLoginPass ? "text" : "password"}
                    placeholder="Contraseña"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="auth-toggle-pass"
                    onClick={() => setShowLoginPass((prev) => !prev)}
                    aria-label="Mostrar u ocultar contraseña"
                  >
                    {showLoginPass ? "Ocultar" : "Ver"}
                  </button>
                </div>

                <div className="auth-row-between">
                  <label className="auth-checkbox">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    <span>Recordar mi cuenta</span>
                  </label>

                  <button
                    type="button"
                    className="auth-link-btn"
                    onClick={() =>
                      setFeedback({
                        type: "error",
                        text: "Cuenta demo disponible: luis.pacheco@easyticket.com / Password123!",
                      })
                    }
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>

                <button type="submit" className="btn-orange auth-submit">
                  Iniciar sesión →
                </button>

                <button
                  type="button"
                  className="btn-google"
                  onClick={handleDemoGoogle}
                >
                  Continuar con Google
                </button>
              </form>

              <p className="auth-switch-text">
                ¿No tienes una cuenta?{" "}
                <button
                  type="button"
                  className="auth-link-inline"
                  onClick={() => switchMode("register")}
                >
                  Regístrate
                </button>
              </p>
            </>
          ) : (
            <>
              <div className="auth-card-header">
                <h2>Crea tu cuenta</h2>
                <p>Regístrate para comprar tus boletos</p>
              </div>

              {feedback && (
                <div
                  className={`auth-alert auth-alert--${feedback.type}`}
                  role="alert"
                >
                  {feedback.text}
                </div>
              )}

              <form
                onSubmit={handleRegisterSubmit}
                className="auth-form"
                noValidate
              >
                <div className="auth-field">
                  <label htmlFor="reg-name" className="sr-only">
                    Nombre completo
                  </label>
                  <input
                    id="reg-name"
                    type="text"
                    placeholder="Nombre completo"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    required
                  />
                </div>

                <div className="auth-field">
                  <label htmlFor="reg-email" className="sr-only">
                    Correo electrónico
                  </label>
                  <input
                    id="reg-email"
                    type="email"
                    placeholder="Correo electrónico"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="auth-field auth-field--password">
                  <label htmlFor="reg-password" className="sr-only">
                    Contraseña
                  </label>
                  <input
                    id="reg-password"
                    type={showRegPass ? "text" : "password"}
                    placeholder="Contraseña"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="auth-toggle-pass"
                    onClick={() => setShowRegPass((prev) => !prev)}
                    aria-label="Mostrar u ocultar contraseña"
                  >
                    {showRegPass ? "Ocultar" : "Ver"}
                  </button>
                </div>

                <div className="auth-field">
                  <label htmlFor="reg-confirm-password" className="sr-only">
                    Confirmar contraseña
                  </label>
                  <input
                    id="reg-confirm-password"
                    type={showRegPass ? "text" : "password"}
                    placeholder="Confirmar contraseña"
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    required
                  />
                </div>

                <label className="auth-checkbox auth-checkbox--terms">
                  <input
                    type="checkbox"
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                  />
                  <span>
                    Acepto los términos, condiciones y políticas de privacidad
                  </span>
                </label>

                <button type="submit" className="btn-orange auth-submit">
                  Registrarse →
                </button>
              </form>

              <p className="auth-switch-text">
                ¿Ya tienes una cuenta?{" "}
                <button
                  type="button"
                  className="auth-link-inline"
                  onClick={() => switchMode("login")}
                >
                  Inicia sesión
                </button>
              </p>
            </>
          )}

          {onNavigate && (
            <button
              type="button"
              className="auth-back-home"
              onClick={() => onNavigate("home")}
            >
              ← Volver a eventos
            </button>
          )}
        </div>
      </div>

      {/* Franja inferior de beneficios y footer institucional */}
      <div className="auth-perks-strip">
        <div className="container auth-perks-grid">
          <div className="auth-perk">
            <strong>Compra segura</strong>
            <span>Tus datos y pagos son protegidos</span>
          </div>
          <div className="auth-perk">
            <strong>Proceso rápido</strong>
            <span>Tu entrada en pocos clics</span>
          </div>
          <div className="auth-perk">
            <strong>Vive la experiencia</strong>
            <span>Eventos de todo tipo para todos los gustos</span>
          </div>
        </div>
      </div>

      <footer className="auth-footer">
        <div className="container auth-footer-inner">
          <p>
            © 2026 Easy Ticket | Proyecto POU. Todos los derechos reservados.
            Universidad Centroamericana José Simeón Cañas
          </p>
        </div>
      </footer>
    </section>
  );
}