

# Move Promotions Below Category Grid

## Change

### `src/pages/Index.tsx` — Swap lines 17-18

Swap `<PromotionsBanner />` and `<CategoryQuickNav />` so the order becomes:

```
<HeroBannerCarousel />
<CategoryQuickNav />
<PromotionsBanner />
<FlashDealsRow />
...
```

One file, two lines swapped, no other changes.

