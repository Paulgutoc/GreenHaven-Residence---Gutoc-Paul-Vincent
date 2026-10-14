import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import crypto from "crypto";

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required." },
        { status: 400 }
      );
    }

    const cleanUsername = username.trim();

    const isSupabaseConfigured =
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_URL !== "https://placeholder.supabase.co" &&
      process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (isSupabaseConfigured) {
      // Lookup account in Supabase
      const { data: account, error: accError } = await supabaseAdmin
        .from("accounts")
        .select("*")
        .ilike("username", cleanUsername)
        .maybeSingle();

      if (accError || !account) {
        return NextResponse.json(
          { error: "Invalid username or password!" },
          { status: 401 }
        );
      }

      const inputHash = hashPassword(password);
      const isPasswordValid =
        account.password_hash === inputHash ||
        (account.default_password && account.default_password === password.trim());

      if (!isPasswordValid) {
        return NextResponse.json(
          { error: "Invalid username or password!" },
          { status: 401 }
        );
      }

      // Fetch employee profile details using the saved employee_id
      const { data: employee } = await supabaseAdmin
        .from("employees")
        .select("*")
        .eq("employee_id", account.employee_id)
        .maybeSingle();

      return NextResponse.json({
        success: true,
        user: {
          employeeId: account.employee_id,
          username: account.username,
          name: employee?.name || account.username,
          department: employee?.department || "General",
          role: employee?.role || "Employee",
          companyEmail: employee?.company_email || "",
          mustChangePassword: account.must_change_password,
        },
      });
    }

    return NextResponse.json({
      success: true,
      user: {
        employeeId: "EM-2026-001",
        username: cleanUsername,
        name: "Paul Vincent",
        department: "Management",
        role: "Department Manager",
        companyEmail: "paul.vincent@greenhavenresidence.com",
      },
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
