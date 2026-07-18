import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// ---------- Host verification ----------

export type VerificationStatus = "pending" | "verified" | "rejected";

export type HostVerification = {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  id_document_url: string | null;
  note: string | null;
  status: VerificationStatus;
  created_at: string;
  reviewed_at: string | null;
};

export function useMyVerification(userId: string | undefined) {
  return useQuery({
    queryKey: ["verification", userId],
    enabled: !!userId,
    staleTime: 60_000,
    queryFn: async (): Promise<HostVerification | null> => {
      if (!userId) return null;
      const { data, error } = await supabase
        .from("host_verifications")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();
      if (error) throw error;
      return (data as HostVerification | null) ?? null;
    },
  });
}

export function useSubmitVerification(userId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { full_name: string; phone: string; note?: string; id_document_url?: string }) => {
      if (!userId) throw new Error("Not signed in");
      const { error } = await supabase
        .from("host_verifications")
        .upsert(
          { user_id: userId, status: "pending", ...input },
          { onConflict: "user_id" },
        );
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["verification", userId] }),
  });
}

// ---------- Profile trust badges ----------

export type TrustProfile = { verified_at: string | null; superhost: boolean };

export function useTrustProfile(userId: string | undefined) {
  return useQuery({
    queryKey: ["trust-profile", userId],
    enabled: !!userId,
    staleTime: 5 * 60_000,
    queryFn: async (): Promise<TrustProfile | null> => {
      if (!userId) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("verified_at, superhost")
        .eq("id", userId)
        .maybeSingle();
      if (error) throw error;
      return (data as TrustProfile | null) ?? null;
    },
  });
}

// ---------- Reviews ----------

export type Review = {
  id: string;
  activity_id: string;
  reviewer_id: string;
  reviewee_id: string;
  direction: "guest_to_host" | "host_to_guest";
  rating: number;
  comment: string | null;
  created_at: string;
};

export function useHostReviewStats(userId: string | undefined) {
  return useQuery({
    queryKey: ["host-review-stats", userId],
    enabled: !!userId,
    staleTime: 5 * 60_000,
    queryFn: async () => {
      if (!userId) return { avg_rating: 0, review_count: 0 };
      const { data, error } = await supabase
        .from("activity_reviews")
        .select("rating")
        .eq("reviewee_id", userId)
        .eq("direction", "guest_to_host");
      if (error) throw error;
      const rows = (data ?? []) as { rating: number }[];
      if (rows.length === 0) return { avg_rating: 0, review_count: 0 };
      const avg = rows.reduce((s, r) => s + r.rating, 0) / rows.length;
      return { avg_rating: avg, review_count: rows.length };
    },
  });
}

export function useMyReviewForActivity(activityId: string | undefined, userId: string | undefined) {
  return useQuery({
    queryKey: ["my-review", activityId, userId],
    enabled: !!activityId && !!userId,
    queryFn: async (): Promise<Review | null> => {
      if (!activityId || !userId) return null;
      const { data, error } = await supabase
        .from("activity_reviews")
        .select("*")
        .eq("activity_id", activityId)
        .eq("reviewer_id", userId)
        .maybeSingle();
      if (error) throw error;
      return (data as Review | null) ?? null;
    },
  });
}

export function useSubmitReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      activity_id: string;
      reviewer_id: string;
      reviewee_id: string;
      direction: "guest_to_host" | "host_to_guest";
      rating: number;
      comment?: string;
    }) => {
      const { error } = await supabase.from("activity_reviews").insert(input);
      if (error) throw error;
    },
    onSuccess: (_, v) => {
      qc.invalidateQueries({ queryKey: ["my-review", v.activity_id] });
      qc.invalidateQueries({ queryKey: ["host-review-stats", v.reviewee_id] });
    },
  });
}

// ---------- Waitlist ----------

export function useAllRsvpsForActivity(activityId: string | undefined) {
  return useQuery({
    queryKey: ["rsvps-all", activityId],
    enabled: !!activityId,
    queryFn: async () => {
      if (!activityId) return [];
      const { data, error } = await supabase
        .from("rsvps")
        .select("id, user_id, status, created_at")
        .eq("activity_id", activityId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as { id: string; user_id: string; status: string; created_at: string }[];
    },
  });
}
