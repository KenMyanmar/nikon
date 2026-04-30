/**
 * ProductCard — Canonical product card (Prompt 3 lock).
 *
 * Single source of truth across all product surfaces. Three variants:
 *   - default  — grids, horizontal rails (Best Sellers, New Arrivals, Category, Search, Brand, Saved)
 *   - compact  — narrow rails (Recommendations); reduced padding, no specs/brand line
 *   - flash    — Flash Deals row; compact + flash price block + sold progress
 *
 * Design Contract compliance:
 *   - Card: bg-card, 1px border, 8px radius, NO resting shadow, NO translate on hover
 *   - Hover: border-primary/30 only (border-color change is the entire affordance)
 *   - Image: aspect-square, bg-muted, object-contain, p-4 / p-3 (compact|flash)
 *   - Image fallback: category Lucide icon, 48px, text-muted-foreground on bg-muted
 *   - Badges (allowlist only): -{N}%, "Low stock", "Out of stock"
 *   - Stock pill: silent for in_stock; renders only for low/out
 *   - Price: MMK {n.toLocaleString()}, text-accent text-base font-semibold
 *   - CTA: full-width "Add to Cart" (accent) OR "Request Quote" (primary) when price null
 *   - Heart-save: top-right, 18px, strokeWidth 1.75, outline default / filled navy when saved
 *                 NOT red (red is urgency-only). 40×40 touch target. No animation. No toast.
 *
 * Forbidden (enforced by code review, not runtime):
 *   - resting shadows, hover translate, image scale on hover, fake review stars,
 *     fake compare-at strike-throughs, "Save MMK X,XXX" labels, hover overlays,
 *     Quick View, raw hex, emerald/amber stock palettes, "Best Seller" / "Bulk Order" /
 *     "Almost Gone!" / "Only N left!" badges, category bottom-pill, "Image Coming Soon"
 *     text, brand-logo ghost watermark fallback, red-filled heart, animated badges.
 */
import { Heart, ShoppingCart, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAddToCart } from "@/hooks/useCart";
import { useAuthContext } from "@/contexts/AuthContext";
import { useMarketingData } from "@/hooks/useMarketingData";
import { useSavedProductIds, useToggleSave } from "@/hooks/useSavedItems";
import { getCategoryIcon } from "@/lib/categoryIcons";
import { cn } from "@/lib/utils";

type Variant = "default" | "compact" | "flash";

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
  /** Retained for API compatibility — no longer rendered as fallback (Prompt 3 lock). */
  brandLogo?: string | null;
  variant?: Variant;
  /** Flash variant only: for sold-progress bar. */
  flashSoldCount?: number;
  flashStockLimit?: number;
}

