# Gobber — Design System

Gobber is a social hangout app for meeting strangers around the world. The visual language is **Apple‑minimal, warm, and editorial** — a cross between Apple Maps / iCloud and a small editorial magazine. Never generic AI aesthetics: no purple gradients on white, no default Inter.

---

## 1. Brand

- **Name:** Gobber (never "NomadTable").
- **Tone:** Warm, quiet, premium, human. Editorial pauses, generous white space, precise typography.
- **Reference visuals:** Apple Maps satellite view, iCloud.com sign‑in, Apple Weather glass cards, small print magazines.

---

## 2. Palette — "Amber Clarity"

Semantic tokens live in `src/styles.css` under `:root` (light) and `.dark`. All values are OKLCH; **never** hardcode hex/tailwind colors like `bg-white`, `text-black`.

| Token              | Light (OKLCH)              | Role                             |
| ------------------ | -------------------------- | -------------------------------- |
| `--background`     | `oklch(0.965 0.028 88)`    | Cream page (`#FAF3E1`)           |
| `--foreground`     | `oklch(0.18 0.012 55)`     | Deep ink                         |
| `--card`           | `oklch(0.985 0.018 88)`    | Ivory card                       |
| `--primary`        | `oklch(0.62 0.20 255)`     | Apple blue `#0A84FF` — CTAs      |
| `--secondary`      | `oklch(0.93 0.045 88)`     | Paper `#F4E9CA`                  |
| `--muted`          | `oklch(0.93 0.035 85)`     | Muted surfaces                   |
| `--muted-foreground` | `oklch(0.52 0.03 60)`    | Secondary text                   |
| `--accent`         | `oklch(0.77 0.135 78)`     | Amber `#E8A93C` — highlights     |
| `--clay`           | `oklch(0.66 0.115 72)`     | Deep amber — icons on glass      |
| `--sage`           | `oklch(0.72 0.055 155)`    | Wellness / nature accent         |
| `--apple-blue`     | `oklch(0.62 0.20 255)`     | Alias for primary                |
| `--destructive`    | `oklch(0.58 0.19 25)`      | Warnings                         |
| `--ring`           | `oklch(0.62 0.20 255)`     | Focus ring                       |

Dark mode is a warm charcoal (`oklch(0.18 0.015 60)`) with amber primary rather than apple blue — currently opt‑in via a `.dark` class.

**Usage rule:** always reference through Tailwind utilities generated from `@theme inline` (`bg-background`, `text-foreground`, `bg-primary`, `text-accent`, `border-border`, …). Never write `bg-[#FAF3E1]` in a component.

---

## 3. Typography

Three families, loaded via `@fontsource/*` in `src/styles.css`:

| Token           | Family              | Use                                          |
| --------------- | ------------------- | -------------------------------------------- |
| `--font-display`| **Outfit**          | Product headings, nav, buttons               |
| `--font-sans`   | **Figtree**         | Body copy, UI labels, chat text              |
| `--font-serif`  | **Instrument Serif**| Editorial hero words (italic), section leads |

Rules:

- All `h1–h5` default to display font with `letter-spacing: -0.022em`.
- Hero + landing‑page emotional words use the `serif-hero` utility (italic Instrument Serif, tracking `-0.03em`, line-height `0.98`).
- Body uses Figtree at 15–17px, tracking `-0.01em`.
- OpenType features enabled globally: `ss01`, `cv11`.
- Never introduce Inter, Poppins, Roboto, Montserrat.

---

## 4. Radius & Elevation

`--radius: 1.25rem` (20px). Radius scale in `@theme inline`:

```
sm  = radius − 4px   md = radius − 2px   lg = radius
xl  = radius + 4px   2xl = +8px          3xl = +12px   4xl = +16px
```

Shadows are warm (brown‑tinted), never neutral grey:

