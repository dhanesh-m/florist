"use client";

/**
 * Single entry points for admin image handling:
 * - {@link compressAdminImageFileToDataUrl} — every new file pick / upload button should use this
 *   (also exposed as `uploadAdminImage` from `admin-content-admin.ts`).
 * - {@link shrinkAdminStoredImageIfNeeded} — oversized legacy `data:image/...` strings.
 * - {@link compressLargeAdminDataUrlsInDoc} — runs on every Firestore save so all image fields
 *   are bounded without duplicating logic at each button.
 */

import type { AdminContentDoc } from "./admin-content-types";
import {
  MAX_ADMIN_IMAGE_DATA_URL_CHARS,
  MAX_ADMIN_IMAGE_JPEG_BYTES,
} from "./admin-image-constants";
import { blobToDataURL, compressImageToMaxBytes } from "./compress-image-client";

/**
 * New file from an `<input type="file">` — JPEG-compressed, then checked against the **Base64 data URL
 * length** (what Firestore stores), not only binary blob size.
 */
export async function compressAdminImageFileToDataUrl(file: File): Promise<string> {
  let maxBinary = MAX_ADMIN_IMAGE_JPEG_BYTES;
  for (let attempt = 0; attempt < 14; attempt++) {
    const blob = await compressImageToMaxBytes(file, maxBinary);
    const dataUrl = await blobToDataURL(blob);
    if (dataUrl.length <= MAX_ADMIN_IMAGE_DATA_URL_CHARS) return dataUrl;
    maxBinary = Math.max(6 * 1024, Math.floor(maxBinary * 0.82));
  }
  throw new Error(
    `Could not compress image under the Base64 data URL limit (${MAX_ADMIN_IMAGE_DATA_URL_CHARS} characters). Try a smaller image.`
  );
}

/** Legacy or external huge data URLs: re-encode so the document can save. */
export async function shrinkAdminStoredImageIfNeeded(url: string): Promise<string> {
  const u = url.trim();
  if (!u) return "";
  if (!u.startsWith("data:image/")) return u;
  if (u.length <= MAX_ADMIN_IMAGE_DATA_URL_CHARS) return u;
  const res = await fetch(u);
  const blob = await res.blob();
  const file = new File([blob], "image.jpg", { type: blob.type || "image/jpeg" });
  return compressAdminImageFileToDataUrl(file);
}

/** Walk all known image-bearing fields before persisting to Firestore. */
export async function compressLargeAdminDataUrlsInDoc(doc: AdminContentDoc): Promise<AdminContentDoc> {
  const next = structuredClone(doc) as AdminContentDoc;

  if (next.hero?.heroImages?.length) {
    next.hero.heroImages = await Promise.all(
      next.hero.heroImages.map((u) => shrinkAdminStoredImageIfNeeded(typeof u === "string" ? u : ""))
    );
  }

  if (next.categories?.length) {
    for (const c of next.categories) {
      if (c?.imageUrl) c.imageUrl = await shrinkAdminStoredImageIfNeeded(c.imageUrl);
    }
  }

  if (next.products?.length) {
    for (const p of next.products) {
      if (p?.imageUrl) p.imageUrl = await shrinkAdminStoredImageIfNeeded(p.imageUrl);
    }
  }

  if (next.about?.image) {
    next.about.image = await shrinkAdminStoredImageIfNeeded(next.about.image);
  }

  if (next.instagram?.length) {
    for (const row of next.instagram) {
      if (row?.imageUrl) row.imageUrl = await shrinkAdminStoredImageIfNeeded(row.imageUrl);
    }
  }

  return next;
}
