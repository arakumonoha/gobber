import { motion } from "framer-motion";
import { useMemo } from "react";
import owl from "@/assets/avatars/owl.png";
import cap from "@/assets/avatars/cap.png";
import hijab from "@/assets/avatars/hijab.png";
import shark from "@/assets/avatars/shark.png";
import blue from "@/assets/avatars/blue.png";
import poop from "@/assets/avatars/poop.png";
import unicorn from "@/assets/avatars/unicorn.png";
import dog from "@/assets/avatars/dog.png";
import glasses from "@/assets/avatars/glasses.png";
import mustache from "@/assets/avatars/mustache.png";

type Spec = {
  src: string;
  /** center position in 0..1 of container (both axes) */
  cx: number;
  cy: number;
  /** size as fraction of container width */
  size: number;
  rotate: number;
  breathDuration: number;
  breathDelay: number;
  floatAmp: number;
};

// Hand-composed constellation — varying sizes, balanced weight, no clipping.
// All (cx ± size/2, cy ± size/2) stay comfortably inside [0.02, 0.98].
const SPECS: Spec[] = [
  // Anchors — the three largest, forming a loose triangle
  { src: unicorn,  cx: 0.30, cy: 0.42, size: 0.30, rotate: -4, breathDuration: 7.4, breathDelay: 0.1, floatAmp: 5 },
  { src: mustache, cx: 0.70, cy: 0.32, size: 0.28, rotate:  3, breathDuration: 6.8, breathDelay: 0.6, floatAmp: 4 },
  { src: dog,      cx: 0.62, cy: 0.72, size: 0.26, rotate: -2, breathDuration: 7.0, breathDelay: 0.3, floatAmp: 4 },

  // Mid-size supporting cast
  { src: hijab,    cx: 0.20, cy: 0.14, size: 0.20, rotate: -6, breathDuration: 6.2, breathDelay: 0.9, floatAmp: 3 },
  { src: glasses,  cx: 0.86, cy: 0.62, size: 0.20, rotate:  6, breathDuration: 6.4, breathDelay: 0.4, floatAmp: 3 },
  { src: blue,     cx: 0.14, cy: 0.72, size: 0.22, rotate: -3, breathDuration: 6.6, breathDelay: 1.1, floatAmp: 4 },

  // Small accents — negative-space fillers
  { src: owl,      cx: 0.48, cy: 0.10, size: 0.15, rotate: -8, breathDuration: 5.6, breathDelay: 0.2, floatAmp: 3 },
  { src: shark,    cx: 0.88, cy: 0.14, size: 0.16, rotate:  8, breathDuration: 5.8, breathDelay: 0.7, floatAmp: 3 },
  { src: cap,      cx: 0.42, cy: 0.88, size: 0.16, rotate:  4, breathDuration: 5.9, breathDelay: 1.3, floatAmp: 3 },
  { src: poop,     cx: 0.06, cy: 0.40, size: 0.14, rotate: -5, breathDuration: 5.5, breathDelay: 0.5, floatAmp: 2 },
];

function AvatarItem({ spec, box }: { spec: Spec; box: number }) {
  const size = spec.size * box;
  const left = spec.cx * box - size / 2;
  const top = spec.cy * box - size / 2;

  // Larger avatars sit forward
  const z = Math.round(spec.size * 100);
  const shadowStrength = 0.14 + spec.size * 0.35;

  return (
    <motion.div
      className="absolute"
      style={{ left, top, width: size, height: size, zIndex: z, transformOrigin: "50% 60%" }}
      initial={{ opacity: 0, y: 14, scale: 0.82 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.9,
        delay: 0.2 + spec.breathDelay * 0.08,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <motion.div
        className="h-full w-full"
        animate={{
          y: [0, -spec.floatAmp, 0, spec.floatAmp * 0.4, 0],
          rotate: [spec.rotate, spec.rotate + 1.4, spec.rotate - 0.6, spec.rotate],
          scale: [1, 1.015, 1, 0.995, 1],
        }}
        transition={{
          duration: spec.breathDuration,
          delay: spec.breathDelay,
          repeat: Infinity,
          ease: [0.45, 0, 0.55, 1],
        }}
      >
        <div
          className="absolute left-1/2 -translate-x-1/2 rounded-[50%]"
          style={{
            bottom: -size * 0.05,
            width: size * 0.7,
            height: size * 0.11,
            background: `radial-gradient(ellipse at center, rgba(78, 52, 22, ${shadowStrength}) 0%, transparent 70%)`,
            filter: "blur(6px)",
          }}
        />
        <img
          src={spec.src}
          alt=""
          draggable={false}
          className="relative h-full w-full select-none object-contain"
          style={{
            filter: `drop-shadow(0 ${8 + spec.size * 20}px ${14 + spec.size * 30}px rgba(78, 52, 22, ${0.16 + spec.size * 0.3}))`,
          }}
        />
      </motion.div>
    </motion.div>
  );
}

/**
 * Constellation of independently-animated avatars — varying sizes,
 * generous negative space, no clipping, no center placeholder.
 */
export function AvatarCluster({ sizePx = 360 }: { sizePx?: number }) {
  const specs = useMemo(() => SPECS, []);
  return (
    <div
      className="relative mx-auto"
      style={{ width: sizePx, height: sizePx }}
      aria-hidden
    >
      {/* Ambient scene light behind the group */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(55% 55% at 50% 50%, rgba(255, 236, 200, 0.5) 0%, transparent 72%)",
          filter: "blur(10px)",
        }}
      />
      {specs.map((s, i) => (
        <AvatarItem key={i} spec={s} box={sizePx} />
      ))}
    </div>
  );
}
