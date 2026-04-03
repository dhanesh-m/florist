import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductBySlug } from "@/data/products";
import WhatsAppButton from "@/components/WhatsAppButton";
import ProductDetailImage from "@/components/ProductDetailImage";
import { getAdminContentServer } from "@/lib/admin-content-server";
import { normalizeAdminProducts } from "@/lib/normalize-admin-products";

export const dynamic = "force-dynamic";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps) {
  const { slug } = await params;
  const doc = await getAdminContentServer();
  const adminProducts = normalizeAdminProducts(doc);
  const product = adminProducts.find((p) => p.slug === slug) || getProductBySlug(slug);
  if (!product) return { title: "Product Not Found" };
  /** Avoid empty OG image when seed data has no image URL yet. */
  const ogImages = product.image?.trim() ? [product.image] : undefined;
  return {
    title: product.name,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      ...(ogImages ? { images: ogImages } : {}),
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const doc = await getAdminContentServer();
  const adminProducts = normalizeAdminProducts(doc);
  const product = adminProducts.find((p) => p.slug === slug) || getProductBySlug(slug);

  if (!product) notFound();

  return (
    <section className="py-16 md:py-28 min-h-screen">
      <div className="max-w-7xl mx-auto px-6">
        <Link
          href="/collection"
          className="group inline-flex items-center gap-2 text-beige-600 hover:text-blush-600 mb-12 text-sm font-medium tracking-wide transition-colors"
        >
          <svg
            className="w-4 h-4 group-hover:-translate-x-1 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Collection
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start">
          <ProductDetailImage product={product} />

          {/* Details */}
          <div>
            <h1 className="font-display text-4xl md:text-5xl text-[#2a2521] mb-4">
              {product.name}
            </h1>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
              <p className="text-gold-600 font-semibold text-2xl">
                Starting from ${product.price}
              </p>
              <WhatsAppButton
                productName={product.name}
                price={product.price}
                label="Order now"
                className="w-full sm:w-auto text-base px-8 py-3.5 shrink-0"
              />
            </div>
            <p className="text-beige-700 text-lg leading-relaxed mb-10">
              {product.description}
            </p>

            <div className="bg-beige-50 rounded-2xl p-8 mb-10 border border-beige-200/50">
              <p className="text-beige-700 leading-relaxed">
                <strong className="text-[#2a2521]">Delivery:</strong> We deliver
                across Canada. Contact us via WhatsApp to arrange delivery and
                discuss availability.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
