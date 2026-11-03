// Category icons are stored on the backend as the emoji character itself.
// Older categories may still hold a legacy key (e.g. "coffee"); CATEGORY_ICONS
// maps those to their emoji so existing data keeps rendering — no migration needed.
export const CATEGORY_ICONS: Record<string, string> = {
  gem: '💎',
  mountain: '⛰',
  utensils: '🍽',
  zap: '⚡',
  fish: '🎣',
  tree: '🌲',
  camera: '📷',
  coffee: '☕',
  map: '🗺',
  star: '⭐',
};

export const CATEGORY_ICON_KEYS = Object.keys(CATEGORY_ICONS);

/**
 * Resolve a stored icon value to an emoji.
 * - null/empty → default pin
 * - a legacy key → its mapped emoji
 * - anything else → returned as-is (it's already an emoji)
 */
export function categoryIcon(icon: string | null): string {
  if (!icon) return '📍';
  return CATEGORY_ICONS[icon] ?? icon;
}

// Curated emoji set offered in the admin picker. Admins can pick any of these;
// the chosen emoji is stored directly. Themed around places / travel / POIs.
// prettier-ignore
export const CATEGORY_EMOJIS: string[] = [
  // Landmarks & places
  '📍', '🗺', '🧭', '🏛', '🏰', '🏯', '🗽', '🗼', '⛩', '⛪', '🕌', '🛕',
  '🏟', '🎡', '🎠', '🎢', '🌉', '🌁', '🏖', '🏝', '🏜', '🏕', '🏞',
  // Nature & outdoors
  '⛰', '🏔', '🌋', '🗻', '🌲', '🌳', '🌴', '🌵', '🌿', '🍂', '🍁', '🌸',
  '🌊', '💧', '🔥', '❄', '☀', '🌙', '⭐', '✨', '🌅', '🌄', '🪨', '🦌', '🐾',
  // Food & drink
  '🍽', '🍴', '☕', '🍵', '🍺', '🍷', '🍸', '🍕', '🍔', '🌮', '🍣', '🍜', '🥐', '🍞', '🧁', '🍦', '🍫', '🥗', '🍇', '🍎', '🧀', '🍯',
  // Activities
  '🎣', '🥾', '🧗', '🚴', '🏊', '🏄', '⛷', '🏂', '🛶', '🚣', '🤿', '⛺',  '🎿', '🏌', '🎯', '🎳', '🎭', '🎨', '🎸', '🎶', '📷', '🎥', '🔭', '🎾',  '🎮', '🏋️‍♀️', '🐴', '🛹', '🏹', '🤿', '🎭', '🎪', '🎬', '🎤',  '⚽️', '🏀', '🎱', '🎁',
  // Getting there
  '🚗', '🚌', '🚂', '🚲', '⛵', '🛥', '✈', '🚁', '🚠', '🚡',
  // Symbols & misc
  '💎', '⚡', '🌟', '❤', '🏁', '🎉', '🛍', '🏨', '🛏', '💰', '🎓', '🏥',

];
