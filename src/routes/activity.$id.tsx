import { createFileRoute, Link, useNavigate, notFound } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowLeft, MapPin, Calendar, Users, Loader2 } from "lucide-react";
import { useSuspenseQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { publicActivityQuery } from "@/lib/public-catalog";
import { useRsvpsForActivity } from "@/lib/activities";
import { useUser } from "@/hooks/use-user";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { format } from "date-fns";
import { RateLimit } from "@/lib/rate-limit";
import { ReportDialog } from "@/components/report-dialog";

const BASE_URL = "https://gobber.lovable.app";

export const Route = createFileRoute("/activity/$id")({
  loader: async ({ params, context }) => {
    const data = await context.queryClient.ensureQueryData(publicActivityQuery(params.id));
    if (!data) throw notFound();
    return data;
  },
  head: ({ params, loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Gathering not found — Gobber" }, { name: "robots", content: "noindex" }] };
    }
    const a = loaderData;
    const url = `${BASE_URL}/activity/${params.id}`;
    const title = `${a.title} — ${a.city}, ${a.country}`;
    const desc = a.description?.slice(0, 155) ?? `Join ${a.title} in ${a.city}.`;
    const meta: Array<Record<string, string>> = [
      { title },
      { name: "description", content: desc },
      { property: "og:type", content: "article" },
      { property: "og:title", content: title },
      { property: "og:description", content: desc },
      { property: "og:url", content: url },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: desc },
    ];
    if (a.cover_url) {
      meta.push({ property: "og:image", content: a.cover_url });
      meta.push({ name: "twitter:image", content: a.cover_url });
    }
    return {
      meta,
      links: [{ rel: "canonical", href: url }],
      scripts: [{
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Event",
          name: a.title,
          description: a.description,
          startDate: a.starts_at,
          eventStatus: "https://schema.org/EventScheduled",
          eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
          location: { "@type": "Place", name: `${a.city}, ${a.country}`, geo: { "@type": "GeoCoordinates", latitude: a.lat, longitude: a.lng } },
          image: a.cover_url ? [a.cover_url] : undefined,
          organizer: a.host?.display_name ? { "@type": "Person", name: a.host.display_name } : undefined,
        }),
      }],
    };
  },
  errorComponent: () => (
    <div className="flex h-[100dvh] flex-col items-center justify-center px-6 text-center">
      <p className="text-lg font-medium">Something went wrong</p>
      <Link to="/" className="mt-4 text-sm text-clay underline">Back home</Link>
    </div>
  ),
  notFoundComponent: () => (
    <div className="flex h-[100dvh] flex-col items-center justify-center px-6 text-center">
      <p className="text-lg font-medium">Gathering not found</p>
      <Link to="/cities" className="mt-4 text-sm text-clay underline">Browse cities</Link>
    </div>
  ),
  component: ActivityDetail,
});

function ActivityDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { user } = useUser();
  const { data: activity } = useSuspenseQuery(publicActivityQuery(id));
  const { data: rsvps = [] } = useRsvpsForActivity(id);

  const myRsvp = user ? rsvps.find((r) => r.user_id === user.id) : undefined;
  const spotsLeft = activity ? activity.max_spots - rsvps.length : 0;

  const rsvpMut = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not signed in");
      await RateLimit.rsvp();
      if (myRsvp) {
        const { error } = await supabase.from("rsvps").delete().eq("id", myRsvp.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("rsvps").insert({ activity_id: id, user_id: user.id, status: "going" });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["rsvps", id] });
      qc.invalidateQueries({ queryKey: ["my-rsvps"] });
      toast.success(myRsvp ? "RSVP cancelled" : "You're in ✨");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  if (!activity) return null;

  return (
    <div className="min-h-[100dvh] bg-background pb-32">
      {/* Hero */}
      <div className="relative h-[42dvh] w-full overflow-hidden">
        <motion.div
          initial={{ scale: 1.1 }} animate={{ scale: 1 }} transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${activity.cover_url ?? "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1200&q=75&auto=format"})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-background/40" />
        <button
          onClick={() => (user ? navigate({ to: "/discover" }) : navigate({ to: "/" }))}
          className="absolute left-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full glass shadow-glass"
          aria-label="Back"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
      </div>

      {/* Content */}
      <motion.div
        initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.15, duration: 0.6 }}
        className="relative -mt-16 px-5"
      >
        <div className="mx-auto max-w-2xl rounded-3xl bg-card p-6 shadow-float">
          <p className="text-xs font-medium uppercase tracking-widest text-clay">{activity.category}</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-ink">{activity.title}</h1>

          {activity.host ? (
            <Link
              to={user ? "/u/$username" : "/"}
              params={user && activity.host.username ? { username: activity.host.username } : undefined as never}
              className="mt-3 inline-flex items-center gap-2 rounded-full bg-secondary/70 px-3 py-1.5 text-[12.5px] font-medium text-foreground hover:bg-secondary"
            >
              {activity.host.avatar_url ? (
                <img src={activity.host.avatar_url} alt="" className="h-5 w-5 rounded-full object-cover" />
              ) : (
                <span className="h-5 w-5 rounded-full bg-clay/30" />
              )}
              Hosted by {activity.host.display_name ?? activity.host.username ?? "a Gobber"}
            </Link>
          ) : null}

          <div className="mt-4 grid grid-cols-3 gap-3 border-y border-border py-4 text-center">
            <Stat icon={Calendar} label={format(new Date(activity.starts_at), "MMM d")} sub={format(new Date(activity.starts_at), "h:mm a")} />
            <Stat icon={MapPin} label={activity.city} sub={activity.country} />
            <Stat icon={Users} label={`${spotsLeft} left`} sub={`of ${activity.max_spots}`} />
          </div>

          <p className="mt-5 text-[15px] leading-relaxed text-foreground/85">{activity.description}</p>
        </div>
      </motion.div>

      {/* Sticky CTA — RSVP for signed-in, sign-in prompt otherwise */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border glass px-5 py-4 pb-safe-4">
        <div className="mx-auto max-w-md">
          {user ? (
            <Button
              onClick={() => rsvpMut.mutate()}
              disabled={rsvpMut.isPending || (spotsLeft <= 0 && !myRsvp)}
              className="h-12 w-full rounded-full text-base font-medium"
              variant={myRsvp ? "outline" : "default"}
            >
              {rsvpMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : myRsvp ? "You're going · Cancel RSVP" : spotsLeft <= 0 ? "Fully booked" : `Reserve a spot`}
            </Button>
          ) : (
            <Button
              onClick={() => navigate({ to: "/auth" })}
              className="h-12 w-full rounded-full text-base font-medium"
            >
              Sign in to reserve a spot
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, sub }: { icon: typeof MapPin; label: string; sub: string }) {
  return (
    <div>
      <Icon className="mx-auto h-4 w-4 text-clay" />
      <p className="mt-1 text-sm font-semibold text-ink">{label}</p>
      <p className="text-[11px] text-muted-foreground">{sub}</p>
    </div>
  );
}
