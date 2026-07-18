import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { citiesQuery } from "@/lib/public-catalog";
import { SectionHeader } from "@/components/ui/glass";

const BASE_URL = "https://gobber.lovable.app";

export const Route = createFileRoute("/cities")({
  loader: ({ context }) => context.queryClient.ensureQueryData(citiesQuery()),
  head: () => {
    const url = `${BASE_URL}/cities`;
    const title = "Cities on Gobber — traveler gatherings around the world";
    const desc = "Browse cities where strangers are meeting up right now — dinners, walks, coffee, wellness. Pick a city and drop in.";
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:type", content: "website" },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:url", content: url },
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
  errorComponent: () => (
    <div className="flex h-[100dvh] items-center justify-center px-6 text-center">
      <p className="text-lg font-medium">Couldn't load cities</p>
    </div>
  ),
  notFoundComponent: () => (
    <div className="flex h-[100dvh] items-center justify-center px-6 text-center">
      <p>Not found</p>
    </div>
  ),
  component: CitiesPage,
});

function CitiesPage() {
  const { data: cities = [] } = useSuspenseQuery(citiesQuery());

  return (
    <div className="page-wash min-h-[100dvh] pb-24">
      <div className="mx-auto max-w-4xl px-5 pt-16">
        <Link to="/" className="text-[12px] font-medium uppercase tracking-[0.22em] text-muted-foreground hover:text-foreground">
          ← Gobber
        </Link>
        <SectionHeader
          className="mt-6"
          eyebrow="Where it's happening"
          title={<>Cities on <span className="not-italic font-display">Gobber</span></>}
          subtitle={cities.length ? `${cities.length} cit${cities.length === 1 ? "y" : "ies"} with an active gathering right now.` : "No live gatherings yet — check back soon."}
        />

        {cities.length === 0 ? (
          <div className="mt-16 text-center text-muted-foreground">
            <p>Be the first to host — sign in and drop a pin.</p>
            <Link to="/auth" className="mt-4 inline-block rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground">
              Get started
            </Link>
          </div>
        ) : (
          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {cities.map((c, i) => (
              <motion.li
                key={c.slug}
                initial={{ y: 12, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.04 * i, duration: 0.35 }}
              >
                <Link
                  to="/city/$slug"
                  params={{ slug: c.slug }}
                  className="group relative block h-48 overflow-hidden rounded-3xl glass-panel"
                >
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-[var(--duration-slow)] ease-[var(--ease-apple)] group-hover:scale-[1.05]"
                    style={{ backgroundImage: `url(${c.cover_url ?? "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1000&q=70&auto=format"})` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                    <p className="text-[10.5px] font-medium uppercase tracking-[0.22em] opacity-80">{c.country}</p>
                    <p className="mt-0.5 text-xl font-semibold tracking-tight">{c.city}</p>
                    <p className="mt-1 text-[12px] opacity-90">
                      {c.count} gathering{c.count === 1 ? "" : "s"}
                    </p>
                  </div>
                </Link>
              </motion.li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
