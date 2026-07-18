import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin, Compass, Plus, X, Loader2, Trash2, LocateFixed, Minus } from "lucide-react";
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
import { getLocationPhoto } from "@/lib/place-photo.functions";

const TITLE_PLACEHOLDERS: Record<string, string> = {
  Dinner: "Sunset ramen in Shibuya",
  Adventure: "Sunrise hike above the fjord",
  Coworking: "Slow mornings & flat whites",
  Wellness: "Rooftop yoga before the heat",
  Food: "Taco crawl through the old town",
  Nightlife: "Rooftop cocktails, no phones",
};

const DESC_PLACEHOLDERS: Record<string, string> = {
  Dinner: "Small table, big conversations. Bring an appetite. (optional)",
  Adventure: "Bring shoes with grip and a light layer. (optional)",
  Coworking: "Laptops open, small talk welcome. (optional)",
  Wellness: "Mats provided. Come as you are. (optional)",
  Food: "Five stops, one street, zero plans. (optional)",
  Nightlife: "Dress how you feel. Stay as long as you like. (optional)",
};

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

  const pins = useMemo(
    () =>
      filtered.map((a) => ({
        id: a.id,
        lat: a.lat,
        lng: a.lng,
        label: a.title,
        category: a.category,
        mine: !!user && a.host_id === user.id,
      })),
    [filtered, user],
  );


  function focusActivity(a: Activity) {
    setSelectedId(a.id);
    mapRef.current?.panTo(a.lat, a.lng, 12);
    // Smoothly snap the corresponding card into center of the rail
    const el = railRef.current?.querySelector<HTMLElement>(`[data-id="${a.id}"]`);
    el?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }

  const [removing, setRemoving] = useState(false);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);

  async function removeMyPin() {
    if (!myActivePin || !user) return;
    const id = myActivePin.id;
    setRemoving(true);
    try {
      const { error } = await supabase.from("activities").delete().eq("id", id).eq("host_id", user.id);
      if (error) throw error;
      toast.success("Pin removed");
      await qc.invalidateQueries({ queryKey: ["activities"] });
      setShowRemoveConfirm(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not remove");
    } finally {
      setRemoving(false);
    }
  }

  function confirmRemovePin() {
    if (!myActivePin) return;
    setShowRemoveConfirm(true);
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
    if (myActivePin) {
      toast.error("You already have an active pin. Remove it first.");
      setShowCreate(false);
      setGhostPin(null);
      return;
    }
    if (!form.title) {
      toast.error("Add a title");
      return;
    }
    setCreating(true);

    try {
      const [city, country = ""] = placeLabel.split(",").map((s) => s.trim());
      const duration = Math.min(24, Math.max(1, form.duration_hours || 2));
      const startsAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

      // Try Google Places for a real photo of this location; fall back per category.
      let coverUrl: string | null = null;
      try {
        const photo = await getLocationPhoto({
          data: { lat: ghostPin.lat, lng: ghostPin.lng, category: form.category },
        });
        coverUrl = photo.url;
      } catch {
        // non-fatal
      }

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
          cover_url: coverUrl,
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

  const [locating, setLocating] = useState(false);
  async function handleLocate() {
    setLocating(true);
    try {
      const pos = await mapRef.current?.locate();
      if (!pos) toast.error("Location unavailable");
    } finally {
      setLocating(false);
    }
  }

  const [searching, setSearching] = useState(false);
  async function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    // If any local activity matches, focus that first — cheapest hit.
    const local = filtered[0] ?? activities.find((a) =>
      `${a.title} ${a.city} ${a.country}`.toLowerCase().includes(q.toLowerCase()),
    );
    if (local) {
      mapRef.current?.flyTo(local.lat, local.lng, 11);
      setSelectedId(local.id);
      return;
    }
    setSearching(true);
    try {
      const r = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q)}`,
        { headers: { "Accept-Language": "en" } },
      );
      const j = await r.json();
      const hit = Array.isArray(j) ? j[0] : null;
      if (!hit) {
        toast.error(`Couldn't find "${q}"`);
        return;
      }
      mapRef.current?.flyTo(parseFloat(hit.lat), parseFloat(hit.lon), 11);
    } catch {
      toast.error("Search failed");
    } finally {
      setSearching(false);
    }
  }

  const railRafRef = useRef<number | null>(null);
  function onRailScroll() {
    if (railRafRef.current != null) return;
    railRafRef.current = requestAnimationFrame(() => {
      railRafRef.current = null;
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
    });
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
          if (myActivePin && id === myActivePin.id) {
            confirmRemovePin();
            return;
          }
          const a = filtered.find((x) => x.id === id);
          if (a) focusActivity(a);
        }}

        onHeadingChange={setHeading}
      />

      {/* Top gradient */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-56 bg-gradient-to-b from-[#f5eddc]/92 via-[#f5eddc]/55 to-transparent" />

      {/* Map style toggle — centered, below the bell cluster */}
      <motion.div
        initial={{ y: -8, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-30 mx-auto flex w-full max-w-[720px] justify-center px-5 pt-20 sm:px-7"
      >
        <h1 className="sr-only">Discover gatherings near you</h1>
        <MapTypeToggle value={mapView} onChange={setMapView} />
      </motion.div>





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

      {/* FAB — Add pin OR Remove your active pin */}
      <motion.button
        onClick={() => {
          if (!user) {
            toast.error("Sign in to drop a pin");
            return;
          }
          if (myActivePin) {
            confirmRemovePin();
            return;
          }
          setAddMode((v) => !v);
        }}
        whileTap={{ scale: 0.9 }}
        whileHover={{ scale: 1.06, y: -2 }}
        animate={
          addMode || myActivePin
            ? { scale: 1 }
            : { scale: [1, 1.04, 1] }
        }
        transition={
          addMode || myActivePin
            ? { type: "spring", stiffness: 380, damping: 22 }
            : { duration: 2.4, repeat: Infinity, ease: "easeInOut" }
        }
        className="absolute bottom-28 right-5 z-30 flex h-14 w-14 items-center justify-center rounded-full text-white shadow-[0_18px_36px_-14px_rgba(232,90,60,0.7)] sm:right-7"
        style={{
          background: myActivePin
            ? "linear-gradient(180deg,#f0a020,#c67a10)"
            : addMode
              ? "linear-gradient(180deg,#1a1614,#0a0908)"
              : "linear-gradient(180deg,#ff7a5c,#e85a3c)",
        }}
        aria-label={myActivePin ? "Remove your pin" : addMode ? "Cancel add pin" : "Add pin"}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={myActivePin ? "trash" : addMode ? "cancel" : "plus"}
            initial={{ opacity: 0, scale: 0.6, rotate: -90 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.6, rotate: 90 }}
            transition={{ type: "spring", stiffness: 420, damping: 22 }}
            className="flex items-center justify-center"
          >
            {myActivePin ? <Trash2 className="h-5 w-5" strokeWidth={2.2} /> : addMode ? <X className="h-6 w-6" strokeWidth={2.4} /> : <Plus className="h-6 w-6" strokeWidth={2.4} />}
          </motion.span>
        </AnimatePresence>
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
          {/* Editorial sheet header — right side padded so the FAB never overlaps the count */}
          <div className="mb-3 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4 pr-[88px]">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#6b5230]">Gobber · Discover</p>
              <h2 className="mt-1 truncate font-serif text-[28px] italic leading-[1] tracking-[-0.025em] text-[#0f0d0b]">
                Around you
              </h2>
            </div>
            <div className="shrink-0 text-right tabular-nums">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={isLoading ? "loading" : `${filtered.length}`}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                  className="block font-serif text-[26px] italic leading-none text-[#0f0d0b]"
                >
                  {isLoading ? "…" : filtered.length}
                </motion.span>
              </AnimatePresence>
              <p className="mt-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#6b5230]">
                {filtered.length === 1 ? "Gathering" : "Gatherings"}
              </p>
            </div>
          </div>


          {/* Search + categories live inside the sheet, beneath the handle */}
          <motion.form
            onSubmit={handleSearchSubmit}
            whileHover={{ y: -1 }}
            whileFocus={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 400, damping: 26 }}
            className="flex w-full items-center gap-2.5 rounded-full px-4 py-3.5 ring-1 ring-[#3a2a12]/[0.06] focus-within:ring-[#3a2a12]/[0.14] transition-shadow"
            style={{
              background: "color-mix(in oklab, #fffaf0 72%, transparent)",
              backdropFilter: "saturate(180%) blur(28px)",
              boxShadow:
                "inset 0 1px 0 rgba(255,255,255,0.65), 0 1px 2px rgba(60,42,20,0.05), 0 18px 40px -20px rgba(60,42,20,0.22)",
            }}
          >
            <motion.span
              key={searching ? "loading" : "idle"}
              initial={{ opacity: 0, scale: 0.6, rotate: -30 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 460, damping: 22 }}
              className="flex items-center"
            >
              {searching ? (
                <Loader2 className="h-[18px] w-[18px] animate-spin text-[#2a1c0c]" />
              ) : (
                <Search className="h-[18px] w-[18px] text-[#2a1c0c]" strokeWidth={2} />
              )}
            </motion.span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search a city or a vibe"
              className="w-full bg-transparent text-[15px] tracking-[-0.012em] outline-none placeholder:text-[#8a6d42]/80 text-[#1a1614]"
              enterKeyHint="search"
            />
            <AnimatePresence initial={false}>
              {query && (
                <motion.button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label="Clear"
                  initial={{ opacity: 0, scale: 0.6, rotate: -60 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, scale: 0.6, rotate: 60 }}
                  whileHover={{ rotate: 90, scale: 1.1 }}
                  whileTap={{ scale: 0.85 }}
                  transition={{ type: "spring", stiffness: 400, damping: 22 }}
                  className="text-[#2a1c0c] hover:text-[#1a1614]"
                >
                  <X className="h-4 w-4" />
                </motion.button>
              )}
            </AnimatePresence>
          </motion.form>

          <div
            className="relative -mx-5 mt-4"
            style={{
              WebkitMaskImage:
                "linear-gradient(to right, transparent 0, #000 32px, #000 calc(100% - 32px), transparent 100%)",
              maskImage:
                "linear-gradient(to right, transparent 0, #000 32px, #000 calc(100% - 32px), transparent 100%)",
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

          <div className="mb-2 mt-5 flex items-center justify-between">
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#6b5230]">
              {query ? "Matching your search" : category ? "Filtered gatherings" : "Nearby right now"}
            </p>
            <span className="hidden text-[10px] font-medium uppercase tracking-[0.2em] text-[#6b5230] sm:inline lg:hidden">
              Swipe · Pull to refresh
            </span>
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
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="w-full rounded-[22px] p-7 text-center ring-1 ring-[#3a2a12]/[0.06]"
                  style={{
                    background: "color-mix(in oklab, #fffaf0 72%, transparent)",
                    backdropFilter: "saturate(180%) blur(24px)",
                    WebkitBackdropFilter: "saturate(180%) blur(24px)",
                  }}
                >
                  <p className="text-[10.5px] font-semibold uppercase tracking-[0.24em] text-[#2a1c0c]">Quiet spot</p>
                  <h4 className="mt-1.5 font-serif italic text-[22px] leading-[1.05] tracking-[-0.02em] text-[#0f0d0b]">
                    {query || category ? "Nothing matches — yet." : "No gatherings here yet."}
                  </h4>
                  <p className="mt-1.5 text-[12.5px] text-[#2a1c0c]">
                    {query
                      ? "Try a different city, or start the vibe yourself."
                      : "Be the first to drop a pin and set the vibe."}
                  </p>
                  <div className="mt-4 flex items-center justify-center gap-2">
                    {(query || category) && (
                      <button
                        onClick={() => {
                          setQuery("");
                          setCategory(null);
                        }}
                        className="rounded-full bg-white/70 px-4 py-2 text-[12.5px] font-medium text-[#2b1d0f] ring-1 ring-[#3a2a12]/[0.08] transition hover:bg-white"
                      >
                        Clear filters
                      </button>
                    )}
                    <button
                      onClick={() => {
                        if (!user) return toast.error("Sign in to drop a pin");
                        if (myActivePin) return confirmRemovePin();
                        setAddMode(true);
                      }}
                      className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[12.5px] font-medium text-white shadow-[0_12px_28px_-12px_rgba(232,90,60,0.7)] transition"
                      style={{ background: "linear-gradient(180deg,#ff7a5c,#e85a3c)" }}
                    >
                      <Plus className="h-3.5 w-3.5" strokeWidth={2.4} />
                      Drop the first pin
                    </button>
                  </div>
                </motion.div>
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
                  style={{ backgroundImage: `url(${a.cover_url ?? "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=320&q=70&auto=format"})` }}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-[9.5px] font-semibold uppercase tracking-[0.22em] text-[#3a2a18]">{a.category}</p>
                  <h4 className="line-clamp-1 text-[14px] font-semibold tracking-[-0.01em] text-[#0f0d0b]">{a.title}</h4>
                  <p className="line-clamp-1 text-[11.5px] text-[#2a1c0c]">
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
                  <p className="text-[10.5px] font-semibold uppercase tracking-[0.24em] text-[#2a1c0c]">Drop a pin</p>
                  <h3 className="mt-1.5 font-serif italic text-[28px] leading-[1] tracking-[-0.02em] text-[#0f0d0b]">
                    New gathering
                  </h3>
                  <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/60 px-2.5 py-1 text-[11.5px] text-[#2b1d0f] ring-1 ring-white/60">
                    <MapPin className="h-3.5 w-3.5 text-[#e85a3c]" />
                    <span className="max-w-[240px] truncate">{placeLabel || "Selected location"}</span>
                  </div>
                </div>

                <div className="mt-5 space-y-3.5">
                  {/* Category picker — top of form, all tags visible */}
                  <div>
                    <label className="mb-1.5 block px-1 text-[10.5px] font-semibold uppercase tracking-[0.2em] text-[#2a1c0c]">
                      Vibe
                    </label>
                    <div
                      className="relative -mx-1"
                      style={{
                        WebkitMaskImage:
                          "linear-gradient(to right, transparent 0, #000 20px, #000 calc(100% - 20px), transparent 100%)",
                        maskImage:
                          "linear-gradient(to right, transparent 0, #000 20px, #000 calc(100% - 20px), transparent 100%)",
                      }}
                    >
                      <div
                        className="flex gap-1.5 overflow-x-auto px-1 py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                        role="radiogroup"
                        aria-label="Pin category"
                      >
                        {CATEGORIES.map((c) => {
                          const active = form.category === c.id;
                          return (
                            <motion.button
                              key={c.id}
                              type="button"
                              role="radio"
                              aria-checked={active}
                              onClick={() => setForm({ ...form, category: c.id })}
                              whileTap={{ scale: 0.92 }}
                              whileHover={{ y: -1 }}
                              transition={{ type: "spring", stiffness: 420, damping: 26 }}
                              className="relative shrink-0 rounded-full px-3 py-1.5 text-[12px] font-medium"
                              style={{ color: active ? "#fffaf0" : "#2b1d0f" }}
                            >
                              {active && (
                                <motion.span
                                  layoutId="createChipActive"
                                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                                  className="absolute inset-0 -z-10 rounded-full"
                                  style={{
                                    background: `linear-gradient(180deg, ${c.tint}, color-mix(in oklab, ${c.tint} 78%, #0f0d0b))`,
                                    boxShadow: `inset 0 1px 0 rgba(255,255,255,0.18), 0 10px 22px -12px ${c.tint}80`,
                                  }}
                                />
                              )}
                              {!active && (
                                <span
                                  className="absolute inset-0 -z-10 rounded-full ring-1 ring-white/60"
                                  style={{ background: "rgba(255,255,255,0.45)" }}
                                />
                              )}
                              <span className="relative flex items-center gap-1">
                                <motion.span
                                  animate={active ? { rotate: [0, -8, 8, 0], scale: [1, 1.15, 1] } : { rotate: 0, scale: 1 }}
                                  transition={{ duration: 0.5 }}
                                  aria-hidden="true"
                                >
                                  {c.icon}
                                </motion.span>
                                {c.label}
                              </span>
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <GlassInput
                    autoFocus
                    value={form.title}
                    onChange={(v) => setForm({ ...form, title: v })}
                    placeholder={TITLE_PLACEHOLDERS[form.category] ?? "What's happening?"}
                  />
                  <GlassTextarea
                    value={form.description}
                    onChange={(v) => setForm({ ...form, description: v })}
                    placeholder={DESC_PLACEHOLDERS[form.category] ?? "What's the vibe? (optional)"}
                  />

                  <div className="pt-1">
                    <label className="mb-1 block px-1 text-[10.5px] font-semibold uppercase tracking-[0.2em] text-[#2a1c0c]">
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
                    <p className="mt-2 px-1 text-[11px] text-[#3a2a18]">
                      Starts 10 min after you drop the pin. We'll pull a photo of the spot from Google Maps — or hand-pick one if there isn't one.
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

      {/* Remove pin confirmation — glass modal */}
      <AnimatePresence>
        {showRemoveConfirm && myActivePin && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[60] flex items-end justify-center px-4 pb-24 sm:items-center sm:pb-0"
            style={{
              background: "color-mix(in oklab, #1a1006 32%, transparent)",
              backdropFilter: "blur(14px) saturate(140%)",
              WebkitBackdropFilter: "blur(14px) saturate(140%)",
            }}
            onClick={() => !removing && setShowRemoveConfirm(false)}
          >
            <motion.div
              initial={{ y: 30, scale: 0.94, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              exit={{ y: 20, scale: 0.96, opacity: 0 }}
              transition={{ type: "spring", stiffness: 320, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-[380px] overflow-hidden rounded-[26px] ring-1 ring-black/[0.06]"
              style={{
                background:
                  "linear-gradient(180deg, rgba(255,251,242,0.92) 0%, rgba(250,240,220,0.88) 100%)",
                backdropFilter: "saturate(180%) blur(30px)",
                WebkitBackdropFilter: "saturate(180%) blur(30px)",
                boxShadow:
                  "inset 0 1px 0 rgba(255,255,255,0.9), 0 30px 80px -20px rgba(60,42,20,0.5)",
              }}
            >
              <div className="flex flex-col items-center px-7 pb-6 pt-8 text-center">
                <motion.div
                  initial={{ scale: 0.6, rotate: -8, opacity: 0 }}
                  animate={{ scale: 1, rotate: 0, opacity: 1 }}
                  transition={{ delay: 0.05, type: "spring", stiffness: 300, damping: 20 }}
                  className="mb-4 flex h-14 w-14 items-center justify-center rounded-full"
                  style={{
                    background: "linear-gradient(180deg, #fef1e6, #fbdcc4)",
                    boxShadow:
                      "inset 0 1px 0 rgba(255,255,255,0.8), 0 8px 20px -8px rgba(232,90,60,0.35)",
                  }}
                >
                  <Trash2 className="h-6 w-6 text-[#c94a2a]" strokeWidth={2.2} />
                </motion.div>
                <h3 className="font-serif text-[26px] italic leading-[1] tracking-[-0.02em] text-[#0f0d0b]">
                  Remove pin?
                </h3>
                <p className="mt-2.5 text-[13.5px] leading-[1.5] tracking-[-0.005em] text-[#2a1c0c]">
                  "<span className="font-medium text-[#1a1614]">{myActivePin.title}</span>" will disappear from the map for everyone.
                </p>
              </div>

              <div className="flex gap-2 border-t border-black/[0.06] bg-white/25 px-4 py-4">
                <button
                  type="button"
                  onClick={() => setShowRemoveConfirm(false)}
                  disabled={removing}
                  className="flex-1 rounded-full py-3 text-[13.5px] font-semibold text-[#1a1614] ring-1 ring-black/[0.08] transition hover:bg-white/60 disabled:opacity-50"
                  style={{
                    background: "rgba(255,255,255,0.55)",
                    backdropFilter: "blur(12px)",
                    WebkitBackdropFilter: "blur(12px)",
                  }}
                >
                  Keep it
                </button>
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.96 }}
                  onClick={removeMyPin}
                  disabled={removing}
                  className="flex flex-1 items-center justify-center gap-2 rounded-full py-3 text-[13.5px] font-semibold text-white shadow-[0_10px_24px_-10px_rgba(232,90,60,0.7)] transition disabled:opacity-70"
                  style={{
                    background: "linear-gradient(180deg,#ff6a4c,#c94a2a)",
                  }}
                >
                  {removing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" strokeWidth={2.2} />}
                  {removing ? "Removing…" : "Remove"}
                </motion.button>
              </div>
            </motion.div>
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
      whileHover={{ y: -2, scale: 1.03 }}
      whileTap={{ scale: 0.92 }}
      animate={active ? { scale: 1.04 } : { scale: 1 }}
      onClick={onClick}
      transition={{ type: "spring", stiffness: 420, damping: 26 }}
      className="relative shrink-0 rounded-full px-4 py-2 text-[13px] font-medium tracking-[-0.008em]"
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
      animate={{
        opacity: 1,
        y: active ? -4 : 0,
        filter: "blur(0px)",
        scale: active ? 1.02 : 0.97,
      }}
      exit={{ opacity: 0, y: -8, filter: "blur(14px)", scale: 0.96 }}
      transition={{
        delay,
        opacity: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
        filter: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
        y: { type: "spring", stiffness: 380, damping: 32, mass: 0.7 },
        scale: { type: "spring", stiffness: 380, damping: 30, mass: 0.7 },
      }}
      whileHover={{ y: -6 }}
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      className={`group w-[260px] shrink-0 snap-center snap-always overflow-hidden rounded-[22px] text-left ring-1 ring-[#3a2a12]/[0.06] transition-shadow will-change-transform ${
        active ? "shadow-[0_28px_60px_-24px_rgba(50,34,15,0.42)]" : "shadow-[0_10px_28px_-18px_rgba(50,34,15,0.18)]"
      }`}
      style={{
        background: "color-mix(in oklab, #fffaf0 88%, transparent)",
        backdropFilter: "saturate(180%) blur(20px)",
        WebkitBackdropFilter: "saturate(180%) blur(20px)",
      }}
    >
      <div
        className="h-36 w-full bg-cover bg-center transition-transform duration-[900ms] group-hover:scale-[1.04]"
        style={{ backgroundImage: `url(${a.cover_url ?? "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=75&auto=format"})` }}
      />
      <div className="p-4">
        <p className="text-[9.5px] font-semibold uppercase tracking-[0.22em] text-[#3a2a18]">{a.category}</p>
        <h3 className="mt-1 line-clamp-1 font-serif italic text-[19px] leading-tight tracking-[-0.02em] text-[#0f0d0b]">{a.title}</h3>
        <div className="mt-2 flex items-center gap-1.5 text-[11.5px] text-[#2a1c0c]">
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
      className="h-[48px] w-full rounded-[12px] px-4 text-[15px] tracking-[-0.01em] text-[#0f0d0b] placeholder:text-[#6b5230] outline-none transition-all duration-300 focus:bg-white/45"
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
      className="w-full resize-none rounded-[12px] px-4 py-3 text-[14px] tracking-[-0.01em] text-[#0f0d0b] placeholder:text-[#6b5230] outline-none transition-all duration-300 focus:bg-white/45"
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
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-medium uppercase tracking-[0.16em] text-[#2a1c0c]">
          {suffix}
        </span>
      )}
    </div>
  );
}

