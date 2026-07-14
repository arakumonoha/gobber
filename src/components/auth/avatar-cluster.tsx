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
// center avatars slightly forward, surrounding avatars angled inward.
const AVATARS: AvatarSpec[] = [
  // back row — smaller, receding
  { src: owl,      x: -0.40, y: -0.20, size: 0.30, z: 2, rotate: -8, breathDuration: 5.6, breathDelay: 0.0, floatAmp: 3 },
  { src: cap,      x: -0.20, y: -0.28, size: 0.32, z: 3, rotate: -3, breathDuration: 6.4, breathDelay: 0.6, floatAmp: 4 },
  { src: hijab,    x:  0.06, y: -0.30, size: 0.34, z: 4, rotate:  1, breathDuration: 7.0, breathDelay: 0.3, floatAmp: 4 },
  { src: shark,    x:  0.32, y: -0.24, size: 0.32, z: 2, rotate:  6, breathDuration: 5.8, breathDelay: 1.0, floatAmp: 3 },
  { src: glasses,  x:  0.44, y: -0.06, size: 0.30, z: 2, rotate: 10, breathDuration: 6.2, breathDelay: 0.5, floatAmp: 3 },
  // front row — larger, forward
  { src: blue,     x: -0.34, y:  0.08, size: 0.34, z: 5, rotate: -4, breathDuration: 6.6, breathDelay: 0.9, floatAmp: 4 },
  { src: mustache, x: -0.10, y:  0.06, size: 0.38, z: 6, rotate: -1, breathDuration: 7.2, breathDelay: 0.2, floatAmp: 5 },
  { src: unicorn,  x:  0.14, y:  0.02, size: 0.42, z: 7, rotate:  2, breathDuration: 7.6, breathDelay: 0.4, floatAmp: 5 }, // center-forward
  { src: dog,      x:  0.36, y:  0.12, size: 0.34, z: 5, rotate:  6, breathDuration: 6.4, breathDelay: 1.2, floatAmp: 4 },
  { src: poop,     x:  0.04, y:  0.26, size: 0.28, z: 4, rotate: -2, breathDuration: 5.9, breathDelay: 0.7, floatAmp: 3 },
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
