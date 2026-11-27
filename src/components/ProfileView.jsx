import { useState } from "react";
import "./AuthSection.css";

// onSave(data) guarda el perfil contra la API falsa (lanza un error si falla); onLogout cierra la sesión
export default function ProfileView({ session, onSave, onLogout, onNavigate }) {
  const [name, setName] = useState(session?.name || "");
  const [email, setEmail] = useState(session?.email || "");
  const [statusMsg, setStatusMsg] = useState(null);
  const [saving, setSaving] = useState(false);

  if (!session) {
    return (
      <section className="auth-page">
        <div className="container profile-empty-wrap">
          <div className="auth-card profile-card">
            <h2>No hay sesión activa</h2>
            <p className="profile-subtitle">
              Inicia sesión o crea una cuenta para ver y administrar tu perfil.
            </p>
            <button
              type="button"
              className="btn-orange auth-submit"
              onClick={() => onNavigate && onNavigate("login")}
            >
              Ir a Iniciar sesión →
            </button>
          </div>
        </div>
      </section>
    );
  }

  const handleSave = async (e) => {
    e.preventDefault();
    if (saving) return; // evita el doble envío
    setStatusMsg(null);
    setSaving(true);
    try {
      await onSave({ name, email });
      setStatusMsg({ type: "success", text: "Perfil actualizado." });
    } catch (err) {
      setStatusMsg({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    if (onLogout) onLogout();
    if (onNavigate) onNavigate("login");
  };

  return (
    <section className="auth-page" aria-label="Perfil de usuario">
      <div className="container profile-wrap">
        <div className="auth-card profile-card">
          <div className="profile-header">
            <div className="profile-avatar" aria-hidden="true">
              {(session.name || "U").charAt(0).toUpperCase()}
            </div>
            <div>
              <h2>{session.name}</h2>
              <p className="profile-subtitle">{session.email}</p>
              <p className="profile-subtitle">Rol: {session.role}</p>
            </div>
          </div>

          {statusMsg && (
            <div
              className={`auth-alert auth-alert--${statusMsg.type}`}
              role="alert"
            >
              {statusMsg.text}
            </div>
          )}

          <form onSubmit={handleSave} className="auth-form">
            <div className="auth-field">
              <label htmlFor="profile-name" className="profile-label">
                Nombre completo
              </label>
              <input
                id="profile-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="auth-field">
              <label htmlFor="profile-email" className="profile-label">
                Correo electrónico
              </label>
              <input
                id="profile-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn-orange auth-submit" disabled={saving}>
              {saving ? "Guardando..." : "Guardar cambios"}
            </button>
          </form>

          <div className="profile-actions">
            {onNavigate && (
              <button
                type="button"
                className="btn-google"
                onClick={() => onNavigate("home")}
              >
                Explorar eventos
              </button>
            )}
            <button
              type="button"
              className="profile-logout-btn"
              onClick={handleLogout}
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}