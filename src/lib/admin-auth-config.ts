import { getAdminContentServer } from "./admin-content-server";

/**
 * Admin login is available when the session secret is set and `adminContent/main` has a non-empty
 * `password` field (plain text, compared on the server).
 */
export async function isAdminLoginReady(): Promise<boolean> {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.length < 16) return false;
  const doc = await getAdminContentServer();
  const p = doc?.password;
  return typeof p === "string" && p.length > 0;
}
