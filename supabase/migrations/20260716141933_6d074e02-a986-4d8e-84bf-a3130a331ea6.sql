
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
