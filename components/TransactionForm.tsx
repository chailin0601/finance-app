"use client";

import { useState, useEffect } from "react";
import { Transaction, TransactionType, INCOME_CATEGORIES, EXPENSE_CATEGORIES } from "@/lib/types";
import { generateId } from "@/lib/storage";

interface Props {
  onAdd: (tx: Transaction) => void;
  editTx?: Transaction | null;
  onUpdate?: (tx: Transaction) => void;
  onCancelEdit?: () => void;
}

export default function TransactionForm({ onAdd, editTx, onUpdate, onCancelEdit }: Props) {
  const [type, setType] = useState<TransactionType>(editTx?.type || "income");
  const [category, setCategory] = useState(editTx?.category || "CASH");
  const [amount, setAmount] = useState(editTx?.amount?.toString() || "");
  const [note, setNote] = useState(editTx?.note || "");
  const [date, setDate] = useState(editTx?.date?.slice(0, 10) || new Date().toISOString().slice(0, 10));

  useEffect(() => {
    if (editTx) {
      setType(editTx.type);
      setCategory(editTx.category);
      setAmount(editTx.amount.toString());
      setNote(editTx.note);
      setDate(editTx.date.slice(0, 10));
    }
  }, [editTx]);

  const categories = type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return;

    const tx: Transaction = {
      id: editTx?.id || generateId(),
      type,
      category,
      amount: Number(amount),
      note,
      date: new Date(date).toISOString(),
      createdAt: editTx?.createdAt || new Date().toISOString(),
    };

    if (editTx && onUpdate) {
      onUpdate(tx);
    } else {
      onAdd(tx);
    }

    // Reset
    setAmount("");
    setNote("");
    setCategory(type === "income" ? "CASH" : "ES");
  };

  return (
    <form onSubmit={handleSubmit} className="glass-strong rounded-2xl p-5 space-y-5">
      <h2 className="text-base font-semibold text-slate-200">
        {editTx ? "Edit Transaksi" : "Tambah Transaksi"}
      </h2>

      {/* Type toggle */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => { setType("income"); setCategory("CASH"); }}
          className={`flex-1 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
            type === "income"
              ? "bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-lg shadow-emerald-500/20"
              : "bg-slate-800/80 text-slate-400 hover:text-slate-200 border border-slate-700/50"
          }`}
        >
          Pemasukan
        </button>
        <button
          type="button"
          onClick={() => { setType("expense"); setCategory("ES"); }}
          className={`flex-1 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
            type === "expense"
              ? "bg-gradient-to-r from-red-600 to-red-500 text-white shadow-lg shadow-red-500/20"
              : "bg-slate-800/80 text-slate-400 hover:text-slate-200 border border-slate-700/50"
          }`}
        >
          Pengeluaran
        </button>
      </div>

      {/* Category */}
      <div>
        <label className="text-xs text-slate-400 mb-2 block uppercase tracking-wider">Kategori</label>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                category === cat
                  ? type === "income"
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm shadow-emerald-500/10"
                    : "bg-red-500/20 text-red-300 border border-red-500/40 shadow-sm shadow-red-500/10"
                  : "bg-slate-800/60 text-slate-400 border border-slate-700/40 hover:border-slate-600 hover:text-slate-300"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Amount */}
      <div>
        <label className="text-xs text-slate-400 mb-2 block uppercase tracking-wider">Jumlah (Rp)</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0"
          className="w-full bg-slate-800/60 border border-slate-700/50 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
        />
      </div>

      {/* Date */}
      <div>
        <label className="text-xs text-slate-400 mb-2 block uppercase tracking-wider">Tanggal</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full bg-slate-800/60 border border-slate-700/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
        />
      </div>

      {/* Note */}
      <div>
        <label className="text-xs text-slate-400 mb-2 block uppercase tracking-wider">Catatan</label>
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Opsional..."
          className="w-full bg-slate-800/60 border border-slate-700/50 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
        />
      </div>

      {/* Buttons */}
      <div className="flex gap-2 pt-1">
        <button
          type="submit"
          className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-medium py-3 rounded-xl transition-all duration-200 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30"
        >
          {editTx ? "Simpan" : "Tambah"}
        </button>
        {editTx && onCancelEdit && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="px-5 bg-slate-800/80 border border-slate-700/50 hover:border-slate-600 text-slate-300 py-3 rounded-xl transition-all"
          >
            Batal
          </button>
        )}
      </div>
    </form>
  );
}
