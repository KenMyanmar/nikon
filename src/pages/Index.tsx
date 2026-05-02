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
import { Skeleton } from "@/components/ui/skeleton";
import { useBanners } from "@/hooks/useBanners";

/**
 * Homepage section order:
 *   PromoBanner (in Header) → Header → Hero (carousel or static fallback)
 *   → Category Rail → Best Sellers → Flash Deals → TrustBadgeBar
 *   → Articles (HoReCaResources) → Footer
 *
 * Hero behavior: when CRM-managed `banners` (position='hero') exist and are
 * active, render the rotating HeroBannerCarousel. Otherwise (loading handled
 * with a skeleton; error/empty falls back) render the marathon's locked
 * static <Hero /> exactly as before — Prompt 1 spec preserved as fallback.
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
      <BestSellers />
      <ShopByBusinessType />
      <QuoteCTA />
      <FlashDealsRow />
      <TrustBadgeBar />
      <HoReCaResources />
    </MainLayout>
  );
};

export default Index;
