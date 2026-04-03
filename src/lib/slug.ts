/** URL-safe slug for /collection/[slug] — derived from display name. */
export function slugify(text: string): string {
  const s = text
    .toLowerCase()
    .trim()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return s || "item";
}

export function uniqueProductSlug(
  base: string,
  products: { slug?: string; id?: string }[],
  excludeId?: string
): string {
  let slug = base;
  let n = 2;
  while (products.some((p) => p.slug === slug && p.id !== excludeId)) {
    slug = `${base}-${n}`;
    n += 1;
  }
  return slug;
}
