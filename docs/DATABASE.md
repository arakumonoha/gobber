# Gobber — Database Schema & RLS

All SQL migrations applied to the project, in order.

## `20260713111505_3b1bd46a-a6ac-424d-b7cb-dd88c44ff548.sql`

```sql

CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL DEFAULT 'user',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text NOT NULL,
  avatar_url text,
  bio text,
  home_city text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles viewable by authenticated" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TABLE public.activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  cover_url text,
  city text NOT NULL,
  country text NOT NULL,
  lat double precision NOT NULL,
  lng double precision NOT NULL,
  starts_at timestamptz NOT NULL,
  max_spots int NOT NULL DEFAULT 6 CHECK (max_spots > 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.activities TO authenticated;
GRANT ALL ON public.activities TO service_role;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Activities viewable by authenticated" ON public.activities FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can create activities as self" ON public.activities FOR INSERT TO authenticated WITH CHECK (auth.uid() = host_id);
CREATE POLICY "Hosts can update own activities" ON public.activities FOR UPDATE TO authenticated USING (auth.uid() = host_id);
CREATE POLICY "Hosts can delete own activities" ON public.activities FOR DELETE TO authenticated USING (auth.uid() = host_id);

CREATE TABLE public.rsvps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id uuid NOT NULL REFERENCES public.activities(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'going' CHECK (status IN ('going', 'cancelled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (activity_id, user_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.rsvps TO authenticated;
GRANT ALL ON public.rsvps TO service_role;
ALTER TABLE public.rsvps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "RSVPs viewable by authenticated" ON public.rsvps FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can rsvp as self" ON public.rsvps FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own rsvp" ON public.rsvps FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own rsvp" ON public.rsvps FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER activities_updated_at BEFORE UPDATE ON public.activities FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

```

## `20260713111533_4de636d2-90a4-450c-bb7c-ff02a0522a0f.sql`

```sql

ALTER FUNCTION public.set_updated_at() SET search_path = public;

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;

```

## `20260716103027_849e650a-4776-4de2-b676-de5b488aa692.sql`

```sql
CREATE POLICY "Activities publicly viewable" ON public.activities FOR SELECT TO anon USING (true); GRANT SELECT ON public.activities TO anon;
```

## `20260716114518_ac6c6d45-dc02-480f-b260-d36e5552c2c1.sql`

```sql
ALTER TABLE public.activities ADD COLUMN IF NOT EXISTS duration_hours integer NOT NULL DEFAULT 2 CHECK (duration_hours > 0 AND duration_hours <= 24);
```

## `20260716125516_4f67ae62-d063-4255-a9cd-5af680e82701.sql`

```sql
DROP POLICY IF EXISTS "RSVPs viewable by authenticated" ON public.rsvps;

CREATE POLICY "RSVPs viewable by owner or host"
ON public.rsvps
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id
  OR auth.uid() = (SELECT host_id FROM public.activities WHERE id = rsvps.activity_id)
);
```

## `20260716134337_42a024ff-379c-4837-b176-81a6abf75591.sql`

```sql

-- 1. Add username to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS username text;

-- Backfill any nulls with a placeholder derived from id so unique constraint holds
UPDATE public.profiles
  SET username = 'user_' || substr(replace(id::text, '-', ''), 1, 10)
  WHERE username IS NULL;

ALTER TABLE public.profiles
  ALTER COLUMN username SET NOT NULL;

-- Case-insensitive uniqueness + shape check
CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_lower_idx
  ON public.profiles ((lower(username)));

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_username_format_chk
  CHECK (username ~ '^[a-zA-Z0-9_]{3,20}$');

-- 2. Follows table
CREATE TABLE public.follows (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (follower_id, following_id),
  CHECK (follower_id <> following_id)
);

CREATE INDEX follows_follower_idx ON public.follows(follower_id);
CREATE INDEX follows_following_idx ON public.follows(following_id);

GRANT SELECT, INSERT, DELETE ON public.follows TO authenticated;
GRANT ALL ON public.follows TO service_role;

ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Follows viewable by authenticated"
  ON public.follows FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can follow as self"
  ON public.follows FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow own"
  ON public.follows FOR DELETE TO authenticated
  USING (auth.uid() = follower_id);

-- 3. Update handle_new_user to seed a unique username
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  base_name text;
  candidate text;
  suffix int := 0;
BEGIN
  base_name := lower(regexp_replace(
    COALESCE(NEW.raw_user_meta_data->>'preferred_username',
             split_part(NEW.email, '@', 1),
             'user'),
    '[^a-z0-9_]', '', 'g'
  ));
  IF length(base_name) < 3 THEN base_name := 'user' || substr(replace(NEW.id::text,'-',''),1,6); END IF;
  IF length(base_name) > 18 THEN base_name := substr(base_name, 1, 18); END IF;

  candidate := base_name;
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE lower(username) = candidate) LOOP
    suffix := suffix + 1;
    candidate := substr(base_name, 1, 18) || suffix::text;
  END LOOP;

  INSERT INTO public.profiles (id, display_name, avatar_url, username)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url',
    candidate
  );
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$function$;

```

