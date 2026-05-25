import { NextRequest, NextResponse } from "next/server";
import initSqlJs, { Database } from "sql.js";
import * as path from "path";
import * as fs from "fs";

// SQLite database path
const DB_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DB_DIR, "finance.db");

async function getDb(): Promise<Database> {
  const SQL = await initSqlJs();

  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }

  let db: Database;
  if (fs.existsSync(DB_PATH)) {
    const buffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }

  // Create table if not exists
  db.run(`
    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      category TEXT NOT NULL,
      amount REAL NOT NULL,
      note TEXT DEFAULT '',
      date TEXT NOT NULL,
      createdAt TEXT NOT NULL
    )
  `);

  return db;
}

function saveDb(db: Database) {
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(DB_PATH, buffer);
}

export async function GET() {
  try {
    const db = await getDb();
    const result = db.exec("SELECT * FROM transactions ORDER BY date DESC, createdAt DESC");
    const transactions = result.length > 0
      ? result[0].values.map((row) => ({
          id: row[0],
          type: row[1],
          category: row[2],
          amount: row[3],
          note: row[4],
          date: row[5],
          createdAt: row[6],
        }))
      : [];
    db.close();
    return NextResponse.json({ transactions });
  } catch (error: any) {
    return NextResponse.json({ transactions: [], error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, transaction, id } = body;
    const db = await getDb();

    if (action === "add") {
      db.run(
        "INSERT INTO transactions (id, type, category, amount, note, date, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [transaction.id, transaction.type, transaction.category, transaction.amount, transaction.note || "", transaction.date, transaction.createdAt]
      );
    } else if (action === "update") {
      const fields: string[] = [];
      const values: any[] = [];

      if (transaction.type !== undefined) { fields.push("type = ?"); values.push(transaction.type); }
      if (transaction.category !== undefined) { fields.push("category = ?"); values.push(transaction.category); }
      if (transaction.amount !== undefined) { fields.push("amount = ?"); values.push(transaction.amount); }
      if (transaction.note !== undefined) { fields.push("note = ?"); values.push(transaction.note); }
      if (transaction.date !== undefined) { fields.push("date = ?"); values.push(transaction.date); }

      if (fields.length > 0) {
        values.push(id);
        db.run(`UPDATE transactions SET ${fields.join(", ")} WHERE id = ?`, values);
      }
    } else if (action === "delete") {
      db.run("DELETE FROM transactions WHERE id = ?", [id]);
    }

    saveDb(db);

    const result = db.exec("SELECT * FROM transactions ORDER BY date DESC, createdAt DESC");
    const transactions = result.length > 0
      ? result[0].values.map((row) => ({
          id: row[0],
          type: row[1],
          category: row[2],
          amount: row[3],
          note: row[4],
          date: row[5],
          createdAt: row[6],
        }))
      : [];
    db.close();
    return NextResponse.json({ transactions });
  } catch (error: any) {
    return NextResponse.json({ transactions: [], error: error.message }, { status: 500 });
  }
}
