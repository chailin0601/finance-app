"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

interface OldTransaction {
  id: string;
  type: "income" | "expense";
  category: string;
  amount: number;
  note: string;
  date: string;
  createdAt: string;
}

export default function MigratePage() {
  const router = useRouter();
  const [oldData, setOldData] = useState<OldTransaction[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "found" | "migrating" | "done" | "error">("loading");
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const init = async () => {
      // Check auth
      const user = await getSession();
      if (!user) {
        router.push("/login");
        return;
      }

      // Try to read old IndexedDB
      try {
        const data = await readOldIndexedDB();
        if (data.length === 0) {
          setStatus("idle");
        } else {
          setOldData(data);
          setStatus("found");
        }
      } catch {
        setStatus("idle");
      }
    };
    init();
  }, [router]);

  async function readOldIndexedDB(): Promise<OldTransaction[]> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open("finance-app-db", 1);
      request.onerror = () => resolve([]);
      request.onsuccess = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains("transactions")) {
          resolve([]);
          return;
        }
        const tx = db.transaction("transactions", "readonly");
        const store = tx.objectStore("transactions");
        const getAll = store.getAll();
        getAll.onsuccess = () => resolve(getAll.result || []);
        getAll.onerror = () => resolve([]);
      };
      request.onupgradeneeded = () => {
        // DB doesn't exist yet
        request.result.close();
        resolve([]);
      };
    });
  }

  async function handleMigrate() {
    setStatus("migrating");
    setError("");

    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session?.user) {
      setError("Sesi login tidak ditemukan. Login ulang dulu.");
      setStatus("error");
      return;
    }

    const userId = sessionData.session.user.id;
    let done = 0;

    // Insert in batches of 10
    for (let i = 0; i < oldData.length; i += 10) {
      const batch = oldData.slice(i, i + 10).map((tx) => ({
        id: tx.id,
        user_id: userId,
        type: tx.type,
        category: tx.category,
        amount: tx.amount,
        note: tx.note || "",
        date: tx.date,
        created_at: tx.createdAt || new Date().toISOString(),
      }));

      const { error: insertError } = await supabase
        .from("transactions")
        .upsert(batch, { onConflict: "id" });

      if (insertError) {
        setError(`Error batch ${i}: ${insertError.message}`);
        setStatus("error");
        return;
      }

      done += batch.length;
      setProgress(Math.round((done / oldData.length) * 100));
    }

    setStatus("done");
  }

  if (status === "loading") {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="glass rounded-2xl p-8 text-center">
          <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-400 mt-4 text-sm">Mengecek data lama...</p>
        </div>
      </main>
    );
  }

  if (status === "idle") {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-sm space-y-6 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-slate-700/50 border border-slate-600/50 flex items-center justify-center">
            <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-2.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-300">Tidak Ada Data Lama</h2>
          <p className="text-slate-500 text-sm">Tidak ditemukan data transaksi di browser ini yang perlu dimigrasikan.</p>
          <Link href="/" className="inline-block mt-4 px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-medium">
            Kembali ke Dashboard
          </Link>
        </div>
      </main>
    );
  }

  if (status === "done") {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-sm space-y-6 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
            <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-emerald-400">Migrasi Berhasil!</h2>
          <p className="text-slate-400 text-sm">{oldData.length} transaksi berhasil dipindahkan ke cloud.</p>
          <p className="text-slate-500 text-xs">Data sekarang bisa diakses dari device manapun.</p>
          <Link href="/" className="inline-block mt-4 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm font-medium">
            Buka Dashboard
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mt-4 bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
            Migrasi Data
          </h1>
          <p className="text-slate-500 text-xs mt-1 tracking-wide uppercase">Pindahkan data lama ke cloud</p>
        </div>

        <div className="glass-strong rounded-2xl p-6 space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
            <p className="text-sm text-blue-300 font-medium">Ditemukan {oldData.length} transaksi</p>
            <p className="text-xs text-slate-400 mt-1">Data dari browser ini akan dipindahkan ke akun Supabase lo.</p>
          </div>

          {status === "migrating" ? (
            <div className="space-y-3">
              <div className="w-full bg-slate-700/50 rounded-full h-2.5">
                <div
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-center text-sm text-slate-400">{progress}% — Memindahkan data...</p>
            </div>
          ) : (
            <button
              onClick={handleMigrate}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-medium text-sm shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all duration-200"
            >
              Pindahkan ke Cloud
            </button>
          )}
        </div>

        <p className="text-center text-sm text-slate-500">
          <Link href="/" className="text-slate-400 hover:text-slate-300 transition-colors">
            Skip — langsung ke dashboard
          </Link>
        </p>
      </div>
    </main>
  );
}
