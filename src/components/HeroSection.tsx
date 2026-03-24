"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

const HERO_IMAGES = [
  "/images/bouquet-1.jpeg",
  "/images/bouquet-2.jpeg",
  "/images/bouquet-3.jpeg",
];

export default function HeroSection() {
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
          initial={{ opacity: 0, scale: 0.95 }}
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
            <Image
              src={HERO_IMAGES[0]}
              alt="Doctor florist floral arrangement"
              fill
              priority
              className="object-cover"
              sizes="(max-width: 768px) 90vw, 50vw"
            />
          </motion.div>
          {/* Floating accent images */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="absolute -bottom-6 -left-6 md:-left-12 w-32 h-32 md:w-40 md:h-40 rounded-2xl overflow-hidden shadow-premium border-2 border-white/10 hidden sm:block"
          >
            <Image
              src={HERO_IMAGES[1]}
              alt=""
              fill
              className="object-cover"
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="absolute -top-4 -right-4 md:top-1/4 md:-right-8 w-24 h-24 md:w-28 md:h-28 rounded-xl overflow-hidden shadow-premium border-2 border-white/10"
          >
            <Image
              src={HERO_IMAGES[2]}
              alt=""
              fill
              className="object-cover"
            />
          </motion.div>
        </motion.div>
      </div>

      {/* Content - left aligned, bold typography */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 w-full py-24 md:py-32">
        <div className="max-w-2xl">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-white text-sm uppercase tracking-[0.3em] mb-4 font-sans font-medium"
          >
            Doctor Florist. Canada
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="font-display text-5xl md:text-6xl lg:text-7xl xl:text-8xl text-white leading-[1.05] tracking-tight"
          >
            <span className="block">Art in</span>
            <span className="block text-gold-200 italic">Bloom</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-8 text-lg md:text-xl text-white leading-relaxed max-w-md [text-shadow:0_2px_12px_rgba(0,0,0,0.5)]"
          >
            Handcrafted bouquets that tell a story. Each arrangement is a unique
            masterpiece, designed for those who appreciate the extraordinary.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-12 flex flex-wrap gap-4"
          >
            <Link
              href="/collection?category=wedding"
              className="inline-flex items-center text-white hover:text-gold-300 text-sm uppercase tracking-widest transition-colors duration-300 font-medium [text-shadow:0_1px_8px_rgba(0,0,0,0.4)]"
            >
              Wedding Florals →
            </Link>
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
