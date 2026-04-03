import { cookies } from "next/headers";
import { COOKIE_NAME, adminSessionCookieValue } from "@/lib/admin-session";
import { getAdminContentServer } from "@/lib/admin-content-server";

export async function POST(req: Request) {
  let body: { password?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "bad_request" }, { status: 400 });
  }

  const entered = String(body.password ?? "").trim();
  if (!entered) {
    return Response.json({ error: "bad_request" }, { status: 400 });
  }

  const doc = await getAdminContentServer();
  const raw = doc?.password;
  const stored =
    typeof raw === "string" ? raw.trim() : raw !== undefined && raw !== null ? String(raw).trim() : "";

  if (!stored) {
    return Response.json(
      {
        error: "not_configured",
        message: "No password on adminContent/main or Firestore read failed.",
      },
      { status: 503 }
    );
  }

  if (entered !== stored) {
    return Response.json({ error: "wrong_password" }, { status: 401 });
  }

  cookies().set(COOKIE_NAME, adminSessionCookieValue(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return Response.json({ ok: true });
}