## `20260716135027_d3743b13-3908-4150-9d7d-b1b703426e3a.sql`

```sql

CREATE TABLE public.blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  blocked_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (blocker_id, blocked_id),
  CHECK (blocker_id <> blocked_id)
);

GRANT SELECT, INSERT, DELETE ON public.blocks TO authenticated;
GRANT ALL ON public.blocks TO service_role;

ALTER TABLE public.blocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own blocks"
  ON public.blocks FOR SELECT TO authenticated
  USING (auth.uid() = blocker_id);

CREATE POLICY "Users can block as self"
  ON public.blocks FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = blocker_id);

CREATE POLICY "Users can unblock own"
  ON public.blocks FOR DELETE TO authenticated
  USING (auth.uid() = blocker_id);

CREATE INDEX blocks_blocker_idx ON public.blocks (blocker_id);
CREATE INDEX blocks_blocked_idx ON public.blocks (blocked_id);

-- When a block is created, remove any follow relationships between the two users.
CREATE OR REPLACE FUNCTION public.remove_follows_on_block()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.follows
   WHERE (follower_id = NEW.blocker_id AND following_id = NEW.blocked_id)
      OR (follower_id = NEW.blocked_id AND following_id = NEW.blocker_id);
  RETURN NEW;
END;
$$;

CREATE TRIGGER blocks_after_insert_remove_follows
AFTER INSERT ON public.blocks
FOR EACH ROW EXECUTE FUNCTION public.remove_follows_on_block();

```

## `20260716135046_1f41beb4-4200-4265-a947-f25f38341012.sql`

```sql
REVOKE EXECUTE ON FUNCTION public.remove_follows_on_block() FROM PUBLIC, anon, authenticated;
```

## `20260716135446_0d3380a1-723c-4aba-a54a-702394812986.sql`

