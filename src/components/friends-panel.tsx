import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { Search, UserPlus, Loader2, AtSign, X, Users, Sparkles, Check, ChevronRight } from "lucide-react";
import { useUser } from "@/hooks/use-user";
import {
  useFollowCounts,
  useFollowersList,
  useFollowingList,
  useSearchProfiles,
  useFollowMutation,
  useIsFollowing,
  useFollowsMe,
  type ProfileLite,
} from "@/lib/follows";
import { useRankedSuggestions } from "@/lib/notifications";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BlockedPanel } from "@/components/blocked-panel";

export function FriendsPanel() {
  const { user } = useUser();
  const { data: counts } = useFollowCounts(user?.id);
  const { data: suggested = [], isLoading: loadingSuggested } = useRankedSuggestions(user?.id, 8);
  const [openList, setOpenList] = useState<"followers" | "following" | null>(null);
  const [openFind, setOpenFind] = useState(false);

  return (
    <>
      {/* Prominent stats bar — Instagram style */}
      <div className="mt-6 grid grid-cols-2 gap-3">
        <StatButton value={counts?.followers ?? 0} label="Followers" onClick={() => setOpenList("followers")} />
        <StatButton value={counts?.following ?? 0} label="Following" onClick={() => setOpenList("following")} />
      </div>

      {/* Find people row */}
      <button
        onClick={() => setOpenFind(true)}
        className="mt-3 flex w-full items-center gap-3 rounded-2xl bg-card p-3.5 text-left shadow-glass transition active:scale-[0.99]"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Search className="h-4 w-4" />
        </div>
        <div className="flex-1">
          <p className="text-[14px] font-semibold text-ink">Find people</p>
          <p className="text-[12px] text-muted-foreground">Search by @username or name</p>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </button>

      {/* Blocked people */}
      <BlockedPanel />


      {/* Suggested for you */}
      <section className="mt-8">
        <div className="mb-3 flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-muted-foreground" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Suggested for you</h2>
          </div>
        </div>
        {loadingSuggested ? (
          <div className="flex items-center justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
        ) : suggested.length === 0 ? (
          <div className="rounded-2xl bg-card p-6 text-center shadow-glass">
            <Users className="mx-auto h-6 w-6 text-muted-foreground/60" />
            <p className="mt-2 text-[13px] font-medium text-ink">No suggestions right now</p>
            <p className="text-[12px] text-muted-foreground">Check back after more travelers join Gobber.</p>
          </div>
        ) : (
          <div className="-mx-5 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
            <div className="flex gap-3 px-5 pb-2">
              {suggested.map((p) => (
                <SuggestionCard key={p.id} profile={p} myId={user?.id} />
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Followers / Following modal */}
      <FollowListDialog
        open={openList !== null}
        onClose={() => setOpenList(null)}
        initialTab={openList ?? "followers"}
        myId={user?.id}
      />

      {/* Find people modal */}
      <FindPeopleDialog open={openFind} onClose={() => setOpenFind(false)} myId={user?.id} />
    </>
  );
}

function StatButton({ value, label, onClick }: { value: number; label: string; onClick: () => void }) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="rounded-2xl bg-card p-4 text-left shadow-glass transition hover:bg-card/80"
    >
      <p className="text-3xl font-semibold tracking-tight text-ink">{value.toLocaleString()}</p>
      <p className="mt-1 text-xs text-muted-foreground">{label}</p>
    </motion.button>
  );
}

function SuggestionCard({ profile, myId }: { profile: ProfileLite & { mutual_count?: number }; myId: string | undefined }) {
  const { data: isFollowing } = useIsFollowing(myId, profile.id);
  const mut = useFollowMutation(myId);
  const initials = (profile.display_name || profile.username).slice(0, 2).toUpperCase();
  const mutuals = profile.mutual_count ?? 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative w-[150px] shrink-0 rounded-2xl bg-card p-3 text-center shadow-glass"
    >
      <Link to="/u/$username" params={{ username: profile.username }} className="block">
        <div
          className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-cover bg-center text-base font-semibold text-white ring-2 ring-white"
          style={{ backgroundImage: profile.avatar_url ? `url(${profile.avatar_url})` : "linear-gradient(135deg, oklch(0.68 0.08 70), oklch(0.5 0.045 55))" }}
        >
          {!profile.avatar_url && initials}
        </div>
        <p className="mt-2 truncate text-[13px] font-semibold text-ink">{profile.display_name || profile.username}</p>
        <p className="truncate text-[11px] text-muted-foreground">@{profile.username}</p>
        {mutuals > 0 ? (
          <p className="mt-0.5 truncate text-[10.5px] font-medium text-primary/80">
            {mutuals} mutual{mutuals === 1 ? "" : "s"}
          </p>
        ) : (
          <p className="mt-0.5 truncate text-[10.5px] text-muted-foreground/70">New on Gobber</p>
        )}
      </Link>
      <FollowButton
        compact
        isFollowing={!!isFollowing}
        loading={mut.isPending}
        onClick={() => mut.mutate({ targetId: profile.id, follow: !isFollowing })}
      />
    </motion.div>
  );
}

/* ---------- Follow button (Instagram-style) ---------- */
function FollowButton({
  isFollowing,
  followsMe,
  loading,
  onClick,
  compact,
}: {
  isFollowing: boolean;
  followsMe?: boolean;
  loading: boolean;
  onClick: () => void;
  compact?: boolean;
}) {
  const label = isFollowing ? "Following" : followsMe ? "Follow back" : "Follow";
  const base = compact
    ? "mt-2.5 h-8 w-full rounded-lg text-[12px] font-semibold"
    : "h-9 rounded-lg px-4 text-[13px] font-semibold";
  const style = isFollowing
    ? "bg-secondary text-ink hover:bg-secondary/80"
    : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm";
  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      disabled={loading}
      onClick={onClick}
      className={`${base} ${style} inline-flex items-center justify-center gap-1 transition disabled:opacity-60`}
    >
      {loading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : isFollowing ? (
        <><Check className="h-3.5 w-3.5" /> {label}</>
      ) : (
        <><UserPlus className="h-3.5 w-3.5" /> {label}</>
      )}
    </motion.button>
  );
}

