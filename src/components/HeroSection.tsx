"use client";

import Link from "next/link";
import { motion } from "framer-motion";

import { useEffect, useMemo, useState } from "react";
import ContentImage from "@/components/ContentImage";
import { getAdminContentClient } from "@/lib/admin-content-client";
import {
  mergeHeroHeadlineString,
  normalizeHeroImageArray,
  SITE_CONTENT_DEFAULTS,
} from "@/lib/site-content-defaults";

const emptySlots = ["", ""] as const;
const fallbackHeroImages = normalizeHeroImageArray(SITE_CONTENT_DEFAULTS.hero?.heroImages, [...emptySlots]);

function splitHeroHeadline(s: string): [string, string] {
  const i = s.indexOf("\n");
  if (i === -1) return [s.trim(), ""];
  return [s.slice(0, i).trim(), s.slice(i + 1).trim()];
}

export default function HeroSection() {
  const h0 = SITE_CONTENT_DEFAULTS.hero;
  const [eyebrow, setEyebrow] = useState(h0?.eyebrow ?? "Floral Doctor. Canada");
  const [headline, setHeadline] = useState(() => mergeHeroHeadlineString(h0) || "Art in\nBloom");
  const [description, setDescription] = useState(
    h0?.description ??
      "Handcrafted bouquets that tell a story. Each arrangement is a unique masterpiece, designed for those who appreciate the extraordinary."
  );
  const [ctaText, setCtaText] = useState(h0?.ctaText ?? "Wedding Florals");
  const [heroImages, setHeroImages] = useState<string[]>(fallbackHeroImages);

  useEffect(() => {
    let mounted = true;
    getAdminContentClient(false).then((doc) => {
      if (!mounted || !doc) return;
      if (!doc.hero) return;

      if (doc.hero.eyebrow) setEyebrow(doc.hero.eyebrow);
      const hl = mergeHeroHeadlineString(doc.hero);
      if (hl) setHeadline(hl);
      if (doc.hero.description) setDescription(doc.hero.description);
      if (doc.hero.ctaText) setCtaText(doc.hero.ctaText);

      if (Array.isArray(doc.hero.heroImages) && doc.hero.heroImages.length) {
        setHeroImages(normalizeHeroImageArray(doc.hero.heroImages, fallbackHeroImages));
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  const img0 = useMemo(() => heroImages[0] || fallbackHeroImages[0], [heroImages]);
  const img1 = useMemo(() => heroImages[1] || fallbackHeroImages[1], [heroImages]);

  const [headlineLine1, headlineLine2] = useMemo(() => splitHeroHeadline(headline), [headline]);

  return (
    <section
      className="relative min-h-[100vh] flex items-center overflow-hidden bg-[#1a1512] -mt-[72px] pt-[72px]"
      aria-label="Hero section extension"
    >
      {/* Subtle grain texture overlay */}
      <div
        className="absolute inset-0 z-[1] opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Gradient orbs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full bg-blush-900/20 blur-[120px]" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 rounded-full bg-gold-700/10 blur-[120px]" />

      {/* Gradient overlay - ensures text readability over both dark and image areas */}
      <div
        className="absolute inset-0 z-[2] pointer-events-none"
        aria-hidden
        style={{
          background: "linear-gradient(to right, #1a1512 0%, #1a1512 45%, transparent 70%)",
        }}
      />

      {/* Bento-style image grid - asymmetric, artistic */}
      <div className="absolute inset-0 z-0 flex items-center justify-end pr-0 md:pr-[5%] lg:pr-[10%]">
        <motion.div
          initial={false}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="relative w-full max-w-2xl aspect-[4/5] md:aspect-square"
        >
          {/* Main large image */}
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 rounded-[2rem] overflow-hidden shadow-premium"
          >
            <div className="relative h-full w-full">
              <ContentImage
                src={img0}
                alt="Doctor florist floral arrangement"
                fill
                priority
                sizes="(max-width: 768px) 90vw, 50vw"
              />
            </div>
          </motion.div>
          {/* Floating accent — top / right */}
          <motion.div
            initial={false}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="absolute -top-4 -right-4 md:top-1/4 md:-right-8 w-24 h-24 md:w-28 md:h-28 rounded-xl overflow-hidden shadow-premium border-2 border-white/10"
          >
            <div className="relative h-full w-full">
              <ContentImage src={img1} alt="" fill sizes="128px" />
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Content - left aligned, bold typography */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 w-full py-24 md:py-32">
        <div className="max-w-2xl">
          <motion.p
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-white text-sm uppercase tracking-[0.3em] mb-4 font-sans font-medium"
          >
            {eyebrow}
          </motion.p>
          <motion.h1
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="font-display text-5xl md:text-6xl lg:text-7xl xl:text-8xl text-white leading-[1.05] tracking-tight"
          >
            {headlineLine2 ? (
              <>
                <span className="block">{headlineLine1}</span>
                <span className="block text-gold-200 italic">{headlineLine2}</span>
              </>
            ) : (
              <span className="block">{headlineLine1}</span>
            )}
          </motion.h1>
          <motion.p
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-8 text-lg md:text-xl text-white leading-relaxed max-w-md [text-shadow:0_2px_12px_rgba(0,0,0,0.5)]"
          >
            {description}
          </motion.p>
          <motion.div
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-12 flex flex-wrap gap-4"
          >
            {ctaText ? (
              <Link
                href="/collection"
                className="inline-flex items-center text-white hover:text-gold-300 text-sm uppercase tracking-widest transition-colors duration-300 font-medium [text-shadow:0_1px_8px_rgba(0,0,0,0.4)]"
              >
                {ctaText} →
              </Link>
            ) : null}
          </motion.div>
        </div>
      </div>

      {/* Organic curve divider */}
      <div className="absolute bottom-0 left-0 right-0 z-10 h-24 md:h-32 overflow-hidden">
        <svg
          viewBox="0 0 1440 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
          preserveAspectRatio="none"
        >
          <path
            d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
            fill="#faf9f7"
          />
        </svg>
      </div>
    </section>
  );
}
