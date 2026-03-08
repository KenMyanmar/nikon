

# Side-Panel Image Zoom (eBay/Amazon Style)

## What Changes

**Single file**: `src/pages/ProductDetail.tsx`

Replace the in-place `transform: scale(2.5)` zoom with a professional lens + side-panel approach:

### Current (lines 232-266)
- Mouse hover scales the image 2.5x in-place using `transformOrigin`
- Looks cheap, covers the product image

### New Behavior
1. **Main image**: Stays at normal size, shows `cursor: crosshair` on hover
2. **Lens overlay**: A semi-transparent bordered square (~30% of image size) follows the mouse on the main image
3. **Zoom panel**: An absolute-positioned div appears to the RIGHT of the image column (overlaying the specs column), showing a magnified crop at ~3.3x
4. **Mouse leave**: Both lens and panel disappear instantly
5. **Mobile**: Zoom disabled entirely (no hover on touch devices)

### Implementation Details

- Add `LENS_SIZE = 30` constant (percentage of image dimensions)
- Add `imgContainerRef` (rename existing `imgRef`)
- Update `handleImageMouseMove` to clamp coordinates so lens stays within bounds
- Remove the `style` prop from the `<img>` tag (no more in-place transform)
- Add lens overlay div inside the image container (absolute positioned, `pointer-events-none`)
- Add zoom panel div as sibling after image container: `absolute top-0 left-full ml-4`, same height as image, `z-50`, white background with shadow
- Zoom panel shows the same image scaled up with negative `left`/`top` offsets calculated from `zoomPos`
- Wrap zoom elements in a `hidden lg:block` check so mobile users don't see broken zoom
- Keep thumbnail strip unchanged

### Layout Impact
- The image column wrapper gets `relative` positioning (already has it)
- Zoom panel overlays the specs column — no layout shift
- Panel dimensions: `w-[400px] h-full` matching the image container height

