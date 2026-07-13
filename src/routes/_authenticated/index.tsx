import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin } from "lucide-react";
import { GoogleMap } from "@/components/google-map";
import { MapTypeToggle, type MapView } from "@/components/map-type-toggle";
import { BottomNav } from "@/components/bottom-nav";
import { useActivities, type Activity } from "@/lib/activities";
import { CATEGORIES } from "@/lib/categories";
import { format } from "date-fns";

export const Route = createFileRoute("/_authenticated/")({
  head: () => ({
    meta: [
      { title: "Discover — NomadTable" },
      { name: "description", content: "Discover intimate gatherings happening around the world right now." },
    ],
  }),
  component: Discover,
});

function Discover() {
  const { data: activities = [], isLoading } = useActivities();
  const [category, setCategory] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [mapView, setMapView] = useState<MapView>("satellite");
  const navigate = useNavigate();

  const filtered = useMemo(() => {
    return activities.filter((a) => {
      if (category && a.category !== category) return false;
      if (query && !`${a.title} ${a.city} ${a.country}`.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }, [activities, category, query]);

  const pins = filtered.map((a) => ({ id: a.id, lat: a.lat, lng: a.lng, label: a.title, category: a.category }));

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-background">
      <GoogleMap pins={pins} mapTypeId={mapView} className="absolute inset-0" onPinClick={(id: string) => navigate({ to: "/activity/$id", params: { id } })} />

      {/* Top gradient */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-40 bg-gradient-to-b from-background/70 to-transparent" />

      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-20 px-4 pt-safe-4 pt-6 sm:px-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">Right now</p>
            <h1 className="text-2xl font-semibold tracking-tight text-ink">Discover</h1>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2 rounded-full glass px-4 py-2.5 shadow-glass">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Where to? Lisbon, Tokyo, Bali..."
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>

        <div className="mt-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <button
            onClick={() => setCategory(null)}
            className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-medium transition ${!category ? "bg-primary text-primary-foreground" : "glass text-foreground"}`}
          >
            All
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              onClick={() => setCategory(c.id === category ? null : c.id)}
              className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-medium transition ${category === c.id ? "bg-primary text-primary-foreground" : "glass text-foreground"}`}
            >
              <span className="mr-1">{c.icon}</span>{c.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Bottom sheet */}
      <motion.div
        initial={{ y: 200, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.15, type: "spring", stiffness: 200, damping: 26 }}
        className="absolute inset-x-0 bottom-0 z-10 rounded-t-3xl glass pt-2 pb-28 shadow-float"
      >
        <div className="mx-auto mb-2 h-1 w-10 rounded-full bg-border" />
        <div className="px-5">
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="text-lg font-semibold text-ink">
              {isLoading ? "Loading…" : `${filtered.length} gathering${filtered.length === 1 ? "" : "s"}`}
            </h2>
            <span className="text-xs text-muted-foreground">Sorted by date</span>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <AnimatePresence mode="popLayout">
              {filtered.slice(0, 12).map((a, i) => (
                <ActivityCard key={a.id} a={a} onClick={() => navigate({ to: "/activity/$id", params: { id: a.id } })} delay={i * 0.04} />
              ))}
              {!isLoading && filtered.length === 0 && (
                <div className="w-full rounded-2xl bg-secondary/60 p-8 text-center">
                  <p className="text-sm font-medium">No gatherings here yet</p>
                  <p className="mt-1 text-xs text-muted-foreground">Be the first — host one from the button below.</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      <BottomNav />
    </div>
  );
}

function ActivityCard({ a, onClick, delay }: { a: Activity; onClick: () => void; delay: number }) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ delay, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      onClick={onClick}
      className="group w-64 shrink-0 overflow-hidden rounded-2xl bg-card text-left shadow-glass transition hover:-translate-y-0.5 hover:shadow-float"
    >
      <div
        className="h-32 w-full bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
        style={{ backgroundImage: `url(${a.cover_url ?? "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1200&q=80"})` }}
      />
      <div className="p-3">
        <p className="text-[10px] font-medium uppercase tracking-widest text-clay">{a.category}</p>
        <h3 className="mt-0.5 line-clamp-1 text-sm font-semibold text-ink">{a.title}</h3>
        <div className="mt-1.5 flex items-center gap-1 text-[11px] text-muted-foreground">
          <MapPin className="h-3 w-3" />
          <span className="line-clamp-1">{a.city}, {a.country}</span>
          <span className="mx-1">·</span>
          <span>{format(new Date(a.starts_at), "MMM d")}</span>
        </div>
      </div>
    </motion.button>
  );
}
