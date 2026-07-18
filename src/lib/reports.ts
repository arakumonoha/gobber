import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { RateLimit } from "./rate-limit";

export type ReportEntity = "user" | "activity" | "message";
export type ReportStatus = "pending" | "reviewed" | "actioned" | "dismissed";

export type ReportRow = {
  id: string;
  reporter_id: string;
  entity_type: ReportEntity;
  entity_id: string;
  reason: string;
  notes: string | null;
  status: ReportStatus;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
};

export const REPORT_REASONS: Record<ReportEntity, string[]> = {
  user: ["Harassment", "Impersonation", "Spam", "Underage", "Unsafe behavior", "Other"],
  activity: ["Misleading", "Unsafe location", "Spam or scam", "Off-topic", "Duplicate", "Other"],
  message: ["Harassment", "Threats", "Spam", "Explicit content", "Other"],
};

/** Anyone signed-in can file a report. Rate limited. */
export function useCreateReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      entity_type: ReportEntity;
      entity_id: string;
      reason: string;
      notes?: string;
    }) => {
      const { data: userRes } = await supabase.auth.getUser();
      const uid = userRes.user?.id;
      if (!uid) throw new Error("Sign in to report.");
      await RateLimit.report();
      const { error } = await supabase.from("reports").insert({
        reporter_id: uid,
        entity_type: input.entity_type,
        entity_id: input.entity_id,
        reason: input.reason,
        notes: input.notes ?? null,
      });
      if (error) {
        if (error.code === "23505") throw new Error("You already reported this — moderators are on it.");
        throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["reports", "mine"] }),
  });
}

/** Moderators only. RLS filters. */
export function useModerationQueue(status: ReportStatus | "all" = "pending") {
  return useQuery({
    queryKey: ["reports", "queue", status],
    staleTime: 15_000,
    queryFn: async () => {
      let q = supabase.from("reports").select("*").order("created_at", { ascending: false }).limit(200);
      if (status !== "all") q = q.eq("status", status);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as ReportRow[];
    },
  });
}

export function useUpdateReportStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: ReportStatus }) => {
      const { data: userRes } = await supabase.auth.getUser();
      const uid = userRes.user?.id;
      const { error } = await supabase
        .from("reports")
        .update({ status, reviewed_by: uid ?? null, reviewed_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["reports"] }),
  });
}

/** Badge count for the moderation nav entry. Returns 0 for non-moderators. */
export function usePendingReportsCount() {
  return useQuery({
    queryKey: ["reports", "pending-count"],
    staleTime: 30_000,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("pending_reports_count");
      if (error) return 0;
      return (data as number) ?? 0;
    },
  });
}

export function useIsModerator() {
  return useQuery({
    queryKey: ["role", "moderator-or-admin"],
    staleTime: 5 * 60_000,
    queryFn: async () => {
      const { data: userRes } = await supabase.auth.getUser();
      const uid = userRes.user?.id;
      if (!uid) return false;
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", uid)
        .in("role", ["moderator", "admin"]);
      return !!data && data.length > 0;
    },
  });
}
