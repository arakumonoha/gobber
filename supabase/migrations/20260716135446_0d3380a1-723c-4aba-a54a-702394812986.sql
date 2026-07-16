
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
