"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Transaction } from "@/lib/types";
import { getTransactions, addTransaction, updateTransaction, deleteTransaction } from "@/lib/storage";
import { getSession, logout, User } from "@/lib/auth";
import TransactionForm from "@/components/TransactionForm";
import TransactionList from "@/components/TransactionList";
import Report from "@/components/Report";

type Tab = "input" | "history" | "report";

export default function Home() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [tab, setTab] = useState<Tab>("input");
  const [editTx, setEditTx] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [session, setSessionState] = useState<User | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const user = await getSession();
      if (!user) {
        router.push("/login");
        return;
      }
      setSessionState(user);
    };
    checkAuth();
  }, [router]);

  const loadData = useCallback(async () => {
    const data = await getTransactions();
    setTransactions(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (session) {
      loadData();
    }
  }, [session, loadData]);

  const handleAdd = async (tx: Transaction) => {
    const updated = await addTransaction(tx);
    setTransactions(updated);
  };

  const handleUpdate = async (tx: Transaction) => {
    const updated = await updateTransaction(tx.id, tx);
    setTransactions(updated);
    setEditTx(null);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Hapus transaksi ini?")) {
      const updated = await deleteTransaction(id);
      setTransactions(updated);
    }
  };

  const handleEdit = (tx: Transaction) => {
    setEditTx(tx);
    setTab("input");
  };

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  // Summary — reset per bulan (hanya hitung bulan ini)
  const now = new Date();
  const currentMonthTx = transactions.filter((t) => {
    const d = new Date(t.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const totalIncome = currentMonthTx.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const totalExpense = currentMonthTx.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const totalSaldo = totalIncome - totalExpense;

  if (loading || !session) {
    return (
      <main className="max-w-lg mx-auto px-4 py-8 text-center">
        <div className="glass rounded-2xl p-8">
          <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-400 mt-4 text-sm">Memuat data...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-lg mx-auto px-4 py-6 space-y-5 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            OxMdlRch Finance
          </h1>
          <p className="text-slate-500 text-xs mt-0.5 tracking-wide">
            Halo, <span className="text-slate-300 font-medium">{session.username}</span>
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50 text-slate-400 hover:text-red-400 hover:border-red-500/30 transition-all"
          title="Logout"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>

      {/* Balance Card */}
      <div className="glass-strong rounded-2xl p-5 space-y-4">
        <div className="text-center">
          <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Total Saldo</p>
          <p className={`text-3xl font-bold tracking-tight ${totalSaldo >= 0 ? "text-emerald-400" : "text-red-400"}`}>
            Rp {totalSaldo.toLocaleString("id-ID")}
          </p>
          <p className="text-[10px] text-slate-500 mt-1">Total Pemasukan - Total Pengeluaran</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-center">
            <p className="text-[10px] text-emerald-400/70 uppercase tracking-wider">Pemasukan</p>
            <p className="text-sm font-semibold text-emerald-400 mt-0.5">Rp {totalIncome.toLocaleString("id-ID")}</p>
          </div>
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-center">
            <p className="text-[10px] text-red-400/70 uppercase tracking-wider">Pengeluaran</p>
            <p className="text-sm font-semibold text-red-400 mt-0.5">Rp {totalExpense.toLocaleString("id-ID")}</p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="glass rounded-2xl p-1.5 flex gap-1">
        {([
          { key: "input", label: "Input" },
          { key: "history", label: "Riwayat" },
          { key: "report", label: "Laporan" },
        ] as { key: Tab; label: string }[]).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
              tab === key
                ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/20"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {tab === "input" && (
        <TransactionForm
          onAdd={handleAdd}
          editTx={editTx}
          onUpdate={handleUpdate}
          onCancelEdit={() => setEditTx(null)}
        />
      )}
      {tab === "history" && (
        <TransactionList
          transactions={transactions}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
      {tab === "report" && <Report transactions={transactions} />}
    </main>
  );
}
