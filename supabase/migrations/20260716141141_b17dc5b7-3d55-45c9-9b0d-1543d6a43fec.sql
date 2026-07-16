
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
