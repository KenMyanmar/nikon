import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import ProductCard from "../ProductCard";

const newProducts = [
  {
    image: "https://images.unsplash.com/photo-1556909114-44e3e70034e2?w=400&h=400&fit=crop",
    title: "Robot Coupe R301 Ultra Food Processor",
    brand: "ROBOT COUPE",
    specs: "3.7L bowl, 1500 RPM",
    price: 3200000,
    stockStatus: "in_stock" as const,
    sku: "RC-FP-R301",
  },
  {
    image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=400&fit=crop",
    title: "Nespresso Zenius Professional Coffee Machine",
    brand: "NESPRESSO",
    specs: "Capsule system, 2.3L tank",
    price: 1800000,
    stockStatus: "in_stock" as const,
    sku: "NP-CM-ZEN",
  },
  {
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop",
    title: "Riedel Vinum Cabernet/Merlot Glass Set",
    brand: "RIEDEL",
    specs: "Set of 4, lead-free crystal",
    price: 280000,
    stockStatus: "low_stock" as const,
    sku: "RD-WG-VCM",
  },
  {
    image: "https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=400&h=400&fit=crop",
    title: "Karcher Professional Vacuum BR 30/4 C",
    brand: "KARCHER",
    specs: "30L tank, 1200W, HEPA filter",
    price: 2100000,
    stockStatus: "in_stock" as const,
    sku: "KC-VC-BR30",
  },
  {
    image: "https://images.unsplash.com/photo-1556742393-d75f468bfcb0?w=400&h=400&fit=crop",
    title: "Sunnex Chafing Dish Round 6.8L Gold",
    brand: "SUNNEX",
    specs: "Stainless steel, gold handle",
    price: 185000,
    stockStatus: "in_stock" as const,
    sku: "SX-CD-R68",
  },
];

const NewArrivals = () => {
  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-h2 text-foreground">New Arrivals</h2>
          <Link to="/new-arrivals" className="text-sm font-semibold text-primary hover:text-accent transition flex items-center gap-1">
            View All <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="flex gap-4 md:gap-6 overflow-x-auto scrollbar-hide pb-4">
          {newProducts.map((product) => (
            <div key={product.sku} className="min-w-[220px] md:min-w-[260px] flex-shrink-0">
              <ProductCard {...product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default NewArrivals;
