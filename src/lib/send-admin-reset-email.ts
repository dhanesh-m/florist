import { Resend } from "resend";

export async function sendAdminPasswordResetEmail(to: string, resetUrl: string): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY not set");
  const resend = new Resend(key);
  const from = process.env.RESEND_FROM || "Floral Doctor <onboarding@resend.dev>";
  await resend.emails.send({
    from,
    to,
    subject: "Reset your Floral Doctor admin password",
    html: `<p>Click the link below to choose a new password. It expires in one hour.</p><p><a href="${resetUrl}">Reset password</a></p><p>If you did not request this, you can ignore this email.</p>`,
  });
}
