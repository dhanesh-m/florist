import ProductGrid from "@/components/ProductGrid";
import type { Metadata } from "next";
import { getAdminContentServer } from "@/lib/admin-content-server";
import { normalizeAdminProducts } from "@/lib/normalize-admin-products";
import { products } from "@/data/products";

export const metadata: Metadata = {
  title: "Collection",
  description:
    "Browse our curated collection of fresh, handmade flower bouquets. From romantic roses to elegant peonies, find the perfect arrangement for your occasion.",
};

const categoryMap: Record<string, "Bouquet" | "Wedding" | "Custom"> = {
  bouquets: "Bouquet",
  wedding: "Wedding",
  custom: "Custom",
};

function inferCategoryType(
  categorySlug: string | undefined,
  categories?: { slug?: string; name?: string }[]
): { type: "Bouquet" | "Wedding" | "Custom"; label: string } | null {
  if (!categorySlug) return null;
  if (categoryMap[categorySlug]) {
    return { type: categoryMap[categorySlug], label: categoryMap[categorySlug] };
  }

  const slugLower = categorySlug.toLowerCase();
  const adminCat = categories?.find((c) => (c.slug || "").toLowerCase() === slugLower);
  const nameLower = (adminCat?.name || "").toLowerCase();

  if (nameLower.includes("wedding") || slugLower.includes("wedding")) {
    return { type: "Wedding", label: "Wedding" };
  }
  if (nameLower.includes("custom") || slugLower.includes("custom")) {
    return { type: "Custom", label: "Custom" };
  }
  if (nameLower.includes("bouquet") || slugLower.includes("bouquet") || nameLower.includes("bouquets")) {
    return { type: "Bouquet", label: "Bouquet" };
  }

  return null;
}

export default async function CollectionPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const doc = await getAdminContentServer();
  const adminProducts = normalizeAdminProducts(doc);
  const baseProducts = adminProducts.length ? adminProducts : products;

  const resolvedCategory = inferCategoryType(category, doc?.categories);
  const filteredProducts = resolvedCategory
    ? baseProducts.filter((p) => p.category === resolvedCategory.type)
    : baseProducts;

  return (
    <section className="min-h-screen">
      {/* Hero header */}
      <div className="relative py-24 md:py-32 bg-[#1a1512] text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a1512] via-[#1a1512] to-[#2a2521]" />
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-blush-900/20 rounded-full blur-[120px]" />
        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
          <p className="text-gold-400 text-sm uppercase tracking-[0.3em] mb-4">
            {resolvedCategory ? resolvedCategory.label : "All Arrangements"}
          </p>
          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl">
            Our Collection
          </h1>
          <p className="mt-6 text-lg text-white/70 max-w-2xl mx-auto">
            Each arrangement is handcrafted with fresh flowers. Enquire via
            WhatsApp to place your order.
          </p>
        </div>
        {/* Curve to content */}
        <div className="absolute bottom-0 left-0 right-0 h-16 overflow-hidden">
          <svg
            viewBox="0 0 1440 64"
            fill="none"
            className="w-full h-full"
            preserveAspectRatio="none"
          >
            <path
              d="M0 64L48 56C96 48 192 32 288 28C384 24 480 32 576 40C672 48 768 56 864 58C960 60 1056 56 1152 52C1248 48 1344 44 1392 42L1440 40V64H1392C1344 64 1248 64 1152 64C1056 64 960 64 864 64C768 64 672 64 576 64C480 64 384 64 288 64C192 64 96 64 48 64H0Z"
              fill="#faf9f7"
            />
          </svg>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-2 pb-24 relative z-20">
        <ProductGrid products={filteredProducts} />
      </div>
    </section>
  );
}
