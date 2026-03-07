import { ShieldCheck, Building, Award, Users } from "lucide-react";

const stats = [
  { icon: ShieldCheck, value: "23+", label: "Years of Expertise" },
  { icon: Building, value: "300+", label: "Kitchens Installed" },
  { icon: Award, value: "160+", label: "Premium Brands" },
  { icon: Users, value: "1,000+", label: "Happy Customers" },
];

const TrustBadgeBar = () => {
  return (
    <section className="bg-ikon-navy-50 py-8 md:py-10">
      <div className="container mx-auto px-4">
        <div className="flex justify-center gap-8 md:gap-16 flex-wrap">
          {stats.map((stat) => (
            <div key={stat.label} className="flex items-center gap-3">
              <stat.icon className="w-8 h-8 text-primary" />
              <div>
                <p className="font-bold text-primary text-lg">{stat.value}</p>
                <p className="text-sm text-ikon-text-secondary">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustBadgeBar;
