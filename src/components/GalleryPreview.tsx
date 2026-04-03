"use client";

import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import ContentImage from "@/components/ContentImage";
import { getAdminContentClient } from "@/lib/admin-content-client";
import { SITE_CONTENT_DEFAULTS } from "@/lib/site-content-defaults";

const GALLERY_SLOTS = 8;

const FALLBACK_INSTAGRAM_URL =
  SITE_CONTENT_DEFAULTS.settings?.instagramUrl ?? "https://instagram.com/floral_doctor";

export default function GalleryPreview() {
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [instagramUrl, setInstagramUrl] = useState<string>(FALLBACK_INSTAGRAM_URL);

  useEffect(() => {
    let mounted = true;
    getAdminContentClient(false).then((doc) => {
      if (!mounted || !doc) return;

      if (doc.settings?.instagramUrl) {
        setInstagramUrl(doc.settings.instagramUrl);
      }

      const visibleItems = (doc.instagram || [])
        .filter((item) => item?.isVisible !== false && item?.imageUrl)
        .map((item) => item.imageUrl as string);

      if (visibleItems.length) {
        setGalleryImages(visibleItems);
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  const feed = useMemo(() => {
    const srcs = [...galleryImages];
    while (srcs.length < GALLERY_SLOTS) srcs.push("");
    return srcs.slice(0, GALLERY_SLOTS);
  }, [galleryImages]);

  return (
    <section className="py-28 md:py-40 bg-[#faf9f7] overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 mb-16">
        <motion.div
          initial={{ opacity: 1, y: 0 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
          className="text-center"
        >
          <p className="text-gold-600 text-sm uppercase tracking-[0.25em] mb-3">
            Instagram
          </p>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-[#2a2521]">
            Follow Our Journey
          </h2>
          <p className="text-beige-600 mt-4 max-w-xl mx-auto">
            Latest creations and behind-the-scenes
          </p>
        </motion.div>
      </div>

      {/* Gallery grid with stagger reveal */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 px-4 md:px-6 max-w-6xl mx-auto">
        {feed.map((src, index) => (
          <motion.a
            key={index}
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 1, scale: 1 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{
              duration: 0.5,
              delay: index * 0.05,
            }}
            whileHover={{ scale: 1.03, y: -6 }}
            className="group relative aspect-square overflow-hidden rounded-2xl shadow-elegant"
          >
            <ContentImage
              src={src}
              alt={`Gallery ${index + 1}`}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
            />
            <div className="absolute inset-0 bg-[#1a1512]/0 group-hover:bg-[#1a1512]/20 transition-colors duration-500" />
          </motion.a>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 1 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="mt-16 text-center"
      >
        <a
          href={instagramUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-[#2a2521] hover:text-gold-600 font-medium transition-colors group"
        >
          <span>Floral Doctor</span>
          <svg
            className="w-5 h-5 group-hover:translate-x-1 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </motion.div>
    </section>
  );
}
