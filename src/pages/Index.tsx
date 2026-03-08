import MainLayout from "@/components/layout/MainLayout";
import HeroBannerCarousel from "@/components/home/HeroBannerCarousel";
import HeroSection from "@/components/home/HeroSection";
import FeaturedCategories from "@/components/home/FeaturedCategories";
import FlashDealsRow from "@/components/home/FlashDealsRow";
import BestSellers from "@/components/home/BestSellers";
import PromotionsStrip from "@/components/home/PromotionsStrip";
import BrandCarousel from "@/components/home/BrandCarousel";
import TrustBadgeBar from "@/components/home/TrustBadgeBar";
import IndustrySolutions from "@/components/home/IndustrySolutions";
import QuotationCTA from "@/components/home/QuotationCTA";
import NewArrivals from "@/components/home/NewArrivals";

const Index = () => {
  return (
    <MainLayout>
      <HeroBannerCarousel />
      <HeroSection />
      <FeaturedCategories />
      <FlashDealsRow />
      <BestSellers />
      <PromotionsStrip />
      <BrandCarousel />
      <TrustBadgeBar />
      <IndustrySolutions />
      <QuotationCTA />
      <NewArrivals />
    </MainLayout>
  );
};

export default Index;
