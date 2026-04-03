import { timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { COOKIE_NAME, signSession } from "@/lib/admin-session";
import { getAdminContentServer } from "@/lib/admin-content-server";

function safeEqualPlain(a: string, b: string): boolean {
  try {
    const ba = Buffer.from(a, "utf8");
    const bb = Buffer.from(b, "utf8");
    if (ba.length !== bb.length) return false;
    return timingSafeEqual(ba, bb);
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.length < 16) {
    return Response.json({ error: "Server not configured" }, { status: 503 });
  }

  let body: { password?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid body" }, { status: 400 });
  }

  const plain = body.password ?? "";
  if (!plain) {
    return Response.json({ error: "Invalid body" }, { status: 400 });
  }

  const doc = await getAdminContentServer();
  const stored = doc?.password;
  if (typeof stored !== "string" || !stored.length) {
    return Response.json({ error: "Server not configured" }, { status: 503 });
  }

  if (!safeEqualPlain(plain, stored)) {
    return Response.json({ error: "Invalid password" }, { status: 401 });
  }

  const token = signSession(secret);
  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return Response.json({ ok: true });
}
