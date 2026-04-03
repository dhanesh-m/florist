"use client";

import { motion } from "framer-motion";

const features = [
  {
    title: "Fresh Flowers",
    description: "We source only the finest blooms, ensuring every arrangement is vibrant and long-lasting.",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
    ),
  },
  {
    title: "Handmade",
    description: "Each bouquet is lovingly crafted by our skilled florists with attention to every detail.",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
  },
  {
    title: "Local Delivery",
    description: "We deliver across Canada with care, ensuring your flowers arrive fresh and beautiful.",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

export default function WhyChooseUs() {
  return (
    <section className="py-28 md:py-40 bg-[#1a1512] text-white relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blush-900/20 rounded-full blur-[150px]" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 1, y: 0 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-24"
        >
          <p className="text-gold-400 text-sm uppercase tracking-[0.25em] mb-3">
            Our Promise
          </p>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl">
            Why Choose Us
          </h2>
          <p className="text-white/60 mt-4 max-w-xl mx-auto">
            We bring passion and craftsmanship to every arrangement
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 1, y: 0 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{
                duration: 0.6,
                delay: index * 0.15,
                ease: [0.21, 0.47, 0.32, 0.98],
              }}
              className="relative group"
            >
              <div className="p-8 md:p-10 rounded-3xl bg-white/5 backdrop-blur-sm border border-white/10 group-hover:bg-white/10 group-hover:border-gold-500/30 transition-all duration-500">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gold-500/20 text-gold-300 mb-6 group-hover:bg-gold-500/30 transition-colors">
                  {feature.icon}
                </div>
                <h3 className="font-display text-2xl md:text-3xl mb-4">
                  {feature.title}
                </h3>
                <p className="text-white/70 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
