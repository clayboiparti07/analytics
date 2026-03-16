export type UserRole = "super_admin" | "admin";

export interface AuthSession {
  username: string;
  displayName: string;
  role: UserRole;
  loginAt: string;
}

interface CredentialRecord {
  username: string;
  displayName: string;
  role: UserRole;
  salt: string;
  passwordHash: string;
}

const AUTH_STORAGE_KEY = "dashboardAuthSession";

// Passwords are stored as salted hashes (demo-only client-side auth).
const CREDENTIALS: CredentialRecord[] = [
  {
    username: "vb",
    displayName: "Super Admin",
    role: "super_admin",
    salt: "rbg-super-2026",
    passwordHash: "16330cd5a841844cec13f77d5e66c04fb5f16c789b1a55c31b6f218625c2d3ca",
  },
  {
    username: "coersuser",
    displayName: "Admin",
    role: "admin",
    salt: "rbg-admin-2026",
    passwordHash: "89db6e2a65d530933948be1d0482bf7100939a27751aa1d501ef132aea54bfa7",
  },
];

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let mismatch = 0;
  for (let i = 0; i < a.length; i += 1) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

async function sha256Hex(value: string): Promise<string> {
  const encoder = new TextEncoder();
  const encoded = encoder.encode(value);
  const digest = await crypto.subtle.digest("SHA-256", encoded);
  const bytes = Array.from(new Uint8Array(digest));
  return bytes.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function authenticateUser(username: string, password: string): Promise<AuthSession | null> {
  const normalizedUsername = username.trim().toLowerCase();
  const record = CREDENTIALS.find((item) => item.username === normalizedUsername);

  if (!record) {
    return null;
  }

  const computedHash = await sha256Hex(`${record.salt}:${password}`);
  if (!timingSafeEqual(computedHash, record.passwordHash)) {
    return null;
  }

  return {
    username: record.username,
    displayName: record.displayName,
    role: record.role,
    loginAt: new Date().toISOString(),
  };
}

export function storeSession(session: AuthSession): void {
  if (!isBrowser()) {
    return;
  }

  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
}

export function getStoredSession(): AuthSession | null {
  if (!isBrowser()) {
    return null;
  }

  const raw = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as AuthSession;
    if (!parsed?.username || !parsed?.role) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function clearSession(): void {
  if (!isBrowser()) {
    return;
  }

  localStorage.removeItem(AUTH_STORAGE_KEY);
}
