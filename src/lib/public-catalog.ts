import { supabase } from "@/integrations/supabase/client";
import { slugify } from "@/lib/slug";
import type { Activity } from "@/lib/activities";

export type PublicHost = {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
};

export type PublicActivity = Activity & { host: PublicHost | null };

async function attachHosts(rows: Activity[]): Promise<PublicActivity[]> {
  if (rows.length === 0) return [];
  const hostIds = Array.from(new Set(rows.map((r) => r.host_id)));
  const { data: hosts } = await supabase
    .from("profiles")
    .select("id, username, display_name, avatar_url")
    .in("id", hostIds);
  const byId = new Map((hosts ?? []).map((h) => [h.id, h as PublicHost]));
  return rows.map((r) => ({ ...r, host: byId.get(r.host_id) ?? null }));
}

/** Public: full activity + narrow host projection. Used by /activity/$id SSR. */
export function publicActivityQuery(id: string) {
  return {
    queryKey: ["public-activity", id],
    queryFn: async (): Promise<PublicActivity | null> => {
      const { data, error } = await supabase.from("activities").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      if (!data) return null;
      const [enriched] = await attachHosts([data as Activity]);
      return enriched;
    },
    staleTime: 60_000,
  };
}

export type CityCard = {
  slug: string;
  city: string;
  country: string;
  count: number;
  cover_url: string | null;
};

/** Public: cities with active gathering counts, aggregated in the client. */
export function citiesQuery() {
  return {
    queryKey: ["public-cities"],
    queryFn: async (): Promise<CityCard[]> => {
      const { data, error } = await supabase
        .from("activities")
        .select("city, country, cover_url, starts_at")
        .gte("starts_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());
      if (error) throw error;
      const bucket = new Map<string, CityCard>();
      for (const row of (data as { city: string; country: string; cover_url: string | null; starts_at: string }[]) ?? []) {
        const slug = slugify(`${row.city}-${row.country}`);
        const cur = bucket.get(slug);
        if (cur) {
          cur.count += 1;
          if (!cur.cover_url && row.cover_url) cur.cover_url = row.cover_url;
        } else {
          bucket.set(slug, { slug, city: row.city, country: row.country, count: 1, cover_url: row.cover_url });
        }
      }
      return Array.from(bucket.values()).sort((a, b) => b.count - a.count);
    },
    staleTime: 5 * 60_000,
  };
}

/** Public: a single city's upcoming gatherings. Slug is `slugify(city-country)`. */
export function cityQuery(slug: string) {
  return {
    queryKey: ["public-city", slug],
    queryFn: async (): Promise<{ city: string; country: string; activities: PublicActivity[] } | null> => {
      const { data, error } = await supabase
        .from("activities")
        .select("*")
        .gte("starts_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order("starts_at", { ascending: true });
      if (error) throw error;
      const rows = ((data as Activity[]) ?? []).filter((r) => slugify(`${r.city}-${r.country}`) === slug);
      if (rows.length === 0) return null;
      const enriched = await attachHosts(rows);
      return { city: enriched[0].city, country: enriched[0].country, activities: enriched };
    },
    staleTime: 60_000,
  };
}