```sql

-- Notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX notifications_user_created_idx ON public.notifications (user_id, created_at DESC);
CREATE INDEX notifications_user_unread_idx ON public.notifications (user_id) WHERE read_at IS NULL;

GRANT SELECT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own notifications"
  ON public.notifications FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users update own notifications"
  ON public.notifications FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own notifications"
  ON public.notifications FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Trigger: on new follow, create notification(s)
CREATE OR REPLACE FUNCTION public.notify_on_follow()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_mutual BOOLEAN;
BEGIN
  -- Skip if blocked in either direction
  IF EXISTS (
    SELECT 1 FROM public.blocks
    WHERE (blocker_id = NEW.following_id AND blocked_id = NEW.follower_id)
       OR (blocker_id = NEW.follower_id AND blocked_id = NEW.following_id)
  ) THEN
    RETURN NEW;
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM public.follows
    WHERE follower_id = NEW.following_id AND following_id = NEW.follower_id
  ) INTO is_mutual;

  -- Notify the followed user
  INSERT INTO public.notifications (user_id, actor_id, type, entity_type, entity_id)
  VALUES (
    NEW.following_id,
    NEW.follower_id,
    CASE WHEN is_mutual THEN 'mutual_follow' ELSE 'follow' END,
    'user',
    NEW.follower_id
  );

  -- If mutual, also notify the follower (who just completed the mutual)
  IF is_mutual THEN
    INSERT INTO public.notifications (user_id, actor_id, type, entity_type, entity_id)
    VALUES (NEW.follower_id, NEW.following_id, 'mutual_follow', 'user', NEW.following_id);
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_on_follow
AFTER INSERT ON public.follows
FOR EACH ROW EXECUTE FUNCTION public.notify_on_follow();

-- Suggestion function: rank by mutual-follow count (people your friends follow) + recency
CREATE OR REPLACE FUNCTION public.suggested_profiles(_user_id UUID, _limit INT DEFAULT 12)
RETURNS TABLE (
  id UUID,
  username TEXT,
  display_name TEXT,
  avatar_url TEXT,
  home_city TEXT,
  mutual_count BIGINT
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  WITH my_following AS (
    SELECT following_id FROM public.follows WHERE follower_id = _user_id
  ),
  blocked AS (
    SELECT blocked_id AS uid FROM public.blocks WHERE blocker_id = _user_id
    UNION
    SELECT blocker_id AS uid FROM public.blocks WHERE blocked_id = _user_id
  ),
  candidates AS (
    -- Friends-of-friends
    SELECT f.following_id AS uid, COUNT(*) AS mutual
    FROM public.follows f
    WHERE f.follower_id IN (SELECT following_id FROM my_following)
      AND f.following_id <> _user_id
      AND f.following_id NOT IN (SELECT following_id FROM my_following)
      AND f.following_id NOT IN (SELECT uid FROM blocked)
    GROUP BY f.following_id
  )
  SELECT p.id, p.username, p.display_name, p.avatar_url, p.home_city,
         COALESCE(c.mutual, 0) AS mutual_count
  FROM public.profiles p
  LEFT JOIN candidates c ON c.uid = p.id
  WHERE p.id <> _user_id
    AND p.id NOT IN (SELECT following_id FROM my_following)
    AND p.id NOT IN (SELECT uid FROM blocked)
  ORDER BY COALESCE(c.mutual, 0) DESC, p.created_at DESC NULLS LAST
  LIMIT _limit;
$$;

GRANT EXECUTE ON FUNCTION public.suggested_profiles(UUID, INT) TO authenticated;

```

## `20260716141141_b17dc5b7-3d55-45c9-9b0d-1543d6a43fec.sql`

