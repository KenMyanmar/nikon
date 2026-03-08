import { useState, useEffect } from "react";
import { usePromotions } from "@/hooks/useMarketingData";

const PromotionsStrip = () => {
  const { data: promotions = [] } = usePromotions();
  const [current, setCurrent] = useState(0);

  const active = promotions.slice(0, 3);

  useEffect(() => {
    if (active.length <= 1) return;
    const t = setInterval(() => setCurrent((c) => (c + 1) % active.length), 4000);
    return () => clearInterval(t);
  }, [active.length]);

  if (active.length === 0) return null;

  const promo = active[current];
  const label =
    promo.type === "percentage" && promo.discount_value
      ? `${promo.discount_value}% OFF`
      : promo.type === "buy_x_get_y"
      ? `Buy ${promo.buy_quantity} Get ${promo.get_quantity} Free`
      : promo.type === "fixed_amount" && promo.discount_value
      ? `MMK ${Number(promo.discount_value).toLocaleString()} OFF`
      : "";

  return (
    <section
      className="relative bg-primary text-primary-foreground py-3 overflow-hidden transition-all"
      style={
        promo.banner_image_url
          ? { backgroundImage: `url(${promo.banner_image_url})`, backgroundSize: "cover", backgroundPosition: "center" }
          : undefined
      }
    >
      {promo.banner_image_url && <div className="absolute inset-0 bg-primary/80" />}
      <div className="container mx-auto px-4 relative z-10 text-center">
        <p className="text-sm md:text-base font-semibold">
          {label && <span className="bg-accent text-accent-foreground px-2 py-0.5 rounded text-xs font-bold mr-2">{label}</span>}
          {promo.title}
          {promo.description && <span className="hidden md:inline text-primary-foreground/80 ml-2">— {promo.description}</span>}
        </p>
      </div>
      {active.length > 1 && (
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-1">
          {active.map((_, i) => (
            <span
              key={i}
              className={`w-1.5 h-1.5 rounded-full ${i === current ? "bg-white" : "bg-white/40"}`}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default PromotionsStrip;
