# Gobber — API Reference

Two surfaces: TanStack **server functions** (typed RPC, same-origin) and the
**Supabase Data API** (auto-generated REST + Realtime over the tables below).

## Server functions

All defined with `createServerFn` from `@tanstack/react-start`. Called from
route loaders or components via `useServerFn`. Auth token is attached
automatically by client middleware.

| Function            | File                                | Method | Auth | Purpose                                              |
| ------------------- | ----------------------------------- | ------ | ---- | ---------------------------------------------------- |
| `getLandingStats`   | `src/lib/landing-stats.functions.ts`| GET    | none | Public counts (gatherings joined, cities on map).    |
| `getLocationPhoto`  | `src/lib/place-photo.functions.ts`  | POST   | none | Fetches a Google Places photo for a lat/lng or name. |

Both are stateless and safe for SSR/prerender.

## Client data helpers

Thin wrappers around the Supabase client. All use RLS as the signed-in user.

| Module                 | Exports (representative)                                         |
| ---------------------- | ---------------------------------------------------------------- |
| `src/lib/activities.ts`| `activitiesQuery`, `createActivity`, `rsvp`, `unrsvp`            |
| `src/lib/follows.ts`   | `follow`, `unfollow`, `block`, `unblock`, `suggestedProfiles`    |
| `src/lib/messages.ts`  | `startDm`, `sendMessage`, `uploadMedia`, `markRead`, realtime sub|
| `src/lib/notifications.ts` | `listNotifications`, `unreadCount`, `markAllRead`            |
| `src/lib/categories.ts`| Static category catalogue (food, wellness, culture, …)           |

## Supabase Data API (auto-generated REST)

Base URL: `https://YOUR-PROJECT.supabase.co/rest/v1`

Every table below is exposed with the standard PostgREST verbs, gated by the
RLS policies in `docs/SCHEMA.sql`.

| Resource              | Table                    | Read              | Write                          |
| --------------------- | ------------------------ | ----------------- | ------------------------------ |
| Profiles              | `profiles`               | authenticated     | owner only (`auth.uid() = id`) |
| Roles                 | `user_roles`             | via `has_role` fn | service_role only              |
| Activities (pins)     | `activities`             | authenticated     | host only                      |
| RSVPs                 | `rsvps`                  | authenticated     | self only                      |
| Follows               | `follows`                | authenticated     | self only, not blocked         |
| Blocks                | `blocks`                 | self only         | self only                      |
| Conversations         | `conversations`          | members only      | via `start_dm` RPC             |
| Conversation members  | `conversation_members`   | members only      | owner (DMs auto-manage)        |
| Messages              | `messages`               | members only      | members only                   |
| Notifications         | `notifications`          | self only         | triggers only                  |

## RPC (Postgres functions callable over PostgREST)

| Function                                | Purpose                                             |
| --------------------------------------- | --------------------------------------------------- |
| `has_role(_user_id, _role)`             | Role check used inside RLS policies.                |
| `start_dm(_other uuid) -> uuid`         | Create-or-return a mutual-follow DM conversation.   |
| `suggested_profiles(_user_id, _limit)`  | Friends-of-friends ranking for the People rail.     |
| `is_conv_member`, `is_conv_owner`       | Security-definer helpers referenced by policies.    |

## Realtime channels

Subscribe via `supabase.channel(...)`:

- `messages:conversation_id=eq.<id>` — new messages in a chat.
- `notifications:user_id=eq.<uid>` — new notification for the current user.
- `activities` — new pins (used by the Discover map).

## Storage

Single private bucket: **`chat-media`**. Path convention:

```
<conversation_id>/<message_id>/<uuid>.<ext>
```

Signed URLs are minted server-side by `src/lib/messages.ts` when rendering a
message. 25 MB upload cap enforced client-side.

## HTTP shape (bring your own client)

If you want to call the Data API directly (curl, mobile app, external
service):

```http
GET  /rest/v1/activities?select=*,host:profiles(*)&order=starts_at.asc
POST /rest/v1/activities                 # host only
PATCH/DELETE /rest/v1/activities?id=eq.X # host only

Headers:
  apikey:        <VITE_SUPABASE_PUBLISHABLE_KEY>
  Authorization: Bearer <user_jwt_from_gotrue>
  Content-Type:  application/json
  Prefer:        return=representation
```

RLS is enforced automatically — the JWT identifies the caller.
