import { cookies } from "next/headers";
import { COOKIE_NAME, signSession } from "@/lib/admin-session";
import {
  getAdminAuthMain,
  migrateEnvPasswordToFirestore,
  verifyPassword,
} from "@/lib/admin-auth-firestore";

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

  const envPassword = process.env.ADMIN_PASSWORD;
  const data = await getAdminAuthMain();
  const hash = data?.passwordHash;

  let valid = false;

  if (hash) {
    valid = await verifyPassword(plain, hash);
  } else if (envPassword && plain === envPassword) {
    valid = true;
    try {
      await migrateEnvPasswordToFirestore(plain, process.env.ADMIN_EMAIL);
    } catch {
      // Firestore migration failed; login still succeeds with env-only mode
    }
  }

  if (!valid) {
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
