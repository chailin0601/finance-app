import { openDB, DBSchema, IDBPDatabase } from "idb";

export interface User {
  id: string;
  username: string;
  password: string; // hashed
  createdAt: string;
}

interface AuthDB extends DBSchema {
  users: {
    key: string;
    value: User;
    indexes: {
      "by-username": string;
    };
  };
}

const AUTH_DB = "finance-auth-db";
const AUTH_VERSION = 1;

let authDbPromise: Promise<IDBPDatabase<AuthDB>> | null = null;

function getAuthDB(): Promise<IDBPDatabase<AuthDB>> {
  if (!authDbPromise) {
    authDbPromise = openDB<AuthDB>(AUTH_DB, AUTH_VERSION, {
      upgrade(db) {
        const store = db.createObjectStore("users", { keyPath: "id" });
        store.createIndex("by-username", "username", { unique: true });
      },
    });
  }
  return authDbPromise;
}

// Simple hash (not crypto-grade, but fine for client-side demo)
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + "oxmdlrch-salt-2024");
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function registerUser(username: string, password: string): Promise<{ success: boolean; error?: string }> {
  const db = await getAuthDB();
  
  // Check if username exists
  const existing = await db.getFromIndex("users", "by-username", username);
  if (existing) {
    return { success: false, error: "Username sudah dipakai" };
  }

  const hashed = await hashPassword(password);
  const user: User = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
    username,
    password: hashed,
    createdAt: new Date().toISOString(),
  };

  await db.put("users", user);
  return { success: true };
}

export async function loginUser(username: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
  const db = await getAuthDB();
  const user = await db.getFromIndex("users", "by-username", username);
  
  if (!user) {
    return { success: false, error: "Username tidak ditemukan" };
  }

  const hashed = await hashPassword(password);
  if (user.password !== hashed) {
    return { success: false, error: "Password salah" };
  }

  return { success: true, user };
}

export async function getRegisteredUsernames(): Promise<string[]> {
  const db = await getAuthDB();
  const users = await db.getAll("users");
  return users.map((u) => u.username);
}

export async function resetPassword(username: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
  const db = await getAuthDB();
  const user = await db.getFromIndex("users", "by-username", username);
  
  if (!user) {
    return { success: false, error: "Username tidak ditemukan" };
  }

  const hashed = await hashPassword(newPassword);
  user.password = hashed;
  await db.put("users", user);
  return { success: true };
}

export function setSession(user: User): void {
  localStorage.setItem("finance-session", JSON.stringify({ id: user.id, username: user.username }));
}

export function getSession(): { id: string; username: string } | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("finance-session");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearSession(): void {
  localStorage.removeItem("finance-session");
}
