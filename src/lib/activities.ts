import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Activity = {
  id: string;
  host_id: string;
  title: string;
  description: string;
  category: string;
  cover_url: string | null;
  city: string;
  country: string;
  lat: number;
  lng: number;
  starts_at: string;
  max_spots: number;
  created_at: string;
};

export const activitiesQuery = () => ({
  queryKey: ["activities"],
  queryFn: async (): Promise<Activity[]> => {
    const { data, error } = await supabase
      .from("activities")
      .select("*")
      .order("starts_at", { ascending: true });
    if (error) throw error;
    return data as Activity[];
  },
});

export function useActivities() {
  return useQuery(activitiesQuery());
}

export function activityQuery(id: string) {
  return {
    queryKey: ["activity", id],
    queryFn: async (): Promise<Activity | null> => {
      const { data, error } = await supabase.from("activities").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      return data as Activity | null;
    },
  };
}

export type RsvpRow = { id: string; activity_id: string; user_id: string; status: string };

export function useRsvpsForActivity(activityId: string | undefined) {
  return useQuery({
    queryKey: ["rsvps", activityId],
    queryFn: async (): Promise<RsvpRow[]> => {
      if (!activityId) return [];
      const { data, error } = await supabase.from("rsvps").select("*").eq("activity_id", activityId).eq("status", "going");
      if (error) throw error;
      return data as RsvpRow[];
    },
    enabled: !!activityId,
  });
}

export function useMyRsvps(userId: string | undefined) {
  return useQuery({
    queryKey: ["my-rsvps", userId],
    queryFn: async (): Promise<RsvpRow[]> => {
      if (!userId) return [];
      const { data, error } = await supabase.from("rsvps").select("*").eq("user_id", userId).eq("status", "going");
      if (error) throw error;
      return data as RsvpRow[];
    },
    enabled: !!userId,
  });
}
