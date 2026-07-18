# Gobber — Design Tokens

Portable spec. All values are standard CSS custom properties in OKLCH; no
framework-specific syntax. Copy into any stack (Tailwind v4, vanilla CSS,
styled-components, CSS Modules).

## 1. Palette — "Amber Clarity"

Warm cream base, amber accent, Apple blue as the interaction primary. Ink is
a warm near-black — never pure #000.

```css
:root {
  /* Neutrals */
  --background:  oklch(0.965 0.028 88);   /* cream       #FAF3E1 */
  --foreground:  oklch(0.180 0.012 55);   /* ink         #1A1614 */
  --card:        oklch(0.985 0.018 88);
  --secondary:   oklch(0.930 0.045 88);   /* paper/sand  #F4E9CA */
  --muted:       oklch(0.930 0.035 85);
  --muted-fg:    oklch(0.520 0.030 60);
  --border:      oklch(0.880 0.030 82 / 0.6);

  /* Brand */
  --primary:     oklch(0.620 0.200 255);  /* apple blue  #0A84FF */
  --accent:      oklch(0.770 0.135 78);   /* amber       #E8A93C */
  --clay:        oklch(0.660 0.115 72);   /* amber deep            */
  --sage:        oklch(0.720 0.055 155);  /* mint accent #7DA88E   */
  --destructive: oklch(0.580 0.190 25);
}
```

Dark mode uses the same hues at lower L; see `src/styles.css` for the full
`[data-theme="dark"]` block.

## 2. Typography

Three families, each with a role. Never use system defaults for headings.

| Role                  | Family              | Weights   | Notes                              |
| --------------------- | ------------------- | --------- | ---------------------------------- |
| Display / UI headers  | **Outfit**          | 500–700   | tracking `-0.035em` on large sizes |
| Editorial / hero      | **Instrument Serif**| 400 italic| used for phrases like "Around you" |
| Body / paragraph      | **Figtree**         | 400–600   | 13–15px UI text, 16–18px body      |

```css
:root {
  --font-display: "Outfit",           ui-sans-serif, system-ui, sans-serif;
  --font-serif:   "Instrument Serif", ui-serif,     Georgia,   serif;
  --font-sans:    "Figtree",          ui-sans-serif, system-ui, sans-serif;
}
```

Loaded via `@fontsource/*` npm packages — no external CDN, no font-loading
flash.

## 3. Radii

```css
:root {
  --radius:      1.25rem;                       /* 20px baseline */
  --radius-sm:   calc(var(--radius) - 4px);
  --radius-md:   calc(var(--radius) - 2px);
  --radius-lg:   var(--radius);
  --radius-xl:   calc(var(--radius) + 4px);
  --radius-2xl:  calc(var(--radius) + 8px);
  --radius-3xl:  calc(var(--radius) + 12px);
}
```

## 4. Shadows — warm, ink-tinted

Never grey. Every shadow uses `rgba(60, 42, 20, ...)` so cards feel like
they sit on paper, not on chrome.

```css
--shadow-glass: 0 1px 2px  rgba(60,42,20,.04), 0 8px 26px -14px rgba(60,42,20,.14);
--shadow-soft:  0 1px 2px  rgba(60,42,20,.04), 0 6px 20px -12px rgba(60,42,20,.10);
--shadow-lift:  0 2px 6px  rgba(60,42,20,.05), 0 20px 50px -24px rgba(60,42,20,.18);
--shadow-float: 0 30px 70px -30px rgba(50,34,15,.28), 0 6px 16px -8px rgba(50,34,15,.10);
```

## 5. Glass — the recurring surface

Used for pins, controls, sheets, bells, and the auth overlay.

```css
.glass {
  background: color-mix(in oklch, var(--card) 72%, transparent);
  backdrop-filter: blur(22px) saturate(140%);
  -webkit-backdrop-filter: blur(22px) saturate(140%);
  border: 1px solid color-mix(in oklch, var(--foreground) 6%, transparent);
  box-shadow: var(--shadow-glass);
  border-radius: var(--radius-2xl);
}
```

Rules:
- Never use glass on top of glass — the second layer flattens the first.
- Always pair glass with `--shadow-glass` or `--shadow-lift`.
- Text on glass uses `--foreground`, never a translucent color.

## 6. Motion

Framer Motion springs, tuned for Apple-like softness.

```ts
export const spring = { type: "spring", stiffness: 380, damping: 32, mass: 0.7 };
export const pop    = { type: "spring", stiffness: 520, damping: 26 };
export const settle = { type: "spring", stiffness: 240, damping: 28 };
```

Guidelines:
- Route transitions: opacity + 4px Y, `settle`. No blur filters.
- Buttons / chips: scale 0.96 on tap with `pop`.
- Sheets: draggable with velocity-aware snap thresholds (see `draggable-sheet.tsx`).

## 7. Iconography

`lucide-react` at `stroke-width: 1.6`. Icons inside glass surfaces use
`--foreground` at 80% opacity.

## 8. Layout scale

```
4  · 8  · 12 · 16 · 20 · 24 · 32 · 40 · 56 · 80  (px)
```

Container max-width: `1200px`. Mobile is the primary target — every layout
must survive 375px width.
