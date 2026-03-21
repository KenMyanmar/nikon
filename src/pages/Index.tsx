import MainLayout from "@/components/layout/MainLayout";
import CategoryQuickNav from "@/components/home/CategoryQuickNav";
import HeroBannerCarousel from "@/components/home/HeroBannerCarousel";
import FlashDealsRow from "@/components/home/FlashDealsRow";
import BestSellers from "@/components/home/BestSellers";
import TopBrandsShowcase from "@/components/home/TopBrandsShowcase";
import NewArrivals from "@/components/home/NewArrivals";
import TrustBadgeBar from "@/components/home/TrustBadgeBar";
import QuotationCTA from "@/components/home/QuotationCTA";

const Index = () => {
  return (
    <MainLayout>
      <CategoryQuickNav />
      <HeroBannerCarousel />
      <FlashDealsRow />
      <BestSellers />
      <TopBrandsShowcase />
      <NewArrivals />
      <TrustBadgeBar />
      <QuotationCTA />
    </MainLayout>
  );
};

export default Index;
