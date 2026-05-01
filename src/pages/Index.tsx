import MainLayout from "@/components/layout/MainLayout";
import Hero from "@/components/home/Hero";
import CategoryQuickNav from "@/components/home/CategoryQuickNav";
import FlashDealsRow from "@/components/home/FlashDealsRow";
import BestSellers from "@/components/home/BestSellers";
import TrustBadgeBar from "@/components/home/TrustBadgeBar";
import HoReCaResources from "@/components/home/HoReCaResources";

/**
 * Homepage section order (Prompt 6):
 *   PromoBanner (in Header) → Header → Hero → Category Rail
 *   → Best Sellers → Flash Deals → TrustBadgeBar
 *   → Articles (HoReCaResources) → Footer
 *
 * Removed in Prompt 6: ClientLogos (DB-driven hand-curated marquee, decorative
 * motion violation, redundant against TrustBadgeBar's "160+ Brands" signal).
 */
const Index = () => {
  return (
    <MainLayout>
      <Hero />
      <CategoryQuickNav />
      <BestSellers />
      <FlashDealsRow />
      <TrustBadgeBar />
      <HoReCaResources />
    </MainLayout>
  );
};

export default Index;
