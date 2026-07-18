// The ArcGIS 3D globe was removed as unused/heavy decoration. This stub
// keeps the lazy import site working; it renders a subtle gradient placeholder.
export function ArcgisGlobe(_props: { basemap?: string; spin?: boolean; className?: string }) {
  return (
    <div
      className={_props.className}
      aria-hidden
      style={{
        background:
          "radial-gradient(circle at 30% 30%, rgba(255,220,180,0.35), rgba(30,22,12,0.85) 70%)",
      }}
    />
  );
}
