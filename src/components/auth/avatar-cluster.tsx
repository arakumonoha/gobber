import { motion } from "framer-motion";
import { useMemo } from "react";
import m1 from "@/assets/memoji-1.png";
import m2 from "@/assets/memoji-2.png";
import m3 from "@/assets/memoji-3.png";
import m4 from "@/assets/memoji-4.png";
import m5 from "@/assets/memoji-5.png";
import m6 from "@/assets/memoji-6.png";

type AvatarSpec = {
  src: string;
  /** relative position from cluster center, in cluster-width units */
  x: number;
  y: number;
  /** size in cluster-width units (1 = full width) */
  size: number;
  /** stacking — center forward, edges recede */
  z: number;
  rotate: number;
  /** breathing rhythm per avatar so they never feel synced */
  breathDuration: number;
  breathDelay: number;
  floatAmp: number;
};

// Composition inspired by a close group photo — asymmetric, ~15–20% overlap,
// center avatar slightly forward, surrounding avatars angled inward.
const AVATARS: AvatarSpec[] = [
  { src: m2, x: -0.34, y: -0.02, size: 0.34, z: 2, rotate: -6, breathDuration: 5.6, breathDelay: 0.0, floatAmp: 3 },
  { src: m4, x: -0.14, y: -0.16, size: 0.38, z: 3, rotate: -2, breathDuration: 6.4, breathDelay: 0.6, floatAmp: 4 },
  { src: m1, x: 0.08, y: -0.24, size: 0.44, z: 5, rotate: 0,  breathDuration: 7.2, breathDelay: 0.2, floatAmp: 5 }, // center-forward
  { src: m5, x: 0.28, y: -0.12, size: 0.38, z: 3, rotate: 4,  breathDuration: 6.0, breathDelay: 1.1, floatAmp: 4 },
  { src: m3, x: 0.44, y: 0.04,  size: 0.34, z: 2, rotate: 8,  breathDuration: 5.8, breathDelay: 0.4, floatAmp: 3 },
  { src: m6, x: 0.02, y: 0.12,  size: 0.30, z: 4, rotate: -3, breathDuration: 6.8, breathDelay: 0.8, floatAmp: 3 },
];

/** Individual avatar — breathes, floats, tilts on its own rhythm. */
function Avatar({ spec, clusterPx }: { spec: AvatarSpec; clusterPx: number }) {
  const size = spec.size * clusterPx;
  const left = clusterPx / 2 + spec.x * clusterPx - size / 2;
  const top = clusterPx / 2 + spec.y * clusterPx - size / 2;

  // Softer shadow for edge avatars, richer for the center one
  const shadowIntensity = 0.14 + (spec.z / 8) * 0.14;

  return (
    <motion.div
      className="absolute"
      style={{
        left,
        top,
        width: size,
        height: size,
        zIndex: spec.z,
        transformOrigin: "50% 60%",
      }}
      initial={{ opacity: 0, y: 12, scale: 0.88 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.9,
        delay: 0.35 + spec.breathDelay * 0.08,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {/* Independent breathing + floating loop */}
      <motion.div
        className="h-full w-full"
        animate={{
          y: [0, -spec.floatAmp, 0, spec.floatAmp * 0.4, 0],
          rotate: [spec.rotate, spec.rotate + 1.2, spec.rotate - 0.6, spec.rotate],
          scale: [1, 1.012, 1, 0.996, 1],
        }}
        transition={{
          duration: spec.breathDuration,
          delay: spec.breathDelay,
          repeat: Infinity,
          ease: [0.45, 0, 0.55, 1],
        }}
      >
        {/* Ambient contact shadow — grounds the avatar into the scene */}
        <div
          className="absolute left-1/2 -translate-x-1/2 rounded-[50%]"
          style={{
            bottom: -size * 0.06,
            width: size * 0.72,
            height: size * 0.12,
            background: `radial-gradient(ellipse at center, rgba(78, 52, 22, ${shadowIntensity}) 0%, transparent 70%)`,
            filter: "blur(6px)",
          }}
        />
        <img
          src={spec.src}
          alt=""
          draggable={false}
          className="relative h-full w-full select-none object-contain"
          style={{
            filter: `drop-shadow(0 ${6 + spec.z}px ${12 + spec.z * 2}px rgba(78, 52, 22, ${0.14 + spec.z * 0.02}))`,
          }}
        />
      </motion.div>
    </motion.div>
  );
}

/**
 * Cluster of independently-animated avatars arranged like a close group photo.
 * Every avatar is its own component with its own animation rhythm.
 */
export function AvatarCluster({ sizePx = 340 }: { sizePx?: number }) {
  const avatars = useMemo(() => AVATARS, []);
  return (
    <div
      className="relative mx-auto"
      style={{ width: sizePx, height: sizePx * 0.88 }}
      aria-hidden
    >
      {/* Ambient scene light behind the group — integrates them into the background */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(60% 55% at 50% 55%, rgba(255, 236, 200, 0.55) 0%, transparent 70%)",
          filter: "blur(6px)",
        }}
      />
      {avatars.map((spec, i) => (
        <Avatar key={i} spec={spec} clusterPx={sizePx} />
      ))}
    </div>
  );
}
