"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { Product } from "@/data/products";
import WhatsAppButton from "@/components/WhatsAppButton";
import ContentImage from "@/components/ContentImage";

interface ProductCardProps {
  product: Product;
  priority?: boolean;
  index?: number;
}

export default function ProductCard({ product, priority = false, index = 0 }: ProductCardProps) {
  return (
    <motion.div
      className="h-full"
      initial={{ opacity: 1, y: 0 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{
        duration: 0.6,
        delay: index * 0.08,
        ease: [0.21, 0.47, 0.32, 0.98],
      }}
    >
      <article className="flex h-full flex-col bg-white rounded-3xl overflow-hidden shadow-soft hover:shadow-premium transition-all duration-500 hover:-translate-y-2 border border-white/50">
        <Link href={`/collection/${product.slug}`} className="group flex min-h-0 flex-1 flex-col focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/40 focus-visible:ring-offset-2 rounded-t-3xl">
          <div className="relative aspect-[4/5] w-full shrink-0 overflow-hidden">
            <motion.div
              whileHover={{ scale: 1.08 }}
              transition={{ duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] }}
              className="absolute inset-0"
            >
              <ContentImage
                src={product.image}
                alt={product.name}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                priority={priority}
              />
            </motion.div>
            {product.tag && (
              <motion.span
                initial={{ opacity: 1, scale: 1 }}
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
          <div className="shrink-0 p-6 md:p-7 pt-5 md:pt-6">
            <h3 className="font-serif text-xl md:text-2xl text-[#2a2521] group-hover:text-blush-800 transition-colors line-clamp-2 min-h-[3.25rem] md:min-h-[4rem] leading-snug">
              {product.name}
            </h3>
          </div>
        </Link>
        <div className="mt-auto flex flex-col gap-3 border-t border-beige-100/80 px-6 py-5 md:px-7 md:py-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-gold-700 font-medium text-lg">Starting from ${product.price}</p>
          <WhatsAppButton
            productName={product.name}
            price={product.price}
            label="Order now"
            className="px-5 py-2.5 text-sm rounded-xl shadow-md shrink-0"
          />
        </div>
      </article>
    </motion.div>
  );
}
