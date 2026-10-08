/** Category `icon` keys (stored in Firestore) → Icon component names. Unknown keys fall back to "wrench". */
export const CATEGORY_ICON_OPTIONS = [
  'droplet',
  'zap',
  'sparkles',
  'scissors',
  'washer',
  'snowflake',
  'hammer',
  'paintbrush',
  'book',
  'bug',
  'home',
  'laptop',
  'wrench',
];

export const categoryIcon = (key) => (CATEGORY_ICON_OPTIONS.includes(key) ? key : 'wrench');
