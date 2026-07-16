import { motion, useMotionValue, animate, useTransform, PanInfo } from "framer-motion";
import { ReactNode, useEffect, useRef, useState } from "react";
import { Loader2, ChevronDown } from "lucide-react";

/**
 * Apple Maps-style draggable bottom sheet with snap points and optional pull-to-refresh.
 * Snap points are expressed as "distance from bottom of viewport" in px.
 */
interface Props {
  snapPoints: number[]; // e.g. [140, 380, 720] — peek, mid, full
  initialSnap?: number; // index
  children: ReactNode;
  onRefresh?: () => Promise<unknown> | void;
  className?: string;
  headerClassName?: string;
  onSnapChange?: (index: number) => void;
}

const SPRING = { type: "spring" as const, stiffness: 320, damping: 34, mass: 0.9 };

export function DraggableSheet({
  snapPoints,
  initialSnap = 0,
  children,
  onRefresh,
  className,
  headerClassName,
  onSnapChange,
}: Props) {
  const [vh, setVh] = useState(() => (typeof window !== "undefined" ? window.innerHeight : 800));
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia("(min-width: 1024px)").matches : false,
  );
  useEffect(() => {
    const onResize = () => setVh(window.innerHeight);
    const mq = window.matchMedia("(min-width: 1024px)");
    const onMq = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    window.addEventListener("resize", onResize);
    mq.addEventListener("change", onMq);
    return () => {
      window.removeEventListener("resize", onResize);
      mq.removeEventListener("change", onMq);
    };
  }, []);

  // sheet's "top" y position from viewport top
  const topFor = (idx: number) => vh - snapPoints[idx];
  const y = useMotionValue(topFor(initialSnap));
  const [snapIdx, setSnapIdx] = useState(initialSnap);
  const snapIndex = useRef(initialSnap);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const pullY = useMotionValue(0);
  const pullOpacity = useTransform(pullY, [0, 80], [0, 1]);
  const pullRotate = useTransform(pullY, [0, 120], [0, 360]);

  useEffect(() => {
    animate(y, topFor(snapIndex.current), SPRING);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vh]);

  function snapTo(idx: number) {
    const clamped = Math.max(0, Math.min(snapPoints.length - 1, idx));
    snapIndex.current = clamped;
    setSnapIdx(clamped);
    animate(y, topFor(clamped), SPRING);
    onSnapChange?.(clamped);
  }

  function handleDragEnd(_: unknown, info: PanInfo) {
    const currentTop = y.get();
    const velocity = info.velocity.y;
    // pick nearest snap, biased by velocity
    let bestIdx = snapIndex.current;
    let bestDist = Infinity;
    snapPoints.forEach((_p, i) => {
      const dist = Math.abs(topFor(i) - (currentTop + velocity * 0.15));
      if (dist < bestDist) {
        bestDist = dist;
        bestIdx = i;
      }
    });
    snapTo(bestIdx);
  }

  async function handlePullRefresh() {
    if (!onRefresh || refreshing) return;
    setRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setTimeout(() => setRefreshing(false), 400);
      animate(pullY, 0, { type: "spring", stiffness: 300, damping: 30 });
    }
  }

  // Only allow dragging the sheet body from the handle area or when scroll is at top
  const canDragSheet = useRef(true);
  function onContentScroll() {
    if (!scrollRef.current) return;
    canDragSheet.current = scrollRef.current.scrollTop <= 0;
  }

  function toggleDesktop() {
    // Toggle between the smallest (closed/peek) and the largest (open) snap.
    const target = snapIndex.current === snapPoints.length - 1 ? 0 : snapPoints.length - 1;
    snapTo(target);
  }

  const isExpanded = snapIdx === snapPoints.length - 1;

  return (
    <motion.div
      drag={isDesktop ? false : "y"}
      dragConstraints={{ top: topFor(snapPoints.length - 1), bottom: topFor(0) }}
      dragElastic={{ top: 0.02, bottom: 0.08 }}
      dragMomentum={false}
      onDragEnd={handleDragEnd}
      style={{ y, height: vh }}
      className={`absolute inset-x-0 top-0 z-20 rounded-t-3xl glass shadow-float ${isDesktop ? "" : "touch-none"} ${className ?? ""}`}
    >
      {/* Handle — drag grip on mobile/tablet, click-to-toggle on desktop */}
      {isDesktop ? (
        <button
          type="button"
          onClick={toggleDesktop}
          aria-label={isExpanded ? "Collapse gatherings" : "Expand gatherings"}
          aria-expanded={isExpanded}
          className={`group flex w-full flex-col items-center pt-2.5 pb-1 select-none ${headerClassName ?? ""}`}
        >
          <motion.div
            className="flex h-6 items-center justify-center rounded-full px-2 text-[#3d3120]/70 transition-colors group-hover:text-[#0f0d0b]"
            whileTap={{ scale: 0.92 }}
            animate={{ rotate: isExpanded ? 0 : 180 }}
            transition={SPRING}
          >
            <ChevronDown className="h-4 w-4" strokeWidth={2.4} />
          </motion.div>
        </button>
      ) : (
        <div className={`flex flex-col items-center pt-2.5 pb-1 select-none ${headerClassName ?? ""}`}>
          <motion.div
            className="h-1.5 w-10 rounded-full bg-foreground/40"
            whileTap={{ scaleX: 1.4, backgroundColor: "rgba(0,0,0,0.6)" }}
            transition={{ duration: 0.2 }}
          />
        </div>
      )}

      {/* Pull-to-refresh indicator */}
      {onRefresh && (
        <motion.div
          style={{ opacity: pullOpacity }}
          className="pointer-events-none absolute inset-x-0 top-8 flex justify-center"
        >
          <motion.div style={{ rotate: pullRotate }} className="rounded-full bg-white/70 p-1.5 shadow-glass backdrop-blur">
            <Loader2 className={`h-4 w-4 text-clay ${refreshing ? "animate-spin" : ""}`} />
          </motion.div>
        </motion.div>
      )}

      <div
        ref={scrollRef}
        onScroll={onContentScroll}
        onTouchStart={() => {
          if (scrollRef.current) canDragSheet.current = scrollRef.current.scrollTop <= 0;
        }}
        className="h-full overflow-y-auto overscroll-contain pb-40 touch-pan-y"
        onPointerMoveCapture={(e) => {
          // Pull-to-refresh gesture: only when at top and dragging down
          if (!onRefresh) return;
          const el = scrollRef.current;
          if (!el || el.scrollTop > 0) return;
          if (e.movementY > 0) {
            const next = Math.min(140, pullY.get() + e.movementY);
            pullY.set(next);
          }
        }}
        onPointerUpCapture={() => {
          if (!onRefresh) return;
          if (pullY.get() > 70) handlePullRefresh();
          else animate(pullY, 0, { type: "spring", stiffness: 300, damping: 30 });
        }}
      >
        {children}
      </div>
    </motion.div>
  );
}
