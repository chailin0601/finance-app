import { Transaction } from "./types";

const DB_URL = "/api/db";

export async function getTransactions(): Promise<Transaction[]> {
  const res = await fetch(DB_URL);
  if (!res.ok) return [];
  const data = await res.json();
  return data.transactions || [];
}

export async function addTransaction(tx: Transaction): Promise<Transaction[]> {
  const res = await fetch(DB_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "add", transaction: tx }),
  });
  const data = await res.json();
  return data.transactions || [];
}

export async function updateTransaction(id: string, updated: Partial<Transaction>): Promise<Transaction[]> {
  const res = await fetch(DB_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "update", id, transaction: updated }),
  });
  const data = await res.json();
  return data.transactions || [];
}

export async function deleteTransaction(id: string): Promise<Transaction[]> {
  const res = await fetch(DB_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "delete", id }),
  });
  const data = await res.json();
  return data.transactions || [];
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
