import { applyPasswordReset } from "@/lib/admin-auth-firestore";
import { getAdminDb } from "@/lib/firebase-admin";

const MIN_LEN = 8;

export async function POST(req: Request) {
  if (!getAdminDb()) {
    return Response.json({ error: "Server not configured" }, { status: 503 });
  }

  let body: { token?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid body" }, { status: 400 });
  }

  const token = String(body.token ?? "");
  const password = String(body.password ?? "");
  if (!token || !password) {
    return Response.json({ error: "Invalid body" }, { status: 400 });
  }
  if (password.length < MIN_LEN) {
    return Response.json({ error: "password_too_short" }, { status: 400 });
  }

  const ok = await applyPasswordReset(token, password);
  if (!ok) {
    return Response.json({ error: "invalid_or_expired_token" }, { status: 400 });
  }

  return Response.json({ ok: true });
}
