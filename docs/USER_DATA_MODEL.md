# Gobber — User Data Model

Portable spec of who owns what, and how each row becomes readable.

## 1. Identity

Backed by **Supabase Auth (GoTrue)** — a standard OAuth 2 + email/password
provider. Any GoTrue-compatible server works.

- Every signed-in user has a row in `auth.users` (managed).
- On signup, the `handle_new_user()` trigger creates:
  - `public.profiles` row (display name, avatar, unique `@username`).
  - `public.user_roles` row with role `'user'`.

Usernames are validated for uniqueness in the trigger and rechecked
client-side during onboarding (`username-onboarding.tsx`).

## 2. Roles

```
public.app_role  ENUM ('admin', 'moderator', 'user')
public.user_roles(user_id, role)   -- separate table (NEVER on profiles)
public.has_role(_user_id, _role)   -- SECURITY DEFINER, stable
```

Role checks in RLS always go through `has_role()`. Storing roles on
`profiles` would enable trivial privilege escalation — do not.

## 3. Ownership map

| Entity            | Owner column        | Deletion behavior         |
| ----------------- | ------------------- | ------------------------- |
| profile           | `id = auth.uid()`   | cascades from `auth.users`|
| activity (pin)    | `host_id`           | cascade → RSVPs, chat     |
| rsvp              | `user_id`           | cascade                   |
| follow            | `follower_id`       | cascade both sides        |
| block             | `blocker_id`        | trigger removes follows   |
| conversation      | `created_by`        | cascade → members, msgs   |
| conversation_member | `user_id`         |                           |
| message           | `sender_id`         | cascade with conversation |
| notification      | `user_id`           | self-clearable            |

## 4. Access rules (RLS summary)

Full policies live in `docs/SCHEMA.sql`. Semantics:

- **Profiles** — anyone authenticated may read; only the owner may update.
- **Activities** — any authenticated user may read; only `host_id` may
  update/delete. Insert requires `host_id = auth.uid()`.
- **RSVPs** — user manages their own; hosts see all RSVPs for their pins.
- **Follows** — mutual visibility; blocked users cannot follow.
- **Blocks** — private to the blocker.
- **Messages** — only members of the conversation can read or write. DMs
  require a mutual follow (enforced in `start_dm` RPC, not RLS).
- **Notifications** — only the recipient can read or clear.

## 5. Automatic behaviors (triggers)

| Trigger                         | Fires on                | Effect                                     |
| ------------------------------- | ----------------------- | ------------------------------------------ |
| `handle_new_user`               | `auth.users` INSERT     | Provisions profile + default role          |
| `notify_on_follow`              | `follows` INSERT        | Writes follow / mutual-follow notification |
| `remove_follows_on_block`       | `blocks` INSERT         | Severs follows in both directions          |
| `create_location_chat`          | `activities` INSERT     | Spawns event chat, expires 2 days post-event|
| `rsvp_join_location_chat`       | `rsvps` INSERT (going)  | Adds attendee to the pin's chat            |
| `bump_conv_last_message`        | `messages` INSERT       | Updates conversation's `last_message_at`   |
| `set_updated_at`                | UPDATE on many          | Maintains `updated_at`                     |

All security-definer functions have `EXECUTE` revoked from `PUBLIC` and
scoped to `authenticated` only. Trigger-only helpers are inaccessible via
RPC (verified in `docs/SCHEMA.sql`).

## 6. Storage ownership

Bucket `chat-media` is private. Objects live under
`<conversation_id>/<message_id>/…` and are readable only through server-
generated signed URLs. RLS on `storage.objects` restricts uploads to
conversation members.

## 7. Data lifecycle

- **Location chats** auto-expire 2 days after the event ends (`expires_at`
  column + optional `pg_cron` sweeper).
- **Notifications** older than 30 days can be swept safely; retention is a
  product choice, not a constraint.
- **User deletion**: deleting `auth.users` cascades to every table above.
  No orphaned rows.

## 8. Adding a new data type

The pattern the whole app follows:

1. `CREATE TABLE public.<name> (...)` with `id uuid pk`, timestamps,
   `user_id uuid references auth.users on delete cascade`.
2. `GRANT SELECT, INSERT, UPDATE, DELETE ON public.<name> TO authenticated;`
   (add `service_role`; add `anon` only for public reads).
3. `ALTER TABLE public.<name> ENABLE ROW LEVEL SECURITY;`
4. Policies scoped to `auth.uid() = user_id`.
5. Attach `set_updated_at` trigger if the table has `updated_at`.

Follow steps 1–4 *in the same migration* — skipping GRANTs breaks the API
even with RLS in place.
