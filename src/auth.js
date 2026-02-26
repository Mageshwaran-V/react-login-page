// ── Mock user database ────────────────────────────────────────────────────────
// In a real app these would come from your backend / database.
const USERS = [
  { email: 'admin@example.com', password: 'Admin@123',  name: 'Admin User', role: 'Administrator', avatar: 'AU' },
  { email: 'user@example.com',  password: 'User@1234',  name: 'John Doe',   role: 'Member',        avatar: 'JD' },
  { email: 'demo@example.com',  password: 'Demo@1234',  name: 'Demo User',  role: 'Guest',         avatar: 'DU' },
];

export function login(email, password, remember = false) {
  const found = USERS.find(
    (u) => u.email === email && u.password === password
  );
  if (!found) return null;

  const session = {
    email:     found.email,
    name:      found.name,
    role:      found.role,
    avatar:    found.avatar,
    loginTime: new Date().toISOString(),
  };

  // "Remember me" → localStorage (persists across tabs/restarts)
  // Otherwise     → sessionStorage (cleared when tab closes)
  const store = remember ? localStorage : sessionStorage;
  store.setItem('__session__', JSON.stringify(session));
  return session;
}

export function getSession() {
  const raw =
    localStorage.getItem('__session__') ||
    sessionStorage.getItem('__session__');
  return raw ? JSON.parse(raw) : null;
}

export function logout() {
  localStorage.removeItem('__session__');
  sessionStorage.removeItem('__session__');
}
