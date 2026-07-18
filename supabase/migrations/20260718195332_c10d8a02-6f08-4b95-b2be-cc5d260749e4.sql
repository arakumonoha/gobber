-- Public read access for social profile fields so shareable pages
-- (/activity/$id, /city/$slug, /u/$username in future) can show host info.
-- Username, display_name, avatar_url, bio, home_city are inherently public
-- for a social app of this shape; email/private fields are not on this table.
CREATE POLICY "Profiles publicly viewable"
  ON public.profiles
  FOR SELECT
  TO anon
  USING (true);

GRANT SELECT ON public.profiles TO anon;
