import { Truck, BadgeDollarSign, ShieldCheck, Handshake } from "lucide-react";

const badges = [
  { icon: Truck, label: "Fast Delivery", sub: "Yangon Metro" },
  { icon: BadgeDollarSign, label: "Wholesale Pricing", sub: "Best B2B Rates" },
  { icon: ShieldCheck, label: "160+ Brands", sub: "Trusted Names" },
  { icon: Handshake, label: "B2B Accounts", sub: "Credit Terms" },
];

const TrustBadgeBar = () => {
  return (
    <section className="border-y border-border bg-card py-5">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center gap-6 overflow-x-auto scrollbar-hide">
          {badges.map((b) => (
            <div key={b.label} className="flex items-center gap-3 min-w-fit">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <b.icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground leading-tight">{b.label}</p>
                <p className="text-xs text-muted-foreground">{b.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustBadgeBar;
