import { Link } from "@tanstack/react-router";
import { Loader2, Ban, ShieldOff } from "lucide-react";
import { useUser } from "@/hooks/use-user";
import { useBlockedByMe, useBlockMutation } from "@/lib/follows";
import { toast } from "sonner";

export function BlockedPanel() {
  const { user } = useUser();
  const { data: blocked = [], isLoading } = useBlockedByMe(user?.id);
  const mut = useBlockMutation(user?.id);

  if (!user) return null;

  return (
    <section className="mt-8">
      <div className="mb-3 flex items-center gap-1.5 px-1">
        <Ban className="h-3.5 w-3.5 text-muted-foreground" />
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Blocked</h2>
        {blocked.length > 0 && <span className="text-[11px] text-muted-foreground">· {blocked.length}</span>}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-6"><Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /></div>
      ) : blocked.length === 0 ? (
        <div className="rounded-2xl bg-card p-5 text-center shadow-glass">
          <p className="text-[13px] text-muted-foreground">You haven't blocked anyone.</p>
        </div>
      ) : (
        <ul className="space-y-2 rounded-2xl bg-card p-2 shadow-glass">
          {blocked.map((p) => {
            const initials = (p.display_name || p.username).slice(0, 2).toUpperCase();
            return (
              <li key={p.id} className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-secondary/40">
                <Link to="/u/$username" params={{ username: p.username }} className="flex min-w-0 flex-1 items-center gap-3">
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cover bg-center text-xs font-semibold text-white"
                    style={{ backgroundImage: p.avatar_url ? `url(${p.avatar_url})` : "linear-gradient(135deg, oklch(0.68 0.08 70), oklch(0.5 0.045 55))" }}
                  >
                    {!p.avatar_url && initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-semibold text-ink">@{p.username}</p>
                    <p className="truncate text-[11px] text-muted-foreground">{p.display_name || "Traveler"}</p>
                  </div>
                </Link>
                <button
                  onClick={async () => { await mut.mutateAsync({ targetId: p.id, block: false }); toast.success(`Unblocked @${p.username}`); }}
                  disabled={mut.isPending}
                  className="inline-flex h-8 items-center gap-1 rounded-lg bg-secondary px-3 text-[12px] font-semibold text-ink disabled:opacity-60"
                >
                  <ShieldOff className="h-3.5 w-3.5" /> Unblock
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
