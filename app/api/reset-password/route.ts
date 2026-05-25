import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { email, newPassword } = await req.json();

  if (!email || !newPassword) {
    return NextResponse.json({ error: "Email dan password wajib diisi" }, { status: 400 });
  }

  if (newPassword.length < 6) {
    return NextResponse.json({ error: "Password minimal 6 karakter" }, { status: 400 });
  }

  // Use service role to update user password
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Find user by email
  const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers();

  if (listError) {
    return NextResponse.json({ error: "Gagal mengakses data user" }, { status: 500 });
  }

  const user = users.users.find((u: any) => u.email === email);
  if (!user) {
    return NextResponse.json({ error: "Username tidak ditemukan" }, { status: 404 });
  }

  // Update password
  const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
    password: newPassword,
  });

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
