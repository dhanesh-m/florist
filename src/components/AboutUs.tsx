"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import ContentImage from "@/components/ContentImage";
import { getAdminContentClient } from "@/lib/admin-content-client";
import { SITE_CONTENT_DEFAULTS } from "@/lib/site-content-defaults";

const containerVariants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 1, y: 0 },
  visible: { opacity: 1, y: 0 },
};

export default function AboutUs() {
  const a0 = SITE_CONTENT_DEFAULTS.about;
  const [founderName, setFounderName] = useState(a0?.founderName ?? "Jency Mathew");
  const [founderRole, setFounderRole] = useState(a0?.founderRole ?? "Founder, Floral Doctor");
  const [p1, setP1] = useState(
    a0?.p1 ??
      "Floral Doctor was born from passion. Founded and owned by Jency Mathew, a Hair Transplant Surgeon by profession, this brand was created from a deep love for flowers and meaningful gifting."
  );
  const [p2, setP2] = useState(
    a0?.p2 ??
      "What began as a heartfelt creative outlet became Floral Doctor. Today, each bouquet is handcrafted with the same precision, empathy, and attention to detail Jency brings to her medical practice."
  );
  const [p3, setP3] = useState(
    a0?.p3 ??
      "From quiet thank-you gestures to grand celebrations, each arrangement is designed to feel warm, elegant, and deeply personal for the person receiving it."
  );
  const [quote, setQuote] = useState(
    a0?.quote ?? "Made with a surgeon's precision, delivered with a florist's heart."
  );
  const [aboutImage, setAboutImage] = useState(a0?.image ?? "");

  useEffect(() => {
    let mounted = true;
    getAdminContentClient(false).then((doc) => {
      if (!mounted || !doc) return;
      if (!doc.about) return;

      if (doc.about.founderName) setFounderName(doc.about.founderName);
      if (doc.about.founderRole) setFounderRole(doc.about.founderRole);
      if (doc.about.p1) setP1(doc.about.p1);
      if (doc.about.p2) setP2(doc.about.p2);
      if (doc.about.p3) setP3(doc.about.p3);
      if (doc.about.quote) setQuote(doc.about.quote);
      if (doc.about.image) setAboutImage(doc.about.image);
    });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section className="py-24 md:py-36 bg-[#faf9f7] relative overflow-hidden">
      <motion.div
        className="absolute -top-20 -right-20 w-[22rem] h-[22rem] bg-gold-100/40 rounded-full blur-[90px]"
        animate={{ y: [0, -10, 0], scale: [1, 1.04, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-20 -left-16 w-[20rem] h-[20rem] bg-blush-100/40 rounded-full blur-[90px]"
        animate={{ y: [0, 10, 0], scale: [1, 1.03, 1] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-24 items-center">
          <motion.div
            initial={{ opacity: 1, y: 0 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.7 }}
            className="order-2 lg:order-1"
          >
            <motion.div
              variants={containerVariants}
              initial="visible"
              whileInView="visible"
              viewport={{ once: true, amount: 0.25 }}
              className="space-y-0"
            >
              <motion.p
                variants={itemVariants}
                transition={{ duration: 0.55, ease: [0.21, 0.47, 0.32, 0.98] }}
                className="text-gold-600 text-sm uppercase tracking-[0.25em] mb-4"
              >
                Our Story
              </motion.p>
              <motion.h1
                variants={itemVariants}
                transition={{ duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] }}
                className="font-display text-4xl md:text-5xl lg:text-6xl text-[#2a2521] leading-tight"
              >
                About Us
              </motion.h1>
            </motion.div>
            <motion.div
              variants={containerVariants}
              initial="visible"
              whileInView="visible"
              viewport={{ once: true, amount: 0.25 }}
              className="mt-8 space-y-6 text-beige-700 text-base md:text-lg leading-relaxed"
            >
              <motion.p variants={itemVariants} transition={{ duration: 0.55 }}>
                {p1}
              </motion.p>
              <motion.p variants={itemVariants} transition={{ duration: 0.55 }}>
                {p2}
              </motion.p>
              <motion.p variants={itemVariants} transition={{ duration: 0.55 }}>
                {p3}
              </motion.p>
            </motion.div>
            <div className="mt-10 grid grid-cols-2 gap-4">
              <motion.div
                initial={{ opacity: 1, y: 0 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ y: -4, scale: 1.02 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5 }}
                className="rounded-2xl border border-beige-200/80 bg-white/70 px-5 py-4"
              >
                <p className="font-display text-3xl text-[#2a2521]">100%</p>
                <p className="text-sm text-beige-600 mt-1">Handmade bouquets</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 1, y: 0 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ y: -4, scale: 1.02 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: 0.08 }}
                className="rounded-2xl border border-beige-200/80 bg-white/70 px-5 py-4"
              >
                <p className="font-display text-3xl text-[#2a2521]">4+</p>
                <p className="text-sm text-beige-600 mt-1">Major cities served</p>
              </motion.div>
            </div>
            <motion.div
              initial={{ opacity: 1 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="mt-8 pt-8 border-t border-beige-200/80"
            >
              <motion.p
                className="font-display text-xl md:text-2xl text-[#2a2521] italic text-balance"
                animate={{ y: [0, -2, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              >
                &ldquo;{quote}&rdquo;
              </motion.p>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 1, y: 0 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="order-1 lg:order-2"
          >
            <motion.div
              className="relative max-w-md mx-auto lg:max-w-none"
              whileHover={{ y: -6 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
            >
              <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-gold-100/50 to-blush-100/50 blur-sm" />
              <div className="relative aspect-[4/5] rounded-[2rem] overflow-hidden shadow-premium border border-white/70">
                <ContentImage
                  src={aboutImage}
                  alt={founderName ? `${founderName} and Floral Doctor story` : "Floral Doctor story"}
                  fill
                  sizes="(max-width: 1024px) 90vw, 45vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1a1512]/45 via-transparent to-transparent pointer-events-none" />
                <motion.div
                  initial={{ opacity: 1, y: 0 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.55, delay: 0.15 }}
                  className="absolute bottom-5 left-5 right-5 rounded-2xl bg-white/85 backdrop-blur-sm px-4 py-3 border border-white/70"
                >
                  <p className="font-display text-lg text-[#2a2521]">{founderName}</p>
                  <p className="text-sm text-beige-700">{founderRole}</p>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
