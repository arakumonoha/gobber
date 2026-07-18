import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, CalendarIcon, ImagePlus, Loader2, X } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@/hooks/use-user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CATEGORIES } from "@/lib/categories";
import { BottomNav } from "@/components/bottom-nav";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/host")({
  head: () => ({ meta: [{ title: "Host a gathering — Gobber" }] }),
  component: HostPage,
});

function HostPage() {
  const navigate = useNavigate();
  const { user } = useUser();
  const [form, setForm] = useState({
    title: "", description: "", category: "Dinner",
    city: "", country: "", starts_at: "", max_spots: 6,
    cover_url: "",
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileUpload(file: File) {
    if (!user) return;
    if (!file.type.startsWith("image/")) { toast.error("Please choose an image file."); return; }
    if (file.size > 8 * 1024 * 1024) { toast.error("Image must be under 8 MB."); return; }
    setUploading(true);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("activity-covers").upload(path, file, {
        cacheControl: "3600", upsert: false, contentType: file.type,
      });
      if (upErr) throw upErr;
      const { data: signed, error: sErr } = await supabase.storage
        .from("activity-covers")
        .createSignedUrl(path, 60 * 60 * 24 * 365);
      if (sErr || !signed) throw sErr ?? new Error("Could not generate URL");
      setForm((f) => ({ ...f, cover_url: signed.signedUrl }));
      toast.success("Cover image uploaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally { setUploading(false); }
  }

  async function geocodeCity(): Promise<{ lat: number; lng: number } | null> {
    if (!form.city) return null;
    try {
      const r = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(`${form.city}, ${form.country}`)}`);
      const arr = await r.json();
      if (arr[0]) return { lat: parseFloat(arr[0].lat), lng: parseFloat(arr[0].lon) };
    } catch {}
    return null;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      const coords = await geocodeCity();
      if (!coords) { toast.error("Couldn't find that city. Try again."); setLoading(false); return; }
      await RateLimit.createActivity();
      const { data, error } = await supabase.from("activities").insert({
        host_id: user.id,
        title: form.title,
        description: form.description,
        category: form.category,
        city: form.city,
        country: form.country,
        lat: coords.lat, lng: coords.lng,
        starts_at: new Date(form.starts_at).toISOString(),
        max_spots: form.max_spots,
        cover_url: form.cover_url || null,
      }).select().single();
      if (error) throw error;
      toast.success("Gathering posted ✨");
      navigate({ to: "/activity/$id", params: { id: data.id } });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create");
    } finally { setLoading(false); }
  }

  return (
    <div className="relative min-h-[100dvh] overflow-hidden bg-background pb-32">
      {/* Ambient glass backdrop */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-primary/25 blur-[120px]" />
        <div className="absolute top-1/3 -right-24 h-[380px] w-[380px] rounded-full bg-accent/20 blur-[110px]" />
        <div className="absolute bottom-0 -left-24 h-[360px] w-[360px] rounded-full bg-primary/15 blur-[120px]" />
      </div>

      <div className="mx-auto max-w-md px-5 pt-20">
        {/* Balanced header: back button aligned left, section label centered */}
        <div className="relative flex h-10 items-center">
          <button
            onClick={() => navigate({ to: "/discover" })}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/40 bg-white/50 shadow-[0_6px_20px_-12px_rgba(0,0,0,0.25)] backdrop-blur-xl transition hover:bg-white/70"
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <p className="pointer-events-none absolute inset-x-0 text-center text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
            Host
          </p>
        </div>


        {/* Centered intro */}
        <motion.div
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mt-8 text-center"
        >
          <h1 className="font-serif text-[2.4rem] leading-[1.05] italic tracking-tight text-ink">
            A new gathering
          </h1>
          <p className="mx-auto mt-2 max-w-[18rem] text-[13.5px] text-muted-foreground">
            What are you gathering strangers for?
          </p>
        </motion.div>

        <motion.form
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.05, duration: 0.4 }}
          onSubmit={submit}
          className="mt-8 space-y-5 rounded-3xl border border-white/40 bg-white/55 p-5 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.35)] backdrop-blur-2xl"
        >
          <Field label="Title">
            <Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Sunset ramen in Shibuya" className="h-11 rounded-xl border-white/50 bg-white/60 text-center backdrop-blur-md" />
          </Field>

          <Field label="Description">
            <Textarea required rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What will the vibe be?" className="rounded-xl resize-none border-white/50 bg-white/60 backdrop-blur-md" />
          </Field>

          {/* Symmetric 2-col category grid — 6 chips fit as 3×2 */}
          <Field label="Category" center>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES.map((c) => {
                const active = form.category === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setForm({ ...form, category: c.id })}
                    className={`h-10 rounded-full text-[12.5px] font-medium tracking-tight backdrop-blur-md transition ${
                      active
                        ? "bg-primary text-primary-foreground shadow-[0_8px_24px_-10px_theme(colors.primary.DEFAULT)]"
                        : "border border-white/50 bg-white/50 text-foreground hover:bg-white/70"
                    }`}
                  >
                    {c.icon} {c.label}
                  </button>
                );
              })}
            </div>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="City"><Input required value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="Lisbon" className="h-11 rounded-xl border-white/50 bg-white/60 text-center backdrop-blur-md" /></Field>
            <Field label="Country"><Input required value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} placeholder="Portugal" className="h-11 rounded-xl border-white/50 bg-white/60 text-center backdrop-blur-md" /></Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="When">
              <DateTimePicker
                value={form.starts_at}
                onChange={(v) => setForm({ ...form, starts_at: v })}
              />
            </Field>
            <Field label="Max spots"><Input required type="number" min={2} max={30} value={form.max_spots} onChange={(e) => setForm({ ...form, max_spots: parseInt(e.target.value) || 6 })} className="h-11 rounded-xl border-white/50 bg-white/60 text-center backdrop-blur-md" /></Field>
          </div>

          <Field label="Cover image (optional)">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileUpload(f); e.target.value = ""; }}
            />
            {form.cover_url ? (
              <div className="relative overflow-hidden rounded-xl border border-white/50 shadow-[0_10px_30px_-18px_rgba(0,0,0,0.4)]">
                <img src={form.cover_url} alt="Cover preview" className="h-40 w-full object-cover" />
                <button
                  type="button"
                  onClick={() => setForm({ ...form, cover_url: "" })}
                  className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md transition hover:bg-black/60"
                  aria-label="Remove cover"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
                className="flex h-40 w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/60 bg-white/40 text-muted-foreground backdrop-blur-md transition hover:bg-white/60 disabled:opacity-60"
              >
                {uploading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <ImagePlus className="h-5 w-5" />
                    <span className="text-[13px] font-medium">Tap to upload from your device</span>
                    <span className="text-[11px] text-muted-foreground/70">PNG or JPG · up to 8 MB</span>
                  </>
                )}
              </button>
            )}
          </Field>

          <div className="pt-2">
            <Button type="submit" disabled={loading} className="mx-auto flex h-12 w-full items-center justify-center rounded-full text-[15px] font-medium shadow-[0_12px_30px_-14px_theme(colors.primary.DEFAULT)]">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Post gathering"}
            </Button>
          </div>
        </motion.form>
      </div>
      <BottomNav />
    </div>
  );
}

function DateTimePicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const date = value ? new Date(value) : undefined;
  const time = value ? format(new Date(value), "HH:mm") : "";

  function setDate(d: Date | undefined) {
    if (!d) return;
    const [h, m] = (time || "19:00").split(":").map(Number);
    const next = new Date(d);
    next.setHours(h || 19, m || 0, 0, 0);
    onChange(toLocalIso(next));
  }

  function setTime(t: string) {
    const base = date ?? new Date();
    const [h, m] = t.split(":").map(Number);
    const next = new Date(base);
    next.setHours(h || 0, m || 0, 0, 0);
    onChange(toLocalIso(next));
  }

  function toLocalIso(d: Date) {
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-white/50 bg-white/60 px-3 text-[13px] font-medium backdrop-blur-md transition hover:bg-white/80",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="h-4 w-4 opacity-70" />
          {date ? format(date, "MMM d · h:mm a") : "Pick date & time"}
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-0">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
          initialFocus
          className={cn("p-3 pointer-events-auto")}
        />
        <div className="flex items-center gap-2 border-t border-border/60 p-3">
          <Label className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">Time</Label>
          <Input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="h-9 flex-1 rounded-lg"
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}

function Field({ label, children, center }: { label: string; children: React.ReactNode; center?: boolean }) {
  return (
    <div>
      <Label className={`text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground ${center ? "block text-center" : ""}`}>
        {label}
      </Label>
      <div className="mt-2">{children}</div>
    </div>
  );
}
