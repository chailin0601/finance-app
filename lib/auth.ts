import { supabase } from "./supabase";

export interface User {
  id: string;
  email: string;
  username: string;
}

export async function registerUser(
  username: string,
  password: string
): Promise<{ success: boolean; error?: string }> {
  // Supabase Auth uses email — we fake it with username@oxmdlrch.local
  const email = `${username.toLowerCase()}@oxmdlrch.local`;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { username },
    },
  });

  if (error) {
    if (error.message.includes("already registered")) {
      return { success: false, error: "Username sudah dipakai" };
    }
    return { success: false, error: error.message };
  }

  if (!data.user) {
    return { success: false, error: "Registrasi gagal" };
  }

  return { success: true };
}

export async function loginUser(
  username: string,
  password: string
): Promise<{ success: boolean; user?: User; error?: string }> {
  const email = `${username.toLowerCase()}@oxmdlrch.local`;

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    if (error.message.includes("Invalid login")) {
      return { success: false, error: "Username atau password salah" };
    }
    return { success: false, error: error.message };
  }

  if (!data.user) {
    return { success: false, error: "Login gagal" };
  }

  return {
    success: true,
    user: {
      id: data.user.id,
      email: data.user.email || email,
      username: data.user.user_metadata?.username || username,
    },
  };
}

export async function resetPassword(
  username: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  // For password reset without email verification, we use service role
  // But from client-side, user must be logged in to update password
  // Alternative: admin endpoint via API route
  // For now, we'll use a simple approach: sign in isn't possible, so we expose an API route

  return { success: false, error: "Gunakan halaman reset password — hubungi admin atau register ulang" };
}

export async function getSession(): Promise<User | null> {
  const { data } = await supabase.auth.getSession();
  if (!data.session?.user) return null;

  const user = data.session.user;
  return {
    id: user.id,
    email: user.email || "",
    username: user.user_metadata?.username || user.email?.split("@")[0] || "",
  };
}

export async function logout(): Promise<void> {
  await supabase.auth.signOut();
}

export async function getRegisteredUsernames(): Promise<string[]> {
  // Can't list users from client-side (security)
  // Return empty — user must remember their username
  return [];
}
