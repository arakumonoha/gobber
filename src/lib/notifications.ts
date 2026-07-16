import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

export type NotificationType = "follow" | "mutual_follow" | "trip_suggestion" | "system";

export type NotificationRow = {
  id: string;
  user_id: string;
  actor_id: string | null;
  type: NotificationType | string;
  entity_type: string | null;
  entity_id: string | null;
  data: Record<string, unknown>;
  read_at: string | null;
  created_at: string;
  actor?: {
    id: string;
    username: string | null;
    display_name: string | null;
    avatar_url: string | null;
  } | null;
};

export function useNotifications(userId: string | undefined) {
  return useQuery({
    queryKey: ["notifications", userId],
    enabled: !!userId,
    staleTime: 15_000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId!)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      const rows = (data ?? []) as NotificationRow[];
      const actorIds = Array.from(new Set(rows.map((r) => r.actor_id).filter(Boolean))) as string[];
      if (actorIds.length) {
        const { data: profs } = await supabase
          .from("profiles")
          .select("id, username, display_name, avatar_url")
          .in("id", actorIds);
        const byId = new Map((profs ?? []).map((p: any) => [p.id, p]));
        rows.forEach((r) => {
          r.actor = r.actor_id ? (byId.get(r.actor_id) as any) ?? null : null;
        });
      }
      return rows;
    },
  });
}

export function useUnreadCount(userId: string | undefined) {
  return useQuery({
    queryKey: ["notifications", "unread", userId],
    enabled: !!userId,
    staleTime: 10_000,
    queryFn: async () => {
      const { count } = await supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId!)
        .is("read_at", null);
      return count ?? 0;
    },
  });
}

export function useMarkAllRead(userId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!userId) return;
      await supabase
        .from("notifications")
        .update({ read_at: new Date().toISOString() })
        .eq("user_id", userId)
        .is("read_at", null);
    },
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: ["notifications", "unread", userId] });
      qc.setQueryData(["notifications", "unread", userId], 0);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
      qc.invalidateQueries({ queryKey: ["notifications", "unread", userId] });
    },
  });
}

export function useMarkRead(userId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("id", id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
}

/** Subscribes to realtime inserts on the user's notifications and refreshes cache + fires a browser notification if permitted. */
export function useNotificationsRealtime(userId: string | undefined) {
  const qc = useQueryClient();
  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${userId}` },
        async (payload) => {
          qc.invalidateQueries({ queryKey: ["notifications"] });
          const n = payload.new as NotificationRow;
          try {
            if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
              let actorName = "Someone";
              if (n.actor_id) {
                const { data: p } = await supabase
                  .from("profiles")
                  .select("username, display_name")
                  .eq("id", n.actor_id)
                  .maybeSingle();
                actorName = (p?.display_name || (p?.username ? `@${p.username}` : "Someone")) as string;
              }
              const title = n.type === "mutual_follow" ? "You're now friends" : "New follower";
              const body =
                n.type === "mutual_follow"
                  ? `${actorName} follows you back on Gobber.`
                  : `${actorName} started following you on Gobber.`;
              new Notification(title, { body, icon: "/favicon.ico", tag: n.id });
            }
          } catch {
            /* ignore */
          }
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, qc]);
}

export async function requestBrowserPushPermission(): Promise<NotificationPermission | "unsupported"> {
  if (typeof window === "undefined" || !("Notification" in window)) return "unsupported";
  if (Notification.permission === "granted" || Notification.permission === "denied") return Notification.permission;
  return await Notification.requestPermission();
}

/* ---------------- Suggested (server-ranked) ---------------- */

export type SuggestedProfile = {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  home_city: string | null;
  mutual_count: number;
};

export function useRankedSuggestions(userId: string | undefined, limit = 12) {
  return useQuery({
    queryKey: ["profile", "suggested-ranked", userId, limit],
    enabled: !!userId,
    staleTime: 60_000,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("suggested_profiles", { _user_id: userId!, _limit: limit });
      if (error) throw error;
      return (data ?? []) as SuggestedProfile[];
    },
  });
}
