"use client";

import { MAX_ADMIN_IMAGE_DATA_URL_CHARS, MAX_ADMIN_IMAGE_JPEG_BYTES } from "@/lib/admin-image-constants";

/** Shown under admin image pickers; all use the same JPEG + Base64 pipeline. */
export function AdminImageUploadHint() {
  const kb = Math.round(MAX_ADMIN_IMAGE_JPEG_BYTES / 1024);
  const maxK = Math.round(MAX_ADMIN_IMAGE_DATA_URL_CHARS / 1000);
  return (
    <p className="text-xs text-beige-500">
      Images are saved as JPEG then stored as Base64 data URLs (Base64 is ~4/3 the JPEG size). Each image is
      kept to about {kb}KB JPEG / ~{maxK}k characters so the whole site config fits Firestore&apos;s 1MB
      document limit — remove unused items if a save still fails.
    </p>
  );
}
