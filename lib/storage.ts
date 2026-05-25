import { supabase } from "./supabase";
import { Transaction } from "./types";

export async function getTransactions(): Promise<Transaction[]> {
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .order("date", { ascending: false });

  if (error) {
    console.error("Error fetching transactions:", error);
    return [];
  }

  return (data || []).map((row) => ({
    id: row.id,
    type: row.type,
    category: row.category,
    amount: Number(row.amount),
    note: row.note || "",
    date: row.date,
    createdAt: row.created_at,
  }));
}

export async function addTransaction(tx: Transaction): Promise<Transaction[]> {
  const { data: session } = await supabase.auth.getSession();
  if (!session.session?.user) return getTransactions();

  const { error } = await supabase.from("transactions").insert({
    id: tx.id,
    user_id: session.session.user.id,
    type: tx.type,
    category: tx.category,
    amount: tx.amount,
    note: tx.note,
    date: tx.date,
    created_at: tx.createdAt,
  });

  if (error) {
    console.error("Error adding transaction:", error);
  }

  return getTransactions();
}

export async function updateTransaction(
  id: string,
  updated: Partial<Transaction>
): Promise<Transaction[]> {
  const updateData: Record<string, unknown> = {};
  if (updated.type !== undefined) updateData.type = updated.type;
  if (updated.category !== undefined) updateData.category = updated.category;
  if (updated.amount !== undefined) updateData.amount = updated.amount;
  if (updated.note !== undefined) updateData.note = updated.note;
  if (updated.date !== undefined) updateData.date = updated.date;

  const { error } = await supabase
    .from("transactions")
    .update(updateData)
    .eq("id", id);

  if (error) {
    console.error("Error updating transaction:", error);
  }

  return getTransactions();
}

export async function deleteTransaction(id: string): Promise<Transaction[]> {
  const { error } = await supabase
    .from("transactions")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting transaction:", error);
  }

  return getTransactions();
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
