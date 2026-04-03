"use client";

import { doc, setDoc } from "firebase/firestore";
import { db } from "./firebase-client";
import type { AdminContentDoc } from "./admin-content-types";
import { compressAdminImageFileToDataUrl, compressLargeAdminDataUrlsInDoc } from "./admin-image-compression";

/** Same as {@link compressAdminImageFileToDataUrl} — use for every admin image file upload. */
export async function uploadAdminImage(file: File): Promise<string> {
  return compressAdminImageFileToDataUrl(file);
}

/**
 * Firestore rejects `undefined` anywhere in document data. Strip it recursively (omit keys /
 * filter array entries) while leaving Dates and class instances (e.g. Timestamp) unchanged.
 */
function stripUndefinedForFirestore<T>(value: T): T {
  if (value === undefined) return value as T;
  if (value === null) return value;
  if (typeof value !== "object") return value;
  if (value instanceof Date) return value;

  if (Array.isArray(value)) {
    return value
      .map((item) => stripUndefinedForFirestore(item))
      .filter((item) => item !== undefined) as T;
  }

  const proto = Object.getPrototypeOf(value);
  if (proto !== Object.prototype && proto !== null) {
    return value;
  }

  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
    if (v === undefined) continue;
    out[k] = stripUndefinedForFirestore(v);
  }
  return out as T;
}

/** Firestore max document size is 1,048,576 bytes; stay under with a margin for encoding. */
const MAX_DOC_JSON_CHARS = 950_000;

export async function saveAdminContent(state: AdminContentDoc): Promise<void> {
  const sanitized = await compressLargeAdminDataUrlsInDoc(state);
  const ref = doc(db, "adminContent", "main");
  const payload = stripUndefinedForFirestore(structuredClone(sanitized));
  const serialized = JSON.stringify(payload);
  if (serialized.length > MAX_DOC_JSON_CHARS) {
    throw new Error(
      "Content is too large for Firestore (1MB per document). Remove or replace some images, or delete unused collection items, then try again."
    );
  }
  await setDoc(ref, payload);
}
