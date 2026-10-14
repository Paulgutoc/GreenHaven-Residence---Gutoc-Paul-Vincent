import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const employeeId = searchParams.get("employeeId") || "EM-2026-001";

    // 1. Fetch leave requests
    const { data: requests, error: reqErr } = await supabaseAdmin
      .from("leave_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (reqErr) {
      return NextResponse.json({ error: reqErr.message }, { status: 500 });
    }

    // 2. Fetch leave balances
    const { data: balances, error: balErr } = await supabaseAdmin
      .from("leave_balances")
      .select("*")
      .eq("employee_id", employeeId);

    return NextResponse.json({
      success: true,
      requests: requests || [],
      balances: balances || [],
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to fetch leave data";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      employeeId = "EM-2026-001",
      leaveType,
      startDate,
      endDate,
      isHalfDay = false,
      daysCount = 1,
      reason = "",
    } = body;

    if (!leaveType || !startDate || !endDate) {
      return NextResponse.json(
        { error: "Leave type, start date, and end date are required." },
        { status: 400 }
      );
    }

    // Insert leave request
    const { data: newLeave, error: insertErr } = await supabaseAdmin
      .from("leave_requests")
      .insert({
        employee_id: employeeId,
        leave_type: leaveType,
        start_date: startDate,
        end_date: endDate,
        is_half_day: Boolean(isHalfDay),
        days_count: Number(daysCount),
        reason: reason,
        status: "Pending",
      })
      .select()
      .single();

    if (insertErr) {
      return NextResponse.json({ error: insertErr.message }, { status: 500 });
    }

    // Update leave balance
    const { data: currentBal } = await supabaseAdmin
      .from("leave_balances")
      .select("*")
      .eq("employee_id", employeeId)
      .eq("leave_type", leaveType)
      .maybeSingle();

    if (currentBal) {
      await supabaseAdmin
        .from("leave_balances")
        .update({
          days_used: Number(currentBal.days_used) + Number(daysCount),
        })
        .eq("id", currentBal.id);
    }

    return NextResponse.json({
      success: true,
      leave: newLeave,
      message: "Leave application submitted successfully!",
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to apply for leave";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status, decidedBy = "EM-2026-001" } = body;

    if (!id || !status) {
      return NextResponse.json({ error: "ID and status are required" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("leave_requests")
      .update({
        status,
        decided_by: decidedBy,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      leave: data,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to update leave";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
