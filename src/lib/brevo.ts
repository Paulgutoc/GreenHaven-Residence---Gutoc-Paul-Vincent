// Brevo (formerly Sendinblue) Transactional Email Client for Green Haven Residence
// Uses the Brevo v3 Transactional REST API

interface SendEmailParams {
  to: { email: string; name?: string }[];
  subject: string;
  htmlContent: string;
  textContent?: string;
}

interface ActivationEmailParams {
  toEmail: string;
  employeeName: string;
  employeeId: string;
  verificationLink?: string;
  verificationToken?: string;
}

interface CredentialsUpdatedEmailParams {
  toEmail: string;
  employeeName: string;
  username: string;
}

export async function sendBrevoEmail({
  to,
  subject,
  htmlContent,
  textContent,
}: SendEmailParams): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL || "noreply@greenhavenresidence.com";
  const senderName = process.env.BREVO_SENDER_NAME || "Green Haven Residence";

  if (!apiKey || apiKey === "your-brevo-api-key-here") {
    console.warn(
      "⚠️ [Brevo] BREVO_API_KEY is not set. Email dispatch logged in simulated development mode:",
      { to, subject }
    );
    return {
      success: true,
      messageId: `simulated-${Date.now()}`,
    };
  }

  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        accept: "application/json",
        "api-key": apiKey,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        sender: {
          name: senderName,
          email: senderEmail,
        },
        to,
        subject,
        htmlContent,
        textContent: textContent || subject,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("❌ [Brevo API Error]", data);
      return {
        success: false,
        error: data.message || "Failed to send email via Brevo",
      };
    }

    return {
      success: true,
      messageId: data.messageId,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Unknown error";
    console.error("❌ [Brevo Network Error]", errorMsg);
    return {
      success: false,
      error: errorMsg,
    };
  }
}

/**
 * Sends verification link upon account activation (no temporary password required)
 */
