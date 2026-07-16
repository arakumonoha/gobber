import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, UserPlus, UserMinus, Loader2, AtSign, X } from "lucide-react";
import { useUser } from "@/hooks/use-user";
import {
  useFollowCounts,
  useFollowersList,
  useFollowingList,
  useSearchProfiles,
  useFollowMutation,
  useIsFollowing,
  type ProfileLite,
} from "@/lib/follows";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function FriendsPanel() {
  const { user } = useUser();
  const [tab, setTab] = useState<"followers" | "following" | "find">("following");
  const [query, setQuery] = useState("");
  const { data: counts } = useFollowCounts(user?.id);
  const { data: following = [], isLoading: loadingFollowing } = useFollowingList(user?.id);
  const { data: followers = [], isLoading: loadingFollowers } = useFollowersList(user?.id);
  const { data: results = [], isLoading: searching } = useSearchProfiles(query);

  const list = tab === "followers" ? followers : tab === "following" ? following : results;
  const loading = tab === "followers" ? loadingFollowers : tab === "following" ? loadingFollowing : searching;

  return (
    <div className="mt-8 rounded-3xl bg-card p-5 shadow-glass">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Friends</h2>
        <div className="text-[11px] text-muted-foreground">
          <span className="font-semibold text-ink">{counts?.followers ?? 0}</span> followers ·{" "}
          <span className="font-semibold text-ink">{counts?.following ?? 0}</span> following
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-4 relative flex rounded-full bg-secondary/70 p-1">
        {(["following", "followers", "find"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="relative flex-1 rounded-full px-3 py-1.5 text-[12px] font-medium capitalize transition-colors"
          >
            {tab === t && (
              <motion.span
                layoutId="friends-tab-pill"
                transition={{ type: "spring", stiffness: 380, damping: 32 }}
                className="absolute inset-0 rounded-full bg-white shadow-sm ring-1 ring-black/[0.04]"
              />
            )}
            <span className={`relative z-10 ${tab === t ? "text-ink" : "text-muted-foreground"}`}>
              {t === "find" ? "Find" : t}
            </span>
          </button>
        ))}
      </div>

      {tab === "find" && (
        <div className="mt-3 relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by username or name"
            className="h-11 rounded-xl pl-9 pr-9"
          />
          {query && (
            <button onClick={() => setQuery("")} aria-label="Clear" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      )}

      <div className="mt-3 min-h-[80px]">
        {loading ? (
          <div className="flex items-center justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
        ) : list.length === 0 ? (
          <p className="rounded-2xl bg-secondary/60 p-5 text-center text-[13px] text-muted-foreground">
            {tab === "find" ? (query.length < 2 ? "Type a username to find someone." : "No one matches that yet.") :
             tab === "following" ? "You're not following anyone yet." : "No followers yet."}
          </p>
        ) : (
          <ul className="space-y-2">
            <AnimatePresence initial={false}>
              {list.map((p) => (
                <FriendRow key={p.id} profile={p} myId={user?.id} />
              ))}
            </AnimatePresence>
          </ul>
        )}
      </div>
    </div>
  );
}

function FriendRow({ profile, myId }: { profile: ProfileLite; myId: string | undefined }) {
  const isMe = myId === profile.id;
  const { data: isFollowing } = useIsFollowing(myId, profile.id);
  const mut = useFollowMutation(myId);
  const initials = (profile.display_name || profile.username).slice(0, 2).toUpperCase();

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -10 }}
      className="flex items-center gap-3 rounded-2xl bg-white/70 p-2.5 ring-1 ring-black/[0.04]"
    >
      <div
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-cover bg-center text-sm font-semibold text-white"
        style={{ backgroundImage: profile.avatar_url ? `url(${profile.avatar_url})` : "linear-gradient(135deg, oklch(0.68 0.08 70), oklch(0.5 0.045 55))" }}
      >
        {!profile.avatar_url && initials}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[14px] font-semibold text-ink">{profile.display_name || profile.username}</p>
        <p className="flex items-center gap-1 truncate text-[12px] text-muted-foreground">
          <AtSign className="h-3 w-3" />{profile.username}
          {profile.home_city && <span className="ml-1">· {profile.home_city}</span>}
        </p>
      </div>
      {!isMe && (
        <Button
          size="sm"
          variant={isFollowing ? "ghost" : "default"}
          disabled={mut.isPending}
          onClick={() => mut.mutate({ targetId: profile.id, follow: !isFollowing })}
          className={`h-9 rounded-full px-3 text-[12px] ${isFollowing ? "text-muted-foreground" : ""}`}
        >
          {mut.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : isFollowing ? (
            <><UserMinus className="mr-1 h-3.5 w-3.5" /> Following</>
          ) : (
            <><UserPlus className="mr-1 h-3.5 w-3.5" /> Follow</>
          )}
        </Button>
      )}
    </motion.li>
  );
}