| Token             | Purpose                       |
| ----------------- | ----------------------------- |
| `--shadow-glass`  | Ambient glass surfaces        |
| `--shadow-soft`   | Cards resting on page         |
| `--shadow-lift`   | Interactive lift on hover     |
| `--shadow-float`  | Floating sheets, modals, FABs |

All use `rgba(60, 42, 20, …)` tints for a warm, sun‑lit feel.

---

## 5. Liquid Glass System

The Apple‑style glass is a shared recipe with three densities. Ivory→sand fill, hairline white ring, inner top highlight, warm drop shadow — so glass surfaces read as a family.

| Utility        | Blur          | Where used                              |
| -------------- | ------------- | --------------------------------------- |
| `glass`        | 22px          | Bells, floating nav, toggles            |
| `glass-panel`  | 26px          | Sheets, modals, large cards             |
| `glass-chip`   | 16px          | Chips, pills, tiny toggles              |
| `glass-dark`   | 24px, warm‑dark | Inverse surfaces on satellite maps    |

Never hand‑roll `backdrop-blur-xl bg-white/70` in a component — use these utilities so blur, ring, and shadow stay consistent.

---

## 6. Motion

- **Library:** `framer-motion`.
- **Curve:** stiff springs (`stiffness ≈ 260–340`, `damping ≈ 22–30`) with tiny distances (2–8 px). No long slides.
- **Rules:**
  - One hero animation per page beats scattered micro‑interactions.
  - Route transitions use `AnimatePresence mode="popLayout"` with opacity+2px translate. **No blur filters** during transitions — costly on mobile.
  - Respect `prefers-reduced-motion` (already wired: durations collapse to 0.001ms).
  - iMessage bubble grouping and timestamp separators (15‑minute gap) are part of motion polish for chat.

---

## 7. Layout Patterns

- **Bottom navigation** (`src/components/bottom-nav.tsx`): floating glass pill with a sliding highlight; symmetric spacing across 4 tabs.
- **Top‑right controls:** Notification bell and Message bell live side‑by‑side, both `glass` circular buttons.
- **Draggable sheets** (`src/components/draggable-sheet.tsx`): velocity‑aware snapping to three heights.
- **Map controls:** all overlays are glass; segmented map‑type toggle mirrors Apple Maps.
- **Profile:** stats (Following / Followers / Cities) directly under the avatar; friends panel first, edit profile collapsed.
- **Symmetry:** every floating control has a counterpart on the opposite side of the screen (FAB top‑left ↔ bells top‑right).

---

## 8. Iconography & Emoji

- Icons: **lucide-react**, stroke `1.75`, rounded caps.
- Category pins use amber `clay` fill on glass with a 1px white inner ring.
- Country flags are real emoji, never illustrated — used sparingly for atmosphere on the landing hero.

---

## 9. Backend & Content Rules That Shape the UI

- **One active pin per host** — enforce visually with the FAB switching to "Edit gathering" when the user already has an active event.
- **24h maximum gathering duration** — the create sheet clamps `duration_hours` ∈ [1, 24].
- **Mutual‑follow gate on DMs** — the "Message" button only appears on `@username` profiles where `is_mutual = true`.
- **Location chats auto‑dissolve 2 days after event** — surfaced as a small "expires in Xd" hint in the chat header.
- **Blocked users** — hidden from search, suggestions, and DM inbox; managed under Friends → Blocked.

---

## 10. Do / Don't

**Do**
- Use semantic tokens and glass utilities.
- Pair Instrument Serif italic with Outfit / Figtree for editorial contrast.
- Keep shadows warm and blur consistent across surfaces.
- Prefer one bold hero moment over many micro‑interactions.

**Don't**
- Hardcode colors, fonts, or shadows in components.
- Introduce purple/indigo gradients or default Inter.
- Add blur filters to route transitions.
- Reintroduce the name "NomadTable" anywhere.

---

See also:
- [`docs/DATABASE.md`](./DATABASE.md) — full SQL schema, RLS, triggers, cron.
- [`docs/CODEBASE.md`](./CODEBASE.md) — every source file inlined.
