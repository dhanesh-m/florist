/** True when `src` is a data URL (e.g. Firestore-stored base64 images). Next/Image needs `unoptimized` for these. */
export function isDataImageUrl(src: string): boolean {
  return typeof src === "string" && src.startsWith("data:image/");
}
