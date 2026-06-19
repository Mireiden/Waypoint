// Category icons are stored as keys on the backend and rendered as emoji.
export const CATEGORY_ICONS: Record<string, string> = {
  gem: '💎', mountain: '⛰', utensils: '🍽', zap: '⚡', fish: '🎣',
  tree: '🌲', camera: '📷', coffee: '☕', map: '🗺', star: '⭐',
};

export const CATEGORY_ICON_KEYS = Object.keys(CATEGORY_ICONS);

export function categoryIcon(icon: string | null): string {
  return icon ? (CATEGORY_ICONS[icon] ?? '📍') : '📍';
}
