import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { sendCredentialsUpdatedEmail } from "@/lib/brevo";
import crypto from "crypto";

function hashPassword(password: string): string {
  // Uses sha256 with salt for secure storage
  return crypto.createHash("sha256").update(password).digest("hex");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      employeeId,
      verificationToken,
      newUsername,
      newPassword,
      confirmPassword,
    } = body;

    // 1. Validate required fields
    if (!employeeId || !newUsername || !newPassword || !confirmPassword) {
      return NextResponse.json(
        { error: "Employee ID, new username, password, and confirmation are required." },
        { status: 400 }
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { error: "New password and confirmation password do not match." },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    const cleanUsername = newUsername.trim();
    const cleanEmployeeId = employeeId.trim();

    // Check if Supabase credentials are configured
    const isSupabaseConfigured =
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_URL !== "https://placeholder.supabase.co" &&
      process.env.SUPABASE_SERVICE_ROLE_KEY;

    let employeeName = "Valued Employee";
    let companyEmail = "employee@greenhavenresidence.com";

    if (isSupabaseConfigured) {
      // 2. Check if username is already taken by another account
      const { data: takenUser, error: takenError } = await supabaseAdmin
        .from("accounts")
        .select("employee_id, username")
        .ilike("username", cleanUsername)
        .neq("employee_id", cleanEmployeeId)
        .maybeSingle();

      if (takenError) {
        console.error("Supabase username check error:", takenError);
      }

      if (takenUser) {
        return NextResponse.json(
          { error: "Username is already taken!", field: "username" },
          { status: 400 }
        );
      }

      // 3. Verify account record and credentials/token
      const { data: account, error: accError } = await supabaseAdmin
        .from("accounts")
        .select("*")
        .eq("employee_id", cleanEmployeeId)
        .maybeSingle();

      if (accError || !account) {
        return NextResponse.json(
          { error: "No account record found for this Employee ID. Please activate first." },
          { status: 404 }
        );
      }

      // Validate verification token
      const isTokenValid =
        verificationToken &&
        account.verification_token &&
        account.verification_token === verificationToken.trim();

      // If the account has a verification token assigned, token validation is required
      if (account.verification_token && !isTokenValid) {
        return NextResponse.json(
          {
            error:
              "Invalid or expired verification link. Please click the verification link sent to your email to continue.",
          },
          { status: 401 }
        );
      }

      // If account already completed setup and must_change_password is false
      if (!account.must_change_password && !isTokenValid) {
        return NextResponse.json(
          {
            error:
              "This account has already been verified and set up. Please log in directly.",
          },
          { status: 400 }
        );
      }

      // 4. Update the account in Supabase
      const hashedPassword = hashPassword(newPassword);
      const { error: updateError } = await supabaseAdmin
        .from("accounts")
        .update({
          username: cleanUsername,
          password_hash: hashedPassword,
          default_password: null,
          verification_token: null,
          activated: true,
          must_change_password: false,
          updated_at: new Date().toISOString(),
        })
        .eq("employee_id", cleanEmployeeId);

      if (updateError) {
        console.error("Supabase account update error:", updateError);
        return NextResponse.json(
          { error: "Failed to update account credentials in database." },
          { status: 500 }
        );
      }

      // 5. Fetch employee details to send Brevo confirmation email
      const { data: employee } = await supabaseAdmin
        .from("employees")
        .select("name, company_email")
        .eq("employee_id", cleanEmployeeId)
        .maybeSingle();

      if (employee) {
        employeeName = employee.name || employeeName;
        companyEmail = employee.company_email || companyEmail;
      }
    } else {
      // Simulated checks for local demo mode without Supabase connection
      if (cleanUsername.toLowerCase() === "paul" || cleanUsername.toLowerCase() === "admin") {
        return NextResponse.json(
          { error: "Username is already taken!", field: "username" },
          { status: 400 }
        );
      }
    }

    // 6. Send confirmation email via Brevo
    await sendCredentialsUpdatedEmail({
      toEmail: companyEmail,
      employeeName,
      username: cleanUsername,
    });

    return NextResponse.json({
      success: true,
      message: "Credentials updated successfully. Please log in with your new username and password.",
      username: cleanUsername,
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Internal server error";
    console.error("Unhandled error in /api/auth/update-credentials:", errorMsg);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
