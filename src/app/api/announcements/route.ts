import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const filter = searchParams.get("filter"); // "all", "new"

    const { data, error } = await supabaseAdmin
      .from("announcements")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      announcements: data || [],
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to fetch announcements";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, description, audience, author, date, status } = body;

    if (!title || !description) {
      return NextResponse.json(
        { error: "Title and description are required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("announcements")
      .insert({
        title,
        description,
        audience: audience || "All Employees",
        author: author || "Management Office",
        date: date || new Date().toISOString().split("T")[0],
        status: status || "Published",
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      announcement: data,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to create announcement";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
