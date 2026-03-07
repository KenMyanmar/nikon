import { ChefHat, Hotel, UtensilsCrossed, SprayCan, Wine, Refrigerator, BedDouble, Coffee, ShieldCheck, Building, Award, Package } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-kitchen.jpg";
import SearchAutocomplete from "@/components/SearchAutocomplete";

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

const trustBadges = [
  { icon: ShieldCheck, value: "23+", label: "Years" },
  { icon: Building, value: "300+", label: "Kitchens" },
  { icon: Award, value: "160+", label: "Brands" },
  { icon: Package, value: "4,000+", label: "Products" },
];

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden">
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

        <SearchAutocomplete
          className="max-w-2xl mx-auto mb-10"
          inputClassName="w-full pl-12 pr-28 py-4 rounded-lg text-base outline-none shadow-xl bg-card text-foreground"
          showButton={true}
        />

        <div className="flex justify-center gap-4 md:gap-8 flex-wrap mb-10">
          {categoryShortcuts.map((cat) => (
            <Link
              key={cat.slug}
              to={`/category/${cat.slug}`}
              className="flex flex-col items-center gap-2 text-primary-foreground/80 hover:text-primary-foreground transition group"
            >
              <div className="w-14 h-14 bg-primary-foreground/10 rounded-xl flex items-center justify-center group-hover:bg-primary-foreground/20 transition">
                <cat.icon className="w-7 h-7" />
              </div>
              <span className="text-sm font-medium">{cat.name}</span>
            </Link>
          ))}
        </div>

        {/* Trust Badges */}
        <div className="flex justify-center gap-6 md:gap-12 flex-wrap">
          {trustBadges.map((badge) => (
            <div key={badge.label} className="flex items-center gap-2 text-primary-foreground/80">
              <badge.icon className="w-5 h-5 text-accent" />
              <span className="font-bold text-primary-foreground">{badge.value}</span>
              <span className="text-sm text-primary-foreground/60">{badge.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
