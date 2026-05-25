import { Transaction } from "./types";

const STORAGE_KEY = "finance_transactions";

export function getTransactions(): Transaction[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveTransactions(transactions: Transaction[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
}

export function addTransaction(tx: Transaction): Transaction[] {
  const all = getTransactions();
  all.unshift(tx);
  saveTransactions(all);
  return all;
}

export function updateTransaction(id: string, updated: Partial<Transaction>): Transaction[] {
  const all = getTransactions();
  const idx = all.findIndex((t) => t.id === id);
  if (idx !== -1) {
    all[idx] = { ...all[idx], ...updated };
  }
  saveTransactions(all);
  return all;
}

export function deleteTransaction(id: string): Transaction[] {
  const all = getTransactions().filter((t) => t.id !== id);
  saveTransactions(all);
  return all;
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
