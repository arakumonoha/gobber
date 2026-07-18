// Live-signals helpers — the decorative widgets were removed; these are
// safe, minimal replacements so the landing page still renders.

export function twemojiUrl(emoji: string): string {
  const codepoints = Array.from(emoji)
    .map((c) => c.codePointAt(0)?.toString(16))
    .filter(Boolean)
    .join("-");
  return `https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/${codepoints}.svg`;
}

export function JoinsTicker(_props: { joins: unknown[] }) {
  return null;
}

export function TrendingStrip(_props: { trending: unknown; fallbackFlags: string[] }) {
  return null;
}
