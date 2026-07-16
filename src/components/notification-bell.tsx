import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, BellOff, Check, UserPlus, Users, Sparkles, X } from "lucide-react";
import { useUser } from "@/hooks/use-user";
import {
  useNotifications,
  useUnreadCount,
  useMarkAllRead,
  useMarkRead,
  useNotificationsRealtime,
  requestBrowserPushPermission,
  type NotificationRow,
} from "@/lib/notifications";
import { Sheet, SheetContent } from "@/components/ui/sheet";

function timeAgo(iso: string) {
  const s = Math.max(1, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d`;
  return new Date(iso).toLocaleDateString();
}

export function NotificationBell() {
  const { user } = useUser();
  const [open, setOpen] = useState(false);
  const { data: unread = 0 } = useUnreadCount(user?.id);
  useNotificationsRealtime(user?.id);

  if (!user) return null;

  return (
    <>
      <button
        aria-label={`Notifications${unread ? `, ${unread} unread` : ""}`}
        onClick={() => setOpen(true)}
        className="fixed right-4 top-[calc(env(safe-area-inset-top,0px)+12px)] z-40 flex h-11 w-11 items-center justify-center rounded-full border border-white/40 bg-white/55 shadow-glass backdrop-blur-2xl transition active:scale-95"
        style={{ WebkitBackdropFilter: "blur(24px) saturate(1.4)" }}
      >
        <Bell className="h-[18px] w-[18px] text-ink" strokeWidth={2.2} />
        <AnimatePresence>
          {unread > 0 && (
            <motion.span
              key="dot"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-white shadow-md ring-2 ring-white"
            >
              {unread > 99 ? "99+" : unread}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      <NotificationSheet open={open} onOpenChange={setOpen} />
    </>
  );
}

function NotificationSheet({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { user } = useUser();
  const { data: items = [], isLoading } = useNotifications(user?.id);
  const markAll = useMarkAllRead(user?.id);
  const [pushState, setPushState] = useState<NotificationPermission | "unsupported" | "idle">("idle");

  const enablePush = async () => {
    const r = await requestBrowserPushPermission();
    setPushState(r);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full max-w-md border-l border-white/40 bg-white/80 p-0 backdrop-blur-2xl sm:max-w-md"
        style={{ WebkitBackdropFilter: "blur(28px) saturate(1.5)" }}
      >
        <div className="flex items-center justify-between border-b border-black/5 px-5 py-4">
          <div>
            <h2 className="text-[19px] font-semibold tracking-tight text-ink">Notifications</h2>
            <p className="text-[12px] text-muted-foreground">Follows, mutuals & trip nudges</p>
          </div>
          <div className="flex items-center gap-1">
            {items.some((n) => !n.read_at) && (
              <button
                onClick={() => markAll.mutate()}
                className="rounded-full bg-black/5 px-3 py-1.5 text-[12px] font-medium text-ink transition hover:bg-black/10"
              >
                Mark all read
              </button>
            )}
            <button
              onClick={() => onOpenChange(false)}
              className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition hover:bg-black/5"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Push permission prompt */}
        {typeof window !== "undefined" && "Notification" in window && Notification.permission === "default" && pushState !== "granted" && (
          <div className="mx-4 mt-3 flex items-start gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
              <Bell className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <p className="text-[13px] font-semibold text-ink">Get notified instantly</p>
              <p className="text-[11.5px] text-muted-foreground">Allow browser notifications for follows & mutuals.</p>
            </div>
            <button
              onClick={enablePush}
              className="self-center rounded-full bg-primary px-3 py-1.5 text-[12px] font-semibold text-primary-foreground shadow-sm transition active:scale-95"
            >
              Enable
            </button>
          </div>
        )}
        {pushState === "denied" && (
          <div className="mx-4 mt-3 flex items-center gap-2 rounded-2xl bg-black/5 p-3 text-[12px] text-muted-foreground">
            <BellOff className="h-4 w-4" /> Browser notifications blocked. Enable them in your browser settings.
          </div>
        )}

        <div className="max-h-[calc(100dvh-80px)] overflow-y-auto px-2 py-2">
          {isLoading ? (
            <div className="p-6 text-center text-[13px] text-muted-foreground">Loading…</div>
          ) : items.length === 0 ? (
            <div className="p-10 text-center">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-black/5">
                <Sparkles className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-[14px] font-semibold text-ink">You're all caught up</p>
              <p className="mt-1 text-[12px] text-muted-foreground">
                New follows, mutuals, and trip suggestions will show up here.
              </p>
            </div>
          ) : (
            <ul className="flex flex-col">
              {items.map((n) => (
                <NotificationItem key={n.id} n={n} onClose={() => onOpenChange(false)} />
              ))}
            </ul>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function NotificationItem({ n, onClose }: { n: NotificationRow; onClose: () => void }) {
  const { user } = useUser();
  const markRead = useMarkRead(user?.id);
  const isUnread = !n.read_at;

  const actor = n.actor;
  const actorName = actor?.display_name || (actor?.username ? `@${actor.username}` : "Someone");
  const initials = (actor?.display_name || actor?.username || "?").slice(0, 2).toUpperCase();

  const config = (() => {
    switch (n.type) {
      case "follow":
        return { icon: <UserPlus className="h-3 w-3" />, tone: "bg-blue-500", verb: "started following you" };
      case "mutual_follow":
        return { icon: <Users className="h-3 w-3" />, tone: "bg-primary", verb: "is now your friend" };
      case "trip_suggestion":
        return { icon: <Sparkles className="h-3 w-3" />, tone: "bg-amber-500", verb: "suggested a trip" };
      default:
        return { icon: <Check className="h-3 w-3" />, tone: "bg-neutral-500", verb: "sent an update" };
    }
  })();

  const to = actor?.username ? { to: "/u/$username" as const, params: { username: actor.username } } : { to: "/discover" as const };

  return (
    <li>
      <Link
        {...to}
        onClick={() => {
          if (isUnread) markRead.mutate(n.id);
          onClose();
        }}
        className={`group flex items-start gap-3 rounded-2xl px-3 py-3 transition ${isUnread ? "bg-primary/[0.04] hover:bg-primary/[0.07]" : "hover:bg-black/[0.03]"}`}
      >
        <div className="relative shrink-0">
          <div
            className="flex h-11 w-11 items-center justify-center rounded-full bg-cover bg-center text-[13px] font-semibold text-white ring-2 ring-white"
            style={{ backgroundImage: actor?.avatar_url ? `url(${actor.avatar_url})` : "linear-gradient(135deg, oklch(0.68 0.08 70), oklch(0.5 0.045 55))" }}
          >
            {!actor?.avatar_url && initials}
          </div>
          <span className={`absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full text-white ring-2 ring-white ${config.tone}`}>
            {config.icon}
          </span>
        </div>
        <div className="min-w-0 flex-1 pt-0.5">
          <p className="text-[13.5px] leading-snug text-ink">
            <span className="font-semibold">{actorName}</span>{" "}
            <span className="text-ink/80">{config.verb}</span>
          </p>
          <p className="mt-0.5 text-[11.5px] text-muted-foreground">{timeAgo(n.created_at)} ago</p>
        </div>
        {isUnread && <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" aria-label="Unread" />}
      </Link>
    </li>
  );
}
