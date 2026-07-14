import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Mail, X, ChevronRight } from "lucide-react";
import memojiGroup from "@/assets/memoji-group.png";

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

/** Soft glowing globe horizon at the bottom — matches the reference exactly. */
function GlobeHorizon() {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[62vh] overflow-hidden">
      {/* Globe curvature */}
      <div
        className="absolute left-1/2 -translate-x-1/2"
        style={{
          bottom: "-58vh",
          width: "180vw",
          height: "115vh",
          borderRadius: "50%",
          background:
            "radial-gradient(ellipse at 50% 30%, #f7ecd4 0%, #efdfbe 30%, #e6d1a3 55%, #d9bd88 78%, #c9a76a 100%)",
          boxShadow:
            "inset 0 40px 80px rgba(255, 240, 210, 0.55), inset 0 -60px 120px rgba(120, 82, 40, 0.25)",
        }}
      />
      {/* Faint continent silhouettes */}
      <div
        className="absolute inset-x-0 bottom-0 h-[62vh] opacity-[0.22] mix-blend-multiply"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 45% 12% at 30% 78%, #7a5a30 0%, transparent 60%), radial-gradient(ellipse 40% 10% at 68% 82%, #7a5a30 0%, transparent 60%), radial-gradient(ellipse 30% 8% at 50% 92%, #6b4d26 0%, transparent 60%)",
        }}
      />
      {/* City lights sparkle */}
      <svg className="absolute inset-0 h-full w-full opacity-70" aria-hidden>
        {Array.from({ length: 60 }).map((_, i) => {
          const x = (i * 37) % 100;
          const y = 55 + ((i * 53) % 42);
          const r = ((i * 7) % 20) / 20 < 0.5 ? 0.8 : 1.4;
          return (
            <circle
              key={i}
              cx={`${x}%`}
              cy={`${y}%`}
              r={r}
              fill="#fff4d6"
              style={{ filter: "drop-shadow(0 0 3px rgba(255, 220, 150, 0.9))" }}
            />
          );
        })}
      </svg>
      {/* Horizon glow */}
      <div
        className="absolute inset-x-0"
        style={{
          bottom: "45vh",
          height: "18vh",
          background:
            "linear-gradient(to bottom, transparent, rgba(255, 240, 210, 0.55), transparent)",
          filter: "blur(20px)",
        }}
      />
    </div>
  );
}

