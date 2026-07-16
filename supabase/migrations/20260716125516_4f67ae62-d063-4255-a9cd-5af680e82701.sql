DROP POLICY IF EXISTS "RSVPs viewable by authenticated" ON public.rsvps;

CREATE POLICY "RSVPs viewable by owner or host"
ON public.rsvps
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id
  OR auth.uid() = (SELECT host_id FROM public.activities WHERE id = rsvps.activity_id)
);