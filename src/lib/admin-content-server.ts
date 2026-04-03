import { doc, getDoc } from "firebase/firestore";
import type { AdminContentDoc } from "./admin-content-types";
import { db } from "./firebase-server";

/**
 * Reads `adminContent/main` using the Firebase client SDK (same config as the app).
 * Firestore security rules must allow reading this document for server routes (and the public site API).
 */
export async function getAdminContentServer(): Promise<AdminContentDoc | null> {
  try {
    const snap = await getDoc(doc(db, "adminContent", "main"));
    if (!snap.exists()) return null;
    return snap.data() as AdminContentDoc;
  } catch (e) {
    console.error("getAdminContentServer:", e);
    return null;
  }
}
