import type { AdminContentDoc } from "./admin-content-types";
import type { Product } from "@/data/products";

function deriveBadgeTag(tags?: unknown): Product["tag"] | undefined {
  if (!Array.isArray(tags)) return undefined;
  const set = new Set(tags.map((t) => String(t).toLowerCase()));

  // Priority order for a single badge.
  if (set.has("bestseller")) return "Bestseller";
  if (set.has("trending")) return "Trending";
  if (set.has("new")) return "New";

  return undefined;
}

export function normalizeAdminProducts(doc: AdminContentDoc | null): Product[] {
  if (!doc?.products?.length) return [];

  return doc.products
    .filter(
      (p) =>
        p &&
        p.isVisible !== false &&
        typeof p.slug === "string" &&
        typeof p.name === "string" &&
        typeof p.imageUrl === "string" &&
        typeof p.category === "string" &&
        (typeof p.price === "number" || p.price !== undefined),
    )
    .map((p) => {
      const priceNum = typeof p.price === "number" ? p.price : Number(p.price);
      const safePrice = Number.isFinite(priceNum) ? priceNum : 0;

      return {
        slug: p.slug as string,
        name: p.name as string,
        price: safePrice,
        image: p.imageUrl as string,
        category: p.category as Product["category"],
        tag: deriveBadgeTag(p.tags),
        description: (p.description as string) || "",
      };
    });
}

