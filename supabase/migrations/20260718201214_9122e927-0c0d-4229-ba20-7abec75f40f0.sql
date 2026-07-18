
-- Phase 4: Trust layer — waitlist, reviews, host verification

-- 1. Profile trust fields
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS superhost BOOLEAN NOT NULL DEFAULT FALSE;

-- 2. Host verification requests
CREATE TABLE IF NOT EXISTS public.host_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  id_document_url TEXT,
  note TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','verified','rejected')),
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id)
);

GRANT SELECT, INSERT, UPDATE ON public.host_verifications TO authenticated;
GRANT ALL ON public.host_verifications TO service_role;
ALTER TABLE public.host_verifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own verification read" ON public.host_verifications FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(),'moderator') OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "own verification insert" ON public.host_verifications FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND status = 'pending');
CREATE POLICY "own verification update while pending" ON public.host_verifications FOR UPDATE TO authenticated
  USING (user_id = auth.uid() AND status = 'pending')
  WITH CHECK (user_id = auth.uid() AND status = 'pending');
CREATE POLICY "moderator verification update" ON public.host_verifications FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'moderator') OR public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'moderator') OR public.has_role(auth.uid(),'admin'));

CREATE TRIGGER host_verifications_updated_at BEFORE UPDATE ON public.host_verifications
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- When a verification is marked verified, stamp the profile
CREATE OR REPLACE FUNCTION public.apply_host_verification()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.status = 'verified' AND (OLD.status IS DISTINCT FROM 'verified') THEN
    UPDATE public.profiles SET verified_at = now() WHERE id = NEW.user_id;
  ELSIF NEW.status = 'rejected' AND (OLD.status IS DISTINCT FROM 'rejected') THEN
    UPDATE public.profiles SET verified_at = NULL WHERE id = NEW.user_id;
  END IF;
  RETURN NEW;
END; $$;

CREATE TRIGGER apply_host_verification_trg AFTER UPDATE ON public.host_verifications
  FOR EACH ROW EXECUTE FUNCTION public.apply_host_verification();

-- 3. Post-event reviews (guest ↔ host, both directions)
CREATE TABLE IF NOT EXISTS public.activity_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID NOT NULL REFERENCES public.activities(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reviewee_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  direction TEXT NOT NULL CHECK (direction IN ('guest_to_host','host_to_guest')),
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (activity_id, reviewer_id, reviewee_id)
);

GRANT SELECT, INSERT ON public.activity_reviews TO authenticated;
GRANT SELECT ON public.activity_reviews TO anon;
GRANT ALL ON public.activity_reviews TO service_role;
ALTER TABLE public.activity_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reviews public read" ON public.activity_reviews FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "reviews insert self after event" ON public.activity_reviews FOR INSERT TO authenticated
  WITH CHECK (
    reviewer_id = auth.uid()
    AND reviewer_id <> reviewee_id
    AND EXISTS (
      SELECT 1 FROM public.activities a
      WHERE a.id = activity_id
        AND (a.starts_at + (a.duration_hours || ' hours')::interval) < now()
        AND (
          (direction = 'guest_to_host' AND a.host_id = reviewee_id AND EXISTS (
            SELECT 1 FROM public.rsvps r WHERE r.activity_id = a.id AND r.user_id = auth.uid() AND r.status = 'going'
          ))
          OR
          (direction = 'host_to_guest' AND a.host_id = auth.uid() AND EXISTS (
            SELECT 1 FROM public.rsvps r WHERE r.activity_id = a.id AND r.user_id = reviewee_id AND r.status = 'going'
          ))
        )
    )
  );

-- Aggregate helper
CREATE OR REPLACE FUNCTION public.host_review_stats(_user_id UUID)
RETURNS TABLE(avg_rating NUMERIC, review_count BIGINT)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT COALESCE(ROUND(AVG(rating)::numeric, 2), 0), COUNT(*)
  FROM public.activity_reviews
  WHERE reviewee_id = _user_id AND direction = 'guest_to_host';
$$;

-- 4. Waitlist — auto-promote on cancellation
CREATE OR REPLACE FUNCTION public.promote_waitlist_on_cancel()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  spots INT;
  going_count INT;
  next_row public.rsvps%ROWTYPE;
BEGIN
  -- Only act when a 'going' rsvp is removed or downgraded
  IF (TG_OP = 'DELETE' AND OLD.status = 'going') OR
     (TG_OP = 'UPDATE' AND OLD.status = 'going' AND NEW.status <> 'going') THEN
    SELECT max_spots INTO spots FROM public.activities WHERE id = COALESCE(NEW.activity_id, OLD.activity_id);
    SELECT COUNT(*) INTO going_count FROM public.rsvps
      WHERE activity_id = COALESCE(NEW.activity_id, OLD.activity_id) AND status = 'going';
    IF going_count < spots THEN
      SELECT * INTO next_row FROM public.rsvps
        WHERE activity_id = COALESCE(NEW.activity_id, OLD.activity_id) AND status = 'waitlisted'
        ORDER BY created_at ASC LIMIT 1;
      IF FOUND THEN
        UPDATE public.rsvps SET status = 'going' WHERE id = next_row.id;
        INSERT INTO public.notifications (user_id, actor_id, type, entity_type, entity_id)
        VALUES (next_row.user_id, next_row.user_id, 'waitlist_promoted', 'activity', next_row.activity_id);
      END IF;
    END IF;
  END IF;
  RETURN COALESCE(NEW, OLD);
END; $$;

DROP TRIGGER IF EXISTS promote_waitlist_del ON public.rsvps;
CREATE TRIGGER promote_waitlist_del AFTER DELETE ON public.rsvps
  FOR EACH ROW EXECUTE FUNCTION public.promote_waitlist_on_cancel();
DROP TRIGGER IF EXISTS promote_waitlist_upd ON public.rsvps;
CREATE TRIGGER promote_waitlist_upd AFTER UPDATE ON public.rsvps
  FOR EACH ROW EXECUTE FUNCTION public.promote_waitlist_on_cancel();

-- 5. Superhost recompute — verified host with >=3 past activities and >=4.5 avg rating
CREATE OR REPLACE FUNCTION public.recompute_superhost(_user_id UUID)
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  is_verified BOOLEAN;
  past_count INT;
  avg_rating NUMERIC;
  result BOOLEAN;
BEGIN
  SELECT (verified_at IS NOT NULL) INTO is_verified FROM public.profiles WHERE id = _user_id;
  SELECT COUNT(*) INTO past_count FROM public.activities
    WHERE host_id = _user_id AND (starts_at + (duration_hours || ' hours')::interval) < now();
  SELECT COALESCE(AVG(rating), 0) INTO avg_rating FROM public.activity_reviews
    WHERE reviewee_id = _user_id AND direction = 'guest_to_host';
  result := COALESCE(is_verified, FALSE) AND past_count >= 3 AND avg_rating >= 4.5;
  UPDATE public.profiles SET superhost = result WHERE id = _user_id;
  RETURN result;
END; $$;

CREATE OR REPLACE FUNCTION public.recompute_superhost_on_review()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM public.recompute_superhost(NEW.reviewee_id);
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS recompute_superhost_trg ON public.activity_reviews;
CREATE TRIGGER recompute_superhost_trg AFTER INSERT ON public.activity_reviews
  FOR EACH ROW WHEN (NEW.direction = 'guest_to_host')
  EXECUTE FUNCTION public.recompute_superhost_on_review();