const ProductCard = ({
  id,
  image,
  title,
  brand,
  specs,
  price,
  currency = "MMK",
  moq,
  stockStatus,
  slug,
  categoryId,
  brandId,
  onhandQty,
  unitOfMeasure,
  categoryName,
  variant = "default",
  flashSoldCount,
  flashStockLimit,
}: ProductCardProps) => {
  const isCompact = variant === "compact" || variant === "flash";
  const isFlash = variant === "flash";

  const { addToCart, isAdding } = useAddToCart();
  const { user, openAuthModal } = useAuthContext();
  const navigate = useNavigate();
  const { getFlashDeal, getPromotion } = useMarketingData();
  const { savedIds } = useSavedProductIds();
  const { toggleSave, isPending: isSaving } = useToggleSave();
  const isSaved = id ? savedIds.has(id) : false;

  const [imgFailed, setImgFailed] = useState(false);
  const isPlaceholder = !image || image === "/placeholder.svg" || imgFailed;

  const flashDeal = id ? getFlashDeal(id) : undefined;
  const promotion = id ? getPromotion(id, categoryId, brandId) : undefined;

  // Derive display price + original price (real promotions only)
  let displayPrice = price;
  let originalPrice: number | null = null;
  let discountPct: number | null = null;

  if (flashDeal) {
    displayPrice = Number(flashDeal.flash_price);
    originalPrice = Number(flashDeal.original_price);
    discountPct =
      flashDeal.discount_percentage ||
      (flashDeal.original_price
        ? Math.round((1 - flashDeal.flash_price / flashDeal.original_price) * 100)
        : null);
  } else if (promotion && price !== null && price > 0) {
    if (promotion.type === "percentage" && promotion.discount_value) {
      let discounted = price * (1 - promotion.discount_value / 100);
      if (promotion.max_discount_amount && promotion.max_discount_amount > 0) {
        discounted = Math.max(discounted, price - promotion.max_discount_amount);
      }
      displayPrice = Math.round(discounted);
      originalPrice = price;
      discountPct = promotion.discount_value;
    } else if (promotion.type === "fixed_amount" && promotion.discount_value) {
      displayPrice = Math.round(price - promotion.discount_value);
      originalPrice = price;
      discountPct = Math.round((promotion.discount_value / price) * 100);
    }
  }

  const linkTarget = slug || id;
  const CategoryIcon = getCategoryIcon(categoryName);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (id) addToCart(id, moq || 1, title);
  };

  const handleRequestQuote = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      openAuthModal();
      return;
    }
    if (id) navigate(`/request-quote?product=${id}`);
  };

  const handleToggleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (id) toggleSave(id, isSaved);
  };

  // Flash deal sold-progress (flash variant)
  const soldPct =
    isFlash && flashStockLimit
      ? Math.min(((flashSoldCount || 0) / flashStockLimit) * 100, 100)
      : 0;

  return (
    <Link
      to={linkTarget ? `/product/${linkTarget}` : "#"}
      className={cn(
        // Card chrome — Contract: white, 1px border, 8px radius, no resting shadow, no translate
        "group relative flex h-full flex-col overflow-hidden rounded-card border border-border bg-card",
        "transition-colors duration-150 hover:border-primary/30",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
      )}
    >
      {/* Image frame */}
      <div className="relative aspect-square overflow-hidden bg-muted">
        {isPlaceholder ? (
          <div className="flex h-full w-full items-center justify-center">
            <CategoryIcon
              className="h-12 w-12 text-muted-foreground"
              strokeWidth={1.5}
              aria-hidden="true"
            />
          </div>
        ) : (
          <img
            src={image}
            alt={title}
            className={cn("h-full w-full object-contain", isCompact ? "p-3" : "p-4")}
            loading="lazy"
            onError={() => setImgFailed(true)}
          />
        )}

        {/* Discount badge — urgency red, real promo only */}
        {discountPct !== null && discountPct > 0 && (
          <span
            className={cn(
              "absolute left-2 top-2 rounded-full bg-destructive px-2 py-0.5 font-semibold text-destructive-foreground",
              isCompact ? "text-[10px]" : "text-xs",
            )}
          >
            -{discountPct}%
          </span>
        )}

        {/* Heart-save — locked spec:
            top-right, 12px inset, 18px outline default / filled navy when saved.
            40×40 invisible touch target. No background. No animation. */}
        {id && (
          <button
            type="button"
            role="button"
            onClick={handleToggleSave}
            disabled={isSaving}
            aria-label={isSaved ? `Remove ${title} from saved` : `Save ${title}`}
            aria-pressed={isSaved}
            className={cn(
              "absolute right-3 top-3 inline-flex h-10 w-10 items-center justify-center -m-2.5",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-sm",
              "disabled:opacity-60",
            )}
          >
            <Heart
              size={18}
              strokeWidth={1.75}
              className={cn(
                "transition-colors",
                isSaved
                  ? "fill-primary text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            />
          </button>
        )}
      </div>

      {/* Content — fixed vertical rhythm so cards align in grids */}
      <div
        className={cn(
          "flex flex-1 flex-col",
          isCompact ? "p-3" : "p-4",
        )}
      >
        {!isCompact && (
          <p className="min-h-[20px] text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {brand}
          </p>
        )}

        <h3
          className={cn(
            "line-clamp-2 leading-snug text-foreground",
            isCompact ? "text-xs font-medium min-h-[32px]" : "text-sm font-semibold mt-1 min-h-[40px]",
          )}
        >
          {title}
        </h3>

        {!isCompact && (
          <p className="mt-1 line-clamp-1 min-h-[20px] text-xs text-muted-foreground">
            {specs || "\u00A0"}
          </p>
        )}

        {/* Stock pill — silent for in_stock; renders only for low/out (Contract: red is urgency-only) */}
        {stockStatus === "low_stock" && (
          <span className="mt-2 inline-flex w-fit items-center gap-1.5 rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
            <span className="h-1.5 w-1.5 rounded-full bg-destructive" aria-hidden="true" />
            Low stock
          </span>
        )}
        {stockStatus === "out_of_stock" && (
          <span className="mt-2 inline-flex w-fit items-center gap-1.5 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" aria-hidden="true" />
            Out of stock
          </span>
        )}

        {/* Flash sold-progress bar (flash variant only) */}
        {isFlash && flashStockLimit ? (
          <div className="mt-2">
            <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-destructive transition-all"
                style={{ width: `${soldPct}%` }}
              />
            </div>
            <p className="mt-1 text-[10px] text-muted-foreground">
              {flashSoldCount || 0}/{flashStockLimit} sold
            </p>
          </div>
        ) : null}

        {/* Price */}
        <div className="mt-auto pt-3">
          {displayPrice !== null && displayPrice !== undefined ? (
            <div className="flex flex-wrap items-baseline gap-2">
              <span
                className={cn(
                  "font-semibold text-accent",
                  isCompact ? "text-sm" : "text-base",
                )}
              >
                {currency} {displayPrice.toLocaleString()}
              </span>
              {originalPrice !== null && originalPrice > displayPrice && (
                <span className="text-xs text-muted-foreground line-through">
                  {currency} {originalPrice.toLocaleString()}
                </span>
              )}
              {!isCompact && unitOfMeasure && (
                <span className="text-xs text-muted-foreground">/ {unitOfMeasure}</span>
              )}
            </div>
          ) : (
            <span className="text-sm font-medium text-muted-foreground">Price on request</span>
          )}
        </div>

        {!isCompact && moq && moq > 1 && (
          <p className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">
            MOQ: {moq} units
          </p>
        )}

        {/* CTA fork */}
        {displayPrice !== null && displayPrice !== undefined ? (
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isAdding || stockStatus === "out_of_stock"}
            className={cn(
              "mt-2 flex w-full items-center justify-center gap-2 rounded-button bg-accent font-semibold text-accent-foreground transition-colors",
              "hover:bg-accent/90 active:scale-[0.99] disabled:opacity-60",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
              isCompact ? "h-9 text-xs" : "h-11 text-sm",
            )}
          >
            {isAdding ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ShoppingCart className="h-4 w-4" strokeWidth={1.75} />
            )}
            Add to Cart
          </button>
        ) : (
          <button
            type="button"
            onClick={handleRequestQuote}
            className={cn(
              "mt-2 flex w-full items-center justify-center gap-2 rounded-button bg-primary font-semibold text-primary-foreground transition-colors",
              "hover:bg-primary/90 active:scale-[0.99]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
              isCompact ? "h-9 text-xs" : "h-11 text-sm",
            )}
          >
            Request Quote
          </button>
        )}
      </div>
    </Link>
  );
};

export default ProductCard;
