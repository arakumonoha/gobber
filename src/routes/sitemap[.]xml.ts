import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { slugify } from "@/lib/slug";

const BASE_URL = "https://gobber.lovable.app";

interface SitemapEntry {
  path: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
  lastmod?: string;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const entries: SitemapEntry[] = [
          { path: "/", changefreq: "weekly", priority: "1.0" },
          { path: "/cities", changefreq: "daily", priority: "0.9" },
        ];

        // Dynamic: active cities + activities. Uses the publishable key so
        // it works from the sandboxed worker with anon RLS.
        try {
          const url = process.env.SUPABASE_URL;
          const key = process.env.SUPABASE_PUBLISHABLE_KEY;
          if (url && key) {
            const client = createClient(url, key, {
              auth: { persistSession: false, autoRefreshToken: false },
              global: {
                fetch: (input, init) => {
                  const h = new Headers(init?.headers);
                  if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
                  h.set("apikey", key);
                  return fetch(input, { ...init, headers: h });
                },
              },
            });
            const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
            const { data } = await client
              .from("activities")
              .select("id, city, country, starts_at, updated_at")
              .gte("starts_at", since)
              .limit(500);
            const seenCity = new Set<string>();
            for (const row of (data ?? []) as { id: string; city: string; country: string; starts_at: string; updated_at?: string }[]) {
              const citySlug = slugify(`${row.city}-${row.country}`);
              if (!seenCity.has(citySlug)) {
                seenCity.add(citySlug);
                entries.push({ path: `/city/${citySlug}`, changefreq: "daily", priority: "0.8" });
              }
              entries.push({
                path: `/activity/${row.id}`,
                changefreq: "hourly",
                priority: "0.7",
                lastmod: row.updated_at ?? row.starts_at,
              });
            }
          }
        } catch {
          // Sitemap must always respond — fall back to static entries.
        }

        const urls = entries.map((e) =>
          [
            `  <url>`,
            `    <loc>${BASE_URL}${e.path}</loc>`,
            e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
            e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
            e.priority ? `    <priority>${e.priority}</priority>` : null,
            `  </url>`,
          ]
            .filter(Boolean)
            .join("\n"),
        );

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=600",
          },
        });
      },
    },
  },
});
