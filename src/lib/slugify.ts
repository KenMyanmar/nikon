/**
 * Canonical slugify — must match CRM (BusinessTypeEdit.tsx) byte-for-byte.
 * Two steps only: collapse non-alphanumerics to hyphens, then trim.
 * The [^a-z0-9]+ pattern handles `&`, spaces, and every other special char
 * uniformly. Adding a `.replace(/&/g, "")` step would diverge from the CRM
 * and silently 404 rows like "AT&T Lounge" (canonical: at-t-lounge).
 */
export const slugify = (s: string): string =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
