export interface Product {
  slug: string;
  name: string;
  price: number;
  image: string;
  category: "Bouquet" | "Wedding" | "Custom";
  tag?: "New" | "Bestseller" | "Trending";
  description: string;
}

// Local images from public/images folder
export const products: Product[] = [
  {
    slug: "rose-elegance",
    name: "Rose Elegance Bouquet",
    price: 65,
    image: "/images/bouquet-1.jpeg",
    category: "Bouquet",
    tag: "Bestseller",
    description: "Fresh red roses with delicate eucalyptus wrapping. Handcrafted with care for that perfect romantic gesture.",
  },
  {
    slug: "peony-dreams",
    name: "Peony Dreams",
    price: 85,
    image: "/images/bouquet-2.jpeg",
    category: "Bouquet",
    tag: "New",
    description: "Luxurious blush peonies paired with soft greenery. A dreamy arrangement perfect for any occasion.",
  },
  {
    slug: "wildflower-harmony",
    name: "Wildflower Harmony",
    price: 55,
    image: "/images/bouquet-3.jpeg",
    category: "Bouquet",
    tag: "Trending",
    description: "A vibrant mix of seasonal wildflowers for a fresh, natural look. Locally sourced when possible.",
  },
  {
    slug: "tulip-serenity",
    name: "Tulip Serenity",
    price: 60,
    image: "/images/bouquet-4.jpeg",
    category: "Bouquet",
    description: "Elegant tulips in soft pastels. A minimalist bouquet that speaks volumes with simplicity.",
  },
  {
    slug: "hydrangea-romance",
    name: "Hydrangea Romance",
    price: 95,
    image: "/images/bouquet-5.jpeg",
    category: "Wedding",
    tag: "Bestseller",
    description: "Full, lush hydrangeas in romantic blues and whites. Ideal for bridal bouquets and centerpieces.",
  },
  {
    slug: "lavender-whisper",
    name: "Lavender Whisper",
    price: 70,
    image: "/images/bouquet-6.jpeg",
    category: "Custom",
    tag: "New",
    description: "Aromatic lavender paired with dried elements. Perfect for those who love subtle, calming scents.",
  },
  {
    slug: "garden-rose-collection",
    name: "Garden Rose Collection",
    price: 120,
    image: "/images/bouquet-7.jpeg",
    category: "Wedding",
    tag: "Trending",
    description: "Premium garden roses in a stunning palette. Hand-selected for weddings and special events.",
  },
  {
    slug: "sunflower-joy",
    name: "Sunflower Joy",
    price: 50,
    image: "/images/bouquet-8.jpeg",
    category: "Bouquet",
    description: "Bright, cheerful sunflowers that bring instant warmth and happiness to any space.",
  },
  {
    slug: "blush-delight",
    name: "Blush Delight",
    price: 78,
    image: "/images/bouquet-1.jpeg",
    category: "Bouquet",
    tag: "New",
    description: "Soft blush tones with ranunculus and spray roses. A delicate, feminine arrangement.",
  },
  {
    slug: "rustic-charm",
    name: "Rustic Charm",
    price: 72,
    image: "/images/bouquet-2.jpeg",
    category: "Custom",
    description: "Dried flowers and wheat with fresh accents. Perfect for autumn and earth-toned aesthetics.",
  },
  {
    slug: "bridal-white",
    name: "Bridal White",
    price: 145,
    image: "/images/bouquet-3.jpeg",
    category: "Wedding",
    tag: "Bestseller",
    description: "Pure white roses and lily of the valley. Timeless elegance for your special day.",
  },
  {
    slug: "custom-bespoke",
    name: "Bespoke Arrangement",
    price: 150,
    image: "/images/bouquet-4.jpeg",
    category: "Custom",
    tag: "New",
    description: "A fully customized arrangement created just for you. Discuss your vision with us via WhatsApp.",
  },
];

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getProductsByCategory(category: Product["category"]): Product[] {
  return products.filter((p) => p.category === category);
}
