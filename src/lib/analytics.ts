export type StockState = 'in_stock' | 'low_stock' | 'out_of_stock' | 'backorder' | 'preorder';

interface AnalyticsEvent {
  event: string;
  product_id: string;
  stock_state: StockState;
  properties?: Record<string, any>;
}

export function trackEvent({ event, product_id, stock_state, properties = {} }: AnalyticsEvent) {
  const payload = {
    event,
    product_id,
    stock_state,
    timestamp: new Date().toISOString(),
    ...properties,
  };

  console.log('[IKON Analytics]', JSON.stringify(payload));
}

export function getStockState(product: {
  onhand_qty?: number | null;
  stock_status?: string | null;
  tags?: string[] | null;
}): StockState {
  if (product.tags?.includes('preorder')) return 'preorder';
  if (product.stock_status === 'backorder' || product.tags?.includes('backorder')) return 'backorder';
  if (!product.onhand_qty || product.onhand_qty <= 0) return 'out_of_stock';
  if (product.onhand_qty <= 5) return 'low_stock';
  return 'in_stock';
}

export const STOCK_STATE_CONFIG = {
  in_stock: {
    label: "In Stock",
    dotClass: "bg-emerald-500",
    textClass: "text-emerald-700",
    bgClass: "bg-emerald-50",
    primaryCta: "Add to Cart",
    primaryCtaClass: "bg-accent hover:bg-accent/90 text-accent-foreground",
    shippingMessage: "Ships in 1–2 business days",
  },
  low_stock: {
    label: "Low Stock",
    dotClass: "bg-amber-500 animate-pulse",
    textClass: "text-amber-700",
    bgClass: "bg-amber-50",
    primaryCta: "Add to Cart",
    primaryCtaClass: "bg-accent hover:bg-accent/90 text-accent-foreground",
    shippingMessage: "Ships in 1–2 business days — order now",
  },
  out_of_stock: {
    label: "Out of Stock",
    dotClass: "bg-red-500",
    textClass: "text-red-700",
    bgClass: "bg-red-50",
    primaryCta: "Notify When Available",
    primaryCtaClass: "bg-accent hover:bg-accent/90 text-accent-foreground",
    shippingMessage: "",
  },
  backorder: {
    label: "Available on Backorder",
    dotClass: "bg-blue-500",
    textClass: "text-blue-700",
    bgClass: "bg-blue-50",
    primaryCta: "Backorder Now",
    primaryCtaClass: "bg-blue-600 hover:bg-blue-700 text-white",
    shippingMessage: "Ships when restocked (~2–3 weeks)",
  },
  preorder: {
    label: "Pre-Order",
    dotClass: "bg-purple-500",
    textClass: "text-purple-700",
    bgClass: "bg-purple-50",
    primaryCta: "Pre-Order Now",
    primaryCtaClass: "bg-purple-600 hover:bg-purple-700 text-white",
    shippingMessage: "Ships on launch date",
  },
} as const;
