import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const employeeId = searchParams.get("employeeId") || "EM-2026-001";

    const { data: employee, error } = await supabaseAdmin
      .from("employees")
      .select("*")
      .eq("employee_id", employeeId)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, employee });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to fetch profile";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      employeeId = "EM-2026-001",
      name,
      contact_number,
      address,
      province,
      city,
      zip,
      birthdate,
      gender,
    } = body;

    const { data, error } = await supabaseAdmin
      .from("employees")
      .update({
        name,
        contact_number,
        address,
        province,
        city,
        zip,
        birthdate,
        gender,
        updated_at: new Date().toISOString(),
      })
      .eq("employee_id", employeeId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, employee: data, message: "Profile updated successfully!" });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to update profile";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
