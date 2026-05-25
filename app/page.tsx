"use client";

import { useState, useEffect, useCallback } from "react";
import { Transaction } from "@/lib/types";
import { getTransactions, addTransaction, updateTransaction, deleteTransaction, generateId } from "@/lib/storage";
import TransactionForm from "@/components/TransactionForm";
import TransactionList from "@/components/TransactionList";
import Report from "@/components/Report";

type Tab = "input" | "history" | "report";

export default function Home() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [tab, setTab] = useState<Tab>("input");
  const [editTx, setEditTx] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    const data = await getTransactions();
    setTransactions(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

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

  // Summary — reset per bulan (hanya hitung bulan ini)
  const now = new Date();
  const currentMonthTx = transactions.filter((t) => {
    const d = new Date(t.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const totalIncome = currentMonthTx.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const totalExpense = currentMonthTx.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const totalCashIncome = currentMonthTx.filter((t) => t.type === "income" && t.category === "CASH").reduce((s, t) => s + t.amount, 0);
  const saldoCash = totalCashIncome - totalExpense;

  if (loading) {
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
      <div className="text-center pt-2">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          OxMdlRch Finance
        </h1>
        <p className="text-slate-500 text-xs mt-1 tracking-wide uppercase">Catatan Keuangan Harian</p>
      </div>

      {/* Balance Card */}
      <div className="glass-strong rounded-2xl p-5 space-y-4">
        <div className="text-center">
          <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Saldo Cash</p>
          <p className={`text-3xl font-bold tracking-tight ${saldoCash >= 0 ? "text-emerald-400" : "text-red-400"}`}>
            Rp {saldoCash.toLocaleString("id-ID")}
          </p>
          <p className="text-[10px] text-slate-500 mt-1">CASH Income - Total Pengeluaran</p>
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
