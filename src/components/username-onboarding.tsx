import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AtSign, Check, Loader2, Sparkles } from "lucide-react";
import { useUser } from "@/hooks/use-user";
import { useMyProfile, isProvisionalUsername, checkUsernameAvailable, setMyUsername } from "@/lib/follows";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export function UsernameOnboarding() {
  const { user } = useUser();
  const qc = useQueryClient();
  const { data: profile, isLoading } = useMyProfile(user?.id);
  const [value, setValue] = useState("");
  const [status, setStatus] = useState<"idle" | "checking" | "ok" | "bad">("idle");
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);

  const needsOnboarding = !isLoading && !!profile && isProvisionalUsername(profile.username);

  useEffect(() => {
    if (needsOnboarding && !value && profile?.display_name) {
      const seed = profile.display_name.toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, 18);
      if (seed.length >= 3) setValue(seed);
    }
  }, [needsOnboarding, profile?.display_name, value]);

  useEffect(() => {
    if (!value) { setStatus("idle"); setReason(""); return; }
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(value)) { setStatus("bad"); setReason("3–20 letters, numbers or _"); return; }
    setStatus("checking");
    const t = setTimeout(async () => {
      const res = await checkUsernameAvailable(value, user?.id);
      setStatus(res.ok ? "ok" : "bad");
      setReason(res.reason);
    }, 350);
    return () => clearTimeout(t);
  }, [value, user?.id]);

  async function submit() {
    if (!user || status !== "ok") return;
    setSaving(true);
    try {
      await setMyUsername(user.id, value);
      await qc.invalidateQueries({ queryKey: ["profile"] });
      toast.success(`Welcome, @${value}`);
    } catch (e: any) {
      toast.error(e.message ?? "Could not save username");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AnimatePresence>
      {needsOnboarding && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center px-5"
          style={{ background: "rgba(28,20,10,0.42)", backdropFilter: "blur(20px) saturate(160%)", WebkitBackdropFilter: "blur(20px) saturate(160%)" }}
        >
          <motion.div
            initial={{ scale: 0.94, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 26 }}
            className="w-full max-w-sm rounded-[28px] p-7 ring-1 ring-black/[0.06]"
            style={{
              background: "linear-gradient(180deg, rgba(255,255,255,0.96) 0%, rgba(253,246,232,0.92) 100%)",
              backdropFilter: "saturate(180%) blur(24px)",
              WebkitBackdropFilter: "saturate(180%) blur(24px)",
              boxShadow: "0 30px 80px -20px rgba(50,34,15,0.35), inset 0 1px 0 rgba(255,255,255,0.9)",
            }}
          >
            <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.18em] text-[#8b6f45]">
              <Sparkles className="h-3.5 w-3.5" /> One more step
            </div>
            <h2 className="mt-2 text-[26px] font-semibold leading-tight tracking-tight text-[#1a1614]">Pick a username</h2>
            <p className="mt-1.5 text-[13.5px] leading-relaxed text-[#6b5842]">Friends will find and follow you with this handle.</p>

            <div className="mt-5">
              <div className="flex items-center gap-2 rounded-2xl bg-white/70 px-3.5 py-3 ring-1 ring-black/[0.06] focus-within:ring-black/20 transition">
                <AtSign className="h-4 w-4 text-[#9a8770]" />
                <input
                  autoFocus
                  value={value}
                  onChange={(e) => setValue(e.target.value.replace(/[^a-zA-Z0-9_]/g, "").toLowerCase())}
                  placeholder="yourhandle"
                  maxLength={20}
                  className="flex-1 bg-transparent text-[15px] font-medium text-[#1a1614] placeholder:text-[#c2ae90] focus:outline-none"
                />
                {status === "checking" && <Loader2 className="h-4 w-4 animate-spin text-[#9a8770]" />}
                {status === "ok" && <Check className="h-4 w-4 text-emerald-600" />}
              </div>
              <p className={`mt-2 min-h-[16px] text-[12px] ${status === "bad" ? "text-red-600" : "text-[#8b7659]"}`}>
                {status === "bad" ? reason : status === "ok" ? "Available" : "3–20 letters, numbers or _"}
              </p>
            </div>

            <Button onClick={submit} disabled={status !== "ok" || saving} className="mt-4 h-12 w-full rounded-2xl bg-[#1a1614] text-white hover:bg-[#2a201a]">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Claim username"}
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
