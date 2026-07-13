import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin, Compass } from "lucide-react";
import { GoogleMap, type GoogleMapHandle } from "@/components/google-map";
import { MapTypeToggle, type MapView } from "@/components/map-type-toggle";
import { BottomNav } from "@/components/bottom-nav";
import { DraggableSheet } from "@/components/draggable-sheet";
import { useActivities, type Activity } from "@/lib/activities";
import { CATEGORIES } from "@/lib/categories";
import { format } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";

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
  const { data: activities = [], isLoading, refetch } = useActivities();
  const [category, setCategory] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [mapView, setMapView] = useState<MapView>("satellite");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [heading, setHeading] = useState(0);
  const navigate = useNavigate();
  const qc = useQueryClient();
  const mapRef = useRef<GoogleMapHandle>(null);
  const railRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    return activities.filter((a) => {
      if (category && a.category !== category) return false;
      if (query && !`${a.title} ${a.city} ${a.country}`.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }, [activities, category, query]);

  const pins = filtered.map((a) => ({ id: a.id, lat: a.lat, lng: a.lng, label: a.title, category: a.category }));

  function focusActivity(a: Activity) {
    setSelectedId(a.id);
    mapRef.current?.panTo(a.lat, a.lng, 12);
  }

  // Snap-scroll: when a card scrolls into view center, focus its pin.
  function onRailScroll() {
    const el = railRef.current;
    if (!el) return;
    const center = el.scrollLeft + el.clientWidth / 2;
    const children = Array.from(el.children) as HTMLElement[];
    let closest: HTMLElement | null = null;
    let closestDist = Infinity;
    for (const c of children) {
      const cCenter = c.offsetLeft + c.clientWidth / 2;
      const d = Math.abs(cCenter - center);
      if (d < closestDist) {
        closestDist = d;
        closest = c;
      }
    }
    const id = closest?.dataset.id;
    if (id && id !== selectedId) {
      const a = filtered.find((x) => x.id === id);
      if (a) {
        setSelectedId(a.id);
        mapRef.current?.panTo(a.lat, a.lng);
      }
    }
  }

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-background">
      <GoogleMap
        ref={mapRef}
        pins={pins}
        mapTypeId={mapView}
        className="absolute inset-0"
        onPinClick={(id: string) => {
          const a = filtered.find((x) => x.id === id);
          if (a) focusActivity(a);
        }}
        onHeadingChange={setHeading}
      />

      {/* Top gradient */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-40 bg-gradient-to-b from-background/70 to-transparent" />

      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-30 px-4 pt-safe-4 pt-6 sm:px-6"
      >
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">Right now</p>
            <h1 className="text-2xl font-semibold tracking-tight text-ink">Discover</h1>
          </div>
          <MapTypeToggle value={mapView} onChange={setMapView} />
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

      {/* Compass — appears when heading isn't north */}
      <AnimatePresence>
        {Math.abs(heading) > 1 && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => mapRef.current?.resetHeading()}
            className="absolute right-4 top-56 z-20 flex h-11 w-11 items-center justify-center rounded-full glass shadow-float sm:right-6"
            aria-label="Reset north"
          >
            <Compass className="h-5 w-5 text-clay" style={{ transform: `rotate(${-heading}deg)` }} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Draggable bottom sheet with pull-to-refresh */}
      <DraggableSheet
        snapPoints={[180, 420, typeof window !== "undefined" ? Math.min(760, window.innerHeight - 80) : 760]}
        initialSnap={1}
        onRefresh={async () => {
          await qc.invalidateQueries({ queryKey: ["activities"] });
          await refetch();
        }}
      >
        <div className="px-5 pt-1">
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="text-lg font-semibold text-ink">
              {isLoading ? "Loading…" : `${filtered.length} gathering${filtered.length === 1 ? "" : "s"}`}
            </h2>
            <span className="text-xs text-muted-foreground">Swipe · Pull to refresh</span>
          </div>

          {/* Horizontal snap-scroll rail */}
          <div
            ref={railRef}
            onScroll={onRailScroll}
            className="-mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth px-5 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            style={{ touchAction: "pan-x" }}
          >
            <AnimatePresence mode="popLayout">
              {filtered.slice(0, 20).map((a, i) => (
                <ActivityCard
                  key={a.id}
                  a={a}
                  active={selectedId === a.id}
                  onClick={() => {
                    focusActivity(a);
                    navigate({ to: "/activity/$id", params: { id: a.id } });
                  }}
                  delay={i * 0.03}
                />
              ))}
              {!isLoading && filtered.length === 0 && (
                <div className="w-full rounded-2xl bg-secondary/60 p-8 text-center">
                  <p className="text-sm font-medium">No gatherings here yet</p>
                  <p className="mt-1 text-xs text-muted-foreground">Be the first — host one from the button below.</p>
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* Expanded list (visible when sheet is opened tall) */}
          <div className="mt-4 space-y-2">
            {filtered.map((a) => (
              <button
                key={"row-" + a.id}
                onClick={() => navigate({ to: "/activity/$id", params: { id: a.id } })}
                className="flex w-full items-center gap-3 rounded-2xl bg-white/60 p-3 text-left shadow-glass transition hover:-translate-y-0.5"
              >
                <div
                  className="h-14 w-14 shrink-0 rounded-xl bg-cover bg-center"
                  style={{ backgroundImage: `url(${a.cover_url ?? "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=400&q=80"})` }}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-medium uppercase tracking-widest text-clay">{a.category}</p>
                  <h4 className="line-clamp-1 text-sm font-semibold text-ink">{a.title}</h4>
                  <p className="line-clamp-1 text-[11px] text-muted-foreground">
                    {a.city}, {a.country} · {format(new Date(a.starts_at), "MMM d")}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </DraggableSheet>

      <BottomNav />
    </div>
  );
}

function ActivityCard({
  a,
  onClick,
  delay,
  active,
}: {
  a: Activity;
  onClick: () => void;
  delay: number;
  active?: boolean;
}) {
  return (
    <motion.button
      data-id={a.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ delay, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`group w-64 shrink-0 snap-center overflow-hidden rounded-2xl bg-card text-left shadow-glass transition ${
        active ? "ring-2 ring-primary/70 -translate-y-0.5" : ""
      }`}
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
