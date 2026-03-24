"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import type { Product } from "@/data/products";

interface ProductCardProps {
  product: Product;
  priority?: boolean;
  index?: number;
}

export default function ProductCard({ product, priority = false, index = 0 }: ProductCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{
        duration: 0.6,
        delay: index * 0.08,
        ease: [0.21, 0.47, 0.32, 0.98],
      }}
    >
      <Link href={`/collection/${product.slug}`} className="group block">
        <article className="bg-white rounded-3xl overflow-hidden shadow-soft hover:shadow-premium transition-all duration-500 group-hover:-translate-y-2 border border-white/50">
          <div className="relative aspect-[4/5] overflow-hidden">
            <motion.div
              whileHover={{ scale: 1.08 }}
              transition={{ duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] }}
              className="w-full h-full"
            >
              <Image
                src={product.image}
                alt={product.name}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover"
                priority={priority}
                loading={priority ? undefined : "lazy"}
              />
            </motion.div>
            {product.tag && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className={`
                  absolute top-5 left-5 px-3.5 py-1.5 rounded-full text-xs font-medium tracking-wide uppercase
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
              </motion.span>
            )}
          </div>
          <div className="p-6 md:p-7">
            <h3 className="font-serif text-xl md:text-2xl text-[#2a2521] group-hover:text-blush-800 transition-colors line-clamp-2">
              {product.name}
            </h3>
            <p className="mt-2 text-gold-700 font-medium text-lg">
              Starting from ${product.price}
            </p>
          </div>
        </article>
      </Link>
    </motion.div>
  );
}
