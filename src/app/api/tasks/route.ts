import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const employeeId = searchParams.get("employeeId") || "EM-2026-001";

    const { data: tasks, error } = await supabaseAdmin
      .from("tasks")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      tasks: tasks || [],
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to fetch tasks";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status, proofFileUrl } = body;

    if (!id || !status) {
      return NextResponse.json({ error: "Task ID and status are required" }, { status: 400 });
    }

    const updatePayload: Record<string, unknown> = {
      status,
      updated_at: new Date().toISOString(),
    };
    if (proofFileUrl) updatePayload.proof_file_url = proofFileUrl;

    const { data, error } = await supabaseAdmin
      .from("tasks")
      .update(updatePayload)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, task: data });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to update task";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
