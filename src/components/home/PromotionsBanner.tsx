import { Link } from "react-router-dom";
import { usePromotions } from "@/hooks/useMarketingData";
import { formatToMMT } from "@/utils/timezone";
import { ArrowRight, Flame } from "lucide-react";

const PromotionsBanner = () => {
  const { data: promotions = [] } = usePromotions();

  if (promotions.length === 0) return null;

  const getLink = (promo: (typeof promotions)[0]) => {
    if (promo.applies_to === "product" && promo.target_ids?.length === 1) {
      return `/product/${promo.target_ids[0]}`;
    }
    if (promo.applies_to === "product" && (promo.target_ids?.length ?? 0) > 1) {
      return `/promotions/${promo.id}`;
    }
    if (promo.applies_to === "category" && promo.target_ids?.[0]) {
      return `/category/${promo.target_ids[0]}`;
    }
    return "/categories";
  };

  const getDiscountLabel = (promo: (typeof promotions)[0]) => {
    if (!promo.discount_value) return null;
    if (promo.type === "percentage") return `${promo.discount_value}% OFF`;
    if (promo.type === "fixed_amount") return `Save ${Number(promo.discount_value).toLocaleString()} MMK`;
    if (promo.type === "buy_x_get_y") return `Buy ${promo.buy_quantity} Get ${promo.get_quantity}`;
    return `${promo.discount_value}% OFF`;
  };

  return (
    <section className="py-4">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-destructive" />
            <h2 className="text-lg font-semibold text-foreground">Promotions</h2>
          </div>
          <Link to="/promotions" className="text-sm font-medium text-primary hover:underline">
            View All →
          </Link>
        </div>

        <div className={promotions.length === 1 ? "" : "flex gap-4 overflow-x-auto no-scrollbar pb-2"}>
          {promotions.map((promo) => {
            const discountLabel = getDiscountLabel(promo);
            const hasBanner = !!promo.banner_image_url;

            return (
              <Link
                key={promo.id}
                to={getLink(promo)}
                className={`block rounded-xl overflow-hidden group transition-shadow hover:shadow-lg ${
                  promotions.length === 1 ? "w-full" : "min-w-[320px] md:min-w-[400px] flex-shrink-0"
                }`}
              >
                <div
                  className="relative h-[150px] md:h-[200px] flex items-end"
                  style={
                    hasBanner
                      ? { backgroundImage: `url(${promo.banner_image_url})`, backgroundSize: "cover", backgroundPosition: "center" }
                      : { background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))" }
                  }
                >
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

                  <div className="relative z-10 p-4 md:p-6 w-full">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <h3 className="text-white font-bold text-base md:text-lg line-clamp-1">
                          {promo.title}
                        </h3>
                        {promo.description && (
                          <p className="text-white/80 text-xs md:text-sm line-clamp-1">
                            {promo.description}
                          </p>
                        )}
                        <p className="text-white/60 text-xs">
                          Ends: {formatToMMT(promo.end_date, "date")}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        {discountLabel && (
                          <span className="bg-destructive text-destructive-foreground text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                            {discountLabel}
                          </span>
                        )}
                        <span className="flex items-center gap-1 text-white text-xs font-semibold group-hover:underline">
                          Shop Now <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default PromotionsBanner;
