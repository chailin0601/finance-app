import { openDB, DBSchema, IDBPDatabase } from "idb";
import { Transaction } from "./types";

interface FinanceDB extends DBSchema {
  transactions: {
    key: string;
    value: Transaction;
    indexes: {
      "by-date": string;
      "by-type": string;
    };
  };
}

const DB_NAME = "finance-app-db";
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<FinanceDB>> | null = null;

function getDB(): Promise<IDBPDatabase<FinanceDB>> {
  if (!dbPromise) {
    dbPromise = openDB<FinanceDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        const store = db.createObjectStore("transactions", { keyPath: "id" });
        store.createIndex("by-date", "date");
        store.createIndex("by-type", "type");
      },
    });
  }
  return dbPromise;
}

export async function getTransactions(): Promise<Transaction[]> {
  const db = await getDB();
  const all = await db.getAll("transactions");
  return all.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function addTransaction(tx: Transaction): Promise<Transaction[]> {
  const db = await getDB();
  await db.put("transactions", tx);
  return getTransactions();
}

export async function updateTransaction(id: string, updated: Partial<Transaction>): Promise<Transaction[]> {
  const db = await getDB();
  const existing = await db.get("transactions", id);
  if (existing) {
    const merged = { ...existing, ...updated, id };
    await db.put("transactions", merged);
  }
  return getTransactions();
}

export async function deleteTransaction(id: string): Promise<Transaction[]> {
  const db = await getDB();
  await db.delete("transactions", id);
  return getTransactions();
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
