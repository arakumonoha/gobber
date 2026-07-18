import { createFileRoute, Link, useNavigate, notFound } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowLeft, MapPin, Calendar, Users, Loader2, ShieldCheck, Sparkles, Star } from "lucide-react";
import { useSuspenseQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { publicActivityQuery } from "@/lib/public-catalog";
import { useUser } from "@/hooks/use-user";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { format } from "date-fns";
import { RateLimit } from "@/lib/rate-limit";
import { ReportDialog } from "@/components/report-dialog";
import {
  useAllRsvpsForActivity,
  useTrustProfile,
  useHostReviewStats,
  useMyReviewForActivity,
  useSubmitReview,
} from "@/lib/trust";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

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
  const { data: allRsvps = [] } = useAllRsvpsForActivity(id);
  const goingRsvps = allRsvps.filter((r) => r.status === "going");
  const waitlistRsvps = allRsvps.filter((r) => r.status === "waitlisted");

  const myRsvp = user ? allRsvps.find((r) => r.user_id === user.id) : undefined;
  const spotsLeft = activity ? Math.max(0, activity.max_spots - goingRsvps.length) : 0;
  const isFull = spotsLeft <= 0;
  const isPast = activity ? new Date(activity.starts_at).getTime() < Date.now() : false;
  const attended = !!myRsvp && myRsvp.status === "going" && isPast;

  const { data: hostTrust } = useTrustProfile(activity?.host_id);
  const { data: hostStats } = useHostReviewStats(activity?.host_id);
  const { data: myReview } = useMyReviewForActivity(id, user?.id);

  const rsvpMut = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not signed in");
      await RateLimit.rsvp();
      if (myRsvp) {
        const { error } = await supabase.from("rsvps").delete().eq("id", myRsvp.id);
        if (error) throw error;
      } else {
        const status = isFull ? "waitlisted" : "going";
        const { error } = await supabase.from("rsvps").insert({ activity_id: id, user_id: user.id, status });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["rsvps-all", id] });
      qc.invalidateQueries({ queryKey: ["rsvps", id] });
      qc.invalidateQueries({ queryKey: ["my-rsvps"] });
      const msg = myRsvp
        ? myRsvp.status === "waitlisted" ? "Removed from waitlist" : "RSVP cancelled"
        : isFull ? "Added to waitlist — we'll notify you if a spot opens" : "You're in ✨";
      toast.success(msg);
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
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Link
                to={user ? "/u/$username" : "/"}
                params={user && activity.host.username ? { username: activity.host.username } : undefined as never}
                className="inline-flex items-center gap-2 rounded-full bg-secondary/70 px-3 py-1.5 text-[12.5px] font-medium text-foreground hover:bg-secondary"
              >
                {activity.host.avatar_url ? (
                  <img src={activity.host.avatar_url} alt="" className="h-5 w-5 rounded-full object-cover" />
                ) : (
                  <span className="h-5 w-5 rounded-full bg-clay/30" />
                )}
                Hosted by {activity.host.display_name ?? activity.host.username ?? "a Gobber"}
              </Link>
              {hostTrust?.superhost && (
                <span className="inline-flex items-center gap-1 rounded-full bg-clay/15 px-2.5 py-1 text-[11px] font-semibold text-clay">
                  <Sparkles className="h-3 w-3" /> Superhost
                </span>
              )}
              {hostTrust?.verified_at && !hostTrust?.superhost && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                  <ShieldCheck className="h-3 w-3" /> Verified
                </span>
              )}
              {hostStats && hostStats.review_count > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-secondary/70 px-2.5 py-1 text-[11px] font-medium text-ink">
                  <Star className="h-3 w-3 fill-current" /> {hostStats.avg_rating.toFixed(1)} · {hostStats.review_count}
                </span>
              )}
            </div>
          ) : null}

          <div className="mt-4 grid grid-cols-3 gap-3 border-y border-border py-4 text-center">
            <Stat icon={Calendar} label={format(new Date(activity.starts_at), "MMM d")} sub={format(new Date(activity.starts_at), "h:mm a")} />
            <Stat icon={MapPin} label={activity.city} sub={activity.country} />
            <Stat icon={Users} label={`${spotsLeft} left`} sub={`of ${activity.max_spots}${waitlistRsvps.length ? ` · ${waitlistRsvps.length} waiting` : ""}`} />
          </div>

          <p className="mt-5 text-[15px] leading-relaxed text-foreground/85">{activity.description}</p>

          {attended && user && user.id !== activity.host_id && (
            <div className="mt-6 rounded-2xl border border-border/60 bg-secondary/40 p-4">
              <p className="text-[13px] font-semibold text-ink">How was it?</p>
              <p className="mt-0.5 text-[12px] text-muted-foreground">Leave a review for your host — helps future travelers.</p>
              <div className="mt-3">
                {myReview ? (
                  <p className="inline-flex items-center gap-1.5 rounded-full bg-white/70 px-3 py-1.5 text-[12px] text-ink">
                    <Star className="h-3.5 w-3.5 fill-current text-clay" /> You rated {myReview.rating}/5
                  </p>
                ) : (
                  <ReviewDialog
                    activityId={activity.id}
                    reviewerId={user.id}
                    revieweeId={activity.host_id}
                  />
                )}
              </div>
            </div>
          )}

          {user && user.id !== activity.host_id ? (
            <div className="mt-6 flex justify-end">
              <ReportDialog entityType="activity" entityId={activity.id} targetLabel={activity.title} />
            </div>
          ) : null}
        </div>
      </motion.div>

      {/* Sticky CTA */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border glass px-5 py-4 pb-safe-4">
        <div className="mx-auto max-w-md">
          {user ? (
            <Button
              onClick={() => rsvpMut.mutate()}
              disabled={rsvpMut.isPending || isPast}
              className="h-12 w-full rounded-full text-base font-medium"
              variant={myRsvp ? "outline" : "default"}
            >
              {rsvpMut.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : isPast ? (
                "This gathering has ended"
              ) : myRsvp?.status === "going" ? (
                "You're going · Cancel RSVP"
              ) : myRsvp?.status === "waitlisted" ? (
                "On the waitlist · Leave"
              ) : isFull ? (
                "Fully booked · Join waitlist"
              ) : (
                "Reserve a spot"
              )}
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

function ReviewDialog({ activityId, reviewerId, revieweeId }: { activityId: string; reviewerId: string; revieweeId: string }) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const submit = useSubmitReview();

  async function handleSubmit() {
    try {
      await submit.mutateAsync({
        activity_id: activityId,
        reviewer_id: reviewerId,
        reviewee_id: revieweeId,
        direction: "guest_to_host",
        rating,
        comment: comment.trim() || undefined,
      });
      toast.success("Thanks for reviewing");
      setOpen(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="rounded-full">Leave a review</Button>
      </DialogTrigger>
      <DialogContent className="rounded-3xl">
        <DialogHeader><DialogTitle>Rate your host</DialogTitle></DialogHeader>
        <div className="flex justify-center gap-1.5 py-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} onClick={() => setRating(n)} aria-label={`${n} stars`}>
              <Star className={`h-8 w-8 ${n <= rating ? "fill-clay text-clay" : "text-muted-foreground/40"}`} />
            </button>
          ))}
        </div>
        <Textarea rows={3} placeholder="Anything you loved? (optional)" value={comment} onChange={(e) => setComment(e.target.value)} />
        <DialogFooter>
          <Button onClick={handleSubmit} disabled={submit.isPending} className="rounded-full">
            {submit.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit review"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
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
