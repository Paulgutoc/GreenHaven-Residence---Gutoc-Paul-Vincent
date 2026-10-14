import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { sendActivationVerificationEmail } from "@/lib/brevo";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { employeeId, email, termsAccepted } = body;

    if (!employeeId || !email) {
      return NextResponse.json(
        { error: "Employee ID and company email are required." },
        { status: 400 }
      );
    }

    if (!termsAccepted) {
      return NextResponse.json(
        { error: "You must accept the Terms and Conditions to proceed." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const cleanEmployeeId = employeeId.trim();

    // Check if Supabase credentials are configured
    const isSupabaseConfigured =
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_URL !== "https://placeholder.supabase.co" &&
      process.env.SUPABASE_SERVICE_ROLE_KEY;

    let employeeName = "Valued Employee";
    const verificationToken = crypto.randomBytes(24).toString("hex");

    if (isSupabaseConfigured) {
      // 1. Form a clean fallback name from the email (e.g. "paul.vincent" -> "Paul Vincent")
      const fallbackName =
        normalizedEmail
          .split("@")[0]
          .split(/[._-]/)
          .filter(Boolean)
          .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ") || `Employee ${cleanEmployeeId}`;

      // Check if this email was previously tied to another test employee_id
      const { data: existingEmpByEmail } = await supabaseAdmin
        .from("employees")
        .select("*")
        .ilike("company_email", normalizedEmail)
        .maybeSingle();

      const { data: existingEmpById } = await supabaseAdmin
        .from("employees")
        .select("*")
        .eq("employee_id", cleanEmployeeId)
        .maybeSingle();

      if (existingEmpByEmail && existingEmpByEmail.employee_id !== cleanEmployeeId) {
        // Remove old account and employee record associated with this email
        // so re-activating with a new ID number never causes unique email or foreign key collisions
        await supabaseAdmin
          .from("accounts")
          .delete()
          .eq("employee_id", existingEmpByEmail.employee_id);

        await supabaseAdmin
          .from("employees")
          .delete()
          .eq("id", existingEmpByEmail.id);
      }

      // 2. Upsert the employee record in Supabase to guarantee it exists
      const { data: savedEmp, error: empUpsertError } = await supabaseAdmin
        .from("employees")
        .upsert(
          {
            employee_id: cleanEmployeeId,
            company_email: normalizedEmail,
            name: existingEmpById?.name || fallbackName,
            department: existingEmpById?.department || "General",
            role: existingEmpById?.role || "Employee",
            updated_at: new Date().toISOString(),
          },
          { onConflict: "employee_id" }
        )
        .select("*")
        .single();

      if (empUpsertError) {
        console.error("Supabase employee upsert error:", empUpsertError);
        return NextResponse.json(
          { error: `Database error registering employee record: ${empUpsertError.message}` },
          { status: 500 }
        );
      }

      employeeName = savedEmp?.name || fallbackName;

      // 3. Check if account is already fully activated (already changed password)
      const { data: existingAccount } = await supabaseAdmin
        .from("accounts")
        .select("*")
        .eq("employee_id", cleanEmployeeId)
        .maybeSingle();

      if (existingAccount && existingAccount.activated && !existingAccount.must_change_password) {
        return NextResponse.json(
          {
            error:
              "Account with this ID has already been activated and verified. Please log in with your credentials.",
          },
          { status: 400 }
        );
      }

      // 4. Upsert account record with verification token (no default password needed)
      const { error: upsertError } = await supabaseAdmin.from("accounts").upsert(
        {
          employee_id: cleanEmployeeId,
          activated: true,
          must_change_password: true,
          default_password: null,
          verification_token: verificationToken,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "employee_id" }
      );

      if (upsertError) {
        console.error("Supabase account upsert error:", upsertError);
        return NextResponse.json(
          { error: `Failed to initialize account record in database: ${upsertError.message}` },
          { status: 500 }
        );
      }
    } else {
      console.warn(
        "⚠️ [Supabase] NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not configured. Running in simulated activation mode."
      );
    }

    // Determine host origin for the verification link
    const origin =
      req.headers.get("origin") ||
      req.headers.get("referer") ||
      process.env.NEXT_PUBLIC_APP_URL ||
      "http://localhost:3000";

    const cleanOrigin = origin.replace(/\/$/, "");
    const verificationLink = `${cleanOrigin}/?screen=changepassword&employeeId=${encodeURIComponent(
      cleanEmployeeId
    )}&token=${verificationToken}`;

    // 4. Send verification link via Brevo Transactional Email
    const emailResult = await sendActivationVerificationEmail({
      toEmail: normalizedEmail,
      employeeName,
      employeeId: cleanEmployeeId,
      verificationLink,
      verificationToken,
    });

    if (!emailResult.success) {
      return NextResponse.json(
        {
          error:
            emailResult.error ||
            "Failed to dispatch email via Brevo. Please check your Brevo configuration.",
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Activation email with verification link has been dispatched.",
      messageId: emailResult.messageId,
      verificationLink,
      verificationToken,
      // For developer testing convenience when Brevo is in simulated mode
      ...(process.env.NODE_ENV === "development" && {
        devVerificationToken: verificationToken,
        devVerificationLink: verificationLink,
      }),
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Internal server error";
    console.error("Unhandled error in /api/auth/activate:", errorMsg);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
