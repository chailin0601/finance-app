"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loginUser, setSession } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username.trim() || !password.trim()) {
      setError("Username dan password wajib diisi");
      return;
    }

    setLoading(true);
    const result = await loginUser(username.trim(), password);
    setLoading(false);

    if (!result.success) {
      setError(result.error || "Login gagal");
      return;
    }

    setSession(result.user!);
    router.push("/");
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        {/* Logo */}
        <div className="text-center">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mt-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            OxMdlRch Finance
          </h1>
          <p className="text-slate-500 text-xs mt-1 tracking-wide uppercase">Masuk ke akun kamu</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="glass-strong rounded-2xl p-6 space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs text-slate-400 uppercase tracking-wider font-medium">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all"
              placeholder="Masukkan username"
              autoComplete="username"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs text-slate-400 uppercase tracking-wider font-medium">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all"
              placeholder="Masukkan password"
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium text-sm shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                Memproses...
              </span>
            ) : (
              "Masuk"
            )}
          </button>
        </form>

        {/* Links */}
        <div className="text-center space-y-2">
          <p className="text-sm text-slate-500">
            Belum punya akun?{" "}
            <Link href="/register" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
              Daftar di sini
            </Link>
          </p>
          <p className="text-sm text-slate-500">
            <Link href="/reset-password" className="text-amber-400 hover:text-amber-300 font-medium transition-colors">
              Lupa Password?
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
