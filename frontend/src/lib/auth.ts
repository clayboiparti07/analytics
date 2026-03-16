export type UserRole = "super_admin" | "admin";

export interface AuthSession {
  username: string;
  displayName: string;
  role: UserRole;
  allowedApps: string[];
  loginAt: string;
}

interface CredentialRecord {
  username: string;
  displayName: string;
  role: UserRole;
  allowedApps: string[];
  salt: string;
  passwordHash: string;
}

const AUTH_STORAGE_KEY = "dashboardAuthSession";

const CREDENTIALS: CredentialRecord[] = [
  {
    username: "vb",
    displayName: "Super Admin",
    role: "super_admin",
    allowedApps: ["fps", "tpl", "sanjaya"],
    salt: "rbg-super-2026",
    passwordHash: "706b00cc8a4ae121cf629ca8e603e705f61514ba1547331233bef0790dfeafa0",
  },
  {
    username: "coersuser",
    displayName: "Admin",
    role: "admin",
    allowedApps: ["fps", "tpl", "sanjaya"],
    salt: "rbg-admin-2026",
    passwordHash: "871b474c338e799ac1ad4ebff74b16235c6c72dbcf9bfedcdc6746e833e72f1c",
  },
  {
    username: "fpsuser",
    displayName: "FPS User",
    role: "admin",
    allowedApps: ["fps"],
    salt: "rbg-fps-2026",
    passwordHash: "5ed5d3ee7fe3b932ed050cf3bbd7f1b952fb3008d68e27129df00decd80f20cd",
  },
  {
    username: "tpluser",
    displayName: "TPL User",
    role: "admin",
    allowedApps: ["tpl"],
    salt: "rbg-tpl-2026",
    passwordHash: "daf4a265b3c461be07cf7946c8cabb0cbc9b962b9895040b849b0b6114f50977",
  },
  {
    username: "sanjaya",
    displayName: "Sanjaya User",
    role: "admin",
    allowedApps: ["sanjaya"],
    salt: "rbg-sanjaya-2026",
    passwordHash: "665bf916d5f3637ac59baefb4fd59495468c5d539da852851898a298adf624bf",
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
    allowedApps: record.allowedApps,
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
    if (!parsed?.username || !parsed?.role || !Array.isArray(parsed?.allowedApps)) {
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