export async function sendActivationVerificationEmail({
  toEmail,
  employeeName,
  employeeId,
  verificationLink,
}: ActivationEmailParams) {
  const subject = "Green Haven Residence – Account Activation & Verification";

  const actionButtonHtml = verificationLink
    ? `
      <div style="text-align: center; margin: 32px 0 20px;">
        <a href="${verificationLink}" style="display: inline-block; background: #10b981; color: #070c09; font-weight: 700; font-size: 15px; padding: 15px 32px; border-radius: 12px; text-decoration: none; box-shadow: 0 4px 18px rgba(16, 185, 129, 0.4); letter-spacing: 0.02em;">
          Verify Account &amp; Set Password &rarr;
        </a>
      </div>
      <p style="text-align: center; font-size: 12px; color: #9ca3af; margin-top: 8px;">
        Or paste this link into your browser:<br>
        <a href="${verificationLink}" style="color: #34d399; word-break: break-all;">${verificationLink}</a>
      </p>
    `
    : "";

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Account Activation</title>
      </head>
      <body style="margin: 0; padding: 24px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b120e; color: #f3f4f6;">
        <div style="max-width: 580px; margin: 0 auto; background: #142019; border: 1px solid rgba(255, 255, 255, 0.16); border-radius: 20px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.5);">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #162a1f 0%, #0d1712 100%); padding: 36px 30px; text-align: center; border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
            <div style="display: inline-block; padding: 10px 20px; background: rgba(16, 185, 129, 0.12); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 9999px; font-weight: 700; font-size: 13px; color: #34d399; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 14px;">
              Green Haven Residence · EMS
            </div>
            <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #ffffff;">Verify Your Account</h1>
          </div>

          <!-- Body -->
          <div style="padding: 36px 32px;">
            <p style="font-size: 16px; line-height: 1.6; color: #d1d5db; margin-top: 0;">
              Hello <strong>${employeeName || "Valued Colleague"}</strong>,
            </p>
            <p style="font-size: 15px; line-height: 1.6; color: #9ca3af;">
              An activation request was submitted for your Green Haven Residence Employee Management System account (Employee ID: <strong style="color: #ffffff;">${employeeId}</strong>).
            </p>
            <p style="font-size: 15px; line-height: 1.6; color: #9ca3af;">
              Please click the button below to verify your email and complete your account setup by creating your permanent username and secure password:
            </p>

            ${actionButtonHtml}

            <div style="background: rgba(212, 175, 55, 0.08); border-left: 3px solid #d4af37; padding: 14px 18px; border-radius: 6px; margin: 24px 0;">
              <p style="margin: 0; font-size: 13px; color: #fde047; line-height: 1.5;">
                <strong>Security Notice:</strong> This activation link is uniquely assigned to your account. You will create your own password directly—no temporary password is required.
              </p>
            </div>

            <p style="font-size: 13px; color: #6b7280; line-height: 1.5; margin-bottom: 0;">
              If you did not request this activation, please contact the Green Haven Residence HR office immediately.
            </p>
          </div>

          <!-- Footer -->
          <div style="background: #0f1813; padding: 20px 30px; text-align: center; border-top: 1px solid rgba(255, 255, 255, 0.08); font-size: 12px; color: #6b7280;">
            &copy; 2026 Green Haven Residence. All rights reserved.
          </div>
        </div>
      </body>
    </html>
  `;

  return sendBrevoEmail({
    to: [{ email: toEmail, name: employeeName }],
    subject,
    htmlContent,
    textContent: `Hello ${employeeName}, your Green Haven Residence account is ready to activate. Verify your account and set your credentials here: ${verificationLink || ""}`,
  });
}

/**
 * Sends confirmation email when username and password have been successfully updated
 */
export async function sendCredentialsUpdatedEmail({
  toEmail,
  employeeName,
  username,
}: CredentialsUpdatedEmailParams) {
  const subject = "Green Haven Residence – Account Credentials Updated Successfully";

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Credentials Updated</title>
      </head>
      <body style="margin: 0; padding: 24px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b120e; color: #f3f4f6;">
        <div style="max-width: 580px; margin: 0 auto; background: #142019; border: 1px solid rgba(255, 255, 255, 0.16); border-radius: 20px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.5);">
          <div style="background: linear-gradient(135deg, #162a1f 0%, #0d1712 100%); padding: 36px 30px; text-align: center; border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
            <div style="display: inline-block; padding: 10px 20px; background: rgba(16, 185, 129, 0.12); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 9999px; font-weight: 700; font-size: 13px; color: #34d399; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 14px;">
              Green Haven Residence · EMS
            </div>
            <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #ffffff;">Credentials Updated Successfully</h1>
          </div>

          <div style="padding: 36px 32px;">
            <p style="font-size: 16px; line-height: 1.6; color: #d1d5db; margin-top: 0;">
              Hello <strong>${employeeName || "Colleague"}</strong>,
            </p>
            <p style="font-size: 15px; line-height: 1.6; color: #9ca3af;">
              Your Green Haven Residence Employee Management System account credentials have been successfully updated.
            </p>

            <div style="background: rgba(0, 0, 0, 0.45); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 12px; padding: 18px 20px; margin: 24px 0;">
              <div style="font-size: 13px; color: #9ca3af; margin-bottom: 4px;">Registered Username:</div>
              <div style="font-size: 18px; font-weight: 700; color: #34d399;">${username}</div>
            </div>

            <p style="font-size: 15px; line-height: 1.6; color: #9ca3af;">
              You can now log in to the portal anytime using your new username and password.
            </p>

            <p style="font-size: 13px; color: #6b7280; line-height: 1.5; margin-top: 28px;">
              If you did not perform this change, please contact IT Support or HR immediately to secure your account.
            </p>
          </div>

          <div style="background: #0f1813; padding: 20px 30px; text-align: center; border-top: 1px solid rgba(255, 255, 255, 0.08); font-size: 12px; color: #6b7280;">
            &copy; 2026 Green Haven Residence. All rights reserved.
          </div>
        </div>
      </body>
    </html>
  `;

  return sendBrevoEmail({
    to: [{ email: toEmail, name: employeeName }],
    subject,
    htmlContent,
    textContent: `Hello ${employeeName}, your Green Haven Residence credentials have been updated with username: ${username}. You can now log in.`,
  });
}
