

# Fix Related Products Card Sizing

## Root Cause
Each card wrapper has `min-w-[220px]` but no `max-w` constraint. In a `flex` container without explicit growth limits, if there are only 1-3 related products, the cards expand to fill the full `lg:col-span-2` width (~600px each instead of ~220-260px).

## Fix in `src/pages/ProductDetail.tsx` (line 955)

Add `max-w-[260px]` to each card wrapper to cap card width:

```
min-w-[220px] md:min-w-[260px] max-w-[260px] flex-shrink-0
```

This ensures cards stay compact regardless of how many related products exist. The horizontal scroll still works when there are many products, and cards stay card-sized when there are few.

Single line change, no other files affected.

