import AboutUs from "@/components/AboutUs";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn about Floral Doctor and Floral Doctor. Canada—fresh, handmade bouquets crafted with the care of a small atelier.",
};

export default function AboutPage() {
  return <AboutUs />;
}
