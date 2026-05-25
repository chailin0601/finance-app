"use client";

import { Transaction } from "@/lib/types";

interface Props {
  transactions: Transaction[];
  onEdit: (tx: Transaction) => void;
  onDelete: (id: string) => void;
}

function formatRupiah(n: number): string {
  return "Rp " + n.toLocaleString("id-ID");
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function TransactionList({ transactions, onEdit, onDelete }: Props) {
  if (transactions.length === 0) {
    return (
      <div className="bg-slate-800 rounded-xl p-6 text-center text-slate-400">
        Belum ada transaksi. Tambah yang pertama! 🎉
      </div>
    );
  }

  return (
    <div className="bg-slate-800 rounded-xl overflow-hidden">
      <h2 className="text-lg font-semibold p-4 border-b border-slate-700">📋 Riwayat Transaksi</h2>
      <div className="divide-y divide-slate-700 max-h-[400px] overflow-y-auto">
        {transactions.map((tx) => (
          <div key={tx.id} className="flex items-center justify-between p-4 hover:bg-slate-750">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  tx.type === "income" ? "bg-emerald-900 text-emerald-300" : "bg-red-900 text-red-300"
                }`}>
                  {tx.category}
                </span>
                <span className="text-sm text-slate-400">{formatDate(tx.date)}</span>
              </div>
              {tx.note && <p className="text-sm text-slate-400 mt-1">{tx.note}</p>}
            </div>
            <div className="flex items-center gap-3">
              <span className={`font-semibold ${
                tx.type === "income" ? "text-emerald-400" : "text-red-400"
              }`}>
                {tx.type === "income" ? "+" : "-"}{formatRupiah(tx.amount)}
              </span>
              <button
                onClick={() => onEdit(tx)}
                className="text-slate-400 hover:text-blue-400 transition"
                title="Edit"
              >
                ✏️
              </button>
              <button
                onClick={() => onDelete(tx.id)}
                className="text-slate-400 hover:text-red-400 transition"
                title="Hapus"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
