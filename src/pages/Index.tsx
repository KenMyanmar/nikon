import MainLayout from "@/components/layout/MainLayout";
import HeroSection from "@/components/home/HeroSection";
import FeaturedCategories from "@/components/home/FeaturedCategories";
import BestSellers from "@/components/home/BestSellers";
import BrandCarousel from "@/components/home/BrandCarousel";
import TrustBadgeBar from "@/components/home/TrustBadgeBar";
import IndustrySolutions from "@/components/home/IndustrySolutions";
import QuotationCTA from "@/components/home/QuotationCTA";
import NewArrivals from "@/components/home/NewArrivals";

const Index = () => {
  return (
    <MainLayout>
      <HeroSection />
      <FeaturedCategories />
      <BestSellers />
      <BrandCarousel />
      <TrustBadgeBar />
      <IndustrySolutions />
      <QuotationCTA />
      <NewArrivals />
    </MainLayout>
  );
};

export default Index;
