"use client";

import Link from "next/link";
import { motion } from "framer-motion";

import { useEffect, useState } from "react";
import ContentImage from "@/components/ContentImage";
import { getAdminContentClient } from "@/lib/admin-content-client";
import { SITE_CONTENT_DEFAULTS } from "@/lib/site-content-defaults";

type CategoryForUI = {
  name: string;
  slug: string;
  image: string;
  description: string;
};

const fallbackCategories: CategoryForUI[] = (SITE_CONTENT_DEFAULTS.categories ?? []).map((c) => ({
  name: c.name ?? "",
  slug: c.slug ?? "",
  image: c.imageUrl ?? "",
  description: c.description ?? "",
}));

export default function CategorySection() {
  const [categories, setCategories] = useState<CategoryForUI[]>(fallbackCategories);

  useEffect(() => {
    let mounted = true;
    getAdminContentClient(false).then((doc) => {
      if (!mounted || !doc) return;
      if (!Array.isArray(doc.categories)) return;

      const mapped = doc.categories
        .filter((c) => c && c.isVisible !== false)
        .map((c) => ({
          name: c.name || "",
          slug: c.slug || "",
          image: c.imageUrl || "",
          description: c.description || "",
        }))
        .filter((c) => c.name && c.slug);

      if (mapped.length) {
        setCategories(
          mapped.sort((a, b) => {
            const aAdmin = doc.categories?.find((x) => x.slug === a.slug);
            const bAdmin = doc.categories?.find((x) => x.slug === b.slug);
            return (aAdmin?.sortOrder ?? 0) - (bAdmin?.sortOrder ?? 0);
          })
        );
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section className="py-28 md:py-40 bg-[#faf9f7] relative overflow-hidden">
      {/* Subtle accent */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blush-200/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 1, y: 0 }}
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
              initial={{ opacity: 1, y: 0 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{
                duration: 0.7,
                delay: index * 0.12,
                ease: [0.21, 0.47, 0.32, 0.98],
              }}
            >
              <Link href={`/collection?category=${category.slug}`} className="group block">
                <div className="relative isolate aspect-[4/5] rounded-3xl overflow-hidden shadow-elegant group-hover:shadow-premium transition-all duration-500">
                  <motion.div
                    whileHover={{ scale: 1.06 }}
                    transition={{ duration: 0.6 }}
                    className="absolute inset-0 z-0"
                  >
                    <ContentImage
                      src={category.image}
                      alt={category.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </motion.div>
                  <div
                    className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-t from-[#1a1512]/92 via-[#1a1512]/45 to-[#1a1512]/10"
                    aria-hidden
                  />
                  <div className="absolute inset-x-0 bottom-0 z-10 p-8 md:p-10">
                    <h3 className="font-display text-2xl md:text-3xl text-white [text-shadow:0_2px_12px_rgba(0,0,0,0.45)]">
                      {category.name}
                    </h3>
                    <p className="mt-2 text-sm text-white/90 md:text-base [text-shadow:0_1px_8px_rgba(0,0,0,0.5)]">
                      {category.description}
                    </p>
                    <span className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-gold-300 transition-all group-hover:gap-3 [text-shadow:0_1px_6px_rgba(0,0,0,0.4)]">
                      View collection
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
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
