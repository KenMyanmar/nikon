import { ChefHat, Hotel, UtensilsCrossed, SprayCan, Wine, Refrigerator, BedDouble, Coffee } from "lucide-react";
import { Link } from "react-router-dom";

const categories = [
  { name: "Kitchen Services", icon: ChefHat, slug: "kitchen-services", count: "850+", desc: "Cooking, ovens, dishwashing" },
  { name: "Tableware & Display", icon: UtensilsCrossed, slug: "tableware", count: "620+", desc: "China, glass, cutlery" },
  { name: "Kitchen Utensils", icon: ChefHat, slug: "kitchen-utensils", count: "540+", desc: "Tools, knives, pans" },
  { name: "Housekeeping", icon: SprayCan, slug: "housekeeping", count: "380+", desc: "Equipment & chemicals" },
  { name: "Bar & Beverage", icon: Wine, slug: "bar-beverage", count: "290+", desc: "Bar tools & glassware" },
  { name: "Refrigeration", icon: Refrigerator, slug: "refrigeration", count: "210+", desc: "Cold storage & ice" },
  { name: "Linen & Amenities", icon: BedDouble, slug: "linen-amenities", count: "450+", desc: "Bedroom & bathroom" },
  { name: "Food & Beverage", icon: Coffee, slug: "food-beverage", count: "320+", desc: "Coffee, bakery, dairy" },
];

const FeaturedCategories = () => {
  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-h2 text-foreground">Shop by Category</h2>
          <p className="text-sm text-ikon-text-secondary mt-2">Browse our comprehensive product catalog</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              to={`/category/${cat.slug}`}
              className="bg-card rounded-card shadow-card hover:shadow-card-hover transition-all p-6 text-center group"
            >
              <div className="w-16 h-16 mx-auto mb-4 bg-ikon-navy-50 rounded-xl flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors text-primary">
                <cat.icon className="w-8 h-8" />
              </div>
              <h3 className="font-semibold text-foreground text-sm md:text-base">{cat.name}</h3>
              <p className="text-xs text-ikon-text-tertiary mt-1">{cat.desc}</p>
              <span className="inline-block mt-2 text-xs font-semibold text-accent">{cat.count} products</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedCategories;
