import MainLayout from "@/components/layout/MainLayout";
import HeroBannerCarousel from "@/components/home/HeroBannerCarousel";
import HeroSection from "@/components/home/HeroSection";
import FeaturedCategories from "@/components/home/FeaturedCategories";
import FlashDealsRow from "@/components/home/FlashDealsRow";
import BestSellers from "@/components/home/BestSellers";
import PromotionsStrip from "@/components/home/PromotionsStrip";
import BrandCarousel from "@/components/home/BrandCarousel";
import TrustBadgeBar from "@/components/home/TrustBadgeBar";
import ShopByBusinessType from "@/components/home/ShopByBusinessType";
import ClientLogos from "@/components/home/ClientLogos";
import QuotationCTA from "@/components/home/QuotationCTA";
import NewArrivals from "@/components/home/NewArrivals";

const Index = () => {
  return (
    <MainLayout>
      <HeroBannerCarousel />
      <HeroSection />
      <TrustBadgeBar />
      <FeaturedCategories />
      <FlashDealsRow />
      <BestSellers />
      <ShopByBusinessType />
      <PromotionsStrip />
      <ClientLogos />
      <BrandCarousel />
      <QuotationCTA />
      <NewArrivals />
    </MainLayout>
  );
};

export default Index;
