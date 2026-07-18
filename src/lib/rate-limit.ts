import { supabase } from "@/integrations/supabase/client";

/**
 * Sliding-window rate limit backed by a SECURITY DEFINER RPC.
 * Throws a user-friendly Error when the caller is over-limit so callers
 * can `toast.error(err.message)` without extra plumbing.
 */
export async function consumeRateLimit(
  bucket: string,
  limit: number,
  windowSeconds: number,
  friendly?: string,
): Promise<void> {
  const { data, error } = await supabase.rpc("consume_rate_limit", {
    _bucket: bucket,
    _limit: limit,
    _window: `${windowSeconds} seconds`,
  });
  if (error) throw error;
  if (data === false) {
    throw new Error(friendly ?? "You're doing that too often. Try again in a bit.");
  }
}

/** Named buckets so the numbers live in one place. */
export const RateLimit = {
  follow: () => consumeRateLimit("follow", 60, 60, "Slow down on follows — try again in a minute."),
  message: () => consumeRateLimit("message", 30, 60, "Slow down on messages — try again in a minute."),
  createActivity: () => consumeRateLimit("create_activity", 3, 60 * 60, "You can only host 3 gatherings per hour."),
  rsvp: () => consumeRateLimit("rsvp", 20, 60, "Too many RSVP changes — try again in a minute."),
  report: () => consumeRateLimit("report", 5, 60 * 60, "You've filed a lot of reports — try again later."),
};
