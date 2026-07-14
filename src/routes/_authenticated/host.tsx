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
      <div className="mx-auto max-w-md px-5 pt-8">
        <button onClick={() => navigate({ to: "/" })} className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
          <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">Host</p>
          <h1 className="text-3xl font-semibold tracking-tight text-ink">A new gathering</h1>
          <p className="mt-1 text-sm text-muted-foreground">What are you gathering strangers for?</p>
        </motion.div>

        <form onSubmit={submit} className="mt-6 space-y-5">
          <Field label="Title"><Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Sunset ramen in Shibuya" className="h-11 rounded-xl" /></Field>
          <Field label="Description"><Textarea required rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What will the vibe be?" className="rounded-xl" /></Field>
          <Field label="Category">
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <button key={c.id} type="button" onClick={() => setForm({ ...form, category: c.id })}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition ${form.category === c.id ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"}`}>
                  {c.icon} {c.label}
                </button>
              ))}
            </div>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="City"><Input required value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="Lisbon" className="h-11 rounded-xl" /></Field>
            <Field label="Country"><Input required value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} placeholder="Portugal" className="h-11 rounded-xl" /></Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="When"><Input required type="datetime-local" value={form.starts_at} onChange={(e) => setForm({ ...form, starts_at: e.target.value })} className="h-11 rounded-xl" /></Field>
            <Field label="Max spots"><Input required type="number" min={2} max={30} value={form.max_spots} onChange={(e) => setForm({ ...form, max_spots: parseInt(e.target.value) || 6 })} className="h-11 rounded-xl" /></Field>
          </div>
          <Field label="Cover image URL (optional)"><Input value={form.cover_url} onChange={(e) => setForm({ ...form, cover_url: e.target.value })} placeholder="https://..." className="h-11 rounded-xl" /></Field>

          <Button type="submit" disabled={loading} className="h-12 w-full rounded-full text-base font-medium">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Post gathering"}
          </Button>
        </form>
      </div>
      <BottomNav />
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="text-xs font-medium">{label}</Label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}
