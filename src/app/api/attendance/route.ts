import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const employeeId = searchParams.get("employeeId") || "EM-2026-001";

    const { data: records, error } = await supabaseAdmin
      .from("attendance")
      .select("*")
      .order("date", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      records: records || [],
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to fetch attendance";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, employeeId = "EM-2026-001" } = body; // action: "clock-in" | "clock-out"

    const today = new Date().toISOString().split("T")[0];
    const nowTime = new Date().toTimeString().split(" ")[0]; // "HH:MM:SS"

    if (action === "clock-in") {
      // Upsert record for today
      const { data, error } = await supabaseAdmin
        .from("attendance")
        .upsert(
          {
            employee_id: employeeId,
            date: today,
            time_in: nowTime,
            shift: "9:00 AM-6:00 PM",
            status: "Present",
          },
          { onConflict: "employee_id,date" }
        )
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, record: data, message: "Clocked in successfully!" });
    } else if (action === "clock-out") {
      const { data, error } = await supabaseAdmin
        .from("attendance")
        .update({ time_out: nowTime })
        .eq("employee_id", employeeId)
        .eq("date", today)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, record: data, message: "Clocked out successfully!" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to update attendance";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
