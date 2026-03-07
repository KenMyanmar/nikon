import { useState } from "react";

interface FilterSidebarProps {
  brands: string[];
  selectedBrands: string[];
  onBrandsChange: (brands: string[]) => void;
  stockFilters: string[];
  onStockChange: (filters: string[]) => void;
  priceRange: [number, number];
  onPriceChange: (range: [number, number]) => void;
  maxPrice: number;
}

const stockOptions = [
  { value: "in_stock", label: "In Stock" },
  { value: "low_stock", label: "Low Stock" },
  { value: "out_of_stock", label: "Out of Stock" },
];

const FilterSidebar = ({
  brands,
  selectedBrands,
  onBrandsChange,
  stockFilters,
  onStockChange,
  priceRange,
  onPriceChange,
  maxPrice,
}: FilterSidebarProps) => {
  const [showAllBrands, setShowAllBrands] = useState(false);
  const displayBrands = showAllBrands ? brands : brands.slice(0, 8);

  const toggleBrand = (brand: string) => {
    onBrandsChange(
      selectedBrands.includes(brand)
        ? selectedBrands.filter((b) => b !== brand)
        : [...selectedBrands, brand]
    );
  };

  const toggleStock = (val: string) => {
    onStockChange(
      stockFilters.includes(val)
        ? stockFilters.filter((s) => s !== val)
        : [...stockFilters, val]
    );
  };

  return (
    <aside className="space-y-6">
      {/* Brands */}
      {brands.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3">Brand</h3>
          <div className="space-y-2">
            {displayBrands.map((brand) => (
              <label key={brand} className="flex items-center gap-2 cursor-pointer text-sm">
                <input
                  type="checkbox"
                  checked={selectedBrands.includes(brand)}
                  onChange={() => toggleBrand(brand)}
                  className="rounded border-ikon-border text-primary focus:ring-primary"
                />
                <span className="text-ikon-text-secondary">{brand}</span>
              </label>
            ))}
            {brands.length > 8 && (
              <button
                onClick={() => setShowAllBrands(!showAllBrands)}
                className="text-xs font-semibold text-primary mt-1"
              >
                {showAllBrands ? "Show less" : `Show all (${brands.length})`}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Stock Status */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3">Availability</h3>
        <div className="space-y-2">
          {stockOptions.map((opt) => (
            <label key={opt.value} className="flex items-center gap-2 cursor-pointer text-sm">
              <input
                type="checkbox"
                checked={stockFilters.includes(opt.value)}
                onChange={() => toggleStock(opt.value)}
                className="rounded border-ikon-border text-primary focus:ring-primary"
              />
              <span className="text-ikon-text-secondary">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      {maxPrice > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3">Price Range (MMK)</h3>
          <div className="flex gap-2 items-center">
            <input
              type="number"
              value={priceRange[0]}
              onChange={(e) => onPriceChange([Number(e.target.value), priceRange[1]])}
              className="w-full border border-ikon-border rounded px-2 py-1.5 text-sm bg-card"
              placeholder="Min"
            />
            <span className="text-ikon-text-tertiary">–</span>
            <input
              type="number"
              value={priceRange[1] || ""}
              onChange={(e) => onPriceChange([priceRange[0], Number(e.target.value)])}
              className="w-full border border-ikon-border rounded px-2 py-1.5 text-sm bg-card"
              placeholder="Max"
            />
          </div>
        </div>
      )}
    </aside>
  );
};

export default FilterSidebar;
