import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Mail, X } from "lucide-react";
import { AtmosphericGlobe } from "@/components/auth/atmospheric-globe";
import { AvatarCluster } from "@/components/auth/avatar-cluster";
import { PremiumButton } from "@/components/auth/premium-button";

export const Route = createFileRoute("/auth")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (data.user) throw redirect({ to: "/" });
  },
  head: () => ({
    meta: [
      { title: "Welcome — Gobber" },
      { name: "description", content: "Real-life gatherings, wherever you land." },
    ],
  }),
  component: AuthPage,
});

function AppleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M16.365 1.43c0 1.14-.44 2.23-1.17 3.03-.79.87-2.07 1.54-3.13 1.46-.13-1.11.42-2.28 1.13-3.02.79-.83 2.15-1.45 3.17-1.47zM20.5 17.02c-.55 1.26-.82 1.83-1.54 2.95-1 1.55-2.41 3.48-4.16 3.5-1.56.01-1.96-1.01-4.07-1-2.11.01-2.55 1.02-4.11 1.01-1.75-.02-3.09-1.76-4.09-3.3-2.8-4.31-3.09-9.37-1.36-12.06 1.22-1.91 3.15-3.03 4.97-3.03 1.84 0 3 1 4.52 1s2.45-1 4.58-1c1.62 0 3.33.88 4.55 2.4-3.99 2.19-3.34 7.9.71 9.53z" />
    </svg>
  );
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" />
    </svg>
  );
}

const EASE = [0.22, 1, 0.36, 1] as const;

function Headline() {
  return (
    <div className="mx-auto max-w-[520px] text-center">
      <motion.p
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.05, ease: EASE }}
        className="text-[10.5px] font-medium uppercase tracking-[0.32em] text-[#a08a68]"
      >
        Gobber
      </motion.p>

      <motion.h1
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.1, delay: 0.15, ease: EASE }}
        className="mt-4 font-serif text-[#0f0d0b]"
        style={{
          fontSize: "clamp(2.6rem, 8.4vw, 4.2rem)",
          lineHeight: 0.98,
          letterSpacing: "-0.034em",
          fontWeight: 400,
          fontFeatureSettings: '"kern" 1, "liga" 1',
        }}
      >
        <span className="block">
          Travel with
          <br />
          <span className="italic">strangers.</span>
        </span>
        <span
          className="mt-3 block italic"
          style={{ color: "#8a6b45", fontWeight: 400 }}
        >
          Meet as friends.
        </span>
      </motion.h1>
    </div>
  );
}

function Subtitle() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.9, delay: 0.5 }}
      className="mt-6 flex items-center justify-center gap-3"
    >
      <span className="h-px w-8 bg-[#d3bf9c]" />
      <p className="text-[13px] tracking-[-0.005em] text-[#8a7a5f]">
        Real-life gatherings, wherever you land.
      </p>
      <span className="h-px w-8 bg-[#d3bf9c]" />
    </motion.div>
  );
}

