import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { toast } from "sonner";
import { Loader2, ArrowRight, X } from "lucide-react";

export const Route = createFileRoute("/auth")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (data.user) throw redirect({ to: "/" });
  },
  head: () => ({
    meta: [
      { title: "Sign in — Gobber" },
      { name: "description", content: "Sign in to Gobber." },
    ],
  }),
  component: AuthPage,
});

const EASE = [0.22, 1, 0.36, 1] as const;

/** iCloud-style animated cloud mark — clean, minimal, breathing softly. */
function CloudMark() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 1.1, ease: EASE }}
      className="relative mx-auto"
      style={{ width: 128, height: 128 }}
      aria-hidden
    >
      {/* Soft warm halo behind the cloud */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background:
            "radial-gradient(closest-side, rgba(255,232,190,0.55) 0%, rgba(255,232,190,0) 70%)",
          filter: "blur(6px)",
        }}
        animate={{ scale: [1, 1.06, 1], opacity: [0.85, 1, 0.85] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: [0.45, 0, 0.55, 1] }}
      />
      <motion.svg
        viewBox="0 0 128 128"
        className="relative h-full w-full"
        animate={{ y: [0, -3, 0, 2, 0] }}
        transition={{ duration: 6.2, repeat: Infinity, ease: [0.45, 0, 0.55, 1] }}
      >
        <defs>
          <linearGradient id="cloud-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#fbf3e2" />
          </linearGradient>
          <linearGradient id="cloud-stroke" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#a08a68" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#8a6b45" stopOpacity="0.7" />
          </linearGradient>
        </defs>
        {/* Classic rounded cloud silhouette */}
        <path
          d="M40 88c-11 0-20-8.6-20-19.5S29 49 40 49c1.1 0 2.2.1 3.3.3C46 38.6 55.8 31 67 31c13.2 0 24 10.4 24 23.2 0 .8 0 1.6-.1 2.4 1.3-.3 2.7-.5 4.1-.5 9.9 0 18 7.8 18 17.4S105 91 95.1 91H40z"
          fill="url(#cloud-fill)"
          stroke="url(#cloud-stroke)"
          strokeWidth="1.5"
          style={{
            filter:
              "drop-shadow(0 12px 24px rgba(78,52,22,0.18)) drop-shadow(0 2px 4px rgba(78,52,22,0.08))",
          }}
        />
        {/* Inner highlight */}
        <path
          d="M46 58c4-8 12-14 22-14"
          fill="none"
          stroke="#ffffff"
          strokeOpacity="0.9"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </motion.svg>
    </motion.div>
  );
}

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

