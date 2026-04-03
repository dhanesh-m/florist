#!/usr/bin/env node
/**
 * Writes the admin password hash to Firestore `adminAuth/main` (same as the app uses).
 *
 * Requires `FIREBASE_SERVICE_ACCOUNT_JSON` (same as Next.js). Loads `.env.local` if present.
 *
 * Usage:
 *   node scripts/seed-admin-password.mjs "YourPassword"
 *   SEED_PASSWORD=YourPassword npm run seed:admin-password
 *
 * Password defaults to `ADMIN_PASSWORD` from the environment after loading `.env.local`.
 */

import { readFileSync, existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcryptjs";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

function loadEnvLocal() {
  const p = join(root, ".env.local");
  if (!existsSync(p)) return;
  const text = readFileSync(p, "utf8");
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 1) continue;
    const key = trimmed.slice(0, eq).trim();
    const name = /^[A-Za-z_][A-Za-z0-9_]*$/.test(key) ? key : null;
    if (!name || process.env[name] !== undefined) continue;
    let v = trimmed.slice(eq + 1).trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    process.env[name] = v;
  }
}

loadEnvLocal();

const password =
  process.argv[2] || process.env.SEED_PASSWORD || process.env.ADMIN_PASSWORD;
const rawJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

if (!password) {
  console.error(
    "Missing password. Pass as first argument, or set SEED_PASSWORD / ADMIN_PASSWORD."
  );
  process.exit(1);
}
if (!rawJson) {
  console.error(
    "Missing FIREBASE_SERVICE_ACCOUNT_JSON. Add your service account JSON (one line) to .env.local."
  );
  process.exit(1);
}

let j;
try {
  j = JSON.parse(rawJson);
} catch {
  console.error("FIREBASE_SERVICE_ACCOUNT_JSON is not valid JSON.");
  process.exit(1);
}

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
  console.error("Service account JSON must include client_email and private_key.");
  process.exit(1);
}

if (!getApps().length) {
  initializeApp({
    credential: cert({ clientEmail, privateKey, projectId }),
  });
}

const db = getFirestore();
const email =
  (process.env.ADMIN_EMAIL && process.env.ADMIN_EMAIL.trim()) || null;

const passwordHash = await bcrypt.hash(password, 12);

await db
  .collection("adminAuth")
  .doc("main")
  .set(
    {
      passwordHash,
      email,
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

console.log("Updated adminAuth/main in Firestore with new password hash.");
if (email) console.log("Admin email field:", email);
