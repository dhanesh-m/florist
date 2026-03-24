"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

const categories = [
  {
    name: "Bouquets",
    slug: "bouquets",
    image: "/images/bouquet-1.jpeg",
    description: "Handcrafted arrangements for every occasion",
  },
  {
    name: "Wedding",
    slug: "wedding",
    image: "/images/bouquet-5.jpeg",
    description: "Bridal bouquets & wedding florals",
  },
  {
    name: "Custom",
    slug: "custom",
    image: "/images/bouquet-6.jpeg",
    description: "Bespoke arrangements tailored to you",
  },
];

export default function CategorySection() {
  return (
    <section className="py-28 md:py-40 bg-[#faf9f7] relative overflow-hidden">
      {/* Subtle accent */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blush-200/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-20"
        >
          <p className="text-gold-600 text-sm uppercase tracking-[0.25em] mb-3">
            Explore
          </p>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-[#2a2521]">
            By Category
          </h2>
          <p className="text-beige-600 mt-4 max-w-xl mx-auto">
            Find the perfect arrangement for your occasion
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
          {categories.map((category, index) => (
            <motion.div
              key={category.slug}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{
                duration: 0.7,
                delay: index * 0.12,
                ease: [0.21, 0.47, 0.32, 0.98],
              }}
            >
              <Link href={`/collection?category=${category.slug}`} className="group block">
                <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-elegant group-hover:shadow-premium transition-all duration-500">
                  <motion.div
                    whileHover={{ scale: 1.06 }}
                    transition={{ duration: 0.6 }}
                    className="absolute inset-0"
                  >
                    <Image
                      src={category.image}
                      alt={category.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover"
                    />
                  </motion.div>
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1a1512]/90 via-[#1a1512]/30 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-8 md:p-10">
                    <h3 className="font-display text-2xl md:text-3xl text-white">
                      {category.name}
                    </h3>
                    <p className="mt-2 text-white/80 text-sm md:text-base">
                      {category.description}
                    </p>
                    <span className="inline-flex items-center gap-2 mt-4 text-gold-300 text-sm font-medium group-hover:gap-3 transition-all">
                      View collection
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
