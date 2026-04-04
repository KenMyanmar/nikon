import MainLayout from "@/components/layout/MainLayout";
import { usePromotions } from "@/hooks/useMarketingData";
import { formatToMMT } from "@/utils/timezone";
import { Link } from "react-router-dom";
import { ArrowRight, Tag } from "lucide-react";

const Promotions = () => {
  const { data: promotions = [], isLoading } = usePromotions();

  const getLink = (promo: (typeof promotions)[0]) => {
    if (promo.applies_to === "product" && promo.target_ids?.length === 1) return `/product/${promo.target_ids[0]}`;
    if (promo.applies_to === "product" && (promo.target_ids?.length ?? 0) > 1) return `/promotions/${promo.id}`;
    if (promo.applies_to === "category" && promo.target_ids?.[0]) return `/category/${promo.target_ids[0]}`;
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
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-foreground mb-6">Current Promotions</h1>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <div key={i} className="h-52 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : promotions.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Tag className="w-12 h-12 mx-auto mb-4 opacity-40" />
            <p className="text-lg font-medium">No active promotions right now</p>
            <p className="text-sm mt-1">Check back soon for great deals!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {promotions.map((promo) => {
              const discountLabel = getDiscountLabel(promo);
              const hasBanner = !!promo.banner_image_url;

              return (
                <Link
                  key={promo.id}
                  to={getLink(promo)}
                  className="block rounded-xl overflow-hidden group hover:shadow-lg transition-shadow border border-border"
                >
                  <div
                    className="relative h-[180px] md:h-[220px] flex items-end"
                    style={
                      hasBanner
                        ? { backgroundImage: `url(${promo.banner_image_url})`, backgroundSize: "cover", backgroundPosition: "center" }
                        : { background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))" }
                    }
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                    <div className="relative z-10 p-5 w-full">
                      <h3 className="text-white font-bold text-lg">{promo.title}</h3>
                      {promo.description && (
                        <p className="text-white/80 text-sm mt-1 line-clamp-2">{promo.description}</p>
                      )}
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-2">
                          {discountLabel && (
                            <span className="bg-destructive text-destructive-foreground text-xs font-bold px-3 py-1 rounded-full">
                              {discountLabel}
                            </span>
                          )}
                          <span className="text-white/60 text-xs">
                            Ends: {formatToMMT(promo.end_date, "date")}
                          </span>
                        </div>
                        <span className="flex items-center gap-1 text-white text-sm font-semibold group-hover:underline">
                          Shop Now <ArrowRight className="w-4 h-4" />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Promotions;
