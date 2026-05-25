"use client";

import { useState, useEffect } from "react";
import { Transaction } from "@/lib/types";
import { getTransactions, addTransaction, updateTransaction, deleteTransaction } from "@/lib/storage";
import TransactionForm from "@/components/TransactionForm";
import TransactionList from "@/components/TransactionList";
import Report from "@/components/Report";

type Tab = "input" | "history" | "report";

export default function Home() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [tab, setTab] = useState<Tab>("input");
  const [editTx, setEditTx] = useState<Transaction | null>(null);

  useEffect(() => {
    setTransactions(getTransactions());
  }, []);

  const handleAdd = (tx: Transaction) => {
    const updated = addTransaction(tx);
    setTransactions(updated);
  };

  const handleUpdate = (tx: Transaction) => {
    const updated = updateTransaction(tx.id, tx);
    setTransactions(updated);
    setEditTx(null);
  };

  const handleDelete = (id: string) => {
    if (confirm("Hapus transaksi ini?")) {
      const updated = deleteTransaction(id);
      setTransactions(updated);
    }
  };

  const handleEdit = (tx: Transaction) => {
    setEditTx(tx);
    setTab("input");
  };

  // Summary
  const totalIncome = transactions.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const balance = totalIncome - totalExpense;

  return (
    <main className="max-w-lg mx-auto px-4 py-6 space-y-4">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold">💰 Finance App</h1>
        <p className="text-slate-400 text-sm">Catatan Keuangan Harian</p>
      </div>

      {/* Balance Card */}
      <div className="bg-gradient-to-r from-blue-900 to-slate-800 rounded-xl p-4 text-center">
        <p className="text-sm text-slate-300">Saldo Keseluruhan</p>
        <p className={`text-3xl font-bold ${balance >= 0 ? "text-emerald-300" : "text-red-300"}`}>
          Rp {balance.toLocaleString("id-ID")}
        </p>
        <div className="flex justify-center gap-6 mt-2 text-sm">
          <span className="text-emerald-400">↑ Rp {totalIncome.toLocaleString("id-ID")}</span>
          <span className="text-red-400">↓ Rp {totalExpense.toLocaleString("id-ID")}</span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 bg-slate-800 rounded-xl p-1">
        {([
          { key: "input", label: "➕ Input" },
          { key: "history", label: "📋 Riwayat" },
          { key: "report", label: "📊 Laporan" },
        ] as { key: Tab; label: string }[]).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
              tab === key ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"
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
