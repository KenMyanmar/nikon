import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import ProductCard from "../ProductCard";

const sampleProducts = [
  {
    image: "https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=400&h=400&fit=crop",
    title: "Electrolux Professional Combi Oven 10 GN 1/1",
    brand: "ELECTROLUX",
    specs: "Electric, 10 trays, touch screen",
    price: 12000000,
    stockStatus: "in_stock" as const,
    sku: "EL-CO-10GN",
  },
  {
    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop",
    title: "Cambro Food Pan Full Size GN 1/1",
    brand: "CAMBRO",
    specs: "Polycarbonate, clear, 150mm deep",
    price: 45000,
    stockStatus: "in_stock" as const,
    sku: "CM-FP-001",
  },
  {
    image: "https://images.unsplash.com/photo-1593618998160-e34014e67546?w=400&h=400&fit=crop",
    title: "Arcos Professional Chef Knife 200mm",
    brand: "ARCOS",
    specs: "Stainless steel, ergonomic handle",
    price: 120000,
    stockStatus: "low_stock" as const,
    sku: "AR-CK-200",
  },
  {
    image: "https://images.unsplash.com/photo-1585515320310-259814833e62?w=400&h=400&fit=crop",
    title: "Scotsman Ice Machine NW608",
    brand: "SCOTSMAN",
    specs: "80kg/24h, air cooled, nugget ice",
    price: 8500000,
    stockStatus: "in_stock" as const,
    sku: "SC-IM-608",
  },
  {
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=400&fit=crop",
    title: "Hobart Dishwasher AM15 Hood Type",
    brand: "HOBART",
    specs: "60 racks/hour, energy efficient",
    price: null,
    stockStatus: "in_stock" as const,
    sku: "HB-DW-AM15",
  },
];

const BestSellers = () => {
  return (
    <section className="py-12 md:py-16 bg-ikon-bg-secondary">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-h2 text-foreground">Best Selling Products</h2>
          <Link to="/best-sellers" className="text-sm font-semibold text-primary hover:text-accent transition flex items-center gap-1">
            View All <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="flex gap-4 md:gap-6 overflow-x-auto scrollbar-hide pb-4">
          {sampleProducts.map((product) => (
            <div key={product.sku} className="min-w-[220px] md:min-w-[260px] flex-shrink-0">
              <ProductCard {...product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BestSellers;
