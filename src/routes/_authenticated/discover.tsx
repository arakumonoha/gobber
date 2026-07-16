import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin, Compass, Plus, X, Loader2 } from "lucide-react";
import { GoogleMap, type GoogleMapHandle } from "@/components/google-map";
import { MapTypeToggle, type MapView } from "@/components/map-type-toggle";
import { BottomNav } from "@/components/bottom-nav";
import { DraggableSheet } from "@/components/draggable-sheet";
import { useActivities, type Activity } from "@/lib/activities";
import { CATEGORIES } from "@/lib/categories";
import { format } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@/hooks/use-user";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/discover")({
  head: () => ({
    meta: [
      { title: "Discover — Gobber" },
      { name: "description", content: "Intimate gatherings happening around the world, right now." },
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

  // Pin creation flow
  const { user } = useUser();
  const [addMode, setAddMode] = useState(false);
  const [ghostPin, setGhostPin] = useState<{ lat: number; lng: number } | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [placeLabel, setPlaceLabel] = useState<string>("");
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "Dinner" as string,
    duration_hours: 2,
  });



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

  // A user is only allowed one *active* pin at a time (starts_at + duration_hours > now)
  const myActivePin = useMemo(() => {
    if (!user) return null;
    const now = Date.now();
    return (
      activities.find((a) => {
        if (a.host_id !== user.id) return false;
        const start = new Date(a.starts_at).getTime();
        const durHrs = (a as unknown as { duration_hours?: number }).duration_hours ?? 2;
        const end = start + durHrs * 60 * 60 * 1000;
        return end > now;
      }) ?? null
    );
  }, [activities, user]);

  const pins = filtered.map((a) => ({
    id: a.id,
    lat: a.lat,
    lng: a.lng,
    label: a.title,
    category: a.category,
    mine: !!user && a.host_id === user.id,
  }));

  function focusActivity(a: Activity) {
    setSelectedId(a.id);
    mapRef.current?.panTo(a.lat, a.lng, 12);
  }

  async function removeMyPin() {
    if (!myActivePin || !user) return;
    const id = myActivePin.id;
    try {
      const { error } = await supabase.from("activities").delete().eq("id", id).eq("host_id", user.id);
      if (error) throw error;
      toast.success("Pin removed");
      await qc.invalidateQueries({ queryKey: ["activities"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not remove");
    }
  }

  function confirmRemovePin() {
    if (!myActivePin) return;
    toast(`Remove "${myActivePin.title}"?`, {
      description: "This takes down your pin for everyone.",
      action: { label: "Remove", onClick: removeMyPin },
      duration: 6000,
    });
  }


  async function reverseGeocode(lat: number, lng: number): Promise<string> {
    try {
      const r = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10`,
        { headers: { "Accept-Language": "en" } },
      );
      const j = await r.json();
      const a = j.address ?? {};
      const city = a.city ?? a.town ?? a.village ?? a.county ?? "Somewhere";
      const country = a.country ?? "";
      return country ? `${city}, ${country}` : city;
    } catch {
      return "Selected location";
    }
  }

  async function handleMapClick(pos: { lat: number; lng: number }) {
    if (!addMode) return;
    setGhostPin(pos);
    setAddMode(false);
    setShowCreate(true);
    setPlaceLabel("Locating…");
    setPlaceLabel(await reverseGeocode(pos.lat, pos.lng));
  }

  async function submitCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !ghostPin) return;
    if (!form.title) {
      toast.error("Add a title");
      return;
    }
    setCreating(true);
    try {
      const [city, country = ""] = placeLabel.split(",").map((s) => s.trim());
      const duration = Math.min(24, Math.max(1, form.duration_hours || 2));
      const startsAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
      const { data, error } = await supabase
        .from("activities")
        .insert({
          host_id: user.id,
          title: form.title,
          description: form.description || form.title,
          category: form.category,
          city: city || "Somewhere",
          country: country || "Earth",
          lat: ghostPin.lat,
          lng: ghostPin.lng,
          starts_at: startsAt,
          duration_hours: duration,
          max_spots: 6,
          cover_url: null,
        })
        .select()
        .single();
      if (error) throw error;
      toast.success("Pin dropped ✨ Starts in 10 min");
      await qc.invalidateQueries({ queryKey: ["activities"] });
      setShowCreate(false);
      setGhostPin(null);
      setForm({ title: "", description: "", category: "Dinner", duration_hours: 2 });
      if (data) mapRef.current?.panTo(data.lat, data.lng, 13);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create");
    } finally {
      setCreating(false);
    }

  }


  function cancelCreate() {
    setShowCreate(false);
    setGhostPin(null);
  }

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
        cursor={addMode ? "crosshair" : "default"}
        ghostPin={ghostPin}
        onMapClick={handleMapClick}
        onPinClick={(id: string) => {
          const a = filtered.find((x) => x.id === id);
          if (a) focusActivity(a);
        }}
        onHeadingChange={setHeading}
      />

      {/* Top gradient */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-56 bg-gradient-to-b from-[#f5eddc]/92 via-[#f5eddc]/55 to-transparent" />

      {/* Header — centered, symmetric */}
      <motion.div
        initial={{ y: -12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-30 mx-auto w-full max-w-[720px] px-5 pt-9 sm:px-7"
      >
        <div className="flex flex-col items-center text-center">
          <p className="text-[10.5px] font-semibold uppercase tracking-[0.28em] text-[#4a3820]">Right now</p>
          <h1 className="mt-1.5 font-serif italic text-[44px] leading-[0.95] tracking-[-0.03em] text-[#0f0d0b] sm:text-[52px]">
            Discover.
          </h1>
          <div className="mt-4">
            <MapTypeToggle value={mapView} onChange={setMapView} />
          </div>
        </div>
      </motion.div>



      {/* Compass — mirrors FAB position on the left */}
      <AnimatePresence>
        {Math.abs(heading) > 1 && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => mapRef.current?.resetHeading()}
            className="absolute bottom-28 left-5 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-white/85 ring-1 ring-black/[0.06] shadow-[0_18px_36px_-14px_rgba(60,42,20,0.35)] backdrop-blur-xl sm:left-7"
            style={{ backdropFilter: "saturate(180%) blur(20px)" }}
            aria-label="Reset north"
          >
            <Compass className="h-5 w-5 text-[#1a1614]" style={{ transform: `rotate(${-heading}deg)` }} strokeWidth={2} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Add-mode banner */}
      <AnimatePresence>
        {addMode && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="absolute left-1/2 top-[220px] z-30 -translate-x-1/2 rounded-full px-4 py-2 text-[12.5px] font-medium text-white shadow-lg"
            style={{ background: "linear-gradient(180deg,#e85a3c,#c94a2a)" }}
          >
            Tap anywhere on the map to drop a pin
            <button onClick={() => setAddMode(false)} className="ml-3 opacity-80 hover:opacity-100">✕</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB — Add pin */}
      <motion.button
        onClick={() => {
          if (!user) {
            toast.error("Sign in to drop a pin");
            return;
          }
          setAddMode((v) => !v);
        }}
        whileTap={{ scale: 0.92 }}
        className="absolute bottom-28 right-5 z-30 flex h-14 w-14 items-center justify-center rounded-full text-white shadow-[0_18px_36px_-14px_rgba(232,90,60,0.7)] transition sm:right-7"
        style={{
          background: addMode
            ? "linear-gradient(180deg,#1a1614,#0a0908)"
            : "linear-gradient(180deg,#ff7a5c,#e85a3c)",
        }}
        aria-label={addMode ? "Cancel add pin" : "Add pin"}
      >
        {addMode ? <X className="h-6 w-6" strokeWidth={2.4} /> : <Plus className="h-6 w-6" strokeWidth={2.4} />}
      </motion.button>

      {/* Bottom sheet */}
      <DraggableSheet
        snapPoints={[180, 420, typeof window !== "undefined" ? Math.min(760, window.innerHeight - 80) : 760]}
        initialSnap={0}
        onRefresh={async () => {
          await qc.invalidateQueries({ queryKey: ["activities"] });
          await refetch();
        }}
      >
        <div className="px-5 pt-1">
          {/* Search + categories live inside the sheet, beneath the handle */}
          <div
            className="flex w-full items-center gap-2.5 rounded-full px-4 py-3 ring-1 ring-[#3a2a12]/[0.06]"
            style={{
              background: "color-mix(in oklab, #fffaf0 72%, transparent)",
              backdropFilter: "saturate(180%) blur(28px)",
              WebkitBackdropFilter: "saturate(180%) blur(28px)",
              boxShadow:
                "inset 0 1px 0 rgba(255,255,255,0.65), 0 1px 2px rgba(60,42,20,0.05), 0 18px 40px -20px rgba(60,42,20,0.22)",
            }}
          >
            <Search className="h-4 w-4 text-[#4a3820]" strokeWidth={2} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Where to? Lisbon, Tokyo, Bali…"
              className="w-full bg-transparent text-[14px] tracking-[-0.01em] outline-none placeholder:text-[#5a4530] text-[#1a1614]"
            />
          </div>

          <div
            className="relative -mx-5 mt-3"
            style={{
              WebkitMaskImage:
                "linear-gradient(to right, transparent 0, #000 28px, #000 calc(100% - 28px), transparent 100%)",
              maskImage:
                "linear-gradient(to right, transparent 0, #000 28px, #000 calc(100% - 28px), transparent 100%)",
            }}
          >
            <div className="flex gap-2 overflow-x-auto px-5 py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <CategoryChip active={!category} onClick={() => setCategory(null)}>All</CategoryChip>
              {CATEGORIES.map((c) => (
                <CategoryChip
                  key={c.id}
                  active={category === c.id}
                  onClick={() => setCategory(c.id === category ? null : c.id)}
                >
                  <span className="mr-1">{c.icon}</span>{c.label}
                </CategoryChip>
              ))}
            </div>
          </div>

          <div className="mb-3 mt-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#4a3820]">Around you</p>
              <h2 className="mt-0.5 text-[17px] font-semibold tracking-[-0.01em] text-[#0f0d0b]">
                {isLoading ? "Loading…" : `${filtered.length} gathering${filtered.length === 1 ? "" : "s"}`}
              </h2>
            </div>
            <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#4a3820]"><span className="hidden lg:inline">Click to collapse</span><span className="lg:hidden">Swipe · Pull to refresh</span></span>
          </div>


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
                  <p className="mt-1 text-xs text-muted-foreground">Tap the + button to drop the first pin.</p>
                </div>
              )}
            </AnimatePresence>
          </div>

          <div className="mt-4 space-y-2">
            <AnimatePresence mode="popLayout" initial={false}>
            {filtered.map((a, i) => (
              <motion.button
                key={"row-" + a.id}
                layout
                initial={{ opacity: 0, y: 10, filter: "blur(10px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -6, filter: "blur(10px)" }}
                transition={{ delay: i * 0.02, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                onClick={() => navigate({ to: "/activity/$id", params: { id: a.id } })}
                className="flex w-full items-center gap-3 rounded-2xl p-3 text-left ring-1 ring-[#3a2a12]/[0.06] transition hover:-translate-y-0.5"
                style={{
                  background: "color-mix(in oklab, #fffaf0 70%, transparent)",
                  backdropFilter: "saturate(180%) blur(22px)",
                  WebkitBackdropFilter: "saturate(180%) blur(22px)",
                  boxShadow:
                    "inset 0 1px 0 rgba(255,255,255,0.6), 0 10px 26px -18px rgba(50,34,15,0.22)",
                }}
              >
                <div
                  className="h-14 w-14 shrink-0 rounded-xl bg-cover bg-center ring-1 ring-[#3a2a12]/[0.06]"
                  style={{ backgroundImage: `url(${a.cover_url ?? "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=400&q=80"})` }}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-[9.5px] font-semibold uppercase tracking-[0.22em] text-[#5a4222]">{a.category}</p>
                  <h4 className="line-clamp-1 text-[14px] font-semibold tracking-[-0.01em] text-[#0f0d0b]">{a.title}</h4>
                  <p className="line-clamp-1 text-[11.5px] text-[#4a3820]">
                    {a.city}, {a.country} · {format(new Date(a.starts_at), "MMM d")}
                  </p>
                </div>
              </motion.button>
            ))}
            </AnimatePresence>
          </div>
        </div>
      </DraggableSheet>

      {/* Quick create modal */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            key="create-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[100] flex items-center justify-center px-5"
            style={{
              background: "rgba(30,22,12,0.28)",
              backdropFilter: "blur(22px) saturate(140%)",
              WebkitBackdropFilter: "blur(22px) saturate(140%)",
            }}
            onClick={cancelCreate}
          >
            <motion.form
              onSubmit={submitCreate}
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, y: 20, scale: 0.96, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: 10, scale: 0.97, filter: "blur(8px)" }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full max-w-[420px] overflow-hidden rounded-[26px]"
              style={{
                background: "linear-gradient(180deg, rgba(255,253,247,0.42) 0%, rgba(255,247,230,0.28) 100%)",
                backdropFilter: "saturate(180%) blur(48px)",
                WebkitBackdropFilter: "saturate(180%) blur(48px)",
                border: "1px solid rgba(255,255,255,0.55)",
                boxShadow:
                  "0 1px 0 rgba(255,255,255,0.75) inset, 0 40px 90px -30px rgba(60,42,20,0.4), 0 10px 30px -18px rgba(60,42,20,0.18)",
              }}
            >
              <motion.button
                type="button"
                onClick={cancelCreate}
                aria-label="Close"
                whileHover={{ rotate: 90, scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                transition={{ type: "spring", stiffness: 400, damping: 18 }}
                className="absolute right-3 top-3 z-20 flex h-8 w-8 items-center justify-center rounded-full text-[#2b1d0f] transition-colors hover:bg-black/5"
              >
                <X className="h-4 w-4" />
              </motion.button>

              <div className="px-7 pt-9 pb-6">
                <div className="text-left">
                  <p className="text-[10.5px] font-semibold uppercase tracking-[0.24em] text-[#4a3820]">Drop a pin</p>
                  <h3 className="mt-1.5 font-serif italic text-[28px] leading-[1] tracking-[-0.02em] text-[#0f0d0b]">
                    New gathering
                  </h3>
                  <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/60 px-2.5 py-1 text-[11.5px] text-[#2b1d0f] ring-1 ring-white/60">
                    <MapPin className="h-3.5 w-3.5 text-[#e85a3c]" />
                    <span className="max-w-[240px] truncate">{placeLabel || "Selected location"}</span>
                  </div>
                </div>

                <div className="mt-5 space-y-2.5">
                  <GlassInput
                    autoFocus
                    value={form.title}
                    onChange={(v) => setForm({ ...form, title: v })}
                    placeholder="Sunset ramen in Shibuya"
                  />
                  <GlassTextarea
                    value={form.description}
                    onChange={(v) => setForm({ ...form, description: v })}
                    placeholder="What's the vibe? (optional)"
                  />

                  <div
                    className="relative -mx-1 mt-1"
                    style={{
                      WebkitMaskImage:
                        "linear-gradient(to right, transparent 0, #000 20px, #000 calc(100% - 20px), transparent 100%)",
                      maskImage:
                        "linear-gradient(to right, transparent 0, #000 20px, #000 calc(100% - 20px), transparent 100%)",
                    }}
                  >
                    <div className="flex gap-1.5 overflow-x-auto px-1 py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                      {CATEGORIES.map((c) => {
                        const active = form.category === c.id;
                        return (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => setForm({ ...form, category: c.id })}
                            className={`shrink-0 rounded-full px-3 py-1.5 text-[12px] font-medium transition ${
                              active
                                ? "bg-[#0f0d0b] text-white shadow-[0_10px_24px_-12px_rgba(20,14,8,0.5)]"
                                : "bg-white/45 text-[#2b1d0f] ring-1 ring-white/60"
                            }`}
                          >
                            {c.icon} {c.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="pt-1">
                    <label className="mb-1 block px-1 text-[10.5px] font-semibold uppercase tracking-[0.2em] text-[#4a3820]">
                      Duration · max 24h
                    </label>
                    <GlassInputRaw
                      type="number"
                      min={1}
                      max={24}
                      value={String(form.duration_hours)}
                      onChange={(v) => {
                        const n = Math.min(24, Math.max(1, parseInt(v) || 1));
                        setForm({ ...form, duration_hours: n });
                      }}
                      suffix="hrs"
                    />
                    <p className="mt-2 px-1 text-[11px] text-[#5a4530]">
                      Starts automatically 10 min after you drop the pin. Fine-tune schedule and spots later from Manage.
                    </p>
                  </div>
                </div>


                <motion.button
                  type="submit"
                  disabled={creating}
                  whileTap={{ scale: 0.98 }}
                  className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-full text-[15px] font-medium text-white transition disabled:opacity-70"
                  style={{
                    background: "linear-gradient(180deg,#1a1614,#0a0908)",
                    boxShadow:
                      "inset 0 1px 0 rgba(255,255,255,0.14), 0 14px 28px -14px rgba(20,14,8,0.65)",
                  }}
                >
                  {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Post gathering"}
                </motion.button>
              </div>
            </motion.form>
          </motion.div>

        )}
      </AnimatePresence>

      <BottomNav />
    </div>
  );
}

function CategoryChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <motion.button
      layout
      whileTap={{ scale: 0.94 }}
      onClick={onClick}
      transition={{ type: "spring", stiffness: 420, damping: 32 }}
      className="relative shrink-0 rounded-full px-4 py-1.5 text-[12.5px] font-medium tracking-[-0.005em]"
      style={{
        color: active ? "#fffaf0" : "#3d3120",
      }}
    >
      {active && (
        <motion.span
          layoutId="chipActive"
          transition={{ type: "spring", stiffness: 380, damping: 34 }}
          className="absolute inset-0 -z-10 rounded-full"
          style={{
            background: "linear-gradient(180deg,#221a12,#0f0b07)",
            boxShadow:
              "inset 0 1px 0 rgba(255,255,255,0.12), 0 10px 24px -12px rgba(20,14,8,0.55)",
          }}
        />
      )}
      {!active && (
        <span
          className="absolute inset-0 -z-10 rounded-full ring-1 ring-[#3a2a12]/[0.06]"
          style={{
            background: "color-mix(in oklab, #fffaf0 68%, transparent)",
            backdropFilter: "saturate(180%) blur(20px)",
            WebkitBackdropFilter: "saturate(180%) blur(20px)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.6)",
          }}
        />
      )}
      <span className="relative">{children}</span>
    </motion.button>
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
      layout
      data-id={a.id}
      initial={{ opacity: 0, y: 18, filter: "blur(14px)", scale: 0.96 }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)", scale: 1 }}
      exit={{ opacity: 0, y: -8, filter: "blur(14px)", scale: 0.96 }}
      transition={{ delay, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`group w-[260px] shrink-0 snap-center overflow-hidden rounded-[22px] text-left ring-1 ring-[#3a2a12]/[0.06] transition-shadow ${
        active ? "shadow-[0_24px_54px_-24px_rgba(50,34,15,0.36)]" : "shadow-[0_10px_28px_-18px_rgba(50,34,15,0.18)]"
      }`}
      style={{
        background: "color-mix(in oklab, #fffaf0 88%, transparent)",
        backdropFilter: "saturate(180%) blur(20px)",
        WebkitBackdropFilter: "saturate(180%) blur(20px)",
      }}
    >
      <div
        className="h-36 w-full bg-cover bg-center transition-transform duration-[900ms] group-hover:scale-[1.04]"
        style={{ backgroundImage: `url(${a.cover_url ?? "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1200&q=80"})` }}
      />
      <div className="p-4">
        <p className="text-[9.5px] font-semibold uppercase tracking-[0.22em] text-[#5a4222]">{a.category}</p>
        <h3 className="mt-1 line-clamp-1 font-serif italic text-[19px] leading-tight tracking-[-0.02em] text-[#0f0d0b]">{a.title}</h3>
        <div className="mt-2 flex items-center gap-1.5 text-[11.5px] text-[#4a3820]">
          <MapPin className="h-3 w-3" strokeWidth={2} />
          <span className="line-clamp-1">{a.city}, {a.country}</span>
          <span className="mx-0.5">·</span>
          <span>{format(new Date(a.starts_at), "MMM d")}</span>
        </div>
      </div>
    </motion.button>

  );
}

const GLASS_INPUT_STYLE: React.CSSProperties = {
  background: "rgba(255,255,255,0.28)",
  border: "1px solid rgba(255,255,255,0.6)",
  backdropFilter: "blur(18px) saturate(180%)",
  WebkitBackdropFilter: "blur(18px) saturate(180%)",
  boxShadow:
    "inset 0 1px 0 rgba(255,255,255,0.75), inset 0 -1px 0 rgba(20,18,16,0.05), 0 4px 12px -8px rgba(60,42,20,0.15)",
};

function GlassInput({ value, onChange, placeholder, autoFocus }: {
  value: string; onChange: (v: string) => void; placeholder: string; autoFocus?: boolean;
}) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      autoFocus={autoFocus}
      className="h-[48px] w-full rounded-[12px] px-4 text-[15px] tracking-[-0.01em] text-[#0f0d0b] placeholder:text-[#5a4530] outline-none transition-all duration-300 focus:bg-white/45"
      style={GLASS_INPUT_STYLE}
    />
  );
}

function GlassTextarea({ value, onChange, placeholder }: {
  value: string; onChange: (v: string) => void; placeholder: string;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={2}
      className="w-full resize-none rounded-[12px] px-4 py-3 text-[14px] tracking-[-0.01em] text-[#0f0d0b] placeholder:text-[#5a4530] outline-none transition-all duration-300 focus:bg-white/45"
      style={GLASS_INPUT_STYLE}
    />
  );
}

function GlassInputRaw({ value, onChange, type, min, max, suffix }: {
  value: string; onChange: (v: string) => void; type: string; min?: number; max?: number; suffix?: string;
}) {
  return (
    <div className="relative">
      <input
        type={type}
        value={value}
        min={min}
        max={max}
        onChange={(e) => onChange(e.target.value)}
        className="h-[46px] w-full rounded-[12px] px-3 text-[13.5px] text-[#0f0d0b] outline-none transition-all duration-300 focus:bg-white/45"
        style={GLASS_INPUT_STYLE}
      />
      {suffix && (
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-medium uppercase tracking-[0.16em] text-[#4a3820]">
          {suffix}
        </span>
      )}
    </div>
  );
}

