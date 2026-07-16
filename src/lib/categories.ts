export const CATEGORIES = [
  { id: "Dinner", label: "Dinner", icon: "🍷", tint: "#E85A3C", tintSoft: "#FCE7DE" },
  { id: "Adventure", label: "Adventure", icon: "🏔️", tint: "#3B7A57", tintSoft: "#E1EDE5" },
  { id: "Coworking", label: "Coworking", icon: "☕", tint: "#8A6B45", tintSoft: "#EFE6D5" },
  { id: "Wellness", label: "Wellness", icon: "🧘", tint: "#6B7FB8", tintSoft: "#E4E9F4" },
  { id: "Food", label: "Food crawl", icon: "🌮", tint: "#E8A93C", tintSoft: "#FBF0D6" },
  { id: "Nightlife", label: "Nightlife", icon: "✨", tint: "#7B5FB0", tintSoft: "#ECE5F5" },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]["id"];
