import { useEffect, useRef, useState } from "react";
import Logo from "./Logo";
import { DEMO_ACCOUNTS, DEMO_PASSWORD, requestPasswordReset } from "../api/auth";
import { useAuth } from "../context/contexts";
import "./AuthSection.css";

export default function AuthView({
  initialMode = "login",
  onAuthSuccess,
  onNavigate,
}) {
  const { login, register } = useAuth();
  const [mode, setMode] = useState(initialMode); // "login" | "register" | "recover"
  const [busy, setBusy] = useState(false); // operación en curso contra la API falsa
  const busyRef = useRef(false); // evita el doble envío aunque se pulse muy rápido

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

  // Recuperación de contraseña (simulada)
  const [recoverEmail, setRecoverEmail] = useState("");
  const [recoverStatus, setRecoverStatus] = useState("idle"); // "idle" | "sending"
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Feedback
  const [feedback, setFeedback] = useState(null); // { type: "error" | "success", text: string }

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setFeedback(null);
  };

  // Ejecuta una operación de la API falsa: bloquea el doble envío y muestra el error si falla
  const runAuth = async (operation, successText) => {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    setFeedback(null);
    try {
      const user = await operation();
      if (!mountedRef.current) return;
      setFeedback({ type: "success", text: successText(user) });
      if (onAuthSuccess) onAuthSuccess(user);
    } catch (err) {
      if (!mountedRef.current) return;
      setFeedback({ type: "error", text: err.message });
    } finally {
      busyRef.current = false;
      if (mountedRef.current) setBusy(false);
    }
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    runAuth(
      () => login({ email: loginEmail, password: loginPassword, remember: rememberMe }),
      (user) => `¡Bienvenido de nuevo, ${user.name}!`
    );
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

    runAuth(
      () => register({ name: regName, email: regEmail, password: regPassword }),
      (user) => `¡Cuenta creada! Sesión iniciada como ${user.name}.`
    );
  };

  const handleRecoverSubmit = async (e) => {
    e.preventDefault();
    if (recoverStatus === "sending") return; // evita doble envío
    setFeedback(null);
    setRecoverStatus("sending");
    try {
      await requestPasswordReset(recoverEmail);
      if (!mountedRef.current) return;
      setRecoverStatus("idle");
      setFeedback({
        type: "success",
        text: `Si ${recoverEmail.trim()} está registrado, recibirás instrucciones para restablecer tu contraseña. (Simulación: no se envía ningún correo real.)`,
      });
    } catch (err) {
      if (!mountedRef.current) return;
      setRecoverStatus("idle");
      setFeedback({ type: "error", text: err.message });
    }
  };

  // Inicio de sesión social simulado: entra con la primera cuenta de demostración
  const handleDemoGoogle = () => {
    runAuth(
      () => login({ email: DEMO_ACCOUNTS[0].email, password: DEMO_PASSWORD, remember: true }),
      (user) => `¡Bienvenido, ${user.name}!`
    );
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
                    onClick={() => switchMode("recover")}
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>

                <button type="submit" className="btn-orange auth-submit" disabled={busy}>
                  Iniciar sesión →
                </button>

                <button
                  type="button"
                  className="btn-google"
                  onClick={handleDemoGoogle}
                >
                  Continuar con Google (demo)
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

              <details className="auth-demo">
                <summary>Cuentas de prueba</summary>
                <ul>
                  {DEMO_ACCOUNTS.map((account) => (
                    <li key={account.email}>
                      {account.email} · {account.role}
                    </li>
                  ))}
                  <li>Contraseña de todas: {DEMO_PASSWORD}</li>
                </ul>
              </details>
            </>
          ) : mode === "recover" ? (
            <>
              <div className="auth-card-header">
                <h2>Recupera tu contraseña</h2>
                <p>Ingresa tu correo y te enviaremos instrucciones</p>
              </div>

              {feedback && (
                <div className={`auth-alert auth-alert--${feedback.type}`} role="alert">
                  {feedback.text}
                </div>
              )}

              <form onSubmit={handleRecoverSubmit} className="auth-form" noValidate>
                <div className="auth-field">
                  <label htmlFor="recover-email" className="sr-only">
                    Correo electrónico
                  </label>
                  <input
                    id="recover-email"
                    type="email"
                    placeholder="Correo electrónico"
                    value={recoverEmail}
                    onChange={(e) => setRecoverEmail(e.target.value)}
                    disabled={recoverStatus === "sending"}
                    required
                  />
                </div>

                <button type="submit" className="btn-orange auth-submit" disabled={recoverStatus === "sending"}>
                  {recoverStatus === "sending" ? "Enviando..." : "Enviar instrucciones →"}
                </button>
              </form>

              <p className="auth-switch-text">
                ¿Ya la recordaste?{" "}
                <button type="button" className="auth-link-inline" onClick={() => switchMode("login")}>
                  Volver a iniciar sesión
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

                <button type="submit" className="btn-orange auth-submit" disabled={busy}>
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
    </section>
  );
}