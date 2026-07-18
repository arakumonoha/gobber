import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import { format } from "date-fns";
import { useUser } from "@/hooks/use-user";
import { useMyRsvps } from "@/lib/activities";
import { useActivities } from "@/lib/activities";
import { BottomNav } from "@/components/bottom-nav";

export const Route = createFileRoute("/_authenticated/trips")({
  head: () => ({ meta: [{ title: "My Trips — Gobber" }] }),
  component: Trips,
});

function Trips() {
  const { user } = useUser();
  const { data: rsvps = [] } = useMyRsvps(user?.id);
  const { data: activities = [] } = useActivities();

  const now = Date.now();
  const joined = activities.filter((a) => rsvps.some((r) => r.activity_id === a.id));
  const hosted = user ? activities.filter((a) => a.host_id === user.id) : [];
  const upcoming = [...joined, ...hosted].filter((a) => new Date(a.starts_at).getTime() >= now)
    .sort((a, b) => a.starts_at.localeCompare(b.starts_at));
  const past = [...joined, ...hosted].filter((a) => new Date(a.starts_at).getTime() < now);

  return (
    <div className="min-h-[100dvh] bg-background pb-32">
      <div className="mx-auto max-w-md px-5 pt-20">
        <motion.div
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center"
        >
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground">My</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-ink">Trips</h1>
        </motion.div>

        <Section title="Upcoming" items={upcoming} empty="Nothing on the horizon yet. Head to Discover." />
        <Section title="Past" items={past} empty="No memories to look back on yet." />
      </div>
      <BottomNav />
    </div>
  );
}

function Section({ title, items, empty }: { title: string; items: any[]; empty: string }) {
  return (
    <div className="mt-8">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">{title}</h2>
      {items.length === 0 ? (
        <p className="rounded-2xl bg-secondary/60 p-6 text-sm text-muted-foreground">{empty}</p>
      ) : (
        <div className="space-y-3">
          {items.map((a) => (
            <Link key={a.id} to="/activity/$id" params={{ id: a.id }} className="flex gap-3 rounded-2xl bg-card p-3 shadow-glass transition hover:-translate-y-0.5">
              <div className="h-16 w-16 shrink-0 rounded-xl bg-cover bg-center" style={{ backgroundImage: `url(${a.cover_url ?? ""})` }} />
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-medium uppercase tracking-widest text-clay">{a.category}</p>
                <h3 className="line-clamp-1 text-sm font-semibold text-ink">{a.title}</h3>
                <p className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground"><MapPin className="h-3 w-3" />{a.city} · {format(new Date(a.starts_at), "MMM d, h:mm a")}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
