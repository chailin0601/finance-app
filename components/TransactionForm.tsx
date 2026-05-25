"use client";

import { useState } from "react";
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
    <form onSubmit={handleSubmit} className="bg-slate-800 rounded-xl p-4 space-y-4">
      <h2 className="text-lg font-semibold">
        {editTx ? "✏️ Edit Transaksi" : "➕ Tambah Transaksi"}
      </h2>

      {/* Type toggle */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => { setType("income"); setCategory("CASH"); }}
          className={`flex-1 py-2 rounded-lg font-medium transition ${
            type === "income" ? "bg-emerald-600 text-white" : "bg-slate-700 text-slate-300"
          }`}
        >
          💰 Pemasukan
        </button>
        <button
          type="button"
          onClick={() => { setType("expense"); setCategory("ES"); }}
          className={`flex-1 py-2 rounded-lg font-medium transition ${
            type === "expense" ? "bg-red-600 text-white" : "bg-slate-700 text-slate-300"
          }`}
        >
          💸 Pengeluaran
        </button>
      </div>

      {/* Category */}
      <div>
        <label className="text-sm text-slate-400 mb-1 block">Kategori</label>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`px-3 py-1 rounded-full text-sm transition ${
                category === cat
                  ? type === "income" ? "bg-emerald-600 text-white" : "bg-red-600 text-white"
                  : "bg-slate-700 text-slate-300 hover:bg-slate-600"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Amount */}
      <div>
        <label className="text-sm text-slate-400 mb-1 block">Jumlah (Rp)</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0"
          className="w-full bg-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Date */}
      <div>
        <label className="text-sm text-slate-400 mb-1 block">Tanggal</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full bg-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Note */}
      <div>
        <label className="text-sm text-slate-400 mb-1 block">Catatan</label>
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Opsional..."
          className="w-full bg-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Buttons */}
      <div className="flex gap-2">
        <button
          type="submit"
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition"
        >
          {editTx ? "💾 Simpan" : "➕ Tambah"}
        </button>
        {editTx && onCancelEdit && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="px-4 bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-lg transition"
          >
            Batal
          </button>
        )}
      </div>
    </form>
  );
}
