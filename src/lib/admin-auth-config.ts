import { getAdminContentServer } from "./admin-content-server";

/** True when `adminContent/main` has a non-empty `password` field (and Firestore is readable). */
export async function isAdminLoginReady(): Promise<boolean> {
  const doc = await getAdminContentServer();
  const p = doc?.password;
  if (typeof p === "string") return p.trim().length > 0;
  if (p === undefined || p === null) return false;
  return String(p).trim().length > 0;
}
