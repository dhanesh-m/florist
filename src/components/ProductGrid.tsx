"use client";

import ProductCard from "./ProductCard";
import type { Product } from "@/data/products";

interface ProductGridProps {
  products: Product[];
  columns?: 2 | 3;
}

export default function ProductGrid({ products, columns = 3 }: ProductGridProps) {
  return (
    <div
      className={`
        grid gap-8 md:gap-10
        ${columns === 2 ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"}
      `}
    >
      {products.map((product, index) => (
        <ProductCard
          key={product.slug}
          product={product}
          priority={index < 4}
          index={index}
        />
      ))}
    </div>
  );
}
