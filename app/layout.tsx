import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Finance App — Catatan Keuangan",
  description: "Aplikasi pencatatan pemasukan & pengeluaran harian",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-slate-900 text-slate-100 antialiased">
        {children}
      </body>
    </html>
  );
}
