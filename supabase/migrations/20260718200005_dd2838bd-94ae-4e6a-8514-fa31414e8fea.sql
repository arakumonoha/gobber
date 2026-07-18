
-- =========================================================
-- REPORTS
-- =========================================================
CREATE TABLE public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('user', 'activity', 'message')),
  entity_id UUID NOT NULL,
  reason TEXT NOT NULL CHECK (char_length(reason) BETWEEN 2 AND 60),
  notes TEXT CHECK (notes IS NULL OR char_length(notes) <= 1000),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','reviewed','actioned','dismissed')),
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_reports_status_created ON public.reports (status, created_at DESC);
CREATE INDEX idx_reports_entity ON public.reports (entity_type, entity_id);
CREATE INDEX idx_reports_reporter ON public.reports (reporter_id, created_at DESC);
-- Prevent the same user piling identical reports on the same target while pending.
CREATE UNIQUE INDEX uniq_reports_pending_per_reporter
  ON public.reports (reporter_id, entity_type, entity_id)
  WHERE status = 'pending';

GRANT SELECT, INSERT ON public.reports TO authenticated;
GRANT UPDATE (status, reviewed_by, reviewed_at, updated_at) ON public.reports TO authenticated;
GRANT ALL ON public.reports TO service_role;

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reporters can view own reports"
  ON public.reports FOR SELECT
  TO authenticated
  USING (reporter_id = auth.uid());

CREATE POLICY "Moderators can view all reports"
  ON public.reports FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'moderator') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can create reports"
  ON public.reports FOR INSERT
  TO authenticated
  WITH CHECK (reporter_id = auth.uid());

CREATE POLICY "Moderators can update reports"
  ON public.reports FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'moderator') OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'moderator') OR public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_reports_updated_at
  BEFORE UPDATE ON public.reports
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================================================
-- RATE LIMITS
-- =========================================================
CREATE TABLE public.rate_limits (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bucket TEXT NOT NULL,
  window_start TIMESTAMPTZ NOT NULL DEFAULT now(),
  count INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, bucket)
);

-- Table is server/managed-only; helper below is the sole entry point.
GRANT ALL ON public.rate_limits TO service_role;

ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;
-- No policies for authenticated → table is inaccessible from the client directly,
-- which is what we want. Only the SECURITY DEFINER helper mutates it.

CREATE OR REPLACE FUNCTION public.consume_rate_limit(
  _bucket TEXT,
  _limit INT,
  _window INTERVAL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid UUID := auth.uid();
  _row public.rate_limits%ROWTYPE;
BEGIN
  IF _uid IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;
  IF _limit <= 0 THEN
    RETURN FALSE;
  END IF;

  INSERT INTO public.rate_limits (user_id, bucket, window_start, count)
  VALUES (_uid, _bucket, now(), 1)
  ON CONFLICT (user_id, bucket) DO UPDATE
    SET window_start = CASE
          WHEN public.rate_limits.window_start + _window < now() THEN now()
          ELSE public.rate_limits.window_start
        END,
        count = CASE
          WHEN public.rate_limits.window_start + _window < now() THEN 1
          ELSE public.rate_limits.count + 1
        END
  RETURNING * INTO _row;

  RETURN _row.count <= _limit;
END;
$$;

REVOKE ALL ON FUNCTION public.consume_rate_limit(TEXT, INT, INTERVAL) FROM public;
GRANT EXECUTE ON FUNCTION public.consume_rate_limit(TEXT, INT, INTERVAL) TO authenticated;

-- =========================================================
-- MODERATION QUEUE VIEW (moderators only, via RLS on reports)
-- =========================================================
-- Convenience RPC: pending count for the bell badge.
CREATE OR REPLACE FUNCTION public.pending_reports_count()
RETURNS INT
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE
    WHEN public.has_role(auth.uid(), 'moderator') OR public.has_role(auth.uid(), 'admin')
      THEN (SELECT COUNT(*)::int FROM public.reports WHERE status = 'pending')
    ELSE 0
  END;
$$;

REVOKE ALL ON FUNCTION public.pending_reports_count() FROM public;
GRANT EXECUTE ON FUNCTION public.pending_reports_count() TO authenticated;
