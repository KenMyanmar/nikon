import { Link } from "react-router-dom";

/**
 * Shop by Business Type — static navigation aid.
 *
 * 5 photographic cards linking to the most relevant parent category for each
 * HoReCa segment. Hardcoded (not DB-driven) since this is a curated
 * navigation surface, not editable content.
 */

interface BusinessType {
  label: string;
  image: string;
  link: string;
}

const STORAGE = "https://fqabwolwhrtrygmhaipg.supabase.co/storage/v1/object/public/category-images";

const businessTypes: BusinessType[] = [
  { label: "Hotel", image: `${STORAGE}/biz-hotel.jpg`, link: "/category/bedroom-supplies" },
  { label: "Restaurant", image: `${STORAGE}/biz-restaurant.jpg`, link: "/category/tableware" },
  { label: "Cafe & Bakery", image: `${STORAGE}/biz-cafe.jpg`, link: "/category/f-and-b-solutions" },
  { label: "Bar & Pub", image: `${STORAGE}/biz-bar.jpg`, link: "/category/kitchen-utensils" },
  { label: "Catering", image: `${STORAGE}/biz-catering.jpg`, link: "/category/buffet-and-banquet" },
];

const ShopByBusinessType = () => {
  return (
    <section className="container mx-auto px-4 py-10">
      <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-6">
        Shop by Business Type
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {businessTypes.map((biz) => (
          <Link
            key={biz.label}
            to={biz.link}
            className="group relative block overflow-hidden rounded-xl aspect-[3/2] border border-border bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            <img
              src={biz.image}
              alt={biz.label}
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-black/10" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xl md:text-2xl font-bold text-white drop-shadow-md">
                {biz.label}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default ShopByBusinessType;
