/**
 * Default content shown on the public site when Firestore has no data or empty fields.
 * Admin panel merges saved `adminContent/main` over these so forms match what visitors see.
 */

import type { AdminContentDoc, CategoryDoc, HeroDoc, ProductDoc, TestimonialDoc } from "./admin-content-types";
import { products as seedProducts } from "@/data/products";

function tagToCollectionTag(tag: NonNullable<(typeof seedProducts)[0]["tag"]>): "new" | "trending" | "bestseller" {
  const m: Record<string, "new" | "trending" | "bestseller"> = {
    New: "new",
    Trending: "trending",
    Bestseller: "bestseller",
  };
  return m[tag] ?? "new";
}

const defaultCategories: CategoryDoc[] = [
  {
    id: "default-cat-bouquets",
    name: "Bouquets",
    slug: "bouquets",
    description: "Handcrafted arrangements for every occasion",
    imageUrl: "",
    sortOrder: 1,
    isVisible: true,
  },
  {
    id: "default-cat-wedding",
    name: "Wedding",
    slug: "wedding",
    description: "Bridal bouquets & wedding florals",
    imageUrl: "",
    sortOrder: 2,
    isVisible: true,
  },
  {
    id: "default-cat-custom",
    name: "Custom",
    slug: "custom",
    description: "Bespoke arrangements tailored to you",
    imageUrl: "",
    sortOrder: 3,
    isVisible: true,
  },
];

const defaultProducts: ProductDoc[] = seedProducts.map((p) => ({
  id: p.slug,
  slug: p.slug,
  name: p.name,
  description: p.description,
  category: p.category,
  price: p.price,
  imageUrl: p.image,
  tags: p.tag ? [tagToCollectionTag(p.tag)] : undefined,
  isVisible: true,
}));

const defaultTestimonials: TestimonialDoc[] = [
  {
    id: "default-t1",
    quote:
      "The bouquet for our anniversary was beyond what I imagined—delicate, fragrant, and arranged with such taste. Floral Doctor made the day feel truly special.",
    name: "Sarah M.",
    location: "Toronto",
    isVisible: true,
  },
  {
    id: "default-t2",
    quote:
      "Our wedding florals were the talk of the evening. Professional, punctual, and every table looked like a magazine spread. I would choose them again without hesitation.",
    name: "James & Priya K.",
    location: "Wedding · Vancouver",
    isVisible: true,
  },
  {
    id: "default-t3",
    quote:
      "I order regularly for my mother. The flowers always arrive fresh and last longer than anything I have bought elsewhere. Quiet luxury in every bundle.",
    name: "Elena R.",
    location: "Montreal",
    isVisible: true,
  },
];

/** Marquee words — matches `Marquee.tsx` fallback strip. */
const marqueeWordsDefault = [
  "Fresh Blooms",
  "Handmade",
  "Peonies",
  "Roses",
  "Artistry",
  "Elegance",
  "Bouquets",
  "Weddings",
  "Custom",
];

/** Single stored headline; `\n` splits line 1 / line 2 on the homepage. */
export function mergeHeroHeadlineString(h?: HeroDoc | null): string {
  if (!h) return "";
  if (typeof h.headline === "string" && h.headline.trim()) return h.headline.trim();
  const a = (h.headline1 || "").trim();
  const b = (h.headline2 || "").trim();
  if (a && b) return `${a}\n${b}`;
  return a || b || "";
}

export const SITE_CONTENT_DEFAULTS: AdminContentDoc = {
  hero: {
    eyebrow: "Floral Doctor. Canada",
    headline: "Art in\nBloom",
    description:
      "Handcrafted bouquets that tell a story. Each arrangement is a unique masterpiece, designed for those who appreciate the extraordinary.",
    ctaText: "Wedding Florals",
    /** Main hero + accent (top-right). Legacy 3-slot saves used index 2 for accent; middle slot is dropped. */
    heroImages: ["", ""],
  },
  categories: defaultCategories,
  products: defaultProducts,
  testimonials: defaultTestimonials,
  about: {
    founderName: "Jency Mathew",
    founderRole: "Founder, Floral Doctor",
    p1: "Floral Doctor was born from passion. Founded and owned by Jency Mathew, a Hair Transplant Surgeon by profession, this brand was created from a deep love for flowers and meaningful gifting.",
    p2: "What began as a heartfelt creative outlet became Floral Doctor. Today, each bouquet is handcrafted with the same precision, empathy, and attention to detail Jency brings to her medical practice.",
    p3: "From quiet thank-you gestures to grand celebrations, each arrangement is designed to feel warm, elegant, and deeply personal for the person receiving it.",
    quote: "Made with a surgeon's precision, delivered with a florist's heart.",
    image: "",
  },
  marquee: {
    words: marqueeWordsDefault,
    speedSeconds: 25,
    textColor: "#b76b69",
    isVisible: true,
  },
  instagram: Array.from({ length: 8 }, (_, i) => ({
    id: `default-ig-${i + 1}`,
    imageUrl: "",
    postUrl: "https://instagram.com/floral_doctor",
    caption: "",
    isVisible: true,
  })),
  settings: {
    brand: "Floral Doctor",
    whatsapp: "918136828150",
    instagramUrl: "https://instagram.com/floral_doctor",
    cities: "Toronto,Vancouver,Calgary,Montreal",
    seoTitle: "Floral Doctor | Fresh Flower Bouquets Canada",
    seoDescription: "Premium fresh handmade flower bouquets in Canada. Order via WhatsApp.",
  },
  updatedAt: new Date().toISOString(),
};

function strOr<T extends string | undefined>(saved: T, fallback: string): string {
  const s = typeof saved === "string" ? saved.trim() : "";
  return s.length > 0 ? saved! : fallback;
}

