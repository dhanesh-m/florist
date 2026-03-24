"use client";

import { motion } from "framer-motion";

const words = [
  "Fresh Blooms",
  "Handmade",
  "Peonies",
  "Roses",
  "Artistry",
  "Elegance",
  "Bouquets",
  "Weddings",
  "Custom",
];

export default function Marquee() {
  return (
    <div className="py-8 md:py-12 bg-[#faf9f7] border-y border-beige-200/50 overflow-hidden">
      <motion.div
        animate={{ x: "-50%" }}
        transition={{
          repeat: Infinity,
          repeatType: "loop",
          duration: 25,
          ease: "linear",
        }}
        className="flex gap-12 md:gap-16 w-max"
      >
          {[...words, ...words].map((word, i) => (
            <span
              key={`${word}-${i}`}
              className="font-display text-2xl md:text-4xl text-blush-600"
            >
              {word}
            </span>
          ))}
      </motion.div>
    </div>
  );
}
