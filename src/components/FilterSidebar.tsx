import { useState } from "react";

interface FilterSidebarProps {
  filterLabel?: string;
  filterItems: string[];
  selectedItems: string[];
  onItemsChange: (items: string[]) => void;
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
  filterLabel = "Brand",
  filterItems,
  selectedItems,
  onItemsChange,
  stockFilters,
  onStockChange,
  priceRange,
  onPriceChange,
  maxPrice,
}: FilterSidebarProps) => {
  const [showAll, setShowAll] = useState(false);
  const displayItems = showAll ? filterItems : filterItems.slice(0, 8);

  const toggleItem = (item: string) => {
    onItemsChange(
      selectedItems.includes(item)
        ? selectedItems.filter((i) => i !== item)
        : [...selectedItems, item]
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
      {filterItems.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3">{filterLabel}</h3>
          <div className="space-y-2">
            {displayItems.map((item) => (
              <label key={item} className="flex items-center gap-2 cursor-pointer text-sm">
                <input
                  type="checkbox"
                  checked={selectedItems.includes(item)}
                  onChange={() => toggleItem(item)}
                  className="rounded border-ikon-border text-primary focus:ring-primary"
                />
                <span className="text-ikon-text-secondary">{item}</span>
              </label>
            ))}
            {filterItems.length > 8 && (
              <button
                onClick={() => setShowAll(!showAll)}
                className="text-xs font-semibold text-primary mt-1"
              >
                {showAll ? "Show less" : `Show all (${filterItems.length})`}
              </button>
            )}
          </div>
        </div>
      )}

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
