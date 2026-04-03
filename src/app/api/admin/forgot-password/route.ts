import {
  getAdminAuthMain,
  getStoredAdminEmail,
  requestPasswordResetToken,
} from "@/lib/admin-auth-firestore";
import { getAdminDb } from "@/lib/firebase-admin";
import { sendAdminPasswordResetEmail } from "@/lib/send-admin-reset-email";

export async function POST(req: Request) {
  let body: { email?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid body" }, { status: 400 });
  }

  const email = String(body.email ?? "").trim().toLowerCase();
  if (!email) {
    return Response.json({ error: "Email required" }, { status: 400 });
  }

  if (!getAdminDb()) {
    return Response.json({ error: "password_reset_unavailable" }, { status: 503 });
  }
  if (!process.env.RESEND_API_KEY) {
    return Response.json({ error: "email_not_configured" }, { status: 503 });
  }

  const data = await getAdminAuthMain();
  const stored = getStoredAdminEmail(data);
  if (!stored || stored !== email) {
    return Response.json({ ok: true });
  }

  try {
    const { token } = await requestPasswordResetToken();
    const origin = process.env.NEXT_PUBLIC_SITE_URL || new URL(req.url).origin;
    const resetUrl = `${origin}/admin/reset-password?token=${encodeURIComponent(token)}`;
    await sendAdminPasswordResetEmail(stored, resetUrl);
  } catch {
    return Response.json({ error: "send_failed" }, { status: 500 });
  }

  return Response.json({ ok: true });
}
