import { hasFirestorePassword } from "./admin-auth-firestore";

/**
 * Admin login is available when the session secret is set and either
 * `ADMIN_PASSWORD` is set (env bootstrap / fallback) or Firestore already holds a bcrypt hash.
 */
export async function isAdminLoginReady(): Promise<boolean> {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.length < 16) return false;
  if (process.env.ADMIN_PASSWORD && process.env.ADMIN_PASSWORD.length >= 1) return true;
  return hasFirestorePassword();
}
