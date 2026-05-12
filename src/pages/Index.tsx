import MainLayout from "@/components/layout/MainLayout";
import Hero from "@/components/home/Hero";
import HeroBannerCarousel from "@/components/home/HeroBannerCarousel";
import CategoryQuickNav from "@/components/home/CategoryQuickNav";
import ShopByBusinessType from "@/components/home/ShopByBusinessType";
import QuoteCTA from "@/components/home/QuoteCTA";
import FlashDealsRow from "@/components/home/FlashDealsRow";
import BestSellers from "@/components/home/BestSellers";
import TrustBadgeBar from "@/components/home/TrustBadgeBar";
import HoReCaResources from "@/components/home/HoReCaResources";
import ClientLogos from "@/components/home/ClientLogos";
import PromotionsBanner from "@/components/home/PromotionsBanner";
import { Skeleton } from "@/components/ui/skeleton";
import { useBanners } from "@/hooks/useBanners";

/**
 * Homepage section order:
 *   PromoBanner (in Header) → Header → Hero (carousel or static fallback)
 *   → CategoryQuickNav → FlashDealsRow → PromotionsBanner → BestSellers
 *   → ShopByBusinessType → QuoteCTA → TrustBadgeBar → ClientLogos
 *   → HoReCaResources → Footer
 *
 * Hero behavior: when CRM-managed `banners` (position='hero') exist and are
 * active, render HeroBannerCarousel. Otherwise fall back to static <Hero />.
 *
 * PromotionsBanner: reads `promotions` table via usePromotions(). Returns
 * null when no active promos exist — section hides cleanly.
 */
function HeroBannerSection() {
  const { data: heroBanners, isLoading, error } = useBanners("hero");

  if (isLoading) {
    return <Skeleton className="w-full aspect-[16/5]" />;
  }

  if (error || !heroBanners || heroBanners.length === 0) {
    return <Hero />;
  }

  return <HeroBannerCarousel banners={heroBanners} />;
}

const Index = () => {
  return (
    <MainLayout>
      <HeroBannerSection />
      <CategoryQuickNav />
      <FlashDealsRow />
      <PromotionsBanner />
      <BestSellers />
      <ShopByBusinessType />
      <QuoteCTA />
      <TrustBadgeBar />
      <ClientLogos />
      <HoReCaResources />
    </MainLayout>
  );
};

export default Index;
