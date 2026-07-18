import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { RateLimit } from "./rate-limit";

export type ProfileLite = {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  home_city: string | null;
};

// A username is "provisional" (auto-generated on signup) if it matches user_xxxxxxxxxx (10 hex chars).
export function isProvisionalUsername(username: string | null | undefined) {
  return !!username && /^user_[a-f0-9]{6,12}$/i.test(username);
}

export function useMyProfile(userId: string | undefined) {
  return useQuery({
    queryKey: ["profile", "me", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, display_name, avatar_url, home_city, bio")
        .eq("id", userId!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

export function useProfileByUsername(username: string | undefined) {
  return useQuery({
    queryKey: ["profile", "by-username", username?.toLowerCase()],
    enabled: !!username && username.length >= 3,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, display_name, avatar_url, home_city")
        .ilike("username", username!)
        .maybeSingle();
      if (error) throw error;
      return data as ProfileLite | null;
    },
  });
}

export function useSearchProfiles(query: string) {
  return useQuery({
    queryKey: ["profile", "search", query.toLowerCase()],
    enabled: query.trim().length >= 2,
    queryFn: async () => {
      const q = query.trim().replace(/[%_]/g, "");
      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, display_name, avatar_url, home_city")
        .or(`username.ilike.${q}%,display_name.ilike.%${q}%`)
        .limit(12);
      if (error) throw error;
      return (data ?? []) as ProfileLite[];
    },
  });
}

export function useFollowCounts(userId: string | undefined) {
  return useQuery({
    queryKey: ["follows", "counts", userId],
    enabled: !!userId,
    queryFn: async () => {
      const [followers, following] = await Promise.all([
        supabase.from("follows").select("*", { count: "exact", head: true }).eq("following_id", userId!),
        supabase.from("follows").select("*", { count: "exact", head: true }).eq("follower_id", userId!),
      ]);
      return { followers: followers.count ?? 0, following: following.count ?? 0 };
    },
  });
}

export function useFollowingList(userId: string | undefined) {
  return useQuery({
    queryKey: ["follows", "following", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("follows")
        .select("following_id, profile:profiles!follows_following_id_fkey(id, username, display_name, avatar_url, home_city)")
        .eq("follower_id", userId!);
      if (error) {
        // fallback if fk name differs — fetch ids then profiles
        const { data: rows } = await supabase.from("follows").select("following_id").eq("follower_id", userId!);
        const ids = (rows ?? []).map((r) => r.following_id);
        if (ids.length === 0) return [];
        const { data: profs } = await supabase.from("profiles").select("id, username, display_name, avatar_url, home_city").in("id", ids);
        return (profs ?? []) as ProfileLite[];
      }
      return (data ?? []).map((r: any) => r.profile).filter(Boolean) as ProfileLite[];
    },
  });
}

export function useFollowersList(userId: string | undefined) {
  return useQuery({
    queryKey: ["follows", "followers", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data: rows } = await supabase.from("follows").select("follower_id").eq("following_id", userId!);
      const ids = (rows ?? []).map((r) => r.follower_id);
      if (ids.length === 0) return [];
      const { data: profs } = await supabase.from("profiles").select("id, username, display_name, avatar_url, home_city").in("id", ids);
      return (profs ?? []) as ProfileLite[];
    },
  });
}

export function useIsFollowing(followerId: string | undefined, followingId: string | undefined) {
  return useQuery({
    queryKey: ["follows", "is", followerId, followingId],
    enabled: !!followerId && !!followingId && followerId !== followingId,
    queryFn: async () => {
      const { data } = await supabase
        .from("follows")
        .select("id")
        .eq("follower_id", followerId!)
        .eq("following_id", followingId!)
        .maybeSingle();
      return !!data;
    },
  });
}

// Does `otherId` follow `myId`? Used for "Follows you" pills.
export function useFollowsMe(myId: string | undefined, otherId: string | undefined) {
  return useQuery({
    queryKey: ["follows", "followsMe", myId, otherId],
    enabled: !!myId && !!otherId && myId !== otherId,
    queryFn: async () => {
      const { data } = await supabase
        .from("follows")
        .select("id")
        .eq("follower_id", otherId!)
        .eq("following_id", myId!)
        .maybeSingle();
      return !!data;
    },
  });
}

// Suggested profiles: people I don't follow yet (excluding me).
export function useSuggestedProfiles(myId: string | undefined, limit = 8) {
  return useQuery({
    queryKey: ["profile", "suggested", myId, limit],
    enabled: !!myId,
    staleTime: 60_000,
    queryFn: async () => {
      const { data: myFollows } = await supabase
        .from("follows")
        .select("following_id")
        .eq("follower_id", myId!);
      const excludeIds = new Set<string>([myId!, ...(myFollows ?? []).map((r) => r.following_id)]);
      const { data } = await supabase
        .from("profiles")
        .select("id, username, display_name, avatar_url, home_city")
        .order("created_at", { ascending: false })
        .limit(limit + excludeIds.size);
      return ((data ?? []) as ProfileLite[]).filter((p) => !excludeIds.has(p.id)).slice(0, limit);
    },
  });
}

export function useFollowMutation(myId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ targetId, follow }: { targetId: string; follow: boolean }) => {
      if (!myId) throw new Error("Not signed in");
      if (follow) {
        await RateLimit.follow();
        const { error } = await supabase.from("follows").insert({ follower_id: myId, following_id: targetId });
        if (error && !error.message.includes("duplicate")) throw error;
      } else {
        const { error } = await supabase.from("follows").delete().eq("follower_id", myId).eq("following_id", targetId);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["follows"] });
    },
  });
}