```sql

-- ============ CONVERSATIONS ============
CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('dm','location')),
  activity_id UUID REFERENCES public.activities(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT,
  expires_at TIMESTAMPTZ,
  last_message_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX conversations_activity_unique ON public.conversations(activity_id) WHERE type='location';
CREATE INDEX conversations_last_msg_idx ON public.conversations(last_message_at DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.conversations TO authenticated;
GRANT ALL ON public.conversations TO service_role;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- ============ MEMBERS ============
CREATE TABLE public.conversation_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner','member')),
  last_read_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (conversation_id, user_id)
);
CREATE INDEX conversation_members_user_idx ON public.conversation_members(user_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.conversation_members TO authenticated;
GRANT ALL ON public.conversation_members TO service_role;
ALTER TABLE public.conversation_members ENABLE ROW LEVEL SECURITY;

-- ============ MESSAGES ============
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body TEXT NOT NULL CHECK (length(body) > 0 AND length(body) <= 4000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX messages_conv_idx ON public.messages(conversation_id, created_at DESC);

GRANT SELECT, INSERT, DELETE ON public.messages TO authenticated;
GRANT ALL ON public.messages TO service_role;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- ============ HELPER: is_member ============
CREATE OR REPLACE FUNCTION public.is_conv_member(_conv UUID, _uid UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.conversation_members WHERE conversation_id=_conv AND user_id=_uid);
$$;

CREATE OR REPLACE FUNCTION public.is_conv_owner(_conv UUID, _uid UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.conversation_members WHERE conversation_id=_conv AND user_id=_uid AND role='owner');
$$;

-- ============ POLICIES: conversations ============
CREATE POLICY "Members can view conversations"
  ON public.conversations FOR SELECT TO authenticated
  USING (public.is_conv_member(id, auth.uid()));

CREATE POLICY "Users can update last_message_at as member"
  ON public.conversations FOR UPDATE TO authenticated
  USING (public.is_conv_member(id, auth.uid()));

CREATE POLICY "Owners can delete conversation"
  ON public.conversations FOR DELETE TO authenticated
  USING (public.is_conv_owner(id, auth.uid()));

-- INSERT: only via SECURITY DEFINER functions (start_dm) or triggers.
-- We still allow authenticated inserts scoped to self so client can create DMs directly,
-- but recommend using start_dm RPC. Restrict type to dm here.
CREATE POLICY "Users can create own DM conversation"
  ON public.conversations FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid() AND type = 'dm');

-- ============ POLICIES: members ============
CREATE POLICY "Members can view own memberships"
  ON public.conversation_members FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_conv_member(conversation_id, auth.uid()));

CREATE POLICY "Users can add self to convo"
  ON public.conversation_members FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "User can update own membership"
  ON public.conversation_members FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Self-leave or owner removes member"
  ON public.conversation_members FOR DELETE TO authenticated
  USING (
    user_id = auth.uid()
    OR (public.is_conv_owner(conversation_id, auth.uid()) AND role <> 'owner')
  );

-- ============ POLICIES: messages ============
CREATE POLICY "Members can read messages"
  ON public.messages FOR SELECT TO authenticated
  USING (public.is_conv_member(conversation_id, auth.uid()));

CREATE POLICY "Members can send messages"
  ON public.messages FOR INSERT TO authenticated
  WITH CHECK (sender_id = auth.uid() AND public.is_conv_member(conversation_id, auth.uid()));

CREATE POLICY "Sender can delete own message"
  ON public.messages FOR DELETE TO authenticated
  USING (sender_id = auth.uid());

-- ============ TRIGGER: bump last_message_at ============
CREATE OR REPLACE FUNCTION public.bump_conv_last_message()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.conversations SET last_message_at = NEW.created_at WHERE id = NEW.conversation_id;
  RETURN NEW;
END; $$;
CREATE TRIGGER messages_bump_last AFTER INSERT ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.bump_conv_last_message();

-- ============ TRIGGER: auto-create location chat on activity insert ============
CREATE OR REPLACE FUNCTION public.create_location_chat()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  new_conv_id UUID;
BEGIN
  INSERT INTO public.conversations (type, activity_id, created_by, title, expires_at)
  VALUES (
    'location',
    NEW.id,
    NEW.host_id,
    NEW.title,
    NEW.starts_at + (NEW.duration_hours || ' hours')::interval + interval '2 days'
  )
  RETURNING id INTO new_conv_id;

  INSERT INTO public.conversation_members (conversation_id, user_id, role)
  VALUES (new_conv_id, NEW.host_id, 'owner');

  RETURN NEW;
END; $$;
CREATE TRIGGER activities_create_chat AFTER INSERT ON public.activities
  FOR EACH ROW EXECUTE FUNCTION public.create_location_chat();

-- Backfill for existing activities
INSERT INTO public.conversations (type, activity_id, created_by, title, expires_at)
SELECT 'location', a.id, a.host_id, a.title,
  a.starts_at + (a.duration_hours || ' hours')::interval + interval '2 days'
FROM public.activities a
WHERE NOT EXISTS (SELECT 1 FROM public.conversations c WHERE c.activity_id = a.id);

INSERT INTO public.conversation_members (conversation_id, user_id, role)
SELECT c.id, c.created_by, 'owner'
FROM public.conversations c
WHERE c.type = 'location'
  AND NOT EXISTS (
    SELECT 1 FROM public.conversation_members m
    WHERE m.conversation_id = c.id AND m.user_id = c.created_by
  );

-- ============ TRIGGER: auto-add rsvp'd user to location chat ============
CREATE OR REPLACE FUNCTION public.rsvp_join_location_chat()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  conv_id UUID;
BEGIN
  IF NEW.status <> 'going' THEN RETURN NEW; END IF;
  SELECT id INTO conv_id FROM public.conversations WHERE activity_id = NEW.activity_id AND type='location';
  IF conv_id IS NOT NULL THEN
    INSERT INTO public.conversation_members (conversation_id, user_id, role)
    VALUES (conv_id, NEW.user_id, 'member')
    ON CONFLICT (conversation_id, user_id) DO NOTHING;
  END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER rsvps_join_chat AFTER INSERT ON public.rsvps
  FOR EACH ROW EXECUTE FUNCTION public.rsvp_join_location_chat();

-- Backfill members from existing rsvps
INSERT INTO public.conversation_members (conversation_id, user_id, role)
SELECT c.id, r.user_id, 'member'
FROM public.rsvps r
JOIN public.conversations c ON c.activity_id = r.activity_id AND c.type='location'
WHERE r.status = 'going'
ON CONFLICT (conversation_id, user_id) DO NOTHING;

-- ============ start_dm RPC ============
CREATE OR REPLACE FUNCTION public.start_dm(_other UUID)
RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  me UUID := auth.uid();
  existing UUID;
  new_id UUID;
  mutual BOOLEAN;
BEGIN
  IF me IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  IF me = _other THEN RAISE EXCEPTION 'cannot dm yourself'; END IF;

  -- must be mutual follow
  SELECT EXISTS (
    SELECT 1 FROM public.follows WHERE follower_id = me AND following_id = _other
  ) AND EXISTS (
    SELECT 1 FROM public.follows WHERE follower_id = _other AND following_id = me
  ) INTO mutual;
  IF NOT mutual THEN RAISE EXCEPTION 'mutual follow required'; END IF;

  -- reject if either has blocked the other
  IF EXISTS (SELECT 1 FROM public.blocks WHERE (blocker_id = me AND blocked_id = _other) OR (blocker_id = _other AND blocked_id = me)) THEN
    RAISE EXCEPTION 'blocked';
  END IF;

  -- find existing DM
  SELECT c.id INTO existing
  FROM public.conversations c
  JOIN public.conversation_members m1 ON m1.conversation_id = c.id AND m1.user_id = me
  JOIN public.conversation_members m2 ON m2.conversation_id = c.id AND m2.user_id = _other
  WHERE c.type = 'dm'
  LIMIT 1;

  IF existing IS NOT NULL THEN RETURN existing; END IF;

  INSERT INTO public.conversations (type, created_by) VALUES ('dm', me) RETURNING id INTO new_id;
  INSERT INTO public.conversation_members (conversation_id, user_id, role) VALUES (new_id, me, 'owner');
  INSERT INTO public.conversation_members (conversation_id, user_id, role) VALUES (new_id, _other, 'member');
  RETURN new_id;
END; $$;
GRANT EXECUTE ON FUNCTION public.start_dm(UUID) TO authenticated;

-- ============ realtime ============
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversation_members;

-- ============ pg_cron: hourly cleanup of expired location chats ============
CREATE EXTENSION IF NOT EXISTS pg_cron;
SELECT cron.schedule(
  'gobber-cleanup-expired-chats',
  '17 * * * *',
  $$DELETE FROM public.conversations WHERE type='location' AND expires_at IS NOT NULL AND expires_at < now();$$
);

```

