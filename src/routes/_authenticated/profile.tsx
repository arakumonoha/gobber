import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { LogOut, Loader2 } from "lucide-react";
import { useUser } from "@/hooks/use-user";
import { supabase } from "@/integrations/supabase/client";
import { useMyRsvps, useActivities } from "@/lib/activities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BottomNav } from "@/components/bottom-nav";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({ meta: [{ title: "Profile — Gobber" }] }),
  component: Profile,
});

function Profile() {
  const { user } = useUser();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: rsvps = [] } = useMyRsvps(user?.id);
  const { data: activities = [] } = useActivities();
  const [profile, setProfile] = useState<{ display_name: string; bio: string; home_city: string; avatar_url: string }>({ display_name: "", bio: "", home_city: "", avatar_url: "" });
  const [loading, setLoading] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle().then(({ data }) => {
      if (data) setProfile({ display_name: data.display_name ?? "", bio: data.bio ?? "", home_city: data.home_city ?? "", avatar_url: data.avatar_url ?? "" });
    });
  }, [user]);

  const citiesVisited = new Set(activities.filter((a) => rsvps.some((r) => r.activity_id === a.id) || a.host_id === user?.id).map((a) => a.city)).size;
  const gatheringsJoined = rsvps.length;

  async function save() {
    if (!user) return;
    setLoading(true);
    const { error } = await supabase.from("profiles").update(profile).eq("id", user.id);
    if (error) toast.error(error.message); else toast.success("Profile saved");
    setLoading(false);
  }

  async function signOut() {
    setSigningOut(true);
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  const initials = (profile.display_name || user?.email || "?").slice(0, 2).toUpperCase();

  return (
    <div className="min-h-[100dvh] bg-background pb-32">
      <div className="mx-auto max-w-md px-5 pt-8">
        <motion.div initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex items-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-cover bg-center text-2xl font-semibold text-primary-foreground shadow-float"
            style={{ backgroundImage: profile.avatar_url ? `url(${profile.avatar_url})` : "linear-gradient(135deg, oklch(0.68 0.08 70), oklch(0.5 0.045 55))" }}>
            {!profile.avatar_url && initials}
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-ink">{profile.display_name || "Traveler"}</h1>
            <p className="text-sm text-muted-foreground">{profile.home_city || user?.email}</p>
          </div>
        </motion.div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <StatCard n={gatheringsJoined} label="Gatherings joined" />
          <StatCard n={citiesVisited} label="Cities on the map" />
        </div>

        <div className="mt-8 space-y-4 rounded-3xl bg-card p-5 shadow-glass">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Edit profile</h2>
          <div><Label className="text-xs">Display name</Label><Input value={profile.display_name} onChange={(e) => setProfile({ ...profile, display_name: e.target.value })} className="mt-1 h-11 rounded-xl" /></div>
          <div><Label className="text-xs">Home city</Label><Input value={profile.home_city} onChange={(e) => setProfile({ ...profile, home_city: e.target.value })} className="mt-1 h-11 rounded-xl" placeholder="Lisbon" /></div>
          <div><Label className="text-xs">Avatar URL</Label><Input value={profile.avatar_url} onChange={(e) => setProfile({ ...profile, avatar_url: e.target.value })} className="mt-1 h-11 rounded-xl" placeholder="https://..." /></div>
          <div><Label className="text-xs">Bio</Label><Textarea rows={3} value={profile.bio} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} className="mt-1 rounded-xl" placeholder="I collect sunsets and third-wave coffee." /></div>
          <Button onClick={save} disabled={loading} className="h-11 w-full rounded-xl">{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}</Button>
        </div>

        <Button onClick={signOut} disabled={signingOut} variant="ghost" className="mt-4 h-11 w-full rounded-xl text-muted-foreground">
          <LogOut className="mr-2 h-4 w-4" /> Sign out
        </Button>
      </div>
      <BottomNav />
    </div>
  );
}

function StatCard({ n, label }: { n: number; label: string }) {
  return (
    <div className="rounded-2xl bg-card p-4 shadow-glass">
      <p className="text-3xl font-semibold tracking-tight text-ink">{n}</p>
      <p className="mt-1 text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
