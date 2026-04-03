import { doc, getDoc } from "firebase/firestore";
import type { AdminContentDoc } from "./admin-content-types";
import { getAdminDb } from "./firebase-admin";
import { db } from "./firebase-server";

/**
 * Server-side read of `adminContent/main`. Prefers Firebase Admin SDK so reads succeed
 * even when Firestore Security Rules block unauthenticated client reads (public site).
 * Falls back to the Firestore web SDK when `FIREBASE_SERVICE_ACCOUNT_JSON` is not set.
 */
export async function getAdminContentServer(): Promise<AdminContentDoc | null> {
  const adm = getAdminDb();
  if (adm) {
    try {
      const snap = await adm.collection("adminContent").doc("main").get();
      if (!snap.exists) return null;
      return snap.data() as AdminContentDoc;
    } catch (e) {
      console.error("getAdminContentServer (Admin SDK):", e);
      return null;
    }
  }
  try {
    const snap = await getDoc(doc(db, "adminContent", "main"));
    if (!snap.exists()) return null;
    return snap.data() as AdminContentDoc;
  } catch (e) {
    console.error("getAdminContentServer (web SDK):", e);
    return null;
  }
}

