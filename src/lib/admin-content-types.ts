/** Shared Firestore `adminContent/main` shape — no "use client" so server code can import safely. */

export type CollectionTag = "new" | "trending" | "exclusive" | "bestseller";
export type CollectionCategory = "Bouquet" | "Wedding" | "Custom";

export interface HeroDoc {
  eyebrow?: string;
  /** Main hero title. Use a line break for the second line (italic gold on the site). */
  headline?: string;
  /** @deprecated Prefer `headline` (joined with newline). Still read for older Firestore docs. */
  headline1?: string;
  /** @deprecated Prefer `headline`. */
  headline2?: string;
  description?: string;
  ctaText?: string;
  heroImages?: string[];
}

export interface CategoryDoc {
  id?: string;
  name?: string;
  slug?: string;
  description?: string;
  imageUrl?: string;
  sortOrder?: number;
  isVisible?: boolean;
}

export interface ProductDoc {
  id?: string;
  slug?: string;
  name?: string;
  description?: string;
  category?: string;
  price?: number;
  tags?: CollectionTag[];
  imageUrl?: string;
  isVisible?: boolean;
}

export interface TestimonialDoc {
  id?: string;
  quote?: string;
  name?: string;
  location?: string;
  /** @deprecated Not used in admin or on the site; cleared on save. */
  imageUrl?: string;
  isVisible?: boolean;
}

export interface AboutDoc {
  founderName?: string;
  founderRole?: string;
  p1?: string;
  p2?: string;
  p3?: string;
  quote?: string;
  image?: string;
}

export interface AdminContentDoc {
  hero?: HeroDoc;
  categories?: CategoryDoc[];
  products?: ProductDoc[];
  testimonials?: TestimonialDoc[];
  about?: AboutDoc;
  updatedAt?: string;
  marquee?: {
    words?: string[];
    speedSeconds?: number;
    textColor?: string;
    isVisible?: boolean;
  };
  instagram?: Array<{
    id?: string;
    imageUrl?: string;
    postUrl?: string;
    caption?: string;
    isVisible?: boolean;
  }>;
  settings?: {
    brand?: string;
    whatsapp?: string;
    instagramUrl?: string;
    cities?: string;
    seoTitle?: string;
    seoDescription?: string;
  };
}
