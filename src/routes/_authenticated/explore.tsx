import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Globe2, MapPin, Users, X, Plus, Minus, Loader2, Check, LocateFixed, Compass } from "lucide-react";
import { format } from "date-fns";
import { GoogleMap, type GoogleMapHandle } from "@/components/google-map";
import { MapTypeToggle, type MapView } from "@/components/map-type-toggle";
import { BottomNav } from "@/components/bottom-nav";
import { useActivities, type Activity } from "@/lib/activities";
import { CATEGORIES } from "@/lib/categories";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@/hooks/use-user";
import { useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";

import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/explore")({
  head: () => ({
    meta: [
      { title: "Explore — Gobber" },
      { name: "description", content: "Surf the globe. Discover live gatherings pinned by nomads everywhere." },
    ],
  }),
  component: Explore,
});

type DropCoords = { lat: number; lng: number; city?: string; country?: string };

function Explore() {
  const { data: activities = [] } = useActivities();
  const [category, setCategory] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dropMode, setDropMode] = useState(false);
  const [drop, setDrop] = useState<DropCoords | null>(null);
  const [mapView, setMapView] = useState<MapView>("satellite");
  const [heading, setHeading] = useState(0);
  const [locating, setLocating] = useState(false);
  const mapRef = useRef<GoogleMapHandle>(null);
  const navigate = useNavigate();

  async function handleLocate() {
    setLocating(true);
    try {
      await mapRef.current?.locate();
    } finally {
      setLocating(false);
    }
  }


  const filtered = useMemo(
    () => activities.filter((a) => (category ? a.category === category : true)),
    [activities, category],
  );

  const pins = filtered.map((a) => ({ id: a.id, lat: a.lat, lng: a.lng, label: a.title, category: a.category }));
  const selected = selectedId ? activities.find((a) => a.id === selectedId) ?? null : null;

  async function handleDrop(c: { lng: number; lat: number }) {
    setDrop({ lat: c.lat, lng: c.lng });
    setSelectedId(null);
    setDropMode(true);
    // Reverse geocode (best-effort)
    try {
      const r = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${c.lat}&lon=${c.lng}`);
      const j = await r.json();
      const addr = j.address ?? {};
      setDrop({
        lat: c.lat,
        lng: c.lng,
        city: addr.city || addr.town || addr.village || addr.hamlet || addr.state || "Somewhere",
        country: addr.country ?? "",
      });
    } catch {
      setDrop({ lat: c.lat, lng: c.lng, city: "Somewhere", country: "" });
    }
  }

  async function handleMapClick(c: { lng: number; lat: number }) {
    if (!dropMode) return;
    await handleDrop(c);
  }

  function cancelDrop() {
    setDrop(null);
    setDropMode(false);
  }

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-background">
      <GoogleMap
        ref={mapRef}
        pins={pins}
        mapTypeId={mapView}
        center={{ lat: 25, lng: 10 }}
        zoom={2}
        className="absolute inset-0"
        cursor={dropMode ? "crosshair" : "default"}
        onPinClick={(id: string) => { if (!dropMode) setSelectedId(id); }}
        onMapClick={dropMode ? handleMapClick : undefined}
        onLongPress={(c) => { if (!dropMode) handleDrop(c); }}
        ghostPin={drop}
        onHeadingChange={setHeading}
      />

      {/* Vignette */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-52 bg-gradient-to-b from-background/60 via-background/10 to-transparent" />

      {/* Left column: stacked glass controls (zoom / locate / compass) */}
      <div className="absolute bottom-28 left-5 z-30 flex flex-col gap-2 sm:left-7">
        <div
          className="flex flex-col overflow-hidden rounded-2xl bg-white/85 ring-1 ring-black/[0.06] shadow-[0_18px_36px_-14px_rgba(60,42,20,0.28)]"
          style={{ backdropFilter: "saturate(180%) blur(20px)", WebkitBackdropFilter: "saturate(180%) blur(20px)" }}
        >
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => mapRef.current?.zoomIn()}
            className="flex h-11 w-11 items-center justify-center text-[#1a1614] transition hover:bg-black/5"
            aria-label="Zoom in"
          >
            <Plus className="h-4 w-4" strokeWidth={2.2} />
          </motion.button>
          <div className="mx-2 h-px bg-black/[0.08]" />
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => mapRef.current?.zoomOut()}
            className="flex h-11 w-11 items-center justify-center text-[#1a1614] transition hover:bg-black/5"
            aria-label="Zoom out"
          >
            <Minus className="h-4 w-4" strokeWidth={2.2} />
          </motion.button>
        </div>
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={handleLocate}
          disabled={locating}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-white/85 text-[#1a1614] ring-1 ring-black/[0.06] shadow-[0_18px_36px_-14px_rgba(60,42,20,0.28)] transition hover:bg-white"
          style={{ backdropFilter: "saturate(180%) blur(20px)", WebkitBackdropFilter: "saturate(180%) blur(20px)" }}
          aria-label="My location"
        >
          {locating ? <Loader2 className="h-4 w-4 animate-spin" /> : <LocateFixed className="h-4 w-4" strokeWidth={2.2} />}
        </motion.button>
        <AnimatePresence>
          {Math.abs(heading) > 1 && (
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              whileTap={{ scale: 0.92 }}
              onClick={() => mapRef.current?.resetHeading()}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white/85 ring-1 ring-black/[0.06] shadow-[0_18px_36px_-14px_rgba(60,42,20,0.28)]"
              style={{ backdropFilter: "saturate(180%) blur(20px)", WebkitBackdropFilter: "saturate(180%) blur(20px)" }}
              aria-label="Reset north"
            >
              <Compass className="h-4 w-4 text-[#1a1614]" style={{ transform: `rotate(${-heading}deg)` }} strokeWidth={2} />
            </motion.button>
          )}
        </AnimatePresence>
      </div>


      {/* Drop-mode banner */}
      <AnimatePresence>
        {dropMode && !drop && (
          <motion.div
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -30, opacity: 0 }}
            className="absolute inset-x-0 top-0 z-30 flex justify-center px-4 pt-3"
          >
            <div className="flex items-center gap-3 rounded-full bg-primary/95 px-4 py-2 text-xs font-medium text-primary-foreground shadow-float backdrop-blur">
              <span className="flex h-2 w-2 animate-pulse rounded-full bg-white" />
              Tap anywhere on the map to drop your pin
              <button onClick={cancelDrop} className="ml-1 rounded-full bg-white/20 px-2 py-0.5 text-[10px] uppercase tracking-wider">Cancel</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
          <button
            onClick={() => { setDropMode((v) => !v); setDrop(null); setSelectedId(null); }}
            className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold shadow-float transition hover:-translate-y-0.5 ${
              dropMode ? "bg-ink text-background" : "bg-primary text-primary-foreground"
            }`}
          >
            <Plus className={`h-3.5 w-3.5 transition-transform ${dropMode ? "rotate-45" : ""}`} />
            {dropMode ? "Cancel pin" : "Drop a pin"}
          </button>
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

      {/* Map style toggle */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.25 }}
        className="absolute right-4 top-40 z-20 sm:right-6"
      >
        <MapTypeToggle value={mapView} onChange={setMapView} />
      </motion.div>

      {/* Stat chip */}
      {!dropMode && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="pointer-events-none absolute left-1/2 top-40 z-10 -translate-x-1/2 rounded-full glass px-4 py-1.5 text-[11px] font-medium text-foreground shadow-glass"
        >
          {filtered.length > 0
            ? `${filtered.length} gathering${filtered.length === 1 ? "" : "s"} pinned worldwide`
            : "Nothing pinned yet — tap Drop a pin to start"}
        </motion.div>
      )}

      {/* Quick create sheet */}
      <AnimatePresence>
        {drop && (
          <QuickCreate
            drop={drop}
            onClose={cancelDrop}
            onCreated={(id) => {
              cancelDrop();
              navigate({ to: "/activity/$id", params: { id } });
            }}
          />
        )}
      </AnimatePresence>

      {/* Selected activity glass card */}
      <AnimatePresence>
        {selected && !drop && (
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

      {/* Recently pinned rail — only when we actually have pins and no overlay */}
      {!selected && !drop && filtered.length > 0 && (
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

function QuickCreate({
  drop,
  onClose,
  onCreated,
}: {
  drop: DropCoords;
  onClose: () => void;
  onCreated: (id: string) => void;
}) {
  const { user } = useUser();
  const qc = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "Dinner",
    starts_at: "",
    max_spots: 6,
    cover_url: "",
  });

  const geocoded = drop.city || drop.country;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("activities")
        .insert({
          host_id: user.id,
          title: form.title,
          description: form.description,
          category: form.category,
          city: drop.city || "Somewhere",
          country: drop.country || "—",
          lat: drop.lat,
          lng: drop.lng,
          starts_at: new Date(form.starts_at).toISOString(),
          max_spots: form.max_spots,
          cover_url: form.cover_url || null,
        })
        .select()
        .single();
      if (error) throw error;
      qc.invalidateQueries({ queryKey: ["activities"] });
      toast.success("Pinned to the globe ✨");
      onCreated(data.id);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create");
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ y: 260, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 260, opacity: 0 }}
      transition={{ type: "spring", stiffness: 240, damping: 28 }}
      className="absolute inset-x-3 bottom-24 z-30 sm:inset-x-auto sm:right-6 sm:left-auto sm:bottom-24 sm:w-[26rem]"
    >
      <div className="overflow-hidden rounded-3xl glass shadow-float">
        <div className="flex items-start justify-between gap-3 border-b border-white/40 p-4">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-widest text-clay">New gathering</p>
            <h3 className="text-base font-semibold text-ink">
              {geocoded ? `${drop.city}${drop.country ? `, ${drop.country}` : ""}` : "Locating…"}
            </h3>
            <p className="text-[11px] text-muted-foreground">
              {drop.lat.toFixed(3)}, {drop.lng.toFixed(3)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/60 backdrop-blur ring-1 ring-white/70"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={submit} className="space-y-3 p-4">
          <Input
            required
            placeholder="Title (e.g. Sunset ramen)"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="h-10 rounded-xl bg-white/70"
          />
          <Textarea
            required
            rows={2}
            placeholder="What's the vibe?"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="rounded-xl bg-white/70"
          />
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setForm({ ...form, category: c.id })}
                className={`rounded-full px-3 py-1 text-[11px] font-medium transition ${
                  form.category === c.id ? "bg-primary text-primary-foreground" : "bg-white/60 text-foreground"
                }`}
              >
                {c.icon} {c.label}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Input
              required
              type="datetime-local"
              value={form.starts_at}
              onChange={(e) => setForm({ ...form, starts_at: e.target.value })}
              className="h-10 rounded-xl bg-white/70"
            />
            <Input
              required
              type="number"
              min={2}
              max={30}
              value={form.max_spots}
              onChange={(e) => setForm({ ...form, max_spots: parseInt(e.target.value) || 6 })}
              className="h-10 rounded-xl bg-white/70"
            />
          </div>
          <Input
            placeholder="Cover image URL (optional)"
            value={form.cover_url}
            onChange={(e) => setForm({ ...form, cover_url: e.target.value })}
            className="h-10 rounded-xl bg-white/70"
          />
          <button
            type="submit"
            disabled={loading || !geocoded}
            className="mt-1 flex h-11 w-full items-center justify-center gap-2 rounded-full bg-primary text-sm font-semibold text-primary-foreground shadow-lg transition hover:-translate-y-0.5 disabled:opacity-60"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            Pin this gathering
          </button>
        </form>
      </div>
    </motion.div>
  );
}
