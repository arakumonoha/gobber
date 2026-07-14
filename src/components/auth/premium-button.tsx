import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

type Variant = "dark" | "light" | "outline";

export function PremiumButton({
  onClick,
  disabled,
  loading,
  variant = "light",
  icon,
  children,
}: {
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: Variant;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  const base =
    "relative inline-flex h-[52px] w-full items-center justify-center gap-2 rounded-full text-[15px] font-medium tracking-[-0.012em] transition-colors will-change-transform disabled:opacity-70";

  const styles: Record<Variant, React.CSSProperties> = {
    dark: {
      background: "linear-gradient(180deg, #1c1815 0%, #0a0908 100%)",
      color: "#fff",
      boxShadow:
        "0 1px 0 rgba(255,255,255,0.06) inset, 0 12px 30px -16px rgba(20,18,16,0.6), 0 2px 6px rgba(20,18,16,0.12)",
    },
    light: {
      background: "linear-gradient(180deg, #ffffff 0%, #fbf7ee 100%)",
      color: "#141210",
      boxShadow:
        "0 1px 0 rgba(255,255,255,0.9) inset, 0 8px 24px -14px rgba(60,42,20,0.28), 0 1px 2px rgba(60,42,20,0.06)",
    },
    outline: {
      background: "rgba(255,255,255,0.55)",
      color: "#141210",
      boxShadow:
        "inset 0 0 0 1px rgba(20,18,16,0.10), 0 6px 18px -12px rgba(60,42,20,0.18)",
      backdropFilter: "saturate(180%) blur(14px)",
      WebkitBackdropFilter: "saturate(180%) blur(14px)",
    },
  };

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled || loading}
      whileHover={{ y: -1.5 }}
      whileTap={{ scale: 0.975, y: 0 }}
      transition={{ type: "spring", stiffness: 420, damping: 28 }}
      className={base}
      style={styles[variant]}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <>
          {icon}
          <span>{children}</span>
        </>
      )}
    </motion.button>
  );
}