## `20260716141933_6d074e02-a986-4d8e-84bf-a3130a331ea6.sql`

```sql

-- Allow media in messages
ALTER TABLE public.messages
  ADD COLUMN IF NOT EXISTS media_url TEXT,
  ADD COLUMN IF NOT EXISTS media_type TEXT;

-- Relax body check: allow empty body if media attached
ALTER TABLE public.messages DROP CONSTRAINT IF EXISTS messages_body_check;
ALTER TABLE public.messages
  ADD CONSTRAINT messages_body_or_media_check
  CHECK (
    length(body) <= 4000
    AND (length(body) > 0 OR media_url IS NOT NULL)
  );

-- Storage RLS for chat-media (private bucket). Object path convention: <conversation_id>/<user_id>/<filename>
CREATE POLICY "chat-media upload by members"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'chat-media'
  AND public.is_conv_member((storage.foldername(name))[1]::uuid, auth.uid())
  AND auth.uid()::text = (storage.foldername(name))[2]
);

CREATE POLICY "chat-media read by members"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'chat-media'
  AND public.is_conv_member((storage.foldername(name))[1]::uuid, auth.uid())
);

CREATE POLICY "chat-media delete own"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'chat-media'
  AND auth.uid()::text = (storage.foldername(name))[2]
);

```