/* ---------- Followers/Following dialog ---------- */
function FollowListDialog({
  open,
  onClose,
  initialTab,
  myId,
}: {
  open: boolean;
  onClose: () => void;
  initialTab: "followers" | "following";
  myId: string | undefined;
}) {
  const [tab, setTab] = useState<"followers" | "following">(initialTab);
  const [q, setQ] = useState("");
  const { data: followers = [], isLoading: lf } = useFollowersList(myId);
  const { data: following = [], isLoading: lg } = useFollowingList(myId);

  // Sync tab when reopening from a different stat
  useMemo(() => { if (open) setTab(initialTab); }, [open, initialTab]);

  const source = tab === "followers" ? followers : following;
  const loading = tab === "followers" ? lf : lg;
  const filtered = q.trim().length
    ? source.filter((p) => (p.username + " " + (p.display_name ?? "")).toLowerCase().includes(q.toLowerCase()))
    : source;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md gap-0 overflow-hidden rounded-3xl border-0 bg-card p-0 shadow-glass">
        <DialogHeader className="border-b border-black/[0.06] px-5 py-4">
          <DialogTitle className="text-center text-[15px] font-semibold text-ink">
            {tab === "followers" ? `${followers.length} Followers` : `${following.length} Following`}
          </DialogTitle>
        </DialogHeader>

        {/* Tab pills */}
        <div className="relative mx-5 mt-4 flex rounded-full bg-secondary/70 p-1">
          {(["followers", "following"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="relative flex-1 rounded-full px-3 py-1.5 text-[12px] font-semibold capitalize transition-colors"
            >
              {tab === t && (
                <motion.span
                  layoutId="follow-dialog-pill"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  className="absolute inset-0 rounded-full bg-white shadow-sm ring-1 ring-black/[0.04]"
                />
              )}
              <span className={`relative z-10 ${tab === t ? "text-ink" : "text-muted-foreground"}`}>{t}</span>
            </button>
          ))}
        </div>

        {/* Inline search */}
        <div className="relative mx-5 mt-3">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search"
            className="h-10 rounded-xl bg-secondary/60 pl-9 pr-9 text-[13px]"
          />
          {q && (
            <button onClick={() => setQ("")} aria-label="Clear" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="max-h-[60vh] overflow-y-auto px-2 py-3">
          {loading ? (
            <div className="flex items-center justify-center py-10"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
          ) : filtered.length === 0 ? (
            <p className="px-4 py-10 text-center text-[13px] text-muted-foreground">
              {q ? "No one matches." : tab === "followers" ? "No followers yet — share Gobber with a friend." : "You're not following anyone yet."}
            </p>
          ) : (
            <ul className="space-y-1">
              <AnimatePresence initial={false}>
                {filtered.map((p) => (
                  <FriendRow key={p.id} profile={p} myId={myId} />
                ))}
              </AnimatePresence>
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ---------- Find people dialog ---------- */
function FindPeopleDialog({ open, onClose, myId }: { open: boolean; onClose: () => void; myId: string | undefined }) {
  const [q, setQ] = useState("");
  const { data: results = [], isLoading } = useSearchProfiles(q);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && (onClose(), setQ(""))}>
      <DialogContent className="max-w-md gap-0 overflow-hidden rounded-3xl border-0 bg-card p-0 shadow-glass">
        <DialogHeader className="border-b border-black/[0.06] px-5 py-4">
          <DialogTitle className="text-center text-[15px] font-semibold text-ink">Find people</DialogTitle>
        </DialogHeader>
        <div className="relative mx-5 mt-4">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search @username or name"
            className="h-11 rounded-xl bg-secondary/60 pl-9 pr-9"
          />
          {q && (
            <button onClick={() => setQ("")} aria-label="Clear" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="max-h-[60vh] min-h-[240px] overflow-y-auto px-2 py-3">
          {q.trim().length < 2 ? (
            <div className="px-6 py-10 text-center">
              <AtSign className="mx-auto h-6 w-6 text-muted-foreground/60" />
              <p className="mt-2 text-[13px] font-medium text-ink">Search for travelers</p>
              <p className="text-[12px] text-muted-foreground">Type at least 2 characters.</p>
            </div>
          ) : isLoading ? (
            <div className="flex items-center justify-center py-10"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
          ) : results.length === 0 ? (
            <p className="px-4 py-10 text-center text-[13px] text-muted-foreground">No one matches "{q}"</p>
          ) : (
            <ul className="space-y-1">
              {results.map((p) => (
                <FriendRow key={p.id} profile={p} myId={myId} />
              ))}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ---------- Friend row (used in dialogs) ---------- */
function FriendRow({ profile, myId }: { profile: ProfileLite; myId: string | undefined }) {
  const isMe = myId === profile.id;
  const { data: isFollowing } = useIsFollowing(myId, profile.id);
  const { data: followsMe } = useFollowsMe(myId, profile.id);
  const mut = useFollowMutation(myId);
  const initials = (profile.display_name || profile.username).slice(0, 2).toUpperCase();

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -10 }}
      className="flex items-center gap-3 rounded-2xl px-3 py-2.5 transition hover:bg-secondary/50"
    >
      <Link to="/u/$username" params={{ username: profile.username }} className="flex min-w-0 flex-1 items-center gap-3">
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-cover bg-center text-sm font-semibold text-white ring-1 ring-black/[0.04]"
          style={{ backgroundImage: profile.avatar_url ? `url(${profile.avatar_url})` : "linear-gradient(135deg, oklch(0.68 0.08 70), oklch(0.5 0.045 55))" }}
        >
          {!profile.avatar_url && initials}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <p className="truncate text-[14px] font-semibold text-ink">{profile.username}</p>
            {followsMe && !isMe && (
              <span className="rounded-md bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">Follows you</span>
            )}
          </div>
          <p className="truncate text-[12px] text-muted-foreground">
            {profile.display_name || "Traveler"}
            {profile.home_city && <span> · {profile.home_city}</span>}
          </p>
        </div>
      </Link>
      {!isMe && (
        <FollowButton
          isFollowing={!!isFollowing}
          followsMe={!!followsMe}
          loading={mut.isPending}
          onClick={() => mut.mutate({ targetId: profile.id, follow: !isFollowing })}
        />
      )}
    </motion.li>
  );
}
