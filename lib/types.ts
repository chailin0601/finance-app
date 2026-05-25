export type TransactionType = "income" | "expense";

export type IncomeCategory = "CASH" | "QRIS" | "GRAB" | "GOJEK" | "TRANSFER" | "LAINNYA";
export type ExpenseCategory = "ES" | "GAS" | "AIR" | "KRUPUK" | "SAMPAH" | "LISTRIK" | "BELANJA" | "LAINNYA";

export interface Transaction {
  id: string;
  type: TransactionType;
  category: IncomeCategory | ExpenseCategory;
  amount: number;
  note: string;
  date: string; // ISO string
  createdAt: string;
}

export const INCOME_CATEGORIES: IncomeCategory[] = ["CASH", "QRIS", "GRAB", "GOJEK", "TRANSFER", "LAINNYA"];
export const EXPENSE_CATEGORIES: ExpenseCategory[] = ["ES", "GAS", "AIR", "KRUPUK", "SAMPAH", "LISTRIK", "BELANJA", "LAINNYA"];
