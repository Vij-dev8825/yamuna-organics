const KEY = 'yo_recently_viewed';
const MAX_ITEMS = 8;

export function recordProductView(productId) {
  if (!productId) return;
  try {
    const existing = JSON.parse(localStorage.getItem(KEY)) || [];
    const next = [productId, ...existing.filter((id) => id !== productId)].slice(0, MAX_ITEMS);
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* localStorage unavailable — recently-viewed is a nice-to-have, skip silently */
  }
}

export function getRecentlyViewedIds() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || [];
  } catch {
    return [];
  }
}
