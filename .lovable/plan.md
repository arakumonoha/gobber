# NomadTable — Build Plan

A mobile-first social app that connects strangers to travel or hang out in real life, browsed through a premium Apple-style satellite map with elegant activity cards floating over locations worldwide.

## Concept

- Discover activities happening around the globe on a cinematic satellite map
- Tap a pin → activity detail with host, time, spots left, vibe tags
- RSVP to join, or host your own gathering
- Simple profile with trips joined, cities visited, mutual travelers

## Visual Direction

- **Palette:** Warm Sand — `#faf8f5` bg, `#f0ebe3` surfaces, `#c9b99a` accent, `#8b7355` primary/ink. Warm, wanderlust, premium.
- **Type:** Outfit (display, tight tracking) + Figtree (body).
- **Feel:** Apple-inspired large-title headers, generous whitespace, soft shadows, frosted-glass overlays on top of satellite imagery, smooth spring animations (framer-motion).
- **Map:** Mapbox GL JS with `satellite-streets-v12` style, custom warm-sand overlay, hand-crafted pins, smooth `flyTo` camera animations, bottom-sheet activity cards that snap Apple-style.

## Screens (Mobile-first)

1. **Onboarding / Auth** — email + password and Google sign-in, single-screen with hero satellite globe backdrop.
2. **Discover (Home)** — full-screen satellite map, floating search "Where to?", horizontal category chips (Dinner, Hike, Nightlife, Coworking, Coffee), pins clustered by city, bottom sheet listing nearby activities.
3. **Activity Detail** — hero cover photo, large title, host card, date/time, location, spots left, attendee avatars, RSVP button.
4. **Host an Activity** — 3-step form (what/where/when), map pin picker.
5. **My Trips** — upcoming + past activities, tabs.
6. **Profile** — avatar, bio, cities visited counter, badges, edit/settings, sign out.

## Data Model (Lovable Cloud)

- `profiles` — id (FK auth.users), display_name, avatar_url, bio, home_city
- `activities` — id, host_id, title, description, category, cover_url, lat, lng, city, country, starts_at, max_spots, created_at
- `rsvps` — id, activity_id, user_id, status, created_at (unique on activity_id+user_id)
- `user_roles` + `has_role()` (standard pattern) for future moderation
- RLS: profiles readable by all authed, editable by owner; activities readable by all authed, editable by host; rsvps readable by activity host and the rsvper, insertable by self.

## Tech

- TanStack Start routes: `/auth`, `/_authenticated/` (discover index, `/activity/$id`, `/host`, `/trips`, `/profile`)
- Mapbox GL JS via Mapbox connector (public token in browser for map, secret token server-side for geocoding "Where to?" search)
- Lovable Cloud for auth + Postgres + storage (activity cover photos, avatars)
- framer-motion for bottom-sheet, page transitions, pin drop animations
- shadcn/ui customized to warm-sand tokens defined in `src/styles.css`

## Build Order

1. Enable Lovable Cloud, connect Mapbox, seed design tokens + fonts, root layout.
2. Auth (email/password + Google) with `profiles` table + trigger.
3. Map-based Discover screen with sample activities + bottom sheet.
4. Activity detail + RSVP.
5. Host activity flow.
6. My Trips + Profile.
7. Polish: animations, empty states, loading skeletons, SEO metadata per route.

## Out of Scope (v1)

- Real-time chat between attendees
- Payments / paid events
- Push notifications
- Verification / ID checks

Ready to build when you approve.