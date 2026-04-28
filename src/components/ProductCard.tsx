import { Heart, ShoppingCart, Loader2, Zap, Star, AlertTriangle, Package, ImageOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAddToCart } from "@/hooks/useCart";
import { useAuthContext } from "@/contexts/AuthContext";
import { useMarketingData } from "@/hooks/useMarketingData";
import { useSavedProductIds, useToggleSave } from "@/hooks/useSavedItems";

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
  isFeatured?: boolean;
  onhandQty?: number;
  unitOfMeasure?: string;
  categoryName?: string;
  brandLogo?: string | null;
}

const stockConfig = {
  in_stock: { label: "In Stock", dotClass: "bg-emerald-500", textClass: "text-emerald-700", bgClass: "bg-emerald-50" },
  low_stock: { label: "Low Stock", dotClass: "bg-amber-500", textClass: "text-amber-700", bgClass: "bg-amber-50" },
  out_of_stock: { label: "Out of Stock", dotClass: "bg-red-500", textClass: "text-red-700", bgClass: "bg-red-50" },
};

const ProductCard = ({ id, image, title, brand, specs, price, currency = "MMK", moq, stockStatus, sku, slug, categoryId, brandId, isFeatured, onhandQty, unitOfMeasure, categoryName, brandLogo }: ProductCardProps) => {
  const stock = stockConfig[stockStatus] || stockConfig.in_stock;
  const isPlaceholder = !image || image === "/placeholder.svg";
  const { addToCart, isAdding } = useAddToCart();
  const { user, openAuthModal } = useAuthContext();
  const navigate = useNavigate();
  const { getFlashDeal, getPromotion } = useMarketingData();
  const { savedIds } = useSavedProductIds();
  const { toggleSave, isPending: isSaving } = useToggleSave();
  const isSaved = id ? savedIds.has(id) : false;

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

  // Priority: flash deal > promotion > base price
  let displayPrice = price;
  let originalPrice: number | null = null;
  let isPromotion = false;

  if (flashDeal) {
    displayPrice = Number(flashDeal.flash_price);
    originalPrice = Number(flashDeal.original_price);
  } else if (promotion && price !== null && price > 0) {
    if (promotion.type === "percentage" && promotion.discount_value) {
      let discounted = price * (1 - promotion.discount_value / 100);
      if (promotion.max_discount_amount && promotion.max_discount_amount > 0) {
        discounted = Math.max(discounted, price - promotion.max_discount_amount);
      }
      displayPrice = Math.round(discounted);
      originalPrice = price;
      isPromotion = true;
    } else if (promotion.type === "fixed_amount" && promotion.discount_value) {
      displayPrice = Math.round(price - promotion.discount_value);
      originalPrice = price;
      isPromotion = true;
    }
  }

  const showUrgency = stockStatus === "low_stock" && onhandQty && onhandQty <= 5;

  const linkTarget = slug || id;

  return (
    <Link to={linkTarget ? `/product/${linkTarget}` : "#"} className="bg-card rounded-card shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-250 overflow-hidden group cursor-pointer block flex flex-col h-full">
      {/* Image */}
      <div className="relative aspect-square bg-[#F8F9FA] overflow-hidden rounded-t-card">
        {isPlaceholder ? (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 border border-dashed border-[#DEE2E6] rounded-t-card">
            {brandLogo ? (
              <img src={brandLogo} alt={brand} className="w-[40%] h-[40%] object-contain opacity-60" />
            ) : (
              <ImageOff className="w-10 h-10 text-[#ADB5BD] opacity-50" />
            )}
            <span className="text-[#ADB5BD] text-xs font-medium">Image Coming Soon</span>
          </div>
        ) : (
          <img src={image} alt={title} className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300" loading="lazy" />
        )}

        {/* Top-left badges stack */}
        <div className="absolute top-2 left-2 flex flex-col gap-1.5">
          {flashDeal && (
            <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 w-fit">
              <Zap className="w-3 h-3 fill-current" />
              -{flashDeal.discount_percentage || (flashDeal.original_price ? Math.round((1 - flashDeal.flash_price / flashDeal.original_price) * 100) : 0)}%
            </span>
          )}
          {!flashDeal && promotion && (
            <span className="bg-primary text-primary-foreground text-[10px] font-bold px-2 py-1 rounded-full w-fit">
              {promotion.type === "percentage" && promotion.discount_value
                ? `${promotion.discount_value}% OFF`
                : promotion.type === "buy_x_get_y"
                ? `B${promotion.buy_quantity}G${promotion.get_quantity}`
                : promotion.title}
            </span>
          )}
          {isFeatured && (
            <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 w-fit">
              <Star className="w-3 h-3 fill-current" /> Best Seller
            </span>
          )}
          {moq && moq > 1 && (
            <span className="bg-primary/90 text-primary-foreground text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 w-fit">
              <Package className="w-3 h-3" /> Bulk Order
            </span>
          )}
        </div>

        {categoryName && !showUrgency && (
          <div className="absolute bottom-2 left-2 bg-black/50 text-white text-[10px] px-2 py-0.5 rounded-full">
            {categoryName}
          </div>
        )}
        {showUrgency && (
          <div className="absolute bottom-2 left-2 bg-amber-500/90 text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> Only {onhandQty} left!
          </div>
        )}

        <button
          className={`absolute top-3 right-3 p-2 rounded-full bg-card/80 hover:bg-card transition ${isSaved ? "opacity-100 text-red-500" : "opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-500"}`}
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); if (id) toggleSave(id, isSaved); }}
          disabled={isSaving}
        >
          <Heart className={`w-4 h-4 ${isSaved ? "fill-current" : ""}`} />
        </button>
      </div>

      {/* Content — fixed vertical rhythm */}
      <div className="p-4 flex flex-col flex-1">
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide min-h-[20px]">{brand}</p>
        <h3 className="text-sm font-semibold text-foreground line-clamp-2 leading-snug min-h-[40px] mt-1">{title}</h3>
        <p className="text-xs text-muted-foreground line-clamp-1 min-h-[20px] mt-1">{specs || "\u00A0"}</p>

        {flashDeal && (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full w-fit mt-1">
            <Zap className="w-3 h-3" /> Flash Deal
          </span>
        )}

        <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${stock.textClass} ${stock.bgClass} px-2 py-0.5 rounded-full w-fit mt-2`}>
          <span className={`w-1.5 h-1.5 ${stock.dotClass} rounded-full`}></span>
          {stock.label}
        </span>

        <div className="mt-auto pt-3">
          {displayPrice !== null && displayPrice !== undefined ? (
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-lg font-bold text-accent">
                {currency} {displayPrice.toLocaleString()}
              </span>
              {originalPrice && (
                <span className="text-xs text-muted-foreground line-through">
                  {currency} {originalPrice.toLocaleString()}
                </span>
              )}
              {unitOfMeasure && (
                <span className="text-xs text-muted-foreground">/ {unitOfMeasure}</span>
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
          <p className="text-xs text-muted-foreground uppercase tracking-wide mt-1">MOQ: {moq} units</p>
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