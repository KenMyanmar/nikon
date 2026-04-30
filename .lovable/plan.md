# Palette Reset Commit (pre-Prompt-1)

Standalone commit. Scope: design tokens, neutral shadows, one Contract-violation gradient removal, and memory. No other component edits. No Prompt 1 work bundled.

After this lands, the entire app inherits the Design Contract palette through existing tokens (`bg-primary`, `text-foreground`, `border-border`, `bg-ikon-bg-secondary`, `shadow-card`, etc.) — no grep-and-replace through 100+ files needed.

## Files touched (5)

### 1. `src/index.css` — rewrite `:root` token block (lines 7–56)

```text
--background       0 0% 100%   #FFFFFF
--foreground       0 0% 10%    #1A1A1A
--card             0 0% 100%   #FFFFFF
--popover          0 0% 100%   #FFFFFF
--primary          222 49% 21% #1B2A4E   (navy)
--secondary        0 0% 97%    #F8F8F8   (pure neutral, was tinted lavender)
--muted            0 0% 97%    #F8F8F8
--muted-foreground 0 0% 40%    #666666
--accent           39 73% 45%  #C8941F   (amber, was old #f59e0b-ish)
--destructive      0 72% 51%   #DC2626   (urgency-only)
--border           0 0% 90%    #E5E5E5   (pure neutral, was tinted)
--input            0 0% 90%    #E5E5E5
--ring             222 49% 21% #1B2A4E

--ikon-navy*       repointed to #1B2A4E + tonal variants
--ikon-red*        repointed to #DC2626 + tonal variants (urgency-only role)
--ikon-red-light   becomes pure neutral #F8F8F8 (was pink tint)
--ikon-sale        #DC2626 (urgency-only)
--ikon-text-*      pure greys 10% / 40% / 55%
--ikon-border      #E5E5E5
--ikon-bg-secondary 0 0% 97%   #F8F8F8 (was 240 33% 97% — Contract violation)
--ikon-bg-tertiary  0 0% 94%
--ikon-warning      alias to accent amber
```

Comment header updated to mark these as Contract-authoritative.

### 2. `tailwind.config.ts` — neutralize shadows (lines 97–101)

```text
card        rgba(33,34,101,0.07/0.05)  →  rgba(0,0,0,0.04/0.03)
card-hover  rgba(33,34,101,0.08/0.05)  →  rgba(0,0,0,0.08)
nav         rgba(33,34,101,0.10)        →  rgba(0,0,0,0.06)
```

### 3. `src/components/home/FlashDealsRow.tsx` — line 58, gradient removal

Direct Contract violation (decorative gradient behind content). One-line className change:

```text
from: <section className="py-8 bg-gradient-to-r from-[hsl(var(--accent)/0.05)] to-[hsl(var(--ikon-red-light))]">
to:   <section className="py-8 bg-background">
```

No other edits to FlashDealsRow. Layout, hierarchy, and final background treatment remain untouched and are revisited in Prompt 1.

### 4. `mem://style/color-palette` — replace with Contract-authoritative doc

Hex values, role rules (urgency-only red), forbidden values list, hardcoded-hex cleanup queue, red-audit summary by bucket.

### 5. `mem://index.md` — update Core "Design" line

Replace deprecated palette in Core with Contract values. Add forbidden-hex line.

## Out of scope (deferred to numbered prompts)

- All other component edits.
- MegaMenu Flash Deals red nav buttons → Prompt 4 removes them entirely.
- PromotionsBanner / Promotions / PromotionDetail red badges → ambiguity flagged; awaits user decision before any prompt re-roles them.
- Hardcoded hex offenders in `Footer.tsx`, `Articles.tsx`, `ArticleDetail.tsx`, `Contact.tsx`, `ProductDetail.tsx` line 564 → migrate during the prompt that touches each surface.

## Acceptance test

After commit, the homepage `/` should render with:

- Cards on pure white, no lavender background tint.
- Navy darker and bluer (`#1B2A4E` vs old `#212265`).
- Amber slightly more burnt/ochre (`#C8941F` vs old amber).
- Red slightly more crimson (`#DC2626` vs old `#ED1F24`).
- Borders pure grey, no lavender cast.
- Card shadows neutral grey, no navy bleed.
- Flash Deals row on flat white, no gradient.

Capture 1440×900 desktop + 390×844 mobile screenshots of `/` after commit, post for sign-off.

## Pending decisions before Prompt 1 plan

After this commit lands, two audit calls still needed:

1. PromotionsBanner red flame icon + "X% OFF" badges — keep as urgency, or re-role to amber?
2. Promotions / PromotionDetail "X% OFF" badges — same call.
