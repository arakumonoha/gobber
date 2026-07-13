export const CATEGORIES = [
  { id: "Dinner", label: "Dinner", icon: "🍷" },
  { id: "Adventure", label: "Adventure", icon: "🏔️" },
  { id: "Coworking", label: "Coworking", icon: "☕" },
  { id: "Wellness", label: "Wellness", icon: "🧘" },
  { id: "Food", label: "Food crawl", icon: "🌮" },
  { id: "Nightlife", label: "Nightlife", icon: "✨" },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]["id"];
