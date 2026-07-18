
-- Lock down SECURITY DEFINER functions per Supabase linter (0028/0029).

-- Trigger-only functions: revoke all direct EXECUTE. Triggers run as table owner regardless.
REVOKE ALL ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.remove_follows_on_block() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.notify_on_follow() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.bump_conv_last_message() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.rsvp_join_location_chat() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.create_location_chat() FROM PUBLIC, anon, authenticated;

-- User-callable definers: restrict to authenticated only (no anon).
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;

REVOKE ALL ON FUNCTION public.suggested_profiles(uuid, integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.suggested_profiles(uuid, integer) TO authenticated;

REVOKE ALL ON FUNCTION public.is_conv_member(uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_conv_member(uuid, uuid) TO authenticated;

REVOKE ALL ON FUNCTION public.is_conv_owner(uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_conv_owner(uuid, uuid) TO authenticated;

REVOKE ALL ON FUNCTION public.start_dm(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.start_dm(uuid) TO authenticated;
