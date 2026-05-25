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
      <div className="glass-strong rounded-2xl p-8 text-center">
        <p className="text-slate-400 text-sm">Belum ada transaksi.</p>
        <p className="text-slate-500 text-xs mt-1">Tambah transaksi pertama di tab Input</p>
      </div>
    );
  }

  return (
    <div className="glass-strong rounded-2xl overflow-hidden">
      <div className="p-4 border-b border-white/5">
        <h2 className="text-base font-semibold text-slate-200">Riwayat Transaksi</h2>
        <p className="text-xs text-slate-500 mt-0.5">{transactions.length} transaksi</p>
      </div>
      <div className="divide-y divide-white/5 max-h-[450px] overflow-y-auto">
        {transactions.map((tx) => (
          <div key={tx.id} className="flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] px-2 py-0.5 rounded-md font-semibold uppercase tracking-wide ${
                  tx.type === "income"
                    ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                    : "bg-red-500/15 text-red-400 border border-red-500/20"
                }`}>
                  {tx.category}
                </span>
                <span className="text-xs text-slate-500">{formatDate(tx.date)}</span>
              </div>
              {tx.note && <p className="text-xs text-slate-500 mt-1 truncate">{tx.note}</p>}
            </div>
            <div className="flex items-center gap-3 ml-3">
              <span className={`font-semibold text-sm ${
                tx.type === "income" ? "text-emerald-400" : "text-red-400"
              }`}>
                {tx.type === "income" ? "+" : "-"}{formatRupiah(tx.amount)}
              </span>
              <div className="flex gap-1">
                <button
                  onClick={() => onEdit(tx)}
                  className="text-xs px-2 py-1 rounded-md bg-slate-800/80 border border-slate-700/50 text-slate-400 hover:text-blue-400 hover:border-blue-500/30 transition-all"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(tx.id)}
                  className="text-xs px-2 py-1 rounded-md bg-slate-800/80 border border-slate-700/50 text-slate-400 hover:text-red-400 hover:border-red-500/30 transition-all"
                >
                  Hapus
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
