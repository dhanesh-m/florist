/**
 * Firestore `adminContent/main` has a **1 MiB total** document limit. Images are stored as
 * **data URLs**: `data:image/jpeg;base64,<payload>`. The payload is Base64, which encodes 3 bytes
 * of binary JPEG as 4 characters — so the **string length in JSON** is what matters, not raw file
 * size on disk.
 *
 * {@link MAX_ADMIN_IMAGE_DATA_URL_CHARS} is the primary cap (full stored string).
 * {@link MAX_ADMIN_IMAGE_JPEG_BYTES} is derived so a typical JPEG at that size’s Base64 + prefix
 * stays under the character budget.
 */

/** Prefix for JPEG data URLs produced by our pipeline (`readAsDataURL` on `image/jpeg` blobs). */
export const ADMIN_JPEG_DATA_URL_PREFIX = "data:image/jpeg;base64," as const;

/**
 * Maximum length of the **entire** data URL string stored in Firestore (what actually inflates JSON).
 * Tune this (not raw “KB”) when balancing quality vs. document size.
 */
export const MAX_ADMIN_IMAGE_DATA_URL_CHARS = 140_000;

/**
 * For an n-byte binary blob, Base64 length is `4 * ceil(n/3)`. Find the largest n such that
 * `prefix + base64` fits under `maxDataUrlChars`.
 */
export function maxJpegBinaryBytesForDataUrlCharBudget(maxDataUrlChars: number): number {
  const prefixLen = ADMIN_JPEG_DATA_URL_PREFIX.length;
  const maxBase64Chars = maxDataUrlChars - prefixLen;
  if (maxBase64Chars < 4) return 0;
  let lo = 0;
  let hi = Math.min(maxDataUrlChars, 2 * 1024 * 1024);
  while (lo < hi) {
    const mid = Math.floor((lo + hi + 1) / 2);
    const base64Len = 4 * Math.ceil(mid / 3);
    if (base64Len + prefixLen <= maxDataUrlChars) lo = mid;
    else hi = mid - 1;
  }
  return lo;
}

/** Binary JPEG target derived from {@link MAX_ADMIN_IMAGE_DATA_URL_CHARS} and Base64 expansion. */
export const MAX_ADMIN_IMAGE_JPEG_BYTES = maxJpegBinaryBytesForDataUrlCharBudget(
  MAX_ADMIN_IMAGE_DATA_URL_CHARS
);

/**
 * Legacy / oversized stored strings: recompress when longer than our storage cap (same as
 * {@link MAX_ADMIN_IMAGE_DATA_URL_CHARS}).
 */
export const MAX_ADMIN_DATA_URL_CHARS = MAX_ADMIN_IMAGE_DATA_URL_CHARS;