/* ---------------- Blocks ---------------- */

export function useIsBlocked(myId: string | undefined, otherId: string | undefined) {
  return useQuery({
    queryKey: ["blocks", "is", myId, otherId],
    enabled: !!myId && !!otherId && myId !== otherId,
    queryFn: async () => {
      const { data } = await supabase
        .from("blocks")
        .select("id")
        .eq("blocker_id", myId!)
        .eq("blocked_id", otherId!)
        .maybeSingle();
      return !!data;
    },
  });
}

export function useBlockedByMe(myId: string | undefined) {
  return useQuery({
    queryKey: ["blocks", "list", myId],
    enabled: !!myId,
    queryFn: async () => {
      const { data: rows } = await supabase.from("blocks").select("blocked_id").eq("blocker_id", myId!);
      const ids = (rows ?? []).map((r) => r.blocked_id);
      if (ids.length === 0) return [];
      const { data: profs } = await supabase
        .from("profiles")
        .select("id, username, display_name, avatar_url, home_city")
        .in("id", ids);
      return (profs ?? []) as ProfileLite[];
    },
  });
}

export function useBlockMutation(myId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ targetId, block }: { targetId: string; block: boolean }) => {
      if (!myId) throw new Error("Not signed in");
      if (block) {
        const { error } = await supabase.from("blocks").insert({ blocker_id: myId, blocked_id: targetId });
        if (error && !error.message.includes("duplicate")) throw error;
      } else {
        const { error } = await supabase.from("blocks").delete().eq("blocker_id", myId).eq("blocked_id", targetId);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["blocks"] });
      qc.invalidateQueries({ queryKey: ["follows"] });
    },
  });
}

export async function checkUsernameAvailable(username: string, currentUserId?: string) {
  const clean = username.trim();
  if (!/^[a-zA-Z0-9_]{3,20}$/.test(clean)) return { ok: false, reason: "3–20 letters, numbers or _" };
  let q = supabase.from("profiles").select("id").ilike("username", clean);
  if (currentUserId) q = q.neq("id", currentUserId);
  const { data, error } = await q.maybeSingle();
  if (error) return { ok: false, reason: error.message };
  return { ok: !data, reason: data ? "That username is taken" : "" };
}

export async function setMyUsername(userId: string, username: string) {
  const { error } = await supabase.from("profiles").update({ username: username.trim() }).eq("id", userId);
  if (error) throw error;
}
