"use client";

import { useState, useEffect } from "react";
import HeroHeader from "./HeroHeader";
import StickyHeader from "./StickyHeader";

const SCROLL_THRESHOLD = 30;

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > SCROLL_THRESHOLD);
    handleScroll(); // Set initial state (e.g. after back/forward nav)
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Hero header: transparent, over hero sections
  // Sticky header: white background, when scrolled
  return scrolled ? <StickyHeader /> : <HeroHeader />;
}
