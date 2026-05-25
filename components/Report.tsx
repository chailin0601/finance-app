"use client";

import { useMemo, useState } from "react";
import { Transaction } from "@/lib/types";
import { format, startOfDay, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, parseISO } from "date-fns";
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
    <div className="bg-slate-800 rounded-xl p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">📊 Laporan Keuangan</h2>
        <input
          type="month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="bg-slate-700 rounded-lg px-3 py-1 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-emerald-900/30 border border-emerald-800 rounded-lg p-3">
          <p className="text-xs text-emerald-400">Total Pemasukan</p>
          <p className="text-lg font-bold text-emerald-300">{formatRupiah(totalIncome)}</p>
        </div>
        <div className="bg-red-900/30 border border-red-800 rounded-lg p-3">
          <p className="text-xs text-red-400">Total Pengeluaran</p>
          <p className="text-lg font-bold text-red-300">{formatRupiah(totalExpense)}</p>
        </div>
        <div className="bg-blue-900/30 border border-blue-800 rounded-lg p-3 col-span-2">
          <p className="text-xs text-blue-400">💵 Saldo Cash (Pemasukan CASH - Total Pengeluaran)</p>
          <p className={`text-xl font-bold ${saldoCash >= 0 ? "text-emerald-300" : "text-red-300"}`}>
            {formatRupiah(saldoCash)}
          </p>
        </div>
      </div>

      {/* View Toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setView("daily")}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
            view === "daily" ? "bg-blue-600 text-white" : "bg-slate-700 text-slate-300"
          }`}
        >
          📅 Harian
        </button>
        <button
          onClick={() => setView("monthly")}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
            view === "monthly" ? "bg-blue-600 text-white" : "bg-slate-700 text-slate-300"
          }`}
        >
          📆 Bulanan (Kategori)
        </button>
      </div>

      {/* Daily View */}
      {view === "daily" && (
        <div className="space-y-3 max-h-[400px] overflow-y-auto">
          {dailyData.length === 0 && (
            <p className="text-center text-slate-400 py-4">Tidak ada data bulan ini</p>
          )}
          {dailyData.map(({ day, income, expense, transactions: dayTx }) => (
            <div key={day.toISOString()} className="bg-slate-750 border border-slate-700 rounded-lg p-3">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-sm">
                  {format(day, "EEEE, dd MMM yyyy", { locale: localeID })}
                </span>
                <span className={`text-sm font-semibold ${income - expense >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                  {income - expense >= 0 ? "+" : ""}{formatRupiah(income - expense)}
                </span>
              </div>
              <div className="space-y-1">
                {dayTx.map((tx) => (
                  <div key={tx.id} className="flex justify-between text-sm">
                    <span className="text-slate-400">
                      <span className={`inline-block w-16 text-xs px-1.5 py-0.5 rounded text-center ${
                        tx.type === "income" ? "bg-emerald-900 text-emerald-300" : "bg-red-900 text-red-300"
                      }`}>{tx.category}</span>
                      {tx.note && <span className="ml-2 text-slate-500">{tx.note}</span>}
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
        <div className="space-y-4">
          {/* Income categories */}
          <div>
            <h3 className="text-sm font-medium text-emerald-400 mb-2">💰 Pemasukan per Kategori</h3>
            {incomeByCategory.length === 0 && <p className="text-sm text-slate-500">Tidak ada data</p>}
            {incomeByCategory.map(([cat, total]) => (
              <div key={cat} className="flex justify-between py-1 text-sm">
                <span className="text-slate-300">{cat}</span>
                <span className="text-emerald-400">{formatRupiah(total)}</span>
              </div>
            ))}
          </div>

          {/* Expense categories */}
          <div>
            <h3 className="text-sm font-medium text-red-400 mb-2">💸 Pengeluaran per Kategori</h3>
            {expenseByCategory.length === 0 && <p className="text-sm text-slate-500">Tidak ada data</p>}
            {expenseByCategory.map(([cat, total]) => (
              <div key={cat} className="flex justify-between py-1 text-sm">
                <span className="text-slate-300">{cat}</span>
                <span className="text-red-400">{formatRupiah(total)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
