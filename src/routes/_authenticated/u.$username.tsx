import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, AtSign, MapPin, Loader2, MoreHorizontal, Ban, Check, UserPlus, ShieldOff, Flag, BadgeCheck, Sparkles, Star } from "lucide-react";
import { useUser } from "@/hooks/use-user";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import {
  useFollowCounts,
  useFollowMutation,
  useIsFollowing,
  useFollowsMe,
  useIsBlocked,
  useBlockMutation,
  type ProfileLite,
} from "@/lib/follows";
import { useTrustProfile, useHostReviewStats } from "@/lib/trust";
import { BottomNav } from "@/components/bottom-nav";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { ReportDialog } from "@/components/report-dialog";

export const Route = createFileRoute("/_authenticated/u/$username")({
  head: ({ params }) => ({ meta: [{ title: `@${params.username} — Gobber` }] }),
  component: UserProfile,
});

type FullProfile = ProfileLite & { bio: string | null };

function UserProfile() {
  const { username } = Route.useParams();
  const navigate = useNavigate();
  const { user: me } = useUser();

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ["profile", "public", username.toLowerCase()],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, display_name, avatar_url, home_city, bio")
        .ilike("username", username)
        .maybeSingle();
      if (error) throw error;
      return data as FullProfile | null;
    },
  });

  const isMe = me?.id && profile?.id === me.id;
  const { data: counts } = useFollowCounts(profile?.id);
  const { data: isFollowing } = useIsFollowing(me?.id, profile?.id);
  const { data: followsMe } = useFollowsMe(me?.id, profile?.id);
  const { data: isBlocked } = useIsBlocked(me?.id, profile?.id);
  const followMut = useFollowMutation(me?.id);
  const blockMut = useBlockMutation(me?.id);
  const { data: trust } = useTrustProfile(profile?.id);
  const { data: reviewStats } = useHostReviewStats(profile?.id);

  if (isLoading) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }
  if (error || !profile) {
    return (
      <div className="mx-auto max-w-md px-5 pt-16 text-center">
        <p className="text-lg font-semibold text-ink">User not found</p>
        <p className="mt-1 text-sm text-muted-foreground">@{username} doesn't exist on Gobber.</p>
        <button onClick={() => navigate({ to: "/discover" })} className="mt-6 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground">
          Back to Discover
        </button>
      </div>
    );
  }

  const initials = (profile.display_name || profile.username).slice(0, 2).toUpperCase();

  async function handleBlock() {
    const currentlyBlocked = !!isBlocked;
    await blockMut.mutateAsync({ targetId: profile!.id, block: !currentlyBlocked });
    toast.success(currentlyBlocked ? `Unblocked @${profile!.username}` : `Blocked @${profile!.username}`);
  }

  async function handleShare() {
    const url = `${window.location.origin}/u/${profile!.username}`;
    try {
      if (navigator.share) await navigator.share({ url, title: `@${profile!.username} on Gobber` });
      else { await navigator.clipboard.writeText(url); toast.success("Link copied"); }
    } catch {}
  }

  return (
    <div className="min-h-[100dvh] bg-background pb-32">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-black/[0.04] bg-background/80 px-4 py-3 backdrop-blur-xl">
        <button onClick={() => history.length > 1 ? history.back() : navigate({ to: "/discover" })} aria-label="Back" className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-secondary/60">
          <ArrowLeft className="h-4 w-4 text-ink" />
        </button>
        <p className="flex items-center gap-0.5 text-[15px] font-semibold text-ink">
          <AtSign className="h-3.5 w-3.5 text-muted-foreground" />{profile.username}
        </p>
        {!isMe ? (
          <DropdownMenu>
            <DropdownMenuTrigger className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-secondary/60" aria-label="More">
              <MoreHorizontal className="h-4 w-4 text-ink" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52 rounded-xl">
              <DropdownMenuItem onClick={handleShare}>Share profile</DropdownMenuItem>
              <DropdownMenuItem asChild>
                <div className="w-full">
                  <ReportDialog
                    entityType="user"
                    entityId={profile.id}
                    targetLabel={`@${profile.username}`}
                    className="w-full justify-start rounded-md bg-transparent px-2 py-1.5 text-[13px] font-normal hover:bg-secondary/60"
                    trigger={<><Flag className="mr-2 h-4 w-4" /> Report @{profile.username}</>}
                  />
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleBlock} className={isBlocked ? "" : "text-destructive focus:text-destructive"}>
                {isBlocked ? (<><ShieldOff className="mr-2 h-4 w-4" /> Unblock</>) : (<><Ban className="mr-2 h-4 w-4" /> Block @{profile.username}</>)}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : <div className="h-9 w-9" />}
      </div>

      <div className="mx-auto max-w-md px-5 pt-6">
        <motion.div initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex flex-col items-center text-center">
          <div
            className="flex h-24 w-24 items-center justify-center rounded-full bg-cover bg-center text-2xl font-semibold text-white shadow-float ring-2 ring-white"
            style={{ backgroundImage: profile.avatar_url ? `url(${profile.avatar_url})` : "linear-gradient(135deg, oklch(0.68 0.08 70), oklch(0.5 0.045 55))" }}
          >
            {!profile.avatar_url && initials}
          </div>
          <h1 className="mt-3 flex items-center justify-center gap-1.5 text-xl font-semibold tracking-tight text-ink">
            {profile.display_name || profile.username}
            {trust?.superhost ? (
              <Sparkles className="h-4 w-4 text-clay" aria-label="Superhost" />
            ) : trust?.verified_at ? (
              <BadgeCheck className="h-4 w-4 text-emerald-600" aria-label="Verified" />
            ) : null}
          </h1>
          <div className="mt-0.5 flex items-center gap-1.5 text-sm text-muted-foreground">
            <span className="flex items-center"><AtSign className="h-3 w-3" />{profile.username}</span>
            {followsMe && !isMe && <span className="rounded-md bg-secondary px-1.5 py-0.5 text-[10px] font-medium">Follows you</span>}
          </div>
          {(trust?.superhost || trust?.verified_at || (reviewStats && reviewStats.review_count > 0)) && (
            <div className="mt-2 flex flex-wrap items-center justify-center gap-1.5">
              {trust?.superhost && (
                <span className="inline-flex items-center gap-1 rounded-full bg-clay/15 px-2 py-0.5 text-[10.5px] font-semibold text-clay">
                  <Sparkles className="h-3 w-3" /> Superhost
                </span>
              )}
              {trust?.verified_at && !trust?.superhost && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10.5px] font-semibold text-emerald-700">
                  <BadgeCheck className="h-3 w-3" /> Verified
                </span>
              )}
              {reviewStats && reviewStats.review_count > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-[10.5px] font-medium text-ink">
                  <Star className="h-3 w-3 fill-current" /> {reviewStats.avg_rating.toFixed(1)} · {reviewStats.review_count}
                </span>
              )}
            </div>
          )}
          {profile.home_city && (
            <p className="mt-2 flex items-center gap-1 text-[13px] text-muted-foreground"><MapPin className="h-3.5 w-3.5" />{profile.home_city}</p>
          )}
          {profile.bio && <p className="mt-3 max-w-xs text-[14px] leading-relaxed text-ink/90">{profile.bio}</p>}
        </motion.div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-card p-4 text-center shadow-glass">
            <p className="text-2xl font-semibold text-ink">{counts?.followers ?? 0}</p>
            <p className="text-xs text-muted-foreground">Followers</p>
          </div>
          <div className="rounded-2xl bg-card p-4 text-center shadow-glass">
            <p className="text-2xl font-semibold text-ink">{counts?.following ?? 0}</p>
            <p className="text-xs text-muted-foreground">Following</p>
          </div>
        </div>

        {/* Actions */}
        {!isMe && (
          <div className="mt-4 flex gap-2">
            {isBlocked ? (
              <button
                onClick={handleBlock}
                disabled={blockMut.isPending}
                className="h-11 flex-1 rounded-xl bg-secondary text-[14px] font-semibold text-ink disabled:opacity-60"
              >
                {blockMut.isPending ? <Loader2 className="mx-auto h-4 w-4 animate-spin" /> : "Unblock"}
              </button>
            ) : (
              <FollowCTA
                isFollowing={!!isFollowing}
                followsMe={!!followsMe}
                loading={followMut.isPending}
                onClick={() => followMut.mutate({ targetId: profile.id, follow: !isFollowing })}
              />
            )}
            <button
              onClick={handleShare}
              className="h-11 rounded-xl bg-secondary px-4 text-[14px] font-semibold text-ink"
            >
              Share
            </button>
          </div>
        )}

        {isMe && (
          <Link
            to="/profile"
            className="mt-4 flex h-11 w-full items-center justify-center rounded-xl bg-secondary text-[14px] font-semibold text-ink"
          >
            Edit your profile
          </Link>
        )}

        {isBlocked && (
          <p className="mt-6 rounded-2xl bg-secondary/70 p-4 text-center text-[12px] text-muted-foreground">
            You've blocked @{profile.username}. They can't follow you and you won't see their activity.
          </p>
        )}
      </div>
      <BottomNav />
    </div>
  );
}

function FollowCTA({ isFollowing, followsMe, loading, onClick }: { isFollowing: boolean; followsMe: boolean; loading: boolean; onClick: () => void }) {
  const [confirm, setConfirm] = useState(false);
  const label = isFollowing ? "Following" : followsMe ? "Follow back" : "Follow";
  const filled = !isFollowing;

  function handle() {
    if (isFollowing && !confirm) { setConfirm(true); setTimeout(() => setConfirm(false), 2500); return; }
    setConfirm(false);
    onClick();
  }

  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={handle}
      disabled={loading}
      className={`h-11 flex-1 rounded-xl text-[14px] font-semibold inline-flex items-center justify-center gap-1.5 transition disabled:opacity-60 ${
        filled ? "bg-primary text-primary-foreground shadow-sm" : confirm ? "bg-destructive/10 text-destructive" : "bg-secondary text-ink"
      }`}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : isFollowing ? (
        confirm ? <>Tap again to unfollow</> : <><Check className="h-4 w-4" /> {label}</>
      ) : <><UserPlus className="h-4 w-4" /> {label}</>}
    </motion.button>
  );
}
