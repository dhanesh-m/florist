"use client";

import ContentImage from "@/components/ContentImage";
import type { Product } from "@/data/products";

export default function ProductDetailImage({ product }: { product: Product }) {
  return (
    <div className="relative aspect-square rounded-3xl overflow-hidden shadow-premium">
      <ContentImage
        src={product.image}
        alt={product.name}
        fill
        sizes="(max-width: 1024px) 100vw, 50vw"
        priority
      />
      {product.tag && (
        <span
          className={`
                  absolute top-8 left-8 z-10 px-4 py-2 rounded-full text-sm font-medium tracking-wide uppercase
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
  );
}
