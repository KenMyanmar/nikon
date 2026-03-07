import { Heart } from "lucide-react";

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
}

const stockConfig = {
  in_stock: { label: "In Stock", dotClass: "bg-emerald-500", textClass: "text-emerald-700", bgClass: "bg-emerald-50" },
  low_stock: { label: "Low Stock", dotClass: "bg-amber-500", textClass: "text-amber-700", bgClass: "bg-amber-50" },
  out_of_stock: { label: "Out of Stock", dotClass: "bg-red-500", textClass: "text-red-700", bgClass: "bg-red-50" },
};

const ProductCard = ({ image, title, brand, specs, price, currency = "MMK", moq, stockStatus, sku }: ProductCardProps) => {
  const stock = stockConfig[stockStatus];

  return (
    <div className="bg-card rounded-card shadow-card hover:shadow-card-hover transition-all duration-250 overflow-hidden group cursor-pointer">
      {/* Image */}
      <div className="relative aspect-square bg-card overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        <button className="absolute top-3 right-3 p-2 rounded-full bg-card/80 hover:bg-card text-ikon-text-tertiary hover:text-accent transition opacity-0 group-hover:opacity-100">
          <Heart className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-2">
        <p className="text-xs text-ikon-text-tertiary">{brand}</p>
        <h3 className="text-sm font-semibold text-foreground line-clamp-2 leading-snug">{title}</h3>
        {specs && <p className="text-xs text-ikon-text-tertiary line-clamp-1">{specs}</p>}

        <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${stock.textClass} ${stock.bgClass} px-2 py-0.5 rounded-full`}>
          <span className={`w-1.5 h-1.5 ${stock.dotClass} rounded-full`}></span>
          {stock.label}
        </span>

        <div>
          {price !== null ? (
            <span className="text-lg font-bold text-accent">{currency} {price.toLocaleString()}</span>
          ) : (
            <span className="text-sm font-semibold text-primary">Request Quote</span>
          )}
        </div>

        {moq && moq > 1 && (
          <p className="text-xs text-ikon-text-tertiary uppercase tracking-wide">MOQ: {moq} units</p>
        )}

        <button className="w-full mt-2 bg-accent hover:bg-ikon-red-dark text-accent-foreground font-semibold py-2.5 rounded-button transition-all text-sm active:scale-[0.98]">
          Add to Cart
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
