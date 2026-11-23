import { useState } from "react";
import heroImg from "./assets/hero.png";
import AuthView from "./components/AuthView";
import ProfileView from "./components/ProfileView";
import { getActiveSession, logoutUser } from "./services/auth";

export default function App() {
  const [session, setSession] = useState(() => getActiveSession());
  // Vistas base de tu parte: "home" | "login" | "register" | "profile"
  const [view, setView] = useState(() => (getActiveSession() ? "home" : "login"));

  const handleAuthSuccess = (user) => {
    setSession(user);
    setView("home");
  };

  const handleLogout = () => {
    logoutUser();
    setSession(null);
    setView("login");
  };

  return (
    <div className="app-shell">
      <header
        style={{
          backgroundColor: "var(--color-primary)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.12)",
          paddingBlock: "12px",
        }}
      >
        <div
          className="container"
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
          }}
        >
          <button
            type="button"
            onClick={() => setView("home")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
              background: "transparent",
              border: "none",
              padding: 0,
              color: "#ffffff",
              fontWeight: 800,
              fontSize: "18px",
            }}
          >
            <img
              src={heroImg}
              alt="Easy Ticket"
              style={{
                width: "36px",
                height: "36px",
                objectFit: "cover",
                borderRadius: "8px",
              }}
            />
            <span>Easy Ticket</span>
          </button>

          <nav
            aria-label="Navegación principal"
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: "14px",
              fontSize: "13px",
              fontWeight: 600,
            }}
          >
            <button
              type="button"
              onClick={() => setView("home")}
              style={{
                background: "transparent",
                border: "none",
                color: view === "home" ? "var(--color-sky)" : "#ffffff",
                fontWeight: 600,
                padding: "4px 6px",
              }}
            >
              Inicio
            </button>

            {session ? (
              <>
                <button
                  type="button"
                  onClick={() => setView("profile")}
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                    border: "1px solid rgba(255, 255, 255, 0.25)",
                    borderRadius: "999px",
                    color: "#ffffff",
                    fontWeight: 600,
                    padding: "6px 12px",
                  }}
                >
                  {session.name}
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "var(--color-orange)",
                    fontWeight: 700,
                    padding: "4px 6px",
                  }}
                >
                  Salir
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setView("login")}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: view === "login" ? "var(--color-sky)" : "#ffffff",
                    fontWeight: 600,
                    padding: "4px 6px",
                  }}
                >
                  Iniciar sesión
                </button>
                <button
                  type="button"
                  onClick={() => setView("register")}
                  style={{
                    backgroundColor: "var(--color-orange)",
                    border: "none",
                    borderRadius: "8px",
                    color: "#ffffff",
                    fontWeight: 700,
                    padding: "7px 12px",
                  }}
                >
                  Registrarse
                </button>
              </>
            )}
          </nav>
        </div>
      </header>

      <main>
        {view === "login" && (
          <AuthView
            key="login"
            initialMode="login"
            onAuthSuccess={handleAuthSuccess}
            onNavigate={setView}
          />
        )}

        {view === "register" && (
          <AuthView
            key="register"
            initialMode="register"
            onAuthSuccess={handleAuthSuccess}
            onNavigate={setView}
          />
        )}

        {view === "profile" && (
          <ProfileView
            session={session}
            onSessionChange={setSession}
            onNavigate={setView}
          />
        )}

        {view === "home" && (
          <section className="container" style={{ paddingBlock: "36px" }}>
            <div
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.06)",
                border: "1px solid rgba(255, 255, 255, 0.14)",
                borderRadius: "16px",
                padding: "24px",
              }}
            >
              <h1 style={{ fontSize: "24px", marginBottom: "8px" }}>
                Tu próxima experiencia cultural[cite: 5, 6, 7]
              </h1>
              <p
                style={{
                  margin: "0 0 16px",
                  color: "var(--text-on-dark-muted)",
                  fontSize: "14px",
                }}
              >
                {session
                  ? `Sesión activa en localStorage: ${session.name} (${session.email}).`
                  : "No has iniciado sesión. Puedes ingresar o registrarte desde el menú superior."}
              </p>
              <p
                style={{
                  margin: 0,
                  fontSize: "13px",
                  color: "var(--color-sky)",
                }}
              >
                Espacio base listo para integrar el listado de eventos,
                detalle, selección de asientos/zona, carrito, pago simulado y
                boleto QR.
              </p>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}