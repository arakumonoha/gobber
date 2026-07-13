import { createFileRoute, redirect } from "@tanstack/react-router";

// Redirect the public "/" root to the protected discover surface.
export const Route = createFileRoute("/")({
  beforeLoad: () => { throw redirect({ to: "/" as any, from: "/" as any, replace: true }); },
  component: () => null,
});
