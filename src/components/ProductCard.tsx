import { Heart, ShoppingCart, Loader2, Zap } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAddToCart } from "@/hooks/useCart";
import { useAuthContext } from "@/contexts/AuthContext";
import { useMarketingData } from "@/hooks/useMarketingData";

interface ProductCardProps {
  id?: string;
  image: string;
  title: string;
  brand: string;
  specs?: string;
  price: number | null;
  currency?: string;
  moq?: number;
  stockStatus: "in_stock" | "low_stock" | "out_of_stock";
  sku: string;
  slug: string;
  categoryId?: string | null;
  brandId?: string | null;
}

const stockConfig = {
  in_stock: { label: "In Stock", dotClass: "bg-emerald-500", textClass: "text-emerald-700", bgClass: "bg-emerald-50" },
  low_stock: { label: "Low Stock", dotClass: "bg-amber-500", textClass: "text-amber-700", bgClass: "bg-amber-50" },
  out_of_stock: { label: "Out of Stock", dotClass: "bg-red-500", textClass: "text-red-700", bgClass: "bg-red-50" },
};

const ProductCard = ({ id, image, title, brand, specs, price, currency = "MMK", moq, stockStatus, sku, slug, categoryId, brandId }: ProductCardProps) => {
  const stock = stockConfig[stockStatus] || stockConfig.in_stock;
  const isPlaceholder = !image || image === "/placeholder.svg";
  const { addToCart, isAdding } = useAddToCart();
  const { user, openAuthModal } = useAuthContext();
  const navigate = useNavigate();
  const { getFlashDeal, getPromotion } = useMarketingData();

  const flashDeal = id ? getFlashDeal(id) : undefined;
  const promotion = id ? getPromotion(id, categoryId, brandId) : undefined;

  const handleRequestQuote = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { openAuthModal(); return; }
    if (id) navigate(`/request-quote?product=${id}`);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (id) {
      addToCart(id, moq || 1, title);
    }
  };

  const displayPrice = flashDeal ? Number(flashDeal.flash_price) : price;
  const originalPrice = flashDeal ? Number(flashDeal.original_price) : null;

  return (
    <Link to={`/product/${slug}`} className="bg-card rounded-card shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-250 overflow-hidden group cursor-pointer block flex flex-col">
      {/* Image */}
      <div className="relative aspect-square bg-muted/30 overflow-hidden">
        {isPlaceholder ? (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-slate-100 text-slate-500">
            <span className="text-4xl font-bold opacity-60">{brand?.charAt(0) || "?"}</span>
            <span className="text-xs font-medium opacity-50 px-4 text-center line-clamp-2">{brand}</span>
          </div>
        ) : (
          <img src={image} alt={title} className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300" loading="lazy" />
        )}

        {/* Flash Deal Badge */}
        {flashDeal && (
          <span className="absolute top-2 left-2 bg-accent text-accent-foreground text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
            <Zap className="w-3 h-3 fill-current" />
            -{flashDeal.discount_percentage || Math.round((1 - flashDeal.flash_price / flashDeal.original_price) * 100)}%
          </span>
        )}

        {/* Promotion Badge */}
        {!flashDeal && promotion && (
          <span className="absolute top-2 left-2 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-1 rounded-full">
            {promotion.type === "percentage" && promotion.discount_value
              ? `${promotion.discount_value}% OFF`
              : promotion.type === "buy_x_get_y"
              ? `B${promotion.buy_quantity}G${promotion.get_quantity}`
              : promotion.title}
          </span>
        )}

        <button className="absolute top-3 right-3 p-2 rounded-full bg-card/80 hover:bg-card text-muted-foreground hover:text-accent transition opacity-0 group-hover:opacity-100" onClick={(e) => e.preventDefault()}>
          <Heart className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-2 flex flex-col flex-1">
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{brand}</p>
        <h3 className="text-sm font-semibold text-foreground line-clamp-2 leading-snug">{title}</h3>
        {specs && <p className="text-xs text-muted-foreground line-clamp-1">{specs}</p>}

        {flashDeal && (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-accent bg-accent/10 px-2 py-0.5 rounded-full w-fit">
            <Zap className="w-3 h-3" /> Flash Deal
          </span>
        )}

        <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${stock.textClass} ${stock.bgClass} px-2 py-0.5 rounded-full w-fit`}>
          <span className={`w-1.5 h-1.5 ${stock.dotClass} rounded-full`}></span>
          {stock.label}
        </span>

        <div className="mt-auto pt-2">
          {displayPrice !== null && displayPrice !== undefined ? (
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className={`text-lg font-bold ${flashDeal ? "text-accent" : "text-accent"}`}>
                {currency} {displayPrice.toLocaleString()}
              </span>
              {originalPrice && (
                <span className="text-xs text-muted-foreground line-through">
                  {currency} {originalPrice.toLocaleString()}
                </span>
              )}
            </div>
          ) : (
            <button
              onClick={handleRequestQuote}
              className="inline-flex items-center bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-semibold hover:bg-primary/20 transition"
            >
              Request Quote
            </button>
          )}
        </div>

        {moq && moq > 1 && (
          <p className="text-xs text-muted-foreground uppercase tracking-wide">MOQ: {moq} units</p>
        )}

        <button
          className="w-full mt-2 bg-accent hover:bg-accent/90 text-accent-foreground font-semibold py-2.5 min-h-[44px] rounded-button transition-all text-sm active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-60"
          onClick={handleAddToCart}
          disabled={isAdding || stockStatus === "out_of_stock"}
        >
          {isAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShoppingCart className="w-4 h-4" />}
          Add to Cart
        </button>
      </div>
    </Link>
  );
};

export default ProductCard;
