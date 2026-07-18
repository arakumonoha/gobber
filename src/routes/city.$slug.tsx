import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { cityQuery } from "@/lib/public-catalog";
import { SectionHeader } from "@/components/ui/glass";

const BASE_URL = "https://gobber.lovable.app";

export const Route = createFileRoute("/city/$slug")({
  loader: async ({ params, context }) => {
    const data = await context.queryClient.ensureQueryData(cityQuery(params.slug));
    if (!data) throw notFound();
    return data;
  },
  head: ({ params, loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "City not found — Gobber" }, { name: "robots", content: "noindex" }] };
    }
    const url = `${BASE_URL}/city/${params.slug}`;
    const title = `Gatherings in ${loaderData.city} — Gobber`;
    const desc = `${loaderData.activities.length} traveler-hosted gathering${loaderData.activities.length === 1 ? "" : "s"} happening in ${loaderData.city}, ${loaderData.country} right now.`;
    const cover = loaderData.activities.find((a) => a.cover_url)?.cover_url;
    const meta: Array<Record<string, string>> = [
      { title },
      { name: "description", content: desc },
      { property: "og:type", content: "website" },
      { property: "og:title", content: title },
      { property: "og:description", content: desc },
      { property: "og:url", content: url },
      { name: "twitter:card", content: "summary_large_image" },
    ];
    if (cover) {
      meta.push({ property: "og:image", content: cover });
      meta.push({ name: "twitter:image", content: cover });
    }
    return { meta, links: [{ rel: "canonical", href: url }] };
  },
  errorComponent: () => (
    <div className="flex h-[100dvh] flex-col items-center justify-center px-6 text-center">
      <p className="text-lg font-medium">Something went wrong</p>
      <Link to="/cities" className="mt-4 text-sm text-clay underline">All cities</Link>
    </div>
  ),
  notFoundComponent: () => (
    <div className="flex h-[100dvh] flex-col items-center justify-center px-6 text-center">
      <p className="text-lg font-medium">No gatherings in that city yet</p>
      <Link to="/cities" className="mt-4 text-sm text-clay underline">Browse other cities</Link>
    </div>
  ),
  component: CityPage,
});

function CityPage() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(cityQuery(slug));
  if (!data) return null;

  return (
    <div className="page-wash min-h-[100dvh] pb-24">
      <div className="mx-auto max-w-3xl px-5 pt-16">
        <Link to="/cities" className="text-[12px] font-medium uppercase tracking-[0.22em] text-muted-foreground hover:text-foreground">
          ← All cities
        </Link>
        <SectionHeader
          className="mt-6"
          eyebrow={data.country}
          title={<>This week in <span className="not-italic font-display">{data.city}</span></>}
          subtitle={`${data.activities.length} upcoming gathering${data.activities.length === 1 ? "" : "s"}`}
        />

        <ul className="mt-10 grid gap-4 sm:grid-cols-2">
          {data.activities.map((a, i) => (
            <motion.li
              key={a.id}
              initial={{ y: 14, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.05 + i * 0.04, duration: 0.4 }}
            >
              <Link
                to="/activity/$id"
                params={{ id: a.id }}
                className="group block overflow-hidden rounded-3xl glass-panel"
              >
                <div
                  className="h-40 w-full bg-cover bg-center transition-transform duration-[var(--duration-slow)] ease-[var(--ease-apple)] group-hover:scale-[1.03]"
                  style={{ backgroundImage: `url(${a.cover_url ?? "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1000&q=70&auto=format"})` }}
                />
                <div className="p-4">
                  <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-clay">{a.category}</p>
                  <p className="mt-1 text-[15px] font-semibold tracking-tight text-ink">{a.title}</p>
                  <p className="mt-1 text-[12.5px] text-muted-foreground">
                    {format(new Date(a.starts_at), "EEE, MMM d · h:mm a")}
                  </p>
                </div>
              </Link>
            </motion.li>
          ))}
        </ul>
      </div>
    </div>
  );
}
