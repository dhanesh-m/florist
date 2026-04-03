import { createHash, randomBytes } from "crypto";
import bcrypt from "bcryptjs";
import { FieldValue, type Timestamp } from "firebase-admin/firestore";
import { getAdminDb } from "./firebase-admin";

const MAIN = "adminAuth";
const DOC = "main";

export type AdminAuthMain = {
  passwordHash?: string;
  email?: string | null;
  updatedAt?: Timestamp;
  pendingReset?: {
    tokenHash: string;
    expiresAt: number;
  } | null;
};

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function getAdminAuthMain(): Promise<AdminAuthMain | null> {
  const db = getAdminDb();
  if (!db) return null;
  try {
    const snap = await db.collection(MAIN).doc(DOC).get();
    if (!snap.exists) return null;
    return snap.data() as AdminAuthMain;
  } catch (e) {
    console.error("[admin-auth] Failed to read adminAuth/main from Firestore:", e);
    return null;
  }
}

export async function hasFirestorePassword(): Promise<boolean> {
  const data = await getAdminAuthMain();
  return Boolean(data?.passwordHash);
}

/** Hash a plaintext password for storage in Firestore. */
export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 12);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export async function savePasswordHashAndEmail(
  passwordHash: string,
  email: string | null | undefined
): Promise<void> {
  const db = getAdminDb();
  if (!db) throw new Error("Firebase Admin not configured");
  await db.collection(MAIN).doc(DOC).set(
    {
      passwordHash,
      email: email ?? null,
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );
}

export async function migrateEnvPasswordToFirestore(
  plainPassword: string,
  emailFromEnv: string | undefined
): Promise<void> {
  const hash = await hashPassword(plainPassword);
  const existing = await getAdminAuthMain();
  await savePasswordHashAndEmail(hash, emailFromEnv ?? existing?.email ?? process.env.ADMIN_EMAIL);
}

export function getStoredAdminEmail(data: AdminAuthMain | null): string {
  const fromDoc = data?.email?.trim();
  const fromEnv = process.env.ADMIN_EMAIL?.trim();
  return normalizeEmail(fromDoc || fromEnv || "");
}

export async function requestPasswordResetToken(): Promise<{ token: string; expiresAt: number }> {
  const db = getAdminDb();
  if (!db) throw new Error("Firebase Admin not configured");
  const token = randomBytes(32).toString("hex");
  const tokenHash = createHash("sha256").update(token).digest("hex");
  const expiresAt = Date.now() + 60 * 60 * 1000;
  await db.collection(MAIN).doc(DOC).set(
    {
      pendingReset: { tokenHash, expiresAt },
    },
    { merge: true }
  );
  return { token, expiresAt };
}

export async function applyPasswordReset(token: string, newPlainPassword: string): Promise<boolean> {
  const db = getAdminDb();
  if (!db) return false;
  const tokenHash = createHash("sha256").update(token).digest("hex");
  const ref = db.collection(MAIN).doc(DOC);
  const snap = await ref.get();
  const data = snap.data() as AdminAuthMain | undefined;
  const pending = data?.pendingReset;
  if (!pending || pending.tokenHash !== tokenHash || pending.expiresAt < Date.now()) {
    return false;
  }
  const passwordHash = await hashPassword(newPlainPassword);
  await ref.set(
    {
      passwordHash,
      pendingReset: FieldValue.delete(),
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );
  return true;
}
