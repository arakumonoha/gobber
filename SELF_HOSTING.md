# Self-Hosting Gobber

Everything in this repo is portable. There is no Lovable-only runtime — the
stack is TanStack Start v1 (Vite 7 + React 19) on the frontend and a stock
Supabase project (Postgres + GoTrue + Storage + PostgREST) on the backend.
Host it wherever you like.

Companion docs (all standard formats, no proprietary schemas):

- [`docs/SCHEMA.sql`](docs/SCHEMA.sql) — full Postgres schema, RLS, triggers.
- [`docs/DESIGN_TOKENS.md`](docs/DESIGN_TOKENS.md) — palette, type, glass, motion.
- [`docs/API.md`](docs/API.md) — every server function + REST surface.
- [`docs/USER_DATA_MODEL.md`](docs/USER_DATA_MODEL.md) — auth flow + data ownership.
- [`.env.example`](.env.example) — environment template.

---

## 1. Prerequisites

| Tool             | Version                                             |
| ---------------- | --------------------------------------------------- |
| Node.js          | 20 LTS+                                             |
| Bun (or pnpm/npm)| latest                                              |
| Supabase project | free tier is fine — or self-hosted Supabase / OSS   |
| Google Cloud     | Maps JavaScript API + Places API enabled            |

## 2. Provision the backend

1. Create a new Supabase project (or spin up self-hosted Supabase via Docker).
2. Run `docs/SCHEMA.sql` against it — SQL editor, or:
   ```bash
   psql "$SUPABASE_DB_URL" -f docs/SCHEMA.sql
   ```
   This creates every table, RLS policy, trigger, RPC, and grant.
3. **Storage**: create a private bucket named `chat-media`.
4. **Auth → Providers**: enable Email, Google, Apple. Add your final domain
   to *Redirect URLs* (`https://your-domain/*`).
5. **Auth → URL Configuration**: set Site URL to your final domain.
6. (Optional) **pg_cron** for expired-chat cleanup — see the bottom of
   `docs/SCHEMA.sql`.

## 3. Configure environment

Copy `.env.example` → `.env` and fill in the values from your Supabase
project (Settings → API) and Google Cloud console.

## 4. Install & run

```bash
bun install         # or npm / pnpm install
bun run dev         # local dev on :5173
bun run build       # production build → .output/
```

The build emits a standard TanStack Start server bundle. Deploy the
`.output/` directory to any Node 20+ runtime.

## 5. Deploy targets (all supported — pick one)

| Host           | Notes                                                       |
| -------------- | ----------------------------------------------------------- |
| Vercel         | Framework preset: *TanStack Start*. Set env vars in project.|
| Netlify        | Same — auto-detects the adapter.                            |
| Cloudflare     | Pages + Workers (`nodejs_compat`).                          |
| Fly.io / Railway | `bun run build && node .output/server/index.mjs`.         |
| Docker / VPS   | Node 20 base image, copy `.output/`, `node server/index.mjs`.|

Point DNS at the host, enable HTTPS (all above do this automatically), done.

## 6. Verify

- `/` — landing loads, Google Map globe animates.
- `/auth` — Google sign-in completes, session persists on refresh.
- `/discover` — map is interactive, adding a pin writes to `public.activities`.
- `/profile` — follow/unfollow round-trips.
- `/` after sign-in — message bell + notification bell show counts.

## 7. What you lose leaving the Lovable editor

Nothing structural. Two convenience layers go away:

- **Lovable AI Gateway** (`LOVABLE_API_KEY`) — not currently used by any
  runtime code in this repo; if you add AI later, plug in OpenAI / Gemini
  directly.
- **Managed secret UI** — you set env vars in your host's dashboard.

The design system, every route, every server function, every RLS policy, the
follower/messaging/notification triggers, the Google Maps layer — all move
verbatim.
