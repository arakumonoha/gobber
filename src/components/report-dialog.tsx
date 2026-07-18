import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Flag, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { REPORT_REASONS, useCreateReport, type ReportEntity } from "@/lib/reports";
import { cn } from "@/lib/utils";

interface ReportDialogProps {
  entityType: ReportEntity;
  entityId: string;
  targetLabel?: string;
  trigger?: React.ReactNode;
  className?: string;
}

/**
 * Reusable report entry point. Renders a small Flag button by default and
 * opens a dialog with reason chips + optional notes. Rate limited server-side.
 */
export function ReportDialog({ entityType, entityId, targetLabel, trigger, className }: ReportDialogProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const create = useCreateReport();

  const reasons = REPORT_REASONS[entityType];
  const kindLabel = entityType === "user" ? "person" : entityType;

  async function submit() {
    if (!reason) return;
    try {
      await create.mutateAsync({ entity_type: entityType, entity_id: entityId, reason, notes: notes.trim() || undefined });
      toast.success("Thanks — our team will take a look.");
      setOpen(false);
      setReason(null);
      setNotes("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't submit report");
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full bg-white/60 px-3 py-1.5 text-[12px] font-medium text-muted-foreground backdrop-blur-md transition hover:text-foreground",
          className,
        )}
        aria-label={`Report ${kindLabel}`}
      >
        {trigger ?? (
          <>
            <Flag className="h-3.5 w-3.5" />
            Report
          </>
        )}
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl italic tracking-tight">
              Report this {kindLabel}
            </DialogTitle>
            <DialogDescription>
              {targetLabel ? <>Tell us what's wrong with <span className="font-medium text-foreground">{targetLabel}</span>. </> : null}
              Our moderators review reports privately.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-wrap gap-2 py-2">
            {reasons.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setReason(r)}
                className={cn(
                  "rounded-full border px-3.5 py-1.5 text-[12.5px] font-medium transition-[background,border-color,color]",
                  "duration-[var(--duration-base)] ease-[var(--ease-apple)]",
                  reason === r
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-white/60 text-foreground hover:border-foreground/30",
                )}
              >
                {r}
              </button>
            ))}
          </div>

          <Textarea
            placeholder="Add context (optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value.slice(0, 1000))}
            className="min-h-[92px] rounded-2xl border-border/60 bg-white/70 text-[14px]"
          />

          <DialogFooter className="mt-2 flex-row justify-end gap-2">
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button
              onClick={submit}
              disabled={!reason || create.isPending}
              className="rounded-full"
            >
              {create.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit report"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
