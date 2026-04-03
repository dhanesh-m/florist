"use client";

import type { AdminContentDoc } from "./admin-content-types";

export type {
  CollectionTag,
  CollectionCategory,
  HeroDoc,
  CategoryDoc,
  ProductDoc,
  TestimonialDoc,
  AboutDoc,
  AdminContentDoc,
} from "./admin-content-types";

let cachedPromise: Promise<AdminContentDoc | null> | null = null;

/** Call after a successful save so the next public fetch is fresh. */
export function invalidateAdminContentCache(): void {
  cachedPromise = null;
}

/**
 * Loads published site content. Uses `GET /api/public/site-content` (server reads Firestore via the
 * Firebase client config), so the public app does not depend on client-side Firestore access.
 *
 * @param force - If true, skip in-memory cache (e.g. admin panel after edits).
 */
export async function getAdminContentClient(force = false): Promise<AdminContentDoc | null> {
  if (!force && cachedPromise) return cachedPromise;

  const p = (async () => {
    try {
      const url =
        force === true
          ? `/api/public/site-content?_=${Date.now()}`
          : "/api/public/site-content";
      const r = await fetch(url, {
        cache: force ? "no-store" : "default",
      });
      if (!r.ok) {
        console.error("getAdminContentClient: /api/public/site-content returned", r.status);
        return null;
      }
      return (await r.json()) as AdminContentDoc | null;
    } catch (e) {
      console.error("getAdminContentClient:", e);
      return null;
    }
  })();

  if (!force) {
    cachedPromise = p;
  }
  return p;
}
