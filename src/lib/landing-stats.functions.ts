import { createServerFn } from "@tanstack/react-start";

export type LandingStats = {
  liveCount: number;
  activeHosts: number;
  totalCities: number;
  perCountry: Record<string, number>;
  trending: { city: string; country: string; count: number }[];
  joins: { when: string; name: string; title: string; city: string; country: string; category: string }[];
  generatedAt: string;
};

export const getLandingStats = createServerFn({ method: "GET" }).handler(async (): Promise<LandingStats> => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const now = new Date();
  const nowIso = now.toISOString();
  const in6h = new Date(now.getTime() + 6 * 3600 * 1000).toISOString();
  const last24h = new Date(now.getTime() - 24 * 3600 * 1000).toISOString();

  const [liveCountRes, soonHostsRes, cityRes, joinsRes, allCitiesRes] = await Promise.all([
    supabaseAdmin.from("activities").select("*", { count: "exact", head: true }).gte("starts_at", nowIso),
    supabaseAdmin.from("activities").select("host_id, starts_at").gte("starts_at", nowIso).lte("starts_at", in6h),
    supabaseAdmin.from("activities").select("city, country, created_at").gte("created_at", last24h),
    supabaseAdmin
      .from("rsvps")
      .select("created_at, user_id, activity_id")
      .order("created_at", { ascending: false })
      .limit(12),
    supabaseAdmin.from("activities").select("city, country"),
  ]);

  const activeHosts = new Set((soonHostsRes.data ?? []).map((a) => a.host_id)).size;

  const cityMap = new Map<string, { count: number; country: string }>();
  for (const a of cityRes.data ?? []) {
    const cur = cityMap.get(a.city) ?? { count: 0, country: a.country };
    cur.count += 1;
    cityMap.set(a.city, cur);
  }
  const trending = [...cityMap.entries()]
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 8)
    .map(([city, v]) => ({ city, country: v.country, count: v.count }));

  const perCountry: Record<string, number> = {};
  const totalCitiesSet = new Set<string>();
  for (const a of allCitiesRes.data ?? []) {
    perCountry[a.country] = (perCountry[a.country] ?? 0) + 1;
    totalCitiesSet.add(a.city);
  }

  let joins: LandingStats["joins"] = [];
  const raw = joinsRes.data ?? [];
  if (raw.length) {
    const uids = [...new Set(raw.map((r) => r.user_id))];
    const aids = [...new Set(raw.map((r) => r.activity_id))];
    const [profs, acts] = await Promise.all([
      supabaseAdmin.from("profiles").select("id, display_name").in("id", uids),
      supabaseAdmin.from("activities").select("id, title, city, country, category").in("id", aids),
    ]);
    const pMap = new Map((profs.data ?? []).map((p) => [p.id, p.display_name]));
    const aMap = new Map((acts.data ?? []).map((a) => [a.id, a]));
    joins = raw
      .map((r) => {
        const a = aMap.get(r.activity_id);
        if (!a) return null;
        return {
          when: r.created_at,
          name: (pMap.get(r.user_id) ?? "Someone").split(" ")[0],
          title: a.title,
          city: a.city,
          country: a.country,
          category: a.category,
        };
      })
      .filter(Boolean) as LandingStats["joins"];
  }

  return {
    liveCount: liveCountRes.count ?? 0,
    activeHosts,
    totalCities: totalCitiesSet.size,
    perCountry,
    trending,
    joins,
    generatedAt: nowIso,
  };
});
