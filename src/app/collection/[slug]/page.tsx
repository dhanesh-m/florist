import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductBySlug, products } from "@/data/products";
import WhatsAppButton from "@/components/WhatsAppButton";

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return { title: "Product Not Found" };
  return {
    title: product.name,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      images: [product.image],
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = getProductBySlug(slug);

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
          {/* Image */}
          <div className="relative aspect-square rounded-3xl overflow-hidden shadow-premium">
            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
              priority
            />
            {product.tag && (
              <span
                className={`
                  absolute top-8 left-8 px-4 py-2 rounded-full text-sm font-medium tracking-wide uppercase
                  ${
                    product.tag === "New"
                      ? "bg-gold-500 text-[#1a1512]"
                      : product.tag === "Bestseller"
                        ? "bg-[#1a1512] text-gold-300"
                        : "bg-blush-500 text-white"
                  }
                `}
              >
                {product.tag}
              </span>
            )}
          </div>

          {/* Details */}
          <div>
            <h1 className="font-display text-4xl md:text-5xl text-[#2a2521] mb-4">
              {product.name}
            </h1>
            <p className="text-gold-600 font-semibold text-2xl mb-8">
              ${product.price}
            </p>
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

            <WhatsAppButton
              productName={product.name}
              price={product.price}
              className="w-full sm:w-auto text-base px-8 py-4"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
