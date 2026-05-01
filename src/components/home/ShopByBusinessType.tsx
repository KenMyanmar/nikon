import { Link } from "react-router-dom";
import { Coffee, UtensilsCrossed, Hotel, Wine, CakeSlice } from "lucide-react";

const businessTypes = [
  {
    icon: Coffee,
    label: "Café",
    slug: "cafes-bakeries",
    gradient: "from-amber-800 to-amber-950",
  },
  {
    icon: UtensilsCrossed,
    label: "Restaurant",
    slug: "restaurants",
    gradient: "from-red-800 to-red-950",
  },
  {
    icon: Hotel,
    label: "Hotel",
    slug: "hotels",
    gradient: "from-blue-800 to-blue-950",
  },
  {
    icon: Wine,
    label: "Bar & Pub",
    slug: "bars",
    gradient: "from-purple-800 to-purple-950",
  },
  {
    icon: CakeSlice,
    label: "Bakery",
    slug: "bakeries",
    gradient: "from-orange-800 to-orange-950",
  },
];

const ShopByBusinessType = () => {
  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-h2 text-foreground">Shop by Business Type</h2>
          <p className="text-sm text-muted-foreground mt-2">
            Curated equipment & supplies for your industry
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {businessTypes.map((biz) => (
            <Link
              key={biz.slug}
              to={`/industry/${biz.slug}`}
              className={`relative group rounded-xl overflow-hidden aspect-[4/5] bg-gradient-to-br ${biz.gradient} flex flex-col items-center justify-end p-6`}
            >
              <div className="absolute inset-0 bg-black/20" />
              <biz.icon className="w-10 h-10 text-white/80 mb-3 relative z-10" />
              <span className="text-white font-bold text-lg relative z-10 tracking-wide">
                {biz.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ShopByBusinessType;
