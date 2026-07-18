# Gobber — Scale-Up Plan (inspired by NomadTable)

Goal: turn Gobber from a working prototype into a product that can hold thousands of hosts and travelers per city without design or performance regressions. Keep the Warm Sand / iCloud aesthetic and the "meet strangers in real life" positioning; borrow NomadTable's editorial polish, city-first browsing, trust signals, and host tooling.

---

## 1. Product surface (what to add)

**A. City-first browsing**
- New route `/city/$slug` — editorial city page (hero image, "This week in Lisbon", trending hosts, upcoming gatherings, local guides). Public, SSR, OG image derived from cover photo.
- `/cities` index with a searchable list + counts of active gatherings.
- Discover map keeps the globe view; new "Cities" toggle switches to card grid.

**B. Gathering upgrades**
- Waitlist when spots fill; auto-promote on cancellation.
- Recurring gatherings ("every Thursday") with parent template + generated instances.
- Ticketing tiers (free / donation / paid) — Stripe Connect later phase.
- Post-event: attendance confirmation, mutual reviews (host <> guest), photo album shared to the location chat.

**C. Host trust layer**
- Host verification badge (ID + phone), NomadTable-style host profile with hosting history, response time, cancellation rate.
- "Superhost" tier auto-computed nightly.
- Guest reputation score visible only to hosts.

**D. Discovery & personalization**
- "For you" feed powered by category preferences, follow graph, city history.
- Saved gatherings + saved cities (bell notifies when new ones drop).
- Weekly digest email per followed city.

**E. Communication**
- Read receipts and typing indicators on DMs.
- Voice notes in chat (already have media pipeline).
- Announcements channel inside location chats (host-only posts pinned to top).

**F. Safety**
- Report gathering / report user with triage queue for moderators.
- Rate limits on messaging, follows, and gathering creation.
- Auto-hide content from users blocked by many.

---

## 2. Architecture & scalability

**A. Data layer**
- Move hot list queries to Postgres RPCs (`nearby_activities`, `feed_for_user`) with proper indexes (`activities(city, starts_at)`, `activities USING gist(ll_to_earth(lat,lng))` via earthdistance for radius queries).
- Add `activity_stats` materialized view refreshed every 5 min for city counts / trending sort.
- Partition `notifications` and `messages` by month once volume warrants.
- Introduce soft-delete (`deleted_at`) on user-generated tables instead of hard delete.

**B. Server functions**
- Replace ad-hoc client Supabase calls that fan out (e.g. suggested profiles enrichment, feed assembly) with `createServerFn` handlers that batch + cache.
- Add per-user rate limiting middleware (token bucket in Postgres) reused across create/follow/message.

**C. Storage & media**
- Auto-generate WebP + 3 sizes (thumb 320, card 768, hero 1600) on upload via a server route that pipes through Cloudflare Images or an on-the-fly transform worker.
- Move cover URL persistence from 1-year signed URLs to a signed-URL server fn resolved at read time (cheaper rotation, no leakage).

**D. Realtime**
- Consolidate Supabase Realtime channels: one per conversation, one per user notifications, drop per-row subscriptions.
- Backoff + presence heartbeats to avoid connection storms on mobile.

**E. Caching / frontend**
- Adopt TanStack Query `staleTime` tiers: 30s for feeds, 5m for profiles, 1h for city pages.
- Prefetch on route hover (already partial), add loader `ensureQueryData` for public city + activity pages.
- Route-level code split for host wizard, messaging, and map bundle (Google Maps loaded only on `/discover`, `/explore`, `/activity/*`).

**F. Observability**
- Structured logs from server functions (request id, user id hash, latency).
- Sentry (or equivalent) wired to root error boundary + server fn wrapper.
- Basic product analytics events: gathering_created, rsvp_confirmed, dm_started, city_viewed.

---

## 3. Design system evolution (keep the vibe, scale the language)

- Promote the current one-off styles into tokens: `--glass-surface`, `--glass-border`, `--shadow-soft`, `--shadow-lift`, `--radius-card`, `--radius-pill`.
- Add a `<GlassCard>`, `<GlassButton>`, `<SectionHeader>` (Instrument Serif italic + eyebrow) so pages stop re-declaring the same classes.
- Motion tokens: `--ease-apple: cubic-bezier(0.32, 0.72, 0, 1)` and standard durations (120 / 220 / 420 ms).
- Density variants (compact / cozy) for list-heavy screens when volume grows.
- Dark-mode pass in a single sweep once tokens are unified.

---

## 4. Growth & retention (NomadTable-inspired)

- Public shareable pages with rich OG (`/u/$username`, `/activity/$id`, `/city/$slug`) — each derives OG image from its own cover.
- Referral: "invite 3 travelers, get Superhost trial".
- SEO: sitemap + city landing pages + JSON-LD Event schema on every gathering.
- Onboarding: 3-step postcard flow (pick cities → pick vibes → follow 5 hosts).
- Email lifecycle via Lovable Email: welcome, first-RSVP nudge, weekly city digest, post-event review request.

---

## 5. Rollout order (proposed)

1. Design token consolidation + `<GlassCard>` primitives (unblocks everything visual).
2. Public `/city/$slug` + `/activity/$id` SSR pages with OG — biggest growth lever, low risk.
3. Rate limiting + report/moderation queue — required before opening signup.
4. Waitlist, reviews, host verification — trust layer.
5. Feed personalization RPC + saved gatherings.
6. Media pipeline (WebP + sizes) + realtime consolidation.
7. Paid gatherings (Stripe Connect) + Superhost tier.
8. Email lifecycle + referral.

---

## 6. Technical notes (for the engineer, not required reading)

```text
routes/
  city.$slug.tsx           public SSR, loader → getCity({slug})
  cities.index.tsx         public SSR
  _authenticated/
    saved.tsx              saved gatherings + cities
    host/                  wizard split into steps
    moderation/            admin-only, gated by has_role('moderator')

lib/
  city.functions.ts        getCity, listCities  (public, sb_publishable client)
  feed.functions.ts        feedForUser          (requireSupabaseAuth)
  ratelimit.functions.ts   consumeToken(bucket) shared middleware
  media.functions.ts       signedCoverUrl, transformOnUpload
```

Indexes to add first:
- `activities(city, starts_at desc)`
- `activities(host_id, starts_at desc)`
- `rsvps(user_id, activity_id)`
- `messages(conversation_id, created_at desc)`
- `notifications(user_id, read_at, created_at desc)`

Pick any slice to start and I'll build it end-to-end.
