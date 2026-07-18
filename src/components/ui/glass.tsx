import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Shared Apple-glass primitives so pages stop re-declaring the same
 * `bg-white/55 backdrop-blur-2xl border border-white/40 shadow-[...]`
 * class strings. All three build on the `glass*` utilities in styles.css.
 */

type Density = "chip" | "card" | "panel";

const densityClass: Record<Density, string> = {
  chip: "glass-chip rounded-full",
  card: "glass rounded-3xl",
  panel: "glass-panel rounded-3xl",
};

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  density?: Density;
  as?: React.ElementType;
}

export const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, density = "card", as: Tag = "div", ...rest }, ref) => {
    const Comp = Tag as any;
    return (
      <Comp
        ref={ref}
        className={cn(densityClass[density], "text-foreground", className)}
        {...rest}
      />
    );
  }
);
GlassCard.displayName = "GlassCard";

export interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  tone?: "neutral" | "primary" | "ghost";
  size?: "sm" | "md" | "lg";
}

const toneClass: Record<NonNullable<GlassButtonProps["tone"]>, string> = {
  neutral: "glass-chip text-foreground hover:bg-white/80",
  primary: "bg-primary text-primary-foreground shadow-[0_12px_30px_-14px_theme(colors.primary.DEFAULT)] hover:brightness-105",
  ghost: "bg-white/40 text-foreground hover:bg-white/60 backdrop-blur-md border border-white/40",
};

const sizeClass: Record<NonNullable<GlassButtonProps["size"]>, string> = {
  sm: "h-8 px-3 text-[12.5px]",
  md: "h-10 px-4 text-[13.5px]",
  lg: "h-12 px-6 text-[15px]",
};

export const GlassButton = React.forwardRef<HTMLButtonElement, GlassButtonProps>(
  ({ className, tone = "neutral", size = "md", type = "button", ...rest }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full font-medium tracking-tight transition-[transform,background,box-shadow]",
        "duration-[var(--duration-base)] ease-[var(--ease-apple)]",
        "active:scale-[0.97] disabled:pointer-events-none disabled:opacity-60",
        toneClass[tone],
        sizeClass[size],
        className
      )}
      {...rest}
    />
  )
);
GlassButton.displayName = "GlassButton";

export interface SectionHeaderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  eyebrow?: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  align?: "left" | "center";
}

export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  align = "center",
  className,
  ...rest
}: SectionHeaderProps) {
  return (
    <div
      className={cn(align === "center" ? "text-center" : "text-left", className)}
      {...rest}
    >
      {eyebrow ? (
        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
          {eyebrow}
        </p>
      ) : null}
      <h2
        className={cn(
          "font-serif italic tracking-tight text-ink",
          "text-[2.2rem] leading-[1.05]",
          eyebrow ? "mt-2" : ""
        )}
      >
        {title}
      </h2>
      {subtitle ? (
        <p
          className={cn(
            "mt-2 text-[13.5px] text-muted-foreground",
            align === "center" ? "mx-auto max-w-[22rem]" : "max-w-[28rem]"
          )}
        >
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}
