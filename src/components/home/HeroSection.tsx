import { Search, ChefHat, Hotel, UtensilsCrossed, SprayCan, Wine, Refrigerator, BedDouble, Coffee } from "lucide-react";
import heroImage from "@/assets/hero-kitchen.jpg";

const categoryShortcuts = [
  { name: "Kitchen", icon: ChefHat, slug: "kitchen-services" },
  { name: "Hotel", icon: Hotel, slug: "hotel-supplies" },
  { name: "Restaurant", icon: UtensilsCrossed, slug: "restaurant" },
  { name: "Housekeeping", icon: SprayCan, slug: "housekeeping" },
  { name: "Bar", icon: Wine, slug: "bar-equipment" },
  { name: "Refrigeration", icon: Refrigerator, slug: "refrigeration" },
  { name: "Linen", icon: BedDouble, slug: "linen" },
  { name: "F&B", icon: Coffee, slug: "food-beverage" },
];

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden">
      {/* Background image with overlay */}
      <div className="absolute inset-0">
        <img src={heroImage} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--ikon-navy))] via-[hsl(var(--ikon-navy))/0.92] to-[hsl(var(--ikon-navy-dark))/0.95]" />
      </div>

      <div className="relative container mx-auto px-4 py-16 md:py-24 text-center">
        <h1 className="text-3xl md:text-5xl font-bold text-primary-foreground mb-4 leading-tight">
          Myanmar's Trusted Marketplace for<br />
          Kitchen, Hotel, Restaurant &<br />
          Commercial Supplies
        </h1>
        <p className="text-lg text-primary-foreground/70 mb-8">
          4,000+ products from 160+ premium international brands
        </p>

        {/* Hero Search */}
        <div className="max-w-2xl mx-auto relative mb-10">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ikon-text-tertiary" />
          <input
            type="text"
            placeholder="Search by product name, brand, or SKU..."
            className="w-full pl-12 pr-28 py-4 rounded-lg text-base outline-none shadow-xl bg-card text-foreground"
          />
          <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-accent text-accent-foreground px-6 py-2 rounded-md font-semibold hover:bg-ikon-red-dark transition">
            Search
          </button>
        </div>

        {/* Category Shortcuts */}
        <div className="flex justify-center gap-4 md:gap-8 flex-wrap">
          {categoryShortcuts.map((cat) => (
            <a
              key={cat.slug}
              href={`/category/${cat.slug}`}
              className="flex flex-col items-center gap-2 text-primary-foreground/80 hover:text-primary-foreground transition group"
            >
              <div className="w-14 h-14 bg-primary-foreground/10 rounded-xl flex items-center justify-center group-hover:bg-primary-foreground/20 transition">
                <cat.icon className="w-7 h-7" />
              </div>
              <span className="text-sm font-medium">{cat.name}</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
