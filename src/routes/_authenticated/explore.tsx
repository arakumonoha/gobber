import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Globe2, MapPin, Users, X, Plus } from "lucide-react";
import { format } from "date-fns";
import { SatelliteMap } from "@/components/satellite-map";
import { BottomNav } from "@/components/bottom-nav";
import { useActivities, type Activity } from "@/lib/activities";
import { CATEGORIES } from "@/lib/categories";

export const Route = createFileRoute("/_authenticated/explore")({
  head: () => ({
    meta: [
      { title: "Explore — NomadTable" },
      { name: "description", content: "Surf the globe. Discover live gatherings pinned by nomads everywhere." },
    ],
  }),
  component: Explore,
});

function Explore() {
  const { data: activities = [] } = useActivities();
  const [category, setCategory] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const navigate = useNavigate();

  const filtered = useMemo(
    () => activities.filter((a) => (category ? a.category === category : true)),
    [activities, category],
  );

  const pins = filtered.map((a) => ({ id: a.id, lat: a.lat, lng: a.lng, label: a.title, category: a.category }));
  const selected = selectedId ? activities.find((a) => a.id === selectedId) ?? null : null;

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-background">
      <SatelliteMap
        pins={pins}
        variant="glass"
        center={[10, 25]}
        zoom={1.8}
        className="absolute inset-0"
        onPinClick={(id) => setSelectedId(id)}
      />

      {/* Vignette */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-52 bg-gradient-to-b from-background/60 via-background/10 to-transparent" />

      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-20 px-4 pt-6 sm:px-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full glass shadow-glass">
              <Globe2 className="h-4 w-4 text-clay" />
            </div>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">Live on the globe</p>
              <h1 className="text-2xl font-semibold tracking-tight text-ink">Explore</h1>
            </div>
          </div>
          <Link
            to="/host"
            className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-float transition hover:-translate-y-0.5"
          >
            <Plus className="h-3.5 w-3.5" />
            Pin a gathering
          </Link>
        </div>

        <div className="mt-4 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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

      {/* Stat chip */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="pointer-events-none absolute left-1/2 top-40 z-10 -translate-x-1/2 rounded-full glass px-4 py-1.5 text-[11px] font-medium text-foreground shadow-glass"
      >
        {filtered.length} gathering{filtered.length === 1 ? "" : "s"} pinned worldwide
      </motion.div>

      {/* Selected activity glass card */}
      <AnimatePresence>
        {selected && (
          <motion.div
            key={selected.id}
            initial={{ y: 200, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 200, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
            className="absolute inset-x-4 bottom-28 z-20 sm:inset-x-auto sm:right-6 sm:left-auto sm:bottom-28 sm:w-96"
          >
            <div className="overflow-hidden rounded-3xl glass shadow-float">
              <div className="relative h-40 w-full overflow-hidden">
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${selected.cover_url ?? "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1200&q=80"})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                <button
                  onClick={() => setSelectedId(null)}
                  className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/25 backdrop-blur-xl ring-1 ring-white/50 text-white"
                >
                  <X className="h-4 w-4" />
                </button>
                <div className="absolute left-4 bottom-3 text-white">
                  <p className="text-[10px] font-medium uppercase tracking-widest opacity-90">{selected.category}</p>
                  <h3 className="text-lg font-semibold leading-tight">{selected.title}</h3>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{selected.city}, {selected.country}</span>
                  <span>·</span>
                  <span>{format(new Date(selected.starts_at), "MMM d, p")}</span>
                  <span>·</span>
                  <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{selected.max_spots}</span>
                </div>
                <p className="mt-2 line-clamp-2 text-sm text-foreground/80">{selected.description}</p>
                <button
                  onClick={() => navigate({ to: "/activity/$id", params: { id: selected.id } })}
                  className="mt-3 w-full rounded-full bg-primary py-2.5 text-sm font-semibold text-primary-foreground shadow-lg transition hover:-translate-y-0.5"
                >
                  View gathering
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recently pinned rail (only when nothing selected) */}
      {!selected && (
        <motion.div
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 220, damping: 26 }}
          className="absolute inset-x-0 bottom-24 z-10 px-4 sm:px-6"
        >
          <div className="mb-2 flex items-baseline justify-between px-1">
            <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">Recently pinned</p>
            <span className="text-[11px] text-muted-foreground">Tap a pin to preview</span>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {filtered.slice(0, 10).map((a) => (
              <MiniCard key={a.id} a={a} onClick={() => setSelectedId(a.id)} />
            ))}
            {filtered.length === 0 && (
              <div className="w-full rounded-2xl glass p-6 text-center shadow-glass">
                <p className="text-sm font-medium">No pins yet in this category</p>
                <p className="mt-1 text-xs text-muted-foreground">Drop the first one from Host.</p>
              </div>
            )}
          </div>
        </motion.div>
      )}

      <BottomNav />
    </div>
  );
}

function MiniCard({ a, onClick }: { a: Activity; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="group flex w-56 shrink-0 items-center gap-3 rounded-2xl glass p-2 pr-3 text-left shadow-glass transition hover:-translate-y-0.5"
    >
      <div
        className="h-14 w-14 shrink-0 rounded-xl bg-cover bg-center"
        style={{ backgroundImage: `url(${a.cover_url ?? "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600&q=80"})` }}
      />
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-medium uppercase tracking-widest text-clay">{a.category}</p>
        <h4 className="line-clamp-1 text-sm font-semibold text-ink">{a.title}</h4>
        <p className="line-clamp-1 text-[11px] text-muted-foreground">{a.city}, {a.country}</p>
      </div>
    </button>
  );
}
