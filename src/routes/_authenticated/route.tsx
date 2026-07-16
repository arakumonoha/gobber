import { createFileRoute, Outlet, redirect, useRouterState } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { UsernameOnboarding } from "@/components/username-onboarding";
import { NotificationBell } from "@/components/notification-bell";
import { MessageBell } from "@/components/message-bell";


export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  component: AuthenticatedShell,
});

// Order of primary tabs — used to decide slide direction so navigation
// between adjacent tabs feels spatial (left/right) rather than random.
const TAB_ORDER = ["/discover", "/explore", "/host", "/trips", "/profile"];

function tabIndex(pathname: string) {
  const match = TAB_ORDER.findIndex((p) => pathname === p || pathname.startsWith(p + "/"));
  return match === -1 ? 0 : match;
}

function AuthenticatedShell() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  // Key by top-level segment so nested routes (e.g. /activity/$id) don't
  // re-mount on every param change but tab switches do animate.
  const segment = "/" + (pathname.split("/")[1] ?? "");
  const idx = tabIndex(segment);

  return (
    <>
      <AnimatePresence mode="sync" initial={false} custom={idx}>
        <motion.div
          key={segment}
          custom={idx}
          initial={{ opacity: 0, y: 8, filter: "blur(8px)", scale: 0.995 }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)", scale: 1 }}
          exit={{ opacity: 0, y: -6, filter: "blur(8px)", scale: 0.995 }}
          transition={{
            duration: 0.42,
            ease: [0.22, 1, 0.36, 1],
            filter: { duration: 0.3 },
          }}
          style={{ minHeight: "100dvh", willChange: "opacity, transform, filter" }}
        >
          <Outlet />
        </motion.div>
      </AnimatePresence>
      <NotificationBell />
      <MessageBell />

      <UsernameOnboarding />
    </>
  );
}