function AuthPage() {
  const navigate = useNavigate();
  const [showAuth, setShowAuth] = useState(false);
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState<null | "apple" | "google" | "email" | "form">(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading("form");
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { full_name: name || email.split("@")[0] },
          },
        });
        if (error) throw error;
        toast.success("Welcome to Gobber");
        navigate({ to: "/" });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/" });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(null);
    }
  }

  async function google() {
    setLoading("google");
    const res = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (res.error) { toast.error(res.error.message ?? "Google sign-in failed"); setLoading(null); return; }
    if (res.redirected) return;
    navigate({ to: "/" });
  }

  async function apple() {
    setLoading("apple");
    const res = await lovable.auth.signInWithOAuth("apple", { redirect_uri: window.location.origin });
    if (res.error) { toast.error(res.error.message ?? "Apple sign-in failed"); setLoading(null); return; }
    if (res.redirected) return;
    navigate({ to: "/" });
  }

  return (
    <div
      className="relative min-h-screen overflow-hidden"
      style={{
        background:
          "radial-gradient(1400px 900px at 50% -10%, #fdf7e8 0%, transparent 55%)," +
          "linear-gradient(180deg, #f6efdd 0%, #f0e6cd 100%)",
      }}
    >
      {/* Barely-there grain — adds tactile paper feel */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.18] mix-blend-multiply"
        style={{
          backgroundImage: "radial-gradient(rgba(139,111,74,0.05) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      <AtmosphericGlobe />

      <main className="relative mx-auto flex min-h-screen w-full max-w-[440px] flex-col px-6 pt-12 pb-10 sm:pt-16">
        <Headline />
        <Subtitle />

        {/* Avatar cluster — generous negative space around it */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, delay: 0.35, ease: EASE }}
          className="mt-10 flex flex-1 items-center justify-center sm:mt-14"
        >
          <AvatarCluster sizePx={380} />
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.75, ease: EASE }}
          className="relative z-10 mt-6 flex w-full flex-col gap-2.5"
        >
          <PremiumButton
            variant="dark"
            onClick={apple}
            disabled={!!loading}
            loading={loading === "apple"}
            icon={<AppleIcon className="h-[18px] w-[18px]" />}
          >
            Continue with Apple
          </PremiumButton>
          <PremiumButton
            variant="light"
            onClick={google}
            disabled={!!loading}
            loading={loading === "google"}
            icon={<GoogleIcon className="h-[18px] w-[18px]" />}
          >
            Continue with Google
          </PremiumButton>
          <PremiumButton
            variant="outline"
            onClick={() => setShowAuth(true)}
            disabled={!!loading}
            icon={<Mail className="h-[17px] w-[17px]" strokeWidth={2} />}
          >
            Continue with Email
          </PremiumButton>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.1 }}
            className="mt-3 text-center text-[11.5px] leading-relaxed tracking-[-0.005em] text-[#a08a68]"
          >
            By continuing you agree to Gobber's{" "}
            <span className="text-[#5a4a35] underline underline-offset-2 decoration-[#c9b696]">Terms</span>{" "}
            &{" "}
            <span className="text-[#5a4a35] underline underline-offset-2 decoration-[#c9b696]">Privacy</span>.
          </motion.p>
        </motion.div>
      </main>

      {/* Email sheet */}
      <AnimatePresence>
        {showAuth && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setShowAuth(false)}
              className="fixed inset-0 z-40 bg-[#1a1108]/25 backdrop-blur-md"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 34, stiffness: 340 }}
              className="fixed inset-x-0 bottom-0 z-50 mx-auto w-full max-w-[440px] rounded-t-[32px] p-6 pb-9 ring-1 ring-black/[0.05]"
              style={{
                background: "linear-gradient(180deg, rgba(255,253,247,0.98) 0%, rgba(251,244,227,0.98) 100%)",
                backdropFilter: "saturate(180%) blur(28px)",
                boxShadow: "0 -30px 80px -20px rgba(50,34,15,0.28)",
              }}
            >
              <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-[#1a1614]/15" />
              <div className="mb-5 flex items-start justify-between">
                <div>
                  <h2 className="font-serif italic text-[28px] leading-none tracking-[-0.024em] text-[#0f0d0b]">
                    {mode === "signin" ? "Welcome back." : "Create your account."}
                  </h2>
                  <p className="mt-2 text-[13px] text-[#9a8770]">
                    {mode === "signin" ? "Sign in to continue." : "Join Gobber — it takes a minute."}
                  </p>
                </div>
                <button
                  onClick={() => setShowAuth(false)}
                  className="rounded-full bg-black/[0.05] p-1.5 text-[#9a8770] transition hover:bg-black/[0.08] hover:text-[#1a1614]"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mb-4 flex rounded-full bg-black/[0.04] p-1 text-[12.5px] font-medium">
                {(["signin", "signup"] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className={`flex-1 rounded-full px-3 py-2 transition ${mode === m ? "bg-white text-[#1a1614] shadow-sm" : "text-[#9a8770]"}`}
                  >
                    {m === "signin" ? "Sign in" : "Create account"}
                  </button>
                ))}
              </div>

              <form onSubmit={submit} className="space-y-3">
                {mode === "signup" && (
                  <div>
                    <Label htmlFor="name" className="text-[11px] uppercase tracking-[0.14em] text-[#9a8770]">Name</Label>
                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Amelia" className="mt-1 h-12 rounded-2xl border-black/5 bg-white/80" />
                  </div>
                )}
                <div>
                  <Label htmlFor="email" className="text-[11px] uppercase tracking-[0.14em] text-[#9a8770]">Email</Label>
                  <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@gobber.app" className="mt-1 h-12 rounded-2xl border-black/5 bg-white/80" />
                </div>
                <div>
                  <Label htmlFor="password" className="text-[11px] uppercase tracking-[0.14em] text-[#9a8770]">Password</Label>
                  <Input id="password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="mt-1 h-12 rounded-2xl border-black/5 bg-white/80" />
                </div>
                <Button
                  type="submit"
                  disabled={loading === "form"}
                  className="mt-2 h-12 w-full rounded-full bg-[#141210] text-[15px] font-medium tracking-[-0.01em] text-white transition hover:bg-black active:scale-[0.99]"
                >
                  {loading === "form" ? <Loader2 className="h-4 w-4 animate-spin" /> : mode === "signin" ? "Sign in" : "Start exploring"}
                </Button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
