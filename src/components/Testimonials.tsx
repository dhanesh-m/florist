"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { getAdminContentClient } from "@/lib/admin-content-client";
import { SITE_CONTENT_DEFAULTS } from "@/lib/site-content-defaults";

type TestimonialForUI = {
  quote: string;
  name: string;
  detail: string;
};

const fallbackTestimonials: TestimonialForUI[] = (SITE_CONTENT_DEFAULTS.testimonials ?? []).map((t) => ({
  quote: t.quote ?? "",
  name: t.name ?? "",
  detail: t.location ?? "",
}));

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState<TestimonialForUI[]>(fallbackTestimonials);

  useEffect(() => {
    let mounted = true;
    getAdminContentClient(false).then((doc) => {
      if (!mounted || !doc) return;
      if (!Array.isArray(doc.testimonials)) return;

      const mapped: TestimonialForUI[] = doc.testimonials
        .filter((t) => t && t.isVisible !== false)
        .map((t) => ({
          quote: t.quote || "",
          name: t.name || "",
          detail: t.location || "",
        }))
        .filter((t) => t.quote && t.name);

      if (mapped.length) setTestimonials(mapped);
    });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section className="py-28 md:py-40 bg-white relative overflow-hidden border-y border-beige-200/40">
      <div className="absolute top-1/2 right-0 w-72 h-72 bg-gold-100/30 rounded-full blur-[90px] translate-x-1/3" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 1, y: 0 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-20 md:mb-24"
        >
          <p className="text-gold-600 text-sm uppercase tracking-[0.25em] mb-3">
            Kind Words
          </p>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-[#2a2521]">
            Client Testimonials
          </h2>
          <p className="text-beige-600 mt-4 max-w-lg mx-auto">
            A few notes from people who trusted us with their moments
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
          {testimonials.map((item, index) => (
            <motion.blockquote
              key={item.name}
              initial={{ opacity: 1, y: 0 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{
                duration: 0.6,
                delay: index * 0.1,
                ease: [0.21, 0.47, 0.32, 0.98],
              }}
              className="relative flex flex-col h-full p-8 md:p-10 rounded-3xl bg-[#faf9f7] border border-beige-200/60 shadow-soft"
            >
              <span
                className="font-display text-5xl text-gold-400/50 leading-none mb-4 select-none"
                aria-hidden
              >
                “
              </span>
              <p className="font-serif text-[#3d3630] text-lg leading-relaxed flex-grow">
                {item.quote}
              </p>
              <footer className="mt-8 pt-8 border-t border-beige-200/80">
                <cite className="not-italic">
                  <span className="font-display text-lg text-[#2a2521]">{item.name}</span>
                  <span className="block text-sm text-beige-600 mt-1">{item.detail}</span>
                </cite>
              </footer>
            </motion.blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
