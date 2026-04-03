"use client";

import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { getAdminContentClient } from "@/lib/admin-content-client";
import { SITE_CONTENT_DEFAULTS } from "@/lib/site-content-defaults";

const fallbackWords = SITE_CONTENT_DEFAULTS.marquee?.words ?? [
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

/** Fixed site styling (not editable in admin). */
const MARQUEE_LOOP_SECONDS = 25;
const MARQUEE_TEXT_COLOR = "#b76b69";

export default function Marquee() {
  const [words, setWords] = useState<string[]>(fallbackWords);
  const [isVisible, setIsVisible] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;
    getAdminContentClient(false).then((doc) => {
      if (!mounted || !doc?.marquee) return;
      if (Array.isArray(doc.marquee.words) && doc.marquee.words.length) {
        setWords(doc.marquee.words);
      }
      if (typeof doc.marquee.isVisible === "boolean") setIsVisible(doc.marquee.isVisible);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const displayWords = useMemo(() => [...words, ...words], [words]);

  if (!isVisible || words.length === 0) return null;

  return (
    <div className="py-8 md:py-12 bg-[#faf9f7] border-y border-beige-200/50 overflow-hidden">
      <motion.div
        animate={{ x: "-50%" }}
        transition={{
          repeat: Infinity,
          repeatType: "loop",
          duration: MARQUEE_LOOP_SECONDS,
          ease: "linear",
        }}
        className="flex gap-12 md:gap-16 w-max"
      >
        {displayWords.map((word, i) => (
          <span
            key={`${word}-${i}`}
            className="font-display text-2xl md:text-4xl"
            style={{ color: MARQUEE_TEXT_COLOR }}
          >
            {word}
          </span>
        ))}
      </motion.div>
    </div>
  );
}
