import { Heart, ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";

interface ProductCardProps {
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
}

const stockConfig = {
  in_stock: { label: "In Stock", dotClass: "bg-emerald-500", textClass: "text-emerald-700", bgClass: "bg-emerald-50" },
  low_stock: { label: "Low Stock", dotClass: "bg-amber-500", textClass: "text-amber-700", bgClass: "bg-amber-50" },
  out_of_stock: { label: "Out of Stock", dotClass: "bg-red-500", textClass: "text-red-700", bgClass: "bg-red-50" },
};

const brandInitialColors = [
  "bg-primary/10 text-primary",
  "bg-accent/10 text-accent",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-sky-100 text-sky-700",
  "bg-violet-100 text-violet-700",
];

const getBrandColor = (brand: string) => {
  const index = brand.charCodeAt(0) % brandInitialColors.length;
  return brandInitialColors[index];
};

const ProductCard = ({ image, title, brand, specs, price, currency = "MMK", moq, stockStatus, sku, slug }: ProductCardProps) => {
  const stock = stockConfig[stockStatus] || stockConfig.in_stock;
  const isPlaceholder = !image || image === "/placeholder.svg";

  return (
    <Link to={`/product/${slug}`} className="bg-card rounded-card shadow-card hover:shadow-card-hover transition-all duration-250 overflow-hidden group cursor-pointer block">
      {/* Image */}
      <div className="relative aspect-square bg-muted/30 overflow-hidden">
        {isPlaceholder ? (
          <div className={`w-full h-full flex flex-col items-center justify-center gap-2 ${getBrandColor(brand)}`}>
            <span className="text-4xl font-bold opacity-60">{brand?.charAt(0) || "?"}</span>
            <span className="text-xs font-medium opacity-50 px-4 text-center line-clamp-2">{brand}</span>
          </div>
        ) : (
          <img
            src={image}
            alt={title}
            className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        )}
        <button
          className="absolute top-3 right-3 p-2 rounded-full bg-card/80 hover:bg-card text-muted-foreground hover:text-accent transition opacity-0 group-hover:opacity-100"
          onClick={(e) => e.preventDefault()}
        >
          <Heart className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-2">
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{brand}</p>
        <h3 className="text-sm font-semibold text-foreground line-clamp-2 leading-snug">{title}</h3>
        {specs && <p className="text-xs text-muted-foreground line-clamp-1">{specs}</p>}

        <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${stock.textClass} ${stock.bgClass} px-2 py-0.5 rounded-full`}>
          <span className={`w-1.5 h-1.5 ${stock.dotClass} rounded-full`}></span>
          {stock.label}
        </span>

        <div>
          {price !== null && price !== undefined ? (
            <span className="text-lg font-bold text-accent">{currency} {price.toLocaleString()}</span>
          ) : (
            <span className="text-sm font-semibold text-primary">Request Quote</span>
          )}
        </div>

        {moq && moq > 1 && (
          <p className="text-xs text-muted-foreground uppercase tracking-wide">MOQ: {moq} units</p>
        )}

        <button
          className="w-full mt-2 bg-accent hover:bg-accent/90 text-accent-foreground font-semibold py-2.5 rounded-button transition-all text-sm active:scale-[0.98] flex items-center justify-center gap-2"
          onClick={(e) => e.preventDefault()}
        >
          <ShoppingCart className="w-4 h-4" />
          Add to Cart
        </button>
      </div>
    </Link>
  );
};

export default ProductCard;