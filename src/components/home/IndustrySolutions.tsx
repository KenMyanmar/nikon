import { Hotel, UtensilsCrossed, Coffee, PartyPopper } from "lucide-react";
import { Link } from "react-router-dom";

const solutions = [
  {
    icon: Hotel,
    title: "Hotels",
    desc: "Complete kitchen, laundry, and housekeeping solutions for hotels of any size.",
    slug: "hotels",
  },
  {
    icon: UtensilsCrossed,
    title: "Restaurants",
    desc: "From kitchen to table — cooking equipment, tableware, and bar supplies.",
    slug: "restaurants",
  },
  {
    icon: Coffee,
    title: "Cafes & Bakeries",
    desc: "Coffee machines, bakery equipment, display cases, and barista tools.",
    slug: "cafes-bakeries",
  },
  {
    icon: PartyPopper,
    title: "Catering & Events",
    desc: "Banquet equipment, buffet setups, portable cooking, and event supplies.",
    slug: "catering-events",
  },
];

const IndustrySolutions = () => {
  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-h2 text-foreground">Industry Solutions</h2>
          <p className="text-sm text-ikon-text-secondary mt-2">Tailored solutions for every hospitality business</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {solutions.map((sol) => (
            <Link
              key={sol.slug}
              to={`/industry/${sol.slug}`}
              className="bg-card rounded-card shadow-card hover:shadow-card-hover transition-all p-6 group"
            >
              <div className="w-12 h-12 bg-ikon-navy-50 rounded-xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors mb-4">
                <sol.icon className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-foreground text-lg mb-2">{sol.title}</h3>
              <p className="text-sm text-ikon-text-secondary leading-relaxed">{sol.desc}</p>
              <span className="inline-block mt-4 text-sm font-semibold text-accent group-hover:underline">
                Explore Solutions →
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default IndustrySolutions;
