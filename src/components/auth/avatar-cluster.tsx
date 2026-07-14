import { motion } from "framer-motion";
import { useMemo, type ReactNode } from "react";
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

// Ordered around the ring for pleasing visual rhythm — alternating
// human faces and creatures, warm/cool tones spaced evenly.
const RING = [
  mustache,
  owl,
  hijab,
  shark,
  glasses,
  dog,
  poop,
  unicorn,
  blue,
  cap,
];

type OrbitSpec = {
  src: string;
  /** angle in degrees, 0 = top, clockwise */
  angle: number;
  /** slight radius variance to feel organic without breaking symmetry */
  radiusScale: number;
  /** small size variance — subtle only */
  sizeScale: number;
  breathDuration: number;
  breathDelay: number;
  floatAmp: number;
};

function buildOrbits(): OrbitSpec[] {
  const n = RING.length;
  return RING.map((src, i) => {
    // Even angular distribution, offset so no avatar sits dead-top
    const angle = (360 / n) * i - 90 + 18;
    // Alternate radius by ±3% — Apple-style near-symmetric variance
    const radiusScale = i % 2 === 0 ? 1.0 : 0.97;
    const sizeScale = i % 2 === 0 ? 1.0 : 0.94;
    return {
      src,
      angle,
      radiusScale,
      sizeScale,
      breathDuration: 5.6 + (i % 4) * 0.4,
      breathDelay: (i * 0.17) % 1.4,
      floatAmp: 2.5 + (i % 3),
    };
  });
}

function Orbiter({
  spec,
  clusterPx,
  radiusPx,
  avatarPx,
}: {
  spec: OrbitSpec;
  clusterPx: number;
  radiusPx: number;
  avatarPx: number;
}) {
  const size = avatarPx * spec.sizeScale;
  const r = radiusPx * spec.radiusScale;
  const rad = (spec.angle * Math.PI) / 180;
  const cx = clusterPx / 2 + Math.cos(rad) * r;
  const cy = clusterPx / 2 + Math.sin(rad) * r;

  // Tilt each avatar slightly toward the center for a group-photo feel
  const inwardTilt = -Math.cos(rad + Math.PI / 2) * 6;

  return (
    <motion.div
      className="absolute"
      style={{
        left: cx - size / 2,
        top: cy - size / 2,
        width: size,
        height: size,
        transformOrigin: "50% 60%",
      }}
      initial={{ opacity: 0, scale: 0.7 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: 0.8,
        delay: 0.25 + spec.breathDelay * 0.1,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <motion.div
        className="h-full w-full"
        animate={{
          y: [0, -spec.floatAmp, 0, spec.floatAmp * 0.4, 0],
          rotate: [inwardTilt, inwardTilt + 1.2, inwardTilt - 0.6, inwardTilt],
          scale: [1, 1.015, 1, 0.995, 1],
        }}
        transition={{
          duration: spec.breathDuration,
          delay: spec.breathDelay,
          repeat: Infinity,
          ease: [0.45, 0, 0.55, 1],
        }}
      >
        {/* contact shadow */}
        <div
          className="absolute left-1/2 -translate-x-1/2 rounded-[50%]"
          style={{
            bottom: -size * 0.05,
            width: size * 0.7,
            height: size * 0.11,
            background:
              "radial-gradient(ellipse at center, rgba(78, 52, 22, 0.22) 0%, transparent 70%)",
            filter: "blur(5px)",
          }}
        />
        <img
          src={spec.src}
          alt=""
          draggable={false}
          className="relative h-full w-full select-none object-contain"
          style={{
            filter:
              "drop-shadow(0 8px 16px rgba(78, 52, 22, 0.18)) drop-shadow(0 2px 4px rgba(78, 52, 22, 0.12))",
          }}
        />
      </motion.div>
    </motion.div>
  );
}

/**
 * Symmetric ring of independently-animated avatars orbiting a center slot.
 * Pass `centerSlot` (e.g. a logo) to render at the middle.
 */
export function AvatarCluster({
  sizePx = 360,
  centerSlot,
}: {
  sizePx?: number;
  centerSlot?: ReactNode;
}) {
  const orbits = useMemo(buildOrbits, []);
  // Ring geometry — avatars sit on a circle at ~38% of cluster width
  const radiusPx = sizePx * 0.36;
  const avatarPx = sizePx * 0.22;
  const centerPx = sizePx * 0.28;

  return (
    <div
      className="relative mx-auto"
      style={{ width: sizePx, height: sizePx }}
    >
      {/* Ambient scene light behind the group */}
      <div
        className="absolute inset-0 -z-10"
        aria-hidden
        style={{
          background:
            "radial-gradient(58% 58% at 50% 50%, rgba(255, 236, 200, 0.55) 0%, transparent 72%)",
          filter: "blur(8px)",
        }}
      />

      {orbits.map((spec, i) => (
        <Orbiter
          key={i}
          spec={spec}
          clusterPx={sizePx}
          radiusPx={radiusPx}
          avatarPx={avatarPx}
        />
      ))}

      {/* Center slot — logo goes here */}
      <motion.div
        className="absolute left-1/2 top-1/2 flex items-center justify-center"
        style={{
          width: centerPx,
          height: centerPx,
          marginLeft: -centerPx / 2,
          marginTop: -centerPx / 2,
        }}
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
      >
        {centerSlot ?? (
          <div
            className="h-full w-full rounded-full"
            style={{
              background:
                "radial-gradient(circle at 35% 30%, #ffffff 0%, #f4ece0 55%, #e7dcc9 100%)",
              boxShadow:
                "0 10px 30px -8px rgba(78, 52, 22, 0.28), inset 0 1px 0 rgba(255,255,255,0.9)",
            }}
          />
        )}
      </motion.div>
    </div>
  );
}
