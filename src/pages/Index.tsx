import MainLayout from "@/components/layout/MainLayout";
import Hero from "@/components/home/Hero";
import CategoryQuickNav from "@/components/home/CategoryQuickNav";
import FlashDealsRow from "@/components/home/FlashDealsRow";
import BestSellers from "@/components/home/BestSellers";
import ClientLogos from "@/components/home/ClientLogos";
import TrustBadgeBar from "@/components/home/TrustBadgeBar";
import HoReCaResources from "@/components/home/HoReCaResources";

/**
 * Homepage section order (Prompt 1):
 *   PromoBanner (in Header) → Header → Hero → Category Rail
 *   → Best Sellers → Flash Deals → ClientLogos → TrustBadgeBar
 *   → Articles (HoReCaResources) → Footer
 *
 * Removed: PromotionsBanner, TopBrandsShowcase, NewArrivals, QuotationCTA,
 * HeroBannerCarousel (replaced by Hero).
 */
const Index = () => {
  return (
    <MainLayout>
      <Hero />
      <CategoryQuickNav />
      <BestSellers />
      <FlashDealsRow />
      <ClientLogos />
      <TrustBadgeBar />
      <HoReCaResources />
    </MainLayout>
  );
};

export default Index;
