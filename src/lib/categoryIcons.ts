/**
 * Category → Lucide icon mapping.
 *
 * Single source of truth for category iconography. Used by:
 *   - CategoryQuickNav (Prompt 2)
 *   - ProductCard image fallback (Prompt 3)
 *
 * Match is case-insensitive and tolerant of common name variants
 * (e.g., "F&B Solutions" → "Food & Beverage").
 */
import {
  UtensilsCrossed,
  Settings,
  ChefHat,
  SprayCan,
  Bed,
  Coffee,
  Flame,
  Soup,
  Armchair,
  WashingMachine,
  Package,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const NAME_MAP: Record<string, LucideIcon> = {
  tableware: UtensilsCrossed,
  "spare parts": Settings,
  "kitchen utensils": ChefHat,
  housekeeping: SprayCan,
  "housekeeping supplies": SprayCan,
  bedroom: Bed,
  "bedroom supplies": Bed,
  "food & beverage": Coffee,
  "f&b solutions": Coffee,
  "food and beverage": Coffee,
  "kitchen services": Flame,
  "food services": Soup,
  "buffet & banquet": Armchair,
  "buffet and banquet": Armchair,
  laundry: WashingMachine,
  "laundry solutions": WashingMachine,
};

/**
 * Resolve a category name (or null/undefined) to a Lucide icon component.
 * Falls back to the generic `Package` icon for unknown / empty categories.
 */
export const getCategoryIcon = (categoryName?: string | null): LucideIcon => {
  if (!categoryName) return Package;
  const key = categoryName.trim().toLowerCase();
  return NAME_MAP[key] ?? Package;
};
