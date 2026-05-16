# Business Type Landing — grouping investigation

## Finding: the fix is already in the repo

`src/pages/BusinessTypeLandingPage.tsx` (lines 96–115) already renders the nested structure exactly as the spec requests:

```tsx
<div className="space-y-8">
  {groups.map((group) => (
    <section key={group.parent.id}>
      <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-4">
        {group.parent.name}
      </h2>
      <div className="flex flex-wrap gap-2">
        {group.items.map((sub) => (
          <Link to={`/category/${sub.slug}`} className={CHIP_CLASSES}>
            {sub.name}
          </Link>
        ))}
      </div>
    </section>
  ))}
</div>
```

The hook `useBusinessTypeLanding` returns the correct shape, and I verified the DB data for Hotel: 28 active mappings under 9 depth-0 parents (Bedroom Supplies, Buffet & Banquet, F&B Solutions, Kitchen Services, Tableware, Housekeeping Supplies, Kitchen Utensils, Food Services, Laundry Solutions) — matches the expected acceptance list exactly, including counts and order.

## Why ucogold.com still shows flat

The live custom-domain build is stale. The current preview build already has the grouped layout. To push to `ucogold.com`, click **Publish → Update** in the top-right of the editor.

## Recommendation

1. Hard-refresh the **preview** (`id-preview--…lovable.app/business/hotel`) to confirm 9 group headings render.
2. If preview is correct → click **Publish → Update** to ship to ucogold.com.
3. If preview is also flat → I'll add a `console.log(data.groups)` and debug the hook (but DB shape says it should work).

No file edits planned. If preview confirms the bug is gone, this plan resolves as a publish action only.
