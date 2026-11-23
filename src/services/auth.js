const USERS_KEY = "easyticket_users";
const SESSION_KEY = "easyticket_session";

const INITIAL_USERS = [
  {
    id: "usr-luis-pacheco",
    name: "Luis Pacheco",
    email: "luis.pacheco@easyticket.com",
    password: "Password123!",
  },
];

function safeParse(raw, fallback) {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function getStoredUsers() {
  const raw = localStorage.getItem(USERS_KEY);
  if (!raw) {
    localStorage.setItem(USERS_KEY, JSON.stringify(INITIAL_USERS));
    return [...INITIAL_USERS];
  }
  const parsed = safeParse(raw, null);
  if (!Array.isArray(parsed)) {
    localStorage.setItem(USERS_KEY, JSON.stringify(INITIAL_USERS));
    return [...INITIAL_USERS];
  }
  return parsed;
}

export function registerUser({ name, email, password }) {
  const cleanName = (name || "").trim();
  const normalizedEmail = (email || "").trim().toLowerCase();

  if (!cleanName) {
    return { ok: false, error: "Ingresa tu nombre completo." };
  }
  if (!normalizedEmail) {
    return { ok: false, error: "Ingresa un correo electrónico válido." };
  }
  if (!password || password.length < 6) {
    return { ok: false, error: "La contraseña debe tener al menos 6 caracteres." };
  }

  const users = getStoredUsers();
  const exists = users.some((u) => u.email.toLowerCase() === normalizedEmail);
  if (exists) {
    return { ok: false, error: "Ya existe una cuenta registrada con ese correo." };
  }

  const newUser = {
    id: `usr-${Date.now()}`,
    name: cleanName,
    email: normalizedEmail,
    password,
  };

  const updatedUsers = [...users, newUser];
  localStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));

  const sessionUser = {
    id: newUser.id,
    name: newUser.name,
    email: newUser.email,
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));

  return { ok: true, user: sessionUser };
}

export function loginUser({ email, password, remember = false }) {
  const normalizedEmail = (email || "").trim().toLowerCase();

  if (!normalizedEmail || !password) {
    return { ok: false, error: "Completa tu correo electrónico y contraseña." };
  }

  const users = getStoredUsers();
  const found = users.find(
    (u) => u.email.toLowerCase() === normalizedEmail && u.password === password
  );

  if (!found) {
    return { ok: false, error: "Correo o contraseña incorrectos." };
  }

  const sessionUser = {
    id: found.id,
    name: found.name,
    email: found.email,
    remember: Boolean(remember),
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));

  return { ok: true, user: sessionUser };
}

export function getActiveSession() {
  const raw = localStorage.getItem(SESSION_KEY);
  return safeParse(raw, null);
}

export function logoutUser() {
  localStorage.removeItem(SESSION_KEY);
}

export function updateUserProfile(userId, { name, email }) {
  const cleanName = (name || "").trim();
  const normalizedEmail = (email || "").trim().toLowerCase();

  if (!cleanName || !normalizedEmail) {
    return { ok: false, error: "Nombre y correo son obligatorios." };
  }

  const users = getStoredUsers();
  const emailTaken = users.some(
    (u) => u.id !== userId && u.email.toLowerCase() === normalizedEmail
  );
  if (emailTaken) {
    return { ok: false, error: "Ese correo ya está en uso por otra cuenta." };
  }

  const updatedUsers = users.map((u) =>
    u.id === userId ? { ...u, name: cleanName, email: normalizedEmail } : u
  );
  localStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));

  const currentSession = getActiveSession();
  if (currentSession && currentSession.id === userId) {
    const updatedSession = {
      ...currentSession,
      name: cleanName,
      email: normalizedEmail,
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(updatedSession));
    return { ok: true, user: updatedSession };
  }

  return { ok: true, user: { id: userId, name: cleanName, email: normalizedEmail } };
}