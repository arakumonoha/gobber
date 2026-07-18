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

/** Public: full activity + narrow host projection. Used by /activity/$id SSR. */
export function publicActivityQuery(id: string) {
  return {
    queryKey: ["public-activity", id],
    queryFn: async (): Promise<PublicActivity | null> => {
      const { data, error } = await supabase
        .from("activities")
        .select("*, host:profiles!activities_host_id_fkey(id, username, display_name, avatar_url)")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return (data as unknown as PublicActivity) ?? null;
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
        .select("*, host:profiles!activities_host_id_fkey(id, username, display_name, avatar_url)")
        .gte("starts_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order("starts_at", { ascending: true });
      if (error) throw error;
      const rows = (data as unknown as PublicActivity[]) ?? [];
      const match = rows.filter((r) => slugify(`${r.city}-${r.country}`) === slug);
      if (match.length === 0) return null;
      return { city: match[0].city, country: match[0].country, activities: match };
    },
    staleTime: 60_000,
  };
}
