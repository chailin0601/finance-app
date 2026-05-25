"use client";

import { useMemo, useState } from "react";
import { Transaction } from "@/lib/types";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, parseISO } from "date-fns";
import { id as localeID } from "date-fns/locale";

interface Props {
  transactions: Transaction[];
}

function formatRupiah(n: number): string {
  return "Rp " + n.toLocaleString("id-ID");
}

type ReportView = "daily" | "monthly";

export default function Report({ transactions }: Props) {
  const [view, setView] = useState<ReportView>("daily");
  const [selectedMonth, setSelectedMonth] = useState(() => format(new Date(), "yyyy-MM"));

  const monthDate = useMemo(() => parseISO(selectedMonth + "-01"), [selectedMonth]);

  // Filter transactions for selected month
  const monthTx = useMemo(() => {
    return transactions.filter((tx) => isSameMonth(parseISO(tx.date), monthDate));
  }, [transactions, monthDate]);

  // Monthly totals
  const totalIncome = useMemo(() => monthTx.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0), [monthTx]);
  const totalExpense = useMemo(() => monthTx.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0), [monthTx]);
  const totalCashIncome = useMemo(() => monthTx.filter((t) => t.type === "income" && t.category === "CASH").reduce((s, t) => s + t.amount, 0), [monthTx]);
  const saldoCash = totalCashIncome - totalExpense;

  // Income by category
  const incomeByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    monthTx.filter((t) => t.type === "income").forEach((t) => {
      map[t.category] = (map[t.category] || 0) + t.amount;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [monthTx]);

  // Expense by category
  const expenseByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    monthTx.filter((t) => t.type === "expense").forEach((t) => {
      map[t.category] = (map[t.category] || 0) + t.amount;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [monthTx]);

  // Daily breakdown
  const dailyData = useMemo(() => {
    const start = startOfMonth(monthDate);
    const end = endOfMonth(monthDate);
    const days = eachDayOfInterval({ start, end });

    return days.map((day) => {
      const dayTx = monthTx.filter((t) => isSameDay(parseISO(t.date), day));
      const income = dayTx.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
      const expense = dayTx.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
      return { day, income, expense, transactions: dayTx };
    }).filter((d) => d.transactions.length > 0);
  }, [monthTx, monthDate]);

  return (
    <div className="glass-strong rounded-2xl p-5 space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-slate-200">Laporan Keuangan</h2>
        <input
          type="month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="bg-slate-800/60 border border-slate-700/50 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
        />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3">
          <p className="text-[10px] text-emerald-400/70 uppercase tracking-wider">Pemasukan</p>
          <p className="text-base font-bold text-emerald-400 mt-0.5">{formatRupiah(totalIncome)}</p>
        </div>
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3">
          <p className="text-[10px] text-red-400/70 uppercase tracking-wider">Pengeluaran</p>
          <p className="text-base font-bold text-red-400 mt-0.5">{formatRupiah(totalExpense)}</p>
        </div>
        <div className="col-span-2 bg-blue-500/10 border border-blue-500/20 rounded-xl p-3">
          <p className="text-[10px] text-blue-400/70 uppercase tracking-wider">Saldo Cash (CASH Income - Pengeluaran)</p>
          <p className={`text-xl font-bold mt-0.5 ${saldoCash >= 0 ? "text-emerald-400" : "text-red-400"}`}>
            {formatRupiah(saldoCash)}
          </p>
        </div>
      </div>

      {/* View Toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setView("daily")}
          className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all duration-200 ${
            view === "daily"
              ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/20"
              : "bg-slate-800/60 border border-slate-700/50 text-slate-400 hover:text-slate-200"
          }`}
        >
          Harian
        </button>
        <button
          onClick={() => setView("monthly")}
          className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all duration-200 ${
            view === "monthly"
              ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/20"
              : "bg-slate-800/60 border border-slate-700/50 text-slate-400 hover:text-slate-200"
          }`}
        >
          Per Kategori
        </button>
      </div>

      {/* Daily View */}
      {view === "daily" && (
        <div className="space-y-3 max-h-[400px] overflow-y-auto">
          {dailyData.length === 0 && (
            <p className="text-center text-slate-500 py-6 text-sm">Tidak ada data bulan ini</p>
          )}
          {dailyData.map(({ day, income, expense, transactions: dayTx }) => (
            <div key={day.toISOString()} className="bg-slate-800/40 border border-white/5 rounded-xl p-3">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-xs text-slate-300">
                  {format(day, "EEEE, dd MMM yyyy", { locale: localeID })}
                </span>
                <span className={`text-xs font-semibold ${income - expense >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                  {income - expense >= 0 ? "+" : ""}{formatRupiah(income - expense)}
                </span>
              </div>
              <div className="space-y-1.5">
                {dayTx.map((tx) => (
                  <div key={tx.id} className="flex justify-between text-xs">
                    <span className="flex items-center gap-2">
                      <span className={`inline-block min-w-[52px] text-center text-[10px] px-1.5 py-0.5 rounded font-medium ${
                        tx.type === "income" ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"
                      }`}>{tx.category}</span>
                      {tx.note && <span className="text-slate-500">{tx.note}</span>}
                    </span>
                    <span className={tx.type === "income" ? "text-emerald-400" : "text-red-400"}>
                      {tx.type === "income" ? "+" : "-"}{formatRupiah(tx.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Monthly Category View */}
      {view === "monthly" && (
        <div className="space-y-5">
          {/* Income categories */}
          <div>
            <h3 className="text-xs font-medium text-emerald-400 mb-2 uppercase tracking-wider">Pemasukan per Kategori</h3>
            {incomeByCategory.length === 0 && <p className="text-xs text-slate-500">Tidak ada data</p>}
            <div className="space-y-1.5">
              {incomeByCategory.map(([cat, total]) => (
                <div key={cat} className="flex justify-between items-center py-1.5 px-3 bg-emerald-500/5 border border-emerald-500/10 rounded-lg">
                  <span className="text-xs text-slate-300 font-medium">{cat}</span>
                  <span className="text-xs text-emerald-400 font-semibold">{formatRupiah(total)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Expense categories */}
          <div>
            <h3 className="text-xs font-medium text-red-400 mb-2 uppercase tracking-wider">Pengeluaran per Kategori</h3>
            {expenseByCategory.length === 0 && <p className="text-xs text-slate-500">Tidak ada data</p>}
            <div className="space-y-1.5">
              {expenseByCategory.map(([cat, total]) => (
                <div key={cat} className="flex justify-between items-center py-1.5 px-3 bg-red-500/5 border border-red-500/10 rounded-lg">
                  <span className="text-xs text-slate-300 font-medium">{cat}</span>
                  <span className="text-xs text-red-400 font-semibold">{formatRupiah(total)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