/** iCloud-style single-line input with inline chevron submit. */
function InlineField({
  type,
  placeholder,
  value,
  onChange,
  autoFocus,
  onSubmit,
  submitting,
  showSubmit,
  autoComplete,
}: {
  type: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  autoFocus?: boolean;
  onSubmit?: () => void;
  submitting?: boolean;
  showSubmit?: boolean;
  autoComplete?: string;
}) {
  return (
    <div className="relative">
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        autoComplete={autoComplete}
        onKeyDown={(e) => {
          if (e.key === "Enter" && onSubmit) {
            e.preventDefault();
            onSubmit();
          }
        }}
        className="h-[46px] w-full rounded-[10px] border border-[#1a1614]/12 bg-white/85 px-4 pr-12 text-[15px] tracking-[-0.01em] text-[#0f0d0b] placeholder:text-[#a89676] outline-none transition focus:border-[#8a6b45]/50 focus:bg-white"
      />
      {showSubmit && (
        <motion.button
          type="button"
          onClick={onSubmit}
          disabled={submitting || !value}
          whileTap={{ scale: 0.92 }}
          className="absolute right-1.5 top-1/2 flex h-[36px] w-[36px] -translate-y-1/2 items-center justify-center rounded-full bg-[#0f0d0b] text-white transition disabled:opacity-30"
          aria-label="Continue"
        >
          {submitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ArrowRight className="h-4 w-4" strokeWidth={2.4} />
          )}
        </motion.button>
      )}
    </div>
  );
}

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [step, setStep] = useState<"email" | "password">("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState<null | "apple" | "google" | "form">(null);

  async function handleEmailContinue() {
    if (!email) return;
    setStep("password");
  }

  async function submit() {
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
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-5 py-10"
      style={{
        background:
          "radial-gradient(1200px 800px at 50% -10%, #fdf7e8 0%, transparent 55%)," +
          "linear-gradient(180deg, #f6efdd 0%, #f0e6cd 100%)",
      }}
    >
      {/* subtle grain */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.14] mix-blend-multiply"
        style={{
          backgroundImage: "radial-gradient(rgba(139,111,74,0.05) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      {/* iCloud-style centered card */}
      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.9, ease: EASE }}
        className="relative z-10 w-full max-w-[420px] overflow-hidden rounded-[28px]"
        style={{
          background: "rgba(255,253,247,0.72)",
          backdropFilter: "saturate(180%) blur(30px)",
          WebkitBackdropFilter: "saturate(180%) blur(30px)",
          border: "1px solid rgba(255,255,255,0.7)",
          boxShadow:
            "0 1px 0 rgba(255,255,255,0.9) inset, 0 30px 70px -25px rgba(60,42,20,0.28), 0 8px 24px -14px rgba(60,42,20,0.14)",
        }}
      >
        <div className="px-8 pt-9 pb-8 text-center">
          <CloudMark />

          <motion.h1
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: EASE }}
            className="mt-5 text-[26px] font-semibold tracking-[-0.028em] text-[#0f0d0b]"
            style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif' }}
          >
            Sign In to Gobber
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.28 }}
            className="mt-1.5 text-[13.5px] tracking-[-0.005em] text-[#8a7a5f]"
          >
            {mode === "signin"
              ? "Use your account to continue."
              : "Create an account to get started."}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4, ease: EASE }}
            className="mt-7 space-y-2.5 text-left"
          >
            <AnimatePresence mode="wait" initial={false}>
              {step === "email" ? (
                <motion.div
                  key="email"
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.35, ease: EASE }}
                  className="space-y-2.5"
                >
                  {mode === "signup" && (
                    <InlineField
                      type="text"
                      placeholder="Name"
                      value={name}
                      onChange={setName}
                      autoComplete="name"
                    />
                  )}
                  <InlineField
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={setEmail}
                    autoFocus
                    autoComplete="email"
                    showSubmit
                    onSubmit={handleEmailContinue}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="password"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 12 }}
                  transition={{ duration: 0.35, ease: EASE }}
                  className="space-y-2"
                >
                  <div className="flex items-center justify-between px-1 text-[12.5px] text-[#8a7a5f]">
                    <span className="truncate">{email}</span>
                    <button
                      onClick={() => setStep("email")}
                      className="text-[#8a6b45] hover:underline"
                    >
                      Change
                    </button>
                  </div>
                  <InlineField
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={setPassword}
                    autoFocus
                    autoComplete={mode === "signin" ? "current-password" : "new-password"}
                    showSubmit
                    submitting={loading === "form"}
                    onSubmit={submit}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-center justify-between px-1 pt-1.5 text-[12.5px]">
              <label className="flex items-center gap-2 text-[#8a7a5f]">
                <input
                  type="checkbox"
                  defaultChecked
                  className="h-3.5 w-3.5 rounded-[3px] border border-[#1a1614]/25 accent-[#0f0d0b]"
                />
                Keep me signed in
              </label>
              <button className="text-[#8a6b45] hover:underline">Forgot?</button>
            </div>
          </motion.div>

          {/* Divider */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.55 }}
            className="mt-7 flex items-center gap-3"
          >
            <span className="h-px flex-1 bg-[#1a1614]/10" />
            <span className="text-[10.5px] font-medium uppercase tracking-[0.22em] text-[#a08a68]">
              or
            </span>
            <span className="h-px flex-1 bg-[#1a1614]/10" />
          </motion.div>

          {/* Social — quiet iCloud-style icon row */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.65, ease: EASE }}
            className="mt-5 flex items-center justify-center gap-3"
          >
            <SocialButton onClick={apple} loading={loading === "apple"} disabled={!!loading} label="Continue with Apple">
              <AppleIcon className="h-[19px] w-[19px] text-[#0f0d0b]" />
            </SocialButton>
            <SocialButton onClick={google} loading={loading === "google"} disabled={!!loading} label="Continue with Google">
              <GoogleIcon className="h-[19px] w-[19px]" />
            </SocialButton>
          </motion.div>

          {/* Create account switch */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.8 }}
            className="mt-7 text-[13px] text-[#8a7a5f]"
          >
            {mode === "signin" ? (
              <>
                Don't have an account?{" "}
                <button
                  onClick={() => { setMode("signup"); setStep("email"); }}
                  className="font-medium text-[#8a6b45] hover:underline"
                >
                  Create yours now
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  onClick={() => { setMode("signin"); setStep("email"); }}
                  className="font-medium text-[#8a6b45] hover:underline"
                >
                  Sign in
                </button>
              </>
            )}
          </motion.div>
        </div>

        {/* Footer strip */}
        <div className="border-t border-[#1a1614]/8 bg-white/40 px-8 py-3 text-center text-[11px] tracking-[-0.005em] text-[#a08a68]">
          Manage your account · <span className="text-[#8a6b45] hover:underline cursor-pointer">Privacy</span> · <span className="text-[#8a6b45] hover:underline cursor-pointer">Terms</span>
        </div>
      </motion.div>
    </div>
  );
}

function SocialButton({
  children,
  onClick,
  loading,
  disabled,
  label,
}: {
  children: React.ReactNode;
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
  label: string;
}) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: "spring", stiffness: 420, damping: 26 }}
      aria-label={label}
      className="flex h-[46px] w-[64px] items-center justify-center rounded-[12px] border border-[#1a1614]/10 bg-white/80 transition hover:bg-white disabled:opacity-60"
      style={{
        boxShadow:
          "0 1px 0 rgba(255,255,255,0.9) inset, 0 6px 16px -12px rgba(60,42,20,0.2)",
      }}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin text-[#0f0d0b]" /> : children}
    </motion.button>
  );
}
