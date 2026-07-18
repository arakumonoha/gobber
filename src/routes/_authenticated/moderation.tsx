import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { Loader2, ShieldCheck, ArrowUpRight } from "lucide-react";
import { BottomNav } from "@/components/bottom-nav";
import { SectionHeader } from "@/components/ui/glass";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import {
  useIsModerator,
  useModerationQueue,
  useUpdateReportStatus,
  type ReportRow,
  type ReportStatus,
} from "@/lib/reports";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/moderation")({
  head: () => ({
    meta: [
      { title: "Moderation — Gobber" },
      { name: "robots", content: "noindex" },
    ],
  }),
  beforeLoad: async () => {
    // Cheap client-side gate; RLS is the source of truth on the queries.
    const { data: userRes } = await supabase.auth.getUser();
    const uid = userRes.user?.id;
    if (!uid) throw redirect({ to: "/auth" });
  },
  component: Moderation,
});

const STATUSES: { key: ReportStatus | "all"; label: string }[] = [
  { key: "pending", label: "Pending" },
  { key: "reviewed", label: "Reviewed" },
  { key: "actioned", label: "Actioned" },
  { key: "dismissed", label: "Dismissed" },
  { key: "all", label: "All" },
];

function Moderation() {
  const { data: isMod, isLoading: roleLoading } = useIsModerator();
  const [status, setStatus] = useState<ReportStatus | "all">("pending");
  const { data: reports = [], isLoading } = useModerationQueue(status);

  if (roleLoading) {
    return (
      <div className="flex h-[100dvh] items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-clay" />
      </div>
    );
  }

  if (!isMod) {
    return (
      <div className="page-wash min-h-[100dvh] pb-32">
        <div className="mx-auto flex min-h-[70dvh] max-w-md flex-col items-center justify-center px-6 text-center">
          <div className="glass rounded-full p-4">
            <ShieldCheck className="h-6 w-6 text-clay" />
          </div>
          <p className="mt-6 font-serif text-2xl italic">Moderators only</p>
          <p className="mt-2 text-sm text-muted-foreground">This zone is restricted to trusted reviewers.</p>
          <Link to="/discover" className="mt-6 text-sm text-clay underline">Back to Discover</Link>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="page-wash min-h-[100dvh] pb-32">
      <div className="mx-auto max-w-2xl px-5 pt-20">
        <SectionHeader
          eyebrow="Trust & safety"
          title={<>Moderation <span className="not-italic font-display">queue</span></>}
          subtitle="Reports from the community. Review privately, act quickly."
        />

        <div className="mx-auto mt-8 flex w-full max-w-md gap-1.5 overflow-x-auto rounded-full glass p-1">
          {STATUSES.map((s) => (
            <button
              key={s.key}
              onClick={() => setStatus(s.key)}
              className={cn(
                "flex-1 whitespace-nowrap rounded-full px-3 py-1.5 text-[12px] font-medium tracking-tight transition",
                "duration-[var(--duration-base)] ease-[var(--ease-apple)]",
                status === s.key ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div className="mt-6 space-y-3">
          {isLoading ? (
            <div className="flex h-40 items-center justify-center"><Loader2 className="h-4 w-4 animate-spin text-clay" /></div>
          ) : reports.length === 0 ? (
            <div className="rounded-3xl glass-panel py-14 text-center text-sm text-muted-foreground">
              Nothing here — good news.
            </div>
          ) : (
            reports.map((r, i) => <ReportCard key={r.id} report={r} index={i} />)
          )}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}

function ReportCard({ report, index }: { report: ReportRow; index: number }) {
  const update = useUpdateReportStatus();
  const tone: Record<ReportStatus, string> = {
    pending: "bg-amber-500/15 text-amber-700",
    reviewed: "bg-sky-500/15 text-sky-700",
    actioned: "bg-emerald-500/15 text-emerald-700",
    dismissed: "bg-neutral-500/15 text-neutral-700",
  };

  const entityLink =
    report.entity_type === "activity"
      ? { to: "/activity/$id" as const, params: { id: report.entity_id } }
      : null;

  async function setStatus(next: ReportStatus) {
    try {
      await update.mutateAsync({ id: report.id, status: next });
      toast.success(`Marked as ${next}.`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  }

  return (
    <motion.div
      initial={{ y: 10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.03 * index, duration: 0.3 }}
      className="rounded-3xl glass-panel p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-clay">
            {report.entity_type}
          </p>
          <p className="mt-1 text-[15px] font-semibold text-ink">{report.reason}</p>
          {report.notes ? (
            <p className="mt-2 text-[13px] leading-relaxed text-foreground/85">{report.notes}</p>
          ) : null}
          <p className="mt-3 text-[11px] text-muted-foreground">
            {format(new Date(report.created_at), "MMM d, h:mm a")} · target <code className="text-[10.5px]">{report.entity_id.slice(0, 8)}…</code>
          </p>
        </div>
        <span className={cn("shrink-0 rounded-full px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-wider", tone[report.status])}>
          {report.status}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {entityLink ? (
          <Link
            to={entityLink.to}
            params={entityLink.params}
            className="inline-flex items-center gap-1 rounded-full bg-secondary/70 px-3 py-1.5 text-[12px] font-medium hover:bg-secondary"
          >
            Open target <ArrowUpRight className="h-3 w-3" />
          </Link>
        ) : null}
        {report.status !== "actioned" ? (
          <Button size="sm" className="h-8 rounded-full" onClick={() => setStatus("actioned")}>Actioned</Button>
        ) : null}
        {report.status !== "dismissed" ? (
          <Button size="sm" variant="outline" className="h-8 rounded-full" onClick={() => setStatus("dismissed")}>Dismiss</Button>
        ) : null}
        {report.status === "pending" ? (
          <Button size="sm" variant="ghost" className="h-8 rounded-full" onClick={() => setStatus("reviewed")}>Mark reviewed</Button>
        ) : null}
      </div>
    </motion.div>
  );
}
