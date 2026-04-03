"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/collection", label: "Collection" },
  { href: "/about", label: "About Us" },
];

export default function HeroHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  // On home, header is over dark hero. On other pages (collection, product), top may be light.
  const isOverDark = pathname === "/";
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 bg-transparent shadow-none"
      style={{ backgroundColor: "rgba(0,0,0,0)", backdropFilter: "none" }}
    >
      <nav className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
        <Link
          href="/"
          className={`font-display text-2xl md:text-3xl tracking-tight transition-colors ${
            isOverDark
              ? "text-white hover:text-gold-300"
              : "text-black hover:text-blush-700 font-semibold"
          }`}
        >
          Floral Doctor
        </Link>

        {/* Desktop nav - dark pill for visibility on light hero image */}
        <ul className="hidden md:flex items-center gap-5 lg:gap-7 bg-[#1a1512]/80 backdrop-blur-sm rounded-full px-5 lg:px-6 py-2.5">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`text-[15px] tracking-wide transition-colors ${
                  isActive(link.href)
                    ? "text-gold-300"
                    : "text-white hover:text-gold-300"
                }`}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Mobile menu button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`md:hidden p-2 -mr-2 ${isOverDark ? "text-white" : "text-black"}`}
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </nav>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[#1a1512] border-t border-white/10 overflow-hidden"
          >
            <ul className="px-6 py-4 flex flex-col gap-4">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className={`block transition-colors text-[15px] py-2 ${
                      isActive(link.href)
                        ? "text-gold-300"
                        : "text-white hover:text-gold-300"
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
