/**
 * Format a number as Myanmar Kyat with thousand separators.
 * Storefront-wide currency display helper.
 */
export const formatMMK = (n: number | string | null | undefined): string => {
  if (n === null || n === undefined || n === "") return "MMK 0";
  const num = typeof n === "string" ? Number(n) : n;
  if (!Number.isFinite(num)) return "MMK 0";
  return `MMK ${num.toLocaleString("en-MM")}`;
};

/**
 * Clean up duplicated PNC numbers and normalize "1 of" prefix in
 * included-accessories strings.
 * Example: "1 of Scraper (PNC 164255) (PNC 164255)" -> "1× Scraper (PNC 164255)"
 */
export const cleanAccessoryText = (s: string): string => {
  if (!s) return s;
  return s
    .replace(/\((PNC \d+)\)\s*\(\1\)/g, "($1)")
    .replace(/^\s*1 of\s+/i, "1× ");
};
