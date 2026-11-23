// Cuentas simuladas (sin backend): usuarios y sesión viven en localStorage.
// Las contraseñas de demostración están en el código solo porque es un proyecto académico.
const USERS_KEY = "easyticket_users";
const SESSION_KEY = "easyticket_session";

export const DEMO_PASSWORD = "Password123!";

const INITIAL_USERS = [
  { id: "usr-luis-pacheco", name: "Luis Pacheco", email: "luis.pacheco@easyticket.com", password: DEMO_PASSWORD, role: "cliente" },
  { id: "usr-andres-ale", name: "Andrés Ale", email: "andres.ale@easyticket.com", password: DEMO_PASSWORD, role: "administrador" },
  { id: "usr-carlos-rivera", name: "Carlos Rivera", email: "carlos.rivera@easyticket.com", password: DEMO_PASSWORD, role: "organizador" },
];

// Cuentas de demostración que ya no existen: se eliminan de los datos guardados
const RETIRED_DEMO_EMAILS = ["ana.martinez@easyticket.com"];

// Para mostrar las cuentas de prueba en la pantalla de login
export const DEMO_ACCOUNTS = INITIAL_USERS.map(({ name, email, role }) => ({ name, email, role }));

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const isValidEmail = (email) => EMAIL_RE.test((email || "").trim());

function safeParse(raw, fallback) {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function getStoredUsers() {
  const parsed = safeParse(localStorage.getItem(USERS_KEY), null);
  if (!Array.isArray(parsed)) {
    saveUsers(INITIAL_USERS);
    return [...INITIAL_USERS];
  }

  // Compatibilidad: usuarios guardados sin rol pasan a "cliente" y las cuentas demo siempre existen
  let users = parsed
    .filter((u) => !RETIRED_DEMO_EMAILS.includes((u.email || "").toLowerCase()))
    .map((u) => (u.role ? u : { ...u, role: "cliente" }));
  const missingDemo = INITIAL_USERS.filter(
    (demo) => !users.some((u) => u.email.toLowerCase() === demo.email)
  );
  users = [...users, ...missingDemo];
  if (missingDemo.length > 0 || users.length !== parsed.length || users.some((u, i) => u !== parsed[i])) saveUsers(users);
  return users;
}

export function registerUser({ name, email, password }) {
  const cleanName = (name || "").trim();
  const normalizedEmail = (email || "").trim().toLowerCase();

  if (!cleanName) {
    return { ok: false, error: "Ingresa tu nombre completo." };
  }
  if (!isValidEmail(normalizedEmail)) {
    return { ok: false, error: "Ingresa un correo electrónico válido, por ejemplo nombre@correo.com." };
  }
  if (!password || password.length < 6) {
    return { ok: false, error: "La contraseña debe tener al menos 6 caracteres." };
  }

  const users = getStoredUsers();
  if (users.some((u) => u.email.toLowerCase() === normalizedEmail)) {
    return { ok: false, error: "Ya existe una cuenta registrada con ese correo." };
  }

  const newUser = {
    id: `usr-${Date.now()}`,
    name: cleanName,
    email: normalizedEmail,
    password,
    role: "cliente",
  };
  saveUsers([...users, newUser]);

  const sessionUser = { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role };
  localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
  return { ok: true, user: sessionUser };
}

export function loginUser({ email, password, remember = false }) {
  const normalizedEmail = (email || "").trim().toLowerCase();

  if (!normalizedEmail || !password) {
    return { ok: false, error: "Completa tu correo electrónico y contraseña." };
  }
  if (!isValidEmail(normalizedEmail)) {
    return { ok: false, error: "Ingresa un correo electrónico válido, por ejemplo nombre@correo.com." };
  }

  const found = getStoredUsers().find(
    (u) => u.email.toLowerCase() === normalizedEmail && u.password === password
  );
  if (!found) {
    return { ok: false, error: "Correo o contraseña incorrectos." };
  }

  const sessionUser = {
    id: found.id,
    name: found.name,
    email: found.email,
    role: found.role ?? "cliente",
    remember: Boolean(remember),
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
  return { ok: true, user: sessionUser };
}

export function getActiveSession() {
  const session = safeParse(localStorage.getItem(SESSION_KEY), null);
  return session ? { ...session, role: session.role ?? "cliente" } : null;
}

export function logoutUser() {
  localStorage.removeItem(SESSION_KEY);
}

// Recuperación de contraseña simulada: no envía correos y no revela si la cuenta existe.
export async function requestPasswordReset(email) {
  if (!isValidEmail(email)) {
    return { ok: false, error: "Ingresa un correo electrónico válido, por ejemplo nombre@correo.com." };
  }
  await new Promise((resolve) => setTimeout(resolve, 1200));
  return { ok: true };
}

export function updateUserProfile(userId, { name, email }) {
  const cleanName = (name || "").trim();
  const normalizedEmail = (email || "").trim().toLowerCase();

  if (!cleanName || !normalizedEmail) {
    return { ok: false, error: "Nombre y correo son obligatorios." };
  }
  if (!isValidEmail(normalizedEmail)) {
    return { ok: false, error: "Ingresa un correo electrónico válido, por ejemplo nombre@correo.com." };
  }

  const users = getStoredUsers();
  if (users.some((u) => u.id !== userId && u.email.toLowerCase() === normalizedEmail)) {
    return { ok: false, error: "Ese correo ya está en uso por otra cuenta." };
  }

  saveUsers(users.map((u) => (u.id === userId ? { ...u, name: cleanName, email: normalizedEmail } : u)));

  const currentSession = getActiveSession();
  if (currentSession && currentSession.id === userId) {
    const updatedSession = { ...currentSession, name: cleanName, email: normalizedEmail };
    localStorage.setItem(SESSION_KEY, JSON.stringify(updatedSession));
    return { ok: true, user: updatedSession };
  }
  return { ok: true, user: { id: userId, name: cleanName, email: normalizedEmail } };
}
