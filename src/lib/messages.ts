import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export type ConversationType = "dm" | "location";

export type ConversationRow = {
  id: string;
  type: ConversationType;
  activity_id: string | null;
  created_by: string;
  title: string | null;
  expires_at: string | null;
  last_message_at: string;
  created_at: string;
};

export type MemberRow = {
  id: string;
  conversation_id: string;
  user_id: string;
  role: "owner" | "member";
  joined_at: string;
  profile?: { username: string | null; display_name: string | null; avatar_url: string | null } | null;
};

export type MessageRow = {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  created_at: string;
};

export type ConversationSummary = ConversationRow & {
  members: MemberRow[];
  last_body: string | null;
  unread: number;
};

// -------- Conversations list --------
export function useConversations(userId?: string) {
  return useQuery({
    queryKey: ["conversations", userId],
    enabled: !!userId,
    queryFn: async (): Promise<ConversationSummary[]> => {
      const { data: mine, error } = await supabase
        .from("conversation_members")
        .select("conversation_id, last_read_at")
        .eq("user_id", userId!);
      if (error) throw error;
      const ids = (mine ?? []).map((m) => m.conversation_id);
      if (ids.length === 0) return [];
      const readMap = new Map((mine ?? []).map((m) => [m.conversation_id, m.last_read_at as string]));

      const { data: convs } = await supabase
        .from("conversations")
        .select("*")
        .in("id", ids)
        .order("last_message_at", { ascending: false });

      const { data: rawMembers } = await supabase
        .from("conversation_members")
        .select("id, conversation_id, user_id, role, joined_at")
        .in("conversation_id", ids);
      const memberUserIds = Array.from(new Set((rawMembers ?? []).map((m) => m.user_id)));
      const { data: memberProfiles } = memberUserIds.length
        ? await supabase.from("profiles").select("id, username, display_name, avatar_url").in("id", memberUserIds)
        : { data: [] as { id: string; username: string | null; display_name: string | null; avatar_url: string | null }[] };
      const profileMap = new Map((memberProfiles ?? []).map((p) => [p.id, p]));
      const members: MemberRow[] = (rawMembers ?? []).map((m) => ({
        ...(m as Omit<MemberRow, "profile">),
        role: m.role as "owner" | "member",
        profile: profileMap.get(m.user_id) ?? null,
      }));


      const { data: lastMsgs } = await supabase
        .from("messages")
        .select("conversation_id, body, created_at, sender_id")
        .in("conversation_id", ids)
        .order("created_at", { ascending: false });

      const bodyByConv = new Map<string, string>();
      const unreadByConv = new Map<string, number>();
      for (const m of lastMsgs ?? []) {
        if (!bodyByConv.has(m.conversation_id)) bodyByConv.set(m.conversation_id, m.body);
        const lr = readMap.get(m.conversation_id);
        if (m.sender_id !== userId && (!lr || new Date(m.created_at) > new Date(lr))) {
          unreadByConv.set(m.conversation_id, (unreadByConv.get(m.conversation_id) ?? 0) + 1);
        }
      }

      const membersByConv = new Map<string, MemberRow[]>();
      for (const m of members) {
        const arr = membersByConv.get(m.conversation_id) ?? [];
        arr.push(m);
        membersByConv.set(m.conversation_id, arr);
      }


      return (convs ?? []).map((c) => ({
        ...(c as ConversationRow),
        members: membersByConv.get(c.id) ?? [],
        last_body: bodyByConv.get(c.id) ?? null,
        unread: unreadByConv.get(c.id) ?? 0,
      }));
    },
    staleTime: 10_000,
  });
}

export function useUnreadMessagesTotal(userId?: string) {
  const { data = [] } = useConversations(userId);
  return data.reduce((sum, c) => sum + c.unread, 0);
}

// -------- Messages in a conversation --------
export function useMessages(conversationId?: string) {
  return useQuery({
    queryKey: ["messages", conversationId],
    enabled: !!conversationId,
    queryFn: async (): Promise<MessageRow[]> => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId!)
        .order("created_at", { ascending: true })
        .limit(200);
      if (error) throw error;
      return (data ?? []) as MessageRow[];
    },
  });
}

export function useSendMessage(conversationId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: string) => {
      const trimmed = body.trim();
      if (!trimmed) return;
      const { data: userRes } = await supabase.auth.getUser();
      const uid = userRes.user?.id;
      if (!uid || !conversationId) return;
      const { error } = await supabase.from("messages").insert({ conversation_id: conversationId, sender_id: uid, body: trimmed });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["messages", conversationId] });
      qc.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}

export function useMarkConvRead(conversationId?: string, userId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!conversationId || !userId) return;
      await supabase
        .from("conversation_members")
        .update({ last_read_at: new Date().toISOString() })
        .eq("conversation_id", conversationId)
        .eq("user_id", userId);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["conversations"] }),
  });
}

// -------- Realtime messages for the current user --------
export function useMessagesRealtime(userId?: string, activeConversationId?: string) {
  const qc = useQueryClient();
  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel(`msgs-${userId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, (payload) => {
        const row = payload.new as MessageRow;
        qc.invalidateQueries({ queryKey: ["conversations"] });
        if (activeConversationId && row.conversation_id === activeConversationId) {
          qc.invalidateQueries({ queryKey: ["messages", activeConversationId] });
        }
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, activeConversationId, qc]);
}

// -------- Start / manage --------
export function useStartDM() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (otherUserId: string) => {
      const { data, error } = await supabase.rpc("start_dm", { _other: otherUserId });
      if (error) throw error;
      return data as string;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["conversations"] }),
  });
}

export function useLeaveConv() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ conversationId, userId }: { conversationId: string; userId: string }) => {
      const { error } = await supabase
        .from("conversation_members")
        .delete()
        .eq("conversation_id", conversationId)
        .eq("user_id", userId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["conversations"] }),
  });
}

export function useRemoveMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ conversationId, userId }: { conversationId: string; userId: string }) => {
      const { error } = await supabase
        .from("conversation_members")
        .delete()
        .eq("conversation_id", conversationId)
        .eq("user_id", userId);
      if (error) throw error;
    },
    onSuccess: (_r, v) => {
      qc.invalidateQueries({ queryKey: ["conversations"] });
      qc.invalidateQueries({ queryKey: ["members", v.conversationId] });
    },
  });
}

// -------- Mutual followers for DM picker --------
export function useMutualFollowers(userId?: string) {
  return useQuery({
    queryKey: ["mutual-followers", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data: following } = await supabase.from("follows").select("following_id").eq("follower_id", userId!);
      const { data: followers } = await supabase.from("follows").select("follower_id").eq("following_id", userId!);
      const setA = new Set((following ?? []).map((r) => r.following_id));
      const mutuals = (followers ?? []).map((r) => r.follower_id).filter((id) => setA.has(id));
      if (mutuals.length === 0) return [];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, username, display_name, avatar_url")
        .in("id", mutuals);
      return profiles ?? [];
    },
  });
}
