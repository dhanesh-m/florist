import HeroSection from "@/components/HeroSection";
import Marquee from "@/components/Marquee";
import CategorySection from "@/components/CategorySection";
import WhyChooseUs from "@/components/WhyChooseUs";
import Testimonials from "@/components/Testimonials";
import GalleryPreview from "@/components/GalleryPreview";

export default function Home() {
  return (
    <>
      <HeroSection />
      <Marquee />
      <CategorySection />
      <WhyChooseUs />
      <Testimonials />
      <GalleryPreview />
    </>
  );
}