function AuthPage() {
  const navigate = useNavigate();
  const [showAuth, setShowAuth] = useState(false);
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
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
      setLoading(false);
    }
  }

  async function google() {
    setLoading(true);
    const res = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (res.error) { toast.error(res.error.message ?? "Google sign-in failed"); setLoading(false); return; }
    if (res.redirected) return;
    navigate({ to: "/" });
  }

  async function apple() {
    setLoading(true);
    const res = await lovable.auth.signInWithOAuth("apple", { redirect_uri: window.location.origin });
    if (res.error) { toast.error(res.error.message ?? "Apple sign-in failed"); setLoading(false); return; }
    if (res.redirected) return;
    navigate({ to: "/" });
  }

  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: "#f4ecd9" }}>
      {/* Cream wash */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(1200px 900px at 50% -5%, #fbf4e3 0%, transparent 55%), linear-gradient(180deg, #f4ecd9 0%, #eee0c2 100%)",
        }}
      />

      <GlobeHorizon />

      {/* Subtle grain */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.25] mix-blend-multiply"
        style={{
          backgroundImage: "radial-gradient(rgba(139,111,74,0.06) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
        }}
      />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-md flex-col px-6 pt-14 pb-8">
        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="text-center font-serif"
          style={{
            fontSize: "clamp(3rem, 12.5vw, 4.6rem)",
            lineHeight: 0.95,
            letterSpacing: "-0.035em",
            fontWeight: 400,
          }}
        >
          <span className="italic" style={{ color: "#0f0d0b" }}>Travel with</span>
          <br />
          <span className="italic" style={{ color: "#0f0d0b" }}>strangers.</span>
          <br />
          <span className="italic" style={{ color: "#7a5a3c", display: "inline-block", marginTop: "0.14em" }}>
            Meet as friends.
          </span>
        </motion.h1>

        {/* Divider + subtitle */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.9, delay: 0.35 }}
          className="mt-6 flex items-center justify-center gap-3"
        >
          <span className="h-px w-6 bg-[#c9b696]" />
          <p className="text-[13.5px] text-[#8f7c5f] tracking-[-0.005em]">
            Real-life gatherings, wherever you land.
          </p>
          <span className="h-px w-6 bg-[#c9b696]" />
        </motion.div>

        {/* Memoji bundle — exact match from reference */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="mt-6 flex flex-1 items-center justify-center"
        >
          <motion.img
            src={memojiGroup}
            alt="Group of friends"
            draggable={false}
            className="w-[78%] max-w-[360px] select-none"
            style={{
              filter: "drop-shadow(0 22px 40px rgba(90, 60, 25, 0.22)) drop-shadow(0 6px 14px rgba(90, 60, 25, 0.14))",
            }}
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 6.5, repeat: Infinity, ease: [0.45, 0, 0.55, 1] }}
          />
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 mt-4 flex w-full flex-col items-center gap-2.5"
        >
          <PressButton
            onClick={apple}
            disabled={loading}
            className="bg-[#141210] text-white shadow-[0_18px_40px_-18px_rgba(20,18,16,0.7)] hover:bg-black"
          >
            <AppleIcon className="mr-2 h-[19px] w-[19px]" />
            Continue with Apple
          </PressButton>
          <PressButton
            onClick={google}
            disabled={loading}
            className="bg-white text-[#1a1614] shadow-[0_12px_30px_-16px_rgba(0,0,0,0.28)] hover:bg-white"
          >
            <GoogleIcon className="mr-2 h-[19px] w-[19px]" />
            Continue with Google
          </PressButton>
          <PressButton
            onClick={() => setShowAuth(true)}
            disabled={loading}
            className="bg-white text-[#1a1614] shadow-[0_12px_30px_-16px_rgba(0,0,0,0.24)] hover:bg-white"
          >
            <Mail className="mr-2 h-[18px] w-[18px]" />
            Continue with Email
          </PressButton>

          <motion.button
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => { setMode("signin"); setShowAuth(true); }}
            className="mt-3 inline-flex items-center gap-1 text-[13px] text-[#9a8770] transition-colors"
          >
            Already have an account?{" "}
            <span className="font-semibold text-[#1a1614]">Sign in</span>
            <ChevronRight className="h-3.5 w-3.5 text-[#1a1614]" />
          </motion.button>
        </motion.div>
      </div>

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
              className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 32, stiffness: 320 }}
              className="fixed inset-x-0 bottom-0 z-50 mx-auto w-full max-w-md rounded-t-[28px] bg-white/95 p-6 pb-9 shadow-[0_-20px_60px_-20px_rgba(45,30,20,0.4)] backdrop-blur-2xl ring-1 ring-black/[0.05]"
            >
              <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-black/20" />
              <div className="mb-5 flex items-start justify-between">
                <div>
                  <h2 className="font-serif italic text-3xl leading-none tracking-[-0.02em] text-[#1a1614]">
                    {mode === "signin" ? "Welcome back" : "Create your account"}
                  </h2>
                  <p className="mt-2 text-[13px] text-[#9a8770]">
                    {mode === "signin" ? "Sign in to continue." : "Join Gobber — it takes a minute."}
                  </p>
                </div>
                <button
                  onClick={() => setShowAuth(false)}
                  className="rounded-full bg-black/5 p-1.5 text-[#9a8770] transition hover:text-[#1a1614]"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mb-4 flex rounded-full bg-black/[0.04] p-1 text-xs font-medium">
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
                    <Label htmlFor="name" className="text-xs">Your name</Label>
                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Amelia" className="mt-1 h-11 rounded-xl bg-white" />
                  </div>
                )}
                <div>
                  <Label htmlFor="email" className="text-xs">Email</Label>
                  <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@gobber.app" className="mt-1 h-11 rounded-xl bg-white" />
                </div>
                <div>
                  <Label htmlFor="password" className="text-xs">Password</Label>
                  <Input id="password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="mt-1 h-11 rounded-xl bg-white" />
                </div>
                <Button type="submit" disabled={loading} className="h-11 w-full rounded-xl bg-[#141210] text-white font-medium transition hover:bg-black active:scale-[0.99]">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : mode === "signin" ? "Sign in" : "Start exploring"}
                </Button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function PressButton({
  onClick, disabled, className, children,
}: {
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.975 }}
      transition={{ type: "spring", stiffness: 400, damping: 26 }}
      className={`inline-flex h-[54px] w-full items-center justify-center rounded-full text-[15.5px] font-medium tracking-[-0.01em] disabled:opacity-70 ${className ?? ""}`}
    >
      {disabled ? <Loader2 className="h-4 w-4 animate-spin" /> : children}
    </motion.button>
  );
}
