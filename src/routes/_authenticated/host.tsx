import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@/hooks/use-user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CATEGORIES } from "@/lib/categories";
import { BottomNav } from "@/components/bottom-nav";
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
    <div className="min-h-[100dvh] bg-background pb-32">
      <div className="mx-auto max-w-md px-5 pt-6">
        {/* Balanced 3-column header: back · label · spacer */}
        <div className="grid grid-cols-[2.5rem_1fr_2.5rem] items-center">
          <button
            onClick={() => navigate({ to: "/discover" })}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary/70 backdrop-blur transition hover:bg-secondary"
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <p className="text-center text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
            Host
          </p>
          <div className="h-10 w-10" aria-hidden />
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

        <form onSubmit={submit} className="mt-8 space-y-5">
          <Field label="Title">
            <Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Sunset ramen in Shibuya" className="h-11 rounded-xl text-center" />
          </Field>

          <Field label="Description">
            <Textarea required rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What will the vibe be?" className="rounded-xl resize-none" />
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
                    className={`h-10 rounded-full text-[12.5px] font-medium tracking-tight transition ${
                      active
                        ? "bg-primary text-primary-foreground shadow-[0_6px_20px_-10px_theme(colors.primary.DEFAULT)]"
                        : "bg-secondary/70 text-foreground hover:bg-secondary"
                    }`}
                  >
                    {c.icon} {c.label}
                  </button>
                );
              })}
            </div>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="City"><Input required value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="Lisbon" className="h-11 rounded-xl text-center" /></Field>
            <Field label="Country"><Input required value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} placeholder="Portugal" className="h-11 rounded-xl text-center" /></Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="When"><Input required type="datetime-local" value={form.starts_at} onChange={(e) => setForm({ ...form, starts_at: e.target.value })} className="h-11 rounded-xl text-center" /></Field>
            <Field label="Max spots"><Input required type="number" min={2} max={30} value={form.max_spots} onChange={(e) => setForm({ ...form, max_spots: parseInt(e.target.value) || 6 })} className="h-11 rounded-xl text-center" /></Field>
          </div>

          <Field label="Cover image (optional)">
            <Input value={form.cover_url} onChange={(e) => setForm({ ...form, cover_url: e.target.value })} placeholder="https://…" className="h-11 rounded-xl text-center" />
          </Field>

          <div className="pt-2">
            <Button type="submit" disabled={loading} className="mx-auto flex h-12 w-full items-center justify-center rounded-full text-[15px] font-medium">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Post gathering"}
            </Button>
          </div>
        </form>
      </div>
      <BottomNav />
    </div>
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