/**
 * Hero uses two images: main (large) + accent (top-right). Older content had a third “accent bottom”
 * slot; we map legacy `[a, _, c]` → `[a, c]`.
 */
export function normalizeHeroImageArray(imgs: string[] | undefined, fallbacks: string[]): string[] {
  const d = [0, 1].map((i) => (typeof fallbacks[i] === "string" && fallbacks[i]!.trim() ? fallbacks[i]!.trim() : ""));
  if (!Array.isArray(imgs) || imgs.length === 0) return [d[0] || "", d[1] || ""];
  if (imgs.length >= 3) {
    const a = typeof imgs[0] === "string" && imgs[0].trim() ? imgs[0].trim() : d[0] || "";
    const b = typeof imgs[2] === "string" && imgs[2].trim() ? imgs[2].trim() : d[1] || "";
    return [a, b];
  }
  if (imgs.length === 2) {
    const a = typeof imgs[0] === "string" && imgs[0].trim() ? imgs[0].trim() : d[0] || "";
    const b = typeof imgs[1] === "string" && imgs[1].trim() ? imgs[1].trim() : d[1] || "";
    return [a, b];
  }
  const a = typeof imgs[0] === "string" && imgs[0].trim() ? imgs[0].trim() : d[0] || "";
  return [a, d[1] || ""];
}

/**
 * Per-slot merge: saved URL, else built-in path (two slots).
 */
function mergeHero(base: NonNullable<AdminContentDoc["hero"]>, patch?: AdminContentDoc["hero"]) {
  const defaultTwo = SITE_CONTENT_DEFAULTS.hero?.heroImages || [];
  if (!patch) {
    return {
      ...base,
      heroImages: normalizeHeroImageArray(base.heroImages, defaultTwo),
    };
  }
  const imgs = patch.heroImages;
  const hasAnySaved =
    Array.isArray(imgs) &&
    imgs.length > 0 &&
    imgs.some((u) => typeof u === "string" && u.trim().length > 0);

  const baseSlots = normalizeHeroImageArray(base.heroImages, defaultTwo);

  let heroImages: string[];
  if (!hasAnySaved) {
    heroImages = baseSlots;
  } else {
    heroImages = normalizeHeroImageArray(imgs, baseSlots);
  }

  return {
    eyebrow: strOr(patch.eyebrow, base.eyebrow!),
    headline: strOr(mergeHeroHeadlineString(patch), mergeHeroHeadlineString(base)),
    description: strOr(patch.description, base.description!),
    ctaText: strOr(patch.ctaText, base.ctaText!),
    heroImages,
  };
}

function mergeAbout(base: NonNullable<AdminContentDoc["about"]>, patch?: AdminContentDoc["about"]) {
  if (!patch) return { ...base };
  return {
    founderName: strOr(patch.founderName, base.founderName!),
    founderRole: strOr(patch.founderRole, base.founderRole!),
    p1: strOr(patch.p1, base.p1!),
    p2: strOr(patch.p2, base.p2!),
    p3: strOr(patch.p3, base.p3!),
    quote: strOr(patch.quote, base.quote!),
    image: strOr(patch.image, base.image!),
  };
}

function mergeSettings(
  base: NonNullable<AdminContentDoc["settings"]>,
  patch?: AdminContentDoc["settings"]
) {
  if (!patch) return { ...base };
  return {
    brand: strOr(patch.brand, base.brand!),
    whatsapp: strOr(patch.whatsapp, base.whatsapp!),
    instagramUrl: strOr(patch.instagramUrl, base.instagramUrl!),
    cities: strOr(patch.cities, base.cities!),
    seoTitle: strOr(patch.seoTitle, base.seoTitle!),
    seoDescription: strOr(patch.seoDescription, base.seoDescription!),
  };
}

/**
 * Overlay Firestore doc onto built-in site defaults so admin UI shows the same copy as the live site
 * when fields are missing or empty in the database.
 */
export function mergeAdminWithSiteDefaults(doc: AdminContentDoc | null): AdminContentDoc {
  const base = structuredClone(SITE_CONTENT_DEFAULTS);
  if (!doc) return base;

  const hero = mergeHero(base.hero!, doc.hero);
  const about = mergeAbout(base.about!, doc.about);
  const settings = mergeSettings(base.settings!, doc.settings);

  const categories =
    Array.isArray(doc.categories) && doc.categories.some((c) => c && (c.name || c.slug))
      ? doc.categories!
      : base.categories!;

  const products =
    Array.isArray(doc.products) && doc.products.some((p) => p && p.slug) ? doc.products! : base.products!;

  const testimonials =
    Array.isArray(doc.testimonials) && doc.testimonials.some((t) => t && (t.quote || t.name))
      ? doc.testimonials!
      : base.testimonials!;

  const marqueeWords =
    Array.isArray(doc.marquee?.words) && doc.marquee!.words!.some((w) => String(w).trim())
      ? doc.marquee!.words!
      : base.marquee!.words!;

  const instagram =
    Array.isArray(doc.instagram) && doc.instagram.some((x) => x?.imageUrl)
      ? doc.instagram!
      : base.instagram!;

  return {
    ...base,
    ...doc,
    updatedAt: doc.updatedAt || base.updatedAt,
    hero,
    about,
    settings,
    categories,
    products,
    testimonials,
    marquee: {
      ...base.marquee,
      ...doc.marquee,
      words: marqueeWords,
      speedSeconds: doc.marquee?.speedSeconds ?? base.marquee!.speedSeconds,
      textColor: doc.marquee?.textColor ?? base.marquee!.textColor,
      isVisible: doc.marquee?.isVisible !== false,
    },
    instagram,
  };
}
