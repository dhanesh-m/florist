import { getApps, initializeApp, cert, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

let app: App | null | undefined;

/**
 * Firebase Admin (server-only). Required to read `adminContent/main` (including login `password`)
 * when Firestore rules block client reads.
 *
 * Set `FIREBASE_SERVICE_ACCOUNT_JSON` to the full JSON of a service account key (single line in .env).
 */
export function getFirebaseAdminApp(): App | null {
  if (app !== undefined) return app;
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!raw) {
    app = null;
    return null;
  }
  try {
    const j = JSON.parse(raw) as Record<string, unknown>;
    const privateKey =
      typeof j.private_key === "string"
        ? j.private_key
        : typeof j.privateKey === "string"
          ? j.privateKey
          : undefined;
    const clientEmail =
      typeof j.client_email === "string"
        ? j.client_email
        : typeof j.clientEmail === "string"
          ? j.clientEmail
          : undefined;
    const projectId =
      typeof j.project_id === "string"
        ? j.project_id
        : typeof j.projectId === "string"
          ? j.projectId
          : undefined;
    if (!privateKey || !clientEmail) {
      app = null;
      return null;
    }
    app = getApps().length
      ? getApps()[0]!
      : initializeApp({
          credential: cert({ clientEmail, privateKey, projectId }),
        });
    return app;
  } catch {
    app = null;
    return null;
  }
}

export function getAdminDb(): Firestore | null {
  const a = getFirebaseAdminApp();
  if (!a) return null;
  return getFirestore(a);
}
